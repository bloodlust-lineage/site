/**
 * 裝備等級與成長路線 — 首頁「裝備之路」與新手指南「各等級練功地點」共用
 * 依據：冒險手冊「裝備等級與成長路線」。尚未開放的階段不列在這裡（決策 D16）。
 */
export interface GearTier {
  /** 寶石上的字 */
  g: string;
  name: string;
  /** 可以開始穿的等級 */
  from: number;
  /** 顯示用的等級範圍 */
  lv: string;
  how: string;
  /** 代表色 */
  c: string;
}

export const gearTiers: GearTier[] = [
  { g: '無', name: '無等級', from: 1, lv: '1～19', how: '新手禮物 +16 武器，布告欄商店直購', c: '#7d8592' },
  { g: 'D', name: 'D 級', from: 20, lv: '20～39', how: '布告欄「一般裝備」用金幣購買', c: '#3a70c8' },
  { g: 'C', name: 'C 級', from: 40, lv: '40～51', how: '布告欄「一般裝備」用金幣購買', c: '#2a8f60' },
  { g: 'B', name: 'B 級', from: 52, lv: '52～60', how: '克魯瑪高塔掉落、C 級升級、矮人製作', c: '#b77f12' },
  { g: 'A', name: 'A 級', from: 61, lv: '61～75', how: '隨機製作、B 級升級、70～85 級狩獵首領', c: '#c64d36' },
  { g: 'S', name: 'S 級', from: 76, lv: '76～', how: 'A 級特殊升級、86～93 級首領、帝國之墓與傲慢之塔', c: '#7f4fc9' },
  { g: '朝', name: '王朝', from: 81, lv: '81～', how: '匹黎茲「特殊升級」：S 級成品＋首領材料', c: '#9a7420' },
];

/** 某個等級開始時，適合穿的裝備等級（取起始等級能穿的最高一階） */
export function tierForLevel(level: number): GearTier {
  let tier = gearTiers[0];
  for (const t of gearTiers) if (level >= t.from) tier = t;
  return tier;
}
