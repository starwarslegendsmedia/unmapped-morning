// Ways to work a sum, kept as data (decided 17 October 2026: more than one way to do the maths, more of them as it
// gets more complex, and changeable as time goes on).
// A skill lists its ways in engine/skills.js (`methods`), the first taught first. Each way here has a short name, says
// which sums it fits, and builds the worked steps, picture, hint and words for any sum it fits, so the generators
// choose the numbers and the way works them. Adding a way is one entry here and its id on a skill.
//
// A sum: { op: '×', a, b } for a × b, { op: '+', a, b } or { op: '−', a, b } for a + b or a − b, or { op: '÷', n, d }
// for n ÷ d. steps(sum) -> [{ text, value? }] as in engine/items/index.js; the last step with a value gives the answer
// (the remainder, if there is one).
//
// How the game uses them (research 4.1 to 4.3): a new skill is taught its first way only (4.2), on every sum that way
// can work (one it cannot, as a subtraction with a trade for partitioning, takes the first way that can, and says so
// and why first: wayFor); once it is
// learned, the game shows her a second way beside hers on the same sum, says which takes fewer steps and lets her choose (4.1;
// one per session, never on a day something new starts: 6.8); her choice and how right and quick she is with each
// way are kept; if her way slips (under 60% of her last five since she chose), the other way is offered again (4.3).
// A facts skill's ways are bridges to remembering the fact, so a facts skill is never offered again: its measure is
// her speed on each fact. If she keeps a way other than the one school asks for (a skill's `school` way), school's
// way still comes up in one warm-up in three (reviewMethod), since that is the way school marks.

import { fmt } from './check.js';
import { PLACES as PLACE_NAMES, ONE, roundTo, unit } from './items/placevalue.js';
import { BY_ID, SKILLS, topoOrder } from './skills.js';
import { middle } from './speed.js';
import { DEC_ONE, DEC_PLACES, andList, countOf, decParts, decimalText, inOrder, partText, placesOf, signOf, splitDecimal, thOf, timesOf, worthOf } from './items/decimals.js';
import { FRACTION_WAYS, fractionEstimateStep, relatedSum } from './fraction-ways.js';
import { PERCENT_WAYS } from './percent-ways.js';
import { MEASURE_WAYS } from './measure-ways.js';
import { GEOMETRY_WAYS } from './geometry-ways.js';

const PLACES = ['Ones', 'Tens', 'Hundreds', 'Thousands'];

// 347 -> [300, 40, 7]: the place-value parts, leaving out zeros
export function partsOf(n) {
  const s = String(n);
  return s.split('').map((d, i) => Number(d) * 10 ** (s.length - 1 - i)).filter((p) => p > 0);
}

const long = ({ a, b }) => a >= 10 || b >= 10;

// Which number is split, or written on top, and which it is multiplied by: a one-digit factor multiplies the other;
// with two longer numbers the first is multiplied by the second (47 × 23: 47 × 20 and 47 × 3).
function roles({ a, b }) {
  if (a < 10) return { big: b, by: a };
  if (b < 10) return { big: a, by: b };
  return { big: a, by: b, both: true };
}

// ---- multiplying bigger numbers ----

const partition = {
  op: '×', title: 'Split by place value',
  fits: long,
  steps(sum) {
    const { big, by, both } = roles(sum);
    if (both) {
      const parts = partsOf(by);
      return [{ text: `Partition ${by} into ${parts.join(' + ')}.` },
        ...parts.map((p) => ({ text: `${fmt(big)} × ${p} = ☐`, value: big * p })),
        { text: `Add the parts: ${parts.map((p) => fmt(big * p)).join(' + ')} = ☐`, value: big * by }];
    }
    const parts = partsOf(big);
    return [{ text: `Partition ${fmt(big)} into ${parts.map(fmt).join(' + ')}.` },
      ...parts.map((p) => ({ text: `${by} × ${fmt(p)} = ☐`, value: by * p })),
      { text: `Add the parts: ${parts.map((p) => fmt(by * p)).join(' + ')} = ☐`, value: big * by }];
  },
  picture: () => null,
  hint(sum) {
    const { big, by, both } = roles(sum);
    return both ? `Did you multiply ${fmt(big)} by every part of ${by}, and add the answers?` : `Did you multiply every part of ${fmt(big)} by ${by}, and add all the answers?`;
  },
  words: () => ['partition', 'product'],
};

const area = {
  op: '×', title: 'The area model',
  fits: long,
  steps({ a, b }) {
    const rows = partsOf(a), cols = partsOf(b);
    const cells = rows.flatMap((r) => cols.map((c) => r * c));
    const first = rows.length === 1
      ? `Split the rectangle: ${a} by ${cols.map(fmt).join(' + ')}.`
      : `Split both numbers by place: ${fmt(a)} = ${rows.map(fmt).join(' + ')} and ${fmt(b)} = ${cols.map(fmt).join(' + ')}.`;
    return [{ text: first },
      ...rows.flatMap((r) => cols.map((c) => ({ text: `${fmt(r)} × ${fmt(c)} = ☐`, value: r * c }))),
      { text: `${rows.length === 1 ? 'Add the areas' : `Add all ${cells.length} parts`}: ${cells.map(fmt).join(' + ')} = ☐`, value: a * b }];
  },
  picture: ({ a, b }) => ({ type: 'area', rowParts: partsOf(a), colParts: partsOf(b) }),
  hint({ a, b }) {
    const n = partsOf(a).length * partsOf(b).length;
    return partsOf(a).length === 1 ? 'Did you find the area of every part of the rectangle, and add them all?' : `Did you find all ${n} parts of the rectangle, and add every one?`;
  },
  words: ({ a }) => (partsOf(a).length === 1 ? ['area model', 'product'] : ['area model', 'partial product', 'product']),
};

const written = {
  op: '×', title: 'The written method',
  // by one digit, or by a two-digit number (two partial products)
  fits: (sum) => long(sum) && (Math.min(sum.a, sum.b) < 10 || sum.b < 100),
  steps(sum) {
    const { big, by, both } = roles(sum);
    if (both) {
      const ones = by % 10, tens = by - ones;
      return [
        { text: `Multiply by the ones: ${fmt(big)} × ${ones} = ☐`, value: big * ones },
        { text: `Multiply by the tens: ${fmt(big)} × ${tens} = ☐ (write a 0 in the ones place first)`, value: big * tens },
        { text: `Add the partial products: ${fmt(big * ones)} + ${fmt(big * tens)} = ☐`, value: big * by },
      ];
    }
    // column by column from the ones; carries[i] is what is carried into column i
    const ds = String(big).split('').reverse().map(Number);
    const carries = columnCarries(big, by);
    const steps = ds.map((digit, i) => {
      const carry = carries[i];
      const v = by * digit + carry;
      const said = `${by} × ${digit}${carry ? ` + ${carry} carried` : ''} = ☐`;
      if (i === ds.length - 1) return { text: `${PLACES[i]}: ${said}. Write it all down.`, value: v };
      return { text: `${PLACES[i]}: ${said}. Write ${v % 10}${v >= 10 ? `, carry ${Math.floor(v / 10)} to the ${PLACES[i + 1].toLowerCase()}` : ', nothing to carry'}.`, value: v };
    });
    steps.push({ text: `So ${sum.a} × ${fmt(sum.b)} = ☐`, value: big * by });
    return steps;
  },
  picture(sum) {
    const { big, by, both } = roles(sum);
    return both ? { type: 'columns', op: '×', top: big, bottom: by } : { type: 'columns', op: '×', top: big, bottom: by, carries: columnCarries(big, by) };
  },
  hint(sum) {
    const { by, both } = roles(sum);
    const tens = by - (by % 10);
    return both ? `When you multiplied by the ${tens / 10} in the tens place, did you multiply by ${tens}, not ${tens / 10}?` : 'After each column, did you add the number you carried?';
  },
  words: (sum) => (roles(sum).both ? ['algorithm', 'partial product', 'product'] : ['algorithm', 'product']),
};

function columnCarries(big, by) {
  const ds = String(big).split('').reverse().map(Number);
  const carries = [0];
  for (let i = 0; i < ds.length - 1; i++) carries.push(Math.floor((by * ds[i] + carries[i]) / 10));
  return carries;
}

// ---- multiplication facts, from a fact she already knows (IES 2021 p. 53). The first three are the ones release 1
// taught, in its order; "five lots" gives the 6s to 9s a second way. Each hint asks about the facts its steps build on,
// so a miss is met with the way she was just shown (research 3.3, 4.2). ----

const factPair = ({ a, b }) => [Math.max(a, b), Math.min(a, b)];
// a fact with 0 or 1 is its own rule, not a bridge from a bigger fact ("8 × 1 is double 4 × 1" teaches nothing)
const noZeroOne = ({ a, b }) => a > 1 && b > 1;

const tenTake = {
  op: '×', title: 'Ten lots, take one',
  fits: (sum) => noZeroOne(sum) && (sum.a === 9 || sum.b === 9),
  steps(sum) {
    const [x, y] = factPair(sum);
    const other = x === 9 ? y : x;
    return [
      { text: `9 × ${other} is ten lots of ${other}, take away one lot of ${other}.` },
      { text: `10 × ${other} = ☐`, value: 10 * other },
      { text: `${fmt(10 * other)} − ${other} = ☐`, value: 9 * other },
    ];
  },
  hint(sum) {
    const [x, y] = factPair(sum);
    const other = x === 9 ? y : x;
    return `What is 10 × ${other}? Then take one lot of ${other} away.`;
  },
};

const HALVES = [[8, 4], [6, 3], [4, 2]];
const double = {
  op: '×', title: 'Double a smaller fact',
  fits: (sum) => noZeroOne(sum) && HALVES.some(([big]) => sum.a === big || sum.b === big),
  steps(sum) {
    const [x, y] = factPair(sum);
    const [big, half] = HALVES.find(([n]) => x === n || y === n);
    const other = x === big ? y : x;
    return [
      { text: `${big} × ${other} is double ${half} × ${other}.` },
      { text: `${half} × ${other} = ☐`, value: half * other },
      { text: `Double ${fmt(half * other)} = ☐`, value: big * other },
    ];
  },
  hint(sum) {
    const [x, y] = factPair(sum);
    const [big, half] = HALVES.find(([n]) => x === n || y === n);
    return `What is ${half} × ${x === big ? y : x}? Then double it.`;
  },
};

const tenPlus = {
  op: '×', title: 'Ten lots, plus the rest',
  fits: (sum) => noZeroOne(sum) && [11, 12].includes(factPair(sum)[0]),
  steps(sum) {
    const [x, other] = factPair(sum);
    return [
      { text: `${x} × ${other} is 10 × ${other} plus ${x - 10} × ${other}.` },
      { text: `10 × ${other} = ☐`, value: 10 * other },
      { text: `${x - 10} × ${other} = ☐`, value: (x - 10) * other },
      { text: `${fmt(10 * other)} + ${fmt((x - 10) * other)} = ☐`, value: x * other },
    ];
  },
  hint(sum) {
    const [x, other] = factPair(sum);
    return `What are 10 × ${other} and ${x - 10} × ${other}? Add them.`;
  },
};

// 6 to 9 lots as five lots and the rest: 7 × 8 = 5 × 8 + 2 × 8. Not for a fact with 0, 1, 2 or 10, which have a
// plainer way (none, doubling, a zero on the end).
const FIVE_PLUS = [6, 7, 8, 9];
function fiveSplit({ a, b }) {
  for (const f of FIVE_PLUS) {
    const o = a === f ? b : b === f ? a : null;
    if (o != null && ![0, 1, 2, 10].includes(o)) return [f, o];
  }
  return null;
}
const fivePlus = {
  op: '×', title: 'Five lots, plus the rest',
  fits: (sum) => fiveSplit(sum) != null,
  steps(sum) {
    const [f, o] = fiveSplit(sum);
    return [
      { text: `${f} × ${o} is 5 × ${o} plus ${f - 5} × ${o}.` },
      { text: `5 × ${o} = ☐`, value: 5 * o },
      { text: `${f - 5} × ${o} = ☐`, value: (f - 5) * o },
      { text: `${fmt(5 * o)} + ${fmt((f - 5) * o)} = ☐`, value: f * o },
    ];
  },
  hint(sum) {
    const [f, o] = fiveSplit(sum);
    return `What are 5 × ${o} and ${f - 5} × ${o}? Add them.`;
  },
};

// ---- the fact ways NESA names (Mathematics K–10 (2022), read 10 October 2026: Stage 2 MR-A
// https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-2/fa3feef933, Stage 2 MR-B
// .../stage-2/fad59f2055, Stage 3 MR-A .../stage-3/fafab309e2, line numbers as in the saved copies the teaching audit
// reads; teaching audit change 7). They follow the four above in a skill's list, so a fact one
// of those fits keeps it first and her history means the same; a fact none fits is taught first by its own table's
// way (× 2 double, × 10 tens, × 3 two lots and one more). Half of × 10 leads on 5 × 3 to 5 × 9, five lots and the rest
// after it. Each hint asks about the facts its steps build on, never the fact itself or its answer. ----

// the other factor of a fact with n in it (n itself for n × n)
const otherOf = ({ a, b }, n) => (a === n ? b : a);

// Doubling for × 2: "Relate doubling to multiplication facts for multiples of 2"; "doubling is multiplying by 2"
// (Stage 2 MR-A, l.53-54).
const doubleIt = {
  op: '×', title: 'Double it',
  fits: (sum) => noZeroOne(sum) && (sum.a === 2 || sum.b === 2),
  steps(sum) {
    const n = otherOf(sum, 2);
    return [{ text: `${sum.a} × ${sum.b} is double ${n}.` }, { text: `Double ${n} = ☐`, value: 2 * n }];
  },
  hint(sum) {
    const n = otherOf(sum, 2);
    return `Double ${n} is ${n} + ${n}. What is that?`;
  },
};

// × 10 makes each one a ten: "Use place value to rename groups of 10 to multiply" (Stage 2 MR-B, l.64).
const tens = {
  op: '×', title: 'Make tens',
  fits: (sum) => noZeroOne(sum) && (sum.a === 10 || sum.b === 10),
  steps(sum) {
    const n = otherOf(sum, 10);
    return [{ text: `${sum.a} × ${sum.b} is ${n} tens.` }, { text: `${n} tens = ☐`, value: 10 * n }];
  },
  hint: (sum) => `× 10 makes each one a ten. How do you write ${otherOf(sum, 10)} tens?`,
};

// × 5 as half of × 10, the 10 in the 5's place: "the relationship between one multiple and its double"; halving
// (Stage 2 MR-A, l.54-55).
const halfTen = {
  op: '×', title: 'Half of × 10',
  fits: (sum) => noZeroOne(sum) && (sum.a === 5 || sum.b === 5),
  // first on 5 × 3 to 5 × 9; 2 × 5 stays double it, 5 × 10 tens, 5 × 11 and 5 × 12 ten lots plus the rest
  leads: ({ a, b }) => (a === 5 || b === 5) && Math.min(a, b) >= 3 && Math.max(a, b) <= 9,
  steps({ a, b }) {
    const ten = a === 5 ? `10 × ${b}` : `${a} × 10`, whole = 10 * (a === 5 ? b : a);
    return [{ text: `${a} × ${b} is half of ${ten}.` }, { text: `${ten} = ☐`, value: whole }, { text: `Half of ${fmt(whole)} = ☐`, value: whole / 2 }];
  },
  hint: ({ a, b }) => `What is ${a === 5 ? `10 × ${b}` : `${a} × 10`}? Then cut it in half.`,
};

// One more lot, x lots as x − 1 lots and one more: × 3 as × 2 and one more lot (the 3s' opening line), and a square
// from the fact below it, 7 × 7 = 6 × 7 + 7: "Use known facts to find unknown multiples" (Stage 2 MR-B, l.48). The
// first factor counts the lots, so 8 × 3 is the turn-around's. Not 3 × 2, which is a near square (2 × 2 and one more
// lot), nor 6 × 6, which is five lots plus the rest already.
const oneMore = {
  op: '×', title: 'One more lot',
  fits: ({ a, b }) => noZeroOne({ a, b }) && ((a === 3 && b >= 3) || (a === b && a >= 4 && a !== 6)),
  steps({ a, b }) {
    return [
      { text: `${a} × ${b} is ${a - 1} × ${b} plus one more lot of ${b}.` },
      { text: `${a - 1} × ${b} = ☐`, value: (a - 1) * b },
      { text: `${fmt((a - 1) * b)} + ${b} = ☐`, value: a * b },
    ];
  },
  hint: ({ a, b }) => `What is ${a - 1} × ${b}? Then add one more lot of ${b}.`,
};

// Near squares: one more lot, or one lot fewer, than a square she knows, 6 × 7 = 6 × 6 + 6 ("Model square numbers",
// Stage 2 MR-A, l.56; "Use known facts to find unknown multiples", Stage 2 MR-B, l.48). The square is the one she meets
// first, by the order of the tables (the smaller if both come together): 7 × 8 is learned with the 8s, before 7 × 7, so
// it is 8 × 8 take away one lot of 8.
const firstMet = (n) => SKILLS.findIndex((s) => s.kind === 'facts' && s.tables.includes(n));
function nearSquare(sum) {
  if (!noZeroOne(sum) || Math.abs(sum.a - sum.b) !== 1) return null;
  const [x, y] = factPair(sum);
  return firstMet(y) <= firstMet(x) ? { up: true, x, y } : { up: false, x, y };
}
const nearSq = {
  op: '×', title: 'Near a square',
  fits: (sum) => nearSquare(sum) != null,
  steps(sum) {
    const { up, x, y } = nearSquare(sum);
    return up
      ? [{ text: `${x} × ${y} is ${y} × ${y} plus one more lot of ${y}.` }, { text: `${y} × ${y} = ☐`, value: y * y }, { text: `${fmt(y * y)} + ${y} = ☐`, value: x * y }]
      : [{ text: `${y} × ${x} is ${x} × ${x} take away one lot of ${x}.` }, { text: `${x} × ${x} = ☐`, value: x * x }, { text: `${fmt(x * x)} − ${x} = ☐`, value: x * y }];
  },
  hint(sum) {
    const { up, x, y } = nearSquare(sum);
    return up ? `What is ${y} × ${y}? Then add one more lot of ${y}.` : `What is ${x} × ${x}? Then take one lot of ${x} away.`;
  },
};

