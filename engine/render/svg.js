// Pictures for the problems, drawn as SVG strings. Pure string building (no DOM), so the same code runs in the
// browser and in Node tests. renderPicture(picture) -> string, '' for null.
//
// Picture types (EXAMPLES at the bottom has one of each):
//   { type: 'array', rows, cols, shaded? }                         dots in rows and columns; shaded: that many dots
//                                                                  shaded column by column, top to bottom, the rest
//                                                                  rings (the discrete model), in the dot form only
//   { type: 'groups', groups, each, leftover, find?, blank? }      sharing into equal groups; blank: the whole amount
//                                                                  to share, with empty groups unless find is 'groups'
//   { type: 'chunks', dividend, divisor, chunks: [{ times, amount }], remainder, blank? }   chunking ladder (IES 2021
//                                                                  p. 9); blank: only the number to divide
//   { type: 'shortdiv', dividend, divisor, places: [{ here, q, left }], remainder, blank? }  short division, "bus
//                                                                  stop"; blank: boxes for the answer, no carries
//   { type: 'balance', left, right }                               two sides of "=" as strings (may hold ☐)
//   { type: 'placevalue', value, columns, highlight? }             place-value chart, columns from the ones up;
//                                                                  value '' draws the columns empty
//   { type: 'placevalue', value: '2.457', columns, decimals: 1|2|3, highlight?, zeros? }   the same, then the point and
//                                                                  tenths, hundredths, thousandths; rows: ['0.4', '0.38']
//                                                                  in place of value, one number a row lined up at the
//                                                                  point, for comparing; zeros: a soft 0 in each empty place
//   { type: 'grid', shaded, blank? }                               a 100 grid, shaded by whole columns (tenths), then
//                                                                  squares (hundredths); blank: the counts under it boxes
//   { type: 'area', rowParts: [...], colParts: [...], blank? }     area model; cells are products (boxes, if blank)
//   { type: 'numberline', from, to, step, marks?: [{ at, label }], jumps?: [{ from, to, label }], point?: { at, label },
//     zoom?: { from, to }, letters?, empty? }                      zoom: the one space from zoom.from to zoom.to drawn
//                                                                  again under the line, cut into 10, inside
//                                                                  <g class="zoom">, the point on it alone; letters:
//                                                                  the marks are lettered choices, said by letter only;
//                                                                  empty: an empty number line, not to scale, each
//                                                                  jump as wide as its label and arrow need
//   { type: 'table', head: [...], rows: [[...], ...] }             a table of values
//   { type: 'columns', op: '+' | '−' | '×', top, bottom, carries? }  written column method; carries[i] is what is
//                                                                  carried (or traded) INTO column i from the right
//   { type: 'columns', op: '+' | '−', top: '3.4', bottom: '1.25', decimals, carries? }   the same with decimal text,
//                                                                  the points lined up, an empty place a soft 0
//   { type: 'bar', parts: [{ label, value }], total, compare? }    bar model; compare: { a: { label, value }, b }
//   { type: 'bar', rows: [{ title, parts, total, totalLabel?, groups? }], blank? }   a bar model in steps, a bar for each
//                                                                  (a two-step word problem); groups: { count, label }, a
//                                                                  bar of equal groups, said under it as "4 packs"; a
//                                                                  value { found: n } is a step's result, a box if blank;
//                                                                  { slot: true, now? } a part she is placing (now: this one)
//   { type: 'strips', rows: [{ d, count?, shaded?, name?, label?, value? }], lengths?, total?, shadedTotal?, blank? }
//                                                                  fraction strips and the tape diagram: 1 to 4 bars, each
//                                                                  cut into d equal parts (count: k parts of 1/d), the
//                                                                  first shaded ones shaded; name: a letter at the left;
//                                                                  label 'unit': 1/d in each part; value: in each part
//                                                                  ('?' or blank, a box); total and shadedTotal bracketed
//                                                                  over the first bar; lengths: the wholes in proportion;
//                                                                  nothing is drawn when its bars do not all fit 260 px
//                                                                  under its brackets
//   { type: 'fracline', wholes, d, labels: 'all' | 'wholes' | 'benchmarks', below?, belowLabels?: 'all' | 'wholes',
//     point?: { n, d, label, below?, dec? }, marks?: [{ n, d, label }], letters?, jumps?: [{ from: [n, d], to: [n, d], label }],
//     strip?, pct?, dec? }
//                                                                  a number line from 0 to wholes, a tick every 1/d,
//                                                                  labelled over the line; below: ticks in d2ths under
//                                                                  it, labelled all, or only at the whole numbers
//                                                                  (belowLabels 'wholes'); point.below '?': the label
//                                                                  under it at the point a box; a point with below
//                                                                  labelled at the wholes and no box: its label in the
//                                                                  row under the line; nothing is drawn when
//                                                                  wholes × max(d, below) > 12 (spaces under 26 px);
//                                                                  strip: a strip from 0 to 1 in its parts under it all;
//                                                                  pct (with below): the ticks under it labelled as
//                                                                  percentages, <text class="pic-tick pic-pct">, in place
//                                                                  of the fractions, thinned to fit (nothing drawn when
//                                                                  one is not a whole per cent: below 3, 6 or 8); dec
//                                                                  (with pct): a row of their decimals 26 px under those,
//                                                                  <text class="pic-tick pic-dec"> ('0', '0.25', '1');
//                                                                  point.below '?' or point.dec '?': the percentage or
//                                                                  the decimal at the point a box
//   { type: 'fracline', stack: [d1, d2, …] }                       a line from 0 to 1 for each, 50 px apart, its unit
//                                                                  fraction marked by a dot
//   { type: 'fracarea', cols, rows, shaded }                       the area model: a rectangle cut into columns and rows,
//                                                                  the first shaded columns shaded
//   { type: 'scale', device: 'ruler' | 'tape' | 'kitchen' | 'jug', unit, marks: ['0', '1', …], parts, start?, end, name }
//                                                                  a scale to read: marks the labelled values (2 to 7,
//                                                                  equally spaced), parts the small spaces between two,
//                                                                  start and end in small spaces from the first mark (start
//                                                                  on a ruler or tape only); across (12 spaces at most) or,
//                                                                  a jug, up (8 at most); name what is measured
//   { type: 'shape', kind: 'rect' | 'square' | 'tri' | 'rhombus' | 'lshape' | 'para' | 'ptri', unit, sides, labels:
//     'area' | 'perimeter', unknown?, edge?, rows?, cut?, corner?, height?, slant?, ticks?, move?, double?, working? }
//                                                                  a shape to scale, its sides by kind (rect { l, w },
//                                                                  square and rhombus { s }, tri { a, b, c }, lshape
//                                                                  { W, H, cw, ch }, para { b, h, o, s }, ptri { b, h, o });
//                                                                  edge and rows: unit squares; cut, corner, height, move
//                                                                  and double: the pieces of a step (move and double on a
//                                                                  working: true picture only)
//   { type: 'prism', l, w, h, cubes?, unit?, labels?, layer?, front? }   a rectangular prism in oblique view; cubes: every
//                                                                  face she sees, to count; else its three edges labelled
//                                                                  (labels: { l, w, h } in place of a length, '?' a box)
//   { type: 'angle', whole: 90 | 180 | 360, parts: ['35', '?'], turn?, shade? }   a right angle, a straight line or arms all
//                                                                  round a point, cut into adjacent angles anticlockwise from
//                                                                  the first arm (turn: its direction, a multiple of 30),
//                                                                  each a whole number of degrees, one '?' (drawn "☐°"), the
//                                                                  whole less the others; shade: one part shaded (working)
//   { type: 'plane', across: 4–8, up: 3–6, points: [{ x, y, name }], guide? }   the first quadrant's grid, its lines
//                                                                  numbered, each point a dot on a crossing with its name;
//                                                                  guide: dashed lines from that point to both axes (working)
// A fraction n/d in a fraction picture's label is drawn stacked, as she writes it: <text class="pic-label pic-num">,
// a bar <line class="pic-line pic-fbar">, <text class="pic-label pic-den">, and said in words ("3 eighths",
// engine/fractions.js FRACTION and fractionWords). tests/oracle reads these pictures by their classes: keep them as they are.
// The measurement pictures (scale, shape, prism) write an amount as its number, a no-break space and its symbol ("6 cm",
// engine/units.js), and are read by tests/oracle/measurement.mjs by their classes in the same way; the angle and the grid
// by tests/oracle/geometry.mjs.
// A value of '?' is the unknown, drawn as ☐; ☐ in any label is drawn as an empty box, the number she works out.
// Decimals are text as the game shows them ('0.50' keeps its zero), never floats (plans/2026-10-25-stage-6-plan.md).
//
// Size: the viewBox is sized to what the picture holds at 1 unit = 1 CSS px, and the picture is shown at width 100%
// up to that natural width. Everything is laid out for a phone about 360 px wide (iPhone 11): no text under 16 px,
// numbers she reads at 18 px or more, nothing taller than 260 px. Big inputs switch to a compact form.
// Colour: classes only (pic-dot, pic-line, pic-label, pic-unknown, pic-accent, pic-soft, pic-pale, and pic-part and
// pic-shade in the fraction pictures, whose own rules, FRAC_STYLE, only they carry), coloured from
// var(--pic-ink), var(--pic-accent), var(--pic-soft) and var(--soft) with fallbacks. The rules sit inside :where(), which has
// no specificity, so a story's own stylesheet always wins. Every picture has role="img" and an aria-label in words.

import { fmt, thousandths } from '../check.js';
import { PLACES } from '../items/placevalue.js';
import { DEC_PLACES, splitDecimal, placesOf } from '../items/decimals.js';
import { FRACTION, FRACTION_NAMES, fractionWords } from '../fractions.js';
import { hundredthsText } from '../percents.js';
import { UNITS, unitWords } from '../units.js';

const PHONE = 340; // widest a picture is laid out: a 360 px phone screen, less a little margin
const BIG = 18; // numbers and words she reads
const SMALL = 16; // the smallest text anywhere: carried digits, headings
const PAD = 8;
const ACCENT = 'var(--pic-accent,#d9480f)';

const STYLE = '<style>'
  + ':where(.pic){font-family:var(--pic-font,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif);font-variant-numeric:tabular-nums}'
  + ':where(.pic .pic-label){fill:var(--pic-ink,currentColor)}'
  + ':where(.pic .pic-line){fill:none;stroke:var(--pic-ink,currentColor);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
  + ':where(.pic .pic-dot){fill:var(--pic-ink,currentColor)}'
  + ':where(.pic .pic-soft){fill:var(--pic-soft,rgba(128,128,128,.16))}'
  // a soft 0 (an empty place filled in): the app's soft text colour, softer than the digits but 4.5:1 or more on its cards
  + ':where(.pic .pic-label.pic-pale){fill:var(--soft,#6b6876)}'
  + `:where(.pic .pic-unknown){fill:var(--pic-box,none);stroke:${ACCENT};stroke-width:2}`
  + `:where(.pic .pic-label.pic-accent,.pic .pic-dot.pic-accent){fill:${ACCENT}}`
  + `:where(.pic .pic-line.pic-accent){stroke:${ACCENT}}`
  + ':where(.pic .pic-dash){stroke-dasharray:6 5}'
  + ':where(.pic .pic-thin){stroke-width:1.25}'
  + ':where(.pic .pic-thick){stroke-width:3.5}'
  + ':where(.pic .pic-strong){font-weight:600}'
  + '</style>';
// the fraction pictures' own rules, in their SVG alone, so every other picture is drawn byte for byte as before
const FRAC_STYLE = '<style>'
  + ':where(.pic .pic-part){fill:none;stroke:var(--pic-ink,currentColor);stroke-width:2;stroke-linejoin:round}'
  + `:where(.pic .pic-part.pic-shade){fill:${ACCENT};fill-opacity:.35}`
  + ':where(.pic .pic-fbar){stroke-width:1.5}'
  + '</style>';

// ---- small helpers ----

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const r = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
const sum = (list) => list.reduce((a, b) => a + b, 0);

function num(v, d = 0) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : d;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return d;
}
const whole = (v, top = 1e9) => Math.min(top, Math.max(0, Math.floor(num(v))));

// a value as she sees it: numbers in Australian format, '?' as the box
function show(v) {
  if (v === '?') return '☐';
  if (typeof v === 'number') return Number.isFinite(v) ? fmt(+v.toFixed(10)) : '';
  if (v === null || v === undefined || typeof v === 'object') return '';
  return String(v);
}

// a label read aloud: symbols as words
const spoken = (s) => String(s).replace(/☐/g, ' a box ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ')
  .replace(/−/g, ' minus ').replace(/\+/g, ' plus ').replace(/=/g, ' equals ').replace(/\s+/g, ' ').trim();

const listWords = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Text width, estimated in ems for a system sans-serif, a little generous so things never collide.
function em(c) {
  if (c >= '0' && c <= '9') return 0.6;
  if (c === ' ' || c === ' ') return 0.3;
  if (c === '%') return 0.9; // wider than a digit (only a percentage line's labels have one)
  if ('+−×÷=<>'.includes(c)) return 0.64;
  if ('.,:;\'!|()[]ijlrtf'.includes(c)) return 0.34;
  if ('mwMW'.includes(c)) return 0.88;
  if (c >= 'A' && c <= 'Z') return 0.7;
  return 0.56;
}
const BOX = 0.9; // the empty box, in ems
const BOXGAP = 0.3;

const plainWidth = (s, size) => sum([...String(s)].map(em)) * size;

// a label split around its boxes, with each piece's offset from the label's left edge
function pieces(str, size) {
  const out = [];
  let at = 0;
  String(str).split('☐').forEach((seg, i) => {
    if (i > 0) {
      at += BOXGAP * size;
      out.push({ box: true, at });
      at += (BOX + BOXGAP) * size;
    }
    const t = seg.trim();
    if (t) {
      const w = plainWidth(t, size);
      out.push({ text: t, at, w });
      at += w;
    }
  });
  return { out, w: at };
}

const textWidth = (s, size) => (String(s).includes('☐') ? pieces(s, size).w : plainWidth(s, size));

// One label at baseline y. ☐ becomes an empty box; the text either side is held to its estimated width
// (textLength) so the boxes never land on top of it.
function text(x, y, str, { size = BIG, anchor = 'middle', cls = '' } = {}) {
  const s = String(str ?? '');
  const c = cls ? `pic-label ${cls}` : 'pic-label';
  if (!s.includes('☐')) {
    return s.trim() ? `<text x="${r(x)}" y="${r(y)}" font-size="${size}" text-anchor="${anchor}" class="${c}">${esc(s)}</text>` : '';
  }
  const { out, w } = pieces(s, size);
  const left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return out.map((p) => (p.box
    ? `<rect x="${r(left + p.at)}" y="${r(y - 0.84 * size)}" width="${r(BOX * size)}" height="${r(1.02 * size)}" rx="3" class="pic-unknown"/>`
    : `<text x="${r(left + p.at)}" y="${r(y)}" font-size="${size}" text-anchor="start" textLength="${r(p.w)}" lengthAdjust="spacing" class="${c}">${esc(p.text)}</text>`)).join('');
}

const line = (x1, y1, x2, y2, cls = 'pic-line') => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" class="${cls}"/>`;
const rect = (x, y, w, h, cls, rx = 0) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"${rx ? ` rx="${rx}"` : ''} class="${cls}"/>`;
const circle = (cx, cy, rad, cls) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}" class="${cls}"/>`;

// words broken into lines no wider than maxW; numbers like "12 345" are never split
function wrap(str, size, maxW) {
  const words = String(str).replace(/(\d) (?=\d{3}\b)/g, '$1 ').split(' ').filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (!cur || textWidth(test, size) <= maxW) cur = test;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

// Labels placed in rows so none overlaps: items [{ x, w, h? }] (h in rows) -> the row each one goes in.
function stack(items, gap = 10, maxRows = 4) {
  const rows = [];
  const free = (row, a, b) => !(rows[row] || []).some(([l, rr]) => a < rr + gap && b > l - gap);
  return items.map((it) => {
    const a = it.x - it.w / 2, b = it.x + it.w / 2, h = it.h || 1;
    let row = 0;
    while (row < maxRows - 1 && !Array.from({ length: h }, (_, k) => free(row + k, a, b)).every(Boolean)) row++;
    for (let k = 0; k < h; k++) (rows[row + k] ||= []).push([a, b]);
    return row;
  });
}

// Boxes laid left to right in rows no wider than maxW, each row centred: items [{ w, h, draw(x, y) }].
function flow(items, gap = 10, maxW = PHONE) {
  if (!items.length) return { w: 0, h: 0, draw: () => '' };
  const rows = [[]];
  let x = 0;
  for (const it of items) {
    if (x > 0 && x + it.w > maxW) { rows.push([]); x = 0; }
    rows[rows.length - 1].push(it);
    x += it.w + gap;
  }
  const rowW = rows.map((row) => sum(row.map((it) => it.w)) + gap * (row.length - 1));
  const rowH = rows.map((row) => Math.max(...row.map((it) => it.h)));
  const w = Math.max(...rowW), h = sum(rowH) + gap * (rows.length - 1);
  return {
    w, h,
    draw(x0, y0) {
      let y = y0, out = '';
      rows.forEach((row, i) => {
        let xx = x0 + (w - rowW[i]) / 2;
        for (const it of row) { out += it.draw(xx, y + (rowH[i] - it.h) / 2); xx += it.w + gap; }
        y += rowH[i] + gap;
      });
      return out;
    },
  };
}

// Widths in proportion to sizes where they can be, but never under each one's minimum.
function fitWidths(sizes, mins, avail) {
  const fixed = sizes.map(() => false);
  let w = mins.slice();
  for (let round = 0; round <= sizes.length; round++) {
    const room = avail - sum(mins.filter((_, i) => fixed[i]));
    const open = sizes.filter((_, i) => !fixed[i]);
    const total = sum(open);
    let changed = false;
    w = sizes.map((s, i) => {
      if (fixed[i]) return mins[i];
      const x = total > 0 ? (room * s) / total : room / Math.max(open.length, 1);
      if (x < mins[i]) { fixed[i] = true; changed = true; }
      return x;
    });
    if (!changed) break;
  }
  return w.map((x, i) => Math.max(x, mins[i]));
}

// sizes for drawing: known values as they are, unknowns ('?') the average of the known ones
function sizesOf(values) {
  const known = values.filter((v) => typeof v === 'number' && Number.isFinite(v) && v > 0);
  const avg = known.length ? sum(known) / known.length : 1;
  return values.map((v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : avg));
}

function svg(type, w, h, body, label, style = '') {
  const W = Math.ceil(w), H = Math.ceil(h);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="pic pic-${type}" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${esc(label)}">${STYLE}${style}${body}</svg>`;
}

const singular = (place) => place.replace(/s$/, '');

// ---- array: dots in rows; past 60 dots, rows of bars marked with how many, then a ruled rectangle. shaded (the
// discrete model, S3 RQF B l.49): that many dots shaded column by column, top to bottom, each column a part of the
// smaller denominator (6/8 = ☐/4 on 2 rows of 4: 3 whole columns), the rest rings; in the dot form only ----

function array(p) {
  const rows = whole(p.rows, 10000), cols = whole(p.cols, 10000);
  const shaded = p.shaded == null ? null : whole(p.shaded, rows * cols);
  const say = `${plural(rows, 'row', 'rows')} of ${fmt(cols)}`;
  const capW = textWidth(say, BIG);
  const pitch = Math.min(32, Math.floor(PHONE / Math.max(cols, 1)), Math.floor(190 / Math.max(rows, 1)));
  let body = '', w, gh, dots = false;
  if (rows * cols <= 60 && pitch >= 16) {
    const gw = cols * pitch;
    gh = rows * pitch;
    w = Math.max(gw, capW) + 2 * PAD;
    const x0 = (w - gw) / 2;
    dots = true;
    const cls = (i, j) => (shaded === null ? 'pic-dot' : j * rows + i < shaded ? 'pic-dot pic-accent' : 'pic-line');
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) body += circle(x0 + pitch * (j + 0.5), PAD + pitch * (i + 0.5), pitch * 0.3, cls(i, j));
    }
  } else if (rows <= 10) {
    // "7 rows of 12": each row one bar with its count in it
    const step = Math.min(34, Math.floor(210 / rows)), bh = step - 5, fs = bh >= 24 ? BIG : SMALL, bl = 260;
    gh = rows * step - 5;
    w = Math.max(bl, capW) + 2 * PAD;
    const x0 = (w - bl) / 2;
    for (let i = 0; i < rows; i++) {
      const y = PAD + i * step;
      body += rect(x0, y, bl, bh, 'pic-line pic-soft', 4) + text(x0 + bl / 2, y + bh / 2 + fs * 0.36, fmt(cols), { size: fs });
    }
  } else {
    // many rows: a rectangle, ruled into its squares while they are big enough to see, with its sides marked
    const cell = Math.min(220 / Math.max(cols, 1), 150 / rows);
    const rw = Math.max(30, cols * cell), rh = Math.max(30, rows * cell);
    const leftW = textWidth(fmt(rows), BIG) + 10;
    w = Math.max(leftW + rw + leftW, capW) + 2 * PAD;
    const x0 = (w - rw) / 2, y0 = PAD + 26;
    body += rect(x0, y0, rw, rh, 'pic-line pic-soft');
    if (cell >= 5) {
      let d = '';
      for (let j = 1; j < cols; j++) d += `M${r(x0 + j * cell)} ${r(y0)}V${r(y0 + rh)}`;
      for (let i = 1; i < rows; i++) d += `M${r(x0)} ${r(y0 + i * cell)}H${r(x0 + rw)}`;
      if (d) body += `<path d="${d}" class="pic-line pic-thin"/>`;
    }
    body += text(x0 + rw / 2, PAD + 18, fmt(cols)) + text(x0 - 8, y0 + rh / 2 + 6, fmt(rows), { anchor: 'end' });
    gh = 26 + rh;
  }
  const capY = PAD + gh + (gh ? 26 : 18);
  return svg('array', w, capY + 8, body + text(w / 2, capY, say), `An array: ${say}${dots && shaded !== null ? `, ${fmt(shaded)} shaded` : ''}.`);
}

// ---- groups: boxes of dots, the leftover dots apart; past 60 dots, circles marked with how many ----

function dotBlock(n, d, dotCls, boxCls) {
  const k = Math.max(1, Math.ceil(Math.sqrt(n))), kr = Math.max(1, Math.ceil(n / k));
  const w = k * d + 12, h = kr * d + 12;
  return {
    w, h,
    draw: (x, y) => {
      let out = rect(x, y, w, h, boxCls, 10);
      for (let i = 0; i < n; i++) out += circle(x + 6 + d * ((i % k) + 0.5), y + 6 + d * (Math.floor(i / k) + 0.5), d * 0.3, dotCls);
      return out;
    },
  };
}

