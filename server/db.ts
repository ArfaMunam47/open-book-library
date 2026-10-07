import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category_id: string;
  cover_url: string;
  pdf_url: string;
  pdf_path: string;
  cover_path: string;
  file_size: number; // in bytes
  page_count: number;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  metadata_confidence?: 'High' | 'Medium' | 'Low';
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibraryDatabase {
  categories: Category[];
  books: Book[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'library.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const PDFS_DIR = path.join(UPLOADS_DIR, 'pdfs');
const COVERS_DIR = path.join(UPLOADS_DIR, 'covers');
const CHUNK_SIZE = 512 * 1024; // 512 KB per Firestore chunk

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PDFS_DIR)) fs.mkdirSync(PDFS_DIR, { recursive: true });
  if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

const INITIAL_CATEGORIES: Array<{ name: string; description: string }> = [
  { name: 'Money & Finance', description: 'Personal finance, wealth management, investing, and economic freedom.' },
  { name: 'Business', description: 'Entrepreneurship, leadership, market strategies, and company building.' },
  { name: 'Self Development', description: 'Habit mastery, mental clarity, productivity, and personal transformation.' },
  { name: 'Motivation', description: 'Inspiration, grit, mindset, and stories of endurance and achievement.' },
  { name: 'Education', description: 'Academic texts, open textbooks, learning methods, and reference materials.' },
  { name: 'Fiction', description: 'Classic public domain literature, stories, poetry, and narrative works.' },
  { name: 'Health', description: 'Physical wellness, nutrition, longevity, and holistic living.' },
  { name: 'Technology', description: 'Computer science, digital systems, software engineering, and the web.' },
  { name: 'Family', description: 'Parenting, home life, raising children, and household guidance.' },
  { name: 'Love & Relationships', description: 'Interpersonal communication, empathy, friendship, and connection.' },
  { name: 'Religion', description: 'Theological essays, philosophical ethics, and spiritual traditions.' },
  { name: 'Other', description: 'General publications, miscellaneous essays, and public records.' }
];

export class DatabaseService {
  private firebaseApp: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private categories: Category[] = [];
  private books: Book[] = [];
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  async ready(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private async init() {
    if (this.initialized) return;
    ensureDirectories();

    // 1. First always read local file snapshot so existing records are preserved in memory
    this.loadFromLocalFile();

    // 2. Initialize Firebase from config file
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      try {
        const configRaw = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configRaw);
        if (!getApps().length) {
          this.firebaseApp = initializeApp(config);
        } else {
          this.firebaseApp = getApps()[0];
        }
        this.firestore = getFirestore(this.firebaseApp, config.firestoreDatabaseId);
        console.log('Connected to persistent Cloud Firestore database:', config.firestoreDatabaseId);
      } catch (err) {
        console.warn('Could not initialize Firebase Firestore client:', err);
      }
    }

    // 3. Load & Synchronize persistent data from Firestore (merging safely)
    if (this.firestore) {
      try {
        await this.syncFromFirestore();
      } catch (err) {
        console.warn('Error reading from Cloud Firestore, using local snapshot:', err);
      }
    }

    // 4. Ensure categories exist
    if (this.categories.length === 0) {
      await this.seedCategories();
    }

    // 5. Perform migration from local files if needed
    await this.migrateLocalDataToFirestore();

