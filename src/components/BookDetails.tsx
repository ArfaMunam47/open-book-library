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

  // Update document title for SEO
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>
          <span aria-hidden="true" className="text-stone-300">/</span>
          {book.category_name && (
            <>
              <button
                onClick={() => onSelectCategory(book.category_id)}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                {book.category_name}
              </button>
              <span aria-hidden="true" className="text-stone-300">/</span>
            </>
          )}
          <span className="text-stone-800 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {book.title}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="hover:text-stone-900 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-2xs cursor-pointer font-medium"
        >
          <Share2 className="w-3.5 h-3.5 text-stone-500" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Volume'}</span>
        </button>
      </div>

      {/* 2. Main Editorial Book Edition Showcase */}
      <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: 3D Hardcover Book Showcase & Actions */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* The 3D Book Presentation */}
            <div className="relative group perspective-book w-full max-w-[300px]">
              {/* Soft ground shadow */}
              <div className="absolute inset-x-4 -bottom-6 h-8 bg-stone-900/35 rounded-full blur-xl" />

              <div className="relative aspect-[3/4.4] w-full rounded-r-md rounded-l-xs bg-stone-900 shadow-2xl overflow-hidden border-t border-r border-b border-stone-700/80 transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-1">
                {book.cover_url && !imageError ? (
                  <img
                    src={book.cover_url}
                    alt={`Cover of ${book.title}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 text-stone-100">
                    <div className="border-b border-stone-700 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-sans block">
                        {book.category_name || 'Open Digital Edition'}
                      </span>
                    </div>
                    <div className="py-4">
                      <h3 className="font-serif text-2xl font-bold leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-sm italic text-stone-300 mt-3 font-serif">
                        {book.author}
                      </p>
                    </div>
                    <div className="border-t border-stone-800 pt-3 flex justify-between text-xs text-stone-400 font-mono">
                      <span>{book.page_count} Pages</span>
                      <span>{formatFileSize(book.file_size)}</span>
                    </div>
                  </div>
                )}

                {/* Spine Shadow on Left Edge */}
                <div className="hardcover-spine-crease" />

                {/* Top and side page edge depth */}
                <div className="hardcover-top-edge" />
                <div className="hardcover-page-edges" />
              </div>
            </div>

            {/* Direct Bookstore Actions */}
            <div className="w-full max-w-[300px] mt-8 space-y-3">
              {/* Primary: Read Online in New Tab */}
              <a
                href={`/api/pdf/${book.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#FF3038] hover:bg-[#E52028] text-white rounded-xl font-semibold text-sm transition-all shadow-[0_10px_20px_rgba(255,48,56,0.3)] hover:shadow-[0_14px_25px_rgba(255,48,56,0.4)] flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>Read Online in New Tab</span>
              </a>

              {/* Secondary: Download PDF */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3.5 px-4 bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-stone-600" />
                    <span>Download PDF ({formatFileSize(book.file_size)})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-stone-500 pt-1">
                Verified high-speed download · Unabridged PDF
              </p>
            </div>
          </div>

          {/* Right Column: Title, Author, Specs, Synopsis */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category & Metadata (Zero-Pill Discipline) */}
              <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                {book.category_name && (
                  <button
                    onClick={() => onSelectCategory(book.category_id)}
                    className="font-bold uppercase tracking-wider text-amber-900 hover:text-amber-950 transition-colors"
                  >
                    {book.category_name}
                  </button>
                )}
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="font-mono text-stone-600">
                  {book.page_count ? `${book.page_count} Pages` : 'Complete Edition'}
                </span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="font-mono text-stone-600">
                  {formatFileSize(book.file_size)}
                </span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-emerald-700 font-semibold">Free Public Edition</span>
              </div>

              {/* Book Title & Author */}
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-[1.15]">
                  {book.title}
                </h1>
                <p className="font-serif text-lg sm:text-xl italic text-stone-700 mt-2">
                  By {book.author || 'Unknown Author'}
                </p>
              </div>

              {/* Bookstore Specifications Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 bg-stone-50/80 rounded-2xl border border-stone-200/90 text-xs">
                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block font-sans">Edition</span>
                  <span className="font-bold text-stone-800 mt-0.5 block">Unabridged PDF</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block font-sans">Pages</span>
                  <span className="font-mono text-stone-800 mt-0.5 block">{book.page_count || 'Full text'}</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block font-sans">File Size</span>
                  <span className="font-mono text-stone-800 mt-0.5 block">{formatFileSize(book.file_size)}</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block font-sans">Access</span>
                  <span className="font-bold text-stone-800 mt-0.5 block">100% Free</span>
                </div>
                {book.publication_year && (
                  <div className="col-span-2 pt-2 border-t border-stone-200/80">
                    <span className="text-stone-400 uppercase tracking-wider text-[10px] block font-sans">Year</span>
                    <span className="font-mono text-stone-800 mt-0.5 block">{book.publication_year}</span>
                  </div>
                )}
                {book.publisher && (
                  <div className="col-span-2 pt-2 border-t border-stone-200/80">
                    <span className="text-stone-400 uppercase tracking-wider text-[10px] block font-sans">Publisher</span>
                    <span className="text-stone-800 mt-0.5 block truncate">{book.publisher}</span>
                  </div>
                )}
              </div>

              {/* Book Synopsis */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-900" />
                  <span>About this Book</span>
                </h2>
                <div className="prose prose-stone text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
                  {book.description || 'No detailed synopsis provided for this book.'}
                </div>
              </div>

              {/* Free Access Guarantee */}
              <div className="bg-[#FAF7F0] border border-amber-900/15 rounded-2xl p-5 text-xs text-stone-700 flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block mb-0.5">
                    Open Access & Digital Preservation Guarantee
                  </span>
                  <p className="text-stone-600 text-xs leading-relaxed">
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
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-stone-200">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-900 font-bold block mb-1">
                More in Collection
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                You May Also Enjoy
              </h3>
            </div>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
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
