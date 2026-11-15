/**
 * 伺服器特色 — features 頁與首頁共用
 * 依據：冒險手冊「伺服器資訊」「社群布告欄」「自動狩獵」「PvP、活動與其他」與決策紀錄。
 */
import type { IconName } from './icons';

export interface Feature {
  icon: IconName;
  title: string;
  desc: string;
  tag?: string;
  cmd?: string;
}

export interface FeatureGroup {
  id: string;
  numeral: string;
  latin: string;
  title: string;
  lede: string;
  items: Feature[];
}

export const featureGroups: FeatureGroup[] = [
  {
    id: 'growth',
    numeral: 'I',
    latin: 'Growth',
    title: '成長節奏',
    lede: '經驗 5 倍、所有等級相同。不是一夜百級，而是每一級都扎實、每一次轉職都值得紀念。',
    items: [
      { icon: 'rank', title: '免任務轉職', desc: '20、40、76 級各轉職一次，畫面出現提示直接選職業，不用解任務、完全免費。', tag: '免費' },
      { icon: 'book', title: '技能自動學習', desc: '不需要技能書的技能，升級時自動學會；需要書的技能在布告欄用金幣直接購買。' },
      { icon: 'awaken', title: '90 級覺醒技能', desc: '每個三轉職業各 1 個被動、1 個主動技能，90／95／99 級自動學會，不用 SP、不用技能書。', tag: '本服獨有' },
      { icon: 'helm', title: '無越級懲罰', desc: '關閉越級裝備懲罰：等級未到也能穿高一級的裝備，不會被扣命中或攻速。' },
      { icon: 'weight', title: '負重 5 倍', desc: '負重上限是一般的 5 倍，輔助欄位 22 格、歌舞另計 12 格，長征不必頻繁回城。' },
      { icon: 'upgrade', title: '副職業最高 85 級', desc: '在布告欄就能添加、切換副職業；霸主、戰爭工匠也開放當副職業，其他種族也能製作。', tag: '新開放' },
    ],
  },
  {
    id: 'board',
    numeral: 'II',
    latin: 'Community Board',
    title: '隨身布告欄',
    lede: '遊戲中按 Alt+B，商店、輔助、傳送、倉庫全部隨身帶著走，不必跑回村莊。',
    items: [
      { icon: 'teleport', title: '全地圖免費傳送', desc: '城鎮、練級推薦、高等與高階獵場、傲慢之塔各樓層、首領附近，所有傳送點都免費。', tag: '免費' },
      { icon: 'buff', title: '84 級以下輔助免費', desc: '63 種輔助、6 種內建套餐，可自訂 8 組套餐，大部分持續 24 小時；85 級以上每個 1,000 金幣。', tag: '免費' },
      { icon: 'shop', title: '隨身商店', desc: '無等級到 C 級裝備、強化卷軸、技能書、靈魂彈與藥水，金幣直購；另有守護裝備商店。' },
      { icon: 'potion', title: '一鍵治癒', desc: '「治癒」按鈕免費補滿 HP、MP、CP，「清除增益」一鍵整理狀態。' },
      { icon: 'loot', title: '隨身倉庫與出售', desc: '隨時存取個人與血盟倉庫、把道具賣給商店；背包與倉庫可用金幣擴充。' },
      { icon: 'laurel', title: '統計排行', desc: 'PK、PvP、等級、金幣、在線時間、奧林匹亞排行，各前 20 名，每 3 分鐘更新。' },
    ],
  },
  {
    id: 'auto',
    numeral: 'III',
    latin: 'Automation',
    title: '自動化與便利',
    lede: '把重複的事交給系統，把時間留給首領、攻城與夥伴。',
    items: [
      { icon: 'bot', title: '內掛自動狩獵', desc: '免費、所有等級都能用。自動找怪、技能策略、補血補藍、自動回收、隊伍管理，設定登出自動保存。', tag: '免費', cmd: '.內掛' },
      { icon: 'potion', title: '自動喝水', desc: 'HP／MP／CP 低於設定百分比時自動使用背包藥水，任何時候都有效。', cmd: '.acp' },
      { icon: 'loot', title: '自動撿取', desc: '一般怪物掉落的金幣與物品直接進背包，組隊時依分配方式發放。' },
      { icon: 'shop', title: '離線商店', desc: '開好個人商店再輸入指令即可離線擺攤，1 級起免費、任何地點都能開，伺服器重啟後自動恢復。', cmd: '.offline' },
      { icon: 'buff', title: '輔助商店', desc: '輔助職業可以開店販售輔助魔法，開好後同樣可以離線營業。', cmd: '.buffstore' },
      { icon: 'calendar', title: '每日出席獎勵', desc: '28 天一輪，一輪共 600 出席幣，可在出席幣兌換所換卷軸、斗篷與變身刻印。' },
    ],
  },
  {
    id: 'classes',
    numeral: 'IV',
    latin: 'Class Balance',
    title: '職業再平衡',
    lede: '針對經典版長期被冷落的職業，逐一調整。每一種職業都該有站上舞台的理由。',
    items: [
      { icon: 'rogue', title: '匕首正面背刺', desc: '死亡背擊、殺機、殺意從正面攻擊也視為背後攻擊，物攻與致命率照背後計算。', tag: '調整' },
      { icon: 'archer', title: '弓手範圍強化', desc: '爆射箭威力約 2.3 倍；火焰之鷹、箭雨、鬼刺冷卻 30 秒 → 10 秒；90 級再學多重箭矢、箭雨風暴。', tag: '調整' },
      { icon: 'warrior', title: '決鬥者・卡巴塔里', desc: '波動風暴、波動爆破、爆裂之力、力量風暴等範圍技威力提高約 4.3～4.7 倍。', tag: '調整' },
      { icon: 'support', title: '輔助職業強化', desc: '天之箭威力約 1.35 倍、君主封印成功率 +15%、竊取精髓約 1.3 倍，騎士與詩人舞者開放精通重裝甲 Lv62～66。', tag: '調整' },
    ],
  },
  {
    id: 'battle',
    numeral: 'V',
    latin: 'Battlefield',
    title: '戰場與競技',
    lede: '週一到週六每晚都有活動，週日攻城。所有玩家擊殺都會全服公告。',
    items: [
      { icon: 'pvp', title: 'TvT 團體對抗賽', desc: '週一～六 21:30，隨機分紅藍兩隊比擊殺數，死亡會重生。勝隊 20 萬金幣＋10 Lcoin。' },
      { icon: 'lastHero', title: '最後的英雄', desc: '週一～六 20:30，各自為戰、死亡 3 次出局，存活到最後得 30 萬金幣＋20 Lcoin。' },
      { icon: 'blood', title: '週二 PvP 區域', desc: '每週二 20:00～24:00，安塔瑞斯洞窟與傲慢之塔 4～11 樓殺人不紅名，活動怪必掉 A 級材料禮盒。' },
      { icon: 'laurel', title: '奧林匹亞', desc: '週一～六 22:00～23:00，每週一結算英雄。英雄只能從奧林匹亞取得，不販售。' },
      { icon: 'siege', title: '奇岩城攻城戰', desc: '每週日 20:00 開打，持續 1 小時，最多 20 個血盟同場爭奪奇岩城。' },
      { icon: 'fangs', title: '公平的多開規則', desc: '同一台電腦 5 開；PvP 活動限同一台電腦 1 個角色，奧林匹亞同一台電腦只能 1 隻報名。' },
    ],
  },
  {
    id: 'bosses',
    numeral: 'VI',
    latin: 'Raids & Instances',
    title: '首領與副本',
    lede: '首領依強弱重新排位：70～93 級狩獵首領一路銜接，頂端是 7 位 96 級史詩首領。',
    items: [
      { icon: 'dragon', title: '96 級史詩首領', desc: '巨蟻女王、核心、奧爾芬、巴溫、札肯、安塔瑞斯、思卡雷特 潘 哈里夏，出現與擊敗都全服公告。' },
      { icon: 'crown', title: '狩獵首領重新排位', desc: '70～93 級首領依原本強弱重新分配，90 多級也有首領能打；布告欄可直接傳送到首領附近。' },
      { icon: 'portal', title: '精靈王居所', desc: '四位精靈王，一般 82～99 級、極限戰 85～99 級（9 人以上），掉落精靈王項鍊與首領材料。' },
      { icon: 'organ', title: '最後的皇陵', desc: '88～99 級、4 人以上，芙琳泰莎演奏的樂曲中，擊敗 96 級的思卡雷特 潘 哈里夏。' },
      { icon: 'beastEye', title: '高階獵場 91～98', desc: '悲鳴的沼澤、司塔卡拓巢穴、沉默修道院、聖靈的顯現，掉落升級材料與 S 級組件。' },
      { icon: 'castle', title: '血盟鬥技場', desc: '25 關首領連戰，同血盟一個隊伍就能挑戰；第 21 關起加碼狩獵硬幣與嗜血結晶。' },
    ],
  },
];

