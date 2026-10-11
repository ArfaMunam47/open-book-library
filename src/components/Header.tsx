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

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors ${
      isHome 
        ? 'bg-[#070e0a]/90 border-b border-[#1f3325] text-[#FAF7F0]' 
        : 'bg-[#FCFCFA]/95 border-b border-[#EAEAE6] text-[#262626]'
    }`}>
      
      {/* 1. Subtle Architectural Top Strip */}
      <div className={`border-b text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 transition-colors ${
        isHome
          ? 'border-[#1b2c20] bg-[#050b07]/80 text-[#8aa393]'
          : 'border-[#EAEAE6]/80 bg-[#F7F7F3] text-[#777777]'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E2BA60]" />
            <span className={`font-medium ${isHome ? 'text-[#FAF7F0]' : 'text-[#262626]'}`}>OpenBook Digital Library</span>
            <span className={`hidden sm:inline ${isHome ? 'text-[#2a4030]' : 'text-[#EAEAE6]'}`}>•</span>
            <span className={`hidden sm:inline ${isHome ? 'text-[#8aa393]' : 'text-[#777777]'}`}>Curated Digital Sanctuary</span>
          </div>

          <div className={`flex items-center gap-4 ${isHome ? 'text-[#8aa393]' : 'text-[#777777]'}`}>
            {totalBooks > 0 && (
              <span className={`font-mono text-[10px] tracking-wide px-2.5 py-0.5 rounded-full border ${
                isHome
                  ? 'text-[#E2BA60] bg-[#0c1811] border-[#2a4030]'
                  : 'text-[#262626] bg-[#FCFCFA] border-[#EAEAE6]'
              }`}>
                {totalBooks} {totalBooks === 1 ? 'Volume' : 'Volumes'} Shelved
              </span>
            )}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className={`hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer ${
                  isHome ? 'hover:text-[#FAF7F0]' : 'hover:text-[#262626]'
                }`}
              >
                <Info className="w-3 h-3" />
                <span>About Library</span>
              </button>
            )}
          </div>
        </div>
      </div>


      {/* 2. Main Bookstore Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4 lg:gap-8">
          
          {/* LEFT: Library Logo & Wordmark */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0 cursor-pointer"
            aria-label="OpenBook Digital Library Home"
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors ${
              isHome 
                ? 'bg-[#15251c] border border-[#304838] text-[#FAF7F0] group-hover:bg-[#1e3428]' 
                : 'bg-[#262626] text-[#FCFCFA] shadow-2xs group-hover:bg-[#111111]'
            }`}>
              <Library className={`w-4 h-4 ${isHome ? 'text-[#F5CF78]' : 'text-[#F5E8AE]'}`} />
            </div>
            <div className="flex flex-col">
              <span className={`font-serif text-xl sm:text-2xl font-black tracking-tight leading-none ${
                isHome ? 'text-[#FAF7F0]' : 'text-[#262626]'
              }`}>
                OpenBook
              </span>
              <span className={`text-[9px] tracking-[0.2em] font-medium uppercase mt-0.5 font-sans ${
                isHome ? 'text-[#8aa393]' : 'text-[#777777]'
              }`}>
                Digital Library
              </span>
            </div>
          </button>

          {/* CENTER: Clean Bookstore Navigation Links */}
          <nav className={`hidden md:flex items-center gap-8 text-xs sm:text-sm font-medium ${
            isHome ? 'text-[#9eb5a5]' : 'text-[#777777]'
          }`}>
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={`relative py-1 transition-colors cursor-pointer ${
                isHome ? 'hover:text-[#FAF7F0]' : 'hover:text-[#262626]'
              } ${
                isNavActive('home') 
                  ? (isHome ? 'text-[#FAF7F0] font-semibold' : 'text-[#262626] font-semibold') 
                  : ''
              }`}
            >
              <span>Library Home</span>
              {isNavActive('home') && (
                <span className={`absolute -bottom-1 left-0 right-0 h-[2px] rounded-full ${
                  isHome ? 'bg-[#F5CF78]' : 'bg-[#262626]'
                }`} />
              )}
            </button>
            <button
              onClick={() => onNavigate({ type: 'books' })}
              className={`relative py-1 transition-colors cursor-pointer ${
                isHome ? 'hover:text-[#FAF7F0]' : 'hover:text-[#262626]'
              } ${
                isNavActive('books') 
                  ? (isHome ? 'text-[#FAF7F0] font-semibold' : 'text-[#262626] font-semibold') 
                  : ''
              }`}
            >
              <span>All Books</span>
              {isNavActive('books') && (
                <span className={`absolute -bottom-1 left-0 right-0 h-[2px] rounded-full ${
                  isHome ? 'bg-[#F5CF78]' : 'bg-[#262626]'
                }`} />
              )}
            </button>
            <button
              onClick={() => onNavigate({ type: 'categories' })}
              className={`relative py-1 transition-colors cursor-pointer ${
                isHome ? 'hover:text-[#FAF7F0]' : 'hover:text-[#262626]'
              } ${
                isNavActive('categories') 
                  ? (isHome ? 'text-[#FAF7F0] font-semibold' : 'text-[#262626] font-semibold') 
                  : ''
              }`}
            >
              <span>Categories</span>
              {isNavActive('categories') && (
                <span className={`absolute -bottom-1 left-0 right-0 h-[2px] rounded-full ${
                  isHome ? 'bg-[#F5CF78]' : 'bg-[#262626]'
                }`} />
              )}
            </button>
          </nav>

          {/* RIGHT: Search & Account / Admin Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className={`hidden lg:flex items-center rounded-full transition-all overflow-hidden w-60 xl:w-68 ${
                isHome
                  ? 'bg-[#0f1d15]/90 border border-[#2b4434] focus-within:border-[#F5CF78] focus-within:bg-[#14261c] text-[#FAF7F0]'
                  : 'bg-[#F7F7F3] border border-[#EAEAE6] shadow-2xs hover:border-[#262626]/30 focus-within:border-[#262626] focus-within:bg-[#FCFCFA] text-[#262626]'
              }`}
            >
              <div className="relative flex-1 flex items-center pl-3.5">
                <Search className={`w-3.5 h-3.5 shrink-0 ${isHome ? 'text-[#7f9c89]' : 'text-[#777777]'}`} />
                <input
                  type="text"
                  placeholder="Search books, authors..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs focus:outline-none bg-transparent ${
                    isHome ? 'text-[#FAF7F0] placeholder-[#6b8574]' : 'text-[#262626] placeholder-[#777777]/70'
                  }`}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className={`p-1 mr-1 transition-colors cursor-pointer ${
                      isHome ? 'text-[#8aa393] hover:text-[#FAF7F0]' : 'text-[#777777] hover:text-[#262626]'
                    }`}
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </form>

            {/* Admin Portal Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                    isNavActive('admin')
                      ? (isHome ? 'bg-[#F5CF78] text-[#0d1611]' : 'bg-[#262626] text-[#FCFCFA]')
                      : (isHome ? 'bg-[#15251c] text-[#FAF7F0] hover:bg-[#1e3428]' : 'bg-[#F7F7F3] text-[#262626] hover:bg-[#EAEAE6]')
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isHome ? 'text-[#0d1611]' : 'text-[#E8D58B]'}`} />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Sign out of admin"
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isHome ? 'text-[#8aa393] hover:text-[#FAF7F0] hover:bg-[#15251c]' : 'text-[#777777] hover:text-[#262626] hover:bg-[#F7F7F3]'
                  }`}
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate({ type: 'admin-login' })}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  isHome
                    ? 'text-[#F5CF78] border border-[#304838] hover:bg-[#F5CF78] hover:text-[#0d1611] bg-[#111e16]'
                    : 'text-[#262626] border border-[#EAEAE6] hover:bg-[#262626] hover:text-[#FCFCFA]'
                }`}
              >
                Admin Login
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#262626] hover:bg-[#F7F7F3] rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <div className="w-4 h-3.5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-[#262626] rounded-full" />
                <span className="w-full h-0.5 bg-[#262626] rounded-full" />
                <span className="w-full h-0.5 bg-[#262626] rounded-full" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#EAEAE6] space-y-3 bg-[#FCFCFA]">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Search books, authors..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-[#EAEAE6] bg-[#F7F7F3] rounded-lg text-[#262626]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#262626] text-[#FCFCFA] text-xs font-medium rounded-lg"
              >
                Search
              </button>
            </form>
            <div className="flex flex-col space-y-2 text-sm font-medium">
              <button
                onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#262626] hover:text-[#777777]"
              >
                Library Home
              </button>
              <button
                onClick={() => { onNavigate({ type: 'books' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#262626] hover:text-[#777777]"
              >
                All Books
              </button>
              <button
                onClick={() => { onNavigate({ type: 'categories' }); setMobileMenuOpen(false); }}
                className="text-left py-1 text-[#262626] hover:text-[#777777]"
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
