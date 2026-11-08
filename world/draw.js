// The morning, drawn in code in the key art's low-poly style: flat-shaded triangles, light from the right, as the
// Marches is (regions/marches-draw.js). Every picture is baked once into a texture, anchored at its feet: scene.js sets
// each one down at the bottom centre of its object's collision rectangle. No picture carries a digit.

// shade, mix and tri are copied word for word from regions/marches-draw.js (lines 9-24).
// lighten (f > 0) or darken (f < 0) a colour by a fraction
export function shade(hex, f) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const t = f < 0 ? 0 : 255, p = Math.min(1, Math.abs(f));
  return (Math.round(r + (t - r) * p) << 16) | (Math.round(g + (t - g) * p) << 8) | Math.round(b + (t - b) * p);
}

export function mix(a, b, p) {
  const ch = (c, s) => (c >> s) & 255;
  const m = (s) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * p);
  return (m(16) << 16) | (m(8) << 8) | m(0);
}

export function tri(g, a, b, c, col) {
  g.fillStyle(col, 1).fillTriangle(a[0], a[1], b[0], b[1], c[0], c[1]);
}

const PEACH = 0xe8b48a;
const STAND = 14; // how much longer Ambrose's legs are drawn when he is on his feet
const pts = (list) => list.map(([x, y]) => ({ x, y }));
const poly = (g, list, col, alpha = 1) => g.fillStyle(col, alpha).fillPoints(pts(list), true);

// a four-cornered patch [top-left, top-right, bottom-right, bottom-left] cut into jittered triangles, each shaded by how
// far right it lies: the way every wall, roof and field here is lit
export function grid(g, rng, [tl, tr, br, bl], nx, ny, col, { jit = 0, light = 0.3, noise = 5, dark = 0 } = {}) {
  const left = Math.min(tl[0], bl[0]), right = Math.max(tr[0], br[0]);
  const at = (i, j) => {
    const u = i / nx, v = j / ny, edge = i === 0 || j === 0 || i === nx || j === ny;
    const top = [tl[0] + (tr[0] - tl[0]) * u, tl[1] + (tr[1] - tl[1]) * u];
    const bot = [bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u];
    return [top[0] + (bot[0] - top[0]) * v + (edge ? 0 : rng.int(-jit, jit)), top[1] + (bot[1] - top[1]) * v + (edge ? 0 : rng.int(-jit, jit))];
  };
  const p = [];
  for (let j = 0; j <= ny; j++) { p.push([]); for (let i = 0; i <= nx; i++) p[j].push(at(i, j)); }
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = p[j][i], b = p[j][i + 1], c = p[j + 1][i + 1], d = p[j + 1][i];
      const cut = rng.chance(0.5) ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
      for (const t of cut) {
        const u = ((t[0][0] + t[1][0] + t[2][0]) / 3 - left) / (right - left || 1);
        tri(g, t[0], t[1], t[2], shade(col, dark + (u - 0.5) * light + rng.int(-noise, noise) / 100));
      }
    }
  }
}

// a polygon cut into a fan from its middle, each triangle shaded by which way it faces
export function fan(g, rng, list, col, strength = 0.5) {
  const n = list.length, cx = list.reduce((s, p) => s + p[0], 0) / n, cy = list.reduce((s, p) => s + p[1], 0) / n;
  const r = Math.max(...list.map((p) => Math.hypot(p[0] - cx, p[1] - cy))) || 1;
  for (let i = 0; i < n; i++) {
    const a = list[i], b = list[(i + 1) % n], mx = ((a[0] + b[0]) / 2 - cx) / r, my = ((a[1] + b[1]) / 2 - cy) / r;
    tri(g, [cx, cy], a, b, shade(col, mx * strength - my * strength * 0.3 + rng.int(-4, 4) / 100));
  }
}

// a rounded lump of leaves or stone: an uneven ring of points around (cx, cy), fanned
export function lump(g, rng, cx, cy, rx, ry, col, strength = 0.55, sides = 10) {
  const ring = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2, k = 0.82 + rng.next() * 0.3;
    ring.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  fan(g, rng, ring, col, strength);
}

const bar = (g, x, y, w, h, col) => g.fillStyle(col, 1).fillRect(x, y, w, h);

// a plank face: a rectangle of upright boards, lighter to the right
export function boards(g, rng, x, y, w, h, n, col, vertical = true) {
  for (let i = 0; i < n; i++) {
    const a = vertical ? x + (w * i) / n : x, b = vertical ? y : y + (h * i) / n;
    const bw = vertical ? w / n : w, bh = vertical ? h : h / n;
    bar(g, a, b, bw, bh, shade(col, (vertical ? (i / n - 0.5) * 0.3 : (0.5 - i / n) * 0.12) + rng.int(-4, 4) / 100));
    g.lineStyle(1, shade(col, -0.35), 0.8).lineBetween(vertical ? a : x, vertical ? y : b, vertical ? a : x + w, vertical ? y + h : b);
  }
}

export function makeTextures(scene, rng, objects) {
  const g = scene.add.graphics();
  const gen = (key, w, h) => { g.generateTexture(key, w, h); g.clear(); };

  // a soft warm glow
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

  ground(g, rng, objects);
  gen('ground', 1400, 800);

  cottage(g, rng); gen('cottage', 460, 270);
  appleTree(g, rng); gen('tree', 230, 240);
  bench(g, rng); gen('bench', 130, 80);
  henHouse(g, rng); gen('henhouse', 240, 200);
  crate(g, rng); gen('crate', 80, 56);
  sockBasket(g, rng); gen('socks', 100, 56);
  washingLine(g, rng); gen('line', 360, 120);
  for (const [key, awake] of [['ambrose-asleep', false], ['ambrose-up', true]]) { ambrose(g, awake); gen(key, 250, awake ? 170 + STAND : 170); }
  [0, 1, 2].forEach((i) => { rock(g, i); gen(`rock${i}`, 52, 44); });
  lantern(g); gen('lantern', 40, 90);
  for (const view of ['down', 'up', 'side']) for (const frame of [0, 1]) { girl(g, view, frame); gen(`girl-${view}-${frame}`, 44, 70); }
  gran(g, rng); gen('gran', 48, 86);
  [['hen-brown', 0xa5532c], ['hen-gold', 0xd9a35a]].forEach(([key, col]) => { hen(g, col); gen(key, 40, 34); });
  fenceAcross(g, rng); gen('fence-across', 56, 50);
  fenceDown(g, rng); gen('fence-down', 16, 98);
  units(g); // the apple, the egg and the four socks she carries and sets down
  marks(g); // the gold cell that shows where a unit goes, and the arrow over what to go to next
  // the close's pictures come last, so the shared random numbers the older pictures draw from run as they always did
  neighbour(g, rng); gen('neighbour', 48, 86);
  smallLantern(g); gen('lantern-small', 24, 40);
  fogEdge(scene); // the Grey, thick at one end and clear at the other
  lanternPicture(scene); // Gran's hands offering the lit lantern, drawn once for the full screen

  g.destroy();
}

