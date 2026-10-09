import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, BookOpen, ArrowUpDown, X, ArrowRight, LayoutGrid, Layers } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. Header & Catalog Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#FF3038] font-bold block mb-1">
            Complete Digital Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
            Browse All Books
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
            Discover free digitized books. Every title includes unabridged PDF reading and direct downloads.
          </p>
        </div>

        {/* View Mode Toggle & Counter */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('shelf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'shelf'
                  ? 'bg-[#FF3038] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Bookshelf</span>
            </button>
          </div>

          <span className="font-mono text-xs font-semibold text-stone-600 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-2xs">
            {filteredBooks.length} of {books.length} Books
          </span>
        </div>
      </div>

      {/* 2. Bookstore Control Bar: Search & Category Chips & Sorting */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
        
        {/* Row 1: Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900/15 focus:border-amber-900 transition-all placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-1 text-stone-400 hover:text-stone-600 absolute right-2.5 top-2.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
            <span className="text-stone-500 whitespace-nowrap flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-900/15 focus:border-amber-900 text-stone-800 cursor-pointer"
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
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px] shrink-0 mr-1 hidden sm:inline">
            Subject:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                    ? 'bg-amber-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Active Filters Tag Bar (if any filter active) */}
        {(search || selectedCategory !== 'all') && (
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-stone-600">
            <span className="text-stone-400 text-[11px]">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-md font-medium">
                Keyword: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-amber-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-md font-medium">
                Subject: {selectedCategoryObj?.name || selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-amber-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-stone-500 hover:text-stone-900 underline underline-offset-2 ml-2 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}

      </div>

      {/* 3. Catalog Display: Either 3D Bookshelf or Editorial Grid */}
      {viewMode === 'shelf' ? (
        <ThreeDBookshelf
          books={filteredBooks}
          categories={categories}
          onOpenBook={onOpenBook}
          onReadOnline={onReadOnline}
          onSelectCategory={catId => setSelectedCategory(catId)}
        />
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center max-w-lg mx-auto shadow-xs">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-stone-800">
            No matching books found
          </h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            We couldn't find any titles matching your current search criteria. Try using broader search keywords or reset your filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            Show All Books
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
              onSelectCategory={catId => setSelectedCategory(catId)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
