# Enterprise Dashboard Foundation

Accessible multi-page static dashboard foundation using semantic HTML5 and WCAG-oriented patterns.

## Pages
- `index.html` - overview, metric cards, data table, modal dialog
- `pages/reports.html` - accessible filter form and report table
- `pages/profile.html` - validated profile form and status announcement

## Accessibility
- Skip links
- Semantic landmarks
- Native buttons, links, inputs, select, textarea, fieldset and legend
- Explicit labels
- Visible `:focus-visible`
- Table row/column scopes
- Native `<dialog>` modal
- `aria-live` status messaging
- Required/min/max/pattern/email validation
- Responsive layout

## Validation

Use the W3C Nu HTML Checker or validator.w3.org with each HTML file. The source is designed to contain zero HTML syntax errors.

Example with the W3C validator service:
1. Serve this directory with a local HTTP server.
2. Open the validator.
3. Validate `index.html`, `pages/reports.html`, and `pages/profile.html`.
4. Confirm `0 errors`.

Example local server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

## Important note

A validator can establish markup conformance, but it cannot prove full WCAG 2.1 conformance. Keyboard testing, screen-reader testing, color/contrast checks, and interaction testing are still required.
