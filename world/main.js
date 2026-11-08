// The morning's boot: the data, the page's own session lease, the Store and the save, the voices' list of clips, the Phaser
// game behind a "Tap to begin" card, the lines said aloud and shown as captions, the three jobs and the extra (each answer
// written through the durable pending transaction of world/save.js), and (only with ?test in the address) the
// window.__morning handle the play-through uses. After the last job come the close (the lantern, the Grey and the neighbour,
// her lamp, Ambrose and the end card with Play again), Stop here for today, and the session lease: it is given back only
// after a save that worked, and a line said for a stage, or before Stop, never goes on after it.

import * as speech from '../js/speech.js';
import { Store, EVENTS_KEY } from '../engine/store.js';
import { K, reachable, pickItems, newJob, askLines, check, pickUp, setDown, putBack, pickGround, actionTarget, stageNext, probeResult, placementEvents, answerEvent } from './logic.js';
import { SAVE_KEY, loadSave, saveNow, openSession, commitTransition, beginNewRun } from './save.js';
import { MorningScene } from './scene.js';

const query = new URLSearchParams(location.search);
const allowUnsaid = query.has('allow-unsaid'); // a pre-voice check only: a line with no recording is captioned and passed
const PREFIX = 'unmapped-morning.';          // this copy's own storage keys begin with it
const START = { x: 850, y: 420 };              // the yard, in front of the cottage steps
const NAMES = ['apples', 'socks', 'eggs', 'extra'];
const FIELDS = ['job', 'carried', 'carriedGround', 'ground', 'set', 'misses', 'help', 'done', 'askFinishedAt', 'firstPickupAt', 'firstCheckAt', 'resumed', 'result'];
const $ = (id) => document.getElementById(id);
const frame = () => new Promise((yes) => requestAnimationFrame(() => yes()));

const data = await (await fetch('world/morning.json')).json();
const variant = ['1', '2', '3'].includes(query.get('v')) ? Number(query.get('v')) : null;

// what is requested, captioned, completed and not said, each entry { seq, voice, text }, one seq to a requested line
const log = { requested: [], captioned: [], completed: [], unsaid: [] };
let seq = 0, clips = {}, captionTimer = null;
let generation = 0; // changes on Stop, the page going out of sight, a new stage and a return: a line begun before is dead after
// Gran is still saying what was not right: the same answer pressed again now is not a second miss, while an answer she has changed
// is checked at once. It ends when her line is really finished, on Stop or hide and on a new stage. The timer is only a backstop
// for a line that never ends (the longest reaction is under three seconds); it completes nothing.
let reacting = false, reactTimer = null, reactKey = '';
const stopReacting = () => { reacting = false; clearTimeout(reactTimer); };
const answerKey = (job) => `${job.set}/${job.ground.length}/${job.carriedGround}`;

const ctl = {
  data,
  pos: { ...START },
  state: null,      // the save's own shape: run, stage, jobs, pending (world/save.js); made once this tab owns the session lease
  started: false,   // the first tap has been made
  frozen: false,    // something is being written or has failed: no input
  busy: false,      // a closing scene is being said: no press until it is over
  still: false,     // the lantern picture, the carrying off and the end: she does not walk
  press: null,      // the action button and Space or Enter, set below
  scene: null,
  job: () => (ctl.state && NAMES.includes(ctl.state.stage) ? ctl.state.jobs[ctl.state.jobIndex] : null),
  teleported: () => {},
  sceneReady: () => {},
  savePosition: () => {},
  refreshAct: () => {},
};
let store = null, storage = null, lease = null; // the session lease, then the Store and the save's storage, in that order
// the session: parked is why the lease was given back ('stop' or 'hidden'), retry the write that is failing and shown with Carry on,
// retryOnShow that it is tried again once the page is in sight, cut that the lines and input were stopped while it was failing
// (so a retry with nothing to go on to begins the stage again), waiting that a lease came while the page was out of sight, reading
// that this tab owns the lease and is still reading the latest save (a read that fails is tried again, and nothing is written)
const life = { launched: false, parked: null, retry: null, retryOnShow: false, cut: false, waiting: false, claiming: false, reading: false, releasedAt: 0 };
let voicesDown = false; // the voices' lists did not load: the card with Carry on is shown instead of Tap to begin
const sceneReady = new Promise((yes) => { ctl.sceneReady = yes; });

