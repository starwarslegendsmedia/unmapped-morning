// Multiplication and division facts to 12 × 12, taught as fact families (IES 2021 p. 52).
// A fact is a pair of factors, key '7x8' (smaller first): 7 × 8, 8 × 7, 56 ÷ 7 and 56 ÷ 8 are one family.
// A pair belongs to the earliest table group that holds either of its factors, so 3 × 5 is a 5s fact, except that a pair
// with 11 or 12 in it is always facts-11-12's (5 × 12 too): the Stage 2 groups stop at 10 × 10.
// A multiplication is worked a way from engine/methods.js, from a fact she already knows (IES 2021 p. 53): opts.method
// if it fits, else the first of the skill's ways that does, else plain "7 lots of 7" (a fact with 0 or 1 always: no way
// fits it; every fact from 2 to 10 has one since stage 4). A division fact is worked the same way, by the family or, for
// ÷ 2, ÷ 4 and ÷ 8, by halving: opts.method if it fits, else opts.divMethod (her ÷ way, kept apart from her × way,
// engine/methods.js preferredMethod), else the family. opts.sum asks for one multiplication, { op: '×', a, b }, in that
// order, or one division, { op: '÷', n, d }.

import { BY_ID } from '../skills.js';
import { fmt } from '../check.js';
import { METHODS, methodsFor } from '../methods.js';

const GROUPS = ['facts-0-1', 'facts-2-5-10', 'facts-3-4', 'facts-6-8', 'facts-9-7', 'facts-11-12'];

function groupOf(n) {
  return GROUPS.findIndex((g) => BY_ID[g].tables.includes(n));
}

// a fact with 11 or 12 in it is only in facts-11-12: MA2-MR-01's Stage 2 facts go to 10 × 10 (plans/2026-10-25-nesa-audit.md)
export function pairGroup(a, b) {
  if (a > 10 || b > 10) return 'facts-11-12';
  return GROUPS[Math.min(groupOf(a), groupOf(b))];
}

// The facts a group held before 25 October 2026, when it kept the pairs with 11 or 12 whose other factor was its own
// (5 × 12 was a 5s fact), that are now facts-11-12's: what a placement in that group then said she knew.
export function movedFrom(skillId) {
  const out = [];
  for (let a = 0; a <= 10; a++) for (let b = 11; b <= 12; b++) if (GROUPS[groupOf(a)] === skillId && skillId !== 'facts-11-12') out.push(`${a}x${b}`);
  return out;
}

const KEYS = {};
for (const g of GROUPS) KEYS[g] = [];
for (let a = 0; a <= 12; a++) {
  for (let b = a; b <= 12; b++) KEYS[pairGroup(a, b)].push(`${a}x${b}`);
}
// facts-11-12 teaches 2 × 11 up to 12 × 12 first; its 0 and 1 facts, which follow the rule she already has, come last
KEYS['facts-11-12'].sort((x, y) => (parseKey(x)[0] < 2) - (parseKey(y)[0] < 2));

export function parseKey(key) {
  const [a, b] = key.split('x').map(Number);
  return [a, b];
}

