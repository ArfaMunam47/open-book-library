import React, { useState } from 'react';
import { FolderTree, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to all categories */}
        <button
          onClick={() => onSelectCategory(undefined)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>All Subject Categories</span>
        </button>

        <div className="mb-8 pb-6 border-b border-stone-200">
          <div className="text-xs uppercase tracking-widest text-amber-900 font-semibold mb-1">
            Subject Collection
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            {currentCategory.name}
          </h1>
          {currentCategory.description && (
            <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              {currentCategory.description}
            </p>
          )}
          <div className="mt-3 text-xs text-stone-500 font-mono tabular-nums">
            {categoryBooks.length} {categoryBooks.length === 1 ? 'book available' : 'books available'}
          </div>
        </div>

        {categoryBooks.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-stone-800">
              No books are available in this category yet.
            </h3>
            <p className="text-xs text-stone-500 mt-1.5">
              Check back soon as new public domain and open-access books are uploaded regularly.
            </p>
            <button
              onClick={() => onSelectCategory(undefined)}
              className="mt-5 px-4 py-2 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Browse Other Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Library Subject Categories
        </h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          Explore curated subjects from classic economics and business to literature, family, and personal growth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map(cat => {
          const count = books.filter(b => b.category_id === cat.id).length;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group bg-white p-6 rounded-xl border border-stone-200 hover:border-amber-800/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-mono tabular-nums text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    {count} {count === 1 ? 'book' : 'books'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                  {cat.description || 'Explore works categorized under this topic.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-amber-900 group-hover:text-amber-950">
                <span>View Books</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
