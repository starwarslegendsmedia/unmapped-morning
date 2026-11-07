// Measurement (stage 6 strand 4, plans/2026-10-25-stage-6-plan.md "Strand 4: measurement"): the generator of the
// measurement skills, today meas-length's reading a scale (read), changing units (convert), perimeters (perimeter) and
// adding lengths in different units (total), meas-area's areas of rectangles (rectangle), a missing side (missing)
// and hectares (hectare), meas-area-shapes' areas of L-shapes (l-shape), parallelograms (parallelogram) and triangles
// (triangle), meas-volume's volumes of prisms of cubes (layers) and labelled prisms (prism), changing millilitres and
// litres (capacity) and reading a jug (jug), and meas-mass's reading the kitchen scales (read), changing grams, kilograms
// and tonnes (convert) and adding masses in different units (total), each a list of keys, its classes in classesOf and its
// question in problem. Every amount is decimal text with at most 3 places, worked in BigInt
// thousandths of its kind's smallest unit (engine/units.js), never a float; the ways that work them are in
// engine/measure-ways.js.
//
// meas-length, MA3-GM-02, "selects and uses the appropriate unit and device to measure lengths and distances including
// perimeters" (Outcomes, saved copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-outcomes.md l.276). Its
// read key: "Select and use an appropriate scaled instrument to measure lengths and distances", "A tape measure, ruler or
// trundle wheel." (Stage 2 Geometric measure B, saved copy 2026-10-28-2213-article-k-10-mathematics-k-10-syllabus-2022-
// fa620a8f93.md l.67-69), "Identify that there are 10 millimetres in one centimetre" and "Such as 53 mm or 6 cm 2 mm."
// (Stage 2 Geometric measure A, saved copy …fae78c0853.md l.61, l.67), "Use a variety of measuring devices to measure
// lengths and distances in different contexts" (Stage 3 Geometric measure A, saved copy …fa35c41b81.md l.59). Its convert
// key: "Measure 100 metres and recognise that 10 times 100 metres is one kilometre, ie 1000 metres = 1 kilometre" (S3 GM A
// l.47), "Record distances using the abbreviation for kilometres (km)", "Such as 1 km 200 m." (l.55-57), "a space should
// be left between the number and the abbreviated unit" (l.150); "Recognise the equivalence of whole-number and decimal
// representations of measurements of length", "Such as 165 cm is the same as 1.65 m." (Stage 3 Geometric measure B,
// saved copy …fae314fde1.md l.39-41), "Such as 13.5 cm is 13 centimetres and 5 millimetres" (l.43-45), "Such as 2.7 km."
// (l.47-49), "Use decimal place value system to convert between metres and kilometres", "Such as 2600 m is 2.6 km because
// there are 1000 m in one kilometre." (l.53-55), "More metres than kilometres will be needed to measure the same
// distance" (l.61-63), its teaching advice's place value (l.142-148); "Convert between metres and centimetres, and
// between centimetres and millimetres" and "Such as 1.25 m." (S2 GM B l.81-85). Its perimeter key: "Use efficient
// strategies to calculate the perimeter of a large rectangular area in metres", "A playground, netball courts.",
// "Calculate perimeters of common two-dimensional shapes, including squares, rectangles and triangles", "To calculate the
// perimeter of a rhombus, only one side length is required." (S3 GM A l.63-71), and its hexagon with 5 right angles,
// "The unmarked horizontal lines must add to 5 cm with the unmarked vertical lines adding to 4 cm." (l.122-126). Its
// total key: "Solve a variety of problems involving length and perimeter, including problems involving different units
// of length", "Find the total length of 3 items measuring 5 mm, 20 cm and 1.2 m." (S3 GM B l.71-73). The pages read live
// 28 October 2026 and saved 28 October 2026. NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28
// October 2026 (perimeter and total, 29 October 2026).
//
// meas-area, MA3-2DS-02, "selects and uses the appropriate unit to calculate areas, including areas of squares,
// rectangles and triangles" (Outcomes l.288). Its rectangle key: "Calculate areas of rectangles in square centimetres
// (cm²), square metres (m²) and square kilometres (km²)", "Record, using words, the method for finding the area of any
// rectangle", "Area of rectangle = number of units of length × number of units of width." (Stage 3 Two-dimensional
// spatial structure A, saved copy …fad7c142c4.md l.71-75), its teaching advice's rows of squares and its 6 cm by 4 cm
// rectangle with a row and a column of 1 cm squares along its edges (l.98-100), its grid "behind" the rectangle (l.104)
// and "students in Stage 3 should use words" (l.110); "Create the array structure of area using squares (1 cm × 1 cm) in rows and columns" (Stage 2 Two-dimensional
// spatial structure A, saved copy …fae82874e2.md l.95). Its missing key: "Establish the relationship between the lengths,
// widths and areas of rectangles", "Find the dimensions of different rectangles with an area of 24 cm²." (S3 2DS A
// l.69, l.77-79). Its hectare key: "Equate one hectare to the area of a square with side lengths of 100 m, ie 10 000
// square metres = 1 hectare (ha)", "Record areas using square kilometres and hectares" (l.61-63); "m2 is read as 'square
// metre(s)'" (l.132-134). The pages read live 28 October 2026 and saved 28 October 2026; NSW Mathematics K–10 Syllabus
// (2022), 16 June 2026 amendments, checked 28 October 2026 (the areas, 29 October 2026).
//
// meas-area-shapes, MA3-2DS-03, "combines, splits and rearranges shapes to determine the area of parallelograms and
// triangles" (Outcomes l.292). Its l-shape key: "Find different ways to calculate the area of a composite L-shape
// figure", NESA's own L-shape, 6 by 4 with a 3 by 2 corner gone, "split into 2 rectangles (2 by 3 and 2 by 6) to find the
// area (18)" (Stage 3 Two-dimensional spatial structure B, saved copy …fa0dfe5fec.md l.39-45), and its teaching advice's
// many ways of dissecting it (l.104). Its parallelogram key: "Show how to transform a parallelogram into a rectangle to
// find its area" (l.47-49), "Record, using words, a method for finding the area of any parallelogram", "Area of
// parallelogram = base × height." (l.57-59). Its triangle key: "Investigate the area of a triangle by comparing it to the
// area of a parallelogram with the same base length and height", "Establish the relationship between the area of a
// triangle and the area of a parallelogram formed by duplicating and rotating the triangle" (l.63-65), "The area of a
// triangle is half the area of a parallelogram with the same base and height." (l.73). The pages read live 28 October
// 2026 and saved 28 October 2026; NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026
// (the shapes against step 4.0's copy of the live page, 29 October 2026).
//
// meas-volume, MA3-3DS-02, "selects and uses the appropriate unit to estimate, measure and calculate volumes and
// capacities" (Outcomes l.300). Its layers key: "Describe arrangements of cubic-centimetre blocks in terms of layers",
// "Such as 5 layers of 8 cubic-centimetre blocks, where each layer is 4 rows of 2 blocks.", "Establish the relationship
// between the number of cubes in one layer and the number of layers to find the volume of a rectangular prism" (Stage 3
// Three-dimensional spatial structure B, saved copy …fa89ed4224.md l.46-50), "Describe the length, width and height of a
// rectangular prism as the dimensions of the prism" (l.44), its teaching advice's "row by column structure of each
// layer, multiplied by the number of layers" (l.101); "Such as 2 layers of 10 cubic-centimetre blocks." (Stage 2
// Three-dimensional spatial structure A, saved copy …fa8065c643.md l.70). Its prism key: "Estimate and measure volumes in
// cubic metres", "To determine the size of the classroom." (S3 3DS B l.38-40), "Record, using words, the method for
// finding the volumes of rectangular prisms", "Volume of rectangular prism = number of cubes in one layer × number of
// layers." (l.58-60), "Calculate volumes of rectangular prisms in cubic centimetres (cm³) and cubic metres (m³)" (l.66).
// Its capacity key: "Recognise the equivalence of whole-number and decimal representations of measurements of
// capacities", "Such as 375 mL is the same as 0.375 L.", "Interpret decimal notation for capacities", "Such as 8.7 L is
// the same as 8 litres and 700 millilitres.", "Record measurements to 3 decimal places", "Such as 1.275 L." (Stage 3
// Three-dimensional spatial structure A, saved copy …fa51e61164.md l.62-72), "Millilitres for a drinking glass, litres
// for a bucket." (l.50-52), "The abbreviation m3 is read as 'cubic metre(s)'" (l.125); "Such as 1250 mL = 1 litre 250
// millilitres." (Stage 2 Three-dimensional spatial structure B, saved copy …faa2ba21e4.md l.74). Its jug key: "Use a
// scaled instrument to relate 1000 millilitres to one litre" (S2 3DS B l.62). The pages read live 28 October 2026 and
// quoted in the plan (M4) with the saved copies' line numbers; NSW Mathematics K–10 Syllabus (2022), 16 June 2026
// amendments, checked 29 October 2026.
//
// meas-mass, MA3-NSM-01, "selects and uses the appropriate unit and device to measure the masses of objects, and converts
// between units of mass" (Outcomes l.304). Its read key: "Measure mass using scales" (Stage 3 Non-spatial measure A, saved
// copy …fa7e80b308.md l.46-48), its ingredients (l.30), and "real-life objects on a set of scales" (Stage 2 Non-spatial
// measure A l.83). Its convert key: "1250 g = 1.25 kg" (Stage 3 Non-spatial measure B, saved copy …faebab48ca.md l.28),
// "4.32 t", "2.08 kg" and "3 kg 250 g" (S3 NSM A l.40, l.44), "Conversion between metric units of mass relies on working
// with units of 1000" (S3 NSM B l.57). Its total key: "50 g + 750 g + 2.5 kg" (S3 NSM B l.32). The content points S3 NSM A
// l.26-30, l.38-48, l.77, l.91; S3 NSM B l.26-32, l.57; S2 NSM B l.28, l.38, l.42; S2 NSM A l.83, as the plan (M5) quotes
// them from the pages read live 28 October 2026; NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked
// against the plan's quotes 30 October 2026.
//
// Chosen for this game, not a syllabus requirement: a ruler, tape measure or set of kitchen scales read from a picture in
// place of a real device;
// the things measured (OBJECTS, no person or animal); the split and join forms with one box ("2.6 km = 2 km ☐ m"); a
// perimeter's sizes, an L-shape's missing corner half its width and height as NESA's own L-shape (engine/render/svg.js
// EXAMPLES), and total's amounts (plan M1, "Sizes"); an area's sizes, its places (a netball court, a farm, a field), a
// missing side's question and the hectare amounts (plan M2, "Sizes"); the shapes' sizes as M3 gives them, in cm² or m²
// half each at the usual level and in cm² at the easy level, as M2's easy rectangles, a triangle's apex over a point
// inside its base or at most half its base past its end, and every shape whose pictures the drawing cannot label left out
// (plan M3, "Sizes"); a jug read from a picture in place of a real one, what is in it (water, milk or juice), the boxes
// and rooms a labelled prism is, a prism's and a jug's sizes and the share of each kind of reading (plan M4, "Sizes");
// the kitchen things, the kitchen scales' sizes, the share of each kind of reading, and total's masses (plan M5, "Sizes");
// "2.60" taken for 2.6 (engine/check.js); the release 5 gate (engine/skills.js). Every problem is drawn from a list made
// once of every one the plan allows (plan, "Rules every measurement generator keeps"): the key first, each as often as the
// others; then its class by its weight; then a problem, each in its class as often as the others, and with opts.also
// only one both ways fit, whose boxed values differ by each. A problem is left out where the answer's number is in the text before the answer step, by any
// way of its group: a pencil 0.5 cm long on a ruler of halves ("each space is ☐ cm", 0.5), "0.3 cm = ☐ mm" (the chart's
// 3), "0.001 km = ☐ m" ("1 km is 1000 m").

