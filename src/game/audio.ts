type SoundEffect =
  | 'jump'
  | 'land'
  | 'coin'
  | 'xp'
  | 'stomp'
  | 'bolt'
  | 'hurt'
  | 'level_up'
  | 'chest'
  | 'potion'
  | 'stage_clear'
  | 'defeat';

// Calm pentatonic traveler's melody (D minor / F major mood, Hz)
const BGM_MELODY_HZ = [
  293.66, 0, 349.23, 392.0, 440.0, 0, 392.0, 349.23,
  329.63, 0, 293.66, 261.63, 293.66, 0, 220.0, 0,
  293.66, 0, 349.23, 440.0, 523.25, 0, 440.0, 392.0,
  349.23, 329.63, 293.66, 0, 261.63, 0, 293.66, 0,
];

const BGM_BASS_HZ = [
  146.83, 0, 0, 0, 174.61, 0, 0, 0,
  130.81, 0, 0, 0, 146.83, 0, 110.0, 0,
  146.83, 0, 0, 0, 174.61, 0, 0, 0,
  130.81, 0, 110.0, 0, 146.83, 0, 0, 0,
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmMaster: GainNode | null = null;
  private bgmTimer: number | null = null;
  private bgmStep = 0;
  private bgmShouldPlay = false;
  private _muted = false;

  get muted(): boolean {
    return this._muted;
  }

  set muted(val: boolean) {
    this._muted = val;
    if (this.bgmMaster && this.ctx) {
      this.bgmMaster.gain.setTargetAtTime(
        val || !this.bgmShouldPlay ? 0.0001 : 0.22,
        this.ctx.currentTime,
        0.04
      );
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.bgmMaster && this.ctx) {
      this.bgmMaster = this.ctx.createGain();
      this.bgmMaster.gain.value = this._muted || !this.bgmShouldPlay ? 0.0001 : 0.22;
      this.bgmMaster.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  setBgmActive(active: boolean) {
    this.bgmShouldPlay = active;
    if (active) {
      const ctx = this.ensureContext();
      if (ctx && this.bgmMaster) {
        this.bgmMaster.gain.setTargetAtTime(
          this._muted ? 0.0001 : 0.22,
          ctx.currentTime,
          0.08
        );
      }
      if (this.bgmTimer === null && typeof window !== 'undefined') {
        this.bgmTimer = window.setInterval(() => {
          this.tickBgmNote();
        }, 310);
      }
    } else {
      if (this.bgmMaster && this.ctx) {
        this.bgmMaster.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.06);
      }
      if (this.bgmTimer !== null && typeof window !== 'undefined') {
        window.clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  private tickBgmNote() {
    if (!this.bgmShouldPlay || this._muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.bgmMaster || ctx.state !== 'running') return;

    const idx = this.bgmStep % BGM_MELODY_HZ.length;
    this.bgmStep += 1;

    const now = ctx.currentTime;
    const melFreq = BGM_MELODY_HZ[idx];
    if (melFreq > 0) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(melFreq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.11, now + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(g);
      g.connect(this.bgmMaster);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    const bassFreq = BGM_BASS_HZ[idx];
    if (bassFreq > 0) {
      const oscB = ctx.createOscillator();
      const gB = ctx.createGain();
      oscB.type = 'sine';
      oscB.frequency.setValueAtTime(bassFreq, now);
      gB.gain.setValueAtTime(0.0001, now);
      gB.gain.linearRampToValueAtTime(0.14, now + 0.04);
      gB.gain.exponentialRampToValueAtTime(0.0001, now + 0.56);
      oscB.connect(gB);
      gB.connect(this.bgmMaster);
      oscB.start(now);
      oscB.stop(now + 0.58);
    }
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    gainPeak: number,
    delay = 0
  ) {
    if (this._muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, freqEnd),
        now + duration
      );
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  play(sfx: SoundEffect) {
    if (this._muted) return;
    const jitter = 0.94 + Math.random() * 0.12;
    switch (sfx) {
      case 'jump':
        this.tone(240 * jitter, 460 * jitter, 0.12, 'triangle', 0.09);
        break;
      case 'land':
        this.tone(120 * jitter, 70, 0.06, 'sine', 0.05);
        break;
      case 'coin':
        this.tone(660 * jitter, 880 * jitter, 0.08, 'triangle', 0.08);
        this.tone(990 * jitter, 1180 * jitter, 0.1, 'sine', 0.06, 0.05);
        break;
      case 'xp':
        this.tone(520 * jitter, 780 * jitter, 0.12, 'sine', 0.08);
        break;
      case 'stomp':
        this.tone(180 * jitter, 90, 0.11, 'square', 0.08);
        this.tone(360 * jitter, 520, 0.08, 'triangle', 0.06, 0.03);
        break;
      case 'bolt':
        this.tone(540 * jitter, 280 * jitter, 0.1, 'triangle', 0.07);
        break;
      case 'hurt':
        this.tone(190, 85, 0.18, 'sawtooth', 0.11);
        break;
      case 'chest':
        this.tone(440, 660, 0.09, 'triangle', 0.08);
        this.tone(660, 880, 0.12, 'triangle', 0.08, 0.07);
        break;
      case 'potion':
        this.tone(392, 523, 0.1, 'sine', 0.08);
        this.tone(523, 659, 0.14, 'sine', 0.08, 0.07);
        break;
      case 'level_up':
        this.tone(440, 440, 0.09, 'triangle', 0.09, 0);
        this.tone(554, 554, 0.09, 'triangle', 0.09, 0.08);
        this.tone(659, 659, 0.1, 'triangle', 0.09, 0.16);
        this.tone(880, 880, 0.22, 'triangle', 0.1, 0.24);
        break;
      case 'stage_clear':
        this.tone(523, 523, 0.1, 'triangle', 0.09, 0);
        this.tone(659, 659, 0.1, 'triangle', 0.09, 0.09);
        this.tone(784, 784, 0.12, 'triangle', 0.09, 0.18);
        this.tone(1046, 1046, 0.28, 'triangle', 0.1, 0.28);
        break;
      case 'defeat':
        this.tone(300, 220, 0.16, 'sawtooth', 0.08, 0);
        this.tone(220, 140, 0.26, 'sawtooth', 0.08, 0.14);
        break;
    }
  }
}

export const soundEngine = new SoundEngine();
