const API_BASE = 'http://localhost:8080/api';

const Auth = {
  getToken:  ()  => localStorage.getItem('vm_token'),
  getUser:   ()  => JSON.parse(localStorage.getItem('vm_user') || 'null'),

  setSession(data) {
    localStorage.setItem('vm_token', data.token);
    localStorage.setItem('vm_user', JSON.stringify({
      userId: data.userId,
      name:   data.name,
      email:  data.email,
    }));
  },

  clear() {
    localStorage.removeItem('vm_token');
    localStorage.removeItem('vm_user');
    localStorage.removeItem('vm_character_draft');
  },

  requireAuth() {
    if (!this.getToken()) {
      window.location.replace('index.html');
    }
  },
};

async function apiFetch(endpoint, opts = {}) {
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...opts, headers });
  } catch (_) {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
  }

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch (_) {}
    if ((res.status === 401 || res.status === 403) && !endpoint.startsWith('/auth/')) {
      Auth.clear();
      alert('Sua sessão expirou. Faça login novamente.');
      window.location.replace('index.html');
    }
    throw new Error(message);
  }

  return res.status === 204 ? null : res.json();
}
