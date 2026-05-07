# Speaker Notes — Adaptive Hue-Preserving Contrast Enhancement
**Total Time: 10 minutes**

---

## Slide 1: Title Slide (~30s) — Jackie

- Greet the audience
- "Hi everyone, we are Jackie and Vano, and today we will present our project on adaptive hue-preserving contrast enhancement with automatic parameter selection"
- "This work is based on Matsumoto et al.'s ICIP 2024 paper, which we reproduced and extended with novel contributions"

---

## Slide 2: Outline (~20s) — Jackie

- Briefly walk through the agenda
- "We will start with the problem, then walk through the base method we reproduced, followed by our novel additions, results, and conclusions"
- Don't spend too long here — just orient the audience

---

## Slide 3: Problem Statement (~50s) — Jackie

- "Image enhancement is widely used but most methods have key limitations"
- "First, methods like HE and CLAHE require manual parameter tuning — sigma controls how much contrast you boost, lambda controls color vividness"
- "Second, aggressive enhancement can push RGB values outside the valid 0-255 range — this is called gamut violation"
- "Third, many methods distort the original hue of the image — colors shift even though only brightness should change"
- "The paper we chose addresses all three of these, and we extended it to also solve the manual tuning problem"

---

## Slide 4: Base Method Overview (~1 min) — Jackie

- "The Matsumoto et al. method has three steps"
- "Step 1: Histogram Specification — we smooth each RGB channel's histogram using a Gaussian filter with parameter sigma, then redistribute pixel values to match the smoothed target"
- "Step 2: Hue Preservation — we apply a linear equation O equals A times I plus B times e, where A and B are computed from the covariance and variance of the channels, and lambda controls how vivid or muted the colors become"
- "Step 3: Gamut Correction — any pixels that went out of the valid range are projected back onto the equi-hue plane, which is a triangle in RGB space defined by white, black, and the pure color"

---

## Slide 5: Algorithm Pipeline (~50s) — Jackie

- Walk through the flow diagram left to right
- "Here you can see the full pipeline: input image goes through histogram specification, then hue-preserving transformation, then gamut correction, and we get the final output"
- "Each step builds on the previous one — Step 1 enhances contrast, Step 2 preserves the hue while adjusting chroma, and Step 3 ensures all values are displayable"
- "We reproduced this entire pipeline in Google Colab and validated it against the paper's results"
- Transition: "Now Vano will explain our novel contributions"

---

## Slide 6: Adaptive Sigma Selection (~1 min) — Vano

- "Thank you Jackie. So the original paper uses a fixed sigma of 50 for all images, but different images need different amounts of smoothing"
- "Our idea: use the Shannon entropy of each channel's histogram to decide sigma automatically"
- "Low entropy means the histogram is concentrated — the image has low contrast — so it needs more smoothing, a higher sigma"
- "High entropy means the histogram is already spread out — less smoothing needed"
- "We linearly map the average entropy from the range 3 to 8 onto sigma values from 25 to 75"
- "This directly addresses the future work mentioned by the original authors"

---

## Slide 7: Adaptive Lambda Selection (~1 min) — Vano

- "For lambda, we use the Hasler and Susstrunk colorfulness metric from 2003"
- "It computes statistics on opponent color channels — red minus green, and the yellow-blue axis"
- "Low colorfulness, below 15, means the image looks washed out — we set lambda to negative 0.1 to boost saturation"
- "Medium colorfulness gives a near-neutral lambda"
- "High colorfulness, above 40, means colors are already strong — we set lambda positive to slightly mute and prevent over-saturation"
- "Together with auto-sigma, this makes the method fully automatic — no manual parameter selection needed"

---

## Slide 8: Interactive Tool (~40s) — Vano

