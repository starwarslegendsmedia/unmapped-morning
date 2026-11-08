// The orchard's world: Tallyfold's half-grey orchard, drawn from world/orchard.json's object table, with her walking in it.
// Everything is sorted by the y of its feet, so she goes behind a tree and in front of a crate. Input comes from the four
// DOM pad buttons and the keyboard; there is no tap-to-walk. The controller (world/orchard-main.js) makes the object this
// scene reads and hands it in as `ctl`: data (orchard.json), pos (her place), state (the saved orchard state), defs (job
// name -> the job's definition, S4's `definition`), started, frozen, still, press(), savePosition(), refreshAct(),
// sceneReady(). The scene sets ctl.scene and ctl.teleported. The controller calls showStage(stage, state) on entering a
// stage, a reload and a new run; between those the scene redraws itself whenever the state's counts change. Once a frame
// it also sets scene.pressTarget, what a press would do where she stands (actionTarget), for the controller's refreshAct().

import { makeRng } from '../engine/rng.js';
import { ORCHARD, JOBS, step, cellAt, goldCells, actionTarget, nextMark } from './orchard-logic.js';
import { mix } from './draw.js';
import { makeOrchardTextures } from './orchard-draw.js';

const GLOW = 1;           // additive blending: the vendored build numbers it 1, and plain blending 0
const VIEW_HEIGHT = 400;  // world units the camera shows from top to bottom
const LERP = 0.1;         // how quickly the camera catches up with her
const READY_FRAMES = 12;  // frames drawn before the card that starts her walking is shown
const STEP_SECONDS = 0.1; // the most time one call of step() counts (its own limit)
const MAX_FRAME = 0.5;    // the most time one frame may walk, so coming back to a paused page cannot fling her across the orchard
const LOW = 0.12;         // how far below the middle of the screen she stands, as a share of its height
const GHOST = 0xf4d98a;   // the pale gold the copy's still-empty places are drawn in
const GREY = 0xa8a8a8;    // the tint of what is not yet put right
const WHITE = 0xffffff;
const COLOUR_MS = 1200;   // the colour comes back over this long when a job is done
const RIDE_FROM = 300;    // how far to the left of home Ambrose and the girl start
const RIDE_MS = 1800;     // how long the slide in takes
const FLARE_MS = 1100;    // how long the lamp's flare takes to fade
const HOP_MS = 450;       // how long she takes to hop down from his shell
const DUSK_MS = 2000;     // how long the dark blue veil takes to come
const DUSK_ALPHA = 0.35;  // how dark it gets
const VEIL = 0x14224a;    // the dark blue of dusk
const DOOR = { x: 220, y: 250 }; // the barn door, where Hobb's gold cells and the apples of his trees are drawn
const FACE = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };

const jobOf = (state, name) => state.jobs[JOBS.indexOf(name)];
// how many saplings or cells row k of the field takes: `per` in every row but the last, which takes what is left over
const rowCells = (k, def) => Math.max(0, Math.min(def.per, def.total - k * def.per));
// where the i-th apple of a job lies, in rows of `per` across, row by row: on the basket's ground, or at the barn door
const basketPoint = (at, per, i) => { const { row, col } = cellAt(i, per); return { x: at.x + 26 + (col - (per - 1) / 2) * 8, y: at.y - 24 - row * 8 }; }; // 26 to the right, so the rows do not hide Wren's child
const doorPoint = (per, i) => { const { row, col } = cellAt(i, per); return { x: DOOR.x + (col - (per - 1) / 2) * 8, y: DOOR.y - row * 8 }; };
// where the j-th sapling of row k stands, from the bottom of the strip up
const fieldPoint = (x, j) => ({ x, y: 740 - 60 * j });

export class OrchardScene extends Phaser.Scene {
  constructor(ctl) {
    super('orchard');
    this.ctl = ctl;
  }

  create() {
    const { data } = this.ctl;
    this.obstacles = data.objects.flatMap((o) => o.rects);
    makeOrchardTextures(this, makeRng('orchard-art'), data.objects);
    this.add.image(0, 0, 'ground').setOrigin(0, 0).setDepth(-1000);
    this.setUpStage(data);
    this.setUpGirl();
    this.setUpMarks();
    this.setUpCamera();
    this.setUpInput();
    this.ctl.scene = this;
    this.ctl.teleported = () => this.snapCamera();
    this.frames = 0;
  }

