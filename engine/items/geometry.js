// Angles and position (stage 6 strand 4b, plans/2026-10-25-stage-6-plan.md "Strand 4b: angles and position"): the
// generator of the strand's skills, meas-angles' adjacent angles in a right angle (right), on a straight line (line) and
// at a point (point), and meas-position's points on a grid, a point's coordinates written (read) and the point at given
// coordinates named (plot), each a list of keys, its classes in classesOf and its question in problem. Every angle is a
// whole number of degrees and every point two whole numbers, never a float; the ways that work them are in
// engine/geometry-ways.js.
//
// meas-angles, MA3-GM-03, "measures and constructs angles, and identifies the relationships between angles on a
// straight line and angles at a point" (Outcomes, saved copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-
// outcomes.md l.280). "Record angle measurements using the symbol for degrees (°)", "Such as 30°, 60°." (Stage 3
// Geometric measure A, saved copy 2026-10-28-2213-article-k-10-mathematics-k-10-syllabus-2022-fa35c41b81.md l.93-95);
// "Recognise that a right angle is 90°, a straight angle is 180° and an angle of revolution is 360°" (l.105); its
// teaching advice that an angle is "a measure of turn", not the length of its arms (l.130), and "a right angle is 90°,
// independent of its orientation" (l.142), so the picture is turned; "Compare angles and explain that the length of the
// arms does not affect the size of the angle" (Stage 2 Geometric measure A, saved copy …fae78c0853.md l.81). Its right
// key: "Investigate adjacent angles that form a right angle and establish that they add to 90°", "Three intersecting
// lines forming 2 adjacent angles, which add up to a right angle of 90°." (Stage 3 Geometric measure B, saved copy
// …fae314fde1.md l.111, l.115). Its line key: "Investigate adjacent angles on a straight line and establish that they add
// to 180°", "An angle of 120° and 60°." (l.117-119). Its point key: "Investigate angles at a point and establish that they
// form an angle of revolution and add to 360°" (l.125), "They can then use the angle of revolution when determining the
// angle size of angles at a point." (l.152). "Recognise right angles, angles on a straight line and angles at a point
// embedded in diagrams" (l.77), "… right angles (90°), angles on a straight line (add to 180°) and angles at a point that
// form an angle of revolution (add to 360°)" (l.99), "A pair of adjacent angles has a common vertex and a common arm."
// (l.156). The pages read live 28 October 2026 and saved 28 October 2026; NSW Mathematics K–10 Syllabus (2022), 16 June
// 2026 amendments, checked live 30 October 2026.
//
// Chosen for this game, not a syllabus requirement: every angle a multiple of 5 and 25° or more (the smallest raised
// from the plan's 20° where more than a tenth of a key's pictures could not place their labels: the lead's ruling on
// fact 10, step 4b.1), at a point each 200° or less and at most one over 180°, and every angle between two arms there
// (each run of neighbouring angles, either way round, the box's among them) exactly 180° or 15° or more from it, since
// the lookers of step 4b.2 read two arms 170° to 185° apart as one straight line, inviting 180° (the lead's ruling, 30
// October 2026); the easy level two angles in a right angle or on a line, each a multiple of 10 from 30°, the picture
// not turned (Part A's "a right angle is 90°, a straight angle is 180°", S3 GM A l.105); the picture's first arm turned
// a multiple of 30° at the usual level, each as often; the shares of each key and each count of angles (plan B1,
// "Sizes"). Every problem is drawn from a list made once of every one the plan allows (plan, "Rules every generator of
// this strand keeps"): the key first, each as often as the others; then its class (how many angles) by its weight; then
// a problem, each in its class as often as the others; then its turn, which changes no word and no number, each as
// often as the others, so the voice tools list each problem once. A problem is left out where its answer is a number
// she sees or hears before the answer step, by either way of the group: a given angle, a whole (each named in a hint:
// "What is the whole here: 90°, 180° or 360°?"), the angles she knows added, or a jump's end (B1's working steps), so
// no working step has the answer's value either. Every picture drawn (tests/stage6-geometry.test.js draws every problem
// at every turn).
//
// meas-position, MA3-GM-01, "locates and describes points on a coordinate plane" (Outcomes, saved copy …outcomes.md
// l.272). "Identify that in the coordinate system the lines are numbered, not the spaces" (Stage 3 Geometric measure A,
// saved copy …fa35c41b81.md l.29); "Identify the point of intersection of the 2 axes as the origin, having coordinates
// (0, 0)" (l.31); its plot key: "Plot and label points, given coordinates, on the number plane in the first quadrant,
// describing the horizontal position first, followed by the vertical position", "Such as (2, 3) is a location different
// from (3, 2)." (l.33-35); its read key: "Identify and record the coordinates of given points on the number plane in the
// first quadrant" (l.41). The same syllabus, pages and dates as above.
//
// Chosen for this game, not a syllabus requirement: plotting asked as a choice of the lettered points, since she cannot
// drop a dot on a phone with the game's screens; a grid 4 to 8 across and 3 to 6 up (the easy level 5 by 5, every number
// 1 to 5, no point on an axis); the asked point's two numbers different, since a point like (2, 2) teaches nothing about
// their order; a sixth of the usual problems with the asked point on an axis, never at the origin; no point lettered at
// the origin, which the steps name as itself ("Start at the origin, (0, 0)"); every point's letter by x then y, a read's
// three as a plot's (step 4b.3's choice, R12); a read's points the asked one, its swap where it fits (else a point one
// line across from it) and one more on neither of its lines; a plot's at the easy level the right one, its swap and one a
// line across, at the usual level the four corners of a rectangle with its sides on the grid lines, so each point shares
// a line with two others and only both numbers single out the right one: a tenth the swap square, the right one (a, b),
// its swap (b, a), (a, a) and (b, b), and the rest a unit square, the right one, the point a line across, the point a
// line up or down and the corner between (in place of B2's one a line across and one a line up or down, which made the
// right one the corner of the others' shape: the lead's rulings on step 4b.4's T1, 31 October 2026); the classes by the
// asked or right letter, each about as often, so the letter tells her nothing (plan B2, "Sizes"; as dec-numberline's
// letters, engine/items/decimals.js). Every picture drawn
// (tests/stage6-geometry.test.js draws every problem's grid, every name placed, and a read's guide where to-axes draws one).

