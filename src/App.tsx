import React, { useState, useEffect, useCallback } from 'react';
import { Book, Category, ActiveView } from './types/library';
import { 
  fetchBooks, 
  fetchCategories, 
  checkAdminSession, 
  adminLogout 
} from './lib/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { BooksCatalog } from './components/BooksCatalog';
import { CategoriesView } from './components/CategoriesView';
import { BookDetails } from './components/BookDetails';
import { PDFReader } from './components/PDFReader';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { BookForm } from './components/BookForm';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>({ type: 'home' });
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Initial load
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [booksData, categoriesData, authenticated] = await Promise.all([
        fetchBooks(),
        fetchCategories(),
        checkAdminSession()
      ]);
      setBooks(booksData);
      setCategories(categoriesData);
      setIsAdmin(authenticated);
    } catch (err: any) {
      console.error('Error loading initial library data:', err);
      showToast('Could not load library catalog. Check server connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Sync with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (!hash || hash === '/') {
        setCurrentView({ type: 'home' });
      } else if (hash.startsWith('/books')) {
        const queryParams = new URLSearchParams(hash.split('?')[1] || '');
        const search = queryParams.get('q') || undefined;
        const categoryId = queryParams.get('cat') || undefined;
        setCurrentView({ type: 'books', search, categoryId });
      } else if (hash.startsWith('/categories')) {
        setCurrentView({ type: 'categories' });
      } else if (hash.startsWith('/book/')) {
        const bookId = hash.replace('/book/', '');
        setCurrentView({ type: 'book-details', bookId });
      } else if (hash.startsWith('/read/')) {
        const bookId = hash.replace('/read/', '');
        setCurrentView({ type: 'pdf-reader', bookId });
      } else if (hash.startsWith('/admin')) {
        if (hash === '/admin/login') {
          setCurrentView({ type: 'admin-login' });
        } else {
          setCurrentView({ type: 'admin', subview: 'books' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // run on mount if hash present
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ActiveView) => {
    setCurrentView(view);
    // Update hash for back/forward support
    if (view.type === 'home') {
      window.location.hash = '/';
    } else if (view.type === 'books') {
      const q = view.search ? `?q=${encodeURIComponent(view.search)}` : '';
      window.location.hash = `/books${q}`;
    } else if (view.type === 'categories') {
      window.location.hash = '/categories';
    } else if (view.type === 'book-details') {
      window.location.hash = `/book/${view.bookId}`;
    } else if (view.type === 'pdf-reader') {
      window.location.hash = `/read/${view.bookId}`;
    } else if (view.type === 'admin') {
      window.location.hash = '/admin';
    } else if (view.type === 'admin-login') {
      window.location.hash = '/admin/login';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    await adminLogout();
    setIsAdmin(false);
    showToast('Signed out of librarian administrator account.');
    navigateTo({ type: 'home' });
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    showToast('Successfully authenticated as librarian administrator.');
    navigateTo({ type: 'admin', subview: 'books' });
  };

  const handleRefreshCategories = async () => {
    try {
      const updated = await fetchCategories();
      setCategories(updated);
    } catch (err) {
      console.error('Error refreshing categories:', err);
    }
  };

  const handleRefreshBooks = async () => {
    try {
      const [booksData, categoriesData] = await Promise.all([
        fetchBooks(),
        fetchCategories()
      ]);
      setBooks(booksData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error refreshing books:', err);
    }
  };

  // Resolve current active book when in details or reader view
  const currentActiveBook = (
    currentView.type === 'book-details' || 
    currentView.type === 'pdf-reader' || 
    (currentView.type === 'admin' && currentView.subview === 'edit-book')
  ) 
    ? books.find(b => b.id === (
        currentView.type === 'book-details' 
          ? currentView.bookId 
          : currentView.type === 'pdf-reader' 
            ? currentView.bookId 
            : currentView.editingBookId
      )) 
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <div className={`p-4 rounded-lg shadow-lg border text-xs flex items-center gap-2.5 max-w-sm ${
            toast.type === 'success' 
              ? 'bg-stone-900 text-white border-stone-800' 
              : 'bg-red-900 text-white border-red-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header (hidden inside full-screen PDF reader) */}
      {currentView.type !== 'pdf-reader' && (
        <Header
          currentView={currentView}
          onNavigate={navigateTo}
          isAdmin={isAdmin}
          onAdminLogout={handleAdminLogout}
          onSearchSubmit={(q) => navigateTo({ type: 'books', search: q })}
        />
      )}

      {/* View Routing */}
      <main className="flex-1">
        {loading && books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-amber-900" />
            <p className="text-xs font-mono">Loading Open Book Library...</p>
          </div>
        ) : (
          <>
            {/* 1. Home View */}
            {currentView.type === 'home' && (
              <HomeView
                books={books}
                categories={categories}
                onOpenBook={(bookId) => navigateTo({ type: 'book-details', bookId })}
                onReadOnline={(bookId) => navigateTo({ type: 'pdf-reader', bookId })}
                onSelectCategory={(categoryId) => navigateTo({ type: 'books', categoryId })}
                onNavigateBooks={(searchQuery) => navigateTo({ type: 'books', search: searchQuery })}
                onNavigateCategories={() => navigateTo({ type: 'categories' })}
              />
            )}

            {/* 2. Books Catalog */}
            {currentView.type === 'books' && (
              <BooksCatalog
                books={books}
                categories={categories}
                initialSearch={currentView.search || ''}
                initialCategory={currentView.categoryId || 'all'}
                onOpenBook={(bookId) => navigateTo({ type: 'book-details', bookId })}
                onReadOnline={(bookId) => navigateTo({ type: 'pdf-reader', bookId })}
                onSelectCategory={(categoryId) => navigateTo({ type: 'books', categoryId })}
              />
            )}

            {/* 3. Categories View */}
            {currentView.type === 'categories' && (
              <CategoriesView
                categories={categories}
                books={books}
                onSelectCategory={(catId) => {
                  if (catId) {
                    navigateTo({ type: 'books', categoryId: catId });
                  }
                }}
                onOpenBook={(bookId) => navigateTo({ type: 'book-details', bookId })}
                onReadOnline={(bookId) => navigateTo({ type: 'pdf-reader', bookId })}
              />
            )}

            {/* 4. Book Details Page */}
            {currentView.type === 'book-details' && (
              currentActiveBook ? (
                <BookDetails
                  book={currentActiveBook}
                  onBack={() => navigateTo({ type: 'books' })}
                  onReadOnline={(bookId) => navigateTo({ type: 'pdf-reader', bookId })}
                  onSelectCategory={(categoryId) => navigateTo({ type: 'books', categoryId })}
                />
              ) : (
                <div className="max-w-md mx-auto py-24 text-center">
                  <h3 className="font-serif text-xl font-bold text-stone-900">Book Not Found</h3>
                  <p className="text-xs text-stone-500 mt-2 mb-6">
                    This book record does not exist or may have been removed.
                  </p>
                  <button
                    onClick={() => navigateTo({ type: 'books' })}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs"
                  >
                    Back to Catalog
                  </button>
                </div>
              )
            )}

            {/* 5. In-Browser PDF Reader */}
            {currentView.type === 'pdf-reader' && currentActiveBook && (
              <PDFReader
                book={currentActiveBook}
                onClose={() => navigateTo({ type: 'book-details', bookId: currentActiveBook.id })}
              />
            )}

            {/* 6. Admin Login */}
            {currentView.type === 'admin-login' && (
              <AdminLogin
                onSuccess={handleAdminLoginSuccess}
                onCancel={() => navigateTo({ type: 'home' })}
              />
            )}

            {/* 7. Admin Dashboard or New/Edit Forms */}
            {currentView.type === 'admin' && (
              !isAdmin ? (
                <AdminLogin
                  onSuccess={handleAdminLoginSuccess}
                  onCancel={() => navigateTo({ type: 'home' })}
                />
              ) : currentView.subview === 'new-book' ? (
                <BookForm
                  categories={categories}
                  onSuccess={(newBook) => {
                    handleRefreshBooks();
                    showToast(`Book "${newBook.title}" successfully added!`);
                    navigateTo({ type: 'admin', subview: 'books' });
                  }}
                  onCancel={() => navigateTo({ type: 'admin', subview: 'books' })}
                />
              ) : currentView.subview === 'edit-book' ? (
                <BookForm
                  categories={categories}
                  initialBook={currentActiveBook}
                  onSuccess={(updatedBook) => {
                    handleRefreshBooks();
                    showToast(`Book "${updatedBook.title}" updated successfully!`);
                    navigateTo({ type: 'admin', subview: 'books' });
                  }}
                  onCancel={() => navigateTo({ type: 'admin', subview: 'books' })}
                />
              ) : (
                <AdminDashboard
                  categories={categories}
                  onRefreshCategories={handleRefreshCategories}
                  onAddNewBook={() => navigateTo({ type: 'admin', subview: 'new-book' })}
                  onEditBook={(book) => navigateTo({ type: 'admin', subview: 'edit-book', editingBookId: book.id })}
                  onViewBookPublic={(bookId) => navigateTo({ type: 'book-details', bookId })}
                />
              )
            )}
          </>
        )}
      </main>

      {/* Footer (hidden inside full-screen PDF reader) */}
      {currentView.type !== 'pdf-reader' && (
        <Footer
          onNavigateHome={() => navigateTo({ type: 'home' })}
          onNavigateBooks={() => navigateTo({ type: 'books' })}
          onNavigateCategories={() => navigateTo({ type: 'categories' })}
          onNavigateAdmin={() => navigateTo(isAdmin ? { type: 'admin' } : { type: 'admin-login' })}
        />
      )}
    </div>
  );
}
