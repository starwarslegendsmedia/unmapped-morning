// The morning's world: the yard, drawn from world/morning.json's object table, with her walking in it. Everything is
// sorted by the y of its feet, so she goes behind a tree and in front of a bench. Input comes from the four DOM pad
// buttons and the keyboard; there is no tap-to-walk. The shared state (her place, whether the first tap was made, what
// she may do) is the controller object world/main.js makes and hands in. The close of the morning (the lantern picture,
// the Grey, the neighbour, her lantern's ring, Ambrose on his feet and the end) is drawn here too, by showStage().

import { makeRng } from '../engine/rng.js';
import { K, step, cellAt, goldCells } from './logic.js';
import { makeTextures } from './draw.js';

const GLOW = 1;          // additive blending: the vendored build numbers it 1, and plain blending 0
const VIEW_HEIGHT = 400; // world units the camera shows from top to bottom
const LERP = 0.1;        // how quickly the camera catches up with her
const READY_FRAMES = 12; // frames drawn before the card that starts her walking is shown
const STEP_SECONDS = 0.1; // the most time one call of step() counts (its own limit)
const MAX_FRAME = 0.5;    // the most time one frame may walk, so coming back to a paused page cannot fling her across the yard
const LOW = 0.12;        // how far below the middle of the screen she stands, as a share of its height
const GHOST = 0xf4d98a;  // the pale gold the copy's still-empty places are drawn in
const ORDER = ['start', 'apples', 'socks', 'eggs', 'extra', 'lantern', 'grey', 'lamp', 'ambrose', 'end']; // the stage machine, in order
const FOG_COLOUR_ALPHA = 0.7;  // the thickest one strip of Grey is drawn; two meet at each corner and add to a little more, and the middle around her is clear
const FOG_INNER = 215;         // world units from her to the clear edge of the Grey on every side: more than 200, and beyond her ring
const FOG_LENGTH = 700;        // how far each strip of Grey reaches out from its clear edge
const FOG_SPAN = 1700;         // how wide each strip is along the edge it lines
const FOG_SECONDS = 6;         // the Grey comes in over this long
const RING = 140;              // the radius of her lantern's ring on the ground
const SLIDE = 380;             // how far Ambrose carries her before the end
const VEIL = 0x2b1e0c;         // the dark the picture goes to for the end card
const FACE = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };

export class MorningScene extends Phaser.Scene {
  constructor(ctl) {
    super('morning');
    this.ctl = ctl;
  }

  create() {
    const { data } = this.ctl;
    this.obstacles = data.objects.flatMap((o) => o.rects);
    makeTextures(this, makeRng('morning-art'), data.objects);
    this.add.image(0, 0, 'ground').setOrigin(0, 0).setDepth(-1000);
    this.setUpStage(data);
    this.setUpGirl();
    this.setUpJobs(data);
    this.setUpClose();
    this.setUpCamera();
    this.setUpInput();
    this.ctl.scene = this;
    this.ctl.teleported = () => this.snapCamera();
    this.frames = 0;
  }

