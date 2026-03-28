import type { SiteAdapter } from '../adapters/interface';
import type { WikiDocsBook, WikiDocsChapter, WikiDocsImage } from '../types';
import type { ChapterInfo, ScrapingOptions } from './types';
import { MarkdownConverter } from './markdown';

export class Scraper {
  private adapter: SiteAdapter;
  private converter: MarkdownConverter;

  constructor(adapter: SiteAdapter) {
    this.adapter = adapter;
    this.converter = new MarkdownConverter();
  }

  async scrapeUrl(url: string): Promise<WikiDocsChapter | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      if (this.isCloudflareProtection(html)) {
        console.warn('[Scraper] Cloudflare protection detected');
        return null;
      }
      
      return this.scrapeHtml(html, url);
    } catch (error) {
      console.error('[Scraper] Failed to scrape URL:', url, error);
      return null;
    }
  }

  scrapeHtml(html: string, url: string): WikiDocsChapter | null {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    const title = this.adapter.extractTitle(doc);
    const contentHtml = this.adapter.extractContent(doc);
    
    if (!title || !contentHtml) {
      return null;
    }
    
    const images = this.extractImagesFromHtml(contentHtml);
    const markdown = this.converter.convert(contentHtml);
    const processedMarkdown = this.converter.replaceImageUrls(markdown, images);
    
    const chapterInfo = this.adapter.parseChapterFromUrl(url);
    const pageId = chapterInfo?.pageId || '0';
    
    return {
      index: parseInt(pageId, 10),
      title,
      url,
      content: processedMarkdown,
      images,
    };
  }

  async collectChapterUrlsFromPage(url: string): Promise<ChapterInfo[]> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return this.adapter.collectChapterUrls(doc);
    } catch (error) {
      console.error('[Scraper] Failed to collect chapter URLs:', error);
      return [];
    }
  }

  async scrapeBook(
    chapterUrls: ChapterInfo[],
    options: ScrapingOptions,
    onProgress?: (current: number, total: number, title: string) => void
  ): Promise<WikiDocsBook> {
    const chapters: WikiDocsChapter[] = [];
    
    for (let i = 0; i < chapterUrls.length; i++) {
      const chapterInfo = chapterUrls[i];
      
      if (onProgress) {
        onProgress(i + 1, chapterUrls.length, chapterInfo.title);
      }
      
      const chapter = await this.scrapeUrl(chapterInfo.url);
      
      if (chapter) {
        chapter.index = i + 1;
        chapters.push(chapter);
      }
      
      if (i < chapterUrls.length - 1 && options.delaySeconds > 0) {
        await this.delay(options.delaySeconds * 1000);
      }
    }
    
    return {
      title: '',
      url: '',
      chapters,
      totalChapters: chapters.length,
    };
  }

  async scrapeCurrentPage(): Promise<WikiDocsChapter | null> {
    const title = this.adapter.extractTitle(document);
    const contentHtml = this.adapter.extractContent(document);
    
    if (!title || !contentHtml) {
      return null;
    }
    
    const images = this.extractImagesFromHtml(contentHtml);
    const markdown = this.converter.convert(contentHtml);
    const processedMarkdown = this.converter.replaceImageUrls(markdown, images);
    
    return {
      index: this.extractChapterIndexFromUrl(window.location.href),
      title,
      url: window.location.href,
      content: processedMarkdown,
      images,
    };
  }

  collectChapterUrlsFromCurrentPage(): ChapterInfo[] {
    return this.adapter.collectChapterUrls(document);
  }

  private extractImagesFromHtml(html: string): WikiDocsImage[] {
    const extracted = this.adapter.extractImages(html);
    return extracted.map(img => ({
      ...img,
      base64: '',
    }));
  }

  private isCloudflareProtection(html: string): boolean {
    return html.includes('Just a moment') || html.includes('Checking your browser');
  }

  private extractChapterIndexFromUrl(url: string): number {
    const match = url.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createScraper(adapter: SiteAdapter): Scraper {
  return new Scraper(adapter);
}
