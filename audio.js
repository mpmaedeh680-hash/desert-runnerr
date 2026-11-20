let ac = null, master = null, muted = false;

// مرورگر فقط بعد از لمس کاربر اجازه‌ی پخش صدا می‌ده
function initAudio() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0.5;          // بلندی کلی صدا (۰ تا ۱)
    master.connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume();
}

// ساخت یک نت. slideTo باعث می‌شه فرکانس سر بخوره
function tone(freq, dur, type = 'square', vol = 0.15, slideTo = null, when = null) {
  if (!ac || muted) return;
  const t = when ?? ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur);
}

// صدای نویز (برای برخورد)
function noise(dur, vol = 0.3) {
  if (!ac || muted) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ac.createBufferSource();
  const g = ac.createGain();
  g.gain.value = vol;
  s.buffer = buf;
  s.connect(g);
  g.connect(master);
  s.start();
}

// افکت‌های صوتی بازی
const sfx = {
  jump:      () => tone(300, 0.15, 'square', 0.12, 700),
  milestone: () => {
    tone(880, 0.1, 'square', 0.1);
    tone(1320, 0.15, 'square', 0.1, null, ac.currentTime + 0.1);
  },
  crash:     () => {
    noise(0.4, 0.35);
    tone(200, 0.5, 'sawtooth', 0.2, 40);
  }
};

/* ---------- موسیقی پس‌زمینه (گام هجاز روی نت ر) ---------- */
const scale = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 554.37, 587.33];
const arp   = [0, 2, 3, 2, 4, 3, 2, 1, 0, 2, 4, 5, 4, 3, 2, 1];   // ترتیب نت‌ها
let musicStep = 0, nextNoteTime = 0;

function scheduleMusic() {
  if (!ac) return;
  if (state !== 'play' || muted) { nextNoteTime = ac.currentTime + 0.05; return; }

  // با بالا رفتن سرعت بازی، موسیقی تندتر می‌شه
  const stepDur = Math.max(0.09, 0.2 - (speed - 300) * 0.00022);

  while (nextNoteTime < ac.currentTime + 0.15) {
    const i = musicStep % arp.length;
    tone(scale[arp[i]], stepDur * 0.9, 'triangle', 0.1, null, nextNoteTime);
    if (i % 4 === 0) tone(scale[0] / 2, stepDur * 3, 'sine', 0.18, null, nextNoteTime);   // بیس
    nextNoteTime += stepDur;
    musicStep++;
  }
}
setInterval(scheduleMusic, 50);

// دکمه‌ی قطع و وصل صدا
document.getElementById('mute').addEventListener('pointerdown', e => {
  e.stopPropagation();
  initAudio();
  muted = !muted;
  e.currentTarget.textContent = muted ? '🔇' : '🔊';
});