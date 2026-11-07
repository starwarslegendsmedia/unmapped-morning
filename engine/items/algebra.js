// Number sentences with more than one operation, brackets and the order of operations, and rules from
// tables of values. NSW MA3-MR-02: "Complete number sentences that involve more than one operation by
// calculating missing numbers"; "Identify and use inverse operations to assist with the solution of
// number sentences"; "Use grouping symbols ()"; "Determine a rule describing the relationship between the
// bottom number and the top number in a table".
// eq-multi-op has ways (engine/methods.js): working backwards first, as release 1 did, then guess, check and improve,
// which fits only a box that is multiplied or added to and where a first guess of 5 works out. A sentence is
// { op: '=', shape, a, b, r }, r its right side; opts.method, opts.also and opts.sum as in engine/items/equals.js, with
// the draws made before the ways, so working backwards gives the items it gave.
// eq-order-ops and eq-patterns build their own steps, the way she learned, with a second way beside them where one fits
// (engine/items/ways.js; plans/2026-10-25-two-ways-plan.md): sharing the multiplying over the brackets, or taking out the
// number two products share; jumping from a row she knows; dividing a row by its number where nothing is added.

import { METHODS, methodsOf, multiLeft, wayFor, MULTI_LEFT, GUESSED } from '../methods.js';
import { withWays } from './ways.js';

const WORDS = { '+': 'plus', '−': 'take away', '×': 'times', '÷': 'divided by', '(': 'open bracket', ')': 'close bracket' };
const sayIt = (text) => text.replace(/[+−×÷()]/g, (c) => ` ${WORDS[c]} `).replace(/☐/g, 'what').replace(/=/g, 'equals').replace(/\s+/g, ' ').trim();

// the shapes, and those guess, check and improve can take, as engine/methods.js keeps them (in the order drawn from)
const SHAPES = Object.keys(MULTI_LEFT);
const GUESSABLE = Object.keys(GUESSED);

function multiOpSum(rng, opts, shapes) {
  const top = opts.easy ? 5 : 10; // factors within 10 × 10
  const add = opts.easy ? 10 : 20;
  const shape = rng.pick(shapes);
  const r = (lo, hi) => rng.int(lo, hi);
  const of = (a, b, right) => ({ op: '=', shape, a, b, r: right });
  switch (shape) {
    case 'a×?+b': {
      const a = r(2, top), b = r(1, add), x = r(2, top);
      return of(a, b, a * x + b);
    }
    case 'b+?×a': {
      const a = r(2, top), b = r(1, add), x = r(2, top);
      return of(a, b, b + x * a);
    }
    case '?×a−b': {
      const a = r(2, top), x = r(2, top);
      const b = r(1, a * x - 1);
      return of(a, b, a * x - b);
    }
    case '?÷a+b': {
      const a = r(2, top), q = r(2, top), b = r(1, add);
      return of(a, b, q + b);
    }
    case '?÷a−b': {
      const a = r(2, top), q = r(3, top), b = r(1, q - 1);
      return of(a, b, q - b);
    }
    case '(?+a)×b': {
      // ☐ + a is itself a factor, so it stays within 10 too
      const s = r(3, top), a = r(1, s - 1), b = r(2, top);
      return of(a, b, s * b);
    }
    case '(?−a)×b': {
      const s = r(2, top), a = r(1, top), b = r(2, top);
      return of(a, b, s * b);
    }
    case '(?+a)÷b': {
      const b = r(2, top), q = r(2, top), a = r(1, b * q - 1);
      return of(a, b, q);
    }
    default: { // 'c−a×?', as in 20 − 2 × ☐ = 8, with c kept in b
      const a = r(2, top), d = r(1, add), x = r(1, top);
      return of(a, a * x + d, d);
    }
  }
}

// one guess, check and improve suits (and any other way asked)
function guessSum(rng, opts, ways) {
  for (let i = 0; i < 200; i++) {
    const sum = multiOpSum(rng, opts, GUESSABLE);
    if (ways.every((w) => METHODS[w].fits(sum))) return sum;
  }
  return multiOpSum(rng, opts, SHAPES);
}

// the missing number, each operation undone in turn: working backwards' last step (tests/oracle checks it apart)
const solved = (sum) => METHODS.backwards.steps(sum).filter((s) => 'value' in s).at(-1).value;

