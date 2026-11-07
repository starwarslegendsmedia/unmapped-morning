// Fractions (stage 6 strand 2, plans/2026-10-25-stage-6-plan.md "Strand 2: fractions"): the generator of the fraction
// skills. A fraction is always text 'n/d' in whole numbers (engine/fractions.js), never a float; the ways that work them
// are in engine/fraction-ways.js.
//
// frac-parts, MA2-PF-01, "represents and compares halves, quarters, thirds and fifths as lengths on a number line and
// their related fractions formed by halving (eighths, sixths and tenths)" (Outcomes, saved copy 2026-10-10-1116-article-
// k-10-mathematics-k-10-syllabus-2022-outcomes.md l.182-184): "Model and represent unit fractions, and their multiples, to
// a complete whole on a number line" (l.42), "Model fractions with fraction strips and diagrams" (l.44), "Describe
// fraction families ... as having the same denominator" (l.45), "Determine the complementary fractional part needed to
// complete one whole (halves, quarters, eighths, thirds)" (l.46) and "Recreate the whole unit from a fractional part
// ( 1/2, 1/4 , 1/3 and 1/8)" (l.47), its Example read live 26 October 2026 ("If this is a quarter of the strip, how big
// is the whole strip?") (Stage 2 Partitioned fractions A, saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-
// syllabus-2022-fab1a01bf6.md, .../stage-2/fab1a01bf6); "Rename 2 halves, 3 thirds, 4 quarters, 5 fifths, 6 sixths, 8
// eighths and 10 tenths as one whole" (l.45), "Represent totals of halves, thirds, quarters and fifths that extend beyond
// one" (l.47) and "Determine the relative location of one-quarter and one-half when a number line extends beyond one"
// (l.48) (Stage 2 Partitioned fractions B, saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-
// fabf1cf43b.md, .../stage-2/fabf1cf43b).
// frac-unit-compare, MA3-RQF-01, "compares and orders fractions with denominators of 2, 3, 4, 5, 6, 8 and 10" (Outcomes
// l.262-264): "Compare halves and quarters of different sized wholes" (l.44), "Justify the need for fractions to refer to
// the number 1 as the common whole" (l.45), "Compare unit fractions as numbers to the benchmark value 1/2" (l.49) and
// "Compare and order unit fractions with denominators of 2, 3, 4, 5, 6, 8 and 10 by placing them on a number line"
// (l.50), its Examples read live 26 October 2026 ("Is 1/5 smaller or larger than 1/2?"; "Jake ate 1/4 of a cake and
// Kate ate 1/2 of a different cake") (Stage 3 Representing quantity fractions A, saved copy 2026-10-10-1117-article-k-10-
// mathematics-k-10-syllabus-2022-fac8227f10.md, .../stage-3/fac8227f10); the letters on a line marked only at 0, 1/2 and 1
// are the IES fractions guide's ("locate 6/7 on a number line marked with 0, 1/2, and 1", IES 2010 l.638).
// frac-addsub-same, MA3-RQF-01: "Represent the sum of fractions with the same denominator, recreating the whole, where the
// result may exceed one" (l.54), "Find the difference between fractions with the same denominator and interpret the
// answer" (l.55), "Solve word problems that involve fractions with the same denominator" (l.56) and "Use diagrams, objects
// and mental strategies to subtract a unit fraction from any whole number including 1 (the complement principle)"
// (l.57), its Examples read live 26 October 2026 ("Such as 7/8-2/8=5/8 means the difference is more than one-half."; "I
// eat 1/5 of a block of chocolate and you eat 3/5 of the same block. How much of the block of chocolate has been
// eaten?"; "4/5 + 3/5 = 7/5 = 1 2/5", so a sum past one is 1 and the rest) (Stage 3 Representing quantity fractions A).
// frac-equivalent, MA3-RQF-01: "Order common fractions with related denominators using diagrams and number lines" (l.48),
// "Subdivide the area of a rectangle by both length and width to represent the multiplicative relationship between
// common fractions" (l.49), "Compare and represent fractions with denominators of 2, 4 and 8; 3 and 6; 5 and 10 of a
// whole shape (area model) and a collection of objects (discrete model)" (l.50), "Create equivalent fractions for half in
// quarters, eighths, sixths and tenths by re-dividing the whole, using diagrams and number lines" (l.51) and "Record
// equivalent fractions using diagrams, words and fraction notation" (l.52), its Example read live 26 October 2026
// ("Subdividing a 2 by 3 rectangle to show sixths") (Stage 3 Representing quantity fractions B, saved copy
// 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fa1618803c.md, .../stage-3/fa1618803c); at the easy level
// "Represent fractions with the same-size whole to make valid comparisons (denominators of 2, 4 and 8 ...)" (Stage 2
// Partitioned fractions B l.41).
// frac-addsub-related, MA3-RQF-01: "Solve word problems involving adding or subtracting fractional quantities with
// related denominators" (l.60) and "Represent fractional quantities with the same or related denominators to add and
// subtract fractions" (l.61), with the related denominators of l.50 and l.51, its Example read live 26 October 2026 ("How
// much more is 3/4 than 3/8?") (Stage 3 Representing quantity fractions B); the estimate before it is the IES guide's
// (IES 2010 l.798-800, l.814), not NESA's.
// frac-of, MA3-RQF-02, "determines 1/2, 1/4, 1/5 and 1/10 of measures and quantities" (Outcomes l.266-268): "Calculate
// quarters and fifths of whole numbers that are multiples of the denominator, using a tape diagram" (l.65), "Solve word
// problems involving a fraction of a quantity" (l.66) and "Find 1/2, 1/4, 1/5 and 1/10 of collections, expressing
// remainders as decimals" (l.67); and MA3-RQF-01, "Identify how the relationship between the number being divided and the
// divisor is represented in a fraction" (l.44) and "Generate the whole quantity from non-unit fractional parts" (l.56),
// its Examples read live 26 October 2026 ("Find 2/5 of 30."; "If you are given three-fifths of a length of tape, how can
// you find the whole length?"; "Share 7 chocolate fingers equally between 4 people.") (Stage 3 Representing quantity
// fractions B); MA3-MR-02's "Recognise that division can be recorded using fractions" (plans/2026-10-25-nesa-audit.md l.71).
// NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 26 October 2026.
//
// Chosen for this game, not a syllabus requirement: the letters A, B and C, placed in any order along the line (the
// numbers they mark are always the same three on the quarter-half line, and the unit fraction asked is left of the other
// two on the estimate line whenever a half decides it, so letters left to right would often make the answer A); the
// cake shown as a strip; vs-half asked both ways round; the story contexts (CONTEXTS), each kind of story a third of the
// time; F4's compare and order within one family and never all unit fractions (those are frac-unit-compare's). Every
// problem is drawn from a list made once of every one the plan allows (plan, "Rules every fraction
// generator keeps"): the key first, each as often as the others; then its class where it has two (a compare with a half
// in 1 of 4, an estimate with both other letters past 1/2 in 1 of 3; F5's related pair, and its sub in the Example's
// words half the time; F6's whole from a part as a number or a length of tape); then a problem, each in its class as often
// as the others, and with opts.also only one both ways fit. F6's story contexts (AMOUNTS) and the things shared are
// chosen for this game too, and the share's things 2 to 4, so a strip a thing fits the picture's 4 rows (plan F6).

import { METHODS, wayFor, wayFits, methodsOf } from '../methods.js';
import { LETTERS, letterAt, namesOf, signOf, fracOf, fracText, cmpFrac, gcd, FRACTION_NAMES } from '../fractions.js';
import { sameWholeAnswer, relatedSum, fractionEstimate, SHARES, tapeOf, ofValue } from '../fraction-ways.js';
import { NAMES } from '../../content/word-problems/settings.js';

const NAMED = [2, 3, 4, 5, 6, 8, 10];

