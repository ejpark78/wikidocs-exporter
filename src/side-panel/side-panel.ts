import { loadOptions, saveOptions, getJoplinToken, setJoplinToken } from '../utils/storage';
import { exportToObsidian } from '../export';
import type { ExportOptions, ExportProgress, WikiDocsBook } from '../types/wikidocs';

interface State {
  progress: ExportProgress | null;
  books: WikiDocsBook[];
}

const elements = {
  statusIndicator: document.getElementById('status-indicator') as HTMLElement,
  statusText: document.getElementById('status-text') as HTMLElement,
  progressFill: document.getElementById('progress-fill') as HTMLElement,
  chapterInfo: document.getElementById('chapter-info') as HTMLElement,
  pageInfo: document.getElementById('page-info') as HTMLElement,
  scrapeBtn: document.getElementById('scrape-btn') as HTMLButtonElement,
  stopBtn: document.getElementById('stop-btn') as HTMLButtonElement,
  collapseBtn: document.getElementById('collapse-btn') as HTMLButtonElement,
  resultSection: document.getElementById('result-section') as HTMLElement,
  resultInfo: document.getElementById('result-info') as HTMLElement,
  errorSection: document.getElementById('error-section') as HTMLElement,
  errorMessage: document.getElementById('error-message') as HTMLElement,
  includeImages: document.getElementById('include-images') as HTMLInputElement,
  addFrontmatter: document.getElementById('add-frontmatter') as HTMLInputElement,
  createIndex: document.getElementById('create-index') as HTMLInputElement,
  joplinTokenSection: document.getElementById('joplin-token-section') as HTMLElement,
  joplinToken: document.getElementById('joplin-token') as HTMLInputElement,
  saveTokenBtn: document.getElementById('save-token-btn') as HTMLButtonElement,
  scrapeDelay: document.getElementById('scrape-delay') as HTMLInputElement,
  scrapeDelayValue: document.getElementById('scrape-delay-value') as HTMLElement,
};

let state: State = { progress: null, books: [] };
let scrapeStartTime: number | null = null;
let storedScrapeDelay = 3;

async function init() {
  const options = await loadOptions();
  const targetRadio = document.querySelector<HTMLInputElement>(`input[name="target"][value="${options.target}"]`);
  if (targetRadio) targetRadio.checked = true;
  elements.includeImages.checked = options.includeImages;
  elements.addFrontmatter.checked = options.addFrontmatter;
  elements.createIndex.checked = options.createIndex;

  const storedDelay = await chrome.storage.local.get('scrape_delay');
  elements.scrapeDelay.value = storedDelay.scrape_delay || '3';
  elements.scrapeDelayValue.textContent = `${storedDelay.scrape_delay || 3}초`;

  updateJoplinTokenVisibility(options.target);
  await loadJoplinToken();

  await loadState();
  await loadCurrentPageInfo();
  setupEventListeners();
  startPolling();
}

async function loadJoplinToken() {
  const token = await getJoplinToken();
  if (token) {
    elements.joplinToken.value = token;
  }
}

function updateJoplinTokenVisibility(target: string) {
  if (target === 'joplin') {
    elements.joplinTokenSection.classList.remove('hidden');
  } else {
    elements.joplinTokenSection.classList.add('hidden');
  }
}

async function loadState() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  if (response) {
    state = {
      progress: response.progress,
      books: response.books || [],
    };
    if (state.books.length > 0) {
      elements.resultSection.classList.remove('hidden');
      elements.resultInfo.innerHTML = '';
      for (let i = 0; i < state.books.length; i++) {
        showResult(state.books[i], i);
      }
    }
    updateUI();
  }
}

async function loadCurrentPageInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.includes('wikidocs.net')) {
    elements.pageInfo.innerHTML = `
      <p class="page-title">${tab.title || '제목 없음'}</p>
      <p class="page-url">${tab.url}</p>
    `;
  }
}

