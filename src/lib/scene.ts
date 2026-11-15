/**
 * 主視覺場景產生器（建置時執行，輸出靜態 SVG 片段；固定亂數種子，每次建置結果相同）
 * - range()：有受光面的山脈
 * - treeline()：前景的針葉林稜線
 * - starfield()：星空
 * - streak()：橫過月亮的雲帶
 * - citadel()：岩峰上的哥德式城堡（後、中、前三個景深層次＋石橋）
 *
 * 光源設定在左上方（血月），所以每個量體的左緣有一道受光邊，往右漸暗。
 */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------
   山脈
   ------------------------------------------------------------ */
export interface RangeShape {
  /** 山體輪廓 */
  body: string;
  /** 朝向月光的受光面 */
  lit: string;
}

/**
 * @param w 寬度 @param h 高度
 * @param o.peaks 山峰數量 @param o.low／o.high 山峰高度佔 h 的比例範圍 @param o.rough 稜線粗糙程度
 */
export function range(seed: number, w: number, h: number, o: { peaks: number; low: number; high: number; rough?: number }): RangeShape {
  const rand = rng(seed);
  const rough = o.rough ?? 1;
  const step = w / o.peaks;
  const key: { x: number; y: number; peak: boolean }[] = [];
  let x = -step * 0.5;
  let valleyY = h * (0.7 + rand() * 0.18);
  key.push({ x, y: valleyY, peak: false });
  for (let i = 0; i <= o.peaks; i++) {
    const px = x + step * (0.38 + rand() * 0.24);
    const py = Math.max(3, Math.min(h * (1 - (o.low + rand() * (o.high - o.low))), valleyY - h * 0.1));
    key.push({ x: px, y: py, peak: true });
    x += step;
    valleyY = Math.min(h * 0.93, py + (h - py) * (0.36 + rand() * 0.38));
    key.push({ x: x + (rand() - 0.5) * step * 0.16, y: valleyY, peak: false });
  }

  // 每一段再細分成鋸齒
  const SEG = 6;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < key.length - 1; i++) {
    const a = key[i];
    const b = key[i + 1];
    for (let k = 0; k < SEG; k++) {
      const t = k / SEG;
      const j = k === 0 ? 0 : 1;
      pts.push({
        x: a.x + (b.x - a.x) * t + j * (rand() - 0.5) * (b.x - a.x) * 0.1,
        y: Math.max(2, a.y + (b.y - a.y) * t + j * (rand() - 0.5) * Math.abs(b.y - a.y) * 0.3 * rough),
      });
    }
  }
  pts.push(key[key.length - 1]);
  // 山脈圖層很寬（2400），座標取整數就夠了
  const ri = Math.round;
  const body = `M${ri(pts[0].x)} ${h + 4}` + pts.map((p) => `L${ri(p.x)} ${ri(p.y)}`).join('') + `L${ri(pts[pts.length - 1].x)} ${h + 4}Z`;

  // 受光面：山谷 → 山峰的左坡，沿著一條往左下折的山脊線收回來
  let lit = '';
  for (let i = 0; i < key.length - 1; i++) {
    const a = key[i];
    const b = key[i + 1];
    if (a.peak || !b.peak) continue;
    const seg = pts.slice(i * SEG, (i + 1) * SEG).concat([b]);
    let d = `M${ri(seg[0].x)} ${ri(seg[0].y)}` + seg.slice(1).map((p) => `L${ri(p.x)} ${ri(p.y)}`).join('');
    const N = 5;
    for (let k = 1; k <= N; k++) {
      const t = k / N;
      const rx = b.x - (b.x - a.x) * 0.24 * t + (k % 2 ? -1 : 1) * (2 + rand() * 5);
      d += `L${ri(rx)} ${ri(b.y + (h - b.y) * t)}`;
    }
    lit += d + `L${ri(a.x)} ${h}Z`;
  }
  return { body, lit };
}

/* ------------------------------------------------------------
   針葉林
   ------------------------------------------------------------ */
function pine(x: number, base: number, th: number, spread: number, rand: () => number): string {
  const tiers = th > 34 ? 5 : th > 20 ? 4 : 3;
  const side: [number, number][] = [];
  for (let k = 1; k <= tiers; k++) {
    const t = k / tiers;
    const y = base - th + th * t * 0.94;
    const hw = th * spread * (0.22 + 0.78 * t) * (0.88 + rand() * 0.24);
    side.push([hw, y]); // 枝尖
    if (k < tiers) side.push([hw * 0.4, y - (th / tiers) * 0.16]); // 往內收，枝條微微下垂
  }
  const last = side[side.length - 1][1];
  const trunk = th * 0.035 + 0.6;
  const pts: [number, number][] = [[x, base - th]];
  for (const [dx, y] of side) pts.push([x + dx, y]);
  pts.push([x + trunk, last], [x + trunk, base], [x - trunk, base], [x - trunk, last]);
  for (let i = side.length - 1; i >= 0; i--) pts.push([x - side[i][0], side[i][1]]);
  // 用相對座標輸出，路徑字串比較短
  let px = r1(pts[0][0]);
  let py = r1(pts[0][1]);
  let d = `M${px} ${py}`;
  for (let i = 1; i < pts.length; i++) {
    const nx = r1(pts[i][0]);
    const ny = r1(pts[i][1]);
    d += `l${r1(nx - px)} ${r1(ny - py)}`;
    px = nx;
    py = ny;
  }
  return d + 'z';
}