// the kinds of problem (plan F1 and F2, "Keys and asks"), and those of the easy level ("Sizes"), which the worked
// examples come from; a key asked for (opts.key) is made at the easy level too, with its smallest numbers
const KEYS = {
  'frac-parts': ['name', 'complement', 'whole', 'on-line', 'rename', 'beyond', 'quarter-half'],
  'frac-unit-compare': ['compare', 'vs-half', 'order', 'estimate', 'same-whole'],
  'frac-addsub-same': ['add', 'sub', 'difference', 'past-one', 'from-whole', 'story'],
  'frac-equivalent': ['half-in', 'missing', 'compare', 'order', 'area', 'collection'],
  'frac-addsub-related': ['add', 'sub', 'past-one', 'story'],
  'frac-of': ['unit-of', 'non-unit-of', 'remainder', 'division', 'build-whole', 'story'],
};
const EASY = {
  'frac-parts': ['name', 'on-line', 'rename'], 'frac-unit-compare': ['compare', 'vs-half'],
  'frac-addsub-same': ['add', 'sub'], 'frac-equivalent': ['half-in', 'missing'], 'frac-addsub-related': ['add'], 'frac-of': ['unit-of'],
};
// the denominators of each skill's easy level (F3 "with denominators 4 and 5"; F4 "2, 4 and 8 only")
const EASY_DS = { 'frac-addsub-same': [4, 5], 'frac-equivalent': [2, 4, 8] };
// the op of frac-unit-compare's sums, by key
const OP_OF = { compare: 'fcmp', 'vs-half': 'fcmp', 'same-whole': 'fcmp', order: 'ford', estimate: 'floc' };
const FAMILIES = [[2, 4, 8], [3, 6], [5, 10]];
// the related pairs of S3 RQF B l.50 (2 and 4, 2 and 8, 4 and 8; 3 and 6; 5 and 10), smaller first, and a half in sixths
// and tenths (l.51), a list of their own (step 2.3 review 12)
const FAMILY_PAIRS = [[2, 4], [2, 8], [4, 8], [3, 6], [5, 10]];
const HALF_ONLY = [[2, 6], [2, 10]];
const RELATED = [...FAMILY_PAIRS, ...HALF_ONLY];
// F5's easy pairs ("Easy: add with 2 and 4 or 4 and 8")
const RELATED_EASY = [[2, 4], [4, 8]];

// The story contexts (plan, "Rules every fraction generator keeps"), chosen for this game: a whole that is eaten,
// painted, planted, run, read or finished, with the denominators each is cut into; the block of chocolate is the
// Example's (Examples fac8227f10 l.59). No digits here: every number in a story is one the problem draws. food: a whole
// that can be given away, for a story of taking away. two: a story of two people told so the second part can never be
// the first run, read or painted again (the lead, pt61), the track in laps, which add, and the book read and the fence
// painted the first part, then the next.
export const CONTEXTS = [
  { id: 'pizza', noun: 'pizza', whole: 'a pizza', the: 'the pizza', ds: [4, 8], does: 'eats', did: 'ate', do: 'eat', been: 'eaten', food: true },
  { id: 'cake', noun: 'cake', whole: 'a cake', the: 'the cake', ds: [6, 8], does: 'eats', did: 'ate', do: 'eat', been: 'eaten', food: true },
  { id: 'fence', noun: 'fence', whole: 'a fence', the: 'the fence', ds: [5, 10, 2], does: 'paints', did: 'painted', do: 'paint', been: 'painted',
    two: { first: 'the first ', next: 'the next ', again: 'the fence' } },
  { id: 'garden', noun: 'garden bed', whole: 'a garden bed', the: 'the garden bed', ds: [3, 6, 2], does: 'plants', did: 'planted', do: 'plant', been: 'planted' },
  { id: 'track', noun: 'track', whole: 'a track', the: 'the track', ds: [4, 8, 2], does: 'runs', did: 'ran', do: 'run', been: 'run',
    two: { whole: 'a lap', again: 'a lap', ask: 'How much of a lap did they run altogether?' } },
  { id: 'book', noun: 'book', whole: 'a book', the: 'the book', ds: [10, 5, 2], does: 'reads', did: 'read', do: 'read', been: 'read',
    two: { first: 'the first ', next: 'the next ', again: 'the book' } },
  { id: 'puzzle', noun: 'puzzle', whole: 'a puzzle', the: 'the puzzle', ds: [4, 8], does: 'finishes', did: 'finished', do: 'finish', been: 'finished' },
  { id: 'chocolate', noun: 'block', whole: 'a block of chocolate', the: 'the block of chocolate', ds: [5], does: 'eats', did: 'ate', do: 'eat', been: 'eaten', food: true },
];
// the kinds of story: adding as the Example tells it (two people, one whole) and as one person in the morning and more
// after lunch, giving some away, and how much more; each its sum's op
const STORY_OP = { two: 'f+', more: 'f+', away: 'f−', 'more-than': 'f−' };
// the contexts cut into every denominator of a story (two, when they are related)
const contextsFor = (kind, ...ds) => CONTEXTS.filter((c) => ds.every((d) => c.ds.includes(d)) && (kind !== 'away' || c.food));
// and for a fraction of an amount (frac-of): a collection, or metres of ribbon or rope, the unit said "metres" as the
// decimal stories' answers are (plan "Rules every fraction generator keeps"); its unit the things, or metres for a length
export const AMOUNTS = ['stickers', 'beads', 'shells', 'marbles', 'cards', 'apples'].map((id) => ({ id, things: id }))
  .concat(['ribbon', 'rope'].map((id) => ({ id, length: id })));

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
function permutations(list) {
  if (list.length <= 1) return [list];
  return list.flatMap((x, i) => permutations([...list.slice(0, i), ...list.slice(i + 1)]).map((p) => [x, ...p]));
}
function choose(list, k) {
  if (!k) return [[]];
  return list.flatMap((x, i) => choose(list.slice(i + 1), k - 1).map((c) => [x, ...c]));
}
const unit = (d) => `1/${d}`;
const value = (t) => fracOf(t);
// two letters on a line from 0 to 1, 316 px long as drawn (engine/render/svg.js fracline), at least 26 px apart, in
// whole numbers: |a − b| × 316 ≥ 26
const apart = (s, t) => {
  const a = value(s), b = value(t);
  return Math.abs(a.n * b.d - b.n * a.d) * 316 >= 26 * a.d * b.d;
};
// the fractions an estimate's other two letters may be at: denominators 3 to 10 that the outcomes name, never a unit
// fraction in value and never 1/2 (so 2/6, 3/6 and 4/8 are not among them), each value once, in lowest terms
const OTHERS = NAMED.filter((d) => d >= 3).flatMap((d) => range(2, d - 1).filter((n) => gcd(n, d) === 1).map((n) => fracText(n, d)));

