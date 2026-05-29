(() => {
  'use strict';

  Auth.requireAuth();

  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('id');
  if (!characterId) {
    alert('Personagem não informado.');
    window.location.replace('characters.html');
    return;
  }

  const ABILITY_PT_BR = (window.Dnd5e && Dnd5e.ABILITY_PT_BR) || {
    STR:'Força', DEX:'Destreza', CON:'Constituição', INT:'Inteligência', WIS:'Sabedoria', CHA:'Carisma',
  };
  const SKILLS_5E = (window.Dnd5e && Dnd5e.SKILLS_5E) || [];

  const ABILITY_BY_PT = {
    'Força':'STR','Destreza':'DEX','Constituição':'CON','Inteligência':'INT','Sabedoria':'WIS','Carisma':'CHA',
  };

  const SPELLCASTING_ABILITY = {
    bard: 'CHA', cleric: 'WIS', druid: 'WIS', paladin: 'CHA',
    ranger: 'WIS', sorcerer: 'CHA', warlock: 'CHA', wizard: 'INT',
  };

  const FULL_CASTER_SLOTS = [
    [],
    [2],
    [3],
    [4,2],
    [4,3],
    [4,3,2],
    [4,3,3],
    [4,3,3,1],
    [4,3,3,2],
    [4,3,3,3,1],
    [4,3,3,3,2],
    [4,3,3,3,2,1],
    [4,3,3,3,2,1],
    [4,3,3,3,2,1,1],
    [4,3,3,3,2,1,1],
    [4,3,3,3,2,1,1,1],
    [4,3,3,3,2,1,1,1],
    [4,3,3,3,2,1,1,1,1],
    [4,3,3,3,3,1,1,1,1],
    [4,3,3,3,3,2,1,1,1],
    [4,3,3,3,3,2,2,1,1],
  ];

  const HALF_CASTER_SLOTS = [
    [],
    [],
    [2],
    [3],
    [3],
    [4,2],
    [4,2],
    [4,3],
    [4,3],
    [4,3,2],
    [4,3,2],
    [4,3,3],
    [4,3,3],
    [4,3,3,1],
    [4,3,3,1],
    [4,3,3,2],
    [4,3,3,2],
    [4,3,3,3,1],
    [4,3,3,3,1],
    [4,3,3,3,2],
    [4,3,3,3,2],
  ];

  function spellSlotsFor(slug, level) {
    if (!slug || !level || level < 1) return [];
    const FULL = new Set(['bard', 'cleric', 'druid', 'sorcerer', 'wizard']);
    const HALF = new Set(['paladin', 'ranger', 'artificer']);
    const table = FULL.has(slug) ? FULL_CASTER_SLOTS : HALF.has(slug) ? HALF_CASTER_SLOTS : null;
    if (!table) return [];
    const lvl = Math.min(level, table.length - 1);
    return table[lvl] || [];
  }

  function classResourceFor(slug, level) {
    if (!slug || !level) return null;
    if (slug === 'barbarian') {
      const rages = level >= 17 ? 'Ilimitado' : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2;
      return { label: 'Pontos de Fúria', max: rages };
    }
    if (slug === 'monk') return { label: 'Pontos de Ki', max: level };
    if (slug === 'sorcerer' && level >= 2) return { label: 'Pontos de Feitiçaria', max: level };
    if (slug === 'paladin' && level >= 2) return { label: 'Pontos de Imposição de Mãos', max: level * 5 };
    if (slug === 'bard') return { label: 'Inspirações Bárdicas', max: level >= 5 ? 'CHA mod (recup. desc. curto)' : 'CHA mod (recup. desc. longo)' };
    return null;
  }

  let character = null;

  const panels = document.querySelectorAll('[data-tab-panel]');
  document.querySelectorAll('.ficha-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.ficha-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach(p => { p.hidden = p.dataset.tabPanel !== target; });
    });
  });

  function mod(v) { return Math.floor((v - 10) / 2); }
  function fmtMod(m) { return m >= 0 ? `+${m}` : String(m); }

  function abilityScore(code) {
    const map = {
      STR: character.strength, DEX: character.dexterity, CON: character.constitution,
      INT: character.intelligence, WIS: character.wisdom, CHA: character.charisma,
    };
    return map[code];
  }

  function ensureDetailModal() {
    let overlay = document.getElementById('vm-detail-modal');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'vm-detail-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);display:none;align-items:center;justify-content:center;z-index:9998;font-family:"Cinzel",serif';
    overlay.innerHTML = `
      <div style="background:#1c1410;color:#f1e7d0;border:2px solid #c9a14b;border-radius:8px;padding:28px 32px;max-width:560px;width:92%;max-height:82vh;display:flex;flex-direction:column">
        <h2 data-detail-title style="margin:0 0 14px;color:#c9a14b;font-size:1.4rem;letter-spacing:0.05em">—</h2>
        <div data-detail-body style="overflow-y:auto;max-height:60vh;line-height:1.55;font-family:'Crimson Text',serif;font-size:1.02rem;color:#f1e7d0"></div>
        <button type="button" data-detail-close style="margin-top:20px;padding:10px 28px;background:#c9a14b;color:#1c1410;border:0;border-radius:4px;cursor:pointer;font-family:inherit;font-weight:600;letter-spacing:0.05em;align-self:flex-end">FECHAR</button>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => { overlay.style.display = 'none'; };
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('[data-detail-close]').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    return overlay;
  }

  function showDetailModal(title, bodyHtml) {
    const overlay = ensureDetailModal();
    overlay.querySelector('[data-detail-title]').textContent = title;
    overlay.querySelector('[data-detail-body]').innerHTML = bodyHtml;
    overlay.style.display = 'flex';
  }

  function row(label, value) {
    if (value == null || value === '') return '';
    return `<p style="margin:6px 0"><strong style="color:#c9a14b">${label}:</strong> ${value}</p>`;
  }

  async function showSpellDetail(slug, fallbackName) {
    showDetailModal(fallbackName || 'Magia', '<p>Carregando...</p>');
    try {
      const sp = await Dnd5e.getSpell(slug);
      const desc = (sp.desc || []).map(p => `<p>${p}</p>`).join('') || '<p>—</p>';
      const higher = (sp.higher_level || []).map(p => `<p>${p}</p>`).join('');
      const body = `
        ${row('Nível', sp.level === 0 ? 'Truque' : sp.level)}
        ${row('Escola', sp.school ? sp.school.name : '')}
        ${row('Tempo de conjuração', sp.casting_time || '')}
        ${row('Alcance', sp.range || '')}
        ${row('Componentes', (sp.components || []).join(', '))}
        ${row('Duração', sp.duration || '')}
        <hr style="border:0;border-top:1px solid rgba(201,161,75,0.3);margin:12px 0">
        ${desc}
        ${higher ? `<p style="margin-top:10px"><strong style="color:#c9a14b">Em níveis superiores:</strong></p>${higher}` : ''}
      `;
      showDetailModal(sp.name, body);
    } catch (err) {
      showDetailModal(fallbackName || 'Magia', '<p>Não foi possível carregar os detalhes.</p>');
    }
  }

  const FEAT_CATEGORY_PT = { CLASS: 'Habilidade de Classe', RACE: 'Habilidade de Raça', FEAT: 'Talento', OTHER: 'Outro' };
  const FEAT_ACTION_PT = { PASSIVE: 'Passiva', ACTION: 'Ação', BONUS_ACTION: 'Ação bônus', REACTION: 'Reação', MOVEMENT: 'Movimento', OTHER: 'Outro' };

  function showFeatDetail(f) {
    const body = `
      ${row('Categoria', FEAT_CATEGORY_PT[f.category] || f.category)}
      ${row('Tipo de ação', FEAT_ACTION_PT[f.actionType] || f.actionType)}
      ${row('Custo / recurso', f.cost)}
      <hr style="border:0;border-top:1px solid rgba(201,161,75,0.3);margin:12px 0">
      <p>${(f.description || 'Sem descrição.').replace(/\n/g, '<br>')}</p>
    `;
    showDetailModal(f.name, body);
  }

  function showManualSpellDetail(sp) {
    const body = `
      ${row('Nível', sp.level === 0 ? 'Truque' : sp.level)}
      ${row('Escola', sp.school)}
      ${row('Tempo de conjuração', sp.castingTime)}
      ${row('Alcance', sp.range)}
      ${row('Componentes', sp.components)}
      ${row('Duração', sp.duration)}
      <hr style="border:0;border-top:1px solid rgba(201,161,75,0.3);margin:12px 0">
      <p>${(sp.description || 'Sem descrição.').replace(/\n/g, '<br>')}</p>
    `;
    showDetailModal(sp.name, body);
  }

  function showManualEquipmentDetail(it) {
    const body = `
      ${row('Categoria', it.type)}
      ${row('Quantidade', it.quantity)}
      ${row('Peso', it.weight)}
      ${row('Dano', it.damageDice)}
      ${row('Classe de armadura', it.armorClassBonus)}
      <hr style="border:0;border-top:1px solid rgba(201,161,75,0.3);margin:12px 0">
      <p>${(it.description || 'Sem descrição.').replace(/\n/g, '<br>')}</p>
    `;
    showDetailModal(it.name, body);
  }

  async function showEquipmentDetail(slug, fallbackName) {
    if (!slug) {
      showDetailModal(fallbackName || 'Item', '<p>Sem detalhes adicionais para este item.</p>');
      return;
    }
    showDetailModal(fallbackName || 'Item', '<p>Carregando...</p>');
    try {
      const eq = await Dnd5e.getEquipment(slug);
      const dmg = eq.damage ? `${eq.damage.damage_dice} ${eq.damage.damage_type ? '(' + eq.damage.damage_type.name + ')' : ''}` : '';
      const ac = eq.armor_class ? `${eq.armor_class.base}${eq.armor_class.dex_bonus ? ' + DEX' : ''}` : '';
      const props = (eq.properties || []).map(p => p.name).join(', ');
      const desc = (eq.desc || []).map(p => `<p>${p}</p>`).join('');
      const body = `
        ${row('Categoria', eq.equipment_category ? eq.equipment_category.name : '')}
        ${row('Custo', eq.cost ? `${eq.cost.quantity} ${eq.cost.unit}` : '')}
        ${row('Peso', eq.weight)}
        ${row('Dano', dmg)}
        ${row('Alcance', eq.range ? `${eq.range.normal}${eq.range.long ? ' / ' + eq.range.long : ''}` : '')}
        ${row('Classe de armadura', ac)}
        ${row('Força mínima', eq.str_minimum > 0 ? eq.str_minimum : '')}
        ${row('Propriedades', props)}
        ${desc ? '<hr style="border:0;border-top:1px solid rgba(201,161,75,0.3);margin:12px 0">' + desc : ''}
      `;
      showDetailModal(eq.name, body || '<p>Sem detalhes.</p>');
    } catch (err) {
      showDetailModal(fallbackName || 'Item', '<p>Não foi possível carregar os detalhes.</p>');
    }
  }

  async function showFeatureDetail(url, fallbackName) {
    if (!url) {
      showDetailModal(fallbackName || 'Habilidade', '<p>Sem detalhes adicionais.</p>');
      return;
    }
    showDetailModal(fallbackName || 'Habilidade', '<p>Carregando...</p>');
    try {
      const path = url.replace(/^.*\/api/, '');
      const f = await Dnd5e.dndFetch(path);
      const desc = (f.desc || []).map(p => `<p>${p}</p>`).join('') || '<p>—</p>';
      const body = `
        ${row('Nível', f.level)}
        ${row('Classe', f.class ? f.class.name : '')}
        ${row('Raça', f.race ? f.race.name : '')}
        <hr style="border:0;border-top:1px solid rgba(201,161,75,0.3);margin:12px 0">
        ${desc}
      `;
      showDetailModal(f.name, body);
    } catch (err) {
      showDetailModal(fallbackName || 'Habilidade', '<p>Não foi possível carregar os detalhes.</p>');
    }
  }

  function computeArmorClass() {
    const dex = character.dexterity != null ? character.dexterity : 10;
    const dexMod = Math.floor((dex - 10) / 2);
    const items = character.inventory || [];

    const armors = items.filter(it => it.type === 'ARMOR'
      && it.armorCategory !== 'SHIELD'
      && it.armorClassBonus != null);
    const shield = items.find(it => it.type === 'ARMOR' && it.armorCategory === 'SHIELD');

    let base = 10 + dexMod;
    let chosen = null;
    armors.forEach(a => {
      const cat = a.armorCategory;
      let total;
      if (cat === 'LIGHT')      total = a.armorClassBonus + dexMod;
      else if (cat === 'MEDIUM') total = a.armorClassBonus + Math.min(dexMod, 2);
      else if (cat === 'HEAVY')  total = a.armorClassBonus;
      else                       total = a.armorClassBonus + dexMod;
      if (total > base) { base = total; chosen = a; }
    });

    if (shield) base += 2;
    return base;
  }

  async function recomputeArmorClass() {
    const computed = computeArmorClass();
    if (computed === character.armorClass) return;
    try {
      character = await patchAndReturn({ armorClass: computed });
    } catch (_) {}
  }

  function patchCharacter(partial) {
    return apiFetch(`/characters/${characterId}`, {
      method: 'PATCH',
      body: JSON.stringify(partial),
    }).then(updated => { character = updated; });
  }

  function patchAndReturn(partial) {
    return apiFetch(`/characters/${characterId}`, {
      method: 'PATCH',
      body: JSON.stringify(partial),
    });
  }

  function wirePhoto() {
    const photoBox = document.querySelector('.ficha-photo');
    if (!photoBox) return;
    const key = `vm_photo_${characterId}`;
    const saved = localStorage.getItem(key);

    function applyPhoto(dataUrl) {
      photoBox.textContent = '';
      photoBox.style.cssText = `
        background-image: url('${dataUrl}');
        background-size: cover;
        background-position: center;
      `;
    }
    if (saved) applyPhoto(saved);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    photoBox.appendChild(input);

    photoBox.style.cursor = 'pointer';
    photoBox.title = 'Clique para escolher uma foto';
    photoBox.addEventListener('click', e => {
      if (e.target === input) return;
      input.click();
    });
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        try {
          localStorage.setItem(key, dataUrl);
          applyPhoto(dataUrl);
        } catch (_) {
          alert('Imagem muito grande para salvar localmente.');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function renderInfo() {
    const fichaCol = document.querySelector('.ficha-grid .ficha-col');
    if (!fichaCol) return;
    const infoRows = fichaCol.querySelectorAll('.ficha-info .info-row');
    if (infoRows.length >= 5) {
      const fullName = [character.characterName, character.characterLastName].filter(Boolean).join(' ');
      infoRows[0].lastElementChild.textContent = fullName;
      infoRows[1].lastElementChild.textContent = character.playerName || '';
      infoRows[2].lastElementChild.textContent = character.className || '';
      infoRows[3].lastElementChild.textContent = character.raceName || '';
      infoRows[4].lastElementChild.textContent = character.backgroundName || '';
    }
    const levelRow = fichaCol.querySelector('.info-level .level-stepper span');
    if (levelRow) levelRow.textContent = String(character.currentLevel);

    const lifeStepper = fichaCol.querySelector('.life-stepper span');
    if (lifeStepper) lifeStepper.textContent = `${character.currentHealth}/${character.maxHealth}`;

    const statRows = fichaCol.querySelectorAll('.ficha-stats .stat-row');
    if (statRows.length >= 5) {
      statRows[0].lastElementChild.textContent = character.hitDie ? `1D${character.hitDie}` : '—';
      statRows[1].lastElementChild.textContent = character.speed ? `${character.speed} pés` : '—';
      const wisMod = mod(character.wisdom);
      const perceptionProf = (character.skillProficiencies || []).includes('perception');
      const passivePerception = 10 + wisMod + (perceptionProf ? character.proficiencyBonus : 0);
      statRows[2].lastElementChild.textContent = String(passivePerception);
      statRows[3].lastElementChild.textContent = fmtMod(character.proficiencyBonus);
      statRows[4].lastElementChild.textContent = String(character.armorClass);
    }
  }

  function wireSteppers() {
    const fichaCol = document.querySelector('.ficha-grid .ficha-col');
    if (!fichaCol) return;

    const levelBtns = fichaCol.querySelectorAll('.info-level .level-stepper button');
    if (levelBtns.length === 2) {
      const afterLevelChange = () => {
        renderInfo();
        renderSaves();
        renderSkills();
        renderSpells();
        renderFeatures();
      };
      levelBtns[0].addEventListener('click', async () => {
        try {
          character = await apiFetch(`/characters/${characterId}/level-down`, { method: 'POST' });
          afterLevelChange();
        } catch (err) { alert('Falha ao descer nível: ' + err.message); }
      });
      levelBtns[1].addEventListener('click', async () => {
        try {
          character = await apiFetch(`/characters/${characterId}/level-up`, { method: 'POST' });
          afterLevelChange();
        } catch (err) { alert('Falha ao subir de nível: ' + err.message); }
      });
    }

    const lifeStepper = fichaCol.querySelector('.life-stepper');
    if (lifeStepper && !lifeStepper.dataset.wired) {
      lifeStepper.dataset.wired = '1';
      const lifeBtns = lifeStepper.querySelectorAll('button');
      const apply = async delta => {
        const next = Math.max(0, character.currentHealth + delta);
        try {
          character = await apiFetch(`/characters/${characterId}/current-health`, {
            method: 'PATCH',
            body: JSON.stringify({ currentHealth: next }),
          });
          renderInfo();
        } catch (err) { alert('Falha ao alterar HP: ' + err.message); }
      };

      const makeBtn = (label, delta) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', () => apply(delta));
        return b;
      };

      const minus5 = makeBtn('−5', -5);
      const plus5  = makeBtn('+5', +5);
      lifeStepper.insertBefore(minus5, lifeBtns[0]);
      lifeStepper.appendChild(plus5);

      lifeBtns[0].addEventListener('click', () => apply(-1));
      lifeBtns[1].addEventListener('click', () => apply(+1));
    }
  }

  function ensureEditAttrButton() {
    const card = document.querySelector('.ficha-grid .ficha-card-light');
    if (!card || card.querySelector('[data-edit-attr]')) return;
    const h = card.querySelector('h2');
    if (!h) return;
    h.style.display = 'flex';
    h.style.justifyContent = 'space-between';
    h.style.alignItems = 'center';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.editAttr = '';
    btn.textContent = 'Editar';
    btn.style.cssText = 'font-family:"Cinzel",serif;font-size:0.78rem;background:#c9a14b;color:#1c1410;border:0;border-radius:3px;padding:5px 14px;cursor:pointer;letter-spacing:0.08em;font-weight:600';
    h.appendChild(btn);
    btn.addEventListener('click', toggleAttrEdit);
  }

  let attrEditMode = false;
  async function toggleAttrEdit() {
    const card = document.querySelector('.ficha-grid .ficha-card-light');
    const btn = card?.querySelector('[data-edit-attr]');
    if (!card || !btn) return;

    if (!attrEditMode) {
      attrEditMode = true;
      btn.textContent = 'Salvar';
      card.querySelectorAll('.attr-card').forEach(c => {
        const labelEl = c.querySelector('.attr-name-btn');
        const valueEl = c.querySelector('.attr-value');
        const label = (labelEl?.textContent || '').trim();
        const code = ABILITY_BY_PT[label];
        if (!code || !valueEl) return;
        const score = abilityScore(code);
        valueEl.innerHTML = `<input type="text" inputmode="numeric" maxlength="2" value="${score}" data-attr-code="${code}"
          style="width:48px;text-align:center;background:rgba(0,0,0,0.45);color:var(--accent);border:1px solid var(--accent);border-radius:3px;font-family:'Cinzel',serif;font-weight:600;font-size:1.6rem;padding:2px 4px;outline:none">`;
      });
      return;
    }

    const updates = {};
    card.querySelectorAll('input[data-attr-code]').forEach(inp => {
      const v = parseInt(inp.value, 10);
      if (Number.isFinite(v)) {
        const map = { STR:'strength', DEX:'dexterity', CON:'constitution', INT:'intelligence', WIS:'wisdom', CHA:'charisma' };
        updates[map[inp.dataset.attrCode]] = v;
      }
    });
    try {
      character = await patchAndReturn(updates);
      await recomputeArmorClass();
      attrEditMode = false;
      btn.textContent = 'Editar';
      renderAttributes();
      renderSaves();
      renderSkills();
      renderInfo();
      renderSpells();
      renderFeatures();
      renderInventory();
    } catch (err) {
      alert('Falha ao salvar atributos: ' + err.message);
    }
  }

  function wireRollTools() {
    const histBtn = document.getElementById('btn-roll-history');
    if (histBtn && !histBtn.dataset.wired) {
      histBtn.dataset.wired = '1';
      histBtn.addEventListener('click', () => Dice.showRollHistory(characterId));
    }
    const customBtn = document.getElementById('btn-custom-roll');
    if (customBtn && !customBtn.dataset.wired) {
      customBtn.dataset.wired = '1';
      customBtn.addEventListener('click', () => Dice.showCustomRoll(characterId));
    }
  }

  function renderAttributes() {
    ensureEditAttrButton();
    const cards = document.querySelectorAll('.ficha-grid .ficha-card-light .attr-card');
    cards.forEach(card => {
      const labelEl = card.querySelector('.attr-name-btn');
      const valueEl = card.querySelector('.attr-value');
      const modEl = card.querySelector('.attr-mod-circle');
      const label = (labelEl?.textContent || '').trim();
      const code = ABILITY_BY_PT[label];
      if (!code) return;
      const score = abilityScore(code);
      const m = mod(score);
      if (valueEl && !attrEditMode) valueEl.textContent = String(score);
      if (modEl) modEl.textContent = fmtMod(m);
      if (!card.dataset.rollWired) {
        card.dataset.rollWired = '1';
        card.style.cursor = 'pointer';
        card.title = 'Clique para rolar';
        card.addEventListener('click', e => {
          if (attrEditMode) return;
          if (e.target.closest('[data-attr-code]')) return;
          Dice.rollAndPersist(characterId, `Atributo: ${label}`, `1d20${m >= 0 ? '+' : ''}${m}`);
        });
      }
    });
  }

  function renderSaves() {
    const list = document.querySelector('.ficha-grid .ficha-card-dark .saves-list');
    if (!list) return;
    const order = ['STR','DEX','CON','INT','WIS','CHA'];
    list.innerHTML = order.map(code => {
      const score = abilityScore(code);
      const m = mod(score);
      const isProf = (character.savingThrowProficiencies || []).includes(code);
      const total = m + (isProf ? character.proficiencyBonus : 0);
      return `
        <li data-save="${code}">
          <label><input type="checkbox" data-save-prof ${isProf ? 'checked' : ''}> ${ABILITY_PT_BR[code]}</label>
          <span data-save-roll style="cursor:pointer" title="Clique para rolar">${fmtMod(total)}</span>
        </li>`;
    }).join('');

    if (!list.dataset.wired) {
      list.dataset.wired = '1';
      list.addEventListener('change', async e => {
        const cb = e.target.closest('[data-save-prof]');
        if (!cb) return;
        const li = cb.closest('li');
        const code = li.dataset.save;
        const cur = new Set(character.savingThrowProficiencies || []);
        if (cb.checked) cur.add(code); else cur.delete(code);
        try {
          await patchCharacter({ savingThrowProficiencies: Array.from(cur) });
          renderSaves();
        } catch (err) { alert('Falha ao atualizar: ' + err.message); }
      });
      list.addEventListener('click', e => {
        const rollEl = e.target.closest('[data-save-roll]');
        if (!rollEl) return;
        const li = rollEl.closest('li');
        const code = li.dataset.save;
        const score = abilityScore(code);
        const m = mod(score) + ((character.savingThrowProficiencies || []).includes(code) ? character.proficiencyBonus : 0);
        Dice.rollAndPersist(characterId, `Salvaguarda: ${ABILITY_PT_BR[code]}`, `1d20${m >= 0 ? '+' : ''}${m}`);
      });
    }
  }

  let skillsEditMode = false;
  function ensureEditSkillsButton() {
    const card = document.querySelector('.ficha-pericias');
    if (!card || card.querySelector('[data-edit-skills]')) return;
    const h = card.querySelector('h2');
    if (!h) return;
    h.style.display = 'flex';
    h.style.justifyContent = 'space-between';
    h.style.alignItems = 'center';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.editSkills = '';
    btn.textContent = 'Editar';
    btn.style.cssText = 'font-family:"Cinzel",serif;font-size:0.78rem;background:#c9a14b;color:#1c1410;border:0;border-radius:3px;padding:5px 14px;cursor:pointer;letter-spacing:0.08em;font-weight:600';
    h.appendChild(btn);
    btn.addEventListener('click', () => {
      skillsEditMode = !skillsEditMode;
      btn.textContent = skillsEditMode ? 'Concluir' : 'Editar';
      renderSkills();
    });
  }

  function renderSkills() {
    ensureEditSkillsButton();
    const wrap = document.querySelector('.ficha-pericias ul');
    if (!wrap) return;
    const profs = new Set(character.skillProficiencies || []);
    const ordered = SKILLS_5E.slice().sort((a, b) => a.pt.localeCompare(b.pt, 'pt-BR'));
    wrap.innerHTML = ordered.map(s => {
      const isProf = profs.has(s.slug);
      const m = mod(abilityScore(s.ability)) + (isProf ? character.proficiencyBonus : 0);
      const cell = skillsEditMode
        ? `<label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">
             <input type="checkbox" data-skill-edit="${s.slug}" ${isProf ? 'checked' : ''}>
             <span>(${fmtMod(m)})</span>
           </label>`
        : `<span>(${fmtMod(m)})</span>`;
      return `
        <li data-skill="${s.slug}" data-ability="${s.ability}" style="cursor:${skillsEditMode ? 'default' : 'pointer'}" title="${skillsEditMode ? '' : 'Clique para rolar'}">
          <span>${s.pt} <em>(${s.ability.slice(0,3)})</em>${isProf ? ' <span style="color:var(--accent);font-size:0.85em">●</span>' : ''}</span>
          ${cell}
        </li>`;
    }).join('');

    if (!wrap.dataset.wired) {
      wrap.dataset.wired = '1';
      wrap.addEventListener('click', e => {
        if (skillsEditMode) return;
        if (e.target.closest('input, label')) return;
        const li = e.target.closest('li[data-skill]');
        if (!li) return;
        const slug = li.dataset.skill;
        const ab = li.dataset.ability;
        const skill = SKILLS_5E.find(s => s.slug === slug);
        const isProf = (character.skillProficiencies || []).includes(slug);
        const m = mod(abilityScore(ab)) + (isProf ? character.proficiencyBonus : 0);
        Dice.rollAndPersist(characterId, `Perícia: ${skill?.pt || slug}`, `1d20${m >= 0 ? '+' : ''}${m}`);
      });
      wrap.addEventListener('change', async e => {
        const cb = e.target.closest('[data-skill-edit]');
        if (!cb) return;
        const slug = cb.dataset.skillEdit;
        const cur = new Set(character.skillProficiencies || []);
        if (cb.checked) cur.add(slug); else cur.delete(slug);
        try {
          character = await patchAndReturn({ skillProficiencies: Array.from(cur) });
          renderSkills();
        } catch (err) {
          alert('Falha ao atualizar perícia: ' + err.message);
          cb.checked = !cb.checked;
        }
      });
    }
  }

  function renderInventory() {
    const invPanel = document.querySelector('[data-tab-panel="inventario"]');
    if (!invPanel) return;
    const summary = invPanel.querySelector('.inventory-summary-info');
    const generalContainer = invPanel.querySelector('.inventory-items');
    const rightCards = invPanel.querySelectorAll('.inventory-right .inventory-card');
    const armorCard = rightCards[0];
    const armorContainer = armorCard?.querySelector('[data-armor-list]') || armorCard;
    const potionsContainer = rightCards[1];
    if (!generalContainer || !armorContainer || !potionsContainer) return;

    const acShield = armorCard?.querySelector('[data-ac-shield]');
    if (acShield && character.armorClass != null) acShield.textContent = String(character.armorClass);

    invPanel.querySelectorAll('.inventory-item-row').forEach(el => el.remove());
    const items = character.inventory || [];
    const totalWeight = items.reduce((s, it) => s + ((it.weight || 0) * (it.quantity || 1)), 0);
    const totalItems = items.reduce((s, it) => s + (it.quantity || 1), 0);

    if (summary) {
      summary.innerHTML = `
        <div class="inventory-summary-row">
          <span><strong>Dinheiro:</strong>
            <input type="number" min="0" value="${character.goldPieces ?? 0}" data-gold
              style="width:80px;background:transparent;color:var(--accent);border:1px solid var(--divider-gold);border-radius:3px;padding:2px 4px;font-family:inherit"> po
          </span>
          <span><strong>Peso total:</strong> ${totalWeight.toFixed(2)}</span>
        </div>
        <div class="inventory-summary-row">
          <span><strong>Total de itens:</strong> ${totalItems}</span>
        </div>`;
      const goldInput = summary.querySelector('[data-gold]');
      goldInput?.addEventListener('change', async () => {
        try {
          character = await patchAndReturn({ goldPieces: parseInt(goldInput.value || '0', 10) });
        } catch (err) { alert('Falha ao salvar ouro: ' + err.message); }
      });
    }

    function targetFor(type) {
      if (type === 'ARMOR') return armorContainer;
      if (type === 'POTION') return potionsContainer;
      return generalContainer;
    }

    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'inventory-item-row';
      row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid rgba(201,161,75,0.2);cursor:pointer';
      row.title = 'Clique para ver detalhes';
      row.dataset.slug = it.slug || '';
      row.dataset.name = it.name;
      row.innerHTML = `
        <span><strong>${it.name}</strong>${it.quantity > 1 ? ' ×' + it.quantity : ''}${it.damageDice ? ' — ' + it.damageDice : ''}</span>
        <span>
          ${it.damageDice ? `<button class="btn-roll-dmg" type="button" data-dmg="${it.damageDice}" data-name="${it.name}" style="margin-right:8px;background:#5b3f1a;color:#f1e7d0;border:0;padding:4px 10px;border-radius:3px;cursor:pointer">Rolar dano</button>` : ''}
          <button class="btn-del-item" type="button" data-id="${it.id}" style="background:#7a3030;color:#f1e7d0;border:0;padding:4px 10px;border-radius:3px;cursor:pointer">×</button>
        </span>`;
      row.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        if (row.dataset.slug) showEquipmentDetail(row.dataset.slug, row.dataset.name);
        else showManualEquipmentDetail(it);
      });
      targetFor(it.type).appendChild(row);
    });

    invPanel.querySelectorAll('.btn-roll-dmg').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        Dice.rollAndPersist(characterId, `Dano: ${btn.dataset.name}`, btn.dataset.dmg);
      });
    });
    invPanel.querySelectorAll('.btn-del-item').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        try {
          character = await apiFetch(`/characters/${characterId}/inventory/${btn.dataset.id}`, { method: 'DELETE' });
          await recomputeArmorClass();
          renderInventory();
        } catch (err) { alert('Falha ao remover item: ' + err.message); }
      });
    });
  }

  function ensureSearchModal(id, title, onPick) {
    let overlay = document.getElementById(id);
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:9998;font-family:"Cinzel",serif';
    overlay.innerHTML = `
      <div style="background:#1c1410;color:#f1e7d0;border:2px solid #c9a14b;border-radius:8px;padding:24px;max-width:520px;width:90%;max-height:80vh;display:flex;flex-direction:column">
        <h3 style="margin:0 0 12px;color:#c9a14b">${title}</h3>
        <input type="text" data-search-input placeholder="Buscar..." style="padding:10px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit">
        <div data-search-results style="margin-top:12px;overflow-y:auto;flex:1;max-height:340px"></div>
        <button type="button" data-search-close style="margin-top:16px;padding:8px 24px;background:#c9a14b;color:#1c1410;border:0;border-radius:4px;cursor:pointer;font-family:inherit;align-self:flex-end">FECHAR</button>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => { overlay.style.display = 'none'; };
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('[data-search-close]').addEventListener('click', close);
    overlay._open = items => {
      const input = overlay.querySelector('[data-search-input]');
      const results = overlay.querySelector('[data-search-results]');
      input.value = '';
      function paint(filter) {
        const f = (filter || '').toLowerCase();
        results.innerHTML = '';
        const visible = items.filter(it => it.name.toLowerCase().includes(f)).slice(0, 50);
        visible.forEach(it => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = it.name;
          btn.style.cssText = 'display:block;width:100%;text-align:left;padding:8px 12px;background:transparent;color:#f1e7d0;border:1px solid rgba(201,161,75,0.25);border-radius:3px;margin-bottom:6px;cursor:pointer;font-family:inherit';
          btn.addEventListener('click', async () => {
            await onPick(it);
            close();
          });
          results.appendChild(btn);
        });
      }
      paint('');
      input.oninput = () => paint(input.value);
      overlay.style.display = 'flex';
      setTimeout(() => input.focus(), 60);
    };
    return overlay;
  }

  function ensureTabbedAddModal(id, title, opts) {
    let overlay = document.getElementById(id);
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);display:none;align-items:center;justify-content:center;z-index:9998;font-family:"Cinzel",serif';
    overlay.innerHTML = `
      <div style="background:#1c1410;color:#f1e7d0;border:2px solid #c9a14b;border-radius:8px;padding:22px 24px;max-width:560px;width:92%;max-height:86vh;display:flex;flex-direction:column">
        <h3 style="margin:0 0 12px;color:#c9a14b">${title}</h3>
        <div style="display:flex;gap:8px;margin-bottom:14px">
          <button type="button" data-tab="search" class="vm-tab-btn vm-tab-active" style="flex:1;padding:8px 14px;background:#c9a14b;color:#1c1410;border:0;border-radius:4px;cursor:pointer;font-family:inherit;font-weight:600;letter-spacing:0.05em">BUSCAR</button>
          <button type="button" data-tab="manual" class="vm-tab-btn" style="flex:1;padding:8px 14px;background:transparent;color:#c9a14b;border:1px solid #c9a14b;border-radius:4px;cursor:pointer;font-family:inherit;letter-spacing:0.05em">CRIAR MANUALMENTE</button>
        </div>
        <div data-view-search style="display:flex;flex-direction:column;min-height:0;flex:1">
          <input type="text" data-search-input placeholder="Buscar..." style="padding:10px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
          <div data-search-results style="margin-top:12px;overflow-y:auto;flex:1;max-height:340px"></div>
        </div>
        <div data-view-manual hidden style="overflow-y:auto;max-height:62vh;padding-right:4px">${opts.manualHtml}</div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px">
          <button type="button" data-close style="padding:8px 18px;background:transparent;color:#c9a14b;border:1px solid #c9a14b;border-radius:4px;cursor:pointer;font-family:inherit">FECHAR</button>
          <button type="button" data-save hidden style="padding:8px 22px;background:#c9a14b;color:#1c1410;border:0;border-radius:4px;cursor:pointer;font-family:inherit;font-weight:600">SALVAR</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => { overlay.style.display = 'none'; };
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('[data-close]').addEventListener('click', close);

    const searchView = overlay.querySelector('[data-view-search]');
    const manualView = overlay.querySelector('[data-view-manual]');
    const saveBtn = overlay.querySelector('[data-save]');
    overlay.querySelectorAll('.vm-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        overlay.querySelectorAll('.vm-tab-btn').forEach(b => {
          const active = b === btn;
          b.style.background = active ? '#c9a14b' : 'transparent';
          b.style.color = active ? '#1c1410' : '#c9a14b';
          b.style.border = active ? '0' : '1px solid #c9a14b';
          b.style.fontWeight = active ? '600' : '400';
          b.style.padding = active ? '8px 14px' : '7px 13px';
        });
        if (tab === 'search') {
          searchView.style.display = 'flex';
          manualView.hidden = true;
          saveBtn.hidden = true;
        } else {
          searchView.style.display = 'none';
          manualView.hidden = false;
          saveBtn.hidden = false;
          if (opts.onShowManual) opts.onShowManual(overlay);
        }
      });
    });

    saveBtn.addEventListener('click', async () => {
      const closeIt = await opts.onManualSubmit(overlay);
      if (closeIt !== false) close();
    });

    overlay._openSearch = (items) => {
      const input = overlay.querySelector('[data-search-input]');
      const results = overlay.querySelector('[data-search-results]');
      input.value = '';
      function paint(filter) {
        const f = (filter || '').toLowerCase();
        results.innerHTML = '';
        items.filter(it => it.name.toLowerCase().includes(f)).slice(0, 50).forEach(it => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = it.name;
          btn.style.cssText = 'display:block;width:100%;text-align:left;padding:8px 12px;background:transparent;color:#f1e7d0;border:1px solid rgba(201,161,75,0.25);border-radius:3px;margin-bottom:6px;cursor:pointer;font-family:inherit';
          btn.addEventListener('click', async () => {
            await opts.onSearchPick(it);
            close();
          });
          results.appendChild(btn);
        });
      }
      paint('');
      input.oninput = () => paint(input.value);
      overlay.style.display = 'flex';
      setTimeout(() => input.focus(), 60);
    };
    return overlay;
  }

  let _equipmentList = null;
  async function openAddItemModal() {
    if (!_equipmentList) {
      try {
        const res = await Dnd5e.listEquipment();
        _equipmentList = (res.results || []).map(r => ({ name: r.name, slug: r.index }));
      } catch (e) { _equipmentList = []; }
    }

    const manualHtml = `
      <label style="display:block;margin-bottom:6px">Categoria</label>
      <select data-it-type style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
        <option value="ADVENTURING_GEAR">Item Geral</option>
        <option value="ARMOR">Armadura</option>
        <option value="POTION">Poção</option>
        <option value="WEAPON">Arma</option>
      </select>

      <label style="display:block;margin:14px 0 6px">Nome</label>
      <input type="text" data-it-name maxlength="200"
        style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">

      <div style="display:flex;gap:10px;margin-top:14px">
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px">Quantidade</label>
          <input type="text" inputmode="numeric" data-it-qty value="1"
            style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
        </div>
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px">Peso</label>
          <input type="text" inputmode="decimal" data-it-weight value="0"
            style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
        </div>
      </div>

      <div data-it-cat-weapon hidden style="margin-top:14px">
        <label style="display:block;margin-bottom:6px">Dado de dano (ex: 1d8)</label>
        <input type="text" data-it-damage maxlength="20"
          style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
      </div>

      <div data-it-cat-armor hidden style="margin-top:14px">
        <div style="display:flex;gap:10px">
          <div style="flex:1">
            <label style="display:block;margin-bottom:6px">Classe de armadura (CA base)</label>
            <input type="text" inputmode="numeric" data-it-ac maxlength="3"
              style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
          </div>
          <div style="flex:1">
            <label style="display:block;margin-bottom:6px">Categoria</label>
            <select data-it-armor-cat style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
              <option value="LIGHT">Leve (CA + DEX)</option>
              <option value="MEDIUM">Média (CA + DEX, máx +2)</option>
              <option value="HEAVY">Pesada (CA fixa)</option>
              <option value="SHIELD">Escudo (+2 CA)</option>
            </select>
          </div>
        </div>
      </div>

      <label style="display:block;margin:14px 0 6px">Descrição</label>
      <textarea data-it-desc rows="4" maxlength="2000"
        style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box;resize:vertical"></textarea>
    `;

    const modal = ensureTabbedAddModal('vm-item-modal', 'Adicionar item', {
      manualHtml,
      onShowManual: ov => {
        const typeSel = ov.querySelector('[data-it-type]');
        const wpn = ov.querySelector('[data-it-cat-weapon]');
        const arm = ov.querySelector('[data-it-cat-armor]');
        const toggle = () => {
          wpn.hidden = typeSel.value !== 'WEAPON';
          arm.hidden = typeSel.value !== 'ARMOR';
        };
        typeSel.onchange = toggle;
        toggle();
      },
      onSearchPick: async pick => {
        let dmg = '';
        let weight = 0;
        let acBonus = null;
        let armorCat = null;
        let type = 'ADVENTURING_GEAR';
        try {
          const eq = await Dnd5e.getEquipment(pick.slug);
          if (eq.damage && eq.damage.damage_dice) dmg = eq.damage.damage_dice;
          if (eq.weight) weight = Number(eq.weight);
          if (eq.armor_class && eq.armor_class.base) acBonus = eq.armor_class.base;
          if (eq.equipment_category && eq.equipment_category.index === 'weapon') type = 'WEAPON';
          if (eq.equipment_category && eq.equipment_category.index === 'armor') type = 'ARMOR';
          const apiArmorCat = (eq.armor_category || '').toLowerCase();
          if (apiArmorCat === 'light') armorCat = 'LIGHT';
          else if (apiArmorCat === 'medium') armorCat = 'MEDIUM';
          else if (apiArmorCat === 'heavy') armorCat = 'HEAVY';
          else if (apiArmorCat === 'shield') { armorCat = 'SHIELD'; type = 'ARMOR'; }
        } catch (_) {}
        try {
          character = await apiFetch(`/characters/${characterId}/inventory`, {
            method: 'POST',
            body: JSON.stringify({
              slug: pick.slug, name: pick.name, weight, quantity: 1,
              damageDice: dmg || null, armorClassBonus: acBonus, armorCategory: armorCat, type,
              description: null,
            }),
          });
          await recomputeArmorClass();
          renderInventory();
        } catch (err) { alert('Falha ao adicionar: ' + err.message); }
      },
      onManualSubmit: async ov => {
        const type = ov.querySelector('[data-it-type]').value;
        const name = (ov.querySelector('[data-it-name]').value || '').trim();
        if (!name) { ov.querySelector('[data-it-name]').focus(); return false; }
        const qty = parseInt(ov.querySelector('[data-it-qty]').value, 10) || 1;
        const weight = parseFloat(ov.querySelector('[data-it-weight]').value) || 0;
        const desc = (ov.querySelector('[data-it-desc]').value || '').trim() || null;
        const dmg = type === 'WEAPON' ? (ov.querySelector('[data-it-damage]').value || '').trim() || null : null;
        const ac = type === 'ARMOR' ? (parseInt(ov.querySelector('[data-it-ac]').value, 10) || null) : null;
        const armorCat = type === 'ARMOR' ? (ov.querySelector('[data-it-armor-cat]').value || null) : null;
        try {
          character = await apiFetch(`/characters/${characterId}/inventory`, {
            method: 'POST',
            body: JSON.stringify({
              name, quantity: qty, weight,
              damageDice: dmg, armorClassBonus: ac, armorCategory: armorCat, type,
              description: desc, slug: null,
            }),
          });
          ['name','qty','weight','desc','damage','ac'].forEach(k => {
            const el = ov.querySelector(`[data-it-${k}]`);
            if (el) el.value = k === 'qty' ? '1' : (k === 'weight' ? '0' : '');
          });
          await recomputeArmorClass();
          renderInventory();
          return true;
        } catch (err) { alert('Falha ao adicionar: ' + err.message); return false; }
      },
    });
    modal._openSearch(_equipmentList);
  }

  function renderSpellSlots() {
    const grid = document.querySelector('[data-spell-slots]');
    if (!grid) return;
    grid.innerHTML = '';
    const slots = spellSlotsFor(character.classSlug, character.currentLevel);
    if (slots.length === 0) {
      grid.innerHTML = '<div style="color:rgba(245,230,200,0.55);padding:8px 12px;font-style:italic">Sem slots de magia para esta classe.</div>';
      return;
    }
    slots.forEach((count, idx) => {
      if (!count) return;
      const lvl = idx + 1;
      const entry = document.createElement('div');
      entry.className = 'slot-entry';
      const key = `vm_slot_${characterId}_lvl${lvl}`;
      const used = parseInt(localStorage.getItem(key) || '0', 10);
      entry.innerHTML = `
        <div class="attr-card armor-shield">
          <div class="attr-shield-outer">
            <div class="attr-shield-inner">
              <span class="attr-name-btn">Nv ${lvl}</span>
              <span class="attr-value">${count}</span>
            </div>
          </div>
        </div>
        <div class="slot-checks" data-slot-checks></div>
      `;
      const checks = entry.querySelector('[data-slot-checks]');
      for (let i = 0; i < count; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-check' + (i < used ? ' used' : '');
        btn.title = i < used ? 'Slot gasto (clique para recuperar)' : 'Slot disponível (clique para usar)';
        btn.addEventListener('click', () => {
          const cur = parseInt(localStorage.getItem(key) || '0', 10);
          const next = i < cur ? i : i + 1;
          localStorage.setItem(key, String(next));
          renderSpellSlots();
        });
        checks.appendChild(btn);
      }
      grid.appendChild(entry);
    });
  }

  function renderSpells() {
    const spellPanel = document.querySelector('[data-tab-panel="magias"]');
    if (!spellPanel) return;
    const knownContainer = spellPanel.querySelector('.inventory-items');
    const rightCards = spellPanel.querySelectorAll('.inventory-right .inventory-card');
    const cantripContainer = rightCards[1];
    const summary = spellPanel.querySelector('.inventory-summary-info');
    if (!knownContainer || !cantripContainer) return;
    spellPanel.querySelectorAll('.spell-item-row').forEach(el => el.remove());
    renderSpellSlots();
    const spells = character.spells || [];

    if (summary) {
      const ab = SPELLCASTING_ABILITY[character.classSlug];
      let header;
      if (ab) {
        const score = abilityScore(ab);
        const dc = 8 + character.proficiencyBonus + mod(score);
        const atk = character.proficiencyBonus + mod(score);
        header = `
          <div class="inventory-summary-row">
            <span><strong>Atributo conjurador:</strong> ${ABILITY_PT_BR[ab]}</span>
            <span><strong>CD da magia:</strong> ${dc}</span>
          </div>
          <div class="inventory-summary-row">
            <span><strong>Bônus de ataque:</strong> ${atk >= 0 ? '+' : ''}${atk}</span>
            <span><strong>Total de magias:</strong> ${spells.length}</span>
          </div>`;
      } else {
        header = `
          <div class="inventory-summary-row">
            <span><strong>Atributo conjurador:</strong> —</span>
            <span><strong>CD da magia:</strong> —</span>
          </div>
          <div class="inventory-summary-row">
            <span><strong>Total de magias:</strong> ${spells.length}</span>
          </div>`;
      }
      summary.innerHTML = header;
    }
    spells.forEach(sp => {
      const row = document.createElement('div');
      row.className = 'spell-item-row';
      row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid rgba(201,161,75,0.2);cursor:pointer';
      row.title = 'Clique para ver detalhes';
      row.dataset.slug = sp.slug || '';
      row.dataset.name = sp.name;
      const isCantrip = sp.level === 0;
      const lvlStr = isCantrip ? ' — Truque' : (sp.level != null ? ' — Nv ' + sp.level : '');
      row.innerHTML = `
        <span><strong>${sp.name}</strong>${lvlStr}${sp.school ? ' · ' + sp.school : ''}</span>
        <button class="btn-del-spell" type="button" data-id="${sp.id}" style="background:#7a3030;color:#f1e7d0;border:0;padding:4px 10px;border-radius:3px;cursor:pointer">×</button>`;
      row.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        if (row.dataset.slug) showSpellDetail(row.dataset.slug, row.dataset.name);
        else showManualSpellDetail(sp);
      });
      (isCantrip ? cantripContainer : knownContainer).appendChild(row);
    });
    spellPanel.querySelectorAll('.btn-del-spell').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        try {
          character = await apiFetch(`/characters/${characterId}/spells/${btn.dataset.id}`, { method: 'DELETE' });
          renderSpells();
        } catch (err) { alert('Falha ao remover magia: ' + err.message); }
      });
    });
  }

  let _spellList = null;
  async function openAddSpellModal() {
    if (!_spellList) {
      try {
        const res = await Dnd5e.listSpells();
        _spellList = (res.results || []).map(r => ({ name: r.name, slug: r.index }));
      } catch (e) { _spellList = []; }
    }

    const manualHtml = `
      <label style="display:block;margin-bottom:6px">Nome</label>
      <input type="text" data-sp-name maxlength="200"
        style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">

      <div style="display:flex;gap:10px;margin-top:14px">
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px">Nível</label>
          <select data-sp-level style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
            <option value="0">Truque (Nv 0)</option>
            <option value="1">Nv 1</option><option value="2">Nv 2</option><option value="3">Nv 3</option>
            <option value="4">Nv 4</option><option value="5">Nv 5</option><option value="6">Nv 6</option>
            <option value="7">Nv 7</option><option value="8">Nv 8</option><option value="9">Nv 9</option>
          </select>
        </div>
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px">Escola</label>
          <select data-sp-school style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
            <option value="">—</option>
            <option>Abjuração</option><option>Conjuração</option><option>Divinação</option>
            <option>Encantamento</option><option>Evocação</option><option>Ilusão</option>
            <option>Necromancia</option><option>Transmutação</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:14px">
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px">Tempo de conjuração</label>
          <input type="text" data-sp-casting maxlength="100" placeholder="1 ação"
            style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
        </div>
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px">Alcance</label>
          <input type="text" data-sp-range maxlength="100" placeholder="9 metros"
            style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:14px">
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px">Componentes</label>
          <input type="text" data-sp-components maxlength="100" placeholder="V, S, M"
            style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
        </div>
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px">Duração</label>
          <input type="text" data-sp-duration maxlength="100" placeholder="Instantânea"
            style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
        </div>
      </div>

      <label style="display:block;margin:14px 0 6px">Descrição</label>
      <textarea data-sp-desc rows="5" maxlength="5000"
        style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box;resize:vertical"></textarea>
    `;

    const modal = ensureTabbedAddModal('vm-spell-modal', 'Adicionar magia', {
      manualHtml,
      onSearchPick: async pick => {
        let level = null, school = null, description = null;
        let castingTime = null, range = null, components = null, duration = null;
        try {
          const sp = await Dnd5e.getSpell(pick.slug);
          level = sp.level;
          school = sp.school && sp.school.name;
          description = (sp.desc || []).join('\n\n');
          castingTime = sp.casting_time || null;
          range = sp.range || null;
          components = (sp.components || []).join(', ') || null;
          duration = sp.duration || null;
        } catch (_) {}
        try {
          character = await apiFetch(`/characters/${characterId}/spells`, {
            method: 'POST',
            body: JSON.stringify({
              slug: pick.slug, name: pick.name, level, school,
              castingTime, range, components, duration, description,
            }),
          });
          renderSpells();
        } catch (err) { alert('Falha ao adicionar magia: ' + err.message); }
      },
      onManualSubmit: async ov => {
        const name = (ov.querySelector('[data-sp-name]').value || '').trim();
        if (!name) { ov.querySelector('[data-sp-name]').focus(); return false; }
        const level = parseInt(ov.querySelector('[data-sp-level]').value, 10);
        const school = ov.querySelector('[data-sp-school]').value || null;
        const castingTime = ov.querySelector('[data-sp-casting]').value.trim() || null;
        const range = ov.querySelector('[data-sp-range]').value.trim() || null;
        const components = ov.querySelector('[data-sp-components]').value.trim() || null;
        const duration = ov.querySelector('[data-sp-duration]').value.trim() || null;
        const description = ov.querySelector('[data-sp-desc]').value.trim() || null;
        try {
          character = await apiFetch(`/characters/${characterId}/spells`, {
            method: 'POST',
            body: JSON.stringify({
              slug: null, name, level, school,
              castingTime, range, components, duration, description,
            }),
          });
          ['name','casting','range','components','duration','desc'].forEach(k => {
            const el = ov.querySelector(`[data-sp-${k}]`);
            if (el) el.value = '';
          });
          renderSpells();
          return true;
        } catch (err) { alert('Falha ao adicionar magia: ' + err.message); return false; }
      },
    });
    modal._openSearch(_spellList);
  }

  function wireDescription() {
    const panel = document.querySelector('[data-tab-panel="descricao"]');
    if (!panel) return;
    const textareas = panel.querySelectorAll('.description-textarea');
    const labels = [
      'characterHistory','characterAppearance','personalityTraits','personalityTraits',
      'goals','ideals','bonds','flaws',
    ];

    textareas.forEach((t, i) => {
      const field = labels[i];
      if (!field) return;
      t.value = character[field] || '';
      let timer = null;
      t.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          try {
            await patchCharacter({ [field]: t.value });
          } catch (err) { console.warn('PATCH falhou:', err); }
        }, 800);
      });
    });
  }

  async function renderFeatures() {
    const panel = document.querySelector('[data-tab-panel="habilidades"]');
    if (!panel) return;

    const summary = panel.querySelector('.inventory-summary-info');
    if (summary) {
      const inspKey = `vm_inspiration_${characterId}`;
      const inspCur = localStorage.getItem(inspKey) ?? '0';
      const resource = classResourceFor(character.classSlug, character.currentLevel);
      const resourceKey = `vm_class_resource_${characterId}`;
      const resourceCur = localStorage.getItem(resourceKey) ?? (typeof resource?.max === 'number' ? String(resource.max) : '');
      summary.innerHTML = `
        <div class="inventory-summary-row">
          <span><strong>Bônus de proficiência:</strong> +${character.proficiencyBonus}</span>
          <span><strong>Inspiração:</strong>
            <input type="number" min="0" max="99" value="${inspCur}" data-inspiration
              style="width:48px;background:transparent;color:var(--accent);border:1px solid var(--divider-gold);border-radius:3px;padding:2px 4px;font-family:inherit">
          </span>
        </div>
        ${resource ? `
        <div class="inventory-summary-row">
          <span><strong>${resource.label}:</strong>
            ${typeof resource.max === 'number'
              ? `<input type="number" min="0" max="${resource.max}" value="${resourceCur}" data-class-resource
                   style="width:48px;background:transparent;color:var(--accent);border:1px solid var(--divider-gold);border-radius:3px;padding:2px 4px;font-family:inherit"> / ${resource.max}`
              : resource.max}
          </span>
          <span><strong>Total de habilidades:</strong> <span data-features-count>—</span></span>
        </div>` : `
        <div class="inventory-summary-row">
          <span><strong>Total de habilidades:</strong> <span data-features-count>—</span></span>
        </div>`}`;
      summary.querySelector('[data-inspiration]')?.addEventListener('change', e => {
        localStorage.setItem(inspKey, String(e.target.value || '0'));
      });
      summary.querySelector('[data-class-resource]')?.addEventListener('change', e => {
        localStorage.setItem(resourceKey, String(e.target.value || '0'));
      });
    }

    const classCard = panel.querySelector('.inventory-items');
    const racialCard = panel.querySelectorAll('.inventory-card')[2];
    const featsCard = panel.querySelectorAll('.inventory-card')[1];

    async function listClassFeatures() {
      if (!character.classSlug) return [];
      try {
        const features = [];
        const lvlData = await Dnd5e.dndFetch(`/classes/${character.classSlug}/levels`);
        (lvlData || []).forEach(l => {
          if (l.level <= character.currentLevel) {
            (l.features || []).forEach(f => features.push({ name: f.name, level: l.level, url: f.url }));
          }
        });
        return features;
      } catch (e) { return []; }
    }

    async function listRacialFeatures() {
      if (!character.raceSlug) return [];
      try {
        const r = await Dnd5e.getRace(character.raceSlug);
        return (r.traits || []).map(t => ({ name: t.name, url: t.url }));
      } catch (e) { return []; }
    }

    const featsByCategory = { CLASS: [], RACE: [], FEAT: [], OTHER: [] };
    (character.feats || []).forEach(f => {
      const cat = featsByCategory[f.category] ? f.category : 'OTHER';
      featsByCategory[cat].push(f);
    });

    function buildFeatRow(f) {
      const row = document.createElement('div');
      row.className = 'feature-row feat-row';
      row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid rgba(201,161,75,0.2);cursor:pointer';
      row.title = 'Clique para ver detalhes';
      const span = document.createElement('span');
      span.textContent = f.name;
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '×';
      del.style.cssText = 'background:#7a3030;color:#f1e7d0;border:0;padding:4px 10px;border-radius:3px;cursor:pointer';
      del.addEventListener('click', async e => {
        e.stopPropagation();
        try {
          character = await apiFetch(`/characters/${characterId}/feats/${f.id}`, { method: 'DELETE' });
          renderFeatures();
        } catch (err) { alert('Falha ao remover: ' + err.message); }
      });
      row.appendChild(span);
      row.appendChild(del);
      row.addEventListener('click', e => {
        if (e.target === del) return;
        showFeatDetail(f);
      });
      return row;
    }

    if (classCard) {
      classCard.querySelectorAll('.feature-row, .feat-row').forEach(el => el.remove());
      const feats = await listClassFeatures();
      feats.forEach(f => {
        const row = document.createElement('div');
        row.className = 'feature-row';
        row.style.cssText = 'padding:8px 12px;border-bottom:1px solid rgba(201,161,75,0.2);cursor:pointer';
        row.title = 'Clique para ver detalhes';
        row.dataset.url = f.url || '';
        row.dataset.name = f.name;
        const name = document.createElement('span');
        name.textContent = f.name;
        row.appendChild(name);
        if (f.level) row.appendChild(document.createTextNode(` (Nv ${f.level})`));
        row.addEventListener('click', () => showFeatureDetail(row.dataset.url, row.dataset.name));
        classCard.appendChild(row);
      });
      featsByCategory.CLASS.forEach(f => classCard.appendChild(buildFeatRow(f)));
      const totalEl = summary?.querySelector('[data-features-count]');
      const allCount = feats.length + (character.feats || []).length;
      if (totalEl) totalEl.textContent = String(allCount);
    }
    if (racialCard) {
      racialCard.querySelectorAll('.feature-row, .feat-row').forEach(el => el.remove());
      const traits = await listRacialFeatures();
      traits.forEach(t => {
        const row = document.createElement('div');
        row.className = 'feature-row';
        row.style.cssText = 'padding:8px 12px;border-bottom:1px solid rgba(201,161,75,0.2);cursor:pointer';
        row.title = 'Clique para ver detalhes';
        row.dataset.url = t.url || '';
        row.dataset.name = t.name;
        const span = document.createElement('span');
        span.textContent = t.name;
        row.appendChild(span);
        row.addEventListener('click', () => showFeatureDetail(row.dataset.url, row.dataset.name));
        racialCard.appendChild(row);
      });
      featsByCategory.RACE.forEach(f => racialCard.appendChild(buildFeatRow(f)));
    }

    if (featsCard) {
      const talentList = featsCard.querySelector('[data-talent-list]') || featsCard;
      talentList.querySelectorAll('.feat-row').forEach(el => el.remove());
      [...featsByCategory.FEAT, ...featsByCategory.OTHER]
        .forEach(f => talentList.appendChild(buildFeatRow(f)));
    }
  }

  function openAddFeatModal() {
    let overlay = document.getElementById('vm-feat-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'vm-feat-modal';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);display:none;align-items:center;justify-content:center;z-index:9998;font-family:"Cinzel",serif';
      overlay.innerHTML = `
        <div style="background:#1c1410;color:#f1e7d0;border:2px solid #c9a14b;border-radius:8px;padding:24px;max-width:560px;width:92%;max-height:86vh;overflow-y:auto">
          <h3 style="margin:0 0 14px;color:#c9a14b">Adicionar habilidade</h3>

          <label style="display:block;margin-bottom:6px">Categoria</label>
          <select data-feat-category style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
            <option value="FEAT">Talento</option>
            <option value="CLASS">Habilidade de Classe</option>
            <option value="RACE">Habilidade de Raça</option>
            <option value="OTHER">Outro</option>
          </select>

          <label style="display:block;margin:14px 0 6px">Nome</label>
          <input type="text" data-feat-name maxlength="200"
            style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">

          <div style="display:flex;gap:10px;margin-top:14px">
            <div style="flex:1">
              <label style="display:block;margin-bottom:6px">Tipo de ação</label>
              <select data-feat-action style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
                <option value="PASSIVE">Passiva</option>
                <option value="ACTION">Ação</option>
                <option value="BONUS_ACTION">Ação bônus</option>
                <option value="REACTION">Reação</option>
                <option value="MOVEMENT">Movimento</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div style="flex:1">
              <label style="display:block;margin-bottom:6px">Custo / recurso</label>
              <input type="text" data-feat-cost maxlength="100" placeholder="ex: 1 Ki, descanso curto"
                style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box">
            </div>
          </div>

          <label style="display:block;margin:14px 0 6px">Descrição</label>
          <textarea data-feat-desc rows="6" maxlength="5000"
            style="width:100%;padding:8px;background:#0e0a08;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;font-family:inherit;box-sizing:border-box;resize:vertical"></textarea>

          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px">
            <button type="button" data-feat-cancel
              style="padding:8px 18px;background:transparent;color:#c9a14b;border:1px solid #c9a14b;border-radius:4px;cursor:pointer;font-family:inherit">CANCELAR</button>
            <button type="button" data-feat-save
              style="padding:8px 22px;background:#c9a14b;color:#1c1410;border:0;border-radius:4px;cursor:pointer;font-family:inherit;font-weight:600">SALVAR</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      const close = () => { overlay.style.display = 'none'; };
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      overlay.querySelector('[data-feat-cancel]').addEventListener('click', close);
      overlay.querySelector('[data-feat-save]').addEventListener('click', async () => {
        const nameEl = overlay.querySelector('[data-feat-name]');
        const name = (nameEl.value || '').trim();
        if (!name) { nameEl.focus(); return; }
        const payload = {
          name,
          category: overlay.querySelector('[data-feat-category]').value,
          actionType: overlay.querySelector('[data-feat-action]').value,
          cost: overlay.querySelector('[data-feat-cost]').value.trim() || null,
          description: overlay.querySelector('[data-feat-desc]').value || '',
        };
        try {
          character = await apiFetch(`/characters/${characterId}/feats`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          overlay.querySelectorAll('input, textarea').forEach(el => { el.value = ''; });
          close();
          renderFeatures();
        } catch (err) {
          alert('Falha ao salvar: ' + err.message);
        }
      });
    }
    overlay.querySelectorAll('input, textarea').forEach(el => { el.value = ''; });
    overlay.querySelector('[data-feat-category]').value = 'FEAT';
    overlay.querySelector('[data-feat-action]').value = 'PASSIVE';
    overlay.style.display = 'flex';
    setTimeout(() => overlay.querySelector('[data-feat-name]').focus(), 60);
  }

  function wireAddButtons() {
    document.querySelectorAll('[data-tab-panel="inventario"] .btn-add-item').forEach(b =>
      b.addEventListener('click', openAddItemModal));
    document.querySelectorAll('[data-tab-panel="magias"] .btn-add-item').forEach(b =>
      b.addEventListener('click', openAddSpellModal));
    document.querySelectorAll('[data-tab-panel="habilidades"] .btn-add-item').forEach(b =>
      b.addEventListener('click', openAddFeatModal));
  }

  async function init() {
    try {
      character = await apiFetch(`/characters/${characterId}`);
    } catch (err) {
      alert('Falha ao carregar personagem: ' + err.message);
      window.location.replace('characters.html');
      return;
    }
    wirePhoto();
    await recomputeArmorClass();
    renderInfo();
    wireSteppers();
    renderAttributes();
    wireRollTools();
    renderSaves();
    renderSkills();
    renderInventory();
    renderSpells();
    renderFeatures();
    wireDescription();
    wireAddButtons();
  }

  init();
})();
