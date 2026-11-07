// The problem generators, one module per family of skills, and the one contract they all keep.
//
// A generator module's default export:
//   { skills: ['skill-id', ...],              the skills it makes problems for
//     make(skillId, rng, opts) -> Item,        one problem; opts.easy = small friendly numbers for worked
//                                              examples (IES 2021 p. 6); opts.key = make this particular problem;
//                                              for a skill with ways (engine/methods.js): opts.method = work it this
//                                              way where it fits (else the first of the skill's ways that does),
//                                              opts.also = a second way the sum must fit too, opts.sum = this very sum
//                                              (so two ways can be set side by side), opts.plain = no variant sentence
//     keys?(skillId) -> string[],              for 'facts' skills: every fact in the skill
//     hintFor?(item, given) -> string,         optional: a better hint that looks at what she answered
//     hints?: string[],                        optional: its hintFor's hints in fixed words, for the voice tools
//     problemsOf?(skillId, key, easy) -> [{ name, weight, sums }],   optional: every problem of a kind, a finite list;
//                                              a generator with it is listed whole by the voice tools
//                                              (tools/voice-lines.mjs every), with
//     hintLines?(item) -> string[],            every hint its hintFor can give the problem for a mistake, and
//     tellings?(sum) -> sum[] }                every way its story or thing can be told (else the sum as it is)
//
// An Item:
//   skill    the skill id
//   key      what is being practised, for tracking: a fact like '7x8', or a kind of problem like '3d/1d'
//   ask      the question as shown, with ☐ for each box she fills in, e.g. '29 ÷ 4 = ☐ r ☐'
//   say      the question in words, for read-aloud, e.g. '29 divided by 4'
//   answer   one of:
//              { kind: 'number', value }                     a whole number
//              { kind: 'decimal', value: '0.38' }            a decimal, as text as the game shows it, never a float;
//                                                            checked exactly in thousandths (engine/check.js
//                                                            thousandths), so '0.50' is right for '0.5'
//              { kind: 'remainder', quotient, remainder }   e.g. 7 r 1
//              { kind: 'fraction', n, d }                    a fraction, n/d in whole numbers (n 1 to 99, d 2 to 10
//                                                            or 100), never a float; her two boxes are checked by
//                                                            value (engine/check.js sameFraction), so 10/16 is right
//                                                            for 5/8, while n and d give the steps' own form
//              { kind: 'choice', options: [...], value }     she picks one option, e.g. 'true' / 'false', '<' '=' '>'
//              { kind: 'order', values: [...] }              numbers to put smallest first; decimal text ('0.50') and
//                                                            fraction text ('1/5') are compared by value, each only
//                                                            with its own kind, and shown as written
//              { kind: 'pair', values: [a, b], form }        two whole numbers in two boxes, in order, e.g. a point;
//                                                            form the answer's text with its two boxes, '(☐, ☐)';
//                                                            the steps that give it marked answer: true, as a
//                                                            remainder's are, never found by value
//   steps    the worked solution, in order: [{ text, value? }]; ☐ in text stands for value, which may be decimal
//            text ('0.06'), its box then taking a point, never a fraction. The last step with a value gives the
//            answer; for a fraction answer it is its numerator, "So 3/8 + 2/8 = ☐/8". Fading hides values from the
//            last step backwards (Renkl & Atkinson).
//   picture  a picture spec for engine/render/svg.js, or null (see that file for the types)
//   hint     after a first miss: a question that helps her find her own mistake (IES 2021 p. 7), never the answer
//   words    real mathematical words used, for the glossary: ['quotient', 'remainder']
//   sum      for a skill with ways: the sum itself, { op: '×', a, b }, { op: '+', a, b }, { op: '−', a, b } or
//            { op: '÷', n, d }; a fraction sum one of { op: 'fpart', key, n, d }, { op: 'fcmp', key, a, b },
//            { op: 'ford', key, values }, { op: 'floc', key, at, letters, wholes, d }, { op: 'f+', key, a, b, form },
//            { op: 'f−', key, a, b, form }, { op: 'fequ', key, a, d2 }, { op: 'fof', key, n, d, of },
//            { op: 'fwhole', key, n, d, part } or { op: 'fdiv', key, a, b }, every fraction as text 'n/d', form
//            'fraction' (☐/☐) or 'whole-and' (1 + ☐/d); a percentage sum (stage 6 strand 3) one of
//            { op: 'pct', key, p, n?, d?, dec?, noun? }, { op: 'pof', key, p, of, story? },
//            { op: 'poff', key, p, price, thing } or { op: 'pest', key: 'estimate', p, price, round, thing, options },
//            p the whole per cent, a price in whole dollars as a number (pest's as text with its cents, round the whole
//            dollars); a measurement sum (stage 6 strand 4) one of
//            { op: 'mread', key, device, unit, marks, parts, start, end, ask }, { op: 'mconv', key, form, value, from,
//            to }, { op: 'mtotal', key, parts: [{ value, unit }], to }, { op: 'mper', key, kind, sides, unit },
//            { op: 'marea', key, kind, sides, unit, form? } or { op: 'mvol', key, l, w, h, unit, cubes }, every unit a
//            symbol of engine/units.js UNITS, every amount decimal text, mconv's form 'to-larger', 'to-smaller', 'split'
//            or 'join'; an angle or a point (stage 6 strand 4b) { op: 'tang', key, whole, parts, turn } (whole 90, 180 or
//            360, parts the angles as the picture's, one '?') or { op: 'tpos', key, across, up, points, asked } on a read
//            and { op: 'tpos', key, across, up, points, at } on a plot (points [{ x, y, name }] lettered by x then y;
//            asked the letter asked about on a read, at the coordinates [x, y] asked about on a plot)
//   method   for a skill with ways: the way its steps work it (engine/methods.js), kept on her answer
//
// Rules every generator keeps (tests/items.test.js checks them over thousands of seeds):
//   - the answer is correct by an independent calculation;
//   - no negative numbers, no division by zero, no answer bigger than the skill's range;
//   - the same seed always makes the same problem;
//   - opts.easy keeps numbers small (factors to 5, totals to 100) so attention goes to the method.

import facts from './facts.js';
import divide from './divide.js';
import equals from './equals.js';
import placevalue from './placevalue.js';
import addsub from './addsub.js';
import multiply from './multiply.js';
import algebra from './algebra.js';
import words from './wordproblems.js';
import decimals from './decimals.js';
import fractions from './fractions.js';
import percentages from './percentages.js';
import measurement from './measurement.js';
import geometry from './geometry.js';

const MODULES = [facts, divide, equals, placevalue, addsub, multiply, algebra, words, decimals, fractions, percentages, measurement, geometry];

export const GENERATORS = {};
for (const m of MODULES) for (const s of m.skills) GENERATORS[s] = m;

export function makeItem(skillId, rng, opts = {}) {
  const m = GENERATORS[skillId];
  if (!m) throw new Error(`no generator for skill ${skillId}`);
  return m.make(skillId, rng, opts);
}

export function factKeys(skillId) {
  const m = GENERATORS[skillId];
  return m && m.keys ? m.keys(skillId) : [];
}

export function hintFor(item, given) {
  const m = GENERATORS[item.skill];
  return (m && m.hintFor && m.hintFor(item, given)) || item.hint;
}
