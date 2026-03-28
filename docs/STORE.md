# Chrome Web Store - 개인 정보 보호 관행 입력 자료

## 단일 목적
위키독스(https://wikidocs.net/) 웹사이트의 컨텐츠를 사용자의 로컬 노트 앱(Obsidian, Joplin)으로 내보내는 도구입니다. 별도의 서버나 클라우드 서비스 없이 동작하며, 모든 데이터는 사용자의 로컬 환경에서 처리됩니다.

---

## 권한별 사용 이유

### 호스트 권한
| 권한 | 이유 |
|------|------|
| `https://wikidocs.net/*` | 위키독스 웹페이지에서 챕터 제목, 본문, 이미지 등을 추출하기 위해 필요 |
| `http://localhost:41184` | Joplin 앱의 Web Clipper API에 연결하기 위해 필요 (로컬 통신) |

### 권한 (Permissions)
| 권한 | 이유 |
|------|------|
| `activeTab` | 현재 활성 탭의 위키독스 페이지 정보를 가져오기 위해 필요 |
| `storage` | 사용자 설정(내보내기 옵션, Joplin 토큰 등)을 로컬에 저장하기 위해 필요 |
| `downloads` | Obsidian으로 내보낼 때 ZIP 파일을 다운로드하기 위해 필요 |
| `clipboardWrite` | 클립보드 복사 기능 사용 (현재 미사용, 향후 기능 확장용) |
| `sidePanel` | 사이드 패널 UI를 표시하기 위해 필요 |
| `scripting` | 위키독스 페이지에 Content Script를 주입하여 데이터 추출하기 위해 필요 |

---

## 데이터 사용 인증

### 인증 문구
본 확장 프로그램은 다음과 같은 방식으로 데이터를 처리합니다:

1. **데이터 수집 없음**: 외부 서버로 데이터를 전송하거나 수집하지 않습니다.
2. **로컬 처리**: 모든 크롤링 및 변환 작업은 사용자의 로컬 환경에서 수행됩니다.
3. **타사 서비스 불필요**: Google, Microsoft, Dropbox 등 타사 클라우드 서비스를 사용하지 않습니다.
4. **오프라인 동작**: 네트워크 연결 없이도 기본 기능이 동작합니다 (Joplin 연동 제외).

### 개인 정보 보호 정책
- 사용자의 노트 앱(Obsidian/Joplin)으로 데이터를 내보내는 용도 외에는 사용하지 않습니다.
- 수집되는 정보: 위키독스 페이지의 제목, 본문, 이미지
- 저장 위치: Chrome 로컬 스토리지 (설정 정보만 저장)
- 데이터 공유: 외부와 공유하지 않습니다

---

## 참고 사항

### 단일 목적 설명 (영문)
WikiDocs Exporter is a Chrome extension that exports content from wikidocs.net to local note-taking apps (Obsidian or Joplin). All data processing happens locally on the user's device. No data is sent to external servers.

### 데이터 사용 인증 (영문)
This extension:
- Does not collect or transmit any user data to external servers
- Processes all data locally on the user's device
- Does not use any third-party cloud services
- Exports content only to the user's local note apps (Obsidian/Joplin)
