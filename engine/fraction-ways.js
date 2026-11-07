// The fraction ways (stage 6 strand 2, plans/2026-10-25-stage-6-plan.md "The ways"), each its own steps, picture, hint
// and words, kept apart from engine/methods.js, which takes them all into METHODS. A fraction sum is { op: 'fpart', key,
// n, d } (frac-parts), { op: 'fcmp', key, a, b }, { op: 'ford', key, values } or { op: 'floc', key, at, letters, wholes,
// d } (frac-unit-compare, and frac-equivalent's compare and order), { op: 'f+', key, a, b, form } or { op: 'f−', key, a,
// b, form } (frac-addsub-same, a whole number a for from-whole; and frac-addsub-related, the denominators related, more
// on sub asked "How much more …?"), { op: 'fequ', key, a, d2 } (frac-equivalent), and { op: 'fof', key, n, d, of },
// { op: 'fwhole', key, n, d, part } or { op: 'fdiv', key, a, b } (frac-of), every fraction as text 'n/d'
// (engine/items/index.js). None of these ops is a whole-number one
// (engine/methods.js WHOLE_OPS), so no whole-number way takes them, and every way here names its own.
//
// Fraction strips: "Model fractions with fraction strips and diagrams for halves, quarters, eighths, thirds" (S2 PF A,
// saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fab1a01bf6.md l.44). On a number line: "Compare
// and order unit fractions with denominators of 2, 3, 4, 5, 6, 8 and 10 by placing them on a number line" (S3 RQF A,
// 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fac8227f10.md l.50), each on its own line, lined up at 0
// and 1 (IES 2010 l.654-660). More parts, smaller parts: "Compare halves and quarters of different sized wholes" and
// "Justify the need for fractions to refer to the number 1 as the common whole" (l.44-45); "as the number of people
// sharing the objects increases, the size of each person's share decreases" (IES 2010 l.509, l.816). Compare with a
// half: "Compare unit fractions as numbers to the benchmark value 1/2" (l.49; IES 2010 l.814). NSW Mathematics K–10
// Syllabus (2022), 16 June 2026 amendments, checked 26 October 2026. The letters A, B and C are chosen for this game, not
// a syllabus requirement. Strips and the line work every problem of fractions of a whole; the line works no comparing of
// two wholes of different sizes, the half only where it decides, and each says why where it cannot (wayFor).
//
// Count the parts: "Represent the sum of fractions with the same denominator, recreating the whole, where the result may
// exceed one", "Find the difference between fractions with the same denominator and interpret the answer" and "Use
// diagrams, objects and mental strategies to subtract a unit fraction from any whole number including 1" (S3 RQF A,
// l.54-57), the denominator naming the size of the parts, counted as things are (IES 2010 l.469, l.830). Cut the parts
// again: "Create equivalent fractions for half in quarters, eighths, sixths and tenths by re-dividing the whole, using
// diagrams and number lines" and "Order common fractions with related denominators using diagrams and number lines" (S3
// RQF B, saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fa1618803c.md l.48-52; IES 2010 l.834),
// the area model and the dots its "Subdivide the area of a rectangle" and "a collection of objects" (l.49-50). The line
// labelled above and below shows one point with two names (IES 2010 l.652, l.696); strips of equal wholes line up (S2 PF
// B l.39-41). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 26 October 2026. A fraction name is
// never said straight before "from", "to", "at", "along" or "is", and none before "plus what halves" (plan fact 3, the
// voice's pieces); the answers with a box past a whole number keep the ask's order, "So 3 − 1/4 = 2 + ☐/4", and one that
// ends "+ ☐/2" is voiced whole (tools/voice-lines.mjs WHOLE_WORDS; the lead, pt56); how much more keeps the plan's own
// words, "So 5/8 is ☐/8 more than 2/8." (the lead, round 2). Nor does a
// question end on a fraction name ("… make 2 sixths?"), nor a name come straight before a colon ("Rename in tenths:"),
// each heard wrong on every take (step 2.3, the pt54 pieces run).
//
// A tape diagram, divide then multiply, and cut in half, then again (frac-of): "Calculate quarters and fifths of whole
// numbers that are multiples of the denominator, using a tape diagram", "Solve word problems involving a fraction of a
// quantity" and "Find 1/2, 1/4, 1/5 and 1/10 of collections, expressing remainders as decimals" (S3 RQF B, saved copy
// 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fa1618803c.md l.65-67); "Generate the whole quantity from
// non-unit fractional parts" (l.56), the tape worked backwards; "Identify how the relationship between the number being
// divided and the divisor is represented in a fraction" (l.44) and MA3-MR-02's "Recognise that division can be recorded
// using fractions" (plans/2026-10-25-nesa-audit.md l.71), a share found by sharing (IES 2010 l.469); halving the
// "repeated halving" of S2 PF A l.37. NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 26 October
// 2026. A fraction name before "of" ("So 3/4 of 24 = ☐", "☐/4 of a finger") is the plan's own wording (fact 3 watched).

import { LETTERS, letterAt, namesOf, signOf, fracOf, fracText, cmpFrac, fractionWords, FRACTION_NAMES, nearestBenchmark, benchmarkWords, addFrac, subFrac } from './fractions.js';

const SIGN_SAID = { '<': 'less than', '=': 'equal to', '>': 'greater than' };
const jumps = (n) => (n === 1 ? '1 jump' : `${n} jumps`);
const den = (t) => fracOf(t).d;
const isUnit = (t) => fracOf(t).n === 1;
const HALF = '1/2';
const under = (t) => cmpFrac(t, HALF) < 0;
// vs-half's unit fraction that is not 1/2, asked first or turned round after it ("Is 1/2 smaller or larger than 1/5?")
const notHalf = (sum) => [sum.a, sum.b].find((t) => t !== HALF);

// ---- the answer steps, the same whichever way: a box for the numerator, the denominator printed ("So the shaded part
// is ☐/8"), or a choice's or an order's answer in words (js/runner.js "Show me one step" stops before it) ----

function partsAnswer(sum) {
  const { key, n, d } = sum;
  if (key === 'name') return { text: `So the shaded part is ☐/${d}`, value: n, answer: true };
  // never ending on "what sixths", which the voice says as a question, nor a name straight before "along" (plan fact 3)
  if (key === 'on-line') return { text: `So the point is at ☐/${d}, counted from 0`, value: n, answer: true };
  if (key === 'complement') return { text: `So ${n}/${d} + ☐/${d} = 1`, value: d - n, answer: true };
  // rename and beyond in the order of the question, as the plan's F1 Ways write it ("So 7/4 = 1 + ☐/4"; the lead, pt61)
  if (key === 'rename') return sum.form === 'whole' ? { text: `So ${d}/${d} = ☐`, value: 1, answer: true } : { text: `So ☐/${d} = 1`, value: d, answer: true };
  if (key === 'beyond') return { text: `So ${n}/${d} = 1 + ☐/${d}`, value: n - d, answer: true };
  if (key === 'whole') return { text: `So the whole strip is ${LETTERS[sum.strips.indexOf(d)]}.` };
  return letterStep(fracText(n, d), sum.letters);
}
const letterStep = (at, letters) => ({ text: `So the letter at ${at} is ${letterAt(at, letters)}.` });

// a comparing answer: the sign, smaller or larger, who ate more, the order, or the letter
const inOrder = (values) => [...values].sort(cmpFrac);
const ONLY_SAME = 'A half is more than a quarter only of the same whole.';
export function sameWholeAnswer(sum) {
  const [q, h] = sum.lengths; // the quarter's cake and the half's, so the pieces are q/4 and h/2 of one length
  return q === 2 * h ? 'the same' : q > 2 * h ? sum.names[0] : sum.names[1];
}
function comparedAnswer(sum) {
  if (sum.op === 'floc') return letterStep(sum.at, sum.letters);
  if (sum.op === 'ford') return { text: `Smallest first: ${inOrder(sum.values).join(', ')}` };
  if (sum.key === 'vs-half') return { text: `So ${sum.a} is ${cmpFrac(sum.a, sum.b) < 0 ? 'smaller' : 'larger'} than ${sum.b}.` };
  if (sum.key === 'same-whole') {
    const who = sameWholeAnswer(sum);
    return { text: `${who === 'the same' ? 'So they ate the same amount.' : `So ${who} ate more.`} ${ONLY_SAME}` };
  }
  const s = signOf(sum.a, sum.b);
  // a family compared (frac-equivalent): no fraction name before a colon or a comma, where the voice loses it ("sixths:,"
  // heard "Sixth.", "sixth, written," heard "6. Written", step 2.3, the pt54 pieces runs); unit fractions keep
  // dec-compare's shared form, as voiced in step 2.2
  if (familyCompare(sum)) return { text: `So ${sum.a} is ${SIGN_SAID[s]} ${sum.b}. ${sum.a} ${s} ${sum.b}.` };
  return { text: `So ${sum.a} is ${SIGN_SAID[s]} ${sum.b}: ${sum.a} ${s} ${sum.b}` };
}

