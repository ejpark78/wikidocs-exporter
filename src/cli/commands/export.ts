import type { CLIOptions } from '../options';
import { exportToObsidian } from '../../export/obsidian';
import { exportToJoplin } from '../../export/joplin';
import { exportToMarkdown } from '../../export/markdown';
import type { WikiDocsBook, ExportOptions } from '../../types';

export async function runExport(options: CLIOptions): Promise<void> {
  const target = options.target || 'markdown';
  
  console.log(`[CLI] Exporting to: ${target}`);

  const exportOptions: ExportOptions = {
    target,
    includeImages: options.includeImages ?? true,
    addFrontmatter: options.addFrontmatter ?? true,
    createIndex: options.createIndex ?? true,
  };

  // For CLI, we need a book to export
  // In real usage, this would load from a saved file or scrape first
  console.log('[CLI] Note: CLI export requires a scraped book');
  console.log('[CLI] Please use scrape command first, then export');
  
  // Placeholder for demo
  const demoBook: WikiDocsBook = {
    title: 'Demo Book',
    url: '',
    chapters: [],
    totalChapters: 0,
  };

  try {
    if (target === 'obsidian') {
      await exportToObsidian(demoBook, exportOptions);
    } else if (target === 'joplin') {
      await exportToJoplin(demoBook, exportOptions);
    } else {
      await exportToMarkdown(demoBook, exportOptions);
    }
  } catch (error) {
    console.error('[CLI] Export error:', error instanceof Error ? error.message : error);
  }
}
