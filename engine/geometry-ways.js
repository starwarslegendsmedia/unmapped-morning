// The ways of stage 6 strand 4b, angles and position (plans/2026-10-25-stage-6-plan.md "Strand 4b: angles and
// position", "The ways"): each its own steps, picture, hint and words, kept apart from engine/methods.js, which takes them
// all into METHODS, as engine/measure-ways.js is. Step 4b.2 filled in the angles; step 4b.3 the position.
// An angle sum is { op: 'tang', key, whole, parts, turn } (meas-angles: whole 90, 180 or 360; parts the adjacent angles
// in the picture's order, anticlockwise from its first arm, each a whole number of degrees as text, and one '?', the
// angle with the box; turn the first arm's direction, the picture's only). Not a whole-number op (engine/methods.js
// WHOLE_OPS), so no whole-number way takes it, and neither way here takes any other op. Every angle is a whole number of
// degrees, worked as whole numbers, and "°" comes straight after a number or her box, never inside a number sentence
// ("180 − 120 = ☐°"), a whole named with its sign in words before the sentence ("A straight angle is 180°: …").
//
// Take from the whole: "Recognise that a right angle is 90°, a straight angle is 180° and an angle of revolution is 360°"
// (Stage 3 Geometric measure A, saved copy 2026-10-28-2213-article-k-10-mathematics-k-10-syllabus-2022-fa35c41b81.md
// l.105); "Identify angle types formed by the intersection of straight lines, including right angles (90°), angles on a
// straight line (add to 180°) and angles at a point that form an angle of revolution (add to 360°)", "Investigate
// adjacent angles that form a right angle and establish that they add to 90°", "… on a straight line and establish that
// they add to 180°", "Investigate angles at a point and establish that they form an angle of revolution and add to 360°"
// (Stage 3 Geometric measure B, saved copy …fae314fde1.md l.99, l.111, l.117, l.125), "They can then use the angle of
// revolution when determining the angle size of angles at a point." (l.152). Count on to the whole: adjacent angles add
// to the whole (S3 GM B l.117-119, "An angle of 120° and 60°."), counted on to the next ten and then to the whole, the
// game's way of adding on (count-up, MA3-AR-01), chosen for this game, not a syllabus requirement. NSW Mathematics K–10
// Syllabus (2022), 16 June 2026 amendments; the pages read live 28 October 2026 and saved 28 October 2026, checked live
// 30 October 2026.
//
// A point sum is { op: 'tpos', key, across, up, points, asked } on a read (asked the letter of the point whose coordinates
// she writes) or { op: 'tpos', key, across, up, points, at } on a plot (at the coordinates [x, y] of the point she names);
// points [{ x, y, name }], each on a crossing of the grid, lettered by x then y. Across, then up: "Plot and label points,
// given coordinates, on the number plane in the first quadrant, describing the horizontal position first, followed by
// the vertical position" (Stage 3 Geometric measure A, saved copy …fa35c41b81.md l.33), "By convention when using
// grid-reference systems, the horizontal component of direction is named first, followed by the vertical component."
// (l.114); "the first letter or number tells you how far across the map something is", "the second … how far up or
// down" (Stage 2 Geometric measure A, saved copy …fae78c0853.md l.96-98). Follow the lines: "Identify that in the
// coordinate system the lines are numbered, not the spaces" (S3 GM A l.29), the x number first (Stage 3 Geometric measure
// B, saved copy …fae314fde1.md l.136). A point on an axis is "on the x-axis" or "on the y-axis", never "0 up" (strand 4's
// lesson of a reading "past 0"). The same syllabus, pages and dates as above.
import { so, keptOf } from './fraction-ways.js';

// ---- angles (tang): adjacent angles in a right angle, on a straight line and at a point ----

