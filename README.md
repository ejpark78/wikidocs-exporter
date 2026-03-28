# 📚 WikiDocs Exporter

[English](docs/README-en.md)

[![Build](https://img.shields.io/github/actions/workflow/status/ejpark78/wikidocs-exporter/release.yml)](https://github.com/ejpark78/wikidocs-exporter/actions)
[![Version](https://img.shields.io/github/v/release/ejpark78/wikidocs-exporter)](https://github.com/ejpark78/wikidocs-exporter/releases)
[![License](https://img.shields.io/github/license/ejpark78/wikidocs-exporter)](LICENSE)
[![opencode](https://img.shields.io/badge/opencode.ai-big--pickle-6366f1?style=flat)](https://opencode.ai)

위키독스(WikiDocs) 컨텐츠를 **Obsidian** 또는 **Joplin** 노트 앱으로 손쉽게 내보내는 Chrome 확장 프로그램입니다.

## ✨ 주요 기능

- 🔍 **전체 챕터 크롤링**: 책의 모든 챕터를 자동으로 수집
- 📚 **여러 책 동시 관리**: 여러 책을 한 번에 스크랩하고 개별 관리
- ⏱️ **실시간 진행률**: 실행시간/예상총시간 표시
- ⏹️ **중단 기능**: 크롤링 중 언제든지 중단 가능
- 🖼️ **이미지 포함**: 이미지 자동 다운로드 및 상대 경로 처리 (항상 활성화)
- 📝 **YAML Frontmatter**: Obsidian 친화적 메타데이터 자동 생성 (항상 활성화)
- 📑 **인덱스 파일**: 챕터별 링크가 포함된 INDEX.md 생성 (항상 활성화)
- 💾 **다양한 내보내기**: Obsidian (Local REST API), Joplin (API), MarkDown (ZIP)
- 🎨 **다크 테마 사이드바**: 시각적으로 깔끔한 UI
- ⚙️ **스크랩 딜레이 설정**: 0~15초 슬라이더로 조절
- 📤 **책별 내보내기**: 개별 책 내보내기/삭제
- 🔄 **사이드 패널 토글**: 아이콘 클릭으로 열기/닫기 전환

## 🚀 향후 개발 계획

기능 개선 및 보안 강화 제안은 [FEATURE_ENHANCEMENTS.md](./FEATURE_ENHANCEMENTS.md)에서 확인할 수 있습니다.

**주요 개선 항목**:
- API 키 암호화 저장
- Joplin 토큰 자동 갱신
- 이미지 다운로드 병렬 처리
- 챕터 선택 기능
- GitHub Wiki 지원
- Notion API 연동
- CSV/Excel 형식 지원
- 이미지 데이터 암호화
- 로컬 서버 접근 제한

## 🚀 설치 방법

### 1. 빌드

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 개발 모드 (파일 변경 시 자동 재빌드)
npm run dev

# ZIP 패키지 생성
npm run pack
```

### 2. Chrome에 로드

**방법 A: ZIP 파일로 설치**
1. `npm run pack`으로 ZIP 패키지 생성
2. `wikidocs-exporter.zip` 파일 압축 해제
3. Chrome에서 `chrome://extensions` 열기
4. 우측 상단 **개발자 모드** 활성화
5. **압축해제된 확장 프로그램 로드** 클릭
6. 압축 해제된 폴더 선택

**방법 B: 폴더에서 로드 (개발용)**
1. Chrome에서 `chrome://extensions` 열기
2. 우측 상단 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램 로드** 클릭
4. 프로젝트의 `dist` 폴더 선택

### 3. 사용 설정

1. 확장 프로그램 아이콘 클릭
2. 사이드바가 우측에 표시됩니다

## 📖 사용법

### 기본 사용법

1. **위키독스 책 페이지 열기**: 내보내려는 강의 페이지를 Chrome에서 열기
2. **확장 프로그램 실행**: 확장 프로그램 아이콘 클릭
3. **스크랩 시작**: 사이드바에서 `🔍 스크랩 시작` 버튼 클릭
4. **내보내기**: 결과 목록에서 책별 📤 버튼 클릭

### 여러 책 관리

- 여러 책을 순차적으로 스크랩 가능
- 각 책은 독립적으로 다운로드/삭제 가능
- 동일 제목의 책은 자동으로 덮어쓰기

### 내보내기 대상

| 대상 | 설명 |
|------|------|
| **Obsidian** | Local REST API로 직접 Vault에 저장 |
| **Joplin** | Data API로 직접 노트에 저장 |
| **MarkDown** | ZIP 파일 다운로드 |

### Obsidian 연동 설정

1. Obsidian 앱 실행
2. **Settings → Community Plugins** → "Local REST API" 설치
3. 플러그인 활성화
4. **Settings → Local REST API** → API Key 복사
5. **Settings → Local REST API** → **Enable Non-encrypted (HTTP) Server** 활성화
6. 확장 프로그램에서 API Key 입력 후 "연결" 클릭

### Joplin 연동 설정

1. Joplin 앱 실행
2. **도구 → 웹 클리퍼** 활성화
3. **"Joplin 연결하기"** 버튼 클릭
4. Joplin 앱에서 팝업 요청 허용

**연결 해제**: 연결 상태에서 "연결 해제" 버튼 클릭

### 스크랩 딜레이

- 챕터 간 딜레이: 0~15초 조절
- 너무 빠른 크롤링은 Cloudflare에 의해 차단될 수 있습니다

## 📂 Obsidian/Joplin 내보내기 구조

```
WikiDocs/
└── 강의명/
    ├── images/
    │   ├── image1.png
    │   └── image2.png
    ├── 01-챕터제목.md
    ├── 02-챕터제목.md
    └── INDEX.md
```

### MarkDown 내보내기 구조 (ZIP)

```
강의명.zip
├── images/
│   ├── image1.png
│   └── image2.png
├── 01-챕터제목.md
├── 02-챕터제목.md
└── INDEX.md
```

### YAML Frontmatter 예시

```yaml
---
title: "챕터제목"
source: https://wikidocs.net/12345
date: 2026-03-26
tags:
  - wiki-docs
  - 강의명
---
```

## 🛠️ 기술 스택

| 기술 | 용도 |
|------|------|
| TypeScript | 타입 안전한 코드 |
| Vue 3 (Composition API) | 사이드 패널 UI |
| Vite 5 | 번들링 |
| @crxjs/vite-plugin | Chrome Extension 빌드 |
| Turndown | HTML → Markdown 변환 |
| turndown-plugin-gfm | GitHub Flavored Markdown 지원 |
| JSZip | ZIP 파일 생성 |
| Archiver | 확장 프로그램 패키징 |
| Chrome Manifest V3 | 확장 프로그램 API |
| chrome.sidePanel API | 사이드 패널 토글 |
| GitHub Actions | CI/CD 자동화 |

## 📁 프로젝트 구조

```
wikidocs-exporter/
├── manifest.json           # Chrome Extension 매니페스트 (V3)
├── package.json
├── vite.config.ts          # Vite 빌드 설정
├── tsconfig.json
├── scripts/
│   └── pack.js           # ZIP 패키징 스크립트
├── .github/
│   └── workflows/
│       └── release.yml    # GitHub Actions CI/CD
├── AGENTS.md              # 역할 정의
├── PLAN.md                # 개발 계획
├── README.md              # 문서
├── CHANGELOG.md           # 변경 로그
├── CONTRIBUTING.md       # 기여 가이드
├── ISSUES.md              # 이슈 템플릿
├── LICENSE.md             # MIT 라이선스
├── src/
│   ├── types/
│   │   ├── wikidocs.ts    # 타입 정의
│   │   └── turndown.d.ts  # turndown 타입
│   ├── utils/
│   │   ├── markdown.ts    # 마크다운 변환 유틸
│   │   └── storage.ts     # Chrome Storage 유틸
│   ├── content/
│   │   └── content.ts     # Content Script (크롤링)
│   ├── background/
│   │   └── background.ts  # Background Service Worker
│   ├── side-panel/
│   │   ├── main.ts        # Vue 앱 엔트리
│   │   ├── SidePanel.vue  # Vue 3 컴포넌트
│   │   ├── side-panel.html
│   │   └── side-panel.css
│   └── export/
│       ├── base.ts        # 공통 유틸
│       ├── obsidian.ts    # Obsidian 내보내기
│       └── index.ts
```

### 로컬 패키징

```bash
npm run pack
```

생성 파일: `wikidocs-exporter.zip`

### GitHub Release (자동)

`release/*` 브랜치를 푸시하면 GitHub Actions가 자동으로:
1. 빌드 실행
2. ZIP 패키지 생성
3. Release 생성 + ZIP 첨부

```bash
# Release 브랜치 생성 및 푸시
git checkout -b release/v1.2.0
git push origin release/v1.2.0
```

### Chrome Web Store 배포 (수동)

ZIP 파일을 생성하여 Chrome Web Store에 수동으로 업로드합니다:

```bash
npm run pack
```

1. `chrome://extensions` 열기
2. **개발자 모드** 활성화
3. **압축해제된 확장 프로그램 로드**로 `dist` 폴더 선택 (테스트용)
4. 또는 `wikidocs-exporter.zip` 파일을 Chrome 개발자 대시보드에 업로드

## ⚠️ 제한사항

- 위키독스 사이트에서만 작동합니다
- Obsidian/Joplin 연동은 각 앱이 실행 중이어야 합니다
- Obsidian은 "Local REST API" 플러그인이 필요합니다
- Joplin은 "웹 클리퍼"가 활성화되어 있어야 합니다
- 너무 빠른 크롤링은 Cloudflare에 의해 차단될 수 있습니다 (딜레이 조절 권장)

## 📝 라이선스

MIT License

## 🤝 기여

버그 리포트 및 기능 요청은 Issue로 등록해 주세요.
