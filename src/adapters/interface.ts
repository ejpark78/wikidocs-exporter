import type { WikiDocsBook, WikiDocsChapter } from '../types';
import type { ChapterInfo, ScrapingOptions } from '../core/types';

export interface SiteAdapter {
  readonly name: string;
  readonly baseUrl: string;
  
  isSupported(url: string): boolean;
  
  extractTitle(html: string | Document): string | null;
  extractContent(html: string | Document): string | null;
  extractImages(html: string | Document): Array<{ url: string; filename: string }>;
  
  collectChapterUrls(doc: Document): ChapterInfo[];
  
  buildChapterUrl(pageId: string | number): string;
  
  buildBookUrl(bookId: string | number): string;
  
  parseChapterFromUrl(url: string): { pageId: string } | null;
  
  getBookIdFromUrl(url: string): string | null;
}

export interface AdapterOptions {
  includeImages: boolean;
  addFrontmatter: boolean;
  createIndex: boolean;
}

export interface ScrapingResult {
  book: WikiDocsBook;
  chaptersFound: number;
  chaptersScraped: number;
}
