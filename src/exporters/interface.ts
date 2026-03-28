import type { WikiDocsBook, ExportOptions } from '../types';

export interface Exporter {
  readonly name: string;
  
  export(book: WikiDocsBook, options: ExportOptions): Promise<void>;
  
  canExport(): Promise<boolean>;
  
  getErrorMessage(): string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  details?: {
    chaptersExported: number;
    imagesExported: number;
    targetPath?: string;
  };
}
