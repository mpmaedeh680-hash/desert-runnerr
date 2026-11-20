const ui = document.getElementById('ui');

let state = 'idle';       // idle | play | over
let player, obstacles, speed, score, startTime, spawnTimer, lastMilestone;
let overAt = 0;
let best = 0;
try { best = Number(localStorage.getItem('best')) || 0; } catch (e) {}

// شروع یا ریست
function reset() {
  player = { x: 70, y: GROUND - 40, w: 34, h: 40, vy: 0, onGround: true };
  obstacles = [];
  speed = 300;            // سرعت شروع
  score = 0;
  lastMilestone = 0;
  spawnTimer = 1;
  startTime = performance.now();
  musicStep = 0;
}

/* ---------- ورودی ---------- */
function jump() {
  initAudio();
  if (state === 'over' && performance.now() - overAt < 500) return;
  if (state === 'idle' || state === 'over') {
    reset();
    state = 'play';
    ui.classList.add('hide');
    return;
  }
  if (player.onGround) {
    player.vy = -720;     // قدرت پرش
    player.onGround = false;
    sfx.jump();
  }
}

// ول کردن انگشت وسط پرش = پرش کوتاه‌تر
function release() {
  if (state === 'play' && !player.onGround && player.vy < -300) player.vy = -300;
}

addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
addEventListener('pointerup', release);
addEventListener('pointercancel', release);
addEventListener('keydown', e => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !e.repeat) { e.preventDefault(); jump(); }
});
addEventListener('keyup', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') release();
});

/* ---------- پایان بازی ---------- */
function gameOver() {
  state = 'over';
  overAt = performance.now();
  sfx.crash();
  if (score > best) {
    best = score;
    try { localStorage.setItem('best', best); } catch (e) {}
  }
  document.getElementById('t').textContent = 'باختی!';
  document.getElementById('m').textContent = 'امتیاز: ' + score + '   رکورد: ' + best;
  document.getElementById('s').textContent = 'برای شروع دوباره لمس کن';
  setTimeout(() => ui.classList.remove('hide'), 250);
}

/* ---------- ساخت مانع ---------- */
function spawnObstacle() {
  const r = Math.random();
  if (score > 120 && r < 0.25) {
    obstacles.push({ x: W + 20, y: GROUND - 85 + Math.random() * 10, w: 38, h: 26, bird: true });
  } else if (score > 50 && r < 0.5) {
    const h1 = 30 + Math.random() * 35;
    const h2 = 30 + Math.random() * 35;
    obstacles.push({ x: W + 20,      y: GROUND - h1, w: 22, h: h1 });
    obstacles.push({ x: W + 20 + 38, y: GROUND - h2, w: 22, h: h2 });
  } else {
    const h = 30 + Math.random() * 45;
    obstacles.push({ x: W + 20, y: GROUND - h, w: 24 + Math.random() * 18, h });
  }
}

/* ---------- حلقه‌ی اصلی ---------- */
let last = performance.now();

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.033);
  last = now;

  if (state === 'play') {
    speed = Math.min(speed + dt * 18, 1000);   // شتاب و سقف سرعت

    player.vy += 1900 * dt;                    // جاذبه
    player.y += player.vy * dt;
    if (player.y >= GROUND - player.h) {
      player.y = GROUND - player.h;
      player.vy = 0;
      player.onGround = true;
    }

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = 0.95 + Math.random() * 0.9;
    }

    obstacles.forEach(o => o.x -= speed * dt);
    obstacles = obstacles.filter(o => o.x + o.w > -10);

    for (const o of obstacles) {
      const hit =
        player.x + player.w - 6 > o.x &&
        player.x + 6 < o.x + o.w &&
        player.y + player.h - 4 > o.y &&
        player.y + 4 < o.y + o.h;
      if (hit) { gameOver(); break; }
    }

    score = Math.floor((now - startTime) / 100);
    if (score - lastMilestone >= 100) {
      lastMilestone = score - (score % 100);
      sfx.milestone();
    }
  }

  draw(now);
  requestAnimationFrame(loop);
}

/* ---------- دکمه‌ی تمام‌صفحه ---------- */
const fullBtn = document.getElementById('full');
const root = document.documentElement;
if (fullBtn) {
  if (!root.requestFullscreen) {
    fullBtn.style.display = 'none';      // آیفون این قابلیت رو نداره
  }
  fullBtn.addEventListener('pointerdown', e => e.stopPropagation());
  fullBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      root.requestFullscreen().catch(() => {});
    }
  });
}

reset();
requestAnimationFrame(loop);
