// ============================================================
// app.js — Main application: wires everything together
// ============================================================

import { AudioEngine } from './audio-engine.js';
import { Scene3D } from './scene3d.js';
import { Visualizer } from './visualizer.js';
import { CodecSwitcher } from './codec-switcher.js';
import { StressTest } from './stress-test.js';

class SpatialAudioLab {
  constructor() {
    this.engine = null;
    this.scene = null;
    this.visualizer = null;
    this.codecSwitcher = null;
    this.stressTest = null;
    this.selectedSourceId = null;
    this.audioMode = 'spatial'; // 'mono' | 'stereo' | 'spatial'
  }

  async init() {
    // 1. Audio engine
    this.engine = new AudioEngine();
    await this.engine.init();

    // 2. 3D Scene
    const container = document.getElementById('scene-container');
    this.scene = new Scene3D(container);

    // 3. Visualizer
    const freqCanvas = document.getElementById('freq-canvas');
    const waveCanvas = document.getElementById('wave-canvas');
    this.visualizer = new Visualizer(freqCanvas, waveCanvas);
    this.visualizer.connect(this.engine.analyser);

    // 4. Codec switcher
    this.codecSwitcher = new CodecSwitcher(this.engine);

    // 5. Stress test
    this.stressTest = new StressTest(this.engine);

    // Wire 3D scene callbacks to audio engine
    this.scene.onSourceMoved = (id, x, y, z) => {
      this.engine.setSourcePosition(id, x, y, z);
    };

    this.scene.onListenerMoved = (x, y, z) => {
      this.engine.setListenerPosition(x, y, z);
    };

    this.scene.onSourceSelected = (id) => {
      this.selectSource(id);
    };

    // Stress test callbacks
    this.stressTest.onStatsUpdate = (loss, jitter, glitches) => {
      const el = document.getElementById('glitch-count');
      if (el) el.textContent = glitches;

      const warning = document.getElementById('stress-warning');
      if (warning) {
        warning.classList.toggle('visible', loss > 10 || jitter > 200);
      }
    };

    // Bind UI
    this._bindControls();

    // Load demo audio
    await this._loadDemoAudio();

    // Start visualizer
    this.visualizer.start();

    // Hide loading
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.classList.add('hidden');

    console.log('Spatial Audio Lab initialized.');
  }

  async _loadDemoAudio() {
    const statusEl = document.getElementById('loading-status');

    // Generate demo audio buffers using oscillators if no files found
    // In production, these come from assets/audio/
    try {
      if (statusEl) statusEl.textContent = 'Generating demo audio...';
      await this._generateDemoSources();
    } catch (err) {
      console.error('Failed to load demo audio:', err);
    }
  }

  async _generateDemoSources() {
    const ctx = this.engine.ctx;
    const sr = ctx.sampleRate;
    const duration = 10;
    const samples = sr * duration;

    // Helper: create buffer from Float32Array
    const makeBuffer = (data) => {
      const buf = ctx.createBuffer(1, data.length, sr);
      buf.copyToChannel(data, 0);
      return buf;
    };

    // Source 1: Ambient pad (chord)
    const pad = new Float32Array(samples);
    const padFreqs = [130.81, 164.81, 196.00, 261.63]; // C3 chord
    for (let i = 0; i < samples; i++) {
      const t = i / sr;
      let val = 0;
      padFreqs.forEach((f, idx) => {
        val += Math.sin(2 * Math.PI * f * t) * (0.15 / (idx + 1));
      });
      // Slow LFO modulation
      val *= 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.1 * t);
      pad[i] = val;
    }
    const padBuf = makeBuffer(pad);
    const src1 = this.engine.addSource('Ambient Pad', padBuf, { x: -3, y: 1, z: -4 });
    this.scene.addSourceMesh(src1.id, src1.color, src1.position, src1.name);
    this._addSourceCard(src1);

