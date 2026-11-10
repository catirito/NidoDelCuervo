import { downloadPets } from './export-excel.js';

const api = '/api/mascoteria';
const byId = id => document.getElementById(id);
const results = document.querySelector('.results');
const filters = byId('filter-form');
const dialog = byId('create-dialog');
const editButton = byId('edit-button');
const cancelEdit = byId('cancel-edit');
const exportButton = byId('export-button');
const createButton = byId('create-button');
const pageSize = byId('page-size');
const message = byId('pet-message');
const ownerPicker = byId('owner-picker');
const petFields = byId('pet-form-fields');
const drafts = new Map();
const editableChoices = [
  { key: 'animal', options: 'animals', empty: 'Sin animal', add: 'Añadir animal…' },
  { key: 'location', options: 'locations', empty: 'Sin ubicación', add: 'Añadir ubicación…' }
];
const textFields = ['name', ...editableChoices.map(({ key }) => key)];
const alphabet = new Intl.Collator('es');
const filterControls = [
  { key: 'owner', options: 'owners', all: 'Todos los propietarios', empty: 'Sin propietario' },
  { key: 'animal', options: 'animals', all: 'Todos los animales' },
  { key: 'location', options: 'locations', all: 'Todas las ubicaciones', empty: 'Sin ubicación' }
];

let data;
let page = 1;
let loading = false;
let pendingRead;
let editing = false;
let saving = false;
let exporting = false;
let editorPet;
let editorTrigger;
let selectedOwners;
let creation;
let creating = false;
pageSize.value = matchMedia('(max-width: 760px)').matches ? '20' : '50';

async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw Object.assign(new Error(body.error?.message ?? 'La petición ha fallado.'), { status: response.status });
  return body;
}