function multiOpItem(skillId, rng, opts) {
  const ways = [opts.method, opts.also].filter((w) => methodsOf(skillId).includes(w));
  const guess = ways.includes('guess-check') && (Boolean(opts.also) || rng.chance(0.5));
  const sum = opts.sum ?? (guess ? guessSum(rng, opts, ways) : multiOpSum(rng, opts, SHAPES));
  const ask = `${multiLeft(sum, '☐')} = ${sum.r}`;
  const { method, steps } = wayFor(skillId, sum, opts.method);
  const [left, right] = ask.split(' = ');
  return {
    skill: skillId, key: sum.shape, sum, method,
    ask, say: sayIt(ask),
    answer: { kind: 'number', value: solved(sum) },
    steps,
    picture: { type: 'balance', left, right },
    hint: METHODS[method].hint(sum),
    words: METHODS[method].words(sum),
  };
}

// Order of operations: brackets first, then × and ÷, then + and −, each left to right.
const MD_FIRST = '× and ÷ before + and −';

// NESA citations below: NSW Mathematics K–10 Syllabus (2022), the saved copies of 10 October 2026, checked live on 25 October
// 2026 (plans/2026-10-25-two-ways-survey.md).
// The second way, sharing the multiplying (survey, eq-order-ops; NESA "Use the distributive property with partial
// products", MA3-MR-01, Stage 3 MR-A l.55): over the brackets, each number in them times the number outside, then the two put together;
// or, the reverse, two products with a number in common take it out ("3 × 7 + 5 × 7 = (3 + 5) × 7").
const SHARE_WORDS = ['brackets', 'product'];
const shareOver = (x, y, sign, c) => ({
  steps: [
    { text: `Multiply each number in the brackets by ${c}: ${x} × ${c} = ☐`, value: x * c },
    { text: `${y} × ${c} = ☐`, value: y * c },
    { text: `${x * c} ${sign} ${y * c} = ☐`, value: sign === '+' ? x * c + y * c : x * c - y * c, answer: true },
  ],
  hint: `Can you multiply each number in the brackets by the number outside them, then ${sign === '+' ? 'add the two' : 'take the second from the first'}?`,
});
function takeOut(expr, a, b, c, d) {
  const x = [a, b].find((n) => [c, d].includes(n));
  if (x === undefined) return { noShare: true };
  const p = x === a ? b : a, q = x === c ? d : c;
  return { share: {
    steps: [
      { text: `Both products have ${x} in them, so ${expr} = (${p} + ${q}) × ${x}.` },
      { text: `${p} + ${q} = ☐`, value: p + q },
      { text: `${p + q} × ${x} = ☐`, value: (p + q) * x, answer: true },
    ],
    hint: 'Which number is in both products? Can you add the other two first, then multiply?',
  } };
}

