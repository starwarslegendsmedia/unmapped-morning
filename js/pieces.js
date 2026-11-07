// The guide's pieces (plans/2026-10-26-guide-pieces-plan.md, "Slots and fragments"): a sentence as js/speech.js says it
// (after words()), cut into its slots, the parts that change from problem to problem (a number, in digits or in words; a
// plural such as "0s" or "200 000s"; a name from the word problems), and the fragments of words between them, so a line
// with no whole sound file can be said from pieces recorded once each ("Piece keys"), each piece's file played after its
// gap. This file imports nothing from speech.js, so speech.js can import it.
import { NAMES } from '../content/word-problems/settings.js';
import { wordNumber, NUMBER_WORDS, MOST_DIGITS, inWords, numberParts, symbolWords } from './numbers.js';

export const SLOT = { frag: 'frag', number: 'number', plural: 'plural', name: 'name' };

// The silence before each piece, in seconds: after a written comma, semicolon or colon, or a dropped mark, the comma
// gap; otherwise a slot's or a fragment's. Changed only by the trial (the plan's step 3).
export const GAP = { slot: 0.06, frag: 0.06, comma: 0.14 };
// One scan, left to right: a plural first ("0s", "1000s", "200 000s"), then a number in digits, grouped in threes or not, a
// number in words (not when a scale word with s follows it: "3 ten thousands", "hundred thousands" stay words), a name
// with its 's
const SCAN = new RegExp([
  '(?<plural>\\b(?:\\d{1,3}(?: \\d{3})*|\\d{4})s\\b)',
  '(?<number>\\d{1,3}(?: \\d{3})+(?!\\d)|\\d+)',
  `(?<words>\\b${NUMBER_WORDS}(?! (?:hundred|thousand|million|billion)s\\b))`,
  `(?<name>\\b(?:${[...NAMES].sort((a, b) => b.length - a.length).join('|')})(?:'s)?\\b)`,
].join('|'), 'g');

// A place's name, not a number, when it follows a digit or one of these words: "1 ten thousand", "one ten million",
// "Each ten thousand is 10 000", "the nearest ten thousand"
const PLACE_AFTER = /(?:\d|\b(?:one|[Ee]ach|lower|upper|nearest)) $/;

// The slots of a sentence, each with where it starts and ends. A number in words is a slot when it is two or more
// words, or one word from twenty up: a lone "one" or "nine" in prose ("one part", "nine 0s") stays in its fragment, and
// so does a place's name.
function slots(text) {
  const out = [];
  for (const m of text.matchAll(SCAN)) {
    const { plural, number, words, name } = m.groups;
    let token;
    if (plural) token = { kind: SLOT.plural, digits: plural.slice(0, -1).replace(/ /g, '') };
    else if (number) {
      const digits = number.replace(/ /g, '');
      token = digits.length > MOST_DIGITS ? { kind: SLOT.number, refused: true } : { kind: SLOT.number, digits };
    } else if (words) {
      const digits = wordNumber(words);
      if (!/[ -]/.test(words) && Number(digits) < 20) continue;
      if (/^(?:ten|hundred)\b/.test(words) && PLACE_AFTER.test(text.slice(0, m.index))) continue;
      token = { kind: SLOT.number, digits, words: true };
    } else token = { kind: SLOT.name, text: name };
    out.push({ start: m.index, end: m.index + m[0].length, token });
  }
  return out;
}

