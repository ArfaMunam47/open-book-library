import React from 'react';
import { Book } from '../types/library';
import { ArrowDown, ArrowRight, Library, BookOpen } from 'lucide-react';

interface HeroOverlappingBooksProps {
  books: Book[];
  onOpenBook: (bookId: string) => void;
  onExploreShelves: () => void;
  onBrowseCatalog: () => void;
}

export const HeroOverlappingBooks: React.FC<HeroOverlappingBooksProps> = ({
  books,
  onOpenBook,
  onExploreShelves,
  onBrowseCatalog
}) => {
  // Use real books from the database
  const frontBook = books[0];
  const rearBook = books[1] || books[0];

  return (
    <section className="relative overflow-visible pt-4 pb-12 sm:pb-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* =====================================================================
              LEFT SIDE: BOLD RED CIRCULAR SHAPE + TWO OVERLAPPING 3D BOOKS
              ===================================================================== */}
          <div className="lg:col-span-6 flex justify-center items-center relative select-none">
            
            {/* The Outer Stage Container with ample padding for angled books */}
            <div className="relative flex items-center justify-center w-full max-w-[540px] aspect-square">
              
              {/* 1. Bold Red Circular Focal Shape (#FF3038) */}
              <div 
                className="hero-red-focal w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[460px] md:h-[460px] lg:w-[480px] lg:h-[480px] rounded-full absolute transition-transform duration-700 ease-out"
                style={{ backgroundColor: '#FF3038' }}
                aria-hidden="true"
              />

              {/* 2. REAR BOOK: Rotated -8 degrees, sits slightly behind */}
              {rearBook && (
                <div
                  onClick={() => onOpenBook(rearBook.id)}
                  title={`View details for ${rearBook.title}`}
                  className="hero-book-3d hero-book-rear absolute z-10 w-40 sm:w-52 md:w-60 lg:w-64 aspect-[2/3] cursor-pointer -translate-x-10 sm:-translate-x-14 md:-translate-x-16 -translate-y-4 sm:-translate-y-6 group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenBook(rearBook.id);
                    }
                  }}
                  aria-label={`Featured volume: ${rearBook.title} by ${rearBook.author}`}
                >
                  {/* Top page edge depth */}
                  <div className="hardcover-top-edge" />
                  {/* Right stacked pages rim */}
                  <div className="hardcover-page-edges" />

                  {/* Main Book Cover Face */}
                  <div className="relative w-full h-full rounded-r-md rounded-l-xs overflow-hidden bg-stone-900 border-t border-r border-stone-700/60">
                    {rearBook.cover_url ? (
                      <img
                        src={rearBook.cover_url}
                        alt={`Cover of ${rearBook.title}`}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col justify-between bg-stone-900 text-stone-100 leather-bound-texture">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300">
                          {rearBook.category_name || 'Volume Archive'}
                        </span>
                        <div className="my-auto">
                          <h3 className="font-serif text-sm sm:text-base font-bold line-clamp-3">
                            {rearBook.title}
                          </h3>
                          <p className="text-xs text-stone-300 italic mt-1 truncate">
                            {rearBook.author}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono text-stone-400">Unabridged Edition</span>
                      </div>
                    )}

                    {/* Spine crease shadow on the fold */}
                    <div className="hardcover-spine-crease" />
                    {/* Gloss sheen across cover surface */}
                    <div className="book-cover-sheen" />
                  </div>
                </div>
              )}

              {/* 3. FRONT BOOK: Rotated +5 degrees, overlapping the rear book */}
              {frontBook && (
                <div
                  onClick={() => onOpenBook(frontBook.id)}
                  title={`View details for ${frontBook.title}`}
                  className="hero-book-3d hero-book-front absolute z-20 w-44 sm:w-56 md:w-64 lg:w-72 aspect-[2/3] cursor-pointer translate-x-8 sm:translate-x-12 md:translate-x-14 translate-y-8 sm:translate-y-12 group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenBook(frontBook.id);
                    }
                  }}
                  aria-label={`Featured volume: ${frontBook.title} by ${frontBook.author}`}
                >
                  {/* Top page edge depth */}
                  <div className="hardcover-top-edge" />
                  {/* Right stacked pages rim */}
                  <div className="hardcover-page-edges" />

                  {/* Main Book Cover Face */}
                  <div className="relative w-full h-full rounded-r-md rounded-l-xs overflow-hidden bg-stone-900 border-t border-r border-stone-700/60">
                    {frontBook.cover_url ? (
                      <img
                        src={frontBook.cover_url}
                        alt={`Cover of ${frontBook.title}`}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col justify-between bg-stone-900 text-stone-100 leather-bound-texture">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300">
                          {frontBook.category_name || 'OpenBook Edition'}
                        </span>
                        <div className="my-auto">
                          <h3 className="font-serif text-sm sm:text-base font-bold line-clamp-3">
                            {frontBook.title}
                          </h3>
                          <p className="text-xs text-stone-300 italic mt-1 truncate">
                            {frontBook.author}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono text-stone-400">PDF Reader Available</span>
                      </div>
                    )}

                    {/* Spine crease shadow on the fold */}
                    <div className="hardcover-spine-crease" />
                    {/* Gloss sheen across cover surface */}
                    <div className="book-cover-sheen" />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* =====================================================================
              RIGHT SIDE: LARGE HEADLINE, SUPPORTING COPY, HERO ACTIONS
              ===================================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left lg:pl-6 space-y-6">
            
            {/* Minimal Brand Tag */}
            <div className="inline-flex items-center gap-2.5">
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block" 
                style={{ backgroundColor: '#FF3038' }}
              />
              <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-stone-900">
                OpenBook Digital Library
              </span>
            </div>

            {/* Large Bold Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#191919] tracking-tight leading-[1.08]">
              Discover Your Next <br />
              <span className="text-[#191919]">Favorite Book</span>
            </h1>

            {/* Short Supporting Description */}
            <p className="font-sans text-base sm:text-lg text-[#626262] leading-relaxed max-w-xl">
              Explore unabridged literature, curated volumes, and open knowledge preserved for deep study. Read instantly inside your browser or download complete editions with zero restrictions.
            </p>

            {/* Clean Hero Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={onExploreShelves}
                className="bg-[#191919] hover:bg-[#FF3038] text-white px-8 py-4 rounded-full text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-500/20 flex items-center gap-2.5 cursor-pointer group"
              >
                <span>Explore Bookshelf</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </button>

              <button
                onClick={onBrowseCatalog}
                className="border border-stone-300 hover:border-stone-900 text-[#191919] hover:text-[#191919] bg-white px-7 py-4 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Subtle Reading Hint */}
            <div className="pt-1 flex items-center gap-2 text-xs text-stone-400 font-mono">
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              <span>Click any book to inspect volume details, read online, or download PDF</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