// the whole, named as NESA names it (S3 GM A l.105)
const WHOLE_NAMES = { 90: 'A right angle', 180: 'A straight angle', 360: 'An angle of revolution' };
// the angles the question gives, in its order (the picture's, the box's left out), and the box's angle
export const knownOf = (sum) => sum.parts.filter((p) => p !== '?').map(Number);
export const knownSum = (sum) => knownOf(sum).reduce((t, a) => t + a, 0);
export const angleValue = (sum) => sum.whole - knownSum(sum);
// the question in its order, the box's angle last: "the right angle is cut into 35° and …", "the angles are 50°, 70° and …"
const claim = (sum, last) => `${sum.whole === 90 ? 'the right angle is cut into' : 'the angles are'} ${knownOf(sum).map((a) => `${a}°`).join(', ')} and ${last}`;
// the angles she knows added, where there are two or more: "50 + 70 = ☐°"
const added = (sum) => (knownOf(sum).length > 1 ? [{ text: `${knownOf(sum).join(' + ')} = ☐°`, value: knownSum(sum) }] : []);
const answerOf = (sum, text) => ({ text, value: angleValue(sum), answer: true });

// the whole named (90°, 180° or 360°), the angles she knows added, and taken from it (B1, "Ways"): with one angle known
// the whole its own step, "A right angle is 90°.", else named before the answer, "A straight angle is 180°: so …"
function takeSteps(sum) {
  const W = sum.whole, s = knownSum(sum), take = `${W} − ${s} = ☐°`;
  if (knownOf(sum).length === 1) return [{ text: `${WHOLE_NAMES[W]} is ${W}°.` }, answerOf(sum, so(null, claim(sum, take)))];
  return [...added(sum), answerOf(sum, so(`${WHOLE_NAMES[W]} is ${W}°`, claim(sum, take)))];
}

// counted on from the angles she knows to the next ten, then on to the whole, the jumps added (B1, "Ways"): "up to", never
// "past"; from a ten, one jump to the whole, with no jump step. A four-angle point off a ten starts its answer step at the
// jump's end, "Up to 360° is 180° more: …", so it says 23 words, not 26 (tests/short.test.js)
function countSteps(sum) {
  const W = sum.whole, S = knownSum(sum), T = Math.ceil(S / 10) * 10;
  if (T === S) return [...added(sum), answerOf(sum, so(`From ${S}° up to ${W}°`, claim(sum, '☐°')))];
  const lead = knownOf(sum).length === 3 && W === 360 ? `Up to ${W}° is ${W - T}° more` : `From ${T}° up to ${W}° is ${W - T}° more`;
  return [...added(sum), { text: `From ${S}° up to ${T}° is ☐°`, value: T - S }, answerOf(sum, so(lead, claim(sum, `${T - S} + ${W - T} = ☐°`)))];
}

// the glossary's words (S3 GM A l.220-230; S3 GM B l.180-194): the whole's and its angles'
const WHOLE_WORDS = { 90: ['right angle', 'adjacent angles'], 180: ['straight angle', 'angles on a straight line'], 360: ['angle of revolution', 'angles at a point'] };
const angleWords = (sum) => ['angle', 'degree', ...WHOLE_WORDS[sum.whole]];
const angles = (sum) => sum?.op === 'tang';

const angleTake = {
  op: 'tang', title: 'Take from the whole',
  fits: angles,
  steps: (sum) => keptOf(takeSteps(sum)),
  picture: () => null,
  hint: () => 'What is the whole here: 90°, 180° or 360°? Which angles do you know?',
  words: angleWords,
};

const angleCount = {
  op: 'tang', title: 'Count on to the whole',
  fits: angles,
  steps: (sum) => keptOf(countSteps(sum)),
  picture: () => null,
  hint: () => 'How far is the whole from the angles you know?',
  words: angleWords,
};

// ---- points (tpos): a point's coordinates read from the grid, or the point at given coordinates named ----

// the point the problem asks about: a read's asked letter, a plot's coordinates
export const askedPoint = (sum) => (sum.key === 'read' ? sum.points.find((p) => p.name === sum.asked) : sum.points.find((p) => p.x === sum.at[0] && p.y === sum.at[1]));
// a read's answer step, the question in its order with the across filled in: "so B is at (2, ☐)", its box the up
const readAnswer = (P, lead) => ({ text: so(lead, `${P.name} is at (${P.x}, ☐)`), value: P.y, answer: true });
// a plot's answer step, its last, the point named: "so the point at (3, 2) is C."
const plotAnswer = (P, lead) => ({ text: so(lead, `the point at (${P.x}, ${P.y}) is ${P.name}.`) });
// the question's grid, its working copy with dashed lines from the asked point to the two axes (B2, "Picture")
const guided = (sum, P) => ({ type: 'plane', across: sum.across, up: sum.up, points: sum.points, guide: P.name, working: true });

