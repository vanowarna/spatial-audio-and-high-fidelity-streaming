// ============================================================
// abx-test.js — ABX Listening Test Engine
// ============================================================

class ABXTest {
  constructor() {
    this.ctx = null;
    this.participantId = '';
    this.trials = [];
    this.currentTrial = 0;
    this.results = [];
    this.currentAnswer = null;
    this.currentConfidence = 3;
    this.listenCounts = { a: 0, b: 0, x: 0 };
    this.currentlyPlaying = null;
    this.currentSourceNode = null;

    this._bindEvents();
  }

  // --- Test configuration ---
  // Each trial: { codec, bitrate, audioCategory }
  // A = original, B = compressed, X = randomly A or B
  _generateTrials() {
    const codecs = ['mp3', 'aac', 'opus'];
    // Bitrates near expected transparency points
    const bitrates = [64, 96, 128, 192];
    const categories = ['music', 'speech', 'ambient'];
    const trials = [];

    for (const codec of codecs) {
      for (const bitrate of bitrates) {
        // Pick a random category for each codec+bitrate combo
        const category = categories[Math.floor(Math.random() * categories.length)];
        const xIsA = Math.random() < 0.5;
        trials.push({
          codec,
          bitrate,
          category,
          xIsA,  // true = X is original, false = X is compressed
        });
      }
    }

    // Shuffle trials
    for (let i = trials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trials[i], trials[j]] = [trials[j], trials[i]];
    }