// every fraction a comparing sum works with, as the question lists them
const compared = (sum) => (sum.op === 'fcmp' ? [sum.a, sum.b] : sum.op === 'ford' ? sum.values : sum.letters);

// ---- adding and taking away with the same denominator (frac-addsub-same) and equivalent fractions (frac-equivalent):
// what every way shares ----

const nameOf = (d) => FRACTION_NAMES[d][0];
const cap = (t) => t[0].toUpperCase() + t.slice(1);
const ADDING = ['f+', 'f−'];
const isWhole = (t) => !String(t).includes('/');
// an adding or taking away in one size of parts: the same denominator, or a unit fraction from a whole number
const sameParts = (sum) => ADDING.includes(sum?.op) && (isWhole(sum.a) || den(sum.a) === den(sum.b));
// an adding or taking away with related denominators (frac-addsub-related): two fractions, one denominator a multiple of
// the other's, as 1/4 + 3/8 (S3 RQF B l.50, l.58-61)
export const relatedSum = (sum) => ADDING.includes(sum?.op) && !isWhole(sum.a) && den(sum.a) !== den(sum.b)
  && Math.max(den(sum.a), den(sum.b)) % Math.min(den(sum.a), den(sum.b)) === 0;
// comparing fractions of one family (frac-equivalent): not all unit fractions (those are frac-unit-compare's), and every
// denominator a factor of the largest, so each renames to it
const familyCompare = (sum) => ['fcmp', 'ford'].includes(sum?.op) && !compared(sum).every(isUnit)
  && compared(sum).every((t) => Math.max(...compared(sum).map(den)) % den(t) === 0);
const sizesOf = (sum) => [...new Set(compared(sum).map(den))].sort((x, y) => x - y);

// what an adding or taking away asks, whoever asks it: a story's is its own sum (a story of two people or of one person
// adding, of giving some away, or of how much more)
const STORY_SHAPE = { two: 'add', more: 'add', away: 'sub', 'more-than': 'difference' };
function shapeOf(sum) {
  if (sum.key === 'story') return STORY_SHAPE[sum.story.kind];
  if (sum.key === 'difference') return sum.half ? 'half' : 'difference';
  if (sum.key === 'from-whole') return sum.a === '1' ? 'from-one' : 'from-whole';
  // F5's sub asked in the Example's words, "How much more is 3/4 than 3/8?" (Examples fa1618803c l.77)
  if (sum.key === 'sub' && sum.more) return 'difference';
  return sum.key;
}
// its numbers: the two numerators (a whole number's own for from-whole), each in the denominator the steps work in (the
// larger, when they are related: 1/4 + 3/8 is 2 + 3 eighths), that denominator and its name
function partsOf(sum) {
  const d = isWhole(sum.a) ? den(sum.b) : Math.max(den(sum.a), den(sum.b));
  const inD = (t) => (fracOf(t).n * d) / den(t);
  return { A: isWhole(sum.a) ? Number(sum.a) : inD(sum.a), B: inD(sum.b), d, names: namesOf(d) };
}
// the line it is worked on: to 1, to 2 past one, to the whole number taken from, cut in the parts the steps work in; a
// line past 12 spaces is too crowded to read (engine/render/svg.js fracline), and one past 3 wholes too long (plan, "The
// fraction pictures": wholes 1 to 3)
const lineWholes = (sum) => (sum.key === 'past-one' ? 2 : isWhole(sum.a) ? Number(sum.a) : 1);
function lineStops(sum) {
  const { d } = partsOf(sum);
  const at = `a line to ${lineWholes(sum)} in ${namesOf(d)}`;
  if (lineWholes(sum) * d > 12) return `${at} would be too crowded`;
  return lineWholes(sum) > 3 ? `${at} would be too long` : null;
}

// the answer step, the same whichever way: its box the numerator, the denominator printed
function addsubAnswer(sum) {
  const { A, B, d } = partsOf(sum);
  const shape = shapeOf(sum);
  if (shape === 'add') return { text: `So ${sum.a} + ${sum.b} = ☐/${d}`, value: A + B, answer: true };
  if (shape === 'sub') return { text: `So ${sum.a} − ${sum.b} = ☐/${d}`, value: A - B, answer: true };
  // how much more, in the plan's words (S3 RQF A l.55, "interpret the answer"; the lead, round 2)
  if (shape === 'difference') return { text: `So ${sum.a} is ☐/${d} more than ${sum.b}.`, value: A - B, answer: true };
  if (shape === 'half') return { text: `So the difference is ${2 * (A - B) > d ? 'more' : 'less'} than one-half.` };
  // "4/5 + 3/5 = 7/5 = 1 2/5" (Examples fac8227f10 l.172), the whole and the rest, in the ask's order (the lead, pt56)
  if (shape === 'past-one') return { text: `${d} ${namesOf(d)} make 1 whole, so ${sum.a} + ${sum.b} = 1 + ☐/${d}`, value: A + B - d, answer: true };
  if (shape === 'from-whole') return { text: `So ${sum.a} − ${sum.b} = ${A - 1} + ☐/${d}`, value: d - 1, answer: true };
  return { text: `So 1 − ${sum.b} = ☐/${d}`, value: d - 1, answer: true };
}

// the answer step of a renaming in the ask's order: "So 3/4 = ☐/8", or missing the other way "So ☐/4 = 6/8" (the lead,
// pt56), its box the numerator of the denominator asked
function renamedAnswer(sum) {
  const value = (fracOf(sum.a).n * sum.d2) / den(sum.a);
  const text = sum.key === 'missing' && sum.d2 < den(sum.a) ? `So ☐/${sum.d2} = ${sum.a}` : `So ${sum.a} = ☐/${sum.d2}`;
  return { text, value, answer: true };
}
// a fraction renamed in a larger denominator: 3/4 in eighths is 6/8
const renamed = (t, d) => fracText((fracOf(t).n * d) / den(t), d);

// ---- adding and taking away with related denominators (frac-addsub-related): the estimate first, then the fraction in
// the larger parts renamed in the smaller, then the parts counted (S3 RQF B l.58-61, saved copy 2026-10-10-1117-article-
// k-10-mathematics-k-10-syllabus-2022-fa1618803c.md; NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments,
// checked 26 October 2026) ----

// The estimate that opens every one, whichever way works it and whoever asks (plan F5, "The estimate first"; the IES
// guide's, not NESA's: "Teachers can ask students to provide an initial estimate ... before having them compute the
// answer", IES 2010 l.798-800, with the benchmarks 0, 1/2 and 1, l.814): each fraction to the nearest half, so to the
// nearest of 0, 1/2 and 1, a quarter and three quarters up (engine/fractions.js nearestBenchmark), then the problem's own
// sign. { values, about }: the two rounded, in the ask's order, and the result, each { n, d }
export function fractionEstimate(sum) {
  const values = [sum.a, sum.b].map(nearestBenchmark);
  return { values, about: (sum.op === 'f+' ? addFrac : subFrac)(...values) };
}
// its step, with no box, said and shown as the decimal estimate is, "Each to the nearest half, 1/2 + 1/2 = 1.", the result
// in words ("1 and a half"): the plan's "1/4 is about 1/2 and 3/8 is about 1/2, so about 1" would run a fraction name into
// "is", and "half:" a name into a colon, where the voice loses its end (plan fact 3; the lead, pt58), so each rounding is
// said in the ask's order, as the decimal one is. opening: the same words where two ways side by side share it, shown and
// said once above them (js/runner.js askWay), with no "First" (engine/methods.js estimateStep), one sentence with its
// numbers, so "For both ways, about how big: …" is built from the guide's pieces, never a line of its own to voice
const SIGN_OF = { 'f+': '+', 'f−': '−' };
export function fractionEstimateStep(sum) {
  const { values: [x, y], about } = fractionEstimate(sum);
  const words = kept(`each to the nearest half, ${benchmarkWords(x)} ${SIGN_OF[sum.op]} ${benchmarkWords(y)} = ${benchmarkWords(about)}.`);
  return { text: `About how big? E${words.slice(1)}`, opening: `about how big: ${words}` };
}