import { METHODS, wayFor, wayFits } from '../methods.js';
import { BY_ID } from '../skills.js';
import { drawSum } from './fractions.js';
import { thousandths, normalise } from '../check.js';
import { decimalText } from './decimals.js';
import { UNITS, amountText, unitWords, inBase, fromBase } from '../units.js';
import { SMALLER, scaleOf, readValue, convertValue, convertAsk, pairOf, totalBase, totalValue, totalWhole, totalAsk, perimeterValue, shapeName, triLengths, squaresFit, areaValue,
  asConvert, AREA_SHAPES, shapePicture, volumeValue, prismPicture, contents } from '../measure-ways.js';
import { renderPicture } from '../render/svg.js';

// the kinds of problem (plans M1 and M2, "Keys and asks"), and those of the easy level ("Sizes"), which the worked
// examples come from; total, missing, hectare and triangle are the usual level's only (plan M3: "Easy: l-shape … and
// parallelogram …")
export const KEYS = { 'meas-length': ['read', 'convert', 'perimeter', 'total'], 'meas-area': ['rectangle', 'missing', 'hectare'], 'meas-area-shapes': ['l-shape', 'parallelogram', 'triangle'],
  'meas-volume': ['layers', 'prism', 'capacity', 'jug'], 'meas-mass': ['read', 'convert', 'total'] };
export const EASY = { 'meas-length': ['read', 'convert', 'perimeter'], 'meas-area': ['rectangle'], 'meas-area-shapes': ['l-shape', 'parallelogram'], 'meas-volume': ['layers', 'jug'],
  'meas-mass': ['read', 'convert'] };

// The things measured (plan, "Rules every measurement generator keeps"), chosen for this game: on a ruler or a tape
// measure, and the places a large rectangle in metres is (S3 GM A l.65, "A playground, netball courts."), never a person
// or an animal, no digits (every number in a question is one the problem draws). The sum keeps the name, "the pencil",
// which its steps say.
export const OBJECTS = {
  ruler: [{ id: 'pencil', the: 'the pencil', a: 'a pencil' }, { id: 'crayon', the: 'the crayon', a: 'a crayon' }, { id: 'key', the: 'the key', a: 'a key' },
    { id: 'leaf', the: 'the leaf', a: 'a leaf' }, { id: 'feather', the: 'the feather', a: 'a feather' }, { id: 'shell', the: 'the shell', a: 'a shell' },
    { id: 'eraser', the: 'the eraser', a: 'an eraser' }, { id: 'ribbon', the: 'the ribbon', a: 'a ribbon' }],
  tape: [{ id: 'rope', the: 'the rope', a: 'a rope' }, { id: 'plank', the: 'the plank', a: 'a plank' }, { id: 'mat', the: 'the mat', a: 'a mat' },
    { id: 'bench', the: 'the bench', a: 'a bench' }, { id: 'hose', the: 'the hose', a: 'a hose' }, { id: 'curtain', the: 'the curtain', a: 'a curtain' }],
  place: [{ id: 'playground', the: 'the playground', a: 'a playground' }, { id: 'netball-court', the: 'the netball court', a: 'a netball court' },
    { id: 'vegetable-garden', the: 'the vegetable garden', a: 'a vegetable garden' }, { id: 'backyard', the: 'the backyard', a: 'a backyard' }],
  // a rectangle in square kilometres (plan M2, "A farm is a rectangle 6 km long and 4 km wide."), and the fields an area
  // in hectares is (S3 2DS A l.61-63)
  farm: [{ id: 'farm', the: 'the farm', a: 'a farm' }],
  field: [{ id: 'field', the: 'the field', a: 'a field' }, { id: 'farm-paddock', the: 'the farm paddock', a: 'a farm paddock' }, { id: 'park', the: 'the park', a: 'a park' }],
  // what is in a jug, its a the word the question and the picture say ("There is ☐ L of water in the jug."); the rooms a
  // volume in cubic metres is (S3 3DS B l.40, "To determine the size of the classroom."), and the boxes one in cubic
  // centimetres is (plan M4)
  jug: [{ id: 'water', the: 'the water', a: 'water' }, { id: 'milk', the: 'the milk', a: 'milk' }, { id: 'juice', the: 'the juice', a: 'juice' }],
  room: [{ id: 'classroom', the: 'the classroom', a: 'a classroom' }, { id: 'storeroom', the: 'the storeroom', a: 'a storeroom' },
    { id: 'garden-shed', the: 'the garden shed', a: 'a garden shed' }],
  box: [{ id: 'box', the: 'the box', a: 'a box' }, { id: 'shoebox', the: 'the shoebox', a: 'a shoebox' }, { id: 'gift-box', the: 'the gift box', a: 'a gift box' }],
  // on the kitchen scales (S3 NSM A l.30, "ingredients"; plan M5): food and a parcel, never a person or an animal
  kitchen: [{ id: 'flour', the: 'the bag of flour', a: 'a bag of flour' }, { id: 'pumpkin', the: 'the pumpkin', a: 'a pumpkin' }, { id: 'watermelon', the: 'the watermelon', a: 'a watermelon' },
    { id: 'apples', the: 'the box of apples', a: 'a box of apples' }, { id: 'potatoes', the: 'the bag of potatoes', a: 'a bag of potatoes' }, { id: 'parcel', the: 'the parcel', a: 'a parcel' },
    { id: 'rice', the: 'the bag of rice', a: 'a bag of rice' }, { id: 'cabbage', the: 'the cabbage', a: 'a cabbage' }],
};
// the things a sum is told with: a reading's by its device (a jug's what is in it, the kitchen scales' what is on them), a large rectangle's in metres its
// places, a rectangle's area in square kilometres the farm, a field's area in hectares its fields, a labelled prism's
// volume in cubic metres its rooms and in cubic centimetres its boxes; none for the rest
function thingsOf(sum) {
  if (sum.op === 'mread') return OBJECTS[sum.device];
  if (sum.op === 'mvol') return sum.cubes ? null : { m: OBJECTS.room, cm: OBJECTS.box }[sum.unit];
  if (sum.op === 'mper') return sum.unit === 'm' ? OBJECTS.place : null;
  if (sum.op !== 'marea') return null;
  if (sum.form === 'field') return OBJECTS.field;
  return sum.key === 'rectangle' ? { m: OBJECTS.place, km: OBJECTS.farm }[sum.unit] ?? null : null;
}
// the place a sum is told with, by its name ("the netball court")
const placeOf = (sum) => Object.values(OBJECTS).flat().find((c) => c.the === sum.name);

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const NB = ' ';
const cap = (t) => t[0].toUpperCase() + t.slice(1);

// ---- read (plan M1, "Sizes"): a ruler in centimetres or a tape measure in metres, half each; parts 2 on 7 marks, 4 on
// 4 marks or 5 on 3 marks, so a scale across has 10 or 12 small spaces; the first mark 0 to 20 (cm) or 0 to 10 (m) ----

const DEVICES = { ruler: { unit: 'cm', firstMost: 20 }, tape: { unit: 'm', firstMost: 10 } };
// parts 2 one reading in 10 at the usual level, 4 and 5 the rest, so one space past the mark before is about 36% of the
// readings (plan, "What strands 1 to 3 taught": at most 40%)
const PARTS = { 2: { marks: 7, weight: 2 }, 4: { marks: 4, weight: 9 }, 5: { marks: 3, weight: 9 } };
// half from the first mark, which is 0; half from a labelled mark past 0, the first mark past 0 or a later one with the
// first mark 0, a quarter each
const STARTS = { zero: 2, first: 1, later: 1 };
// whether one small space is a whole number of the smaller unit: a ruler's halves and fifths (5 and 2 mm), not its
// quarters (2.5 mm); every space of a tape (50, 25, 20 cm)
const wholeSpace = (device, parts) => (UNITS[DEVICES[device].unit].base * 1000n / UNITS[SMALLER[DEVICES[device].unit]].base) % (BigInt(parts) * 1000n) === 0n;

// every reading of one class: its scales (the first mark f), where it starts (s spaces) and ends (e spaces, d past the
// labelled mark before)
function readings(device, parts, start, past, ask) {
  const { unit, firstMost } = DEVICES[device], n = PARTS[parts].marks;
  const firsts = start === 'first' ? range(1, firstMost) : [0];
  const out = [];
  for (const f of firsts) {
    const marks = range(f, f + n - 1).map(String);
    const froms = start === 'later' ? range(1, n - 2) : [0];
    for (const j of froms) {
      for (const before of range(j, n - 2)) out.push({ op: 'mread', key: 'read', device, unit, marks, parts, start: j * parts, end: before * parts + past, ask });
    }
  }
  return out;
}
// read's classes: by device, parts, where it starts, how many spaces past the mark before it ends (each its parts allows
// as often as the others) and the unit of the box, the smaller one half the problems that allow it (from 0, one space
// a whole number of it); easy, from 0 on a ruler or a tape, parts 2 or 5, the box in the device's unit
function readClasses(easy) {
  const out = [];
  for (const device of Object.keys(DEVICES)) {
    const { unit } = DEVICES[device];
    for (const parts of easy ? [2, 5] : [2, 4, 5]) {
      for (const start of easy ? ['zero'] : Object.keys(STARTS)) {
        for (const past of range(1, parts - 1)) {
          const boxes = !easy && start === 'zero' && wholeSpace(device, parts) ? [unit, SMALLER[unit]] : [unit];
          for (const ask of boxes) {
            const weight = (easy ? 1 : PARTS[parts].weight * STARTS[start]) / (parts - 1) / boxes.length;
            out.push({ name: `${device} in ${parts}, from ${start === 'zero' ? '0' : `a ${start} mark`}, ${past} past, in ${ask}`, weight, sums: readings(device, parts, start, past, ask),
              group: `${device} ${parts} ${start}` });
          }
        }
      }
    }
  }
  return out;
}

// ---- convert (plan M1, "Sizes"): millimetres and centimetres, centimetres and metres, or metres and kilometres, a third
// each; the amount N in the smaller unit a whole number and never a multiple of the pair's factor, so the larger unit
// always has a decimal part; to-larger and to-smaller N from 1, split and join N past the factor, so the whole part is
// at least 1; the four forms a quarter each ----

