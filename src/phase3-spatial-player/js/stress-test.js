// ============================================================
// stress-test.js — Simulated packet loss & jitter
// ============================================================

export class StressTest {
  constructor(audioEngine) {
    this.engine = audioEngine;
    this.packetLoss = 0;     // 0-30 (%)
    this.jitter = 0;          // 0-500 (ms)
    this.active = false;
    this._intervalId = null;
    this.glitchCount = 0;

    // Callback
    this.onGlitch = null;
    this.onStatsUpdate = null;
  }

  setPacketLoss(percent) {
    this.packetLoss = Math.max(0, Math.min(30, percent));
    this._updateActive();
  }

  setJitter(ms) {
    this.jitter = Math.max(0, Math.min(500, ms));
    this._updateActive();
  }

  _updateActive() {
    const shouldBeActive = this.packetLoss > 0 || this.jitter > 0;

    if (shouldBeActive && !this.active) {
      this.active = true;
      this.glitchCount = 0;
      this._startSimulation();
    } else if (!shouldBeActive && this.active) {
      this.active = false;
      this._stopSimulation();
    }
  }

  _startSimulation() {
    // Run simulation tick every 20ms (simulating 20ms audio frames)
    this._intervalId = setInterval(() => this._tick(), 20);
  }

  _stopSimulation() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    // Reset all stress gains to 1
    this.engine.sources.forEach((src, id) => {
      const stressGain = this.engine.getStressGainNode(id);
      if (stressGain) {
        stressGain.gain.setValueAtTime(1.0, this.engine.ctx.currentTime);
      }
    });

    if (this.onStatsUpdate) {
      this.onStatsUpdate(0, 0, this.glitchCount);
    }
  }

  _tick() {
    if (!this.engine.isPlaying) return;

    const now = this.engine.ctx.currentTime;

    this.engine.sources.forEach((src, id) => {
      const stressGain = this.engine.getStressGainNode(id);
      if (!stressGain) return;

      // Packet loss simulation: randomly mute for ~20-50ms
      if (this.packetLoss > 0) {
        const drop = Math.random() * 100 < this.packetLoss;
        if (drop) {
          // Mute briefly
          const dropDuration = 0.02 + Math.random() * 0.03; // 20-50ms
          stressGain.gain.setValueAtTime(0, now);
          stressGain.gain.setValueAtTime(1.0, now + dropDuration);
          this.glitchCount++;

          if (this.onGlitch) {
            this.onGlitch(id, 'packet_loss', dropDuration);
          }
        }
      }

      // Jitter simulation: randomly introduce micro-delays by
      // briefly reducing and restoring gain (perceptual jitter effect)
      if (this.jitter > 0) {
        const jitterChance = this.jitter / 1000; // Higher jitter = more frequent
        if (Math.random() < jitterChance) {
          const jitterDelay = (Math.random() * this.jitter) / 1000;
          // Create a brief "stutter" effect
          stressGain.gain.setValueAtTime(0.3, now);
          stressGain.gain.linearRampToValueAtTime(1.0, now + jitterDelay);
          this.glitchCount++;

          if (this.onGlitch) {
            this.onGlitch(id, 'jitter', jitterDelay);
          }
        }
      }
    });

    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.packetLoss, this.jitter, this.glitchCount);
    }
  }

  reset() {
    this.glitchCount = 0;
    this.packetLoss = 0;
    this.jitter = 0;
    this._stopSimulation();
    this.active = false;
  }

  getStats() {
    return {
      packetLoss: this.packetLoss,
      jitter: this.jitter,
      glitchCount: this.glitchCount,
      active: this.active
    };
  }
}
