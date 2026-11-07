// The percentage ways (stage 6 strand 3, plans/2026-10-25-stage-6-plan.md "The ways"), each its own steps, picture,
// hint and words, kept apart from engine/methods.js, which takes them all into METHODS, as engine/fraction-ways.js is.
// A percentage sum is { op: 'pct', key, p, n?, d?, dec?, noun? } (pct-benchmarks: p the whole per cent, n/d the fraction
// where there is one, dec the decimal text of a per cent asked from a decimal, noun the whole of a rest) or { op: 'pof',
// key, p, of, story? } (pct-of: p% of the amount of, a story's context, names and unit) or { op: 'poff', key, p, price,
// thing } (pct-discount's discount and sale price: p% off a price in whole dollars, the thing in the shop) or { op: 'pest',
// key: 'estimate', p, price, round, thing, options } (its estimate: p% off a price in cents as text, round the price to the
// nearest whole dollar, the options the three amounts she chooses from, engine/items/index.js). None of these ops is a
// whole-number one (engine/methods.js WHOLE_OPS), so no whole-number way takes them, and every way here names its own.
//
// Out of 100: "Recognise that the symbol % means percent and 100% is the whole amount" and "Represent common percentages
// of quantities and lengths as fractions and decimals" (Stage 3 Represents numbers B, saved copy 2026-10-10-1116-article-
// k-10-mathematics-k-10-syllabus-2022-fa0a18f458.md l.54, l.56), "25% means 25 out of 100 or 25/100 or 0.25" (its
// Example, Examples fa0a18f458 l.51), "'Per centum', the Latin origin of per cent means 'by the hundred'" (l.110). On a
// number line: "Recall commonly used equivalent percentages, decimals and fractions including 1/2, 1/4, and 3/4" (l.55),
// one-tenth among the benchmarks (Examples fa0a18f458 l.98-100), fractions over the line and percentages and decimals
// under it, "locate 3/4, 0.75, and 75% on it" (IES 2010 l.678). NSW Mathematics K–10 Syllabus (2022), 16 June 2026
// amendments, checked 28 October 2026. The line works only what is on its marks, the tenths, quarters and the half, and
// says why where it cannot (wayFor), naming the number as the question shows it, never the answer; it never works a rest
// (on a line of tenths the answer's own percentage would be drawn) nor a fraction whose numerator is 1, the line's
// whole-number label (plan P1, "Ways").
//
// Use the fraction, find 10% first, and half, then half again (pct-of): "Recognise that 10% is one-tenth of 100% and use
// this to find 10% of a quantity" and "Equate 10% to dividing by 10, 25% to finding a quarter by dividing by 4, and 50% to
// finding half" (S3 RN B, saved copy …fa0a18f458.md l.57, l.61), with 75% as 3 quarters (l.55); "10% of 150 is 15, so 20%
// of 150 is 2 lots of 15, 30% is 3 lots of 15 and so on" and the tape cut into 10 equal parts (teaching advice, Examples
// fa0a18f458 l.88-94); "Find a discount of 25% of $120 by finding half (50%) and half again" (l.71). NSW Mathematics K–10
// Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026. The tape is the fractions' (engine/fraction-ways.js
// tapeOf, F6's), its parts by the per cent's fraction; each way says where it stops and names the way that works it
// (wayFor), and halving is named "Find half" on 50%, never by the word the voice says "have" (plan P2, "Ways").
//
// The same two of them for a discount and a sale price (pct-discount): "Determine percentage discounts of 10%, 25% and
// 50%" and "Calculate the sale price of an item after a discount of 10%, 25% and 50%" (S3 RN B, saved copy
// …fa0a18f458.md l.59, l.63), each by l.61's fractions or by "finding half (50%) and half again" (l.71's Example). NSW
// Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026. Money is whole cents, exactly
// (engine/percents.js), written as the game writes it, "4.70", "23.50", whole dollars with no point; every sum in a step
// has no "$", the dollars named in words before it, and a decimal is halved as "23.50 ÷ 2", never "half of" (plan
// "Rules every percentage generator keeps"); finding the discount and taking it off are two steps, and a sale at 50%,
// whose discount is the sale price itself, puts no discount in a box (plan P3, "Ways", "Attention"). No picture: a tenth
// of a price in cents does not fit a tape part (plan "The percentage pictures").
//
// And the estimate: "Use mental strategies to estimate discounts of 10%, 25% and 50%" (S3 RN B, saved copy
// …fa0a18f458.md l.62), its Example "Such as 50% off the price of $1099.99: 50% is the same as 1/2, so the discount is
// about $500." (Examples fa0a18f458 l.67). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28
// October 2026. Chosen for this game, not a syllabus requirement: the price rounded to the nearest whole dollar first, then
// its part worked exactly, so exactly one of three amounts is right, and the estimate asked as that choice (plan "What is
// outside NESA"). Its steps have no box: the price rounded, the part it takes, and the last step, the amount, which "Show
// me one step" leaves out as it leaves out every choice's last step (js/runner.js askOnly; plan P3, "Ways").

