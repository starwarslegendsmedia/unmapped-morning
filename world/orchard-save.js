// The orchard's save: one document under its own key, read and written strictly, with the morning's lease and the morning's
// durable pending move (world/save.js) so a stage is never ahead of its events. It reads the morning's save (never writes it)
// to know whether a finished morning is there. Nothing here touches the page: the controller (world/orchard-main.js) passes in
// the storage, the Store, the locks and the clock.
import { ORCHARD, NUMBERS, STAGES, JOBS, CHOICES, newJob, given, level, definition, stageNext, events } from './orchard-logic.js';
import { SAVE_KEY, loadSave, openSession } from './save.js';
import { EVENTS_KEY } from '../engine/store.js';

export const ORCHARD_KEY = 'unmapped-morning.orchard.v1';
const ROOT = ['v', 'runId', 'morningRunId', 'rev', 'variant', 'stage', 'jobs', 'choice', 'pending', 'pos', 'savedAt'];
const JOB_KEYS = Object.keys(newJob('wren'));
const UNUSED = { wren: ['rows', 'planted', 'cartLeft'], hobb: ['carried', 'crate', 'set', 'rows', 'planted', 'cartLeft'], farmer: ['trees', 'crate', 'set'] };
const HELP = [null, 'lines', 'copy'];
// how many jobs are done before the stage, and whether the stage has a job being played
const STAGE_JOBS = { arrive: [0, false], wren: [0, true], hobb: [1, true], leftovers: [2, false], farmer: [2, true], night: [3, false], end: [3, false] };
const leases = new WeakSet();
let liveLeases = 0;

const count = (n) => Number.isSafeInteger(n) && n >= 0;
const time = (n) => Number.isFinite(n) && n >= 0;
const text = (s) => typeof s === 'string' && s !== '';
const record = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
const keys = (x, names) => record(x) && Object.keys(x).length === names.length && names.every((k) => Object.hasOwn(x, k));
const canonical = (x) => (Array.isArray(x) ? x.map(canonical) : record(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, canonical(x[k])])) : x);
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const pristine = (j) => equal(j, newJob(j.job));

// the definitions are pure, so each is made once
const defCache = new Map();
function defsOf(doc) {
  const results = Object.fromEntries(doc.jobs.map((j) => [j.job, j.result]));
  return Object.fromEntries(JOBS.map((job) => {
    const lvl = level(job, results), key = `${job}:${doc.variant}:${lvl}`;
    if (!defCache.has(key)) defCache.set(key, definition(job, doc.variant, lvl, NUMBERS));
    return [job, defCache.get(key)];
  }));
}
// a move from this state to `to` is one the rules allow: the first save at arrive, or the next stage once its job is done and,
// after the leftovers, her choice is made
function moves(s, to) {
  if (s.stage === 'arrive' && to === 'arrive') return true;
  if (JOBS.includes(s.stage) && !s.jobs[JOBS.indexOf(s.stage)].done) return false;
  if (s.stage === 'leftovers' && !CHOICES.includes(s.choice)) return false;
  try { return stageNext(s.stage) === to; } catch { return false; }
}
// a result is what S4's check writes for this job as it now stands
function resultFits(j, def) {
  const r = j.result, copied = j.help === 'copy', start = j.askFinishedAt ?? j.firstActAt;
  return keys(r, ['phase', 'correct', 'firstTry', 'ms', 'method', ...(copied ? ['shown'] : [])])
    && r.phase === (copied ? 'helped' : 'practice') && r.correct === true && r.firstTry === (j.misses === 0 && j.help === null)
    && r.method === def.item.method && (!copied || r.shown === 1) && j.firstCheckAt !== null
    && r.ms === (j.resumed || start === null ? null : Math.max(0, j.firstCheckAt - start));
}
function pendingFits(c) {
  const { doc } = c, p = doc.pending;
  if (p === null) return true;
  if (!keys(p, ['nextStage', 'nextJobIndex', 'events']) || p.nextJobIndex !== 0 || !Array.isArray(p.events) || !p.events.length || !moves(doc, p.nextStage)) return false;
  let want;
  try { want = events(doc, { nextStage: p.nextStage }, c.defs(), doc.runId); } catch { return false; }
  return want.length === p.events.length && p.events.every((e, i) => keys(e, ['type', 'data']) && record(e.data) && time(e.data.t) && text(e.data.device)
    && (({ t, device, ...rest }) => equal({ type: e.type, data: rest }, want[i]))(e.data));
}

