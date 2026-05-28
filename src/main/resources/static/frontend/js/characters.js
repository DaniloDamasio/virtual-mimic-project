document.addEventListener('DOMContentLoaded', async () => {
  Auth.requireAuth();

  const user = Auth.getUser();
  const greeting = document.getElementById('user-greeting');
  if (greeting && user) greeting.textContent = `Olá, ${user.name}`;

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Auth.clear();
    window.location.replace('index.html');
  });

  ['new-character-btn', 'new-character-btn-empty'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      localStorage.removeItem('vm_character_draft');
      window.location.href = 'raca.html';
    });
  });

  const grid = document.getElementById('characters-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

  let characters = [];
  try {
    characters = await apiFetch('/characters/my');
  } catch (err) {
    console.warn('Falha ao buscar personagens:', err);
  }

  if (!characters || characters.length === 0) {
    if (emptyState) emptyState.style.display = '';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  const CLASS_ICON = {
    barbarian: 'barbaro-icon.svg',
    bard:      'bardo-icon.svg',
    monk:      'monge-icon.svg',
    rogue:     'ladino-icon.svg',
    paladin:   'paladino-icon.svg',
    cleric:    'clerigo-icon.svg',
  };

  characters.forEach(c => {
    const card = document.createElement('a');
    card.className = 'char-banner';
    card.href = `ficha.html?id=${c.characterId}`;
    if (c.classSlug) card.dataset.class = c.classSlug;
    const fullName = [c.characterName, c.characterLastName].filter(Boolean).join(' ');
    const iconFile = CLASS_ICON[c.classSlug];
    const meta = `${c.className || ''}${c.currentLevel ? ' · Nv ' + c.currentLevel : ''}`;
    card.innerHTML = `
      <span class="char-banner-top"></span>
      <button class="char-banner-delete" type="button" aria-label="Apagar personagem" data-id="${c.characterId}">×</button>
      <h3 class="char-banner-name">${fullName}</h3>
      <p class="char-banner-meta">${meta}</p>
      ${iconFile ? `<img class="char-banner-icon" src="assets/${iconFile}" alt="">` : ''}
    `;
    grid.appendChild(card);
  });

  grid.addEventListener('click', async e => {
    const del = e.target.closest('.char-banner-delete');
    if (!del) return;
    e.preventDefault();
    e.stopPropagation();
    const id = del.dataset.id;
    if (!id) return;
    if (!confirm('Apagar este personagem? Esta ação não pode ser desfeita.')) return;
    try {
      await apiFetch(`/characters/${id}`, { method: 'DELETE' });
      del.closest('.char-banner').remove();
      if (!grid.querySelector('.char-banner') && emptyState) emptyState.style.display = '';
    } catch (err) {
      alert('Falha ao apagar: ' + err.message);
    }
  });
});
