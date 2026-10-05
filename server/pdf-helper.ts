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
  try {
    const fileBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || undefined;
    const author = pdfDoc.getAuthor() || undefined;
    const stats = fs.statSync(filePath);

    return {
      title,
      author,
      pageCount,
      fileSize: stats.size
    };
  } catch (err) {
    console.warn('Could not extract advanced metadata from PDF:', err);
    try {
      const stats = fs.statSync(filePath);
      return {
        pageCount: 1,
        fileSize: stats.size
      };
    } catch {
      return {
        pageCount: 1,
        fileSize: 0
      };
    }
  }
}

/**
 * Creates a real public domain sample PDF and registers it if database has 0 books.
 * This guarantees visitors immediately have a real readable & downloadable book.
 */
export async function ensureSampleBooks(): Promise<void> {
  const existingBooks = db.getBooks();
  if (existingBooks.length > 0) return;

  try {
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const pdfsDir = path.join(uploadsDir, 'pdfs');
    const coversDir = path.join(uploadsDir, 'covers');

    if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });
    if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

    // 1. Create a real sample PDF for "The Way to Wealth" by Benjamin Franklin (Money & Finance)
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // Page 1: Title page / Cover
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
    page1.drawRectangle({
      x: 30,
      y: 30,
      width: 535.28,
      height: 781.89,
      borderColor: rgb(0.3, 0.25, 0.2),
      borderWidth: 2,
    });
    page1.drawRectangle({
      x: 36,
      y: 36,
      width: 523.28,
      height: 769.89,
      borderColor: rgb(0.6, 0.55, 0.45),
      borderWidth: 0.75,
    });

    page1.drawText('OPEN BOOK LIBRARY CLASSICS', {
      x: 180,
      y: 720,
      size: 13,
      font: timesRoman,
      color: rgb(0.4, 0.35, 0.3),
    });

    page1.drawText('THE WAY TO WEALTH', {
      x: 120,
      y: 600,
      size: 30,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page1.drawText('Advice to a Young Tradesman & Maxims for Financial Prudence', {
      x: 135,
      y: 560,
      size: 13,
      font: timesItalic,
      color: rgb(0.3, 0.3, 0.3),
    });

    page1.drawText('By Benjamin Franklin (1758)', {
      x: 200,
      y: 480,
      size: 16,
      font: timesBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    page1.drawText('Category: Money & Finance', {
      x: 220,
      y: 380,
      size: 12,
      font: timesRoman,
      color: rgb(0.45, 0.4, 0.35),
    });

    page1.drawText('Public Domain · Free Access Edition', {
      x: 205,
      y: 100,
      size: 11,
      font: timesItalic,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Page 2: Chapter 1
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    page2.drawText('THE WAY TO WEALTH', {
      x: 50,
      y: 770,
      size: 18,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page2.drawText('PREFACE BY POOR RICHARD', {
      x: 50,
      y: 745,
      size: 12,
      font: timesItalic,
      color: rgb(0.35, 0.35, 0.35),
    });

    const lines = [
      'Courteous Reader,',
      '',
      'I have heard that nothing gives an author so great pleasure as to find his works respectfully',
      'quoted by other learned authors. This pleasure I have seldom enjoyed; for though I have been,',
      'if I may say it without vanity, an eminent author of almanacs annually now twenty-five years,',
      'my brother authors in the same way, for what reason I know not, have ever been very sparing',
      'in their applauses.',
      '',
      '"God helps them that help themselves," as Poor Richard says.',
      '',
      '"Dost thou love life? Then do not squander time, for that is the stuff life is made of."',
      '',
      '"Lost time is never found again; and what we call time enough always proves little enough."',
      '',
      '"Let us then be up and be doing, and doing to the purpose; so by diligence shall we do more',
      'with less perplexity."',
      '',
      '"Sloth makes all things difficult, but industry all easy; and he that riseth late must trot all day,',
      'and shall scarce overtake his business at night."',
      '',
      '"Early to bed and early to rise, makes a man healthy, wealthy, and wise."',
      '',
      '"Drive thy business, let not that drive thee; and early to bed, and early to rise, makes a man',
      'healthy, wealthy, and wise, as Poor Richard says."',
    ];

    let currentY = 700;
    for (const line of lines) {
      if (line.trim().length > 0) {
        page2.drawText(line, {
          x: 50,
          y: currentY,
          size: 11.5,
          font: line.startsWith('"') ? timesItalic : timesRoman,
          color: rgb(0.15, 0.15, 0.15),
        });
      }
      currentY -= 20;
    }

    // Page 3: Frugality and Independence
    const page3 = pdfDoc.addPage([595.28, 841.89]);
    page3.drawText('OF FRUGALITY AND INDUSTRY', {
      x: 50,
      y: 770,
      size: 18,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    const lines2 = [
      'A man may, if he knows not how to save as he gets, keep his nose all his life to the grindstone,',
      'and die not worth a groat at last. A fat kitchen makes a lean will; and,',
      '',
      '"Many estates are spent in the getting,',
      'Since women for tea forsook spinning and knitting,',
      'And men for punch forsook hewing and splitting."',
      '',
      '"If you would be wealthy, think of saving as well as of getting: The Indies have not made Spain',
      'rich, because her outgoes are greater than her incomes."',
      '',
      'Away then with your expensive follies, and you will not have so much cause to complain of hard',
      'times, heavy taxes, and chargeable families.',
      '',
      '"What maintains one vice would bring up two children."',
      '',
      '"You may think perhaps, that a little tea, or a little punch now and then, diet a little more costly,',
      'clothes a little finer, and a little entertainment now and then, can be no great matter; but',
      'remember: Many a little makes a mickle. Beware of little expenses; a small leak will sink a',
      'great ship."',
      '',
      'Creditors have better memories than debtors; creditors are a superstitious sect, great',
      'observers of set days and times.',
      '',
      'Preserve your freedom, and maintain your independence: be industrious and free; be frugal',
      'and free.',
      '',
      '-- End of Selection --',
    ];

    let currentY3 = 730;
    for (const line of lines2) {
      if (line.trim().length > 0) {
        page3.drawText(line, {
          x: 50,
          y: currentY3,
          size: 11.5,
          font: line.startsWith('"') ? timesItalic : timesRoman,
          color: rgb(0.15, 0.15, 0.15),
        });
      }
      currentY3 -= 20;
    }

    const pdfBytes = await pdfDoc.save();
    const pdfFileName = 'the-way-to-wealth.pdf';
    const pdfFilePath = path.join(pdfsDir, pdfFileName);
    fs.writeFileSync(pdfFilePath, pdfBytes);

    // Categories
    const categories = db.getCategories();
    const moneyCat = categories.find(c => c.slug === 'money-finance') || categories[0];
    const selfDevCat = categories.find(c => c.slug === 'self-development') || categories[1];

    // Create the book in DB
    db.createBook({
      title: 'The Way to Wealth',
      author: 'Benjamin Franklin',
      description: 'An essay summarizing Benjamin Franklin\'s aphorisms and practical advice on thrift, personal industry, self-discipline, and wealth accumulation, originally compiled in Poor Richard\'s Almanack.',
      category_id: moneyCat.id,
      cover_url: '', // will display elegant SVG cover generator
      cover_path: '',
      pdf_url: `/uploads/pdfs/${pdfFileName}`,
      pdf_path: pdfFilePath,
      file_size: pdfBytes.length,
      page_count: 3,
      published: true
    });

    console.log('Seeded sample public domain book: The Way to Wealth');
  } catch (err) {
    console.error('Failed to create sample book:', err);
  }
}
