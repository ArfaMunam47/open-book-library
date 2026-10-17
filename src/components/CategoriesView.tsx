import React from 'react';
import { BookOpen, ArrowRight, ArrowLeft, Layers, TrendingUp, Briefcase, GraduationCap, Heart, Cpu, Sun, Users, BookMarked } from 'lucide-react';
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

  // Category Icon Resolver
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('finance') || n.includes('money')) return <TrendingUp className="w-5 h-5" />;
    if (n.includes('business')) return <Briefcase className="w-5 h-5" />;
    if (n.includes('education')) return <GraduationCap className="w-5 h-5" />;
    if (n.includes('tech') || n.includes('it')) return <Cpu className="w-5 h-5" />;
    if (n.includes('health')) return <Heart className="w-5 h-5" />;
    if (n.includes('fiction')) return <BookMarked className="w-5 h-5" />;
    if (n.includes('religion') || n.includes('philosophy')) return <Sun className="w-5 h-5" />;
    if (n.includes('family') || n.includes('relationships')) return <Users className="w-5 h-5" />;
    return <Layers className="w-5 h-5" />;
  };

  // If a category is selected, show that category's books
  if (currentCategory) {
    const categoryBooks = books.filter(b => b.category_id === currentCategory.id);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F8F8F4] text-[#292A27]">
        {/* Back to all categories */}
        <button
          onClick={() => onSelectCategory(undefined)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#85857E] hover:text-[#292A27] transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>All Subject Categories</span>
        </button>

        {/* Category Header */}
        <div className="pb-6 border-b border-[#E8E8E2]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C98187]" />
            <span className="text-xs uppercase font-sans tracking-[0.2em] text-[#C98187] font-semibold">
              SUBJECT COLLECTION
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#292A27] tracking-tight">
            {currentCategory.name}
          </h1>
          {currentCategory.description && (
            <p className="text-sm text-[#85857E] mt-2 max-w-2xl leading-relaxed font-sans">
              {currentCategory.description}
            </p>
          )}
          <div className="mt-3 font-mono text-xs font-medium text-[#85857E]">
            {categoryBooks.length} {categoryBooks.length === 1 ? 'Book Cataloged' : 'Books Cataloged'}
          </div>
        </div>

        {/* Real Books in Category */}
        {categoryBooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E2] p-16 text-center max-w-lg mx-auto shadow-2xs">
            <BookOpen className="w-12 h-12 text-[#85857E]/50 mx-auto mb-3" />
            <h3 className="font-editorial text-xl font-bold text-[#292A27]">
              No books currently in this subject
            </h3>
            <p className="text-xs text-[#85857E] mt-2 leading-relaxed">
              New open-access and public domain books are added continuously. Explore other subjects in the library.
            </p>
            <button
              onClick={() => onSelectCategory(undefined)}
              className="mt-6 px-5 py-2.5 text-xs font-semibold text-white bg-[#292A27] hover:bg-[#3E403B] rounded-xl transition-colors cursor-pointer"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#F8F8F4] text-[#292A27]">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase font-sans tracking-[0.2em] text-[#C98187] font-semibold block mb-1">
          LIBRARY SUBJECTS
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#292A27] tracking-tight">
          Explore All Categories
        </h1>
        <p className="text-sm text-[#85857E] mt-3 leading-relaxed font-sans">
          Browse our catalog organized across structured academic, literary, and personal development topics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        {categories.map(cat => {
          const count = books.filter(b => b.category_id === cat.id).length;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="bg-white rounded-xl border border-[#E8E8E2] hover:border-[#DDE0D5] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xs hover:-translate-y-1 cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E8EAE2] group-hover:bg-[#C98187]/15 text-[#292A27] group-hover:text-[#C98187] flex items-center justify-center transition-colors mb-4">
                  {getCategoryIcon(cat.name)}
                </div>
                <h3 className="font-serif font-bold text-lg text-[#292A27] group-hover:text-[#C98187] transition-colors leading-snug">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-[#85857E] mt-2 line-clamp-2 leading-relaxed font-sans">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#E8E8E2] flex items-center justify-between text-xs">
                <span className="font-mono text-[#85857E]">
                  {count} {count === 1 ? 'Book' : 'Books'}
                </span>
                <span className="font-semibold text-[#292A27] group-hover:text-[#C98187] flex items-center gap-1 transition-colors">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