import { METHODS, wayFor } from '../methods.js';
import { BY_ID } from '../skills.js';
import { drawSum } from './fractions.js';
import { normalise } from '../check.js';
import { knownOf, knownSum, angleValue, askedPoint } from '../geometry-ways.js';

// the kinds of problem (plan B1 and B2, "Keys and asks"), and those of the easy level ("Sizes"), which the worked
// examples come from: a right angle and a line; a read and a plot
export const KEYS = { 'meas-angles': ['right', 'line', 'point'], 'meas-position': ['read', 'plot'] };
export const EASY = { 'meas-angles': ['right', 'line'], 'meas-position': ['read', 'plot'] };

// ---- meas-angles: the problems (plan B1, "Sizes") ----

const WHOLE = { right: 90, line: 180, point: 360 };
// the smallest angle and the step between sizes, at the usual level and the easy (the lead's ruling on fact 10)
const LEAST = { usual: 25, easy: 30 }, STEP = { usual: 5, easy: 10 };
// at a point: each angle at most 200°, and at most one over 180° (B1, "Sizes"); every angle between two arms exactly
// 180° or NEAR or more from it (the lookers, step 4b.2: two arms 170° to 185° apart read as one straight line)
const MOST = 200, REFLEX = 180, NEAR = 15;
// how many angles each class has, and its weight (B1, "Sizes": a line's two angles two thirds of the problems, three one
// third; a point's three half, four half); the easy level two angles only
const CLASSES = { right: [[2, 1]], line: [[2, 2 / 3], [3, 1 / 3]], point: [[3, 1 / 2], [4, 1 / 2]] };
const COUNT_WORDS = { 2: 'two', 3: 'three', 4: 'four' };

