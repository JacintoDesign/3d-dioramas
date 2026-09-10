# Terra

An interactive atlas of seven procedural 3D dioramas: pine forest, desert oasis, alpine peaks, tropical coast, volcanic island, sakura garden, and lunar outpost.

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Vite. For a production build, run `npm run build`; `npm run preview` serves the result.

## Explore

- Select any miniature to change worlds.
- Drag to orbit; scroll or pinch to zoom.
- Toggle automatic rotation, reset the camera, or enter fullscreen.
- Use arrow keys on the world selector to move between exhibits.

Built with Three.js and Vite. All scenery is generated from geometry in `src/main.js`; no external model or image assets are needed. Typography uses Google Fonts, with local sans-serif fallbacks. The layout adapts to narrow screens with a horizontally scrolling collection.
