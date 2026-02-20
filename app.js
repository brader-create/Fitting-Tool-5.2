const MODEL_KEY = 'bhdft_models_v2';
const THEME_KEY = 'bhdft_theme';
const FIT_TOLERANCE_IN = 0.04;
const CLOSE_TOLERANCE_IN = 0.12;

const defaultModels = [
  {
    id: crypto.randomUUID(), modelNumber: 'LG-CBIS3618B', brand: 'LG', category: 'Cooktop - Induction',
    active: 'Active', infoConfirmed: false, color: 'Black', trim: false, width: '36 1/4', height: '3 3/4', depth: '21',
    builtIn: true, install: 'Proud', cutoutWidth: '34 7/8 - 35', cutoutHeight: '3 5/8', cutoutDepth: '20', installNote: 'Allow 2" rear clearance.'
  },
  {
    id: crypto.randomUUID(), modelNumber: 'SAMSUNG-NZ36K7880UG', brand: 'Samsung', category: 'Cooktop - Induction',
    active: 'Active', infoConfirmed: false, color: 'Black Stainless', trim: false, width: '36 1/4', height: '4 1/8', depth: '21 1/4',
    builtIn: true, install: 'Flush', cutoutWidth: '34 7/8', cutoutHeight: '4', cutoutDepth: '20 1/2', installNote: 'Flush install requires support ledge.'
  }
];

const fields = [
  ['modelNumber', 'Model Number', 'text'], ['brand', 'Brand', 'text'], ['category', 'Category', 'text'],
  ['active', 'Active', 'select', ['Active', 'EOL', 'Discontinued']], ['infoConfirmed', 'Info Confirmed', 'checkbox'],
  ['color', 'Color', 'text'], ['trim', 'Trim?', 'checkbox'], ['width', 'Width', 'text'], ['depth', 'Depth', 'text'], ['height', 'Height', 'text'],
  ['builtIn', 'Built-In', 'checkbox'], ['install', 'Install', 'select', ['Proud', 'Flush']],
  ['cutoutWidth', 'Cutout Width', 'text'], ['cutoutHeight', 'Cutout Height', 'text'], ['cutoutDepth', 'Cutout Depth', 'text'],
  ['installNote', 'Install Note', 'text']
];

let models = loadModels();
let editingId = null;
let hasSearched = false;
let browseMode = false;