// F3's problems (plan F3, "Sizes"): denominators 3, 4, 5, 6, 8 and 10 (with halves the only sum is 1/2 + 1/2, a whole),
// every numerator 1 to d − 1, a sum or difference never 0 and, but past one, never a whole; a key asked for at the easy
// level with its denominators there, 4 and 5, where it has any
const ADDSUB_DS = [3, 4, 5, 6, 8, 10];
function addsubClasses(key, easy) {
  const at = (ds) => {
    const small = ds.filter((d) => EASY_DS['frac-addsub-same'].includes(d));
    return easy && small.length ? small : ds;
  };
  const sum = (op, a, b, more = {}) => ({ op, key, a, b, form: 'fraction', ...more });
  const pairs = (ds, ok) => at(ds).flatMap((d) => range(1, d - 1).flatMap((A) => range(1, d - 1).filter((B) => ok(A, B, d)).map((B) => [fracText(A, d), fracText(B, d)])));
  const one = (sums) => [{ name: key, weight: 1, sums }];
  if (key === 'add') return one(pairs(ADDSUB_DS, (A, B, d) => A + B <= d - 1).map(([a, b]) => sum('f+', a, b)));
  if (key === 'sub') return one(pairs(ADDSUB_DS, (A, B) => A > B).map(([a, b]) => sum('f−', a, b)));
  // how much more half the time, and half the time the Example's "Is the difference more or less than one-half?",
  // its denominators even so one-half is a whole number of parts, never a difference of exactly one-half
  if (key === 'difference') {
    return [{ name: 'how much more', weight: 1, sums: pairs(ADDSUB_DS, (A, B) => A > B).map(([a, b]) => sum('f−', a, b)) },
      { name: 'more or less than one-half', weight: 1, sums: pairs([4, 6, 8, 10], (A, B, d) => A > B && 2 * (A - B) !== d).map(([a, b]) => sum('f−', a, b, { half: true })) }];
  }
  // past one from d + 1 to 2d − 2 parts (4 thirds only), every one 1 and the rest
  if (key === 'past-one') return one(pairs(ADDSUB_DS, (A, B, d) => A + B >= d + 1 && A + B <= 2 * d - 2).map(([a, b]) => sum('f+', a, b, { form: 'whole-and' })));
  // a unit fraction from a whole number (S3 RQF A l.57, "including 1"): from 1 half the time, a fraction answer, and from
  // 2 to 5 half the time, 2 and the rest
  if (key === 'from-whole') {
    return [{ name: 'the whole 1', weight: 1, sums: at(NAMED).map((d) => sum('f−', '1', unit(d))) },
      { name: 'the whole 2 to 5', weight: 1, sums: at(NAMED).flatMap((d) => range(2, 5).map((w) => sum('f−', String(w), unit(d), { form: 'whole-and' }))) }];
  }
  // a story: adding (two kinds), giving away and how much more, each a third of the time, of a denominator some context of
  // its kind is cut into, never past one (two people's parts of one whole together at most the whole); the context and
  // the names drawn after
  return Object.entries({ two: 1, more: 1, away: 2, 'more-than': 2 }).map(([kind, weight]) => ({ name: kind, weight,
    sums: pairs(ADDSUB_DS, (A, B, d) => contextsFor(kind, d).length > 0 && (STORY_OP[kind] === 'f+' ? A + B <= d - 1 : A > B && (kind === 'away' || A + B <= d)))
      .map(([a, b]) => sum(STORY_OP[kind], a, b, { story: { kind } })) }));
}

// F4's problems (plan F4, "Sizes"): the related denominators of S3 RQF B l.50 and a half in quarters, sixths, eighths and
// tenths (l.51), every numerator 1 to d − 1; at the easy level 2, 4 and 8 only (S2 PF B l.41's first list)
function equivalentClasses(key, easy) {
  const ok = (...ds) => !easy || ds.every((d) => EASY_DS['frac-equivalent'].includes(d));
  const fequ = (a, d2) => ({ op: 'fequ', key, a, d2 });
  const one = (sums) => [{ name: key, weight: 1, sums }];
  if (key === 'half-in') return one([4, 6, 8, 10].filter((d2) => ok(d2)).map((d2) => fequ('1/2', d2)));
  if (key === 'missing') {
    // forwards, the given numerator 2 to d − 1, never 1, since the cut would be the answer; the other way ("☐/4 = 6/8"),
    // the given numerator a whole number of the larger parts, and never the answer the joining count
    const pairs = FAMILY_PAIRS.filter(([d, d2]) => ok(d, d2));
    return [{ name: 'forwards', weight: 1, sums: pairs.flatMap(([d, d2]) => range(2, d - 1).map((n) => fequ(fracText(n, d), d2))) },
      { name: 'the other way', weight: 1, sums: pairs.flatMap(([d2, d]) => range(2, d - 1).filter((n) => n % (d / d2) === 0 && n !== (d / d2) ** 2).map((n) => fequ(fracText(n, d), d2))) }];
  }
  // the area model: columns the given denominator, rows what cuts each column; no answer that is the rows' or the columns'
  // count the question gives (so the Example's own 1/3 of the 2 by 3 rectangle is left out, and its 2/3 kept)
  if (key === 'area') {
    return one(RELATED.filter(([d, d2]) => ok(d, d2)).flatMap(([d, d2]) => range(1, d - 1).filter((n) => ![d2 / d, d].includes((n * d2) / d)).map((n) => fequ(fracText(n, d), d2))));
  }
  // the discrete model: 2 rows of dots, a column one part of the smaller denominator, shaded by whole columns; never 2
  // columns shaded, since the dots in a column, 2, the working step's, would be the answer
  if (key === 'collection') {
    return one([4, 6, 8, 10].filter((d) => ok(d, d / 2)).flatMap((d) => range(1, d / 2 - 1).filter((m) => m !== 2).map((m) => fequ(fracText(2 * m, d), d / 2))));
  }
  // compare and order: one family, more than one size of parts, never all unit fractions (frac-unit-compare's), every value
  // in an order different and never shown already in order
  const texts = (fam) => fam.flatMap((d) => range(1, d - 1).map((n) => fracText(n, d)));
  const mixed = (vs) => new Set(vs.map((t) => value(t).d)).size >= 2 && !vs.every((t) => value(t).n === 1);
  const fams = FAMILIES.filter((f) => ok(...f));
  // sixths first and equal ("2/6 = 1/3") asked too: "sixths is," is said "sixths, is," and heard right (tools/pieces.mjs
  // SAY, step 2.3 Do 6; review 10)
  if (key === 'compare') return one(fams.flatMap((f) => texts(f).flatMap((a) => texts(f).filter((b) => mixed([a, b])).map((b) => ({ op: 'fcmp', key, a, b })))));
  const apart3 = (set) => set.every((x, i) => set.every((y, j) => j <= i || cmpFrac(x, y) !== 0));
  return one(fams.flatMap((f) => choose(texts(f), 3).filter((set) => mixed(set) && apart3(set)).flatMap(permutations)
    .filter((values) => values.some((v, i) => i && cmpFrac(values[i - 1], v) > 0)).map((values) => ({ op: 'ford', key, values }))));
}