import { percentFraction, hundredthsText, percentOfCents, dollars } from './percents.js';
import { namesOf, FRACTION_NAMES } from './fractions.js';
import { tapeOf, ofValue, carried, so, keptOf } from './fraction-ways.js';

// a per cent on the line's marks: a whole number of tens, a quarter or the half
const onMarks = (p) => percentFraction(p) !== null;
// the per cent or decimal a question asks from, as it shows it: '3/4', '0.75'
const asked = (sum) => sum.dec ?? `${sum.n}/${sum.d}`;
const fromDecimal = (sum) => sum.dec !== undefined;

// ---- the answer step, the same whichever way, in the question's order: "So 3/4 = ☐%" for "3/4 = ☐%", "So 75% = ☐/4"
// for "75% = ☐/4", "So 75% = ☐" for "75% as a decimal is ☐" (plan, "Rules every percentage generator keeps"); after a
// way's own word, "3 parts: so …" ----

export function percentAnswer(sum, lead = null) {
  const { key, p } = sum;
  if (key === 'shaded') return { text: lead ? `${lead}: so the shaded part is ☐% of the strip.` : 'So the shaded part is ☐% of the strip.', value: p, answer: true };
  if (key === 'rest') return { text: `So 100% − ${p}% = ☐%`, value: 100 - p, answer: true };
  if (key === 'to-percent') return { text: `So ${asked(sum)} = ☐%`, value: p, answer: true };
  if (key === 'from-percent') return { text: `So ${p}% = ☐/${sum.d}`, value: sum.n, answer: true };
  if (key !== 'as-decimal') throw new Error(`no percentage problem of kind ${key}`);
  return { text: `So ${p}% = ☐`, value: hundredthsText(p), answer: true };
}

// ---- Out of 100 (pct-benchmarks): per cent means out of 100, the whole is 100%; cut 100% into the parts, or read
// hundredths ----

// The strip filled in, each part its per cent, goes on the step that finds one part, not marked working, so where that
// step is hers it shows boxes as her question does (js/runner.js ownPicture, asked); the answer step after it carries it
// marked working, so the parts she has found stay filled in, as F6's tape does (engine/fraction-ways.js found, carried).
// A tenth's part, 32.4 px, is too narrow for "10%" even at 16 px, so a strip of tenths is marked 100% over the whole
// strip instead (strips' total), as the step says (the second replay's looker, round 2)
const filled = (d, n) => (d === 10 ? { type: 'strips', rows: [{ d, shaded: n }], total: '100%' } : { type: 'strips', rows: [{ d, shaded: n, value: `${100 / d}%` }] });
function hundredSteps(sum) {
  const { key, p, n, d } = sum;
  if (key === 'shaded') {
    if (n === 1) return [{ text: `The whole strip is 100%, cut into ${d} equal parts.` }, percentAnswer(sum)];
    const part = { text: `The whole strip is 100%: 100% ÷ ${d} = ☐% in each part`, value: 100 / d, picture: filled(d, n) };
    return [part, { ...percentAnswer(sum, `${n} parts`), picture: { ...part.picture, working: true } }];
  }
  if (key === 'rest') return [{ text: `The whole ${sum.noun} is 100%.` }, percentAnswer(sum)];
  if (key === 'to-percent' && fromDecimal(sum)) return [{ text: `Per cent means hundredths: write ${sum.dec} in hundredths.` }, percentAnswer(sum)];
  if (key === 'to-percent' && n === 1) return [{ text: `Cut 100% into ${d} equal parts.` }, percentAnswer(sum)];
  if (key === 'to-percent' || key === 'from-percent') return [{ text: `100% ÷ ${d} = ☐% in each part`, value: 100 / d }, percentAnswer(sum)];
  if (key !== 'as-decimal') throw new Error(`no percentage problem of kind ${key}`);
  return [{ text: 'Per cent means out of 100, and hundredths are the second place after the point.' }, percentAnswer(sum)];
}

