// Percentages (stage 6 strand 3, plans/2026-10-25-stage-6-plan.md "Strand 3: percentages"): the generator of the
// percentage skills, pct-benchmarks, pct-of and pct-discount (its discount, its sale price and its estimate),
// each a list of keys, its classes in classesOf and its question in problem. A per cent is always a whole number; a
// fraction is text 'n/d', a decimal the game's text ('0.75') and money whole cents as the game writes it ('4.70'), never
// a float; the ways that work them are in engine/percent-ways.js.
//
// pct-benchmarks, MA3-RN-03, "determines percentages of quantities, and finds equivalent fractions and decimals for
// benchmark percentage values" (Outcomes, saved copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-
// outcomes.md l.246-248): "Recognise that the symbol % means percent and 100% is the whole amount" (l.54), "Recall
// commonly used equivalent percentages, decimals and fractions including 1/2, 1/4, and 3/4" (l.55) and "Represent common
// percentages of quantities and lengths as fractions and decimals" (l.56) (Stage 3 Represents numbers B, saved copy
// 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-fa0a18f458.md, .../stage-3/fa0a18f458), its Examples and
// teaching advice read live 28 October 2026 ("Such as 75%, 0.75", "Such as 25% means 25 out of 100 or 25/100 or 0.25",
// the bar shaded to a quarter of its length, and one-tenth (10%, 0.1) among the benchmarks: Examples fa0a18f458 l.47,
// l.51, l.53-55, l.98-100). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026.
//
// Chosen for this game, not a syllabus requirement: the conversions between hundredths and whole per cents from 1% to
// 99% beyond the benchmarks (37%, 0.05), as practice of l.56's "common percentages ... as fractions and decimals"; the
// wholes a rest is told of (REST); the release 4 gate (engine/skills.js). Every problem is drawn from a list made once of
// every one the plan allows (plan, "Rules every percentage generator keeps"): the key first, each as often as the others;
// then its class by its weight; then a problem, each in its class as often as the others, and with opts.also only one
// both ways fit. A problem is left out where the answer's number is in the text before the answer step: a rest of 50%,
// whose answer is the per cent the question gives.
//
// pct-of, MA3-RN-03: "Recognise that 10% is one-tenth of 100% and use this to find 10% of a quantity" (l.57), "Equate 10%
// to dividing by 10, 25% to finding a quarter by dividing by 4, and 50% to finding half" (l.61), and l.56's "common
// percentages of quantities", with 75% as 3 quarters (l.55) and the tens of per cent as the teaching advice works them
// ("10% of 150 is 15, so 20% of 150 is 2 lots of 15", Examples fa0a18f458 l.88), its Example "Such as 10% of $200."
// (l.59). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026. Chosen for this game,
// not a syllabus requirement: the amounts (to 500, a story's to 200) and the stories' things and lengths (AMOUNTS, the
// fractions' own). A problem is left out where the answer's number is in the text before the answer step by any way
// that fits it: "10% of 100", "50% of 4" ("cut 4 into 2 equal parts"), "20% of 50" ("50 ÷ 10").
//
// pct-discount, MA3-RN-03: "Determine percentage discounts of 10%, 25% and 50%" (l.59), "Equate 10% to dividing by 10, 25%
// to finding a quarter by dividing by 4, and 50% to finding half" (l.61) and "Calculate the sale price of an item after a
// discount of 10%, 25% and 50%" (l.63), its Example "Find a discount of 25% of $120 by finding half (50%) and half again."
// (Examples fa0a18f458 l.71). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026.
// Chosen for this game, not a syllabus requirement: the prices (whole dollars, $11 to $200; at the easy level a discount
// in whole dollars of $10 to $100), the things in the shop (SHOP), and "42.3" taken for "42.30" (engine/check.js). A
// problem is left out where the answer's number is in the text before the answer step by either way: "10% of $100"
// ("cut $100 into 10 equal parts"), "25% of $200" ("50% is half of it").
//
// Its estimate, MA3-RN-03: "Use mental strategies to estimate discounts of 10%, 25% and 50%" (l.62), its Example "Such as
// 50% off the price of $1099.99: 50% is the same as 1/2, so the discount is about $500." (Examples fa0a18f458 l.67), NESA's
// own price among its problems. NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026.
// Chosen for this game, not a syllabus requirement: the estimate asked as a choice of three amounts, the price rounded to
// the nearest whole dollar first (so exactly one amount is right, $550 for NESA's "about $500"), the prices ($40 to $2000,
// less 1 to 50 cents) and the big things (BIG). A problem is left out where its estimate's number is in the text before
// the last step: "10% of $99.50" and "50% of $99.50" ("10%", "50%"), "25% of $199.50" ("50% is half, and 25% is half
// again."), "10% of $499.50" (its cents said "499 dollars 50").

import { METHODS, wayFor, wayFits } from '../methods.js';
import { BY_ID } from '../skills.js';
import { hundredthsText, dollars } from '../percents.js';
import { pofTape, pofValue, poffValue, discountCents, estimateValue, POFF_PS } from '../percent-ways.js';
import { drawSum, AMOUNTS, READ, twoNames, storyOf, ofStoryAsk } from './fractions.js';
import { NAMES } from '../../content/word-problems/settings.js';
import { decimalText } from './decimals.js';
import { thousandths, fmt } from '../check.js';
import { FRACTION_NAMES, namesOf } from '../fractions.js';

