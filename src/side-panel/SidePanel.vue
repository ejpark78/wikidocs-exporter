<template>
  <div class="sidebar">
    <header class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">📚</span>
        <h1>WikiDocs Exporter</h1>
      </div>
      <button @click="handleCollapse" class="collapse-btn" title="접기">
        <span>✕</span>
      </button>
    </header>

    <main class="sidebar-content">
      <section class="section">
        <h2 class="section-title">📄 현재 페이지</h2>
        <div class="page-info">
          <template v-if="currentPage.url">
            <p class="page-title">{{ currentPage.title }}</p>
            <p class="page-url">{{ currentPage.url }}</p>
          </template>
          <template v-else>
            <p class="empty-state">위키독스 페이지를 열어주세요</p>
          </template>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">⚙️ 설정</h2>
        
        <div class="option-group">
          <label class="option-label">⚙️ 스크랩 간격</label>
          <div class="slider-group">
            <input 
              type="range" 
              v-model="scrapeDelay" 
              class="delay-slider" 
              min="0" 
              max="15"
              @change="saveScrapeDelay"
            >
            <span class="delay-value">{{ scrapeDelay }}초</span>
          </div>
        </div>

        <div class="option-group">
          <label class="option-label">내보내기 대상</label>
          <div class="radio-group">
            <label class="radio-item">
              <input type="radio" v-model="options.target" value="obsidian">
              <span class="radio-check"></span>
              <span>💎 Obsidian</span>
            </label>
            <label class="radio-item">
              <input type="radio" v-model="options.target" value="joplin">
              <span class="radio-check"></span>
              <span>📒 Joplin</span>
            </label>
          </div>
        </div>

        <div class="option-group">
          <label class="checkbox-item">
            <input type="checkbox" v-model="options.includeImages">
            <span class="checkbox-check"></span>
            <span>이미지 포함</span>
          </label>
        </div>

        <div class="option-group">
          <label class="checkbox-item">
            <input type="checkbox" v-model="options.addFrontmatter">
            <span class="checkbox-check"></span>
            <span>YAML Frontmatter 추가</span>
          </label>
        </div>

        <div class="option-group">
          <label class="checkbox-item">
            <input type="checkbox" v-model="options.createIndex">
            <span class="checkbox-check"></span>
            <span>인덱스 파일 생성</span>
          </label>
        </div>

        <div v-if="options.target === 'joplin'" class="option-group">
          <label class="option-label">Joplin 연결</label>
          
          <template v-if="!joplinToken">
            <div class="token-input-group">
              <button 
                @click="handleAutoGetToken" 
                class="btn btn-small btn-primary"
                :disabled="isGettingToken"
              >
                {{ isGettingToken ? '연결 대기 중...' : 'Joplin 연결하기' }}
              </button>
            </div>
            <small class="help-text">
              Joplin 실행 → 도구 → 웹 클리퍼 활성화 → 위 버튼 클릭
            </small>
          </template>
          
          <template v-else>
            <div class="token-status">
              <span class="token-status-icon">✅</span>
              <span>Joplin 연결됨</span>
              <button @click="handleDisconnectJoplin" class="btn btn-small btn-danger">연결 해제</button>
            </div>
          </template>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">📥 작업</h2>
        <div class="button-group">
          <button 
            v-if="progress?.status !== 'scraping' && progress?.status !== 'exporting'"
            @click="handleScrape" 
            class="btn btn-primary"
          >
            <span>🔍</span> 스크랩 시작
          </button>
          <button 
            v-if="progress?.status === 'scraping' || progress?.status === 'exporting'"
            @click="handleStop" 
            class="btn btn-warning"
          >
            <span>⏹️</span> 중단
          </button>
        </div>
        <div class="status-section">
          <div class="status-row">
            <div :class="['status-indicator', progress?.status || 'idle']"></div>
            <span class="status-text">{{ statusText }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress?.progress + '%' }"></div>
          </div>
          <div class="chapter-info">{{ chapterInfoText }}</div>
        </div>
      </section>

      <section v-if="books.length > 0" class="section">
        <h2 class="section-title">✅ 결과</h2>
        <div>
          <div 
            v-for="(book, index) in books" 
            :key="index" 
            class="book-card"
          >
            <div class="book-card-header">
              <strong>{{ book.title }}</strong>
              <div class="book-card-buttons">
                <button 
                  class="btn btn-success btn-small" 
                  @click="handleExportSingleBook(index)"
                >📤</button>
                <button 
                  class="btn btn-danger btn-small" 
                  @click="handleDeleteBook(index)"
                >🗑️</button>
              </div>
            </div>
            <div class="book-card-info">
              챕터: {{ book.totalChapters }}개 | 이미지: {{ getTotalImages(book) }}개
            </div>
          </div>
        </div>
      </section>

      <section v-if="error" class="section">
        <div class="error-card">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
        </div>
      </section>
    </main>

    <footer class="sidebar-footer">
      <small>WikiDocs → Obsidian/Joplin</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { loadOptions, saveOptions } from '../utils/storage';
import { exportToObsidian } from '../export';
import type { ExportOptions, ExportProgress, WikiDocsBook } from '../types/wikidocs';

const currentPage = ref<{ title: string; url: string }>({ title: '', url: '' });
const progress = ref<ExportProgress | null>(null);
const books = ref<WikiDocsBook[]>([]);
const error = ref<string>('');
const joplinToken = ref<string>('');
const tokenSaveText = ref<string>('저장');
const isGettingToken = ref<boolean>(false);
const scrapeDelay = ref<number>(3);
const scrapeStartTime = ref<number | null>(null);