// the fraction in the larger parts, renamed in the smaller (1/4 of 1/4 + 3/8): its denominator, the cut (8 ÷ 4 = 2) and
// the parts it makes, her box
function renaming(sum) {
  const { d } = partsOf(sum);
  const s = den(sum.a) < den(sum.b) ? sum.a : sum.b;
  return { s, ds: den(s), d, k: d / den(s), value: (fracOf(s).n * d) / den(s) };
}
// each way's one renaming step, then past one the improper total, as the Example writes 7/5 before 1 2/5 (Examples
// fac8227f10 l.172), with the way's picture so it stays on screen, then the answer: 3 steps after the estimate, 4 past one.
// after: the picture the steps after the renaming show, where the renaming's has a box of its own (the line's point,
// filled in once she has found it, so the only empty box on screen is hers: step 2.4 review 1)
function relatedSteps(sum, rename, after = rename.picture) {
  const { A, B, d, names } = partsOf(sum);
  const later = after ? { picture: after } : {};
  const total = shapeOf(sum) === 'past-one' ? [{ text: `${A} ${names} + ${B} ${names} = ☐ ${names}`, value: A + B, ...later }] : [];
  return [rename, ...total, { ...addsubAnswer(sum), ...(after !== rename.picture ? later : {}) }];
}
// a hint about the renaming, never a number but the question's, no picture named (none is on her practice screen but a
// story's two strips), never ending on a fraction name: the way's own words, as frac-equivalent's; the line's and the
// strips' ask for the parts of the fraction renamed too, but where it is one part, as the cut alone asks it
const relatedHint = (sum, parts) => {
  const { s, ds, d } = renaming(sum);
  const fill = `How many ${namesOf(d)} fill a ${nameOf(ds)} of the whole`;
  return parts && fracOf(s).n > 1 ? `${fill}, and how many fill ${s} of it?` : `${fill}?`;
};

// The steps of adding and taking away and of equivalent fractions as she is shown them (the lead's rulings on step 2.3's
// replay, pt56). The answer step, and the half form's choice, whose question has strips of its own to come back, carry
// the last picture before it, the same one, so the line or the strips stay on screen to her answer (js/runner.js shows a
// step's own picture). A number sentence never breaks across lines: the spaces either side of ×, ÷, =, + and −, and in
// a count such as "11 eighths", are no-break spaces, which the voice reads as plain ones. Fractions of a whole and
// comparing unit fractions keep their steps as in step 2.2 (a frac-parts picture carried left her typing with no point
// on screen, the lead, pt56 round 2).
const NB = '\u00a0';
const COUNTED = new RegExp(`(\\d|☐) (${Object.values(FRACTION_NAMES).flat().sort((x, y) => y.length - x.length).join('|')})\\b`, 'g');
const kept = (text) => text.replace(/ ([×÷=+−]) /g, `${NB}$1${NB}`).replace(COUNTED, `$1${NB}$2`);
function shown(sum, steps) {
  if (!(ADDING.includes(sum?.op) || sum?.op === 'fequ' || familyCompare(sum))) return steps;
  let last = null;
  return steps.map((s, i) => {
    const step = { ...s, text: kept(s.text) };
    if (s.picture) last = s.picture;
    else if ((s.answer || (sum.half && i === steps.length - 1)) && last) step.picture = last;
    return step;
  });
}

// ---- the pictures the worked steps show: a line from 0 to 1 (or 2) cut into d, or strips of equal wholes ----

const lineOf = (d, more = {}) => ({ type: 'fracline', wholes: 1, d, labels: 'wholes', ...more, working: true });

// the quarter-half line's steps, the same whichever way: its middle is 1, not 1/2 (S2 PF B, saved copy
// 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fabf1cf43b.md l.48)
function quarterHalf(sum) {
  const at = fracText(sum.n, sum.d);
  return [{ text: 'The line from 0 to 2 has 1 in its middle.' }, { text: 'From 0 to 1 is cut into 4 equal spaces, quarters.' },
    { text: sum.d === 2 ? '1/2 is 2 quarters from 0.' : '1/4 is 1 quarter from 0.' }, partsAnswer(sum)];
}
const QUARTER_HALF_HINT = (sum) => (sum.d === 2 ? 'Where is 1 on this line? Where is halfway from 0 to 1?' : 'Where is 1 on this line? Where is a quarter of the way from 0 to 1?');

// ---- Fraction strips (frac-parts): parts and shaded parts on a strip ----

function stripSteps(sum) {
  const { key, n, d } = sum;
  if (key === 'quarter-half') return quarterHalf(sum);
  if (key === 'name') return [{ text: 'Count all the equal parts: ☐', value: d }, partsAnswer(sum)];
  // on-line: the strip laid under the question's own line, its ends at 0 and 1, so "from 0 to 1" and the point are on
  // screen with it (a step's picture takes the question's place on a worked screen); none of it shaded, the point a box
  // (the lead, pt62)
  if (key === 'on-line') return [{ text: 'Count the equal parts from 0 to 1: ☐', value: d, picture: lineOf(d, { point: { n, d, label: '?' }, strip: true }) }, partsAnswer(sum)];
  // "Describe fraction families ... as having the same denominator" (S2 PF A l.45), said in the steps, not asked
  if (key === 'complement') return [{ text: `${n}/${d} and the part missing are both ${namesOf(d)}: one family, the same denominator.` }, { text: `1 whole is ${d}/${d}.` }, partsAnswer(sum)];
  // the strips cut into the part's size here only, never on the question (review 3)
  if (key === 'whole') {
    return [{ text: `1/${d} means ${d} equal parts make the whole.` }, { text: 'Lay the part along each strip and count how many times it fits.',
      picture: { type: 'strips', rows: [{ d, count: 1, label: 'unit' }, ...sum.strips.map((count, i) => ({ d, count, name: LETTERS[i] }))], working: true } }, partsAnswer(sum)];
  }
  if (key === 'rename') return [{ text: 'How many parts make the whole strip? Count them all.' }, partsAnswer(sum)];
  // beyond: the regroup, a whole strip and the rest on a second, shown in the steps only, never on the question
  return [{ text: `A whole strip takes ${d} ${namesOf(d)}; the rest go on a second strip.`, picture: { type: 'strips', rows: [{ d, shaded: d }, { d, shaded: n - d }], working: true } },
    partsAnswer(sum)];
}
const STRIP_HINTS = {
  name: () => 'How many equal parts is the strip cut into, and how many are shaded?',
  complement: ({ d }) => `How many ${namesOf(d)} make 1 whole? How many are shaded already?`,
  whole: () => 'How many times must the part fit along the whole strip?',
  'on-line': () => 'How many equal parts from 0 to 1, and how many from 0 to the point?',
  rename: () => 'How many parts make the whole strip?',
  beyond: ({ d }) => `How many ${namesOf(d)} fill one whole strip? How many are left over?`,
  'quarter-half': QUARTER_HALF_HINT,
};

// adding and taking away on strips: the question's two strips are on screen, so the steps shade on them in words, and no
// strip is drawn with the sum shaded on one (that would count it for her); a whole is cut only in the steps. Past one the
// picture is what the words say, one strip filled and the rest on a second, and the count of every shaded part is made
// on it too, so the strips stay the same to her answer (the lead, pt56)
function stripAddSteps(sum) {
  if (relatedSum(sum)) {
    // the strip of the larger parts over one of the smaller, the same length, the fraction renamed shaded, in the plan's own
    // words but its start: "A quarters strip" was said "A quarter strip" on every take (plan fact 3; the lead's fix round,
    // pt58), so the strips are named by their cut; "cover" when more than one. A story's two strips, the same length
    // already, are its question's, on screen throughout, so its steps speak of them in words and draw none of their own,
    // as F3's story does, the strips named top first, so "over" stays true (the lead's ruling 3 on the replay, pt58, as
    // pt59 read it, and pt59 (ii): no picture drawn twice)
    const { s, ds, d, value } = renaming(sum);
    const n = fracOf(s).n;
    const story = sum.key === 'story';
    const rows = story ? [sum.a, sum.b].map((t) => ({ d: den(t), shaded: fracOf(t).n })) : [{ d: ds, shaded: n }, { d }];
    return relatedSteps(sum, { text: `A strip cut in ${namesOf(rows[0].d)}, over one cut in ${namesOf(rows[1].d)}. ${fractionWords(n, ds)} cover${n === 1 ? 's' : ''} ☐ ${namesOf(d)}.`, value,
      ...(story ? {} : { picture: { type: 'strips', rows, working: true } }) });
  }
  const { A, B, d, names } = partsOf(sum);
  const shape = shapeOf(sum);
  const whole = fracStrip.picture(sum);
  const regrouped = { type: 'strips', rows: [{ d, shaded: d }, { d, shaded: A + B - d }], working: true };
  const first = {
    add: { text: `Shade ${fractionWords(A, d)}, then ${B} more.` },
    sub: { text: `Shade ${fractionWords(A, d)}, then take ${B} away.` },
    difference: { text: 'Line the two strips up, and count the shaded parts one has more than the other.' },
    half: { text: `Half of a strip of ${d} equal parts is ${d / 2} parts: ${d / 2}/${d}.`, picture: { type: 'strips', rows: [{ d, shaded: d / 2 }], working: true } },
    'past-one': { text: `Shade ${fractionWords(A, d)}, then ${B} more: one strip fills, and the rest go on a second.`, picture: regrouped },
    'from-whole': { text: `Cut 1 of the ${A} whole strips into ${names}, then take away 1 ${nameOf(d)}.`, picture: whole },
    'from-one': { text: `Cut the whole strip into ${names}, then take away 1 ${nameOf(d)}.`, picture: whole },
  }[shape];
  // past one, the improper total counted first, as the Example writes 7/5 before 1 2/5
  const total = shape === 'past-one' ? [{ text: `Count every shaded part: ☐ ${names}`, value: A + B, picture: regrouped }] : [];
  return [first, ...total, addsubAnswer(sum)];
}
const STRIP_ADD_HINTS = {
  add: () => 'How many parts are shaded on the two strips together?',
  sub: () => 'Shade the first, then take the second away. How many shaded parts are left?',
  difference: () => 'How many more parts are shaded on one strip than on the other?',
  half: () => 'How many parts make half the strip? Is the difference more than that, or less?',
  'past-one': () => 'How many parts fill one strip, and how many are left over?',
  'from-whole': () => 'How many parts is the whole strip cut into? How many are left when 1 goes?',
  'from-one': () => 'How many parts is the whole strip cut into? How many are left when 1 goes?',
};