// the kinds of problem (plan P1, "Keys and asks"), and those of the easy level ("Sizes"), which the worked examples come
// from; a key asked for (opts.key) that the easy level has not is made with its usual numbers
export const KEYS = {
  'pct-benchmarks': ['shaded', 'rest', 'to-percent', 'from-percent', 'as-decimal'],
  'pct-of': ['tenth', 'half', 'quarter', 'tens', 'three-quarters', 'story'],
  'pct-discount': ['discount', 'sale', 'estimate'],
};
export const EASY = {
  'pct-benchmarks': ['shaded', 'to-percent'],
  'pct-of': ['tenth', 'half', 'quarter'],
  'pct-discount': ['discount'],
};

// The wholes a rest is told of (plan, "Rules every percentage generator keeps"), chosen for this game: one whole with one
// part done, never two parts of one thing. No digits here: every number in a question is one the problem draws. The sum
// keeps the noun, which its way says ("The whole fence is 100%.").
export const REST = [
  { id: 'fence', noun: 'fence', the: 'the fence', been: 'painted' },
  { id: 'garden', noun: 'garden bed', the: 'the garden bed', been: 'planted' },
  { id: 'book', noun: 'book', the: 'the book', been: 'read' },
  { id: 'puzzle', noun: 'puzzle', the: 'the puzzle', been: 'finished' },
  { id: 'pizza', noun: 'pizza', the: 'the pizza', been: 'eaten' },
  { id: 'cake', noun: 'cake', the: 'the cake', been: 'eaten' },
  { id: 'chocolate', noun: 'block of chocolate', the: 'the block of chocolate', been: 'eaten' },
];
const restOf = (sum) => REST.find((c) => c.noun === sum.noun);

// The things in the shop a discount is told of (plan, "Rules every percentage generator keeps"), chosen for this game:
// one thing, one price. No digits here: every number in a question is one the problem draws. The sum keeps the thing,
// which no step says.
export const SHOP = [
  { id: 'jacket', a: 'a jacket' }, { id: 'backpack', a: 'a backpack' }, { id: 'board-game', a: 'a board game' }, { id: 'lamp', a: 'a lamp' },
  { id: 'football', a: 'a football' }, { id: 'runners', a: 'a pair of runners' }, { id: 'tent', a: 'a tent' }, { id: 'scooter', a: 'a scooter' },
];
// The big things an estimate is told of (plan, "Rules every percentage generator keeps"), chosen for this game: one thing,
// one price, each dear enough to round. No digits here; the sum keeps the thing, which no step says.
export const BIG = [
  { id: 'bike', a: 'a bike' }, { id: 'tent', a: 'a tent' }, { id: 'couch', a: 'a couch' }, { id: 'fridge', a: 'a fridge' },
  { id: 'guitar', a: 'a guitar' }, { id: 'scooter', a: 'a scooter' },
];
const thingOf = (sum) => (sum.op === 'pest' ? BIG : SHOP).find((c) => c.id === sum.thing);

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
// the per cents on a line's marks (the tens, the quarters and the half), and those off them: a single digit, and the rest
const ON_MARKS = [50, 25, 75, 10, 20, 30, 40, 60, 70, 80, 90];
const UNDER_TEN = range(1, 9);
const OFF_MARKS = range(11, 99).filter((p) => p % 10 !== 0 && p !== 25 && p !== 75);
// the benchmark fractions as per cents (l.55; one-tenth and its multiples, Examples fa0a18f458 l.100), never 5/10, which
// is the half
const FRACTIONS = [[1, 2], [1, 4], [3, 4], [1, 10], ...[2, 3, 4, 6, 7, 8, 9].map((k) => [k, 10])];

