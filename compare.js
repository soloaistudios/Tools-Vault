(() => {
  const STORAGE_KEY = 'toolVaultCompare';
  const MAX_TOOLS = 3;
  const getData = () => Array.isArray(window.toolVault?.TOOL_DATA)
    ? window.toolVault.TOOL_DATA
    : (Array.isArray(window.TOOL_DATA) ? window.TOOL_DATA : []);
  const getCompareData = () => window.toolVault?.TOOL_COMPARE || {};
  const findTool = id => getData().find(tool => String(tool.id).toLowerCase() === String(id).toLowerCase());

  const readSelection = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter((id, index, list) => typeof id === 'string' && list.indexOf(id) === index && !!findTool(id)).slice(0, MAX_TOOLS);
    } catch (_) {
      return [];
    }
  };

  const writeSelection = selection => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selection)); } catch (_) {}
  };

  const urlToolIds = new URLSearchParams(location.search).get('tools');
  let selection = readSelection();
  if (urlToolIds && location.pathname.toLowerCase().endsWith('/compare.html')) {
    const fromUrl = urlToolIds.split(',').map(item => decodeURIComponent(item).trim().toLowerCase()).filter(Boolean);
    const validFromUrl = fromUrl.filter((id, index, list) => !!findTool(id) && list.indexOf(id) === index).slice(0, MAX_TOOLS);
    if (validFromUrl.length) {
      selection = validFromUrl;
      writeSelection(selection);
    }
  }

  const escapeHTML = (value='') => String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');

  const logo = tool => typeof window.toolVault?.logoMarkup === 'function'
    ? window.toolVault.logoMarkup(tool, 'compare-logo')
    : `<div class="tool-logo compare-logo"><span>${escapeHTML(tool.name.charAt(0))}</span></div>`;

  const renderBar = () => {
    document.getElementById('compareBar')?.remove();
    document.body.classList.toggle('compare-selection-active', selection.length > 0);
    if (!selection.length) return;

    const tools = selection.map(findTool).filter(Boolean);
    const bar = document.createElement('aside');
    bar.id = 'compareBar';
    bar.className = 'compare-bar';
    bar.setAttribute('aria-label', 'Selected tools for comparison');
    bar.innerHTML = `
      <div class="compare-bar-inner">
        <div class="compare-bar-title">
          <span class="eyebrow">COMPARE</span>
          <strong>${tools.length} of ${MAX_TOOLS} tools selected</strong>
        </div>
        <div class="compare-bar-tools">
          ${tools.map(tool => `
            <button type="button" class="compare-mini-item" data-compare-remove="${escapeHTML(tool.id)}" aria-label="Remove ${escapeHTML(tool.name)} from comparison">
              ${logo(tool)}
              <span>${escapeHTML(tool.name)}</span>
              <b>×</b>
            </button>`).join('')}
        </div>
        <div class="compare-bar-actions">
          <button type="button" class="btn btn-outline btn-small" data-compare-clear>Clear</button>
          <a class="btn btn-primary btn-small" href="compare.html?tools=${encodeURIComponent(selection.join(','))}#compare-results">${selection.length >= 2 ? 'See Comparison' : 'Add Another Tool'} <span>↓</span></a>
        </div>
      </div>`;
    document.body.appendChild(bar);
  };

  const syncButtons = () => {
    document.querySelectorAll('[data-compare-id]').forEach(button => {
      const id = button.getAttribute('data-compare-id');
      const active = selection.includes(id);
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
      button.innerHTML = active ? '✓ Selected' : '＋ Compare';
    });
    document.querySelectorAll('[data-compare-pick]').forEach(input => {
      input.checked = selection.includes(input.value);
      input.closest('.compare-picker-card')?.classList.toggle('is-selected', input.checked);
    });
    const note = document.getElementById('compareSelectionNote');
    if (note) note.textContent = `${selection.length} selected`;
  };

  const showToast = message => {
    document.getElementById('compareToast')?.remove();
    const toast = document.createElement('div');
    toast.id = 'compareToast';
    toast.className = 'compare-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 180);
    }, 2200);
  };

  const select = id => {
    if (!findTool(id)) return;
    if (selection.includes(id)) {
      selection = selection.filter(item => item !== id);
      writeSelection(selection);
      refresh();
      return;
    }
    if (selection.length >= MAX_TOOLS) {
      showToast(`You can compare up to ${MAX_TOOLS} tools at once.`);
      return;
    }
    selection = [...selection, id];
    writeSelection(selection);
    refresh();
  };

  const refresh = () => {
    syncButtons();
    renderBar();
    if (typeof window.renderComparePage === 'function') window.renderComparePage(selection);
  };

  const goToCompare = () => {
    const query = selection.length ? `?tools=${encodeURIComponent(selection.join(','))}#compare-results` : '';
    const compareUrl = new URL(`compare.html${query}`, document.baseURI).href;
    window.location.assign(compareUrl);
  };

  // Capture comparison clicks before any surrounding/global navigation handler.
  // This prevents a compare control from falling through to another link (such as Contact).
  document.addEventListener('click', event => {
    const target = event.target;
    const button = target?.closest?.('[data-compare-id]');
    if (button) {
      event.preventDefault();
      event.stopPropagation();
      select(button.getAttribute('data-compare-id'));
      return;
    }

    const startCompare = target?.closest?.('[data-compare-submit]');
    if (startCompare) {
      event.preventDefault();
      event.stopPropagation();
      if (selection.length < 2) {
        showToast('Select at least 2 tools to compare.');
        return;
      }
      goToCompare();
      return;
    }

    const compareLink = target?.closest?.('a[href]');
    if (compareLink) {
      const url = new URL(compareLink.getAttribute('href') || '', document.baseURI);
      if (url.pathname.toLowerCase().endsWith('/compare.html')) {
        event.preventDefault();
        event.stopPropagation();
        const query = url.search || (selection.length ? `?tools=${encodeURIComponent(selection.join(','))}` : '');
        const hash = url.hash || (selection.length >= 2 ? '#compare-results' : '');
        window.location.assign(new URL(`compare.html${query}${hash}`, document.baseURI).href);
        return;
      }
    }

    const remove = target?.closest?.('[data-compare-remove]');
    if (remove) {
      event.preventDefault();
      event.stopPropagation();
      select(remove.getAttribute('data-compare-remove'));
      return;
    }

    const clear = target?.closest?.('[data-compare-clear]');
    if (clear) {
      event.preventDefault();
      event.stopPropagation();
      selection = [];
      writeSelection(selection);
      refresh();
    }
  }, true);

  window.toolVaultCompare = {
    getSelection: () => [...selection],
    setSelection: ids => {
      selection = ids.filter(id => !!findTool(id)).slice(0, MAX_TOOLS);
      writeSelection(selection);
      refresh();
    },
    select
  };

  refresh();
})();
