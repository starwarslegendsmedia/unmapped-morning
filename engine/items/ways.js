// The ways of a skill whose generator builds its own steps (plans/2026-10-25-two-ways-plan.md): the way she learned is
// the generator's own steps, unchanged; each second way is a closure the generator returns beside them, for the kinds and
// numbers it fits, built from the numbers already drawn and never drawing again. The sum keeps the rng's state and the
// draw options, so the comparison (js/runner.js compare) makes the very same problem again, story and options and all.
import { makeRng } from '../rng.js';
import { LEARNED, wontWork } from '../methods.js';

export { LEARNED };
export const FAMILY = {
  'pv-10k': 'pv', 'pv-millions': 'pv', 'pv-x10': 'pv10', 'addsub-multi': 'addsub3', 'mult-tens': 'tens', factors: 'factor',
  estimate: 'est', 'eq-order-ops': 'order', 'eq-patterns': 'pattern',
  'wp-change-combine': 'wp', 'wp-compare': 'wp', 'wp-equal-groups': 'wp', 'wp-multistep': 'wp',
};
export const FAMILY_OPS = new Set(Object.values(FAMILY));
const TRIES = 50;

// build(rng, draw) -> today's item plus `ways: { [id]: () => ({ steps, picture?, hint?, words?, ask?, answer? }) }`,
// one entry for each second way that fits this item, and `why: { [id]: reason }` for a way of this item's kind whose
// numbers stop it; draw.want is a second way to draw numbers for (opts.also), and a generator may use it only to choose
// numbers that way fits.
export function withWays(skillId, rng, opts, build) {
  const { method, also, sum: given, op, divMethod, ...rest } = opts;
  // keeping the way she learned asks for no particular numbers
  const draw = given ? given.draw : { ...rest, ...(also && also !== LEARNED ? { want: also } : {}) };
  let base, sum;
  for (let i = 0; i < (also && !given ? TRIES : 1); i++) {
    const r = given ? makeRng(given.state) : rng;
    const state = r.state();
    base = build(r, draw);
    sum = { op: FAMILY[skillId], shape: base.key, state, draw, ways: [LEARNED, ...Object.keys(base.ways || {})] };
    if (!also || [method, also].every((w) => !w || sum.ways.includes(w))) break;
  }
  const { ways = {}, why: whys = {}, ...item } = base;
  const way = method && ways[method] ? method : LEARNED;
  const out = { ...item, ...(way === LEARNED ? {} : ways[way]()), sum, method: way };
  // only where the way asked for is for this kind and the numbers stop it (base.why); any other kind comes the way she learned
  const why = method && method !== way && whys[method];
  if (why) out.steps = [wontWork(method, why, LEARNED), ...out.steps];
  return out;
}
