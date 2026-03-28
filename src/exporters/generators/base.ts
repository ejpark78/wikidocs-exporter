import type { WikiDocsChapter, WikiDocsBook, ExportOptions } from '../../types';

export function sanitizeFilename(title: string): string {
  return title
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createMarkdownFile(
  chapter: WikiDocsChapter,
  book: WikiDocsBook,
  options: ExportOptions
): string {
  const frontmatter = '';
  return frontmatter + chapter.content;
}
