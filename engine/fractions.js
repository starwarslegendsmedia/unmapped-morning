// The exact fraction helpers every fraction file shares (stage 6 strand 2, plans/2026-10-25-stage-6-plan.md "Strand 2:
// fractions"): a fraction is { n, d } in whole numbers, written 'n/d', worked by cross-multiplying, never by dividing
// in floats. Every denominator the strand uses is one the outcomes name: MA2-PF-01 "halves, quarters, thirds and fifths
// ... (eighths, sixths and tenths)", MA3-RQF-01 "denominators of 2, 3, 4, 5, 6, 8 and 10" (NSW Mathematics K–10
// Syllabus (2022), 16 June 2026 amendments, checked 26 October 2026; saved copy 2026-10-10-1116-article-k-10-mathematics-
// k-10-syllabus-2022-outcomes.md l.184, l.264), and hundredths for dec-x10's "1/100 of"; so no 7, 9 or 12.

import { fractionOf } from './check.js';

// A fraction's name after its count, as Australian classrooms and NESA's pages say it ("Rename 2 halves, 3 thirds, 4
// quarters", Stage 2 Partitioned fractions B, saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-
// fabf1cf43b.md l.45): [one, more than one]; quarters, never fourths. js/speech.js says every n/d with it.
export const FRACTION_NAMES = {
  2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'],
  6: ['sixth', 'sixths'], 8: ['eighth', 'eighths'], 10: ['tenth', 'tenths'], 100: ['hundredth', 'hundredths'],
};

// Every n/d in a line the game shows, says or draws (plan "Showing a fraction", "Saying a fraction"), the one pattern
// js/speech.js, js/answer.js fracNodes and engine/render/svg.js all read it by: a box (☐, or "?" as a picture writes
// one) in either place. A "/" by a decimal's digits or next to another "/" is no fraction ('3.5/8', '1/2/3'); a full
// stop after one ends its sentence ("So 3/4 = ☐/8."), so only a point with a digit after it is refused there.
// Global: read it with replace or matchAll only.
export const FRACTION = /(?<![\d.\/])(\d+|☐|\?)\/(\d+|☐|\?)(?![\d\/]|\.\d)/g;

// A fraction in words, as the game says it: 3/8 "3 eighths", 1/2 "1 half", 7/4 "7 quarters", ☐/8 "what eighths"; a
// denominator FRACTION_NAMES does not name (or a box there) is left as written, '3/7'.
export function fractionWords(n, d) {
  const name = FRACTION_NAMES[d], count = String(n);
  if (!name) return `${count}/${d}`;
  if (count === '☐' || count === '?') return `what ${name[1]}`;
  return `${count} ${name[count === '1' ? 0 : 1]}`;
}

// a whole number divided by one it is a multiple of, or the whole part of a division (both not below 0): exact, in
// Numbers or BigInts alike, since the remainder is taken off first
const div = (a, b) => (a - (a % b)) / b;

// 'n/d' from n and d, or from { n, d }
export function fracText(n, d) {
  return typeof n === 'object' ? `${n.n}/${n.d}` : `${n}/${d}`;
}

// { n, d } as Numbers from 'n/d' (engine/check.js fractionOf), or from a whole number ('3' is 3/1, as in 3 − 1/4); a
// fraction given as { n, d } is kept as it is; anything else is null
export function fracOf(f) {
  if (f != null && typeof f === 'object') return f;
  const t = String(f ?? '').trim();
  if (/^\d{1,8}$/.test(t)) return { n: +t, d: 1 };
  const r = fractionOf(t);
  return r && { n: Number(r.n), d: Number(r.d) };
}
const read = (f) => {
  const r = fracOf(f);
  if (!r) throw new Error(`not a fraction: ${f}`);
  return r;
};

export function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
export const lcm = (a, b) => div(a, gcd(a, b)) * b;

// -1, 0 or 1 as a is less than, the same as or more than b, by cross-multiplying in BigInt
export function cmpFrac(a, b) {
  const x = read(a), y = read(b);
  const l = BigInt(x.n) * BigInt(y.d), r = BigInt(y.n) * BigInt(x.d);
  return l < r ? -1 : l > r ? 1 : 0;
}

// a ± b in the lowest common denominator (the larger one, when the denominators are related), never simplified, since
// the answer's form is the denominator the steps work in: 1/2 + 1/2 is 2/2
function both(a, b, sign) {
  const x = read(a), y = read(b), d = lcm(x.d, y.d);
  return { n: x.n * div(d, x.d) + sign * y.n * div(d, y.d), d };
}
export const addFrac = (a, b) => both(a, b, 1);
export const subFrac = (a, b) => both(a, b, -1);

// The nearest of 0, 1/2, 1 (and on, a half at a time) for an estimate before working (IES 2010 l.798-800, l.814): a
// quarter and three quarters round up, as the game rounds 5 up (engine/items/placevalue.js roundTo). The halves are
// (4n + d) ÷ 2d, its whole part; the result in lowest terms ({ n: 0, d: 1 }, { n: 1, d: 2 }, { n: 1, d: 1 }, …).
export function nearestBenchmark(f) {
  const { n, d } = read(f);
  const halves = div(4 * n + d, 2 * d);
  return halves % 2 ? { n: halves, d: 2 } : { n: div(halves, 2), d: 1 };
}

// A whole number of halves as an estimate's step writes it: '0', '1/2', '1', '1 and a half', '2' …
export function benchmarkWords(f) {
  const { n, d } = read(f);
  if ((2 * n) % d) throw new Error(`not a whole number of halves: ${fracText(n, d)}`);
  const halves = div(2 * n, d), wholes = div(halves, 2);
  if (!(halves % 2)) return String(wholes);
  return wholes ? `${wholes} and a half` : '1/2';
}

// A fraction's name for more than one, 'eighths' for 8, as the steps write a fraction family
export const namesOf = (d) => FRACTION_NAMES[d][1];

// The letters a picture marks its choices with, A, B and C, and the letter at a value: letters lists the values the
// letters mark, A's first ("Which letter is at 1/2?", chosen for this game, not a syllabus requirement). The question's
// answer and the step that names it both look it up here, so they can never name different letters.
export const LETTERS = ['A', 'B', 'C'];
export const letterAt = (value, letters) => LETTERS[letters.indexOf(value)];

// The sign between two fractions, '<', '=' or '>', by cmpFrac, for the question's answer and the step that says it
export const signOf = (a, b) => ['<', '=', '>'][cmpFrac(a, b) + 1];
