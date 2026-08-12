/* 헤더 검색창(#search-input, #mobile-search) 자동완성 — 제품/메뉴 검색 후 클릭 시 해당 페이지로 연동 */
(function () {
  if (window.__IKEA_SEARCH_INITIALIZED__) return;
  window.__IKEA_SEARCH_INITIALIZED__ = true;

  /* 사이트 GNB에 실제로 존재하는 메뉴만 등록한다 (file은 common/ 폴더 기준 파일명) */
  var MENU_ITEMS = [
    { name: '모든 제품', file: 'products.html' },
    { name: '공간별 쇼핑하기', file: 'category.html' },
    { name: '플래닝 & 아이디어', file: 'styling.html' },
    { name: '서비스', file: 'service.html' },
    { name: '세일', file: 'sale.html' },
    { name: 'IKEA Family 멤버십', file: 'family.html' },
    { name: '주문 배송 조회', file: 'orders.html' },
    { name: '마이페이지', file: 'account.html' },
    { name: '위시리스트', file: 'wishlist.html' },
    { name: '장바구니', file: 'cart.html' }
  ];

  /* 사이트 전역 상품 카드에서 추출한 실제 상품 데이터 (이름/가격/설명/이미지) */
  var PRODUCTS = [{"name":"KALLAX 칼락스 선반유닛","price":"₩89,900","desc":"화이트, 77x147 cm","img":"assets/p-kallax.png"},{"name":"MALM 말름 침대 프레임","price":"₩299,000","desc":"화이트 오크무늬, 150x200 cm","img":"assets/images/products/malm.png"},{"name":"POÄNG 포엥 암체어","price":"₩129,000","desc":"자작나무무늬/크니사 라이트베이지","img":"assets/p-poang.png"},{"name":"HEMNES 헴네스 서랍장","price":"₩249,000","desc":"화이트 스테인, 108x96 cm","img":"assets/images/products/nordli.png"},{"name":"MARKUS 마르쿠스 의자","price":"₩199,000","desc":"블랙 글로세, 사무용 인체공학","img":"assets/images/products/markus.png"},{"name":"BILLY 빌리 책장","price":"₩59,900","desc":"화이트, 80x28x202 cm","img":"assets/p-billy.png"},{"name":"LACK 라크 사이드테이블","price":"₩9,900","desc":"블랙브라운, 55x55 cm","img":"assets/p-lack.png"},{"name":"ALEX 알렉스 서랍유닛","price":"₩89,900","desc":"화이트, 36x70 cm","img":"assets/images/products/bekant.png"},{"name":"NORDLI 노르들리 수납콤비네이션","price":"₩399,000","desc":"화이트, 160x99 cm","img":"assets/images/products/nordli.png"},{"name":"EKEDALEN 에케달렌 확장식탁","price":"₩279,000","desc":"화이트, 120/180x80 cm","img":"assets/images/products/ekedalen.png"},{"name":"LANGFJÄLL 랑피엘","price":"₩89,900","desc":"","img":"assets/p-langfjall.png"},{"name":"KALLAX 칼락스","price":"₩79,900","desc":"","img":"assets/p-kallax.png"},{"name":"BILLY 빌리","price":"₩59,900","desc":"","img":"assets/p-billy.png"},{"name":"MALM 말름","price":"₩199,000","desc":"","img":"assets/p-malm.png"},{"name":"POÄNG 포엥","price":"₩129,000","desc":"","img":"assets/p-poang.png"},{"name":"ALEX 알렉스","price":"₩89,900","desc":"","img":"assets/p-alex.png"},{"name":"LACK 라크","price":"₩9,900","desc":"","img":"assets/p-lack.png"},{"name":"HEMNES 헴네스","price":"₩249,000","desc":"","img":"assets/p-hemnes.png"},{"name":"BESTÅ 베스토","price":"₩259,000","desc":"","img":"assets/p-besta.png"},{"name":"NORDLI 노르들리","price":"₩349,000","desc":"","img":"assets/p-nordli.png"},{"name":"EKET 에케트","price":"₩119,000","desc":"","img":"assets/p-eket.png"},{"name":"BRIMNES 브림네스","price":"₩399,000","desc":"","img":"assets/p-brimnes.png"},{"name":"SÖDERHAMN 쇠데르함","price":"₩599,000","desc":"","img":"assets/p-soderhamn.png"},{"name":"VITTSJÖ 빗셰","price":"₩49,900","desc":"","img":"assets/p-vittsjo.png"},{"name":"FJÄLLBO 피엘보","price":"₩149,000","desc":"","img":"assets/p-fjallbo.png"},{"name":"LISABO 리사보","price":"₩199,000","desc":"","img":"assets/p-lisabo.png"},{"name":"KIVIK 시비크 3인용소파","price":"₩799,000","desc":"","img":"assets/images/products/kivik.png"},{"name":"STOCKHOLM 스톡홀름 커피테이블","price":"₩349,000","desc":"","img":"assets/images/products/stockholm.png"},{"name":"MALM 말름 침대프레임","price":"₩299,000","desc":"","img":"assets/images/products/malm.png"},{"name":"NORDLI 노르들리 6칸서랍장","price":"₩449,000","desc":"","img":"assets/images/products/nordli.png"},{"name":"EKEDALEN 에게달렌 확장형식탁","price":"₩399,000","desc":"","img":"assets/images/products/ekedalen.png"},{"name":"ÖSTANÖ 외스타뇌 다이닝체어","price":"₩89,900","desc":"","img":"assets/images/products/ostano.png"},{"name":"SUNDVIK 순드비크 유아용침대","price":"₩179,000","desc":"","img":"assets/images/products/sundvik.png"},{"name":"TROFAST 트로파스트 수납콤비","price":"₩129,000","desc":"","img":"assets/images/products/trofast.png"},{"name":"BEKANT 베칸트 책상","price":"₩599,000","desc":"","img":"assets/images/products/bekant.png"},{"name":"MARKUS 마르쿠스 사무용의자","price":"₩349,000","desc":"","img":"assets/images/products/markus.png"},{"name":"METOD 메토드 주방 하부장","price":"₩249,000","desc":"","img":"assets/images/products/havsta.png"},{"name":"KUNGSFORS 쿵스포르스 선반","price":"₩39,900","desc":"","img":"assets/images/products/skadis.png"},{"name":"GODMORGON 고드모르곤 세면대장","price":"₩189,000","desc":"","img":"assets/images/products/nordli.png"},{"name":"ENHET 엔헤트 거울 수납장","price":"₩49,900","desc":"","img":"assets/images/products/brimnes.png"},{"name":"MACKAPÄR 마카패르 신발장","price":"₩89,900","desc":"","img":"assets/images/products/hemnes.png"},{"name":"BISSA 비싸 3단 신발장","price":"₩44,900","desc":"","img":"assets/images/products/micke.png"},{"name":"RUNNEN 룬넨 야외 데크타일","price":"₩34,900","desc":"","img":"assets/images/products/kvistbro.png"},{"name":"HYLLIS 힐리스 아웃도어 선반","price":"₩19,900","desc":"","img":"assets/images/products/kolbjorn.png"},{"name":"JÄLL 옐 이동식 빨래바구니","price":"₩7,900","desc":"","img":"assets/images/products/trofast-combi.png"},{"name":"BOAXEL 보악셀 세탁실 시스템","price":"₩125,000","desc":"","img":"assets/images/products/fjalkinge.png"},{"name":"HEMNES 햄네스 8단서랍장","price":"₩299,000","desc":"","img":"assets/images/yunjae/product-stockholm.png"},{"name":"SÖDERHAMN 쇠데르함 3인용소파","price":"₩649,000","desc":"","img":"assets/images/yunjae/product-kivik.png"},{"name":"LACK 라크 보조테이블","price":"₩15,000","desc":"","img":"assets/p-lack.png"},{"name":"EKET 에케트 수납장","price":"₩45,000","desc":"","img":"assets/images/yunjae/product-eket.png"},{"name":"FADO 파도 탁상스탠드","price":"₩19,900","desc":"","img":"assets/images/yunjae/product-besta.png"},{"name":"RÅSKOG 로스코그 카트","price":"₩34,900","desc":"","img":"assets/images/yunjae/product-alex.png"},{"name":"GLADOM 글라도무 트레이테이블","price":"₩24,900","desc":"","img":"assets/images/yunjae/product-brimnes.png"},{"name":"NESNA 네스나 침대협탁","price":"₩19,900","desc":"","img":"assets/images/yunjae/product-nordli.png"}];

  var isInsideCommon = window.location.pathname.indexOf('/common/') !== -1;
  var MAX_RESULTS = 8;

  function menuHref(item) {
    return isInsideCommon ? item.file : 'common/' + item.file;
  }

  function productHref(p) {
    var base = isInsideCommon ? 'product-detail.html' : 'common/product-detail.html';
    var params = new URLSearchParams();
    params.set('name', p.name);
    params.set('price', p.price);
    if (p.desc) params.set('desc', p.desc);
    params.set('img', p.img);
    return base + '?' + params.toString();
  }

  function normalize(s) {
    return (s || '').toLowerCase().replace(/\s+/g, '');
  }

  function search(query) {
    var q = normalize(query);
    if (!q) return [];

    var menuHits = MENU_ITEMS
      .filter(function (m) { return normalize(m.name).indexOf(q) !== -1; })
      .map(function (m) { return { type: 'menu', name: m.name, href: menuHref(m) }; });

    var productHits = PRODUCTS
      .filter(function (p) { return normalize(p.name).indexOf(q) !== -1; })
      .map(function (p) { return { type: 'product', name: p.name, desc: p.desc, price: p.price, img: p.img, href: productHref(p) }; });

    return menuHits.concat(productHits).slice(0, MAX_RESULTS);
  }

  function resolveImage(img) {
    if (!img) return '';
    if (img.indexOf('http') === 0 || img.indexOf('/') === 0) return img;
    return isInsideCommon ? '../' + img : img;
  }

  function buildDropdown(input) {
    var dropdown = document.createElement('div');
    dropdown.className = 'ikea-search-dropdown absolute left-0 right-0 top-full mt-1.5 z-50 hidden max-h-96 overflow-y-auto rounded-xl border border-line-light bg-white shadow-xl';
    dropdown.setAttribute('role', 'listbox');
    input.__dropdown = dropdown;

    var wrapper = input.closest('div');
    if (wrapper && getComputedStyle(wrapper).position === 'static') {
      wrapper.style.position = 'relative';
    }
    (wrapper || input.parentElement).appendChild(dropdown);
    return dropdown;
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderResults(input, dropdown, results, query) {
    dropdown.innerHTML = '';

    if (!results.length) {
      dropdown.innerHTML = '<p class="px-4 py-4 text-xs text-ink-muted">"' + escapeHtml(query) + '"에 대한 검색 결과가 없습니다.</p>';
      dropdown.classList.remove('hidden');
      return;
    }

    var list = document.createElement('ul');
    list.className = 'divide-y divide-line-light';

    results.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.setAttribute('role', 'option');
      a.className = 'flex items-center gap-3 px-4 py-2.5 hover:bg-bg-light transition-colors';

      if (item.type === 'product') {
        a.innerHTML =
          '<img src="' + resolveImage(item.img) + '" alt="" class="h-9 w-9 shrink-0 rounded-md object-contain bg-bg-light" />' +
          '<span class="min-w-0 flex-1">' +
            '<span class="block truncate text-xs font-semibold text-ink">' + escapeHtml(item.name) + '</span>' +
            '<span class="block truncate text-xs text-ink-muted">' + escapeHtml(item.price) + (item.desc ? ' · ' + escapeHtml(item.desc) : '') + '</span>' +
          '</span>' +
          '<span class="shrink-0 rounded-full bg-bg-light px-2 py-0.5 text-xs font-medium text-ink-muted">제품</span>';
      } else {
        a.innerHTML =
          '<svg class="h-4 w-4 shrink-0 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>' +
          '<span class="min-w-0 flex-1 truncate text-xs font-semibold text-ink">' + escapeHtml(item.name) + '</span>' +
          '<span class="shrink-0 rounded-full bg-bg-light px-2 py-0.5 text-xs font-medium text-brand">메뉴</span>';
      }

      /* click보다 먼저 발생하는 input blur가 목록을 지우지 않도록 mousedown에서 이동 처리 */
      a.addEventListener('mousedown', function (e) {
        e.preventDefault();
        window.location.href = item.href;
      });

      li.appendChild(a);
      list.appendChild(li);
    });

    dropdown.appendChild(list);
    dropdown.classList.remove('hidden');
  }

  function closeDropdown(dropdown) {
    if (dropdown) dropdown.classList.add('hidden');
  }

  function wireInput(input) {
    if (!input || input.__searchWired) return;
    input.__searchWired = true;

    var dropdown = buildDropdown(input);
    input.setAttribute('autocomplete', 'off');

    input.addEventListener('input', function () {
      var results = search(input.value);
      if (!input.value.trim()) {
        closeDropdown(dropdown);
        return;
      }
      renderResults(input, dropdown, results, input.value.trim());
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) renderResults(input, dropdown, search(input.value), input.value.trim());
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDropdown(dropdown);
        input.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (e.target !== input && !dropdown.contains(e.target)) closeDropdown(dropdown);
    });

    /* 검색폼 submit(엔터) 시 모든 제품 페이지로 검색어를 전달 */
    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = input.value.trim();
        if (!q) return;
        var target = (isInsideCommon ? 'products.html' : 'common/products.html') + '?q=' + encodeURIComponent(q);
        window.location.href = target;
      });
    }
  }

  function init() {
    document.querySelectorAll('#search-input, #mobile-search').forEach(wireInput);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
