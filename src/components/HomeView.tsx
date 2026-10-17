import React, { useEffect, useState, useMemo } from 'react';
import { Book, Category } from '../types/library';
import { 
  ArrowRight, 
  Search, 
  BookOpen, 
  Users, 
  Lightbulb, 
  Leaf, 
  Sparkles, 
  Compass, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Cpu, 
  Sun, 
  Library, 
  LayoutGrid,
  ExternalLink,
  Download,
  BookMarked
} from 'lucide-react';
import { downloadBookPdf, formatFileSize } from '../lib/api';

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
  onOpenBook,
  onReadOnline,
  onSelectCategory,
  onNavigateBooks,
  onNavigateCategories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchCategory, setSelectedSearchCategory] = useState<string>('all');
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  // Automatically refresh book catalog on mount to guarantee real-time count
  useEffect(() => {
    onRefreshBooks?.();
  }, [onRefreshBooks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const cat = selectedSearchCategory !== 'all' ? selectedSearchCategory : undefined;
    onNavigateBooks(query || undefined, cat);
  };

  // Dynamic live count directly from database
  const bookCount = books.length;

  // Curate 7 real books for the signature symmetrical hero cover composition
  const heroBooks = useMemo(() => {
    if (books.length === 0) return [];
    
    // Prioritize books with real covers
    const withCovers = books.filter(b => Boolean(b.cover_url && b.cover_url.trim().length > 0));
    const pool = withCovers.length >= 7 ? withCovers : books;

    // Symmetrical layout needs 7 books:
    // [farLeftTop, farLeftBottom], [midLeft], [centerHero], [midRight], [farRightTop, farRightBottom]
    return pool.slice(0, 7);
  }, [books]);

  // Featured books for the "Deciding What to Read Next?" section (4 curated books)
  const featuredBooks = useMemo(() => {
    if (books.length <= 4) return books;
    // Pick 4 diverse books from different categories if possible
    const selected: Book[] = [];
    const usedCats = new Set<string>();
    
    for (const b of books) {
      if (!usedCats.has(b.category_id)) {
        selected.push(b);
        usedCats.add(b.category_id);
      }
      if (selected.length === 4) break;
    }
    
    if (selected.length < 4) {
      for (const b of books) {
        if (!selected.some(s => s.id === b.id)) {
          selected.push(b);
        }
        if (selected.length === 4) break;
      }
    }
    return selected;
  }, [books]);

  // Dynamic count of books per category
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of books) {
      map.set(b.category_id, (map.get(b.category_id) || 0) + 1);
    }
    return map;
  }, [books]);

  // Category Icon Resolver
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('finance') || n.includes('money')) return <TrendingUp className="w-4.5 h-4.5" />;
    if (n.includes('business')) return <Briefcase className="w-4.5 h-4.5" />;
    if (n.includes('education')) return <GraduationCap className="w-4.5 h-4.5" />;
    if (n.includes('tech') || n.includes('it')) return <Cpu className="w-4.5 h-4.5" />;
    if (n.includes('health')) return <Heart className="w-4.5 h-4.5" />;
    if (n.includes('fiction')) return <BookMarked className="w-4.5 h-4.5" />;
    if (n.includes('religion') || n.includes('philosophy')) return <Sun className="w-4.5 h-4.5" />;
    if (n.includes('family') || n.includes('relationships')) return <Users className="w-4.5 h-4.5" />;
    return <Layers className="w-4.5 h-4.5" />;
  };

  // Typographic Cover Fallback Generator
  const renderBookCover = (book: Book, className: string = '', isLarge: boolean = false) => {
    if (book.cover_url) {
      return (
        <img
          src={book.cover_url}
          alt={`Cover of ${book.title}`}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center ${className}`}
        />
      );
    }

    // Elegant typographic fallback
    const palette = [
      'bg-[#292A27] text-[#F8F8F4]',
      'bg-[#3E403B] text-[#E8EAE2]',
      'bg-[#4A453F] text-[#F8F8F4]',
      'bg-[#2A342B] text-[#DDE0D5]',
      'bg-[#382D32] text-[#F8F8F4]'
    ];
    const colorIndex = Math.abs(book.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % palette.length;
    const bgClass = palette[colorIndex];

    return (
      <div className={`w-full h-full p-4 flex flex-col justify-between ${bgClass} border-r-2 border-white/10 ${className}`}>
        <div className="border-b border-white/15 pb-1">
          <span className="text-[8.5px] font-mono tracking-widest uppercase opacity-75 block truncate">
            {book.category_name || 'OpenBook Archive'}
          </span>
        </div>
        <div className="my-auto py-2">
          <h4 className={`font-serif font-bold leading-tight line-clamp-3 ${isLarge ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}`}>
            {book.title}
          </h4>
          <p className="text-[10px] italic font-serif mt-1 opacity-80 line-clamp-1">
            {book.author || 'Unknown Author'}
          </p>
        </div>
        <div className="flex items-center justify-between text-[8px] font-mono border-t border-white/15 pt-1 opacity-70">
          <span>{book.page_count ? `${book.page_count}p` : 'PDF'}</span>
          <span>{formatFileSize(book.file_size)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F8F8F4] text-[#292A27] selection:bg-[#E8EAE2] selection:text-[#292A27] font-body relative overflow-x-hidden">
      
      {/* =========================================================================
          HERO SECTION (SECTIONS B, C, D, E)
          Exact translation of the Pinterest reference:
          - Centered editorial title: "Discover & Read {count} Books"
          - Wide centered search bar with category selector dropdown
          - Signature symmetrical multi-tiered book-cover composition
          - Horizontal row of 5 minimalist feature shortcuts
          ========================================================================= */}
      <section className="relative w-full pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* SECTION B: Large Centered Editorial Heading */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[#E8EAE2]/70 border border-[#DDE0D5] text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#292A27]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C98187]" />
            <span>Open Access Public Domain Collection</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#292A27] leading-[1.12]">
            Discover &amp; Read{' '}
            <span className="text-[#C98187] font-serif italic font-normal">
              {bookCount > 0 ? `${bookCount}+ Books` : 'Books'}
            </span>
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#85857E] mt-3 max-w-xl mx-auto leading-relaxed">
            Explore a growing collection of books, discover new ideas, and find your next great read with universal browser reading.
          </p>
        </div>

        {/* SECTION C: Wide Elegant Search Bar with Category Selector */}
        <div className="max-w-2xl lg:max-w-3xl mx-auto mb-12 sm:mb-16">
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-full border border-[#E8E8E2] shadow-[0_4px_20px_rgba(41,42,39,0.05)] p-1.5 sm:p-2 pl-4 sm:pl-5 flex items-center gap-2 sm:gap-3 focus-within:border-[#C98187] focus-within:ring-2 focus-within:ring-[#C98187]/20 transition-all"
          >
            {/* Category Dropdown Selector on Left */}
            <div className="relative shrink-0 hidden sm:flex items-center gap-1.5 pr-3 border-r border-[#E8E8E2] text-xs font-medium text-[#292A27]">
              <LayoutGrid className="w-3.5 h-3.5 text-[#85857E]" />
              <select
                aria-label="Filter by category"
                value={selectedSearchCategory}
                onChange={(e) => setSelectedSearchCategory(e.target.value)}
                className="bg-transparent text-[#292A27] text-xs focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-[#85857E] pointer-events-none -ml-3">▾</span>
            </div>

            {/* Search Input Field */}
            <input
              id="hero-search-input"
              type="text"
              placeholder="Type to search books, authors, subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#292A27] placeholder-[#85857E] focus:outline-none py-1.5 font-sans"
            />

            {/* Circular Search Action Button */}
            <button
              type="submit"
              aria-label="Execute search"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#292A27] hover:bg-[#3E403B] text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Search className="w-4 h-4 text-white stroke-[2.2]" />
            </button>
          </form>
        </div>

        {/* SECTION D: Beautiful Symmetrical Book-Cover Composition */}
        <div className="w-full max-w-5xl mx-auto mb-14 sm:mb-20">
          {heroBooks.length >= 3 ? (
            <div className="relative flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 min-h-[300px] sm:min-h-[360px] select-none py-4">
              
              {/* Outer Left Column: 2 Stacked Smaller Book Covers */}
              {heroBooks[0] && (
                <div className="hidden lg:flex flex-col gap-4 shrink-0">
                  {/* Top Book */}
                  <div
                    onClick={() => onOpenBook(heroBooks[0].id)}
                    className="w-24 xl:w-28 aspect-[2/3] rounded-md overflow-hidden shadow-md border border-[#E8E8E2] cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group"
                    title={heroBooks[0].title}
                  >
                    {renderBookCover(heroBooks[0])}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>

                  {/* Bottom Book */}
                  {heroBooks[1] && (
                    <div
                      onClick={() => onOpenBook(heroBooks[1].id)}
                      className="w-24 xl:w-28 aspect-[2/3] rounded-md overflow-hidden shadow-md border border-[#E8E8E2] cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group"
                      title={heroBooks[1].title}
                    >
                      {renderBookCover(heroBooks[1])}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    </div>
                  )}
                </div>
              )}

              {/* Mid-Left Book: Medium Upright Cover */}
              {heroBooks[2] && (
                <div
                  onClick={() => onOpenBook(heroBooks[2].id)}
                  className="w-32 sm:w-36 md:w-44 lg:w-48 aspect-[2/3] rounded-r-md overflow-hidden shadow-xl border border-[#E8E8E2] cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative group shrink-0"
                  title={`${heroBooks[2].title} by ${heroBooks[2].author}`}
                >
                  {renderBookCover(heroBooks[2])}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[11px] font-serif text-white font-bold truncate">{heroBooks[2].title}</p>
                    <p className="text-[9px] text-[#E8EAE2] truncate">{heroBooks[2].author}</p>
                  </div>
                </div>
              )}

              {/* CENTER HERO BOOK: Largest, Upright, Signature Focus */}
              {heroBooks[3] && (
                <div
                  onClick={() => onOpenBook(heroBooks[3].id)}
                  className="w-40 sm:w-48 md:w-56 lg:w-64 aspect-[2/3] rounded-r-md overflow-hidden shadow-2xl border-2 border-white/80 cursor-pointer hover:-translate-y-3 hover:scale-[1.02] transition-all duration-300 relative group z-20 shrink-0"
                  title={`${heroBooks[3].title} by ${heroBooks[3].author}`}
                >
                  {renderBookCover(heroBooks[3], '', true)}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-[#C98187] block">Featured Volume</span>
                    <p className="text-xs sm:text-sm font-serif text-white font-bold line-clamp-1">{heroBooks[3].title}</p>
                    <p className="text-[10px] text-[#E8EAE2] truncate">{heroBooks[3].author}</p>
                  </div>
                </div>
              )}

              {/* Mid-Right Book: Medium Upright Cover */}
              {heroBooks[4] && (
                <div
                  onClick={() => onOpenBook(heroBooks[4].id)}
                  className="w-32 sm:w-36 md:w-44 lg:w-48 aspect-[2/3] rounded-r-md overflow-hidden shadow-xl border border-[#E8E8E2] cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative group shrink-0"
                  title={`${heroBooks[4].title} by ${heroBooks[4].author}`}
                >
                  {renderBookCover(heroBooks[4])}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[11px] font-serif text-white font-bold truncate">{heroBooks[4].title}</p>
                    <p className="text-[9px] text-[#E8EAE2] truncate">{heroBooks[4].author}</p>
                  </div>
                </div>
              )}

              {/* Outer Right Column: 2 Stacked Smaller Book Covers */}
              {heroBooks[5] && (
                <div className="hidden lg:flex flex-col gap-4 shrink-0">
                  {/* Top Book */}
                  <div
                    onClick={() => onOpenBook(heroBooks[5].id)}
                    className="w-24 xl:w-28 aspect-[2/3] rounded-md overflow-hidden shadow-md border border-[#E8E8E2] cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group"
                    title={heroBooks[5].title}
                  >
                    {renderBookCover(heroBooks[5])}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>

                  {/* Bottom Book */}
                  {heroBooks[6] && (
                    <div
                      onClick={() => onOpenBook(heroBooks[6].id)}
                      className="w-24 xl:w-28 aspect-[2/3] rounded-md overflow-hidden shadow-md border border-[#E8E8E2] cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group"
                      title={heroBooks[6].title}
                    >
                      {renderBookCover(heroBooks[6])}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 text-center text-[#85857E]">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Loading bookstore library collection...</p>
            </div>
          )}
        </div>

        {/* SECTION E: Library Benefits & Feature Shortcuts (5 Minimalist Shortcuts) */}
        <div className="w-full max-w-4xl mx-auto pt-4 border-t border-[#E8E8E2]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* Shortcut 1: Browse Books */}
            <button
              onClick={() => onNavigateBooks()}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white border border-[#E8E8E2] hover:border-[#C98187] hover:bg-[#F8F8F4] transition-all group cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8EAE2] group-hover:bg-[#C98187]/15 flex items-center justify-center text-[#292A27] group-hover:text-[#C98187] transition-colors mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#292A27] group-hover:text-[#C98187] transition-colors">
                Browse Books
              </span>
              <span className="text-[9.5px] text-[#85857E] mt-0.5">
                Complete Catalog
              </span>
            </button>

            {/* Shortcut 2: Categories */}
            <button
              onClick={() => onNavigateCategories()}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white border border-[#E8E8E2] hover:border-[#C98187] hover:bg-[#F8F8F4] transition-all group cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8EAE2] group-hover:bg-[#C98187]/15 flex items-center justify-center text-[#292A27] group-hover:text-[#C98187] transition-colors mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#292A27] group-hover:text-[#C98187] transition-colors">
                Categories
              </span>
              <span className="text-[9.5px] text-[#85857E] mt-0.5">
                {categories.length} Curated Topics
              </span>
            </button>

            {/* Shortcut 3: Recently Added */}
            <button
              onClick={() => onNavigateBooks()}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white border border-[#E8E8E2] hover:border-[#C98187] hover:bg-[#F8F8F4] transition-all group cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8EAE2] group-hover:bg-[#C98187]/15 flex items-center justify-center text-[#292A27] group-hover:text-[#C98187] transition-colors mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#292A27] group-hover:text-[#C98187] transition-colors">
                Recently Added
              </span>
              <span className="text-[9.5px] text-[#85857E] mt-0.5">
                Fresh Arrivals
              </span>
            </button>

            {/* Shortcut 4: Digital Reader */}
            <button
              onClick={() => {
                if (books.length > 0) {
                  onReadOnline(books[0].id);
                } else {
                  onNavigateBooks();
                }
              }}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white border border-[#E8E8E2] hover:border-[#C98187] hover:bg-[#F8F8F4] transition-all group cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8EAE2] group-hover:bg-[#C98187]/15 flex items-center justify-center text-[#292A27] group-hover:text-[#C98187] transition-colors mb-2">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#292A27] group-hover:text-[#C98187] transition-colors">
                Digital Reader
              </span>
              <span className="text-[9.5px] text-[#85857E] mt-0.5">
                Instant In-Browser
              </span>
            </button>

            {/* Shortcut 5: About Library */}
            <button
              onClick={() => {
                const el = document.getElementById('about-library-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white border border-[#E8E8E2] hover:border-[#C98187] hover:bg-[#F8F8F4] transition-all group cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8EAE2] group-hover:bg-[#C98187]/15 flex items-center justify-center text-[#292A27] group-hover:text-[#C98187] transition-colors mb-2">
                <Library className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#292A27] group-hover:text-[#C98187] transition-colors">
                About Library
              </span>
              <span className="text-[9.5px] text-[#85857E] mt-0.5">
                Mission &amp; Values
              </span>
            </button>

          </div>
        </div>

      </section>


      {/* =========================================================================
          SECTION F: EXPLORE CATEGORIES (Clean Grid matching Pinterest reference)
          ========================================================================= */}
      <section className="w-full bg-[#F8F8F4] border-t border-[#E8E8E2] py-14 sm:py-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex items-end justify-between pb-6 mb-8 border-b border-[#E8E8E2]">
            <div>
              <span className="text-xs uppercase font-sans tracking-[0.2em] font-semibold text-[#C98187] block mb-1">
                TOP CATEGORIES
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#292A27]">
                Explore Categories
              </h2>
            </div>
            
            <button
              onClick={onNavigateCategories}
              className="text-xs font-semibold tracking-wider uppercase text-[#292A27] hover:text-[#C98187] flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Categories Grid (4 columns on desktop, 2 on tablet/mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.slice(0, 8).map((cat) => {
              const count = categoryCounts.get(cat.id) || 0;
              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="bg-white rounded-xl border border-[#E8E8E2] hover:border-[#DDE0D5] p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-xs hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#E8EAE2] group-hover:bg-[#C98187]/15 text-[#292A27] group-hover:text-[#C98187] flex items-center justify-center shrink-0 transition-colors">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#292A27] group-hover:text-[#C98187] transition-colors truncate">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#85857E] font-sans mt-0.5">
                      {count} {count === 1 ? 'book' : 'books'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION G: POPULAR OR FEATURED BOOKS ("Deciding What to Read Next?")
          Rendered on a soft sage green background (#E8EAE2) matching the reference!
          ========================================================================= */}
      <section className="w-full bg-[#E8EAE2] border-t border-[#DDE0D5] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex items-end justify-between pb-6 mb-8 border-b border-[#DDE0D5]">
            <div>
              <span className="text-xs uppercase font-sans tracking-[0.2em] font-semibold text-[#C98187] block mb-1">
                CURATED SELECTION
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#292A27]">
                Deciding What to Read Next?
              </h2>
            </div>

            <button
              onClick={() => onNavigateBooks()}
              className="text-xs font-semibold tracking-wider uppercase text-[#292A27] hover:text-[#C98187] flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* 4 Books Per Row Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {featuredBooks.map((book) => (
              <article
                key={book.id}
                onClick={() => onOpenBook(book.id)}
                className="bg-white rounded-xl border border-[#DDE0D5] overflow-hidden flex flex-col justify-between p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group"
              >
                <div>
                  {/* Book Cover Container with clean margins */}
                  <div className="relative aspect-[2/3] w-full bg-[#F8F8F4] rounded-lg overflow-hidden border border-[#E8E8E2] mb-4 flex items-center justify-center shadow-xs group-hover:shadow-sm transition-shadow">
                    {renderBookCover(book, 'transition-transform duration-300 group-hover:scale-103')}
                    
                    {/* Format Badge */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#E8E8E2] text-[9.5px] font-mono font-medium text-[#292A27]">
                      FREE PDF
                    </div>
                  </div>

                  {/* Category Pill Tag */}
                  <span className="inline-block text-[10px] font-sans font-semibold tracking-wider uppercase text-[#C98187] mb-1">
                    {book.category_name || 'General Library'}
                  </span>

                  {/* Title & Author */}
                  <h3 className="font-serif font-bold text-base text-[#292A27] group-hover:text-[#C98187] transition-colors line-clamp-1 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#85857E] mt-1 line-clamp-1 font-sans">
                    By {book.author || 'Unknown Author'}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-[#E8E8E2] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#85857E]">
                    {book.page_count ? `${book.page_count} pages` : 'Complete'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReadOnline(book.id);
                    }}
                    className="text-xs font-semibold text-[#292A27] group-hover:text-[#C98187] flex items-center gap-1 transition-colors"
                  >
                    <span>Read Online</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION H: CALM EDITORIAL SECTION ("A Space for Curious Minds")
          Minimalist and elegant editorial presentation
          ========================================================================= */}
      <section 
        id="about-library-section" 
        className="w-full bg-[#F8F8F4] border-t border-[#E8E8E2] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs uppercase font-sans tracking-[0.2em] font-semibold text-[#C98187]">
            ABOUT THIS DIGITAL LIBRARY
          </span>

          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#292A27] leading-tight">
            A Space for Curious Minds
          </h2>

          <p className="font-sans text-sm sm:text-base text-[#85857E] max-w-2xl mx-auto leading-relaxed">
            A growing digital collection designed to make discovering, exploring, and reading books simple, accessible, and enjoyable for readers everywhere.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="bg-white p-6 rounded-xl border border-[#E8E8E2]">
              <div className="w-9 h-9 rounded-lg bg-[#E8EAE2] text-[#292A27] flex items-center justify-center mb-4">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#292A27] mb-1.5">
                Free &amp; Open Access
              </h3>
              <p className="text-xs text-[#85857E] leading-relaxed">
                Zero paywalls or subscriptions. Direct access to every title directly in your web browser.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E8E8E2]">
              <div className="w-9 h-9 rounded-lg bg-[#E8EAE2] text-[#292A27] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#292A27] mb-1.5">
                Permanent Preservation
              </h3>
              <p className="text-xs text-[#85857E] leading-relaxed">
                Each manuscript is digitally stored, indexed with bibliographic accuracy, and backed by Cloud Firestore.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E8E8E2]">
              <div className="w-9 h-9 rounded-lg bg-[#E8EAE2] text-[#292A27] flex items-center justify-center mb-4">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#292A27] mb-1.5">
                Community Commons
              </h3>
              <p className="text-xs text-[#85857E] leading-relaxed">
                Dedicated to literature, business, personal development, sciences, and historical works for all.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