// P1's problems (plan P1, "Sizes"): shaded, a strip of 2, 4 or 10 parts, 1 to d − 1 shaded; rest, a ten half the time and
// a five that is not a ten half the time, never 50; to-percent, a fraction half the time, else a decimal on the line's
// marks two thirds of the time and one in hundredths off them one third, half of those under 0.1; from-percent, 50% in
// halves, 25% and 75% in quarters, the tens in tenths; as-decimal, the per cents on the marks two thirds of the time, one
// off them one third, half of those a single digit. No answer is more than a third of a key's problems or of the easy
// level's (the step's review, finding 1, a plan error: the plan's sizes made 50 half of them): the strips weighted 1 : 2 :
// 3 by their number of problems, so 50 is a third of shaded; the answers of 1 in from-percent (50% = ☐/2, 25% = ☐/4,
// 10% = ☐/10) a sixth of it (finding 2); at the easy level shaded in halves or quarters but never 2/4, and to-percent
// from 1/4 and 3/4 a third each, from 1/2 and 0.5 a sixth each, so 50 is a third of the level
function benchmarkClasses(key, easy) {
  const pct = (more) => ({ op: 'pct', key, ...more });
  const one = (sums) => [{ name: key, weight: 1, sums }];
  const fraction = ([n, d]) => pct({ p: (100 * n) / d, n, d });
  const decimal = (p) => pct({ p, dec: hundredthsText(p) });
  if (key === 'shaded') {
    const strip = (d) => range(1, d - 1).map((n) => fraction([n, d]));
    return easy ? one([2, 4].flatMap(strip).filter((x) => x.n * 2 !== x.d || x.d === 2))
      : [[2, 1], [4, 2], [10, 3]].map(([d, weight]) => ({ name: `in ${d}`, weight, sums: strip(d) }));
  }
  if (key === 'rest') {
    return [{ name: 'a ten', weight: 1, sums: ON_MARKS.filter((p) => p % 10 === 0 && p !== 50).sort((a, b) => a - b).map((p) => pct({ p })) },
      { name: 'a five', weight: 1, sums: range(0, 9).map((k) => pct({ p: 10 * k + 5 })) }];
  }
  if (key === 'to-percent') {
    if (easy) return [{ name: 'a quarter', weight: 2, sums: FRACTIONS.slice(1, 3).map(fraction) }, { name: 'a half', weight: 1, sums: [fraction([1, 2]), decimal(50)] }];
    return [{ name: 'a fraction', weight: 6, sums: FRACTIONS.map(fraction) }, { name: 'a decimal on the marks', weight: 4, sums: ON_MARKS.map(decimal) },
      { name: 'hundredths under 0.1', weight: 1, sums: UNDER_TEN.map(decimal) }, { name: 'other hundredths', weight: 1, sums: OFF_MARKS.map(decimal) }];
  }
  if (key === 'from-percent') {
    return [{ name: 'an answer of 1', weight: 2, sums: [[1, 2], [1, 4], [1, 10]].map(fraction) },
      { name: 'more than 1', weight: 10, sums: [[3, 4], ...range(2, 9).map((k) => [k, 10])].map(fraction) }];
  }
  if (key !== 'as-decimal') throw new Error(`no percentage problem of kind ${key}`);
  return [{ name: 'on the marks', weight: 4, sums: ON_MARKS.map((p) => pct({ p })) }, { name: 'a single digit', weight: 1, sums: UNDER_TEN.map((p) => pct({ p })) },
    { name: 'other per cents', weight: 1, sums: OFF_MARKS.map((p) => pct({ p })) }];
}

// P2's problems (plan P2, "Sizes"): 10% and the tens (each ten a class, so each as often) of a multiple of 10 from 20 to
// 500; 50% of an even amount from 4 to 400; 25% and 75% of a multiple of 4 from 8 to 400; a story one of those five
// families, each a class as often as the others, its amount at most 200; easy, 10%, 50% and 25% of at most 100. Every
// class after the rule "The answer's number is in no earlier text" (so no amount of 100)
const POF_TENS = [20, 30, 40, 60, 70, 80, 90];
const multiples = (step, lo, hi) => range(Math.ceil(lo / step), Math.floor(hi / step)).map((k) => k * step);
const POF_FAMILIES = {
  tenth: { ps: [10], step: 10, lo: 20, hi: 500 }, tens: { ps: POF_TENS, step: 10, lo: 20, hi: 500 }, half: { ps: [50], step: 2, lo: 4, hi: 400 },
  quarter: { ps: [25], step: 4, lo: 8, hi: 400 }, 'three-quarters': { ps: [75], step: 4, lo: 8, hi: 400 },
};
const familyOf = (p) => Object.keys(POF_FAMILIES).find((k) => POF_FAMILIES[k].ps.includes(p));
// Every number she sees or hears before the answer step, whichever of the skill's ways she is asked by, as whole
// thousandths, so "4.70" and "4.7" are one number and "0.5" and "50" two (plan, "Rules every percentage generator
// keeps"): the question's (shown and said), its tape's parts and amount, and each step before the last, its words, its
// value and its tape's, a way that cannot work it saying so first (so 25% of 40 is left out: "Finding 10% first won't
// work here", R12); a price's cents as said too, "$499.50" "499 dollars 50" (js/speech.js), so 10% of about $500 is left
// out there
function earlierNumbers(skillId, sum, { ask, say, picture }) {
  const texts = [ask, say], pictures = [picture];
  for (const w of BY_ID[skillId].methods) {
    for (const st of wayFor(skillId, sum, w).steps.slice(0, -1)) {
      texts.push(st.text, 'value' in st ? String(st.value) : '');
      pictures.push(st.picture);
    }
  }
  const out = new Set(texts.flatMap((t) => [...t.matchAll(/\d+(?:\.\d+)?/g)].map((m) => thousandths(m[0]))));
  for (const t of texts) for (const m of t.matchAll(/\$\d+\.(\d\d)/g)) out.add(BigInt(m[1]) * 1000n);
  for (const pic of pictures.filter(Boolean)) for (const x of [pic.total, ...pic.rows.flatMap((r) => [r.d, r.value])]) if (Number.isInteger(x)) out.add(BigInt(x) * 1000n);
  return out;
}
// pct-of's: a story's are its family's, the story's words having no number but its amount and its per cent
function ofEarlierNumbers(sum) {
  const plain = { ...sum, key: familyOf(sum.p) };
  return earlierNumbers('pct-of', plain, problem(plain));
}
function ofClasses(key, easy) {
  const sums = (k, ps, hi) => ps.flatMap((p) => {
    const f = POF_FAMILIES[familyOf(p)];
    return multiples(f.step, f.lo, Math.min(f.hi, hi)).map((of) => ({ op: 'pof', key: k, p, of }));
  }).filter((s) => !ofEarlierNumbers(s).has(BigInt(pofValue(s)) * 1000n));
  if (key === 'story') return Object.entries(POF_FAMILIES).map(([name, f]) => ({ name, weight: 1, sums: sums('story', f.ps, 200) }));
  if (!POF_FAMILIES[key]) throw new Error(`no percentage problem of kind ${key}`);
  const hi = easy ? 100 : Infinity;
  if (key === 'tens') return POF_TENS.map((p) => ({ name: `${p}%`, weight: 1, sums: sums(key, [p], hi) }));
  return [{ name: key, weight: 1, sums: sums(key, POF_FAMILIES[key].ps, hi) }];
}

