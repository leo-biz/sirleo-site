(function() {
  const savedTheme = localStorage.getItem('sl-theme') || 'dark';
  if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

  const LINKS = [
    { href: '/', label: 'Home' },
    { href: '/sessions', label: 'Sessions' },
    { href: '/events', label: 'Events' },
    { href: '/education', label: 'Education' },
    { href: '/#connect', label: 'Contact', homeHref: '#connect' },
  ];

  function isHome() {
    return ['/', '/index.html', ''].includes(window.location.pathname);
  }

  function linkHref(link) {
    return link.homeHref && isHome() ? link.homeHref : link.href;
  }

  function renderNav(host) {
    const ctaLabel = host.dataset.navCtaLabel || 'Book';
    const ctaId = host.dataset.navCtaId || 'nav-book-btn';
    const ctaHref = host.dataset.navCtaHref || '';
    const cta = ctaHref
      ? `<a class="nav-cta" id="${ctaId}" href="${ctaHref}">${ctaLabel}</a>`
      : `<button class="nav-cta" id="${ctaId}" type="button">${ctaLabel}</button>`;

    host.outerHTML = `
      <nav id="nav">
        <a href="/" class="nav-logo"><img src="assets/logo.png" alt="Sir Leo" class="nav-logo-img"></a>
        <ul class="nav-links">
          ${LINKS.map(link => `<li><a href="${linkHref(link)}">${link.label}</a></li>`).join('')}
        </ul>
        <button class="nav-theme" id="theme-toggle" type="button" aria-label="Toggle theme">◐</button>
        ${cta}
      </nav>
    `;
  }

  function wireThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const setIcon = () => {
      btn.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '◑' : '◐';
    };

    setIcon();
    btn.addEventListener('click', () => {
      const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
      document.documentElement.setAttribute('data-theme', isLightTheme ? 'dark' : 'light');
      localStorage.setItem('sl-theme', isLightTheme ? 'dark' : 'light');
      setIcon();
    });
  }

  document.querySelectorAll('[data-site-nav]').forEach(renderNav);
  wireThemeToggle();
})();
