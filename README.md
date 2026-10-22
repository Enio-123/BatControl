# BatControl

Learn Pybricks for FIRST LEGO League Challenge, made by team BatLego.

- 3D simulator of a SPIKE Prime robot with a training mat, ruler, ghost trail, realistic mode (wheel slip and gyro), mission objects, a photo of your own mat and a 2:30 match with several runs.
- Python editor with blocks, program library with link and QR sharing, and upload to a real hub over Bluetooth (Chrome or Edge, Pybricks firmware v3.3 or newer).
- Reference, 50 step-by-step lessons with automatic checking, and a review of the exercises you got wrong.
- Puzzles, one after another like on chess.com, with a rating that goes up when you solve them on the first try.
- BIOGLOW (2026–2027) score calculator with timer and run history.
- Interface and lessons in English, Português, Español, Français, Deutsch, 中文 and 日本語.
- Installable app that works offline.

The simulator is a simplified model for practice. The official FIRST scoring calculator and the referee have the final word on scores.

## Development

```sh
npm install
npm run dev          # local server
npm test             # lessons, puzzles, translations and dictionaries
npm run build:pages  # site for GitHub Pages in dist-pages/
npm run build        # single HTML file in dist/batcontrol.html
node scripts/test-pages.mjs   # offline install and in-browser compiler (Chromium)
```

## Publishing on GitHub Pages

1. Push this folder to a GitHub repository (branch `main`).
2. In the repository, open Settings > Pages and set Source to "GitHub Actions".
3. Every push to `main` runs the tests and publishes the site (`.github/workflows/pages.yml`).

Pybricks is a project by The Pybricks Authors. LEGO, SPIKE and FIRST are trademarks of their owners; this project is not affiliated with them.
