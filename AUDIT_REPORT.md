# 📊 Common 폴더 HTML & AI 챗봇 시스템 종합 진단 보고서

- **검사 일시:** 2026-08-12
- **진단 대상:** 
  1. `common/` 폴더 내 20개 HTML 파일
  2. AI 챗봇 시스템 (`assets/js/chatbot.js` 및 연동 스크립트)
- **진단 기준:** W3C 웹 표준, 시맨틱 HTML5, 웹 접근성(A11y), 반응형 UI/UX, 자바스크립트 안정성 및 보안(XSS 방어)

---

## 1. 종합 요약표

| 검사 영역 | 검사 대상 | 상태 | 결과 요약 |
| :--- | :--- | :---: | :--- |
| **HTML5 문법 및 시맨틱** | `common/*.html` (20개) | **PASS (우수)** | DOCTYPE, `lang="ko"`, `charset="utf-8"`, `viewport`, 단일 `<h1>` 100% 준수 |
| **자원 및 경로 정합성** | 이미지/CSS/JS 상대경로 | **PASS (우수)** | 깨진 에셋 및 잘못된 404 경로 **0건** (`../assets/` 상대경로 완전 정합) |
| **웹 접근성 (A11y)** | 20개 HTML + 챗봇 UI | **PASS (우수)** | `<img>` 태그 `alt` 누락 **0건**, ARIA 랜드마크 및 상태 속성 완비 |
| **스크립트 문법 & 린트** | `chatbot.js`, `cart-wishlist.js` | **PASS (우수)** | 문법 오류(Syntax Error) **0건**, IIFE 스코프 격리 및 중복 초기화 방지 |
| **AI 챗봇 시스템** | `chatbot.js` 및 전역 연계 | **PASS (매우 우수)** | 9개 도메인 지식 베이스, 로컬스토리지 카트 동기화, XSS 방어 완료 |

---

## 2. `common` 폴더 20개 HTML 상세 진단

### 2.1. 검사 대상 파일 목록 (총 20개)
`account.html`, `card.html`, `cart.html`, `category.html`, `checkout.html`, `consulting.html`, `delivery.html`, `family.html`, `installation.html`, `low price.html`, `order.html`, `orders.html`, `planning.html`, `product-detail.html`, `products.html`, `sale.html`, `self-styling.html`, `service.html`, `styling.html`, `wishlist.html`

### 2.2. 세부 검사 항목 및 결과
1. **문서 기본 표준 구조:**
   - 전 파일 `<!DOCTYPE html>`, `<html lang="ko">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">` 정상 적용
   - 페이지별 고유한 `<title>` 태그 및 `<meta name="description">` 메타 태그 완비
   - 페이지별 단일 `<h1>` 태그 사용으로 검색엔진 최적화(SEO) 및 스크린 리더 탐색 구조 최적화
2. **시맨틱 태그 구조:**
   - `<header>`, `<nav>`, `<main>`, `<footer>` 표준 시맨틱 레이아웃 100% 구성
3. **에셋 및 링크 무결성:**
   - 20개 파일의 모든 `<img>`, `<link>`, `<script>` 상대 경로가 `../assets/...`로 정상 매핑됨
   - 로컬 에셋 참조 중 누락/깨진 파일 **0건**
   - 모든 `<img>` 태그에 유의미한 `alt` 속성 부여 완료 (누락 0건)
   - 중복 `id` 속성 **0건**
4. **전역 스크립트 연동:**
   - 전 파일에 `cart-wishlist.js` 및 `chatbot.js`가 포함되어 있어, 어느 페이지에서나 장바구니/위시리스트 카운트 및 AI 챗봇이 일관되게 동작함

---

## 3. AI 챗봇 시스템 (`assets/js/chatbot.js`) 정밀 분석

### 3.1. 아키텍처 및 핵심 로직
1. **지식 베이스(Knowledge Base) 커버리지 (9개 핵심 카테고리):**
   - 📦 **배송 서비스 (`delivery.html`)**: 정찰제 배송비(소형 택배 5천원 ~ 초대형 가구 8.9만원) 안내 및 바로가기
   - 🔧 **조립 & 설치 (`installation.html`)**: 기본 출장비, 품목별 조립비 및 벽고정 서비스 안내
   - 🛋️ **플래닝 & 스타일링 (`styling.html`)**: 1:1 맞춤 컨설팅, 3D 셀프 플래너 안내
   - 🏷️ **할인 & 특가 (`sale.html`)**: 시즌 세일, 더 낮은 가격, 패밀리 특가 안내
   - 🔄 **365일 교환/반품 (`service.html`)**: 반품 기한 및 환불 절차 안내
   - 📍 **매장 안내 & 영업시간 (`service.html`)**: 광명, 고양, 기흥, 동부산, 강동 매장 위치 및 쇼룸/레스토랑 시간 안내
   - 💛 **IKEA Family 멤버십 (`family.html`)**: 평일 무료 커피, 회원 특별가, 14일 안심 보험 혜택 안내
   - 🛒 **동적 장바구니 연동 (`cart.html`)**: `localStorage`의 `ikea_cart_items` 데이터를 실시간 파싱하여 현재 담긴 품목 수를 계산해 사용자에게 응답
   - 📋 **주문 & 결제 (`orders.html`)**: 결제 수단 및 주문 내역 조회 링크 제공
2. **UX 인터랙션 및 애니메이션:**
   - 플로팅 버튼(FAB: `z-[9990]`) + 활성 상태 핑(Ping) 애니메이션 + 웰컴 툴팁
   - 7종 빠른 추천 질문 칩(`QUICK_CHIPS`) 원클릭 질의 지원
   - 3단 바운스 타이핑 인디케이터(450ms 딜레이)로 자연스러운 AI 응답 체감 제공
   - 대화 내용 초기화(Reset) 및 모달 오픈 시 인풋 자동 포커스
3. **접근성(A11y) & 보안:**
   - ARIA 속성: `role="dialog"`, `aria-label`, `aria-hidden`, `aria-expanded` 완벽 적용
   - 보안: `escapeHTML()` 유틸리티를 통해 사용자 입력 텍스트를 이스케이프 처리하여 XSS(Cross-Site Scripting) 방어
   - 전역 연동 API: `window.openIkeaChatbot(query)` 및 `data-open-chatbot` 속성 클릭 이벤트 위임 지원

---

## 4. 권장 최적화 및 유지보수 사항 (Minor Suggestions)

1. **상단 이동 버튼 `type` 속성 명시:**
   - `common/*.html` 내 `#scrollToTopBtn` 태그에 `type="button"`을 명시하여 폼 내부 포함 시 예기치 않은 submit 동작을 방지하는 것을 권장합니다.
2. **파일명 공백 표준화 (선택 사항):**
   - `common/low price.html` 파일명의 공백을 `low-price.html` 형태로 변경하면 웹 호스팅 환경에서 URL 인코딩(`%20`) 문제를 방지할 수 있습니다.

---
*보고서 생성 위치: `Team_Synergos_esg/AUDIT_REPORT.md`*