    // Source 2: Rhythmic clicks/percussion
    const perc = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const t = i / sr;
      const beat = t % 0.5; // 120 BPM
      if (beat < 0.01) {
        perc[i] = (Math.random() * 2 - 1) * 0.6 * (1 - beat / 0.01);
      } else if (beat > 0.25 && beat < 0.26) {
        perc[i] = (Math.random() * 2 - 1) * 0.3 * (1 - (beat - 0.25) / 0.01);
      }
    }
    const percBuf = makeBuffer(perc);
    const src2 = this.engine.addSource('Percussion', percBuf, { x: 3, y: 1, z: -2 });
    this.scene.addSourceMesh(src2.id, src2.color, src2.position, src2.name);
    this._addSourceCard(src2);

    // Source 3: Melodic sine
    const melody = new Float32Array(samples);
    const melodyNotes = [440, 494, 523, 587, 659, 587, 523, 494]; // A minor scale
    const noteLen = duration / melodyNotes.length;
    for (let i = 0; i < samples; i++) {
      const t = i / sr;
      const noteIdx = Math.floor(t / noteLen) % melodyNotes.length;
      const noteT = (t % noteLen) / noteLen;
      const env = noteT < 0.05 ? noteT / 0.05 : noteT > 0.8 ? (1 - noteT) / 0.2 : 1;
      melody[i] = Math.sin(2 * Math.PI * melodyNotes[noteIdx] * t) * 0.25 * env;
    }
    const melodyBuf = makeBuffer(melody);
    const src3 = this.engine.addSource('Melody', melodyBuf, { x: 0, y: 1, z: -6 });
    this.scene.addSourceMesh(src3.id, src3.color, src3.position, src3.name);
    this._addSourceCard(src3);

    // Source 4: Pink noise ambient
    const noise = new Float32Array(samples);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < samples; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      noise[i] = pink * 0.04;
    }
    const noiseBuf = makeBuffer(noise);
    const src4 = this.engine.addSource('Ambient Noise', noiseBuf, { x: -5, y: 1, z: 2 });
    this.scene.addSourceMesh(src4.id, src4.color, src4.position, src4.name);
    this._addSourceCard(src4);

    // Select first source
    this.selectSource(src1.id);
  }

  // --- Source list UI ---
  _addSourceCard(source) {
    const list = document.getElementById('source-list');
    const card = document.createElement('div');
    card.className = 'source-card';
    card.dataset.id = source.id;
    card.innerHTML = `
      <span class="source-dot" style="color: ${source.color}; background: ${source.color}"></span>
      <span class="source-name">${source.name}</span>
      <span class="source-info">
        (${source.position.x.toFixed(1)}, ${source.position.z.toFixed(1)})
      </span>
    `;
    card.addEventListener('click', () => this.selectSource(source.id));
    list.appendChild(card);
  }

  selectSource(id) {
    this.selectedSourceId = id;

    // Update UI
    document.querySelectorAll('.source-card').forEach(card => {
      card.classList.toggle('active', parseInt(card.dataset.id) === id);
    });

    // Highlight in 3D
    this.scene.highlightSource(id);
  }

  // --- UI bindings ---
  _bindControls() {
    // Play/Pause
    const playBtn = document.getElementById('btn-play');
    playBtn.addEventListener('click', () => {
      if (this.engine.isPlaying) {
        this.engine.pause();
        playBtn.innerHTML = '&#9654;';
        this.engine.sources.forEach((_, id) => this.scene.setPulsing(id, false));
      } else {
        this.engine.resume();
        this.engine.play();
        playBtn.innerHTML = '&#10074;&#10074;';
        this.engine.sources.forEach((_, id) => this.scene.setPulsing(id, true));
      }
    });

    // Stop
    document.getElementById('btn-stop').addEventListener('click', () => {
      this.engine.stop();
      playBtn.innerHTML = '&#9654;';
      this.engine.sources.forEach((_, id) => this.scene.setPulsing(id, false));
    });

    // Master volume
    const volSlider = document.getElementById('master-volume');
    volSlider.addEventListener('input', (e) => {
      this.engine.setMasterVolume(parseFloat(e.target.value));
    });

    // Codec selector
    const codecSelect = document.getElementById('codec-select');
    const bitrateSelect = document.getElementById('bitrate-select');

    codecSelect.addEventListener('change', () => {
      const codec = codecSelect.value;
      // Update bitrate options
      const bitrates = this.codecSwitcher.getBitratesForCodec(codec);
      bitrateSelect.innerHTML = '';
      if (codec === 'original') {
        bitrateSelect.innerHTML = '<option value="">N/A</option>';
        bitrateSelect.disabled = true;
      } else {
        bitrateSelect.disabled = false;
        bitrates.forEach(br => {
          const opt = document.createElement('option');
          opt.value = br;
          opt.textContent = `${br} kbps`;
          bitrateSelect.appendChild(opt);
        });
      }
      this._applyCodecSelection();
    });

    bitrateSelect.addEventListener('change', () => {
      this._applyCodecSelection();
    });

    // Audio mode toggle (mono/stereo/spatial)
    document.querySelectorAll('.mode-toggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-toggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.audioMode = btn.dataset.mode;
        this.engine.setMode(this.audioMode);
      });
    });

    // Stress test sliders
    const lossSlider = document.getElementById('loss-slider');
    const lossVal = document.getElementById('loss-value');
    lossSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      lossVal.textContent = `${val}%`;
      this.stressTest.setPacketLoss(val);
      document.getElementById('stress-panel').classList.toggle('stress-active', val > 0 || this.stressTest.jitter > 0);
    });

    const jitterSlider = document.getElementById('jitter-slider');
    const jitterVal = document.getElementById('jitter-value');
    jitterSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      jitterVal.textContent = `${val}ms`;
      this.stressTest.setJitter(val);
      document.getElementById('stress-panel').classList.toggle('stress-active', val > 0 || this.stressTest.packetLoss > 0);
    });

    // Reset stress
    const resetStress = document.getElementById('reset-stress');
    if (resetStress) {
      resetStress.addEventListener('click', () => {
        this.stressTest.reset();
        lossSlider.value = 0;
        jitterSlider.value = 0;
        lossVal.textContent = '0%';
        jitterVal.textContent = '0ms';
        document.getElementById('stress-panel').classList.remove('stress-active');
      });
    }

    // Add source button
    document.getElementById('add-source-btn').addEventListener('click', () => {
      this._addNewSource();
    });

    // File upload
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    if (uploadZone) {
      uploadZone.addEventListener('click', () => fileInput.click());
      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--accent-blue)';
      });
      uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = '';
      });
      uploadZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        const files = e.dataTransfer.files;
        for (const file of files) {
          await this._loadUserFile(file);
        }
      });
      fileInput.addEventListener('change', async (e) => {
        for (const file of e.target.files) {
          await this._loadUserFile(file);
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          playBtn.click();
          break;
        case 'KeyR':
          this.engine.stop();
          playBtn.innerHTML = '&#9654;';
          break;
        case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
        case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8':
          const idx = parseInt(e.key) - 1;
          const ids = [...this.engine.sources.keys()];
          if (idx < ids.length) this.selectSource(ids[idx]);
          break;
      }
    });
  }

  _applyCodecSelection() {
    const codec = document.getElementById('codec-select').value;
    const bitrate = document.getElementById('bitrate-select').value;

    if (codec === 'original') {
      this.codecSwitcher.switchAll('original', null);
    } else if (bitrate) {
      this.codecSwitcher.switchAll(codec, parseInt(bitrate));
    }

    // Update info display
    const info = this.codecSwitcher.getCurrentInfo();
    const el = document.getElementById('codec-info-label');
    if (el) el.textContent = info.label;
  }

  async _addNewSource() {
    const ctx = this.engine.ctx;
    const sr = ctx.sampleRate;
    const duration = 10;
    const samples = sr * duration;
    const data = new Float32Array(samples);

    // Generate a random tone
    const freq = 200 + Math.random() * 600;
    for (let i = 0; i < samples; i++) {
      const t = i / sr;
      data[i] = Math.sin(2 * Math.PI * freq * t) * 0.2;
    }

    const buffer = ctx.createBuffer(1, samples, sr);
    buffer.copyToChannel(data, 0);

    const angle = Math.random() * Math.PI * 2;
    const dist = 2 + Math.random() * 4;
    const pos = {
      x: Math.cos(angle) * dist,
      y: 1,
      z: Math.sin(angle) * dist
    };

    const count = this.engine.sources.size + 1;
    const src = this.engine.addSource(`Source ${count}`, buffer, pos);
    this.scene.addSourceMesh(src.id, src.color, src.position, src.name);
    this._addSourceCard(src);
    this.selectSource(src.id);

    // If currently playing, start this source too
    if (this.engine.isPlaying) {
      const node = ctx.createBufferSource();
      node.buffer = buffer;
      node.loop = true;
      node.connect(src.gainNode);
      node.start(0);
      src.sourceNode = node;
      this.scene.setPulsing(src.id, true);
    }
  }

  async _loadUserFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.engine.ctx.decodeAudioData(arrayBuffer);

      const angle = Math.random() * Math.PI * 2;
      const dist = 2 + Math.random() * 4;
      const pos = {
        x: Math.cos(angle) * dist,
        y: 1,
        z: Math.sin(angle) * dist
      };

      const name = file.name.replace(/\.[^/.]+$/, '');
      const src = this.engine.addSource(name, audioBuffer, pos);
      this.scene.addSourceMesh(src.id, src.color, src.position, src.name);
      this._addSourceCard(src);
      this.selectSource(src.id);

      if (this.engine.isPlaying) {
        const node = this.engine.ctx.createBufferSource();
        node.buffer = audioBuffer;
        node.loop = true;
        node.connect(src.gainNode);
        node.start(0);
        src.sourceNode = node;
        this.scene.setPulsing(src.id, true);
      }

      console.log(`Loaded: ${file.name}`);
    } catch (err) {
      console.error(`Failed to load ${file.name}:`, err);
      alert(`Could not load "${file.name}". Make sure it's a valid audio file (WAV, MP3, OGG, M4A).`);
    }
  }
}

// --- Bootstrap ---
window.addEventListener('DOMContentLoaded', async () => {
  const app = new SpatialAudioLab();
  await app.init();
  window.app = app; // expose for debugging
});
