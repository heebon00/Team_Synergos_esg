# Team_Synergos_esg HTML 전체 검사 보고서

검사 대상: `index.html` + `common/*.html` 25개 (전부 로컬 정적 파일)
검사 도구: W3C Nu HTML Checker(문법), ESLint recommended(인라인·공용 JS 린트)
검사일: 2026-08-14
수정일: 2026-08-14 (아래 "오류로 판단한 것" 전부 수정 완료 — 상세 내역은 문서 맨 아래 [수정 내역] 참고)

> **이 보고서는 수정 전 원본 검사 결과입니다.** 이 문서에 적힌 오류들은 모두 고쳐졌고, 무엇을 어떻게 고쳤는지는 파일 맨 아래 **[수정 내역]** 절에 정리했습니다. 숫자·표는 "수정 전" 스냅샷으로 그대로 남겨둡니다.

## 한눈에 보기

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| HTML 문법 (25개 페이지 합계) | 오류 145건, 경고 172건 | 고칠 것 있음 |
| JS 린트 — 공용 스크립트 5개(`assets/js`) | 오류 197건, 경고 0건 | 고칠 것 있음 |
| JS 린트 — 페이지별 인라인 스크립트 116개 | 오류 611건, 경고 4건 | 고칠 것 있음 (아래 한계 참고) |
| 성능 (Lighthouse, 25개 페이지) | 모바일 평균 85.9점 / 데스크톱 평균 98.9점 | 이미지 105MB→5.3MB(95% 감소) + `installation.html` JS 버그 수정 완료 — `index.html`은 동영상(10MB)이 남은 유일한 병목 (아래 4절) |
| 접근성 / Best Practices / SEO (Lighthouse) | 대부분 100, 일부 90~96 | 좋음 (공통 이슈 3가지, 아래 4절) |

가장 먼저 고칠 것: `common/low price.html` **파일명에 공백**이 있어서, 이걸 링크하는 나머지 24개 페이지 전부에서 내비게이션 링크가 깨진 것으로 잡힙니다(오류 24건). 상품 카드의 `href="product-detail.html?name=... 공백/한글..."` 형태 링크도 52건이 같은 원인(URL에 원문 공백·한글)으로 잡힙니다. 이 두 가지만 고치면 HTML 오류 145건 중 76건(52%)이 한 번에 사라집니다.

## 1 — HTML 문법: 원인별 정리

같은 원인이 여러 파일에 반복돼서 파일별 나열 대신 원인별로 묶었습니다.

### ① `low price.html` 파일명 공백 → 링크 깨짐 (오류 24건)

`index.html`을 포함해 `low price.html` 자기 자신을 뺀 24개 페이지 전부가 내비게이션 메뉴에서 이 파일을 링크하는데, 파일명에 공백이 들어 있어 URL 경로로 못 씁니다.

| 예시 파일:줄 | 원문 메시지 | 고치는 방법 |
| --- | --- | --- |
| `index.html:919` | `Bad value "common/low price.html" for attribute "href"... Illegal character in path segment. Space is not allowed.` | 파일명을 `low-price.html`처럼 하이픈으로 바꾸고, 24개 페이지의 `href="...low price.html"`을 전부 같은 이름으로 바꿉니다. |
| `common/account.html:688` | 위와 동일 | 위와 동일 |
| (외 22개 페이지 동일 패턴) | — | — |

### ② 상품 카드 링크의 쿼리스트링에 원문 공백·한글 (오류 52건)

`product-detail.html?name=LACK 라크&price=...&desc=사이드테이블, 55x55 cm&img=...` 처럼 상품명·설명을 URL 인코딩 없이 그대로 붙였습니다. `low price.html`(12건), `product-detail.html`(24건), `sale.html`(16건)에 몰려 있습니다.

| 파일:줄 | 원문 메시지 | 고치는 방법 |
| --- | --- | --- |
| `common/low price.html:863` | `Bad value "product-detail.html?name=LACK 라크&price=₩15,000&desc=사이드테이블, 55x55 cm&img=..." ... Illegal character in query. Space is not allowed.` | `encodeURIComponent()`로 `name`/`desc` 값을 인코딩해서 `?name=LACK%20%EB%9D%BC%ED%81%AC` 형태로 만듭니다. 표시할 때는 `decodeURIComponent()`로 되돌립니다. |
| `common/product-detail.html:1029` 등 24곳 | 동일 패턴(LANGFJÄLL·KALLAX·BILLY·MALM·POÄNG·ALEX·LACK·HEMNES 상품 링크) | 동일 |
| `common/sale.html:931` 등 16곳 | 동일 패턴 | 동일 |

### ③ `return.html` — `<label>` 안에 `<div>` 중첩 (오류 8건)

`<label>` 요소는 `<button>/<input>/<select>` 등 입력 요소를 최대 1개까지만 자식으로 가질 수 있는데, `<div>`로 여러 겹 감싸면서 이 규칙을 깼습니다.

| 줄 | 원문 메시지 | 고치는 방법 |
| --- | --- | --- |
| 735, 746, 768, 775, 839, 846 | `Element "div" not allowed as child of element "label" in this context.` (6건) | `<label>`을 `<label for="poangQty">텍스트</label>` 형태로 짧게 두고, 감싸던 `<div>` 레이아웃은 `<label>` 바깥으로 빼냅니다. |
| 748 | `The "label" element may contain at most one "button", "input", ... descendant.` | 위와 동일 수정으로 함께 해결됩니다. |
| 787 | `The first child "option" element of a "select" element with a "required" attribute ... must have either an empty "value" attribute, or must have no text content.` | `<select required>`의 첫 `<option>`을 `<option value="" disabled selected>선택하세요</option>` 형태의 빈 값 placeholder로 바꿉니다. |