function circleGroups(g, each, left) {
  const t = fmt(each), D = Math.max(40, textWidth(t, BIG) + 16);
  const circ = (label, cls, tcls) => ({
    w: D, h: D,
    draw: (x, y) => circle(x + D / 2, y + D / 2, D / 2 - 1, cls) + text(x + D / 2, y + D / 2 + BIG * 0.36, label, { cls: tcls }),
  });
  const one = () => circ(t, 'pic-line pic-soft', '');
  const perRow = Math.max(1, Math.floor((PHONE + 8) / (D + 8))), fit = perRow * Math.max(1, Math.floor((190 + 8) / (D + 8)));
  const items = g + (left ? 1 : 0) <= fit ? Array.from({ length: g }, one)
    : [one(), one(), one(), { w: 30, h: D, draw: (x, y) => text(x + 15, y + D / 2 + 6, '…') }, one()];
  if (left) items.push(circ(fmt(left), 'pic-line pic-accent pic-dash', 'pic-accent'));
  return flow(items, 8);
}

// a question's picture: the whole amount as loose dots, and the empty groups to share it into when she is told how
// many; how many go in each, and what is left over, are hers to find
function shareBlank(g, each, left, find) {
  const n = g * each + left;
  const caption = find === 'groups' ? `${fmt(n)} in groups of ${fmt(each)}` : `${fmt(n)} shared into ${plural(g, 'group', 'groups')}`;
  const items = [], boxes = [], D = 30;
  if (n <= 60) items.push(dotBlock(n, 14, 'pic-dot', 'pic-line pic-soft'));
  if (find !== 'groups' && g <= 20) {
    for (let i = 0; i < g; i++) boxes.push({ w: D, h: D, draw: (x, y) => rect(x, y, D, D, 'pic-line pic-dash', 8) });
  }
  // the empty groups on their own rows under the dots, split evenly (9 groups a row of 5 and a row of 4); past two rows,
  // more groups than any generator shares into, beside the dots as before, so the picture stays under 260 px
  const rows = Math.ceil(boxes.length / Math.floor((PHONE + 10) / (D + 10)));
  if (rows > 2) items.push(...boxes);
  else if (rows) items.push(flow(boxes, 10, Math.ceil(boxes.length / rows) * (D + 10) - 10));
  const laid = flow(items, 10, rows > 2 ? PHONE : 0); // a width of 0: each on its own row
  const w = Math.max(laid.w, textWidth(caption, BIG)) + 2 * PAD;
  const capY = PAD + laid.h + (laid.h ? 26 : 18);
  return svg('groups', w, capY + 8, laid.draw((w - laid.w) / 2, PAD) + text(w / 2, capY, caption), caption);
}

function groups(p) {
  const g = whole(p.groups, 100000), each = whole(p.each, 1e9), left = whole(p.leftover, 1e9);
  if (p.blank) return shareBlank(g, each, left, p.find);
  const say = `${plural(g, 'group', 'groups')} of ${fmt(each)}`;
  const caption = left ? `${say}, ${fmt(left)} left over` : say;
  let laid = null;
  if (g * each + left <= 60 && g <= 20) {
    for (const d of [17, 14]) {
      const items = Array.from({ length: g }, () => dotBlock(each, d, 'pic-dot', 'pic-line pic-soft'));
      if (left) items.push(dotBlock(left, d, 'pic-dot pic-accent', 'pic-line pic-accent pic-dash'));
      laid = flow(items);
      if (laid.h <= 190) break;
      laid = null;
    }
  }
  if (!laid) laid = circleGroups(g, each, left);
  const w = Math.max(laid.w, textWidth(caption, BIG)) + 2 * PAD;
  const capY = PAD + laid.h + (laid.h ? 26 : 18);
  return svg('groups', w, capY + 8, laid.draw((w - laid.w) / 2, PAD) + text(w / 2, capY, caption),
    left ? `${say}, with ${fmt(left)} left over` : say);
}

// ---- chunks: the ladder, taking away groups she knows, the groups counted down the right (IES 2021 p. 9) ----

function chunks(p) {
  const n = whole(p.dividend, 1e15), d = whole(p.divisor, 1e9);
  let list = (Array.isArray(p.chunks) ? p.chunks : []).filter((c) => c && typeof c === 'object').map((c) => {
    const times = whole(c.times, 1e12);
    return { times, amount: c.amount === undefined ? times * d : whole(c.amount, 1e15) };
  });
  // more chunks than fit: join runs of the same chunk (ten 4s and ten 4s is twenty 4s), then the tail
  if (list.length > 5) {
    list = list.reduce((out, c) => {
      const last = out[out.length - 1];
      if (last && last.size === c.times) { last.times += c.times; last.amount += c.amount; } else out.push({ ...c, size: c.times });
      return out;
    }, []).map(({ times, amount }) => ({ times, amount }));
  }
  if (list.length > 5) {
    const rest = list.slice(4);
    list = [...list.slice(0, 4), { times: sum(rest.map((c) => c.times)), amount: sum(rest.map((c) => c.amount)) }];
  }
  if (p.blank) list = [];
  const lefts = [];
  let left = n;
  for (const c of list) { left = Math.max(0, left - c.amount); lefts.push(left); }
  const total = sum(list.map((c) => c.times));
  const rowsN = 1 + 2 * list.length;
  const pitch = Math.min(28, Math.floor(232 / rowsN));
  const F = Math.max(SMALL, Math.min(20, pitch - 4));
  const numW = Math.max(...[n, ...list.map((c) => c.amount), ...lefts].map((v) => textWidth(fmt(v), F)));
  const xNum = PAD + textWidth('−', F) + 6 + numW;
  const head = `groups of ${fmt(d)}`;
  const xG = xNum + 16 + textWidth('left over', SMALL) + 16;
  const xGR = xG + Math.max(24, ...[total, ...list.map((c) => c.times)].map((v) => textWidth(fmt(v), F)));
  const w = Math.max(xGR, xG + textWidth(head, SMALL)) + PAD;
  const top = (i) => PAD + i * pitch;
  const base = (i) => top(i) + pitch / 2 + F * 0.36;
  let body = text(xNum, base(0), fmt(n), { size: F, anchor: 'end' }) + text(xG, base(0), head, { size: SMALL, anchor: 'start' });
  list.forEach((c, j) => {
    const i = 2 * j + 1;
    body += text(PAD, base(i), '−', { size: F, anchor: 'start' }) + text(xNum, base(i), fmt(c.amount), { size: F, anchor: 'end' });
    body += text(xGR, base(i), fmt(c.times), { size: F, anchor: 'end', cls: 'pic-accent' });
    body += line(PAD, top(i + 1) + 1, xNum + 3, top(i + 1) + 1);
    body += text(xNum, base(i + 1), fmt(lefts[j]), { size: F, anchor: 'end' });
  });
  if (list.length) {
    const last = rowsN - 1;
    body += text(xNum + 12, base(last), 'left over', { size: SMALL, anchor: 'start' });
    body += line(xG + 4, top(last) + 1, xGR + 3, top(last) + 1);
    body += text(xGR, base(last), fmt(total), { size: F, anchor: 'end', cls: 'pic-strong' });
  }
  const label = p.blank ? `${fmt(n)} divided by ${fmt(d)} in chunks: take away groups of ${fmt(d)} you know.`
    : `${fmt(n)} divided by ${fmt(d)} in chunks: take away ${listWords(list.map((c) => `${plural(c.times, 'group', 'groups')} of ${fmt(d)}`))}. `
    + `That is ${plural(total, 'group', 'groups')} of ${fmt(d)}, with ${left ? fmt(left) : 'nothing'} left over.`;
  return svg('chunks', w, PAD + rowsN * pitch + PAD, body, label);
}

// ---- shortdiv: the "bus stop" as NSW classrooms write it, small carried digits before the next digit ----

function busStop(digits, d) {
  let carry = 0;
  return digits.map((dg) => {
    const here = carry * 10 + Number(dg);
    carry = here % d;
    return { q: Math.floor(here / d), left: carry };
  });
}

function shortdiv(p) {
  const n = whole(p.dividend, 1e15), d = whole(p.divisor, 1e9);
  const digits = String(n).split('');
  const given = Array.isArray(p.places) && p.places.length === digits.length && p.places.every((x) => x && typeof x === 'object');
  const places = p.blank ? digits.map(() => ({ q: '?', left: 0 }))
    : given ? p.places.map((x) => ({ q: x.q, left: whole(x.left, 1e9) }))
      : d ? busStop(digits, d) : digits.map(() => ({ q: '', left: 0 }));
  const rem = p.blank ? 0 : p.remainder !== undefined ? whole(p.remainder, 1e9) : places[places.length - 1].left;
  const DF = 28, colW = 38;
  const xBr = PAD + textWidth(fmt(d), DF) + 10;
  const cx = (i) => xBr + 14 + colW * (i + 0.5);
  const roofEnd = xBr + 14 + colW * digits.length + 4;
  const yQ = PAD + 24, roofY = yQ + 10, yD = roofY + 36;
  let body = text(xBr - 8, yD, fmt(d), { size: DF, anchor: 'end' });
  body += `<path d="M${r(xBr)} ${r(roofY)}Q${r(xBr + 11)} ${r((roofY + yD + 8) / 2)} ${r(xBr)} ${r(yD + 8)}M${r(xBr)} ${r(roofY)}H${r(roofEnd)}" class="pic-line"/>`;
  digits.forEach((dg, i) => {
    body += text(cx(i), yD, dg, { size: DF }) + text(cx(i), yQ, show(places[i].q), { size: DF });
    if (i < digits.length - 1 && places[i].left) {
      body += text(cx(i + 1) - DF * 0.3 - 1, yD - 14, fmt(places[i].left), { size: SMALL, anchor: 'end', cls: 'pic-accent pic-small' });
    }
  });
  let w = roofEnd;
  if (rem) {
    const t = `r ${fmt(rem)}`;
    body += text(cx(digits.length - 1) + 24, yQ, t, { size: 24, anchor: 'start' });
    w = Math.max(w, cx(digits.length - 1) + 24 + textWidth(t, 24));
  }
  const name = (i, k) => (k === 1 ? singular(PLACES[digits.length - 1 - i] || '') : PLACES[digits.length - 1 - i] || '');
  let label = `Short division: ${fmt(n)} divided by ${fmt(d)}.`;
  if (p.blank) label += ' A box above each digit for the answer.';
  else if (d) {
    const said = places.map((pl, i) => {
      const here = (i ? places[i - 1].left : 0) * 10 + Number(digits[i]);
      return `${fmt(here)} ${name(i, here)} divided by ${fmt(d)} is ${spoken(show(pl.q))}${pl.left && i < digits.length - 1 ? `, carry ${fmt(pl.left)}` : ''}`;
    });
    label += ` ${said.join('; ')}.${rem ? ` ${fmt(rem)} left over.` : ''}`;
  }
  return svg('shortdiv', w + PAD, yD + 10 + PAD, body, label);
}

// ---- balance: the two sides of "=" in pans on a level beam; stacked when they are too long to sit side by side ----

function pan(x, y, w, h, lines, F) {
  const lh = F + 6, y0 = y + (h - lines.length * lh) / 2;
  return rect(x, y, w, h, 'pic-line pic-soft', 10) + lines.map((s, k) => text(x + w / 2, y0 + k * lh + lh / 2 + F * 0.36, s, { size: F })).join('');
}

function balance(p) {
  const L = show(p.left), R = show(p.right);
  // with no box, the question is whether the sides are the same, so the picture asks rather than says
  const asking = !L.includes('☐') && !R.includes('☐');
  const caption = asking ? 'the same?' : 'the same as';
  const label = asking ? `A balance: is ${spoken(L) || 'nothing'} the same as ${spoken(R) || 'nothing'}?`
    : `A balance: ${spoken(L) || 'nothing'} is the same as ${spoken(R) || 'nothing'}.`;
  const F = 22, mid = 64;
  const pl = Math.max(84, textWidth(L, F) + 28), pr = Math.max(84, textWidth(R, F) + 28);
  if (pl + mid + pr <= PHONE) {
    const w = pl + mid + pr + 2 * PAD, bh = 48, xr = PAD + pl + mid, cm = PAD + pl + mid / 2, beamY = PAD + bh + 6;
    let body = pan(PAD, PAD, pl, bh, [L], F) + pan(xr, PAD, pr, bh, [R], F);
    body += text(cm, PAD + bh / 2 + 11, '=', { size: 32, cls: 'pic-strong' });
    body += line(PAD + 10, beamY, xr + pr - 10, beamY);
    body += `<path d="M${r(cm)} ${r(beamY + 2)}L${r(cm - 18)} ${r(beamY + 32)}H${r(cm + 18)}Z" class="pic-line pic-soft"/>`;
    body += text(cm, beamY + 56, caption);
    return svg('balance', w, beamY + 64, body, label);
  }
  const F2 = 20, ll = wrap(L, F2, PHONE - 28), rl = wrap(R, F2, PHONE - 28);
  const bw = Math.max(140, ...[...ll, ...rl].map((s) => textWidth(s, F2) + 28));
  const w = bw + 2 * PAD, hl = ll.length * (F2 + 6) + 18, hr = rl.length * (F2 + 6) + 18;
  let body = pan(PAD, PAD, bw, hl, ll, F2);
  const y = PAD + hl + 34;
  body += text(w / 2 - 12, y, '=', { size: 32, cls: 'pic-strong', anchor: 'end' }) + text(w / 2, y - 2, caption, { anchor: 'start' });
  body += pan(PAD, PAD + hl + 50, bw, hr, rl, F2);
  return svg('balance', w, PAD + hl + 50 + hr + PAD, body, label);
}

// ---- placevalue: a chart, columns named in full up to ten thousands; bigger charts grouped in threes ----
// (Millions | Thousands | Ones, each H T O), the way big numbers are read aloud (MA3-RN-01)

const PERIODS = ['Ones', 'Thousands', 'Millions', 'Billions'];

function placevalue(p) {
  if (p.decimals || Array.isArray(p.rows) || String(p.value ?? '').includes('.')) return decimalChart(p);
  let digits;
  if (typeof p.value === 'number') digits = Number.isFinite(p.value) ? String(Math.floor(Math.abs(p.value))).split('') : [];
  else digits = String(p.value ?? '').replace(/\?/g, '☐').split('').filter((c) => /[0-9☐]/.test(c));
  digits = digits.slice(-12);
  const n = Math.max(1, Math.min(12, Math.max(whole(p.columns, 12), digits.length)));
  const cells = Array.from({ length: n }, (_, i) => digits[digits.length - n + i] ?? '');
  const place = (i) => n - 1 - i;
  let hi = -1;
  if (typeof p.highlight === 'string') {
    const h = p.highlight.toLowerCase().trim();
    hi = PLACES.findIndex((x) => x === h || singular(x) === h);
    if (hi >= n) hi = -1;
  }
  const hc = hi < 0 ? -1 : n - 1 - hi; // the highlighted column, counted from the left
  const shown = typeof p.value === 'number' ? fmt(Math.floor(Math.abs(num(p.value)))) : digits.join('');
  const said = cells.map((c, i) => (c ? `${c === '☐' ? 'a box' : c} in the ${PLACES[place(i)]}` : null)).filter(Boolean);
  const label = said.length
    ? `A place-value chart showing ${spoken(shown)}: ${listWords(said)}.${hi >= 0 ? ` The ${PLACES[hi]} column is marked.` : ''}`
    : `An empty place-value chart, from the ${PLACES[n - 1]} to the ones.`;
  const rowH = 50, DF = 30;
  let body = '', w, h;
  let xs, colW;
  const digitRow = (y) => cells.map((c, i) => rect(xs[i], y, colW[i], rowH, 'pic-line')
    + text(xs[i] + colW[i] / 2, y + rowH / 2 + DF * 0.36, c, { size: DF, cls: i === hc ? 'pic-accent pic-strong' : '' })).join('');
  const lefts = (ws) => ws.map((_, i) => PAD + sum(ws.slice(0, i)));
  if (n <= 5) {
    const heads = cells.map((_, i) => {
      const ws = capital(PLACES[place(i)]).split(' ');
      return ws.length > 1 ? [ws[0], ws.slice(1).join(' ')] : ws;
    });
    const two = heads.some((x) => x.length > 1);
    colW = heads.map((x) => Math.max(46, ...x.map((s) => textWidth(s, SMALL) + 6)));
    xs = lefts(colW);
    const headH = two ? 48 : 30;
    heads.forEach((x, i) => {
      body += rect(xs[i], PAD, colW[i], headH, 'pic-line pic-soft');
      const lines = two && x.length === 1 ? ['', x[0]] : x;
      lines.forEach((s, k) => { body += text(xs[i] + colW[i] / 2, PAD + 20 + k * 20, s, { size: SMALL, cls: i === hc ? 'pic-accent pic-strong' : '' }); });
    });
    body += digitRow(PAD + headH);
    w = sum(colW) + 2 * PAD;
    h = PAD + headH + rowH + PAD;
    if (hc >= 0) body += rect(xs[hc], PAD, colW[hc], headH + rowH, 'pic-line pic-accent pic-thick');
  } else {
    let base = Math.min(40, Math.floor((PHONE - 12) / n)); // room for a period name wider than its columns
    const need = cells.map((_, i) => {
      const per = Math.floor(place(i) / 3), k = Math.min(3, n - per * 3);
      return (textWidth(PERIODS[per], SMALL) + 10) / k;
    });
    // a period name over one column ("Billions" over the 1 of 1 000 000 000) is wider than the rest: the columns their
    // names make wider than the others' share keep that width, and the others share the rest, at 20 or more, so the
    // chart stays a phone's width
    const room = PHONE - 2 * PAD;
    if (sum(need.map((x) => Math.max(base, x))) > room) {
      const wide = [...need].sort((a, b) => b - a);
      const share = (k) => (k < n ? Math.floor((room - sum(wide.slice(0, k))) / (n - k)) : 0);
      let k = 0;
      while (k < n && wide[k] > share(k)) k++;
      base = Math.max(20, Math.min(base, share(k)));
    }
    colW = need.map((x) => Math.max(base, x));
    xs = lefts(colW);
    const y1 = PAD + 26, y2 = y1 + 24;
    for (let per = 0; per * 3 < n; per++) {
      const cols = cells.map((_, i) => i).filter((i) => Math.floor(place(i) / 3) === per);
      const x = xs[cols[0]], ww = sum(cols.map((i) => colW[i]));
      body += rect(x, PAD, ww, 26, 'pic-line pic-soft') + text(x + ww / 2, PAD + 19, PERIODS[per], { size: SMALL, cls: 'pic-strong' });
    }
    cells.forEach((_, i) => {
      body += rect(xs[i], y1, colW[i], 24, 'pic-line pic-soft') + text(xs[i] + colW[i] / 2, y1 + 18, 'OTH'[place(i) % 3], { size: SMALL, cls: i === hc ? 'pic-accent pic-strong' : '' });
    });
    body += digitRow(y2);
    w = sum(colW) + 2 * PAD;
    let y = y2 + rowH;
    if (hc >= 0) {
      body += rect(xs[hc], y1, colW[hc], 24 + rowH, 'pic-line pic-accent pic-thick');
      const name = capital(PLACES[hi]), half = textWidth(name, BIG) / 2 + 2;
      const x = Math.min(Math.max(xs[hc] + colW[hc] / 2, PAD + half), w - PAD - half);
      body += text(x, y + 24, name, { cls: 'pic-accent pic-strong' });
      y += 26;
    }
    body += text(w / 2, y + 24, 'H hundreds · T tens · O ones', { size: SMALL });
    h = y + 24 + PAD + 2;
  }
  return svg('placevalue', w, h, body, label);
}

// ---- placevalue with decimals: the whole-number columns, the point, then tenths, hundredths and thousandths; several
// numbers (rows) lined up at the point. Named in full where the names fit a phone, else as letters (T O . t h th, the
// way Australian charts head them) with the names under the chart ----

const WHOLE_SHORT = ['O', 'T', 'H', 'Th', 'TTh', 'HTh'];
const DEC_SHORT = ['t', 'h', 'th'];
const POINT = 14; // the gap the point sits in, between the ones and the tenths

// labels as lines no wider than maxW, joined by " · " ("T tens · O ones")
function keyLines(items, size, maxW) {
  const lines = [];
  for (const it of items) {
    const last = lines.at(-1);
    if (last && textWidth(`${last} · ${it}`, size) <= maxW) lines[lines.length - 1] = `${last} · ${it}`;
    else lines.push(it);
  }
  return lines;
}

function decimalChart(p) {
  const digitsOf = (t) => t.replace(/\?/g, '☐').split('').filter((c) => /[0-9☐]/.test(c));
  const values = (Array.isArray(p.rows) && p.rows.length ? p.rows.slice(0, 5) : [p.value ?? '']).map((v) => {
    const { whole: w, frac } = splitDecimal(typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : v);
    return { whole: digitsOf(w).slice(-6), frac: digitsOf(frac).slice(0, 3) };
  });
  const nd = Math.max(1, Math.min(3, Math.max(whole(p.decimals, 3), ...values.map((v) => v.frac.length))));
  const nw = Math.max(1, Math.min(6, Math.max(whole(p.columns, 6), ...values.map((v) => v.whole.length))));
  const nc = nw + nd;
  // each row's cells, left to right: the whole-number places, then the decimal ones; an empty place is '' or, where the
  // way puts it there (zeros), a soft 0
  const rows = values.map((v) => {
    const any = v.whole.length + v.frac.length > 0;
    return [
      ...Array.from({ length: nw }, (_, i) => ({ c: v.whole[v.whole.length - nw + i] ?? '' })),
      ...Array.from({ length: nd }, (_, j) => (j < v.frac.length ? { c: v.frac[j] } : p.zeros && any ? { c: '0', soft: true } : { c: '' })),
    ];
  });
  const nameOf = (k) => (k < nw ? PLACES[nw - 1 - k] : DEC_PLACES[k - nw]);
  let hc = -1;
  if (typeof p.highlight === 'string') {
    const want = p.highlight.toLowerCase().trim();
    hc = Array.from({ length: nc }, (_, k) => nameOf(k)).findIndex((x) => x === want || singular(x) === want);
  }

  // full names where they fit, else letters with a key under the chart
  const fullHeads = Array.from({ length: nc }, (_, k) => {
    const ws = capital(nameOf(k)).split(' ');
    return ws.length > 1 ? [ws[0], ws.slice(1).join(' ')] : ws;
  });
  const fullW = fullHeads.map((x) => Math.max(46, ...x.map((t) => textWidth(t, SMALL) + 6)));
  const full = sum(fullW) + POINT <= PHONE - 2 * PAD;
  const heads = full ? fullHeads : Array.from({ length: nc }, (_, k) => [k < nw ? WHOLE_SHORT[nw - 1 - k] : DEC_SHORT[k - nw]]);
  const share = Math.floor((PHONE - 2 * PAD - POINT) / nc);
  const colW = full ? fullW : heads.map(([t]) => Math.max(Math.min(40, share), textWidth(t, SMALL) + 6));
  const two = heads.some((x) => x.length > 1);
  const headH = full ? (two ? 48 : 30) : 26;
  const xs = colW.map((_, k) => PAD + sum(colW.slice(0, k)) + (k >= nw ? POINT : 0));
  const xPoint = PAD + sum(colW.slice(0, nw)) + POINT / 2;
  const w = sum(colW) + POINT + 2 * PAD;
  const key = (ks) => keyLines(ks.map((k) => `${heads[k][0]} ${nameOf(k)}`), SMALL, w - 2 * PAD);
  const keys = full ? [] : [...key(Array.from({ length: nw }, (_, k) => k)), ...key(Array.from({ length: nd }, (_, j) => nw + j))];
  const keyH = keys.length ? keys.length * 22 + 6 : 0;
  // the rows share the height left, so four or five numbers still fit 260 px
  const one = rows.length === 1;
  const rowH = Math.min(one ? 50 : 44, Math.floor((258 - 2 * PAD - headH - keyH) / rows.length)), DF = Math.min(one ? 30 : 26, rowH - 10);

  let body = '';
  heads.forEach((x, k) => {
    body += rect(xs[k], PAD, colW[k], headH, 'pic-line pic-soft');
    const lines = two && x.length === 1 ? ['', x[0]] : x;
    lines.forEach((t, i) => { body += text(xs[k] + colW[k] / 2, PAD + (full ? 20 : 19) + i * 20, t, { size: SMALL, cls: k === hc ? 'pic-accent pic-strong' : '' }); });
  });
  rows.forEach((cells, r) => {
    const y = PAD + headH + r * rowH, base = y + rowH / 2 + DF * 0.36;
    cells.forEach(({ c, soft }, k) => {
      body += rect(xs[k], y, colW[k], rowH, 'pic-line')
        + text(xs[k] + colW[k] / 2, base, c, { size: DF, cls: soft ? 'pic-pale' : k === hc ? 'pic-accent pic-strong' : '' });
    });
    body += circle(xPoint, base - 3, 3.5, 'pic-dot');
  });
  let y = PAD + headH + rows.length * rowH;
  if (hc >= 0) body += rect(xs[hc], PAD, colW[hc], y - PAD, 'pic-line pic-accent pic-thick');
  for (const ln of keys) {
    y += 22;
    body += text(w / 2, y, ln, { size: SMALL });
  }
  if (keys.length) y += 6;
  const h = y + PAD;

  const shownAs = (cells) => {
    const ws = cells.slice(0, nw).map((x) => x.c).join(''), fs = cells.slice(nw).map((x) => x.c).join('');
    return spoken(fs ? `${ws || '0'}.${fs}` : ws);
  };
  const filled = rows.filter((cells) => cells.some((x) => x.c && !x.soft));
  const zeros = rows.some((cells) => cells.some((x) => x.soft)) ? ' The empty places are filled with zeros.' : '';
  let label;
  if (!filled.length) label = `An empty place-value chart, from the ${nameOf(0)} to the ${nameOf(nc - 1)}.`;
  else if (one) {
    const said = rows[0].map((x, k) => (x.c ? `${x.c === '☐' ? 'a box' : x.c} in the ${nameOf(k)}` : null)).filter(Boolean);
    label = `A place-value chart showing ${shownAs(rows[0])}: ${listWords(said)}.${zeros}`;
  } else label = `A place-value chart with ${rows.length} numbers lined up at the point: ${listWords(rows.map(shownAs))}.${zeros}`;
  if (hc >= 0) label += ` The ${nameOf(hc)} column is marked.`;
  return svg('placevalue', w, h, body, label);
}

