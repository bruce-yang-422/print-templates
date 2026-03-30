(function () {
  if (!document.body || !document.body.classList.contains('template-page')) return;

  const SIZE_BUTTON_SELECTOR = '[data-print-size]';
  const SIZE_ORDER = ['a4', 'b5', 'a5', 'cut'];
  const SIZE_LABELS = {
    a4: 'A4',
    b5: 'B5',
    a5: 'A5',
    cut: 'A4裁A5',
  };
  const SCREEN_PREVIEW_CLASS = 'is-size-preview';
  let sizeMode = 'a4';
  let printStyleTag = null;
  let refreshTimer = null;
  let pagesObserver = null;
  let screenFitTimer = null;
  let templateOffsetTimer = null;
  let uiResizeObserver = null;

  function getPageContainers() {
    const containers = new Set();

    document.querySelectorAll('.pages, [class*="pages"], #print-stage').forEach(function (element) {
      if (
        element.id === 'print-stage' ||
        element.querySelector('.page') ||
        element.querySelector('.print-sheet')
      ) {
        containers.add(element);
      }
    });

    return Array.from(containers);
  }

  function syncTemplateUiOffset() {
    const ui = document.querySelector('.ui');
    const fallbackOffset = 104;
    const containers = getPageContainers();
    if (!ui) {
      document.body.style.setProperty('--template-ui-offset', fallbackOffset + 'px');
      containers.forEach(function (container) {
        container.style.paddingTop = fallbackOffset + 'px';
      });
      return;
    }

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const uiRect = ui.getBoundingClientRect();
    const extraGap = viewportWidth <= 900 ? 28 : 24;
    const offset = Math.max(fallbackOffset, Math.ceil(uiRect.bottom + extraGap));
    document.body.style.setProperty('--template-ui-offset', offset + 'px');
    containers.forEach(function (container) {
      container.style.paddingTop = offset + 'px';
    });
  }

  function scheduleTemplateUiOffset() {
    window.clearTimeout(templateOffsetTimer);
    templateOffsetTimer = window.setTimeout(function () {
      syncTemplateUiOffset();
      applyResponsiveScreenFit();
    }, 24);
  }

  function getScreenFitTargets() {
    return Array.from(document.querySelectorAll(
      document.body.classList.contains('is-size-preview')
        ? '#print-stage .print-sheet'
        : '.pages .page'
    ));
  }

  function clearResponsiveScreenFit() {
    document.querySelectorAll('.pages .page, #print-stage .print-sheet').forEach(function (target) {
      target.style.removeProperty('zoom');
      target.style.removeProperty('transform');
      target.style.removeProperty('transform-origin');
      target.style.removeProperty('margin-bottom');
    });
  }

  function applyResponsiveScreenFit() {
    clearResponsiveScreenFit();

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    if (viewportWidth <= 0) return;

    const availableWidth = Math.max(280, viewportWidth - (viewportWidth <= 720 ? 20 : 48));

    getScreenFitTargets().forEach(function (target) {
      const rectWidth = target.offsetWidth;
      const rectHeight = target.offsetHeight;
      if (!rectWidth || !rectHeight) return;

      const scale = Math.min(1, availableWidth / rectWidth);
      if (scale >= 0.999) return;

      if (viewportWidth <= 900 && CSS.supports && CSS.supports('zoom', '1')) {
        target.style.zoom = String(scale);
        return;
      }

      target.style.transform = 'scale(' + scale + ')';
      target.style.transformOrigin = 'top center';
      target.style.marginBottom = ((scale - 1) * rectHeight) + 'px';
    });
  }

  function scheduleScreenFit() {
    window.clearTimeout(screenFitTimer);
    screenFitTimer = window.setTimeout(function () {
      applyResponsiveScreenFit();
    }, 24);
  }

  function ensurePrintStage() {
    let stage = document.getElementById('print-stage');
    if (!stage) {
      stage = document.createElement('div');
      stage.id = 'print-stage';
      document.body.appendChild(stage);
    }
    return stage;
  }

  function ensurePrintStyleTag() {
    if (!printStyleTag) {
      printStyleTag = document.createElement('style');
      printStyleTag.id = 'dynamic-print-layout';
      document.head.appendChild(printStyleTag);
    }
    return printStyleTag;
  }

  function normalizeSizeButtons() {
    const groups = new Set();
    document.querySelectorAll(SIZE_BUTTON_SELECTOR).forEach(function (button) {
      const group = button.closest('.size-cards');
      if (group) groups.add(group);
    });

    groups.forEach(function (group) {
      const existing = new Map();
      group.querySelectorAll(SIZE_BUTTON_SELECTOR).forEach(function (button) {
        existing.set(button.dataset.printSize, button);
      });

      SIZE_ORDER.forEach(function (size) {
        if (existing.has(size)) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'card size-card';
        button.dataset.printSize = size;
        button.textContent = SIZE_LABELS[size];
        existing.set(size, button);
      });

      group.innerHTML = '';
      SIZE_ORDER.forEach(function (size) {
        group.appendChild(existing.get(size));
      });
    });
  }

  function getVisiblePage() {
    const pages = Array.from(document.querySelectorAll('.page'));
    return pages.find((page) => window.getComputedStyle(page).display !== 'none') || null;
  }

  function getSourceSpec(page) {
    const classList = page.classList;
    if (classList.contains('page-a5-land')) return { width: 210, height: 148, orientation: 'landscape' };
    if (classList.contains('page-a5-port') || classList.contains('page-a5')) return { width: 148, height: 210, orientation: 'portrait' };
    if (classList.contains('page-a4-land') || classList.contains('page-land')) return { width: 297, height: 210, orientation: 'landscape' };
    return { width: 210, height: 297, orientation: 'portrait' };
  }

  function isPreCutA5Spread(page, source) {
    if (source.orientation !== 'landscape') return false;

    const a5Panels = page.querySelectorAll('.inner-a5-bind');
    return a5Panels.length >= 2;
  }

  function mm(value) {
    return value + 'mm';
  }

  function buildScaledClone(page, source, target) {
    const scale = Math.min(target.width / source.width, target.height / source.height);
    const box = document.createElement('div');
    box.className = 'print-scale-box';
    box.style.width = mm(source.width);
    box.style.height = mm(source.height);
    box.style.transform = 'scale(' + scale + ')';

    const clone = page.cloneNode(true);
    clone.classList.add('print-clone');
    box.appendChild(clone);
    return box;
  }

  function renderSingle(stage, page, source, target) {
    const sheet = document.createElement('div');
    sheet.className = 'print-sheet single';
    sheet.style.width = mm(target.width);
    sheet.style.height = mm(target.height);
    sheet.appendChild(buildScaledClone(page, source, target));
    stage.appendChild(sheet);
  }

  function renderCut(stage, page, source, target, baseOffset = 0, renderFn = null) {
    const sheet = document.createElement('div');
    sheet.className = 'print-sheet ' + target.direction;
    sheet.style.width = mm(target.sheet.width);
    sheet.style.height = mm(target.sheet.height);

    const dynamicRenderFn = renderFn || (window.renderMonthOffset || window.renderWeekOffset);

    for (let i = 0; i < 2; i++) {
      const slot = document.createElement('div');
      slot.className = 'print-slot';
      slot.style.width = mm(target.half.width);
      slot.style.height = mm(target.half.height);

      if (dynamicRenderFn) {
        dynamicRenderFn(baseOffset + i);
      }

      slot.appendChild(buildScaledClone(page, source, target.half));
      sheet.appendChild(slot);
    }

    if (dynamicRenderFn) {
      dynamicRenderFn(0);
    }

    const cutLine = document.createElement('div');
    cutLine.className = target.direction === 'cut-row' ? 'print-cut-line-v' : 'print-cut-line-h';
    sheet.appendChild(cutLine);
    stage.appendChild(sheet);
  }

  function getTargetSpec(page, source) {
    if (sizeMode === 'b5') {
      return {
        type: 'single',
        paper: source.orientation === 'landscape' ? 'B5 landscape' : 'B5 portrait',
        width: source.orientation === 'landscape' ? 257 : 182,
        height: source.orientation === 'landscape' ? 182 : 257,
      };
    }

    if (sizeMode === 'a5') {
      return {
        type: 'single',
        paper: source.orientation === 'landscape' ? 'A5 landscape' : 'A5 portrait',
        width: source.orientation === 'landscape' ? 210 : 148,
        height: source.orientation === 'landscape' ? 148 : 210,
      };
    }

    if (sizeMode === 'cut') {
      if (isPreCutA5Spread(page, source)) {
        return {
          type: 'single',
          paper: 'A4 landscape',
          width: 297,
          height: 210,
        };
      }

      if (source.orientation === 'landscape') {
        return {
          type: 'cut',
          paper: 'A4 portrait',
          direction: 'cut-col',
          sheet: { width: 210, height: 297 },
          half: { width: 210, height: 148 },
        };
      }
      return {
        type: 'cut',
        paper: 'A4 landscape',
        direction: 'cut-row',
        sheet: { width: 297, height: 210 },
        half: { width: 148, height: 210 },
      };
    }

    return {
      type: 'single',
      paper: source.orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait',
      width: source.orientation === 'landscape' ? 297 : 210,
      height: source.orientation === 'landscape' ? 210 : 297,
    };
  }

  function renderStageLayout() {
    const page = getVisiblePage();
    if (!page) return null;

    const stage = ensurePrintStage();
    stage.innerHTML = '';

    const source = getSourceSpec(page);
    const target = getTargetSpec(page, source);

    let steps = 1;
    let renderFn = null;
    
    const startInp = document.getElementById('print-start');
    const endInp = document.getElementById('print-end');
    if (startInp && endInp && startInp.value && endInp.value && window.TemplateCalendar) {
      const sDate = window.TemplateCalendar.parseLocalDate(startInp.value);
      const eDate = window.TemplateCalendar.parseLocalDate(endInp.value);
      
      if (sDate && eDate && sDate <= eDate) {
        if (window.renderMonthOffset) {
          renderFn = window.renderMonthOffset;
          steps = (eDate.getFullYear() - sDate.getFullYear()) * 12 + (eDate.getMonth() - sDate.getMonth()) + 1;
        } else if (window.renderWeekOffset) {
          renderFn = window.renderWeekOffset;
          const diffMs = eDate.getTime() - sDate.getTime();
          steps = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
        }
      }
    }

    if (steps < 1) steps = 1;
    if (steps > 60) steps = 60; // Max 5 years of months or ~1 year of weeks

    if (target.type === 'cut') {
      const sheetsCount = Math.ceil(steps / 2);
      for (let s = 0; s < sheetsCount; s++) {
        renderCut(stage, page, source, target, s * 2, renderFn);
      }
    } else {
      for (let s = 0; s < steps; s++) {
        if (renderFn) renderFn(s);
        renderSingle(stage, page, source, target);
      }
      if (renderFn) renderFn(0);
    }

    ensurePrintStyleTag().textContent = '@media print { @page { size: ' + target.paper + '; margin: 0; } }';
    return target;
  }

  function clearStage() {
    const stage = document.getElementById('print-stage');
    if (stage) stage.innerHTML = '';
  }

  function renderScreenPreview() {
    if (sizeMode === 'a4') {
      document.body.classList.remove(SCREEN_PREVIEW_CLASS);
      clearStage();
      syncTemplateUiOffset();
      applyResponsiveScreenFit();
      return;
    }

    if (!renderStageLayout()) return;
    document.body.classList.add(SCREEN_PREVIEW_CLASS);
    syncTemplateUiOffset();
    applyResponsiveScreenFit();
  }

  function schedulePreviewRefresh() {
    if (sizeMode === 'a4' || document.body.classList.contains('is-print-staged')) return;
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(function () {
      renderScreenPreview();
      applyResponsiveScreenFit();
    }, 24);
  }

  function initPagesObserver() {
    const pages = document.querySelector('.pages');
    if (!pages || typeof MutationObserver === 'undefined') return;

    pagesObserver = new MutationObserver(function () {
      schedulePreviewRefresh();
      scheduleTemplateUiOffset();
      scheduleScreenFit();
    });

    pagesObserver.observe(pages, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
  }

  function initUiObserver() {
    const ui = document.querySelector('.ui');
    if (!ui || typeof ResizeObserver === 'undefined') return;

    uiResizeObserver = new ResizeObserver(function () {
      scheduleTemplateUiOffset();
    });

    uiResizeObserver.observe(ui);
  }

  function stagePrintLayout() {
    if (!renderStageLayout()) return;

    document.body.classList.add('is-print-staged');
  }

  function clearPrintLayout() {
    clearStage();
    document.body.classList.remove('is-print-staged');

    if (sizeMode !== 'a4') {
      renderScreenPreview();
    }
    applyResponsiveScreenFit();
  }

  function syncButtons() {
    document.querySelectorAll(SIZE_BUTTON_SELECTOR).forEach((button) => {
      button.classList.toggle('active', button.dataset.printSize === sizeMode);
    });
  }

  function setSize(mode) {
    if (!SIZE_ORDER.includes(mode)) return;
    sizeMode = mode;
    document.body.dataset.printSize = mode;
    syncButtons();
    renderScreenPreview();
    document.dispatchEvent(new CustomEvent('template-print-size-change', {
      detail: { size: sizeMode }
    }));
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest(SIZE_BUTTON_SELECTOR);
    if (button) {
      if (button.disabled) return;
      setSize(button.dataset.printSize);
      scheduleTemplateUiOffset();
      return;
    }

    if (event.target.closest('.mode-cards .card')) {
      window.setTimeout(function () {
        if (sizeMode !== 'a4') renderScreenPreview();
        syncTemplateUiOffset();
      }, 0);
    }
  });

  window.addEventListener('beforeprint', stagePrintLayout);
  window.addEventListener('afterprint', clearPrintLayout);
  window.addEventListener('resize', function () {
    scheduleTemplateUiOffset();
    scheduleScreenFit();
  });
  window.addEventListener('load', function () {
    scheduleTemplateUiOffset();
    scheduleScreenFit();
  });

  window.TemplatePrintSize = {
    getSize: function () { return sizeMode; },
    setSize: setSize,
    refreshPreview: renderScreenPreview,
    renderScreenPreview: renderScreenPreview,
    stagePrintLayout: stagePrintLayout,
    clearPrintLayout: clearPrintLayout,
  };

  normalizeSizeButtons();
  initPagesObserver();
  initUiObserver();
  setSize('a4');
  syncTemplateUiOffset();
  applyResponsiveScreenFit();
  window.requestAnimationFrame(function () {
    scheduleTemplateUiOffset();
    scheduleScreenFit();
  });
})();
