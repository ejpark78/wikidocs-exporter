import type { SiteAdapter } from './interface';
import type { ChapterInfo } from '../core/types';
import type { WikiDocsImage } from '../types';

export class WikiDocsAdapter implements SiteAdapter {
  readonly name = 'WikiDocs';
  readonly baseUrl = 'https://wikidocs.net';

  private titleSelectors = [
    '.page-subject-text',
    'h1',
    '.book-title',
    '.page-title',
    '[class*="title"]',
    '.page-header-title',
  ];

  private contentSelectors = [
    '.page-content',
    '#content-body',
    'article',
    '.markdown-body',
    '.wd-content',
    '[class*="content"]',
  ];

  private tocSelectors = [
    '.list-group-item.toc-item',
    '.toc-item',
    '.list-group-item a',
    '.chapter-list a',
    '#toc a',
    '.sidebar-toc a',
    '[class*="toc"] a',
    '.wd-toc-item',
    'a[href*="/page/"]',
  ];

  isSupported(url: string): boolean {
    return url.includes('wikidocs.net');
  }

  extractTitle(html: string | Document): string | null {
    const doc = typeof html === 'string' ? new DOMParser().parseFromString(html, 'text/html') : html;
    
    for (const sel of this.titleSelectors) {
      const el = doc.querySelector(sel);
      if (el?.textContent?.trim()) {
        return el.textContent.trim();
      }
    }
    
    const pageTitle = doc.title?.replace(' - 위키독스', '').trim();
    return pageTitle || null;
  }

  extractContent(html: string | Document): string | null {
    const doc = typeof html === 'string' ? new DOMParser().parseFromString(html, 'text/html') : html;
    
    for (const sel of this.contentSelectors) {
      const el = doc.querySelector(sel);
      if (el && el.innerHTML.length > 100) {
        return el.innerHTML;
      }
    }
    
    return null;
  }

  extractImages(html: string | Document): Array<{ url: string; filename: string }> {
    const doc = typeof html === 'string' ? new DOMParser().parseFromString(html, 'text/html') : html;
    const images: Array<{ url: string; filename: string }> = [];
    const imgElements = doc.querySelectorAll('img');
    
    for (const img of imgElements) {
      const url = img.src;
      if (url && !url.startsWith('data:')) {
        const filename = url.split('/').pop()?.split('?')[0] || 'image.png';
        images.push({ url, filename });
      }
    }
    
    return images;
  }

  collectChapterUrls(doc: Document): ChapterInfo[] {
    const chapters: ChapterInfo[] = [];
    
    for (const sel of this.tocSelectors) {
      const items = doc.querySelectorAll(sel);
      if (items.length > 0) {
        for (const item of items) {
          const href = (item as HTMLAnchorElement).href || item.getAttribute('href');
          const title = item.textContent?.trim() || item.querySelector('span')?.textContent?.trim();
          
          if (href && title) {
            const pageId = this.extractPageIdFromHref(href);
            if (pageId) {
              const url = this.buildChapterUrl(pageId);
              if (!chapters.find(c => c.url === url)) {
                chapters.push({ title, url, index: chapters.length + 1 });
              }
            }
          }
        }
        
        if (chapters.length > 0) {
          break;
        }
      }
    }
    
    if (chapters.length === 0) {
      const allLinks = doc.querySelectorAll<HTMLAnchorElement>('a[href*="wikidocs.net"]');
      for (const link of allLinks) {
        const href = link.href;
        const title = link.textContent?.trim();
        if (href && title) {
          const pageId = this.extractPageIdFromHref(href);
          if (pageId) {
            const url = this.buildChapterUrl(pageId);
            if (!chapters.find(c => c.url === url)) {
              chapters.push({ title, url, index: chapters.length + 1 });
            }
          }
        }
      }
    }
    
    return chapters;
  }

  buildChapterUrl(pageId: string | number): string {
    return `https://wikidocs.net/${pageId}`;
  }

  buildBookUrl(bookId: string | number): string {
    return `https://wikidocs.net/book/${bookId}`;
  }

  parseChapterFromUrl(url: string): { pageId: string } | null {
    const match = url.match(/\/(\d+)$/);
    return match ? { pageId: match[1] } : null;
  }

  getBookIdFromUrl(url: string): string | null {
    const match = url.match(/\/book\/(\d+)/);
    return match ? match[1] : null;
  }

  private extractPageIdFromHref(href: string): string | null {
    const match1 = href.match(/javascript:page\((\d+)\)/);
    const match2 = href.match(/\/(\d+)$/);
    const match3 = href.match(/[?&]id=(\d+)/);
    
    if (match1) return match1[1];
    if (match2) return match2[1];
    if (match3) return match3[1];
    
    return null;
  }
}

export function createWikiDocsAdapter(): WikiDocsAdapter {
  return new WikiDocsAdapter();
}
