import { downloadCharacters } from './export-excel.js';
import { setCharacters, visibleCharacters, onEditingChange, isEditing, isPending, isSaving, levelControl, textControl, selectorControl, setLoading, isFieldPending } from './editing.js';
import { fields, isMissing } from './records.js';

const labels = { CLASS: 'clase', SUBCLASS: 'subclase', SPECIE: 'especie', RANGO: 'rango', PROPIETARIO: 'propietario', NIVEL: 'nivel' };
const elements = {
  form: document.querySelector('#filter-form'),
  controls: document.querySelector('#filter-controls'),
  name: document.querySelector('#name-search'),
  categories: [...document.querySelectorAll('select[data-field]')],
  reset: document.querySelector('#reset-filters'),
  body: document.querySelector('#characters-body'),
  status: document.querySelector('#result-status'),
  empty: document.querySelector('#empty-state'),
  error: document.querySelector('#error-state'),
  errorMessage: document.querySelector('#error-message'),
  results: document.querySelector('.results'),
  headers: [...document.querySelectorAll('th[data-sort]')]
};
let characters = [];
let loaded = false;
let exporting = false;
const exportButton = document.querySelector('#export-button');
const exportStatus = document.querySelector('#export-status');

function updateExportAvailability() {
  exportButton.disabled = !loaded || loading || !pagination?.totalRecords || isEditing() || isSaving() || exporting;
}

