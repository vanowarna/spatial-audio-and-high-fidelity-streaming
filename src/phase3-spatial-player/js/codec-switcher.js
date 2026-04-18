// ============================================================
// codec-switcher.js — Real-time codec/bitrate toggle with preloading
// ============================================================

export class CodecSwitcher {
  constructor(audioEngine) {
    this.engine = audioEngine;
    this.availableVariants = new Map(); // sourceId -> [{codec, bitrate, url, loaded}]
    this.currentCodec = 'original';
    this.currentBitrate = null;

    // Callbacks
    this.onCodecChanged = null;
    this.onLoadProgress = null;
  }

  // Register a codec variant for a source
  registerVariant(sourceId, codec, bitrate, url) {
    if (!this.availableVariants.has(sourceId)) {
      this.availableVariants.set(sourceId, []);
    }
    this.availableVariants.get(sourceId).push({
      codec, bitrate, url, loaded: false, buffer: null
    });
  }

  // Preload all registered variants for a source
  async preloadSource(sourceId) {
    const variants = this.availableVariants.get(sourceId);
    if (!variants) return;

    let loaded = 0;
    const total = variants.length;

    for (const v of variants) {
      try {
        v.buffer = await this.engine.loadAudioBuffer(v.url);
        this.engine.addCodecVariant(sourceId, v.codec, v.bitrate, v.buffer);
        v.loaded = true;
        loaded++;
        if (this.onLoadProgress) {
          this.onLoadProgress(sourceId, loaded, total);
        }
      } catch (err) {
        console.warn(`Failed to load ${v.codec}@${v.bitrate}k for source ${sourceId}:`, err);
      }
    }
  }

  // Preload all sources
  async preloadAll() {
    const promises = [];
    this.availableVariants.forEach((_, id) => {
      promises.push(this.preloadSource(id));
    });
    await Promise.all(promises);
  }

  // Switch codec globally (all sources)
  switchAll(codec, bitrate) {
    this.currentCodec = codec;
    this.currentBitrate = bitrate;

    let success = true;
    this.engine.sources.forEach((src, id) => {
      const ok = this.engine.switchCodec(id, codec, bitrate);
      if (!ok) success = false;
    });

    if (this.onCodecChanged) {
      this.onCodecChanged(codec, bitrate);
    }
    return success;
  }

  // Switch codec for a single source
  switchSource(sourceId, codec, bitrate) {
    return this.engine.switchCodec(sourceId, codec, bitrate);
  }

  // Get available codecs and bitrates for a source
  getVariants(sourceId) {
    return this.availableVariants.get(sourceId) || [];
  }

  // Get unique codec names across all sources
  getCodecList() {
    const codecs = new Set(['original']);
    this.availableVariants.forEach(variants => {
      variants.forEach(v => codecs.add(v.codec));
    });
    return [...codecs];
  }

  // Get unique bitrates for a given codec
  getBitratesForCodec(codec) {
    if (codec === 'original') return [];
    const bitrates = new Set();
    this.availableVariants.forEach(variants => {
      variants.filter(v => v.codec === codec).forEach(v => bitrates.add(v.bitrate));
    });
    return [...bitrates].sort((a, b) => a - b);
  }

  // Get info about current selection
  getCurrentInfo() {
    return {
      codec: this.currentCodec,
      bitrate: this.currentBitrate,
      label: this.currentCodec === 'original'
        ? 'Original (Uncompressed)'
        : `${this.currentCodec.toUpperCase()} @ ${this.currentBitrate} kbps`
    };
  }
}
