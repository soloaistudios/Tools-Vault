(() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Skip link for keyboard users.
  if (!qs('.skip-to-content')) {
    const skip = document.createElement('a');
    skip.className = 'skip-to-content';
    skip.href = '#main-content';
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);
  }
  const main = qs('main');
  if (main && !main.id) main.id = 'main-content';

  // Mark the current navigation item for assistive technology.
  qsa('.nav-link.active, .mobile-nav-link.active').forEach(link => {
    link.setAttribute('aria-current', 'page');
  });

  // Improve native mobile menu semantics.
  const menuButton = qs('.mobile-menu-toggle');
  const mobileNav = qs('.mobile-nav');
  if (menuButton && mobileNav) {
    const id = mobileNav.id || 'mobile-navigation';
    mobileNav.id = id;
    menuButton.setAttribute('aria-controls', id);
    mobileNav.setAttribute('role', 'navigation');
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      if (!open) setTimeout(() => qs('.mobile-nav-link', mobileNav)?.focus(), 0);
    });
    qsa('.mobile-nav-link, .mobile-nav .btn', mobileNav).forEach(link => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        mobileNav.classList.remove('open');
      });
    });
  }

  // Give the search overlay dialog semantics and restore focus on close.
  const overlay = qs('.search-overlay');
  const searchToggle = qs('.search-toggle');
  const searchClose = qs('.search-close');
  if (overlay) {
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'search-dialog-title');
    const heading = qs('h2', overlay);
    if (heading) heading.id = 'search-dialog-title';
    const observer = new MutationObserver(() => {
      const open = overlay.classList.contains('open');
      if (open) searchClose?.focus();
      else searchToggle?.focus();
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }

  // External destinations always retain safe opener behavior.
  qsa('a[target="_blank"]').forEach(link => {
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
  });

  // Make non-critical sections cheaper to render on long pages.
  if ('contentVisibility' in document.documentElement.style) {
    qsa('.categories-section,.featured-section,.trust-section,.cta-section,.tools-marketplace-section,.blog-section,.content-section,.detail-section-block,.related-section,.compare-section').forEach(section => {
      section.style.contentVisibility = 'auto';
      section.style.containIntrinsicSize = '1px 420px';
    });
  }

  // Avoid stale service-worker assets after a newly deployed build.
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'TOOLVAULT_BUILD_CHECK', build: 'v10' });
  }
})();
