import { describe, it, expect } from 'vitest';
import { generateFrontmatter } from '../generators/frontmatter';
import type { WikiDocsBook, WikiDocsChapter } from '../../types';

describe('generateFrontmatter', () => {
  const createMockChapter = (overrides: Partial<WikiDocsChapter> = {}): WikiDocsChapter => ({
    index: 1,
    title: 'Test Chapter',
    url: 'https://wikidocs.net/page/123',
    content: '# Test Content',
    images: [],
    ...overrides,
  });

  const createMockBook = (overrides: Partial<WikiDocsBook> = {}): WikiDocsBook => ({
    title: 'Test Book',
    url: 'https://wikidocs.net/book/123',
    chapters: [],
    totalChapters: 10,
    ...overrides,
  });

  it('should generate YAML frontmatter by default', () => {
    const chapter = createMockChapter();
    const book = createMockBook();
    const result = generateFrontmatter(chapter, book);

    expect(result).toContain('---');
    expect(result).toContain('title:');
    expect(result).toContain('source:');
    expect(result).toContain('date:');
    expect(result).toContain('tags:');
  });

  it('should generate simple frontmatter when format is simple', () => {
    const chapter = createMockChapter();
    const book = createMockBook();
    const result = generateFrontmatter(chapter, book, 'simple');

    expect(result).toContain('**Source:**');
    expect(result).toContain('**Date:**');
    expect(result).toContain('**Tags:**');
  });

  it('should include chapter title in YAML frontmatter', () => {
    const chapter = createMockChapter({ title: 'My Chapter Title' });
    const book = createMockBook();
    const result = generateFrontmatter(chapter, book);

    expect(result).toContain('title: "My Chapter Title"');
  });

  it('should include source URL in frontmatter', () => {
    const chapter = createMockChapter({ url: 'https://example.com/page/1' });
    const book = createMockBook();
    const result = generateFrontmatter(chapter, book);

    expect(result).toContain('source: https://example.com/page/1');
  });

  it('should include book title in tags', () => {
    const chapter = createMockChapter();
    const book = createMockBook({ title: 'My Test Book' });
    const result = generateFrontmatter(chapter, book);

    expect(result).toContain('wiki-docs');
  });
});
