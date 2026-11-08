// The orchard, drawn in code in the morning's style (world/draw.js): flat-shaded triangles, light from the right, every
// picture baked once into a texture and anchored at its feet. world/orchard-scene.js sets each one down at the bottom
// centre of its object's collision rectangle. It uses the morning's own drawing functions, exported from draw.js, for
// the girl, Ambrose, the apple tree, the fences, the units and marks. No picture carries a digit.

import { shade, grid, fan, lump, boards, appleTree, ambrose, girl, fenceAcross, fenceDown, units, marks, tri } from './draw.js';

const PEACH = 0xe8b48a;
const STAND = 14; // how much longer Ambrose's legs are drawn when he is on his feet (the morning's own number)
const pts = (list) => list.map(([x, y]) => ({ x, y }));
const poly = (g, list, col, alpha = 1) => g.fillStyle(col, alpha).fillPoints(pts(list), true);
const bar = (g, x, y, w, h, col) => g.fillStyle(col, 1).fillRect(x, y, w, h);

export function makeOrchardTextures(scene, rng, objects = []) {
  const g = scene.add.graphics();
  const gen = (key, w, h) => { g.generateTexture(key, w, h); g.clear(); };

  // a soft warm glow, for the lamp's flare
  const c = scene.textures.createCanvas('glow', 256, 256);
  const ctx = c.getContext();
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,240,200,1)');
  grad.addColorStop(0.2, 'rgba(255,215,140,0.8)');
  grad.addColorStop(0.5, 'rgba(255,190,90,0.22)');
  grad.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  c.refresh();

  ground(g, rng, objects); gen('ground', 1800, 900);
  appleTree(g, rng); gen('tree', 230, 240);
  orchardTree(g, rng, false); gen('tree-bare', 230, 240);
  chalk(g); gen('chalk', 28, 28);
  rowStrip(g, rng, false); gen('row-grass', 36, 600);
  rowStrip(g, rng, true); gen('row-dug', 36, 600);
  sapling(g); gen('sapling', 14, 26);
  cart(g, rng); gen('cart', 100, 70);
  crate(g, rng); gen('crate', 70, 50);
  basket(g, rng); gen('basket', 56, 40);
  barn(g, rng); gen('barn', 300, 270);
  stump(g, rng); gen('stump', 44, 30);
  stone(g, rng); gen('stone', 70, 24);
  gate(g, rng); gen('gate', 24, 92);
  gatePost(g); gen('gatepost', 20, 58);
  for (const [key, look] of Object.entries(PEOPLE)) { person(g, rng, look); gen(key, 48, 86); }
  farmerSeated(g, rng); gen('farmer', 48, 70);
  for (const [key, awake] of [['ambrose-asleep', false], ['ambrose-up', true]]) { ambrose(g, awake); gen(key, 250, awake ? 170 + STAND : 170); }
  for (const view of ['down', 'up', 'side']) for (const frame of [0, 1]) { girl(g, view, frame); gen(`girl-${view}-${frame}`, 44, 70); }
  fenceAcross(g, rng); gen('fence-across', 56, 50);
  fenceDown(g, rng); gen('fence-down', 16, 98);
  units(g); // the apple she carries and tips
  marks(g); // the gold cell that shows where a unit goes, and the arrow over what to go to next
  lamp(g); gen('lamp', 24, 40);
  g.destroy();
}

// ---- the ground: grass, the road along the bottom, flowers, and the soft shadow under everything that stands ----

