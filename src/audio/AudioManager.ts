/**
 * Procedural Web Audio Synthesizer for Neon Ascent
 * Generates all parkour SFX and dynamic synthwave soundtrack in real-time.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private flowValue: number = 0; // 0 to 1

  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);

      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      this.musicFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      this.musicGain.connect(this.musicFilter);
      this.musicFilter.connect(this.ctx.destination);
    } catch {
      // Audio context might fail on restricted environments
    }
  }

  public setVolumes(sfx: number, music: number): void {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    }
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(music, this.ctx.currentTime);
    }
  }

  public setFlow(flowPercent: number): void {
    this.flowValue = Math.min(1, Math.max(0, flowPercent / 100));
    if (this.ctx && this.musicFilter) {
      // Modulate lowpass filter with flow: 600Hz when cold up to 3500Hz when blazing flow!
      const targetFreq = 600 + this.flowValue * 2900;
      this.musicFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
    }
  }

  // --- Sound Effects ---

  public playFootstep(): void {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + Math.random() * 20, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playJump(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.14);

    gain.gain.setValueAtTime(0.22 * this.sfxVolume, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playLand(hard: boolean = false): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(hard ? 90 : 120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + (hard ? 0.18 : 0.1));

    gain.gain.setValueAtTime((hard ? 0.35 : 0.18) * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (hard ? 0.18 : 0.1));

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + (hard ? 0.18 : 0.1));
  }

  public playSlide(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Bandpass noise burst
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(900, t + 0.25);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.25);
  }

  public playWallRun(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(300, t + 0.12);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playWallJump(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.15);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playVault(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.1);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playDash(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.setValueAtTime(5, t);

    gain.gain.setValueAtTime(0.28 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playGrapple(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.18);

    gain.gain.setValueAtTime(0.22 * this.sfxVolume, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playCollectCore(coreIndex: number): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Harmonic arpeggio based on index
    const freqs = [
      [523.25, 659.25], // C5, E5
      [659.25, 783.99], // E5, G5
      [783.99, 1046.5], // G5, C6
    ][coreIndex % 3];

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.35);
    });
  }

  public playCheckpoint(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A major triad
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.16 * this.sfxVolume, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.4);
    });
  }

  public playDeath(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.35);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playVictory(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const chord = [329.63, 415.3, 493.88, 659.25]; // E major
    chord.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.08);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.7);
    });
  }

  // --- Dynamic Procedural Synthwave Music ---

  public startMusic(): void {
    if (this.isMusicPlaying) return;
    this.init();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    let step = 0;
    const bpm = 128;
    const sixteenth = (60 / bpm) / 4;

    // Bass notes in D minor / Cyber scale: D2, F2, G2, A2, C3
    const bassline = [73.42, 73.42, 87.31, 73.42, 98.0, 73.42, 110.0, 87.31];
    // Synth lead arpeggios
    const arpeggio = [293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 587.33, 440.0];

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;
      const t = this.ctx.currentTime;

      // Play 16th beat element
      if (step % 4 === 0) {
        // Bass hit
        const bassOsc = this.ctx.createOscillator();
        const bassEnv = this.ctx.createGain();
        const note = bassline[(step / 4) % bassline.length];

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(note, t);

        bassEnv.gain.setValueAtTime(0.18 * this.musicVolume, t);
        bassEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        bassOsc.connect(bassEnv);
        bassEnv.connect(this.musicGain);

        bassOsc.start(t);
        bassOsc.stop(t + 0.18);
      }

      // Synth arp note on 16ths
      if (this.flowValue > 0.15 || step % 2 === 0) {
        const arpOsc = this.ctx.createOscillator();
        const arpEnv = this.ctx.createGain();
        const arpNote = arpeggio[step % arpeggio.length];

        arpOsc.type = 'triangle';
        arpOsc.frequency.setValueAtTime(arpNote * (this.flowValue > 0.6 ? 2 : 1), t);

        const volume = (0.04 + this.flowValue * 0.08) * this.musicVolume;
        arpEnv.gain.setValueAtTime(volume, t);
        arpEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        arpOsc.connect(arpEnv);
        arpEnv.connect(this.musicGain);

        arpOsc.start(t);
        arpOsc.stop(t + 0.1);
      }

      step = (step + 1) % 32;
    }, sixteenth * 1000);
  }

  public stopMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const audioManager = new AudioManager();