// ---- the ground: grass, a worn path, flowers, and the soft shadow under everything that stands ----

function ground(g, rng, objects) {
  grid(g, rng, [[0, 0], [1400, 0], [1400, 800], [0, 800]], 35, 20, 0x8bbd4c, { jit: 10, light: 0.32, noise: 6 });
  // sunlit swathes and cooler hollows
  for (const [x, y, w, h, col, a] of [[1000, 420, 760, 300, 0xf6e08a, 0.16], [560, 300, 640, 260, 0xf2dc84, 0.12], [260, 640, 520, 240, 0x6a9a3a, 0.13], [1180, 700, 420, 200, 0x6a9a3a, 0.11], [330, 140, 480, 200, 0x7fae45, 0.12]]) {
    g.fillStyle(col, a).fillEllipse(x, y, w, h);
  }
  // the path: from the door out across the yard to the tree, ragged at the edges
  const path = [[1090, 296], [1150, 296], [1170, 360], [1010, 420], [860, 430], [700, 400], [590, 430], [440, 380], [360, 300], [300, 300], [320, 350], [440, 470], [600, 500], [800, 500], [1000, 480], [1110, 400]];
  const left = path.slice(0, 8), right = path.slice(8).reverse();
  for (let i = 0; i < left.length - 1; i++) {
    const a = left[i], b = left[i + 1], c = right[i + 1] || right[right.length - 1], d = right[i] || right[right.length - 1];
    tri(g, a, b, c, shade(0xd8b676, rng.int(-6, 6) / 100));
    tri(g, a, c, d, shade(0xcba760, rng.int(-6, 8) / 100));
  }
  for (let i = 0; i < 90; i++) { // pebbles and bare patches along the path
    const t = rng.next(), k = Math.min(left.length - 2, Math.floor(t * (left.length - 1)));
    const a = left[k], d = right[k] || right[right.length - 1], u = rng.next();
    const x = a[0] + (d[0] - a[0]) * u + rng.int(-12, 12), y = a[1] + (d[1] - a[1]) * u + rng.int(-10, 10);
    g.fillStyle(shade(0xb89a68, rng.int(-10, 12) / 100), 1).fillEllipse(x, y, rng.int(5, 12), rng.int(3, 6));
  }
  for (let i = 0; i < 6; i++) g.fillStyle(0xb3ab9c, 1).fillEllipse(1080 + i * 7 - (i % 2) * 14, 304 + i * 9, 30, 11).fillStyle(0xc9c1b1, 1).fillEllipse(1082 + i * 7 - (i % 2) * 14, 302 + i * 9, 24, 7);
  // tufts and flowers
  for (let i = 0; i < 380; i++) {
    const x = rng.int(0, 1400), y = rng.int(0, 800), h = rng.int(4, 8);
    tri(g, [x, y], [x + rng.int(2, 4), y - h], [x + rng.int(5, 7), y], shade(0x78a840, rng.int(-10, 8) / 100));
  }
  const bloom = [0xfff8e6, 0xfff3c4, 0xf3c8d8, 0xc9a0e0];
  for (let i = 0; i < 170; i++) {
    const x = rng.int(6, 1394), y = rng.int(6, 794), col = rng.pick(bloom);
    g.fillStyle(0x5f8f3a, 1).fillRect(x, y, 1, 4);
    g.fillStyle(col, 1).fillCircle(x, y, 2.2);
    g.fillStyle(0xf3c25b, 1).fillCircle(x, y, 0.8);
  }
  for (const [x0, y0, x1, y1] of [[40, 20, 900, 70], [20, 740, 1380, 785], [10, 80, 40, 740], [1360, 330, 1392, 740]]) { // lupins along the walls
    for (let i = 0; i < 26; i++) {
      const x = rng.int(x0, x1), y = rng.int(y0, y1), h = rng.int(14, 26), col = rng.pick([0x8e63c4, 0x7a52b4, 0xb391e0]);
      bar(g, x, y - h, 2, h, 0x4f7f3a);
      for (let k = 0; k < 4; k++) g.fillStyle(shade(col, k * 0.04), 1).fillEllipse(x + 1, y - h + 3 + k * 4, 6 - k, 5);
    }
  }
  // what stands casts its shadow to the left, a little toward us
  for (const o of objects) {
    for (const r of o.rects) {
      const w = r.w * 1.1 + 8, h = Math.min(46, 12 + r.w * 0.09);
      g.fillStyle(0x34421a, 0.26).fillEllipse(r.x + r.w / 2 - 10, r.y + r.h - 2, w, h);
    }
  }
  g.fillStyle(0x34421a, 0.14).fillEllipse(300, 290, 240, 70); // the apple tree's crown
  g.fillStyle(0x34421a, 0.12).fillEllipse(950, 316, 140, 60); // the cottage's, falling left
}

// ---- the cottage: thatch, stone, a door, a lit window, ivy ----

