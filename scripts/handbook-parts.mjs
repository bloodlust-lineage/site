/**
 * 冒險手冊的來源檔（伺服器專案產生的單一 HTML）拆解與檢查
 * ------------------------------------------------------------------
 * 官網的冒險手冊頁面（src/pages/handbook.astro）不直接放這個 HTML，而是只取出三塊：
 *   1. 資料      <script id="wiki-data" type="application/json">…</script>
 *   2. 章節內容  <template id="guides">…</template>
 *   3. 程式      最後那段 <script>…</script>
 * 頁首、頁尾、搜尋列、章節欄與所有樣式都由官網自己提供（樣式在 src/styles/handbook.css）。
 *
 * 所以來源檔的版面如果有變動（多了新的元素或新的樣式類別），官網這邊要跟著補。
 * 這個模組負責把這種情況找出來：
 *   - problems：不處理頁面會壞掉（同步腳本會拒絕更新，網站建置也會失敗）
 *   - warnings：頁面能用，但新的東西還沒有樣式（同步腳本會列出來提醒）
 * 同步腳本（scripts/sync-handbook.mjs）與冒險手冊頁面共用這個檔案。
 */

/** 手冊程式一啟動就會找的元素，官網的頁面都有提供 */
export const STATIC_IDS = ['wiki-data', 'guides', 'view', 'nav', 'navbtn', 'q', 'sugg'];

/** 手冊程式自己畫出來、之後再找的元素 */
const DYNAMIC_IDS = ['mylv', 'finder-out'];

/** src/styles/handbook.css 已經處理的樣式類別（來源檔出現這份清單以外的類別時會提醒） */
export const KNOWN_CLASSES = [
  // 版面
  'top', 'top-in', 'brand', 'navbtn', 'search', 'sugg', 'more', 'shell', 'nav', 'open', 'on', 'foot',
  // 總覽
  'hero', 'plates', 'plate', 'finder', 'zgrid', 'zcard', 'chapters',
  // 章節
  'sec', 'guide', 'note', 'warn', 'tag', 'chip', 'hot', 'ok', 'na', 'toc', 'pager',
  // 表格
  'tw', 't', 'n', 'nw', 'sup',
  // 資料庫
  'dbhead', 'filters', 'grow', 'seg', 'count', 'morebtn', 'gb', 'il', 'lv', 'gold',
  'D', 'C', 'B', 'A', 'S', 'S80', 'S84', 'R', 'R95', 'R99', 'R110',
  // 詳細頁
  'detail-h', 'kv', 'desc', 'sec-h', 'empty', 'mats', 'pad', 'sugg-list',
  // 文字
  'mono', 'muted', 'small',
];

const INJECTED = '<!-- bl:inject:start -->(?:(?!<!-- bl:inject:end -->)[\\s\\S])*<!-- bl:inject:end -->';

/**
 * 舊版的官網會在手冊裡加上自己的內容（網站圖示、回到官網的按鈕…），前後用註解標起來。
 * 現在這些都由官網的版面提供；拿舊版的檔案當來源時，先把那兩段連同當時多加的換行拿掉。
 */
export function stripInjected(html) {
  return html
    .replace(new RegExp(`${INJECTED}\\n(?=</(?:head|body)>)`, 'gi'), '')
    .replace(new RegExp(`\\n${INJECTED}\\n$`), '')
    .replace(new RegExp(`\\n?${INJECTED}`, 'g'), '');
}

const uniq = (list) => [...new Set(list)];

/**
 * @param {string} html 冒險手冊的來源 HTML
 * @returns {{
 *   dataTag: string, guidesTag: string, app: string,
 *   meta: { date: string, items: number, monsters: number, bosses: number, zones: number, guides: number },
 *   problems: string[], warnings: string[],
 * }}
 */
