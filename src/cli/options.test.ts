import { describe, it, expect } from 'vitest';
import { parseArgs } from './options';

describe('parseArgs', () => {
  it('should parse scrape command with URL', () => {
    const result = parseArgs(['scrape', 'https://wikidocs.net/book/123']);
    expect(result.command).toBe('scrape');
    expect(result.url).toBe('https://wikidocs.net/book/123');
  });

  it('should parse export command', () => {
    const result = parseArgs(['export']);
    expect(result.command).toBe('export');
  });

  it('should parse target option', () => {
    const result = parseArgs(['export', '--target', 'obsidian']);
    expect(result.command).toBe('export');
    expect(result.target).toBe('obsidian');
  });

  it('should parse output option', () => {
    const result = parseArgs(['export', '--output', '/path/to/output']);
    expect(result.output).toBe('/path/to/output');
  });

  it('should parse include-images flag', () => {
    const result = parseArgs(['export', '--include-images']);
    expect(result.includeImages).toBe(true);
  });

  it('should parse add-frontmatter flag', () => {
    const result = parseArgs(['export', '--add-frontmatter']);
    expect(result.addFrontmatter).toBe(true);
  });

  it('should default to help command', () => {
    const result = parseArgs([]);
    expect(result.command).toBe('help');
  });

  it('should handle invalid target gracefully', () => {
    const result = parseArgs(['export', '--target', 'invalid']);
    expect(result.target).toBeUndefined();
  });
});