// the hint of a renaming worked on strips or the line: given in practice, where the way's working strips or line are not
// on the screen, so it asks about the parts of the question's own rectangle or dots (area, collection), else about the
// parts with no picture named (half-in, missing); never ending on a fraction name, never a number but the question's
// (the lead, step 2.3 pt54 rounds 2 and 3)
function partsHint(sum) {
  const d = den(sum.a), d2 = sum.d2;
  if (sum.key === 'area') return 'Each column of the rectangle is cut into how many small parts, and how many columns are shaded?';
  if (sum.key === 'collection') return 'How many dots make each column, and how many columns do the shaded dots fill?';
  if (sum.key === 'half-in') return `How many ${namesOf(d2)} make the whole, and how many of them make each half of it?`;
  if (d2 > d) return `How many ${namesOf(d2)} fill a ${nameOf(d)} of the whole, and how many fill ${sum.a} of it?`;
  return `How many ${namesOf(d)} fill a ${nameOf(d2)} of the whole, and how many ${namesOf(d2)} do ${sum.a} fill?`;
}

// a renaming on two strips of the same length, one over the other: the parts under the shaded part counted
// (each step that speaks of the strips carries them, so a worked example never puts the question's rectangle or dots
// back beside it, js/runner.js; step 2.3 review 3)
function stripRenameSteps(sum) {
  const d = den(sum.a);
  return [{ text: `A strip of ${namesOf(d)} lies over a strip of ${namesOf(sum.d2)}, the same length.`, picture: fracStrip.picture(sum) },
    { text: `Count the ${namesOf(sum.d2)} under the shaded part.`, picture: fracStrip.picture(sum) }, renamedAnswer(sum)];
}
// comparing on strips of equal wholes (S2 PF B l.40-41): each shaded on its own, one under the other
const stripCompareSteps = (sum) => [{ text: 'Shade each on a strip of the same length, one under the other.', picture: fracStrip.picture(sum) },
  { text: 'The longer the shading, the bigger the fraction.' }, comparedAnswer(sum)];

// the narrowest part a strips picture draws, in px, laid out as engine/render/svg.js strips lays it: the longest row 324
// px (the picture's 340 less its padding), each row its length (lengths, else 1) times its parts (count, else d) over d
// wholes, each part a 1/d of that row's whole. A lettered row's letter narrows it a little more, only on frac-parts'
// whole, a choice whose parts are about 30 px (tests/stage6-fractions.test.js reads every part as drawn)
function narrowest(pic) {
  const len = (i) => (pic.lengths?.[i] > 0 ? pic.lengths[i] : 1);
  const unit = 324 / Math.max(...pic.rows.map((x, i) => (len(i) * (x.count ?? x.d)) / x.d));
  return Math.min(...pic.rows.map((x, i) => (unit * len(i)) / x.d));
}
// the strips' own work: parts and shaded parts, adding and taking away in one size of parts or in related ones, renaming,
// a family compared
const stripsWork = (sum) => sum?.op === 'fpart' || sameParts(sum) || relatedSum(sum) || sum?.op === 'fequ' || familyCompare(sum);
// "Every fraction space is at least 26 px as drawn" (plan, "What strand 1 taught"): a sum whose strips would draw a part
// narrower, 5 − 1/10 with its tenths 8.1 px, is not the strips' (the lead, pt56)
const tooThin = (sum) => stripsWork(sum) && fracStrip.steps(sum).some((s) => s.picture?.type === 'strips' && narrowest(s.picture) < 26);

const fracStrip = {
  op: 'fpart', title: 'Fraction strips',
  fits: (sum) => stripsWork(sum) && !tooThin(sum),
  stops: (sum) => (tooThin(sum) ? 'the parts would be too thin to count' : null),
  steps: (sum) => shown(sum, sum.op === 'fpart' ? stripSteps(sum) : ADDING.includes(sum.op) ? stripAddSteps(sum) : sum.op === 'fequ' ? stripRenameSteps(sum) : stripCompareSteps(sum)),
  // the strips a renaming or a comparing is worked on, for a question with no picture of its own, and taking from a
  // whole number every whole she starts from: the uncut wholes in one row over the whole cut into its parts (strips are
  // 4 rows at most, and the whole number up to 5; step 2.3 review 9), the part taken away left unshaded (the lead,
  // pt56); adding's are the question's own
  picture(sum) {
    if (sum.op === 'fequ') return { type: 'strips', rows: [{ d: den(sum.a), shaded: fracOf(sum.a).n }, { d: sum.d2 }], working: true };
    if (familyCompare(sum)) return { type: 'strips', rows: compared(sum).map((t) => ({ d: den(t), shaded: fracOf(t).n })), working: true };
    if (sameParts(sum) && isWhole(sum.a)) {
      const W = Number(sum.a), d = den(sum.b);
      return { type: 'strips', rows: [...(W > 1 ? [{ d: 1, count: W - 1, shaded: W - 1 }] : []), { d, shaded: d - 1 }], working: true };
    }
    return null;
  },
  hint: (sum) => (sum.op === 'fpart' ? STRIP_HINTS[sum.key](sum) : relatedSum(sum) ? relatedHint(sum, true) : ADDING.includes(sum.op) ? STRIP_ADD_HINTS[shapeOf(sum)](sum)
    : sum.op === 'fequ' ? partsHint(sum) : 'Which shading is the longest?'),
  words: (sum) => ['fraction', 'fraction strip', ...(sum.key === 'complement' || ADDING.includes(sum.op) ? ['denominator'] : []),
    ...(sum.op === 'fequ' || familyCompare(sum) ? ['equivalent fractions'] : [])],
};

// ---- On a number line (frac-parts and frac-unit-compare): count the equal spaces from 0; further right is bigger ----

