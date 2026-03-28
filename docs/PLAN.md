# 개발 계획서: WikiDocs Obsidian/Joplin Exporter (Chrome Extension)

## 1단계: 프로젝트 환경 설정 ✅ 완료
- [x] Chrome Extension + TypeScript 프로젝트 초기화.
- [x] 의존성 설치: `typescript`, `webpack`, `ts-loader`, `copy-webpack-plugin`.
- [x] `manifest.json` (Manifest V3) 설정.
- [x] 개발 환경: `npm run dev` 또는 `npm run build`.

## 2단계: Content Script 개발 (크롤링 엔진) ✅ 완료
- [x] 위키독스 DOM 구조 분석 (`.list-group-item.toc-item`, `javascript:page(ID)`).
- [x] 챕터 제목, 본문, 이미지 추출.
- [x] Markdown 변환 (`turndown` + `turndown-plugin-gfm`).
- [x] 이미지 Base64 인코딩.
- [x] 전체 목차(모든 챕터 URL) 수집 및 순차 크롤링.
- [x] Cloudflare 보호 페이지 스킵 처리.
- [x] `[[MARK]]` 마커 제거.

## 3단계: Side Panel UI 개발 ✅ 완료
- [x] **Vue 3 기반 사이드패널 UI** (Composition API + `<script setup>`).
- [x] 내보내기 대상 선택 (Obsidian / Joplin).
- [x] 현재 페이지 정보 표시.
- [x] 진행률 표시 (현재 챕터, 퍼센트, 실행시간/예상총시간).
- [x] 스크랩 시작/중단 버튼.
- [x] 스크랩 딜레이 슬라이더 (0~15초).
- [x] 다크 테마 UI.
- [x] 반응형 레이아웃 (100% 너비, 최대 400px).

## 4단계: 내보내기 모듈 개발 ✅ 완료
- [x] **Obsidian 내보내기**:
  - [x] ZIP 파일 다운로드 (JSZip 사용).
  - [x] 폴더 구조 생성: `강의명/`.
  - [x] YAML Frontmatter 추가.
  - [x] 이미지 상대 경로 처리 (`../images/`).
  - [x] INDEX.md 파일 생성.
- [x] **Joplin 내보내기**:
  - [x] Background Script에서 API 호출 (CORS 우회).
  - [x] `/folders` 엔드포인트로 노트북 생성.
  - [x] `/notes` 엔드포인트로 노트 생성.
  - [x] API 토큰 URL 파라미터 방식.
  - [x] **자동 토큰 획득**: `POST /auth` → 사용자 승인 폴링 → `GET /auth/check`
- [x] **책별 내보내기**: 개별 책 다운로드/삭제 버튼.

## 5단계: Chrome API 연동 ✅ 완료
- [x] `chrome.storage.local`로 설정 저장.
- [x] `chrome.downloads` API 활용.
- [x] Background Service Worker 메시지 핸들링.
- [x] `chrome.sidePanel.open()`을 통한 사이드 패널 열기.
- [x] `chrome.sidePanel.setPanelBehavior()`을 통한 사이드 패널 토글.
- [x] `CLOSE_SIDEPANEL` 메시지로 사이드 패널 닫기.

## 6단계: 테스트 및 배포 ✅ 완료
- [x] 단위 테스트: Vitest + 27개 테스트 (2026-03-28)
- [x] E2E 테스트: 실제 위키독스 페이지에서 크롤링 검증.
- [x] 다양한 강좌 URL 테스트 (45개 챕터 성공).
- [x] 패키징 스크립트: `npm run pack`으로 ZIP 생성.

## 7단계: 모듈화 및 CLI ✅ 완료 (2026-03-28)
- [x] **타입 중앙화**: `src/types/index.ts`
- [x] **core 모듈**: markdown, scraper, image-handler, types
- [x] **adapters**: SiteAdapter 인터페이스, WikiDocs 어댑터
- [x] **exporters**: Exporter 인터페이스, Obsidian/Joplin/Markdown
- [x] **CLI 도구**: scrape, export 명령어
- [x] **테스트**: Vitest 설정 및 27개 테스트

## 7단계: 향후 기능 개발 🚀 향후 계획

### 기능 추가 제안 (Feature Enhancements)
자세한 내용은 [FEATURE_ENHANCEMENTS.md](./FEATURE_ENHANCEMENTS.md) 참조

#### 즉시 구현 (Immediate)
- API 키 암호화 저장
- Joplin 토큰 자동 갱신
- Obsidian 연결 유효성 검증
- 로컬 서버 접근 제한

#### 중장기 구현 (Medium-term)
- 챕터 선택 기능
- 이미지 다운로드 병렬 처리
- 실패 시 자동 재시도
- 환경 설정 공유

