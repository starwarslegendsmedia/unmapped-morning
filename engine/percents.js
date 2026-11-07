// The exact percentage helpers every percentage file shares (stage 6 strand 3, plans/2026-10-25-stage-6-plan.md "Strand
// 3: percentages"): a per cent is a whole number of hundredths, money a whole number of cents as a BigInt, never a float.
// MA3-RN-03 "determines percentages of quantities, and finds equivalent fractions and decimals for benchmark percentage
// values" (NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 28 October 2026; saved copy
// 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-outcomes.md l.246-248), its content points on Stage 3
// Represents numbers B (saved copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-2022-fa0a18f458.md l.52-63).

import { normalise, thousandths } from './check.js';

const div = (a, b) => (a - (a % b)) / b;

// A benchmark per cent as its fraction, as the page names them: 50% a half, 25% and 75% quarters (l.55), and a whole
// number of tens in tenths, 30% 3/10 (the teaching advice's "one-tenth (10%, 0.1)", Examples fa0a18f458 l.100), never
// put in lowest terms (20% is 2/10, as a line in tenths marks it); { n, d } in Numbers, and null for any other per cent
// (37%, 5%) or one outside 1% to 99%.
export function percentFraction(p) {
  if (!Number.isInteger(p) || p < 1 || p > 99) return null;
  if (p === 50) return { n: 1, d: 2 };
  if (p === 25 || p === 75) return { n: div(p, 25), d: 4 };
  if (p % 10 === 0) return { n: div(p, 10), d: 10 };
  return null;
}

// Money as whole cents, exactly: '47' is 4700n, '4.70' 470n, '4.7' 470n; a third place after the point ('4.705'), a sign
// or anything not a number is null. Spaces and commas go as in engine/check.js normalise.
export function cents(text) {
  const t = normalise(text);
  if (!/^\d*\.?\d{0,2}$/.test(t) || !/\d/.test(t)) return null;
  return div(thousandths(t), 10n);
}

// Whole cents as the game writes money: whole dollars as '47', otherwise exactly two places, '4.70', '11.75'
export function dollars(c) {
  const whole = div(c, 100n), part = c % 100n;
  return part ? `${whole}.${String(part).padStart(2, '0')}` : String(whole);
}

// p% of an amount in cents, exactly: 25% of 4700n is 1175n; null where it is not a whole number of cents
export function percentOfCents(p, c) {
  const x = BigInt(p) * c;
  return x % 100n ? null : div(x, 100n);
}

// A whole number of hundredths as the shortest decimal text, as the game writes a decimal: 75 '0.75', 5 '0.05', 30
// '0.3', 100 '1', 0 '0'
export function hundredthsText(h) {
  const whole = div(h, 100), part = String(h % 100).padStart(2, '0').replace(/0+$/, '');
  return part ? `${whole}.${part}` : String(whole);
}