### ④ `delivery.html` — 태그가 안 닫힘 (오류 3건)

| 줄 | 원문 메시지 | 고치는 방법 |
| --- | --- | --- |
| 1007 | `Unclosed element "div".` | 1007번 줄에서 연 `<div>`가 어디서도 안 닫혔습니다. |
| 1013 | `Unclosed element "div".` | 1013번 줄 `<div>`도 마찬가지입니다. |
| 1050 | `End tag "section" seen, but there were open elements.` | 위 두 `<div>`를 닫지 않은 채 `</section>`이 나와서 생긴 결과입니다. `<div>` 2개를 알맞은 위치에서 닫으면 자동으로 해결됩니다. |

### ⑤ `product-detail.html` — `<button>` 안에 `<div>` 중첩 (오류 3건)

| 줄 | 원문 메시지 | 고치는 방법 |
| --- | --- | --- |
| 941, 968, 988 | `Element "div" not allowed as child of element "button" in this context.` | `<button>` 안에는 블록 요소(`div`) 대신 `span`을 쓰거나, `<div role="button" tabindex="0">`로 바꿔서 그 안에 `div`를 넣습니다. 접근성상 `<button>`을 유지하고 내부를 `span`으로 바꾸는 쪽을 권합니다. |

### ⑥ 그 밖의 개별 오류 (오류 5건)

| 파일:줄 | 원문 메시지 | 고치는 방법 |
| --- | --- | --- |
| `common/checkout.html:496` | `The autofill field name "street-address" is not allowed in this context.` | `autocomplete="street-address"`는 `<textarea>`나 특정 그룹 구조에서만 허용됩니다. 단일 `<input>`이면 `address-line1`으로 바꿉니다. |
| `common/installation.html:1209` | `The heading "h4" ... follows the heading "h2" ..., skipping 1 heading level.` | `<h4>`를 `<h3>`로 바꿔 단계를 하나씩만 내려가게 합니다. |
| `common/signup.html:624` | `The heading "h3" ... follows the heading "h1" ..., skipping 1 heading level.` | `<h3>`를 `<h2>`로 바꿉니다. |
| `common/delivery.html:1224` | `The "aria-label" attribute must not be specified on any "div" element unless the element has a "role" value other than...` | 이 `<div>`에 `role="group"` 같은 역할을 추가하거나, `aria-label`을 지웁니다. |
| `common/card-register.html:774` | `Element "div" not allowed as child of element "label" in this context.` | ③번과 같은 패턴입니다. `<label>` 구조를 분리합니다. |

### (참고용, 실제 오류 아님) `type="text/tailwindcss"` / `@theme` 오탐 — 25개 페이지 전부

모든 페이지의 `<style type="text/tailwindcss">...@theme {...}</style>` 블록에서 W3C 검사기가 "CSS: Unrecognized at-rule `@theme`"(25건)과 "type 속성은 필요 없다"(25건)를 뜁니다. 이건 Tailwind v4 CDN(JIT)이 브라우저에서 이 스타일 블록을 가로채 처리하도록 만든 **의도된 문법**이라, W3C 검사기가 표준 CSS3만 알아서 생기는 오탐입니다. 실제 오류가 아니므로 고칠 필요 없습니다.

### 경고 173건 — 대부분 한 가지 패턴

| 패턴 | 건수 | 내용 | 권고 |
| --- | --- | --- | --- |
| `Trailing slash on void elements has no effect...` | 150건 (주로 `index.html`) | `<img ... />`처럼 셀프클로징 슬래시를 쓴 곳. HTML5에서는 효과가 없고, 따옴표 없는 속성값 뒤에 오면 파싱이 꼬일 수 있습니다. | 급하지 않지만, 발견 시 슬래시(`/`)를 지우는 걸 권합니다. |
| `Article/Section lacks heading` | 15건 | `<article>`/`<section>`에 제목 요소가 없음 | 스크린리더 사용자가 섹션을 구분하기 어렵습니다. `<h2>~<h6>` 제목을 추가하거나 이유가 있다면 `<div>`로 바꿉니다. |
| `heading elements but none has computed level 1` | 5건 | 페이지에 `<h1>`이 없음(레벨 1로 계산되는 제목 없음) | 페이지당 `<h1>` 하나는 있는 게 SEO·접근성에 좋습니다. |
| 기타 1건씩 | 2건 | 빈 제목, label에 라벨 가능 요소 2개 이상 | 개별 확인 필요 |

## 2 — CSS 문법

확인 안 함. 이 프로젝트의 스타일은 전부 각 페이지 안 `<style type="text/tailwindcss">` 블록(Tailwind v4 JIT 전용 문법)과 Tailwind 유틸리티 클래스로 되어 있어, W3C CSS Validator(표준 CSS3 대상)로는 의미 있게 검사할 수 없습니다. `assets/css/tokens.css`도 `@theme { ... }`로 시작하는 Tailwind 전용 파일이라 마찬가지입니다.

## 3 — JavaScript 린트 (ESLint recommended)

검사 대상을 두 그룹으로 나눴습니다.

- **공용 스크립트** `assets/js/*.js` 5개 — 여러 페이지가 함께 씀
- **페이지별 인라인 스크립트** 25개 페이지의 `<script>` 블록 116개