// Every rule a saved document must keep, in the order they are tried: a later rule may rely on what an earlier one has shown.
// `brokenRule` names the first that fails, so a test can say which rule refused a document.
const RULES = [
  ['fields', (c) => keys(c.doc, ROOT)],
  ['version', (c) => c.doc.v === 1],
  ['run id', (c) => text(c.doc.runId)],
  ['morning run id', (c) => c.doc.morningRunId === null || text(c.doc.morningRunId)],
  ['revision', (c) => count(c.doc.rev)],
  ['variant', (c) => [1, 2, 3].includes(c.doc.variant)],
  ['stage', (c) => STAGES.includes(c.doc.stage)],
  ['saved at', (c) => time(c.doc.savedAt)],
  ['place', (c) => keys(c.doc.pos, ['x', 'y']) && time(c.doc.pos.x) && time(c.doc.pos.y) && c.doc.pos.x <= ORCHARD.WORLD.w && c.doc.pos.y <= ORCHARD.WORLD.h],
  ['three jobs', (c) => Array.isArray(c.doc.jobs) && c.doc.jobs.length === 3 && c.doc.jobs.every((j, i) => record(j) && j.job === JOBS[i])],
  ['job fields', (c) => c.doc.jobs.every((j) => keys(j, JOB_KEYS))],
  ['job types', (c) => c.doc.jobs.every((j) => typeof j.asked === 'boolean' && typeof j.done === 'boolean' && typeof j.resumed === 'boolean' && Array.isArray(j.trees)
    && [j.askFinishedAt, j.firstActAt, j.firstCheckAt].every((x) => x === null || time(x)) && (j.result === null || record(j.result)))],
  ['counts', (c) => c.doc.jobs.every((j) => [j.carried, j.crate, j.set, j.rows, j.planted].every(count) && (j.cartLeft === null || count(j.cartLeft)))],
  ['misses', (c) => c.doc.jobs.every((j) => Number.isInteger(j.misses) && j.misses >= 0 && j.misses <= 2)],
  ['help', (c) => c.doc.jobs.every((j) => j.help === HELP[j.misses])],
  ['trees', (c) => c.doc.jobs.slice(0, 2).every((j) => j.trees.every((i) => Number.isInteger(i) && i >= 0 && i < (j.job === 'wren' ? ORCHARD.TREE_ROWS : ORCHARD.OLD_TREES))
    && (j.job === 'hobb' ? j.trees.every((t, k) => k === 0 || j.trees[k - 1] < t) : new Set(j.trees).size === j.trees.length))],
  ['wren balance', (c) => { const w = c.doc.jobs[0]; return w.trees.length === w.carried + w.crate + w.set; }],
  ['wren copy', (c) => { const w = c.doc.jobs[0]; return w.help !== 'copy' || w.set <= c.defs().wren.answer; }],
  ['hobb copy', (c) => { const h = c.doc.jobs[1]; return h.help !== 'copy' || h.trees.every((i) => i < c.defs().hobb.answer); }],
  ['farmer rows', (c) => { const f = c.doc.jobs[2]; return f.rows <= ORCHARD.FIELD_ROWS && (f.help !== 'copy' || f.rows <= c.defs().farmer.answer); }],
  ['unused fields', (c) => c.doc.jobs.every((j) => UNUSED[j.job].every((field) => equal(j[field], newJob(j.job)[field])))],
  // Wren is asked as her stage begins; another job has no progress until she is asked (a reload may mark it resumed)
  ['asked', (c) => c.doc.jobs[0].asked && c.doc.jobs.every((j) => j.asked || equal({ ...j, resumed: false }, newJob(j.job)))],
  ['job order', (c) => {
    const [before, playing] = STAGE_JOBS[c.doc.stage], jobs = c.doc.jobs;
    return jobs.slice(0, before).every((j) => j.done) && jobs.slice(before + (playing ? 1 : 0)).every(pristine);
  }],
  ['farmer before check', (c) => { const f = c.doc.jobs[2]; return f.result !== null || (f.cartLeft === null && f.carried === 0 && f.planted === 0); }],
  ['farmer done', (c) => { const f = c.doc.jobs[2]; return !f.done || (f.planted === f.rows && f.carried === 0 && f.cartLeft === 0); }],
  ['farmer totals', (c) => {
    const f = c.doc.jobs[2], d = c.defs().farmer;
    return f.result === null || (f.rows === d.answer && f.planted <= f.rows && f.carried <= d.per && count(f.cartLeft) && f.cartLeft <= d.total
      && f.cartLeft + f.carried + Math.min(f.planted * d.per, d.total) === d.total);
  }],
  ['farmer finished', (c) => { const f = c.doc.jobs[2]; return f.result === null || f.done === (f.carried === 0 && f.cartLeft === 0); }],
  // a done job is saved only inside the pending move to the next stage (world/save.js:61)
  ['done needs pending', (c) => { const [before, playing] = STAGE_JOBS[c.doc.stage]; return !playing || !c.doc.jobs[before].done || c.doc.pending !== null; }],
  ['result before done', (c) => c.doc.jobs.slice(0, 2).every((j) => j.result === null || j.done)],
  ['done answer', (c) => c.doc.jobs.every((j) => !j.done || (given(j) === c.defs()[j.job].answer && (j.job !== 'wren' || j.carried === 0)))],
  ['result', (c) => c.doc.jobs.every((j) => (!j.done || j.result !== null) && (j.result === null || resultFits(j, c.defs()[j.job])))],
  ['choice', (c) => {
    const { stage, choice, pending } = c.doc, at = STAGES.indexOf(stage), leftovers = STAGES.indexOf('leftovers');
    if (at < leftovers) return choice === null;
    if (at > leftovers) return CHOICES.includes(choice);
    return pending === null ? choice === null : CHOICES.includes(choice) && pending?.events?.find?.((e) => e?.type === 'choice')?.data?.value === choice;
  }],
  ['pending', pendingFits],
];
export function brokenRule(doc) {
  const memo = {}, c = { doc, defs: () => (memo.defs ??= defsOf(doc)) };
  for (const [name, ok] of RULES) {
    let good = false;
    try { good = ok(c) === true; } catch { good = false; }
    if (!good) return name;
  }
  return null;
}
const valid = (doc) => brokenRule(doc) === null;
// a state as it would be saved: the fields of the document and no others
const encode = (s) => Object.fromEntries(ROOT.map((k) => [k, k === 'jobs' ? s.jobs.map((j) => Object.fromEntries(JOB_KEYS.map((f) => [f, j[f]]))) : s[k]]));
const fits = (state) => valid(JSON.parse(JSON.stringify(encode(state))));

