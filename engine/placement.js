// The placement check: finding where she is before teaching anything, in the way ALEKS does it
// (knowledge space theory: probe a skill; if she has it she very likely has what it rests on; if she
// hasn't, she very likely hasn't got what rests on it). Each probe is a few problems of one skill.
// It chooses the skill that settles the most of what is still unknown either way, so the check is short,
// and it runs as several short sittings of about five minutes, picking up where it stopped.

import { SKILLS, ancestors, descendants } from './skills.js';

export const PROBE_ITEMS = 3;      // problems per probe
export const PROBE_PASS = 2;       // right first time to pass
export const SITTING_PROBES = 4;   // probes in one sitting, about five minutes

export function newPlacement(skillIds = SKILLS.map((s) => s.id)) {
  return { pool: skillIds.slice(), known: new Set(), unknown: new Set(), probes: [] };
}

// Rebuild a placement from 'placed' events (so a sitting can stop and resume on any device).
export function placementFromEvents(events, skillIds) {
  const p = newPlacement(skillIds);
  for (const e of events) if (e.type === 'placed') record(p, e.skill, e.result === 'known');
  return p;
}

function undetermined(p) {
  return p.pool.filter((id) => !p.known.has(id) && !p.unknown.has(id));
}

export function isDone(p) {
  return undetermined(p).length === 0;
}

// The next skill to probe: the one whose two results, pass and miss, settle the most between them, scored as
// (skills settled if she passes) × (skills settled if she misses). This weighs both results, where taking the worse
// result first (the score before step 4.8) kept probing balanced skills in the middle of the map and left short side
// branches open: with release 5's five measurement skills a simulated student was placed within four sittings 359 times
// in 400, under the 90% the plan asks, and the product places one 377 of 400 (378 at release 4, 367 before) in
// 9.9 probes on average rather than 13.6, so her sittings are fewer too (step 4.8, the lead's ruling). At release 6,
// with the angles and position skills, 372 of 400 (step 4b.5, 1 November 2026).
export function nextProbe(p) {
  const open = new Set(undetermined(p));
  if (!open.size) return null;
  let best = null;
  let bestScore = -1;
  for (const id of open) {
    const below = [...ancestors(id)].filter((a) => open.has(a)).length;
    const above = [...descendants(id)].filter((d) => open.has(d)).length;
    const score = (below + 1) * (above + 1); // a pass settles it and what it rests on, a miss it and what rests on it
    if (score > bestScore) { bestScore = score; best = id; }
  }
  return best;
}

function record(p, id, passed) {
  p.probes.push({ skill: id, passed });
  if (passed) {
    p.known.add(id);
    for (const a of ancestors(id)) if (p.pool.includes(a) && !p.unknown.has(a)) p.known.add(a);
  } else {
    p.unknown.add(id);
    for (const d of descendants(id)) if (p.pool.includes(d) && !p.known.has(d)) p.unknown.add(d);
  }
}

// Apply a finished probe. Returns the skills it settled, for 'placed' events.
export function applyProbe(p, id, rightFirstTime) {
  const passed = rightFirstTime >= PROBE_PASS;
  const before = new Set([...p.known, ...p.unknown]);
  record(p, id, passed);
  const settled = [];
  for (const k of p.known) if (!before.has(k)) settled.push({ skill: k, result: 'known' });
  for (const u of p.unknown) if (!before.has(u)) settled.push({ skill: u, result: 'unknown' });
  return { passed, settled };
}