// each pair's most N, and whether the easy level asks it
const PAIRS = [{ small: 'mm', large: 'cm', most: 999 }, { small: 'cm', large: 'm', most: 9999, easy: true }, { small: 'm', large: 'km', most: 99999, easy: true }];
// Fact 10 (plan "What the pages and code cannot settle"): the voice tools list every problem by every way
// (tools/voice-lines.mjs every), and over all of them (about 10^5 a form) voice-lines took 95 s against 9 s before, past 3
// times, so each class keeps at most CAP starting amounts, taken evenly through its own so every size of number stays
// (step 4.2, test first), and always NESA's own: "53 mm or 6 cm 2 mm" (Stage 2 Geometric measure A, saved copy
// …fae78c0853.md l.67), "1.25 m" (Stage 2 Geometric measure B, saved copy …fa620a8f93.md l.85), "1 km 200 m" (S3 GM A
// l.57), "165 cm is the same as 1.65 m", "13.5 cm", "2.7 km", "2600 m is 2.6 km" (S3 GM B l.41, l.45, l.49, l.55), each as N
// in the smaller unit
const CAP = 150;
// and capacity's (meas-volume, plan M4): "375 mL is the same as 0.375 L", "8.7 L is the same as 8 litres and 700
// millilitres", "1.275 L" (S3 3DS A l.64, l.68, l.72), "1250 mL = 1 litre 250 millilitres" (S2 3DS B l.74); and mass's
// (meas-mass, plan M5): "1250 g", "2.08 kg", "3 kg 250 g" and "4.32 t" (S3 NSM B l.28, S3 NSM A l.40, l.44)
const NESA = { mm: [53, 62, 135], cm: [125, 165], m: [1200, 2600, 2700], mL: [375, 1250, 1275, 8700], g: [1250, 2080, 3250], kg: [4320] };
const evenly = (list, k) => (list.length <= k ? list : Array.from({ length: k }, (_, i) => list[Math.floor((i * list.length) / k)]));
const FORMS = ['to-larger', 'to-smaller', 'split', 'join'];
// the decimal places of N in the larger unit, and whether its decimal part has an empty place inside it ("2.08",
// "1.005", "0.065")
function placesOf(n, factor) {
  let places = String(factor).length - 1, rest = n % factor;
  while (rest % 10 === 0) { rest /= 10; places -= 1; }
  const part = String(n % factor).padStart(String(factor).length - 1, '0').slice(0, places);
  return { places, empty: part.slice(0, -1).includes('0') };
}
// a convert sum from N: the amount in the unit it is given in; key capacity's the same, between millilitres and litres
function convertSum(form, { small, large }, n, key = 'convert') {
  const larger = fromBase(BigInt(n) * UNITS[small].base * 1000n, large);
  if (form === 'to-larger' || form === 'join') return { op: 'mconv', key, form, value: String(n), from: small, to: large };
  return { op: 'mconv', key, form, value: larger, from: large, to: small };
}
// convert's classes: each form and pair as often as the others; for metres and kilometres a third each with 1, 2 and 3
// decimal places, for centimetres and metres half each with 1 and 2; where a place can be empty, about 2 in 3 with one
// (so about 1 in 4 of the key, plan M1); easy, centimetres and metres or metres and kilometres, to-larger and to-smaller,
// one decimal place, N at most 9999. Capacity's (plan M4) the same for millilitres and litres alone, its key's own, where
// with only a pair of factor 1000 an empty place 3 times in 8 of the places that can have one keeps it about 1 in 4; and
// mass's (plan M5) for grams and kilograms twice as often as kilograms and tonnes (a pair's weight), both of factor 1000,
// so an empty place 3 times in 8 as capacity's, at most most starting amounts a class
function convertClasses(easy, pairs = PAIRS, key = 'convert', shares = { empty: 2 / 3, plain: 1 / 3 }, most = CAP) {
  const out = [];
  for (const form of easy ? FORMS.slice(0, 2) : FORMS) {
    for (const pair of easy ? pairs.filter((p) => p.easy) : pairs) {
      const factor = Number(UNITS[pair.large].base / UNITS[pair.small].base), top = easy ? Math.min(pair.most, 9999) : pair.most;
      const lo = form === 'split' || form === 'join' ? factor + 1 : 1;
      const by = new Map();
      for (let n = lo; n <= top; n++) {
        if (n % factor === 0) continue;
        const { places, empty } = placesOf(n, factor);
        if (easy && places !== 1) continue;
        const at = `${places}${empty ? ' empty' : ''}`;
        if (!by.has(at)) by.set(at, []);
        by.get(at).push(n);
      }
      for (const [at, ns] of by) {
        const nesa = ns.filter((n) => NESA[pair.small].includes(n));
        by.set(at, [...evenly(ns.filter((n) => !nesa.includes(n)), most - nesa.length), ...nesa].sort((x, y) => x - y).map((n) => convertSum(form, pair, n, key)));
      }
      const placesSeen = new Set([...by.keys()].map((k) => k[0]));
      for (const [at, sums] of by) {
        const both = by.has(`${at[0]} empty`) && by.has(at[0]);
        const weight = (pair.weight ?? 1) / placesSeen.size * (both ? (at.includes('empty') ? shares.empty : shares.plain) : 1);
        out.push({ name: `${form} ${pair.small} and ${pair.large}, ${at[0]} place${at[0] === '1' ? '' : 's'}${at.includes('empty') ? ', an empty place' : ''}`, weight, sums });
      }
    }
  }
  return out;
}

// ---- perimeter (plan M1, "Sizes"): sides whole numbers, in centimetres 2 to 20, a large rectangle in metres 10 to 120;
// a rectangle a third of the problems (half of those in metres, told with a place), a square, a triangle, a rhombus
// and the L-shape a sixth each; a rectangle never a square, its length the longer side; a triangle by the triangle rule,
// its sides shortest first, scalene, isosceles and equilateral a third each; the L-shape 4 to 20 wide and 3 to 20 high,
// its missing corner half of each (rounded down), as NESA's own L-shape, 6 by 4 with a corner of 3 by 2 (chosen for this
// game: its corner is no number of the question). A rectangle in metres never has its sides 1 m apart: drawn to scale on
// her screen it looks a square with two different labels (step 4.3's code review, finding 1). Easy: rectangles and
// squares in centimetres, sides 2 to 10, the rectangles twice as often as the squares, as at the usual level ----

const perimeterOf = (kind, sides, unit = 'cm') => ({ op: 'mper', key: 'perimeter', kind, sides, unit });
const rectangles = (lengths, unit) => lengths.flatMap((w) => lengths.filter((l) => l > w).map((l) => perimeterOf('rect', { l, w }, unit)));
function perimeterClasses(easy) {
  const cm = range(2, easy ? 10 : 20), squares = cm.map((s) => perimeterOf('square', { s }));
  if (easy) return [{ name: 'rectangle in cm', weight: 2, sums: rectangles(cm, 'cm') }, { name: 'square', weight: 1, sums: squares }];
  const triangles = cm.flatMap((a) => cm.flatMap((b) => cm.filter((c) => a <= b && b <= c && c < a + b).map((c) => perimeterOf('tri', { a, b, c }))));
  const lshapes = range(4, 20).flatMap((W) => range(3, 20).map((H) => perimeterOf('lshape', { W, H, cw: Math.floor(W / 2), ch: Math.floor(H / 2) })));
  return [{ name: 'rectangle in cm', weight: 1 / 6, sums: rectangles(cm, 'cm') }, { name: 'rectangle in m', weight: 1 / 6, sums: rectangles(range(10, 120), 'm').filter(({ sides }) => sides.l - sides.w > 1) },
    { name: 'square', weight: 1 / 6, sums: squares }, { name: 'rhombus', weight: 1 / 6, sums: cm.map((s) => perimeterOf('rhombus', { s })) },
    ...[['scalene', 3], ['isosceles', 2], ['equilateral', 1]].map(([name, n]) => ({ name: `${name} triangle`, weight: 1 / 18, sums: triangles.filter((t) => triLengths(t.sides) === n) })),
    { name: 'L-shape', weight: 1 / 6, sums: lshapes }];
}

// ---- total (plan M1, "Sizes"): one finite table, the only list problemsOf, the exhaustive checks and the voice tools
// read. Its classes, each (the unit asked; the other parts' units), every part in mm, cm and m or in m and km, one part
// always in the unit asked and at most 2 to change: 2 parts a weight of 1/16 each, 3 parts 1/10 each, so half each ----

const TOTAL_CLASSES = [['mm', ['cm']], ['cm', ['mm']], ['cm', ['m']], ['m', ['cm']], ['mm', ['m']], ['m', ['mm']], ['m', ['km']], ['km', ['m']],
  ['cm', ['mm', 'm']], ['mm', ['cm', 'm']], ['m', ['mm', 'cm']], ['m', ['km', 'km']], ['km', ['m', 'm']]];
// each part's amounts as written, by its unit and the unit asked: in the unit asked, whole, and its halves only where
// the unit asked is not the sum's smallest (so a part already in the smallest unit is always whole); in a smaller unit,
// whole and never a multiple of the factor; in a larger, never whole and with no more places than the factor has zeros
// (so an answer in the smallest unit is always whole)
// (mass's, meas-mass, plan M5: grams, kilograms and tonnes, its kilograms and tonnes each with their halves where the unit
// asked is not the smallest, a smaller unit's 50 to 1200 and a larger's M1's own)
const MASS_SMALLER = ['50', '120', '250', '300', '450', '600', '750', '800', '900', '1200'], MASS_ASKED = ['2', '3', '4', '5', '6', '8', '10', '12', '15', '20'];
const IN_ASKED = { mm: ['5', '8', '12', '15', '25', '35', '40', '60', '75', '90'], cm: ['2', '5', '12', '20', '25', '30', '45', '60', '75', '85'],
  m: ['2', '5', '12', '20', '35', '40', '60', '75', '150', '250'], km: ['2', '3', '4', '5', '6', '7', '8', '10', '12', '15'], g: MASS_SMALLER, kg: MASS_ASKED, t: MASS_ASKED };
const IN_ASKED_HALVES = { mm: [], cm: ['2.5', '4.5', '12.5', '20.5'], m: ['1.5', '2.5', '4.5', '12.5'], km: ['0.5', '1.5', '2.5', '3.5'], g: [], kg: ['0.5', '1.5', '2.5', '3.5'],
  t: ['0.5', '1.5', '2.5', '3.5'] };
const IN_LARGER = ['0.6', '0.75', '1.08', '1.2', '1.25', '1.5', '2.4', '2.5', '3.05', '4.2'];
const IN_OTHER = { 'mm cm': ['2', '3', '4', '5', '6', '7', '8', '9', '15', '25'], 'mm m': ['2', '5', '8', '15', '25', '40', '75', '90', '1250', '1500'],
  'cm m': ['5', '15', '20', '25', '45', '50', '75', '80', '120', '135'], 'm km': ['50', '120', '250', '300', '450', '600', '750', '800', '900', '1200'],
  'cm mm': ['0.5', '1.5', '2.5', '3.5', '4.5', '6.5', '7.5', '10.5', '12.5', '20.5'], 'm cm': IN_LARGER, 'm mm': IN_LARGER, 'km m': IN_LARGER,
  'g kg': MASS_SMALLER, 'kg t': MASS_SMALLER, 'kg g': IN_LARGER, 't kg': IN_LARGER };