// ---- grid: a square cut into 100, shaded by whole columns first (tenths), then squares (hundredths), with the tenths
// and hundredths written under it, or boxes for them (blank); IES 2010, "100 grids (10 by 10 squares, with each square
// representing 1/100 and the whole square representing 1)" ----

function grid(p) {
  const n = whole(p.shaded, 100);
  const S = 18;
  const t = Math.floor(n / 10), u = n % 10;
  const said = p.blank ? '☐ tenths and ☐ hundredths'
    : [t ? plural(t, 'tenth', 'tenths') : '', u || !t ? plural(u, 'hundredth', 'hundredths') : ''].filter(Boolean).join(' and ');
  const w = Math.max(10 * S, textWidth(said, BIG)) + 2 * PAD;
  const x0 = (w - 10 * S) / 2, y0 = PAD;
  let body = '';
  for (let k = 0; k < n; k++) body += rect(x0 + Math.floor(k / 10) * S, y0 + (k % 10) * S, S, S, 'pic-dot pic-accent');
  let d = '';
  for (let i = 1; i < 10; i++) d += `M${r(x0 + i * S)} ${r(y0)}V${r(y0 + 10 * S)}M${r(x0)} ${r(y0 + i * S)}H${r(x0 + 10 * S)}`;
  body += `<path d="${d}" class="pic-line pic-thin"/>` + rect(x0, y0, 10 * S, 10 * S, 'pic-line');
  body += text(w / 2, y0 + 10 * S + 28, said);
  const shaded = n === 0 ? 'none of it shaded'
    : `${t ? plural(t, 'whole column', 'whole columns') : ''}${t && u ? ' and ' : ''}${u ? `${plural(u, t ? 'more small square' : 'small square', t ? 'more small squares' : 'small squares')}` : ''} shaded`;
  const label = `A 100 grid, a square cut into 100 small squares, ${shaded}. Under it: ${spoken(said)}.`;
  return svg('grid', w, y0 + 10 * S + 28 + PAD + 4, body, label);
}

// ---- area: a rectangle split by place value, each part's product inside it ----

function area(p) {
  const rows = (Array.isArray(p.rowParts) && p.rowParts.length ? p.rowParts : ['?']).slice(0, 6);
  const cols = (Array.isArray(p.colParts) && p.colParts.length ? p.colParts : ['?']).slice(0, 6);
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const prod = (a, b) => (p.blank ? '☐' : a === 0 || b === 0 ? '0' : isNum(a) && isNum(b) ? fmt(a * b) : '☐');
  const cellText = rows.map((a) => cols.map((b) => prod(a, b)));
  let F = BIG;
  const mins = (f) => cols.map((b, j) => Math.max(52, textWidth(show(b), f) + 16, ...rows.map((_, i) => textWidth(cellText[i][j], f) + 16)));
  let leftW = Math.max(...rows.map((a) => textWidth(show(a), F))) + 12;
  if (sum(mins(F)) + leftW > PHONE) { F = SMALL; leftW = Math.max(...rows.map((a) => textWidth(show(a), F))) + 12; }
  const cw = fitWidths(sizesOf(cols), mins(F), PHONE - leftW);
  const rh = fitWidths(sizesOf(rows), rows.map(() => (rows.length > 4 ? 34 : 42)), 160);
  const x0 = PAD + leftW, y0 = PAD + 28;
  const cx = cw.map((_, j) => x0 + sum(cw.slice(0, j))), cy = rh.map((_, i) => y0 + sum(rh.slice(0, i)));
  let body = '';
  cols.forEach((b, j) => { body += text(cx[j] + cw[j] / 2, PAD + 18, show(b), { size: F, cls: 'pic-strong' }); });
  rows.forEach((a, i) => {
    body += text(x0 - 8, cy[i] + rh[i] / 2 + F * 0.36, show(a), { size: F, anchor: 'end', cls: 'pic-strong' });
    cols.forEach((_, j) => {
      body += rect(cx[j], cy[i], cw[j], rh[i], 'pic-line pic-soft') + text(cx[j] + cw[j] / 2, cy[i] + rh[i] / 2 + F * 0.36, cellText[i][j], { size: F });
    });
  });
  const said = rows.flatMap((a, i) => cols.map((b, j) => `${spoken(show(a))} times ${spoken(show(b))} is ${spoken(cellText[i][j])}`));
  const label = `An area model, ${listWords(rows.map((a) => spoken(show(a))))} by ${listWords(cols.map((b) => spoken(show(b))))}: ${said.join('; ')}.`;
  return svg('area', x0 + sum(cw) + PAD, y0 + sum(rh) + PAD, body, label);
}

// ---- numberline: ticks thinned and labels spaced so none overlaps; jumps above, marks and the point below ----

const NICE = [];
for (let e = 1; e <= 1e13; e *= 10) NICE.push(e, 2 * e, 5 * e);

function arrowHead(x, y, angle) {
  const a1 = angle + Math.PI * 0.85, a2 = angle - Math.PI * 0.85, L = 10;
  return `<path d="M${r(x)} ${r(y)}L${r(x + L * Math.cos(a1))} ${r(y + L * Math.sin(a1))}L${r(x + L * Math.cos(a2))} ${r(y + L * Math.sin(a2))}Z" class="pic-dot pic-accent"/>`;
}

// An empty number line (empty: true, a decimal count-up) is not to scale: each space between its stops is as wide as the
// jump over it needs for its label and arrow, and as its two mark labels under the line need, and what is left of the
// line is shared out by size. jumps [{ f, t, label }] and marks [{ v, label }] as numberline parsed them. v -> x,
// piecewise; null with no jumps (a question's line, its jumps left off), drawn to scale as any other.
function emptyLine(jumps, marks, from, to, x0, L) {
  if (!jumps.length) return null;
  const inside = (v) => Math.min(Math.max(v, from), to);
  const stops = [...new Set([from, to, ...jumps.flatMap((j) => [j.f, j.t]).map(inside)])].sort((a, b) => a - b);
  const named = new Map(marks.map((mk) => [mk.v, mk.label]));
  const half = (v) => (named.has(v) ? textWidth(named.get(v), BIG) / 2 : 0);
  const need = stops.slice(1).map((b, i) => {
    const a = stops[i], j = jumps.find((x) => inside(x.f) === a && inside(x.t) === b);
    return Math.max(j ? textWidth(j.label, BIG) + 12 : 0, 28, half(a) + half(b) + 10);
  });
  const spare = L - sum(need), span = to - from;
  const widths = need.map((n, i) => (spare >= 0 ? n + (spare * (stops[i + 1] - stops[i])) / span : (n * L) / sum(need)));
  const xs = widths.reduce((out, w) => [...out, out.at(-1) + w], [x0]);
  return (v) => {
    const c = inside(v);
    const i = Math.max(0, stops.findIndex((s, k) => k < stops.length - 1 && c <= stops[k + 1]));
    return xs[i] + ((c - stops[i]) / (stops[i + 1] - stops[i])) * widths[i];
  };
}

function numberline(p) {
  const from = num(p.from, 0);
  let to = num(p.to, 10);
  if (!(to > from)) to = from + 1;
  const span = to - from;
  let step = num(p.step, 0);
  if (!(step > 0) || span / step > 1e7) step = span / 10;
  const count = Math.floor(span / step + 1e-9);
  const at = (i) => +(from + i * step).toFixed(10);
  const lab = (v) => fmt(+v.toFixed(10));
  // zoom: one space of the line drawn again under it, cut into 10 (a tenth into hundredths, a hundredth into
  // thousandths; IES 2010, a line divided into tenths), labelled at its two ends as written
  const z = p.zoom && typeof p.zoom === 'object' ? { f: num(p.zoom.from, NaN), t: num(p.zoom.to, NaN) } : null;
  // a point outside the zoomed space would be drawn at its end, at a value it does not have: the zoom is left off, and
  // the point drawn on the line where it is (pictures cope with what they are given, never failing a screen)
  const at0 = p.point && typeof p.point === 'object' ? num(p.point.at, NaN) : null;
  const zoom = z && Number.isFinite(z.f) && z.t > z.f && (at0 === null || (at0 >= z.f - 1e-9 && at0 <= z.t + 1e-9))
    ? { ...z, lf: typeof p.zoom.from === 'string' ? p.zoom.from.trim() : lab(z.f), lt: typeof p.zoom.to === 'string' ? p.zoom.to.trim() : lab(z.t) } : null;
  const W = zoom ? PHONE : PHONE + 2 * PAD; // a zoomed line is a new picture, laid out to 340 as they all are
  const ends = [lab(from), lab(to), ...(zoom ? [zoom.lf, zoom.lt] : [])];
  const x0 = Math.max(18, Math.max(...ends.map((e) => textWidth(e, BIG))) / 2 + 4), L = W - 2 * x0;
  // the jumps and marks, read once (12 at most each), placed on the line below
  const given = (Array.isArray(p.jumps) ? p.jumps : []).filter((j) => j && typeof j === 'object').slice(0, 12)
    .map((j) => ({ f: num(j.from, from), t: num(j.to, from), label: show(j.label) }));
  const marks = (Array.isArray(p.marks) ? p.marks : []).filter((mk) => mk && typeof mk === 'object').slice(0, 12)
    .map((mk) => ({ v: num(mk.at, from), label: show(mk.label) }));
  const scaled = (v) => x0 + ((Math.min(Math.max(v, from), to) - from) / span) * L;
  const X = p.empty ? emptyLine(given, marks, from, to, x0, L) ?? scaled : scaled;
  const px = (L * step) / span;
  // ticks every m steps, at least 8 px apart; labels every k ticks, far enough apart that none overlaps
  const m = NICE.find((k) => px * k >= 8) || 1;
  let k = m, labels = [];
  for (const cand of NICE.filter((c) => c >= m && c % m === 0)) {
    k = cand;
    labels = [];
    for (let i = 0; i <= count; i += k) labels.push({ v: at(i), x: X(at(i)), w: textWidth(lab(at(i)), BIG) });
    if (labels.every((l, j) => j === 0 || l.x - labels[j - 1].x >= (l.w + labels[j - 1].w) / 2 + 10)) break;
  }
  if (Math.abs(labels[labels.length - 1].v - to) > 1e-9) {
    const end = { v: to, x: X(to), w: textWidth(lab(to), BIG) };
    while (labels.length > 1 && end.x - labels[labels.length - 1].x < (end.w + labels[labels.length - 1].w) / 2 + 10) labels.pop();
    labels.push(end);
  }
  const clampX = (x, w) => Math.min(Math.max(x, w / 2 + 2), W - w / 2 - 2);

  const jumps = given.map((j) => ({ ...j, a: X(j.f), b: X(j.t), w: textWidth(j.label, BIG) }));
  const jrow = stack(jumps.map((j) => ({ x: clampX((j.a + j.b) / 2, j.w), w: j.w })), 8, 3);
  const jRows = jumps.length ? Math.max(...jrow) + 1 : 0;
  const yLine = jumps.length ? PAD + 56 + (jRows - 1) * 22 : PAD + 16;

  let body = line(x0, yLine, x0 + L, yLine);
  let d = '';
  for (let i = 0; i <= count; i += m) d += `M${r(X(at(i)))} ${r(yLine - (i % k === 0 ? 9 : 5))}V${r(yLine + (i % k === 0 ? 9 : 5))}`;
  d += `M${r(X(to))} ${r(yLine - 9)}V${r(yLine + 9)}`;
  body += `<path d="${d}" class="pic-line"/>`;
  for (const l of labels) body += text(clampX(l.x, l.w), yLine + 30, lab(l.v), { cls: 'pic-tick' });

  jumps.forEach((j, i) => {
    if (Math.abs(j.b - j.a) >= 1) {
      const hgt = Math.min(32, Math.max(10, Math.abs(j.b - j.a) * 0.45)), m2 = (j.a + j.b) / 2, cy = yLine - 3 - 2 * hgt;
      body += `<path d="M${r(j.a)} ${r(yLine - 3)}Q${r(m2)} ${r(cy)} ${r(j.b)} ${r(yLine - 3)}" class="pic-line pic-accent"/>`;
      body += arrowHead(j.b, yLine - 3, Math.atan2(yLine - 3 - cy, j.b - m2));
    }
    body += text(clampX((j.a + j.b) / 2, j.w), yLine - 42 - jrow[i] * 22, j.label, { cls: 'pic-accent' });
  });

  const below = [];
  for (const mk of marks) {
    body += line(X(mk.v), yLine - 12, X(mk.v), yLine + 12, 'pic-line pic-accent');
    // a mark named just as the tick label already under it needs no second label
    if (mk.label && !labels.some((l) => Math.abs(l.v - mk.v) < 1e-9 && lab(l.v) === mk.label)) below.push({ x: X(mk.v), label: mk.label });
  }
  const point = p.point && typeof p.point === 'object' ? { v: num(p.point.at, from), label: show(p.point.label) } : null;
  if (point && !zoom) {
    body += circle(X(point.v), yLine, 6.5, 'pic-dot pic-accent');
    if (point.label) below.push({ x: X(point.v), label: point.label, strong: true });
  }
  below.forEach((b) => { b.w = textWidth(b.label, BIG); b.x = clampX(b.x, b.w); });
  const brow = stack(below, 8, 3);
  below.forEach((b, i) => { body += text(b.x, yLine + 30 + 24 * (brow[i] + 1), b.label, { cls: b.strong ? 'pic-accent pic-strong' : 'pic-accent' }); });
  let h = yLine + 30 + (below.length ? 24 * (Math.max(...brow) + 1) : 0) + PAD + 2;
  if (zoom) {
    // the second line, under the first and joined to its space by two dashed lines, which start under the first line's
    // labels so they cross none; it and all on it inside <g class="zoom">, so a reader can tell the two lines apart
    // (tests/oracle reads the point from it alone)
    const top = h - PAD + 4, y2 = top + 46;
    const Z = (v) => x0 + ((Math.min(Math.max(v, zoom.f), zoom.t) - zoom.f) / (zoom.t - zoom.f)) * L;
    body += `<path d="M${r(X(zoom.f))} ${r(top)}L${r(x0)} ${r(y2 - 12)}" class="pic-line pic-dash pic-thin"/>`;
    body += `<path d="M${r(X(zoom.t))} ${r(top)}L${r(x0 + L)} ${r(y2 - 12)}" class="pic-line pic-dash pic-thin"/>`;
    let zd = '';
    for (let i = 0; i <= 10; i++) zd += `M${r(x0 + (i * L) / 10)} ${r(y2 - (i % 10 === 0 ? 9 : i === 5 ? 7 : 5))}V${r(y2 + (i % 10 === 0 ? 9 : i === 5 ? 7 : 5))}`;
    let g = line(x0, y2, x0 + L, y2) + `<path d="${zd}" class="pic-line"/>`;
    for (const [v, t] of [[zoom.f, zoom.lf], [zoom.t, zoom.lt]]) g += text(clampX(Z(v), textWidth(t, BIG)), y2 + 30, t, { cls: 'pic-tick' });
    if (point) {
      g += circle(Z(point.v), y2, 6.5, 'pic-dot pic-accent');
      if (point.label) g += text(clampX(Z(point.v), textWidth(point.label, BIG)), y2 + 54, point.label, { cls: 'pic-accent pic-strong' });
    }
    body += `<g class="zoom">${g}</g>`;
    h = y2 + 30 + (point?.label ? 24 : 0) + PAD + 2;
  }

  // a step that is not a whole number is said as the count of equal spaces, never what one is worth, which is a step she
  // works out (dec-numberline: "what is one space worth?")
  const steps = count < 2 ? '' : Number.isInteger(step) ? `, in steps of ${lab(step)}` : `, cut into ${count} equal spaces`;
  let label = `A number line from ${lab(from)} to ${lab(to)}${steps}`;
  if (jumps.length) label += `. ${jumps.length === 1 ? 'A jump' : 'Jumps'} ${jumps.map((j) => `from ${lab(j.f)} to ${lab(j.t)}${j.label ? `, marked ${spoken(j.label)}` : ''}`).join('; ')}`;
  // a line marked letters: true has its marks as the choices she makes (dec-numberline's "which letter is at 0.65?"): each
  // said by its letter alone, so the words never say which letter is at the number asked about
  if (marks.length) label += `. Marked: ${marks.map((mk) => (p.letters ? mk.label : mk.label ? `${spoken(mk.label)} at ${lab(mk.v)}` : lab(mk.v))).join('; ')}`;
  if (zoom) label += `. Under it, the space from ${spoken(zoom.lf)} to ${spoken(zoom.lt)} is drawn again, cut into 10 equal spaces`;
  // a point with no label (a choice's, dec-numberline) is said with no value, which would be the answer
  if (point) label += point.label.includes('☐') ? '. A point marked with a box' : point.label ? `. A point at ${lab(point.v)}` : '. A point';
  return svg('numberline', W, h, body, `${label}.`);
}

// ---- table: a heading row, then the rows ----

function table(p) {
  const head = Array.isArray(p.head) ? p.head.map(show) : [];
  const rows = (Array.isArray(p.rows) ? p.rows : []).filter(Array.isArray).map((row) => row.map(show));
  const nc = Math.max(1, head.length, ...rows.map((row) => row.length));
  const cell = (row, j) => (row[j] ?? '');
  let F = BIG, padX = 12;
  const widths = (f, px, headW) => Array.from({ length: nc }, (_, j) => Math.max(f === BIG ? 44 : 32,
    (headW ? headW[j] : textWidth(cell(head, j), f) * 1.05), ...rows.map((row) => textWidth(cell(row, j), f))) + 2 * px);
  let cw = widths(F, padX);
  if (sum(cw) > PHONE) { F = SMALL; padX = 8; cw = widths(F, padX); }
  let headLines = Array.from({ length: nc }, (_, j) => [cell(head, j)]);
  if (sum(cw) > PHONE) {
    // headings that are words wrap onto two lines, as wide as the column's numbers
    headLines = headLines.map(([s], j) => wrap(s, F, Math.max(60, ...rows.map((row) => textWidth(cell(row, j), F)))));
    cw = widths(F, padX, headLines.map((ls) => Math.max(...ls.map((s) => textWidth(s, F) * 1.05))));
  }
  const nl = head.length ? Math.max(...headLines.map((ls) => ls.length)) : 0;
  let headH = nl ? nl * (F + 4) + 14 : 0;
  let rowH = F === BIG ? 36 : 30;
  // too tall: a narrow table is set as two halves side by side, each with its heading; otherwise rows close up
  const tableW = sum(cw), gap = 16;
  const halves = headH + rows.length * rowH > 244 && rows.length > 1 && 2 * tableW + gap <= PHONE ? 2 : 1;
  const perBlock = Math.ceil(rows.length / halves);
  if (headH + perBlock * rowH > 244) {
    F = SMALL;
    headH = nl ? nl * (F + 4) + 14 : 0;
    rowH = Math.max(22, Math.floor((244 - headH) / Math.max(perBlock, 1)));
  }
  const block = (dx, part) => {
    const xs = cw.map((_, j) => dx + sum(cw.slice(0, j)));
    let out = '';
    if (nl) {
      headLines.forEach((ls, j) => {
        out += rect(xs[j], PAD, cw[j], headH, 'pic-line pic-soft');
        ls.forEach((t, k) => { out += text(xs[j] + cw[j] / 2, PAD + 7 + (headH - 14 - ls.length * (F + 4)) / 2 + (k + 1) * (F + 4) - 4, t, { size: F, cls: 'pic-strong' }); });
      });
    }
    part.forEach((row, i) => {
      const y = PAD + headH + i * rowH;
      for (let j = 0; j < nc; j++) out += rect(xs[j], y, cw[j], rowH, 'pic-line') + text(xs[j] + cw[j] / 2, y + rowH / 2 + F * 0.36, cell(row, j), { size: F });
    });
    return out;
  };
  let body = block(PAD, rows.slice(0, perBlock));
  if (halves === 2) body += block(PAD + tableW + gap, rows.slice(perBlock));
  const said = rows.map((row) => Array.from({ length: nc }, (_, j) => spoken(cell(row, j)) || 'blank').join(', '));
  const label = `A table${head.length ? ` with columns ${listWords(head.map((s) => spoken(s) || 'blank'))}` : ''}${said.length ? `: ${said.join('; ')}` : ''}.`;
  return svg('table', halves * tableW + (halves - 1) * gap + 2 * PAD, PAD + headH + perBlock * rowH + PAD, body, label);
}

// ---- columns: the written method, operator on the left, carries small above their column ----

