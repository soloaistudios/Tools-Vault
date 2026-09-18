(() => {
  const path = location.pathname.toLowerCase();
  const qs = new URLSearchParams(location.search);
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const manifestHref = document.querySelector('link[rel="manifest"]')?.href;
  const siteBase = manifestHref ? new URL('.', manifestHref).href : new URL('.', location.href).href;
  const makeUrl = (p = '') => new URL(String(p).replace(/^\/+/, ''), siteBase).href;
  const pageUrl = new URL(location.href); pageUrl.hash = '';
  const pageUrlNoQuery = new URL(pageUrl); pageUrlNoQuery.search = '';
  const pageAbsoluteUrl = pageUrl.href;
  const setMeta = (key, value, attr = 'name') => {
    if (!value) return;
    let node = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(attr, key);
      document.head.appendChild(node);
    }
    node.setAttribute('content', value);
  };
  const setLink = (rel, href) => {
    let node = document.head.querySelector(`link[rel="${rel}"]`);
    if (!node) {
      node = document.createElement('link');
      node.rel = rel;
      node.setAttribute('rel', rel);
      document.head.appendChild(node);
    }
    node.href = href;
    node.setAttribute('href', href);
  };
  const setJsonLd = id => {
    let node = document.getElementById(id);
    if (!node) {
      node = document.createElement('script');
      node.type = 'application/ld+json';
      node.id = id;
      document.head.appendChild(node);
    }
    return node;
  };

  const baseTitle = document.title || 'ToolVault';
  const description = document.querySelector('meta[name="description"]')?.content || 'ToolVault curates software for building, marketing, automating, and growing an online business.';
  const canonical = path.endsWith('tool.html') ? pageAbsoluteUrl : ((currentPage === 'index.html' || currentPage === '') ? siteBase : pageUrlNoQuery.href);
  setLink('canonical', canonical);

  setMeta('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  setMeta('author', 'ToolVault');
  setMeta('color-scheme', 'dark');
  setMeta('og:type', 'website', 'property');
  setMeta('og:title', baseTitle, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:url', canonical, 'property');
  setMeta('twitter:card', 'summary');
  setMeta('twitter:title', baseTitle);
  setMeta('twitter:description', description);

  const toolData = Array.isArray(window.toolVault?.TOOL_DATA)
    ? window.toolVault.TOOL_DATA
    : (Array.isArray(window.TOOL_DATA) ? window.TOOL_DATA : []);

  if (path.endsWith('tool.html') && toolData.length) {
    const id = (qs.get('id') || '').trim().toLowerCase();
    const tool = toolData.find(item => String(item.id).toLowerCase() === id) || toolData[0];
    if (tool) {
      const title = `${tool.name} — ToolVault`;
      document.title = title;
      setMeta('description', `${tool.name}: ${tool.tagline || tool.description || 'ToolVault product guide and comparison.'}`);
      setMeta('og:title', title, 'property');
      setMeta('og:description', tool.description || description, 'property');
      setMeta('og:url', canonical, 'property');
      setMeta('twitter:title', title);
      setMeta('twitter:description', tool.description || description);

      const graph = [
        {
          '@type': 'SoftwareApplication',
          '@id': `${canonical}#software`,
          name: tool.name,
          description: tool.description,
          applicationCategory: tool.categoryLabel || 'Software',
          operatingSystem: 'Web',
          url: canonical
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonical}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ToolVault', item: makeUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'All Tools', item: makeUrl('/tools.html') },
            { '@type': 'ListItem', position: 3, name: tool.name, item: canonical }
          ]
        }
      ];
      setJsonLd('toolvault-structured-data').textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    }
  } else if (path.endsWith('index.html') || currentPage === 'index.html') {
    setJsonLd('toolvault-structured-data').textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': `${siteBase}#website`, name: 'ToolVault', url: siteBase, description },
        { '@type': 'Organization', '@id': `${siteBase}#organization`, name: 'ToolVault', url: siteBase }
      ]
    });
  }
})();
