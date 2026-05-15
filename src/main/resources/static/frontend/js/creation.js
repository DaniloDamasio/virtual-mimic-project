(() => {
  'use strict';

  Auth.requireAuth();

  document.querySelectorAll('[data-accordion]').forEach(list => {
    list.addEventListener('click', e => {
      const chooseBtn = e.target.closest('.btn-choose');
      const header    = e.target.closest('.accordion-header');

      if (chooseBtn) {
        list.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('selected');
        });
        chooseBtn.closest('.accordion-item').classList.add('selected');

        const nextHref = list.getAttribute('data-next');
        if (nextHref) {
          setTimeout(() => { window.location.href = nextHref; }, 220);
        }
        return;
      }

      if (header) {
        const item = header.closest('.accordion-item');
        const wasOpen = item.classList.contains('open');

        list.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('open');
          const panel = i.querySelector('.accordion-panel');
          if (panel) panel.hidden = true;
          const h = i.querySelector('.accordion-header');
          if (h) h.setAttribute('aria-expanded', 'false');
        });

        if (!wasOpen) {
          item.classList.add('open');
          const panel = item.querySelector('.accordion-panel');
          if (panel) panel.hidden = false;
          header.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });

  const heroGrid    = document.querySelector('[data-hero-grid]');
  const heroDetail  = document.querySelector('[data-hero-detail]');
  const classGrid   = document.querySelector('[data-class-grid]');
  const classDetail = document.querySelector('[data-class-detail]');

  function showDetail() {
    if (heroGrid)    heroGrid.hidden    = true;
    if (classGrid)   classGrid.hidden   = true;
    if (heroDetail)  heroDetail.hidden  = false;
    if (classDetail) classDetail.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showGrid() {
    if (heroDetail)  heroDetail.hidden  = true;
    if (classDetail) classDetail.hidden = true;
    if (heroGrid)    heroGrid.hidden    = false;
    if (classGrid)   classGrid.hidden   = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.class-card');
      if (card && classGrid) {
        classGrid.querySelectorAll('.class-card').forEach(c => {
          c.classList.remove('selected');
        });
        card.classList.add('selected');
      }
      showDetail();
    });
  });

  document.querySelectorAll('[data-action="back-to-grid"]').forEach(btn => {
    btn.addEventListener('click', showGrid);
  });

  document.querySelectorAll('[data-action="choose-class"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextHref = btn.getAttribute('data-next');
      if (nextHref) window.location.href = nextHref;
      else showGrid();
    });
  });

  const skillsRoot = document.querySelector('[data-skills]');
  if (skillsRoot) {
    const countEl = document.querySelector('[data-count]');
    const maxEl   = document.querySelector('[data-max]');
    const max     = maxEl ? parseInt(maxEl.textContent, 10) : 2;

    skillsRoot.addEventListener('change', e => {
      if (!e.target.matches('input[data-skill]')) return;
      const boxes = skillsRoot.querySelectorAll('input[data-skill]:checked');
      if (boxes.length > max) {
        e.target.checked = false;
        return;
      }
      if (countEl) countEl.textContent = String(boxes.length);
    });
  }
})();