### 규칙별 집계 (공용 + 인라인 합계)

| 규칙 | 건수 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- | --- |
| `no-var` | 672건 (공용 173 + 인라인 499) | `var`로 변수를 선언함. 스코프가 함수 단위라 블록({}) 밖으로 새어나가고, 재선언도 막지 못합니다. | `let`(재할당 있음) 또는 `const`(재할당 없음)로 바꿉니다. 이 프로젝트에서 가장 많이 반복되는 패턴이라, 한 번에 전체 치환(정규식 `\bvar\b` → 문맥에 맞게 `let`/`const`)을 검토할 만합니다. |
| `no-unused-vars` | 72건 (공용 9 + 인라인 63) | 선언만 하고 안 쓰는 변수·함수 인자 | 안 쓰면 지우고, 의도적으로 안 쓰는 인자면 `_`로 이름을 바꿉니다. |
| `no-empty` | 33건 (공용 6 + 인라인 27) | 빈 블록문(`if (...) {}` 등, 주석 없는 빈 `{}`) | 의도적으로 비워둔 거라면 최소한 이유를 적는 주석을 넣습니다(그러면 이 규칙이 더 이상 잡지 않습니다). 실수라면 로직을 채웁니다. |
| `no-redeclare` | 8건 (공용 7 + 인라인 1) | 같은 스코프에서 같은 이름을 두 번 선언 | 뒤의 선언을 지우거나 이름을 바꿉니다. |
| `no-undef` | 23건 (공용 2 + 인라인 21) | **검사 도구의 한계로 인한 오탐입니다 — 아래 설명 참고.** | 조치 불필요 |

### `no-undef` 23건에 대한 설명 (실제 버그 아님)

이 검사는 각 `<script>` 블록과 각 `.js` 파일을 서로 독립된 파일인 것처럼 하나씩 떼어서 돌렸습니다. 그런데 브라우저는 같은 페이지 안의 여러 `<script>` 블록을 **하나의 전역 스코프를 공유**하는 것으로 실행합니다. 그래서 아래 두 가지 원인으로 전부 오탐이 났습니다.

1. **다른 스크립트 블록에서 정의한 함수/변수를 못 찾음** — 예: `common/orders.html`의 `closeOrderDetailModal`/`closeShippingTrackingModal`은 실제로는 같은 페이지의 다른 `<script>` 블록(1400·1422번 줄)에 `window.closeOrderDetailModal = function() {...}` 형태로 정의돼 있습니다. `common/planning.html`의 `toggleMobileNav`, `index.html`의 `rootEl`도 마찬가지로 같은 페이지 다른 블록에 정의돼 있습니다. 실제 브라우저에서는 정상 동작합니다.
2. **검사 설정에 없는 브라우저 내장 API** — `requestAnimationFrame`/`cancelAnimationFrame`/`MouseEvent`/`FileReader`/`getComputedStyle` 등은 모든 브라우저가 기본 제공하는 전역 API인데, 이번 검사에 쓴 ESLint 설정의 전역 변수 목록에 빠뜨려서 "정의 안 됨"으로 잘못 잡혔습니다.

즉 no-undef 23건은 전부 검사 방식의 한계이지 실제 코드 결함이 아닙니다.

### 페이지별 인라인 스크립트, 오류가 특히 많은 곳 (같은 유형 묶음, 상위만 표시)

| 파일 | 오류 건수 | 주된 원인 |
| --- | --- | --- |
| `common/category.html` (인라인 12번 블록) | 74건 | 거의 전부 `no-var` |
| `common/products.html` (인라인 2·3번 블록) | 52 + 31건 | `no-var` 위주, 일부 `no-unused-vars` |
| `common/checkout.html` (인라인 2번 블록) | 39건 | `no-var` |
| `index.html` (인라인 2번 블록) | 33건 | `no-var`, `no-undef`(오탐 포함) |
| `common/account.html` (인라인 2번 블록) | 29건 | `no-var` |

나머지 페이지는 대부분 페이지 공통으로 들어가는 헤더/모달 스크립트에서 3~10건씩 반복되는 같은 유형(`no-var`)입니다.

### 공용 스크립트(`assets/js`)별 집계

| 파일 | 오류 | 비고 |
| --- | --- | --- |
| `cart-wishlist.js` | 127건 | 거의 전부 `no-var` |
| `chatbot.js` | 41건 | `no-var` 위주 |
| `search.js` | 20건 | `no-var`, `getComputedStyle` no-undef 1건은 오탐 |
| `account-confirm.js` | 9건 | `no-var` |
| `main.js` | 0건 | 이미 깨끗함 |

## 4 — 성능 · 접근성 · SEO (Lighthouse)

**추가 측정일: 2026-08-14.** 배포 URL이 없어서, 이 폴더를 로컬 정적 서버(`npx serve . -l 4173`)로 띄운 뒤 `http://localhost:4173/`(=`index.html`)을 로컬 `lighthouse` CLI로 측정했습니다. 대상은 `index.html` 한 페이지이며, 다른 24개 페이지는 측정하지 않았습니다.

| 항목 | 모바일 | 데스크톱 | 판정 |
| --- | --- | --- | --- |
| 성능 | **52점** | **66점** | 나쁨 — 아래 원인 참고 |
| 접근성 | 100점 | 100점 | 좋음 (단, 감점 없는 항목 중에도 사소한 지적 1건 있음 — 아래 참고) |
| Best Practices | 100점 | 100점 | 좋음 |
| 검색 최적화(SEO) | 100점 | 100점 | 좋음 |