const SPACES = { text: 'The line from 0 to 1 is cut into ☐ equal spaces' };
// k jumps of 1/d from 0, unlabelled
const fromZero = (k, d) => Array.from({ length: k }, (_, i) => ({ from: [i, d], to: [i + 1, d], label: '' }));
function lineSteps(sum) {
  if (sum.op === 'fpart') {
    const { key, n, d } = sum;
    if (key === 'quarter-half') return quarterHalf(sum);
    if (key === 'name' || key === 'on-line') return [{ ...SPACES, value: d, ...(key === 'name' ? { picture: lineOf(d) } : {}) }, partsAnswer(sum)];
    // a step that speaks of jumps draws them, unlabelled, from 0: complement's to n/d, never the rest, which are her
    // answer; the others' to 1, never beyond's past it (the lead, pt61)
    if (key === 'complement') return [{ ...SPACES, value: d, picture: lineOf(d) }, { text: `From 0, ${jumps(n)} of 1/${d} ${n === 1 ? 'reaches' : 'reach'} ${n}/${d}, and the rest of the jumps reach 1.`, picture: lineOf(d, { jumps: fromZero(n, d) }) }, partsAnswer(sum)];
    if (key === 'whole') return [{ text: `1/${d} means ${d} equal parts make the whole.` }, { text: `On a line from 0, ${d} jumps of 1/${d} reach 1.`, picture: lineOf(d, { jumps: fromZero(d, d) }) }, partsAnswer(sum)];
    if (key === 'rename') return [{ text: `On a line from 0, count the jumps along the whole line: each is 1/${d}.`, picture: lineOf(d, { jumps: fromZero(d, d) }) }, partsAnswer(sum)];
    return [{ text: `${d} jumps of 1/${d} reach 1; the rest go on past it.`, picture: lineOf(d, { wholes: 2, point: { n, d, label: '' }, jumps: fromZero(d, d) }) }, partsAnswer(sum)];
  }
  if (sum.op === 'floc') {
    const d = den(sum.at);
    return [{ text: `Picture the line from 0 to 1 cut into ${d} equal spaces: ${sum.at} is at the end of the first.` }, comparedAnswer(sum)];
  }
  if (ADDING.includes(sum.op)) return lineAddSteps(sum);
  if (sum.op === 'fequ') return lineRenameSteps(sum);
  if (familyCompare(sum)) {
    return [{ text: `On this line, ${namesOf(sizesOf(sum)[0])} are marked above and ${namesOf(sizesOf(sum)[1])} below.`, picture: fracLine.picture(sum) },
      { text: 'Find each one on the line. Further right is bigger.' }, comparedAnswer(sum)];
  }
  // the lines go with the step that marks them, so "Show me one step" shows them in practice too, where the problem's own
  // working picture is left off the question (js/runner.js asked)
  const first = { text: 'Mark each on its own line from 0 to 1, cut into its parts.', picture: fracLine.picture(sum) };
  if (sum.op === 'ford') return [first, { text: 'The more parts a line has, the nearer 0 its first mark is. Further right is bigger.' }, comparedAnswer(sum)];
  // two unit fractions, each on its own line, the one cut into more parts named; neither the sign, nor the answer's word,
  // nor where either stands is said before the last step
  const [x, y] = [sum.a, sum.b].sort((p, q) => den(q) - den(p));
  // the reason only, the parts and the rule; where each value stands is the last step's (review 5)
  // a fraction name never straight before "line", where the voice drops its s ("The eighth line", plan fact 3)
  return [first, { text: `The line cut into ${namesOf(den(x))} has more parts than the line cut into ${namesOf(den(y))}. Further right is bigger.` }, comparedAnswer(sum)];
}
const LINE_HINTS = {
  name: () => 'How many equal spaces from 0 to 1? Where does the shaded part end?',
  complement: ({ n, d }) => `From ${n}/${d}, how many jumps of 1/${d} reach 1?`,
  whole: () => 'How many jumps of the part reach 1?',
  'on-line': () => 'How many equal spaces from 0 to 1, and how many from 0 to the point?',
  rename: ({ d }) => `How many jumps of 1/${d} reach 1?`,
  beyond: ({ d }) => `How many jumps of 1/${d} reach 1, and how many go past it?`,
  'quarter-half': QUARTER_HALF_HINT,
};
const COMPARED_LINE_HINT = 'On its own line from 0 to 1, where is each mark? Which is further right?';

// adding and taking away on a line in the problem's parts: from where it starts, jumps on or back (plan F3, "Ways" and
// "Picture", "fracline with jumps in the worked steps"), each jump 1/d with no label, and the line labelled only at its
// wholes, so no label sits on a tick they land on (the lead, pt56); how much more counts the jumps up from the smaller
function lineAddSteps(sum) {
  if (relatedSum(sum)) {
    // a line in the smaller parts below with the larger above (IES 2010 l.652, l.696), each labelled only at its wholes,
    // the fraction renamed marked over the line, so no label gives what she counts (plan F5; I3); its point has no box
    // under it, the box being in the step's sentence, hers or shown worked (the lead's ruling 1 on the replay, pt58)
    const { s, ds, d, value } = renaming(sum);
    const line = (point) => lineOf(ds, { wholes: lineWholes(sum), below: d, belowLabels: 'wholes', marks: [{ ...fracOf(s), label: s }], point: { ...fracOf(s), ...point } });
    // the plan's words, "On a line in eighths with quarters above, 1/4 is at ☐/8", with "=" for "is at", which would run
    // the name into "is" (plan fact 3; the lead, pt58); after it, the point named what she found there
    return relatedSteps(sum, { text: `On a line in ${namesOf(d)} with ${namesOf(ds)} above, ${s} = ☐/${d}`, value, picture: line({ label: '' }) },
      line({ label: fracText(value, d) }));
  }
  const { A, B, d, names } = partsOf(sum);
  const shape = shapeOf(sum);
  // from a numerator, k jumps of 1/d, each on (+1) or back (−1)
  const hops = (from, k, step) => Array.from({ length: k }, (_, i) => ({ from: [from + i * step, d], to: [from + (i + 1) * step, d], label: '' }));
  const at = (start, jumps = []) => lineOf(d, { wholes: lineWholes(sum), point: { ...fracOf(start), label: isWhole(start) ? '' : start }, ...(jumps.length ? { jumps } : {}) });
  const W = isWhole(sum.a) ? A * d : A; // where a taking from a whole number starts, in parts
  const first = {
    add: { text: `Start at ${sum.a} on a line in ${names}, and jump on ${fractionWords(B, d)}.`, picture: at(sum.a, hops(A, B, 1)) },
    sub: { text: `Start at ${sum.a} on a line in ${names}, and jump back ${fractionWords(B, d)}.`, picture: at(sum.a, hops(A, B, -1)) },
    difference: { text: `Start at ${sum.b} on a line in ${names}, and count the jumps up to ${sum.a}.`, picture: at(sum.b, hops(B, A - B, 1)) },
    half: { text: `On a line in ${names}, one-half is at ${d / 2}/${d}.`, picture: lineOf(d, { marks: [{ n: d / 2, d, label: '1/2' }] }) },
    'past-one': { text: `Start at ${sum.a} on a line in ${names}, and jump on ${fractionWords(B, d)}.`, picture: at(sum.a, hops(A, B, 1)) },
    'from-whole': { text: `Start at ${A} on a line in ${names}, and jump back 1 ${nameOf(d)}.`, picture: at(sum.a, hops(W, 1, -1)) },
    'from-one': { text: `Start at 1 on a line in ${names}, and jump back 1 ${nameOf(d)}.`, picture: at(sum.a, hops(W, 1, -1)) },
  }[shape];
  // past one, where the jumps end, counted from 0: the improper total first, beside its line (step 2.3 review 3)
  const total = shape === 'past-one' ? [{ text: `The jumps end at ☐/${d}, counted from 0.`, value: A + B, picture: at(sum.a, hops(A, B, 1)) }] : [];
  return [first, ...total, addsubAnswer(sum)];
}
const LINE_ADD_HINTS = {
  difference: 'From the smaller one, how many jumps reach the larger?',
  half: 'Where is one-half on the line? Is the difference past it?',
};
const LINE_ADD_HINT = 'Where do you start on the line, and how many jumps do you make?';

// a renaming on one line, the given fraction's labels above it and those of the parts asked for below (IES 2010 l.652,
// l.696): one point, two names, her answer always read from the lower labels (the lead, 27 October), its own label there a
// box, so the picture never names it before the answer step (step 2.3 review 1); both steps carry the line (review 3)
function lineRenameSteps(sum) {
  return [{ text: `On this line, ${namesOf(den(sum.a))} are marked above and ${namesOf(sum.d2)} below.`, picture: fracLine.picture(sum) },
    { text: `The point at ${sum.a} has a second name, under the line.`, picture: fracLine.picture(sum) }, renamedAnswer(sum)];
}

