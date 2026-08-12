/* 사이트 전역 위시리스트 / 장바구니 상태 (localStorage 기반, 페이지 간 공유) */
(function () {
  var WISHLIST_KEY = 'ikea_wishlist_items';
  var CART_KEY = 'ikea_cart_items';
  var INIT_FLAG_KEY = 'ikea_wishlist_initialized';
  /* "구매하기"(바로구매) 단일 상품은 장바구니와 분리해 세션에만 담아 결제 페이지에 전달한다 */
  var BUYNOW_KEY = 'ikea_buynow_item';

  var WISH_SELECTOR = 'button[aria-label*="위시리스트"], .wish-btn, button[aria-label*="찜"], button[aria-label*="관심상품"], #wishlist-toggle-btn';
  var CART_SELECTOR = 'button[aria-label*="장바구니"], .add-cart-btn';
  /* "구매하기" 버튼: 장바구니 담기와 달리 토글이 아니라 항상 담고 바로 결제 페이지로 이동한다 */
  var BUY_SELECTOR = '.buy, .buy-btn, .buy-now-btn';

  /* common/delivery.html "가구 배송 요금" 표에 정의된 정찰제 요금을 상품 종류별로 매핑한다 */
  var DEFAULT_SHIPPING_FEE = 29000; // 소형 가구 (의자, 협탁, 책상 등)
  var SHIPPING_TIERS = [
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
    var text = (((product && product.name) || '') + ' ' + ((product && product.desc) || '')).toUpperCase();
    for (var i = 0; i < SHIPPING_TIERS.length; i++) {
      var tier = SHIPPING_TIERS[i];
      for (var j = 0; j < tier.keywords.length; j++) {
        if (text.indexOf(tier.keywords[j].toUpperCase()) !== -1) return tier.fee;
      }
    }
    return DEFAULT_SHIPPING_FEE;
  }

  function getItems(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw && key === WISHLIST_KEY) {
        raw = localStorage.getItem('ikea_wishlist') || localStorage.getItem('wishlist');
      }
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function setItems(key, items) {
    try {
      var json = JSON.stringify(items);
      localStorage.setItem(key, json);
      if (key === WISHLIST_KEY) {
        localStorage.setItem('ikea_wishlist', json);
        localStorage.setItem('wishlist', json);
        localStorage.setItem(INIT_FLAG_KEY, 'true');
      }
    } catch (e) {}
  }

  function setBuyNowItem(product) {
    try {
      sessionStorage.setItem(BUYNOW_KEY, JSON.stringify(product));
    } catch (e) {}
  }

  function getBuyNowItem() {
    try {
      var raw = sessionStorage.getItem(BUYNOW_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearBuyNowItem() {
    try {
      sessionStorage.removeItem(BUYNOW_KEY);
    } catch (e) {}
  }

  function goToCheckout() {
    var isInsideCommon = window.location.pathname.includes('/common/');
    window.location.href = isInsideCommon ? 'checkout.html' : 'common/checkout.html';
  }

  function isInList(key, id) {
    if (!id) return false;
    return getItems(key).some(function (item) {
      return (item.id && item.id === id) || (item.name && item.name === id) || (item.title && item.title === id);
    });
  }

  function addItem(key, product) {
    var items = getItems(key);
    var pId = product.id || product.name || product.title;
    if (!pId) return items;
    if (!items.some(function (item) { return (item.id === pId) || (item.name === pId) || (item.title === pId); })) {
      items.push(product);
      setItems(key, items);
    }
    return items;
  }

  function removeItem(key, id) {
    var items = getItems(key).filter(function (item) {
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
      badge.classList.remove('hidden');
    } else {
      badge.textContent = '';
      badge.style.display = 'none';
      badge.classList.add('hidden');
    }
  }

  function refreshBadges() {
    var wishCount = getItems(WISHLIST_KEY).length;
    var cartCount = getItems(CART_KEY).length;
    
    document.querySelectorAll('#wishlist-badge, .wishlist-badge').forEach(function(el) {
      updateBadgeEl(el, wishCount);
    });
    document.querySelectorAll('#cart-badge, .cart-badge').forEach(function(el) {
      updateBadgeEl(el, cartCount);
    });
    
    var wishLabel = document.getElementById('wishlist-count-label');
    if (wishLabel) wishLabel.textContent = wishCount;
  }

  function showToast(message) {
    var existingToast = document.getElementById('ikea-global-toast');
    if (existingToast) existingToast.remove();

    var toast = document.createElement('div');
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
    // 1. article, .product-card, .card, .swiper-slide 탐색
    var card = btn.closest('article, .product-card, .card, .swiper-slide');
    if (card && (card.querySelector('h3, h4, .product-title, strong') || card.querySelector('.text-price, [data-price], p.font-bold, p.font-extrabold'))) {
      return card;
    }
    // 2. 만약 잡힌 card가 없거나 정보가 부족한 경우 상위 부모로 탐색
    var curr = btn.parentElement;
    while (curr && curr !== document.body) {
      if (curr.querySelector('h3, h4, .product-title, strong') && curr.querySelector('img')) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return card;
  }

  function extractProduct(card) {
    if (!card) return {};
    // 1. 상품명 추출 (h3, h4, .product-title, [data-title], strong, img alt)
    var nameEl = card.querySelector('h3, h4, .product-title, [data-title], strong');
    var imgEl = card.querySelector('img:not([alt*="로고"]):not([alt*="icon"]):not(.icon)');
    var name = nameEl ? nameEl.textContent.trim() : '';
    if (!name && imgEl && imgEl.alt && !imgEl.alt.includes('로고') && !imgEl.alt.includes('IKEA')) {
      name = imgEl.alt.trim();
    }
    if (!name && card.getAttribute('data-product-name')) {
      name = card.getAttribute('data-product-name');
    }

    // 2. 설명 추출 (p.text-xs, p.text-ink-muted, p.text-ink-3, p.text-ink-2 등)
    var desc = '';
    var descEls = card.querySelectorAll('p.text-ink-muted, p.text-ink-3, p.text-ink-2, p.text-xs, .product-desc');
    for (var i = 0; i < descEls.length; i++) {
      var dText = descEls[i].textContent.trim();
      if (dText && !dText.startsWith('(') && !dText.startsWith('₩') && !descEls[i].classList.contains('text-price') && !descEls[i].classList.contains('font-bold')) {
        desc = dText;
        break;
      }
    }

    // 3. 가격 추출 — 할인가(.text-discount)가 있으면 정가(line-through)보다 우선한다
    var price = '';
    var priceEl = card.querySelector('.text-discount, .text-price, [data-price], p.text-xl.font-bold, p.text-lg.font-bold, p.text-lg.font-extrabold, p.font-extrabold, p.font-bold, span.font-bold, .price');
    if (priceEl) {
      price = priceEl.textContent.trim().replace(/[^0-9,]/g, '');
    }
    if (!price) {
      var allP = card.querySelectorAll('p, span');
      for (var j = 0; j < allP.length; j++) {
        if (allP[j].classList.contains('line-through')) continue; // 취소선 정가는 건너뛴다
        var t = allP[j].textContent.trim();
        if (t.includes('₩') || (/[0-9]{1,3}(,[0-9]{3})+/.test(t) && !t.includes('('))) {
          var matched = t.replace(/[^0-9,]/g, '');
          if (matched) {
            price = matched;
            break;
          }
        }
      }
    }

    // 4. 이미지 경로 추출 및 정규화
    var rawImg = imgEl ? (imgEl.getAttribute('src') || imgEl.src) : '';
    var image = rawImg;
    if (image && !image.startsWith('../') && !image.startsWith('http') && !image.startsWith('/')) {
      if (image.startsWith('assets/')) {
        image = '../' + image;
      } else {
        image = '../assets/' + image;
      }
    }

    // 5. 상세페이지 링크 URL 빌드
    var formattedPrice = price ? (price.startsWith('₩') ? price : '₩' + price) : '₩119,000';
    var isInsideCommon = window.location.pathname.includes('/common/');
    var detailPagePath = isInsideCommon ? 'product-detail.html' : 'common/product-detail.html';
    
    var params = new URLSearchParams();
    if (name) params.set('name', name);
    if (formattedPrice) params.set('price', formattedPrice);
    if (desc) params.set('desc', desc);
    if (image) params.set('img', image);

    var href = detailPagePath + '?' + params.toString();
    var id = name || (image ? image.split('/').pop().split('?')[0] : 'item-' + Date.now());

    return {
      id: id,
      name: name || id,
      title: name || id,
      price: price || '119,000',
      desc: desc || '',
      image: image || '../assets/images/products/kivik.png',
      href: href
    };
  }

  function syncHeartState(btn, id) {
    if (!btn || !id) return;
    var active = isInList(WISHLIST_KEY, id);
    var svg = btn.querySelector('svg');
    
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
        svg.classList.remove('text-ink', 'text-ink-muted', 'text-ink-3', 'text-gray-400', 'text-brand');
        svg.setAttribute('fill', 'currentColor');
        svg.style.fill = '#ef4444';
        svg.style.color = '#ef4444';
        var paths = svg.querySelectorAll('path');
        paths.forEach(function(p) {
          p.style.fill = '#ef4444';
          p.style.stroke = '#ef4444';
        });
      } else {
        svg.classList.remove('text-red-500', 'fill-red-500');
        svg.setAttribute('fill', 'none');
        svg.style.fill = '';
        svg.style.color = '';
        var paths = svg.querySelectorAll('path');
        paths.forEach(function(p) {
          p.style.fill = '';
          p.style.stroke = '';
        });
      }
    } else if (btn.id === 'wishlist-toggle-btn' || btn.innerText.includes('♡') || btn.innerText.includes('♥')) {
      btn.innerText = active ? '♥' : '♡';
      if (active) {
        btn.classList.add('text-red-500');
      } else {
        btn.classList.remove('text-red-500');
      }
    }
  }

  function syncCartState(btn, id) {
    if (!btn || !id) return;
    var active = isInList(CART_KEY, id);
    var bagIcon = btn.querySelector('.cart-icon-bag');
    var checkIcon = btn.querySelector('.cart-icon-check');
    btn.classList.toggle('in-cart', active);
    if (active) {
      btn.style.borderColor = '#10b981';
      btn.style.backgroundColor = '#ecfdf5';
      btn.style.color = '#059669';
    } else {
      btn.style.borderColor = '';
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    if (bagIcon && checkIcon) {
      bagIcon.classList.toggle('hidden', active);
      checkIcon.classList.toggle('hidden', !active);
    }
  }

  function syncAllButtonStates() {
    document.querySelectorAll(WISH_SELECTOR).forEach(function (btn) {
      if (btn.classList.contains('delete-wish-btn')) return;
      var card = findProductCard(btn);
      var product = card ? extractProduct(card) : null;
      var pId = (product && product.id) || (btn.getAttribute('data-id'));
      if (pId) syncHeartState(btn, pId);
    });

    document.querySelectorAll(CART_SELECTOR).forEach(function (btn) {
      var card = findProductCard(btn);
      var product = card ? extractProduct(card) : null;
      var pId = (product && product.id) || (btn.getAttribute('data-id'));
      if (pId) syncCartState(btn, pId);
    });
  }

  /* 클릭 위임(event delegation) */
  document.addEventListener('click', function (e) {
    // 1. 위시리스트 버튼 클릭
    var wishBtn = e.target.closest(WISH_SELECTOR);
    if (wishBtn) {
      if (wishBtn.classList.contains('delete-wish-btn')) return; // wishlist.html 자체 핸들러 처리

      e.preventDefault();
      e.stopPropagation();

      var card = findProductCard(wishBtn);
      var wishProduct = card ? extractProduct(card) : null;

      // 상세페이지 단독 버튼인 경우
      if ((!wishProduct || !wishProduct.name) && wishBtn.id === 'wishlist-toggle-btn') {
        var detailTitle = document.querySelector('h1, .product-detail-title');
        var detailPrice = document.querySelector('.text-price, [data-price], span.text-3xl');
        var detailImg = document.querySelector('#gallery-main-image, .product-main-img, img.main-prod-image');
        var detailDesc = document.querySelector('#buy-box-section p.text-base, #buy-box-section p.text-ink-muted');
        if (detailTitle) {
          var dName = detailTitle.textContent.trim();
          var dPrice = detailPrice ? detailPrice.textContent.trim().replace(/[^0-9,]/g, '') : '116,000';
          var dDesc = detailDesc ? detailDesc.textContent.trim() : '';
          var dImg = detailImg ? (detailImg.getAttribute('src') || detailImg.src) : '../assets/p-sagmastare-1.png';
          wishProduct = {
            id: dName,
            name: dName,
            title: dName,
            price: dPrice,
            desc: dDesc,
            image: dImg,
            href: window.location.href
          };
        }
      }

      if (!wishProduct || !wishProduct.id) return;

      var pId = wishProduct.id;
      var wasInList = isInList(WISHLIST_KEY, pId);

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
    var cartBtn = e.target.closest(CART_SELECTOR);
    if (cartBtn) {
      if (cartBtn.classList.contains('add-cart-btn') && window.location.pathname.includes('wishlist.html')) {
        return; // wishlist.html 자체 핸들러 처리
      }

      e.preventDefault();
      var card = findProductCard(cartBtn);
      var cartProduct = card ? extractProduct(card) : null;

      if (!cartProduct || !cartProduct.id) {
        var detailTitle = document.querySelector('h1, .product-detail-title');
        var detailPrice = document.querySelector('.text-price, [data-price], span.text-3xl');
        var detailImg = document.querySelector('#gallery-main-image, .product-main-img, img.main-prod-image');
        var detailDesc = document.querySelector('#buy-box-section p.text-base, #buy-box-section p.text-ink-muted');
        if (detailTitle) {
          var cdName = detailTitle.textContent.trim();
          var cdPrice = detailPrice ? detailPrice.textContent.trim().replace(/[^0-9,]/g, '') : '116,000';
          var cdDesc = detailDesc ? detailDesc.textContent.trim() : '';
          var cdImg = detailImg ? (detailImg.getAttribute('src') || detailImg.src) : '../assets/p-sagmastare-1.png';
          cartProduct = {
            id: cdName,
            name: cdName,
            title: cdName,
            price: cdPrice,
            desc: cdDesc,
            image: cdImg,
            href: window.location.href
          };
        }
      }

      if (!cartProduct || !cartProduct.id) return;

      var pId = cartProduct.id;
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
    var buyBtn = e.target.closest(BUY_SELECTOR);
    if (buyBtn) {
      e.preventDefault();
      var buyCard = findProductCard(buyBtn);
      var buyProduct = buyCard ? extractProduct(buyCard) : null;

      if (!buyProduct || !buyProduct.id) {
        var buyDetailTitle = document.querySelector('h1, .product-detail-title');
        var buyDetailPrice = document.querySelector('.text-price, [data-price], span.text-3xl');
        var buyDetailImg = document.querySelector('#gallery-main-image, .product-main-img, img.main-prod-image');
        var buyDetailDesc = document.querySelector('#buy-box-section p.text-base, #buy-box-section p.text-ink-muted');
        if (buyDetailTitle) {
          var bdName = buyDetailTitle.textContent.trim();
          var bdPrice = buyDetailPrice ? buyDetailPrice.textContent.trim().replace(/[^0-9,]/g, '') : '116,000';
          var bdDesc = buyDetailDesc ? buyDetailDesc.textContent.trim() : '';
          var bdImg = buyDetailImg ? (buyDetailImg.getAttribute('src') || buyDetailImg.src) : '../assets/p-sagmastare-1.png';
          buyProduct = {
            id: bdName,
            name: bdName,
            title: bdName,
            price: bdPrice,
            desc: bdDesc,
            image: bdImg,
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
})();
