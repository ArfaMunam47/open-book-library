import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import { db, slugify } from './server/db.js';
import {
  generateToken,
  verifyToken,
  verifyAdminPassword,
  requireAdminAuth
} from './server/auth.js';
import { extractPdfInfo, ensureSampleBooks } from './server/pdf-helper.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Ensure uploads folder structure exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
const pdfsDir = path.join(uploadsDir, 'pdfs');
const coversDir = path.join(uploadsDir, 'covers');
if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

// Seed sample books if empty
ensureSampleBooks().catch(err => console.error('Sample book check error:', err));

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
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^\w\-]+/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${base}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for large book PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for the book file.'));
      }
    } else if (file.fieldname === 'cover') {
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG, JPEG, PNG, or WebP files are allowed for the cover image.'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Middleware
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
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
app.post('/api/admin/categories', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }
    const newCategory = db.createCategory(name, description);
    res.status(201).json(newCategory);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create category' });
  }
});

// Admin: Update category
app.put('/api/admin/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }
    const updated = db.updateCategory(id, name, description || '');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update category' });
  }
});

// Admin: Delete category
app.delete('/api/admin/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.deleteCategory(id);
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
app.get('/api/download/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = db.getBookById(id);
    if (!book) {
      res.status(404).send('Book not found');
      return;
    }

    if (!fs.existsSync(book.pdf_path)) {
      res.status(404).send('PDF file not found in storage');
      return;
    }

    const cleanFilename = `${slugify(book.title || 'book')}.pdf`;
    res.download(book.pdf_path, cleanFilename, err => {
      if (err && !res.headersSent) {
        console.error('Download error:', err);
        res.status(500).send('Error downloading file');
      }
    });
  } catch (err: any) {
    res.status(500).send('Server error downloading book');
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

// Admin: Extract PDF metadata on the fly
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
      // Clean up the temporary analyzed file
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
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const pdfFile = files?.pdf?.[0];
      const coverFile = files?.cover?.[0];

      if (!pdfFile) {
        res.status(400).json({ error: 'A PDF file is required when adding a book.' });
        return;
      }

      const { title, author, description, category_id, published } = req.body;
      if (!title || !title.trim()) {
        // delete uploaded files to prevent orphaned files
        try { fs.unlinkSync(pdfFile.path); } catch {}
        if (coverFile) { try { fs.unlinkSync(coverFile.path); } catch {} }
        res.status(400).json({ error: 'Book title is required.' });
        return;
      }

      if (!category_id) {
        try { fs.unlinkSync(pdfFile.path); } catch {}
        if (coverFile) { try { fs.unlinkSync(coverFile.path); } catch {} }
        res.status(400).json({ error: 'Category selection is required.' });
        return;
      }

      // Extract metadata from PDF if available
      const pdfMetadata = await extractPdfInfo(pdfFile.path);

      const pdfUrl = `/uploads/pdfs/${path.basename(pdfFile.path)}`;
      const coverUrl = coverFile ? `/uploads/covers/${path.basename(coverFile.path)}` : '';
      const coverPath = coverFile ? coverFile.path : '';

      const isPublished = published === 'false' || published === false ? false : true;

      const newBook = db.createBook({
        title: title.trim(),
        author: author ? author.trim() : (pdfMetadata.author || 'Unknown Author'),
        description: description ? description.trim() : '',
        category_id,
        cover_url: coverUrl,
        cover_path: coverPath,
        pdf_url: pdfUrl,
        pdf_path: pdfFile.path,
        file_size: pdfMetadata.fileSize,
        page_count: pdfMetadata.pageCount,
        published: isPublished
      });

      res.status(201).json(newBook);
    } catch (err: any) {
      console.error('Error creating book:', err);
      res.status(500).json({ error: err.message || 'Failed to create book' });
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

      const { title, author, description, category_id, published } = req.body;

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (author !== undefined) updates.author = author;
      if (description !== undefined) updates.description = description;
      if (category_id !== undefined) updates.category_id = category_id;
      if (published !== undefined) {
        updates.published = published === 'true' || published === true;
      }

      // If replacement PDF uploaded
      if (newPdfFile) {
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
        // Remove old cover if exists
        if (currentBook.cover_path && fs.existsSync(currentBook.cover_path)) {
          try { fs.unlinkSync(currentBook.cover_path); } catch {}
        }
        updates.cover_url = `/uploads/covers/${path.basename(newCoverFile.path)}`;
        updates.cover_path = newCoverFile.path;
      }

      const updated = db.updateBook(id, updates);
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating book:', err);
      res.status(500).json({ error: err.message || 'Failed to update book' });
    }
  }
);

// Admin: Toggle publish status
app.patch('/api/admin/books/:id/publish', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    const updated = db.setBookPublished(id, Boolean(published));
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to change publish status' });
  }
});

// Admin: Delete book
app.delete('/api/admin/books/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.deleteBook(id);
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Open Book Library running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