function updateUI() {
  if (!state.progress) {
    elements.statusIndicator.className = 'status-indicator idle';
    elements.statusText.textContent = '대기 중';
    elements.progressFill.style.width = '0%';
    elements.chapterInfo.textContent = '';
    elements.scrapeBtn.disabled = false;
    return;
  }

  const { progress } = state;

  elements.statusIndicator.className = `status-indicator ${progress.status}`;

  const statusMap: Record<string, string> = {
    idle: '대기 중',
    scraping: '스크랩 중...',
    exporting: '내보내는 중...',
    completed: '완료!',
    error: '오류 발생',
  };
  elements.statusText.textContent = statusMap[progress.status] || progress.status;

  elements.progressFill.style.width = `${progress.progress}%`;

  if (progress.status === 'scraping' || progress.status === 'exporting') {
    const total = progress.totalChapters;
    const current = progress.currentChapter;
    const totalSeconds = total * storedScrapeDelay;
    
    const elapsed = scrapeStartTime ? Math.floor((Date.now() - scrapeStartTime) / 1000) : 0;
    
    const formatTime = (seconds: number) => {
      if (seconds >= 60) {
        return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
      }
      return `${seconds}초`;
    };
    
    elements.chapterInfo.textContent = `${progress.currentChapterTitle}\n${current}/${total} (${formatTime(elapsed)} / ${formatTime(totalSeconds)})`;
  } else if (progress.status === 'error') {
    elements.chapterInfo.textContent = progress.error || '';
    showError(progress.error || '알 수 없는 오류');
  } else {
    elements.chapterInfo.textContent = '';
  }

  elements.scrapeBtn.disabled = progress.status === 'scraping' || progress.status === 'exporting';
  
  if (progress.status === 'scraping') {
    elements.stopBtn.classList.remove('hidden');
    elements.scrapeBtn.classList.add('hidden');
  } else {
    elements.stopBtn.classList.add('hidden');
    elements.scrapeBtn.classList.remove('hidden');
  }

  if (state.books.length > 0 && progress.status === 'completed') {
    const newBookIndex = state.books.length - 1;
    const existingBook = elements.resultInfo.querySelector(`[data-book-index="${newBookIndex}"]`);
    if (!existingBook) {
      showResult(state.books[newBookIndex], newBookIndex);
    }
  }
}

function showResult(book: WikiDocsBook, bookIndex: number) {
  const bookHtml = `
    <div class="book-card" data-book-index="${bookIndex}">
      <div class="book-card-header">
        <strong>${book.title}</strong>
        <div class="book-card-buttons">
          <button class="btn btn-success btn-small book-export-btn" data-index="${bookIndex}">📤</button>
          <button class="btn btn-danger btn-small book-delete-btn" data-index="${bookIndex}">🗑️</button>
        </div>
      </div>
      <div class="book-card-info">
        챕터: ${book.totalChapters}개 | 이미지: ${book.chapters.reduce((acc, ch) => acc + ch.images.length, 0)}개
      </div>
    </div>
  `;
  elements.resultInfo.insertAdjacentHTML('beforeend', bookHtml);
  
  const exportBtn = elements.resultInfo.querySelector(`.book-export-btn[data-index="${bookIndex}"]`);
  if (exportBtn) {
    exportBtn.addEventListener('click', () => handleExportSingleBook(bookIndex));
  }
  
  const deleteBtn = elements.resultInfo.querySelector(`.book-delete-btn[data-index="${bookIndex}"]`);
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => handleDeleteBook(bookIndex));
  }
}

function handleDeleteBook(bookIndex: number) {
  state.books.splice(bookIndex, 1);
  chrome.storage.local.set({ scrapedBooks: state.books });
  
  elements.resultInfo.innerHTML = '';
  for (let i = 0; i < state.books.length; i++) {
    showResult(state.books[i], i);
  }
  
  if (state.books.length === 0) {
    elements.resultSection.classList.add('hidden');
  }
  
  updateUI();
}

async function handleExportSingleBook(bookIndex: number) {
  if (!state.books[bookIndex]) return;
  
  const options = await loadOptions();

  try {
    if (options.target === 'obsidian') {
      await exportToObsidian(state.books[bookIndex], options);
      elements.statusIndicator.className = 'status-indicator completed';
      elements.statusText.textContent = `${state.books[bookIndex].title} 내보내기 완료!`;
      elements.progressFill.style.width = '100%';
    } else {
      const token = await getJoplinToken();
      if (!token) {
        showError('Joplin API 토큰을 입력해주세요.');
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        type: 'JOPLIN_EXPORT',
        payload: { book: state.books[bookIndex], token },
      });
      
      if (response.success) {
        elements.statusIndicator.className = 'status-indicator completed';
        elements.statusText.textContent = `${state.books[bookIndex].title} Joplin 내보내기 완료!`;
        elements.progressFill.style.width = '100%';
      } else {
        showError(response.error || '내보내기 실패');
      }
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : '내보내기 실패');
  }
}