// its hint asks about the parts, but where it reads hundredths (as-decimal, to-percent from a decimal) no parts are drawn,
// so there it asks about the hundredths (the looker's F4 on the step 3.2 replay)
const readsHundredths = (sum) => sum?.key === 'as-decimal' || (sum?.key === 'to-percent' && fromDecimal(sum));

const pctHundred = {
  op: 'pct', title: 'Out of 100',
  fits: (sum) => sum?.op === 'pct',
  steps: hundredSteps,
  picture: () => null,
  hint: (sum) => (readsHundredths(sum) ? 'Per cent means out of 100. How many hundredths is it?' : 'Per cent means out of 100. How many per cent is each part?'),
  words: () => ['per cent', 'percentage', 'benchmark'],
};

// ---- On a number line (pct-benchmarks): fractions over the line, percentages (and decimals) under it, one point and
// its names (IES 2010 l.678); every line marked working, so it shows only in the worked steps ----

// the point a question asks about, in the line's parts: the fraction it shows or asks for, else its per cent's
function pointOf(sum) {
  if (sum.d && !fromDecimal(sum)) return { n: sum.n, d: sum.d };
  return percentFraction(sum.p);
}
const lineOf = (d, more) => ({ type: 'fracline', wholes: 1, d, below: d, pct: true, ...more, working: true });
// the kinds of problem it works, each its own first step; any other is no percentage problem it knows (review 5)
const LINE_KEYS = ['shaded', 'to-percent', 'from-percent', 'as-decimal'];
function lineSteps(sum) {
  if (!LINE_KEYS.includes(sum.key)) throw new Error(`no percentage problem of kind ${sum.key}`);
  const { key, p } = sum, { n, d } = pointOf(sum);
  let first;
  if (key === 'shaded' || (key === 'to-percent' && !fromDecimal(sum))) {
    first = { text: 'Fractions over the line, percentages under it, at the same points.', picture: lineOf(d, { labels: 'all', point: { n, d, label: '', below: '?' } }) };
  } else if (key === 'to-percent') {
    first = { text: 'Percentages and decimals under the line, at the same points.', picture: lineOf(d, { labels: 'wholes', dec: true, point: { n, d, label: '', below: '?' } }) };
  } else if (key === 'from-percent') {
    first = { text: `Find ${p}% under the line, and count the parts over it from 0.`, picture: lineOf(d, { labels: 'wholes', point: { n, d, label: '' } }) };
  } else {
    first = { text: 'Percentages and decimals under the line, at the same points.', picture: lineOf(d, { labels: 'wholes', dec: true, point: { n, d, label: '', dec: '?' } }) };
  }
  // the answer step carries the same line, so the line she reads from stays in a worked example, as out of 100's
  // answer step carries its filled strip (the second replay's looker, round 2); the line is already marked working by
  // lineOf, so it stays off the question
  return [first, { ...percentAnswer(sum), picture: first.picture }];
}