// the caption: what is said, in words, for as long as it is said and a moment after
function showCaption(entry) {
  const say = $('say');
  clearTimeout(captionTimer);
  say.textContent = entry.text;
  say.className = `on ${entry.voice}`;
}
function fadeCaption() {
  clearTimeout(captionTimer);
  captionTimer = setTimeout(() => $('say').classList.remove('on'), 2600);
}

// say one line { voice, text } in its recorded voice, sentence by sentence; onEnd once it is said. Only with ?allow-unsaid
// (a pre-voice check) does a line with a missing recording go on once it is captioned, and it is never logged completed;
// without the flag a missing recording is a failure the play-through reports as unsaid. Returns its seq.
function say(line, onEnd) {
  const gen = generation, entry = { seq: ++seq, voice: line.voice, text: line.text };
  log.requested.push(entry);
  showCaption(entry);
  // a sentence is sayable when voices/index.json has its file; the morning's voices (gran, ambrose, narrator) have no pieces
  const missing = speech.sentences(line.text).filter((sentence) => !clips[line.voice]?.[sentence]);
  if (missing.length) log.unsaid.push({ ...entry });
  if (missing.length && allowUnsaid) {
    frame().then(() => { if (gen !== generation) return; log.captioned.push({ ...entry }); fadeCaption(); onEnd?.(); });
    return entry.seq;
  }
  // a line with a missing sentence is counted unsaid and is never completed, so nothing follows it. The speech module also lists a
  // sentence whose recording would not fetch, decode or play, and then still calls onEnd: that line was not said either. It is never
  // completed and never goes on, and Carry on says it again
  const listed = speech.unsaid().length, sentences = speech.sentences(line.text);
  listedAt.set(entry.seq, listed);
  speech.speak(line.text, { voice: line.voice, onEnd: () => {
    if (gen !== generation || missing.length) return;
    if (speech.unsaid().slice(listed).some((sentence) => sentences.includes(sentence))) { failedSpeech(line, onEnd, gen); return; }
    log.completed.push({ ...entry });
    fadeCaption();
    onEnd?.();
  } });
  return entry.seq;
}
function sayAll(lines, onEnd) {
  if (!lines.length) { onEnd?.(); return; }
  say(lines[0], () => sayAll(lines.slice(1), onEnd));
}
ctl.say = say;
ctl.sayAll = sayAll;

// a line that was not said freezes input and shows the voices card. Carry on says the same line again with the same continuation.
// A save that is failing is put right first, before any new sound is asked for: once it is saved, and nothing else has begun, the card
// offers the same line again; if that save fails again its own card shows, and once it is saved the stage begins again. Stop, the page
// going out of sight or a new stage ends this card's use
function failedSpeech(line, onEnd, gen) {
  ctl.frozen = true;
  ctl.scene?.clearInput?.();
  showCard(data.ui.voices, [[data.ui.carryOn, () => {
    if (gen !== generation || !lease || life.parked) return;
    if (life.retry) {
      const recover = life.retry, asked = log.requested.length;
      recover();
      if (life.retry) life.cut = true;
      else if (gen === generation && lease && !life.parked && log.requested.length === asked) failedSpeech(line, onEnd, gen);
      return;
    }
    hideCard();
    ctl.frozen = false;
    say(line, onEnd);
  }]]);
}

// where the speech module's list of sentences not said stood when each line was said, by seq: a sentence it lists belongs to the
// line that was being said when it was listed, never to a later line (a retry) that says the same words
const listedAt = new Map();
// the sentences shown and not said: the lines the controller found no recording for, and any the speech module could
// not play, each given the seq of the line it came from
function unsaid() {
  const rows = log.unsaid.map((e) => ({ ...e }));
  speech.unsaid().forEach((sentence, i) => {
    const line = [...log.requested].reverse().find((e) => listedAt.get(e.seq) <= i)
      ?? [...log.requested].reverse().find((e) => speech.sentences(e.text).includes(sentence));
    if (line && !rows.some((r) => r.seq === line.seq)) rows.push({ seq: line.seq, voice: line.voice, text: sentence });
  });
  return rows;
}

