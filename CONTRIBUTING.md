# 기여 가이드 (Contributing)

WikiDocs Exporter에 기여해 주셔서 감사합니다!

## 개발 환경 설정

### 필수要件

- Node.js 18+
- npm 9+
- Chrome Browser (개발용)

### 시작하기

1. 저장소 클론
```bash
git clone <repository-url>
cd wikidocs-exporter
```

2. 의존성 설치
```bash
npm install
```

3. 개발 모드로 실행
```bash
npm run dev
```

4. Chrome에 확장 프로그램 로드
   - `chrome://extensions` 열기
   - **개발자 모드** 활성화
   - **압축해제된 확장 프로그램 로드** 클릭
   - `dist` 폴더 선택

## 코드 스타일

### TypeScript

- ESLint 규칙 준수
- strict 모드 활성화
- 모든 함수에 타입 명시

### 예시

```typescript
// ✅ 좋은 예시
function scrapeChapter(url: string): Promise<WikiDocsChapter | null> {
  // ...
}

// ❌ 피해야 할 예시
function scrapeChapter(url) {
  // ...
}
```

### 네이밍 컨벤션

- 함수/변수: camelCase
- 인터페이스: PascalCase
- 상수: UPPER_SNAKE_CASE
- 파일: kebab-case

## Pull Request 절차

1. 브랜치 생성
```bash
git checkout -b feature/기능이름
```

2. 변경사항 작성
```bash
git add .
git commit -m "feat: 새로운 기능 추가"
```

3. 푸시 및 PR 생성
```bash
git push origin feature/기능이름
```

## 커밋 메시지 규칙

```
type: description

types:
- feat: 새 기능
- fix: 버그 수정
- docs: 문서 변경
- style: 코드 스타일 변경 (기능 변경 없음)
- refactor: 코드 리팩토링
- perf: 성능 개선
- test: 테스트 관련
- chore: 빌드/패키지 매니저 변경
```

## 테스트

### 수동 테스트 체크리스트

- [ ] 위키독스 페이지에서 스크랩 정상 동작
- [ ] 모든 챕터 수집 완료
- [ ] 이미지 다운로드 정상
- [ ] Obsidian 내보내기 정상
- [ ] Joplin 내보내기 정상
- [ ] 여러 책 동시 관리 정상
- [ ] 개별 책 삭제 정상

## 질문이 있으시면?

- GitHub Issues에 질문 등록
- 버그는 상세한 재현 방법과 함께 등록

감사합니다! 🎉
