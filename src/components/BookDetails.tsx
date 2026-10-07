import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Download, FileText, Calendar, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { Book } from '../types/library';
import { formatFileSize, formatDate, downloadBookPdf } from '../lib/api';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
  onReadOnline: (bookId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const BookDetails: React.FC<BookDetailsProps> = ({
  book,
  onBack,
  onReadOnline,
  onSelectCategory
}) => {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
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

  // Update document title for SEO
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${book.title} by ${book.author} — Open Book Library`;
    return () => {
      document.title = originalTitle;
    };
  }, [book]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Library</span>
      </button>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Large Book Cover */}
          <div className="md:col-span-4 lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm aspect-[3/4] bg-stone-100 rounded-lg shadow-md overflow-hidden border border-stone-200 flex items-center justify-center p-3">
              {book.cover_url && !imageError ? (
                <img
                  src={book.cover_url}
                  alt={`Cover of ${book.title}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-center rounded"
                />
              ) : (
                <div className="w-full h-full rounded p-6 flex flex-col justify-between border border-stone-700 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 text-stone-100">
                  <div className="border-b border-stone-700 pb-3">
                    <span className="text-xs uppercase tracking-widest text-amber-300 font-sans block">
                      {book.category_name || 'Open Library Edition'}
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
            </div>

            {/* Quick Action Buttons on Mobile / Left Column */}
            <div className="w-full max-w-sm mt-6 flex flex-col gap-2.5">
              <a
                href={`/api/pdf/${book.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-stone-900 hover:bg-amber-950 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Read Online in New Tab</span>
              </a>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                    <span>Downloading PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-stone-600" />
                    <span>Download PDF ({formatFileSize(book.file_size)})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Description & Details */}
          <div className="md:col-span-8 lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category Breadcrumb */}
              <div className="mb-2">
                <button
                  onClick={() => onSelectCategory(book.category_id)}
                  className="text-xs uppercase tracking-wider text-amber-900 font-medium hover:underline inline-block"
                >
                  {book.category_name || 'General'}
                </button>
              </div>

              {/* Title & Author */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight leading-tight mb-2">
                {book.title}
              </h1>

              <p className="font-serif text-base sm:text-lg italic text-stone-700 mb-6">
                By {book.author || 'Unknown Author'}
              </p>

              {/* Publication Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-stone-200 mb-6 text-xs">
                <div>
                  <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Format</span>
                  <span className="font-medium text-stone-800 mt-0.5 block">PDF Document</span>
                </div>
                <div>
                  <span className="text-stone-400 block uppercase tracking-wider text-[10px]">File Size</span>
                  <span className="font-mono text-stone-800 mt-0.5 block tabular-nums">{formatFileSize(book.file_size)}</span>
                </div>
                <div>
                  <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Length</span>
                  <span className="font-mono text-stone-800 mt-0.5 block tabular-nums">{book.page_count} pages</span>
                </div>
                <div>
                  <span className="text-stone-400 block uppercase tracking-wider text-[10px]">
                    {book.publication_year ? 'Publication Year' : 'Catalog Date'}
                  </span>
                  <span className="text-stone-800 mt-0.5 block font-mono">
                    {book.publication_year || formatDate(book.created_at)}
                  </span>
                </div>
                {book.isbn && (
                  <div className="col-span-2 sm:col-span-2 pt-2 border-t border-stone-100">
                    <span className="text-stone-400 block uppercase tracking-wider text-[10px]">ISBN</span>
                    <span className="font-mono text-stone-800 mt-0.5 block">{book.isbn}</span>
                  </div>
                )}
                {book.publisher && (
                  <div className="col-span-2 sm:col-span-2 pt-2 border-t border-stone-100">
                    <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Publisher</span>
                    <span className="font-medium text-stone-800 mt-0.5 block truncate">{book.publisher}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  About this Book
                </h2>
                <div className="prose prose-stone text-stone-700 text-sm leading-relaxed whitespace-pre-line font-sans">
                  {book.description || 'No detailed synopsis provided for this book.'}
                </div>
              </div>
            </div>

            {/* Copyright & Fair Access Banner */}
            <div className="bg-[#FAF7F0] border border-amber-900/15 rounded-lg p-4 text-xs text-stone-600 flex items-start gap-3 mt-6">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-stone-800 block mb-0.5">
                  Free and Open Access Book
                </span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  This work is hosted for free public access, educational enrichment, or under open license redistribution. You can read it directly in your web browser or download the full PDF to keep on your device.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
