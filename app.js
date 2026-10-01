import { fields, readCharacters, filterCharacters, sortCharacters, categoryValues, isMissing } from './records.js';

const labels = { CLASS: 'clase', SUBCLASS: 'subclase', SPECIE: 'especie', RANGO: 'rango', PROPIETARIO: 'propietario', NIVEL: 'nivel' };
const elements = {
  form: document.querySelector('#filter-form'),
  controls: document.querySelector('#filter-controls'),
  name: document.querySelector('#name-search'),
  categories: [...document.querySelectorAll('select[data-field]')],
  reset: document.querySelector('#reset-filters'),
  body: document.querySelector('#characters-body'),
  total: document.querySelector('#total-count'),
  status: document.querySelector('#result-status'),
  empty: document.querySelector('#empty-state'),
  error: document.querySelector('#error-state'),
  errorMessage: document.querySelector('#error-message'),
  results: document.querySelector('.results'),
  headers: [...document.querySelectorAll('th[data-sort]')]
};
let characters = [];
let sort = { field: 'NIVEL', direction: 'descending' };

function renderCell(value) {
  const cell = document.createElement('td');
  if (isMissing(value)) {
    const mark = document.createElement('span');
    mark.className = 'missing';
    mark.textContent = '—';
    mark.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = 'Sin dato';
    cell.append(mark, label);
  } else cell.textContent = String(value);
  return cell;
}

function renderCharacters(visible) {
  const fragment = document.createDocumentFragment();
  for (const character of visible) {
    const row = document.createElement('tr');
    row.dataset.sourceRow = character.sourceRow;
    row.append(...fields.map(field => renderCell(character[field])));
    fragment.append(row);
  }
  elements.body.replaceChildren(fragment);
  elements.empty.hidden = visible.length !== 0;
  elements.status.textContent = `${visible.length} de ${characters.length} personajes · ${labels[sort.field]}, ${sort.direction === 'ascending' ? 'ascendente' : 'descendente'}`;
}

function updateView() {
  const categories = Object.fromEntries(elements.categories.map(select => [select.dataset.field, select.value]));
  renderCharacters(sortCharacters(filterCharacters(characters, elements.name.value, categories), sort.field, sort.direction));
  elements.reset.disabled = !elements.name.value && elements.categories.every(select => !select.value);
}

function updateSortHeaders() {
  document.querySelector('#level-header').removeAttribute('aria-sort');
  if (sort.field === 'NIVEL') document.querySelector('#level-header').setAttribute('aria-sort', sort.direction);
  for (const header of elements.headers) {
    const active = header.dataset.sort === sort.field;
    header.setAttribute('aria-sort', active ? sort.direction : 'none');
    header.querySelector('span').textContent = active ? (sort.direction === 'ascending' ? '↑' : '↓') : '↕';
    header.querySelector('button').setAttribute('aria-label', `Ordenar por ${labels[header.dataset.sort]} ${active && sort.direction === 'ascending' ? 'descendente' : 'ascendente'}`);
  }
}

function populateFilters() {
  for (const select of elements.categories) {
    select.replaceChildren(select.options[0]);
    for (const value of categoryValues(characters, select.dataset.field)) {
      select.append(new Option(value, value));
    }
  }
}

function setControlsEnabled(enabled) {
  elements.controls.disabled = !enabled;
  elements.headers.forEach(header => { header.querySelector('button').disabled = !enabled; });
  elements.reset.disabled = true;
}

async function loadCharacters() {
  elements.results.setAttribute('aria-busy', 'true');
  elements.error.hidden = true;
  elements.empty.hidden = true;
  elements.body.replaceChildren();
  elements.status.textContent = 'Cargando personajes…';
  elements.total.textContent = '—';
  setControlsEnabled(false);
  try {
    const response = await fetch(new URL('./Registro de personajes.xlsx', import.meta.url), { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se pudo leer el archivo Excel (HTTP ${response.status}).`);
    if (!globalThis.XLSX) throw new Error('La biblioteca local de lectura no está disponible.');
    const workbook = globalThis.XLSX.read(await response.arrayBuffer(), { type: 'array' });
    characters = readCharacters(workbook, globalThis.XLSX);
    elements.form.reset();
    sort = { field: 'NIVEL', direction: 'descending' };
    populateFilters();
    updateSortHeaders();
    elements.total.textContent = String(characters.length);
    setControlsEnabled(true);
    updateView();
  } catch (error) {
    characters = [];
    elements.errorMessage.textContent = `${error.message} Comprueba que la web y «Registro de personajes.xlsx» están servidos juntos por HTTP.`;
    elements.error.hidden = false;
    elements.status.textContent = 'Registro no disponible';
  } finally {
    elements.results.setAttribute('aria-busy', 'false');
  }
}

elements.form.addEventListener('submit', event => event.preventDefault());
elements.name.addEventListener('input', updateView);
elements.categories.forEach(select => select.addEventListener('change', updateView));
elements.reset.addEventListener('click', () => { elements.form.reset(); updateView(); });
elements.headers.forEach(header => header.querySelector('button').addEventListener('click', () => {
  const field = header.dataset.sort;
  sort = { field, direction: sort.field === field && sort.direction === 'ascending' ? 'descending' : 'ascending' };
  updateSortHeaders();
  updateView();
}));
document.querySelector('#retry-load').addEventListener('click', loadCharacters);
loadCharacters();
