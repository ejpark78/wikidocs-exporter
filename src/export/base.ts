import type { WikiDocsBook, WikiDocsChapter, ExportOptions } from '../types/wikidocs';

export function generateFrontmatter(
  chapter: WikiDocsChapter,
  book: WikiDocsBook,
  options: ExportOptions
): string {
  if (!options.addFrontmatter) return '';

  const date = new Date().toISOString().split('T')[0];
  const tags = [book.title.replace(/\s+/g, '-'), 'wiki-docs'];

  return `---
title: ${chapter.title}
source: ${chapter.url}
date: ${date}
tags: [${tags.join(', ')}]
---

`;
}

export function sanitizeFilename(title: string): string {
  return title
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateIndexContent(book: WikiDocsBook): string {
  const lines = [
    '# INDEX',
    '',
    `**${book.title}**`,
    '',
    '## Chapters',
    '',
  ];

  for (const chapter of book.chapters) {
    const filename = sanitizeFilename(chapter.title);
    lines.push(`- [[${filename}|${chapter.title}]]`);
  }

  return lines.join('\n');
}

export function createMarkdownFile(
  chapter: WikiDocsChapter,
  book: WikiDocsBook,
  options: ExportOptions
): string {
  const frontmatter = generateFrontmatter(chapter, book, options);
  return frontmatter + chapter.content;
}
