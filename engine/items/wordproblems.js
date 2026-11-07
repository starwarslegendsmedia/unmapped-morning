// Word problems taught by their underlying structure (IES 2021 Rec. 5): Change, Combine, Compare and Equal
// groups. "It is not useful to associate a problem type with an operation", so a Change problem may be
// solved by adding or by subtracting, with its start, its change or its result unknown, and "more" in a
// Compare problem sometimes means subtract. Every item also carries its type (problemType), the type
// names she chooses from (typeOptions) and the number sentence that solves it (sentence). The steps follow
// the prompt card: read it, name its type, find the question, find what we know, then calculate.
// NSW: MA3-AR-01 (adding and subtracting, numbers to 3–4 digits), MA3-MR-01 (multiplying and dividing,
// remainders interpreted in context), and for two-step problems MA3-MR-02 (the number sentence with brackets where the
// order needs them, "Investigate the order of operations using real-life contexts"). The people, places and things are
// in content/word-problems/.
// marks: where the story's numbers and doing-words are, for the screen to mark them for her and later for her to find
// (research 2.5; the doing-words are [bracketed] where each story is written, content/word-problems/settings.js).
// A two-step problem's picture is a bar model, a bar for each step ("Solve word problems, including multistep problems",
// MA3-AR-01, Stage 3 Additive relations A, saved copy l.41; "Represent solutions to addition and subtraction problems,
// including word problems, using an empty number line or bar model", MA2-AR-01, Stage 2 Additive relations A, saved copy
// l.58; research 15.11, pictures tied to the written sum), which she later builds herself (js/runner.js buildBar).

import { fmt, thousandths, sameAmount } from '../check.js';
import { jumpsUp, partsOf, wayFor, wayFits, methodsOf, estimateOf, estimateFits, estimateStep, estimateWords, METHODS, DSIGN } from '../methods.js';
import { withWays } from './ways.js';
import { thOf } from './decimals.js';
import { makeRng } from '../rng.js';
import { NAMES, COLLECTIONS, PLACES, WHOLES, EQUAL_GROUPS, MULTISTEP, DECIMALS, DECIMAL_KINDS } from '../../content/word-problems/settings.js';

// problemType -> the name she sees, for finding the right one in typeOptions
export const TYPE_NAMES = { change: 'Change', combine: 'Combine', compare: 'Compare', 'equal-groups': 'Equal groups', multistep: 'More than one step' };
const ORDER = Object.values(TYPE_NAMES);
const OPTIONS = {
  'wp-change-combine': ['Change', 'Combine', 'Compare'],
  'wp-compare': ['Change', 'Combine', 'Compare'],
  'wp-equal-groups': ['Change', 'Combine', 'Compare', 'Equal groups'],
  'wp-decimals': ['Change', 'Combine', 'Compare'],
};

const cap = (t) => t[0].toUpperCase() + t.slice(1);
const mid = (who) => (who.startsWith('The ') ? `the${who.slice(3)}` : who); // "the zoo" inside a sentence
const fill = (text, vals) => text.replace(/\{(\w+)\}/g, (m, k) => (k in vals ? (typeof vals[k] === 'number' ? fmt(vals[k]) : vals[k]) : m));

// amounts in a setting: "245 shells" or "$245"
const show = (s, n) => (s.money ? `$${fmt(n)}` : fmt(n));
const amt = (s, n) => (s.money ? `$${fmt(n)}` : `${fmt(n)} ${s.things}`);
const more = (s, n) => (s.money ? `$${fmt(n)} more` : `${fmt(n)} more ${s.things}`);
const fewer = (s, n) => (s.money ? `$${fmt(n)} less` : `${fmt(n)} fewer ${s.things}`);
const howMany = (s) => (s.money ? 'How much money' : `How many ${s.things}`);
const some = (s, extra = '') => (s.money ? `some ${extra}money` : `some ${extra}${s.things}`);

// A story written with its doing-words in [brackets]: the words as she reads them, and where each doing-word is.
function unmark(text) {
  let out = '';
  const doing = [];
  for (const part of text.split(/(\[[^\]]*\])/)) {
    if (!part.startsWith('[')) { out += part; continue; }
    doing.push({ from: out.length, to: out.length + part.length - 2, kind: 'doing' });
    out += part.slice(1, -1);
  }
  return { text: out, doing };
}
// a number as the story shows it: "245", "$245", "12 345" (its groups joined by a no-break space, engine/check.js fmt),
// and an amount with a point as one number, "$3.45", "2.75", "0.50" (stage 6), never the full stop after one
export const NUMBER = /\$?(?:\d{1,3}(?:[ \u00a0]\d{3})+(?!\d)|\d+)(?:\.\d+)?/g;
const marked = (s, w) => s.replace(new RegExp(` (${w})\\b`), ' [$1]'); // "38 more shells" -> "38 [more] shells"

// the last sentence of a template is its question
function splitQuestion(text) {
  const at = text.lastIndexOf('. ');
  return [text.slice(0, at + 1), text.slice(at + 2)];
}

// two parts and their whole: totals to 100 when easy, otherwise up to what is believable in the setting
function parts(rng, opts, max) {
  const top = opts.easy ? Math.min(100, max) : max;
  const whole = rng.int(opts.easy ? 10 : Math.max(20, Math.floor(max / 5)), top);
  const lo = Math.max(2, Math.ceil(whole / 5));
  const p = rng.int(lo, whole - lo);
  return [p, whole - p, whole];
}

// a person, or a place with a person in it
function subject(rng, s) {
  const name = rng.pick(NAMES);
  const X = s.who ? s.who.replace(/\{name\}/g, name) : name;
  return { X, x: mid(X), intro: s.intro ? `${s.intro.replace(/\{name\}/g, name)} ` : '' };
}

// Easy problems have totals to 100, too small to believe in some settings (a long bushwalk of 48 steps, a zoo with 42
// visitors: plans/2026-10-25-answer-audit.md); each such setting says so (easy: false) and is left out of easy ones.
const believable = (list, opts) => (opts.easy ? list.filter((x) => x.easy !== false) : list);

// p.unit: the answer's unit, '$' or a plural noun; by default the setting's ('$' in a money setting). p.kind: the answer's
// kind, 'number' unless given ('decimal', its value text as the story writes it); p.first: steps after the prompt card,
// just before the working (a decimal story's estimate: she reads the story and finds what she knows before judging
// about how big, plans/2026-10-26-stage-6-step6-fixes.md, fix 7)
function item(skillId, p) {
  const { text: ask, doing } = unmark(`${p.story} ${p.question}`);
  const question = unmark(p.question).text;
  const numbers = [...ask.matchAll(NUMBER)].map((m) => ({ from: m.index, to: m.index + m[0].length, kind: 'number' }));
  return {
    skill: skillId, key: p.key,
    ask, say: ask,
    marks: [...numbers, ...doing].sort((a, b) => a.from - b.from),
    answer: { kind: p.kind ?? 'number', value: p.value },
    steps: [
      { text: 'Read it all the way through, and picture what happens.' },
      { text: `What type is it? ${p.type}` },
      { text: `What is the question? ${question}` },
      { text: `What do we know? ${p.know}` },
      ...(p.first || []),
      ...p.work,
      { text: (p.unit || (p.s.money ? '$' : p.s.things)) === '$' ? 'So the answer is $☐.' : `So the answer is ☐ ${p.unit || p.s.things}.`, value: p.value },
    ],
    picture: p.picture,
    hint: p.hint,
    words: p.words,
    problemType: p.problemType,
    typeOptions: p.typeOptions || OPTIONS[skillId],
    sentence: p.sentence,
  };
}

// ---- the second ways (engine/items/ways.js; plans/2026-10-25-two-ways-plan.md): each keeps the prompt card's four
// steps and the answer's last (the check reads its unit there), and works only the numbers already drawn ----

const between = (it, work) => [...it.steps.slice(0, 4), ...work, it.steps.at(-1)];
const own = (step) => ({ ...step, answer: true }); // the step that works out the answer itself (engine/methods.js own)
// her own go after two ways side by side is one of the same kind (js/runner.js compare passes it as key)
const keyed = (opts, re) => (typeof opts.key === 'string' ? opts.key.match(re) : null);

// NESA citations below: NSW Mathematics K–10 Syllabus (2022), the saved copies of 10 October 2026, checked live on 25 October
// 2026 (plans/2026-10-25-two-ways-survey.md).
// An empty number line ("Represent solutions to addition and subtraction problems, including word problems, using an
// empty number line or bar model", MA2-AR-01, Stage 2 Additive relations A, saved copy l.58): the story written as it
// goes, with ☐ where the unknown is, then jumps. Where the box is in the middle she counts up from one amount to the
// other ('up': "addition for subtraction", MA3-AR-01, Stage 3 Additive relations A, l.42); otherwise she jumps on ('on') or back
// ('back') from the amount she has by the other, a place at a time (36 + 27: 36 + 20, then 7, MA2-AR-01, Stage 2 Additive relations A, l.55). Four jumps
// at most, as counting on's own fit (engine/methods.js); null past that.
const MOST_JUMPS = 4;
function jumpLine(kind, a, b) {
  const parts = partsOf(b);
  const stops = kind === 'up' ? jumpsUp(a, b) : parts.reduce((at, p) => [...at, kind === 'on' ? at.at(-1) + p : at.at(-1) - p], [a]);
  const jumps = stops.slice(1).map((x, i) => Math.abs(x - stops[i]));
  if (jumps.length > MOST_JUMPS) return null;
  let steps;
  if (kind === 'up') {
    steps = jumps.map((j, i) => ({ text: `${i ? '' : `Jump up from ${fmt(a)} to ${fmt(b)}: `}${fmt(stops[i])} + ☐ = ${fmt(stops[i + 1])}`, value: j }));
    steps = jumps.length > 1 ? [...steps, own({ text: `Add the jumps: ${jumps.map(fmt).join(' + ')} = ☐`, value: b - a })] : [own(steps[0])];
  } else {
    const sign = kind === 'on' ? '+' : '−';
    steps = parts.map((p, i) => ({ text: `${i ? '' : `Jump ${kind} ${fmt(b)}${parts.length > 1 ? ' in parts' : ''}: `}${fmt(stops[i])} ${sign} ${fmt(p)} = ☐`, value: stops[i + 1] }));
    steps[steps.length - 1] = own(steps.at(-1));
  }
  const lo = Math.min(...stops), hi = Math.max(...stops);
  return {
    steps,
    // an empty number line, as counting up draws it (engine/methods.js): only its ends ticked, a jump to each stop
    picture: { type: 'numberline', from: lo, to: hi, step: hi - lo,
      jumps: stops.slice(1).map((x, i) => ({ from: stops[i], to: x, label: `${x > stops[i] ? '+' : '−'}${fmt(jumps[i])}` })),
      marks: stops.slice(1, -1).map((x) => ({ at: x, label: fmt(x) })) },
    hint: {
      up: 'Did you jump from the smaller amount up to the bigger one, and add up all the jumps?',
      on: 'Did you jump on the whole amount, a place at a time? Should the answer be more than where you started?',
      back: 'Did you jump back the whole amount, a place at a time? Should the answer be less than where you started?',
    }[kind],
    words: [kind === 'on' ? 'sum' : 'difference', 'number line'],
  };
}
// the number line way of a Change, Combine or Compare item: told, its story sentence; [kind, a, b] its jumps; first, the
// steps of the way she learned that come before the sum (who has more)
function lineWay(it, told, [kind, a, b], first = []) {
  const line = jumpLine(kind, a, b);
  if (!line) return { why: { 'number-line': 'it takes too many jumps here' } };
  const { steps, ...rest } = line;
  return { ways: { 'number-line': () => ({ steps: between(it, [...first, { text: `Write it as the story goes: ${told}.`, value: it.answer.value }, ...steps]), ...rest }) } };
}