// every list of k angles in the picture's order, each a multiple of step and at least least, adding to whole
function anglesOf(whole, k, least, step) {
  const out = [];
  const rec = (pre, left) => {
    if (pre.length === k - 1) {
      if (left >= least) out.push([...pre, left]);
      return;
    }
    for (let a = least; a <= left - least * (k - 1 - pre.length); a += step) rec([...pre, a], left - a);
  };
  rec([], whole);
  return whole === WHOLE.point ? out.filter((list) => list.every((a) => a <= MOST) && list.filter((a) => a > REFLEX).length <= 1 && plainAt(list)) : out;
}
// every run of neighbouring angles at a point, from each arm, either way round: exactly a straight angle or NEAR from it
const plainAt = (list) => list.every((_, i) => list.slice(1).every((__, n) => {
  const s = list.slice(0, n + 1).reduce((t, ___, j) => t + list[(i + j) % list.length], 0);
  return s === REFLEX || Math.abs(s - REFLEX) >= NEAR;
}));
// every number she sees or hears before the answer step, by either way (engine/geometry-ways.js): the given angles (the
// question, its picture's labels and words), the three wholes (angle-take's hint names all three; each misconception's
// hint and step names one or two), the angles she knows added (both ways' first step), and a jump to the next ten, its
// end and its size (angle-count's)
function earlierNumbers(sum) {
  const known = knownOf(sum), s = knownSum(sum), ten = Math.ceil(s / 10) * 10;
  return new Set([...known, ...Object.values(WHOLE), s, ten, ten - s]);
}
const allowed = (sum) => !earlierNumbers(sum).has(angleValue(sum));
// the box at each place whose angle is no given angle (B1: "the box's angle never equal to a given angle")
const boxed = (key, list) => list.flatMap((a, j) => (list.some((b, i) => i !== j && b === a) ? []
  : [{ op: 'tang', key, whole: WHOLE[key], parts: list.map((b, i) => (i === j ? '?' : String(b))) }]));

// ---- meas-position: the problems (plan B2, "Sizes") ----

// the grids, at the usual level and the easy; the least number a point can have; a sixth of the usual problems with the
// asked point on an axis
const GRIDS = { usual: [4, 5, 6, 7, 8].flatMap((across) => [3, 4, 5, 6].map((up) => [across, up])), easy: [[5, 5]] };
const LEAST_AT = { usual: 0, easy: 1 }, ON_AXIS = 1 / 6;
const LETTERS = ['A', 'B', 'C', 'D'];
const axisOf = (p) => p.x === 0 || p.y === 0;
const samePoint = (p, q) => p.x === q.x && p.y === q.y;
// the points lettered by x, then y
const lettered = (pts) => [...pts].sort((p, q) => p.x - q.x || p.y - q.y).map((p, i) => ({ x: p.x, y: p.y, name: LETTERS[i] }));

// every problem of a key at a level B2 allows: on each grid, each asked point with two different numbers; a read's swap
// where it fits, else a point a line across, either side, then every point on neither of the asked point's lines; a
// plot's asked point one whose swap fits, as B2 had it, and at the easy level its swap and each point a line across; at
// the usual level the swap square where its four fit (never on an axis, which would put a point at the origin), and each
// unit square that fits, either side across and either up or down, a unit square that is the swap square (the right
// one's numbers one apart) counted once, as the swap square (the lead's ruling on step 4b.4's T1, R12)
function positionsOf(key, easy) {
  const level = easy ? 'easy' : 'usual', least = LEAST_AT[level], out = [];
  for (const [across, up] of GRIDS[level]) {
    const inside = (p) => p.x >= least && p.x <= across && p.y >= least && p.y <= up && (p.x || p.y);
    const crossings = [];
    for (let x = least; x <= across; x++) for (let y = least; y <= up; y++) if (inside({ x, y })) crossings.push({ x, y });
    for (const P of crossings.filter((p) => p.x !== p.y)) {
      const swap = { x: P.y, y: P.x }, aside = [{ x: P.x - 1, y: P.y }, { x: P.x + 1, y: P.y }].filter(inside);
      if (key === 'read') {
        for (const second of inside(swap) ? [swap] : aside) {
          for (const more of crossings.filter((q) => q.x !== P.x && q.y !== P.y && !samePoint(q, second))) {
            const points = lettered([P, second, more]);
            out.push({ op: 'tpos', key, across, up, points, asked: points.find((q) => samePoint(q, P)).name });
          }
        }
      } else if (inside(swap) && easy) {
        for (const side of aside) out.push({ op: 'tpos', key, across, up, points: lettered([P, swap, side]), at: [P.x, P.y] });
      } else if (inside(swap)) {
        const square = [P, swap, { x: P.x, y: P.x }, { x: P.y, y: P.y }];
        if (square.every(inside)) out.push({ op: 'tpos', key, across, up, points: lettered(square), at: [P.x, P.y] });
        for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
          const unit = [P, { x: P.x + dx, y: P.y }, { x: P.x, y: P.y + dy }, { x: P.x + dx, y: P.y + dy }];
          if (unit.every(inside) && !unit.some((q) => samePoint(q, swap))) out.push({ op: 'tpos', key, across, up, points: lettered(unit), at: [P.x, P.y] });
        }
      }
    }
  }
  return out;
}
const gridOf = (sum) => ({ type: 'plane', across: sum.across, up: sum.up, points: sum.points });

