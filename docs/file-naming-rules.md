# 파일 & 파일명 관리 규칙

5인 팀이 같은 저장소에서 동시에 작업할 때 파일 위치와 이름만 보고도 내용을 예측할 수 있도록 하기 위한 규칙이다. 확장 방향(페이지 추가 여부, 빌드 도구 도입 여부)이 아직 정해지지 않았으므로, **지금 구조를 정리하는 규칙**과 **나중에 조건이 바뀌면 적용할 규칙**을 나눠서 정의한다.

## 1. 최상위 구조 원칙

- 루트에는 진입점(`index.html`)과 팀 문서(`README.md`)만 둔다. 코드와 무관한 개인 작업 메모(`work.md` 같은 파일)는 `docs/notes/`로 옮기는 걸 권장한다.
- 정적 리소스는 전부 `assets/` 아래에만 둔다. 코드 파일과 이미지를 같은 폴더에 섞지 않는다.
- 팀 전체가 참고하는 규칙 문서는 `docs/`에 모은다 (이 문서 포함).

```
Team_Synergos_esg/
├── index.html
├── README.md
├── docs/
│   └── file-naming-rules.md
└── assets/
    ├── icons/
    ├── logos/
    └── images/
        ├── hero/
        ├── categories/
        └── products/
```

## 2. assets 하위 구조

지금까지는 `assets/` 안에 `cat-`, `hero-`, `ic-`, `logo-`, `p-` 접두사로 타입을 구분해왔다. 파일 수가 늘어나며 이 방식은 한 폴더 안에서 관리하기 어려워지므로, **폴더로 타입을 분리**하고 파일명에서는 접두사를 없앤다.

| 기존 접두사 | 의미 | 새 폴더 |
|---|---|---|
| `cat-*` | 공간별 카테고리 썸네일 | `assets/images/categories/` |
| `hero-*` | 섹션 상단 히어로 배너 | `assets/images/hero/` |
| `p-*` | 상품 이미지 | `assets/images/products/` |
| `ic-*` | UI 아이콘(검색/장바구니 등) | `assets/icons/` |
| `logo-*` | 브랜드 로고 | `assets/logos/` |

폴더가 이미 유형을 나타내므로 파일명 안에서는 유형 접두사를 반복하지 않는다.

```
assets/images/categories/bedroom.png   (구 cat-bedroom.png)
assets/images/hero/bedroom.png         (구 hero-bedroom.png)
assets/images/products/malm.png        (구 p-malm.png)
assets/icons/search.svg                (구 ic-search.svg)
```

> `logo-a.svg` / `logo-b.svg` / `logo-c.svg`는 파일명만으로 용도(심볼/워드마크/조합형 등)를 알 수 없다. 실제 용도를 아는 팀원이 확인해서 의미 있는 이름(예: `logo-symbol.svg`, `logo-wordmark.svg`)으로 바꾸는 걸 액션 아이템으로 남겨둔다.

## 3. 파일명 규칙 (공통)

- **영문 소문자 + 하이픈(kebab-case)**. 띄어쓰기, 대문자, 언더스코어(`_`) 금지.
  - 좋음: `hero-living.png`, `product-card.js`
  - 나쁨: `Hero_Living.PNG`, `product card.js`
- 이름은 **내용을 설명**해야 한다. 폴더가 타입을 말해주므로 파일명은 "무엇인지"에 집중한다 (`bedroom.png`), 버전이나 임시 표시(`final`, `v2`, `new`, `copy`)는 쓰지 않는다 — 버전 관리는 git이 한다.
- 확장자
  - 사진형 이미지: `.png` 유지 (용량이 문제되면 추후 `.webp` 전환 검토)
  - 아이콘/로고처럼 벡터인 것: `.svg` 유지

## 4. 코드 파일 규칙

- 지금은 `index.html` 단일 페이지 구조를 유지한다. 팀원별로 담당 공간(거실/침실 등) 페이지를 별도 파일로 분리하게 되면:
  - `pages/` 폴더를 새로 만들고 `pages/living-room.html`처럼 kebab-case로 이름 짓는다.
  - 이 시점부터는 라우팅/공통 헤더 처리 방식을 별도로 논의해야 한다.
- 빌드 도구(Vite 등) 도입 여부는 미정이다. 도입하게 되면:
  - 편집 원본은 `src/`, 빌드 산출물은 `dist/`(이미 `.gitignore`에 포함됨)로 분리한다.
  - 그 전까지는 지금처럼 CDN 기반 순수 HTML/CSS/JS를 루트에 직접 둔다.

## 5. 지금 적용 대상 (액션 아이템)

1. `assets/` 아래에 `icons/`, `logos/`, `images/{hero,categories,products}/` 폴더 생성
2. 기존 41개 파일을 규칙에 맞게 이동 + 접두사 제거하며 리네임
3. `index.html`의 모든 `assets/...` 경로를 새 경로로 업데이트 (총 41곳)
4. `logo-a/b/c.svg`는 팀 확인 후 의미 있는 이름으로 추가 리네임
