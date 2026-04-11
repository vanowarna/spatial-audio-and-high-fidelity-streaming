# Phase 3: Spatial Audio Player — Implementation Plan

## Overview

A **glassmorphic dark-mode web app** that renders a 3D spatial audio scene using Three.js and the Web Audio API with HRTF spatialization. Users can place up to 8+ sound sources in 3D space, move the listener, toggle between codecs in real-time, visualize frequency/waveform data, and simulate network stress conditions — all in a single page.

**Stack:** Vanilla HTML/CSS/JS + Three.js + Web Audio API  
**Deployment:** GitHub Codespaces (dev) → Vercel (production)  
**No build step required** — open `index.html` and go.

---

## Architecture

```
index.html                 ← Single entry point
├── css/
│   └── style.css          ← Glassmorphic dark theme, layout
├── js/
│   ├── app.js             ← Main initialization, wiring everything together
│   ├── audio-engine.js    ← Web Audio API: AudioContext, HRTF PannerNodes, gain
│   ├── scene3d.js         ← Three.js: 3D room, source spheres, listener, controls
│   ├── codec-switcher.js  ← Real-time codec/bitrate toggling logic
│   ├── visualizer.js      ← AnalyserNode → frequency bars + waveform canvas
│   ├── stress-test.js     ← Simulated packet loss & jitter (mutes/delays audio chunks)
│   └── ui-panels.js       ← Panel show/hide, drag, glassmorphic overlays
├── assets/
│   ├── audio/             ← Pre-loaded demo audio (original + encoded variants)
│   └── hrtf/              ← HRTF dataset (optional, browser default is fine)
└── vercel.json            ← Vercel static deploy config
```

---

## UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER BAR — "Spatial Audio Lab" + project info        [?]  │
├──────────┬───────────────────────────────────┬───────────────┤
│          │                                   │               │
│  SOURCE  │                                   │  VISUALIZER   │
│  LIST    │      3D SCENE (Three.js)          │  PANEL        │
│  PANEL   │                                   │               │
│          │  - Room with grid floor           │  - Freq bars  │
│  [+Add]  │  - Colored source spheres         │  - Waveform   │
│  src 1 ● │  - Listener (head icon)           │  - Peak freq  │
│  src 2 ● │  - Orbit controls                 │               │
│  src 3 ● │  - Click-drag to move objects     │               │
│  ...     │                                   │               │
│          │                                   │               │
├──────────┴───────────────────────────────────┴───────────────┤
│  CONTROL BAR                                                  │
│  ▶/⏸  ■  Vol ━━━━○━━  │ Codec: [MP3▼] Bitrate: [128k▼]     │
│                        │ Stress: Loss [0%━━] Jitter [0ms━━]  │
└──────────────────────────────────────────────────────────────┘
```

All panels are **glassmorphic** (frosted glass effect with `backdrop-filter: blur`, semi-transparent backgrounds, subtle borders, dark base).

---

## Module Breakdown

### 1. `audio-engine.js` — Web Audio API core

- Creates a single `AudioContext` with HRTF panner model
- Each sound source gets: `AudioBufferSourceNode` → `GainNode` → `PannerNode` → `AnalyserNode` → `destination`
- `PannerNode` config:
  - `panningModel: 'HRTF'`
  - `distanceModel: 'inverse'`
  - `refDistance: 1`, `maxDistance: 50`, `rolloffFactor: 1`
- Listener position/orientation synced from Three.js camera/object
- Supports up to 8+ concurrent sources (Web Audio handles this natively)
- Exposes `addSource(audioBuffer, position)`, `removeSource(id)`, `setSourcePosition(id, x, y, z)`, `setListenerPosition(x, y, z, orientationForward, orientationUp)`

### 2. `scene3d.js` — Three.js 3D scene

- Dark scene with subtle grid floor and faint room wireframe
- Each sound source = glowing sphere (emissive material, color-coded)
  - `TransformControls` or custom raycasting for drag-to-move
  - Rings/pulse animation when playing
- Listener = distinct mesh (small head/arrow icon) also draggable
- `OrbitControls` for camera (orbit/zoom/pan the whole scene)
- On source/listener drag → updates `audio-engine` positions in real-time
- Distance labels shown on hover
- Optional: cone visualization showing PannerNode directional cone

### 3. `codec-switcher.js` — Real-time codec toggle

- For each source, preloads multiple versions: `{original, mp3_64, mp3_128, aac_64, aac_128, opus_64, opus_128, ...}`
- On codec/bitrate change via dropdown:
  1. Records current `playbackTime` position
  2. Crossfades to the new buffer (50ms fade to avoid click)
  3. Resumes from same position
- Dropdown UI: `Codec: [Original | MP3 | AAC | Opus]` + `Bitrate: [48 | 64 | 96 | 128 | 192 | 256]`
- Shows file size and ODG score next to selection (from Phase 2 data)

### 4. `visualizer.js` — Real-time frequency & waveform

- Uses `AnalyserNode` from the audio engine
- **Frequency bars:** Vertical bars with gradient coloring (low freq = blue, high = red), glassmorphic panel background
- **Waveform:** Oscilloscope-style line drawing
- Both rendered on `<canvas>` with `requestAnimationFrame`
- Shows peak frequency label and current dB level

### 5. `stress-test.js` — Network simulation

- **Packet loss slider (0–30%):** Randomly mutes short audio chunks (20–50ms windows) to simulate dropped packets
  - Implementation: `GainNode` that randomly goes to 0 for brief intervals
  - Uses `setValueAtTime` scheduling for precise timing
- **Jitter slider (0–500ms):** Adds random delay variation to audio start times
  - Implementation: `DelayNode` with modulated delay time
- Visual indicator: red warning overlay when loss > 10%
- Mode toggle: `Mono | Stereo | Spatial` to compare how each handles degradation
- Results logging: tracks and displays "glitch count" and "perceived quality" rating prompt

### 6. `ui-panels.js` — Glassmorphic UI management

- Panel show/hide with smooth transitions
- Draggable panels (optional)
- Responsive layout: stacks vertically on narrow screens
- Keyboard shortcuts: `Space` = play/pause, `1-8` = select source, `R` = reset positions

---

## Glassmorphic Dark Theme Spec

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-glass: rgba(255, 255, 255, 0.05);
  --bg-glass-hover: rgba(255, 255, 255, 0.08);
  --border-glass: rgba(255, 255, 255, 0.1);
  --text-primary: #e0e0e0;
  --text-secondary: #888;
  --accent-blue: #4a9eff;
  --accent-green: #4aff9e;
  --accent-red: #ff4a6a;
  --blur: 20px;
  --radius: 12px;
}

.glass-panel {
  background: var(--bg-glass);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--border-glass);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

## Audio File Organization

```
assets/audio/
├── demo_music/
│   ├── original.wav
│   ├── mp3_48.mp3
│   ├── mp3_128.mp3
│   ├── aac_48.aac    (or .m4a for browser compat)
│   ├── aac_128.aac
│   ├── opus_48.opus   (or .ogg container)
│   └── opus_128.opus
├── demo_speech/
│   └── ...
└── demo_ambient/
    └── ...
