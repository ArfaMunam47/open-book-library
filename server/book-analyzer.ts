import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { PDFDocument } from 'pdf-lib';
import { db } from './db.js';

export interface DetectedBookMetadata {
  title: string;
  author: string;
  categoryId: string;
  categoryName: string;
  suggestedCategory?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  publicationYear?: number | null;
  description?: string;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning?: string;
  pageCount: number;
  fileSize: number;
  isDuplicate?: boolean;
  duplicateReason?: string;
  isScanned?: boolean;
  descriptionError?: string;
}

/**
 * Extracts text from the first several bibliographic and substantive pages of a PDF (cover, title page, copyright, TOC, and initial chapters).
 */
async function extractBibliographicPages(filePath: string, maxPages: number = 25): Promise<{
  pagesText: string;
  pageCount: number;
  fileSize: number;
  pdfTitle?: string;
  pdfAuthor?: string;
  isScanned: boolean;
}> {
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  const buffer = fs.readFileSync(filePath);

  let pageCount = 1;
  let pdfTitle: string | undefined;
  let pdfAuthor: string | undefined;

  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true, updateMetadata: false });
    pageCount = pdfDoc.getPageCount();
    pdfTitle = pdfDoc.getTitle() || undefined;
    pdfAuthor = pdfDoc.getAuthor() || undefined;
  } catch (err) {
    console.warn('PDFDocument metadata extraction note:', err);
  }

  let pagesText = '';
  let nonBlankPages = 0;
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const uint8 = new Uint8Array(buffer);
    const standardFontPath = path.resolve(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts') + '/';
    const doc = await pdfjsLib.getDocument({
      data: uint8,
      standardFontDataUrl: standardFontPath,
      useSystemFonts: true
    }).promise;
    pageCount = doc.numPages;

    // Scan up to maxPages to collect bibliographic and content pages (TOC, preface, intro, chap 1)
    const pagesToRead = Math.min(doc.numPages, maxPages);
    for (let i = 1; i <= pagesToRead; i++) {
      try {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const str = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (str.length > 0) {
          nonBlankPages++;
          pagesText += `\n--- PAGE ${i} ---\n${str}\n`;
        }
      } catch (pageErr) {
        console.warn(`Could not parse text on page ${i}:`, pageErr);
      }
    }
  } catch (err) {
    console.warn('pdfjs-dist text extraction note:', err);
  }

  // Detect if PDF has no extractable text (e.g. image-only or scanned PDF)
  const isScanned = pageCount > 0 && pagesText.trim().length < 40;

  return {
    pagesText,
    pageCount,
    fileSize,
    pdfTitle,
    pdfAuthor,
    isScanned
  };
}

/**
 * Normalizes title candidates from filename
 */
