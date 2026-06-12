/* Orivo — storefront behaviours for the Shopify theme.
   Idempotent: ORIVO_INIT() can be called again after AJAX/section reloads. */
(function () {
  'use strict';

  /* Silence the benign ResizeObserver loop warning. */
  window.addEventListener('error', function (e) {
    if (e && e.message && e.message.indexOf('ResizeObserver loop') !== -1) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  /* ---- Scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal:not([data-revealed])');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { e.setAttribute('data-revealed', '1'); io.observe(e); });
  }

  /* ---- Countdown (rolling 4h window stored in localStorage) ---- */
  var cdStarted = false;
  function initCountdown() {
    if (cdStarted) return;
    var WINDOW = 1000 * 60 * 60 * 4, key = 'orivo_flash_end';
    function ends() {
      var e = parseInt(localStorage.getItem(key) || '0', 10);
      if (!e || e < Date.now()) { e = Date.now() + WINDOW; localStorage.setItem(key, String(e)); }
      return e;
    }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var diff = Math.max(0, ends() - Date.now());
      var h = Math.floor(diff / 3.6e6), m = Math.floor(diff % 3.6e6 / 6e4), s = Math.floor(diff % 6e4 / 1000);
      document.querySelectorAll('[data-countdown]').forEach(function (n) {
        n.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
      });
    }
    if (document.querySelector('[data-countdown]')) { tick(); setInterval(tick, 1000); cdStarted = true; }
  }

  /* ---- Mobile drawer ---- */
  function initDrawer() {
    var drawer = document.querySelector('[data-drawer]');
    if (!drawer || drawer.__wired) return;
    drawer.__wired = true;
    document.querySelectorAll('[data-nav-toggle]').forEach(function (b) {
      b.addEventListener('click', function () { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; });
    });
    drawer.querySelectorAll('[data-close]').forEach(function (c) {
      c.addEventListener('click', function () { drawer.classList.remove('open'); document.body.style.overflow = ''; });
    });
  }

  /* ---- FAQ accordion ---- */
  function initAccordion() {
    document.querySelectorAll('.acc-q:not([data-wired])').forEach(function (q) {
      q.setAttribute('data-wired', '1');
      q.addEventListener('click', function () {
        var item = q.closest('.acc-item');
        if (item) item.classList.toggle('open');
      });
    });
  }

  /* ---- Product gallery: thumbs / dots / arrows swap the main image ---- */
  function initGallery() {
    document.querySelectorAll('[data-gallery]:not([data-wired])').forEach(function (g) {
      g.setAttribute('data-wired', '1');
      var imgs = g.querySelectorAll('[data-main-img]');
      var dots = g.querySelectorAll('.g-dot');
      var thumbs = g.querySelectorAll('.g-thumb');
      var idx = 0, n = imgs.length || 1;
      function show(i) {
        idx = (i + n) % n;
        imgs.forEach(function (im, k) { im.style.display = k === idx ? '' : 'none'; });
        dots.forEach(function (d, k) { d.classList.toggle('on', k === idx); });
        thumbs.forEach(function (t, k) { t.classList.toggle('on', k === idx); });
      }
      g.querySelectorAll('[data-go]').forEach(function (b) {
        b.addEventListener('click', function () { show(parseInt(b.getAttribute('data-go'), 10)); });
      });
      g.querySelectorAll('[data-step-img]').forEach(function (b) {
        b.addEventListener('click', function () { show(idx + parseInt(b.getAttribute('data-step-img'), 10)); });
      });
      show(0);
    });
  }

  /* ---- Quantity steppers ---- */
  function initQty() {
    document.querySelectorAll('.lux-qty:not([data-wired])').forEach(function (w) {
      w.setAttribute('data-wired', '1');
      var input = w.querySelector('input');
      w.querySelectorAll('[data-step]').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(b.getAttribute('data-step'), 10));
          input.value = v;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    });
  }

  /* ---- AJAX add-to-cart + cart count ---- */
  function refreshCount() {
    fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (c) {
        document.querySelectorAll('[data-cart-count]').forEach(function (n) {
          n.textContent = c.item_count;
          n.style.display = c.item_count > 0 ? '' : 'none';
        });
      }).catch(function () {});
  }

  function initAddToCart() {
    document.querySelectorAll('[data-add]:not([data-wired])').forEach(function (btn) {
      btn.setAttribute('data-wired', '1');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var id = btn.getAttribute('data-variant-id');
        if (!id) { window.location.href = '/cart'; return; }
        var wrap = btn.closest('[data-qty-wrap]') || document;
        var qtyInput = wrap.querySelector('.lux-qty input');
        var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : (parseInt(btn.getAttribute('data-qty'), 10) || 1);
        var label = btn.querySelector('[data-add-label]');
        var original = label ? label.textContent : '';
        if (label) label.textContent = 'Adding…';
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ items: [{ id: parseInt(id, 10), quantity: qty }] })
        }).then(function (r) {
          if (!r.ok) throw new Error('add failed');
          return r.json();
        }).then(function () {
          if (label) label.textContent = 'Added ✓';
          refreshCount();
          if (btn.hasAttribute('data-buy-now')) { window.location.href = '/checkout'; return; }
          setTimeout(function () { if (label) label.textContent = original; }, 1400);
        }).catch(function () {
          window.location.href = '/cart';
        });
      });
    });
  }

  window.ORIVO_INIT = function () {
    initReveal(); initCountdown(); initDrawer(); initAccordion();
    initGallery(); initQty(); initAddToCart();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.ORIVO_INIT(); refreshCount(); });
  } else { window.ORIVO_INIT(); refreshCount(); }
})();
