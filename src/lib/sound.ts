/**
 * Procedural soundtrack synthesized via Web Audio API (zero external audio files).
 *  - intro: a deep drone that tightens as the black hole nears, a rising rush on the plunge
 *  - impact: sub boom as the horizon is crossed
 *  - ambient: a calm space bed with soft chimes when the chapter changes
 */

const MASTER_LEVEL = 0.4;
const CHIME_NOTES = [293.66, 349.23, 440, 523.25, 587.33, 698.46];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private droneFilter!: BiquadFilterNode;
  private droneGain!: GainNode;
  private padGain!: GainNode;
  private noiseFilter!: BiquadFilterNode;
  private noiseGain!: GainNode;
  private chimeBus!: GainNode;
  private oscillators: OscillatorNode[] = [];
  private noiseBuffer!: AudioBuffer;

  private running = false;
  private phase: "intro" | "ambient" = "intro";

  constructor() {
    if (typeof window === "undefined") return;

    // Start immediately if the browser allows, otherwise unlock on first gesture
    void this.start();
    const events = ["pointerdown", "pointerup", "click", "keydown", "touchend"];
    const unlock = () => {
      void this.start();
      if (this.running) events.forEach((name) => window.removeEventListener(name, unlock));
    };
    events.forEach((name) => window.addEventListener(name, unlock, { passive: true }));

    document.addEventListener("visibilitychange", () => {
      if (!this.ctx || !this.running) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }

  /* --- lifecycle --- */
  private build() {
    const AudioCtor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return false;
    const ctx = new AudioCtor();
    this.ctx = ctx;
    ctx.onstatechange = () => this.sync();

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    this.master.connect(compressor).connect(ctx.destination);

    // Drone: detuned saws and a sub sine through a breathing low-pass filter
    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = "lowpass";
    this.droneFilter.Q.value = 4;
    this.droneGain = ctx.createGain();
    this.droneGain.gain.value = 0;
    this.droneFilter.connect(this.droneGain).connect(this.master);
    [
      { type: "sawtooth" as const, freq: 36.71, detune: -7, level: 0.5 },
      { type: "sawtooth" as const, freq: 55, detune: 6, level: 0.32 },
      { type: "sawtooth" as const, freq: 73.42, detune: -4, level: 0.18 },
      { type: "sine" as const, freq: 18.35, detune: 0, level: 0.9 },
    ].forEach(({ type, freq, detune, level }) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const gain = ctx.createGain();
      gain.gain.value = level;
      osc.connect(gain).connect(this.droneFilter);
      osc.start();
      this.oscillators.push(osc);
    });
    const breathe = ctx.createOscillator();
    breathe.frequency.value = 0.06;
    const breatheDepth = ctx.createGain();
    breatheDepth.gain.value = 90;
    breathe.connect(breatheDepth).connect(this.droneFilter.frequency);
    breathe.start();

    // Pad: soft D-minor sines with a tremolo
    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0;
    this.padGain.connect(this.master);
    [146.83, 220, 349.23, 440].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = 0.08 / (index + 1);
      osc.connect(gain).connect(this.padGain);
      osc.start();
      this.oscillators.push(osc);
    });

    // Noise bed: pink-ish loop for the dive plunge
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }
    this.noiseBuffer = buffer;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = "bandpass";
    this.noiseFilter.frequency.value = 400;
    this.noiseFilter.Q.value = 1.2;

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0;
    this.noiseFilter.connect(this.noiseGain).connect(this.master);

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = this.noiseBuffer;
    noiseSrc.loop = true;
    noiseSrc.connect(this.noiseFilter);
    noiseSrc.start();

    // Chimes: resonant band-passed pings on chapter transition
    this.chimeBus = ctx.createGain();
    this.chimeBus.gain.value = 0.28;
    this.chimeBus.connect(this.master);

    return true;
  }

  private sync() {
    if (!this.ctx) return;
    this.running = this.ctx.state === "running";
  }

  /* --- public control --- */
  async start() {
    if (!this.ctx) {
      if (!this.build()) return;
    }
    if (this.ctx && this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        // Ignored until unlocked
      }
    }
    this.sync();
    if (this.running) {
      const now = this.ctx!.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.linearRampToValueAtTime(MASTER_LEVEL, now + 1.2);
      this.applyPhase();
    }
  }

  /** Called frame-by-frame while the black-hole dive is rendering. */
  setDive(approach: number, plunge: number) {
    if (!this.ctx || !this.running || this.phase !== "intro") return;
    const now = this.ctx.currentTime;

    const droneCutoff = 80 + Math.pow(approach, 2) * 420;
    this.droneFilter.frequency.setTargetAtTime(droneCutoff, now, 0.08);

    const droneLvl = 0.55 + approach * 0.45;
    this.droneGain.gain.setTargetAtTime(droneLvl, now, 0.08);

    if (plunge > 0) {
      const noiseFreq = 200 + Math.pow(plunge, 1.8) * 2400;
      this.noiseFilter.frequency.setTargetAtTime(noiseFreq, now, 0.05);
      this.noiseGain.gain.setTargetAtTime(Math.min(1, plunge * 1.4), now, 0.05);
    }
  }

  dive(approach: number, plunge: number) {
    this.setDive(approach, plunge);
  }

  /** Triggered the moment the event horizon is crossed. */
  impact() {
    if (!this.ctx || !this.running) return;
    const now = this.ctx.currentTime;

    const sub = this.ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 1.4);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(1.1, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    sub.connect(subGain).connect(this.master);
    sub.start(now);
    sub.stop(now + 1.7);
  }

  /** Switch between the intro dive score and the ambient page soundtrack. */
  setPhase(phase: "intro" | "ambient") {
    this.phase = phase;
    if (!this.ctx || !this.running) return;
    this.applyPhase();
  }

  private applyPhase() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.phase === "intro") {
      this.droneGain.gain.setTargetAtTime(0.55, now, 0.6);
      this.padGain.gain.setTargetAtTime(0, now, 0.4);
      this.noiseGain.gain.setTargetAtTime(0, now, 0.2);
    } else {
      this.droneGain.gain.setTargetAtTime(0.18, now, 2.0);
      this.droneFilter.frequency.setTargetAtTime(120, now, 2.0);
      this.noiseGain.gain.setTargetAtTime(0, now, 0.2);
      this.padGain.gain.setTargetAtTime(0.38, now, 2.4);
    }
  }

  /** Play a chime tone on chapter transition. */
  chime(index = 0) {
    if (!this.ctx || !this.running || this.phase !== "ambient") return;
    const now = this.ctx.currentTime;
    const note = CHIME_NOTES[index % CHIME_NOTES.length];

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(note, now);

    const harm = this.ctx.createOscillator();
    harm.type = "sine";
    harm.frequency.setValueAtTime(note * 2.002, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0.08, now);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain).connect(this.chimeBus);
    harm.connect(harmGain).connect(this.chimeBus);

    osc.start(now);
    harm.start(now);
    osc.stop(now + 2.3);
    harm.stop(now + 1.3);
  }
}

export const sound = new SoundEngine();
