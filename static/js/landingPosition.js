// Run in the head before the browser restores a stale chat anchor/scroll position.
(() => {
  if (location.hash === '#chatbot') {
    const url = new URL(location.href);
    url.hash = 'hero';
    history.replaceState(history.state, '', url);
  }
  if (!location.hash || location.hash === '#hero') {
    history.scrollRestoration = 'manual';
    document.addEventListener('DOMContentLoaded', () => {
      // An intentional section link clicked during loading still takes precedence.
      if (!location.hash || location.hash === '#hero') {
        window.scrollTo({top: 0, left: 0, behavior: 'instant'});
      }
    }, {once: true});
  }
})();