function columns(p) {
  const op = { '-': '−', '−': '−', x: '×', '*': '×', '×': '×' }[p.op] || '+';
  const digitsOf = (v) => (typeof v === 'number' ? (Number.isFinite(v) ? String(Math.floor(Math.abs(v))) : '')
    : String(v ?? '').replace(/[\s,]/g, '').replace(/\?/g, '☐')).split('');
  // with decimals: the decimal places on the right, a number's empty ones a soft 0 (3.4 written 3.40), and the point
  // in a gap between the ones and the tenths, so the points line up
  const nd = Math.min(3, Math.max(whole(p.decimals, 3), ...[p.top, p.bottom].map((v) => (typeof v === 'string' ? placesOf(v) : 0))));
  const cellsOf = (v) => {
    if (!nd) return [...digitsOf(v)].reverse().map((c) => ({ c }));
    const ds = (t) => t.replace(/\?/g, '☐').split('').filter((c) => /[0-9☐]/.test(c));
    const { whole: w, frac } = splitDecimal(typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : v);
    const f = ds(frac).slice(0, nd);
    if (!ds(w).length && !f.length) return [];
    const places = Array.from({ length: nd }, (_, j) => (j < f.length ? { c: f[j] } : { c: '0', soft: true }));
    return [...places.reverse(), ...ds(w).reverse().map((c) => ({ c }))];
  };
  const top = cellsOf(p.top), bottom = cellsOf(p.bottom);
  const carries = (Array.isArray(p.carries) ? p.carries : []).map((c) => (c === 0 || c === '0' ? '' : show(c)));
  const n = Math.max(1, top.length, bottom.length, ...carries.map((c, i) => (c ? i + 1 : 0)));
  const DF = 30, cw = 28, GAP = nd ? 12 : 0;
  const xRight = PAD + 34 + n * cw + GAP;
  const cx = (i) => xRight - cw * (i + 0.5) - (i >= nd ? GAP : 0); // column i, counting from the right
  const yC = PAD + 14, yT = yC + 36, yB = yT + 40, lineY = yB + 12;
  let body = '';
  carries.forEach((c, i) => { if (c) body += text(cx(i), yC, c, { size: SMALL, cls: 'pic-accent pic-small' }); });
  top.forEach(({ c, soft }, i) => { body += text(cx(i), yT, c, { size: DF, cls: soft ? 'pic-pale' : '' }); });
  bottom.forEach(({ c, soft }, i) => { body += text(cx(i), yB, c, { size: DF, cls: soft ? 'pic-pale' : '' }); });
  if (nd) for (const y of [yT, yB]) body += circle(xRight - cw * nd - GAP / 2, y - 3, 3.5, 'pic-dot');
  body += text(PAD + 12, yB, op, { size: DF });
  body += line(PAD, lineY, xRight + 2, lineY);
  // room to write the answer; × by two or more digits has a row for each partial product, then their sum
  let h = lineY + 44;
  if (op === '×' && bottom.length > 1) {
    const y2 = lineY + bottom.length * 38 + 6;
    body += text(PAD + 12, y2 - 12, '+', { size: DF }) + line(PAD, y2, xRight + 2, y2);
    h = y2 + 44;
  }
  const opWord = { '+': 'plus', '−': 'minus', '×': 'times' }[op];
  const placeOf = (i) => (i < nd ? DEC_PLACES[nd - 1 - i] : PLACES[i - nd]);
  const said = carries.map((c, i) => (c ? `${spoken(c)} ${op === '−' ? 'traded into' : 'carried to'} the ${placeOf(i) || 'next column'}` : null)).filter(Boolean);
  const written = (v, cells) => (nd ? String(v ?? '').replace(/[\s,]/g, '').replace(/\?/g, '☐') : [...cells].reverse().map((x) => x.c).join(''));
  const lined = nd ? ` with the points lined up${[...top, ...bottom].some((x) => x.soft) ? ' and a 0 in each empty place' : ''}` : '';
  const label = `${spoken(written(p.top, top)) || 'nothing'} ${opWord} ${spoken(written(p.bottom, bottom)) || 'nothing'}, written in columns${lined}${said.length ? `, with ${listWords(said)}` : ''}.`;
  return svg('columns', xRight + 2 + PAD, h + PAD, body, label);
}

// ---- bar: parts of a whole under a bracket for the total, or two bars to compare ----

// A bar's value: a number, or decimal text (stage 6, a word problem with decimals) sized by its thousandths, exactly, so
// '0.50' and '0.5' are the same size and only the drawn widths are pixels (8 characters at most, a safe whole number); a
// label still shows the text as written. Anything else ('?', a box) is unknown.
const amountOf = (v) => (typeof v === 'string' ? (thousandths(v) === null ? NaN : Number(thousandths(v))) : v);
const known = (v) => { const n = amountOf(v); return typeof n === 'number' && Number.isFinite(n) && n >= 0; };

function compareBars(c) {
  const side = (s) => ({ label: s && typeof s === 'object' ? show(s.label) : '', value: s && typeof s === 'object' ? s.value : '?' });
  const A = side(c.a), B = side(c.b);
  const labelW = Math.max(textWidth(A.label, BIG), textWidth(B.label, BIG));
  const leftLabels = labelW <= 110;
  const lw = leftLabels && labelW ? labelW + 12 : 0;
  const avail = PHONE - lw;
  const most = Math.max(known(A.value) ? amountOf(A.value) : 0, known(B.value) ? amountOf(B.value) : 0);
  // an unknown bar is drawn as long as the other one and dashed: the picture does not say which is bigger
  const len = (v, other) => (known(v) && most > 0 ? Math.max(36, (avail * amountOf(v)) / most)
    : known(other) && most > 0 ? Math.max(36, (avail * amountOf(other)) / most) : avail * 0.6);
  const bars = [A, B].map((s, i) => ({ ...s, len: len(s.value, [B, A][i].value), t: show(s.value) }));
  const bh = 40, gap = leftLabels ? 14 : 34;
  let body = '', y = PAD + (leftLabels ? 0 : 24);
  bars.forEach((b, i) => {
    const x = PAD + lw;
    if (leftLabels) body += text(PAD + lw - 12, y + bh / 2 + BIG * 0.36, b.label, { anchor: 'end' });
    else body += text(PAD, y - 8, b.label, { anchor: 'start' });
    body += rect(x, y, b.len, bh, known(b.value) ? 'pic-line pic-soft' : 'pic-line pic-soft pic-dash', 4);
    const tw = textWidth(b.t, BIG);
    body += tw + 12 <= b.len ? text(x + b.len / 2, y + bh / 2 + BIG * 0.36, b.t) : text(x + b.len + 6, y + bh / 2 + BIG * 0.36, b.t, { anchor: 'start' });
    bars[i].y = y;
    y += bh + gap;
  });
  const differ = known(A.value) && known(B.value) && amountOf(A.value) !== amountOf(B.value);
  if (differ) {
    // the difference: the shorter bar's missing length, dashed
    const [s, l] = bars[0].len < bars[1].len ? [bars[0], bars[1]] : [bars[1], bars[0]];
    if (l.len - s.len >= 4) body += rect(PAD + lw + s.len, s.y, l.len - s.len, bh, 'pic-line pic-accent pic-dash', 4);
  }
  const w = PAD + lw + Math.max(...bars.map((b) => b.len + (textWidth(b.t, BIG) + 12 <= b.len ? 0 : textWidth(b.t, BIG) + 6)), leftLabels ? 0 : labelW) + PAD;
  const say = (b) => `${b.label ? `${spoken(b.label)}, ` : ''}${spoken(b.t) || 'a box'}`;
  const label = `Two bars to compare: ${say(bars[0])}; and ${say(bars[1])}.${differ ? ' The difference between them is dashed.' : ''}`;
  return svg('bar', w, y - gap + PAD, body, label);
}

// One bar of parts under a bracket for its total, its top at y0. compact: a bar in a model of several, kept shorter.
// A value that is a slot (a part she is placing) is drawn empty, and the one she is on (now) marked thick.
function barRow(p, { y0 = 0, compact = false } = {}) {
  const parts = (Array.isArray(p.parts) ? p.parts : []).filter((x) => x && typeof x === 'object')
    .map((x) => ({ label: show(x.label), value: x.value === undefined ? '?' : x.value }));
  const hasTotal = p.total !== undefined && p.total !== null && p.total !== '';
  const kn = sum(parts.filter((x) => known(x.value)).map((x) => amountOf(x.value)));
  const unknowns = parts.filter((x) => !known(x.value)).length;
  const total = amountOf(p.total);
  const share = known(p.total) && unknowns && total - kn > 0 ? (total - kn) / unknowns : null;
  const sizes = share ? parts.map((x) => (known(x.value) ? amountOf(x.value) : share)) : sizesOf(parts.map((x) => amountOf(x.value)));
  const texts = parts.map((x) => show(x.value === '' ? '?' : x.value));
  const now = (v) => Boolean(v && typeof v === 'object' && v.now);
  // many parts: smaller numbers in narrower parts before the bar outgrows the screen
  const F = sum(texts.map((t) => Math.max(40, textWidth(t, BIG) + 18))) <= PHONE ? BIG : SMALL;
  const ws = parts.length ? fitWidths(sizes, texts.map((t) => (F === BIG ? Math.max(40, textWidth(t, BIG) + 18) : Math.max(24, textWidth(t, F) + 8))), PHONE) : [PHONE];
  const barW = sum(ws), xs = ws.map((_, i) => PAD + sum(ws.slice(0, i)));
  const [dTotal, dBracket, dBar, bh, dName] = compact ? [16, 24, 34, 40, 21] : [18, 28, 40, 44, 22];
  const yBar = y0 + PAD + (hasTotal ? dBar : 0);
  let body = '';
  if (hasTotal) {
    const value = show(p.total) || ' ';
    const t = p.totalLabel ? `${show(p.totalLabel)}: ${value}` : value, mid = PAD + barW / 2, yt = y0 + PAD + dBracket;
    const cls = now(p.total) ? 'pic-line pic-accent pic-thick' : 'pic-line';
    body += text(mid, y0 + PAD + dTotal, t, { cls: now(p.total) ? 'pic-strong pic-accent' : 'pic-strong' });
    body += `<path d="M${r(PAD + 1)} ${r(yt + 9)}V${r(yt + 3)}H${r(mid - 8)}L${r(mid)} ${r(yt - 3)}L${r(mid + 8)} ${r(yt + 3)}H${r(PAD + barW - 1)}V${r(yt + 9)}" class="${cls}"/>`;
  }
  if (!parts.length) body += rect(PAD, yBar, barW, bh, 'pic-line pic-soft', 4);
  parts.forEach((x, i) => {
    const cls = now(x.value) ? 'pic-line pic-soft pic-accent pic-thick' : known(x.value) ? 'pic-line pic-soft' : 'pic-line pic-soft pic-dash';
    body += rect(xs[i], yBar, ws[i], bh, cls, 4);
    body += text(xs[i] + ws[i] / 2, yBar + bh / 2 + F * 0.36, texts[i], { size: F });
  });
  // the parts' names under them, wrapped and set in rows so none overlaps; a name every part shares, once; a bar of
  // equal groups says how many ("4 packs", or a box she fills)
  const count = p.groups && typeof p.groups === 'object' ? p.groups.count : undefined;
  const counted = count !== undefined ? `${show(count) || '☐'} ${show(p.groups.label)}` : null;
  const same = !counted && parts.length > 1 && parts.every((x) => x.label && x.label === parts[0].label);
  const named = counted ? [{ label: counted }] : same ? [{ label: `each part: ${parts[0].label}` }] : parts;
  const names = named.map((x, i) => {
    if (same || counted) {
      const lines = wrap(x.label, BIG, PHONE);
      return { lines, w: Math.max(...lines.map((s) => textWidth(s, BIG))), h: lines.length, x: PAD + barW / 2 };
    }
    const lines = x.label ? wrap(x.label, BIG, Math.max(ws[i] - 4, 110)) : [];
    const w = Math.max(0, ...lines.map((s) => textWidth(s, BIG)));
    return { lines, w, h: lines.length, x: Math.min(Math.max(xs[i] + ws[i] / 2, PAD + w / 2), PAD + barW - w / 2) };
  });
  const rows = stack(names.map((nm) => ({ x: nm.x, w: nm.w, h: Math.max(1, nm.h) })), 10, 4);
  let bottom = yBar + bh;
  names.forEach((nm, i) => nm.lines.forEach((s, k) => {
    const y = yBar + bh + dName + (rows[i] + k) * dName;
    body += text(nm.x, y, s);
    if (counted && now(count)) body += rect(nm.x - nm.w / 2 - 6, y - BIG - 2, nm.w + 12, BIG + 10, 'pic-line pic-accent pic-thick', 4);
    bottom = Math.max(bottom, y + 5);
  }));
  const said = parts.map((x, i) => `${spoken(texts[i]) || 'a box'}${x.label ? ` (${spoken(x.label)})` : ''}`);
  const alike = parts.length > 1 && said.every((x) => x === said[0]);
  const whole = hasTotal ? `, making ${spoken(show(p.total)) || 'a box'}${p.totalLabel ? ` (${spoken(show(p.totalLabel))})` : ''} in all` : '';
  const what = counted ? `${spoken(counted)} of ${spoken(texts[0]) || 'a box'} each` : alike ? `${parts.length} equal parts, each ${said[0]}` : parts.length ? listWords(said) : 'one bar';
  return { body, w: barW + 2 * PAD, bottom, said: `${what}${whole}` };
}

function bar(p) {
  if (p.compare && typeof p.compare === 'object') return compareBars(p.compare);
  if (Array.isArray(p.rows)) return barSteps(p);
  const b = barRow(p);
  return svg('bar', b.w, b.bottom + PAD, b.body, `A bar model: ${b.said}.`);
}

// A bar model in steps: a bar for each, one under the other, each named as its step is (First, Then); a step's result
// ({ found: n }) is a box on a question (blank), filled in when she watches it worked.
function barSteps(p) {
  const value = (v) => (v && typeof v === 'object' && 'found' in v ? (p.blank ? '?' : v.found) : v);
  const rows = p.rows.filter((x) => x && typeof x === 'object');
  let y = 0, w = 0, body = '';
  const said = [];
  for (const row of rows) {
    const b = barRow({ ...row, total: value(row.total), parts: (row.parts || []).map((x) => ({ ...x, value: value(x?.value) })),
      ...(row.groups ? { groups: { ...row.groups, count: value(row.groups.count) } } : {}) }, { y0: y, compact: true });
    if (row.title) body += text(PAD, y + PAD + 16, row.title, { size: SMALL, anchor: 'start', cls: 'pic-strong' });
    body += b.body;
    w = Math.max(w, b.w);
    said.push(`${row.title ? `${spoken(row.title)}: ` : ''}${b.said}`);
    y = b.bottom + 6;
  }
  return svg('bar', w || PHONE + 2 * PAD, Math.max(y - 6, 0) + PAD, body, `A bar model, a bar for each step. ${said.join('. ')}.`);
}

// ---- the fraction pictures (plans/2026-10-25-stage-6-plan.md, "The fraction pictures"): each fits 340 by 260, with
// the classes tests/oracle/fractions.mjs reads them by ----

// a label's fractions in words, as the game says them ("3 eighths", "what eighths"; engine/fractions.js FRACTION and
// fractionWords, the pattern and words speech and the screens use too)
const fracSaid = (s) => spoken(String(s).replace(FRACTION, (_, n, d) => fractionWords(n, d)));
// a value on a line, n/d: a whole number said as a number
const valueSaid = (n, d) => (n % d === 0 ? fmt(n / d) : fractionWords(n, d));

const fracW = (n, d) => Math.max(textWidth(n, SMALL), textWidth(d, SMALL)) + 2;

// A fraction as she writes it, centred on x with its bar at y: <text class="pic-label pic-num">, the bar
// <line class="pic-line pic-fbar">, <text class="pic-label pic-den">, 16 px each. cls is added to all three (a mark's
// label, a jump's), so a reader can tell them from the tick labels.
function stacked(x, y, n, d, cls = '') {
  const w = fracW(n, d), more = cls ? ` ${cls}` : '';
  return text(x, y - 4, n, { size: SMALL, cls: `pic-num${more}` }) + line(x - w / 2, y, x + w / 2, y, `pic-line pic-fbar${more}`)
    + text(x, y + 15, d, { size: SMALL, cls: `pic-den${more}` });
}

// A label with fractions in it ("+2/8", "☐/8"): the plain text at baseline y, each fraction stacked with its bar at the
// plain text's middle, a box in it ("?" or ☐) drawn as a box. -> { w, tall (has a fraction), draw(x, y) centred on x }
function fracLabel(str, cls = '') {
  const s = String(str ?? '').trim(), bits = [];
  let at = 0;
  for (const m of s.matchAll(FRACTION)) {
    if (m.index > at) bits.push(s.slice(at, m.index).trim());
    bits.push({ n: show(m[1]), d: show(m[2]) });
    at = m.index + m[0].length;
  }
  if (at < s.length) bits.push(s.slice(at).trim());
  const ws = bits.map((b) => (typeof b === 'string' ? textWidth(b, BIG) : fracW(b.n, b.d) + 4));
  const w = sum(ws);
  return {
    w, tall: bits.some((b) => typeof b !== 'string'),
    draw(x, y) {
      let left = x - w / 2, out = '';
      bits.forEach((b, i) => {
        out += typeof b === 'string' ? text(left + ws[i] / 2, y, b, { cls }) : stacked(left + ws[i] / 2, y - 6, b.n, b.d, cls);
        left += ws[i];
      });
      return out;
    },
  };
}

// ---- strips: fraction strips and the tape diagram (S2 PF A l.44; IES l.602, "also known as ... tape diagrams"), 1 to
// 4 bars 40 px tall and 16 px apart, each in its own <g class="strip">: its parts <rect class="pic-part">, the first
// shaded ones "pic-part pic-shade", then its letter (pic-name), its unit fractions or its values (pic-value). total and
// shadedTotal are written over the first bar (pic-total, pic-part-total), each with its bracket
// <path class="pic-line pic-brace">, the shaded parts' nearer the bar ----

const STRIP = 40, STRIP_GAP = 16;

function strips(p) {
  const rows = (Array.isArray(p.rows) ? p.rows : []).filter((x) => x && typeof x === 'object').map((x) => {
    const d = Math.max(1, whole(x.d, 24)), counted = x.count != null, n = counted ? Math.max(1, whole(x.count, 24)) : d;
    const value = x.value == null || x.value === '' ? '' : show(p.blank ? '?' : x.value);
    return { d, n, counted, shaded: whole(x.shaded, n), name: x.name == null ? '' : String(x.name).trim(), unit: x.label === 'unit', value };
  });
  if (!rows.length) return '';
  const given = (v) => v != null && v !== '';
  const brackets = [];
  if (given(p.shadedTotal) && rows[0].shaded) brackets.push({ k: rows[0].shaded, label: show(p.shadedTotal), cls: 'pic-part-total' });
  if (given(p.total)) brackets.push({ k: rows[0].n, label: show(p.total), cls: 'pic-total' });
  const tops = brackets.map((b) => fracLabel(b.label, b.cls));
  const levels = tops.map((t) => (t.tall ? 40 : 30));
  // every bar under the brackets within 260 px (4 at most), or nothing drawn, as fracline refuses what it cannot space
  if (rows.length > Math.floor((260 - sum(levels)) / (STRIP + STRIP_GAP))) return '';
  const lens = rows.map((_, i) => (Array.isArray(p.lengths) && num(p.lengths[i]) > 0 ? num(p.lengths[i]) : 1));
  const nameW = rows.some((x) => x.name) ? Math.max(...rows.map((x) => textWidth(x.name, BIG))) + 10 : 0;
  const x0 = PAD + nameW;
  // a whole of length 1, in px: the longest bar fits what is left of 324 px
  const unit = (PHONE - 2 * PAD - nameW) / Math.max(...rows.map((x, i) => (lens[i] * x.n) / x.d));
  const part = rows.map((x, i) => (unit * lens[i]) / x.d);
  const w = x0 + Math.max(...rows.map((x, i) => x.n * part[i])) + PAD;
  const y0 = PAD + sum(levels);
  let body = '', yb = y0 - 4;
  brackets.forEach((b, k) => {
    const end = x0 + Math.min(b.k, rows[0].n) * part[0], top = yb - 8, t = tops[k];
    body += `<path d="M${r(x0)} ${r(yb)}V${r(top)}H${r(end)}V${r(yb)}" class="pic-line pic-brace"/>`;
    body += t.draw(Math.min(Math.max((x0 + end) / 2, t.w / 2 + 2), w - t.w / 2 - 2), top - 6);
    yb -= levels[k];
  });
  rows.forEach((x, i) => {
    const y = y0 + i * (STRIP + STRIP_GAP);
    let g = '';
    for (let j = 0; j < x.n; j++) g += rect(x0 + j * part[i], y, part[i], STRIP, j < x.shaded ? 'pic-part pic-shade' : 'pic-part');
    if (x.name) g += text(PAD + (nameW - 10) / 2, y + STRIP / 2 + BIG * 0.36, x.name, { cls: 'pic-strong pic-name' });
    const fs = x.value && textWidth(x.value, BIG) > part[i] - 4 ? SMALL : BIG;
    for (let j = 0; j < x.n; j++) {
      const mid = x0 + (j + 0.5) * part[i];
      if (x.value) g += text(mid, y + STRIP / 2 + fs * 0.36, x.value, { size: fs, cls: 'pic-value' });
      else if (x.unit && part[i] >= 28) g += stacked(mid, y + STRIP / 2, '1', String(x.d));
    }
    body += `<g class="strip">${g}</g>`;
  });
  const h = y0 + rows.length * (STRIP + STRIP_GAP) - STRIP_GAP + PAD;

  // in words: a lettered strip (a choice) by its letter alone, never its length; never how many parts are shaded
  const said = rows.map((x) => {
    if (x.name) return `strip ${spoken(x.name)}`;
    let t = !x.counted ? `a strip cut into ${plural(x.d, 'equal part', 'equal parts')}`
      : x.n === 1 ? 'one part alone' : `a strip of ${fmt(x.n)} parts, each ${fractionWords(1, x.d)}`;
    if (x.unit) t += x.counted ? (x.n === 1 ? `, marked ${fractionWords(1, x.d)}` : '') : `, each part marked ${fractionWords(1, x.d)}`;
    if (x.shaded) t += ', some shaded';
    if (x.value) t += `, each part ${fracSaid(x.value)}`;
    return t;
  });
  // a box by itself "with a box"; a box in a fraction its words ("what eighths")
  const marked = (v) => (v.replace(FRACTION, '').includes('☐') ? `with ${fracSaid(v)}` : fracSaid(v));
  let label = `Fraction strips: ${said.join('; ')}`;
  if (lens.some((l) => l !== lens[0])) label += '. The strips are different lengths';
  for (const b of brackets) label += b.cls === 'pic-total' ? `. The whole strip is marked ${marked(b.label)}` : `. The shaded parts are marked ${marked(b.label)}`;
  return svg('strips', w, h, body, `${label}.`, FRAC_STYLE);
}