// P3's problems (plan P3, "Sizes"): a discount and a sale price each of 10%, 25% and 50%, each per cent a class as often
// as the others, of a price in whole dollars from $11 to $200, so a discount is to the cent; at the easy level a
// discount only, its price a multiple of 10 for 10%, of 4 for 25%, of 2 for 50%, from $10 to $100, so every value is
// whole dollars. Every class after the rule "The answer's number is in no earlier text", judged by both ways and with
// any thing in the shop, the things having no number
const EASY_PRICE = { 10: 10, 25: 4, 50: 2 };
function offClasses(key, easy) {
  const prices = (p) => (easy ? multiples(EASY_PRICE[p], 10, 100) : range(11, 200));
  const left = (s) => {
    const told = { ...s, thing: SHOP[0].id };
    return !earlierNumbers('pct-discount', told, problem(told)).has(thousandths(poffValue(s)));
  };
  return POFF_PS.map((p) => ({ name: `${p}%`, weight: 1, sums: prices(p).map((price) => ({ op: 'poff', key, p, price })).filter(left) }));
}

// The estimate's problems (plan P3, "Sizes"): 10%, 25% and 50%, each a class as often as the others; the round price R a
// multiple of 100 for 10%, of 40 for 25%, of 20 for 50%, from $40 to $2000, so E, p% of R, is a multiple of 10; the price
// R less 1 to 50 cents, as text with its two places ('1099.99', '1199.50'), R its nearest whole dollar. The same at both
// levels (the easy level has no estimate; one asked for by opts.key is made with these). Every class after the rule "The
// answer's number is in no earlier text", judged by both ways and with any big thing, the things having no number
const ROUND_STEP = { 10: 100, 25: 40, 50: 20 };
function estimateClasses() {
  const left = (s) => {
    const told = { ...s, thing: BIG[0].id, options: optionsOf(s, OPTION_SETS[s.p][0]) };
    return !earlierNumbers('pct-discount', told, problem(told)).has(BigInt(estimateValue(s)) * 1000n);
  };
  return POFF_PS.map((p) => ({
    name: `${p}%`, weight: 1,
    sums: multiples(ROUND_STEP[p], 40, 2000).flatMap((round) => range(1, 50).map((less) => ({ op: 'pest', key: 'estimate', p, price: dollars(BigInt(round) * 100n - BigInt(less)), round }))).filter(left),
  }));
}
// an amount in cents as money as the game writes it ("$5.50", "$55", "$10 000": cents with two places, whole dollars
// grouped from 10 000, engine/check.js fmt)
const moneyOf = (c) => `$${fmt(Number(c / 100n))}${c % 100n ? `.${String(c % 100n).padStart(2, '0')}` : ''}`;
// an option in cents from E and R in cents: E times a hundredth, a tenth, 10 or 100 (plan P3, "Sizes"); R − E, the round
// price's sale price (P3's own misconception, the sale price given for the discount: 9E at 10%, 3E at 25%); and R − E times
// 10 (90E, 30E), at 25% only a tenth (0.3E) and at 10% only a hundredth (0.09E), so E's digits are sometimes the odd ones
// (the lead's rulings, rounds 4 and 5)
const OPTION = {
  hundredth: (e) => e / 100n, tenth: (e) => e / 10n, e: (e) => e, ten: (e) => e * 10n, hundred: (e) => e * 100n,
  left: (e, r) => r - e, leftTen: (e, r) => (r - e) * 10n, leftTenth: (e, r) => (r - e) / 10n, leftHundredth: (e, r) => (r - e) / 100n,
};
// Which three options a problem gets, each in increasing order and listed as often as it is drawn (the step 3.5 code review,
// finding 1, and the lead's ruling, R12, the build log's Plan errors found, "Strand 3, step 3.5"). E is at least R ÷ 10, so
// E × 10 is already more than the price: with only P3's five candidates the right option is always the largest under the
// price. At 10% and 25% R − E, between E and the price, is a wrong option in 20 of 30 (so the largest under the price is
// right 10 of 30), and E is first, in the middle and last 10 of 30 each (P3, "Sizes"; the lead's ruling, round 3), the
// middle 6 after a hundredth (of E, or at 10% of R − E) and 4 after a tenth (of E, or at 25% of R − E). The least option
// has cents only where it is a hundredth (E is whole tens), so E is never first then; with E's place a third each, whether it has cents shows E's place about 64% of the time
// at most, either way (the plan's sizes; the lead's ruling, R12). R − E's digits match neither other option's, so where it
// is shown E's digits are made the odd ones in some sets (the step 3.5 code review's round 2, finding 4, and the lead's
// ruling, round 4): [E, R − E, (R − E) × 10] every time E is first at 10% (with only a tenth or a hundredth of E below it,
// which share its digits, E is never the odd one in the middle), 7 of 30 at 25%, and [(R − E) ÷ 10, E, R − E] 4 of 30 at 25%; so "drop the
// odd digits, then take the largest under the price" is right 20 of 30 at 10% and 19 of 30 at 25%. At 10% that left "the
// odd-digits option taken where it is the least, else dropped" right every time, so [(R − E) ÷ 100, E, R − E] 4 of 30 there,
// from the middle's sets after a hundredth (its least option has cents as theirs has, so the bands stay), E the odd one in
// the middle (the lead's ruling, round 5): that rule is then right 26 of 30, and the first 16 of 30. At 50% R − E is E, no
// slip lies between E and the price, and P3's three, each ten times the one before, are a third each (E first, the middle,
// last). Each list in E's place's order, first, middle, last, 10 each of 30
const SETS = {
  10: [
    [['e', 'left', 'leftTen'], 10],
    [['hundredth', 'e', 'left'], 2], [['leftHundredth', 'e', 'left'], 4], [['tenth', 'e', 'left'], 4],
    [['hundredth', 'tenth', 'e'], 10],
  ],
  25: [
    [['e', 'left', 'leftTen'], 7], [['e', 'left', 'ten'], 2], [['e', 'left', 'hundred'], 1],
    [['hundredth', 'e', 'left'], 6], [['leftTenth', 'e', 'left'], 4],
    [['hundredth', 'tenth', 'e'], 10],
  ],
};
const listed = (sets) => sets.flatMap(([set, n]) => Array.from({ length: n }, () => set));
const OPTION_SETS = {
  10: listed(SETS[10]), 25: listed(SETS[25]),
  50: [['e', 'ten', 'hundred'], ['tenth', 'e', 'ten'], ['hundredth', 'tenth', 'e']],
};
// the three options of a set, as money, every one from $0.10 to $100 000, since E is 10 to 1000
function optionsOf(sum, set) {
  const e = BigInt(estimateValue(sum)) * 100n, r = BigInt(sum.round) * 100n;
  return set.map((k) => moneyOf(OPTION[k](e, r)));
}

