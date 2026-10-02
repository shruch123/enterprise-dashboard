# Enterprise Dashboard Design System

## Design tokens

All colors, typography, spacing, radii, shadows, surfaces, layout widths, and motion values are defined in `:root` inside `css/dashboard.css`.

## Responsive breakpoints

- **320px:** minimum supported mobile layout; single-column content and wrapped controls.
- **768px:** tablet layout; persistent sidebar and two-column dashboard/forms.
- **1024px:** desktop layout; four-column metric grid.
- **1440px:** wide desktop; constrained content with larger page gutters.

## Layout

CSS Grid owns the application shell and dashboard card grid.

Flexbox owns:
- Header controls
- Page-header actions
- Sidebar links on small screens
- Dialog actions
- Checkbox rows

## Visual system

The UI uses:
- Subtle translucent surfaces
- `backdrop-filter` with a solid-color fallback
- Soft shadows
- Small hover elevation
- Consistent border radii
- Light/dark variables through `prefers-color-scheme`

## Accessibility

- `:focus-visible` is always preserved.
- Reduced-motion preferences disable transitions.
- Tables retain their minimum readable width inside a horizontal scrolling container instead of forcing the whole viewport to scroll.
- Images/media are constrained to `max-width: 100%`.
- Form controls cannot expand beyond their grid columns.