function ground(g, rng, objects) {
  grid(g, rng, [[0, 0], [1800, 0], [1800, 900], [0, 900]], 45, 23, 0x8bbd4c, { jit: 10, light: 0.32, noise: 6 });
  for (const [x, y, w, h, col, a] of [[1100, 300, 900, 360, 0xf6e08a, 0.14], [600, 200, 760, 300, 0xf2dc84, 0.12], [320, 560, 600, 260, 0x6a9a3a, 0.13], [1500, 700, 520, 200, 0x6a9a3a, 0.11], [900, 80, 700, 180, 0x7fae45, 0.12]]) {
    g.fillStyle(col, a).fillEllipse(x, y, w, h);
  }
  // the road, from the gate along the bottom, ragged at its upper edge
  const top = [[0, 786], [200, 778], [420, 790], [640, 774], [860, 788], [1080, 776], [1300, 790], [1520, 780], [1800, 788]];
  for (let i = 0; i < top.length - 1; i++) {
    const a = top[i], b = top[i + 1];
    tri(g, a, b, [b[0], 900], shade(0xd8b676, rng.int(-6, 6) / 100));
    tri(g, a, [b[0], 900], [a[0], 900], shade(0xcba760, rng.int(-6, 8) / 100));
  }
  for (let i = 0; i < 110; i++) { // pebbles and bare patches
    const x = rng.int(4, 1796), y = rng.int(796, 892);
    g.fillStyle(shade(0xb89a68, rng.int(-10, 12) / 100), 1).fillEllipse(x, y, rng.int(5, 12), rng.int(3, 6));
  }
  for (let i = 0; i < 460; i++) { // tufts of grass
    const x = rng.int(0, 1800), y = rng.int(0, 770), h = rng.int(4, 8);
    tri(g, [x, y], [x + rng.int(2, 4), y - h], [x + rng.int(5, 7), y], shade(0x78a840, rng.int(-10, 8) / 100));
  }
  const bloom = [0xfff8e6, 0xfff3c4, 0xf3c8d8, 0xc9a0e0];
  for (let i = 0; i < 200; i++) {
    const x = rng.int(6, 1794), y = rng.int(6, 760), col = rng.pick(bloom);
    g.fillStyle(0x5f8f3a, 1).fillRect(x, y, 1, 4);
    g.fillStyle(col, 1).fillCircle(x, y, 2.2);
    g.fillStyle(0xf3c25b, 1).fillCircle(x, y, 0.8);
  }
  // what stands casts its shadow to the left, a little toward us
  for (const o of objects) {
    for (const r of o.rects) {
      if (r.w < 40) continue;
      const w = r.w * 1.1 + 8, h = Math.min(46, 12 + r.w * 0.09);
      g.fillStyle(0x34421a, 0.26).fillEllipse(r.x + r.w / 2 - 10, r.y + r.h - 2, w, h);
    }
  }
}

// ---- trees: the apple tree is the morning's; the bare one is the same crown and trunk without its apples ----

export function orchardTree(g, rng, apples) {
  poly(g, [[92, 240], [138, 240], [130, 170], [126, 118], [106, 118], [100, 170]], 0x6b4a2c);
  tri(g, [116, 118], [138, 240], [118, 240], shade(0x6b4a2c, 0.2));
  tri(g, [92, 240], [104, 190], [86, 240], shade(0x6b4a2c, -0.2));
  tri(g, [138, 240], [126, 196], [152, 240], shade(0x6b4a2c, 0.1));
  g.lineStyle(9, 0x6b4a2c, 1).lineBetween(110, 140, 66, 96).lineBetween(124, 138, 168, 92);
  const blobs = [[60, 96, 44, 34, 0x4f8a36], [172, 92, 46, 34, 0x5f9a3a], [116, 62, 56, 40, 0x5a9438], [78, 70, 44, 34, 0x66a23e], [160, 66, 44, 32, 0x6fa83f], [116, 100, 60, 36, 0x568f37], [96, 40, 40, 28, 0x72ae42], [142, 44, 40, 28, 0x7bb548]];
  for (const [x, y, rx, ry, col] of blobs) lump(g, rng, x, y, rx, ry, apples ? col : shade(col, -0.12), 0.6, 11);
  if (apples) {
    for (let i = 0; i < 34; i++) {
      const x = rng.int(28, 202), y = rng.int(18, 118);
      if (((x - 115) / 92) ** 2 + ((y - 72) / 62) ** 2 > 1) continue;
      g.fillStyle(rng.pick([0xd8432e, 0xc53a2a, 0xe0553a]), 1).fillCircle(x, y, 4.4);
    }
  }
  g.lineStyle(4, 0x9a6a3a, 1).lineBetween(62, 240, 100, 120).lineBetween(80, 240, 114, 126); // the ladder, as the apple tree has
  for (let i = 0; i < 6; i++) { const t = 0.1 + i * 0.16; g.lineStyle(3, 0x8a5a2a, 1).lineBetween(62 + 38 * t, 240 - 120 * t, 80 + 34 * t, 240 - 114 * t); }
}

// ---- Hobb's chalk cross, the field's rows and a sapling ----

