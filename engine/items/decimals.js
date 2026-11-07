// Decimals (stage 6, plans/2026-10-25-stage-6-plan.md): tenths, hundredths and thousandths. The places and the number
// helpers every decimal skill shares, and the generator of the decimal skills. A decimal is always text as the game
// shows it ('0.38', '2.047', '0.50'), never a float, and is worked exactly in thousandths (engine/check.js thousandths);
// inside the generator a whole number of thousandths stands for it (8 characters at most, so a safe whole number).
//
// dec-hundredths, MA2-RN-02, "represents and compares decimals up to 2 decimal places using place value" (Stage 2
// Representing numbers using place value A, saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-
// fa3867d7b8.md l.36): "Use the decimal point as a marker to identify the position of the ones digit when expressing
// tenths as decimals" (l.60), "Recognise that 10-tenths is recorded as 1.0 and regroup when using decimal notation"
// (l.61), "Subdivide tenths into 10 equal parts and record hundredths using place value" (l.63), "Express decimals as
// both tenths and hundredths" (l.64), "Distinguish between the role of zero in various positions" (l.67) and "Make
// connections between fractions and decimal notation for key benchmark values" (l.74) (Stage 2 Representing numbers
// using place value B, saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fa1dbb9271.md,
// .../stage-2/fa1dbb9271).
// dec-thousandths, MA3-RN-02, "compares and orders decimals up to 3 decimal places" (Stage 3 Represents numbers A, saved
// copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-fa87632ef7.md l.38): "Express thousandths as
// decimals" (l.59), "Interpret decimal notation for thousandths" (l.60), "Indicate the place value of digits in decimal
// numbers of up to 3 decimal places" (l.61) and "Use place value to partition decimals" (l.62) (.../stage-3/fa87632ef7).
// NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026.
// dec-compare, MA3-RN-02 (S3 RN A l.38): "Compare and order decimal numbers of up to 3 decimal places" (l.66) and
// "Interpret zero digit(s) at the end of a decimal" (l.67), its Examples read live 25 October 2026 ("Such as 0.5, 0.125,
// 0.25"; "0.170 has the same value as 0.17"); and, for the easy level, "Compare and order decimals of up to 2 decimal
// places" (Stage 2 Representing numbers using place value B, MA2-RN-02, fa1dbb9271.md l.73). Ordering 0.2, 0.12, 0.056
// is the IES fractions guide's own example for finding a place-value gap (IES 2010 l.1066).
// dec-numberline, MA3-RN-02: "Place decimal numbers of up to 3 decimal places on a number line" (l.70) and "Approximate
// the size of decimals" (l.69), its Examples read live 25 October 2026 (1.60 placed on a line from 0 to 2 marked in
// halves; "To 2 decimal places 1.254 is 1.25"; plans/2026-10-25-stage-6-log.md, Plan errors found).
// NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026.
// dec-x10, MA3-RN-02: "Compare the place value of digits by determining numbers that are 10 or 100 times the original
// decimal number as well as 1/10 or 1/100 times the original decimal numbers" (S3 RN A l.68).
// dec-addsub, MA3-AR-01, "selects and applies appropriate strategies to solve addition and subtraction problems" (Stage 3
// Additive relations B, saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fa2ebf6217.md l.35):
// "Model the addition and subtraction of decimals up to 3 decimal places using appropriate representations" (l.46)
// (.../stage-3/fa2ebf6217); its first step an estimate in wholes before working it, as the IES fractions guide asks
// ("Teachers can ask students to provide an initial estimate and to explain their thinking before having them compute
// the answer", IES 2010 l.798-800). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026.
// About 1 number in 4 has an empty place on purpose, as placevalue.js makes them: 3.04 against 3.4 is where reading
// decimals goes wrong. The ways of dec-hundredths and dec-thousandths (engine/methods.js dec-chart, dec-fraction) work
// every kind of problem, so none needs to say it won't work; of the comparing ways, the number line works only numbers
// between the same two whole numbers, and of the number line's, zooming in only a line read past tenths; of the adding
// ways, partitioning only a sum with a trade into one place at most, and counting up only taking away; and each says so
// where it cannot (engine/methods.js wayFor).

import { fmt, thousandths } from '../check.js';
import { METHODS, wayFor, wayFits, methodsOf, decColumns, estimateOf, estimateFits } from '../methods.js';
import { roundTo } from './placevalue.js';

// the places after the point, which the pictures' charts name their columns from (engine/render/svg.js), as PLACES
// names the ones before it (engine/items/placevalue.js)
export const DEC_PLACES = ['tenths', 'hundredths', 'thousandths'];
export const DEC_ONE = ['tenth', 'hundredth', 'thousandth'];

