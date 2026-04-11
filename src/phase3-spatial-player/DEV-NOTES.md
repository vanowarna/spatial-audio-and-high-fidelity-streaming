# Phase 3: Spatial Audio Player — Dev Notes

> Living document. Updated as we build.

---

## Current Status: v0.1 — Core scaffold complete

### What's built

| Module | File | Status | Notes |
|--------|------|--------|-------|
| HTML layout | `index.html` | Done | Glassmorphic dark 3-column layout |
| CSS theme | `css/style.css` | Done | Full glassmorphic dark mode, responsive |
| Audio engine | `js/audio-engine.js` | Done | HRTF panners, source management, mode switching |
| 3D Scene | `js/scene3d.js` | Done | Three.js room, draggable sources + listener, orbit controls |
| Visualizer | `js/visualizer.js` | Done | Freq bars (64-band) + waveform with dB and peak Hz labels |
| Codec switcher | `js/codec-switcher.js` | Done | Crossfade switching, preload system, variant registry |
| Stress test | `js/stress-test.js` | Done | Packet loss (0-30%) + jitter (0-500ms) simulation |
| Main app | `js/app.js` | Done | Wiring, keyboard shortcuts, source management, file upload |
| Vercel config | `vercel.json` | Done | Static deploy, CORS headers for audio |
| Codespaces | `.devcontainer/` | Done | Auto-installs live-server, forwards port 5500 |

### How to run

**GitHub Codespaces:**
```bash
cd src/phase3-spatial-player
npx live-server --port=5500
```

**Local:**
```bash
cd src/phase3-spatial-player
npx live-server --port=5500
# or use VS Code Live Server extension
```

**Vercel:**
Push to GitHub → connect repo in Vercel → set root directory to `src/phase3-spatial-player` → deploy.

### Demo audio

Currently generates **4 synthetic sources** on startup:
1. Ambient Pad (C3 chord with LFO)
2. Percussion (clicks at 120 BPM)
3. Melody (A minor scale sine)
4. Ambient Noise (pink noise)

**TODO:** Replace with real audio files placed in `assets/audio/`.

### Known limitations (v0.1)

- Codec switcher UI is wired but no pre-encoded files yet (selecting MP3/AAC/Opus won't change audio until variants are loaded from `assets/audio/`)
- File upload works for adding new sources but doesn't auto-register codec variants
- Stress test simulates at JS level (not real network impairment)
- Mobile layout not fully tested

### What's next

- [ ] Encode real audio samples from Phase 2 into `assets/audio/` directories
- [ ] Wire codec-switcher to load pre-encoded variants on startup
- [ ] Add distance labels on hover in 3D scene
- [ ] Add source removal button
- [ ] Per-source gain slider in source panel
- [ ] Export stress test results as CSV for report

---

## Architecture decisions

**Why vanilla JS?** Team works in Colab (Python-first). No build step = anyone can edit. Trivial Vercel deploy.

**Why importmap for Three.js?** CDN import, no npm/bundler needed. Works in all modern browsers.

**Why simulate stress in JS?** Deterministic, reproducible, no server needed. Real `tc` network shaping is Phase 5 scope.

**HRTF source:** Using browser built-in HRTF (Chrome/Firefox ship one). No external HRTF dataset needed unless comparing datasets.
