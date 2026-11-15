#!/usr/bin/env node
/**
 * 冒險手冊同步
 * ------------------------------------------------------------------
 * 把伺服器專案產生好的冒險手冊（單一 HTML 檔）複製到官網：
 *   <伺服器專案>/wiki/index.html → public/handbook/index.html
 *
 * 用法（在官網專案根目錄）：
 *   npm run sync-handbook
 *   npm run sync-handbook -- --from "路徑/wiki/index.html"
 *
 * 來源路徑的決定順序：
 *   1. 指令的 --from 參數
 *   2. 環境變數 HANDBOOK_SRC
 *   3. 專案根目錄的 .handbook-source 檔案（裡面只有一行路徑；這個檔案只留在本機，不會上傳）
 *
 * 伺服器資料或手冊內容更新時：
 *   1. 在伺服器專案重新產生 wiki
 *   2. 回到這裡執行 npm run sync-handbook，再 commit 推送即可
 *
 * 複製時會順便加上：網站圖示、回到官網的小按鈕、canonical 網址。手冊本身內容不做任何修改。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argFrom = process.argv.indexOf('--from');
const localFile = path.join(root, '.handbook-source');
const fromLocal = fs.existsSync(localFile) ? fs.readFileSync(localFile, 'utf8').trim() : '';
const from = argFrom > -1 ? process.argv[argFrom + 1] : process.env.HANDBOOK_SRC || fromLocal;
if (!from) {
  console.error('沒有指定冒險手冊的來源。\n請用 --from 指定 wiki/index.html，或把路徑寫進專案根目錄的 .handbook-source 檔案。');
  process.exit(1);
}
const src = path.resolve(from);
const outDir = path.join(root, 'public', 'handbook');
const out = path.join(outDir, 'index.html');

if (!fs.existsSync(src)) {
  console.error(`找不到冒險手冊：${src}\n請確認路徑，或用 --from 指定 wiki/index.html。`);
  process.exit(1);
}

let html = fs.readFileSync(src, 'utf8');

const head = `
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#050406">
<meta name="description" content="嗜血天堂II 經典服冒險手冊：練功地圖、怪物與首領圖鑑、道具、商店、製作配方、強化與副本規則，資料由伺服器設定自動產生。">
<style>
.bl-home{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:60;display:inline-flex;align-items:center;gap:8px;padding:9px 16px 9px 12px;border-radius:999px;background:#120a0e;color:#f1e1bb;font:600 13px/1 "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;letter-spacing:.08em;text-decoration:none;border:1px solid rgba(227,200,145,.4);box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .3s,background .3s}
.bl-home:hover{transform:translateY(-2px);background:#2a0d17;text-decoration:none}
.bl-home svg{width:18px;height:18px}
@media print{.bl-home{display:none}}
</style>`;

const button = `
<a class="bl-home" href="../" aria-label="回到嗜血天堂II官方網站"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#0b0609" stroke="#cfa96a" stroke-width="2"/><circle cx="32" cy="30" r="17" fill="#c41f35"/><path d="M32 5 34.6 17.5V38.6L32 45.6 29.4 38.6V17.5Z" fill="#0b0609" stroke="#cfa96a"/></svg>回到官網</a>`;

// 只插入一次（重複執行也不會疊加）
html = html.replace(/<!-- bl:inject:start -->[\s\S]*?<!-- bl:inject:end -->/g, '');
if (/<\/head>/i.test(html)) {
  html = html.replace(/<\/head>/i, `<!-- bl:inject:start -->${head}<!-- bl:inject:end -->\n</head>`);
} else {
  // 手冊的 template 沒有 <head> 標籤時，插在 <title> 後面
  html = html.replace(/(<title>[\s\S]*?<\/title>)/i, `$1\n<!-- bl:inject:start -->${head}<!-- bl:inject:end -->`);
}
if (/<\/body>/i.test(html)) {
  html = html.replace(/<\/body>/i, `<!-- bl:inject:start -->${button}<!-- bl:inject:end -->\n</body>`);
} else {
  html += `\n<!-- bl:inject:start -->${button}<!-- bl:inject:end -->\n`;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`冒險手冊已同步：${path.relative(root, out)}（${kb} KB）`);
