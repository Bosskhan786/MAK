/* ============================================================
   main.js  –  Dr. Maaz Khan  (fixed + improved)
   ============================================================ */

// ── 1. Dark-mode: restore BEFORE any paint (no flash) ────────
// (The inline <script> in <head> already handles this for dashboard.html;
//  this block handles every other page the same way.)
(function () {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-bs-theme", saved);
})();

// ── 2. Helpers ───────────────────────────────────────────────
/**
 * Read the JWT from localStorage.
 * Called at the moment it's needed — not cached in a bare const at
 * module scope (which was the original bug: token was captured at
 * parse time, so pages opened while already-logged-in still showed
 * "Login" until a hard-reload).
 */
function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ── 3. Toast ─────────────────────────────────────────────────
function showToast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast-alert ${type}`;
  // Sanitise: only set textContent for the message to prevent XSS
  const icon = document.createElement("span");
  icon.textContent = type === "success" ? "✓" : "✕";
  el.appendChild(icon);
  el.append(" " + message);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

// Expose globally so inline scripts in HTML pages can call it
window.showToast = showToast;

// ── 4. Navbar auth state ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const token       = getToken();
  const nav         = document.getElementById("mainNav");
  const navLoginBtn = document.getElementById("navLoginBtn");
  const navDashItem = document.getElementById("navDashboardItem");
  const navSigItem  = document.getElementById("navSignupItem");

  // Scroll shadow
  if (nav) {
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 20);
    }, { passive: true });
  }

  if (!navLoginBtn) return; // auth-less pages (login / signup) skip this

  if (token) {
    // ── Logged-in state ──
    navLoginBtn.textContent = "Logout";
    navLoginBtn.removeAttribute("href");
    navLoginBtn.setAttribute("role", "button");
    if (navDashItem) navDashItem.style.display = "";
    if (navSigItem)  navSigItem.style.display  = "none";

    navLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    // ── Logged-out state ──
    if (navDashItem) navDashItem.style.display = "none";
    if (navSigItem)  navSigItem.style.display  = "";
  }

  // ── 5. Dark-mode toggle ───────────────────────────────────
  const darkToggle = document.getElementById("darkToggle");
  if (darkToggle) {
    // Sync icon to current theme (already applied by the IIFE above)
    const current = document.documentElement.getAttribute("data-bs-theme");
    darkToggle.textContent = current === "dark" ? "☀️" : "🌙";
    darkToggle.setAttribute("aria-label", "Toggle dark mode");

    darkToggle.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
      const next   = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-bs-theme", next);
      localStorage.setItem("theme", next);
      darkToggle.textContent = next === "dark" ? "☀️" : "🌙";
    });
  }
});