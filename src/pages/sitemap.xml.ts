import type { APIRoute } from 'astro';

const pages = ['/', '/features/', '/guide/', '/events/', '/download/', '/handbook/'];

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => {
      const loc = new URL(`${base}${p}`, site).toString();
      const priority = p === '/' ? '1.0' : p === '/handbook/' ? '0.7' : '0.8';
      return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
