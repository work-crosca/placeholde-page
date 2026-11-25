# Placeholder Page

A reusable coming-soon / maintenance page for MIRCO projects. Full-screen charcoal canvas, iridescent oversized typography and an original head-only SVG robot with smooth pointer gaze and spontaneous emotions. Mascotry and page-mascot inspired the interaction concept only; no code, sprites, assets or dependencies from either project are used.

## Quick start

Requires Node.js 22+. React and React Icons are used only to render the Telegram SVG on the server. No database or browser React bundle required.

```sh
npm install
npm start
npm test
npm run build
```

Open http://localhost:3000. For local customization, copy .env.example to .env and run `node --env-file=.env server.js` (npm start does not load .env automatically).

## Configuration

All options are runtime environment variables, so one image can serve multiple domains in separate containers.

| Variable | Default | Description |
| --- | --- | --- |
| PORT | 3000 | HTTP port |
| SITE_NAME | MIRCO | Brand |
| SITE_LANGUAGE | en | en, ro, ru |
| SITE_MODE | soon | soon or maintenance |
| SITE_TITLE | localized | Optional custom headline |
| SITE_DESCRIPTION | localized | Optional custom description |
| SITE_EMAIL | empty | Optional contact mailto link |
| SITE_URL | empty | Public origin (e.g. https://example.mirco.uk), for absolute social preview URLs |
| SITE_TELEGRAM | empty | Telegram username without @; hides the icon when unset or invalid |
| SITE_ASCII_BACKGROUND | true | Set false to disable the animated decorative ASCII background |
| SITE_MASCOT | true | Set false to hide mascot |

## Coolify

1. Create a new application from this repository.
2. Select Dockerfile as build pack, root directory /, Dockerfile /Dockerfile.
3. Set exposed port 3000 and your desired domain.
4. Add runtime environment variables above, then deploy.
5. Configure health check GET /health on port 3000. It returns 200 even in maintenance mode.
6. For another domain, deploy another instance with its own variables.

Alternatively: `docker build -t placeholder-page .` then `docker run --rm -p 3000:3000 -e SITE_NAME=Example placeholder-page`.

## Behavior and architecture

- server.js: HTTP server, explicit asset allowlist, security headers and status codes.
- src/page.js: localization, configuration, escaped HTML and original SVG.
- public/style.css: responsive layout, reduced-motion support, blinking.
- public/context-menu.js: desktop right-click menu with localized Coming soon/Refresh actions, keyboard navigation and viewport-aware positioning.
- public/mascot.js: nine-direction gaze, random click and idle expressions, randomized blinking, sleepy state after 30 seconds, visibility-aware timers and reduced-motion support.
- / returns 200 in coming-soon mode, 503 with Retry-After in maintenance.
- /health returns 200; unknown paths return 404.
- robots.txt and noindex prevent indexing of temporary content. Remove these restrictions when replacing the placeholder with the actual website.
- No analytics, tracking, fake countdown, newsletter or external assets. Telegram is the only social link; set SITE_TELEGRAM to display it.

## Verification

Run npm test and npm run build. For manual QA, inspect at 320, 768 and 1440px; verify mouse tracking, pointer exit, touch, reduced motion, localized text, contact and health endpoint. Check maintenance status with curl -I http://localhost:3000 after starting with SITE_MODE=maintenance.

## Design decisions

Vanilla HTML/CSS/JS plus Node HTTP rather than Next.js/Tailwind: a temporary page needs no full client framework; React Icons is rendered server-side. Typography and colors are inspired by the supplied visual reference; the robot is independently drawn. The optional contact link opens an email client rather than pretending to collect subscriptions. No license is assigned automatically; repository owner can select one.

## Brand assets and social previews

Favicon SVG/ICO, PNG favicons, Apple touch icon and `public/images/social/mirco.png` are exact copies from `work-crosca/mirco.uk` commit `225d47aa2c7738702473429c40c43804be627ef4`. Open Graph and Twitter use the shared 1200 × 630 image with the placeholder's localized title and description. Set SITE_URL to the public origin for absolute preview URLs. Existing noindex policy is unchanged.

## Robot mascot

Original SVG head only, no reflection line, no body. Seven random emotions plus neutral and blink. Idle expressions appear after 4–8 seconds of inactivity, last 1–2 seconds; after 30 seconds the robot sleeps until activity resumes. Clicking or tapping triggers a random expression without consecutive repeats. Mouse pointers move the eyes smoothly.  Reduced motion disables autonomous changes and gaze, while intentional button interaction remains available. No sprite sheets or additional dependencies are needed.

## ASCII background

An original procedural wave field of ASCII characters is drawn on a decorative canvas, fading toward the text. It runs at about 15 FPS, caps device pixel ratio, pauses in hidden tabs and renders a static frame for reduced motion. No pointer events or external assets. Set SITE_ASCII_BACKGROUND=false to disable it entirely.

### Animation controller

Parametric SVG expressions interpolate in one animation loop. Eyes lead the head, with inertial tracking, breathing, click squash, occasional double blink, 12 emotions, idle and sleeping states. CTA hover/focus holds excitement; Telegram hover/focus holds curiosity; title hover holds curiosity. Context reactions take priority over idle reactions. Click emits a decorative ASCII ripple when enabled. Reduced motion disables autonomous animation and tracking; explicit reactions remain available. Hidden tabs stop the animation loop.

### Mobile gestures and haptics

Touch anywhere directs gaze for 1.5 seconds; scroll briefly directs gaze vertically. Tap the robot for a reaction, double tap within 350 ms for hearts, or hold 550 ms without moving more than 12 px for confusion. Touch CTA triggers excitement and Telegram triggers a wink on pointerdown without delaying navigation. Haptics use navigator.vibrate when available (18 ms tap, 25 ms double tap/hold); unsupported browsers such as iOS Safari silently keep visual feedback. Mobile robot painting is limited to approximately 30 FPS and ASCII to 10 FPS with a sparser grid. Gestures do not cancel normal page scrolling; reduced-motion disables autonomous tracking and animation.

The header uses the original MIRCO folded blue monogram from `public/images/brand/mark.svg`, copied from mirco.uk without modification; no visible wordmark. SITE_NAME remains the accessible image label and metadata brand.

## Web manifest and metadata

`/manifest.webmanifest` is generated at runtime from SITE_NAME, SITE_DESCRIPTION and SITE_LANGUAGE. It uses the exact MIRCO 192px, 512px and maskable 512px icons, a dark theme, root scope and browser display mode. No service worker or offline caching is provided; this is a temporary placeholder, not a full PWA. The page declares theme color, application name, Apple title, author and localized Open Graph locale. Social preview uses SITE_URL when configured and falls back to the shared https://mirco.uk image otherwise. Existing noindex and robots policy is retained. The manifest is served with application/manifest+json and permitted by CSP.

## Custom context menu

On desktop, right-clicking the placeholder opens a compact two-action menu in the site's dark/blue visual style. **Coming soon** shows the current localized page description in a temporary, accessible toast; **Refresh** reloads the page. The menu is clamped to the viewport, dismisses on outside click, scroll, resize, browser blur or Escape, and supports keyboard Context Menu / Shift+F10 and arrow-key navigation. Normal selection, editable fields and touch long-press context menus remain available.

## Animated heading and description

The heading uses a 320 ms subtle digital glitch every 6.5–14 seconds. Default coming-soon descriptions rotate through eight localized phrases (EN/RO/RU), holding a complete phrase for 5–11 seconds before erasing and typing the next in shuffled order without immediate repetition. The longest rendered phrase reserves space at the current viewport width. Custom SITE_DESCRIPTION and maintenance descriptions remain static. Both effects stop when the document is hidden or reduced motion is requested. Metadata and accessible description remain stable.
