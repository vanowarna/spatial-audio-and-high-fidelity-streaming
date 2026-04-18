# How to Run — Complete Guide

**Project:** Spatial Audio & High-Fidelity Streaming  
**Course:** 2102571 — Multimedia Communication in the 21st Century  
**Due:** May 6, 2026

---

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Google Account | Run Colab notebooks | — |
| GitHub Account | Host repo + Codespaces | — |
| Headphones | ABX listening tests | Any over-ear or in-ear |
| Python 3.10+ | Local development (optional) | python.org |
| Node.js 18+ | Spatial player dev (optional) | nodejs.org |

---

## Project Structure

```
spatial-audio-and-high-fidelity-streaming/
│
├── HOW-TO-RUN.md              ← You are here
├── README.md                  ← Project overview
│
├── ref-docs/                  ← Reference materials
│   ├── init-docs-project-list.pdf
│   ├── project-requirements.md
│   ├── project-plan.md
│   └── from-teammate/
│       └── MultiMed_project.ipynb   (original teammate notebook)
│
├── src/
│   ├── phase2-codec-analysis/
│   │   └── Phase2_Codec_Analysis.ipynb    ★ Google Colab
│   │
│   ├── phase3-spatial-player/
│   │   ├── index.html                     ★ GitHub Codespaces
│   │   ├── css/style.css
│   │   ├── js/                            (6 JS modules)
│   │   ├── vercel.json
│   │   └── .devcontainer/
│   │
│   ├── phase4-abx-testing/
│   │   ├── index.html                     ★ GitHub Codespaces
│   │   ├── css/style.css
│   │   ├── js/abx-test.js
│   │   └── Phase4_ABX_Analysis.ipynb      ★ Google Colab
│   │
│   └── phase5-streaming-stress-test/
│       └── Phase5_Stress_Test.ipynb       ★ Google Colab
│
├── report/
│   ├── Spatial_Audio_Report.docx
│   ├── Spatial_Audio_Presentation.pptx
│   └── figures/
│
├── audio-samples/
│   ├── original/
│   └── encoded/
│
└── deliverables/
    ├── demo-video/
    └── audio-clips/
```

---

## Phase 2: Codec Comparison & Spectral Analysis

**Platform:** Google Colab  
**Time:** ~30 min (15 min FFmpeg build + 15 min analysis)

### Steps

