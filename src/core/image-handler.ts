import type { WikiDocsChapter, WikiDocsImage } from '../types';

export function replaceImagePaths(chapter: WikiDocsChapter): string {
  let content = chapter.content;
  
  for (const image of chapter.images) {
    const relativePath = `../images/${image.filename}`;
    content = content.replace(relativePath, image.url);
  }
  
  return content;
}

export function replaceImagePathsWithUrls(content: string, images: WikiDocsImage[], replacementFn?: (url: string, filename: string) => string): string {
  let result = content;
  
  for (const image of images) {
    const relativePath = `../images/${image.filename}`;
    const replacement = replacementFn ? replacementFn(image.url, image.filename) : image.url;
    result = result.replace(relativePath, replacement);
  }
  
  return result;
}

export async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function extractFilenameFromUrl(url: string): string {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('?')[0];
}

export function createImageHandler() {
  return {
    replaceImagePaths,
    replaceImagePathsWithUrls,
    fetchImageAsBase64,
    extractFilenameFromUrl,
  };
}
