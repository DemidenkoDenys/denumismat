```markdown
# Header Theme Toggle

Update Order: 04

Date: 2026-02-07

Summary
- Implemented a dark theme toggle button in the header component that directly toggles the `theme-dark` class on `document.body`.

Files changed
- `src/app/components/header/header.ts` (added toggle logic and `isDarkMode` signal)
- `src/styles/components/header.scss` (added styles for the toggle button and dark overrides)

Behavior
- On first load the header reads localStorage (`denumismat.dark-mode`) or falls back to `prefers-color-scheme`.
- Clicking the theme button toggles dark mode, persists the choice, and updates the UI immediately.

Developer notes
- No theme service is used; the component manipulates `document.body` directly for simplicity.
- The dark CSS partial must be imported in `src/styles/styles.scss` for visual changes to apply.

Revert
- Remove the toggle button and the `isDarkMode` logic from `header.ts`, and remove the theme import if desired.

```