  // everything that stands in the yard, at the bottom centre of its collision rectangle
  setUpStage(data) {
    const rect = (id) => data.objects.find((o) => o.id === id).rects;
    const put = (key, x, y, depth = y) => this.add.image(x, y, key).setOrigin(0.5, 1).setDepth(depth);
    const base = (id) => { const [r] = rect(id); return { x: r.x + r.w / 2, y: r.y + r.h }; };
    for (const [id, key] of [['cottage', 'cottage'], ['appleTree', 'tree'], ['pieBasket', 'bench'], ['henHouse', 'henhouse'], ['eggCrate', 'crate'], ['sockBasket', 'socks'], ['rockA', 'rock0'], ['rockB', 'rock1'], ['rockC', 'rock2']]) {
      const at = base(id);
      put(key, at.x, at.y);
    }
    const [post, other] = rect('washingLine');
    put('line', (post.x + other.x + post.w) / 2, post.y + post.h);
    const amb = base('ambrose');
    this.ambrose = put('ambrose-asleep', amb.x, amb.y);
    this.ambroseHome = amb;
    // Gran where the table says she stands, at the door, and her lantern on its hook beside it (S2: the hook is at 1050,310)
    const door = data.objects.find((o) => o.id === 'cottage').at;
    this.gran = put('gran', door.x, door.y);
    this.hook = put('lantern', 1050, 310);
    this.lanternGlow = this.add.image(1050 + 14, 310 - 56, 'glow').setScale(0.7).setAlpha(0.8).setBlendMode(GLOW).setDepth(311);
    this.tweens.add({ targets: this.lanternGlow, alpha: 0.5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // the sun, low in the top right corner of the sky
    this.add.image(1300, 20, 'glow').setScale(5.5).setAlpha(0.28).setBlendMode(GLOW).setDepth(9000);
    // hens in the yard, swaying a little as they peck
    [['hen-brown', 420, 640, false, 0], ['hen-gold', 360, 700, true, 400], ['hen-brown', 470, 570, true, 900]].forEach(([key, x, y, flip, delay]) => {
      const hen = put(key, x, y).setFlipX(flip);
      this.tweens.add({ targets: hen, angle: { from: -5, to: 5 }, duration: 700, delay, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
    // fences along the four edges, the way she cannot go
    const { w, h } = K.WORLD;
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

  // the jobs' pictures: the soft rings under what she can reach, the arrow to the next thing, the units on the target, on
  // the ground and on her back, the gold cells and the lantern's flare. The unit pictures are rebuilt when a count changes.
  setUpJobs(data) {
    this.units = [];
    this.carriedSprites = [];
    this.sig = '';
    this.spillFrom = null;
    this.moved = 0;
    this.rings = new Map();
    for (const id of ['appleTree', 'pieBasket', 'henHouse', 'eggCrate', 'sockBasket', 'washingLine', 'cottage', 'neighbour', 'ambrose']) {
      const { at } = this.object(id);
      this.rings.set(id, this.add.ellipse(at.x, at.y + 4, 76, 26, 0xffe9a0, 0.3).setDepth(1).setVisible(false));
    }
    this.arrow = this.add.image(0, 0, 'arrow').setOrigin(0.5, 1).setDepth(9500).setVisible(false);
    this.flare = this.add.image(1050 + 14, 310 - 56, 'glow').setScale(1.4).setAlpha(0).setBlendMode(GLOW).setDepth(312);
  }

  // the close of the morning: everything here is hidden until showStage() says which stage she is in. Nothing here is a
  // Phaser tween: a value glides to its target on the scene's own clock, so a stage change or a replay can overwrite it.
  setUpClose() {
    const near = this.object('neighbour').at;
    this.neighbour = this.add.image(near.x - 44, near.y, 'neighbour').setOrigin(0.5, 1).setDepth(near.y).setVisible(false); // beside her mark, so the girl does not stand inside her
    this.lamp = this.add.image(0, 0, 'lantern-small').setOrigin(0.5, 1).setVisible(false);
    this.lampGlow = this.add.image(0, 0, 'glow').setScale(0.55).setBlendMode(GLOW).setVisible(false);
    this.ring = this.add.ellipse(0, 0, RING * 2, RING * 1.35, 0xf4c25b, 0.16).setStrokeStyle(5, 0xf6c34a, 0.85).setBlendMode(GLOW).setDepth(2).setVisible(false);
    // four strips of Grey, one on each side of her, each clear at the edge nearest her and thick beyond it
    this.fogs = [[0, 1, 0], [180, -1, 0], [-90, 0, -1], [90, 0, 1]].map(([angle, dx, dy]) => ({ dx, dy, img: this.add.image(0, 0, 'fogedge').setOrigin(0, 0.5).setAngle(angle).setDisplaySize(FOG_LENGTH, FOG_SPAN).setDepth(9400).setVisible(false) }));
    this.pic = this.add.image(0, 0, 'lantern-pic').setScrollFactor(0).setDepth(20000).setVisible(false);
    this.veil = this.add.rectangle(0, 0, 10, 10, VEIL).setScrollFactor(0).setDepth(30000).setAlpha(0);
    this.vals = { pic: 0, veil: 0, fog: 0, lit: 0, hop: 0, slide: 0 };
    this.glides = {};
    this.stage = 'start';
  }

  // a value moves to its target over `ms` on the scene's clock; `ease` is 'out' (quick, then slow), 'out4' (quicker still) or 'inOut'
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
      const t = Math.min(1, (this.time.now - g.start) / g.ms), e = g.ease === 'inOut' ? (t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2) : 1 - (1 - t) ** (g.ease === 'out4' ? 4 : 2);
      this.vals[name] = g.from + (g.to - g.from) * e;
      if (t >= 1) { delete this.glides[name]; g.done?.(); }
    }
  }

  // draw the close as it is in this stage: used on entering a stage, on a reload at any stage and when a new morning begins
  showStage(stage) {
    const past = (s) => ORDER.indexOf(stage) >= ORDER.indexOf(s), over = stage === 'end';
    this.stage = stage;
    for (const o of [this.gran, this.hook, this.lanternGlow]) o.setVisible(!past('lantern')); // Gran has gone and the lantern is hers
    this.lamp.setVisible(past('lantern') && !over);
    this.lampGlow.setVisible(past('lantern') && !over);
    this.neighbour.setVisible(past('grey') && !over).setTint(past('ambrose') ? 0xffffff : 0xc0c4cf); // the colour comes back once her light has fallen
    this.ambrose.setTexture(past('ambrose') ? 'ambrose-up' : 'ambrose-asleep').setVisible(!over).setPosition(this.ambroseHome.x, this.ambroseHome.y).setDepth(this.ambroseHome.y);
    this.girl.setVisible(!over);
    this.shadow.setVisible(!over);
    this.pic.setVisible(stage === 'lantern');
    this.set('hop', 0);
    this.set('slide', 0);
    this.set('pic', stage === 'lantern' ? 1 : 0);
    this.set('fog', past('lamp') && !over ? 1 : 0);
    if (stage === 'grey') this.glide('fog', 1, FOG_SECONDS * 1000, 'out4'); // the Grey is seen at once and thickens over the six seconds
    this.set('lit', past('ambrose') && !over ? 1 : 0);
    this.set('veil', over ? 1 : 0);
  }

  // her press at the lamp: the ring of light spreads, and the Grey draws back from it; done() once the ring is full
  lightLantern(done) {
    this.glide('lit', 1, 1200, 'out', done);
  }

  // Ambrose lifts her onto his shell and plods off with her while the picture darkens; done() once it is dark
  carryOff(done) {
    this.glide('hop', 1, 450);
    this.glide('slide', SLIDE, 1900, 'inOut');
    this.glide('veil', 1, 1900, 'inOut', done);
  }

  renderClose() {
    if (!this.fogs) return;
    const v = this.vals, now = this.time.now / 1000, { x, y } = this.girl; // all follow her picture, so they go with her on Ambrose
    this.stepGlides();
    this.pic.setAlpha(v.pic);
    this.veil.setAlpha(v.veil);
    const fog = FOG_COLOUR_ALPHA * v.fog * (1 - 0.35 * v.lit) * (0.94 + 0.06 * Math.sin(now * 1.4));
    for (const { dx, dy, img } of this.fogs) img.setVisible(fog > 0.004).setAlpha(fog).setPosition(x + dx * FOG_INNER, y + dy * FOG_INNER);
    const on = this.lamp.visible && !this.veil.alpha;
    this.lamp.setPosition(x + 18, y - 22).setDepth(this.girl.depth + 0.2); // just in front of her, on Ambrose's shell as well
    this.lampGlow.setPosition(x + 18, y - 44).setDepth(this.girl.depth + 0.3).setAlpha(on ? 0.4 + 0.08 * Math.sin(now * 3) + 0.4 * v.lit : 0);
    this.ring.setVisible(v.lit > 0.01 && !this.veil.alpha).setPosition(x, y + 2).setScale(0.45 + 0.55 * v.lit).setAlpha((0.55 + 0.15 * Math.sin(now * 2.2)) * v.lit);
  }

  // the picture and the dark cover the whole screen whatever its shape: they do not scroll, and the camera's zoom is undone
  fitScreen() {
    if (!this.pic) return;
    const { width, height } = this.scale.gameSize, zoom = this.cameras.main.zoom;
    this.pic.setPosition(width / 2, height / 2).setScale(Math.max(width / 1080, height / 500) / zoom);
    this.veil.setPosition(width / 2, height / 2).setDisplaySize(width / zoom + 8, height / zoom + 8);
  }

  object(id) { return this.ctl.data.objects.find((o) => o.id === id); }

  // the picture of one unit of a job: the apple, the egg, or one of the four socks
  unitKey(job, i) { return job === 'socks' ? `sock${i % 4}` : job === 'eggs' ? 'egg' : 'apple'; }

  // where the i-th unit of a job lies on its target, in rows of perGroup across, row by row
  cellPoint(job, i) {
    const { at } = this.object(this.ctl.data.jobs[job.job].target), { row, col } = cellAt(i, job.perGroup);
    return { x: at.x + (col - (job.perGroup - 1) / 2) * 8, y: at.y - 24 - row * 8 };
  }

  // the depth that puts the units just in front of the target's own picture
  targetDepth(job) {
    return Math.max(...this.object(this.ctl.data.jobs[job.job].target).rects.map((r) => r.y + r.h)) + 1;
  }

  rebuildUnits(job) {
    for (const o of this.units) o.destroy();
    this.units = [];
    this.carriedSprites = [];
    if (!job) return;
    // `rise` marks the help on the target (set units, gold cells, copy ghosts) and the extras on the ground: render() lifts their depth above hers
    const base = this.targetDepth(job), put = (key, x, y, depth, scale, rise = false) => { const img = this.add.image(x, y, key).setOrigin(0.5, 1).setScale(scale).setDepth(depth); if (rise) img.helpDepth = depth; this.units.push(img); return img; };
    // the gold outline cells, empty squares, once she has been helped; the copy's pale places beside her own units
    if (job.help) for (const { row, col } of goldCells(job.groups, job.perGroup)) { const p = this.cellPoint(job, row * job.perGroup + col); put('cell', p.x, p.y, base + 0.5, 0.75, true); }
    for (let i = 0; i < job.set; i++) { const p = this.cellPoint(job, i); put(this.unitKey(job.job, i), p.x, p.y, base + 1 + p.y * 0.0001, 0.8, true); }
    if (job.help === 'copy') for (let i = job.set; i < job.answer; i++) { const p = this.cellPoint(job, i); put(this.unitKey(job.job, i), p.x, p.y, base + 1 + p.y * 0.0001, 0.8, true).setAlpha(0.55).setTint(GHOST); }
    const from = this.spillFrom;
    this.spillFrom = null;
    job.ground.forEach((p, i) => {
      const img = put(this.unitKey(job.job, i), from ? from.x : p.x, from ? from.y - 24 : p.y, p.y + 0.5, 1.2, true);
      if (from) this.tweens.add({ targets: img, x: p.x, y: p.y, duration: 380, delay: i * 50, ease: 'Quad.easeOut' });
    });
    for (let i = 0; i < job.carried + job.carriedGround; i++) this.carriedSprites.push(put(this.unitKey(job.job, i), 0, 0, 9000, 1.2));
  }

  // how far the help on a target is lifted: she usually stands in front of the target, where her own picture would hide the
  // cells and units she is looking for, so the help is drawn above her whenever her feet are below the target's picture
  lift(job) { return Math.max(0, this.ctl.pos.y + 1 - this.targetDepth(job)); }

  // the units of a finished check rise from the target's cells and fade
  cellsAway(job, count) {
    const base = this.targetDepth(job), up = this.lift(job);
    for (let i = 0; i < count; i++) {
      const p = this.cellPoint(job, i), img = this.add.image(p.x, p.y, this.unitKey(job.job, i)).setOrigin(0.5, 1).setScale(0.8).setDepth(base + 1 + up);
      this.tweens.add({ targets: img, y: p.y - 18, alpha: 0, duration: 700, delay: i * 35, ease: 'Quad.easeOut', onComplete: () => img.destroy() });
    }
  }

  // Gran's lantern flares when the amount is not right
  flareLantern() {
    this.tweens.add({ targets: this.flare, alpha: { from: 0.95, to: 0 }, scale: { from: 1.2, to: 2.2 }, duration: 1100, ease: 'Quad.easeOut' });
  }

  // the thing to go to next: the source while her hands are empty, the target while she carries, Gran when something is set down
  nextMark(job) {
    if (!job || job.done) return null;
    const { source, target } = this.ctl.data.jobs[job.job], carrying = job.carried + job.carriedGround > 0, copyFull = job.help === 'copy' && job.set >= job.answer;
    if (job.carriedGround > 0 && !copyFull) return this.object(source).at;
    if (carrying) return copyFull ? this.object('cottage').at : this.object(target).at;
    if (job.ground.length) {
      const p = job.ground.reduce((a, b) => (Math.hypot(a.x - this.ctl.pos.x, a.y - this.ctl.pos.y) <= Math.hypot(b.x - this.ctl.pos.x, b.y - this.ctl.pos.y) ? a : b));
      return { x: p.x, y: p.y + 40 }; // the arrow stands just above the unit (render() lifts a mark by 70)
    }
    if (job.set > 0 && !(job.help === 'copy' && job.set < job.answer)) return this.object('cottage').at;
    return this.object(source).at;
  }

  render() {
    const c = this.ctl, job = c.job(), now = this.time.now / 1000;
    const sig = job ? JSON.stringify([c.state.stage, job.carried, job.carriedGround, job.set, job.ground, job.help, job.done]) : '';
    if (sig !== this.sig) { this.sig = sig; this.rebuildUnits(job); }
    // her place is not part of the picture's key, so the help's depth follows her on every frame
    if (job) { const up = this.lift(job); for (const o of this.units) if (o.helpDepth !== undefined && o.depth !== o.helpDepth + up) o.setDepth(o.helpDepth + up); }
    this.carriedSprites.forEach((img, i, all) => img.setPosition(c.pos.x + (i - (all.length - 1) / 2) * 9, c.pos.y - 80 - (i % 2) * 4));
    const closing = c.closeTarget?.() ?? { kind: 'none' };
    const live = job && !job.done && !c.frozen ? new Set([c.data.jobs[job.job].source, c.data.jobs[job.job].target, ...(job.set > 0 ? ['cottage'] : [])]) : new Set(closing.id ? [closing.id] : []);
    for (const [id, ring] of this.rings) {
      const { at } = this.object(id), near = live.has(id) && Math.hypot(c.pos.x - at.x, c.pos.y - at.y) <= K.REACH;
      ring.setVisible(near).setAlpha(0.26 + 0.1 * Math.sin(now * 4));
    }
    const mark = c.started && !c.frozen ? this.nextMark(job) ?? c.closeMark?.() ?? null : null;
    this.arrow.setVisible(!!mark);
    if (mark) this.arrow.setPosition(mark.x, mark.y - 70 + Math.sin(now * 4) * 5);
    this.renderClose();
  }

  setUpCamera() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, K.WORLD.w, K.WORLD.h);
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
    const zoom = Math.max(height / VIEW_HEIGHT, width / K.WORLD.w);
    const cam = this.cameras.main;
    cam.setZoom(zoom);
    cam.setFollowOffset(0, LOW * (height / zoom));
    this.fitScreen();
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
        if (e.target.closest?.('#card')) return; // Enter or Space on Carry on or Next presses that button
        e.preventDefault();
        this.ctl.press?.();
      }
    });
    addEventListener('keyup', (e) => { if (FACE[e.code]) keys.delete(FACE[e.code]); });
    // the action button: a press does one thing at once; keeping it pressed repeats a pick-up or a put-back at a source
    // every HOLD_REPEAT_MS, the same kind each time, and stops when that kind cannot go on. Anything that ends the
    // press clears the repeat.
    const act = document.getElementById('act');
    let repeat = null;
    const stop = () => { clearInterval(repeat); repeat = null; };
    this.clearInput = () => { clear(); stop(); }; // Stop and hide: no direction or press carries on
    act.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      stop();
      const kind = this.ctl.press?.();
      if (kind === 'pickUp' || kind === 'putBack') repeat = setInterval(() => { if (!this.ctl.press?.(kind)) stop(); }, K.HOLD_REPEAT_MS);
    });
    for (const type of ['pointerup', 'pointercancel']) { act.addEventListener(type, stop); addEventListener(type, stop); }
    addEventListener('blur', stop);
    document.addEventListener('visibilitychange', stop);
  }

  update() {
    // the yard is ready once a few frames have been drawn: the first ones upload every picture and run slow
    if (this.frames < READY_FRAMES && ++this.frames === READY_FRAMES) this.ctl.sceneReady();
    const c = this.ctl, dir = this.heldDirections();
    const now = performance.now(), seconds = this.lastFrame === undefined ? 0 : Math.min(MAX_FRAME, (now - this.lastFrame) / 1000); // real time, so her speed is the same on every screen
    this.lastFrame = now;
    const moving = c.started && !c.frozen && !c.still && (dir.x !== 0 || dir.y !== 0);
    if (moving) {
      // step() counts at most STEP_SECONDS at a time, so a slow frame is walked in several steps and loses none of its time
      for (let left = seconds; left > 0; left -= STEP_SECONDS) c.pos = step(c.pos, dir, Math.min(STEP_SECONDS, left), this.obstacles, K.WORLD);
      this.facing = Math.abs(dir.x) >= Math.abs(dir.y) ? 'side' : dir.y > 0 ? 'down' : 'up';
      if (dir.x) this.toLeft = dir.x < 0;
      this.stride += seconds * 1000;
      this.moved += seconds * 1000;
      if (this.moved >= 2000) { this.moved = 0; c.savePosition?.(); } // her place is kept every two seconds of walking
    } else this.stride = 0;
    this.girl.setTexture(`girl-${this.facing}-${Math.floor(this.stride / 160) % 2}`).setFlipX(this.facing === 'side' && this.toLeft);
    // while Ambrose carries her she is on his shell, which moves off with him; her saved place is where she stood
    const hop = this.vals.hop, back = { x: this.ambroseHome.x - 10, y: this.ambroseHome.y - 104 };
    const gx = c.pos.x + (back.x - c.pos.x) * hop + this.vals.slide, gy = c.pos.y + (back.y - c.pos.y) * hop;
    this.girl.setPosition(gx, gy).setDepth(hop > 0 ? this.ambroseHome.y + 10 : gy);
    this.shadow.setPosition(gx - 3, gy - 1).setDepth(gy - 0.5).setAlpha(hop > 0 ? 0 : 1);
    if (hop > 0) this.ambrose.setPosition(this.ambroseHome.x + this.vals.slide, this.ambroseHome.y);
    this.render();
    c.refreshAct?.();
  }
}
