// Paste your Google Apps Script Web App URL here after deploying it
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzkN5-bwvAoGfE9ijvOCYrrHOBUfkUXoxPkHBt4cbQAKOBGcnGJmCdZkZsC7_jzt3ox/exec';

// ── Canvas setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const SCALE = 4;
const GROUND_Y = H - 50; // y of ground surface

// ── Colors ───────────────────────────────────────────────────────────────────
const C = {
  ' ': null,
  S: '#FDBCB4', // skin
  H: '#D4A000', // hair (golden)
  D: '#2B5FBF', // dress blue
  W: '#FFFFFF', // white
  R: '#C0392B', // red trim
  P: '#FF69B4', // pink flower
  Y: '#FFD700', // yellow flower
  G: '#2D8A4E', // green leaf
  B: '#7B3F00', // brown (pole)
  K: '#222222', // dark (shoes)
  T: '#A0522D', // tan/ribbon 1
  A: '#E74C3C', // ribbon red
  L: '#27AE60', // leaf green
  N: '#F5DEB3', // near-white apron
  O: '#CC7722', // orange accent
  V: '#1B5E20', // bottle dark green
  J: '#388E3C', // bottle highlight
  M: '#B0BEC5', // can silver
  Q: '#F9A825', // can label mustard
};

// ── Sprite renderer ───────────────────────────────────────────────────────────
function drawSprite(sprite, x, y) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const ch = sprite[row][col];
      if (ch === ' ') continue;
      const color = C[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round(x + col * SCALE),
        Math.round(y + row * SCALE),
        SCALE, SCALE
      );
    }
  }
}

function spriteWidth(sprite) {
  return (sprite[0]?.length ?? 0) * SCALE;
}
function spriteHeight(sprite) {
  return sprite.length * SCALE;
}

// ── Girl sprites ──────────────────────────────────────────────────────────────
// 13 cols × 18 rows, rendered at 4px = 52×72 px
const GIRL_RUN1 = [
  '  PYPYPYP   ', // crown flowers
  '  GGGGGGG   ', // crown leaves
  ' HHHHHHHHH  ', // hair
  ' HSSSSSSSSH ', // face row 1
  ' HSSSSSSSSH ', // face row 2
  '  SSSSSSSSS ', // neck
  ' NWWWWWWWWN ', // white blouse
  ' NWWWWWWWWN ', // blouse
  ' RRRRRRRRR  ', // red trim
  '  DDDDDDD   ', // dress
  ' NDDDDDDDN  ', // dress + apron
  ' NDDDDDDDN  ', // dress
  ' RRRRRRRR   ', // hem trim
  '   WW WW    ', // legs split
  '   WW  W    ', // legs (run 1)
  '  KKK  K    ', // shoes
];

const GIRL_RUN2 = [
  '  PYPYPYP   ',
  '  GGGGGGG   ',
  ' HHHHHHHHH  ',
  ' HSSSSSSSSH ',
  ' HSSSSSSSSH ',
  '  SSSSSSSSS ',
  ' NWWWWWWWWN ',
  ' NWWWWWWWWN ',
  ' RRRRRRRRR  ',
  '  DDDDDDD   ',
  ' NDDDDDDDN  ',
  ' NDDDDDDDN  ',
  ' RRRRRRRR   ',
  '   WW WW    ',
  '    W  WW   ', // legs (run 2 — opposite)
  '    K  KKK  ',
];

const GIRL_JUMP = [
  '  PYPYPYP   ',
  '  GGGGGGG   ',
  ' HHHHHHHHH  ',
  ' HSSSSSSSSH ',
  ' HSSSSSSSSH ',
  '  SSSSSSSSS ',
  ' NWWWWWWWWN ',
  ' NWWWWWWWWN ',
  ' RRRRRRRRR  ',
  '  DDDDDDD   ',
  ' NDDDDDDDN  ',
  ' NDDDDDDDN  ',
  ' RRRRRRRR   ',
  '  WWWWWW    ', // legs tucked
  '  KKKKK     ',
];

const GIRL_SPRITES = [GIRL_RUN1, GIRL_RUN2];

// Hitbox inset (pixels) — generous so it feels fair
const GIRL_HIT_INSET = { l: 10, r: 10, t: 8, b: 2 };

