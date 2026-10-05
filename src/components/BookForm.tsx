import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Book, Category } from '../types/library';
import { 
  uploadNewBook, 
  updateBookDetails, 
  extractPdfInfoClient, 
  formatFileSize 
} from '../lib/api';

interface BookFormProps {
  categories: Category[];
  initialBook?: Book;
  onSuccess: (book: Book) => void;
  onCancel: () => void;
}

export const BookForm: React.FC<BookFormProps> = ({
  categories,
  initialBook,
  onSuccess,
  onCancel
}) => {
  const isEditing = Boolean(initialBook);

  const [title, setTitle] = useState(initialBook?.title || '');
  const [author, setAuthor] = useState(initialBook?.author || '');
  const [categoryId, setCategoryId] = useState(initialBook?.category_id || (categories[0]?.id || ''));
  const [description, setDescription] = useState(initialBook?.description || '');
  const [published, setPublished] = useState(initialBook ? initialBook.published : true);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialBook?.cover_url || null);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<{ pageCount?: number; fileSize?: number } | null>(
    initialBook ? { pageCount: initialBook.page_count, fileSize: initialBook.file_size } : null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync category if categories list loaded late
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Handle PDF file selection & auto extract metadata
  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF document.');
      return;
    }

    setError(null);
    setPdfFile(file);

    // Try auto-extracting metadata
    try {
      setIsExtracting(true);
      const metadata = await extractPdfInfoClient(file);
      setExtractedInfo({
        pageCount: metadata.pageCount,
        fileSize: metadata.fileSize || file.size
      });

      // Auto-fill title or author if currently empty
      if (!title.trim() && metadata.title) {
        setTitle(metadata.title);
      }
      if (!author.trim() && metadata.author) {
        setAuthor(metadata.author);
      }
    } catch (err) {
      console.warn('Metadata auto-extraction skipped:', err);
      setExtractedInfo({
        pageCount: 1,
        fileSize: file.size
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Cover file selection & preview
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setError('Cover must be a JPG, PNG, or WebP image.');
      return;
    }

    setError(null);
    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a book title.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    if (!isEditing && !pdfFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('author', author.trim() || 'Unknown Author');
      formData.append('category_id', categoryId);
      formData.append('description', description.trim());
      formData.append('published', String(published));

      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      let resultBook: Book;
      if (isEditing && initialBook) {
        resultBook = await updateBookDetails(initialBook.id, formData);
      } else {
        resultBook = await uploadNewBook(formData);
      }

      onSuccess(resultBook);
    } catch (err: any) {
      setError(err.message || 'Failed to save book. Please check fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Books Management</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          {isEditing ? `Edit: ${initialBook?.title}` : 'Add New Book to Library'}
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          {isEditing
            ? 'Update the book title, author, category, or replace the PDF and cover files.'
            : 'Upload a PDF and configure its library catalog metadata.'}
        </p>
      </div>

      {/* Mandatory Copyright Notice per specifications */}
      <div className="mb-6 bg-amber-50/70 border border-amber-800/20 rounded-lg p-4 text-xs text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">
            Copyright & Compliance Reminder
          </span>
          <p className="text-amber-900 leading-relaxed">
            Only upload books that you own, are authorized to distribute, are in the public domain, or are distributed under a license that allows redistribution.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* PDF File Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-stone-800">
            Book PDF File {isEditing ? <span className="font-normal text-stone-400">(leave blank to keep current PDF)</span> : <span className="text-red-600">*</span>}
          </label>
          
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-5 text-center hover:border-amber-800 transition-colors bg-stone-50/50">
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf,application/pdf"
              onChange={handlePdfChange}
              className="hidden"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <div className="text-xs font-medium text-stone-800">
                {pdfFile ? (
                  <span className="text-amber-900 font-semibold">{pdfFile.name}</span>
                ) : isEditing ? (
                  <span>Click to choose a replacement PDF (Current: {initialBook?.title}.pdf)</span>
                ) : (
                  <span>Click to select PDF file from your computer</span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Accepts PDF format up to 100MB
              </p>
            </label>
          </div>

          {isExtracting && (
            <div className="flex items-center gap-2 text-xs text-amber-900 py-1 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing PDF and extracting page count...</span>
            </div>
          )}

          {extractedInfo && (
            <div className="flex items-center gap-4 text-[11px] text-stone-600 bg-stone-100 p-2.5 rounded font-mono tabular-nums">
              <span>Pages: {extractedInfo.pageCount || 1}</span>
              <span>·</span>
              <span>Size: {formatFileSize(extractedInfo.fileSize || 0)}</span>
              <span>·</span>
              <span className="text-emerald-700 font-sans flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Ready
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
            Book Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., The Way to Wealth"
            className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>

        {/* Author & Category in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="e.g., Benjamin Franklin"
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
            Book Description / Synopsis
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="A short summary of what this book is about, its key lessons, or context..."
            className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>

        {/* Cover Image Upload (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
            Book Cover Image <span className="font-normal text-stone-400">(Optional - if omitted, a clean typographic cover is generated)</span>
          </label>
          
          <div className="flex items-start gap-4">
            <div className="w-24 h-32 bg-stone-100 border border-stone-300 rounded overflow-hidden flex items-center justify-center shrink-0">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-stone-400">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-[10px] block leading-tight">No Cover</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <input
                type="file"
                id="cover-upload"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleCoverChange}
                className="hidden"
              />
              <label
                htmlFor="cover-upload"
                className="inline-block px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded cursor-pointer transition-colors"
              >
                Choose Cover Image (JPG, PNG, WebP)
              </label>
              {coverFile && (
                <p className="text-xs text-stone-600 font-mono">
                  Selected: {coverFile.name}
                </p>
              )}
              <p className="text-[11px] text-stone-400">
                Recommended aspect ratio: 3:4. If you leave this blank, the application will automatically render a typographic book cover.
              </p>
            </div>
          </div>
        </div>

        {/* Published Status Checkbox */}
        <div className="pt-4 border-t border-stone-100">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="w-4 h-4 text-amber-900 border-stone-300 rounded focus:ring-amber-900"
            />
            <span className="text-xs font-medium text-stone-800">
              Publish immediately (visible to all public visitors)
            </span>
          </label>
          <p className="text-[11px] text-stone-400 ml-6.5 mt-0.5">
            If unchecked, this book will be saved as an unpublished draft visible only in the Admin dashboard.
          </p>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="pt-6 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEditing ? 'Updating Book...' : 'Uploading Book PDF...'}</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Upload & Publish Book'}</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
