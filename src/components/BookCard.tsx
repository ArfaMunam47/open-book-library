import React, { useState } from 'react';
import { BookOpen, Download, Loader2, ArrowRight } from 'lucide-react';
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
    'bg-[#292A27] text-[#F8F8F4]',
    'bg-[#382D32] text-[#F8F8F4]',
    'bg-[#2A342B] text-[#E8EAE2]',
    'bg-[#3E403B] text-[#F8F8F4]',
    'bg-[#443831] text-[#F8F8F4]'
  ];
  const hueIndex = Math.abs(book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % hues.length;
  const bgClass = hues[hueIndex];

  return (
    <article 
      onClick={() => onOpenBook(book.id)}
      className="group bg-white rounded-xl border border-[#E8E8E2] overflow-hidden flex flex-col justify-between p-4 transition-all duration-300 hover:border-[#DDE0D5] hover:shadow-md hover:-translate-y-1 cursor-pointer"
    >
      <div>
        {/* Book Cover Container with Natural Aspect Ratio */}
        <div className="relative aspect-[2/3] w-full bg-[#F8F8F4] rounded-lg overflow-hidden border border-[#E8E8E2] mb-3.5 flex items-center justify-center select-none shadow-2xs group-hover:shadow-xs transition-shadow">
          
          {book.cover_url && !imageError ? (
            <img
              src={book.cover_url}
              alt={`Cover of ${book.title}`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-103"
            />
          ) : (
            /* Refined Typographic Binding for books without image */
            <div className={`w-full h-full p-4 flex flex-col justify-between ${bgClass} border-r-2 border-white/10`}>
              <div className="border-b border-white/15 pb-1">
                <span className="text-[8.5px] tracking-widest font-mono uppercase opacity-75 block truncate">
                  {book.category_name || 'OpenBook Archive'}
                </span>
              </div>
              
              <div className="my-auto py-2">
                <h4 className="font-serif text-sm leading-snug font-bold line-clamp-3">
                  {book.title}
                </h4>
                <p className="text-[11px] italic mt-1.5 font-serif opacity-80 line-clamp-1">
                  {book.author || 'Unknown Author'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[8px] border-t border-white/15 pt-1 font-mono opacity-70">
                <span>{book.page_count ? `${book.page_count}p` : 'PDF'}</span>
                <span>{formatFileSize(book.file_size)}</span>
              </div>
            </div>
          )}

          {/* Top corner format stamp */}
          <div className="absolute top-2 right-2 flex items-center gap-1 pointer-events-none">
            <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-xs text-[#292A27] text-[9px] font-mono font-medium rounded-full border border-[#E8E8E2] shadow-2xs">
              PDF
            </span>
          </div>
        </div>

        {/* Category Tag */}
        {book.category_name && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCategory?.(book.category_id);
            }}
            className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#C98187] hover:underline block truncate mb-1"
          >
            {book.category_name}
          </button>
        )}

        {/* Title */}
        <h3 className="font-serif font-bold text-base text-[#292A27] group-hover:text-[#C98187] transition-colors line-clamp-1 leading-snug">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-xs text-[#85857E] mt-0.5 line-clamp-1 font-sans">
          By {book.author || 'Unknown Author'}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3.5 mt-3.5 border-t border-[#E8E8E2] flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#85857E]">
          {book.page_count ? `${book.page_count} pages` : 'Complete'}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Direct Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download book PDF"
            className="p-1.5 text-[#85857E] hover:text-[#292A27] hover:bg-[#E8EAE2] rounded-md transition-colors cursor-pointer"
            aria-label="Download PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C98187]" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Read Online Button */}
          {onReadOnline && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReadOnline(book.id);
              }}
              className="text-xs font-semibold text-[#292A27] group-hover:text-[#C98187] flex items-center gap-1 transition-colors pl-1 cursor-pointer"
            >
              <span>Read</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