const amountsIn = (unit, to, smallest) => (unit === to ? [...IN_ASKED[to], ...(smallest ? [] : IN_ASKED_HALVES[to])] : IN_OTHER[`${unit} ${to}`]);
// a part's place in an order: by its unit, then by its amount
const byUnit = (sign) => (p, q) => sign * Number(UNITS[p.unit].base - UNITS[q.unit].base) || Number(thousandths(p.value) - thousandths(q.value));
// every combination of a class's lists (two parts in one unit two different amounts), each written two ways, half
// each: the smallest unit first (NESA's own order) or the largest first, within one unit the smaller amount first; a
// table's classes and each one's weight by how many other parts it has
function totalClasses(table = TOTAL_CLASSES, weightOf = (others) => (others.length === 1 ? 1 / 16 : 1 / 10)) {
  return table.map(([to, others]) => {
    const units = [to, ...others], smallest = units.every((u) => UNITS[u].base >= UNITS[to].base);
    let combos = [[]];
    units.forEach((unit, i) => {
      const list = amountsIn(unit, to, smallest), same = units.indexOf(unit) < i;
      combos = combos.flatMap((c) => list.filter((v) => !same || thousandths(v) > thousandths(c[units.indexOf(unit)].value)).map((value) => [...c, { value, unit }]));
    });
    const sums = combos.flatMap((parts) => [1, -1].map((sign) => ({ op: 'mtotal', key: 'total', parts: [...parts].sort(byUnit(sign)), to })));
    return { name: `${units.length} parts, in ${to}; ${others.join(', ')}`, weight: weightOf(others), sums };
  });
}

// ---- meas-mass (plan M5, "Sizes") ----

// read: the kitchen scales in kilograms, 0 to 3 with parts 4 (250 g a space), 0 to 2 with 5 (200 g), 0 to 6 with 2 (500
// g), and 0 to 1 with 2, 4 or 5, read from 0; the pointer never on a labelled mark; the box in kilograms or in grams, half
// each. As the jug's (M4): in each box parts 2 one reading in 10 and parts 4 and 5 the rest, half each, each of a parts'
// marks and each count of spaces past the mark before as often as the others, so 1 space past is at most 40% (plan step
// 4.2 Do 4); a class the rules leave empty shares its weight within its box and its parts' share, so each box stays half
// and parts 2 one in 10. Left out by the rules: a reading 1 space from 0, the space's own worth (so all of 0 to 1 in
// halves), and every reading in grams under 1 kg, whose "it comes to ☐ g" by the smaller unit boxes its answer before the
// answer step (step 4.7, the lead's ruling (b), as step 4.6's jug in mL under 1 L). Easy: parts 2, the box in kilograms,
// every reading as often as the others
const KITCHEN_MARKS = { 2: [range(0, 6).map(String), ['0', '1']], 4: [['0', '1', '2', '3'], ['0', '1']], 5: [['0', '1', '2'], ['0', '1']] };
const kitchenOf = (marks, parts, ask) => (end) => ({ op: 'mread', key: 'read', device: 'kitchen', unit: 'kg', marks, parts, start: 0, end, ask });
function kitchenClasses(easy) {
  if (easy) return [{ name: 'kitchen scales in halves, in kg', weight: 1, sums: KITCHEN_MARKS[2].flatMap((marks) => jugEnds(marks, 2, 1).map(kitchenOf(marks, 2, 'kg'))) }];
  return ['kg', 'g'].flatMap((ask) => Object.entries(KITCHEN_MARKS).flatMap(([p, sets]) => sets.flatMap((marks) => range(1, Number(p) - 1).map((past) => ({
    name: `kitchen scales 0 to ${marks.at(-1)} kg in ${p}, ${past} past, in ${ask}`, weight: ((p === '2' ? 1 / 10 : 9 / 20) / sets.length / (Number(p) - 1)) / 2,
    sums: jugEnds(marks, Number(p), past).map(kitchenOf(marks, Number(p), ask)), group: `${ask} ${p === '2' ? 'halves' : 'more'}` })))));
}
// convert: convert's four forms, a quarter each, for grams and kilograms two thirds of the problems and kilograms and
// tonnes one third; N in the smaller unit from 1 to 99 999, never a multiple of 1000; a third each with 1, 2 and 3 places;
// about 1 in 4 with an empty place ("2.08 kg"); split and join above 1000. Easy: grams and kilograms, to-larger and
// to-smaller, one place, N at most 9999 as M1's easy level. Fact 10: at M1's cap of 150 starting amounts a class (5,986
// usual problems) meas-mass added 12.7 s of user time to tools/piece-lines.mjs, past fact 10's 10 s (step 4.7, base and
// game run at once under one load), so each class keeps at most MASS_CAP, taken evenly through its own as convert's are,
// and always NESA's four (step 4.7, test first); total's table, M5's own, whole
const MASS_PAIRS = [{ small: 'g', large: 'kg', most: 99999, weight: 2, easy: true }, { small: 'kg', large: 't', most: 99999, weight: 1 }];
const MASS_CAP = 50;
const massConvertClasses = (easy) => convertClasses(easy, MASS_PAIRS, 'convert', { empty: 3 / 8, plain: 5 / 8 }, MASS_CAP);
// total: one finite table as M1's (its orders, exclusions and exact whole-number check the same), each class (the unit
// asked; the other parts' units) a weight of 1/8, the usual level only
const MASS_TOTAL_CLASSES = [['g', ['kg']], ['kg', ['g']], ['kg', ['t']], ['t', ['kg']], ['kg', ['g', 'g']], ['g', ['kg', 'kg']], ['t', ['kg', 'kg']], ['kg', ['t', 't']]];
const massTotalClasses = () => totalClasses(MASS_TOTAL_CLASSES, () => 1 / 8);

// ---- rectangle (plan M2, "Sizes"): in cm², sides 2 to 12; in m², 10 to 60, told with its place; in km², 2 to 15, told
// with the farm; a third each; never a square, its length the longer side, so the area is never a side. A rectangle in
// m² never has its sides 1 m apart, as a perimeter's in metres (step 4.3's code review, finding 1): drawn about 3 px a
// metre (60 by 59 m), it would look a square with two different labels; in cm² and km² 1 apart is drawn 14 px or more
// apart. Easy: in cm², sides 2 to 10, the longer at most 3 times the shorter, so its edge squares are drawn square ----

const areaOf = (key, unit, more = {}) => (sides) => ({ op: 'marea', key, kind: 'rect', sides, unit, ...more });
// every rectangle with sides lo to hi, its length the longer
const sidesIn = (lo, hi) => range(lo, hi).flatMap((w) => range(lo, hi).filter((l) => l > w).map((l) => ({ l, w })));
function rectangleClasses(easy) {
  if (easy) return [{ name: 'rectangle in cm², edge squares', weight: 1, sums: sidesIn(2, 10).filter(squaresFit).map(areaOf('rectangle', 'cm')) }];
  return [{ name: 'rectangle in cm²', weight: 1 / 3, sums: sidesIn(2, 12).map(areaOf('rectangle', 'cm')) },
    { name: 'rectangle in m²', weight: 1 / 3, sums: sidesIn(10, 60).filter(({ l, w }) => l - w > 1).map(areaOf('rectangle', 'm')) },
    { name: 'rectangle in km²', weight: 1 / 3, sums: sidesIn(2, 15).map(areaOf('rectangle', 'km')) }];
}
// ---- missing (plan M2, "Sizes"): sides 2 to 12, in cm² or m², the length or the width given, a quarter each; never a
// square, so the answer is never the side given ----
const missingClasses = () => ['cm', 'm'].flatMap((unit) => ['w', 'l'].map((unknown) => ({ name: `missing ${unknown === 'w' ? 'width' : 'length'}, in ${unit}²`, weight: 1 / 4,
  sums: sidesIn(2, 12).map(areaOf('missing', unit, { unknown })) })));
// ---- hectare (plan M2, "Sizes"): to-larger, to-smaller and a field, a third each. to-larger amounts a multiple of 100
// from 1100 to 989 900 m², never of 10 000, under 10 000 m² (where whole units first stops) 1 in 6, and with 1 or 2
// places in hectares half each; to-smaller 1.1 to 99.9 ha with 1 place or 1.01 to 99.99 with 2, half each, never whole;
// a field's sides multiples of 10 from 100 to 500 m, its length the longer, its area a multiple of 1000 m² and never of
// 10 000, so the answer has one place. Fact 10: with every amount (19,592 changes of units) tools/piece-lines.mjs --json
// took 123.8 s, past its 120 s (105.2 s before step 4.4), so each to-larger and to-smaller class keeps at most CAP
// starting amounts, taken evenly through its own as convert's are, and always M2's own 25 000 m², 3.5 ha and 5000 m²
// (step 4.4, test first); the field whole ----
const M2_OWN = ['25000', '3.5', '5000'];
function capped(sums) {
  const own = sums.filter((s) => M2_OWN.includes(s.value));
  return [...evenly(sums.filter((s) => !own.includes(s)), CAP - own.length), ...own].sort((x, y) => (thousandths(x.value) < thousandths(y.value) ? -1 : 1));
}
const hectareOf = (form, value) => (form === 'to-larger' ? { op: 'marea', key: 'hectare', form, value, from: 'm²', to: 'ha' } : { op: 'marea', key: 'hectare', form, value, from: 'ha', to: 'm²' });
function hectareClasses() {
  // to-larger in hundreds of square metres, 11 to 9899, never a multiple of 100 (10 000 m²)
  const hundreds = range(11, 9899).filter((k) => k % 100);
  const larger = (under, places) => hundreds.filter((k) => (k < 100) === under && (k % 10 === 0) === (places === 1)).map((k) => hectareOf('to-larger', String(k * 100)));
  const toLarger = [true, false].flatMap((under) => [1, 2].map((places) => ({ name: `to-larger, ${under ? 'under' : 'at least'} 1 ha, ${places} place${places === 1 ? '' : 's'}`,
    weight: (under ? 1 / 6 : 5 / 6) / 2 / 3, sums: capped(larger(under, places)) })));
  const ones = range(1, 99), tenths = range(1, 9);
  const toSmaller = [{ name: 'to-smaller, 1 place', weight: 1 / 6, sums: capped(ones.flatMap((n) => tenths.map((d) => hectareOf('to-smaller', `${n}.${d}`)))) },
    { name: 'to-smaller, 2 places', weight: 1 / 6, sums: capped(ones.flatMap((n) => range(1, 99).filter((d) => d % 10).map((d) => hectareOf('to-smaller', `${n}.${String(d).padStart(2, '0')}`)))) }];
  const fields = sidesIn(10, 50).map(({ l, w }) => ({ l: 10 * l, w: 10 * w })).filter(({ l, w }) => (l * w) % 1000 === 0 && (l * w) % 10000)
    .map((sides) => ({ op: 'marea', key: 'hectare', form: 'field', sides, unit: 'm', from: 'm²', to: 'ha' }));
  return [...toLarger, ...toSmaller, { name: 'field', weight: 1 / 3, sums: fields }];
}

// ---- l-shape, parallelogram and triangle (plan M3, "Sizes"): in cm² or m², half each, at the usual level, in cm² at
// the easy level (as M2's easy rectangles: a worked example's one unit). An L-shape W 4 to 12 wide and H 3 to 10 high, its
// corner cw 1 to W − 2 by ch 1 to H − 1 missing from its top right (engine/render/svg.js shape), never one whose corner's
// area is its own (that step's value would be the answer); easy, W at most 6 and H at most 5. A parallelogram's base 3 to
// 15, its top edge's offset o, height h and slanted side s one of the plan's triples, o under the base (less than it), so
// the drawing is true; its slanted side labelled half the time at the usual level, never at the easy level, where base
// and height are at most 10. A triangle's base 3 to 16 and height 2 to 12, base × height even, so its area is whole; its
// apex over a point inside its base two thirds of the time (an end would put its height on a side), past its end a third,
// at most half the base past it (chosen for this game) ----

