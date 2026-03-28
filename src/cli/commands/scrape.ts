import type { CLIOptions } from '../options';
import { WikiDocsAdapter } from '../../adapters/wikidocs';
import { Scraper, createScraper } from '../../core/scraper';
import type { ExportOptions } from '../../types';

export async function runScrape(options: CLIOptions): Promise<void> {
  if (!options.url) {
    console.error('Error: URL is required for scrape command');
    console.log('Usage: wikidocs-exporter scrape <url>');
    process.exit(1);
  }

  console.log(`[CLI] Starting scrape for: ${options.url}`);

  const adapter = new WikiDocsAdapter();
  const scraper = createScraper(adapter);

  try {
    const chapter = await scraper.scrapeUrl(options.url);
    
    if (chapter) {
      console.log(`[CLI] Successfully scraped:`);
      console.log(`  Title: ${chapter.title}`);
      console.log(`  Content length: ${chapter.content.length} chars`);
      console.log(`  Images: ${chapter.images.length}`);
    } else {
      console.log('[CLI] Failed to scrape chapter');
    }
  } catch (error) {
    console.error('[CLI] Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
