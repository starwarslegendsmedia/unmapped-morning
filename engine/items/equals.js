// "=" means "the same as", and missing numbers. Practised in unusual layouts on purpose ("☐ = 3 + 4",
// "5 + 3 = 4 + ☐"): arithmetic practice in non-standard formats improved children's understanding of
// equivalence for months (McNeil, Fyfe & Dunwiddie 2015), and equal-sign understanding predicts
// equation solving (Knuth et al. 2006). NSW: MA2-AR-01 "equals sign to mean 'the same as'"; MA2-AR-02 "Find the
// missing number in an equivalent number sentence" (eq-same's fill-ins too);
// MA3-MR-02 "Identify and use inverse operations to assist with the solution of number sentences".
// Each item is a sentence ({ op: '=', shape, ...its numbers }) worked by one of the skill's ways (engine/methods.js):
// both sides, or undo it, first, as release 1 worked them; then spotting the link between the two sides and counting on
// for a missing part, each only where it fits. opts.method works it that way where it can, else the first way, with a
// first step that says so and why; a way that fits only some sentences gets one it suits about one item in two.
// opts.also is a second way, and then the sentence is one both fit, so the two can be set side by side; opts.sum asks
// for that very sentence. The draws are the ones made before the ways, so the first way's items are as they were.

import { fmt } from '../check.js';
import { METHODS, methodsOf, wayFor, ADD_SHAPES, stage3 } from '../methods.js';

// The ways asked for that are the skill's, and whether to make a sentence one of `partial` (ways that fit only some)
// suits: always beside another way, else one item in two
const own = (skillId, opts) => [opts.method, opts.also].filter((w) => methodsOf(skillId).includes(w));
const suits = (partial, ways, rng, opts) => ways.some((w) => partial.includes(w)) && (Boolean(opts.also) || rng.chance(0.5));

// An item from its sentence, worked by the way asked where it fits, else the skill's first
function itemOf(skillId, sum, opts, key, { ask, say, answer }) {
  const { method, steps } = wayFor(skillId, sum, opts.method);
  const [left, right] = ask.split('=').map((t) => t.trim());
  return {
    skill: skillId, key, sum, method, ask, say, answer, steps,
    picture: { type: 'balance', left, right },
    hint: METHODS[method].hint(sum),
    words: METHODS[method].words(sum),
  };
}

// ---- eq-same ----

function sameSum(rng, opts) {
  const top = opts.easy ? 10 : 50;
  const a = rng.int(1, top), b = rng.int(1, top);
  const total = a + b;
  const shape = rng.pick(['tf-split', 'tf-split', 'tf-trap', 'fill-left', 'fill-both']);
  if (shape === 'fill-left') return { op: '=', shape: '?=a+b', a, b };
  if (shape === 'fill-both') return { op: '=', shape: 'a+b=c+?', a, b, c: rng.int(1, Math.max(1, total - 1)) };
  // true or false: a sentence where both sides are sums
  let c, d;
  if (shape === 'tf-trap') {
    // "7 + 5 = 12 + 4" is false; reading "=" as "the answer comes next" makes it look true
    c = total;
    d = rng.int(1, 9);
  } else {
    c = rng.int(1, Math.max(1, total - 1));
    d = total - c;
    if (rng.chance(0.5)) d = d > 1 && rng.chance(0.5) ? d - 1 : d + rng.int(1, 2);
  }
  return { op: '=', shape: 'a+b=c+d', a, b, c, d };
}

// a sentence the link suits: the first number on the right within 5 of one on the left (7 + 5 = 8 + ☐)
function linkedSum(rng, opts) {
  const top = opts.easy ? 10 : 50;
  const a = rng.int(2, top), b = rng.int(2, top), total = a + b;
  const x = rng.pick([a, b]);
  let c;
  do c = x + rng.int(-5, 5); while (c < 1 || c > total - 1);
  if (rng.chance(0.5)) return { op: '=', shape: 'a+b=c+?', a, b, c };
  let d = total - c;
  if (rng.chance(0.5)) d = d > 1 && rng.chance(0.5) ? d - 1 : d + rng.int(1, 2);
  return { op: '=', shape: 'a+b=c+d', a, b, c, d };
}

