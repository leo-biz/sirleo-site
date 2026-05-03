(function() {
  const PROD_HOSTS = ['sirleo-site.netlify.app', 'sirblackleo.com', 'www.sirblackleo.com', 'sirleo.com', 'www.sirleo.com'];

  function sourcePage(pathname) {
    return (pathname || window.location.pathname).replace(/^\/+|\/+$|\.html$/g, '') || 'home';
  }

  window.SLConfig = {
    PROD_HOSTS,
    isTestEnv: () => !PROD_HOSTS.includes(window.location.hostname),
    sourcePage,
  };
})();
