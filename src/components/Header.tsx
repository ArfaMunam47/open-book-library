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

  const isHome = currentView.type === 'home';
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F5E9]/95 backdrop-blur-md border-b border-[#E5DEC9] text-[#153C32] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* LEFT: Elegant open-book icon & OpenBook Library brand in deep forest green */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0 cursor-pointer"
            aria-label="OpenBook Library Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#153C32] text-[#F8F5E9] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <BookOpen className="w-4 h-4 text-[#C76A32]" />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#153C32]">
              OpenBook Library
            </span>
          </button>

          {/* MIDDLE: Discover, All Books, Categories */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#526058]">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={`py-1 transition-colors cursor-pointer hover:text-[#153C32] ${
                isNavActive('home') ? 'text-[#153C32] font-semibold' : ''
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => onNavigate({ type: 'books' })}
              className={`py-1 transition-colors cursor-pointer hover:text-[#153C32] ${
                isNavActive('books') ? 'text-[#153C32] font-semibold' : ''
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => onNavigate({ type: 'categories' })}
              className={`py-1 transition-colors cursor-pointer hover:text-[#153C32] ${
                isNavActive('categories') ? 'text-[#153C32] font-semibold' : ''
              }`}
            >
              Categories
            </button>
          </nav>

          {/* RIGHT: Search icon & Admin portal */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search toggler / input */}
            <div className="relative flex items-center">
              {searchOpen ? (
                <form
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setSearchOpen(false);
                  }}
                  className="flex items-center bg-white border border-[#D5CFBE] rounded-full px-3 py-1.5 shadow-xs text-xs animate-in fade-in duration-200"
                >
                  <Search className="w-3.5 h-3.5 text-[#526058] mr-2 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search library..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-40 sm:w-52 text-xs text-[#153C32] placeholder-[#526058]/70 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearchOpen(false);
                    }}
                    className="text-[#526058] hover:text-[#153C32] ml-1 p-0.5 cursor-pointer"
                    title="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[#153C32] hover:text-[#C76A32] hover:bg-[#EFECE0] rounded-full transition-colors cursor-pointer"
                  title="Search library"
                  aria-label="Search library"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Admin Link / Portal */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#153C32] text-[#F8F5E9] hover:bg-[#1B4B3E] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C76A32]" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Sign out of admin"
                  className="p-1.5 text-[#526058] hover:text-[#153C32] hover:bg-[#EFECE0] rounded-full transition-colors cursor-pointer"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate({ type: 'admin-login' })}
                className="text-xs font-medium text-[#153C32] hover:text-[#C76A32] py-1.5 px-3 rounded-full hover:bg-[#EFECE0] transition-colors cursor-pointer"
              >
                Admin
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#153C32] hover:bg-[#EFECE0] rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <div className="w-4 h-3.5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-[#153C32] rounded-full" />
                <span className="w-full h-0.5 bg-[#153C32] rounded-full" />
                <span className="w-full h-0.5 bg-[#153C32] rounded-full" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8E4D5] space-y-3 bg-[#F8F6EC]">
            <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Search books, authors..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-[#D5CFBE] bg-white rounded-lg text-[#103D30] placeholder-[#64736B]/70"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#103D30] text-[#F8F6EC] text-xs font-medium rounded-lg"
              >
                Search
              </button>
            </form>
            <div className="flex flex-col space-y-2 text-sm font-medium">
              <button
                onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#103D30] hover:text-[#D98219]"
              >
                Discover
              </button>
              <button
                onClick={() => { onNavigate({ type: 'books' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#103D30] hover:text-[#D98219]"
              >
                All Books
              </button>
              <button
                onClick={() => { onNavigate({ type: 'categories' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#103D30] hover:text-[#D98219]"
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
