(() => {
  const picker = document.getElementById('comparePicker');
  const results = document.getElementById('compareResults');
  const note = document.getElementById('compareSelectionNote');
  if (!picker || !results) return;

  const data = Array.isArray(window.toolVault?.TOOL_DATA)
    ? window.toolVault.TOOL_DATA
    : (Array.isArray(window.TOOL_DATA) ? window.TOOL_DATA : []);

  const compareData = window.toolVault?.TOOL_COMPARE || {};

  const escapeHTML = (value='') => String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');

  const safeUrl = (value='') => {
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol)
        ? url.href
        : '#';
    } catch (_) {
      return '#';
    }
  };

  const logoMarkup = tool =>
    typeof window.toolVault?.logoMarkup === 'function'
      ? window.toolVault.logoMarkup(tool, 'compare-logo')
      : `
        <div class="tool-logo compare-logo">
          <span>${escapeHTML(tool.name.charAt(0))}</span>
        </div>
      `;

  const getSelected = () => {
    const urlTools =
      new URLSearchParams(location.search).get('tools');

    if (urlTools) {
      const ids = urlTools
        .split(',')
        .map(item => {
          try {
            return decodeURIComponent(item)
              .trim()
              .toLowerCase();
          } catch (_) {
            return '';
          }
        })
        .filter(Boolean);

      const valid = ids
        .filter((id, i, arr) =>
          data.some(tool => tool.id === id) &&
          arr.indexOf(id) === i
        )
        .slice(0, 3);

      if (valid.length) return valid;
    }

    return window.toolVaultCompare?.getSelection?.() || [];
  };

  /*
   * Returns a numeric capability score based only on the
   * 14 capability fields already displayed in the matrix.
   *
   * Core      = 1.00
   * Built-in  = 0.80
   * Available = 0.65
   * Support   = 0.50
   * Dash      = 0
   *
   * This is intentionally a capability-coverage score,
   * not a universal product-quality ranking.
   */
  const capabilityScore = tool => {
    const entry = compareData[tool.id] || {};

    const fields = [
      'email',
      'funnels',
      'website',
      'ecommerce',
      'seo',
      'crm',
      'projects',
      'automation',
      'ai',
      'design',
      'video',
      'creator',
      'digitalProducts',
      'integrations'
    ];

    const WEIGHTS = {
      core: 1,
      builtin: 0.8,
      support: 0.5,
      available: 0.65
    };

    let total = 0;

    fields.forEach(key => {
      const value = String(
        entry[key] || '—'
      ).trim().toLowerCase();

      if (!value || value === '—') return;

      if (value.includes('core')) {
        total += WEIGHTS.core;
      } else if (value.includes('built-in')) {
        total += WEIGHTS.builtin;
      } else if (
        value.includes('support') ||
        value.includes('connect')
      ) {
        total += WEIGHTS.support;
      } else if (value.includes('available')) {
        total += WEIGHTS.available;
      } else {
        total += WEIGHTS.available;
      }
    });

    return Math.round(
      (total / fields.length) * 100
    );
  };

  const scoreLabel = score => {
    if (score >= 75) {
      return 'High capability coverage';
    }

    if (score >= 50) {
      return 'Balanced capability coverage';
    }

    return 'Focused capability coverage';
  };

  const renderPicker = selected => {
    picker.innerHTML = data.map(tool => {
      const checked =
        selected.includes(tool.id);

      return `
        <label class="compare-picker-card ${checked ? 'is-selected' : ''}">
          <input
            type="checkbox"
            value="${escapeHTML(tool.id)}"
            data-compare-pick
            ${checked ? 'checked' : ''}
          >

          <span class="compare-picker-top">
            ${logoMarkup(tool)}

            <span>
              <strong class="compare-picker-name">
                ${escapeHTML(tool.name)}
              </strong>

              <small class="compare-picker-category">
                ${escapeHTML(tool.categoryLabel)}
              </small>
            </span>
          </span>

          <span class="compare-picker-check">
            ${checked
              ? '✓ Selected'
              : '＋ Add to comparison'}
          </span>
        </label>
      `;
    }).join('');

    if (note) {
      note.textContent =
        `${selected.length} selected`;
    }
  };

  const renderResults = selected => {
    const tools = selected
      .map(id =>
        data.find(
          tool => tool.id === id
        )
      )
      .filter(Boolean);

    if (tools.length < 2) {
      results.innerHTML = `
        <section class="compare-empty">
          <span class="eyebrow">
            BUILD YOUR SHORTLIST
          </span>

          <h2>
            Select at least two tools
          </h2>

          <p>
            Choose two or three products above
            to unlock the side-by-side capability
            matrix, result score, workflow fit,
            buyer considerations, and direct
            provider links.
          </p>

          <a
            class="btn btn-outline"
            href="tools.html"
          >
            Browse All Tools
          </a>
        </section>
      `;

      return;
    }

    const count = tools.length;

    const rows = [
      [
        'Primary job',
        tool =>
          compareData[tool.id]?.primaryJob ||
          tool.categoryLabel
      ],

      [
        'Best suited for',
        tool =>
          compareData[tool.id]?.bestFor ||
          tool.whoItsFor?.slice(0,2).join(' · ') ||
          '—'
      ],

      [
        'Access',
        tool =>
          tool.type === 'freemium'
            ? 'Free + paid options'
            : (
              tool.type === 'free'
                ? 'Free'
                : 'Paid'
            )
      ],

      [
        'Email marketing',
        tool =>
          compareData[tool.id]?.email ||
          '—'
      ],

      [
        'Sales funnels',
        tool =>
          compareData[tool.id]?.funnels ||
          '—'
      ],

      [
        'Website building',
        tool =>
          compareData[tool.id]?.website ||
          '—'
      ],

      [
        'Ecommerce',
        tool =>
          compareData[tool.id]?.ecommerce ||
          '—'
      ],

      [
        'SEO & search',
        tool =>
          compareData[tool.id]?.seo ||
          '—'
      ],

      [
        'CRM / customer data',
        tool =>
          compareData[tool.id]?.crm ||
          '—'
      ],

      [
        'Project / work management',
        tool =>
          compareData[tool.id]?.projects ||
          '—'
      ],

      [
        'Automation',
        tool =>
          compareData[tool.id]?.automation ||
          '—'
      ],

      [
        'AI capabilities',
        tool =>
          compareData[tool.id]?.ai ||
          '—'
      ],

      [
        'Design / creative',
        tool =>
          compareData[tool.id]?.design ||
          '—'
      ],

      [
        'Video / audio',
        tool =>
          compareData[tool.id]?.video ||
          '—'
      ],

      [
        'Creator / YouTube',
        tool =>
          compareData[tool.id]?.creator ||
          '—'
      ],

      [
        'Digital products',
        tool =>
          compareData[tool.id]?.digitalProducts ||
          '—'
      ],

      [
        'Integrations / connections',
        tool =>
          compareData[tool.id]?.integrations ||
          '—'
      ]
    ];

    const scoreCards = tools.map(tool => {
      const score =
        capabilityScore(tool);

      return `
        <article class="compare-score-card">

          <div
            class="compare-score-ring"
            style="--score:${score}"
            aria-label="${score} out of 100 capability score"
          >
            <strong>${score}</strong>
            <span>/ 100</span>
          </div>

          <div class="compare-score-copy">

            <h3>
              ${escapeHTML(tool.name)}
            </h3>

            <strong>
              ${escapeHTML(scoreLabel(score))}
            </strong>

            <p>
              Based on the 14 capability areas
              shown below. Core capabilities count
              most, built-in capabilities count
              strongly, and support-level capabilities
              count less. This is a capability score,
              not a quality or “best tool” ranking.
            </p>

          </div>

        </article>
      `;
    }).join('');

    const differences = tools.map(tool => {
      const entry =
        compareData[tool.id] || {};

      return `
        <article class="compare-difference-card">

          ${logoMarkup(tool)}

          <h3>
            ${escapeHTML(tool.name)}
            — where it stands out
          </h3>

          <p>
            ${escapeHTML(
              entry.differentiator ||
              tool.overview ||
              ''
            )}
          </p>

        </article>
      `;
    }).join('');

    const fit = tools.map(tool => {
      const entry =
        compareData[tool.id] || {};

      const items =
        Array.isArray(entry.bestWhen)
          ? entry.bestWhen
          : (
            tool.useCases?.slice(0,4) ||
            []
          );

      return `
        <article class="compare-fit-card">

          <h3>
            ${escapeHTML(tool.name)}
            fits when…
          </h3>

          <ul>
            ${items
              .slice(0,4)
              .map(item => `
                <li>
                  <span>✓</span>
                  ${escapeHTML(item)}
                </li>
              `)
              .join('')}
          </ul>

        </article>
      `;
    }).join('');

    const considerations = tools.map(tool => `
      <article class="compare-consideration-card">
        <h3>
          ${escapeHTML(tool.name)}
        </h3>

        <ul>
          ${(tool.considerations || [])
            .slice(0,3)
            .map(item => `
              <li>
                ${escapeHTML(item)}
              </li>
            `)
            .join('')}
        </ul>
      </article>
    `).join('');

    const headers = tools.map(tool => `
      <div class="compare-product-head">

        ${logoMarkup(tool)}

        <h3 class="compare-product-name">
          ${escapeHTML(tool.name)}
        </h3>

        <span class="compare-product-category">
          ${escapeHTML(tool.categoryLabel)}
        </span>

        <p class="compare-product-tagline">
          ${escapeHTML(tool.tagline)}
        </p>

        <div class="compare-product-actions">

          <a
            class="btn btn-primary btn-small"
            href="tool.html?id=${encodeURIComponent(tool.id)}"
          >
            View Details
            <span>→</span>
          </a>

          <a
            class="btn btn-outline btn-small affiliate-link"
            href="${escapeHTML(
              safeUrl(
                tool.affiliateUrl ||
                tool.officialUrl
              )
            )}"
            data-affiliate-url="${escapeHTML(
              tool.affiliateUrl || ''
            )}"
            data-tool-id="${escapeHTML(tool.id)}"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            ${
              tool.affiliateUrl
                ? 'Get Started'
                : 'Official Site'
            }

            <span>↗</span>
          </a>

        </div>

      </div>
    `).join('');

    const tableRows = rows.map(
      ([label, resolver]) => {
        const values =
          tools.map(resolver);

        return `
          <tr>

            <th scope="row">
              ${escapeHTML(label)}
            </th>

            ${values
              .map(value => `
                <td
                  class="${
                    value === '—'
                      ? 'comparison-muted'
                      : 'comparison-positive'
                  }"
                >
                  <span class="compare-value-chip">
                    ${escapeHTML(value)}
                  </span>
                </td>
              `)
              .join('')}

          </tr>
        `;
      }
    ).join('');

    results.innerHTML = `
      <section class="compare-section">

        <div class="compare-section-header">
          <span class="eyebrow">
            SIDE-BY-SIDE
          </span>

          <h2>
            Compare the details that affect the workflow
          </h2>

          <p>
            “Built-in” means the catalog describes the
            capability as part of the product.
            “Core” indicates the capability is a
            central product focus. A dash means it is
            not presented as a core capability in the
            checked catalog.
          </p>
        </div>

        <div class="compare-results-scroll">

          <div
            class="compare-columns"
            style="--compare-count:${count}"
          >
            ${headers}
          </div>

          <div class="compare-matrix">

            <table class="compare-table">

              <colgroup>
                <col class="compare-label-column">

                ${tools.map(() => `
                  <col class="compare-tool-column">
                `).join('')}
              </colgroup>

              <tbody>
                ${tableRows}
              </tbody>

            </table>

          </div>

        </div>

        <div class="compare-section-header">

          <span class="eyebrow">
            RESULT SCORE
          </span>

          <h2>
            Capability score at a glance
          </h2>

          <p>
            The 0–100 score summarizes the 14
            capability areas in the table.
            Higher values mean broader cataloged
            capability coverage. It is not a
            product-quality rating or universal
            winner.
          </p>

        </div>

        <div
          class="compare-score-grid"
          style="--compare-count:${count}"
        >
          ${scoreCards}
        </div>

        <div class="compare-section-header">

          <span class="eyebrow">
            WHAT DIFFERENTIATES THEM
          </span>

          <h2>
            Read the practical distinction
          </h2>

          <p>
            Use these notes to understand why each
            product appears in a different place in
            the stack.
          </p>

        </div>

        <div
          class="compare-difference-grid"
          style="--compare-count:${count}"
        >
          ${differences}
        </div>

        <div class="compare-section-header">

          <span class="eyebrow">
            WORKFLOW FIT
          </span>

          <h2>
            When each tool makes sense
          </h2>

        </div>

        <div
          class="compare-fit-list"
          style="--compare-count:${count}"
        >
          ${fit}
        </div>

        <div class="compare-section-header">

          <span class="eyebrow">
            THINGS TO CHECK
          </span>

          <h2>
            Questions to settle before buying
          </h2>

          <p>
            These are considerations from the
            individual ToolVault entries. Confirm
            current plans, limits, terms, and
            availability on the provider's site.
          </p>

        </div>

        <div
          class="compare-consideration-grid"
          style="--compare-count:${count}"
        >
          ${considerations}
        </div>

        <div class="compare-final">

          <div>
            <h3>
              Ready to explore an option?
            </h3>

            <p>
              Read the full ToolVault page first,
              then use the official provider link
              for current pricing, availability,
              terms, and checkout.
            </p>
          </div>

          <a
            class="btn btn-primary"
            href="tools.html"
          >
            Continue Exploring
            <span>→</span>
          </a>

        </div>

      </section>
    `;
  };

  const updateComparisonCue = selected => {
    const existing =
      document.getElementById(
        'compareReadyCue'
      );

    if (existing) {
      existing.remove();
    }

    if (selected.length < 2) {
      return;
    }

    const cue =
      document.createElement('div');

    cue.id =
      'compareReadyCue';

    cue.className =
      'compare-ready-cue';

    cue.innerHTML = `
      <div class="compare-ready-copy">

        <span
          class="compare-ready-icon"
          aria-hidden="true"
        >
          ✓
        </span>

        <div>
          <strong>
            ${selected.length}
            tools selected —
            your comparison is ready
          </strong>

          <span>
            Your side-by-side table is just below.
            Open it when you are ready.
          </span>
        </div>

      </div>

      <button
        type="button"
        class="btn btn-primary btn-small"
        data-compare-jump
      >
        See Comparison
        <span>↓</span>
      </button>
    `;

    const panel =
      document.querySelector(
        '.compare-picker-panel'
      );

    panel?.insertAdjacentElement(
      'afterend',
      cue
    );
  };

  const jumpToResults = () => {
    results.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    window.history.replaceState(
      null,
      '',
      `${location.pathname}${location.search}#compare-results`
    );
  };

  window.renderComparePage =
    selection => {
      const selected =
        selection.slice(0, 3);

      renderPicker(selected);
      renderResults(selected);
      updateComparisonCue(selected);

      document
        .querySelectorAll(
          '[data-compare-submit]'
        )
        .forEach(button => {
          button.innerHTML =
            selected.length >= 2
              ? 'See Comparison <span>↓</span>'
              : 'Run Comparison <span>→</span>';
        });

      if (
        selected.length >= 2 &&
        location.hash ===
          '#compare-results'
      ) {
        requestAnimationFrame(() => {
          requestAnimationFrame(
            jumpToResults
          );
        });
      }
    };

  document.addEventListener(
    'click',
    event => {
      const target =
        event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const jump =
        target.closest(
          '[data-compare-jump]'
        );

      if (jump) {
        event.preventDefault();
        jumpToResults();
      }
    }
  );

  picker.addEventListener(
    'change',
    event => {
      const target =
        event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const input =
        target.closest(
          '[data-compare-pick]'
        );

      if (!input) return;

      const current =
        window.toolVaultCompare
          ?.getSelection?.() || [];

      if (input.checked) {

        if (current.length >= 3) {
          input.checked = false;
          return;
        }

        window.toolVaultCompare
          ?.select(input.value);

      } else {

        window.toolVaultCompare
          ?.select(input.value);

      }
    }
  );

  window.renderComparePage(
    window.toolVaultCompare
      ?.getSelection?.() || []
  );
})();