// ── Midsummer pole sprite ─────────────────────────────────────────────────────
// 10 cols × 28 rows — all green, top wreath, full crossbar, two hanging rings
const POLE = [
  '  GLLLLG  ', // 0: top wreath leaves
  ' GLPYYLGL ', // 1: pink/yellow flowers in wreath
  '  GLLLLG  ', // 2: wreath base
  '    LL    ', // 3: stem
  'LLLLLLLLLL', // 4: horizontal crossbar top
  'GLLLLLLLGL', // 5: crossbar center
  'LLLLLLLLLL', // 6: crossbar base
  ' P  LL  P ', // 7: top of rings (pink flower at attachment point)
  'L L LL L L', // 8: ring sides (hollow circles)
  ' Y  LL  Y ', // 9: bottom of rings (yellow flower)
  '    LL    ', // 10: pole shaft
  '   PLLP   ', // 11: flower accent
  '    LL    ', // 12
  '    LL    ', // 13
  '   YLLY   ', // 14: flower accent
  '    LL    ', // 15
  '    LL    ', // 16
  '    LL    ', // 17
  '   PLLP   ', // 18: flower accent
  '    LL    ', // 19
  '    LL    ', // 20
  '    LL    ', // 21
  '    LL    ', // 22
  '    LL    ', // 23
  '    LL    ', // 24
  '    LL    ', // 25
  '    LL    ', // 26
  '   LLLL   ', // 27: base
];

const POLE_W = spriteWidth(POLE);
const POLE_H = spriteHeight(POLE);

// ── Bottle sprite ─────────────────────────────────────────────────────────────
// 3 cols × 12 rows = 12×48 px
const BOTTLE = [
  ' V ',
  ' V ',
  'VJV',
  'VJV',
  'VJV',
  'VJV',
  'VJV',
  'VJV',
  'VJV',
  'VJV',
  'VVV',
  'VVV',
];
const BOTTLE_W = spriteWidth(BOTTLE);
const BOTTLE_H = spriteHeight(BOTTLE);

// ── Sill can sprite ───────────────────────────────────────────────────────────
// 12 cols × 9 rows = 48×36 px — mustard label with pixel-art "SILL" in white
// Pixel-art "SILL": S at cols 1-2, I at col 4, L at cols 6-7, L at cols 9-10
// Background Q (mustard), letters W (white), borders M (silver)
const SILL_CAN = [
  'KMMMMMMMMMMK', // top cap
  'MMMMMMMMMMMM',
  'MWWQWQWQQWQM', // S top WW, -, I, -, L left, -, L left
  'MWQQWQWQQWQM', // S left
  'MWWQWQWQQWQM', // S middle WW
  'MQWQWQWQQWQM', // S right
  'MWWQWQWWQWWM', // S/I/L/L bottom bars
  'MMMMMMMMMMMM',
  'KMMMMMMMMMMK', // bottom cap
];
const SILL_W = spriteWidth(SILL_CAN);
const SILL_H = spriteHeight(SILL_CAN);

// ── Ground decoration ─────────────────────────────────────────────────────────
const GRASS_BLADES = [];
for (let i = 0; i < 80; i++) {
  GRASS_BLADES.push({
    x: Math.random() * W * 2,
    h: 4 + Math.random() * 6,
  });
}

// ── State ─────────────────────────────────────────────────────────────────────
let state = 'NAME_ENTRY'; // 'NAME_ENTRY' | 'PLAYING' | 'GAME_OVER'
let playerName = '';
let score = 0;
let hiScore = 0;
let speed = 5;
let frameCount = 0;
let animFrame = 0;
let animTick = 0;

// Girl physics
let girlX = 80;
let girlY = GROUND_Y - spriteHeight(GIRL_RUN1);
let girlVY = 0;
const GRAVITY = 0.6;
const JUMP_V = -13;
let onGround = true;
let currentSprite = GIRL_RUN1;

// Poles
let poles = [];
let nextPoleIn = 90; // frames until next pole spawns

// Ground scroll
let groundOffset = 0;

// Cloud data
const CLOUDS = [
  { x: 100, y: 30, w: 80, speed: 0.3 },
  { x: 350, y: 55, w: 60, speed: 0.2 },
  { x: 580, y: 25, w: 100, speed: 0.25 },
  { x: 720, y: 48, w: 70, speed: 0.22 },
];

