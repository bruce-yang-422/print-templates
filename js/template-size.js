(function () {
  if (!document.body || !document.body.classList.contains('template-page')) return;

  const SIZE_BUTTON_SELECTOR = '[data-print-size]';
  const SIZE_ORDER = ['a4', 'a5', 'cut'];
  const SCREEN_PREVIEW_CLASS = 'is-size-preview';
  let sizeMode = 'a4';
  let printStyleTag = null;

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

  function renderCut(stage, page, source, target) {
    const sheet = document.createElement('div');
    sheet.className = 'print-sheet ' + target.direction;
    sheet.style.width = mm(target.sheet.width);
    sheet.style.height = mm(target.sheet.height);

    for (let i = 0; i < 2; i++) {
      const slot = document.createElement('div');
      slot.className = 'print-slot';
      slot.style.width = mm(target.half.width);
      slot.style.height = mm(target.half.height);
      slot.appendChild(buildScaledClone(page, source, target.half));
      sheet.appendChild(slot);
    }

    const cutLine = document.createElement('div');
    cutLine.className = target.direction === 'cut-row' ? 'print-cut-line-v' : 'print-cut-line-h';
    sheet.appendChild(cutLine);
    stage.appendChild(sheet);
  }

  function getTargetSpec(page, source) {
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

    if (target.type === 'cut') {
      renderCut(stage, page, source, target);
    } else {
      renderSingle(stage, page, source, target);
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
      return;
    }

    if (!renderStageLayout()) return;
    document.body.classList.add(SCREEN_PREVIEW_CLASS);
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
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest(SIZE_BUTTON_SELECTOR);
    if (button) {
      setSize(button.dataset.printSize);
      return;
    }

    if (event.target.closest('.mode-cards .card')) {
      window.setTimeout(function () {
        if (sizeMode !== 'a4') renderScreenPreview();
      }, 0);
    }
  });

  window.addEventListener('beforeprint', stagePrintLayout);
  window.addEventListener('afterprint', clearPrintLayout);

  window.TemplatePrintSize = {
    getSize: function () { return sizeMode; },
    setSize: setSize,
    renderScreenPreview: renderScreenPreview,
    stagePrintLayout: stagePrintLayout,
    clearPrintLayout: clearPrintLayout,
  };

  setSize('a4');
})();