// every problem of a skill's key at a level, in its classes: [{ name, weight, sums }]
function classesOf(skillId, key, easy) {
  if (skillId === 'pct-benchmarks') return benchmarkClasses(key, easy);
  if (skillId === 'pct-of') return ofClasses(key, easy);
  if (skillId === 'pct-discount') return key === 'estimate' ? estimateClasses() : offClasses(key, easy);
  throw new Error(`${skillId} has no percentage problems`);
}
const MEMO = new Map(), KEPT = new Map();
export function problemsOf(skillId, key, easy) {
  if (!KEYS[skillId]?.includes(key)) throw new Error(`${skillId} has no kind of problem ${key}`);
  const at = `${skillId}:${key}:${Boolean(easy)}`;
  if (!MEMO.has(at)) MEMO.set(at, classesOf(skillId, key, Boolean(easy)));
  return MEMO.get(at);
}

const untold = (sum) => sum.op === 'pof' && sum.key === 'story' && !sum.story?.context;
// every way a problem can be told, for the voice tools (tools/voice-lines.mjs every): a rest in each of its wholes; a
// story in each of its contexts (AMOUNTS), its names two of NAMES (a name is a slot of its own, said the same in any
// line); a discount with each thing in the shop, an estimate with each big thing (its options, which no line says, drawn as
// for a new problem)
export function tellings(sum) {
  if (sum.key === 'rest' && !sum.noun) return REST.map((c) => ({ ...sum, noun: c.noun }));
  if (sum.op === 'poff' && !sum.thing) return SHOP.map((c) => ({ ...sum, thing: c.id }));
  if (sum.op === 'pest' && !sum.thing) return BIG.map((c) => ({ ...sum, thing: c.id }));
  if (untold(sum)) return AMOUNTS.map((c) => ({ ...sum, story: storyOf(c, NAMES.slice(0, 2)) }));
  return [sum];
}
// a rest's whole, a discount's thing, an estimate's thing and options, and a story's names and context, drawn after its
// numbers: the giver, then a receiver who is not the giver (F6's draw, engine/items/fractions.js twoNames, and its story,
// storyOf), then things or a length each half the time (so neither is learned, AMOUNTS having 6 things and 2 lengths). An
// estimate's three options, a set of OPTION_SETS drawn apart from its numbers and its thing, so E's place is never learned
// from either (plan P3, "Sizes"; the step 2.2 code review, findings 1 to 3); options given are kept
function toldOf(sum, rng) {
  if (sum.key === 'rest' && !sum.noun) return { ...sum, noun: rng.pick(REST).noun };
  if (sum.op === 'poff' && !sum.thing) return { ...sum, thing: rng.pick(SHOP).id };
  if (sum.op === 'pest') {
    const thing = sum.thing ?? rng.pick(BIG).id;
    return { ...sum, thing, options: sum.options ?? optionsOf(sum, rng.pick(OPTION_SETS[sum.p])) };
  }
  if (!untold(sum)) return sum;
  const people = twoNames(rng);
  const kind = rng.next() < 0.5 ? 'things' : 'length';
  return { ...sum, story: storyOf(rng.pick(AMOUNTS.filter((c) => c[kind])), people) };
}

