# Spatial Audio & High-Fidelity Streaming

**Course:** 2102571 — Multimedia Communication in the 21st Century  
**Due:** May 6, 2026  

To analyze the efficiency of perceptual audio codecs and implement a spatial audio (3D Audio) streaming system that maintains immersion under network constraints.

---

## Folder Structure

```
spatial-audio-and-high-fidelity-streaming/
├── README.md
│
├── ref-docs/                          # Reference materials (read-only)
│   ├── init-docs-project-list.pdf     # Original project brief
│   ├── project-requirements.md        # Extracted requirements for Project 4
│   ├── project-plan.md                # 4-week project plan
│   └── from-teammate/                 # Teammate's initial work
│       ├── MultiMed_project.ipynb
│       └── PEAQ.md
│
├── src/                               # All source code
│   ├── phase2-codec-analysis/         # Codec comparison & spectral analysis
│   │   └── Phase2_Codec_Analysis.ipynb  (Google Colab ready)
│   ├── phase3-spatial-player/         # Web Audio API spatial player
│   ├── phase4-abx-testing/            # ABX subjective listening tests
│   └── phase5-streaming-stress-test/  # Network stress testing
│
├── audio-samples/                     # Audio test data
│   ├── original/                      # Lossless source files (WAV/FLAC)
│   └── encoded/                       # Compressed outputs by codec/bitrate
│
├── report/                            # Final report materials
│   ├── figures/                       # All charts, spectrograms, plots
│   └── sections/                      # Draft sections (optional)
│
└── deliverables/                      # Final submission artifacts
    ├── demo-video/                    # 5-min demo video
    └── audio-clips/                   # Sample clips showing artifacts
```

## How to run

### Phase 2 — Codec Analysis (Google Colab)
1. Open `src/phase2-codec-analysis/Phase2_Codec_Analysis.ipynb` in Google Colab
2. Run Cell 0 once to build FFmpeg with libfdk_aac (~10 min)
3. Run remaining cells sequentially

### Phase 3 — Spatial Player (GitHub Codespaces / local)
TBD

## Team
- Member 1
- Member 2
- Member 3