// Turn-arounds: 8 × 3 as 3 × 8, when fewer lots is the easier way round, then one more lot ("Model and apply the
// commutative property of multiplication", Stage 2 MR-A, l.63; Stage 2 MR-B, l.56).
const turned = ({ a, b }) => ({ op: '×', a: b, b: a });
const turn = {
  op: '×', title: 'Turn it around',
  fits: (sum) => sum.a > sum.b && oneMore.fits(turned(sum)) && !oneMore.fits(sum),
  steps: (sum) => [{ text: `${sum.a} × ${sum.b} is ${sum.b} × ${sum.a} turned around.` }, ...oneMore.steps(turned(sum))],
  hint: ({ a, b }) => `Turn it around: what is ${b - 1} × ${a}? Then add one more lot of ${a}.`,
};

// ---- division facts: the fact family (IES 2021 p. 52), and halving for ÷ 2, ÷ 4 and ÷ 8: "halving is dividing by 2"
// (Stage 2 MR-A, l.54). A fact with 0 or 1 has the family only. ----

const family = {
  op: '÷', title: 'Think of the family',
  fits: ({ op, d }) => op === '÷' && d >= 1,
  steps: ({ n, d }) => [
    { text: `Think of the family: ${d} × ☐ = ${fmt(n)}`, value: n / d },
    { text: `So ${fmt(n)} ÷ ${d} = ☐`, value: n / d },
  ],
  hint: ({ n, d }) => `Which number times ${d} makes ${fmt(n)}?`,
};

const HALVINGS = { 2: 1, 4: 2, 8: 3 };
// Said "cut it in half": the voice says "halve" as "have" (heard back, 25 October 2026).
const halve = {
  op: '÷', title: 'Cut in half',
  fits: ({ op, n, d }) => op === '÷' && d in HALVINGS && n % d === 0 && n / d >= 2,
  steps({ n, d }) {
    const first = { 2: `${fmt(n)} ÷ 2 is half of ${fmt(n)}.`, 4: `${fmt(n)} ÷ 4: cut it in half, then in half again.`, 8: `${fmt(n)} ÷ 8: cut it in half three times.` }[d];
    const steps = [{ text: first }];
    for (let m = n, i = 0; i < HALVINGS[d]; i++, m /= 2) steps.push({ text: `Half of ${fmt(m)} = ☐`, value: m / 2 });
    return steps;
  },
  hint: ({ n, d }) => ({ 2: `What is half of ${fmt(n)}?`, 4: `Did you cut ${fmt(n)} in half, then cut that in half again?`, 8: `Did you cut ${fmt(n)} in half three times, one after another?` }[d]),
};

// ---- dividing bigger numbers (IES 2021 Example 1.1; MA3-MR-01) ----
// Every way's worked steps write a remainder in words, "394 ÷ 5 = 78 remainder 4": "Record remainders in words to
// division problems" (Stage 3 MR-A, l.68, https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-3/fafab309e2;
// NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026). The question keeps the
// short "☐ r ☐" (engine/items/divide.js), the two boxes she types in.

const quotient = (n, d) => ({ q: Math.floor(n / d), r: n % d });
// A step that works out the quotient or the remainder itself is marked answer: true, so "Show me one step" leaves its
// box empty (js/runner.js); a working step whose number is the remainder by chance is given as usual (pt32). The
// remainder is written as left over only in a step so marked.
const own = (step, yes = true) => (yes ? { ...step, answer: true } : step);

// Chunking: take away the biggest chunk of the divisor she knows that fits, a place at a time, then one fact you know
// (IES 2021 p. 9): 394 ÷ 5 is 70 × 5 = 350, then 8 × 5 = 40, and 4 left; 990 ÷ 9 is 100 × 9, then 10 × 9; 3248 ÷ 4 is
// 800 × 4 first. A chunk is a fact times 10, 100 or 1000, a multiple she knows ("multiply one-digit numbers by 10, 100,
// 1000 and their multiples", Stage 3 MR-A, l.51; "Use knowledge of multiples to partition as appropriate and divide",
// l.76), so a sum is a few steps.
export function chunksFor(n, d) {
  const chunks = [];
  let left = n;
  for (let place = 10 ** (String(Math.floor(n / d)).length - 1); place >= 1; place /= 10) {
    const times = Math.floor(left / (place * d)) * place;
    if (times > 0) { chunks.push({ times, amount: times * d }); left -= times * d; }
  }
  return { chunks, remainder: left };
}

const chunking = {
  op: '÷', title: 'Chunking',
  fits: ({ n, d }) => d >= 2 && n >= d,
  steps({ n, d }) {
    const { chunks, remainder } = chunksFor(n, d);
    const { q } = quotient(n, d);
    // one chunk is the answer itself, so its number is hers to find, not printed in a step above the box
    if (chunks.length === 1) {
      return [own({ text: `Take away the biggest chunk of ${d} that fits: ☐ × ${d} = ${fmt(chunks[0].amount)}`, value: q }),
        ...(remainder ? [leftStep(n, d, q, remainder)] : [])];
    }
    const steps = [];
    let left = n;
    chunks.forEach((c, i) => {
      // the last chunk leaves the remainder
      steps.push(own({ text: `Take away ${c.times} × ${d} = ${fmt(c.amount)}. ${fmt(left)} − ${fmt(c.amount)} = ☐`, value: left - c.amount }, remainder > 0 && i === chunks.length - 1));
      left -= c.amount;
    });
    steps.push(own({ text: `Add up the groups: ${chunks.map((c) => c.times).join(' + ')} = ☐`, value: q }));
    if (remainder > 0) steps.push(own({ text: `${fmt(left)} is left, too small for another ${d}. So ${fmt(n)} ÷ ${d} = ${q} remainder ☐`, value: remainder }));
    return steps;
  },
  picture: ({ n, d }) => ({ type: 'chunks', dividend: n, divisor: d, ...chunksFor(n, d) }),
  // a chunk she knows, never one that is the answer itself (90 ÷ 3 is 30 groups, so not "10 × 3 = 30")
  hint: ({ n, d }) => {
    const k = Math.floor(n / d) === 10 * d ? 2 : 10;
    return `Did you take away groups of ${d} you know, like ${k} × ${d} = ${k * d}? Add up how many groups you took away.`;
  },
  words: () => ['quotient', 'remainder', 'divisor', 'dividend', 'multiple'],
};

// Short division ("bus stop"), place by place, with what is left carried to the next place.
export function shortDivision(n, d) {
  const out = [];
  let carry = 0;
  for (const digit of String(n).split('').map(Number)) {
    const here = carry * 10 + digit;
    out.push({ here, q: Math.floor(here / d), left: here % d });
    carry = here % d;
  }
  return { places: out, remainder: carry };
}

const shortDiv = {
  op: '÷', title: 'Short division',
  fits: ({ n, d }) => d >= 2 && d <= 9 && n >= 10,
  steps({ n, d }) {
    const { places } = shortDivision(n, d);
    const len = String(n).length;
    const name = (count, i) => unit(count, len - 1 - i); // "1 ten", "3 tens"
    const { q, r } = quotient(n, d);
    // what is left is carried to the next place; at the last place it is left over, the remainder, which the last step
    // gives; a place whose share is the whole quotient is the answer
    const left = (p, i) => (!p.left ? '' : i === len - 1 ? ', and the rest is left over' : `, with ${p.left} ${name(p.left, i)} left to carry`);
    return [...places.map((p, i) => own({ text: `${p.here} ${name(p.here, i)} ÷ ${d} = ☐${left(p, i)}`, value: p.q }, p.q === q)),
      own(r === 0 ? { text: `So ${fmt(n)} ÷ ${d} = ☐`, value: q } : { text: `So ${fmt(n)} ÷ ${d} = ${q} remainder ☐`, value: r })];
  },
  picture: ({ n, d }) => ({ type: 'shortdiv', dividend: n, divisor: d, places: shortDivision(n, d).places, remainder: n % d }),
  hint: () => 'Go one place at a time from the left. Did you carry what was left over into the next place?',
  words: () => ['quotient', 'remainder', 'divisor', 'dividend'],
};

// div-remainder's own way: the biggest multiple of the divisor that fits, then what is left ("Use known
// multiplication fact families to solve division problems for which answers may include a remainder", Stage 3 MR-A,
// l.69).
const biggest = {
  op: '÷', title: 'The biggest multiple',
  fits: ({ op, n, d }) => op === '÷' && d >= 2 && n >= d,
  steps({ n, d }) {
    const { q, r } = quotient(n, d);
    return [
      own({ text: `The biggest multiple of ${d} that fits in ${n}: ${d} × ☐ = ${d * q}`, value: q }),
      own({ text: `What is left over? ${n} − ${d * q} = ☐`, value: r }),
      own({ text: r === 0 ? `So ${n} ÷ ${d} = ☐, with nothing left over` : `So ${n} ÷ ${d} = ${q} remainder ☐: ${q} groups of ${d}, and ${r} left over`, value: r === 0 ? q : r }),
    ];
  },
  picture({ n, d }) {
    const { q, r } = quotient(n, d);
    return n <= 60 ? { type: 'groups', groups: d, each: q, leftover: r } : null;
  },
  hint: ({ n, d }) => `Check it: does ${d} × your answer, plus what is left over, make ${n}? And is what is left over smaller than ${d}?`,
  words: () => ['quotient', 'remainder', 'divisor'],
};