// F5's problems (plan F5, "Sizes"): the related pairs of S3 RQF B l.50 and l.51, each its own class so each is drawn as
// often as the others (sub's two, the sum and the Example's "How much more …?", half the time each); either fraction
// first, every numerator 1 to d − 1, the answer in the larger denominator, never 0 and never a whole; add and every story
// under 1, past one between 1 and 2. At the easy level 2 and 4 or 4 and 8.
const inParts = (t, D) => (value(t).n * D) / value(t).d;
function relatedClasses(key, easy) {
  const sum = (op, a, b, more = {}) => ({ op, key, a, b, form: 'fraction', ...more });
  const name = ([d, D]) => `${d} and ${D}`;
  // every two fractions of a pair, either first, with their parts in the larger denominator
  const twos = ([d, D], ok) => [[d, D], [D, d]].flatMap(([x, y]) => range(1, x - 1).flatMap((m) => range(1, y - 1).map((n) => [fracText(m, x), fracText(n, y)])))
    .filter(([a, b]) => ok(inParts(a, D), inParts(b, D), D));
  const pairs = easy ? RELATED_EASY : RELATED;
  // a pair a key has no problem in after the exclusions below is no class of it: sub in thirds and sixths, whose every
  // estimate is 0 or the answer, or says her box (5/6 − 2/3 = 1/6, "1 − 1/2 = 1/2"). At the easy level the problems are
  // drawn evenly, the pairs together, since 2 and 4 has one sum only and would be half of them (step 2.4 review 2; the
  // plan's equal pairs are its usual problems')
  const merge = (classes) => [...new Set(classes.map((c) => c.name.replace(/^\d+ and \d+(, )?/, '')))]
    .map((tail) => ({ name: tail || key, weight: 1, sums: classes.filter((c) => c.name.replace(/^\d+ and \d+(, )?/, '') === tail).flatMap((c) => c.sums) }));
  const each = (make) => {
    const classes = pairs.flatMap((pair) => make(pair)).map((c) => ({ ...c, sums: c.sums.filter(fair) })).filter((c) => c.sums.length);
    return easy ? merge(classes) : classes;
  };
  if (key === 'add') return each((p) => [{ name: name(p), weight: 1, sums: twos(p, (A, B, D) => A + B <= D - 1).map(([a, b]) => sum('f+', a, b)) }]);
  if (key === 'sub') {
    return each((p) => [{ name: name(p), weight: 1, sums: twos(p, (A, B) => A > B).map(([a, b]) => sum('f−', a, b)) },
      { name: `${name(p)}, how much more`, weight: 1, sums: twos(p, (A, B) => A > B).map(([a, b]) => sum('f−', a, b, { more: true })) }]);
  }
  // past one, every one 1 and the rest, as F3's
  if (key === 'past-one') return each((p) => [{ name: name(p), weight: 1, sums: twos(p, (A, B, D) => A + B >= D + 1).map(([a, b]) => sum('f+', a, b, { form: 'whole-and' })) }]);
  // a story as F3's (two people, one person in the morning and more after lunch, giving some away, how much more), in a
  // context cut into both its parts, never past one; every kind in a pair as often as its problems. Giving away needs a
  // food cut into both, the pizza's quarters and eighths only; how much more, its two parts of one whole together at most
  // the whole, has none left after the exclusions (the larger rounds to 1 only when the smaller rounds to 0, or makes an
  // estimate of the answer)
  return each((p) => [{ name: name(p), weight: 1, sums: Object.keys(STORY_OP).filter((kind) => contextsFor(kind, ...p).length)
    .flatMap((kind) => twos(p, (A, B, D) => (STORY_OP[kind] === 'f+' ? A + B <= D - 1 : A > B && (kind === 'away' || A + B <= D))).map(([a, b]) => sum(STORY_OP[kind], a, b, { story: { kind } }))) }]);
}
// F5's exclusions (plan F5, "The estimate first", and "Rules every fraction generator keeps"): a problem is left out when
// either fraction rounds to 0 (1/8 + 1/2 would be "0 + 1/2", which says nothing), when its estimate is 0, or the answer
// itself (a step with no box would say it); and when a step before the answer gives it: a fraction in the estimate equal to
// it, a whole number in the estimate or the renaming's cut ("8 ÷ 4 = 2") that is her box and that the question does not
// show (the 1 of "1 + ☐/8" is its own), or the renaming's box equal to hers
function fair(sum) {
  const D = Math.max(value(sum.a).d, value(sum.b).d), [A, B] = [sum.a, sum.b].map((t) => inParts(t, D));
  const total = sum.op === 'f+' ? A + B : A - B;
  const box = sum.key === 'past-one' ? total - D : total;
  const { values, about } = fractionEstimate(sum), said = [...values, about];
  if (said.some((v) => v.n <= 0) || cmpFrac(about, { n: total, d: D }) === 0) return false;
  if (said.some((v) => cmpFrac(v, { n: box, d: D }) === 0)) return false;
  const shown = [value(sum.a), value(sum.b)].flatMap((f) => [f.n, f.d]).concat(sum.key === 'past-one' ? [1] : []);
  // the whole numbers the estimate says: 1, 2, and the 1 of "1 and a half"
  const wholes = said.map((v) => (2 * v.n) / v.d).map((h) => (h - (h % 2)) / 2).filter((w) => w > 0);
  const s = value(sum.a).d < value(sum.b).d ? value(sum.a) : value(sum.b), cut = D / s.d;
  return ![...wholes, cut].some((w) => w === box && !shown.includes(w)) && s.n * cut !== box;
}

// F6's problems (plan F6, "Sizes"): a fraction of an amount a multiple of its denominator, 2 to 12 lots of it (2 to 5 at
// the easy level, never d lots of a unit fraction), the unit fractions of the outcome and quarters and fifths that are
// not, never 2/4, whose half would be the answer; a remainder 1/2, 1/4, 1/5 or 1/10 of 11 to 49 that is not a multiple of it; a share of 2 to 4 things between
// 2, 3, 4, 5, 6, 8 or 10 people, never as many as the people, never a whole share, so past one only 3 between 2 and 4
// between 3; the whole from quarters, eighths, thirds, sixths, fifths or tenths, a numerator 2 to d − 1, the whole at most
// 100 and 2 lots of d or more (so 1 part is never 1), as a number or a length of tape each half the time; a story as the
// fractions of an amount. A key asked for at the easy level takes its smallest numbers
const OF_UNIT = [[1, 2], [1, 4], [1, 5], [1, 10]];
const OF_NON_UNIT = [[3, 4], [2, 5], [3, 5], [4, 5]];
function ofClasses(key, easy) {
  const one = (sums) => [{ name: key, weight: 1, sums }];
  // never d lots of a unit fraction (1/4 of 16), whose cut, "Cut 16 into 4 equal parts.", would say the answer
  const amounts = (fracs) => fracs.flatMap(([n, d]) => range(2, easy ? 5 : 12).filter((k) => n > 1 || k !== d).map((k) => ({ op: 'fof', key, n, d, of: k * d })));
  const units = easy ? OF_UNIT.slice(0, 2) : OF_UNIT;
  if (key === 'unit-of') return one(amounts(units));
  if (key === 'non-unit-of') return one(amounts(OF_NON_UNIT));
  if (key === 'story') return one(amounts(easy ? units : [...OF_UNIT, ...OF_NON_UNIT]));
  if (key === 'remainder') return one(units.flatMap(([, d]) => range(11, 49).filter((of) => of % d).map((of) => ({ op: 'fof', key, n: 1, d, of }))));
  if (key === 'division') return one(range(2, 4).flatMap((a) => NAMED.filter((b) => b !== a && a % b !== 0).map((b) => ({ op: 'fdiv', key, a, b }))));
  const sums = (easy ? [3, 4] : [4, 8, 3, 6, 5, 10]).flatMap((d) => range(2, d - 1).flatMap((n) => range(2, easy ? 5 : Math.floor(100 / d)).map((k) => ({ op: 'fwhole', key, n, d, part: n * k }))));
  return [{ name: 'a number', weight: 1, sums }, { name: 'a length of tape', weight: 1, sums: sums.map((x) => ({ ...x, tape: true })) }];
}

