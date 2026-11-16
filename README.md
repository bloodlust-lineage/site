# 嗜血天堂II 經典服 — 官方網站

乾淨、資訊清楚的伺服器官網：暖調的淺色內容區，搭配深色頁首、主視覺與幾個深色夜景區塊（上緣是森林剪影、下緣是山脈切邊），使用系統字型、直角卡片與細框線；主視覺是建置時產生的原創血月古城場景。
使用 [Astro](https://astro.build) 產生純靜態網站，可直接部署到 GitHub Pages。

## 頁面

| 路徑 | 內容 |
|---|---|
| `/` | 首頁：主視覺、倍率一覽、伺服器特色、七位史詩首領、覺醒職業體系、裝備之路、怎麼開始與本週戰場、冒險手冊章節入口、常見問題 |
| `/features/` | 伺服器特色：黏在頁首下方的本頁目錄、六個章節（酒紅封面＋特色卡片）、90 級覺醒技能（34 個職業）、倍率與規格 |
| `/guide/` | 新手指南：四個步驟、新手禮物、各等級練功地點（依裝備等級上色）、布告欄視窗、玩家指令、基本規則 |
| `/events/` | 每週戰場：即時行事曆、TvT／最後的英雄、週二 PvP 區域（附時間軸）、奧林匹亞、攻城、首領與副本、28 天出席獎勵 |
| `/download/` | 下載遊戲：遊戲主程式與登錄器補丁、安裝步驟、建議配備、疑難排解 |
| `/handbook/` | 冒險手冊：練功地圖、怪物／首領／道具圖鑑、商店、製作配方與 24 篇說明。資料、章節內容與程式由伺服器專案同步過來，版面與樣式是官網的 |
| 找不到的網址 | 404 頁：和首頁同一片血月場景 |

## 本機開發

需要 Node.js 20.3 以上。

```bash
npm install
npm run dev
```

開啟 <http://localhost:4321/classic_site/> 預覽（修改檔案會自動重新整理）。

## 常改的地方

| 想改什麼 | 檔案 |
|---|---|
| 伺服器名稱、標語、Discord 連結、**下載連結**、**開服日期倒數**、規格表 | `src/data/site.ts` |
| 每週行事曆（活動時間） | `src/data/schedule.ts` |
| 伺服器特色、倍率說明 | `src/data/features.ts` |
| 90 級覺醒技能 | `src/data/classes.ts` |
| 史詩首領 | `src/data/bosses.ts` |
| 新手禮物、練功地點、玩家指令、基本規則 | `src/data/guide.ts` |
| 裝備等級（首頁「裝備之路」與練功地點的顏色） | `src/data/gear.ts` |
| 活動規則、副本、出席獎勵 | `src/data/events.ts` |
| 常見問題 | `src/data/faq.ts` |

- **下載連結**：在 `site.ts` 的 `downloads.client.links`（主程式：Hugging Face 主要載點，加上 Google 雲端硬碟的 2 個備用載點）與 `downloads.patch.links`（登錄器補丁：Hugging Face 主要載點，加上 Google 雲端硬碟的備用載點）修改；第一個連結是主要按鈕，陣列清空時按鈕會自動改成「前往 Discord 取得」。
  - 登錄器補丁出新版時，在 Hugging Face 用同樣的檔名 `system.rar` 上傳覆蓋（網址不會變），並同時改 `downloads.patch.version` 與 `size`；Google 雲端硬碟上傳的新檔案網址會變，備用載點的網址也要換掉。
  - Google 雲端硬碟的連結有可能失效。補丁的備用載點失效時，先把 `patch.links` 的備用載點刪掉，換好新網址再加回來。
- **開服倒數**：首頁目前不顯示營運狀態列。要倒數時，在 `site.ts` 的 `status.launchDate` 填入台灣時間，例如 `'2026-12-05T20:00:00+08:00'`，主視覺最上方就會出現「封測進行中｜開服倒數」這一行（前面的文字改 `status.label`）；把 `launchDate` 清空就會再隱藏。

## 更新冒險手冊

伺服器專案重新產生 wiki 之後，在這裡執行：

```bash
npm run sync-handbook
```

來源路徑寫在專案根目錄的 `.handbook-source` 檔案裡（只有一行路徑，指向伺服器專案的 `wiki/index.html`；這個檔案只留在本機，不會上傳）。也可以用 `npm run sync-handbook -- --from "路徑/index.html"` 臨時指定。

同步只是把來源檔複製到 `src/handbook/wiki.html`，不會改手冊的內容。官網的冒險手冊頁面分成兩部分：

| 來自伺服器專案（每次同步會更新） | 官網自己的（不會被同步蓋掉） |
|---|---|
| 資料（道具、怪物、商店、配方…）、24 篇說明的內容、手冊的程式（搜尋、篩選、換頁） | 頁首、主視覺、搜尋列、章節欄、頁尾（`src/pages/handbook.astro`）與全部樣式（`src/styles/handbook.css`） |

所以手冊在伺服器專案那邊改了內容或資料，同步後直接生效；手冊的**版面**如果改了（多了新的元素或新的樣式類別），官網這邊要跟著補。同步腳本會先檢查來源檔：

- 對不上、頁面會壞掉（例如手冊的程式要找官網頁面沒有的元素）：**不複製**，官網維持原本的版本，並列出哪裡對不上。
- 頁面能用，但有新的樣式類別還沒處理：照樣複製，並列出要補在 `src/styles/handbook.css` 的類別（已處理的清單在 `scripts/handbook-parts.mjs`）。

只想檢查、不複製：

```bash
npm run sync-handbook -- --check
```

## 部署到 GitHub Pages

- 儲存庫：<https://github.com/bloodlust-lineage/site>
- 正式網址：<https://bloodlust-lineage.github.io/site/>

每次推送到 `main` 分支，`.github/workflows/deploy.yml` 會自動建置並部署，大約 1～2 分鐘後生效。
建置進度可以在儲存庫的 **Actions** 分頁看到。

第一次部署前，要到儲存庫的 **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**（只要設定一次）。

網址與子路徑會由 GitHub 自動帶入（`https://<帳號>.github.io/<repo>/`），改用自訂網域時也不需要修改設定。
若要在本機用不同的 repo 名稱預覽，修改 `astro.config.mjs` 的 `BASE_PATH` 備用值。

## 建置與效能

```bash
npm run build     # 產生 dist/
npm run preview   # 預覽建置結果
```

- **設計系統**：顏色、字體、按鈕、卡片、表格、展開式問答等共用樣式都在 `src/styles/global.css`（開頭的 `:root` 是色票）。區塊標題用 `SectionHead` 元件，子頁面標頭用 `PageHero` 元件。各頁共用的幾種樣式：
  - `.plate`：酒紅色面板（章節封面、冒險手冊封面那種），加 `.plate--frame` 會多一圈金色細框。
  - `.bar`：卡片最上面的深色標題列。
  - `.gem`／`.medal`：菱形徽記與圓形徽章，裡面放圖示或數字。
  - `.section--dark`：深色夜景區塊。上緣的森林、下緣的山脈是 `<svg class="edge …">`，圖形來自 `SceneDefs.astro`（每頁只輸出一次，其他地方用 `<use href="#g-trees">` 引用）。
  - `FeatureArt.astro`：深色底上的遊戲介面示意圖（Alt+B 鍵帽、內掛小視窗等），首頁與特色頁共用。
- **捲軸**：整頁的捲軸是和頁首同色的深色軌道，滑塊是品牌紅、兩端各一道金邊（`global.css` 的「捲軸」段落）。只在用滑鼠操作的裝置套用，手機與平板維持系統原本的捲軸。
- **冒險手冊**：和其他頁面共用頁首、主視覺與頁尾；內容區的樣式集中在 `src/styles/handbook.css`，每一條都包在 `.hb` 底下（類別名稱是手冊的程式產生的，這樣才不會影響其他頁面）。表格、提示框、標籤、按鈕都照全站的樣子做，裝備等級徽章的顏色和首頁「裝備之路」一致。手冊用網址的 `#` 切換頁面（例如 `/handbook/#srv-bbs`），其他頁面可以直接連到某一章。
- **進場效果**：各區塊的內容捲到才淡入（`src/scripts/core.ts`）。載入時已經在畫面內的不處理；沒有 JavaScript 或系統設定「減少動態效果」時內容直接顯示。
- **字型**：全部使用系統字型（Windows 的微軟正黑體、Mac 的蘋方等），不必下載字型檔。
- **主視覺**：`src/components/Scene.astro` 把天空、星空、血月、雲帶、遠近山脈、岩峰上的城堡、霧與前景森林一層層疊出景深，首頁與子頁面標頭共用。城堡、山脈、森林由 `src/lib/scene.ts` 在建置時產生 SVG（固定亂數種子，每次建置結果相同），不載入圖片或 WebGL；動畫（雲、霧、星光、窗光）只動透明度與位移。要調整城堡造型就改 `scene.ts` 的 `citadel()`。
- **即時資訊**：每週行事曆與首頁「本週戰場」依台灣時間即時標出下一場活動（`src/scripts/schedule.ts`）；頁尾顯示伺服器時間。
- **圖示**：集中成一個 SVG 精靈圖（`icons.svg`），瀏覽器只下載一次。
- 樣式全部內嵌進 HTML，沒有阻擋渲染的 CSS 請求。

## 其他指令

| 指令 | 用途 |
|---|---|
| `npm run icons` | 重新下載 game-icons 圖示（新增或更換圖示時，編輯 `scripts/fetch-icons.mjs` 的清單） |
| `npm run og` | 重新產生網站圖示 PNG 與分享縮圖 `public/og.jpg`（需先執行 `npm run dev`，並安裝 Chrome；用 `npm run preview` 時加上 `-- --url http://127.0.0.1:4322/classic_site/`） |

## 授權與出處

- 圖示：[game-icons.net](https://game-icons.net)（Lorc、Delapouite、Skoll、sbed 等，CC BY 3.0），頁尾已標示出處。
- 主視覺、古城剪影、徽章、所有版面皆為原創，不使用任何官方美術素材。
- Lineage II 與天堂II 為 NCSOFT Corporation 之註冊商標；本站為玩家社群自行營運的伺服器網站，與 NCSOFT 無關。