// The quotient's parts for splitting by known multiples: place by place (144 is 100 + 40 + 4, so 576 ÷ 4 is 400, 160 and
// 16 divided by 4), and a one-digit quotient over 5 as five lots and the rest (9 is 5 + 4, so 47 ÷ 5 is 25 and 20,
// and 2 left), five lots being the multiple she knows from the 5s. A quotient that is one part leaves nothing to
// split, so these two ways do not fit it.
export function multipleParts(n, d) {
  const { q, r } = quotient(n, d);
  const parts = q < 10 ? (q > 5 ? [5, q - 5] : [q]) : partsOf(q);
  return { parts, amounts: parts.map((p) => p * d), q, r };
}
const splits = ({ op, n, d }) => op === '÷' && d >= 2 && n >= d && multipleParts(n, d).parts.length >= 2;
// why a split cannot work a sum (wayFor), never naming the answer
const oneMultiple = ({ d }) => `it takes only one multiple of ${d}, so there is nothing to split`;
const and = (list) => (list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`);
const leftStep = (n, d, q, r) => ({ answer: true, text: `${r} is left, too small for another ${d}. So ${fmt(n)} ÷ ${d} = ${q} remainder ☐`, value: r });

// Splitting by known multiples, 84 ÷ 4 = 80 ÷ 4 + 4 ÷ 4: "Use knowledge of multiples to partition as appropriate and
// divide" (Stage 3 MR-A, l.76); what is left over is the remainder, 87 ÷ 4 = 20 + 1 r 3 = 21 r 3.
const splitMultiples = {
  op: '÷', title: 'Split into multiples',
  fits: splits,
  stops: oneMultiple,
  steps({ n, d }) {
    const { parts, amounts, q, r } = multipleParts(n, d);
    return [
      { text: `Split ${fmt(n)} into multiples of ${d}: ${amounts.map(fmt).join(' + ')}${r ? ', and some left over' : ''}.` },
      ...amounts.map((x, i) => ({ text: `${fmt(x)} ÷ ${d} = ☐`, value: parts[i] })),
      own({ text: `Add them: ${parts.map(fmt).join(' + ')} = ☐`, value: q }),
      ...(r ? [leftStep(n, d, q, r)] : []),
    ];
  },
  picture: () => null,
  hint: ({ n, d }) => `Did you split ${fmt(n)} into multiples of ${d} you know, divide each part, and add the answers?`,
  words: () => ['partition', 'multiple', 'quotient', 'remainder'],
};

// The area model for division: a rectangle the divisor wide, its area the number, in parts she knows; each part's
// length is what times the divisor makes it ("Use informal written strategies such as the area model to solve
// multiplication and division problems", Stage 3 MR-A, l.53; "partially covered area models", Stage 2 MR-B, l.52).
// Steps alone, no picture: the area picture (engine/render/svg.js) prints the lengths, which here are her answer.
const areaDiv = {
  op: '÷', title: 'The area model',
  fits: splits,
  stops: oneMultiple,
  steps({ n, d }) {
    const { parts, amounts, q, r } = multipleParts(n, d);
    return [
      { text: `A rectangle ${d} wide, in parts of ${and(amounts.map(fmt))}${r ? ', and some left over' : ''}.` },
      ...amounts.map((x, i) => ({ text: `${d} × ☐ = ${fmt(x)}`, value: parts[i] })),
      own({ text: `Add the lengths: ${parts.map(fmt).join(' + ')} = ☐`, value: q }),
      ...(r ? [leftStep(n, d, q, r)] : []),
    ];
  },
  picture: () => null,
  hint: ({ d }) => `Did you find what times ${d} makes each part, and add those lengths?`,
  words: () => ['area model', 'quotient', 'remainder'],
};

// ---- adding and subtracting: partitioning, taught first (MA2-AR-01), the written method (MA2-AR-01, MA3-AR-01) and
// counting up, "addition for subtraction" on an empty number line (MA3-AR-01). The first two work a + b and a − b. ----

const len = (n) => String(n).length;
const digit = (n, i) => Math.floor(n / 10 ** i) % 10;
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const total = (list) => list.reduce((s, x) => s + x, 0);
const said = ({ op, a, b }) => `${fmt(a)} ${op} ${fmt(b)}`;
const worth = ({ op, a, b }) => (op === '+' ? a + b : a - b);

// Column addition of any number of addends. carries[i] is what is carried into column i (the 'columns'
// picture), one entry per column of the longest number. place names column i, from the right, and lens are how many
// columns each number is written in: the whole-number places and digits, or a decimal's (decColumns, on its digits as
// a whole number of its smallest place, each written to the same places after the point: 0.05 is 2 columns, 005).
const WHOLE_PLACES = { many: (i) => PLACE_NAMES[i], one: (i) => ONE[i] };
export function addColumns(nums, place = WHOLE_PLACES, lens = nums.map(len)) {
  const width = Math.max(...lens);
  const steps = [], carries = [];
  let carry = 0;
  const named = (c, i) => (c === 1 ? place.one(i) : place.many(i));
  const why = (c, i) => `the carried ${c} is ${c} ${named(c, i)} (${c * 10} ${place.many(i - 1)} make ${c} ${named(c, i)})`;
  for (let i = 0; i < width; i++) {
    carries.push(carry);
    const ds = nums.filter((_, k) => lens[k] > i).map((n) => digit(n, i));
    const terms = carry ? [carry, ...ds] : ds;
    const here = total(terms);
    steps.push(terms.length > 1
      ? { text: `${cap(place.many(i))}: ${carry ? `${why(carry, i)}. ` : ''}${terms.join(' + ')} = ☐`, value: here }
      : { text: `${cap(place.many(i))}: only the ${here}, so write ☐`, value: here });
    carry = Math.floor(here / 10);
  }
  if (carry) steps.push({ text: `${cap(place.many(width))}: ${why(carry, width)}, so write ☐`, value: carry });
  return { steps, carries };
}

// Column subtraction, trading from the next place when the top digit is too small, and across zeros when
// that place is empty. carries[i] is 1 when a ten (hundred, thousand...) was traded into column i.
export function subColumns(top, bottom) {
  const width = len(top);
  const cur = Array.from({ length: width }, (_, i) => digit(top, i));
  const lowered = Array(width).fill(false);
  const carries = Array(width).fill(0);
  const steps = [];
  for (let i = 0; i < width; i++) {
    const name = cap(PLACE_NAMES[i]);
    const now = lowered[i] ? `after the trade there ${cur[i] === 1 ? 'is' : 'are'} ${cur[i]} ${unit(cur[i], i)}. ` : '';
    if (i >= len(bottom)) {
      if (i === width - 1 && cur[i] === 0) steps.push({ text: `${name}: after the trade there are no ${PLACE_NAMES[i]} left.` });
      else steps.push({ text: `${name}: ${now}${now ? 'N' : 'n'}othing to take away, so write ☐`, value: cur[i] });
      continue;
    }
    const b = digit(bottom, i), have = cur[i];
    if (have < b) {
      let j = i + 1;
      while (cur[j] === 0) j++;
      const chain = [];
      for (let k = j; k > i; k--) {
        cur[k] -= 1;
        cur[k - 1] += 10;
        lowered[k] = true;
        carries[k - 1] = 1;
        chain.push(`1 ${ONE[k]} for 10 ${PLACE_NAMES[k - 1]}`);
      }
      const how = j > i + 1 ? `and there are no ${PLACE_NAMES[i + 1]} to trade, so trade ${chain.join(', then ')}` : `so trade ${chain[0]}`;
      steps.push({ text: `${name}: ${now}${have} is less than ${b}, ${how}. ${cur[i]} − ${b} = ☐`, value: cur[i] - b });
    } else {
      steps.push({ text: `${name}: ${now}${have} − ${b} = ☐`, value: have - b });
    }
  }
  return { steps, carries };
}

// No column of a − b needs a trade: every digit on top is at least the one under it. Where one does (52 − 37: 2 − 7),
// partitioning goes wrong.
const noTrade = ({ a, b }) => a >= b && Array.from({ length: len(a) }, (_, i) => digit(a, i) >= digit(b, i)).every(Boolean);

// Partitioning, largest place first: each place where both numbers have a part is added (or taken away), and a part
// only one number has goes straight into putting the parts together.
const split = {
  op: '+', title: 'Partitioning',
  fits: (sum) => sum.op === '+' || (sum.op === '−' && noTrade(sum)),
  // the first place, from the ones, where the top digit is too small: "in the ones, 2 take away 7 needs a trade"
  stops({ op, a, b }) {
    const i = op === '−' ? Array.from({ length: len(a) }, (_, k) => k).find((k) => digit(a, k) < digit(b, k)) : undefined;
    return i === undefined ? null : `in the ${PLACE_NAMES[i]}, ${digit(a, i)} take away ${digit(b, i)} needs a trade`;
  },
  steps(sum) {
    const { op, a, b } = sum;
    const steps = [], parts = [];
    for (let i = Math.max(len(a), len(b)) - 1; i >= 0; i--) {
      const x = digit(a, i) * 10 ** i, y = digit(b, i) * 10 ** i;
      const here = op === '+' ? x + y : x - y;
      if (x && y) steps.push({ text: `${op === '+' ? 'Add' : 'Take away'} the ${PLACE_NAMES[i]}: ${fmt(x)} ${op} ${fmt(y)} = ☐`, value: here });
      if (here) parts.push(here);
    }
    steps.push(parts.length > 1 ? { text: `Put the parts together: ${parts.map(fmt).join(' + ')} = ☐`, value: worth(sum) } : { text: `So ${said(sum)} = ☐`, value: worth(sum) });
    return steps;
  },
  picture: () => null,
  hint: ({ op }) => (op === '+' ? 'Did you add every place, then put the parts together?' : 'Did you take away in every place, then put the parts together?'),
  words: ({ op }) => ['partition', op === '+' ? 'sum' : 'difference'],
};

const HINTS = {
  '+': 'Did you start with the ones? If a column made 10 or more, did you carry 1 into the next one?',
  '−': 'In each column, is the top digit big enough to take the bottom one away? If not, did you trade 1 from the next column?',
};

const columnWork = ({ op, a, b }) => (op === '+' ? addColumns([a, b]) : subColumns(a, b));

const column = {
  op: '+', title: 'The written method',
  fits: (sum) => sum.op === '+' || (sum.op === '−' && sum.a >= sum.b),
  steps: (sum) => [...columnWork(sum).steps, { text: `So ${said(sum)} = ☐`, value: worth(sum) }],
  picture: (sum) => ({ type: 'columns', op: sum.op, top: sum.a, bottom: sum.b, carries: columnWork(sum).carries }),
  hint: ({ op }) => HINTS[op],
  words: ({ op }) => [op === '+' ? 'sum' : 'difference', 'regroup', 'place value'],
};

// Where counting up from b to a lands: the next ten, hundred (and thousand) while that is not past a, then as far as
// the biggest place takes it (300 to 600 on the way to 603), then the rest.
export function jumpsUp(b, a) {
  const stops = [b];
  for (let p = 10; p <= a; p *= 10) {
    const next = Math.ceil(stops.at(-1) / p) * p;
    if (next > a) break;
    if (next > stops.at(-1)) stops.push(next);
  }
  for (let p = 10 ** (len(a) - 1); p >= 10; p /= 10) {
    const round = Math.floor(a / p) * p;
    if (round > stops.at(-1)) { stops.push(round); break; }
  }
  if (a > stops.at(-1)) stops.push(a);
  return stops;
}

const countUp = {
  op: '−', title: 'Count up',
  fits: (sum) => sum.op === '−' && sum.a > sum.b,
  stops: ({ op }) => (op === '+' ? ADDS : null),
  steps({ a, b }) {
    const stops = jumpsUp(b, a);
    const jumps = stops.slice(1).map((s, i) => s - stops[i]);
    const steps = jumps.map((j, i) => ({ text: `${fmt(stops[i])} + ☐ = ${fmt(stops[i + 1])}`, value: j }));
    if (jumps.length > 1) steps.push({ text: `Add the jumps: ${jumps.map(fmt).join(' + ')} = ☐`, value: a - b });
    return steps;
  },
  // an empty number line: only its ends ticked, a jump to each stop
  picture({ a, b }) {
    const stops = jumpsUp(b, a);
    return { type: 'numberline', from: b, to: a, step: a - b,
      jumps: stops.slice(1).map((s, i) => ({ from: stops[i], to: s, label: `+${fmt(s - stops[i])}` })),
      marks: stops.slice(1, -1).map((s) => ({ at: s, label: fmt(s) })) };
  },
  hint: () => 'Did you add up all the jumps from the smaller number to the bigger one?',
  words: () => ['difference', 'number line'],
};

// ---- subtracting other ways, each only where it suits the numbers: "Apply known mental strategies that use
// partitioning to add and subtract, such as bridging the decades"; "Use the compensation strategy to add and subtract";
// "Apply the levelling and constant difference strategies" (Stage 2 Additive relations A, MA2-AR-01, l.55-57); "Apply
// known strategies such as levelling, addition for subtraction, using constant difference, and bridging" (Stage 3
// Additive relations A, MA3-AR-01, l.42). NESA Mathematics K–10 (2022), read 10 October 2026:
// https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-2/fa361e2379 and
// .../stage-3/faf843e1ab. ----

const ADDS = 'it is for taking away, and this one adds';
const uncap = (s) => s[0].toLowerCase() + s.slice(1);
// a round number: a ten, or a hundred or more with at most two digits that are not 0 (30, 250, 2 000, 2 500; not 2 470)
const isRound = (n) => n >= 10 && n % 10 === 0 && String(n).replace(/0/g, '').length <= 2;
// the round number 1 to 3 above b (29 → 30, 197 → 200, 248 → 250), or below it (302 → 300); else null
const roundAbove = (b) => (Math.ceil(b / 10) * 10 - b <= 3 && isRound(Math.ceil(b / 10) * 10) && b % 10 ? Math.ceil(b / 10) * 10 : null);
const roundBelow = (b) => (b % 10 <= 3 && isRound(b - (b % 10)) && b % 10 ? b - (b % 10) : null);
const notNear = (b, what) => (isRound(b) ? `${fmt(b)} is a round number already` : `${fmt(b)} is not ${what} a round number`);

// Take away in parts: only the number taken away is split by place, biggest part first, each part taken from what is
// left, so it works on every subtraction, a trade included (52 − 37 as 52 − 30 − 7). A part that goes past a ten (or a
// hundred) goes down to it first, bridging the decades: 22 − 7 is down 2 to 20, then 5 more; 834 − 50 is down 34 to 800,
// the round number of the place above the part's, then 16 more.
const takeParts = {
  op: '−', title: 'Take away in parts',
  fits: ({ op, a, b }) => op === '−' && a > b,
  stops: ({ op }) => (op === '+' ? ADDS : null),
  steps({ a, b }) {
    const parts = partsOf(b);
    const steps = parts.length > 1 ? [{ text: `Split ${fmt(b)} into ${parts.map(fmt).join(' + ')}.` }] : [];
    let left = a;
    for (const p of parts) {
      const here = left % 10 ** len(p); // down to the round number of the place above the part's
      const bridge = here > 0 && here < p ? `: down ${fmt(here)} to ${fmt(left - here)}, then ${fmt(p - here)} more.` : '';
      steps.push({ text: `${fmt(left)} − ${fmt(p)} = ☐${bridge}`, value: left - p });
      left -= p;
    }
    return steps;
  },
  picture: () => null,
  hint: ({ b }) => `Did you take away every part of ${fmt(b)}, one at a time, from what was left?`,
  words: () => ['partition', 'difference'],
};

// Round and adjust (compensation): take away the round number just above the number taken away, then add back what was
// too many (63 − 29 as 63 − 30 + 1), when that number is 1 to 3 under a round one. Its hint names no round number,
// which can be the answer itself (59 − 29).
const compensate = {
  op: '−', title: 'Round and adjust',
  fits: ({ op, a, b }) => op === '−' && roundAbove(b) != null && roundAbove(b) <= a,
  stops({ op, a, b }) {
    if (op === '+') return ADDS;
    return roundAbove(b) != null ? `${fmt(roundAbove(b))} is more than ${fmt(a)}` : notNear(b, 'just under');
  },
  steps({ a, b }) {
    const r = roundAbove(b), s = r - b;
    return [
      { text: `${fmt(b)} is ${s} less than ${fmt(r)}, so take away ${fmt(r)} instead.` },
      { text: `${fmt(a)} − ${fmt(r)} = ☐`, value: a - r },
      { text: `That took away ${s} too many, so add ${s} back: ${fmt(a - r)} + ${s} = ☐`, value: a - b },
    ];
  },
  picture: () => null,
  hint: ({ b }) => `Did you take away the round number just above ${fmt(b)}, then add back the extra?`,
  words: () => ['compensation', 'difference'],
};

// Shift both numbers (levelling, constant difference): the same added to both, or taken from both, leaves the gap the
// same, so a small shift that makes the number taken away round (603 − 248 as 605 − 250; 645 − 302 as 643 − 300).
function shiftOf(b) {
  if (roundAbove(b) != null) return { s: roundAbove(b) - b, to: roundAbove(b), sign: '+' };
  return roundBelow(b) != null ? { s: b - roundBelow(b), to: roundBelow(b), sign: '−' } : null;
}
const level = {
  op: '−', title: 'Shift both numbers',
  fits: ({ op, a, b }) => op === '−' && a > b && shiftOf(b) != null,
  stops: ({ op, b }) => (op === '+' ? ADDS : notNear(b, 'close to')),
  steps({ a, b }) {
    const { s, to, sign } = shiftOf(b);
    const top = sign === '+' ? a + s : a - s;
    return [
      { text: `${sign === '+' ? `Add ${s} to` : `Take ${s} from`} both numbers, so ${fmt(b)} ${sign} ${s} = ${fmt(to)}. The gap stays the same.` },
      { text: `${fmt(a)} ${sign} ${s} = ☐`, value: top },
      { text: `${fmt(top)} − ${fmt(to)} = ☐`, value: a - b },
    ];
  },
  picture: () => null,
  hint({ b }) {
    const { s, sign } = shiftOf(b);
    return `Did you ${sign === '+' ? `add ${s} to` : `take ${s} from`} both numbers, then take away?`;
  },
  words: () => ['difference', 'constant difference'],
};

// ---- equals and unknowns (engine/items/equals.js, engine/items/algebra.js): the first ways as release 1 worked them,
// and a second where one fits. A sentence is { op: '=', shape, ...its numbers }: eq-same's '?=a+b', 'a+b=c+?' and
// 'a+b=c+d'; eq-missing-add's 'a+?=c', '?+b=c', 'c=a+?', 'c-?=b', '?-a=b' and 'a+b=?+d' (c is a + b); eq-missing-mult's
// 'a×?=c', '?×b=c', 'c÷?=b', '?÷a=b' and 'a×b=?×d' (c is a × b, d is 2 × a), and at Stage 3 size 'c÷a=?' too;
// eq-multi-op's nine shapes (MULTI_LEFT) with a, b and the right side r. ----

const SAME_SHAPES = ['?=a+b', 'a+b=c+?', 'a+b=c+d'];
export const ADD_SHAPES = ['a+?=c', '?+b=c', 'c=a+?', 'c-?=b', '?-a=b', 'a+b=?+d'];
const MULT_SHAPES = ['a×?=c', '?×b=c', 'c÷?=b', '?÷a=b', 'a×b=?×d', 'c÷a=?'];

const bothSides = {
  op: '=', title: 'Work out both sides',
  fits: ({ shape }) => SAME_SHAPES.includes(shape),
  steps({ shape, a, b, c, d }) {
    const total = a + b;
    if (shape === '?=a+b') return [{ text: `"=" means both sides are the same. ${a} + ${b} = ☐`, value: total }, { text: `So ☐ = ${a} + ${b}`, value: total }];
    if (shape === 'a+b=c+?') return [{ text: `The left side: ${a} + ${b} = ☐`, value: total }, { text: `The right side must be worth ${total} too: ${c} + ☐ = ${total}`, value: total - c }];
    return [{ text: `The left side: ${a} + ${b} = ☐`, value: total }, { text: `The right side: ${c} + ${d} = ☐`, value: c + d },
      { text: c + d === total ? 'They are the same, so it is true.' : 'They are not the same, so it is false.' }];
  },
  hint: ({ shape }) => ({
    '?=a+b': 'The two sides of "=" must be worth the same. What is the right side worth?',
    'a+b=c+?': 'Is your answer the total of everything? The right side only needs to be worth the same as the left side.',
    'a+b=c+d': 'Work out each side on its own. Are they worth the same?',
  }[shape]),
  words: () => ['equals', 'the same as'],
};

// A Stage 3 size, a 2-digit number and a one-digit one (125 ÷ 5 = ☐, 6 × ☐ = 258, ☐ ÷ 5 = 25): undone, then worked in
// the parts she knows, a fact times 10 and a fact, one a step: "Use knowledge of multiples to partition as appropriate
// and divide" and "the distributive property with partial products" (MA3-MR-01, Stage 3 MR-A, l.76, l.55). 125 ÷ 5 = ☐ is
// NESA's own, "becomes ☐ × 5 = 125" (MA3-MR-02, Stage 3 MR-B, l.57;
// NSW Mathematics K–10 Syllabus (2022), checked 25 October 2026).
export const stage3 = ({ shape, a, b }) => MULT_SHAPES.includes(shape) && !['c÷?=b', 'a×b=?×d'].includes(shape) && Math.max(a, b) > 10;
function undoInParts({ shape, a, b }) {
  const c = a * b;
  if (shape === '?÷a=b') {
    const parts = partsOf(b);
    return [{ text: `Multiplication undoes division: ${b} × ${a}. Split ${b} into ${parts.join(' + ')}.` },
      ...parts.map((p) => ({ text: `${p} × ${a} = ☐`, value: p * a })),
      { text: `Add them: ${parts.map((p) => fmt(p * a)).join(' + ')} = ☐`, value: c }];
  }
  // c divided by its one-digit number k, the answer m, in the multiples of k that m's place parts make
  const [k, m] = shape === '?×b=c' ? [b, a] : [a, b];
  const parts = partsOf(m), amounts = parts.map((p) => p * k);
  const split = `Split ${fmt(c)} into multiples of ${k}: ${amounts.map(fmt).join(' + ')}.`;
  const add = { text: `Add them: ${parts.join(' + ')} = ☐`, value: m };
  if (shape === 'c÷a=?') return [{ text: `Use the inverse: what × ${k} = ${fmt(c)}? ${split}` }, ...amounts.map((x, i) => ({ text: `${k} × ☐ = ${fmt(x)}`, value: parts[i] })), add];
  return [{ text: `Division undoes multiplication: ${fmt(c)} ÷ ${k}. ${split}` }, ...amounts.map((x, i) => ({ text: `${fmt(x)} ÷ ${k} = ☐`, value: parts[i] })), add];
}

// Undo it, the inverse operation: "Identify and use inverse operations to assist with the solution of number
// sentences" (MA3-MR-02); a + b = ☐ + d works out the left side first.
const undoIt = {
  op: '=', title: 'Undo it',
  fits: ({ shape }) => ADD_SHAPES.includes(shape) || MULT_SHAPES.includes(shape),
  steps({ shape, a, b, d }) {
    if (stage3({ shape, a, b })) return undoInParts({ shape, a, b });
    const c = ADD_SHAPES.includes(shape) ? a + b : a * b;
    switch (shape) {
      case 'a+?=c': return [{ text: `Subtraction undoes addition: ${fmt(c)} − ${fmt(a)} = ☐`, value: b }];
      case '?+b=c': return [{ text: `${fmt(c)} − ${fmt(b)} = ☐`, value: a }];
      case 'c=a+?': return [{ text: `${fmt(c)} − ${fmt(a)} = ☐`, value: b }];
      case 'c-?=b': return [{ text: `What was taken away is the gap: ${fmt(c)} − ${fmt(b)} = ☐`, value: a }];
      case '?-a=b': return [{ text: `Addition undoes subtraction: ${fmt(b)} + ${fmt(a)} = ☐`, value: c }];
      case 'a+b=?+d': return [{ text: `The left side: ${fmt(a)} + ${fmt(b)} = ☐`, value: c }, { text: `The right side must be ${fmt(c)} too: ${fmt(c)} − ${fmt(d)} = ☐`, value: c - d }];
      case 'a×?=c': return [{ text: `Division undoes multiplication: ${c} ÷ ${a} = ☐`, value: b }];
      case '?×b=c': return [{ text: `${c} ÷ ${b} = ☐`, value: a }];
      case 'c÷?=b': return [{ text: `${b} × ☐ = ${c}`, value: a }];
      case '?÷a=b': return [{ text: `Multiplication undoes division: ${b} × ${a} = ☐`, value: c }];
      case 'c÷a=?': return [{ text: `The inverse: ☐ × ${a} = ${c}`, value: b }];
      default: return [{ text: `The left side: ${a} × ${b} = ☐`, value: c }, { text: `The right side must be ${c} too: ${c} ÷ ${2 * a} = ☐`, value: b / 2 }];
    }
  },
  hint: ({ shape }) => (ADD_SHAPES.includes(shape) ? 'Undo it: if adding got you there, subtracting gets you back. Put your answer back in to check.'
    : 'Use the inverse operation: division undoes multiplication, and multiplication undoes division. Then put your answer back in.'),
  words: ({ shape }) => (ADD_SHAPES.includes(shape) ? ['equals', 'inverse operation'] : ['inverse operation', 'equals']),
};

// Spot the link: how a number on one side moved from its partner on the other says how the last one moves, without
// working out either side (7 + 5 = 8 + ☐: 8 is 1 more than 7, so ☐ is 1 less than 5). "Use number relation principles
// to solve related problems" (Stage 2 Additive relations A, l.48); "Use the equals sign to record equivalent number
// relationships involving multiplication" (Stage 2 Multiplicative relations B, l.69); McNeil et al. 2015 and Knuth et
// al. 2006 (engine/items/equals.js). Only where partners are 5 or less apart, or a factor is doubled.
function linkOf({ shape, a, b, c, d }) {
  const n = { 'a+b=c+?': c, 'a+b=c+d': c, 'a+b=?+d': d }[shape];
  if (n === undefined) return null;
  const [x, y] = Math.abs(n - b) < Math.abs(n - a) ? [b, a] : [a, b];
  return Math.abs(n - x) <= 5 ? { n, x, y, k: n - x } : null;
}
const relation = {
  op: '=', title: 'Spot the link',
  fits: (sum) => sum.shape === 'a×b=?×d' || linkOf(sum) != null,
  stops(sum) {
    const n = { 'a+b=c+?': sum.c, 'a+b=c+d': sum.c, 'a+b=?+d': sum.d }[sum.shape];
    return n === undefined ? 'there is no second sum to link it to' : `${fmt(n)} is not close to ${fmt(sum.a)} or ${fmt(sum.b)}`;
  },
  steps(sum) {
    if (sum.shape === 'a×b=?×d') return [{ text: `${2 * sum.a} is double ${sum.a}, so the missing number is half of ${sum.b}: ${sum.b} ÷ 2 = ☐`, value: sum.b / 2 }];
    const { n, x, y, k } = linkOf(sum);
    const moved = k === 0 ? `${fmt(n)} is the same as ${fmt(x)}` : `${fmt(n)} is ${Math.abs(k)} ${k > 0 ? 'more' : 'less'} than ${fmt(x)}`;
    const then = k === 0 ? `the same as ${fmt(y)}: ☐ = ${fmt(y)}` : `${Math.abs(k)} ${k > 0 ? 'less' : 'more'} than ${fmt(y)}: ${fmt(y)} ${k > 0 ? '−' : '+'} ${Math.abs(k)} = ☐`;
    if (sum.shape !== 'a+b=c+d') return [{ text: `${moved}, so the missing number is ${then}`, value: y - k }];
    return [{ text: `${moved}. So ${fmt(sum.d)} needs to be ${then}`, value: y - k },
      { text: sum.d === y - k ? 'It is, so it is true.' : `${fmt(sum.d)} is not ${fmt(y - k)}, so it is false.` }];
  },
  hint(sum) {
    if (sum.shape === 'a×b=?×d') return `${2 * sum.a} is double ${sum.a}. So is the missing number double ${sum.b}, or half of it?`;
    const { n, x } = linkOf(sum);
    return `How far is ${fmt(n)} from ${fmt(x)}? The other number moves that much the other way.`;
  },
  words: () => ['equals', 'the same as'],
};

// Count on: a missing part found by jumps from the part to the whole (jumpsUp), "think addition": "Use the complement
// principle of addition and subtraction" (Stage 2 Additive relations A, l.50); "addition for subtraction" (Stage 3
// Additive relations A, l.42). Only where it takes three jumps or fewer.
function gapOf({ shape, a, b, d }) {
  return { 'a+?=c': [a, a + b], '?+b=c': [b, a + b], 'c=a+?': [a, a + b], 'c-?=b': [b, a + b], 'a+b=?+d': [d, a + b] }[shape] ?? null;
}
const countOn = {
  op: '=', title: 'Count on',
  fits: (sum) => gapOf(sum) != null && gapOf(sum)[1] > gapOf(sum)[0] && jumpsUp(...gapOf(sum)).length <= 4,
  stops: (sum) => (gapOf(sum) == null ? 'the missing number is where it starts, not a gap' : `it is a long way from ${fmt(gapOf(sum)[0])} to ${fmt(gapOf(sum)[1])}`),
  steps(sum) {
    const [p, w] = gapOf(sum);
    const stops = jumpsUp(p, w);
    const jumps = stops.slice(1).map((s, i) => s - stops[i]);
    const on = { text: `Count on from ${fmt(p)} to ${fmt(w)}, a jump at a time.` };
    const first = sum.shape === 'c-?=b' ? [{ text: `What was taken away is the gap: count on from ${fmt(p)} to ${fmt(w)}.` }]
      : sum.shape === 'a+b=?+d' ? [{ text: `The left side: ${fmt(sum.a)} + ${fmt(sum.b)} = ☐`, value: w }, on] : [on];
    return [...first, ...jumps.map((j, i) => ({ text: `${fmt(stops[i])} + ☐ = ${fmt(stops[i + 1])}`, value: j })),
      ...(jumps.length > 1 ? [{ text: `Add the jumps: ${jumps.map(fmt).join(' + ')} = ☐`, value: w - p }] : [])];
  },
  hint: () => 'Did you count on from the smaller number to the bigger one, and add up all the jumps?',
  words: () => ['equals', 'difference'],
};

// eq-multi-op's left side with n in the box, and what it is worth: 'a×?+b' is a × n + b ('c−a×?' keeps c in b).
export const MULTI_LEFT = {
  'a×?+b': [(s, n) => `${s.a} × ${n} + ${s.b}`, (s, x) => s.a * x + s.b],
  'b+?×a': [(s, n) => `${s.b} + ${n} × ${s.a}`, (s, x) => s.b + x * s.a],
  '?×a−b': [(s, n) => `${n} × ${s.a} − ${s.b}`, (s, x) => x * s.a - s.b],
  '?÷a+b': [(s, n) => `${n} ÷ ${s.a} + ${s.b}`, (s, x) => x / s.a + s.b],
  '?÷a−b': [(s, n) => `${n} ÷ ${s.a} − ${s.b}`, (s, x) => x / s.a - s.b],
  '(?+a)×b': [(s, n) => `(${n} + ${s.a}) × ${s.b}`, (s, x) => (x + s.a) * s.b],
  '(?−a)×b': [(s, n) => `(${n} − ${s.a}) × ${s.b}`, (s, x) => (x - s.a) * s.b],
  '(?+a)÷b': [(s, n) => `(${n} + ${s.a}) ÷ ${s.b}`, (s, x) => (x + s.a) / s.b],
  'c−a×?': [(s, n) => `${s.b} − ${s.a} × ${n}`, (s, x) => s.b - s.a * x],
};
export const multiLeft = (sum, n) => MULTI_LEFT[sum.shape][0](sum, n);
const multiWorth = (sum, x) => MULTI_LEFT[sum.shape][1](sum, x);

const UNDO = { '+': ['subtracting', '−'], '−': ['adding', '+'], '×': ['dividing', '÷'], '÷': ['multiplying', '×'] };
// "Undo + 4 by subtracting: 19 − 4 = ☐": the inverse operation, said out loud
function undo(op, n, from) {
  const [how, inv] = UNDO[op];
  const value = { '+': from - n, '−': from + n, '×': from / n, '÷': from * n }[op];
  return { text: `Undo ${op} ${n} by ${how}: ${fmt(from)} ${inv} ${n} = ☐`, value };
}
const BRACKETS_LAST = { text: 'The brackets are worked out first, so undo them last.' };
const brackets = ({ shape }) => (shape.includes('(') ? ['brackets'] : []);

// Work backwards from the right side, undoing one operation at a time (MA3-MR-02).
const backwards = {
  op: '=', title: 'Work backwards',
  fits: ({ shape }) => shape in MULTI_LEFT,
  steps({ shape, a, b, r }) {
    const undone = {
      'a×?+b': () => [undo('+', b, r), undo('×', a, r - b)],
      'b+?×a': () => [{ text: `× is done before +, so the missing number × ${a} is added on last.` }, undo('+', b, r), undo('×', a, r - b)],
      '?×a−b': () => [undo('−', b, r), undo('×', a, r + b)],
      '?÷a+b': () => [undo('+', b, r), undo('÷', a, r - b)],
      '?÷a−b': () => [undo('−', b, r), undo('÷', a, r + b)],
      '(?+a)×b': () => [BRACKETS_LAST, undo('×', b, r), undo('+', a, r / b)],
      '(?−a)×b': () => [BRACKETS_LAST, undo('×', b, r), undo('−', a, r / b)],
      '(?+a)÷b': () => [BRACKETS_LAST, undo('÷', b, r), undo('+', a, r * b)],
      'c−a×?': () => [{ text: `× is done before −, so ${a} × the missing number is taken away from ${b}.` },
        { text: `What was taken away is the gap: ${b} − ${r} = ☐`, value: b - r }, undo('×', a, b - r)],
    }[shape]();
    return [{ text: `Work backwards from ${r}, undoing one operation at a time.` }, ...undone];
  },
  hint: () => 'Put your answer in the box and work out the left side. Does it make the right side?',
  words: (sum) => ['inverse operation', 'number sentence', ...brackets(sum)],
};

// Guess, check and improve: try 5 in the box, see how far off the left side is and how much each 1 more in the box
// changes it, then put the answer back in: "Reflect on a chosen strategy for solving a problem, considering whether it
// can be improved" (Stage 2 Additive relations B, l.53), and the hint's "Put your answer back in". Only where the box is
// multiplied or has a number added to or taken from it, and 5 in the box works out at 0 or more.
const GUESS = 5;
export const GUESSED = { 'a×?+b': 'a', 'b+?×a': 'a', '?×a−b': 'a', '(?+a)×b': 'b', '(?−a)×b': 'b', 'c−a×?': 'a' };
const guessCheck = {
  op: '=', title: 'Guess, check and improve',
  fits: (sum) => sum.shape in GUESSED && multiWorth(sum, GUESS) >= 0,
  stops: (sum) => (sum.shape in GUESSED ? `a first guess of ${GUESS} goes below 0` : 'the missing number is divided, so a guess seldom works out'),
  steps(sum) {
    const v = multiWorth(sum, GUESS);
    const guess = { text: `Guess ${GUESS}: ${multiLeft(sum, GUESS)} = ☐`, value: v };
    if (v === sum.r) return [guess, { text: `It makes ${sum.r}, so the missing number is ☐`, value: GUESS }];
    const each = sum[GUESSED[sum.shape]], slope = sum.shape === 'c−a×?' ? -each : each;
    const more = (sum.r - v) / slope;
    return [guess,
      { text: `${v} is ${Math.abs(sum.r - v)} too ${v < sum.r ? 'small' : 'big'}. Each 1 more in the box makes it ${each} ${slope > 0 ? 'bigger' : 'smaller'}, so try ${GUESS} ${more > 0 ? '+' : '−'} ${Math.abs(more)} = ☐`, value: GUESS + more },
      { text: `Put it back in: ${multiLeft(sum, '☐')} = ${sum.r}`, value: GUESS + more }];
  },
  hint: () => 'Put your guess in the box: is the left side too big or too small? Then change your guess and check again.',
  words: (sum) => ['number sentence', ...brackets(sum)],
};

// ---- decimals (stage 6, plans/2026-10-25-stage-6-plan.md, "The ways"): showing and splitting a decimal, the sum
// { op: 'rep', key, value, places, part? } of engine/items/decimals.js: value its decimal text, places the places after
// the point its skill works to (2 for dec-hundredths, 3 for dec-thousandths) and part, where the question has one, the
// form it takes (the place left out, or the place given) ----
// The place value chart: the digits in their columns, the point marking the ones ("Use the decimal point as a marker
// to identify the position of the ones digit", Stage 2 Representing numbers using place value B, saved copy
// 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fa1dbb9271.md l.60, l.63; "Indicate the place value of
// digits in decimal numbers of up to 3 decimal places", Stage 3 Represents numbers A, saved copy
// 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-fa87632ef7.md l.61). As a fraction: everything counted in
// the smallest part, tenths, hundredths or thousandths, worked as whole numbers, then written with the point ("Express
// decimals as both tenths and hundredths", "Make connections between fractions and decimal notation", fa1dbb9271 l.64,
// l.74; "Express thousandths as decimals", fa87632ef7 l.59). NSW Mathematics K–10 Syllabus (2022), 16 June 2026
// amendments, checked 25 October 2026. Each works every kind of problem its two skills make.

// "Put 3 in the ones, 0 in the tenths and 6 in the hundredths.": every place to the last one asked for, a 0 in each empty one
function putDigits({ ones, d }, upTo) {
  const after = d.slice(0, upTo).map((x, i) => `${x} in the ${DEC_PLACES[i]}`);
  return ones < 10 ? `Put ${andList([`${ones} in the ones`, ...after])}.` : `Put ${ones} before the point, then ${andList(after)}.`;
}
// its parts that are not 0, biggest first, as counts: "3 ones, 4 tenths and 6 hundredths"
const amounts = ({ ones, d }) => andList([ones ? countOf(ones, 0) : '', ...d.map((x, i) => (x ? countOf(x, i + 1) : ''))].filter(Boolean));
// the part after the point, as text: 4.36 -> '0.36'
const afterPoint = (value) => `0.${splitDecimal(value).frac}`;
// the part after the point said first: "0.457 is", or with ones "The part after the point, 0.457, is"
const afterIs = ({ ones }, value) => (ones ? `The part after the point, ${afterPoint(value)}, is` : `${value} is`);
const placeOf = (p) => p.places || 1;

function chartSteps(sum) {
  const { key, value, part } = sum;
  const p = decParts(value);
  const { ones, d } = p;
  const read = { text: `Read the chart: ${amounts(p)} = ☐`, value };
  if (key === 'tenths' || key === 'expanded') {
    return [...(key === 'expanded' ? [{ text: `Each part fills one place, biggest first${d.slice(0, placeOf(p)).includes(0) ? '; an empty place gets a 0' : ''}.` }] : []),
      { text: putDigits(p, placeOf(p)) }, read];
  }
  if (key === 'hundredths' || key === 'thousandths') {
    const k = key === 'hundredths' ? 2 : 3;
    const after = key === 'hundredths' ? d[0] * 10 + d[1] : d[0] * 100 + d[1] * 10 + d[2];
    const named = d.slice(0, k).map((x, i) => (x ? countOf(x, i + 1) : null)).filter(Boolean);
    const empty = d.slice(0, k).map((x, i) => (x ? null : DEC_PLACES[i])).filter(Boolean);
    const first = part === 'places' ? [] : named.length === 1 && k === 2 ? [{ text: 'There are fewer than 10 hundredths, so the tenths get a 0.' }]
      : [{ text: `${countOf(after, k)} is ${andList(named)}${empty.length ? `, so the ${andList(empty)} get a 0` : ''}.` }];
    return [...first, { text: putDigits(p, k) }, read];
  }
  if (key === 'as-hundredths') {
    return [{ text: putDigits(p, 2) }, { text: `Read it to the hundredths: ${ones}.${d[0]}${d[1]} is ☐ hundredths`, value: p.th / 10 }];
  }
  if (key === 'regroup') {
    const k = p.places;
    const left = k === 1 ? d[0] : d[0] * 10 + d[1];
    return [{ text: `${k === 1 ? '10 tenths' : '100 hundredths'} make 1 one: trade them, and ${countOf(left, k)} ${left === 1 ? 'is' : 'are'} left.` },
      { text: putDigits(p, k) }, read];
  }
  if (key === 'grid') {
    const seen = d[0] && d[1] ? `${d[0]} whole column${d[0] === 1 ? '' : 's'} and ${d[1]} small square${d[1] === 1 ? '' : 's'} more`
      : d[0] ? `${d[0]} whole column${d[0] === 1 ? '' : 's'}` : `No whole column, and ${d[1]} small square${d[1] === 1 ? '' : 's'}`;
    return [{ text: 'Each whole column is a tenth, and each small square a hundredth.' },
      { text: `${seen}: ${putDigits(p, d[1] ? 2 : 1).replace(/^Put/, 'put')}` }, { text: `${amounts(p)} = ☐`, value }];
  }
  if (key === 'split' || key === 'partition') {
    return [{ text: putDigits(p, placeOf(p)) },
      { text: `The part not given is in the ${DEC_PLACES[part - 1]}: ${countOf(d[part - 1], part)} = ☐`, value: partText(d[part - 1], part) }];
  }
  if (key === 'digit-place') {
    return [{ text: putDigits(p, placeOf(p)) }, { text: `Read the heading over the ${d[part - 1]}: after the point come tenths, hundredths, then thousandths.` }];
  }
  // rename: read the chart down to the place given, and the rest is what is left
  const lead = ones ? `${countOf(ones, 0)}, ` : '';
  if (part === 'thousandths') {
    return [{ text: `Put ${value} in the chart, one digit a place.` }, { text: 'Read it down to the hundredths, leaving out the thousandths.' },
      { text: `${value} is ${lead}☐ hundredths and ${countOf(d[2], 3)}`, value: d[0] * 10 + d[1] }];
  }
  const given = part === 'hundredths' ? countOf(d[0] * 10 + d[1], 2) : countOf(d[0], 1);
  return [{ text: `Put ${value} in the chart, one digit a place.` }, { text: `Down to the ${part}, after the point, it reads ${given}.` },
    { text: `${value} is ${lead}${given} and ☐ thousandths`, value: part === 'hundredths' ? d[2] : d[1] * 10 + d[2] }];
}

function fractionSteps(sum) {
  const { key, value, part } = sum;
  const p = decParts(value);
  const { ones, d } = p;
  // the smallest part the problem counts in, and how many of it the whole decimal is
  const k = sum.places === 3 ? 3 : key === 'tenths' || (key === 'regroup' && p.places === 1) ? 1 : 2;
  const per = 10 ** k;
  const all = p.th / 10 ** (3 - k);
  const after = all - ones * per;
  const unitWord = DEC_PLACES[k - 1];
  const done = { text: `${countOf(all, k)} = ☐`, value };
  if (key === 'tenths' || key === 'thousandths' || (key === 'hundredths' && (part === 'count' || (!ones && !d[0])))) {
    if (!ones) return [{ text: `A ${unitWord.slice(0, -1)} is 1 of ${fmt(per)} equal parts, so ${unitWord} take ${k === 1 ? '1 place' : `${k} places`} after the point.` }, done];
    return [{ text: `Each one is ${fmt(per)} ${unitWord}: ${ones} × ${fmt(per)} = ☐.`, value: ones * per },
      { text: `With the ${countOf(after, k)}: ${fmt(ones * per)} + ${fmt(after)} = ☐.`, value: all }, done];
  }
  if (key === 'hundredths' || key === 'as-hundredths') {
    const terms = [ones ? `${ones} × 100` : '', d[0] ? `${d[0]} × 10` : '', d[1] ? String(d[1]) : ''].filter(Boolean).join(' + ');
    const each = andList([ones ? 'each one is 100 hundredths' : '', d[0] ? `each tenth is 10${ones ? '' : ' hundredths'}` : ''].filter(Boolean));
    const work = { text: `${each[0].toUpperCase()}${each.slice(1)}: ${terms} = ☐.`, value: all };
    return key === 'hundredths' ? [work, done] : [{ text: `${value} is ${amounts(p)}.` }, work];
  }
  if (key === 'regroup') {
    return [{ text: `${fmt(per)} ${unitWord} make 1 one: ${fmt(all)} − ${fmt(per)} = ☐.`, value: all - per },
      { text: `That is 1 one and ${countOf(all - per, k)}.` }, done];
  }
  if (key === 'grid') {
    return [{ text: 'The whole square is 100 small squares, so each one is a hundredth.' },
      { text: `Count them, 10 to a column: ${all} small square${all === 1 ? ' is' : 's are'} shaded.` }, done];
  }
  if (key === 'digit-place') {
    const x = d[part - 1];
    const worth = x * 10 ** (3 - part);
    const terms = d.map((y, i) => (y ? fmt(y * 10 ** (2 - i)) : null)).filter(Boolean).join(' + ');
    return [{ text: `${afterIs(p, value)} ${countOf(after, 3)}: ${terms}.` },
      { text: part === 3 ? `The ${x} counts single thousandths, the smallest part.`
        : `The ${x} is worth ${fmt(worth)} thousandths, and every ${part === 1 ? '100 thousandths make a tenth' : '10 thousandths make a hundredth'}.` }];
  }
  if (key === 'expanded') {
    const terms = [...(ones ? [ones * 1000] : []), ...d.map((y, i) => y * 10 ** (2 - i)).filter(Boolean)].map(fmt);
    return [{ text: `In thousandths, the parts are ${andList(terms)}.` }, { text: `${terms.join(' + ')} = ☐.`, value: all }, done];
  }
  if (key === 'split' || key === 'partition') {
    const gone = d[part - 1] * 10 ** (k - part);
    const known = d.slice(0, k).map((y, i) => (y && i !== part - 1 ? { y, i } : null)).filter(Boolean);
    const say = known.map(({ y, i }) => `${partText(y, i + 1)} is ${countOf(y * 10 ** (k - 1 - i), k)}`);
    const less = known.map(({ y, i }) => ` − ${fmt(y * 10 ** (k - 1 - i))}`).join('');
    const first = { text: `${afterIs(p, value)} ${countOf(after, k)}.` };
    const take = { text: `${fmt(after)}${less} = ☐.`, value: gone };
    const end = { text: `${countOf(gone, k)} = ☐`, value: partText(d[part - 1], part) };
    // nothing else after the point: the part missing is all of it
    if (!known.length) return [first, end];
    // a chart of thousandths takes the parts given a step of their own, so each step stays a sentence or two
    return k === 3 ? [first, { text: `${andList(say)}.` }, take, end] : [{ text: `${first.text.slice(0, -1)}, and ${andList(say)}.` }, take, end];
  }
  // rename: all of it in thousandths, then the part given taken away
  const first = { text: `${afterIs(p, value)} ${countOf(after, 3)}.` };
  if (part === 'thousandths') {
    return [first, { text: `${fmt(after)} − ${d[2]} = ☐.`, value: after - d[2] },
      { text: `Each hundredth is 10 thousandths: ${fmt(after - d[2])} ÷ 10 = ☐.`, value: d[0] * 10 + d[1] }];
  }
  const [count, each] = part === 'hundredths' ? [d[0] * 10 + d[1], 10] : [d[0], 100];
  return [first, { text: `Each ${part.slice(0, -1)} is ${each} thousandths: ${count} × ${each} = ☐.`, value: count * each },
    { text: `${fmt(after)} − ${fmt(count * each)} = ☐.`, value: after - count * each }];
}

// the chart a decimal way draws: the question's number (a question shows its columns empty, js/runner.js asked); the
// place asked about marked; a soft 0 in the hundredths where tenths are read as hundredths
function decChart(sum) {
  const p = decParts(sum.value);
  return { type: 'placevalue', value: sum.value, columns: String(p.ones).length, decimals: sum.places,
    ...(sum.key === 'digit-place' ? { highlight: DEC_PLACES[sum.part - 1] } : {}), ...(sum.key === 'as-hundredths' ? { zeros: true } : {}) };
}
// the 100 grid: on a grid problem it is the question, its counts boxes so it never gives them before she answers;
// beside any other problem it is her working, the number shaded and its counts written, so it shows in the worked
// steps only and never on the question (working, js/runner.js asked)
const decGrid = (sum) => (sum.key === 'grid' ? { type: 'grid', shaded: decParts(sum.value).th / 10, blank: true }
  : { type: 'grid', shaded: decParts(sum.value).th / 10, working: true });

const CHART_HINTS = {
  tenths: 'Which column does each part go in? Which side of the point are the ones?',
  hundredths: 'Which column does each part go in? Is there a place that needs a zero?',
  thousandths: 'Which column does each digit go in? Is there a place that needs a zero?',
  expanded: 'Which column does each part fill? Is there a place with no part, that needs a zero?',
  'as-hundredths': 'Reading the chart down to the hundredths column, which digits do you read?',
  regroup: 'How many of them make one whole, to trade into the ones? How many are left over?',
  grid: 'How many whole columns are shaded? How many small squares more?',
  split: 'Which place has no part given? Which digit is in that place?',
  partition: 'Which place has no part given? Which digit is in that place?',
  'digit-place': 'Put the number in the chart: which column is that digit in?',
  rename: 'Put the number in the chart. Which digits make the part given, and which are left?',
};
const FRACTION_HINTS = {
  tenths: 'How many tenths is each one worth? Did you count them all before writing the decimal?',
  hundredths: 'How many hundredths is each tenth worth, and each one? Did you count them all first?',
  thousandths: 'How many thousandths is each one worth? How many digits come after the point?',
  expanded: 'How many thousandths is each part worth? Did you add them all before writing the decimal?',
  'as-hundredths': 'How many hundredths is each tenth worth? And each one?',
  regroup: 'How many of them make one whole? How many are left over after it?',
  grid: 'How many small squares make the whole square? How many of them are shaded?',
  split: 'How many hundredths is the part after the point? How many of them are given?',
  partition: 'How many thousandths is the part after the point? How many of them are given?',
  'digit-place': 'How many thousandths is that digit worth? How many thousandths make each place?',
  rename: 'How many thousandths is the part after the point? How many of those are in the part you\'re given?',
};
const placeWords = (sum) => DEC_PLACES.slice(0, sum.places);

const decChartWay = {
  op: 'rep', title: 'The place value chart',
  fits: (sum) => sum?.op === 'rep',
  steps: chartSteps,
  picture: (sum) => (sum.key === 'grid' ? decGrid(sum) : decChart(sum)),
  hint: (sum) => CHART_HINTS[sum.key],
  words: (sum) => ['place value', 'decimal point', ...placeWords(sum), ...(sum.key === 'regroup' ? ['regroup'] : [])],
};

const decFraction = {
  op: 'rep', title: 'As a fraction',
  fits: (sum) => sum?.op === 'rep',
  steps: fractionSteps,
  // the 100 grid for a number under 1 of tenths and hundredths, else the chart
  picture: (sum) => (sum.key === 'grid' || (sum.places === 2 && !decParts(sum.value).ones) ? decGrid(sum) : decChart(sum)),
  hint: (sum) => FRACTION_HINTS[sum.key],
  words: (sum) => ['decimal', 'fraction', ...placeWords(sum), ...(['split', 'partition'].includes(sum.key) ? ['partition'] : [])],
};

// ---- decimals: comparing and ordering (dec-compare), the sums { op: 'cmp', key, a, b, options? } of engine/items/
// decimals.js (a ☐ b; or, for between, which of the options lies between a and b) and { op: 'ord', key, values } (to
// order, or the biggest of), every number as written, so '0.50' keeps its zero. "Compare and order decimal numbers of up
// to 3 decimal places" (l.66) and "Interpret zero digit(s) at the end of a decimal" (l.67), Stage 3 Represents numbers A,
// MA3-RN-02, saved copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-fa87632ef7.md; "Compare and order
// decimals of up to 2 decimal places", Stage 2 Representing numbers using place value B, MA2-RN-02, saved copy
// 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fa1dbb9271.md l.73, for the easy level; a number line
// divided into tenths (IES 2010 l.584). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October
// 2026. Lining up the points works every one; giving them all the same places with zeros at the end works every one;
// the number line only where they all lie between the same two whole numbers, each different number in a tenth of its
// own, so the line of tenths alone puts them in order and its picture shows them apart, and says so where not. ----

// every number a comparing sum works with
const compared = (sum) => (sum.op === 'cmp' ? [sum.a, sum.b, ...(sum.options ?? [])] : sum.values);
const SIGN_SAID = { '<': 'less than', '=': 'equal to', '>': 'greater than' };
const betweenOne = ({ a, b, options }) => options.find((o) => thOf(o) > thOf(a) && thOf(o) < thOf(b));

// the last step, the answer in words (js/runner.js "Show me one step" stops before it, for a choice or an order)
function comparedAnswer(sum) {
  if (sum.key === 'between') return { text: `So ${betweenOne(sum)} is between ${sum.a} and ${sum.b}.` };
  if (sum.op === 'cmp') {
    const s = signOf(sum.a, sum.b);
    return { text: `So ${sum.a} is ${SIGN_SAID[s]} ${sum.b}: ${sum.a} ${s} ${sum.b}` };
  }
  if (sum.key === 'biggest') return { text: `So ${inOrder(sum.values).at(-1)} is the biggest.` };
  return { text: `Smallest first: ${inOrder(sum.values).join(', ')}` };
}

// x the smaller of two, and the first place from the left where they differ: "2.347 < 2.351: the hundredths differ, 4
// and 5."; a place only the bigger has a digit in, "0.4 < 0.45: 0.45 has 5 hundredths, and 0.4 has none."
function firstDiffer(x, y) {
  const p = decParts(x), q = decParts(y);
  if (p.ones !== q.ones) return { text: `${x} < ${y}: the whole numbers differ, ${p.ones} and ${q.ones}.` };
  const i = [0, 1, 2].find((k) => p.d[k] !== q.d[k]);
  if (i >= p.places) return { text: `${x} < ${y}: ${y} has ${countOf(q.d[i], i + 1)}, and ${x} has none.` };
  return { text: `${x} < ${y}: the ${DEC_PLACES[i]} differ, ${p.d[i]} and ${q.d[i]}.` };
}

function placesSteps(sum) {
  const first = { text: 'Line up the points, then compare from the biggest place.' };
  if (sum.key === 'between') {
    // each wrong choice against the number it is below or past
    const wrong = sum.options.filter((o) => o !== betweenOne(sum));
    return [first, ...wrong.map((o) => (thOf(o) < thOf(sum.a) ? firstDiffer(o, sum.a) : firstDiffer(sum.b, o))), comparedAnswer(sum)];
  }
  if (sum.op === 'cmp') {
    if (thOf(sum.a) === thOf(sum.b)) return [first, { text: 'Every place is the same, and zeros at the end add nothing.' }, comparedAnswer(sum)];
    // the place that decides, in the question's order and with no sign, which is hers to give (js/runner.js "Show me one
    // step" stops before the last step, the answer)
    const p = decParts(sum.a), q = decParts(sum.b);
    const i = [0, 1, 2].find((k) => p.d[k] !== q.d[k]);
    const [has, none, k] = i >= p.places ? [sum.b, sum.a, i] : i >= q.places ? [sum.a, sum.b, i] : [];
    const differ = p.ones !== q.ones ? `The whole numbers differ: ${p.ones} and ${q.ones}.`
      : has ? `In the ${DEC_PLACES[k]}, ${has} has ${countOf(decParts(has).d[k], k + 1)}, and ${none} has none.`
        : `They first differ in the ${DEC_PLACES[i]}: ${p.d[i]} and ${q.d[i]}.`;
    return [first, { text: differ }, comparedAnswer(sum)];
  }
  if (sum.key === 'biggest') {
    const big = inOrder(sum.values).at(-1);
    return [first, ...sum.values.filter((v) => v !== big).map((v) => firstDiffer(v, big)), comparedAnswer(sum)];
  }
  const s = inOrder(sum.values);
  return [first, ...s.slice(1).map((y, i) => firstDiffer(s[i], y)), comparedAnswer(sum)];
}

// each number given the most places any of them has, zeros at the end, then read without its point: a whole number
function zerosSteps(sum) {
  const all = compared(sum);
  const k = Math.max(...all.map((v) => splitDecimal(v).frac.length));
  const padded = (v) => `${splitDecimal(v).whole}.${splitDecimal(v).frac.padEnd(k, '0')}`;
  const whole = (v) => fmt(thOf(v) / 10 ** (3 - k));
  if (sum.key === 'between') {
    return [{ text: `Give each ${k} places: ${sum.a} is ${padded(sum.a)} and ${sum.b} is ${padded(sum.b)}.` },
      { text: `The choices are ${sum.options.map(padded).join(', ')}.` },
      { text: `Without the points: ${whole(sum.a)} and ${whole(sum.b)}, and the choices ${sum.options.map(whole).join(', ')}.` },
      comparedAnswer(sum)];
  }
  const same = all.every((v) => splitDecimal(v).frac.length === k);
  return [{ text: same ? `Each already has ${k} place${k === 1 ? '' : 's'}.` : `Give each ${k} places: ${all.map(padded).join(', ')}.` },
    { text: `Leave out the points and compare whole numbers: ${andList(all.map(whole))}.` }, comparedAnswer(sum)];
}

// the whole number they all lie at or after, when they all lie between it and the next one; else null
function lineStart(sum) {
  const th = compared(sum).map(thOf);
  const n = Math.floor(Math.min(...th) / 1000);
  return Math.max(...th) <= (n + 1) * 1000 ? n : null;
}
// two different numbers in one tenth: a line of tenths does not tell them apart, and on its picture they are drawn a few
// pixels apart at most (a thousandth is about 0.3 px), their labels on top of each other
const shareATenth = (sum) => {
  const th = [...new Set(compared(sum).map(thOf))];
  return new Set(th.map((t) => Math.floor(t / 100))).size < th.length;
};
// where a number sits on a line of tenths: on a tenth's mark, or between two; where the same number written another way
// shares its tenth (0.25 and 0.250), how far past the tenth's mark, counted in the smallest place either has
function onLine(v, list) {
  const t = Math.floor(thOf(v) / 100) * 100;
  if (thOf(v) === t) return { text: `${v} is on the ${decimalText(t)} mark.` };
  const mates = list.filter((w) => w !== v && Math.floor(thOf(w) / 100) * 100 === t);
  if (!mates.length) return { text: `${v} is between ${decimalText(t)} and ${decimalText(t + 100)}.` };
  const k = Math.max(...[v, ...mates].map(placesOf));
  return { text: `${v} is ${countOf((thOf(v) - t) / 10 ** (3 - k), k)} past ${decimalText(t)}.` };
}
function lineSteps(sum) {
  const n = lineStart(sum);
  const found = sum.key === 'between' ? sum.options : sum.op === 'cmp' ? [sum.a, sum.b] : sum.values;
  return [{ text: `Find each on a line from ${n} to ${n + 1} in tenths: further right is bigger.` },
    ...found.map((v) => onLine(v, found)), comparedAnswer(sum)];
}

// the numbers one a row, lined up at the point: the way's working, so on a question it is left out (js/runner.js asked)
const comparedRows = (sum, zeros) => {
  const all = compared(sum);
  return { type: 'placevalue', rows: all, columns: Math.max(...all.map((v) => splitDecimal(v).whole.length)),
    decimals: Math.max(...all.map(placesOf)), ...(zeros ? { zeros: true } : {}), working: true };
};

const PLACES_HINTS = {
  compare: 'Did you line up the points? Which is the first place, from the left, where the digits are different?',
  zeros: 'Line up the points. Is any place different, or are the extra digits only zeros?',
  order: 'Did you line up the points and start from the biggest place? Where two digits match, did you look at the next place?',
  biggest: 'Did you line up the points and compare from the biggest place, the ones first?',
  between: 'Line up the points. Is your choice bigger than the first number, and smaller than the second?',
};
const ZEROS_HINTS = {
  compare: 'Did you give both numbers the same number of places, with zeros at the end?',
  zeros: 'Give both the same number of places. Does a zero at the end change what a decimal is worth?',
  order: 'Did you give them all the same number of places, with zeros at the end, before comparing?',
  biggest: 'With zeros at the end so they all have the same number of places, which whole number is biggest?',
  between: 'Give them all the same number of places with zeros. Which choice is bigger than the first and smaller than the second?',
};
const LINE_HINTS = {
  compare: 'Where is each number on a line of tenths? Which one is further right?',
  zeros: 'Where is each number on the line? Are they at the same place?',
  order: 'Where does each number sit on a line of tenths? Which is furthest left?',
  biggest: 'Where does each number sit on a line of tenths? Which is furthest right?',
  between: 'Find the two numbers on the line. Which choice sits between them?',
};
const comparedWords = (sum) => (sum.op === 'cmp' && sum.key !== 'between' ? ['less than', 'greater than', 'equals'] : sum.key === 'order' ? ['ascending order'] : []);
const COMPARED = (sum) => sum?.op === 'cmp' || sum?.op === 'ord';

const decPlaces = {
  op: 'cmp', title: 'Line up the points',
  fits: COMPARED,
  steps: placesSteps,
  picture: (sum) => comparedRows(sum, false),
  hint: (sum) => PLACES_HINTS[sum.key],
  words: (sum) => ['decimal point', 'place value', ...comparedWords(sum)],
};

const decZeros = {
  op: 'cmp', title: 'Same number of places',
  fits: COMPARED,
  steps: zerosSteps,
  picture: (sum) => comparedRows(sum, true),
  hint: (sum) => ZEROS_HINTS[sum.key],
  words: (sum) => ['decimal point', 'decimal places', ...comparedWords(sum)],
};

const decLine = {
  op: 'cmp', title: 'A number line',
  fits: (sum) => COMPARED(sum) && lineStart(sum) !== null && !shareATenth(sum),
  stops: (sum) => (lineStart(sum) === null ? 'they are not all between the same two whole numbers'
    : shareATenth(sum) ? 'two of them share a tenth, too close to tell apart' : null),
  steps: lineSteps,
  picture(sum) {
    const n = lineStart(sum);
    return { type: 'numberline', from: String(n), to: String(n + 1), step: '0.1', marks: compared(sum).map((v) => ({ at: v, label: v })), working: true };
  },
  hint: (sum) => LINE_HINTS[sum.key],
  words: (sum) => ['number line', 'tenths', ...comparedWords(sum)],
};

// ---- decimals on a number line (dec-numberline), the sums { op: 'loc', key, from, to, step, by, at, letters? } (a line
// from `from` to `to` with a mark every `by`, the number at `at` read to the nearest `step`; for which, the numbers of
// the letters A, B and C, left to right, and the one asked) and { op: 'near', key, value, to, options? } (value to the
// nearest `to`, '1', '0.1' or '0.01'). "Place decimal numbers of up to 3 decimal places on a number line" (l.70) and
// "Approximate the size of decimals" (l.69), Stage 3 Represents numbers A, MA3-RN-02, saved copy 2026-10-10-1116-article-
// k-10-mathematics-k-10-syllabus-2022-fa87632ef7.md, its Examples read live 25 October 2026 (1.60 on a line from 0 to 2
// marked in halves; "To 2 decimal places 1.254 is 1.25"); a line divided into tenths, one tenth cut again into 10 (IES
// 2010 l.584, l.1328-1330). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026. The
// letters A, B and C are chosen for this game, not a syllabus requirement. Reading the marks works every one; zooming in
// only a line read to hundredths or thousandths, or the nearest tenth or hundredth, and says why on the rest. ----

const ZOOM_KEYS = ['read-zoom', 'read-thousandths', 'near-tenth', 'near-hundredth'];
const LETTERS = ['A', 'B', 'C'];
// the one space of the line, `by` wide, the number sits in: a tenth, or a hundredth
function spaceOf(sum) {
  const by = thOf(sum.by), from = Math.floor(thOf(sum.at) / by) * by;
  return { from: decimalText(from), to: decimalText(from + by) };
}
// the near- sums: the two numbers either side at the place asked, the halfway between them, and the nearer
function nearParts(sum) {
  const v = thOf(sum.value), to = thOf(sum.to), lo = Math.floor(v / to) * to;
  return { v, lo: decimalText(lo), hi: decimalText(lo + to), mid: decimalText(lo + to / 2), past: v - lo > to / 2, ans: roundTo(v, to).value };
}
const letterAt = (sum) => ({ text: `So the letter at ${sum.at} is ${LETTERS[sum.letters.indexOf(sum.at)]}.` });
// what one space is worth: the gap between the line's ends ÷ the equal spaces between them
const spaceWorth = (from, to, spaces, value, line = `From ${from} to ${to} there are`) => ({ text: `${line} ${spaces} equal spaces: ${decimalText(thOf(to) - thOf(from))} ÷ ${spaces} = ☐`, value });

function ticksSteps(sum) {
  if (sum.op === 'near') {
    const { lo, hi, mid, past, ans } = nearParts(sum);
    const half = { text: `Halfway between ${lo} and ${hi} is ☐`, value: mid };
    const side = `${sum.value} is ${past ? 'past' : 'before'} halfway, so`;
    if (sum.key === 'near-whole') return [half, { text: `${side} ${sum.value} to the nearest whole number is ☐`, value: ans / 1000 }];
    // a choice of tenths the question does not show: no step before the last names one (js/runner.js "Show me one step")
    if (sum.key === 'near-tenth') {
      return [{ text: `Find the tenths either side of ${sum.value} on the line, and the halfway mark between them.` },
        { text: `The point is ${past ? 'past' : 'before'} the halfway mark, nearer the tenth ${past ? 'after' : 'before'} it.` },
        { text: `So ${sum.value} is nearest ${decimalText(ans)}.` }];
    }
    return [{ text: '2 decimal places is the nearest hundredth.' }, half, { text: `${side} ${sum.value} to the nearest 0.01 is ☐`, value: decimalText(ans) }];
  }
  const at = thOf(sum.at), by = thOf(sum.by), step = thOf(sum.step);
  if (sum.key === 'which') {
    const t = Math.floor(at / 100) * 100, h = (at - t) / 10;
    const [lo, hi] = [decimalText(t), decimalText(t + 100)];
    return [spaceWorth(sum.from, sum.to, (thOf(sum.to) - thOf(sum.from)) / by, sum.by),
      { text: h === 5 ? `${sum.at} is halfway between ${lo} and ${hi}.` : `${sum.at} is between ${lo} and ${hi}, nearer ${h < 5 ? lo : hi}.` }, letterAt(sum)];
  }
  if (ZOOM_KEYS.includes(sum.key)) {
    // the point is on the bottom line only (engine/render/svg.js numberline zoom), cut into 10 from the space's start
    const z = spaceOf(sum), count = (at - thOf(z.from)) / step;
    return [spaceWorth(z.from, z.to, 10, sum.step, `The bottom line goes from ${z.from} to ${z.to} in`),
      { text: `Count the spaces from ${z.from} to the point: ☐`, value: count },
      { text: `${z.from} + ${count} × ${sum.step} = ☐`, value: sum.at }];
  }
  const spaces = (thOf(sum.to) - thOf(sum.from)) / by;
  if (by === step) {
    const count = (at - thOf(sum.from)) / step;
    return [spaceWorth(sum.from, sum.to, spaces, sum.by), { text: `Count the spaces from ${sum.from} to the point: ☐`, value: count },
      { text: `${sum.from} + ${count} × ${sum.by} = ☐`, value: sum.at }];
  }
  // marked in halves or quarters, a choice of three tenths (engine/items/decimals.js lineSum): a tenth there is too fine
  // to count on (plans/2026-10-26-stage-6-step6-fixes.md, fix 8), so the marks either side of the point decide, the
  // other two options before or after them; no boxes, as a choice's steps have none
  const lo = Math.floor(at / by) * by, hi = lo + by;
  const others = inOrder(sum.options.filter((o) => thOf(o) !== at));
  const side = (o) => (thOf(o) < lo ? `${o} is before ${decimalText(lo)}` : `${o} is after ${decimalText(hi)}`);
  return [{ text: `The point is between the ${decimalText(lo)} mark and the ${decimalText(hi)} mark.` },
    { text: `${side(others[0])}, and ${side(others[1])}.` }, { text: `So the point is at ${sum.at}.` }];
}

function zoomSteps(sum) {
  if (sum.op === 'near') {
    const { v, lo, hi, past, ans } = nearParts(sum);
    const { d } = decParts(sum.value);
    if (sum.key === 'near-tenth') {
      return [{ text: `First find the tenth ${sum.value} is in, and cut it into 10 hundredths.` },
        { text: `Its hundredths digit is ${d[1]}, so it is ${past ? 'past' : 'before'} 5 of the 10, halfway.` },
        { text: `So ${sum.value} is nearest ${decimalText(ans)}.` }];
    }
    return [{ text: `First the hundredth: ${sum.value} is between ${lo} and ${hi}.` },
      { text: `Cut it into 10 smaller spaces: ${sum.value} − ${lo} = ☐`, value: decimalText(v - thOf(lo)) },
      { text: `That is ${past ? 'more' : 'less'} than halfway, so ${sum.value} to the nearest 0.01 is ☐`, value: decimalText(ans) }];
  }
  const { d } = decParts(sum.at);
  if (sum.key === 'which') {
    const t = Math.floor(thOf(sum.at) / 100) * 100;
    return [{ text: `First the tenth: ${sum.at} is between ${decimalText(t)} and ${decimalText(t + 100)}.` },
      { text: `Cut that tenth into 10 hundredths: ${sum.at} − ${decimalText(t)} = ☐`, value: decimalText(thOf(sum.at) - t) }, letterAt(sum)];
  }
  const z = spaceOf(sum);
  if (sum.key === 'read-zoom') {
    return [{ text: `The point is in the tenth from ${z.from} to ${z.to}, so its tenths digit is ☐`, value: d[0] },
      { text: `Count the hundredths from ${z.from} to the point: ☐`, value: d[1] },
      { text: `${z.from} + ${partText(d[1], 2)} = ☐`, value: sum.at }];
  }
  return [{ text: `The point is in the hundredth from ${z.from} to ${z.to}, so its hundredths digit is ☐`, value: d[1] },
    { text: `Count the smaller spaces from ${z.from} to the point: ☐`, value: d[2] },
    { text: `${z.from} + ${partText(d[2], 3)} = ☐`, value: sum.at }];
}

// the picture, the same whichever way works it: the line and its point (a box), with the space it is in drawn again
// under it for a line read to hundredths or thousandths; the letters with no point; for the near- keys the line between
// the two numbers either side, marked in the next smaller place, the point labelled with the number asked about, which
// is the way's working (the two either side), so left off a question (js/runner.js asked)
function linePicture(sum) {
  if (sum.op === 'near') {
    const { lo, hi } = nearParts(sum);
    return { type: 'numberline', from: lo, to: hi, step: decimalText(thOf(sum.to) / 10), point: { at: sum.value, label: sum.value }, working: true };
  }
  if (sum.key === 'which') return { type: 'numberline', from: sum.from, to: sum.to, step: sum.by, marks: sum.letters.map((at, i) => ({ at, label: LETTERS[i] })), letters: true };
  // a choice (the halves-or-quarters read) has no box to read into at its point: the dot alone, as the game's other
  // choice on a line, which letter, has none (the replay's screenshot 137)
  const label = sum.options ? '' : '?';
  return { type: 'numberline', from: sum.from, to: sum.to, step: sum.by, point: { at: sum.at, label }, ...(ZOOM_KEYS.includes(sum.key) ? { zoom: spaceOf(sum) } : {}) };
}

const TICKS_HINTS = {
  read: 'How many equal spaces are there between two labelled marks? What is one space worth?',
  'read-zoom': 'On the bottom line, what is one space worth? How many spaces past its first mark is the point?',
  'read-thousandths': 'On the bottom line, what is one space worth? How many spaces past its first mark is the point?',
  which: 'What is one space on the line worth? Which space is that number in?',
  'near-whole': 'Which two whole numbers is it between? Is it before or past the halfway mark?',
  'near-tenth': 'Which two tenths is it between? Is it before or past the halfway mark?',
  'near-hundredth': 'Which two hundredths is it between? Is it before or past halfway?',
};
const ZOOM_HINTS = {
  'read-zoom': 'Which tenth is the point in? How many hundredths past the start of that tenth is it?',
  'read-thousandths': 'Which hundredth is the point in? Then how many smaller spaces past its start is it?',
  which: 'Which tenth is that number in? How far along that tenth is it?',
  'near-tenth': 'Which tenth is it in? Cut that tenth into hundredths: is it before or past halfway?',
  'near-hundredth': 'Which hundredth is it in? Cut it into ten smaller spaces: is it before or past halfway?',
};
const LINE_SUMS = (sum) => sum?.op === 'loc' || sum?.op === 'near';
const zooms = (sum) => (sum?.op === 'loc' ? ['0.01', '0.001'].includes(sum.step) : sum?.op === 'near' && ['0.1', '0.01'].includes(sum.to));

const decTicks = {
  op: 'loc', title: 'Read the marks',
  fits: LINE_SUMS,
  steps: ticksSteps,
  picture: linePicture,
  hint: (sum) => TICKS_HINTS[sum.key],
  words: (sum) => ['number line', ...(sum.op === 'near' ? ['approximate'] : [])],
};

const decZoom = {
  op: 'loc', title: 'Zoom in',
  fits: (sum) => LINE_SUMS(sum) && zooms(sum),
  // the way taught for the keys read past tenths (plan D4, "Ways"), where no way is asked
  leads: (sum) => ZOOM_KEYS.includes(sum.key),
  stops: (sum) => (zooms(sum) ? null : sum.op === 'near' ? 'the nearest whole number has nothing to zoom into' : 'the line has only tenths, with nothing to zoom into'),
  steps: zoomSteps,
  picture: linePicture,
  hint: (sum) => ZOOM_HINTS[sum.key],
  words: (sum) => ['number line', sum.key === 'read-thousandths' || sum.key === 'near-hundredth' ? 'hundredths' : 'tenths', ...(sum.op === 'near' ? ['approximate'] : [])],
};

// ---- decimals 10 and 100 times as large, a tenth and a hundredth of (dec-x10), the sum { op: 'x10', key, value, by,
// dir } of engine/items/decimals.js: value its decimal text, by 10 or 100, dir × (x10, x100, as-large) or ÷ (tenth,
// hundredth). "Compare the place value of digits by determining numbers that are 10 or 100 times the original decimal
// number as well as 1/10 or 1/100 times the original decimal numbers" (l.68) and "Express thousandths as decimals"
// (l.59), Stage 3 Represents numbers A, MA3-RN-02, saved copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-
// fa87632ef7.md. NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026. Moving the
// digits is the rule pv-x10 teaches (engine/items/placevalue.js, "every digit moves"), now past the point; counting in
// the smallest place works it as whole numbers. Both work every one. ----

// the places a decimal writes a digit in, as powers of ten: '0.45' -> [0, -1, -2]
const writtenAt = (text) => {
  const { whole, frac } = splitDecimal(text);
  return [...[...whole].map((_, i) => whole.length - 1 - i), ...[...frac].map((_, i) => -1 - i)];
};
// whether the answer writes a 0 in a place no digit moved into (3.6 ÷ 10 = 0.36: the ones; 4.5 × 100 = 450: the ones)
function zerosFill(sum) {
  const shift = (sum.dir === '×' ? 1 : -1) * (sum.by === 10 ? 1 : 2);
  const moved = new Set(writtenAt(sum.value).map((e) => e + shift));
  return writtenAt(timesOf(sum)).some((e) => !moved.has(e));
}
const TIMES_SAID = { tenth: 'A tenth of a number is ÷ 10', hundredth: 'A hundredth of a number is ÷ 100' };

function moveSteps(sum) {
  const { key, value, by, dir } = sum;
  const z = by === 10 ? 1 : 2;
  const what = key === 'as-large' ? `${by} times as large means × ${by}` : TIMES_SAID[key] ?? `${dir} ${by}`;
  return [{ text: `${what}: every digit moves ${z} place${z > 1 ? 's' : ''} to the ${dir === '×' ? 'left' : 'right'}${zerosFill(sum) ? ', and 0s fill the empty places' : ''}.` },
    { text: `${value} ${dir} ${by} = ☐`, value: timesOf(sum) }];
}
// counted in the smallest place either number has, so the counts stay small: 0.045 × 100 in thousandths, 3.6 ÷ 10 in
// hundredths
const smallestOf = (sum) => Math.max(1, placesOf(sum.value), placesOf(timesOf(sum)));
function countSteps(sum) {
  const k = smallestOf(sum), per = 10 ** (3 - k);
  const n = thOf(sum.value) / per, m = thOf(timesOf(sum)) / per;
  return [{ text: `${sum.value} is ${countOf(n, k)}: ${fmt(n)} ${sum.dir} ${sum.by} = ☐`, value: m }, { text: `${countOf(m, k)} = ☐`, value: timesOf(sum) }];
}
// the chart with the number in it: the question's chart is empty (js/runner.js asked), wide enough for the answer
const timesChart = (sum) => ({ type: 'placevalue', value: sum.value, columns: Math.max(...[sum.value, timesOf(sum)].map((v) => splitDecimal(v).whole.length)), decimals: 3 });

const MOVE_HINTS = {
  x10: 'When you multiply, which way do the digits move? How many places?',
  x100: 'When you multiply, which way do the digits move? How many places?',
  tenth: 'A tenth of a number means divide. Which way do the digits move, and how many places?',
  hundredth: 'A hundredth of a number means divide. Which way do the digits move, and how many places?',
  'as-large': 'Times as large means multiply. Which way do the digits move, and how many places?',
};
const TIMES = (sum) => sum?.op === 'x10';

const decMove = {
  op: 'x10', title: 'Move the digits',
  fits: TIMES,
  steps: moveSteps,
  picture: timesChart,
  hint: (sum) => MOVE_HINTS[sum.key],
  words: (sum) => ['place value', 'decimal point', ...(sum.key === 'as-large' ? ['times as large'] : [])],
};

const decCount = {
  op: 'x10', title: 'Count in the smallest place',
  fits: TIMES,
  steps: countSteps,
  picture: timesChart,
  hint: (sum) => `How many ${DEC_PLACES[smallestOf(sum) - 1]} is the number? How many is that once you ${sum.dir === '×' ? 'multiply' : 'divide'}?`,
  words: (sum) => ['decimal', DEC_PLACES[smallestOf(sum) - 1], ...(sum.key === 'as-large' ? ['times as large'] : [])],
};

// ---- decimals: adding and subtracting (dec-addsub), the sums { op: 'd+' | 'd−', key, a, b } of engine/items/decimals.js,
// a and b decimal text, a > b to take away. "Model the addition and subtraction of decimals up to 3 decimal places using
// appropriate representations" (Stage 3 Additive relations B, MA3-AR-01, saved copy 2026-10-10-1117-article-k-10-
// mathematics-k-10-syllabus-2022-fa2ebf6217.md l.46); "addition for subtraction" (MA3-AR-01, NESA audit section 5); the
// 100 grid and lining up the points (IES 2010 l.796). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments,
// checked 25 October 2026. The written method, by columns with the points lined up and an empty place a 0, works every
// one, its working steps whole numbers (each column's digits, as addColumns and subColumns make them); partitioning
// works each place on its own, so only with a trade into one place at most; counting up only takes away. Every problem's
// first step, the estimate in wholes, is the generator's, before any way's (engine/items/decimals.js). ----

export const DSIGN = { 'd+': '+', 'd−': '−' };
const decSaid = ({ op, a, b }) => `${a} ${DSIGN[op]} ${b}`;
// the places after the point the columns line up to: the most either number has
const placesTo = ({ a, b }) => Math.max(placesOf(a), placesOf(b));
// a decimal's digits by column from the right, nd places after the point, an empty one 0: ('3.4', 2) -> [0, 4, 3]. When
// both numbers are under 1 (under: true) their ones are both 0 and nothing can be carried into them, a column the
// written method of whole numbers never has, so it is left out: ('0.45', 2, true) -> [5, 4]
const columnDigits = (text, nd, under = false) => {
  const { whole, frac } = splitDecimal(text);
  return [...[...frac.padEnd(nd, '0')].reverse(), ...(under ? [] : [...whole].reverse())].map(Number);
};
const underOne = ({ a, b }) => [a, b].every((v) => !Number(splitDecimal(v).whole));
// worked once for each sum, however many ways ask (a sum is never changed once made)
const once = (work) => {
  const done = new WeakMap();
  return (sum) => {
    if (!done.has(sum)) done.set(sum, work(sum));
    return done.get(sum);
  };
};
// column i's place, counted from the right with nd places after the point: its name and one of it
const colName = (i, nd) => (i < nd ? DEC_PLACES[nd - 1 - i] : PLACE_NAMES[i - nd]);
const colOne = (i, nd) => (i < nd ? DEC_ONE[nd - 1 - i] : ONE[i - nd]);

// The written method by columns from the right, with the place names of decimals: { steps, carries, into }. carries[i]
// is what is carried (or traded) into column i, for the 'columns' picture; into, the columns a carry or a trade goes
// into, smallest first, as the columns are worked (so a list of them never ends on "thousandths", which the voice is
// heard to say as "thousands" there: plans/2026-10-25-stage-6-log.md). Adding is addColumns itself, on each number's
// digits as a whole number of the smallest place (3.4 + 1.25 as 340 + 125). Taking away keeps a copy of subColumns:
// after a trade, subColumns says "after the trade there are 2 tens." as a sentence of its own and spells out a trade
// across every empty place, which with three places after the point makes a step of three sentences or over 25 words
// (tests/short.test.js); changing those lines would change every whole-number subtraction she has now.
export const decColumns = once((sum) => {
  const nd = placesTo(sum), place = { many: (i) => colName(i, nd), one: (i) => colOne(i, nd) };
  const under = underOne(sum);
  if (sum.op === 'd+') {
    const scaled = [sum.a, sum.b].map((v) => thOf(v) / 10 ** (3 - nd));
    const { steps, carries } = addColumns(scaled, place, [sum.a, sum.b].map((v) => columnDigits(v, nd, under).length));
    const into = carries.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
    if (steps.length > carries.length) into.push(carries.length);
    return { steps, carries, into };
  }
  const cur = columnDigits(sum.a, nd, under), y = columnDigits(sum.b, nd, under), width = cur.length;
  const steps = [], into = [];
  const lowered = Array(width).fill(false), carries = Array(width).fill(0);
  for (let i = 0; i < width; i++) {
    const name = cap(colName(i, nd));
    const now = lowered[i] ? 'after the trade, ' : '';
    // the top column traded down to 0, with nothing under it to take away (1.2 − 0.5: the ones), as subColumns says it
    if (i === width - 1 && lowered[i] && cur[i] === 0 && !(y[i] ?? 0)) {
      steps.push({ text: `${name}: after the trade there are no ${colName(i, nd)} left.` });
      continue;
    }
    if (i >= y.length) {
      steps.push({ text: `${name}: ${now}nothing to take away, so write ☐`, value: cur[i] });
      continue;
    }
    const b = y[i], have = cur[i];
    if (have >= b) {
      steps.push({ text: `${name}: ${now}${have} − ${b} = ☐`, value: have - b });
      continue;
    }
    // from the next place with something in it, through any empty places between
    let j = i + 1;
    while (cur[j] === 0) j++;
    for (let k = j; k > i; k--) {
      cur[k] -= 1;
      cur[k - 1] += 10;
      lowered[k] = true;
      carries[k - 1] = 1;
    }
    const how = j === i + 1 ? `trade 1 ${colOne(j, nd)} for 10 ${colName(i, nd)}`
      : j === i + 2 ? `trade 1 ${colOne(j, nd)} for 10 ${colName(j - 1, nd)}, then 1 ${colOne(j - 1, nd)} for 10 ${colName(i, nd)}`
        : `trade 1 ${colOne(j, nd)} down through the empty places, leaving 9 in each`;
    // a trade down through an empty place is said in a step of its own, with no box, then the taking away: in one step
    // it ran to 27 words as said (tests/short.test.js allows 25)
    if (j > i + 1) {
      steps.push({ text: `${name}: ${now}${have} is less than ${b}, so ${how}.` });
      steps.push({ text: `${name}: ${cur[i]} − ${b} = ☐`, value: cur[i] - b });
    } else steps.push({ text: `${name}: ${now}${have} is less than ${b}, so ${how}. ${cur[i]} − ${b} = ☐`, value: cur[i] - b });
  }
  for (let i = 0; i < width; i++) if (carries[i]) into.push(i);
  return { steps, carries, into };
});

// "Line up the points, and write 6.3 as 6.30.": the number with fewer places, given the other's with 0s
function lineUp(sum) {
  const nd = placesTo(sum);
  const short = [sum.a, sum.b].find((v) => placesOf(v) < nd);
  if (!short) return { text: 'Line up the points.' };
  return { text: `Line up the points, and write ${short} as ${splitDecimal(short).whole}.${splitDecimal(short).frac.padEnd(nd, '0')}.` };
}

const DEC_COLUMN_HINTS = {
  'd+': 'Are the points lined up? Did you start at the right, and carry when a column made ten or more?',
  'd−': 'Are the points lined up? Is each top digit big enough to take away the one under it, or does it need a trade?',
};
const ADDING = (sum) => sum?.op === 'd+' || (sum?.op === 'd−' && thOf(sum.a) >= thOf(sum.b));

const decColumn = {
  op: 'd+', title: 'The written method',
  fits: ADDING,
  steps: (sum) => [lineUp(sum), ...decColumns(sum).steps.map((st) => ({ ...st })), { text: `So ${decSaid(sum)} = ☐`, value: worthOf(sum) }],
  picture: (sum) => ({ type: 'columns', op: DSIGN[sum.op], top: sum.a, bottom: sum.b, decimals: placesTo(sum), carries: decColumns(sum).carries }),
  hint: (sum) => DEC_COLUMN_HINTS[sum.op],
  words: (sum) => ['decimal point', sum.op === 'd+' ? 'sum' : 'difference', 'regroup', 'place value'],
};

// Partitioning, largest place first, the first number split into its places before anything else: each place where both
// numbers have a part is added or taken away, and a part only one number has goes straight into putting the parts
// together (as split does for whole numbers). Taking away, the one
// trade it takes is made first and said, so each place can be done on its own. A trade into more than one place (or a
// trade across an empty place, which goes into two) is the written method's; so is a sum where a place taken away
// leaves 0 (3 − 2.1: 2 − 2 in the ones, a box for nothing), or where only one place is worked, its one part the answer
// itself with nothing to put together (0.5 + 0.3). { steps, zeros, traded, parts, worked }: the places left at 0 (traded:
// one of them only after the trade took 1 from it, 3 − 2.1), the parts put together, and the places worked
const splitWork = once((sum) => {
  const nd = placesTo(sum), add = sum.op === 'd+';
  const x = columnDigits(sum.a, nd), y = columnDigits(sum.b, nd);
  const width = Math.max(x.length, y.length);
  const unitOf = (i) => 10 ** (3 - nd + i); // a column's place, in thousandths
  // a part as text; one traded into is written to its own place (10 hundredths, 0.10), so the trade can be seen
  const part = (i, d, traded = false) => {
    const t = d * unitOf(i);
    if (!traded || i >= nd) return decimalText(t);
    const k = nd - i;
    return `${Math.floor(t / 1000)}.${String(t % 1000).padStart(3, '0').slice(0, k)}`;
  };
  const steps = [], zeros = [], worked = [];
  let traded = false;
  // the first number split into its places first, a step with no box, so each part the steps take from it is seen to come
  // from it ("Split 96.2 into its places: 90 + 6 + 0.2."; plans/2026-10-26-replay-findings-fixes.md, fix 5): a place at 0
  // is left out, and a number with one place only has nothing to split
  const own = x.map((d, i) => (d ? part(i, d) : null)).filter(Boolean).reverse();
  if (own.length > 1) steps.push({ text: `Split ${sum.a} into its places: ${own.join(' + ')}.` });
  const at = add ? -1 : x.findIndex((d, i) => d < (y[i] ?? 0));
  if (at >= 0 && at + 1 < x.length) {
    x[at + 1] -= 1;
    x[at] += 10;
    steps.push({ text: `The ${colName(at, nd)} need a trade, so trade 1 ${colOne(at + 1, nd)} for 10 ${colName(at, nd)}.` });
  }
  const parts = [];
  for (let i = width - 1; i >= 0; i--) {
    const dx = x[i] ?? 0, dy = y[i] ?? 0;
    const here = add ? dx + dy : dx - dy;
    if (dx && dy) {
      steps.push({ text: `${add ? 'Add' : 'Take away'} the ${colName(i, nd)}: ${part(i, dx, i === at)} ${DSIGN[sum.op]} ${part(i, dy)} = ☐`, value: part(i, here) });
      worked.push(colName(i, nd));
      if (!here) {
        zeros.push(colName(i, nd));
        traded ||= at >= 0 && i === at + 1;
      }
    }
    if (here) parts.push(part(i, here));
  }
  steps.push(parts.length > 1 ? { text: `Put the parts together: ${parts.join(' + ')} = ☐`, value: worthOf(sum) } : { text: `So ${decSaid(sum)} = ☐`, value: worthOf(sum) });
  return { steps, zeros, traded, parts, worked };
});

// why partitioning will not work a sum, or null where it does
function splitStops(sum) {
  if (!ADDING(sum)) return null;
  const { into } = decColumns(sum), nd = placesTo(sum);
  // into the tenths, hundredths and thousandths and no other place: said so, as the voice says that list "thousands"
  const after = nd === 3 && into.length === 3 && into.every((i) => i < 3) ? 'every place after the point' : null;
  if (into.length > 1) return `it needs a ${sum.op === 'd+' ? 'carry' : 'trade'} into ${after ?? andList(into.map((i) => `the ${colName(i, nd)}`))}`;
  const { zeros, traded, parts, worked } = splitWork(sum);
  if (zeros.length) return `${traded ? 'after the trade, ' : ''}taking away the ${andList(zeros)} leaves 0`;
  return parts.length < 2 ? `only the ${worked[0]} can be worked, with no parts to put together` : null;
}

const decSplit = {
  op: 'd+', title: 'Partitioning',
  fits: (sum) => ADDING(sum) && !splitStops(sum),
  stops: splitStops,
  steps: (sum) => splitWork(sum).steps.map((st) => ({ ...st })),
  picture: () => null,
  hint: ({ op }) => (op === 'd+' ? 'Did you add each place where both numbers have a part, then put all the parts together?'
    : 'Did you take away in each place, trading first where a place needs it, then put the parts together?'),
  words: ({ op }) => ['partition', 'decimal', op === 'd+' ? 'sum' : 'difference'],
};

// Counting up from the smaller to the bigger, on an empty number line: to the next whole number, then the whole number
// of the bigger, then the rest (2.48 to 3, then 6, then 6.3), in thousandths; 3 jumps at most
function upStops({ a, b }) {
  const A = thOf(a), B = thOf(b), stops = [B];
  const next = Math.ceil(B / 1000) * 1000, floor = Math.floor(A / 1000) * 1000;
  if (next > B && next <= A) stops.push(next);
  if (floor > stops.at(-1)) stops.push(floor);
  if (A > stops.at(-1)) stops.push(A);
  return stops;
}

const decCountUp = {
  op: 'd−', title: 'Count up',
  fits: (sum) => sum?.op === 'd−' && thOf(sum.a) > thOf(sum.b),
  stops: ({ op }) => (op === 'd+' ? ADDS : null),
  steps(sum) {
    const stops = upStops(sum);
    const jumps = stops.slice(1).map((s, i) => decimalText(s - stops[i]));
    const steps = jumps.map((j, i) => ({ text: `${decimalText(stops[i])} + ☐ = ${decimalText(stops[i + 1])}`, value: j }));
    if (jumps.length > 1) steps.push({ text: `Add the jumps: ${jumps.join(' + ')} = ☐`, value: worthOf(sum) });
    return steps;
  },
  // an empty number line: only its ends ticked, a jump to each stop; not to scale (empty: true), so a jump of +0.092 beside
  // +1 has room for its label and arrow (plans/2026-10-26-stage-6-step6-fixes.md, fix 9)
  picture(sum) {
    const stops = upStops(sum);
    return { type: 'numberline', from: sum.b, to: sum.a, step: worthOf(sum), empty: true,
      jumps: stops.slice(1).map((s, i) => ({ from: decimalText(stops[i]), to: decimalText(s), label: `+${decimalText(s - stops[i])}` })),
      marks: stops.slice(1, -1).map((s) => ({ at: decimalText(s), label: decimalText(s) })) };
  },
  hint: () => 'Did you count up from the smaller number to the next whole number, then on, and add up the jumps?',
  words: () => ['difference', 'number line'],
};

export const METHODS = {
  partition, area, written,
  'ten-take': tenTake, double, 'ten-plus': tenPlus, 'five-plus': fivePlus,
  chunking, short: shortDiv,
  split, column, 'count-up': countUp,
  'take-parts': takeParts, compensate, level,
  'both-sides': bothSides, undo: undoIt, relation, 'count-on': countOn, backwards, 'guess-check': guessCheck,
  'double-it': doubleIt, tens, 'half-ten': halfTen, 'one-more': oneMore, 'near-square': nearSq, turn,
  family, halve,
  biggest, 'split-multiples': splitMultiples, 'area-div': areaDiv,
  'dec-chart': decChartWay, 'dec-fraction': decFraction,
  'dec-places': decPlaces, 'dec-zeros': decZeros, 'dec-line': decLine, 'dec-ticks': decTicks, 'dec-zoom': decZoom,
  'dec-move': decMove, 'dec-count': decCount, 'dec-column': decColumn, 'dec-split': decSplit, 'dec-count-up': decCountUp,
  // the fraction ways (stage 6 strand 2), each its own steps, picture, hint and words, in engine/fraction-ways.js
  ...FRACTION_WAYS,
  // the percentage ways (stage 6 strand 3), the same, in engine/percent-ways.js
  ...PERCENT_WAYS,
  // the measurement ways (stage 6 strand 4), the same, in engine/measure-ways.js
  ...MEASURE_WAYS,
  // the angle and position ways (stage 6 strand 4b), the same, in engine/geometry-ways.js
  ...GEOMETRY_WAYS,
};

// ---- the ways of the skills whose generators build their own steps (engine/items/ways.js; plans/2026-10-25-two-ways-plan.md):
// the way she learned is each generator's own steps; a second way fits the sums whose `ways` name it, and its steps come
// from the generator, so none has steps here, and none has `stops`: where the numbers stop a way, the generator says why ----
export const LEARNED = 'learned';
const familyWay = (title) => (id) => ({ title, fromGenerator: true, fits: (sum) => Boolean(sum.ways?.includes(id)) });
const FAMILY_WAYS = {
  [LEARNED]: familyWay('The way you learned'),
  'pv-values': familyWay('Add the values'),
  'pv-chart': familyWay('The place value chart'),
  'pv-halfway': familyWay('Find the halfway number'),
  'pv-rename': familyWay('Rename the units'),
  'place-parts': familyWay('Add place by place'),
  'count-up-big': familyWay('Count up'),
  'halve-bigger': familyWay('Half of a bigger one'),
  'double-smaller': familyWay('Double a smaller one'),
  'known-multiple': familyWay('The nearest multiple'),
  'remainder-gap': familyWay('Use the remainder'),
  'est-bounds': familyWay('Upper and lower estimates'),
  'est-compatible': familyWay('Compatible numbers'),
  share: familyWay('Share the multiplying'),
  'jump-rows': familyWay('Jump from a known row'),
  'divide-row': familyWay('Divide by the row number'),
  'number-line': familyWay('An empty number line'),
  'build-up': familyWay('Build up the groups'),
  regroup: familyWay('Regroup the steps'),
};
for (const [id, make] of Object.entries(FAMILY_WAYS)) METHODS[id] = make(id);

export const stepCount = (steps) => steps.filter((s) => 'value' in s).length;

// The ways a skill lists, and those that fit a sum.
export function methodsOf(skillId) {
  return BY_ID[skillId]?.methods ?? [];
}

// Whether a way works a sum, the one place every skill asks (methodsFor): a whole-number way, one that declares a
// whole-number op, never takes a decimal sum (stage 6: 'rep', 'cmp', 'ord', 'loc', 'near', 'x10', 'd+', 'd−', all its
// numbers text, which a whole-number way's >= would take as numbers), so no skill she has now changes.
export const WHOLE_OPS = ['×', '÷', '+', '−', '='];
export const wayFits = (id, sum) => !(WHOLE_OPS.includes(METHODS[id].op) && !WHOLE_OPS.includes(sum?.op)) && METHODS[id].fits(sum);

// A way may lead on the sums it is the taught way for (`leads`), ahead of the list's order: half of × 10 on 5 × 3 to 5 × 9.
export function methodsFor(skillId, sum) {
  const fits = methodsOf(skillId).filter((m) => wayFits(m, sum));
  const leads = (m) => Boolean(METHODS[m].leads?.(sum));
  return [...fits.filter(leads), ...fits.filter((m) => !leads(m))];
}

// The estimate that opens every decimal adding and taking away, whichever way works it and whoever asks (dec-addsub,
// and wp-decimals' stories, plan D6 and D7), said and shown with no box, so it never counts as a working step: each
// number to the nearest whole by the game's one rule, 5 tenths or more up (placevalue.js roundTo), or, when any of them
// is under 1, each to the nearest tenth, 5 hundredths or more up, since in wholes 0.78 − 0.42 is "1 − 0 = 1", which
// says nothing (plans/2026-10-26-stage-6-step6-fixes.md, fix 6); then the problem's own sign ("Teachers can ask
// students to provide an initial estimate and to explain their thinking before having them compute the answer", IES
// 2010 l.798-800). opening: its words where two ways side by side share it, shown and said once above them
// (js/runner.js askWay), each sentence with its numbers, so "First" is never said twice there; with no file it is shown
// unsaid, as every step with numbers is until the guide's pieces are built (js/speech.js).
// the place an estimate rounds its numbers to, in thousandths: 1000 a whole, or 100 a tenth when any is under 1
const estimatePlace = (values) => (values.some((v) => thOf(v) < 1000) ? 100 : 1000);
// The estimate of a sum { op, a, b }, or of a two-step story's { op, a, b, c, cFirst }: (a ± b) − c, or c − (a ± b)
// when cFirst (engine/items/wordproblems.js twoStep), each number rounded to the place above, worked in thousandths.
// { values, about, th, aboutTh, tenths, said }: the numbers rounded and the result as decimal text, the same in
// thousandths, whether in tenths, and the sum as written with them ("0.8 − 0.4", "5 − (1.8 − 0.4)")
export function estimateOf({ op, a, b, c, cFirst = false }) {
  const given = c === undefined ? [a, b] : [a, b, c];
  const place = estimatePlace(given);
  const th = given.map((v) => roundTo(thOf(v), place).value);
  const values = th.map(decimalText);
  const first = op === 'd+' ? th[0] + th[1] : th[0] - th[1], pair = `${values[0]} ${DSIGN[op]} ${values[1]}`;
  const aboutTh = c === undefined ? first : cFirst ? th[2] - first : first - th[2];
  const said = c === undefined ? pair : cFirst ? `${values[2]} − (${pair})` : `(${pair}) − ${values[2]}`;
  return { values, about: decimalText(Math.max(0, aboutTh)), th, aboutTh, tenths: place === 100, said };
}
// the words before an estimate's sum that say it is in tenths; the two ways' shared opening leaves them out, its numbers
// showing the tenths, since with them "Two ways to do this one. For both ways, about how big is 6 point 8 plus 0 point
// 1 …" runs past 25 words as said
const TENTHS_SAID = 'Each to the nearest tenth: ';
// an estimate's sum and result as a step says them: "Each to the nearest tenth: 0.8 − 0.4 = 0.4."
export const estimateWords = (est) => `${est.tenths ? TENTHS_SAID : ''}${est.said} = ${est.about}.`;
// whether the generators take an estimate: never 0, nor a number rounded to 0 ("85.3 + 0 = 85.3" says nothing to her),
// nor the answer itself, a step with no box that would say it (exact: the answer), all in thousandths
export const estimateFits = ({ th, aboutTh }, exact) => th.every((n) => n > 0) && aboutTh > 0 && aboutTh !== exact;
// first: the problem's first step, "First, about how big? …" (dec-addsub); a story's comes after its prompt card, so
// "About how big? …" (plans/2026-10-26-stage-6-step6-fixes.md, fix 7)
export function estimateStep(sum, { first = true } = {}) {
  const est = estimateOf(sum);
  return { text: `${first ? 'First, about' : 'About'} how big? ${estimateWords(est)}`, opening: `about how big is ${est.said}? About ${est.about}.` };
}

// A sum worked when `asked` is the way wanted: that way where it fits, else the first of the skill's ways that does.
// When the way asked is one of the skill's and cannot work this sum, a first step says so and why, in plain words,
// then names the way that does (research 4.3: show her where her way stops working); a decimal adding or taking away
// opens with its estimate before either, and so does a fraction one with related denominators (frac-addsub-related, plan
// F5: engine/fraction-ways.js fractionEstimateStep), never one with the same denominator (IES 2010 l.876). { method, steps }
export function wayFor(skillId, sum, asked) {
  const fits = methodsFor(skillId, sum);
  const method = fits.includes(asked) ? asked : fits[0];
  const steps = METHODS[method].steps(sum);
  const why = asked !== method && methodsOf(skillId).includes(asked) && METHODS[asked].stops?.(sum);
  const first = DSIGN[sum?.op] ? [estimateStep(sum)] : relatedSum(sum) ? [fractionEstimateStep(sum)] : [];
  if (!why) return { method, steps: [...first, ...steps] };
  return { method, steps: [...first, wontWork(asked, why, method, sum), ...steps] };
}

// the first step where the way asked stops: the one sentence every way says (engine/items/ways.js too), the way named by
// its title, or where that reads as a place by the name it has as a thing (refusedAs: "A number line won't work here");
// the way offered by its title, or by what it does on this sum where it has a name for that (offeredAs)
export const wontWork = (asked, why, method, sum) => ({ text: `${METHODS[asked].refusedAs ?? METHODS[asked].title} won't work here: ${why}. Here is another way: ${uncap(METHODS[method].offeredAs?.(sum) ?? wayTitle(method, sum))}.` });
// a way's name on this sum, wherever it is named (the two-ways screen, its choice, the refusal's offer): its title, or
// where the title is untrue of this sum the name of what it does here (namedAs: halving a half cuts in half once; the
// lead, pt62)
export const wayTitle = (method, sum) => METHODS[method].namedAs?.(sum) ?? METHODS[method].title;

const choices = (events, skillId) => events.filter((e) => e.type === 'method-choice' && e.skill === skillId);
// her choices within one group of a skill with groups: those whose two shown ways are both in it
const groupChoices = (events, skillId, group) => choices(events, skillId).filter((c) => c.shown.every((m) => group.includes(m)));

// Her way in each group of a skill with `groups` (engine/skills.js: its ways in sets that share a kind of problem, one
// set to a key; plans/2026-10-25-stage-6-plan.md "The ways", "Groups"): her latest choice whose two shown ways are both
// in it, else its first way, so her choice on one kind of problem never drops her way on another. { [group index]: way },
// Runner.make's opts.ways, by which the generator works each key.
export function groupWays(events, skillId) {
  return Object.fromEntries((BY_ID[skillId]?.groups ?? []).map((g, i) => [i, lastInGroup(events, skillId, g)?.chosen ?? g[0]]));
}
// her latest choice in a group, of a way of the skill's, or undefined
const lastInGroup = (events, skillId, group) => groupChoices(events, skillId, group).filter((c) => methodsOf(skillId).includes(c.chosen)).at(-1);
// Her latest choice in the group of a skill with groups whose ways include the way given, by groupWays' rule; null
// before she has chosen in it (js/runner.js: whether an answer was worked the way she chose).
export function groupChoice(events, skillId, method) {
  const group = BY_ID[skillId]?.groups?.find((g) => g.includes(method));
  return (group && lastInGroup(events, skillId, group)) ?? null;
}

// A facts skill keeps her ÷ way apart from her × way: a choice made on a division fact is marked op '÷', so choosing
// halving never drops the way she chose for multiplying. Every other choice is a × choice (op as for a facts skill;
// another skill's choices carry no op and are all of one kind).
export const choiceOp = (item) => (BY_ID[item.skill]?.kind === 'facts' && item.sum?.op === '÷' ? '÷' : '×');
export function lastChoice(events, skillId, op = '×') {
  return choices(events, skillId).filter((c) => (c.op === '÷') === (op === '÷')).at(-1);
}

// A skill worked by another skill's ways: word problems with decimals take her way of adding and taking away decimals
// until she chooses one for them ("worked by her dec-addsub way", stage 6 plan D7).
export const WAYS_FROM = { 'wp-decimals': 'dec-addsub' };

// Her way for a skill (for a facts skill, her × way, or her ÷ way with op '÷'): her latest choice; else, for a skill
// worked by another's ways (WAYS_FROM), her way there; undefined until she has chosen one, so the way taught comes from
// taughtFirst. last: her latest choice there, if already found.
export function preferredMethod(events, skillId, op = '×', last = lastChoice(events, skillId, op)) {
  if (last && methodsOf(skillId).includes(last.chosen)) return last.chosen;
  const from = WAYS_FROM[skillId];
  return from ? preferredMethod(events, from, op) : undefined;
}

// The way taught before she chooses: a facts skill's is each fact's own, the first of methodsFor's order (half of × 10
// leading on 5 × 3 to 5 × 9), so none is asked for; so is a skill's with a way that leads on some of its sums (zooming in
// on a line read past tenths, dec-numberline, plan D4 "Ways"); any other skill's is its first way, which its generator
// works where it fits, and wayFor says why where it does not.
export function taughtFirst(skillId) {
  const ways = methodsOf(skillId);
  return BY_ID[skillId]?.kind === 'facts' || ways.some((m) => METHODS[m].leads) ? undefined : ways[0];
}

// Her own tries with a way: learning, practice and warm-ups (not worked examples, the placement check or a sprint).
const TRIES = new Set(['learn', 'practice', 'review']);
// the way an answer was worked; one from before its skill had ways (no method) was the way she learned, where the skill has one
export const wayOf = (e) => e.method ?? (methodsOf(e.skill)[0] === LEARNED ? LEARNED : undefined);
const tryWith = (e, skillId, method) => e.type === 'answer' && e.skill === skillId && TRIES.has(e.phase) && (method ? wayOf(e) === method : Boolean(wayOf(e)));

// What has happened since her latest choice of way on a skill (all of it, before any choice).
function sinceChoice(events, skillId) {
  const last = choices(events, skillId).at(-1);
  return last ? events.slice(events.lastIndexOf(last) + 1) : events;
}

// How right and how quick she is with each way on a skill: { [way]: { tries, right, ms } }, ms the middle of her
// times right first time (null before she has one).
export function methodStats(events, skillId) {
  const out = {};
  for (const e of events) {
    if (!tryWith(e, skillId)) continue;
    const s = (out[wayOf(e)] ||= { tries: 0, right: 0, times: [] });
    s.tries++;
    if (e.correct && e.firstTry) { s.right++; if (e.ms != null) s.times.push(e.ms); }
  }
  for (const s of Object.values(out)) { s.ms = s.times.length ? middle(s.times) : null; delete s.times; }
  return out;
}

// The way for a warm-up on this skill: hers, except that school's way comes up in one warm-up in three once it has
// been shown to her, if she keeps another.
// A skill with groups gives none: the generator works each key by her way for its group (groupWays).
export function reviewMethod(events, skillId) {
  if (BY_ID[skillId]?.groups) return undefined;
  const mine = preferredMethod(events, skillId) ?? taughtFirst(skillId);
  const school = BY_ID[skillId]?.school;
  if (!school || mine === school || !choices(events, skillId).some((c) => c.shown.includes(school))) return mine;
  const warmUps = sinceChoice(events, skillId).filter((e) => e.type === 'answer' && e.skill === skillId && e.phase === 'review').length;
  return warmUps % 3 === 2 ? school : mine;
}

const SLIP_OF = 5;       // her last five answers her way, since she chose it
const SLIP_SHARE = 0.6;  // under 60% right first time, as engine/level.js's "finding it hard"
const SHOWN_TO = new Set(['learned', 'mastered', 'placed']);

// Today's second way, or null: { skill, mine, other, key?, sum?, op?, again }. The earliest skill on the map that she has learned
// (or already knew), is not the one she is learning today, and has a way she has not been shown beside hers; else one
// whose way is slipping (even once it needs a refresh and is being taught again), with the way she has done best with.
// Never on a day something new starts. A facts skill offers it on a fact she knows where both ways fit (key): its
// multiplication first, then, its × ways all shown, one of its divisions (sum, op '÷', her ÷ way beside halving).
export function compareOffer(st, events, { rng, target = null, fresh = false } = {}) {
  if (fresh) return null;
  for (const id of topoOrder(SKILLS.map((s) => s.id))) {
    const list = methodsOf(id);
    const status = st[id]?.status;
    if (list.length < 2) continue;
    if (BY_ID[id]?.groups) {
      const offer = groupOffer(st, events, id, target);
      if (offer) return offer;
      continue;
    }
    const shown = new Set(choices(events, id).flatMap((c) => c.shown));
    // a skill taught a way for each sum is set beside its other way from its first, as before it had one that leads
    const mine = preferredMethod(events, id) ?? taughtFirst(id) ?? (BY_ID[id]?.kind === 'facts' ? undefined : list[0]);
    if (id !== target && SHOWN_TO.has(status)) {
      if (st[id].facts) {
        const known = Object.keys(st[id].facts).filter((k) => st[id].facts[k].known);
        const order = rng.shuffle(known);
        for (const key of order) {
          const [a, b] = key.split('x').map(Number);
          const fits = methodsFor(id, { op: '×', a, b });
          const here = fits.includes(mine) ? mine : fits[0];
          const other = fits.find((m) => m !== here && !shown.has(m));
          if (here && other) return { skill: id, mine: here, other, key, again: false };
        }
        // once the × ways are shown, a division fact's: hers (the family, until she chooses) and halving, on the sum
        const mineDiv = preferredMethod(events, id, '÷');
        for (const key of order) {
          const [a, b] = key.split('x').map(Number);
          for (const d of new Set([a, b].filter((f) => f > 0))) {
            const sum = { op: '÷', n: a * b, d };
            const fits = methodsFor(id, sum);
            const here = fits.includes(mineDiv) ? mineDiv : fits[0];
            const other = fits.find((m) => m !== here && !shown.has(m));
            if (here && other) return { skill: id, mine: here, other, key, sum, op: '÷', again: false };
          }
        }
        continue;
      }
      const unseen = list.filter((m) => m !== mine && !shown.has(m));
      if (unseen.length) return { skill: id, mine, other: unseen[0], again: false };
    }
    if (st[id]?.facts || !(SHOWN_TO.has(status) || status === 'shaky')) continue;
    const recent = sinceChoice(events, id).filter((e) => tryWith(e, id, mine)).slice(-SLIP_OF);
    if (recent.length < SLIP_OF || recent.filter((e) => e.correct && e.firstTry).length / SLIP_OF >= SLIP_SHARE) continue;
    const stats = methodStats(events, id);
    const share = (m) => (stats[m]?.tries ? stats[m].right / stats[m].tries : 0);
    const other = list.filter((m) => m !== mine).sort((x, y) => share(y) - share(x))[0];
    return { skill: id, mine, other, again: true };
  }
  return null;
}

// compareOffer for a skill with groups, the same group by group, so the two ways set side by side always share a kind of
// problem and Runner.compare draws one both fit: a group's ways shown are those of its own choices, hers its groupWays
// entry, the other its first way not shown; the slip branch the same within a group, her tries with her way there since
// her latest choice in it. Null if no group has one to offer.
function groupOffer(st, events, id, target) {
  const status = st[id]?.status;
  const groups = BY_ID[id].groups, ways = groupWays(events, id);
  if (id !== target && SHOWN_TO.has(status)) {
    for (const [i, g] of groups.entries()) {
      const shown = new Set(groupChoices(events, id, g).flatMap((c) => c.shown));
      const other = g.find((m) => m !== ways[i] && !shown.has(m));
      if (other) return { skill: id, mine: ways[i], other, again: false };
    }
  }
  if (!(SHOWN_TO.has(status) || status === 'shaky')) return null;
  for (const [i, g] of groups.entries()) {
    const mine = ways[i], last = groupChoices(events, id, g).at(-1);
    const since = last ? events.slice(events.lastIndexOf(last) + 1) : events;
    const recent = since.filter((e) => tryWith(e, id, mine)).slice(-SLIP_OF);
    if (recent.length < SLIP_OF || recent.filter((e) => e.correct && e.firstTry).length / SLIP_OF >= SLIP_SHARE) continue;
    const stats = methodStats(events, id);
    const share = (m) => (stats[m]?.tries ? stats[m].right / stats[m].tries : 0);
    const other = g.filter((m) => m !== mine).sort((x, y) => share(y) - share(x))[0];
    if (other) return { skill: id, mine, other, again: true };
  }
  return null;
}
