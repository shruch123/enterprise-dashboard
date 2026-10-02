# Async data and client state

## Data source

The overview page uses the public DummyJSON products REST endpoint:

`https://dummyjson.com/products?limit=100`

The browser calls the endpoint with `fetch()` and `async/await`. A ten-second `AbortController` timeout prevents a stalled request from leaving the interface in a permanent loading state.

## Client state

`js/dashboard.js` keeps the current product collection and UI state in a single `state` object:

- `products`: the latest API response
- `searchTerm`: live search text
- `category`: active category tab
- `sort`: active sort mode
- `cart`: locally persisted cart items
- `loading` and `error`: request lifecycle state

The cart is serialized to `localStorage` under `enterprise-dashboard-cart`, so it survives a page refresh.

## Dynamic UI

No page reload is used for:

1. Search input changes.
2. Category tab changes.
3. Sort changes.
4. Adding/removing cart items.
5. Refreshing the API data.

The product grid is regenerated from state and updates `aria-live`/`aria-busy` attributes so assistive technology receives useful status changes.

## Loading and failure states

Before a request finishes, the product grid is replaced by skeleton cards. Failed requests show an accessible `role="alert"` banner and preserve a retry action.

The request validates both the HTTP status and the expected `products` array before rendering.

## Security and robustness notes

- Product strings are inserted through HTML escaping before being written into the DOM.
- Remote image URLs are escaped before use as attributes.
- API failures are handled without exposing raw exception details to users.
- The cart stores only the minimum product fields needed by the UI.
- `localStorage` access is wrapped in `try/catch` because browser storage can be disabled or unavailable.

## Accessibility notes

- Search and sort controls have visible labels.
- Category controls use `role="tablist"` and `aria-selected`.
- Loading state uses `aria-busy`.
- API failure uses an assertive alert.
- Result count and cart feedback use live regions.
- Product images use empty alt text because the adjacent product title already identifies the item.
- Native `<dialog>` is used for the cart and help UI.
- `prefers-reduced-motion` disables the skeleton animation.

## Manual verification

Serve the project from a local HTTP server rather than opening `index.html` directly:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.

Verify:

- Products load asynchronously.
- Search filters while typing.
- Category tabs filter without navigation.
- Sort changes reorder cards.
- Add-to-cart persists after refresh.
- Clear cart removes persisted state.
- Network failure displays the error banner.
- Keyboard focus remains visible and controls are reachable in logical order.