function loadModels() {
  const saved = localStorage.getItem(MODEL_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(MODEL_KEY, JSON.stringify(defaultModels));
  return defaultModels;
}
function persist() { localStorage.setItem(MODEL_KEY, JSON.stringify(models)); }

function parseSingleValue(raw) {
  const value = String(raw || '').replace(/"/g, '').trim();
  if (!value) return 0;
  const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = value.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const decimal = Number.parseFloat(value);
  if (Number.isFinite(decimal)) return decimal;
  const first = value.match(/\d+(?:\.\d+)?/);
  return first ? Number.parseFloat(first[0]) : 0;
}
function parseMeasurement(raw) {
  const v = String(raw || '').trim();
  if (!v) return 0;
  if (v.includes('-')) return parseSingleValue(v.split('-')[0].trim());
  return parseSingleValue(v);
}

function getTargets() {
  return {
    width: parseMeasurement(document.getElementById('widthFilter').value),
    depth: parseMeasurement(document.getElementById('depthFilter').value),
    height: parseMeasurement(document.getElementById('heightFilter').value),
    keyword: document.getElementById('searchInput').value.toLowerCase().trim(),
    activeOnly: document.getElementById('activeOnly').checked,
    confirmedOnly: document.getElementById('confirmedOnly').checked,
    showClose: document.getElementById('showCloseToggle').checked,
    sortBy: document.getElementById('sortBy').value
  };
}

function classifyModel(model, target) {
  const dims = [
    ['width', parseMeasurement(model.width), target.width],
    ['depth', parseMeasurement(model.depth), target.depth],
    ['height', parseMeasurement(model.height), target.height]
  ].filter(([, , t]) => t > 0);

  if (!dims.length) {
    return { ...model, score: 0, bucket: 'fit' };
  }

  const maxDiff = Math.max(...dims.map(([, mv, t]) => Math.abs(mv - t)));
  const isFit = maxDiff <= FIT_TOLERANCE_IN;
  const isClose = !isFit && maxDiff <= CLOSE_TOLERANCE_IN;
  return { ...model, score: maxDiff, bucket: isFit ? 'fit' : isClose ? 'close' : 'out' };
}

function queryModels() {
  const target = getTargets();
  const list = models
    .filter((m) => {
      if (target.activeOnly && m.active !== 'Active') return false;
      if (target.confirmedOnly && !m.infoConfirmed) return false;
      if (!target.keyword) return true;
      return [m.modelNumber, m.brand, m.category, m.installNote].join(' ').toLowerCase().includes(target.keyword);
    })
    .map((m) => classifyModel(m, target))
    .filter((m) => m.bucket === 'fit' || (target.showClose && m.bucket === 'close'));

  list.sort((a, b) => {
    if (target.sortBy === 'score') return a.score - b.score;
    return String(a[target.sortBy] || '').localeCompare(String(b[target.sortBy] || ''));
  });
  return list;
}

function renderProgress() {
  const total = models.length;
  const confirmed = models.filter((m) => Boolean(m.infoConfirmed)).length;
  const pct = total ? (confirmed / total) * 100 : 0;
  document.getElementById('availableCount').textContent = `${total} models available`;
  document.getElementById('modelCount').textContent = `${total} models added`;
  document.getElementById('confirmedCount').textContent = `${confirmed} confirmed`;
  document.getElementById('confirmedPct').textContent = `${pct.toFixed(1)}% confirmed`;
  document.getElementById('progressFill').style.width = `${pct.toFixed(1)}%`;
}

function renderResults() {
  renderProgress();
  const grid = document.getElementById('modelGrid');
  if (!hasSearched && !browseMode) {
    grid.innerHTML = '<div class="empty">Enter width and depth (height optional), then hit Search Fits — or use Manual Browse.</div>';
    document.getElementById('resultsTitle').textContent = '0 matches';
    return;
  }

  const matches = queryModels();
  document.getElementById('resultsTitle').textContent = browseMode ? `${matches.length} browse results` : `${matches.length} matching options`;

  if (!matches.length) {
    grid.innerHTML = '<div class="empty">No matching models for current filters.</div>';
    return;
  }

  grid.innerHTML = matches.map((m) => `
    <article class="result-item ${m.bucket}">
      <div><div class="model-text">${m.modelNumber}</div><div class="brand-text">${m.brand}</div></div>
      <div class="score">${browseMode ? 'Browse' : `Δ ${m.score.toFixed(3)} in`}</div>
    </article>
  `).join('');
}

function openModelModal(model) {
  editingId = model?.id || null;
  document.getElementById('modalTitle').textContent = editingId ? 'Edit Model' : 'Add Model';
  const form = document.getElementById('modelForm');
  form.innerHTML = fields.map(([key, label, type, options]) => {
    if (type === 'select') return `<label>${label}<select class="input" name="${key}">${options.map((o) => `<option ${model?.[key] === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
    if (type === 'checkbox') return `<label>${label}<input name="${key}" type="checkbox" ${model?.[key] ? 'checked' : ''}></label>`;
    return `<label>${label}<input class="input" name="${key}" value="${model?.[key] || ''}" /></label>`;
  }).join('');
  document.getElementById('modelModal').classList.remove('hidden');
}
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function importExpansion(rawJson) {
  const parsed = JSON.parse(rawJson || '[]');
  const incoming = Array.isArray(parsed) ? parsed : [parsed];
  incoming.forEach((m) => models.push({ id: crypto.randomUUID(), active: 'Active', infoConfirmed: false, builtIn: true, install: 'Proud', ...m }));
  persist();
  renderResults();
}

function wireImportDnD() {
  const dropZone = document.getElementById('dropZone');
  const packFile = document.getElementById('packFile');
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault(); dropZone.classList.remove('drag');
    const file = e.dataTransfer?.files?.[0];
    if (file) document.getElementById('packInput').value = await file.text();
  });
  packFile.addEventListener('change', async () => {
    const file = packFile.files?.[0];
    if (file) document.getElementById('packInput').value = await file.text();
  });
}

document.getElementById('runSearchBtn').onclick = () => {
  hasSearched = true;
  browseMode = false;
  document.body.classList.add('searched');
  renderResults();
};
document.getElementById('manualBrowseBtn').onclick = () => {
  hasSearched = true;
  browseMode = true;
  document.body.classList.add('searched');
  renderResults();
};
document.getElementById('homeBtn').onclick = () => {
  hasSearched = false;
  browseMode = false;
  document.body.classList.remove('searched');
  renderResults();
};

document.getElementById('themeToggle').onclick = () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  document.getElementById('themeToggle').textContent = next === 'dark' ? 'Dark Mode' : 'Light Mode';
};

document.querySelectorAll('#showCloseToggle,#activeOnly,#confirmedOnly,#sortBy,#searchInput,#widthFilter,#depthFilter,#heightFilter').forEach((el) => el.addEventListener('input', renderResults));

document.getElementById('addModelBtn').onclick = () => openModelModal();
document.getElementById('cancelModal').onclick = () => closeModal('modelModal');
document.getElementById('saveModel').onclick = (e) => {
  e.preventDefault();
  const f = new FormData(document.getElementById('modelForm'));
  const obj = { id: editingId || crypto.randomUUID() };
  fields.forEach(([key, , type]) => { obj[key] = type === 'checkbox' ? f.get(key) === 'on' : (f.get(key) || '').trim(); });
  if (!obj.modelNumber) return;
  if (editingId) models = models.map((m) => (m.id === editingId ? obj : m)); else models.unshift(obj);
  persist(); closeModal('modelModal'); renderResults();
};

document.getElementById('openImportBtn').onclick = () => document.getElementById('packModal').classList.remove('hidden');
document.getElementById('closePack').onclick = () => closeModal('packModal');
document.getElementById('importPack').onclick = () => {
  try { importExpansion(document.getElementById('packInput').value); closeModal('packModal'); }
  catch { alert('Invalid JSON.'); }
};

const theme = localStorage.getItem(THEME_KEY) || 'dark';
document.documentElement.setAttribute('data-theme', theme);
document.getElementById('themeToggle').textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
wireImportDnD();
renderResults();
