// Multiplying, factors and estimating (NSW MA3-MR-01, with MA2-MR-01 and MA3-AR-01).
// mult-tens: a fact she knows, then the place value: "4 × 3 tens = 12 tens = 120" ("×10, 100, 1000 mentally").
// mult-1digit and mult-2digit: partitioning, the area model and the written method (MA3-MR-01: "Record the product of
// multiplying by a one-digit number using a formal algorithm"; "area model"; "Use a multiplication algorithm with
// understanding"). The ways are in engine/methods.js, which says how they are taught (the first, then the others beside
// hers, the written method kept in her warm-ups); here are the numbers. mult-1digit goes to 4 digits at the usual
// level, MA3-MR-01 "Use partitioning and place value to multiply 2-, 3- and 4-digit numbers by one-digit numbers"
// (Stage 3 MR-A, l.49, https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-3/fafab309e2;
// NSW Mathematics K–10 Syllabus (2022), checked 25 October 2026).
// opts.method works the sum that way; opts.sum, { op: '×', a, b }, asks for that sum (worked plainly, so two ways can
// be set side by side); opts.plain leaves out the sentence with a missing part. With neither, a way at random.
// factors: MA3-MR-01 "product", "factors", "prime, composite or neither (0 or 1)"; its common-factor kind is outside
// NESA, chosen for this game, not a syllabus requirement (engine/skills.js outsideNesaKeys).
// estimate: round each number to its leading place, then calculate, so the estimate is exact and checkable
// (MA3-MR-01 "Estimate the result"; MA3-AR-01 "check errors using... estimation").
// mult-tens, factors and estimate have the way she learned (the steps below) and second ways beside it, each for the
// kinds and numbers it fits (engine/items/ways.js; plans/2026-10-25-two-ways-plan.md): opts.also, a way to set beside
// another, draws a kind and numbers it fits; opts.method works the problem that way where it fits.

import { fmt } from '../check.js';
import { METHODS, partsOf } from '../methods.js';
import { withWays } from './ways.js';

// opts.key asks for one kind of problem, so a lesson can teach the shapes in order; otherwise one at random, of the kinds
// the way wanted (opts.want, a way to set beside another) is for, if it names one
function pickKey(rng, opts, keys, kinds = {}) {
  return keys.includes(opts.key) ? opts.key : rng.pick(kinds[opts.want] ?? keys);
}
const between = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// The shape of a mult-1digit or mult-2digit problem, 'way-size' ('written-3d'): for opts.sum, the way asked for (or the
// first) and the sum's size (digits of the number split or written on top); for opts.method, that way at a size from
// sizes; else opts.key, or a shape at random.
function shapeKey(rng, opts, keys, sizes, sumDigits) {
  if (opts.sum) return `${opts.method ?? keys[0].split('-')[0]}-${sumDigits(opts.sum)}d`;
  if (opts.method && !keys.includes(opts.key)) return `${opts.method}-${rng.pick(sizes)}`;
  return pickKey(rng, opts, keys);
}

// a 2-, 3- or 4-digit number with no zero ones, so every partition has a ones part; zeroTens lets the places between
// be 0
function numberWith(rng, digits, zeroTens = false) {
  const lead = rng.int(1, 9);
  if (digits === 2) return lead * 10 + rng.int(1, 9);
  const mid = () => rng.int(zeroTens ? 0 : 1, 9);
  if (digits === 4) return lead * 1000 + mid() * 100 + mid() * 10 + rng.int(1, 9);
  return lead * 100 + mid() * 10 + rng.int(1, 9);
}

// ---- mult-tens ----

// A one-digit factor drawn from list, kept to the tables she knows (opts.factors, engine/session.js knownTables): itself
// if she knows its table, else the one she knows at its place in the list, with no draw of its own, so a problem it
// leaves alone is the one it was, and with every table known nothing changes.
function known(a, list, factors) {
  if (!factors || factors.includes(a)) return a;
  const ok = list.filter((f) => factors.includes(f));
  return ok.length ? ok[list.indexOf(a) % ok.length] : a;
}

// The single-digit factor comes from the tables met before this skill (facts-2-5-10, facts-3-4), so the only new thing
// is the place value; at the usual level, any one-digit factor (every table is met before it, facts-9-7) and multiples
// of 1000 too, MA3-MR-01 "Use mental strategies to multiply one-digit numbers by 10, 100, 1000 and their multiples"
// (6 × 500, Stage 3 MR-A, l.51, https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-3/fafab309e2;
// NSW Mathematics K–10 Syllabus (2022), checked 25 October 2026).
// Both are drawn after everything else, so a problem they leave is the one it was; the easy level is as it was.
const TENS_FACTORS = [2, 3, 4, 5];
const BIG_FACTOR_SHARE = 1 / 2; // 6 to 9 in place of 2 to 5: each of 2 to 9 one problem in eight
const THOUSANDS_SHARE = 1 / 3;
const PLACE = { tens: 10, hundreds: 100, thousands: 1000 };

