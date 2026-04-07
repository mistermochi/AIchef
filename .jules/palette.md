## 2026-02-23 - [Input Polish & Focus States]
**Learning:** Users prefer specific, high-impact view enhancements like search "Clear" buttons over global design changes like button focus rings, which may conflict with existing brand/design patterns for colored vs. uncolored elements.
**Action:** Prioritize per-component interaction polish (Inputs, Switches) and ensure they have 'focus-visible' rings that respect the app's color palette.

## 2026-04-07 - [Mobile Navigation & Accessibility Labels]
**Learning:** Icon-only buttons without text labels are a common accessibility gap. Providing an automated fallback for `aria-label` in the base `Button` component significantly reduces this technical debt across the entire application.
**Action:** Always include an `aria-label` or automated label-to-aria mapping for components that might render in an icon-only state.
