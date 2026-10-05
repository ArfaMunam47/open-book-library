export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  book_count?: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category_id: string;
  category_name?: string;
  cover_url: string;
  pdf_url: string;
  pdf_path?: string;
  cover_path?: string;
  file_size: number;
  page_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalBooks: number;
  totalCategories: number;
  publishedBooks: number;
  unpublishedBooks: number;
}

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'author-asc';

export interface ExtractedPdfInfo {
  title?: string;
  author?: string;
  pageCount: number;
  fileSize: number;
}

export type ActiveView = 
  | { type: 'home' }
  | { type: 'books'; categoryId?: string; search?: string }
  | { type: 'categories' }
  | { type: 'book-details'; bookId: string }
  | { type: 'pdf-reader'; bookId: string }
  | { type: 'admin'; subview?: 'books' | 'categories' | 'new-book' | 'edit-book'; editingBookId?: string }
  | { type: 'admin-login' };
