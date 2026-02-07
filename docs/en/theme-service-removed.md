# Theme Service Added then Removed

Date: 2026-02-07

Summary
- A `ThemeService` was temporarily added and later removed. Documentation kept to record the change and rationale.

Files changed
- `src/app/services/theme.service.ts` (created then deleted)
- `src/app/app.ts` (was briefly updated to inject the service, then reverted)

Description
- The `ThemeService` implemented theme preference detection, persistence, and applied the `theme-dark` class on the document body. The service was later removed in favor of a direct component-based solution (no service).

Reason
- The project currently uses a minimal approach: theme toggling is handled directly by the header component to avoid an extra service layer.

Revert
- No action required; the service file was removed. Recreate the service if a centralized theme API becomes necessary.
