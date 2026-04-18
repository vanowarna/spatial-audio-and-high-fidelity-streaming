// ============================================================
// audio-engine.js — Web Audio API core with HRTF spatialization
// ============================================================

const SOURCE_COLORS = [
  '#4a9eff', '#4aff9e', '#ff4a6a', '#ffaa4a',
  '#a855f7', '#4af0ff', '#ff6b9d', '#ffd93d'
];

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.sources = new Map(); // id -> { buffer, sourceNode, gainNode, pannerNode, ... }
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseOffset = 0;
    this._nextId = 0;
  }

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master gain → Analyser → Destination
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Set default listener position
    this.setListenerPosition(0, 1.6, 0);
    this.setListenerOrientation(0, 0, -1, 0, 1, 0);

    return this;
  }

  async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // --- Listener ---
  setListenerPosition(x, y, z) {
    const L = this.ctx.listener;
    if (L.positionX) {
      L.positionX.value = x;
      L.positionY.value = y;
      L.positionZ.value = z;
    } else {
      L.setPosition(x, y, z);
    }
  }

  setListenerOrientation(fx, fy, fz, ux, uy, uz) {
    const L = this.ctx.listener;
    if (L.forwardX) {
      L.forwardX.value = fx;
      L.forwardY.value = fy;
      L.forwardZ.value = fz;
      L.upX.value = ux;
      L.upY.value = uy;
      L.upZ.value = uz;
    } else {
      L.setOrientation(fx, fy, fz, ux, uy, uz);
    }
  }

  // --- Load audio buffer ---
  async loadAudioBuffer(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.ctx.decodeAudioData(arrayBuffer);
  }

  // --- Source management ---
  addSource(name, buffer, position = { x: 0, y: 1, z: -3 }) {
    const id = this._nextId++;
    const color = SOURCE_COLORS[id % SOURCE_COLORS.length];

    // Create panner with HRTF
    const pannerNode = this.ctx.createPanner();
    pannerNode.panningModel = 'HRTF';
    pannerNode.distanceModel = 'inverse';
    pannerNode.refDistance = 1;
    pannerNode.maxDistance = 50;
    pannerNode.rolloffFactor = 1;
    pannerNode.coneInnerAngle = 360;
    pannerNode.coneOuterAngle = 360;
    pannerNode.coneOuterGain = 0;
    pannerNode.positionX.value = position.x;
    pannerNode.positionY.value = position.y;
    pannerNode.positionZ.value = position.z;

    // Individual gain
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 1.0;

    // Stress test gain (for packet loss simulation)
    const stressGain = this.ctx.createGain();
    stressGain.gain.value = 1.0;

    // Chain: source → gain → stressGain → panner → master
    gainNode.connect(stressGain);
    stressGain.connect(pannerNode);
    pannerNode.connect(this.masterGain);

    const source = {
      id,
      name,
      color,
      buffer,
      buffers: { original: buffer }, // codec variants stored here
      currentCodec: 'original',
      currentBitrate: null,
      sourceNode: null,
      gainNode,
      stressGain,
      pannerNode,
      position: { ...position },
      muted: false,
      solo: false,
    };

    this.sources.set(id, source);
    return source;
  }

  removeSource(id) {
    const src = this.sources.get(id);
    if (!src) return;
    if (src.sourceNode) {
      try { src.sourceNode.stop(); } catch (e) {}
      src.sourceNode.disconnect();
    }
    src.gainNode.disconnect();
    src.stressGain.disconnect();
    src.pannerNode.disconnect();
    this.sources.delete(id);
  }

  setSourcePosition(id, x, y, z) {
    const src = this.sources.get(id);
    if (!src) return;
    src.position = { x, y, z };
    src.pannerNode.positionX.setValueAtTime(x, this.ctx.currentTime);
    src.pannerNode.positionY.setValueAtTime(y, this.ctx.currentTime);
    src.pannerNode.positionZ.setValueAtTime(z, this.ctx.currentTime);
  }

  setSourceGain(id, value) {
    const src = this.sources.get(id);
    if (!src) return;
    src.gainNode.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }

  setSourceMuted(id, muted) {
    const src = this.sources.get(id);
    if (!src) return false;

    src.muted = !!muted;
    src.gainNode.gain.setTargetAtTime(src.muted ? 0 : 1.0, this.ctx.currentTime, 0.02);
    return true;
  }

  // --- Codec switching ---
  addCodecVariant(sourceId, codec, bitrate, buffer) {
    const src = this.sources.get(sourceId);
    if (!src) return;
    const key = bitrate ? `${codec}_${bitrate}` : codec;
    src.buffers[key] = buffer;
  }

  switchCodec(sourceId, codec, bitrate) {
    const src = this.sources.get(sourceId);
    if (!src) return false;

    const key = bitrate ? `${codec}_${bitrate}` : codec;
    const newBuffer = src.buffers[key];
    if (!newBuffer) return false;

    src.currentCodec = codec;
    src.currentBitrate = bitrate;
    src.buffer = newBuffer;

    // If playing, crossfade to new buffer
    if (this.isPlaying && src.sourceNode) {
      const elapsed = this.ctx.currentTime - this.startTime + this.pauseOffset;
      const offset = elapsed % newBuffer.duration;

      // Fade out old
      src.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);

      setTimeout(() => {
        // Stop old source
        if (src.sourceNode) {
          try { src.sourceNode.stop(); } catch (e) {}
        }

        // Create new source
        const newNode = this.ctx.createBufferSource();
        newNode.buffer = newBuffer;
        newNode.loop = true;
        newNode.connect(src.gainNode);
        newNode.start(0, offset);
        src.sourceNode = newNode;

        // Fade in
        src.gainNode.gain.setTargetAtTime(
          src.muted ? 0 : 1.0,
          this.ctx.currentTime, 0.02
        );
      }, 50);
    }

    return true;
  }

  // --- Transport ---
  play() {
    if (this.isPlaying) return;
    this.resume();

    this.startTime = this.ctx.currentTime;

    this.sources.forEach(src => {
      const node = this.ctx.createBufferSource();
      node.buffer = src.buffer;
      node.loop = true;
      node.connect(src.gainNode);
      src.gainNode.gain.setValueAtTime(src.muted ? 0 : 1.0, this.ctx.currentTime);
      const offset = this.pauseOffset % src.buffer.duration;
      node.start(0, offset);
      src.sourceNode = node;
    });

    this.isPlaying = true;
  }

  pause() {
    if (!this.isPlaying) return;

    this.pauseOffset += this.ctx.currentTime - this.startTime;

    this.sources.forEach(src => {
      if (src.sourceNode) {
        try { src.sourceNode.stop(); } catch (e) {}
        src.sourceNode = null;
      }
    });

    this.isPlaying = false;
  }

  stop() {
    this.pause();
    this.pauseOffset = 0;
  }

  setMasterVolume(value) {
    this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }

  // --- Stress test hooks ---
  getStressGainNode(sourceId) {
    const src = this.sources.get(sourceId);
    return src ? src.stressGain : null;
  }

  // --- Mode switching (mono/stereo/spatial) ---
  setMode(mode) {
    this.sources.forEach(src => {
      switch (mode) {
        case 'mono':
          src.pannerNode.positionX.value = 0;
          src.pannerNode.positionY.value = 1;
          src.pannerNode.positionZ.value = 0;
          break;
        case 'stereo':
          // Collapse to stereo (x-axis only, no depth)
          src.pannerNode.positionY.value = 0;
          src.pannerNode.positionZ.value = -1;
          break;
        case 'spatial':
          // Restore original positions
          src.pannerNode.positionX.value = src.position.x;
          src.pannerNode.positionY.value = src.position.y;
          src.pannerNode.positionZ.value = src.position.z;
          break;
      }
    });
  }
}
