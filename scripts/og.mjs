#!/usr/bin/env node
/**
 * 產生網站圖示與社群分享縮圖
 * ------------------------------------------------------------------
 *   npm run og
 *
 * 1. 網站圖示：由 public/favicon.svg 產生 favicon-32.png、apple-touch-icon.png、icon-192.png、icon-512.png
 * 2. 分享縮圖（public/og.jpg，1200×630）：用本機 Chrome 開啟首頁主視覺並截圖
 *    執行前請先在另一個終端機執行 npm run dev（或 npm run preview），
 *    網址可用 --url 指定，預設 http://127.0.0.1:4321/classic_site/
 *    Chrome 路徑可用環境變數 CHROME_PATH 指定。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

/* ---------- 1. 網站圖示 ---------- */
const svg = fs.readFileSync(path.join(pub, 'favicon.svg'));
const icons = [
  ['favicon-32.png', 32, 0],
  ['apple-touch-icon.png', 180, 14],
  ['icon-192.png', 192, 14],
  ['icon-512.png', 512, 40],
];
for (const [name, size, pad] of icons) {
  const inner = size - pad * 2;
  const img = await sharp(svg, { density: 512 }).resize(inner, inner).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: pad ? '#050406' : { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: img, left: pad, top: pad }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, name));
  console.log(`圖示 ${name}（${size}×${size}）`);
}

/* ---------- 2. 分享縮圖 ---------- */
const argUrl = process.argv.indexOf('--url');
const target = argUrl > -1 ? process.argv[argUrl + 1] : 'http://127.0.0.1:4321/classic_site/';
const chromePaths = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const chrome = chromePaths.find((p) => fs.existsSync(p));
if (!chrome) {
  console.warn('找不到 Chrome，略過分享縮圖。');
  process.exit(0);
}

const port = 9400 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--enable-unsafe-swiftshader', '--window-size=1200,630', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(200);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) => new Promise((res) => {
  const mid = ++id;
  pending.set(mid, res);
  ws.send(JSON.stringify({ id: mid, method, params }));
});
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: target });
await sleep(4500);
await send('Runtime.evaluate', {
  expression: `(() => {
    const s = document.createElement('style');
    s.textContent = '.hd,.hero__btns,.hero__facts,.hero__status{display:none!important}.hero{height:630px!important}.hero__inner{display:flex!important;align-items:center!important;height:100%!important}.hero__text{padding-block:0 60px!important}.hero__title{font-size:4.6rem!important}';
    document.head.appendChild(s);
  })()`,
});
await sleep(800);
const { data } = await send('Page.captureScreenshot', { format: 'png' });
await sharp(Buffer.from(data, 'base64')).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(pub, 'og.jpg'));
console.log('分享縮圖 og.jpg（1200×630）');
ws.close();
proc.kill();
setTimeout(() => process.exit(0), 300);