// why the line cannot work a sum, or null: a rest, and a from-percent whose answer is 1, would have the answer drawn on
// it (70% under a line of tenths with its point at 30%; the whole-number label 1, engine/render/svg.js fracline); a
// decimal or per cent off its marks, named as the question shows it
function lineStops(sum) {
  if (sum?.op !== 'pct') return null;
  if (sum.key === 'rest' || (sum.key === 'from-percent' && sum.n === 1)) return 'it would give the answer away';
  if (sum.key === 'to-percent' && fromDecimal(sum) && !onMarks(sum.p)) return `${sum.dec} is between the line's marks`;
  if (sum.key === 'as-decimal' && !onMarks(sum.p)) return `${sum.p}% is between the line's marks`;
  return null;
}

const pctLine = {
  // its title read as a place, so where it stops it is named as a thing, as the fractions' line is (engine/fraction-ways.js)
  op: 'pct', title: 'On a number line', refusedAs: 'A number line',
  fits: (sum) => sum?.op === 'pct' && !lineStops(sum),
  stops: lineStops,
  steps: lineSteps,
  picture: () => null,
  hint: () => 'Find the point on the line. What is written under it, or what would be?',
  words: () => ['per cent', 'percentage', 'benchmark', 'number line'],
};

// ---- pct-of's three ways: a per cent of an amount, { op: 'pof', key, p, of, story? } ----

// the kinds of problem the ways work (plan P2, "Keys and asks"); any other is no percentage problem they know (review 5)
const POF_KEYS = ['tenth', 'half', 'quarter', 'tens', 'three-quarters', 'story'];
// the per cent as a fraction of the amount, the tape's parts: 10% and the tens in tenths, 25% and 75% in quarters, 50% in
// halves (engine/percents.js percentFraction)
const partsOf = (sum) => percentFraction(sum.p);
// the answer, p% of the amount, a whole number in every problem the generator makes (engine/fraction-ways.js ofValue)
export const pofValue = (sum) => ofValue({ ...partsOf(sum), of: sum.of });
// The tape (plan, "The percentage pictures"): F6's, one row of the per cent's parts, the amount over it, the parts asked
// shaded, a unit part too (the plan's `shaded: n`, where F6 shades only more than one), each part's value a box on the
// question; filled in (value) by the step that finds one part; in other parts ({ n, d }) for finding 10% first
export function pofTape(sum, value = '?', parts = partsOf(sum)) {
  const tape = tapeOf({ op: 'fof', ...parts, of: sum.of }, value);
  return { ...tape, rows: [{ ...tape.rows[0], shaded: parts.n }] };
}
// The tape filled in goes on the step that finds one part, not marked working, so where that step is hers it shows
// boxes, as her question does; marked working where it is not the question's tape (finding 10% first of 50%, a tape of
// 10 parts under a question's of 2), so it shows only in the worked steps; the answer step after it carries it marked
// working (engine/fraction-ways.js found, and its carried, imported). A tape whose part is the answer (10%, 25%, 50%)
// fills in nowhere
function found(sum, step, parts) {
  const picture = pofTape(sum, step.value, parts);
  return { ...step, picture: parts && parts.d !== partsOf(sum).d ? { ...picture, working: true } : picture };
}

// the answer step in the question's order, "So 25% of 120 = ☐", after a way's own word ("3 of those: so …", F6's so); a
// story's in its unit, "So the answer is ☐ stickers." (F6's, engine/fraction-ways.js ofClaim); halving a half says what
// it halves, "So 50% of 64 = half of 64 = ☐" (plan P2, "Ways"). Every way's steps go through F6's keptOf, so a number
// sentence never breaks (I7: no-break spaces beside "=", "÷" and "×", and in a count such as "3 quarters")
function pofAnswer(sum, lead = null, halved = false) {
  if (!POF_KEYS.includes(sum.key)) throw new Error(`no percentage problem of kind ${sum.key}`);
  const claim = sum.key === 'story' ? `the answer is ☐ ${sum.story.unit}.` : `${sum.p}% of ${sum.of} = ${halved ? `half of ${sum.of} = ` : ''}☐`;
  return { text: so(lead, claim), value: pofValue(sum), answer: true };
}

