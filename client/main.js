import { createClient } from "@supabase/supabase-js";

import { isValidE164Phone, isValidEmail, isValidOtp, normalizePhone, resolveProtectedRoute } from "./src/authUtils";

const routes = ["home", "dashboard", "how-it-works", "technology", "about", "login", "signup"];
const primaryNav = [
  ["home", "Home"],
  ["dashboard", "Dashboard"],
  ["how-it-works", "How It Works"],
  ["technology", "Technology"],
  ["about", "About"],
];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const views = Array.from(document.querySelectorAll("[data-view]"));
const backdrop = document.querySelector("#mobile-menu-backdrop");
const mobileMenu = document.querySelector("#mobile-menu");
const dashboardRoot = document.querySelector("#dashboard-root");
const authRoots = {
  login: document.querySelector("#login-root"),
  signup: document.querySelector("#signup-root"),
};
const dashboard = { stage: 0, running: false, series: "temperature", score: 12, chartHandle: null, chartPhase: 0 };
const authForms = {
  login: { method: "email", phoneStep: "send", phone: "+91" },
  signup: { method: "email", phoneStep: "send", phone: "+91" },
};

let activeRoute = "home";
let menuOpen = false;
let accountOpen = false;
let dashboardLoaded = false;
let authReady = false;
let supabase = null;
let session = null;
let authConfigError = "";

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const routePath = (route) => (route === "home" ? "/" : `/${route}`);
const displayName = () => {
  const user = session?.user;
  if (!user) return "";
  return user.user_metadata?.name?.trim() || user.email?.split("@")[0] || user.phone || "Account";
};
const initials = () => displayName().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "A";

function currentRoute() {
  const routeFromPath = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (routeFromPath === "") return "home";
  if (routes.includes(routeFromPath)) return routeFromPath;
  const routeFromHash = window.location.hash.replace("#", "").trim();
  return routes.includes(routeFromHash) ? routeFromHash : "home";
}

function navTemplate(active) {
  const links = primaryNav.map(([route, label]) => `<a class="nav-link ${route === active ? "is-active" : ""}" href="${routePath(route)}" data-route="${route}" ${route === active ? 'aria-current="page"' : ""}>${label}</a>`).join("");
  if (!session) return `${links}<a class="nav-link ${active === "login" ? "is-active" : ""}" href="/login" data-route="login" ${active === "login" ? 'aria-current="page"' : ""}>Sign In</a>`;
  return links;
}

function accountTemplate() {
  if (!session) return "";
  return `<div class="account-menu ${accountOpen ? "is-open" : ""}"><button class="account-trigger" type="button" data-account-toggle aria-haspopup="menu" aria-expanded="${String(accountOpen)}"><span class="account-avatar" aria-hidden="true">${escapeHtml(initials())}</span><span class="account-name">${escapeHtml(displayName())}</span></button><div class="account-dropdown" role="menu"><a href="/dashboard" data-route="dashboard" role="menuitem">Dashboard</a><button type="button" data-auth-action="signout" role="menuitem">Sign Out</button></div></div>`;
}

function headerTemplate(active) {
  return `<div class="header-inner"><a class="logo-button" href="/" data-route="home" aria-label="PredictBMS home"><img src="/manus-storage/signal-capsule-logo-a_356f6bb8.png" alt="" width="52" height="52" /></a><nav class="desktop-nav" aria-label="Desktop navigation">${navTemplate(active)}</nav>${accountTemplate()}<a class="sign-in desktop-sign-in" href="/dashboard" data-route="dashboard">Live Monitor</a><button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false" aria-label="Open menu"><span></span><span></span><span></span></button></div>`;
}

function footerTemplate() {
  return `<div class="footer-inner"><div><a class="footer-brand" href="/" data-route="home">PredictBMS</a><p>Predictive Battery Intelligence</p></div><nav aria-label="Footer navigation">${primaryNav.map(([route, label]) => `<a href="${routePath(route)}" data-route="${route}">${label}</a>`).join("")}</nav><a class="footer-cta" href="/dashboard" data-route="dashboard">Launch Monitor</a></div>`;
}

