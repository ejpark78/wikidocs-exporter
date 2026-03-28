import type { ExportOptions, ExportProgress, WikiDocsBook } from '../types/wikidocs';

const STORAGE_KEY = 'wikidocs_exporter_options';

export const StorageKeys = {
  OBSIDIAN_API_KEY: 'obsidian_api_key',
  OBSIDIAN_USE_HTTPS: 'obsidian_use_https',
  JOPLIN_TOKEN: 'joplin_token',
} as const;

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
  chrome.storage.local.get(['scrapedBooks']).then((result) => {
    const books: WikiDocsBook[] = Array.isArray(result.scrapedBooks) ? result.scrapedBooks : [];
    
    const existingIndex = books.findIndex(b => b.title === book.title);
    if (existingIndex >= 0) {
      books[existingIndex] = book;
    } else {
      books.push(book);
    }
    
    return chrome.storage.local.set({ scrapedBooks: books });
  }).then(() => {
    chrome.runtime.sendMessage({
      type: 'SCRAPE_COMPLETE',
      payload: book,
    }).catch(() => {});
  }).catch(() => {});
}

export function sendError(error: string): void {
  chrome.runtime.sendMessage({
    type: 'SCRAPE_ERROR',
    payload: { error },
  });
}

export async function getObsidianApiKey(): Promise<string | null> {
  const stored = await chrome.storage.local.get(StorageKeys.OBSIDIAN_API_KEY);
  return stored[StorageKeys.OBSIDIAN_API_KEY] || null;
}

export async function setObsidianApiKey(apiKey: string): Promise<void> {
  await chrome.storage.local.set({ [StorageKeys.OBSIDIAN_API_KEY]: apiKey });
}

export async function getObsidianUseHttps(): Promise<boolean> {
  const stored = await chrome.storage.local.get(StorageKeys.OBSIDIAN_USE_HTTPS);
  return stored[StorageKeys.OBSIDIAN_USE_HTTPS] === true;
}

export async function setObsidianUseHttps(useHttps: boolean): Promise<void> {
  await chrome.storage.local.set({ [StorageKeys.OBSIDIAN_USE_HTTPS]: useHttps });
}

export async function getJoplinToken(): Promise<string | null> {
  const stored = await chrome.storage.local.get(StorageKeys.JOPLIN_TOKEN);
  return stored[StorageKeys.JOPLIN_TOKEN] || null;
}

export async function setJoplinToken(token: string): Promise<void> {
  await chrome.storage.local.set({ [StorageKeys.JOPLIN_TOKEN]: token });
}
