import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Download, 
  ShieldCheck, 
  Loader2, 
  ExternalLink,
  Share2,
  Bookmark
} from 'lucide-react';
import { Book } from '../types/library';
import { formatFileSize, downloadBookPdf } from '../lib/api';
import { BookCard } from './BookCard';

interface BookDetailsProps {
  book: Book;
  allBooks?: Book[];
  onBack: () => void;
  onReadOnline: (bookId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenBook?: (bookId: string) => void;
}

export const BookDetails: React.FC<BookDetailsProps> = ({
  book,
  allBooks = [],
  onBack,
  onReadOnline,
  onSelectCategory,
  onOpenBook
}) => {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadBookPdf(book.id, book.title);
    } catch (err: any) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Update document title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${book.title} by ${book.author} — OpenBook Digital Library`;
    return () => {
      document.title = originalTitle;
    };
  }, [book]);

  // Related books from real database (exclude current book)
  const relatedBooks = allBooks
    .filter(b => b.id !== book.id)
    .sort((a, b) => {
      if (a.category_id === book.category_id && b.category_id !== book.category_id) return -1;
      if (b.category_id === book.category_id && a.category_id !== book.category_id) return 1;
      return 0;
    })
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-[#F8F8F4] text-[#292A27]">
      
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex items-center justify-between text-xs text-[#85857E]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="hover:text-[#292A27] transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>
          <span aria-hidden="true" className="text-[#DDE0D5]">/</span>
          {book.category_name && (
            <>
              <button
                onClick={() => onSelectCategory(book.category_id)}
                className="hover:text-[#C98187] transition-colors cursor-pointer"
              >
                {book.category_name}
              </button>
              <span aria-hidden="true" className="text-[#DDE0D5]">/</span>
            </>
          )}
          <span className="text-[#292A27] font-semibold truncate max-w-[200px] sm:max-w-xs">
            {book.title}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="hover:text-[#C98187] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E8E2] shadow-2xs cursor-pointer font-medium text-xs"
        >
          <Share2 className="w-3.5 h-3.5 text-[#85857E]" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Volume'}</span>
        </button>
      </div>

      {/* 2. Main Editorial Book Edition Showcase */}
      <div className="bg-white rounded-2xl border border-[#E8E8E2] overflow-hidden shadow-2xs p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Book Showcase & Actions */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            <div className="relative w-full max-w-[280px]">
              <div className="relative aspect-[2/3] w-full rounded-lg bg-[#F8F8F4] shadow-xl overflow-hidden border border-[#E8E8E2] transition-transform duration-300 hover:-translate-y-1.5">
                {book.cover_url && !imageError ? (
                  <img
                    src={book.cover_url}
                    alt={`Cover of ${book.title}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full p-6 flex flex-col justify-between bg-[#292A27] text-[#F8F8F4]">
                    <div className="border-b border-white/15 pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#C98187] font-mono block">
                        {book.category_name || 'Open Digital Edition'}
                      </span>
                    </div>
                    <div className="py-4">
                      <h3 className="font-serif text-2xl font-bold leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-sm italic text-[#E8EAE2] mt-3 font-serif">
                        {book.author}
                      </p>
                    </div>
                    <div className="border-t border-white/15 pt-2 flex justify-between text-xs text-[#85857E] font-mono">
                      <span>{book.page_count} Pages</span>
                      <span>{formatFileSize(book.file_size)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Bookstore Actions */}
            <div className="w-full max-w-[280px] mt-8 space-y-3">
              {/* Primary: Read Online in New Tab */}
              <a
                href={`/api/pdf/${book.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#292A27] hover:bg-[#3E403B] text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <BookOpen className="w-4 h-4 text-[#E8EAE2]" />
                <span>Read Online</span>
              </a>

              {/* Secondary: Download PDF */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3 px-4 bg-[#F8F8F4] hover:bg-[#E8EAE2] border border-[#E8E8E2] text-[#292A27] rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C98187]" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#85857E]" />
                    <span>Download PDF ({formatFileSize(book.file_size)})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[#85857E] pt-1">
                Verified high-speed download · Unabridged PDF
              </p>
            </div>
          </div>

          {/* Right Column: Title, Author, Specs, Synopsis */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category & Metadata */}
              <div className="flex items-center gap-2 text-xs text-[#85857E] flex-wrap font-sans">
                {book.category_name && (
                  <button
                    onClick={() => onSelectCategory(book.category_id)}
                    className="font-semibold uppercase tracking-wider text-[#C98187] hover:underline"
                  >
                    {book.category_name}
                  </button>
                )}
                <span aria-hidden="true" className="text-[#DDE0D5]">·</span>
                <span className="font-mono text-[#85857E]">
                  {book.page_count ? `${book.page_count} Pages` : 'Complete Edition'}
                </span>
                <span aria-hidden="true" className="text-[#DDE0D5]">·</span>
                <span className="font-mono text-[#85857E]">
                  {formatFileSize(book.file_size)}
                </span>
                <span aria-hidden="true" className="text-[#DDE0D5]">·</span>
                <span className="text-[#292A27] font-medium">Free Public Edition</span>
              </div>

              {/* Book Title & Author */}
              <div>
                <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#292A27] tracking-tight leading-[1.15]">
                  {book.title}
                </h1>
                <p className="font-serif text-lg sm:text-xl italic text-[#85857E] mt-2">
                  By {book.author || 'Unknown Author'}
                </p>
              </div>

              {/* Specifications Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 bg-[#F8F8F4] rounded-xl border border-[#E8E8E2] text-xs">
                <div>
                  <span className="text-[#85857E] uppercase tracking-wider text-[10px] block font-sans">Edition</span>
                  <span className="font-semibold text-[#292A27] mt-0.5 block">Unabridged PDF</span>
                </div>
                <div>
                  <span className="text-[#85857E] uppercase tracking-wider text-[10px] block font-sans">Pages</span>
                  <span className="font-mono text-[#292A27] mt-0.5 block">{book.page_count || 'Full text'}</span>
                </div>
                <div>
                  <span className="text-[#85857E] uppercase tracking-wider text-[10px] block font-sans">File Size</span>
                  <span className="font-mono text-[#292A27] mt-0.5 block">{formatFileSize(book.file_size)}</span>
                </div>
                <div>
                  <span className="text-[#85857E] uppercase tracking-wider text-[10px] block font-sans">Access</span>
                  <span className="font-semibold text-[#C98187] mt-0.5 block">100% Free</span>
                </div>
                {book.publication_year && (
                  <div className="col-span-2 pt-2 border-t border-[#E8E8E2]">
                    <span className="text-[#85857E] uppercase tracking-wider text-[10px] block font-sans">Year</span>
                    <span className="font-mono text-[#292A27] mt-0.5 block">{book.publication_year}</span>
                  </div>
                )}
                {book.publisher && (
                  <div className="col-span-2 pt-2 border-t border-[#E8E8E2]">
                    <span className="text-[#85857E] uppercase tracking-wider text-[10px] block font-sans">Publisher</span>
                    <span className="text-[#292A27] mt-0.5 block truncate">{book.publisher}</span>
                  </div>
                )}
              </div>

              {/* Book Synopsis */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#292A27] mb-3 flex items-center gap-1.5 font-sans">
                  <Bookmark className="w-3.5 h-3.5 text-[#C98187]" />
                  <span>About this Book</span>
                </h2>
                <div className="text-[#85857E] text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
                  {book.description || 'No detailed synopsis provided for this book.'}
                </div>
              </div>

              {/* Free Access Guarantee */}
              <div className="bg-[#E8EAE2]/50 border border-[#DDE0D5] rounded-xl p-5 text-xs text-[#292A27] flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-[#C98187] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#292A27] block mb-0.5 font-serif text-sm">
                    Open Access &amp; Digital Preservation Guarantee
                  </span>
                  <p className="text-[#85857E] text-xs leading-relaxed font-sans">
                    This book is available free of charge for lifelong learners, students, and readers worldwide. The PDF file is stored persistently in Cloud Firestore and can be read online or kept permanently on your reading device.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 3. More Books in the Library Shelf */}
      {relatedBooks.length > 0 && (
        <section className="pt-4">
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E8E8E2]">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C98187] font-semibold block mb-1">
                MORE IN COLLECTION
              </span>
              <h3 className="font-editorial text-2xl font-bold text-[#292A27]">
                You May Also Enjoy
              </h3>
            </div>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-[#292A27] hover:text-[#C98187] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore All Books</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map(b => (
              <BookCard
                key={b.id}
                book={b}
                onOpenBook={onOpenBook || (() => {})}
                onReadOnline={onReadOnline}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
