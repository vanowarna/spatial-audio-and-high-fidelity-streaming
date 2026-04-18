# Project 4: Spatial Audio & High-Fidelity Streaming — Project Plan

**Timeline:** April 7 – May 6, 2026 (4 weeks)  
**Team Size:** 2–3 members

---

## Phase 1: Research & Environment Setup (Apr 7 – Apr 13)

**Goal:** Establish the technical foundation and align the team on scope.

### Tasks

- [ ] Define team roles and responsibilities (research lead, dev lead, testing lead).
- [ ] Set up shared repository (GitHub) with project structure.
- [ ] Install and verify all tools: FFmpeg, LAME, Python + Librosa, Audacity, Node.js.
- [ ] Research HRTF datasets (e.g., MIT KEMAR, CIPIC) and select one for spatial rendering.
- [ ] Gather or select reference audio samples — at least 3 categories (music, speech, ambient/environmental) in lossless format (WAV/FLAC).
- [ ] Literature review: psychoacoustic masking models, ABX test methodology, PEAQ/ODG metrics.
- [ ] Draft the Introduction & Motivation section of the report.

### Deliverable
- Working dev environment for all team members.
- Curated audio dataset ready for encoding.

---

## Phase 2: Codec Comparison & Spectral Analysis (Apr 14 – Apr 20)

**Goal:** Encode audio at multiple bitrates across AAC, Opus, and MP3; perform objective analysis.

### Tasks

- [ ] Encode each audio sample at 5+ bitrate levels (e.g., 32, 64, 96, 128, 192, 256 kbps) using all three codecs.
- [ ] Write Python scripts to automate batch encoding via FFmpeg/LAME.
- [ ] Generate spectrograms (original vs. compressed) for each codec/bitrate combination using Librosa.
- [ ] Compute objective quality metrics: ODG (via PEAQ), SNR, and spectral difference.
- [ ] Create comparison tables and plots (bitrate vs. quality metric per codec).
- [ ] Analyze spectral masking — document which frequency bands are discarded at each bitrate.
- [ ] Draft the System Setup & Methodology section of the report.

### Deliverable
- Complete set of encoded audio files.
- Spectrogram comparison figures.
- Objective metric tables/charts.

---

## Phase 3: Spatial Audio Player Development (Apr 14 – Apr 23)

**Goal:** Build a functional web-based 3D audio player. (Runs in parallel with Phase 2.)

### Tasks

- [ ] Set up a web project (HTML/CSS/JS) with Web Audio API.
- [ ] Implement HRTF-based spatial rendering using `PannerNode` (set `panningModel: 'HRTF'`).
- [ ] Create a simple UI showing a 2D top-down view of the virtual sound environment with draggable sound sources and listener position.
- [ ] Support loading different audio files (original and compressed versions) for A/B comparison.
- [ ] Add controls for: listener position/orientation, sound source placement, codec/bitrate selection.
- [ ] Test with headphones to verify spatial cues (elevation, azimuth) are perceptible.
- [ ] Document the spatial configuration (coordinate system, distance model, cone parameters).

### Deliverable
- Functional spatial audio web player with HRTF rendering.

---

## Phase 4: Subjective Testing — ABX Listening Tests (Apr 21 – Apr 27)

**Goal:** Conduct human perception tests to find the transparency point for each codec.

### Tasks

- [ ] Design ABX test protocol: number of trials, randomization, codec/bitrate conditions.
- [ ] Recruit at least 5 participants (as per project guidelines).
- [ ] Build or configure an ABX testing interface (can use web-based tool or existing software like foobar2000 ABX plugin).
- [ ] Run ABX tests across all three codecs at key bitrates to identify the transparency threshold.
- [ ] Collect and tabulate results: accuracy rates per codec/bitrate, Mean Opinion Scores (MOS).
- [ ] Perform statistical analysis on subjective data (confidence intervals, significance tests).
- [ ] Draft the Performance Comparison & Results section.

### Deliverable
- ABX test results with statistical analysis.
- Identified transparency point per codec.

---

## Phase 5: Streaming Stress Test (Apr 24 – Apr 28)

**Goal:** Evaluate spatial audio resilience under degraded network conditions.

### Tasks

- [ ] Simulate network impairments: packet loss (1%, 5%, 10%, 20%) and jitter (50ms, 100ms, 200ms).
- [ ] Use `tc` (Linux Traffic Control) or a JavaScript-based simulation to introduce degradation.
- [ ] Stream spatial audio through the player under each condition.
- [ ] Measure and record: channel synchronization errors, audible artifacts, perceived spatial accuracy.
- [ ] Compare degradation behavior: mono vs. stereo vs. spatial (HRTF).
- [ ] Identify the "Breakdown Point" for spatial immersion for each codec.
- [ ] Create a network impact summary table (bitrate × packet loss → immersion rating).

### Deliverable
- Stress test data and breakdown-point analysis.

---

## Phase 6: Report Writing, Demo & Finalization (Apr 28 – May 5)

**Goal:** Assemble all findings into the final report and produce the demo video.

### Tasks

- [ ] Write the Discussion section: psychoacoustics (temporal/frequency masking), latency vs. quality, immersion loss analysis.
- [ ] Write the Conclusions section: best codec recommendation, feasibility for 5G mobile streaming, future work (MPEG-H Object-Based Audio).
- [ ] Compile all spectrogram figures, charts, and tables into the report.
- [ ] Prepare audio sample clips demonstrating key artifacts (pre-echo, high-frequency loss).
- [ ] Record the 5-minute demo video: walkthrough of spatial player, key experimental results, live demonstration of codec differences.
- [ ] Clean up and document the codebase (README, inline comments, requirements.txt).
- [ ] Peer review the full report for clarity and completeness.
- [ ] Final proofreading and formatting check.

### Deliverable
- Final report (PDF).
- Documented codebase.
- Demo video (5 min).
- Audio sample set.

---

## Phase 7: Submission (May 6)

- [ ] Submit all deliverables to MyCourseville before the deadline.
- [ ] Verify all files are uploaded correctly.

---

## Summary Timeline

| Week | Dates | Phase | Key Output |
|------|-------|-------|------------|
| 1 | Apr 7–13 | Research & Setup | Dev environment, audio dataset |
| 2 | Apr 14–20 | Codec Analysis + Spatial Dev (parallel) | Encoded files, spectrograms, player prototype |
| 3 | Apr 21–27 | ABX Testing + Stress Test start | Subjective test results, transparency points |
| 4 | Apr 28–May 5 | Stress Test finish + Report + Demo | Final report, demo video, clean codebase |
| — | May 6 | Submission | All deliverables on MyCourseville |

---

## Risk Considerations

| Risk | Mitigation |
|------|------------|
| Difficulty recruiting ABX test participants | Start recruiting in Week 1; allow remote testing via web interface |
| HRTF rendering sounds incorrect | Test early with known spatial audio samples; use validated HRTF datasets |
| PEAQ/ODG tooling is hard to set up | Fall back to simpler objective metrics (SNR, spectral difference) if needed |
| Network simulation is inconsistent | Run multiple trials and average results; document simulation parameters precisely |
| Time crunch on report writing | Begin drafting sections incrementally during each phase, not at the end |

---

*Please review this plan and share any suggestions or adjustments before we proceed.*
