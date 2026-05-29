function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollNotation(notation) {
  const clean = String(notation).replace(/\s+/g, '').toLowerCase();
  const match = clean.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) throw new Error(`Notação inválida: ${notation}`);
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;
  const rolls = [];
  for (let i = 0; i < count; i++) rolls.push(rollDie(sides));
  const sum = rolls.reduce((a, b) => a + b, 0);
  return { rolls, modifier, total: sum + modifier, notation: clean };
}

function ensureRollModal() {
  let overlay = document.getElementById('vm-roll-modal');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'vm-roll-modal';
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.6)',
    'display:none', 'align-items:center', 'justify-content:center',
    'z-index:9999', 'font-family:"Cinzel",serif',
  ].join(';');
  overlay.innerHTML = `
    <div class="vm-roll-box" style="
      background:#1c1410;color:#f1e7d0;border:2px solid #c9a14b;
      border-radius:8px;padding:32px 40px;max-width:420px;text-align:center;
      box-shadow:0 12px 40px rgba(0,0,0,0.7);
    ">
      <h2 id="vm-roll-label" style="margin:0 0 8px;font-size:1.4rem;letter-spacing:0.06em;color:#c9a14b">—</h2>
      <p id="vm-roll-notation" style="margin:0 0 16px;color:#9f8c6a;font-style:italic">—</p>
      <div id="vm-roll-total" style="font-size:4rem;font-weight:700;color:#f1e7d0;line-height:1">—</div>
      <p id="vm-roll-detail" style="margin:14px 0 0;color:#bda77c;font-size:0.95rem">—</p>
      <button id="vm-roll-close" type="button" style="
        margin-top:22px;padding:10px 28px;background:#c9a14b;color:#1c1410;
        border:0;border-radius:4px;font-weight:600;cursor:pointer;
        font-family:inherit;letter-spacing:0.05em;
      ">FECHAR</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.id === 'vm-roll-close') {
      overlay.style.display = 'none';
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.style.display = 'none';
  });
  return overlay;
}

function showRollModal(label, result) {
  const overlay = ensureRollModal();
  overlay.querySelector('#vm-roll-label').textContent = label;
  overlay.querySelector('#vm-roll-notation').textContent = result.notation;
  overlay.querySelector('#vm-roll-total').textContent = result.total;
  const modStr = result.modifier ? (result.modifier > 0 ? `+${result.modifier}` : `${result.modifier}`) : '';
  overlay.querySelector('#vm-roll-detail').textContent =
    `Dados: [${result.rolls.join(', ')}]${modStr ? ` ${modStr}` : ''}`;
  overlay.style.display = 'flex';
}

async function rollAndPersist(characterId, label, notation) {
  const result = rollNotation(notation);
  showRollModal(label, result);
  if (characterId && typeof apiFetch === 'function') {
    try {
      await apiFetch(`/characters/${characterId}/rolls`, {
        method: 'POST',
        body: JSON.stringify({
          label,
          notation: result.notation,
          rolls: result.rolls,
          total: result.total,
        }),
      });
    } catch (err) {
      console.warn('Falha ao persistir rolagem:', err);
    }
  }
  return result;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function ensureHistoryModal() {
  let overlay = document.getElementById('vm-history-modal');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'vm-history-modal';
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.6)',
    'display:none', 'align-items:center', 'justify-content:center',
    'z-index:9999', 'font-family:"Cinzel",serif',
  ].join(';');
  overlay.innerHTML = `
    <div class="vm-roll-box" style="
      background:#1c1410;color:#f1e7d0;border:2px solid #c9a14b;
      border-radius:8px;padding:28px 32px;max-width:480px;width:90%;
      max-height:80vh;display:flex;flex-direction:column;
      box-shadow:0 12px 40px rgba(0,0,0,0.7);
    ">
      <h2 style="margin:0 0 16px;font-size:1.3rem;letter-spacing:0.06em;color:#c9a14b;text-align:center">Histórico de Rolagens</h2>
      <div id="vm-history-list" style="overflow-y:auto;flex:1 1 auto;margin:0 0 16px">—</div>
      <button id="vm-history-close" type="button" style="
        align-self:center;padding:10px 28px;background:#c9a14b;color:#1c1410;
        border:0;border-radius:4px;font-weight:600;cursor:pointer;
        font-family:inherit;letter-spacing:0.05em;
      ">FECHAR</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.id === 'vm-history-close') {
      overlay.style.display = 'none';
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.style.display = 'none';
  });
  return overlay;
}

