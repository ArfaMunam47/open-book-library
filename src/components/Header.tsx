import React, { useState } from 'react';
import { BookOpen, Search, ShieldCheck, LogOut, Library } from 'lucide-react';
import { ActiveView } from '../types/library';

interface HeaderProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  isAdmin: boolean;
  onAdminLogout: () => void;
  onSearchSubmit: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isAdmin,
  onAdminLogout,
  onSearchSubmit
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
    } else {
      onNavigate({ type: 'books' });
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
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            aria-label="Open Book Library home"
          >
            <div className="w-8 h-8 rounded-md bg-stone-900 text-amber-50 flex items-center justify-center shrink-0">
              <Library className="w-4 h-4" />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-900 transition-colors">
              Open Book Library
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={`transition-colors hover:text-stone-900 ${
                isNavActive('home') ? 'text-stone-950 font-semibold border-b-2 border-amber-800 pb-0.5' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate({ type: 'books' })}
              className={`transition-colors hover:text-stone-900 ${
                isNavActive('books') ? 'text-stone-950 font-semibold border-b-2 border-amber-800 pb-0.5' : ''
              }`}
            >
              Browse Books
            </button>
            <button
              onClick={() => onNavigate({ type: 'categories' })}
              className={`transition-colors hover:text-stone-900 ${
                isNavActive('categories') ? 'text-stone-950 font-semibold border-b-2 border-amber-800 pb-0.5' : ''
              }`}
            >
              Categories
            </button>
          </nav>

          {/* Zone 3: Search Bar & Admin Action */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
              <input
                type="text"
                placeholder="Search library..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/80 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 placeholder:text-stone-400"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </form>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate({ type: 'admin', subview: 'books' })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    isNavActive('admin')
                      ? 'bg-amber-900 text-white'
                      : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Sign out of admin"
                  className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-md transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate({ type: 'admin-login' })}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md transition-colors whitespace-nowrap"
              >
                Admin Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-stone-200 text-xs font-medium text-stone-600">
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={isNavActive('home') ? 'text-amber-900 font-bold' : ''}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate({ type: 'books' })}
              className={isNavActive('books') ? 'text-amber-900 font-bold' : ''}
            >
              Books
            </button>
            <button
              onClick={() => onNavigate({ type: 'categories' })}
              className={isNavActive('categories') ? 'text-amber-900 font-bold' : ''}
            >
              Categories
            </button>
          </div>
          <button
            onClick={() => onNavigate({ type: 'books' })}
            className="flex items-center gap-1 text-stone-500 hover:text-stone-900"
          >
            <Search className="w-3 h-3" />
            <span>Search</span>
          </button>
        </div>

      </div>
    </header>
  );
};