// NESA citations below: NSW Mathematics K–10 Syllabus (2022), the saved copies of 10 October 2026, checked live on 25 October
// 2026 (plans/2026-10-25-two-ways-survey.md).
// mult-tens' ways (survey l.132–134): halve a bigger one, NESA's "half of 6 times 1000" (MA3-MR-01, Stage 3 MR-A l.51) for 6 × 500, where a 5 is in it
// (the multiple's digit, or the factor, which is not 10), and on the missing kinds where the multiple's digit is 5;
// double a smaller one, "8 × 300 is double 4 × 300", where the factor is 4, 6 or 8. Each says why it won't work only on
// a problem with the factor shown (10 × 50 has a 5, so halving says nothing there); a missing kind whose multiple's
// digit is not 5 is the way she learned alone.
function tensWays({ missing, form, a, d, m, product }) {
  const ways = {}, why = {};
  const big = 2 * m; // 500 → 1000
  const half = (x) => ({ text: `Half of ${fmt(x)} = ☐`, value: x / 2, answer: true });
  if (!missing) {
    if (a !== 10 && d === 5) {
      ways['halve-bigger'] = () => ({
        // 2 × 500 is 1000 itself, so no line says 500 is half of 1000
        steps: [{ text: big === product ? `Double ${fmt(m)} is a round number: work out ${a} × that, then halve it.` : `${fmt(m)} is half of ${fmt(big)}, so ${a} × ${fmt(m)} is half of ${a} × ${fmt(big)}.` },
          { text: `${a} × ${fmt(big)} = ☐`, value: a * big }, half(a * big)],
        hint: big === product ? `What is ${a} × double ${fmt(m)}? Then what is half of that?` : `What is ${a} × ${fmt(big)}? Then what is half of it?`,
        words: ['product', 'multiple', 'half'],
      });
    } else if (a === 5) {
      ways['halve-bigger'] = () => ({
        steps: [{ text: `5 is half of 10, so 5 × ${fmt(m)} is half of 10 × ${fmt(m)}.` }, { text: `10 × ${fmt(m)} = ☐`, value: 10 * m }, half(10 * m)],
        hint: `What is 10 × ${fmt(m)}? Then what is half of it?`,
        words: ['product', 'multiple', 'half'],
      });
    } else if (a !== 10 || d !== 5) why['halve-bigger'] = 'it needs a 5 in one of the numbers';
    if ([4, 6, 8].includes(a)) {
      const h = a / 2;
      ways['double-smaller'] = () => ({
        steps: [{ text: `${a} × ${fmt(m)} is double ${h} × ${fmt(m)}.` }, { text: `${h} × ${fmt(m)} = ☐`, value: h * m },
          { text: `Double ${fmt(h * m)} = ☐`, value: product, answer: true }],
        hint: `What is ${h} × ${fmt(m)}? Then what is double that?`,
        words: ['product', 'multiple', 'double'],
      });
    } else why['double-smaller'] = 'it needs a 4, 6 or 8 to halve';
  } else if (d === 5 && form === 'right') {
    // 6 × ☐ = 3000: 6 × 1000 is double it, so the missing number is half of 1000
    ways['halve-bigger'] = () => ({
      steps: [{ text: `${a} × ${fmt(big)} = ☐`, value: a * big },
        { text: `${fmt(product)} is half of ${fmt(a * big)}, so the missing number is half of ${fmt(big)}: ☐`, value: m, answer: true }],
      hint: `What is ${a} × ${fmt(big)}? Is ${fmt(product)} half of that, or double?`,
      words: ['product', 'multiple', 'half'],
    });
  } else if (d === 5) {
    // ☐ × 500 = 3000: both doubled, ☐ × 1000 = 6000, the missing number the same (survey l.132, MA3-MR-01, Stage 3 MR-B l.46)
    ways['halve-bigger'] = () => ({
      steps: [{ text: `Double ${fmt(m)} and ${fmt(product)}, and the missing number stays the same: double ${fmt(product)} = ☐`, value: 2 * product },
        { text: `So ☐ × ${fmt(big)} = ${fmt(2 * product)}`, value: a, answer: true }],
      hint: `If you double ${fmt(m)} and ${fmt(product)}, what times ${fmt(big)} makes the new number?`,
      words: ['product', 'multiple', 'double'],
    });
  }
  return { ways, why };
}

// a way set beside another (opts.want) is drawn for: a few problems, until one it fits; with none, one draw as before
const WANT_TRIES = 30;

function tensItem(skillId, rng, opts) {
  return withWays(skillId, rng, opts, (r, draw) => {
    let item;
    for (let i = 0; i < (draw.want ? WANT_TRIES : 1); i++) if ((item = tensProblem(skillId, r, draw)).ways[draw.want]) break;
    return item;
  });
}