export function splitHandbook(html) {
  const problems = [];
  const warnings = [];

  const dataMatch = html.match(/<script id="wiki-data" type="application\/json">([\s\S]*?)<\/script>/);
  const guidesMatch = html.match(/<template id="guides">([\s\S]*?)<\/template>/);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];

  if (!dataMatch) problems.push('找不到資料區塊 <script id="wiki-data" type="application/json">');
  if (!guidesMatch) problems.push('找不到章節內容 <template id="guides">');
  if (scripts.length !== 1) problems.push(`預期有 1 段手冊程式（沒有任何屬性的 <script>），實際找到 ${scripts.length} 段`);

  const app = scripts.length ? scripts.map((s) => s[1]).join('\n') : '';
  const guides = guidesMatch ? guidesMatch[1] : '';

  // 資料：要是合法的 JSON，順便取出主視覺要顯示的數字
  const meta = { date: '', items: 0, monsters: 0, bosses: 0, zones: 0, guides: 0 };
  if (dataMatch) {
    try {
      const data = JSON.parse(dataMatch[1]);
      const npcs = Object.values(data.npcs || {});
      meta.date = (data.meta && data.meta.date) || '';
      meta.items = Object.keys(data.items || {}).length;
      meta.monsters = npcs.filter((n) => n.c === 'm' && n.lv > 0 && n.z).length;
      meta.bosses = npcs.filter((n) => n.c !== 'm' && n.lv > 0).length;
      meta.zones = (data.zones || []).length;
    } catch (e) {
      problems.push(`資料區塊不是合法的 JSON：${String(e.message).slice(0, 120)}`);
    }
  }
  meta.guides = (guides.match(/<section class="sec"/g) || []).length;
  if (guidesMatch && !meta.guides) problems.push('章節內容裡沒有任何 <section class="sec">');

  // 程式會用 id 找元素：出現官網頁面沒有提供的 id，頁面會直接壞掉
  const wanted = uniq([...app.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]));
  const missing = wanted.filter((id) => !STATIC_IDS.includes(id) && !DYNAMIC_IDS.includes(id) && !app.includes(`id="${id}"`));
  if (missing.length) problems.push(`手冊的程式會找這些元素，但官網的冒險手冊頁面沒有：${missing.map((id) => '#' + id).join('、')}`);

  // 來源檔自己的固定版面（頁首、搜尋列、章節欄）：官網沒有照搬，多了新的元素要提醒
  const afterStyle = html.lastIndexOf('</style>');
  const beforeData = dataMatch ? html.indexOf(dataMatch[0]) : -1;
  if (afterStyle > -1 && beforeData > afterStyle) {
    const shell = html.slice(afterStyle, beforeData);
    const extraIds = uniq([...shell.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])).filter((id) => !STATIC_IDS.includes(id));
    if (extraIds.length) warnings.push(`來源檔的固定版面多了這些元素（官網的頁面沒有）：${extraIds.map((id) => '#' + id).join('、')}`);
  }

  // 樣式類別：來源檔的樣式表、章節內容、程式畫出來的 HTML 裡用到的類別
  const fromCss = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)]
    .flatMap((m) => [...m[1].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.(-?[A-Za-z_][\w-]*)(?=[^{}]*\{)/g)])
    .map((m) => m[1]);
  const fromMarkup = [...(guides + app).matchAll(/class="([^"]*)"/g)]
    .flatMap((m) => m[1].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/))
    .filter((c) => /^-?[A-Za-z_][\w-]*$/.test(c));
  const unknown = uniq([...fromCss, ...fromMarkup]).filter((c) => !KNOWN_CLASSES.includes(c) && !c.startsWith('bl-'));
  if (unknown.length) warnings.push(`來源檔用到官網的手冊樣式還沒處理的類別：${unknown.map((c) => '.' + c).join('、')}（要補在 src/styles/handbook.css）`);

  return {
    dataTag: dataMatch ? dataMatch[0] : '',
    guidesTag: guidesMatch ? guidesMatch[0] : '',
    app,
    meta,
    problems,
    warnings,
  };
}
