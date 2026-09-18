(() => {
  const dl = window.dataLayer = window.dataLayer || [];
  const gaId = String(window.TOOLVAULT_GA4_ID || '').trim();
  let gaReady = false;

  const track = (name, params = {}) => {
    const payload = {
      event: name,
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
      ...params
    };
    dl.push(payload);
    if (gaReady && typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  };

  // GA4 is opt-in: no third-party analytics script is loaded until an ID exists.
  if (/^G-[A-Z0-9]+$/i.test(gaId)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', gaId, { anonymize_ip: true });
      gaReady = true;
    };
    script.onerror = () => { gaReady = false; };
    document.head.appendChild(script);
  }

  window.toolVaultAnalytics = { track };
  track('page_view');

  document.addEventListener('click', event => {
    const affiliate = event.target.closest('.affiliate-link');
    if (affiliate) {
      track('affiliate_click', {
        tool_id: affiliate.dataset.toolId || '',
        destination_type: affiliate.dataset.affiliateUrl ? 'affiliate' : 'official_fallback'
      });
      return;
    }

    const toolLink = event.target.closest('a[href*="tool.html?id="]');
    if (toolLink) {
      const id = new URL(toolLink.href, location.href).searchParams.get('id') || '';
      track('tool_detail_click', { tool_id: id });
      return;
    }

    const compare = event.target.closest('[data-compare-id]');
    if (compare) {
      track('compare_interaction', { tool_id: compare.dataset.compareId || '' });
      return;
    }

    const compareSubmit = event.target.closest('[data-compare-submit]');
    if (compareSubmit) {
      track('compare_run');
      return;
    }

    const headerCta = event.target.closest('.header-cta, .hero-search button, .cta-button');
    if (headerCta) track('primary_cta_click', { cta_text: headerCta.textContent.trim().slice(0, 80) });
  }, { passive: true });
})();
