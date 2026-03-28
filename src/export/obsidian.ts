import type { WikiDocsBook, ExportOptions } from '../types/wikidocs';
import { sanitizeFilename } from './base';
import { getObsidianApiKey, getObsidianUseHttps } from '../utils/storage';
import { replaceImagePaths } from '../utils/image-utils';
import { generateFrontmatter } from './generators/frontmatter';
import { generateIndex } from './generators/index';

const OBSIDIAN_API_URL_HTTP = 'http://127.0.0.1:27123';
const OBSIDIAN_API_URL_HTTPS = 'https://127.0.0.1:27124';

export async function exportToObsidian(
  book: WikiDocsBook,
  options: ExportOptions
): Promise<void> {
  const apiKey = await getObsidianApiKey();
  
  if (!apiKey) {
    throw new Error('Obsidian API 키가 설정되지 않았습니다.\n\nObsidian → Settings → Local REST API → API Key\n(Settings에서 "Enable Non-encrypted (HTTP) Server" 활성화)');
  }
  
  const useHttps = await getObsidianUseHttps();
  const baseUrl = useHttps ? OBSIDIAN_API_URL_HTTPS : OBSIDIAN_API_URL_HTTP;
  const folderName = sanitizeFilename(book.title);
  const folderPath = `/WikiDocs/${folderName}`;

  console.log('[Obsidian] Starting export to:', baseUrl);

  for (const chapter of book.chapters) {
    const filename = `${sanitizeFilename(chapter.title)}.md`;
    const filePath = `${folderPath}/${filename}`;
    let content = replaceImagePaths(chapter);

    if (options.addFrontmatter) {
      content = generateFrontmatter(chapter, book) + content;
    }

    await createFile(baseUrl, filePath, content, 'text/markdown', apiKey);
  }

  if (options.createIndex) {
    const indexContent = generateIndex(book, 'obsidian');
    await createFile(baseUrl, `${folderPath}/INDEX.md`, indexContent, 'text/markdown', apiKey);
  }

  alert(`Obsidian에 "${book.title}"을(를) 저장했습니다!\n\nVault: WikiDocs\n폴더: ${folderName}`);
}

async function createFile(baseUrl: string, path: string, content: string, mimeType: string, apiKey: string): Promise<void> {
  const url = `${baseUrl}/vault${path}`;
  console.log('[Obsidian] Creating file:', url);
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Authorization': `Bearer ${apiKey}`
      },
      body: content,
    });

    console.log('[Obsidian] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Obsidian] Error response:', errorText);
      throw new Error(`파일 생성 실패: ${path} - ${response.status} ${response.statusText}\n${errorText}`);
    }
  } catch (error) {
    console.error('[Obsidian] Fetch error:', error);
    throw error;
  }
}
