# 嗜血天堂II 經典服 — 官方網站

乾淨、資訊清楚的伺服器官網：淺色內容區搭配深色頁首與主視覺，使用系統字型、直角卡片與細框線；主視覺是建置時產生的原創血月古城場景。
使用 [Astro](https://astro.build) 產生純靜態網站，可直接部署到 GitHub Pages。

## 頁面

| 路徑 | 內容 |
|---|---|
| `/` | 首頁：主視覺、伺服器特色、倍率一覽、七位史詩首領、覺醒職業體系、裝備之路、怎麼開始與本週戰場、冒險手冊章節入口、常見問題 |
| `/features/` | 伺服器特色：六大分類、90 級覺醒技能（34 個職業）、倍率與規格 |
| `/guide/` | 新手指南：開始步驟、新手禮物、練功地點、布告欄、玩家指令、基本規則 |
| `/events/` | 每週戰場：即時行事曆、TvT／最後的英雄、週二 PvP 區域、奧林匹亞、攻城、首領與副本、28 天出席獎勵 |
| `/download/` | 下載遊戲：遊戲主程式與登錄器補丁、安裝步驟、建議配備、疑難排解 |
| `/handbook/` | 冒險手冊（由伺服器專案的 wiki 自動同步） |

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

- **設計系統**：顏色、字體、按鈕、卡片、表格、展開式問答等共用樣式都在 `src/styles/global.css`（開頭的 `:root` 是色票）。區塊標題用 `SectionHead` 元件，子頁面標頭用 `PageHero` 元件。
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