// every problem of a skill's key at a level, in its classes: [{ name, weight, sums }]
function classesOf(skillId, key, easy) {
  if (skillId === 'frac-of') return ofClasses(key, easy);
  if (skillId === 'frac-addsub-same') return addsubClasses(key, easy);
  if (skillId === 'frac-addsub-related') return relatedClasses(key, easy);
  if (skillId === 'frac-equivalent') return equivalentClasses(key, easy);
  const fpart = (more) => ({ op: 'fpart', key, ...more });
  const one = (sums) => [{ name: key, weight: 1, sums }];
  if (skillId === 'frac-parts') {
    const ds = (usual) => (easy ? [2, 4] : usual);
    if (key === 'name' || key === 'on-line') return one(ds(NAMED).flatMap((d) => range(1, d - 1).map((n) => fpart({ n, d }))));
    if (key === 'complement') return one(ds([2, 3, 4, 8]).flatMap((d) => range(1, d - 1).map((n) => fpart({ n, d }))));
    // whole: three lengths from d − 2 to d + 2 parts, never under 1, the whole strip the shortest, the middle or the
    // longest each a third of the time (review 3), so neither its place nor its length tells her which it is
    if (key === 'whole') {
      const at = (d, place) => choose(range(Math.max(1, d - 2), d + 2).filter((k) => k !== d), 2)
        .filter(([x, y]) => (place === 0 ? x > d : place === 1 ? x < d && y > d : y < d)).flatMap(([x, y]) => permutations([x, d, y]).map((strips) => fpart({ n: 1, d, strips })));
      return ['shortest', 'middle', 'longest'].map((name, place) => ({ name, weight: 1, sums: ds([2, 3, 4, 8]).flatMap((d) => at(d, place)) }));
    }
    if (key === 'rename') return one(ds(NAMED).flatMap((d) => ['whole', 'parts'].map((form) => fpart({ n: d, d, form }))));
    if (key === 'beyond') return one(ds([2, 3, 4, 5]).flatMap((d) => range(d + 1, 2 * d - 1).map((n) => fpart({ n, d }))));
    // asked 1/2, its letters at 1/2, 1 and 3/2 or at 1/4, 1/2 and 1, each half the time, so its letter is not always the
    // leftmost (review 2); asked 1/4, at 1/4, 1/2 and 5/4. The trap is the line's middle, 1, and for 1/4 also 1/2, a
    // quarter of the whole line; asked 1/2 and asked 1/4 each half the time
    const lettered = (n, d, sets) => sets.flatMap((at) => permutations(at).map((letters) => fpart({ n, d, letters })));
    return [{ name: 'asked 1/2', weight: 1, sums: lettered(1, 2, [['1/2', '1/1', '3/2'], ['1/4', '1/2', '1/1']]) },
      { name: 'asked 1/4', weight: 1, sums: lettered(1, 4, [['1/4', '1/2', '5/4']]) }];
  }
  const op = OP_OF[key];
  if (key === 'compare') {
    const pairs = (ds) => ds.flatMap((a) => ds.filter((b) => b !== a).map((b) => ({ op, key, a: unit(a), b: unit(b) })));
    if (easy) return one(pairs([2, 3, 4, 5]));
    const all = pairs(NAMED);
    return [{ name: 'with a half', weight: 1, sums: all.filter((s) => s.a === '1/2' || s.b === '1/2') },
      { name: 'no half', weight: 3, sums: all.filter((s) => s.a !== '1/2' && s.b !== '1/2') }];
  }
  // half asked the Example's way, "Is 1/5 smaller or larger than 1/2?", and half turned round, "Is 1/2 smaller or larger than
  // 1/5?" (round 2, the lead's decision), so the answer is not always "smaller"
  if (key === 'vs-half') return one((easy ? [3, 4, 5] : NAMED.filter((d) => d > 2)).flatMap((d) => [{ op, key, a: unit(d), b: '1/2' }, { op, key, a: '1/2', b: unit(d) }]));
  if (key === 'order') {
    // all different, never already smallest first
    return one(choose(NAMED, easy ? 3 : 4).flatMap((set) => permutations(set.map(unit))).filter((values) => values.some((v, i) => i && cmpFrac(values[i - 1], v) > 0))
      .map((values) => ({ op, key, values })));
  }
  if (key === 'estimate') {
    // The letters at the unit fraction asked and two others, every two at least 26 px apart, none equal to it, none 1/2.
    // Its place spread (review 1, the lead's decisions): leftmost, both others past 1/2, so a half decides it; in the
    // middle, one of them a unit fraction smaller than it; rightmost, both of them, which fits only 1/3 asked (two smaller
    // unit fractions 26 px apart fit only below it). 1/6, 1/8 and 1/10 have nothing 26 px to their left, so they are
    // always leftmost, the sense of size the key teaches. Each class's weight, in hundredths, keeps each denominator
    // asked 10% to 25%, the asked letter leftmost at most half the time (38%) and rightmost at least 1 in 10 (14%).
    const at = (d, place) => {
      const small = NAMED.filter((e) => e > d).map(unit), past = OTHERS.filter((t) => cmpFrac(t, '1/2') > 0);
      const pairs = place === 'left' ? choose(past, 2) : place === 'middle' ? small.flatMap((e) => OTHERS.map((t) => [e, t])) : choose(small, 2);
      return pairs.filter(([x, y]) => apart(x, y) && apart(unit(d), x) && apart(unit(d), y))
        .flatMap((o) => permutations([unit(d), ...o]).map((letters) => ({ op, key, at: unit(d), letters, wholes: 1, d: 2 })));
    };
    const WEIGHTS = easy ? [[3, 'right', 1], [3, 'middle', 1], [4, 'middle', 1], [4, 'left', 1], [5, 'middle', 1], [5, 'left', 1]]
      : [[3, 'right', 14], [3, 'middle', 9], [4, 'middle', 20], [5, 'middle', 19], [6, 'left', 12], [8, 'left', 13], [10, 'left', 13]];
    return WEIGHTS.map(([d, place, weight]) => ({ name: `1/${d} ${place}`, weight, sums: at(d, place) }));
  }
  // same-whole: the half's cake against the quarter's, 1 : 3 (the quarter longer), 1 : 2 (the same) or 2 : 3 (the half
  // longer), lengths given as [the quarter's, the half's]; the two names drawn after
  return one([[3, 1], [2, 1], [3, 2]].map((lengths) => ({ op, key, a: '1/4', b: '1/2', lengths })));
}
const MEMO = new Map(), KEPT = new Map();
export function problemsOf(skillId, key, easy) {
  if (!KEYS[skillId]?.includes(key)) throw new Error(`${skillId} has no kind of problem ${key}`);
  const at = `${skillId}:${key}:${Boolean(easy)}`;
  if (!MEMO.has(at)) MEMO.set(at, classesOf(skillId, key, Boolean(easy)));
  return MEMO.get(at);
}

// a story's two people, drawn after its numbers: the giver, then a receiver who is not the giver (pct-of's too,
// engine/items/percentages.js)
export function twoNames(rng) {
  const first = rng.pick(NAMES);
  return [first, rng.pick(NAMES.filter((x) => x !== first))];
}
// a fraction of an amount's story (F6's, and pct-of's): its context, its names, and the unit its answer is in, the things
// or metres for a length
export const storyOf = (c, names) => ({ context: c.id, unit: c.length ? 'metres' : c.things, names });
// F6's share's things, and its story's names, context and the unit its answer is in, drawn after its numbers
function toldOf(sum, rng) {
  if (sum.op === 'fdiv') return { ...sum, thing: rng.pick(Object.keys(SHARES)) };
  const people = twoNames(rng);
  return { ...sum, story: storyOf(rng.pick(AMOUNTS), people) };
}

// A problem drawn from a generator's lists (plan, "Rules every fraction generator keeps"; the percentages' generator,
// engine/items/percentages.js, draws by it too): the key asked for, else drawn from the level's keys (levelKeys; of the
// kind of sum asked, opts.op, and with problems both ways fit, opts.also); then its class by weight, of those with a
// problem the ways fit; then a problem. problemsOf(skillId, key, easy) is the generator's own lists, and kept a Map of
// its own where the classes the ways fit are kept. { key, sum }
export function drawSum(skillId, rng, easy, opts, { levelKeys, problemsOf: listed, kept: cache }) {
  const ways = opts.also ? [opts.method, opts.also].filter((w) => methodsOf(skillId).includes(w)) : [];
  // a kind of sum asked for (opts.op) only where no key is, and only where a key has it: a story adds or takes away, so
  // a key's sums may differ in op
  let op = opts.key ? null : opts.op;
  // the classes both ways fit, worked out once for each skill, key, level, kind of sum and pair of ways (review 9)
  const kept = (key) => {
    const at = `${skillId}:${key}:${easy}:${op}:${ways.join('+')}`;
    const fit = (s) => (!op || s.op === op) && ways.every((w) => wayFits(w, s));
    if (!cache.has(at)) cache.set(at, listed(skillId, key, easy).map((c) => ({ ...c, sums: c.sums.filter(fit) })).filter((c) => c.sums.length));
    return cache.get(at);
  };
  let key = opts.key;
  if (!key) {
    const keys = levelKeys.filter((k) => kept(k).length);
    if (!keys.length) op = null;
    key = rng.pick(keys.length ? keys : levelKeys);
  }
  const classes = kept(key);
  if (!classes.length) throw new Error(`${skillId} has no ${key} problem that fits ${ways.join(' and ')}`);
  let pick = rng.next() * classes.reduce((t, c) => t + c.weight, 0);
  const cls = classes.find((c) => (pick -= c.weight) < 0) ?? classes.at(-1);
  return { key, sum: rng.pick(cls.sums) };
}

