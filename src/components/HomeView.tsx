import React, { useRef } from 'react';
import { Book, Category } from '../types/library';
import { ArrowDown, BookOpen, ChevronRight, Compass } from 'lucide-react';
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
}) => {
  const bookshelfRef = useRef<HTMLDivElement>(null);

  // Take the first two real books for the overlapping composition
  const frontBook = books[0];
  const rearBook = books[1] || books[0];

  const scrollToBookshelf = () => {
    bookshelfRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white text-[#191919] selection:bg-red-100 selection:text-red-900 pb-20">
      
      {/* =========================================================================
          HERO SECTION: BOLD RED CIRCLE + TWO OVERLAPPING 3D BOOKS + HEADLINE
          ========================================================================= */}
      <section className="relative w-full pt-10 sm:pt-16 md:pt-20 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* =======================================================================
              LEFT SIDE: BOLD RED CIRCLE WITH TWO OVERLAPPING BOOKS
              ======================================================================= */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[440px] sm:min-h-[520px] lg:min-h-[580px] order-2 lg:order-1">
            
            {/* 1. Large Vivid Red Focal Circle */}
            <div 
              className="absolute w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[520px] lg:h-[520px] hero-red-circle"
              aria-hidden="true"
            />

            {/* 2. The Two Overlapping 3D Physical Books */}
            <div className="relative z-10 w-full flex items-center justify-center">
              
              {/* REAR BOOK (Angled at -8 degrees, sits behind) */}
              {rearBook && (
                <div
                  onClick={() => onOpenBook(rearBook.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${rearBook.title} by ${rearBook.author}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenBook(rearBook.id);
                    }
                  }}
                  className="relative z-10 w-[190px] sm:w-[250px] lg:w-[280px] aspect-[2/3] hero-book-rear cursor-pointer group"
                  title={`Click to inspect: ${rearBook.title}`}
                >
                  <div className="relative w-full h-full rounded-r-md rounded-l-xs overflow-hidden bg-[#191919] border-t border-r border-stone-800">
                    {rearBook.cover_url ? (
                      <img
                        src={rearBook.cover_url}
                        alt={`Cover of ${rearBook.title}`}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full p-6 flex flex-col justify-between bg-stone-900 text-white">
                        <span className="text-[10px] font-mono tracking-widest text-[#FF3038] uppercase font-bold">
                          {rearBook.category_name}
                        </span>
                        <h4 className="font-serif text-lg font-bold leading-tight line-clamp-3">
                          {rearBook.title}
                        </h4>
                        <span className="text-xs text-stone-400 truncate">
                          {rearBook.author}
                        </span>
                      </div>
                    )}

                    {/* Hardcover Spine Crease Shadow */}
                    <div className="hardcover-spine-crease" />
                    
                    {/* Top and side 3D page edge visible */}
                    <div className="hardcover-top-edge" />
                    <div className="hardcover-page-edges" />

                    {/* Subtle Sheen Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* FRONT BOOK (Angled at +4 degrees, sits in front, overlapping) */}
              {frontBook && (
                <div
                  onClick={() => onOpenBook(frontBook.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${frontBook.title} by ${frontBook.author}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenBook(frontBook.id);
                    }
                  }}
                  className="absolute z-20 w-[205px] sm:w-[265px] lg:w-[295px] aspect-[2/3] hero-book-front cursor-pointer group"
                  title={`Click to inspect: ${frontBook.title}`}
                >
                  <div className="relative w-full h-full rounded-r-md rounded-l-xs overflow-hidden bg-[#191919] border-t border-r border-stone-800">
                    {frontBook.cover_url ? (
                      <img
                        src={frontBook.cover_url}
                        alt={`Cover of ${frontBook.title}`}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full p-6 flex flex-col justify-between bg-stone-900 text-white">
                        <span className="text-[10px] font-mono tracking-widest text-[#FF3038] uppercase font-bold">
                          {frontBook.category_name}
                        </span>
                        <h4 className="font-serif text-xl font-bold leading-tight line-clamp-3">
                          {frontBook.title}
                        </h4>
                        <span className="text-xs text-stone-400 truncate">
                          {frontBook.author}
                        </span>
                      </div>
                    )}

                    {/* Hardcover Spine Crease Shadow */}
                    <div className="hardcover-spine-crease" />
                    
                    {/* Top and side 3D page edge visible */}
                    <div className="hardcover-top-edge" />
                    <div className="hardcover-page-edges" />

                    {/* Subtle Sheen Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                  </div>
                </div>
              )}

            </div>
          </div>


          {/* =======================================================================
              RIGHT SIDE: BOLD EDITORIAL HEADLINE & CLEAN HERO ACTIONS
              ======================================================================= */}
          <div className="lg:col-span-5 flex flex-col items-start justify-center order-1 lg:order-2">
            
            {/* Red Monospace Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3038]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF3038] font-bold">
                OpenBook Digital Library
              </span>
            </div>

            {/* Large Bold Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#191919] tracking-tight leading-[1.08]">
              Discover Your Next Favorite Book
            </h1>

            {/* Supporting Description */}
            <p className="mt-5 text-base sm:text-lg text-[#626262] font-sans leading-relaxed max-w-lg">
              Welcome to our open digital collection. Explore complete unabridged editions of timeless literature, critical thinking, and transformative ideas—free to read in your browser or download.
            </p>

            {/* Hero Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              {/* Primary: Scroll to Bookshelf */}
              <button
                onClick={scrollToBookshelf}
                className="px-8 py-4 bg-[#FF3038] hover:bg-[#E52028] text-white rounded-full font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_25px_rgba(255,48,56,0.35)] hover:shadow-[0_14px_30px_rgba(255,48,56,0.45)] cursor-pointer"
              >
                <span>Explore the Bookshelf</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              {/* Secondary: Open Catalog */}
              <button
                onClick={() => onNavigateBooks()}
                className="px-6 py-4 text-[#191919] hover:text-[#FF3038] text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Full Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          THE PHYSICAL 3D BOOKSHELVES SECTION
          ========================================================================= */}
      <section 
        id="bookshelf" 
        ref={bookshelfRef}
        className="w-full py-16 sm:py-24 bg-[#FAF9F5] border-t border-stone-200/80 scroll-mt-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <ThreeDBookshelf
            books={books}
            categories={categories}
            onOpenBook={onOpenBook}
            onReadOnline={onReadOnline}
            onSelectCategory={onSelectCategory}
          />
        </div>
      </section>

    </div>
  );
};