// Why a Change with its change or its start unknown is worked as it is: said with its sum in a whole-number story, and as
// a step of its own after the estimate in a story with decimals (plans/2026-10-26-replay-findings-fixes.md, fix 6c)
const UNDO = {
  change: 'The change is the gap between the start and the end, so subtract',
  start: 'Work backwards from the end, undoing the change',
};

// Change: a start, a change and an end; any one of them unknown, the amount going up or down.
function changeItem(skillId, rng, opts) {
  const k = keyed(opts, /^change-(join|separate)-(result|change|start)$/);
  const join = k ? k[1] === 'join' : rng.chance(0.5);
  const unknown = k ? k[2] : rng.pick(['result', 'change', 'start']);
  const s = rng.pick(believable([...COLLECTIONS, ...PLACES], opts).filter((x) => x[join ? 'gain' : 'lose']));
  const { X, x, intro } = subject(rng, s);
  const [p, q, whole] = parts(rng, opts, s.max);
  // joining: start p, change q, end the whole; separating: start the whole, change q, end p
  const start = join ? p : whole, change = q, end = join ? whole : p;
  const [did, does] = s[join ? 'gain' : 'lose'];
  const changed = `${did} ${join ? more(s, change) : amt(s, change)}`; // "found 38 more shells", "spent $38"
  const story = intro + [
    unknown === 'start' ? `${X} had ${some(s)}.` : `${X} had ${amt(s, start)}.`,
    unknown === 'change' ? `${X} [${did}] ${some(s, join ? '[more] ' : '')}.` : `${X} [${did}] ${join ? marked(more(s, change), 'more') : amt(s, change)}.`,
    unknown === 'result' ? '' : `[Now] ${x} has ${amt(s, end)}.`,
  ].filter(Boolean).join(' ');
  let sentence, value, how;
  if (unknown === 'result') {
    value = end;
    sentence = `${fmt(start)} ${join ? '+' : '−'} ${fmt(change)} = ☐`;
    how = `The start ${join ? 'plus' : 'take away'} the change`;
  } else if (unknown === 'change') {
    value = change;
    sentence = join ? `${fmt(end)} − ${fmt(start)} = ☐` : `${fmt(start)} − ${fmt(end)} = ☐`;
    how = UNDO.change;
  } else {
    // working backwards undoes the change: a story where things are taken away is solved by adding
    value = start;
    sentence = join ? `${fmt(end)} − ${fmt(change)} = ☐` : `${fmt(end)} + ${fmt(change)} = ☐`;
    how = UNDO.start;
  }
  const known = (v, kind) => (unknown === kind ? '?' : v);
  const it = item(skillId, {
    key: `change-${join ? 'join' : 'separate'}-${unknown}`, s, story, value, sentence,
    question: {
      result: `${howMany(s)} does ${x} have [now]?`,
      change: `${howMany(s)} did ${x} [${does}]?`,
      start: `${howMany(s)} did ${x} have [at the start]?`,
    }[unknown],
    type: `Change: there is a start, a change and an end. The amount goes ${join ? 'up' : 'down'}.`,
    know: {
      result: `The start: ${amt(s, start)}. The change: ${changed}.`,
      change: `The start: ${amt(s, start)}. The end: ${amt(s, end)}. The change is missing.`,
      start: `The change: ${changed}. The end: ${amt(s, end)}. The start is missing.`,
    }[unknown],
    work: [{ text: `${how}: ${sentence}`, value }],
    picture: join
      ? { type: 'bar', parts: [{ label: 'start', value: known(start, 'start') }, { label: 'change', value: known(change, 'change') }], total: known(end, 'result'), totalLabel: 'end' }
      : { type: 'bar', parts: [{ label: 'end', value: known(end, 'result') }, { label: did, value: known(change, 'change') }], total: known(start, 'start'), totalLabel: 'start' },
    hint: {
      result: 'Did the amount go up or down? Should the end be more or less than the start?',
      change: 'Is your answer the change, or the end amount? Put it back into the story: does it work?',
      start: 'Put your answer in as the start and follow the story. Do you get to the end amount?',
    }[unknown],
    words: ['sum', 'difference'],
    problemType: 'change',
  });
  // on the number line: the story as it goes (245 − ☐ = 207), then count up between the two amounts it gives, or jump on
  // or back from the one it starts from (a start found by undoing a taking away jumps on from the end)
  const [sign, A, C, E] = [join ? '+' : '−', fmt(start), fmt(change), fmt(end)];
  const told = { result: `${A} ${sign} ${C} = ☐`, change: `${A} ${sign} ☐ = ${E}`, start: `☐ ${sign} ${C} = ${E}` }[unknown];
  const jumps = {
    result: [join ? 'on' : 'back', start, change],
    change: join ? ['up', start, end] : ['up', end, start],
    start: join ? ['up', change, end] : ['on', end, change],
  }[unknown];
  return { ...it, ...lineWay(it, told, jumps) };
}

// Combine: two parts and a whole, nothing changing; the whole or a part unknown.
function combineItem(skillId, rng, opts) {
  const k = keyed(opts, /^combine-(whole|part)$/);
  const findWhole = k ? k[1] === 'whole' : rng.chance(0.5);
  const kind = rng.pick(['two people', 'two kinds', 'two times']);
  let s, story, question, labels, p, q, c;
  if (kind === 'two people') {
    s = rng.pick(believable(COLLECTIONS, opts));
    [p, q, c] = parts(rng, opts, s.max);
    const [A, B] = rng.shuffle(NAMES);
    story = findWhole ? `${A} has ${amt(s, p)} and ${B} has ${amt(s, q)}.` : `${A} and ${B} have ${amt(s, c)} [altogether]. ${A} has ${amt(s, p)}.`;
    question = findWhole ? `${howMany(s)} do they have [altogether]?` : `${howMany(s)} does ${B} have?`;
    labels = [A, B];
  } else if (kind === 'two kinds') {
    const w = rng.pick(believable(WHOLES, opts));
    [p, q, c] = parts(rng, opts, w.max);
    const [one, other] = rng.shuffle(w.parts);
    s = { things: findWhole ? w.whole : other };
    story = findWhole ? `${cap(w.at)} there are ${fmt(p)} ${one} and ${fmt(q)} ${other}.` : `There are ${fmt(c)} ${w.whole} ${w.at}. ${fmt(p)} of them are ${one} and [the rest] are ${other}.`;
    question = findWhole ? `How many ${w.whole} are there [altogether]?` : `How many ${other} are there?`;
    labels = [one, other];
  } else {
    s = rng.pick(believable(PLACES, opts));
    [p, q, c] = parts(rng, opts, s.max);
    const { X, x, intro } = subject(rng, s);
    const [w0, w1] = s.when, [did, does] = s.did;
    story = intro + (findWhole
      ? `${cap(w0)} ${x} [${did}] ${amt(s, p)}. ${cap(w1)} ${x} [${did}] ${amt(s, q)}.`
      : `${X} [${did}] ${amt(s, c)} [altogether], ${w0} and ${w1}. ${cap(w0)} ${x} [${did}] ${amt(s, p)}.`);
    question = findWhole ? `${howMany(s)} did ${x} [${does}] [altogether]?` : `${howMany(s)} did ${x} [${does}] ${w1}?`;
    labels = [cap(w0), cap(w1)];
  }
  const sentence = findWhole ? `${fmt(p)} + ${fmt(q)} = ☐` : `${fmt(c)} − ${fmt(p)} = ☐`;
  const value = findWhole ? c : q;
  const it = item(skillId, {
    key: `combine-${findWhole ? 'whole' : 'part'}`, s, story, question, value, sentence,
    type: 'Combine: two parts make a whole, and nothing changes.',
    know: findWhole ? `Both parts: ${show(s, p)} and ${show(s, q)}.` : `The whole: ${show(s, c)}. One part: ${show(s, p)}.`,
    work: [{ text: `${findWhole ? 'Part + part = whole' : 'Whole − the part we know = the other part'}: ${sentence}`, value }],
    picture: { type: 'bar', parts: [{ label: labels[0], value: p }, { label: labels[1], value: findWhole ? q : '?' }], total: findWhole ? '?' : c },
    hint: findWhole ? 'Did you use both parts? Should the whole be bigger than each part?' : 'Do your answer and the part you know add up to the whole?',
    words: ['sum', 'difference', 'total'],
    problemType: 'combine',
  });
  // on the number line: jump on from one part by the other, or count up from the part to the whole
  return { ...it, ...(findWhole ? lineWay(it, `${fmt(p)} + ${fmt(q)} = ☐`, ['on', p, q]) : lineWay(it, `${fmt(p)} + ☐ = ${fmt(c)}`, ['up', p, c])) };
}

