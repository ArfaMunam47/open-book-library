import React, { useState } from 'react';
import { Book } from '../types/library';
import { 
  BookOpen, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  ExternalLink, 
  FileText, 
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { formatFileSize, downloadBookPdf } from '../lib/api';

interface OpenBook3DProps {
  book: Book;
  allBooks: Book[];
  onSelectBook: (book: Book) => void;
  onReadOnline: (bookId: string) => void;
  onOpenDetails: (bookId: string) => void;
}

export const OpenBook3D: React.FC<OpenBook3DProps> = ({
  book,
  allBooks,
  onSelectBook,
  onReadOnline,
  onOpenDetails,
}) => {
  const [pageIndex, setPageIndex] = useState<number>(0); // 0: Prologue/Summary, 1: Curator Notes/Details
  const [downloading, setDownloading] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // Find index of current book
  const currentIndex = allBooks.findIndex((b) => b.id === book.id);
  const totalBooks = allBooks.length;

  const handlePrevBook = () => {
    if (totalBooks <= 1) return;
    const prevIdx = (currentIndex - 1 + totalBooks) % totalBooks;
    onSelectBook(allBooks[prevIdx]);
    setPageIndex(0);
  };

  const handleNextBook = () => {
    if (totalBooks <= 1) return;
    const nextIdx = (currentIndex + 1) % totalBooks;
    onSelectBook(allBooks[nextIdx]);
    setPageIndex(0);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadBookPdf(book.id, book.title);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const togglePageFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setPageIndex((prev) => (prev === 0 ? 1 : 0));
      setIsFlipping(false);
    }, 200);
  };

  // Safe fallback description
  const synopsis = book.description?.trim() || 
    'An unabridged digital edition preserved in the OpenBook Public Library. This volume is made freely accessible for non-commercial study, scholarly research, and lifelong reading.';

  const firstLetter = synopsis.charAt(0);
  const restOfFirstParagraph = synopsis.slice(1);

  return (
    <div className="w-full relative py-2 sm:py-4">
      {/* Top Desk Header & Quick Switcher Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-amber-950/70 font-semibold">
            Open Reading Desk · Volume {currentIndex + 1} of {totalBooks}
          </span>
        </div>

        {/* Book Selector Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevBook}
            aria-label="Previous book in library"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-amber-900/20 bg-amber-50/60 hover:bg-amber-100/80 text-stone-700 hover:text-stone-900 text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Previous Volume</span>
          </button>
          
          <button
            onClick={handleNextBook}
            aria-label="Next book in library"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-amber-900/20 bg-amber-50/60 hover:bg-amber-100/80 text-stone-700 hover:text-stone-900 text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
          >
            <span className="hidden sm:inline font-medium">Next Volume</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The 3D Open Book Spread Container */}
      <div className="open-book-container relative max-w-5xl mx-auto">
        {/* Soft shadow on the mahogany desk underneath */}
        <div className="absolute -inset-4 bg-gradient-to-b from-amber-950/20 via-stone-950/25 to-stone-950/35 rounded-3xl blur-2xl transform scale-y-75 translate-y-12 pointer-events-none -z-10" />

        {/* The Open Book */}
        <div className="open-book-spread relative border border-amber-900/20">
          
          {/* Hardcover base rim visible below pages */}
          <div className="open-book-cover-rim" />
          
          {/* Stacked paper edges on left & right */}
          <div className="open-book-stack-left" />
          <div className="open-book-stack-right" />

          {/* Red Silk Bookmark Ribbon */}
          <div className="open-book-ribbon" title="Curator Bookmark Ribbon" />

          {/* Deep Spine Crease Gutter */}
          <div className="open-book-gutter" />

          {/* ========================================================
              LEFT PAGE
             ======================================================== */}
          <div className="open-book-page open-book-page-left p-5 sm:p-8 md:p-10 flex flex-col justify-between border-r border-amber-900/10">
            {/* Top Running Header */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-300/80 text-[10px] tracking-wider uppercase font-mono text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3 h-3 text-amber-700" />
                  <span>OpenBook Digital Library</span>
                </span>
                <span>Vol. {book.publication_year || 'Archive'}</span>
              </div>

              {pageIndex === 0 ? (
                /* Page Spread 1 - Excerpt & Opening Passage */
                <div className={`transition-opacity duration-200 ${isFlipping ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="mb-3">
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-900 block font-mono">
                      Curator Excerpt & Synopsis
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-tight mt-0.5">
                      {book.title}
                    </h3>
                  </div>

                  {/* Drop Cap Excerpt Body */}
                  <div className="text-stone-700 text-xs sm:text-[13px] leading-relaxed font-serif text-justify space-y-3">
                    <p>
                      <span className="float-left text-3xl sm:text-4xl font-bold font-serif leading-none pr-2 pt-1 text-amber-950">
                        {firstLetter}
                      </span>
                      {restOfFirstParagraph.slice(0, 320)}
                      {restOfFirstParagraph.length > 320 ? '...' : ''}
                    </p>

                    {/* Pull Quote Box */}
                    <div className="pl-3.5 py-1.5 my-2 border-l-2 border-amber-700/60 italic text-stone-800 text-[11px] sm:text-xs bg-amber-100/30 rounded-r">
                      &ldquo;Preserved verbatim in complete unabridged form for public inquiry, reading, and perpetual digital scholarship.&rdquo;
                    </div>
                  </div>
                </div>
              ) : (
                /* Page Spread 2 - Technical Dossier & Preservation */
                <div className={`transition-opacity duration-200 ${isFlipping ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-900 block font-mono mb-1">
                    Archival Specifications
                  </span>
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight mb-3">
                    Bibliographic Provenance
                  </h3>

                  <div className="space-y-2.5 text-xs text-stone-700 font-sans">
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500 font-mono text-[11px]">Primary Subject:</span>
                      <span className="font-medium text-stone-900">{book.category_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500 font-mono text-[11px]">Author / Attributed:</span>
                      <span className="font-medium text-stone-900">{book.author}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500 font-mono text-[11px]">Storage Engine:</span>
                      <span className="font-mono text-[10px] text-amber-950 font-semibold">Cloud Firestore Chunk Storage</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500 font-mono text-[11px]">File Format:</span>
                      <span className="font-mono text-[11px] text-stone-900">Unabridged High-Res PDF</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500 font-mono text-[11px]">Access Status:</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> 100% Free Public Access
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Left Page Bottom Footer */}
            <div className="pt-4 mt-4 border-t border-stone-300/80 flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span>Folio {pageIndex === 0 ? '12' : '14'}</span>
              <button
                onClick={togglePageFlip}
                className="text-amber-900 hover:text-amber-700 hover:underline flex items-center gap-1 font-sans text-xs cursor-pointer"
              >
                <span>{pageIndex === 0 ? 'View Specs' : 'View Excerpt'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>


          {/* ========================================================
              RIGHT PAGE
             ======================================================== */}
          <div className="open-book-page open-book-page-right p-5 sm:p-8 md:p-10 flex flex-col justify-between border-l border-amber-900/10">
            <div>
              {/* Top Running Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-300/80 text-[10px] tracking-wider uppercase font-mono text-stone-500">
                <span className="text-amber-900 font-semibold">{book.category_name}</span>
                <span>OpenBook Archive No. {book.id.slice(-6)}</span>
              </div>

              {/* Title & Author */}
              <div className="mb-4">
                <span className="text-[10px] font-mono tracking-wider uppercase text-amber-800 font-semibold block mb-1">
                  Selected Hardcover Edition
                </span>
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 leading-tight">
                  {book.title}
                </h2>
                <p className="font-serif text-sm sm:text-base italic text-stone-700 mt-1">
                  By {book.author}
                </p>
              </div>

              {/* Mini specs badges */}
              <div className="flex flex-wrap items-center gap-2 py-2 mb-4 text-xs font-mono text-stone-600">
                <span className="px-2 py-0.5 bg-amber-900/10 text-amber-900 rounded font-semibold text-[11px]">
                  {formatFileSize(book.file_size)}
                </span>
                {book.page_count && (
                  <span className="px-2 py-0.5 bg-stone-200/80 text-stone-800 rounded text-[11px]">
                    {book.page_count} Pages
                  </span>
                )}
                {book.publisher && (
                  <span className="px-2 py-0.5 bg-stone-200/80 text-stone-800 rounded uppercase text-[11px]">
                    {book.publisher}
                  </span>
                )}
              </div>

              {/* Action Buttons directly on the Page */}
              <div className="space-y-2 sm:space-y-2.5 pt-1">
                {/* 1. Read Online Button */}
                <button
                  onClick={() => onReadOnline(book.id)}
                  className="w-full py-2.5 sm:py-3 px-4 bg-stone-900 hover:bg-stone-800 text-amber-100 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer group"
                >
                  <BookOpen className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>Read Book Online (Instant Tab)</span>
                </button>

                {/* 2. Download Full PDF Button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-2.5 px-4 bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 border border-amber-900/20 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-900" />
                  ) : (
                    <Download className="w-4 h-4 text-amber-900" />
                  )}
                  <span>{downloading ? 'Preparing Download...' : `Download PDF (${formatFileSize(book.file_size)})`}</span>
                </button>

                {/* 3. Open Detailed Card */}
                <button
                  onClick={() => onOpenDetails(book.id)}
                  className="w-full py-2 px-4 text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full Book Details & Metadata</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Page Bottom Footer */}
            <div className="pt-4 mt-4 border-t border-stone-300/80 flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Clean Copy</span>
              </span>
              <span>Folio {pageIndex === 0 ? '13' : '15'}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
