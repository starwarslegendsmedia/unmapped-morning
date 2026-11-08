// The orchard's rules, pure: the numbers each job uses, what a press does, when an answer is right, where the arrow points and
// which events a move to the next stage writes. Nothing here reads the page, the clock or the storage: the controller
// (world/orchard-main.js) passes in the job, its definition, its lines and the time.
import { makeRng } from '../engine/rng.js';
import { makeItem, factKeys } from '../engine/items/index.js';
import { inWords } from '../js/numbers.js';
import { K, step, reachable, cellAt, goldCells } from './logic.js';

// the scene and the controller take these from here, so there is one place to look
export { step, reachable, cellAt, goldCells };

export const ORCHARD = { WORLD: { w: 1800, h: 900 }, START: { x: 680, y: 740 }, TREE_ROWS: 10, OLD_TREES: 12, FIELD_ROWS: 10 };
export const NUMBERS = {
  wren: { big: [{ total: 84, per: 12 }, { total: 63, per: 9 }, { total: 48, per: 8 }] },
  hobb: { big: [{ people: 6, each: 8, per: 12 }, { people: 4, each: 9, per: 6 }, { people: 8, each: 9, per: 12 }],
          small: [{ people: 3, each: 8, per: 4 }, { people: 4, each: 6, per: 3 }, { people: 3, each: 10, per: 5 }] },
  farmer: { big: [{ total: 50, per: 8 }, { total: 45, per: 6 }, { total: 60, per: 9 }],
            small: [{ total: 22, per: 4 }, { total: 17, per: 3 }, { total: 23, per: 5 }] },
};
export const STAGES = ['arrive', 'wren', 'hobb', 'leftovers', 'farmer', 'night', 'end'];
export const JOBS = ['wren', 'hobb', 'farmer'];
export const CHOICES = ['hobb', 'ambrose', 'road'];

const FACT_SKILLS = ['facts-0-1', 'facts-2-5-10', 'facts-3-4', 'facts-6-8', 'facts-9-7', 'facts-11-12'];
const jobIndex = (job) => { const i = JOBS.indexOf(job); if (i < 0) throw RangeError(`no job ${job}`); return i; };

// a whole number from 2 to 100 in words, capitalised when it starts a sentence
export function say(n, capital = false) {
  if (!Number.isInteger(n) || n < 2 || n > 100) throw RangeError('number outside the orchard range');
  const w = inWords(n);
  return capital ? w[0].toUpperCase() + w.slice(1) : w;
}

// the level of a job from the saved results (job name -> result or null): Wren's is always big; a job after one she copied
// from the lamp uses the small numbers
export function level(job, results) {
  const before = { wren: null, hobb: 'wren', farmer: 'hobb' }[job];
  if (before === undefined) throw RangeError(`no job ${job}`);
  return before && results?.[before]?.phase === 'helped' ? 'small' : 'big';
}

// one job's numbers, answer, skill and engine item. Wren and Hobb divide evenly (the fact's own skill); the farmer's total
// does not share evenly, so the answer is the rows needed, the last one short
export function definition(job, variant, lvl, numbers) {
  const row = Number.isInteger(variant) ? numbers?.[job]?.[lvl]?.[variant - 1] : undefined;
  if (!row) throw RangeError(`no numbers for ${job} ${lvl} ${variant}`);
  const total = job === 'hobb' ? row.people * row.each : row.total, per = row.per;
  const sum = { op: '÷', n: total, d: per }, rng = makeRng(`orchard:${variant}:${job}:${lvl}`);
  if (job === 'farmer') {
    const item = makeItem('div-remainder', rng, { sum });
    const want = { kind: 'remainder', quotient: Math.floor(total / per), remainder: total % per };
    if (item.answer.kind !== 'remainder' || item.answer.quotient !== want.quotient || item.answer.remainder !== want.remainder) throw Error(`the farmer's item for ${variant} ${lvl} is not ${JSON.stringify(want)}`);
    return { job, level: lvl, ...row, total, per, answer: Math.ceil(total / per), skill: 'div-remainder', item };
  }
  const a = total / per, key = `${Math.min(a, per)}x${Math.max(a, per)}`;
  const skill = FACT_SKILLS.find((id) => factKeys(id).includes(key));
  if (!skill || !Number.isInteger(a)) throw Error(`no facts skill has ${key}`);
  const item = makeItem(skill, rng, { sum });
  if (item.answer.kind !== 'number' || item.answer.value !== a) throw Error(`the item for ${job} ${variant} ${lvl} does not answer ${a}`);
  return { job, level: lvl, ...row, total, per, answer: a, skill, item };
}

