# Speaker Notes — Spatial Audio & High-Fidelity Streaming

**Total length: 5:00**
**Single presenter** (handover-friendly: "I" can be replaced with team member name)

---

## Slide 1 — Title (0:00 → 0:10)

> We are presenting Project 4: Spatial Audio and High-Fidelity Streaming.
> We compare three perceptual codecs — MP3, AAC, and Opus — for low-latency binaural delivery,
> and demonstrate a working spatial audio web player. I'll keep us to five minutes."

---

## Slide 2 — Why Spatial Audio? (0:10 → 0:45)

> "Modern streaming spends most of its budget on video; audio gets the leftover. That is a problem
> for spatial audio, because the cues that tell our brain where a sound is coming from — the
> inter-aural time and level differences — sit precisely in the high-frequency and transient detail
> that aggressive compression discards first."

> "VR, AR, and Metaverse platforms make spatial audio a prerequisite for presence, not a luxury.
> So our central question is simple: which codec converts the smallest bitrate into the most
> directional clarity?"

---

## Slide 3 — Objectives (0:45 → 1:10)

> "We organised the project around four concrete objectives:
> 1. Compare MP3, AAC, and Opus across a wide bitrate ladder.
> 2. Find each codec's transparency point — the bitrate at which a listener can no longer tell.
> 3. Build a working spatial audio player on the open Web Audio API.
> 4. Stress the network with packet loss and jitter to find when spatial immersion breaks."

---

## Slide 4 — System & Methodology (1:10 → 1:50)

> "Our pipeline is straightforward. FFmpeg with libfdk-aac, libmp3lame, and libopus produces the
> encoded fixtures. We compute SNR and a PESQ-derived ODG for objective quality. We render
> binaural audio in the browser through the Web Audio API's HRTF panner. And we simulate packet
> loss and jitter directly in the audio graph."

> "Subjective evaluation uses a forced-choice ABX protocol — 75 trials per participant.
> Stress testing compares mono, stereo, and binaural HRTF under matched bitrates."

---

## Slide 5 — Codec Comparison Results (1:50 → 2:30)

> "The rate–distortion curves split the ranking. By raw signal-to-noise ratio, Opus dominates.
> But SNR understates AAC because AAC deliberately pushes its quantisation noise into perceptually
> masked regions."

> "On the perceptually-weighted ODG, the picture clarifies: Opus reaches transparency near 48 kbps
> in pilot listening; MP3 and AAC need closer to 64. Combined with Opus's roughly 20-millisecond
> algorithmic delay, this makes Opus the obvious choice for real-time spatial audio."

---

## Slide 6 — ABX Test & Transparency (2:30 → 3:05)

> "The pilot ABX results align with the objective metrics. Opus reaches near-chance discrimination
> — our operational definition of transparency — at around 48 kbps. MP3 and AAC need about 64.
> The MOS approximations cluster between 4.3 and 4.5 at threshold."

> "These are pilot-scale numbers. The protocol, web interface, and analysis notebook are all
> deployed; the full participant study is the next step."

---

## Slide 7 — Network Stress (3:05 → 3:35)

> "Network impairments hit spatial audio harder than they hit mono or stereo. Mono tolerates
> 20 percent packet loss before quality collapses. Stereo holds out to about 15. Binaural HRTF
> breaks down by 10."

> "The reason is mechanical: HRTF rendering depends on phase-coherent delivery of both channels.
> A single late or dropped packet disrupts the inter-aural cues and temporarily collapses the
> spatial scene."

---

## Slide 8 — LIVE DEMO (3:35 → 4:50) [75 seconds]

> "Now the live demonstration. I'll open the Spatial Audio Lab in the browser."

**Demo script (memorise the order):**
1. **Drop a source** — drag the orb in 3D space, listener stays centred.
   *"Notice how the perceived position changes smoothly because the panner uses HRTF."*
2. **Switch codecs** mid-playback — Original → MP3 → AAC → Opus.
   *"You can hear the differences in real time without losing position."*
3. **Push the loss slider** up.
   *"Hear the spatial scene start to collapse well before the audio itself sounds 'broken'.
   That's the breakdown point we measured."*

**Demo timing target:** 30 s scene set-up, 30 s codec A/B, 15 s stress demo. Buffer: 0 s.

> Backup if Wi-Fi fails: switch to the recorded MP4 (`deliverables/demo-video/spatial_demo_60s.mp4`).

---

## Slide 9 — Conclusions & Future Work (4:50 → 4:55)

> "To wrap up. Opus is the codec to deploy for real-time spatial audio. Spatial streams are
> inherently more fragile than stereo, so production systems must engineer against jitter and
> burst loss. On 5G, bandwidth is no longer the bottleneck — coherence is."

> "Future work spans MPEG-H object-based audio, personalised HRTFs, Opus multistream for
> ambisonics, neural codecs, and real-network WebRTC evaluation."

---

## Slide 10 — Thank you (4:55 → 5:00)

> "Thank you. We're happy to take questions. The full report and live player are linked above."

---

## Timing checklist

| Slide | Key Cue / Topic                  | Presenter     | Time Allocation | Duration |
|------:|----------------------------------|----------------|-----------------|----------|
| 1     | Project 4 – Introduction         | Jackie         | 0:00 → 0:10     | 0:10     |
| 2     | Bandwidth Gap                    | Jackie         | 0:10 → 0:45     | 0:35     |
| 3     | Four Concrete Research Questions | Jackie         | 0:45 → 1:10     | 0:25     |
| 4     | FFmpeg with libfdk-aac           | Jackie         | 1:10 → 1:50     | 0:40     |
| 5     | Split Rate–Distortion Curves     | Jackie         | 1:50 → 2:30     | 0:40     |
| 6     | Pilot ABX Results Alignment      | Madeleine      | 2:30 → 3:05     | 0:35     |
| 7     | Impact of Network Impairments    | Madeleine      | 3:05 → 3:35     | 0:30     |
| 8     | Live Demonstration               | Vano           | 3:35 → 4:50     | 1:15     |
| 9     | Conclusion & Key Takeaways       | Vano           | 4:50 → 4:55     | 0:05     |
| 10    | Thank You / Q&A Transition       | Vano           | 4:55 → 5:00     | 0:05     |

**Total: 5:00 sharp.** If demo runs long, trim Slide 5 and Slide 7 narration; never trim demo.
