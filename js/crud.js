/* Inventory CRUD: custom products persisted in localStorage, merged into the catalog. */
(() => {
  const KEY = "enterprise-dashboard-custom-products";
  const PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="100%" height="100%" fill="#cbd5e1"/></svg>');
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  const load = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } };
  const save = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); return true; } catch { return false; } };

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#product-form");
    if (!form) return;
    const body = document.querySelector("#inventory-body");
    const status = document.querySelector("#crud-status");
    const admin = Auth.isAdmin();
    let list = load();

    if (!admin) {
      form.querySelectorAll("input,select,textarea,button").forEach((el) => (el.disabled = true));
      status.textContent = "Read-only: sign in as an admin to create, edit, or delete products.";
    }

    function render() {
      if (!list.length) { body.innerHTML = '<tr><td colspan="5" class="muted">No custom products yet.</td></tr>'; return; }
      body.innerHTML = list.map((p) => `<tr>
        <th scope="row">${esc(p.title)}</th><td>${esc(p.category)}</td><td>$${p.price.toFixed(2)}</td><td>${p.stock}</td>
        <td>${admin ? `<button type="button" class="secondary" data-edit="${p.id}">Edit</button>
        <button type="button" class="danger" data-delete="${p.id}">Delete</button>` : "—"}</td></tr>`).join("");
    }

    function reset() { form.reset(); form.id.value = ""; form.querySelector("[type=submit]").textContent = "Add product"; }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!admin) return;
      if (!form.checkValidity()) { form.reportValidity(); status.textContent = "Please correct the highlighted fields."; return; }
      const id = Number(form.id.value) || Math.max(1000, ...list.map((p) => p.id)) + 1;
      const item = {
        id, title: form.title.value.trim(), category: form.category.value.trim().toLowerCase().replace(/\s+/g, "-"),
        price: Number(form.price.value), stock: Number(form.stock.value), rating: 4,
        description: form.description.value.trim(), brand: "Custom",
        thumbnail: form.thumbnail.value.trim() || PLACEHOLDER
      };
      const i = list.findIndex((p) => p.id === id);
      i >= 0 ? (list[i] = item) : list.push(item);
      status.textContent = save(list) ? `"${item.title}" saved.` : "Storage unavailable; changes will be lost.";
      reset(); render();
    });

    body.addEventListener("click", (e) => {
      const ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-delete]");
      if (ed) {
        const p = list.find((x) => x.id === Number(ed.dataset.edit)); if (!p) return;
        form.id.value = p.id; form.title.value = p.title; form.category.value = p.category;
        form.price.value = p.price; form.stock.value = p.stock; form.description.value = p.description;
        form.thumbnail.value = p.thumbnail === PLACEHOLDER ? "" : p.thumbnail;
        form.querySelector("[type=submit]").textContent = "Update product"; form.title.focus();
      } else if (del) {
        const id = Number(del.dataset.delete);
        if (!confirm("Delete this product?")) return;
        list = list.filter((p) => p.id !== id); save(list);
        status.textContent = "Product deleted."; render();
      }
    });
    document.querySelector("#cancel-edit")?.addEventListener("click", reset);
    render();
  });
})();
