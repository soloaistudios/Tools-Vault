(() => {
  document.addEventListener('click', event => {
    const link = event.target.closest('.affiliate-link');
    if (!link) return;

    const url = link.dataset.affiliateUrl || '';

    // When an affiliate URL is configured, open the tracked partner URL.
    // When it is not configured yet, keep the official product URL usable.
    if (!url) return;

    try {
      link.href = url;
      link.target = '_blank';
      link.rel = 'sponsored nofollow noopener';
    } catch (_) {
      // Leave the existing link intact if browser restrictions apply.
    }
  });
})();