// ── UI helpers ────────────────────────────────────────────────────────────────
const overlay = document.getElementById('overlay');
const overlayMsg = document.getElementById('overlay-msg');
const nameInput = document.getElementById('name-input');
const actionBtn = document.getElementById('action-btn');

function showOverlay(msg, btnText, showInput) {
  overlayMsg.textContent = msg;
  actionBtn.textContent = btnText;
  nameInput.style.display = showInput ? 'block' : 'none';
  overlay.classList.remove('hidden');
  if (showInput) setTimeout(() => nameInput.focus(), 50);
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

// ── Start / restart ───────────────────────────────────────────────────────────
function startGame() {
  score = 0;
  speed = 5;
  frameCount = 0;
  animTick = 0;
  animFrame = 0;
  girlY = GROUND_Y - spriteHeight(GIRL_RUN1);
  girlVY = 0;
  onGround = true;
  poles = [];
  nextPoleIn = 90;
  groundOffset = 0;
  state = 'PLAYING';
  hideOverlay();
  requestAnimationFrame(loop);
}

// ── Input ─────────────────────────────────────────────────────────────────────
function jump() {
  if (state === 'PLAYING' && onGround) {
    girlVY = JUMP_V;
    onGround = false;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener('pointerdown', () => jump());

actionBtn.addEventListener('click', () => {
  if (state === 'NAME_ENTRY') {
    const n = nameInput.value.trim();
    if (!n) { nameInput.focus(); return; }
    playerName = n;
    startGame();
  } else if (state === 'GAME_OVER') {
    startGame();
  }
});

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') actionBtn.click();
});

// ── Collision ─────────────────────────────────────────────────────────────────
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function girlHitbox() {
  const gw = spriteWidth(GIRL_RUN1);
  const gh = spriteHeight(GIRL_RUN1);
  return {
    x: girlX + GIRL_HIT_INSET.l,
    y: girlY + GIRL_HIT_INSET.t,
    w: gw - GIRL_HIT_INSET.l - GIRL_HIT_INSET.r,
    h: gh - GIRL_HIT_INSET.t - GIRL_HIT_INSET.b,
  };
}

// ── Score submission ──────────────────────────────────────────────────────────
function submitScore() {
  if (APPS_SCRIPT_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') return;
  const url = APPS_SCRIPT_URL
    + '?name=' + encodeURIComponent(playerName)
    + '&score=' + Math.floor(score);
  fetch(url, { mode: 'no-cors' }).catch(() => {});
}

// ── Draw helpers ──────────────────────────────────────────────────────────────
function drawBackground() {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#4A9EDA');
  sky.addColorStop(1, '#87CEEB');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // Faint sea strip
  ctx.fillStyle = 'rgba(75, 155, 210, 0.22)';
  ctx.fillRect(0, 148, W, 68);
  // Faint sand strip
  ctx.fillStyle = 'rgba(218, 194, 140, 0.2)';
  ctx.fillRect(0, 202, W, GROUND_Y - 202);
  // 'Lomma Beach' watermark
  ctx.save();
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillStyle = 'rgba(140, 110, 55, 0.22)';
  ctx.textAlign = 'center';
  ctx.fillText('Lomma Beach', W / 2, 238);
  ctx.restore();

  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const cloud of CLOUDS) {
    cloud.x -= cloud.speed * (speed / 5);
    if (cloud.x + cloud.w < 0) cloud.x = W + cloud.w;
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.w / 2, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x + 20, cloud.y - 8, cloud.w / 3, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x - 20, cloud.y - 5, cloud.w / 3.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGround() {
  // Ground base
  ctx.fillStyle = '#4a7c3f';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // Lighter stripe
  ctx.fillStyle = '#5a9c52';
  ctx.fillRect(0, GROUND_Y, W, 6);

  // Scrolling grass blades
  groundOffset = (groundOffset + speed) % (W * 2);
  ctx.fillStyle = '#3d6b33';
  for (const blade of GRASS_BLADES) {
    const x = (blade.x - groundOffset + W * 2) % (W * 2);
    if (x > W) continue;
    ctx.fillRect(x, GROUND_Y - blade.h + 4, 2, blade.h);
  }
}

function drawScore() {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'right';
  const scoreStr = `POÄNG: ${String(Math.floor(score)).padStart(5, '0')}`;
  const hiStr = `BÄST: ${String(Math.floor(hiScore)).padStart(5, '0')}`;
  ctx.fillText(hiStr, W - 12, 24);
  ctx.fillText(scoreStr, W - 12, 44);
  ctx.textAlign = 'left';
}

// ── Main loop ─────────────────────────────────────────────────────────────────
function loop() {
  if (state !== 'PLAYING') return;
  frameCount++;

  // Score & speed
  score += speed / 10;
  if (frameCount % 300 === 0) speed = Math.min(speed + 0.5, 14);

  // Girl animation
  animTick++;
  if (animTick % 7 === 0) animFrame = (animFrame + 1) % 2;
  if (onGround) {
    currentSprite = GIRL_SPRITES[animFrame];
  } else {
    currentSprite = GIRL_JUMP;
  }

  // Physics
  if (!onGround) {
    girlVY += GRAVITY;
    girlY += girlVY;
    const groundLevel = GROUND_Y - spriteHeight(GIRL_RUN1);
    if (girlY >= groundLevel) {
      girlY = groundLevel;
      girlVY = 0;
      onGround = true;
    }
  }

  // Spawn poles
  nextPoleIn--;
  if (nextPoleIn <= 0) {
    const types = ['pole', 'pole', 'pole', 'bottle', 'sill'];
    poles.push({ x: W + 10, type: types[Math.floor(Math.random() * types.length)] });
    nextPoleIn = Math.floor(Math.random() * 70 + 65) + Math.max(0, Math.floor((10 - speed) * 5));
  }

  // Move poles
  for (const pole of poles) pole.x -= speed;
  poles = poles.filter(p => p.x > -120);

  // Collision
  const g = girlHitbox();
  for (const obs of poles) {
    let ox, oy, ow, oh;
    if (obs.type === 'bottle') {
      ox = obs.x;          ow = BOTTLE_W;
      oy = GROUND_Y - BOTTLE_H + 8; oh = BOTTLE_H - 8; // skip thin neck
    } else if (obs.type === 'sill') {
      ox = obs.x + 4;      ow = SILL_W - 8;
      oy = GROUND_Y - SILL_H; oh = SILL_H;
    } else {
      ox = obs.x + 10;     ow = POLE_W - 20;
      oy = GROUND_Y - POLE_H + 24; oh = POLE_H - 24;
    }
    if (rectsOverlap(g.x, g.y, g.w, g.h, ox, oy, ow, oh)) {
      gameOver();
      return;
    }
  }

  // Draw
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawGround();

  for (const obs of poles) {
    if (obs.type === 'bottle') drawSprite(BOTTLE, obs.x, GROUND_Y - BOTTLE_H);
    else if (obs.type === 'sill') drawSprite(SILL_CAN, obs.x, GROUND_Y - SILL_H);
    else drawSprite(POLE, obs.x, GROUND_Y - POLE_H);
  }

  drawSprite(currentSprite, girlX, girlY);
  drawScore();

  requestAnimationFrame(loop);
}

// ── Game over ─────────────────────────────────────────────────────────────────
function gameOver() {
  state = 'GAME_OVER';
  const finalScore = Math.floor(score);
  if (finalScore > hiScore) hiScore = finalScore;
  submitScore();

  // Draw one last frame with the girl standing still
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawGround();
  for (const obs of poles) {
    if (obs.type === 'bottle') drawSprite(BOTTLE, obs.x, GROUND_Y - BOTTLE_H);
    else if (obs.type === 'sill') drawSprite(SILL_CAN, obs.x, GROUND_Y - SILL_H);
    else drawSprite(POLE, obs.x, GROUND_Y - POLE_H);
  }
  drawSprite(GIRL_RUN1, girlX, girlY);
  drawScore();

  showOverlay(
    `${playerName}: ${finalScore} poäng!`,
    'Spela igen',
    false
  );
}

// ── Boot ──────────────────────────────────────────────────────────────────────
// Draw a static scene while waiting for name entry
(function drawIdle() {
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawGround();
  // Draw a decorative pole in the background
  drawSprite(POLE, W * 0.7, GROUND_Y - POLE_H);
  // Draw girl standing still
  drawSprite(GIRL_RUN1, girlX, GROUND_Y - spriteHeight(GIRL_RUN1));
})();

showOverlay('Ange ditt namn för att börja spela!', 'Spela!', true);
