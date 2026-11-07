// Small, quiet sounds made on the spot (no files to download). A soft chime for a right answer and
// nothing at all for a wrong one: mistakes are corrected, never punished. Can be switched off.

let ctx = null;
let on = true;

export function setSound(value) {
  on = value;
}

// The page's one Web Audio context, made on first use; js/speech.js plays the game's voices through it too and readies
// it on her first tap. null where there is no Web Audio.
export function audioContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!ctx && AC) ctx = new AC();
  return ctx;
}

function tone(freq, start, length, gain = 0.06) {
  const ctx = audioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + length);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + length + 0.05);
}

export function right() {
  if (!on) return;
  try { tone(660, 0, 0.18); tone(990, 0.08, 0.25); } catch { /* no audio */ }
}

export function done() {
  if (!on) return;
  try { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.4, 0.05)); } catch { /* no audio */ }
}

// The end-of-round rewards' sounds (engine/rounds.js), so the reward does not sound the same every time.
const REWARD_NOTES = {
  rise: [[523, 0], [659, 0.09], [784, 0.18], [1047, 0.27]],
  sparkle: [[1319, 0], [1568, 0.05], [1760, 0.1], [2093, 0.15], [1760, 0.2], [2093, 0.25]],
  bells: [[784, 0], [1175, 0], [988, 0.22], [1568, 0.22]],
  drum: [[131, 0], [131, 0.16], [196, 0.32], [262, 0.48]],
};

export function reward(kind) {
  if (!on) return;
  try { (REWARD_NOTES[kind] || REWARD_NOTES.rise).forEach(([f, at]) => tone(f, at, kind === 'drum' ? 0.2 : 0.4, 0.05)); } catch { /* no audio */ }
}