// ---- pct-discount's sums, { op: 'poff', key, p, price, thing }: the discount, p% of the price, and the sale price, the
// price less it, each in cents and as money ----

// the kinds of problem the ways work and their per cents, a discount's, a sale price's and an estimate's alike (plan P3,
// "Keys and asks", "Sizes"), the generator's too (engine/items/percentages.js imports them); any other is no percentage
// problem they know
const POFF_KEYS = ['discount', 'sale'];
export const POFF_PS = [10, 25, 50];
const priceCents = (sum) => BigInt(sum.price) * 100n;
// the discount in whole cents, exactly: a price in whole dollars has a tenth, a quarter and a half to the cent
export const discountCents = (sum) => percentOfCents(sum.p, priceCents(sum));
// the answer as money: the discount, or the sale price, the price less the discount ('11.75', '35.25', '24')
export const poffValue = (sum) => dollars(sum.key === 'sale' ? priceCents(sum) - discountCents(sum) : discountCents(sum));
// the answer step in the question's order, "So the discount in dollars is 47 ÷ 4 = ☐", after a way's own word ("Take it
// off: so …"): the sum it works, written with no "$", the dollars named in words before it
function poffAnswer(sum, lead, worked) {
  if (!POFF_KEYS.includes(sum.key)) throw new Error(`no percentage problem of kind ${sum.key}`);
  if (!POFF_PS.includes(sum.p)) throw new Error(`no discount of ${sum.p}%`);
  return { text: so(lead, `the ${sum.key === 'sale' ? 'sale price' : 'discount'} in dollars is ${worked} = ☐`), value: poffValue(sum), answer: true };
}
// a sale at 50%: half is taken off and half is left, so the discount, the same amount, is never boxed (plan P3, "Ways")
const halfLeft = (sum) => [{ text: '50% off takes away half, and half is left.' }, poffAnswer(sum, null, `${sum.price} ÷ 2`)];

// ---- pct-discount's estimate, { op: 'pest', key: 'estimate', p, price, round, thing, options }: the price rounded to
// the nearest whole dollar, then its part; E, p% of the round price, a whole number of dollars ----

// E, the estimate, in whole dollars: p% of R, a multiple of 10 in every problem the generator makes (plan P3, "Sizes")
export const estimateValue = (sum) => (sum.p * sum.round) / 100;
// every step a text with no box (an estimate step is said and shown but never filled, R11): the price rounded first, then
// the way's own word on its part, then the last, the amount, as a choice's last step is written (plan P3, "Ways")
function estimateSteps(sum, part) {
  if (sum.key !== 'estimate') throw new Error(`no percentage problem of kind ${sum.key}`);
  if (!POFF_PS.includes(sum.p)) throw new Error(`no discount of ${sum.p}%`);
  return [{ text: `Round the price: $${sum.price} is about $${sum.round}.` }, { text: part }, { text: `So the discount is about $${estimateValue(sum)}.` }];
}

// ---- Use the fraction (pct-of and pct-discount): 10% is a tenth, 25% a quarter, 50% half, 75% 3 quarters; cut the amount
// into the parts, and for 3 quarters find one part first; for a sale price find the discount, then take it off ----