const fracLine = {
  // its title read as a place, so where it stops it is named as a thing: "A number line won't work here: …" (engine/methods.js
  // wontWork; the lead's ruling 5 on the replay, pt58)
  op: 'fpart', title: 'On a number line', refusedAs: 'A number line',
  fits(sum) {
    if (sameParts(sum) || relatedSum(sum)) return !lineStops(sum);
    if (sum?.op === 'fequ') return true;
    // a family compared on one line, labelled above and below: two sizes of parts at most
    if (familyCompare(sum)) return sizesOf(sum).length <= 2;
    return ['fpart', 'fcmp', 'ford', 'floc'].includes(sum?.op) && sum.key !== 'same-whole';
  },
  stops(sum) {
    // the teaching point of S3 RQF A l.45: fractions compare only as parts of one whole
    if (sum?.key === 'same-whole') return 'the two wholes are not the same size';
    if ((sameParts(sum) || relatedSum(sum)) && lineStops(sum)) return lineStops(sum);
    if (familyCompare(sum) && sizesOf(sum).length > 2) return 'they have three sizes of parts';
    return null;
  },
  steps: (sum) => shown(sum, lineSteps(sum)),
  // a line from 0 to 1 for each unit fraction compared, cut into its parts, its unit fraction marked; a family compared,
  // or a fraction renamed, on one line with the smaller parts below (a renaming's point at the fraction given), those
  // below labelled only at the wholes, so she counts the parts to the point and no label either side of its box gives it
  // by counting on (the lead, pt56); the rest draw their own line in the steps
  picture(sum) {
    if (sum.op === 'fequ') return lineOf(den(sum.a), { labels: 'all', below: sum.d2, belowLabels: 'wholes', point: { ...fracOf(sum.a), label: '', below: '?' } });
    if (familyCompare(sum)) return lineOf(sizesOf(sum)[0], { labels: 'all', below: sizesOf(sum)[1], belowLabels: 'wholes' });
    return sum.op === 'fcmp' || sum.op === 'ford' ? { type: 'fracline', stack: compared(sum).map(den), working: true } : null;
  },
  hint(sum) {
    if (sum.op === 'fpart') return LINE_HINTS[sum.key](sum);
    if (sum.op === 'floc') return `Where is ${sum.at} on a line from 0 to 1 cut into ${den(sum.at)} equal spaces?`;
    if (relatedSum(sum)) return relatedHint(sum, true);
    if (ADDING.includes(sum.op)) return LINE_ADD_HINTS[shapeOf(sum)] ?? LINE_ADD_HINT;
    if (sum.op === 'fequ') return partsHint(sum);
    return familyCompare(sum) ? 'Find each one above or below the line. Which is further right?' : COMPARED_LINE_HINT;
  },
  words: (sum) => ['fraction', 'number line', ...(sum.op === 'fpart' ? ['equal parts'] : ADDING.includes(sum.op) ? ['denominator']
    : sum.op === 'fequ' || familyCompare(sum) ? ['equivalent fractions'] : ['unit fraction'])],
};

// ---- More parts, smaller parts (frac-unit-compare): the whole cut into more equal parts has smaller parts, and parts
// compare only as parts of one whole ----

function piecesSteps(sum) {
  if (sum.key === 'same-whole') {
    return [{ text: 'The two cakes are different sizes, so the fractions alone cannot decide it.' }, { text: 'Compare the shaded pieces themselves, one against the other.' },
      comparedAnswer(sum)];
  }
  if (sum.op === 'floc') {
    const d = den(sum.at);
    return [{ text: `More parts, smaller parts: ${d} equal parts make 1 whole, so each is small.` }, { text: `${sum.at} is 1 of those small parts from 0.` }, comparedAnswer(sum)];
  }
  if (sum.op === 'ford') {
    return [{ text: 'The more equal parts the whole is cut into, the smaller each part is.' }, { text: 'Each is 1 part of the whole, so the most parts make the smallest fraction.' },
      comparedAnswer(sum)];
  }
  // vs-half: "smaller" and "larger" are hers to choose, so neither is said before the last step
  if (sum.key === 'vs-half') {
    const d = den(notHalf(sum));
    return [{ text: `The whole cut into ${d} equal parts has thinner parts than cut into 2.` }, { text: 'Each is 1 part of the whole, so compare the parts.' }, comparedAnswer(sum)];
  }
  const [many, few] = [den(sum.a), den(sum.b)].sort((p, q) => q - p);
  return [{ text: `The whole cut into ${many} equal parts has smaller parts than cut into ${few}.` }, { text: 'Each is 1 part of the whole, so the bigger part is the bigger fraction.' },
    comparedAnswer(sum)];
}

const fracPieces = {
  // offered where another way stops on wholes of different sizes, named by what its steps do there, never by the rule
  // that misleads on them (engine/methods.js wontWork; the lead, pt61)
  op: 'fcmp', title: 'More parts, smaller parts', offeredAs: (sum) => (sum?.key === 'same-whole' ? 'Compare the pieces' : null),
  fits: (sum) => (['fcmp', 'ford'].includes(sum?.op) && compared(sum).every(isUnit)) || (sum?.op === 'floc' && isUnit(sum.at)),
  stops: (sum) => (['fcmp', 'ford', 'floc'].includes(sum?.op) ? 'they are not both unit fractions' : null),
  steps: piecesSteps,
  // strips of equal wholes, one a fraction, its one part shaded; same-whole's two cakes are the question's own picture
  picture: (sum) => (sum.key !== 'same-whole' && (sum.op === 'fcmp' || sum.op === 'ford')
    ? { type: 'strips', rows: compared(sum).map((t) => ({ d: den(t), shaded: 1 })), working: true } : null),
  hint: (sum) => (sum.key === 'same-whole' ? 'Are the two cakes the same size? Compare the shaded pieces themselves.'
    : sum.op === 'floc' ? `How big is 1 part of ${den(sum.at)} equal parts? Which letter is that far from 0?`
      : 'Which whole is cut into more equal parts? Are its parts bigger or smaller?'),
  words: (sum) => ['unit fraction', 'denominator', ...(sum.key === 'same-whole' ? ['whole'] : [])],
};

// ---- Compare with a half (frac-unit-compare): is each more or less than 1/2, where that decides it ----

// whether 1/2 decides it: of two, one under a half and one not; of a line's letters, the one asked the only one under it
function halfDecides(sum) {
  if (sum?.key === 'same-whole') return false;
  if (sum?.op === 'floc') return under(sum.at) && sum.letters.filter((t) => t !== sum.at).every((t) => !under(t));
  if (sum?.op === 'fcmp' || sum?.op === 'ford') return compared(sum).filter(under).length === 1 && compared(sum).length === 2;
  return false;
}
function halfSteps(sum) {
  if (sum.op === 'floc') return [{ text: `${sum.at} is under a half, so its letter is left of 1/2.` }, { text: 'The other two letters are past 1/2.' }, comparedAnswer(sum)];
  const other = notHalf(sum);
  // the reason only, the parts each is 1 of; whether it is under a half is the last step's (review 4)
  const parts = { text: `${other} is 1 of ${den(other)} equal parts, and a half is 1 of only 2.` };
  if (sum.key === 'vs-half') return [parts, comparedAnswer(sum)];
  return [{ text: 'Compare each with a half: 1/2 is a half itself.' }, parts,
    comparedAnswer(sum)];
}

const fracHalf = {
  op: 'fcmp', title: 'Compare with a half',
  fits: halfDecides,
  stops(sum) {
    if (!['fcmp', 'ford', 'floc'].includes(sum?.op)) return null;
    if (sum.key === 'same-whole') return 'the two wholes are not the same size';
    // of two, both; of three, all (the lead, pt61)
    return compared(sum).every(under) ? `they are ${compared(sum).length === 2 ? 'both' : 'all'} less than a half` : 'more than one of them is less than a half';
  },
  steps: halfSteps,
  picture: (sum) => (sum.op === 'fcmp' ? { type: 'fracline', wholes: 1, d: 2, labels: 'all',
    marks: [sum.a, sum.b].filter((t) => t !== HALF).map((t) => ({ ...fracOf(t), label: t })), working: true } : null),
  hint: (sum) => (sum.op === 'floc' ? 'Which letters are past 1/2, and which is under it?' : 'Is each one more than a half, or less?'),
  words: () => ['unit fraction', 'half'],
};

// ---- Count the parts (frac-addsub-same): the denominator names the size of the parts, so they are counted as things are,
// 3 eighths and 2 eighths as 3 apples and 2 apples (IES 2010 l.469, l.830) ----

function countSteps(sum) {
  const { A, B, d, names } = partsOf(sum);
  const shape = shapeOf(sum);
  const first = {
    add: [{ text: `Both are ${names}, so the ${names} can be counted together.` }],
    sub: [{ text: `Both are ${names}, so the ${names} can be counted and taken away.` }],
    difference: [{ text: `Both are ${names}, so count the ${names} that ${sum.b} needs to make ${sum.a}.` }],
    half: [{ text: `One-half is ${d / 2}/${d}.` }],
    // the improper total first, as the Example writes 7/5 before 1 2/5 (Examples fac8227f10 l.172)
    'past-one': [{ text: `${A} ${names} + ${B} ${names} = ☐ ${names}`, value: A + B }],
    // no name before ", so" ("thirds, so," heard "so" alone, the pt54 pieces run)
    'from-whole': [{ text: `Take 1 whole as ${d}/${d}. ${A} is ${A - 1} + ${d}/${d}.` }],
    'from-one': [{ text: `Take 1 whole as ${d}/${d}.` }],
  }[shape];
  return [...first, addsubAnswer(sum)];
}
// no question ends on a fraction name, "… to make 2 sixths?", nor has one before its comma, "To make 2 eighths, how many
// more …" (step 2.3, the pt54 pieces runs)
function countHint(sum) {
  const { A, B, d, names } = partsOf(sum);
  return {
    add: `Both are ${names}. How many ${names} do ${A} and ${B} make?`,
    sub: `Both are ${names}. How many are left when you take ${B} away?`,
    difference: `Both are ${names}. ${sum.a} is ${sum.b} and how many more?`,
    half: `How many ${names} make one-half? Is the difference more than that, or less?`,
    'past-one': `How many ${names} in all? How many of them make 1 whole?`,
    'from-whole': `How many ${names} go with ${A - 1} to make ${A}?`,
    'from-one': `How many ${names} make 1 whole?`,
  }[shapeOf(sum)];
}