function orderParts(shape, rng, opts) {
  const top = opts.easy ? 5 : 10;
  const add = opts.easy ? 20 : 50;
  const r = (lo, hi) => rng.int(lo, hi);
  switch (shape) {
    case 'a+b×c': {
      const a = r(1, add), b = r(2, top), c = r(2, top);
      return { expr: `${a} + ${b} × ${c}`, wrong: (a + b) * c,
        steps: [{ text: `${MD_FIRST}: ${b} × ${c} = ☐`, value: b * c }, { text: `${a} + ${b * c} = ☐`, value: a + b * c }] };
    }
    case 'a−b×c': {
      const b = r(2, top), c = r(2, top), a = b * c + r(1, add);
      return { expr: `${a} − ${b} × ${c}`, wrong: (a - b) * c,
        steps: [{ text: `${MD_FIRST}: ${b} × ${c} = ☐`, value: b * c }, { text: `${a} − ${b * c} = ☐`, value: a - b * c }] };
    }
    case 'a+b÷c': {
      const c = r(2, top), q = r(2, top), a = r(1, add);
      return { expr: `${a} + ${c * q} ÷ ${c}`,
        steps: [{ text: `${MD_FIRST}: ${c * q} ÷ ${c} = ☐`, value: q }, { text: `${a} + ${q} = ☐`, value: a + q }] };
    }
    case 'a−b÷c': {
      const c = r(2, top), q = r(2, top), a = q + r(1, add);
      return { expr: `${a} − ${c * q} ÷ ${c}`,
        steps: [{ text: `${MD_FIRST}: ${c * q} ÷ ${c} = ☐`, value: q }, { text: `${a} − ${q} = ☐`, value: a - q }] };
    }
    case '(a+b)×c': {
      const s = r(3, top), a = r(1, s - 1), c = r(2, top);
      return { expr: `(${a} + ${s - a}) × ${c}`, wrong: a + (s - a) * c,
        steps: [{ text: `Brackets first: ${a} + ${s - a} = ☐`, value: s }, { text: `${s} × ${c} = ☐`, value: s * c }],
        share: shareOver(a, s - a, '+', c) };
    }
    case '(a−b)×c': {
      const s = r(2, top), b = r(1, top), c = r(2, top);
      return { expr: `(${s + b} − ${b}) × ${c}`,
        steps: [{ text: `Brackets first: ${s + b} − ${b} = ☐`, value: s }, { text: `${s} × ${c} = ☐`, value: s * c }],
        share: shareOver(s + b, b, '−', c) };
    }
    case 'a÷(b−c)': {
      const s = r(2, top), q = r(2, top), c = r(1, top);
      return { expr: `${s * q} ÷ (${s + c} − ${c})`,
        steps: [{ text: `Brackets first: ${s + c} − ${c} = ☐`, value: s }, { text: `${s * q} ÷ ${s} = ☐`, value: q }] };
    }
    case 'a×b+c×d': {
      // to share the multiplying, the second product takes a number of the first's (opts.want)
      const a = r(2, top), b = r(2, top), c = r(2, top), d = opts.want === 'share' ? rng.pick([a, b]) : r(2, top);
      const expr = `${a} × ${b} + ${c} × ${d}`;
      return { expr, steps: [
        { text: `${MD_FIRST}, left to right: ${a} × ${b} = ☐`, value: a * b },
        { text: `${c} × ${d} = ☐`, value: c * d },
        { text: `${a * b} + ${c * d} = ☐`, value: a * b + c * d },
      ], ...takeOut(expr, a, b, c, d) };
    }
    case 'a−b+c': {
      // not "+ before −": with only + and −, left to right
      const b = r(2, add), a = b + r(1, add), c = r(2, add);
      return { expr: `${a} − ${b} + ${c}`,
        steps: [{ text: `Only + and −, so left to right: ${a} − ${b} = ☐`, value: a - b }, { text: `${a - b} + ${c} = ☐`, value: a - b + c }] };
    }
    default: { // 'a÷b×c'
      const b = r(2, top), q = r(2, top), c = r(2, top);
      return { expr: `${b * q} ÷ ${b} × ${c}`,
        steps: [{ text: `Only × and ÷, so left to right: ${b * q} ÷ ${b} = ☐`, value: q }, { text: `${q} × ${c} = ☐`, value: q * c }] };
    }
  }
}

const ORDER_SHAPES = ['a+b×c', 'a−b×c', 'a+b÷c', 'a−b÷c', '(a+b)×c', '(a−b)×c', 'a÷(b−c)', 'a×b+c×d', 'a−b+c', 'a÷b×c'];
const WHICH_SHAPES = ['a+b×c', 'a−b×c', '(a+b)×c'];
const ORDER_KEYS = [...ORDER_SHAPES, ...WHICH_SHAPES.map((s) => `which ${s}`)];