function make(skillId, rng, opts = {}) {
  const keys = KEYS[skillId];
  const small = keys.filter((k) => parseKey(k)[1] <= 5);
  if (opts.key && !keys.includes(opts.key)) throw new Error(`${skillId} has no fact ${opts.key}`);
  // the factors of the sum asked for: a × b, or d and n ÷ d
  const asked = opts.sum && (opts.sum.op === '÷' ? [opts.sum.d, opts.sum.n / opts.sum.d] : [opts.sum.a, opts.sum.b]);
  const key = asked ? `${Math.min(...asked)}x${Math.max(...asked)}` : opts.key || rng.pick(opts.easy && small.length ? small : keys);
  const [a, b] = parseKey(key);
  const product = a * b;
  // the four members of the family; division only where the divisor is not zero
  const forms = [['mul', a, b], ['mul', b, a]];
  if (a !== 0) forms.push(['div', product, a]);
  if (b !== 0 && b !== a) forms.push(['div', product, b]);
  const [op, x, y] = opts.sum ? (opts.sum.op === '÷' ? ['div', opts.sum.n, opts.sum.d] : ['mul', opts.sum.a, opts.sum.b])
    : opts.form != null ? forms[opts.form % forms.length] : rng.pick(forms);

  if (op === 'mul') {
    const sum = { op: '×', a: x, b: y };
    const fits = methodsFor(skillId, sum);
    const method = fits.includes(opts.method) ? opts.method : fits[0];
    const steps = method ? METHODS[method].steps(sum) : [{ text: `${x} ${x === 1 ? 'lot' : 'lots'} of ${y} = ☐`, value: product }];
    return {
      skill: skillId, key, sum, method,
      ask: `${x} × ${y} = ☐`,
      say: `${x} times ${y}`,
      answer: { kind: 'number', value: product },
      // the last step keeps the way's working and ends on the fact: "So 7 × 8 = 40 + 16 = ☐"
      steps: steps.map((s, i, all) => (i === all.length - 1 ? { ...s, text: `So ${x} × ${y} = ${lowerFirst(s.text.replace(/\s*=\s*☐$/, ''))} = ☐`, value: product } : s)),
      picture: product > 0 && product <= 60 ? { type: 'array', rows: x, cols: y } : null,
      hint: hintOf(x, y, method),
      words: ['product', 'factor'],
    };
  }
  const quotient = product / y;
  const sum = { op: '÷', n: x, d: y };
  const fits = methodsFor(skillId, sum);
  const method = [opts.method, opts.divMethod].find((m) => fits.includes(m)) ?? fits[0];
  return {
    skill: skillId, key, sum, method,
    ask: `${fmt(x)} ÷ ${y} = ☐`,
    say: `${x} divided by ${y}`,
    answer: { kind: 'number', value: quotient },
    steps: METHODS[method].steps(sum),
    picture: x > 0 && x <= 60 ? { type: 'groups', groups: y, each: quotient, leftover: 0 } : null,
    hint: METHODS[method].hint(sum),
    words: method === 'halve' ? ['quotient', 'divisor', 'halve'] : ['quotient', 'divisor', 'fact family'],
  };
}

// A title or step in the middle of a sentence: "Ten lots, take one" as "ten lots, take one".
export const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);

// The hint after a first miss on x × y (x lots of y): about the step she did, never the fact itself or its answer
// (research 3.3). 0 and 1 have their own, whatever the way; else the way's own; a fact no way fits gets the plain route
// its table is known by: double for the 2s, tens for the 10s, half of the 10s for the 5s, else one lot fewer and one more.
function hintOf(x, y, method) {
  if (y === 0) return 'How many is any number of groups of nothing?';
  if (x === 0) return 'There are no groups at all. How many is that?';
  if (x === 1) return 'There is just one group. How many are in it?';
  if (y === 1) return 'There is just one in each group. How many groups are there?';
  if (method) return METHODS[method].hint({ op: '×', a: x, b: y });
  if (x === 2 || y === 2) {
    const n = x === 2 ? y : x;
    return `Double ${n} is ${n} + ${n}. What is that?`;
  }
  if (x === 10 || y === 10) return `× 10 makes each one a ten. How do you write ${x === 10 ? y : x} tens?`;
  if (x === 5) return `What is 10 × ${y}? Then cut it in half.`;
  if (y === 5) return `What is ${x} × 10? Then cut it in half.`;
  return `What is ${x - 1} × ${y}? Then add one more lot of ${y}.`;
}

function hintFor(item, given) {
  const [a, b] = parseKey(item.key);
  const g = Number(String(given).trim());
  if (item.ask.includes('×') && Number.isFinite(g) && (g === a + b)) {
    return `It looks like you added. × means "groups of": how many in ${a} groups of ${b}?`;
  }
  return null;
}

export default {
  skills: GROUPS,
  make,
  keys: (skillId) => KEYS[skillId].slice(),
  hintFor,
};