// ---- fracline: a number line from 0 to wholes, a tick every 1/d in one path, taller at each whole, every tick's value
// over the line (labels 'all'), the whole numbers only ('wholes'), or only 0, 1/2 and 1 with no other ticks
// ('benchmarks', IES l.638); below: ticks and labels in d2ths under the line, in <g class="pic-below"> (IES l.628,
// l.636), and point.below '?' draws the one at the point as a box, as the point's own box is drawn, so a renaming's line
// never names the answer under its point (step 2.3 review 1); belowLabels 'wholes' labels only the whole numbers under
// it, every tick still drawn, so she counts the parts to the point (step 2.3 replay, the lead's I3); the point a
// <circle class="pic-dot pic-accent"> with its box under it; marks <line class="pic-line pic-accent"> 24 px tall, their
// labels over them (pic-mark) on the whole-number labels' line (A/058's 1/2, I9), a lettered line's letters (her
// choices) in a row of their own over the labels; jumps as numberline draws them, over the labels (pic-jump), a jump
// labelled '' with no room kept for a label (I2). Every space 26 px or more: a line with wholes × max(d, below) > 12 is
// refused, drawn as nothing.
// stack: a line from 0 to 1 for each denominator, 50 px apart, each in <g class="pic-stacked">, its unit fraction
// marked by a dot (IES l.654-660), so unit fractions too close on one line each have a line of their own ----

const FL_X0 = 12, FL_L = PHONE - 2 * FL_X0; // the line, 316 px
// a line with percentages under it starts and ends further in, 288 px, so "100%" (about 49 px at 18 px) stays inside
// 340 centred on its tick, and every label sits on its own tick
const PCT_X0 = 26;
const DEC_ROW = 26; // the decimals' row, under the percentages'

function fracline(p) {
  if (Array.isArray(p.stack)) return stackedLines(p.stack);
  const wholes = Math.max(1, whole(p.wholes, 12)), bench = p.labels === 'benchmarks';
  const d = whole(p.d, 1e6) || (bench ? 2 : 0), below = whole(p.below, 1e6);
  if (!d || wholes * Math.max(d, below) > 12) return '';
  // pct: the ticks under the line written as percentages, only with below, and only where every one is a whole per cent
  // (a below of 3, 6 or 8 draws nothing); dec: their decimals in a row under those, only with pct
  const pct = Boolean(p.pct) && below > 0, dec = pct && Boolean(p.dec);
  if (pct && 100 % below) return '';
  const x0 = pct ? PCT_X0 : FL_X0, len = PHONE - 2 * x0;
  const labels = bench ? 'benchmarks' : p.labels === 'all' ? 'all' : 'wholes';
  const per = bench ? 2 : d; // a tick every 1/per
  const X = (v) => x0 + (Math.min(Math.max(v, 0), wholes) / wholes) * len;
  const clampX = (x, w) => Math.min(Math.max(x, w / 2 + 2), PHONE - w / 2 - 2);
  const frac = (n, dd) => {
    const a = num(n, NaN), b = num(dd, NaN);
    return Number.isFinite(a) && a >= 0 && b > 0 ? { n: a, d: b, v: a / b } : null;
  };

  const marks = (Array.isArray(p.marks) ? p.marks : []).filter((mk) => mk && typeof mk === 'object').slice(0, 12)
    .map((mk) => ({ ...frac(mk.n, mk.d), label: show(mk.label) })).filter((mk) => Number.isFinite(mk.v))
    .map((mk) => ({ ...mk, lab: fracLabel(mk.label, 'pic-accent pic-mark') }));
  const jumps = (Array.isArray(p.jumps) ? p.jumps : []).filter((j) => j && typeof j === 'object' && Array.isArray(j.from) && Array.isArray(j.to))
    .slice(0, 12).map((j) => ({ f: frac(...j.from), t: frac(...j.to), label: show(j.label) })).filter((j) => j.f && j.t)
    .map((j) => ({ ...j, a: X(j.f.v), b: X(j.t.v), lab: fracLabel(j.label, 'pic-accent pic-jump') }));
  const point = p.point && typeof p.point === 'object' ? frac(p.point.n, p.point.d) : null;
  // under pct, a point's below or dec is '?' (its box) or not given, and a box only where the point is on a tick under
  // the line, with dec for a decimal's: anything else would draw no box while the words say one, so nothing is drawn
  // (step 3.1 review, finding 5)
  if (pct && point) {
    const { below: pb, dec: pd } = p.point, onTick = Number.isInteger((point.n * below) / point.d);
    if ((pb != null && pb !== '?') || (pd != null && (pd !== '?' || !dec)) || ((pb != null || pd != null) && !onTick)) return '';
  }
  const pointLabel = point ? fracLabel(show(p.point.label), 'pic-accent pic-strong') : null;
  // the tick under the line at the point, when its label there is hers to find: a box in its place
  const boxBelow = point && below && p.point.below === '?' ? (i) => i * point.d === point.n * below : () => false;
  // a point on a line labelled under it at the whole numbers only, with no box there: its label in the row under the
  // line, its denominator on the whole numbers' line (I9), that row 9 px lower so a fraction's numerator clears the
  // ticks, as the stacked labels below do; lower whether the point is named yet or not, so a renaming's line keeps its
  // place from step to step (the lead's ruling 1 on F5's replay, pt59). Every other line is drawn as before.
  const lowRow = Boolean(point && below && !pct && p.belowLabels === 'wholes' && p.point.below !== '?');
  const yBelow = lowRow ? 45 : 36;
  const belowAll = p.belowLabels !== 'wholes';
  // a mark's label sits on the whole-number labels' line, its foot level with theirs, unless the line is lettered or a
  // tick's label there leaves it no room; those go in a row of their own over the labels, as before
  const tickLabels = [];
  for (let i = 0; i <= wholes * per; i++) {
    if (i % per === 0) tickLabels.push({ x: X(i / per), w: textWidth(fmt(i / per), BIG) });
    else if (labels !== 'wholes') tickLabels.push({ x: X(i / per), w: fracW(String(i), String(per)) });
  }
  for (const mk of marks) {
    mk.x = clampX(X(mk.v), mk.lab.w);
    mk.low = !p.letters && mk.lab.w > 0 && tickLabels.every((t) => Math.abs(t.x - mk.x) >= (t.w + mk.lab.w) / 2 + 8);
  }
  const raised = marks.filter((mk) => !mk.low);

  // from the top: the jumps, the marks' labels, the tick labels, the line, the ticks below, the point's box
  const tickZone = (labels !== 'wholes' && per > 1) || marks.some((mk) => mk.low && mk.lab.tall) ? 46 : 36;
  const markZone = raised.some((mk) => mk.label) ? (raised.some((mk) => mk.lab.tall) ? 40 : 24) : 0;
  // only a jump with a label has a row for it; with none, only the arcs' height is kept
  const named = jumps.filter((j) => j.lab.w > 0);
  const tall = named.some((j) => j.lab.tall), rowStep = tall ? 32 : 22;
  const hgt = (j) => Math.min(32, Math.max(10, Math.abs(j.b - j.a) * 0.45));
  const placeJumps = (rows) => {
    const at = stack(named.map((j) => ({ x: clampX((j.a + j.b) / 2, j.lab.w), w: j.lab.w })), 8, rows);
    return jumps.map((j) => (j.lab.w > 0 ? at[named.indexOf(j)] : 0));
  };
  const under = below ? yBelow + 10 + (dec ? DEC_ROW : 0) : 9;
  // jumps with no label start 6 px or more clear of the labels under them, their arcs' feet and arrowheads (with half
  // their stroke) over the top of the highest label (its digits 0.75 of its size over its baseline; WebKit measured
  // 0.72): the whole numbers, the stacked labels, the marks' (the shots of the pt56 replay, A/066 to 068)
  const labelTop = Math.max(19 + 0.75 * BIG, labels !== 'wholes' && per > 1 ? 30 + 0.75 * SMALL : 0,
    ...marks.filter((mk) => mk.lab.w > 0).map((mk) => (mk.low ? (mk.lab.tall ? 38 + 0.75 * SMALL : 19 + 0.75 * BIG)
      : tickZone + (mk.lab.tall ? 24 + 0.75 * SMALL : 4 + 0.75 * BIG))));
  const lift = jumps.length && !named.length ? Math.max(0, Math.ceil(labelTop + 7 - tickZone - markZone)) : 0;
  const height = (jr) => {
    const n = named.length ? Math.max(...jr) + 1 : 0;
    const top = named.length ? 54 + (n - 1) * rowStep + (tall ? 14 : 0) : jumps.length ? Math.ceil(Math.max(...jumps.map(hgt))) + 4 : 0;
    return { top, h: PAD + top + lift + markZone + tickZone + under + (pointLabel?.w && !lowRow ? 23 : 0) + PAD };
  };
  // two rows of jump labels at most, and one where two would pass 260 px
  let jrow = placeJumps(2);
  if (height(jrow).h > 260) jrow = placeJumps(1);
  const { top: jumpZone, h: hLine } = height(jrow);
  // strip: under it all, a strip from 0 to 1 cut into the line's parts, each part's edges under its ticks, none shaded,
  // so the parts she counts lie between the line's 0 and 1, its point over them (frac-parts' on-line worked on strips;
  // the lead, pt62)
  const yStrip = hLine - PAD + 8, h = hLine + (p.strip ? STRIP + 8 : 0);
  const yLine = PAD + jumpZone + lift + markZone + tickZone, yArc = yLine - tickZone - markZone - lift;

  let body = line(x0, yLine, x0 + len, yLine);
  let ticks = '';
  for (let i = 0; i <= wholes * per; i++) ticks += `M${r(X(i / per))} ${r(yLine - (i % per === 0 ? 9 : 5))}V${r(yLine + (i % per === 0 ? 9 : 5))}`;
  body += `<path d="${ticks}" class="pic-line"/>`;
  for (let i = 0; i <= wholes * per; i++) {
    if (i % per === 0) body += text(X(i / per), yLine - 19, fmt(i / per), { cls: 'pic-tick' });
    else if (labels !== 'wholes') body += stacked(X(i / per), yLine - 26, String(i), String(per));
  }
  // the rows of labels under the line, one a tick, thinned together: only the point's own (or its box, boxed), the whole
  // numbers' and the halves' (where below is even), in that order, each tick labelled only where its widest label (its
  // percentage, or its decimal under it) is half its width plus half its neighbour's plus 6 px from every tick labelled
  // already, so tenths and quarters read 0%, 50%, 100% and the point's, and no row skips ticks unevenly (plan fact 4's
  // branch, the looker's F1 on the step 3.2 replay: "0% 20% 40% 60% ☐" invites a count on by 20), and every decimal
  // stands under its percentage, at the same points (fact 4, the step 3.2 replay's shots); drawn left to right
  const rows = [{ name: (i) => `${(100 * i) / below}%`, cls: 'pic-pct', boxed: p.point?.below === '?' },
    ...(dec ? [{ name: (i) => hundredthsText((100 * i) / below), cls: 'pic-dec', boxed: p.point?.dec === '?' }] : [])];
  const kept = () => {
    const last = wholes * below, at = point ? (point.n * below) / point.d : NaN;
    const ticks = Array.from({ length: last + 1 }, (_, i) => i);
    const order = [...new Set([...(Number.isInteger(at) && at <= last ? [at] : []), ...ticks.filter((i) => i % below === 0),
      ...ticks.filter((i) => below % 2 === 0 && i % (below / 2) === 0)])];
    const drawn = [];
    for (const i of order) {
      const w = Math.max(...rows.map((o) => (o.boxed && i === at ? fracLabel('☐').w : textWidth(o.name(i), BIG)))), x = X(i / below);
      if (drawn.every((o) => Math.abs(o.x - x) >= (o.w + w) / 2 + 6)) drawn.push({ i, x, w, box: i === at });
    }
    return drawn.sort((a, b) => a.i - b.i);
  };
  const thinned = (labelled, y, { name, cls, boxed }) => labelled.map((o) => (boxed && o.box ? fracLabel('☐', 'pic-accent pic-strong').draw(o.x, y)
    : text(o.x, y, name(o.i), { cls: `pic-tick ${cls}` }))).join('');
  if (pct) {
    let bt = '';
    for (let i = 0; i <= wholes * below; i++) bt += `M${r(X(i / below))} ${r(yLine)}V${r(yLine + 12)}`;
    const labelled = kept();
    const g = rows.map((o, k) => thinned(labelled, yLine + yBelow + k * DEC_ROW, o)).join('');
    body += `<g class="pic-below"><path d="${bt}" class="pic-line"/>${g}</g>`;
  } else if (below) {
    let bt = '', g = '';
    for (let i = 0; i <= wholes * below; i++) {
      bt += `M${r(X(i / below))} ${r(yLine)}V${r(yLine + 12)}`;
      g += i === 0 ? text(X(0), yLine + yBelow, '0', { cls: 'pic-tick' }) : boxBelow(i) ? fracLabel('☐', 'pic-accent pic-strong').draw(X(i / below), yLine + yBelow)
        : belowAll ? stacked(X(i / below), yLine + yBelow - 6, String(i), String(below))
          : i % below === 0 ? text(X(i / below), yLine + yBelow, fmt(i / below), { cls: 'pic-tick' }) : '';
    }
    body += `<g class="pic-below"><path d="${bt}" class="pic-line"/>${g}</g>`;
  }
  for (const mk of marks) {
    body += line(X(mk.v), yLine - 12, X(mk.v), yLine + 12, 'pic-line pic-accent');
    // on the whole numbers' line: a word on their baseline, a fraction with its denominator there
    if (mk.low) body += mk.lab.draw(mk.x, yLine - 19 - (mk.lab.tall ? 9 : 0));
    else if (mk.label) body += mk.lab.draw(mk.x, yLine - tickZone - (mk.lab.tall ? 14 : 4));
  }
  jumps.forEach((j, i) => {
    if (Math.abs(j.b - j.a) >= 1) {
      const m2 = (j.a + j.b) / 2, cy = yArc - 2 * hgt(j);
      body += `<path d="M${r(j.a)} ${r(yArc)}Q${r(m2)} ${r(cy)} ${r(j.b)} ${r(yArc)}" class="pic-line pic-accent"/>`;
      body += arrowHead(j.b, yArc, Math.atan2(yArc - cy, j.b - m2));
    }
    // a stacked label raised clear of its arc
    body += j.lab.draw(clampX((j.a + j.b) / 2, j.lab.w), yArc - 39 - (tall ? 12 : 0) - jrow[i] * rowStep);
  });
  if (p.strip) {
    let g = '';
    for (let j = 0; j < per; j++) g += rect(X(j / per), yStrip, X((j + 1) / per) - X(j / per), STRIP, 'pic-part');
    body += `<g class="strip">${g}</g>`;
  }
  if (point) {
    body += circle(X(point.v), yLine, 6.5, 'pic-dot pic-accent');
    if (pointLabel.w) body += pointLabel.draw(clampX(X(point.v), pointLabel.w), lowRow ? yLine + yBelow - (pointLabel.tall ? 9 : 0) : yLine + under + 21);
  }

  // in words: the point never by its value, which is what she works out; letters by letter only, as numberline says them
  let label = `A number line from 0 to ${wholes}`;
  if (bench) label += wholes === 1 ? ', marked only at 0, 1 half and 1' : ', marked only at the whole numbers and the halves';
  else label += per === 1 ? ', marked at the whole numbers' : FRACTION_NAMES[per] ? `, cut into ${FRACTION_NAMES[per][1]}` : `, each whole cut into ${per} equal parts`;
  if (pct) label += `, with percentages marked under it${dec ? ', and decimals under those' : ''}`;
  else if (below) label += FRACTION_NAMES[below] ? `, with ${FRACTION_NAMES[below][1]} marked under it` : `, with each whole cut into ${below} under it`;
  if (point) label += pointLabel.w ? (p.point.label === '?' || String(p.point.label).includes('☐') ? ', a point marked with a box' : `, a point marked ${fracSaid(show(p.point.label))}`) : ', a point';
  if (point && below && p.point.below === '?') label += pct ? ', its percentage under the line a box' : ', its label under the line a box';
  if (point && dec && p.point.dec === '?') label += ', its decimal under the line a box';
  if (p.strip) label += `. Under it, a strip from 0 to 1 cut into ${FRACTION_NAMES[per] ? FRACTION_NAMES[per][1] : `${per} equal parts`}, none shaded`;
  if (named.length) label += `. ${named.length === 1 ? 'A jump' : 'Jumps'} ${named.map((j) => `from ${valueSaid(j.f.n, j.f.d)} to ${valueSaid(j.t.n, j.t.d)}${j.label ? `, marked ${fracSaid(j.label)}` : ''}`).join('; ')}`;
  // jumps with no label, each run of one size and way said by its size, its way and its start only, never how many
  // there are nor where they end (the count is the answer on a difference, the end on a sum: the lead, pt56)
  for (const run of jumpRuns(jumps.filter((j) => !(j.lab.w > 0)))) {
    const [f] = run, size = Math.abs(f.t.n * f.f.d - f.f.n * f.t.d), dd = f.f.d * f.t.d, g = gcd(size, dd);
    label += `. Jumps of ${valueSaid(size / g, dd / g)}, ${f.t.v > f.f.v ? 'on' : 'back'} from ${valueSaid(f.f.n, f.f.d)}`;
  }
  if (marks.length) label += `. Marked: ${marks.map((mk) => (p.letters ? fracSaid(mk.label) : mk.label ? `${fracSaid(mk.label)} at ${valueSaid(mk.n, mk.d)}` : valueSaid(mk.n, mk.d))).join('; ')}`;
  return svg('fracline', PHONE, h, body, `${label}.`, FRAC_STYLE);
}

// jumps in runs: each run one after another, each jump the same size and the same way as the one before it, and
// starting where it ended
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
function jumpRuns(jumps) {
  const runs = [];
  for (const j of jumps) {
    const last = runs.at(-1)?.at(-1);
    const same = last && Math.abs(last.t.v - j.f.v) < 1e-9 && Math.abs((last.t.v - last.f.v) - (j.t.v - j.f.v)) < 1e-9;
    if (same) runs.at(-1).push(j);
    else runs.push([j]);
  }
  return runs;
}

function stackedLines(list) {
  const ds = list.slice(0, 4).map((d) => whole(d, 1e6));
  if (!ds.length || ds.some((d) => d < 2 || d > 12)) return '';
  const X = (v) => FL_X0 + v * FL_L;
  let body = '';
  ds.forEach((d, i) => {
    const y = PAD + 46 + i * 50;
    let t = '';
    for (let k = 0; k <= d; k++) t += `M${r(X(k / d))} ${r(y - (k % d === 0 ? 9 : 5))}V${r(y + (k % d === 0 ? 9 : 5))}`;
    const g = line(X(0), y, X(1), y) + `<path d="${t}" class="pic-line"/>`
      + text(X(0), y - 19, '0', { cls: 'pic-tick' }) + text(X(1), y - 19, '1', { cls: 'pic-tick' })
      + circle(X(1 / d), y, 6.5, 'pic-dot pic-accent') + stacked(X(1 / d), y - 26, '1', String(d));
    body += `<g class="pic-stacked">${g}</g>`;
  });
  const cut = (d) => (FRACTION_NAMES[d] ? `cut into ${FRACTION_NAMES[d][1]}` : `cut into ${d} equal parts`);
  const label = `${ds.length === 1 ? 'A number line' : `${ds.length} number lines, one under the other,`} from 0 to 1${ds.length > 1 ? ', lined up at 0 and 1' : ''}: `
    + `${ds.map((d) => `${ds.length > 1 ? 'one ' : ''}${cut(d)}, ${fractionWords(1, d)} marked`).join('; ')}.`;
  return svg('fracline', PHONE, PAD + 46 + (ds.length - 1) * 50 + 9 + PAD, body, label, FRAC_STYLE);
}

// ---- fracarea: the area model (S3 RQF B l.49), a 240 × 160 <rect class="pic-line"> cut by cols − 1 and rows − 1
// lines in one <path class="pic-line pic-thin">, the first shaded columns each a <rect class="pic-part pic-shade"> ----

function fracarea(p) {
  const cols = Math.max(1, whole(p.cols, 24)), rows = Math.max(1, whole(p.rows, 24)), shaded = whole(p.shaded, cols);
  const W = 240, H = 160, cw = W / cols, rh = H / rows;
  let body = '', d = '';
  for (let j = 0; j < shaded; j++) body += rect(PAD + j * cw, PAD, cw, H, 'pic-part pic-shade');
  for (let j = 1; j < cols; j++) d += `M${r(PAD + j * cw)} ${r(PAD)}V${r(PAD + H)}`;
  for (let i = 1; i < rows; i++) d += `M${r(PAD)} ${r(PAD + i * rh)}H${r(PAD + W)}`;
  if (d) body += `<path d="${d}" class="pic-line pic-thin"/>`;
  body += rect(PAD, PAD, W, H, 'pic-line');
  const label = `A rectangle cut into ${plural(cols, 'equal column', 'equal columns')}${rows > 1 ? ` and ${plural(rows, 'equal row', 'equal rows')}` : ''}, `
    + `${shaded ? `${plural(shaded, 'column', 'columns')} shaded` : 'none shaded'}.`;
  return svg('fracarea', W + 2 * PAD, H + 2 * PAD, body, label, FRAC_STYLE);
}

// ---- the measurement pictures (stage 6 strand 4, plans/2026-10-25-stage-6-plan.md "The measurement pictures"): each
// fits 340 × 260 with no text under 16 px, says itself in words that never give what she works out (a reading, a
// perimeter, an area or a volume), and carries the classes tests/oracle/measurement.mjs reads it by. A picture that
// would do a step is marked working: true by its generator; move and double are drawn on such a picture only ----

// their own rules, in their SVG alone with FRAC_STYLE's parts and shading, so every older picture is drawn as before
const MEAS_STYLE = '<style>'
  + `:where(.pic .pic-pointer){fill:${ACCENT}}`
  + ':where(.pic .pic-part.pic-unit-square){stroke-width:1.25}'
  + ':where(.pic .pic-cube){fill:none;stroke:var(--pic-ink,currentColor);stroke-width:1.5;stroke-linejoin:round}'
  + ':where(.pic .pic-cube.pic-top){fill:var(--pic-soft,rgba(128,128,128,.16))}'
  + ':where(.pic .pic-cube.pic-right){fill:var(--pic-shadow,rgba(128,128,128,.32))}'
  + '</style>';

