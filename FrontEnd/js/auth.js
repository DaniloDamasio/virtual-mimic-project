if (Auth.getToken()) {
  window.location.replace('characters.html');
}

const loginForm    = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabBtns      = document.querySelectorAll('.tab');
const cardTitle    = document.getElementById('card-title');
const cardSubtitle = document.getElementById('card-subtitle');

const HEADER_TEXT = {
  login:    { title: 'Bem-vindo de volta!', subtitle: 'Entre para acessar seus personagens' },
  register: { title: 'Bem-vindo Jogador!',  subtitle: 'Vamos preparar a sua jornada'        },
};

function activateTab(tabName) {
  tabBtns.forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  const { title, subtitle } = HEADER_TEXT[tabName];
  cardTitle.textContent    = title;
  cardSubtitle.textContent = subtitle;

  loginForm.classList.toggle('hidden', tabName !== 'login');
  registerForm.classList.toggle('hidden', tabName !== 'register');
}

tabBtns.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));

window.addEventListener('DOMContentLoaded', () => activateTab('login'));

function showFieldError(inputEl, errEl, msg) {
  inputEl.classList.toggle('error', !!msg);
  errEl.textContent = msg;
}

function clearForm(form) {
  form.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
  form.querySelectorAll('.input.error').forEach(el => el.classList.remove('error'));
  const alert = form.querySelector('.form-alert');
  if (alert) alert.classList.add('hidden');
}

function showAlert(alertEl, msg, isError = true) {
  alertEl.textContent = msg;
  alertEl.className   = 'form-alert ' + (isError ? 'alert-error' : 'alert-success');
}

function setLoading(btn, loading, loadingText) {
  btn.disabled    = loading;
  btn.textContent = loading ? loadingText : btn._defaultText;
}

const loginBtn = document.getElementById('login-submit');
loginBtn._defaultText = loginBtn.textContent;

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearForm(loginForm);

  const emailEl    = document.getElementById('login-email');
  const passwordEl = document.getElementById('login-password');
  const alertEl    = document.getElementById('login-alert');
  const email      = emailEl.value.trim();
  const password   = passwordEl.value;

  let valid = true;
  if (!email) {
    showFieldError(emailEl, document.getElementById('login-email-err'), 'E-mail é obrigatório');
    valid = false;
  }
  if (!password || password.length < 8) {
    showFieldError(passwordEl, document.getElementById('login-password-err'), 'Mínimo 8 caracteres');
    valid = false;
  }
  if (!valid) return;

  setLoading(loginBtn, true, 'Verificando...');
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    });
    Auth.setSession(data);
    window.location.replace('characters.html');
  } catch (err) {
    showAlert(alertEl, err.message || 'Credenciais inválidas. Tente novamente.');
  } finally {
    setLoading(loginBtn, false);
  }
});

const registerBtn = document.getElementById('register-submit');
registerBtn._defaultText = registerBtn.textContent;

registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearForm(registerForm);

  const nameEl     = document.getElementById('reg-name');
  const emailEl    = document.getElementById('reg-email');
  const passwordEl = document.getElementById('reg-password');
  const confirmEl  = document.getElementById('reg-confirm');
  const alertEl    = document.getElementById('register-alert');

  const name            = nameEl.value.trim();
  const email           = emailEl.value.trim();
  const password        = passwordEl.value;
  const confirmPassword = confirmEl.value;

  let valid = true;
  if (!name || name.length < 2) {
    showFieldError(nameEl, document.getElementById('reg-name-err'), 'Mínimo 2 caracteres');
    valid = false;
  }
  if (!email) {
    showFieldError(emailEl, document.getElementById('reg-email-err'), 'E-mail é obrigatório');
    valid = false;
  }
  if (!password || password.length < 8) {
    showFieldError(passwordEl, document.getElementById('reg-password-err'), 'Mínimo 8 caracteres');
    valid = false;
  }
  if (password !== confirmPassword) {
    showFieldError(confirmEl, document.getElementById('reg-confirm-err'), 'Senhas não coincidem');
    valid = false;
  }
  if (!valid) return;

  setLoading(registerBtn, true, 'Cadastrando...');
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body:   JSON.stringify({ name, email, password, confirmPassword }),
    });
    Auth.setSession(data);
    window.location.replace('characters.html');
  } catch (err) {
    showAlert(alertEl, err.message || 'Erro ao criar conta. Tente novamente.');
  } finally {
    setLoading(registerBtn, false);
  }
});
