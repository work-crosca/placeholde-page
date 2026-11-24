# Placeholder Page

A reusable coming-soon / maintenance page for MIRCO projects. Full-screen charcoal canvas, iridescent oversized typography and an original SVG robot whose eyes follow the pointer. Mascotry inspired the interaction concept only; no code, sprites, assets or dependency from that project are used.

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
| SITE_TELEGRAM | empty | Telegram username without @; hides the icon when unset or invalid |
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
- public/mascot.js: bounded pointer tracking, requestAnimationFrame, neutral reset and touch fallback.
- / returns 200 in coming-soon mode, 503 with Retry-After in maintenance.
- /health returns 200; unknown paths return 404.
- robots.txt and noindex prevent indexing of temporary content. Remove these restrictions when replacing the placeholder with the actual website.
- No analytics, tracking, fake countdown, newsletter or external assets. Telegram is the only social link; set SITE_TELEGRAM to display it.

## Verification

Run npm test and npm run build. For manual QA, inspect at 320, 768 and 1440px; verify mouse tracking, pointer exit, touch, reduced motion, localized text, contact and health endpoint. Check maintenance status with curl -I http://localhost:3000 after starting with SITE_MODE=maintenance.

## Design decisions

Vanilla HTML/CSS/JS plus Node HTTP rather than Next.js/Tailwind: a temporary page needs no full client framework; React Icons is rendered server-side. Typography and colors are inspired by the supplied visual reference; the robot is independently drawn. The optional contact link opens an email client rather than pretending to collect subscriptions. No license is assigned automatically; repository owner can select one.
