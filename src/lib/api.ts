import { Book, Category, AdminStats, SortOption, ExtractedPdfInfo } from '../types/library';

const ADMIN_TOKEN_KEY = 'open_book_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return isoString;
  }
}

// ----------------------------------------
// PUBLIC API
// ----------------------------------------

export async function fetchBooks(params?: {
  category?: string;
  search?: string;
  sort?: SortOption;
}): Promise<Book[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }
  if (params?.search && params.search.trim()) {
    searchParams.set('search', params.search.trim());
  }
  if (params?.sort) {
    searchParams.set('sort', params.sort);
  }

  const query = searchParams.toString();
  const url = `/api/books${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load books');
  }
  return res.json();
}

export async function fetchBookById(id: string): Promise<Book> {
  const res = await fetch(`/api/books/${id}`);
  if (!res.ok) {
    throw new Error('Book not found or failed to load');
  }
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) {
    throw new Error('Failed to load categories');
  }
  return res.json();
}

export function getDownloadUrl(bookId: string): string {
  return `/api/download/${bookId}`;
}

// ----------------------------------------
// AUTH API
// ----------------------------------------

export async function adminLogin(password: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed. Please check password.');
  }

  if (data.token) {
    setAdminToken(data.token);
  }
  return data;
}

export async function checkAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

export async function adminLogout(): Promise<void> {
  removeAdminToken();
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {}
}

// ----------------------------------------
// ADMIN API
// ----------------------------------------

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch administrator stats');
  }
  return res.json();
}

export async function fetchAdminBooks(params?: {
  category?: string;
  search?: string;
  sort?: SortOption;
}): Promise<Book[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }
  if (params?.search && params.search.trim()) {
    searchParams.set('search', params.search.trim());
  }
  if (params?.sort) {
    searchParams.set('sort', params.sort);
  }

  const query = searchParams.toString();
  const url = `/api/admin/books${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin book records');
  }
  return res.json();
}

export async function uploadNewBook(formData: FormData): Promise<Book> {
  const res = await fetch('/api/admin/books', {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload and save book');
  }
  return data;
}

export async function updateBookDetails(id: string, formData: FormData): Promise<Book> {
  const res = await fetch(`/api/admin/books/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders() },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update book');
  }
  return data;
}

export async function toggleBookPublish(id: string, published: boolean): Promise<Book> {
  const res = await fetch(`/api/admin/books/${id}/publish`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ published })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update publish state');
  }
  return data;
}

export async function deleteBookRecord(id: string): Promise<void> {
  const res = await fetch(`/api/admin/books/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete book');
  }
}

export async function extractPdfInfoClient(file: File): Promise<ExtractedPdfInfo> {
  const formData = new FormData();
  formData.append('pdf', file);

  const res = await fetch('/api/admin/extract-pdf-info', {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData
  });

  if (!res.ok) {
    throw new Error('Failed to analyze PDF file');
  }
  return res.json();
}

export async function createCategory(name: string, description: string): Promise<Category> {
  const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ name, description })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create category');
  }
  return data;
}

export async function updateCategory(id: string, name: string, description: string): Promise<Category> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ name, description })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update category');
  }
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete category');
  }
}