/** 首頁「更多便利」精選 */
export const homeExtras: Feature[] = [
  { icon: 'loot', title: '自動撿取', desc: '一般怪物的金幣與物品直接進背包。' },
  { icon: 'rank', title: '免任務轉職', desc: '20／40／76 級直接轉，免費。' },
  { icon: 'book', title: '技能自動學習', desc: '升級自動學會，不用到處找導師。' },
  { icon: 'helm', title: '無越級懲罰', desc: '高一級的裝備提早穿，不扣能力。' },
  { icon: 'weight', title: '負重 5 倍', desc: '長征不必頻繁回城整理背包。' },
  { icon: 'shop', title: '離線商店', desc: '.offline 免費擺攤，重啟自動恢復。' },
  { icon: 'potion', title: '自動喝水', desc: '.acp 低於設定值自動補 HP／MP／CP。' },
  { icon: 'calendar', title: '出席獎勵', desc: '28 天一輪，出席幣換卷軸與外觀。' },
];

/** 倍率細節（首頁倍率之書與 features 頁） */
export const rateBook = {
  hero: { value: 5, label: '經驗值', latin: 'EXP', note: '所有等級相同，不設階梯倍率' },
  items: [
    { value: '2', prefix: '×', label: 'SP', note: '技能點數' },
    { value: '2', prefix: '×', label: '金幣掉落', note: '一般怪與首領' },
    { value: '1', prefix: '×', label: '物品掉落', note: '原汁原味的掉寶' },
    { value: '1', prefix: '×', label: '回收 Spoil', note: '製作材料靠回收' },
    { value: '3', prefix: '×', label: '怪物數量', note: '獵場同時在場的怪' },
    { value: '5', prefix: '×', label: '重生速度', note: '一般怪重生快 5 倍' },
    { value: '2', prefix: '×', label: '精靈經驗', note: '元素精靈成長' },
    { value: '99', prefix: 'Lv.', label: '等級上限', note: '副職業最高 85 級' },
  ],
  premium: '高級會員再乘經驗 ×2、SP ×2、金幣 ×1.5；物品掉落、回收與強化成功率不加成。組隊時會員倍率以全隊平均計算。',
};
