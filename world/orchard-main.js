// The orchard's boot: the data, the page's own session lease, the Store and the orchard's save, the voices' list of clips, the
// Phaser game behind a "Tap to begin" card, the lines said aloud and shown as captions (with who speaks), the three jobs (Wren's
// apples, Hobb's winter store, the farmer's saplings), the leftovers' choice and the night, each move to a new stage written through
// the durable pending move of world/orchard-save.js, and (only with ?test in the address) the window.__orchard handle the
// play-through uses. It is the morning's controller (world/main.js) made for the orchard: the session, the speech and the save
// are the same ways of doing the same things. A finished job or a choice is committed before anything about it is said, so a
// reload or a Stop during the words cannot strand her, and the session lease is given back only after a save that worked.

import * as speech from '../js/speech.js';
import { Store } from '../engine/store.js';
import { K, reachable } from './logic.js';
import { ORCHARD, NUMBERS, JOBS, newJob, given, level, definition, askLines, shake, tip, toCrate, fromCrate, chalk, rub, dig, fill, load, plant, check, actionTarget, choiceFor, stageNext, events } from './orchard-logic.js';
import { saveOrchard, commitOrchard, orchardGate, openOrchardSession, resetOrchard, freshOrchard } from './orchard-save.js';
import { OrchardScene } from './orchard-scene.js';

const query = new URLSearchParams(location.search);
const allowUnsaid = query.has('allow-unsaid'); // a pre-voice check only: a line with no recording is captioned and passed
const PREFIX = 'unmapped-morning.orchard.';    // this page's own storage keys begin with it, so ?fresh clears only the orchard's
const MORNING_PAGE = './';
const FIELDS = Object.keys(newJob('wren'));
const $ = (id) => document.getElementById(id);
const frame = () => new Promise((yes) => requestAnimationFrame(() => yes()));

const data = await (await fetch('world/orchard.json')).json();
const variant = ['1', '2', '3'].includes(query.get('v')) ? Number(query.get('v')) : null;

// what is requested, captioned, completed and not said, each entry { seq, voice, text, who? }, one seq to a requested line
const log = { requested: [], captioned: [], completed: [], unsaid: [] };
let seq = 0, clips = {}, captionTimer = null;
let generation = 0; // changes on Stop, the page going out of sight, a new stage and a return: a line begun before is dead after
// Wren, Hobb or the farmer is still saying what was not right: the same answer pressed again now is not a second miss, while an
// answer she has changed is checked at once. It ends when the line is really finished, on Stop or hide and on a new stage. The
// timer is only a backstop for a line that never ends; it completes nothing.
let reacting = false, reactTimer = null, reactKey = '';
const stopReacting = () => { reacting = false; clearTimeout(reactTimer); };
const answerKey = (job) => [given(job), job.carried, job.crate, job.trees.join('.')].join('/');

// the numbers of each job from the saved results: Wren's are always the big ones, and a job after one she copied from the lamp
// uses the small ones. The scene asks for them every frame, so they are made again only when a level changes.
let defsMemo = { key: '', defs: null };
function defsNow() {
  const s = ctl.state;
  if (!s) return null;
  // a level depends only on whether the job before it was copied, so the key is the variant and those two phases: no allocation but a string
  const key = `${s.variant}:${s.jobs[0].result?.phase}:${s.jobs[1].result?.phase}`;
  if (defsMemo.key !== key) {
    const results = Object.fromEntries(s.jobs.map((j) => [j.job, j.result]));
    defsMemo = { key, defs: Object.fromEntries(JOBS.map((job) => [job, definition(job, s.variant, level(job, results), NUMBERS)])) };
  }
  return defsMemo.defs;
}
const jobOf = (name) => ctl.state.jobs[JOBS.indexOf(name)];