// Compare: a bigger amount, a smaller one, and the difference; any one of them unknown. In 'small-more'
// ("Ana has 23 more than Ben; Ana has 81") "more" means subtract, and in 'big-fewer' "fewer" means add.
const FORMS = ['diff-more', 'diff-fewer', 'big-more', 'big-fewer', 'small-more', 'small-fewer'];
function compareItem(skillId, rng, opts) {
  const k = keyed(opts, new RegExp(`^compare-(${FORMS.join('|')})$`));
  const form = k ? k[1] : rng.pick(FORMS);
  const person = rng.chance(0.5);
  const s = rng.pick(believable(person ? COLLECTIONS : PLACES, opts));
  const [small, d, big] = parts(rng, opts, s.max);
  const moreQ = s.money ? 'How much [more] money' : `How many [more] ${s.things}`;
  const fewerQ = s.money ? 'How much [less] money' : `How many [fewer] ${s.things}`;
  const fewerOf = (n) => marked(fewer(s, n), 'fewer|less');
  let P, Q, tell, intro = '';
  if (person) {
    [P, Q] = rng.shuffle(NAMES);
    tell = {
      has: (k, n) => `${k} has ${amt(s, n)}.`,
      more: (k, j, n) => `${k} has ${marked(more(s, n), 'more')} [than] ${j}.`,
      fewer: (k, j, n) => `${k} has ${fewerOf(n)} [than] ${j}.`,
      ask: (k) => `${howMany(s)} does ${k} have?`,
      askMore: (k, j) => `${moreQ} does ${k} have [than] ${j}?`,
      askFewer: (k, j) => `${fewerQ} does ${k} have [than] ${j}?`,
      label: (k) => k,
      bigger: `Who has more? ${P}, by ${show(s, d)}.`,
    };
  } else {
    const sub = subject(rng, s);
    const x = sub.x, [did, does] = s.did;
    intro = sub.intro;
    [P, Q] = rng.shuffle(s.when);
    tell = {
      has: (k, n) => `${cap(k)} ${x} [${did}] ${amt(s, n)}.`,
      more: (k, j, n) => `${cap(k)} ${x} [${did}] ${marked(more(s, n), 'more')} [than] ${j}.`,
      fewer: (k, j, n) => `${cap(k)} ${x} [${did}] ${fewerOf(n)} [than] ${j}.`,
      ask: (k) => `${howMany(s)} did ${x} [${does}] ${k}?`,
      askMore: (k, j) => `${moreQ} did ${x} [${does}] ${k} [than] ${j}?`,
      askFewer: (k, j) => `${fewerQ} did ${x} [${does}] ${k} [than] ${j}?`,
      label: cap,
      bigger: `When was it more? ${cap(P)}, by ${show(s, d)}.`,
    };
  }
  const [unknown, word] = form.split('-');
  let lines, question, value, sentence, how, know;
  if (unknown === 'diff') {
    lines = [tell.has(P, big), tell.has(Q, small)];
    question = word === 'more' ? tell.askMore(P, Q) : tell.askFewer(Q, P);
    value = d;
    sentence = `${fmt(big)} − ${fmt(small)} = ☐`;
    how = 'The difference is the bigger amount take away the smaller one';
    know = `${tell.label(P)}: ${amt(s, big)}. ${tell.label(Q)}: ${amt(s, small)}.`;
  } else if (unknown === 'big') {
    lines = [tell.has(Q, small), word === 'more' ? tell.more(P, Q, d) : tell.fewer(Q, P, d)];
    question = tell.ask(P);
    value = big;
    sentence = `${fmt(small)} + ${fmt(d)} = ☐`;
    how = 'The bigger amount is the smaller one plus the difference';
    know = `${tell.label(Q)}: ${amt(s, small)}. The difference: ${show(s, d)}.`;
  } else {
    lines = [tell.has(P, big), word === 'more' ? tell.more(P, Q, d) : tell.fewer(Q, P, d)];
    question = tell.ask(Q);
    value = small;
    sentence = `${fmt(big)} − ${fmt(d)} = ☐`;
    how = 'The smaller amount is the bigger one take away the difference';
    know = `${tell.label(P)}: ${amt(s, big)}. The difference: ${show(s, d)}.`;
  }
  const it = item(skillId, {
    key: `compare-${form}`, s, question, value, sentence, know,
    story: intro + (unknown === 'diff' ? lines : rng.shuffle(lines)).join(' '),
    type: 'Compare: two amounts, and the difference between them.',
    work: [...(unknown === 'diff' ? [] : [{ text: tell.bigger }]), { text: `${how}: ${sentence}`, value }],
    picture: { type: 'bar', compare: { a: { label: tell.label(P), value: unknown === 'big' ? '?' : big }, b: { label: tell.label(Q), value: unknown === 'small' ? '?' : small } } },
    hint: unknown === 'diff' ? 'Does the smaller amount plus your answer make the bigger amount?'
      : `Which amount is bigger? Should your answer be bigger or smaller than ${show(s, unknown === 'big' ? small : big)}?`,
    words: ['difference'],
    problemType: 'compare',
  });
  // on the number line the bigger amount is always to the right, whatever word the story uses: count up from the smaller
  // to the bigger, jump on from the smaller by the difference, or back from the bigger
  const S = fmt(small), D = fmt(d), B = fmt(big);
  const [told, jumps] = { diff: [`${S} + ☐ = ${B}`, ['up', small, big]], big: [`${S} + ${D} = ☐`, ['on', small, d]], small: [`☐ + ${D} = ${B}`, ['back', big, d]] }[unknown];
  return { ...it, ...lineWay(it, told, jumps, unknown === 'diff' ? [] : [{ text: tell.bigger }]) };
}

// Equal groups: the total, the size of each group or the number of groups unknown. When there is a
// remainder, the story says what it means: one more bus for the children left over (round up), or not
// enough for another full box (round down). The answer is always one number, and the step says why.
const groupsKey = (t) => `groups-${t.find}${t.round ? `-${t.round}` : ''}`;
function groupsItem(skillId, rng, opts) {
  const k = keyed(opts, /^groups-.+$/);
  const kinds = EQUAL_GROUPS.filter((g) => !opts.easy || g.each[0] <= 5); // easy: factors to 5
  const t = rng.pick(k && kinds.some((g) => groupsKey(g) === k[0]) ? kinds.filter((g) => groupsKey(g) === k[0]) : kinds);
  const hi = opts.easy ? Math.min(t.each[1], 5) : t.each[1];
  const each = rng.int(t.each[0], hi);
  const count = rng.int(t.count[0], opts.easy ? Math.min(t.count[1], 5) : t.count[1]);
  const left = t.round ? rng.int(1, each - 1) : 0;
  const total = count * each + left;
  const [story, question] = splitQuestion(fill(t.text, { name: rng.pick(NAMES), total, each, count }));
  const s = { money: t.money, things: t.find === 'groups' ? t.groups : t.item };
  const unit = t.find === 'groups' ? t.groups : t.money ? '$' : t.item; // a count of groups is never in dollars
  let value, sentence, know, work, hint;
  if (t.find === 'total') {
    value = total;
    sentence = `${count} × ${fmt(each)} = ☐`;
    know = `${count} equal groups of ${show(s, each)}.`;
    work = [{ text: `${count} groups of ${fmt(each)}: ${sentence}`, value }];
    hint = 'How many groups are there, and how many in each? Which operation puts equal groups together?';
  } else if (t.find === 'each') {
    value = each;
    sentence = `${fmt(total)} ÷ ${count} = ☐`;
    know = `${show(s, total)} shared into ${count} equal groups.`;
    work = [{ text: `Share it equally: ${sentence}`, value }];
    hint = 'Check it: does your answer times the number of groups make the total?';
  } else if (!t.round) {
    value = count;
    sentence = `${fmt(total)} ÷ ${fmt(each)} = ☐`;
    know = `${show(s, total)} altogether, in groups of ${show(s, each)}.`;
    work = [{ text: `How many lots of ${fmt(each)} fit in ${fmt(total)}? ${sentence}`, value }];
    hint = 'Check it: does your answer times the size of each group make the total?';
  } else {
    know = `${show(s, total)} altogether, in groups of ${show(s, each)}.`;
    // the remainder in words, as division's ways write it (engine/methods.js)
    // rounding down, the full groups are the answer, so no step but the box says how many (pt32)
    work = [
      { text: `How many lots of ${fmt(each)} fit in ${fmt(total)}? ${fmt(total)} ÷ ${fmt(each)} = ☐ remainder ${fmt(left)}`, value: count },
      ...(t.round === 'up' ? [{ text: `That is ${count} ${t.groups}, with ${show(s, left)} left over.` }] : []),
    ];
    if (t.round === 'up') {
      value = count + 1;
      sentence = `${count} + 1 = ☐`;
      work.push({ text: `The ${show(s, left)} left over needs one more ${t.group}: ${sentence}`, value });
      hint = `What about the ${t.money ? 'money' : t.item} left over? Is that taken care of in your answer?`;
    } else {
      value = count;
      sentence = `(${fmt(total)} − ${fmt(left)}) ÷ ${fmt(each)} = ☐`;
      work.push({ text: `The ${show(s, left)} left over is not enough for another ${t.group}.` });
      hint = `Can what is left over make another ${t.group}?`;
    }
  }
  let picture;
  if (total <= 60) picture = { type: 'groups', groups: count, each, leftover: left, find: t.find };
  else if (t.find === 'groups') picture = { type: 'bar', parts: [{ label: `1 ${t.group}`, value: each }, { label: `more ${t.groups}`, value: '?' }], total };
  else picture = { type: 'bar', parts: Array.from({ length: Math.min(count, 12) }, () => ({ label: t.group, value: t.find === 'each' ? '?' : each })), total: t.find === 'total' ? '?' : total };
  const it = item(skillId, {
    key: groupsKey(t), s, unit, story, question, value, sentence, know, work, hint, picture,
    type: `Equal groups: ${t.groups} with the same ${t.money ? 'amount' : 'number'} in each.`,
    words: t.find === 'total' ? ['product', 'equal groups'] : left ? ['quotient', 'remainder', 'equal groups'] : ['quotient', 'equal groups'],
    problemType: 'equal-groups',
  });
  return { ...it, ...buildUp(it, t, { total, each, count, left }, work.slice(1)) };
}

