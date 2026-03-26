declare module 'turndown' {
  class TurndownService {
    constructor(options?: {
      headingStyle?: 'atx' | 'setext';
      codeBlockStyle?: 'fenced' | 'indented';
      bulletListMarker?: '-' | '*' | '+';
      emDelimiter?: '_' | '*';
      strongDelimiter?: '__' | '**';
      linkStyle?: 'inlined' | 'referenced';
      linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
      preformattedCode?: boolean;
      encodeWrappedWS?: boolean;
    });
    addRule(key: string, rule: object): void;
    use(plugin: object | object[]): void;
    turndown(html: string): string;
    turndownRule(key: string): object;
    removeRule(key: string): void;
    keep(filter: object | string): void;
    remove(filter: object | string): void;
    escape(str: string): string;
  }
  export = TurndownService;
}

declare module 'turndown-plugin-gfm' {
  import { TurndownService } from 'turndown';
  interface GFMOptions {
    headingStyle?: 'atx' | 'setext';
    codeBlockStyle?: 'fenced' | 'indented';
    bulletListMarker?: '-' | '*' | '+';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '__' | '**';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
    preformattedCode?: boolean;
    encodeWrappedWS?: boolean;
  }
  export const gfm: (options?: GFMOptions) => void;
  export const tables: (options?: GFMOptions) => void;
  export const taskListItems: (options?: GFMOptions) => void;
  export const strikethrough: (options?: GFMOptions) => void;
  export const highlightedCodeBlock: (options?: GFMOptions) => void;
}