function write(url, method, body) {
  return request(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

function updateControls() {
  const unavailable = loading || !data || saving;
  editButton.disabled = unavailable;
  editButton.textContent = editing ? 'Guardar cambios' : 'Editar';
  cancelEdit.hidden = !editing;
  cancelEdit.disabled = saving;
  createButton.disabled = unavailable;
  exportButton.disabled = unavailable || editing || exporting;
  byId('previous-page').disabled = unavailable || page <= 1;
  byId('next-page').disabled = unavailable || page >= data.pagination.pageCount;
  results.setAttribute('aria-busy', String(loading || saving));
}

function queryParams() {
  const params = new URLSearchParams({ page, pageSize: pageSize.value, search: byId('name-search').value });
  for (const { key } of filterControls) {
    const value = byId('filter-' + key).value;
    if (value) params.set(key, value === 'empty' ? '' : value.slice(6));
  }
  return params;
}

function populateFilters() {
  for (const { key, options, all, empty } of filterControls) {
    const select = byId('filter-' + key);
    const current = select.value;
    const previousLabel = select.selectedOptions[0]?.textContent;
    const values = data.filters[options].map(item => typeof item === 'string' ?
      new Option(item, 'value:' + item) : new Option(item.name, 'value:' + item.id));
    select.replaceChildren(new Option(all, ''), ...(empty ? [new Option(empty, 'empty')] : []), ...values);
    if (current && ![...select.options].some(option => option.value === current)) select.add(new Option(previousLabel, current));
    select.value = current;
  }
}

async function load() {
  pendingRead?.abort();
  const controller = new AbortController();
  pendingRead = controller;
  loading = true;
  byId('error-state').hidden = true;
  updateControls();
  try {
    const nextData = await request(api + '?' + queryParams(), { signal: controller.signal });
    if (pendingRead !== controller) return;
    data = nextData;
    page = data.pagination.page;
    populateFilters();
    render();
  } catch {
    if (pendingRead !== controller) return;
    data = null;
    byId('pets-body').replaceChildren();
    byId('empty-state').hidden = true;
    byId('error-state').hidden = false;
    byId('result-status').textContent = 'Mascotería no está disponible.';
  } finally {
    if (pendingRead === controller) {
      loading = false;
      updateControls();
    }
  }
}

function button(text, action, label = text) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = text;
  element.setAttribute('aria-label', label);
  element.addEventListener('click', action);
  return element;
}

function render() {
  if (!data) return;
  const focused = document.activeElement;
  const focusRow = focused.closest('tr[data-pet-id]')?.dataset.petId;
  const focusAction = focused.dataset.petAction;
  const { totalMatches, totalRecords, pageCount } = data.pagination;
  byId('result-status').textContent = `${totalMatches} de ${totalRecords} mascotas`;
  byId('page-status').textContent = `Página ${page} de ${pageCount}`;
  byId('pet-actions').hidden = !editing;
  byId('empty-state').hidden = Boolean(totalMatches);
  const body = byId('pets-body');
  body.replaceChildren();
  for (const pet of data.pets) {
    const draft = drafts.get(pet.id);
    const current = draft ?? pet;
    const row = body.insertRow();
    row.dataset.petId = pet.id;
    row.classList.toggle('pending', Boolean(draft));
    const values = [current.name, current.owners.map(owner => owner.name).join(', '), current.animal, current.location];
    for (const value of values) row.insertCell().textContent = value;
    if (editing) {
      const actionCell = row.insertCell();
      const actions = document.createElement('div');
      actionCell.append(actions);
      actions.className = 'pet-row-actions';
      const modify = button('Editar', event => openEditor(pet, event.currentTarget), 'Editar ' + current.name);
      const remove = button(draft?.isDeleted ? 'Deshacer baja' : 'Eliminar', () => {
        setDraft(pet, { ...current, isDeleted: !current.isDeleted });
        render();
      });
      modify.dataset.petAction = 'modify';
      remove.dataset.petAction = 'remove';
      modify.disabled = remove.disabled = saving;
      actions.append(modify, remove);
    }
    if (pet.id === focusRow && focusAction) row.querySelector(`[data-pet-action="${focusAction}"]`)?.focus();
  }
}

function setDraft(pet, change) {
  const original = drafts.get(pet.id)?.original ?? pet;
  const unchanged = textFields.every(field => change[field] === original[field]) &&
    change.owners.length === original.owners.length && change.owners.every(owner => original.owners.some(item => item.id === owner.id));
  if (unchanged && !change.isDeleted) drafts.delete(pet.id);
  else drafts.set(pet.id, { ...change, original });
  message.textContent = drafts.size ? `Mascotas con cambios pendientes: ${drafts.size}.` : '';
}

function asFields(pet) {
  return {
    name: pet.name,
    animal: pet.animal,
    location: pet.location,
    ownerIds: pet.owners.map(owner => owner.id)
  };
}

function endEditing() {
  drafts.clear();
  editing = false;
  updateControls();
  render();
}

async function saveDrafts() {
  if (!drafts.size) {
    endEditing();
    return;
  }
  saving = true;
  updateControls();
  render();
  try {
    const changes = [...drafts].map(([id, draft]) => ({
      id, expectedVersion: draft.original.version,
      fields: { ...asFields(draft), isDeleted: Boolean(draft.isDeleted) }
    }));
    await write(api + '/batch', 'PATCH', { changes });
    endEditing();
    message.textContent = 'Cambios guardados.';
    await load();
  } catch (error) {
    message.textContent = (error.status ? error.message + ' ' : 'No se pudo confirmar el guardado. ') + 'Se conservan los cambios pendientes.';
  } finally {
    saving = false;
    updateControls();
    render();
    editButton.focus();
  }
}

function ownerItem(list, text, action, label) {
  const item = document.createElement('li');
  item.append(button(text, action, label));
  list.append(item);
}

function renderOwnerPicker() {
  const selected = byId('selected-owners');
  selected.replaceChildren();
  for (const owner of selectedOwners) {
    ownerItem(selected, owner.name + ' ×', () => {
      selectedOwners = selectedOwners.filter(item => item.id !== owner.id);
      renderOwnerPicker();
      ownerPicker.focus();
    }, 'Quitar a ' + owner.name);
  }
  const available = data.activeOwners.filter(owner => !selectedOwners.some(item => item.id === owner.id));
  ownerPicker.replaceChildren(
    new Option('Seleccionar propietario…', ''),
    ...available.map(owner => new Option(owner.name, owner.id))
  );
}

function populateEditorChoices(current) {
  for (const { key, options, empty, add } of editableChoices) {
    const select = byId('pet-' + key);
    const input = byId('new-' + key);
    const values = new Set(data.filters[options]);
    if (current[key]) values.add(current[key]);
    select.replaceChildren(
      new Option(empty, ''),
      ...[...values].sort(alphabet.compare).map(value => new Option(value, 'value:' + value)),
      new Option(add, 'new')
    );
    select.value = current[key] ? 'value:' + current[key] : '';
    input.value = '';
    input.hidden = true;
  }
}

for (const { key } of editableChoices) {
  const select = byId('pet-' + key);
  const input = byId('new-' + key);
  select.addEventListener('change', () => {
    input.hidden = select.value !== 'new';
    if (!input.hidden) input.focus();
  });
}

function openEditor(pet, trigger) {
  editorPet = pet;
  editorTrigger = trigger;
  const current = (pet && (drafts.get(pet.id) ?? pet)) || { name: '', animal: '', location: '', owners: [] };
  byId('pet-name').value = current.name;
  populateEditorChoices(current);
  byId('pet-name').setCustomValidity('');
  selectedOwners = [...current.owners];
  creation = null;
  byId('create-title').textContent = pet ? 'Editar mascota' : 'Añadir mascota';
  byId('submit-create').textContent = pet ? 'Aplicar al borrador' : 'Guardar mascota';
  byId('create-message').textContent = '';
  renderOwnerPicker();
  dialog.showModal();
}

function updateCreationControls() {
  petFields.disabled = creating || Boolean(creation);
  byId('cancel-create').disabled = petFields.disabled;
  byId('submit-create').disabled = creating;
  byId('submit-create').textContent = creation && !creating ? 'Reintentar alta' : 'Guardar mascota';
}

byId('create-form').addEventListener('submit', async event => {
  event.preventDefault();
  const fields = { name: byId('pet-name').value.trim() };
  for (const { key } of editableChoices) {
    const value = byId('pet-' + key).value;
    fields[key] = value === 'new' ? byId('new-' + key).value.trim() : value.slice(6);
  }
  if (!fields.name) {
    byId('pet-name').setCustomValidity('Introduce un nombre.');
    byId('pet-name').reportValidity();
    return;
  }
  const pet = { ...fields, owners: selectedOwners };
  if (editorPet) {
    setDraft(editorPet, { ...drafts.get(editorPet.id), ...pet });
    dialog.close();
    render();
    [...byId('pets-body').rows].find(row => row.dataset.petId === editorPet.id)
      ?.querySelector('[data-pet-action="modify"]')?.focus();
    return;
  }
  creation ??= { id: crypto.randomUUID(), fields: asFields(pet) };
  creating = true;
  updateCreationControls();
  try {
    await write(api, 'POST', creation);
    creation = null;
    dialog.close();
    message.textContent = 'Mascota añadida.';
    await load();
  } catch (error) {
    if (error.status >= 400 && error.status < 500) creation = null;
    byId('create-message').textContent = creation ? 'No se pudo confirmar el alta. Reintenta para recuperar el resultado.' : error.message;
  } finally {
    creating = false;
    updateCreationControls();
    if (!dialog.open) createButton.focus();
  }
});

dialog.addEventListener('cancel', event => { if (creation) event.preventDefault(); });
dialog.addEventListener('close', () => { if (editorTrigger?.isConnected) editorTrigger.focus(); });
byId('cancel-create').addEventListener('click', () => dialog.close());
byId('pet-name').addEventListener('input', event => event.target.setCustomValidity(''));
ownerPicker.addEventListener('change', () => {
  const owner = data.activeOwners.find(item => item.id === ownerPicker.value);
  if (!owner || selectedOwners.some(item => item.id === owner.id)) return;
  selectedOwners.push(owner);
  selectedOwners.sort((a, b) => alphabet.compare(a.name, b.name));
  renderOwnerPicker();
});

function resetPage() {
  page = 1;
  load();
}
filters.addEventListener('submit', event => event.preventDefault());
byId('name-search').addEventListener('input', resetPage);
for (const { key } of filterControls) byId('filter-' + key).addEventListener('change', resetPage);
byId('reset-filters').addEventListener('click', () => { filters.reset(); resetPage(); });
pageSize.addEventListener('change', resetPage);
byId('previous-page').addEventListener('click', () => { page--; load(); });
byId('next-page').addEventListener('click', () => { page++; load(); });
byId('retry-load').addEventListener('click', load);
createButton.addEventListener('click', () => openEditor(null, createButton));
editButton.addEventListener('click', () => {
  if (editing) {
    saveDrafts();
    return;
  }
  editing = true;
  updateControls();
  render();
});
cancelEdit.addEventListener('click', () => {
  if (drafts.size && !confirm('¿Descartar los cambios pendientes?')) return;
  message.textContent = '';
  endEditing();
  editButton.focus();
  load();
});
exportButton.addEventListener('click', async () => {
  exporting = true;
  updateControls();
  try {
    const { pets } = await request(api + '?pageSize=all');
    downloadPets(pets, globalThis.XLSX);
    message.textContent = 'Excel descargado.';
  } catch {
    message.textContent = 'No se pudo descargar el Excel.';
  } finally {
    exporting = false;
    updateControls();
  }
});

load();