const SHAPE_UNITS = ['cm', 'm'];
const TRIPLES = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15]];
const shapeOf = (key, kind, unit, sides, more = {}) => ({ op: 'marea', key, kind, sides, unit, ...more });
function lshapeClasses(easy) {
  const sums = (unit, wide, high) => range(4, wide).flatMap((W) => range(3, high).flatMap((H) => range(1, W - 2).flatMap((cw) => range(1, H - 1)
    .filter((ch) => W * H !== 2 * cw * ch).map((ch) => shapeOf('l-shape', 'lshape', unit, { W, H, cw, ch })))));
  if (easy) return [{ name: 'L-shape in cm², at most 6 by 5', weight: 1, sums: sums('cm', 6, 5) }];
  return SHAPE_UNITS.map((unit) => ({ name: `L-shape in ${unit}²`, weight: 1 / 2, sums: sums(unit, 12, 10) }));
}
function parallelogramClasses(easy) {
  const sums = (unit, slant, most) => range(3, most).flatMap((b) => TRIPLES.filter(([o, h]) => o < b && h <= most)
    .map(([o, h, s]) => shapeOf('parallelogram', 'para', unit, { b, h, o, s }, slant ? { slant: true } : {})));
  if (easy) return [{ name: 'parallelogram in cm², base and height at most 10', weight: 1, sums: sums('cm', false, 10) }];
  return SHAPE_UNITS.flatMap((unit) => [true, false].map((slant) => ({ name: `parallelogram in ${unit}²${slant ? ', its slanted side labelled' : ''}`, weight: 1 / 4, sums: sums(unit, slant, 15) })));
}
// a triangle asked for at the easy level (a round's key at her level, js/runner.js) is one of the usual level's, as a
// missing side is
function triangleClasses() {
  const sums = (unit, past) => range(3, 16).flatMap((b) => range(2, 12).filter((h) => (b * h) % 2 === 0)
    .flatMap((h) => (past ? range(b + 1, b + Math.floor(b / 2)) : range(1, b - 1)).map((o) => shapeOf('triangle', 'ptri', unit, { b, h, o }))));
  return SHAPE_UNITS.flatMap((unit) => [false, true].map((past) => ({ name: `triangle in ${unit}², its apex ${past ? 'past its base\'s end' : 'over its base'}`,
    weight: (past ? 1 / 3 : 2 / 3) / 2, sums: sums(unit, past) })));
}

// ---- layers, prism, capacity and jug (plan M4, "Sizes") ----

// layers: a prism of 1 cm cubes 2 to 6 long, 2 to 4 wide and 2 to 5 high (the picture's cubes limits, engine/render/svg.js
// prism), so its volume, at least 8, is never a count its picture's words say; easy, every side at most 3. prism: its
// three edges labelled, in cm³ sides 2 to 12 (told with a box), in m³ 2 to 10 long and wide and 2 to 4 high (with a
// room, so no classroom is 6 m high: step 4.6's fix round, F3, review R's (3), the lead's ruling, R12), half each, its
// volume at most 4 digits and never a side (every side at least 2); a prism asked for at the easy level is one of the
// usual level's, as M2's missing side is. Fact 10: with every prism the sizes then allowed (1,331 in cm³, 729 in m³ up
// to 10 m high, each told with three boxes or rooms, 43,260 of meas-volume's 61,481 items in the voice tools' lists)
// meas-volume added 11.9 s of user time to tools/piece-lines.mjs, past fact 10's 10 s (step 4.6, both run at once under
// one load), so each prism class keeps at most CAP, taken evenly through its own as convert's are (every side from 2 to
// its most still among them; a room's 243 sizes 2 to 4 m high so become 150), and always the plan's own box 6 by 3 by 2
// and classroom 9 by 7 by 3 (M4, "Keys and asks"; step 4.6, test first)
const volOf = (key, unit, cubes) => (l, w, h) => ({ op: 'mvol', key, l, w, h, unit, cubes });
const prisms = (make, [ls, ws, hs]) => ls.flatMap((l) => ws.flatMap((w) => hs.map((h) => make(l, w, h))));
function layerClasses(easy) {
  const sizes = easy ? [range(2, 3), range(2, 3), range(2, 3)] : [range(2, 6), range(2, 4), range(2, 5)];
  return [{ name: easy ? 'prism of 1 cm cubes, every side at most 3' : 'prism of 1 cm cubes', weight: 1, sums: prisms(volOf('layers', 'cm', true), sizes) }];
}
const PRISM_OWN = { cm: '6 3 2', m: '9 7 3' };
const sidesOf = (s) => `${s.l} ${s.w} ${s.h}`;
function prismClasses() {
  return [['cm', 12, 12], ['m', 10, 4]].map(([unit, most, high]) => {
    const all = prisms(volOf('prism', unit, false), [range(2, most), range(2, most), range(2, high)]).filter((s) => String(volumeValue(s)).length <= 4);
    const own = all.filter((s) => sidesOf(s) === PRISM_OWN[unit]);
    return { name: `prism in ${unit}³`, weight: 1 / 2, sums: [...evenly(all.filter((s) => !own.includes(s)), CAP - own.length), ...own].sort((x, y) => all.indexOf(x) - all.indexOf(y)) };
  });
}
// capacity: convert's four forms, a quarter each, for millilitres and litres (N mL from 1 to 9999, never a multiple of
// 1000; a third each with 1, 2 and 3 places in litres; split and join N above 1000; about 1 in 4 with an empty place,
// "1.05 L"), at most CAP starting amounts a class with NESA's four kept (fact 10); asked at the easy level, the usual
// level's
const capacityClasses = () => convertClasses(false, [{ small: 'mL', large: 'L', most: 9999 }], 'capacity', { empty: 3 / 8, plain: 5 / 8 });
// jug: marks in litres, 0 to 1 with parts 2, 4 or 5, 0 to 2 with parts 2 or 4, 0 to 4 with parts 2 (at most 8 spaces up,
// engine/render/svg.js scale), read from 0, the level never on a labelled mark; the box in litres or in millilitres, half
// each. In each box parts 2 one reading in 10 and parts 4 and 5 the rest, half each, as read's PARTS, each of a parts'
// marks and each count of spaces past the mark before as often as the others, so 1 space past is at most 40% (plan step
// 4.2 Do 4); a class the rules leave empty shares its weight within its box and its parts' share (no reading under 1 L is
// left in millilitres: "0 L and ☐ mL" would box its answer), so each box stays half and parts 2 one in 10. Easy: parts 2,
// the box in litres, every reading as often as the others
const JUG_MARKS = { 2: [['0', '1'], ['0', '1', '2'], ['0', '1', '2', '3', '4']], 4: [['0', '1'], ['0', '1', '2']], 5: [['0', '1']] };
const jugOf = (marks, parts, ask) => (end) => ({ op: 'mread', key: 'jug', device: 'jug', unit: 'L', marks, parts, start: 0, end, ask });
// the ends past spaces past each labelled mark but the last
const jugEnds = (marks, parts, past) => range(0, marks.length - 2).map((before) => before * parts + past);
function jugClasses(easy) {
  if (easy) return [{ name: 'jug in halves, in L', weight: 1, sums: JUG_MARKS[2].flatMap((marks) => jugEnds(marks, 2, 1).map(jugOf(marks, 2, 'L'))) }];
  return ['L', 'mL'].flatMap((ask) => Object.entries(JUG_MARKS).flatMap(([p, sets]) => sets.flatMap((marks) => range(1, Number(p) - 1).map((past) => ({
    name: `jug 0 to ${marks.at(-1)} L in ${p}, ${past} past, in ${ask}`, weight: ((p === '2' ? 1 / 10 / 3 : 9 / 20 / sets.length) / (Number(p) - 1)) / 2,
    sums: jugEnds(marks, Number(p), past).map(jugOf(marks, Number(p), ask)), group: `${ask} ${p === '2' ? 'halves' : 'more'}` })))));
}

