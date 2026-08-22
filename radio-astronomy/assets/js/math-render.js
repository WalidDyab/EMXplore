(function () {
  'use strict';

  function renderEquation(element) {
    var tex = element.getAttribute('data-tex');
    if (!tex || !window.katex) return;

    var displayMode = element.getAttribute('data-display') === 'true';
    try {
      window.katex.render(tex, element, {
        displayMode: displayMode,
        throwOnError: false,
        strict: 'warn',
        trust: false,
        output: 'htmlAndMathml'
      });
      element.classList.add('is-rendered');
    } catch (error) {
      element.classList.add('has-render-error');
      element.setAttribute('title', error && error.message ? error.message : 'KaTeX rendering failed');
    }
  }

  function renderAll() {
    document.querySelectorAll('.ra-equation[data-tex]').forEach(renderEquation);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
})();
