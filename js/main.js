/* ============================================================
   Prof. Joe Abugu, SAN & Co. — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* --- Nav toggle (hamburger) --- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close on link click (mobile)
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Mark active link
    var path = location.pathname.replace(/\/+$/, '') || '/';
    links.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href').replace(/\/+$/, '') || '/';
      if (href === path || (href !== '/' && href !== 'index.html' && path.endsWith(href))) {
        a.classList.add('active');
      }
    });
  }

  /* --- Hero Slider --- */
  function initSlider() {
    var hero   = document.querySelector('.hero');
    if (!hero) return;

    var track  = hero.querySelector('.slider-track');
    var slides = hero.querySelectorAll('.slide');
    var dots   = hero.querySelectorAll('.slider-dot');
    var prevBtn = hero.querySelector('.slider-prev');
    var nextBtn = hero.querySelector('.slider-next');

    if (!track || !slides.length) return;

    var current  = 0;
    var total    = slides.length;
    var timer    = null;
    var INTERVAL = 6000;
    var PAUSE_MS = 10000; // pause after manual nav

    function goTo(idx) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');

      current = (idx + total) % total;

      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');

      track.style.transform = 'translateX(-' + (current * 100) + '%)';
    }

    function startAuto() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1); }, INTERVAL);
    }

    function pauseThenResume() {
      clearInterval(timer);
      timer = setTimeout(startAuto, PAUSE_MS);
    }

    // Dot clicks
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
        pauseThenResume();
      });
    });

    // Arrow clicks
    if (prevBtn) {
      prevBtn.addEventListener('click', function () { goTo(current - 1); pauseThenResume(); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () { goTo(current + 1); pauseThenResume(); });
    }

    // Touch / swipe
    var touchStartX = 0;
    hero.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        goTo(dx < 0 ? current + 1 : current - 1);
        pauseThenResume();
      }
    }, { passive: true });

    // Pause on hover
    hero.addEventListener('mouseenter', function () { clearInterval(timer); });
    hero.addEventListener('mouseleave', startAuto);

    // Initialise
    goTo(0);
    startAuto();
  }

  /* --- Counter animation for stats --- */
  function initCounters() {
    var nums = document.querySelectorAll('.stat-num[data-target]');
    if (!nums.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        animateCounter(entry.target);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { obs.observe(el); });
  }

  function animateCounter(el) {
    var raw    = el.getAttribute('data-target');
    var suffix = raw.replace(/[\d,]/g, '');    // e.g. '+', 'yrs', '%'
    var target = parseInt(raw.replace(/\D/g, ''), 10);
    var dur    = 1800;
    var start  = performance.now();

    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      var val  = Math.round(ease * target);
      el.textContent = val.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* --- Smooth reveal on scroll --- */
  function initReveal() {
    if (!window.IntersectionObserver) return;
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(function (el) { obs.observe(el); });
  }

  /* --- Contact form (static — shows success message) --- */
  function initContactForm() {
    var form = document.querySelector('.js-contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var msg = form.querySelector('.form-success');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      // Simulate async (replace with actual endpoint integration if needed)
      setTimeout(function () {
        if (msg) { msg.style.display = 'block'; }
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
      }, 800);
    });
  }

  /* --- Sticky nav shadow --- */
  function initNavShadow() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 8
        ? '0 4px 24px rgba(0,0,0,.35)'
        : '0 2px 16px rgba(0,0,0,.25)';
    }, { passive: true });
  }

  /* --- Accordion (for practice areas detail) --- */
  function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(function (hdr) {
      hdr.addEventListener('click', function () {
        var item = hdr.parentElement;
        var body = item.querySelector('.accordion-body');
        var open = item.classList.toggle('open');
        hdr.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (body) body.style.maxHeight = open ? body.scrollHeight + 'px' : '';
      });
    });
  }

  /* --- Back-to-top --- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.hidden = window.scrollY < 400;
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Boot --- */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initSlider();
    initCounters();
    initReveal();
    initContactForm();
    initNavShadow();
    initAccordion();
    initBackToTop();
  });

})();
