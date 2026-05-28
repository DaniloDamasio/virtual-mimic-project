(() => {
  'use strict';

  Auth.requireAuth();

  const pageId = (document.body.dataset.page || '').trim();

  function readAccordionName(item) {
    const span = item.querySelector('.accordion-name');
    return span ? span.textContent.trim() : '';
  }

  document.querySelectorAll('[data-accordion]').forEach(list => {
    list.addEventListener('click', async e => {
      const chooseBtn = e.target.closest('.btn-choose');
      const header    = e.target.closest('.accordion-header');

      if (chooseBtn) {
        const item = chooseBtn.closest('.accordion-item');
        list.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        const slug = item.dataset.slug;
        const name = readAccordionName(item);
        const kind = list.dataset.accordion;
        const nextHref = list.getAttribute('data-next');

        try {
          if (kind === 'race' && slug) {
            const race = await Dnd5e.getRace(slug);
            Draft.set({
              raceSlug: slug,
              raceName: name,
              raceBonuses: Dnd5e.parseAbilityBonuses(race),
              raceSpeed: race.speed,
            });
          } else if (kind === 'background' && slug) {
            const BG_SKILLS_FALLBACK = {
              acolyte:          ['insight', 'religion'],
              'guild-artisan':  ['insight', 'persuasion'],
              entertainer:      ['acrobatics', 'performance'],
              charlatan:        ['deception', 'sleight-of-hand'],
              criminal:         ['deception', 'stealth'],
              hermit:           ['medicine', 'religion'],
              soldier:          ['athletics', 'intimidation'],
              sage:             ['arcana', 'history'],
            };
            let granted = BG_SKILLS_FALLBACK[slug] || [];
            try {
              const bg = await Dnd5e.getBackground(slug);
              const apiSkills = Dnd5e.parseBackgroundSkills(bg);
              if (apiSkills.length) granted = apiSkills;
            } catch (_) {}
            Draft.set({
              backgroundSlug: slug,
              backgroundName: name,
              grantedSkills: granted,
            });
          }
        } catch (err) {
          console.warn('dnd5eapi falhou; salvando só slug e nome:', err);
          if (kind === 'race')       Draft.set({ raceSlug: slug, raceName: name, raceBonuses: {} });
          if (kind === 'background') Draft.set({ backgroundSlug: slug, backgroundName: name, grantedSkills: [] });
        }

        if (nextHref) setTimeout(() => { window.location.href = nextHref; }, 220);
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

  const CLASS_DESCRIPTIONS = {
    barbarian: [
      'Um combatente feroz que canaliza sua força e instintos primitivos para dominar o campo de batalha. Diferente de outras classes mais técnicas ou estratégicas, o bárbaro luta movido pela emoção, pela sobrevivência e por uma fúria quase sobrenatural.',
      'Sua principal característica é a habilidade de entrar em estado de fúria, no qual seu poder físico aumenta significativamente, permitindo causar mais dano com ataques corpo a corpo e resistir a ferimentos que seriam fatais para outros aventureiros.',
    ],
    bard: [
      'O bardo é um conjurador versátil que une arte e magia. Por meio de música, poesia e palavras, inspira aliados, ridiculariza inimigos e tece magias que afetam mente e corpo.',
      'Curandeiro, suporte mágico e mestre dos truques sociais, o bardo brilha em qualquer situação onde palavras e presença importam tanto quanto força.',
    ],
    monk: [
      'O monge é um mestre das artes marciais que treina corpo e mente para canalizar uma energia mística chamada Chi. Sem precisar de armas pesadas ou armaduras, transforma seu próprio corpo em instrumento de combate.',
      'Ágil, disciplinado e resistente, o monge realiza ataques rápidos, esquiva-se de ataques inimigos e usa habilidades sobrenaturais de movimento e foco mental.',
    ],
    rogue: [
      'O ladino é um especialista em furtividade, engano e precisão. Vive das sombras, golpeando onde o inimigo menos espera e desaparecendo antes que possa reagir.',
      'Especialista em perícias, armadilhas e ataques precisos, o ladino faz mais dano quando pega o inimigo desprevenido e domina disfarces, fechaduras e trapaças.',
    ],
    paladin: [
      'O paladino é um guerreiro sagrado que combina força marcial com poder divino. Movido por um juramento, ele protege os inocentes, pune os malfeitores e canaliza magia para curar aliados e amaldiçoar inimigos.',
      'Equilibra combate corpo a corpo pesado com magia divina, sendo um defensor robusto e um símbolo vivo do código que escolheu seguir.',
    ],
    cleric: [
      'O clérigo é um servo divino que canaliza o poder de uma divindade para curar, abençoar e proteger. Suas magias provêm da fé e variam conforme o domínio escolhido.',
      'Capaz de combater corpo a corpo, conjurar magias poderosas e expulsar criaturas mortas-vivas, o clérigo é um pilar de qualquer grupo.',
    ],
  };

  const CAPABILITY_PT = {
    'Light Armor': 'Armaduras leves',
    'Medium Armor': 'Armaduras médias',
    'Heavy Armor': 'Armaduras pesadas',
    'Shields': 'Escudos',
    'Simple Weapons': 'Armas simples',
    'Martial Weapons': 'Armas marciais',
    'STR': 'Força', 'DEX': 'Destreza', 'CON': 'Constituição',
    'INT': 'Inteligência', 'WIS': 'Sabedoria', 'CHA': 'Carisma',
  };

  function translate(name) {
    return CAPABILITY_PT[name] || name;
  }

  async function populateClassDetail(slug, name) {
    if (!classDetail) return;
    const left = classDetail.querySelector('.detail-left');
    const right = classDetail.querySelector('.detail-right');
    if (!left || !right) return;

    const desc = CLASS_DESCRIPTIONS[slug] || ['Descrição indisponível.'];
    left.innerHTML = `
      <h2>Descrição</h2>
      ${desc.map(p => `<p>${p}</p>`).join('')}
      <h2>Características de Classe</h2>
      <ul class="detail-bullets" data-class-bullets><li>Carregando...</li></ul>
    `;
    right.innerHTML = `
      <div class="level-table-wrap">
        <table class="level-table">
          <caption>${name}</caption>
          <thead>
            <tr><th>Nível</th><th>Bônus de Proficiência</th><th>Características</th></tr>
          </thead>
          <tbody data-level-tbody>
            <tr><td colspan="3">Carregando...</td></tr>
          </tbody>
        </table>
      </div>
    `;

    try {
      const cls = await Dnd5e.getDndClass(slug);
      const armorProfs = (cls.proficiencies || [])
        .map(p => p.name)
        .filter(n => /Armor|Shields/.test(n))
        .map(translate);
      const weaponProfs = (cls.proficiencies || [])
        .map(p => p.name)
        .filter(n => /Weapons/.test(n))
        .map(translate);
      const saves = (cls.saving_throws || []).map(s => translate((s.index || '').toUpperCase().slice(0, 3)));
      const skillChoices = Dnd5e.parseClassSkillChoices(cls);
      const hitDie = cls.hit_die;
      const hpSubsequent = Math.floor(hitDie / 2) + 1;

      const bullets = [
        `<strong>Dado de Vida:</strong> 1d${hitDie} por nível.`,
        `<strong>PV no 1º nível:</strong> ${hitDie} + modificador de Constituição.`,
        `<strong>PV nos níveis seguintes:</strong> 1d${hitDie} (ou ${hpSubsequent}) + modificador de Constituição por nível.`,
        `<strong>Proficiências em Armaduras:</strong> ${armorProfs.length ? armorProfs.join(', ') : 'nenhuma'}.`,
        `<strong>Armas:</strong> ${weaponProfs.length ? weaponProfs.join(', ') : 'nenhuma'}.`,
        `<strong>Testes de Resistência:</strong> ${saves.join(', ') || '—'}.`,
        `<strong>Perícias:</strong> escolha ${skillChoices.choose || 2} dentre as disponíveis para a classe.`,
      ];
      const ul = left.querySelector('[data-class-bullets]');
      if (ul) ul.innerHTML = bullets.map(b => `<li>${b}</li>`).join('');

      const lvlData = await Dnd5e.dndFetch(`/classes/${slug}/levels`);
      const rows = (lvlData || []).slice(0, 20).map(l => {
        const features = (l.features || []).map(f => f.name).join(', ') || '—';
        return `<tr><td>${l.level}º</td><td>+${l.prof_bonus}</td><td>${features}</td></tr>`;
      }).join('');
      const tbody = right.querySelector('[data-level-tbody]');
      if (tbody) tbody.innerHTML = rows || '<tr><td colspan="3">Sem dados.</td></tr>';
    } catch (err) {
      const ul = left.querySelector('[data-class-bullets]');
      if (ul) ul.innerHTML = '<li>Não foi possível carregar dados desta classe.</li>';
      const tbody = right.querySelector('[data-level-tbody]');
      if (tbody) tbody.innerHTML = '<tr><td colspan="3">Indisponível.</td></tr>';
    }
  }

  let lastClassCard = null;
  document.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.class-card');
      if (card && classGrid) {
        classGrid.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        lastClassCard = card;
        const slug = card.dataset.slug;
        const name = card.querySelector('.class-name')?.textContent.trim() || '';
        populateClassDetail(slug, name);
      }
      showDetail();
    });
  });

  document.querySelectorAll('[data-action="back-to-grid"]').forEach(btn => {
    btn.addEventListener('click', showGrid);
  });

  document.querySelectorAll('[data-action="choose-class"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = lastClassCard || classGrid?.querySelector('.class-card.selected');
      if (card) {
        const slug = card.dataset.slug;
        const name = card.querySelector('.class-name')?.textContent.trim() || '';
        try {
          const cls = await Dnd5e.getDndClass(slug);
          Draft.set({
            classSlug: slug,
            className: name,
            hitDie: cls.hit_die,
            savingThrows: Dnd5e.parseSavingThrows(cls),
            classSkillChoices: Dnd5e.parseClassSkillChoices(cls),
          });
        } catch (err) {
          console.warn('dnd5eapi class falhou; usando fallback:', err);
          Draft.set({
            classSlug: slug, className: name, hitDie: 8,
            savingThrows: [], classSkillChoices: { choose: 2, options: [] },
          });
        }
      }
      const nextHref = btn.getAttribute('data-next');
      if (nextHref) window.location.href = nextHref;
      else showGrid();
    });
  });

  const attrContainer = document.getElementById('attributes-container');
  if (attrContainer) {
    const attributesMeta = [
      { id: 'forca',        name: 'Força',        description: 'O atributo de Força representa o poder físico bruto de um personagem. Ele é usado principalmente para determinar a eficácia em ataques corpo a corpo, a capacidade de causar dano com armas pesadas e a facilidade em realizar ações como empurrar, escalar, puxar ou levantar objetos.' },
      { id: 'inteligencia', name: 'Inteligência', description: 'A Inteligência mede a agudeza mental, raciocínio lógico e conhecimento acumulado. É crucial para magos para conjurar magias e para todos os personagens em testes de conhecimento, investigação e habilidades analíticas.' },
      { id: 'constituicao', name: 'Constituição', description: 'A Constituição representa a saúde, vigor e força vital. Ela determina seus pontos de vida máximos, resistência física a venenos, doenças e fadiga.' },
      { id: 'sabedoria',    name: 'Sabedoria',    description: 'A Sabedoria reflete a intuição, percepção e força de vontade. Ela é fundamental para clérigos e druidas para conjurar magias e é usada para testes de percepção, sobrevivência e para resistir a efeitos mentais.' },
      { id: 'destreza',     name: 'Destreza',     description: 'A Destreza mede a agilidade, reflexos e coordenação. É vital para ladinos e arqueiros, e é usada para testes de acrobacia, furtividade, esquiva de ataques e para manusear armas ágeis e de longo alcance.' },
      { id: 'carisma',      name: 'Carisma',      description: 'O Carisma representa a força de personalidade, capacidade de liderança e charme. É essencial para bardos, feiticeiros e paladinos para conjurar magias e é usado para testes de diplomacia, intimidação, engano e atuação.' },
    ];

    const stored = Draft.get().attributesRaw || {};
    const attributesData = attributesMeta.map(m => ({ ...m, value: stored[m.id] ?? 8 }));

    const ABILITY_CODE_BY_ID = {
      forca: 'STR', destreza: 'DEX', constituicao: 'CON',
      inteligencia: 'INT', sabedoria: 'WIS', carisma: 'CHA',
    };
    const draftCurrent = Draft.get();
    const raceBonuses = draftCurrent.raceBonuses || {};
    const raceName = draftCurrent.raceName || '';

    const POINTS_BUDGET = 24;
    const ATTR_MIN = 8;
    const ATTR_MAX = 15;
    const costTable = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

    function bonusFor(attrId) {
      const code = ABILITY_CODE_BY_ID[attrId];
      return raceBonuses[code] || 0;
    }

    const pointsEl = document.getElementById('points-value');
    const modalEl = document.getElementById('attribute-modal');
    const modalTitleEl = document.getElementById('modal-title-text');
    const modalBodyEl = document.getElementById('modal-body-text');

    function calcMod(v) {
      const m = Math.floor((v - 10) / 2);
      return m >= 0 ? `+${m}` : String(m);
    }
    function totalCost() {
      return attributesData.reduce((s, a) => s + costTable[a.value], 0);
    }
    function persist() {
      const raw = {};
      attributesData.forEach(a => { raw[a.id] = a.value; });
      Draft.set({ attributesRaw: raw });
    }
    function ensureRaceBanner() {
      if (document.getElementById('race-bonus-banner')) return;
      const stage = document.querySelector('.attr-stage');
      if (!stage) return;
      const banner = document.createElement('div');
      banner.id = 'race-bonus-banner';
      banner.style.cssText = 'text-align:center;margin:0 auto 18px;padding:10px 18px;color:var(--accent);border:1px solid var(--divider-gold);border-radius:4px;background:rgba(60,6,6,0.4);font-family:var(--font-display);letter-spacing:0.04em;max-width:680px;font-size:0.95rem';
      const parts = Object.entries(raceBonuses)
        .filter(([, v]) => v && v !== 0)
        .map(([code, v]) => `${({STR:'Força',DEX:'Destreza',CON:'Constituição',INT:'Inteligência',WIS:'Sabedoria',CHA:'Carisma'})[code]} +${v}`);
      if (parts.length === 0) {
        banner.textContent = raceName ? `Raça selecionada: ${raceName} — sem bônus de atributo.` : '';
      } else {
        banner.textContent = `Bônus de ${raceName}: ${parts.join(', ')} (já somado no valor final)`;
      }
      if (banner.textContent) stage.parentNode.insertBefore(banner, stage);
    }
    function render() {
      ensureRaceBanner();
      attrContainer.innerHTML = attributesData.map(attr => {
        const finalVal = attr.value + bonusFor(attr.id);
        return `
        <div class="attr-card" data-attr-id="${attr.id}">
          <div class="attr-shield-outer">
            <div class="attr-shield-inner">
              <button class="attr-name-btn" type="button" data-attr-open>${attr.name.toUpperCase()}</button>
              <span class="attr-value">${finalVal}</span>
            </div>
          </div>
          <div class="attr-mod-group">
            <button class="attr-step-btn" type="button" data-attr-step="-1">−</button>
            <div class="attr-mod-circle">${calcMod(finalVal)}</div>
            <button class="attr-step-btn" type="button" data-attr-step="+1">+</button>
          </div>
        </div>
      `;
      }).join('');
      if (pointsEl) pointsEl.textContent = String(POINTS_BUDGET - totalCost());
    }
    function changeValue(id, delta) {
      const a = attributesData.find(x => x.id === id);
      if (!a) return;
      const newValue = a.value + delta;
      if (newValue < ATTR_MIN || newValue > ATTR_MAX) return;
      const projected = totalCost() - costTable[a.value] + costTable[newValue];
      if (projected > POINTS_BUDGET) return;
      a.value = newValue;
      persist();
      render();
    }
    function openModal(id) {
      const a = attributesData.find(x => x.id === id);
      if (!a || !modalEl) return;
      if (modalTitleEl) modalTitleEl.textContent = a.name;
      if (modalBodyEl)  modalBodyEl.textContent  = a.description;
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
        if (e.target === modalEl || e.target.closest('[data-attr-modal-close]')) closeModal();
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    }
    render();
    persist();
  }

  const skillsRoot = document.querySelector('[data-skills]');
  if (skillsRoot) {
    const draft = Draft.get();
    const choices = draft.classSkillChoices || { choose: 2, options: [] };
    const granted = new Set(draft.grantedSkills || []);
    const selectable = new Set(choices.options || []);
    const max = choices.choose ?? 2;

    const countEl = document.querySelector('[data-count]');
    const maxEl = document.querySelector('[data-max]');
    if (maxEl) maxEl.textContent = String(max);

    const conRaw = (draft.attributesRaw || {});
    function abilityScoreOf(code) {
      const map = {
        STR: conRaw.forca ?? 10, DEX: conRaw.destreza ?? 10, CON: conRaw.constituicao ?? 10,
        INT: conRaw.inteligencia ?? 10, WIS: conRaw.sabedoria ?? 10, CHA: conRaw.carisma ?? 10,
      };
      return map[code];
    }
    function baseModFor(skillSlug) {
      const s = Dnd5e.SKILL_BY_SLUG[skillSlug];
      if (!s) return 0;
      return Math.floor((abilityScoreOf(s.ability) - 10) / 2);
    }
    function fmtMod(m) { return m >= 0 ? `+${m}` : String(m); }
    const PROFICIENCY_BONUS_LV1 = 2;

    if (selectable.size > 0 || granted.size > 0) {
      const ordered = Dnd5e.SKILLS_5E.slice().sort((a, b) => a.pt.localeCompare(b.pt, 'pt-BR'));
      skillsRoot.innerHTML = ordered.map(skill => {
        const isGranted = granted.has(skill.slug);
        const isSelectable = selectable.has(skill.slug) && !isGranted;
        const mod = baseModFor(skill.slug) + (isGranted ? PROFICIENCY_BONUS_LV1 : 0);
        const checkbox = isSelectable
          ? `<label class="skill-check"><input type="checkbox" data-skill data-slug="${skill.slug}"><span class="box" aria-hidden="true"></span></label>`
          : `<span></span>`;
        const cls = isSelectable ? 'skill-row available' : 'skill-row';
        return `
          <li class="${cls}" data-slug="${skill.slug}">
            <span class="skill-name">${skill.pt} <span class="skill-attr">(${skill.ability.slice(0,3)})</span></span>
            <span class="skill-mod" data-mod-cell>(${fmtMod(mod)})</span>
            ${checkbox}
          </li>`;
      }).join('');
    }

    function refreshModFor(slug) {
      const row = skillsRoot.querySelector(`li[data-slug="${slug}"]`);
      if (!row) return;
      const isGranted = granted.has(slug);
      const cb = row.querySelector('input[data-skill]');
      const isProf = isGranted || (cb && cb.checked);
      const mod = baseModFor(slug) + (isProf ? PROFICIENCY_BONUS_LV1 : 0);
      const modCell = row.querySelector('[data-mod-cell]');
      if (modCell) modCell.textContent = `(${fmtMod(mod)})`;
    }

    function updateCount() {
      const chosen = Array.from(skillsRoot.querySelectorAll('input[data-skill]:checked'))
        .map(c => c.dataset.slug);
      if (countEl) countEl.textContent = String(chosen.length);
      Draft.set({ chosenSkills: chosen });
    }

    const preChosen = new Set(Draft.get().chosenSkills || []);
    skillsRoot.querySelectorAll('input[data-skill]').forEach(c => {
      if (preChosen.has(c.dataset.slug)) {
        c.checked = true;
        refreshModFor(c.dataset.slug);
      }
    });
    updateCount();

    skillsRoot.addEventListener('change', e => {
      if (!e.target.matches('input[data-skill]')) return;
      const boxes = skillsRoot.querySelectorAll('input[data-skill]:checked');
      if (boxes.length > max) {
        e.target.checked = false;
        return;
      }
      refreshModFor(e.target.dataset.slug);
      updateCount();
    });
  }

  if (pageId === 'finals') {
    const draft = Draft.get();
    const fName = document.getElementById('finals-personagem');
    const fPlayer = document.getElementById('finals-jogador');
    const fApp = document.getElementById('finals-aparencia');
    const fPers = document.getElementById('finals-personalidade');
    const fGoals = document.getElementById('finals-objetivos');
    const fHist = document.getElementById('finals-historia');

    if (fName)  fName.value = draft.characterName || '';
    if (fPlayer) fPlayer.value = draft.playerName || Auth.getUser()?.name || '';
    if (fApp)   fApp.value = draft.characterAppearance || '';
    if (fPers)  fPers.value = draft.personalityTraits || '';
    if (fGoals) fGoals.value = draft.goals || '';
    if (fHist)  fHist.value = draft.characterHistory || '';

    function snapshotFinalsToDraft() {
      Draft.set({
        characterName: fName?.value.trim() || '',
        playerName: fPlayer?.value.trim() || '',
        characterAppearance: fApp?.value.trim() || '',
        personalityTraits: fPers?.value.trim() || '',
        goals: fGoals?.value.trim() || '',
        characterHistory: fHist?.value.trim() || '',
      });
    }
    snapshotFinalsToDraft();

    [fName, fPlayer, fApp, fPers, fGoals, fHist].forEach(el => {
      if (!el) return;
      el.addEventListener('input', snapshotFinalsToDraft);
    });

    const submitBtn = document.querySelector('[data-action="finalize"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        submitBtn.disabled = true;
        snapshotFinalsToDraft();
        const d = Draft.get();
        if (!d.characterName) {
          alert('Preencha pelo menos o nome do personagem.');
          submitBtn.disabled = false;
          return;
        }
        if (!d.raceSlug || !d.classSlug || !d.backgroundSlug) {
          alert('Volte e complete raça, classe e antecedente antes de concluir.');
          submitBtn.disabled = false;
          return;
        }

        const raw = d.attributesRaw || { forca:8,destreza:8,constituicao:8,inteligencia:8,sabedoria:8,carisma:8 };
        const bonuses = d.raceBonuses || {};
        const finalAttr = (raw, abilityCode) => raw + (bonuses[abilityCode] || 0);

        const skills = new Set([...(d.grantedSkills || []), ...(d.chosenSkills || [])]);

        const payload = {
          characterName: d.characterName,
          characterLastName: d.characterLastName || null,
          playerName: d.playerName || null,
          characterAge: d.characterAge || null,
          characterHistory: d.characterHistory || null,
          characterAppearance: d.characterAppearance || null,
          personalityTraits: d.personalityTraits || null,
          ideals: d.ideals || null,
          bonds: d.bonds || null,
          flaws: d.flaws || null,
          goals: d.goals || null,
          alignment: d.alignment || null,
          strength:     finalAttr(raw.forca,        'STR'),
          dexterity:    finalAttr(raw.destreza,     'DEX'),
          constitution: finalAttr(raw.constituicao, 'CON'),
          intelligence: finalAttr(raw.inteligencia, 'INT'),
          wisdom:       finalAttr(raw.sabedoria,    'WIS'),
          charisma:     finalAttr(raw.carisma,      'CHA'),
          raceSlug: d.raceSlug,
          raceName: d.raceName,
          classSlug: d.classSlug,
          className: d.className,
          hitDie: d.hitDie || 8,
          backgroundSlug: d.backgroundSlug,
          backgroundName: d.backgroundName,
          skillProficiencies: Array.from(skills),
          savingThrowProficiencies: d.savingThrows || [],
          speed: d.raceSpeed || 30,
        };

        try {
          await apiFetch('/characters', { method: 'POST', body: JSON.stringify(payload) });
          Draft.clear();
          window.location.href = 'personagens.html';
        } catch (err) {
          alert('Falha ao criar personagem: ' + err.message);
          submitBtn.disabled = false;
        }
      });
    }
  }
})();
