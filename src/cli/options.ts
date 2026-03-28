export interface CLIOptions {
  command: 'scrape' | 'export' | 'help';
  url?: string;
  target?: 'obsidian' | 'joplin' | 'markdown';
  output?: string;
  includeImages?: boolean;
  addFrontmatter?: boolean;
  createIndex?: boolean;
}

export function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    command: 'help',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === 'scrape' || arg === 'export') {
      options.command = arg;
      if (arg === 'scrape' && args[i + 1] && !args[i + 1].startsWith('--')) {
        options.url = args[i + 1];
        i++;
      }
    } else if (arg === '--target' && args[i + 1]) {
      const target = args[i + 1];
      if (target && ['obsidian', 'joplin', 'markdown'].includes(target)) {
        options.target = target as CLIOptions['target'];
      }
      i++;
    } else if (arg === '--output' && args[i + 1]) {
      const output = args[i + 1];
      if (output) {
        options.output = output;
      }
      i++;
    } else if (arg === '--include-images') {
      options.includeImages = true;
    } else if (arg === '--add-frontmatter') {
      options.addFrontmatter = true;
    } else if (arg === '--create-index') {
      options.createIndex = true;
    }
  }

  return options;
}