    this.initialized = true;
  }

  private loadFromLocalFile() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          this.categories = parsed.categories;
        }
        if (Array.isArray(parsed.books) && parsed.books.length > 0) {
          this.books = parsed.books;
        }
      } catch (e) {
        console.warn('Local database read failed:', e);
      }
    }
  }

  private async syncFromFirestore() {
    if (!this.firestore) return;

    // Load categories
    const catSnap = await getDocs(collection(this.firestore, 'categories'));
    if (!catSnap.empty) {
      const remoteCategories = catSnap.docs.map(d => ({ ...(d.data() as Category), id: d.id }));
      for (const rc of remoteCategories) {
        const idx = this.categories.findIndex(c => c.id === rc.id);
        if (idx >= 0) {
          this.categories[idx] = rc;
        } else {
          this.categories.push(rc);
        }
      }
    } else if (this.categories.length > 0) {
      for (const cat of this.categories) {
        await setDoc(doc(this.firestore, 'categories', cat.id), cat).catch(console.warn);
      }
    }

    // Load books
    const bookSnap = await getDocs(collection(this.firestore, 'books'));
    if (!bookSnap.empty) {
      const remoteBooks = bookSnap.docs.map(d => ({ ...(d.data() as Book), id: d.id }));
      for (const rb of remoteBooks) {
        const idx = this.books.findIndex(b => b.id === rb.id);
        if (idx >= 0) {
          this.books[idx] = rb;
        } else {
          this.books.push(rb);
        }
      }
    }

    // Ensure any book currently in local memory is also pushed up to Firestore
    for (const lb of this.books) {
      if (!bookSnap.docs.some(d => d.id === lb.id)) {
        await setDoc(doc(this.firestore, 'books', lb.id), cleanForFirestore(lb)).catch(console.warn);
        console.log(`Synced local book "${lb.title}" to persistent Firestore.`);
      }
    }

    // Sort books newest first
    this.books.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Update local snapshot file
    this.saveLocalSnapshot();
  }

  private saveLocalSnapshot() {
    ensureDirectories();
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify({ categories: this.categories, books: this.books }, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.warn('Could not save local JSON snapshot:', e);
    }
  }

  private async seedCategories() {
    const now = new Date().toISOString();
    const seededCategories: Category[] = INITIAL_CATEGORIES.map((cat, idx) => ({
      id: `cat-${idx + 1}`,
      name: cat.name,
      slug: slugify(cat.name),
      description: cat.description,
      created_at: now
    }));

    this.categories = seededCategories;
    this.saveLocalSnapshot();

    if (this.firestore) {
      try {
        const batch = writeBatch(this.firestore);
        for (const cat of seededCategories) {
          batch.set(doc(this.firestore, 'categories', cat.id), cat);
        }
        await batch.commit();
        console.log('Seeded 12 standard categories into Cloud Firestore.');
      } catch (err) {
        console.warn('Could not write categories to Firestore:', err);
      }
    }
  }

  /**
   * One-time migration: saves existing local books & physical PDF/cover binaries
   * to persistent Cloud Firestore chunks so they never disappear.
   */
  private async migrateLocalDataToFirestore() {
    if (!this.firestore) return;

    // Check existing 4 books
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const localData = JSON.parse(raw);
        const localBooks: Book[] = localData.books || [];

        for (const localBook of localBooks) {
          const existing = this.books.find(b => b.id === localBook.id);
          if (!existing) {
            console.log(`Migrating book "${localBook.title}" (${localBook.id}) to persistent Cloud Firestore...`);
            await setDoc(doc(this.firestore, 'books', localBook.id), localBook);
            this.books.unshift(localBook);
          }

          // If PDF exists on disk, persist its binary chunks to Firestore
          if (localBook.pdf_path && fs.existsSync(localBook.pdf_path)) {
            await this.persistFileToChunks(localBook.id, 'pdf_chunks', localBook.pdf_path);
          }
          // If cover exists on disk, persist its binary chunks to Firestore
          if (localBook.cover_path && fs.existsSync(localBook.cover_path)) {
            await this.persistFileToChunks(localBook.id, 'cover_chunks', localBook.cover_path);
          }
        }
      } catch (err) {
        console.warn('Migration note:', err);
      }
    }

    // Check orphan PDFs in uploads/
    await this.preserveOrphanFiles();
  }

  private async preserveOrphanFiles() {
    if (!this.firestore) return;
    try {
      const atomicHabitsPdf = path.join(PDFS_DIR, 'Atomic_Habits_Clear_James_2026_1791210127412_gmkb4n.pdf');
      if (fs.existsSync(atomicHabitsPdf) && !this.books.some(b => b.title.includes('Atomic Habits'))) {
        const stats = fs.statSync(atomicHabitsPdf);
        const bookId = 'book-atomic-habits-permanent';
        const now = new Date().toISOString();
        const book: Book = {
          id: bookId,
          title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
          author: 'James Clear',
          description: 'A transformative guide on how tiny daily changes and incremental 1% improvements accumulate into remarkable results. James Clear provides practical, actionable strategies for habit formation, overcoming lack of motivation, and reshaping personal identity.',
          category_id: 'cat-3',
          cover_url: '',
          cover_path: '',
          pdf_url: `/api/pdf/${bookId}`,
          pdf_path: atomicHabitsPdf,
          file_size: stats.size,
          page_count: 80,
          isbn: '9780735211292',
          publisher: 'Avery',
          publication_year: 2018,
          metadata_confidence: 'High',
          published: true,
          created_at: now,
          updated_at: now
        };

        await this.persistFileToChunks(bookId, 'pdf_chunks', atomicHabitsPdf);
        await setDoc(doc(this.firestore, 'books', bookId), book);
        this.books.unshift(book);
        console.log('Preserved orphan Atomic Habits book into persistent Cloud Firestore.');
      }
    } catch (e) {
      console.warn('Orphan preservation note:', e);
    }
  }

  /**
   * Persists a binary file from disk into Firestore chunks.
   */
  async persistFileToChunks(bookId: string, subcollection: 'pdf_chunks' | 'cover_chunks', filePath: string): Promise<boolean> {
    if (!this.firestore || !fs.existsSync(filePath)) return false;

    try {
      // Check if already persisted
      const checkSnap = await getDocs(collection(this.firestore, 'books', bookId, subcollection));
      if (!checkSnap.empty) {
        return true; // Already stored in Firestore
      }

      const buffer = fs.readFileSync(filePath);
      await this.saveBufferToChunks(bookId, subcollection, buffer);
      return true;
    } catch (err) {
      console.warn(`Could not persist ${subcollection} for book ${bookId}:`, err);
      return false;
    }
  }

  /**
   * Splits a buffer into 512KB chunks and stores them in a Firestore subcollection.
   */
  async saveBufferToChunks(bookId: string, subcollection: 'pdf_chunks' | 'cover_chunks', buffer: Buffer): Promise<void> {
    if (!this.firestore) return;

    const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
    for (let i = 0; i < totalChunks; i++) {
      const chunk = buffer.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkRef = doc(this.firestore, 'books', bookId, subcollection, String(i));
      await setDoc(chunkRef, {
        chunkIndex: i,
        totalChunks,
        data: chunk.toString('base64')
      });
    }

    console.log(`Saved ${buffer.length} bytes into ${totalChunks} persistent Firestore chunks for ${subcollection}/${bookId}`);
  }

  /**
   * Retrieves and reassembles a file buffer from persistent Firestore chunks.
   */
  async getBufferFromChunks(bookId: string, subcollection: 'pdf_chunks' | 'cover_chunks'): Promise<Buffer | null> {
    if (!this.firestore) return null;

    try {
      const snap = await getDocs(collection(this.firestore, 'books', bookId, subcollection));
      if (snap.empty) return null;

      const chunks = snap.docs.map(d => d.data() as { chunkIndex: number; totalChunks: number; data: string });
      chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

      return Buffer.concat(chunks.map(c => Buffer.from(c.data, 'base64')));
    } catch (err) {
      console.warn(`Failed to read chunks for ${subcollection}/${bookId}:`, err);
      return null;
    }
  }

  /**
   * Gets the PDF buffer for a book.
   * If available on local container disk, returns it immediately.
   * If missing (e.g. after container restart), re-hydrates from persistent Firestore chunks.
   */
  async getPdfBuffer(bookId: string): Promise<Buffer | null> {
    const book = this.getBookById(bookId);
    if (!book) return null;

    // 1. Try local disk cache
    if (book.pdf_path && fs.existsSync(book.pdf_path)) {
      try {
        return fs.readFileSync(book.pdf_path);
      } catch {}
    }

    // 2. Fetch from persistent Cloud Firestore chunks
    const fromFirestore = await this.getBufferFromChunks(bookId, 'pdf_chunks');
    if (fromFirestore) {
      // Re-hydrate local disk cache so subsequent requests are lightning fast
      try {
        ensureDirectories();
        const safeFilename = `${slugify(book.title || 'book')}_${book.id}.pdf`;
        const localPath = path.join(PDFS_DIR, safeFilename);
        fs.writeFileSync(localPath, fromFirestore);
        book.pdf_path = localPath;
        book.pdf_url = `/uploads/pdfs/${safeFilename}`;
      } catch (e) {
        console.warn('Could not cache PDF locally:', e);
      }
      return fromFirestore;
    }

    return null;
  }

  /**
   * Gets the cover buffer for a book.
   * If available on local container disk, returns it immediately.
   * If missing (e.g. after container restart), re-hydrates from persistent Firestore chunks.
   */
  async getCoverBuffer(bookId: string): Promise<Buffer | null> {
    const book = this.getBookById(bookId);
    if (!book) return null;

    // 1. Try local disk cache
    if (book.cover_path && fs.existsSync(book.cover_path)) {
      try {
        return fs.readFileSync(book.cover_path);
      } catch {}
    }

    // 2. Fetch from persistent Cloud Firestore chunks
    const fromFirestore = await this.getBufferFromChunks(bookId, 'cover_chunks');
    if (fromFirestore) {
      try {
        ensureDirectories();
        const ext = book.cover_url.endsWith('.png') ? '.png' : '.jpg';
        const safeFilename = `cover_${slugify(book.title || 'book')}_${book.id}${ext}`;
        const localPath = path.join(COVERS_DIR, safeFilename);
        fs.writeFileSync(localPath, fromFirestore);
        book.cover_path = localPath;
        book.cover_url = `/uploads/covers/${safeFilename}`;
      } catch (e) {
        console.warn('Could not cache cover locally:', e);
      }
      return fromFirestore;
    }

    return null;
  }

  // ==========================================
  // Categories API
  // ==========================================

  getCategories(): Category[] {
    return [...this.categories];
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(c => c.id === id || c.slug === id);
  }

  async createCategory(name: string, description: string = ''): Promise<Category> {
    const existing = this.categories.find(
      c => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existing) {
      throw new Error(`Category "${name}" already exists`);
    }

    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let slug = slugify(name);
    if (this.categories.some(c => c.slug === slug)) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newCategory: Category = {
      id,
      name: name.trim(),
      slug,
      description: description.trim(),
      created_at: new Date().toISOString()
    };

    this.categories.push(newCategory);
    this.saveLocalSnapshot();

    if (this.firestore) {
      await setDoc(doc(this.firestore, 'categories', id), newCategory);
    }

    return newCategory;
  }

  async updateCategory(id: string, name: string, description: string): Promise<Category> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    const existingName = this.categories.find(
      c => c.id !== id && c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existingName) {
      throw new Error(`Category "${name}" already exists`);
    }

    const current = this.categories[index];
    const updatedSlug = slugify(name);

    const updatedCategory: Category = {
      ...current,
      name: name.trim(),
      slug: updatedSlug,
      description: description.trim()
    };

    this.categories[index] = updatedCategory;
    this.saveLocalSnapshot();

    if (this.firestore) {
      await setDoc(doc(this.firestore, 'categories', id), updatedCategory);
    }

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; reassignedBooksCount: number }> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    let otherCat = this.categories.find(c => c.slug === 'other' || c.name === 'Other');
    if (!otherCat) {
      otherCat = await this.createCategory('Other', 'General and uncategorized books');
    }

    let reassigned = 0;
    this.books = this.books.map(b => {
      if (b.category_id === id) {
        reassigned++;
        const updated = { ...b, category_id: otherCat!.id, updated_at: new Date().toISOString() };
        if (this.firestore) {
          setDoc(doc(this.firestore, 'books', b.id), updated).catch(console.warn);
        }
        return updated;
      }
      return b;
    });

    this.categories.splice(index, 1);
    this.saveLocalSnapshot();

    if (this.firestore) {
      await deleteDoc(doc(this.firestore, 'categories', id));
    }

    return { success: true, reassignedBooksCount: reassigned };
  }

  // ==========================================
  // Books API
  // ==========================================

  getBooks(options?: {
    publishedOnly?: boolean;
    categoryId?: string;
    search?: string;
    sort?: 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'author-asc';
  }): Array<Book & { category_name?: string }> {
    let result = [...this.books];

    if (options?.publishedOnly) {
      result = result.filter(b => b.published === true);
    }

    if (options?.categoryId && options.categoryId !== 'all') {
      const cat = this.getCategoryById(options.categoryId);
      const targetId = cat ? cat.id : options.categoryId;
      result = result.filter(b => b.category_id === targetId);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      result = result.filter(b => {
        const cat = this.categories.find(c => c.id === b.category_id);
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (cat && cat.name.toLowerCase().includes(q))
        );
      });
    }

    const sort = options?.sort || 'newest';
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sort === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === 'author-asc') {
      result.sort((a, b) => a.author.localeCompare(b.author));
    }

    return result.map(b => {
      const cat = this.categories.find(c => c.id === b.category_id);
      return {
        ...b,
        category_name: cat ? cat.name : 'Uncategorized'
      };
    });
  }

  getBookById(id: string): (Book & { category_name?: string }) | undefined {
    const book = this.books.find(b => b.id === id);
    if (!book) return undefined;
    const cat = this.categories.find(c => c.id === book.category_id);
    return {
      ...book,
      category_name: cat ? cat.name : 'Uncategorized'
    };
  }

  /**
   * Creates a book record and permanently stores its PDF and cover binary chunks in Cloud Firestore.
   */
  async createBook(
    data: {
      title: string;
      author?: string;
      description?: string;
      category_id: string;
      cover_url?: string;
      cover_path?: string;
      pdf_url?: string;
      pdf_path?: string;
      file_size?: number;
      page_count?: number;
      isbn?: string;
      publisher?: string;
      publication_year?: number;
      metadata_confidence?: 'High' | 'Medium' | 'Low';
      published?: boolean;
    },
    pdfBuffer?: Buffer,
    coverBuffer?: Buffer,
    originalPdfName: string = 'book.pdf',
    originalCoverName?: string
  ): Promise<Book> {
    const id = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    ensureDirectories();

    let createdPdfPath = '';
    let createdCoverPath = '';

    try {
      // Step 1: Validate PDF if provided
      if (pdfBuffer) {
        if (pdfBuffer.length < 10 || !pdfBuffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
          throw new Error('Invalid PDF format: file does not contain valid PDF magic bytes header.');
        }
      }

      // Step 2: Store binary PDF chunks permanently in Cloud Firestore
      let pdfUrl = data.pdf_url || `/api/pdf/${id}`;
      let pdfPath = data.pdf_path || '';
      if (pdfBuffer) {
        await this.saveBufferToChunks(id, 'pdf_chunks', pdfBuffer);

        // Step 3: Verify all PDF chunks in Firestore
        if (this.firestore) {
          const expectedChunks = Math.ceil(pdfBuffer.length / CHUNK_SIZE);
          const pdfSnap = await getDocs(collection(this.firestore, 'books', id, 'pdf_chunks'));
          if (pdfSnap.docs.length !== expectedChunks) {
            throw new Error(`PDF chunk verification failed: expected ${expectedChunks} chunks, but found ${pdfSnap.docs.length}`);
          }
        }

        // Cache locally on current instance
        const safeFilename = `${slugify(data.title || 'book')}_${id}.pdf`;
        pdfPath = path.join(PDFS_DIR, safeFilename);
        fs.writeFileSync(pdfPath, pdfBuffer);
        createdPdfPath = pdfPath;
        pdfUrl = `/uploads/pdfs/${safeFilename}`;
      }

      // Step 4: Store binary Cover chunks permanently in Cloud Firestore
      let coverUrl = data.cover_url || '';
      let coverPath = data.cover_path || '';
      if (coverBuffer) {
        await this.saveBufferToChunks(id, 'cover_chunks', coverBuffer);

        // Step 5: Verify all Cover chunks in Firestore
        if (this.firestore) {
          const expectedChunks = Math.ceil(coverBuffer.length / CHUNK_SIZE);
          const coverSnap = await getDocs(collection(this.firestore, 'books', id, 'cover_chunks'));
          if (coverSnap.docs.length !== expectedChunks) {
            throw new Error(`Cover chunk verification failed: expected ${expectedChunks} chunks, but found ${coverSnap.docs.length}`);
          }
        }

        const ext = originalCoverName && path.extname(originalCoverName).toLowerCase() ? path.extname(originalCoverName).toLowerCase() : '.jpg';
        const safeFilename = `cover_${slugify(data.title || 'book')}_${id}${ext}`;
        coverPath = path.join(COVERS_DIR, safeFilename);
        fs.writeFileSync(coverPath, coverBuffer);
        createdCoverPath = coverPath;
        coverUrl = `/uploads/covers/${safeFilename}`;
      }

      const book: Book = {
        id,
        title: data.title.trim(),
        author: (data.author || 'Unknown Author').trim(),
        description: (data.description || '').trim(),
        category_id: data.category_id,
        cover_url: coverUrl,
        cover_path: coverPath,
        pdf_url: pdfUrl,
        pdf_path: pdfPath,
        file_size: data.file_size || (pdfBuffer ? pdfBuffer.length : 0),
        page_count: data.page_count || 1,
        isbn: data.isbn ? data.isbn.trim() : undefined,
        publisher: data.publisher ? data.publisher.trim() : undefined,
        publication_year: data.publication_year ? Number(data.publication_year) : undefined,
        metadata_confidence: data.metadata_confidence,
        published: data.published ?? true,
        created_at: now,
        updated_at: now
      };

      // Step 6: Save metadata record to Cloud Firestore
      if (this.firestore) {
        await setDoc(doc(this.firestore, 'books', id), cleanForFirestore(book));

        // Step 7: Verify Firestore book document exists
        const verifyDoc = await getDoc(doc(this.firestore, 'books', id));
        if (!verifyDoc.exists()) {
          throw new Error('Firestore document write verification failed.');
        }
        console.log(`Verified book "${book.title}" (${id}) permanently committed to Cloud Firestore.`);
      }

      // Step 8: Commit to memory & local snapshot
      this.books.unshift(book);
      this.saveLocalSnapshot();
      return book;
    } catch (err) {
      console.error(`Atomic upload transaction failed for book ${id}:`, err);
      if (this.firestore) {
        try {
          await deleteDoc(doc(this.firestore, 'books', id));
          const pChunks = await getDocs(collection(this.firestore, 'books', id, 'pdf_chunks'));
          await Promise.all(pChunks.docs.map(d => deleteDoc(d.ref)));
          const cChunks = await getDocs(collection(this.firestore, 'books', id, 'cover_chunks'));
          await Promise.all(cChunks.docs.map(d => deleteDoc(d.ref)));
        } catch (cleanupErr) {
          console.warn('Rollback chunk cleanup note:', cleanupErr);
        }
      }
      if (createdPdfPath && fs.existsSync(createdPdfPath)) {
        try { fs.unlinkSync(createdPdfPath); } catch {}
      }
      if (createdCoverPath && fs.existsSync(createdCoverPath)) {
        try { fs.unlinkSync(createdCoverPath); } catch {}
      }
      throw err;
    }
  }

  async updateBook(
    id: string,
    updates: Partial<{
      title: string;
      author: string;
      description: string;
      category_id: string;
      cover_url: string;
      cover_path: string;
      pdf_url: string;
      pdf_path: string;
      file_size: number;
      page_count: number;
      isbn: string;
      publisher: string;
      publication_year: number;
      metadata_confidence: 'High' | 'Medium' | 'Low';
      published: boolean;
    }>,
    newPdfBuffer?: Buffer,
    newCoverBuffer?: Buffer
  ): Promise<Book> {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Book not found');
    }

    // If replacement PDF buffer is provided, update persistent chunks
    if (newPdfBuffer) {
      await this.saveBufferToChunks(id, 'pdf_chunks', newPdfBuffer);
      const safeFilename = `${slugify(updates.title || this.books[index].title)}_${id}.pdf`;
      const localPath = path.join(PDFS_DIR, safeFilename);
      fs.writeFileSync(localPath, newPdfBuffer);
      updates.pdf_path = localPath;
      updates.pdf_url = `/uploads/pdfs/${safeFilename}`;
      updates.file_size = newPdfBuffer.length;
    }

    // If replacement cover buffer is provided, update persistent chunks
    if (newCoverBuffer) {
      await this.saveBufferToChunks(id, 'cover_chunks', newCoverBuffer);
      const safeFilename = `cover_${slugify(updates.title || this.books[index].title)}_${id}.jpg`;
      const localPath = path.join(COVERS_DIR, safeFilename);
      fs.writeFileSync(localPath, newCoverBuffer);
      updates.cover_path = localPath;
      updates.cover_url = `/uploads/covers/${safeFilename}`;
    }

    const current = this.books[index];
    const updatedBook: Book = {
      ...current,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      author: updates.author !== undefined ? updates.author.trim() : current.author,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      isbn: updates.isbn !== undefined ? (updates.isbn ? updates.isbn.trim() : undefined) : current.isbn,
      publisher: updates.publisher !== undefined ? (updates.publisher ? updates.publisher.trim() : undefined) : current.publisher,
      publication_year: updates.publication_year !== undefined ? (updates.publication_year ? Number(updates.publication_year) : undefined) : current.publication_year,
      updated_at: new Date().toISOString()
    };

    this.books[index] = updatedBook;
    this.saveLocalSnapshot();

    if (this.firestore) {
      await setDoc(doc(this.firestore, 'books', id), cleanForFirestore(updatedBook));
    }

    return updatedBook;
  }

  checkDuplicate(
    title: string,
    author?: string,
    isbn?: string
  ): { isDuplicate: boolean; matchedBook?: Book; reason?: string } {
    const cleanTitle = title.trim().toLowerCase();
    const cleanAuthor = author ? author.trim().toLowerCase() : '';
    const cleanIsbn = isbn ? isbn.replace(/[-\s]/g, '').toLowerCase() : '';

    for (const b of this.books) {
      if (cleanIsbn && b.isbn && b.isbn.replace(/[-\s]/g, '').toLowerCase() === cleanIsbn) {
        return { isDuplicate: true, matchedBook: b, reason: `Matching ISBN: ${b.isbn}` };
      }
      const bTitle = b.title.trim().toLowerCase();
      const bAuthor = b.author.trim().toLowerCase();
      if (cleanTitle === bTitle) {
        if (!cleanAuthor || !bAuthor || cleanAuthor.includes(bAuthor) || bAuthor.includes(cleanAuthor)) {
          return { isDuplicate: true, matchedBook: b, reason: `Identical title "${b.title}" by "${b.author}"` };
        }
      }
    }
    return { isDuplicate: false };
  }

  async setBookPublished(id: string, published: boolean): Promise<Book> {
    return this.updateBook(id, { published });
  }

  async deleteBook(id: string): Promise<{ success: boolean; deletedBook: Book }> {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Book not found');
    }

    const [deletedBook] = this.books.splice(index, 1);
    this.saveLocalSnapshot();

    // 1. Delete from Cloud Firestore
    if (this.firestore) {
      try {
        await deleteDoc(doc(this.firestore, 'books', id));

        // Delete chunks subcollections
        const pdfChunksSnap = await getDocs(collection(this.firestore, 'books', id, 'pdf_chunks'));
        await Promise.all(pdfChunksSnap.docs.map(d => deleteDoc(d.ref)));

        const coverChunksSnap = await getDocs(collection(this.firestore, 'books', id, 'cover_chunks'));
        await Promise.all(coverChunksSnap.docs.map(d => deleteDoc(d.ref)));
      } catch (e) {
        console.warn('Could not delete from Firestore:', e);
      }
    }

    // 2. Remove local cached files
    if (deletedBook.pdf_path && fs.existsSync(deletedBook.pdf_path)) {
      try { fs.unlinkSync(deletedBook.pdf_path); } catch {}
    }
    if (deletedBook.cover_path && fs.existsSync(deletedBook.cover_path)) {
      try { fs.unlinkSync(deletedBook.cover_path); } catch {}
    }

    return { success: true, deletedBook };
  }

  getStats(): {
    totalBooks: number;
    totalCategories: number;
    publishedBooks: number;
    unpublishedBooks: number;
  } {
    const totalBooks = this.books.length;
    const totalCategories = this.categories.length;
    const publishedBooks = this.books.filter(b => b.published).length;
    const unpublishedBooks = totalBooks - publishedBooks;

    return {
      totalBooks,
      totalCategories,
      publishedBooks,
      unpublishedBooks
    };
  }
}

export const db = new DatabaseService();
