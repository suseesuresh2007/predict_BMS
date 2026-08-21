/* Signal Capsule / PredictBMS — static hash routes, accessible navigation, and a clearly simulated predictive-monitoring demo. */
(function () {
  const validRoutes = ['home', 'dashboard', 'how-it-works', 'technology', 'about'];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const views = Array.from(document.querySelectorAll('[data-view]'));
  const backdrop = document.querySelector('#mobile-menu-backdrop');
  const mobileMenu = document.querySelector('#mobile-menu');
  const mobileToggle = document.querySelector('.menu-toggle');
  let menuOpen = false;
  let activeRoute = 'home';

  const headerTemplate = (active) => `
    <div class="header-inner">
      <a class="logo-button" href="#home" data-route="home" aria-label="PredictBMS home"><img src="/manus-storage/signal-capsule-logo-a_356f6bb8.png" alt="" width="52" height="52" /></a>
      <nav class="desktop-nav" aria-label="Desktop navigation">
        ${['home|Home', 'dashboard|Dashboard', 'how-it-works|How It Works', 'technology|Technology', 'about|About'].map((item) => { const [route, text] = item.split('|'); return `<a class="nav-link ${route === active ? 'is-active' : ''}" href="#${route}" data-route="${route}" ${route === active ? 'aria-current="page"' : ''}>${text}</a>`; }).join('')}
      </nav>
      <a class="sign-in desktop-sign-in" href="#dashboard" data-route="dashboard">Live Monitor</a>
      <button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>`;

  const footerTemplate = () => `
    <div class="footer-inner"><div><a class="footer-brand" href="#home" data-route="home">PredictBMS</a><p>Predictive Battery Intelligence</p></div><nav aria-label="Footer navigation"><a href="#home" data-route="home">Home</a><a href="#dashboard" data-route="dashboard">Dashboard</a><a href="#how-it-works" data-route="how-it-works">How It Works</a><a href="#technology" data-route="technology">Technology</a><a href="#about" data-route="about">About</a></nav><a class="footer-cta" href="#dashboard" data-route="dashboard">Launch Monitor</a></div>`;

  document.querySelectorAll('[data-header]').forEach((header) => { header.innerHTML = headerTemplate(header.dataset.header || 'home'); });
  document.querySelectorAll('[data-footer]').forEach((footer) => { footer.innerHTML = footerTemplate(); });

  function currentRoute() {
    const route = window.location.hash.replace('#', '').trim();
    return validRoutes.includes(route) ? route : 'home';
  }

  function setMenu(nextState) {
    menuOpen = nextState;
    const toggles = Array.from(document.querySelectorAll('.menu-toggle'));
    toggles.forEach((toggle) => {
      toggle.classList.toggle('is-open', nextState);
      toggle.setAttribute('aria-expanded', String(nextState));
      toggle.setAttribute('aria-label', nextState ? 'Close menu' : 'Open menu');
    });
    if (!backdrop || !mobileMenu) return;
    mobileMenu.setAttribute('aria-hidden', String(!nextState));
    backdrop.hidden = !nextState;
    document.body.classList.toggle('menu-open', nextState);
  }

  function syncNavigation(route) {
    document.querySelectorAll('[data-route]').forEach((link) => {
      const isActive = link.dataset.route === route;
      if (link.classList.contains('nav-link') || link.classList.contains('mobile-nav-link')) {
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
    });
    document.querySelectorAll('[data-header]').forEach((header) => { header.innerHTML = headerTemplate(route); });
  }

  function routeTo(route) {
    activeRoute = route;
    views.forEach((view) => { view.hidden = view.dataset.view !== route; });
    document.body.classList.toggle('is-home', route === 'home');
    document.body.classList.toggle('is-product', route !== 'home');
    document.title = route === 'home' ? 'PredictBMS — Predictive Battery Intelligence' : `${route === 'how-it-works' ? 'How It Works' : route[0].toUpperCase() + route.slice(1)} — PredictBMS`;
    syncNavigation(route);
    setMenu(false);
    if (!prefersReducedMotion) window.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo(0, 0);
    if (route === 'dashboard') startGraph();
  }

  window.addEventListener('hashchange', () => routeTo(currentRoute()));
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-route]');
    const toggle = event.target.closest('.menu-toggle');
    if (toggle) { event.preventDefault(); setMenu(!menuOpen); return; }
    if (!link) return;
    const route = link.dataset.route;
    if (!route) return;
    event.preventDefault();
    if (window.location.hash === `#${route}`) routeTo(route);
    else window.location.hash = route;
  });
  if (backdrop) backdrop.addEventListener('click', (event) => { if (event.target === backdrop) setMenu(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuOpen) setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 720 && menuOpen) setMenu(false); resizeCanvas(); });

  const dashboard = {
    stage: 0,
    running: false,
    series: 'temperature',
    score: 12,
    chartHandle: null,
    chartPhase: 0,
    values: [
      { temperature: 34.8, voltage: 48.6, current: 8.2, score: 12, state: 'NORMAL', interpretation: 'LOW RISK', message: 'Battery behavior is currently within the learned operating pattern.', summary: 'Monitoring learned operating behavior.' },
      { temperature: 36.1, voltage: 48.5, current: 8.5, score: 24, state: 'NORMAL', interpretation: 'LOW RISK', message: 'A subtle deviation is being observed within the monitored pattern.', summary: 'Subtle deviation observed. Comparing behavior with the learned range.' },
      { temperature: 38.4, voltage: 48.3, current: 9.1, score: 37, state: 'ELEVATED', interpretation: 'ELEVATED RISK', message: 'Battery behavior is deviating from the learned normal pattern.', summary: 'Anomaly detected. Risk assessment is increasing.' },
      { temperature: 40.2, voltage: 48.0, current: 9.8, score: 54, state: 'ELEVATED', interpretation: 'ELEVATED RISK', message: 'The pattern deviation remains elevated and is being monitored.', summary: 'Risk rising. Preparing an early warning state.' },
      { temperature: 41.8, voltage: 47.7, current: 10.5, score: 72, state: 'HIGH RISK', interpretation: 'HIGH RISK', message: 'Elevated battery behavior detected before the critical threshold.', summary: 'Early warning active. Local alert status represented.' }
    ]
  };

  const $ = (selector) => document.querySelector(selector);
  const animateNumber = (element, from, to, decimals = 0) => {
    const duration = prefersReducedMotion ? 0 : 650;
    const start = performance.now();
    const draw = (now) => {
      const elapsed = duration ? Math.min((now - start) / duration, 1) : 1;
      const eased = 1 - Math.pow(1 - elapsed, 3);
      element.textContent = (from + (to - from) * eased).toFixed(decimals);
      if (elapsed < 1) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };

  function setDashboardStage(stage) {
    const next = dashboard.values[stage];
    const previousScore = dashboard.score;
    dashboard.stage = stage;
    dashboard.score = next.score;
    animateNumber($('#risk-score'), previousScore, next.score);
    animateNumber($('#temperature'), Number($('#temperature').textContent), next.temperature, 1);
    animateNumber($('#voltage'), Number($('#voltage').textContent), next.voltage, 1);
    animateNumber($('#current'), Number($('#current').textContent), next.current, 1);
    $('#battery-state').textContent = next.state;
    $('#battery-message').textContent = next.message;
    $('#risk-interpretation').textContent = next.interpretation;
    $('#demo-summary').textContent = next.summary;
    const anomaly = stage >= 2;
    const high = stage >= 4;
    $('#chart-note').hidden = !anomaly;
    $('#alert-state').classList.toggle('is-active', high);
    $('#alert-state').querySelector('span:last-child').textContent = high ? 'LOCAL ALERT ACTIVE' : 'STANDBY';
    $('#battery-dot').className = `state-dot ${stage >= 4 ? 'is-high' : stage >= 2 ? 'is-elevated' : ''}`;
    if (dashboard.running) $('#stream-label').textContent = 'SIMULATED SENSOR STREAM';
    drawChart();
  }

  function runDemo() {
    if (dashboard.running) return;
    dashboard.running = true;
    $('#run-demo').disabled = true;
    $('#reset-demo').disabled = false;
    $('#stream-label').textContent = 'SIMULATED SENSOR STREAM';
    let step = 0;
    const advance = () => {
      setDashboardStage(step);
      step += 1;
      if (step < dashboard.values.length) window.setTimeout(advance, prefersReducedMotion ? 0 : 1800);
      else { dashboard.running = false; $('#run-demo').disabled = false; }
    };
    advance();
  }

  function resetDemo() {
    dashboard.running = false;
    $('#run-demo').disabled = false;
    $('#reset-demo').disabled = true;
    $('#stream-label').textContent = 'LIVE SENSOR STREAM';
    setDashboardStage(0);
  }

  function canvasMetrics() {
    const canvas = $('#behavior-chart');
    if (!canvas) return null;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { canvas, ctx, width: rect.width, height: rect.height };
  }

  function drawChart() {
    const metrics = canvasMetrics();
    if (!metrics) return;
    const { ctx, width, height } = metrics;
    const pad = { top: 20, right: 18, bottom: 28, left: 42 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) { const y = pad.top + (innerH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke(); }
    for (let i = 0; i < 7; i += 1) { const x = pad.left + (innerW / 6) * i; ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, height - pad.bottom); ctx.stroke(); }
    const normalTop = pad.top + innerH * 0.28;
    const normalBottom = pad.top + innerH * 0.68;
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(pad.left, normalTop, innerW, normalBottom - normalTop);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('NORMAL', 5, normalTop + 5);
    ctx.fillText('RISK', 10, normalBottom);
    const baseBySeries = { temperature: 0.47, voltage: 0.5, current: 0.46, risk: 0.64 };
    const amplitudeBySeries = { temperature: 0.12, voltage: 0.08, current: 0.11, risk: 0.13 };
    const base = baseBySeries[dashboard.series];
    const amplitude = amplitudeBySeries[dashboard.series];
    const anomalyLift = dashboard.stage >= 2 ? (dashboard.stage - 1) * 0.09 : 0;
    ctx.beginPath();
    for (let i = 0; i <= 120; i += 1) {
      const t = i / 120;
      const x = pad.left + t * innerW;
      const swing = Math.sin(t * 24 + dashboard.chartPhase) * amplitude + Math.sin(t * 49 + dashboard.chartPhase * .7) * .018;
      const drift = t > .62 ? Math.pow((t - .62) / .38, 1.7) * anomalyLift : 0;
      const y = pad.top + Math.min(.91, Math.max(.08, base + swing + drift)) * innerH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 1.65;
    ctx.shadowColor = 'rgba(255,255,255,0.18)';
    ctx.shadowBlur = 7;
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (dashboard.stage >= 2) {
      const markerX = pad.left + innerW * .72;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(markerX, pad.top); ctx.lineTo(markerX, height - pad.bottom); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(markerX, pad.top + innerH * (.6 + anomalyLift), 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = '10px Inter, sans-serif'; ctx.fillText('t - 30 s', pad.left, height - 8); ctx.fillText('now', width - pad.right - 22, height - 8);
  }

  function startGraph() {
    cancelAnimationFrame(dashboard.chartHandle);
    const frame = () => { dashboard.chartPhase += 0.018; drawChart(); if (activeRoute === 'dashboard' && !prefersReducedMotion) dashboard.chartHandle = requestAnimationFrame(frame); };
    drawChart();
    if (!prefersReducedMotion) dashboard.chartHandle = requestAnimationFrame(frame);
  }
  function resizeCanvas() { if (activeRoute === 'dashboard') drawChart(); }

  document.querySelectorAll('.chart-tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach((button) => { const selected = button === tab; button.classList.toggle('is-active', selected); button.setAttribute('aria-selected', String(selected)); });
    dashboard.series = tab.dataset.series || 'temperature'; drawChart();
  }));
  $('#run-demo')?.addEventListener('click', runDemo);
  $('#reset-demo')?.addEventListener('click', resetDemo);

  const stats = Array.from(document.querySelectorAll('.stat-value'));
  let statsAnimated = false;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const runHomeStats = () => {
    if (statsAnimated) return;
    statsAnimated = true;
    stats.forEach((element, index) => {
      const target = Number(element.dataset.target || 0); const decimals = Number(element.dataset.decimals || 0); const suffix = element.dataset.suffix || ''; const start = performance.now(); const duration = 1500 + index * 80;
      const tick = (now) => { const progress = Math.min((now - start) / duration, 1); element.textContent = `${(target * easeOutCubic(progress)).toFixed(decimals)}${suffix}`; if (progress < 1) requestAnimationFrame(tick); };
      window.setTimeout(() => requestAnimationFrame(tick), 480 + index * 90);
    });
  };
  const statsFooter = document.querySelector('.stats-footer');
  if (statsFooter && 'IntersectionObserver' in window) new IntersectionObserver((entries, observer) => { if (entries.some((entry) => entry.isIntersecting)) { runHomeStats(); observer.disconnect(); } }, { threshold: .25 }).observe(statsFooter);
  else runHomeStats();
  routeTo(currentRoute());
}());
