import React, { useState } from 'react';
import { Search, ShieldCheck, LogOut, BookOpen, X, Menu } from 'lucide-react';
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

  const isHome = currentView.type === 'home';

  // If on the homepage, render the exact navigation bar matching the reference image
  if (isHome) {
    return (
      <header className="w-full bg-[#F7F3EC] border-b border-[#D9CEC2]/70 text-[#181512] z-40 transition-colors">
        <div className="max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            
            {/* FAR LEFT: Outlined open book symbol + OPEN SOURCE / DIGITAL LIBRARY */}
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="flex items-center gap-3.5 text-left group focus:outline-none cursor-pointer select-none"
              aria-label="Open Source Digital Library"
            >
              <div className="text-[#181512] flex items-center justify-center transition-transform group-hover:scale-105">
                <svg 
                  viewBox="0 0 44 32" 
                  className="w-10 h-7 sm:w-11 sm:h-8 text-[#181512]" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 6c-4-3-10-4-19-4v24c9 0 15 1 19 4 4-3 10-4 19-4V2c-9 0-15 1-19 4z" />
                  <path d="M22 6v24" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-base sm:text-lg font-bold tracking-[0.08em] text-[#181512] leading-none uppercase">
                  OPEN SOURCE
                </span>
                <span className="text-[9.5px] sm:text-[10px] tracking-[0.26em] font-medium text-[#5E5852] uppercase font-sans mt-1">
                  DIGITAL LIBRARY
                </span>
              </div>
            </button>

            {/* ACROSS MIDDLE: Four navigation links (Home, Books, Collections, About) */}
            <nav className="hidden md:flex items-center gap-9 lg:gap-12 xl:gap-14 text-[15px] font-medium text-[#181512]">
              {/* Home (Active on homepage with a thin terracotta underline) */}
              <button
                onClick={() => onNavigate({ type: 'home' })}
                className="relative py-1 text-[#181512] font-semibold cursor-pointer group flex flex-col items-center"
              >
                <span>Home</span>
                <span className="h-[2px] w-6 bg-[#A52A22] rounded-full mt-1.5 inline-block" />
              </button>

              {/* Books */}
              <button
                onClick={() => onNavigate({ type: 'books' })}
                className="py-1 text-[#181512] hover:text-[#A52A22] transition-colors cursor-pointer relative group"
              >
                <span>Books</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#A52A22] transition-all duration-300 group-hover:w-full" />
              </button>

              {/* Collections */}
              <button
                onClick={() => onNavigate({ type: 'categories' })}
                className="py-1 text-[#181512] hover:text-[#A52A22] transition-colors cursor-pointer relative group"
              >
                <span>Collections</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#A52A22] transition-all duration-300 group-hover:w-full" />
              </button>

              {/* About */}
              <button
                onClick={() => onOpenAbout?.()}
                className="py-1 text-[#181512] hover:text-[#A52A22] transition-colors cursor-pointer relative group"
              >
                <span>About</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#A52A22] transition-all duration-300 group-hover:w-full" />
              </button>
            </nav>

            {/* FAR RIGHT: Search icon button + Sign in / Admin button */}
            <div className="flex items-center gap-4 sm:gap-6">
              
              {/* Simple black search icon button */}
              <button
                onClick={() => {
                  const inputEl = document.getElementById('hero-search-input');
                  if (inputEl) {
                    inputEl.focus();
                  } else {
                    onNavigate({ type: 'books' });
                  }
                }}
                className="p-2 text-[#181512] hover:text-[#A52A22] transition-colors cursor-pointer"
                title="Search Library"
                aria-label="Search Library"
              >
                <Search className="w-5 h-5 text-[#181512] stroke-[2.2]" />
              </button>

              {/* Pill-shaped Sign In / Admin button matching reference: transparent bg, thin terracotta border, dark typography */}
              {isAdmin ? (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
                    className="px-6 py-2.5 text-[15px] font-semibold rounded-full bg-transparent border border-[#A52A22] text-[#181512] hover:bg-[#A52A22]/5 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs font-sans tracking-tight"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#A52A22] shrink-0" />
                    <span>Admin</span>
                  </button>
                  <button
                    onClick={onAdminLogout}
                    title="Sign out of admin"
                    className="p-2 text-[#5E5852] hover:text-[#181512] hover:bg-neutral-200/50 rounded-full transition-colors cursor-pointer"
                    aria-label="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate({ type: 'admin-login' })}
                  className="px-6 sm:px-7 py-2.5 text-[15px] font-semibold rounded-full bg-transparent border border-[#A52A22] text-[#181512] hover:bg-[#A52A22]/5 transition-colors cursor-pointer shadow-2xs font-sans"
                >
                  Sign in
                </button>
              )}

              {/* Mobile menu toggle for smaller screens */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#181512] hover:bg-neutral-200/50 rounded-lg cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>

          {/* Mobile dropdown on home */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#D9CEC2]/60 space-y-2 animate-in fade-in duration-200">
              <button
                onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-[#A52A22] flex items-center justify-between"
              >
                <span>Home</span>
                <span className="w-2 h-2 rounded-full bg-[#A52A22]" />
              </button>
              <button
                onClick={() => { onNavigate({ type: 'books' }); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[#181512] hover:text-[#A52A22]"
              >
                Books
              </button>
              <button
                onClick={() => { onNavigate({ type: 'categories' }); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[#181512] hover:text-[#A52A22]"
              >
                Collections
              </button>
              <button
                onClick={() => { onOpenAbout?.(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[#181512] hover:text-[#A52A22]"
              >
                About
              </button>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F1]/95 backdrop-blur-md border-b border-[#F0E5D8] text-[#10243B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4 lg:gap-8">
          
          {/* LEFT: OpenBook logo (Red open-book symbol beside OpenBook DIGITAL LIBRARY) */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-3 text-left group focus:outline-none shrink-0 cursor-pointer"
            aria-label="OpenBook Digital Library Home"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F1262D] text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#10243B] leading-none">
                OpenBook
              </span>
              <span className="text-[9px] tracking-[0.22em] font-semibold text-[#77736E] uppercase font-sans mt-0.5">
                DIGITAL LIBRARY
              </span>
            </div>
          </button>

          {/* MIDDLE: Preserved Navigation Links (Library Home, Browse Books, Categories) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#77736E]">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={`py-1.5 transition-colors cursor-pointer hover:text-[#F1262D] ${
                isNavActive('home') ? 'text-[#F1262D] font-bold border-b-2 border-[#F1262D]' : 'hover:text-[#10243B]'
              }`}
            >
              Library Home
            </button>
            <button
              onClick={() => onNavigate({ type: 'books' })}
              className={`py-1.5 transition-colors cursor-pointer hover:text-[#F1262D] ${
                isNavActive('books') ? 'text-[#F1262D] font-bold border-b-2 border-[#F1262D]' : 'hover:text-[#10243B]'
              }`}
            >
              Browse Books
            </button>
            <button
              onClick={() => onNavigate({ type: 'categories' })}
              className={`py-1.5 transition-colors cursor-pointer hover:text-[#F1262D] ${
                isNavActive('categories') ? 'text-[#F1262D] font-bold border-b-2 border-[#F1262D]' : 'hover:text-[#10243B]'
              }`}
            >
              Categories
            </button>
          </nav>

          {/* RIGHT: Wide Rounded Search Field & Admin Entry */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-1 max-w-md justify-end">
            
            {/* Wide Rounded Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:flex items-center w-full max-w-xs md:max-w-sm"
            >
              <Search className="w-4 h-4 text-[#77736E] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search books, authors..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs text-[#10243B] placeholder-[#77736E] bg-white border border-[#E8DEC8] rounded-full focus:outline-none focus:border-[#F1262D] focus:ring-1 focus:ring-[#F1262D] shadow-2xs transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 text-[#77736E] hover:text-[#10243B] p-0.5"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Admin Entry or Control */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#10243B] text-white hover:bg-[#1B3654] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F1262D]" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Sign out of admin"
                  className="p-1.5 text-[#77736E] hover:text-[#10243B] hover:bg-[#FFDDD5]/50 rounded-full transition-colors cursor-pointer"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate({ type: 'admin-login' })}
                className="text-xs font-semibold text-[#10243B] hover:text-[#F1262D] py-1.5 px-3.5 rounded-full border border-[#E8DEC8] hover:border-[#F1262D] bg-white transition-colors cursor-pointer shadow-2xs"
              >
                Admin
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#10243B] hover:bg-[#FFDDD5]/50 rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#F0E5D8] space-y-4 bg-[#FFF9F1] animate-in fade-in duration-200">
            <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#77736E] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search books, authors..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-[#E8DEC8] bg-white rounded-full text-[#10243B] placeholder-[#77736E]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#F1262D] text-white text-xs font-semibold rounded-full cursor-pointer shadow-xs"
              >
                Search
              </button>
            </form>
            <div className="flex flex-col space-y-2 text-sm font-medium">
              <button
                onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg transition-colors ${
                  isNavActive('home') ? 'bg-[#FFDDD5] text-[#F1262D] font-bold' : 'text-[#10243B] hover:bg-[#FFF4E8]'
                }`}
              >
                Library Home
              </button>
              <button
                onClick={() => { onNavigate({ type: 'books' }); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg transition-colors ${
                  isNavActive('books') ? 'bg-[#FFDDD5] text-[#F1262D] font-bold' : 'text-[#10243B] hover:bg-[#FFF4E8]'
                }`}
              >
                Browse Books
              </button>
              <button
                onClick={() => { onNavigate({ type: 'categories' }); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg transition-colors ${
                  isNavActive('categories') ? 'bg-[#FFDDD5] text-[#F1262D] font-bold' : 'text-[#10243B] hover:bg-[#FFF4E8]'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => { onNavigate(isAdmin ? { type: 'admin' } : { type: 'admin-login' }); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg transition-colors ${
                  isNavActive('admin') ? 'bg-[#FFDDD5] text-[#F1262D] font-bold' : 'text-[#10243B] hover:bg-[#FFF4E8]'
                }`}
              >
                {isAdmin ? 'Admin Portal' : 'Admin Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