// a legal spot within REACH of an object's `at` point that she can walk to from the start, the nearest to that point
function spotAt(id) {
  const object = data.objects.find((o) => o.id === id);
  if (!object?.at) throw Error(`nothing to walk to at ${id}`);
  const obstacles = data.objects.flatMap((o) => o.rects);
  const spots = [];
  for (let x = K.RADIUS; x <= K.WORLD.w - K.RADIUS; x += 20) {
    for (let y = K.RADIUS; y <= K.WORLD.h - K.RADIUS; y += 20) {
      const d = Math.hypot(x - object.at.x, y - object.at.y);
      if (d <= K.REACH) spots.push({ x, y, d });
    }
  }
  spots.sort((a, b) => a.d - b.d);
  const spot = spots.find((p) => reachable(START, p, obstacles, K.WORLD, 0.5));
  if (!spot) throw Error(`no legal reachable spot near ${id}`);
  return { x: spot.x, y: spot.y };
}

// a copy of the live state in the save's shape (the mutable fields of each job, never the job's immutable definition)
const snapshot = () => {
  const s = ctl.state;
  return {
    pos: { ...ctl.pos }, started: ctl.started, frozen: ctl.frozen, stage: s?.stage ?? 'start', variant: s?.variant ?? variant, runId: s?.runId ?? null, rev: s?.rev ?? 0, jobIndex: s?.jobIndex ?? 0,
    jobs: (s?.jobs ?? []).map((j) => structuredClone(Object.fromEntries(FIELDS.map((k) => [k, j[k]])))), pending: s?.pending ? structuredClone(s.pending) : null,
  };
};

if (query.has('test')) {
  window.__morning = {
    state: snapshot,
    events: () => (store ? store.events.map((e) => ({ ...e })) : []), // a copy of the Store's events
    speak: () => ({ requested: log.requested.map((e) => ({ ...e })), captioned: log.captioned.map((e) => ({ ...e })), completed: log.completed.map((e) => ({ ...e })), unsaid: unsaid() }),
    goto: (id) => { ctl.pos = spotAt(id); ctl.teleported(); return { ...ctl.pos }; },
    answerNow: () => ctl.job()?.answer ?? null, // the right set count for the current job; it changes nothing
  };
}

// ---- the card for messages, Next and the end ----
function showCard(text, buttons = [], kind = '') {
  const card = $('card');
  card.replaceChildren();
  card.className = kind;
  if (text) { const p = document.createElement('p'); p.textContent = text; card.append(p); }
  for (const [label, run] of buttons) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', run); card.append(b); }
  card.hidden = false;
}
const hideCard = () => { $('card').hidden = true; $('card').replaceChildren(); };
const setPad = (on) => $('pad').classList.toggle('on', on);

