```markdown
# Localization Specification

Update Order: 06
Date: 2026-02-07T13:33:45

## Purpose
This document consolidates recent localization/i18n work and documents the recommended runtime approach used in the project.

## File locations
- Source locale JSONs: `src/assets/i18n/{lang}.json` (example: `en.json`, `ua.json`)
- Docs: `docs/updates/06_localization-spec.md`

## Runtime loader
- The app uses a runtime JSON loader that reads locale files at startup.
- For library-based translation we migrated to `@ngx-translate/core` with a `TranslateHttpLoader`.

## Bootstrap configuration (standalone app)
- Register `TranslateModule.forRoot(...)` via `importProvidersFrom(TranslateModule.forRoot(...))` inside `main.ts` when calling `bootstrapApplication()`.
- Provide a `TranslateHttpLoader` factory that uses `HttpClient` to fetch translation JSON files.

## Asset path and fallback strategy
- Dev server typically serves files from `/assets/i18n/{lang}.json`. In the production build the files may be emitted to `/i18n/{lang}.json` depending on `angular.json` assets configuration.
- Recommended loader behavior:
  1. Attempt a relative fetch: `assets/i18n/{lang}.json` (works for sub-path base hrefs).
  2. If that fails, attempt absolute fetch: `/assets/i18n/{lang}.json`.
  3. If both fail, fall back to `en`.

## Default language and persistence
- Default language: `en`.
- Persist user selection in `localStorage` under key `denumismat-lang`.
- Use an `APP_INITIALIZER` to read the persisted language and call `translate.use(lang)` before application start.

## Component patterns
- Prefer the `translate` pipe in templates for static text: `{{ 'introduction.title' | translate }}`.
- Inject `TranslateService` only when you need to change language at runtime or access translations programmatically.

## Adding a new locale
1. Create `src/assets/i18n/{code}.json` with the same key structure as existing locales.
2. Ensure `angular.json` includes `src/assets` in `assets` so locale JSONs are copied to the build output.
3. Optionally add a language option in the header language dropdown and ensure selection persists to `localStorage`.

## Naming and ordering conventions
- Filenames in `docs` should start with a timestamp that includes seconds (example: `2026-02-07T13-33-45_i18n-spec.md`) or, where updates are grouped, a numeric prefix to determine sequence (used here as `06_`).

## Troubleshooting
- If translations return 404 in production, confirm `angular.json` `assets` configuration and the final `dist` output path for i18n files.
- If using a non-root `baseHref`, prefer relative `assets/i18n/{lang}.json` fetches.

## Security and performance
- Keep locale files small; avoid embedding large data or secrets in JSON.
- Consider preloading critical locales during `APP_INITIALIZER` for a flash-free initial load.

## Changelog
- Consolidated from previous updates: runtime `LocalizationService`, `i18n` fetch fixes, and migration to `@ngx-translate` with bootstrap provider registration.

```
