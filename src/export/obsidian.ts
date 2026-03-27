import type { WikiDocsBook, ExportOptions } from '../types/wikidocs';
import { sanitizeFilename } from './base';

const OBSIDIAN_API_URL = 'http://127.0.0.1:27123';

async function getApiKey(): Promise<string> {
  const stored = await chrome.storage.local.get('obsidian_api_key');
  if (!stored.obsidian_api_key) {
    throw new Error('Obsidian API 키가 설정되지 않았습니다.\n\nObsidian → Settings → Local REST API → API Key에서 확인');
  }
  return stored.obsidian_api_key;
}

export async function exportToObsidian(
  book: WikiDocsBook,
  options: ExportOptions
): Promise<void> {
  console.log('[Obsidian Export] Starting export via Local REST API...');
  
  const apiKey = await getApiKey();
  const folderName = sanitizeFilename(book.title);
  const folderPath = `WikiDocs/${folderName}`;

  if (options.includeImages) {
    for (const chapter of book.chapters) {
      for (const image of chapter.images) {
        try {
          const filename = image.filename;
          const base64Data = image.base64.split(',')[1];
          const mimeType = image.base64.split(';')[0].split(':')[1];
          const imagePath = `${folderPath}/images/${filename}`;
          
          await createFile(imagePath, base64Data, mimeType, apiKey);
        } catch (error) {
          console.error(`이미지 업로드 실패: ${image.url}`, error);
        }
      }
    }
  }

  for (const chapter of book.chapters) {
    const filename = `${sanitizeFilename(chapter.title)}.md`;
    const filePath = `${folderPath}/${filename}`;
    let content = chapter.content;

    if (options.includeImages) {
      content = content.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        (match, alt, url) => {
          const imageName = url.split('/').pop() || 'image.png';
          return `![${alt}](./images/${imageName})`;
        }
      );
    }

    if (options.addFrontmatter) {
      content = generateFrontmatter(chapter, book) + content;
    }

    await createFile(filePath, content, 'text/markdown', apiKey);
  }

  if (options.createIndex) {
    const indexContent = generateIndex(book);
    await createFile(`${folderPath}/INDEX.md`, indexContent, 'text/markdown', apiKey);
  }

  console.log('[Obsidian Export] Export completed successfully!');
  alert(`Obsidian에 "${book.title}"을(를) 저장했습니다!\n\nVault: WikiDocs\n폴더: ${folderName}`);
}

async function createFile(path: string, content: string, mimeType: string, apiKey: string): Promise<void> {
  const response = await fetch(`${OBSIDIAN_API_URL}/vault/${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Authorization': `Bearer ${apiKey}`
    },
    body: content,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`파일 생성 실패: ${path} - ${errorText}`);
  }
}

function generateFrontmatter(
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

function generateIndex(book: WikiDocsBook): string {
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
