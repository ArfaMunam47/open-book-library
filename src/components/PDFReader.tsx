import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Book } from '../types/library';
import { downloadBookPdf, fetchPdfArrayBuffer } from '../lib/api';

// Set up Mozilla PDF.js web worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

interface PDFReaderProps {
  book: Book;
  onClose: () => void;
}

export const PDFReader: React.FC<PDFReaderProps> = ({ book, onClose }) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(book.page_count || 1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRenderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Load PDF manuscript as ArrayBuffer
  const loadPdfDocument = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadProgress(10);

      const arrayBuffer = await fetchPdfArrayBuffer(book.id, (percent) => {
        setLoadProgress(percent);
      });

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setPageInput('1');
    } catch (err: any) {
      console.error('Error loading PDF document:', err);
      setError(err.message || 'Unable to load PDF document into reader.');
    } finally {
      setIsLoading(false);
    }
  }, [book.id]);

  useEffect(() => {
    loadPdfDocument();
    return () => {
      if (currentRenderTaskRef.current) {
        currentRenderTaskRef.current.cancel();
      }
    };
  }, [loadPdfDocument]);

  // Render current page onto HTML5 Canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !viewportRef.current) return;

    try {
      setIsRendering(true);

      // Cancel previous ongoing render task if page switched quickly
      if (currentRenderTaskRef.current) {
        currentRenderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Base unscaled viewport
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      // Determine viewport scale to fit reading area
      const viewportWidth = viewportRef.current.clientWidth || 800;
      const horizontalPadding = Math.min(viewportWidth * 0.05, 48);
      const targetWidth = Math.max(viewportWidth - horizontalPadding, 320);
      const baseScale = targetWidth / unscaledViewport.width;
      const effectiveScale = baseScale * (zoom / 100);

      const viewport = page.getViewport({ scale: effectiveScale });

      // High DPI retina displays scaling
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);

      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      currentRenderTaskRef.current = renderTask;

      await renderTask.promise;
      currentRenderTaskRef.current = null;
      ctx.restore();
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Page rendering error:', err);
      }
    } finally {
      setIsRendering(false);
    }
  }, [pdfDoc, currentPage, zoom]);

  useEffect(() => {
    if (pdfDoc) {
      renderCurrentPage();
    }
  }, [pdfDoc, currentPage, zoom, renderCurrentPage]);

  // Keep page input synced
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 240));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoom(100);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Safe download trigger
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadBookPdf(book.id, book.title);
    } catch (err: any) {
      alert('Could not download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in page input
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, onClose]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 bg-[#1e1e1e] text-stone-100 flex flex-col h-screen w-screen overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <header className="h-14 bg-[#141414] border-b border-stone-800 px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0">
        
        {/* Left: Exit & Book Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Exit Reader"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Reader</span>
          </button>
          
          <div className="h-4 w-px bg-stone-800 hidden sm:block" />

          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-serif font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h2>
            <p className="text-[10px] text-stone-400 truncate hidden md:block">
              {book.author} · {book.category_name}
            </p>
          </div>
        </div>

        {/* Center: Page Jump Navigation */}
        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1 rounded hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent text-stone-300 cursor-pointer"
            title="Previous Page (Left Arrow)"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <span className="text-[11px] text-stone-400 hidden sm:inline">Page</span>
            <input
              type="text"
              value={pageInput}
              disabled={isLoading}
              onChange={e => setPageInput(e.target.value)}
              onBlur={() => setPageInput(String(currentPage))}
              className="w-10 text-center font-mono text-xs font-semibold bg-stone-800 text-white border border-stone-700 rounded py-0.5 focus:outline-none focus:border-amber-400"
            />
            <span className="font-mono text-xs text-stone-400 tabular-nums">
              of {totalPages}
            </span>
          </form>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1 rounded hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent text-stone-300 cursor-pointer"
            title="Next Page (Right Arrow / Space)"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Download & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs">
            <button
              onClick={handleZoomOut}
              disabled={isLoading}
              className="p-1 hover:text-white text-stone-400 cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleResetZoom}
              disabled={isLoading}
              className="font-mono text-xs tabular-nums px-1.5 hover:text-amber-300 text-stone-300 cursor-pointer"
              title="Reset Zoom to 100%"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={isLoading}
              className="p-1 hover:text-white text-stone-400 cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white hidden sm:block cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Safe PDF Download */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Download actual PDF file"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">{isDownloading ? 'Saving...' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Reading Canvas Viewport */}
      <main 
        ref={viewportRef}
        className="flex-1 bg-[#252525] relative overflow-y-auto overflow-x-auto flex flex-col items-center justify-start p-4 sm:p-8"
      >
        {/* Loading State with Real Progress */}
        {isLoading && (
          <div className="m-auto text-center p-8 bg-stone-900/90 border border-stone-800 rounded-2xl shadow-2xl max-w-sm w-full space-y-4">
            <div className="w-12 h-12 bg-amber-900/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Opening PDF Manuscript
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Loading {book.title} ({totalPages} pages)...
              </p>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(loadProgress, 10)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 font-mono">
              {loadProgress}% loaded into browser memory
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="m-auto text-center p-8 bg-stone-900 border border-red-900/40 rounded-xl shadow-xl max-w-md w-full space-y-4 text-stone-300">
            <div className="w-12 h-12 bg-red-900/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Unable to Open PDF
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {error}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={loadPdfDocument}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Instead</span>
              </button>
            </div>
          </div>
        )}

        {/* Rendered Canvas Page */}
        <div className={`relative transition-opacity duration-200 ${isLoading || error ? 'hidden' : 'block'}`}>
          {isRendering && (
            <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur text-stone-300 px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1.5 border border-stone-800 z-10">
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
              <span>Rendering page...</span>
            </div>
          )}

          <div className="shadow-2xl rounded bg-white overflow-hidden border border-stone-800/80 ring-1 ring-black/30">
            <canvas ref={canvasRef} className="block mx-auto" />
          </div>

          {/* Bottom Page Navigation Pill */}
          <div className="mt-4 mb-2 flex items-center justify-center gap-4 text-xs text-stone-400 font-mono">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="hover:text-white disabled:opacity-30 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Page</span>
            </button>
            <span className="text-stone-500">|</span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-stone-500">|</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="hover:text-white disabled:opacity-30 cursor-pointer flex items-center gap-1"
            >
              <span>Next Page</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
