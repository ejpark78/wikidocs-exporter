import type { ExportOptions, ExportProgress, WikiDocsBook } from '../types/wikidocs';

const STORAGE_KEY = 'wikidocs_exporter_options';

export interface StoredOptions {
  exportOptions: ExportOptions;
  recentBooks: Array<{ title: string; url: string; date: string }>;
}

export async function saveOptions(options: ExportOptions): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const data: StoredOptions = stored[STORAGE_KEY] || {
    exportOptions: options,
    recentBooks: [],
  };
  data.exportOptions = options;
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

export async function loadOptions(): Promise<ExportOptions> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const data: StoredOptions = stored[STORAGE_KEY];
  return data?.exportOptions || {
    target: 'obsidian',
    includeImages: true,
    addFrontmatter: true,
    createIndex: true,
  };
}

export async function saveRecentBook(book: { title: string; url: string }): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const data: StoredOptions = stored[STORAGE_KEY] || {
    exportOptions: loadOptions(),
    recentBooks: [],
  };

  const newEntry = { ...book, date: new Date().toISOString() };
  data.recentBooks = [
    newEntry,
    ...data.recentBooks.filter(b => b.url !== book.url),
  ].slice(0, 10);

  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

export function sendProgress(progress: ExportProgress): void {
  chrome.runtime.sendMessage({
    type: 'SCRAPE_PROGRESS',
    payload: progress,
  });
}

export function sendComplete(book: WikiDocsBook): void {
  chrome.runtime.sendMessage({
    type: 'SCRAPE_COMPLETE',
    payload: book,
  });
}

export function sendError(error: string): void {
  chrome.runtime.sendMessage({
    type: 'SCRAPE_ERROR',
    payload: { error },
  });
}
