/* ═══════════════════════════════════════════
   ELVOZTHERN — Main JavaScript
   Navbar · Hero Snap · Scroll Animations · Counter
═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ────────────────────────────────────────
     1. Navbar: transparent → solid on scroll
  ──────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  let lastScrollY = 0;

  function updateNavbar() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run once on load

  /* ────────────────────────────────────────
     2. Hero image load → trigger zoom-out
  ──────────────────────────────────────── */
  
  const heroSection = document.getElementById('hero');
  const heroImg = heroSection.querySelector('.hero-img');

  function activateHero() {
    heroSection.classList.add('loaded');
  }

  if (heroImg.complete) {
    activateHero();
  } else {
    heroImg.addEventListener('load', activateHero);
  }

  /* ────────────────────────────────────────
     3. Hero / Tentang Snap Scroll
     - Scrolling down from Hero → snap to #tentang
     - Scrolling up from Tentang → snap to #hero
  ──────────────────────────────────────── */
  const tentangSection = document.getElementById('tentang');
  let isSnapping = false;

  function snapToSection(targetId) {
    if (isSnapping) return;
    isSnapping = true;
    const target = document.getElementById(targetId);
    if (!target) { isSnapping = false; return; }

    target.scrollIntoView({ behavior: 'smooth' });

    // Release snap lock after animation completes
    setTimeout(() => {
      isSnapping = false;
    }, 900);
  }

  let wheelDeltaAccum = 0;
  const WHEEL_THRESHOLD = 10;

  window.addEventListener('wheel', function (e) {
    if (isSnapping) { e.preventDefault(); return; }

    const heroBottom   = heroSection.getBoundingClientRect().bottom;
    const heroTop      = heroSection.getBoundingClientRect().top;
    const tentangTop   = tentangSection.getBoundingClientRect().top;
    const tentangBottom = tentangSection.getBoundingClientRect().bottom;

    const isInHero    = heroTop <= 10 && heroBottom > window.innerHeight * 0.4;
    const isInTentang = tentangTop <= 80 && tentangTop > -80;

    if (isInHero && e.deltaY > 0) {
      // Scrolling DOWN inside hero → snap to tentang
      wheelDeltaAccum += Math.abs(e.deltaY);
      if (wheelDeltaAccum > WHEEL_THRESHOLD) {
        wheelDeltaAccum = 0;
        snapToSection('tentang');
      }
    } else if (isInTentang && e.deltaY < 0) {
      // Scrolling UP inside tentang → snap to hero
      wheelDeltaAccum += Math.abs(e.deltaY);
      if (wheelDeltaAccum > WHEEL_THRESHOLD) {
        wheelDeltaAccum = 0;
        snapToSection('hero');
      }
    } else {
      wheelDeltaAccum = 0;
    }
  }, { passive: true });

  /* Touch support for snap */
  let touchStartY = 0;

  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', function (e) {
    if (isSnapping) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    const threshold = 60;

    const heroTop      = heroSection.getBoundingClientRect().top;
    const heroBottom   = heroSection.getBoundingClientRect().bottom;
    const tentangTop   = tentangSection.getBoundingClientRect().top;

    const isInHero    = heroTop <= 10 && heroBottom > window.innerHeight * 0.4;
    const isInTentang = tentangTop <= 80 && tentangTop > -80;

    if (isInHero && diff > threshold) {
      snapToSection('tentang');
    } else if (isInTentang && diff < -threshold) {
      snapToSection('hero');
    }
  }, { passive: true });

  /* ────────────────────────────────────────
     4. Active nav link highlight
  ──────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#navbar .nav-links a[href^="#"]');

  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  /* ────────────────────────────────────────
     5. Timeline scroll reveal
  ──────────────────────────────────────── */
  const tlItems = document.querySelectorAll('.tl-item');

  const tlObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        tlObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  tlItems.forEach(item => tlObserver.observe(item));

  /* ────────────────────────────────────────
     6. Achievement counter animation
  ──────────────────────────────────────── */
  const achNums = document.querySelectorAll('.ach-num[data-target]');
  let countersStarted = false;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }

    requestAnimationFrame(update);
  }

  const prestasiSection = document.getElementById('prestasi');

  const counterObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      achNums.forEach((el, i) => {
        setTimeout(() => animateCounter(el), i * 150);
      });
      counterObserver.disconnect();
    }
  }, { threshold: 0.3 });

  if (prestasiSection) counterObserver.observe(prestasiSection);

  /* ────────────────────────────────────────
     7. General scroll reveal for cards/sections
  ──────────────────────────────────────── */
  const revealEls = document.querySelectorAll(
    '.pembina-card, .kontak-card, .lomba-card, .ach-stat-card, .fp-item, .foto-item, .foto-pembina-item'
  );

  // Set initial hidden state
  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.55s ease ${(i % 4) * 0.08}s, transform 0.55s ease ${(i % 4) * 0.08}s`;
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ────────────────────────────────────────
     8. Smooth nav link click
  ──────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      isSnapping = true;
      target.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => { isSnapping = false; }, 1000);
    });
  });

  /* ────────────────────────────────────────
     9. Navbar active link style injection
  ──────────────────────────────────────── */
  const activeStyle = document.createElement('style');
  activeStyle.textContent = `
    #navbar .nav-links li a.active {
      color: var(--gold-light) !important;
    }
    #navbar .nav-links li a.active::after {
      transform: translateX(-50%) scaleX(1) !important;
    }
  `;
  document.head.appendChild(activeStyle);

  /* ────────────────────────────────────────
     10. Parallax effect on hero image
  ──────────────────────────────────────── */
  function heroParallax() {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight * 1.5) {
      heroImg.style.transform = `scale(1) translateY(${scrollY * 0.25}px)`;
    }
  }

  window.addEventListener('scroll', heroParallax, { passive: true });

})();