async function showRollHistory(characterId) {
  const overlay = ensureHistoryModal();
  const list = overlay.querySelector('#vm-history-list');
  list.innerHTML = '<p style="color:#9f8c6a;font-style:italic;text-align:center">Carregando…</p>';
  overlay.style.display = 'flex';

  let rolls = [];
  try {
    rolls = await apiFetch(`/characters/${characterId}/rolls`);
  } catch (err) {
    list.innerHTML = '<p style="color:#c97a4b;text-align:center">Falha ao carregar o histórico.</p>';
    return;
  }

  if (!rolls || !rolls.length) {
    list.innerHTML = '<p style="color:#9f8c6a;font-style:italic;text-align:center">Nenhuma rolagem registrada ainda.</p>';
    return;
  }

  list.innerHTML = rolls.map(r => {
    const when = r.rolledAt ? new Date(r.rolledAt).toLocaleString('pt-BR') : '';
    const dice = Array.isArray(r.rolls) ? r.rolls.join(', ') : '';
    return `
      <div style="border-bottom:1px solid #3a2c1c;padding:10px 4px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div style="min-width:0">
          <div style="color:#f1e7d0;font-weight:600">${escapeHtml(r.label || '—')}</div>
          <div style="color:#9f8c6a;font-style:italic;font-size:0.85rem">${escapeHtml(r.notation || '')}${dice ? ` • [${dice}]` : ''}</div>
          <div style="color:#7d6c4f;font-size:0.75rem">${escapeHtml(when)}</div>
        </div>
        <div style="color:#c9a14b;font-size:1.6rem;font-weight:700;line-height:1.1;flex:0 0 auto">${r.total}</div>
      </div>`;
  }).join('');
}

function ensureBuilderModal() {
  let overlay = document.getElementById('vm-builder-modal');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'vm-builder-modal';
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.6)',
    'display:none', 'align-items:center', 'justify-content:center',
    'z-index:9999', 'font-family:"Cinzel",serif',
  ].join(';');
  const fieldStyle = 'background:#0f0a07;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;padding:8px 10px;font-family:inherit;font-size:1rem;width:100%';
  const labelStyle = 'display:flex;flex-direction:column;gap:6px;color:#bda77c;font-size:0.85rem;letter-spacing:0.04em';
  overlay.innerHTML = `
    <div class="vm-roll-box" style="
      background:#1c1410;color:#f1e7d0;border:2px solid #c9a14b;
      border-radius:8px;padding:28px 32px;max-width:360px;width:90%;
      box-shadow:0 12px 40px rgba(0,0,0,0.7);
    ">
      <h2 style="margin:0 0 18px;font-size:1.3rem;letter-spacing:0.06em;color:#c9a14b;text-align:center">Rolagem Manual</h2>
      <div style="display:flex;flex-direction:column;gap:16px;margin:0 0 22px">
        <label style="${labelStyle}">Dado
          <select id="vm-builder-die" style="${fieldStyle}">
            <option value="4">d4</option>
            <option value="8">d8</option>
            <option value="12">d12</option>
            <option value="20" selected>d20</option>
          </select>
        </label>
        <label style="${labelStyle}">Quantidade de dados
          <input id="vm-builder-count" type="number" min="1" max="20" value="1" style="${fieldStyle}">
        </label>
        <label style="${labelStyle}">Modificador
          <input id="vm-builder-mod" type="number" value="0" style="${fieldStyle}">
        </label>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button id="vm-builder-roll" type="button" style="
          flex:1;padding:10px 0;background:#c9a14b;color:#1c1410;border:0;border-radius:4px;
          font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:0.05em;
        ">ROLAR</button>
        <button id="vm-builder-cancel" type="button" style="
          flex:1;padding:10px 0;background:#3a2c1c;color:#f1e7d0;border:1px solid #c9a14b;border-radius:4px;
          font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:0.05em;
        ">CANCELAR</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.id === 'vm-builder-cancel') {
      overlay.style.display = 'none';
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.style.display = 'none';
  });
  return overlay;
}

function showCustomRoll(characterId) {
  const overlay = ensureBuilderModal();
  const rollBtn = overlay.querySelector('#vm-builder-roll');
  if (!rollBtn.dataset.wired) {
    rollBtn.dataset.wired = '1';
    rollBtn.addEventListener('click', () => {
      const sides = parseInt(overlay.querySelector('#vm-builder-die').value, 10);
      let count = parseInt(overlay.querySelector('#vm-builder-count').value, 10);
      let modifier = parseInt(overlay.querySelector('#vm-builder-mod').value, 10);
      if (!Number.isFinite(count) || count < 1) count = 1;
      if (count > 20) count = 20;
      if (!Number.isFinite(modifier)) modifier = 0;
      const modStr = modifier === 0 ? '' : (modifier > 0 ? `+${modifier}` : `${modifier}`);
      const notation = `${count}d${sides}${modStr}`;
      overlay.style.display = 'none';
      rollAndPersist(characterId, 'Rolagem manual', notation);
    });
  }
  overlay.style.display = 'flex';
}

window.Dice = { rollDie, rollNotation, showRollModal, rollAndPersist, showRollHistory, showCustomRoll };