// the glossary's words for a discount besides, on each of pct-discount's sums, its estimate's too (plan "The ways":
// "plus `discount` and `sale price` in `pct-discount`"; the step 3.4 code review, finding 4)
const discountWords = (sum) => (sum?.op === 'poff' || sum?.op === 'pest' ? ['discount', 'sale price'] : []);
// a unit fraction's name with its article, as said: "a tenth", "a quarter", "half"
const AS_PART = { 10: 'a tenth', 4: 'a quarter', 2: 'half' };
const FRACTION_PS = [10, 25, 50, 75];
function fractionSteps(sum) {
  const { p, of } = sum, { n, d } = partsOf(sum);
  if (n === 1) return [{ text: `${p}% is ${AS_PART[d]} of it: cut ${of} into ${d} equal parts.` }, pofAnswer(sum)];
  const part = found(sum, { text: `${p}% is ${n} ${namesOf(d)} of it: one ${FRACTION_NAMES[d][0]} of ${of} is ${of} ÷ ${d} = ☐`, value: of / d });
  return [part, { ...pofAnswer(sum, `${n} of those`), ...carried(part) }];
}
// a discount by its fraction of the price, "Find a quarter of the price: cut $47 into 4 equal parts."; a sale price the
// discount first, "… the discount in dollars is 47 ÷ 4 = ☐", then "Take it off: …"
function priceFractionSteps(sum) {
  const { key, p, price } = sum, { d } = partsOf(sum), find = `Find ${AS_PART[d]} of the price`;
  if (key === 'discount') return [{ text: `${find}: cut $${price} into ${d} equal parts.` }, poffAnswer(sum, null, `${price} ÷ ${d}`)];
  if (p === 50) return halfLeft(sum);
  const off = dollars(discountCents(sum));
  return [{ text: `${find}: the discount in dollars is ${price} ÷ ${d} = ☐`, value: off }, poffAnswer(sum, 'Take it off', `${price} − ${off}`)];
}
// an estimate by its fraction of the round price, "50% is half of it, so the discount is half of about $1100."
function estimateFractionSteps(sum) {
  const part = AS_PART[partsOf(sum).d];
  return estimateSteps(sum, `${sum.p}% is ${part} of it, so the discount is ${part} of about $${sum.round}.`);
}
const FRACTION_STEPS = { pof: fractionSteps, poff: priceFractionSteps, pest: estimateFractionSteps };

const pctFraction = {
  op: 'pof', title: 'Use the fraction', refusedAs: 'A fraction',
  fits: (sum) => Boolean(FRACTION_STEPS[sum?.op]) && FRACTION_PS.includes(sum.p),
  // on a ten it says what is true and leads to the way offered, "30% is 3 lots of 10%" (the log's Plan errors found,
  // step 3.3: "not one tenth, a half or quarters" under a tape of tenths read as a contradiction)
  stops: (sum) => (sum?.op === 'pof' && !FRACTION_PS.includes(sum.p) ? `${sum.p}% is ${sum.p / 10} lots of 10%` : null),
  steps: (sum) => keptOf(FRACTION_STEPS[sum.op](sum)),
  picture: () => null,
  hint: () => 'What fraction of the whole is it? How many equal parts is that?',
  words: (sum) => ['per cent', 'fraction', ...discountWords(sum)],
};

// ---- Find 10% first (pct-of): 10% by dividing by 10, then that many lots of it; only a ten of an amount that is a
// multiple of 10, so 10% is whole (never a decimal times a digit, plan line 325) ----

const TENTHS = { d: 10 };
function tensSteps(sum) {
  const { p, of } = sum;
  if (p === 10) return [{ text: `Find 10% first: cut ${of} into 10 equal parts.` }, pofAnswer(sum)];
  const lots = p / 10, part = found(sum, { text: `Find 10% first: ${of} ÷ 10 = ☐`, value: of / 10 }, { ...TENTHS, n: lots });
  return [part, { ...pofAnswer(sum, `${p}% is ${lots} lots of 10%`), ...carried(part) }];
}
// why it cannot: a per cent that is not a ten, or an amount whose tenth is not whole, named as the question shows it
function tensStop(sum) {
  if (sum?.op !== 'pof') return null;
  if (sum.p % 10) return `${sum.p}% is not tens of per cent`;
  return sum.of % 10 ? `${sum.of} ÷ 10 is not a whole number` : null;
}

const pctTens = {
  // its title an instruction, so where it stops it is named as a doing, "Finding 10% first won't work here" (the lead's
  // ruling, pt66, R12: the plan gives it no other name, and names the other two as a thing or a doing where they stop)
  op: 'pof', title: 'Find 10% first', refusedAs: 'Finding 10% first',
  fits: (sum) => sum?.op === 'pof' && !tensStop(sum),
  stops: tensStop,
  steps: (sum) => keptOf(tensSteps(sum)),
  picture: () => null,
  hint: () => 'What is 10% of it? How many lots of 10% do you need?',
  words: () => ['per cent', 'fraction'],
};