/** 起伏的地面加上一整排針葉樹（單一路徑） */
export function treeline(seed: number, w: number, h: number, o: { count: number; minH: number; maxH: number; ground: number }): string {
  const rand = rng(seed);
  const gy = (x: number) => h - o.ground - Math.sin(x / 190 + 1.3) * o.ground * 0.28 - Math.sin(x / 67) * o.ground * 0.12;
  let d = `M0 ${h + 2}`;
  for (let x = 0; x <= w; x += 24) d += `L${x} ${r1(gy(x))}`;
  d += `L${w} ${h + 2}Z`;
  for (let i = 0; i < o.count; i++) {
    const x = rand() * w;
    const th = o.minH + rand() ** 1.7 * (o.maxH - o.minH);
    d += pine(x, gy(x) + 3, th, 0.25 + rand() * 0.08, rand);
  }
  return d;
}

/* ------------------------------------------------------------
   星空
   ------------------------------------------------------------ */
export interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  /** 0＝不閃爍，1～3＝閃爍節奏 */
  tw: number;
}

export function starfield(seed: number, count: number, w: number, h: number): Star[] {
  const rand = rng(seed);
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    const y = h * rand() ** 1.7;
    const big = rand() < 0.07;
    out.push({
      x: r1(rand() * w),
      y: r1(y),
      r: r1(big ? 1.1 + rand() * 0.6 : 0.4 + rand() * 0.55),
      o: Math.round((0.28 + rand() * 0.62) * (1 - (y / h) * 0.55) * 100) / 100,
      tw: rand() < 0.2 ? 1 + Math.floor(rand() * 3) : 0,
    });
  }
  return out;
}

/* ------------------------------------------------------------
   雲帶
   ------------------------------------------------------------ */
/** 通過各點中點的平滑封閉曲線 */
function blob(points: [number, number][]): string {
  const n = points.length;
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m = mid(points[n - 1], points[0]);
  let d = `M${r1(m[0])} ${r1(m[1])}`;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const q = mid(p, points[(i + 1) % n]);
    d += `Q${r1(p[0])} ${r1(p[1])} ${r1(q[0])} ${r1(q[1])}`;
  }
  return d + 'Z';
}

/** 兩端收尖的長條雲：上緣起伏、下緣平緩 */
export function streak(seed: number, x: number, y: number, len: number, thick: number): string {
  const rand = rng(seed);
  const N = Math.max(6, Math.round(len / 34));
  const top: [number, number][] = [];
  const bot: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const env = Math.sin(Math.PI * t) ** 0.6;
    const px = x + len * t;
    top.push([px + (rand() - 0.5) * 8, y - thick * env * (0.45 + rand() * 0.75)]);
    bot.push([px + (rand() - 0.5) * 8, y + thick * env * (0.22 + rand() * 0.3)]);
  }
  return blob([...top, ...bot.reverse()]);
}

/* ------------------------------------------------------------
   城堡
   ------------------------------------------------------------ */
export interface Citadel {
  w: number;
  h: number;
  defs: string;
  body: string;
  /** 亮著的窗（座標以 w × h 為準），供閃爍光暈定位 */
  lights: { x: number; y: number; s: number }[];
}

interface TowerOpt {
  /** 圓錐屋頂高度（不給就是平頂） */
  roof?: number;
  crenel?: boolean;
  flag?: boolean;
  /** 塔頂外挑寬度 */
  over?: number;
  /** 女兒牆高度 */
  cap?: number;
  /** 窗：[相對 x, y, 寬, 高, 是否亮燈] */
  wins?: [number, number, number, number, boolean?][];
  /** 箭孔：[相對 x, y] */
  slits?: [number, number][];
  courses?: boolean;
}

/**
 * 岩峰上的哥德式城堡。座標系 720 × 600，城堡中軸在 x = 420，血月中心預設在 (330, 215)。
 * 圖層由後往前：岩峰 → 後排高塔與中央尖塔 → 大教堂 → 民居 → 石橋 → 城牆與稜堡 → 霧
 */
