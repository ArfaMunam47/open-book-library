import React, { useEffect, useState } from 'react';
import { Book, Category } from '../types/library';
import { ArrowRight, Search, BookOpen, Users, Lightbulb, Leaf, Sparkles, Compass } from 'lucide-react';
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
  categories = [],
  loading = false,
  onRefreshBooks,
  onSelectCategory,
  onNavigateBooks,
  onNavigateCategories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHoveredArtwork, setIsHoveredArtwork] = useState(false);

  // Automatically refresh book catalog on mount to guarantee real-time count
  useEffect(() => {
    onRefreshBooks?.();
  }, [onRefreshBooks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    onNavigateBooks(query || undefined);
  };

  // Smooth scroll to the second experience (exploration & features)
  const handleScrollToExplore = () => {
    const target = document.getElementById('exploration-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic live count directly from database
  const bookCount = books.length;

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F7F3EC] text-[#181512] selection:bg-[#A52A22] selection:text-white font-body relative overflow-x-hidden">
      
      {/* =========================================================================
          EXPERIENCE 1: THE CLEAN HERO VIEWPORT
          - Streamlined Left Column: Generous breathing space, zero visual clutter,
            focused typography, clean dynamic counter badge, search, and warm handwriting.
          - Right Column: Preserved 3D architectural book portal enriched with
            subtle living atmospheric light, drifting sunbeams, and footsteps into knowledge.
          ========================================================================= */}
      <section className="relative w-full min-h-[calc(100vh-68px)] flex flex-col justify-between py-3 sm:py-4 lg:py-2 xl:py-3 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1536px] mx-auto">
        
        {/* Main 2-Column Hero Grid */}
        <div className="w-full flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center w-full">
            
            {/* =====================================================================
                LEFT COLUMN (~42% of desktop width) — CLEAN & BREATHABLE
                ===================================================================== */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-start z-10 text-left max-w-[540px]">
              
              {/* Eyebrow Label with terracotta accent line */}
              <div className="flex items-center gap-2.5 mb-3.5 sm:mb-4 lg:mb-3.5 xl:mb-4 select-none">
                <span className="text-[10.5px] sm:text-[11.5px] xl:text-xs font-semibold tracking-[0.24em] text-[#181512] uppercase font-sans">
                  THOUSANDS OF BOOKS. ONE LIBRARY.
                </span>
                <span className="w-7 sm:w-8 h-[1.5px] bg-[#A52A22] inline-block rounded-full" aria-hidden="true" />
              </div>

              {/* Bold Editorial Headline: Exactly three lines, strong visual punch */}
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[46px] xl:text-[56px] 2xl:text-[64px] font-bold leading-[1.03] tracking-[-0.02em] select-none mb-3 sm:mb-3.5 lg:mb-3 xl:mb-3.5">
                <span className="text-[#181512] block">A WORLD OF</span>
                <span className="text-[#A52A22] block font-bold">KNOWLEDGE.</span>
                <span className="text-[#181512] block whitespace-normal lg:whitespace-nowrap">WITHOUT WALLS.</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="font-body text-sm sm:text-base lg:text-[15px] xl:text-[16.5px] text-[#5E5852] font-normal leading-relaxed max-w-md mb-4 sm:mb-4.5 lg:mb-3.5 xl:mb-4 select-text">
                Discover. Read. Learn. Grow — All for Free.
              </p>

              {/* Functional Search Bar */}
              <form 
                onSubmit={handleSearchSubmit}
                className="relative flex items-center w-full max-w-[430px] xl:max-w-[470px] bg-white border border-[#D9CEC2] rounded-full h-11 sm:h-12 lg:h-11 xl:h-11.5 px-2 pl-4 sm:pl-5 shadow-[0_4px_16px_rgba(24,21,18,0.03)] focus-within:border-[#A52A22] focus-within:ring-2 focus-within:ring-[#A52A22]/20 transition-all mb-4 sm:mb-4.5 lg:mb-3.5 xl:mb-4 group"
              >
                <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#5E5852] shrink-0 mr-3 group-focus-within:text-[#A52A22] transition-colors" />
                <input
                  id="hero-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors, ideas..."
                  aria-label="Search books, authors, ideas"
                  className="w-full bg-transparent text-[#181512] placeholder-[#8B8177] text-xs sm:text-sm focus:outline-none pr-12 font-body"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-1 w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-[#A52A22] hover:bg-[#8E221B] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 group-hover:shadow-md"
                >
                  <ArrowRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </form>

              {/* Information Strip Below Search: Three Groups with Thin Neutral Separators */}
              <div className="w-full flex items-center gap-4 sm:gap-6 lg:gap-5 xl:gap-8 pt-3 border-t border-[#D9CEC2]/60 max-w-[430px] xl:max-w-[470px]">
                
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

              {/* Handwritten Annotation: Curved Arrow pointing to the Portal */}
              <div className="relative mt-3 sm:mt-3.5 ml-1 flex items-center gap-2 select-none">
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

            </div>

            {/* =====================================================================
                RIGHT COLUMN (~58% of desktop width)
                PRESERVED 3D ARTWORK WITH LIVING BOOK ATMOSPHERE
                - Artwork file, dimensions, proportions, and composition are 100% PRESERVED
                - Overlaid with gentle living light motes and warm sunbeam glow
                  that makes the girl's steps into the library feel naturally alive!
                ===================================================================== */}
            <div 
              className="lg:col-span-7 xl:col-span-7 flex items-center justify-center relative w-full mt-2 lg:-mt-4 xl:-mt-6 cursor-pointer group"
              onMouseEnter={() => setIsHoveredArtwork(true)}
              onMouseLeave={() => setIsHoveredArtwork(false)}
              onClick={() => onNavigateBooks()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigateBooks();
                }
              }}
              aria-label="Explore Open Source Digital Library collection"
            >
              
              {/* Static Artwork Container */}
              <div className="relative w-full max-w-[760px] lg:max-w-[820px] xl:max-w-[920px] 2xl:max-w-[980px] flex items-center justify-center select-none">
                
                {/* 1. Underlying Preserved 3D Book Portal Artwork */}
                <img 
                  src={grandLibraryPortal}
                  alt="Open Source Digital Library Grand Architectural Book Portal"
                  className="w-full h-auto max-h-[min(68vh,640px)] lg:max-h-[min(68vh,640px)] xl:max-h-[min(74vh,720px)] 2xl:max-h-[min(78vh,780px)] object-contain select-none transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                  referrerPolicy="no-referrer"
                />

                {/* 2. LIVING ATMOSPHERE: Warm Ambient Library Glow in the archway where she walks */}
                <div 
                  className={`absolute left-[38%] top-[28%] w-[26%] h-[50%] rounded-full pointer-events-none transition-opacity duration-700 ${
                    isHoveredArtwork ? 'opacity-80 scale-105' : 'opacity-45'
                  }`}
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255, 215, 140, 0.45) 0%, rgba(220, 140, 60, 0.18) 45%, transparent 70%)',
                    filter: 'blur(20px)',
                  }}
                  aria-hidden="true"
                />

                {/* 3. LIVING ATMOSPHERE: Floating Sunlit Dust Motes in the arched doorway */}
                <div className="absolute left-[40%] top-[34%] w-[20%] h-[40%] pointer-events-none overflow-hidden select-none" aria-hidden="true">
                  {/* Dust Mote 1 */}
                  <span 
                    className="absolute bottom-6 left-6 w-1.5 h-1.5 rounded-full bg-[#FFE5A3] shadow-[0_0_8px_#FFE5A3] animate-mote-1" 
                  />
                  {/* Dust Mote 2 */}
                  <span 
                    className="absolute bottom-12 left-14 w-1 h-1 rounded-full bg-[#FFD180] shadow-[0_0_6px_#FFD180] animate-mote-2" 
                  />
                  {/* Dust Mote 3 */}
                  <span 
                    className="absolute bottom-4 left-10 w-1.5 h-1.5 rounded-full bg-[#FFF3D6] shadow-[0_0_8px_#FFF3D6] animate-mote-3" 
                  />
                </div>

                {/* 4. LIVING ATMOSPHERE: Soft Footstep Shimmer on the book steps */}
                <div 
                  className="absolute left-[36%] bottom-[16%] w-[20%] h-[8%] rounded-full pointer-events-none animate-step-shimmer select-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255, 230, 170, 0.4) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                  aria-hidden="true"
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

        {/* =========================================================================
            BOTTOM OF HERO: MINIMALIST EDITORIAL SCROLL INVITATION
            A luxury vertical indicator inviting users to the second experience
            ========================================================================= */}
        <div className="w-full flex justify-between items-center pt-2 pb-1 border-t border-[#D9CEC2]/50 mt-2 select-none">
          
          <button
            type="button"
            onClick={handleScrollToExplore}
            className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer select-none opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Scroll to explore features and discovery"
          >
            <div className="relative w-[1.5px] h-6 sm:h-7 bg-[#D9CEC2] rounded-full overflow-hidden shrink-0">
              <div className="w-full h-2 bg-[#A52A22] rounded-full animate-scroll-dot" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9.5px] sm:text-[10px] tracking-[0.22em] font-semibold text-[#181512] uppercase font-sans group-hover:text-[#A52A22] transition-colors">
                SCROLL TO EXPLORE
              </span>
              <span className="text-[8.5px] text-[#5E5852] tracking-wider uppercase font-sans">
                Living Archive &amp; Community
              </span>
            </div>
          </button>

          {/* Quick catalog entry link */}
          <button
            type="button"
            onClick={() => onNavigateBooks()}
            className="text-[11px] font-medium text-[#5E5852] hover:text-[#A52A22] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>View All Volumes</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

        </div>

      </section>


      {/* =========================================================================
          EXPERIENCE 2: THE DIGITAL ARCHIVE & EXPLORATION
          Rich, informative second section below the hero:
          - Core Feature Pillars (Free Access, Open Source, Learn & Grow, A Greener Future)
          - Curated Category Quick Exploration Shelf
          - Dynamic Library Statistics & Direct Action to Catalog
          ========================================================================= */}
      <section 
        id="exploration-section"
        className="w-full border-t border-[#D9CEC2] bg-[#F7F3EC] py-12 sm:py-16 px-6 sm:px-10 lg:px-12 xl:px-16"
      >
        <div className="max-w-[1536px] mx-auto flex flex-col gap-12 sm:gap-16">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#D9CEC2]/70">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-[#A52A22]" />
                <span className="text-xs font-semibold tracking-[0.2em] text-[#A52A22] uppercase font-sans">
                  DISCOVER THE DIGITAL COMMONS
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#181512] leading-tight">
                Open Knowledge, Boundless Horizons.
              </h2>
            </div>
            <p className="font-body text-sm sm:text-base text-[#5E5852] max-w-md leading-relaxed">
              Every book in our digital library is preserved, indexed, and made universally available. No subscriptions, no expiration dates, and no barriers.
            </p>
          </div>

          {/* The 4 Feature Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Pillar 1: Free Access */}
            <div className="bg-white/60 hover:bg-white p-6 rounded-2xl border border-[#D9CEC2]/80 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EFE9DF] text-[#A52A22] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#181512] mb-2">
                  Free Access
                </h3>
                <p className="font-body text-xs sm:text-sm text-[#5E5852] leading-relaxed">
                  No paywalls, subscriptions, or credit cards. Download PDFs or read directly in your browser with zero limits.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#A52A22] mt-4 block uppercase tracking-wider">
                100% Unrestricted
              </span>
            </div>

            {/* Pillar 2: Open Source */}
            <div className="bg-white/60 hover:bg-white p-6 rounded-2xl border border-[#D9CEC2]/80 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EFE9DF] text-[#A52A22] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#181512] mb-2">
                  Open Source
                </h3>
                <p className="font-body text-xs sm:text-sm text-[#5E5852] leading-relaxed">
                  Powered by an international community of developers, archivists, and readers dedicated to knowledge preservation.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#A52A22] mt-4 block uppercase tracking-wider">
                Community Driven
              </span>
            </div>

            {/* Pillar 3: Learn & Grow */}
            <div className="bg-white/60 hover:bg-white p-6 rounded-2xl border border-[#D9CEC2]/80 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EFE9DF] text-[#A52A22] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#181512] mb-2">
                  Learn &amp; Grow
                </h3>
                <p className="font-body text-xs sm:text-sm text-[#5E5852] leading-relaxed">
                  Carefully organized literature across sciences, humanities, technology, philosophy, and historical classics.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#A52A22] mt-4 block uppercase tracking-wider">
                Curated Wisdom
              </span>
            </div>

            {/* Pillar 4: A Greener Future */}
            <div className="bg-white/60 hover:bg-white p-6 rounded-2xl border border-[#D9CEC2]/80 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EFE9DF] text-[#A52A22] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Leaf className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#181512] mb-2">
                  A Greener Future
                </h3>
                <p className="font-body text-xs sm:text-sm text-[#5E5852] leading-relaxed">
                  Digital preservation and reading reduces paper consumption, shipping emissions, and ecological impact.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#A52A22] mt-4 block uppercase tracking-wider">
                Zero Footprint
              </span>
            </div>

          </div>

          {/* Curated Category Quick-Browse Shelf */}
          {categories.length > 0 && (
            <div className="flex flex-col gap-4 p-8 rounded-2xl bg-[#EFE9DF]/70 border border-[#D9CEC2]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-2xl font-bold text-[#181512]">
                    Explore by Subject
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-[#5E5852]">
                    Jump straight into specific domains of interest.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateCategories}
                  className="text-xs font-semibold uppercase tracking-wider text-[#A52A22] hover:underline cursor-pointer"
                >
                  All Categories ({categories.length}) →
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateBooks()}
                  className="px-4 py-2 rounded-full bg-white text-[#181512] hover:bg-[#A52A22] hover:text-white border border-[#D9CEC2] text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  All Titles ({bookCount})
                </button>
                {categories.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="px-4 py-2 rounded-full bg-white/80 text-[#181512] hover:bg-[#A52A22] hover:text-white border border-[#D9CEC2] text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Library Stats Strip & Catalog Callout */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-[#181512] text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
              <div className="flex flex-col">
                <span className="font-editorial text-3xl sm:text-4xl font-bold text-[#FFE5A3]">
                  {bookCount}+
                </span>
                <span className="text-xs text-stone-400 font-sans uppercase tracking-wider mt-1">
                  Available Volumes
                </span>
              </div>
              <div className="h-10 w-[1px] bg-stone-700 hidden sm:block" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="font-editorial text-3xl sm:text-4xl font-bold text-white">
                  100%
                </span>
                <span className="text-xs text-stone-400 font-sans uppercase tracking-wider mt-1">
                  Public Domain &amp; Open
                </span>
              </div>
              <div className="h-10 w-[1px] bg-stone-700 hidden sm:block" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="font-editorial text-3xl sm:text-4xl font-bold text-white">
                  Zero
                </span>
                <span className="text-xs text-stone-400 font-sans uppercase tracking-wider mt-1">
                  Fees or Tracking
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateBooks()}
              className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#A52A22] hover:bg-[#B7332A] text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <span>Explore All {bookCount} Books</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Simple Minimalist Footer */}
          <div className="pt-6 border-t border-[#D9CEC2]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5E5852]">
            <p>
              © {new Date().getFullYear()} OpenBook Digital Library. Built for universal access to human knowledge.
            </p>
            <div className="flex items-center gap-6">
              <button 
                type="button" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="hover:text-[#181512] transition-colors cursor-pointer"
              >
                Back to Top ↑
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
