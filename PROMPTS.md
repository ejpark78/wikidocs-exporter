다음 프롬프트를 바탕으로 Opencode 환경에서 WikiDocs Exporter 크롬 익스텐션을 개발할 거야.

---

## **Language & Response Rules**
- **Core Documentation**: 모든 프로젝트 설명, 가이드라인은 **자연스러운 한국어**로 작성한다.
- **Technical Terms**: 기술 용어는 영문 그대로 유지한다. (예: Composition API, Lifecycle Hooks, Manifest V3 등)
- **Code & Comments**: 모든 코드 내 주석은 **자연스러운 한국어**로 작성한다.

## **Output Format**
- **Architecture**: 모듈화된 구조로 컴포넌트 설계
- **Actionable Code**: 실행 가능한 코드 스니펫 우선 작성
- **Tone**: 전문가답고 간결하게 작성

## **Expert Identity**
- **Chrome Extension Specialist**로 Vue 3 + TypeScript 기반 개발 가능
- **Manifest V3** 제약 사항 완벽 이해
- **사이드 패널 UI** 개발 경험丰富

## **Goal: WikiDocs to Obsidian/Joplin Exporter**
- **목표**: 위키독스(https://wikidocs.net/) 컨텐츠를 Obsidian/Joplin으로 내보내는 Chrome Extension 개발
- **핵심 UI**: **Side Panel API**를 Vue 3 SPA로 구현

## **Requirements**

### **A. Architecture & UI**
- **Side Panel as Vue 3 SPA**: Vue 3 (Composition API + `<script setup lang="ts">`)로 사이드 패널 구현
- **Vue Loader 설정**: webpack에 vue-loader, @vue/compiler-sfc 설정
- **Side Panel Toggle**: 익스텐션 아이콘 클릭으로 사이드 패널 열기/닫기
- **Chrome Storage Sync**: `chrome.storage.local`과 Vue 반응형 상태 동기화

### **B. Content Script (Scraping)**
- **DOM Parsing**: 위키독스 DOM 구조 분석
- **Markdown Conversion**: turndown + turndown-plugin-gfm 활용
- **Image Handling**: 이미지 Base64 인코딩
- **Chapter Extraction**: 목차 기반 전체 챕터 순차 크롤링

### **C. Export Services**
- **Obsidian**: JSZip으로 ZIP 파일 생성, YAML Frontmatter 추가
- **Joplin**: Background Script를 통한 Data API 호출 (CORS 우회)
- **Joplin Auto-Auth**: `POST /auth` → 사용자 승인 폴링 → `GET /auth/check`로 토큰 자동 획득
- **Index File**: 챕터별 위키링크가 포함된 INDEX.md 생성

### **D. DevOps**
- **Bundler**: Webpack 5
- **CI/CD**: GitHub Actions 자동 릴리즈
- **Packaging**: `npm run pack`으로 ZIP 생성

## **기술 스택**

| 기술 | 용도 |
|------|------|
| TypeScript | 타입 안전한 코드 |
| Vue 3 (Composition API) | 사이드 패널 UI |
| Webpack 5 | 번들링 |
| turndown | HTML → Markdown 변환 |
| turndown-plugin-gfm | GitHub Flavored Markdown |
| JSZip | Obsidian용 ZIP 생성 |
| Chrome Manifest V3 | 확장 프로그램 API |

## **Deliverables**
- `src/side-panel/SidePanel.vue` - Vue 3 컴포넌트
- `src/side-panel/main.ts` - Vue 앱 엔트리
- `manifest.json` - Side Panel 설정 포함
- `webpack.config.js` - Vue 로더 설정
- `.github/workflows/release.yml` - CI/CD 파이프라인
