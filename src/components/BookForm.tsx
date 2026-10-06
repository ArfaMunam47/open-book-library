import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Loader2,
  PlusCircle,
  Library,
  Sparkles,
  Info,
  Check,
  Edit3,
  CopyX
} from 'lucide-react';
import { Book, Category, DetectedBookMetadata } from '../types/library';
import { 
  uploadNewBook, 
  updateBookDetails, 
  formatFileSize,
  getAdminToken,
  analyzeBookPdf,
  generateBookDescriptionApi
} from '../lib/api';

interface BookFormProps {
  categories: Category[];
  initialBook?: Book;
  onSuccess: (book: Book) => void;
  onCancel: () => void;
  onBookCreated?: (book: Book) => void;
}

export const BookForm: React.FC<BookFormProps> = ({
  categories,
  initialBook,
  onSuccess,
  onCancel,
  onBookCreated
}) => {
  const isEditing = Boolean(initialBook);

  const [title, setTitle] = useState(initialBook?.title || '');
  const [author, setAuthor] = useState(initialBook?.author || '');
  const [categoryId, setCategoryId] = useState(initialBook?.category_id || (categories[0]?.id || ''));
  const [description, setDescription] = useState(initialBook?.description || '');
  const [published, setPublished] = useState(initialBook ? initialBook.published : true);

  // New bibliographic fields
  const [isbn, setIsbn] = useState(initialBook?.isbn || '');
  const [publisher, setPublisher] = useState(initialBook?.publisher || '');
  const [publicationYear, setPublicationYear] = useState(initialBook?.publication_year ? String(initialBook.publication_year) : '');
  const [confidence, setConfidence] = useState<'High' | 'Medium' | 'Low' | null>(initialBook?.metadata_confidence || null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialBook?.cover_url || null);

  // Analysis & duplicate state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedMetadata, setDetectedMetadata] = useState<DetectedBookMetadata | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  // Description automation state
  const [descriptionNotice, setDescriptionNotice] = useState<string | null>(null);
  const [isRegeneratingDesc, setIsRegeneratingDesc] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [justUploadedBook, setJustUploadedBook] = useState<Book | null>(null);

  // Sync category if categories list loaded late
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Handle PDF file selection and run automatic metadata analysis
  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.type.includes('pdf') || file.type === 'application/octet-stream';
    if (!isPdfExt && !isPdfMime) {
      setError('Please select a valid PDF document (.pdf extension).');
      return;
    }

    // Check size limit: 100MB
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`The selected file is ${formatFileSize(file.size)}. Maximum allowed size is 100MB.`);
      return;
    }

    setError(null);
    setNotice(null);
    setDescriptionNotice(null);
    setDuplicateWarning(null);
    setPdfFile(file);

    // Run automatic author, category, title, description, and bibliographic detection
    try {
      setIsAnalyzing(true);
      const metadata = await analyzeBookPdf(file);
      setDetectedMetadata(metadata);

      // Pre-fill fields automatically
      if (metadata.title) setTitle(metadata.title);
      if (metadata.author) setAuthor(metadata.author);
      if (metadata.categoryId) setCategoryId(metadata.categoryId);
      if (metadata.isbn) setIsbn(metadata.isbn);
      if (metadata.publisher) setPublisher(metadata.publisher);
      if (metadata.publicationYear) setPublicationYear(String(metadata.publicationYear));
      if (metadata.confidence) setConfidence(metadata.confidence);

      // Automatically put the generated description into the existing Description field
      if (metadata.description && metadata.description.trim()) {
        setDescription(metadata.description.trim());
        setDescriptionNotice(null);
      } else {
        setDescriptionNotice('Automatic description generation was unsuccessful. Please enter a description manually.');
      }

      // Check if duplicate detected
      if (metadata.isDuplicate) {
        setDuplicateWarning(metadata.duplicateReason || 'A book with similar title or ISBN already exists in the catalog.');
      }
    } catch (err: any) {
      console.warn('Metadata analysis warning:', err);
      setNotice('We couldn’t automatically detect all book information. Please review and fill the fields manually.');
      setDescriptionNotice('Automatic description generation was unsuccessful. Please enter a description manually.');
      
      // Fallback: auto-suggest clean title from filename if title field is currently blank
      if (!title.trim()) {
        const rawName = file.name.replace(/\.[^/.]+$/, '');
        const cleanTitle = rawName
          .replace(/[-_]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\b\w/g, l => l.toUpperCase());
        setTitle(cleanTitle);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // On-demand description generation / regeneration
  const handleRegenerateDescription = async () => {
    if (!title.trim() && !author.trim() && !pdfFile && !initialBook) {
      setError('Please provide a title, author, or select a PDF to generate a description.');
      return;
    }

    try {
      setIsRegeneratingDesc(true);
      setDescriptionNotice(null);
      const generated = await generateBookDescriptionApi({
        bookId: initialBook?.id,
        title: title.trim(),
        author: author.trim(),
        categoryId
      });

      if (generated && generated.trim()) {
        setDescription(generated.trim());
        setDescriptionNotice(null);
      } else {
        setDescriptionNotice('Automatic description generation was unsuccessful. Please enter a description manually.');
      }
    } catch (err: any) {
      console.warn('Regenerate description error:', err);
      setDescriptionNotice('Automatic description generation was unsuccessful. Please enter a description manually.');
    } finally {
      setIsRegeneratingDesc(false);
    }
  };

  // Handle Cover file selection & preview
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const isImgExt = file.name.match(/\.(jpg|jpeg|png|webp)$/i);
    if (!allowed.includes(file.type) && !isImgExt) {
      setError('Cover must be a JPG, PNG, or WebP image.');
      return;
    }

    setError(null);
    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
  };

  const handleResetForNextBook = () => {
    setTitle('');
    setAuthor('');
    setDescription('');
    setDescriptionNotice(null);
    setIsRegeneratingDesc(false);
    setIsbn('');
    setPublisher('');
    setPublicationYear('');
    setConfidence(null);
    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setDetectedMetadata(null);
    setDuplicateWarning(null);
    setAllowDuplicate(false);
    setUploadProgress(0);
    setError(null);
    setNotice(null);
    setJustUploadedBook(null);
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify admin token is present
    const token = getAdminToken();
    if (!token) {
      setError('Administrator session expired. Please sign in again.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a book title.');
      return;
    }

    if (!categoryId) {
      setError('Please select a subject category.');
      return;
    }

    if (!isEditing && !pdfFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('author', author.trim() || 'Unknown Author');
      formData.append('category_id', categoryId);
      formData.append('description', description.trim());
      formData.append('published', String(published));

      if (isbn.trim()) formData.append('isbn', isbn.trim());
      if (publisher.trim()) formData.append('publisher', publisher.trim());
      if (publicationYear.trim()) formData.append('publication_year', publicationYear.trim());
      if (confidence) formData.append('metadata_confidence', confidence);
      if (allowDuplicate) formData.append('allow_duplicate', 'true');

      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      let resultBook: Book;
      if (isEditing && initialBook) {
        resultBook = await updateBookDetails(initialBook.id, formData, (percent) => {
          setUploadProgress(percent);
        });
        onBookCreated?.(resultBook);
        onSuccess(resultBook);
      } else {
        resultBook = await uploadNewBook(formData, (percent) => {
          setUploadProgress(percent);
        });
        onBookCreated?.(resultBook);
        setJustUploadedBook(resultBook);
      }
    } catch (err: any) {
      console.error('Book submission error:', err);
      if (err.isDuplicate) {
        setDuplicateWarning(err.duplicateReason || 'A book with this title or ISBN already exists in the catalog.');
        setError('Duplicate detected. If you intend to add another edition or copy, check "Allow duplicate book" below.');
      } else {
        setError(err.message || 'Failed to upload and save book. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Immediate success card for continuous multi-book uploads
  if (justUploadedBook) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Book Uploaded Successfully!
            </h2>
            <p className="text-sm text-stone-600 mt-2 font-serif italic">
              "{justUploadedBook.title}" by {justUploadedBook.author}
            </p>
            <div className="mt-2 text-xs text-stone-400 font-mono">
              {formatFileSize(justUploadedBook.file_size)} · {justUploadedBook.page_count} pages · Status: {justUploadedBook.published ? 'Published' : 'Unpublished draft'}
            </div>
            {justUploadedBook.isbn && (
              <div className="mt-1 text-xs text-stone-500 font-mono">
                ISBN: {justUploadedBook.isbn}
              </div>
            )}
          </div>

          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 text-left space-y-1">
            <div className="font-semibold text-stone-800">Catalog Storage Confirmation:</div>
            <div>• PDF stored: <span className="font-mono text-[11px] text-stone-700">{justUploadedBook.pdf_url}</span></div>
            {justUploadedBook.cover_url && (
              <div>• Cover stored: <span className="font-mono text-[11px] text-stone-700">{justUploadedBook.cover_url}</span></div>
            )}
            <div>• Database record: <span className="font-mono text-[11px] text-stone-700">ID: {justUploadedBook.id}</span></div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleResetForNextBook}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Another Book</span>
            </button>

            <button
              onClick={() => onSuccess(justUploadedBook)}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Library className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onCancel}
        disabled={isSubmitting || isAnalyzing}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6 group disabled:opacity-50 cursor-pointer"
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
            : 'Select your PDF manuscript. Author, title, and category are automatically detected for your review.'}
        </p>
      </div>

      {/* Notice / Warning Banners */}
      {notice && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Detection Notice</span>
            <span>{notice}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Upload Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {duplicateWarning && (
        <div className="mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-xs flex items-start gap-2.5">
          <CopyX className="w-4 h-4 shrink-0 mt-0.5 text-orange-700" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Possible Duplicate Book Detected</span>
            <span>{duplicateWarning}</span>
            <label className="flex items-center gap-2 mt-2 cursor-pointer font-medium text-orange-950">
              <input
                type="checkbox"
                checked={allowDuplicate}
                onChange={e => setAllowDuplicate(e.target.checked)}
                className="w-3.5 h-3.5 text-stone-900 rounded"
              />
              <span>Allow duplicate anyway (upload as another edition/copy)</span>
            </label>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Step 1: PDF File Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-stone-800">
            Book PDF Manuscript {isEditing ? <span className="font-normal text-stone-400">(leave blank to keep current PDF)</span> : <span className="text-red-600">*</span>}
          </label>
          
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-5 text-center hover:border-amber-800 transition-colors bg-stone-50/50">
            <input
              type="file"
              id="pdf-upload"
              disabled={isSubmitting || isAnalyzing}
              accept=".pdf,application/pdf"
              onChange={handlePdfChange}
              className="hidden"
            />
            <label htmlFor="pdf-upload" className={`cursor-pointer block ${isSubmitting || isAnalyzing ? 'pointer-events-none opacity-60' : ''}`}>
              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <div className="text-xs font-medium text-stone-800">
                {pdfFile ? (
                  <span className="text-amber-900 font-semibold">{pdfFile.name}</span>
                ) : isEditing ? (
                  <span>Click to choose a replacement PDF (Current: {initialBook?.title}.pdf)</span>
                ) : (
                  <span>Click to select PDF book from your computer</span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Accepts PDF format up to 100MB. Author, title, and category will be automatically analyzed.
              </p>
            </label>
          </div>

          {/* Analyzing Progress State */}
          {isAnalyzing && (
            <div className="flex items-center gap-2.5 text-xs text-amber-900 bg-amber-50/80 border border-amber-200/60 p-3 rounded-lg animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-amber-800 shrink-0" />
              <span>Analyzing book manuscript... automatically detecting author, title, and category...</span>
            </div>
          )}

          {pdfFile && !isAnalyzing && (
            <div className="flex items-center gap-3 text-[11px] text-stone-600 bg-stone-100 p-2.5 rounded font-mono tabular-nums">
              <FileText className="w-4 h-4 text-amber-900 shrink-0" />
              <span className="truncate flex-1 font-medium">{pdfFile.name}</span>
              <span>{formatFileSize(pdfFile.size)}</span>
              <span className="text-emerald-700 font-sans font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid PDF
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Automatically Detected Information Card */}
        {detectedMetadata && (
          <div className="bg-gradient-to-br from-stone-50 to-amber-50/30 border border-amber-900/20 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Automatically Detected Bibliographic Information</span>
              </div>
              
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                detectedMetadata.confidence === 'High' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : detectedMetadata.confidence === 'Medium'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-stone-200 text-stone-700 border border-stone-300'
              }`}>
                Confidence: {detectedMetadata.confidence}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-stone-200/80">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Detected Title</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">{detectedMetadata.title}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-stone-200/80">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Detected Author(s)</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">{detectedMetadata.author}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-stone-200/80">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Matched Category</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">{detectedMetadata.categoryName}</span>
                {detectedMetadata.suggestedCategory && (
                  <span className="text-[10px] text-amber-700 mt-0.5 block">Suggested: {detectedMetadata.suggestedCategory}</span>
                )}
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-stone-200/80">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">ISBN & Publication</span>
                <span className="font-medium text-stone-800 mt-0.5 block">
                  {detectedMetadata.isbn ? `ISBN: ${detectedMetadata.isbn}` : 'No ISBN detected'}
                  {detectedMetadata.publicationYear ? ` (${detectedMetadata.publicationYear})` : ''}
                </span>
                {detectedMetadata.publisher && (
                  <span className="text-[10px] text-stone-500 block truncate">{detectedMetadata.publisher}</span>
                )}
              </div>
            </div>

            {detectedMetadata.reasoning && (
              <p className="text-[11px] text-stone-500 italic pt-1">
                Source: {detectedMetadata.reasoning}
              </p>
            )}

            <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1 border-t border-stone-200/60">
              <Edit3 className="w-3.5 h-3.5 text-stone-400" />
              <span>All fields have been filled below. You can review and edit any value prior to publishing.</span>
            </div>
          </div>
        )}

        {/* Step 3: Editable Title Field */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
            Book Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting || isAnalyzing}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Deep Work"
            className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:bg-stone-50"
          />
        </div>

        {/* Step 4: Editable Author & Category in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Author(s) <span className="font-normal text-stone-400">(Multiple authors comma-separated)</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting || isAnalyzing}
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="e.g., Cal Newport"
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:bg-stone-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              value={categoryId}
              disabled={isSubmitting || isAnalyzing}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:bg-stone-50"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 5: Optional Bibliographic Fields (ISBN, Publisher, Year) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              ISBN <span className="font-normal text-stone-400">(Optional)</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting || isAnalyzing}
              value={isbn}
              onChange={e => setIsbn(e.target.value)}
              placeholder="e.g., 9781455586691"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:bg-stone-50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Publisher <span className="font-normal text-stone-400">(Optional)</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting || isAnalyzing}
              value={publisher}
              onChange={e => setPublisher(e.target.value)}
              placeholder="e.g., Grand Central Publishing"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:bg-stone-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Publication Year <span className="font-normal text-stone-400">(Optional)</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting || isAnalyzing}
              value={publicationYear}
              onChange={e => setPublicationYear(e.target.value)}
              placeholder="e.g., 2016"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:bg-stone-50 font-mono"
            />
          </div>
        </div>

        {/* Step 6: Automatically Generated Book Description (Editable) */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-semibold text-stone-800">
                Book Description / Synopsis
              </label>
              {description.trim() && detectedMetadata?.description && (
                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-Generated
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={isSubmitting || isAnalyzing || isRegeneratingDesc}
              onClick={handleRegenerateDescription}
              className="text-[11px] font-medium text-amber-900 hover:text-amber-950 disabled:opacity-50 inline-flex items-center gap-1 transition-colors cursor-pointer"
              title="Regenerate description using AI based on book details"
            >
              {isRegeneratingDesc ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-800" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>{description.trim() ? 'Regenerate Description' : 'Generate Description'}</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={4}
            disabled={isSubmitting || isAnalyzing}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Automatic description will appear here after PDF upload, or enter manually..."
            className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:bg-stone-50 leading-relaxed"
          />

          {descriptionNotice && (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-md px-2.5 py-1.5 mt-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-amber-700" />
              <span>{descriptionNotice}</span>
            </p>
          )}

          <p className="text-[11px] text-stone-400 mt-1">
            Generated automatically from book content. You can edit this text directly before publishing.
          </p>
        </div>

        {/* Step 7: Cover Image Upload (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
            Book Cover Image <span className="font-normal text-stone-400">(Optional - if omitted, an elegant typographic cover is rendered)</span>
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
                disabled={isSubmitting || isAnalyzing}
                accept="image/png,image/jpeg,image/webp"
                onChange={handleCoverChange}
                className="hidden"
              />
              <label
                htmlFor="cover-upload"
                className={`inline-block px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded cursor-pointer transition-colors ${
                  isSubmitting || isAnalyzing ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                Choose Cover Image (JPG, PNG, WebP)
              </label>
              {coverFile && (
                <p className="text-xs text-stone-600 font-mono">
                  Selected: {coverFile.name}
                </p>
              )}
              <p className="text-[11px] text-stone-400">
                Recommended aspect ratio: 3:4. If you leave this blank, the library will display an elegant typographic book cover.
              </p>
            </div>
          </div>
        </div>

        {/* Step 8: Published Status Checkbox */}
        <div className="pt-4 border-t border-stone-100">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              disabled={isSubmitting || isAnalyzing}
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

        {/* Real-time Upload Progress Bar */}
        {isSubmitting && (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-800 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-900" />
                {uploadProgress < 100
                  ? `Uploading PDF manuscript (${uploadProgress}%)...`
                  : 'Saving book to database and organizing catalog...'}
              </span>
              <span className="font-mono text-stone-600 tabular-nums font-semibold">
                {uploadProgress}%
              </span>
            </div>
            
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-900 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.max(uploadProgress, 5)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400 text-center">
              Please wait while your book is stored securely.
            </p>
          </div>
        )}

        {/* Submit & Cancel Buttons */}
        <div className="pt-6 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isAnalyzing}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || isAnalyzing}
            className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading... ({uploadProgress}%)</span>
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