// Two ways side by side (opts.also a way other than opts.method: "Another way", js/runner.js compare) only on a problem
// they work differently, so a sale at 50%, where both say "50% off takes away half, and half is left." and the same sum,
// is left out there and still drawn for her one way (the step 3.4 code review, finding 1); and an estimate at 50%, where
// "50% is half of it, so the discount is half of about $1100." and "50% is half of it." are the same step in substance
// (the lead's ruling, step 3.5, R12: two ways side by side never give the same steps); its own memo of what both ways fit,
// since its lists are not problemsOf's; each problem judged as first told (its thing, whole or story in no way's numbers)
const KEPT_APART = new Map();
const halfEstimate = (sum) => sum.op === 'pest' && sum.p === 50;
const sameSteps = (a, b, sum) => wayFits(a, sum) && wayFits(b, sum)
  && (halfEstimate(sum) || JSON.stringify(METHODS[a].steps(sum)) === JSON.stringify(METHODS[b].steps(sum)));
const apartOf = (a, b) => (skillId, key, easy) => problemsOf(skillId, key, easy).map((c) => ({ ...c, sums: c.sums.filter((sum) => !sameSteps(a, b, tellings(sum)[0])) }));

// a problem: drawn as the fractions' are (engine/items/fractions.js drawSum: the key, its class by weight, a problem the
// ways fit), then a rest's whole
function sumFor(skillId, rng, easy, opts) {
  if (opts.sum) return toldOf(opts.sum, rng);
  const ways = BY_ID[skillId].methods, apart = opts.also !== opts.method && ways.includes(opts.method) && ways.includes(opts.also);
  const listed = apart ? { problemsOf: apartOf(opts.method, opts.also), kept: KEPT_APART } : { problemsOf, kept: KEPT };
  return toldOf(drawSum(skillId, rng, easy, opts, { levelKeys: (easy ? EASY : KEYS)[skillId], ...listed }).sum, rng);
}

// the question, its words, its answer and its picture, from the sum alone, so the same sum makes the same problem
// whichever way works it. No question ends on a fraction name, so a fraction's is said "Write 3/4 as a percentage." and
// a fraction asked for "75% is how many quarters of 100%?" (plan P1, "Keys and asks"); "%" is printed after her box, never
// typed (plan "The percentage answer, exactly")
function problem(sum) {
  const { key, p, n, d } = sum;
  if (sum.op === 'pof') return ofProblem(sum);
  if (sum.op === 'poff') return offProblem(sum);
  if (sum.op === 'pest') return estimateProblem(sum);
  if (key === 'shaded') {
    const ask = 'The shaded part is ☐% of the strip.';
    return { ask, say: ask, answer: { kind: 'number', value: p }, picture: { type: 'strips', rows: [{ d, shaded: n }] } };
  }
  if (key === 'rest') {
    // said as a question, its second sentence with a capital, never "what per cent of it …" from the box
    const c = restOf(sum), told = `${p}% of ${c.the} is ${c.been}.`;
    return { ask: `${told} ☐% of it is not ${c.been} yet.`, say: `${told} What per cent of it is not ${c.been} yet?`, answer: { kind: 'number', value: 100 - p } };
  }
  if (key === 'to-percent') {
    const ask = `${sum.dec ?? `${n}/${d}`} = ☐%`;
    return { ask, say: sum.dec ? ask : `Write ${n}/${d} as a percentage.`, answer: { kind: 'number', value: p } };
  }
  if (key === 'from-percent') return { ask: `${p}% = ☐/${d}`, say: `${p}% is how many ${namesOf(d)} of 100%?`, answer: { kind: 'number', value: n } };
  if (key !== 'as-decimal') throw new Error(`no percentage problem of kind ${key}`);
  const ask = `${p}% as a decimal is ☐`;
  return { ask, say: ask, answer: { kind: 'decimal', value: hundredthsText(p) } };
}

// P2's asks (plan P2, "Keys and asks"): "30% of 150 = ☐", said "What is 30% of 150?"; a story of things or metres given
// away, the giver named in its question (F6's own, engine/items/fractions.js ofStoryAsk). The tape on every one, docked
function ofProblem(sum) {
  const { p, of } = sum, answer = { kind: 'number', value: pofValue(sum) }, picture = pofTape(sum);
  if (sum.key === 'story') {
    const ask = ofStoryAsk(sum.story, of, `${p}%`);
    return { ask, say: ask, answer, picture };
  }
  if (!KEYS['pct-of'].includes(sum.key)) throw new Error(`no percentage problem of kind ${sum.key}`);
  return { ask: `${p}% of ${of} = ☐`, say: `What is ${p}% of ${of}?`, answer, picture };
}

