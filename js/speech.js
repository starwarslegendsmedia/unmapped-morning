// Read-aloud in the game's own voices: every line the game says is said sentence by sentence, each sentence from its
// sound file (voices/index.json, made by tools/voice.mjs: one designed voice per character, cloned for every line;
// plans/2026-10-24-game-voices-build.md). A sentence with no whole file is built from the guide's recorded pieces
// (voices/pieces.json, made by tools/pieces.mjs; js/pieces.js) when every piece exists; otherwise it is shown and not
// said, and listed by unsaid(): there is no device voice (plans/2026-10-26-guide-pieces-plan.md). Read-aloud tools help
// weaker readers' comprehension, d = .35 (Wood et al. 2018).
//
// Every instruction is said as its screen opens, and once more if nothing is tapped for a while: Fisher, "repeat
// key instructions after a period of inactivity (generally 15–20 seconds), but keep it short" (research 6.15).

import { audioContext } from './sound.js';
import { assemble } from './pieces.js';
import { FRACTION, fractionWords } from '../engine/fractions.js';
import { UNITS, unitWords } from '../engine/units.js';

export const REPEAT_MS = 18000;
// The decoded sounds kept to play again, the one used longest ago let go first while over either limit:
const KEEP_FILES = 160;   // enough for a screen's lines and the pieces they share
const KEEP_SECONDS = 240; // about 46 MB at 48 kHz, well inside what Safari on an iPhone allows a page

let speaker = null; // a stand-in voice for the tests: (text) => void, given each whole line
let player = null;  // a stand-in for the tests, giving both { play(file), pieces(list) }: promises settled when said
let clips = {};     // a character's sound files: { guide: { sentence as said: file under voices/ }, narrator: ... }
let pieceTable = {}; // a character's pieces: { guide: { piece key: file under voices/pieces/ } }
let line = 0;       // the line being said now; a line stopped or replaced is said no further
let sources = [];   // the sounds playing or about to start: a sound file, or a sentence's pieces
let enabled = true; // read-aloud on (settings); off, the game makes and touches no sound context for speech
const buffers = new Map(); // the files and pieces played most recently, ready to play again (an instruction's repeat)
let keptSeconds = 0;       // their length, all together
const decoding = new Map(); // file: the fetch and decode under way, shared by a piece said twice in one sentence
let again = null;   // the pending repeat of the last instruction
let pending = null; // a line that could not play before her first tap, { text, opts }: said at the tap
const unsaidLines = []; // the sentences shown and not said, for the replay's count (unsaid())

// The page's one sound context (js/sound.js), only while read-aloud is on. 'playback' lets the voices be heard with an
// iPhone's silent switch on (Safari 16.4 and later); it also pauses other apps' sound while the game is open, which is
// why it is set only when read-aloud is on.
function audio() {
  if (!enabled) return null;
  if (globalThis.navigator?.audioSession) navigator.audioSession.type = 'playback';
  return audioContext();
}

// A tap or a key means she is busy, so the repeat is dropped. The page hears it before the button does (capture),
// so a tap that opens the next screen drops the old repeat before the new screen sets its own. The first tap also
// plays a quiet sound, which lets iPhones play later without a tap of their own, and then says the line that was
// waiting for it, once; a tap after the sound was stopped (the phone put away, a call) lets it play again.
if (typeof document !== 'undefined') {
  for (const type of ['pointerdown', 'click', 'keydown']) {
    document.addEventListener(type, () => {
      clearTimeout(again);
      again = null;
      if (speaker || player || !enabled) return;
      const c = audio();
      if (c && c.state !== 'running') {
        c.resume?.();
        const quiet = c.createBufferSource();
        quiet.buffer = c.createBuffer(1, 1, 22050);
        quiet.connect(c.destination);
        quiet.start();
      }
      if (pending) {
        const { text, opts } = pending;
        pending = null;
        say(text, opts, false);
      }
    }, true);
  }
}

export function useSpeaker(fn) {
  speaker = fn;
}

export function useVoice(v) {
  player = v;
}

export function useReadAloud(on) {
  enabled = Boolean(on);
}

