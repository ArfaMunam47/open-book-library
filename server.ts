import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, slugify } from './server/db.js';
import {
  generateToken,
  verifyToken,
  verifyAdminPassword,
  requireAdminAuth
} from './server/auth.js';
import { extractPdfInfo } from './server/pdf-helper.js';
import { analyzeBook, generateBookDescription } from './server/book-analyzer.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Enable CORS for all origins, supporting credentials and custom headers
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'Range', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Content-Disposition']
}));

// Ensure uploads folder structure exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
const pdfsDir = path.join(uploadsDir, 'pdfs');
const coversDir = path.join(uploadsDir, 'covers');
if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

// Helper to sanitize filenames safely across all operating systems
function sanitizeFilename(originalName: string, fallbackPrefix: string, forcedExt: string): string {
  const ext = (path.extname(originalName).toLowerCase() || forcedExt).trim();
  const rawBase = path.basename(originalName, ext);
  // Normalize Unicode accents and strip dangerous or non-ASCII characters
  const cleanBase = rawBase
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
  const safeBase = cleanBase.length > 0 ? cleanBase : fallbackPrefix;
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return `${safeBase}_${uniqueSuffix}${ext}`;
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'pdf') {
      cb(null, pdfsDir);
    } else if (file.fieldname === 'cover') {
      cb(null, coversDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const isPdf = file.fieldname === 'pdf';
    if (isPdf) {
      cb(null, sanitizeFilename(file.originalname, 'book_document', '.pdf'));
    } else {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
      const uniqueCover = `cover_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${safeExt}`;
      cb(null, uniqueCover);
    }
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for large book PDFs
  },
  fileFilter: (req, file, cb) => {
    // Graceful validation without terminating the stream prematurely
    if (file.fieldname === 'pdf') {
      const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');
      const isPdfMime = file.mimetype.includes('pdf') || file.mimetype === 'application/octet-stream';
      if (isPdfExt || isPdfMime) {
        cb(null, true);
      } else {
        (req as any).pdfValidationError = 'Selected file is not a valid PDF.';
        cb(null, false);
      }
    } else if (file.fieldname === 'cover') {
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      const isImgMime = file.mimetype.startsWith('image/');
      if (allowedExts.includes(ext) || isImgMime) {
        cb(null, true);
      } else {
        (req as any).coverValidationError = 'Cover must be an image (JPG, PNG, or WebP).';
        cb(null, false);
      }
    } else {
      cb(null, true);
    }
  }
});

// Middleware
app.use(express.json());

// Disable caching for all API responses so database mutations reflect immediately everywhere
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Intercept and re-hydrate missing uploads from persistent Cloud Firestore chunks if container restarted
app.get('/uploads/covers/:filename', async (req: Request, res: Response, next: NextFunction) => {
  const localFile = path.join(coversDir, req.params.filename);
  if (fs.existsSync(localFile)) {
    return next();
  }
  const allBooks = db.getBooks();
  const book = allBooks.find(b => b.cover_url?.includes(req.params.filename) || b.cover_path?.includes(req.params.filename));
  if (book) {
    const buffer = await db.getCoverBuffer(book.id);
    if (buffer) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Type', req.params.filename.endsWith('.png') ? 'image/png' : 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      return res.send(buffer);
    }
  }
  next();
});

app.get('/uploads/pdfs/:filename', async (req: Request, res: Response, next: NextFunction) => {
  const localFile = path.join(pdfsDir, req.params.filename);
  if (fs.existsSync(localFile)) {
    return next();
  }
  const allBooks = db.getBooks();
  const book = allBooks.find(b => b.pdf_url?.includes(req.params.filename) || b.pdf_path?.includes(req.params.filename));
  if (book) {
    const buffer = await db.getPdfBuffer(book.id);
    if (buffer) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Length', String(buffer.length));
      return res.send(buffer);
    }
  }
  next();
});

// Serve static uploads with cross-origin headers to prevent iframe subresource blocking
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }
  }
}));

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  if (!verifyAdminPassword(password)) {
    res.status(401).json({ error: 'Invalid administrator password' });
    return;
  }

  const token = generateToken('admin');
  res.json({
    success: true,
    token,
    message: 'Administrator authenticated successfully'
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  if (token && verifyToken(token)) {
    res.json({ authenticated: true, role: 'admin' });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// 2. CATEGORIES ENDPOINTS
// ==========================================

// Public: Get all categories
app.get('/api/categories', (req: Request, res: Response) => {
  try {
    const categories = db.getCategories();
    // Add book count to each category
    const allPublishedBooks = db.getBooks({ publishedOnly: true });
    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      book_count: allPublishedBooks.filter(b => b.category_id === cat.id).length
    }));
    res.json(categoriesWithCount);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

// Admin: Create category
app.post('/api/admin/categories', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }
    const newCategory = await db.createCategory(name, description);
    res.status(201).json(newCategory);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create category' });
  }
});

