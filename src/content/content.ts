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
    
    const selectors = [
      '.list-group-item.toc-item',
      '.toc-item',
      '.list-group-item a',
      '.chapter-list a',
      '#toc a',
      '.sidebar-toc a',
      '[class*="toc"] a',
      '.wd-toc-item',
    ];
    
    let tocItems: NodeListOf<HTMLAnchorElement> | null = null;
    
    for (const sel of selectors) {
      const items = document.querySelectorAll(sel);
      if (items.length > 0) {
        tocItems = items as NodeListOf<HTMLAnchorElement>;
        break;
      }
    }
    
    if (!tocItems || tocItems.length === 0) {
      const allLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="wikidocs.net"]');
      for (const link of allLinks) {
        const href = link.href;
        const title = link.textContent?.trim();
        if (href && title) {
          const match = href.match(/\/(\d+)$/);
          if (match) {
            const url = `https://wikidocs.net/${match[1]}`;
            if (!chapters.find(c => c.url === url)) {
              chapters.push({ title, url, index: chapters.length + 1 });
            }
          }
        }
      }
      return chapters;
    }
    
    for (const item of tocItems) {
      const href = (item as HTMLAnchorElement).href || item.getAttribute('href');
      const title = item.textContent?.trim() || item.querySelector('span')?.textContent?.trim();
      
      if (href && title) {
        let pageId: string | null = null;
        
        const match1 = href.match(/javascript:page\((\d+)\)/);
        const match2 = href.match(/\/(\d+)$/);
        const match3 = href.match(/[?&]id=(\d+)/);
        
        if (match1) pageId = match1[1];
        else if (match2) pageId = match2[1];
        else if (match3) pageId = match3[1];
        
        if (pageId) {
          const url = `https://wikidocs.net/${pageId}`;
          if (!chapters.find(c => c.url === url)) {
            chapters.push({ title, url, index: chapters.length + 1 });
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
        return null;
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const titleSelectors = ['.page-subject-text', 'h1', '.book-title', '.page-title', '[class*="title"]'];
      let title = 'Untitled';
      for (const sel of titleSelectors) {
        const el = doc.querySelector(sel);
        if (el?.textContent?.trim()) {
          title = el.textContent.trim();
          break;
        }
      }
      if (title === 'Untitled') {
        title = doc.title.replace(' - 위키독스', '').trim() || 'Untitled';
      }
      
      const contentSelectors = ['.page-content', '#content-body', 'article', '.markdown-body', '.wd-content', '[class*="content"]'];
      let contentEl: Element | null = null;
      let content = '';
      
      for (const sel of contentSelectors) {
        const el = doc.querySelector(sel);
        if (el) {
          contentEl = el;
          content = el.innerHTML || '';
          break;
        }
      }
      
      if (!content || content.length < 100) {
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

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

const scraper = new WikiDocsScraper();
let shouldStop = false;



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
      console.log('[DEBUG] Starting scrape process...');
      console.log('[DEBUG] Current URL:', window.location.href);
      
      // Check if this is a book page
      const isBookPage = window.location.href.includes('/book/');
      console.log('[DEBUG] Is book page:', isBookPage);
      
      let chapterUrls = await scraper.collectAllChapterUrls();
      
      console.log('[WikiDocs Scraper] Found chapters from current page:', chapterUrls.length);

      // If not on a book page and no chapters found, try to find book page link
      if (chapterUrls.length === 0 && !isBookPage) {
        console.log('[DEBUG] Not on book page, looking for book link...');
        
        // Try to find a link to the book
        const bookLinks = document.querySelectorAll('a[href*="/book/"]');
        console.log(`[DEBUG] Found ${bookLinks.length} book links`);
        
        for (const link of bookLinks) {
          const href = (link as HTMLAnchorElement).href;
          const text = link.textContent?.trim();
          console.log(`[DEBUG] Book link: ${href}, text: ${text}`);
          
          if (href && (text?.includes('책') || text?.includes('Book') || href.includes('/book/'))) {
            console.log('[DEBUG] Fetching book page to get TOC:', href);
            
            try {
              const response = await fetch(href);
              const html = await response.text();
              
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              
              // Try to extract TOC from book page
              const tocSelectors = [
                '.list-group-item.toc-item',
                '.toc-item',
                '.list-group-item a',
                '.chapter-list a',
                '#toc a',
                '.wd-toc-item',
                '[class*="toc"] a',
                'a[href*="/page/"]',
              ];
              
              for (const sel of tocSelectors) {
                const items = doc.querySelectorAll(sel);
                console.log(`[DEBUG] TOC selector "${sel}" found ${items.length} items`);
                
                if (items.length > 0) {
                  for (const item of items) {
                    const itemHref = (item as HTMLAnchorElement).href || item.getAttribute('href');
                    const itemTitle = item.textContent?.trim();
                    
                    if (itemHref && itemTitle) {
                      const match = itemHref.match(/\/(\d+)$/);
                      if (match) {
                        const url = `https://wikidocs.net/${match[1]}`;
                        if (!chapterUrls.find(c => c.url === url)) {
                          chapterUrls.push({ title: itemTitle, url, index: chapterUrls.length + 1 });
                        }
                      }
                    }
                  }
                  
                  if (chapterUrls.length > 0) {
                    console.log('[DEBUG] Found chapters from book page:', chapterUrls.length);
                    break;
                  }
                }
              }
            } catch (e) {
              console.error('[DEBUG] Failed to fetch book page:', e);
            }
            
            break;
          }
        }
      }

      // If still no chapters found, scrape current page only
      if (chapterUrls.length === 0) {
        console.log('[DEBUG] No TOC found, scraping current page only');
        
        const currentChapter = await scraper.scrapeCurrentPage();
        if (!currentChapter) {
          throw new Error('페이지를 분석할 수 없습니다. WikiDocs 페이지인지 확인해주세요.');
        }

        const book: WikiDocsBook = {
          title: document.querySelector('.book-title')?.textContent?.trim() || 
                 document.querySelector('.book-name')?.textContent?.trim() ||
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
          sendProgress({
            status: 'idle',
            currentChapter: i,
            totalChapters: chapterUrls.length,
            currentChapterTitle: '중단됨',
            progress: Math.round((i / chapterUrls.length) * 100),
          });
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
        
        if (shouldStop) {
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
