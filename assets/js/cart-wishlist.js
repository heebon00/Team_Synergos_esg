/* 사이트 전역 위시리스트 / 장바구니 상태 (localStorage 기반, 페이지 간 공유) */
(function () {
  if (window.__CART_WISHLIST_INITIALIZED__) return;
  window.__CART_WISHLIST_INITIALIZED__ = true;

  const WISHLIST_KEY = 'ikea_wishlist_items';
  const CART_KEY = 'ikea_cart_items';
  const INIT_FLAG_KEY = 'ikea_wishlist_initialized';
  /* "구매하기"(바로구매) 단일 상품은 장바구니와 분리해 세션에만 담아 결제 페이지에 전달한다 */
  const BUYNOW_KEY = 'ikea_buynow_item';

  // 이미지 경로를 언제나 루트 기준 상대 경로 (assets/...)로 표준화한다.
  function normalizeImagePath(path) {
    if (!path) return 'assets/images/products/kivik.webp';
    
    // 절대경로(http, file 등)이 포함된 경우 'assets/'를 찾아 그 이후 경로만 추출
    const assetsIndex = path.indexOf('assets/');
    if (assetsIndex !== -1) {
      return path.substring(assetsIndex);
    }
    
    // '../'나 '/'로 시작하는 상대경로인 경우 접두사 제거 후 assets/로 시작하도록 보정
    let cleaned = path;
    while (cleaned.startsWith('../') || cleaned.startsWith('./') || cleaned.startsWith('/')) {
      if (cleaned.startsWith('../')) cleaned = cleaned.substring(3);
      else if (cleaned.startsWith('./')) cleaned = cleaned.substring(2);
      else if (cleaned.startsWith('/')) cleaned = cleaned.substring(1);
    }
    
    if (cleaned.startsWith('assets/')) {
      return cleaned;
    }
    
    // 파일명만 있는 등의 경우 기본 에셋 폴더로 매핑
    const fileName = cleaned.split('/').pop().split('\\').pop();
    if (fileName && (fileName.startsWith('p-') || fileName.startsWith('cat-') || fileName.startsWith('hero-'))) {
      return 'assets/' + fileName;
    }
    
    return 'assets/images/products/kivik.webp'; // 기본 대체 이미지
  }

  const WISH_SELECTOR = 'button[aria-label*="위시리스트"], .wish-btn, button[aria-label*="찜"], button[aria-label*="관심상품"], #wishlist-toggle-btn';
  const CART_SELECTOR = 'button[aria-label*="장바구니"], .add-cart-btn, .cart-toggle-btn';
  /* "구매하기" 버튼: 장바구니 담기와 달리 토글이 아니라 항상 담고 바로 결제 페이지로 이동한다 */
  const BUY_SELECTOR = '.buy, .buy-btn, .buy-now-btn';

  /* common/delivery.html "가구 배송 요금" 표에 정의된 정찰제 요금을 상품 종류별로 매핑한다 */
  const DEFAULT_SHIPPING_FEE = 29000; // 소형 가구 (의자, 협탁, 책상 등)
  const SHIPPING_TIERS = [
    {
      fee: 89000, // 초대형 가구 (붙박이장, 주방 시스템 등)
      keywords: ['PAX', '팍스', '붙박이', 'METOD', '메토드', '주방 하부장', '주방 상부장', 'BOAXEL', '보악셀', '세탁실 시스템', '드레스룸', '시스템장']
    },
    {
      fee: 49000, // 일반 대형 가구 (침대, 소파 등)
      keywords: ['KIVIK', '시비크', 'SÖDERHAMN', '쇠데르함', 'SLATTUM', '슬라툼', '소파', 'MALM', '말름', 'HEMNES', '헴네스',
                 '침대', 'SUNDVIK', '순드비크', '서랍장', 'NORDLI', '노르들리', 'EKEDALEN', '에게달렌', '에케달렌',
                 '확장형식탁', '확장식탁', '식탁', 'BILLY', '빌리', '책장', 'BESTÅ', '베스토']
    },
    {
      fee: 5000, // 소형 택배 배송 (소형 소품)
      keywords: ['KUNGSFORS', '쿵스포르스', 'HYLLIS', '휠리스', '힐리스', 'JÄLL', '옐', '빨래바구니', 'RUNNEN', '룬넨', '데크타일',
                 'EKET', '에케트', 'BAGGEBO', '바게보', 'FJÄLLBO', '피엘보', 'NEIDEN', '네이덴', 'TROFAST', '트로파스트',
                 '수납콤비', 'VITTSJÖ', '빗셰', 'KALLAX', '칼락스', '선반', '바구니']
    }
  ];

  function getShippingFee(product) {
    const text = (((product && product.name) || '') + ' ' + ((product && product.desc) || '')).toUpperCase();
    for (let i = 0; i < SHIPPING_TIERS.length; i++) {
      const tier = SHIPPING_TIERS[i];
      for (let j = 0; j < tier.keywords.length; j++) {
        if (text.indexOf(tier.keywords[j].toUpperCase()) !== -1) return tier.fee;
      }
    }
    return DEFAULT_SHIPPING_FEE;
  }

  function getItems(key) {
    try {
      let raw = localStorage.getItem(key);
      if (!raw && key === WISHLIST_KEY) {
        raw = localStorage.getItem('ikea_wishlist') || localStorage.getItem('wishlist');
      }
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setItems(key, items) {
    try {
      const json = JSON.stringify(items);
      localStorage.setItem(key, json);
      if (key === WISHLIST_KEY) {
        localStorage.setItem('ikea_wishlist', json);
        localStorage.setItem('wishlist', json);
        localStorage.setItem(INIT_FLAG_KEY, 'true');
      }
    } catch { /* localStorage 저장 실패(용량 초과/프라이빗 모드 등) 무시 */ }
  }

  function setBuyNowItem(product) {
    try {
      sessionStorage.setItem(BUYNOW_KEY, JSON.stringify(product));
    } catch { /* sessionStorage 저장 실패 시 무시 */ }
  }

  function getBuyNowItem() {
    try {
      const raw = sessionStorage.getItem(BUYNOW_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function clearBuyNowItem() {
    try {
      sessionStorage.removeItem(BUYNOW_KEY);
    } catch { /* sessionStorage 삭제 실패 시 무시 */ }
  }

  function goToCheckout() {
    const isInsideCommon = window.location.pathname.includes('/common/');
    window.location.href = isInsideCommon ? 'checkout.html' : 'common/checkout.html';
  }

  function isInList(key, id) {
    if (!id) return false;
    return getItems(key).some(function (item) {
      return (item.id && item.id === id) || (item.name && item.name === id) || (item.title && item.title === id);
    });
  }

  function addItem(key, product) {
    const items = getItems(key);
    const pId = product.id || product.name || product.title;
    if (!pId) return items;
    if (!items.some(function (item) { return (item.id === pId) || (item.name === pId) || (item.title === pId); })) {
      items.push(product);
      setItems(key, items);
    }
    return items;
  }

  function removeItem(key, id) {
    const items = getItems(key).filter(function (item) {
      return (item.id !== id) && (item.name !== id) && (item.title !== id);
    });
    setItems(key, items);
    return items;
  }

  function updateBadgeEl(badge, count) {
    if (!badge) return;
    if (count > 0) {
      badge.textContent = String(count);
      badge.style.display = 'inline-flex';
      badge.style.fontSize = '9px';
      badge.style.lineHeight = '1';
      badge.classList.remove('hidden');
    } else {
      badge.textContent = '';
      badge.style.display = 'none';
      badge.classList.add('hidden');
    }
  }

  function refreshBadges() {
    const wishCount = getItems(WISHLIST_KEY).length;
    const cartCount = getItems(CART_KEY).length;
    
    document.querySelectorAll('#wishlist-badge, .wishlist-badge').forEach(function(el) {
      updateBadgeEl(el, wishCount);
    });
    document.querySelectorAll('#cart-badge, .cart-badge').forEach(function(el) {
      updateBadgeEl(el, cartCount);
    });
    
    const wishLabel = document.getElementById('wishlist-count-label');
    if (wishLabel) wishLabel.textContent = wishCount;
  }

  function showToast(message) {
    const existingToast = document.getElementById('ikea-global-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'ikea-global-toast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#111418]/90 text-white text-xs font-semibold shadow-2xl backdrop-blur-sm transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-none';
    toast.innerHTML = `
      <svg class="w-4 h-4 text-[#FFC900] shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(function() {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(function() {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2000);
  }

  function findProductCard(btn) {
    if (!btn) return null;
    // 1. article, .product-card, .card, .swiper-slide, [data-product-name], div.group 탐색
    const card = btn.closest('article, .product-card, .card, .swiper-slide, [data-product-name], div.group');
    if (!card) {
      let curr = btn.parentElement;
      while (curr && curr !== document.body) {
        if (curr.querySelector('h1, h2, h3, h4, h5, .product-title, strong, img')) {
          return curr;
        }
        curr = curr.parentElement;
      }
    }
    return card || btn.parentElement;
  }

  function extractProduct(card) {
    if (!card) return {};
    // 1. 상품명 추출 (h1~h5, .product-title, [data-title], strong, b, p.font-bold 등)
    const nameEl = card.querySelector('h1, h2, h3, h4, h5, .product-title, [data-title], strong, b, p.font-bold, p.font-semibold');
    const imgEl = card.querySelector('img:not([alt*="로고"]):not([alt*="icon"]):not(.icon)');
    let name = nameEl ? nameEl.textContent.trim() : '';
    if (!name && imgEl && imgEl.alt && !imgEl.alt.includes('로고') && !imgEl.alt.includes('IKEA')) {
      name = imgEl.alt.trim();
    }
    if (!name && card.getAttribute('data-product-name')) {
      name = card.getAttribute('data-product-name');
    }
    if (name) {
      name = name.replace(/^[\s–—-]+/, '').trim();
    }

    // 2. 설명 추출 (p.text-xs, p.text-ink-muted, p.text-ink-3, p.text-ink-2 등)
    let desc = '';
    const descEls = card.querySelectorAll('p.text-ink-muted, p.text-ink-3, p.text-ink-2, p.text-xs, .product-desc');
    for (let i = 0; i < descEls.length; i++) {
      const dText = descEls[i].textContent.trim();
      if (dText && !dText.startsWith('(') && !dText.startsWith('₩') && !descEls[i].classList.contains('text-price') && !descEls[i].classList.contains('font-bold')) {
        desc = dText;
        break;
      }
    }

    // 3. 가격 추출 — 할인가(.text-discount)가 있으면 정가(line-through)보다 우선한다
    let price = '';
    const priceEl = card.querySelector('.text-discount, .text-price, [data-price], p.text-xl.font-bold, p.text-lg.font-bold, p.text-lg.font-extrabold, p.font-extrabold, p.font-bold, span.font-bold, .price');
    if (priceEl) {
      price = priceEl.textContent.trim().replace(/[^0-9,]/g, '');
    }
    if (!price) {
      const allP = card.querySelectorAll('p, span');
      for (let j = 0; j < allP.length; j++) {
        if (allP[j].classList.contains('line-through')) continue; // 취소선 정가는 건너뛴다
        const t = allP[j].textContent.trim();
        if (t.includes('₩') || (/[0-9]{1,3}(,[0-9]{3})+/.test(t) && !t.includes('('))) {
          const matched = t.replace(/[^0-9,]/g, '');
          if (matched) {
            price = matched;
            break;
          }
        }
      }
    }

    // 4. 이미지 경로 추출 및 정규화
    const rawImg = imgEl ? (imgEl.getAttribute('src') || imgEl.src) : '';
    const image = normalizeImagePath(rawImg);

    // 5. 상세페이지 링크 URL 빌드
    const formattedPrice = price ? (price.startsWith('₩') ? price : '₩' + price) : '₩119,000';
    const isInsideCommon = window.location.pathname.includes('/common/');
    const detailPagePath = isInsideCommon ? 'product-detail.html' : 'common/product-detail.html';
    
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (formattedPrice) params.set('price', formattedPrice);
    if (desc) params.set('desc', desc);
    if (image) params.set('img', image);

    const href = detailPagePath + '?' + params.toString();
    const id = name || (imgEl ? (imgEl.getAttribute('src') || imgEl.src).split('/').pop().split('?')[0] : '') || card.getAttribute('data-id') || 'item-' + Date.now();

    return {
      id: id,
      name: name || id,
      title: name || id,
      price: price || '119,000',
      desc: desc || '',
      image: image || 'assets/images/products/kivik.webp',
      href: href
    };
  }

  function syncHeartState(btn, id) {
    if (!btn || !id) return;
    const btnLabel = btn.getAttribute('aria-label') || '';
    if (btn.classList.contains('add-cart-btn') || btn.classList.contains('cart-toggle-btn') || btnLabel.includes('장바구니')) return;

    const active = isInList(WISHLIST_KEY, id);
    const svg = btn.querySelector('svg');
    
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.classList.toggle('active', active);

    if (active) {
      btn.classList.add('text-red-500');
      btn.classList.remove('text-ink', 'text-ink-muted', 'text-ink-3', 'text-gray-400', 'text-brand');
    } else {
      btn.classList.remove('text-red-500');
    }

    if (svg) {
      if (active) {
        svg.classList.add('text-red-500', 'fill-red-500');
        svg.classList.remove('text-ink', 'text-ink-muted', 'text-ink-3', 'text-gray-400', 'text-brand', 'text-emerald-600');
        svg.setAttribute('fill', 'currentColor');
        svg.style.fill = '#ef4444';
        svg.style.color = '#ef4444';
        const paths = svg.querySelectorAll('path');
        paths.forEach(function(p) {
          p.style.fill = '#ef4444';
          p.style.stroke = '#ef4444';
        });
      } else {
        svg.classList.remove('text-red-500', 'fill-red-500');
        svg.setAttribute('fill', 'none');
        svg.style.fill = '';
        svg.style.color = '';
        const paths = svg.querySelectorAll('path');
        paths.forEach(function(p) {
          p.removeAttribute('style');
          p.style.fill = 'none';
          p.style.stroke = '';
        });
      }
    }
  }

  function syncCartState(btn, id) {
    if (!btn || !id) return;
    const btnLabel = btn.getAttribute('aria-label') || '';
    if (btn.classList.contains('wish-btn') || btnLabel.includes('위시리스트') || btn.id === 'wishlist-toggle-btn') return;

    const active = isInList(CART_KEY, id);
    btn.classList.toggle('in-cart', active);
    const svg = btn.querySelector('svg');

    if (active) {
      btn.style.borderColor = '#10b981';
      btn.style.backgroundColor = '#ecfdf5';
      btn.style.color = '#059669';
      btn.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-600');
      btn.classList.remove('text-gray-400', 'text-ink', 'text-red-500', 'bg-red-50');

      if (svg) {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.style.color = '#059669';
        svg.style.fill = 'none';
        svg.classList.add('text-emerald-600');
        svg.classList.remove('text-gray-400', 'text-ink', 'text-red-500', 'fill-red-500');
        
        const paths = svg.querySelectorAll('path');
        paths.forEach(function(p) {
          p.removeAttribute('style'); // 인라인 style="fill: #ef4444" 잔여 오염 완전 제거!
          p.setAttribute('fill', 'none');
          p.setAttribute('stroke', 'currentColor');
          p.style.fill = 'none';
          p.style.stroke = '#059669';
          p.style.color = '#059669';
        });
      }
    } else {
      btn.style.borderColor = '';
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.classList.remove('border-emerald-500', 'bg-emerald-50', 'text-emerald-600', 'text-red-500');

      if (svg) {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.style.color = '';
        svg.style.fill = 'none';
        svg.classList.remove('text-emerald-600', 'text-red-500', 'fill-red-500');

        const paths2 = svg.querySelectorAll('path');
        paths2.forEach(function(p) {
          p.removeAttribute('style'); // 인라인 style 잔여 오염 완전 제거!
          p.setAttribute('fill', 'none');
          p.setAttribute('stroke', 'currentColor');
          p.style.fill = 'none';
          p.style.stroke = '';
        });
      }
    }
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  function syncAllButtonStates() {
    document.querySelectorAll(WISH_SELECTOR).forEach(function (btn, idx) {
      if (btn.classList.contains('delete-wish-btn')) return;
      const card = findProductCard(btn);
      const product = card ? extractProduct(card) : null;
      const pId = (product && product.id) || (btn.getAttribute('data-id')) || ('wish-fallback-' + idx);
      if (pId) syncHeartState(btn, pId);
    });

    document.querySelectorAll(CART_SELECTOR).forEach(function (btn, idx) {
      const card = findProductCard(btn);
      const product = card ? extractProduct(card) : null;
      const pId = (product && product.id) || (btn.getAttribute('data-id')) || ('cart-fallback-' + idx);
      if (pId) syncCartState(btn, pId);
    });
  }

  /* 클릭 위임(event delegation) */
  document.addEventListener('click', function (e) {
    // 1. 위시리스트 버튼 클릭
    const wishBtn = e.target.closest(WISH_SELECTOR);
    if (wishBtn) {
      if (wishBtn.classList.contains('delete-wish-btn')) return; // wishlist.html 자체 핸들러 처리

      e.preventDefault();
      e.stopPropagation();

      const card = findProductCard(wishBtn);
      let wishProduct = card ? extractProduct(card) : null;

      // 상세페이지 단독 버튼인 경우
      if ((!wishProduct || !wishProduct.name) && wishBtn.id === 'wishlist-toggle-btn') {
        const detailTitle = document.querySelector('h1, .product-detail-title');
        const detailPrice = document.querySelector('.text-price, [data-price], span.text-3xl');
        const detailImg = document.querySelector('#gallery-main-image, .product-main-img, img.main-prod-image');
        const detailDesc = document.querySelector('#buy-box-section p.text-base, #buy-box-section p.text-ink-muted');
        if (detailTitle) {
          const dName = detailTitle.textContent.trim();
          const dPrice = detailPrice ? detailPrice.textContent.trim().replace(/[^0-9,]/g, '') : '116,000';
          const dDesc = detailDesc ? detailDesc.textContent.trim() : '';
          const dImg = detailImg ? (detailImg.getAttribute('src') || detailImg.src) : 'assets/p-sagmastare-1.webp';
          wishProduct = {
            id: dName,
            name: dName,
            title: dName,
            price: dPrice,
            desc: dDesc,
            image: normalizeImagePath(dImg),
            href: window.location.href
          };
        }
      }

      if (!wishProduct || !wishProduct.id) return;

      const pId = wishProduct.id;
      const wasInList = isInList(WISHLIST_KEY, pId);

      // 하트 팝 애니메이션
      wishBtn.style.transform = 'scale(1.25)';
      setTimeout(function () {
        wishBtn.style.transform = '';
      }, 200);

      if (wasInList) {
        removeItem(WISHLIST_KEY, pId);
        showToast(wishProduct.name ? `[${wishProduct.name}] 위시리스트에서 제외되었습니다.` : '위시리스트에서 제외되었습니다.');
      } else {
        addItem(WISHLIST_KEY, wishProduct);
        showToast(wishProduct.name ? `[${wishProduct.name}] 위시리스트에 저장되었습니다.` : '위시리스트에 저장되었습니다.');
      }

      syncHeartState(wishBtn, pId);
      refreshBadges();
      syncAllButtonStates();
      return;
    }

    // 2. 장바구니 버튼 클릭
    const cartBtn = e.target.closest(CART_SELECTOR);
    if (cartBtn) {
      if (cartBtn.tagName === 'A' || cartBtn.id === 'header-cart-btn' || cartBtn.closest('#header-cart-btn')) {
        return; // 상단 헤더 장바구니 페이지 이동 링크는 원래 브라우저 이동 동작(cart.html)을 유지한다
      }
      if (cartBtn.classList.contains('add-cart-btn') && window.location.pathname.includes('wishlist.html')) {
        return; // wishlist.html 자체 핸들러 처리
      }

      e.preventDefault();
      const card = findProductCard(cartBtn);
      let cartProduct = card ? extractProduct(card) : null;

      if (!cartProduct || !cartProduct.id) {
        const detailTitle = document.querySelector('h1, .product-detail-title');
        const detailPrice = document.querySelector('.text-price, [data-price], span.text-3xl');
        const detailImg = document.querySelector('#gallery-main-image, .product-main-img, img.main-prod-image');
        const detailDesc = document.querySelector('#buy-box-section p.text-base, #buy-box-section p.text-ink-muted');
        if (detailTitle) {
          const cdName = detailTitle.textContent.trim();
          const cdPrice = detailPrice ? detailPrice.textContent.trim().replace(/[^0-9,]/g, '') : '116,000';
          const cdDesc = detailDesc ? detailDesc.textContent.trim() : '';
          const cdImg = detailImg ? (detailImg.getAttribute('src') || detailImg.src) : 'assets/p-sagmastare-1.webp';
          cartProduct = {
            id: cdName,
            name: cdName,
            title: cdName,
            price: cdPrice,
            desc: cdDesc,
            image: normalizeImagePath(cdImg),
            href: window.location.href
          };
        }
      }

      if (!cartProduct || !cartProduct.id) return;

      const pId = cartProduct.id;
      if (isInList(CART_KEY, pId)) {
        removeItem(CART_KEY, pId);
        showToast(cartProduct.name ? `[${cartProduct.name}] 장바구니에서 제외되었습니다.` : '장바구니에서 제외되었습니다.');
      } else {
        addItem(CART_KEY, cartProduct);
        showToast(cartProduct.name ? `[${cartProduct.name}] 장바구니에 담았습니다.` : '장바구니에 담았습니다.');
      }
      syncCartState(cartBtn, pId);
      refreshBadges();
      syncAllButtonStates();
      return;
    }

    // 3. 구매하기(바로구매) 버튼 클릭 — 장바구니는 건드리지 않고, 클릭한 상품 1건만 결제 페이지로 넘긴다
    const buyBtn = e.target.closest(BUY_SELECTOR);
    if (buyBtn) {
      e.preventDefault();
      const buyCard = findProductCard(buyBtn);
      let buyProduct = buyCard ? extractProduct(buyCard) : null;

      if (!buyProduct || !buyProduct.id) {
        const buyDetailTitle = document.querySelector('h1, .product-detail-title');
        const buyDetailPrice = document.querySelector('.text-price, [data-price], span.text-3xl');
        const buyDetailImg = document.querySelector('#gallery-main-image, .product-main-img, img.main-prod-image');
        const buyDetailDesc = document.querySelector('#buy-box-section p.text-base, #buy-box-section p.text-ink-muted');
        if (buyDetailTitle) {
          const bdName = buyDetailTitle.textContent.trim();
          const bdPrice = buyDetailPrice ? buyDetailPrice.textContent.trim().replace(/[^0-9,]/g, '') : '116,000';
          const bdDesc = buyDetailDesc ? buyDetailDesc.textContent.trim() : '';
          const bdImg = buyDetailImg ? (buyDetailImg.getAttribute('src') || buyDetailImg.src) : 'assets/p-sagmastare-1.webp';
          buyProduct = {
            id: bdName,
            name: bdName,
            title: bdName,
            price: bdPrice,
            desc: bdDesc,
            image: normalizeImagePath(bdImg),
            href: window.location.href
          };
        }
      }

      if (buyProduct && buyProduct.id) {
        buyProduct.qty = buyProduct.qty > 0 ? buyProduct.qty : 1;
        setBuyNowItem(buyProduct);
      }

      goToCheckout();
    }
  });

  // 페이지 로드/새로고침 시 배지 및 상태를 깜빡임 없이 즉시 반영
  refreshBadges();
  syncAllButtonStates();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      refreshBadges();
      syncAllButtonStates();
    });
  }
  window.addEventListener('load', function () {
    refreshBadges();
    syncAllButtonStates();
  });
  window.addEventListener('pageshow', function () {
    refreshBadges();
    syncAllButtonStates();
  });

  window.WishlistCart = {
    WISHLIST_KEY: WISHLIST_KEY,
    CART_KEY: CART_KEY,
    BUYNOW_KEY: BUYNOW_KEY,
    getItems: getItems,
    setItems: setItems,
    addItem: addItem,
    removeItem: removeItem,
    isInList: isInList,
    refreshBadges: refreshBadges,
    syncAllButtonStates: syncAllButtonStates,
    showToast: showToast,
    setBuyNowItem: setBuyNowItem,
    getBuyNowItem: getBuyNowItem,
    clearBuyNowItem: clearBuyNowItem,
    goToCheckout: goToCheckout,
    getShippingFee: getShippingFee,
    addToWishlist: function(name) { addItem(WISHLIST_KEY, { id: name, name: name, title: name }); refreshBadges(); syncAllButtonStates(); },
    removeFromWishlist: function(name) { removeItem(WISHLIST_KEY, name); refreshBadges(); syncAllButtonStates(); }
  };

  window.CartWishlist = window.WishlistCart;

  // 사이트 전역 AI 챗봇 시스템 자동 로드
  try {
    if (!window.__IKEA_CHATBOT_INITIALIZED__) {
      const isInsideCommon = window.location.pathname.indexOf('/common/') !== -1;
      const chatbotScriptPath = isInsideCommon ? '../assets/js/chatbot.js' : 'assets/js/chatbot.js';
      const scriptTag = document.createElement('script');
      scriptTag.src = chatbotScriptPath;
      scriptTag.defer = true;
      document.head.appendChild(scriptTag);
    }
  } catch { /* 챗봇 스크립트 로드 실패 시 무시 */ }

  // 헤더 검색창(제품/메뉴 자동완성) 자동 로드
  try {
    if (!window.__IKEA_SEARCH_INITIALIZED__) {
      const isInsideCommonForSearch = window.location.pathname.indexOf('/common/') !== -1;
      const searchScriptPath = isInsideCommonForSearch ? '../assets/js/search.js' : 'assets/js/search.js';
      const searchScriptTag = document.createElement('script');
      searchScriptTag.src = searchScriptPath;
      searchScriptTag.defer = true;
      document.head.appendChild(searchScriptTag);
    }
  } catch { /* 검색 스크립트 로드 실패 시 무시 */ }
})();
