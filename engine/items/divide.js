// Dividing: remainders from facts, then chunking with known multiples (IES 2021 Example 1.1, pp. 8–9),
// then short division of three or four digits by one digit, the written method NSW Stage 3 asks for
// (MA3-MR-01: "divide a number with 3 or more digits by a one-digit divisor"; "Record remainders in words").
// Chunking and short division take 4-digit dividends at the usual level, one problem in three, as NESA's own 3248 ÷ 4
// (MA3-MR-01, "Select and apply strategies to divide a number with 3 or more digits by a one-digit divisor", Stage 3
// MR-A, l.73, https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-3/fafab309e2;
// NSW Mathematics K–10 Syllabus (2022), checked 25 October 2026); remainders from facts stay the size of its facts ("Use known
// multiplication fact families", l.69).
// Each skill's ways are in engine/methods.js (its own first: the biggest multiple, chunking, short division; and since
// stage 4, splitting into known multiples and the area model, teaching audit change 8); here are the numbers.
// opts.method works the sum that way where it fits (each skill's first way that fits otherwise); opts.also is a second
// way the sum must fit too, so the two can be set side by side; opts.sum, { op: '÷', n, d }, asks for that sum.

import { fmt } from '../check.js';
import { METHODS, chunksFor, shortDivision, wayFor } from '../methods.js';

export { chunksFor, shortDivision };

function answerFor(q, r) {
  return r === 0 ? { kind: 'number', value: q } : { kind: 'remainder', quotient: q, remainder: r };
}

function askFor(n, d, r) {
  return r === 0 ? `${fmt(n)} ÷ ${d} = ☐` : `${fmt(n)} ÷ ${d} = ☐ r ☐`;
}

// The sum asked for, or one the draw makes; beside another way (opts.also), drawn again until both ways fit it (a
// split needs a quotient of two parts or more), the same draw as ever when there is no other way to fit.
function sumFor(rng, opts, draw) {
  if (opts.sum) return opts.sum;
  const ways = [opts.method, opts.also].filter((w) => w && METHODS[w]);
  let sum;
  for (let i = 0; i < 50; i++) {
    sum = { op: '÷', ...draw() };
    if (!opts.also || ways.every((w) => METHODS[w].fits(sum))) break;
  }
  return sum;
}

// A 4-digit dividend in place of the one drawn, one problem in three at the usual level: d × q + r from 1000 to 9999,
// with the same divisor and remainder. Drawn after the rest, so a 3-digit sum it leaves is the one it was.
const FOUR_SHARE = 1 / 3;
function fourDigits(rng, opts, { n, d }) {
  if (opts.easy || !rng.chance(FOUR_SHARE)) return { n, d };
  const r = n % d;
  return { n: d * rng.int(Math.ceil((1000 - r) / d), Math.floor((9999 - r) / d)) + r, d };
}

// Remainders from facts: the biggest multiple of the divisor that fits, then what is left.
function remainderItem(skillId, rng, opts) {
  const { n, d } = sumFor(rng, opts, () => {
    const d = opts.easy ? rng.pick([2, 3, 4, 5]) : rng.pick([2, 3, 4, 5, 6, 8, 10]);
    const q = opts.easy ? rng.int(2, 5) : rng.int(2, 10);
    const r = rng.chance(0.85) ? rng.int(1, d - 1) : 0;
    return { n: d * q + r, d };
  });
  return { ...worked(skillId, n, d, opts.method), key: `÷${d}` };
}

// Chunking: take away the biggest chunk of the divisor she knows that fits, a place at a time, then one fact you know
// (IES 2021 p. 9; engine/methods.js chunksFor).
function chunkItem(skillId, rng, opts) {
  const { n, d } = sumFor(rng, opts, () => {
    const d = opts.easy ? rng.pick([2, 3, 4, 5]) : rng.int(2, 9);
    const q = opts.easy ? rng.int(12, 25) : rng.int(12, Math.floor(999 / d));
    const r = rng.chance(0.6) ? rng.int(1, d - 1) : 0;
    return fourDigits(rng, opts, { n: d * q + r, d });
  });
  return worked(skillId, n, d, opts.method);
}

// Short division ("bus stop"), place by place, with what is left carried to the next place.
function shortItem(skillId, rng, opts) {
  const { n, d } = sumFor(rng, opts, () => {
    const d = opts.easy ? rng.pick([2, 3, 4, 5]) : rng.int(2, 9);
    const q = rng.int(Math.ceil(100 / d), Math.floor(999 / d));
    const r = rng.chance(0.6) ? rng.int(0, d - 1) : 0;
    const n = d * q + r;
    return fourDigits(rng, opts, { n: n > 999 ? d * q : n, d }); // three digits, or four in place of them
  });
  return worked(skillId, n, d, opts.method);
}

// the sum worked by one of engine/methods.js's ways, the one asked for if it fits, else the skill's first that does,
// saying first why hers will not work here (wayFor); its key is the kind of problem ('3d/1d r')
function worked(skillId, n, d, asked) {
  const sum = { op: '÷', n, d };
  const { method, steps } = wayFor(skillId, sum, asked);
  const m = METHODS[method];
  return {
    skill: skillId, key: `${String(n).length}d/1d${n % d ? ' r' : ''}`, sum, method,
    ask: askFor(n, d, n % d),
    say: `${n} divided by ${d}`,
    answer: answerFor(Math.floor(n / d), n % d),
    steps,
    picture: m.picture(sum),
    hint: m.hint(sum),
    words: m.words(sum),
  };
}

function hintFor(item, given) {
  if (item.answer.kind === 'remainder' && Array.isArray(given)) {
    const r = Number(given[1]);
    const div = Number(item.ask.split('÷')[1].split('=')[0]);
    if (Number.isFinite(r) && r >= div) return `Your remainder is ${r}. Could another group of ${div} fit in it?`;
  }
  return null;
}

export default {
  skills: ['div-remainder', 'div-chunk', 'div-short'],
  make(skillId, rng, opts = {}) {
    if (skillId === 'div-remainder') return remainderItem(skillId, rng, opts);
    if (skillId === 'div-chunk') return chunkItem(skillId, rng, opts);
    return shortItem(skillId, rng, opts);
  },
  hintFor,
};