function mobileMenuTemplate(active) {
  const links = primaryNav.map(([route, label]) => `<a class="mobile-nav-link ${route === active ? "is-active" : ""}" href="${routePath(route)}" data-route="${route}" ${route === active ? 'aria-current="page"' : ""}>${label}</a>`).join("");
  const account = session
    ? `<div class="mobile-account"><span><span class="account-avatar" aria-hidden="true">${escapeHtml(initials())}</span>${escapeHtml(displayName())}</span><div><a href="/dashboard" data-route="dashboard">Dashboard</a><button type="button" data-auth-action="signout">Sign Out</button></div></div>`
    : `<a class="mobile-nav-link ${active === "login" ? "is-active" : ""}" href="/login" data-route="login">Sign In</a>`;
  return `${links}${account}<a class="sign-in mobile-sign-in" href="/dashboard" data-route="dashboard">Live Monitor</a>`;
}

function renderChrome() {
  const homeHeader = $(".site-header");
  if (homeHeader) homeHeader.innerHTML = headerTemplate(activeRoute);
  document.querySelectorAll("[data-header]").forEach((header) => { header.innerHTML = headerTemplate(activeRoute); });
  document.querySelectorAll("[data-footer]").forEach((footer) => { footer.innerHTML = footerTemplate(); });
  if (mobileMenu) mobileMenu.innerHTML = mobileMenuTemplate(activeRoute);
}

function setMenu(nextState) {
  menuOpen = nextState;
  document.querySelectorAll(".menu-toggle").forEach((toggle) => {
    toggle.classList.toggle("is-open", nextState);
    toggle.setAttribute("aria-expanded", String(nextState));
    toggle.setAttribute("aria-label", nextState ? "Close menu" : "Open menu");
  });
  if (!backdrop || !mobileMenu) return;
  mobileMenu.setAttribute("aria-hidden", String(!nextState));
  backdrop.hidden = !nextState;
  document.body.classList.toggle("menu-open", nextState);
}

function navigate(route, { replace = false } = {}) {
  const target = routePath(route);
  if (window.location.pathname !== target) window.history[replace ? "replaceState" : "pushState"]({}, "", target);
  void routeTo(route);
}

function dashboardLoading() {
  if (dashboardRoot) dashboardRoot.innerHTML = `<div class="product-grid" aria-hidden="true"></div><section class="dashboard-access-state"><span class="tiny-dot"></span><p>Verifying secure dashboard access</p></section>`;
}

async function mountDashboard() {
  if (!dashboardRoot) return;
  if (!authReady) {
    dashboardLoading();
    return;
  }
  if (!session || !supabase) {
    navigate("login", { replace: true });
    return;
  }
  if (dashboardLoaded) {
    startGraph();
    return;
  }

  dashboardLoading();
  try {
    const response = await fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status === 401) await supabase.auth.signOut({ scope: "local" });
      navigate("login", { replace: true });
      return;
    }
    const payload = await response.json();
    dashboardRoot.innerHTML = payload.html;
    dashboardLoaded = true;
    renderChrome();
    setupDashboardInteractions();
    startGraph();
  } catch {
    dashboardRoot.innerHTML = `<div class="product-grid" aria-hidden="true"></div><section class="dashboard-access-state"><p>Unable to load the secure dashboard. Please return to Sign In and try again.</p><a class="primary-cta" href="/login" data-route="login">Sign In</a></section>`;
  }
}

