document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const user = Auth.getUser();
  const greeting = document.getElementById('user-greeting');
  if (greeting && user) {
    greeting.textContent = `Olá, ${user.name}`;
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    Auth.clear();
    window.location.replace('index.html');
  });

  ['new-character-btn', 'new-character-btn-empty'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      window.location.href = 'raca.html';
    });
  });
});
