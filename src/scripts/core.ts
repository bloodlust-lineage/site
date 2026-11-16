/**
 * 全站共用互動：行動版選單、頁首陰影、進場效果、複製指令、伺服器時鐘
 */
const root = document.documentElement;

/* ------------------------------------------------------------
   頁首：離開頁面頂端後加上陰影
   ------------------------------------------------------------ */
const header = document.querySelector<HTMLElement>('.hd');
if (header) {
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ------------------------------------------------------------
   進場效果：各區塊裡的內容捲到才浮現。
   載入時已經在畫面內的不處理，所以不會閃一下；沒有 JavaScript 時內容照常顯示。
   ------------------------------------------------------------ */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const blocks = document.querySelectorAll<HTMLElement>('main > section:not(.hero):not(.ph) > .container > *');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  const limit = window.innerHeight * 0.92;
  blocks.forEach((el) => {
    if (el.getBoundingClientRect().top > limit) {
      el.setAttribute('data-reveal', '');
      io.observe(el);
    }
  });
}

/* ------------------------------------------------------------
   行動版下拉選單
   ------------------------------------------------------------ */
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const drawer = document.querySelector<HTMLElement>('[data-nav-drawer]');
if (toggle && drawer) {
  const label = toggle.querySelector<HTMLElement>('[data-nav-label]');
  const setOpen = (open: boolean, focusToggle = false) => {
    drawer.hidden = !open;
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? '關閉選單' : '開啟選單';
    if (focusToggle) toggle.focus({ preventScroll: true });
  };
  toggle.addEventListener('click', () => setOpen(drawer.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) setOpen(false, true);
  });
  drawer.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (m) => {
    if (m.matches) setOpen(false);
  });
}

/* ------------------------------------------------------------
   複製指令（data-copy="文字"）
   ------------------------------------------------------------ */
async function copyText(text: string) {
  // 有些瀏覽器會把剪貼簿權限卡住不回應：最多等 0.6 秒，失敗就改用舊方法
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error('timeout')), 600)),
      ]);
      return;
    } catch {
      /* 改用下面的舊方法 */
    }
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

document.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-copy]');
  if (!btn) return;
  await copyText(btn.dataset.copy || '');
  btn.classList.add('is-copied');
  const live = btn.querySelector<HTMLElement>('[data-copy-label]');
  const prev = live?.textContent;
  if (live) live.textContent = '已複製';
  window.setTimeout(() => {
    btn.classList.remove('is-copied');
    if (live && prev) live.textContent = prev;
  }, 1600);
});

/* ------------------------------------------------------------
   伺服器時鐘（台灣時間）
   ------------------------------------------------------------ */
const clocks = document.querySelectorAll<HTMLElement>('[data-server-clock]');
if (clocks.length) {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const tick = () => {
    const s = f.format(new Date());
    clocks.forEach((c) => (c.textContent = s));
  };
  tick();
  window.setInterval(tick, 1000);
}
