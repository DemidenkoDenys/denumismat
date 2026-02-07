```markdown
# Styles Updates

Update Order: 01

Date: 2026-02-07

Summary
- Multiple SCSS updates were made to improve theming and card interaction.

Files changed
- `src/styles/styles.scss` (imported dark theme partial)
- `src/styles/themes/dark.scss` (new partial with variables and component overrides)
- `src/styles/components/header.scss` (theme toggle styles and dark overrides)
- `src/styles/components/coins.scss` (made card hover/focus/selected states and made card clickable)

Notes
- SCSS uses `@use` pattern and a component barrel `components/index` to keep imports tidy.
- Dark theme variables are defined under `body.theme-dark` so enabling dark mode is a simple DOM class toggle.

Revert
- Remove the `@use 'themes/dark'` line from `src/styles/styles.scss` and revert component SCSS changes as needed.

```