export function useClips(table) {
  clips = table || {};
}

export function usePieces(table) {
  pieceTable = table || {};
}

async function listFrom(get, url) {
  try {
    const res = await get(url);
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}

// The list of sound files and the list of pieces, each on its own: with neither (not made yet, or offline before they
// were ever loaded), nothing is said.
export async function loadClips(get = globalThis.fetch) {
  [clips, pieceTable] = await Promise.all([listFrom(get, 'voices/index.json'), listFrom(get, 'voices/pieces.json')]);
}

// The game offers to read only in a voice that has files or pieces: a story read by a character with none would be a
// dead button.
export function canSpeak(who = 'guide') {
  if (speaker != null || player != null) return true;
  for (const k in clips[who] || {}) return k != null;
  for (const k in pieceTable[who] || {}) return k != null;
  return false;
}

// The sentences shown and not said since clearUnsaid(): a sentence with no file and no full set of pieces, or one whose
// file or pieces would not play.
export function unsaid() {
  return [...unsaidLines];
}

export function clearUnsaid() {
  unsaidLines.length = 0;
}

export function stop() {
  clearTimeout(again);
  again = null;
  pending = null;
  line++;
  for (const src of sources) { try { src.stop(); } catch { /* already ended */ } }
  sources = [];
}

// A decimal said digit by digit after "point", as Australian classrooms read it: 3.45 "3 point 4 5", 0.056
// "0 point 0 5 6", a time too ("5.0 s" and "5.0s" "5 point 0 seconds", "27.22 seconds" "27 point 2 2 seconds"); money
// in dollars and cents, "$3.45" "3 dollars 45", "$12.5" "12 dollars 50", "$0.45" "45 cents", "$1 234.50" "1 234 dollars
// 50", whole dollars "$25" "25 dollars", "$☐" "what, in dollars"; a unit after a number as its word ("2.75 m"
// "2 point 7 5 metres", "1 kg" "1 kilogram", "s" seconds), after a space or a no-break space alike. The one rule: every voiced line is a sentence as sentences() says it
// (tools/voice-lines.mjs), so tools/voice.mjs reads these words, not the digits.
const DOLLARS = /\$(\d{1,3}(?:[  ,]\d{3})+|\d+)(?:\.(\d{1,2}))?(?!\d)/g;
const point = (w, f) => `${w} point ${f.split('').join(' ')}`;
// A unit's symbol, longest first so "m²" is never "m" and a "²", after a whole amount ("25 000", "2.6", never starting
// straight after a digit or a point) or a box, and a space; nothing but a space, a mark or the end after it
const SYMBOLS = Object.keys(UNITS).sort((a, b) => b.length - a.length).join('|');
const UNIT_AFTER = new RegExp(`(?<![\\d.])(\\d+(?:[ \\u00a0]\\d{3})*(?:\\.\\d+)?|☐)[ \\u00a0](${SYMBOLS})(?=[\\s.,;:!?)]|$)`, 'g');
// A fraction, said first: its count and its name, as Australian classrooms and NESA's pages say it, 3/8 "3 eighths",
// 1/2 "1 half", 7/4 "7 quarters", ☐/8 "what eighths" (engine/fractions.js FRACTION and fractionWords, the pattern and
// words the screens and the pictures use too); a denominator it does not name is left as written ('3/7'), and so is a
// "/" between a decimal's digits or next to another "/" ('3.5/8', '1/2/3').
const saidNumbers = (text) => text
  .replace(FRACTION, (_, n, d) => fractionWords(n, d))
  .replace(DOLLARS, (_, d, c) => {
    const dollars = d.replace(/[ ,]/g, ' '), cents = Number((c ?? '').padEnd(2, '0'));
    if (c != null && /^0+$/.test(dollars)) return `${cents} cents`;
    return `${dollars} dollar${dollars === '1' ? '' : 's'}${cents ? ` ${cents}` : ''}`;
  })
  .replace(/\$\s*☐/g, 'what, in dollars')
  // "°" straight after a whole amount or a box, in degrees (stage 6 strand 4b, plan "Showing and saying an angle and a
  // point"), before the units rule as a unit is: "120°" "120 degrees", "☐°" "what degrees", "1°" "1 degree"; any other
  // "°" as it is. A point with a box, bracketed, a comma and one space between, each side a whole number or a box,
  // without its brackets and each box "what": "(☐, ☐)" "what, what", "(2, ☐)" "2, what" (B2's answer step, the lead's
  // ruling, R12, 30 October); a point "(2, 3)" as written, its brackets dropped by the voice and the pieces
  // (js/pieces.js fragment)
  .replace(/(?<![\d.])(\d+(?:\.\d+)?|☐)°/g, (_, n) => `${n} degree${n === '1' ? '' : 's'}`)
  .replace(/\((\d+|☐), (\d+|☐)\)/g, (pair, a, b) => (pair.includes('☐') ? `${a}, ${b}`.replace(/☐/g, 'what') : pair))
  // a unit of engine/units.js after the whole amount or a box (stage 6 strand 4, plan "Showing and saying a unit"),
  // before the decimal rule so it sees the amount whole: "2.1 km" "2 point 1 kilometres", "1 km" "1 kilometre",
  // "☐ cm²" "what square centimetres", "m²" never "metres²"
  .replace(UNIT_AFTER, (_, n, unit) => `${n} ${unitWords(unit, n)}`)
  .replace(/(\d)\.(\d+)(?!\d|s\b)/g, (_, w, f) => point(w, f))
  .replace(/(\d)\.(\d+)s\b/g, (_, w, f) => `${point(w, f)} seconds`)
  .replace(/(\d)[  ]s\b/g, '$1 seconds')
  // "%" straight after a number or a box, "per cent" (stage 6 strand 3, plan "Saying a percentage"; the page's own
  // vocabulary word, Examples fa0a18f458 l.110, l.124): "25%" "25 per cent", "☐%" "what per cent"; any other "%" as it is
  .replace(/(?<=[\d☐])%/g, ' per cent');

// Text as it is said: money, decimals and units in words, a sum's symbols as words, an empty box as "what". A no-break
// space (U+00A0, which keeps a fraction way's "5 × 2 = 10" and "11 eighths" on one line) is said as a plain space, so
// "−" between no-break spaces is "take away" too and no line's sound file changes for one.
export function words(text) {
  return saidNumbers(String(text).replace(/ /g, ' '))
    .replace(/☐/g, ' what ')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/ − /g, ' take away ')
    .replace(/−/g, ' minus ')
    .replace(/(\d) r (\d)/g, '$1 remainder $2')
    .replace(/→/g, ' to ')
    .replace(/\s+/g, ' ')
    .trim();
}

