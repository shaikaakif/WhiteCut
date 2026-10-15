/**
 * Procedural Sound Design & Audio Engineering Service
 * Generates tactile, organic acoustic punctuation (paper whoosh, typewriter clicks, sticker pop thuds)
 * directly in the browser via Web Audio API without requiring bulky external MP3 files.
 */

class SoundDesignEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Paper Whoosh: Low-frequency rushing air sound used during swift slide-ins or panel layout swaps.
   */
  public playPaperWhoosh(): void {
    try {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * 0.35; // 350ms whoosh
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate brown/pink noise burst
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Dynamic Bandpass filter sweeping upward then downward
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.0;

      const now = ctx.currentTime;
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.35);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.35);
    } catch {
      // Graceful degradation if browser audio is blocked before user gesture
    }
  }

  /**
   * Analog Keyboard Click: Sharp, snappy mechanical click synchronized with typewriter captions.
   */
  public playKeyboardClick(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Graceful degradation
    }
  }

  /**
   * Sticker Pop / Tactile Thud: Deep, muted impact effect assigned to objects scaling into view via spring physics.
   */
  public playStickerPop(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Sub thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Graceful degradation
    }
  }

  /**
   * Release audio context on unmount to prevent leaks (Law 8)
   */
  public dispose(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const sfx = new SoundDesignEngine();
