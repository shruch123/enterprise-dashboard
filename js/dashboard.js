/**
 * Enterprise Dashboard client application
 * ES2022+, no framework dependencies.
 *
 * Data source: DummyJSON products API.
 * Client state: filter controls + cart, persisted in localStorage.
 */

const API_URL = "https://dummyjson.com/products?limit=100";
const CART_STORAGE_KEY = "enterprise-dashboard-cart";

const state = {
  products: [],
  searchTerm: "",
  category: "all",
  sort: "default",
  cart: loadCart(),
  loading: false,
  error: null
};

document.addEventListener("DOMContentLoaded", () => {
  initDialogs();
  initProfileForm();
  initProductDashboard();
});

function initDialogs() {
  document.querySelectorAll("[data-open-dialog]").forEach((button) => {
    const dialog = document.querySelector(
      button.getAttribute("data-target") || "#confirm-dialog"
    );
    if (dialog && typeof dialog.showModal === "function") {
      button.addEventListener("click", () => dialog.showModal());
    }
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
}

function initProfileForm() {
  const form = document.querySelector("#profile-form");
  const status = document.querySelector("#form-status");

  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Please correct the highlighted fields.";
      return;
    }

    status.textContent = "Profile changes saved.";
  });
}

function initProductDashboard() {
  const catalog = document.querySelector("#product-catalog");
  if (!catalog) return;

  const searchInput = document.querySelector("#product-search");
  const sortSelect = document.querySelector("#product-sort");
  const categoryTabs = document.querySelector("#category-tabs");
  const refreshButton = document.querySelector("#refresh-products");
  const cartButton = document.querySelector("#cart-button");

  searchInput?.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderProducts();
  });

  sortSelect?.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  categoryTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    state.category = button.dataset.category;
    updateCategoryTabs();
    renderProducts();
  });

  refreshButton?.addEventListener("click", () => fetchProducts());

  cartButton?.addEventListener("click", () => {
    document.querySelector("#cart-dialog")?.showModal();
    renderCart();
  });

  document.querySelector("#clear-cart")?.addEventListener("click", () => {
    state.cart = [];
    persistCart();
    renderCart();
    updateCartCount();
  });

  document.querySelector("#cart-items")?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-cart-item]");
    if (!removeButton) return;

    const productId = Number(removeButton.dataset.removeCartItem);
    state.cart = state.cart.filter((item) => item.id !== productId);
    persistCart();
    renderCart();
    updateCartCount();
  });

  catalog.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (!addButton) return;

    const productId = Number(addButton.dataset.addToCart);
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;

    addToCart(product);
  });

  renderCart();
  updateCartCount();
  fetchProducts();
}

async function fetchProducts() {
  setLoading(true);
  clearError();

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    const response = await fetch(API_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });

    window.clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`The product service returned HTTP ${response.status}.`);
    }

    const payload = await response.json();

    if (!Array.isArray(payload.products)) {
      throw new Error("The product service returned an unexpected response.");
    }

    state.products = payload.products;
    state.error = null;

    renderCategoryTabs();
    renderProducts();
    updateMetrics();
    setLoading(false);
  } catch (error) {
    state.error = error;
    setLoading(false);
    showError(
      error.name === "AbortError"
        ? "The product service took too long to respond. Please try again."
        : "We couldn't load live product data. Check your connection and try again."
    );
    renderProducts();
  }
}

function setLoading(isLoading) {
  state.loading = isLoading;
  const catalog = document.querySelector("#product-catalog");
  const loading = document.querySelector("#product-loading");
  const refreshButton = document.querySelector("#refresh-products");

  if (catalog) {
    catalog.setAttribute("aria-busy", String(isLoading));
    catalog.hidden = isLoading;
  }

  if (loading) loading.hidden = !isLoading;
  if (refreshButton) refreshButton.disabled = isLoading;
}

function renderCategoryTabs() {
  const container = document.querySelector("#category-tabs");
  if (!container) return;

  const categories = [...new Set(state.products.map((product) => product.category))]
    .sort((a, b) => a.localeCompare(b));

  container.innerHTML = [
    createCategoryButton("all", "All", state.category === "all"),
    ...categories.map((category) =>
      createCategoryButton(
        category,
        formatCategory(category),
        state.category === category
      )
    )
  ].join("");
}

function createCategoryButton(value, label, selected) {
  return `
    <button
      class="tab-button${selected ? " is-active" : ""}"
      type="button"
      role="tab"
      aria-selected="${selected}"
      data-category="${escapeHtml(value)}"
    >${escapeHtml(label)}</button>
  `;
}