// Admin: Update category
app.put('/api/admin/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }
    const updated = await db.updateCategory(id, name, description || '');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update category' });
  }
});

// Admin: Delete category
app.delete('/api/admin/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.deleteCategory(id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete category' });
  }
});

// ==========================================
// 3. BOOKS ENDPOINTS (PUBLIC)
// ==========================================

// Public: List published books with filtering and sorting
app.get('/api/books', (req: Request, res: Response) => {
  try {
    const { category, search, sort } = req.query;
    const books = db.getBooks({
      publishedOnly: true,
      categoryId: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      sort: (sort as any) || 'newest'
    });
    res.json(books);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch books' });
  }
});

// Public: Get book by ID
app.get('/api/books/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = db.getBookById(id);
    if (!book || (!book.published && !req.headers.authorization)) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json(book);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch book' });
  }
});

// Public: Download book PDF directly
app.get('/api/download/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = db.getBookById(id);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    // Require admin auth only if book is unpublished
    if (!book.published) {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);
      if (!token || !verifyToken(token)) {
        res.status(404).json({ error: 'Book not found or unpublished' });
        return;
      }
    }

    const pdfBuffer = await db.getPdfBuffer(id);
    if (!pdfBuffer) {
      res.status(404).json({ error: 'PDF file not found in storage' });
      return;
    }

    const cleanFilename = `${slugify(book.title || 'book')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
    res.setHeader('Content-Length', String(pdfBuffer.length));
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Range');
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Error serving download:', err);
    res.status(500).json({ error: 'Server error downloading book' });
  }
});

// Public: Stream / view book PDF inline
app.get('/api/pdf/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = db.getBookById(id);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    if (!book.published) {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);
      if (!token || !verifyToken(token)) {
        res.status(404).json({ error: 'Book not found or unpublished' });
        return;
      }
    }

    const pdfBuffer = await db.getPdfBuffer(id);
    if (!pdfBuffer) {
      res.status(404).json({ error: 'PDF file not found in storage' });
      return;
    }

    const cleanFilename = `${slugify(book.title || 'book')}.pdf`;

    // Support HTTP Range requests (crucial for browser PDF viewer seeking and large files)
    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : pdfBuffer.length - 1;
        if (start < pdfBuffer.length && end >= start) {
          const clampedEnd = Math.min(end, pdfBuffer.length - 1);
          const chunkSize = (clampedEnd - start) + 1;
          const slice = pdfBuffer.subarray(start, clampedEnd + 1);

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${clampedEnd}/${pdfBuffer.length}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${cleanFilename}"`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Range'
          });
          res.end(slice);
          return;
        }
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cleanFilename}"`);
    res.setHeader('Content-Length', String(pdfBuffer.length));
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Range');
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Error streaming PDF:', err);
    res.status(500).json({ error: 'Server error streaming PDF' });
  }
});

// Public: Serve cover image directly by book ID with persistent fallback
app.get('/api/cover/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = db.getBookById(id);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    const coverBuffer = await db.getCoverBuffer(id);
    if (!coverBuffer) {
      res.status(404).json({ error: 'Cover image not found in storage' });
      return;
    }

    const isPng = book.cover_url?.toLowerCase().endsWith('.png') || book.cover_path?.toLowerCase().endsWith('.png');
    res.setHeader('Content-Type', isPng ? 'image/png' : 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(coverBuffer);
  } catch (err: any) {
    console.error('Error streaming cover:', err);
    res.status(500).json({ error: 'Server error streaming cover' });
  }
});

// ==========================================
// 4. BOOKS ENDPOINTS (ADMIN)
// ==========================================

// Admin: Get dashboard stats
app.get('/api/admin/stats', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

// Admin: Get all books (published and unpublished)
app.get('/api/admin/books', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { category, search, sort } = req.query;
    const books = db.getBooks({
      publishedOnly: false,
      categoryId: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      sort: (sort as any) || 'newest'
    });
    res.json(books);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin books' });
  }
});

