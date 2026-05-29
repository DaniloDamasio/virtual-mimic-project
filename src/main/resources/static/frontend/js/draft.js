const Draft = {
  KEY: 'vm_character_draft',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
    catch (_) { return {}; }
  },

  set(patch) {
    const cur = this.get();
    const next = { ...cur, ...patch };
    localStorage.setItem(this.KEY, JSON.stringify(next));
    return next;
  },

  clear() { localStorage.removeItem(this.KEY); },
};