function showError(message: string) {
  elements.errorSection.classList.remove('hidden');
  elements.errorMessage.textContent = message;
}

function hideError() {
  elements.errorSection.classList.add('hidden');
}

function setupEventListeners() {
  elements.scrapeBtn.addEventListener('click', handleScrape);
  elements.stopBtn.addEventListener('click', handleStop);
  elements.saveTokenBtn.addEventListener('click', handleSaveToken);
  elements.collapseBtn.addEventListener('click', handleCollapse);

  document.querySelectorAll('input[name="target"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const target = (e.target as HTMLInputElement).value as 'obsidian' | 'joplin';
      updateJoplinTokenVisibility(target);
      saveCurrentOptions();
    });
  });

  [elements.includeImages, elements.addFrontmatter, elements.createIndex].forEach((checkbox) => {
    checkbox.addEventListener('change', saveCurrentOptions);
  });
  
  elements.scrapeDelay.addEventListener('input', async () => {
    const delay = parseInt(elements.scrapeDelay.value) || 3;
    elements.scrapeDelayValue.textContent = `${delay}초`;
    await chrome.storage.local.set({ scrape_delay: delay });
  });
}

function handleCollapse() {
  window.close();
}

async function handleSaveToken() {
  const token = elements.joplinToken.value.trim();
  console.log('[SidePanel] Save token clicked, token length:', token.length);
  if (token) {
    await setJoplinToken(token);
    console.log('[SidePanel] Token saved successfully');
    elements.saveTokenBtn.textContent = '저장됨!';
    setTimeout(() => {
      elements.saveTokenBtn.textContent = '저장';
    }, 2000);
  } else {
    console.log('[SidePanel] Token is empty');
  }
}

async function handleClear() {
  await chrome.storage.local.remove(['scrapedBook', 'currentProgress']);
  state = { progress: null, books: [] };
  scrapeStartTime = null;
  updateUI();
  hideError();
  elements.resultSection.classList.add('hidden');
}

function handleStop() {
  chrome.runtime.sendMessage({ type: 'STOP_SCRAPE' });
  elements.stopBtn.classList.add('hidden');
  elements.scrapeBtn.classList.remove('hidden');
  elements.statusIndicator.className = 'status-indicator idle';
  elements.statusText.textContent = '중단됨';
  elements.progressFill.style.width = '0%';
  scrapeStartTime = null;
  chrome.storage.local.set({
    currentProgress: {
      status: 'idle',
      currentChapter: 0,
      totalChapters: 0,
      currentChapterTitle: '',
      progress: 0,
    },
  });
}

async function saveCurrentOptions() {
  const target = document.querySelector<HTMLInputElement>('input[name="target"]:checked')?.value as 'obsidian' | 'joplin';
  const options: ExportOptions = {
    target: target || 'obsidian',
    includeImages: elements.includeImages.checked,
    addFrontmatter: elements.addFrontmatter.checked,
    createIndex: elements.createIndex.checked,
  };
  await saveOptions(options);
}

async function handleScrape() {
  hideError();
  elements.resultSection.classList.add('hidden');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showError('활성 탭을 찾을 수 없습니다.');
    return;
  }

  const options = await loadOptions();
  const storedDelay = await chrome.storage.local.get('scrape_delay');
  storedScrapeDelay = storedDelay.scrape_delay || 3;
  scrapeStartTime = Date.now();

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });

    chrome.tabs.sendMessage(tab.id, {
      type: 'START_SCRAPE',
      payload: { options },
    });
  } catch (error) {
    showError('콘텐츠 스크립트를 주입할 수 없습니다.');
    console.error(error);
  }
}

function startPolling() {
  setInterval(loadState, 500);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CLOSE_SIDEPANEL') {
    window.close();
  }
});

document.addEventListener('DOMContentLoaded', init);
