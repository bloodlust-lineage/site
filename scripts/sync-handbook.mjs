#!/usr/bin/env node
/**
 * 冒險手冊同步
 * ------------------------------------------------------------------
 * 把伺服器專案產生好的冒險手冊（單一 HTML 檔）複製到官網：
 *   <伺服器專案>/wiki/index.html → src/handbook/wiki.html
 *
 * 官網的冒險手冊頁面（src/pages/handbook.astro）會從這個檔案取出資料、章節內容與程式，
 * 放進官網自己的版面；頁首、頁尾、搜尋列、章節欄與所有樣式都是官網的
 * （樣式在 src/styles/handbook.css）。所以這裡只做複製與檢查，不修改手冊的內容。
 *
 * 用法（在官網專案根目錄）：
 *   npm run sync-handbook
 *   npm run sync-handbook -- --from "路徑/wiki/index.html"
 *   npm run sync-handbook -- --check      只檢查來源檔，不複製
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
 * 複製前會先檢查來源檔（規則在 scripts/handbook-parts.mjs）：
 *   - 找不到資料、章節內容或程式，或手冊的程式需要官網頁面沒有的元素
 *     → 不複製，官網維持原本的版本，並說明哪裡對不上
 *   - 來源檔用到官網的手冊樣式還沒處理的類別
 *     → 照樣複製，但會列出來，提醒要在 src/styles/handbook.css 補上樣式
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitHandbook, stripInjected } from './handbook-parts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argFrom = args.indexOf('--from');
const checkOnly = args.includes('--check');
const localFile = path.join(root, '.handbook-source');
const fromLocal = fs.existsSync(localFile) ? fs.readFileSync(localFile, 'utf8').trim() : '';
const from = argFrom > -1 ? args[argFrom + 1] : process.env.HANDBOOK_SRC || fromLocal;
const out = path.join(root, 'src', 'handbook', 'wiki.html');

if (!from) {
  console.error('沒有指定冒險手冊的來源。\n請用 --from 指定 wiki/index.html，或把路徑寫進專案根目錄的 .handbook-source 檔案。');
  process.exit(1);
}
const src = path.resolve(from);
if (!fs.existsSync(src)) {
  console.error(`找不到冒險手冊：${src}\n請確認路徑，或用 --from 指定 wiki/index.html。`);
  process.exit(1);
}

// 換行統一成 LF；舊版官網加在手冊裡的內容（拿舊檔當來源時才會有）先拿掉
const html = stripInjected(fs.readFileSync(src, 'utf8')).replace(/\r\n/g, '\n');
const next = splitHandbook(html);
const fmt = (n) => Number(n).toLocaleString('zh-TW');
const describe = (m) => `資料日期 ${m.date || '（未標示）'}，道具 ${fmt(m.items)} 件、怪物 ${fmt(m.monsters)} 種、首領 ${fmt(m.bosses)} 隻、說明 ${m.guides} 篇`;

if (next.problems.length) {
  console.error('來源檔和官網的冒險手冊頁面對不上，沒有複製（官網維持原本的版本）：');
  for (const p of next.problems) console.error(`  - ${p}`);
  console.error('\n手冊的版面如果改過，請對照 src/pages/handbook.astro 與 scripts/handbook-parts.mjs 調整後再同步。');
  process.exit(1);
}

const prev = fs.existsSync(out) ? splitHandbook(fs.readFileSync(out, 'utf8')) : null;
if (prev && !prev.problems.length) console.log(`目前的版本：${describe(prev.meta)}`);
console.log(`來源的版本：${describe(next.meta)}`);

if (next.warnings.length) {
  console.log('\n提醒（頁面可以正常使用，但新的東西還沒有樣式）：');
  for (const w of next.warnings) console.log(`  - ${w}`);
  console.log('');
}

if (checkOnly) {
  console.log('只做檢查，沒有複製。');
  process.exit(0);
}
if (prev && fs.readFileSync(out, 'utf8') === html) {
  console.log('內容和目前的版本相同，不需要更新。');
  process.exit(0);
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`冒險手冊已同步：${path.relative(root, out)}（${kb} KB）`);