function authPageTemplate(mode) {
  const isSignUp = mode === "signup";
  const state = authForms[mode];
  const modeTitle = isSignUp ? "Create your PredictBMS account" : "Sign in to PredictBMS";
  const emailFields = `${isSignUp ? `<label class="auth-field"><span>Name</span><input class="auth-input" name="name" autocomplete="name" required placeholder="Your name" /><small class="auth-field-error" data-error-for="name"></small></label>` : ""}<label class="auth-field"><span>Email</span><input class="auth-input" name="email" type="email" autocomplete="email" required placeholder="name@company.com" /><small class="auth-field-error" data-error-for="email"></small></label><label class="auth-field"><span>Password</span><input class="auth-input" name="password" type="password" autocomplete="${isSignUp ? "new-password" : "current-password"}" minlength="6" required placeholder="At least 6 characters" /><small class="auth-field-error" data-error-for="password"></small></label>${!isSignUp ? '<button class="auth-text-button" type="button" data-auth-action="reset-password">Forgot password?</button>' : ""}`;
  const phoneFields = `${isSignUp ? `<label class="auth-field"><span>Name</span><input class="auth-input" name="name" autocomplete="name" required placeholder="Your name" /><small class="auth-field-error" data-error-for="name"></small></label>` : ""}<label class="auth-field"><span>Phone number</span><input class="auth-input" name="phone" type="tel" autocomplete="tel" required value="${escapeHtml(state.phone)}" placeholder="+91 98765 43210" /><small class="auth-field-error" data-error-for="phone"></small></label>${state.phoneStep === "verify" ? '<label class="auth-field"><span>6-digit OTP</span><input class="auth-input otp-input" name="otp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required placeholder="000000" /><small class="auth-field-error" data-error-for="otp"></small></label>' : ""}`;
  const submitLabel = state.method === "phone" ? (state.phoneStep === "verify" ? (isSignUp ? "Verify & Create Account" : "Verify & Sign In") : "Send OTP") : (isSignUp ? "Create Account" : "Sign In");
  const alternate = isSignUp ? `<p class="auth-switch">Already have an account? <a href="/login" data-route="login">Sign in</a></p>` : `<p class="auth-switch">Don’t have an account? <a href="/signup" data-route="signup">Sign up</a></p>`;

  return `<header class="shell-header" data-header="${mode}"></header><section class="auth-layout"><div class="auth-card"><a class="auth-logo" href="/" data-route="home" aria-label="PredictBMS home"><img src="/manus-storage/signal-capsule-logo-a_356f6bb8.png" alt="" width="52" height="52" /></a><p class="eyebrow">PREDICTBMS SECURE ACCESS</p><h1>${modeTitle}</h1><p class="auth-lede">${isSignUp ? "Start monitoring the battery signals that matter." : "Access your protected battery intelligence dashboard."}</p><div class="auth-tabs" role="tablist" aria-label="Authentication method"><button class="auth-tab ${state.method === "email" ? "is-active" : ""}" type="button" data-auth-tab="email" role="tab" aria-selected="${String(state.method === "email")}">Email</button><button class="auth-tab ${state.method === "phone" ? "is-active" : ""}" type="button" data-auth-tab="phone" role="tab" aria-selected="${String(state.method === "phone")}">Phone Number</button></div><form class="auth-form" data-auth-form="${mode}" novalidate><div class="auth-fields">${state.method === "email" ? emailFields : phoneFields}</div><p class="auth-message" data-auth-message aria-live="polite"></p><button class="primary-cta auth-submit" type="submit">${submitLabel}</button></form>${alternate}</div></section>`;
}

function renderAuthPage(mode) {
  const root = authRoots[mode];
  if (!root) return;
  root.innerHTML = authPageTemplate(mode);
  root.querySelectorAll("[data-auth-tab]").forEach((button) => button.addEventListener("click", () => {
    authForms[mode].method = button.dataset.authTab;
    renderAuthPage(mode);
  }));
  $("[data-auth-form]", root)?.addEventListener("submit", submitAuthForm);
}

function formMessage(form, message = "", kind = "") {
  const messageElement = $("[data-auth-message]", form);
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.dataset.kind = kind;
}

function formFieldError(form, field, message) {
  const target = $(`[data-error-for="${field}"]`, form);
  if (target) target.textContent = message;
}

function clearFormErrors(form) {
  form.querySelectorAll(".auth-field-error").forEach((error) => { error.textContent = ""; });
  formMessage(form);
}

function submitIssue(form, field, message) {
  if (field) formFieldError(form, field, message);
  else formMessage(form, message, "error");
}