// a usual plot's swap square: every point made of the asked point's two numbers
const swapSquare = (sum) => sum.points.length === 4 && sum.points.every((p) => [p.x, p.y].every((n) => n === sum.at[0] || n === sum.at[1]));
// the usual plot's share of swap squares, a small one (8% to 12%, the lead's ruling on step 4b.4's T1 after G8's corner
// finding): their right letter is always B or C (the swap square's other two points are its lowest and its highest),
// so a child who had learned that would find the right one by its first number alone in every swap square
const SWAP_SQUARES = 0.1;
// a key's classes, by the asked (read) or right (plot) letter, each as often as the others; at the usual level each
// letter's problems with the asked point on an axis a class of their own, a sixth of the problems, and a usual plot's
// swap squares a class of their own, SWAP_SQUARES shared evenly among the letters that have one. A usual plot's letters
// half way between each as often over all and each as often among the unit squares alone (B and C 26.25%, A and D
// 23.75%; among the unit squares 23.6% and 26.4%), so both are well within 22% to 28% (R12); the sixth on an axis shared
// among the letters that have one by what their swap squares leave them (evenly where none has a swap square)
function positionClasses(key, easy) {
  const sums = positionsOf(key, easy), letters = LETTERS.slice(0, key === 'plot' && !easy ? 4 : 3), n = letters.length;
  const of = (L, axis, swap) => sums.filter((s) => askedPoint(s).name === L && axisOf(askedPoint(s)) === axis && swapSquare(s) === swap);
  const squares = letters.filter((L) => of(L, false, true).length), onAxis = easy ? [] : letters.filter((L) => of(L, true, false).length);
  const share = squares.length ? SWAP_SQUARES : 0, swapOf = (L) => (squares.includes(L) ? share / squares.length : 0);
  const room = (L) => (1 / n + (1 - share) / n + swapOf(L)) / 2 - swapOf(L);
  const axisRoom = onAxis.reduce((t, L) => t + room(L), 0);
  return letters.flatMap((L) => {
    const swap = swapOf(L), axis = onAxis.includes(L) ? ON_AXIS * room(L) / axisRoom : 0;
    return [{ name: squares.length ? `${L}, the unit square` : L, weight: room(L) - axis, sums: of(L, false, false) },
      ...(swap ? [{ name: `${L}, the swap square`, weight: swap, sums: of(L, false, true) }] : []),
      ...(axis ? [{ name: `${L} on an axis`, weight: axis, sums: of(L, true, false) }] : [])];
  });
}

function classesOf(skillId, key, easy) {
  if (skillId === 'meas-position') return positionClasses(key, easy);
  const level = easy ? 'easy' : 'usual';
  return CLASSES[key].filter(([k]) => !easy || k === 2).map(([k, weight]) => ({
    name: `${COUNT_WORDS[k]} angles`, weight,
    sums: anglesOf(WHOLE[key], k, LEAST[level], STEP[level]).flatMap((list) => boxed(key, list)).filter(allowed),
  }));
}
// every problem of a skill's key at a level, in its classes: [{ name, weight, sums }]; none for a key its level does not
// have (a point at the easy level), so asking for one throws as an empty class does (drawSum)
const MEMO = new Map(), KEPT = new Map();
export function problemsOf(skillId, key, easy) {
  if (!KEYS[skillId]?.includes(key)) throw new Error(`${skillId} has no kind of problem ${key}`);
  const at = `${skillId}:${key}:${Boolean(easy)}`;
  if (!MEMO.has(at)) MEMO.set(at, (easy ? EASY : KEYS)[skillId].includes(key) ? classesOf(skillId, key, Boolean(easy)) : []);
  return MEMO.get(at);
}
// every way a problem can be told, for the voice tools (tools/voice-lines.mjs every): one, since no ask here is a story
export const tellings = (sum) => [sum];

// an angle's turn, drawn after its numbers (the easy level's not turned); a turn given is kept; a point has none
const turnOf = (sum, rng, easy) => (sum.op !== 'tang' || sum.turn != null ? sum : { ...sum, turn: easy ? 0 : 30 * rng.int(0, 11) });

