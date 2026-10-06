import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { db } from './db.js';

export interface ExtractedPdfInfo {
  title?: string;
  author?: string;
  pageCount: number;
  fileSize: number;
}

export async function extractPdfInfo(filePath: string): Promise<ExtractedPdfInfo> {
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;

  // For very large files (> 30MB), skip full AST load to prevent memory starvation and timeouts
  if (fileSize > 30 * 1024 * 1024) {
    return {
      pageCount: 1,
      fileSize
    };
  }

  try {
    // Read file with a safety timeout of 4 seconds
    const parsePromise = (async () => {
      const fileBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(fileBytes, { 
        ignoreEncryption: true,
        updateMetadata: false 
      });
      const pageCount = pdfDoc.getPageCount();
      const title = pdfDoc.getTitle() || undefined;
      const author = pdfDoc.getAuthor() || undefined;
      return { title, author, pageCount, fileSize };
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('PDF metadata parse timeout')), 4000)
    );

    return await Promise.race([parsePromise, timeoutPromise]);
  } catch (err) {
    console.warn('Could not extract advanced metadata from PDF, using safe defaults:', err);
    return {
      pageCount: 1,
      fileSize
    };
  }
}
