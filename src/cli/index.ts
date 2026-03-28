import { parseArgs } from './options';
import { runScrape } from './commands/scrape';
import { runExport } from './commands/export';

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.command === 'scrape') {
    await runScrape(options);
  } else if (options.command === 'export') {
    await runExport(options);
  } else {
    console.log(`
WikiDocs Exporter CLI

Usage:
  wikidocs-exporter <command> [options]

Commands:
  scrape <url>     Scrape a WikiDocs book
  export           Export scraped book

Options:
  --target         Export target: obsidian, joplin, markdown
  --output         Output path
  --include-images Include images in export
  --help           Show this help

Examples:
  wikidocs-exporter scrape https://wikidocs.net/book/123
  wikidocs-exporter export --target=obsidian
    `);
    process.exit(1);
  }
}

main().catch(console.error);
