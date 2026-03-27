# 📚 WikiDocs Exporter

[한국어](README.md)

[![Build](https://img.shields.io/github/actions/workflow/status/ejpark78/wikidocs-exporter/release.yml)](https://github.com/ejpark78/wikidocs-exporter/actions)
[![Version](https://img.shields.io/github/v/release/ejpark78/wikidocs-exporter)](https://github.com/ejpark78/wikidocs-exporter/releases)
[![License](https://img.shields.io/github/license/ejpark78/wikidocs-exporter)](LICENSE)
[![opencode](https://img.shields.io/badge/opencode.ai-big--pickle-6366f1?style=flat)](https://opencode.ai)

A Chrome extension to export WikiDocs (https://wikidocs.net/) content to **Obsidian** or **Joplin** note apps.

## ✨ Features

- 🔍 **Full Chapter Crawling**: Automatically collect all chapters from a book
- 📚 **Multiple Books**: Scrape multiple books and manage them individually
- ⏱️ **Real-time Progress**: Display elapsed time / estimated total time
- ⏹️ **Stop Feature**: Stop crawling anytime
- 🖼️ **Image Support**: Automatic image download with relative paths (always enabled)
- 📝 **YAML Frontmatter**: Auto-generated Obsidian-friendly metadata (always enabled)
- 📑 **Index File**: Generate INDEX.md with chapter links (always enabled)
- 💾 **Multiple Export Targets**: Obsidian (Local REST API), Joplin (API), MarkDown (ZIP)
- 🎨 **Dark Theme Sidebar**: Clean visual UI
- ⚙️ **Scrape Delay Setting**: Adjustable 0-15 second slider
- 📤 **Per-book Export**: Individual book export/delete
- 🔄 **Side Panel Toggle**: Open/close with icon click

## 🚀 Installation

### 1. Build

```bash
# Install dependencies
npm install

# Production build
npm run build

# Development mode (auto rebuild on file changes)
npm run dev

# Create ZIP package
npm run pack
```

### 2. Load in Chrome

**Method A: Install from ZIP file**
1. Run `npm run pack` to create ZIP package
2. Extract `wikidocs-exporter.zip`
3. Open `chrome://extensions` in Chrome
4. Enable **Developer mode** in the top right
5. Click **Load unpacked**
6. Select the extracted folder

**Method B: Load from folder (for development)**
1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** in the top right
3. Click **Load unpacked**
4. Select the project's `dist` folder

### 3. Usage

1. Click the extension icon
2. Sidebar appears on the right

## 📖 Usage Guide

### Basic Usage

1. **Open WikiDocs book page**: Open the lecture page in Chrome
2. **Run extension**: Click the extension icon
3. **Start scraping**: Click `🔍 Start Scraping` in sidebar
4. **Export**: Click 📤 button for each book in results

### Multiple Books

- Scrape multiple books sequentially
- Each book can be downloaded/deleted independently
- Same title books are automatically overwritten

### Export Target

| Target | Description |
|--------|-------------|
| **Obsidian** | Save directly to Vault via Local REST API |
| **Joplin** | Save directly to notes via Data API |
| **MarkDown** | Download as ZIP file |

### Obsidian Connection

1. Run Obsidian app
2. **Settings → Community Plugins** → Install "Local REST API"
3. Enable the plugin
4. **Settings → Local REST API** → Copy API Key
5. Enter API Key in extension and click "Connect"

### Joplin Connection

1. Run Joplin app
2. Enable **Tools → Web Clipper**
3. Click **"Connect to Joplin"** button
4. Allow popup request in Joplin app

**Disconnect**: Click "Disconnect" button when connected

### Scrape Delay

- Delay between chapters: 0-15 seconds adjustable
- Too fast crawling may be blocked by Cloudflare

## 📂 Obsidian Export Structure

```
book-name.zip
├── images/
│   ├── image1.png
│   └── image2.png
├── 01-chapter-title.md
├── 02-chapter-title.md
└── INDEX.md
```

### YAML Frontmatter Example

```yaml
---
title: "Chapter Title"
source: https://wikidocs.net/12345
date: 2026-03-26
tags:
  - wiki-docs
  - book-name
---
```

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| TypeScript | Type-safe code |
| Vue 3 (Composition API) | Side Panel UI |
| Vite 5 | Bundling |
| @crxjs/vite-plugin | Chrome Extension build |
| Turndown | HTML to Markdown |
| turndown-plugin-gfm | GitHub Flavored Markdown |
| JSZip | ZIP file creation |
| Archiver | Extension packaging |
| Chrome Manifest V3 | Extension API |
| chrome.sidePanel API | Side Panel toggle |
| GitHub Actions | CI/CD automation |

## 📁 Project Structure

```
wikidocs-exporter/
├── manifest.json           # Chrome Extension manifest (V3)
├── package.json
├── vite.config.ts         # Vite build config
├── tsconfig.json
├── scripts/
│   └── pack.js           # ZIP packaging script
├── .github/
│   └── workflows/
│       └── release.yml    # GitHub Actions CI/CD
├── AGENTS.md              # Role definitions
├── PLAN.md                # Development plan
├── README.md              # Documentation
├── CHANGELOG.md           # Changelog
├── CONTRIBUTING.md       # Contributing guide
├── ISSUES.md              # Issue template
├── LICENSE.md             # MIT License
├── src/
│   ├── types/
│   │   ├── wikidocs.ts    # Type definitions
│   │   └── turndown.d.ts  # Turndown types
│   ├── utils/
│   │   ├── markdown.ts    # Markdown conversion utility
│   │   └── storage.ts     # Chrome Storage utility
│   ├── content/
│   │   └── content.ts     # Content Script (crawling)
│   ├── background/
│   │   └── background.ts  # Background Service Worker
│   ├── side-panel/
│   │   ├── main.ts        # Vue app entry
│   │   ├── SidePanel.vue  # Vue 3 component
│   │   ├── side-panel.html
│   │   └── side-panel.css
│   └── export/
│       ├── base.ts        # Common utilities
│       ├── obsidian.ts    # Obsidian export
│       └── index.ts
```

### Local Packaging

```bash
npm run pack
```

Creates: `wikidocs-exporter.zip`

### GitHub Release (Automatic)

When pushing to `release/*` branch, GitHub Actions automatically:
1. Runs build
2. Creates ZIP package
3. Creates Release with ZIP attached

```bash
# Create and push release branch
git checkout -b release/v1.2.0
git push origin release/v1.2.0
```

### Chrome Web Store Deployment (Manual)

Create ZIP file and manually upload to Chrome Web Store:

```bash
npm run pack
```

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** with `dist` folder (for testing)
4. Or upload `wikidocs-exporter.zip` to Chrome developer dashboard

## ⚠️ Limitations

- Works only on WikiDocs site
- Obsidian/Joplin connection requires respective app to be running
- Obsidian requires "Local REST API" plugin
- Joplin requires "Web Clipper" to be enabled
- Too fast crawling may be blocked by Cloudflare (adjust delay recommended)

## 📝 License

MIT License

## 🤝 Contributing

Please report bugs and feature requests via Issues.
