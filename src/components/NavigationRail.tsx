import React from 'react';
import { ActiveView } from '../types/library';
import { 
  Compass, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  Info, 
  Home
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
        className="hidden lg:flex flex-col justify-between w-60 bg-[#F8F8F4] text-[#292A27] border-r border-[#E8E8E2] shrink-0 sticky top-0 h-screen z-30 select-none shadow-2xs"
      >
        {/* Top: OpenBook Logo */}
        <div className="p-5 border-b border-[#E8E8E2]">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            title="OpenBook Digital Library"
          >
            <div className="w-8 h-8 rounded-lg bg-[#292A27] text-[#F8F8F4] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4 text-[#E8EAE2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-[#292A27] leading-none">
                OpenBook
              </span>
              <span className="text-[8.5px] tracking-[0.22em] font-medium text-[#85857E] uppercase font-sans mt-0.5">
                Digital Library
              </span>
            </div>
          </button>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto text-xs font-semibold uppercase tracking-wider">
          {/* 1. Library Home */}
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
              isHome 
                ? 'bg-[#E8EAE2] text-[#292A27] font-bold shadow-2xs' 
                : 'text-[#85857E] hover:text-[#292A27] hover:bg-[#E8EAE2]/50'
            }`}
          >
            <Home className={`w-4 h-4 ${isHome ? 'text-[#C98187]' : 'text-[#85857E]'}`} />
            <span>Home</span>
          </button>

          {/* 2. Browse Books */}
          <button
            onClick={() => onNavigate({ type: 'books' })}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
              isBooks 
                ? 'bg-[#E8EAE2] text-[#292A27] font-bold shadow-2xs' 
                : 'text-[#85857E] hover:text-[#292A27] hover:bg-[#E8EAE2]/50'
            }`}
          >
            <Compass className={`w-4 h-4 ${isBooks ? 'text-[#C98187]' : 'text-[#85857E]'}`} />
            <span>Browse Books</span>
          </button>

          {/* 3. Categories */}
          <button
            onClick={() => onNavigate({ type: 'categories' })}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
              isCategories 
                ? 'bg-[#E8EAE2] text-[#292A27] font-bold shadow-2xs' 
                : 'text-[#85857E] hover:text-[#292A27] hover:bg-[#E8EAE2]/50'
            }`}
          >
            <Layers className={`w-4 h-4 ${isCategories ? 'text-[#C98187]' : 'text-[#85857E]'}`} />
            <span>Categories</span>
          </button>

          {/* 4. Administrator Portal */}
          <button
            onClick={() => onNavigate(isAdmin ? { type: 'admin' } : { type: 'admin-login' })}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
              isAdminView 
                ? 'bg-[#E8EAE2] text-[#292A27] font-bold shadow-2xs' 
                : 'text-[#85857E] hover:text-[#292A27] hover:bg-[#E8EAE2]/50'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${isAdminView ? 'text-[#C98187]' : 'text-[#85857E]'}`} />
            <span>{isAdmin ? 'Admin Dashboard' : 'Admin Login'}</span>
          </button>
        </nav>

        {/* Bottom Area: Info & Catalog Status */}
        <div className="p-4 border-t border-[#E8E8E2] flex items-center justify-between text-xs text-[#85857E]">
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1.5 text-xs text-[#85857E] hover:text-[#292A27] p-1 rounded-md transition-colors cursor-pointer"
            title="About OpenBook Library"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
          
          <span className="font-mono text-[10.5px] font-medium text-[#292A27] bg-[#E8EAE2] px-2 py-0.5 rounded border border-[#DDE0D5]">
            {totalBooks} vols
          </span>
        </div>
      </aside>
    </>
  );
};