// a whole number, given as a number or its digits, else NaN: a picture asked for with a part of one draws nothing
const counted = (v) => { const n = num(v, NaN); return Number.isInteger(n) ? n : NaN; };
// a straight line [[x1, y1], [x2, y2]] through a label's box { l, r, top, bot } (Liang-Barsky)
function through([[x1, y1], [x2, y2]], q) {
  let t0 = 0, t1 = 1;
  const dx = x2 - x1, dy = y2 - y1;
  for (const [pp, k] of [[-dx, x1 - q.l], [dx, q.r - x1], [-dy, y1 - q.top], [dy, q.bot - y1]]) {
    if (pp === 0) { if (k < 0) return false; continue; }
    const t = k / pp;
    if (pp < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  return true;
}
// two straight lines crossing each other, not only meeting at an end
function meets([[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (Math.abs(d) < 1e-9) return false;
  const u = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, v = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return u > 0.01 && u < 0.99 && v > 0.01 && v < 0.99;
}
// the point of a straight line nearest a point
function footOf([[x1, y1], [x2, y2]], [x, y]) {
  const dx = x2 - x1, dy = y2 - y1, t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)));
  return [x1 + t * dx, y1 + t * dy];
}
// how far a straight line passes from a label's box, 0 where it goes through it
function gap(ln, q) {
  if (through(ln, q)) return 0;
  const toBox = ([x, y]) => Math.hypot(Math.max(q.l - x, 0, x - q.r), Math.max(q.top - y, 0, y - q.bot));
  return Math.min(...ln.map(toBox), ...[[q.l, q.top], [q.r, q.top], [q.l, q.bot], [q.r, q.bot]].map((c) => { const f = footOf(ln, c); return Math.hypot(f[0] - c[0], f[1] - c[1]); }));
}
// thousandths back to the shortest decimal text ('4.5', never '4.500')
const decimalText = (t) => { const f = String(t % 1000n).padStart(3, '0').replace(/0+$/, ''); return f ? `${t / 1000n}.${f}` : String(t / 1000n); };

// ---- scale: a ruler, tape measure or kitchen scales across, one line 316 px long (shorter only where a wide end label
// needs the room), 18 px ticks down from it at the labelled marks (<path class="pic-line pic-major">) with their labels
// under them (<text class="pic-tick">), 9 px ticks at the rest (<path class="pic-line pic-minor">), and the unit once,
// under the last label (<text class="pic-unit">); on a ruler or tape the object 24 px tall just over the line from start
// to end (<rect class="pic-part pic-shade pic-object">), on kitchen scales a pan (<path class="pic-line pic-soft">) and
// a pointer from above (<path class="pic-accent pic-pointer">, its first corner the tip). A jug is drawn up: its outline
// 120 px wide (<path class="pic-line pic-jug">), the ticks up its left side (the small ones from 6 px outside it) and
// their labels left of them, the unit over them, the liquid from the bottom to end (<rect class="pic-part pic-shade
// pic-object">). Every small space is 26 px or more, as every fraction space is: a scale of more spaces than that allows
// (12 across, 8 up) draws nothing, and so does one it cannot say true (marks not equally spaced, end on a labelled mark,
// a unit not of what the device measures).
// Chosen for this game, not a syllabus requirement: a ruler, tape measure, jug or kitchen scales read from a picture in
// place of a real device, and every scale drawn straight, never as a round dial (plans/2026-10-25-stage-6-plan.md,
// "What is outside NESA in the measurement strand") ----

const MEASURED = { ruler: ['A ruler', 'length'], tape: ['A tape measure', 'length'], kitchen: ['Kitchen scales', 'mass'], jug: ['A jug', 'capacity'] };

function scale(p) {
  const [called, kind] = MEASURED[p.device] ?? [];
  const marks = Array.isArray(p.marks) ? p.marks.map((m) => String(m ?? '').trim()) : [];
  const at = marks.map((m) => thousandths(m));
  const step = at.length > 1 && at[0] !== null && at[1] !== null ? at[1] - at[0] : 0n;
  const parts = [2, 4, 5, 10].includes(counted(p.parts)) ? counted(p.parts) : 0;
  const up = p.device === 'jug', along = p.device === 'ruler' || p.device === 'tape';
  const total = (marks.length - 1) * parts, start = p.start == null ? 0 : counted(p.start), end = counted(p.end);
  const name = typeof p.name === 'string' ? p.name.trim() : '';
  if (!kind || UNITS[p.unit]?.kind !== kind || marks.length < 2 || marks.length > 7 || !parts || total > (up ? 8 : 12)
    || step <= 0n || at.some((t, i) => t === null || t !== at[0] + BigInt(i) * step)
    || !(start >= 0) || (start > 0 && !along) || !(end > start && end <= total) || end % parts === 0
    || (!name && p.device !== 'kitchen') || (step * BigInt(start)) % BigInt(parts) !== 0n) return '';
  let body = '', w, h;
  if (!up) {
    const x0 = Math.max(12, textWidth(marks[0], BIG) / 2 + 1), x1 = PHONE - Math.max(12, textWidth(marks.at(-1), BIG) / 2 + 1);
    const space = (x1 - x0) / total, X = (i) => x0 + i * space;
    if (space < 26) return '';
    // the line, under the object, or under the pan and the pointer
    const y = p.device === 'kitchen' ? PAD + 62 : PAD + 31;
    if (p.device === 'kitchen') {
      const [tx, ty, c] = [X(end), y - 3, PHONE / 2];
      body += `<path d="M${c - 60} ${PAD + 4}L${c + 60} ${PAD + 4}L${c + 44} ${PAD + 24}L${c - 44} ${PAD + 24}Z" class="pic-line pic-soft"/>`;
      body += `<path d="M${r(tx)} ${r(ty)}L${r(tx - 7)} ${r(ty - 12)}L${r(tx - 2.5)} ${r(ty - 12)}L${r(tx - 2.5)} ${r(ty - 28)}`
        + `L${r(tx + 2.5)} ${r(ty - 28)}L${r(tx + 2.5)} ${r(ty - 12)}L${r(tx + 7)} ${r(ty - 12)}Z" class="pic-accent pic-pointer"/>`;
    } else body += rect(X(start), y - 25, X(end) - X(start), 24, 'pic-part pic-shade pic-object');
    let major = '', minor = '';
    for (let i = 0; i <= total; i++) {
      if (i % parts) minor += `M${r(X(i))} ${r(y)}V${r(y + 9)}`;
      else major += `M${r(X(i))} ${r(y)}V${r(y + 18)}`;
    }
    body += line(x0, y, x1, y) + `<path d="${major}" class="pic-line pic-major"/><path d="${minor}" class="pic-line pic-minor"/>`;
    marks.forEach((m, k) => { body += text(X(k * parts), y + 40, m, { cls: 'pic-tick' }); });
    body += text(PHONE - PAD, y + 64, p.unit, { anchor: 'end', cls: 'pic-unit' });
    [w, h] = [PHONE, y + 64 + PAD];
  } else {
    // up: 160 px of scale, or 26 px a space where it has more than 6
    const space = Math.max(160 / total, 26), Y = (i) => PAD + 26 + (total - i) * space, bottom = Y(0);
    const left = PAD + Math.max(...marks.map((m) => textWidth(m, BIG)), textWidth(p.unit, BIG)) + 6;
    body += rect(left, Y(end), 120, bottom - Y(end), 'pic-part pic-shade pic-object');
    body += `<path d="M${r(left)} ${r(Y(total) - 12)}L${r(left)} ${r(bottom)}L${r(left + 120)} ${r(bottom)}L${r(left + 120)} ${r(Y(total) - 12)}" class="pic-line pic-jug"/>`;
    let major = '', minor = '';
    for (let i = 0; i <= total; i++) {
      // a small tick from 6 px outside the wall, so the one at the level is seen past the water's top edge
      if (i % parts) minor += `M${r(left - 6)} ${r(Y(i))}H${r(left + 9)}`;
      else major += `M${r(left)} ${r(Y(i))}H${r(left + 18)}`;
    }
    body += `<path d="${major}" class="pic-line pic-major"/><path d="${minor}" class="pic-line pic-minor"/>`;
    marks.forEach((m, k) => { body += text(left - 6, Y(k * parts) + 6.5, m, { anchor: 'end', cls: 'pic-tick' }); });
    body += text(left - 6, PAD + 10, p.unit, { anchor: 'end', cls: 'pic-unit' });
    [w, h] = [left + 120 + PAD, bottom + 6.5 + PAD];
  }
  // never where the object ends, the pointer points or the liquid comes to: the reading is hers to find
  const label = `${called} marked from ${marks[0]} to ${marks.at(-1)} ${unitWords(p.unit, marks.at(-1))}, with ${parts} equal spaces between the numbers`
    + (p.device === 'kitchen' ? ', the pointer between two of them'
      : up ? `, with ${name} in it` : `, and ${name} along it from ${decimalText(at[0] + (step * BigInt(start)) / BigInt(parts))}`);
  return svg('scale', w, h, body, `${label}.`, FRAC_STYLE + MEAS_STYLE);
}

// ---- shape: a rectangle, square, triangle, rhombus, L-shape, parallelogram, or a triangle by its base and height (ptri,
// its apex over the point o along the base's line), drawn to scale in its own units (x along the base from its left
// end, y up) inside 324 × 200 px, its outline's longer extent to its shorter at most 3 to 1 (past that drawn at 3 to 1,
// its labels the true lengths). Each side its own <path class="pic-line pic-strong">, each label a <text class="pic-side">
// beside the middle of its side, outside the shape; equal sides each marked by a short <path class="pic-line pic-equal">
// across its middle. The pieces: edge and rows unit squares (<rect class="pic-part pic-unit-square">, the rows shaded),
// only where the rectangle is drawn to its true shape (both sides 12 at most, 3 to 1 at most), else nothing is drawn;
// an L-shape's cut (<path class="pic-line pic-dash pic-cut">, each rectangle's "3 by 2" a <text class="pic-piece"> at
// its middle) and its missing corner (pic-corner); the height (pic-height) with its 10 px right-angle mark (<path
// class="pic-line pic-right-angle">) and its label (<text class="pic-height">); an obtuse triangle's base dashed on to
// under its apex (pic-extend); and, on a working picture only, the parallelogram's move (the cut, the triangle cut off
// <path class="pic-part pic-shade pic-move-from"> and where it goes, pic-move-to) and the triangle's double (pic-double).
// Every label is kept clear of every other and of every line (the height's may cross a side, where no place beside the
// height is clear), each side's label with no other side between it and its side, and a shape whose labels cannot all be
// kept clear inside 340 × 260 draws nothing. Chosen for this game, not a syllabus requirement: a shape drawn to scale at
// most 3 to 1, and every side of an L-shape labelled for its area, where NESA's picture is on a grid
// (plans/2026-10-25-stage-6-plan.md, "What is outside NESA in the measurement strand") ----

const SHAPE_SIDES = { rect: ['l', 'w'], square: ['s'], rhombus: ['s'], tri: ['a', 'b', 'c'], lshape: ['W', 'H', 'cw', 'ch'], para: ['b', 'h', 'o', 's'], ptri: ['b', 'h', 'o'] };

function shape(p) {
  const names = SHAPE_SIDES[p.kind], u = p.unit, given = p.sides && typeof p.sides === 'object' ? p.sides : {};
  const v = Object.fromEntries((names ?? []).map((k) => [k, counted(given[k])]));
  if (!names || UNITS[u]?.kind !== 'length' || names.some((k) => !(v[k] >= (k === 'o' ? 0 : 1))) || !['area', 'perimeter'].includes(p.labels)
    || (p.unknown != null && !(p.kind === 'rect' && ['l', 'w'].includes(p.unknown)))) return '';
  const len = (n) => `${show(n)} ${u}`, said = (n) => (n === '?' ? 'a box' : `${show(n)} ${u}`);
  const working = p.working === true, { l, w, W, H, cw, ch, b, h, o } = v;
  // the outline counter-clockwise from (0, 0); each label [side, text]; the sides marked equal; the pieces { cls, pts,
  // close? }, the unit squares [x, y, shaded] and the pieces' labels [text, [x0, y0, x1, y1] the piece], all in units
  let pts, labels, equal = [], words;
  const pieces = [], squares = [], named = [];
  if (p.kind === 'rect') {
    pts = [[0, 0], [l, 0], [l, w], [0, w]];
    labels = [[0, len(p.unknown === 'l' ? '?' : l)], [3, len(p.unknown === 'w' ? '?' : w)]];
    words = p.unknown === 'l' ? `A rectangle ${said(w)} wide, its length marked with a box`
      : p.unknown === 'w' ? `A rectangle ${said(l)} long, its width marked with a box` : `A rectangle ${said(l)} long and ${said(w)} wide`;
  } else if (p.kind === 'square' || p.kind === 'rhombus') {
    const s = v.s, t = p.kind === 'square' ? s : (s * Math.sqrt(3)) / 2, o2 = p.kind === 'square' ? 0 : s / 2;
    pts = [[0, 0], [s, 0], [s + o2, t], [o2, t]];
    labels = [[0, len(s)]];
    if (p.ticks) equal = [0, 1, 2, 3];
    words = `A ${p.kind} with sides of ${said(s)}${p.ticks ? ', its sides marked equal' : ''}`;
  } else if (p.kind === 'tri') {
    // the longest side the base (an isosceles triangle's base its odd side), the apex found from the other two
    const all = [v.a, v.b, v.c].sort((x, y) => y - x), kinds = new Set(all).size;
    if (all[0] >= all[1] + all[2]) return '';
    const odd = all.find((x) => all.indexOf(x) === all.lastIndexOf(x)), pair = all.find((x) => x !== odd);
    const [base, left, right] = kinds === 2 ? [odd, pair, pair] : all;
    const ax = (base * base + left * left - right * right) / (2 * base);
    pts = [[0, 0], [base, 0], [ax, Math.sqrt(left * left - ax * ax)]];
    labels = kinds === 3 ? [[0, len(base)], [1, len(right)], [2, len(left)]] : kinds === 2 ? [[0, len(base)], [2, len(left)]] : [[0, len(base)]];
    // a triangle with equal sides shows fewer labels than sides, so its equal sides must be marked to tell her the rest;
    // its words name only the sides labelled, never the ones she writes in herself (per-add)
    if (kinds < 3 && !p.ticks) return '';
    if (p.ticks) equal = kinds === 2 ? [1, 2] : kinds === 1 ? [0, 1, 2] : [];
    words = kinds === 3 ? `A triangle with sides of ${listWords([...all].reverse().map(said))}`
      : kinds === 2 ? `A triangle with one side of ${said(base)} and one of ${said(left)}, its two equal sides marked`
        : `A triangle with one side of ${said(base)}, its three sides marked equal`;
  } else if (p.kind === 'lshape') {
    if (cw >= W || ch >= H) return '';
    pts = [[0, 0], [W, 0], [W, H - ch], [W - cw, H - ch], [W - cw, H], [0, H]];
    labels = p.labels === 'area' ? [[0, len(W)], [1, len(H - ch)], [2, len(cw)], [3, len(ch)], [4, len(W - cw)], [5, len(H)]] : [[0, len(W)], [5, len(H)]];
    words = `An L-shape ${said(W)} wide and ${said(H)} high`;
    if (p.cut != null) {
      const across = p.cut === 'h';
      if (!across && p.cut !== 'v') return '';
      pieces.push({ cls: 'pic-line pic-dash pic-cut', pts: across ? [[0, H - ch], [W - cw, H - ch]] : [[W - cw, 0], [W - cw, H - ch]] });
      named.push(...(across ? [[`${W} by ${H - ch}`, [0, 0, W, H - ch]], [`${W - cw} by ${ch}`, [0, H - ch, W - cw, H]]]
        : [[`${W - cw} by ${H}`, [0, 0, W - cw, H]], [`${cw} by ${H - ch}`, [W - cw, 0, W, H - ch]]]));
      words += `, cut ${across ? 'across' : 'down'} into two rectangles, ${named[0][0]} and ${named[1][0]}`;
    }
    if (p.corner) {
      pieces.push({ cls: 'pic-line pic-dash pic-corner', pts: [[W - cw, H], [W, H], [W, H - ch]] });
      words += ', its missing corner drawn dashed to make the whole rectangle';
    }
  } else if (p.kind === 'para') {
    pts = [[0, 0], [b, 0], [b + o, h], [o, h]];
    labels = [[0, len(b)], ...(p.slant != null ? [[1, len(p.slant)]] : [])];
    words = `A parallelogram with a base of ${said(b)}`;
    if (p.move && working) {
      // the cut straight down from the top corner must land on the base: past its end (o > b) nothing is cut off it
      if (o > b) return '';
      pieces.push({ cls: 'pic-part pic-shade pic-move-from', pts: [[0, 0], [o, 0], [o, h]], close: true },
        { cls: 'pic-line pic-dash pic-cut', pts: [[o, h], [o, 0]] }, { cls: 'pic-line pic-dash pic-move-to', pts: [[b, 0], [b + o, 0], [b + o, h]], close: true });
    }
  } else {
    pts = [[0, 0], [b, 0], [o, h]];
    labels = [[0, len(b)]];
    words = `A triangle with a base of ${said(b)}`;
    if (o > b) pieces.push({ cls: 'pic-line pic-dash pic-extend', pts: [[b, 0], [o, 0]] });
    if (p.double && working) pieces.push({ cls: 'pic-line pic-dash pic-double', pts: [[b, 0], [b + o, h], [o, h]], close: true });
  }
  const tall = p.height != null && (p.kind === 'para' || p.kind === 'ptri');
  // M3's L-shapes, whose labels keep nearest their own sides (stage 6 step 4.5)
  const nearest = p.labels === 'area' && p.kind === 'lshape';
  if (tall) words += p.height === '?' ? ' and its height marked with a box' : ` and a height of ${said(p.height)}`;
  // the slanted side's words, taken out again where its label is left off a move picture
  const slanted = p.kind === 'para' && p.slant != null ? `, its slanted side ${said(p.slant)}` : '';
  words += slanted;
  if (pieces.some((q) => q.cls.includes('pic-move-to'))) words += ', the triangle at its left end cut off and moved to its right end, making a rectangle';
  if (pieces.some((q) => q.cls.includes('pic-double'))) words += ', and a copy of it turned round to make a parallelogram';
  // the unit squares: a rectangle drawn to its true shape only, every square one unit on each axis
  const rows = p.rows == null ? 0 : counted(p.rows);
  if (p.edge || p.rows != null) {
    if (p.kind !== 'rect' || l > 12 || w > 12 || Math.max(l, w) > 3 * Math.min(l, w) || !(rows >= 0 && rows <= w)) return '';
    if (p.edge) {
      for (let i = 0; i < l; i++) squares.push([i, 0, false]);
      for (let j = 1; j < w; j++) squares.push([0, j, false]);
      words += `, one row and one column of 1 ${u} squares along its edges`;
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < l; i++) squares.push([i, j, true]);
    if (rows) words += `, ${rows} ${rows === 1 ? 'row' : 'rows'} of 1 ${u} squares shaded`;
  }

  // drawn at kx px a unit across and kx / c up: c is 1 but where the shape is past 3 to 1
  const all = [...pts, ...pieces.flatMap((q) => q.pts)];
  const ew = Math.max(...all.map(([x]) => x)), eh = Math.max(...all.map(([, y]) => y));
  // the 3 to 1 limit measured on the shape's own outline, not with a step's pieces: a doubled triangle measured with its
  // copy was squeezed to another shape than the one in its question (stage 6 step 4.8, L4: an obtuse 16 by 9 drawn 25 px
  // a unit both ways on its question, 17.2 across by 23.9 up beside its copy), so the pair may now be wider than 3 to 1
  const ow = Math.max(...pts.map(([x]) => x)), oh = Math.max(...pts.map(([, y]) => y));
  const c = ow > 3 * oh ? (3 * oh) / ow : oh > 3 * ow ? oh / (3 * ow) : 1;
  const draw = (kx, dx, dy, under = false) => {
    const P = ([x, y]) => [dx + x * kx, dy + ((eh - y) * kx) / c];
    let body = '', box = [Infinity, Infinity, -Infinity, -Infinity];
    const grow = (x, y) => { box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)]; };
    const d = (list, close) => list.map((q, i) => { const [x, y] = P(q); grow(x, y); return `${i ? 'L' : 'M'}${r(x)} ${r(y)}`; }).join('') + (close ? 'Z' : '');
    const label = (x, y, str, anchor, cls, size = BIG) => {
      const tw = textWidth(str, size), a = anchor === 'middle' ? x - tw / 2 : anchor === 'end' ? x - tw : x;
      grow(a, y - 15);
      grow(a + tw, y + 4);
      body += text(x, y, str, { size, anchor, cls });
    };
    for (const [i, j, shaded] of squares) {
      const [x, y] = P([i, j + 1]);
      body += rect(x, y, kx, kx, shaded ? 'pic-part pic-shade pic-unit-square' : 'pic-part pic-unit-square');
    }
    for (const q of pieces.filter((x) => !x.cls.includes('pic-dash'))) body += `<path d="${d(q.pts, q.close)}" class="${q.cls}"/>`;
    pts.forEach((a, i) => { body += `<path d="${d([a, pts[(i + 1) % pts.length]])}" class="pic-line pic-strong"/>`; });
    for (const q of pieces.filter((x) => x.cls.includes('pic-dash'))) body += `<path d="${d(q.pts, q.close)}" class="${q.cls}"/>`;
    if (tall) {
      // the height, straight down from the top to the base's line, its right-angle mark on the base's side of its foot
      const foot = P([o, 0]), dir = o < b ? 1 : -1;
      body += `<path d="${d([[o, h], [o, 0]])}" class="pic-line pic-dash pic-height"/>`;
      body += `<path d="M${r(foot[0] + 10 * dir)} ${r(foot[1])}L${r(foot[0] + 10 * dir)} ${r(foot[1] - 10)}L${r(foot[0])} ${r(foot[1] - 10)}" class="pic-line pic-right-angle"/>`;
    }
    // each side's ends, middle, direction and outward normal, on screen (the outline goes clockwise there, y down)
    const side = (i) => {
      const A = P(pts[i]), B = P(pts[(i + 1) % pts.length]), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
      return { A, B, m: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], t: [(B[0] - A[0]) / L, (B[1] - A[1]) / L], n: [(A[1] - B[1]) / L, (B[0] - A[0]) / L] };
    };
    const sides = pts.map((_, i) => side(i));
    for (const i of equal) {
      const { m, n } = side(i);
      const ends = [[m[0] - 6 * n[0], m[1] - 6 * n[1]], [m[0] + 6 * n[0], m[1] + 6 * n[1]]];
      ends.forEach(([x, y]) => grow(x, y));
      body += `<path d="M${r(ends[0][0])} ${r(ends[0][1])}L${r(ends[1][0])} ${r(ends[1][1])}" class="pic-line pic-equal"/>`;
    }
    // every label off every other label and every line drawn (review finding 1: an L-shape's small notch put its floor's
    // and its wall's labels on each other): each label tries its places in turn and takes the first clear one; a label
    // with no clear place draws nothing. A side's label stays nearer its own side's middle than any other's, as the
    // oracle reads it; its first place is beside its middle, outside, then slid along, then inside
    const dashed = pieces.filter((q) => q.cls.includes('pic-dash')).flatMap((q) => q.pts.map((a, i) => [a, q.pts[(i + 1) % q.pts.length]])
      .slice(0, q.close ? q.pts.length : q.pts.length - 1).map(([a, z]) => ({ cls: q.cls, ln: [P(a), P(z)] })));
    const lines = [...sides.map((sd) => [sd.A, sd.B]), ...dashed.map((q) => q.ln)];
    // the step's own lines (the moved and the doubled triangle, stage 6 step 4.5), but where one runs along a side, and
    // not the base dashed on: the height's label may cross a side, never these
    const along = ([a, z], one = null) => (one ? [{ A: one[0], B: one[1] }] : sides).some(({ A, B }) => [[a, z], [z, a]].some(([u, w]) => Math.hypot(u[0] - A[0], u[1] - A[1]) < 0.5 && Math.hypot(w[0] - B[0], w[1] - B[1]) < 0.5));
    const stepLines = dashed.filter((q) => !q.cls.includes('pic-extend') && !along(q.ln)).map((q) => q.ln);
    // an L-shape's cut (a move picture's the dashed upright); a parallelogram's move picture, whose slanted side's label
    // may be left off (off)
    const cuts = dashed.filter((q) => q.cls.includes('pic-cut')).map((q) => q.ln), moving = pieces.some((q) => q.cls.includes('pic-move-to'));
    let off = false;
    const taken = [];
    const boxAt = ([x, y, anchor, size = BIG], str) => {
      const tw = textWidth(str, size), a = anchor === 'middle' ? x - tw / 2 : anchor === 'end' ? x - tw : x;
      return { l: a, r: a + tw, top: y - 15, bot: y + 4 };
    };
    // 2 px apart from another label; off every line, but the height's label (across) where no place beside the height is
    // off every line: then it is kept off labels and the step's own pieces only and may cross a side as before, a tall
    // narrow triangle leaving it no room beside the height
    const clear = (q, across) => !taken.some((z) => q.l < z.r + 4 && z.l < q.r + 4 && q.top < z.bot && z.top < q.bot)
      && !(across ? stepLines : lines).some((ln) => through(ln, q));
    const place = (str, cls, spots, ok, across = false) => {
      const spot = spots.find((sp) => { const q = boxAt(sp, str); return clear(q, across) && ok(q); });
      if (!spot) return false;
      taken.push(boxAt(spot, str));
      label(spot[0], spot[1], str, spot[2], cls, spot[3]);
      return true;
    };
    const SLIDE = [0, 10, -10, 20, -20, 30, -30, 40, -40];
    // on M3's L-shapes a side's label slides 2 px at a time, so a short side's label can go to the end of it away from
    // the side next to it and keep nearest its own (stage 6 step 4.5, the lead's ruling on G3's count)
    const FINE = Array.from({ length: 41 }, (_, j) => (j % 2 ? 1 : -1) * 2 * Math.ceil(j / 2));
    // two labels whose letters (13 px over the baseline to it) share a line, a word's width (16 px) apart across, so they
    // never read as one run ("12 by 2 8 cm", code review 4's finding 1; "1 m 3 m", the wall's label over the floor's end,
    // code review 5's finding 1): 17 px by these widths, a px over, as a flat 0.6 em a letter can put "2 by 1" 1.4 px wider
    // (WebKit: 18 px apart at 16). A side running up between them, across their letters, keeps them apart as plainly
    // ("4 by 2 | 2 cm", the lead's ruling on Y5's count). On M3's L-shapes: a piece's name from every side's label, and
    // a side's label from those placed before it
    const wall = (q, x) => { const lo = Math.min(q.r, x.r), hi = Math.max(q.l, x.l); return sides.some(({ A, B }) => A[0] === B[0] && A[0] >= lo && A[0] <= hi && Math.min(A[1], B[1]) <= Math.max(q.top, x.top) + 2 && Math.max(A[1], B[1]) >= Math.min(q.bot, x.bot) - 4); };
    const apart = (q, boxes) => boxes.every((x) => !(q.top + 2 < x.bot - 4 && x.top + 2 < q.bot - 4) || Math.max(q.l - x.r, x.l - q.r) >= 17 || wall(q, x));
    for (const [i, str] of labels) {
      const { m, n, t } = sides[i], spots = [];
      // a move picture's slanted side's label inside the parallelogram, so never in the moved triangle beyond that side
      // (stage 6 step 4.5, the second look's P3: its "10 cm" in the moved triangle, nearer the dashed upright than its own
      // side, read as the upright's length)
      for (const nn of under && i === 2 ? [[-n[0], -n[1]], n] : moving && i === 1 ? [[-n[0], -n[1]]] : [n, [-n[0], -n[1]]]) {
        // 8 px out, or further where a slanted side would cross its label's box
        for (const out of [8, 14, 20]) {
          for (const k of nearest ? FINE : SLIDE) {
            const q = [m[0] + k * t[0] + out * nn[0], m[1] + k * t[1] + out * nn[1]];
            spots.push(Math.abs(nn[0]) >= 0.5 ? [q[0], q[1] + 6.5, nn[0] > 0 ? 'start' : 'end'] : [q[0], nn[1] > 0 ? q[1] + 14 : q[1] - 1, 'middle']);
          }
        }
      }
      // read by its middle, 6.3 px over its baseline. On M3's L-shapes (labelled for their area), beside its own side
      // (stage 6 step 4.5, the lookers' finding A: a notch's label put above the dashed corner, past the dashed corner's
      // side, or 40 px from its side with another label between): its box across from 4 px or more of its side, no side,
      // dashed line or other label between its middle and its side, and no side or dashed line running the same way, across
      // from it too, nearer; and its letters (13 px over the baseline to it, as WebKit draws them at 18 px) across from 4 px
      // or more of its side, their middle within its side's ends (code review 2, finding 1: a wall's "1 cm" beside the
      // notch's open top, over the 3 cm gap, its box but not its letters across from the wall)
      const own = (q) => {
        const at = [(q.l + q.r) / 2, q.top + 8.7], far = sides.map((sd) => Math.hypot(sd.m[0] - at[0], sd.m[1] - at[1]));
        if (!far.every((f, j) => j === i || f > far[i])) return false;
        // a move picture's slanted side's letters 17 px or more from the dashed upright (code review 7, finding 1: 6 12 5 13
        // cm's "13 cm" 6 px from it, under the height's "12 cm", both read as the upright's)
        if (moving && i === 1 && cuts.some((ln) => gap(ln, { l: q.l, r: q.r, top: q.top + 2, bot: q.bot - 4 }) < 17)) return false;
        if (!nearest) return true;
        const { A, B } = sides[i], d = [B[0] - A[0], B[1] - A[1]], L2 = d[0] * d[0] + d[1] * d[1];
        const top = q.top + 2, bot = q.bot - 4, mid = [(q.l + q.r) / 2, (top + bot) / 2];
        // across from a line: the letters, seen along it, over that many px of it
        const across = ([u, w], px) => {
          const e = [w[0] - u[0], w[1] - u[1]], e2 = e[0] * e[0] + e[1] * e[1];
          const ts = [[q.l, top], [q.r, top], [q.l, bot], [q.r, bot]].map(([x, y]) => ((x - u[0]) * e[0] + (y - u[1]) * e[1]) / e2);
          return (Math.min(1, Math.max(...ts)) - Math.max(0, Math.min(...ts))) * Math.sqrt(e2) >= px;
        };
        const on = ((mid[0] - A[0]) * d[0] + (mid[1] - A[1]) * d[1]) / L2;
        if (on < 0 || on > 1 || !across([A, B], 4)) return false;
        // an up-and-down side's letters wholly within its ends (code review 3, finding 1: a wall one unit high had its
        // label's letters pushed 3 to 4 px over the top line, beside the notch's open top, the floor's label under it).
        // With these ends, the letters always face 4 px or more of their side, so the 4 px check above draws no picture
        // differently (code review 3, finding 2); measured on the letters, the same-way check does, on a cut down only
        if (A[0] === B[0] && (top < Math.min(A[1], B[1]) || bot > Math.max(A[1], B[1]))) return false;
        // its letters 6 px or more from every other side and from the cut (the second look's P1 and P2: a notch floor's
        // "1 m" under the floor, its "m" on the right side; over it, 3 px from the wall, "|1 m"); and never level with the
        // cut's end (NESA's left "4 cm" in line with the cut, read as its label): within 21 px across of either end, as far
        // as a side's label stands off its own side (20 px out, its baseline a px more), the cut's line carried on passing
        // 6 px or more over or under its letters, as clear as a line drawn
        const letters = { l: q.l, r: q.r, top, bot };
        // and from the dashed corner's lines (code review 7, finding 3: a wall's "2 cm" tucked 2 px under the dashed top)
        const corner = dashed.filter((z) => z.cls.includes('pic-corner')).map((z) => z.ln);
        if ([...sides.filter((_, j) => j !== i).map((sd) => [sd.A, sd.B]), ...cuts, ...corner].some((ln) => gap(ln, letters) < 6)) return false;
        if (cuts.some((ln) => ln.some(([x, y]) => y > top - 6 && y < bot + 6 && Math.max(q.l - x, x - q.r, 0) <= 21))) return false;
        const foot = footOf([A, B], at), mine = Math.hypot(foot[0] - at[0], foot[1] - at[1]);
        const others = lines.filter((ln, j) => j !== i && !along(ln, [A, B]));
        const sameWay = ([u, w]) => { const e = [w[0] - u[0], w[1] - u[1]]; return Math.abs(e[0] * d[0] + e[1] * d[1]) >= 0.87 * Math.sqrt(L2 * (e[0] * e[0] + e[1] * e[1])) && across([u, w], 1); };
        return !others.some((ln) => meets([at, foot], ln)) && !taken.some((z) => through([at, foot], z))
          && others.filter(sameWay).every((ln) => { const f = footOf(ln, at); return Math.hypot(f[0] - at[0], f[1] - at[1]) > mine + 1; });
      };
      if (!place(str, 'pic-side', spots, (q) => own(q) && (!nearest || apart(q, taken)))) {
        // with no such place, left off that working picture, and its words with it (the oracle's reading: the slanted
        // side's label is not needed on a working picture; the lead's ruling c)
        if (moving && i === 1) { off = true; continue; }
        return null;
      }
    }
    const sideBoxes = taken.slice();
    for (const [str, [ux0, uy0, ux1, uy1]] of named) {
      // at its piece's middle, or moved within the piece; at 16 px where 18 px does not fit
      const [a, z] = [P([ux0, uy1]), P([ux1, uy0])], mid = [(a[0] + z[0]) / 2, (a[1] + z[1]) / 2];
      const spots = [BIG, SMALL].flatMap((size) => SLIDE.flatMap((ky) => SLIDE.map((kx2) => [mid[0] + kx2, mid[1] + 6.5 + ky, 'middle', size]))
        .sort((s1, s2) => Math.hypot(s1[0] - mid[0], s1[1] - mid[1] - 6.5) - Math.hypot(s2[0] - mid[0], s2[1] - mid[1] - 6.5)));
      // wholly inside it, its letters (14 px over the baseline to 4 under) 1.5 px clear of its lines' middles (stage 6 step
      // 4.5, the lookers' finding B: "6 by 1" in a piece 23 px high had its descender across the cut)
      const inside = (q) => q.l > a[0] + 1.5 && q.r < z[0] - 1.5 && q.top + 1 > a[1] + 1.5 && q.bot < z[1] - 1.5;
      // and apart from every side's label, as the side labels are from each other; and never on one line with a side's
      // label on the cut's line, across from the cut within 21 px of it (the second look's P2: "6 by 1  1 m"); a cut
      // across only (code review 7, finding 4)
      const onCut = (x) => cuts.filter(([[, a], [, z]]) => a === z).some(([[x1, y1], [x2]]) => x.l < Math.max(x1, x2) && x.r > Math.min(x1, x2) && Math.max(x.top + 2 - y1, y1 - x.bot + 4) <= 21);
      if (!place(str, 'pic-piece', spots, (q) => inside(q) && apart(q, sideBoxes) && !sideBoxes.some((x) => onCut(x) && q.top + 2 < x.bot - 4 && x.top + 2 < q.bot - 4))) return null;
    }
    if (tall) {
      const top = P([o, h]), foot = P([o, 0]), y = (top[1] + foot[1]) / 2 + 6.5;
      const spots = SLIDE.flatMap((k) => [[foot[0] + 6, y + k, 'start'], [foot[0] - 6, y + k, 'end']]);
      // in a move picture apart from the slanted side's label (code review 7, finding 2: "12 cm 15 cm", 15.4 px apart)
      if (!place(len(p.height), 'pic-height', spots, (q) => !moving || apart(q, taken)) && !place(len(p.height), 'pic-height', spots, () => true, true)) return null;
    }
    return { body, box, off };
  };
  // as large as fits 324 × 200, and with its labels 340 × 260; kx in tenths of a px, so every corner at a whole number of
  // units lands exactly where it should. A perimeter question's shape, docked, with its labels 160 tall at most: at its
  // full 242 to 248 the steps of the longest question in metres, or of a refusal, went under it at 390 × 844 (stage 6
  // step 4.3, fact 3's first branch, pt78); its labels 18 px as before
  const most = p.labels === 'perimeter' && !working ? 160 : 260;
  // on M3's L-shapes, where no place keeps every label by its own side, the notch's floor's label tried under the floor
  // first, so the wall's label can stand in the notch (code review 3, finding 1: a cut's small top strip left no room for
  // its "2 by 1" once the wall's label stood inside)
  const drawn = (kx, dx, dy) => draw(kx, dx, dy) ?? (nearest ? draw(kx, dx, dy, true) : null);
  let kx = Math.min(324 / ew, (200 * c) / eh), out;
  for (let pass = 0; pass < 6; pass++) {
    kx = Math.floor(kx * 10) / 10;
    if (!(kx > 0)) return '';
    out = drawn(kx, 0, 0);
    if (!out) return '';
    const [x0, y0, x1, y1] = out.box, dw = ew * kx, dh = (eh * kx) / c;
    const f = Math.min((PHONE - 2 * PAD - (x1 - x0 - dw)) / dw, (most - 2 * PAD - (y1 - y0 - dh)) / dh);
    if (f >= 1) break;
    kx *= f;
  }
  const [x0, y0, x1, y1] = out.box;
  // nothing drawn where its labels cannot all be kept clear inside 340 × 260 (or 160)
  const last = drawn(kx, Math.round((PAD - x0) * 10) / 10, Math.round((PAD - y0) * 10) / 10);
  if (!last || x1 - x0 + 2 * PAD > PHONE + 0.5 || y1 - y0 + 2 * PAD > most + 0.5) return '';
  // a moved triangle's shade with no outline of its own, so the dashed cut and height drawn over its edge show dashed
  // (stage 6 step 4.5, the lookers' finding C); outside :where(), as an inline SVG's styles are the whole page's and
  // another picture's pic-part rule after it would give the outline back; every other shape's style as before
  const moved = pieces.some((q) => q.cls.includes('pic-move-from')) ? '<style>.pic .pic-part.pic-move-from{stroke:none}</style>' : '';
  return svg('shape', x1 - x0 + 2 * PAD, y1 - y0 + 2 * PAD, last.body, `${last.off ? words.replace(slanted, '') : words}.`, FRAC_STYLE + MEAS_STYLE + moved);
}

