import React, { useState } from 'react';
import { BookOpen, Download, FileText, Loader2, Sparkles, ExternalLink } from 'lucide-react';
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
      setIsDownloading(false);
      setIsDownloading(true);
      await downloadBookPdf(book.id, book.title);
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Could not download PDF. Please check connection and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Typographic fallback gradient hues for books without covers
  const hues = [
    'from-amber-950 via-stone-900 to-stone-950 border-amber-900/50 text-amber-50',
    'from-stone-900 via-stone-850 to-stone-950 border-stone-700/50 text-stone-100',
    'from-emerald-950 via-stone-900 to-stone-950 border-emerald-900/50 text-emerald-50',
    'from-slate-900 via-indigo-950 to-stone-950 border-slate-700/50 text-slate-100',
    'from-stone-850 via-amber-950 to-stone-900 border-amber-900/40 text-amber-100'
  ];
  const hueIndex = Math.abs(book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % hues.length;
  const gradientClass = hues[hueIndex];

  return (
    <article 
      onClick={() => onOpenBook(book.id)}
      className="group bg-white rounded-xl border border-stone-200/90 overflow-hidden flex flex-col transition-all duration-300 hover:border-stone-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      {/* 1. Bookstore Realistic Book Cover Presentation */}
      <div className="relative aspect-[3/4.2] w-full bg-stone-100/90 overflow-hidden flex items-center justify-center p-3.5 select-none border-b border-stone-100">
        
        {/* Soft background ambient gradient */}
        <div className="absolute inset-0 bg-radial from-stone-50 to-stone-200/60 pointer-events-none" />

        {/* The 3D Book Object */}
        <div className="relative w-full h-full rounded shadow-md group-hover:shadow-2xl transition-all duration-300 overflow-hidden flex items-center justify-center bg-stone-900">
          
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
            <div className={`w-full h-full p-4 flex flex-col justify-between border bg-gradient-to-b ${gradientClass}`}>
              <div className="border-b border-white/20 pb-2">
                <span className="text-[9px] tracking-widest uppercase font-semibold text-amber-200 block truncate">
                  {book.category_name || 'Open Library Edition'}
                </span>
              </div>
              
              <div className="my-auto py-2">
                <h4 className="font-serif text-base sm:text-lg leading-snug font-bold line-clamp-3 text-white">
                  {book.title}
                </h4>
                <p className="text-xs italic opacity-85 mt-2 font-serif text-amber-100/90 line-clamp-1">
                  {book.author || 'Unknown Author'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] opacity-75 border-t border-white/20 pt-2 font-mono">
                <span>{book.page_count ? `${book.page_count}p` : 'PDF'}</span>
                <span>{formatFileSize(book.file_size)}</span>
              </div>
            </div>
          )}

          {/* Book Spine Shadow on left edge to give realistic 3D hardcover depth */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
          
          {/* Subtle page-edge highlight on right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />

          {/* Top badges on cover */}
          <div className="absolute top-2 right-2 flex items-center gap-1 pointer-events-none">
            <span className="bg-stone-900/80 backdrop-blur-xs text-amber-100 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs">
              PDF
            </span>
          </div>

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-stone-900/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 text-stone-900 text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <span>View Book</span>
              <ExternalLink className="w-3 h-3 text-stone-600" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. Book Information & Metadata */}
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
                className="font-medium text-amber-900/90 hover:text-amber-950 hover:underline transition-colors text-left truncate max-w-[150px]"
              >
                {book.category_name}
              </button>
            )}
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-mono text-[10px] text-stone-500">
              {book.page_count ? `${book.page_count} pages` : 'PDF'}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-mono text-[10px] text-stone-500">
              {formatFileSize(book.file_size)}
            </span>
          </div>

          {/* Title */}
          <h3 
            className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-950 transition-colors line-clamp-2 leading-snug mb-1"
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-stone-600 font-serif italic mb-2 line-clamp-1">
            By {book.author || 'Unknown Author'}
          </p>

          {/* Real Description excerpt */}
          {book.description && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
              {book.description}
            </p>
          )}
        </div>

        {/* 3. Bookstore Action Row: Read Online & Download */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2 mt-auto">
          {/* Read Online Button (Direct new tab) */}
          <a
            href={`/api/pdf/${book.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-3 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200/90 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
            title="Read book online in new tab"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-900" />
            <span>Read Online</span>
          </a>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="py-2 px-3 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
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