// a problem: drawn (drawSum), then told: a share's things, a story's context and names
function sumFor(skillId, rng, easy, opts) {
  // a share or a story asked as the plan writes its sum, with no thing or no context, drawn as for a new problem (step
  // 2.5 review finding 2)
  const s = opts.sum;
  if (s && ((s.op === 'fdiv' && !s.thing) || (s.op === 'fof' && s.key === 'story' && !s.story?.context))) return toldOf(s, rng);
  if (s) return s;
  const { key, sum } = drawSum(skillId, rng, easy, opts, { levelKeys: (easy ? EASY : KEYS)[skillId], problemsOf, kept: KEPT });
  if (sum.op === 'fdiv' || (sum.op === 'fof' && key === 'story')) return toldOf(sum, rng);
  if (key !== 'same-whole' && key !== 'story') return sum;
  const people = twoNames(rng);
  if (key === 'same-whole') return { ...sum, names: people };
  // a story's context, one cut into its parts (and for giving away, one that can be given), drawn after its numbers
  const context = rng.pick(contextsFor(sum.story.kind, value(sum.a).d, value(sum.b).d)).id;
  return { ...sum, story: { ...sum.story, context, names: people } };
}

// the question, its words, its answer and its picture, from the sum alone, so the same sum makes the same problem
// whichever way works it; a question with no picture of its own shows the way's (marked working, so only in the worked
// steps, js/runner.js asked)
const choice = (options, v) => ({ kind: 'choice', options, value: v });
const marked = (letters) => letters.map((t, i) => ({ ...value(t), label: LETTERS[i] }));
// two strips, one for each fraction, each shaded as given, so the sum's parts are never shaded together (plan F3, "Picture")
const twoStrips = (a, b) => ({ type: 'strips', rows: [a, b].map((t) => ({ d: value(t).d, shaded: value(t).n })) });
const HALF_OPTIONS = ['more than one-half', 'less than one-half'];
// a story as she reads it: two sentences, one amount each, then its question (plan F3, "Attention": "a story is two
// sentences before its question")
function storyAsk({ a, b, story }) {
  const c = CONTEXTS.find((x) => x.id === story.context), [p, q] = story.names;
  if (story.kind === 'two') {
    const t = c.two ?? {};
    return `${p} ${c.does} ${t.first ?? ''}${a} of ${t.whole ?? c.whole}. ${q} ${c.does} ${t.next ?? ''}${b} of ${t.again ?? `the same ${c.noun}`}. ${t.ask ?? `How much of ${c.the} has been ${c.been}?`}`;
  }
  if (story.kind === 'more') return `${p} ${c.did} ${a} of ${c.the} in the morning. ${p} ${c.did} ${b} more after lunch. How much of ${c.the} did ${p} ${c.do}?`;
  if (story.kind === 'away') return `${p} had ${a} of ${c.whole}. ${p} gave ${b} of ${c.the} to ${q}. How much of ${c.the} did ${p} have left?`;
  return `${p} ${c.did} ${a} of ${c.the}. ${q} ${c.did} ${b} of the same ${c.noun}. How much more did ${p} ${c.do} than ${q}?`;
}
function addsubProblem(sum) {
  const { key, a, b } = sum;
  // with related denominators the answer is in the larger, as the steps work it, never simplified (plan, "The fraction
  // answer, exactly"), and only a story has a picture on the question: renaming is the first step (plan F5, "Picture")
  const related = relatedSum(sum);
  const d = related ? Math.max(value(a).d, value(b).d) : value(b).d, names = namesOf(d);
  const [A, B] = related ? [inParts(a, d), inParts(b, d)] : [value(a).n, value(b).n];
  const answer = { kind: 'fraction', n: sum.op === 'f+' ? A + B : A - B, d };
  const picture = related && key !== 'story' ? undefined : twoStrips(a, b);
  if (key === 'add') return { ask: `${a} + ${b} = ☐/☐`, say: `What is ${a} plus ${b}?`, answer, picture };
  // F5's sub half the time in the Example's words (Examples fa1618803c l.77)
  if (key === 'sub' && sum.more) return { ask: `How much more is ${a} than ${b}?`, say: `How much more is ${a} than ${b}?`, answer, picture };
  if (key === 'sub') return { ask: `${a} − ${b} = ☐/☐`, say: `What is ${a} take away ${b}?`, answer, picture };
  if (key === 'difference' && sum.half) {
    const ask = `${a} − ${b} = ${fracText(A - B, d)}. Is the difference more or less than one-half?`;
    return { ask, say: ask, answer: choice(HALF_OPTIONS, HALF_OPTIONS[2 * (A - B) > d ? 0 : 1]), picture };
  }
  if (key === 'difference') return { ask: `How much more is ${a} than ${b}?`, say: `How much more is ${a} than ${b}?`, answer, picture };
  if (key === 'past-one') return { ask: `${a} + ${b} = 1 + ☐/${d}`, say: `${a} plus ${b} is 1 and how many ${names}?`, answer: { kind: 'number', value: A + B - d }, picture };
  if (key === 'from-whole') {
    if (a === '1') return { ask: `1 − ${b} = ☐/☐`, say: `What is 1 take away ${b}?`, answer: { kind: 'fraction', n: d - 1, d } };
    return { ask: `${a} − ${b} = ${A - 1} + ☐/${d}`, say: `${a} take away ${b} is ${A - 1} and how many ${names}?`, answer: { kind: 'number', value: d - 1 } };
  }
  const ask = storyAsk(sum);
  return { ask, say: ask, answer, picture };
}
function equivalentProblem(sum) {
  const { key, a, d2 } = sum;
  const { n, d } = value(a), names = namesOf(d2), answer = { kind: 'number', value: (n * d2) / d };
  if (key === 'area') {
    const ask = `This rectangle is cut into ${d} columns, then into ${d2 / d} rows. ${a} = ☐/${d2}`;
    return { ask, say: `This rectangle is cut into ${d} columns, then into ${d2 / d} rows. How many ${names} make ${a}?`, answer,
      picture: { type: 'fracarea', cols: d, rows: d2 / d, shaded: n } };
  }
  if (key === 'collection') {
    return { ask: `${n} of the ${d} dots are shaded. ${a} = ☐/${d2}`, say: `${n} of the ${d} dots are shaded. How many ${names} make ${a}?`, answer,
      picture: { type: 'array', rows: 2, cols: d2, shaded: n } };
  }
  // missing the other way round, the box on the left with the smaller denominator: "☐/4 = 6/8"
  return { ask: d2 < d ? `☐/${d2} = ${a}` : `${a} = ☐/${d2}`, say: `How many ${names} make ${a}?`, answer };
}
// a story of a fraction of an amount given away, the part given as she reads it ('3/4', and pct-of's '25%'): the plan's
// "How many did she give?", the giver named, since the names are anyone's; a length asked in metres
export function ofStoryAsk(story, of, part) {
  const c = AMOUNTS.find((x) => x.id === story.context), [p, q] = story.names;
  return c.length ? `${p} had ${of} metres of ${c.length} and gave ${part} of it to ${q}. How many metres did ${p} give?`
    : `${p} had ${of} ${c.things} and gave ${part} of them to ${q}. How many did ${p} give?`;
}
// F6's asks (plan F6, "Keys and asks"): "3/4 of 24 = ☐"; a story of a collection or of metres given away, two parts
// then its question; the whole from a part, as a number or a length of tape; a share in the Example's words, under one
// answered ☐/☐ and past one in the whole-and form. The tape on every one but a share, whose strips are a strip a thing
function ofProblem(sum) {
  if (sum.op === 'fdiv') {
    const { a, b } = sum, t = SHARES[sum.thing], first = `Share ${a} ${t.many} equally between ${b} people.`;
    const picture = { type: 'strips', rows: Array.from({ length: a }, () => ({ d: b })) };
    if (a < b) return { ask: `${first} How much does each person get?`, say: `${first} How much does each person get?`, answer: { kind: 'fraction', n: a, d: b }, picture };
    return { ask: `${first} Each person gets 1 + ☐/${b} of a ${t.one}.`, say: `${first} Each person gets 1 and how many ${namesOf(b)} of a ${t.one}?`,
      answer: { kind: 'number', value: a - b }, picture };
  }
  const f = `${sum.n}/${sum.d}`, picture = tapeOf(sum);
  if (sum.op === 'fwhole') {
    const ask = sum.tape ? `${f} of a length of tape is ${sum.part} metres. How long is the whole tape?` : `${f} of a number is ${sum.part}. What is the number?`;
    return { ask, say: ask, answer: { kind: 'number', value: (sum.part * sum.d) / sum.n }, picture };
  }
  const v = ofValue(sum), answer = typeof v === 'string' ? { kind: 'decimal', value: v } : { kind: 'number', value: v };
  if (sum.key === 'story') {
    const ask = ofStoryAsk(sum.story, sum.of, f);
    return { ask, say: ask, answer, picture };
  }
  return { ask: `${f} of ${sum.of} = ☐`, say: `What is ${f} of ${sum.of}?`, answer, picture };
}
function problem(sum) {
  const { key } = sum;
  if (['fof', 'fwhole', 'fdiv'].includes(sum.op)) return ofProblem(sum);
  if (sum.op === 'f+' || sum.op === 'f−') return addsubProblem(sum);
  if (sum.op === 'fequ') return equivalentProblem(sum);
  if (sum.op === 'fpart') {
    const { n, d } = sum;
    if (key === 'name') {
      const ask = 'What fraction is shaded?';
      return { ask, say: ask, answer: { kind: 'fraction', n, d }, picture: { type: 'strips', rows: [{ d, shaded: n }] } };
    }
    if (key === 'complement') {
      return { ask: `${n}/${d} + ☐/${d} = 1`, say: `${n}/${d} plus how many ${namesOf(d)} make 1?`, answer: { kind: 'number', value: d - n },
        picture: { type: 'strips', rows: [{ d, shaded: n }] } };
    }
    if (key === 'whole') {
      const ask = `If this is 1/${d} of the strip, which strip is the whole strip?`;
      // the lettered strips uncut, one part each, their lengths in proportion to the part's (review 3): the part's row is
      // d long in 1/d, so a strip k long is k parts; cut into parts only in the worked steps (engine/fraction-ways.js)
      return { ask, say: ask, answer: choice(LETTERS, LETTERS[sum.strips.indexOf(d)]),
        picture: { type: 'strips', rows: [{ d, count: 1, label: 'unit' }, ...LETTERS.map((name) => ({ d: 1, name }))], lengths: [d, ...sum.strips] } };
    }
    if (key === 'on-line') {
      const ask = 'What fraction is at the point?';
      return { ask, say: ask, answer: { kind: 'fraction', n, d }, picture: { type: 'fracline', wholes: 1, d, labels: 'wholes', point: { n, d, label: '?' } } };
    }
    if (key === 'rename') {
      const picture = { type: 'strips', rows: [{ d, shaded: d }] };
      return sum.form === 'whole' ? { ask: `${d}/${d} = ☐`, say: `What number is ${d}/${d}?`, answer: { kind: 'number', value: 1 }, picture }
        : { ask: `☐/${d} = 1`, say: `How many ${namesOf(d)} make 1?`, answer: { kind: 'number', value: d }, picture };
    }
    if (key === 'beyond') {
      return { ask: `${n}/${d} = 1 + ☐/${d}`, say: `${n}/${d} is 1 and how many ${namesOf(d)}?`, answer: { kind: 'number', value: n - d },
        picture: { type: 'strips', rows: [{ d, count: n, shaded: n }] } };
    }
    const at = fracText(n, d), ask = `Which letter is at ${at}?`;
    return { ask, say: ask, answer: choice(LETTERS, letterAt(at, sum.letters)),
      picture: { type: 'fracline', wholes: 2, d: 4, labels: 'wholes', letters: true, marks: marked(sum.letters) } };
  }
  if (key === 'compare') {
    return { ask: `${sum.a} ☐ ${sum.b}`, say: `Which sign goes between ${sum.a} and ${sum.b}: less than, equals, or greater than?`, answer: choice(['<', '=', '>'], signOf(sum.a, sum.b)) };
  }
  if (key === 'vs-half') {
    const ask = `Is ${sum.a} smaller or larger than ${sum.b}?`;
    return { ask, say: ask, answer: choice(['smaller', 'larger'], cmpFrac(sum.a, sum.b) < 0 ? 'smaller' : 'larger') };
  }
  if (key === 'order') {
    const ask = `Put these in order, smallest first: ${sum.values.join(', ')}`;
    return { ask, say: ask, answer: { kind: 'order', values: [...sum.values].sort(cmpFrac) } };
  }
  if (key === 'estimate') {
    const ask = `Which letter is at ${sum.at}?`;
    return { ask, say: ask, answer: choice(LETTERS, letterAt(sum.at, sum.letters)),
      picture: { type: 'fracline', wholes: 1, labels: 'benchmarks', letters: true, marks: marked(sum.letters) } };
  }
  const [a, b] = sum.names;
  const ask = `${a} ate 1/4 of a cake and ${b} ate 1/2 of a different cake. Who ate more?`;
  return { ask, say: ask, answer: choice([a, b, 'the same'], sameWholeAnswer(sum)),
    picture: { type: 'strips', rows: [{ d: 4, shaded: 1 }, { d: 2, shaded: 1 }], lengths: sum.lengths } };
}

