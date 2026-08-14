(function () {
  let accountHref = '';
  let signupHref = '';

  function buildModal() {
    if (document.getElementById('account-confirm-modal')) return;

    const wrap = document.createElement('div');
    wrap.id = 'account-confirm-modal';
    wrap.className = 'fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'account-confirm-title');
    wrap.innerHTML =
      '<div id="account-confirm-card" class="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col scale-95 opacity-0 transition-all duration-300 ease-out">' +
        '<div class="flex flex-col items-start gap-2 px-6 pt-6 pb-4">' +
          '<h2 id="account-confirm-title" class="text-base font-extrabold text-ink">회원가입 안내</h2>' +
          '<p class="text-sm text-ink-2">아직 IKEA 계정이 없으신가요? 회원가입 페이지로 이동하시겠습니까?</p>' +
        '</div>' +
        '<div class="flex gap-3 px-6 pb-6">' +
          '<button type="button" id="account-confirm-no" class="flex-1 h-10 rounded-lg border border-line-2 text-ink hover:bg-bg-light transition-colors text-sm font-bold">아니오</button>' +
          '<button type="button" id="account-confirm-yes" class="flex-1 h-10 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors text-sm font-bold shadow-sm">예</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) closeModal();
    });

    document.getElementById('account-confirm-yes').addEventListener('click', function () {
      window.location.href = signupHref;
    });

    document.getElementById('account-confirm-no').addEventListener('click', function () {
      window.location.href = accountHref;
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !wrap.classList.contains('hidden')) closeModal();
    });
  }

  function openModal() {
    const wrap = document.getElementById('account-confirm-modal');
    const card = document.getElementById('account-confirm-card');
    if (!wrap || !card) return;
    wrap.classList.remove('hidden');
    setTimeout(function () {
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    }, 10);
  }

  function closeModal() {
    const wrap = document.getElementById('account-confirm-modal');
    const card = document.getElementById('account-confirm-card');
    if (!wrap || !card) return;
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(function () {
      wrap.classList.add('hidden');
    }, 200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('a[aria-label="마이페이지"]');
    if (!links.length) return;

    const firstLink = links[0];
    accountHref = firstLink.getAttribute('href');
    signupHref = accountHref.replace('account.html', 'signup.html');

    buildModal();

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });
  });
})();