// opts as engine/items/ways.js passes them (draw): opts.key makes that kind (her own go after two ways side by side,
// js/runner.js compare), else one at random by the draws made before the ways; opts.want as in orderParts
function orderOpsItem(skillId, rng, opts) {
  const key = ORDER_KEYS.includes(opts.key) ? opts.key : null;
  // which of two answers is right: the one by the rules, or the usual mistake (straight through left to
  // right, or ignoring the brackets); typing where the brackets go is too hard on a phone
  if (key ? key.startsWith('which ') : rng.chance(0.25)) {
    const shape = key ? key.slice('which '.length) : rng.pick(WHICH_SHAPES);
    const { expr, steps, wrong, share } = orderParts(shape, rng, opts);
    const right = steps[steps.length - 1].value;
    const [lo, hi] = [right, wrong].sort((p, q) => p - q).map(String);
    const end = { text: `So ${expr} = ${right}, not ${wrong}.` };
    return {
      skill: skillId, key: `which ${shape}`,
      ask: `Which is right: ${expr} = ${lo} or ${hi}?`,
      say: `Which is right: ${sayIt(expr)} equals ${lo}, or ${hi}?`,
      answer: { kind: 'choice', options: [lo, hi], value: String(right) },
      steps: [...steps, end],
      picture: null,
      hint: 'Which part is worked out first? Brackets, then × and ÷, then + and −.',
      words: ['order of operations', 'brackets'],
      ways: share ? { share: () => ({ steps: [...share.steps, end], hint: share.hint, words: SHARE_WORDS }) } : {},
    };
  }
  const shape = key ?? rng.pick(ORDER_SHAPES);
  const { expr, steps, share, noShare } = orderParts(shape, rng, opts);
  const value = steps[steps.length - 1].value;
  const end = { text: `So ${expr} = ☐`, value };
  return {
    skill: skillId, key: shape,
    ask: `${expr} = ☐`,
    say: sayIt(expr),
    answer: { kind: 'number', value },
    steps: [...steps, end],
    picture: null,
    hint: 'Did you do the brackets first, then × and ÷, then + and −? Go left to right within each.',
    words: ['order of operations', 'brackets'],
    ways: share ? { share: () => ({ steps: [...share.steps, end], hint: share.hint, words: SHARE_WORDS }) } : {},
    why: noShare ? { share: 'the two products share no number' } : {},
  };
}

// Rules from a table of values: the number goes up by the same amount each time, so the rule is
// "× that amount, then add something" (n → a × n + b, a 2–6, b 0–5; b is 0 in about one table in six, a pattern of
// multiples). Every question is worked by the rule, × then +, never by adding the gap to the number before: MA3-MR-02,
// "Describe a pattern formed by multiples in words, in terms of multiplication rather than addition"; "Determine a rule
// describing the relationship between the bottom number and the top number in a table" (MA3-MR-02, Stage 3 MR-B, l.63-64,
// https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-3/fa1ff4d43b;
// NSW Mathematics K–10 Syllabus (2022), checked 25 October 2026). The draws are the ones made before stage 5, so each seed makes the
// table and the answer it made.
const PATTERNS = [
  {
    head: ['Shapes', 'Sticks'], say: 'A matchstick pattern. The table shows how many sticks each number of shapes needs.',
    next: (n) => `How many sticks are needed for ${n} shapes?`,
    rule: (b) => `The rule: number of sticks = number of shapes × ☐${b ? ` + ${b}` : ''}.`,
    first: (a) => `For 1 shape, 1 × ${a} = ${a} sticks.`,
    at: (n) => `For ${n} shapes`,
  },
  {
    head: ['Position', 'Number'], say: 'A number pattern. The table shows the number at each position.',
    next: (n) => `What number is at position ${n}?`,
    rule: (b) => `The rule: number = position × ☐${b ? ` + ${b}` : ''}.`,
    first: (a) => `At position 1, 1 × ${a} = ${a}.`,
    at: (n) => `At position ${n}`,
  },
];

const PATTERN_KINDS = ['next', 'tenth', 'missing', 'multiplier'];

