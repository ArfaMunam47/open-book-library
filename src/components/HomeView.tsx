import React, { useRef } from 'react';
import { Book, Category } from '../types/library';
import { ArrowRight, BookOpen } from 'lucide-react';
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

  const scrollToShelves = () => {
    if (shelfSectionRef.current) {
      shelfSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigateBooks();
    }
  };

  const handleDiscoverBook = () => {
    if (books.length > 0) {
      onOpenBook(books[0].id);
    } else {
      scrollToShelves();
    }
  };

  return (
    <div className="relative w-full bg-[#F8F5E9] text-[#153C32] selection:bg-[#EBDDC3] selection:text-[#153C32] pb-24 min-h-screen">
      
      {/* =========================================================================
          HERO SECTION: REFINED TO THE MASTER PROMPT SPECIFICATION
          - Background: Warm ivory/parchment (#F8F5E9)
          - Left Side:
              * Small brand label: "OPENBOOK DIGITAL LIBRARY"
              * Main headline: "Every Great Story\nBegins Here." (Editorial Serif, #153C32)
              * Supporting paragraph: "Discover a world of knowledge, explore timeless ideas,
                and find your next unforgettable read in your personal digital library."
              * Primary action: "Explore the Library" (Terracotta/burnt orange #C76A32)
              * Secondary action: "Discover a Book" (Quiet secondary link)
              * Subtle literary framing line & hallmark
          - Right Side:
              * Realistic 3D wooden library cabinet enclosure with crown molding,
                rich dark walnut wood grain, directional warm ambient lighting,
                corner ambient occlusion, contact drop shadows, and authentic depth.
          ========================================================================= */}
      <section className="relative w-full overflow-hidden pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-28">
        
        {/* Soft atmospheric ambient glow behind the hero scene */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full pointer-events-none opacity-60 blur-3xl -z-10"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(235, 196, 142, 0.28) 0%, rgba(248, 245, 233, 0) 70%)'
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: Editorial Typography & Balanced Literary Composition */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start z-10">
              
              {/* Small Brand Introduction */}
              <div className="flex items-center gap-3 mb-5 sm:mb-6 select-none">
                <span className="w-6 h-[2px] bg-[#C76A32] rounded-full" aria-hidden="true" />
                <p className="text-xs sm:text-[13px] font-semibold tracking-[0.25em] uppercase text-[#C76A32] font-sans">
                  OpenBook Digital Library
                </p>
                <span className="text-[11px] text-[#C99738]" aria-hidden="true">✦</span>
              </div>

              {/* Main Headline: Large, confident, editorial serif, 2 lines */}
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[68px] font-bold text-[#153C32] leading-[1.08] tracking-tight mb-6">
                Every Great Story<br />
                Begins Here.
              </h1>

              {/* Supporting Paragraph: Short, welcoming description */}
              <p className="text-base sm:text-lg md:text-xl text-[#526058] font-sans font-normal leading-relaxed max-w-xl mb-8 sm:mb-10">
                Discover a world of knowledge, explore timeless ideas, and find your next unforgettable read in your personal digital library.
              </p>

              {/* Action Buttons: Primary prominent + Secondary quiet text link */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Primary Action: Explore the Library */}
                <button
                  onClick={scrollToShelves}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#C76A32] hover:bg-[#B35822] text-white text-base sm:text-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group active:scale-[0.98]"
                >
                  <span>Explore the Library</span>
                  <ArrowRight className="w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>

                {/* Secondary Action: Discover a Book */}
                <button
                  onClick={handleDiscoverBook}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-base font-medium text-[#153C32] hover:text-[#C76A32] transition-colors cursor-pointer group"
                >
                  <span>Discover a Book</span>
                  <span className="text-sm transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
                </button>
              </div>

              {/* Tasteful Literary Editorial Hallmark */}
              <div className="mt-10 sm:mt-12 pt-6 border-t border-[#E3DEC9] w-full max-w-lg flex items-center gap-3.5 text-xs text-[#526058]/80 font-serif">
                <span className="text-[#C99738] text-sm shrink-0">✦</span>
                <span className="italic tracking-wide">
                  Curated public domain & timeless open-access literature, accessible to all.
                </span>
              </div>

            </div>

            {/* RIGHT COLUMN: Realistic 3D Architectural Bookshelf Cabinet Scene */}
            <div className="lg:col-span-6 xl:col-span-6 relative mt-6 lg:mt-0 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[560px] lg:max-w-none">
                
                {/* Directional Warm Ambient Glow behind cabinet */}
                <div 
                  className="absolute inset-0 bg-gradient-to-tr from-[#C76A32]/10 via-[#F3DEB8]/20 to-transparent rounded-3xl blur-2xl transform scale-105 pointer-events-none" 
                  aria-hidden="true"
                />

                {/* The 3D Architectural Library Cabinet Housing */}
                <div className="hero-cabinet-stage relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 walnut-cabinet-frame">
                  
                  {/* Top Crown Molding Bevel / Wooden Arch Trim */}
                  <div className="h-3 sm:h-4 w-full bg-gradient-to-r from-[#2B180D] via-[#482A17] to-[#2B180D] rounded-t-xl sm:rounded-t-2xl border-b border-[#5C3820]/60 mb-1 flex items-center justify-between px-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C99738]/60" />
                    <div className="w-16 h-0.5 bg-[#C99738]/30 rounded-full" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C99738]/60" />
                  </div>

                  {/* Recessed Bookshelf Artwork Window */}
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden cabinet-inner-recess bg-[#1F1208]">
                    
                    {/* The Centerpiece Illustrated Bookshelf Artwork */}
                    <img
                      src="/src/assets/images/bookshelf_artwork_1791813347076.jpg"
                      alt="Artistic realistic dark walnut library bookshelf filled with colorful volumes, arched recesses, and decorative objects"
                      className="w-full h-auto object-cover select-none block"
                      loading="eager"
                    />

                    {/* Overhead Directional Gallery Spotlight Overlay */}
                    <div className="hero-library-light-beam absolute inset-0 pointer-events-none" />

                    {/* Corner Ambient Occlusion & Deep Vignette */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/40 rounded-xl sm:rounded-2xl pointer-events-none shadow-[inset_0_0_35px_rgba(15,8,3,0.55)]" />
                  </div>

                  {/* Cabinet Bottom Plinth with Brass Archive Plate */}
                  <div className="mt-2.5 sm:mt-3 flex items-center justify-center">
                    <div className="px-4 py-1 rounded-[3px] bg-gradient-to-r from-[#8C6B32] via-[#D8B468] to-[#8C6B32] text-[#221408] text-[9px] sm:text-[10px] font-mono tracking-[0.22em] uppercase font-bold shadow-md border border-[#F2DEAA]/50 flex items-center gap-2 select-none pointer-events-none">
                      <span className="w-1 h-1 rounded-full bg-[#463012]" />
                      <span>OpenBook Digital Library · Stacks</span>
                      <span className="w-1 h-1 rounded-full bg-[#463012]" />
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          REAL BOOKS CATALOG SECTION: INTERACTIVE PHYSICAL LIBRARY STACKS
          Only real books that actually exist in the library database are shown here.
          ========================================================================= */}
      <section 
        id="shelves" 
        ref={shelfSectionRef}
        className="w-full pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E3DEC9]"
      >
        <div className="mb-10 pb-4 border-b border-[#E3DEC9] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C76A32] uppercase tracking-wider mb-1.5 font-sans">
              <BookOpen className="w-3.5 h-3.5 text-[#C76A32]" />
              <span>Catalog Stacks</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#153C32] tracking-tight">
              Browse Library Volumes
            </h2>
            <p className="text-xs sm:text-sm text-[#526058] mt-1.5">
              Select any volume to inspect its details, view catalog synopsis, or begin reading online.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateBooks()}
              className="px-4 py-2 text-xs font-semibold text-[#153C32] hover:text-[#C76A32] bg-white border border-[#D5CFBE] rounded-full transition-colors cursor-pointer shadow-xs hover:border-[#C76A32]"
            >
              View Grid Catalog →
            </button>
          </div>
        </div>

        {/* 3D Physical Bookshelf with Live Real Book Records */}
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