#### 고급 기능 (Advanced)
- GitHub Wiki 지원
- Notion API 연동
- 기능 플러그인 시스템
- CSV/Excel 형식 지원

### 보안 강화 제안 (Security Enhancements)
자세한 내용은 [FEATURE_ENHANCEMENTS.md](./FEATURE_ENHANCEMENTS.md) 참조

#### 기본 보안
- API 키 암호화
- 로컬 서버 접근 제한
- CORS 설정 보강

#### 고급 보안
- 이미지 데이터 암호화
- 비정상적 활동 감지
- 사용자 행동 로깅

## 완료된 주요 기능

### 스크래핑
- 전체 챕터 자동 수집 (위키독스 목차 기반)
- 순차 크롤링 (설정가능한 딜레이)
- 진행률 실시간 표시 (실행시간/예상총시간)
- 중단/재개 기능
- Cloudflare 보호 페이지 스킵
- `[[MARK]]` 마커 자동 제거

### 내보내기
- Obsidian: ZIP 파일 다운로드
- Joplin: Data API 연동
- YAML Frontmatter 지원
- 이미지 포함/제외 선택
- 인덱스 파일 생성
- **책별 개별 내보내기/삭제**

### UI
- 사이드 패널 (확장 프로그램 아이콘 클릭)
- 다크 테마
- 반응형 레이아웃
- 스크랩 딜레이 설정 (슬라이더)
- 책별 카드 UI

## 여러 책 관리
- [x] 여러 책 동시 저장 (`scrapedBooks` 배열)
- [x] 책별 개별 다운로드 버튼
- [x] 책별 개별 삭제 버튼
- [x] 동일한 제목의 책은 덮어쓰기

## 알려진 이슈 및 제한사항

1. **Joplin 내보내기**: Joplin 앱이 실행 중이어야 하며, Web Clipper가 활성화되어야 함
2. **Joplin CORS**: Background Script를 통해서만 API 호출 가능
3. **Content Script 제약**: `chrome.sidePanel` API 직접 호출 불가 (Background에서 처리)
4. **Cloudflare**: 요청 딜레이로 우회 가능

## 주요 기술 스택
- **언어**: TypeScript 5.x
- **빌드**: Vite 5 + @crxjs/vite-plugin
- **UI**: Vue 3 (Composition API) + TypeScript
- **마크다운**: turndown + turndown-plugin-gfm
- **압축**: JSZip (Obsidian 내보내기), Archiver (패키징)
- **Chrome API**: Manifest V3, chrome.sidePanel API
- **테스트**: Vitest + jsdom

## 프로젝트 파일 구조

```
src/
├── core/                       # 사이트 무관 공통 로직
│   ├── markdown.ts            # HTML → Markdown 변환
│   ├── image-handler.ts       # 이미지 처리
│   ├── scraper.ts             # 스크래핑 기본 로직
│   └── types.ts               # 코어 타입
│
├── adapters/                   # 사이트별 구현
│   ├── interface.ts           # SiteAdapter 인터페이스
│   └── wikidocs.ts            # WikiDocs 어댑터
│
├── exporters/                  # 내보내기
│   ├── interface.ts           # Exporter 인터페이스
│   ├── obsidian.ts            # Obsidian REST API
│   ├── joplin.ts              # Joplin Data API
│   ├── markdown.ts            # ZIP 다운로드
│   └── generators/
│       ├── base.ts            # sanitanizeFilename
│       ├── frontmatter.ts     # YAML/simple frontmatter
│       └── index.ts           # INDEX 생성
│
├── cli/                        # CLI 도구
│   ├── index.ts               # 엔트리 포인트
│   ├── options.ts             # 옵션 파서
│   └── commands/
│       ├── scrape.ts
│       └── export.ts
│
├── utils/                      # 유틸리티
│   ├── storage.ts             # Chrome Storage
│   ├── image-utils.ts         # 이미지 경로 처리
│   └── markdown.ts            # (legacy, core로 이동)
│
├── content/                    # Chrome Extension
│   └── content.ts             # 스크래핑 로직
│
├── background/
│   └── background.ts
│
├── side-panel/
│   ├── main.ts
│   ├── side-panel.ts
│   └── SidePanel.vue
│
└── types/
    └── index.ts               # 모든 타입 중앙화
```

## CLI 사용법

```bash
# 스크래핑
wikidocs-exporter scrape https://wikidocs.net/book/123

# 내보내기
wikidocs-exporter export --target=obsidian
wikidocs-exporter export --target=joplin
wikidocs-exporter export --target=markdown --include-images

# 테스트
npm test
npm run test:ui
```
