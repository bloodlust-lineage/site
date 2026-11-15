#!/usr/bin/env node
/**
 * 下載 game-icons.net 圖示（CC BY 3.0）並轉成 src/data/icons.ts
 * ------------------------------------------------------------------
 * 只在新增或更換圖示時才需要執行：
 *   npm run icons
 *
 * 圖示授權：CC BY 3.0，作者 Lorc、Delapouite、Skoll、sbed 等
 * （https://game-icons.net），網站頁尾已附上出處。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'src', 'data', 'icons.ts');

/** 名稱 → game-icons 路徑（作者/檔名） */
const ICONS = {
  // 職業體系
  knight: 'lorc/checked-shield',
  warrior: 'lorc/battle-axe',
  rogue: 'lorc/backstab',
  archer: 'lorc/high-shot',
  mage: 'delapouite/fire-spell-cast',
  summoner: 'lorc/magic-portal',
  support: 'lorc/holy-symbol',
  // 史詩首領
  queenAnt: 'delapouite/ant',
  core: 'lorc/crystal-growth',
  orfen: 'cathelineau/medusa-head',
  baium: 'sbed/evil-wings',
  zaken: 'lorc/pirate-skull',
  antharas: 'delapouite/spiked-dragon-head',
  scarlet: 'lorc/scythe',
  // 系統特色
  board: 'lorc/scroll-unfurled',
  teleport: 'lorc/teleport',
  buff: 'lorc/aura',
  bot: 'lorc/robot-golem',
  shop: 'delapouite/shop',
  awaken: 'lorc/fire-ray',
  chest: 'skoll/open-treasure-chest',
  rank: 'skoll/rank-3',
  loot: 'lorc/swap-bag',
  weight: 'delapouite/weight',
  pvp: 'lorc/crossed-swords',
  laurel: 'lorc/laurel-crown',
  siege: 'delapouite/siege-tower',
  lastHero: 'lorc/crowned-skull',
  blood: 'skoll/blood',
  calendar: 'delapouite/calendar',
  dragon: 'lorc/dragon-head',
  portal: 'lorc/portal',
  beastEye: 'lorc/beast-eye',
  book: 'lorc/open-book',
  potion: 'lorc/heart-drop',
  hourglass: 'lorc/sands-of-time',
  fangs: 'skoll/fangs',
  bat: 'delapouite/bat',
  gems: 'lorc/gems',
  coins: 'delapouite/coins',
  upgrade: 'delapouite/upgrade',
  sword: 'lorc/broadsword',
  helm: 'lorc/visored-helm',
  crown: 'lorc/queen-crown',
  eclipse: 'lorc/eclipse',
  organ: 'caro-asercion/pipe-organ',
  castle: 'delapouite/castle',
};

const base = 'https://raw.githubusercontent.com/game-icons/icons/master/';
const entries = [];
for (const [name, file] of Object.entries(ICONS)) {
  const res = await fetch(base + file + '.svg');
  if (!res.ok) throw new Error(`下載失敗：${file}（HTTP ${res.status}）`);
  const svg = await res.text();
  // 每個檔案都是：第一個 path 是黑底方塊，其後才是圖示本體
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  const body = paths.filter((d) => !/^M0 0h512v512H0z$/i.test(d.trim()));
  if (!body.length) throw new Error(`找不到圖示路徑：${file}`);
  entries.push([name, file, body.join(' ')]);
  process.stdout.write('.');
}

const ts = `/* 由 scripts/fetch-icons.mjs 產生，請勿手動修改 */
/* 圖示來源：game-icons.net（CC BY 3.0），viewBox 0 0 512 512 */

export const icons = {
${entries.map(([n, f, d]) => `  /** ${f} */\n  ${n}: ${JSON.stringify(d)},`).join('\n')}
} as const;

export type IconName = keyof typeof icons;
`;
fs.writeFileSync(out, ts);
console.log(`\n已寫入 ${entries.length} 個圖示 → ${path.relative(root, out)}`);