const ctl = {
  data,
  pos: { ...ORCHARD.START },
  state: null,      // the save's own shape: run, stage, jobs, choice, pending (world/orchard-save.js); made once this tab owns the session lease
  started: false,   // the first tap has been made
  frozen: false,    // something is being written or has failed: no input
  busy: false,      // a scene is being told, or a finished job is being thanked: no press until it is over
  still: false,     // Ambrose is carrying her in, and the night and the end: she does not walk
  press: null,      // the action button and Space or Enter, set below
  scene: null,
  get defs() { return defsNow(); },
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

// the caption: who speaks (when a line says), then what is said, for as long as it is said and a moment after
function showCaption(entry) {
  const say = $('say');
  clearTimeout(captionTimer);
  say.replaceChildren();
  if (entry.who) { const b = document.createElement('b'); b.textContent = `${entry.who}:`; say.append(b); }
  say.append(entry.text);
  say.className = `on ${entry.voice}`;
}
function fadeCaption() {
  clearTimeout(captionTimer);
  captionTimer = setTimeout(() => $('say').classList.remove('on'), 2600);
}

// say one line { voice, who?, text } in its recorded voice, sentence by sentence; onEnd once it is said. Only with ?allow-unsaid
// (a pre-voice check) does a line with a missing recording go on once it is captioned, and it is never logged completed;
// without the flag a missing recording is a failure the play-through reports as unsaid. Returns its seq.
function say(line, onEnd) {
  const gen = generation, entry = { seq: ++seq, voice: line.voice, text: line.text, ...(line.who ? { who: line.who } : {}) };
  log.requested.push(entry);
  showCaption(entry);
  // a sentence is sayable when voices/index.json has its file
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
  const obstacles = data.objects.flatMap((o) => o.rects), { WORLD, START } = ORCHARD;
  const spots = [];
  for (let x = K.RADIUS; x <= WORLD.w - K.RADIUS; x += 20) {
    for (let y = K.RADIUS; y <= WORLD.h - K.RADIUS; y += 20) {
      const d = Math.hypot(x - object.at.x, y - object.at.y);
      if (d <= K.REACH) spots.push({ x, y, d });
    }
  }
  spots.sort((a, b) => a.d - b.d);
  const spot = spots.find((p) => reachable(START, p, obstacles, WORLD, 0.5));
  if (!spot) throw Error(`no legal reachable spot near ${id}`);
  return { x: spot.x, y: spot.y };
}

// a copy of the live state in the save's shape (the fields of each job, as saved)
const snapshot = () => {
  const s = ctl.state;
  return {
    pos: { ...ctl.pos }, started: ctl.started, frozen: ctl.frozen, busy: ctl.busy, stage: s?.stage ?? null, variant: s?.variant ?? variant, runId: s?.runId ?? null, morningRunId: s?.morningRunId ?? null, rev: s?.rev ?? 0,
    jobs: (s?.jobs ?? []).map((j) => structuredClone(Object.fromEntries(FIELDS.map((k) => [k, j[k]])))), choice: s?.choice ?? null, pending: s?.pending ? structuredClone(s.pending) : null,
  };
};
// each job's numbers as plain data (the engine item stays inside the page)
const defsSummary = () => Object.fromEntries(JOBS.map((job) => {
  const d = ctl.defs[job];
  return [job, { job, level: d.level, total: d.total, per: d.per, people: d.people ?? null, each: d.each ?? null, answer: d.answer, skill: d.skill, key: d.item.key }];
}));

if (query.has('test')) {
  window.__orchard = {
    state: snapshot,
    events: () => (store ? store.events.map((e) => ({ ...e })) : []), // a copy of the Store's events
    speak: () => ({ requested: log.requested.map((e) => ({ ...e })), captioned: log.captioned.map((e) => ({ ...e })), completed: log.completed.map((e) => ({ ...e })), unsaid: unsaid() }),
    goto: (id) => { ctl.pos = spotAt(id); ctl.teleported(); return { ...ctl.pos }; },
    answerNow: () => (ctl.state && JOBS.includes(ctl.state.stage) ? ctl.defs[ctl.state.stage].answer : null), // the right count for the current job; it changes nothing
    defs: () => (ctl.state ? defsSummary() : null),
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
const newVariant = () => variant ?? 1 + Math.floor(Math.random() * 3);

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
const writeNow = () => { ctl.state.pos = { x: ctl.pos.x, y: ctl.pos.y }; return saveOrchard(ctl.state, storage); };
// her place is kept as she walks
ctl.savePosition = () => { if (ctl.started && !ctl.frozen) persist(); };

// ---- the stage machine: every move to a new stage is one durable transaction (story, answer and choice events) ----
// with a move already pending, the move to finish is that one and the descriptors are not looked at
const describe = (destination) => (ctl.state.pending ? [] : events(ctl.state, destination, ctl.defs, ctl.state.runId));
function transition(destination, then) {
  const write = () => { ctl.state.pos = { x: ctl.pos.x, y: ctl.pos.y }; return commitOrchard(ctl.state, destination, describe(destination), { store, storage, clock: Date.now }); };
  ctl.frozen = true;
  if (write()) { ctl.frozen = false; then?.(); return true; }
  retryUntilSaved(write, then);
  return false;
}
// the stage after this one
const nextDestination = () => ({ nextStage: stageNext(ctl.state.stage), nextJobIndex: 0 });

// the stage she is in has begun: the story is told, a job's ask is said (the clock for its time starting when it has been said), the
// leftovers are put to her, the night comes down and then the end card shows
function enter(stage) {
  generation++; // a line said for any earlier stage is finished with
  stopReacting();
  hideCard();   // the card of the stage before
  ctl.busy = false;
  ctl.still = stage === 'arrive' || stage === 'night' || stage === 'end';
  setPad(!ctl.still);
  ctl.scene?.showStage(stage, ctl.state);
  const gen = generation;
  if (stage === 'arrive') {
    // Ambrose carries her in while the story is told; there is nothing to press until it is told
    ctl.busy = true;
    ctl.still = true;
    ctl.scene.rideIn(() => { if (gen === generation) { ctl.still = false; setPad(true); } });
    sayAll(data.lines.arrive, () => { if (gen === generation) ctl.busy = false; });
  } else if (JOBS.includes(stage)) {
    const job = jobOf(stage);
    if (stage !== 'wren' && !job.asked) sayAll(data.lines.go[stage], undefined);
    else if (job.result !== null) sayAll(data.lines.right[stage], undefined); // the farmer's check has passed and she is planting: the words that sent her to the cart
    else sayAll(askLines(ctl.defs[stage], data.lines), () => markAsked(stage));
  } else if (stage === 'leftovers') sayAll(data.lines.leftovers, undefined);
  else if (stage === 'night') {
    ctl.busy = true;
    // the dusk comes down while the night is told; the end comes when both are over
    let waiting = 2;
    const one = () => { if (gen === generation && --waiting === 0) transition({ nextStage: 'end', nextJobIndex: 0 }, () => enter('end')); };
    ctl.scene.dusk(one);
    sayAll(data.lines.night, one);
  } else if (stage === 'end') showEnd();
}
// the job's ask has been said: the time for its answer counts from here, unless it is done or its check has already passed
// (a result's time is kept as it was made)
function markAsked(name) {
  const live = jobOf(name);
  if (live && !live.done && live.result === null) live.askFinishedAt = Date.now();
}
// the move to the next stage is committed first; only then are the job's thanks said, and then the stage is entered
function finishJob(job) {
  const destination = nextDestination();
  ctl.busy = true;
  transition(destination, () => {
    ctl.scene?.showStage(destination.nextStage, ctl.state); // the colour begins to come back as the thanks begin
    sayAll(data.lines.right[job.job], () => enter(destination.nextStage));
  });
}

// ---- the end: Play the orchard again begins a new run, and only a successful write of it lets anything move ----
function showEnd() {
  showCard(data.ui.end, [[data.ui.again, playAgain], [data.ui.toMorning, toMorning]]);
}
function playAgain() {
  if (!lease || life.parked) return;
  // one write for this press: a write that fails is tried again, and only a fresh run that was written is taken up
  let fresh = null;
  const write = () => { fresh = resetOrchard(storage, lease, ctl.state, variant ?? undefined); return fresh !== null; };
  const begun = () => { generation++; ctl.state = fresh; ctl.pos = { ...fresh.pos }; ctl.frozen = false; hideCard(); present(); };
  ctl.frozen = true;
  if (write()) begun(); else retryUntilSaved(write, begun);
}
// the orchard is saved: the lease goes back with nothing written, so the morning's page can take it, and a Back press to this page
// takes it again (pageshow calls takeOver when parked is 'hidden')
function toMorning() {
  if (!lease || life.parked) return;
  halt();
  park('hidden');
  location.assign(MORNING_PAGE);
}

// ---- the action button: the one thing she can do where she stands ----
function doCheck(job) {
  if (reacting && answerKey(job) === reactKey) return true; // the same answer again: nothing changes and nothing is counted
  stopReacting();
  const wasCopy = job.help === 'copy', result = check(job, ctl.defs[job.job], Date.now());
  if (!result) return false;
  if (result.verdict === 'right' || result.verdict === 'copy-done') {
    if (job.job === 'farmer') {
      // the farmer's check has passed: it is saved, his words are said once, and then she may load and plant
      const said = () => sayAll(data.lines.right.farmer, () => { ctl.busy = false; });
      ctl.busy = true;
      if (persist(said)) said();
    } else finishJob(job);
    return true;
  }
  if (!wasCopy) {
    ctl.scene?.flareLamp();
    const lines = data.lines[result.help === 'copy' ? 'copy' : result.verdict === 'many' ? 'many' : 'short'][job.job];
    reacting = true;
    reactKey = answerKey(job);
    reactTimer = setTimeout(stopReacting, 6000);
    sayAll(lines, stopReacting);
  }
  persist();
  return true;
}
// the person asked: at the gate she goes to Wren, at Hobb or the farmer she asks and the job's ask is said
function ask() {
  const s = ctl.state;
  if (s.stage === 'arrive') { ctl.busy = true; transition(nextDestination(), () => enter('wren')); return 'ask'; }
  const job = jobOf(s.stage);
  job.asked = true;
  const said = () => sayAll([...(job.job === 'farmer' ? data.lines.refuse : []), ...askLines(ctl.defs[job.job], data.lines)], () => markAsked(job.job));
  if (persist(said)) said();
  return 'ask';
}
// the apples are given: the choice is committed with the move to the farmer, and only then is it answered
function choose(objectId) {
  const value = choiceFor(objectId);
  ctl.state.choice = value;
  ctl.busy = true;
  transition(nextDestination(), () => sayAll(data.lines.choice[value], () => enter('farmer')));
  return 'choose';
}
// the last sapling is planted: the farmer is done only inside the move to the night, and then he remembers his daughter
function finishFarmer() {
  ctl.busy = true;
  transition(nextDestination(), () => sayAll(data.lines.daughter, () => enter('night')));
}
// one press: returns the kind of action done, or null
ctl.press = () => {
  if (!ctl.started || ctl.frozen || ctl.busy || !ctl.state) return null;
  const s = ctl.state, defs = ctl.defs, target = actionTarget(ctl.pos, s, defs, data.objects);
  if (target.kind === 'none') return null;
  if (target.kind === 'ask') return ask();
  if (target.kind === 'choose') return choose(target.objectId);
  const job = jobOf(s.stage);
  if (target.kind === 'check') return doCheck(job) ? 'check' : null;
  const now = Date.now(), n = (prefix) => Number(target.objectId.slice(prefix.length));
  const done = {
    shake: () => shake(job, n('gateTree'), now), tip: () => tip(job, defs.wren), toCrate: () => toCrate(job), fromCrate: () => fromCrate(job),
    chalk: () => chalk(job, n('oldTree'), now, defs.hobb.answer), rub: () => rub(job, n('oldTree')),
    dig: () => dig(job, n('row'), now, defs.farmer), fill: () => fill(job, n('row')), load: () => load(job, defs.farmer.per), plant: () => plant(job, n('row')),
  }[target.kind]();
  if (!done) return null;
  if (target.kind === 'plant' && job.done) finishFarmer();
  else persist();
  return target.kind;
};
// the button's face follows what a press would do: a hand to take, a drop to set down or give, a speech bubble to ask or to say she is done
const FACE = { shake: 'hand', fromCrate: 'hand', chalk: 'hand', rub: 'hand', dig: 'hand', fill: 'hand', load: 'hand', tip: 'drop', toCrate: 'drop', plant: 'drop', choose: 'drop', ask: 'ask', check: 'ask' };
let face = '';
ctl.refreshAct = () => {
  // the scene works out what a press would do once a frame; nothing is offered while a scene is being told
  const kind = !ctl.started || ctl.frozen || ctl.busy ? 'none' : ctl.scene?.pressTarget?.kind ?? 'none', next = FACE[kind] || '';
  if (next === face) return;
  face = next;
  if (next) $('act').dataset.face = next;
  $('act').classList.toggle('on', !!next);
};


// ---- the session: this tab's lease, Stop, the page going out of sight, and getting the orchard back ----
// stop what is being said and what is being pressed; a line begun before this can no longer go on
function halt() {
  generation++;
  stopReacting();
  speech.stop();
  clearTimeout(captionTimer);
  $('say').classList.remove('on');
  ctl.scene?.clearInput?.();
  if (ctl.state) ctl.scene?.showStage(ctl.state.stage, ctl.state); // a ride, a dusk or a colour that was under way goes back to where the save is
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
// orchard is saved while this tab still owns the lease. Only a write that worked lets the lease go. A write that fails keeps
// the lease and the unsaved state, freezes play and shows Could not save with Carry on; the page coming back into sight tries
// it again before anything else, and a page still in sight when Carry on has written it goes on from the saved state. A write
// that is already failing when the page goes out of sight or is left stays the one that is tried again; only the lines and the
// input stop.
function leave(why) {
  if (!lease || life.parked) return;
  halt();
  if (life.reading || !ctl.state) {
    // the latest save has not been read, or there is no orchard to save (the card that sends her to the morning): this tab has
    // changed nothing of it, so nothing is written and the lease goes back
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
    let got = await openOrchardSession(navigator.locks);
    // a lease this tab gave back a moment ago may not be free yet: ask once more before saying another tab has it
    if (!got && Date.now() - life.releasedAt < 2000) { await new Promise((yes) => setTimeout(yes, 300)); got = await openOrchardSession(navigator.locks); }
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
// this page's own storage keys begin with the prefix: ?fresh clears them, once this tab has the lease, and comes back without ?fresh
function clearOwn() {
  for (const key of Object.keys(storage)) if (key.startsWith(PREFIX)) storage.removeItem(key);
  const url = new URL(location.href);
  url.searchParams.delete('fresh');
  lease.release();
  lease = null;
  setTimeout(() => location.replace(url), 100);
}
// the latest save, read once so that what is judged is what was read, by the gate: the saved orchard to go on with, a fresh one
// (from the finished morning, or from ?start), or null when the morning has to be played first. A read that throws says nothing
// about the save: it goes to the caller, which tries it again with the save untouched. A save that is not the orchard's is kept under
// another key before a fresh one is offered, and a copy that cannot be read back throws too, so nothing is written over it.
function latest() {
  const gate = orchardGate(storage, query);
  if (gate.show === 'resume') return gate.state;
  if (gate.show === 'fresh') return freshOrchard(newVariant(), gate.morningRunId);
  return null;
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
    try { ctl.state = latest(); if (ctl.state) ctl.pos = { ...ctl.state.pos }; return true; } catch { return false; }
  };
  const opened = () => {
    life.reading = false;
    if (!ctl.state) { ctl.frozen = true; showCard(data.ui.morningFirst, [[data.ui.toMorning, toMorning]]); return; } // the morning comes first
    if (life.launched) present(); else launch();
  };
  if (read()) { ctl.frozen = false; opened(); }
  else retryUntilSaved(read, opened);
}

// what she sees once this tab owns the orchard with its latest save in hand
function present() {
  if (!lease || life.parked) return;
  // without all three voices' lists the orchard does not begin: the card stays, and comes back after a hide, until Carry on reloads
  if (voicesDown) { showCard(data.ui.voices, [[data.ui.carryOn, reloadVoices]]); return; }
  if (!ctl.scene) return; // before the orchard is drawn, launch() presents it
  const s = ctl.state;
  ctl.scene.showStage(s.stage, s);
  ctl.teleported();
  $('stop').hidden = false;
  if (s.stage === 'end') { ctl.started = true; ctl.still = true; setPad(false); showEnd(); return; }
  ctl.still = false;
  if (!ctl.started) { $('start').hidden = false; return; }
  setPad(true);
  go();
}
// begin or go on from the saved stage: a move that was pending is finished first, the story of the arrival is written once, and
// the saved stage is entered
function go() {
  const s = ctl.state;
  if (s.pending) transition({ nextStage: s.pending.nextStage, nextJobIndex: 0 }, () => enter(ctl.state.stage));
  else if (s.stage === 'arrive' && !store.events.some((e) => e.id === `unmapped-orchard-${s.runId}-story-arrive`)) transition({ nextStage: 'arrive', nextJobIndex: 0 }, () => enter('arrive'));
  else enter(s.stage);
}

// the list of clips, kept as it loads so each line can be checked against it before it is said. The orchard needs the lists of
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

// the voices' lists, then the orchard
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
    scene: new OrchardScene(ctl),
  });
  // the card shows only when the clips are listed and the orchard is drawn; its tap also lets the phone play sound
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