function chalk(g) {
  g.lineStyle(5, 0xffffff, 0.35).lineBetween(4, 5, 24, 25).lineBetween(24, 5, 4, 25);
  g.lineStyle(3, 0xffffff, 0.95).lineBetween(5, 6, 23, 24).lineBetween(23, 6, 5, 24);
}

function rowStrip(g, rng, dug) {
  grid(g, rng, [[0, 0], [36, 0], [36, 600], [0, 600]], 2, 30, dug ? 0x7a5a38 : 0x96c455, { jit: 2, light: 0.3, noise: 6 });
  if (dug) {
    g.lineStyle(2, 0x4a3420, 0.7).lineBetween(12, 0, 12, 600).lineBetween(24, 0, 24, 600);
    for (let i = 0; i < 40; i++) lump(g, rng, rng.int(5, 31), rng.int(6, 594), 3.5, 2.5, rng.pick([0x8a6a44, 0x6a4c2c, 0x7a5a38]), 0.5, 6);
  } else {
    for (let i = 0; i < 90; i++) { const x = rng.int(2, 32), y = rng.int(4, 594); tri(g, [x, y], [x + 2, y - 6], [x + 5, y], shade(0x78a840, rng.int(-10, 8) / 100)); }
  }
  g.lineStyle(2, 0x3a4a1c, 0.55).lineBetween(1, 0, 1, 600).lineBetween(35, 0, 35, 600);
}

function sapling(g) {
  g.lineStyle(3, 0x6b4a2c, 1).lineBetween(7, 26, 7, 11);
  tri(g, [7, 18], [1, 12], [7, 14], 0x5f9a3a);
  tri(g, [7, 16], [13, 10], [7, 12], 0x72ae42);
  g.fillStyle(0x72ae42, 1).fillCircle(7, 8, 5).fillStyle(0x8cc656, 1).fillCircle(9, 6, 2.5);
}

// ---- what stands in the orchard: the cart, the crate, the basket, the barn, a stump, a stone, the gate ----

function cart(g, rng) {
  g.lineStyle(4, 0x6e4526, 1).lineBetween(8, 36, 0, 62).lineBetween(14, 40, 6, 64); // the shafts, down to the ground
  boards(g, rng, 8, 30, 84, 22, 3, 0xa8703f, false);
  grid(g, rng, [[8, 26], [92, 26], [88, 32], [12, 32]], 5, 1, 0xc98a50, { jit: 1, light: 0.3, noise: 4 });
  poly(g, [[92, 30], [98, 36], [96, 54], [90, 52]], 0xc98a50);
  for (const x of [26, 74]) {
    g.fillStyle(0x4a2c14, 1).fillCircle(x, 56, 12).fillStyle(0x8a5a33, 1).fillCircle(x, 56, 9).fillStyle(0x4a2c14, 1).fillCircle(x, 56, 2.5);
    g.lineStyle(2, 0x4a2c14, 1).lineBetween(x - 9, 56, x + 9, 56).lineBetween(x, 47, x, 65);
  }
}

function crate(g, rng) {
  grid(g, rng, [[10, 12], [58, 12], [66, 22], [4, 22]], 4, 1, 0xe6c35a, { jit: 1, light: 0.3, noise: 5 });
  g.fillStyle(0x5a3a1c, 0.6).fillRect(12, 14, 44, 3);
  boards(g, rng, 4, 22, 58, 24, 3, 0xa8703f, false);
  poly(g, [[62, 22], [68, 14], [68, 40], [62, 46]], 0xc98a50);
  for (const x of [4, 56]) bar(g, x, 20, 6, 26, 0x6e4526);
}

function basket(g, rng) {
  g.fillStyle(0x6a4a24, 1).fillEllipse(28, 14, 50, 14);
  poly(g, [[4, 14], [52, 14], [45, 37], [11, 37]], 0xc99a50);
  fan(g, rng, [[4, 14], [52, 14], [45, 37], [11, 37]], 0xc99a50, 0.4);
  for (let y = 19; y < 36; y += 6) g.lineStyle(1.5, 0x8a6a30, 0.8).lineBetween(6 + (y - 14) * 0.3, y, 50 - (y - 14) * 0.3, y);
  g.fillStyle(0x8a6a30, 1).fillEllipse(28, 12, 44, 9);
  g.lineStyle(3, 0x8a6a30, 1).lineBetween(6, 14, 14, 3).lineBetween(14, 3, 42, 3).lineBetween(42, 3, 50, 14);
}