1. **Open in Colab**
   - Go to [Google Colab](https://colab.research.google.com/)
   - Upload `src/phase2-codec-analysis/Phase2_Codec_Analysis.ipynb`
   - Or: File → Open Notebook → GitHub → paste repo URL

2. **Build FFmpeg** (Cell 0 — one-time, ~10-15 min)
   - This compiles FFmpeg with `libfdk_aac` for high-quality AAC encoding
   - Run once per Colab session; it checks and skips if already built

3. **Prepare audio samples** (Cell 2)
   - **Option A:** Upload your own WAV files (recommended for final analysis)
     - Uncomment the `files.upload()` lines
     - Upload at least 3 files: one music, one speech, one ambient
   - **Option B:** Use auto-generated synthetic signals (for pipeline testing)

4. **Run all remaining cells** sequentially
   - Cells 3-4: Encode across AAC, Opus, MP3 at 8 bitrate levels
   - Cell 5: Compute SNR and ODG metrics
   - Cell 6: Generate Rate-Distortion curves
   - Cell 7: Spectrogram comparisons
   - Cell 8: Spectral masking analysis
   - Cell 9: Transparency point estimation
   - Cell 10: Interactive listening (use headphones!)
   - Cell 11: Export results zip

5. **Download outputs**
   - Uncomment `files.download()` in Cell 11 to get the zip
   - Copy figures to `report/figures/` for the report

### Key outputs
- `rd_curves_*.png` — Rate-Distortion plots (for report Figure 4)
- `spec_*_48k.png` — Spectrogram comparisons (for report Figure 2)
- `spectral_diff_*_128k.png` — Masking analysis (for report Figure 3)
- Transparency point table printed in Cell 9

---

## Phase 3: Spatial Audio Player

**Platform:** GitHub Codespaces (or any machine with a browser)  
**Time:** ~5 min setup

### Option A: GitHub Codespaces (recommended)

1. **Open Codespace** from your repo on GitHub
   - The `.devcontainer/devcontainer.json` auto-installs `live-server`

2. **Start the server**
   ```bash
   cd src/phase3-spatial-player
   npx live-server --port=5500
   ```

3. **Open in browser**
   - Codespaces will show a popup to open the forwarded port
   - Or: go to the Ports tab → click the globe icon for port 5500

4. **Use headphones** and interact:
   - Press **Play** to start audio
   - **Drag** sound sources and the listener in the 3D scene
   - Toggle **Mono / Stereo / Spatial** modes in the header
   - Switch **Codec** and **Bitrate** in the bottom bar
   - Adjust **Loss** and **Jitter** sliders in the right panel
   - Press **Space** for play/pause, **1-8** to select sources

### Option B: Local machine

```bash
cd src/phase3-spatial-player
npx live-server --port=5500
# Opens http://localhost:5500 in your default browser
```

### Option C: Deploy to Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import → select your repo
3. Set **Root Directory** to `src/phase3-spatial-player`
4. Deploy (zero build step — static files)

### Loading real audio files

To use Phase 2 encoded audio instead of synthetic demo:
1. Copy encoded WAV files to `src/phase3-spatial-player/assets/audio/demo_music/`
2. Name them: `original.wav`, `mp3_64.mp3`, `mp3_128.mp3`, `aac_64.m4a`, `opus_64.ogg`, etc.
3. The codec switcher will automatically load and enable real-time toggling

---

## Phase 4: ABX Listening Test

**Platform:** Web interface (Codespaces) + Google Colab for analysis  
**Time:** ~15 min per participant + 10 min analysis

### Part A: Run the ABX test (5+ participants)

1. **Start the test server** (same as Phase 3)
   ```bash
   cd src/phase4-abx-testing
   npx live-server --port=5501
   ```

2. **Share the URL** with 5+ participants
   - In Codespaces: make the port public (Ports tab → right-click → Port Visibility → Public)
   - Or deploy to Vercel for a permanent URL

3. **Each participant:**
   - Opens the URL, enters their ID/name
   - Listens to A, B, X clips and decides if X = A or X = B
   - Rates their confidence (Guessing / Somewhat sure / Confident)
   - Keyboard shortcuts: **A**, **B**, **X** to play; **Space** to stop
   - Downloads their CSV results at the end

4. **Collect all CSV files** from participants

### Loading real audio for ABX tests

Place encoded audio in:
```
src/phase4-abx-testing/assets/audio/
├── music/
│   ├── original.wav
│   ├── mp3_64.wav      (decoded back to WAV from MP3 @ 64k)
│   ├── mp3_96.wav
│   ├── aac_128.wav
│   ├── opus_64.wav
│   └── ...
├── speech/
│   └── ...
└── ambient/
    └── ...
```

If no files are found, the test generates synthetic audio for demo purposes.

### Part B: Analyze results (Google Colab)

1. **Open** `src/phase4-abx-testing/Phase4_ABX_Analysis.ipynb` in Colab
2. **Upload** all participant CSV files to the `abx_results/` folder
3. **Run all cells** — generates:
   - Overall accuracy + binomial significance test
   - Per-codec accuracy by bitrate (key plot for report)
   - Transparency point estimation
   - Confidence-weighted analysis
   - MOS approximation
4. **Download** the output zip for report figures

### Key outputs
- `abx_accuracy_by_codec.png` — Main ABX results (for report Figure 5)
- `abx_mos_approx.png` — MOS scores (for report Figure 6)
- `abx_summary_table.csv` — Data for report tables

---

## Phase 5: Streaming Stress Test

**Platform:** Google Colab  
**Time:** ~20-30 min (depends on matrix size)

### Steps

1. **Open** `src/phase5-streaming-stress-test/Phase5_Stress_Test.ipynb` in Colab
2. **Run all cells** sequentially:
   - Cells 1-3: Setup and audio preparation
   - Cells 4-5: Packet loss and jitter simulation functions
   - Cell 6: Quality metrics (SNR + ODG)
   - Cell 7: **Main stress test matrix** — runs all combinations of codec × bitrate × loss × jitter (takes ~15-20 min)
   - Cells 8-12: Analysis and visualization
   - Cell 13: Channel synchronization analysis
   - Cell 14: Export all results

3. **Download** the output zip

### Key outputs
- Quality vs Packet Loss plots (for report Figure 7)
- Quality vs Jitter plots (for report Figure 8)
- Mono vs Stereo vs Spatial comparison (for report Figure 9)
- Breakdown point summary table
- Channel synchronization analysis

---

## Assembling the Final Report

### Report (.docx)

The report template is at `report/Spatial_Audio_Report.docx`. It contains:
- Full academic structure (Introduction through Conclusions)
- 9 figure placeholders marked `[INSERT FROM PHASE X]`
- Placeholder text for team names and specific results

**To complete:**
1. Open in Word/Google Docs
2. Replace `[Team Member Names]` with actual names
3. Insert figures from Phase 2, 4, 5 outputs into the marked placeholders
4. Update the transparency point table with your actual results
5. Refine discussion text based on your findings
6. Export as PDF for submission

### Presentation (.pptx)

The presentation is at `report/Spatial_Audio_Presentation.pptx` (18 slides, ~10 min). It uses Google colors and has placeholder boxes for figures/screenshots.

**To complete:**
1. Open in PowerPoint or Google Slides
2. Replace placeholder boxes with actual screenshots and plots
3. Update statistics with your real results
4. If using Google Slides: change font to "Google Sans" (Product Sans is used as placeholder)
5. Practice the 10-minute delivery

---

## Demo Video (5 minutes)

Record a 5-minute demo covering:

1. **Spatial Player walkthrough** (~2 min)
   - Show the 3D scene with sources
   - Demonstrate dragging sources, listener movement
   - Toggle Mono → Stereo → Spatial to hear the difference

2. **Codec comparison** (~1.5 min)
   - Switch between Original → MP3 64k → AAC 128k → Opus 64k
   - Point out audible differences

3. **Stress test demo** (~1.5 min)
   - Gradually increase packet loss from 0% to 20%
   - Show jitter effects on spatial audio
   - Compare Spatial vs Mono resilience

**Tools for recording:**
- OBS Studio (free, works everywhere)
- Windows: Win+G game bar
- Mac: QuickTime screen recording

Save to `deliverables/demo-video/`.

---

## Submission Checklist

Before submitting to MyCourseville on May 6:

- [ ] Final Report (PDF) — exported from the .docx with all figures inserted
- [ ] Codebase — this entire repo (push to GitHub)
- [ ] Demo Video — 5-minute recording in `deliverables/`
- [ ] Audio Samples — representative clips in `deliverables/audio-clips/`
- [ ] All notebooks run without errors on a fresh Colab instance
- [ ] All web apps run in Codespaces without additional setup

---

## Troubleshooting

### FFmpeg build fails in Colab
- Try restarting the runtime (Runtime → Restart runtime)
- If `libfdk-aac-dev` is not available, the notebook falls back to FFmpeg's built-in `aac` encoder

### Spatial player has no sound
- Click anywhere on the page first (browsers require user gesture for AudioContext)
- Check that the play button was pressed
- Verify headphones are connected

### ABX test won't load audio
- Ensure audio files are in the correct `assets/audio/` directory structure
- Check browser console (F12) for 404 errors
- The test auto-generates synthetic audio if files are missing

### Colab runs out of memory
- Reduce the bitrate or loss level arrays in the stress test matrix
- Use `Runtime → Change runtime type → High-RAM` if available

### Vercel deploy shows blank page
- Ensure root directory is set to `src/phase3-spatial-player` (not the repo root)
- Check that `vercel.json` is in the phase3 directory
