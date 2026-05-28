const DND_API = 'https://www.dnd5eapi.co/api';

const RACE_SLUG_PT = {
  anao: 'dwarf',
  elfo: 'elf',
  orc: 'half-orc',
  tiefling: 'tiefling',
  humano: 'human',
};

const CLASS_SLUG_PT = {
  barbaro: 'barbarian',
  bardo: 'bard',
  monge: 'monk',
  ladino: 'rogue',
  paladino: 'paladin',
  clerigo: 'cleric',
};

const BACKGROUND_SLUG_PT = {
  acolito: 'acolyte',
  'artesao-de-guilda': 'guild-artisan',
  artista: 'entertainer',
  charlatao: 'charlatan',
  criminoso: 'criminal',
  eremita: 'hermit',
  soldado: 'soldier',
  sabio: 'sage',
};

const ABILITY_CODE_PT = {
  forca: 'STR',
  destreza: 'DEX',
  constituicao: 'CON',
  inteligencia: 'INT',
  sabedoria: 'WIS',
  carisma: 'CHA',
};

const ABILITY_PT_BR = {
  STR: 'Força',
  DEX: 'Destreza',
  CON: 'Constituição',
  INT: 'Inteligência',
  WIS: 'Sabedoria',
  CHA: 'Carisma',
};

const SKILLS_5E = [
  { slug: 'acrobatics',      pt: 'Acrobacia',          ability: 'DEX' },
  { slug: 'animal-handling', pt: 'Lidar com Animais',  ability: 'WIS' },
  { slug: 'arcana',          pt: 'Arcanismo',          ability: 'INT' },
  { slug: 'athletics',       pt: 'Atletismo',          ability: 'STR' },
  { slug: 'deception',       pt: 'Enganação',          ability: 'CHA' },
  { slug: 'history',         pt: 'História',           ability: 'INT' },
  { slug: 'insight',         pt: 'Intuição',           ability: 'WIS' },
  { slug: 'intimidation',    pt: 'Intimidação',        ability: 'CHA' },
  { slug: 'investigation',   pt: 'Investigação',       ability: 'INT' },
  { slug: 'medicine',        pt: 'Medicina',           ability: 'WIS' },
  { slug: 'nature',          pt: 'Natureza',           ability: 'INT' },
  { slug: 'perception',      pt: 'Percepção',          ability: 'WIS' },
  { slug: 'performance',     pt: 'Atuação',            ability: 'CHA' },
  { slug: 'persuasion',      pt: 'Persuasão',          ability: 'CHA' },
  { slug: 'religion',        pt: 'Religião',           ability: 'INT' },
  { slug: 'sleight-of-hand', pt: 'Prestidigitação',    ability: 'DEX' },
  { slug: 'stealth',         pt: 'Furtividade',        ability: 'DEX' },
  { slug: 'survival',        pt: 'Sobrevivência',      ability: 'WIS' },
];

const SKILL_BY_SLUG = SKILLS_5E.reduce((acc, s) => { acc[s.slug] = s; return acc; }, {});

const _cache = new Map();

async function dndFetch(path) {
  if (_cache.has(path)) return _cache.get(path);
  const res = await fetch(`${DND_API}${path}`);
  if (!res.ok) throw new Error(`dnd5eapi ${res.status}`);
  const json = await res.json();
  _cache.set(path, json);
  return json;
}

async function getRace(slug)        { return dndFetch(`/races/${slug}`); }
async function getDndClass(slug)    { return dndFetch(`/classes/${slug}`); }
async function getBackground(slug)  { return dndFetch(`/backgrounds/${slug}`); }
async function getSpell(slug)       { return dndFetch(`/spells/${slug}`); }
async function getEquipment(slug)   { return dndFetch(`/equipment/${slug}`); }
async function listSpells()         { return dndFetch('/spells'); }
async function listEquipment()      { return dndFetch('/equipment'); }

function parseAbilityBonuses(raceJson) {
  const out = {};
  (raceJson.ability_bonuses || []).forEach(b => {
    const slug = (b.ability_score && (b.ability_score.index || b.ability_score)) || '';
    const code = String(slug).toUpperCase().slice(0, 3);
    if (['STR','DEX','CON','INT','WIS','CHA'].includes(code)) out[code] = b.bonus;
  });
  return out;
}

function parseSavingThrows(classJson) {
  return (classJson.saving_throws || []).map(s => (s.index || s.name || '').toUpperCase().slice(0, 3));
}

function parseClassSkillChoices(classJson) {
  const choices = (classJson.proficiency_choices || []).find(c =>
    (c.from && c.from.options && c.from.options.length > 0 &&
      (c.from.options[0].item || {}).index &&
      (c.from.options[0].item.index || '').startsWith('skill-')));
  if (!choices) {
    const fallback = (classJson.proficiency_choices || [])[0];
    if (!fallback) return { choose: 2, options: [] };
    return {
      choose: fallback.choose,
      options: (fallback.from.options || [])
        .map(o => (o.item && o.item.index) || '')
        .filter(s => s.startsWith('skill-'))
        .map(s => s.replace('skill-', '')),
    };
  }
  return {
    choose: choices.choose,
    options: (choices.from.options || []).map(o => o.item.index.replace('skill-', '')),
  };
}

function parseBackgroundSkills(bgJson) {
  return (bgJson.starting_proficiencies || [])
    .map(p => (p.index || ''))
    .filter(s => s.startsWith('skill-'))
    .map(s => s.replace('skill-', ''));
}

window.Dnd5e = {
  RACE_SLUG_PT, CLASS_SLUG_PT, BACKGROUND_SLUG_PT,
  ABILITY_CODE_PT, ABILITY_PT_BR, SKILLS_5E, SKILL_BY_SLUG,
  dndFetch, getRace, getDndClass, getBackground, getSpell, getEquipment,
  listSpells, listEquipment,
  parseAbilityBonuses, parseSavingThrows, parseClassSkillChoices, parseBackgroundSkills,
};
