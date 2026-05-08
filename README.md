# Spatial Audio & High-Fidelity Streaming.

**Course:** 2102571 — Multimedia Communication in the 21st Century
**Institution:** Department of Electrical Engineering · Faculty of Engineering · Chulalongkorn University
**Authors:** Yuwadee Tongkong · Vanodhya Warnasooriya · Chanakan Hambleton
**Submission:** 6 May 2026

## Project objective

Analyse the efficiency of perceptual audio codecs (MP3 / AAC / Opus) and implement a spatial audio
(3D audio) streaming system that maintains immersion under network constraints. The deliverable is
a working web-based binaural HRTF player together with the experimental data that justifies the
codec choice.

## Live links

| Resource | Link |
|----------|------|
| Project homepage | [vanowarna.com/spatial-audio-and-high-fidelity-streaming](https://vanowarna.com/spatial-audio-and-high-fidelity-streaming/) |
| Spatial Audio Lab | [`/src/phase3-spatial-player`](src/phase3-spatial-player/) |
| ABX listening test | [`/src/phase4-abx-testing`](src/phase4-abx-testing/) |
| Final report (PDF) | [`/deliverables/Spatial_Audio_Report.pdf`](deliverables/Spatial_Audio_Report.pdf) |
| Slides (PDF) | [`/deliverables/Spatial_Audio_Presentation.pdf`](deliverables/Spatial_Audio_Presentation.pdf) |
| Speaker notes | [`/deliverables/Speaker_Notes.md`](deliverables/Speaker_Notes.md) |

## Repository layout

```
spatial-audio-and-high-fidelity-streaming/
├── index.html                          # Single project homepage (GitHub Pages root)
├── README.md
├── HOW-TO-RUN.md                       # Step-by-step run guide
│
├── src/
│   ├── phase2-codec-analysis/          # Codec comparison & spectral analysis (Colab)
│   ├── phase3-spatial-player/          # Web Audio API + HRTF spatial player (live)
│   ├── phase4-abx-testing/             # Web ABX test + Colab analysis notebook
│   └── phase5-streaming-stress-test/   # Network resilience study (Colab)
│
├── audio-samples/
│   ├── original/                       # Lossless source files
│   └── encoded/                        # Compressed outputs by codec / bitrate
│
├── report/
│   ├── figures/                        # Figures referenced by the final report
│   ├── build_report.py                 # python-docx report builder
│   └── build_pptx.py                   # python-pptx slide builder
│
├── deliverables/                       # Final submission artefacts
│   ├── Spatial_Audio_Report.docx
│   ├── Spatial_Audio_Report.pdf
│   ├── Spatial_Audio_Presentation.pptx
│   ├── Spatial_Audio_Presentation.pdf
│   ├── Speaker_Notes.md
│   ├── audio-clips/                    # Sample clips demonstrating artefacts
│   └── demo-video/                     # 5-minute demo MP4
│
└── ref-docs/                           # Reference materials (read-only)
```

## Reproducing the experiments

See [`HOW-TO-RUN.md`](HOW-TO-RUN.md) for end-to-end instructions for every phase. In short:

- **Phase 2** — open `src/phase2-codec-analysis/Phase2_Codec_Analysis.ipynb` in Google Colab. Cell 0 builds FFmpeg with `libfdk_aac`. Run cells 1 onward.
- **Phase 3** — `cd src/phase3-spatial-player && npx live-server --port=5500`. Or open the live deployment.
- **Phase 4** — same `live-server` flow under `src/phase4-abx-testing`. Each participant exports a CSV; aggregate in `Phase4_ABX_Analysis.ipynb`.
- **Phase 5** — open `src/phase5-streaming-stress-test/Phase5_Stress_Test.ipynb` in Google Colab.

## Rebuilding the report and slides

```
pip install python-docx python-pptx
python report/build_report.py
python report/build_pptx.py
libreoffice --headless --convert-to pdf deliverables/Spatial_Audio_Report.docx        --outdir deliverables/
libreoffice --headless --convert-to pdf deliverables/Spatial_Audio_Presentation.pptx --outdir deliverables/
```

## Citing this work

If you build on this repository, please cite the report PDF in `deliverables/` or the GitHub URL.