// the question, its words, its answer and its picture, from the sum alone, so the same sum makes the same problem
// whichever way works it: read "The pencil is ☐ cm long.", said "How long is the pencil, in centimetres?", the ruler its
// picture; convert the number sentence, said in words, "2600 metres = what kilometres?", with no picture. An answer in
// the larger unit is a decimal, its point key showing even when whole; in the smaller unit a whole number (plan, "Settled
// for the whole strand")
const UNIT_SAID = new RegExp(`(\\d+(?:${NB}\\d{3})*(?:\\.\\d+)?|☐)${NB}(${Object.keys(UNITS).sort((a, b) => b.length - a.length).join('|')})`, 'g');
const inWords = (text) => text.replace(UNIT_SAID, (_, n, u) => (n === '☐' ? `what ${unitWords(u, '2')}` : `${n} ${unitWords(u, n)}`));
const answerOf = (value, unit, larger) => (larger ? { kind: 'decimal', value } : { kind: 'number', value: Number(value) });
// a perimeter's ask, "The perimeter of the rectangle is ☐ cm.", or a large rectangle's told with its place, "A playground
// is a rectangle 40 m long and 25 m wide. Its perimeter is ☐ m." (plan M1, "Keys and asks"); its picture the shape, its
// equal sides marked wherever fewer sides are labelled than it has
const SIDE_MARKS = { square: true, rhombus: true };
function perimeterAsk(sum) {
  if (!sum.name) return `The perimeter of ${shapeName(sum)} is ☐${NB}${sum.unit}.`;
  const place = OBJECTS.place.find((c) => c.the === sum.name);
  return `${cap(place.a)} is a rectangle ${amountText(String(sum.sides.l), sum.unit)} long and ${amountText(String(sum.sides.w), sum.unit)} wide. Its perimeter is ☐${NB}${sum.unit}.`;
}
// an ask of more than one sentence said as a question, "… It is what centimetres wide?"
const saidAsk = (ask) => `${inWords(ask.replace(/\.$/, ''))}?`;
// An area's question (plan M2, "Keys and asks"): a rectangle's "The area of the rectangle is ☐ cm².", or a large one's
// told with its place, "A netball court is a rectangle 30 m long and 15 m wide. Its area is ☐ m².", said "What is the
// area of the rectangle, in square centimetres?", the shape its picture, with a row and a column of unit squares along
// its edges where they are drawn square (NESA's picture, S3 2DS A l.100); a missing side's "The rectangle's area is
// 24 cm². It is 6 cm long. It is ☐ cm wide.", its picture's missing side a box and no squares, which would count it out
// for her; a hectare's number sentence, or a field's "A field is a rectangle 250 m long and 100 m wide. Its area is ☐
// ha.", with no picture; each but a rectangle's said as it is asked
function areaProblem(sum) {
  const answer = (larger) => ({ kind: larger ? 'decimal' : 'number', value: larger ? areaValue(sum) : Number(areaValue(sum)) });
  const at = (n, unit) => amountText(String(n), unit), { l, w } = sum.sides ?? {};
  if (sum.key === 'hectare') {
    const ask = sum.form === 'field' ? `${cap(placeOf(sum).a)} is a rectangle ${at(l, 'm')} long and ${at(w, 'm')} wide. Its area is ☐${NB}ha.` : convertAsk(sum);
    return { ask, say: saidAsk(ask), answer: answer(sum.to === 'ha') };
  }
  // an L-shape's, a parallelogram's or a triangle's (plan M3, "Keys and asks"): "The area of the L-shape is ☐ cm².", said
  // "What is the area of the L-shape, in square centimetres?", the shape its picture
  if (AREA_SHAPES.includes(sum.kind)) {
    return { ask: `The area of ${shapeName(sum)} is ☐${NB}${sum.unit}².`, say: `What is the area of ${shapeName(sum)}, in ${UNITS[`${sum.unit}²`].many}?`, answer: answer(false), picture: shapePicture(sum) };
  }
  const square = `${sum.unit}²`, picture = { type: 'shape', kind: 'rect', unit: sum.unit, sides: sum.sides, labels: 'area' };
  if (sum.key === 'missing') {
    const [given, has, wants] = sum.unknown === 'w' ? [l, 'long', 'wide'] : [w, 'wide', 'long'];
    const ask = `The rectangle's area is ${at(l * w, square)}. It is ${at(given, sum.unit)} ${has}. It is ☐${NB}${sum.unit} ${wants}.`;
    return { ask, say: saidAsk(ask), answer: answer(false), picture: { ...picture, unknown: sum.unknown } };
  }
  if (sum.key !== 'rectangle') throw new Error(`no measurement problem of kind ${sum.key}`);
  const ask = sum.name ? `${cap(placeOf(sum).a)} is a rectangle ${at(l, sum.unit)} long and ${at(w, sum.unit)} wide. Its area is ☐${NB}${square}.` : `The area of the rectangle is ☐${NB}${square}.`;
  return { ask, say: `What is the area of ${shapeName(sum)}, in ${UNITS[square].many}?`, answer: answer(false), picture: { ...picture, ...(squaresFit(sum.sides) ? { edge: true } : {}) } };
}
// skillId names the skill in what a total refuses: a total asked in its smallest unit is worked exactly in base
// thousandths first and made only where it is a whole number of that unit, and one asked in a larger unit only where it
// needs at most 3 places of it
function problem(skillId, sum) {
  if (sum.op === 'marea') return areaProblem(sum);
  // a volume (plan M4, "Keys and asks"): of cubes, "The prism is made of 1 cm cubes. Its volume is ☐ cm³."; labelled,
  // told with its box or room, "A classroom is 9 m long, 7 m wide and 3 m high. Its volume is ☐ m³."; the prism its
  // picture, each said as it is asked
  if (sum.op === 'mvol') {
    const at = (n) => amountText(String(n), sum.unit), box = `☐${NB}${sum.unit}³`;
    const ask = sum.cubes ? `The prism is made of ${at(1)} cubes. Its volume is ${box}.` : `${cap(placeOf(sum).a)} is ${at(sum.l)} long, ${at(sum.w)} wide and ${at(sum.h)} high. Its volume is ${box}.`;
    return { ask, say: saidAsk(ask), answer: { kind: 'number', value: volumeValue(sum) }, picture: prismPicture(sum) };
  }
  if (sum.op === 'mper') {
    const ticks = SIDE_MARKS[sum.kind] || (sum.kind === 'tri' && triLengths(sum.sides) < 3);
    const picture = { type: 'shape', kind: sum.kind, unit: sum.unit, sides: sum.sides, labels: 'perimeter', ...(ticks ? { ticks: true } : {}) };
    return { ask: perimeterAsk(sum), say: `What is the perimeter of ${shapeName(sum)}, in ${UNITS[sum.unit].many}?`, answer: { kind: 'number', value: perimeterValue(sum) }, picture };
  }
  if (sum.op === 'mtotal') {
    const whole = totalWhole(sum);
    if (whole && totalBase(sum) % (UNITS[sum.to].base * 1000n) !== 0n) throw new Error(`${skillId} total is not a whole number of ${sum.to}`);
    if (!whole && totalValue(sum) === null) throw new Error(`${skillId} total needs a fourth place in ${sum.to}`);
    const ask = totalAsk(sum);
    return { ask, say: `${inWords(ask)}?`, answer: answerOf(totalValue(sum), sum.to, !whole) };
  }
  if (sum.op === 'mread') {
    if (!sum.name) throw new Error('a reading is told with what it measures');
    const picture = { type: 'scale', device: sum.device, unit: sum.unit, marks: sum.marks, parts: sum.parts, start: sum.start, end: sum.end, name: sum.name };
    // the kitchen scales' (plan M5): "The pumpkin has a mass of ☐ kg.", said as asked, the scales its picture
    if (sum.device === 'kitchen') {
      const ask = `${cap(sum.name)} has a mass of ☐${NB}${sum.ask}.`;
      return { ask, say: saidAsk(ask), answer: answerOf(readValue(sum), sum.ask, sum.ask === sum.unit), picture };
    }
    // a jug's (plan M4): "There is ☐ L of water in the jug.", said as asked, the jug its picture with what is in it
    if (sum.device === 'jug') {
      const ask = `There is ☐${NB}${sum.ask} of ${contents(sum)} in the jug.`;
      return { ask, say: saidAsk(ask), answer: answerOf(readValue(sum), sum.ask, sum.ask === sum.unit), picture: { ...picture, name: contents(sum) } };
    }
    return { ask: `${cap(sum.name)} is ☐${NB}${sum.ask} long.`, say: `How long is ${sum.name}, in ${UNITS[sum.ask].many}?`, answer: answerOf(readValue(sum), sum.ask, sum.ask === sum.unit), picture };
  }
  if (sum.op !== 'mconv') throw new Error(`no measurement problem of kind ${sum.key}`);
  const ask = convertAsk(sum), { large } = pairOf(sum);
  return { ask, say: `${inWords(ask)}?`, answer: answerOf(convertValue(sum), sum.to, sum.to === large) };
}

// Every number she sees or hears before the answer step, whichever way of its group she is asked by, as whole
// thousandths, so "2.60" and "2.6" are one number and "2.6" and "2600" two (plan, "Rules every measurement generator
// keeps"): the question's (shown and said) and its picture's, each step before the last, its words, its value and its
// picture's, a way that cannot work it saying so first, and the number word of why it cannot ("two parts need changing"
// says 2: step 4.3's code review, finding 3) and of each way's hint, shown under the question while her box is open
// ("Which two lengths do you multiply?" says 2, so no missing side is 2: step 4.4). A scale's numbers are its labels,
// its parts and where the object starts (its words, "along it from 3"); a chart's the number in it and each of its
// digits; a shape's its sides
const groupOf = (skillId, sum) => (BY_ID[skillId].groups ?? [BY_ID[skillId].methods]).findIndex((ws) => wayFits(ws[0], sum));
const numbersIn = (t) => [...String(t).replace(/(\d)[  ](?=\d{3}(?!\d))/g, '$1').matchAll(/\d+(?:\.\d+)?/g)].map((m) => thousandths(m[0])).filter((n) => n !== null);
// a refusal's number words, as numbers (whole thousandths): one to ten
const NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const wordsIn = (t) => [...String(t ?? '').matchAll(new RegExp(`\\b(${NUMBER_WORDS.join('|')})\\b`, 'gi'))].map((m) => BigInt(NUMBER_WORDS.indexOf(m[1].toLowerCase()) + 1) * 1000n);
function pictureNumbers(p) {
  if (p.type === 'scale') {
    const first = thousandths(p.marks[0]);
    return [...p.marks.map(thousandths), BigInt(p.parts) * 1000n, first + 1000n * BigInt((p.start ?? 0) / p.parts)];
  }
  if (p.type === 'placevalue') return [thousandths(p.value), ...p.value.replace('.', '').split('').map((c) => BigInt(c) * 1000n)];
  // an area's L-shape, its six labels (and its pieces' names, "3 by 2", the same numbers); a parallelogram's or a
  // triangle's base, height and slanted side, as labelled
  if (p.type === 'shape' && p.kind === 'lshape' && p.labels === 'area') {
    const { W, H, cw, ch } = p.sides;
    return [W, H - ch, cw, ch, W - cw, H].map((n) => BigInt(n) * 1000n);
  }
  if (p.type === 'shape' && (p.kind === 'para' || p.kind === 'ptri')) return [p.sides.b, p.height, p.slant].filter((n) => n != null).map((n) => BigInt(n) * 1000n);
  // a prism's counts or lengths, as its words and labels say them
  if (p.type === 'prism') return [p.l, p.w, p.h].map((n) => BigInt(n) * 1000n);
  // a shape's sides, but the one its box stands for; and where unit squares are drawn, their words' 1 ("1 cm squares")
  if (p.type === 'shape') return [...Object.entries(p.sides).filter(([k]) => k !== p.unknown).map(([, n]) => BigInt(n) * 1000n), ...(p.edge || p.rows ? [1000n] : [])];
  return [];
}
function earlierNumbers(skillId, sum) {
  const { ask, say, picture } = problem(skillId, sum);
  const texts = [ask, say], pictures = [picture], words = [];
  for (const w of BY_ID[skillId].groups[groupOf(skillId, sum)]) {
    words.push(...wordsIn(METHODS[w].stops?.(sum)), ...wordsIn(METHODS[w].hint(sum)));
    for (const st of wayFor(skillId, sum, w).steps.slice(0, -1)) {
      texts.push(st.text, 'value' in st ? String(st.value) : '');
      pictures.push(st.picture);
    }
  }
  return new Set([...texts.flatMap(numbersIn), ...words, ...pictures.filter(Boolean).flatMap(pictureNumbers)]);
}
// a problem the plan allows: its answer at most 8 characters as typed, and in no earlier text, nor in any hint it can give
// for a mistake, which shows under the question while her box is open (step 4.2's code review, finding 1: "24.01 m = 24 m
// ☐ cm", 1, and "How many centimetres are in 1 metre?"); and an area of a shape only where every picture it has, the
// question's and each worked step's by every way of its group, is drawn: engine/render/svg.js shape draws nothing where it
// cannot keep every label clear, as on the cut of a tall L-shape, whose rectangle 1 unit high has no room for "4 by 9"
// (step 4.5)
function allowed(skillId, sum) {
  return allowedBut(skillId, sum) && (!AREA_SHAPES.includes(sum.kind) || drawn(skillId, toldOf(sum, null)));
}
// every rule but the drawing, which the list she is drawn from leaves till a problem is drawn (sumFor)
function allowedBut(skillId, sum) {
  const told = toldOf(sum, null);
  const { answer } = problem(skillId, told);
  const value = String(answer.value), th = thousandths(value);
  return value.length <= 8 && !earlierNumbers(skillId, told).has(th) && !hintLines({ sum: told, answer }).flatMap(numbersIn).includes(th);
}
// whether every picture of a problem draws, each problem drawn once
const DRAWN = new Map();
function drawn(skillId, sum) {
  const at = JSON.stringify(sum);
  if (!DRAWN.has(at)) {
    const steps = BY_ID[skillId].groups[groupOf(skillId, sum)].flatMap((w) => METHODS[w].steps(sum));
    DRAWN.set(at, [problem(skillId, sum).picture, ...steps.map((st) => st.picture)].every((p) => !p || renderPicture(p) !== ''));
  }
  return DRAWN.get(at);
}