// Admin: Automatically detect book author, category, ISBN, and metadata
app.post(
  '/api/admin/analyze-book',
  requireAdminAuth,
  upload.single('pdf'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No PDF file uploaded for analysis' });
        return;
      }
      const metadata = await analyzeBook(req.file.path, req.file.originalname);

      // Clean up temporary analysis file
      try {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn('Could not clean up temporary analysis file:', e);
      }

      res.json(metadata);
    } catch (err: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      console.error('Book analysis error:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze book' });
    }
  }
);

// Admin: Automatically generate or regenerate a short, accurate book description
app.post(
  '/api/admin/generate-description',
  requireAdminAuth,
  async (req: Request, res: Response) => {
    try {
      const { bookId, title, author, categoryId } = req.body;
      let pdfPath: string | undefined;
      let categoryName: string | undefined;

      if (bookId) {
        const book = db.getBookById(bookId);
        if (book) {
          pdfPath = book.pdf_path;
          categoryName = book.category_name;
        }
      }

      if (!categoryName && categoryId) {
        const cat = db.getCategoryById(categoryId);
        if (cat) categoryName = cat.name;
      }

      const description = await generateBookDescription({
        pdfPath,
        title,
        author,
        categoryName
      });

      res.json({ description });
    } catch (err: any) {
      console.error('Error generating description:', err);
      res.status(500).json({ error: err.message || 'Failed to generate description' });
    }
  }
);

// Admin: Extract PDF metadata on the fly (legacy lightweight endpoint)
app.post(
  '/api/admin/extract-pdf-info',
  requireAdminAuth,
  upload.single('pdf'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No PDF file uploaded for analysis' });
        return;
      }
      const info = await extractPdfInfo(req.file.path);
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
      res.json(info);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to analyze PDF' });
    }
  }
);

// Admin: Create new book (upload PDF and optional cover)
app.post(
  '/api/admin/books',
  requireAdminAuth,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const pdfFile = files?.pdf?.[0];
    const coverFile = files?.cover?.[0];

    // Cleanup helper if validation fails
    const cleanupUploadedFiles = () => {
      if (pdfFile?.path && fs.existsSync(pdfFile.path)) {
        try { fs.unlinkSync(pdfFile.path); } catch (e) { console.warn('Could not clean up pdf:', e); }
      }
      if (coverFile?.path && fs.existsSync(coverFile.path)) {
        try { fs.unlinkSync(coverFile.path); } catch (e) { console.warn('Could not clean up cover:', e); }
      }
    };

    try {
      if ((req as any).pdfValidationError) {
        cleanupUploadedFiles();
        res.status(400).json({ error: (req as any).pdfValidationError });
        return;
      }
      if ((req as any).coverValidationError) {
        cleanupUploadedFiles();
        res.status(400).json({ error: (req as any).coverValidationError });
        return;
      }

      if (!pdfFile) {
        res.status(400).json({ error: 'A PDF file is required when adding a book.' });
        return;
      }

      const {
        title,
        author,
        description,
        category_id,
        published,
        isbn,
        publisher,
        publication_year,
        metadata_confidence,
        allow_duplicate
      } = req.body;

      if (!title || !title.trim()) {
        cleanupUploadedFiles();
        res.status(400).json({ error: 'Book title is required.' });
        return;
      }

      if (!category_id) {
        cleanupUploadedFiles();
        res.status(400).json({ error: 'Category selection is required.' });
        return;
      }

      // Duplicate verification
      if (allow_duplicate !== 'true' && allow_duplicate !== true) {
        const dupCheck = db.checkDuplicate(title, author, isbn);
        if (dupCheck.isDuplicate) {
          cleanupUploadedFiles();
          res.status(409).json({
            error: `Possible duplicate book: ${dupCheck.reason}`,
            isDuplicate: true,
            reason: dupCheck.reason,
            matchedBook: dupCheck.matchedBook
          });
          return;
        }
      }

      // Verify category exists
      let validCategoryId = category_id;
      const categoryExists = db.getCategoryById(category_id);
      if (!categoryExists) {
        const allCategories = db.getCategories();
        if (allCategories.length > 0) {
          validCategoryId = allCategories[0].id;
        } else {
          cleanupUploadedFiles();
          res.status(400).json({ error: 'No categories exist. Please create a category first.' });
          return;
        }
      }

      // Extract metadata from PDF safely
      const pdfMetadata = await extractPdfInfo(pdfFile.path);

      const pdfUrl = `/uploads/pdfs/${path.basename(pdfFile.path)}`;
      const coverUrl = coverFile ? `/uploads/covers/${path.basename(coverFile.path)}` : '';
      const coverPath = coverFile ? coverFile.path : '';

      const isPublished = published === 'false' || published === false ? false : true;

      const pdfBuffer = fs.readFileSync(pdfFile.path);
      const coverBuffer = coverFile && fs.existsSync(coverFile.path) ? fs.readFileSync(coverFile.path) : undefined;

      const newBook = await db.createBook({
        title: title.trim(),
        author: author && author.trim() ? author.trim() : (pdfMetadata.author || 'Unknown Author'),
        description: description ? description.trim() : '',
        category_id: validCategoryId,
        cover_url: coverUrl,
        cover_path: coverPath,
        pdf_url: pdfUrl,
        pdf_path: pdfFile.path,
        file_size: pdfMetadata.fileSize,
        page_count: pdfMetadata.pageCount,
        isbn: isbn ? String(isbn).trim() : undefined,
        publisher: publisher ? String(publisher).trim() : undefined,
        publication_year: publication_year ? Number(publication_year) : undefined,
        metadata_confidence: metadata_confidence,
        published: isPublished
      }, pdfBuffer, coverBuffer, pdfFile.originalname, coverFile?.originalname);

      res.status(201).json(newBook);
    } catch (err: any) {
      cleanupUploadedFiles();
      console.error('Error creating book record:', err);
      res.status(500).json({ error: err.message || 'Failed to save book to repository.' });
    }
  }
);