function cottage(g, rng) {
  // a chimney behind the roof
  grid(g, rng, [[330, 6], [366, 6], [366, 80], [330, 80]], 2, 5, 0xb59f82, { jit: 1, light: 0.4 });
  bar(g, 326, 2, 44, 7, 0x8d7a60);
  // the wall
  grid(g, rng, [[28, 128], [412, 128], [412, 270], [28, 270]], 16, 6, 0xcdbd9c, { jit: 4, light: 0.36, noise: 5 });
  grid(g, rng, [[28, 252], [412, 252], [412, 270], [28, 270]], 16, 2, 0x9d8f77, { jit: 1, light: 0.3 });
  // the roof's shadow on the wall, then the thatch
  g.fillStyle(0x3a2a12, 0.28).fillRect(28, 150, 384, 16);
  grid(g, rng, [[78, 24], [382, 24], [458, 152], [2, 152]], 15, 7, 0xdca94a, { jit: 4, light: 0.5, noise: 7 });
  grid(g, rng, [[2, 152], [458, 152], [452, 166], [8, 166]], 15, 1, 0xa87b30, { jit: 1, light: 0.4, noise: 6 });
  for (let i = 0; i < 17; i++) tri(g, [8 + i * 26.5, 166], [22 + i * 26.5, 166], [15 + i * 26.5, 174], shade(0xa87b30, rng.int(-8, 8) / 100));
  g.lineStyle(3, 0xf3d278, 0.9).lineBetween(78, 25, 382, 25); // the ridge catching the sun
  // a door with an arched top, a stone step and a latch
  poly(g, [[135, 270], [135, 188], [143, 174], [170, 168], [197, 174], [205, 188], [205, 270]], 0xb88a5a);
  fan(g, rng, [[143, 270], [143, 192], [150, 180], [170, 175], [190, 180], [197, 192], [197, 270]], 0x7a4a28, 0.45);
  g.lineStyle(1.5, 0x4a2c14, 0.8).lineBetween(170, 176, 170, 270).lineBetween(156, 180, 156, 270).lineBetween(184, 180, 184, 270);
  g.fillStyle(0xe0b04a, 1).fillCircle(188, 226, 3);
  grid(g, rng, [[124, 262], [216, 262], [220, 270], [120, 270]], 5, 1, 0xb7a88a, { jit: 0, light: 0.3 });
  // the two windows, shuttered and lit from inside
  for (const [x, y, w, h] of [[244, 168, 76, 56], [58, 176, 52, 42]]) {
    bar(g, x - 5, y - 5, w + 10, h + 10, 0x6b4528);
    bar(g, x, y, w, h, 0xffe9a8);
    g.fillStyle(0xfff6d0, 0.55).fillRect(x, y, w * 0.45, h);
    g.lineStyle(3, 0x6b4528, 1).lineBetween(x + w / 2, y, x + w / 2, y + h).lineBetween(x, y + h / 2, x + w, y + h / 2);
    for (const sx of [x - 22, x + w + 5]) boards(g, rng, sx, y - 5, 17, h + 10, 3, 0x8a5a33);
    boards(g, rng, x - 6, y + h + 5, w + 12, 12, 1, 0x8a5a33, false);
    for (let i = 0; i < 6; i++) {
      const fx = x + 4 + i * ((w - 8) / 5);
      g.fillStyle(0x4f7f3a, 1).fillTriangle(fx - 4, y + h + 6, fx + 4, y + h + 6, fx, y + h - 3);
      g.fillStyle(rng.pick([0xf3c8d8, 0xfff8e6, 0xe8604a]), 1).fillCircle(fx + rng.int(-2, 2), y + h - 1, 3);
    }
  }
  // ivy climbing the corners and between the windows
  for (const [x0, x1, y0] of [[112, 134, 150], [326, 350, 168], [386, 414, 140], [26, 50, 160]]) {
    for (let i = 0; i < 16; i++) {
      const x = rng.int(x0, x1), y = rng.int(y0, 262 - rng.int(0, 60)), r = rng.int(5, 9);
      lump(g, rng, x, y, r, r * 0.85, rng.pick([0x4f7f3a, 0x5f9a3a, 0x3f6f32]), 0.5, 6);
      if (rng.chance(0.18)) g.fillStyle(0xfff8e6, 1).fillCircle(x + 2, y, 2);
    }
  }
  // a water barrel and a stack of logs by the right corner
  g.fillStyle(0x7a5230, 1).fillRect(392, 222, 34, 46).fillStyle(0xa07040, 1).fillRect(410, 222, 16, 46);
  g.lineStyle(2, 0x3a2a14, 1).lineBetween(392, 234, 426, 234).lineBetween(392, 256, 426, 256);
  g.fillStyle(0x4a6a8a, 1).fillEllipse(409, 222, 34, 8);
  for (let i = 0; i < 6; i++) g.fillStyle(shade(0x9a6a3a, rng.int(-10, 10) / 100), 1).fillCircle(436 + (i % 3) * 8, 262 - Math.floor(i / 3) * 8, 5).fillStyle(0xd9b07a, 1).fillCircle(436 + (i % 3) * 8, 262 - Math.floor(i / 3) * 8, 2.4);
}

// ---- the apple tree and its ladder ----

export function appleTree(g, rng) {
  poly(g, [[92, 240], [138, 240], [130, 170], [126, 118], [106, 118], [100, 170]], 0x6b4a2c);
  tri(g, [116, 118], [138, 240], [118, 240], shade(0x6b4a2c, 0.2));
  tri(g, [92, 240], [104, 190], [86, 240], shade(0x6b4a2c, -0.2));
  tri(g, [138, 240], [126, 196], [152, 240], shade(0x6b4a2c, 0.1));
  g.lineStyle(9, 0x6b4a2c, 1).lineBetween(110, 140, 66, 96).lineBetween(124, 138, 168, 92);
  // the crown, back to front
  const blobs = [[60, 96, 44, 34, 0x4f8a36], [172, 92, 46, 34, 0x5f9a3a], [116, 62, 56, 40, 0x5a9438], [78, 70, 44, 34, 0x66a23e], [160, 66, 44, 32, 0x6fa83f], [116, 100, 60, 36, 0x568f37], [96, 40, 40, 28, 0x72ae42], [142, 44, 40, 28, 0x7bb548]];
  for (const [x, y, rx, ry, col] of blobs) lump(g, rng, x, y, rx, ry, col, 0.6, 11);
  for (let i = 0; i < 34; i++) {
    const x = rng.int(28, 202), y = rng.int(18, 118);
    if (((x - 115) / 92) ** 2 + ((y - 72) / 62) ** 2 > 1) continue;
    g.fillStyle(rng.pick([0xd8432e, 0xc53a2a, 0xe0553a]), 1).fillCircle(x, y, 4.4);
    g.fillStyle(0xfff0e0, 0.9).fillCircle(x + 1.4, y - 1.4, 1.2);
  }
  // the ladder, leaning on the trunk
  g.lineStyle(4, 0x9a6a3a, 1).lineBetween(62, 240, 100, 120).lineBetween(80, 240, 114, 126);
  for (let i = 0; i < 6; i++) { const t = 0.1 + i * 0.16; g.lineStyle(3, 0x8a5a2a, 1).lineBetween(62 + 38 * t, 240 - 120 * t, 80 + 34 * t, 240 - 114 * t); }
  for (const [x, y] of [[170, 238], [190, 232], [60, 232]]) g.fillStyle(0xd8432e, 1).fillCircle(x, y, 4).fillStyle(0xfff0e0, 0.9).fillCircle(x + 1.2, y - 1.2, 1.1);
}

