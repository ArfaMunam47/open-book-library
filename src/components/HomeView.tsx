import React, { useRef, useState } from 'react';
import { Book, Category } from '../types/library';
import { Search, Compass, Layers, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { ThreeDBookshelf } from './ThreeDBookshelf';

interface HomeViewProps {
  books: Book[];
  categories: Category[];
  onOpenBook: (bookId: string) => void;
  onReadOnline: (bookId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onNavigateBooks: (searchQuery?: string, categoryId?: string) => void;
  onNavigateCategories: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  categories,
  onOpenBook,
  onReadOnline,
  onSelectCategory,
  onNavigateBooks,
  onNavigateCategories,
}) => {
  const shelfSectionRef = useRef<HTMLDivElement>(null);
  const [heroSearchInput, setHeroSearchInput] = useState('');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      onNavigateBooks(heroSearchInput.trim());
    }
  };

  const scrollToShelves = () => {
    if (shelfSectionRef.current) {
      shelfSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-[#0a130e] text-[#FAF8F5] selection:bg-[#E2BA60] selection:text-[#0D1510] pb-24 min-h-screen">
      
      {/* =========================================================================
          CONTINUOUS FULL-SCREEN PANORAMIC FANTASY LIBRARY ENVIRONMENT
          The digital artwork covers the entire background of the hero with no
          rectangular image cards or border frames.
          ========================================================================= */}
      <div className="relative w-full overflow-hidden border-b border-[#223328]/70">
        
        {/* Full-bleed Artwork Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/fantasy_art_bg_1791747668505.jpg"
            alt="Cinematic fantasy library with stone arches, spiral bookshelf, warm lantern glow, floating pages, and a glowing circular portal opening into a sunlit floating castle realm"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[center_35%] lg:object-[68%_38%] select-none scale-100"
          />

          {/* Cinematic lighting gradients and directional text readability vignettes */}
          {/* 1. Heavy dark forest green fade behind left text side */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070e0a]/95 via-[#0a140f]/80 to-transparent lg:w-[65%]" />
          
          {/* 2. Top-to-bottom atmospheric vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a130e] via-transparent to-[#070e0a]/75" />

          {/* 3. Deep bottom gradient connecting smoothly to the shelf floor */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a130e] via-[#0a130e]/85 to-transparent" />
          
          {/* 4. Golden ambient radial beam */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#E8B854]/10 rounded-full blur-[140px] pointer-events-none" />
        </div>

        {/* Foreground Content: Placed directly in the fantasy library realm */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-24 pb-20 sm:pb-28 lg:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[480px] lg:min-h-[540px]">
            
            {/* LEFT / CENTER-LEFT AREA: Bold cinematic typography & interactive search */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-7 max-w-2xl">
              
              {/* Gold Ethereal Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1a12]/80 border border-[#304838] text-[#E8B854] text-xs font-serif tracking-wide shadow-xl backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#E8B854] animate-pulse" />
                <span>The OpenBook Digital Sanctuary</span>
              </div>

              {/* Main Heading: "Open a Book, Open a New World" */}
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight text-[#FAF7F0] leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                Open a Book, <br />
                Open a <span className="italic font-serif font-normal text-[#F5CF78] bg-gradient-to-r from-[#FDE68A] via-[#F5CF78] to-[#D9A74A] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,207,120,0.4)]">New World</span>
              </h1>

              {/* Atmospheric Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-[#D5E2D9] font-sans font-light leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                Step beyond the stone threshold into an infinite archive of knowledge, imagination, and timeless stories. Every volume stands unabridged and ready for your discovery.
              </p>

              {/* Magical Search Input Form */}
              <form onSubmit={handleHeroSearchSubmit} className="w-full max-w-lg pt-1">
                <div className="relative flex items-center bg-[#0d1912]/85 border border-[#334e3b] hover:border-[#F5CF78]/60 focus-within:border-[#F5CF78] focus-within:ring-2 focus-within:ring-[#F5CF78]/25 rounded-full transition-all shadow-2xl backdrop-blur-md overflow-hidden">
                  <Search className="w-4 h-4 text-[#94ad9b] ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by title, author, subject, or keyword..."
                    value={heroSearchInput}
                    onChange={(e) => setHeroSearchInput(e.target.value)}
                    className="w-full px-3.5 py-3.5 text-sm text-[#FAF7F0] placeholder-[#809c88] focus:outline-none bg-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 mr-1.5 my-1.5 bg-gradient-to-r from-[#D9A74A] via-[#E2BA60] to-[#C29035] hover:brightness-110 text-[#0d1611] text-xs font-bold rounded-full transition-all shadow-lg cursor-pointer shrink-0"
                  >
                    Explore
                  </button>
                </div>
              </form>

              {/* Two Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1 w-full sm:w-auto">
                <button
                  onClick={scrollToShelves}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#D9A74A] via-[#E2BA60] to-[#C29035] text-[#0d1611] font-bold text-sm shadow-[0_0_25px_rgba(226,186,96,0.45)] hover:shadow-[0_0_35px_rgba(226,186,96,0.65)] hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#0d1611]" />
                  <span>Explore Library Shelves</span>
                  <ArrowRight className="w-4 h-4 text-[#0d1611]" />
                </button>

                <button
                  onClick={onNavigateCategories}
                  className="px-6 py-3 rounded-full bg-[#0e1a13]/80 hover:bg-[#15251c] text-[#FAF7F0] border border-[#334e3b] hover:border-[#F5CF78]/50 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md"
                >
                  <Layers className="w-4 h-4 text-[#F5CF78]" />
                  <span>Browse Categories</span>
                </button>
              </div>

              {/* Status & Catalog Badges */}
              <div className="flex items-center gap-6 pt-3 text-xs text-[#9eb5a5] border-t border-[#203326]/90 w-full max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E2BA60] shadow-[0_0_8px_#E2BA60]" />
                  <span>{books.length} Unabridged Volumes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#528C67]" />
                  <span>{categories.length} Curated Archives</span>
                </div>
                <div className="flex items-center gap-2 hidden sm:flex">
                  <span className="w-2 h-2 rounded-full bg-[#83B090]" />
                  <span>Immediate PDF Access</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Natural open view onto the circular portal, spiral staircase, reading girl, and floating pages */}
            <div className="lg:col-span-5 hidden lg:flex flex-col items-end justify-end h-full pointer-events-none select-none">
              {/* Subtle ambient tag floating naturally near the portal glow */}
              <div className="bg-[#070e0a]/75 backdrop-blur-md border border-[#334e3b]/80 text-[#FAF7F0] px-4 py-2 rounded-xl text-xs font-serif shadow-2xl flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#F5CF78] animate-ping" />
                <span className="italic text-[#E8EDE9]">"A reader lives a thousand lives before he dies."</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          REALISTIC 3D PHYSICAL BOOKSHELF SECTION
          The library shelves appear directly below as part of the sanctuary floor.
          Upright 3D book volumes with spine hinges, depth rims, contact shadows.
          ========================================================================= */}
      <section 
        id="shelves" 
        ref={shelfSectionRef}
        className="w-full pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="mb-10 pb-4 border-b border-[#213527] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif text-[#E2BA60] mb-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E2BA60]" />
              <span className="tracking-wider uppercase text-[10px] font-sans font-bold">Sanctuary Stacks</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#FAF8F5] tracking-tight">
              Physical Library Shelves
            </h2>
            <p className="text-xs sm:text-sm text-[#9BB2A2] mt-1.5">
              Select any standing volume to inspect its details, view its catalog metadata, or begin reading instantly.
            </p>
          </div>

          <div className="text-xs text-[#9BB2A2] font-mono flex items-center gap-2 bg-[#101d15] px-3 py-1.5 rounded-lg border border-[#253d2d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2BA60]" />
            <span>Interactive 3D Volumes</span>
          </div>
        </div>

        {/* 3D Bookshelf Component with Real Books Data */}
        <ThreeDBookshelf
          books={books}
          categories={categories}
          onOpenBook={onOpenBook}
          onReadOnline={onReadOnline}
          onSelectCategory={onSelectCategory}
        />
      </section>

    </div>
  );
};
