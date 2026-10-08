import React from 'react';
import { Library, ShieldAlert, BookOpen, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

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
    <footer className="mt-24 border-t border-stone-200/90 bg-[#F4F1EA] text-stone-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-100 flex items-center justify-center shrink-0 border border-amber-900/40">
                <Library className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-black tracking-tight text-stone-900 leading-none">
                  OpenBook
                </span>
                <span className="text-[9px] tracking-[0.2em] font-bold text-amber-900/80 uppercase mt-0.5">
                  Digital Library
                </span>
              </div>
            </div>
            
            <p className="text-stone-500 leading-relaxed text-xs">
              A free open-access public bookstore and digital repository. Dedicated to universal access to knowledge through instant in-browser reading and complete, unabridged PDF downloads.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-stone-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Multi-Region Cloud Verified</span>
            </div>
          </div>

          {/* Column 2: Catalog Navigation */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Explore Collection
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onNavigateHome} className="hover:text-amber-950 transition-colors cursor-pointer">
                  Bookstore Front Page
                </button>
              </li>
              <li>
                <button onClick={onNavigateBooks} className="hover:text-amber-950 transition-colors cursor-pointer">
                  Browse All Titles
                </button>
              </li>
              <li>
                <button onClick={onNavigateCategories} className="hover:text-amber-950 transition-colors cursor-pointer">
                  Subject Categories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateBooks()} className="hover:text-amber-950 transition-colors cursor-pointer">
                  Featured Reading Room
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Digital Features */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Reading & Formats
            </h4>
            <ul className="space-y-2.5 text-stone-500">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                <span>Instant In-Browser PDF Reader</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                <span>Direct High-Speed PDF Downloads</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                <span>Compatible with Phones, Tablets, & e-Readers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                <span>Permanent Firestore Chunks Storage</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Policy & Administration */}
          <div className="bg-white/80 p-5 rounded-xl border border-stone-200/90 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>Open Distribution Policy</span>
            </div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              OpenBook Library distributes works authorized for open distribution, public domain publications, or educational open access.
            </p>
            <div className="pt-2 border-t border-stone-100">
              <button 
                onClick={onNavigateAdmin} 
                className="text-amber-950 font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>Librarian Portal & Administration</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-300/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} OpenBook Library. Built for free and open learning.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium flex-wrap justify-center">
            <span className="text-stone-700">No Account Required</span>
            <span>•</span>
            <span className="text-stone-700">Unrestricted Reading</span>
            <span>•</span>
            <span className="text-stone-700">Clean Unabridged PDFs</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