  object(id) { return this.ctl.data.objects.find((o) => o.id === id); }

  // everything that stands in the orchard, at the bottom centre of its collision rectangle; people at their `at`
  setUpStage(data) {
    const put = (key, x, y, depth = y) => this.add.image(x, y, key).setOrigin(0.5, 1).setDepth(depth);
    const base = (id) => { const [r] = this.object(id).rects; return { x: r.x + r.w / 2, y: r.y + r.h }; };
    this.placed = new Map();
    this.gateTrees = [];
    this.oldTrees = [];
    this.rows = [];
    for (const o of data.objects) {
      const gate = /^gateTree(\d+)$/.exec(o.id), old = /^oldTree(\d+)$/.exec(o.id), row = /^row(\d+)$/.exec(o.id);
      if (gate) { const b = base(o.id); this.gateTrees[Number(gate[1])] = put('tree', b.x, b.y).setScale(0.5); this.placed.set(o.id, this.gateTrees[Number(gate[1])]); }
      else if (old) { const b = base(o.id); this.oldTrees[Number(old[1])] = put('tree', b.x, b.y).setScale(0.6); this.placed.set(o.id, this.oldTrees[Number(old[1])]); }
      else if (row) { this.rows[Number(row[1])] = this.add.image(o.at.x, 160, 'row-grass').setOrigin(0.5, 0).setDepth(-900); this.placed.set(o.id, this.rows[Number(row[1])]); }
    }
    for (const [id, key] of [['gatePostA', 'gatepost'], ['gatePostB', 'gatepost'], ['basket', 'basket'], ['crate', 'crate'], ['barn', 'barn'], ['cart', 'cart']]) {
      const b = base(id);
      this.placed.set(id, put(key, b.x, b.y));
    }
    const [post] = this.object('gatePostB').rects;
    put('gate', post.x + post.w / 2, post.y); // between the two gate posts: its feet stand where the lower post's rectangle begins
    const wren = this.object('wren').at;
    this.placed.set('wren', [put('wren', wren.x, wren.y), put('child', wren.x - 40, wren.y + 4).setScale(0.7), put('child', wren.x + 40, wren.y + 4).setScale(0.7)]);
    const hobb = this.object('hobb').at;
    this.placed.set('hobb', put('hobb', hobb.x, hobb.y));
    const farmer = this.object('farmer').at;
    this.placed.set('farmer', [put('stump', farmer.x, farmer.y), put('farmer', farmer.x, farmer.y - 8, farmer.y + 0.1)]);
    const stone = this.object('roadside').at;
    this.placed.set('roadside', put('stone', stone.x, stone.y - 8));
    const amb = base('ambrose');
    this.ambrose = put('ambrose-up', amb.x, amb.y);
    this.ambroseHome = amb;
    this.placed.set('ambrose', this.ambrose);
    // fences along the four edges, the way she cannot go
    const { w, h } = ORCHARD.WORLD;
    for (let x = 0; x < w; x += 56) {
      put('fence-across', x + 28, 14);
      put('fence-across', x + 28, h + 8);
    }
    for (let y = 60; y < h; y += 48) {
      put('fence-down', 8, y);
      put('fence-down', w - 8, y);
    }
  }

  setUpGirl() {
    this.shadow = this.add.ellipse(this.ctl.pos.x, this.ctl.pos.y, 30, 10, 0x2f3a18, 0.3);
    this.girl = this.add.image(this.ctl.pos.x, this.ctl.pos.y, 'girl-down-0').setOrigin(0.5, 1);
    this.facing = 'down';
    this.stride = 0;
  }

