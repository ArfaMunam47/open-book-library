import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  ExternalLink
} from 'lucide-react';
import { Book } from '../types/library';
import { getDownloadUrl } from '../lib/api';

interface PDFReaderProps {
  book: Book;
  onClose: () => void;
}

export const PDFReader: React.FC<PDFReaderProps> = ({ book, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPages = book.page_count || 1;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.warn('Could not enter fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Build the PDF target url with page & zoom parameters for PDF viewers
  const pdfViewerUrl = `${book.pdf_url}#page=${currentPage}&zoom=${zoom}`;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 bg-stone-900 text-stone-100 flex flex-col h-screen w-screen overflow-hidden"
    >
      {/* Top Controls Bar */}
      <header className="h-14 bg-stone-950 border-b border-stone-800 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Exit Reader"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Reader</span>
          </button>
          
          <div className="h-4 w-px bg-stone-800 hidden sm:block" />

          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-medium text-white truncate max-w-xs sm:max-w-md">
              {book.title}
            </h2>
            <p className="text-[10px] text-stone-400 truncate hidden md:block">
              {book.author}
            </p>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded px-2 py-1 text-xs">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-transparent text-stone-300"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs tabular-nums px-1 text-stone-300 whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-transparent text-stone-300"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Download & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-900 border border-stone-800 rounded px-2 py-1 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-white text-stone-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleResetZoom}
              className="font-mono text-xs tabular-nums px-1 hover:text-amber-300 text-stone-300"
              title="Reset Zoom"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-white text-stone-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-stone-800 text-stone-300 hover:text-white hidden sm:block"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Direct Download */}
          <a
            href={getDownloadUrl(book.id)}
            download
            className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </a>
        </div>
      </header>

      {/* Main Reader Viewport */}
      <main className="flex-1 bg-stone-900 relative overflow-hidden flex flex-col items-center justify-center">
        <iframe
          key={`${book.id}-${currentPage}-${zoom}`}
          src={pdfViewerUrl}
          title={`PDF Reader - ${book.title}`}
          className="w-full h-full border-0 bg-stone-800"
        />

        {/* Floating fallback notice if browser restricts embedded PDFs */}
        <div className="absolute bottom-4 right-4 pointer-events-auto bg-stone-950/90 backdrop-blur border border-stone-800 rounded-lg p-2.5 shadow-lg text-[11px] text-stone-400 flex items-center gap-3">
          <span>Viewing in browser reader</span>
          <a
            href={book.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Open in new tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </main>
    </div>
  );
};
