import React, { useState, useRef } from 'react';
import { Book, Category } from '../types/library';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Clock, Layers } from 'lucide-react';
import { formatFileSize } from '../lib/api';

interface ThreeDBookshelfProps {
  books: Book[];
  categories: Category[];
  onOpenBook: (bookId: string) => void;
  onReadOnline: (bookId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const ThreeDBookshelf: React.FC<ThreeDBookshelfProps> = ({
  books,
  categories,
  onOpenBook,
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  // 1. All published books
  const publishedBooks = books.filter(b => b.published !== false);

  // 2. Recently added books (newest uploaded first based on actual created_at)
  const recentlyAddedBooks = [...publishedBooks].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });

  // 3. Category grouping for genuine categories that contain at least 1 book
  const categoriesWithBooks = categories
    .map(cat => ({
      category: cat,
      books: publishedBooks.filter(b => b.category_id === cat.id || b.category_name?.toLowerCase() === cat.name.toLowerCase())
    }))
    .filter(group => group.books.length > 0);

  // Scroll handler for horizontal shelf rows
  const scrollShelf = (shelfId: string, direction: 'left' | 'right') => {
    const el = document.getElementById(shelfId);
    if (el) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Helper renderer for a single upright 3D book on a shelf
  const renderBookItem = (book: Book, index: number) => {
    const isHovered = hoveredBookId === book.id;
    // Slight height cadence for physical realism (heights vary subtly across standard trim sizes)
    const heightVariants = ['h-[210px] sm:h-[235px] md:h-[250px]', 'h-[220px] sm:h-[245px] md:h-[260px]', 'h-[205px] sm:h-[230px] md:h-[245px]', 'h-[215px] sm:h-[240px] md:h-[255px]'];
    const heightClass = heightVariants[index % heightVariants.length];

    return (
      <div
        key={book.id}
        onClick={() => onOpenBook(book.id)}
        onMouseEnter={() => setHoveredBookId(book.id)}
        onMouseLeave={() => setHoveredBookId(null)}
        role="button"
        tabIndex={0}
        aria-label={`Open volume: ${book.title} by ${book.author}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenBook(book.id);
          }
        }}
        className="group shrink-0 flex flex-col items-center cursor-pointer select-none relative focus:outline-none py-6"
      >
        {/* Hover Tooltip / Floating Info Badge */}
        <div 
          className={`absolute -top-6 z-40 transition-all duration-200 pointer-events-none w-52 text-center ${
            isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1.5 scale-95 pointer-events-none'
          }`}
        >
          <div className="bg-[#153C32] text-[#F8F5E9] px-3.5 py-2.5 rounded-xl shadow-2xl border border-[#235848] text-left backdrop-blur-md">
            <p className="font-serif text-xs font-bold truncate text-[#F8F5E9] leading-tight">
              {book.title}
            </p>
            <p className="text-[10px] text-[#C76A32] truncate mt-0.5">
              {book.author}
            </p>
            <div className="flex items-center justify-between text-[9px] text-[#A6C0B4] font-mono mt-1.5 pt-1 border-t border-[#235848]/70">
              <span>{book.page_count ? `${book.page_count} pages` : 'Complete'}</span>
              <span className="text-[#C76A32] font-medium">Click to inspect →</span>
            </div>
          </div>
        </div>

        {/* Physical 3D Book Standing Upright */}
        <div className={`relative w-[130px] sm:w-[145px] md:w-[155px] lg:w-[165px] ${heightClass} physical-3d-book`}>
          
          {/* 3D Top Page Rim */}
          <div className="physical-book-top-edge" />

          {/* 3D Left Spine Edge */}
          <div className="physical-book-spine" />

          {/* 3D Right Page Depth Rim */}
          <div className="physical-book-depth" />

          {/* Front Cover Container */}
          <div className="relative w-full h-full rounded-r-[3px] rounded-l-[1px] overflow-hidden bg-[#241A14] shadow-xl border-t border-r border-[#6B462C]/40">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover object-center select-none"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-b from-[#2B1B12] via-[#21140D] to-[#170E09] text-[#F8F5E9]">
                <span className="text-[8px] font-mono tracking-widest uppercase text-[#C76A32] font-bold">
                  {book.category_name || 'Library Volume'}
                </span>
                <div>
                  <h4 className="font-serif text-xs font-bold leading-snug line-clamp-3 text-[#F8F5E9]">
                    {book.title}
                  </h4>
                  <p className="text-[10px] text-[#C5B8A8] mt-1.5 truncate">
                    {book.author}
                  </p>
                </div>
                <span className="text-[8px] font-mono text-[#C76A32]">
                  {formatFileSize(book.file_size)}
                </span>
              </div>
            )}

            {/* Book Spine Hinge Highlight */}
            <div className="book-spine-hinge-highlight" />
          </div>

          {/* Contact Shadow onto the Wooden Shelf Surface */}
          <div className="book-shelf-contact-shadow" />
        </div>
      </div>
    );
  };

  // Shelf tier with left/right navigation and realistic wood surface
  const renderShelfRow = (
    shelfId: string, 
    title: string, 
    shelfBooks: Book[], 
    subtitle?: string,
    hasDecoration?: 'plant' | 'globe' | 'vase' | 'stacked'
  ) => {
    return (
      <div key={shelfId} className="relative w-full shelf-ambient-glow rounded-3xl p-3 sm:p-6 transition-all">
        
        {/* Shelf Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-4 px-2 sm:px-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C76A32]" />
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#153C32] tracking-tight">
                {title}
              </h3>
            </div>
            {subtitle && (
              <p className="text-xs text-[#526058] mt-1 font-sans">
                {subtitle}
              </p>
            )}
          </div>

          {/* Count and Horizontal Scroll Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#526058] font-mono hidden sm:inline">
              {shelfBooks.length} {shelfBooks.length === 1 ? 'volume' : 'volumes'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollShelf(shelfId, 'left')}
                className="w-8 h-8 rounded-full bg-white border border-[#D5CFBE] text-[#153C32] hover:bg-[#EFECE0] hover:text-[#C76A32] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Scroll shelf left"
                aria-label={`Scroll ${title} left`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollShelf(shelfId, 'right')}
                className="w-8 h-8 rounded-full bg-white border border-[#D5CFBE] text-[#153C32] hover:bg-[#EFECE0] hover:text-[#C76A32] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Scroll shelf right"
                aria-label={`Scroll ${title} right`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* The 3D Bookshelf Stage */}
        <div className="relative w-full px-2 sm:px-4">
          
          {/* Upright Books Row */}
          <div
            id={shelfId}
            className="relative z-10 flex items-end gap-6 sm:gap-8 overflow-x-auto pb-0.5 pt-6 px-3 scrollbar-none scroll-smooth"
          >
            {shelfBooks.map((b, i) => renderBookItem(b, i))}

            {/* Decorative items naturally resting on the shelves */}
            {hasDecoration === 'plant' && (
              <div className="shrink-0 flex flex-col items-center select-none pointer-events-none pb-0 ml-4 self-end" aria-hidden="true">
                <div className="relative w-12 sm:w-14 h-20 flex flex-col items-center justify-end">
                  <div className="relative w-9 h-11 flex items-center justify-center -mb-1">
                    <div className="absolute -top-4 left-1 w-3 h-5 bg-[#436A4E] rounded-full rotate-[-25deg] shadow-xs" />
                    <div className="absolute -top-5 left-3 w-3 h-6 bg-[#32523C] rounded-full shadow-xs" />
                    <div className="absolute -top-3.5 right-1 w-3 h-5 bg-[#5B8868] rounded-full rotate-[30deg] shadow-xs" />
                    <div className="w-8 h-8 bg-[#C89B72] border border-[#A67852] rounded-b-md shadow-md flex items-center justify-center">
                      <div className="w-5 h-0.5 bg-[#4A2E18]/40 rounded-full" />
                    </div>
                  </div>
                  <div className="w-7 h-2 bg-black/30 rounded-full blur-[2px] mt-0.5" />
                </div>
              </div>
            )}

            {hasDecoration === 'globe' && (
              <div className="shrink-0 flex flex-col items-center select-none pointer-events-none pb-0 ml-4 self-end" aria-hidden="true">
                <div className="relative w-11 sm:w-12 h-20 flex flex-col items-center justify-end">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3F6A7A] to-[#88B2BA] border border-[#2D4D59] shadow-sm flex items-center justify-center relative">
                    <div className="w-5 h-2 bg-[#D1BE9B]/40 rounded-full rotate-12" />
                    <div className="absolute inset-0 border-2 border-[#D98219]/60 rounded-full rotate-[-20deg]" />
                  </div>
                  <div className="w-1 h-3 bg-[#A87932] mt-0.5" />
                  <div className="w-5 h-1.5 bg-[#8A5C1B] rounded-full shadow-xs" />
                  <div className="w-6 h-2 bg-black/30 rounded-full blur-[2px] mt-0.5" />
                </div>
              </div>
            )}

            {hasDecoration === 'vase' && (
              <div className="shrink-0 flex flex-col items-center select-none pointer-events-none pb-0 ml-4 self-end" aria-hidden="true">
                <div className="relative w-10 sm:w-12 h-20 flex flex-col items-center justify-end">
                  <div className="relative w-7 h-14 flex flex-col items-center justify-end">
                    <div className="w-0.5 h-8 bg-[#8C5E35] rounded-full" />
                    <div className="w-2 h-2.5 bg-[#D98219] rounded-full -mt-7 -ml-2 rotate-[-40deg]" />
                    <div className="w-6 h-10 bg-[#D4C3A3] border border-[#B8A684] rounded-t-sm rounded-b-lg shadow-md" />
                  </div>
                  <div className="w-6 h-2 bg-black/30 rounded-full blur-[2px] mt-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* The Physical Thin Wooden Bookshelf Plank with Warm Lighting */}
          <div className="physical-wood-shelf -mt-1" />
        </div>

      </div>
    );
  };

  return (
    <div className="w-full space-y-16 sm:space-y-20 lg:space-y-24">
      
      {/* Category & Collection Filter Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E3DEC9] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#153C32] text-[#F8F5E9] font-semibold shadow-xs'
                : 'bg-[#EDE8D8] text-[#526058] hover:text-[#153C32] hover:bg-[#E3DEC9] border border-[#DDD7C4]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complete Collection ({publishedBooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'recent'
                ? 'bg-[#153C32] text-[#F8F5E9] font-semibold shadow-xs'
                : 'bg-[#EDE8D8] text-[#526058] hover:text-[#153C32] hover:bg-[#E3DEC9] border border-[#DDD7C4]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#C76A32]" />
            <span>Recently Added</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-[#153C32] text-[#F8F5E9] font-semibold shadow-xs'
                : 'bg-[#EDE8D8] text-[#526058] hover:text-[#153C32] hover:bg-[#E3DEC9] border border-[#DDD7C4]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C76A32]" />
            <span>By Category ({categoriesWithBooks.length})</span>
          </button>
        </div>

        <span className="text-[11px] font-serif text-[#526058] hidden sm:inline italic">
          Physical 3D Shelf · Click any volume to inspect or read online
        </span>
      </div>

      {/* Main Shelves Content based on selected Tab */}
      {publishedBooks.length === 0 ? (
        <div className="py-24 text-center bg-white/70 rounded-3xl border border-[#E2DDCB] p-8 shadow-xs">
          <BookOpen className="w-12 h-12 text-[#64736B]/40 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#103D30]">The library stacks are currently open</h3>
          <p className="text-xs text-[#64736B] mt-1.5 max-w-sm mx-auto">
            Books uploaded through the administration dashboard will appear standing on these shelves automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-16 sm:space-y-20 lg:space-y-24">
          
          {/* TAB 1: ALL BOOKS (Multi-tier curated library stacks) */}
          {activeTab === 'all' && (
            <>
              {/* Section 1: All Volumes Collection */}
              {renderShelfRow(
                'shelf-all-books',
                'All Books',
                publishedBooks,
                'Explore the complete catalogue of unabridged open-access library volumes.',
                'plant'
              )}

              {/* Section 2: Recently Added Shelf */}
              {renderShelfRow(
                'shelf-recently-added',
                'Recently Added',
                recentlyAddedBooks.slice(0, 10),
                'New acquisitions ordered by upload date, ready for instant reading.',
                'globe'
              )}

              {/* Section 3: Subject Highlights from genuine categories */}
              {categoriesWithBooks.slice(0, 3).map((group, idx) => {
                const decors: ('vase' | 'plant' | 'globe')[] = ['vase', 'plant', 'globe'];
                return renderShelfRow(
                  `shelf-cat-${group.category.id}`,
                  group.category.name,
                  group.books,
                  group.category.description || `Volumes catalogued in ${group.category.name}.`,
                  decors[idx % decors.length]
                );
              })}
            </>
          )}

          {/* TAB 2: RECENTLY ADDED */}
          {activeTab === 'recent' && (
            renderShelfRow(
              'shelf-recent-only',
              'Recently Added Acquisitions',
              recentlyAddedBooks,
              'All library titles ordered chronologically by upload date.',
              'globe'
            )
          )}

          {/* TAB 3: BROWSE BY CATEGORY */}
          {activeTab === 'categories' && (
            <>
              {categoriesWithBooks.map((group, idx) => {
                const decors: ('vase' | 'plant' | 'globe')[] = ['plant', 'globe', 'vase'];
                return renderShelfRow(
                  `shelf-category-${group.category.id}`,
                  group.category.name,
                  group.books,
                  group.category.description || `Curated volumes in ${group.category.name}.`,
                  decors[idx % decors.length]
                );
              })}
            </>
          )}

        </div>
      )}

    </div>
  );
};
