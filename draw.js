const cv  = document.getElementById('c');
const ctx = cv.getContext('2d');

const W = 400, H = 600;
const GROUND = 470;       // ارتفاع زمین

// ستاره‌های پس‌زمینه (یک بار ساخته می‌شن)
const stars = [];
for (let i = 0; i < 40; i++) {
  stars.push([Math.random() * W, Math.random() * 300, Math.random() * 1.8 + 0.4]);
}

function draw(now) {
  // آسمان
  ctx.fillStyle = COLORS.sky;
  ctx.fillRect(0, 0, W, H);

  // ستاره‌ها
  ctx.fillStyle = COLORS.stars;
  stars.forEach(s => ctx.fillRect(s[0], s[1], s[2], s[2]));

  // خورشید
  ctx.fillStyle = COLORS.sun;
  ctx.beginPath();
  ctx.arc(310, 150, 36, 0, Math.PI * 2);
  ctx.fill();

  // تپه‌های دور
  ctx.fillStyle = COLORS.hills;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let i = 0; i <= W; i += 20) {
    ctx.lineTo(i, GROUND - 60 - Math.sin(i * 0.02 + 1) * 30);
  }
  ctx.lineTo(W, GROUND);
  ctx.fill();

  // زمین
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, GROUND, W, H - GROUND);

  // مانع‌ها و پرنده‌ها
  obstacles.forEach(o => {
    if (o.bird) {
      ctx.fillStyle = COLORS.bird;
      ctx.fillRect(o.x, o.y + 8, o.w, 12);                       // بدن
      const flap = Math.sin(now * 0.03) > 0 ? -10 : 8;
      ctx.fillRect(o.x + 10, o.y + 8 + flap, 16, 6);             // بال
      ctx.fillStyle = COLORS.birdEye;
      ctx.fillRect(o.x + 4, o.y + 10, 5, 5);                     // چشم
    } else {
      ctx.fillStyle = COLORS.cactus;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = COLORS.cactusTop;
      ctx.fillRect(o.x, o.y, o.w, 5);
    }
  });

  // بازیکن
  ctx.fillStyle = COLORS.player;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = COLORS.playerEye;
  ctx.fillRect(player.x + 22, player.y + 8, 6, 6);

  // امتیاز
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 28px Tahoma';
  ctx.textAlign = 'left';
  ctx.fillText(score, 20, 44);
  ctx.font = '14px Tahoma';
  ctx.fillText('رکورد ' + best, 20, 66);
}