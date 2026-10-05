import React, { useState } from 'react';
import { Search, BookOpen, Download, ArrowRight, Library, Sparkles, BookMarked } from 'lucide-react';
import { Book, Category } from '../types/library';
import { BookCard } from './BookCard';

interface HomeViewProps {
  books: Book[];
  categories: Category[];
  onOpenBook: (bookId: string) => void;
  onReadOnline: (bookId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onNavigateBooks: (searchQuery?: string) => void;
  onNavigateCategories: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  categories,
  onOpenBook,
  onReadOnline,
  onSelectCategory,
  onNavigateBooks,
  onNavigateCategories
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigateBooks(searchInput.trim());
    } else {
      onNavigateBooks();
    }
  };

  // Recent 6 books
  const recentBooks = books.slice(0, 8);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-900 bg-amber-100/70 border border-amber-900/15 px-3 py-1 rounded-full mb-6">
          <BookMarked className="w-3.5 h-3.5" />
          <span>Open Digital Repository</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.15] text-balance">
          Discover Your Next Book
        </h1>

        <p className="text-base sm:text-lg text-stone-600 mt-4 max-w-2xl mx-auto leading-relaxed">
          Read and download books from our free digital library. Accessible directly in your web browser with zero registration required.
        </p>

        {/* Large Search Box */}
        <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-sm rounded-xl overflow-hidden border border-stone-300 focus-within:border-amber-900 focus-within:ring-2 focus-within:ring-amber-900/20 bg-white">
            <div className="pl-4 text-stone-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search books, authors, or topics (e.g. money, philosophy, fiction)..."
              className="w-full px-3 py-3.5 text-sm bg-transparent focus:outline-none placeholder:text-stone-400"
            />
            <button
              type="submit"
              className="m-1.5 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </form>

        {/* Curatorial quick metadata tags */}
        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-stone-500 flex-wrap">
          <span className="text-stone-400">Popular:</span>
          {categories.slice(0, 4).map(c => (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className="hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Featured / Recent Books Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-stone-200">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-900 font-semibold block mb-1">
              Latest Additions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Featured & Recent Books
            </h2>
          </div>

          <button
            onClick={() => onNavigateBooks()}
            className="text-xs font-medium text-amber-900 hover:text-amber-950 flex items-center gap-1 group"
          >
            <span>View All ({books.length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {recentBooks.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-stone-800">Your library is empty.</h3>
            <p className="text-xs text-stone-500 mt-1">
              Log in to the administrator portal to upload your first PDF books.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onOpenBook={onOpenBook}
                onReadOnline={onReadOnline}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </div>
        )}
      </section>

      {/* Categories Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-stone-200">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-900 font-semibold block mb-1">
              Browse by Subject
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Explore Collections
            </h2>
          </div>

          <button
            onClick={onNavigateCategories}
            className="text-xs font-medium text-amber-900 hover:text-amber-950 flex items-center gap-1 group"
          >
            <span>All Categories ({categories.length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {categories.slice(0, 12).map(cat => {
            const count = books.filter(b => b.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-4 bg-white hover:bg-stone-50 border border-stone-200 hover:border-amber-900/40 rounded-lg text-left transition-all flex flex-col justify-between"
              >
                <div className="font-serif text-sm font-semibold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1 mb-1">
                  {cat.name}
                </div>
                <div className="text-[11px] font-mono tabular-nums text-stone-400">
                  {count} {count === 1 ? 'book' : 'books'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Reader Guarantee Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F0] border border-amber-900/15 rounded-xl p-8 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-stone-900 text-amber-50 rounded-lg shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Read Directly in Browser
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Open any book with our fast in-browser reader featuring page navigation, zoom, and full-screen view.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-stone-900 text-amber-50 rounded-lg shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Download Full PDFs
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Save actual PDF files directly to your device for offline reading on your tablet, phone, or e-reader.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-stone-900 text-amber-50 rounded-lg shrink-0">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Free and Open Access
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  No accounts, no credit cards, and no paywalls. Built for learners, students, and readers worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