function errorFieldFor(errorMessage, method) {
  const message = errorMessage.toLowerCase();
  if (method === "phone") return message.includes("token") || message.includes("otp") || message.includes("code") ? "otp" : "phone";
  if (message.includes("email")) return "email";
  if (message.includes("password") || message.includes("credentials")) return "password";
  return "";
}

async function submitAuthForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const mode = form.dataset.authForm;
  const state = authForms[mode];
  clearFormErrors(form);
  if (!supabase) {
    formMessage(form, authConfigError || "Authentication configuration is unavailable.", "error");
    return;
  }

  const values = new FormData(form);
  const button = $("button[type=submit]", form);
  button.disabled = true;
  button.textContent = "Working…";
  try {
    if (state.method === "email") {
      const email = String(values.get("email") || "").trim();
      const password = String(values.get("password") || "");
      const name = String(values.get("name") || "").trim();
      if (!isValidEmail(email)) return submitIssue(form, "email", "Enter a valid email address.");
      if (password.length < 6) return submitIssue(form, "password", "Password must contain at least 6 characters.");
      if (mode === "signup" && !name) return submitIssue(form, "name", "Enter your name.");
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: `${window.location.origin}/login` } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) return submitIssue(form, errorFieldFor(result.error.message, "email"), result.error.message);
      if (mode === "signup" && !result.data.session) {
        formMessage(form, "Check your email to confirm your account, then return here to sign in.", "success");
        return;
      }
      session = result.data.session;
      navigate("dashboard", { replace: true });
      return;
    }

    const phone = normalizePhone(String(values.get("phone") || ""));
    if (!isValidE164Phone(phone)) return submitIssue(form, "phone", "Enter a valid phone number including the country code.");
    authForms[mode].phone = phone;
    if (state.phoneStep === "send") {
      const name = String(values.get("name") || "").trim();
      if (mode === "signup" && !name) return submitIssue(form, "name", "Enter your name.");
      const result = await supabase.auth.signInWithOtp({ phone, options: { data: mode === "signup" ? { name } : undefined } });
      if (result.error) return submitIssue(form, "phone", result.error.message);
      authForms[mode].phoneStep = "verify";
      renderAuthPage(mode);
      const nextForm = $("[data-auth-form]", authRoots[mode]);
      formMessage(nextForm, "A verification code was sent to your phone.", "success");
      $("[name=otp]", nextForm)?.focus();
      return;
    }

    const token = String(values.get("otp") || "").trim();
    if (!isValidOtp(token)) return submitIssue(form, "otp", "Enter the 6-digit verification code.");
    const result = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
    if (result.error) return submitIssue(form, "otp", result.error.message);
    session = result.data.session;
    navigate("dashboard", { replace: true });
  } catch {
    formMessage(form, "Unable to complete authentication. Check your connection and try again.", "error");
  } finally {
    const currentButton = $("button[type=submit]", form);
    if (currentButton && document.contains(form)) {
      currentButton.disabled = false;
      const latestState = authForms[mode];
      currentButton.textContent = latestState.method === "phone" ? (latestState.phoneStep === "verify" ? (mode === "signup" ? "Verify & Create Account" : "Verify & Sign In") : "Send OTP") : (mode === "signup" ? "Create Account" : "Sign In");
    }
  }
}

async function resetPassword(trigger) {
  const form = trigger.closest("form");
  const email = String(new FormData(form).get("email") || "").trim();
  clearFormErrors(form);
  if (!isValidEmail(email)) {
    submitIssue(form, "email", "Enter your email address first.");
    return;
  }
  if (!supabase) {
    formMessage(form, authConfigError || "Authentication configuration is unavailable.", "error");
    return;
  }
  trigger.disabled = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
    if (error) submitIssue(form, "email", error.message);
    else formMessage(form, "Password reset instructions have been sent to your email.", "success");
  } finally {
    trigger.disabled = false;
  }
}

