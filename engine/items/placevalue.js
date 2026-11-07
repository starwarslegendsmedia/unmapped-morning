// Place value: numbers to hundreds of thousands (MA2-RN-01), then to millions (MA3-RN-01: "name millions",
// "order them", "Round numbers to a specified place value", "1000 thousands is 1 million"), and × and ÷ by
// 10, 100 and 1000 (MA2-RN-01: "Recognise and represent numbers that are 10, 100 or 1000 times as large";
// MA3-MR-01: "multiply one-digit numbers by 10, 100, 1000"). Whole numbers only for now; decimals come in
// release 2. Numbers are made digit by digit with zeros on purpose: an empty place is where reading and
// writing big numbers goes wrong.
// At her usual level (not the easy one) come the forms past the standard ones (NESA audit change 3): "Partition
// numbers of up to 6 digits in non-standard forms" (l.50) and "Recognise the number of tens, hundreds or thousands in a
// number" (l.54) (Stage 2 Representing numbers B, https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-2/fa1dbb9271);
// "Recognise 1000 thousands is 1 million and 1000 millions is 1 billion" (l.53), "Regroup numbers in different forms"
// (l.54) and "Partition numbers to 1 billion in non-standard forms" (l.55) (Stage 3 Represents numbers A,
// https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-3/fa87632ef7);
// NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026.

import { fmt } from '../check.js';
import { withWays } from './ways.js';
import { jumpsUp } from '../methods.js';

// the place names, ones to hundred billions: the one list, which the pictures' charts name their columns from too
// (engine/render/svg.js), and they draw to 12 digits
export const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions',
  'ten millions', 'hundred millions', 'billions', 'ten billions', 'hundred billions'];
export const ONE = ['one', 'ten', 'hundred', 'thousand', 'ten thousand', 'hundred thousand', 'million', 'ten million',
  'hundred million', 'billion', 'ten billion', 'hundred billion'];

export const unit = (count, place) => (count === 1 ? ONE[place] : PLACES[place]);
const len = (n) => String(n).length;

// ---- numbers in words, Australian style: "four hundred and six", "thirty-four thousand and sixty-two" ----
const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function below100(n) {
  if (n < 20) return SMALL[n];
  return n % 10 ? `${TENS[Math.floor(n / 10)]}-${SMALL[n % 10]}` : TENS[Math.floor(n / 10)];
}

function below1000(n) {
  const h = Math.floor(n / 100), r = n % 100;
  if (!h) return below100(r);
  return r ? `${SMALL[h]} hundred and ${below100(r)}` : `${SMALL[h]} hundred`;
}

// The groups of three digits that are not empty, biggest first: 4 006 050 -> millions 4, thousands 6, ones 50.
function groupsOf(n) {
  return [[1e6, 'million'], [1e3, 'thousand'], [1, '']]
    .map(([size, name]) => ({ size, name, g: Math.floor(n / size) % 1000 }))
    .filter((x) => x.g > 0);
}

const groupWords = (x) => below1000(x.g) + (x.name ? ` ${x.name}` : '');

export function inWords(n) {
  const groups = groupsOf(n);
  if (!groups.length) return 'zero';
  // groups are joined with commas, or "and" when the last is the ones and under 100
  return groups.map((x, i) => {
    if (i === 0) return groupWords(x);
    return (x.size === 1 && x.g < 100 ? ' and ' : ', ') + groupWords(x);
  }).join('');
}

// ---- making numbers ----
// d digits, the first from 1 to leadMax, the rest with a zero about one time in four
function makeNumber(rng, d, leadMax = 9) {
  let s = String(rng.int(1, leadMax));
  for (let i = 1; i < d; i++) s += rng.chance(0.25) ? '0' : String(rng.int(1, 9));
  return Number(s);
}

// A number easy to mix up with n: two digits swapped, one digit changed, or a digit more or fewer.
function nearby(rng, n, minD, maxD) {
  for (let tries = 0; tries < 50; tries++) {
    const s = String(n).split('');
    const how = rng.pick(['swap', 'change', 'change', 'length']);
    if (how === 'swap') {
      const i = rng.int(0, s.length - 1), j = rng.int(0, s.length - 1);
      [s[i], s[j]] = [s[j], s[i]];
    } else if (how === 'change') {
      s[rng.int(0, s.length - 1)] = String(rng.int(0, 9));
    } else if (s.length > minD && (s.length >= maxD || rng.chance(0.5))) {
      s.splice(rng.int(1, s.length - 1), 1);
    } else {
      s.splice(rng.int(1, s.length), 0, String(rng.int(0, 9)));
    }
    const m = Number(s.join(''));
    if (s[0] !== '0' && m !== n && s.length >= minD && s.length <= maxD) return m;
  }
  return n % 10 === 9 ? n - 1 : n + 1;
}

// The place value of each digit that is not 0, biggest first: 34 062 -> 30 000, 4000, 60, 2.
function parts(n) {
  const s = String(n);
  return s.split('').map((c, i) => ({ value: Number(c) * 10 ** (s.length - 1 - i), digit: Number(c), place: s.length - 1 - i }))
    .filter((p) => p.digit > 0);
}

const expanded = (n) => parts(n).map((p) => fmt(p.value)).join(' + ');
// each digit's value, the ones' its own, then the values added: "3 ten thousands = ☐", ..., "30 000 + 4000 + 60 + 2 = ☐"
function valueSteps(n) {
  const ps = parts(n);
  if (ps.length === 1) return [{ text: `${ps[0].digit} ${unit(ps[0].digit, ps[0].place)} = ☐`, value: n }];
  return [...ps.filter((p) => p.place > 0).map((p) => ({ text: `${p.digit} ${unit(p.digit, p.place)} = ☐`, value: p.value })),
    { text: `${expanded(n)} = ☐`, value: n }];
}
const hasGap = (n) => String(n).slice(1).includes('0');