// '12.045' -> { whole: '12', frac: '045' }, as written: spaces and commas go, every other character stays (a '?' is the
// unknown digit a picture draws as a box)
export function splitDecimal(text) {
  const [whole, frac = ''] = String(text ?? '').replace(/[\s,]/g, '').split('.');
  return { whole, frac };
}

// decimal places as written: '0.50' has 2
export const placesOf = (text) => splitDecimal(text).frac.length;

// a whole number of thousandths as the game writes it, the shortest way: 47 -> '0.047', 3700 -> '3.7', 4000 -> '4'
export function decimalText(th) {
  const frac = String(th % 1000).padStart(3, '0').replace(/0+$/, '');
  return frac ? `${Math.floor(th / 1000)}.${frac}` : String(Math.floor(th / 1000));
}

// a decimal's ones and its three places' digits: '3.06' -> { ones: 3, d: [0, 6, 0], places: 2, th: 3060 }
export function decParts(text) {
  const { whole, frac } = splitDecimal(text);
  return { ones: Number(whole || 0), d: [0, 1, 2].map((i) => Number(frac[i] ?? 0)), places: frac.length, th: Number(thousandths(text)) };
}
// its value, a whole number of thousandths, worked exactly: '0.5', '0.50' and '0.500' are all 500
export const thOf = (text) => decParts(text).th;
// a count of a place, said as the game says it: '1 one', '3 ones', '1 tenth', '47 thousandths' (k: 0 ones, 1 to 3 the
// places after the point)
export const countOf = (n, k) => `${fmt(n)} ${k === 0 ? (n === 1 ? 'one' : 'ones') : n === 1 ? DEC_ONE[k - 1] : DEC_PLACES[k - 1]}`;
// what digit d in place k (1 to 3) is worth, as decimal text: (5, 2) -> '0.05'
export const partText = (d, k) => decimalText(d * 10 ** (3 - k));
export const andList = (list) => (list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`);
const orList = (list) => `${list.slice(0, -1).join(', ')} or ${list.at(-1)}`;
// decimal text by value, exactly: smallest first, and the sign between two ('0.5' and '0.500' are =)
export const inOrder = (list) => [...list].sort((x, y) => thOf(x) - thOf(y));
export const signOf = (a, b) => (thOf(a) < thOf(b) ? '<' : thOf(a) > thOf(b) ? '>' : '=');
// a dec-x10 sum's answer, exactly: { value: '0.45', by: 10, dir: '×' } -> '4.5'
export const timesOf = ({ value, by, dir }) => decimalText(dir === '×' ? thOf(value) * by : thOf(value) / by);
// a dec-addsub sum's answer, exactly: { op: 'd−', a: '6.3', b: '2.48' } -> '3.82'
export const worthOf = ({ op, a, b }) => decimalText(op === 'd+' ? thOf(a) + thOf(b) : thOf(a) - thOf(b));

// ---- the generator ----

// the kinds of problem (plan D1 and D2, "Keys and asks"), and those of the easy level, which the worked examples come
// from: tenths only and no ones for dec-hundredths; no ones and 2 or 3 places for dec-thousandths. A key asked for
// (opts.key) is made at the easy level too, with its smallest numbers.
const KEYS = {
  'dec-hundredths': ['tenths', 'hundredths', 'as-hundredths', 'regroup', 'grid', 'split'],
  'dec-thousandths': ['thousandths', 'digit-place', 'expanded', 'partition', 'rename'],
};
const EASY = { 'dec-hundredths': ['tenths', 'as-hundredths', 'grid'], 'dec-thousandths': ['thousandths', 'digit-place', 'expanded', 'partition'] };
// dec-compare and dec-numberline (plan D3, D4 "Keys and asks"; near-hundredth from the log, Plan errors found): the keys
// drawn, each as often as the others (a zeros problem is 1 compare problem in 4, so it is drawn inside compare), the easy
// level's (a compare of two numbers or an order of 3; a line from 0 to 1 by tenths, and the nearest whole number), and
// the sum each key makes, which the way she works in and her own go after two ways side by side keep (opts.op)
// dec-x10 and dec-addsub (plan D5, D6) the same: every kind drawn as often as the others, but taking away from a whole
// number 1 problem in 6; easy, tenths × 10 and a tenth of a whole number, and adding and taking away with no trade
const LINE_KEYS = {
  'dec-compare': ['compare', 'zeros', 'order', 'biggest', 'between'],
  'dec-numberline': ['read', 'read-zoom', 'read-thousandths', 'which', 'near-whole', 'near-tenth', 'near-hundredth'],
  'dec-x10': ['x10', 'x100', 'tenth', 'hundredth', 'as-large'],
  'dec-addsub': ['add', 'sub', 'from-whole'],
};
const DRAWN = { 'dec-compare': ['compare', 'order', 'biggest', 'between'], 'dec-numberline': LINE_KEYS['dec-numberline'],
  'dec-x10': LINE_KEYS['dec-x10'], 'dec-addsub': ['add', 'add', 'add', 'sub', 'sub', 'from-whole'] };
const EASY_DRAWN = { 'dec-compare': ['compare', 'order'], 'dec-numberline': ['read', 'near-whole'], 'dec-x10': ['x10', 'tenth'], 'dec-addsub': ['add', 'sub'] };
const OP_OF = { compare: 'cmp', zeros: 'cmp', between: 'cmp', order: 'ord', biggest: 'ord', read: 'loc', 'read-zoom': 'loc',
  'read-thousandths': 'loc', which: 'loc', 'near-whole': 'near', 'near-tenth': 'near', 'near-hundredth': 'near',
  x10: 'x10', x100: 'x10', tenth: 'x10', hundredth: 'x10', 'as-large': 'x10', add: 'd+', sub: 'd−', 'from-whole': 'd−' };
const EMPTY = 0.25; // about 1 number in 4 with an empty place

const text = (ones, digits) => `${ones}.${digits.join('')}`;

// dec-hundredths: ones 0 to 9 at her usual level, 1 or 2 places, regrouping to 19 tenths or 199 hundredths
function hundredthsSum(rng, easy, key) {
  const ones = easy ? 0 : rng.int(0, 9);
  if (key === 'tenths') return { key, value: text(ones, [rng.int(1, 9)]) };
  if (key === 'hundredths') {
    const t = !easy && rng.chance(EMPTY) ? 0 : rng.int(1, 9);
    return { key, value: text(ones, [t, rng.int(1, 9)]), part: rng.pick(['count', 'places']) };
  }
  // 1 or 2 places (7.2, 3.46, 3.06 with the tenths empty 1 time in 4), at least 2 tenths with no ones, so its answer is
  // never the 10 hundredths a tenth is, nor the hundredths digit alone, both said in its steps
  if (key === 'as-hundredths') {
    if (easy || rng.chance(0.5)) return { key, value: text(ones, [rng.int(ones ? 1 : 2, 9)]) };
    return { key, value: text(ones, [ones && rng.chance(EMPTY) ? 0 : rng.int(1, 9), rng.int(1, 9)]) };
  }
  // 11 to 19 tenths, or 101 to 199 hundredths that are not whole tenths, a 0 in the tenths 1 time in 4 (1.05)
  if (key === 'regroup') {
    if (easy || rng.chance(0.5)) return { key, value: text(1, [rng.int(1, 9)]) };
    return { key, value: text(1, [rng.chance(EMPTY) ? 0 : rng.int(1, 9), rng.int(1, 9)]) };
  }
  if (key === 'grid') {
    const shaded = easy ? 10 * rng.int(1, 9) : rng.chance(EMPTY) ? rng.int(1, 9) : 10 * rng.int(1, 9) + rng.int(0, 9);
    return { key, value: decimalText(10 * shaded) };
  }
  return { key, value: text(ones, [rng.int(1, 9), rng.int(1, 9)]), part: rng.pick([1, 2]) };
}

// dec-thousandths: ones 0 to 99 at her usual level, 3 places, an empty place about 1 time in 4 (2.047, 13.405)
function thousandthsSum(rng, easy, key) {
  for (;;) {
    const ones = easy ? 0 : [0, rng.int(1, 9), rng.int(10, 99)][rng.int(0, 2)];
    const places = easy && !['thousandths', 'rename'].includes(key) ? rng.pick([2, 3]) : 3;
    const d = Array.from({ length: places }, () => rng.int(1, 9));
    if (!easy && rng.chance(EMPTY)) d[rng.int(0, 1)] = 0;
    const value = text(ones, d);
    const given = d.map((x, i) => (x ? i + 1 : 0)).filter(Boolean);
    if (key === 'digit-place') {
      // a digit that is in the number once, so it has one place
      const once = given.filter((k) => !`${ones}${d.join('')}`.replace(String(d[k - 1]), '').includes(String(d[k - 1])));
      if (once.length) return { key, value, part: rng.pick(once) };
      continue;
    }
    // at least one part shown beside the one missing
    if (key === 'partition' && given.length + (ones ? 1 : 0) >= 2) return { key, value, part: rng.pick(given) };
    if (key === 'rename') {
      const forms = ['hundredths', 'thousandths', ...(d[0] ? ['tenths'] : [])];
      return { key, value, part: rng.pick(forms) };
    }
    if (key === 'expanded' && given.length + (ones ? 1 : 0) < 2) continue;
    if (key !== 'partition') return { key, value };
  }
}

// a decimal with whole-number part n and p places, its last digit never 0 (a zero at the end only where one is put on
// purpose), an empty place before it about 1 time in 4
function decimalOf(rng, n, p) {
  const d = Array.from({ length: p }, (_, i) => (i === p - 1 ? rng.int(1, 9) : rng.int(0, 9)));
  if (p >= 2 && rng.chance(EMPTY)) d[rng.int(0, p - 2)] = 0;
  return text(n, d);
}
const distinct = (list) => new Set(list.map(thOf)).size === list.length;
// shown in an order that is not already smallest first
function shuffled(rng, list) {
  for (let i = 0; i < 20; i++) {
    const s = rng.shuffle(list);
    if (s.some((v, j) => j > 0 && thOf(v) < thOf(s[j - 1]))) return s;
  }
  return [...list].reverse();
}

// dec-compare (plan D3, "Sizes"): easy, ones 0 and 1 or 2 places; usual, ones 0 to 20 and up to 3 places. The trap the
// IES guide builds on and NESA's example shows (0.5, 0.125, 0.25), that a longer decimal is not a bigger one: in 6 usual
// compares in 10 the one with more places is the smaller, and in 6 usual order lists in 10 the 1-place value is the
// largest; 1 compare in 5 has two different whole numbers, so the number line does not fit every one
function compareSum(rng, easy, key) {
  const n = easy ? 0 : rng.int(0, 20);
  if (key === 'zeros') {
    // the same number written with zeros at the end: 0.5 and 0.500
    const p = easy ? 1 : rng.int(1, 2);
    const v = decimalOf(rng, n, p), more = `${v}${'0'.repeat(easy ? 1 : rng.int(1, 3 - p))}`;
    return rng.chance(0.5) ? { key, a: v, b: more } : { key, a: more, b: v };
  }
  if (key === 'compare') {
    const trap = !easy && rng.chance(0.6), other = !easy && rng.chance(0.2);
    const nb = other ? (n === 0 ? 1 : n === 20 ? 19 : n + rng.pick([-1, 1])) : n;
    for (;;) {
      const a = decimalOf(rng, n, rng.int(1, easy ? 2 : 3)), b = decimalOf(rng, nb, rng.int(1, easy ? 2 : 3));
      const [pa, pb] = [placesOf(a), placesOf(b)];
      const longerSmaller = pa !== pb && (pa > pb ? thOf(a) < thOf(b) : thOf(b) < thOf(a));
      if (thOf(a) !== thOf(b) && (easy || longerSmaller === trap)) return rng.chance(0.5) ? { key, a, b } : { key, a: b, b: a };
    }
  }
  if (key === 'between') {
    // "Which number is between 2.3 and 2.4?": one inside, one with the tenth's digit moved a place (2.03) and one past (2.5)
    const t = rng.int(1, 7);
    const right = easy || rng.chance(0.5) ? text(n, [t, rng.int(1, 9)]) : text(n, [t, rng.int(0, 9), rng.int(1, 9)]);
    return { key, a: text(n, [t]), b: text(n, [t + 1]), options: rng.shuffle([right, text(n, [0, t]), text(n, [t + 2])]) };
  }
  if (key !== 'order' && key !== 'biggest') throw new Error(`dec-compare has no kind of problem ${key}`);
  // order: usual, one value with 1 place, one with 2 and two with 3, all with one whole-number part and all different, 1
  // list in 4 with one written with a zero at the end (0.50, 2.140), its places as written; easy, one with 1 place and
  // two with 2. biggest: one each with 1, 2 and 3 places (easy 1, 2 and 2)
  const places = key === 'order' ? (easy ? [1, 2, 2] : [1, 2, 3, 3]) : easy ? [1, 2, 2] : [1, 2, 3];
  const trap = !easy && rng.chance(0.6), zero = key === 'order' && !easy && rng.chance(EMPTY);
  for (;;) {
    const values = places.map((p) => decimalOf(rng, n, p));
    if (zero) {
      const i = rng.int(1, values.length - 1);
      values[i] = `${values[i].slice(0, -1)}0`;
    }
    const oneLargest = inOrder(values).at(-1) === values[0];
    // a zero at the end only on a real decimal (0.50, 2.140), never a whole number padded (6.00)
    const real = values.every((v) => /[1-9]/.test(splitDecimal(v).frac));
    if (real && distinct(values) && (easy || oneLargest === trap)) return { key, values: shuffled(rng, values) };
  }
}

// dec-numberline (plan D4, "Sizes"): easy, a line from 0 to 1 by tenths and the nearest whole number with ones 0 to 9
// and 1 place; usual, ones 0 to 20, every key. Never a value halfway: the digit just after the place asked about is never
// 5. Every space at the place a line is read to is 15 px or more as drawn (engine/render/svg.js numberline: 0 to 2 by
// tenths is about 16 px a tenth).
// the tenths from n to n + 2 that are on no half or quarter mark, counted in tenths past n
const OFF_MARK = [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19];
function lineSum(rng, easy, key) {
  const n = easy ? 0 : rng.int(0, 20);
  const at = (...d) => text(n, d);
  if (key === 'read') {
    // a line of tenths, the arrow on a mark the line does not label (it labels every other tenth, so the arrow is never
    // on the number she reads); or, half the time at her usual level, NESA's line from n to n + 2 marked in halves or
    // quarters, labelled at the wholes and halves, the arrow on a tenth that is on no mark. A tenth there is about 13.5 px
    // as drawn, too fine to judge on her phone (D4 "Read live"; plans/2026-10-26-stage-6-step6-fixes.md, fix 8), so she
    // chooses it from three tenths on no mark, each at least 0.3 from the others, and only the right one between the two
    // marks either side of the point, so those marks alone tell them apart (engine/methods.js ticksSteps)
    if (easy || rng.chance(0.5)) return { key, from: `${n}`, to: `${n + 1}`, step: '0.1', by: '0.1', at: at(rng.pick([1, 3, 5, 7, 9])) };
    const k = rng.pick(OFF_MARK);
    const by = rng.pick(['0.5', '0.25']);
    const space = (x) => Math.floor((x * 100) / thOf(by)); // the space between marks a tenth is in
    const apart = (x, y) => Math.abs(x - y) >= 3;
    const [o1] = rng.shuffle(OFF_MARK.filter((x) => apart(x, k) && space(x) !== space(k)));
    const [o2] = rng.shuffle(OFF_MARK.filter((x) => apart(x, k) && apart(x, o1) && space(x) !== space(k)));
    const tenth = (x) => decimalText(n * 1000 + x * 100);
    return { key, from: `${n}`, to: `${n + 2}`, step: '0.1', by, at: tenth(k), options: rng.shuffle([k, o1, o2].map(tenth)) };
  }
  // a line of tenths, its one tenth around the arrow cut into hundredths, the arrow on a hundredth that is not a tenth
  if (key === 'read-zoom') return { key, from: `${n}`, to: `${n + 1}`, step: '0.01', by: '0.1', at: at(rng.int(0, 9), rng.int(1, 9)) };
  if (key === 'read-thousandths') {
    // a line of hundredths from n.t to n.t + 0.1, its one hundredth around the arrow cut into thousandths
    const t = rng.int(0, 9);
    return { key, from: decimalText(n * 1000 + t * 100), to: decimalText(n * 1000 + t * 100 + 100), step: '0.001', by: '0.01', at: at(t, rng.int(0, 9), rng.int(1, 9)) };
  }
  if (key === 'which') {
    // three letters at different hundredths, none on a tenth, at least 0.1 apart, on a line from 0 to 1 by tenths
    for (;;) {
      const hs = [0, 1, 2].map(() => 10 * rng.int(0, 9) + rng.int(1, 9)).sort((x, y) => x - y);
      if (hs[1] - hs[0] >= 10 && hs[2] - hs[1] >= 10) {
        const letters = hs.map((h) => decimalText(h * 10));
        return { key, from: '0', to: '1', step: '0.01', by: '0.1', at: rng.pick(letters), letters };
      }
    }
  }
  const not5 = (from) => rng.pick([0, 1, 2, 3, 4, 6, 7, 8, 9].filter((x) => x >= from));
  if (key === 'near-whole') {
    if (easy) return { key, value: text(rng.int(0, 9), [not5(1)]), to: '1' };
    return { key, value: rng.chance(0.5) ? at(not5(1)) : at(not5(0), rng.int(1, 9)), to: '1' };
  }
  if (key === 'near-tenth') {
    // 2.347 is nearest which tenth? 2.3, 2.4 or 2.35: the tenth's digit 1 to 8, so both tenths are written with one place
    const t = rng.int(1, 8);
    const value = rng.chance(0.5) ? at(t, not5(1)) : at(t, not5(0), rng.int(1, 9));
    return { key, value, to: '0.1', options: rng.shuffle([at(t), at(t + 1), at(t, 5)]) };
  }
  if (key !== 'near-hundredth') throw new Error(`dec-numberline has no kind of problem ${key}`);
  // near-hundredth, 2.347 to 2 decimal places: 3 places, the hundredths 0 to 8 so both hundredths are in its tenth
  return { key, value: at(rng.int(0, 9), rng.int(0, 8), not5(1)), to: '0.01' };
}

// dec-x10 (plan D5, "Sizes"): one to three digits that matter (as pv-x10 draws them), an empty place among them 1 time
// in 4 (3.05, 0.305); usual, up to 3 places in and out, so a number × 10 or 100 has 1 place or more and one ÷ 10 or 100
// no more than 3 once divided; 8 characters at most (999.9 is the most). Easy, tenths × 10 (4.5 × 10) and a tenth of 1
// to 9; a key asked for at the easy level, its smallest numbers: one digit, the fewest places it takes
const BY = { x10: [10, '×'], x100: [100, '×'], tenth: [10, '÷'], hundredth: [100, '÷'] };
function timesSum(rng, easy, key) {
  if (!BY[key] && key !== 'as-large') throw new Error(`dec-x10 has no kind of problem ${key}`);
  const [by, dir] = BY[key] ?? [easy ? 10 : rng.pick([10, 100]), '×'];
  const z = by === 10 ? 1 : 2;
  const p = easy ? (dir === '×' ? z : 0) : dir === '×' ? rng.int(1, 3) : rng.int(0, 3 - z);
  for (;;) {
    const sig = easy ? rng.int(1, key === 'x10' ? 99 : 9)
      : rng.chance(EMPTY) ? 100 * rng.int(1, 9) + rng.int(1, 9) : rng.int(1, rng.pick([9, 99, 999]));
    if (sig % 10) return { key, value: decimalText(sig * 10 ** (3 - p)), by, dir };
  }
}

// dec-addsub (plan D6, "Sizes"): easy, 1 place each, ones 0 to 9, no trade, so 2 columns; usual, 1 to 3 places each,
// different numbers of places half the time, a trade in half, never below 0, the whole-number parts 0 to 9 when either
// has 3 places and 0 to 99 otherwise, so the columns are 4 at most (5 with a carry out of the top one); from-whole takes
// a number of 1 to 3 places from a whole number (5 − 2.36), its empty places to fill. Never a whole-number answer (1.5 +
// 6.5): the written method's top column would be the answer itself, a box she fills twice, and the estimate in wholes,
// a step with no box, could say it (chosen for this game, not a syllabus requirement); nor an estimate of 0 (8.3 − 7.9)
// or with a number rounded to 0 (85.3 + 0.04, "85.3 + 0 = 85.3"), which say nothing about how big, or one that is the
// answer itself (0.7 + 0.2, whose estimate in tenths is 0.9), a step with no box that would say it. The estimate is every adding way's first step (engine/methods.js wayFor).
function addsubSum(rng, easy, key) {
  if (!LINE_KEYS['dec-addsub'].includes(key)) throw new Error(`dec-addsub has no kind of problem ${key}`);
  const op = OP_OF[key];
  const trade = !easy && rng.chance(0.5), differ = !easy && rng.chance(0.5);
  for (;;) {
    let a, b;
    if (key === 'from-whole') {
      const pb = easy ? 1 : rng.int(1, 3), top = easy || pb === 3 ? 9 : 99;
      const wb = rng.int(0, rng.pick([8, top - 1]));
      b = decimalOf(rng, wb, pb);
      a = String(rng.int(wb + 1, top));
    } else {
      const pa = easy ? 1 : rng.int(1, 3), pb = differ ? rng.pick([1, 2, 3].filter((x) => x !== pa)) : pa;
      const top = easy || Math.max(pa, pb) === 3 ? 9 : 99;
      [a, b] = [pa, pb].map((x) => decimalOf(rng, rng.int(0, rng.pick([9, top])), x));
      if (op === 'd−' && thOf(a) < thOf(b)) [a, b] = [b, a];
    }
    const sum = { op, key, a, b };
    if (op === 'd−' && thOf(a) <= thOf(b)) continue;
    const trades = decColumns(sum).into.length;
    if (easy ? key !== 'from-whole' && trades > 0 : key !== 'from-whole' && trades > 0 !== trade) continue;
    const exact = thOf(worthOf(sum));
    if (estimateFits(estimateOf(sum), exact) && exact % 1000 !== 0) return sum;
  }
}

// the question, its words and its answer for dec-x10 and dec-addsub, from the sum alone
function workedProblem(sum) {
  if (sum.op === 'x10') {
    const { key, value, by } = sum;
    const answer = { kind: 'decimal', value: timesOf(sum) };
    if (key === 'tenth' || key === 'hundredth') return { ask: `1/${by} of ${value} = ☐`, say: `What is a ${key} of ${value}?`, answer };
    if (key === 'as-large') return { ask: `☐ is ${by} times as large as ${value}`, say: `What is ${by} times as large as ${value}?`, answer };
    return { ask: `${value} × ${by} = ☐`, say: `${value} times ${by}`, answer };
  }
  const add = sum.op === 'd+';
  return { ask: `${sum.a} ${add ? '+' : '−'} ${sum.b} = ☐`, say: `${sum.a} ${add ? 'plus' : 'minus'} ${sum.b}`, answer: { kind: 'decimal', value: worthOf(sum) } };
}

// the question, its words and its answer for dec-compare and dec-numberline, from the sum alone
function lineProblem(sum) {
  const { key } = sum;
  const choice = (options, value) => ({ kind: 'choice', options, value });
  if (key === 'compare' || key === 'zeros') {
    return { ask: `${sum.a} ☐ ${sum.b}`, say: `Which sign goes between ${sum.a} and ${sum.b}: less than, equals, or greater than?`,
      answer: choice(['<', '=', '>'], signOf(sum.a, sum.b)) };
  }
  if (key === 'between') {
    const ask = `Which number is between ${sum.a} and ${sum.b}: ${orList(sum.options)}?`;
    return { ask, say: ask, answer: choice(sum.options, sum.options.find((o) => thOf(o) > thOf(sum.a) && thOf(o) < thOf(sum.b))) };
  }
  if (key === 'order') {
    const ask = `Put these in order, smallest first: ${sum.values.join(', ')}`;
    return { ask, say: ask, answer: { kind: 'order', values: inOrder(sum.values) } };
  }
  if (key === 'biggest') {
    const ask = `Which is the biggest: ${orList(sum.values)}?`;
    return { ask, say: ask, answer: choice(sum.values, inOrder(sum.values).at(-1)) };
  }
  // a line read at a point names its two ends, so the screen keeps its picture (js/runner.js asked)
  if (key === 'which') {
    const ask = `Which letter is at ${sum.at}?`;
    return { ask, say: ask, answer: choice(['A', 'B', 'C'], ['A', 'B', 'C'][sum.letters.indexOf(sum.at)]) };
  }
  if (sum.op === 'loc') {
    // the halves-or-quarters line, a choice of three tenths listed in the question, as between and biggest list theirs
    if (sum.options) {
      const ask = `Between ${sum.from} and ${sum.to}, which number is at the point: ${orList(sum.options)}?`;
      return { ask, say: ask, answer: choice(sum.options, sum.at) };
    }
    const ask = `Between ${sum.from} and ${sum.to}, what number is at the point${sum.by === sum.step || key !== 'read' ? '' : ', to the nearest tenth'}?`;
    return { ask, say: ask, answer: { kind: 'decimal', value: sum.at } };
  }
  // to the nearest whole, tenth or hundredth by the game's one rule, 5 or more up (placevalue.js roundTo), on a whole
  // number of thousandths, so exactly; never asked halfway
  const round = roundTo(thOf(sum.value), thOf(sum.to)).value;
  if (key === 'near-whole') {
    const ask = `Which whole number is ${sum.value} nearest?`;
    return { ask, say: ask, answer: { kind: 'number', value: round / 1000 } };
  }
  if (key === 'near-tenth') {
    const ask = `${sum.value} is nearest which tenth?`;
    return { ask, say: ask, answer: choice(sum.options, decimalText(round)) };
  }
  return { ask: `${sum.value} to 2 decimal places is ☐`, say: `What is ${sum.value} to 2 decimal places?`, answer: { kind: 'decimal', value: decimalText(round) } };
}

// the question, its words and its answer, from the sum alone, so the same sum makes the same problem whichever way
// works it (js/runner.js compare)
function problem({ key, value, part }) {
  const { ones, d, places, th } = decParts(value);
  const decimal = { kind: 'decimal', value };
  const withOnes = (rest) => (ones ? `${countOf(ones, 0)} and ${rest}` : rest);
  const after = d[0] * 100 + d[1] * 10 + d[2]; // the thousandths after the point
  const parts = [...(ones ? [String(ones)] : []), ...d.map((x, i) => (x ? partText(x, i + 1) : null)).filter(Boolean)];
  if (key === 'tenths') {
    const ask = withOnes(countOf(d[0], 1));
    return { ask: `${ask} = ☐`, say: `What decimal is ${ask}?`, answer: decimal };
  }
  if (key === 'hundredths') {
    const ask = part === 'count' ? withOnes(countOf(d[0] * 10 + d[1], 2))
      : andList([ones ? countOf(ones, 0) : '', d[0] ? countOf(d[0], 1) : '', countOf(d[1], 2)].filter(Boolean));
    return { ask: `${ask} = ☐`, say: `What decimal is ${ask}?`, answer: decimal };
  }
  if (key === 'as-hundredths') return { ask: `${value} = ☐ hundredths`, say: `${value} is how many hundredths?`, answer: { kind: 'number', value: th / 10 } };
  if (key === 'regroup') {
    const ask = places === 1 ? countOf(th / 100, 1) : countOf(th / 10, 2);
    return { ask: `${ask} = ☐`, say: `What decimal is ${ask}?`, answer: decimal };
  }
  if (key === 'grid') return { ask: 'What decimal is shaded?', say: 'What decimal is shaded?', answer: decimal };
  if (key === 'split' || key === 'partition') {
    const gone = partText(d[part - 1], part);
    const shown = parts.map((x) => (x === gone ? '☐' : x)).join(' + ');
    return { ask: `${value} = ${shown}`, say: `${value} is ${shown.replace(/ \+ /g, ' plus ').replace('☐', 'what')}?`, answer: { kind: 'decimal', value: gone } };
  }
  if (key === 'thousandths') {
    const ask = withOnes(countOf(after, 3));
    return { ask: `${ask} = ☐`, say: `What decimal is ${ask}?`, answer: decimal };
  }
  if (key === 'digit-place') {
    const x = d[part - 1];
    const options = [1, 2, 3].map((k) => countOf(x, k));
    return { ask: `In ${value}, what is the ${x} worth?`, say: `In ${value}, what is the ${x} worth?`, answer: { kind: 'choice', options, value: options[part - 1] } };
  }
  if (key === 'expanded') return { ask: `${parts.join(' + ')} = ☐`, say: parts.join(' plus '), answer: decimal };
  // rename: the parts in a place other than their own, as stage 5 gave whole numbers ("4386 = 43 hundreds + 86")
  const lead = ones ? `${ones} + ` : '';
  const [shown, answer] = part === 'hundredths' ? [`${countOf(d[0] * 10 + d[1], 2)} + ☐ thousandths`, d[2]]
    : part === 'tenths' ? [`${countOf(d[0], 1)} + ☐ thousandths`, d[1] * 10 + d[2]]
    : [`☐ hundredths + ${countOf(d[2], 3)}`, d[0] * 10 + d[1]];
  return { ask: `${value} = ${lead}${shown}`, say: `${value} is ${lead.replace('+', 'plus')}${shown.replace('+', 'plus').replace('☐', 'how many')}?`,
    answer: { kind: 'number', value: answer } };
}

// dec-compare, dec-numberline, dec-x10 and dec-addsub: the sum asked for (opts.sum), else one of the kind asked
// (opts.key, else drawn; opts.op keeps the kind of sum, as her own go after two ways side by side asks; counting up, a
// way of taking away, asks for taking away), drawn again until every way asked (opts.method, and opts.also beside it)
// fits, as engine/items/divide.js draws; 50 draws at most, then the way that fits works it
const SUM_OF = { 'dec-compare': compareSum, 'dec-numberline': lineSum, 'dec-x10': timesSum, 'dec-addsub': addsubSum };
function lineSumFor(skillId, rng, easy, opts) {
  if (opts.sum) return opts.sum;
  const ways = [opts.method, opts.also].filter((w) => methodsOf(skillId).includes(w));
  const op = opts.op ?? (opts.also && ways.includes('dec-count-up') ? 'd−' : undefined);
  const kinds = (easy ? EASY_DRAWN : DRAWN)[skillId].filter((k) => !op || OP_OF[k] === op);
  for (let i = 0; ; i++) {
    let key = opts.key || rng.pick(kinds.length ? kinds : LINE_KEYS[skillId].filter((k) => OP_OF[k] === op));
    if (!opts.key && key === 'compare' && rng.chance(EMPTY)) key = 'zeros';
    // a sum made whole by its kind (dec-addsub's) is kept as made, so what was worked out for it is not worked again
    const made = SUM_OF[skillId](rng, easy, key);
    const sum = made.op === OP_OF[key] ? made : { op: OP_OF[key], ...made };
    if (!opts.also || i >= 50 || ways.every((w) => wayFits(w, sum))) return sum;
  }
}

export default {
  skills: ['dec-hundredths', 'dec-thousandths', 'dec-compare', 'dec-numberline', 'dec-x10', 'dec-addsub'],
  // opts.method works it that way, opts.sum makes that very problem again, opts.key keeps its kind; for dec-hundredths
  // and dec-thousandths both ways fit every one, so opts.also needs no particular numbers (dec-compare and dec-numberline:
  // lineSumFor)
  make(skillId, rng, opts = {}) {
    const easy = Boolean(opts.easy);
    if (LINE_KEYS[skillId]) {
      const sum = lineSumFor(skillId, rng, easy, opts);
      const { method, steps } = wayFor(skillId, sum, opts.method);
      const way = METHODS[method];
      const asked = skillId === 'dec-x10' || skillId === 'dec-addsub' ? workedProblem(sum) : lineProblem(sum);
      return { skill: skillId, key: sum.key, sum, method, ...asked, steps, picture: way.picture(sum), hint: way.hint(sum), words: way.words(sum) };
    }
    // places: how many places after the point the skill works to, which its ways' charts and parts are counted in
    const sum = opts.sum ?? { op: 'rep', ...(skillId === 'dec-hundredths' ? hundredthsSum : thousandthsSum)(rng, easy, opts.key || rng.pick((easy ? EASY : KEYS)[skillId])),
      places: skillId === 'dec-hundredths' ? 2 : 3 };
    // the way asked for where it fits, else the skill's first; a way only set beside it (opts.also) asks for none
    const { method, steps } = wayFor(skillId, sum, opts.method);
    const way = METHODS[method];
    return { skill: skillId, key: sum.key, sum, method, ...problem(sum), steps, picture: way.picture(sum), hint: way.hint(sum), words: way.words(sum) };
  },
};