// ---- Half, then half again (pct-of and pct-discount): half for 50%, half again for 25%, both for 75%; named "Halving"
// where it stops and "Find half" on 50%, never by the word the voice says "have" (log line 485), on a per cent of an
// amount, on a discount and on an estimate alike (the step 3.3 code review, finding 2; the step 3.4 code review, finding
// 4) ----

const HALVE_PS = [25, 50, 75];
function halveSteps(sum) {
  const { p, of } = sum;
  // a half has no working step (plan P2)
  if (p === 50) return [pofAnswer(sum, '50% is half of it', true)];
  const half = { text: `50% is half of it: half of ${of} = ☐`, value: of / 2 };
  if (p === 25) return [half, pofAnswer(sum, '25% is half again')];
  const part = found(sum, { text: `25% is half again: half of ${of / 2} = ☐`, value: of / 4 });
  return [half, part, { ...pofAnswer(sum, '50% and 25% make 75%'), ...carried(part) }];
}
// a discount of 50% in one step, "50% is half of it: so the discount in dollars is 47 ÷ 2 = ☐"; of 25%, half, then half
// again, "23.50 ÷ 2"; a sale price at 25% both, then "Take it off: …"; a sale at 50% as the fraction's (plan P3, "Ways")
function priceHalveSteps(sum) {
  const { key, p, price } = sum;
  if (key === 'sale' && p === 50) return halfLeft(sum);
  if (p === 50) return [poffAnswer(sum, '50% is half of it', `${price} ÷ 2`)];
  const half = dollars(priceCents(sum) / 2n), first = { text: `50% is half of it: ${price} ÷ 2 = ☐`, value: half };
  if (key === 'discount') return [first, poffAnswer(sum, '25% is half again', `${half} ÷ 2`)];
  const off = dollars(discountCents(sum));
  return [first, { text: `25% is half again: ${half} ÷ 2 = ☐`, value: off }, poffAnswer(sum, 'Take it off', `${price} − ${off}`)];
}
// an estimate at 50%, "50% is half of it." (plan P3, "Ways"); at 25%, the half shown so she never keeps it in her head
// (P3, "Attention"; the looker's point 1 and the lead's ruling, R12, step 3.5 round 6), "50% is half of it: about $600. 25%
// is half again.", R ÷ 2 in whole dollars (R a multiple of 40), 2E, never an option
const estimateHalveSteps = (sum) => estimateSteps(sum, sum.p === 50 ? '50% is half of it.' : `50% is half of it: about $${sum.round / 2}. ${sum.p}% is half again.`);
const HALVE_STEPS = { pof: halveSteps, poff: priceHalveSteps, pest: estimateHalveSteps };
const HALVE_OPS = Object.keys(HALVE_STEPS);

const pctHalve = {
  op: 'pof', title: 'Half, then half again', refusedAs: 'Halving', namedAs: (sum) => (HALVE_OPS.includes(sum?.op) && sum.p === 50 ? 'Find half' : null),
  fits: (sum) => HALVE_OPS.includes(sum?.op) && HALVE_PS.includes(sum.p),
  stops: (sum) => (HALVE_OPS.includes(sum?.op) && !HALVE_PS.includes(sum.p) ? `${sum.p}% is not a half or a quarter` : null),
  steps: (sum) => keptOf(HALVE_STEPS[sum.op](sum)),
  picture: () => null,
  hint: () => 'What is half of it? Do you need half again?',
  words: (sum) => ['per cent', 'fraction', ...discountWords(sum)],
};

export const PERCENT_WAYS = { 'pct-hundred': pctHundred, 'pct-line': pctLine, 'pct-fraction': pctFraction, 'pct-tens': pctTens, 'pct-halve': pctHalve };
