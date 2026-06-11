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

// ── Frog sprites ──────────────────────────────────────────────────────────────
// 13 cols × 11 rows, rendered at 4px = 52×44 px
const FROG_RUN1 = [
  '  WWW   WWW  ', // eyes
  '  WKW   WKW  ', // pupils
  ' LLLLLLLLLLL ', // head
  'LLLLLLLLLLLLL',
  'LLLLLLLLLLLLL',
  'LJNNNNNNNNNJL', // belly
  'LJNNNNNNNNNJL',
  'LLNNNNNNNNNLL',
  ' LLLLLLLLLLL ',
  '  LLL   LLL  ', // legs
  ' VV     VV   ', // feet (run 1)
];

const FROG_RUN2 = [
  '  WWW   WWW  ',
  '  WKW   WKW  ',
  ' LLLLLLLLLLL ',
  'LLLLLLLLLLLLL',
  'LLLLLLLLLLLLL',
  'LJNNNNNNNNNJL',
  'LJNNNNNNNNNJL',
  'LLNNNNNNNNNLL',
  ' LLLLLLLLLLL ',
  '  LLL   LLL  ',
  '   VV     VV ', // feet (run 2 — opposite)
];

const FROG_LEAP = [
  '  WWW   WWW  ',
  '  WKW   WKW  ',
  ' LLLLLLLLLLL ',
  'LLLLLLLLLLLLL',
  'LJNNNNNNNNNJL',
  'LLNNNNNNNNNLL',
  ' LLLLLLLLLLL ',
  '  LL     LL  ',
  '  LL     LL  ', // legs stretched out mid-leap
  ' LL       LL ',
  'VV         VV',
];

const FROG_TUCK = [
  '  WWW   WWW  ',
  '  WKW   WKW  ',
  ' LLLLLLLLLLL ',
  'LLLLLLLLLLLLL',
  'LJNNNNNNNNNJL',
  'LJNNNNNNNNNJL',
  'LLNNNNNNNNNLL',
  ' LLLLLLLLLLL ',
  ' LLLLLLLLLLL ', // legs pulled in for landing
  '  VVV   VVV  ',
  '             ',
];

const FROG_SPRITES = [FROG_RUN1, FROG_RUN2];

// Hitbox inset (pixels) — generous so it feels fair
const FROG_HIT_INSET = { l: 6, r: 6, t: 6, b: 2 };