// ---- the bench and basket where the pie is made ----

function bench(g, rng) {
  for (const x of [32, 100]) { bar(g, x, 58, 8, 22, 0x6e4526); bar(g, x + 5, 58, 3, 22, 0x8a5a33); } // the front legs
  for (const x of [50, 112]) bar(g, x, 38, 6, 20, 0x5a3820); // the back legs
  grid(g, rng, [[30, 34], [122, 34], [110, 52], [20, 52]], 6, 1, 0xc98a50, { jit: 0, light: 0.3, noise: 4 }); // the seat's top
  grid(g, rng, [[20, 52], [110, 52], [110, 60], [20, 60]], 6, 1, 0x8f5f36, { jit: 0, light: 0.3, noise: 3 }); // its front edge
  g.lineStyle(1, 0x7a4e2c, 0.8).lineBetween(26, 43, 116, 43);
  // a wicker basket at the right end, with a cloth folded in it
  grid(g, rng, [[88, 24], [124, 24], [118, 54], [94, 54]], 6, 4, 0xc79a52, { jit: 1, light: 0.35, noise: 6 });
  g.fillStyle(0x5a3a1c, 1).fillEllipse(106, 24, 40, 10);
  g.fillStyle(0xe8d9b8, 1).fillEllipse(106, 24, 32, 6);
  g.fillStyle(0xc0553f, 1).fillTriangle(94, 24, 108, 24, 100, 31).fillTriangle(108, 24, 120, 24, 114, 30);
  g.lineStyle(3, 0xa27c3e, 1).strokePoints(pts([[90, 24], [96, 8], [106, 4], [116, 8], [122, 24]]), false);
}

// ---- the hen house, open at the front, with a shelf of straw nests ----

function henHouse(g, rng) {
  grid(g, rng, [[38, 84], [202, 84], [202, 150], [38, 150]], 8, 3, 0x5a3a22, { jit: 0, light: 0.2, noise: 3 }); // inside, in shade
  for (const y of [114, 132, 150]) { // three shelves of nests
    bar(g, 40, y, 160, 6, shade(0xa8703f, 0.05));
    for (let i = 0; i < 4; i++) {
      const x = 62 + i * 40;
      g.fillStyle(shade(0xd9b24a, rng.int(-8, 8) / 100), 1).fillEllipse(x, y - 2, 30, 12);
      for (let k = 0; k < 2; k++) g.fillStyle(rng.pick([0xe9d2b0, 0xf0dcc0, 0xd9b890]), 1).fillEllipse(x - 5 + k * 10, y - 6, 8, 10);
    }
  }
  bar(g, 28, 80, 12, 92, 0x7a4e2c); bar(g, 36, 80, 4, 92, 0x946238);
  bar(g, 202, 80, 12, 92, 0x946238); bar(g, 208, 80, 6, 92, 0xa8703f);
  // the sloped, shingled roof, with its front edge
  grid(g, rng, [[40, 18], [200, 18], [236, 90], [4, 90]], 12, 5, 0x9a6b3e, { jit: 3, light: 0.45, noise: 6 });
  grid(g, rng, [[4, 90], [236, 90], [236, 98], [4, 98]], 12, 1, 0x6a4526, { jit: 0, light: 0.3 });
  g.lineStyle(3, 0xc9935a, 0.9).lineBetween(40, 19, 200, 19);
  // the floor, the board below it, the stilts and the ramp
  grid(g, rng, [[18, 152], [224, 152], [236, 174], [6, 174]], 8, 1, 0xb88650, { jit: 0, light: 0.3, noise: 4 });
  grid(g, rng, [[6, 174], [236, 174], [236, 186], [6, 186]], 8, 1, 0x7a4e2c, { jit: 0, light: 0.3, noise: 3 });
  for (const x of [14, 70, 164, 222]) bar(g, x, 186, 8, 14, 0x5a3820);
  poly(g, [[150, 176], [196, 176], [222, 200], [172, 200]], 0xa8703f);
  for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5; g.lineStyle(2, 0x6e4526, 1).lineBetween(150 + 46 * t - 4, 176 + 24 * t, 150 + 46 * t + 14, 176 + 24 * t); }
}

// ---- the egg crate, open on top, lined with straw ----

function crate(g, rng) {
  grid(g, rng, [[16, 14], [66, 14], [74, 26], [8, 26]], 4, 1, 0xe6c35a, { jit: 1, light: 0.3, noise: 5 });
  g.fillStyle(0x5a3a1c, 0.6).fillRect(18, 16, 46, 3);
  boards(g, rng, 8, 26, 62, 26, 3, 0xa8703f, false);
  poly(g, [[70, 26], [76, 18], [76, 44], [70, 52]], 0xc98a50);
  for (const x of [8, 64]) bar(g, x, 24, 6, 28, 0x6e4526);
}

// ---- the sock basket, with socks spilling over its rim ----

function sockBasket(g, rng) {
  g.fillStyle(0x4a321a, 1).fillEllipse(50, 20, 80, 16);
  grid(g, rng, [[10, 22], [90, 22], [78, 52], [22, 52]], 12, 4, 0xc79a52, { jit: 1, light: 0.35, noise: 7 });
  g.fillStyle(0xa27c3e, 1).fillEllipse(50, 22, 82, 12).fillStyle(0x4a321a, 1).fillEllipse(50, 22, 66, 7);
  for (const [x, col] of [[30, 0xd9534a], [44, 0x4a7ab8], [58, 0x5fa34a], [70, 0xe8b84a]]) { // four socks standing in it
    g.fillStyle(col, 1).fillPoints(pts([[x - 5, 24], [x + 5, 24], [x + 6, 4], [x + 15, 0], [x + 15, 8], [x - 4, 12]]), true);
    g.fillStyle(0xfff8e6, 1).fillRect(x - 5, 21, 10, 4);
  }
}

// ---- the washing line between its two posts ----

