import React, { useState } from 'react';
import { Search, ShieldCheck, LogOut, BookOpen, X, Menu, Compass, Layers, Info } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      onSearchSubmit(query);
      setShowSearchModal(false);
      setMobileMenuOpen(false);
    }
  };

  const isNavActive = (viewName: 'home' | 'books' | 'categories' | 'admin') => {
    if (viewName === 'home' && currentView.type === 'home') return true;
    if (viewName === 'books' && currentView.type === 'books') return true;
    if (viewName === 'categories' && currentView.type === 'categories') return true;
    if (viewName === 'admin' && (currentView.type === 'admin' || currentView.type === 'admin-login')) return true;
    return false;
  };

  return (
    <header className="w-full bg-[#F8F8F4] text-[#292A27] border-b border-[#E8E8E2] sticky top-0 z-40 transition-colors select-none">
      
      {/* 1. Subtle Minimal Top Announcement & Account Strip */}
      <div className="border-b border-[#E8E8E2]/70 bg-[#F4F4EE]/60 text-[11px] font-sans text-[#85857E] px-4 sm:px-8 lg:px-12 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C98187]" />
            <span className="font-medium tracking-wide">Open-Access Digital Commons</span>
          </span>
          <span className="hidden sm:inline text-[#DDE0D5]">|</span>
          <span className="hidden sm:inline">100% Free · Direct PDF Reading & Downloads</span>
        </div>

        <div className="flex items-center gap-4">
          {totalBooks > 0 && (
            <span className="hidden md:inline font-mono text-[10.5px] text-[#85857E]">
              {totalBooks} Titles Indexed
            </span>
          )}
          {isAdmin ? (
            <button
              onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
              className="hover:text-[#292A27] text-[#C98187] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate({ type: 'admin-login' })}
              className="hover:text-[#C98187] cursor-pointer transition-colors"
            >
              Librarian Sign In
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Bookstore Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* LEFT: Library Brand / Bookstore Logo */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            aria-label="OpenBook Digital Library Home"
          >
            <div className="w-9 h-9 rounded-lg bg-[#292A27] text-[#F8F8F4] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <BookOpen className="w-4.5 h-4.5 text-[#E8EAE2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#292A27] leading-none">
                OpenBook
              </span>
              <span className="text-[9px] tracking-[0.24em] font-medium text-[#85857E] uppercase font-sans mt-0.5">
                Digital Library
              </span>
            </div>
          </button>

          {/* CENTER: Clean Bookstore Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs font-semibold tracking-[0.14em] uppercase text-[#292A27]">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={`py-1 transition-colors cursor-pointer relative group ${
                isNavActive('home') ? 'text-[#C98187]' : 'text-[#292A27] hover:text-[#C98187]'
              }`}
            >
              <span>Home</span>
              {isNavActive('home') && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C98187] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onNavigate({ type: 'books' })}
              className={`py-1 transition-colors cursor-pointer relative group ${
                isNavActive('books') ? 'text-[#C98187]' : 'text-[#292A27] hover:text-[#C98187]'
              }`}
            >
              <span>Browse Books</span>
              {isNavActive('books') && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C98187] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onNavigate({ type: 'categories' })}
              className={`py-1 transition-colors cursor-pointer relative group ${
                isNavActive('categories') ? 'text-[#C98187]' : 'text-[#292A27] hover:text-[#C98187]'
              }`}
            >
              <span>Categories</span>
              {isNavActive('categories') && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C98187] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onOpenAbout?.()}
              className="py-1 text-[#292A27] hover:text-[#C98187] transition-colors cursor-pointer"
            >
              <span>About</span>
            </button>
          </nav>

          {/* RIGHT: Quick Search, Admin Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Quick Search Trigger */}
            <button
              onClick={() => {
                const searchEl = document.getElementById('hero-search-input');
                if (searchEl) {
                  searchEl.focus();
                  searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  setShowSearchModal(true);
                }
              }}
              className="p-2 text-[#292A27] hover:text-[#C98187] hover:bg-[#E8EAE2]/50 rounded-full transition-colors cursor-pointer"
              aria-label="Search collection"
              title="Search collection"
            >
              <Search className="w-4.5 h-4.5 stroke-[2.2]" />
            </button>

            {/* Admin Portal Button */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
                  className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#292A27] text-white hover:bg-[#3E403B] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E8EAE2]" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Sign out of librarian account"
                  className="p-1.5 text-[#85857E] hover:text-[#292A27] hover:bg-[#E8EAE2]/50 rounded-full transition-colors cursor-pointer"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate({ type: 'admin-login' })}
                className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold rounded-full border border-[#DDE0D5] text-[#292A27] hover:border-[#C98187] hover:text-[#C98187] bg-white transition-colors cursor-pointer shadow-2xs font-sans"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#292A27] hover:bg-[#E8EAE2]/50 rounded-lg cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8E8E2] space-y-3 bg-[#F8F8F4] animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-[#85857E] absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search books, authors..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E8E8E2] rounded-full text-[#292A27] placeholder-[#85857E] focus:outline-none focus:border-[#C98187]"
              />
            </form>

            <div className="flex flex-col space-y-1 text-xs font-semibold tracking-wider uppercase text-[#292A27] pt-1">
              <button
                onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                  isNavActive('home') ? 'bg-[#E8EAE2] text-[#292A27]' : 'hover:bg-[#E8EAE2]/50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate({ type: 'books' }); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                  isNavActive('books') ? 'bg-[#E8EAE2] text-[#292A27]' : 'hover:bg-[#E8EAE2]/50'
                }`}
              >
                Browse Books ({totalBooks})
              </button>
              <button
                onClick={() => { onNavigate({ type: 'categories' }); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                  isNavActive('categories') ? 'bg-[#E8EAE2] text-[#292A27]' : 'hover:bg-[#E8EAE2]/50'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => { onOpenAbout?.(); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-[#E8EAE2]/50 transition-colors"
              >
                About the Library
              </button>
              <button
                onClick={() => { onNavigate(isAdmin ? { type: 'admin' } : { type: 'admin-login' }); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-[#E8EAE2]/50 text-[#C98187] transition-colors"
              >
                {isAdmin ? 'Admin Dashboard' : 'Librarian Sign In'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Floating Quick Search Modal if invoked outside home */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#E8E8E2] shadow-2xl w-full max-w-xl p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E2]">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#85857E] uppercase">
                <Search className="w-4 h-4 text-[#C98187]" />
                <span>Search Digital Library</span>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full text-[#85857E] hover:text-[#292A27] hover:bg-[#E8EAE2]/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Type book title, author, or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-[#F8F8F4] border border-[#E8E8E2] rounded-xl text-[#292A27] placeholder-[#85857E] focus:outline-none focus:border-[#C98187] focus:ring-1 focus:ring-[#C98187]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#292A27] text-white text-xs font-semibold tracking-wider uppercase rounded-xl hover:bg-[#3E403B] transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

    </header>
  );
};
