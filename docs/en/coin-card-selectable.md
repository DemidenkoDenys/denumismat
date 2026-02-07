# Coin Card: Full-Card Selection

Date: 2026-02-07

Summary
- The entire coin card component was made clickable/selectable. Keyboard accessibility (Space/Enter) and ARIA attributes were added.

Files changed
- `src/app/components/coins/coin-card.ts` (template and logic updated)
- `src/styles/components/coins.scss` (visual feedback: hover, focus, selected states)

Behavior
- Clicking anywhere on a card toggles selection. The checkbox still reflects selection state and clicking it stops propagation to avoid double toggles.
- The card uses `role="button"`, `tabindex="0"`, and handles `keydown.space` and `keydown.enter` for accessibility.

Developer notes
- The parent grid listens to selection outputs and updates the footer counts accordingly.

Revert
- Restore the previous template that only toggled selection via the checkbox and remove the keyboard handlers and ARIA attributes.