// every problem of a skill's key at a level, in its classes: [{ name, weight, sums }]; a class the rules leave empty is
// not one (on a scale of 3 marks, read from its middle mark 1 space past it, the one reading is one space long, the
// working value; drawSum leaves an empty class out too), its weight shared by the others of its group (a reading's
// device, parts and start), so each device, parts and start is drawn as often as before
const CLASSES = { read: readClasses, convert: convertClasses, perimeter: perimeterClasses, total: () => totalClasses(), rectangle: rectangleClasses, missing: missingClasses,
  hectare: hectareClasses, 'l-shape': lshapeClasses, parallelogram: parallelogramClasses, triangle: triangleClasses, layers: layerClasses, prism: prismClasses,
  capacity: capacityClasses, jug: jugClasses };
// meas-mass's keys share M1's names, read, convert and total, with classes of their own
const MASS_CLASSES = { read: kitchenClasses, convert: massConvertClasses, total: massTotalClasses };
function classesOf(skillId, key, easy, ok = allowed) {
  if (!KEYS[skillId]) throw new Error(`${skillId} has no measurement problems`);
  const classes = (skillId === 'meas-mass' ? MASS_CLASSES : CLASSES)[key]?.(easy) ?? null;
  if (!classes) throw new Error(`no measurement problem of kind ${key}`);
  const all = classes.map((c) => ({ ...c, sums: c.sums.filter((s) => ok(skillId, s)) }));
  const weightOf = (list, group) => list.filter((c) => c.group === group).reduce((x, c) => x + c.weight, 0);
  const kept = all.filter((c) => c.sums.length);
  return kept.map(({ group, ...c }) => ({ ...c, weight: group ? (c.weight * weightOf(all, group)) / weightOf(kept, group) : c.weight }));
}
const MEMO = new Map(), KEPT = new Map();
export function problemsOf(skillId, key, easy) {
  if (!KEYS[skillId]?.includes(key)) throw new Error(`${skillId} has no kind of problem ${key}`);
  const at = `${skillId}:${key}:${Boolean(easy)}`;
  if (!MEMO.has(at)) MEMO.set(at, classesOf(skillId, key, Boolean(easy)));
  return MEMO.get(at);
}
// The list she is drawn from: problemsOf's, but for an area of a shape every problem the other rules allow, whose
// pictures are drawn only once it is drawn, and a problem whose pictures do not all draw drawn again from its class
// (sumFor), so each class comes at its weight and each problem in it that draws as often as the others, exactly as from
// problemsOf; her first item drew every L-shape's three pictures, about 11,000, to build that (1.3 s in node, longer on
// her phone: G2, step 4.5, the lead's ruling). Its classes are problemsOf's, none emptied by the drawing (a test)
const SHAPE_KEYS = ['l-shape', 'parallelogram', 'triangle'];
const DRAWABLE = new Map();
function drawable(skillId, key, easy) {
  if (!SHAPE_KEYS.includes(key) || !KEYS[skillId]?.includes(key)) return problemsOf(skillId, key, easy);
  const at = `${skillId}:${key}:${Boolean(easy)}`;
  if (!DRAWABLE.has(at)) DRAWABLE.set(at, classesOf(skillId, key, Boolean(easy), allowedBut));
  return DRAWABLE.get(at);
}

// every way a problem can be told, for the voice tools (tools/voice-lines.mjs every): a reading with each thing its
// device measures, a large rectangle in metres with each place
export function tellings(sum) {
  const things = sum.name ? null : thingsOf(sum);
  return things ? things.map((c) => ({ ...sum, name: c.the })) : [sum];
}
// a reading's thing or a large rectangle's place, drawn after its numbers (with no rng, the first, for judging its
// numbers: no thing or place has one); a name given is kept
function toldOf(sum, rng) {
  const things = sum.name ? null : thingsOf(sum);
  return things ? { ...sum, name: (rng ? rng.pick(things) : things[0]).the } : sum;
}

// Two ways of one group side by side (opts.also another way of opts.method's group: "Another way", js/runner.js compare)
// only on a problem whose boxed values differ, so split and join, where moving the digits and whole units first box the
// same values (split only the answer; join "600 m = ☐ km", then the answer), the same steps in substance, are left out
// there and still drawn for her one way (the looker's finding 7, step 4.2, the lead's ruling; strand 3's KEPT_APART,
// engine/items/percentages.js); its own memo of what both ways fit, since its lists are not problemsOf's; each problem
// judged as first told
const KEPT_APART = new Map();
const boxedOf = (w, sum) => JSON.stringify(METHODS[w].steps(sum).filter((st) => 'value' in st).map((st) => String(thousandths(String(st.value)))));
const sameBoxes = (a, b, sum) => wayFits(a, sum) && wayFits(b, sum) && boxedOf(a, sum) === boxedOf(b, sum);
const apartOf = (a, b) => (skillId, key, easy) => drawable(skillId, key, easy).map((c) => ({ ...c, sums: c.sums.filter((sum) => !sameBoxes(a, b, toldOf(sum, null))) }));
// but rows of squares and length × width, which both box only the area, each its own way to it (the rows counted and
// multiplied, rows first, "4 × 6"; NESA's words, "6 × 4"), the plan's second way for every rectangle and missing side
// (M2, "Ways"): kept apart they could never be set side by side, and "Another way" would find no problem both fit; and so
// a parallelogram made a rectangle beside NESA's words (M3, "Ways": "then the same answer step"), the lead's ruling for
// step 4.4's pair applied to them (step 4.5)
const NEVER_APART = ['area-rows', 'area-words', 'area-move'];

// a problem: drawn as the fractions' and percentages' are (engine/items/fractions.js drawSum: the key, its class by
// weight, a problem the ways fit), then its thing
function sumFor(skillId, rng, easy, opts) {
  if (opts.sum) return toldOf(opts.sum, rng);
  const group = BY_ID[skillId].groups.find((ws) => ws.includes(opts.method));
  const apart = opts.also && opts.also !== opts.method && group?.includes(opts.also) && !NEVER_APART.includes(opts.method);
  const listed = apart ? { problemsOf: apartOf(opts.method, opts.also), kept: KEPT_APART } : { problemsOf: drawable, kept: KEPT };
  let { key, sum } = drawSum(skillId, rng, easy, opts, { levelKeys: (easy ? EASY : KEYS)[skillId], ...listed });
  if (AREA_SHAPES.includes(sum.kind) && !drawn(skillId, sum)) {
    // drawn again from its class, among the problems the ways asked fit, as drawSum draws, till one draws
    const ways = opts.also ? [opts.method, opts.also].filter((w) => BY_ID[skillId].methods.includes(w)) : [];
    const cls = listed.problemsOf(skillId, key, easy).find((c) => c.sums.includes(sum)).sums.filter((s) => ways.every((w) => wayFits(w, s)));
    for (let tries = 0; !drawn(skillId, sum); tries++) {
      if (tries > 10000) throw new Error(`${skillId} has no ${key} problem whose pictures draw`);
      sum = rng.pick(cls);
    }
  }
  return toldOf(sum, rng);
}

// The way a problem is worked (plan "The ways", "Groups"): opts.method where it is in the problem's group (the set of
// ways whose first fits it), else her way for that group (opts.ways, keyed by the group's place in the skill's groups:
// engine/methods.js groupWays, js/runner.js make), else the group's first; wayFor refusing where that way stops
function wayAsked(skillId, sum, opts) {
  const g = groupOf(skillId, sum), group = BY_ID[skillId].groups[g];
  if (group.includes(opts.method)) return opts.method;
  return group.includes(opts.ways?.[g]) ? opts.ways[g] : group[0];
}

