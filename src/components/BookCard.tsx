import React, { useState } from 'react';
import { BookOpen, Download, FileText, Loader2 } from 'lucide-react';
import { Book } from '../types/library';
import { formatFileSize, downloadBookPdf } from '../lib/api';

interface BookCardProps {
  book: Book;
  onOpenBook: (bookId: string) => void;
  onReadOnline: (bookId: string) => void;
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
      alert('Could not download PDF. Please check connection and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate pleasant palette based on book title length
  const hues = [
    'from-amber-950 to-stone-900 border-amber-800/40 text-amber-50',
    'from-stone-900 to-stone-800 border-stone-700/40 text-stone-100',
    'from-emerald-950 to-stone-900 border-emerald-800/40 text-emerald-50',
    'from-slate-900 to-indigo-950 border-slate-700/40 text-slate-100',
    'from-stone-800 to-amber-950 border-stone-700/40 text-amber-100'
  ];
  const hueIndex = Math.abs(book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % hues.length;
  const gradientClass = hues[hueIndex];

  return (
    <article className="group bg-white rounded-lg border border-stone-200 overflow-hidden flex flex-col transition-all duration-200 hover:border-stone-400 hover:shadow-md">
      {/* Book Cover Area */}
      <div 
        onClick={() => onOpenBook(book.id)}
        className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden cursor-pointer flex items-center justify-center p-3 select-none"
      >
        {book.cover_url && !imageError ? (
          <img
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center rounded shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          /* High-Fidelity Typographic Fallback Cover */
          <div className={`w-full h-full rounded shadow-inner p-5 flex flex-col justify-between border bg-gradient-to-b ${gradientClass}`}>
            <div className="border-b border-white/20 pb-2">
              <span className="text-[10px] tracking-widest uppercase opacity-75 font-sans block">
                {book.category_name || 'Library Edition'}
              </span>
            </div>
            
            <div className="my-auto py-2">
              <h4 className="font-serif text-lg leading-snug font-bold line-clamp-3">
                {book.title}
              </h4>
              <p className="text-xs italic opacity-85 mt-2 font-serif line-clamp-1">
                {book.author || 'Unknown Author'}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] opacity-70 border-t border-white/20 pt-2 font-mono tabular-nums">
              <span>{book.page_count ? `${book.page_count}p` : 'PDF'}</span>
              <span>{formatFileSize(book.file_size)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5 flex-wrap">
            {book.category_name && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory?.(book.category_id);
                }}
                className="hover:text-amber-900 transition-colors text-left"
              >
                {book.category_name}
              </button>
            )}
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{book.page_count ? `${book.page_count} pages` : 'PDF'}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-mono text-[11px] tabular-nums">{formatFileSize(book.file_size)}</span>
          </div>

          <h3 
            onClick={() => onOpenBook(book.id)}
            className="font-serif text-base font-bold text-stone-900 hover:text-amber-900 transition-colors cursor-pointer line-clamp-2 leading-snug mb-1"
          >
            {book.title}
          </h3>

          <p className="text-xs text-stone-600 mb-2 font-serif italic">
            By {book.author || 'Unknown Author'}
          </p>

          {book.description && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
              {book.description}
            </p>
          )}
        </div>

        {/* Action Buttons: Read & Download */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2 mt-auto">
          <a
            href={`/api/pdf/${book.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-1.5 px-3 text-xs font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            title="Read book online in new tab"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-900" />
            <span>Read Online</span>
          </a>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="py-1.5 px-3 text-xs font-medium text-white bg-stone-900 hover:bg-amber-950 rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-60 cursor-pointer"
            title="Download actual PDF file"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isDownloading ? 'Saving...' : 'Download'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
