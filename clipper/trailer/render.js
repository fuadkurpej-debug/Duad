// Renderuje trailer.html u frame-ove (30 fps) i spaja ih u MP4 preko ffmpeg-a.
// Upotreba: node render.js <chromium-putanja> <ffmpeg-putanja> <izlaz.mp4>
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const path = require('path');

const [chrome, ffmpeg, out] = process.argv.slice(2);
const FPS = 30, SECONDS = 15;

(async () => {
  const browser = await chromium.launch({ executablePath: chrome });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'trailer.html'));
  await page.evaluate(() => document.fonts.ready);
  const enc = spawn(ffmpeg, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < FPS * SECONDS; f++) {
    await page.evaluate((t) => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
  }
  enc.stdin.end();
  await new Promise((r) => enc.on('close', r));
  await browser.close();
  console.log('Gotovo:', out);
})();