  // the marks and the changing pictures: the soft ring under what a press would do, the arrow to the next thing, her lamp
  // and its flare, the dusk, and the pictures of the jobs (apples, cells, ghosts, chalk, saplings), which draw() rebuilds
  setUpMarks() {
    this.ring = this.add.ellipse(0, 0, 76, 26, 0xffe9a0, 0.3).setDepth(1).setVisible(false);
    this.arrow = this.add.image(0, 0, 'arrow').setOrigin(0.5, 1).setDepth(9500).setVisible(false);
    this.lamp = this.add.image(0, 0, 'lamp').setOrigin(0.5, 1);
    this.lampGlow = this.add.image(0, 0, 'glow').setScale(0.55).setBlendMode(GLOW);
    this.flare = this.add.image(0, 0, 'glow').setScale(1.4).setAlpha(0).setBlendMode(GLOW);
    this.veil = this.add.rectangle(0, 0, 10, 10, VEIL).setScrollFactor(0).setDepth(30000).setAlpha(0);
    this.dyn = { chalks: [], ghosts: [], cells: [], basket: [], crate: [], saplings: [], cart: [], carried: [] };
    this.vals = { veil: 0, hop: 0, slide: 0, flare: 1, wren: 0, hobb: 0, farmer: 0 };
    this.glides = {};
    this.stage = 'arrive';
    this.sig = '';
    this.moved = 0;
  }

  // a value moves to its target over `ms` on the scene's own clock, so a stage change or a replay can overwrite it
  glide(name, to, ms, ease = 'out', done) {
    this.glides[name] = { from: this.vals[name], to, start: this.time.now, ms, ease, done };
  }

  set(name, value) {
    this.vals[name] = value;
    delete this.glides[name];
  }

  stepGlides() {
    for (const [name, g] of Object.entries(this.glides)) {
      if (this.glides[name] !== g) continue; // a finished glide's callback can reset the rest
      const t = Math.min(1, (this.time.now - g.start) / g.ms), e = g.ease === 'inOut' ? (t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2) : 1 - (1 - t) ** 2;
      this.vals[name] = g.from + (g.to - g.from) * e;
      if (t >= 1) { delete this.glides[name]; g.done?.(); }
    }
  }

  // draw the orchard as it is in this stage and state: on entering a stage, on a reload at any stage and when a new run begins
  showStage(stage, state) {
    const before = this.stage;
    this.stage = stage;
    for (const name of JOBS) {
      const done = jobOf(state, name).done ? 1 : 0;
      // the colour comes back slowly only when the job was finished in the stage just left; a reload shows it at once
      if (before === name && stage !== name && done === 1 && this.vals[name] === 0) this.glide(name, 1, COLOUR_MS);
      else this.set(name, done);
    }
    this.ambrose.setTexture(stage === 'night' || stage === 'end' ? 'ambrose-asleep' : 'ambrose-up');
    this.set('hop', 0);
    this.set('slide', 0);
    this.set('flare', 1);
    this.set('veil', stage === 'end' ? DUSK_ALPHA : 0);
    this.sig = this.signature(state);
    this.draw(state);
  }

  // what draw() depends on: the stage and every count of every job
  signature(state) {
    return JSON.stringify([state.stage, state.jobs.map((j) => [j.trees, j.carried, j.crate, j.set, j.rows, j.planted, j.cartLeft, j.help, j.done, j.result !== null])]);
  }

  // Ambrose carries her in from the left, and she hops down at the gate; done() once she is on her feet
  rideIn(done) {
    this.set('hop', 1);
    this.set('slide', -RIDE_FROM);
    this.glide('slide', 0, RIDE_MS, 'inOut', () => this.glide('hop', 0, HOP_MS, 'out', done));
  }

  // a dark blue veil comes over the picture; done() once it is there
  dusk(done) {
    this.glide('veil', DUSK_ALPHA, DUSK_MS, 'inOut', done);
  }

  // her lamp flares when the amount is not right; a second flare starts the first one over, so they never fight
  flareLamp() {
    this.vals.flare = 0;
    this.glide('flare', 1, FLARE_MS);
  }