// the job's ask lines with each {name} said in words; a number that starts a sentence is capitalised
function fillIn(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, name, at) => {
    if (values[name] === undefined) throw Error(`no {${name}} for this job`);
    return say(values[name], at === 0 || /[.!?]\s$/.test(text.slice(0, at)));
  });
}
export function askLines(def, lines) {
  const values = { total: def.total, per: def.per, people: def.people, each: def.each };
  return lines.ask[def.job].map((line) => ({ ...line, text: fillIn(line.text, values) }));
}
// every ask line that has a number in it, filled for every job, level and variant, once each, sorted: the lines to record
export function numberedLines(orchard) {
  const found = new Map();
  for (const job of JOBS) for (const lvl of Object.keys(NUMBERS[job])) for (const variant of [1, 2, 3]) {
    const def = definition(job, variant, lvl, NUMBERS), filled = askLines(def, orchard.lines);
    orchard.lines.ask[job].forEach((line, i) => { if (line.text.includes('{')) found.set(filled[i].text, { voice: filled[i].voice, text: filled[i].text }); });
  }
  return [...found.keys()].sort().map((text) => found.get(text));
}

export function newJob(job) {
  jobIndex(job);
  return { job, asked: job === 'wren', trees: [], carried: 0, crate: 0, set: 0, rows: 0, planted: 0, cartLeft: null, misses: 0, help: null, done: false, askFinishedAt: null, firstActAt: null, firstCheckAt: null, resumed: false, result: null };
}
// what she has answered so far: Wren's rows in the basket, Hobb's chalked trees, the farmer's dug rows
export function given(s) { return s.job === 'wren' ? s.set : s.job === 'hobb' ? s.trees.length : s.rows; }

const treeIndex = (i, count) => Number.isInteger(i) && i >= 0 && i < count;
const touch = (s, now) => { if (s.firstActAt === null) s.firstActAt = now; };

// ---- Wren: one press shakes a whole tree; the trees shaken are carried, tipped into the basket or put in the crate ----
export function shake(s, i, now) {
  if (s.done || !treeIndex(i, ORCHARD.TREE_ROWS) || s.trees.includes(i) || s.trees.length >= ORCHARD.TREE_ROWS) return false;
  s.trees.push(i); s.carried++; touch(s, now); return true;
}
export function tip(s, def) {
  if (s.done || s.carried <= 0 || (s.help === 'copy' && !(s.set < def?.answer))) return false;
  s.carried--; s.set++; return true;
}
export function toCrate(s) {
  if (s.done || s.carried <= 0) return false;
  s.carried--; s.crate++; return true;
}
export function fromCrate(s) {
  if (s.done || s.carried !== 0 || s.crate <= 0) return false;
  s.crate--; s.carried++; return true;
}

// ---- Hobb: she chalks the trees first; in copy mode only trees below the answer can be chalked ----
export function chalk(s, i, now, answer) {
  if (s.done || !treeIndex(i, ORCHARD.OLD_TREES) || s.trees.includes(i) || (s.help === 'copy' && !(i < answer))) return false;
  s.trees.push(i); s.trees.sort((a, b) => a - b); touch(s, now); return true;
}
export function rub(s, i) {
  if (s.done || !s.trees.includes(i)) return false;
  s.trees = s.trees.filter((t) => t !== i); return true;
}

// ---- the farmer: she digs the rows first; once his check passes she carries one row's saplings a trip and plants it ----
export function dig(s, k, now, def) {
  if (s.done || s.result !== null || k !== s.rows || s.rows >= ORCHARD.FIELD_ROWS || (s.help === 'copy' && !(s.rows < def?.answer))) return false;
  s.rows++; touch(s, now); return true;
}
export function fill(s, k) {
  if (s.done || s.result !== null || s.rows <= 0 || k !== s.rows - 1) return false;
  s.rows--; return true;
}
export function load(s, per) {
  if (s.done || s.result === null || s.carried !== 0 || !(s.cartLeft > 0)) return false;
  s.carried = Math.min(per, s.cartLeft); s.cartLeft -= s.carried; return true;
}
export function plant(s, k) {
  if (s.done || s.result === null || s.carried <= 0 || k !== s.planted || k >= s.rows) return false;
  s.planted++; s.carried = 0;
  if (s.cartLeft === 0) s.done = true;
  return true;
}

