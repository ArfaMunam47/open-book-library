import React, { useEffect } from 'react';
import { Book, Category } from '../types/library';
import { ArrowRight, Search, BookOpen, Users, Lightbulb, Leaf } from 'lucide-react';
import grandLibraryPortal from '../assets/images/grand_library_portal_transparent.webp';

interface HomeViewProps {
  books: Book[];
  categories: Category[];
  loading?: boolean;
  onRefreshBooks?: () => void;
  onOpenBook: (bookId: string) => void;
  onReadOnline: (bookId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onNavigateBooks: (searchQuery?: string, categoryId?: string) => void;
  onNavigateCategories: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  books = [],
  loading = false,
  onRefreshBooks,
  onNavigateBooks,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Automatically refresh book catalog on mount to guarantee real-time count
  useEffect(() => {
    onRefreshBooks?.();
  }, [onRefreshBooks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    onNavigateBooks(query || undefined);
  };

  // Smooth scroll to next section (features strip)
  const handleScrollToNext = () => {
    const target = document.getElementById('features-strip');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic live count directly from database
  const bookCount = books.length;

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#F7F3EC] text-[#181512] selection:bg-[#A52A22] selection:text-white font-body relative overflow-x-hidden min-h-0">
      
      {/* =========================================================================
          HERO SECTION (BALANCED FOR FULL SINGLE-VIEWPORT DESKTOP COMPOSITION)
          - Left Column (~42% width): Tagline, Bold Playfair Headline, Description, Search, Stats, Arrow & Scroll Indicator
          - Right Column (~58% width): Enlarged Static Transparent 3D Architectural Book Portal
          ========================================================================= */}
      <section className="relative w-full flex-1 flex flex-col justify-center py-2 sm:py-3 lg:py-1 xl:py-2 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1536px] mx-auto min-h-0">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
            
            {/* =====================================================================
                LEFT COLUMN (~42% of desktop width)
                Carefully spaced elements with zero collision with artwork
                ===================================================================== */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-start z-10 text-left max-w-[540px]">
              
              {/* Introductory Eyebrow Label: "THOUSANDS OF BOOKS. ONE LIBRARY. —" */}
              <div className="flex items-center gap-2.5 mb-3.5 sm:mb-4 lg:mb-3.5 xl:mb-4 select-none">
                <span className="text-[10.5px] sm:text-[11.5px] xl:text-xs font-semibold tracking-[0.24em] text-[#181512] uppercase font-sans">
                  THOUSANDS OF BOOKS. ONE LIBRARY.
                </span>
                <span className="w-7 sm:w-8 h-[1.5px] bg-[#A52A22] inline-block rounded-full" aria-hidden="true" />
              </div>

              {/* Main Headline: Bold, Highly Readable Editorial Serif (Playfair Display)
                  Weight 700, no hairline artifacts, exactly THREE LINES on desktop:
                  Line 1: A WORLD OF (Near black #181512)
                  Line 2: KNOWLEDGE. (Deep terracotta #A52A22)
                  Line 3: WITHOUT WALLS. (Near black #181512)
                  Protected with safe margins so it never touches the 3D book.
              */}
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[46px] xl:text-[56px] 2xl:text-[64px] font-bold leading-[1.03] tracking-[-0.02em] select-none mb-3.5 sm:mb-4 lg:mb-3.5 xl:mb-4">
                <span className="text-[#181512] block">A WORLD OF</span>
                <span className="text-[#A52A22] block font-bold">KNOWLEDGE.</span>
                <span className="text-[#181512] block whitespace-normal lg:whitespace-nowrap">WITHOUT WALLS.</span>
              </h1>

              {/* Supporting Description */}
              <p className="font-body text-sm sm:text-base lg:text-[15px] xl:text-[16.5px] text-[#5E5852] font-normal leading-relaxed max-w-md mb-4 sm:mb-5 lg:mb-4 xl:mb-4.5 select-text">
                Discover. Read. Learn. Grow — All for Free.
              </p>

              {/* Functional Search Bar: Pill Shape with Outline Icon and Circular Terracotta Arrow Button */}
              <form 
                onSubmit={handleSearchSubmit}
                className="relative flex items-center w-full max-w-[430px] xl:max-w-[470px] bg-white border border-[#D9CEC2] rounded-full h-11 sm:h-12 lg:h-11 xl:h-11.5 px-2 pl-4 sm:pl-5 shadow-[0_4px_16px_rgba(24,21,18,0.03)] focus-within:border-[#A52A22] focus-within:ring-2 focus-within:ring-[#A52A22]/20 transition-all mb-4 sm:mb-4.5 lg:mb-3.5 xl:mb-4 group"
              >
                {/* Outlined Magnifying Glass */}
                <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#5E5852] shrink-0 mr-3 group-focus-within:text-[#A52A22] transition-colors" />
                
                {/* Real Input field */}
                <input
                  id="hero-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors, ideas..."
                  aria-label="Search books, authors, ideas"
                  className="w-full bg-transparent text-[#181512] placeholder-[#8B8177] text-xs sm:text-sm focus:outline-none pr-12 font-body"
                />

                {/* Circular Terracotta Button with White Right Arrow */}
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-1 w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-[#A52A22] hover:bg-[#8E221B] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 group-hover:shadow-md"
                >
                  <ArrowRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </form>

              {/* Information Strip Below Search: Three Groups with Thin Neutral Separators */}
              <div className="w-full flex items-center gap-4 sm:gap-6 lg:gap-5 xl:gap-8 pt-3 border-t border-[#D9CEC2]/60 max-w-[430px] xl:max-w-[460px]">
                
                {/* First Group: Dynamic Live Book Count from Database */}
                <div className="flex flex-col">
                  <div className="font-editorial text-xl sm:text-2xl xl:text-[26px] font-bold text-[#A52A22] leading-none mb-0.5 min-h-[26px] flex items-center">
                    {loading && books.length === 0 ? (
                      <span className="inline-block w-8 h-6 bg-[#D9CEC2]/60 rounded animate-pulse" />
                    ) : (
                      <span>{bookCount}</span>
                    )}
                  </div>
                  <span className="font-body text-[10px] sm:text-xs font-semibold text-[#181512] tracking-wider uppercase">
                    Books
                  </span>
                </div>

                {/* Divider Line */}
                <div className="h-7 w-[1px] bg-[#D9CEC2]" aria-hidden="true" />

                {/* Second Group: Free For Everyone */}
                <div className="flex flex-col">
                  <span className="font-editorial text-lg sm:text-xl xl:text-[22px] font-bold text-[#181512] leading-none mb-0.5 min-h-[26px] flex items-center">
                    Free
                  </span>
                  <span className="font-body text-[10px] sm:text-xs text-[#5E5852]">
                    For Everyone
                  </span>
                </div>

                {/* Divider Line */}
                <div className="h-7 w-[1px] bg-[#D9CEC2]" aria-hidden="true" />

                {/* Third Group: Open Source Community Driven */}
                <div className="flex flex-col">
                  <span className="font-editorial text-lg sm:text-xl xl:text-[22px] font-bold text-[#181512] leading-none mb-0.5 min-h-[26px] flex items-center">
                    Open Source
                  </span>
                  <span className="font-body text-[10px] sm:text-xs text-[#5E5852]">
                    Community Driven
                  </span>
                </div>

              </div>

              {/* Handwritten Annotation: Curved Arrow pointing to the Portal + "Your next chapter is here." */}
              <div className="relative mt-3.5 sm:mt-4 lg:mt-3 xl:mt-3.5 ml-1 flex items-center gap-2 select-none">
                <svg 
                  className="w-8 h-7 sm:w-9 sm:h-8 text-[#181512] shrink-0" 
                  viewBox="0 0 48 40" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 34C12 24 22 14 36 8" />
                  <path d="M26 6L37 8L34 19" />
                </svg>
                <div className="flex flex-col -rotate-3">
                  <span className="font-handwriting text-base sm:text-lg xl:text-xl font-bold text-[#181512] leading-tight">
                    Your next chapter
                  </span>
                  <span className="font-handwriting text-base sm:text-lg xl:text-xl font-bold text-[#181512] leading-tight">
                    is here.
                  </span>
                </div>
              </div>

              {/* MINIMALIST EDITORIAL SCROLL INDICATOR
                  - Thin vertical track with gently travelling terracotta dot
                  - Tiny uppercase label reading "SCROLL TO EXPLORE"
                  - Smoothly scrolls to the bottom feature strip when clicked
              */}
              <button
                type="button"
                onClick={handleScrollToNext}
                className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer mt-3 sm:mt-3.5 lg:mt-2.5 xl:mt-3 ml-1 select-none opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Scroll to explore features"
              >
                {/* Minimalist vertical line with smooth travelling dot */}
                <div className="relative w-[1.5px] h-6 sm:h-7 bg-[#D9CEC2] rounded-full overflow-hidden shrink-0">
                  <div className="w-full h-2 bg-[#A52A22] rounded-full animate-scroll-dot" />
                </div>

                {/* Tiny uppercase label */}
                <div className="flex flex-col">
                  <span className="text-[9.5px] sm:text-[10px] tracking-[0.22em] font-semibold text-[#181512] uppercase font-sans group-hover:text-[#A52A22] transition-colors">
                    SCROLL TO EXPLORE
                  </span>
                  <span className="text-[8.5px] text-[#5E5852] tracking-wider uppercase font-sans">
                    Features &amp; Access
                  </span>
                </div>
              </button>

            </div>

            {/* =====================================================================
                RIGHT COLUMN (~58% of desktop width)
                ENLARGED STATIC 3D ARCHITECTURAL BOOK PORTAL
                - Preserved original transparent artwork without changes
                - Visibly enlarged by ~25-30%
                - Completely static: Zero cursor tracking, zero tilt, zero overlays, zero hover CTA button
                - Seamless integration directly on the warm ivory website background
                ===================================================================== */}
            <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center relative w-full mt-2 lg:-mt-4 xl:-mt-6">
              
              {/* Static Artwork Container: completely stable, no mouse tracking, no hover overlays */}
              <div className="relative w-full max-w-[760px] lg:max-w-[820px] xl:max-w-[920px] 2xl:max-w-[980px] flex items-center justify-center select-none pointer-events-none">
                <img 
                  src={grandLibraryPortal}
                  alt="Open Source Digital Library Grand Architectural Book Portal"
                  className="w-full h-auto max-h-[min(68vh,640px)] lg:max-h-[min(68vh,640px)] xl:max-h-[min(74vh,720px)] 2xl:max-h-[min(78vh,780px)] object-contain select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Bottom-Right Curved Decorative Stamp matching reference */}
              <div 
                className="hidden 2xl:flex absolute -bottom-2 right-0 pointer-events-none select-none w-28 h-28 items-center justify-center opacity-75"
                aria-hidden="true"
              >
                <svg viewBox="0 0 160 160" className="w-full h-full text-[#A52A22]/70">
                  <path
                    id="sealCirclePath"
                    d="M 80, 80 m -60, 0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0"
                    fill="none"
                  />
                  <text className="text-[10px] font-mono tracking-[0.22em] uppercase fill-[#A52A22]">
                    <textPath href="#sealCirclePath" startOffset="0%">
                      KNOWLEDGE FOR A BRIGHTER TOMORROW ·
                    </textPath>
                  </text>
                  {/* Center Star Emblem */}
                  <polygon 
                    points="80,68 83,77 92,80 83,83 80,92 77,83 68,80 77,77" 
                    fill="#A52A22" 
                    opacity="0.8"
                  />
                </svg>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM FEATURE STRIP
          Clean horizontal strip with 4 evenly spaced columns separated by thin lines:
          1. Free Access: No paywalls. No limits.
          2. Open Source: Built by a global community.
          3. Learn & Grow: Knowledge for every mindset.
          4. A Greener Future: Digital books. A smaller footprint.
          Target ID "features-strip" connects to the "SCROLL TO EXPLORE" indicator.
          ========================================================================= */}
      <footer 
        id="features-strip"
        className="w-full border-t border-[#D9CEC2]/70 bg-[#F7F3EC] py-3 sm:py-3.5 lg:py-2.5 xl:py-3 px-6 sm:px-10 lg:px-12 xl:px-16 z-10 shrink-0"
      >
        <div className="max-w-[1536px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-0 items-center">
            
            {/* Feature 1: Free Access */}
            <div className="flex items-center gap-3.5 lg:px-6 xl:px-8 first:lg:pl-0 lg:border-r lg:border-[#D9CEC2]/70 group transition-transform hover:-translate-y-0.5 duration-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[#181512] transition-colors group-hover:text-[#A52A22]">
                <BookOpen className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-editorial text-base sm:text-lg font-bold text-[#181512] leading-tight">
                  Free Access
                </span>
                <span className="font-body text-[11px] sm:text-xs text-[#5E5852] mt-0.5">
                  No paywalls. No limits.
                </span>
              </div>
            </div>

            {/* Feature 2: Open Source */}
            <div className="flex items-center gap-3.5 lg:px-6 xl:px-8 lg:border-r lg:border-[#D9CEC2]/70 group transition-transform hover:-translate-y-0.5 duration-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[#181512] transition-colors group-hover:text-[#A52A22]">
                <Users className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-editorial text-base sm:text-lg font-bold text-[#181512] leading-tight">
                  Open Source
                </span>
                <span className="font-body text-[11px] sm:text-xs text-[#5E5852] mt-0.5">
                  Built by a global community.
                </span>
              </div>
            </div>

            {/* Feature 3: Learn & Grow */}
            <div className="flex items-center gap-3.5 lg:px-6 xl:px-8 lg:border-r lg:border-[#D9CEC2]/70 group transition-transform hover:-translate-y-0.5 duration-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[#181512] transition-colors group-hover:text-[#A52A22]">
                <Lightbulb className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-editorial text-base sm:text-lg font-bold text-[#181512] leading-tight">
                  Learn &amp; Grow
                </span>
                <span className="font-body text-[11px] sm:text-xs text-[#5E5852] mt-0.5">
                  Knowledge for every mindset.
                </span>
              </div>
            </div>

            {/* Feature 4: A Greener Future */}
            <div className="flex items-center gap-3.5 lg:px-6 xl:px-8 last:lg:pr-0 group transition-transform hover:-translate-y-0.5 duration-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[#181512] transition-colors group-hover:text-[#A52A22]">
                <Leaf className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-editorial text-base sm:text-lg font-bold text-[#181512] leading-tight">
                  A Greener Future
                </span>
                <span className="font-body text-[11px] sm:text-xs text-[#5E5852] mt-0.5">
                  Digital books. A smaller footprint.
                </span>
              </div>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
};