function updateCategoryTabs() {
  document.querySelectorAll("#category-tabs [data-category]").forEach((button) => {
    const selected = button.dataset.category === state.category;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
}

function renderProducts() {
  const catalog = document.querySelector("#product-catalog");
  const resultCount = document.querySelector("#product-result-count");

  if (!catalog || state.loading) return;

  const filtered = state.products
    .filter((product) => {
      const matchesCategory =
        state.category === "all" || product.category === state.category;
      const searchable = `${product.title} ${product.brand ?? ""} ${product.description}`
        .toLowerCase();
      return matchesCategory && searchable.includes(state.searchTerm);
    })
    .sort(sortProducts);

  if (resultCount) {
    resultCount.textContent =
      `${filtered.length} product${filtered.length === 1 ? "" : "s"} shown`;
  }

  if (!filtered.length) {
    catalog.innerHTML = `
      <article class="empty-state card">
        <h3>No matching products</h3>
        <p>Try a different search term or category. The machine has no feelings about it.</p>
      </article>
    `;
    return;
  }

  catalog.innerHTML = filtered.map(createProductCard).join("");
}

function sortProducts(a, b) {
  switch (state.sort) {
    case "price-asc":
      return a.price - b.price;
    case "price-desc":
      return b.price - a.price;
    case "rating-desc":
      return b.rating - a.rating;
    case "title-asc":
      return a.title.localeCompare(b.title);
    default:
      return a.id - b.id;
  }
}

function createProductCard(product) {
  const inCart = state.cart.some((item) => item.id === product.id);

  return `
    <article class="product-card card">
      <div class="product-image-wrap">
        <img
          src="${escapeAttribute(product.thumbnail)}"
          alt=""
          loading="lazy"
          width="240"
          height="180"
        >
      </div>
      <div class="product-content">
        <p class="eyebrow">${escapeHtml(formatCategory(product.category))}</p>
        <h3>${escapeHtml(product.title)}</h3>
        <p class="product-description">${escapeHtml(product.description)}</p>
        <div class="product-meta">
          <span aria-label="Price">$${product.price.toFixed(2)}</span>
          <span aria-label="Rating">${product.rating.toFixed(1)} / 5</span>
        </div>
        <button
          type="button"
          data-add-to-cart="${product.id}"
          ${inCart ? "disabled" : ""}
        >${inCart ? "Added to cart" : "Add to cart"}</button>
      </div>
    </article>
  `;
}

function addToCart(product) {
  if (state.cart.some((item) => item.id === product.id)) return;

  state.cart.push({
    id: product.id,
    title: product.title,
    price: product.price,
    thumbnail: product.thumbnail
  });

  persistCart();
  updateCartCount();
  renderCart();
  renderProducts();

  const status = document.querySelector("#product-status");
  if (status) status.textContent = `${product.title} added to cart.`;
}

function renderCart() {
  const container = document.querySelector("#cart-items");
  const total = document.querySelector("#cart-total");

  if (!container || !total) return;

  if (!state.cart.length) {
    container.innerHTML = '<p class="muted">Your cart is empty.</p>';
    total.textContent = "$0.00";
    return;
  }

  container.innerHTML = state.cart
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${escapeAttribute(item.thumbnail)}" alt="" width="56" height="56">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>$${item.price.toFixed(2)}</p>
          </div>
          <button
            class="secondary"
            type="button"
            data-remove-cart-item="${item.id}"
            aria-label="Remove ${escapeAttribute(item.title)} from cart"
          >Remove</button>
        </article>
      `
    )
    .join("");

  const cartTotal = state.cart.reduce((sum, item) => sum + item.price, 0);
  total.textContent = `$${cartTotal.toFixed(2)}`;
}

function updateCartCount() {
  const count = document.querySelector("#cart-count");
  if (count) count.textContent = String(state.cart.length);
}

function persistCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
  } catch {
    showError("Your browser blocked local storage, so the cart cannot be persisted.");
  }
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function updateMetrics() {
  const products = state.products;
  if (!products.length) return;

  const averageRating =
    products.reduce((sum, product) => sum + product.rating, 0) / products.length;

  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );

  setText("#metric-products", products.length.toLocaleString());
  setText("#metric-categories", new Set(products.map((item) => item.category)).size);
  setText("#metric-rating", `${averageRating.toFixed(1)} / 5`);
  setText("#metric-inventory", `$${inventoryValue.toLocaleString(undefined, {
    maximumFractionDigits: 0
  })}`);
}

function showError(message) {
  const banner = document.querySelector("#api-error");
  const messageNode = document.querySelector("#api-error-message");

  if (!banner || !messageNode) return;

  messageNode.textContent = message;
  banner.hidden = false;
}

function clearError() {
  const banner = document.querySelector("#api-error");
  if (banner) banner.hidden = true;
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function formatCategory(category) {
  return category
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