function tensProblem(skillId, rng, opts) {
  const keys = opts.easy ? ['tens', 'missing-tens'] : ['tens', 'hundreds', 'missing-tens', 'missing-hundreds'];
  const asked = keys.includes(opts.key) || (!opts.easy && ['thousands', 'missing-thousands'].includes(opts.key));
  let key = asked ? opts.key : rng.pick(keys);
  const missing = key.startsWith('missing');
  let a = !missing && !opts.easy && rng.chance(0.2) ? 10 : known(rng.pick(TENS_FACTORS), TENS_FACTORS, opts.factors);
  // easy: products to 100
  const d = opts.easy ? rng.int(2, Math.floor(10 / a)) : rng.int(2, 9);
  const form = missing && rng.chance(0.5) ? 'left' : 'right';
  // opts.factors: the one-digit factors whose facts she knows (a sprint or a warm-up for a learner who met this skill
  // before the 9s and 7s); the draw is made all the same, so the rest of the problem is the one it would have been
  const big = (opts.factors ?? [6, 7, 8, 9]).filter((f) => f >= 6 && f <= 9);
  if (!opts.easy && a !== 10 && rng.chance(BIG_FACTOR_SHARE) && big.length) a = rng.pick(big);
  if (!opts.easy && !asked && rng.chance(THOUSANDS_SHARE)) key = missing ? 'missing-thousands' : 'thousands';
  const name = key.replace('missing-', '');
  const place = PLACE[name];
  const m = d * place, fact = a * d, product = a * m;
  const item = { skill: skillId, key, picture: null, words: ['product', 'multiple', 'place value'], ...tensWays({ missing, form, a, d, m, product }) };
  if (!missing) {
    return { ...item,
      ask: `${a} × ${fmt(m)} = ☐`, say: `${a} times ${m}`,
      answer: { kind: 'number', value: product },
      steps: [
        { text: `The fact: ${a} × ${d} = ☐`, value: fact },
        { text: `${a} × ${d} ${name} = ${fact} ${name} = ☐`, value: product },
      ],
      hint: `How many ${name} is ${fmt(m)}? What is ${a} lots of that many ${name}?`,
    };
  }
  if (form === 'left') {
    return { ...item,
      ask: `☐ × ${fmt(m)} = ${fmt(product)}`, say: `What times ${m} makes ${product}?`,
      answer: { kind: 'number', value: a },
      steps: [
        { text: `${fmt(product)} is ☐ ${name}, and ${fmt(m)} is ${d} ${name}`, value: fact },
        { text: `The fact: ☐ × ${d} = ${fact}`, value: a },
      ],
      hint: `How many ${name} is ${fmt(product)}, and how many ${name} is ${fmt(m)}? Which fact joins them?`,
    };
  }
  return { ...item,
    ask: `${a} × ☐ = ${fmt(product)}`, say: `${a} times what makes ${product}?`,
    answer: { kind: 'number', value: m },
    steps: [
      { text: `${fmt(product)} is ☐ ${name}`, value: fact },
      { text: `The fact: ${a} × ☐ = ${fact}`, value: d },
      { text: `So the missing number is ${d} ${name}: ☐`, value: m },
    ],
    hint: `How many ${name} is ${fmt(product)}? ${a} times how many ${name} makes that?`,
  };
}

// ---- mult-1digit ----

// One-digit factors from the tables met by now: 2 to 6 and 8, and at the usual level 7 and 9 in place of one of them a
// problem in four, drawn last (so each of 2 to 9 is one in eight), since the skill comes after facts-9-7.
const ONE_DIGIT = [2, 3, 4, 5, 6, 8];
const SEVEN_NINE_SHARE = 1 / 4;

// 4 digits by one (6 × 4735), asked for by its key, or one problem in three at the usual level, never the easy one
const FOUR = ['partition-4d', 'area-4d', 'written-4d'];
const FOUR_SHARE = 1 / 3;

function oneDigitItem(skillId, rng, opts) {
  const keys = opts.easy ? ['partition-2d', 'area-2d', 'written-2d']
    : ['partition-2d', 'partition-3d', 'area-2d', 'area-3d', 'written-2d', 'written-3d'];
  const key = !opts.easy && FOUR.includes(opts.key) ? opts.key : shapeKey(rng, opts, keys, opts.easy ? ['2d'] : ['2d', '3d'], (sum) => String(sum.b).length);
  const [shape, size] = key.split('-');
  let a, b;
  if (opts.sum) ({ a, b } = opts.sum);
  else if (opts.easy) {
    // factors to 5, products to 100
    a = known(rng.int(2, 5), [2, 3, 4, 5], opts.factors);
    do b = rng.int(11, Math.floor(100 / a)); while (b % 10 === 0);
  } else {
    a = known(rng.pick(ONE_DIGIT), ONE_DIGIT, opts.factors);
    b = numberWith(rng, Number(size[0]), shape === 'written');
  }
  // the missing-part sentence for 2 and 3 digits only: at 4 digits it runs past a line on her phone
  const sentence = shape === 'partition' && size !== '4d' && !opts.sum && !opts.plain && rng.chance(0.3);
  const i = sentence ? rng.int(0, partsOf(b).length - 1) : null;
  const sevenNine = [7, 9].filter((f) => !opts.factors || opts.factors.includes(f));
  if (!opts.easy && !opts.sum && rng.chance(SEVEN_NINE_SHARE) && sevenNine.length) a = rng.pick(sevenNine);
  // 4 digits at the usual level, one problem in three of every way (a missing-part sentence drawn gives way to it), drawn
  // last, so a 2- or 3-digit problem it leaves is the one it was
  const four = !opts.easy && !opts.sum && !keys.includes(opts.key) && !FOUR.includes(opts.key) && rng.chance(FOUR_SHARE);
  const itemOf = (b, key) => ({ skill: skillId, key, sum: { op: '×', a, b }, method: shape, ask: `${a} × ${fmt(b)} = ☐`, say: `${a} times ${b}`, answer: { kind: 'number', value: a * b } });
  const item = itemOf(b, key);
  if (four) return worked(itemOf(numberWith(rng, 4, shape === 'written'), `${shape}-4d`), shape);

  if (sentence) {
    // the distributive property as a number sentence: 6 × 47 = 6 × 40 + 6 × ☐
    const parts = partsOf(b);
    const right = parts.map((p, j) => `${a} × ${j === i ? '☐' : fmt(p)}`).join(' + ');
    return { ...item,
      ask: `${a} × ${fmt(b)} = ${right}`, say: `${a} times ${b} is the same as ${right.replace(/×/g, 'times').replace('☐', 'what')}?`,
      answer: { kind: 'number', value: parts[i] },
      steps: [
        { text: `Partition ${fmt(b)}: ${fmt(b)} = ${parts.map((p, j) => (j === i ? '☐' : fmt(p))).join(' + ')}`, value: parts[i] },
        { text: `Every part is multiplied by ${a}, so the missing number is ☐`, value: parts[i] },
      ],
      picture: null,
      hint: `What are the parts of ${fmt(b)}, place by place?`,
      words: ['partition', 'product'],
    };
  }
  return worked(item, shape);
}

