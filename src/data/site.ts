/**
 * 全站核心設定 — 改這裡就會全站更新
 * ------------------------------------------------------------------
 * 數值依據：伺服器專案的設定檔與 wiki（冒險手冊）。
 * 伺服器設定有變動時，請同步修改這個檔案。
 */

export const site = {
  /** 品牌 */
  name: '嗜血天堂II',
  wordmark: '嗜血天堂',
  numeral: 'II',
  latin: 'BLOODLUST',
  edition: '經典服',
  editionLatin: 'CLASSIC',
  tagline: '血月之下，經典再臨',
  taglineLatin: 'Beneath the blood moon, the classic returns',
  description:
    '嗜血天堂II 經典服 — 經驗 5 倍起、等級上限 99 的天堂II經典伺服器。隨身布告欄、免費內掛、90 級覺醒技能與 96 級史詩首領，在血月之下重返亞丁。',
  keywords:
    '天堂2, 天堂II, 天堂2經典版, Lineage 2, Lineage II Classic, 私服, 私人伺服器, 嗜血天堂, 嗜血天堂2, 嗜血天堂II, 經典服, 5倍經驗, 繁體中文',

  /**
   * 營運狀態與開服倒數
   * - phase：'beta'（封測中）或 'live'（已開服）
   * - launchDate：留空時，首頁不顯示狀態列（目前的設定）。
   *   填入開服時間（台灣時間，ISO 格式，例如 '2026-12-05T20:00:00+08:00'）後，
   *   首頁主視覺最上方會出現「label｜開服倒數 X 天 時:分:秒」，時間到了會變成「伺服器已正式開放」。
   */
  status: {
    phase: 'beta' as 'beta' | 'live',
    label: '封測進行中',
    launchDate: '',
  },

  /** 客戶端版本 */
  client: {
    chronicle: '經典：戰爭開始',
    protocol: 286,
  },

  /** 社群連結 */
  links: {
    discord: 'https://discord.gg/btKjFdyeuN',
  },

  /**
   * 下載連結（和 Discord 公告的載點相同）
   * - links 的第一個是主要按鈕（Hugging Face），其他是備用載點（Google 雲端硬碟）；
   *   links 是空陣列時，按鈕會改成「前往 Discord 取得」，不會出現壞掉的連結。
   * - 主程式不含最新的 system，每個人都要再套用登錄器補丁（system.rar）。
   * - Hugging Face 的連結結尾加上 ?download=true，瀏覽器會直接存檔，不會試著開啟檔案。
   * - 補丁出新版時：在 Hugging Face 用同樣的檔名 system.rar 上傳覆蓋，網址不變，只要改這裡的 version／size；
   *   Google 雲端硬碟上傳的新檔案會有新網址，備用載點的 url 也要一起換掉。
   * - Google 雲端硬碟的連結有可能失效。補丁的備用載點失效時，先把 patch.links 的第二筆刪掉，
   *   換好新網址再加回來。
   */
  downloads: {
    client: {
      name: '遊戲主程式',
      note: '第一次安裝，先下載這個',
      size: '約 11.3 GB',
      unpacked: '解壓縮後約 25 GB',
      version: '',
      links: [
        {
          label: '主要載點',
          desc: '單一壓縮檔 LineageII-blood.rar（Hugging Face）',
          url: 'https://huggingface.co/bcat-legend/lineage-2-client/resolve/main/LineageII-blood.rar?download=true',
        },
        {
          label: '備用載點 1',
          desc: '單一壓縮檔 LineageII嗜血.rar（Google 雲端硬碟）',
          url: 'https://drive.usercontent.google.com/download?id=1X9aCJskc5TaWw3r-pV0MRNt94MpkxVTA&export=download',
        },
        {
          label: '備用載點 2',
          desc: 'Google 雲端硬碟資料夾，分成 3 個檔案（LineageII嗜血.part1.exe、part2.rar、part3.rar，4 GB＋4 GB＋2.55 GB），三個都要下載到同一個資料夾，再執行 part1.exe 解壓縮（也可以用 WinRAR 開啟 part1.exe）',
          url: 'https://drive.google.com/drive/folders/1Tc2QMPh0l9a09f7gG0CcjULXQk7tMZnx',
        },
      ],
    },
    patch: {
      name: '登錄器補丁',
      note: '每個人都要裝，更新也用它',
      size: '約 96 MB',
      unpacked: '解壓縮後覆蓋遊戲資料夾的 system',
      version: '20261125',
      links: [
        // 只剩一個載點時，把 label 改成「下載登錄器補丁」
        {
          label: '主要載點',
          desc: 'system.rar（Hugging Face），內含修改版 L2.exe 與最新的遊戲資料',
          url: 'https://huggingface.co/bcat-legend/lineage-2-client/resolve/main/system.rar?download=true',
        },
        {
          label: '備用載點',
          desc: 'system.rar（Google 雲端硬碟），主要載點下載不順時使用',
          url: 'https://drive.usercontent.google.com/download?id=1Mrxup44RK6we77a4JEri1i0U-sXqZ486&export=download',
        },
      ],
    },
  },

  /** 首頁主視覺下方的關鍵數字 */
  heroRates: [
    { pre: '×', value: '5', post: '起', label: '經驗值' },
    { pre: '×', value: '2', post: '', label: 'SP' },
    { pre: '×', value: '2', post: '', label: '金幣掉落' },
    { pre: 'Lv.', value: '99', post: '', label: '等級上限' },
    { pre: '', value: '5', post: '開', label: '每台電腦' },
  ],

  /** 伺服器規格（features 與 download 頁使用） */
  specs: [
    ['客戶端版本', '經典：戰爭開始（協定 286）'],
    ['經驗值／SP', '經驗 1～39 級 5 倍、40～61 級 3.5 倍、62 級以上 2 倍／SP 2 倍'],
    ['金幣／物品掉落', '2 倍／1 倍'],
    ['等級上限', '99 級（副職業 85 級）'],
    ['轉職', '20、40、76 級，免任務、免費'],
    ['多開限制', '同一台電腦最多 5 開，不限 IP'],
    ['每個帳號', '7 個角色'],
    ['出生地點', '奇岩城鎮'],
    ['自動重啟', '每週一、四、六 21:00'],
    ['伺服器時間', '台灣時間（UTC+8）'],
  ] as [string, string][],

  /** 頁首導覽（順序即顯示順序；路徑不含 base） */
  nav: [
    { href: '/', label: '首頁', latin: 'Home' },
    { href: '/features/', label: '伺服器特色', latin: 'Features' },
    { href: '/guide/', label: '新手指南', latin: 'Guide' },
    { href: '/events/', label: '每週戰場', latin: 'Events' },
    { href: '/handbook/', label: '冒險手冊', latin: 'Handbook', external: true },
  ],
} as const;

export type Site = typeof site;