function barn(g, rng) {
  grid(g, rng, [[10, 108], [290, 108], [290, 268], [10, 268]], 14, 6, 0xa8452e, { jit: 3, light: 0.34, noise: 5 });
  boards(g, rng, 10, 108, 280, 160, 14, 0xa8452e);
  g.fillStyle(0x3a1a10, 0.3).fillRect(10, 108, 280, 14); // the roof's shadow on the wall
  grid(g, rng, [[28, 18], [272, 18], [298, 112], [2, 112]], 14, 6, 0x6f4a3a, { jit: 3, light: 0.5, noise: 6 });
  grid(g, rng, [[2, 112], [298, 112], [294, 124], [6, 124]], 14, 1, 0x4a3024, { jit: 1, light: 0.4 });
  g.lineStyle(3, 0xd9a07a, 0.9).lineBetween(28, 19, 272, 19);
  poly(g, [[100, 268], [100, 176], [150, 158], [200, 176], [200, 268]], 0x3a2418); // the big door
  g.lineStyle(5, 0xe8d8b8, 1).lineBetween(100, 176, 200, 268).lineBetween(200, 176, 100, 268).lineBetween(100, 176, 200, 176).lineBetween(150, 158, 150, 268);
  g.fillStyle(0x2b1a10, 1).fillRect(130, 54, 40, 32).fillStyle(0xe0b060, 1).fillRect(134, 58, 32, 24); // the hay-loft window
  g.lineStyle(3, 0x2b1a10, 1).lineBetween(150, 58, 150, 82);
}

function stump(g, rng) {
  poly(g, [[6, 12], [38, 12], [42, 28], [2, 28]], 0x7a5230);
  fan(g, rng, [[6, 12], [38, 12], [42, 28], [2, 28]], 0x7a5230, 0.4);
  g.fillStyle(0xd9b07a, 1).fillEllipse(22, 12, 36, 12);
  g.lineStyle(1.5, 0xa07a48, 1).lineBetween(14, 12, 30, 12);
  g.fillStyle(0xa07a48, 1).fillEllipse(22, 12, 18, 6).fillStyle(0xd9b07a, 1).fillEllipse(22, 12, 8, 3);
}

function stone(g, rng) {
  lump(g, rng, 35, 14, 30, 9, 0xa9a89c, 0.5, 9);
  lump(g, rng, 30, 11, 18, 5, 0xc3c2b4, 0.4, 7);
}

function gate(g, rng) {
  for (const x of [3, 14]) boards(g, rng, x, 2, 7, 90, 1, 0xa8703f); // two uprights
  for (const y of [14, 44, 76]) boards(g, rng, 0, y, 24, 6, 1, 0x8a5a33, false); // three rails
  g.lineStyle(4, 0x8a5a33, 1).lineBetween(2, 78, 22, 16); // the brace
}

function gatePost(g) {
  poly(g, [[3, 58], [17, 58], [16, 8], [4, 8]], 0x8a5a33);
  tri(g, [10, 8], [17, 58], [10, 58], shade(0x8a5a33, 0.22));
  tri(g, [2, 8], [18, 8], [10, 1], shade(0x8a5a33, 0.18));
}

// ---- people: drawn as the morning's neighbour is, each with its own colours ----

const PEOPLE = {
  wren: { skirt: 0x7a6a50, shawl: 0x5f9a3a, apron: 0xd6d4cc, hair: 0x4a3220 },        // Wren, the mother, in a green shawl
  child: { skirt: 0x6a5f8a, shawl: 0xd9a441, apron: null, hair: 0x6a4a2a },            // her children, the scene draws them smaller
  hobb: { skirt: 0x5a4a38, shawl: 0x6a4a2c, apron: null, hair: null, hood: 0x7a5230 }, // Hobb, in a brown hood
};

