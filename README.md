# Password Generator

Persian RTL password generator built with Vite, Tailwind CSS, and vanilla JavaScript. Works offline as a PWA.

Live demo: [psswordgenerator.mmdcode.top](https://psswordgenerator.mmdcode.top/)

![screenshot](https://mmdcode.top/images/3.png)

## Features

- Password presets (basic, medium, strong) and custom character sets
- Strength indicator, modal with save/copy/regenerate
- Local history with copy and delete
- Optional encrypted storage (AES-GCM + PBKDF2) with a user master key
- Vazirmatn font bundled locally, no CDN

## Setup

```bash
npm install
npm run dev
npm run build
npm run preview
```

Run on HTTPS or localhost for clipboard and service worker support.

## Project layout

```
src/
  app.js              entry point
  handlers.js         form and modal events
  config/constants.js settings and UI strings
  services/           password, crypto, ui, effects
  utils/              dom helpers, formatters
  styles/             base, components, layout
```

## Deploy

Build with `npm run build`, then publish the `dist/` folder to any static host (GitHub Pages, cPanel, etc.).

## License

MIT — see [LICENSE](LICENSE).
