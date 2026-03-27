import { MarkdownConverter } from '../utils/markdown';
import { sendProgress, sendComplete, sendError } from '../utils/storage';
import type { WikiDocsBook, WikiDocsChapter, ExportOptions } from '../types/wikidocs';

class WikiDocsScraper {
  private converter: MarkdownConverter;

  constructor() {
    this.converter = new MarkdownConverter();
  }

  async scrapeCurrentPage(): Promise<WikiDocsChapter | null> {
    const title = this.extractTitle();
    const content = this.extractContent();
    const url = window.location.href;

    if (!title || !content) {
      return null;
    }

    const images = await this.converter.extractImages(content);
    const markdown = this.converter.convert(content);
    const processedMarkdown = this.converter.replaceImageUrls(markdown, images);

    return {
      index: this.extractChapterIndex(),
      title,
      url,
      content: processedMarkdown,
      images,
    };
  }

  private extractTitle(): string | null {
    const h1 = document.querySelector('.page-header-title') || 
               document.querySelector('h1') ||
               document.querySelector('.book-title');
    return h1?.textContent?.trim() || null;
  }

  private extractContent(): string | null {
    const content = document.querySelector('.page-content') ||
                    document.querySelector('#content-body') ||
                    document.querySelector('article') ||
                    document.querySelector('.markdown-body');
    return content?.innerHTML || null;
  }

  private extractChapterIndex(): number {
    const url = window.location.href;
    const match = url.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async collectAllChapterUrls(): Promise<Array<{ title: string; url: string; index: number }>> {
    const chapters: Array<{ title: string; url: string; index: number }> = [];
    
    const tocItems = document.querySelectorAll('.list-group-item.toc-item');
    
    let index = 0;
    for (const item of tocItems) {
      const href = item.getAttribute('href');
      const title = item.querySelector('span')?.textContent?.trim();
      
      if (href && title) {
        const match = href.match(/javascript:page\((\d+)\)/);
        if (match) {
          const pageId = match[1];
          const url = `https://wikidocs.net/${pageId}`;
          if (!chapters.find(c => c.url === url)) {
            index++;
            chapters.push({ title, url, index });
          }
        }
      }
    }

    return chapters;
  }

  async scrapeChapterByUrl(url: string): Promise<WikiDocsChapter | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      if (html.includes('Just a moment') || html.includes('Checking your browser')) {
        console.log('[WikiDocs Scraper] Cloudflare challenge detected, skipping:', url);
        return null;
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const title = doc.querySelector('.page-subject-text')?.textContent?.trim() || 
                    doc.querySelector('h1')?.textContent?.trim() || 
                    doc.title.replace(' - 위키독스', '').trim() || 'Untitled';
      
      const contentEl = doc.querySelector('.page-content');
      const content = contentEl?.innerHTML || '';
      
      if (!content || content.length < 100) {
        console.log('[WikiDocs Scraper] Empty or too short content, skipping:', url);
        return null;
      }

      const images: WikiDocsChapter['images'] = [];
      const imgElements = contentEl?.querySelectorAll('img') || [];
      
      for (const img of imgElements) {
        const imgUrl = img.src;
        if (imgUrl && !imgUrl.startsWith('data:')) {
          images.push({
            url: imgUrl,
            base64: '',
            filename: imgUrl.split('/').pop()?.split('?')[0] || 'image.png',
          });
        }
      }

      const markdown = this.converter.convert(content);
      const processedMarkdown = this.converter.replaceImageUrls(markdown, images);

      return {
        index: this.extractChapterIndexFromUrl(url),
        title,
        url,
        content: processedMarkdown,
        images,
      };
    } catch (error) {
      console.error('Failed to scrape chapter:', url, error);
      return null;
    }
  }

  private extractChapterIndexFromUrl(url: string): number {
    const match = url.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

const scraper = new WikiDocsScraper();
let shouldStop = false;

console.log('[WikiDocs Scraper] Content Script loaded on:', window.location.href);

chrome.runtime.onMessage.addListener(async (message) => {
  console.log('[WikiDocs Scraper] Received message:', message.type);
  
  if (message.type === 'STOP_SCRAPE') {
    console.log('[WikiDocs Scraper] Stop requested');
    shouldStop = true;
    return;
  }
  
  if (message.type === 'START_SCRAPE') {
    shouldStop = false;
    const options: ExportOptions = message.payload.options;
    const scrapeAllChapters = options.scrapeAll || true;

    const storedDelay = await chrome.storage.local.get('scrape_delay');
    const delaySeconds = storedDelay.scrape_delay || 3;

    try {
      const chapterUrls = await scraper.collectAllChapterUrls();
      
      console.log('[WikiDocs Scraper] Found chapters:', chapterUrls.length);

      if (chapterUrls.length === 0) {
        const currentChapter = await scraper.scrapeCurrentPage();
        if (!currentChapter) {
          throw new Error('페이지를 분석할 수 없습니다. WikiDocs 페이지인지 확인해주세요.');
        }

        const book: WikiDocsBook = {
          title: document.querySelector('.book-title')?.textContent?.trim() || 
                 document.title.replace(' - 위키독스', '').trim(),
          url: window.location.href.split('/page/')[0],
          chapters: [currentChapter],
          totalChapters: 1,
        };

        sendComplete(book);
        return;
      }

      sendProgress({
        status: 'scraping',
        currentChapter: 0,
        totalChapters: chapterUrls.length,
        currentChapterTitle: '수집 시작...',
        progress: 0,
      });

      const chapters: WikiDocsChapter[] = [];

      for (let i = 0; i < chapterUrls.length; i++) {
        if (shouldStop) {
          console.log('[WikiDocs Scraper] Stopped by user');
          if (chapters.length > 0) {
            sendComplete({
              title: document.querySelector('.book-title')?.textContent?.trim() || 
                     document.title.split(' - ')[0]?.trim() || 'WikiDocs Book',
              url: window.location.href.split('/page/')[0].split('/book/')[0],
              chapters,
              totalChapters: chapters.length,
            });
          }
          return;
        }

        const chapterInfo = chapterUrls[i];

        sendProgress({
          status: 'scraping',
          currentChapter: i + 1,
          totalChapters: chapterUrls.length,
          currentChapterTitle: chapterInfo.title,
          progress: Math.round((i / chapterUrls.length) * 100),
        });

        const chapter = await scraper.scrapeChapterByUrl(chapterInfo.url);
        if (chapter) {
          chapter.index = i + 1;
          chapters.push(chapter);
        }

        if (i < chapterUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        }
      }

      const bookTitle = document.querySelector('.book-title')?.textContent?.trim() || 
                        document.querySelector('.book-name')?.textContent?.trim() ||
                        document.title.split(' - ')[0]?.trim() ||
                        'WikiDocs Book';

      const book: WikiDocsBook = {
        title: bookTitle,
        url: window.location.href.split('/page/')[0].split('/book/')[0],
        chapters,
        totalChapters: chapters.length,
      };

      sendProgress({
        status: 'completed',
        currentChapter: chapters.length,
        totalChapters: chapters.length,
        currentChapterTitle: '수집 완료!',
        progress: 100,
      });

      sendComplete(book);

    } catch (error) {
      console.error('[WikiDocs Scraper] Error:', error);
      sendError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
    return true;
  }
  return true;
});
