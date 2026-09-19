(() => {
  const STORAGE_KEY = 'toolVaultCompare';
  const MAX_TOOLS = 3;
  const isComparePage = /(?:^|\/)compare\.html$/i.test(location.pathname);

  let onlyDifferences = false;
  let pickerSearch = '';
  let pickerCategory = 'all';

  const getData = () => Array.isArray(window.toolVault?.TOOL_DATA)
    ? window.toolVault.TOOL_DATA
    : (Array.isArray(window.TOOL_DATA) ? window.TOOL_DATA : []);

  const findTool = id => getData().find(
    tool => String(tool.id).toLowerCase() === String(id).toLowerCase()
  );

  const readSelection = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

      if (!Array.isArray(raw)) return [];

      return raw
        .filter((id, index, list) =>
          typeof id === 'string' &&
          list.indexOf(id) === index &&
          !!findTool(id)
        )
        .slice(0, MAX_TOOLS);
    } catch (_) {
      return [];
    }
  };

  const writeSelection = selection => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch (_) {}
  };

  const urlToolIds = new URLSearchParams(location.search).get('tools');

  let selection = readSelection();

  if (urlToolIds && isComparePage) {
    const fromUrl = urlToolIds
      .split(',')
      .map(item => {
        try {
          return decodeURIComponent(item).trim();
        } catch (_) {
          return '';
        }
      })
      .filter(Boolean);

    const validFromUrl = fromUrl
      .filter((id, index, list) =>
        !!findTool(id) &&
        list.indexOf(id) === index
      )
      .slice(0, MAX_TOOLS);

    if (validFromUrl.length) {
      selection = validFromUrl;
      writeSelection(selection);
    }
  }

  const escapeHTML = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const logo = tool => {
    if (typeof window.toolVault?.logoMarkup === 'function') {
      return window.toolVault.logoMarkup(tool, 'compare-logo');
    }

    const initial = escapeHTML(
      String(tool.name || '').charAt(0)
    );

    return `
      <div class="tool-logo compare-logo">
        <span>${initial}</span>
      </div>
    `;
  };

  const showToast = message => {
    document.getElementById('compareToast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'compareToast';
    toast.className = 'compare-toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');

      setTimeout(() => {
        toast.remove();
      }, 180);
    }, 2200);
  };

  const renderBar = () => {
    document.getElementById('compareBar')?.remove();

    document.body.classList.toggle(
      'compare-selection-active',
      selection.length > 0
    );

    if (!selection.length) return;

    const tools = selection
      .map(findTool)
      .filter(Boolean);

    const bar = document.createElement('aside');

    bar.id = 'compareBar';
    bar.className = 'compare-bar';
    bar.setAttribute(
      'aria-label',
      'Selected tools for comparison'
    );

    bar.innerHTML = `
      <div class="compare-bar-inner">
        <div class="compare-bar-title">
          <span class="eyebrow">COMPARE</span>
          <strong>${tools.length} of ${MAX_TOOLS} tools selected</strong>
        </div>

        <div class="compare-bar-tools">
          ${tools.map(tool => `
            <button
              type="button"
              class="compare-mini-item"
              data-compare-remove="${escapeHTML(tool.id)}"
              aria-label="Remove ${escapeHTML(tool.name)} from comparison"
            >
              ${logo(tool)}
              <span>${escapeHTML(tool.name)}</span>
              <b aria-hidden="true">×</b>
            </button>
          `).join('')}
        </div>

        <div class="compare-bar-actions">
          <button
            type="button"
            class="btn btn-outline btn-small"
            data-compare-clear
          >
            Clear
          </button>

          <button
            type="button"
            class="btn btn-primary btn-small"
            data-compare-submit
          >
            ${selection.length >= 2 ? 'See Comparison' : 'Add Another Tool'}
            <span>↓</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(bar);
  };

  const syncButtons = () => {
    document.querySelectorAll('[data-compare-id]').forEach(button => {
      const id = button.getAttribute('data-compare-id');
      const active = selection.includes(id);

      button.classList.toggle('is-selected', active);
      button.setAttribute(
        'aria-pressed',
        String(active)
      );

      button.innerHTML = active
        ? '✓ Selected'
        : '＋ Compare';
    });

    document.querySelectorAll('[data-compare-pick]').forEach(input => {
      input.checked = selection.includes(input.value);

      input.closest('.compare-picker-card')?.classList.toggle(
        'is-selected',
        input.checked
      );
    });

    const note = document.getElementById(
      'compareSelectionNote'
    );

    if (note) {
      note.textContent = `${selection.length} selected`;
    }
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
      showToast(
        `You can compare up to ${MAX_TOOLS} tools at once.`
      );
      return;
    }

    selection = [
      ...selection,
      id
    ];

    writeSelection(selection);
    refresh();
  };

  const enhanceCompareStyles = () => {
    if (
      !isComparePage ||
      document.getElementById('compareEnhancedStyles')
    ) {
      return;
    }

    const style = document.createElement('style');

    style.id = 'compareEnhancedStyles';

    style.textContent = `
      .compare-enhanced-tools{
        display:grid;
        grid-template-columns:minmax(220px,1fr) minmax(150px,220px) auto;
        gap:10px;
        align-items:center;
        margin-top:16px
      }

      .compare-enhanced-search,
      .compare-enhanced-filter{
        width:100%;
        min-width:0;
        border:1px solid var(--line);
        border-radius:12px;
        background:rgba(255,255,255,.025);
        color:#dbe4f1;
        padding:11px 12px;
        font:inherit;
        font-size:11px;
        outline:none
      }

      .compare-enhanced-search:focus,
      .compare-enhanced-filter:focus{
        border-color:rgba(123,149,255,.55);
        box-shadow:0 0 0 3px rgba(95,119,255,.08)
      }

      .compare-enhanced-filter option{
        background:#091524;
        color:#dbe4f1
      }

      .compare-picker-meta{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:center;
        margin-top:10px;
        color:#6f819b;
        font-size:10px;
        line-height:1.4
      }

      .compare-picker-card.compare-picker-hidden{
        display:none
      }

      .compare-enhanced-actions{
        display:flex;
        justify-content:flex-end;
        gap:8px;
        flex-wrap:wrap;
        margin:0 0 12px;
        padding:12px 14px;
        border:1px solid rgba(131,153,202,.14);
        border-radius:14px;
        background:rgba(255,255,255,.018)
      }

      .compare-enhanced-actions .enhanced-toggle{
        display:inline-flex;
        align-items:center;
        gap:7px;
        border:1px solid var(--line);
        border-radius:10px;
        background:#091524;
        color:#9fb0c7;
        padding:8px 10px;
        font:inherit;
        font-size:10px;
        cursor:pointer
      }

      .compare-enhanced-actions
      .enhanced-toggle[aria-pressed="true"]{
        border-color:rgba(123,149,255,.48);
        color:#c1cbff;
        background:rgba(95,119,255,.08)
      }

      .compare-enhanced-actions .enhanced-note{
        margin-right:auto;
        display:flex;
        align-items:center;
        color:#73859d;
        font-size:10px
      }

      .compare-legend{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
        margin:0;
        padding:14px 16px;
        border-top:1px solid var(--line);
        border-bottom:1px solid var(--line);
        background:rgba(255,255,255,.012)
      }

      .compare-legend-chip{
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding:5px 8px;
        border-radius:999px;
        background:rgba(255,255,255,.025);
        border:1px solid rgba(131,153,202,.14);
        color:#8496ad;
        font-size:9px
      }

      .compare-legend-chip b{
        font-size:9px;
        color:#b7c2d4
      }

      .compare-table th{
        position:sticky;
        left:0;
        z-index:3;
        background:#081320;
        box-shadow:8px 0 14px rgba(0,0,0,.08)
      }

      .compare-table td{
        background:#091524
      }

      .compare-table tr.compare-row-hidden{
        display:none
      }

      .compare-table tr.compare-row-same td{
        color:#aebbd0
      }

      .compare-table td[data-compare-state]{
        padding-top:13px;
        padding-bottom:13px
      }

      .compare-state-chip{
        display:inline-block;
        padding:4px 7px;
        border-radius:999px;
        border:1px solid rgba(131,153,202,.15);
        background:rgba(255,255,255,.02);
        font-size:9px;
        line-height:1.25
      }

      .compare-state-chip.is-core{
        color:#c4ceff;
        border-color:rgba(123,149,255,.24);
        background:rgba(95,119,255,.07)
      }

      .compare-state-chip.is-built{
        color:#b9d4c8;
        border-color:rgba(115,176,143,.2);
        background:rgba(78,130,103,.07)
      }

      .compare-state-chip.is-support{
        color:#c1cadd;
        border-color:rgba(131,153,202,.15);
        background:rgba(255,255,255,.02)
      }

      .compare-state-chip.is-muted{
        color:#667a94;
        background:transparent
      }

      .compare-page-section .compare-picker-card{
        min-width:0
      }

      @media (max-width:780px){
        .compare-enhanced-tools{
          grid-template-columns:1fr
        }

        .compare-picker-meta{
          align-items:flex-start;
          flex-direction:column
        }

        .compare-enhanced-actions{
          align-items:stretch;
          flex-direction:column
        }

        .compare-enhanced-actions .enhanced-note{
          margin-right:0
        }

        .compare-enhanced-actions .enhanced-toggle,
        .compare-enhanced-actions .btn{
          width:100%;
          justify-content:center
        }
      }
    `;

    document.head.appendChild(style);
  };

  const setupPickerEnhancements = () => {
    if (!isComparePage) return;

    const panel = document.querySelector(
      '.compare-picker-panel'
    );

    const picker = document.getElementById(
      'comparePicker'
    );

    if (!panel || !picker) return;

    enhanceCompareStyles();

    let controls = document.getElementById(
      'compareEnhancedTools'
    );

    if (!controls) {
      controls = document.createElement('div');

      controls.id = 'compareEnhancedTools';
      controls.className = 'compare-enhanced-tools';

      const search = document.createElement('input');

      search.id = 'comparePickerSearch';
      search.className = 'compare-enhanced-search';
      search.type = 'search';
      search.placeholder = 'Search tools to compare…';
      search.autocomplete = 'off';

      search.setAttribute(
        'aria-label',
        'Search tools to compare'
      );

      search.addEventListener('input', () => {
        pickerSearch = search.value
          .trim()
          .toLowerCase();

        filterPickerCards();
      });

      const filter = document.createElement('select');

      filter.id = 'comparePickerCategory';
      filter.className = 'compare-enhanced-filter';

      filter.setAttribute(
        'aria-label',
        'Filter comparison tools by category'
      );

      filter.add(
        new Option(
          'All categories',
          'all'
        )
      );

      const categories = [
        ...new Map(
          getData()
            .map(tool => [
              tool.category,
              tool.categoryLabel
            ])
            .filter(([key]) => key)
        )
      ].sort((a, b) =>
        String(a[1]).localeCompare(String(b[1]))
      );

      categories.forEach(([value, label]) => {
        filter.add(
          new Option(
            label,
            value
          )
        );
      });

      filter.addEventListener('change', () => {
        pickerCategory = filter.value;
        filterPickerCards();
      });

      const meta = document.createElement('div');

      meta.className = 'compare-picker-meta';
      meta.id = 'comparePickerMeta';

      meta.innerHTML = `
        <span>
          Filter the catalog before building your shortlist.
        </span>
        <span></span>
      `;

      controls.append(
        search,
        filter,
        document.createElement('span')
      );

      panel
        .querySelector('.compare-picker-header')
        ?.insertAdjacentElement(
          'afterend',
          controls
        );

      controls.insertAdjacentElement(
        'afterend',
        meta
      );

      window.__toolVaultCompareFilter =
        filterPickerCards;
    }

    if (window.__toolVaultCompareSearchBound) {
      filterPickerCards();
      return;
    }

    window.__toolVaultCompareSearchBound = true;

    function filterPickerCards() {
      const cards = [
        ...picker.querySelectorAll(
          '.compare-picker-card'
        )
      ];

      let visible = 0;

      cards.forEach(card => {
        const text = card.textContent
          .toLowerCase();

        const input = card.querySelector(
          '[data-compare-pick]'
        );

        const tool = input
          ? findTool(input.value)
          : null;

        const matchesSearch =
          !pickerSearch ||
          text.includes(pickerSearch);

        const matchesCategory =
          pickerCategory === 'all' ||
          tool?.category === pickerCategory;

        const show =
          matchesSearch &&
          matchesCategory;

        card.classList.toggle(
          'compare-picker-hidden',
          !show
        );

        if (show) visible += 1;
      });

      const metaCount =
        document
          .getElementById('comparePickerMeta')
          ?.querySelector('span:last-child');

      if (metaCount) {
        metaCount.textContent =
          `${visible} of ${cards.length} tools shown`;
      }
    }

    filterPickerCards();
  };

  const decorateMatrix = () => {
    if (!isComparePage) return;

    const matrix = document.querySelector(
      '.compare-matrix'
    );

    const table = matrix?.querySelector(
      '.compare-table'
    );

    if (!table) return;

    let legend = document.getElementById(
      'compareLegend'
    );

    if (!legend) {
      legend = document.createElement('div');

      legend.id = 'compareLegend';
      legend.className = 'compare-legend';

      legend.innerHTML = `
        <span class="compare-legend-chip">
          <b>Core</b>
          primary product focus
        </span>

        <span class="compare-legend-chip">
          <b>Built-in</b>
          available inside the product
        </span>

        <span class="compare-legend-chip">
          <b>Support</b>
          supporting workflow or connection
        </span>

        <span class="compare-legend-chip">
          <b>—</b>
          not presented as a core catalog capability
        </span>
      `;

      table.parentElement?.insertAdjacentElement(
        'afterend',
        legend
      );
    }

    const normalize = value =>
      String(value || '')
        .trim()
        .toLowerCase();

    [
      ...table.querySelectorAll(
        'tbody tr'
      )
    ].forEach(row => {
      const cells = [
        ...row.querySelectorAll('td')
      ];

      const values = cells.map(
        cell => normalize(cell.textContent)
      );

      const comparable =
        values.filter(
          value => value && value !== '—'
        );

      const same =
        comparable.length > 1 &&
        new Set(comparable).size === 1 &&
        comparable.length === values.length;

      row.classList.toggle(
        'compare-row-same',
        same
      );

      row.classList.toggle(
        'compare-row-hidden',
        onlyDifferences && same
      );

      cells.forEach(cell => {
        const raw = cell.textContent.trim();

        cell.dataset.compareState = raw;

        if (!raw || raw === '—') return;

        if (
          cell.querySelector(
            '.compare-state-chip'
          )
        ) {
          return;
        }

        const chip = document.createElement('span');

        chip.className =
          'compare-state-chip';

        chip.textContent = raw;

        const lower = raw.toLowerCase();

        if (
          lower === 'core' ||
          lower.includes('core')
        ) {
          chip.classList.add('is-core');
        } else if (
          lower === 'built-in' ||
          lower.includes('built-in')
        ) {
          chip.classList.add('is-built');
        } else if (
          lower === 'support' ||
          lower.includes('support') ||
          lower.includes('connects')
        ) {
          chip.classList.add('is-support');
        } else if (
          lower === '—'
        ) {
          chip.classList.add('is-muted');
        }

        cell.textContent = '';
        cell.appendChild(chip);
      });
    });
  };

  const enhanceRenderedResults = () => {
    if (!isComparePage) return;

    enhanceCompareStyles();
    setupPickerEnhancements();

    const section = document.querySelector(
      '#compareResults .compare-section'
    );

    if (!section) return;

    let actions = document.getElementById(
      'compareEnhancedActions'
    );

    if (!actions) {
      actions = document.createElement('div');

      actions.id =
        'compareEnhancedActions';

      actions.className =
        'compare-enhanced-actions';

      const note = document.createElement('span');

      note.className =
        'enhanced-note';

      note.textContent =
        'Comparison view';

      const toggle =
        document.createElement('button');

      toggle.type = 'button';
      toggle.className =
        'enhanced-toggle';

      toggle.id =
        'compareDifferencesToggle';

      toggle.setAttribute(
        'aria-pressed',
        String(onlyDifferences)
      );

      toggle.textContent =
        'Only show differences';

      toggle.addEventListener(
        'click',
        () => {
          onlyDifferences =
            !onlyDifferences;

          toggle.setAttribute(
            'aria-pressed',
            String(onlyDifferences)
          );

          decorateMatrix();
        }
      );

      const change =
        document.createElement('button');

      change.type = 'button';

      change.className =
        'btn btn-outline btn-small';

      change.textContent =
        'Change Selection';

      change.addEventListener(
        'click',
        () => {
          document
            .querySelector(
              '.compare-picker-panel'
            )
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
        }
      );

      actions.append(
        note,
        toggle,
        change
      );

      section.insertBefore(
        actions,
        section.firstElementChild?.nextElementSibling ||
          section.firstChild
      );
    }

    decorateMatrix();
  };

  const refresh = () => {
    syncButtons();
    renderBar();

    if (isComparePage) {
      setupPickerEnhancements();
      enhanceRenderedResults();
    }

    if (
      typeof window.renderComparePage ===
      'function'
    ) {
      window.renderComparePage(
        selection
      );

      if (isComparePage) {
        requestAnimationFrame(() => {
          requestAnimationFrame(
            enhanceRenderedResults
          );
        });
      }
    }
  };

  /*
   * IMPORTANT:
   * Capture-phase handling prevents another document-level
   * click handler from treating the Compare button as navigation.
   */
  document.addEventListener(
    'click',
    event => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      /*
       * Product Compare button
       */
      const button =
        target.closest(
          '[data-compare-id]'
        );

      if (button) {
        event.preventDefault();
        event.stopImmediatePropagation();

        select(
          button.getAttribute(
            'data-compare-id'
          )
        );

        return;
      }

      /*
       * Remove selected comparison item
       */
      const remove =
        target.closest(
          '[data-compare-remove]'
        );

      if (remove) {
        event.preventDefault();
        event.stopImmediatePropagation();

        select(
          remove.getAttribute(
            'data-compare-remove'
          )
        );

        return;
      }

      /*
       * Clear selected tools
       */
      const clear =
        target.closest(
          '[data-compare-clear]'
        );

      if (clear) {
        event.preventDefault();
        event.stopImmediatePropagation();

        selection = [];

        writeSelection(
          selection
        );

        refresh();

        return;
      }

      /*
       * Open comparison results
       */
      const startCompare =
        target.closest(
          '[data-compare-submit]'
        );

      if (startCompare) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (selection.length < 2) {
          showToast(
            'Select at least 2 tools to compare.'
          );

          return;
        }

        const query =
          encodeURIComponent(
            selection.join(',')
          );

        const compareUrl =
          new URL(
            `compare.html?tools=${query}#compare-results`,
            document.baseURI
          ).href;

        window.location.assign(
          compareUrl
        );

        return;
      }

      /*
       * Normal Compare navigation link.
       */
      const compareLink =
        target.closest('a[href]');

      if (compareLink) {
        const href =
          compareLink.getAttribute(
            'href'
          ) || '';

        let url;

        try {
          url = new URL(
            href,
            document.baseURI
          );
        } catch (_) {
          return;
        }

        if (
          url.pathname
            .toLowerCase()
            .endsWith(
              '/compare.html'
            )
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();

          window.location.assign(
            url.href
          );
        }
      }
    },
    true
  );

  window.toolVaultCompare = {
    getSelection: () => [
      ...selection
    ],

    setSelection: ids => {
      selection = (
        Array.isArray(ids)
          ? ids
          : []
      )
        .filter(
          id => !!findTool(id)
        )
        .filter(
          (id, index, list) =>
            list.indexOf(id) === index
        )
        .slice(
          0,
          MAX_TOOLS
        );

      writeSelection(
        selection
      );

      refresh();
    },

    select
  };

  refresh();
})();