- "We also built a Gradio web interface that runs directly in Google Colab"
- "Users can upload any image, adjust sigma and lambda with sliders, or just toggle the Auto checkbox"
- "The interface shows the enhanced result alongside computed quality metrics in real time"
- "This makes it easy to understand what each parameter does and compare manual vs automatic results"
- "Jackie can even run this from her iPad through Colab — no local installation needed"

---

## Slide 9: Visual Results (~50s) — Vano

- "Here are the visual comparisons across different methods"
- Point to each result: "Original, then standard HE which tends to over-enhance, CLAHE which is more conservative, and our proposed method with automatic parameters"
- "You can see our method preserves the natural color appearance while enhancing contrast — HE introduces visible color shifts, especially in the highlights"
- "The second row shows similar behavior on a different test image"
- Mention: "These results use our automatically selected sigma and lambda values"

---

## Slide 10: Quantitative Evaluation (~1 min) — Vano

- "Now the numbers — we evaluate using four standard metrics"
- "std of L-star measures lightness contrast — higher is better"
- "average C-star measures colorfulness — we want improvement without going overboard"
- "LOE is lightness order error — lower means we better preserve the relative brightness ordering of pixels"
- "Q-value is an overall quality metric — higher is better"
- Walk through the table: "Our auto method achieves competitive results across all metrics"
- "Importantly, the auto parameters perform comparably to the manually tuned best-case, which validates our adaptive approach"

---

## Slide 11: Key Findings (~30s) — Vano

- Quickly summarize the four findings
- "First: automatic parameters match or beat manual tuning in our tests"
- "Second: hue preservation is maintained throughout — the lambda adaptation keeps colors natural"
- "Third: the Gradio tool makes the method accessible for non-experts"
- "Fourth: the approach generalizes well across different image types — portraits, landscapes, low-light scenes"

---

## Slide 12: Conclusion & Future Work (~40s) — Vano

- "To wrap up — we successfully reproduced the Matsumoto et al. method and extended it with adaptive sigma and lambda selection"
- "Our main achievement is eliminating the need for manual parameter tuning while maintaining quality"
- Left side achievements, right side future work
- "For future work, we see potential in deep learning-based parameter prediction, extending to video with temporal consistency, and building a mobile app"
- "Thank you for your attention. We are happy to take any questions."
- Smile, look confident!

---

## Timing Summary

| Slide | Presenter | Duration | Cumulative |
|-------|-----------|----------|------------|
| 1. Title | Jackie | 0:30 | 0:30 |
| 2. Outline | Jackie | 0:20 | 0:50 |
| 3. Problem | Jackie | 0:50 | 1:40 |
| 4. Base Method | Jackie | 1:00 | 2:40 |
| 5. Pipeline | Jackie | 0:50 | 3:30 |
| 6. Auto Sigma | Vano | 1:00 | 4:30 |
| 7. Auto Lambda | Vano | 1:00 | 5:30 |
| 8. Interactive Tool | Vano | 0:40 | 6:10 |
| 9. Visual Results | Vano | 0:50 | 7:00 |
| 10. Quantitative | Vano | 1:00 | 8:00 |
| 11. Key Findings | Vano | 0:30 | 8:30 |
| 12. Conclusion | Vano | 0:40 | 9:10 |
| Q&A buffer | Both | 0:50 | 10:00 |

**Jackie: Slides 1-5 (~3.5 min) — Intro, problem, base method, pipeline**
**Vano: Slides 6-12 (~5.5 min) — Novel contributions, results, conclusion**

---

## Tips

- Jackie: Practice the three-step explanation (Slide 4) until it flows naturally — it's the most technical part of your section
- Jackie: Use the flow diagram on Slide 5 as a visual anchor — point to each box as you explain
- Vano: On Slides 9-10, point directly at images and table values — don't just read from notes
- Both: Make eye contact with the audience, not the screen
- Both: If a question stumps you, it's fine to say "That's a great question, we would need to investigate that further"
- Transition between presenters should be smooth — Jackie says "Now Vano will explain our novel contributions" at the end of Slide 5