function washingLine(g, rng) {
  for (const x of [12, 332]) {
    poly(g, [[x, 120], [x + 16, 120], [x + 14, 30], [x + 2, 30]], 0x8a5a33);
    tri(g, [x + 8, 30], [x + 16, 120], [x + 10, 120], shade(0x8a5a33, 0.25));
    tri(g, [x + 2, 30], [x + 14, 30], [x + 8, 22], shade(0x8a5a33, 0.15));
  }
  const sag = (x) => 40 + Math.sin(((x - 20) / 320) * Math.PI) * 16;
  for (let x = 20; x < 340; x += 8) g.lineStyle(2, 0xf2e6c8, 1).lineBetween(x, sag(x), x + 8, sag(x + 8));
  for (let i = 0; i < 17; i++) { // the pegs
    const x = 36 + i * 18, y = sag(x);
    bar(g, x - 1.5, y - 2, 3, 9, shade(0xc9a15a, rng.int(-8, 8) / 100));
  }
}

// ---- Ambrose, the cart-sized turtle: asleep with his head down, or standing with it up ----

export function ambrose(g, awake) {
  const rng = (() => { let s = 7; return { next: () => ((s = (s * 16807) % 2147483647) / 2147483647) }; })();
  const int = (a, b) => a + Math.floor(rng.next() * (b - a + 1));
  const long = awake ? STAND : 0; // on his feet, the legs are straight and the shell is carried higher
  const leg = (x, y, dim) => {
    tri(g, [x, y], [x + 24, y], [x + 22, y + 30 + long], shade(0x868970, dim));
    tri(g, [x, y], [x + 22, y + 30 + long], [x + 2, y + 30 + long], shade(0x767960, dim));
    bar(g, x + 2, y + 30 + long, 22, 8, shade(0x5f6150, dim));
    g.fillStyle(0xd8d2bb, 1).fillTriangle(x + 14, y + 38 + long, x + 18, y + 30 + long, x + 24, y + 38 + long).fillTriangle(x + 6, y + 38 + long, x + 10, y + 30 + long, x + 14, y + 38 + long);
  };
  leg(40, 118, -0.2); leg(118, 120, -0.2); // the far legs
  leg(62, 122, 0); leg(146, 124, 0);       // the near legs
  // the shell, a faceted dome in rings
  const cx = 110, base = 126, w = 190, h = 92, rings = [{ y: base, r: w / 2, n: 9 }, { y: base - h * 0.45, r: w * 0.42, n: 8 }, { y: base - h * 0.82, r: w * 0.26, n: 5 }, { y: base - h, r: w * 0.06, n: 2 }];
  const ring = rings.map((r) => [...Array(r.n)].map((_, i) => { const t = i / (r.n - 1), jit = i > 0 && i < r.n - 1; return [cx - r.r + 2 * r.r * t + (jit ? int(-3, 3) : 0), r.y + (jit ? int(-3, 3) : 0)]; }));
  for (let k = 0; k < rings.length - 1; k++) {
    const lo = ring[k], hi = ring[k + 1];
    let i = 0, j = 0;
    while (i < lo.length - 1 || j < hi.length - 1) {
      const useLo = j >= hi.length - 1 || (i < lo.length - 1 && (i + 1) / (lo.length - 1) <= (j + 1) / (hi.length - 1));
      const a = lo[i], b = hi[j], c2 = useLo ? lo[i + 1] : hi[j + 1];
      if (useLo) i++; else j++;
      const lit = (((a[0] + b[0] + c2[0]) / 3 - cx) / w) * 0.5 + ((base - (a[1] + b[1] + c2[1]) / 3) / h) * 0.25;
      tri(g, a, b, c2, shade(rng.next() < 0.6 ? 0x6f8a4a : 0x859065, lit * 0.6 + int(-4, 4) / 100));
    }
  }
  bar(g, 14, 122, 192, 8, 0x5e5a46);
  for (let i = 0; i < 11; i++) g.fillStyle(shade(0x5e5a46, int(-10, 12) / 100), 1).fillTriangle(16 + i * 18, 130, 34 + i * 18, 130, 25 + i * 18, 120);
  for (let i = 0; i < 30; i++) { // moss and small white flowers
    const x = int(30, 190), y = int(40, 118);
    g.fillStyle(rng.next() < 0.5 ? 0x9cbf55 : 0x79a043, 1).fillTriangle(x, y, x + int(10, 22), y + int(-3, 5), x + int(3, 10), y - int(7, 14));
    if (rng.next() < 0.6) g.fillStyle(0xfff8e6, 1).fillCircle(x + 4, y - 2, 2);
  }
  // the red cloth and the packs
  poly(g, [[62, 44], [138, 42], [150, 90], [54, 92]], 0x8f3527);
  poly(g, [[54, 92], [150, 90], [152, 98], [52, 100]], 0x6e2a20);
  bar(g, 62, 62, 86, 4, 0xd9a441); bar(g, 60, 76, 90, 3, 0xd9a441);
  bar(g, 50, 38, 30, 22, 0x7a5230); bar(g, 50, 38, 30, 6, shade(0x7a5230, 0.15));
  bar(g, 120, 34, 28, 24, 0x6a4528); bar(g, 120, 34, 28, 6, shade(0x6a4528, 0.18));
  // the neck and head, on the right
  const hx = awake ? 204 : 200, hy = awake ? 96 : 116;
  poly(g, [[184, 112], [hx - 8, hy - 6], [hx + 8, hy + 6], [190, 132]], 0x7d8068);
  tri(g, [hx - 6, hy - 14], [hx + 22, hy - 16], [hx + 32, hy], 0x9a9d84);
  tri(g, [hx - 6, hy - 14], [hx + 32, hy], [hx + 4, hy + 6], 0x8b8e76);
  tri(g, [hx + 4, hy + 6], [hx + 32, hy], [hx + 26, hy + 10], 0x7a7d66);
  tri(g, [hx - 14, hy - 4], [hx - 6, hy - 14], [hx + 4, hy + 6], 0x878a72);
  if (awake) { g.fillStyle(0x1c1a14, 1).fillCircle(hx + 16, hy - 7, 3.2); g.fillStyle(0xffffff, 1).fillCircle(hx + 17, hy - 8, 1.1); }
  else g.lineStyle(2, 0x2b281c, 1).lineBetween(hx + 12, hy - 6, hx + 22, hy - 6);
  g.lineStyle(2, 0x4d4a3c, 1).lineBetween(hx + 18, hy + 4, hx + 30, hy + 1);
}

// ---- rocks ----

