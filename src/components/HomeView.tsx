import React, { useState } from 'react';
import { Book, Category } from '../types/library';
import { ArrowRight } from 'lucide-react';
import { ThreeOversizedBooks } from './ThreeOversizedBooks';

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
  categories,
  onNavigateBooks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    onNavigateBooks(query || undefined);
  };

  const handleCategoryClick = (genreSlug: string) => {
    // Match with real library category if present, or query by genre name
    const found = categories.find(
      c => c.slug?.toLowerCase().includes(genreSlug.toLowerCase()) || 
           c.name?.toLowerCase().includes(genreSlug.toLowerCase())
    );
    if (found) {
      onNavigateBooks(undefined, found.id);
    } else {
      onNavigateBooks(genreSlug);
    }
  };

  return (
    <div className="openbook-homepage w-full min-h-[calc(100vh-80px)] bg-[#FFFEFA] text-[#080B0F] flex flex-col justify-between overflow-x-hidden selection:bg-[#FF4D16] selection:text-white">
      
      {/* =========================================================================
          HERO SECTION (BALANCED VIEWPORT COMPOSITION)
          - Positioned comfortably close to the navbar with balanced top padding
          - Left column: Eyebrow, "BOOKS FOR ALL" headline, search pill + "Explore books", supporting paragraph
          - Right column: Three refined 3D hardcover books in orange, navy, and yellow
          ========================================================================= */}
      <section className="relative w-full flex-1 flex flex-col justify-center pt-3 sm:pt-5 md:pt-6 lg:pt-8 pb-6 sm:pb-10 lg:pb-12">
        
        {/* Centered content area with ~70-100px horizontal padding on desktop */}
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 xl:px-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
            
            {/* =====================================================================
                LEFT COLUMN (~48% of available width)
                ===================================================================== */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start z-10 text-left">
              
              {/* Eyebrow Text: Uppercase orange label "A BETTER KIND OF LIBRARY" */}
              <div className="mb-2 sm:mb-3 lg:mb-3 select-none">
                <p className="text-xs sm:text-[13px] lg:text-[14px] font-semibold tracking-[0.22em] text-[#FF4D16] uppercase font-sans">
                  A BETTER KIND OF LIBRARY
                </p>
              </div>

              {/* Main Headline: Exactly "BOOKS" / "FOR ALL" in massive, bold geometric sans-serif */}
              <h1 className="font-sans font-black text-5xl sm:text-6xl md:text-7xl lg:text-[88px] xl:text-[102px] 2xl:text-[112px] text-[#080B0F] tracking-[-0.04em] leading-[0.92] uppercase select-none mb-6 sm:mb-7 lg:mb-8">
                BOOKS<br />
                FOR ALL
              </h1>

              {/* Search Control: Pill-shaped field + Circular black arrow button + "Explore books" link */}
              <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-7 lg:mb-8">
                
                {/* Horizontal Search Field */}
                <form 
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center w-full max-w-[340px] sm:max-w-[360px] md:max-w-[380px]"
                >
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books, authors..."
                    aria-label="Search books, authors"
                    className="w-full bg-white text-[#080B0F] placeholder-[#536071]/70 text-sm sm:text-[15px] pl-6 pr-14 py-3 sm:py-3.5 rounded-full border border-[#080B0F] focus:outline-none focus:ring-2 focus:ring-[#FF4D16] transition-all shadow-xs"
                  />
                  
                  {/* Circular black button at the right containing a white right-pointing arrow */}
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="absolute right-1.5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#080B0F] hover:bg-[#FF4D16] text-white flex items-center justify-center transition-colors cursor-pointer group shadow-xs active:scale-95"
                  >
                    <ArrowRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </form>

                {/* Minimal text link: "Explore books" */}
                <button
                  type="button"
                  onClick={() => onNavigateBooks()}
                  className="text-sm sm:text-[15px] font-medium text-[#080B0F] hover:text-[#FF4D16] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center py-2 underline-offset-4 hover:underline"
                >
                  Explore books
                </button>

              </div>

              {/* Supporting Paragraph */}
              <p className="font-sans text-[14px] sm:text-[15px] lg:text-[16px] text-[#536071] leading-relaxed max-w-lg select-text">
                Regular reading allows you to better formulate your own thoughts. Our digital library will always help you make up your mind and find a book for every chapter.
              </p>

            </div>

            {/* =====================================================================
                RIGHT COLUMN (~52% of available width)
                Three oversized, realistic 3D books in orange, dark navy, and golden yellow
                ===================================================================== */}
            <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center lg:justify-end relative mt-6 lg:mt-0 w-full overflow-visible">
              <ThreeOversizedBooks
                onNavigateCategory={handleCategoryClick}
                onExploreAll={() => onNavigateBooks()}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Subtle bottom hallmark divider with minimal baseline details */}
      <footer className="w-full border-t border-[#EAE7E1] py-4 px-6 sm:px-12 lg:px-20 xl:px-24">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#536071]">
          <span>© OpenBook Digital Library · Free Universal Access</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigateBooks()} 
              className="hover:text-[#080B0F] transition-colors cursor-pointer"
            >
              Catalogue
            </button>
            <span className="text-neutral-300">·</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D16]" />
              <span>Public Archive</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};
