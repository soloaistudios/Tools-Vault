(() => {
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];

  qsa('#currentYear').forEach(el => { el.textContent = new Date().getFullYear(); });

  const menuButton = qs('.mobile-menu-toggle');
  const mobileNav = qs('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      mobileNav.setAttribute('aria-hidden', String(!open));
    });
  }

  qsa('.dropdown-trigger').forEach(button => {
    button.addEventListener('click', () => {
      const wrap = button.closest('.nav-dropdown');
      const open = wrap.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  });

  document.addEventListener('click', event => {
    qsa('.nav-dropdown.open').forEach(drop => {
      if (!drop.contains(event.target)) {
        drop.classList.remove('open');
        const trigger = qs('.dropdown-trigger', drop);
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const overlay = qs('.search-overlay');
  const openSearch = () => {
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => qs('#globalSearchInput')?.focus(), 80);
  };
  const closeSearch = () => {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  };
  qsa('.search-toggle').forEach(btn => btn.addEventListener('click', openSearch));
  qs('.search-close')?.addEventListener('click', closeSearch);
  qs('.search-overlay-backdrop')?.addEventListener('click', closeSearch);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSearch(); });
})();