// A hint for her actual mistake (plan, "Rules every fraction generator keeps"), each a question, else none (the way's):
// the fixed ones, HINTS (hints, tools/voice-lines.mjs), and the rest built from the problem's numbers, each listed for
// its problem by hintLines(item) so the tools that voice them have every one (step 2.3 review 2)
export const HINTS = {
  SPACES: 'Count the spaces, not the marks: how many equal spaces from 0 to 1?',
  MIDDLE: 'Is 1/2 halfway along the whole line, or halfway from 0 to 1?',
  MORE: 'When the whole is cut into more equal parts, is each part bigger or smaller?',
  SIZE: 'Did the size of the parts change? The parts keep their size, so the denominator stays the same.',
  RENAME: 'Are the parts the same size? Rename one so the parts match.',
  // the denominators added or taken away with related denominators (F5), where the parts must change to one size
  PARTS: 'Did the size of the parts change? Rename one so the parts match, then count the parts.',
  // a fraction of an amount divided by its numerator (F6: 3/4 of 24 as 24 ÷ 3 × 4), in the plan's words
  NUMERATOR: 'Which number says how many equal parts to cut it into?',
  // a remainder written as a whole number, the part left over dropped (F6: 1/4 of 10 as 2)
  LEFT: 'Is anything left over? Share it equally between the parts too, as a decimal.',
};
// the slips of dividing by the numerator: 3/4 of 24 as 24 ÷ 3 × 4 = 32, or 24 ÷ 3 = 8, where those are whole numbers
const byNumeratorSlips = ({ n, d, of }) => (of % n ? [] : [(of / n) * d, of / n]);
// the order of fractions by their numerators alone, never renamed: [1/2, 3/8, 3/4] by 1, 3, 3
const byNumerator = (values) => values.every((v, i) => !i || value(values[i - 1]).n <= value(v).n);
function hintFor(item, given) {
  const { sum, answer } = item;
  if (!sum) return null;
  const two = Array.isArray(given) ? given.map(Number) : null;
  // a fraction of an amount (F6): the remainder dropped, or a non-unit fraction's amount divided by its numerator
  if (sum.op === 'fof') {
    const g = Number(Array.isArray(given) ? given[0] : given);
    if (sum.key === 'remainder' && g === (sum.of - (sum.of % sum.d)) / sum.d) return HINTS.LEFT;
    if (sum.key !== 'remainder' && sum.n > 1 && g !== answer.value && byNumeratorSlips(sum).includes(g)) return HINTS.NUMERATOR;
    return null;
  }
  if (sum.op === 'fwhole' || sum.op === 'fdiv') return null;
  if (relatedSum(sum)) {
    // related denominators (F5): the numerators added or taken away over the larger denominator, never renamed (1/4 + 3/8
    // as 4/8, IES 2010 l.834; the plan's "Are quarters the same size as eighths?" would end a question on a fraction name,
    // so the shared words), or over the denominators added or taken away (4/12, IES 2010 l.830)
    const [x, y] = [value(sum.a), value(sum.b)], raw = sum.op === 'f+' ? x.n + y.n : x.n - y.n;
    // past one the same mistake gives the numerators past the whole: 3/4 + 7/8 as 10 eighths, so 1 + 2/8 (step 2.4 review
    // 4); the denominators added never make a whole there (each numerator is under its denominator), so no box for them
    if (answer.kind === 'number' && raw > Math.max(x.d, y.d) && Number(given) === raw - Math.max(x.d, y.d)) return HINTS.RENAME;
    if (answer.kind !== 'fraction' || !two || raw < 0 || two[0] !== raw) return null;
    if (two[1] === Math.max(x.d, y.d)) return HINTS.RENAME;
    if (two[1] === (sum.op === 'f+' ? x.d + y.d : Math.abs(x.d - y.d))) return HINTS.PARTS;
    return null;
  }
  if (sum.op === 'f+' || sum.op === 'f−') {
    const d = value(sum.b).d, W = Number(sum.a);
    // a whole number given the fraction's denominator: 3 − 1/4 worked as 3/4 − 1/4, or 1 − 1/5 as 1/5 − 1/5; no question
    // ends on a fraction name ("sixths?" heard "Sixth.", step 2.3, the pt54 pieces run), nor runs 1 of one into "the same
    // as" ("sixth the same as," heard "6 the same as", the second)
    if (sum.a === '1' && two?.[0] === 0) return `Does 1/${d} make 1 whole? How many ${namesOf(d)} make 1 whole?`;
    if (sum.key === 'from-whole' && W > 1 && Number(given) === W - 1 && W !== d) return `Is ${W}/${d} the same as ${W}? How many ${namesOf(d)} make ${W} wholes?`;
    // the denominators added or taken away: 3/8 + 2/8 as 5/16, 7/10 − 3/10 as 4/0
    if (answer.kind === 'fraction' && sum.a !== '1' && two && two[1] === (sum.op === 'f+' ? 2 * d : 0)) return HINTS.SIZE;
    return null;
  }
  // the numerator left as it was when renaming: 3/4 as 3/8, or 6/8 as 6/4. Its shaded parts only where a shaded picture is
  // on the screen (area's rectangle, collection's dots); half-in and missing, with none, asked in the parts' names; never
  // the answer's own number ("joined into 1" when the answer is 1) (step 2.3 review 5)
  if (sum.op === 'fequ' && !two && Number(given) === value(sum.a).n && Number(given) !== answer.value) {
    const d = value(sum.a).d, d2 = sum.d2;
    if (sum.key === 'area') return `When each part is cut into ${d2 / d}, how many shaded parts are there now?`;
    if (sum.key === 'collection') return `When every ${d / d2} parts are joined together, how many shaded parts are there now?`;
    if (sum.key === 'half-in') return `When the whole is cut into ${namesOf(d2)}, how many of them make each half of it?`;
    if (d2 > d) return `With each ${FRACTION_NAMES[d][0]} cut into ${d2 / d}, how many ${namesOf(d2)} do ${sum.a} make?`;
    return `When every ${d / d2} ${namesOf(d)} are joined into a ${FRACTION_NAMES[d2][0]}, how many ${namesOf(d2)} do ${sum.a} make?`;
  }
  // compared or ordered by the numerators alone, the parts never renamed to one size (frac-equivalent: not all unit fractions)
  const values = sum.op === 'fcmp' ? [sum.a, sum.b] : sum.op === 'ford' ? sum.values : [];
  if (values.length && !values.every((t) => value(t).n === 1)) {
    if (sum.op === 'fcmp' && given !== answer.value && given === signOf(String(value(sum.a).n), String(value(sum.b).n))) return HINTS.RENAME;
    if (sum.op === 'ford' && Array.isArray(given) && given.map(String).join() !== answer.values.join() && byNumerator(given.map(String))) return HINTS.RENAME;
    return null;
  }
  // the marks counted for the spaces: a line from 0 to 1 cut into 8 has 9 marks
  if (sum.key === 'on-line' && Array.isArray(given) && Number(given[1]) === sum.d + 1) return HINTS.SPACES;
  // 1/2 taken as the middle of a line from 0 to 2, which is 1
  if (sum.key === 'quarter-half' && sum.d === 2 && given === letterAt('1/1', sum.letters)) return HINTS.MIDDLE;
  // a larger denominator taken for a larger unit fraction: the sign turned round, the other of smaller and larger, or the order
  // by the denominators, smallest first
  if (sum.key === 'compare' && ({ '<': '>', '>': '<' })[answer.value] === given) return HINTS.MORE;
  if (sum.key === 'vs-half' && ['smaller', 'larger'].includes(given) && given !== answer.value) return HINTS.MORE;
  if (sum.key === 'order' && Array.isArray(given) && given.map(String).join() === [...answer.values].reverse().join()) return HINTS.MORE;
  return null;
}