// A line without its sentences that carry a count (her score, her best, the session's totals): the counts stay on the
// screen, so one voice says the rest of it (plans/2026-10-24-game-voices-build.md).
export function withoutNumbers(text) {
  return String(text).split(/(?<=[.!?])\s+/).filter((s) => !/\d/.test(s)).join(' ');
}

// Drop the pending repeat of the last instruction, leaving any words still being said to finish.
export function noRepeat() {
  clearTimeout(again);
  again = null;
}

// An instruction: said now, and once more after REPEAT_MS if she has not tapped or typed. The repeat is the same line
// shown once, so what it cannot say is not listed by unsaid() a second time.
export function instruct(text) {
  const said = words(text);
  speak(said);
  again = setTimeout(() => { again = null; say(said, {}, false); }, REPEAT_MS);
}

// A line's sentences as they are said: the sound files are kept one to a sentence, under these exact words, each ending
// in one stop (a step said alone, "3 times 6 = 18", and the same step in a list joined by stops, "3 times 6 = 18..", are
// one sentence).
export function sentences(text) {
  const said = words(text);
  if (!said) return [];
  return said.split(/(?<=[.!?])\s+/).filter(Boolean)
    .map((s) => (/[!?]$/.test(s) ? s : `${s.replace(/[\s.:;,]+$/, '')}.`));
}