// P3's asks (plan P3, "Keys and asks"): "A jacket is $47. It is 25% off. The discount is $☐.", said as shown, the "$☐"
// "what, in dollars" (js/speech.js); the answer money, whole dollars as '30', otherwise two places, '11.75'. No picture
function offProblem(sum) {
  const c = thingOf(sum);
  if (!c || !KEYS['pct-discount'].includes(sum.key)) throw new Error(`no percentage problem of kind ${sum.key}`);
  const ask = `A${c.a.slice(1)} is $${sum.price}. It is ${sum.p}% off. The ${sum.key === 'sale' ? 'sale price' : 'discount'} is $☐.`;
  return { ask, say: ask, answer: { kind: 'decimal', value: poffValue(sum) } };
}
// the estimate's ask (plan P3, "Keys and asks"): "A bike is $1099.99. It is 50% off. About how much is the discount?", said
// as shown, "$1099.99" "1099 dollars 99" (js/speech.js); the answer a choice of its three options, E the right one
function estimateProblem(sum) {
  const c = thingOf(sum);
  if (!c || sum.key !== 'estimate' || !sum.options) throw new Error(`no percentage problem of kind ${sum.key}`);
  const ask = `A${c.a.slice(1)} is $${sum.price}. It is ${sum.p}% off. About how much is the discount?`;
  const value = sum.options.find((o) => thousandths(o.slice(1)) === BigInt(estimateValue(sum)) * 1000n);
  return { ask, say: ask, answer: { kind: 'choice', options: sum.options, value } };
}

// A hint for her actual mistake (plan, "Rules every percentage generator keeps"), each a question, else none (the way's):
// the fixed ones, HINTS (hints, tools/voice-lines.mjs), and the rest built from the problem's numbers, each listed for its
// problem by hintLines(item) so the tools that voice them have every one. A hint about her answer speaks of her
// working, never of "that" or "these": after a first miss her box is emptied, or the option she tapped loses its mark
// (js/runner.js:430-436, js/answer.js:378; step 3.6's triage T1, the lead's ruling, R12)
export const HINTS = {
  // a decimal place slipped: 5% as 0.5, 0.05 as 50% ("Students should know that 0.5 = 1/2 and 0.5 is not 1/5", Examples
  // fa0a18f458 l.104)
  PLACE: 'Per cent means out of 100: did you count tenths or hundredths?',
  // a rest: the part done given for the part left, and the part done added to the whole
  DONE: 'You found the part done. The whole is 100%: how much is left?',
  MORE: 'Is the rest more or less than the whole, 100%?',
  // a per cent of an amount (pct-of): a ten of per cent worked as hundredths (10% of 300 as 3), and the part left given
  // for the part asked (25% of 120 as 90)
  HUNDREDTH: 'Is 10% a tenth or a hundredth of it?',
  REST: 'Did you find the part asked for, or the rest?',
  // a discount (pct-discount): the discount given for the sale price, the sale price for the discount, and the discount
  // added on to the price
  OFF: 'Did you find the amount taken off, or the price after it is taken off?',
  LEFT: 'Did you find the amount taken off, or what is left to pay?',
  BIGGER: 'Does a discount make the price bigger or smaller?',
  // an estimate ten or a hundred times too big or too small (pct-discount's estimate): every wrong option but R − E (LEFT)
  ESTIMATE: 'Round the price first. Is the discount a half, a quarter or a tenth of that?',
};
// pct-of's slips, each a whole number she could type, else null: the amount divided by the per cent's number (25% of 300
// as 300 ÷ 25 = 12, where whole); a ten of per cent as hundredths (10% of 300 as 3, 30% of 300 as 9), the answer a tenth
// of itself; the rest (25% of 120 as 90)
function ofSlips(sum, value) {
  const { p, of } = sum;
  return { by: of % p ? null : of / p, hundredth: p % 10 === 0 && p !== 50 && value % 10 === 0 ? value / 10 : null, rest: of - value };
}