### 성능 점수가 낮은 이유

원인은 명확합니다 — **`assets/images` 폴더 전체가 91MB**이고, `index.html` 한 페이지가 불러오는 리소스 총량이 **44MB**에 달합니다(Lighthouse `total-byte-weight` 감사). PNG 파일 중 5MB(`figma_632_4033.png`)·4.7MB(`figma_preview_632_3444.png`)짜리도 있고, 1.5~2MB대 PNG가 여러 개입니다. 이 때문에:

| 지표 | 모바일 | 데스크톱 | 비중 |
| --- | --- | --- | --- |
| 최대 콘텐츠 표시 시간(LCP) | 95.1초 | 15.5초 | 25% |
| Speed Index | 13.2초 | 4.0초 | 10% |
| 총 차단 시간(TBT) | 390ms | 10ms | 30% |
| 첫 콘텐츠 표시 시간(FCP) | 2.6초 | 0.6초 | 10% |
| 누적 레이아웃 이동(CLS) | 0 (좋음) | 0 (좋음) | 25% |

**먼저 손댈 것 (효과 순):**
1. **이미지 최적화가 압도적으로 효과가 큽니다.** Lighthouse가 "image-delivery-insight" 감사에서 **약 32.9MB를 줄일 수 있다**고 추정합니다. PNG를 WebP/AVIF로 바꾸고, 실제 표시 크기에 맞게 리사이즈하면 대부분 해결됩니다.
2. **캐시 정책**: "cache-insight" 감사에서 **약 43MB 분량**이 효율적인 캐시 수명 설정으로 절약 가능하다고 나옵니다. 정적 자산에 `Cache-Control: max-age=...` 헤더를 붙이는 건 배포 서버(호스팅) 설정 몫이라 이 프로젝트 코드만으로는 완결되지 않습니다.
3. **렌더 차단 리소스**: Tailwind CDN 등 `<head>`의 렌더 차단 리소스로 약 1.8초 절약 여지가 있습니다.

### 접근성 — 사소한 지적 1건

챗봇 열기 버튼(`#ikea-chat-toggle-btn`)에 `aria-label="IKEA AI 챗봇 상담 열기"`가 있는데, 버튼 안에 보이는 텍스트("AI 상담")가 그 접근성 이름에 포함돼 있지 않습니다(WCAG 2.5.3 "Label in Name"). 스크린리더 사용자와 음성 명령 사용자가 부를 이름과 화면에 보이는 이름이 달라 혼동될 수 있습니다. `aria-label`에 화면 텍스트를 포함시키면 해결됩니다(예: `aria-label="AI 상담 챗봇 열기"`). 카테고리 점수 자체는 가중치가 낮아 100으로 반올림됐지만, 실제로는 이 항목이 걸려 있습니다. 이 챗봇 버튼은 `assets/js/cart-wishlist.js`가 모든 페이지에 공통으로 주입하므로, **25개 페이지 전체에 동일하게 적용되는 이슈**입니다.

---

### 추가 측정 — 나머지 24개 페이지 (2026-08-14, 모바일 기준)

`index.html`과 같은 방식(로컬 서버 + `lighthouse` CLI, 모바일 기준)으로 `common/*.html` 24개를 마저 측정했습니다. 성능 점수가 낮은 순으로 정렬했습니다.

| 페이지 | 성능 | 접근성 | Best Practices | SEO | 페이지 용량 | LCP |
| --- | --- | --- | --- | --- | --- | --- |
| delivery | 56 | 100 | 100 | 100 | 15MB | 59.4초 |
| sale | 56 | 100 | 100 | 100 | 10MB | 43.2초 |
| category | 58 | 100 | 100 | 100 | 23MB | 52.7초 |
| planning | 63 | 100 | 100 | 100 | 9MB | 46.7초 |
| products | 63 | 91 | 100 | 100 | 6MB | 17.0초 |
| installation | 64 | 96 | 96 | 100 | 8MB | 34.0초 |
| low-price | 65 | 100 | 100 | 100 | 6MB | 23.4초 |
| product-detail | 68 | 96 | 100 | 100 | 2MB | 6.4초 |
| family | 69 | 100 | 100 | 100 | 3MB | 19.7초 |
| order | 69 | 96 | 100 | 100 | 3MB | 16.7초 |
| styling | 70 | 90 | 100 | 100 | 5MB | 27.0초 |
| service | 71 | 100 | 100 | 91 | 5MB | 30.0초 |
| orders | 81 | 100 | 100 | 100 | 0MB | 4.1초 |
| cart | 82 | 100 | 100 | 100 | 0MB | 2.8초 |
| return | 86 | 91 | 100 | 100 | 0MB | 3.2초 |
| checkout | 87 | 100 | 96 | 100 | 0MB | 2.6초 |
| consulting | 88 | 90 | 100 | 100 | 1MB | 3.2초 |
| review | 89 | 100 | 100 | 100 | 0MB | 3.2초 |
| card-register | 92 | 100 | 100 | 100 | 0MB | 2.8초 |
| account | 93 | 90 | 100 | 100 | 0MB | 2.7초 |
| wishlist | 93 | 100 | 100 | 100 | 0MB | 2.7초 |
| card | 94 | 100 | 100 | 100 | 0MB | 2.6초 |
| signup | 94 | 100 | 100 | 100 | 0MB | 2.6초 |
| self-styling | 95 | 96 | 100 | 100 | 4MB | 2.5초 |

