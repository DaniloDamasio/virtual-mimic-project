(() => {
  'use strict';

  Auth.requireAuth();

  const panels = document.querySelectorAll('[data-tab-panel]');

  document.querySelectorAll('.ficha-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.ficha-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach(p => { p.hidden = p.dataset.tabPanel !== target; });
    });
  });
})();
