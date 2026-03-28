import { describe, it, expect } from 'vitest';
import { generateIndex } from '../generators/index';
import type { WikiDocsBook, WikiDocsChapter } from '../../types';

describe('generateIndex', () => {
  const createMockChapters = (count: number): WikiDocsChapter[] => {
    return Array.from({ length: count }, (_, i) => ({
      index: i + 1,
      title: `Chapter ${i + 1}`,
      url: `https://wikidocs.net/page/${i + 1}`,
      content: `# Chapter ${i + 1} Content`,
      images: [],
    }));
  };

  const createMockBook = (chapters: WikiDocsChapter[]): WikiDocsBook => ({
    title: 'Test Book',
    url: 'https://wikidocs.net/book/123',
    chapters,
    totalChapters: chapters.length,
  });

  it('should generate Obsidian format index by default', () => {
    const chapters = createMockChapters(3);
    const book = createMockBook(chapters);
    const result = generateIndex(book);

    expect(result).toContain('# 📚 Test Book');
    expect(result).toContain('## 📑 Chapters');
    expect(result).toContain('- [Chapter 1](./Chapter 1.md)');
    expect(result).toContain('- [Chapter 2](./Chapter 2.md)');
    expect(result).toContain('- [Chapter 3](./Chapter 3.md)');
  });

  it('should generate markdown format index', () => {
    const chapters = createMockChapters(2);
    const book = createMockBook(chapters);
    const result = generateIndex(book, 'markdown');

    expect(result).toContain('# 📚 Test Book');
    expect(result).toContain('## 📑 Chapters');
  });

  it('should generate joplin format index with anchors', () => {
    const chapters = createMockChapters(2);
    const book = createMockBook(chapters);
    const result = generateIndex(book, 'joplin');

    expect(result).toContain('# 📚 INDEX');
    expect(result).toContain('- [Chapter 1](#chapter-1)');
    expect(result).toContain('> Source: https://wikidocs.net/page/1');
  });

  it('should handle empty chapters', () => {
    const book = createMockBook([]);
    const result = generateIndex(book);

    expect(result).toContain('# 📚 Test Book');
    expect(result).toContain('## 📑 Chapters');
  });

  it('should use sanitizeFilename for special characters', () => {
    const chapters: WikiDocsChapter[] = [{
      index: 1,
      title: 'Chapter 1: Test <Special> Characters',
      url: 'https://wikidocs.net/page/1',
      content: '',
      images: [],
    }];
    const book = createMockBook(chapters);
    const result = generateIndex(book);

    expect(result).toContain('[Chapter 1: Test <Special> Characters]');
  });
});
