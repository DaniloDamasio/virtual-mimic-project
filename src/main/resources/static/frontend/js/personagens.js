document.addEventListener('DOMContentLoaded', async () => {
  Auth.requireAuth();

  const stage = document.getElementById('banner-stage');
  const title = document.getElementById('page-title');
  if (!stage) return;

  let characters = [];
  try {
    characters = await apiFetch('/characters/my');
  } catch (err) {
    console.warn('Falha ao buscar personagens:', err);
  }

  const CLASS_ICON = {
    barbarian: 'barbaro-icon.svg',
    bard:      'bardo-icon.svg',
    monk:      'monge-icon.svg',
    rogue:     'ladino-icon.svg',
    paladin:   'paladino-icon.svg',
    cleric:    'clerigo-icon.svg',
  };

  function render() {
    stage.querySelectorAll('.char-banner').forEach(el => el.remove());

    characters.forEach(c => {
      const banner = document.createElement('a');
      banner.className = 'char-banner';
      banner.href = `ficha.html?id=${c.characterId}`;
      if (c.classSlug) banner.dataset.class = c.classSlug;
      const fullName = [c.characterName, c.characterLastName].filter(Boolean).join(' ');
      const iconFile = CLASS_ICON[c.classSlug];
      const meta = `${c.className || ''}${c.currentLevel ? ' · Nv ' + c.currentLevel : ''}`;
      banner.innerHTML = `
        <span class="char-banner-top"></span>
        <button class="char-banner-delete" type="button" aria-label="Apagar personagem" data-id="${c.characterId}">×</button>
        <h3 class="char-banner-name">${fullName}</h3>
        <p class="char-banner-meta">${meta}</p>
        ${iconFile ? `<img class="char-banner-icon" src="assets/${iconFile}" alt="">` : ''}
      `;
      stage.appendChild(banner);
    });

    if (title) title.textContent = `Personagens ${characters.length}/5`;
  }

  render();

  const createBtn = document.getElementById('create-character-link');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      localStorage.removeItem('vm_character_draft');
    });
  }

  stage.addEventListener('click', async e => {
    const del = e.target.closest('.char-banner-delete');
    if (!del) return;
    e.preventDefault();
    e.stopPropagation();
    const id = del.dataset.id;
    if (!confirm('Apagar este personagem? Esta ação não pode ser desfeita.')) return;
    try {
      await apiFetch(`/characters/${id}`, { method: 'DELETE' });
      characters = characters.filter(c => String(c.characterId) !== String(id));
      render();
    } catch (err) {
      alert('Falha ao apagar: ' + err.message);
    }
  });
});
