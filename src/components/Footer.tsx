import React from 'react';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

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
    <footer className="mt-20 border-t border-[#E8E8E2] bg-[#F8F8F4] text-[#85857E] text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#292A27] text-[#F8F8F4] flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-4 h-4 text-[#E8EAE2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-[#292A27] leading-none">
                  OpenBook
                </span>
                <span className="text-[9px] tracking-[0.24em] font-medium text-[#85857E] uppercase mt-0.5 font-sans">
                  Digital Library
                </span>
              </div>
            </div>
            
            <p className="text-[#85857E] leading-relaxed text-xs">
              A free open-access digital library and public repository. Dedicated to universal access to knowledge through instant in-browser reading and complete, unabridged PDF downloads.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-[#85857E] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#C98187]" />
              <span>Multi-Region Cloud Verified</span>
            </div>
          </div>

          {/* Column 2: Catalog Navigation */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-[#292A27] uppercase tracking-wider text-[11px]">
              Explore Collection
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onNavigateHome} className="hover:text-[#C98187] transition-colors cursor-pointer">
                  Bookstore Front Page
                </button>
              </li>
              <li>
                <button onClick={onNavigateBooks} className="hover:text-[#C98187] transition-colors cursor-pointer">
                  Browse All Titles
                </button>
              </li>
              <li>
                <button onClick={onNavigateCategories} className="hover:text-[#C98187] transition-colors cursor-pointer">
                  Subject Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Digital Features */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-[#292A27] uppercase tracking-wider text-[11px]">
              Reading &amp; Formats
            </h4>
            <ul className="space-y-2.5 text-[#85857E]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDE0D5]" />
                <span>Instant In-Browser PDF Reader</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDE0D5]" />
                <span>Direct High-Speed PDF Downloads</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDE0D5]" />
                <span>Compatible with Phones &amp; e-Readers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDE0D5]" />
                <span>Persistent Cloud Firestore Storage</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Librarian & Administration */}
          <div className="bg-white p-5 rounded-xl border border-[#E8E8E2] space-y-3">
            <div className="flex items-center gap-2 text-[#292A27]">
              <ShieldCheck className="w-4 h-4 text-[#C98187]" />
              <span className="font-bold text-xs uppercase tracking-wider">Librarian Access</span>
            </div>
            <p className="text-[11px] text-[#85857E] leading-relaxed">
              Curate library volumes, upload high-resolution manuscripts, and edit bibliographic records.
            </p>
            <button
              onClick={onNavigateAdmin}
              className="w-full py-2 px-3 bg-[#292A27] hover:bg-[#3E403B] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-[#E8E8E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#85857E]">
          <div>
            &copy; {new Date().getFullYear()} OpenBook Digital Library. Open Knowledge Commons.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with care for curious minds everywhere</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
