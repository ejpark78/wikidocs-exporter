import type { WikiDocsBook, ExportOptions } from '../types/wikidocs';
import { sanitizeFilename } from './base';
import { getJoplinToken, setJoplinToken } from '../utils/storage';
import { replaceImagePaths } from '../utils/image-utils';
import { generateFrontmatter } from './generators/frontmatter';
import { generateIndex } from './generators/index';

const JOPLIN_API_URL = 'http://localhost:41184';

export async function exportToJoplin(
  book: WikiDocsBook,
  options: ExportOptions,
  token?: string
): Promise<void> {
  const joplinToken = token || await getJoplinToken();
  
  if (!joplinToken) {
    throw new Error('Joplin API 토큰이 설정되지 않았습니다.\n\n설정 방법:\n1. Joplin 앱을 열기\n2. 도구 → 웹 클리퍼(Web Clipper) → 활성화\n3. 고급 설정 → API 토큰 복사\n4. 확장 프로그램에서 토큰을 입력해주세요.');
  }

  let rootFolder;
  let bookFolder;
  try {
    rootFolder = await getOrCreateRootFolder(joplinToken);
    bookFolder = await createBookFolder(book.title, rootFolder.id, joplinToken);
  } catch (error) {
    throw new Error(`Joplin에 연결할 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n\nJoplin 앱이 실행 중이고 웹 클리퍼가 활성화되어 있는지 확인해주세요.`);
  }

  for (const chapter of book.chapters) {
    const content = replaceImagePaths(chapter);
    const frontmatter = options.addFrontmatter
      ? generateFrontmatter(chapter, book, 'simple')
      : '';

    await createNote(
      sanitizeFilename(chapter.title),
      frontmatter + content,
      bookFolder.id,
      joplinToken
    );
  }

  if (options.createIndex) {
    const indexContent = generateIndex(book, 'joplin');
    await createNote(
      'INDEX',
      indexContent,
      bookFolder.id,
      joplinToken
    );
  }
}

export { setJoplinToken };

async function getOrCreateRootFolder(token: string): Promise<{ id: string }> {
  const response = await fetch(`${JOPLIN_API_URL}/folders?token=${encodeURIComponent(token)}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`폴더 조회 실패: ${response.statusText}\n${errorText}`);
  }
  
  const data = await response.json();
  const rootFolder = data.items.find((f: any) => f.title === 'Wikidocs');
  
  if (rootFolder) {
    return { id: rootFolder.id };
  }
  
  const createResponse = await fetch(`${JOPLIN_API_URL}/folders?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'Wikidocs' }),
  });
  
  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`루트 폴더 생성 실패: ${createResponse.statusText}\n${errorText}`);
  }
  
  return createResponse.json();
}

async function createBookFolder(title: string, parentId: string, token: string): Promise<{ id: string }> {
  const response = await fetch(`${JOPLIN_API_URL}/folders?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: sanitizeFilename(title),
      parent_id: parentId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`폴더 생성 실패: ${response.statusText}\n${errorText}`);
  }

  return response.json();
}

async function createNote(
  title: string,
  content: string,
  parentId: string,
  token: string
): Promise<void> {
  const response = await fetch(`${JOPLIN_API_URL}/notes?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
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
