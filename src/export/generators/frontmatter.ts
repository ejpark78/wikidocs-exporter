import type { WikiDocsBook, WikiDocsChapter, ExportOptions } from '../../types/wikidocs';

export function generateFrontmatter(
  chapter: WikiDocsChapter,
  book: WikiDocsBook,
  format: 'yaml' | 'simple' = 'yaml'
): string {
  const date = new Date().toISOString().split('T')[0];
  const tags = book.title.split(/\s+/).map(t => t.replace(/[^a-zA-Z0-9가-힣]/g, ''));

  if (format === 'simple') {
    return `**Source:** ${chapter.url}  
**Date:** ${date}  
**Tags:** #wiki-docs ${tags.map(t => `#${t}`).join(' ')}  

---

`;
  }

  return `---
title: "${chapter.title}"
source: ${chapter.url}
date: ${date}
tags:
  - wiki-docs
  - ${tags.join('\n  - ')}
---

`;
}
