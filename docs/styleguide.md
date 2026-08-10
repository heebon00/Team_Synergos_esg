# 디자인 토큰·컴포넌트 규칙 (Design System Styleguide)

본 문서는 `Team_Synergos_esg` 프로젝트의 디자인 토큰 및 컴포넌트 표준 명세서입니다. 모든 시각 속성은 이 규칙을 따르며 `assets/css/tokens.css`의 토큰을 100% 참조합니다.

---

## 1. Color Tokens (색상)

| 토큰명 | CSS 변수명 | 값 | 용도 / 설명 |
|---|---|---|---|
| **Brand Primary** | `--color-brand` | `#0051BA` | IKEA 시그니처 블루, 주요 버튼 및 강조 링크 |
| **Brand Dark** | `--color-brand-dark` | `#003D8F` | 버튼 호버 및 인터랙션 액티브 상태 |
| **Accent** | `--color-accent` | `#FFC900` | IKEA 시그니처 옐로우, 프로모션 뱃지 및 CTA |
| **Link** | `--color-link` | `#0058A3` | 텍스트 링크 및 네비게이션 포커스 |
| **Ink** | `--color-ink` | `#111418` | 기본 본문 텍스트 및 헤딩 |
| **Ink-2** | `--color-ink-2` | `#3D4450` | 보조 본문 텍스트, 카드 설명 |
| **Ink-3** | `--color-ink-3` | `#6B7280` | 부가 설명, 카운트 텍스트 |
| **Price** | `--color-price` | `#1A1A1A` | 상품 가격 폰트 색상 |
| **Line** | `--color-line` | `#C5CCD6` | 기본 컨테이너 테두리 |
| **Line-2** | `--color-line-2` | `#D1D5DB` | 썸네일 및 보조 테두리 |
| **Line Light** | `--color-line-light` | `#E6E6E6` | 구분선 및 헤더/푸터 경계선 |
| **Hairline** | `--color-hair` / `--color-hairline` | `#F0F0F0` / `#F1F3F5` | 얇은 카드 경계선 |
| **Background Light** | `--color-bg-light` | `#F8F9FA` | 유틸리티 네비 및 푸터 배경 |
| **Shell** | `--color-shell` | `#F8F9FA` | 섹션 배너 및 프로모션 박스 배경 |
| **Navy** | `--color-navy` | `#1E3A8A` | 프로모션 태그 배경 |

---

## 2. Typography & Font (타이포그래피)

- **기본 글꼴**: `Pretendard`, `"Pretendard Variable"`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **폰트 파일**: `./assets/fonts/pretendard.css`

---

## 3. Spacing & Container Tokens (간격 및 크기)

| 토큰명 | CSS 변수명 | 값 | 적용 클래스 |
|---|---|---|---|
| **Max Container** | `--spacing-container` | `1280px` | `max-w-container` |
| **Mobile Container** | `--container-mobile` | `640px` | `max-w-container-mobile` |
| **Promo Max** | `--spacing-promo-max` | `760px` | `max-w-promo-max` |
| **Hero Image Height** | `--spacing-hero-img` | `260px` | `h-hero-img` |
| **Card Image Height** | `--spacing-card-img` | `200px` | `h-card-img` |
| **Card Min Height** | `--spacing-card-min` | `340px` | `min-h-card-min` |
| **Hero Column Width** | `--spacing-hero-col` | `420px` | `w-hero-col` |
| **Logo Width** | `--spacing-logo` | `98px` | `w-logo` |
| **Search Max Width** | `--spacing-search` | `320px` | `max-w-search` |

---

## 4. Radius & Shadow Tokens (곡률 및 그림자)

| 토큰명 | CSS 변수명 | 값 | 적용 클래스 |
|---|---|---|---|
| **Radius Small** | `--radius-sm` | `4px` | `rounded-sm` |
| **Radius Medium** | `--radius-md` | `8px` | `rounded-md` |
| **Radius Card** | `--radius-card` | `12px` | `rounded-card` / `rounded-xl` |
| **Radius Pill** | `--radius-pill` | `20px` | `rounded-pill` |
| **Shadow Card** | `--shadow-card` | `0 2px 8px rgba(0,0,0,0.1)` | `shadow-card` |
| **Shadow Card Hover**| `--shadow-card-hover` | `0 14px 30px rgba(0,0,0,0.14)` | `shadow-card-hover` |

---

## 5. Component Patterns (컴포넌트 패턴)

1. **Header & Navigation**: 유틸리티 바(1280px), 브랜드 로고, GNB 네비게이션, 검색창(320px), 사용자 인터랙션 아이콘(마이페이지/위시리스트/장바구니), 반응형 모바일 드롭다운 메뉴.
2. **Category Swiper**: 원형 썸네일(80x80px, `rounded-pill`), 공간별 카테고리 10종 수평 캐로셀.
3. **Showroom Section**: 좌측 420px 히어로 쇼룸 배너 + 우측 매칭 추천 상품 Swiper 캐로셀 (KIVIK, STOCKHOLM, MALM, NORDLI 등).
4. **Product Card**: 이미지(200px), 상품명, 서브 설명, 가격, 구매하기 버튼(`buy`), 호버 시 `shadow-card-hover` 및 줌 인터랙션.
5. **Promotion Banner**: 3D 홈퍼니싱 시뮬레이션 예약 배너 및 액션 버튼.
6. **Footer**: 4열 그리드 레이아웃, 서비스 링크, 고객센터 직통 전화번호, SNS 링크, 저작권 및 약관.