// ── midsummer pole sprite ───────────────────────────────────────────────────── //
// 14 cols × 25 rows — thinner crossbar, diagonals from top-center to outer-bottom
const POLE = [
  '    LLLL    ', // 3: diagonals starting tight at the top center
  '   LLLLLL   ', // 4: diagonals starting to spread
  '  L LLLL L  ', // 5: diagonals body moving outward
  ' L  LLLL  L ', // 6: diagonals body moving outward
  'GLLLLLLLLLLG', // 7: crossbar (diagonals connect to the outer edges 'G' here)
  '  PP    PP  ', // 8: top of rings (pink attachment points)
  ' LLLL  LLLL ', // 9: ring tops
  'LL  LLLL  LL', // 10: ring sides / pole shaft
  'LL  LLLL  LL', // 11: ring sides
  ' LLLL  LLLL ', // 12: ring bottoms
  '  YY    YY  ', // 13: bottom of rings (yellow flower)
  '    LLLL    ', // 14: pole shaft
  '   PLLLLP   ', // 15: flower accent
  '    LLLL    ', // 16
  '    LLLL    ', // 17
  '   YLLLLY   ', // 18: flower accent
  '    LLLL    ', // 19
  '    LLLL    ', // 20
  '    LLLL    ', // 21
  '   PLLLLP   ', // 22: flower accent
  '    LLLL    ', // 23
  '    LLLL    ', // 24
  '    LLLL    ', // 25
  '    LLLL    ', // 26
  '    LLLL    ', // 27: base
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
// 12 cols × 9 rows = 48×36 px — blue can, white fish on the label.
// Fish faces left: nose, eye, body, V-tail at the right
const SILL_CAN = [
  'KMMMMMMMMMMK', // top cap (silver)
  'DDDDDDDDDDDD',
  'DDDDDDDDDDDD',
  'DDDWWWWDDWDD', // fish back + upper tail fin
  'DDWKWWWWWWDD', // nose, eye, body, tail centre
  'DDDWWWWDDWDD', // fish belly + lower tail fin
  'DDDDDDDDDDDD',
  'DDDDDDDDDDDD',
  'KMMMMMMMMMMK', // bottom cap (silver)
];
const SILL_W = spriteWidth(SILL_CAN);
const SILL_H = spriteHeight(SILL_CAN);

// ── Seagull sprite ────────────────────────────────────────────────────────────
// 11 cols × 6 rows = 44×24 px — flies left, two wing frames, body on rows 2-3
const BIRD_UP = [
  '    MM     ',
  '    MMM    ',
  ' OKWWWWWWM ',
  '  WWWWWWW  ',
  '           ',
  '           ',
];
const BIRD_DOWN = [
  '           ',
  '           ',
  ' OKWWWWWWM ',
  '  WWWWWWW  ',
  '    MMM    ',
  '    MM     ',
];
const BIRD_W = spriteWidth(BIRD_UP);
const BIRD_H = spriteHeight(BIRD_UP);

// ── People sprites ────────────────────────────────────────────────────────────
// 11 cols × 14 rows = 44×56 px — midsummer guests in blue & yellow with flower
// wreaths. Girls: long hair + dress; boys: short hair + pants. Two walk frames.
const GIRL_WALK1 = [
  '  GLRGLWG  ', // flower wreath — green with dashes of red and white
  ' HHHHHHHHH ',
  ' HSSSSSSSH ',
  ' HSSSSSSSH ',
  ' HHSSSSSHH ',
  ' HHYYYYYHH ', // yellow blouse, long hair down the sides
  ' HHYYYYYHH ',
  '  YYYYYYY  ',
  '  DDDDDDD  ', // blue dress
  ' DDDDDDDDD ',
  'DDDDDDDDDDD',
  '   SS SS   ',
  '   SS SS   ',
  '  KKK KKK  ',
];

const GIRL_WALK2 = [
  '  GLRGLWG  ',
  ' HHHHHHHHH ',
  ' HSSSSSSSH ',
  ' HSSSSSSSH ',
  ' HHSSSSSHH ',
  ' HHYYYYYHH ',
  ' HHYYYYYHH ',
  '  YYYYYYY  ',
  '  DDDDDDD  ',
  ' DDDDDDDDD ',
  'DDDDDDDDDDD',
  '   SS SS   ',
  '  SS   SS  ', // legs apart mid-stride
  ' KKK   KKK ',
];

const BOY_WALK1 = [
  '  GLRGLWG  ', // flower wreath — green with dashes of red and white
  '  HHHHHHH  ', // short hair
  '  SSSSSSS  ',
  '  SSSSSSS  ',
  '   SSSSS   ',
  '  YYYYYYY  ', // yellow shirt
  ' YYYYYYYYY ',
  ' YYYYYYYYY ',
  '  YYYYYYY  ',
  '  DDDDDDD  ', // blue pants
  '  DDDDDDD  ',
  '  DD   DD  ',
  '  DD   DD  ',
  '  KK   KK  ',
];

const BOY_WALK2 = [
  '  GLRGLWG  ',
  '  HHHHHHH  ',
  '  SSSSSSS  ',
  '  SSSSSSS  ',
  '   SSSSS   ',
  '  YYYYYYY  ',
  ' YYYYYYYYY ',
  ' YYYYYYYYY ',
  '  YYYYYYY  ',
  '  DDDDDDD  ',
  '  DDDDDDD  ',
  '  DD   DD  ',
  '   DD DD   ', // legs together mid-stride
  '   KK KK   ',
];

const PERSON_SPRITES = { girl: [GIRL_WALK1, GIRL_WALK2], boy: [BOY_WALK1, BOY_WALK2] };
const PERSON_W = spriteWidth(GIRL_WALK1);
const PERSON_H = spriteHeight(GIRL_WALK1);
const PERSON_WALK_SPEED = 1; // extra px/frame — they stroll toward the player

const PEOPLE = [
  { name: 'Malte', g: 'boy' },
  { name: 'Sanne', g: 'girl' },
  { name: 'Linus', g: 'boy' },
  { name: 'Pawel', g: 'boy' },
  { name: 'Lina', g: 'girl' },
  { name: 'Alice', g: 'girl' },
  { name: 'Oscar', g: 'boy' },
  { name: 'Donjeta', g: 'girl' },
  { name: 'Jacob', g: 'boy' },
  { name: 'Oliver', g: 'boy' },
  { name: 'Axel', g: 'boy' },
  { name: 'Arvid', g: 'boy' },
  { name: 'Morris', g: 'boy' },
  { name: 'Patric', g: 'boy' },
  { name: 'Sara', g: 'girl' },
  { name: 'Petra', g: 'girl' },
  { name: 'Ralf', g: 'boy' },
  { name: 'Kevin', g: 'boy' },
  { name: 'Lovisa', g: 'girl' },
  { name: 'Varad', g: 'boy' },
  { name: 'Elisabeth', g: 'girl' },
  { name: 'Judith', g: 'girl' },
  { name: 'Gustav', g: 'boy' },
  { name: 'Erik', g: 'boy' },
];

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

// Frog physics
let frogX = 80;
let frogY = GROUND_Y - spriteHeight(FROG_RUN1);
let frogVY = 0;
const GRAVITY = 0.6;
const JUMP_V = -13;
let onGround = true;
let currentSprite = FROG_RUN1;

// Poles
let poles = [];
let nextPoleIn = 90; // frames until next pole spawns

// Slow motion while a person walks into frame, so their name can be read
const SLOWMO_FACTOR = 0.20;
const SLOWMO_DURATION = 100; // frames
let slowmoFrames = 0;

// Birds (only appear once speed reaches BIRD_MIN_SPEED)
const BIRD_MIN_SPEED = 15;
const BIRD_ALTITUDES = [80, 150]; // bird-bottom px above ground — safe to run under, risky to jump into
let birds = [];
let nextBirdIn = 150;
let birdHits = 0;     // first bird hit only stings
let invulnFrames = 0; // flashing grace period after a bird hit

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
  frogY = GROUND_Y - spriteHeight(FROG_RUN1);
  frogVY = 0;
  onGround = true;
  poles = [];
  nextPoleIn = 90;
  slowmoFrames = 0;
  birds = [];
  nextBirdIn = 150;
  birdHits = 0;
  invulnFrames = 0;
  groundOffset = 0;
  state = 'PLAYING';
  hideOverlay();
  requestAnimationFrame(loop);
}

