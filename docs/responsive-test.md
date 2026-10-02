# Responsive Test Matrix

Test the dashboard at:

| Viewport | Expected |
|---|---|
| 320×568 | No page-level horizontal scrollbar; one-column content |
| 375×667 | No page-level horizontal scrollbar; controls wrap |
| 768×1024 | Sidebar + two-column cards |
| 1024×768 | Sidebar + four-column metric grid |
| 1440×900 | Wide desktop with constrained readable content |

For tables, horizontal scrolling is intentionally confined to `.table-wrap`. The document itself should not horizontally scroll.

Recommended browser check:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

A `true` result indicates that the page itself is not wider than the viewport.