  // rebuild every picture that follows the state: bare trees, chalk, rows, saplings, apples, the lamp's cells and ghosts
  draw(state) {
    for (const list of Object.values(this.dyn)) { for (const o of list) o.destroy(); list.length = 0; }
    const defs = this.ctl.defs, [wren, hobb, farmer] = state.jobs, put = (key, x, y, depth, scale = 1) => this.add.image(x, y, key).setOrigin(0.5, 1).setScale(scale).setDepth(depth);
    const ghost = (img) => { img.setAlpha(0.55).setTint(GHOST); this.dyn.ghosts.push(img); return img; };
    this.gateTrees.forEach((t, i) => t.setTexture(wren.trees.includes(i) ? 'tree-bare' : 'tree'));
    this.rows.forEach((r, k) => r.setTexture(k < farmer.rows ? 'row-dug' : 'row-grass'));
    // Wren's rows in the basket, her crate and what she carries
    const basket = this.object('basket').at, perW = defs.wren.per;
    for (let i = 0; i < wren.set * perW; i++) { const p = basketPoint(basket, perW, i); this.dyn.basket.push(put('apple', p.x, p.y, 8000 + p.y * 0.0001, 0.8)); }
    const [box] = this.object('crate').rects;
    for (let i = 0; i < Math.min(wren.crate, 6); i++) this.dyn.crate.push(put('apple', box.x + box.w / 2 + (i % 3 - 1) * 14, box.y + 22 - Math.floor(i / 3) * 9, box.y + box.h + 1 + i * 0.01, 1.1));
    for (let i = 0; i < Math.min(wren.carried, 6); i++) this.dyn.carried.push(put('apple', 0, 0, 9000, 1.2));
    for (let i = 0; i < Math.min(farmer.carried, 5); i++) this.dyn.carried.push(put('sapling', 0, 0, 9000));
    // Hobb's chalk crosses, on the old trees he is to cut
    for (const i of hobb.trees) { const b = this.oldBase(i); this.dyn.chalks.push(put('chalk', b.x, b.y - 24, b.y + 1)); }
    // the saplings on the cart while any are left (fewer as the last trips near), and in the field's planted rows, each sorted by its feet
    const [wagon] = this.object('cart').rects, onCart = farmer.cartLeft === null ? 5 : Math.min(5, Math.ceil(farmer.cartLeft / defs.farmer.per));
    for (let i = 0; i < onCart; i++) this.dyn.cart.push(put('sapling', wagon.x + wagon.w / 2 + (i - 2) * 11, wagon.y + 22 - (i % 2) * 4, wagon.y + wagon.h + 1));
    for (let k = 0; k < farmer.planted; k++) for (let j = 0; j < rowCells(k, defs.farmer); j++) { const p = fieldPoint(this.rows[k].x, j); this.dyn.saplings.push(put('sapling', p.x, p.y, p.y, 1.5)); }
    // the lamp's help, only in a job's own stage: gold cells where the units go, pale gold places for what is still missing
    const job = JOBS.includes(state.stage) ? jobOf(state, state.stage) : null;
    if (job && job.help && !job.done) {
      const cell = (p, depth, size = 0.75) => this.dyn.cells.push(put('cell', p.x, p.y, depth, size));
      const def = defs[job.job];
      if (job.job === 'wren') {
        for (const { row, col } of goldCells(def.answer, def.per)) cell(basketPoint(basket, def.per, row * def.per + col), 7999);
        if (job.help === 'copy') for (let i = job.set * def.per; i < def.answer * def.per; i++) { const p = basketPoint(basket, def.per, i); ghost(put('apple', p.x, p.y, 8000 + p.y * 0.0001, 0.8)); }
      } else if (job.job === 'hobb') {
        for (const { row, col } of goldCells(def.answer, def.per)) cell(doorPoint(def.per, row * def.per + col), 7999);
        if (job.help === 'copy') for (let i = 0; i < def.answer; i++) if (!job.trees.includes(i)) { const b = this.oldBase(i); ghost(put('chalk', b.x, b.y - 24, b.y + 1)); }
      } else {
        for (let k = 0; k < def.answer; k++) for (let j = 0; j < rowCells(k, def); j++) { const p = fieldPoint(this.rows[k].x, j); cell(p, 7999, 1.6); }
        if (job.help === 'copy' && job.result === null) for (let k = job.rows; k < def.answer; k++) ghost(this.add.image(this.rows[k].x, 160, 'row-dug').setOrigin(0.5, 0).setDepth(-899));
      }
    }
    this.painted = {};
    this.paint();
  }

  oldBase(i) {
    const [r] = this.object(`oldTree${i}`).rects;
    return { x: r.x + r.w / 2, y: r.y + r.h };
  }