// ── Input ─────────────────────────────────────────────────────────────────────
function jump() {
  if (state === 'PLAYING' && onGround) {
    frogVY = JUMP_V;
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

function frogHitbox() {
  const gw = spriteWidth(FROG_RUN1);
  const gh = spriteHeight(FROG_RUN1);
  return {
    x: frogX + FROG_HIT_INSET.l,
    y: frogY + FROG_HIT_INSET.t,
    w: gw - FROG_HIT_INSET.l - FROG_HIT_INSET.r,
    h: gh - FROG_HIT_INSET.t - FROG_HIT_INSET.b,
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
function drawBackground(scroll = 0) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#4A9EDA');
  sky.addColorStop(1, '#87CEEB');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // Stationary sun tucked into the top right corner — only a quarter disc shows
  ctx.fillStyle = 'rgba(255, 221, 80, 0.55)';
  ctx.beginPath();
  ctx.moveTo(W, 0);
  ctx.arc(W, 0, 64, Math.PI / 2, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 221, 80, 0.35)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 2 + ((Math.PI / 2) * (i + 0.5)) / 4;
    ctx.beginPath();
    ctx.moveTo(W + Math.cos(a) * 74, Math.sin(a) * 74);
    ctx.lineTo(W + Math.cos(a) * 88, Math.sin(a) * 88);
    ctx.stroke();
  }

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
    cloud.x -= cloud.speed * (scroll / 5);
    if (cloud.x + cloud.w < 0) cloud.x = W + cloud.w;
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.w / 2, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x + 20, cloud.y - 8, cloud.w / 3, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x - 20, cloud.y - 5, cloud.w / 3.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGround(scroll = 0) {
  // Ground base
  ctx.fillStyle = '#4a7c3f';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // Lighter stripe
  ctx.fillStyle = '#5a9c52';
  ctx.fillRect(0, GROUND_Y, W, 6);

  // Scrolling grass blades
  groundOffset = (groundOffset + scroll) % (W * 2);
  ctx.fillStyle = '#3d6b33';
  for (const blade of GRASS_BLADES) {
    const x = (blade.x - groundOffset + W * 2) % (W * 2);
    if (x > W) continue;
    ctx.fillRect(x, GROUND_Y - blade.h + 4, 2, blade.h);
  }
}

function drawObstacles() {
  for (const obs of poles) {
    if (obs.type === 'bottle') drawSprite(BOTTLE, obs.x, GROUND_Y - BOTTLE_H);
    else if (obs.type === 'sill') drawSprite(SILL_CAN, obs.x, GROUND_Y - SILL_H);
    else if (obs.type === 'person') {
      const frames = PERSON_SPRITES[obs.person.g];
      drawSprite(frames[frameCount % 20 < 10 ? 0 : 1], obs.x, GROUND_Y - PERSON_H);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 36px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(obs.person.name, obs.x + PERSON_W / 2, GROUND_Y + 36);
      ctx.textAlign = 'left';
    }
    else drawSprite(POLE, obs.x, GROUND_Y - POLE_H);
  }
  const birdSprite = frameCount % 16 < 8 ? BIRD_UP : BIRD_DOWN;
  for (const bird of birds) drawSprite(birdSprite, bird.x, bird.y);
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

  // Score & speed (slow motion scales movement, not physics)
  const tick = slowmoFrames > 0 ? SLOWMO_FACTOR : 1;
  const effSpeed = speed * tick;
  if (slowmoFrames > 0) slowmoFrames--;
  score += effSpeed / 10;
  if (frameCount % 80 === 0) speed = Math.min(speed + 0.5, 22);
  if (invulnFrames > 0) invulnFrames--;

  // Frog animation
  animTick++;
  if (animTick % 7 === 0) animFrame = (animFrame + 1) % 2;
  if (onGround) {
    currentSprite = FROG_SPRITES[animFrame];
  } else {
    currentSprite = frogVY < 0 ? FROG_LEAP : FROG_TUCK;
  }

  // Physics
  if (!onGround) {
    frogVY += GRAVITY * tick;
    frogY += frogVY * tick;
    const groundLevel = GROUND_Y - spriteHeight(FROG_RUN1);
    if (frogY >= groundLevel) {
      frogY = groundLevel;
      frogVY = 0;
      onGround = true;
    }
  }

  // Spawn poles
  nextPoleIn -= tick;
  if (nextPoleIn <= 0) {
    const types = ['pole', 'pole', 'pole', 'bottle', 'sill', 'person'];
    const type = types[Math.floor(Math.random() * types.length)];
    const obs = { x: W + 10, type };
    if (type === 'person') {
      obs.person = PEOPLE[Math.floor(Math.random() * PEOPLE.length)];
      slowmoFrames = SLOWMO_DURATION;
    }
    poles.push(obs);
    nextPoleIn = Math.floor(Math.random() * 60 + 55) + Math.max(0, Math.floor((10 - speed) * 5));
  }

  // Move poles (people also walk toward the player)
  for (const pole of poles) pole.x -= pole.type === 'person' ? effSpeed + PERSON_WALK_SPEED * tick : effSpeed;
  poles = poles.filter(p => p.x > -120);

  // Spawn birds (late-game only) — they fly a bit faster than the ground scrolls
  if (speed >= BIRD_MIN_SPEED) {
    nextBirdIn -= tick;
    if (nextBirdIn <= 0) {
      const alt = BIRD_ALTITUDES[Math.floor(Math.random() * BIRD_ALTITUDES.length)];
      birds.push({ x: W + 10, y: GROUND_Y - alt - BIRD_H });
      nextBirdIn = Math.floor(Math.random() * 240 + 180);
    }
  }
  for (const bird of birds) bird.x -= effSpeed + 3 * tick;
  birds = birds.filter(b => b.x > -BIRD_W - 20);

  // Collision
  const g = frogHitbox();
  for (const obs of poles) {
    let ox, oy, ow, oh;
    if (obs.type === 'bottle') {
      ox = obs.x;          ow = BOTTLE_W;
      oy = GROUND_Y - BOTTLE_H + 8; oh = BOTTLE_H - 8; // skip thin neck
    } else if (obs.type === 'sill') {
      ox = obs.x + 4;      ow = SILL_W - 8;
      oy = GROUND_Y - SILL_H; oh = SILL_H;
    } else if (obs.type === 'person') {
      ox = obs.x + 8;      ow = PERSON_W - 16;
      oy = GROUND_Y - PERSON_H + 4; oh = PERSON_H - 4;
    } else {
      ox = obs.x + 10;     ow = POLE_W - 20;
      oy = GROUND_Y - POLE_H + 24; oh = POLE_H - 24;
    }
    if (rectsOverlap(g.x, g.y, g.w, g.h, ox, oy, ow, oh)) {
      gameOver();
      return;
    }
  }
  for (let i = birds.length - 1; i >= 0; i--) {
    const bird = birds[i];
    // body only (rows 2-3), so wing tips don't kill
    if (rectsOverlap(g.x, g.y, g.w, g.h, bird.x + 4, bird.y + 8, BIRD_W - 8, BIRD_H - 16)) {
      if (invulnFrames > 0) continue;
      birds.splice(i, 1);
      birdHits++;
      if (birdHits >= 2) {
        gameOver();
        return;
      }
      invulnFrames = 90; // ~1.5 s of flashing
    }
  }

  // Draw
  ctx.clearRect(0, 0, W, H);
  drawBackground(effSpeed);
  drawGround(effSpeed);

  drawObstacles();

  // blink while invulnerable (always draws when invulnFrames is 0)
  if (invulnFrames % 8 < 4) drawSprite(currentSprite, frogX, frogY);
  drawScore();

  requestAnimationFrame(loop);
}

// ── Game over ─────────────────────────────────────────────────────────────────
function gameOver() {
  state = 'GAME_OVER';
  const finalScore = Math.floor(score);
  if (finalScore > hiScore) hiScore = finalScore;
  submitScore();

  // Draw one last frame with the frog standing still
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawGround();
  drawObstacles();
  drawSprite(FROG_RUN1, frogX, frogY);
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
  // Draw frog standing still
  drawSprite(FROG_RUN1, frogX, GROUND_Y - spriteHeight(FROG_RUN1));
})();

showOverlay('Ange ditt namn för att börja spela!', 'Spela!', true);
