import React, { useState } from 'react';
import { Search, ShieldCheck, LogOut, Library, ChevronDown, BookOpen, Info, X } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
      
      {/* 1. Top Utility Strip */}
      <div className="bg-[#191919] text-stone-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF3038] animate-pulse" />
            <span className="font-medium text-stone-100">OpenBook Digital Library</span>
            <span className="hidden sm:inline text-stone-500">•</span>
            <span className="hidden sm:inline text-stone-400">100% Free Public Access & Full-File PDF Downloads</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            {totalBooks > 0 && (
              <span className="font-mono text-[10px] tracking-wide text-white bg-stone-800 px-2 py-0.5 rounded border border-stone-700/80">
                {totalBooks} {totalBooks === 1 ? 'Volume' : 'Volumes'} Preserved
              </span>
            )}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
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
            aria-label="OpenBook Digital Library Home"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF3038] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <Library className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-black tracking-tight text-[#191919] group-hover:text-[#FF3038] transition-colors leading-none">
                OpenBook
              </span>
              <span className="text-[10px] tracking-[0.2em] font-bold text-[#FF3038] uppercase mt-0.5 font-sans">
                Digital Library
              </span>
            </div>
          </button>

          {/* Bookstore Search Bar with Embedded Category Selector */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl items-center bg-stone-50 border border-stone-200 rounded-full shadow-xs hover:border-stone-400 focus-within:border-[#FF3038] focus-within:ring-2 focus-within:ring-red-500/15 transition-all overflow-hidden"
          >
            {/* Category Dropdown */}
            <div className="relative shrink-0 border-r border-stone-200">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-7 py-2.5 text-xs font-medium text-stone-700 bg-transparent focus:outline-none cursor-pointer max-w-[140px] truncate"
                aria-label="Filter search by category"
              >
                <option value="all">All Subjects</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-3.5 pointer-events-none" />
            </div>

            {/* Keyword Input */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder={
                  totalBooks > 0 
                    ? `Search ${totalBooks} books by title or author...` 
                    : 'Search books by title or author...'
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-[#191919] placeholder:text-stone-400 focus:outline-none bg-transparent"
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
              className="px-5 py-2.5 bg-[#FF3038] hover:bg-[#E52028] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer rounded-r-full"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>

          {/* Navigation Links & Admin Controls */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#626262]">
              <button
                onClick={() => onNavigate({ type: 'home' })}
                className={`transition-colors hover:text-[#191919] cursor-pointer pb-1 ${
                  isNavActive('home') ? 'text-[#FF3038] font-bold border-b-2 border-[#FF3038]' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate({ type: 'books' })}
                className={`transition-colors hover:text-[#191919] cursor-pointer pb-1 ${
                  isNavActive('books') ? 'text-[#FF3038] font-bold border-b-2 border-[#FF3038]' : ''
                }`}
              >
                Browse Books
              </button>
              <button
                onClick={() => onNavigate({ type: 'categories' })}
                className={`transition-colors hover:text-[#191919] cursor-pointer pb-1 ${
                  isNavActive('categories') ? 'text-[#FF3038] font-bold border-b-2 border-[#FF3038]' : ''
                }`}
              >
                Categories
              </button>
            </nav>

            {/* Admin Portal Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    isNavActive('admin')
                      ? 'bg-[#FF3038] text-white'
                      : 'bg-stone-900 text-stone-100 hover:bg-stone-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Sign out of admin"
                  className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate({ type: 'admin-login' })}
                className="px-4 py-2 text-xs font-semibold text-[#191919] hover:text-white hover:bg-[#191919] border border-stone-300 rounded-full transition-colors whitespace-nowrap cursor-pointer"
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

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Search books..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF3038] text-white text-xs font-semibold rounded-lg"
              >
                Search
              </button>
            </form>
            <div className="flex flex-col space-y-2 text-sm font-semibold">
              <button
                onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#191919] hover:text-[#FF3038]"
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate({ type: 'books' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#191919] hover:text-[#FF3038]"
              >
                Browse Books
              </button>
              <button
                onClick={() => { onNavigate({ type: 'categories' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#191919] hover:text-[#FF3038]"
              >
                Categories
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