  // grey until a job is done, then the colour comes back
  paint() {
    const jobs = { wren: this.gateTrees, hobb: this.oldTrees, farmer: [...this.rows, ...this.dyn.saplings] };
    for (const [name, list] of Object.entries(jobs)) {
      const tint = mix(GREY, WHITE, this.vals[name]);
      if (this.painted[name] === tint) continue;
      this.painted[name] = tint;
      for (const o of list) o.setTint(tint);
    }
  }

  // what the scene has drawn, counted from its own pictures
  counts() {
    const d = this.dyn;
    return {
      bare: this.gateTrees.filter((t) => t.texture.key === 'tree-bare').length,
      chalks: d.chalks.length,
      dug: this.rows.filter((r) => r.texture.key === 'row-dug').length,
      saplings: d.saplings.length,
      basketApples: d.basket.length,
      cells: d.cells.length,
      ghosts: d.ghosts.length,
    };
  }

  render() {
    const c = this.ctl, state = c.state, now = this.time.now / 1000;
    const sig = this.signature(state);
    if (sig !== this.sig) { this.sig = sig; this.draw(state); }
    this.stepGlides();
    this.paint();
    this.veil.setAlpha(this.vals.veil);
    const { x, y } = this.girl; // the lamp, its flare and what she carries all follow her picture
    this.dyn.carried.forEach((img, i, all) => img.setPosition(x + (i - (all.length - 1) / 2) * 9, y - 80 - (i % 2) * 4));
    this.lamp.setPosition(x + 18, y - 22).setDepth(this.girl.depth + 0.2);
    this.lampGlow.setPosition(x + 18, y - 44).setDepth(this.girl.depth + 0.3).setAlpha(0.4 + 0.08 * Math.sin(now * 3));
    this.flare.setPosition(x + 18, y - 44).setDepth(this.girl.depth + 0.4).setAlpha(0.95 * (1 - this.vals.flare)).setScale(1.2 + this.vals.flare);
    const live = c.started && !c.frozen, objects = c.data.objects;
    const press = this.pressTarget = live ? actionTarget(c.pos, state, c.defs, objects) : { kind: 'none' }; // the controller's refreshAct() reads this, so the target is worked out once a frame
    const target = press.kind === 'none' ? null : objects.find((o) => o.id === press.objectId).at;
    this.ring.setVisible(!!target);
    if (target) this.ring.setPosition(target.x, target.y + 4).setAlpha(0.26 + 0.1 * Math.sin(now * 4));
    const mark = live ? nextMark(c.pos, state, c.defs, objects) : null;
    this.arrow.setVisible(!!mark);
    if (mark) this.arrow.setPosition(mark.x, mark.y - 70 + Math.sin(now * 4) * 5);
  }

