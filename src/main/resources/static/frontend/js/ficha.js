(() => {
  'use strict';

  Auth.requireAuth();

  document.querySelectorAll('.ficha-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ficha-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
})();
