import React, { useState } from 'react';
import { Book, Category } from '../types/library';
import { 
  BookOpen, 
  Download, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Award, 
  Flame, 
  Sparkles, 
  BookmarkCheck, 
  ArrowRight,
  Library,
  Layers,
  ChevronRight,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { formatFileSize, downloadBookPdf } from '../lib/api';

interface ReadingRoomSidebarProps {
  currentBook?: Book;
  totalBooks: number;
  categories: Category[];
  onOpenBook: (bookId: string) => void;
  onReadOnline: (bookId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const ReadingRoomSidebar: React.FC<ReadingRoomSidebarProps> = ({
  currentBook,
  totalBooks,
  categories,
  onOpenBook,
  onReadOnline,
  onSelectCategory,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!currentBook) return;
    try {
      setDownloading(true);
      await downloadBookPdf(currentBook.id, currentBook.title);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <aside 
      aria-label="Reading Chamber Overview"
      className="hidden xl:flex flex-col w-80 2xl:w-88 shrink-0 space-y-6 py-6 px-4 bg-[#F5F1E8]/70 border-l border-amber-900/15 overflow-y-auto"
    >
      {/* 1. Reader Chamber Badge */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#241C15] to-[#17120E] text-stone-200 border border-amber-900/40 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-amber-900/70 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300/80 font-semibold block">
              Reading Chamber
            </span>
            <h4 className="font-serif text-sm font-bold text-amber-100">
              OpenBook Scholar Pass
            </h4>
          </div>
        </div>

        {/* Daily Streak & Reading Goal */}
        <div className="space-y-2 pt-1 border-t border-amber-950/80 text-xs">
          <div className="flex justify-between items-center text-stone-300">
            <span className="flex items-center gap-1.5 text-stone-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Today's Goal</span>
            </span>
            <span className="font-mono text-amber-200 font-semibold">30 mins active</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-stone-900/80 h-1.5 rounded-full overflow-hidden border border-amber-950">
            <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full w-3/4 rounded-full" />
          </div>

          <div className="flex justify-between text-[11px] text-stone-400 font-mono pt-0.5">
            <span>Free Public Reader</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Unrestricted
            </span>
          </div>
        </div>
      </div>

      {/* 2. Currently Selected Desk Volume */}
      {currentBook && (
        <div className="p-4 rounded-2xl bg-[#FCFAF5] border border-amber-900/15 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold flex items-center gap-1">
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>On Reading Desk</span>
            </span>
            <span className="text-[10px] font-mono text-stone-500">Active</span>
          </div>

          <div className="flex gap-3">
            {/* Mini 3D Book Cover */}
            <div className="relative shrink-0 w-16 h-22 rounded shadow-md overflow-hidden border border-amber-900/20 bg-stone-800">
              {currentBook.cover_url ? (
                <img 
                  src={currentBook.cover_url} 
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-1.5 flex flex-col justify-center items-center text-center bg-stone-900 text-amber-100">
                  <Library className="w-4 h-4 text-amber-400/80 mb-1" />
                  <span className="text-[8px] font-serif leading-none line-clamp-2">{currentBook.title}</span>
                </div>
              )}
              {/* Spine crease shine */}
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Book Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h5 
                  onClick={() => onOpenBook(currentBook.id)}
                  className="font-serif text-xs font-bold text-stone-900 hover:text-amber-900 transition-colors line-clamp-2 cursor-pointer leading-tight"
                >
                  {currentBook.title}
                </h5>
                <p className="text-[11px] text-stone-600 truncate mt-0.5">
                  {currentBook.author}
                </p>
              </div>

              <div className="text-[10px] font-mono text-stone-500 flex items-center gap-2">
                <span>{formatFileSize(currentBook.file_size)}</span>
                {currentBook.page_count && <span>· {currentBook.page_count} pgs</span>}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onReadOnline(currentBook.id)}
              className="py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Read</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="py-2 px-2.5 rounded-xl border border-amber-900/20 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-900" />
              )}
              <span>PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Library Provenance & Preservation Metrics */}
      <div className="p-4 rounded-2xl bg-[#FCFAF5] border border-amber-900/15 shadow-sm space-y-3">
        <h5 className="text-[10px] font-mono uppercase tracking-widest text-amber-900 font-bold">
          Archive Provenance
        </h5>

        <div className="space-y-2 text-xs text-stone-700">
          <div className="flex justify-between items-center py-1 border-b border-stone-200">
            <span className="text-stone-500 font-mono text-[11px]">Public Volumes:</span>
            <span className="font-mono font-bold text-amber-950">{totalBooks} Real Books</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-stone-200">
            <span className="text-stone-500 font-mono text-[11px]">Total Subjects:</span>
            <span className="font-mono text-stone-900">{categories.length} Categories</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-stone-200">
            <span className="text-stone-500 font-mono text-[11px]">Storage Engine:</span>
            <span className="font-mono text-stone-900">Cloud Firestore</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-stone-500 font-mono text-[11px]">Commercial Fees:</span>
            <span className="text-emerald-700 font-semibold">$0.00 (Free)</span>
          </div>
        </div>
      </div>

      {/* 4. Subject Quick Jumps */}
      <div className="p-4 rounded-2xl bg-[#FCFAF5] border border-amber-900/15 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-mono uppercase tracking-widest text-amber-900 font-bold">
            Curated Subjects
          </h5>
          <span className="text-[10px] font-mono text-stone-500">{categories.length} Shelves</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/90 text-amber-950 border border-amber-900/15 transition-colors cursor-pointer"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Curator's Daily Inscription */}
      <div className="p-4 rounded-2xl bg-amber-950/5 border border-amber-900/15 text-stone-700 text-xs italic font-serif leading-relaxed">
        &ldquo;The reading of all good books is like conversation with the finest minds of past centuries.&rdquo;
        <span className="block mt-1.5 text-[10px] not-italic font-mono uppercase tracking-wider text-amber-900/80 font-bold">
          — René Descartes
        </span>
      </div>
    </aside>
  );
};
