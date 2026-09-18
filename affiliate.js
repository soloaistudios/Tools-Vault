(() => {
  const normalize = link => {
    const hasAffiliate = Boolean(link.dataset.affiliateUrl);
    if (hasAffiliate) {
      link.href = link.dataset.affiliateUrl;
      link.target = '_blank';
      link.rel = 'sponsored nofollow noopener noreferrer';
      link.dataset.linkType = 'affiliate';
    } else {
      link.dataset.linkType = 'official';
    }
  };

  document.querySelectorAll('.affiliate-link').forEach(normalize);

  document.addEventListener('click', event => {
    const link = event.target.closest('.affiliate-link');
    if (!link) return;
    normalize(link);
    window.toolVaultAnalytics?.track?.('affiliate_cta_click', {
      tool_id: link.dataset.toolId || '',
      link_type: link.dataset.linkType || 'official'
    });
  }, { passive: true });
})();