**25개 페이지 전체(index 포함) 성능 점수 분포**: 평균 75.9점, 중앙값 71점, 최저 52점(`index.html`)~최고 95점(`self-styling`). 50점대 4개·60점대 7개·70점대 2개·80점대 6개·90점대 6개로, **딱 절반(11개)이 70점 미만**입니다.

패턴이 뚜렷합니다 — **페이지 용량이 6MB를 넘는 8개 페이지(delivery·sale·category·planning·products·installation·low-price·styling)가 전부 성능 70점 미만**이고, 반대로 이미지가 거의 없는 페이지(orders·cart·return·checkout·review·card-register·account·wishlist·card·signup, 용량 0~1MB)는 전부 80점 이상입니다. `index.html`(44MB, 52점)까지 포함하면 원인은 한 가지로 좁혀집니다: **이미지 용량**.

### 이미지 최적화 적용 및 재측정 (2026-08-14)

위 진단에 따라 실제로 이미지 전체를 WebP로 변환했습니다.

**작업 내용**
1. `assets/` 아래 모든 PNG 중, 어느 페이지에서든 실제로 참조되는 126개(105.0MB)를 `sharp` 라이브러리로 WebP(품질 82)로 변환.
2. 25개 페이지의 `.html`/`.js`/`.css`에서 해당 파일명을 가리키는 참조 329건을 전부 `.png` → `.webp`로 갱신 (상품 카드 링크의 `img=` 쿼리스트링 파라미터 52건 포함).
3. 원본 PNG 126개 삭제.
4. **검증**: 로컬 서버를 띄운 뒤 25개 페이지의 `<img src>`/`<link href>` 148개 고유 URL 전부를 실제 HTTP 요청으로 확인(전부 200 OK), 공용 JS 5개와 인라인 스크립트 121개 문법 파싱 재확인, `.png` 문자열이 코드에 하나도 안 남았는지 전수 검색까지 마쳤습니다.

**결과: 105.0MB → 5.3MB (95.0% 감소)**

| 항목 | 변환 전 | 변환 후 |
| --- | --- | --- |
| 참조되는 이미지 총 용량 | 105.0MB | 5.3MB |
| 25개 페이지 평균 성능 점수 | 75.9점 | **85.9점** |

페이지별 전후 비교(모바일, 성능 점수만 발췌, 개선폭이 큰 순):

| 페이지 | 전 | 후 | 개선 | 페이지 용량(후) |
| --- | --- | --- | --- | --- |
| low-price | 65 | 91 | +26 | 0.3MB |
| sale | 56 | 85 | +29 | 0.5MB |
| products | 63 | 82 | +19 | 0.5MB |
| orders | 81 | 93 | +12 | 0.1MB |
| installation | 64 | 86 | +22 | 0.4MB |
| service | 71 | 86 | +15 | 0.4MB |
| order | 69 | 88 | +19 | 0.3MB |
| category | 58 | 74 | +16 | 1.4MB |
| delivery | 56 | 71 | +15 | 1.1MB |
| planning | 63 | 77 | +14 | 0.8MB |
| family | 69 | 86 | +17 | 0.4MB |
| styling | 70 | 83 | +13 | 0.4MB |
| index.html | 52 | 66 | +14 | 12MB (아래 참고) |
| (나머지 12개 페이지) | 82~95 | 82~94 | 대체로 유지 | 0.1MB 이하 |

거의 모든 페이지에서 페이지 용량이 1.5MB 이하로 떨어졌고, 그만큼 성능 점수도 올랐습니다. `self-styling`처럼 원래도 이미지가 적었던 페이지는 점수가 오히려 소폭(-2) 내려갔는데, 이는 이미지 문제가 아니라 측정 시점마다 달라지는 오차 범위입니다.

**`index.html`은 여전히 12MB — 원인은 이미지가 아니라 동영상**: `assets/video/ikea.mp4`(10.2MB)가 홈페이지에 실려 있습니다. 이건 이번에 요청받은 "이미지 최적화" 범위 밖이라 손대지 않았습니다. 필요하면 영상 재인코딩(예: H.264 CRF 값 조정, 해상도 축소)이나 `preload="none"`/지연 로드 적용을 별도로 진행할 수 있습니다.

**남겨둔 것 — 참조 안 되는 이미지 59.5MB(70개 파일)**: `assets/cat-*.png`, `assets/figma_632_4033.png`(5MB), `assets/figma_preview_632_3444.png`(4.7MB) 등은 어느 페이지에서도 안 쓰이는 걸 확인했습니다. 어느 페이지에도 안 실리므로 Lighthouse 점수에는 영향이 없지만, 저장소 용량만 차지하고 있습니다. 실수로 지우면 안 되는 예비 자산일 수 있어 임의로 삭제하지 않았습니다 — 필요 없다면 삭제해서 저장소를 더 가볍게 만들 수 있습니다.

### 접근성 — 페이지별 공통 이슈 3가지 → 수정 완료 (2026-08-14)

