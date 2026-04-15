# 011 - Mobile Optimization (iPhone)

## Goal
Optimize all pages for mobile iPhone usage using Playwright CLI for testing.

## Issues Found

### Critical Bug
- **Blank pages on nested routes** (`/vocabulary/new`, `/training/session`): `<base href="./">` in `index.html` caused CSS/JS to resolve relative to the URL path. e.g. navigating to `/vocabulary/new` tried loading `/vocabulary/styles.css` which 404'd, breaking the entire Angular app on those routes.

### Mobile Layout Issues
- **Vocabulary Form**: `.swiss-row` flex layout crammed input + translate button + speak button side-by-side on narrow screens
- **Settings**: Info text, warning boxes, provider cards, and cache stats too cramped on mobile
- **Vocabulary List**: Table with 4 columns (type, german, swiss, actions) overflows on small screens
- **App Toolbar**: Nav link touch targets too small for mobile
- **Training Session**: Progress row, flashcard buttons, and results screen need mobile spacing

## Changes Made

### `src/index.html`
- Changed `<base href="./">` to `<base href="/">` — fixes all nested route rendering

### `src/app/app.css`
- Added 480px mobile breakpoint: enlarged nav link touch targets (48x48px min), reduced main padding

### `src/app/components/vocabulary-form/vocabulary-form.component.css`
- Added 480px breakpoint: `.swiss-row` wraps on mobile, translate button takes full width alongside speak button, reduced top margin

### `src/app/components/settings/settings.component.css`
- Added 480px breakpoint: reduced container padding, stacked cache stats vertically, stacked section headers, compact provider options and warning box

### `src/app/components/vocabulary-list/vocabulary-list.component.css`
- Added 480px breakpoint: hidden type column on mobile, full-width header actions, smaller title, reduced padding

### `src/app/components/training-session/training-session.component.css`
- Added 480px breakpoint: compact progress row, full-width flashcard buttons, stacked results actions, smaller score text, reduced container padding

## Testing
Tested all 5 routes on iPhone 14 viewport (390x844) using Playwright `chromium` with `devices['iPhone 14']` emulation. All pages render correctly and are usable on mobile.
