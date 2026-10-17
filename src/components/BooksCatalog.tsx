import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ArrowUpDown, X, LayoutGrid, Layers, ArrowRight } from 'lucide-react';
import { Book, Category, SortOption } from '../types/library';
import { BookCard } from './BookCard';
import { ThreeDBookshelf } from './ThreeDBookshelf';

interface BooksCatalogProps {
  books: Book[];
  categories: Category[];
  initialSearch?: string;
  initialCategory?: string;
  onOpenBook: (bookId: string) => void;
  onReadOnline: (bookId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  loading?: boolean;
}

export const BooksCatalog: React.FC<BooksCatalogProps> = ({
  books,
  categories,
  initialSearch = '',
  initialCategory = 'all',
  onOpenBook,
  onReadOnline,
  onSelectCategory,
  loading = false
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'shelf'>('grid');

  // Filter and sort client-side
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(
        b => b.category_id === selectedCategory || b.category_name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.category_name && b.category_name.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'author-asc') {
      result.sort((a, b) => a.author.localeCompare(b.author));
    }

    return result;
  }, [books, search, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  const selectedCategoryObj = categories.find(c => c.id === selectedCategory || c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F8F8F4] text-[#292A27]">
      
      {/* 1. Header & Catalog Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E8E8E2]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C98187] inline-block" />
            <span className="text-xs uppercase font-sans tracking-[0.2em] text-[#C98187] font-semibold">
              COMPLETE DIGITAL COMMONS
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#292A27] tracking-tight">
            Browse All Books
          </h1>
          <p className="text-sm text-[#85857E] mt-2 max-w-2xl leading-relaxed font-sans">
            Explore free unabridged digital books. Every title is preserved with bibliographic accuracy, instant browser reading, and direct PDF downloads.
          </p>
        </div>

        {/* View Mode Toggle & Counter */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center p-1 bg-white rounded-full border border-[#E8E8E2] shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#292A27] text-white shadow-xs'
                  : 'text-[#85857E] hover:text-[#292A27]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('shelf')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'shelf'
                  ? 'bg-[#C98187] text-white shadow-xs'
                  : 'text-[#85857E] hover:text-[#292A27]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Bookshelf</span>
            </button>
          </div>

          <span className="font-mono text-xs font-medium text-[#292A27] bg-white px-3.5 py-2 rounded-full border border-[#E8E8E2] shadow-2xs">
            {filteredBooks.length} of {books.length} Books
          </span>
        </div>
      </div>

      {/* 2. Control Bar: Search & Category Chips & Sorting */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E8E2] shadow-2xs space-y-4">
        
        {/* Row 1: Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#F8F8F4] border border-[#E8E8E2] rounded-xl focus:outline-none focus:border-[#C98187] focus:ring-1 focus:ring-[#C98187] transition-all placeholder:text-[#85857E] text-[#292A27]"
            />
            <Search className="w-4 h-4 text-[#85857E] absolute left-3 top-3" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-1 text-[#85857E] hover:text-[#292A27] absolute right-2.5 top-2.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
            <span className="text-[#85857E] whitespace-nowrap flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#85857E]" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-[#F8F8F4] border border-[#E8E8E2] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C98187] text-[#292A27] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="author-asc">Author: A to Z</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Filter Controls */}
        <div className="pt-3 border-t border-[#E8E8E2] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[#85857E] font-semibold uppercase tracking-wider text-[10px] shrink-0 mr-1 hidden sm:inline">
            Subject:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#292A27] text-white shadow-2xs font-semibold'
                : 'bg-[#F8F8F4] text-[#85857E] hover:text-[#292A27] border border-[#E8E8E2]'
            }`}
          >
            All Subjects ({books.length})
          </button>

          {categories.map(cat => {
            const count = books.filter(b => b.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#C98187] text-white shadow-2xs font-semibold'
                    : 'bg-[#F8F8F4] text-[#85857E] hover:text-[#292A27] border border-[#E8E8E2]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Active Filter Badges */}
      {(search || selectedCategory !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#85857E]">Active filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EAE2] text-[#292A27] border border-[#DDE0D5]">
              <span>Query: "{search}"</span>
              <button onClick={() => setSearch('')} className="hover:text-[#C98187] cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EAE2] text-[#292A27] border border-[#DDE0D5]">
              <span>Subject: {selectedCategoryObj?.name || selectedCategory}</span>
              <button onClick={() => setSelectedCategory('all')} className="hover:text-[#C98187] cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-[#C98187] hover:underline font-medium ml-2 cursor-pointer"
          >
            Reset all
          </button>
        </div>
      )}

      {/* 4. Main Catalog Content Area */}
      {viewMode === 'shelf' ? (
        <ThreeDBookshelf
          books={filteredBooks}
          categories={categories}
          onOpenBook={onOpenBook}
          onReadOnline={onReadOnline}
          onSelectCategory={onSelectCategory}
        />
      ) : (
        <>
          {filteredBooks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E8E2] p-16 text-center max-w-lg mx-auto shadow-2xs">
              <BookOpen className="w-12 h-12 text-[#85857E]/50 mx-auto mb-3" />
              <h3 className="font-editorial text-xl font-bold text-[#292A27]">
                No matching books found
              </h3>
              <p className="text-xs text-[#85857E] mt-2 leading-relaxed">
                We couldn't find any books matching your current search or subject filter. Try adjusting your query or exploring all categories.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-5 py-2.5 text-xs font-semibold text-white bg-[#292A27] hover:bg-[#3E403B] rounded-xl transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
              {filteredBooks.map(book => (
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
        </>
      )}

    </div>
  );
};