// the second miss: the job keeps only what the answer allows, and the rest goes back to her hands or off the field
function copyMode(s, def) {
  s.help = 'copy';
  if (s.job === 'wren') { const keep = Math.min(s.set, def.answer); s.carried += s.set - keep; s.set = keep; }
  else if (s.job === 'hobb') s.trees = s.trees.filter((i) => i < def.answer);
  else s.rows = Math.min(s.rows, def.answer);
}
// she says she is done. Right: the result is kept (Wren and Hobb are done; the farmer goes on to carry and plant). A first
// miss gives the lines, a second the copy. Returns null when there is nothing to check.
export function check(s, def, now) {
  if (s.done || (s.job === 'farmer' && s.result !== null) || given(s) === 0 || (s.job === 'wren' && s.carried > 0)) return null;
  if (s.firstCheckAt === null) s.firstCheckAt = now;
  const got = given(s), copied = s.help === 'copy', verdict = got > def.answer ? 'many' : 'short';
  if (got === def.answer) {
    const start = s.askFinishedAt ?? s.firstActAt;
    s.result = {
      phase: copied ? 'helped' : 'practice', correct: true, firstTry: s.misses === 0 && s.help === null,
      ms: s.resumed || start === null ? null : Math.max(0, s.firstCheckAt - start), method: def.item.method, ...(copied ? { shown: 1 } : {}),
    };
    if (s.job === 'farmer') s.cartLeft = def.total; else s.done = true;
    return { verdict: copied ? 'copy-done' : 'right' };
  }
  if (copied) return { verdict: 'short', help: 'copy' };
  s.misses = Math.min(2, s.misses + 1);
  if (s.misses === 2) { copyMode(s, def); return { verdict, help: 'copy' }; }
  s.help = 'lines';
  if (s.job === 'wren' && s.set > def.answer) { s.carried += s.set - def.answer; s.set = def.answer; }
  return { verdict, help: 'lines' };
}

// ---- the press and the arrow ----
const jobOf = (state, job) => state.jobs[jobIndex(job)];
const near = (pos, at) => Math.hypot(pos.x - at.x, pos.y - at.y);
// the objects named `<prefix><number>` with that number: gateTree3 is { id: 'gateTree3', i: 3 }
const numbered = (objects, prefix) => objects.flatMap((o) => { const m = new RegExp(`^${prefix}(\\d+)$`).exec(o.id); return m ? [{ id: o.id, i: Number(m[1]) }] : []; });
// the one thing a press does where she stands: the nearest place within reach that offers something, ties by object id
export function actionTarget(pos, state, defs, objects) {
  const found = [];
  const add = (kind, id) => {
    const at = objects.find((o) => o.id === id)?.at;
    if (at && near(pos, at) <= K.REACH) found.push({ kind, objectId: id, distance: near(pos, at) });
  };
  const wren = jobOf(state, 'wren'), hobb = jobOf(state, 'hobb'), farmer = jobOf(state, 'farmer');
  if (state.stage === 'arrive') add('ask', 'wren');
  else if (state.stage === 'wren' && !wren.done) {
    for (const { id, i } of numbered(objects, 'gateTree')) if (!wren.trees.includes(i)) add('shake', id);
    if (wren.carried > 0 && !(wren.help === 'copy' && wren.set >= defs.wren.answer)) add('tip', 'basket');
    if (wren.carried > 0) add('toCrate', 'crate');
    if (wren.carried === 0 && wren.crate > 0) add('fromCrate', 'crate');
    if (wren.carried === 0 && wren.set > 0) add('check', 'wren');
  } else if (state.stage === 'hobb' && !hobb.done) {
    if (!hobb.asked) add('ask', 'hobb');
    else {
      for (const { id, i } of numbered(objects, 'oldTree')) {
        if (hobb.trees.includes(i)) add('rub', id);
        else if (!(hobb.help === 'copy' && i >= defs.hobb.answer)) add('chalk', id);
      }
      if (hobb.trees.length > 0) add('check', 'hobb');
    }
  } else if (state.stage === 'leftovers') for (const id of ['hobb', 'ambrose', 'roadside']) add('choose', id);
  else if (state.stage === 'farmer' && !farmer.done) {
    if (!farmer.asked) add('ask', 'farmer');
    else if (farmer.result === null) {
      if (farmer.rows < ORCHARD.FIELD_ROWS && !(farmer.help === 'copy' && farmer.rows >= defs.farmer.answer)) add('dig', `row${farmer.rows}`);
      if (farmer.rows > 0) { add('fill', `row${farmer.rows - 1}`); add('check', 'cart'); }
    } else {
      if (farmer.carried === 0 && farmer.cartLeft > 0) add('load', 'cart');
      if (farmer.carried > 0 && farmer.planted < farmer.rows) add('plant', `row${farmer.planted}`);
    }
  }
  found.sort((a, b) => a.distance - b.distance || (a.objectId < b.objectId ? -1 : a.objectId > b.objectId ? 1 : 0));
  return found.length ? { kind: found[0].kind, objectId: found[0].objectId } : { kind: 'none', objectId: null };
}