function sameItem(skillId, rng, opts) {
  const sum = opts.sum ?? (suits(['relation'], own(skillId, opts), rng, opts) ? linkedSum(rng, opts) : sameSum(rng, opts));
  const { shape, a, b, c, d } = sum;
  if (shape === '?=a+b') return itemOf(skillId, sum, opts, 'fill-left', { ask: `☐ = ${a} + ${b}`, say: `What is the same as ${a} plus ${b}?`, answer: { kind: 'number', value: a + b } });
  if (shape === 'a+b=c+?') return itemOf(skillId, sum, opts, 'fill-both', { ask: `${a} + ${b} = ${c} + ☐`, say: `${a} plus ${b} is the same as ${c} plus what?`, answer: { kind: 'number', value: a + b - c } });
  return itemOf(skillId, sum, opts, c === a + b ? 'trap' : 'true-false', {
    ask: `${a} + ${b} = ${c} + ${d}`, say: `Is ${a} plus ${b} the same as ${c} plus ${d}?`,
    answer: { kind: 'choice', options: ['true', 'false'], value: c + d === a + b ? 'true' : 'false' },
  });
}

// ---- eq-missing-add ----

function addSum(rng, opts) {
  const top = opts.easy ? 20 : 500;
  const a = rng.int(2, top), b = rng.int(2, top);
  const shape = rng.pick(ADD_SHAPES);
  return shape === 'a+b=?+d' ? { op: '=', shape, a, b, d: rng.int(1, a + b - 1) } : { op: '=', shape, a, b };
}

// a sentence every way asked fits: the link needs a + b = ☐ + d with d near a or b; counting on, a part three jumps or
// fewer from the whole
function suitedAddSum(rng, opts, ways) {
  const top = opts.easy ? 20 : 500;
  for (let i = 0; i < 200; i++) {
    const a = rng.int(2, top), b = rng.int(2, top);
    const shape = ways.includes('relation') ? 'a+b=?+d' : rng.pick(['a+?=c', '?+b=c', 'c=a+?', 'c-?=b']);
    const d = shape === 'a+b=?+d' ? rng.pick([a, b]) + rng.int(-5, 5) : null;
    if (d !== null && (d < 1 || d > a + b - 1)) continue;
    const sum = d === null ? { op: '=', shape, a, b } : { op: '=', shape, a, b, d };
    if (ways.every((w) => METHODS[w].fits(sum))) return sum;
  }
  return addSum(rng, opts);
}

function missingAddItem(skillId, rng, opts) {
  const ways = own(skillId, opts);
  const sum = opts.sum ?? (suits(['count-on', 'relation'], ways, rng, opts) ? suitedAddSum(rng, opts, ways) : addSum(rng, opts));
  const { shape, a, b, d } = sum;
  const c = a + b;
  const make = (ask, value, say) => itemOf(skillId, sum, opts, shape, { ask, say, answer: { kind: 'number', value } });
  switch (shape) {
    case 'a+?=c': return make(`${fmt(a)} + ☐ = ${fmt(c)}`, b, `${a} plus what makes ${c}?`);
    case '?+b=c': return make(`☐ + ${fmt(b)} = ${fmt(c)}`, a, `What plus ${b} makes ${c}?`);
    case 'c=a+?': return make(`${fmt(c)} = ${fmt(a)} + ☐`, b, `${c} is the same as ${a} plus what?`);
    case 'c-?=b': return make(`${fmt(c)} − ☐ = ${fmt(b)}`, a, `${c} take away what leaves ${b}?`);
    case '?-a=b': return make(`☐ − ${fmt(a)} = ${fmt(b)}`, c, `What take away ${a} leaves ${b}?`);
    default: return make(`${fmt(a)} + ${fmt(b)} = ☐ + ${fmt(d)}`, c - d, `${a} plus ${b} is the same as what plus ${d}?`);
  }
}

// ---- eq-missing-mult ----

// The usual level takes every table to 10 × 10 (MA2-MR-02, "28 = ☐ × 7", Stage 2 MR-B l.70,
// https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-2/fad59f2055), and one
// sentence in three at Stage 3 size, a 3-digit number and a one-digit one, worked by the inverse operation ("125 ÷ 5 = ☐
// becomes ☐ × 5 = 125": "Identify and use inverse operations to assist with the solution of number sentences", Stage 3
// MR-B l.57, MA3-MR-02, .../stage-3/fa1ff4d43b): 125 ÷ 5 = ☐, 6 × ☐ = 258, ☐ × 6 = 258 and ☐ ÷ 5 = 25
// (NSW Mathematics K–10 Syllabus (2022), checked 25 October 2026). The easy level is as it was.
const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
// the first factor of the equivalent sentence, 4 × 6 = 8 × ☐: undoing it divides by its double, 4, 6, 8, 10 or 20, so
// never by a 2-digit number other than 20
const DOUBLING = [2, 3, 4, 5, 10];
const STAGE3_SHARE = 1 / 3;
const STAGE3_SHAPES = ['c÷a=?', 'a×?=c', '?×b=c', '?÷a=b'];

