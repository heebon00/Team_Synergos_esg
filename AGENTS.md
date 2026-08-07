# AI Agent Harness Specification (AGENTS.md)

이 문서는 AI 에이전트(LLM)가 본 프로젝트(`Team_Synergos_esg`)를 안전하고 효율적으로 이해, 수정 및 관리할 수 있도록 설계된 하네스 엔지니어링 파일 관리 규칙입니다. 에이전트는 작업을 시작하기 전 반드시 이 규칙을 준수해야 합니다.

## 1. 프로젝트 폴더 상태 분석 (Current Directory Analysis)

현재 프로젝트의 구조는 다음과 같이 구성되어 있습니다:
- **`index.html`**: 단일 모놀리식 HTML 파일 (약 958라인, 49KB). Tailwind CSS v4 CDN 및 Swiper v12를 사용하며, 대화형 UI 요소들이 집약되어 있음.
- **`assets/`**: 이미지 및 아이콘 자원 폴더. 파일 유형 및 역할에 따라 엄격한 접두사 규칙이 적용되어 있음.
- **`README.md`**: 프로젝트 참여 팀원 명단.
- **`work.md`**: 작업 지시 및 작업 상태 기록용 파일.
- **`AGENTS.md`** (본 문서): AI 에이전트 실행 및 파일 관리 하네스 규칙.

---

## 2. 파일 및 파일명 명명 규칙 (Naming Conventions)

에이전트가 새로운 리소스를 생성하거나 기존 리소스를 변경할 때 다음 접두사 및 매칭 규칙을 준수합니다.

### 2.1. 이미지 및 에셋 (`assets/` 폴더)
| 에셋 유형 | 접두사 규칙 | 예시 | 설명 |
| :--- | :--- | :--- | :--- |
| 카테고리 썸네일 | `cat-[공간명].[확장자]` | `cat-living.png`, `cat-bedroom.png` | 공간별 쇼핑 카테고리에 사용되는 썸네일 이미지 |
| 히어로 배너 | `hero-[공간명].[확장자]` | `hero-living.png`, `hero-office.png` | 메인 비주얼 슬라이더나 배너에 사용되는 배경 이미지 |
| 제품 이미지 | `p-[제품명].[확장자]` | `p-bekant.png`, `p-kivik.png` | 상품 카드 및 상세 정보에 노출되는 제품 단독 이미지 |
| 아이콘 | `ic-[아이콘명].[확장자]` | `ic-bag.svg`, `ic-heart.svg` | SVG 형식의 시스템 아이콘 |
| 로고 | `logo-[로고명].[확장자]` | `logo-a.svg`, `logo-b.svg` | 로고 이미지 (SVG 권장) |

### 2.2. 코드 및 컴포넌트 파일 (추후 분할 시)
- **HTML/JS/CSS 역할 분리**: 모놀리식 구조인 `index.html`이 1,500라인 이상으로 비대해지거나 복잡도가 올라갈 경우, 코드 분할 규칙을 따릅니다.
  - 스타일 분리: `css/index.css` (Tailwind 전용 커스텀 스타일)
  - 스크립트 분리: `js/main.js` (Swiper 연동 및 UI 인터랙션 로직)
- **컴포넌트 단위 관리**: 필요시 `components/[component-name].html`로 분리하여 관리하고 빌드/렌더링 시 결합합니다.

### 2.3. 작업 상태 및 지시서 파일
- **`work.md`**: 에이전트의 메인 작업 로드맵 및 백로그. 작업이 수행됨에 따라 에이전트는 완료된 작업을 기록하고 다음 단계를 갱신해야 합니다.

---

## 3. 에이전트 안전 제어 및 코드 수정 규칙 (Agent Safety & Editing Rules)

대용량 HTML 파일을 직접 수정할 때 발생할 수 있는 에러(구문 손실, 덮어쓰기 오류 등)를 방지하기 위한 하네스 안전 수칙입니다.

### 3.1. 모놀리식 HTML 제어 (Anchor Commenting)
`index.html`의 각 주요 영역은 다음과 같은 주석 태그를 기준선(Anchor)으로 삼아 편집합니다. 에이전트는 코드를 교체할 때 이 주석 영역을 타겟팅해야 합니다.
```html
<!-- SEGMENT: [영역명] -->
... 해당 영역 코드 ...
<!-- /SEGMENT: [영역명] -->
```
*예시 영역:* `Header`, `UtilityNav`, `HeroSlider`, `CategoryList`, `ProductSlider`, `Footer`

### 3.2. 부분 수정 원칙 (No Full Overwrites)
- 900라인이 넘는 HTML 파일을 전체 덮어쓰는 `write_to_file` 작업은 절대로 수행하지 않습니다.
- 반드시 변경할 일부분만 지정하여 교체하는 `replace_file_content` 또는 `multi_replace_file_content` 도구를 사용합니다.

### 3.3. 기술 스택 제한 준수
- **CSS**: Tailwind CSS v4 `@theme` 커스텀을 사용합니다. 인라인 스타일을 지양하고 Utility 클래스를 조화롭게 사용합니다.
- **JS**: Vanilla JS를 사용하며, 외부 라이브러리 추가 도입 시에는 먼저 검토해야 합니다.
- **인코딩**: 모든 텍스트 및 HTML 파일은 `UTF-8` 형식을 준수해야 하며, 한국어 주석과 레이블이 깨지지 않도록 주의합니다.
