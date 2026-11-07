// Written adding and subtracting, column by column from the ones (MA2-AR-01 / MA3-AR-01: "Use an algorithm
// with understanding"). Each step says what the carried or traded 1 means ("10 ones make 1 ten"), and some
// problems need no regrouping at all, so she has to look before she carries (IES 2021 p. 6: "once regrouping
// has been introduced... include some problems that do not require regrouping"). Then bigger numbers, three
// at a time, with an estimate first (MA3-AR-01: "add or subtract 3 or more numbers with different numbers of
// digits"; "Round to estimate"; "check errors using place value and estimation").
// addsub-written has ways (engine/methods.js: partitioning first, then the written method and counting up beside it,
// then taking away in parts, rounding and adjusting, and shifting both numbers; the column helpers live there too).
// opts.method works it that way where it can; the sums still come in every shape, and one that way cannot work (a
// subtraction with a trade, for partitioning; an addition, for counting up) is worked by the first of the skill's ways
// that can, with a first step that says so and why, so her way never hides part of the skill: subtracting with a trade
// must still come up, in columns. Rounding and shifting suit only a number taken away near a round one,
// so with one of them asked, about one sum in two is made to suit it. opts.also is a second way, and then the sum is one
// both fit, so the two can be set side by side; opts.sum asks for that very sum; a key (opts.key) keeps its shape;
// opts.op ('+' or '−') keeps the operation, so her own go after two ways side by side is the same as the sum they were
// shown on (js/runner.js compare). With no way asked, the written method, as before.

import { fmt } from '../check.js';
import { ONE, PLACES, roundTo } from './placevalue.js';
import { METHODS, addColumns, methodsOf, subColumns, wayFor } from '../methods.js';
import { withWays } from './ways.js';

const len = (n) => String(n).length;
const total = (list) => list.reduce((s, x) => s + x, 0);

// ---- addsub-written: two numbers with the same number of digits, regrouping chosen column by column ----

// a + b where exactly the columns in `carry` make 10 or more
function addPair(rng, d, carry) {
  let a = 0, b = 0, c = 0;
  for (let i = 0; i < d; i++) {
    const want = carry.has(i), lead = i === d - 1;
    let x, y;
    do {
      x = rng.int(lead ? 1 : 0, 9);
      y = rng.int(lead ? 1 : 0, 9);
    } while ((x + y + c >= 10) !== want);
    a += x * 10 ** i;
    b += y * 10 ** i;
    c = want ? 1 : 0;
  }
  return [a, b];
}

// t − b where exactly the columns in `borrow` need a trade, and the top digit is 0 in the columns in `zeros`
// (a trade across a zero); elsewhere a column that gives a trade has something to give
function subPair(rng, d, borrow, zeros) {
  for (;;) {
    let t = 0, b = 0, bi = 0;
    for (let i = 0; i < d; i++) {
      const want = borrow.has(i), lead = i === d - 1;
      let x, y;
      do {
        x = zeros.has(i) ? 0 : rng.int(lead ? 1 : 0, 9);
        y = rng.int(lead ? 1 : 0, 9);
      } while ((x - bi < y) !== want || (bi && !zeros.has(i) && x === 0));
      t += x * 10 ** i;
      b += y * 10 ** i;
      bi = want ? 1 : 0;
    }
    if (t !== b) return [t, b];
  }
}

const range = (n) => Array.from({ length: n }, (_, i) => i);

// across-zero layouts: 603 − 248, 4073 − 1258, 4003 − 1257, 5207 − 1340
const ZEROS = {
  3: [{ zeros: [1], borrow: [0, 1] }],
  4: [{ zeros: [1], borrow: [0, 1] }, { zeros: [1, 2], borrow: [0, 1, 2] }, { zeros: [2], borrow: [1, 2] }],
};

