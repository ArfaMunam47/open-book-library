import React from 'react';
import { BookOpen, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
  onNavigateBooks: () => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateCategories,
  onNavigateBooks,
  onNavigateAdmin
}) => {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-[#F5F2EB] text-stone-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 font-serif text-base font-bold text-stone-900 mb-2">
              <BookOpen className="w-4 h-4 text-amber-900" />
              <span>Open Book Library</span>
            </div>
            <p className="text-stone-500 leading-relaxed max-w-sm">
              An open digital library dedicated to making books freely accessible to discover, read online in your browser, and download for lifelong learning.
            </p>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
              Explore Library
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onNavigateHome} className="hover:text-stone-900 transition-colors">
                  Library Front Page
                </button>
              </li>
              <li>
                <button onClick={onNavigateBooks} className="hover:text-stone-900 transition-colors">
                  All Published Books
                </button>
              </li>
              <li>
                <button onClick={onNavigateCategories} className="hover:text-stone-900 transition-colors">
                  Subject Categories
                </button>
              </li>
              <li>
                <button onClick={onNavigateAdmin} className="hover:text-stone-900 transition-colors">
                  Librarian & Admin Portal
                </button>
              </li>
            </ul>
          </div>

          <div className="bg-stone-200/60 p-4 rounded-lg border border-stone-300/70">
            <div className="flex items-center gap-1.5 font-medium text-stone-800 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-800" />
              <span>Copyright & Distribution Policy</span>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              This digital collection only provides books that are in the public domain, licensed under Creative Commons, authorized for open distribution, or legally published by the copyright holder.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-300/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500">
          <div>
            © {new Date().getFullYear()} Open Book Library. Free access for all readers.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>No account required</span>
            <span>·</span>
            <span>Real PDF downloads</span>
            <span>·</span>
            <span>Instant in-browser reader</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
