/* Simulated authentication (client-side demo only; NOT secure). */
(() => {
  const KEY = "capstone-session";
  const inPages = location.pathname.includes("/pages/");
  const loginUrl = inPages ? "login.html" : "pages/login.html";
  const isLogin = location.pathname.endsWith("login.html");
  const USERS = [
    { email: "admin@demo.test", password: "Admin123!", name: "Ada Admin", role: "admin" },
    { email: "viewer@demo.test", password: "Viewer123!", name: "Vic Viewer", role: "viewer" }
  ];
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };

  window.Auth = {
    session: get,
    isAdmin: () => get()?.role === "admin",
    login(email, password) {
      const u = USERS.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
      if (!u) return null;
      const s = { email: u.email, name: u.name, role: u.role };
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
      return s;
    },
    logout() { try { localStorage.removeItem(KEY); } catch {} location.href = loginUrl; }
  };

  if (!isLogin && !get()) { location.replace(loginUrl); return; }

  document.addEventListener("DOMContentLoaded", () => {
    const s = get();
    if (isLogin) {
      if (s) location.replace("../index.html");
      const form = document.querySelector("#login-form");
      const status = document.querySelector("#login-status");
      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const ok = Auth.login(form.email.value, form.password.value);
        if (ok) location.href = "../index.html";
        else status.textContent = "Invalid email or password.";
      });
      return;
    }
    const nav = document.querySelector(".sidebar ul");
    if (nav && !nav.querySelector('[href$="products.html"]')) {
      const li = document.createElement("li");
      const here = location.pathname.endsWith("products.html");
      li.innerHTML = `<a href="${inPages ? "" : "pages/"}products.html"${here ? ' aria-current="page"' : ""}>Inventory</a>`;
      nav.append(li);
    }
    const actions = document.querySelector(".header-actions");
    if (actions && s) {
      const chip = document.createElement("span");
      chip.className = "user-chip";
      chip.textContent = `${s.name} (${s.role})`;
      const out = document.createElement("button");
      out.type = "button"; out.className = "secondary"; out.textContent = "Sign out";
      out.addEventListener("click", Auth.logout);
      actions.prepend(chip); actions.append(out);
    }
  });
})();