function person(g, rng, { skirt, shawl, apron, hair, hood = null }) {
  poly(g, [[12, 40], [36, 40], [46, 82], [2, 82]], skirt);
  fan(g, rng, [[12, 40], [36, 40], [46, 82], [2, 82]], skirt, 0.4);
  if (apron) { poly(g, [[18, 44], [30, 44], [33, 82], [15, 82]], apron); tri(g, [24, 44], [33, 82], [24, 82], shade(apron, 0.1)); }
  g.fillStyle(0x3a2a1c, 1).fillEllipse(14, 83, 12, 5).fillEllipse(34, 83, 12, 5);
  poly(g, [[9, 26], [39, 26], [37, 46], [11, 46]], shawl);
  tri(g, [24, 26], [37, 46], [24, 46], shade(shawl, 0.22));
  g.fillStyle(skirt, 1).fillPoints(pts([[8, 28], [13, 28], [11, 56], [6, 54]]), true).fillPoints(pts([[35, 28], [40, 28], [42, 56], [37, 56]]), true);
  g.fillStyle(PEACH, 1).fillCircle(9, 56, 3).fillCircle(39, 57, 3);
  g.fillStyle(PEACH, 1).fillCircle(24, 17, 9);
  g.fillStyle(0x2b1d12, 1).fillCircle(21, 17, 1.2).fillCircle(27, 17, 1.2);
  g.lineStyle(1.2, 0x8a5a48, 1).lineBetween(22, 22, 26, 22);
  if (hood) {
    poly(g, [[12, 22], [13, 8], [24, 1], [35, 8], [36, 22], [32, 12], [24, 8], [16, 12]], hood);
    poly(g, [[9, 28], [39, 28], [33, 20], [15, 20]], shade(hood, -0.12));
  } else {
    g.fillStyle(hair, 1).fillPoints(pts([[14, 16], [16, 8], [24, 4], [32, 8], [34, 16], [30, 11], [24, 9], [18, 11]]), true);
    g.fillStyle(shade(hair, 0.15), 1).fillCircle(24, 4, 5).fillCircle(33, 7, 3);
  }
}

// the tired farmer, sitting on his stump (the stump is its own picture, set down under him): slumped, a straw hat
function farmerSeated(g, rng) {
  const coat = 0x6a7a4a, trouser = 0x5d4a3a;
  poly(g, [[10, 52], [38, 52], [40, 66], [8, 66]], trouser);
  tri(g, [24, 52], [40, 66], [24, 66], shade(trouser, 0.18));
  g.fillStyle(0x3a2617, 1).fillEllipse(14, 67, 12, 5).fillEllipse(34, 67, 12, 5);
  poly(g, [[11, 26], [37, 26], [40, 54], [8, 54]], coat);
  tri(g, [24, 26], [40, 54], [24, 54], shade(coat, 0.2));
  tri(g, [11, 26], [8, 54], [22, 54], shade(coat, -0.16));
  g.fillStyle(coat, 1).fillPoints(pts([[8, 28], [13, 28], [14, 50], [9, 50]]), true).fillPoints(pts([[35, 28], [40, 28], [40, 50], [35, 50]]), true);
  g.fillStyle(PEACH, 1).fillCircle(11, 52, 3).fillCircle(37, 52, 3);
  g.fillStyle(PEACH, 1).fillCircle(24, 19, 9);
  g.fillStyle(0x2b1d12, 1).fillCircle(21, 20, 1.2).fillCircle(27, 20, 1.2);
  g.lineStyle(1.2, 0x8a5a48, 1).lineBetween(21, 25, 27, 24);
  g.fillStyle(0xdcc27a, 1).fillEllipse(24, 12, 42, 9).fillStyle(0xe8d08a, 1).fillEllipse(24, 8, 22, 13);
  g.fillStyle(0x9a6a3a, 1).fillRect(14, 10, 20, 3);
}

// ---- her own lantern, small enough to carry at her side ----

function lamp(g) {
  g.lineStyle(2, 0x4a321a, 1).lineBetween(8, 6, 12, 1).lineBetween(12, 1, 16, 6);
  tri(g, [12, 6], [6, 12], [18, 12], 0x3a2a14);
  poly(g, [[5, 12], [19, 12], [18, 34], [6, 34]], 0xf3c050);
  g.fillStyle(0xffe9a0, 1).fillRect(8, 15, 8, 16);
  g.lineStyle(1.5, 0x3a2a14, 1).lineBetween(5, 12, 6, 34).lineBetween(19, 12, 18, 34).lineBetween(12, 12, 12, 34);
  g.fillStyle(0x3a2a14, 1).fillRect(6, 34, 12, 3);
}
