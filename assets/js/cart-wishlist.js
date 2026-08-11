/* 사이트 전역 위시리스트 / 장바구니 상태 (localStorage 기반, 페이지 간 공유) */
(function () {
  var WISHLIST_KEY = 'ikea_wishlist_items';
  var CART_KEY = 'ikea_cart_items';

  function getItems(key) {
    try {
      var raw = localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function setItems(key, items) {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {}
  }

  function isInList(key, id) {
    return getItems(key).some(function (item) { return item.id === id; });
  }

  function addItem(key, product) {
    var items = getItems(key);
    if (!items.some(function (item) { return item.id === product.id; })) {
      items.push(product);
      setItems(key, items);
    }
    return items;
  }

  function removeItem(key, id) {
    var items = getItems(key).filter(function (item) { return item.id !== id; });
    setItems(key, items);
    return items;
  }

  function updateBadgeEl(badge, count) {
    if (!badge) return;
    if (count > 0) {
      badge.textContent = String(count);
      badge.style.display = 'inline-flex';
    } else {
      badge.textContent = '';
      badge.style.display = 'none';
    }
  }

  function refreshBadges() {
    updateBadgeEl(document.getElementById('wishlist-badge'), getItems(WISHLIST_KEY).length);
    updateBadgeEl(document.getElementById('cart-badge'), getItems(CART_KEY).length);
  }

  function extractProduct(card) {
    var nameEl = card.querySelector('h3, h4');
    var priceEl = card.querySelector('.text-price');
    var descEl = card.querySelector('p.text-ink-muted, p.text-ink-2');
    var imgEl = card.querySelector('img');
    var linkEl = card.querySelector('a[href*="상세"], a.underline, a[href$=".html"]');
    var name = nameEl ? nameEl.textContent.trim() : '';
    return {
      id: name,
      name: name,
      price: priceEl ? priceEl.textContent.trim() : '',
      desc: descEl ? descEl.textContent.trim() : '',
      image: imgEl ? imgEl.src : '',
      href: linkEl ? linkEl.href : ''
    };
  }

  function syncHeartState(btn, id) {
    var svg = btn.querySelector('svg');
    if (!svg) return;
    var active = isInList(WISHLIST_KEY, id);
    if (active) {
      btn.classList.add('active', 'text-red-500');
      btn.classList.remove('text-ink', 'text-gray-400');
      svg.setAttribute('fill', 'currentColor');
    } else {
      btn.classList.remove('active', 'text-red-500');
      btn.classList.add('text-ink');
      svg.setAttribute('fill', 'none');
    }
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  function syncCartState(btn, id) {
    var active = isInList(CART_KEY, id);
    var bagIcon = btn.querySelector('.cart-icon-bag');
    var checkIcon = btn.querySelector('.cart-icon-check');
    btn.classList.toggle('in-cart', active);
    if (active) {
      btn.style.borderColor = '#10b981';
      btn.style.backgroundColor = '#ecfdf5';
      btn.style.color = '#059669';
      if (btn.classList.contains('buy-btn')) {
        btn.textContent = '담김 ✓';
      }
    } else {
      btn.style.borderColor = '';
      btn.style.backgroundColor = '';
      btn.style.color = '';
      if (btn.classList.contains('buy-btn')) {
        btn.textContent = '구매하기';
      }
    }
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    if (bagIcon && checkIcon) {
      bagIcon.classList.toggle('hidden', active);
      checkIcon.classList.toggle('hidden', !active);
    }
  }

  function syncAllButtonStates() {
    document.querySelectorAll('button[aria-label*="위시리스트"], .wish-btn').forEach(function (btn) {
      var card = btn.closest('article') || btn.closest('.card') || btn.closest('.prod-card');
      if (!card) return;
      var product = extractProduct(card);
      if (product.id) syncHeartState(btn, product.id);
    });
    document.querySelectorAll('button[aria-label*="장바구니"], .add-cart-btn, .buy-btn').forEach(function (btn) {
      var card = btn.closest('article') || btn.closest('.card') || btn.closest('.prod-card');
      if (!card) return;
      var product = extractProduct(card);
      if (product.id) syncCartState(btn, product.id);
    });
  }

  /* 클릭 위임(event delegation) 방식: Swiper/GSAP 등이 나중에 DOM을 다시 그리거나
     슬라이드를 복제해도, document 에 한 번만 걸어둔 리스너라 항상 동작한다. */
  document.addEventListener('click', function (e) {
    var wishBtn = e.target.closest('button[aria-label*="위시리스트"], .wish-btn');
    if (wishBtn) {
      var wishCard = wishBtn.closest('article') || wishBtn.closest('.card') || wishBtn.closest('.prod-card');
      if (!wishCard) return;
      var wishProduct = extractProduct(wishCard);
      if (!wishProduct.id) return;
      e.preventDefault();
      if (isInList(WISHLIST_KEY, wishProduct.id)) {
        removeItem(WISHLIST_KEY, wishProduct.id);
      } else {
        addItem(WISHLIST_KEY, wishProduct);
      }
      syncHeartState(wishBtn, wishProduct.id);
      refreshBadges();
      return;
    }

    var cartBtn = e.target.closest('button[aria-label*="장바구니"], .add-cart-btn, .buy-btn');
    if (cartBtn) {
      var cartCard = cartBtn.closest('article') || cartBtn.closest('.card') || cartBtn.closest('.prod-card');
      if (!cartCard) return;
      var cartProduct = extractProduct(cartCard);
      if (!cartProduct.id) return;
      e.preventDefault();
      if (isInList(CART_KEY, cartProduct.id)) {
        removeItem(CART_KEY, cartProduct.id);
      } else {
        addItem(CART_KEY, cartProduct);
      }
      syncCartState(cartBtn, cartProduct.id);
      refreshBadges();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    refreshBadges();
    syncAllButtonStates();
  });
  window.addEventListener('load', function () {
    refreshBadges();
    syncAllButtonStates();
  });

  window.WishlistCart = {
    WISHLIST_KEY: WISHLIST_KEY,
    CART_KEY: CART_KEY,
    getItems: getItems,
    addItem: addItem,
    removeItem: removeItem,
    isInList: isInList,
    refreshBadges: refreshBadges
  };
})();