// The shape of a + b or a − b, as a key: 'add-3d-regroup-2', or 'sub-3d-zero' when a trade goes across a zero
function keyOf({ op, a, b }) {
  if (op === '+') {
    let k = 0;
    for (let p = 10; p <= 10 * Math.max(a, b); p *= 10) if ((a % p) + (b % p) >= p) k++;
    return `add-${len(a)}d-regroup-${k}`;
  }
  const trades = [];
  for (let p = 10; p <= a; p *= 10) if (a % p < b % p) trades.push(p);
  const zero = trades.some((p) => Math.floor(a / p) % 10 === 0);
  return `sub-${len(a)}d-${zero ? 'zero' : `regroup-${trades.length}`}`;
}

// The ways that suit only a number taken away 1 to 3 from a round one (engine/methods.js)
const NEAR_ROUND = ['compensate', 'level'];

// A subtraction with d digits whose number taken away is 1 to 3 from a round number: just under it for rounding and
// adjusting, either side for shifting both; with no trade where partitioning must work it too. Every way asked fits it.
function nearRound(rng, d, ways) {
  const lead = 10 ** (d - 1);
  for (;;) {
    const up = ways.includes('compensate') || rng.chance(0.5);
    const round = d === 2 ? 10 * rng.int(2, 9) : lead * rng.int(1, 9) + (lead / 10) * rng.int(0, 9);
    const b = up ? round - rng.int(1, 3) : round + rng.int(1, 3);
    if (b < lead) continue;
    let a = ways.includes('split')
      ? range(d).reduce((t, i) => t + rng.int(Math.floor(b / 10 ** i) % 10, 9) * 10 ** i, 0)
      : rng.int(up ? round : b + 1, 10 ** d - 1);
    // partitioning's digits, each at least b's, can still come out at b or under the round number: all 9s never do
    const sum = { op: '−', a, b };
    if (!ways.every((w) => METHODS[w].fits(sum))) a = 10 ** d - 1;
    return { op: '−', a, b };
  }
}

function writtenItem(skillId, rng, opts) {
  const ways = [opts.method, opts.also].filter((w) => w && METHODS[w]);
  const own = ways.filter((w) => methodsOf(skillId).includes(w));
  let sum, key;
  if (opts.sum) {
    sum = opts.sum;
    key = keyOf(sum);
  } else if (!opts.key && opts.op !== '+' && own.some((w) => NEAR_ROUND.includes(w)) && (opts.also || rng.chance(0.5))) {
    sum = nearRound(rng, opts.easy ? 2 : rng.pick([3, 4]), own);
    key = keyOf(sum);
  } else {
    let op, d, k, zero;
    const m = opts.key && opts.key.match(/^(add|sub)-(\d)d-(?:regroup-(\d)|zero)$/);
    // a 3-digit sum may carry into the thousands; a 4-digit one stays four digits; the top column never trades
    const places = (o, n) => (o === 'add' && n === 3 ? range(3) : range(n - 1));
    if (m) {
      [op, d, zero, k] = [m[1], Number(m[2]), m[3] === undefined, Number(m[3] || 0)];
    } else {
      // beside another way, a sum both fit: counting up and taking away in parts work a subtraction; partitioning one
      // with no trades
      const both = opts.also ? ways : [];
      op = { '+': 'add', '−': 'sub' }[opts.op] ?? (both.includes('count-up') || both.includes('take-parts') ? 'sub' : rng.pick(['add', 'sub']));
      d = opts.easy ? 2 : rng.pick([3, 4]);
      const plain = op === 'sub' && both.includes('split');
      zero = op === 'sub' && !plain && !opts.easy && rng.chance(0.2);
      // about one in four needs no regrouping, so she has to look first
      k = plain || zero || rng.chance(0.25) ? 0 : rng.int(1, places(op, d).length);
    }
    let a, b;
    if (op === 'add') {
      [a, b] = addPair(rng, d, new Set(rng.shuffle(places(op, d)).slice(0, k)));
    } else if (zero) {
      const z = rng.pick(ZEROS[d]);
      [a, b] = subPair(rng, d, new Set(z.borrow), new Set(z.zeros));
    } else {
      [a, b] = subPair(rng, d, new Set(rng.shuffle(places(op, d)).slice(0, k)), new Set());
    }
    sum = { op: op === 'add' ? '+' : '−', a, b };
    key = `${op}-${d}d-${zero ? 'zero' : `regroup-${k}`}`;
  }
  const { op, a, b } = sum;
  const { method, steps } = ways.length ? wayFor(skillId, sum, ways[0]) : { method: 'column', steps: METHODS.column.steps(sum) };
  const way = METHODS[method];
  return {
    skill: skillId, key, sum, method,
    ask: `${fmt(a)} ${op} ${fmt(b)} = ☐`,
    say: `${a} ${op === '+' ? 'plus' : 'minus'} ${b}`,
    answer: { kind: 'number', value: op === '+' ? a + b : a - b },
    steps,
    picture: way.picture(sum),
    hint: way.hint(sum),
    words: way.words(sum),
  };
}