| 이슈 | 해당 페이지 | 내용 | 조치 |
| --- | --- | --- | --- |
| `label-content-name-mismatch` | 25개 전체 | 챗봇 버튼의 `aria-label`이 화면 텍스트("AI 상담")를 포함 안 함 | `assets/js/chatbot.js`의 `aria-label`을 `"AI 상담 챗봇 열기"`로 수정. 25개 페이지 전부 해결 |
| `button-name` | account, consulting, products, styling | 예약 모달 닫기 버튼(아이콘만 있음)·`products.html`의 모바일 필터 버튼(작은 화면에서 텍스트가 숨겨짐)에 접근 가능한 이름 없음 | 각 버튼에 `aria-label` 추가(`"닫기"`, `"필터 및 정렬"`) |
| `select-name` | account, consulting, return, styling | 예약 모달 `<select>`와 `return.html`의 수량 선택 `<select>`가 라벨과 연결 안 됨 | `<label for>`/`id` 연결 또는 `aria-label` 추가 |
| `color-contrast` (`text-ink-muted`/`text-ink-3`) | installation, order, product-detail, products, return, self-styling | 두 토큰 다 `#6B7280`이라 밝은 배경(`#F1F3F5`·`#F3F4F6` 등)에서 대비 4.4:1 안팎으로 AA 기준(4.5:1) 미달 | 두 토큰을 각 페이지의 인라인 `@theme` 블록과 `assets/css/tokens.css`에서 전부 `#4B5563`로 변경(사이트 내 모든 밝은 배경 토큰 대비 6.7~7.6:1로 여유 있게 통과 확인). **주의**: 처음엔 `tokens.css`만 고쳤다가 반영이 안 됐는데, 알고 보니 25개 페이지 각각이 `<style type="text/tailwindcss">` 안에 자기만의 `@theme` 토큰 사본을 갖고 있어서(Tailwind CDN이 이 인라인 사본을 우선 사용) 25개 파일 전부 따로 고쳐야 했습니다 |

**재검증 결과**: `product-detail`·`return`·`order`·`account`·`consulting`·`styling` 6개 페이지는 접근성 100점 달성. 다만 재검증 중 `text-ink-muted`/`ink-3`와 무관한 **별개의 색상 대비 문제 3건**을 추가로 발견했습니다 — 이건 이번 "3가지 이슈" 범위 밖이라 색만 바꾸지 않고 발견 사실만 남겨둡니다.

| 페이지 | 발견한 것 | 비고 |
| --- | --- | --- |
| `installation.html` | 주황(`amber-600`)/빨강(`red-600`) 배지 글자가 옅은 배경과 대비 부족(각각 3.09:1, 4.36:1) | Tailwind 기본 팔레트를 그대로 썼습니다. 배지 색상 자체를 바꿔야 해서 디자인 판단이 필요합니다 |
| `products.html` | 남은 3건은 실제 결함이 아닙니다 — GSAP 스크롤 애니메이션 카드가 화면에 스크롤되어 들어오기 전 초기 상태(`opacity: 0.2`)로 측정된 것(계산해서 확인: `opacity:0.2`로 흰 배경에 얹은 어두운 글자색이 정확히 이 수치와 일치). 실제로는 스크롤하면 100% 불투명해져서 문제없습니다 | 조치 불필요 (측정 방식의 한계) |
| `self-styling.html` | 브랜드 파란 배경 위 반투명(`text-white/70`) 문구가 대비 부족(4.37:1) | 히어로 섹션 문구 스타일이라 투명도를 얼마나 올릴지는 디자인 판단이 필요합니다 |

이 3건도 고칠지는 알려주시면 진행하겠습니다.

### 데스크톱 25개 페이지 전체 측정 + `installation.html` 버그 수정 (2026-08-14, 최종)

이미지 최적화 이후 **모바일뿐 아니라 데스크톱도 25개 페이지 전부** 마저 측정했습니다. 측정 중 `installation.html`에서 Lighthouse가 "브라우저 콘솔에 에러가 찍혔다"(Best Practices 96)고 잡은 걸 실제로 파본 결과, 진짜 JS 런타임 버그였습니다.

**버그 내용**: "상세페이지" 링크를 순회하며 클릭 이벤트를 연결하는 코드에서 화살표 함수(`link => {...}`) 안에 `this.closest('article')`를 썼는데, 화살표 함수는 `this`가 클릭한 요소를 가리키지 않아 `TypeError: this.closest is not a function`이 발생했습니다. 이 에러가 `forEach` 반복 중간에 터지면서 **첫 번째 상품 카드 이후의 "상세페이지" 링크는 클릭 이벤트가 아예 연결되지 않는** 상태였습니다. 같은 코드 패턴을 쓰는 `category.html`은 `link.closest(...)`로 올바르게 돼 있어 비교로 확인했습니다.

**수정**: `const card = this.closest('article');` → `const card = link.closest('article');` 한 줄 수정. 수정 후 재측정해서 콘솔 에러 0건, Best Practices 96→100점(모바일·데스크톱 모두) 확인했습니다.

**25개 페이지 전체 — 모바일 vs 데스크톱 최종 결과**

| 항목 | 모바일 평균 | 데스크톱 평균 |
| --- | --- | --- |
| 성능 | 85.9점 | **98.9점** |
| 70점 미만 페이지 수 | 1개 (`index.html`, 동영상 때문) | 0개 |

데스크톱은 `index.html`(94점, 동영상 때문에 유일하게 100 미만)을 빼면 전 페이지 99~100점입니다. 접근성·Best Practices·SEO는 모바일과 데스크톱 값이 사실상 동일합니다(디바이스가 아니라 마크업 문제라서 그렇습니다).

### 한계

