import React, { useState } from 'react';
import { Book, Category } from '../types/library';
import { BookOpen } from 'lucide-react';
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
  const [activeHoverBookId, setActiveHoverBookId] = useState<string | null>(null);

  // Filter books by category
  const filteredBooks = selectedCategory === 'all'
    ? books
    : books.filter(b => b.category_id === selectedCategory || b.category_name?.toLowerCase() === selectedCategory.toLowerCase());

  // Distribute books across shelves (approx 6-8 books per shelf on large screens)
  const shelfTiers: { id: string; title: string; books: Book[]; hasDecoration?: 'plant' | 'vase' }[] = [];
  
  if (selectedCategory === 'all') {
    const tier1 = filteredBooks.slice(0, 6);
    const tier2 = filteredBooks.slice(6, 12);
    const tier3 = filteredBooks.slice(12, 18);

    if (tier1.length > 0) {
      shelfTiers.push({
        id: 'tier-1',
        title: 'Featured Collection',
        books: tier1,
        hasDecoration: 'plant'
      });
    }
    if (tier2.length > 0) {
      shelfTiers.push({
        id: 'tier-2',
        title: 'Popular Reads',
        books: tier2,
        hasDecoration: 'vase'
      });
    }
    if (tier3.length > 0) {
      shelfTiers.push({
        id: 'tier-3',
        title: 'Recent Additions',
        books: tier3
      });
    }
  } else {
    const catName = categories.find(c => c.id === selectedCategory)?.name || 'Selected Category';
    shelfTiers.push({
      id: 'category-tier',
      title: catName,
      books: filteredBooks,
      hasDecoration: 'plant'
    });
  }

  return (
    <div className="w-full space-y-16 sm:space-y-20 lg:space-y-24">
      
      {/* Category Filter Navigation: Refined dark library aesthetic */}
      {categories.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#24352A] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#E2BA60] text-[#0D1510] font-bold shadow-[0_0_15px_rgba(226,186,96,0.3)]'
                  : 'bg-[#18271E] text-[#B8C8BD] hover:text-[#FAF8F5] hover:bg-[#203428] border border-[#2B4232]'
              }`}
            >
              All Books ({books.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#E2BA60] text-[#0D1510] font-bold shadow-[0_0_15px_rgba(226,186,96,0.3)]'
                    : 'bg-[#18271E] text-[#B8C8BD] hover:text-[#FAF8F5] hover:bg-[#203428] border border-[#2B4232]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-serif text-[#C5D2C9] hidden sm:inline italic">
            Standing upright on wooden library shelves · Select to read
          </span>
        </div>
      )}

      {/* Floating 3D Bookshelves Collection */}
      {filteredBooks.length === 0 ? (
        <div className="py-20 text-center bg-[#18271E]/60 rounded-2xl border border-[#283C2F] p-8">
          <BookOpen className="w-10 h-10 text-[#7F9987]/50 mx-auto mb-3" />
          <p className="font-serif text-lg font-bold text-[#F7F4EE]">No volumes currently on this shelf.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-3 text-xs font-semibold text-[#E2BA60] hover:underline cursor-pointer"
          >
            Return to All Books
          </button>
        </div>
      ) : (
        <div className="space-y-24 sm:space-y-28 lg:space-y-32">
          {shelfTiers.map((tier) => (
            <div key={tier.id} className="relative w-full">
              
              {/* Shelf Section Heading: Elegant ivory serif with gold bullet */}
              <div className="flex items-center justify-between mb-8 sm:mb-10 px-2 sm:px-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#E2BA60]" />
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#F7F4EE] tracking-tight">
                    {tier.title}
                  </h3>
                </div>
                <span className="text-[11px] text-[#A2B8A9] font-mono">
                  {tier.books.length} {tier.books.length === 1 ? 'volume' : 'volumes'}
                </span>
              </div>

              {/* The Bookshelf Stage */}
              <div className="relative w-full px-2 sm:px-6">
                
                {/* Upright Books Row */}
                <div className="relative z-10 flex items-end gap-5 sm:gap-7 lg:gap-8 overflow-x-auto pb-0.5 pt-12 px-2 scrollbar-none">
                  {tier.books.map((book) => {
                    const isHovered = activeHoverBookId === book.id;

                    return (
                      <div
                        key={book.id}
                        onClick={() => onOpenBook(book.id)}
                        onMouseEnter={() => setActiveHoverBookId(book.id)}
                        onMouseLeave={() => setActiveHoverBookId(null)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open edition: ${book.title} by ${book.author}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenBook(book.id);
                          }
                        }}
                        className="group shrink-0 flex flex-col items-center cursor-pointer select-none relative focus:outline-none"
                      >
                        
                        {/* Hover Tooltip / Floating Info Panel */}
                        <div 
                          className={`absolute -top-16 z-30 transition-all duration-200 pointer-events-none w-48 text-center ${
                            isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
                          }`}
                        >
                          <div className="bg-[#0A120D] text-[#F7F4EE] px-3.5 py-2 rounded-xl shadow-2xl border border-[#3E5C46] text-left backdrop-blur-md">
                            <p className="font-serif text-xs font-bold truncate text-[#F7F4EE]">
                              {book.title}
                            </p>
                            <p className="text-[10px] text-[#E2BA60] truncate mt-0.5">
                              {book.author}
                            </p>
                            <p className="text-[9px] text-[#8BA492] font-mono mt-1">
                              Click to inspect volume
                            </p>
                          </div>
                        </div>

                        {/* Physical 3D Book Standing Upright (Front cover faces visitor, realistic thickness & spine) */}
                        <div className="relative w-[115px] sm:w-[135px] md:w-[150px] lg:w-[160px] aspect-[2/3] physical-3d-book">
                          
                          {/* 3D Top Page Rim */}
                          <div className="physical-book-top-edge" />

                          {/* 3D Left Spine Edge */}
                          <div className="physical-book-spine" />

                          {/* 3D Right Page Depth Rim */}
                          <div className="physical-book-depth" />

                          {/* Front Cover Container */}
                          <div className="relative w-full h-full rounded-r-[2px] rounded-l-[1px] overflow-hidden bg-[#18271E] shadow-xl border-t border-r border-[#4A6B53]/30">
                            {book.cover_url ? (
                              <img
                                src={book.cover_url}
                                alt={`Cover of ${book.title}`}
                                className="w-full h-full object-cover object-center"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full p-3.5 flex flex-col justify-between bg-gradient-to-b from-[#1C2C22] to-[#0F1A13] text-[#F7F4EE]">
                                <span className="text-[8px] font-mono tracking-widest uppercase text-[#E2BA60] font-bold">
                                  {book.category_name || 'Volume'}
                                </span>
                                <div>
                                  <h4 className="font-serif text-xs font-bold leading-tight line-clamp-3 text-[#F7F4EE]">
                                    {book.title}
                                  </h4>
                                  <p className="text-[10px] text-[#B8C8BD] mt-1 truncate">
                                    {book.author}
                                  </p>
                                </div>
                                <span className="text-[8px] font-mono text-[#E2BA60]">
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

                        {/* Strictly NO title or author text underneath covers */}
                      </div>
                    );
                  })}

                  {/* Subtle Tasteful Decorative Object on Shelf */}
                  {tier.hasDecoration === 'plant' && (
                    <div className="shrink-0 flex flex-col items-center select-none pointer-events-none pb-0 ml-3" aria-hidden="true">
                      <div className="relative w-10 sm:w-12 h-14 flex flex-col items-center justify-end">
                        <div className="relative w-7 h-8 flex items-center justify-center -mb-1">
                          <div className="absolute -top-3 left-1 w-2.5 h-4 bg-[#699E75] rounded-full rotate-[-25deg] shadow-sm" />
                          <div className="absolute -top-4 left-3 w-2.5 h-5 bg-[#4F805A] rounded-full shadow-sm" />
                          <div className="absolute -top-2.5 right-1 w-2.5 h-4 bg-[#7FB08B] rounded-full rotate-[30deg] shadow-sm" />
                          <div className="w-6 h-6 bg-[#2B3E32] border border-[#486352] rounded-b-md shadow-md flex items-center justify-center">
                            <div className="w-4 h-0.5 bg-[#E2BA60]/50 rounded-full" />
                          </div>
                        </div>
                        <div className="w-6 h-2 bg-black/40 rounded-full blur-[2px] mt-0.5" />
                      </div>
                    </div>
                  )}

                  {tier.hasDecoration === 'vase' && (
                    <div className="shrink-0 flex flex-col items-center select-none pointer-events-none pb-0 ml-3" aria-hidden="true">
                      <div className="relative w-8 sm:w-10 h-16 flex flex-col items-center justify-end">
                        <div className="relative w-5 h-12 flex flex-col items-center justify-end">
                          <div className="w-0.5 h-6 bg-[#C99E42] rounded-full" />
                          <div className="w-1.5 h-2 bg-[#E2BA60] rounded-full -mt-5 -ml-2 rotate-[-45deg]" />
                          <div className="w-4 h-8 bg-[#2A3F31] border border-[#4A6954] rounded-t-sm rounded-b-md shadow-md" />
                        </div>
                        <div className="w-5 h-2 bg-black/40 rounded-full blur-[2px] mt-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* The Physical Thin Wooden Bookshelf Plank with Warm Lighting */}
                <div className="physical-wood-shelf -mt-1" />
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