// Build up the groups, thinking multiplication ("This can be represented as 6 × ◻ = 24 or 24 ÷ 6 = ◻", MA2-MR-02, Stage 2 MR-B,
// l.71), in multiples she knows ("Use knowledge of multiples to partition as appropriate and divide", MA3-MR-01, Stage 3 MR-A, l.76;
// IES's worked Equal Groups problem builds them up by adding): shared, the total split into multiples of the number of
// groups; grouped, lots of each built up and what is left taken on, then what is left over as the way she learned says
// it (after); a total, the number of 10 or more split by place and each part multiplied ("the distributive property with
// partial products", MA3-MR-01, Stage 3 MR-A, l.55), which two one-digit numbers leave as one fact.
// lots: a number of groups in parts she knows (12 as 10 and 2, 7 as 5 and 2, a round 30 as 20 and 10); five or fewer,
// none: those are built up one group at a time
const lots = (q) => (q <= 5 ? null : q < 10 ? [5, q - 5] : q === 10 ? [5, 5] : partsOf(q).length > 1 ? partsOf(q) : [q - 10, 10]);
const upTo = (by, n) => Array.from({ length: n }, (_, i) => fmt((i + 1) * by)).join(', ');
function buildUp(it, t, { total, each, count, left }, after) {
  const T = fmt(total);
  let steps, hint, words;
  if (t.find === 'total') {
    // the number split: one of 10 or more, not a round one where the other is not
    const ten = [[count, each], [each, count]].filter(([x]) => x >= 10);
    if (!ten.length) return { why: { 'build-up': 'both numbers are small, so it is one fact' } };
    const [n, by] = ten.find(([x]) => x % 10) ?? ten[0];
    const parts = n === 10 ? [5, 5] : partsOf(n).length > 1 ? partsOf(n) : [n - 10, 10];
    steps = [{ text: `Split ${fmt(n)} into ${parts.map(fmt).join(' + ')}.` },
      ...parts.map((p) => ({ text: `${fmt(by)} × ${fmt(p)} = ☐`, value: by * p })),
      own({ text: `Add the parts: ${parts.map((p) => fmt(by * p)).join(' + ')} = ☐`, value: total })];
    hint = 'Did you split one number into parts, multiply each part, and add the answers?';
    words = ['partition', 'product', 'equal groups'];
  } else if (t.find === 'each') {
    const parts = lots(each);
    steps = [{ text: `Write it as the story goes: ${count} × ☐ = ${T}.`, value: each },
      ...(parts ? [{ text: `Split ${T} into multiples of ${count}: ${parts.map((p) => fmt(p * count)).join(' + ')}.` },
        ...parts.map((p) => ({ text: `${count} × ☐ = ${fmt(p * count)}`, value: p })),
        own({ text: `Add them: ${parts.map(fmt).join(' + ')} = ☐`, value: each })]
        : [own({ text: `Build up ${count} at a time to ${T}: ${upTo(count, each)}. How many times? ☐`, value: each })])];
    hint = 'Did you split the total into multiples you know, and add how many each part makes?';
    words = ['multiple', 'quotient', 'equal groups'];
  } else {
    const parts = lots(count);
    // with nothing left over, the groups are the answer; rounding up, one more is still to come
    const done = (step) => (t.round === 'up' ? step : own(step));
    steps = left ? [] : [{ text: `Write it as the story goes: ☐ × ${fmt(each)} = ${T}.`, value: count }];
    if (!parts) steps.push(done({ text: `Build up in ${fmt(each)}s to ${T}: ${upTo(each, count)}. How many ${t.groups}? ☐`, value: count }));
    else {
      let have = total;
      for (const p of parts) {
        steps.push({ text: `Build up ${p} ${p === 1 ? t.group : t.groups}: ${fmt(each)} × ${p} = ☐`, value: p * each });
        if (have - p * each > 0) steps.push({ text: `What is left? ${fmt(have)} − ${fmt(p * each)} = ☐`, value: have - p * each });
        have -= p * each;
      }
      steps.push(done({ text: `Add up the ${t.groups}: ${parts.join(' + ')} = ☐`, value: count }));
    }
    steps.push(...after);
    hint = 'Did you build up groups you know until you reached the total, and add up how many groups?';
    words = left ? ['multiple', 'quotient', 'remainder', 'equal groups'] : ['multiple', 'quotient', 'equal groups'];
  }
  return { ways: { 'build-up': () => ({ steps: between(it, steps), hint, words }) } };
}

// A bar model's values: a number from the story, '?' the answer, or found(n), the first step's result, which a question
// shows as a box (js/runner.js asked) and a worked example she watches shows filled in.
const found = (n) => ({ found: n });
// a bar of equal groups: its parts, the size of each, and how many, said under it ("4 packs")
const groupsBar = (g, each, label, total) => ({ title: 'First', groups: { count: g, label }, parts: Array.from({ length: g }, () => ({ label: '', value: each })), total });

