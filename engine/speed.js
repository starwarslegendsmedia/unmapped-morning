// Her speed on each fact, at the start and now (research 6.11; the plan's measure: "her speed on each fact at the
// start and after two weeks"). engine/mastery.js keeps, for every fact, her first time right first time and her
// latest; the copy of her progress saved from Settings carries the middle of each and the facts that changed most
// (engine/measures.js).

import { SKILLS } from './skills.js';

// Every fact she has a time for: { skill, key, firstMs, nowMs, since } (since: when the first time was).
export function factSpeeds(st) {
  const out = [];
  for (const sk of SKILLS) {
    if (sk.kind !== 'facts') continue;
    for (const [key, f] of Object.entries(st[sk.id].facts)) if (f.firstMs != null) out.push({ skill: sk.id, key, firstMs: f.firstMs, nowMs: f.nowMs, since: f.firstAt });
  }
  return out;
}

export const middle = (list) => {
  const s = [...list].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// { facts, firstMs, nowMs, most }: how many facts, the middle of her first times and of her latest, and the n facts
// whose time changed most (a fact with one time, or the same time, has not changed). Null before she has a time for any fact.
export function speedSummary(speeds, n = 5) {
  if (!speeds.length) return null;
  return {
    facts: speeds.length,
    firstMs: middle(speeds.map((s) => s.firstMs)),
    nowMs: middle(speeds.map((s) => s.nowMs)),
    most: speeds.filter((s) => s.firstMs !== s.nowMs).sort((a, b) => Math.abs(b.firstMs - b.nowMs) - Math.abs(a.firstMs - a.nowMs)).slice(0, n),
  };
}
