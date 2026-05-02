/* ============================================================
   main.js — Dr. Maaz Khan  v2.0
   ============================================================ */

// ── 1. DARK MODE (before paint — no flash) ───────────────────
(function () {
  const t = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-bs-theme", t);
})();

// ── 2. CONFIG ────────────────────────────────────────────────
const API = "https://mak-iqvm.onrender.com";

// ── 3. HELPERS ───────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function logout() {
  clearAuth();
  window.location.href = "login.html";
}

// ── 4. TOAST SYSTEM ──────────────────────────────────────────
(function initToastContainer() {
  const c = document.createElement("div");
  c.className = "toast-container";
  c.id = "toastContainer";
  document.body.appendChild(c);
})();

function showToast(message, type = "success", duration = 3800) {
  const icons = { success: "bi-check-lg", error: "bi-x-lg", info: "bi-info-circle" };
  const container = document.getElementById("toastContainer");

  const el = document.createElement("div");
  el.className = `toast-alert ${type}`;
  el.innerHTML = `
    <div class="toast-icon"><i class="bi ${icons[type] || icons.info}"></i></div>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add("removing");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }, duration);
}

// Expose globally for inline scripts
window.showToast = showToast;
window.API       = API;

// ── 5. XSS ESCAPE HELPER ─────────────────────────────────────
function escapeHtml(str) {
  const map = { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}
window.escapeHtml = escapeHtml;

// ── 6. NAVBAR ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const token    = getToken();
  const nav      = document.getElementById("mainNav");
  const loginBtn = document.getElementById("navLoginBtn");
  const dashItem = document.getElementById("navDashboardItem");
  const signItem = document.getElementById("navSignupItem");

  // Scroll shadow
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (loginBtn) {
    if (token) {
      // ── Logged-in state
      loginBtn.textContent = "Logout";
      loginBtn.removeAttribute("href");
      loginBtn.addEventListener("click", (e) => { e.preventDefault(); logout(); });
      if (dashItem) dashItem.style.display = "";
      if (signItem) signItem.style.display = "none";
    } else {
      // ── Logged-out state
      if (dashItem) dashItem.style.display = "none";
      if (signItem) signItem.style.display = "";
    }
  }

  // ── 7. DARK MODE TOGGLE ─────────────────────────────────────
  const toggle = document.getElementById("darkToggle");
  if (toggle) {
    const cur = document.documentElement.getAttribute("data-bs-theme");
    toggle.textContent = cur === "dark" ? "☀️" : "🌙";

    toggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-bs-theme", next);
      localStorage.setItem("theme", next);
      toggle.textContent = next === "dark" ? "☀️" : "🌙";
    });
  }

  // ── 8. SCROLL ANIMATIONS ────────────────────────────────────
  const fadeEls = document.querySelectorAll(".fade-up");
  if (fadeEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add("visible"));
  }
});

// ── 9. FETCH WRAPPER ─────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API}${path}`, { ...options, headers });

  // Auto-logout on 401
  if (res.status === 401) {
    clearAuth();
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname.split("/").pop());
    window.location.replace("login.html");
    return null;
  }

  return res;
}
window.apiFetch = apiFetch;