import React, { useState } from 'react';
import { BookOpen, Download, Loader2, ExternalLink } from 'lucide-react';
import { Book } from '../types/library';
import { formatFileSize, downloadBookPdf } from '../lib/api';

interface BookCardProps {
  book: Book;
  onOpenBook: (bookId: string) => void;
  onReadOnline?: (bookId: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onOpenBook,
  onReadOnline,
  onSelectCategory
}) => {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      await downloadBookPdf(book.id, book.title);
    } catch (err: any) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Typographic fallback gradient hues for collector binding
  const hues = [
    'from-[#2c1d11] via-[#1c130b] to-[#120c07] border-[#634224] text-[#faf4ea]',
    'from-[#14231e] via-[#0d1714] to-[#080f0d] border-[#294c3e] text-[#faf4ea]',
    'from-[#23151b] via-[#160d11] to-[#0f090c] border-[#4c2d3a] text-[#faf4ea]',
    'from-[#161d2b] via-[#0d121c] to-[#080b12] border-[#2c3b57] text-[#faf4ea]',
    'from-[#251e13] via-[#17120a] to-[#0e0b06] border-[#574426] text-[#faf4ea]'
  ];
  const hueIndex = Math.abs(book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % hues.length;
  const gradientClass = hues[hueIndex];

  return (
    <article 
      onClick={() => onOpenBook(book.id)}
      className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden flex flex-col transition-all duration-300 hover:border-red-500/40 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer"
    >
      {/* 1. Realistic 3D Hardcover Book Presentation */}
      <div className="relative aspect-[3/4.2] w-full bg-gradient-to-b from-[#F9F7F2] to-[#ECE7DC] overflow-hidden flex items-center justify-center p-4 sm:p-5 select-none border-b border-stone-100">
        
        {/* Soft background ambient glow */}
        <div className="absolute inset-0 bg-radial from-white/80 to-transparent pointer-events-none" />

        {/* The 3D Book Object */}
        <div className="relative w-full h-full rounded-r-md rounded-l-xs shadow-md group-hover:shadow-2xl transition-all duration-400 overflow-hidden flex items-center justify-center bg-stone-900 border-t border-r border-stone-700/80">
          
          {book.cover_url && !imageError ? (
            <img
              src={book.cover_url}
              alt={`Cover of ${book.title}`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            /* Hardcover Typographic Binding for books without image */
            <div className={`w-full h-full p-4 flex flex-col justify-between border bg-gradient-to-b ${gradientClass} leather-bound-texture`}>
              <div className="border-b border-[#d4af37]/30 pb-2">
                <span className="text-[9px] tracking-[0.2em] font-mono font-bold uppercase text-[#d4af37] block truncate">
                  {book.category_name || 'Collector Edition'}
                </span>
              </div>
              
              <div className="my-auto py-2">
                <h4 className="font-serif text-sm sm:text-base leading-snug font-bold line-clamp-3 text-[#fef9f0]">
                  {book.title}
                </h4>
                <p className="text-xs italic mt-2 font-serif text-[#d1b896] line-clamp-1">
                  {book.author || 'Unknown Author'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[9px] border-t border-[#d4af37]/30 pt-1.5 font-mono text-[#aa9477]">
                <span>{book.page_count ? `${book.page_count}p` : 'PDF'}</span>
                <span>{formatFileSize(book.file_size)}</span>
              </div>
            </div>
          )}

          {/* Book Spine Shadow on left edge */}
          <div className="hardcover-spine-crease" />
          
          {/* Top Page Edge & Right Paper Edge */}
          <div className="hardcover-top-edge" />
          <div className="hardcover-page-edges" />

          {/* Top corner format stamp */}
          <div className="absolute top-2 right-2 flex items-center gap-1 pointer-events-none">
            <span className="bg-stone-950/85 backdrop-blur-xs text-[#d4af37] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#d4af37]/30">
              PDF
            </span>
          </div>

          {/* Hover overlay sheen */}
          <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 text-stone-900 text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <span>Inspect Book</span>
              <ExternalLink className="w-3 h-3 text-stone-600" />
            </span>
          </div>
        </div>

        {/* Realistic drop shadow underneath book */}
        <div className="absolute inset-x-8 bottom-2 h-4 bg-stone-900/30 rounded-full blur-md -z-10 group-hover:scale-95 transition-transform" />
      </div>

      {/* 2. Book Information & Metadata (Zero-Pill Discipline) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Format metadata */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1.5 flex-wrap">
            {book.category_name && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory?.(book.category_id);
                }}
                className="font-semibold text-[#FF3038] hover:text-red-700 hover:underline transition-colors text-left truncate max-w-[140px]"
              >
                {book.category_name}
              </button>
            )}
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-mono text-[10px] text-stone-500">
              {book.page_count ? `${book.page_count} pages` : 'Complete PDF'}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-mono text-[10px] text-stone-500">
              {formatFileSize(book.file_size)}
            </span>
          </div>

          {/* Title */}
          <h3 
            className="font-serif text-base font-bold text-stone-900 group-hover:text-[#FF3038] transition-colors line-clamp-2 leading-snug mb-1"
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-stone-600 font-serif italic mb-2.5 line-clamp-1">
            By {book.author || 'Unknown Author'}
          </p>

          {/* Description excerpt */}
          {book.description && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
              {book.description}
            </p>
          )}
        </div>

        {/* 3. Action Row: Read Online & Download */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2 mt-auto">
          {/* Read Online Button (Direct new tab) */}
          <a
            href={`/api/pdf/${book.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#191919] hover:bg-[#FF3038] rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
            title="Read book online in new tab"
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>Read Online</span>
          </a>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="py-2 px-3 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            title="Download PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
            ) : (
              <Download className="w-3.5 h-3.5 text-stone-600" />
            )}
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>
    </article>
  );
};