async function signOut() {
  if (supabase) await supabase.auth.signOut();
  session = null;
  dashboardLoaded = false;
  dashboardRoot?.replaceChildren();
  accountOpen = false;
  renderChrome();
  navigate("home", { replace: true });
}

async function setupAuth() {
  try {
    const response = await fetch("/api/auth/config", { cache: "no-store" });
    const config = await response.json();
    if (!response.ok || !config.url || !config.anonKey) throw new Error(config.error || "Authentication configuration is unavailable.");
    supabase = createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data } = await supabase.auth.getSession();
    session = data.session;
    supabase.auth.onAuthStateChange((_event, nextSession) => {
      session = nextSession;
      dashboardLoaded = false;
      accountOpen = false;
      renderChrome();
      if (!nextSession && activeRoute === "dashboard") navigate("login", { replace: true });
    });
  } catch (error) {
    authConfigError = error instanceof Error ? error.message : "Authentication configuration is unavailable.";
  } finally {
    authReady = true;
    void routeTo(currentRoute());
  }
}

async function routeTo(route) {
  const requestedRoute = routes.includes(route) ? route : "home";
  activeRoute = resolveProtectedRoute(requestedRoute, Boolean(session));
  if (activeRoute !== requestedRoute && window.location.pathname !== routePath(activeRoute)) {
    window.history.replaceState({}, "", routePath(activeRoute));
  }
  views.forEach((view) => { view.hidden = view.dataset.view !== activeRoute; });
  document.body.classList.toggle("is-home", activeRoute === "home");
  document.body.classList.toggle("is-product", activeRoute !== "home");
  document.body.classList.toggle("is-auth", activeRoute === "login" || activeRoute === "signup");
  document.title = activeRoute === "home" ? "PredictBMS — Predictive Battery Intelligence" : `${activeRoute === "how-it-works" ? "How It Works" : activeRoute[0].toUpperCase() + activeRoute.slice(1)} — PredictBMS`;
  renderChrome();
  setMenu(false);
  if (activeRoute === "login" || activeRoute === "signup") renderAuthPage(activeRoute);
  if (activeRoute === "dashboard") await mountDashboard();
  if (!prefersReducedMotion) window.scrollTo({ top: 0, behavior: "smooth" });
  else window.scrollTo(0, 0);
}