const fracCount = {
  op: 'f+', title: 'Count the parts',
  fits: sameParts,
  steps: (sum) => shown(sum, countSteps(sum)),
  picture: () => null,
  hint: countHint,
  words: () => ['fraction', 'denominator'],
};

// ---- Cut the parts again (frac-equivalent): cut each part into equal smaller parts, so the whole has more parts and the
// shaded part more of them; then count (S3 RQF B l.51; IES 2010 l.834) ----

function renameSteps(sum) {
  // adding and taking away with related denominators: "8 ÷ 4 = 2, so 1/4 = ☐/8" (plan F5, "Ways")
  if (relatedSum(sum)) {
    const { s, ds, d, k, value } = renaming(sum);
    return relatedSteps(sum, { text: `${d} ÷ ${ds} = ${k}, so ${s} = ☐/${d}`, value });
  }
  if (sum.op === 'fequ') {
    const { n, d } = fracOf(sum.a), d2 = sum.d2;
    if (sum.key === 'half-in') return [{ text: `Cut each half into equal smaller parts, until the whole has ${d2}.` }, renamedAnswer(sum)];
    if (sum.key === 'area') return [{ text: `The rows cut each column in ${d2 / d}: ${d} × ${d2 / d} = ☐ small parts.`, value: d2 }, renamedAnswer(sum)];
    if (sum.key === 'collection') return [{ text: `${d} dots in ${d2} equal columns: ${d} ÷ ${d2} = ☐ in each.`, value: d / d2 }, renamedAnswer(sum)];
    // the other way, smaller parts joined into the larger: "☐/4 = 6/8"
    if (d2 < d) return [{ text: `${cap(namesOf(d2))} are ${namesOf(d)} joined ${d / d2} at a time: ${d} ÷ ${d2} = ☐`, value: d / d2 }, renamedAnswer(sum)];
    return [{ text: `${cap(namesOf(d2))} are ${namesOf(d)} cut in ${d2 / d}: ${d2} ÷ ${d} = ☐`, value: d2 / d }, renamedAnswer(sum)];
  }
  // compared and ordered: each renamed to the largest denominator, then parts of one size compared (no boxes); where each
  // stands is the last step's. The renaming written "1/5 = 2/10" (the lead's wording, step 2.3 Do 6: "Rename 1 fifth in
  // tenths: it makes" was heard "… and …" on every take); of an equal pair "2/3 makes 4/6", since "2/3 = 4/6" before the
  // last step would be the answer's sign between the two compared
  const top = Math.max(...compared(sum).map(den));
  const moved = compared(sum).filter((t) => den(t) !== top);
  const is = sum.op === 'fcmp' && cmpFrac(sum.a, sum.b) === 0 ? 'makes' : '=';
  const rename = { text: `Rename with the same denominator: ${moved.map((t) => `${t} ${is} ${renamed(t, top)}`).join(', and ')}.` };
  if (sum.op === 'fcmp') return [rename, { text: `Both are now ${namesOf(top)}, so the one with more parts is bigger.` }, comparedAnswer(sum)];
  return [rename, { text: `Now all are ${namesOf(top)}, so order them by their parts.` }, comparedAnswer(sum)];
}
function renameHint(sum) {
  if (relatedSum(sum)) return relatedHint(sum, false);
  if (sum.op !== 'fequ') return sum.op === 'fcmp' ? 'Can you rename one so both have parts of the same size?' : 'Can you rename them all so the parts are the same size?';
  const d = den(sum.a), d2 = sum.d2;
  if (sum.key === 'half-in') return `Each half is cut into how many equal parts, so the whole has ${d2}?`;
  if (sum.key === 'area') return 'How many small parts is each column cut into? How many columns are shaded?';
  if (sum.key === 'collection') return 'How many dots are in each column? How many columns are shaded?';
  // the parts of the larger size in the smaller: never ending on a fraction name, never the number 1 (the answer of
  // ☐/4 = 2/8) (step 2.3, the pt54 pieces run and review 5)
  return d2 > d ? `How many ${namesOf(d2)} fill a ${nameOf(d)} of the whole?` : `How many ${namesOf(d)} fill a ${nameOf(d2)} of the whole?`;
}

const fracRename = {
  op: 'fequ', title: 'Cut the parts again',
  fits: (sum) => sum?.op === 'fequ' || relatedSum(sum) || (familyCompare(sum) && sizesOf(sum).length >= 2),
  steps: (sum) => shown(sum, renameSteps(sum)),
  picture: () => null,
  hint: renameHint,
  words: () => ['equivalent fractions', 'denominator'],
};

// ---- fractions of amounts, the whole from a part, and a fraction as a division (frac-of): a fraction of an amount
// { op: 'fof', key, n, d, of }, the whole from a part { op: 'fwhole', key, n, d, part } (tape: a length of tape in
// metres) and a share { op: 'fdiv', key, a, b } (a things between b people, thing the kind) ----

const OF_OPS = ['fof', 'fwhole', 'fdiv'];
// the things shared (plan F6, "Sizes"), as a share's steps and question name them: the chocolate fingers of the Example
// (Examples fa1618803c l.97), pizzas, cakes and ribbons
export const SHARES = {
  fingers: { many: 'chocolate fingers', each: 'chocolate finger', one: 'finger' },
  pizzas: { many: 'pizzas', each: 'pizza', one: 'pizza' },
  cakes: { many: 'cakes', each: 'cake', one: 'cake' },
  ribbons: { many: 'ribbons', each: 'ribbon', one: 'ribbon' },
};
// a share of whole numbers, exactly: a whole number where it divides, else decimal text in hundredths, every denominator
// a remainder is shared by (2, 4, 5 and 10) a factor of 100, so 10 ÷ 4 is "2.5" and 2 ÷ 4 "0.5", never a float
function amount(top, by) {
  if (top % by === 0) return top / by;
  const h = (top * 100) / by, f = String(h % 100).padStart(2, '0').replace(/0+$/, '');
  return `${(h - (h % 100)) / 100}.${f}`;
}
// the answer of a fraction of an amount: 3/4 of 24 is 18, 1/4 of 10 is "2.5"
export const ofValue = (sum) => amount(sum.n * sum.of, sum.d);

// The tape (plan F6, "Picture"): one row of d parts, the amount over it, or for the whole from a part the part given over
// the parts given and the whole a box; the parts asked shaded, as the Example's "Find 2/5 of 30." is (Examples
// fa1618803c l.89); each part's value a box on the question, filled in by the step that finds it
export function tapeOf(sum, value = '?') {
  const row = { d: sum.d, ...(sum.n > 1 ? { shaded: sum.n } : {}), value };
  return sum.op === 'fwhole' ? { type: 'strips', rows: [row], shadedTotal: sum.part, total: '?' } : { type: 'strips', rows: [row], total: sum.of };
}
// The tape filled in (tapeOf with the part's value) goes on the step that finds one part, whichever way works it (the
// tape's cut, dividing's "÷ d:", halving's "Half of that": the lead, the replay's point 3), not marked working, so where
// that step is hers it shows boxes, as her question does (js/runner.js ownPicture, asked); the answer step after it
// carries it marked working, so the parts she has found stay filled in (I1). A tape whose parts would be the answer, a
// unit fraction's or a remainder's, fills in nowhere, and the question's tape stays (one picture on the screen, never the
// same tape twice: the lead, pt59 (ii))
const found = (sum, step) => ({ ...step, picture: tapeOf(sum, step.value) });
export const carried = (step) => ({ picture: { ...step.picture, working: true } });

