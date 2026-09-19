(() => {
  const STORAGE_KEY = 'toolVaultCompare';
  const MAX_TOOLS = 3;

  const isComparePage =
    /(?:^|\/)compare\.html$/i.test(
      location.pathname
    );

  let selection = [];

  const getData = () => {
    if (
      Array.isArray(
        window.toolVault?.TOOL_DATA
      )
    ) {
      return window.toolVault.TOOL_DATA;
    }

    if (
      Array.isArray(
        window.TOOL_DATA
      )
    ) {
      return window.TOOL_DATA;
    }

    return [];
  };

  const findTool = id => {
    const target = String(
      id || ''
    )
      .trim()
      .toLowerCase();

    return getData().find(
      tool =>
        String(tool.id).toLowerCase() ===
        target
    );
  };

  const normalizeSelection = ids => {
    return (
      Array.isArray(ids)
        ? ids
        : []
    )
      .map(id =>
        String(id || '')
          .trim()
          .toLowerCase()
      )
      .filter(
        (id, index, list) =>
          id &&
          list.indexOf(id) === index &&
          !!findTool(id)
      )
      .slice(
        0,
        MAX_TOOLS
      );
  };

  /*
   * IMPORTANT:
   * Use sessionStorage rather than localStorage.
   *
   * This keeps the comparison while the user moves
   * around the site during the current browser session,
   * but it does not permanently restore an old comparison
   * on future visits.
   */
  const readSelection = () => {
    try {
      const raw =
        sessionStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return [];
      }

      return normalizeSelection(
        JSON.parse(raw)
      );
    } catch (_) {
      return [];
    }
  };

  const writeSelection = ids => {
    selection =
      normalizeSelection(ids);

    try {
      if (selection.length) {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(selection)
        );
      } else {
        sessionStorage.removeItem(
          STORAGE_KEY
        );
      }
    } catch (_) {}
  };

  const escapeHTML = (value = '') => {
    return String(value)
      .replaceAll(
        '&',
        '&amp;'
      )
      .replaceAll(
        '<',
        '&lt;'
      )
      .replaceAll(
        '>',
        '&gt;'
      )
      .replaceAll(
        '"',
        '&quot;'
      )
      .replaceAll(
        "'",
        '&#039;'
      );
  };

  const logo = tool => {
    if (
      typeof window.toolVault
        ?.logoMarkup ===
      'function'
    ) {
      return window.toolVault.logoMarkup(
        tool,
        'compare-logo'
      );
    }

    return `
      <div class="tool-logo compare-logo">
        <span>
          ${escapeHTML(
            String(
              tool.name || ''
            ).charAt(0)
          )}
        </span>
      </div>
    `;
  };

  const showToast = message => {
    document
      .getElementById(
        'compareToast'
      )
      ?.remove();

    const toast =
      document.createElement(
        'div'
      );

    toast.id =
      'compareToast';

    toast.className =
      'compare-toast';

    toast.textContent =
      message;

    document.body.appendChild(
      toast
    );

    requestAnimationFrame(
      () => {
        toast.classList.add(
          'show'
        );
      }
    );

    setTimeout(() => {
      toast.classList.remove(
        'show'
      );

      setTimeout(() => {
        toast.remove();
      }, 180);
    }, 2200);
  };

  const syncCompareButtons = () => {
    document
      .querySelectorAll(
        '[data-compare-id]'
      )
      .forEach(button => {
        const id =
          String(
            button.getAttribute(
              'data-compare-id'
            ) || ''
          )
            .trim()
            .toLowerCase();

        const active =
          selection.includes(id);

        button.classList.toggle(
          'is-selected',
          active
        );

        button.setAttribute(
          'aria-pressed',
          String(active)
        );

        button.innerHTML =
          active
            ? '✓ Selected'
            : '＋ Compare';
      });
  };

  /*
   * The Compare pill/bar is rendered ONLY when
   * at least one tool has been selected.
   */
  const renderBar = () => {
    document
      .getElementById(
        'compareBar'
      )
      ?.remove();

    document.body.classList.toggle(
      'compare-selection-active',
      selection.length > 0
    );

    if (
      selection.length === 0
    ) {
      return;
    }

    const tools =
      selection
        .map(findTool)
        .filter(Boolean);

    if (!tools.length) {
      return;
    }

    const bar =
      document.createElement(
        'aside'
      );

    bar.id =
      'compareBar';

    bar.className =
      'compare-bar';

    bar.setAttribute(
      'aria-label',
      'Selected tools for comparison'
    );

    const action =
      selection.length >= 2
        ? `
          <button
            type="button"
            class="btn btn-primary btn-small"
            data-compare-submit
          >
            See Comparison
            <span>↓</span>
          </button>
        `
        : `
          <button
            type="button"
            class="btn btn-primary btn-small"
            data-compare-add
          >
            Add Another Tool
            <span>→</span>
          </button>
        `;

    bar.innerHTML = `
      <div class="compare-bar-inner">

        <div class="compare-bar-title">
          <span class="eyebrow">
            COMPARE
          </span>

          <strong>
            ${tools.length}
            of
            ${MAX_TOOLS}
            tools selected
          </strong>
        </div>

        <div class="compare-bar-tools">

          ${tools
            .map(
              tool => `
                <button
                  type="button"
                  class="compare-mini-item"
                  data-compare-remove="${escapeHTML(
                    tool.id
                  )}"
                  aria-label="Remove ${escapeHTML(
                    tool.name
                  )} from comparison"
                >

                  ${logo(tool)}

                  <span>
                    ${escapeHTML(
                      tool.name
                    )}
                  </span>

                  <b aria-hidden="true">
                    ×
                  </b>

                </button>
              `
            )
            .join('')}

        </div>

        <div class="compare-bar-actions">

          <button
            type="button"
            class="btn btn-outline btn-small"
            data-compare-clear
          >
            Clear
          </button>

          ${action}

        </div>

      </div>
    `;

    document.body.appendChild(
      bar
    );
  };

  const refresh = () => {
    syncCompareButtons();

    renderBar();

    if (
      typeof window.renderComparePage ===
      'function'
    ) {
      window.renderComparePage(
        [...selection]
      );
    }
  };

  const setSelection = ids => {
    selection =
      normalizeSelection(ids);

    writeSelection(
      selection
    );

    refresh();
  };

  const select = id => {
    const normalizedId =
      String(id || '')
        .trim()
        .toLowerCase();

    if (
      !findTool(
        normalizedId
      )
    ) {
      return;
    }

    /*
     * Selecting an already-selected tool
     * removes it.
     */
    if (
      selection.includes(
        normalizedId
      )
    ) {
      selection =
        selection.filter(
          item =>
            item !== normalizedId
        );

      writeSelection(
        selection
      );

      refresh();

      return;
    }

    /*
     * Maximum of three tools.
     */
    if (
      selection.length >=
      MAX_TOOLS
    ) {
      showToast(
        `You can compare up to ${MAX_TOOLS} tools at once.`
      );

      return;
    }

    selection = [
      ...selection,
      normalizedId
    ];

    writeSelection(
      selection
    );

    refresh();
  };

  const clearSelection = () => {
    selection = [];

    try {
      sessionStorage.removeItem(
        STORAGE_KEY
      );
    } catch (_) {}

    /*
     * Remove comparison query/hash too.
     * This prevents an old comparison URL
     * from recreating the previous result.
     */
    if (
      isComparePage &&
      (
        location.search ||
        location.hash
      )
    ) {
      window.history.replaceState(
        null,
        '',
        location.pathname
      );
    }

    refresh();

    if (isComparePage) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  /*
   * Return to the ToolVault catalog while
   * preserving the current session selection.
   */
  const goToCatalog = () => {
    const url =
      new URL(
        'tools.html#toolsGrid',
        document.baseURI
      );

    window.location.assign(
      url.href
    );
  };

  /*
   * Open the comparison results page.
   */
  const openComparison = () => {
    if (
      selection.length < 2
    ) {
      goToCatalog();
      return;
    }

    const query =
      encodeURIComponent(
        selection.join(',')
      );

    const url =
      new URL(
        `compare.html?tools=${query}#compare-results`,
        document.baseURI
      );

    window.location.assign(
      url.href
    );
  };

  /*
   * Product Compare buttons.
   *
   * Capture phase + stopImmediatePropagation()
   * prevents unrelated click handlers from
   * hijacking the Compare interaction.
   */
  document.addEventListener(
    'click',
    event => {
      const target =
        event.target;

      if (
        !(target instanceof Element)
      ) {
        return;
      }

      /*
       * Product/tool Compare button.
       */
      const compareButton =
        target.closest(
          '[data-compare-id]'
        );

      if (compareButton) {
        event.preventDefault();
        event.stopImmediatePropagation();

        select(
          compareButton.getAttribute(
            'data-compare-id'
          )
        );

        return;
      }

      /*
       * Remove one selected tool.
       */
      const removeButton =
        target.closest(
          '[data-compare-remove]'
        );

      if (removeButton) {
        event.preventDefault();
        event.stopImmediatePropagation();

        select(
          removeButton.getAttribute(
            'data-compare-remove'
          )
        );

        return;
      }

      /*
       * Clear the entire comparison.
       */
      const clearButton =
        target.closest(
          '[data-compare-clear]'
        );

      if (clearButton) {
        event.preventDefault();
        event.stopImmediatePropagation();

        clearSelection();

        return;
      }

      /*
       * One tool selected:
       * return to catalog and keep the first
       * selection in sessionStorage.
       */
      const addAnotherButton =
        target.closest(
          '[data-compare-add]'
        );

      if (addAnotherButton) {
        event.preventDefault();
        event.stopImmediatePropagation();

        goToCatalog();

        return;
      }

      /*
       * Two or more tools selected:
       * open the actual comparison page.
       */
      const submitButton =
        target.closest(
          '[data-compare-submit]'
        );

      if (submitButton) {
        event.preventDefault();
        event.stopImmediatePropagation();

        openComparison();

        return;
      }
    },
    true
  );

  /*
   * Compare picker checkboxes on compare.html.
   */
  document.addEventListener(
    'change',
    event => {
      const target =
        event.target;

      if (
        !(target instanceof Element)
      ) {
        return;
      }

      const input =
        target.closest(
          '[data-compare-pick]'
        );

      if (!input) {
        return;
      }

      event.stopImmediatePropagation();

      const id =
        String(
          input.value || ''
        )
          .trim()
          .toLowerCase();

      if (
        !id ||
        !findTool(id)
      ) {
        input.checked =
          false;

        return;
      }

      if (input.checked) {

        if (
          selection.length >=
            MAX_TOOLS &&
          !selection.includes(id)
        ) {
          input.checked =
            false;

          showToast(
            `You can compare up to ${MAX_TOOLS} tools at once.`
          );

          return;
        }

        if (
          !selection.includes(id)
        ) {
          selection = [
            ...selection,
            id
          ];
        }

      } else {

        selection =
          selection.filter(
            item =>
              item !== id
          );
      }

      writeSelection(
        selection
      );

      refresh();
    },
    true
  );

  /*
   * Keep selection synchronized when another
   * ToolVault tab changes the session state.
   *
   * sessionStorage is tab-scoped, so this mainly
   * protects against browsers exposing storage events
   * in unusual cases without making the selection
   * permanent.
   */
  window.addEventListener(
    'storage',
    event => {
      if (
        event.storageArea ===
          sessionStorage &&
        event.key ===
          STORAGE_KEY
      ) {
        selection =
          readSelection();

        refresh();
      }
    }
  );

  window.toolVaultCompare = {
    getSelection: () => [
      ...selection
    ],

    setSelection,

    select,

    clear: clearSelection
  };

  /*
   * Restore only the active comparison for
   * this browser session.
   */
  selection =
    readSelection();

  /*
   * A comparison URL is authoritative when
   * compare.html?tools=... is present.
   *
   * This guarantees that clicking Compare
   * renders exactly the tools in the URL.
   */
  const urlToolIds =
    new URLSearchParams(
      location.search
    ).get('tools');

  if (
    isComparePage &&
    urlToolIds
  ) {
    const fromUrl =
      normalizeSelection(
        urlToolIds.split(',')
      );

    if (
      fromUrl.length
    ) {
      selection =
        fromUrl;

      writeSelection(
        selection
      );
    }
  }

  /*
   * Initial render.
   *
   * If there is no selection, renderBar()
   * does nothing, so the Compare pill stays
   * completely hidden.
   */
  refresh();
})();
