import React from 'react';
import { ActiveView } from '../types/library';
import { 
  Compass, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  Info, 
  Sparkles
} from 'lucide-react';

interface NavigationRailProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  isAdmin: boolean;
  totalBooks: number;
  onOpenAbout: () => void;
  onScrollToShelf?: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentView,
  onNavigate,
  isAdmin,
  totalBooks,
  onOpenAbout,
  onScrollToShelf,
}) => {
  const isHome = currentView.type === 'home';
  const isBooks = currentView.type === 'books';
  const isCategories = currentView.type === 'categories';
  const isAdminView = currentView.type === 'admin' || currentView.type === 'admin-login';

  return (
    <>
      {/* Desktop Refined Sidebar (Sticky along content on lg+ screens) */}
      <aside 
        aria-label="OpenBook Sidebar Navigation"
        className="hidden lg:flex flex-col justify-between w-64 bg-[#FFF9F1] text-[#10243B] border-r border-[#F0E5D8] shrink-0 sticky top-0 h-screen z-30 select-none shadow-xs"
      >
        {/* Top: OpenBook Logo */}
        <div className="p-6 border-b border-[#F0E5D8]">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            title="OpenBook Digital Library"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F1262D] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#10243B] leading-none">
                OpenBook
              </span>
              <span className="text-[9px] tracking-[0.2em] font-semibold text-[#77736E] uppercase font-sans mt-1">
                DIGITAL LIBRARY
              </span>
            </div>
          </button>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* 1. Library Home */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
              isHome 
                ? 'bg-[#FFDDD5] text-[#F1262D] font-bold shadow-2xs' 
                : 'text-[#10243B] hover:text-[#F1262D] hover:bg-[#FFF4E8] font-medium'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${isHome ? 'text-[#F1262D]' : 'text-[#77736E]'}`} />
            <span>Library Home</span>
          </button>

          {/* 2. Browse Books */}
          <button
            onClick={() => onNavigate({ type: 'books' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
              isBooks 
                ? 'bg-[#FFDDD5] text-[#F1262D] font-bold shadow-2xs' 
                : 'text-[#10243B] hover:text-[#F1262D] hover:bg-[#FFF4E8] font-medium'
            }`}
          >
            <Compass className={`w-4 h-4 ${isBooks ? 'text-[#F1262D]' : 'text-[#77736E]'}`} />
            <span>Browse Books</span>
          </button>

          {/* 3. Categories */}
          <button
            onClick={() => onNavigate({ type: 'categories' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
              isCategories 
                ? 'bg-[#FFDDD5] text-[#F1262D] font-bold shadow-2xs' 
                : 'text-[#10243B] hover:text-[#F1262D] hover:bg-[#FFF4E8] font-medium'
            }`}
          >
            <Layers className={`w-4 h-4 ${isCategories ? 'text-[#F1262D]' : 'text-[#77736E]'}`} />
            <span>Categories</span>
          </button>

          {/* 4. Optional 3D Shelf direct jump (when on Home) */}
          {isHome && onScrollToShelf && (
            <button
              onClick={onScrollToShelf}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#77736E] hover:text-[#F1262D] hover:bg-[#FFF4E8] font-medium transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F1262D]" />
              <span>Wooden Shelf</span>
            </button>
          )}

          {/* 5. Administrator Portal */}
          <button
            onClick={() => onNavigate(isAdmin ? { type: 'admin' } : { type: 'admin-login' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
              isAdminView 
                ? 'bg-[#FFDDD5] text-[#F1262D] font-bold shadow-2xs' 
                : 'text-[#10243B] hover:text-[#F1262D] hover:bg-[#FFF4E8] font-medium'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${isAdminView ? 'text-[#F1262D]' : 'text-[#77736E]'}`} />
            <span>{isAdmin ? 'Admin Dashboard' : 'Admin Login'}</span>
          </button>
        </nav>

        {/* Bottom Area: Info & Catalog Status */}
        <div className="p-4 border-t border-[#F0E5D8] flex items-center justify-between text-xs text-[#77736E]">
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-2 text-xs text-[#77736E] hover:text-[#F1262D] p-1 rounded-lg transition-colors cursor-pointer"
            title="About OpenBook Library"
          >
            <Info className="w-4 h-4" />
            <span>About Library</span>
          </button>
          
          <span className="font-mono text-[11px] font-semibold text-[#10243B]/80 bg-[#FFF4E8] px-2.5 py-1 rounded-md border border-[#F0E5D8]">
            {totalBooks} vols
          </span>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFF9F1]/95 backdrop-blur-md border-t border-[#F0E5D8] py-2 px-4 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-pointer ${
            isHome ? 'text-[#F1262D] font-bold' : 'text-[#77736E] hover:text-[#10243B]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onNavigate({ type: 'books' })}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-pointer ${
            isBooks ? 'text-[#F1262D] font-bold' : 'text-[#77736E] hover:text-[#10243B]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px]">Browse</span>
        </button>

        <button
          onClick={() => onNavigate({ type: 'categories' })}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-pointer ${
            isCategories ? 'text-[#F1262D] font-bold' : 'text-[#77736E] hover:text-[#10243B]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px]">Categories</span>
        </button>

        <button
          onClick={() => onNavigate(isAdmin ? { type: 'admin' } : { type: 'admin-login' })}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-pointer ${
            isAdminView ? 'text-[#F1262D] font-bold' : 'text-[#77736E] hover:text-[#10243B]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px]">Admin</span>
        </button>
      </nav>
    </>
  );
};
