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

window.Dice = { rollDie, rollNotation, showRollModal, rollAndPersist };
