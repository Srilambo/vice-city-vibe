// Subtle 80s Retro Synthesizer Sound Engine using Web Audio API
// No assets/external files required. Clean, safe, and performant.

let audioCtx: AudioContext | null = null;
let muted = false;

if (typeof window !== "undefined") {
  muted = localStorage.getItem("sound_engine_muted") === "true";
}

export function isAudioMuted(): boolean {
  return muted;
}

export function setAudioMuted(val: boolean) {
  muted = val;
  if (typeof window !== "undefined") {
    localStorage.setItem("sound_engine_muted", String(val));
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Ensure AudioContext is active
async function ensureActive(ctx: AudioContext): Promise<boolean> {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch (e) {
      return false;
    }
  }
  return ctx.state === "running";
}

/**
 * Play a retro 80s UI digital click
 */
export async function playClick() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const active = await ensureActive(ctx);
  if (!active) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  // Pitch slide: 80s arcade high-to-low click
  osc.frequency.setValueAtTime(580, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Play an elegant high-frequency CRT static pop for UI hovers
 */
export async function playHover() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const active = await ensureActive(ctx);
  if (!active) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  // Tiny cybernetic sparkle/click
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

  gain.gain.setValueAtTime(0.008, now); // Extremely subtle
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.015);
}

/**
 * Play a cinematic retro synthetic cyber whoosh / analog filter sweep
 */
export async function playWhoosh() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const active = await ensureActive(ctx);
  if (!active) return;

  const now = ctx.currentTime;
  const duration = 0.45;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Custom synth shape
  osc.type = "triangle";
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + duration);

  // High resonant filter sweeping like an analog synthesizer sweep
  filter.type = "lowpass";
  filter.Q.setValueAtTime(8, now);
  filter.frequency.setValueAtTime(150, now);
  filter.frequency.exponentialRampToValueAtTime(1800, now + duration);

  // Soft fade in, immediate release
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Play a majestic retro digital terminal over-ride (cheat act/unlock)
 */
export async function playCheatUnlock() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const active = await ensureActive(ctx);
  if (!active) return;

  const now = ctx.currentTime;
  
  // Quick 3-note cyber-arpeggio: C5 -> E5 -> G5 -> C6
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const step = 0.05;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + i * step;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, noteTime);

    // Warm, neon synthesizer brightness
    gain.gain.setValueAtTime(0.04, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.16);
  });
}

/**
 * Play a rich 80s ascending neon synth-chime when saving progress
 */
export async function playSaveSynth() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const active = await ensureActive(ctx);
  if (!active) return;

  const now = ctx.currentTime;
  const duration = 0.6;

  // Let's create an elegant synth major arpeggio/chord sweep: F3, Bb3, D4, G4, C5 (Neon jazz vibe)
  const notes = [174.61, 233.08, 293.66, 392.00, 523.25];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const startTime = now + idx * 0.05;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, startTime);
    filter.frequency.exponentialRampToValueAtTime(1800, startTime + 0.3);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.04, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

