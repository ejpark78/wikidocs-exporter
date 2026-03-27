export interface WikiDocsImage {
  url: string;
  base64: string;
  filename: string;
}

export interface WikiDocsChapter {
  index: number;
  title: string;
  url: string;
  content: string;
  images: WikiDocsImage[];
}

export interface WikiDocsBook {
  title: string;
  url: string;
  chapters: WikiDocsChapter[];
  totalChapters: number;
}

export interface ExportProgress {
  status: 'idle' | 'scraping' | 'exporting' | 'completed' | 'error';
  currentChapter: number;
  totalChapters: number;
  currentChapterTitle: string;
  progress: number;
  error?: string;
}

export type ExportTarget = 'obsidian' | 'joplin';

export interface ExportOptions {
  target: ExportTarget;
  includeImages: boolean;
  addFrontmatter: boolean;
  createIndex: boolean;
  scrapeAll?: boolean;
}

export interface Message {
  type: 'START_SCRAPE' | 'SCRAPE_PROGRESS' | 'SCRAPE_COMPLETE' | 'SCRAPE_ERROR' | 'EXPORT' | 'EXPORT_COMPLETE' | 'GET_STATE' | 'JOPLIN_EXPORT' | 'JOPLIN_GET_TOKEN' | 'STOP_SCRAPE';
  payload?: unknown;
}

export interface GetStateResponse {
  progress: ExportProgress | null;
  book?: WikiDocsBook | null;
  books?: WikiDocsBook[];
}

export interface ScrapeMessage {
  type: 'START_SCRAPE';
  payload: {
    bookUrl: string;
    options: ExportOptions;
  };
}

export interface ProgressMessage {
  type: 'SCRAPE_PROGRESS';
  payload: ExportProgress;
}

export interface CompleteMessage {
  type: 'SCRAPE_COMPLETE';
  payload: WikiDocsBook;
}

export interface ErrorMessage {
  type: 'SCRAPE_ERROR';
  payload: {
    error: string;
  };
}
