import React, { useState } from 'react';
import { Search, ShieldCheck, LogOut, Library, ChevronDown, BookOpen, Sparkles, Info, X } from 'lucide-react';
import { ActiveView, Category } from '../types/library';

interface HeaderProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  isAdmin: boolean;
  onAdminLogout: () => void;
  onSearchSubmit: (query: string, categoryId?: string) => void;
  categories?: Category[];
  totalBooks?: number;
  onOpenAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isAdmin,
  onAdminLogout,
  onSearchSubmit,
  categories = [],
  totalBooks = 0,
  onOpenAbout
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    const cat = selectedCategory !== 'all' ? selectedCategory : undefined;
    onSearchSubmit(query, cat);
  };

  const isNavActive = (viewName: 'home' | 'books' | 'categories' | 'admin') => {
    if (viewName === 'home' && currentView.type === 'home') return true;
    if (viewName === 'books' && currentView.type === 'books') return true;
    if (viewName === 'categories' && currentView.type === 'categories') return true;
    if (viewName === 'admin' && (currentView.type === 'admin' || currentView.type === 'admin-login')) return true;
    return false;
  };

  // Top categories for the quick navigation strip (only categories with books or first 6)
  const popularCategories = categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/98 backdrop-blur-md border-b border-stone-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      {/* 1. Bookstore Top Utility Strip */}
      <div className="bg-stone-900 text-stone-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-stone-200">Free Open-Access Digital Bookstore</span>
            <span className="hidden sm:inline text-stone-500">•</span>
            <span className="hidden sm:inline text-stone-400">Complete PDF Downloads & Instant Browser Reader</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            {totalBooks > 0 && (
              <span className="font-mono text-[10px] tracking-wide text-amber-200/90 bg-stone-800 px-2 py-0.5 rounded border border-stone-700/60">
                {totalBooks} {totalBooks === 1 ? 'Book Cataloged' : 'Books Cataloged'}
              </span>
            )}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="hover:text-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3 h-3 text-stone-400" />
                <span>About Library</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
          
          {/* Brand Logo & Wordmark */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-3 text-left group focus:outline-none shrink-0 cursor-pointer"
            aria-label="Open Book Library home"
          >
            <div className="w-10 h-10 rounded-lg bg-stone-900 text-amber-100 flex items-center justify-center shadow-sm group-hover:bg-amber-950 transition-colors border border-amber-900/30">
              <Library className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-black tracking-tight text-stone-900 group-hover:text-amber-950 transition-colors leading-none">
                OpenBook
              </span>
              <span className="text-[10px] tracking-[0.2em] font-bold text-amber-900/80 uppercase mt-0.5 font-sans">
                Digital Library
              </span>
            </div>
          </button>

          {/* Bookstore Search Bar with Embedded Category Selector */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl items-center bg-white border border-stone-300 rounded-lg shadow-xs hover:border-stone-400 focus-within:border-amber-900 focus-within:ring-2 focus-within:ring-amber-900/15 transition-all overflow-hidden"
          >
            {/* Category Dropdown */}
            <div className="relative shrink-0 border-r border-stone-200 bg-stone-50/70">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs font-medium text-stone-700 bg-transparent focus:outline-none cursor-pointer max-w-[140px] truncate"
                aria-label="Filter search by category"
              >
                <option value="all">All Subjects</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Keyword Input */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder={
                  totalBooks > 0 
                    ? `Search ${totalBooks} books by title, author, or keyword...` 
                    : 'Search books by title, author, or topic...'
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="p-1 mr-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-amber-950 text-amber-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>

          {/* Navigation Links & Admin Controls */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-stone-700">
              <button
                onClick={() => onNavigate({ type: 'home' })}
                className={`transition-colors hover:text-stone-950 cursor-pointer ${
                  isNavActive('home') ? 'text-amber-950 font-bold border-b-2 border-amber-900 pb-1' : 'pb-1'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate({ type: 'books' })}
                className={`transition-colors hover:text-stone-950 cursor-pointer ${
                  isNavActive('books') ? 'text-amber-950 font-bold border-b-2 border-amber-900 pb-1' : 'pb-1'
                }`}
              >
                Browse Books
              </button>
              <button
                onClick={() => onNavigate({ type: 'categories' })}
                className={`transition-colors hover:text-stone-950 cursor-pointer ${
                  isNavActive('categories') ? 'text-amber-950 font-bold border-b-2 border-amber-900 pb-1' : 'pb-1'
                }`}
              >
                Categories
              </button>
              {onOpenAbout && (
                <button
                  onClick={onOpenAbout}
                  className="transition-colors hover:text-stone-950 cursor-pointer pb-1"
                >
                  About
                </button>
              )}
            </nav>

            {/* Admin Portal Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    isNavActive('admin')
                      ? 'bg-amber-900 text-white'
                      : 'bg-stone-800 text-stone-100 hover:bg-stone-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Sign out of admin"
                  className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 rounded-md transition-colors cursor-pointer"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate({ type: 'admin-login' })}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 border border-stone-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                Admin Login
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-md cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <div className="w-4 h-3.5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-stone-700 rounded-full" />
                <span className="w-full h-0.5 bg-stone-700 rounded-full" />
                <span className="w-full h-0.5 bg-stone-700 rounded-full" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="md:hidden pb-3 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search books, authors..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* 3. Bookstore Secondary Category Navigation Bar */}
      <div className="bg-[#F5F2EB] border-t border-stone-200/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-stone-600">
            <span className="font-semibold text-stone-800 uppercase tracking-wider text-[10px] hidden sm:inline">
              Explore Subjects:
            </span>
            <button
              onClick={() => onNavigate({ type: 'books' })}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap cursor-pointer ${
                currentView.type === 'books' && !currentView.categoryId ? 'font-bold text-amber-950' : ''
              }`}
            >
              All Books
            </button>
            {popularCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate({ type: 'books', categoryId: cat.id })}
                className={`hover:text-stone-950 transition-colors whitespace-nowrap cursor-pointer ${
                  currentView.type === 'books' && currentView.categoryId === cat.id ? 'font-bold text-amber-950 underline underline-offset-4' : ''
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate({ type: 'categories' })}
            className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ml-auto"
          >
            All Categories ({categories.length}) →
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-50 border-t border-stone-200 p-4 space-y-3">
          <div className="flex flex-col gap-2 text-sm font-medium text-stone-800">
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-2 hover:bg-stone-200 rounded"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate({ type: 'books' });
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-2 hover:bg-stone-200 rounded"
            >
              Browse Books ({totalBooks})
            </button>
            <button
              onClick={() => {
                onNavigate({ type: 'categories' });
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-2 hover:bg-stone-200 rounded"
            >
              Subject Categories ({categories.length})
            </button>
            {onOpenAbout && (
              <button
                onClick={() => {
                  onOpenAbout();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 px-2 hover:bg-stone-200 rounded"
              >
                About Library
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
