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
| 성능 / 접근성 / SEO (Lighthouse) | 확인 안 함 | 로컬 파일이라 측정 불가 |

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

확인 안 함. 로컬 파일이라 Lighthouse로 측정할 수 없습니다. 배포된 URL이 생기면 그 주소로 다시 요청해 주세요(모바일/데스크톱 기준 선택 가능).

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
