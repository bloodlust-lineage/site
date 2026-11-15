import { defineConfig } from 'astro/config';

/**
 * GitHub Pages 部署設定
 * ------------------------------------------------------------------
 * - GitHub Actions 建置時，會自動帶入 SITE_URL 與 BASE_PATH（見 .github/workflows/deploy.yml），
 *   不論 repo 名稱為何、或改用自訂網域，都不用改這個檔案。
 * - 本機開發（npm run dev）預設使用下方的備用值。
 *   若 repo 名稱不是 classic_site，可以改這裡的 BASE_PATH 備用值。
 */
const SITE_URL = process.env.SITE_URL || 'https://bloodlust-lineage.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/classic_site';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // 樣式全部內嵌進 HTML：少掉阻擋渲染的 CSS 請求，慢速網路下首屏更快
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
  vite: {
    build: {
      assetsInlineLimit: 2048,
    },
  },
});
