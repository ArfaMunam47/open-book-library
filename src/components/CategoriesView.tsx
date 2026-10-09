import React from 'react';
import { BookOpen, ArrowRight, ArrowLeft, Bookmark, FolderTree, Sparkles } from 'lucide-react';
import { Book, Category } from '../types/library';
import { BookCard } from './BookCard';

interface CategoriesViewProps {
  categories: Category[];
  books: Book[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
  onOpenBook: (bookId: string) => void;
  onReadOnline: (bookId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  books,
  selectedCategoryId,
  onSelectCategory,
  onOpenBook,
  onReadOnline
}) => {
  const currentCategory = categories.find(c => c.id === selectedCategoryId || c.slug === selectedCategoryId);

  // If a category is selected, show that category's books
  if (currentCategory) {
    const categoryBooks = books.filter(b => b.category_id === currentCategory.id);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back to all categories */}
        <button
          onClick={() => onSelectCategory(undefined)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>All Subject Categories</span>
        </button>

        {/* Category Header */}
        <div className="pb-6 border-b border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF3038]" />
            <span className="text-xs uppercase font-mono tracking-widest text-[#FF3038] font-bold">
              Subject Collection
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
            {currentCategory.name}
          </h1>
          {currentCategory.description && (
            <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              {currentCategory.description}
            </p>
          )}
          <div className="mt-3 font-mono text-xs font-semibold text-stone-500">
            {categoryBooks.length} {categoryBooks.length === 1 ? 'Book Cataloged' : 'Books Cataloged'}
          </div>
        </div>

        {/* Real Books in Category */}
        {categoryBooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center max-w-lg mx-auto shadow-xs">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-stone-800">
              No books currently in this subject
            </h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              New open-access and public domain books are added continuously. Explore other subjects in the library.
            </p>
            <button
              onClick={() => onSelectCategory(undefined)}
              className="mt-6 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              Browse All Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
            {categoryBooks.map(book => (
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
  }

  // Otherwise, show the grid of all categories
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase font-mono tracking-widest text-[#FF3038] font-bold block mb-1">
          Library Collections
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          Subject Categories
        </h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          Explore curated subjects from classic business and psychology to philosophy, literature, and personal growth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => {
          const count = books.filter(b => b.category_id === cat.id).length;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/90 hover:border-red-400 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#FF3038] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-mono font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200/60 shrink-0">
                    {count} {count === 1 ? 'book' : 'books'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                  {cat.description || 'Explore digitized works categorized under this topic.'}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#FF3038] group-hover:text-red-700">
                <span>Explore Subject Collection</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
