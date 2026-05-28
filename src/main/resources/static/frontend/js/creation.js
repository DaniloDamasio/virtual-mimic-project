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

  const attrContainer = document.getElementById('attributes-container');
  if (attrContainer) {
    const attributesData = [
      {
        id: 'forca',
        name: 'Força',
        value: 8,
        description: 'O atributo de Força representa o poder físico bruto de um personagem. Ele é usado principalmente para determinar a eficácia em ataques corpo a corpo, a capacidade de causar dano com armas pesadas e a facilidade em realizar ações como empurrar, escalar, puxar ou levantar objetos.'
      },
      {
        id: 'inteligencia',
        name: 'Inteligência',
        value: 8,
        description: 'A Inteligência mede a agudeza mental, raciocínio lógico e conhecimento acumulado. É crucial para magos para conjurar magias e para todos os personagens em testes de conhecimento, investigação e habilidades analíticas.'
      },
      {
        id: 'constituicao',
        name: 'Constituição',
        value: 8,
        description: 'A Constituição representa a saúde, vigor e força vital. Ela determina seus pontos de vida máximos, resistência física a venenos, doenças e fadiga.'
      },
      {
        id: 'sabedoria',
        name: 'Sabedoria',
        value: 8,
        description: 'A Sabedoria reflete a intuição, percepção e força de vontade. Ela é fundamental para clérigos e druidas para conjurar magias e é usada para testes de percepção, sobrevivência e para resistir a efeitos mentais.'
      },
      {
        id: 'destreza',
        name: 'Destreza',
        value: 8,
        description: 'A Destreza mede a agilidade, reflexos e coordenação. É vital para ladinos e arqueiros, e é usada para testes de acrobacia, furtividade, esquiva de ataques e para manusear armas ágeis e de longo alcance.'
      },
      {
        id: 'carisma',
        name: 'Carisma',
        value: 8,
        description: 'O Carisma representa a força de personalidade, capacidade de liderança e charme. É essencial para bardos, feiticeiros e paladinos para conjurar magias e é usado para testes de diplomacia, intimidação, engano e atuação.'
      }
    ];

    const POINTS_BUDGET = 24;
    const ATTR_MIN = 8;
    const ATTR_MAX = 15;
    const costTable = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

    const pointsEl = document.getElementById('points-value');
    const modalEl  = document.getElementById('attribute-modal');
    const modalTitleEl = document.getElementById('modal-title-text');
    const modalBodyEl  = document.getElementById('modal-body-text');

    function calculateModifier(val) {
      const mod = Math.floor((val - 10) / 2);
      return mod >= 0 ? `+${mod}` : String(mod);
    }

    function totalCost() {
      return attributesData.reduce((sum, a) => sum + costTable[a.value], 0);
    }

    function render() {
      attrContainer.innerHTML = attributesData.map(attr => `
        <div class="attr-card" data-attr-id="${attr.id}">
          <div class="attr-shield-outer">
            <div class="attr-shield-inner">
              <button class="attr-name-btn" type="button" data-attr-open>${attr.name.toUpperCase()}</button>
              <span class="attr-value">${attr.value}</span>
            </div>
          </div>
          <div class="attr-mod-group">
            <button class="attr-step-btn" type="button" data-attr-step="-1">−</button>
            <div class="attr-mod-circle">${calculateModifier(attr.value)}</div>
            <button class="attr-step-btn" type="button" data-attr-step="+1">+</button>
          </div>
        </div>
      `).join('');

      if (pointsEl) pointsEl.textContent = String(POINTS_BUDGET - totalCost());
    }

    function changeValue(id, delta) {
      const attr = attributesData.find(a => a.id === id);
      if (!attr) return;
      const newValue = attr.value + delta;
      if (newValue < ATTR_MIN || newValue > ATTR_MAX) return;
      const projectedCost = totalCost() - costTable[attr.value] + costTable[newValue];
      if (projectedCost > POINTS_BUDGET) return;
      attr.value = newValue;
      render();
    }

    function openModal(id) {
      const attr = attributesData.find(a => a.id === id);
      if (!attr || !modalEl) return;
      if (modalTitleEl) modalTitleEl.textContent = attr.name;
      if (modalBodyEl)  modalBodyEl.textContent  = attr.description;
      modalEl.classList.add('active');
      document.body.classList.add('attr-modal-open');
    }

    function closeModal() {
      if (!modalEl) return;
      modalEl.classList.remove('active');
      document.body.classList.remove('attr-modal-open');
    }

    attrContainer.addEventListener('click', e => {
      const openBtn = e.target.closest('[data-attr-open]');
      if (openBtn) {
        const card = openBtn.closest('.attr-card');
        if (card) openModal(card.dataset.attrId);
        return;
      }
      const stepBtn = e.target.closest('[data-attr-step]');
      if (stepBtn) {
        const card = stepBtn.closest('.attr-card');
        if (card) changeValue(card.dataset.attrId, parseInt(stepBtn.dataset.attrStep, 10));
      }
    });

    if (modalEl) {
      modalEl.addEventListener('click', e => {
        if (e.target === modalEl || e.target.closest('[data-attr-modal-close]')) {
          closeModal();
        }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
      });
    }

    render();
  }
})();
