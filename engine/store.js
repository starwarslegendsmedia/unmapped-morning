// Everything she does is stored as an event: one answer, one sprint, one story scene. Progress is worked
// out from the events, never stored on its own, so the Mac and the iPhone can be merged by putting their
// events together (union by id) with no conflicts.
//
// Event: { id, t (ms since 1970), device, type, ...data }
//   answer     { skill, key, phase, correct, firstTry, ms, given? }   phase: worked | learn | flash | practice | helped | review | sprint | placement
//              flash: a new fact shown, hidden and typed whole from memory (js/runner.js flash)
//              helped: a practice problem she asked to see steps of ("Show me one step"), with shown, how many
//              boxes: a long method's problem, how many of its steps she had as boxes to type in (engine/boxes.js)
//   flash      { key, shownMs, firstTry }                              one flash of a new fact: how long it showed, and
//                                                                      whether she typed it right without seeing it again
//   placed     { skill, result: 'known' | 'unknown' }                  from the placement check
//   learned    { skill }                                               block practice reached about 90% right
//   sprint     { score, wrong, skills }                                one one-minute sprint
//   round      { part, size, reward }                                  a round finished and the reward shown
//              part: review | practice | new-facts | facts (her slowest facts after the lesson);
//              reward: an id from engine/rounds.js, or 'learned'
//   session    { phase: 'start' | 'end', kind, done, stopped? }       stopped: she tapped "Stop here for today"
//   story      { story, scene }                                        a scene read
//   pick-story { story }
//   hero       { name }                                                her character's name; private, never in the repo
//   start-choice { first: 'review' | 'learn' }                        which part she chose to do first
//   rating     { guess, band, right, done }                            her guess at a session's score, then the score (engine/rating.js)
//   (two more)  release 1's parent's corner, no longer written (17 October 2026); kept if present, and ignored

export const EVENTS_KEY = 'unmapped-morning.events.v1';
const KEY = EVENTS_KEY;
const DEVICE_KEY = 'unmapped-morning.device.v1';
const SETTINGS_KEY = 'unmapped-morning.settings.v1';

// The counter at a fixed width, so a copy's events in one millisecond sort in the order written ('000z' before '0010')
// when they are merged with another copy's (the code review of the fix round, finding 1, 31 October 2026).
export function makeId(device, t, n) {
  return `${device}-${t.toString(36)}-${n.toString(36).padStart(4, '0')}`;
}

export function mergeEvents(...lists) {
  const byId = new Map();
  for (const list of lists) for (const e of list) if (!byId.has(e.id)) byId.set(e.id, e);
  return [...byId.values()].sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1));
}

export class Store {
  // storage: anything with getItem/setItem (localStorage in the browser, a Map wrapper in tests)
  constructor(storage, clock = () => Date.now()) {
    this.storage = storage;
    this.clock = clock;
    this.counter = 0;
    this.written = null; // the events' text as this copy last read or wrote it, so a save need not parse it again
    this.events = this.saved();
    this.device = this.storage.getItem(DEVICE_KEY);
    if (!this.device) {
      this.device = Math.random().toString(36).slice(2, 8);
      this.storage.setItem(DEVICE_KEY, this.device);
    }
  }

  read(key, fallback) {
    try {
      const text = this.storage.getItem(key);
      return text ? JSON.parse(text) : fallback;
    } catch {
      return fallback;
    }
  }

  // An id given that is already saved, by this copy or another, stores nothing new and returns the saved event, so the
  // first copy to save an id wins (the code review of the two copies, finding 5, 31 October 2026).
  // An id given as undefined or null is made, as when none is given (the code review of the fix round, finding 2).
  add(type, data = {}) {
    if (data.id != null) {
      this.refresh();
      const saved = this.events.find((e) => e.id === data.id);
      if (saved) return saved;
    }
    const t = this.clock();
    const e = { t, device: this.device, type, ...data, id: data.id ?? makeId(this.device, t, this.counter++) };
    this.events.push(e);
    this.save();
    return e;
  }

  merge(remote) {
    if (remote && !Array.isArray(remote)) remote = remote.events ?? []; // the copy saved from Settings (engine/measures.js)
    this.refresh(); // another open copy's events read in first, so an id it saved first wins over the other device's
    const before = this.events.length;
    this.events = mergeEvents(this.events, remote);
    if (this.events.length !== before) this.save();
    return this.events.length - before;
  }

  // What another open copy of the game has saved in this browser's storage (a second Safari tab, or a second window of
  // the site), merged in before this copy writes, so neither copy's events are lost (the story plan's Codex review,
  // finding 8, 31 October 2026). Not the home-screen app beside a tab: on iOS it keeps its own storage apart from
  // Safari's (WebKit bug 181849, comment 3, Apple, 1 February 2022), so those are two separate histories, not joined
  // here. Nothing when the saved text is the one this copy last read or wrote (it has those events already), or cannot
  // be read; of a saved list, only its events (an object with an id), so a stray value never breaks a save or an add
  // (the code review of the two copies, findings 3 and 4, 31 October 2026).
  saved() {
    const text = this.text();
    if (text != null && text === this.written) return [];
    try {
      const list = text ? JSON.parse(text) : [];
      this.written = text; // every caller merges what this returns into this.events, so the text need not be read again
      return Array.isArray(list) ? list.filter((e) => e && typeof e === 'object' && e.id != null) : [];
    } catch {
      return [];
    }
  }

  // The events' saved text, or null if there is none or the storage cannot be read.
  text() {
    try {
      return this.storage.getItem(KEY);
    } catch {
      return null;
    }
  }

  save() {
    this.refresh();
    this.written = JSON.stringify(this.events);
    this.storage.setItem(KEY, this.written);
  }

  // The other copy's events read in, without writing; how many were new. The list is replaced only when some were,
  // so one copy alone keeps the order it wrote her events in, and the same list (the code review of the two copies,
  // finding 1, 31 October 2026). When some were, the list is sorted by time, as a merge from another device is: events
  // in one millisecond keep the order written (makeId), but events written after the phone's clock went back move
  // before earlier ones, which needs two copies both writing and a clock set back, and is accepted (the code review of
  // the fix round, finding 1, 31 October 2026).
  refresh() {
    const merged = mergeEvents(this.events, this.saved());
    const n = merged.length - this.events.length;
    if (n) this.events = merged;
    return n;
  }

  // Refreshes whenever another copy writes the events (the page's storage event, fired in every other tab of the site).
  watch(target) {
    target?.addEventListener?.('storage', (e) => { if (e.key === KEY) this.refresh(); });
  }

  get settings() {
    return this.read(SETTINGS_KEY, { sound: true, readAloud: true });
  }

  set settings(value) {
    this.storage.setItem(SETTINGS_KEY, JSON.stringify(value));
  }
}

// Her hero's latest name, read straight from storage without opening a Store (which writes a device id); '' if there
// is none, or the storage is blocked or unreadable. getStorage is a function since reading window.localStorage can
// itself throw.
export function storedHeroName(getStorage) {
  try {
    const events = JSON.parse(getStorage().getItem(KEY) || '[]');
    return [...events].reverse().find((e) => e?.type === 'hero')?.name || '';
  } catch {
    return '';
  }
}

// A Map with the localStorage interface, for tests and for a browser that blocks storage.
export class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}