// Two steps, each one of the structures above; the sentence uses brackets where the order needs them. Its bar model has
// a bar for each step, First and Then as the steps say, the first step's result carried into the second bar.
function multiItem(skillId, rng, opts) {
  const k = keyed(opts, /^multi-(.+)$/);
  const t = rng.pick(k && MULTISTEP.some((m) => m.form === k[1]) ? MULTISTEP.filter((m) => m.form === k[1]) : MULTISTEP);
  const easy = opts.easy;
  const max = easy ? 100 : t.max || 300;
  const r = (lo, hi) => rng.int(lo, hi);
  const G = () => (easy ? r(2, 5) : r(2, 9));
  const E = () => (easy ? r(2, 5) : r(...(t.e || [3, 12])));
  const s = { money: t.money, things: t.things };
  const val = (n) => show(s, n);
  const v = {};
  let types, work, know, sentence, bars; // bars(L): the bar model, its names L as the story says them
  // the steps regrouped (a different first step, by a property of the operations), with their bars and hint; or why not
  let regroup, whyNot;
  switch (t.form) {
    case 'combine-share': { // (a + b) ÷ g
      const g = G(), each = easy ? r(2, Math.floor(100 / g)) : r(5, 40), whole = g * each;
      const lo = Math.max(2, Math.floor(whole / 5));
      // asked to regroup (opts.want), two parts that each share evenly: a multiple of g, so the other is one too
      const ks = [Math.ceil(lo / g), Math.floor((whole - lo) / g)];
      Object.assign(v, { g, a: opts.want === 'regroup' && ks[0] <= ks[1] ? g * r(...ks) : r(lo, whole - lo) });
      v.b = whole - v.a;
      types = ['Combine', 'Equal groups'];
      sentence = `(${fmt(v.a)} + ${fmt(v.b)}) ÷ ${g} = ☐`;
      know = `Two amounts, ${val(v.a)} and ${val(v.b)}, shared into ${g} equal groups.`;
      work = [{ text: `First, Combine: ${fmt(v.a)} + ${fmt(v.b)} = ☐`, value: whole }, { text: `Then, Equal groups: ${fmt(whole)} ÷ ${g} = ☐`, value: each }];
      bars = (L) => [
        { title: 'First', parts: [{ label: L.a, value: v.a }, { label: L.b, value: v.b }], total: found(whole) },
        { ...groupsBar(g, '?', L.groups, found(whole)), title: 'Then' }];
      // share each part, then add: (24 + 36) ÷ 6 is 24 ÷ 6 and 36 ÷ 6 ("258 ÷ 6 = (240 + 18) ÷ 6", MA3-MR-01, Stage 3 MR-A, l.76)
      if (v.a % g || v.b % g) whyNot = 'the parts do not share evenly, so the total must be found first';
      else {
        const [x, y] = [v.a / g, v.b / g];
        const shared = (L, title, n, part, label) => ({ ...groupsBar(g, found(part), L.groups, n), title, totalLabel: label });
        regroup = {
          work: [{ text: `First, share the first part: ${fmt(v.a)} ÷ ${g} = ☐`, value: x }, { text: `Next, share the second part: ${fmt(v.b)} ÷ ${g} = ☐`, value: y },
            own({ text: `Then add the shares: ${fmt(x)} + ${fmt(y)} = ☐`, value: each })],
          bars: (L) => [shared(L, 'First', v.a, x, L.a), shared(L, 'Next', v.b, y, L.b),
            { title: 'Then', parts: [{ label: L.a, value: found(x) }, { label: L.b, value: found(y) }], total: '?', totalLabel: 'each' }],
          hint: 'Did you share each part equally, then add the two shares?',
        };
      }
      break;
    }
    case 'groups-change': { // g × e − s
      const g = G(), e = E(), p = g * e;
      Object.assign(v, { g, e, s: r(2, p - 2) });
      types = ['Equal groups', 'Change'];
      sentence = `${g} × ${e} − ${fmt(v.s)} = ☐`;
      know = `${g} equal groups of ${val(e)}, then ${val(v.s)} taken away.`;
      work = [{ text: `First, Equal groups: ${g} × ${e} = ☐`, value: p }, { text: `Then, Change: ${fmt(p)} − ${fmt(v.s)} = ☐`, value: p - v.s }];
      bars = (L) => [groupsBar(g, e, L.groups, found(p)),
        { title: 'Then', parts: [{ label: L.taken, value: v.s }, { label: L.left, value: '?' }], total: found(p) }];
      break;
    }
    case 'change-groups': { // t − g × e, starting from a round amount
      const g = G(), e = E(), p = g * e;
      Object.assign(v, { g, e, t: (Math.floor(p / 10) + r(1, 3)) * 10 });
      types = ['Equal groups', 'Change'];
      sentence = `${fmt(v.t)} − ${g} × ${e} = ☐`;
      know = `${val(v.t)} at the start, then ${g} equal groups of ${val(e)} taken away.`;
      work = [{ text: `First, Equal groups: ${g} × ${e} = ☐`, value: p }, { text: `Then, Change: ${fmt(v.t)} − ${fmt(p)} = ☐`, value: v.t - p }];
      bars = (L) => [groupsBar(g, e, L.groups, found(p)),
        { title: 'Then', parts: [{ label: L.groups, value: found(p) }, { label: L.left, value: '?' }], total: v.t, totalLabel: L.start }];
      break;
    }
    case 'groups-combine': { // g × e + s
      const g = G(), e = E(), p = g * e;
      Object.assign(v, { g, e, s: easy ? r(2, Math.max(2, 100 - p)) : r(...(t.s || [5, 50])) });
      types = ['Equal groups', 'Combine'];
      sentence = `${g} × ${e} + ${fmt(v.s)} = ☐`;
      know = `${g} equal groups of ${val(e)}, and ${val(v.s)} more.`;
      work = [{ text: `First, Equal groups: ${g} × ${e} = ☐`, value: p }, { text: `Then, Combine: ${fmt(p)} + ${fmt(v.s)} = ☐`, value: p + v.s }];
      bars = (L) => [groupsBar(g, e, L.groups, found(p)),
        { title: 'Then', parts: [{ label: L.groups, value: found(p) }, { label: L.more, value: v.s }], total: '?' }];
      break;
    }
    case 'compare-combine': { // a + (a ± d)
      const a = easy ? r(10, 45) : r(20, Math.floor(max / 2));
      const d = t.dir === 'more' ? r(2, easy ? 100 - 2 * a : a) : r(2, a - 2);
      const b = t.dir === 'more' ? a + d : a - d, op = t.dir === 'more' ? '+' : '−';
      Object.assign(v, { a, d });
      types = ['Compare', 'Combine'];
      sentence = `${fmt(a)} + (${fmt(a)} ${op} ${fmt(d)}) = ☐`;
      know = `One amount: ${val(a)}. The other is ${t.dir === 'more' ? more(s, d) : fewer(s, d)}.`;
      work = [{ text: `First, Compare: ${fmt(a)} ${op} ${fmt(d)} = ☐`, value: b }, { text: `Then, Combine: ${fmt(a)} + ${fmt(b)} = ☐`, value: a + b }];
      // more: the second amount is the first and the difference; fewer: the first is the second and the difference
      bars = (L) => [t.dir === 'more'
        ? { title: 'First', parts: [{ label: L.a, value: a }, { label: L.diff, value: d }], total: found(b), totalLabel: L.b }
        : { title: 'First', parts: [{ label: L.b, value: found(b) }, { label: L.diff, value: d }], total: a, totalLabel: L.a },
      { title: 'Then', parts: [{ label: L.a, value: a }, { label: L.b, value: found(b) }], total: '?' }];
      // double and adjust: the first amount twice, then the difference added or taken away ("Relate doubling to
      // multiplication facts", MA2-MR-01, Stage 2 MR-A, l.53)
      regroup = {
        work: [{ text: `First, double the first amount: 2 × ${fmt(a)} = ☐`, value: 2 * a },
          own({ text: `Then ${t.dir === 'more' ? 'add' : 'take away'} the difference: ${fmt(2 * a)} ${op} ${fmt(d)} = ☐`, value: a + b })],
        bars: (L) => [{ title: 'First', parts: [{ label: L.a, value: a }, { label: L.a, value: a }], total: found(2 * a), totalLabel: 'double' },
          t.dir === 'more'
            ? { title: 'Then', parts: [{ label: 'double', value: found(2 * a) }, { label: L.diff, value: d }], total: '?' }
            : { title: 'Then', parts: [{ label: 'altogether', value: '?' }, { label: L.diff, value: d }], total: found(2 * a), totalLabel: 'double' }],
        hint: `Did you double the first amount, then ${t.dir === 'more' ? 'add' : 'take away'} the difference?`,
      };
      break;
    }
    case 'combine-compare': { // c − (a + b)
      const sum = easy ? r(10, 80) : r(Math.floor(max / 4), Math.floor((max * 2) / 3));
      const lo = Math.max(2, Math.floor(sum / 5));
      Object.assign(v, { a: r(lo, sum - lo) });
      v.b = sum - v.a;
      v.c = sum + r(2, (easy ? 100 : max) - sum);
      types = ['Combine', 'Compare'];
      sentence = `${fmt(v.c)} − (${fmt(v.a)} + ${fmt(v.b)}) = ☐`;
      know = `Two amounts, ${val(v.a)} and ${val(v.b)}, and a third amount, ${val(v.c)}.`;
      work = [{ text: `First, Combine: ${fmt(v.a)} + ${fmt(v.b)} = ☐`, value: sum }, { text: `Then, Compare: ${fmt(v.c)} − ${fmt(sum)} = ☐`, value: v.c - sum }];
      bars = (L) => [
        { title: 'First', parts: [{ label: L.a, value: v.a }, { label: L.b, value: v.b }], total: found(sum), totalLabel: 'together' },
        { title: 'Then', parts: [{ label: 'together', value: found(sum) }, { label: L.diff, value: '?' }], total: v.c, totalLabel: L.c }];
      // take each away in turn: c − (a + b) is c − a − b
      regroup = {
        work: [{ text: `First, take away the first amount: ${fmt(v.c)} − ${fmt(v.a)} = ☐`, value: v.c - v.a },
          own({ text: `Then take away the second: ${fmt(v.c - v.a)} − ${fmt(v.b)} = ☐`, value: v.c - sum })],
        bars: (L) => [{ title: 'First', parts: [{ label: L.a, value: v.a }, { label: 'rest', value: found(v.c - v.a) }], total: v.c, totalLabel: L.c },
          { title: 'Then', parts: [{ label: L.b, value: v.b }, { label: L.diff, value: '?' }], total: found(v.c - v.a), totalLabel: 'rest' }],
        hint: 'Did you take each amount away, one at a time, from the bigger one?',
      };
      break;
    }
    default: { // 'change-change': a − b − c, or a + b − c
      const up = t.ops === '+−';
      const a = up ? r(easy ? 10 : 20, easy ? 50 : Math.floor(max / 2)) : r(easy ? 20 : 60, max);
      const b = up ? r(2, easy ? 30 : Math.floor(max / 4)) : r(2, Math.floor(a / 3));
      const c = up ? r(2, a + b - 2) : r(2, Math.floor(a / 3));
      const after = up ? a + b : a - b;
      Object.assign(v, { a, b, c });
      types = ['Change', 'Change'];
      sentence = `${fmt(a)} ${up ? '+' : '−'} ${fmt(b)} − ${fmt(c)} = ☐`;
      know = `The start: ${val(a)}. Then two changes: ${val(b)} ${up ? 'added' : 'taken away'}, then ${val(c)} taken away.`;
      work = [{ text: `First, Change: ${fmt(a)} ${up ? '+' : '−'} ${fmt(b)} = ☐`, value: after }, { text: `Then, Change: ${fmt(after)} − ${fmt(c)} = ☐`, value: after - c }];
      bars = (L) => [up
        ? { title: 'First', parts: [{ label: L.start, value: a }, { label: L.b, value: b }], total: found(after), totalLabel: L.mid }
        : { title: 'First', parts: [{ label: L.b, value: b }, { label: L.mid, value: found(after) }], total: a, totalLabel: L.start },
      { title: 'Then', parts: [{ label: L.c, value: c }, { label: L.left, value: '?' }], total: found(after), totalLabel: L.mid }];
      // put the two changes together first: 120 − (35 + 25); earned and spent, what is kept of what was earned (b − c), or
      // how much more was spent (c − b) ("Use grouping symbols () in number sentences", MA3-MR-02, Stage 3 MR-B, l.69)
      const end = after - c;
      if (!up) {
        regroup = {
          work: [{ text: `First, put the two changes together: ${fmt(b)} + ${fmt(c)} = ☐`, value: b + c }, own({ text: `Then take them away together: ${fmt(a)} − ${fmt(b + c)} = ☐`, value: end })],
          bars: (L) => [{ title: 'First', parts: [{ label: L.b, value: b }, { label: L.c, value: c }], total: found(b + c), totalLabel: 'together' },
            { title: 'Then', parts: [{ label: 'together', value: found(b + c) }, { label: L.left, value: '?' }], total: a, totalLabel: L.start }],
          hint: 'Did you put the two amounts taken away together, then take them away at once?',
        };
      } else if (b >= c) {
        regroup = {
          work: [{ text: `First, put the two changes together: ${fmt(b)} − ${fmt(c)} = ☐`, value: b - c }, own({ text: `Then add what is kept: ${fmt(a)} + ${fmt(b - c)} = ☐`, value: end })],
          bars: (L) => [{ title: 'First', parts: [{ label: L.c, value: c }, { label: 'kept', value: found(b - c) }], total: b, totalLabel: L.b },
            { title: 'Then', parts: [{ label: L.start, value: a }, { label: 'kept', value: found(b - c) }], total: '?', totalLabel: L.left }],
          hint: 'Did you work out how much of the change was kept, then add it to the start?',
        };
      } else {
        regroup = {
          work: [{ text: `First, put the two changes together: ${fmt(c)} − ${fmt(b)} = ☐`, value: c - b }, own({ text: `Then take that away: ${fmt(a)} − ${fmt(c - b)} = ☐`, value: end })],
          bars: (L) => [{ title: 'First', parts: [{ label: L.b, value: b }, { label: `more ${L.c}`, value: found(c - b) }], total: c, totalLabel: L.c },
            { title: 'Then', parts: [{ label: L.left, value: '?' }, { label: `more ${L.c}`, value: found(c - b) }], total: a, totalLabel: L.start }],
          hint: 'Did you work out how much more went than came, then take that from the start?',
        };
      }
    }
  }
  const [name, name2, name3] = rng.shuffle(NAMES);
  const [story, question] = splitQuestion(fill(t.text, { ...v, name, name2, name3 }));
  const labels = Object.fromEntries(Object.entries(t.bar).map(([k, x]) => [k, fill(x, { name, name2, name3 })]));
  // the names she picks from: each step's type, "More than one step", and one more if that makes only two
  const offered = new Set([...types, TYPE_NAMES.multistep]);
  for (const n of ORDER) if (offered.size < 3) offered.add(n);
  const ops = { '+': 'sum', '−': 'difference', '×': 'product', '÷': 'quotient' };
  const it = item(skillId, {
    key: `multi-${t.form}`, s, story, question, sentence, know, work,
    value: work[work.length - 1].value,
    type: `More than one step: first ${types[0]}, then ${types[1]}.`,
    picture: { type: 'bar', rows: bars(labels) },
    hint: 'What do you need to find out first, before you can answer the question?',
    words: [...new Set(sentence.match(/[+−×÷]/g).map((o) => ops[o]))],
    problemType: 'multistep',
    typeOptions: ORDER.filter((n) => offered.has(n)),
  });
  // parts that do not share evenly say why; the three kinds whose groups must be found first keep the way she learned,
  // with no line (plans/2026-10-25-two-ways-plan.md, the kinds left with one way)
  if (whyNot) return { ...it, why: { regroup: whyNot } };
  if (!regroup) return it;
  return { ...it, ways: { regroup: () => ({
    steps: between(it, regroup.work), picture: { type: 'bar', rows: regroup.bars(labels) }, hint: regroup.hint,
    words: [...new Set(regroup.work.flatMap((st) => st.text.match(/[+−×÷]/g)).map((o) => ops[o]))],
  }) } };
}

