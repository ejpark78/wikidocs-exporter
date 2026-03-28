import type { ExportOptions, ExportProgress, WikiDocsBook, Message } from '../types/wikidocs';
import { exportToJoplin } from '../export/joplin';

const JOPLIN_API_URL = 'http://localhost:41184';
let isExportingJoplin = false;
let shouldStopScraping = false;

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  
  if (message.type === 'SCRAPE_PROGRESS') {
    chrome.storage.local.set({ currentProgress: message.payload as ExportProgress });
    return true;
  }

  if (message.type === 'SCRAPE_COMPLETE') {
    const newBook = message.payload as WikiDocsBook;
    
    chrome.storage.local.get(['scrapedBooks']).then((result) => {
      if (!Array.isArray(result.scrapedBooks)) {
        result.scrapedBooks = [];
      }
      const books: WikiDocsBook[] = result.scrapedBooks;
      
      const existingIndex = books.findIndex(b => b.title === newBook.title);
      if (existingIndex >= 0) {
        books[existingIndex] = newBook;
      } else {
        books.push(newBook);
      }
      
      return chrome.storage.local.set({ scrapedBooks: books });
    }).then(() => {
      return chrome.storage.local.set({
        currentProgress: {
          status: 'completed',
          currentChapter: newBook.chapters.length,
          totalChapters: newBook.chapters.length,
          currentChapterTitle: '스크랩 완료!',
          progress: 100,
        } as ExportProgress,
      });
    });
    return true;
  }

  if (message.type === 'SCRAPE_ERROR') {
    chrome.storage.local.set({
      currentProgress: {
        status: 'error',
        currentChapter: 0,
        totalChapters: 0,
        currentChapterTitle: '',
        progress: 0,
        error: (message.payload as { error: string }).error,
      },
    });
    return true;
  }

  if (message.type === 'GET_STATE') {
    chrome.storage.local.get(['currentProgress', 'scrapedBooks']).then((result) => {
      if (!Array.isArray(result.scrapedBooks)) {
        result.scrapedBooks = [];
      }
      sendResponse({
        progress: result.currentProgress || null,
        books: result.scrapedBooks,
      });
    });
    return true;
  }

  if (message.type === 'STOP_SCRAPE') {
    shouldStopScraping = true;
    
    chrome.tabs.query({ url: '*://*.wikidocs.net/*' }, (tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'STOP_SCRAPE' }).catch(() => {});
        }
      }
    });
    
    chrome.storage.local.set({
      currentProgress: {
        status: 'idle',
        currentChapter: 0,
        totalChapters: 0,
        currentChapterTitle: '중단됨',
        progress: 0,
      },
    });
    
    return true;
  }

  if (message.type === 'JOPLIN_GET_TOKEN') {
    console.log('[Background] JOPLIN_GET_TOKEN requested');
    getJoplinTokenWithApproval()
      .then((token) => {
        console.log('[Background] JOPLIN_GET_TOKEN success');
        sendResponse({ success: true, token });
      })
      .catch((error) => {
        console.error('[Background] JOPLIN_GET_TOKEN failed:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (message.type === 'JOPLIN_EXPORT') {
    if (isExportingJoplin) {
      console.log('[Background] JOPLIN_EXPORT blocked - already in progress');
      sendResponse({ success: false, error: '이미 내보내기 중입니다.' });
      return true;
    }
    
    isExportingJoplin = true;
    const { book, token } = message.payload as { book: WikiDocsBook; token: string };
    const exportOptions: ExportOptions = { 
      target: 'joplin', 
      includeImages: false, 
      addFrontmatter: true, 
      createIndex: true 
    };
    console.log('[Background] JOPLIN_EXPORT started for:', book.title);
    exportToJoplin(book, exportOptions, token).then(() => {
      console.log('[Background] JOPLIN_EXPORT completed');
      isExportingJoplin = false;
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('[Background] JOPLIN_EXPORT failed:', error.message);
      isExportingJoplin = false;
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  return false;
});

async function exportToJoplinViaBackground(book: WikiDocsBook, token: string): Promise<void> {
  const notebook = await createFolder(book.title, token);
  
  for (const chapter of book.chapters) {
    await createNote(chapter.title, chapter.content, notebook.id, token);
  }
  
  if (book.chapters.length > 0) {
    await createNote('INDEX', generateIndex(book), notebook.id, token);
  }
}

async function createFolder(title: string, token: string): Promise<{ id: string }> {
  const response = await fetch(`${JOPLIN_API_URL}/folders?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`노트북 생성 실패: ${errorText}`);
  }
  
  return response.json();
}

async function createNote(title: string, content: string, parentId: string, token: string): Promise<void> {
  const response = await fetch(`${JOPLIN_API_URL}/notes?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      body: content,
      parent_id: parentId,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`노트 생성 실패: ${errorText}`);
  }
}

function generateIndex(book: WikiDocsBook): string {
  const lines = [`# 📚 ${book.title}\n\n## Chapters\n`];
  for (const chapter of book.chapters) {
    lines.push(`- [[${chapter.title}]]`);
  }
  return lines.join('\n');
}

async function getJoplinTokenWithApproval(): Promise<string> {
  const authResponse = await fetch(`${JOPLIN_API_URL}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!authResponse.ok) {
    const errorText = await authResponse.text();
    throw new Error(`Joplin 인증 요청 실패: ${errorText}`);
  }
  
  const authData = await authResponse.json();
  const authToken = authData.auth_token;
  
  const maxAttempts = 60;
  const pollInterval = 1000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    
    const checkResponse = await fetch(`${JOPLIN_API_URL}/auth/check?auth_token=${authToken}`);
    const checkData = await checkResponse.json();
    
    if (checkData.status === 'accepted') {
      return checkData.token;
    } else if (checkData.status === 'rejected') {
      throw new Error('Joplin에서 접근이 거부되었습니다.');
    }
  }
  
  throw new Error('Joplin 인증 시간이 초과되었습니다. 앱에서 허용해 주세요.');
}

const openSidePanelTabs = new Set<number>();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ scrapedBooks: [] });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log('[Background] Action clicked');
  if (!tab?.id || !tab.url) return;
  
  if (!tab.url.includes('wikidocs.net')) {
    chrome.tabs.create({ url: 'https://wikidocs.net' });
    return;
  }
  
  if (openSidePanelTabs.has(tab.id)) {
    chrome.runtime.sendMessage({ type: 'CLOSE_SIDEPANEL' });
    openSidePanelTabs.delete(tab.id);
    console.log('[Background] Side panel close requested');
  } else {
    openSidePanelTabs.add(tab.id);
    console.log('[Background] Side panel opened via behavior');
  }
});

chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.url && !info.url.includes('wikidocs.net')) {
    openSidePanelTabs.delete(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  openSidePanelTabs.delete(tabId);
});