// a fraction's digits read as the per cent: 3/4 as 34, looked for only where the digits make a per cent of 1 to 99 (1/2,
// 1/4, 3/4), never tenths' 710, a slip she would hardly make (the step's review, finding 6; no other hint, R12)
const digitsOf = ({ n, d }) => Number(`${n}${d}`);
const digitsSlip = (sum) => sum.key === 'to-percent' && !sum.dec && digitsOf(sum) <= 99;
// the answer with its point slipped one place either way, in thousandths: 0.05 as 0.5 or 0.005, 5% from 0.05 as 50% (a
// whole per cent only)
function placeSlips({ sum, answer }) {
  if (sum.key === 'as-decimal') {
    const a = thousandths(answer.value);
    return [a * 10n, ...(a % 10n === 0n ? [a / 10n] : [])];
  }
  if (sum.key === 'to-percent' && sum.dec) return [BigInt(sum.p) * 10000n, ...(sum.p % 10 === 0 ? [BigInt(sum.p) * 100n] : [])];
  return [];
}
// pct-discount's slips, each as money: on a sale price, the discount itself and the price with it added on; on a
// discount, the sale price (at 50% the discount and the sale price are the same amount, the answer, so neither is a slip)
function offSlips(sum) {
  const price = BigInt(sum.price) * 100n, off = discountCents(sum);
  return sum.key === 'sale' ? { off: dollars(off), bigger: dollars(price + off) } : { left: dollars(price - off) };
}
// the kinds of sum a hint is given for: pct-benchmarks', pct-of's, and pct-discount's discount, sale price and estimate
// (the step 3.4 code review, finding 4: the estimate's was left out)
const HINTED = ['pct', 'pof', 'poff', 'pest'];
function hintFor(item, given) {
  const { sum } = item;
  if (!HINTED.includes(sum?.op)) return null;
  const g = Array.isArray(given) ? given[0] : given;
  // an estimate's wrong option: R − E, the sale price given for the discount, the discount's question; any other, ten or a
  // hundred times too big or too small, each the same question
  if (sum.op === 'pest') {
    if (!item.answer.options.includes(String(g)) || String(g) === item.answer.value) return null;
    if (String(g) === moneyOf(BigInt(sum.round) * 100n - BigInt(estimateValue(sum)) * 100n)) return HINTS.LEFT;
    return HINTS.ESTIMATE;
  }
  const th = g == null ? null : thousandths(String(g));
  if (sum.op === 'poff') {
    const slips = offSlips(sum), is = (x) => th !== null && x !== undefined && th !== thousandths(item.answer.value) && th === thousandths(x);
    if (is(slips.off)) return HINTS.OFF;
    if (is(slips.left)) return HINTS.LEFT;
    if (is(slips.bigger)) return HINTS.BIGGER;
    return null;
  }
  if (sum.op === 'pof') {
    const slips = ofSlips(sum, item.answer.value), is = (x) => th !== null && x !== null && x !== item.answer.value && th === BigInt(x) * 1000n;
    if (is(slips.by)) return `Is ${sum.p}% the same as dividing by ${sum.p}? What fraction of the whole is ${sum.p}%?`;
    if (is(slips.hundredth)) return HINTS.HUNDREDTH;
    if (is(slips.rest)) return HINTS.REST;
    return null;
  }
  if (digitsSlip(sum) && th === BigInt(digitsOf(sum)) * 1000n) {
    return `Is ${sum.n}/${sum.d} the same as ${digitsOf(sum)} out of 100? How many per cent is each ${FRACTION_NAMES[sum.d][0]} of the whole?`;
  }
  if (th !== null && placeSlips(item).includes(th)) return HINTS.PLACE;
  if (sum.key === 'rest' && th === BigInt(sum.p) * 1000n) return HINTS.DONE;
  if (sum.key === 'rest' && th === BigInt(100 + sum.p) * 1000n) return HINTS.MORE;
  return null;
}

// every hint text hintFor gives for a problem, each misconception's mistake worked out from the problem, for the tools
// that list the lines to voice
export function hintLines(item) {
  const { sum } = item;
  if (sum?.op === 'pof') return [...new Set(Object.values(ofSlips(sum, item.answer.value)).filter((x) => x !== null).map((x) => hintFor(item, String(x))).filter(Boolean))];
  if (sum?.op === 'poff') return [...new Set(Object.values(offSlips(sum)).map((x) => hintFor(item, x)).filter(Boolean))];
  if (sum?.op === 'pest') return [...new Set(item.answer.options.map((o) => hintFor(item, o)).filter(Boolean))];
  if (sum?.op !== 'pct') return [];
  const givens = placeSlips(item).map((th) => decimalText(Number(th)));
  if (digitsSlip(sum)) givens.push(String(digitsOf(sum)));
  if (sum.key === 'rest') givens.push(String(sum.p), String(100 + sum.p));
  return [...new Set(givens.map((g) => hintFor(item, g)).filter(Boolean))];
}

export default {
  skills: ['pct-benchmarks', 'pct-of', 'pct-discount'],
  // opts.key makes that kind, opts.sum that very problem, opts.method works it that way where it fits (else the first
  // way that does, saying why first: wayFor), opts.also draws only a problem that way fits too, opts.op only a kind of
  // that sum, opts.easy the easy level
  make(skillId, rng, opts = {}) {
    const sum = sumFor(skillId, rng, Boolean(opts.easy), opts);
    const { method, steps } = wayFor(skillId, sum, opts.method);
    const way = METHODS[method];
    const { picture, ...question } = problem(sum);
    // a story's first step is the word problems' (engine/items/fractions.js READ), then the way's, as F6's
    const all = sum.op === 'pof' && sum.key === 'story' ? [{ text: READ }, ...steps] : steps;
    return { skill: skillId, key: sum.key, sum, method, ...question, steps: all, picture: picture ?? way.picture(sum), hint: way.hint(sum), words: way.words(sum) };
  },
  hintFor,
  hints: Object.values(HINTS),
  // every problem of a kind, every way it is told, and every hint for a mistake, for the voice tools
  // (tools/voice-lines.mjs every, linesFor), which list a generator's problems whole wherever its default export has
  // problemsOf
  problemsOf,
  tellings,
  hintLines,
};