```

**Browser codec support note:**
- MP3: Universal
- AAC: Universal (use `.m4a` container)
- Opus: Chrome, Firefox, Edge (not Safari < 17). Use `.ogg` container.

---

## Implementation Order

| Step | What | Est. time |
|------|-------|-----------|
| 1 | Project scaffold + `index.html` + CSS theme | 30 min |
| 2 | `audio-engine.js` — AudioContext, HRTF panners, source management | 1 hr |
| 3 | `scene3d.js` — Three.js room, source spheres, drag interaction | 1.5 hr |
| 4 | Wire audio positions ↔ 3D positions | 30 min |
| 5 | `codec-switcher.js` — preload variants, crossfade switch | 1 hr |
| 6 | `visualizer.js` — frequency bars + waveform canvas | 45 min |
| 7 | `stress-test.js` — packet loss & jitter simulation | 1 hr |
| 8 | `ui-panels.js` — layout, responsive, keyboard shortcuts | 45 min |
| 9 | Polish: animations, loading states, error handling | 30 min |
| 10 | `vercel.json` + deploy config | 10 min |
| 11 | Demo audio prep (encode samples from Phase 2) | 30 min |

**Total estimated: ~8 hours of dev work**

---

## Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "",
  "outputDirectory": ".",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

No build step. Just push to GitHub and connect to Vercel — it serves the static files directly.

---

## GitHub Codespaces Setup

```json
// .devcontainer/devcontainer.json (optional, for convenience)
{
  "name": "Spatial Audio Player",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "forwardPorts": [5500],
  "postCreateCommand": "npm install -g live-server",
  "customizations": {
    "vscode": {
      "extensions": ["ritwickdey.LiveServer"]
    }
  }
}
```

Run with: `live-server --port=5500` or use VS Code Live Server extension.

---

## Key Technical Decisions

1. **Why vanilla JS over React?** No build step = instant dev in Codespaces, trivial Vercel deploy, teammates can read the code without knowing React.

2. **Why Three.js for 3D?** The user wants 3D perspective. Three.js is the standard, loads from CDN, no build needed. We use `<script type="importmap">` for clean module imports.

3. **Why simulate stress in JS instead of real network?** For the demo, JavaScript-level simulation is deterministic and reproducible. Real `tc`-based network shaping would need a streaming server setup, which is Phase 5 territory if done properly. The JS approach lets us show the concept in the player itself.

4. **HRTF dataset:** We use the browser's built-in HRTF (Chrome and Firefox ship with a default dataset). No external HRTF files needed unless the team wants to compare datasets.