// ---- word problems with decimals (wp-decimals; plans/2026-10-25-stage-6-plan.md, D7) ----
// MA3-AR-01: "Solve word problems involving the addition and subtraction of decimals up to 3 decimal places" (l.47),
// "Solve multistep word problems, including problems that require more than one operation" (l.41) and "Justify why the
// strategy used to solve addition and subtraction word problems is appropriate" (l.48), Stage 3 Additive relations B,
// saved copy 2026-10-10-1117-article-k-10-mathematics-k-10-syllabus-2022-fa2ebf6217.md (.../stage-3/fa2ebf6217); NSW
// Mathematics K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026. Change, Combine and Compare stories
// as above, their amounts with a point: to the cent, to 2 places of a metre or of a second, to 3 places of a kilogram
// (content/word-problems/settings.js DECIMALS). A one-step story carries its sum, d+ or d− on the amounts as written
// ('6.30'), worked by the way of adding and taking away decimals she is on (engine/methods.js wayFor, which opens with
// the estimate in wholes), with the story's bar model; the sum keeps where the draws were (story), so the second way set
// beside hers (js/runner.js compare) makes the very same story. A two-step story, a Change then a Compare, carries no sum
// and is worked by the written method: its only boxes are its two results, First and Then, as the whole-number two-step
// stories' are, each result's columns kept on its step (picture) to show one result at a time, never as more boxes; its
// two-bar model she builds on later days. Why a way suits the numbers (why-way, l.48, whose live example chooses adding
// "to find the difference because it is easier than subtraction" for 2.14 m and 1.4 m): a story, the way someone worked
// it, and three reasons to choose from, the numbers drawn so exactly one is true. Chosen for this game, not a syllabus
// requirement: no answer is a whole number or ends in 0 (a step would show $4.70 as 4.7), no estimate is 0, every amount
// in a story is different, and no trade crosses an empty place (adding and subtracting decimals has those).

const D_TYPES = ['change', 'combine', 'compare'];
const D_KEYS = [...D_TYPES, 'two-step', 'why-way'];
// the three reasons a way suits the numbers, one for each way, word for word as the plan gives them (D7)
export const REASONS = {
  'dec-count-up': 'The numbers are less than 1 apart, so the jumps up are short.',
  'dec-split': 'No place needs a trade, so each place can be done on its own.',
  'dec-column': 'Two or more places need a trade, and the columns keep track of them.',
};
const WHY_STEPS = ['Look at each place: does it need a trade?', 'How far apart are the numbers?'];
const WHY_HINT = 'Which places need a trade? Are the numbers less than 1 apart?';
const uncap5 = (t) => t[0].toLowerCase() + t.slice(1);

const kindOf = (s) => DECIMAL_KINDS[s.kind];
// the answer step's unit, in words as the whole-number stories' ("☐ kilograms"); money as theirs, "$☐"
const answerUnit = (s) => kindOf(s).inWords ?? kindOf(s).unit;
const unitTh = (s) => 10 ** (3 - kindOf(s).places); // the setting's smallest place, in thousandths
// an amount in thousandths as a story writes it, to its kind's places: 6300 -> '6.30', 2375 -> '2.375'
const placed = (s, th) => `${Math.floor(th / 1000)}.${String(th % 1000).padStart(3, '0').slice(0, kindOf(s).places)}`;
// as she reads it, "$6.30", "3.75 m", "31.42 seconds", "2.375 kg", the unit after a no-break space so a line never ends
// between a number and its unit (js/speech.js reads it as a space); ofIt, with what it is of, "3.75 m of ribbon"
const said5 = (s, th) => (kindOf(s).unit === '$' ? `$${placed(s, th)}` : `${placed(s, th)} ${kindOf(s).unit}`);
const ofIt = (s, th) => (s.noun === 'money' || s.lines ? said5(s, th) : `${said5(s, th)} of ${s.noun}`);
// an empty place inside its decimals: '3.05', '2.075'
const hasEmpty = (s, th) => placed(s, th).split('.')[1].slice(0, -1).includes('0');

// The places that carry (adding) or need a trade (taking away), worked place by place in thousandths with what each
// place before it carried or traded: the count the reasons go by, and the written method's (engine/methods.js
// decColumns). plain: each place's own two digits alone, with nothing carried or traded into it.
function tradesOf({ op, a, b }, plain = false) {
  let x = thOf(a), y = thOf(b), carry = 0, n = 0;
  for (; x > 0 || y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10)) {
    const dx = x % 10, dy = y % 10, c = plain ? 0 : carry;
    carry = op === 'd+' ? (dx + dy + c >= 10 ? 1 : 0) : (dx - c < dy ? 1 : 0);
    n += carry;
  }
  return n;
}
// a taking away whose trade crosses an empty place (3.05 − 1.28: the tenths have none to give, so a one is traded down
// through them)
function crossesEmpty({ op, a, b }) {
  let x = thOf(a), y = thOf(b), borrow = 0;
  for (; op === 'd−' && (x > 0 || y > 0); x = Math.floor(x / 10), y = Math.floor(y / 10)) {
    const dx = x % 10, dy = y % 10;
    if (borrow && dx === 0) return true;
    borrow = dx - borrow < dy ? 1 : 0;
  }
  return false;
}
// the numbers make the named way's reason true and the other two false (plan D7), the trades counted place by place the
// same whether or not what the place before carried or traded is counted in; and the way named works them, with nothing
// that stops it (partitioning refuses 18.55 − 12.04, whose tens leave 0)
function whyFits(named, sum) {
  const trades = tradesOf(sum), gap = thOf(sum.a) - thOf(sum.b);
  if (trades !== tradesOf(sum, true) || !wayFits(named, sum) || METHODS[named].stops?.(sum)) return false;
  if (named === 'dec-count-up') return sum.op === 'd−' && gap < 1000 && trades === 1;
  // 1 or more apart, adding too, so the count-up reason never reads true of the two numbers
  return (named === 'dec-split' ? trades === 0 : trades >= 2) && Math.abs(gap) >= 1000;
}

// a setting's sizes in thousandths, [least, most) inside its kind's: under 1 when easy (from 0.10)
const sizes = (s, easy) => (easy ? [100, 1000] : [Math.max(s.size[0], kindOf(s).lo ?? 0) * 1000, Math.min(s.size[1], kindOf(s).top) * 1000]);

// Three amounts with x + y = z, in thousandths, each a whole number of the setting's smallest place: z inside its sizes,
// x and y above 0. both: x inside the sizes too (two race times, two jumps); small: y under 1.
function triple(rng, s, easy, { both = false, small = false } = {}) {
  const u = unitTh(s), [lo, hi] = sizes(s, easy);
  for (;;) {
    const z = u * rng.int(lo / u, hi / u - 1), least = both ? lo : u;
    if (z - least < u) continue;
    const x = small ? z - u * rng.int(1, Math.floor(Math.min(1000 - u, z - least) / u)) : u * rng.int(least / u, (z - u) / u);
    return [x, z - x, z];
  }
}

// Each form's sum on its amounts x + y = z: [op, first, second, the answer]. Change: joining, the start x, the change y
// and the end z; separating, the start z and the end x. Combine: the parts x and y, the whole z. Compare: the smaller x,
// the difference y, the bigger z.
const FORMS5 = {
  change: ['join-result', 'join-change', 'join-start', 'separate-result', 'separate-change', 'separate-start'],
  combine: ['whole', 'part'],
  compare: ['diff-more', 'diff-fewer', 'big-more', 'big-fewer', 'small-more', 'small-fewer'],
};
const SOLVE = {
  'join-result': ['d+', 'x', 'y', 'z'], 'join-change': ['d−', 'z', 'x', 'y'], 'join-start': ['d−', 'z', 'y', 'x'],
  'separate-result': ['d−', 'z', 'y', 'x'], 'separate-change': ['d−', 'z', 'x', 'y'], 'separate-start': ['d+', 'x', 'y', 'z'],
  whole: ['d+', 'x', 'y', 'z'], part: ['d−', 'z', 'x', 'y'],
  'diff-more': ['d−', 'z', 'x', 'y'], 'diff-fewer': ['d−', 'z', 'x', 'y'], 'big-more': ['d+', 'x', 'y', 'z'], 'big-fewer': ['d+', 'x', 'y', 'z'],
  'small-more': ['d−', 'z', 'y', 'x'], 'small-fewer': ['d−', 'z', 'y', 'x'],
};
// the settings that make each type: a Change, and the change in a two-step story, needs its gain and lose
const makes = (s, type) => (type === 'change' || type === 'two-step' ? Boolean(s.gain)
  : !s.lines || (type === 'combine' ? 'whole' in s.lines : 'has' in s.lines));
