/* Signal Capsule — interaction logic keeps navigation tactile, mobile behavior accessible, and platform metrics intentionally measured. */
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const backdrop = document.querySelector('#mobile-menu-backdrop');
  const mobileMenu = document.querySelector('#mobile-menu');
  const navItems = Array.from(document.querySelectorAll('[data-nav]'));
  let menuOpen = false;

  function setActiveNav(target) {
    const href = target.getAttribute('href');
    navItems.forEach((item) => {
      const isActive = item.getAttribute('href') === href;
      item.classList.toggle('is-active', isActive);
      if (isActive) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  function setMenu(nextState) {
    menuOpen = nextState;
    if (!toggle || !backdrop || !mobileMenu) return;
    toggle.classList.toggle('is-open', nextState);
    toggle.setAttribute('aria-expanded', String(nextState));
    toggle.setAttribute('aria-label', nextState ? 'Close menu' : 'Open menu');
    mobileMenu.setAttribute('aria-hidden', String(!nextState));
    backdrop.hidden = !nextState;
    document.body.classList.toggle('menu-open', nextState);
  }

  if (toggle) {
    toggle.addEventListener('click', () => setMenu(!menuOpen));
  }

  if (backdrop) {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) setMenu(false);
    });
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      setActiveNav(item);
      setMenu(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720 && menuOpen) setMenu(false);
  });

  const values = Array.from(document.querySelectorAll('.stat-value'));
  let hasCounted = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function countValue(element, index) {
    const target = Number(element.dataset.target || 0);
    const decimals = Number(element.dataset.decimals || 0);
    const suffix = element.dataset.suffix || '';
    const duration = 1500 + index * 80;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = target * easeOutCubic(progress);
      element.textContent = `${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function runCounters() {
    if (hasCounted) return;
    hasCounted = true;
    values.forEach((element, index) => {
      window.setTimeout(() => countValue(element, index), 480 + index * 90);
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        runCounters();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    const stats = document.querySelector('.stats-footer');
    if (stats) observer.observe(stats);
  } else {
    runCounters();
  }
}());

