/**
 * 產生含 base 路徑的站內連結（GitHub Pages 會部署在 /<repo>/ 底下）
 *   url('/')          → '/classic_site/'
 *   url('/features/') → '/classic_site/features/'
 *   url('#faq')       → '#faq'
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function url(path = '/'): string {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}` || '/';
}

/** 判斷導覽項目是否為目前頁面 */
export function isActive(current: string, href: string): boolean {
  const clean = (s: string) => s.replace(/\/+$/, '') || '/';
  const cur = clean(current);
  const target = clean(url(href));
  if (href === '/') return cur === target;
  return cur === target || cur.startsWith(target + '/');
}