// the sentences of a setting about people who have some ("Ana has 3.75 m of ribbon"), in the shape of a setting's own
function peopleLines({ noun }) {
  const of = noun === 'money' ? '' : ` of ${noun}`;
  return {
    whole: `{P} has {X}${of} and {Q} has {Y}${of}.`, askWhole: `How much ${noun} do they have [altogether]?`,
    part: `{P} and {Q} have {C}${of} [altogether]. {P} has {X}.`, askPart: `How much ${noun} does {Q} have?`,
    has: `{K} has {A}${of}.`, more: `{P} has {D} [more] ${noun} [than] {Q}.`, fewer: `{Q} has {D} [less] ${noun} [than] {P}.`,
    ask: `How much ${noun} does {K} have?`, askMore: `How much [more] ${noun} does {P} have [than] {Q}?`, askFewer: `How much [less] ${noun} does {Q} have [than] {P}?`,
  };
}

// One story of a type (draw: { easy, type, op?, named? }): its setting and form, its amounts, its words, its bar and its
// sum, the same from the same draws (js/runner.js compare makes it again). named: the way a why-way problem names, whose
// reason the numbers make true.
function decimalStory(rng, draw) {
  const { easy, type, op, named } = draw;
  const small = named === 'dec-count-up'; // less than 1 apart: the sum takes the smaller part from the whole
  const settings = believable(DECIMALS.filter((x) => makes(x, type)), { easy });
  const empty = !easy && rng.chance(0.25); // about 1 story in 4 with an empty place on purpose (3.05)
  for (;;) {
    const s = rng.pick(settings);
    const forms = FORMS5[type].filter((f) => (!op || SOLVE[f][0] === op) && (!small || (SOLVE[f][0] === 'd−' && SOLVE[f][2] === 'x')));
    const form = rng.pick(forms);
    const both = Boolean(s.lines?.has);
    const [P, Q] = rng.shuffle(NAMES);
    const thing = s.things ? rng.pick(s.things) : [];
    for (let tries = 0; tries < 200; tries++) {
      const [x, y, z] = triple(rng, s, easy, { both, small });
      const v = { x, y, z };
      const [sop, first, second, asked] = SOLVE[form];
      const sum = { op: sop, key: type, a: placed(s, v[first]), b: placed(s, v[second]) };
      const answer = v[asked];
      // an estimate of 0, or with a number rounded to 0, says nothing about how big, and one that is the answer itself
      // says the answer (fix 6)
      if (x === y || (answer / unitTh(s)) % 10 === 0 || !estimateFits(estimateOf(sum), answer)) continue;
      // every trade a simple one, from the place next to it: a trade down through an empty place (3.05 − 1.28) makes the
      // written method's step for it run past 25 words as said, with 3 places (tests/short.test.js)
      if ((easy && tradesOf(sum) > 0) || crossesEmpty(sum)) continue;
      if (empty && ![x, y, z].some((n) => hasEmpty(s, n))) continue;
      if (named && !whyFits(named, sum)) continue;
      const words = { change: changeWords, combine: combineWords, compare: compareWords }[type](rng, s, form, v, { P, Q, thing });
      return { s, form, sum, answer, ...words, people: [P, Q] };
    }
  }
}

// A Change: its start, change or end unknown, the amount going up or down, in two sentences and its question.
function changeWords(rng, s, form, { x, y, z }, { P: X }) {
  const [dir, unknown] = form.split('-');
  const join = dir === 'join';
  const [start, change, end] = join ? [x, y, z] : [z, y, x];
  const [did, does] = s[join ? 'gain' : 'lose'];
  const V = (n) => said5(s, n);
  const changed = `[${did}] ${V(change)}${join ? ' [more]' : ''}`;
  const told = `${did} ${V(change)}${join ? ' more' : ''}`;
  const known = (n, k) => (unknown === k ? '?' : placed(s, n));
  return {
    story: {
      result: `${X} had ${ofIt(s, start)} and ${changed}.`,
      change: `${X} had ${ofIt(s, start)} and [${did}] some${join ? ' [more]' : ''}. [Now] ${X} has ${V(end)}.`,
      start: `${X} had some ${s.noun} and ${changed}. [Now] ${X} has ${V(end)}.`,
    }[unknown],
    question: {
      result: `How much ${s.noun} does ${X} have [now]?`,
      change: `How much ${s.noun} did ${X} [${does}]?`,
      start: `How much ${s.noun} did ${X} have [at the start]?`,
    }[unknown],
    type: `Change: there is a start, a change and an end, and the amount goes ${join ? 'up' : 'down'}.`,
    know: {
      result: `The start: ${V(start)}; the change: ${told}.`,
      change: `The start: ${V(start)}; the end: ${V(end)}.`,
      start: `The change: ${told}; the end: ${V(end)}.`,
    }[unknown],
    picture: join
      ? { type: 'bar', parts: [{ label: 'start', value: known(start, 'start') }, { label: 'change', value: known(change, 'change') }], total: known(end, 'result'), totalLabel: 'end' }
      : { type: 'bar', parts: [{ label: 'end', value: known(end, 'result') }, { label: did, value: known(change, 'change') }], total: known(start, 'start'), totalLabel: 'start' },
    hint: {
      result: 'Did the amount go up or down? Should the end be more or less than the start?',
      change: 'Is your answer the change, or the end amount? Put it back into the story: does it work?',
      start: 'Put your answer in as the start and follow the story. Do you get to the end amount?',
    }[unknown],
    how: UNDO[unknown] && `${UNDO[unknown]}.`,
  };
}

// A Combine: two parts and a whole, the whole or a part unknown; two people's, or a setting's own two things.
function combineWords(rng, s, form, { x, y, z }, { P, Q, thing: [one, other] }) {
  const lines = s.lines ?? peopleLines(s);
  const whole = form === 'whole';
  const V = (n) => said5(s, n);
  const vals = { name: P, P, Q, thing: one, other, X: V(x), Y: V(y), C: V(z) };
  const [l0, l1] = (lines.labels ?? ['{P}', '{Q}']).map((l) => fill(l, vals));
  return {
    story: fill(whole ? lines.whole : lines.part, vals),
    question: fill(whole ? lines.askWhole : lines.askPart, vals),
    type: 'Combine: two parts make a whole, and nothing changes.',
    know: whole ? `Both parts: ${V(x)} and ${V(y)}.` : `The whole: ${V(z)}; one part: ${V(x)}.`,
    picture: { type: 'bar', parts: [{ label: l0, value: placed(s, x) }, { label: l1, value: whole ? placed(s, y) : '?' }], total: whole ? '?' : placed(s, z) },
    hint: whole ? 'Did you use both parts? Should the whole be bigger than each part?' : 'Do your answer and the part you know add up to the whole?',
  };
}

// A Compare: a bigger amount (P's), a smaller one (Q's) and the difference, any one unknown; "less" in a story where the
// bigger is found means add, as in the whole-number ones.
function compareWords(rng, s, form, { x: small, y: d, z: big }, { P, Q }) {
  const lines = s.lines ?? peopleLines(s);
  const [unknown, word] = form.split('-');
  const V = (n) => said5(s, n);
  const say = (t, more = {}) => fill(t, { P, Q, D: V(d), ...more });
  const has = (K, n) => say(lines.has, { K, A: V(n) });
  const differ = say(word === 'more' ? lines.more : lines.fewer);
  const told = unknown === 'diff' ? [has(P, big), has(Q, small)] : rng.shuffle([unknown === 'big' ? has(Q, small) : has(P, big), differ]);
  return {
    story: told.join(' '),
    question: unknown === 'diff' ? say(word === 'more' ? lines.askMore : lines.askFewer) : say(lines.ask, { K: unknown === 'big' ? P : Q }),
    type: 'Compare: two amounts, and the difference between them.',
    know: { diff: `${P}: ${V(big)}; ${Q}: ${V(small)}.`, big: `${Q}: ${V(small)}; the difference: ${V(d)}.`, small: `${P}: ${V(big)}; the difference: ${V(d)}.` }[unknown],
    picture: { type: 'bar', compare: { a: { label: P, value: unknown === 'big' ? '?' : placed(s, big) }, b: { label: Q, value: unknown === 'small' ? '?' : placed(s, small) } } },
    hint: unknown === 'diff' ? 'Does the smaller amount plus your answer make the bigger amount?'
      : `Which amount is bigger? Should your answer be bigger or smaller than ${V(unknown === 'big' ? small : big)}?`,
  };
}

// the parts of an item every decimal story shares: its words, its bar, its answer and the unit the check reads
const storyParts = (skillId, st, extra) => item(skillId, {
  s: { money: kindOf(st.s).unit === '$' }, unit: answerUnit(st.s), kind: 'decimal', value: placed(st.s, st.answer),
  story: st.story, question: st.question, type: st.type, know: st.know, picture: st.picture, hint: st.hint, problemType: st.problemType ?? st.sum.key,
  sentence: `${st.sum.a} ${DSIGN[st.sum.op]} ${st.sum.b} = ☐`, ...extra,
});

// A one-step story worked by a way of adding and taking away decimals, through wayFor: the prompt card, then the
// estimate, not first now, so "About how big? …", then, in a Change with its start or change unknown, why it is worked
// as it is, with no box ("Work backwards from the end, undoing the change."), then the way's steps (a "won't work" line
// first where the way asked cannot), then the answer.
function oneStep(skillId, st, method, sum) {
  const { method: way, steps } = wayFor(skillId, sum, method);
  const first = [estimateStep(sum, { first: false }), ...(st.how ? [{ text: st.how }] : [])];
  const it = storyParts(skillId, st, { key: sum.key, first, work: steps.slice(1), words: METHODS[way].words(sum) });
  return { ...it, sum, method: way };
}

// Why a way suits these numbers: the story and its question, the way someone worked it, by its own title ("Count up",
// not "by count up", fix 4), and the three reasons, the one for that way the answer; its steps have no boxes, and the
// story's own sum is not asked. It has no type to name (problemType none, so js/runner.js ask skips that screen): she
// is not solving the story, and one card asking two questions at once is too many (fix 5).
function whyWay(skillId, rng, type, named) {
  const st = decimalStory(rng, { easy: false, type, named });
  const { title } = METHODS[named];
  const it = storyParts(skillId, st, { key: 'why-way', question: `${st.question} ${st.people[0]} worked it out this way: ${title}. Why does that way suit these numbers?`,
    work: [], hint: WHY_HINT, words: METHODS[named].words(st.sum), problemType: undefined });
  return { ...it, answer: { kind: 'choice', options: rng.shuffle(Object.values(REASONS)), value: REASONS[named] },
    // named: the way someone else used; no method, since she answers a choice and works it no way, so it counts in no way's
    // tries (engine/methods.js methodStats)
    // the way by its title at the start of the sentence: "Count up suits it: …"
    steps: [...WHY_STEPS.map((text) => ({ text })), { text: `${title} suits it: ${uncap5(REASONS[named])}` }], named };
}