const options = ref<ExportOptions>({
  target: 'obsidian',
  includeImages: true,
  addFrontmatter: true,
  createIndex: true,
});

let pollingInterval: ReturnType<typeof setInterval> | null = null;

const statusText = computed(() => {
  if (!progress.value) return '대기 중';
  const statusMap: Record<string, string> = {
    idle: '대기 중',
    scraping: '스크랩 중...',
    exporting: '내보내는 중...',
    completed: '완료!',
    error: '오류 발생',
  };
  return statusMap[progress.value.status] || progress.value.status;
});

const chapterInfoText = computed(() => {
  if (!progress.value) return '';
  const p = progress.value;
  
  if (p.status === 'scraping' || p.status === 'exporting') {
    const total = p.totalChapters;
    const current = p.currentChapter;
    const totalSeconds = total * scrapeDelay.value;
    
    const elapsed = scrapeStartTime.value ? Math.floor((Date.now() - scrapeStartTime.value) / 1000) : 0;
    
    const formatTime = (seconds: number) => {
      if (seconds >= 60) {
        return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
      }
      return `${seconds}초`;
    };
    
    return `${p.currentChapterTitle}\n${current}/${total} (${formatTime(elapsed)} / ${formatTime(totalSeconds)})`;
  } else if (p.status === 'error') {
    return p.error || '';
  }
  return '';
});

function getTotalImages(book: WikiDocsBook): number {
  return book.chapters.reduce((acc, ch) => acc + ch.images.length, 0);
}

async function init() {
  const opts = await loadOptions();
  options.value = { ...options.value, ...opts };

  const storedDelay = await chrome.storage.local.get('scrape_delay');
  scrapeDelay.value = storedDelay.scrape_delay || 3;

  await loadJoplinToken();
  await loadState();
  await loadCurrentPageInfo();
  
  startPolling();
}

async function loadJoplinToken() {
  const stored = await chrome.storage.local.get('joplin_token');
  if (stored.joplin_token) {
    joplinToken.value = stored.joplin_token;
  }
}

async function handleAutoGetToken() {
  isGettingToken.value = true;
  error.value = '';
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'JOPLIN_GET_TOKEN',
    });
    
    if (response.success && response.token) {
      joplinToken.value = response.token;
      await chrome.storage.local.set({ joplin_token: response.token });
    } else {
      error.value = response.error || '토큰 획득 실패';
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '토큰 획득 실패';
  } finally {
    isGettingToken.value = false;
  }
}

async function handleDisconnectJoplin() {
  joplinToken.value = '';
  await chrome.storage.local.remove('joplin_token');
}

async function loadState() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  if (response) {
    progress.value = response.progress;
    books.value = response.books || [];
    if (progress.value?.status === 'scraping' || progress.value?.status === 'exporting') {
      if (!scrapeStartTime.value) {
        scrapeStartTime.value = Date.now();
      }
    }
  }
}

async function loadCurrentPageInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.includes('wikidocs.net')) {
    currentPage.value = {
      title: tab.title || '제목 없음',
      url: tab.url,
    };
  }
}

function handleCollapse() {
  window.close();
}

async function handleSaveToken() {
  const token = joplinTokenInput.value.trim();
  if (token) {
    joplinToken.value = token;
    await chrome.storage.local.set({ joplin_token: token });
    tokenSaveText.value = '저장됨!';
    setTimeout(() => {
      tokenSaveText.value = '저장';
    }, 2000);
  }
}

async function handleDeleteBook(index: number) {
  books.value.splice(index, 1);
  await chrome.storage.local.set({ scrapedBooks: books.value });
}

async function handleExportSingleBook(index: number) {
  if (!books.value[index]) return;
  
  try {
    if (options.value.target === 'obsidian') {
      await exportToObsidian(books.value[index], options.value);
      progress.value = { ...progress.value, status: 'completed', progress: 100 } as ExportProgress;
    } else {
      const token = await getJoplinToken();
      if (!token) {
        error.value = 'Joplin API 토큰을 입력해주세요.';
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        type: 'JOPLIN_EXPORT',
        payload: { book: books.value[index], token },
      });
      
      if (response.success) {
        progress.value = { ...progress.value, status: 'completed', progress: 100 } as ExportProgress;
      } else {
        error.value = response.error || '내보내기 실패';
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '내보내기 실패';
  }
}

function handleStop() {
  chrome.runtime.sendMessage({ type: 'STOP_SCRAPE' });
  scrapeStartTime.value = null;
  progress.value = {
    status: 'idle',
    currentChapter: 0,
    totalChapters: 0,
    currentChapterTitle: '',
    progress: 0,
  };
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

async function handleScrape() {
  error.value = '';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    error.value = '활성 탭을 찾을 수 없습니다.';
    return;
  }

  scrapeStartTime.value = Date.now();

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });

    chrome.tabs.sendMessage(tab.id, {
      type: 'START_SCRAPE',
      payload: { options: options.value },
    });
  } catch (e) {
    error.value = '콘텐츠 스크립트를 주입할 수 없습니다.';
    console.error(e);
  }
}

async function getJoplinToken(): Promise<string | null> {
  const stored = await chrome.storage.local.get('joplin_token');
  return stored.joplin_token || null;
}

function startPolling() {
  pollingInterval = setInterval(async () => {
    await loadState();
    await loadCurrentPageInfo();
  }, 500);
}

function saveScrapeDelay() {
  chrome.storage.local.set({ scrape_delay: scrapeDelay.value });
}

watch(options, async (newOptions) => {
  await saveOptions(newOptions);
}, { deep: true });

onMounted(() => {
  init();
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'CLOSE_SIDEPANEL') {
      window.close();
    }
  });
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>