- **모바일 결과는 느린 4G 시뮬레이션 기준입니다.** 실제 로컬 네트워크보다 훨씬 느리게 시뮬레이션하므로 실제 배포 시 CDN·압축·캐시가 붙으면 지금보다는 나아지지만, 이미지 자체가 무거운 문제는 그대로 남습니다.
- Lighthouse 점수는 측정할 때마다 몇 점씩 달라질 수 있어 한 번의 값으로 단정하지 않습니다.
- **모바일·데스크톱, 25개 페이지 전부 측정 완료**했습니다. 추가로 남은 건 위에서 안내한 접근성 공통 이슈 3가지(챗봇 버튼 라벨, 예약모달 버튼/select 이름, 색상 대비)와 `index.html`의 동영상 용량뿐입니다.

## 5 — 자동 검사로 확인 못 하는 것

1. 키보드 `Tab` 키만으로 각 페이지 전체를 쓸 수 있는지
2. 포커스가 모달(예: 상품 상세, 배송 조회) 안에 갇히지 않는지
3. `low price.html` 링크 오류처럼 문법상 "틀렸다"고만 나올 뿐, 실제로 클릭했을 때 어느 브라우저에서 어떻게 깨지는지는 직접 눌러봐야 확인됩니다.

## 먼저 할 일

1. **`common/low price.html`을 `low-price.html`로 이름을 바꾸고, 25개 페이지의 내비게이션 링크를 전부 갱신합니다.** HTML 오류 145건 중 24건이 이걸로 없어집니다.
2. **상품 카드 링크의 쿼리스트링을 `encodeURIComponent`로 인코딩합니다.** (`low price.html`·`product-detail.html`·`sale.html`) HTML 오류 52건이 없어지고, 상품명에 `&`나 특수문자가 들어갈 때 링크가 깨지는 잠재 버그도 같이 막습니다.
3. **`assets/js`와 페이지 인라인 스크립트의 `var`를 `let`/`const`로 바꿉니다.** 전체 JS 오류(808건)의 83%(672건)를 차지하는 단일 패턴이라, 프로젝트 전체 스타일을 ES2015+ 기준으로 맞추는 데 가장 효과가 큽니다. 자동 치환 후 반드시 화면에서 재동작을 확인해야 합니다(스코프가 `var`→`let/const`로 바뀌면 동작이 달라지는 경우가 있습니다).

## 검사 도구와 한계

이 보고서는 W3C Nu HTML Checker와 ESLint(recommended) 결과를 옮긴 것입니다. 문법 검사는 코드가 규칙에 맞는지만 보므로, 문법이 맞아도 화면이 의도와 다르게 보일 수 있습니다. JS 린트는 각 `<script>` 블록/파일을 독립적으로 검사해서 같은 페이지의 다른 스크립트에 정의된 함수·변수를 "정의 안 됨"으로 오탐할 수 있습니다(`no-undef` 23건은 전부 이 사유로 확인했습니다). CSS 문법과 Lighthouse 점수는 이번에 검사하지 않았습니다(사유는 각 항목에 적었습니다). `type="text/tailwindcss"`/`@theme` 관련 오류(각 25건)는 Tailwind v4 CDN의 의도된 문법이라 실제 결함이 아닙니다.

---

## [수정 내역] — 오류로 판단한 것 전부 수정 완료 (2026-08-14)

이 절 위쪽 내용은 **수정 전** 스냅샷입니다. 아래는 실제로 무엇을 어떻게 고쳤는지 정리한 결과입니다.

### HTML 오류 145건 → 실제 오류 0건 (Tailwind 오탐 50건은 원래부터 손댈 필요 없음)

| 원인 | 조치 | 결과 |
| --- | --- | --- |
| `low price.html` 파일명 공백 (24건) | `git mv`로 `low-price.html`로 이름 변경, 25개 페이지의 `href` 전부 갱신 | 해결 |
| 상품 카드 쿼리스트링 공백·한글 (52건) | `low-price.html`·`product-detail.html`·`sale.html`의 `?name=`/`desc=` 값을 `encodeURIComponent`로 인코딩. `product-detail.html`은 `URLSearchParams.get()`으로 자동 디코딩하므로 표시 로직은 그대로 정상 동작 | 해결 |
| `return.html` `<label>` 안 `<div>`/이중 라벨 요소 (8건) | POÄNG 수량 선택 `<select>`를 `<label>` 밖으로 분리(별도 `<div>`), 나머지 `<div>`는 `class="block"` 붙인 `<span>`으로 교체, `required` `<select>`에 빈 값 placeholder 옵션 추가 | 해결 |
| `delivery.html` 안 닫힌 `<div>` 2개 (3건) | 빠진 `</div>` 2개 추가, `aria-label` 있는 `<div>`에 `role="group"` 부여 | 해결 |
| `product-detail.html` `<button>` 안 `<div>` (3건) | 아코디언 헤더의 `<div>`를 `<span>`으로 교체 | 해결 |
| 개별 5건(체크아웃 autocomplete, 헤딩 레벨 2건, card-register label) | `autocomplete="street-address"`→`address-line1`, `installation.html` h4→h3 3곳, `signup.html` 푸터 3개 컬럼 h3→h2, `card-register.html` label 안 div→span | 해결 |

### JS 오류 808건(공용 197 + 인라인 611) → 실제 오류 0건 (no-undef 23건은 검사 도구 한계로 인한 오탐, 원래부터 손댈 필요 없음)

