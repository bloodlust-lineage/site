/**
 * 圖示精靈圖（SVG sprite）：所有 game-icons 圖示集中成一個檔案，
 * 各頁面以 <use href="icons.svg#名稱"> 引用，瀏覽器只下載一次並快取。
 */
import type { APIRoute } from 'astro';
import { icons } from '../data/icons';

export const GET: APIRoute = () => {
  const symbols = Object.entries(icons)
    .map(([name, d]) => `<symbol id="${name}" viewBox="0 0 512 512"><path d="${d}"/></symbol>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