// the item worked by one of engine/methods.js's ways
function worked(item, method) {
  const m = METHODS[method];
  return { ...item, method, steps: m.steps(item.sum), picture: m.picture(item.sum), hint: m.hint(item.sum), words: m.words(item.sum) };
}

// ---- mult-2digit ----

function twoDigitItem(skillId, rng, opts) {
  // mostly 2-digit × 2-digit, some 3-digit × 2-digit
  const keys = opts.easy ? ['area-2d', 'written-2d']
    : ['area-2d', 'area-2d', 'area-2d', 'area-3d', 'written-2d', 'written-2d', 'written-2d', 'written-3d'];
  const key = shapeKey(rng, opts, keys, opts.easy ? ['2d'] : ['2d', '2d', '2d', '3d'], (sum) => String(sum.a).length);
  const [shape, size] = key.split('-');
  let top, bottom;
  if (opts.sum) ({ a: top, b: bottom } = opts.sum);
  else {
    // easy: teens and twenties with small ones digits, so all four parts are friendly
    top = opts.easy ? rng.int(1, 2) * 10 + rng.int(1, 5) : numberWith(rng, size === '3d' ? 3 : 2, shape === 'written');
    bottom = opts.easy ? 10 + rng.int(1, 5) : numberWith(rng, 2);
  }
  return worked({ skill: skillId, key, sum: { op: '×', a: top, b: bottom }, ask: `${fmt(top)} × ${bottom} = ☐`, say: `${top} times ${bottom}`, answer: { kind: 'number', value: top * bottom } }, shape);
}

// ---- factors ----

// Primes and composites to 100, by the sieve of Eratosthenes.
const PRIMES = [], COMPOSITES = [];
{
  const crossed = [];
  for (let n = 2; n <= 100; n++) {
    if (crossed[n]) { COMPOSITES.push(n); continue; }
    PRIMES.push(n);
    for (let m = n * n; m <= 100; m += n) crossed[m] = true;
  }
}