  setUpCamera() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, ORCHARD.WORLD.w, ORCHARD.WORLD.h);
    this.follow(LERP);
    this.scale.on('resize', () => this.fit());
  }

  follow(lerp) {
    this.cameras.main.startFollow(this.girl, false, lerp, lerp);
    this.fit();
  }

  // zoom so the camera shows VIEW_HEIGHT units from top to bottom, with her a little below the middle
  fit() {
    const { width, height } = this.scale.gameSize;
    const zoom = Math.max(height / VIEW_HEIGHT, width / ORCHARD.WORLD.w);
    const cam = this.cameras.main;
    cam.setZoom(zoom);
    cam.setFollowOffset(0, LOW * (height / zoom));
    this.fitScreen();
  }

  // the dusk covers the whole screen whatever its shape: it does not scroll, and the camera's zoom is undone
  fitScreen() {
    if (!this.veil) return;
    const { width, height } = this.scale.gameSize, zoom = this.cameras.main.zoom;
    this.veil.setPosition(width / 2, height / 2).setDisplaySize(width / zoom + 8, height / zoom + 8);
  }

  // after she is placed somewhere new (a test's goto): the camera is there at once, then drifts as usual
  snapCamera() {
    this.girl.setPosition(this.ctl.pos.x, this.ctl.pos.y);
    this.follow(1);
    const snap = (this.snaps = (this.snaps || 0) + 1); // only the latest snap's timer settles the camera, so an earlier one cannot end a later snap early
    this.time.delayedCall(120, () => { if (snap === this.snaps) this.follow(LERP); });
  }

  // the pad's four buttons by pointer, the arrows and WASD by key; the action by Space or Enter
  setUpInput() {
    const down = new Set(), keys = new Set();
    this.heldDirections = () => ({ x: (down.has('right') || keys.has('right') ? 1 : 0) - (down.has('left') || keys.has('left') ? 1 : 0), y: (down.has('down') || keys.has('down') ? 1 : 0) - (down.has('up') || keys.has('up') ? 1 : 0) });
    for (const id of ['up', 'down', 'left', 'right']) {
      const button = document.getElementById(id);
      const off = () => down.delete(id);
      button.addEventListener('pointerdown', (e) => { e.preventDefault(); down.add(id); });
      for (const type of ['pointerup', 'pointerleave', 'pointercancel']) button.addEventListener(type, off);
    }
    const clear = () => { down.clear(); keys.clear(); };
    addEventListener('blur', clear);
    document.addEventListener('visibilitychange', clear);
    addEventListener('keydown', (e) => {
      if (FACE[e.code]) { e.preventDefault(); keys.add(FACE[e.code]); return; }
      if ((e.code === 'Space' || e.code === 'Enter') && this.ctl.started && !e.repeat) {
        if (e.target.closest?.('#card')) return; // Enter or Space on a card's button presses that button
        e.preventDefault();
        this.ctl.press?.();
      }
    });
    addEventListener('keyup', (e) => { if (FACE[e.code]) keys.delete(FACE[e.code]); });
    this.clearInput = clear; // Stop and hide: no direction carries on
    // the action button: one press does one thing
    document.getElementById('act').addEventListener('pointerdown', (e) => { e.preventDefault(); this.ctl.press?.(); });
  }

  update() {
    // the orchard is ready once a few frames have been drawn: the first ones upload every picture and run slow
    if (this.frames < READY_FRAMES && ++this.frames === READY_FRAMES) this.ctl.sceneReady();
    const c = this.ctl, dir = this.heldDirections();
    const now = performance.now(), seconds = this.lastFrame === undefined ? 0 : Math.min(MAX_FRAME, (now - this.lastFrame) / 1000); // real time, so her speed is the same on every screen
    this.lastFrame = now;
    const moving = c.started && !c.frozen && !c.still && (dir.x !== 0 || dir.y !== 0);
    if (moving) {
      // step() counts at most STEP_SECONDS at a time, so a slow frame is walked in several steps and loses none of its time
      for (let left = seconds; left > 0; left -= STEP_SECONDS) c.pos = step(c.pos, dir, Math.min(STEP_SECONDS, left), this.obstacles, ORCHARD.WORLD);
      this.facing = Math.abs(dir.x) >= Math.abs(dir.y) ? 'side' : dir.y > 0 ? 'down' : 'up';
      if (dir.x) this.toLeft = dir.x < 0;
      this.stride += seconds * 1000;
      this.moved += seconds * 1000;
      if (this.moved >= 2000) { this.moved = 0; c.savePosition?.(); } // her place is kept every two seconds of walking
    } else this.stride = 0;
    this.girl.setTexture(`girl-${this.facing}-${Math.floor(this.stride / 160) % 2}`).setFlipX(this.facing === 'side' && this.toLeft);
    // while Ambrose carries her in she is on his shell, which moves with him; her saved place is where she stands
    const hop = this.vals.hop, back = { x: this.ambroseHome.x - 10, y: this.ambroseHome.y - 104 };
    const gx = c.pos.x + (back.x - c.pos.x) * hop + this.vals.slide, gy = c.pos.y + (back.y - c.pos.y) * hop;
    this.girl.setPosition(gx, gy).setDepth(hop > 0 ? this.ambroseHome.y + 10 : gy);
    this.shadow.setPosition(gx - 3, gy - 1).setDepth(gy - 0.5).setAlpha(hop > 0 ? 0 : 1);
    this.ambrose.setPosition(this.ambroseHome.x + this.vals.slide, this.ambroseHome.y);
    this.render();
    c.refreshAct?.();
  }
}