// the answer step: "So 3/4 of 24 = ☐", after a way's own word ("× 3: so …", "Half again: so …"); a story's in its unit,
// "So the answer is ☐ stickers." (the word problems' own words, engine/items/wordproblems.js); the whole "the number is
// ☐", or the tape's "the whole tape is ☐ metres." (plan F6)
export const so = (lead, claim) => (lead ? `${lead}: so ${claim}` : `So ${claim}`);
const ofClaim = (sum) => (sum.key === 'story' ? `the answer is ☐ ${sum.story.unit}.` : `${sum.n}/${sum.d} of ${sum.of} = ☐`);
const ofAnswer = (sum, lead) => ({ text: so(lead, ofClaim(sum)), value: ofValue(sum), answer: true });
const wholeClaim = (sum) => (sum.tape ? 'the whole tape is ☐ metres.' : 'the number is ☐');
// a share: under one, its fraction ("So each person gets ☐/4 of a finger"); past one, the improper share boxed first, so
// no step without a box says it, then the whole and the rest in the ask's order (plan F6; Examples fac8227f10 l.172)
function shareAnswer(sum) {
  const { a, b } = sum, one = SHARES[sum.thing].one, names = namesOf(b);
  if (a < b) return [{ text: `So each person gets ☐/${b} of a ${one}`, value: a, answer: true }];
  return [{ text: `Each person gets ☐ ${names}.`, value: a }, { text: `${b} ${names} make 1 whole, so each person gets 1 + ☐/${b} of a ${one}`, value: a - b, answer: true }];
}
// a remainder shared as a decimal (S3 RQF B l.67), in the plan's words whichever way: the whole number in each part with
// what is left, then what is left shared, then the answer; dividing names its divisor first, as its other steps do
function remainderSteps(sum, lead) {
  const { d, of } = sum, r = of % d, q = (of - r) / d;
  return [{ text: `${lead ? `÷ ${d}: ` : ''}${of} ÷ ${d} = ☐ remainder ${r}`, value: q },
    { text: `The ${r} left over, shared by ${d}, is ${r}/${d} = ☐`, value: amount(r, d) }, ofAnswer(sum)];
}
// a number sentence never breaks (I7), nor a way's own first word from its number ("÷ 4:", "× 3:")
export const keptOf = (steps) => steps.map((s) => ({ ...s, text: kept(s.text).replace(/^([×÷]) /, `$1${NB}`) }));

// ---- A tape diagram (frac-of): cut the amount into d equal parts, find one part, then the parts asked for; backwards,
// one part from the parts given, then every part; a share, each thing cut for each person ----

function tapeSteps(sum) {
  if (sum.op === 'fdiv') return [{ text: `Share each ${SHARES[sum.thing].each} equally between the ${sum.b} people.` }, ...shareAnswer(sum)];
  if (sum.op === 'fwhole') {
    const q = sum.part / sum.n;
    const part = found(sum, { text: `${sum.n} parts are ${sum.part}, so 1 part is ${sum.part} ÷ ${sum.n} = ☐`, value: q });
    return [part, { text: sum.tape ? 'So the whole tape is ☐ metres.' : `${sum.d} parts make the whole, so the number is ☐`, value: q * sum.d, answer: true, ...carried(part) }];
  }
  if (sum.key === 'remainder') return remainderSteps(sum);
  if (sum.n === 1) return [{ text: `Cut ${sum.of} into ${sum.d} equal parts.` }, ofAnswer(sum)];
  const part = found(sum, { text: `Cut ${sum.of} into ${sum.d} equal parts: ${sum.of} ÷ ${sum.d} = ☐ in each part`, value: sum.of / sum.d });
  return [part, { ...ofAnswer(sum), ...carried(part) }];
}
function tapeHint(sum) {
  if (sum.op === 'fdiv') return `Each ${SHARES[sum.thing].each} is cut into how many equal parts? How many parts does each person get?`;
  if (sum.op === 'fwhole') return 'How much is each part? How many parts make the whole?';
  if (sum.key === 'remainder') return `How much goes in each of the ${sum.d} parts, and what is left over to share?`;
  return sum.n === 1 ? `How many equal parts is ${sum.of} cut into? How much is in each part?` : `How much is in each of the ${sum.d} parts? How many of those parts do you need?`;
}

const fracTape = {
  op: 'fof', title: 'A tape diagram',
  fits: (sum) => OF_OPS.includes(sum?.op),
  steps: (sum) => keptOf(tapeSteps(sum)),
  picture: () => null,
  hint: tapeHint,
  words: (sum) => ['fraction', 'tape diagram', ...(sum.key === 'remainder' ? ['remainder', 'decimal'] : sum.op === 'fdiv' ? ['numerator', 'denominator'] : [])],
};

// ---- Divide, then multiply (frac-of): ÷ by the denominator, × by the numerator; backwards, ÷ by the numerator, × by the
// denominator; a share, the things divided by the people ----

function divideSteps(sum) {
  if (sum.op === 'fdiv') return [{ text: `Sharing is dividing: the ${SHARES[sum.thing].many} divided by the people.` }, ...shareAnswer(sum)];
  if (sum.op === 'fwhole') {
    const part = found(sum, { text: `÷ ${sum.n}: ${sum.part} ÷ ${sum.n} = ☐`, value: sum.part / sum.n });
    return [part, { text: so(`× ${sum.d}`, wholeClaim(sum)), value: part.value * sum.d, answer: true, ...carried(part) }];
  }
  if (sum.key === 'remainder') return remainderSteps(sum, true);
  // a unit fraction has no working step (plan F6)
  if (sum.n === 1) return [ofAnswer(sum, `÷ ${sum.d}`)];
  const part = found(sum, { text: `÷ ${sum.d}: ${sum.of} ÷ ${sum.d} = ☐`, value: sum.of / sum.d });
  return [part, { ...ofAnswer(sum, `× ${sum.n}`), ...carried(part) }];
}
function divideHint(sum) {
  if (sum.op === 'fdiv') return 'Sharing is dividing: which number is divided, and which does it divide by?';
  if (sum.op === 'fwhole') return `What do you divide ${sum.part} by, and then what do you multiply by?`;
  if (sum.key === 'remainder') return `What is ${sum.of} divided by ${sum.d}, and what happens to what is left over?`;
  return sum.n === 1 ? `What do you divide ${sum.of} by?` : `What do you divide ${sum.of} by, and then what do you multiply by?`;
}

const fracDivide = {
  op: 'fof', title: 'Divide, then multiply',
  fits: (sum) => OF_OPS.includes(sum?.op),
  steps: (sum) => keptOf(divideSteps(sum)),
  picture: () => null,
  hint: divideHint,
  words: (sum) => ['fraction', 'numerator', 'denominator', ...(sum.key === 'remainder' ? ['remainder', 'decimal'] : [])],
};

// ---- Cut in half, then again (frac-of): half of it, and half again for a quarter, only halves and quarters of an
// amount (the plan's "Halve, then halve again", whose "halve" the voice said "have", as the facts' way's was: engine/
// methods.js halve, "Cut in half"; the lead, step 2.5); named "Halving" where it stops, heard right, so the sentence
// reads as one (wontWork; as the line's, the lead's ruling 5); on a half, cut in half once, named "Cut in half", the facts
// way's name and its words (engine/methods.js wayTitle; the lead, pt62) ----

function halveSteps(sum) {
  const { n, d, of } = sum;
  // a half has no working step (plan F6)
  if (d === 2) return [ofAnswer(sum)];
  const half = { text: `Half of ${of} is ☐`, value: amount(of, 2) };
  if (n === 1) return [half, ofAnswer(sum, 'Half again')];
  // 3/4: the quarter found, then the 3 of them named with no box (the lead, the replay's point 4)
  const part = found(sum, { text: 'Half of that is ☐', value: amount(of, 4) });
  return [half, part, { ...ofAnswer(sum, `${n} lots of that`), ...carried(part) }];
}
function halveHint(sum) {
  if (sum.d === 2) return `What is half of ${sum.of}?`;
  return sum.n === 1 ? `What is half of ${sum.of}, and then half of that?` : `What is half of ${sum.of}, and half of that? How many quarters do you need?`;
}

const fracHalve = {
  op: 'fof', title: 'Cut in half, then again', refusedAs: 'Halving', namedAs: (sum) => (sum?.op === 'fof' && sum.d === 2 ? 'Cut in half' : null),
  fits: (sum) => sum?.op === 'fof' && [2, 4].includes(sum.d),
  stops(sum) {
    if (sum?.op === 'fdiv') return 'it shares an amount, and this divides one number by another';
    if (sum?.op === 'fwhole') return 'it finds a part of an amount, not the whole from a part';
    return sum?.op === 'fof' ? 'it finds halves and quarters, not fifths or tenths' : null;
  },
  steps: (sum) => keptOf(halveSteps(sum)),
  picture: () => null,
  hint: halveHint,
  words: () => ['fraction', 'half', 'quarter'],
};

export const FRACTION_WAYS = { 'frac-strip': fracStrip, 'frac-line': fracLine, 'frac-pieces': fracPieces, 'frac-half': fracHalf, 'frac-count': fracCount, 'frac-rename': fracRename,
  'frac-tape': fracTape, 'frac-divide': fracDivide, 'frac-halve': fracHalve };