function rock(g, i) {
  const rng = (() => { let s = 41 + i * 17; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const base = [0x9a93a6, 0x8d8798, 0xa59eb0][i];
  const ring = [[6, 36], [4, 24], [14, 10], [28, 4], [42, 12], [48, 26], [44, 38]].map(([x, y]) => [x + (rng() - 0.5) * 4, y + (rng() - 0.5) * 3]);
  const cx = 26, cy = 24;
  ring.forEach((a, k) => { const b = ring[(k + 1) % ring.length], lit = ((a[0] + b[0]) / 2 - cx) / 24 * 0.32 - ((a[1] + b[1]) / 2 - cy) / 20 * 0.1; tri(g, [cx, cy], a, b, shade(base, lit + (rng() - 0.5) * 0.06)); });
  g.fillStyle(0x86ad48, 1).fillTriangle(6, 36, 16, 33, 12, 40).fillTriangle(40, 38, 48, 30, 46, 40);
  g.fillStyle(0xfff8e6, 1).fillCircle(10, 37, 1.6).fillCircle(44, 37, 1.6);
}

// ---- Gran's lantern post: a hook on a post, a lantern hanging from it ----

function lantern(g) {
  poly(g, [[16, 90], [24, 90], [23, 18], [17, 18]], 0x7a5230);
  tri(g, [20, 18], [24, 90], [20, 90], shade(0x7a5230, 0.2));
  g.lineStyle(3, 0x4a321a, 1).lineBetween(20, 22, 34, 14).lineBetween(34, 14, 34, 24);
  poly(g, [[27, 24], [41, 24], [40, 44], [28, 44]], 0xf3c050);
  g.fillStyle(0xffe9a0, 1).fillRect(30, 27, 8, 14);
  g.lineStyle(2, 0x3a2a14, 1).lineBetween(27, 24, 28, 44).lineBetween(41, 24, 40, 44).lineBetween(34, 24, 34, 44);
  tri(g, [34, 17], [28, 24], [40, 24], 0x3a2a14);
}

// ---- the girl: a faceted child in a yellow coat with a pack, seen from the front, the back and the side ----

export function girl(g, view, frame) {
  const step = frame ? 3 : 0;
  const coat = 0xe9b838, coatLit = shade(coat, 0.22), coatDark = shade(coat, -0.18), pack = 0x7a5230, hair = 0x5a3a24, boot = 0x3a2617, trouser = 0x5d6a8a;
  if (view === 'side') {
    g.fillStyle(trouser, 1).fillRect(19, 48, 6, 14 - step).fillRect(23, 48, 6, 14 + step);
    g.fillStyle(boot, 1).fillEllipse(23, 63 - step, 11, 6).fillEllipse(28, 64 + step, 11, 6);
    poly(g, [[16, 28], [30, 28], [32, 52], [14, 52]], coat);
    tri(g, [24, 28], [32, 52], [24, 52], coatLit);
    tri(g, [16, 28], [14, 52], [22, 52], coatDark);
    poly(g, [[6, 30], [16, 30], [16, 50], [8, 50]], pack); // the pack on her back
    bar(g, 6, 30, 10, 5, shade(pack, 0.18));
    g.fillStyle(coat, 1).fillPoints(pts([[20, 30], [30, 34], [34, 46 - step], [29, 47 - step], [25, 38]]), true); // her near arm swings
    g.fillStyle(PEACH, 1).fillCircle(32, 47 - step, 3);
    g.fillStyle(PEACH, 1).fillCircle(24, 18, 10).fillTriangle(32, 18, 36, 21, 31, 24); // head and nose
    g.fillStyle(hair, 1).fillCircle(21, 14, 10).fillTriangle(10, 14, 6, 28, 16, 22);
    g.fillStyle(0x2b1d12, 1).fillCircle(29, 16, 1.4);
    return;
  }
  const front = view === 'down';
  g.fillStyle(trouser, 1).fillRect(15, 48, 6, 14 - step).fillRect(23, 48, 6, 14 + step);
  g.fillStyle(boot, 1).fillEllipse(18, 63 - step, 10, 6).fillEllipse(26, 64 + step, 10, 6);
  poly(g, [[12, 27], [32, 27], [37, 52], [7, 52]], coat);
  tri(g, [22, 27], [37, 52], [22, 52], coatLit);
  tri(g, [12, 27], [7, 52], [22, 52], coatDark);
  g.fillStyle(coatDark, 1).fillRect(7, 49, 30, 3);
  g.fillStyle(coat, 1).fillPoints(pts([[10, 29], [14, 29], [11, 46 + step], [6, 45 + step]]), true).fillPoints(pts([[30, 29], [34, 29], [38, 45 - step], [33, 46 - step]]), true);
  g.fillStyle(PEACH, 1).fillCircle(8, 47 + step, 3).fillCircle(36, 47 - step, 3);
  if (front) {
    g.lineStyle(2, pack, 1).lineBetween(16, 28, 15, 50).lineBetween(28, 28, 29, 50); // the pack's straps
    g.fillStyle(PEACH, 1).fillCircle(22, 17, 10);
    g.fillStyle(hair, 1).fillPoints(pts([[11, 17], [13, 8], [22, 4], [31, 8], [33, 17], [29, 11], [22, 9], [15, 11]]), true);
    g.fillStyle(0x2b1d12, 1).fillCircle(18, 18, 1.4).fillCircle(26, 18, 1.4);
    g.lineStyle(1.2, 0xb0654a, 1).lineBetween(20, 23, 24, 23);
    g.fillStyle(0xf0a090, 0.7).fillCircle(15, 21, 2).fillCircle(29, 21, 2);
  } else {
    poly(g, [[10, 29], [34, 29], [33, 52], [11, 52]], pack); // the pack on her back
    tri(g, [22, 29], [33, 52], [22, 52], shade(pack, 0.2));
    bar(g, 10, 29, 24, 7, shade(pack, 0.16));
    g.fillStyle(0xd9a441, 1).fillRect(20, 36, 4, 5);
    g.fillStyle(hair, 1).fillCircle(22, 15, 11);
    g.fillStyle(shade(hair, 0.15), 1).fillTriangle(22, 5, 32, 17, 22, 22);
  }
}

// ---- Gran: faceless, as she is only ever shown at the door ----

function gran(g, rng) {
  poly(g, [[12, 40], [36, 40], [46, 82], [2, 82]], 0xb06a78);
  fan(g, rng, [[12, 40], [36, 40], [46, 82], [2, 82]], 0xb06a78, 0.4);
  poly(g, [[18, 44], [30, 44], [33, 82], [15, 82]], 0xefe6d0);
  tri(g, [24, 44], [33, 82], [24, 82], shade(0xefe6d0, 0.1));
  g.fillStyle(0x3a2617, 1).fillEllipse(14, 83, 12, 5).fillEllipse(34, 83, 12, 5);
  poly(g, [[9, 26], [39, 26], [37, 46], [11, 46]], 0x7a4a6a);
  tri(g, [24, 26], [37, 46], [24, 46], shade(0x7a4a6a, 0.22));
  g.fillStyle(0xb06a78, 1).fillPoints(pts([[8, 28], [13, 28], [11, 56], [6, 54]]), true).fillPoints(pts([[35, 28], [40, 28], [42, 54], [37, 56]]), true);
  g.fillStyle(PEACH, 1).fillCircle(9, 56, 3).fillCircle(39, 56, 3);
  g.fillStyle(PEACH, 1).fillCircle(24, 17, 9); // a plain face
  g.fillStyle(0xc8c8d0, 1).fillPoints(pts([[14, 16], [16, 8], [24, 4], [32, 8], [34, 16], [30, 11], [24, 9], [18, 11]]), true);
  g.fillStyle(0xdadae2, 1).fillCircle(24, 4, 5);
}

// ---- hens ----

function hen(g, col) {
  g.lineStyle(2, 0xd9a441, 1).lineBetween(17, 26, 16, 33).lineBetween(24, 26, 25, 33);
  g.fillStyle(col, 1).fillEllipse(20, 20, 28, 18);
  tri(g, [20, 12], [34, 20], [20, 29], shade(col, 0.18));
  tri(g, [6, 20], [20, 12], [20, 29], shade(col, -0.16));
  tri(g, [8, 18], [2, 8], [12, 14], shade(col, -0.25));
  tri(g, [10, 20], [3, 12], [14, 16], shade(col, -0.1));
  g.fillStyle(col, 1).fillCircle(32, 12, 6);
  g.fillStyle(0xd8432e, 1).fillTriangle(29, 7, 32, 2, 34, 8).fillTriangle(31, 18, 34, 22, 31, 22);
  g.fillStyle(0xe8b84a, 1).fillTriangle(37, 11, 40, 14, 37, 15);
  g.fillStyle(0x1c1a14, 1).fillCircle(33, 11, 1.2);
}

// ---- fences: a post and two rails, across the top and bottom and down the sides ----

export function fenceAcross(g, rng) {
  for (const y of [18, 32]) boards(g, rng, 0, y, 56, 5, 1, 0xa8703f, false);
  poly(g, [[3, 50], [13, 50], [12, 10], [4, 10]], 0x8a5a33);
  tri(g, [8, 10], [13, 50], [8, 50], shade(0x8a5a33, 0.22));
  tri(g, [3, 10], [13, 10], [8, 4], shade(0x8a5a33, 0.18));
}

export function fenceDown(g, rng) {
  for (const y of [18, 32]) boards(g, rng, 5, y, 6, 52, 1, 0xa8703f);
  poly(g, [[3, 50], [13, 50], [12, 10], [4, 10]], 0x8a5a33);
  tri(g, [8, 10], [13, 50], [8, 50], shade(0x8a5a33, 0.22));
  tri(g, [3, 10], [13, 10], [8, 4], shade(0x8a5a33, 0.18));
}

// ---- the things she carries: an apple, an egg, and four socks ----

export function units(g) {
  g.fillStyle(0xc53a2a, 1).fillCircle(6, 6.5, 5.6);
  tri(g, [6, 1], [11, 7], [6, 12], shade(0xd8432e, 0.12));
  g.fillStyle(0x5f8f3a, 1).fillTriangle(6, 1, 10, -1, 9, 3);
  g.fillStyle(0xfff0e0, 0.9).fillCircle(4, 4, 1.2);
  g.generateTexture('apple', 12, 13); g.clear();
  g.fillStyle(0xf0dcc0, 1).fillEllipse(5, 6.5, 8.5, 11);
  g.fillStyle(0xfffaf0, 0.9).fillEllipse(3.8, 4.4, 2.4, 3.6);
  g.generateTexture('egg', 10, 13); g.clear();
  [0xd9534a, 0x4a7ab8, 0x5fa34a, 0xe8b84a].forEach((col, i) => {
    g.fillStyle(col, 1).fillPoints(pts([[2, 0], [8, 0], [8, 9], [13, 12], [11, 16], [4, 14], [2, 9]]), true);
    g.fillStyle(0xfff8e6, 1).fillRect(2, 0, 6, 3);
    g.generateTexture(`sock${i}`, 14, 17); g.clear();
  });
}

// ---- the marks that guide her: a gold cell, an empty square with no number in it, and the bobbing arrow ----

export function marks(g) {
  g.fillStyle(0xf4c25b, 0.2).fillRect(1, 1, 10, 10);
  g.fillStyle(0xf2b53a, 1).fillRect(0, 0, 12, 1.6).fillRect(0, 10.4, 12, 1.6).fillRect(0, 0, 1.6, 12).fillRect(10.4, 0, 1.6, 12);
  g.generateTexture('cell', 12, 12); g.clear();
  g.fillStyle(0x7a4f12, 0.9).fillTriangle(1, 1, 27, 1, 14, 25);
  g.fillStyle(0xf6c34a, 1).fillTriangle(4, 3, 24, 3, 14, 21);
  g.fillStyle(0xfff0b8, 0.9).fillTriangle(7, 4, 15, 4, 11, 11);
  g.generateTexture('arrow', 28, 26); g.clear();
}

// ---- the neighbour: a woman in grey, drawn as Gran is but in the Grey's colours, one hand raised to her chin ----

export function neighbour(g, rng) {
  const skirt = 0x7a7f92, shawl = 0x8f96ab, apron = 0xd6d4cc;
  poly(g, [[12, 40], [36, 40], [46, 82], [2, 82]], skirt);
  fan(g, rng, [[12, 40], [36, 40], [46, 82], [2, 82]], skirt, 0.4);
  poly(g, [[18, 44], [30, 44], [33, 82], [15, 82]], apron);
  tri(g, [24, 44], [33, 82], [24, 82], shade(apron, 0.1));
  g.fillStyle(0x3a3a46, 1).fillEllipse(14, 83, 12, 5).fillEllipse(34, 83, 12, 5);
  poly(g, [[9, 26], [39, 26], [37, 46], [11, 46]], shawl);
  tri(g, [24, 26], [37, 46], [24, 46], shade(shawl, 0.22));
  g.fillStyle(skirt, 1).fillPoints(pts([[8, 28], [13, 28], [11, 56], [6, 54]]), true); // the near arm hangs
  g.fillStyle(PEACH, 1).fillCircle(9, 56, 3);
  g.fillStyle(skirt, 1).fillPoints(pts([[35, 28], [40, 28], [42, 40], [33, 36]]), true); // the far arm is bent up
  g.fillStyle(PEACH, 1).fillCircle(31, 30, 3);
  g.fillStyle(PEACH, 1).fillCircle(24, 17, 9);
  g.fillStyle(0x2b1d12, 1).fillCircle(21, 17, 1.2).fillCircle(27, 17, 1.2);
  g.lineStyle(1.2, 0x8a5a48, 1).lineBetween(21, 13, 24, 12).lineBetween(24, 12, 28, 13).lineBetween(22, 22, 26, 22);
  g.fillStyle(0xb4b6bf, 1).fillPoints(pts([[14, 16], [16, 8], [24, 4], [32, 8], [34, 16], [30, 11], [24, 9], [18, 11]]), true);
  g.fillStyle(0xc9cad2, 1).fillCircle(24, 4, 5).fillCircle(33, 7, 3);
}

// ---- her own lantern, small enough to carry at her side ----

function smallLantern(g) {
  g.lineStyle(2, 0x4a321a, 1).lineBetween(8, 6, 12, 1).lineBetween(12, 1, 16, 6);
  tri(g, [12, 6], [6, 12], [18, 12], 0x3a2a14);
  poly(g, [[5, 12], [19, 12], [18, 34], [6, 34]], 0xf3c050);
  g.fillStyle(0xffe9a0, 1).fillRect(8, 15, 8, 16);
  g.lineStyle(1.5, 0x3a2a14, 1).lineBetween(5, 12, 6, 34).lineBetween(19, 12, 18, 34).lineBetween(12, 12, 12, 34);
  g.fillStyle(0x3a2a14, 1).fillRect(6, 34, 12, 3);
}

// ---- the Grey's edge: clear on the left, thick fog from a third of the way across to the right ----

export function fogEdge(scene) {
  const c = scene.textures.createCanvas('fogedge', 512, 8), x = c.getContext(), grad = x.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(185,188,196,0)');
  grad.addColorStop(0.3, 'rgba(185,188,196,1)');
  grad.addColorStop(1, 'rgba(185,188,196,1)');
  x.fillStyle = grad;
  x.fillRect(0, 0, 512, 8);
  c.refresh();
}

// ---- the lantern picture: no face, only Gran's two hands lifting up the lit lantern in a dim room ----

function lanternPicture(scene) {
  const W = 1080, H = 500, c = scene.textures.createCanvas('lantern-pic', W, H), x = c.getContext();
  const room = x.createRadialGradient(540, 230, 20, 540, 230, 640);
  room.addColorStop(0, '#6e4822');
  room.addColorStop(0.5, '#3a2410');
  room.addColorStop(1, '#140b05');
  x.fillStyle = room;
  x.fillRect(0, 0, W, H);
  const halo = x.createRadialGradient(540, 215, 10, 540, 215, 340);
  halo.addColorStop(0, 'rgba(255,236,170,0.95)');
  halo.addColorStop(0.3, 'rgba(255,200,100,0.5)');
  halo.addColorStop(1, 'rgba(255,160,50,0)');
  x.fillStyle = halo;
  x.fillRect(0, 0, W, H);
  const face = (list, fill) => { x.beginPath(); list.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fillStyle = fill; x.fill(); };
  const P = (m, list) => list.map(([px, py]) => [540 - m * (540 - px), py]); // one hand drawn for the left (1), mirrored for the right (-1)
  const behind = (m) => { // the sleeve, the cuff and the palm the lantern rests on
    face(P(m, [[140, 500], [330, 500], [488, 366], [446, 312]]), '#b06a78');
    face(P(m, [[140, 500], [330, 500], [400, 440], [250, 440]]), '#9b5867');
    face(P(m, [[446, 312], [488, 366], [516, 346], [472, 292]]), '#efe6d0');
    face(P(m, [[472, 306], [516, 346], [500, 382], [566, 388], [572, 336], [520, 312]]), '#d79e74');
    face(P(m, [[500, 382], [566, 388], [572, 336], [540, 352]]), '#c48a62');
  };
  const front = (m) => { // the thumb and fingers curled round the foot of the lantern
    face(P(m, [[512, 312], [542, 296], [556, 318], [548, 340], [524, 338]]), '#f1c29c');
    face(P(m, [[500, 346], [530, 330], [552, 344], [548, 372], [510, 374]]), '#e8b48a');
    face(P(m, [[510, 374], [548, 372], [552, 384], [520, 392]]), '#c98f66');
  };
  behind(1);
  behind(-1);
  // the lantern: a ring, a roof, a brass frame and the glowing glass
  x.strokeStyle = '#4a321a';
  x.lineWidth = 7;
  x.beginPath();
  x.arc(540, 112, 22, Math.PI, 0);
  x.stroke();
  face([[540, 124], [468, 160], [612, 160]], '#3a2a14');
  face([[480, 160], [600, 160], [588, 308], [492, 308]], '#f3c050');
  const glass = x.createLinearGradient(0, 168, 0, 300);
  glass.addColorStop(0, '#fff6d0');
  glass.addColorStop(1, '#ffd36a');
  x.fillStyle = glass;
  x.fillRect(498, 170, 84, 130);
  x.fillStyle = '#ffffff';
  x.beginPath();
  x.ellipse(540, 240, 14, 34, 0, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = '#3a2a14';
  x.lineWidth = 5;
  x.beginPath();
  x.moveTo(480, 160); x.lineTo(492, 308);
  x.moveTo(600, 160); x.lineTo(588, 308);
  x.moveTo(540, 160); x.lineTo(540, 308);
  x.stroke();
  face([[488, 308], [592, 308], [584, 326], [496, 326]], '#3a2a14');
  front(1);
  front(-1);
  c.refresh();
}