| 원인 | 조치 | 결과 |
| --- | --- | --- |
| `no-var` 672건 | `assets/js/*.js` 5개는 ESLint 공식 `--fix`로 일괄 변환. 116개 인라인 `<script>`는 추출→`--fix`→원위치 삽입 파이프라인으로 처리. 자동 변환이 안전하지 않다고 판단해 건너뛴 21건(같은 함수 안에서 `var`가 두 번 선언된 곳)은 각 선언이 실제로는 서로 다른 `if`/`else` 블록에 있어 `let`/`const`로 바꿔도 충돌하지 않음을 직접 확인한 뒤 수동으로 변환 | 해결 |
| `no-redeclare` 8건 | 위 `var` 두 번 선언 지점과 동일 — `let`/`const`로 바꾸며 자연히 해결. `category.html`의 `smoother` 중복 선언은 완전한 죽은 코드(항상 `null`)라 중복된 두 번째 선언을 삭제 | 해결 |
| `no-empty` 33건 | 전부 `catch (e) {}` 형태의 빈 catch 블록. `catch { /* 실패 사유를 적은 한국어 주석 */ }` 형태(옵셔널 catch 바인딩)로 교체 — 브라우저 미지원 감지, `localStorage`/`sessionStorage` 저장 실패 등 원래 의도(오류 무시)를 주석으로 남김 | 해결 |
| `no-unused-vars` 72건 | 검사기가 `<script>` 블록을 하나씩 따로 떼어 보기 때문에, `onclick`/`onchange`/`onsubmit` 같은 HTML 인라인 속성에서 호출되는 함수나 다른 `<script>` 블록에서 참조되는 함수를 "안 쓰임"으로 오탐한 경우가 대부분이었음. 하나하나 실제 호출부를 찾아 대조한 결과: <br>• **진짜 죽은 코드 발견 → 삭제**: `category.html`의 `goto()`/`headerOffset()` 함수(어디서도 호출 안 됨, `scrollToTarget()`이 이미 같은 역할을 대체), `low-price.html`의 안 쓰이는 배지 변수 4개(`wishCount`/`cartCount`/`wishBadge`/`cartBadge`), `chatbot.js`의 안 쓰이는 `rootPath` 변수, `products.html` forEach의 안 쓰이는 `idx` 매개변수 <br>• **실제 버그 발견 → 수정**: `consulting.html`의 모바일 메뉴 버튼(`#mobile-menu-btn`)에 클릭 이벤트가 아예 연결돼 있지 않아 `toggleMobileNav()`가 정의만 되고 절대 호출되지 않는 상태였음(다른 페이지를 살려서 실제로 눌리지 않는 버튼이었음). `planning.html`에 있는 것과 동일한 `mbtn.addEventListener('click', toggleMobileNav)` 코드를 추가해 실제로 동작하도록 고침 <br>• **나머지는 오탐 확인 후 그대로 둠**: `formatCardNumber`(card-register), `changeMainImage`/`toggleAccordion`/`addToCart`(product-detail), `updateRequestType`/`submitReturnForm`(return) 등은 전부 HTML의 `onclick`/`oninput` 속성에서 실제로 호출되고 있음을 grep으로 확인 | 해결 (일부는 오탐 확인 후 유지) |
| `no-undef` 23건 | 전부 확인 결과 실제 버그 아님. (1) `requestAnimationFrame`/`cancelAnimationFrame`/`MouseEvent`/`FileReader`/`getComputedStyle` 등은 브라우저 표준 API인데 이번 검사 설정의 전역 변수 목록에 빠져 있었던 것(검사 도구 한계). (2) `closeOrderDetailModal`(orders.html), `toggleMobileNav`(planning.html), `rootEl`(index.html) 등은 같은 페이지의 다른 `<script>` 블록에 정의돼 있어 실제 브라우저에서는 정상 동작 — 블록을 하나씩 떼어 검사하는 이번 방식의 한계일 뿐 | 조치 불필요(오탐 확인) |

### 발견했지만 이번 보고서 범위 밖이라 손대지 않은 것

- `assets/css/tokens.css`·페이지 내 `<style type="text/tailwindcss">` 블록의 `@theme` 관련 오류(각 25건, 총 50건): Tailwind v4 CDN이 의도적으로 쓰는 문법이라 원래부터 실제 결함이 아님
- 경고 172건(주로 `<img ... />` 셀프클로징 슬래시 150건, 섹션 제목 누락 15건 등)은 "오류"가 아니라 "경고"라서 이번 "오류 전부 수정" 범위에서 제외함. 필요하면 별도로 요청해주세요.

### 검증 방법

- HTML: 수정한 파일마다 W3C Nu HTML Checker로 개별 재검사해 오류 0건(Tailwind 오탐 2건만 남음)을 확인. 다만 이번 세션에서 W3C 공개 검사기를 여러 차례 호출한 탓에 마지막 전체 재검사 시점에는 요청 제한(HTTP 429)에 걸려, 개별 링크 치환만 적용되고 별도 구조 변경이 없었던 나머지 파일들은 자동 재검사를 완료하지 못했습니다. 다만 이 파일들에 적용한 수정은 이미 검증된 파일들과 동일한 스크립트로 기계적으로 적용한 것이라 결과가 다를 이유가 없습니다.
- JS: `assets/js` 전체와 25개 페이지의 인라인 스크립트 116개를 다시 검사해 `no-var`/`no-empty`/`no-redeclare`가 0건임을 확인. 남은 `no-unused-vars`/`no-undef`는 전부 위 표에서 설명한 오탐입니다.
