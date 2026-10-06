import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FolderTree, 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert,
  Layers,
  FileCheck,
  FileX,
  RefreshCw
} from 'lucide-react';
import { Book, Category, AdminStats } from '../types/library';
import { 
  fetchAdminStats, 
  fetchAdminBooks, 
  toggleBookPublish, 
  deleteBookRecord, 
  formatDate,
  formatFileSize
} from '../lib/api';
import { ConfirmationModal } from './ConfirmationModal';
import { CategoryManager } from './CategoryManager';

interface AdminDashboardProps {
  categories: Category[];
  onRefreshCategories: () => Promise<void>;
  onRefreshBooks: () => Promise<void>;
  onAddNewBook: () => void;
  onEditBook: (book: Book) => void;
  onViewBookPublic: (bookId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  onRefreshCategories,
  onRefreshBooks,
  onAddNewBook,
  onEditBook,
  onViewBookPublic
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'categories'>('books');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, booksData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminBooks({
          category: selectedCategory,
          search: searchQuery
        })
      ]);
      setStats(statsData);
      setBooks(booksData);
    } catch (err: any) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const handleTogglePublish = async (book: Book) => {
    try {
      const updated = await toggleBookPublish(book.id, !book.published);
      setBooks(prev => prev.map(b => (b.id === book.id ? updated : b)));
      setStatusMessage(`Book "${book.title}" is now ${updated.published ? 'Published' : 'Unpublished'}.`);
      // Update global application state so public website syncs immediately
      await onRefreshBooks();
      fetchAdminStats().then(setStats);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(`Error toggling publish state: ${err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      setIsDeleting(true);
      await deleteBookRecord(bookToDelete.id);
      setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
      setStatusMessage(`Book "${bookToDelete.title}" and its PDF file have been deleted.`);
      setBookToDelete(null);
      // Immediately refresh global books so public website reflects deletion
      await onRefreshBooks();
      fetchAdminStats().then(setStats);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(`Error deleting book: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Admin Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Librarian Administration
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your digital library catalog, upload PDF manuscripts, and oversee subject categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh records"
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={onAddNewBook}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Mandatory Copyright Note */}
      <div className="bg-amber-50/80 border border-amber-900/15 rounded-lg p-4 text-xs text-stone-700 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-stone-900 block mb-0.5">
            Legal & Copyright Distribution Requirement
          </span>
          <p className="text-stone-600 text-[11px] leading-relaxed">
            Only upload books that you own, are authorized to distribute, are in the public domain, or are distributed under a license that allows redistribution.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Books</span>
            <BookOpen className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
            {stats ? stats.totalBooks : '—'}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">In local repository</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Categories</span>
            <FolderTree className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
            {stats ? stats.totalCategories : '—'}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Subject classifications</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Published</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
            {stats ? stats.publishedBooks : '—'}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Live on public website</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Unpublished</span>
            <FileX className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
            {stats ? stats.unpublishedBooks : '—'}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Drafts / hidden books</span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs: Books Management vs Category Management */}
      <div className="border-b border-stone-200 flex items-center gap-8 text-sm">
        <button
          onClick={() => setActiveTab('books')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'books'
              ? 'border-amber-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Books Management ({stats?.totalBooks ?? books.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-amber-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Category Management ({categories.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' ? (
        <CategoryManager
          categories={categories}
          onRefreshCategories={onRefreshCategories}
        />
      ) : (
        <div className="space-y-4">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search title, author, or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-900"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-900"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-xs text-stone-400">
                Loading books...
              </div>
            ) : books.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h4 className="font-serif text-base text-stone-800 font-medium">No books found</h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'No books matched your query. Try resetting your search filter.'
                    : 'Your library is empty. Click "Add New Book" to upload your first PDF book.'}
                </p>
                <button
                  onClick={onAddNewBook}
                  className="mt-4 px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors"
                >
                  Upload First Book
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12">Cover</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Catalog Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {books.map(book => (
                      <tr key={book.id} className="hover:bg-stone-50/70 transition-colors">
                        
                        {/* Cover Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="w-9 h-12 bg-stone-200 rounded border border-stone-300 overflow-hidden shrink-0 flex items-center justify-center">
                            {book.cover_url ? (
                              <img
                                src={book.cover_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                        </td>

                        {/* Title & Author */}
                        <td className="py-3 px-4">
                          <span className="font-serif text-sm font-semibold text-stone-900 block">
                            {book.title}
                          </span>
                          <span className="text-stone-500 italic block">
                            {book.author || 'Unknown Author'}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono tabular-nums">
                            {book.page_count}p · {formatFileSize(book.file_size)}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-stone-700">
                          {book.category_name || 'Uncategorized'}
                        </td>

                        {/* Status (Publish / Unpublish toggle) */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleTogglePublish(book)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              book.published
                                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-300'
                            }`}
                            title="Click to toggle publish status"
                          >
                            {book.published ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-stone-400" />
                                <span>Unpublished</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Date Added */}
                        <td className="py-3 px-4 text-stone-500 font-mono text-[11px] tabular-nums whitespace-nowrap">
                          {formatDate(book.created_at)}
                        </td>

                        {/* Actions: View, Edit, Delete */}
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          {book.published && (
                            <button
                              onClick={() => onViewBookPublic(book.id)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                              title="View Public Book Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onEditBook(book)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                            title="Edit Book Details or replace PDF"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setBookToDelete(book)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete Book & files"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(bookToDelete)}
        title={`Delete "${bookToDelete?.title}"?`}
        message="Are you sure you want to delete this book? This will permanently delete the book record and remove the associated PDF and cover files from storage. This action cannot be undone."
        confirmLabel="Delete Book"
        onConfirm={handleConfirmDelete}
        onCancel={() => setBookToDelete(null)}
        isSubmitting={isDeleting}
      />

    </div>
  );
};