// ---- addsub-multi: bigger numbers, three addends, and estimating first ----
// Its ways (engine/items/ways.js; plans/2026-10-25-two-ways-plan.md): the way she learned is the written method; adding
// place by place, biggest first, works the additions, and counting up the subtractions, with the estimate first kept as
// it is (survey l.118–120). Each fits every problem of its operation; a way set beside another (opts.also) is drawn a
// kind it is for.
const MULTI = ['add-three', 'sub-big', 'estimate-add', 'estimate-sub'];
const KINDS = { 'place-parts': ['add-three', 'estimate-add'], 'count-up-big': ['sub-big', 'estimate-sub'] };
const ofLength = (rng, d) => rng.int(10 ** (d - 1), 10 ** d - 1);

// Adding place by place, biggest first, every number's part of a place at once: 4352 + 718 + 46 is 300 + 700, then
// 50 + 10 + 40, then 2 + 8 + 6, then the parts put together (survey l.118); a part only one number has goes straight
// into putting the parts together, as partitioning does (engine/methods.js split)
function byPlace(nums) {
  const steps = [], parts = [];
  for (let i = Math.max(...nums.map(len)) - 1; i >= 0; i--) {
    const here = nums.map((n) => (Math.floor(n / 10 ** i) % 10) * 10 ** i).filter(Boolean);
    if (here.length > 1) steps.push({ text: `Add the ${PLACES[i]}: ${here.map(fmt).join(' + ')} = ☐`, value: total(here) });
    if (here.length) parts.push(total(here));
  }
  const value = total(nums);
  steps.push(parts.length > 1 ? { text: `Put the parts together: ${parts.map(fmt).join(' + ')} = ☐`, value, answer: true }
    : { text: `So ${nums.map(fmt).join(' + ')} = ☐`, value, answer: true });
  return steps;
}

function multiItem(skillId, rng, opts) {
  return withWays(skillId, rng, opts, (r, draw) => multiProblem(skillId, r, draw));
}