// A fragment as it is said: a quote or bracket touching a slot is dropped ('"seven hundred and ninety-six": a', '(3 + 4)
// take away'), and every other bracket, the words around it joined by one space ("(write a" is "write a", "thousand), so"
// is "thousand, so"), then the spaces, then a leading comma, semicolon or colon (", spent" is "spent", lead: true); one
// with no letter, digit or symbol left is dropped (null).
function fragment(raw, afterSlot, beforeSlot) {
  let text = raw;
  if (afterSlot) text = text.replace(/^[")]+/, '');
  if (beforeSlot) text = text.replace(/["(]+$/, '');
  text = text.replace(/\s*[()]+\s*/g, (m, i, s) => (i && /^[^\s,;:.!?]/.test(s.slice(i + m.length)) ? ' ' : ''));
  text = text.trim();
  const lead = /^[,;:]/.test(text);
  text = text.replace(/^[,;:]+\s*/, '');
  return /^[\p{P}\s]*$/u.test(text) ? null : { text, lead };
}

// an end mark alone, quotes and brackets aside: the mark, or null
const endAlone = (text) => /^[.!?]$/.exec(text.replace(/["()\s]/g, ''))?.[0] ?? null;

// A sentence's slots and fragments in order: { kind: 'frag', text }, { kind: 'number', digits }, { kind: 'plural',
// digits }, { kind: 'name', text }, a number in words marked words: true; a slot followed by nothing but an end mark
// (quotes and brackets aside: 'Say "forty-two."', '… make one hundred thousand).') is final, final: that mark ('.', '!'
// or '?'); a number of more than 12 digits is refused, { kind: 'number', refused: true }. A piece after a written comma,
// semicolon or colon, or after a dropped fragment of marks alone, is marked comma: true (never the first).
export function tokenise(sentence) {
  const text = String(sentence).replace(/\u00a0/g, ' ');
  const out = [];
  let at = 0;
  let comma = false; // the gap before the next piece is the comma gap
  const push = (token) => {
    out.push(comma && out.length ? { ...token, comma: true } : token);
    comma = token.kind === SLOT.frag && /[,;:]$/.test(token.text);
  };
  const between = (raw, beforeSlot) => {
    const frag = fragment(raw, at > 0, beforeSlot);
    if (frag) {
      comma ||= frag.lead;
      push({ kind: SLOT.frag, text: frag.text });
    } else if (raw.trim()) {
      comma = true;
      const last = out.at(-1);
      if (last && last.kind !== SLOT.frag && endAlone(raw)) last.final = endAlone(raw);
    }
  };
  for (const s of slots(text)) {
    between(text.slice(at, s.start), true);
    push({ ...s.token });
    at = s.end;
  }
  const rest = text.slice(at);
  const last = out.at(-1);
  if (last && last.kind !== SLOT.frag && endAlone(rest)) last.final = endAlone(rest);
  else between(rest, false);
  return out;
}

// The sentence with each slot written as its kind: "It is N.", "Tap Ns.", "NAME's family drove N kilometres."
export function shape(sentence) {
  const text = String(sentence).replace(/\u00a0/g, ' ');
  let out = '', at = 0;
  for (const { start, end, token } of slots(text)) {
    out += text.slice(at, start) + (token.kind === SLOT.number ? 'N' : token.kind === SLOT.plural ? 'Ns'
      : token.text.endsWith("'s") ? "NAME's" : 'NAME');
    at = end;
  }
  return out + text.slice(at);
}

// A word made plural as the hearing check makes it (scripts/voices/hear.py plural): "sixes", "twenties", "zeros".
const plural = (w) => (w.endsWith('x') ? `${w}es` : w.endsWith('y') ? `${w.slice(0, -1)}ies` : `${w}s`);

// A sentence as its pieces, in order: { key, kind, gap, digits? }, kind 'number' (a group under 1,000, with its digits),
// 'scale', 'plural', 'name' or 'frag' ("and" and "point" are words, so fragments); null when a number is refused. A key
// is the piece's words and its tone: a continuing piece ends in a comma, a final one in the end mark that followed it,
// and a fragment that ends the sentence is as written; a fragment's words are the voice model's (symbolWords: "=" "is").
// tokens are the sentence's own, when the caller has them already.
export function piecesOf(sentence, tokens = tokenise(sentence)) {
  const out = [];
  for (const [i, t] of tokens.entries()) {
    const tone = t.final || ',';
    const gap = t.comma ? GAP.comma : t.kind === SLOT.frag ? GAP.frag : GAP.slot;
    if (t.kind === SLOT.number) {
      const parts = t.refused ? null : numberParts(t.digits);
      if (!parts) return null;
      parts.forEach(({ words, kind, value }, n) => {
        const key = words + (n === parts.length - 1 ? tone : ',');
        if (kind === SLOT.number) out.push({ key, kind, gap: n ? GAP.slot : gap, digits: String(value) });
        else out.push({ key, kind: kind === 'and' ? SLOT.frag : kind, gap: n ? GAP.slot : gap });
      });
    } else if (t.kind === SLOT.plural) {
      if (t.digits.length > MOST_DIGITS) return null;
      out.push({ key: plural(inWords(Number(t.digits))) + tone, kind: SLOT.plural, gap });
    } else if (t.kind === SLOT.name) out.push({ key: t.text + tone, kind: SLOT.name, gap });
    else {
      const said = symbolWords(` ${t.text} `).trim();
      const key = i === tokens.length - 1 || said.endsWith(',') ? said : `${said},`;
      out.push({ key, kind: SLOT.frag, gap });
    }
  }
  return out;
}

// The piece keys of a sentence, in order ("It is 3 point 4 5." -> It is, | three, | point, | four, | five.); null when a
// number in it is refused.
export function pieceKeys(sentence) {
  return piecesOf(sentence)?.map((p) => p.key) ?? null;
}

// A sentence as the pieces' files and the silence before each, [{ file, gap }], from table (voices/pieces.json's table
// for the voice: key -> 'guide/<hash>.m4a'); null when a key has no file or a number is refused.
export function assemble(sentence, table) {
  const list = piecesOf(sentence);
  if (!list) return null;
  const out = [];
  for (const { key, gap } of list) {
    const file = table?.[key];
    if (typeof file !== 'string') return null;
    out.push({ file: `voices/pieces/${file}`, gap });
  }
  return out;
}
