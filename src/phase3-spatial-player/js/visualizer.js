// ============================================================
// visualizer.js — Real-time frequency bars + waveform display
// ============================================================

export class Visualizer {
  constructor(freqCanvas, waveCanvas) {
    this.freqCanvas = freqCanvas;
    this.waveCanvas = waveCanvas;
    this.freqCtx = freqCanvas.getContext('2d');
    this.waveCtx = waveCanvas.getContext('2d');
    this.analyser = null;
    this.active = false;

    this._resizeCanvases();
    window.addEventListener('resize', () => this._resizeCanvases());
  }

  _resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    [this.freqCanvas, this.waveCanvas].forEach(canvas => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.getContext('2d').scale(dpr, dpr);
    });
    this.freqW = this.freqCanvas.getBoundingClientRect().width;
    this.freqH = this.freqCanvas.getBoundingClientRect().height;
    this.waveW = this.waveCanvas.getBoundingClientRect().width;
    this.waveH = this.waveCanvas.getBoundingClientRect().height;
  }

  connect(analyserNode) {
    this.analyser = analyserNode;
    this.freqData = new Uint8Array(analyserNode.frequencyBinCount);
    this.timeData = new Uint8Array(analyserNode.frequencyBinCount);
  }

  start() {
    this.active = true;
    this._draw();
  }

  stop() {
    this.active = false;
    // Clear canvases
    this.freqCtx.clearRect(0, 0, this.freqW, this.freqH);
    this.waveCtx.clearRect(0, 0, this.waveW, this.waveH);
  }

  _draw() {
    if (!this.active || !this.analyser) return;
    requestAnimationFrame(() => this._draw());

    this._drawFrequency();
    this._drawWaveform();
  }

  _drawFrequency() {
    const ctx = this.freqCtx;
    const w = this.freqW;
    const h = this.freqH;

    this.analyser.getByteFrequencyData(this.freqData);

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw bars
    const barCount = 64;
    const binStep = Math.floor(this.freqData.length / barCount);
    const barWidth = (w / barCount) * 0.7;
    const barGap = (w / barCount) * 0.3;

    for (let i = 0; i < barCount; i++) {
      // Average a few bins for smoother display
      let sum = 0;
      for (let j = 0; j < binStep; j++) {
        sum += this.freqData[i * binStep + j];
      }
      const value = sum / binStep / 255;
      const barH = value * h * 0.9;

      const x = i * (barWidth + barGap) + barGap / 2;
      const y = h - barH;

      // Gradient color: blue → cyan → green based on frequency
      const hue = 200 + (i / barCount) * 120; // 200 (blue) → 320 (magenta-ish)
      const saturation = 80;
      const lightness = 40 + value * 30;
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      // Rounded bars
      const radius = Math.min(barWidth / 2, 3);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, h);
      ctx.lineTo(x, h);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();

      // Glow
      if (value > 0.5) {
        ctx.shadowColor = `hsl(${hue}, ${saturation}%, 60%)`;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, y, barWidth, 2);
        ctx.shadowBlur = 0;
      }
    }

    // Peak frequency label
    let maxIdx = 0;
    let maxVal = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      if (this.freqData[i] > maxVal) {
        maxVal = this.freqData[i];
        maxIdx = i;
      }
    }
    if (maxVal > 30) {
      const sampleRate = this.analyser.context.sampleRate;
      const peakFreq = (maxIdx * sampleRate) / (this.analyser.fftSize);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Peak: ${peakFreq.toFixed(0)} Hz`, w - 8, 14);
    }
  }

  _drawWaveform() {
    const ctx = this.waveCtx;
    const w = this.waveW;
    const h = this.waveH;

    this.analyser.getByteTimeDomainData(this.timeData);

    ctx.clearRect(0, 0, w, h);

    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Waveform
    ctx.strokeStyle = 'rgba(74, 240, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const sliceWidth = w / this.timeData.length;
    let x = 0;

    for (let i = 0; i < this.timeData.length; i++) {
      const v = this.timeData[i] / 128.0;
      const y = (v * h) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();

    // Glow effect
    ctx.strokeStyle = 'rgba(74, 240, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // dB level
    let rms = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const v = (this.timeData[i] - 128) / 128;
      rms += v * v;
    }
    rms = Math.sqrt(rms / this.timeData.length);
    const dB = rms > 0 ? 20 * Math.log10(rms) : -60;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${dB.toFixed(1)} dB`, w - 8, 14);
  }
}