// A one-digit factor drawn from list, kept to the tables she knows (opts.factors, engine/session.js knownTables): itself
// if she knows its table, else the one she knows at its place in the list, with no draw of its own, so a problem it
// leaves alone is the one it was, and with every table known nothing changes.
function known(a, list, factors) {
  if (!factors || factors.includes(a)) return a;
  const ok = list.filter((f) => factors.includes(f));
  return ok.length ? ok[list.indexOf(a) % ok.length] : a;
}

// k one digit, m two digits (no 0 ones, so it splits in two parts she knows), k × m from 100 to 999
function stage3Sum(rng, opts) {
  const shape = rng.pick(STAGE3_SHAPES);
  const k = known(rng.int(2, 9), [2, 3, 4, 5, 6, 7, 8, 9], opts.factors);
  let m;
  do m = rng.int(Math.ceil(100 / k), 99); while (m % 10 === 0);
  return shape === '?×b=c' ? { op: '=', shape, a: m, b: k } : { op: '=', shape, a: k, b: m };
}

function multSum(rng, opts) {
  if (!opts.easy && rng.chance(STAGE3_SHARE)) return stage3Sum(rng, opts);
  const pool = opts.easy ? [2, 3, 4, 5] : TABLES;
  const a = known(rng.pick(pool), pool, opts.factors), b = rng.int(2, opts.easy ? 5 : 10);
  const shape = rng.pick(['a×?=c', '?×b=c', 'c÷?=b', '?÷a=b', 'a×b=?×d']);
  // an equivalent number sentence, 4 × 6 = 8 × ☐ (MA3-MR-02, "equivalent number sentences"), needs b even and a one
  // that doubles to 10 or less, or 20; else a × ☐ = c
  return { op: '=', shape: shape === 'a×b=?×d' && (b % 2 || !DOUBLING.includes(a)) ? 'a×?=c' : shape, a, b };
}

// the key is the sentence asked, its shape, with ' 3d' where its steps are worked at Stage 3 size (engine/methods.js
// stage3), so her history says which sentence she met
const multKey = (sum) => `${sum.shape}${stage3(sum) ? ' 3d' : ''}`;

// one the link suits: the equivalent sentence, with b even
function doubledSum(rng, opts) {
  const pool = opts.easy ? [2, 3, 4, 5] : DOUBLING;
  const a = known(rng.pick(pool), pool, opts.factors);
  return { op: '=', shape: 'a×b=?×d', a, b: 2 * rng.int(1, opts.easy ? 2 : 5) };
}

function missingMultItem(skillId, rng, opts) {
  const sum = opts.sum ?? (suits(['relation'], own(skillId, opts), rng, opts) ? doubledSum(rng, opts) : multSum(rng, opts));
  const key = multKey(sum);
  const { shape, a, b } = sum;
  const c = a * b;
  const make = (ask, value, say) => itemOf(skillId, sum, opts, key, { ask, say, answer: { kind: 'number', value } });
  switch (shape) {
    case 'c÷a=?': return make(`${c} ÷ ${a} = ☐`, b, `${c} divided by ${a} is what?`);
    case 'a×?=c': return make(`${a} × ☐ = ${c}`, b, `${a} times what makes ${c}?`);
    case '?×b=c': return make(`☐ × ${b} = ${c}`, a, `What times ${b} makes ${c}?`);
    case 'c÷?=b': return make(`${c} ÷ ☐ = ${b}`, a, `${c} divided by what is ${b}?`);
    case '?÷a=b': return make(`☐ ÷ ${a} = ${b}`, c, `What divided by ${a} is ${b}?`);
    default: return make(`${a} × ${b} = ${2 * a} × ☐`, b / 2, `${a} times ${b} is the same as ${2 * a} times what?`);
  }
}

export default {
  skills: ['eq-same', 'eq-missing-add', 'eq-missing-mult'],
  make(skillId, rng, opts = {}) {
    if (skillId === 'eq-same') return sameItem(skillId, rng, opts);
    if (skillId === 'eq-missing-add') return missingAddItem(skillId, rng, opts);
    return missingMultItem(skillId, rng, opts);
  },
};
