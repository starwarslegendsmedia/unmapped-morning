// Checking what she answered against an item's answer.
// "given" comes from the screen: a string for one box, an array of strings for several boxes.

export function normalise(text) {
  return String(text ?? '')
    .trim()
    .replace(/[\s,]/g, '') // "12 345" and "12,345" both mean 12345
    .replace(/−/g, '-');
}

function asNumber(text) {
  const t = normalise(text);
  if (!/^-?\d+(\.\d+)?$/.test(t)) return NaN;
  return Number(t);
}

// A decimal as a whole number of thousandths, exactly (a float is not: 0.1 + 0.2 is not 0.3): '0.5', '0.50', '0.500' and
// '.5' are all 500n; anything else, a fourth decimal place included, is null. Spaces and commas go as in normalise.
export function thousandths(text) {
  const t = normalise(text);
  if (!/^\d*\.?\d{0,3}$/.test(t) || !/\d/.test(t)) return null;
  const [whole, frac = ''] = t.split('.');
  return BigInt(whole || '0') * 1000n + BigInt(frac.padEnd(3, '0'));
}

// Two amounts the same: where either is text, by its thousandths, exactly ('0.50' is '0.5', a word problem's bar and the
// story it is built from, stage 6); two whole numbers as they are.
export function sameAmount(a, b) {
  if (typeof a !== 'string' && typeof b !== 'string') return a === b;
  const t = thousandths(String(a));
  return t !== null && t === thousandths(String(b));
}

// The same number, by value: "0.50" is right for 0.5, which is what "Interpret zero digit(s) at the end of a decimal"
// teaches (MA3-RN-02, Stage 3 Represents numbers A, saved copy 2026-10-10-1116-article-k-10-mathematics-k-10-syllabus-
// 2022-fa87632ef7.md l.67; NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026).
// Taking it as right is chosen for this game, not a syllabus requirement.
const sameDecimal = (given, value) => thousandths(given) !== null && thousandths(given) === thousandths(value);
const one = (given) => (Array.isArray(given) ? given[0] : given);

// A fraction as two whole numbers, exactly: '3/8' and ' 3 / 8 ' are { n: 3n, d: 8n } (spaces and commas go as in
// normalise); a denominator of 0, a point, a sign, a box or a missing part is null (stage 6 strand 2, plans/2026-10-25-
// stage-6-plan.md "The fraction answer, exactly").
export function fractionOf(text) {
  const t = normalise(text);
  if (!/^\d{1,8}\/\d{1,8}$/.test(t)) return null;
  const [n, d] = t.split('/').map(BigInt);
  return d === 0n ? null : { n, d };
}

// Two fractions the same number, by cross-multiplying: 10/16 is 5/8. Taking an equal fraction as right is chosen for
// this game, not a syllabus requirement (the Stage 3 pages ask for no simplest form), as "0.50" for 0.5 is above.
export function sameFraction(a, b) {
  const x = fractionOf(a), y = fractionOf(b);
  return x !== null && y !== null && x.n * y.d === y.n * x.d;
}
// fraction text from her two boxes [n, d], or as she gave it ('5/8')
const fractionGiven = (given) => (Array.isArray(given) ? `${normalise(given[0])}/${normalise(given[1])}` : given);

export function isCorrect(answer, given) {
  switch (answer.kind) {
    case 'number':
      // a step's value may be decimal text, and its box takes it as a decimal answer's does
      if (typeof answer.value === 'string') return sameDecimal(one(given), answer.value);
      return asNumber(Array.isArray(given) ? given[0] : given) === answer.value;
    case 'decimal':
      return sameDecimal(one(given), answer.value);
    case 'fraction':
      return sameFraction(fractionGiven(given), `${answer.n}/${answer.d}`);
    case 'remainder': {
      const [q, r] = Array.isArray(given) ? given : String(given).split(/r/i);
      return asNumber(q) === answer.quotient && asNumber(r ?? '0') === answer.remainder;
    }
    case 'choice':
      return normalise(Array.isArray(given) ? given[0] : given) === normalise(answer.value);
    case 'order': {
      // fraction text ('1/5') and decimal text ('0.50') by value, each only by its own kind, whole numbers as numbers
      const g = Array.isArray(given) ? given : String(given).split(/[;|]/);
      const same = (v, value) => (typeof value !== 'string' ? asNumber(v) === value
        : value.includes('/') ? sameFraction(v, value) : sameDecimal(v, value));
      return g.length === answer.values.length && g.every((v, i) => same(v, answer.values[i]));
    }
    case 'pair':
      // a point's two whole numbers, each in its own box, in order: "3" and "2" are not (2, 3) (stage 6 strand 4b,
      // plans/2026-10-25-stage-6-plan.md "The answer kind `pair`, exactly")
      return Array.isArray(given) && given.length === 2 && given.every((v, i) => asNumber(v) === answer.values[i]);
    default:
      throw new Error(`unknown answer kind ${answer.kind}`);
  }
}

// The answer written out, for showing after a second miss.
export function answerText(answer) {
  switch (answer.kind) {
    case 'number': return fmt(answer.value);
    case 'remainder': return `${fmt(answer.quotient)} r ${fmt(answer.remainder)}`;
    case 'decimal': return String(answer.value);
    case 'fraction': return `${answer.n}/${answer.d}`;
    case 'choice': return String(answer.value);
    case 'order': return answer.values.map(fmt).join(', ');
    // its form with each box its value in order: "(3, 2)"
    case 'pair': { let i = 0; return answer.form.replace(/☐/g, () => fmt(answer.values[i++])); }
    default: return '';
  }
}

// Australian style: 12 345 (a space every three digits from 10 000 up, as NSW texts print them). The space is a
// no-break one (U+00A0), so a number never breaks across a line ("400 860 835 ☐ 40 860 835" on a phone); the voice
// says it as an ordinary space (js/speech.js words), so a sentence's sound file is found under the same words.
const GROUP = '\u00a0';
export function fmt(n) {
  if (typeof n !== 'number') return String(n);
  const [whole, frac] = String(n).split('.');
  const sign = whole.startsWith('-') ? '−' : '';
  const digits = whole.replace('-', '');
  const grouped = digits.length > 4 ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP) : digits;
  return sign + grouped + (frac ? '.' + frac : '');
}
