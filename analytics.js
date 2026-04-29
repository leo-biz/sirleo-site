(function() {

  // ── Session ID ──
  let sid = sessionStorage.getItem('sl_sid');
  if (!sid) {
    sid = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
    sessionStorage.setItem('sl_sid', sid);
  }
  window.SL_SESSION = sid;

  // ── Return visit ──
  const isReturn = !!localStorage.getItem('sl_visited');
  localStorage.setItem('sl_visited', '1');

  // ── UTM capture — persist for session ──
  const urlParams = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const freshUtm = {};
  utmKeys.forEach(k => { if (urlParams.get(k)) freshUtm[k] = urlParams.get(k); });
  if (Object.keys(freshUtm).length) sessionStorage.setItem('sl_utm', JSON.stringify(freshUtm));
  const utm = JSON.parse(sessionStorage.getItem('sl_utm') || '{}');
  window.SL_UTM = utm;

  // ── Referrer source — fallback when no UTM ──
  const parseReferrer = (ref) => {
    if (!ref) return 'direct';
    try {
      const host = new URL(ref).hostname.replace('www.', '').replace('l.', '');
      if (host.includes('instagram')) return 'instagram';
      if (host.includes('facebook') || host.includes('fb.')) return 'facebook';
      if (host.includes('twitter') || host.includes('t.co') || host.includes('x.com')) return 'twitter';
      if (host.includes('tiktok')) return 'tiktok';
      if (host.includes('google')) return 'google';
      if (host.includes('bing')) return 'bing';
      if (host.includes('linktr')) return 'linktree';
      return host;
    } catch { return 'unknown'; }
  };
  if (!sessionStorage.getItem('sl_source')) {
    const src = utm.utm_source || parseReferrer(document.referrer);
    sessionStorage.setItem('sl_source', src);
  }
  window.SL_SOURCE = sessionStorage.getItem('sl_source');

  // ── Geo fetch ──
  let geo = {};
  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(d => { geo = { ip: d.ip, city: d.city, region: d.region, country: d.country_name }; })
    .catch(() => {});

  // ── Core track ──
  function track(eventType, element, extra) {
    if (!window.SLDb) return;
    window.SLDb.from('analytics').insert({
      session_id: sid,
      event_type: eventType,
      element: element || null,
      page: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      ip:      geo.ip      || null,
      city:    geo.city    || null,
      region:  geo.region  || null,
      country: geo.country || null,
      data: extra ? { ...extra, ...( Object.keys(utm).length ? { utm } : {} ) } : ( Object.keys(utm).length ? { utm } : null ),
    });
  }
  window.SLAnalytics = { track };

  // ── Pageview ──
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => track('pageview', null, {
      screen: screen.width + 'x' + screen.height,
      lang: navigator.language,
      return_visit: isReturn,
    }), 800);
  });

  // ── Scroll depth ──
  const depthsFired = new Set();
  window.addEventListener('scroll', () => {
    const pct = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
    [25, 50, 75, 100].forEach(d => {
      if (pct >= d && !depthsFired.has(d)) {
        depthsFired.add(d);
        track('scroll_depth', d + '%');
      }
    });
  }, { passive: true });

  // ── Time on page ──
  const pageStart = Date.now();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      track('time_on_page', null, { seconds: Math.round((Date.now() - pageStart) / 1000) });
    }
  });

  // ── Click tracking ──
  const IGNORE = new Set(['INPUT','TEXTAREA','SELECT','LABEL']);
  document.addEventListener('click', e => {
    if (IGNORE.has(e.target.tagName)) return;
    const el = e.target.closest([
      'button','a','.offering','.serve-item',
      '.hub-panel-option','.hub-submit','.hub-back',
      '.nav-cta','.nav-logo','.connect-social','.footer-ig',
    ].join(','));
    if (!el) return;
    const label =
      el.id ||
      el.dataset.step || el.dataset.book ||
      el.querySelector('.offering-title,.serve-name,.hub-card-label')?.textContent?.trim() ||
      el.getAttribute('aria-label') ||
      el.textContent?.trim().replace(/\s+/g,' ').slice(0, 80) ||
      'unknown';
    const section = e.target.closest('section,nav,footer')?.id || null;
    track('click', label, section ? { section } : null);
  });

})();
