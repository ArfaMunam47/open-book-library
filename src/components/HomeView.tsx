import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Download, 
  ArrowRight, 
  Library, 
  Sparkles, 
  BookMarked, 
  ShieldCheck, 
  Zap, 
  Globe2, 
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { Book, Category } from '../types/library';
import { BookCard } from './BookCard';
import { formatFileSize, downloadBookPdf } from '../lib/api';

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
  onNavigateCategories
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [activeShelfCategory, setActiveShelfCategory] = useState<string>('all');
  const [heroImageError, setHeroImageError] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigateBooks(searchInput.trim());
    } else {
      onNavigateBooks();
    }
  };

  // Safe featured book from real database
  const spotlightCandidateBooks = books.slice(0, 5);
  const featuredBook = spotlightCandidateBooks[featuredIndex] || books[0];

  // Filter shelf books by selected category tab
  const shelfBooks = activeShelfCategory === 'all' 
    ? books.slice(0, 8)
    : books.filter(b => b.category_id === activeShelfCategory || b.category_name?.toLowerCase() === activeShelfCategory.toLowerCase()).slice(0, 8);

  // Popular / trending books (e.g. sorted by created_at or sliced)
  const popularBooks = books.length > 4 ? books.slice(2, 6) : books;

  return (
    <div className="space-y-20 pb-16">
      
      {/* =========================================================================
          SECTION 1: HERO / FEATURED BOOK SPOTLIGHT (Bookstore Showcase)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F1E8] via-[#FBF9F5] to-[#FBF9F5] border-b border-stone-200/80 pt-10 pb-16 lg:pt-14 lg:pb-20">
        
        {/* Soft background ambient bookish motif */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-stone-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {featuredBook ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Editorial Spotlight Presentation */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {/* Curator's Badge */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-950 bg-amber-100/80 border border-amber-900/20 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    <span>Featured Selection</span>
                  </span>
                  {featuredBook.category_name && (
                    <button
                      onClick={() => onSelectCategory(featuredBook.category_id)}
                      className="text-xs font-semibold text-stone-600 hover:text-amber-950 hover:underline transition-colors"
                    >
                      {featuredBook.category_name}
                    </button>
                  )}
                </div>

                {/* Main Headline & Book Title */}
                <div className="space-y-2">
                  <h1 
                    onClick={() => onOpenBook(featuredBook.id)}
                    className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-[1.12] hover:text-amber-950 transition-colors cursor-pointer"
                  >
                    {featuredBook.title}
                  </h1>
                  <p className="font-serif text-lg sm:text-xl text-stone-700 italic">
                    By {featuredBook.author || 'Unknown Author'}
                  </p>
                </div>

                {/* Description excerpt */}
                {featuredBook.description && (
                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed line-clamp-3 max-w-2xl font-sans">
                    {featuredBook.description}
                  </p>
                )}

                {/* Specifications Bar */}
                <div className="flex items-center gap-4 text-xs text-stone-600 font-mono bg-white/70 backdrop-blur-xs p-3 rounded-lg border border-stone-200/80 w-fit flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-stone-800">Unabridged Edition</span>
                  </div>
                  <span className="text-stone-300">|</span>
                  <span>{featuredBook.page_count ? `${featuredBook.page_count} Pages` : 'Full Length PDF'}</span>
                  <span className="text-stone-300">|</span>
                  <span>{formatFileSize(featuredBook.file_size)}</span>
                  <span className="text-stone-300">|</span>
                  <span className="text-amber-900 font-sans font-bold">100% Free</span>
                </div>

                {/* Primary Action Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {/* Read Online in New Tab */}
                  <a
                    href={`/api/pdf/${featuredBook.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 bg-stone-900 hover:bg-amber-950 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer group"
                    title="Read book online in new tab"
                  >
                    <BookOpen className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>Read Online Now</span>
                  </a>

                  {/* Download PDF */}
                  <button
                    onClick={() => downloadBookPdf(featuredBook.id, featuredBook.title)}
                    className="px-5 py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-xl font-semibold text-sm transition-all shadow-2xs hover:border-stone-400 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-stone-600" />
                    <span>Download PDF ({formatFileSize(featuredBook.file_size)})</span>
                  </button>

                  {/* View Details */}
                  <button
                    onClick={() => onOpenBook(featuredBook.id)}
                    className="px-4 py-3.5 text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Book Synopsis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Switcher tabs if multiple real books exist */}
                {spotlightCandidateBooks.length > 1 && (
                  <div className="pt-4 border-t border-stone-200/80 flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider font-sans">
                      Featured Titles:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {spotlightCandidateBooks.map((b, idx) => (
                        <button
                          key={b.id}
                          onClick={() => setFeaturedIndex(idx)}
                          className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium max-w-[140px] truncate ${
                            featuredIndex === idx
                              ? 'bg-amber-900 text-white shadow-2xs'
                              : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200'
                          }`}
                          title={b.title}
                        >
                          {idx + 1}. {b.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: 3D Hardcover Book Presentation with Real Cover */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div 
                  onClick={() => onOpenBook(featuredBook.id)}
                  className="relative group cursor-pointer perspective-1000 max-w-[280px] sm:max-w-[320px] w-full"
                >
                  {/* Realistic Book Drop Shadow */}
                  <div className="absolute inset-x-4 -bottom-6 h-10 bg-stone-900/40 rounded-full blur-xl transform group-hover:scale-105 transition-transform duration-500" />

                  {/* 3D Book Container */}
                  <div className="relative aspect-[3/4.4] w-full rounded-r-md rounded-l-sm bg-stone-900 shadow-2xl overflow-hidden border-t border-r border-b border-stone-700 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
                    
                    {featuredBook.cover_url && !heroImageError ? (
                      <img
                        src={featuredBook.cover_url}
                        alt={`Cover of ${featuredBook.title}`}
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImageError(true)}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 text-stone-100">
                        <div className="border-b border-stone-700 pb-3">
                          <span className="text-[10px] uppercase tracking-widest text-amber-300 font-sans block">
                            {featuredBook.category_name || 'Open Digital Edition'}
                          </span>
                        </div>
                        <div className="py-4">
                          <h3 className="font-serif text-2xl font-bold leading-snug">
                            {featuredBook.title}
                          </h3>
                          <p className="text-sm italic text-stone-300 mt-3 font-serif">
                            {featuredBook.author}
                          </p>
                        </div>
                        <div className="border-t border-stone-800 pt-3 flex justify-between text-xs text-stone-400 font-mono">
                          <span>{featuredBook.page_count}p</span>
                          <span>{formatFileSize(featuredBook.file_size)}</span>
                        </div>
                      </div>
                    )}

                    {/* Hardcover Spine Crease and Left Shadow */}
                    <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
                    
                    {/* Spine Ridge Line */}
                    <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/15 pointer-events-none" />

                    {/* Paper edge highlight on the right */}
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-black/30 via-white/10 to-transparent pointer-events-none" />

                    {/* Cover Gloss Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Floating Reading Badge */}
                  <div className="absolute -bottom-3 -right-3 bg-white text-stone-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg border border-stone-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-900" />
                    <span>Free Open Edition</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Empty state if zero books exist in the DB */
            <div className="py-16 text-center max-w-xl mx-auto">
              <Library className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Welcome to OpenBook Library
              </h2>
              <p className="text-sm text-stone-600 mt-2">
                The library catalog is currently being updated. Log in to the administrator portal to upload your books.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: PROMOTIONAL / INFORMATIONAL PILLARS (Bookstore Guarantees)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-amber-900/40 hover:shadow-sm transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-950 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                100% Free Public Access
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Zero paywalls, subscriptions, or waitlists. Read and download without restrictions.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-amber-900/40 hover:shadow-sm transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-950 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Instant In-Browser Reader
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Open books immediately in a new tab with zoom, text search, and mobile responsiveness.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-amber-900/40 hover:shadow-sm transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-950 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Unabridged High-Res PDFs
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Complete digital editions preserving original diagrams, formatting, and tables of contents.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-amber-900/40 hover:shadow-sm transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Permanent Cloud Storage
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Durable multi-region cloud persistence ensuring our digital collection never disappears.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FEATURED BOOKS SHELF (Curator's Recommended Shelf)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Subject Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-900" />
              <span className="text-xs uppercase tracking-widest text-amber-950 font-bold">
                Curator's Collection
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
              Featured Books in the Library
            </h2>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveShelfCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeShelfCategory === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Titles ({books.length})
            </button>
            {categories.slice(0, 4).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveShelfCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeShelfCategory === cat.id
                    ? 'bg-amber-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => onNavigateBooks()}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 group whitespace-nowrap ml-2 cursor-pointer"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Real Books Grid */}
        {shelfBooks.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-stone-800">
              No books found in this selection.
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Select another subject or browse all catalog titles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
            {shelfBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onOpenBook={onOpenBook}
                onReadOnline={onReadOnline}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 4: EXPLORE SUBJECT COLLECTIONS (Bookstore Category Grid)
          ========================================================================= */}
      <section className="bg-[#F6F3EB] py-16 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-stone-300/70">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-900 font-bold block mb-1">
                Curated Topics
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Explore by Subject Collection
              </h2>
            </div>

            <button
              onClick={onNavigateCategories}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 group cursor-pointer"
            >
              <span>All Categories ({categories.length})</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {categories.slice(0, 12).map(cat => {
              const count = books.filter(b => b.category_id === cat.id).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="group bg-white p-4 rounded-xl border border-stone-200 hover:border-amber-900/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-serif text-sm font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-2 leading-snug">
                      {cat.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span>{count} {count === 1 ? 'book' : 'books'}</span>
                    <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-amber-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: POPULAR & TRENDING READING (Bookstore Best Edition Shelf)
          ========================================================================= */}
      {books.length > 2 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-amber-900" />
                <span className="text-xs uppercase tracking-widest text-amber-950 font-bold">
                  Reader Favorites
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Popular in the Reading Room
              </h2>
            </div>

            <button
              onClick={() => onNavigateBooks()}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 group cursor-pointer"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {popularBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onOpenBook={onOpenBook}
                onReadOnline={onReadOnline}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 6: LITERARY MISSION CALLOUT (Editorial Bookstore Note)
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200/90 p-8 sm:p-12 text-center shadow-xs">
          <Bookmark className="w-8 h-8 text-amber-900 mx-auto mb-4" />
          <blockquote className="font-serif text-xl sm:text-2xl text-stone-900 italic font-medium leading-relaxed max-w-2xl mx-auto">
            “A library is not a luxury but one of the necessities of life.”
          </blockquote>
          <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mt-3">
            Henry Ward Beecher
          </p>
          <div className="w-12 h-0.5 bg-amber-900/30 mx-auto my-5" />
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            OpenBook Library operates as a free, open-access public digital archive. Our collection of books is completely accessible in web browsers and downloadable in unabridged PDF format for self-education and lifelong learning.
          </p>
        </div>
      </section>

    </div>
  );
};