export function citadel(): Citadel {
  const W = 720;
  const H = 600;
  const rand = rng(86);
  const out: string[] = [];
  const lights: Citadel['lights'] = [];
  const RIM = '#ff9d90';
  let P: 'a' | 'b' | 'c' = 'c';

  /* ---------- 基本繪圖 ---------- */
  const path = (d: string, fill: string, extra = '') => out.push(`<path d="${d}" fill="${fill}"${extra}/>`);
  const line = (d: string, color: string, o = 1, w = 1) =>
    out.push(`<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const rim = (d: string, o = 0.5, w = 1) => line(d, RIM, o, w);
  const rimO = () => (P === 'a' ? 0.58 : P === 'b' ? 0.46 : 0.36);
  const rect = (x: number, y: number, w: number, h: number) => `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}Z`;
  /** 尖拱窗（哥德式）：(x, y) 是外框左上角 */
  const lancet = (x: number, y: number, w: number, h: number) => {
    const rise = w * 0.86;
    return `M${r1(x)} ${r1(y + h)}V${r1(y + rise)}A${r1(w)} ${r1(w)} 0 0 1 ${r1(x + w / 2)} ${r1(y)}A${r1(w)} ${r1(w)} 0 0 1 ${r1(x + w)} ${r1(y + rise)}V${r1(y + h)}Z`;
  };
  const win = (x: number, y: number, w: number, h: number, lit = true) => {
    const d = lancet(x, y, w, h);
    if (!lit) {
      path(d, '#040203', ' opacity=".72"');
      return;
    }
    path(d, '#ff7f32', ' opacity=".78" filter="url(#c-f-win)"');
    path(d, 'url(#c-g-win)');
    lights.push({ x: x + w / 2, y: y + h / 2, s: Math.max(w, h) });
  };
  /** 城垛：回傳垛口的路徑，以及每個垛頂的受光線 */
  const merlons = (x: number, y: number, w: number, mw = 5, gap = 4, mh = 6) => {
    const cnt = Math.max(2, Math.floor((w + gap) / (mw + gap)));
    const total = cnt * mw + (cnt - 1) * gap;
    let mx = x + (w - total) / 2;
    let d = '';
    let tops = '';
    for (let i = 0; i < cnt; i++) {
      d += rect(mx, y - mh, mw, mh + 0.5);
      tops += `M${r1(mx + 0.4)} ${r1(y - mh + 0.4)}h${r1(mw - 0.8)}`;
      mx += mw + gap;
    }
    return { d, tops };
  };
  /** 飄向右邊的燕尾旗 */
  const flag = (x: number, y: number, s = 1) => {
    const top = `M${r1(x)} ${r1(y)}c${r1(4 * s)} ${r1(-2 * s)} ${r1(8 * s)} ${r1(2 * s)} ${r1(13 * s)} ${r1(-0.5 * s)}l${r1(-2 * s)} ${r1(3.5 * s)}`;
    path(`${top}l${r1(2.5 * s)} ${r1(3.5 * s)}c${r1(-5 * s)} ${r1(2.2 * s)} ${r1(-9 * s)} ${r1(-1.6 * s)} ${r1(-13.5 * s)} ${r1(0.5 * s)}Z`, '#cf3046');
    path(`${top}c${r1(-4 * s)} ${r1(1.4 * s)} ${r1(-7.4 * s)} ${r1(-1.4 * s)} ${r1(-11 * s)} ${r1(0.2 * s)}Z`, '#ff7482', ' opacity=".6"');
  };
  /** 垂掛的長幡 */
  const banner = (x: number, y: number, w: number, h: number) => {
    path(`M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}l${r1(-w / 2)} ${-4}l${r1(-w / 2)} 4Z`, 'url(#c-g-banner)');
    path(`M${r1(x + w / 2)} ${r1(y + h * 0.26)}l${r1(w * 0.26)} ${r1(w * 0.36)}l${r1(-w * 0.26)} ${r1(w * 0.36)}l${r1(-w * 0.26)} ${r1(-w * 0.36)}Z`, '#f3d27e', ' opacity=".9"');
    line(`M${r1(x - 1.2)} ${r1(y)}h${r1(w + 2.4)}`, '#070304', 1, 1.5);
  };

  /* ---------- 建築元件 ---------- */
  /** 圓塔：塔身＋外挑的女兒牆（可加城垛或圓錐頂） */
  const tower = (x: number, w: number, top: number, base: number, o: TowerOpt = {}) => {
    const ov = o.over ?? 3;
    const cap = o.cap ?? 9;
    const pt = top - cap;
    let d = rect(x, top, w, base - top) + rect(x - ov, pt, w + ov * 2, cap + 3);
    const m = o.crenel ? merlons(x - ov, pt, w + ov * 2) : null;
    if (m) d += m.d;
    path(d, `url(#c-g-r${P})`);
    if (m) rim(m.tops, 0.24, 0.8);
    // 女兒牆下方的托架陰影
    const cn = Math.max(3, Math.round((w + ov * 2) / 5.5));
    const cs = (w + ov * 2) / cn;
    let cd = '';
    for (let i = 0; i < cn; i++) {
      const cx = x - ov + i * cs;
      cd += `M${r1(cx + 0.7)} ${r1(top + 3)}a${r1(cs / 2 - 0.7)} ${r1(cs / 2 - 0.7)} 0 0 0 ${r1(cs - 1.4)} 0Z`;
    }
    path(cd, '#030102', ' opacity=".6"');
    // 石砌橫紋
    if (o.courses !== false && base - top > 60) {
      let c = '';
      for (let yy = top + 16; yy < base - 8; yy += 13 + rand() * 6) {
        c += `M${r1(x + 2 + rand() * w * 0.3)} ${r1(yy)}h${r1(w * (0.2 + rand() * 0.3))}`;
      }
      line(c, '#000', 0.3, 0.8);
    }
    // 受光邊
    rim(`M${r1(x - ov + 0.5)} ${r1(pt - (o.crenel ? 5 : -0.5))}V${r1(top + 3)}M${r1(x + 0.5)} ${r1(top + 4)}V${r1(base)}`, rimO());
    if (o.roof) {
      const x0 = x - ov - 1.5;
      const x1 = x + w + ov + 1.5;
      const ax = x + w / 2;
      const ay = pt - o.roof;
      path(`M${r1(x0)} ${r1(pt + 0.5)}L${r1(ax)} ${r1(ay)}L${r1(x1)} ${r1(pt + 0.5)}Z`, `url(#c-g-k${P})`);
      if (o.roof > 34) {
        let td = '';
        for (const t of [0.42, 0.72]) {
          const yy = ay + o.roof * t;
          const hw = ((x1 - x0) / 2) * t;
          td += `M${r1(ax - hw)} ${r1(yy)}Q${r1(ax)} ${r1(yy + 3.2 * t + 1)} ${r1(ax + hw)} ${r1(yy)}`;
        }
        line(td, '#000', 0.32, 0.9);
      }
      rim(`M${r1(x0 + 0.8)} ${r1(pt)}L${r1(ax)} ${r1(ay)}`, rimO() + 0.06);
      line(`M${r1(x0)} ${r1(pt + 0.6)}H${r1(x1)}`, '#020101', 0.7, 1.6);
      const fin = Math.min(12, 5 + o.roof * 0.12);
      line(`M${r1(ax)} ${r1(ay + 1)}v${r1(-fin)}`, '#0a0405', 1, 1.2);
      out.push(`<circle cx="${r1(ax)}" cy="${r1(ay - fin)}" r="1.1" fill="${RIM}" opacity=".75"/>`);
      if (o.flag) flag(ax, ay - fin + 1.5);
    }
    for (const [dx, y, ww, hh, lit] of o.wins ?? []) win(x + dx, y, ww, hh, lit !== false);
    for (const [dx, y] of o.slits ?? []) path(rect(x + dx, y, 1.6, 8), '#030102', ' opacity=".8"');
  };

  /** 方形量體（平面受光） */
  const block = (x: number, w: number, top: number, base: number, o: { crenel?: boolean; wins?: TowerOpt['wins'] } = {}) => {
    let d = rect(x, top, w, base - top);
    const m = o.crenel ? merlons(x, top, w, 5.5, 4.5, 6.5) : null;
    if (m) d += m.d;
    path(d, `url(#c-g-f${P})`);
    if (m) rim(m.tops, 0.22, 0.8);
    rim(`M${r1(x + 0.5)} ${r1(top - (o.crenel ? 6 : 0))}V${r1(base)}`, rimO() - 0.06);
    for (const [dx, y, ww, hh, lit] of o.wins ?? []) win(x + dx, y, ww, hh, lit !== false);
  };

  /** 細長尖塔，可加天窗與十字 */
  const spire = (cx: number, baseY: number, halfW: number, height: number, o: { lucarnes?: number[]; cross?: boolean } = {}) => {
    path(`M${r1(cx - halfW)} ${r1(baseY)}L${r1(cx)} ${r1(baseY - height)}L${r1(cx + halfW)} ${r1(baseY)}Z`, `url(#c-g-k${P})`);
    rim(`M${r1(cx - halfW + 0.7)} ${r1(baseY - 0.5)}L${r1(cx)} ${r1(baseY - height)}`, rimO() + 0.08);
    for (const t of o.lucarnes ?? []) {
      const yy = baseY - height * t;
      const lw = Math.max(2.6, halfW * (1 - t) * 0.5);
      path(`M${r1(cx - lw)} ${r1(yy)}L${r1(cx)} ${r1(yy - lw * 2)}L${r1(cx + lw)} ${r1(yy)}Z`, P === 'c' ? '#1c0b11' : '#0d0507');
      win(cx - lw * 0.34, yy - lw * 1.15, lw * 0.68, lw * 1.05);
    }
    if (o.cross) line(`M${r1(cx)} ${r1(baseY - height + 1)}v-13M${r1(cx - 3.4)} ${r1(baseY - height - 8)}h6.8`, '#0c0506', 1, 1.4);
  };

  /** 小尖塔（扶壁頂、塔角） */
  const pinnacle = (cx: number, baseY: number, s = 1) => {
    path(
      rect(cx - 2 * s, baseY - 9 * s, 4 * s, 9 * s) + `M${r1(cx - 3 * s)} ${r1(baseY - 9 * s)}L${r1(cx)} ${r1(baseY - 24 * s)}L${r1(cx + 3 * s)} ${r1(baseY - 9 * s)}Z`,
      `url(#c-g-k${P})`,
    );
    rim(`M${r1(cx - 2.6 * s)} ${r1(baseY - 9.4 * s)}L${r1(cx)} ${r1(baseY - 24 * s)}`, rimO() - 0.05, 0.8);
  };

  /** 城牆內的民居：陡屋頂、閣樓小窗、煙囪 */
  const house = (x: number, w: number, eave: number, base: number, roofH: number, o: { win?: boolean; chimney?: boolean } = {}) => {
    path(rect(x, eave, w, base - eave), `url(#c-g-f${P})`);
    if (o.chimney) path(rect(x + w * 0.68, eave - roofH * 0.82, 3.4, roofH * 0.6), '#0b0506');
    path(`M${r1(x - 2)} ${r1(eave + 0.5)}L${r1(x + w / 2)} ${r1(eave - roofH)}L${r1(x + w + 2)} ${r1(eave + 0.5)}Z`, `url(#c-g-k${P})`);
    rim(`M${r1(x - 1.3)} ${r1(eave)}L${r1(x + w / 2)} ${r1(eave - roofH)}`, 0.46, 0.9);
    if (o.win) {
      const wx = x + w / 2 - 1.7;
      const wy = eave - roofH * 0.5;
      path(rect(wx, wy, 3.4, 4.2), '#ff7f32', ' opacity=".7" filter="url(#c-f-win)"');
      path(rect(wx, wy, 3.4, 4.2), 'url(#c-g-win)');
    }
  };

  /** 玫瑰窗 */
  const rose = (cx: number, cy: number, r: number) => {
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r1(r + 2.4)}" fill="#090405"/>`);
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ff7f32" opacity=".85" filter="url(#c-f-rose)"/>`);
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#c-g-rose)"/>`);
    let d = '';
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      d += `M${r1(cx + Math.cos(a) * r * 0.32)} ${r1(cy + Math.sin(a) * r * 0.32)}L${r1(cx + Math.cos(a) * r)} ${r1(cy + Math.sin(a) * r)}`;
    }
    line(d, '#12070a', 0.9, 1.1);
    out.push(
      `<circle cx="${cx}" cy="${cy}" r="${r1(r * 0.32)}" fill="none" stroke="#12070a" stroke-width="1.1"/>` +
        `<circle cx="${cx}" cy="${cy}" r="${r1(r * 0.67)}" fill="none" stroke="#12070a" stroke-opacity=".7" stroke-width=".8"/>`,
    );
    lights.push({ x: cx, y: cy, s: r * 2 });
  };

  /**
   * 岩壁：一根根寬窄不一的岩柱。分界線是不規則的折線（相鄰岩柱共用），
   * 每根岩柱左緣受光、往右漸暗，再加上零星的斜向裂縫。
   */
  const cliff = (x0: number, x1: number, topAt: (x: number) => number, leanTo: number) => {
    const xs: number[] = [x0];
    while (xs[xs.length - 1] < x1 - 12) xs.push(Math.min(x1, xs[xs.length - 1] + 11 + rand() ** 1.4 * 30));
    xs[xs.length - 1] = x1;
    const Y0 = 430;
    const LV = 24;
    const levels = Math.ceil((H + 40 - Y0) / LV) + 1;
    const jit = xs.map(() => Array.from({ length: levels }, () => (rand() - 0.5) * 8));
    /** 第 k 條分界線在高度 y 的 x 位置 */
    const edgeX = (k: number, y: number) => {
      const lean = (leanTo - xs[k]) * 0.085 * Math.max(0, (y - 440) / (H - 440));
      const f = Math.max(0, (y - Y0) / LV);
      const j0 = Math.min(levels - 1, Math.floor(f));
      const j1 = Math.min(levels - 1, j0 + 1);
      return xs[k] + lean + jit[k][j0] + (jit[k][j1] - jit[k][j0]) * (f - j0);
    };
    const below = (y: number) => {
      const ys: number[] = [];
      for (let yy = Math.ceil((y + 5 - Y0) / LV) * LV + Y0; yy <= H + 34; yy += LV) ys.push(yy);
      return ys;
    };
    for (let k = 0; k < xs.length - 1; k++) {
      const tl = topAt(xs[k]) + rand() * 9 - 3;
      const tr = topAt(xs[k + 1]) + rand() * 9 - 3;
      const yl = below(tl);
      let d = `M${r1(edgeX(k, tl))} ${r1(tl)}L${r1(edgeX(k + 1, tr))} ${r1(tr)}`;
      for (const y of below(tr)) d += `L${r1(edgeX(k + 1, y))} ${y}`;
      for (let i = yl.length - 1; i >= 0; i--) d += `L${r1(edgeX(k, yl[i]))} ${yl[i]}`;
      path(d + 'Z', 'url(#c-g-rock)');
      // 左緣受光：沿著折線往下淡出
      let rd = `M${r1(edgeX(k, tl) + 0.5)} ${r1(tl + 1)}`;
      for (const y of yl.slice(0, 3)) rd += `L${r1(edgeX(k, y) + 0.5)} ${y}`;
      rim(rd, 0.14 + rand() * 0.2, 0.9);
      // 斜向裂縫
      const w = xs[k + 1] - xs[k];
      let yy = tl + 18 + rand() * 40;
      while (yy < H - 20) {
        const xa = edgeX(k, yy) + 1 + rand() * w * 0.2;
        const len = w * (0.3 + rand() * 0.5);
        const slope = (rand() - 0.5) * 6;
        line(`M${r1(xa)} ${r1(yy)}l${r1(len)} ${r1(slope)}`, '#000', 0.3 + rand() * 0.25, 1);
        if (rand() < 0.6) line(`M${r1(xa)} ${r1(yy + 1.4)}l${r1(len * 0.7)} ${r1(slope * 0.7)}`, RIM, 0.07 + rand() * 0.1, 0.8);
        yy += 34 + rand() * 60;
      }
    }
  };
  const tree = (x: number, base: number, th: number) => path(pine(x, base, th, 0.27, rand), '#080405');

  /* ══════════ 1. 岩峰 ══════════ */
  const cragTop = (x: number) => 446 + (x < 244 ? (244 - x) * 0.5 : x > 606 ? (x - 606) * 0.9 : 0);
  cliff(188, 628, cragTop, 410);
  for (const [tx, th] of [[193, 15], [201, 21], [210, 14], [616, 17], [624, 12]] as const) tree(tx, cragTop(tx) + 6, th);

  /* 右側的孤岩與瞭望塔 */
  const rockTop = (x: number) => 478 + Math.abs(x - 668) * 0.38;
  cliff(644, 702, rockTop, 668);
  P = 'b';
  tower(658, 19, 418, 484, { roof: 34, over: 2.5, cap: 7, wins: [[7, 434, 5, 9]], courses: false });
  // 連到主岩峰的小拱橋
  path('M616 450L660 472v5L616 455Z', '#100608');
  path('M624 457L652 471Q636 478 624 470Z', '#100608');
  rim('M616 450L660 472', 0.34, 0.9);
  tree(694, rockTop(694) + 5, 13);

  /* ══════════ 2. 後排：高塔與中央尖塔 ══════════ */
  P = 'c';
  tower(574, 14, 300, 446, { roof: 36, over: 2, cap: 6, wins: [[4.5, 314, 5, 9, false]], courses: false });
  tower(294, 26, 250, 446, { roof: 66, flag: true, wins: [[9.5, 270, 7, 13], [9.5, 322, 7, 12, false]], slits: [[6, 300], [17, 350]] });
  tower(520, 28, 262, 446, { roof: 57, wins: [[10.5, 282, 7, 13], [10.5, 334, 7, 12]], slits: [[8, 312]] });
  // 十字交叉處的燈籠塔與尖塔
  block(405, 30, 214, 256, { wins: [[5, 222, 5.5, 15], [19.5, 222, 5.5, 15]] });
  path(rect(402, 210, 36, 5), 'url(#c-g-fc)');
  pinnacle(405, 212, 0.9);
  pinnacle(435, 212, 0.9);
  spire(420, 210, 14, 176, { lucarnes: [0.2, 0.46], cross: true });

  // 後排與大教堂之間的薄霧
  out.push('<ellipse cx="420" cy="356" rx="180" ry="36" fill="url(#c-g-mist)" opacity=".45"/>');

  /* ══════════ 3. 中景：大教堂 ══════════ */
  P = 'b';
  // 扶壁柱與飛扶壁
  for (const [bx, dir] of [[322, 1], [509, -1]] as const) {
    block(bx, 9, 342, 452);
    pinnacle(bx + 4.5, 342, 0.95);
    const px = bx + 4.5;
    const tx = dir === 1 ? 342 : 498;
    line(`M${px} 356Q${px + dir * 3} 318 ${tx} 306M${px} 388Q${px + dir * 5} 352 ${tx} 342`, '#1b0b10', 1, 3.2);
    if (dir === 1) rim(`M${px - 1} 355Q${px + 2} 317 ${tx} 304.6M${px - 1} 387Q${px + 4} 351 ${tx} 340.6`, 0.34, 0.8);
  }
  // 西面雙塔
  for (const tx of [342, 468]) {
    block(tx, 30, 256, 452, { wins: [[5, 268, 6.5, 27, false], [18.5, 268, 6.5, 27, false], [11, 322, 8, 15, tx === 342]] });
    path(rect(tx - 2.5, 250, 35, 7), 'url(#c-g-fb)');
    line(`M${tx + 1} 308h28M${tx + 1} 352h28`, '#000', 0.34, 1);
    pinnacle(tx + 0.5, 252, 0.85);
    pinnacle(tx + 29.5, 252, 0.85);
    spire(tx + 15, 250, 13, 96, { lucarnes: [0.2] });
  }
  // 中殿山牆
  path('M372 452V302L420 246L468 302V452Z', 'url(#c-g-fb)');
  rim('M372.6 301.4L420 246.6', 0.5, 1.1);
  line('M420 246.6L467.4 301.4', '#030102', 0.7, 1.4);
  line('M374 318h92', '#000', 0.3, 1);
  rose(420, 296, 17);
  out.push('<circle cx="420" cy="266" r="3" fill="#ff7f32" opacity=".7" filter="url(#c-f-win)"/><circle cx="420" cy="266" r="3" fill="url(#c-g-win)"/>');
  win(395.5, 336, 8.5, 40);
  win(415.7, 329, 8.5, 47);
  win(436, 336, 8.5, 40);

  // 大教堂與前景城牆之間的霧
  out.push('<ellipse cx="420" cy="410" rx="214" ry="30" fill="url(#c-g-mist)" opacity=".5"/>');

  /* ══════════ 4. 城牆內的民居 ══════════ */
  house(292, 26, 388, 452, 20, { win: true, chimney: true });
  house(372, 22, 393, 452, 13);
  house(404, 26, 391, 452, 15, { win: true });
  house(498, 28, 389, 452, 19, { win: true, chimney: true });
  house(530, 20, 394, 452, 12);

  /* ══════════ 5. 石橋 ══════════ */
  P = 'a';
  out.push('<g mask="url(#c-m-bridge)">');
  const deckY = (x: number) => 458 + (236 - x) * 0.055;
  const piers = [204, 146, 88, 30, -28];
  for (const px of piers) path(rect(px - 6, deckY(px) + 8, 12, H + 30 - deckY(px)), 'url(#c-g-pier)');
  // 橋拱之間的拱肩
  const spans: [number, number][] = [[210, 240], ...piers.slice(0, -1).map((px, i) => [piers[i + 1] + 6, px - 6] as [number, number])];
  for (const [xa, xb] of spans) {
    const r = (xb - xa) / 2;
    const sy = deckY((xa + xb) / 2) + 11 + r;
    path(`M${xa} ${r1(deckY(xa) + 8)}L${xb} ${r1(deckY(xb) + 8)}V${r1(sy)}A${r1(r)} ${r1(r)} 0 0 0 ${xa} ${r1(sy)}Z`, '#0f0608');
  }
  // 橋面與護欄
  path(`M-44 ${r1(deckY(-44))}L240 ${r1(deckY(240))}v9L-44 ${r1(deckY(-44) + 9)}Z`, '#150a0c');
  let posts = '';
  for (let x = 228; x > -40; x -= 9) posts += rect(x, deckY(x) - 2.4, 3.2, 3);
  path(posts, '#150a0c');
  rim(`M-44 ${r1(deckY(-44) - 0.4)}L236 ${r1(deckY(236) - 0.4)}`, 0.42, 0.9);
  // 橋墩上的燈
  for (const px of piers.slice(0, 4)) {
    const y = deckY(px);
    line(`M${px} ${r1(y - 2)}v-7`, '#0a0405', 1, 1.3);
    out.push(`<circle cx="${px}" cy="${r1(y - 10)}" r="8" fill="url(#c-g-lamp)"/><circle cx="${px}" cy="${r1(y - 10)}" r="1.7" fill="#ffe1ad"/>`);
  }
  out.push('</g>');

  /* ══════════ 6. 前景：城牆與稜堡 ══════════ */
  // 城牆
  block(250, 344, 400, 458, { crenel: true });
  let courses = '';
  for (let yy = 412; yy < 452; yy += 9) for (let xx = 292 + rand() * 20; xx < 552; xx += 34 + rand() * 40) courses += `M${r1(xx)} ${yy}h${r1(8 + rand() * 12)}`;
  line(courses, '#000', 0.4, 0.8);
  // 扶壁柱：打破牆面的平板感，每一根左緣都吃到月光
  for (const bx of [298, 358, 402, 432, 500, 528]) {
    path(rect(bx, 407, 6, 51) + `M${bx} 407l3 -4l3 4Z`, 'url(#c-g-fa)');
    rim(`M${bx + 0.5} 407.5V458`, 0.4, 0.9);
  }
  for (const sx of [306, 376, 416, 514, 542]) path(rect(sx, 422, 1.7, 9), '#030102', ' opacity=".85"');
  for (const lx of [388, 452]) out.push(`<circle cx="${lx}" cy="417" r="9" fill="url(#c-g-lamp)"/><circle cx="${lx}" cy="417" r="1.6" fill="#ffe1ad"/>`);
  // 牆上的小塔
  block(328, 22, 384, 458, { crenel: true, wins: [[8.5, 396, 5, 10]] });
  tower(470, 19, 378, 458, { roof: 28, over: 2.5, cap: 7, wins: [[7, 390, 5, 9]], courses: false });
  // 左稜堡（城門塔）
  tower(236, 50, 356, 476, { roof: 64, flag: true, over: 4, cap: 10, wins: [[9, 376, 8.5, 16], [32.5, 376, 8.5, 16], [21, 410, 8, 13, false]] });
  banner(256.5, 398, 9, 24);
  const gate = lancet(241, 432, 17, 27);
  path(gate, '#ff8a3c', ' opacity=".6" filter="url(#c-f-rose)"');
  path(gate, 'url(#c-g-gate)');
  line('M245.3 440V459M249.5 435V459M253.7 440V459M241.6 446h15.8M241.6 452.5h15.8', '#1a0a0c', 0.8, 0.9);
  out.push('<ellipse cx="222" cy="459" rx="26" ry="4.5" fill="url(#c-g-lamp)" opacity=".9"/>');
  // 右稜堡與角塔
  tower(556, 48, 370, 462, { crenel: true, over: 4, cap: 10, wins: [[9, 388, 8, 14], [31, 388, 8, 14, false], [20, 420, 7, 12]] });
  tower(586, 15, 340, 372, { roof: 32, over: 2, cap: 6, wins: [[5, 349, 4.5, 8]], courses: false, flag: true });

  /* ══════════ 7. 岩峰底部的霧 ══════════ */
  out.push(
    '<ellipse cx="420" cy="616" rx="370" ry="96" fill="url(#c-g-fog)"/>' +
      '<ellipse cx="244" cy="560" rx="210" ry="40" fill="url(#c-g-mist)" opacity=".62"/>' +
      '<ellipse cx="570" cy="574" rx="220" ry="42" fill="url(#c-g-mist)" opacity=".5"/>',
  );

  /* ---------- 漸層與濾鏡 ---------- */
  const lg = (id: string, stops: [number, string, number?][], attr = 'x1="0" y1="0" x2="1" y2="0"') =>
    `<linearGradient id="${id}" ${attr}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('')}</linearGradient>`;
  const rg = (id: string, stops: [number, string, number?][]) =>
    `<radialGradient id="${id}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('')}</radialGradient>`;
  const defs =
    // 圓塔（前／中／後）：左緣受光，往右漸暗
    lg('c-g-ra', [[0, '#5c2029'], [0.1, '#2c1017'], [0.42, '#14080b'], [1, '#080304']]) +
    lg('c-g-rb', [[0, '#6c2934'], [0.12, '#37141c'], [0.46, '#1e0b11'], [1, '#110609']]) +
    lg('c-g-rc', [[0, '#7e3642'], [0.14, '#48202a'], [0.5, '#2f141c'], [1, '#210e15']]) +
    // 平面
    lg('c-g-fa', [[0, '#3c151d'], [0.05, '#190a0e'], [1, '#0b0506']]) +
    lg('c-g-fb', [[0, '#4c1c26'], [0.05, '#240e15'], [1, '#15080b']]) +
    lg('c-g-fc', [[0, '#5e2632'], [0.06, '#34161f'], [1, '#251018']]) +
    // 屋頂：左右兩個斜面
    lg('c-g-ka', [[0, '#6d2631'], [0.08, '#35131b'], [0.5, '#180a0e'], [0.5, '#0b0506'], [1, '#050203']]) +
    lg('c-g-kb', [[0, '#7e303c'], [0.09, '#411821'], [0.5, '#210d13'], [0.5, '#12070a'], [1, '#0a0406']]) +
    lg('c-g-kc', [[0, '#90404d'], [0.1, '#522531'], [0.5, '#31161e'], [0.5, '#1e0d13'], [1, '#160a10']]) +
    lg('c-g-rock', [[0, '#48191f'], [0.16, '#220d12'], [0.6, '#11070a'], [1, '#090405']]) +
    lg('c-g-win', [[0, '#fff3cf'], [0.55, '#ffc070'], [1, '#ff8638']], 'x1="0" y1="0" x2="0" y2="1"') +
    lg('c-g-gate', [[0, '#ffe2a8'], [0.6, '#ffa550'], [1, '#e8642a']], 'x1="0" y1="0" x2="0" y2="1"') +
    lg('c-g-banner', [[0, '#e4435a'], [1, '#8f1629']], 'x1="0" y1="0" x2="0" y2="1"') +
    lg('c-g-pier', [[0, '#150a0c'], [0.5, '#150a0c'], [1, '#150a0c', 0]], 'gradientUnits="userSpaceOnUse" x1="0" y1="450" x2="0" y2="606"') +
    lg('c-g-bfade', [[0, '#000'], [1, '#fff']], 'gradientUnits="userSpaceOnUse" x1="-10" y1="0" x2="120" y2="0"') +
    rg('c-g-rose', [[0, '#fff6dc'], [0.5, '#ffc477'], [1, '#ff7f36']]) +
    rg('c-g-lamp', [[0, '#ffc47a', 0.75], [0.4, '#ff9a48', 0.28], [1, '#ff9a48', 0]]) +
    rg('c-g-mist', [[0, '#c24a62', 0.55], [1, '#c24a62', 0]]) +
    rg('c-g-fog', [[0, '#3a0f1a', 0.96], [0.6, '#3a0f1a', 0.7], [1, '#3a0f1a', 0]]) +
    '<filter id="c-f-win" x="-4" y="-2" width="9" height="5" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="2.3"/></filter>' +
    '<filter id="c-f-rose" x="-1" y="-1" width="3" height="3" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="5"/></filter>' +
    '<mask id="c-m-bridge" maskUnits="userSpaceOnUse" x="-60" y="380" width="330" height="270"><rect x="-60" y="380" width="330" height="270" fill="url(#c-g-bfade)"/></mask>';

  return { w: W, h: H, defs, body: out.join(''), lights };
}