// A two-step story: a Change, then a Compare of where it ends with someone else's amount (plan D7). After the prompt
// card the estimate, the story's own sentence on each amount to the nearest whole, or to the nearest tenth when any is
// under 1 (as engine/methods.js estimateOf rounds), never 0, with no amount rounded to 0, nor the answer itself; then
// its two results, First and Then, each with its columns; then the answer.
function twoStep(skillId, rng, easy) {
  const s = rng.pick(believable(DECIMALS.filter((x) => makes(x, 'two-step')), { easy }));
  const join = rng.chance(0.5), empty = !easy && rng.chance(0.25);
  const op = join ? 'd+' : 'd−', sign = DSIGN[op];
  const [K, Q] = rng.shuffle(NAMES);
  const u = unitTh(s), k = kindOf(s);
  const [lo, hi] = sizes(s, easy);
  let a, b, c, after, answer, mine, est;
  for (;;) {
    const [x, y, z] = triple(rng, s, easy);
    [a, b, after] = join ? [x, y, z] : [z, y, x];
    c = u * rng.int(lo / u, hi / u - 1);
    answer = Math.abs(after - c);
    mine = after > c; // whose is more after the change: K's, or Q's
    // the story's own sentence on its amounts rounded, by the one rule (engine/methods.js estimateOf, estimateFits)
    est = estimateOf({ op, a: placed(s, a), b: placed(s, b), c: placed(s, c), cFirst: !mine });
    if (new Set([a, b, c, after, answer]).size < 5 || (answer / u) % 10 === 0 || !estimateFits(est, answer)) continue;
    if (empty && ![a, b, c].some((n) => hasEmpty(s, n))) continue;
    break;
  }
  const [did] = s[join ? 'gain' : 'lose'];
  const [A, B, C, M, R] = [a, b, c, after, answer].map((n) => placed(s, n));
  const V = (n) => said5(s, n);
  // each result's columns, the written method's own picture of its sum
  const columns = (o, top, bottom) => METHODS['dec-column'].picture({ op: o, a: top, b: bottom });
  const [big, less] = mine ? [M, C] : [C, M];
  const [more, fewer] = mine ? [K, Q] : [Q, K];
  const it = item(skillId, {
    key: 'two-step', s: { money: k.unit === '$' }, unit: answerUnit(s), kind: 'decimal', value: R,
    story: `${K} had ${ofIt(s, a)} and [${did}] ${V(b)}${join ? ' [more]' : ''}. ${Q} has ${ofIt(s, c)}.`,
    question: `How much [more] ${s.noun} does ${more} have [than] ${fewer} [now]?`,
    sentence: mine ? `(${A} ${sign} ${B}) − ${C} = ☐` : `${C} − (${A} ${sign} ${B}) = ☐`,
    type: 'More than one step: first Change, then Compare.',
    know: `${K}: ${V(a)}, ${did} ${V(b)}; ${Q}: ${V(c)}.`,
    first: [{ text: `About how big? ${estimateWords(est)}` }],
    work: [{ text: `First, Change: ${A} ${sign} ${B} = ☐`, value: M, picture: columns(op, A, B) },
      { text: `Then, Compare: ${big} − ${less} = ☐`, value: R, picture: columns('d−', big, less) }],
    // a bar for each step, as the whole-number two-step stories have: the change, then the two to compare
    picture: { type: 'bar', rows: [
      join ? { title: 'First', parts: [{ label: 'had', value: A }, { label: did, value: B }], total: found(M), totalLabel: 'now' }
        : { title: 'First', parts: [{ label: did, value: B }, { label: 'now', value: found(M) }], total: A, totalLabel: 'had' },
      mine ? { title: 'Then', parts: [{ label: Q, value: C }, { label: 'more', value: '?' }], total: found(M), totalLabel: K }
        : { title: 'Then', parts: [{ label: K, value: found(M) }, { label: 'more', value: '?' }], total: C, totalLabel: Q }] },
    hint: 'What do you need to find out first, before you can answer the question?',
    words: join ? ['sum', 'difference'] : ['difference'],
    problemType: 'multistep',
    typeOptions: ORDER.filter((n) => ['Change', 'Compare', TYPE_NAMES.multistep].includes(n)),
  });
  // she works it by the written method, its results' columns, so her answer counts as a try of that way
  return { ...it, method: 'dec-column' };
}

// The kind asked for (opts.key), else drawn: at her usual level a two-step story 1 in 3, and why a way suits the numbers
// 1 one-step story in 6; easy, and beside another way (opts.also), one step only. Every draw is made whatever is asked, so
// a seed makes the same story asked for or drawn. opts.sum makes that very story again; opts.op keeps its kind of sum (her
// own go after two ways side by side); opts.method works it that way where it fits, and opts.also beside it, drawn
// again until both fit (50 draws at most, as engine/items/decimals.js draws).
function decimalItem(skillId, rng, opts) {
  const ways = methodsOf(skillId);
  if (opts.sum?.story) {
    const { state, draw } = opts.sum.story;
    return oneStep(skillId, decimalStory(makeRng(state), draw), opts.method, opts.sum);
  }
  if (opts.key && !D_KEYS.includes(opts.key)) throw new Error(`${skillId} has no kind of problem ${opts.key}`);
  const easy = Boolean(opts.easy);
  const two = rng.chance(1 / 3), why = rng.chance(1 / 6), drawn = rng.pick(D_TYPES), named = rng.pick(ways);
  const key = opts.key ?? (easy || opts.also ? drawn : two ? 'two-step' : why ? 'why-way' : drawn);
  if (key === 'two-step') return twoStep(skillId, rng, easy);
  // a why-way asked for names the way asked (each of the three, as the answer check asks for them); drawn, any way
  if (key === 'why-way') return whyWay(skillId, rng, drawn, opts.key === 'why-way' && ways.includes(opts.method) ? opts.method : named);
  const type = D_TYPES.includes(key) ? key : drawn;
  const fit = [opts.method, opts.also].filter((w) => ways.includes(w));
  const op = ['d+', 'd−'].includes(opts.op) ? opts.op : opts.also && fit.includes('dec-count-up') ? 'd−' : undefined;
  for (let i = 0; ; i++) {
    const state = rng.state();
    const draw = { easy, type, ...(op ? { op } : {}) };
    const st = decimalStory(rng, draw);
    const sum = { ...st.sum, story: { state, draw } };
    if (!opts.also || i >= 49 || fit.every((w) => wayFits(w, sum))) return oneStep(skillId, st, opts.method, sum);
  }
}

export default {
  skills: ['wp-change-combine', 'wp-compare', 'wp-equal-groups', 'wp-multistep', 'wp-decimals'],
  // the way she learned is each kind's own steps; the second ways come beside them (engine/items/ways.js), drawn from r and
  // draw alone so the comparison makes the very same story again
  make(skillId, rng, opts = {}) {
    if (skillId === 'wp-decimals') return decimalItem(skillId, rng, opts);
    return withWays(skillId, rng, opts, (r, draw) => {
      if (skillId === 'wp-change-combine') {
        // the chance is drawn first whatever is asked, as before
        const change = r.chance(0.6);
        const k = keyed(draw, /^(change|combine)-/);
        return (k ? k[1] === 'change' : change) ? changeItem(skillId, r, draw) : combineItem(skillId, r, draw);
      }
      if (skillId === 'wp-compare') return compareItem(skillId, r, draw);
      if (skillId === 'wp-equal-groups') return groupsItem(skillId, r, draw);
      return multiItem(skillId, r, draw);
    });
  },
};

// ---- building the bar model herself (js/runner.js buildBar) ----

// The parts of a bar model she places, in the first `rows` bars: each number from the story, as a slot { row, where,
// at?, value }: where is 'groups' (how many equal groups), 'parts' (at: the parts it fills; a bar of equal groups has one
// slot for all of them) or 'total'. Within a bar they come in the order the story gives them (story: its numbers). A
// decimal story's amounts are text ('0.50'), each found in the story by its value (engine/check.js sameAmount).
export function barSlots(picture, rows, story = []) {
  const out = [];
  const given = (v) => typeof v === 'number' || (typeof v === 'string' && thousandths(v) !== null);
  (picture?.rows || []).slice(0, rows).forEach((bar, row) => {
    const slots = [];
    if (bar.groups && given(bar.groups.count)) slots.push({ row, where: 'groups', value: bar.groups.count });
    if (bar.groups) {
      if (given(bar.parts[0]?.value)) slots.push({ row, where: 'parts', at: bar.parts.map((_, i) => i), value: bar.parts[0].value });
    } else bar.parts.forEach((x, i) => { if (given(x.value)) slots.push({ row, where: 'parts', at: [i], value: x.value }); });
    if (given(bar.total)) slots.push({ row, where: 'total', value: bar.total });
    const order = (x) => { const i = story.findIndex((n) => sameAmount(n, x.value)); return i < 0 ? story.length : i; };
    out.push(...slots.sort((a, b) => order(a) - order(b)));
  });
  return out;
}

// The bar as she builds it: the question's bar (no step done for her) with the slots before `at` filled in, the one she
// is on marked ({ slot: true, now: true }) and the rest empty.
export function slotPicture(picture, slots, at) {
  const rows = picture.rows.map((bar) => ({ ...bar, parts: bar.parts.map((x) => ({ ...x })), ...(bar.groups ? { groups: { ...bar.groups } } : {}) }));
  slots.forEach((sl, k) => {
    const v = k < at ? sl.value : { slot: true, ...(k === at ? { now: true } : {}) };
    const bar = rows[sl.row];
    if (sl.where === 'groups') bar.groups.count = v;
    else if (sl.where === 'total') bar.total = v;
    else for (const i of sl.at) bar.parts[i].value = v;
  });
  return { ...picture, rows, blank: true };
}