function cleanFilenameTitle(filename: string): string {
  const base = path.basename(filename).replace(/\.pdf$/i, '');
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Regex & heuristic fallback when AI model is unavailable or encounters high-demand spikes.
 */
function heuristicExtraction(
  pagesText: string,
  filename: string,
  pdfTitle?: string,
  pdfAuthor?: string,
  categories: any[] = []
): {
  title: string;
  author: string;
  categoryId: string;
  categoryName: string;
  isbn: string | null;
  publisher: string | null;
  publicationYear: number | null;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string;
} {
  const cleanFname = cleanFilenameTitle(filename);
  let title = pdfTitle && pdfTitle.trim().length > 2 ? pdfTitle.trim() : cleanFname;
  let author = pdfAuthor && pdfAuthor.trim().length > 2 ? pdfAuthor.trim() : 'Unknown Author';
  let confidence: 'High' | 'Medium' | 'Low' = 'Low';
  let reasoning = 'Derived from PDF document structure and filename.';

  // 1. Author heuristics
  if (author === 'Unknown Author') {
    const byMatch = pagesText.match(/\b(?:by|written by|author:?)\s+([A-Z][a-zA-Z\.\s]{2,40})/i);
    if (byMatch && byMatch[1]) {
      author = byMatch[1].trim();
      confidence = 'Medium';
      reasoning = 'Extracted from author attribution ("by ...") on introductory page.';
    }
  } else {
    confidence = 'Medium';
  }

  // 2. ISBN heuristic
  let isbn: string | null = null;
  const isbnMatch = pagesText.match(/(?:ISBN(?:-1[03])?:?\s*)([0-9Xx-]{10,17})/i);
  if (isbnMatch && isbnMatch[1]) {
    isbn = isbnMatch[1].trim();
  }

  // 3. Publisher heuristic
  let publisher: string | null = null;
  const publisherMatch = pagesText.match(/(?:Published by|Publisher:?)\s+([A-Z][a-zA-Z\s&]{2,40})/i);
  if (publisherMatch && publisherMatch[1]) {
    publisher = publisherMatch[1].trim();
  } else {
    const knownPublishers = [
      'Penguin', 'HarperCollins', 'Random House', 'Simon & Schuster', 
      'Hachette', 'Macmillan', 'Oxford', 'Cambridge', 'Grand Central', 
      'O\'Reilly', 'Wiley', 'Bloomsbury', 'Vintage', 'Routledge'
    ];
    for (const pub of knownPublishers) {
      if (new RegExp(`\\b${pub}\\b`, 'i').test(pagesText)) {
        publisher = pub;
        break;
      }
    }
  }

  // 4. Year heuristic
  let publicationYear: number | null = null;
  const yearMatch = pagesText.match(/(?:©|copyright|\b(?:first published|published in)\b).*?\b(19\d\d|20\d\d)\b/i);
  if (yearMatch && yearMatch[1]) {
    publicationYear = parseInt(yearMatch[1], 10);
  }

  // 5. Category matching against existing categories
  let selectedCategory = categories[0];
  let highestScore = 0;
  const combinedText = `${title} ${author} ${pagesText.substring(0, 1500)}`.toLowerCase();

  for (const cat of categories) {
    let score = 0;
    const catName = cat.name.toLowerCase();
    const keywords = catName.split(/[\s&,-]+/);
    for (const kw of keywords) {
      if (kw.length > 3 && combinedText.includes(kw)) {
        score += 3;
      }
    }
    if (combinedText.includes(catName)) {
      score += 6;
    }
    if (score > highestScore) {
      highestScore = score;
      selectedCategory = cat;
    }
  }

  return {
    title,
    author,
    categoryId: selectedCategory?.id || 'cat-1',
    categoryName: selectedCategory?.name || 'General',
    isbn,
    publisher,
    publicationYear,
    confidence,
    reasoning
  };
}

/**
 * Executes a Gemini request with model fallback cascade and retry for transient errors.
 * Prioritizes high-availability production models ('gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite').
 */
async function executeGeminiWithRetry<T>(
  action: (ai: GoogleGenAI, model: string) => Promise<T>,
  models: string[] = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'],
  timeoutMs: number = 25000
): Promise<T | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  const ai = new GoogleGenAI();

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const actionPromise = action(ai, model);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms with ${model}`)), timeoutMs)
        );

        const result = await Promise.race([actionPromise, timeoutPromise]);
        if (result) return result;
      } catch (err: any) {
        const errMsg = String(err?.message || err || '');
        const status = err?.status || (errMsg.includes('503') ? 503 : (errMsg.includes('429') ? 429 : null));
        const isTransient = status === 503 || status === 429 || errMsg.includes('Timeout') || errMsg.includes('overloaded') || errMsg.includes('high demand');

        if (isTransient && attempt === 1) {
          await new Promise(r => setTimeout(r, 600));
          continue;
        }

        // On error or model unreachability, proceed to next model in the cascade
        break;
      }
    }
  }

  return null;
}

/**
 * Primary analysis entrypoint: extracts pages, queries Gemini with automatic model failover,
 * and falls back to deterministic heuristic extraction if AI model is unavailable.
 */
export async function analyzeBook(
  filePath: string,
  originalFilename: string = ''
): Promise<DetectedBookMetadata> {
  const { pagesText, pageCount, fileSize, pdfTitle, pdfAuthor, isScanned } = await extractBibliographicPages(filePath, 25);
  const categories = db.getCategories();

  let detected: {
    title: string;
    author: string;
    categoryId: string;
    categoryName: string;
    suggestedCategory?: string | null;
    isbn?: string | null;
    publisher?: string | null;
    publicationYear?: number | null;
    description?: string;
    confidence: 'High' | 'Medium' | 'Low';
    reasoning?: string;
    descriptionError?: string;
  } | null = null;

  let descriptionFailureReason: string | undefined;

  // Check if PDF has no extractable text (e.g. image-only or scanned PDF)
  if (isScanned) {
    descriptionFailureReason = 'This PDF contains scanned images without extractable digital text. Please enter a description manually.';
  } else if (!process.env.GEMINI_API_KEY) {
    descriptionFailureReason = 'Gemini AI API key is not configured in environment variables.';
  }

  // Attempt AI detection if API key is configured and readable text exists
  if (process.env.GEMINI_API_KEY && pagesText.trim().length > 20) {
    const categoryListStr = categories
      .map(c => `- ${c.id}: ${c.name} (${c.description || ''})`)
      .join('\n');

    const prompt = `You are a professional cataloging librarian and bibliographer.
Analyze the following extracted bibliographic text from the first pages of a book (cover, title page, copyright, table of contents, introduction).

Detect:
1. "title": Exact book title (and subtitle if prominent).
2. "author": Full name of author(s). IMPORTANT: If multiple authors are listed, preserve ALL authors comma-separated. Do not invent an author or guess without evidence.
3. "categoryId": Select the single BEST matching category ID from the existing library categories below.
4. "categoryName": The name corresponding to the chosen categoryId.
5. "suggestedCategory": If none of the existing categories fit well, specify a clean category name, otherwise null.
6. "isbn": 10-digit or 13-digit ISBN if found on the copyright page, otherwise null.
7. "publisher": Publisher name if stated, otherwise null.
8. "publicationYear": 4-digit publication or copyright year if found, otherwise null.
9. "description": A concise, 50 to 90 word library-style synopsis explaining what the book is about, its central theme, and what readers will learn or gain from it. Use an objective, informative, professional library tone. Do NOT use promotional hype or superlatives ("amazing book", "must-read", "masterpiece"). Do NOT include chapter breakdowns or spoilers.
10. "confidence": "High" if clearly found on title/copyright page, "Medium" if inferred, "Low" if uncertain.
11. "reasoning": A brief 1-sentence note indicating where author and title were verified (e.g. "Found on title and copyright page").

EXISTING LIBRARY CATEGORIES:
${categoryListStr}

BOOK EXTRACT:
${pagesText.substring(0, 6000)}

Return strictly JSON matching this structure:
{
  "title": "string",
  "author": "string",
  "categoryId": "string",
  "categoryName": "string",
  "suggestedCategory": null,
  "isbn": null,
  "publisher": null,
  "publicationYear": null,
  "description": "string",
  "confidence": "High" | "Medium" | "Low",
  "reasoning": "string"
}`;

    const parsedResult = await executeGeminiWithRetry(async (ai, model) => {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });
      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.title && parsed.author) {
          return { parsed, model };
        }
      }
      return null;
    });

    if (parsedResult) {
      const { parsed, model } = parsedResult;
      const matchedCat = categories.find(c => c.id === parsed.categoryId) || categories[0];
      detected = {
        title: String(parsed.title).trim(),
        author: String(parsed.author).trim(),
        categoryId: matchedCat ? matchedCat.id : categories[0].id,
        categoryName: matchedCat ? matchedCat.name : categories[0].name,
        suggestedCategory: parsed.suggestedCategory || null,
        isbn: parsed.isbn ? String(parsed.isbn).trim() : null,
        publisher: parsed.publisher ? String(parsed.publisher).trim() : null,
        publicationYear: parsed.publicationYear ? Number(parsed.publicationYear) : null,
        description: parsed.description ? String(parsed.description).trim() : undefined,
        confidence: (['High', 'Medium', 'Low'].includes(parsed.confidence) ? parsed.confidence : 'Medium') as any,
        reasoning: parsed.reasoning || `Detected using ${model}`
      };
    }
  }

  // Fallback to local heuristic extraction if AI model was not used or failed
  if (!detected) {
    const fallback = heuristicExtraction(pagesText, originalFilename, pdfTitle, pdfAuthor, categories);
    detected = fallback;
  }

  // If description was not generated in the metadata step, attempt targeted description generation from the book's extracted pages
  if (!detected.description && pagesText.trim().length > 30 && process.env.GEMINI_API_KEY) {
    try {
      const generated = await generateBookDescription({
        pdfPath: filePath,
        title: detected.title,
        author: detected.author,
        categoryName: detected.categoryName
      });
      if (generated && generated.trim().length > 20) {
        detected.description = generated.trim();
        descriptionFailureReason = undefined;
      }
    } catch (e: any) {
      console.warn('Second-pass description generation error:', e);
      descriptionFailureReason = 'The AI service could not complete the synopsis request. Please try the "Generate Description" button.';
    }
  }

  // Duplicate book verification
  const duplicateCheck = db.checkDuplicate(detected.title, detected.author, detected.isbn || undefined);

  return {
    ...detected,
    pageCount,
    fileSize,
    isDuplicate: duplicateCheck.isDuplicate,
    duplicateReason: duplicateCheck.reason,
    isScanned,
    descriptionError: !detected.description ? descriptionFailureReason : undefined
  };
}

/**
 * Dedicated on-demand book description generator (can run when admin clicks "Generate Description" or "Regenerate").
 */
export async function generateBookDescription(params: {
  pdfPath?: string;
  title?: string;
  author?: string;
  categoryName?: string;
}): Promise<string> {
  const { pdfPath, title, author, categoryName } = params;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Description generation is not configured. Missing GEMINI_API_KEY in environment variables.');
  }

  let bookContext = '';
  let isScanned = false;
  if (pdfPath && fs.existsSync(pdfPath)) {
    const { pagesText, isScanned: scannedFlag } = await extractBibliographicPages(pdfPath, 25);
    bookContext = pagesText.substring(0, 7000);
    isScanned = scannedFlag;
  }

  if (pdfPath && isScanned && (!title || title === 'Unknown Title')) {
    throw new Error('This PDF appears to be a scanned document without extractable text.');
  }

  const prompt = `You are a professional cataloging librarian.
Write a concise, professional library book synopsis (between 50 and 90 words) for the following book.

Title: ${title || 'Unknown Title'}
Author: ${author || 'Unknown Author'}
Category: ${categoryName || 'General'}

${bookContext ? `TEXT EXCERPTS FROM BOOK:\n${bookContext}` : ''}

Guidelines:
1. Explain what the book is about, its primary subject/themes, and what readers will learn or gain from it.
2. Maintain a neutral, informative, objective library tone.
3. Do NOT use promotional hype or superlatives (e.g., do NOT say "this amazing book", "must-read", "masterpiece").
4. Do NOT include chapter-by-chapter breakdowns or spoilers.
5. Target approximately 50 to 90 words.`;

  const generated = await executeGeminiWithRetry(async (ai, model) => {
    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.2 }
    });
    if (res.text && res.text.trim().length > 20) {
      return res.text.trim();
    }
    return null;
  });

  if (generated) {
    return generated;
  }

  throw new Error('The AI service is temporarily experiencing high demand. Please try clicking "Generate Description" again.');
}
