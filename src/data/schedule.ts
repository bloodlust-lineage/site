/**
 * 每週行事曆（伺服器時間＝台灣時間 UTC+8）
 * ------------------------------------------------------------------
 * days：1＝週一 … 7＝週日
 * start／end：'HH:MM'，end 省略代表單一時間點（顯示約 15 分鐘的區塊）
 * 依據：冒險手冊「PvP、活動與其他 → 每週行事曆」與伺服器的自動重啟設定。
 */

export type EventKind = 'pvp' | 'olympiad' | 'siege' | 'boss' | 'maint' | 'reset';

export interface ScheduleEvent {
  id: string;
  title: string;
  short: string;
  days: number[];
  start: string;
  end?: string;
  kind: EventKind;
  desc: string;
}

export const kindLabel: Record<EventKind, string> = {
  pvp: 'PvP 活動',
  olympiad: '奧林匹亞',
  siege: '攻城戰',
  boss: '史詩首領',
  maint: '維護',
  reset: '重置',
};

export const schedule: ScheduleEvent[] = [
  {
    id: 'hero-calc',
    title: '奧林匹亞結算・新英雄誕生',
    short: '英雄結算',
    days: [1],
    start: '00:00',
    kind: 'olympiad',
    desc: '每個職業積分最高、當週打滿 10 場且至少贏 1 場的人成為英雄。英雄只從奧林匹亞產生，不販售。',
  },
  {
    id: 'instance-reset',
    title: '副本每週重置',
    short: '副本重置',
    days: [3],
    start: '06:30',
    kind: 'reset',
    desc: '所有副本（精靈王居所、最後的皇陵、班卓斯騎士團、血盟鬥技場等）與每週限購在週三 06:30 重置。',
  },
  {
    id: 'pvp-zone',
    title: 'PvP 區域活動',
    short: 'PvP 區域',
    days: [2],
    start: '20:00',
    end: '24:00',
    kind: 'pvp',
    desc: '安塔瑞斯洞窟與傲慢之塔 4～11 樓變成 PvP 區，殺人不會變紅名。活動怪必掉 A 級材料禮盒，20:30、22:30 出現血的騎士團長。',
  },
  {
    id: 'siege',
    title: '奇岩城攻城戰',
    short: '奇岩攻城',
    days: [7],
    start: '20:00',
    end: '21:00',
    kind: 'siege',
    desc: '每週日 20:00 開打，持續 1 小時，每場最多 20 個血盟參加。攻城戰中死亡不扣經驗。',
  },
  {
    id: 'last-hero',
    title: '最後的英雄',
    short: '最後的英雄',
    days: [1, 2, 3, 4, 5, 6],
    start: '20:30',
    kind: 'pvp',
    desc: '61～99 級、至少 5 人開打，各自為戰、死亡 3 次出局。每擊殺 1 人得 1 萬金幣，存活到最後得 30 萬金幣＋20 Lcoin。',
  },
  {
    id: 'restart',
    title: '自動重啟維護',
    short: '重啟維護',
    days: [1, 4, 6],
    start: '21:00',
    kind: 'maint',
    desc: '每週一、四、六 21:00 自動重啟，重啟前有倒數公告；約數分鐘後即可重新登入。',
  },
  {
    id: 'zaken',
    title: '史詩首領：札肯',
    short: '札肯',
    days: [1, 2, 3, 4, 5, 6, 7],
    start: '21:00',
    kind: 'boss',
    desc: '96 級史詩首領，出沒於惡魔島。打倒後於下一個 21:00 重生，出現與擊敗時全服公告。',
  },
  {
    id: 'tvt',
    title: 'TvT 團體對抗賽',
    short: 'TvT',
    days: [1, 2, 3, 4, 5, 6],
    start: '21:30',
    kind: 'pvp',
    desc: '40～99 級、至少 6 人開打，隨機分紅藍兩隊比擊殺數。勝隊 20 萬金幣＋10 Lcoin，敗隊 5 萬金幣＋3 Lcoin。',
  },
  {
    id: 'olympiad',
    title: '奧林匹亞競技',
    short: '奧林匹亞',
    days: [1, 2, 3, 4, 5, 6],
    start: '22:00',
    end: '23:00',
    kind: 'olympiad',
    desc: '70 級以上、完成二轉、使用主職業可參加，每天最多 5 場，報名滿 20 人開始配對。',
  },
  {
    id: 'antharas',
    title: '史詩首領：安塔瑞斯',
    short: '安塔瑞斯',
    days: [3],
    start: '23:00',
    kind: 'boss',
    desc: '96 級地龍，出沒於奇岩領地野外。打倒後於下一個週三 23:00 重生。',
  },
];

/** 每日例行（不放進週曆格子，另外列出） */
export const daily = [
  { time: '06:30', title: '每日重置', desc: '出席獎勵、世界頻道次數、古代海賊墳墓入場時間' },
];

export const weekdays = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
export const weekdaysLatin = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