// every hint text hintFor gives for a problem, each misconception's mistake worked out from the problem (the givens it
// answers: a whole number given the denominator, the denominators added or taken away, the numerator kept, every option
// of a choice and every order of the chips), for the tools that list the lines to voice (step 2.3 review 2)
export function hintLines(item) {
  const { sum, answer } = item;
  if (!sum) return [];
  const givens = [];
  if (sum.op === 'fof') givens.push(...(sum.key === 'remainder' ? [(sum.of - (sum.of % sum.d)) / sum.d] : sum.n > 1 ? byNumeratorSlips(sum) : []).map(String));
  else if (relatedSum(sum)) {
    const [x, y] = [value(sum.a), value(sum.b)], raw = String(sum.op === 'f+' ? x.n + y.n : x.n - y.n);
    if (answer.kind === 'fraction') givens.push([raw, String(Math.max(x.d, y.d))], [raw, String(sum.op === 'f+' ? x.d + y.d : Math.abs(x.d - y.d))]);
    else givens.push(String(Number(raw) - Math.max(x.d, y.d)));
  } else if (sum.op === 'f+' || sum.op === 'f−') {
    const d = value(sum.b).d;
    if (sum.a === '1') givens.push(['0', String(d)]);
    if (sum.key === 'from-whole') givens.push(String(Number(sum.a) - 1));
    if (answer.kind === 'fraction') givens.push([String(answer.n), String(sum.op === 'f+' ? 2 * d : 0)]);
  } else if (sum.op === 'fequ') givens.push(String(value(sum.a).n));
  else if (sum.key === 'on-line') givens.push([String(sum.n), String(sum.d + 1)]);
  else if (answer.kind === 'choice') givens.push(...answer.options);
  else if (answer.kind === 'order') givens.push(...permutations(answer.values));
  return [...new Set(givens.map((g) => hintFor(item, g)).filter(Boolean))];
}

// the word problems' first line (engine/items/wordproblems.js), the one voice file both say; it is not exported there,
// so a test keeps the two the same (tests/stage6-fractions.test.js, review 12)
export const READ = 'Read it all the way through, and picture what happens.';

export default {
  skills: ['frac-parts', 'frac-unit-compare', 'frac-addsub-same', 'frac-equivalent', 'frac-addsub-related', 'frac-of'],
  // opts.key makes that kind, opts.sum that very problem, opts.method works it that way where it fits (else the first
  // way that does, saying why first: wayFor), opts.also draws only a problem that way fits too, opts.op only a kind of
  // that sum (her own go after two ways side by side), opts.easy the easy level
  make(skillId, rng, opts = {}) {
    const sum = sumFor(skillId, rng, Boolean(opts.easy), opts);
    const { method, steps } = wayFor(skillId, sum, opts.method);
    const way = METHODS[method];
    const { picture, ...asked } = problem(sum);
    // a story's first step is the word problems' (engine/items/wordproblems.js), then the way's
    const all = sum.key === 'story' ? [{ text: READ }, ...steps] : steps;
    return { skill: skillId, key: sum.key, sum, method, ...asked, steps: all, picture: picture ?? way.picture(sum), hint: way.hint(sum), words: way.words(sum) };
  },
  hintFor,
  hints: Object.values(HINTS),
  // every problem of a kind, and every hint for a mistake, for the voice tools (tools/voice-lines.mjs every, linesFor),
  // which list a generator's problems whole wherever its default export has problemsOf
  problemsOf,
  hintLines,
};
