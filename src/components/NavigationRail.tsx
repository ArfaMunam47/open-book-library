import React from 'react';
import { ActiveView } from '../types/library';
import { 
  Library, 
  Compass, 
  Layers, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  Info, 
  Sparkles,
  Bookmark
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
      {/* Desktop Narrow Vertical Rail (Hidden on mobile/tablet) */}
      <aside 
        aria-label="Reading Room Navigation"
        className="hidden lg:flex flex-col justify-between w-20 xl:w-24 bg-[#1E1813] text-stone-200 border-r border-[#382D24] shrink-0 sticky top-0 h-screen z-40 select-none shadow-xl"
      >
        {/* Top: Brand Emblem */}
        <div className="pt-6 pb-4 flex flex-col items-center border-b border-[#2E241C]">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
            title="OpenBook Digital Library"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 border border-amber-600/40 flex items-center justify-center text-amber-100 shadow-md group-hover:scale-105 group-hover:border-amber-400/60 transition-all">
              <Library className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-serif tracking-widest uppercase text-amber-200/80 font-bold group-hover:text-amber-300">
              OpenBook
            </span>
          </button>
        </div>

        {/* Center: Navigation Actions */}
        <nav className="flex-1 py-6 flex flex-col items-center gap-4 overflow-y-auto">
          {/* 1. Reading Room (Home) */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isHome 
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow-inner' 
                : 'text-stone-400 hover:text-stone-100 hover:bg-[#2A221A]'
            }`}
            title="Reading Room (Home)"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight">Room</span>
          </button>

          {/* 2. Full Catalog */}
          <button
            onClick={() => onNavigate({ type: 'books' })}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isBooks 
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow-inner' 
                : 'text-stone-400 hover:text-stone-100 hover:bg-[#2A221A]'
            }`}
            title="Catalog & Books"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight">Catalog</span>
          </button>

          {/* 3. Categories & Shelves */}
          <button
            onClick={() => onNavigate({ type: 'categories' })}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isCategories 
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow-inner' 
                : 'text-stone-400 hover:text-stone-100 hover:bg-[#2A221A]'
            }`}
            title="Subjects & Shelves"
          >
            <Layers className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight">Shelves</span>
          </button>

          {/* 4. 3D Shelf direct jump */}
          {isHome && onScrollToShelf && (
            <button
              onClick={onScrollToShelf}
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-amber-400/90 hover:text-amber-200 hover:bg-[#2A221A] transition-all cursor-pointer"
              title="Browse 3D Bookshelf"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-[9px] font-medium tracking-tight">3D Shelf</span>
            </button>
          )}

          {/* 5. Librarian Portal */}
          <button
            onClick={() => onNavigate(isAdmin ? { type: 'admin' } : { type: 'admin-login' })}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isAdminView 
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow-inner' 
                : 'text-stone-400 hover:text-stone-100 hover:bg-[#2A221A]'
            }`}
            title={isAdmin ? 'Librarian Dashboard' : 'Admin Login'}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight">Admin</span>
          </button>
        </nav>

        {/* Bottom Rail Actions */}
        <div className="pb-6 pt-3 flex flex-col items-center gap-3 border-t border-[#2E241C]">
          <button
            onClick={onOpenAbout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-[#2A221A] transition-colors cursor-pointer"
            title="About OpenBook Library"
          >
            <Info className="w-4 h-4" />
          </button>
          
          <div className="text-[10px] font-mono text-amber-300/70 font-semibold" title={`${totalBooks} Volumes in Library`}>
            {totalBooks} vol.
          </div>
        </div>
      </aside>

      {/* Mobile / Tablet Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1E1813]/95 backdrop-blur-md border-t border-[#382D24] py-2 px-4 flex items-center justify-around shadow-2xl"
      >
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
            isHome ? 'text-amber-300' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px]">Room</span>
        </button>

        <button
          onClick={() => onNavigate({ type: 'books' })}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
            isBooks ? 'text-amber-300' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px]">Catalog</span>
        </button>

        <button
          onClick={() => onNavigate({ type: 'categories' })}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
            isCategories ? 'text-amber-300' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px]">Shelves</span>
        </button>

        <button
          onClick={() => onNavigate(isAdmin ? { type: 'admin' } : { type: 'admin-login' })}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
            isAdminView ? 'text-amber-300' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px]">Admin</span>
        </button>
      </nav>
    </>
  );
};
