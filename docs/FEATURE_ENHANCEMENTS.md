# 기능 개선 및 보안 강화 제안

## 목차

1. [기능 추가 제안](#기능-추가-제안)
2. [보안 강화 제안](#보안-강화-제안)
3. [우선순위 계획](#우선순위-계획)
4. [구현 가이드](#구현-가이드)

---

## 기능 추가 제안

### 1. 사용자 경험 개선 (User Experience Enhancement)

#### 1.1 챕터 선택 기능 (Chapter Selection)
- **설명**: 책 전체가 아닌 특정 챕터만 선택해서 내보내기
- **혜택**: 불필요한 챕터 제외, 내보내기 속도 향상
- **구현 필요**:
  - 챕터 체크박스 UI 추가
  - 선택된 챕터만 내보내기 로직 구현

#### 1.2 책 검색/필터링 (Book Search & Filter)
- **설명**: 스크랩된 책 목록에서 제목으로 검색
- **혜택**: 많은 책을 관리할 때 필터링 용이
- **구현 필요**:
  - 검색 입력 필드 추가
  - 정규표현식 기반 검색 로직
  - 실시간 검색 UI

#### 1.3 실패 시 자동 재시도 (Auto Retry on Failure)
- **설명**: 내보내기 실패 시 1~2회 자동 재시도
- **혜택**: 네트워크 오류로 인한 실패 감소
- **구현 필요**:
  - 재시도 카운트 변수
  - 재시도 로직 구현
  - 최대 재시도 횟수 설정

#### 1.4 내보내기 완료 알림 (Export Completion Notification)
- **설명**: 내보내기 완료 시 음성 알림 또는 브라우저 알림
- **혜택**: 알림 없이 기다리지 않음
- **구현 필요**:
  - Notification API 활용
  - 음성 알림 오디오 파일
  - 설정 옵션 (알림 허용/거부)

### 2. 성능 최적화 (Performance Optimization)

#### 2.1 이미지 다운로드 병렬 처리 (Parallel Image Download)
- **설명**: 현재 순차 처리 -> 병렬 처리로 변경
- **혜택**: 전체 내보내기 시간 단축 (2~5배)
- **구현 필요**:
  ```typescript
  // 예시: Promise.all을 활용한 병렬 처리
  const imagePromises = chapters.flatMap(chapter =>
    chapter.images.map(img => downloadImage(img))
  );
  await Promise.all(imagePromises);
  ```
- **주의**: 서버 부하 감소를 위해 제한 병렬 처리

#### 2.2 메모리 관리 (Memory Management)
- **설명**: 대용량 이미지 처리 시 메모리 해제
- **혜택**: 메모리 과부하 방지
- **구현 필요**:
  - 이미지 Blob 해제
  - Base64 데이터 메모리 해제
  - Garbage Collection 유도

#### 2.3 Cloudflare 우회 강화 (Enhanced Cloudflare Bypass)
- **설명**: 시간 기반/횟수 기반 복합 딜레이 스케줄링
- **혜택**: 차단률 감소
- **구현 필요**:
  ```typescript
  // 예시: 랜덤 딜레이 + 제한 최대 딜레이
  const baseDelay = 2; // 최소 2초
  const randomDelay = Math.random() * 3; // 0~3초 랜덤
  const totalDelay = Math.min(baseDelay + randomDelay, 15); // 최대 15초
  ```
- **추가 기능**: 딜레이 시각적 표시

### 3. 지원 대상 확장 (Target Expansion)

#### 3.1 GitHub Wiki 지원 (GitHub Wiki Support)
- **설명**: GitHub 저장소의 Wiki 콘텐츠 수집
- **혜택**: 개발 문서 정리 용이
- **구현 필요**:
  - GitHub API 통합
  - Markdown 형식 검증
  - 깃 히스토리 연동

#### 3.2 Notion API 연동 (Notion API Integration)
- **설명**: Notion 노트북으로 내보내기
- **혜택**: Notion 사용자를 위한 내보내기
- **구현 필요**:
  ```typescript
  // Notion API 예시
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      title: { title: [{ text: { content: chapter.title } }] }
    },
    children: [{ type: 'paragraph', children: [{ text: chapter.content }] }]
  });
  ```

#### 3.3 Tistory Markdown 지원 (Tistory Markdown Support)
- **설명**: 블로그에서 Markdown 형식으로 글 저장
- **혜택**: 블로그 관리 자동화
- **구현 필요**:
  - Tistory API 연동
  - 이미지 업로드 처리
  - 카테고리 매핑

#### 3.4 CSV/Excel 형식 (CSV/Excel Format)
- **설명**: 엑셀에서 데이터 시트로 저장
- **혜택**: 데이터 분석 용이
- **구현 필요**:
  - SheetJS (xlsx) 라이브러리
  - CSV/Excel 형식 변환 로직
  - 문서 형식 설정 UI

### 4. 협업 기능 (Collaboration Features)

#### 4.1 환경 설정 공유 (Settings Synchronization)
- **설명**: 여러 기기의 설정 동기화
- **혜택**: 여러 PC에서 설정 유지
- **구현 필요**:
  - Chrome Sync API 활용
  - 설정 업데이트 감지
  - 충돌 해결 메커니즘

#### 4.2 내보내기 기록 저장 (Export History Storage)
- **설명**: 별도의 로컬 DB로 기록 유지
- **혜택**: 기록 추적 및 복원
- **구현 필요**:
  ```typescript
  interface ExportHistory {
    id: string;
    bookTitle: string;
    target: ExportTarget;
    exportTime: Date;
    chapterCount: number;
    imagePathCount: number;
    status: 'success' | 'failed';
    error?: string;
  }
  ```

#### 4.3 기능 플러그인 시스템 (Plugin System)
- **설명**: 확장 가능한 모듈 구조
- **혜택**: 사용자 정의 기능 확장
- **구현 필요**:
  ```typescript
  interface ExportPlugin {
    name: string;
    version: string;
    export: (book: WikiDocsBook, options: ExportOptions) => Promise<void>;
    validate: (config: any) => boolean;
  }
  ```

### 5. 운영 기능 (Operational Features)

#### 5.1 자동 업데이트 (Auto Update)
- **설명**: 새로운 위키독스 페이지 구조 변경 시 대응
- **혜택**: 사이트 변경에 유연하게 대응
- **구현 필요**:
  - 반복적인 페이지 구조 확인
  - selector 교체 로직
  - 업데이트 로그

#### 5.2 버전 관리 (Version Management)
- **설명**: 내보낸 내용의 버전 기록
- **혜택**: 변경 사항 추적
- **구현 필요**:
  - 내보내기 시각 기록
  - 내용 해시 계산
  - 버전 비교 UI

#### 5.3 메타데이터 분석 (Metadata Analysis)
- **설명**: 챕터/이미지 통계 제공
- **혜택**: 데이터 분석 용이
- **구현 필요**:
  - 통계 수집 로직
  - 차트/그래프 시각화
  - 내보내기 리포트 생성

---

## 보안 강화 제안 (Security Enhancements)

### 1. API 키 보안 (API Key Security)

#### 1.1 키 암호화 저장 (Key Encryption)
- **현재 상황**: chrome.storage.local에 평문 저장
- **보안 취약점**: 악성 확장 프로그램 감지 가능
- **개선 방안**:
  ```typescript
  // 암호화된 스토리지 사용
  const cryptoKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  async function encrypt(key: string): Promise<string> {
    const encoded = new TextEncoder().encode(key);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoded
    );
    return JSON.stringify({ iv: Array.from(iv), data: Array.from(encrypted) });
  }

  async function decrypt(encrypted: string): Promise<string> {
    const { iv, data } = JSON.parse(encrypted);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Uint8Array.from(iv) },
      cryptoKey,
      Uint8Array.from(data)
    );
    return new TextDecoder().decode(decrypted);
  }
  ```

#### 1.2 키 교환 방식 (Key Exchange)
- **설명**: 로컬 API 대신 토큰 교환 방식 사용
- **혜택**: 키 노출 위험 감소
- **구현 필요**:
  - 단일 사용자용 토큰 생성
  - 연결 별 토큰 관리
  - 토큰 만료 정책

#### 1.3 키 만료 정책 (Key Expiration Policy)
- **설명**: 설정된 기간 후 토큰 자동 갱신
- **혜택**: 만료된 키로 인한 오류 방지
- **구현 필요**:
  - 토큰 저장 시 유효기간 기록
  - 유효기간 초과 시 알림
  - 재연결 요청

### 2. 인증 및 접근 제어 (Authentication & Access Control)

#### 2.1 Joplin 토큰 자동 갱신 (Auto Joplin Token Renewal)
- **현재 상황**: 수동 토큰 갱신 필요
- **개선 방안**:
  ```typescript
  async function autoRenewJoplinToken(token: string): Promise<string> {
    const response = await fetch(`${JOPLIN_API_URL}/auth/check`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      // 토큰 만료 -> 재인증
      return await getJoplinTokenWithApproval();
    }

    return token;
  }
  ```

#### 2.2 Obsidian 연결 유효성 검증 (Obsidian Connection Validation)
- **설명**: 주기적으로 연결 상태 점검
- **혜택**: 연결 끊김 감지
- **구현 필요**:
  - 5분마다 연결 상태 확인
  - 연결 끊김 시 알림
  - 자동 재연결 시도

#### 2.3 세션 관리 (Session Management)
- **설명**: 인증 세션 관리
- **혜택**: 보안된 세션 사용
- **구현 필요**:
  - 세션 만료 시간 설정
  - 비활성화 시 로그아웃
  - 활동 로깅

### 3. HTTPS 및 안전한 통신 (HTTPS & Secure Communication)

#### 3.1 HTTPS 강제 사용 (Force HTTPS)
- **설명**: 모든 HTTP 연결을 HTTPS로 변경
- **혜택**: 통신 암호화
- **구현 필요**:
  - manifest.json 호스트 권한 업데이트
  - HTTP 리다이렉트 로직
  - SSL/TLS 검증 강화

#### 3.2 로컬 서버 접근 제한 (Local Server Access Control)
- **설명**: Joplin/Obsidian 로컬 서버 접근 제한
- **혜택**: 악의적인 외부 접근 차단
- **구현 필요**:
  ```typescript
  // IP 기반 접근 제한
  async function validateLocalConnection(serverUrl: string): Promise<boolean> {
    const hostname = new URL(serverUrl).hostname;

    // localhost만 허용
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return false;
    }

    // 포트 검증
    const port = new URL(serverUrl).port;
    if (port !== '27123' && port !== '41184') {
      return false;
    }

    return true;
  }
  ```

#### 3.3 CORS 설정 보강 (Enhanced CORS Configuration)
- **설명**: 명시적 CORS 허용 목록
- **혜택**: 안전한 데이터 교환
- **구현 필요**:
  - 허용 목록 관리
  - Origin 검증 로직
  - 에러 로깅

### 4. 데이터 보호 (Data Protection)

#### 4.1 이미지 데이터 암호화 (Image Data Encryption)
- **설명**: 내보내기된 이미지 암호화
- **혜택**: 민감 데이터 보호
- **구현 필요**:
  ```typescript
  async function encryptImageData(imageData: string): Promise<string> {
    const password = generateSecurePassword();
    // AES-GCM으로 이미지 암호화
    return password; // 패스워드로 관리
  }
  ```

#### 4.2 내보내기된 파일 암호화 옵션 (Password Protection)
- **설명**: 내보내기 시 암호화 패스워드 설정
- **혜택**: 파일 탈취 방지
- **구현 필요**:
  - 패스워드 입력 UI
  - 강력한 암호화 알고리즘 사용
  - 패스워드 힌트 기능

#### 4.3 스크랩 데이터 지역적 저장 제한 (Local Storage Limitation)
- **설명**: 스크랩 데이터 저장 크기 제한
- **혜택**: 메모리 과부하 방지
- **구현 필요**:
  - 저장 크기 측정
  - 최대 크기 설정 (10MB 등)
  - 오래된 데이터 삭제

### 5. 로그 및 감사 (Logging & Auditing)

#### 5.1 사용자 행동 로깅 (User Behavior Logging)
- **설명**: 스크랩 및 내보내기 활동 기록
- **혜택**: 추적 및 문제 분석
- **구현 필요**:
  ```typescript
  interface ActivityLog {
    timestamp: Date;
    action: 'scrape' | 'export' | 'delete' | 'settings';
    target: string;
    details?: any;
  }

  async function logActivity(log: ActivityLog): Promise<void> {
    // 로컬 DB에 기록
    // 개인 정보는 제외
  }
  ```

#### 5.2 내보내기 이력 추적 (Export History Tracking)
- **설명**: 내보내기 이력 DB 저장
- **혜택**: 기록 조회 및 복원
- **구현 필요**:
  - 내보내기 완료/실패 기록
  - 에러 상세 정보 저장
  - 이력 삭제 옵션

#### 5.3 예외 상황 로그 기록 (Exception Logging)
- **설명**: 에러 상황 상세 기록
- **혜택**: 버그 추적 및 디버깅
- **구현 필요**:
  - 에러 스택 추적
  - 타임스탬프 기록
  - 원격 로그 전송 옵션

### 6. 권한 관리 (Permission Management)

#### 6.1 Script 모델 활용 (Script Injection Control)
- **현재 상황**: 동적 스크립트 주입
- **개선 방안**: Manifest V3 script 모델 활용
- **구현 필요**:
  ```json
  {
    "background": {
      "service_worker": "src/background/background.ts",
      "type": "module"
    },
    "content_scripts": [
      {
        "matches": ["https://wikidocs.net/*"],
        "js": ["src/content/content.ts"],
        "run_at": "document_idle"
      }
    ],
    "host_permissions": [
      "https://wikidocs.net/*",
      "http://127.0.0.1:27123",
      "http://localhost:41184"
    ]
  }
  ```

#### 6.2 비정상적 활동 감지 (Abnormal Activity Detection)
- **설명**: 의심스러운 활동 감지 및 경고
- **혜택**: 보안 이슈 조기 발견
- **구현 필요**:
  - 빈도 높은 스크랩 감지
  - 동시 다중 탭 스크랩 방지
  - IP 주소 변동 감지

#### 6.3 사이드 패널 접근 제어 (Side Panel Access Control)
- **설명**: 사이드 패널 접근 권한 관리
- **혜택**: 권한 남용 방지
- **구현 필요**:
  - 접근 권한 확인
  - 사용자 동의 필요 시
  - 접근 로그 기록

---

## 우선순위 계획 (Priority Plan)

### 🥇 즉시 구현 (Immediate Implementation)

| 항목 | 우선순위 | 예상 난이도 | 구현 기간 | 보안 영향 |
|------|----------|-------------|----------|-----------|
| API 키 암호화 저장 | P0 | 중 | 3~5일 | ★★★★★ |
| Joplin 토큰 자동 갱신 | P0 | 중 | 2~3일 | ★★★★★ |
| Obsidian 연결 유효성 검증 | P0 | 저 | 1~2일 | ★★★★☆ |
| 로컬 서버 접근 제한 | P0 | 저 | 1일 | ★★★★☆ |

### 🥈 중장기 구현 (Medium-term Implementation)

| 항목 | 우선순위 | 예상 난이도 | 구현 기간 | 성능 영향 |
|------|----------|-------------|----------|----------|
| 챕터 선택 기능 | P1 | 중 | 3~5일 | ★★★☆☆ |
| 이미지 다운로드 병렬 처리 | P1 | 중 | 3~4일 | ★★★★★ |
| 실패 시 자동 재시도 | P1 | 저 | 1~2일 | ★★☆☆☆ |
| 환경 설정 공유 | P1 | 저 | 2~3일 | ★☆☆☆☆ |

### 🥉 고급 기능 (Advanced Features)

| 항목 | 우선순위 | 예상 난이도 | 구현 기간 | 확장성 |
|------|----------|-------------|----------|--------|
| GitHub Wiki 지원 | P2 | 고 | 5~7일 | ★★★★★ |
| Notion API 연동 | P2 | 고 | 5~7일 | ★★★★☆ |
| 기능 플러그인 시스템 | P2 | 고 | 7~10일 | ★★★★★ |
| CSV/Excel 형식 | P2 | 중 | 2~3일 | ★★★☆☆ |

### 💡 챌린지 기능 (Challenge Features)

| 항목 | 우선순위 | 예상 난이도 | 구현 기간 |
|------|----------|-------------|----------|
| 자동 업데이트 (Site Monitor) | P3 | 중 | 4~6일 |
| 버전 관리 시스템 | P3 | 중 | 3~5일 |
| 메타데이터 분석 UI | P3 | 중 | 3~4일 |

---

## 구현 가이드 (Implementation Guide)

### 빌드 및 테스트 절차

#### 1. API 키 암호화 구현 시
```bash
# 단위 테스트 작성
npm test -- src/utils/crypto.test.ts

# 암호화 기능 테스트
npm run typecheck

# 업데이트 브랜치 생성
git checkout -b feature/encryption
```

#### 2. 성능 최적화 구현 시
```bash
# 성능 측정 도구 활용
npm install --save-dev @perf-profiler/profiler

# 병렬 처리 성능 비교
node scripts/compare-parallel.js

# 메모리 사용량 측정
node scripts/memory-check.js
```

#### 3. 보안 강화 확인 시
```bash
# 정적 분석 도구 실행
npm run typecheck

# Linter 실행
npm run lint

# 보안 스캔
npm audit
```

### 코드 품질 가이드

#### 1. 보안 코드 작성
```typescript
// ✅ 좋은 예: 암호화된 저장
async function saveEncryptedKey(key: string): Promise<void> {
  const encrypted = await encrypt(key);
  await chrome.storage.local.set({ api_key: encrypted });
}

// ❌ 나쁜 예: 평문 저장
chrome.storage.local.set({ api_key: key });
```

#### 2. 에러 처리
```typescript
async function exportBook(book: WikiDocsBook) {
  try {
    // 내보내기 로직
  } catch (error) {
    // 로깅 후 사용자에게 상세 정보 제공
    console.error('Export failed:', error);
    throw new Error(`내보내기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}
```

#### 3. 타입 안전성
```typescript
// 모든 함수에 타입 정의
async function doExport(
  book: WikiDocsBook,
  options: ExportOptions
): Promise<void> {
  // 타입 검증
  if (!book || !book.chapters || !Array.isArray(book.chapters)) {
    throw new Error('Invalid book data');
  }
}
```

### 테스트 전략

#### 1. 단위 테스트 (Unit Tests)
```typescript
// src/utils/crypto.test.ts
describe('Encryption', () => {
  test('encrypt and decrypt return same value', async () => {
    const key = 'test-secret-key';
    const encrypted = await encrypt(key);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(key);
  });
});
```

#### 2. 통합 테스트 (Integration Tests)
```typescript
// src/integration/export.test.ts
describe('Export Flow', () => {
  test('complete export to Obsidian', async () => {
    const book = createTestBook();
    await exportToObsidian(book, validOptions);

    // 결과 검증
    const files = await checkObsidianFiles(book.title);
    expect(files).toHaveLength(book.chapters.length);
  });
});
```

#### 3. E2E 테스트 (End-to-End Tests)
```typescript
// e2e.spec.ts
describe('E2E Test', () => {
  test('scrape and export workflow', async () => {
    // 위키독스 페이지 열기
    await page.goto('https://wikidocs.net/book/12345');

    // 스크랩 실행
    await page.click('#scrape-button');

    // 완료 대기
    await waitForCompletion();

    // 결과 검증
    const books = await getStoredBooks();
    expect(books.length).toBeGreaterThan(0);
  });
});
```

### 배포 프로세스

#### 1. 배포 전 확인사항
- [ ] 모든 테스트 통과
- [ ] 타입 체크 완료
- [ ] 보안 스캔 통과
- [ ] 문서 업데이트

#### 2. 버전 관리
```bash
# 마이너 버전 업데이트 (새 기능)
git tag -a v1.3.0 -m "Add chapter selection and auto-retry"

# 마이너 버전 업데이트 (버그 수정)
git tag -a v1.2.1 -m "Fix encryption issue"

# 패치 버전 업데이트 (작은 수정)
git tag -a v1.2.0 -m "Performance optimization"
```

#### 3. 배포 스크립트
```bash
#!/bin/bash
# deploy.sh

# 1. 빌드
npm run build

# 2. 패키징
npm run pack

# 3. 테스트 실행
npm test

# 4. 버전 업데이트
npm version patch

# 5. 배포 (Chrome Web Store)
# 1. chrome://extensions에서 압축 해제된 폴더 선택
# 2. 업데이트 버튼 클릭
```

---

## 참고 자료 (References)

### 보안 모범 사례
- [OWASP Mobile Security Testing Guide](https://owasp.org/www-project-mobile-security-testing-guide/)
- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Cryptography API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Crypto_API)

### 성능 최적화
- [Chrome Extension Performance](https://developer.chrome.com/docs/extensions/mv3/performance/)
- [JavaScript Parallel Processing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Parallel programming)

### 테스트 프레임워크
- [Vitest Documentation](https://vitest.dev/)
- [Playwright for Extensions](https://playwright.dev/docs/extensions)

---

**마지막 업데이트**: 2026-03-28
**작성자**: OpenCode AI
**버전**: 1.0.0