// where the arrow points: the `at` of the next thing to do, or null. Before any miss it never looks at the answer; after a
// miss (the lines, or the copy) it may, as the gold cells already show it. Every place it points offers its action now.
export function nextMark(pos, state, defs, objects) {
  const atOf = (id) => objects.find((o) => o.id === id)?.at ?? null;
  const nearest = (candidates) => {
    const marks = candidates.map((id) => ({ id, at: atOf(id) })).filter((m) => m.at).sort((a, b) => near(pos, a.at) - near(pos, b.at) || (a.id < b.id ? -1 : 1));
    return marks.length ? marks[0].at : null;
  };
  const trees = (prefix, keep) => numbered(objects, prefix).filter(({ i }) => keep(i)).map(({ id }) => id);
  const [wren, hobb, farmer] = state.jobs;
  switch (state.stage) {
    case 'arrive': return atOf('wren');
    case 'leftovers': return atOf('ambrose');
    case 'wren': {
      if (wren.done) return null;
      const answer = defs.wren.answer, missed = wren.help !== null;
      if (wren.carried > 0) return atOf(missed && wren.set >= answer ? 'crate' : 'basket');
      if (missed ? wren.set >= answer : wren.set > 0) return atOf('wren');
      return wren.crate > 0 ? atOf('crate') : nearest(trees('gateTree', (i) => !wren.trees.includes(i)));
    }
    case 'hobb': {
      if (hobb.done) return null;
      if (!hobb.asked) return atOf('hobb');
      const answer = defs.hobb.answer, chalked = (i) => hobb.trees.includes(i);
      if (hobb.help === null) return hobb.trees.length === 0 ? nearest(trees('oldTree', (i) => !chalked(i))) : atOf('hobb');
      if (hobb.help === 'copy') { const lowest = Array.from({ length: answer }, (_, i) => i).find((i) => !chalked(i)); return atOf(lowest === undefined ? 'hobb' : `oldTree${lowest}`); }
      if (hobb.trees.length < answer) return nearest(trees('oldTree', (i) => !chalked(i)));
      if (hobb.trees.length > answer) return nearest(trees('oldTree', chalked));
      return atOf('hobb');
    }
    case 'farmer': {
      if (farmer.done) return null;
      if (!farmer.asked) return atOf('farmer');
      if (farmer.result !== null) return atOf(farmer.carried === 0 ? 'cart' : `row${farmer.planted}`);
      const answer = defs.farmer.answer;
      if (farmer.rows === 0) return atOf('row0');
      if (farmer.help === null || farmer.rows === answer) return atOf('cart');
      return atOf(farmer.rows < answer ? `row${farmer.rows}` : `row${farmer.rows - 1}`);
    }
    default: return null;
  }
}

// the press at hobb, ambrose or the roadside is the choice 'hobb', 'ambrose' or 'road'
export function choiceFor(objectId) {
  const choice = { hobb: 'hobb', ambrose: 'ambrose', roadside: 'road' }[objectId];
  if (!choice) throw Error(`${objectId} is not a place to leave the apples`);
  return choice;
}

export function stageNext(stage) {
  const i = STAGES.indexOf(stage);
  if (i < 0 || i === STAGES.length - 1) throw Error(`no stage after ${stage}`);
  return STAGES[i + 1];
}

// the descriptors one move writes, in order: leaving a job its answer, leaving the leftovers the choice, then the story of the
// stage moved to. The very first save, at `arrive`, writes the story of `arrive` only.
export function events(state, destination, defs, runId) {
  const story = (scene) => ({ type: 'story', data: { id: `unmapped-orchard-${runId}-story-${scene}`, story: 'unmapped-orchard', scene } });
  const to = destination.nextStage;
  if (state.stage === 'arrive' && to === 'arrive') return [story('arrive')];
  if (to !== stageNext(state.stage)) throw Error(`${state.stage} does not go to ${to}`);
  const out = [];
  if (JOBS.includes(state.stage)) {
    const job = jobOf(state, state.stage);
    if (!job.done || !job.result) throw Error('job unfinished');
    out.push({ type: 'answer', data: { id: `unmapped-orchard-${runId}-answer-${state.stage}`, skill: defs[state.stage].skill, key: defs[state.stage].item.key, ...job.result } });
  }
  if (state.stage === 'leftovers') {
    if (!CHOICES.includes(state.choice)) throw Error('no choice made');
    out.push({ type: 'choice', data: { id: `unmapped-orchard-${runId}-choice-leftovers`, story: 'unmapped-orchard', choice: 'leftovers', value: state.choice } });
  }
  out.push(story(to));
  return out;
}
