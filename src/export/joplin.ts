import type { WikiDocsBook, ExportOptions } from '../types/wikidocs';
import { sanitizeFilename } from './base';

const JOPLIN_API_URL = 'http://localhost:41184';

export async function exportToJoplin(
  book: WikiDocsBook,
  options: ExportOptions
): Promise<void> {
  const token = await getJoplinToken();
  
  if (!token) {
    throw new Error('Joplin API 토큰이 설정되지 않았습니다.\n\n설정 방법:\n1. Joplin 앱을 열기\n2. 도구 → 웹 클리퍼(Web Clipper) → 활성화\n3. 고급 설정 → API 토큰 복사\n4. 확장 프로그램에서 토큰을 입력해주세요.');
  }

  let notebook;
  try {
    notebook = await createNotebook(book.title, token);
  } catch (error) {
    throw new Error(`Joplin에 연결할 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n\nJoplin 앱이 실행 중이고 웹 클리퍼가 활성화되어 있는지 확인해주세요.`);
  }

  for (let i = 0; i < book.chapters.length; i++) {
    const chapter = book.chapters[i];
    let content = chapter.content;

    // Replace relative image paths with full URLs
    for (const image of chapter.images) {
      const relativePath = `../images/${image.filename}`;
      content = content.replace(relativePath, image.url);
    }

    const frontmatter = options.addFrontmatter
      ? generateFrontmatter(chapter, book)
      : '';

    await createNote(
      sanitizeFilename(chapter.title),
      frontmatter + content,
      notebook.id,
      token
    );
  }

  if (options.createIndex) {
    const indexContent = generateJoplinIndex(book);
    await createNote(
      'INDEX',
      indexContent,
      notebook.id,
      token
    );
  }
}

async function getJoplinToken(): Promise<string | null> {
  const stored = await chrome.storage.local.get('joplin_token');
  return stored.joplin_token || null;
}

export async function setJoplinToken(token: string): Promise<void> {
  await chrome.storage.local.set({ joplin_token: token });
}

async function checkJoplinConnection(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${JOPLIN_API_URL}/ping`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function createNotebook(title: string, token: string): Promise<{ id: string }> {
  const response = await fetch(`${JOPLIN_API_URL}/notebooks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: sanitizeFilename(title),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`노트북 생성 실패: ${response.statusText}\n${errorText}`);
  }

  return response.json();
}

async function uploadResource(
  base64: string,
  filename: string,
  token: string
): Promise<string> {
  const response = await fetch(`${JOPLIN_API_URL}/resources`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      props: {
        name: filename,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`리소스 생성 실패: ${response.statusText}\n${errorText}`);
  }

  const resource = await response.json();
  const id = resource.id;

  if (base64 && base64.includes(',')) {
    const binaryData = atob(base64.split(',')[1]);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }

    await fetch(`${JOPLIN_API_URL}/resources/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: bytes,
    });
  }

  return id;
}

async function createNote(
  title: string,
  content: string,
  parentId: string,
  token: string
): Promise<void> {
  const response = await fetch(`${JOPLIN_API_URL}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: sanitizeFilename(title),
      body: content,
      parent_id: parentId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`노트 생성 실패: ${response.statusText}\n${errorText}`);
  }
}

function generateFrontmatter(
  chapter: WikiDocsBook['chapters'][0],
  book: WikiDocsBook
): string {
  const date = new Date().toISOString().split('T')[0];
  const tags = book.title.split(/\s+/);

  return `**Source:** ${chapter.url}  
**Date:** ${date}  
**Tags:** #wiki-docs ${tags.map(t => `#${t}`).join(' ')}  

---

`;
}

function generateJoplinIndex(book: WikiDocsBook): string {
  const lines = [
    '# 📚 INDEX',
    '',
    `**${book.title}**`,
    '',
    '## 📑 Chapters',
    '',
  ];

  for (const chapter of book.chapters) {
    const title = sanitizeFilename(chapter.title);
    lines.push(`- [${chapter.title}](#${title.toLowerCase().replace(/\s+/g, '-')})`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  for (const chapter of book.chapters) {
    lines.push(`## ${chapter.title}`);
    lines.push('');
    lines.push(`> Source: ${chapter.url}`);
    lines.push('');
  }

  return lines.join('\n');
}