// ---- the save ----
const freshState = (v) => {
  const defs = pickItems([101, 202, 303][v - 1]);
  return { v: 1, runId: crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`, rev: 0, variant: v, stage: 'start', jobIndex: 0, jobs: NAMES.map((n) => newJob(defs[n])), pending: null, pos: { ...START }, savedAt: 0 };
};

// a write that failed freezes input and shows the message; Carry on tries the same write again, and so does the page
// coming back into sight if it went out of sight while the write was failing (life.retryOnShow)
function retryUntilSaved(write, then) {
  ctl.frozen = true;
  const attempt = () => {
    life.retryOnShow = false;
    hideCard();
    if (!write()) { retryUntilSaved(write, then); return; }
    life.retry = null;
    ctl.frozen = false;
    if (then) then();
    else if (life.cut) present(); // its lines were stopped meanwhile and it has nothing to go on to: the stage begins again
    life.cut = false;
  };
  life.retry = attempt;
  showCard(data.ui.failed, [[data.ui.carryOn, attempt]]);
}
// a save: true when written; otherwise the retry card is shown and `then` runs once Carry on has written it
function persist(then) {
  if (writeNow()) return true;
  retryUntilSaved(writeNow, then);
  return false;
}
const writeNow = () => { ctl.state.pos = { x: ctl.pos.x, y: ctl.pos.y }; return saveNow(ctl.state, storage); };
// her place is kept as she walks
ctl.savePosition = () => { if (ctl.started && !ctl.frozen) persist(); };

// ---- the stage machine: every move to a new stage is one durable transaction (story, answer and placed events) ----
const story = (scene) => ({ type: 'story', data: { id: `unmapped-morning-${ctl.state.runId}-story-${scene}`, story: 'unmapped-morning', scene } });
function describe(destination) {
  const s = ctl.state, j = s.jobs[s.jobIndex], out = [];
  if (destination.nextStage === 'start') return [story('start')];
  if (NAMES.includes(s.stage)) out.push({ type: 'answer', data: answerEvent(j, j, s.runId) });
  if (destination.nextStage === 'lantern') out.push(...placementEvents(probeResult([s.jobs[0].result, s.jobs[2].result, ...(s.jobIndex === 3 ? [s.jobs[3].result] : [])]).right, s.runId));
  out.push(story(destination.nextStage));
  return out;
}
function transition(destination, then) {
  const write = () => { ctl.state.pos = { x: ctl.pos.x, y: ctl.pos.y }; return commitTransition(ctl.state, destination, describe(destination), { store, storage, clock: Date.now }); };
  ctl.frozen = true;
  if (write()) { ctl.frozen = false; then?.(); return true; }
  retryUntilSaved(write, then);
  return false;
}
// the stage after this one, from the saved results, and the job index it keeps or moves to
function nextDestination() {
  const s = ctl.state, results = Object.fromEntries(s.jobs.map((j) => [j.job, j.result])), next = stageNext(s.stage, results);
  return { nextStage: next, nextJobIndex: NAMES.includes(next) ? NAMES.indexOf(next) : s.jobIndex };
}
const advance = () => { const destination = nextDestination(); transition(destination, () => enter(destination.nextStage)); };
// the stage she is in has begun: a job is asked aloud, the clock for its time starting when Gran has finished speaking; the
// lantern is said and then Next is shown; the other closing stages wait for her press; the end shows its card
function enter(stage) {
  generation++; // a line said for any earlier stage is finished with
  stopReacting();
  hideCard();   // Next, or the card of the stage before
  ctl.busy = false;
  ctl.still = stage === 'lantern' || stage === 'end';
  setPad(!ctl.still);
  ctl.scene?.showStage(stage);
  if (NAMES.includes(stage)) {
    const job = ctl.job();
    sayAll(askLines(job).map((text) => ({ voice: 'gran', text })), () => { const live = ctl.job(); if (live?.job === job.job && !live.done) live.askFinishedAt = Date.now(); });
  } else if (stage === 'lantern') {
    sayAll(data.lines.close.lantern, () => showCard('', [[data.ui.next, advance]], 'over'));
  } else if (stage === 'end') showEnd();
}
function finishJob(job) {
  const destination = nextDestination(), lines = data.lines.right[job.job];
  transition(destination, () => sayAll(lines, () => enter(destination.nextStage)));
}

// ---- the end: Play again begins a new morning, and only a successful write of it lets anything move ----
function showEnd() {
  showCard(data.ui.end, [[data.ui.toOrchard, toOrchard], [data.ui.playAgain, playAgain]]);
}
// the morning is saved at its end: the lease goes back with nothing written, so the orchard's page can take it, and a
// Back press to this page takes it again (pageshow calls takeOver when parked is 'hidden')
function toOrchard() {
  if (!lease || life.parked) return;
  halt();
  park('hidden');
  location.assign('orchard.html');
}
function playAgain() {
  // one proposed run for this press: a write that fails is tried again with the very same run
  const proposed = freshState(variant ?? (ctl.state.variant % 3) + 1);
  const write = () => beginNewRun(ctl.state, proposed, { storage, lease });
  const begun = () => { generation++; ctl.frozen = false; ctl.pos = { ...ctl.state.pos }; hideCard(); present(); };
  ctl.frozen = true;
  if (write()) begun(); else retryUntilSaved(write, begun);
}

// ---- the closing stages: what she can do, and what a press does ----
const closeAt = { neighbour: data.objects.find((o) => o.id === 'neighbour').at, ambrose: data.objects.find((o) => o.id === 'ambrose').at };
const closeIds = { grey: 'neighbour', ambrose: 'ambrose' };
function closeTarget() {
  const stage = ctl.state?.stage;
  if (!ctl.started || ctl.frozen || ctl.busy || !['grey', 'lamp', 'ambrose'].includes(stage)) return { kind: 'none' };
  if (stage === 'lamp') return { kind: 'light' };
  const id = closeIds[stage], at = closeAt[id];
  return { kind: Math.hypot(ctl.pos.x - at.x, ctl.pos.y - at.y) <= K.REACH ? 'ask' : 'none', id, at };
}
ctl.closeTarget = closeTarget;
// where the arrow points: the neighbour, her own lantern, or Ambrose
ctl.closeMark = () => {
  const stage = ctl.state?.stage;
  if (ctl.busy) return null;
  if (stage === 'grey') return { x: closeAt.neighbour.x - 44, y: closeAt.neighbour.y - 24 };
  if (stage === 'lamp') return { x: ctl.pos.x + 18, y: ctl.pos.y - 34 };
  if (stage === 'ambrose') return { x: closeAt.ambrose.x, y: closeAt.ambrose.y - 145 };
  return null;
};
function closePress() {
  const stage = ctl.state.stage, target = closeTarget();
  if (target.kind === 'none') return null;
  const gen = generation, lines = data.lines.close[stage];
  const next = () => { if (gen === generation) { ctl.busy = false; advance(); } };
  ctl.busy = true;
  if (stage === 'grey') sayAll(lines, next);
  else if (stage === 'lamp') {
    // the ring spreads while the narrator speaks; the next stage comes when both are over
    let waiting = 2;
    const one = () => { if (gen === generation && --waiting === 0) next(); };
    ctl.scene.lightLantern(one);
    sayAll(lines, one);
  }
  else {
    // Ambrose answers, then carries her off; his second line is said over the fade, and the end comes when both are over
    ctl.still = true;
    setPad(false);
    say(lines[0], () => {
      if (gen !== generation) return;
      let waiting = 2;
      const one = () => { if (gen === generation && --waiting === 0) next(); };
      ctl.scene.carryOff(one);
      say(lines[1], one);
    });
  }
  return target.kind;
}

// ---- the action button: the one thing she can do where she stands ----
const layoutFor = (job) => ({ at: data.objects.find((o) => o.id === data.jobs[job.job].target).at, obstacles: data.objects.flatMap((o) => o.rects), world: K.WORLD });
function doCheck(job) {
  if (reacting && answerKey(job) === reactKey) return true; // the same answer again: nothing changes and nothing is counted
  stopReacting();
  const setBefore = job.set, groundBefore = job.ground.length, wasCopy = job.help === 'copy', layout = layoutFor(job);
  const result = check(job, Date.now(), layout);
  if (!result) return false;
  if (result.verdict === 'right' || result.verdict === 'copy-done') {
    ctl.scene?.cellsAway(job, setBefore);
    finishJob(job);
    return true;
  }
  if (!wasCopy) {
    ctl.scene?.flareLantern();
    if (job.ground.length > groundBefore && ctl.scene) ctl.scene.spillFrom = layout.at;
    const lines = result.help === 'copy' ? data.lines.copy : result.verdict === 'many' ? data.lines.many : data.lines.short;
    reacting = true;
    reactKey = answerKey(job);
    reactTimer = setTimeout(stopReacting, 6000);
    sayAll(lines, stopReacting);
  }
  persist();
  return true;
}
// one press: returns the kind of action done, or null. Only a kind given (a press kept down, repeating) must stay the same kind.
ctl.press = (only) => {
  if (!ctl.started || ctl.frozen) return null;
  const job = ctl.job();
  if (!job) return only ? null : closePress(); // no job: a closing stage, whose press is never repeated
  const target = actionTarget(ctl.pos, job, ctl.state.stage, data.objects);
  if (target.kind === 'none' || (only && target.kind !== only)) return null;
  if (target.kind === 'check') return doCheck(job) ? 'check' : null;
  const done = { pickUp: () => pickUp(job, Date.now()), putBack: () => putBack(job), setDown: () => setDown(job), pickGround: () => pickGround(job, ctl.pos) }[target.kind]();
  if (!done) return null;
  persist();
  return target.kind;
};
// the button's face follows what a press would do: a hand to take or give back, a drop to set down, a speech bubble to ask Gran
const FACE = { pickUp: 'hand', putBack: 'hand', pickGround: 'hand', setDown: 'drop', check: 'ask', ask: 'ask', light: 'hand' };
let face = '';
ctl.refreshAct = () => {
  const job = ctl.job(), kind = !ctl.started || ctl.frozen ? 'none' : job ? actionTarget(ctl.pos, job, ctl.state.stage, data.objects).kind : closeTarget().kind, next = FACE[kind] || '';
  if (next === face) return;
  face = next;
  if (next) $('act').dataset.face = next;
  $('act').classList.toggle('on', !!next);
};


// ---- the session: this tab's lease, Stop, the page going out of sight, and getting the morning back ----
// stop what is being said and what is being pressed; a line begun before this can no longer go on
function halt() {
  generation++;
  stopReacting();
  speech.stop();
  clearTimeout(captionTimer);
  $('say').classList.remove('on');
  ctl.scene?.clearInput?.();
  ctl.scene?.showStage(ctl.state?.stage ?? 'start'); // a carrying off or a spreading ring that was under way goes back to where the save is
  ctl.busy = false;
}
// the lease goes back after a save that worked; Stop shows its own card, and going out of sight shows nothing
function park(why) {
  lease.release();
  lease = null;
  life.releasedAt = Date.now();
  life.parked = why;
  $('stop').hidden = true;
  life.retry = null;
  life.cut = false;
  ctl.frozen = true;
  $('start').hidden = true;
  hideCard();
  if (why === 'stop') showCard(data.ui.saved, [[data.ui.carryOn, takeOver]]);
}
// Stop here for today, the page going out of sight ('hidden') or the page being left ('gone'): lines and input stop and the
// morning is saved while this tab still owns the lease. Only a write that worked lets the lease go. A write that fails keeps
// the lease and the unsaved state, freezes play and shows Could not save with Carry on; the page coming back into sight tries
// it again before anything else, and a page still in sight when Carry on has written it goes on from the saved state. A write
// that is already failing when the page goes out of sight or is left stays the one that is tried again; only the lines and the
// input stop.
function leave(why) {
  if (!lease || life.parked) return;
  halt();
  if (life.reading) {
    // the latest save has not been read: this tab has changed nothing of it, so nothing is written and the lease goes back
    life.reading = false;
    park('hidden');
    return;
  }
  ctl.frozen = true;
  if (life.retry && why !== 'stop') { life.retryOnShow = true; life.cut = true; return; }
  const gone = () => park(why === 'stop' ? 'stop' : 'hidden');
  const retried = () => (why !== 'stop' && !document.hidden ? carryOn() : gone());
  if (writeNow()) gone();
  else { life.retryOnShow = why !== 'stop'; retryUntilSaved(writeNow, retried); }
}
// still the owner and now saved: go on from the saved state
function carryOn() {
  ctl.frozen = false;
  hideCard();
  present();
}
// get the lease and, once it is this tab's, the latest save. A lease granted after the page went out of sight is given back
// at once and nothing is written; a lease refused shows the other-tab card, whose Carry on asks again.
async function takeOver() {
  if (life.claiming) return;
  life.claiming = true;
  try {
    hideCard();
    life.waiting = false;
    if (!navigator.locks?.request) { showCard(data.ui.unsupported); return; }
    let got = await openSession(navigator.locks);
    // a lease this tab gave back a moment ago may not be free yet: ask once more before saying another tab has it
    if (!got && Date.now() - life.releasedAt < 2000) { await new Promise((yes) => setTimeout(yes, 300)); got = await openSession(navigator.locks); }
    if (!got) { showCard(data.ui.locked, [[data.ui.carryOn, takeOver]]); return; }
    if (document.hidden) { got.release(); life.waiting = true; return; }
    lease = got;
    life.parked = null;
    activate();
  } finally { life.claiming = false; }
}
function refuse() {
  lease?.release();
  lease = null;
  showCard(data.ui.unsupported);
}
function orchardEvents(text) {
  try {
    const list = JSON.parse(text);
    return Array.isArray(list) ? list.filter((e) => typeof e?.id === 'string' && e.id.startsWith('unmapped-orchard-')) : [];
  } catch { return []; }
}
// this copy's own storage keys begin with the prefix: ?fresh clears them, once this tab has the lease, and comes back without ?fresh
function clearOwn() {
  // the orchard's save and its backups begin with the same prefix and are not the morning's to clear, and nor are its events: the
  // two pieces share one event log, so it is cut down to the orchard's instead of removed (the ids world/orchard-logic.js gives its
  // events begin `unmapped-orchard-`; tests/orchard-tools.test.js, case 10, checks that this and that agree)
  for (const key of Object.keys(storage)) {
    if (!key.startsWith(PREFIX) || key.startsWith(`${PREFIX}orchard.`)) continue;
    const kept = key === EVENTS_KEY ? orchardEvents(storage.getItem(key)) : [];
    if (kept.length) storage.setItem(key, JSON.stringify(kept)); else storage.removeItem(key);
  }
  const url = new URL(location.href);
  url.searchParams.delete('fresh');
  lease.release();
  lease = null;
  setTimeout(() => location.replace(url), 100);
}
// the latest save, read once so that what is judged is what was read. A read that throws says nothing about the save: it goes to the
// caller, which tries it again with the save untouched. Only a save that was read and is not a morning is kept under another key and
// cleared (and a clear that fails goes to the caller too), so a fresh morning is never written over a save still in place
function latest() {
  const raw = storage.getItem(SAVE_KEY);
  if (raw !== null) {
    const saved = loadSave({ getItem: () => raw });
    if (saved) return saved;
    try { storage.setItem(`${SAVE_KEY}.unreadable`, raw); } catch { /* the copy is a courtesy */ }
    storage.removeItem(SAVE_KEY);
  }
  return freshState(variant ?? 1 + Math.floor(Math.random() * 3));
}
function activate() {
  try { storage ??= window.localStorage; } catch { refuse(); return; }
  if (query.has('fresh') && !life.launched) { clearOwn(); return; }
  try {
    if (store) store.refresh(); // another tab's events are read in before this one writes
    else { store = new Store(storage); store.watch(window); }
  } catch { refuse(); return; }
  // the latest save is read before anything is shown or written: a read that fails freezes play and shows Could not save with
  // Carry on, keeping the lease and every byte of the save, and the state this tab had before (if any) is never written meanwhile
  life.reading = true;
  ctl.frozen = true;
  $('start').hidden = true;
  $('stop').hidden = true;
  const read = () => {
    try { ctl.state = latest(); ctl.pos = { ...ctl.state.pos }; return true; } catch { return false; }
  };
  const opened = () => { life.reading = false; if (life.launched) present(); else launch(); };
  if (read()) { ctl.frozen = false; opened(); }
  else retryUntilSaved(read, opened);
}

// what she sees once this tab owns the morning with its latest save in hand
function present() {
  if (!lease || life.parked) return;
  // without all three voices' lists the morning does not begin: the card stays, and comes back after a hide, until Carry on reloads
  if (voicesDown) { showCard(data.ui.voices, [[data.ui.carryOn, reloadVoices]]); return; }
  if (!ctl.scene) return; // before the yard is drawn, launch() presents it
  const s = ctl.state;
  ctl.scene.showStage(s.stage);
  ctl.teleported();
  $('stop').hidden = false;
  if (s.stage === 'end') { ctl.started = true; ctl.still = true; setPad(false); showEnd(); return; }
  ctl.still = s.stage === 'lantern';
  if (!ctl.started) { $('start').hidden = false; return; }
  setPad(!ctl.still);
  go();
}
// begin or go on from the saved stage
function go() {
  const s = ctl.state;
  if (s.stage === 'start') {
    const toApples = () => transition({ nextStage: 'apples', nextJobIndex: 0 }, () => sayAll(data.lines.start, () => enter('apples')));
    // the start scene is written once: a write still pending for it is finished first, and a run that crashed after
    // writing it (nothing pending for it) goes straight on
    const begin = () => {
      const written = store.events.some((e) => e.id === `unmapped-morning-${s.runId}-story-start`);
      if (s.pending ? s.pending.nextStage === 'start' : !written) transition({ nextStage: 'start', nextJobIndex: 0 }, toApples);
      else toApples();
    };
    if (persist(begin)) begin();
  } else if (s.pending) {
    transition({ nextStage: s.pending.nextStage, nextJobIndex: s.pending.nextJobIndex }, () => enter(ctl.state.stage));
  } else enter(s.stage);
}

// the list of clips, kept as it loads so each line can be checked against it before it is said. The morning needs the lists of
// all three voices: they are asked for up to three times, and without them nothing begins and nothing is marked said
const VOICES = ['gran', 'ambrose', 'narrator'];
const isList = (list) => !!list && typeof list === 'object' && !Array.isArray(list) && Object.keys(list).length > 0;
const voicesListed = () => VOICES.every((voice) => isList(clips[voice]));
// Carry on: the lease goes back and the page is loaded again, the saved run with it
function reloadVoices() {
  lease?.release();
  lease = null;
  location.reload();
}
async function loadVoices() {
  for (let attempt = 0; attempt < 3 && !voicesListed(); attempt++) {
    if (attempt) await new Promise((yes) => setTimeout(yes, 700 * attempt));
    clips = {};
    await speech.loadClips(async (url) => {
      const res = await fetch(url);
      if (/index\.json$/.test(url) && res.ok) {
        const list = await res.clone().json().catch(() => null);
        clips = list && typeof list === 'object' ? list : {};
      }
      return res;
    });
  }
  return voicesListed();
}

// the voices' lists, then the yard
async function launch() {
  life.launched = true;
  if (!(await loadVoices())) {
    voicesDown = true;
    // the run begun here is saved first (a write that fails shows Could not save), so the reload that Carry on makes goes on with it
    if (lease && !life.parked && persist(present)) present();
    return;
  }
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'stage',
    backgroundColor: '#8bbd4c',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    audio: { noAudio: true }, // the voices play through the page's own sound context, not Phaser's
    scene: new MorningScene(ctl),
  });
  // the card shows only when the clips are listed and the yard is drawn; its tap also lets the phone play sound
  await sceneReady;
  present();
}

$('start').addEventListener('click', () => {
  $('start').hidden = true;
  ctl.started = true;
  setPad(true);
  go();
});
$('stop').addEventListener('click', () => leave('stop'));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) leave('hidden'); // a write that is already failing is kept and tried again when the page is back
  else if (life.retry && life.retryOnShow) { life.retryOnShow = false; life.retry(); }
  else if (life.parked === 'hidden' || life.waiting) takeOver();
});
// leaving the page for good (or into the back-forward cache): the same save as going out of sight, with nothing shown unless it fails
addEventListener('pagehide', () => leave('gone'));
addEventListener('pageshow', (e) => { if (e.persisted && life.parked === 'hidden' && !document.hidden) takeOver(); });

await takeOver();