// ---- prism: a rectangular prism in oblique view, its depth drawn at half size 45° up and right, its edge s px the largest
// that fits 337 × 260 and at most 40 (337: one wider is shown 300 px wide in the page's column, and its 18 px labels are
// still 16 px there; shown instead at its full width, as a scale is, a gift box 10 by 10 by 12 cm was 260 px tall under its
// question's three lines and pushed her step under the dock, WebKit at 390 × 844, stage 6 step 4.6, pt85); a labelled one
// at most 250 tall (drawn 260 under its question's three lines, a gift box 7 by 12 by 11 cm had its first step of two
// lines 10 px under the dock, WebKit at 390 × 844, pt86). cubes (l 2 to
// 6, w 2 to 4, h 2 to 5, else nothing is drawn): every face she sees, the front ones <rect class="pic-cube pic-front">
// (l × h), the top ones <path class="pic-cube pic-top"> (l × w) and the right ones <path class="pic-cube pic-right">
// (w × h), so they can be counted. With no cubes, the box and its three
// edges labelled (<text class="pic-edge">, "6 cm"; labels: { l, w, h } a label in place of a length, '?' a box). layer
// shades the top layer (<path class="pic-part pic-shade pic-layer">), front the front face (<rect class="pic-part
// pic-shade pic-face">) ----

function prism(p) {
  const l = counted(p.l), w = counted(p.w), h = counted(p.h), cubes = p.cubes === true, u = p.unit;
  if (!(l >= 1 && w >= 1 && h >= 1)) return '';
  if (cubes ? !(l >= 2 && l <= 6 && w >= 2 && w <= 4 && h >= 2 && h <= 5) : UNITS[u]?.kind !== 'length') return '';
  const given = p.labels && typeof p.labels === 'object' ? p.labels : {};
  const edge = { l: given.l ?? l, w: given.w ?? w, h: given.h ?? h };
  const lab = (k) => `${show(edge[k])} ${u}`, say = (k) => (edge[k] === '?' ? 'a box' : `${show(edge[k])} ${u}`);
  const left = cubes ? 0 : textWidth(lab('h'), BIG) + 8, right = cubes ? 0 : textWidth(lab('w'), BIG) + 8, under = cubes ? 0 : 26;
  const D = Math.SQRT1_2 / 2; // a unit of depth, in edges across and up
  const most = Math.floor((300 * BIG) / SMALL);
  const tall = cubes ? 260 : 250;
  const s = Math.floor(Math.min(40, (most - 2 * PAD - left - right) / (l + w * D), (tall - 2 * PAD - under) / (h + w * D)) * 10) / 10;
  const e = s * D, x0 = PAD + left, top = PAD + w * e, xr = x0 + l * s, bottom = top + h * s;
  const poly = (list) => `M${list.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}Z`;
  let body = '';
  if (cubes) {
    for (let j = 0; j < h; j++) for (let i = 0; i < l; i++) body += rect(x0 + i * s, top + j * s, s, s, 'pic-cube pic-front');
    for (let k = 0; k < w; k++) {
      for (let i = 0; i < l; i++) {
        const [xa, ya] = [x0 + i * s + k * e, top - k * e];
        body += `<path d="${poly([[xa, ya], [xa + s, ya], [xa + s + e, ya - e], [xa + e, ya - e]])}" class="pic-cube pic-top"/>`;
      }
      for (let j = 0; j < h; j++) {
        const [xa, ya] = [xr + k * e, top + j * s - k * e];
        body += `<path d="${poly([[xa, ya], [xa + e, ya - e], [xa + e, ya - e + s], [xa, ya + s]])}" class="pic-cube pic-right"/>`;
      }
    }
  } else {
    body += rect(x0, top, l * s, h * s, 'pic-line');
    body += `<path d="${poly([[x0, top], [xr, top], [xr + w * e, top - w * e], [x0 + w * e, top - w * e]])}" class="pic-line pic-soft"/>`;
    body += `<path d="${poly([[xr, top], [xr + w * e, top - w * e], [xr + w * e, bottom - w * e], [xr, bottom]])}" class="pic-line pic-soft"/>`;
    body += text(x0 + (l * s) / 2, bottom + 22, lab('l'), { cls: 'pic-edge' });
    body += text(x0 - 8, top + (h * s) / 2 + 6.5, lab('h'), { anchor: 'end', cls: 'pic-edge' });
    body += text(xr + (w * e) / 2 + 8, bottom - (w * e) / 2 + 10, lab('w'), { anchor: 'start', cls: 'pic-edge' });
  }
  if (p.front) body += rect(x0, top, l * s, h * s, 'pic-part pic-shade pic-face');
  if (p.layer) body += `<path d="${poly([[x0, top + s], [x0, top], [x0 + w * e, top - w * e], [xr + w * e, top - w * e], [xr + w * e, top + s - w * e], [xr, top + s]])}" class="pic-part pic-shade pic-layer"/>`;
  // the counts the picture shows, or the lengths its labels give; never the volume
  let label = cubes ? `A rectangular prism made of cubes, ${l} cubes long, ${w} wide and ${h} high`
    : `A rectangular prism ${say('l')} long, ${say('w')} wide and ${say('h')} high`;
  if (p.layer) label += ', its top layer shaded';
  if (p.front) label += ', its front face shaded';
  return svg('prism', xr + w * e + right + PAD, bottom + under + PAD, body, `${label}.`, FRAC_STYLE + MEAS_STYLE);
}

// ---- the angle and the grid (stage 6 strand 4b, plans/2026-10-25-stage-6-plan.md "### The pictures"): each fits 340 × 260
// with every label at 18 px, says itself in words that never give what she works out (the box's angle, a point's numbers),
// and carries the classes tests/oracle/geometry.mjs reads it by. A picture that would do a step (shade, guide) is marked
// working: true by its generator ----

// a label's letters as text() draws it, anchored by its middle at x 0 on its baseline: a word's letters 13 px over the
// baseline to it at 18 px and textWidth's width, as shape() measures a label's letters (strand 4's rule A: letters, never
// boxes); a box its own rect
function inkOf(str, size = BIG) {
  const { out, w } = pieces(str, size);
  let l = Infinity, rr = -Infinity, top = (-13 * size) / BIG, bot = 0;
  for (const q of out) {
    l = Math.min(l, q.at);
    rr = Math.max(rr, q.at + (q.box ? BOX * size : q.w));
    if (q.box) [top, bot] = [Math.min(top, -0.84 * size), Math.max(bot, 0.18 * size)];
  }
  return { l: l - w / 2, r: rr - w / 2, top, bot };
}
const apartBy = (a, b) => Math.max(a.l - b.r, b.l - a.r, a.top - b.bot, b.top - a.bot);
const COUNTED = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const countWord = (n) => COUNTED[n] ?? fmt(n);

// ---- angle: a right angle (whole 90), a straight line (180) or arms all round a point (360), cut into its parts, adjacent
// angles anticlockwise from the first arm, which points turn degrees anticlockwise from right (a multiple of 30); each
// part drawn to its size, so every arm's direction from the first arm is the sum of the labels before it. The vertex in
// the middle of the picture, every arm a <path class="pic-line pic-strong pic-arm"> from it, the longest from 80 to 120 px
// that keeps every arm and every label inside 340 × 260; on a straight line the first and last arms one <path
// class="pic-line pic-strong pic-straight">, from the first arm's end through the vertex to the last's; on a right angle a
// 12 px square at the vertex between the first and last arms (<path class="pic-line pic-right">). Each part's arc a <path
// class="pic-line pic-arc"> round the vertex at 26 px, the next part's at 34 (so two side by side never meet; all round a
// point with an odd number of parts, the last at 18, as it is beside the first), the box's angle's <path class="pic-line
// pic-arc pic-accent">, in the box's colour, so it is plain apart from the known ones where the arcs run together (the
// lookers of step 4b.2: a line's two arcs read as one stepped semicircle, a point's as one circle); and its label, "120°",
// or "☐°" for the box, its own <g class="pic-angle-label"> (text() writes a box and its "°" as two elements, so the group
// joins them), on the part's middle line at the smallest whole px from the vertex, 44 or more, where its letters are 4 px
// or more from every arm and every other label's letters, and 38 px or more from the vertex, off every arc (the arcs' own
// rule, chosen for this game). A part whose label has no such place within its arms' length draws nothing. shade (a working
// picture only): that part shaded to its arc (<path class="pic-part pic-shade">). Chosen for this game, not a syllabus
// requirement: every angle drawn turned in thirties, with arcs and labels, where NESA's pictures (S3 GM B l.107-123, the
// saved copy of stage-3/fae314fde1, NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 30 October
// 2026) carry none (plans/2026-10-25-stage-6-plan.md, "What is outside NESA in this strand") ----

const ANGLE_WHOLES = { 90: 'right', 180: 'line', 360: 'point' };

