// Numbers in words, the game's own: the words the place-value skills write ("one hundred and eight thousand, four hundred
// and thirty-two", engine/items/placevalue.js inWords) read back as digits, so a sentence that names a number in words
// is said from the same recorded number pieces as one that writes it in digits (plans/2026-10-26-guide-pieces-plan.md);
// a number in words as the voice and its check say it (inWords, sayNumber); and the symbols as the voice model reads
// them (symbolWords), shared by tools/voice.mjs and the pieces' keys, so the words the voice reads are made in one place.

const ONES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const VALUE = Object.fromEntries([...ONES.map((w, i) => [w, i + 1]), ...TEENS.map((w, i) => [w, i + 10]), ...TENS.map((w, i) => [w, (i + 2) * 10])]);
const SCALE = { thousand: 1e3, million: 1e6, billion: 1e9 };
const UNDER20 = ['zero', ...ONES, ...TEENS];

// One number in words, as a regular expression's source (js/pieces.js scans sentences with it): a group under 1,000
// ("seven", "forty-two", "three hundred and six"), then the scales biggest first, each after its own group and a comma,
// and the last group after a comma, or after "and" when it is under 100 ("one million and seventy-eight").
const B100 = `(?:(?:${TENS.join('|')})(?:-(?:${ONES.join('|')}))?|${TEENS.join('|')}|${ONES.join('|')})\\b`;
const GROUP = `(?:(?:${ONES.join('|')}) hundred\\b(?: and ${B100})?|${B100})`;
const LAST = `(?:, ${GROUP}| and ${B100})?`;
export const NUMBER_WORDS = `(?:${GROUP} billion\\b(?:, ${GROUP} million\\b)?(?:, ${GROUP} thousand\\b)?${LAST}`
  + `|${GROUP} million\\b(?:, ${GROUP} thousand\\b)?${LAST}|${GROUP} thousand\\b${LAST}|${GROUP})`;
const WHOLE = new RegExp(`^${NUMBER_WORDS}$`);

// Number words to their digits: "one hundred and eight thousand, four hundred and thirty-two" -> "108432"; null when
// the text is not one number.
export function wordNumber(text) {
  const said = String(text).trim();
  if (!WHOLE.test(said)) return null;
  let total = 0, group = 0;
  for (const w of said.replace(/,/g, ' ').split(/[\s-]+/)) {
    if (w === 'and') continue;
    if (w === 'hundred') group *= 100;
    else if (w in SCALE) { total += group * SCALE[w]; group = 0; }
    else group += VALUE[w];
  }
  return String(total + group);
}

// A number under 1,000 in words: "three hundred and forty-five", "zero".
export function under1000(n) {
  const h = Math.floor(n / 100), r = n % 100;
  const rest = r < 20 ? UNDER20[r] : TENS[Math.floor(r / 10) - 2] + (r % 10 ? `-${ONES[r % 10 - 1]}` : '');
  return h ? `${ONES[h - 1]} hundred${r ? ` and ${rest}` : ''}` : rest;
}

// A whole number in words, as Whisper's check writes it (num2words): "sixty-two thousand, three hundred and ninety-eight".
export function inWords(n) {
  const parts = [];
  for (const [size, name] of [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']]) {
    if (n >= size) { parts.push(`${under1000(Math.floor(n / size))} ${name}`); n %= size; }
  }
  if (!parts.length) return under1000(n);
  return n ? `${parts.join(', ')}${n < 100 ? ' and ' : ', '}${under1000(n)}` : parts.join(', ');
}

// The longest number the pieces say: 999 999 999 999 (twelve digits, up to the hundred billions)
export const MOST_DIGITS = 12;

// A tone's mark: a continuing piece ends in a comma, a final one in its sentence's end mark ('final' is a full stop).
export const toneMark = (tone) => (tone === 'cont' ? ',' : tone === 'final' ? '.' : tone);

// A number as its parts, as inWords says it: each group of three that is not 0, with its value, and its scale; "and"
// before a last group under 100 when a higher group is there. "1000078" -> one (1) | million | and | seventy-eight (78),
// each { words, kind: 'number' | 'scale' | 'and', value? }; null past twelve digits.
export function numberParts(digits) {
  const d = String(digits).replace(/^0+(?=\d)/, '');
  if (!/^\d+$/.test(d) || d.length > MOST_DIGITS) return null;
  const groups = [];
  for (let end = d.length; end > 0; end -= 3) groups.unshift(Number(d.slice(Math.max(0, end - 3), end)));
  const names = ['billion', 'million', 'thousand', ''].slice(4 - groups.length);
  const out = [];
  groups.forEach((g, i) => {
    if (g === 0 && groups.length > 1) return;
    if (!names[i] && out.length && g < 100) out.push({ words: 'and', kind: 'and' });
    out.push({ words: under1000(g), kind: 'number', value: g });
    if (names[i]) out.push({ words: names[i], kind: 'scale' });
  });
  return out;
}

// A number as its piece keys, the last taking the tone ('cont', 'final' or an end mark): "345278" -> three hundred and
// forty-five, | thousand, | two hundred and seventy-eight. ; null past twelve digits.
export function sayNumber(digits, tone) {
  return numberParts(digits)?.map((p, i, all) => p.words + (i === all.length - 1 ? toneMark(tone) : ',')) ?? null;
}

// The game's symbols as the voice model means them (tools/voice.mjs ttsText is this): "=" "is" and "+" "plus", each after
// a space and before a space, comma, semicolon or colon ("before +, so"; "Tap =." names the key), "<" "less than", a
// glued "0s" "zeros", "fete" as Australians say it; no space left before a mark. A sentence comes as js/speech.js says
// it, its decimals already words ("0 point 4 5"), by the one rule there.
export function symbolWords(text) {
  return text
    .replace(/"="/g, '"equals"')
    .replace(/(?<=\s)=(?=[\s,;:])/g, 'is')
    .replace(/(?<=\s)\+(?=[\s,;:])/g, 'plus')
    .replace(/(?<![\d.])\b0s\b/g, 'zeros') // "fill with 0s", never the end of a time ("5.0s")
    .replace(/\bfete\b/g, 'fate') // as Australians say it; the model said "fet" (24 October 2026)
    .replace(/</g, 'less than')
    .replace(/>/g, 'greater than')
    .replace(/\s+([,?.!])/g, '$1');
}
