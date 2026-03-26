import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { WikiDocsChapter, WikiDocsImage } from '../types/wikidocs';

export class MarkdownConverter {
  private turndown: TurndownService;

  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
    this.turndown.use(gfm);
  }

  convert(html: string): string {
    let markdown = this.turndown.turndown(html);
    markdown = markdown.replace(/\[\[MARK\]\]/gi, '');
    return markdown;
  }

  async extractImages(html: string): Promise<WikiDocsImage[]> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images: WikiDocsImage[] = [];
    const imgElements = doc.querySelectorAll('img');

    for (const img of imgElements) {
      const url = img.src;
      if (url && !url.startsWith('data:')) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const base64 = await this.blobToBase64(blob);
          const filename = this.extractFilename(url);
          images.push({ url, base64, filename });
        } catch (error) {
          console.error(`Failed to fetch image: ${url}`, error);
        }
      }
    }

    return images;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private extractFilename(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('?')[0];
  }

  replaceImageUrls(content: string, images: WikiDocsImage[]): string {
    let result = content;
    for (const img of images) {
      result = result.replace(img.url, `../images/${img.filename}`);
    }
    return result;
  }
}
