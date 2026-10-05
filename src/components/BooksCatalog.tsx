import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, BookOpen, ArrowUpDown, X } from 'lucide-react';
import { Book, Category, SortOption } from '../types/library';
import { BookCard } from './BookCard';

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

  // Filter and sort client-side for instant responsive typing, or sync with props
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Deck */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Browse Library Catalog
        </h1>
        <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
          Search books by title, author, or description. Filter by subject or sort alphabetically and chronologically.
        </p>
      </div>

      {/* Control Bar: Search & Filter Tabs & Sorting */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-4">
        
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search books, authors, or topics..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-1 text-stone-400 hover:text-stone-600 absolute right-2.5 top-2"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
            <span className="text-stone-500 whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-900 text-stone-800"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
              <option value="author-asc">Author A–Z</option>
            </select>
          </div>
        </div>

        {/* Categories Horizontal Scroll / Filter Bar */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Categories ({books.length})
          </button>
          {categories.map(cat => {
            const count = books.filter(b => b.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-mono tabular-nums">
        <span>
          Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
        </span>
        {(search || selectedCategory !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="text-amber-900 hover:underline font-sans font-medium"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-stone-400">
          Loading books...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-16 text-center max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-800">
            No books found.
          </h3>
          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
            {search
              ? `No books matched "${search}". Try searching by another keyword or author name.`
              : 'There are no books currently listed in this category.'}
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    </div>
  );
};
