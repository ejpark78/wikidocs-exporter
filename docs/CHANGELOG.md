# 변경 로그 (Changelog)

모든 주요 변경 사항은 이 파일에 기록됩니다.

## [1.2.2] - 2026-03-28

### 수정
- **책 목록 저장 문제**: storage가 비어있을 때 scrapedBooks 초기화 문제 수정
- **이미지 저장 문제**: 이미지 base64 데이터로 인한 quota 초과 문제 해결
  - 스크랩 시 이미지 URL만 저장
  - 내보내기 시 다시 이미지를 가져와서 포함
- **Obsidian HTTPS 지원**: HTTPS 옵션 추가 (Local REST API SSL/TLS 활성화 시 사용)
- **이미지 경로 변환**: Obsidian/Joplin 내보내 시 상대 경로(../images/)를 전체 URL로 변환
- **비동기 메시지 처리**: 메시지 채널 에러 수정

### 추가
- **Obsidian HTTPS 옵션**: 사이드 패널에 "HTTPS 사용" 체크박스 추가

### 개선
- 기능 개선 및 보안 강화 오픈 이슈 추적

### 문서
- **기능 개선 제안 문서**: FEATURE_ENHANCEMENTS.md 문서 작성
- **PLAN.md 업데이트**: 향후 기능 개발 계획 섹션 추가
- **opencode.json**: 프로젝트 설정 파일 생성

## [1.2.0] - 2026-03-27

### 추가
- **Joplin 자동 토큰 획득**: 비밀번호 없이 사용자 승인 방식으로 토큰 자동 획득
  - `POST /auth` → 사용자 승인 대기 → `GET /auth/check` 폴링
  - Joplin Web Clipper와 동일한 방식
  - 연결 해제 기능
- **Chrome Web Store 자동 배포**: GitHub Actions로 Release 시 자동 업로드
- **Chrome Web Store 등록 자료**: STORE.md 가이드문서 생성
- **프로모션 템플릿**: assets/promo-template.html 프로모션 타일/스크린샷 레이아웃

### 변경
- Joplin 연동 UI 개선: 직접 입력 방식 → 한 번의 클릭으로 자동 연결

## [1.1.0] - 2026-03-27

### 변경
- **사이드 패널 UI를 Vanilla TS에서 Vue 3로 마이그레이션**
  - Vue 3 Composition API (`<script setup lang="ts">`) 사용
  - 반응형 상태 관리로 코드 간소화
  - `ref`, `computed`, `watch`, lifecycle hooks 활용

### 추가
- Vue 3 의존성: `vue`, `@vue/compiler-sfc`, `vue-loader`

## [1.0.1] - 2026-03-26

### 추가
- **사이드 패널 토글**: 확장 아이콘 클릭으로 열기/닫기 전환

### 수정
- **패키징 스크립트**: `npm run pack`으로 ZIP 파일 생성

## [1.0.0] - 2026-03-26

### 추가
- **전체 챕터 크롤링**: 위키독스 책의 모든 챕터 자동 수집
- **여러 책 동시 관리**: 여러 책을 한 번에 스크랩하고 개별 관리
- **실시간 진행률 표시**: 실행시간/예상총시간 표시
- **스크랩 중단 기능**: 언제든지 크롤링 중단 가능
- **스크랩 딜레이 설정**: 0~15초 슬라이더로 조절
- **책별 내보내기**: 개별 책 다운로드/삭제 버튼
- **책별 카드 UI**: 깔끔한 카드 형태의 결과 표시
- **Joplin API 연동**: Background Script를 통한 CORS 우회
- **YAML Frontmatter**: Obsidian 친화적 메타데이터
- **이미지 포함 내보내기**: 상대 경로 자동 처리
- **인덱스 파일 생성**: 챕터별 위키링크 포함
- **[[MARK]] 마커 제거**: 코드블럭 내 마커 자동 제거
- **중국어/한자 정리**: 불필요한 한자 자동 정리

### 수정
- **다크 테마 UI**: 시각적으로 깔끔한 다크 모드
- **반응형 레이아웃**: 100% 너비, 최대 400px
- **Cloudflare 우회**: 딜레이를 통한 보호 우회

### 제거
- ~~전체 내보내기 버튼~~ → 개별 책 내보내기로 변경
- ~~팝업 UI~~ → 사이드 패널로 변경

## 기술 스택

- TypeScript 5.x
- Vue 3 (Composition API)
- Webpack 5
- turndown + turndown-plugin-gfm
- JSZip
- Chrome Manifest V3
- chrome.sidePanel API
