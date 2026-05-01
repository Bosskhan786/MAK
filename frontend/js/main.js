// ── Auth State ──────────────────────────────────────────
const token = localStorage.getItem("token");

// ── Navbar Scroll Shadow ─────────────────────────────────
const nav = document.getElementById("mainNav");
if (nav) {
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  });
}

// ── Login / Logout Button ─────────────────────────────────
const navLoginBtn   = document.getElementById("navLoginBtn");
const navDashItem   = document.getElementById("navDashboardItem");
const navSignupItem = document.getElementById("navSignupItem");

if (navLoginBtn) {
  if (token) {
    // Logged in: show "Logout", show Dashboard, hide Signup
    navLoginBtn.textContent = "Logout";
    navLoginBtn.href = "#";
    if (navDashItem)   navDashItem.style.display   = "";
    if (navSignupItem) navSignupItem.style.display  = "none";

    navLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  } else {
    // Logged out: hide Dashboard
    if (navDashItem)   navDashItem.style.display  = "none";
    if (navSignupItem) navSignupItem.style.display = "";
  }
}

// ── Toast Helper ─────────────────────────────────────────
function showToast(message, type = "success") {
  const icon = type === "success" ? "✓" : "✕";
  const el = document.createElement("div");
  el.className = `toast-alert ${type}`;
  el.innerHTML = `<span>${icon}</span> ${message}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

// ── Dark Mode (Bootstrap data-bs-theme) ──────────────────
const darkToggle = document.getElementById("darkToggle");
const htmlEl     = document.documentElement;

// Restore saved preference
const savedTheme = localStorage.getItem("theme") || "light";
htmlEl.setAttribute("data-bs-theme", savedTheme);
if (darkToggle) darkToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

if (darkToggle) {
  darkToggle.addEventListener("click", () => {
    const isDark = htmlEl.getAttribute("data-bs-theme") === "dark";
    const next   = isDark ? "light" : "dark";
    htmlEl.setAttribute("data-bs-theme", next);
    localStorage.setItem("theme", next);
    darkToggle.textContent = next === "dark" ? "☀️" : "🌙";
  });
}