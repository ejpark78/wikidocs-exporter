import { describe, it, expect } from 'vitest';
import { extractFilenameFromUrl } from './image-utils';

describe('extractFilenameFromUrl', () => {
  it('should extract filename from simple URL', () => {
    expect(extractFilenameFromUrl('https://example.com/image.png')).toBe('image.png');
  });

  it('should extract filename with query string', () => {
    expect(extractFilenameFromUrl('https://example.com/image.png?version=1')).toBe('image.png');
  });

  it('should extract filename with path', () => {
    expect(extractFilenameFromUrl('https://example.com/images/photo.jpg')).toBe('photo.jpg');
  });

  it('should handle URLs without filename', () => {
    expect(extractFilenameFromUrl('https://example.com/')).toBe('');
  });
});