const newRunId = () => crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
// a state at the gate: nothing done, not yet saved. `morningRunId` is the finished morning it began from, or null for ?start
export function freshOrchard(variant, morningRunId = null, runId = newRunId()) {
  return { v: 1, runId, morningRunId, rev: 0, variant, stage: 'arrive', jobs: JOBS.map(newJob), choice: null, pending: null, pos: { ...ORCHARD.START }, savedAt: 0 };
}
// the job being played is marked resumed when the page comes back to it: its time is then not kept
function rehydrate(doc, resume) {
  const s = structuredClone(doc), j = s.jobs[JOBS.indexOf(s.stage)];
  if (resume && j && !j.done && j.result === null) j.resumed = true;
  return s;
}

export function loadOrchard(storage) {
  try { const raw = JSON.parse(storage.getItem(ORCHARD_KEY)); return valid(raw) ? rehydrate(raw, true) : null; } catch { return null; }
}
export function saveOrchard(state, storage) {
  try {
    const doc = JSON.parse(JSON.stringify(encode(state)));
    if (!valid(doc)) return false;
    const stored = storage.getItem(ORCHARD_KEY), old = stored ? JSON.parse(stored) : null;
    if (old) {
      if (old.runId !== state.runId || !count(old.rev)) return false;
      if (old.rev !== state.rev && STAGES.indexOf(state.stage) <= STAGES.indexOf(old.stage)) return false;
    }
    doc.rev = (old?.rev ?? state.rev) + 1;
    if (!count(doc.rev)) return false;
    doc.savedAt = Date.now();
    storage.setItem(ORCHARD_KEY, JSON.stringify(doc));
    state.rev = doc.rev; state.savedAt = doc.savedAt;
    return true;
  } catch { return false; }
}