// The second ways (survey, eq-patterns): jump from the nearest row she knows below the one asked, the rows on × the gap
// (NESA "in terms of multiplication rather than addition", MA3-MR-02, Stage 3 MR-B l.63), for every kind but the rule's × number; and,
// for that, divide a row by its number, only where nothing is added. opts as engine/items/ways.js passes them (draw):
// opts.key makes that kind; opts.want draws only the kinds that way is for (so a way set beside the other is never left
// on a kind only the other fits, js/runner.js compare), and for 'divide-row' a rule that adds nothing.
function patternsItem(skillId, rng, opts) {
  const a = opts.easy ? rng.int(2, 4) : rng.int(2, 6);
  const b = opts.want === 'divide-row' ? 0 : opts.easy ? rng.int(0, 3) : rng.int(0, 5);
  const p = rng.pick(PATTERNS);
  const v = (n) => a * n + b;
  const kinds = { 'jump-rows': ['next', 'tenth', 'missing'], 'divide-row': ['multiplier'] }[opts.want] ?? PATTERN_KINDS;
  const q = PATTERN_KINDS.map((k) => `pattern-${k}`).includes(opts.key) ? opts.key.slice('pattern-'.length) : rng.pick(kinds);
  // from row n0 of the table to row n, with no box for the row she sees ("jump-rows' steps, exact", the plan)
  const jump = (n, n0) => () => {
    const k = n - n0;
    return {
      steps: [
        { text: `Start from row ${n0} in the table: it is ${v(n0)}.` },
        { text: `${n} is ${k} ${k === 1 ? 'row' : 'rows'} on, so add ${k} × ${a} = ☐`, value: k * a },
        { text: `${v(n0)} + ${k * a} = ☐`, value: v(n), answer: true },
      ],
      hint: 'How much does it go up by each row, and how many rows on is the one asked?',
      words: ['pattern', 'table of values'],
    };
  };
  let ways = {}, why = {};
  // the rule's × number from two rows next to each other, then what is added, from the first row
  const times = (n) => ({ text: `What is it multiplied by? It goes up by the same each time: ${v(n + 1)} − ${v(n)} = ☐`, value: a });
  const added = b ? { text: `${p.first(a)} What is added? ${v(1)} − ${a} = ☐`, value: b } : { text: `${p.first(a)} Nothing is added: the rule is × ${a}.` };
  // the rule used on row n: × a, then + b
  const use = (n) => (b ? [{ text: `The rule is × ${a}, then add ${b}. ${p.at(n)}: ${n} × ${a} = ☐`, value: n * a }, { text: `${n * a} + ${b} = ☐`, value: v(n) }]
    : [{ text: `${p.at(n)}: ${n} × ${a} = ☐`, value: v(n) }]);
  let rows = [1, 2, 3, 4].map((n) => [n, v(n)]);
  let ask, value, steps;
  if (q === 'next' || q === 'tenth') {
    // the next row, or row 10, which counting on would take six steps to reach
    const n = q === 'next' ? 5 : 10;
    ask = p.next(n);
    value = v(n);
    steps = [times(1), added, ...use(n)];
    ways = { 'jump-rows': jump(n, 4) };
  } else if (q === 'missing') {
    const m = rng.int(2, 4);
    rows = [1, 2, 3, 4, 5].map((n) => [n, n === m ? '?' : v(n)]);
    ask = 'What number is missing from the table?';
    value = v(m);
    steps = [times(m === 2 ? 3 : 1), added, ...use(m)];
    ways = { 'jump-rows': jump(m, m - 1) };
  } else {
    ask = p.rule(b);
    value = a;
    steps = [times(2), { text: `Check the rule on row 1: 1 × ☐${b ? ` + ${b}` : ''} = ${v(1)}`, value: a }];
    if (b) why = { 'divide-row': 'something is added in this rule, so dividing a row gives the wrong number' };
    else {
      ways = { 'divide-row': () => ({
        steps: [{ text: `Row 4 has ${v(4)}: ${v(4)} ÷ 4 = ☐`, value: a, answer: true }, { text: `Check on row 2: 2 × ☐ = ${v(2)}`, value: a }],
        hint: 'Nothing is added in this rule: what is the number in a row divided by its row number?',
        words: ['pattern', 'rule', 'multiple'],
      }) };
    }
  }
  return {
    skill: skillId, key: `pattern-${q}`,
    ask, say: `${p.say} ${ask.replace('☐', 'what')}`,
    answer: { kind: 'number', value },
    steps,
    picture: { type: 'table', head: p.head, rows },
    // nothing added: the rule is × alone, so the hint does not ask what is added
    hint: b ? 'What is the rule: × what, then add what? Does it work on every row of the table?' : 'What is the rule: × what? Does it work on every row of the table?',
    words: ['pattern', 'rule', 'table of values'],
    ways, why,
  };
}

export default {
  skills: ['eq-multi-op', 'eq-order-ops', 'eq-patterns'],
  make(skillId, rng, opts = {}) {
    if (skillId === 'eq-multi-op') return multiOpItem(skillId, rng, opts);
    if (skillId === 'eq-order-ops') return withWays(skillId, rng, opts, (r, draw) => orderOpsItem(skillId, r, draw));
    return withWays(skillId, rng, opts, (r, draw) => patternsItem(skillId, r, draw));
  },
};
