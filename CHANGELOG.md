# 변경 로그 (Changelog)

모든 주요 변경 사항은 이 파일에 기록됩니다.

## [1.2.1] - 2026-03-27

### 수정
- **현재 페이지 정보 업데이트**: URL 변경 시 페이지 제목/URL이 실시간으로 업데이트되도록 수정

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
