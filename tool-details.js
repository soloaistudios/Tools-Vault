(() => {
  const target = document.getElementById('toolDetail');
  if (!target) return;

  const data = Array.isArray(window.toolVault?.TOOL_DATA)
    ? window.toolVault.TOOL_DATA
    : (Array.isArray(window.TOOL_DATA)
      ? window.TOOL_DATA
      : (typeof TOOL_DATA !== 'undefined' && Array.isArray(TOOL_DATA) ? TOOL_DATA : []));
  if (!Array.isArray(data) || !data.length) {
    target.innerHTML = `
      <div class="content-card tool-not-found">
        <span class="eyebrow">CATALOG UNAVAILABLE</span>
        <h2>We couldn't load the tool catalog.</h2>
        <p>Please refresh the page and try again.</p>
        <a class="btn btn-primary" href="tools.html">Browse All Tools</a>
      </div>`;
    return;
  }

  const escapeHTML = (value='') => String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');

  const safeUrl = (value='') => {
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
    } catch (_) {
      return '#';
    }
  };

  const requestedId = new URLSearchParams(location.search).get('id');
  const id = requestedId ? requestedId.trim().toLowerCase() : data[0]?.id;
  const tool = data.find(item => String(item.id).toLowerCase() === id);

  if (!tool) {
    target.innerHTML = `
      <div class="content-card tool-not-found">
        <span class="eyebrow">TOOL NOT FOUND</span>
        <h2>We couldn't find that tool.</h2>
        <p>The requested product isn't currently in our catalog.</p>
        <a class="btn btn-primary" href="tools.html">Browse All Tools</a>
      </div>`;
    return;
  }

  document.title = `${tool.name} — ToolVault`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', `${tool.name}: what it does, who it is for, key features, how to use it, considerations, FAQs, and official links.`);

  const primaryUrl = safeUrl(tool.affiliateUrl || tool.officialUrl);
  const officialUrl = safeUrl(tool.officialUrl);
  const ctaLabel = tool.affiliateUrl ? 'Get Started' : 'Visit Official Site';
  const sourceLabel = tool.affiliateUrl ? 'Partner tracking enabled' : 'Official product link shown';

  const featureCards = tool.features.map((item, index) => `
    <article class="detail-feature-card">
      <span class="detail-number">${String(index + 1).padStart(2,'0')}</span>
      <h3>${escapeHTML(item)}</h3>
      <p>${escapeHTML(tool.useCases[index % tool.useCases.length])}</p>
    </article>`).join('');

  const useCaseCards = tool.useCases.map(item => `
    <li><span>✓</span>${escapeHTML(item)}</li>`).join('');

  const audienceCards = tool.whoItsFor.map(item => `
    <span class="audience-pill">${escapeHTML(item)}</span>`).join('');

  const steps = tool.howToUse.map((step, index) => `
    <article class="how-step">
      <span class="how-step-number">${index + 1}</span>
      <div>
        <h3>${escapeHTML(step.title)}</h3>
        <p>${escapeHTML(step.text)}</p>
      </div>
    </article>`).join('');

  const considerations = tool.considerations.map(item => `
    <li><span>•</span>${escapeHTML(item)}</li>`).join('');

  const faq = tool.faq.map((item, index) => `
    <details class="faq-item" ${index === 0 ? 'open' : ''}>
      <summary>${escapeHTML(item.q)}<span>+</span></summary>
      <p>${escapeHTML(item.a)}</p>
    </details>`).join('');

  const related = data
    .filter(item => item.id !== tool.id && (item.category === tool.category || item.popular))
    .slice(0, 3)
    .map(item => `
      <a class="related-tool-card" href="tool.html?id=${encodeURIComponent(item.id)}">
        ${window.toolVault.logoMarkup(item)}
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <small>${escapeHTML(item.categoryLabel)}</small>
        </div>
        <span>→</span>
      </a>`).join('');

  target.innerHTML = `
    <div class="tool-detail-page">
      <section class="tool-detail-hero detail-hero-card">
        <div class="detail-hero-brand">
          ${window.toolVault.logoMarkup(tool, 'detail-logo')}
          <span class="detail-logo-caption">${escapeHTML(tool.categoryLabel)}</span>
          <span class="detail-verified">Checked ${escapeHTML(tool.verifiedOn || 'recently')}</span>
        </div>

        <div class="detail-hero-copy">
          <div class="detail-kicker">
            <span class="tool-category-badge">${escapeHTML(tool.categoryLabel)}</span>
            ${tool.featured ? '<span class="tool-category-badge featured-badge">Featured</span>' : ''}
          </div>
          <h1 class="detail-title">${escapeHTML(tool.name)}</h1>
          <p class="detail-tagline">${escapeHTML(tool.tagline)}</p>
          <p class="detail-description">${escapeHTML(tool.description)}</p>
          <div class="detail-actions">
            <a class="btn btn-primary affiliate-link" href="${escapeHTML(primaryUrl)}" data-affiliate-url="${escapeHTML(tool.affiliateUrl || '')}" data-tool-id="${escapeHTML(tool.id)}" target="_blank" rel="nofollow noopener">${ctaLabel} <span>↗</span></a>
            <a class="btn btn-outline" href="${escapeHTML(officialUrl)}" target="_blank" rel="nofollow noopener">Official Site <span>↗</span></a>
            <a class="btn btn-outline" href="tools.html">Browse Similar Tools</a>
            <button type="button" class="btn btn-outline compare-button" data-compare-id="${escapeHTML(tool.id)}" aria-pressed="false">＋ Compare</button>
          </div>
          <p class="detail-disclosure">${escapeHTML(sourceLabel)}. Product information, plans, pricing, and terms can change; confirm the current offer on the provider's site.</p>
        </div>
      </section>

      <section class="detail-intro-grid">
        <div class="detail-panel detail-overview-panel">
          <span class="eyebrow">AT A GLANCE</span>
          <h2>Why this tool deserves a closer look</h2>
          <p>${escapeHTML(tool.overview)}</p>
        </div>
        <div class="detail-panel detail-usecase-panel">
          <span class="eyebrow">GOOD FIT FOR</span>
          <h2>Where it can fit into your workflow</h2>
          <ul class="use-case-list">${useCaseCards}</ul>
        </div>
      </section>

      <section class="detail-section-block">
        <div class="section-heading">
          <span class="eyebrow">CORE CAPABILITIES</span>
          <h2>What you can actually do with ${escapeHTML(tool.name)}</h2>
          <p>These are the practical capabilities we checked against the provider's current product information.</p>
        </div>
        <div class="detail-feature-grid">${featureCards}</div>
      </section>

      <section class="detail-section-block audience-section">
        <div class="section-heading">
          <span class="eyebrow">WHO IT'S FOR</span>
          <h2>Who is most likely to get value from it?</h2>
        </div>
        <div class="audience-pills">${audienceCards}</div>
      </section>

      <section class="detail-section-block how-to-section">
        <div class="section-heading">
          <span class="eyebrow">HOW TO USE IT</span>
          <h2>A practical path from setup to first result</h2>
          <p>Use this as a starting workflow. The exact screens and options can change as the provider updates the product.</p>
        </div>
        <div class="how-steps">${steps}</div>
      </section>

      <section class="detail-section-block pricing-detail-section">
        <div class="detail-panel pricing-detail-panel">
          <div>
            <span class="eyebrow">PRICING &amp; PLAN CHECK</span>
            <h2>Check the live offer before you subscribe</h2>
            <p>${escapeHTML(tool.pricingNote)}</p>
          </div>
          <a class="btn btn-primary" href="${escapeHTML(officialUrl)}" target="_blank" rel="nofollow noopener">See Current Plans <span>↗</span></a>
        </div>
      </section>

      <section class="detail-section-block considerations-grid">
        <div class="detail-panel">
          <span class="eyebrow">BEFORE YOU BUY</span>
          <h2>Things worth considering</h2>
          <ul class="consideration-list">${considerations}</ul>
        </div>
        <div class="detail-panel decision-panel">
          <span class="eyebrow">NEXT STEP</span>
          <h2>Explore the provider's current offer</h2>
          <p>We explain the product here so you can make a more informed decision. The provider's website remains the source for current pricing, availability, terms, and checkout.</p>
          <a class="btn btn-primary affiliate-link" href="${escapeHTML(primaryUrl)}" data-affiliate-url="${escapeHTML(tool.affiliateUrl || '')}" data-tool-id="${escapeHTML(tool.id)}" target="_blank" rel="nofollow noopener">${ctaLabel} <span>↗</span></a>
          <small class="decision-note">We may earn a commission from qualifying affiliate links at no additional cost to you.</small>
        </div>
      </section>

      <section class="detail-section-block faq-section">
        <div class="section-heading">
          <span class="eyebrow">FAQ</span>
          <h2>Questions buyers commonly ask</h2>
        </div>
        <div class="faq-list">${faq}</div>
      </section>

      ${related ? `
      <section class="detail-section-block related-section">
        <div class="section-heading-row">
          <div class="section-heading">
            <span class="eyebrow">KEEP EXPLORING</span>
            <h2>Related tools</h2>
          </div>
          <a class="text-link" href="tools.html">View All Tools <span>→</span></a>
        </div>
        <div class="related-tools-grid">${related}</div>
      </section>` : ''}

      <section class="detail-source-section">
        <div class="detail-source-box">
          <div>
            <span class="eyebrow">PRODUCT SOURCE</span>
            <p>ToolVault checked the provider's public product information on ${escapeHTML(tool.verifiedOn || 'the listed date')} for the capability summary above.</p>
          </div>
          <a class="text-link" href="${escapeHTML(safeUrl(tool.sourceUrl || tool.officialUrl))}" target="_blank" rel="nofollow noopener">View source <span>↗</span></a>
        </div>
      </section>
    </div>`;
})();
