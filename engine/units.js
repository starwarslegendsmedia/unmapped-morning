// The exact unit helpers every measurement file shares (stage 6 strand 4, plans/2026-10-25-stage-6-plan.md "Units,
// exactly"): an amount is decimal text with at most 3 places, worked as a BigInt count of thousandths of its kind's
// smallest unit, never a float. MA3-GM-02, MA3-2DS-02, MA3-3DS-02 and MA3-NSM-01 (NSW Mathematics K–10 Syllabus (2022),
// 16 June 2026 amendments, checked 28 October 2026; saved copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-
// 2022-outcomes.md l.276, l.288, l.300, l.304). The pages' saved copies are 2026-10-28-2213-article-k-10-mathematics-
// k-10-syllabus-2022-<id>.md: "square metres" and "cubic metres", never "metres squared", as m2 and m3 are read
// (fad7c142c4 l.132-134, fa51e61164 l.125). Capacity and volume are kinds apart: the Stage 3 pages never make a
// millilitre a cubic centimetre.

import { normalise, thousandths } from './check.js';

// Every unit the strand writes: its kind, how many of the kind's smallest unit it is, and its words for one and many
export const UNITS = {
  mm: { kind: 'length', base: 1n, one: 'millimetre', many: 'millimetres' },
  cm: { kind: 'length', base: 10n, one: 'centimetre', many: 'centimetres' },
  m: { kind: 'length', base: 1000n, one: 'metre', many: 'metres' },
  km: { kind: 'length', base: 1000000n, one: 'kilometre', many: 'kilometres' },
  'cm²': { kind: 'area', base: 1n, one: 'square centimetre', many: 'square centimetres' },
  'm²': { kind: 'area', base: 10000n, one: 'square metre', many: 'square metres' },
  ha: { kind: 'area', base: 100000000n, one: 'hectare', many: 'hectares' },
  'km²': { kind: 'area', base: 10000000000n, one: 'square kilometre', many: 'square kilometres' },
  'cm³': { kind: 'volume', base: 1n, one: 'cubic centimetre', many: 'cubic centimetres' },
  'm³': { kind: 'volume', base: 1000000n, one: 'cubic metre', many: 'cubic metres' },
  mL: { kind: 'capacity', base: 1n, one: 'millilitre', many: 'millilitres' },
  L: { kind: 'capacity', base: 1000n, one: 'litre', many: 'litres' },
  g: { kind: 'mass', base: 1n, one: 'gram', many: 'grams' },
  kg: { kind: 'mass', base: 1000n, one: 'kilogram', many: 'kilograms' },
  t: { kind: 'mass', base: 1000000n, one: 'tonne', many: 'tonnes' },
};

// Each kind's units, smallest first: { length: ['mm', 'cm', 'm', 'km'], ... }
export const KINDS_OF_UNIT = {};
for (const [unit, { kind }] of Object.entries(UNITS)) (KINDS_OF_UNIT[kind] ??= []).push(unit);

const unitOf = (unit) => {
  if (!UNITS[unit]) throw new Error(`unknown unit ${unit}`);
  return UNITS[unit];
};

// An amount as a whole number of thousandths of its kind's smallest unit: '2.6' km and '2600' m are both 2600000000n,
// '375' mL and '0.375' L both 375000n; null where engine/check.js thousandths is (a fourth place, not a number)
export function inBase(text, unit) {
  const t = thousandths(text);
  return t === null ? null : t * unitOf(unit).base;
}

// Thousandths of the kind's smallest unit (not below 0) back to an amount in this unit, as the shortest decimal text:
// 2600000000n in km '2.6'; null where it would need a fourth place
export function fromBase(n, unit) {
  const { base } = unitOf(unit);
  if (typeof n !== 'bigint' || n < 0n) throw new Error(`fromBase takes a BigInt not below 0, not ${String(n)}`);
  if (n % base) return null;
  const t = n / base, part = String(t % 1000n).padStart(3, '0').replace(/0+$/, '');
  return part ? `${t / 1000n}.${part}` : String(t / 1000n);
}

// An amount as shown: the number as fmt groups it, a no-break space, the symbol ('2.6\u00a0km', '25\u00a0000\u00a0m²'),
// as the page records it, "a space should be left between the number and the abbreviated unit, eg 3 cm, not 3cm"
// (fa35c41b81 l.150). Only an amount thousandths reads; its whole part grouped from its own digits by fmt's rule, never
// through a float, so a long one keeps every digit
export function amountText(text, unit) {
  unitOf(unit);
  if (thousandths(text) === null) throw new Error(`not an amount ${text}`);
  const [digits, part] = normalise(text).split('.');
  const whole = digits.replace(/^0+(?=\d)/, '') || '0';
  const grouped = whole.length > 4 ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : whole;
  return `${grouped}${part != null ? `.${part}` : ''}\u00a0${unit}`;
}

// The unit's words for an amount: the singular for exactly 1 ('1' km "kilometre"), else the plural ('0.5' km
// "kilometres", as the page says a part, "13.5 cm is 13 centimetres and 5 millimetres", fae314fde1 l.45; '☐' too)
export function unitWords(unit, text) {
  const { one, many } = unitOf(unit);
  return normalise(text) === '1' ? one : many;
}
