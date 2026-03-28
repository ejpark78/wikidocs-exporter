import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../generators/base';

describe('sanitizeFilename', () => {
  it('should remove forbidden characters', () => {
    expect(sanitizeFilename('test:file?name')).toBe('test_file_name');
    expect(sanitizeFilename('test<file>name')).toBe('test_file_name');
    expect(sanitizeFilename('test"file"name')).toBe('test_file_name');
    expect(sanitizeFilename('test|file|name')).toBe('test_file_name');
  });

  it('should replace multiple spaces with single space', () => {
    expect(sanitizeFilename('test    file   name')).toBe('test file name');
  });

  it('should trim whitespace', () => {
    expect(sanitizeFilename('  test file  ')).toBe('test file');
  });

  it('should keep valid filenames unchanged', () => {
    expect(sanitizeFilename('Test File Name')).toBe('Test File Name');
    expect(sanitizeFilename('Chapter 1')).toBe('Chapter 1');
  });

  it('should handle Korean characters', () => {
    expect(sanitizeFilename('테스트 파일')).toBe('테스트 파일');
    expect(sanitizeFilename('챕터 1장')).toBe('챕터 1장');
  });
});