// the question (plan B1, "Keys and asks"): the given angles in the picture's order, the box's last; said as speech.words
// says it (js/speech.js), "35 degrees and what degrees"; the angle its picture
function problem(sum) {
  if (sum.op === 'tpos') return pointProblem(sum);
  const given = `${knownOf(sum).map((a) => `${a}°`).join(', ')} and ☐°`, n = sum.parts.length;
  const ask = sum.key === 'right' ? `A right angle is cut into two angles: ${given}.`
    : `${COUNT_WORDS[n][0].toUpperCase()}${COUNT_WORDS[n].slice(1)} angles ${sum.key === 'line' ? 'on a straight line' : 'at a point'}: ${given}.`;
  const say = ask.replace(/(\d+)°/g, (_, d) => `${d} ${d === '1' ? 'degree' : 'degrees'}`).replace(/☐°/g, 'what degrees');
  return { ask, say, answer: { kind: 'number', value: angleValue(sum) }, picture: { type: 'angle', whole: sum.whole, parts: sum.parts, turn: sum.turn } };
}

// a point's question (plan B2, "Keys and asks"): a read's two boxes, said as the coordinates asked for; a plot's choice of
// the points' letters in order; the grid its picture
function pointProblem(sum) {
  const P = askedPoint(sum), grid = gridOf(sum);
  if (sum.key === 'read') return { ask: `Point ${P.name} is at (☐, ☐).`, say: `What are the coordinates of point ${P.name}?`, answer: { kind: 'pair', values: [P.x, P.y], form: '(☐, ☐)' }, picture: grid };
  const ask = `Which point is at (${P.x}, ${P.y})?`;
  return { ask, say: ask, answer: { kind: 'choice', options: LETTERS.slice(0, sum.points.length), value: P.name }, picture: grid };
}

// a problem: drawn as the measurement skills' are (engine/items/fractions.js drawSum: the key, its class by weight, a
// problem the ways fit), then its turn
function sumFor(skillId, rng, easy, opts) {
  if (opts.sum) return turnOf(opts.sum, rng, easy);
  const { sum } = drawSum(skillId, rng, easy, opts, { levelKeys: (easy ? EASY : KEYS)[skillId], problemsOf, kept: KEPT });
  return turnOf(sum, rng, easy);
}

// The way a problem is worked (plan "The ways", "Groups"): opts.method where it is in the skill's one group, else her
// way for it (opts.ways, engine/methods.js groupWays, js/runner.js make), else the group's first
function wayAsked(skillId, opts) {
  const [group] = BY_ID[skillId].groups;
  if (group.includes(opts.method)) return opts.method;
  return group.includes(opts.ways?.[0]) ? opts.ways[0] : group[0];
}

