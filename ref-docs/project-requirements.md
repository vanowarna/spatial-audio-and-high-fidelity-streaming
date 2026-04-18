# Project 4: Spatial Audio & High-Fidelity Streaming — Requirements Document

**Course:** 2102571 — Multimedia Communication in the 21st Century  
**Date Issued:** 25 March 2026  
**Due Date:** 6 May 2026 (submit to MyCourseville — no late submissions)  
**Team Size:** 2–3 persons  
**Total Score:** 100 points

---

## 1. Project Objective

Analyze the efficiency of perceptual audio codecs and implement a spatial audio (3D Audio) streaming system that maintains immersion under network constraints.

The goal is to determine the optimal codec and bitrate for immersive 3D audio delivery over unstable networks.

---

## 2. Scope & Tasks

### 2.1 Codec Comparison

- Compare three perceptual audio codecs:
  - **AAC** (Advanced Audio Coding)
  - **Opus** (modern, low-latency)
  - **MP3** (legacy baseline)
- Encode audio samples at multiple bitrates (e.g., 32 kbps to 256 kbps).

### 2.2 Perceptual Analysis

- **ABX Listening Test:** Conduct subjective ABX tests to identify the "Transparency" point — the bitrate at which listeners cannot distinguish compressed audio from the original.
- **Spectral Masking Analysis:** Visualize what frequency content remains after heavy compression using spectrograms. Compare original vs. compressed audio across all three codecs.

### 2.3 Spatial Audio Implementation

- Develop a **web-based spatial audio player** using the **Web Audio API**.
- Simulate a 3D soundstage by panning audio based on a virtual listener position.
- Use the **PannerNode** with **HRTF** (Head-Related Transfer Function) for binaural 3D sound rendering.

### 2.4 Streaming Stress Test

- Evaluate how audio **packet loss and jitter** affect the synchronization of spatial channels.
- Compare degradation behavior across mono, stereo, and spatial audio configurations.
- Identify the "Breakdown Point" — the bitrate/packet-loss level where spatial immersion is lost.

---

## 3. Technical Environment & Tools

| Category | Tool / Technology |
|---|---|
| Audio Encoding | FFmpeg, LAME |
| Spectral Analysis | Librosa (Python), Audacity |
| Spatial Engine | Web Audio API — PannerNode with HRTF |
| Quality Metrics | ODG via PEAQ (Perceptual Evaluation of Audio Quality) |
| Programming | Python (analysis scripts), JavaScript/HTML (spatial player) |
| Optional | C++ for any performance-critical components |

---

## 4. Deliverables

### 4.1 Final Report (PDF)

Must follow academic structure with the following sections:

1. **Introduction & Motivation** — Problem statement (audio sacrificed for video bandwidth, spatial cues at low bitrates), objectives, relevance to Metaverse/VR.
2. **System Setup & Methodology** — Audio pipeline, encoders and bitrates tested, spatial configuration (binaural HRTF / 5.1 surround simulation), ABX test design and participant count.
3. **Performance Comparison & Results** — Spectrogram comparisons (original vs. compressed), subjective scores (MOS or ABX accuracy), network impact table showing breakdown points.
4. **Discussion** — Psychoacoustics (temporal and frequency masking), latency vs. quality trade-offs, analysis of how compression artifacts interfere with sound localization.
5. **Conclusions** — Best codec for quality/latency balance, feasibility of spatial audio over 5G, future work on Object-Based Audio (e.g., MPEG-H).

### 4.2 Technical Deliverables

- **Documented codebase** (Python/C++) with clear README and comments.
- **Experimental logs** of all test runs.
- **5-minute demo video** showcasing the spatial audio player and key findings.

### 4.3 Audio Samples

- A set of processed clips demonstrating specific compression artifacts (e.g., pre-echo, high-frequency loss).

---

## 5. Grading Criteria (100 pts)

| Criterion | Weight |
|---|---|
| Technical Execution | 20 pts |
| Methodology | 20 pts |
| Data Analysis | 20 pts |
| Innovation | 20 pts |
| Presentation Quality | 20 pts |

---

## 6. Constraints & Rules

- Submission deadline is **6 May 2026** — no late submissions accepted.
- Submit to **MyCourseville**.
- Group size: **2 or 3 members**.
- Report must be in **PDF** format following the prescribed academic structure.
- Code must be documented and reproducible.