function multiProblem(skillId, rng, opts) {
  const key = opts.key || rng.pick(KINDS[opts.want] ?? MULTI);
  const easy = opts.easy;
  let nums;
  if (key === 'add-three') {
    nums = easy ? [rng.int(10, 45), rng.int(10, 45), rng.int(2, 9)]
      : rng.pick([[4, 3, 2], [4, 3, 1], [5, 4, 3], [5, 3, 2], [6, 4, 3], [6, 5, 2]]).map((d) => ofLength(rng, d));
    nums = rng.shuffle(nums);
  } else if (key === 'estimate-add') {
    // no number much smaller than the rest, so none rounds to 0
    nums = easy ? [rng.int(11, 32), rng.int(11, 32), rng.int(11, 32)]
      : rng.shuffle(rng.pick([[4, 4, 3], [4, 3, 3], [5, 4, 4], [5, 5, 4]]).map((d) => ofLength(rng, d)));
  } else if (key === 'sub-big') {
    const td = easy ? 3 : rng.pick([5, 6]);
    const top = ofLength(rng, td);
    let bottom;
    do bottom = easy ? rng.int(10, 99) : ofLength(rng, rng.int(3, td)); while (bottom >= top);
    nums = [top, bottom];
  } else {
    // a top number starting with 2 or more keeps the estimate above 0
    const td = easy ? 3 : rng.pick([5, 6]);
    nums = [rng.int(2 * 10 ** (td - 1), 10 ** td - 1), ofLength(rng, td - 1)];
  }
  const add = key === 'add-three' || key === 'estimate-add';
  const sym = add ? '+' : '−';
  const expr = nums.map(fmt).join(` ${sym} `);
  const value = add ? total(nums) : nums[0] - nums[1];
  const steps = [];
  let est = null;
  if (key.startsWith('estimate')) {
    // round to the place below the biggest number's first digit: 4879 + 2106 + 389 -> nearest hundred
    const p = Math.max(10, 10 ** (len(Math.max(...nums)) - 2));
    const rounded = nums.map((n) => roundTo(n, p).value);
    est = add ? total(rounded) : rounded[0] - rounded[1];
    steps.push({ text: `Estimate first: round each number to the nearest ${ONE[len(p) - 1]}.` });
    nums.forEach((n, i) => steps.push({ text: `${fmt(n)} rounds to ☐`, value: rounded[i] }));
    steps.push({ text: `Estimate: ${rounded.map(fmt).join(` ${sym} `)} = ☐`, value: est });
  }
  const first = [...steps];
  if (new Set(nums.map(len)).size > 1) steps.push({ text: 'Line the numbers up by place value: ones under ones, tens under tens.' });
  const work = add ? addColumns(nums) : subColumns(nums[0], nums[1]);
  steps.push(...work.steps);
  steps.push({ text: `So ${expr} = ☐${est === null ? '' : `. Is it close to the estimate, ${fmt(est)}?`}`, value });
  const said = nums.join(add ? ' plus ' : ' minus ');
  // the second ways: the estimate's steps first, as they are, and its question on the last step
  const close = (st) => (est === null ? st : { ...st, text: `${st.text}. Is it close to the estimate, ${fmt(est)}?` });
  const then = (own) => [...first, ...own.slice(0, -1), close({ ...own.at(-1), answer: true })];
  const countUp = METHODS['count-up'], sum = { op: '−', a: nums[0], b: nums[1] };
  const ways = add
    ? { 'place-parts': () => ({
      steps: then(byPlace(nums)),
      hint: est !== null ? 'Is your answer close to your estimate? If it is not, did you add every place?' : 'Did you add every place, biggest first, then put the parts together?',
      words: est !== null ? ['estimate', 'round', 'partition'] : ['partition', 'sum', 'place value'],
    }) }
    : { 'count-up-big': () => ({
      steps: then(countUp.steps(sum)),
      picture: countUp.picture(sum),
      hint: est !== null ? 'Is your answer close to your estimate? If it is not, did you add up every jump?' : countUp.hint(sum),
      words: est !== null ? ['estimate', 'round', 'number line'] : countUp.words(sum),
    }) };
  return {
    skill: skillId, key,
    ask: est === null ? `${expr} = ☐` : `Estimate first, then work it out: ${expr} = ☐`,
    say: est === null ? said : `Estimate first, then work out ${said}`,
    answer: { kind: 'number', value },
    steps,
    // the columns picture holds two numbers, so three addends go without it
    picture: add ? null : { type: 'columns', op: '−', top: nums[0], bottom: nums[1], carries: work.carries },
    hint: est !== null ? 'Is your answer close to your estimate? If it is not, which column could have gone wrong?'
      : add ? 'Did you line them up, ones under ones? When a column made 10 or more, did you carry into the next column?'
        : 'Did you line them up, ones under ones? Where a top digit was too small, did you trade from the next column?',
    words: est !== null ? ['estimate', 'round', 'place value'] : add ? ['sum', 'regroup', 'place value'] : ['difference', 'regroup', 'place value'],
    ways,
  };
}

export default {
  skills: ['addsub-written', 'addsub-multi'],
  make(skillId, rng, opts = {}) {
    if (skillId === 'addsub-written') return writtenItem(skillId, rng, opts);
    return multiItem(skillId, rng, opts);
  },
};
