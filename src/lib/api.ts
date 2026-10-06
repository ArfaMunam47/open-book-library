import { Book, Category, AdminStats, SortOption, ExtractedPdfInfo, DetectedBookMetadata } from '../types/library';

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
  // Cache buster parameter
  searchParams.set('_t', String(Date.now()));

  const query = searchParams.toString();
  const url = `/api/books?${query}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  if (!res.ok) {
    throw new Error('Failed to load books');
  }
  return res.json();
}

export async function fetchBookById(id: string): Promise<Book> {
  const res = await fetch(`/api/books/${id}?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  if (!res.ok) {
    throw new Error('Book not found or failed to load');
  }
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`/api/categories?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  if (!res.ok) {
    throw new Error('Failed to load categories');
  }
  return res.json();
}

export function getDownloadUrl(bookId: string): string {
  return `/api/download/${bookId}`;
}

export function getPdfStreamUrl(bookId: string): string {
  return `/api/pdf/${bookId}`;
}

function clientSlugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Downloads the book PDF securely using browser Blob creation.
 * This guarantees the user receives the real PDF binary file and completely avoids
 * proxy cookie-check / iframe navigation challenges.
 */
export async function downloadBookPdf(bookId: string, customTitle?: string): Promise<void> {
  const url = `/api/download/${bookId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download book (Status: ${res.status})`);
  }

  // Extract filename from header or construct from book title
  let filename = customTitle ? `${clientSlugify(customTitle)}.pdf` : `book-${bookId}.pdf`;
  const disposition = res.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '').trim();
    }
  }

  const blob = await res.blob();
  const pdfBlob = new Blob([blob], { type: 'application/pdf' });
  const blobUrl = window.URL.createObjectURL(pdfBlob);

  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  }, 4000);
}

/**
 * Fetches PDF binary bytes with real-time download progress tracking.
 */
export function fetchPdfArrayBuffer(
  bookId: string,
  onProgress?: (percent: number) => void
): Promise<ArrayBuffer> {
  const url = `/api/download/${bookId}`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';

    if (xhr.onprogress) {
      xhr.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0 && onProgress) {
          const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve(xhr.response as ArrayBuffer);
      } else {
        reject(new Error(`Failed to load PDF manuscript (Status: ${xhr.status})`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error loading PDF document.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Timed out loading PDF document.'));
    };

    xhr.timeout = 180000; // 3 minutes timeout for reading large books
    xhr.send();
  });
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
  const res = await fetch(`/api/admin/stats?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      ...getAuthHeaders(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
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
  searchParams.set('_t', String(Date.now()));

  const query = searchParams.toString();
  const url = `/api/admin/books?${query}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      ...getAuthHeaders(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin book records');
  }
  return res.json();
}

/**
 * Analyzes uploaded PDF to automatically detect author, title, category, ISBN, publisher, and year.
 */
export async function analyzeBookPdf(file: File): Promise<DetectedBookMetadata> {
  const formData = new FormData();
  formData.append('pdf', file);

  const res = await fetch('/api/admin/analyze-book', {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to analyze book metadata');
  }
  return data;
}

/**
 * On-demand description generation / regeneration
 */
export async function generateBookDescriptionApi(params: {
  bookId?: string;
  title?: string;
  author?: string;
  categoryId?: string;
}): Promise<string> {
  const res = await fetch('/api/admin/generate-description', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate description');
  }
  return data.description;
}

export function uploadNewBook(
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<Book> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/books');

    const token = getAdminToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('x-admin-token', token);
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let data: any = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = { error: xhr.responseText || 'Server returned an unreadable response.' };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve(data as Book);
      } else if (xhr.status === 401) {
        reject(new Error('Your administrator session has expired or is invalid. Please log in again.'));
      } else if (xhr.status === 409) {
        const err: any = new Error(data?.error || 'Possible duplicate book already exists in library catalog.');
        err.isDuplicate = true;
        err.duplicateReason = data?.reason;
        err.matchedBook = data?.matchedBook;
        reject(err);
      } else if (xhr.status === 413) {
        reject(new Error('The uploaded PDF exceeds the file size limit (maximum 100 MB).'));
      } else {
        const errorMsg = data?.error || `Upload failed with status ${xhr.status}: ${xhr.statusText || 'Unknown error'}`;
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error: Unable to connect to library server. Please check your internet connection and try again.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out after 5 minutes. The PDF may be too large for your current connection speed.'));
    };

    xhr.timeout = 300000; // 5 minutes timeout for large books
    xhr.send(formData);
  });
}

export function updateBookDetails(
  id: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<Book> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/api/admin/books/${id}`);

    const token = getAdminToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('x-admin-token', token);
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let data: any = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = { error: xhr.responseText || 'Server returned an unreadable response.' };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve(data as Book);
      } else if (xhr.status === 401) {
        reject(new Error('Your administrator session has expired. Please log in again.'));
      } else if (xhr.status === 413) {
        reject(new Error('The uploaded file exceeds the file size limit (maximum 100 MB).'));
      } else {
        const errorMsg = data?.error || `Update failed with status ${xhr.status}`;
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error: Unable to connect to library server. Please check your internet connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Update request timed out after 5 minutes.'));
    };

    xhr.timeout = 300000;
    xhr.send(formData);
  });
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