function angle(p) {
  const asked = counted(p.whole), whole = ANGLE_WHOLES[asked] ? asked : 0, parts = Array.isArray(p.parts) ? p.parts : [];
  const known = parts.map((x) => (x === '?' ? null : counted(x))), n = parts.length;
  const unknown = whole - sum(known.filter((x) => x !== null)), turn = p.turn == null ? 0 : counted(p.turn);
  const shade = p.shade == null ? null : counted(p.shade);
  if (!whole || n < 2 || known.filter((x) => x === null).length !== 1 || known.some((x) => x !== null && !(x >= 1)) || !(unknown >= 1)
    || !(turn >= 0 && turn <= 330 && turn % 30 === 0) || (shade !== null && !(shade >= 0 && shade < n))) return '';
  const sizes = known.map((x) => x ?? unknown), at = [turn];
  for (const a of sizes) at.push(at.at(-1) + a);
  // a direction on the screen (y down), in degrees anticlockwise from pointing right
  const unit = (a) => [Math.cos((a * Math.PI) / 180), -Math.sin((a * Math.PI) / 180)];
  const radius = sizes.map((_, i) => (whole === 360 && n % 2 && i === n - 1 ? 18 : i % 2 ? 34 : 26));
  const strs = known.map((x) => (x === null ? '☐°' : `${x}°`)), inks = strs.map((str) => inkOf(str));
  // every arm k (0 to n, the last the first again all round a point) at L px; each label's letters' middle, placed
  const place = (L) => {
    const arm = at.map((a) => { const [x, y] = unit(a); return [[0, 0], [x * L, y * L]]; });
    const boxes = [];
    for (let i = 0; i < n; i++) {
      const [ux, uy] = unit(at[i] + sizes[i] / 2), ink = inks[i], hx = (ink.r - ink.l) / 2, hy = (ink.bot - ink.top) / 2;
      // its own two arms first, then the others; 4.2 px, so it is 4 px or more once every position is written to 0.1 px
      // (the step's code review, finding 2: the vertex, an arm's end and a box's x and width each rounded; at 4.1 one of
      // B1's angles came to 3.997)
      const lines = [arm[i], arm[i + 1], ...arm.filter((_, k) => k !== i && k !== i + 1)];
      let box = null;
      for (let d = 44; d <= L && !box; d++) {
        const q = { l: d * ux - hx, r: d * ux + hx, top: d * uy - hy, bot: d * uy + hy };
        if (Math.hypot(Math.max(q.l, 0, -q.r), Math.max(q.top, 0, -q.bot)) >= 38 && lines.every((ln) => gap(ln, q) >= 4.2)
          && boxes.every((b) => apartBy(q, b) >= 4.2)) box = q;
      }
      if (!box) return null;
      boxes.push(box);
    }
    return { arm, boxes };
  };
  // the longest arms from 120 to 80 px that keep it all inside 340 × 260; a label with no place at 120 has none shorter
  let laid = null, ext;
  for (let L = 120; L >= 80; L--) {
    laid = place(L);
    if (!laid) return '';
    const xs = [0], ys = [0];
    for (const [, [x, y]] of laid.arm) { xs.push(x); ys.push(y); }
    for (const b of laid.boxes) { xs.push(b.l, b.r); ys.push(b.top, b.bot); }
    // each arc's ends and its furthest points across and up
    sizes.forEach((a, i) => {
      for (const t of [at[i], at[i + 1], ...[90, 180, 270, 360, 450, 540, 630, 720].filter((q) => q > at[i] && q < at[i + 1])]) {
        const [x, y] = unit(t);
        xs.push(x * radius[i]);
        ys.push(y * radius[i]);
      }
    });
    ext = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    if (ext[2] - ext[0] <= PHONE - 2 * PAD && ext[3] - ext[1] <= 260 - 2 * PAD) break;
    if (L === 80) return '';
  }
  const [vx, vy] = [PAD - ext[0], PAD - ext[1]], P = ([x, y]) => `${r(vx + x)} ${r(vy + y)}`;
  const toward = (a, d) => { const [x, y] = unit(a); return [x * d, y * d]; };
  const arc = (i, R) => `M${P(toward(at[i], R))}A${R} ${R} 0 ${sizes[i] > 180 ? 1 : 0} 0 ${P(toward(at[i + 1], R))}`;
  let body = '';
  if (shade !== null) body += `<path d="M${P([0, 0])}L${arc(shade, radius[shade]).slice(1)}Z" class="pic-part pic-shade"/>`;
  const { arm, boxes } = laid;
  if (whole === 180) body += `<path d="M${P(arm[0][1])}L${P([0, 0])}L${P(arm[n][1])}" class="pic-line pic-strong pic-straight"/>`;
  arm.forEach(([, end], k) => {
    if ((whole === 180 && (k === 0 || k === n)) || (whole === 360 && k === n)) return;
    body += `<path d="M${P([0, 0])}L${P(end)}" class="pic-line pic-strong pic-arm"/>`;
  });
  if (whole === 90) {
    const [a, b] = [toward(at[0], 12), toward(at[n], 12)];
    body += `<path d="M${P(a)}L${P([a[0] + b[0], a[1] + b[1]])}L${P(b)}" class="pic-line pic-right"/>`;
  }
  sizes.forEach((_, i) => { body += `<path d="${arc(i, radius[i])}" class="pic-line pic-arc${known[i] === null ? ' pic-accent' : ''}"/>`; });
  boxes.forEach((b, i) => {
    // the anchor that puts the letters' middle where it was placed
    const ink = inks[i], x = vx + (b.l + b.r) / 2 - (ink.l + ink.r) / 2, y = vy + (b.top + b.bot) / 2 - (ink.top + ink.bot) / 2;
    body += `<g class="pic-angle-label">${text(x, y, strs[i], { cls: 'pic-angle' })}</g>`;
  });
  // the given angles in order, then the box's; never the box's size
  const deg = (x) => `${x} ${x === 1 ? 'degree' : 'degrees'}`, given = known.filter((x) => x !== null).map(deg);
  const marked = n === 2 ? `one marked ${given[0]}, and one marked with a box` : `${given.join(', ')}, and one marked with a box`;
  const label = whole === 90 ? `A right angle cut into ${countWord(n)} angles: ${marked}`
    : whole === 180 ? `A straight line with ${n === 2 ? 'an arm' : `${countWord(n - 1)} arms`} from a point on it, making ${countWord(n)} angles: ${marked}`
      : `Arms all round a point, making ${countWord(n)} angles: ${marked}`;
  return svg('angle', ext[2] - ext[0] + 2 * PAD, ext[3] - ext[1] + 2 * PAD, body, `${label}${shade !== null ? ', one of them shaded' : ''}.`, shade !== null ? FRAC_STYLE : '');
}

// ---- plane: a grid of the first quadrant, as NESA's picture of it (S3 GM A l.37-39, the saved copy of stage-3/fa35c41b81,
// NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 30 October 2026): across 4 to 8 and up 3 to 6,
// the two axes <path class="pic-line pic-strong pic-axis"> from the origin, each its line then its arrowhead, named "x-axis"
// under its right end and "y-axis" right of its top (<text class="pic-label pic-axis-name">); a dotted line at every whole
// number (<path class="pic-line pic-thin pic-grid">, dotted by PLANE_STYLE); the lines numbered, not the spaces (S3 GM A
// l.29): 0 to across under the x-axis (<text class="pic-label pic-tick pic-x">), 1 to up left of the y-axis (pic-tick
// pic-y), 0 once, at the origin; the space between lines the same both ways, the largest whole px from 30 to 40 that fits.
// Each point a <circle class="pic-dot pic-point"> of 6 px on its crossing, its name (<text class="pic-label pic-name">) on
// the first side of it in SIDES' order whose letters are 4 px or more from every line but its own two grid lines, every
// other name and label and every other point, and whose middle is no more than NEAR times as far from its own dot as from
// any other (else the clear side nearest that; none clear, nothing is drawn): up and right of it where that is clear (the
// lookers' finding 1, step 4b.3). guide (a working picture only): dashed lines from that point straight down to the
// x-axis and straight left to the y-axis, one <path class="pic-line pic-accent pic-dash pic-guide">, each leg from the point
// (a point on an axis has the one leg it needs). Every dot 4 px or more from every tick label and axis name (a point on an
// axis beside its own number, the step's code review, finding 3): the y ticks 10 px left of the axis, the x ticks' baseline
// 23 px under it. Chosen for this game, not a syllabus requirement: a grid of 4 to 8 by 3 to 6, 30 to 40 px a space, each
// name on a clear side of its point, nearer it than any other (plans/2026-10-25-stage-6-plan.md line 2169, "The pictures",
// as the lookers' finding 1 of step 4b.3 ruled it, pt100, 31 October 2026) ----

// the plane's own rule, in its SVG alone, so every older picture is drawn as before (the 100 grid's <svg> is pic-grid too,
// never inside a .pic)
const PLANE_STYLE = '<style>:where(.pic .pic-grid){stroke-dasharray:2 4}</style>';
// the sides of its dot a point's name may take, in the order tried: [x, y of its anchor from the dot, the anchor]; up and
// right first, then the other three corners (the letters' corner 7 px across and up from the dot's middle), then each
// corner slid along the dot's line across and then its line up (the letters 4 px from the dot and 4 px over, under or
// beside its middle: a point on an axis with a dot on the next line in has only that space), then right, left, up and
// down (the letters 4 px from the dot); a name's middle no more than NEAR times as far from its own dot as from any other
// (the lookers' finding 1, step 4b.3: up and right of a dot one line under another, a name sat nearer the other)
const SIDES = [[7, -7, 'start'], [-7, -7, 'end'], [7, 20, 'start'], [-7, 20, 'end'],
  [9.2, -4, 'start'], [-9.2, -4, 'end'], [9.2, 17, 'start'], [-9.2, 17, 'end'], [4, -9.2, 'start'], [-4, -9.2, 'end'], [4, 22.2, 'start'], [-4, 22.2, 'end'],
  [10, 6.5, 'start'], [-10, 6.5, 'end'], [0, -10, 'middle'], [0, 23, 'middle']];
const NEAR = 0.6;

function plane(p) {
  const across = counted(p.across), up = counted(p.up);
  const pts = (Array.isArray(p.points) ? p.points : []).map((q) => ({ x: counted(q?.x), y: counted(q?.y), name: typeof q?.name === 'string' ? q.name.trim() : '' }));
  const g = p.guide == null ? null : pts.find((q) => q.name === p.guide);
  if (!(across >= 4 && across <= 8 && up >= 3 && up <= 6) || (p.points != null && !Array.isArray(p.points))
    || pts.some((q) => !(q.x >= 0 && q.x <= across && q.y >= 0 && q.y <= up) || !q.name)
    || new Set(pts.map((q) => `${q.x} ${q.y}`)).size < pts.length || new Set(pts.map((q) => q.name)).size < pts.length
    || (p.guide != null && (!g || (!g.x && !g.y)))) return '';
  // room left of the y-axis for its ticks (10 px from it, so a dot on it is 4 px from its number); past the last line up,
  // the last tick's half, 4 px and "x-axis", then 4 px to the edge (not PAD: an 8 by 6 grid has 30 px a space only so);
  // over the top line "y-axis" (41, its letters, a 'y' with them, 4 px or more over a top point's name), and under the
  // x-axis its ticks (23, their letters 4 px under a dot on it)
  const left = Math.max(...Array.from({ length: up }, (_, j) => textWidth(String(j + 1), BIG))) + 10;
  const past = textWidth(String(across), BIG) / 2 + 4 + textWidth('x-axis', BIG);
  const s = Math.floor(Math.min(40, (PHONE - PAD - 4 - left - past) / across, (260 - 2 * PAD - 41 - 23) / up));
  if (s < 30) return '';
  const ox = PAD + left, oy = PAD + 41 + up * s, X = (i) => ox + i * s, Y = (j) => oy - j * s;
  const xEnd = X(across) + past, yEnd = Y(up) - 34.5;
  const lines = [], labels = [];
  const draw = (cls, list) => list.map(([a, b]) => `<path d="M${r(a[0])} ${r(a[1])}L${r(b[0])} ${r(b[1])}" class="${cls}"/>`).join('');
  let body = '';
  // the grid lines, each with the number of its line: [line, across or up, its number]
  const grid = [...Array.from({ length: across }, (_, i) => [[[X(i + 1), oy], [X(i + 1), Y(up)]], 'x', i + 1]),
    ...Array.from({ length: up }, (_, j) => [[[ox, Y(j + 1)], [X(across), Y(j + 1)]], 'y', j + 1])];
  body += draw('pic-line pic-thin pic-grid', grid.map(([ln]) => ln));
  lines.push(...grid);
  if (g) {
    const B = [X(g.x), Y(g.y)], legs = [...(g.y ? [[[B, [B[0], oy]]]] : []), ...(g.x ? [[[B, [ox, B[1]]]]] : [])];
    body += `<path d="${legs.map(([[a, b]]) => `M${r(a[0])} ${r(a[1])}L${r(b[0])} ${r(b[1])}`).join('')}" class="pic-line pic-accent pic-dash pic-guide"/>`;
    lines.push(...legs);
  }
  body += `<path d="M${r(ox)} ${r(oy)}L${r(xEnd)} ${r(oy)}M${r(xEnd - 8)} ${r(oy - 5)}L${r(xEnd)} ${r(oy)}L${r(xEnd - 8)} ${r(oy + 5)}" class="pic-line pic-strong pic-axis"/>`;
  body += `<path d="M${r(ox)} ${r(oy)}L${r(ox)} ${r(yEnd)}M${r(ox - 5)} ${r(yEnd + 8)}L${r(ox)} ${r(yEnd)}L${r(ox + 5)} ${r(yEnd + 8)}" class="pic-line pic-strong pic-axis"/>`;
  lines.push([[[ox, oy], [xEnd, oy]]], [[[xEnd - 8, oy - 5], [xEnd, oy]]], [[[xEnd - 8, oy + 5], [xEnd, oy]]],
    [[[ox, oy], [ox, yEnd]]], [[[ox - 5, yEnd + 8], [ox, yEnd]]], [[[ox + 5, yEnd + 8], [ox, yEnd]]]);
  // a label as text() draws it, its letters noted
  const label = (x, y, str, anchor, cls) => {
    const ink = inkOf(str), w = textWidth(str, BIG), dx = anchor === 'start' ? w / 2 : anchor === 'end' ? -w / 2 : 0;
    labels.push({ l: x + dx + ink.l, r: x + dx + ink.r, top: y + ink.top, bot: y + ink.bot });
    return text(x, y, str, { anchor, cls });
  };
  for (let i = 0; i <= across; i++) body += label(X(i), oy + 23, String(i), 'middle', 'pic-tick pic-x');
  for (let j = 1; j <= up; j++) body += label(ox - 10, Y(j) + 6.5, String(j), 'end', 'pic-tick pic-y');
  body += label(xEnd, oy + 23, 'x-axis', 'end', 'pic-axis-name') + label(ox + 8, yEnd + 6.5, 'y-axis', 'start', 'pic-axis-name');
  const dots = pts.map((q) => ({ l: X(q.x) - 6, r: X(q.x) + 6, top: Y(q.y) - 6, bot: Y(q.y) + 6 }));
  // every dot clear of the ticks and the axis names (a hair under 4 for a float's last bit)
  if (dots.some((d) => labels.some((o) => apartBy(d, o) < 4 - 1e-9))) return '';
  // each name on the first side of its dot, in SIDES' order, where its letters are clear (4 px or more from every line
  // but its own two grid lines, from every other name and label and every other dot) and its middle no more than NEAR
  // times as far from its own dot as from the nearest other; else the clear side nearest that
  let named = '';
  for (const [i, q] of pts.entries()) {
    const P = [X(q.x), Y(q.y)];
    const sides = SIDES.map(([dx, dy, anchor]) => {
      const x = P[0] + dx, y = P[1] + dy, ink = inkOf(q.name), w = textWidth(q.name, BIG), m = anchor === 'start' ? w / 2 : anchor === 'end' ? -w / 2 : 0;
      const b = { l: x + m + ink.l, r: x + m + ink.r, top: y + ink.top, bot: y + ink.bot }, c = [(b.l + b.r) / 2, (b.top + b.bot) / 2];
      const far = Math.min(...pts.filter((_, j) => j !== i).map((o) => Math.hypot(X(o.x) - c[0], Y(o.y) - c[1])));
      const clear = labels.every((o) => apartBy(b, o) >= 4 - 1e-9) && dots.every((d, j) => j === i || apartBy(b, d) >= 4 - 1e-9) && lines.every(([ln, way, at]) => (way === 'x' && at === q.x) || (way === 'y' && at === q.y) || gap(ln, b) >= 4 - 1e-9);
      return { x, y, anchor, clear, part: Math.hypot(c[0] - P[0], c[1] - P[1]) / far };
    }).filter((sd) => sd.clear);
    if (!sides.length) return '';
    const sd = sides.find((o) => o.part <= NEAR) ?? sides.reduce((a, o) => (o.part < a.part ? o : a));
    named += label(sd.x, sd.y, q.name, sd.anchor, 'pic-name');
  }
  body += pts.map((q) => circle(X(q.x), Y(q.y), 6, 'pic-dot pic-point')).join('') + named;
  const names = pts.map((q) => q.name);
  const words = `A grid with an x-axis from 0 to ${across} and a y-axis from 0 to ${up}`
    + (names.length ? `, and ${names.length === 1 ? 'point' : 'points'} ${listWords(names)} marked` : '')
    + (g ? `, with dashed lines from ${g.name} to the two axes` : '');
  return svg('plane', xEnd + 4, oy + 23 + PAD, body, `${words}.`, PLANE_STYLE);
}

const DRAW = { array, groups, chunks, shortdiv, balance, placevalue, grid, area, numberline, table, columns, bar, strips, fracline, fracarea, scale, shape, prism, angle, plane };

export const PICTURE_TYPES = Object.keys(DRAW);

export function renderPicture(picture) {
  if (!picture || typeof picture !== 'object') return '';
  const draw = DRAW[picture.type];
  return draw ? draw(picture) : '';
}

// One of each, for the picture sheet (tools/picture-sheet.mjs) and the tests.
export const EXAMPLES = [
  { type: 'array', rows: 4, cols: 7 },
  { type: 'groups', groups: 4, each: 7, leftover: 1 },
  { type: 'chunks', dividend: 324, divisor: 12, remainder: 0,
    chunks: [{ times: 10, amount: 120 }, { times: 10, amount: 120 }, { times: 5, amount: 60 }, { times: 2, amount: 24 }] },
  { type: 'shortdiv', dividend: 754, divisor: 3, remainder: 1,
    places: [{ here: 7, q: 2, left: 1 }, { here: 15, q: 5, left: 0 }, { here: 4, q: 1, left: 1 }] },
  { type: 'balance', left: '7 + 5', right: '☐ + 4' },
  { type: 'placevalue', value: 4052316, columns: 7, highlight: 'ten thousands' },
  { type: 'grid', shaded: 47 },
  { type: 'area', rowParts: [6], colParts: [40, 7] },
  { type: 'numberline', from: 0, to: 100, step: 10, jumps: [{ from: 20, to: 50, label: '+30' }],
    marks: [{ at: 50, label: 'halfway' }], point: { at: 65, label: '☐' } },
  { type: 'table', head: ['Triangles', 'Sticks'], rows: [[1, 3], [2, 5], [3, 7], [4, '?']] },
  { type: 'columns', op: '+', top: 456, bottom: 378, carries: [0, 1, 1] },
  { type: 'bar', parts: [{ label: 'Saturday', value: 120 }, { label: 'Sunday', value: '?' }], total: 300 },
  { type: 'bar', compare: { a: { label: 'Ava', value: 45 }, b: { label: 'Ben', value: 28 } } },
  { type: 'bar', rows: [
    { title: 'First', groups: { count: 4, label: 'packs' }, parts: Array.from({ length: 4 }, () => ({ label: '', value: 8 })), total: { found: 32 } },
    { title: 'Then', parts: [{ label: 'sold', value: 19 }, { label: 'left', value: '?' }], total: { found: 32 } }] },
  // the fraction pictures, and the discrete model (tests/oracle/fractions.mjs reads each of these)
  { type: 'array', rows: 2, cols: 4, shaded: 6 },
  { type: 'strips', rows: [{ d: 8, shaded: 3 }] },
  { type: 'strips', rows: [{ d: 4, count: 1, label: 'unit' }, { d: 4, count: 4, name: 'A' }, { d: 4, count: 3, name: 'B' }, { d: 4, count: 5, name: 'C' }] },
  { type: 'strips', rows: [{ d: 4, shaded: 1 }, { d: 2, shaded: 1 }], lengths: [1, 3] },
  { type: 'strips', rows: [{ d: 4, count: 7, shaded: 7, label: 'unit' }] },
  { type: 'strips', rows: [{ d: 5, value: 6, shaded: 2 }], total: 30 },
  { type: 'strips', rows: [{ d: 5, value: '?', shaded: 3 }], total: '?', shadedTotal: 18 },
  { type: 'fracline', wholes: 2, d: 4, labels: 'wholes', point: { n: 3, d: 4, label: '?' } },
  { type: 'fracline', wholes: 1, d: 4, labels: 'all', below: 8 },
  { type: 'fracline', wholes: 2, d: 4, labels: 'wholes', letters: true, marks: [{ n: 1, d: 2, label: 'A' }, { n: 1, d: 1, label: 'B' }, { n: 3, d: 2, label: 'C' }] },
  { type: 'fracline', wholes: 1, d: 10, labels: 'benchmarks', letters: true, marks: [{ n: 1, d: 5, label: 'A' }, { n: 2, d: 3, label: 'B' }, { n: 3, d: 4, label: 'C' }] },
  { type: 'fracline', wholes: 1, d: 8, labels: 'all', jumps: [{ from: [0, 8], to: [3, 8], label: '+3/8' }, { from: [3, 8], to: [5, 8], label: '+2/8' }] },
  { type: 'fracline', stack: [3, 8] },
  { type: 'fracarea', cols: 4, rows: 2, shaded: 3 },
  // the number line with percentages, and decimals, under it (tests/oracle/percentages.mjs reads these)
  { type: 'fracline', wholes: 1, d: 4, labels: 'all', below: 4, pct: true, point: { n: 3, d: 4, label: '', below: '?' } },
  { type: 'fracline', wholes: 1, d: 10, labels: 'wholes', below: 10, pct: true, dec: true, point: { n: 3, d: 10, label: '', dec: '?' } },
  // the measurement pictures (tests/oracle/measurement.mjs reads these): NESA's L-shape, area 18, and its prism of 5 layers
  // of 4 rows of 2 cubes; the pages' saved copies are 2026-10-28-2213-article-k-10-mathematics-k-10-syllabus-2022-<id>.md,
  // NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026 (fa0dfe5fec l.45, fa89ed4224 l.48)
  { type: 'scale', device: 'ruler', unit: 'cm', marks: ['0', '1', '2', '3', '4', '5', '6'], parts: 2, end: 9, name: 'the pencil' },
  { type: 'shape', kind: 'lshape', unit: 'cm', sides: { W: 6, H: 4, cw: 3, ch: 2 }, labels: 'area' },
  { type: 'prism', l: 2, w: 4, h: 5, cubes: true, unit: 'cm' },
  // the angle and the grid (tests/oracle/geometry.mjs reads these): NESA's 120° and 60° on a straight line, and its (2, 3)
  // and (3, 2); the pages' saved copies are 2026-10-28-2213-article-k-10-mathematics-k-10-syllabus-2022-<id>.md, NSW
  // Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 30 October 2026 (fae314fde1 l.119, fa35c41b81 l.35)
  { type: 'angle', whole: 180, parts: ['120', '?'] },
  { type: 'plane', across: 4, up: 4, points: [{ x: 2, y: 3, name: 'A' }, { x: 3, y: 2, name: 'B' }] },
];