// A hint for her actual mistake (plan M1, "Misconceptions"), each a question about the step or the question's own
// numbers, never about her answer, which the screen has taken away (js/runner.js), else none (the way's): the fixed ones,
// HINTS (hints, tools/voice-lines.mjs), and the rest built from the problem's numbers, each listed for its problem by
// hintLines(item). A slip whose value is the right answer is no slip there
export const HINTS = {
  // a space taken as one unit, or as a tenth of it, when it is not
  SPACE: 'How much is each small space worth? Count the spaces between two numbers.',
  // the reading given in the other unit of the pair
  UNIT: 'Which unit is written after the box? Count in the box\'s unit.',
  // a perimeter part of the way round: a rectangle's length + width; a square's, rhombus' or equilateral triangle's one
  // labelled side, or two
  ROUND: 'Did you go all the way round? How many sides are there?',
  // the area for the perimeter (the plan's "Perimeter is the distance around the edge." put after its question, so the
  // hint opens with a question, step 4.2's rule)
  AREA: 'Did you add the sides, or multiply? Perimeter is the distance around the edge.',
  // meas-area (plan M2, "Misconceptions"): the perimeter for the area (the plan's "Area is the squares inside." put after
  // its question, so the hint opens with a question, as AREA above), where the question's picture draws its edge squares
  // (hintFor's own words where it draws none); the sides added; a missing side answered with the area × the side given;
  // 1000 or 100 square metres taken for a hectare
  ROUND_AREA: 'Did you count the squares, or go round the edge? Area is the squares inside.',
  ADDED: 'Did you add the sides, or multiply them?',
  TIMES: 'Did you multiply, or find how many rows?',
  HECTARE: 'How many square metres make 1 hectare?',
  // meas-area-shapes (plan M3, "Misconceptions"): the L-shape taken for its whole rectangle; its six sides added (the
  // plan's "Area is the space inside." put after its question, as ROUND_AREA); a parallelogram's base × its slanted side,
  // where that side is labelled; a triangle's base × height, not halved (the plan's "A triangle is half of a
  // parallelogram." put after its question, and its "half of it" named, half of base × height, so it never says "it"
  // before what it is: the lookers' shots 112-113, G3); base + height is ADDED's
  CORNER: 'Did you take away the missing corner?',
  INSIDE: 'Did you add the sides, or multiply? Area is the space inside.',
  SLANT: 'Did you use the slanted side? The height goes straight up from the base.',
  HALF: 'Did you find half of base × height? A triangle is half of a parallelogram.',
  // meas-volume (plan M4, "Misconceptions"): the three sides added; one layer or one face only, where the question's
  // picture draws its cubes (hintFor's own words where it draws none) (her capacity and jug slips are convert's and
  // read's above)
  SIDES: 'Did you add, or multiply?',
  LAYER: 'Did you count every layer?',
};
// a number in thousandths as she would type it ('4.5', '45'); null where it is not above 0, or past 8 characters
const typed = (th) => {
  if (th === null || th <= 0n) return null;
  const t = decimalText(Number(th));
  return t.length <= 8 ? t : null;
};
// a hectare's change to square metres with the digits moved the wrong way, its point moved left, as text ("3.5 ha"
// 0.00035), where thousandths cannot read it and the pad's 8 characters take it, else null (the code review's finding 2,
// step 4.4, the lead's ruling); and a number's digits without the point and the zeros at either end
function backOf(sum) {
  if (sum.op !== 'marea' || sum.form !== 'to-smaller') return null;
  const { places } = pairOf(sum), [w, f = ''] = sum.value.split('.'), d = w.padStart(places + 1, '0');
  const t = `${d.slice(0, -places)}.${d.slice(-places)}${f}`;
  return thousandths(t) === null && t.length <= 8 ? t : null;
}
const digitsOf = (t) => t.replace('.', '').replace(/^0+|0+$/g, '');
// each slip she could make on a problem, its value as typed and its kind, the more particular first: [[value, kind]]
function slipsOf(item) {
  const { sum } = item, out = [];
  const add = (th, hint) => { const v = typed(th); if (v !== null) out.push([v, hint]); };
  const units = (n) => BigInt(n) * 1000n;
  if (sum.op === 'mvol') {
    // a prism's length, width and height added; one layer only, or one face (the front, or the side)
    const { l, w, h } = sum;
    add(units(l + w + h), 'sides');
    for (const n of [l * w, l * h, w * h]) add(units(n), 'layer');
    return out;
  }
  if (sum.op === 'mper') {
    const s = sum.sides;
    // a rectangle's length + width; a square's, rhombus' or equilateral triangle's one side, or two; a rectangle's or
    // square's area
    if (sum.kind === 'rect') add(units(s.l + s.w), 'round');
    const one = sum.kind === 'square' || sum.kind === 'rhombus' ? s.s : sum.kind === 'tri' && triLengths(s) === 1 ? s.a : null;
    if (one !== null) for (const n of [one, 2 * one]) add(units(n), 'round');
    if (sum.kind === 'rect' || sum.kind === 'square') add(units(sum.kind === 'rect' ? s.l * s.w : s.s * s.s), 'area');
    return out;
  }
  if (sum.op === 'marea' && AREA_SHAPES.includes(sum.kind)) {
    const s = sum.sides;
    // an L-shape's whole rectangle, or its six sides added; a parallelogram's base × its slanted side, where labelled; a
    // triangle's base × height; base + height
    if (sum.kind === 'lshape') {
      add(units(s.W * s.H), 'corner');
      add(units(2 * (s.W + s.H)), 'inside');
      return out;
    }
    if (sum.slant) add(units(s.b * s.s), 'slant');
    if (sum.kind === 'ptri') add(units(s.b * s.h), 'half');
    add(units(s.b + s.h), 'added');
    return out;
  }
  if (sum.op === 'marea' && sum.key !== 'hectare') {
    const { l, w } = sum.sides;
    // a rectangle's perimeter, or its sides added; a missing side's area × the side given
    if (sum.key === 'rectangle') {
      add(units(2 * (l + w)), 'round-area');
      add(units(l + w), 'added');
    } else add(units(l * w * (sum.unknown === 'w' ? l : w)), 'times');
    return out;
  }
  if (sum.op === 'mtotal') {
    // a part not changed: each set of the parts to change left as they are written, the rest in the unit asked
    const change = sum.parts.filter((p) => p.unit !== sum.to);
    for (let mask = 1; mask < 1 << change.length; mask++) {
      add(sum.parts.reduce((t, p) => {
        const k = change.indexOf(p);
        return t + (k >= 0 && mask & (1 << k) ? thousandths(p.value) : inBase(p.value, p.unit) / UNITS[sum.to].base);
      }, 0n), 'change');
    }
    return out;
  }
  if (sum.op === 'mread') {
    // an amount in thousandths of the device's unit, in thousandths of the box's unit; null where she could not type it
    const u = sum.unit, inAsk = (th) => {
      const t = th > 0n ? fromBase(th * UNITS[u].base, sum.ask) : null;
      return t === null ? null : thousandths(t);
    };
    const { space, start, end, mark, past } = scaleOf(sum);
    // a length past 0 given where it ends
    if (start > 0n) add(inAsk(end), 'start');
    // a space taken as one unit or a tenth of it
    for (const wrong of [1000n, 100n]) if (wrong !== space) add(inAsk(mark + wrong * BigInt(past) - start), 'space');
    // the reading in the other unit of the pair
    const other = sum.ask === u ? SMALLER[u] : u, length = (end - start) * UNITS[u].base;
    add(fromBase(length, other) === null ? null : thousandths(fromBase(length, other)), 'unit');
    return out;
  }
  if (sum.op !== 'mconv' && sum.op !== 'marea') return out;
  // a hectare's change of units as a length's: a field's its area in square metres to hectares
  const conv = sum.op === 'marea' ? asConvert(sum) : sum;
  const { factor: F } = pairOf(conv);
  const v = thousandths(conv.value), whole = (v / 1000n) * 1000n;
  // the number moved by a factor, into the larger unit (÷) or the smaller (×), exactly, else null
  const by = (th, f, into) => (into === 'larger' ? (th % f === 0n ? th / f : null) : th * f);
  const moved = (f, into) => {
    if (conv.form === 'to-larger' || conv.form === 'to-smaller') return by(v, f, into);
    if (sum.form === 'split') return by(v - whole, f, into);
    const n = BigInt(sum.value) * 1000n, w = n / (F * 1000n) * 1000n, part = n - w * F, m = by(part, f, into);
    return m === null ? null : w + m;
  };
  const right = conv.form === 'to-larger' || conv.form === 'join' ? 'larger' : 'smaller', wrongWay = right === 'larger' ? 'smaller' : 'larger';
  // split with the digit in the wrong place: the decimal part's digits as written, "2.08 km = 2 km ☐ m" answered 8
  if (sum.form === 'split') add(BigInt(sum.value.split('.')[1]) * 1000n, 'digit');
  // the digits moved the wrong way
  add(moved(F, wrongWay), 'way');
  if (backOf(sum) !== null) out.push([backOf(sum), 'way']);
  // the wrong number of places: another pair's factor; for a hectare 1000 or 100 square metres taken for one (plan M2)
  for (const f of sum.op === 'marea' ? [1000n, 100n] : [10n, 100n, 1000n]) if (f !== F) add(moved(f, right), sum.op === 'marea' ? 'hectare' : 'places');
  return out;
}
// a split's digit in the wrong place: the first digit of its decimal part that is not 0, named so she finds it in one
// place of the question as she sees it ("10.1 km = 10 km ☐ m" writes 1 three times; the looker's finding 2, step 4.2, the
// lead's ruling): "the 8" where it is written once in the question, "the 1 after the point" where it is written more
// than once but once after the point, "the first 1 after the point" where it is written more than once after it; and the
// second question, how many of the smaller unit that place is worth, or where that worth is the answer itself ("2.1 km =
// 2 km ☐ m"), how many make 1 of the larger
function digitOf(item) {
  const { small, large } = pairOf(item.sum), digits = item.sum.value.split('.')[1], k = digits.search(/[1-9]/), worth = `0.${'0'.repeat(k)}1`;
  const d = digits[k], times = (t) => [...t].filter((c) => c === d).length;
  const digit = times(convertAsk(item.sum)) === 1 ? d : times(digits) === 1 ? `${d} after the point` : `first ${d} after the point`;
  const worthSmall = fromBase(inBase(worth, large), small);
  const second = thousandths(worthSmall) === thousandths(String(item.answer.value)) ? `How many ${UNITS[small].many} make ${amountText('1', large)}?`
    : `How many ${UNITS[small].many} is ${amountText(worth, large)}?`;
  return { digit, second };
}
function hintFor(item, given) {
  const { sum } = item;
  if (!['mread', 'mconv', 'mper', 'mtotal', 'marea', 'mvol'].includes(sum?.op)) return null;
  const g = Array.isArray(given) ? given[0] : given, th = g == null ? null : thousandths(String(g));
  const answer = thousandths(String(item.answer.value));
  // the wrong way past what thousandths reads (backOf): her number under 1, its digits the amount's
  const back = backOf(sum) !== null && /^0*\.\d+$/.test(normalise(g)) && digitsOf(normalise(g)) === digitsOf(sum.value);
  if (!back && (th === null || th === answer)) return null;
  const kind = back ? 'way' : slipsOf(item).find(([v]) => thousandths(v) === th)?.[1];
  const { small, large } = sum.op === 'mconv' ? pairOf(sum) : {};
  if (kind === 'space') return HINTS.SPACE;
  if (kind === 'unit') return HINTS.UNIT;
  if (kind === 'start') return `Where does ${sum.name} start? Did you take the start away?`;
  if (kind === 'way') return `Is a ${UNITS[sum.to].one} bigger or smaller than a ${UNITS[sum.from].one}? Will there be more of them, or fewer?`;
  if (kind === 'places') return `How many ${UNITS[small].many} are in 1 ${UNITS[large].one}?`;
  if (kind === 'digit') return `Which place is the ${digitOf(item).digit} in? ${digitOf(item).second}`;
  if (kind === 'round') return HINTS.ROUND;
  if (kind === 'area') return HINTS.AREA;
  // the perimeter for the area: ROUND_AREA where the question's picture draws its edge squares; where it draws none (a
  // rectangle too long for its squares to be drawn square), the squares named as imagined and by their size, as the way
  // hints name them (F's note, step 4.8, the lead's ruling, pt93)
  if (kind === 'round-area' && squaresFit(sum.sides)) return HINTS.ROUND_AREA;
  if (kind === 'round-area') return `Did you go round the edge? Area is how many ${amountText('1', sum.unit)} squares would fit inside.`;
  if (kind === 'added') return HINTS.ADDED;
  if (kind === 'times') return HINTS.TIMES;
  if (kind === 'hectare') return HINTS.HECTARE;
  if (kind === 'corner') return HINTS.CORNER;
  if (kind === 'inside') return HINTS.INSIDE;
  if (kind === 'slant') return HINTS.SLANT;
  if (kind === 'half') return HINTS.HALF;
  if (kind === 'sides') return HINTS.SIDES;
  // one layer or one face for the volume: LAYER where the question's picture draws its cubes; where it draws none (a
  // labelled box or room), the layer named as imagined and by the size of its cubes, as the way hints name them (the
  // step's code review, finding 4, step 4.8, the lead's ruling, pt94)
  if (kind === 'layer' && sum.cubes) return HINTS.LAYER;
  if (kind === 'layer') return `Did you count every layer of ${amountText('1', sum.unit)} cubes?`;
  // the unit after her box, in words ("… to centimetres first?"); a mass's "every mass" (plan M5)
  if (kind === 'change') return `Did you change every ${UNITS[sum.to].kind === 'mass' ? 'mass' : 'length'} to ${unitWords(sum.to, '2')} first?`;
  return null;
}
// every hint text hintFor gives for a problem, each misconception's mistake worked out from the problem, for the tools
// that list the lines to voice
export function hintLines(item) {
  return [...new Set(slipsOf(item).map(([v]) => hintFor(item, v)).filter(Boolean))];
}

export default {
  skills: ['meas-length', 'meas-area', 'meas-area-shapes', 'meas-volume', 'meas-mass'],
  // opts.key makes that kind, opts.sum that very problem, opts.method works it that way where it is in the problem's
  // group (else her way for that group, opts.ways, else the group's first; a way that stops says why first: wayFor),
  // opts.also draws only a problem that way fits too, opts.op only a kind of that sum, opts.easy the easy level
  make(skillId, rng, opts = {}) {
    const sum = sumFor(skillId, rng, Boolean(opts.easy), opts);
    const { picture, ...question } = problem(skillId, sum);
    const { method, steps } = wayFor(skillId, sum, wayAsked(skillId, sum, opts));
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
