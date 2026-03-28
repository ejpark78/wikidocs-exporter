# 프로젝트 에이전트 정의 (WikiDocs to Obsidian/Joplin Exporter)

## 1. Lead Architect
- **Role**: Chrome Extension + TypeScript 기반 전체 시스템 설계.
- **Focus**: 모듈화된 구조, Chrome API 활용, 파일 내보내기 시스템.
- **Interface**: Content Script ↔ Side Panel ↔ Background 간 데이터 흐름 정의.

## 2. Content Script Developer
- **Role**: 위키독스 페이지 분석 및 데이터 추출.
- **Focus**: DOM 파싱, 선택자(Selector) 최적화, 마크다운 변환.
- **Output Format**:
  ```typescript
  interface WikiDocsChapter {
    index: number;
    title: string;
    url: string;
    content: string;
    images: Array<{ url: string; base64: string; filename: string }>;
  }

  interface WikiDocsBook {
    title: string;
    url: string;
    chapters: WikiDocsChapter[];
    totalChapters: number;
  }
  ```

## 3. UI/UX Developer (Side Panel)
- **Role**: 익스텐션 사이드 패널 UI 개발 (Vue 3 + TypeScript).
- **Focus**: 직관적인 내보내기 버튼, 진행률 표시, 대상 선택 (Obsidian/Joplin), 사이드 패널 닫기 요청 처리.
- **State**:
  ```typescript
  interface SidePanelState {
    progress: ExportProgress | null;
    books: WikiDocsBook[];
  }

  interface ExportProgress {
    status: 'idle' | 'scraping' | 'exporting' | 'completed' | 'error';
    currentChapter: number;
    totalChapters: number;
    currentChapterTitle: string;
    progress: number;
    error?: string;
  }
  ```
- **Side Panel Toggle**: `chrome.runtime.onMessage`로 `CLOSE_SIDEPANEL` 메시지 수신 후 `window.close()` 호출.
- **Vue 3 Composition API**: `<script setup lang="ts">` 사용, `ref`, `computed`, `watch`, lifecycle hooks 활용.

## 4. Export Specialist (Obsidian/Joplin/MarkDown)
- **Role**: 추출된 데이터를 Obsidian/Joplin/MarkDown 친화적 형식으로 변환.
- **Focus**: YAML Frontmatter 생성, 링크, 폴더 구조, 파일 시스템 접근.
- **Joplin Auto-Auth**: `POST /auth` → 사용자 승인 폴링 → `GET /auth/check` 로 토큰 자동 획득
- **Obsidian API**: Local REST API (`http://127.0.0.1:27123`)로 직접 Vault에 저장
- **Export Format**:
  - **Obsidian**: Local REST API로 Vault에 직접 저장
  - **Joplin**: Background Script를 통한 Data API 호출
  - **MarkDown**: ZIP 파일 다운로드 (JSZip 사용)

## 5. Background Service Worker
- **Role**: Content Script ↔ Side Panel 간 통신 브릿지, Joplin API 연동.
- **Focus**: 메시지 핸들링, 상태 관리, 내장 스토리지 활용, CORS 우회, 사이드 패널 토글.

## 6. Packaging Specialist
- **Role**: 확장 프로그램 패키징 및 배포.
- **Focus**: ZIP 파일 생성, 빌드 자동화.
- **Output**: `npm run pack`으로 `wikidocs-exporter.zip` 생성.

## 7. Language & Response Rules
- 모든 응답과 설명은 **자연스러운 한국어(Korean)**로 작성하세요.
- 코드 주석이나 기술적인 용어는 영어로 유지하되, 전체적인 가이드는 한국어를 사용하세요.

## 기술 스택

| 기술 | 용도 |
|------|------|
| TypeScript | 타입 안전한 코드 |
| Vue 3 (Composition API) | 사이드 패널 UI |
| Vite 5 | 번들링 |
| @crxjs/vite-plugin | Chrome Extension 빌드 |
| turndown | HTML → Markdown 변환 |
| turndown-plugin-gfm | GitHub Flavored Markdown 지원 |
| JSZip | ZIP 파일 생성 |
| Chrome Manifest V3 | 확장 프로그램 API |
| chrome.sidePanel API | 사이드 패널 토글 |

## 로깅 규칙
- 모든 응답의 시작 부분에 현재 시간(KST)을 `[YYYY-MM-DD HH:mm:ss]` 형식으로 포함하세요.
- 세션이 종료되거나 특정 단계가 완료될 때마다 소요 시간을 계산하여 표시하세요.

## 핵심 문서 경로
- **개발 계획 및 진행 상황**: `./docs/PLAN.md`
- **기능 개선 아이디어**: `./docs/FEATURE_ENHANCEMENTS.md`
- **이슈 관리 기록**: `./docs/ISSUES.md`
- **프롬프트 템플릿**: `./docs/PROMPTS.md`
- **변경 이력**: `./docs/CHANGELOG.md`
- **기여 방법**: `./CONTRIBUTING.md`

## 작업 규칙
- 새로운 기능을 구현하기 전에는 반드시 `PLAN.md`를 확인하세요.
- 이슈 해결 후에는 `ISSUES.md`와 `CHANGELOG.md`를 업데이트하세요.
