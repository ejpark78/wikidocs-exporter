import JSZip from 'jszip';
import type { WikiDocsBook, ExportOptions } from '../types/wikidocs';
import { sanitizeFilename } from './base';

let isDownloading = false;

export async function exportToMarkdown(
  book: WikiDocsBook,
  options: ExportOptions
): Promise<void> {
  if (isDownloading) {
    throw new Error('이미 내보내기 중입니다. 잠시 후 다시 시도해주세요.');
  }
  
  isDownloading = true;

  try {
    await doExport(book, options);
  } finally {
    setTimeout(() => { isDownloading = false; }, 5000);
  }
}

async function doExport(
  book: WikiDocsBook,
  options: ExportOptions
): Promise<void> {
  const zip = new JSZip();
  const folderName = sanitizeFilename(book.title);
  const folder = zip.folder(folderName);

  if (!folder) {
    throw new Error('폴더를 생성할 수 없습니다.');
  }

  if (options.includeImages) {
    const imagesFolder = folder.folder('images');
    if (imagesFolder) {
      for (const chapter of book.chapters) {
        for (const image of chapter.images) {
          const base64Data = image.base64.split(',')[1];
          imagesFolder.file(image.filename, base64Data, { base64: true });
        }
      }
    }
  }

  for (const chapter of book.chapters) {
    const filename = `${sanitizeFilename(chapter.title)}.md`;
    let content = chapter.content;
    
    if (options.addFrontmatter) {
      content = generateYamlFrontmatter(chapter, book) + content;
    }
    
    if (options.includeImages) {
      content = content.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '![$1](./images/$2)'
      );
    }
    
    folder.file(filename, content);
  }

  if (options.createIndex) {
    const indexContent = generateMarkdownIndex(book);
    folder.file('INDEX.md', indexContent);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateYamlFrontmatter(
  chapter: WikiDocsBook['chapters'][0],
  book: WikiDocsBook
): string {
  const date = new Date().toISOString().split('T')[0];
  const tags = book.title.split(/\s+/).map(t => t.replace(/[^a-zA-Z0-9가-힣]/g, ''));

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

function generateMarkdownIndex(book: WikiDocsBook): string {
  const lines = [
    `# 📚 ${book.title}`,
    '',
    '## 📑 Chapters',
    '',
  ];

  for (const chapter of book.chapters) {
    const filename = sanitizeFilename(chapter.title);
    lines.push(`- [${chapter.title}](./${filename}.md)`);
  }

  return lines.join('\n');
}