// Round by looking at the digit to the right of the place, as the syllabus teaches it: 5 or more rounds up.
export function roundTo(n, p) {
  const k = len(p) - 1;
  const s = String(n).padStart(k + 1, '0');
  const down = Number(s.slice(0, s.length - k) + '0'.repeat(k));
  const next = Number(s[s.length - k]);
  return { down, up: down + p, next, value: next >= 5 ? down + p : down };
}

// Which is bigger, the way the syllabus teaches it: count the digits, then go from the biggest place.
function compareDigits(a, b) {
  const x = String(a), y = String(b);
  if (x.length !== y.length) return { sign: x.length < y.length ? '<' : '>', at: -1 };
  for (let i = 0; i < x.length; i++) {
    if (x[i] !== y[i]) return { sign: x[i] < y[i] ? '<' : '>', at: x.length - 1 - i };
  }
  return { sign: '=', at: -1 };
}

const SIGN_WORDS = { '<': 'less than', '=': 'equal to', '>': 'greater than' };

// ---- the second ways (plans/2026-10-25-two-ways-plan.md): each kind returns, beside the way she learned, a closure for
// each way that fits it, its steps made from the numbers already drawn and never drawing again; and where the numbers
// stop a way on its own kind, why ----
const an = (x) => (x === 8 ? `an ${x}` : `a ${x}`);
const and = (list) => (list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`);
const dig = (n, place) => Math.floor(n / 10 ** place) % 10;

// counting up through the stops, a jump to each, then the jumps added (engine/methods.js countUp)
function countUpSteps(stops) {
  const jumps = stops.slice(1).map((s, i) => s - stops[i]);
  const steps = jumps.map((j, i) => ({ text: `${fmt(stops[i])} + ☐ = ${fmt(stops[i + 1])}`, value: j }));
  if (jumps.length > 1) steps.push({ text: `Add the jumps: ${jumps.map(fmt).join(' + ')} = ☐`, value: stops.at(-1) - stops[0] });
  return steps;
}

// the place value chart, a group of words at a time, biggest first: "thirty-four thousand" is a 3 in the ten thousands
// and a 4 in the thousands; a group with no words puts a 0 in each of its places
function chartLines(n) {
  const top = len(n) - 1;
  const lines = [];
  for (let i = Math.floor(top / 3); i >= 0; i--) {
    const places = [3 * i + 2, 3 * i + 1, 3 * i].filter((pl) => pl <= top);
    const g = Math.floor(n / 1000 ** i) % 1000;
    lines.push({ text: g
      ? `"${groupWords({ g, name: ['', 'thousand', 'million'][i] })}": ${and(places.map((pl) => `${an(dig(n, pl))} in the ${PLACES[pl]}`))}.`
      : `Nothing for the ${and(places.map((pl) => PLACES[pl]))}: a 0 in each.` });
  }
  return lines;
}

// ---- pv-10k and pv-millions: the same shapes, bigger numbers ----
// pv-10k rounds to the nearest 10 000 too at her usual level: "Identify the nearest thousand, 10 thousand or 100
// thousand to numbers" (Stage 2, l.44, .../stage-2/fa1dbb9271)
const SIZES = {
  'pv-10k': { normal: [4, 5], easy: [3, 3], rounds: [10, 100, 1000, 10000], easyRounds: [10, 100] },
  'pv-millions': { normal: [6, 7], easy: [4, 5], rounds: [1000, 10000, 100000, 1000000], easyRounds: [100, 1000, 10000] },
};

const FAMILIES = ['words-to-number', 'read-words', 'expanded-places', 'expanded-sum', 'partition', 'digit-value',
  'compare', 'compare-expanded', 'order', 'round', 'round'];
// At her usual level some of a kind become its non-standard form: a partition with a part missing ("67 000 = 50 000
// + ☐") or a place regrouped into the next ("4386 = 3 thousands + ☐ hundreds + 86"); a digit's value becomes how many
// tens, hundreds or thousands in the number ("4386 = ☐ hundreds + 86"); and regrouping takes in the billion. Drawn
// after the kind, so a seed that made another kind still makes the same problem.
const GROW = {
  partition: ['partition', 'split', 'rename-part'],
  'digit-value': ['digit-value', 'rename'],
  regroup: ['regroup', 'billion'],
};
// pv-millions at her usual level: a third of these have 8 or 9 digits, towards 1 billion; a number she types stays
// at 8 digits, as many as the answer pad takes, so only the kinds she answers by choosing or ordering reach 9
const BIG = new Set(['words-to-number', 'read-words', 'expanded-places', 'expanded-sum', 'partition', 'digit-value',
  'compare', 'compare-expanded', 'order', 'split', 'rename']);
const CHOSEN = new Set(['read-words', 'compare', 'order']);

// pv-10k at her usual level: one problem in three is made again at six digits, "Apply place value to partition, regroup
// and rename numbers up to 6 digits" (l.46) and "Name thousands using the place value grouping of ones, tens and hundreds
// of thousands" (l.48); a rounding one then rounds to the nearest 1000, 10 000 or 100 000, "Identify the nearest
// thousand, 10 thousand or 100 thousand to numbers" (l.44) (Stage 2 Representing numbers B, .../stage-2/fa1dbb9271;
// NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026). Drawn after the rest, so a
// problem it leaves is the one it was; the easy level is as it was. A rounding unit asked for by its key is kept.
const SIX_SHARE = 1 / 3;
const SIX_ROUNDS = [1000, 10000, 100000];

function pvItem(skillId, rng, opts) {
  const item = pvMake(skillId, rng, opts);
  if (skillId !== 'pv-10k' || opts.easy || !rng.chance(SIX_SHARE)) return item;
  const round = item.key.startsWith('round-') && !opts.key?.startsWith('round-');
  return pvMake(skillId, rng, { ...opts, key: round ? `round-${rng.pick(SIX_ROUNDS)}` : item.key, digits: 6 });
}

// opts.digits: the number's digits, in place of a size drawn for the level
function pvMake(skillId, rng, opts) {
  const size = SIZES[skillId];
  const [lo, hi] = opts.easy ? size.easy : size.normal;
  const families = skillId === 'pv-millions' ? [...FAMILIES, 'regroup'] : FAMILIES;
  let key = opts.key || rng.pick(families);
  if (!opts.key && !opts.easy && GROW[key]) key = rng.pick(GROW[key]);
  if (key === 'round') key = `round-${rng.pick(opts.easy ? size.easyRounds : size.rounds)}`;
  const base = { skill: skillId, key };
  let d = opts.digits ?? rng.int(lo, hi);
  if (skillId === 'pv-millions' && !opts.easy && BIG.has(key) && rng.chance(1 / 3)) d = rng.int(8, CHOSEN.has(key) ? 9 : 8);
  const top = Math.max(hi, d);
  const minD = Math.max(2, lo - 1);
  const chart = (value, highlight) => ({ type: 'placevalue', value, columns: Math.max(hi, len(value)), ...(highlight ? { highlight } : {}) });

  if (key === 'words-to-number') {
    const n = makeNumber(rng, d);
    const groups = groupsOf(n);
    const steps = groups.length > 1
      ? groups.map((x) => ({ text: `"${groupWords(x)}" is ☐`, value: x.g * x.size }))
      : [{ text: `"${inWords(n)}" is ${parts(n).map((p) => `${p.digit} ${unit(p.digit, p.place)}`).join(' and ')}.` }];
    if (hasGap(n)) steps.push({ text: 'Every place gets a digit: a 0 fills each empty place.' });
    steps.push({ text: groups.length > 1 ? `${groups.map((x) => fmt(x.g * x.size)).join(' + ')} = ☐` : 'In numerals: ☐', value: n });
    return {
      ...base,
      ask: `In numerals, ${inWords(n)} is ☐`,
      say: `Write ${inWords(n)} in numerals.`,
      answer: { kind: 'number', value: n },
      steps,
      picture: chart(n),
      hint: n >= 1000 ? 'Which words tell you the thousands, and which tell you the rest? Did you put a 0 in each empty place?'
        : 'Which words tell you the hundreds? Did you put a 0 in each empty place?',
      words: ['numeral', 'place value', 'digit'],
      ways: {
        'pv-chart': () => ({
          steps: [...chartLines(n), { text: 'Read the digits from the left: ☐', value: n }],
          hint: 'Which places does each group of words fill? Which places get a 0?',
          words: ['place value', 'digit', 'numeral'],
        }),
      },
    };
  }

  if (key === 'read-words') {
    const n = makeNumber(rng, d);
    const all = new Set([n]);
    while (all.size < 3) all.add(nearby(rng, n, minD, top));
    return {
      ...base,
      ask: `Which words say ${fmt(n)}?`,
      say: `Which words say ${n}?`,
      answer: { kind: 'choice', options: rng.shuffle([...all].map(inWords)), value: inWords(n) },
      steps: [
        { text: `Split it into groups of three digits from the right: ${groupsOf(n).map((x) => `${x.g}${x.name ? ` ${x.name}` : ''}`).join(', then ')}.` },
        { text: `Say each group with its name: "${inWords(n)}".` },
      ],
      picture: chart(n),
      hint: n >= 1000000 ? 'Read the millions first. Do the words match, place by place?'
        : n >= 1000 ? 'Read the thousands first. Do the words match, place by place?'
          : 'Read the hundreds, tens and ones. Do the words match, place by place?',
      words: ['numeral', 'place value'],
    };
  }

  if (key === 'expanded-places') {
    const n = makeNumber(rng, d);
    const digits = String(n).split('').map(Number);
    const named = digits.map((x, i) => `${x} ${unit(x, digits.length - 1 - i)}`);
    const said = `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}`;
    return {
      ...base,
      ask: `${said} = ☐`,
      say: `${said} makes what number?`,
      answer: { kind: 'number', value: n },
      steps: [
        { text: 'Write each digit in its place, biggest place first, with 0 for a place that has none.' },
        { text: `The digits are ${digits.join(', ')}, so the number is ☐`, value: n },
      ],
      picture: chart(n),
      hint: 'Did you write one digit for every place, with 0 where a place has none?',
      words: ['place value', 'expanded form', 'digit'],
      // add the values: each digit's value, then the values added, up to five parts so the boxes stay few
      ...(parts(n).length <= 5 ? { ways: { 'pv-values': () => ({ steps: valueSteps(n), hint: 'What is each digit worth in its place? What do the values add to?', words: ['place value', 'expanded form'] }) } }
        : { why: { 'pv-values': 'there are too many parts to add one at a time' } }),
    };
  }

  if (key === 'expanded-sum' || key === 'partition') {
    let n = makeNumber(rng, d);
    while (parts(n).length < 3) n = makeNumber(rng, d);
    const ps = parts(n);
    if (key === 'expanded-sum') {
      return {
        ...base,
        ask: `${expanded(n)} = ☐`,
        say: ps.map((p) => p.value).join(' plus '),
        answer: { kind: 'number', value: n },
        steps: [
          { text: `Each part fills one place${hasGap(n) ? '; a place with no part gets a 0' : ''}.` },
          { text: `${expanded(n)} = ☐`, value: n },
        ],
        picture: chart(n),
        hint: 'Which place does each part fill? Is there a place with nothing in it?',
        words: ['expanded form', 'place value'],
        // a running total, biggest part first, up to five parts so the boxes stay few, as expanded-places
        ...(ps.length <= 5 ? {
          ways: {
            'pv-values': () => ({
              steps: ps.slice(1).map((p, i) => {
                const before = ps.slice(0, i + 1).reduce((t, x) => t + x.value, 0);
                return { text: `${fmt(before)} + ${fmt(p.value)} = ☐`, value: before + p.value };
              }),
              hint: 'Start with the biggest part. What do you have after adding the next part, and the next?',
              words: ['expanded form', 'place value'],
            }),
          },
        } : { why: { 'pv-values': 'there are too many parts to add one at a time' } }),
      };
    }
    const gone = rng.int(0, ps.length - 1);
    const p = ps[gone];
    return {
      ...base,
      ask: `${fmt(n)} = ${ps.map((x, i) => (i === gone ? '☐' : fmt(x.value))).join(' + ')}`,
      say: `${n} is the same as ${ps.map((x, i) => (i === gone ? 'what' : x.value)).join(' plus ')}?`,
      answer: { kind: 'number', value: p.value },
      steps: [
        // a ones digit is its own value, so the ones are not named by their digit before the box (pt32)
        ...(p.place === 0
          ? [{ text: `Which place is missing? The ones.` }, { text: `The ones digit of ${fmt(n)} is worth ☐`, value: p.value }]
          : [{ text: `Which place is missing? The ${PLACES[p.place]}: the ${p.digit} in ${fmt(n)}.` }, { text: `${p.digit} ${unit(p.digit, p.place)} = ☐`, value: p.value }]),
      ],
      picture: chart(n, PLACES[p.place]),
      hint: `Which place has no part on the right? What is that digit of ${fmt(n)} worth?`,
      words: ['expanded form', 'place value', 'partition'],
      // the whole minus the parts
      ways: {
        'pv-values': () => ({
          steps: [
            { text: `Add the parts you have: ${ps.filter((x, i) => i !== gone).map((x) => fmt(x.value)).join(' + ')} = ☐`, value: n - p.value },
            { text: `The missing part is the gap: ${fmt(n)} − ${fmt(n - p.value)} = ☐`, value: p.value },
          ],
          hint: `What do the parts you have add to? How far is that from ${fmt(n)}?`,
          words: ['partition', 'place value'],
        }),
      },
    };
  }

  if (key === 'split') {
    // a non-standard partition with a part missing: "67 000 as 50 000 + 17 000" (Stage 2), "163 480 as 150 000 +
    // 13 480" (Stage 3). The round part has 1 to 3 fewer of its place than the number, so the other part reaches into it.
    let n, q, lead;
    do {
      n = makeNumber(rng, d);
      q = rng.pick(d >= 3 ? [d - 1, d - 2] : [d - 1]);
      lead = Math.floor(n / 10 ** q);
    } while (lead < 2 || n % 10 ** q === 0);
    // never a round part the number has whole already (21 887 as 20 000 + 1887 is by place)
    const fewer = [1, 2, 3].map((j) => lead - j).filter((m) => m >= 1 && !(m % 10 === 0 && m / 10 === Math.floor(lead / 10)));
    const a = rng.pick(fewer) * 10 ** q;
    const high = lead * 10 ** q, rest = n - high, b = n - a;
    // count up from the given part: from a round part as the count-up way does; from the other, which ends as the number
    // does, a jump at a time that keeps its last digits (its tops counted up as the count-up way counts)
    const countUp = (from, stops) => ({
      'pv-values': () => ({
        steps: stops(),
        hint: `Count up from ${fmt(from)} to ${fmt(n)}: which jumps take you there, and what do they add to?`,
        words: ['partition', 'difference'],
      }),
    });
    if (rng.chance(0.3)) {
      return {
        ...base,
        ask: `${fmt(n)} = ☐ + ${fmt(b)}`,
        say: `${n} is the same as what plus ${b}?`,
        answer: { kind: 'number', value: a },
        steps: [
          { text: `${fmt(n)} − ${fmt(rest)} = ☐`, value: high },
          { text: `${fmt(b)} − ${fmt(rest)} = ☐`, value: b - rest },
          { text: `${fmt(high)} − ${fmt(b - rest)} = ☐`, value: a },
        ],
        picture: chart(n),
        hint: `${fmt(n)} and ${fmt(b)} both end in ${fmt(rest)}. What is left of each without it?`,
        words: ['partition', 'place value'],
        ways: countUp(b, () => [{ text: `${fmt(b)} and ${fmt(n)} both end in ${fmt(rest)}, so count up from ${fmt(b)} and keep the ${fmt(rest)}.` },
          ...countUpSteps(jumpsUp((b - rest) / 10 ** q, lead).map((t) => t * 10 ** q + rest))]),
      };
    }
    return {
      ...base,
      ask: `${fmt(n)} = ${fmt(a)} + ☐`,
      say: `${n} is the same as ${a} plus what?`,
      answer: { kind: 'number', value: b },
      steps: [
        { text: `Split ${fmt(n)} by place: ${fmt(high)} and ${fmt(rest)}.` },
        { text: `${fmt(high)} = ${fmt(a)} + ☐`, value: high - a },
        { text: `${fmt(high - a)} + ${fmt(rest)} = ☐`, value: b },
      ],
      picture: chart(n),
      hint: `What goes with ${fmt(a)} to make ${fmt(high)}? What does the rest of ${fmt(n)} add?`,
      words: ['partition', 'place value'],
      ways: countUp(a, () => countUpSteps(jumpsUp(a, n))),
    };
  }

  if (key === 'rename' || key === 'rename-part') {
    // how many tens, hundreds or thousands: "Recognise the number of tens, hundreds or thousands in a number", "670
    // hundred" (Stage 2); "163 480 as 163 thousands, 4 hundreds and 8 tens" (Stage 3). rename-part regroups the first
    // place into the next: 4386 as 3 thousands + 13 hundreds + 86, 163 480 as 1 hundred thousand + 16 ten thousands + 3480.
    const part = key === 'rename-part';
    let n, p, upper;
    do {
      n = makeNumber(rng, d);
      p = part ? d - 2 : rng.int(Math.max(1, Math.min(3, d - 2) - 1), Math.min(3, d - 2));
      upper = Math.floor(n / 10 ** (p + 1));
    } while (part && upper < 2);
    const each = 10 ** p, rest = n % each;
    const give = part ? upper - 1 : 0, given = give * 10 * each;
    const count = (n - given - rest) / each;
    const tail = rest ? ` + ${fmt(rest)}` : '';
    const ask = part ? `${fmt(n)} = ${fmt(give)} ${unit(give, p + 1)} + ☐ ${PLACES[p]}${tail}` : `${fmt(n)} = ☐ ${PLACES[p]}${tail}`;
    const said = part ? `${n} is ${give} ${unit(give, p + 1)}, how many ${PLACES[p]}` : `${n} is how many ${PLACES[p]}`;
    const off = [given ? ` − ${fmt(given)}` : '', rest ? ` − ${fmt(rest)}` : ''].join('');
    return {
      ...base,
      ask,
      say: `${said}${rest ? `, and ${rest}` : ''}?`,
      answer: { kind: 'number', value: count },
      steps: [
        ...(part ? [{ text: `${fmt(give)} ${unit(give, p + 1)} = ☐`, value: given }] : []),
        ...(off ? [{ text: `${fmt(n)}${off} = ☐`, value: count * each }] : []),
        { text: `Each ${ONE[p]} is ${fmt(each)}, so ${fmt(count * each)} is ☐ ${PLACES[p]}`, value: count },
      ],
      picture: chart(n, PLACES[p]),
      hint: part ? `What are the ${fmt(give)} ${unit(give, p + 1)} worth? Take ${rest ? `them and the ${fmt(rest)}` : 'them'} away: how many ${PLACES[p]} are left?`
        : rest ? `Take off the ${fmt(rest)} first. How many ${PLACES[p]} make what is left?`
          : `How many ${PLACES[p]} make one ${ONE[p + 1]}? Then how many make ${fmt(n)}?`,
      words: ['place value', 'regroup'],
      // the place value chart: cover the places to the right; or trade one of the bigger unit
      ways: {
        'pv-chart': () => (part
          ? {
            steps: [
              { text: `${fmt(n)} is ${and([`${upper} ${unit(upper, p + 1)}`, `${dig(n, p)} ${unit(dig(n, p), p)}`, ...(rest ? [fmt(rest)] : [])])}.` },
              { text: `Trade 1 ${ONE[p + 1]} for 10 ${PLACES[p]}: ${give} ${unit(give, p + 1)}, and ${dig(n, p)} + 10 = ☐ ${PLACES[p]}`, value: count },
            ],
            hint: `How many ${PLACES[p]} make 1 ${ONE[p + 1]}? Trade one: how many ${PLACES[p]} are there then?`,
            words: ['place value', 'regroup'],
          }
          : {
            steps: [
              { text: `In ${fmt(n)}, the ${PLACES[p]} digit and the digits to its left count the ${PLACES[p]}.` },
              { text: `Cover the ${and(PLACES.slice(0, p).reverse())} of ${fmt(n)}: the digits left make ☐ ${PLACES[p]}`, value: count },
            ],
            hint: `Which digits are left when you cover the places to the right of the ${PLACES[p]}?`,
            words: ['place value', 'digit'],
          }),
      },
    };
  }

  if (key === 'digit-value') {
    // a digit that is not 0 and appears only once, so "the 4" means one place; never the ones
    let n, choices = [];
    for (let tries = 0; tries < 30 && !choices.length; tries++) {
      n = makeNumber(rng, d);
      const s = String(n);
      choices = parts(n).filter((p) => p.place > 0 && s.split(String(p.digit)).length === 2);
    }
    if (!choices.length) {
      n = Number(rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, d).join(''));
      choices = parts(n).filter((p) => p.place > 0);
    }
    const p = rng.pick(choices);
    return {
      ...base,
      ask: `In ${fmt(n)}, the ${p.digit} is worth ☐`,
      say: `In ${n}, what is the ${p.digit} worth?`,
      answer: { kind: 'number', value: p.value },
      steps: [
        { text: `Count the places from the right: ones, tens, hundreds... The ${p.digit} is in the ${PLACES[p.place]} place.` },
        { text: `${p.digit} ${unit(p.digit, p.place)} = ☐`, value: p.value },
      ],
      picture: chart(n, PLACES[p.place]),
      hint: `Which place is the ${p.digit} in? How much is one of that place worth?`,
      words: ['place value', 'digit'],
    };
  }

  if (key === 'compare' || key === 'compare-expanded') {
    // compare-expanded puts the expanded form on the right, equal half the time
    const wide = key === 'compare-expanded';
    let a, b;
    do {
      a = makeNumber(rng, d);
      b = wide && rng.chance(0.5) ? a : nearby(rng, a, minD, top);
    } while (wide && parts(b).length < 2);
    const { sign, at } = compareDigits(a, b);
    const right = wide ? expanded(b) : fmt(b);
    const steps = [];
    if (wide) steps.push({ text: `Work out the right side: ${right} = ☐`, value: b });
    if (len(a) !== len(b)) {
      steps.push({ text: `${fmt(a)} has ${len(a)} digits and ${fmt(b)} has ${len(b)}. More digits means a bigger number.` });
    } else if (sign === '=') {
      steps.push({ text: `Both have ${len(a)} digits, and every place is the same.` });
    } else {
      steps.push({ text: `Both have ${len(a)} digits, so compare from the biggest place.` });
      steps.push({ text: `The first place that is different is the ${PLACES[at]}: ${String(a)[len(a) - 1 - at]} and ${String(b)[len(b) - 1 - at]}.` });
    }
    steps.push({ text: `So ${fmt(a)} is ${SIGN_WORDS[sign]} ${fmt(b)}: ${fmt(a)} ${sign} ${fmt(b)}` });
    return {
      ...base,
      ask: `${fmt(a)} ☐ ${right}`,
      say: `Which sign goes between ${a} and ${wide ? parts(b).map((p) => p.value).join(' plus ') : b}: less than, equals, or greater than?`,
      answer: { kind: 'choice', options: ['<', '=', '>'], value: sign },
      steps,
      picture: null,
      hint: 'Do both numbers have the same number of digits? If they do, which is the first place, from the left, where they are different?',
      words: ['less than', 'greater than', 'equals', 'place value'],
    };
  }

  if (key === 'order') {
    const n = makeNumber(rng, d);
    const count = rng.pick([3, 4]);
    const all = new Set([n]);
    while (all.size < count) all.add(nearby(rng, n, minD, top));
    const list = rng.shuffle([...all]);
    const sorted = list.slice().sort((x, y) => x - y);
    return {
      ...base,
      ask: `Put these in order, smallest first: ${list.map(fmt).join(', ')}`,
      say: `Put these in order, smallest first: ${list.join(', ')}`,
      answer: { kind: 'order', values: sorted },
      steps: [
        { text: 'Count the digits first: fewer digits means a smaller number.' },
        { text: 'For numbers with the same number of digits, compare from the biggest place.' },
        { text: `Smallest first: ${sorted.map(fmt).join(', ')}` },
      ],
      picture: null,
      hint: 'Which numbers have the fewest digits? For numbers the same length, which place is the first to be different?',
      words: ['ascending order', 'place value'],
    };
  }

  if (key.startsWith('round-')) {
    const p = Number(key.slice(6));
    const k = len(p) - 1;
    // enough digits to have something to round, and a first digit that keeps the answer in range
    const digits = Math.max(d, k + 1);
    let n;
    do n = makeNumber(rng, digits, digits >= hi ? 8 : 9); while (n % p === 0);
    const r = roundTo(n, p);
    const half = r.down + p / 2;
    return {
      ...base,
      ask: `Round ${fmt(n)} to the nearest ${ONE[k]}: ☐`,
      say: `Round ${n} to the nearest ${ONE[k]}.`,
      answer: { kind: 'number', value: r.value },
      steps: [
        { text: `${fmt(n)} is between ${fmt(r.down)} and ☐`, value: r.up },
        { text: `Look at the next place to the right, the ${PLACES[k - 1]}: the digit is ${r.next}. ${r.next >= 5 ? '5 or more rounds up.' : 'Less than 5 rounds down.'}` },
        { text: `So ${fmt(n)} to the nearest ${ONE[k]} is ☐`, value: r.value },
      ],
      picture: {
        type: 'numberline', from: r.down, to: r.up, step: p / 10,
        marks: [{ at: r.down, label: fmt(r.down) }, { at: half, label: fmt(half) }, { at: r.up, label: fmt(r.up) }],
        point: { at: n, label: fmt(n) },
        working: true, // which two it is between is her first step
      },
      hint: `Which two ${PLACES[k]} is it between? Is it closer to the lower one or the higher one?`,
      words: ['round', 'nearest', 'estimate'],
      // the halfway number, where n is not on it
      ...(n === half ? { why: { 'pv-halfway': 'this number is exactly halfway' } } : {
        ways: {
          'pv-halfway': () => ({
            steps: [
              { text: `${fmt(n)} is between ${fmt(r.down)} and ☐`, value: r.up },
              { text: 'Halfway between them is ☐', value: half },
              { text: `${fmt(n)} is ${n < half ? 'less' : 'more'} than ${fmt(half)}, so it is nearer the ${n < half ? 'lower' : 'higher'} ${ONE[k]}: ☐`, value: r.value },
            ],
            hint: `Which two ${PLACES[k]} is it between, and what number is halfway between them? Is ${fmt(n)} below it or above it?`,
            words: ['round', 'nearest', 'halfway'],
          }),
        },
      }),
    };
  }

  if (key === 'billion') {
    // "Recognise 1000 thousands is 1 million and 1000 millions is 1 billion" (Stage 3, .../stage-3/fa87632ef7)
    const to = rng.pick([6, 6, 7, 8, 3]);
    const value = 1e9 / 10 ** to;
    return {
      ...base,
      ask: `1 billion = ☐ ${PLACES[to]}`,
      say: `1 billion is how many ${PLACES[to]}?`,
      answer: { kind: 'number', value },
      steps: [
        { text: `1 billion is ${fmt(1e9)}: a 1 and nine 0s.` },
        { text: `${fmt(1e9)} ÷ ${fmt(10 ** to)} = ☐`, value },
      ],
      picture: chart(1e9, 'billions'),
      hint: `How many 0s has 1 billion, and how many has one ${ONE[to]}?`,
      words: ['regroup', 'place value'],
      // count the zeros
      ways: {
        'pv-chart': () => ({
          steps: [
            { text: '1 billion has ☐ zeros', value: 9 },
            { text: `1 ${ONE[to]} has ${to} zeros, so take them away: 9 − ${to} = ☐`, value: 9 - to },
            { text: `So the number is a 1 and ${SMALL[9 - to]} ${9 - to === 1 ? 'zero' : 'zeros'}: ☐`, value },
          ],
          hint: `Count the zeros: how many has 1 billion, and how many has 1 ${ONE[to]}? How many are left?`,
          words: ['place value', 'numeral'],
        }),
      },
    };
  }

  // regroup: "1000 thousands is 1 million" (MA3-RN-01); easy uses thousands, hundreds and tens
  const forms = opts.easy
    ? [[3, 2], [4, 3], [3, 1]]
    : [[6, 3], [6, 3], [5, 3], [6, 5], [6, 3, 'and']];
  const [from, to, grouped] = rng.pick(forms);
  const f = 10 ** (from - to);
  const c = rng.chance(0.25) ? 1 : rng.int(2, 9);
  // with 1 of the bigger place, "1 hundred thousand is 100 thousands" is the answer itself, so the steps go a place at a
  // time instead (pt32)
  const k = from - to;
  const byPlace = `Each place is worth 10 of the place to its right, and ${PLACES[to]} are ${k} ${k === 1 ? 'place' : 'places'} to the right of ${PLACES[from]}.`;
  // the place value chart's way: write the numeral, then cover the last digits; what is left counts the place asked for
  let ask, say, value, steps, written, cover;
  if (grouped) {
    const extra = rng.int(1, 999);
    value = c * f + extra;
    [written, cover] = [`${c} ${unit(c, from)} and ${extra} ${unit(extra, to)}`, to];
    ask = `${c} ${unit(c, from)} and ${extra} ${unit(extra, to)} = ☐ ${PLACES[to]}`;
    say = `${c} ${unit(c, from)} and ${extra} ${unit(extra, to)} is how many ${PLACES[to]}?`;
    steps = [
      { text: `1 ${ONE[from]} is ${fmt(f)} ${PLACES[to]}, so ${c} ${unit(c, from)} is ${c} × ${fmt(f)} = ☐ ${PLACES[to]}`, value: c * f },
      { text: `${fmt(c * f)} + ${extra} = ☐`, value },
    ];
  } else if (rng.chance(0.5)) {
    value = c * f;
    [written, cover] = [`${c} ${unit(c, from)}`, to];
    ask = `${c} ${unit(c, from)} = ☐ ${PLACES[to]}`;
    say = `${c} ${unit(c, from)} is how many ${PLACES[to]}?`;
    steps = c === 1
      ? [{ text: byPlace }, { text: `1 × ${Array(k).fill(10).join(' × ')} = ☐`, value }]
      : [{ text: `1 ${ONE[from]} is ${fmt(f)} ${PLACES[to]}.` }, { text: `${c} × ${fmt(f)} = ☐`, value }];
  } else {
    value = c;
    [written, cover] = [`${fmt(c * f)} ${PLACES[to]}`, from];
    ask = `${fmt(c * f)} ${PLACES[to]} = ☐ ${PLACES[from]}`;
    say = `${c * f} ${PLACES[to]} is how many ${PLACES[from]}?`;
    steps = [
      { text: c === 1 ? byPlace : `${fmt(f)} ${PLACES[to]} make 1 ${ONE[from]}.` },
      { text: `${fmt(c * f)} ÷ ${c === 1 ? Array(k).fill(10).join(' ÷ ') : fmt(f)} = ☐`, value },
    ];
  }
  return {
    ...base,
    ask, say,
    answer: { kind: 'number', value },
    steps,
    picture: chart(c * 10 ** from, PLACES[from]),
    hint: `How many ${PLACES[to]} make one ${ONE[from]}?`,
    words: ['regroup', 'place value'],
    ways: {
      'pv-chart': () => ({
        steps: [
          { text: `Write ${written} in numerals: ☐`, value: value * 10 ** cover },
          { text: `Cover the last ${cover === 1 ? 'digit' : `${SMALL[cover]} digits`}, and what is left counts the ${PLACES[cover]}: ☐`, value },
        ],
        hint: `Write it in numerals first. Which digits are left when you cover the last ${SMALL[cover]}?`,
        words: ['regroup', 'numeral'],
      }),
    },
  };
}

// ---- pv-x10: a sprint skill, so every item is one quick step ----
const X10 = ['x10', 'x100', 'x1000', 'div10', 'div100', 'div1000', 'missing-x', 'missing-div', 'as-large'];
const X10_EASY = ['x10', 'x100', 'div10', 'div100', 'missing-x', 'missing-div', 'as-large'];

function x10Item(skillId, rng, opts) {
  const key = opts.key || rng.pick(opts.easy ? X10_EASY : X10);
  const fixed = key.match(/\d+$/);
  // "Recognise and represent numbers that are 10, 100 or 1000 times as large" (MA2-RN-01, l.52, .../stage-2/fa1dbb9271):
  // as-large takes 1000 too at her usual level
  const p = fixed ? Number(fixed[0]) : rng.pick(opts.easy ? [10, 100] : [10, 100, 1000]);
  const z = len(p) - 1;
  const moves = `${z} place${z > 1 ? 's' : ''}`;
  // the smaller number: one to three digits that matter, then perhaps zeros (7, 52, 340, 608)
  let small;
  do {
    small = opts.easy ? rng.int(1, 9) * rng.pick([1, 10]) : rng.int(1, rng.pick([9, 99, 999])) * rng.pick([1, 1, 10, 100]);
  } while (small * p > 9999999);
  const big = small * p;
  // "every digit moves", not "add a zero": the rule that still works for decimals in release 2
  const left = `every digit moves ${moves} to the left, and 0s fill the empty places`;
  const right = `every digit moves ${moves} to the right`;
  const item = (ask, say, value, steps, start, hint) => ({
    skill: skillId, key, ask, say,
    answer: { kind: 'number', value },
    steps,
    picture: { type: 'placevalue', value: start, columns: Math.max(3, len(big)) },
    hint,
    words: ['place value', 'digit'],
  });
  const moveHint = (op) => `When you ${op} by ${fmt(p)}, which way do the digits move, and how many places?`;
  const undoHint = (op) => `What undoes ${op} ${fmt(p)}? Put your answer in the box: does the sentence work?`;
  // rename the units: × 100 makes each one a hundred, so 52 × 100 is 52 hundreds; ÷ 100 asks how many hundreds
  const units = `${fmt(small)} ${unit(small, z)}`;
  const rename = (steps, hint) => ({ ways: { 'pv-rename': () => ({ steps, hint, words: ['place value', 'regroup'] }) } });
  const toUnits = (why, what) => rename([{ text: why }, { text: `${units} = ☐`, value: big }], `How many ${PLACES[z]} is ${what}? What number is that many ${PLACES[z]}?`);
  const fromUnits = (why) => rename([{ text: why }, { text: `${fmt(big)} is ☐ ${unit(small, z)}`, value: small }], `How many ${PLACES[z]} make ${fmt(big)}?`);
  if (key.startsWith('x')) {
    return { ...item(`${fmt(small)} × ${fmt(p)} = ☐`, `${small} times ${p}`, big,
      [{ text: `× ${fmt(p)}: ${left}.` }, { text: `${fmt(small)} × ${fmt(p)} = ☐`, value: big }], small, moveHint('multiply')),
    ...toUnits(`× ${fmt(p)} makes each one a ${ONE[z]}: ${fmt(small)} × ${fmt(p)} is ${units}.`, `${fmt(small)} × ${fmt(p)}`) };
  }
  if (key.startsWith('div')) {
    return { ...item(`${fmt(big)} ÷ ${fmt(p)} = ☐`, `${big} divided by ${p}`, small,
      [{ text: `÷ ${fmt(p)}: ${right}.` }, { text: `${fmt(big)} ÷ ${fmt(p)} = ☐`, value: small }], big, moveHint('divide')),
    ...fromUnits(`÷ ${fmt(p)} asks how many ${PLACES[z]} make ${fmt(big)}.`) };
  }
  if (key === 'missing-x') {
    return { ...item(`☐ × ${fmt(p)} = ${fmt(big)}`, `What times ${p} makes ${big}?`, small,
      [{ text: `Undo × ${fmt(p)} with ÷ ${fmt(p)}: ${right}.` }, { text: `${fmt(big)} ÷ ${fmt(p)} = ☐`, value: small }],
      big, undoHint('×')),
    ...fromUnits(`× ${fmt(p)} makes each one a ${ONE[z]}, so the missing number is how many ${PLACES[z]} make ${fmt(big)}.`) };
  }
  if (key === 'missing-div') {
    return { ...item(`☐ ÷ ${fmt(p)} = ${fmt(small)}`, `What divided by ${p} is ${small}?`, big,
      [{ text: `Undo ÷ ${fmt(p)} with × ${fmt(p)}: ${left}.` }, { text: `${fmt(small)} × ${fmt(p)} = ☐`, value: big }],
      small, undoHint('÷')),
    ...toUnits(`÷ ${fmt(p)} counts the ${PLACES[z]}, so the missing number is ${units}.`, 'the missing number') };
  }
  return {
    ...item(`${fmt(p)} times as large as ${fmt(small)} is ☐`, `What is ${p} times as large as ${small}?`, big,
      [{ text: `${fmt(p)} times as large means × ${fmt(p)}: ${left}.` }, { text: `${fmt(small)} × ${fmt(p)} = ☐`, value: big }],
      small, moveHint('multiply')),
    words: ['place value', 'times as large'],
    ...toUnits(`${fmt(p)} times as large makes each one a ${ONE[z]}: ${fmt(p)} times as large as ${fmt(small)} is ${units}.`, `${fmt(p)} times as large as ${fmt(small)}`),
  };
}

export default {
  skills: ['pv-10k', 'pv-millions', 'pv-x10'],
  // the way she learned is each kind's own steps; its second ways come beside them (engine/items/ways.js)
  make(skillId, rng, opts = {}) {
    return withWays(skillId, rng, opts, (r, draw) => (skillId === 'pv-x10' ? x10Item(skillId, r, draw) : pvItem(skillId, r, draw)));
  },
};