// from the origin, across the x-axis first, then up (B2, "Ways"); on the x-axis "not above it", on the y-axis the first
// number 0 and up the y-axis
function acrossSteps(sum) {
  const P = askedPoint(sum), L = P.name;
  if (sum.key === 'read') {
    if (P.y === 0) return [{ text: `Start at the origin, (0, 0). Go across to ${L}: ☐.`, value: P.x }, readAnswer(P, `${L} is on the x-axis, not above it`)];
    if (P.x === 0) return [{ text: `${L} is on the y-axis, so the first number is ☐.`, value: 0 }, readAnswer(P, `Then go up the y-axis to ${L}`)];
    return [{ text: `Start at the origin, (0, 0). Go across to the line ${L} is on: ☐.`, value: P.x }, readAnswer(P, `Then go up the line to ${L}`)];
  }
  // a plot's point on an axis, the smallest form of B2's that never says "go up 0" (R12, step 4b.3)
  if (P.y === 0) return [{ text: `Start at the origin and go across the x-axis to ${P.x}.` }, plotAnswer(P, 'The point is on the x-axis, not above it')];
  if (P.x === 0) return [{ text: 'Start at the origin: the first number is 0, so stay on the y-axis.' }, plotAnswer(P, `Then go up the y-axis to ${P.y}`)];
  return [{ text: `Start at the origin and go across the x-axis to ${P.x}.` }, plotAnswer(P, `Then go up ${P.y}`)];
}

// from the point, its line straight down to the x-axis and straight across to the y-axis, the x number first (B2, "Ways"),
// the grid with its guide on the read's first step; on an axis, the axis it is on read there. On the y-axis the x-axis's
// form the other way round, so the across, 0, is still found first (R12, step 4b.3: B2's "the same way round" would box
// the up twice), its box named the first number as across-up's is (the lead's ruling, R12, pt100, review finding 2)
function axesSteps(sum) {
  const P = askedPoint(sum), L = P.name;
  if (sum.key === 'read') {
    if (P.y === 0) return [{ text: `${L} is on the x-axis, at ☐.`, value: P.x }, readAnswer(P, `${L} is on the x-axis, not above it`)];
    if (P.x === 0) return [{ text: `${L} is on the y-axis, not to the right of it: so the first number is ☐.`, value: 0 }, readAnswer(P, `Read the number on the y-axis at ${L}`)];
    return [{ text: `From ${L}, follow its line straight down to the x-axis: ☐.`, value: P.x, picture: guided(sum, P) },
      readAnswer(P, `From ${L}, follow its line straight across to the y-axis`)];
  }
  if (P.y === 0) return [{ text: `Find ${P.x} on the x-axis.` }, plotAnswer(P, `The point is on the x-axis at ${P.x}, not above it`)];
  if (P.x === 0) return [{ text: `Find ${P.y} on the y-axis.` }, plotAnswer(P, `The point is on the y-axis at ${P.y}, not to the right of it`)];
  return [{ text: `Find ${P.x} on the x-axis and ${P.y} on the y-axis.` }, plotAnswer(P, `The line up from ${P.x} and the line across from ${P.y} meet at ${L}`)];
}

// the glossary's words (S3 GM A l.31, l.39; S3 GM B l.136; S2 GM A l.156-158)
const POINT_WORDS = ['grid', 'point', 'coordinates', 'origin', 'x-axis', 'y-axis'];
const points = (sum) => sum?.op === 'tpos';

const acrossUp = {
  op: 'tpos', title: 'Across, then up',
  fits: points,
  steps: (sum) => keptOf(acrossSteps(sum)),
  picture: () => null,
  hint: () => 'Did you go across first, then up? How far across is the point?',
  words: () => [...POINT_WORDS],
};

const toAxes = {
  op: 'tpos', title: 'Follow the lines',
  fits: points,
  steps: (sum) => keptOf(axesSteps(sum)),
  picture: () => null,
  hint: () => 'Which number is on the line straight under the point?',
  words: () => [...POINT_WORDS],
};

export const GEOMETRY_WAYS = { 'angle-take': angleTake, 'angle-count': angleCount, 'across-up': acrossUp, 'to-axes': toAxes };