// A hint for her actual mistake (plan B1, "Misconceptions"), each a question about the step or the question's own
// numbers, never about her answer, which the screen has taken away (js/runner.js), else none (the way's): HINTS, each
// listed for its problem by hintLines(item). A slip whose value is the right answer is no slip there
export const HINTS = {
  // a given angle typed back
  BACK: 'Which angle has the box? Did you find its size?',
  // the wrong whole: a line taken as all the way round, or a point as a straight line
  WHOLE: 'Is the whole here a straight line, 180°, or all the way round, 360°?',
  // a right angle taken as a straight line
  RIGHT: 'Is the whole here a right angle, 90°, or a straight line, 180°?',
  // the angles she knows added, not taken from the whole
  ADDED: 'Did you take the angles you know away from the whole?',
  // one angle she knows left out, where she knows two or three
  LEFT_OUT: 'Did you take away every angle you know?',
  // a read's number off by one: the spaces counted, or the count started at 1
  SPACES: 'Are the numbers on the lines or in the spaces? Where is 0?',
  // a plot's swapped point
  ORDER: 'Which number tells you how far across: the first or the second?',
  // a plot's point a line off
  ORIGIN: 'Did you start counting at the origin, 0?',
};
// each slip she could make on a problem, its value and its kind, the more particular first: [[value, kind]]
function slipsOf(sum) {
  const known = knownOf(sum), s = knownSum(sum), other = sum.whole === 180 ? 360 : 180, out = known.map((a) => [a, 'back']);
  if (other - s > 0) out.push([other - s, sum.whole === 90 ? 'right' : 'whole']);
  if (known.length > 1) out.push([s, 'added'], ...known.map((a) => [sum.whole - (s - a), 'left-out']));
  return out.filter(([v]) => v !== angleValue(sum));
}
// each slip she could make on a point, the more particular first (plan B2, "Misconceptions"): [[value, kind]], a read's
// value its two numbers as text, a plot's a letter. A read: the two numbers swapped, another point's numbers, one number a
// line off; a plot: the swapped point, and every point of a swap square, made of the two asked numbers, the numbers taken
// the wrong way round; else a point of a unit square or the easy level's point a line across, the count started wrong
// (the lead's ruling on step 4b.4's T1)
function pointSlipsOf(sum) {
  const P = askedPoint(sum), out = [];
  if (sum.key === 'plot') return sum.points.filter((q) => q !== P).map((q) => [q.name, (q.x === P.y && q.y === P.x) || swapSquare(sum) ? 'order' : 'origin']);
  out.push([[P.y, P.x], 'swap'], ...sum.points.filter((q) => q !== P).map((q) => [[q.x, q.y], 'other']));
  for (const [x, y] of [[P.x - 1, P.y], [P.x + 1, P.y], [P.x, P.y - 1], [P.x, P.y + 1]]) if (x >= 0 && y >= 0) out.push([[x, y], 'off']);
  return out.map(([v, kind]) => [Array.isArray(v) ? v.join(' ') : v, kind]);
}
function pointHint(item, given) {
  const sum = item.sum, P = askedPoint(sum);
  const g = sum.key === 'read' ? (Array.isArray(given) && given.length === 2 ? given.map(normalise) : null) : [normalise(Array.isArray(given) ? given[0] : given)];
  if (!g || (sum.key === 'read' && !g.every((x) => /^\d+$/.test(x)))) return null;
  const v = sum.key === 'read' ? g.map(Number).join(' ') : g[0];
  return pointSlipsOf(sum).find(([s]) => s === v)?.[1] ?? null;
}
function hintFor(item, given) {
  if (item.sum?.op === 'tpos') {
    const kind = pointHint(item, given), L = askedPoint(item.sum).name;
    if (kind === 'swap') return `Did you go across first, then up? Which number is on the x-axis under ${L}?`;
    if (kind === 'other') return `Which point is ${L}?`;
    if (kind === 'off') return HINTS.SPACES;
    if (kind === 'order') return HINTS.ORDER;
    if (kind === 'origin') return HINTS.ORIGIN;
    return null;
  }
  if (item.sum?.op !== 'tang') return null;
  const g = normalise(Array.isArray(given) ? given[0] : given);
  if (!/^\d+$/.test(g) || Number(g) === angleValue(item.sum)) return null;
  const kind = slipsOf(item.sum).find(([v]) => v === Number(g))?.[1];
  if (kind === 'back') return HINTS.BACK;
  if (kind === 'whole') return HINTS.WHOLE;
  if (kind === 'right') return HINTS.RIGHT;
  if (kind === 'added') return HINTS.ADDED;
  if (kind === 'left-out') return HINTS.LEFT_OUT;
  return null;
}
// every hint text hintFor gives for a problem, for the tools that list the lines to voice
export function hintLines(item) {
  if (item.sum?.op === 'tpos') return [...new Set(pointSlipsOf(item.sum).map(([v]) => hintFor(item, item.sum.key === 'read' ? v.split(' ') : v)).filter(Boolean))];
  return [...new Set(slipsOf(item.sum).map(([v]) => hintFor(item, String(v))).filter(Boolean))];
}

export default {
  skills: ['meas-angles', 'meas-position'],
  // opts.key makes that kind, opts.sum that very problem, opts.method works it that way (else her way for the group,
  // opts.ways, else the group's first), opts.also draws only a problem that way fits too, opts.op only a kind of that sum,
  // opts.easy the easy level
  make(skillId, rng, opts = {}) {
    const sum = sumFor(skillId, rng, Boolean(opts.easy), opts);
    const { picture, ...question } = problem(sum);
    const { method, steps } = wayFor(skillId, sum, wayAsked(skillId, opts));
    const way = METHODS[method];
    return { skill: skillId, key: sum.key, sum, method, ...question, steps, picture: picture ?? way.picture(sum), hint: way.hint(sum), words: way.words(sum) };
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
