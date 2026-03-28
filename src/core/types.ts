import type { WikiDocsBook, WikiDocsChapter, WikiDocsImage } from '../types';

export interface ChapterInfo {
  title: string;
  url: string;
  index: number;
}

export interface ScrapedChapter {
  index: number;
  title: string;
  url: string;
  content: string;
  images: WikiDocsImage[];
}

export interface ScrapedBook {
  title: string;
  url: string;
  chapters: ScrapedChapter[];
  totalChapters: number;
}

export interface ScrapingOptions {
  scrapeAll: boolean;
  delaySeconds: number;
  includeImages: boolean;
}

export interface PageParseResult {
  title: string | null;
  content: string | null;
  images: WikiDocsImage[];
}

export interface TocItem {
  title: string;
  url: string;
  index: number;
}

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  titleSelectors: string[];
  contentSelectors: string[];
  tocSelectors: string[];
}

export interface ScraperResult {
  book: ScrapedBook;
  progress: {
    current: number;
    total: number;
    currentTitle: string;
  };
}
