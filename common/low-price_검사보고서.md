# low price.html 검사 보고서

검사 주소: 로컬 파일 (`Team_Synergos_esg/common/low price.html`)
검사 기준: 로컬 파일 — 문법·린트만 (Lighthouse는 공개 URL이 필요해 확인 실패)
검사일: 2026-08-13

## 한눈에 보기

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| HTML 문법 | 오류 14건, 경고 1건 | 고칠 것 있음 |
| CSS 문법 | 확인 안 함 (인라인 `<style>`만 있어 별도 CSS 파일 없음) | - |
| JS 린트 | 확인 안 함 (별도 JS 파일 지정 안 됨) | - |
| 성능/접근성/SEO/권장 사항 | 확인 실패 | 로컬 파일이라 Lighthouse 미실행. 인터넷에 올린 뒤 URL로 재검사 필요 |

가장 먼저 고칠 것: `product-detail.html` 링크 13개에 공백이 포함된 값이 그대로 들어가 있습니다. `encodeURIComponent`로 감싸면 HTML 오류 13건이 한 번에 없어집니다.

## 1 - HTML 문법

### 오류 14건

| 줄 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- |
| 20 | `<style>`의 `type="text/tailwindcss"`는 표준 값이 아닙니다. (The only allowed value for the "type" attribute for the "style" element is "text/css"...) | Tailwind Play CDN이 브라우저가 이 블록을 CSS로 파싱하지 못하게 일부러 넣는 값입니다. Tailwind CDN 스크립트를 그대로 쓰는 한 검사기 경고는 남습니다 — 직접 고칠 대상이 아닙니다. |
| 21 | `<style>` 안의 `@theme { ... }`을 표준 CSS 문법으로 인식하지 못함 (CSS: Unrecognized at-rule "@theme") | 위와 같은 이유로 Tailwind v4 전용 문법입니다. 정식 빌드 파이프라인(PostCSS 등)으로 전환하기 전까지는 정상 동작이며 고칠 대상이 아닙니다. |
| 681, 711, 741, 771, 801, 831, 861, 891, 921, 951, 981, 1011 (총 12곳, 아래 1곳과 같은 유형 총 13건) | `<a href="product-detail.html?name=LACK 라크&price=...">` 처럼 쿼리 문자열에 공백이 그대로 들어가 있음 (Bad value ... for attribute "href" on element "a": Illegal character in query. Space is not allowed.) | `name`·`desc` 등 값에 `encodeURIComponent()`를 적용해 공백과 특수문자를 `%20` 등으로 인코딩합니다. 예: `?name=${encodeURIComponent('LACK 라크')}` |

같은 유형 13건 → 위 표 1행으로 묶음. 13건 모두 같은 원인(쿼리 값 미인코딩)이라 고치는 방법도 동일합니다.

### 경고 1건

| 줄 | 내용 | 권고 |
| --- | --- | --- |
| 9:71 | `<link ... />`처럼 void 요소에 붙은 슬래시는 효과가 없고 따옴표 없는 속성값과 섞이면 문제가 될 수 있음 (Trailing slash on void elements has no effect...) | `<link ... />` → `<link ...>`로 슬래시만 제거. 기능상 문제는 없어 급하지 않음. |

## 2 - CSS 문법

별도 `.css` 파일이 지정되지 않아 검사하지 않았습니다. 인라인 `<style type="text/tailwindcss">` 블록은 Tailwind 전용 문법이라 표준 CSS 검사기로는 의미 있는 결과가 나오지 않습니다.

## 3 - JavaScript 린트

`--js-file`을 지정하지 않아 검사하지 않았습니다. 페이지에 별도 `.js` 파일이 있다면 파일 경로를 알려주시면 이어서 검사하겠습니다.

## 4~6 - 성능·접근성·검색 최적화

로컬 파일이라 Lighthouse를 실행하지 못했습니다. 이 페이지를 실제 서버(또는 GitHub Pages 등)에 올린 뒤 그 URL로 다시 요청해 주시면 성능·접근성·SEO·권장 사항 점수까지 함께 보고서에 담겠습니다.

## 7 - 먼저 할 일

1. `product-detail.html` 링크 13곳의 `href` 쿼리 값을 `encodeURIComponent`로 인코딩 (HTML 오류 13건 해소)
2. 9번 줄 `<link ... />`의 트레일링 슬래시 제거 (경고 1건 해소)
3. 페이지를 배포한 뒤 URL로 Lighthouse 포함 전체 재검사 진행

## 검사 도구와 한계

이 보고서는 W3C Nu HTML Checker 결과만 옮긴 것입니다(로컬 파일이라 CSS·JS·Lighthouse는 대상에서 빠짐). 문법 검사는 코드가 규칙에 맞는지만 보므로, 문법이 맞아도 화면이 의도와 다르게 보일 수 있습니다. Tailwind CDN의 `@theme`/`text/tailwindcss` 관련 항목은 도구 특성상 나오는 오탐이며, 실제 브라우저 동작에는 영향이 없습니다.