async function exportCharacters() {
  updateExportAvailability();
  if (exportButton.disabled) return;
  exporting = true;
  updateExportAvailability();
  setLoading(true);
  exportStatus.textContent = 'Preparando Excel…';
  try {
    const params = new URLSearchParams({ pageSize: 'all', sort: sort.field, direction: sort.direction === 'ascending' ? 'asc' : 'desc' });
    const response = await fetch(`/api/characters?${params}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('El servicio de personajes no está disponible.');
    const data = await response.json();
    if (data.characters.length !== data.pagination.totalRecords) throw new Error('La consulta no contiene todos los personajes.');
    if (isEditing() || isSaving()) throw new Error('La edición está activa.');
    downloadCharacters(data.characters, globalThis.XLSX);
    exportStatus.textContent = `Descarga solicitada: ${data.characters.length} personajes.`;
  } catch {
    exportStatus.textContent = 'No se pudo exportar el Excel. Vuelve a intentarlo.';
  } finally {
    exporting = false;
    setLoading(loading || !loaded);
    updateExportAvailability();
  }
}

exportButton.addEventListener('click', exportCharacters);
let sort = { field: 'NIVEL', direction: 'descending' };
const pageSize = document.querySelector('#page-size');
const previousPage = document.querySelector('#previous-page');
const nextPage = document.querySelector('#next-page');
const pageStatus = document.querySelector('#page-status');
pageSize.value = window.matchMedia('(max-width: 760px)').matches ? '20' : '50';
let page = 1;
let pagination = null;
let filterOptions = {};
let requestNumber = 0;
let controller;
let loading = false;
let searchTimer;
const parameters = { CLASS: 'class', SUBCLASS: 'subclass', SPECIE: 'species', RANGO: 'rank', PROPIETARIO: 'owner' };

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
    row.dataset.characterId = character.id;
    row.classList.toggle('pending', isPending(character.id));
    for (const field of fields) {
      const cell = renderCell(character[field]);
      cell.dataset.field = field;
      cell.classList.toggle('field-pending', isFieldPending(character.id, field));
      if (isEditing() && ['PERSONAJE', 'NOTAS'].includes(field)) cell.replaceChildren(textControl(character, field));
      if (isEditing() && ['ESTADO', 'PROPIETARIO', 'CLASS', 'SUBCLASS', 'SPECIE'].includes(field)) cell.replaceChildren(selectorControl(character, field));
      if (field === 'NIVEL' && isEditing()) cell.replaceChildren(levelControl(character));
      if (field === 'RANGO' && isFieldPending(character.id, 'NIVEL')) {
        const label = document.createElement('span');
        label.className = 'pending-label';
        label.textContent = 'Pendiente de guardar';
        cell.append(label);
      }
      row.append(cell);
    }
    fragment.append(row);
  }
  elements.body.replaceChildren(fragment);
  elements.empty.hidden = visible.length !== 0;
  if (pagination) {
    const start = pagination.totalMatches ? (pagination.pageSize === 'all' ? 1 : (pagination.page - 1) * pagination.pageSize + 1) : 0;
    elements.status.textContent = `${start}–${start ? start + visible.length - 1 : 0} de ${pagination.totalMatches} coincidencias · ${pagination.totalRecords} personajes`;
    pageStatus.textContent = pagination.totalPages ? `Página ${pagination.page} de ${pagination.totalPages}` : 'Sin páginas';
  }
  previousPage.disabled = loading || isSaving() || !pagination || page <= 1;
  nextPage.disabled = loading || isSaving() || !pagination || page >= pagination.totalPages;
  pageSize.disabled = isSaving();
}

function updateView() {
  characters = visibleCharacters();
  renderCharacters(characters);
  elements.reset.disabled = isSaving() || (!elements.name.value && elements.categories.every(select => !select.value));
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
    const selected = select.value;
    select.replaceChildren(select.options[0]);
    for (const value of (filterOptions[select.dataset.field] ?? [])) {
      select.append(new Option(value, value));
    }
    if (selected && ![...select.options].some(option => option.value === selected)) select.append(new Option(selected, selected));
    select.value = selected;
  }
}

function setControlsEnabled(enabled) {
  elements.controls.disabled = !enabled;
  elements.headers.forEach(header => { header.querySelector('button').disabled = !enabled; });
  elements.reset.disabled = true;
}

function queryParameters() {
  const params = new URLSearchParams({ page: String(page), pageSize: pageSize.value, sort: sort.field, direction: sort.direction === 'ascending' ? 'asc' : 'desc' });
  if (elements.name.value) params.set('search', elements.name.value);
  for (const select of elements.categories) if (select.value) params.set(parameters[select.dataset.field], select.value);
  return params;
}
async function loadCharacters(focusAction = false) {
  const focused = focusAction === true ? document.querySelector('#edit-button') : document.activeElement;
  clearTimeout(searchTimer);
  const number = ++requestNumber;
  controller?.abort();
  controller = new AbortController();
  loading = true;
  loaded = false;
  updateExportAvailability();
  if (!exporting) exportStatus.textContent = '';
  setLoading(true);
  elements.results.setAttribute('aria-busy', 'true');
  elements.error.hidden = true;
  elements.empty.hidden = true;
  elements.body.replaceChildren();
  elements.status.textContent = 'Cargando personajes…';
  previousPage.disabled = true;
  nextPage.disabled = true;
  try {
    const response = await fetch(`/api/characters?${queryParameters()}`, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error('El servicio de personajes no está disponible.');
    const data = await response.json();
    if (number !== requestNumber) return;
    loaded = true;
    pagination = data.pagination;
    page = pagination.page;
    filterOptions = data.filterOptions;
    setCharacters(data.characters, data.catalogs, data.editOptions);
    populateFilters();
    updateSortHeaders();
    elements.controls.disabled = false;
    elements.headers.forEach(header => { header.querySelector('button').disabled = false; });
    loading = false;
    setLoading(exporting);
    updateView();
    if (focused?.isConnected && !focused.disabled) focused.focus({ preventScroll: true });
    else if (focused === previousPage || focused === nextPage) pageSize.focus({ preventScroll: true });
  } catch (error) {
    if (number !== requestNumber || error.name === 'AbortError') return;
    elements.errorMessage.textContent = `${error.message} Se conservan los filtros y cambios pendientes.`;
    elements.error.hidden = false;
    elements.status.textContent = 'Registro no disponible';
    if (pagination) page = pagination.page;
  } finally {
    if (number === requestNumber) {
      loading = false;
      setLoading(exporting || !loaded);
      elements.results.setAttribute('aria-busy', 'false');
      updateExportAvailability();
    }
  }
}
function changeQuery() { page = 1; loadCharacters(); }

elements.form.addEventListener('submit', event => event.preventDefault());
elements.name.addEventListener('input', () => { clearTimeout(searchTimer); controller?.abort(); requestNumber++; searchTimer = setTimeout(changeQuery, 250); });
elements.categories.forEach(select => select.addEventListener('change', changeQuery));
elements.reset.addEventListener('click', () => { elements.form.reset(); changeQuery(); });
elements.headers.forEach(header => header.querySelector('button').addEventListener('click', () => {
  const field = header.dataset.sort;
  sort = { field, direction: sort.field === field && sort.direction === 'ascending' ? 'descending' : 'ascending' };
  updateSortHeaders();
  changeQuery();
}));
document.querySelector('#retry-load').addEventListener('click', loadCharacters);
onEditingChange(change => {
  updateExportAvailability();
  if (!exporting) exportStatus.textContent = '';
  if (change?.saved) { loadCharacters(true); return; }
  if (change) {
    const row = [...elements.body.rows].find(row => row.dataset.characterId === change.id);
    if (row) {
      if (change.field === 'CLASS') {
        const current = visibleCharacters().find(character => character.id === change.id);
        row.querySelector('[data-field=SUBCLASS]').replaceChildren(selectorControl(current, 'SUBCLASS'));
      }
      row.classList.toggle('pending', isPending(change.id));
      for (const cell of row.cells) cell.classList.toggle('field-pending', isFieldPending(change.id, cell.dataset.field));
    }
    return;
  }
  characters = visibleCharacters();
  setControlsEnabled(!isSaving());
  if (!loading && elements.error.hidden) updateView();
});
loadCharacters();

previousPage.addEventListener('click', () => { page--; loadCharacters(); });
nextPage.addEventListener('click', () => { page++; loadCharacters(); });
pageSize.addEventListener('change', changeQuery);
