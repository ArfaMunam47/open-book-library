import React, { useState } from 'react';
import { Book, Category } from '../types/library';
import { BookOpen, Layers, Sparkles } from 'lucide-react';
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  // Filter books by category
  const filteredBooks = selectedCategory === 'all'
    ? books
    : books.filter(b => b.category_id === selectedCategory || b.category_name?.toLowerCase() === selectedCategory.toLowerCase());

  // Split books across shelf tiers (up to 5 books per shelf)
  const BOOKS_PER_SHELF = 5;
  const shelfTiers: Book[][] = [];
  for (let i = 0; i < filteredBooks.length; i += BOOKS_PER_SHELF) {
    shelfTiers.push(filteredBooks.slice(i, i + BOOKS_PER_SHELF));
  }

  return (
    <div className="w-full space-y-10">
      
      {/* Shelf Header & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#FF3038] text-[11px] font-mono uppercase tracking-widest font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3038] animate-pulse" />
            <span>Interactive 3D Bookshelves</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#191919] tracking-tight">
            The Library Stacks
          </h2>
          <p className="text-xs sm:text-sm text-[#626262] mt-1.5 max-w-xl font-sans leading-relaxed">
            Every volume in our collection rests upright as a physical hardcover edition. Tap or click any book to inspect its details, read online, or download.
          </p>
        </div>

        {/* Clean Segmented Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#FF3038] text-white font-semibold shadow-[0_4px_12px_rgba(255,48,56,0.3)]'
                : 'bg-white text-[#626262] hover:text-[#191919] hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Volumes ({books.length})
          </button>
          
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#FF3038] text-white font-semibold shadow-[0_4px_12px_rgba(255,48,56,0.3)]'
                  : 'bg-white text-[#626262] hover:text-[#191919] hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* The Physical Wooden Shelves */}
      {filteredBooks.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="font-serif text-lg font-bold text-[#191919]">No volumes on this shelf yet.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-3 text-xs text-[#FF3038] font-semibold hover:underline cursor-pointer"
          >
            Return to All Volumes
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {shelfTiers.map((tierBooks, tierIndex) => (
            <div 
              key={`shelf-tier-${tierIndex}`} 
              className="relative rounded-3xl bg-[#F6F3ED]/80 border border-stone-200/90 pt-10 sm:pt-14 pb-0 px-4 sm:px-8 shadow-xs"
            >
              {/* Shelf Tier Placard */}
              <div className="flex items-center justify-between mb-8 px-2">
                <span className="text-[11px] font-mono tracking-widest uppercase text-stone-500 font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#FF3038]" />
                  <span>Shelf Tier 0{tierIndex + 1}</span>
                </span>
                <span className="text-xs font-mono text-stone-400">
                  {tierBooks.length} {tierBooks.length === 1 ? 'Volume' : 'Volumes'} Standing
                </span>
              </div>

              {/* Upright Standing Books Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 items-end px-2 sm:px-4 min-h-[300px] sm:min-h-[340px]">
                {tierBooks.map((book) => {
                  const isHovered = hoveredBookId === book.id;

                  return (
                    <div
                      key={book.id}
                      onClick={() => onOpenBook(book.id)}
                      onMouseEnter={() => setHoveredBookId(book.id)}
                      onMouseLeave={() => setHoveredBookId(null)}
                      className="group flex flex-col items-center cursor-pointer select-none transition-transform"
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${book.title} by ${book.author}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenBook(book.id);
                        }
                      }}
                    >
                      {/* Floating Tooltip Indicator on Hover */}
                      <div className={`absolute -top-12 z-30 transition-all duration-200 pointer-events-none ${
                        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                      }`}>
                        <span className="bg-[#191919] text-white text-[11px] font-sans font-medium px-3 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1">
                          <span>Inspect Volume</span>
                        </span>
                      </div>

                      {/* 3D Standing Hardcover Book */}
                      <div className="relative w-full max-w-[170px] aspect-[2/3] shelf-book-stand preserve-3d">
                        
                        {/* Top Page Edge (3D view from above) */}
                        <div className="hardcover-top-edge" />

                        {/* Right Stacked Pages Edge (3D view from side) */}
                        <div className="hardcover-page-edges" />

                        {/* Book Cover Face */}
                        <div className="relative w-full h-full rounded-r-sm rounded-l-xs overflow-hidden shadow-2xl bg-[#191919] border-t border-r border-stone-800">
                          {book.cover_url ? (
                            <img
                              src={book.cover_url}
                              alt={`Cover of ${book.title}`}
                              className="w-full h-full object-cover object-center"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full p-4 flex flex-col justify-between bg-stone-900 text-stone-100">
                              <span className="text-[9px] font-mono tracking-widest uppercase text-[#FF3038] font-bold">
                                {book.category_name || 'OpenBook'}
                              </span>
                              <div>
                                <h3 className="font-serif text-sm font-bold leading-tight line-clamp-3">
                                  {book.title}
                                </h3>
                                <p className="text-xs text-stone-400 mt-1 truncate">
                                  {book.author}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono text-stone-500">
                                {formatFileSize(book.file_size)}
                              </span>
                            </div>
                          )}

                          {/* Hardcover Spine Crease Shadow */}
                          <div className="hardcover-spine-crease" />

                          {/* Subtle Gloss Sheen */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                        </div>

                        {/* Realistic Drop Shadow on the Shelf Plank */}
                        <div className="absolute inset-x-2 -bottom-2 h-4 bg-black/60 rounded-full blur-md -z-10 group-hover:scale-95 transition-transform" />
                      </div>

                      {/* Clean Metadata Below Book */}
                      <div className="mt-3.5 mb-2 text-center w-full px-1">
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-[#191919] group-hover:text-[#FF3038] transition-colors line-clamp-1 leading-snug">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-[#626262] font-sans truncate mt-0.5">
                          {book.author}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Handcrafted Wooden Shelf Plank */}
              <div className="wood-shelf-plank rounded-b-2xl -mx-4 sm:-mx-8" />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