// Say a line in a character's voice ('guide' unless told), sentence by sentence; onEnd once all of it is said, never if
// it was stopped or replaced. A sentence with no file is said from its pieces (a whole file wins when both exist); one
// with neither, or whose file or pieces will not play, is listed by unsaid() and skipped.
export function speak(text, opts = {}) {
  say(text, opts, true);
}

// count: list the line's sentences with no file (false for a line said again: an instruction's repeat, or the line said
// at her first tap; each was listed when first said)
function say(text, opts, count) {
  const { onEnd, voice: who = 'guide' } = opts;
  stop();
  if (speaker) { speaker(text); return; }
  const mine = line;
  const table = clips[who] || {};
  const parts = sentences(text).map((s) => {
    const file = table[s] && `voices/${table[s]}`;
    const pieces = !file && pieceTable[who] ? assemble(s, pieceTable[who]) : null;
    return { text: s, file, pieces: pieces?.length ? pieces : null }; // a sentence of marks alone has no pieces
  });
  if (count) for (const p of parts) if (!p.file && !p.pieces) unsaidLines.push(p.text);
  if (!canSpeak(who)) return;
  (async () => {
    for (const p of parts) {
      if (mine !== line) return;
      if (!p.file && !p.pieces) continue;
      try {
        await (p.file ? playFile(p.file, mine) : playPieces(p.pieces, mine));
      } catch (e) {
        if (mine !== line) return;
        if (e.beforeTap) { pending = { text, opts }; return; }
        unsaidLines.push(p.text);
      }
    }
    if (mine === line && onEnd) onEnd();
  })();
}

// The sound context, once sound may play; before her first tap it throws beforeTap, so the line waits for the tap.
async function ready() {
  const c = audio();
  if (!c) throw new Error('no Web Audio');
  if (c.state !== 'running') {
    await Promise.race([c.resume?.(), new Promise((r) => setTimeout(r, 300))]);
    if (c.state !== 'running') throw Object.assign(new Error('before a tap'), { beforeTap: true });
  }
  return c;
}

// A file's decoded sound, from those kept (moved to the end, as used last) or fetched and decoded once.
function decoded(c, file) {
  const buf = buffers.get(file);
  if (buf) {
    buffers.delete(file);
    buffers.set(file, buf);
    return Promise.resolve(buf);
  }
  if (!decoding.has(file)) {
    const loading = load(c, file);
    decoding.set(file, loading);
    const done = () => decoding.delete(file);
    loading.then(done, done);
  }
  return decoding.get(file);
}

async function load(c, file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  const buf = await c.decodeAudioData(await res.arrayBuffer());
  buffers.set(file, buf);
  keptSeconds += buf.duration;
  while (buffers.size > 1 && (buffers.size > KEEP_FILES || keptSeconds > KEEP_SECONDS)) {
    const [oldest, gone] = buffers.entries().next().value;
    buffers.delete(oldest);
    keptSeconds -= gone.duration;
  }
  return buf;
}

// Start each sound at its time (now, with none given), the sentence said when the last one ends.
function play(c, bufs, at) {
  return new Promise((resolve) => {
    const srcs = bufs.map((buf) => {
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(c.destination);
      return src;
    });
    srcs[srcs.length - 1].onended = () => { sources = sources.filter((s) => !srcs.includes(s)); resolve(); };
    sources.push(...srcs);
    srcs.forEach((src, i) => (at ? src.start(at[i]) : src.start()));
  });
}

async function playFile(file, mine) {
  if (player) return player.play(file);
  const c = await ready();
  const buf = await decoded(c, file);
  if (mine !== line) return;
  await play(c, [buf]);
}

// A sentence from its pieces, [{ file, gap }] (js/pieces.js assemble()): every piece fetched and decoded first, then
// each started after its gap, where the one before it ends.
async function playPieces(list, mine) {
  if (player) {
    if (!player.pieces) throw new Error('the stand-in player has no pieces()');
    return player.pieces(list);
  }
  const c = await ready();
  const bufs = await Promise.all(list.map((p) => decoded(c, p.file)));
  if (mine !== line) return;
  let t = c.currentTime + 0.02;
  const at = list.map((p, i) => { const when = t + p.gap; t = when + bufs[i].duration; return when; });
  await play(c, bufs, at);
}