    return trials;
  }

  // --- Audio loading ---
  async _initAudio() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  async _loadTrialAudio(trial) {
    const basePath = `assets/audio/${trial.category}`;

    try {
      // Try loading real audio files
      const origUrl = `${basePath}/original.wav`;
      const compUrl = `${basePath}/${trial.codec}_${trial.bitrate}.wav`;

      const [origResp, compResp] = await Promise.all([
        fetch(origUrl), fetch(compUrl)
      ]);

      if (origResp.ok && compResp.ok) {
        const origBuf = await this.ctx.decodeAudioData(await origResp.arrayBuffer());
        const compBuf = await this.ctx.decodeAudioData(await compResp.arrayBuffer());
        return { original: origBuf, compressed: compBuf };
      }
    } catch (e) {
      // Fall through to synthetic
    }

    // Generate synthetic demo audio if files not found
    console.log(`Generating synthetic audio for ${trial.codec}@${trial.bitrate}k`);
    return this._generateSyntheticTrial(trial);
  }

  _generateSyntheticTrial(trial) {
    const sr = this.ctx.sampleRate;
    const duration = 5;
    const samples = sr * duration;

    // Original: clean sine chord
    const origData = new Float32Array(samples);
    const freqs = trial.category === 'speech'
      ? [220, 440, 660]          // voice-like harmonics
      : trial.category === 'ambient'
      ? [110, 165, 220, 330]     // low ambient
      : [261.63, 329.63, 392];   // C major chord

    for (let i = 0; i < samples; i++) {
      const t = i / sr;
      let val = 0;
      freqs.forEach((f, idx) => {
        val += Math.sin(2 * Math.PI * f * t) * (0.2 / (idx + 1));
      });
      origData[i] = val;
    }

    // Compressed: add artifacts proportional to compression
    const compData = new Float32Array(origData);
    const artifactLevel = Math.max(0.001, 0.05 * (1 - trial.bitrate / 256));

    for (let i = 0; i < samples; i++) {
      // Simulate quantization noise
      compData[i] += (Math.random() * 2 - 1) * artifactLevel;

      // Simulate high-frequency loss (low-pass effect)
      if (trial.bitrate < 128 && i > 0) {
        const lpf = trial.bitrate / 256;
        compData[i] = compData[i] * lpf + compData[i - 1] * (1 - lpf);
      }
    }

    const origBuf = this.ctx.createBuffer(1, samples, sr);
    origBuf.copyToChannel(origData, 0);

    const compBuf = this.ctx.createBuffer(1, samples, sr);
    compBuf.copyToChannel(compData, 0);

    return { original: origBuf, compressed: compBuf };
  }

  // --- Playback ---
  _stopCurrent() {
    if (this.currentSourceNode) {
      try { this.currentSourceNode.stop(); } catch (e) {}
      this.currentSourceNode = null;
    }
    document.querySelectorAll('.player-card').forEach(c => c.classList.remove('playing'));
    this.currentlyPlaying = null;
  }

  async _play(which) {
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this._stopCurrent();

    const trial = this.trials[this.currentTrial];
    if (!trial._audio) {
      trial._audio = await this._loadTrialAudio(trial);
    }

    let buffer;
    if (which === 'a') {
      buffer = trial._audio.original;
    } else if (which === 'b') {
      buffer = trial._audio.compressed;
    } else {
      // X
      buffer = trial.xIsA ? trial._audio.original : trial._audio.compressed;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start();
    this.currentSourceNode = source;
    this.currentlyPlaying = which;

    // Update UI
    document.getElementById(`player-${which}`).classList.add('playing');
    this.listenCounts[which]++;
    document.getElementById(`count-${which}`).textContent = this.listenCounts[which];

    // Auto-stop when done
    source.onended = () => {
      document.getElementById(`player-${which}`).classList.remove('playing');
      this.currentlyPlaying = null;
    };
  }

  // --- Navigation ---
  _showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  _loadTrial() {
    const trial = this.trials[this.currentTrial];
    const total = this.trials.length;

    document.getElementById('trial-current').textContent = this.currentTrial + 1;
    document.getElementById('trial-total').textContent = total;
    document.getElementById('progress-fill').style.width = `${((this.currentTrial) / total) * 100}%`;

    // Show codec/bitrate (blinded — don't reveal which is A vs B)
    document.getElementById('trial-codec').textContent = trial.codec.toUpperCase();
    document.getElementById('trial-bitrate').textContent = `${trial.bitrate} kbps`;

    // Reset state
    this.currentAnswer = null;
    this.currentConfidence = 3;
    this.listenCounts = { a: 0, b: 0, x: 0 };
    document.getElementById('count-a').textContent = '0';
    document.getElementById('count-b').textContent = '0';
    document.getElementById('count-x').textContent = '0';

    document.querySelectorAll('.btn-answer').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.btn-conf').forEach(b => b.classList.toggle('active', b.dataset.conf === '3'));
    document.getElementById('btn-next').disabled = true;

    this._stopCurrent();
  }

  _submitTrial() {
    const trial = this.trials[this.currentTrial];
    const correct = (this.currentAnswer === 'A' && trial.xIsA) ||
                    (this.currentAnswer === 'B' && !trial.xIsA);

    this.results.push({
      trialNumber: this.currentTrial + 1,
      participantId: this.participantId,
      codec: trial.codec,
      bitrate: trial.bitrate,
      category: trial.category,
      answer: this.currentAnswer,
      correct,
      confidence: this.currentConfidence,
      listensA: this.listenCounts.a,
      listensB: this.listenCounts.b,
      listensX: this.listenCounts.x,
      timestamp: new Date().toISOString()
    });

    this.currentTrial++;

    if (this.currentTrial >= this.trials.length) {
      this._showResults();
    } else {
      this._loadTrial();
    }
  }

  // --- Results ---
  _showResults() {
    this._stopCurrent();
    this._showScreen('screen-results');

    const total = this.results.length;
    const correct = this.results.filter(r => r.correct).length;
    const pct = ((correct / total) * 100).toFixed(1);

    // Summary
    const summary = document.getElementById('results-summary');
    summary.innerHTML = `
      <div style="text-align:center;">
        <div class="big-number">${pct}%</div>
        <div class="big-label">${correct} / ${total} correct</div>
        <div style="margin-top:8px; font-size:12px; color:var(--text-dim);">
          Chance level: 50% &middot; ${pct > 75 ? 'Differences are perceptible at these settings' : pct > 50 ? 'Some differences may be perceptible' : 'Near transparency — difficult to distinguish'}
        </div>
      </div>
    `;

    // Per-codec breakdown
    const breakdown = document.getElementById('results-breakdown');
    const codecs = ['mp3', 'aac', 'opus'];
    let html = '<h3 style="margin:16px 0 8px; font-size:13px; color:var(--text-secondary);">Per-Codec Accuracy</h3>';

    for (const codec of codecs) {
      const codecResults = this.results.filter(r => r.codec === codec);
      const codecCorrect = codecResults.filter(r => r.correct).length;
      const codecPct = codecResults.length > 0 ? (codecCorrect / codecResults.length * 100) : 0;

      html += `<div class="result-row">
        <span style="font-weight:500;">${codec.toUpperCase()}</span>
        <span style="font-family:var(--font-mono); font-size:12px;">${codecCorrect}/${codecResults.length} (${codecPct.toFixed(0)}%)</span>
        <div class="result-bar-bg">
          <div class="result-bar" style="width:${codecPct}%; background: ${codecPct > 75 ? 'var(--accent-red)' : codecPct > 50 ? 'var(--accent-orange)' : 'var(--accent-green)'}"></div>
        </div>
      </div>`;

      // Per-bitrate within codec
      const bitrates = [...new Set(codecResults.map(r => r.bitrate))].sort((a, b) => a - b);
      for (const br of bitrates) {
        const brResults = codecResults.filter(r => r.bitrate === br);
        const brCorrect = brResults.filter(r => r.correct).length;
        const brPct = brResults.length > 0 ? (brCorrect / brResults.length * 100) : 0;
        html += `<div class="result-row" style="padding-left:28px; font-size:12px; color:var(--text-secondary);">
          <span>${br} kbps</span>
          <span style="font-family:var(--font-mono);">${brCorrect}/${brResults.length}</span>
          <div class="result-bar-bg" style="width:80px;">
            <div class="result-bar" style="width:${brPct}%; background: ${brPct > 75 ? 'var(--accent-red)' : brPct > 50 ? 'var(--accent-orange)' : 'var(--accent-green)'}"></div>
          </div>
        </div>`;
      }
    }

    breakdown.innerHTML = html;
  }

  // --- Export ---
  _downloadCSV() {
    const headers = ['trial', 'participant', 'codec', 'bitrate', 'category',
                     'answer', 'correct', 'confidence', 'listens_a', 'listens_b', 'listens_x', 'timestamp'];
    const rows = this.results.map(r => [
      r.trialNumber, r.participantId, r.codec, r.bitrate, r.category,
      r.answer, r.correct, r.confidence, r.listensA, r.listensB, r.listensX, r.timestamp
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this._download(csv, `abx_results_${this.participantId}_${Date.now()}.csv`, 'text/csv');
  }

  _downloadJSON() {
    const data = {
      participantId: this.participantId,
      testDate: new Date().toISOString(),
      totalTrials: this.results.length,
      totalCorrect: this.results.filter(r => r.correct).length,
      results: this.results
    };
    this._download(JSON.stringify(data, null, 2), `abx_results_${this.participantId}_${Date.now()}.json`, 'application/json');
  }

  _download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Event bindings ---
  _bindEvents() {
    // Start
    document.getElementById('btn-start').addEventListener('click', async () => {
      this.participantId = document.getElementById('participant-id').value.trim() || 'Anonymous';
      await this._initAudio();
      this.trials = this._generateTrials();
      this.currentTrial = 0;
      this.results = [];
      this._showScreen('screen-test');
      this._loadTrial();
    });

    // Play buttons
    document.getElementById('btn-a').addEventListener('click', () => this._play('a'));
    document.getElementById('btn-b').addEventListener('click', () => this._play('b'));
    document.getElementById('btn-x').addEventListener('click', () => this._play('x'));

    // Answer buttons
    document.querySelectorAll('.btn-answer').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-answer').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.currentAnswer = btn.dataset.answer;
        document.getElementById('btn-next').disabled = false;
      });
    });

    // Confidence
    document.querySelectorAll('.btn-conf').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-conf').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentConfidence = parseInt(btn.dataset.conf);
      });
    });

    // Next
    document.getElementById('btn-next').addEventListener('click', () => {
      if (this.currentAnswer) this._submitTrial();
    });

    // Downloads
    document.getElementById('btn-download-csv').addEventListener('click', () => this._downloadCSV());
    document.getElementById('btn-download-json').addEventListener('click', () => this._downloadJSON());

    // Restart
    document.getElementById('btn-restart').addEventListener('click', () => {
      this._showScreen('screen-welcome');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('screen-test').classList.contains('active')) {
        switch (e.key) {
          case 'a': case 'A': case '1': this._play('a'); break;
          case 'b': case 'B': case '2': this._play('b'); break;
          case 'x': case 'X': case '3': this._play('x'); break;
          case ' ':
            e.preventDefault();
            if (this.currentlyPlaying) this._stopCurrent();
            break;
        }
      }
    });
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  new ABXTest();
});
