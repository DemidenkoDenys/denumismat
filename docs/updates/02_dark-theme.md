````markdown
# Dark Theme

Update Order: 02

Date: 2026-02-07

Summary
- Added a dark theme SCSS partial that provides CSS custom property overrides and component-level overrides.

Files changed/added
- `src/styles/themes/dark.scss` (new)
- `src/styles/styles.scss` (imported the dark theme)

Description
- The dark theme activates when the `theme-dark` class is present on the `body` element. The file sets color variables (primary, background, surface, borders, text shades) and includes component-specific overrides for header, filters, coin cards, and the footer.

How to enable
```js
// enable dark theme
document.body.classList.add('theme-dark');

// disable dark theme
document.body.classList.remove('theme-dark');
```

Notes
- This partial is purely CSS — no runtime service required. It can be toggled via DOM class, user preference, or by a component method.

Revert
- Remove the `@use 'themes/dark'` line from `src/styles/styles.scss` and delete `src/styles/themes/dark.scss`.

````
