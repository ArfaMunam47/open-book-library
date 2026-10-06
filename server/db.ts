import fs from 'fs';
import path from 'path';

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

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PDFS_DIR)) {
    fs.mkdirSync(PDFS_DIR, { recursive: true });
  }
  if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
  }
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
  private db: LibraryDatabase = { categories: [], books: [] };
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    ensureDirectories();

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading library.json database, initializing fresh:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
    this.initialized = true;
  }

  private save() {
    ensureDirectories();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  private seedInitialData() {
    const now = new Date().toISOString();
    const categories: Category[] = INITIAL_CATEGORIES.map((cat, idx) => ({
      id: `cat-${idx + 1}`,
      name: cat.name,
      slug: slugify(cat.name),
      description: cat.description,
      created_at: now
    }));

    this.db = {
      categories,
      books: []
    };
    this.save();
  }

  // Categories API
  getCategories(): Category[] {
    this.init();
    return [...this.db.categories];
  }

  getCategoryById(id: string): Category | undefined {
    this.init();
    return this.db.categories.find(c => c.id === id || c.slug === id);
  }

  createCategory(name: string, description: string = ''): Category {
    this.init();
    const existing = this.db.categories.find(
      c => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existing) {
      throw new Error(`Category "${name}" already exists`);
    }

    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let slug = slugify(name);
    // ensure unique slug
    if (this.db.categories.some(c => c.slug === slug)) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newCategory: Category = {
      id,
      name: name.trim(),
      slug,
      description: description.trim(),
      created_at: new Date().toISOString()
    };

    this.db.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  updateCategory(id: string, name: string, description: string): Category {
    this.init();
    const index = this.db.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    const existingName = this.db.categories.find(
      c => c.id !== id && c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existingName) {
      throw new Error(`Category "${name}" already exists`);
    }

    const current = this.db.categories[index];
    const updatedSlug = slugify(name);

    this.db.categories[index] = {
      ...current,
      name: name.trim(),
      slug: updatedSlug,
      description: description.trim()
    };

    this.save();
    return this.db.categories[index];
  }

  deleteCategory(id: string): { success: boolean; reassignedBooksCount: number } {
    this.init();
    const index = this.db.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    // Check if books are using this category, reassign them to "Other" or default
    let otherCat = this.db.categories.find(c => c.slug === 'other' || c.name === 'Other');
    if (!otherCat) {
      // create fallback category
      otherCat = this.createCategory('Other', 'General and uncategorized books');
    }

    let reassigned = 0;
    this.db.books = this.db.books.map(b => {
      if (b.category_id === id) {
        reassigned++;
        return { ...b, category_id: otherCat!.id, updated_at: new Date().toISOString() };
      }
      return b;
    });

    this.db.categories.splice(index, 1);
    this.save();
    return { success: true, reassignedBooksCount: reassigned };
  }

  // Books API
  getBooks(options?: {
    publishedOnly?: boolean;
    categoryId?: string;
    search?: string;
    sort?: 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'author-asc';
  }): Array<Book & { category_name?: string }> {
    this.init();
    let result = [...this.db.books];

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
        const cat = this.db.categories.find(c => c.id === b.category_id);
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (cat && cat.name.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
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
      const cat = this.db.categories.find(c => c.id === b.category_id);
      return {
        ...b,
        category_name: cat ? cat.name : 'Uncategorized'
      };
    });
  }

  getBookById(id: string): (Book & { category_name?: string }) | undefined {
    this.init();
    const book = this.db.books.find(b => b.id === id);
    if (!book) return undefined;
    const cat = this.db.categories.find(c => c.id === book.category_id);
    return {
      ...book,
      category_name: cat ? cat.name : 'Uncategorized'
    };
  }

  createBook(data: {
    title: string;
    author?: string;
    description?: string;
    category_id: string;
    cover_url?: string;
    cover_path?: string;
    pdf_url: string;
    pdf_path: string;
    file_size?: number;
    page_count?: number;
    isbn?: string;
    publisher?: string;
    publication_year?: number;
    metadata_confidence?: 'High' | 'Medium' | 'Low';
    published?: boolean;
  }): Book {
    this.init();
    const id = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const book: Book = {
      id,
      title: data.title.trim(),
      author: (data.author || 'Unknown Author').trim(),
      description: (data.description || '').trim(),
      category_id: data.category_id,
      cover_url: data.cover_url || '',
      cover_path: data.cover_path || '',
      pdf_url: data.pdf_url,
      pdf_path: data.pdf_path,
      file_size: data.file_size || 0,
      page_count: data.page_count || 1,
      isbn: data.isbn ? data.isbn.trim() : undefined,
      publisher: data.publisher ? data.publisher.trim() : undefined,
      publication_year: data.publication_year ? Number(data.publication_year) : undefined,
      metadata_confidence: data.metadata_confidence,
      published: data.published ?? true,
      created_at: now,
      updated_at: now
    };

    this.db.books.unshift(book);
    this.save();
    return book;
  }

  updateBook(
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
    }>
  ): Book {
    this.init();
    const index = this.db.books.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Book not found');
    }

    const current = this.db.books[index];
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

    this.db.books[index] = updatedBook;
    this.save();
    return updatedBook;
  }

  checkDuplicate(
    title: string,
    author?: string,
    isbn?: string
  ): { isDuplicate: boolean; matchedBook?: Book; reason?: string } {
    this.init();
    const cleanTitle = title.trim().toLowerCase();
    const cleanAuthor = author ? author.trim().toLowerCase() : '';
    const cleanIsbn = isbn ? isbn.replace(/[-\s]/g, '').toLowerCase() : '';

    for (const b of this.db.books) {
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

  setBookPublished(id: string, published: boolean): Book {
    return this.updateBook(id, { published });
  }

  deleteBook(id: string): { success: boolean; deletedBook: Book } {
    this.init();
    const index = this.db.books.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Book not found');
    }

    const [deletedBook] = this.db.books.splice(index, 1);
    this.save();

    // Safely remove associated files from disk if they exist in uploads
    if (deletedBook.pdf_path && fs.existsSync(deletedBook.pdf_path)) {
      try {
        fs.unlinkSync(deletedBook.pdf_path);
      } catch (err) {
        console.warn('Could not delete pdf file:', deletedBook.pdf_path, err);
      }
    }
    if (deletedBook.cover_path && fs.existsSync(deletedBook.cover_path)) {
      try {
        fs.unlinkSync(deletedBook.cover_path);
      } catch (err) {
        console.warn('Could not delete cover file:', deletedBook.cover_path, err);
      }
    }

    return { success: true, deletedBook };
  }

  getStats(): {
    totalBooks: number;
    totalCategories: number;
    publishedBooks: number;
    unpublishedBooks: number;
  } {
    this.init();
    const totalBooks = this.db.books.length;
    const totalCategories = this.db.categories.length;
    const publishedBooks = this.db.books.filter(b => b.published).length;
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
