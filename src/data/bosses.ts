/**
 * 史詩首領（Grand Boss）
 * 依據：冒險手冊「副本 → 史詩首領」。本服實際會出現的史詩首領共 7 位，全部 96 級。
 */
import type { IconName } from './icons';

export interface EpicBoss {
  id: string;
  name: string;
  latin: string;
  icon: IconName;
  level: number;
  location: string;
  entry: string;
  respawn: string;
  lore: string;
  drops: string[];
}

export const epicBosses: EpicBoss[] = [
  {
    id: 'queen-ant',
    name: '巨蟻女王',
    latin: 'Queen Ant',
    icon: 'queenAnt',
    level: 96,
    location: '螞蟻洞窟最深處',
    entry: '不限等級、人數',
    respawn: '打倒後 12～36 小時之間隨機',
    lore: '蟻巢最深處的女王，被衛兵與護士蟻層層守護。牠倒下的那一刻，整座洞窟都會安靜下來。',
    drops: ['巨蟻女王戒指 Lv1', '巨蟻女王人偶 Lv1'],
  },
  {
    id: 'core',
    name: '核心',
    latin: 'Core',
    icon: 'core',
    level: 96,
    location: '克魯瑪高塔 地下 1 層',
    entry: '不限等級、人數',
    respawn: '打倒後 37～60 小時之間隨機',
    lore: '在克魯瑪高塔地底運轉的古老核心。它不施法、不呼救，只以壓倒性的力量回應每一個入侵者。',
    drops: ['核心戒指 Lv1'],
  },
  {
    id: 'orfen',
    name: '奧爾芬',
    latin: 'Orfen',
    icon: 'orfen',
    level: 96,
    location: '孢子之海（3 處之一）',
    entry: '不限等級、人數',
    respawn: '打倒後 28～48 小時之間隨機',
    lore: '盤踞孢子之海的妖異首領。每次甦醒都在不同的水域現身，先找到牠的人，才有資格挑戰牠。',
    drops: ['奧爾芬耳環 Lv1', '奧爾芬人偶 Lv1'],
  },
  {
    id: 'baium',
    name: '巴溫',
    latin: 'Baium',
    icon: 'baium',
    level: 96,
    location: '傲慢之塔 第 14 層',
    entry: '與石像對話喚醒，不需道具',
    respawn: '打倒後固定 5 天，石像重新出現',
    lore: '被封印在傲慢之塔頂端的皇帝，化為石像沉睡至今。是否喚醒他，由站在石像前的你決定。',
    drops: ['巴溫戒指 Lv1', '巴溫人偶 Lv1', '巴溫護身符'],
  },
  {
    id: 'zaken',
    name: '札肯',
    latin: 'Zaken',
    icon: 'zaken',
    level: 96,
    location: '惡魔島',
    entry: '不限等級、人數',
    respawn: '每天 21:00（打倒後的下一個 21:00）',
    lore: '惡魔島的幽靈海賊船長。夜色降臨、鐘聲敲響 21 下時，他會準時回到甲板上。',
    drops: ['札肯耳環 Lv1'],
  },
  {
    id: 'antharas',
    name: '安塔瑞斯',
    latin: 'Antharas',
    icon: 'antharas',
    level: 96,
    location: '奇岩領地 野外',
    entry: '不限等級、人數',
    respawn: '每週三 23:00（打倒後的下一個週三）',
    lore: '大地之龍。每到週三深夜，奇岩領地的大地便再次震動——整個亞丁最受矚目的一場戰役。',
    drops: ['安塔瑞斯耳環 Lv1', 'S 級武器／防具強化卷軸'],
  },
  {
    id: 'scarlet',
    name: '思卡雷特 潘 哈里夏',
    latin: 'Scarlet van Halisha',
    icon: 'scarlet',
    level: 96,
    location: '最後的皇陵（副本）',
    entry: '4 人以上、88～99 級',
    respawn: '副本每週三 06:30 重置',
    lore: '芙琳泰莎的樂曲在皇陵中迴盪，惡魔在旋律裡甦醒。血量見底時，牠會換上第二副形態。',
    drops: ['芙琳泰沙項鍊 Lv1', '芙琳泰沙人偶 Lv1'],
  },
];