// ---- a move to the next stage is one durable transaction: the pending list first, then each event once, then the stage ----
// With a pending move already on the state (a write failed, or the page came back to one) the move to finish is that one: the
// destination must be its destination, and the descriptors are not looked at.
export function commitOrchard(state, destination, descriptors, { store, storage, clock = Date.now }) {
  try {
    if (!keys(destination, ['nextStage', 'nextJobIndex']) || destination.nextJobIndex !== 0) return false;
    let created = false;
    if (state.pending) {
      if (state.pending.nextStage !== destination.nextStage) return false;
    } else {
      if (!moves(state, destination.nextStage) || !equal(descriptors, events(state, destination, defsOf(state), state.runId))) return false;
      const t = clock(), device = store.device;
      state.pending = { ...destination, events: descriptors.map((e) => ({ type: e.type, data: { ...structuredClone(e.data), t, device } })) };
      created = true;
    }
    if (!fits(state)) { if (created) state.pending = null; return false; }
    if (!saveOrchard(state, storage)) return false;
    return drainOrchard(state, store, storage);
  } catch { return false; }
}
export function drainOrchard(state, store, storage) {
  try {
    const p = state.pending;
    if (!p) return true;
    if (!fits(state)) return false;
    const retained = JSON.parse(storage.getItem(ORCHARD_KEY));
    if (retained?.runId !== state.runId || retained.rev !== state.rev || !equal(retained.pending, p)) return false;
    const saved = () => {
      const stored = storage.getItem(EVENTS_KEY);
      if (stored === null) return [];
      try { const list = JSON.parse(stored); return Array.isArray(list) ? list : []; } catch { return []; }
    };
    for (const e of p.events) {
      const full = { type: e.type, ...e.data };
      let existing = saved().find((x) => x.id === e.data.id);
      if (existing && !equal(existing, full)) return false;
      if (!existing) {
        store.add(e.type, e.data);
        existing = saved().find((x) => x.id === e.data.id);
        if (!existing) { store.save(); existing = saved().find((x) => x.id === e.data.id); }
        if (!equal(existing, full)) return false;
      }
    }
    const next = structuredClone(state);
    next.stage = p.nextStage; next.pending = null;
    if (!saveOrchard(next, storage)) return false;
    // only these four change, so a job object the caller keeps stays the job object
    state.stage = next.stage; state.pending = null; state.rev = next.rev; state.savedAt = next.savedAt;
    return true;
  } catch { return false; }
}

// ---- the lease, shared with the morning's page (one at a time) ----
export async function openOrchardSession(locks) {
  const inner = await openSession(locks);
  if (!inner) return null;
  const lease = { release() { if (leases.delete(lease)) { liveLeases--; inner.release(); } } };
  leases.add(lease); liveLeases++;
  return lease;
}

// ---- the gate: what the page shows ----
function backupKey(storage, bytes) {
  for (let n = 1; n <= 100; n++) {
    const key = n === 1 ? `${ORCHARD_KEY}.unreadable` : `${ORCHARD_KEY}.unreadable.${n}`, there = storage.getItem(key);
    if (there === null || there === bytes) return key;
  }
  throw Error('too many orchard backups');
}
// the orchard save is copied to a backup key, the copy is read back and compared, and only then is the original removed; any
// step that fails throws, so the original is still in place and the caller shows the retry card
function quarantine(storage, bytes) {
  // this module is loaded once in a page and the lock is the page's origin's, so a live lease here is this tab's own
  if (liveLeases === 0) throw Error('the orchard gate needs this tab to own the lease');
  const key = backupKey(storage, bytes);
  if (storage.getItem(key) !== bytes) {
    storage.setItem(key, bytes);
    if (storage.getItem(key) !== bytes) throw Error('the backup could not be read back');
  }
  if (storage.getItem(ORCHARD_KEY) !== bytes) throw Error('the orchard save changed while it was being moved');
  storage.removeItem(ORCHARD_KEY);
  if (storage.getItem(ORCHARD_KEY) !== null) throw Error('the orchard save could not be removed');
}
export function orchardGate(storage, query) {
  const raw = storage.getItem(SAVE_KEY), own = storage.getItem(ORCHARD_KEY);
  const morning = loadSave({ getItem: () => raw }), orchard = loadOrchard({ getItem: () => own });
  const stale = !!morning && orchard?.morningRunId != null && morning.runId !== orchard.morningRunId;
  if (orchard && !stale) return { show: 'resume', state: orchard };
  const result = morning?.stage === 'end' ? { show: 'fresh', morningRunId: morning.runId } : query?.has('start') ? { show: 'fresh', morningRunId: null } : { show: 'morning-first' };
  if (result.show === 'fresh' && own !== null) quarantine(storage, own);
  return result;
}

// Play the orchard again: a fresh run on the same morning, written in one setItem and adopted by the caller only once it is
// written. `variant` is the next numbers unless the caller forces them. Null when it is refused or the write fails.
export function resetOrchard(storage, lease, state, variant = (state.variant % 3) + 1) {
  if (!leases.has(lease)) return null;
  try {
    const old = JSON.parse(storage.getItem(ORCHARD_KEY));
    if (!valid(old) || old.stage !== 'end' || old.runId !== state.runId || old.rev !== state.rev) return null;
    const fresh = freshOrchard(variant, old.morningRunId);
    fresh.rev = 1; fresh.savedAt = Date.now();
    const doc = encode(fresh);
    if (!valid(doc)) return null;
    storage.setItem(ORCHARD_KEY, JSON.stringify(doc));
    return fresh;
  } catch { return null; }
}