function animateNumber(element, from, to, decimals = 0) {
  if (!element) return;
  const duration = prefersReducedMotion ? 0 : 650;
  const start = performance.now();
  const draw = (now) => {
    const elapsed = duration ? Math.min((now - start) / duration, 1) : 1;
    const eased = 1 - Math.pow(1 - elapsed, 3);
    element.textContent = (from + (to - from) * eased).toFixed(decimals);
    if (elapsed < 1) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

const dashboardValues = [
  { temperature: 34.8, voltage: 48.6, current: 8.2, score: 12, state: "NORMAL", interpretation: "LOW RISK", message: "Battery behavior is currently within the learned operating pattern.", summary: "Monitoring learned operating behavior." },
  { temperature: 36.1, voltage: 48.5, current: 8.5, score: 24, state: "NORMAL", interpretation: "LOW RISK", message: "A subtle deviation is being observed within the monitored pattern.", summary: "Subtle deviation observed. Comparing behavior with the learned range." },
  { temperature: 38.4, voltage: 48.3, current: 9.1, score: 37, state: "ELEVATED", interpretation: "ELEVATED RISK", message: "Battery behavior is deviating from the learned normal pattern.", summary: "Anomaly detected. Risk assessment is increasing." },
  { temperature: 40.2, voltage: 48.0, current: 9.8, score: 54, state: "ELEVATED", interpretation: "ELEVATED RISK", message: "The pattern deviation remains elevated and is being monitored.", summary: "Risk rising. Preparing an early warning state." },
  { temperature: 41.8, voltage: 47.7, current: 10.5, score: 72, state: "HIGH RISK", interpretation: "HIGH RISK", message: "Elevated battery behavior detected before the critical threshold.", summary: "Early warning active. Local alert status represented." },
];

function setDashboardStage(stage) {
  const next = dashboardValues[stage];
  const previousScore = dashboard.score;
  dashboard.stage = stage;
  dashboard.score = next.score;
  animateNumber($("#risk-score"), previousScore, next.score);
  animateNumber($("#temperature"), Number($("#temperature")?.textContent || 0), next.temperature, 1);
  animateNumber($("#voltage"), Number($("#voltage")?.textContent || 0), next.voltage, 1);
  animateNumber($("#current"), Number($("#current")?.textContent || 0), next.current, 1);
  $("#battery-state").textContent = next.state;
  $("#battery-message").textContent = next.message;
  $("#risk-interpretation").textContent = next.interpretation;
  $("#demo-summary").textContent = next.summary;
  const anomaly = stage >= 2;
  const high = stage >= 4;
  $("#chart-note").hidden = !anomaly;
  $("#alert-state").classList.toggle("is-active", high);
  $("#alert-state span:last-child").textContent = high ? "LOCAL ALERT ACTIVE" : "STANDBY";
  $("#battery-dot").className = `state-dot ${stage >= 4 ? "is-high" : stage >= 2 ? "is-elevated" : ""}`;
  if (dashboard.running) $("#stream-label").textContent = "SIMULATED SENSOR STREAM";
  drawChart();
}

function runDemo() {
  if (dashboard.running) return;
  dashboard.running = true;
  $("#run-demo").disabled = true;
  $("#reset-demo").disabled = false;
  $("#stream-label").textContent = "SIMULATED SENSOR STREAM";
  let step = 0;
  const advance = () => {
    setDashboardStage(step);
    step += 1;
    if (step < dashboardValues.length) window.setTimeout(advance, prefersReducedMotion ? 0 : 1800);
    else { dashboard.running = false; $("#run-demo").disabled = false; }
  };
  advance();
}

function resetDemo() {
  dashboard.running = false;
  $("#run-demo").disabled = false;
  $("#reset-demo").disabled = true;
  $("#stream-label").textContent = "LIVE SENSOR STREAM";
  setDashboardStage(0);
}

function canvasMetrics() {
  const canvas = $("#behavior-chart");
  if (!canvas) return null;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function drawChart() {
  const metrics = canvasMetrics();
  if (!metrics) return;
  const { ctx, width, height } = metrics;
  const pad = { top: 20, right: 18, bottom: 28, left: 42 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) { const y = pad.top + (innerH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke(); }
  for (let i = 0; i < 7; i += 1) { const x = pad.left + (innerW / 6) * i; ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, height - pad.bottom); ctx.stroke(); }
  const normalTop = pad.top + innerH * 0.28;
  const normalBottom = pad.top + innerH * 0.68;
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  ctx.fillRect(pad.left, normalTop, innerW, normalBottom - normalTop);
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "10px Inter, sans-serif";
  ctx.fillText("NORMAL", 5, normalTop + 5);
  ctx.fillText("RISK", 10, normalBottom);
  const baseBySeries = { temperature: 0.47, voltage: 0.5, current: 0.46, risk: 0.64 };
  const amplitudeBySeries = { temperature: 0.12, voltage: 0.08, current: 0.11, risk: 0.13 };
  const base = baseBySeries[dashboard.series];
  const amplitude = amplitudeBySeries[dashboard.series];
  const anomalyLift = dashboard.stage >= 2 ? (dashboard.stage - 1) * 0.09 : 0;
  ctx.beginPath();
  for (let i = 0; i <= 120; i += 1) {
    const t = i / 120;
    const x = pad.left + t * innerW;
    const swing = Math.sin(t * 24 + dashboard.chartPhase) * amplitude + Math.sin(t * 49 + dashboard.chartPhase * 0.7) * 0.018;
    const drift = t > 0.62 ? Math.pow((t - 0.62) / 0.38, 1.7) * anomalyLift : 0;
    const y = pad.top + Math.min(0.91, Math.max(0.08, base + swing + drift)) * innerH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 1.65;
  ctx.shadowColor = "rgba(255,255,255,0.18)";
  ctx.shadowBlur = 7;
  ctx.stroke();
  ctx.shadowBlur = 0;
  if (dashboard.stage >= 2) {
    const markerX = pad.left + innerW * 0.72;
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(markerX, pad.top); ctx.lineTo(markerX, height - pad.bottom); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(markerX, pad.top + innerH * (0.6 + anomalyLift), 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.38)"; ctx.font = "10px Inter, sans-serif"; ctx.fillText("t - 30 s", pad.left, height - 8); ctx.fillText("now", width - pad.right - 22, height - 8);
}

function startGraph() {
  cancelAnimationFrame(dashboard.chartHandle);
  const frame = () => { dashboard.chartPhase += 0.018; drawChart(); if (activeRoute === "dashboard" && !prefersReducedMotion) dashboard.chartHandle = requestAnimationFrame(frame); };
  drawChart();
  if (!prefersReducedMotion) dashboard.chartHandle = requestAnimationFrame(frame);
}

function setupDashboardInteractions() {
  document.querySelectorAll(".chart-tab").forEach((tab) => tab.addEventListener("click", () => {
    document.querySelectorAll(".chart-tab").forEach((button) => { const selected = button === tab; button.classList.toggle("is-active", selected); button.setAttribute("aria-selected", String(selected)); });
    dashboard.series = tab.dataset.series || "temperature";
    drawChart();
  }));
  $("#run-demo")?.addEventListener("click", runDemo);
  $("#reset-demo")?.addEventListener("click", resetDemo);
}

function runHomeStats() {
  const stats = Array.from(document.querySelectorAll(".stat-value"));
  stats.forEach((element, index) => {
    const target = Number(element.dataset.target || 0); const decimals = Number(element.dataset.decimals || 0); const suffix = element.dataset.suffix || ""; const start = performance.now(); const duration = 1500 + index * 80;
    const tick = (now) => { const progress = Math.min((now - start) / duration, 1); element.textContent = `${(target * (1 - Math.pow(1 - progress, 3))).toFixed(decimals)}${suffix}`; if (progress < 1) requestAnimationFrame(tick); };
    window.setTimeout(() => requestAnimationFrame(tick), 480 + index * 90);
  });
}

document.addEventListener("click", (event) => {
  const toggle = event.target.closest(".menu-toggle");
  if (toggle) { event.preventDefault(); setMenu(!menuOpen); return; }
  const accountToggle = event.target.closest("[data-account-toggle]");
  if (accountToggle) { accountOpen = !accountOpen; renderChrome(); return; }
  const action = event.target.closest("[data-auth-action]");
  if (action) {
    event.preventDefault();
    if (action.dataset.authAction === "signout") void signOut();
    if (action.dataset.authAction === "reset-password") void resetPassword(action);
    return;
  }
  const link = event.target.closest("[data-route]");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
  const route = link.dataset.route;
  if (!route) return;
  event.preventDefault();
  navigate(route);
});

document.addEventListener("click", (event) => {
  if (accountOpen && !event.target.closest(".account-menu")) { accountOpen = false; renderChrome(); }
});

window.addEventListener("popstate", () => { void routeTo(currentRoute()); });
window.addEventListener("hashchange", () => { if (window.location.hash) navigate(currentRoute(), { replace: true }); });
window.addEventListener("resize", () => { if (window.innerWidth > 720 && menuOpen) setMenu(false); if (activeRoute === "dashboard") drawChart(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { if (menuOpen) setMenu(false); if (accountOpen) { accountOpen = false; renderChrome(); } } });
if (backdrop) backdrop.addEventListener("click", (event) => { if (event.target === backdrop) setMenu(false); });

const statsFooter = $(".stats-footer");
if (statsFooter && "IntersectionObserver" in window) new IntersectionObserver((entries, observer) => { if (entries.some((entry) => entry.isIntersecting)) { runHomeStats(); observer.disconnect(); } }, { threshold: 0.25 }).observe(statsFooter);
else runHomeStats();

renderChrome();
void routeTo(currentRoute());
void setupAuth();