// Admin: Update book (with optional replacement PDF or cover)
app.put(
  '/api/admin/books/:id',
  requireAdminAuth,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentBook = db.getBookById(id);
      if (!currentBook) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const newPdfFile = files?.pdf?.[0];
      const newCoverFile = files?.cover?.[0];

      const {
        title,
        author,
        description,
        category_id,
        published,
        isbn,
        publisher,
        publication_year,
        metadata_confidence
      } = req.body;

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (author !== undefined) updates.author = author;
      if (description !== undefined) updates.description = description;
      if (category_id !== undefined) updates.category_id = category_id;
      if (isbn !== undefined) updates.isbn = isbn;
      if (publisher !== undefined) updates.publisher = publisher;
      if (publication_year !== undefined) updates.publication_year = publication_year;
      if (metadata_confidence !== undefined) updates.metadata_confidence = metadata_confidence;
      if (published !== undefined) {
        updates.published = published === 'true' || published === true;
      }

      let newPdfBuffer: Buffer | undefined;
      let newCoverBuffer: Buffer | undefined;

      // If replacement PDF uploaded
      if (newPdfFile) {
        newPdfBuffer = fs.readFileSync(newPdfFile.path);
        const metadata = await extractPdfInfo(newPdfFile.path);
        // Remove old PDF safely
        if (currentBook.pdf_path && fs.existsSync(currentBook.pdf_path)) {
          try { fs.unlinkSync(currentBook.pdf_path); } catch {}
        }
        updates.pdf_url = `/uploads/pdfs/${path.basename(newPdfFile.path)}`;
        updates.pdf_path = newPdfFile.path;
        updates.file_size = metadata.fileSize;
        updates.page_count = metadata.pageCount;
      }

      // If replacement cover uploaded
      if (newCoverFile) {
        newCoverBuffer = fs.readFileSync(newCoverFile.path);
        // Remove old cover if exists
        if (currentBook.cover_path && fs.existsSync(currentBook.cover_path)) {
          try { fs.unlinkSync(currentBook.cover_path); } catch {}
        }
        updates.cover_url = `/uploads/covers/${path.basename(newCoverFile.path)}`;
        updates.cover_path = newCoverFile.path;
      }

      const updated = await db.updateBook(id, updates, newPdfBuffer, newCoverBuffer);
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating book:', err);
      res.status(500).json({ error: err.message || 'Failed to update book' });
    }
  }
);

// Admin: Toggle publish status
app.patch('/api/admin/books/:id/publish', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    const updated = await db.setBookPublished(id, Boolean(published));
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to change publish status' });
  }
});

// Admin: Delete book
app.delete('/api/admin/books/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.deleteBook(id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete book' });
  }
});

// Global error handling middleware for Multer or API errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    res.status(400).json({ error: err.message || 'An unexpected error occurred' });
  } else {
    next();
  }
});

// ==========================================
// 5. VITE DEV MIDDLEWARE / STATIC PRODUCTION
// ==========================================

async function startServer() {
  await db.ready();

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Open Book Library running on http://localhost:${PORT}`);
  });

  // Configure timeouts for large PDF uploads (up to 5 minutes)
  server.timeout = 300000;
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