const orList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`);

// A remainder in a step is written in words, "29 ÷ 9 = ☐ remainder 2", as division's ways write it (engine/methods.js).
// The ways (survey l.155–157): is-factor from the nearest multiple of a fact she knows, NESA's "if 4×6=24 and 5×6=30, the
// answer is 4 remainder 3" (MA3-MR-01, Stage 3 MR-A l.69); next-multiple from the remainder's gap, "25÷4=6 remainder 1, so 25=4×6+1". Each fits every
// problem of its kind.
const FACTOR_KINDS = { 'known-multiple': ['is-factor'], 'remainder-gap': ['next-multiple'] };

function factorsItem(skillId, rng, opts) {
  return withWays(skillId, rng, opts, (r, draw) => factorsProblem(skillId, r, draw));
}

function factorsProblem(skillId, rng, opts) {
  const key = pickKey(rng, opts, ['is-factor', 'count-factors', 'prime', 'next-multiple', 'common-factor'], FACTOR_KINDS);
  const item = { skill: skillId, key };
  const choice = (options, value) => ({ kind: 'choice', options, value });

  if (key === 'is-factor') {
    const f = opts.easy ? rng.int(2, 5) : rng.int(2, 12);
    const top = opts.easy ? 50 : 100;
    const q = rng.int(2, Math.floor((top - f + 1) / f));
    const r = rng.chance(0.5) ? 0 : rng.int(1, f - 1);
    const n = f * q + r;
    return { ...item,
      ask: `Is ${f} a factor of ${n}?`, say: `Is ${f} a factor of ${n}?`,
      answer: choice(['yes', 'no'], r ? 'no' : 'yes'),
      steps: [
        { text: `Share ${n} into ${f} equal groups: ${n} ÷ ${f} = ☐${r ? ` remainder ${r}` : ''}`, value: q },
        { text: r ? `${r} is left over, so ${f} is not a factor of ${n}.` : `Nothing is left over: ${f} × ${q} = ${n}, so ${f} is a factor of ${n}.` },
      ],
      // sharing shows a leftover honestly either way, so the picture does not give the answer away by its type
      picture: n <= 60 ? { type: 'groups', groups: f, each: q, leftover: r } : null,
      hint: `Does ${n} share into ${f} equal groups with nothing left over?`,
      words: ['factor'],
      ways: { 'known-multiple': () => ({
        steps: [
          { text: `The biggest multiple of ${f} not past ${n}: ${f} × ☐ = ${f * q}`, value: q },
          { text: `What is left over? ${n} − ${f * q} = ☐`, value: r },
          { text: r ? `Something is left over, so ${f} is not a factor of ${n}.` : `Nothing is left over, so ${f} is a factor of ${n}.` },
        ],
        hint: `What is the biggest multiple of ${f} not past ${n}? Is anything left over?`,
        words: ['factor', 'multiple'],
      }) },
    };
  }

  if (key === 'count-factors') {
    const n = opts.easy ? rng.int(4, 24) : rng.int(10, 100);
    const pairs = [];
    for (let x = 1; x * x <= n; x++) if (n % x === 0) pairs.push([x, n / x]);
    const square = pairs.find(([x, y]) => x === y);
    const count = pairs.length * 2 - (square ? 1 : 0);
    // the rectangle of counters closest to a square (every rectangle 12 counters make): the last pair she finds, so it
    // is her working and only the worked answer shows it
    const [r, c] = pairs[pairs.length - 1];
    return { ...item,
      ask: `How many factors does ${n} have?`, say: `How many factors does ${n} have?`,
      answer: { kind: 'number', value: count },
      steps: [
        { text: `Find the factor pairs, starting from 1: ${pairs.map(([x, y]) => `${x} × ${y}`).join(', ')}.` },
        { text: `Count every number in the pairs${square ? ` (${square[0]} × ${square[0]} gives ${square[0]} only once)` : ''}: ☐ factors`, value: count },
      ],
      picture: n <= 36 ? { type: 'array', rows: r, cols: c, working: true } : null,
      hint: 'Did you test every number from 1 up, and count both numbers in each pair?',
      words: ['factor', 'factor pair'],
    };
  }

  if (key === 'prime') {
    const top = opts.easy ? 30 : 100;
    // 0 and 1 sparingly: the syllabus names them, but they are one idea, not many
    const n = rng.chance(0.08) ? rng.pick([0, 1])
      : rng.chance(0.5) ? rng.pick(PRIMES.filter((p) => p <= top)) : rng.pick(COMPOSITES.filter((p) => p <= top));
    const kind = n < 2 ? 'neither' : PRIMES.includes(n) ? 'prime' : 'composite';
    let steps;
    if (kind === 'neither') {
      steps = [{ text: `Prime and composite are only for whole numbers from 2 up, so ${n} is neither.` }];
    } else if (kind === 'prime') {
      const tests = PRIMES.filter((p) => p * p <= n);
      steps = [
        ...(tests.length ? [{ text: `Does ${orList(tests)} go into ${n} with nothing left over? None does.` }] : []),
        { text: `So ${n} has just two factors, 1 and ${n}: it is prime.` },
      ];
    } else {
      const s = PRIMES.find((p) => n % p === 0);
      steps = [
        { text: `${n} ÷ ${s} = ☐, with nothing left over`, value: n / s },
        { text: `So ${s} is a factor too, not just 1 and ${n}. More than two factors: ${n} is composite.` },
      ];
    }
    return { ...item,
      ask: `Is ${n} prime, composite or neither?`, say: `Is ${n} prime, composite or neither?`,
      answer: choice(['prime', 'composite', 'neither'], kind),
      steps,
      picture: null,
      hint: `How many factors does ${n} have: just two (1 and itself), more than two, or is it 0 or 1?`,
      words: ['prime', 'composite', 'factor'],
    };
  }

  if (key === 'next-multiple') {
    const f = opts.easy ? rng.int(2, 5) : rng.int(2, 12);
    const bound = opts.easy ? rng.int(f, 50 - f) : rng.int(f * 2, 100 - f);
    const k = Math.floor(bound / f);
    const value = f * (k + 1);
    return { ...item,
      ask: `What is the smallest multiple of ${f} bigger than ${bound}?`, say: `What is the smallest multiple of ${f} bigger than ${bound}?`,
      answer: { kind: 'number', value },
      steps: [
        { text: `The last multiple of ${f} that is not bigger than ${bound}: ${f} × ☐ = ${f * k}`, value: k },
        { text: `The next multiple: ${f} × ${k + 1} = ☐`, value },
      ],
      picture: null,
      hint: `Is your answer a multiple of ${f}, and is it bigger than ${bound}? Is there a smaller one that is?`,
      words: ['multiple'],
      // the gap from the remainder to a whole group more; with nothing left over, a whole group (survey l.157)
      ways: { 'remainder-gap': () => {
        const r = bound % f;
        return {
          steps: r
            ? [{ text: `${bound} ÷ ${f} = ☐ remainder ${r}`, value: k }, { text: `The gap to the next multiple: ${f} − ${r} = ☐`, value: f - r },
              { text: `${bound} + ${f - r} = ☐`, value, answer: true }]
            : [{ text: `${bound} ÷ ${f} = ☐, with nothing left over`, value: k }, { text: `So the next multiple is a whole ${f} more: ${bound} + ${f} = ☐`, value, answer: true }],
          hint: `What is left over when you share ${bound} into groups of ${f}? How many more make one more group?`,
          words: ['multiple', 'remainder'],
        };
      } },
    };
  }

  // common factor: c goes into both numbers; the other option is not a factor of at least one of them. Outside NESA,
  // chosen for this game, not a syllabus requirement: no Stage 3 content point names common factors
  // (plans/2026-10-25-nesa-audit.md row 15; engine/skills.js outsideNesaKeys)
  const c = opts.easy ? rng.int(2, 5) : rng.int(2, 12);
  const most = Math.floor((opts.easy ? 40 : 100) / c);
  const x = rng.int(2, most);
  let y;
  do y = rng.int(2, most); while (y === x);
  const a = c * x, b = c * y;
  const notCommon = [];
  for (let d = 2; d <= (opts.easy ? 6 : 12); d++) if (d !== c && (a % d !== 0 || b % d !== 0)) notCommon.push(d);
  // a decoy that goes into one of the two is the tempting one
  const tempting = notCommon.filter((d) => a % d === 0 || b % d === 0);
  const decoy = rng.pick(tempting.length ? tempting : notCommon);
  const options = rng.shuffle([c, decoy]).map(String);
  const miss = a % decoy !== 0 ? a : b;
  const cTests = [{ text: `Test ${c}: ${a} ÷ ${c} = ☐`, value: x }, { text: `${b} ÷ ${c} = ☐`, value: y }];
  const decoyTest = [{ text: `Test ${decoy}: ${miss} ÷ ${decoy} = ☐ remainder ${miss % decoy}`, value: Math.floor(miss / decoy) }];
  return { ...item,
    ask: `Which is a common factor of ${a} and ${b}: ${options[0]} or ${options[1]}?`,
    say: `Which is a common factor of ${a} and ${b}: ${options[0]} or ${options[1]}?`,
    answer: choice(options, String(c)),
    // each option tested in the order the question gives them, and only the last step says which is a common factor:
    // "Show me one step" stops before it, so the working is shown and what it means is hers to say, as for is-factor
    // (pt32; a remainder in the working shows a number is no factor to a child who knows what a remainder means)
    steps: [
      ...(options[0] === String(c) ? [cTests, decoyTest] : [decoyTest, cTests]).flat(),
      { text: `${decoy} leaves a remainder with ${miss}, so it is not a common factor. ${c} goes into both with nothing left over, so it is a common factor.` },
    ],
    picture: null,
    hint: `Does your number go into ${a} and into ${b}, both with nothing left over?`,
    words: ['common factor', 'factor'],
  };
}

// ---- estimate ----

// Round to the leading place: keep the first digit, and add one to it if the next digit is 5 or more.
// One-digit numbers stay as they are.
function roundLeading(n) {
  const s = String(n);
  if (s.length === 1) return n;
  return (Number(s[0]) + (Number(s[1]) >= 5 ? 1 : 0)) * 10 ** (s.length - 1);
}

const nearest = (n) => 10 ** (String(n).length - 1);

function roundingRule(ns) {
  const big = ns.filter((n) => n >= 10);
  if (big.length === 2 && nearest(big[0]) === nearest(big[1])) return `Round both to the nearest ${nearest(big[0])} first.`;
  return `Round ${big.map((n) => `${fmt(n)} to the nearest ${nearest(n)}`).join(' and ')} first.`;
}

const roundSteps = (ns) => ns.filter((n) => n >= 10).map((n) => ({ text: `${fmt(n)} to the nearest ${nearest(n)} is ☐`, value: roundLeading(n) }));

// the number line between the round numbers either side, with the number marked; finding those ends is her rounding
// step, so it is her working and a question leaves it out (js/runner.js asked)
function roundingLine(n) {
  const p = nearest(n), lo = Math.floor(n / p) * p;
  return { type: 'numberline', from: lo, to: lo + p, step: p / 10, point: { at: n, label: fmt(n) }, working: true };
}

const ROUND_HINT = 'Look at the digit after the first one: is it 5 or more?';

// a 2-digit number that rounds to t tens (at most 4 either side)
const nearTens = (rng, t) => Math.max(11, t * 10 + rng.int(-4, 4));

// The ways (survey l.175–177), each asking it its own way where its answer differs from the way she learned's
// (plans/2026-10-25-two-ways-plan.md, "est-compatible and est-bounds, exact"): est-div by upper and lower estimates, the
// tens of the divisor either side and the nearer, NESA's "adjusting upper and lower estimates" (MA3-MR-01, Stage 3 MR-A l.75); reasonable by its bounds,
// a claim on a bound counted as outside; est-mult by compatible numbers, NESA's "32×253 will be about, but more than,
// 30×250" (MA3-MR-01, Stage 3 MR-A l.83), where one factor is 4 or 8 (or 2, with a multiple of 50) and the other is 1 to 3 from a multiple of 25 that is
// not a multiple of 100, giving another estimate than the leading place's.
const EST_KINDS = { 'est-bounds': ['est-div', 'reasonable'], 'est-compatible': ['est-mult'] };

// The compatible number for x × y (y one digit), or null where none fits: x's nearest multiple of 25, M
function compatible(x, y) {
  const M = Math.round(x / 25) * 25;
  const easy = y === 4 || y === 8 || (y === 2 && M % 50 === 0);
  return easy && M !== x && Math.abs(M - x) <= 3 && M % 100 !== 0 && y * M !== roundLeading(x) * roundLeading(y) ? M : null;
}

function estimateItem(skillId, rng, opts) {
  return withWays(skillId, rng, opts, (r, draw) => estimateProblem(skillId, r, draw));
}

function estimateProblem(skillId, rng, opts) {
  const key = pickKey(rng, opts, ['est-mult', 'est-div', 'est-add', 'reasonable'], EST_KINDS);
  const item = { skill: skillId, key, words: ['estimate', 'round'] };

  if (key === 'est-mult') {
    let x, y;
    if (opts.want === 'est-compatible') {
      // numbers compatible numbers fit, which the draw below seldom makes: × 4 or × 8, by a number just off a multiple of
      // 25 (the easy level: 22 to 24 × 4, an estimate to 100)
      y = opts.easy ? 4 : rng.pick([4, 8]);
      const [lo, hi] = opts.easy ? [22, 24] : rng.pick([[11, 99], [101, 999]]);
      x = rng.pick(between(lo, hi).filter((v) => compatible(v, y)));
    } else if (opts.easy) {
      // estimates to 100
      y = rng.int(2, 5);
      x = nearTens(rng, rng.int(1, Math.floor(10 / y)));
    } else {
      const form = rng.pick(['2x2', '3x1', '2x1']);
      x = form === '3x1' ? rng.int(101, 999) : rng.int(11, 99);
      y = form === '2x2' ? rng.int(11, 99) : rng.int(3, 9);
    }
    const value = roundLeading(x) * roundLeading(y);
    const M = compatible(x, y), K = M && (M % 10 ? M : M / 10);
    return { ...item,
      ask: `About how much is ${fmt(x)} × ${fmt(y)}? ${roundingRule([x, y])}`, say: `About how much is ${x} times ${y}?`,
      answer: { kind: 'number', value },
      steps: [...roundSteps([x, y]), { text: `${fmt(roundLeading(x))} × ${fmt(roundLeading(y))} = ☐`, value }],
      picture: roundingLine(x),
      hint: ROUND_HINT,
      ...(M ? { ways: { 'est-compatible': () => ({
        ask: `About how much is ${fmt(x)} × ${fmt(y)}? Use ${fmt(M)} for ${fmt(x)}, since ${fmt(K)} × ${fmt(y)} is easy.`,
        answer: { kind: 'number', value: y * M },
        // K is M without its zero (M is never a multiple of 100, so it has one at most)
        steps: [{ text: `${fmt(x)} is close to ${fmt(M)}, so ${fmt(x)} × ${y} is about ${fmt(M)} × ${y}.` },
          ...(K === M ? [{ text: `${fmt(M)} × ${y} = ☐`, value: y * M, answer: true }]
            : [{ text: `${fmt(K)} × ${y} = ☐`, value: y * K }, { text: `${fmt(M)} is ${fmt(K)} tens, so ${fmt(M)} × ${y} = ☐`, value: y * M, answer: true }])],
        hint: K !== M ? `What is ${fmt(K)} × ${y}? Then how many tens is ${fmt(M)} × ${y}?`
          : y === 4 ? `What is double ${fmt(M)}, then double again?` : `What is double ${fmt(M)}, doubled, then doubled again?`,
        words: ['estimate', 'compatible numbers'],
      }) } } : { why: { 'est-compatible': 'no number here is close to an easy one' } }),
    };
  }

  if (key === 'est-div') {
    let n, d;
    if (opts.easy) {
      d = rng.pick([2, 5]);
      n = nearTens(rng, rng.int(2, 9));
    } else {
      // the rounded number divides exactly: 600 ÷ 3, 700 ÷ 7, 400 ÷ 8
      d = rng.int(2, 9);
      const h = rng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((k) => (k * 100) % d === 0));
      n = h * 100 + rng.int(h === 1 ? 0 : -49, 49);
    }
    const r = roundLeading(n);
    // the tens of d either side of n: 651 ÷ 7 is between 7 × 90 and 7 × 100
    const k = Math.floor(n / (10 * d)), lower = 10 * d * k, upper = lower + 10 * d;
    const near = n - lower < upper - n ? lower : upper;
    const bounds = () => ({
      ask: `About how much is ${fmt(n)} ÷ ${d}? Find the tens of ${d} it is between, and use the nearer.`,
      answer: { kind: 'number', value: near / d },
      steps: [{ text: `${d} × ${10 * k} = ☐`, value: lower }, { text: `${d} × ${10 * (k + 1)} = ☐`, value: upper },
        { text: n === lower ? `${fmt(n)} is a ten of ${d} itself, so ${fmt(n)} ÷ ${d} is ☐` : `${fmt(n)} is nearer ${fmt(near)}, so ${fmt(n)} ÷ ${d} is about ☐`, value: near / d, answer: true }],
      hint: `Count in tens of ${d}: which two is ${fmt(n)} between, and which is it nearer?`,
      words: ['estimate', 'multiple'],
    });
    return { ...item,
      ask: `About how much is ${fmt(n)} ÷ ${d}? Round ${fmt(n)} to the nearest ${nearest(n)} first.`, say: `About how much is ${n} divided by ${d}?`,
      answer: { kind: 'number', value: r / d },
      steps: [...roundSteps([n]), { text: `${fmt(r)} ÷ ${d} = ☐`, value: r / d }],
      picture: roundingLine(n),
      hint: ROUND_HINT,
      ...(k < 1 ? { why: { 'est-bounds': `the number is smaller than ten lots of ${d}` } }
        : n - lower === upper - n ? { why: { 'est-bounds': 'the number is exactly halfway between the two' } } : { ways: { 'est-bounds': bounds } }),
    };
  }

  if (key === 'est-add') {
    const digits = opts.easy ? 2 : rng.pick([3, 4]);
    const lo = opts.easy ? 11 : 10 ** (digits - 1), hi = opts.easy ? 49 : 10 ** digits - 1;
    const x = rng.int(lo, hi), y = rng.int(lo, hi);
    const value = roundLeading(x) + roundLeading(y);
    return { ...item,
      ask: `About how much is ${fmt(x)} + ${fmt(y)}? ${roundingRule([x, y])}`, say: `About how much is ${x} plus ${y}?`,
      answer: { kind: 'number', value },
      steps: [...roundSteps([x, y]), { text: `${fmt(roundLeading(x))} + ${fmt(roundLeading(y))} = ☐`, value }],
      picture: null,
      hint: ROUND_HINT,
    };
  }

  // Is a worked answer reasonable? b sits close to a round number (at most 3 ones or 3 tens off), so the
  // true product is within 15% of the estimate; a wrong one is at least half as much again, or under two thirds.
  const a = opts.easy ? rng.int(2, 5) : rng.int(2, 9);
  const three = !opts.easy && rng.chance(0.4);
  const place = three ? 100 : 10;
  const lead = opts.easy ? rng.int(2, Math.floor(10 / a)) : rng.int(2, 9);
  let off;
  do off = three ? rng.int(-30, 30) : rng.int(-3, 3); while (off === 0);
  const b = lead * place + off;
  const exact = a * b, est = a * lead * place;
  const yes = rng.chance(0.5);
  const P = 10 ** (String(exact).length - 1);
  // the slips an estimate catches: a zero too many, a zero lost, a wrong leading digit
  const claim = yes ? exact : rng.pick([exact * 10, Math.floor(exact / 10), exact + Math.ceil((1.5 * est - exact) / P) * P]);
  // the bounds: b between two of the place it rounds to, so a × b between a times each; every slip falls outside them,
  // the leading digit's on the upper bound itself at a leading digit of 2 (survey l.177)
  const lo = Math.floor(b / place) * place, up = lo + place;
  const inside = claim > a * lo && claim < a * up;
  const bounds = () => ({
    steps: [
      { text: `${fmt(b)} is less than ${fmt(up)}, so ${a} × ${fmt(b)} is less than ${a} × ${fmt(up)} = ☐`, value: a * up },
      { text: `It is more than ${fmt(lo)}, so more than ${a} × ${fmt(lo)} = ☐`, value: a * lo },
      { text: yes ? `${fmt(claim)} is between ${fmt(a * lo)} and ${fmt(a * up)}, so yes, it is reasonable.`
        : claim >= a * up ? `${fmt(claim)} is not less than ${fmt(a * up)}, so no: it cannot be right.` : `${fmt(claim)} is not more than ${fmt(a * lo)}, so no: it cannot be right.` },
    ],
    hint: `Which two ${place === 100 ? 'hundreds' : 'tens'} is ${fmt(b)} between? Is ${fmt(claim)} between ${a} times each of them?`,
    words: ['estimate', 'reasonable'],
  });
  return { ...item,
    ask: `Is ${a} × ${fmt(b)} = ${fmt(claim)} reasonable?`, say: `Is ${claim} a reasonable answer for ${a} times ${b}?`,
    answer: { kind: 'choice', options: ['yes', 'no'], value: yes ? 'yes' : 'no' },
    steps: [
      { text: `Estimate: ${fmt(b)} to the nearest ${place} is ☐`, value: lead * place },
      { text: `${a} × ${fmt(lead * place)} = ☐`, value: est },
      { text: yes ? `${fmt(claim)} is close to ${fmt(est)}, so yes, it is reasonable.` : `${fmt(claim)} is a long way from ${fmt(est)}, so no: something went wrong in the working.` },
    ],
    picture: null,
    hint: `Round ${fmt(b)} first: about how much should ${a} × ${fmt(b)} be?`,
    words: ['estimate', 'reasonable'],
    // the bounds always agree with the answer (the slips above), so this never leaves the way out
    ...(inside === yes ? { ways: { 'est-bounds': bounds } } : {}),
  };
}

export default {
  skills: ['mult-tens', 'mult-1digit', 'mult-2digit', 'factors', 'estimate'],
  make(skillId, rng, opts = {}) {
    if (skillId === 'mult-tens') return tensItem(skillId, rng, opts);
    if (skillId === 'mult-1digit') return oneDigitItem(skillId, rng, opts);
    if (skillId === 'mult-2digit') return twoDigitItem(skillId, rng, opts);
    if (skillId === 'factors') return factorsItem(skillId, rng, opts);
    return estimateItem(skillId, rng, opts);
  },
};
