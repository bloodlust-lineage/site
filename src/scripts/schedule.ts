/**
 * 行事曆：依台灣時間（UTC+8，無日光節約）標出今天、已結束與下一場活動，並即時倒數
 * - [data-week]：完整週曆（每週戰場頁）
 * - [data-week-mini]：首頁的「本週戰場」摘要
 */
import { schedule, weekdays } from '../data/schedule';

const WEEK = 7 * 1440;
const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

interface Occ {
  id: string;
  day: number;
  start: number;
  end: number;
  title: string;
  desc: string;
  startStr: string;
  endStr?: string;
}

const occs: Occ[] = schedule.flatMap((e) =>
  e.days.map((d) => {
    const s = (d - 1) * 1440 + toMin(e.start);
    const len = e.end ? toMin(e.end) - toMin(e.start) : 15;
    return { id: e.id, day: d, start: s, end: s + Math.max(len, 1), title: e.title, desc: e.desc, startStr: e.start, endStr: e.end };
  }),
);

function taipeiNow() {
  const t = new Date(Date.now() + 8 * 3600_000);
  const day = ((t.getUTCDay() + 6) % 7) + 1; // 1＝週一
  const minute = (day - 1) * 1440 + t.getUTCHours() * 60 + t.getUTCMinutes();
  return { day, exact: minute * 60 + t.getUTCSeconds() };
}

const pad = (n: number) => String(n).padStart(2, '0');
const hms = (s: number) => {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return (d > 0 ? `${d} 天 ` : '') + `${pad(h)}:${pad(m)}:${pad(s % 60)}`;
};

/** 進行中的活動優先，沒有的話找最近的下一場 */
function pick(nowSec: number, pool: Occ[]) {
  const live = pool.find((o) => o.start * 60 <= nowSec && nowSec < o.end * 60);
  if (live) return { target: live, live: true, delta: Math.max(0, live.end * 60 - nowSec) };
  let best = Infinity;
  let next = pool[0];
  for (const o of pool) {
    let d = o.start * 60 - nowSec;
    if (d <= 0) d += WEEK * 60;
    if (d < best) {
      best = d;
      next = o;
    }
  }
  return { target: next, live: false, delta: best };
}

function dayLabel(target: Occ, nowDay: number, live: boolean, delta: number) {
  if (live) return '今天';
  const diff = (target.day - nowDay + 7) % 7;
  if (diff === 0 && delta < 86400) return '今天';
  if (diff === 1) return '明天';
  return weekdays[target.day - 1];
}

const whenText = (o: Occ, label: string) => `${label} ${o.startStr}${o.endStr ? `～${o.endStr}` : ''}`;

/** 每秒更新；分頁切到背景時暫停 */
function every(fn: () => void) {
  fn();
  let timer = window.setInterval(fn, 1000);
  document.addEventListener('visibilitychange', () => {
    window.clearInterval(timer);
    if (!document.hidden) {
      fn();
      timer = window.setInterval(fn, 1000);
    }
  });
}

/* ---------------- 完整週曆 ---------------- */
document.querySelectorAll<HTMLElement>('[data-week]').forEach((root) => {
  const title = root.querySelector<HTMLElement>('[data-next-title]');
  const when = root.querySelector<HTMLElement>('[data-next-when]');
  const count = root.querySelector<HTMLElement>('[data-next-count]');
  const desc = root.querySelector<HTMLElement>('[data-next-desc]');
  const state = root.querySelector<HTMLElement>('[data-next-state]');
  let lastKey = '';

  every(() => {
    const now = taipeiNow();
    const { target, live, delta } = pick(now.exact, occs);
    const key = `${target.id}-${target.day}-${live}-${now.day}`;

    if (key !== lastKey) {
      lastKey = key;
      root.querySelectorAll('.is-today').forEach((el) => el.classList.remove('is-today'));
      root.querySelector(`[data-day="${now.day}"]`)?.classList.add('is-today');
      root.querySelectorAll('.is-next, .is-past').forEach((el) => el.classList.remove('is-next', 'is-past'));
      // 今天已結束的活動變淡
      root.querySelectorAll<HTMLElement>(`[data-day="${now.day}"] [data-ev]`).forEach((el) => {
        const o = occs.find((x) => x.id === el.dataset.ev && x.day === now.day);
        if (o && o.end * 60 <= now.exact) el.classList.add('is-past');
      });
      root.querySelector(`[data-day="${target.day}"] [data-ev="${target.id}"]`)?.classList.add('is-next');

      if (title) title.textContent = target.title;
      if (desc) desc.textContent = target.desc;
      if (state) state.textContent = live ? '進行中' : '下一場';
      if (when) when.textContent = whenText(target, dayLabel(target, now.day, live, delta));
    }
    if (count) count.textContent = live ? `剩 ${hms(delta)}` : hms(delta);
  });
});

/* ---------------- 首頁摘要 ---------------- */
document.querySelectorAll<HTMLElement>('[data-week-mini]').forEach((root) => {
  const rows = [...root.querySelectorAll<HTMLElement>('[data-mini-ev]')];
  const ids = new Set(rows.map((r) => r.dataset.miniEv));
  const pool = occs.filter((o) => ids.has(o.id));
  if (!pool.length) return;
  const title = root.querySelector<HTMLElement>('[data-mini-title]');
  const when = root.querySelector<HTMLElement>('[data-mini-when]');
  const count = root.querySelector<HTMLElement>('[data-mini-count]');
  const state = root.querySelector<HTMLElement>('[data-mini-state]');
  let lastKey = '';

  every(() => {
    const now = taipeiNow();
    const top = pick(now.exact, pool);
    const key = `${top.target.id}-${top.target.day}-${top.live}-${now.day}`;

    if (key !== lastKey) {
      lastKey = key;
      if (state) state.textContent = top.live ? '進行中' : '下一場';
      if (title) title.textContent = top.target.title;
      if (when) when.textContent = whenText(top.target, dayLabel(top.target, now.day, top.live, top.delta));
      for (const row of rows) {
        const chip = row.querySelector<HTMLElement>('[data-mini-chip]');
        if (!chip) continue;
        const own = pick(now.exact, pool.filter((o) => o.id === row.dataset.miniEv));
        const isTop = own.target === top.target;
        chip.className = 'tag';
        if (own.live) {
          chip.classList.add('tag--live');
          chip.textContent = '進行中';
        } else if (isTop) {
          chip.classList.add('tag--next');
          chip.textContent = '下一場';
        } else {
          chip.classList.add('tag--mute');
          chip.textContent = dayLabel(own.target, now.day, false, own.delta);
        }
        row.classList.toggle('is-top', isTop);
      }
    }
    if (count) count.textContent = top.live ? `剩 ${hms(top.delta)}` : hms(top.delta);
  });
});
