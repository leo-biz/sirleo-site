// ── Footer version (injected by build script) ──
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('.footer-version');
  if (el && window.SL_VERSION) el.textContent = window.SL_VERSION;
});

// ── Theme preload ──
(function() {
  const saved = localStorage.getItem('sl-theme') || 'dark';
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
})();

// ── Nav scroll state ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Scroll reveal ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
  .forEach(el => observer.observe(el));

// ── Smooth scroll for nav anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── Hero button wiring (hub not ready yet, so defer) ──
function wireHeroButtons() {
  document.getElementById('nav-book-btn')?.addEventListener('click', () => window.SLHub?.open('book'));
  document.getElementById('hero-book-btn')?.addEventListener('click', () => window.SLHub?.open('book'));
  document.getElementById('hero-explore-btn')?.addEventListener('click', () => {
    document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('waitlist-btn')?.addEventListener('click', () => window.SLHub?.open('waitlist'));
}
document.addEventListener('DOMContentLoaded', wireHeroButtons);

// ── Offerings — click to open relevant wizard step ──
document.querySelectorAll('.offering[data-step]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const step = card.dataset.step;
    const sels = card.dataset.sels ? [card.dataset.sels] : [];
    window.SLHub?.open('book', { step, sels });
  });
});

// ── Legacy Who I Serve links on dedicated pages ──
const servePageMap = {
  'serve-individuals': '/sessions?open',
  'serve-organizers':  '/events?open',
};
document.querySelectorAll('.serve-item[data-book]').forEach(item => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => {
    const dest = servePageMap[item.dataset.book];
    if (dest) window.location.href = dest;
  });
});

document.querySelectorAll('[data-hub-panel]').forEach(item => {
  item.addEventListener('click', () => {
    const context = item.dataset.hubWho ? { who: item.dataset.hubWho } : {};
    window.SLHub?.open(item.dataset.hubPanel, context);
  });
});

// ── Auto-popup: first visit, after 20% scroll ──
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('sl_submitted') || sessionStorage.getItem('sl_popup_seen')) return;
  let scrolled = false, fired = false;
  function checkScroll() {
    if (scrolled) return;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = window.scrollY / maxScroll * 100;
    if (pct >= 20) { scrolled = true; tryOpen(); }
  }
  function tryOpen() {
    if (fired || !scrolled) return;
    if (!window.SLHub) {
      setTimeout(tryOpen, 100);
      return;
    }
    fired = true;
    sessionStorage.setItem('sl_popup_seen', '1');
    window.SLHub.open('contact');
  }
  checkScroll();
  window.addEventListener('scroll', checkScroll, { passive: true });
});

// ── Custom cursor ──
(function() {
  const dot  = document.getElementById('sl-cursor');
  const ring = document.getElementById('sl-cursor-ring');
  if (!dot || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button')) {
      ring.style.width = '48px'; ring.style.height = '48px';
      dot.style.transform = 'translate(-50%,-50%) scale(1.5)';
    } else {
      ring.style.width = '32px'; ring.style.height = '32px';
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
    }
  });
})();
