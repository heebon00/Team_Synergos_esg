/* 사이트 전역 위시리스트 / 장바구니 상태 (localStorage 기반, 페이지 간 공유) */
(function () {
  var WISHLIST_KEY = 'ikea_wishlist_items';
  var CART_KEY = 'ikea_cart_items';
  var INIT_FLAG_KEY = 'ikea_wishlist_initialized';

  var WISH_SELECTOR = 'button[aria-label*="위시리스트"], .wish-btn, button[aria-label*="찜"], button[aria-label*="관심상품"], #wishlist-toggle-btn';
  var CART_SELECTOR = 'button[aria-label*="장바구니"], .add-cart-btn, .buy-btn, .buy-now-btn';

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

  function extractProduct(card) {
    if (!card) return {};
    var nameEl = card.querySelector('h3, h4, .product-title, [data-title], strong');
    var priceEl = card.querySelector('.text-price, .price, [data-price]');
    var descEl = card.querySelector('p.text-ink-muted, p.text-ink-2, .product-desc, p.text-xs');
    var imgEl = card.querySelector('img:not([alt*="로고"]):not([alt*="icon"]):not(.icon)');
    var linkEl = card.querySelector('a[href*="detail"], a[href*="product"], a[href$=".html"]');
    
    var name = nameEl ? nameEl.textContent.trim() : '';
    if (!name && card.getAttribute('data-product-name')) {
      name = card.getAttribute('data-product-name');
    }
    
    var price = priceEl ? priceEl.textContent.trim().replace(/^₩/, '').trim() : '';
    var desc = descEl ? descEl.textContent.trim() : '';
    var image = imgEl ? imgEl.src : '';
    var href = linkEl ? linkEl.href : '';

    var id = name || (imgEl ? imgEl.src.split('/').pop().split('?')[0] : 'item-' + Date.now());

    return {
      id: id,
      name: name || id,
      title: name || id,
      price: price || '0',
      desc: desc,
      image: image,
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
      var card = btn.closest('article, .card, .product-card, .swiper-slide, [data-product-card], div.group, div.relative');
      var product = card ? extractProduct(card) : null;
      var pId = (product && product.id) || (btn.getAttribute('data-id'));
      if (pId) syncHeartState(btn, pId);
    });

    document.querySelectorAll(CART_SELECTOR).forEach(function (btn) {
      var card = btn.closest('article, .card, .product-card, .swiper-slide, [data-product-card], div.group, div.relative');
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

      var card = wishBtn.closest('article, .card, .product-card, .swiper-slide, [data-product-card], div.group, div.relative');
      var wishProduct = card ? extractProduct(card) : null;

      // 상세페이지 단독 버튼인 경우
      if ((!wishProduct || !wishProduct.name) && wishBtn.id === 'wishlist-toggle-btn') {
        var detailTitle = document.querySelector('h1, .product-detail-title');
        var detailPrice = document.querySelector('.text-price, [data-price]');
        var detailImg = document.querySelector('.product-main-img, img.main-prod-image');
        if (detailTitle) {
          wishProduct = {
            id: detailTitle.textContent.trim(),
            name: detailTitle.textContent.trim(),
            title: detailTitle.textContent.trim(),
            price: detailPrice ? detailPrice.textContent.trim().replace(/^₩/, '').trim() : '0',
            desc: '',
            image: detailImg ? detailImg.src : '',
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
      var card = cartBtn.closest('article, .card, .product-card, .swiper-slide, [data-product-card], div.group, div.relative');
      var cartProduct = card ? extractProduct(card) : null;

      if (!cartProduct || !cartProduct.id) {
        var detailTitle = document.querySelector('h1, .product-detail-title');
        var detailPrice = document.querySelector('.text-price, [data-price]');
        var detailImg = document.querySelector('.product-main-img, img.main-prod-image');
        if (detailTitle) {
          cartProduct = {
            id: detailTitle.textContent.trim(),
            name: detailTitle.textContent.trim(),
            title: detailTitle.textContent.trim(),
            price: detailPrice ? detailPrice.textContent.trim().replace(/^₩/, '').trim() : '0',
            desc: '',
            image: detailImg ? detailImg.src : '',
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
    setItems: setItems,
    addItem: addItem,
    removeItem: removeItem,
    isInList: isInList,
    refreshBadges: refreshBadges,
    syncAllButtonStates: syncAllButtonStates,
    showToast: showToast,
    addToWishlist: function(name) { addItem(WISHLIST_KEY, { id: name, name: name, title: name }); refreshBadges(); syncAllButtonStates(); },
    removeFromWishlist: function(name) { removeItem(WISHLIST_KEY, name); refreshBadges(); syncAllButtonStates(); }
  };

  window.CartWishlist = window.WishlistCart;
})();
