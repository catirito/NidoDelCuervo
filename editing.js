import { catalogKey } from './catalog-values.js';
import { rankForLevel } from './rank.js';
import { fieldLabels, validateField, reuseValue } from './character-fields.js';
const action = document.querySelector('#edit-button');
const status = document.querySelector('#draft-status');
const refresh = document.querySelector('#refresh-draft');
let snapshot = [];
let catalogs = { classes: [], subclasses: [], species: [] };
let draft = new Map();
let subclassParents = new Map();
let editing = false;
let saving = false;
let requiresRefresh = false;
let notify = () => {};
export function setCharacters(characters, values) { snapshot = characters; if (values) catalogs = values; action.disabled = false; }
export function onEditingChange(callback) { notify = callback; }
export function filterSource() { return editing ? snapshot : visibleCharacters(); }
export function visibleCharacters() {
  return snapshot.map(character => {
    const fields = draft.get(character.id) ?? {};
    return { ...character, ...fields, RANGO: Object.hasOwn(fields, 'NIVEL') ? rankForLevel(fields.NIVEL) : character.RANGO };
  });
}
export function isEditing() { return editing; }
export function isPending(id) { return draft.has(id); }
export function isFieldPending(id, field) { return Object.hasOwn(draft.get(id) ?? {}, field); }
export function isSaving() { return saving; }
function syncControls(message) {
  action.textContent = saving ? 'Guardando…' : editing ? 'Guardar' : 'Editar';
  action.disabled = saving || requiresRefresh;
  refresh.hidden = !requiresRefresh;
  refresh.disabled = saving;
  status.textContent = message ?? (editing ? `${draft.size} personajes modificados` : '');
}
function setDraft(character, field, value, incremental = false) {
  const fields = { ...(draft.get(character.id) ?? {}) };
  const original = snapshot.find(item => item.id === character.id);
  if (value === original[field]) delete fields[field]; else fields[field] = value;
  if (field === 'CLASS') {
    const currentSubclass = Object.hasOwn(fields, 'SUBCLASS') ? fields.SUBCLASS : original.SUBCLASS;
    if (currentSubclass && !subclassOptions(value).some(option => catalogKey(option) === catalogKey(currentSubclass))) {
      if (original.SUBCLASS === null) delete fields.SUBCLASS; else fields.SUBCLASS = null;
      subclassParents.delete(character.id);
    }
  }
  if (Object.keys(fields).length) draft.set(character.id, fields); else draft.delete(character.id);
  syncControls();
  notify(incremental ? { id: character.id, field } : undefined);
}
function subclassOptions(className) {
  if (!className) return [];
  const parent = catalogs.classes.find(item => item.nameKey === catalogKey(className));
  const existing = catalogs.subclasses.filter(item => item.classId === parent?.id).map(item => item.name);
  const pending = visibleCharacters().filter(item => item.CLASS && catalogKey(item.CLASS) === catalogKey(className)).map(item => item.SUBCLASS).filter(Boolean);
  return [...new Set([...existing, ...pending])].sort((a, b) => a.localeCompare(b, 'es'));
}
function optionValues(field, character) {
  if (field === 'SUBCLASS') return subclassOptions(visibleCharacters().find(item => item.id === character.id).CLASS);
  const stored = field === 'CLASS' ? catalogs.classes.map(item => item.name) : field === 'SPECIE' ? catalogs.species.map(item => item.name) : snapshot.map(item => item[field]);
  return [...new Set([...stored, ...[...draft.values()].map(fields => fields[field])].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}
function catalogAdditions() {
  const additions = { classes: [], subclasses: [], species: [] };
  for (const character of visibleCharacters().filter(character => draft.has(character.id))) {
    const fields = draft.get(character.id);
    if (Object.hasOwn(fields, 'CLASS') && character.CLASS && !catalogs.classes.some(item => item.nameKey === catalogKey(character.CLASS))) additions.classes.push(character.CLASS);
    if (Object.hasOwn(fields, 'SUBCLASS') && character.SUBCLASS) {
      const parent = catalogs.classes.find(item => item.nameKey === catalogKey(character.CLASS));
      if (!catalogs.subclasses.some(item => item.classId === parent?.id && item.nameKey === catalogKey(character.SUBCLASS)) && subclassParents.get(character.id) === catalogKey(character.CLASS)) additions.subclasses.push({ className: character.CLASS, name: character.SUBCLASS });
    }
    if (Object.hasOwn(fields, 'SPECIE') && character.SPECIE && !catalogs.species.some(item => item.nameKey === catalogKey(character.SPECIE))) additions.species.push(character.SPECIE);
  }
  return additions;
}

function bindText(control, character, field) {
  control.dataset.editor = field;
  control.dataset.characterId = character.id;
  control.disabled = saving;
  control.setAttribute('aria-label', `${fieldLabels[field]} de ${snapshot.find(item => item.id === character.id).PERSONAJE}`);
  control.addEventListener('input', () => {
    let value = control.value;
    try {
      value = validateField(field, value);
      if (['ESTADO', 'PROPIETARIO', 'CLASS', 'SUBCLASS', 'SPECIE'].includes(field)) value = reuseValue(value, optionValues(field, character));
      control.setCustomValidity('');
      control.removeAttribute('aria-invalid');
    } catch (error) {
      control.setCustomValidity(error.message);
      control.setAttribute('aria-invalid', 'true');
    }
    if (field === 'SUBCLASS') {
      const parent = visibleCharacters().find(item => item.id === character.id).CLASS;
      if (parent) subclassParents.set(character.id, catalogKey(parent));
    }
    setDraft(character, field, value, true);
  });
}
export function textControl(character, field) {
  const control = document.createElement(field === 'NOTAS' ? 'textarea' : 'input');
  if (field !== 'NOTAS') control.type = 'text';
  control.value = character[field] ?? '';
  control.required = field === 'PERSONAJE';
  control.placeholder = field === 'NOTAS' ? 'Sin notas' : '';
  bindText(control, character, field);
  try { validateField(field, character[field]); } catch (error) { control.setCustomValidity(error.message); control.setAttribute('aria-invalid', 'true'); }
  return control;
}
export function selectorControl(character, field) {
  const group = document.createElement('div');
  const select = document.createElement('select');
  select.disabled = saving || (field === 'SUBCLASS' && !character.CLASS);
  select.dataset.editor = field;
  select.dataset.characterId = character.id;
  select.setAttribute('aria-label', `${fieldLabels[field]} de ${snapshot.find(item => item.id === character.id).PERSONAJE}`);
  select.append(new Option(field === 'ESTADO' ? 'Sin estado' : field === 'PROPIETARIO' ? 'Sin propietario' : 'Sin dato', ''));
  for (const value of optionValues(field, character)) select.append(new Option(value, value));
  select.append(new Option(`Añadir ${fieldLabels[field].toLocaleLowerCase('es')}…`, '__new'));
  select.value = character[field] ?? '';
  const input = document.createElement('input');
  input.type = 'text';
  input.hidden = true;
  input.className = 'new-option';
  input.placeholder = `${['CLASS', 'SUBCLASS', 'SPECIE'].includes(field) ? 'Nueva' : 'Nuevo'} ${fieldLabels[field].toLocaleLowerCase('es')}`;
  bindText(input, character, field);
  select.addEventListener('change', () => {
    input.hidden = select.selectedIndex !== select.options.length - 1;
    if (!input.hidden) { input.value = ''; input.setCustomValidity(''); input.removeAttribute('aria-invalid'); input.focus(); return; }
    input.setCustomValidity('');
    if (field === 'SUBCLASS') {
      const parent = visibleCharacters().find(item => item.id === character.id).CLASS;
      if (parent && select.value) subclassParents.set(character.id, catalogKey(parent)); else subclassParents.delete(character.id);
    }
    setDraft(character, field, select.value || null, true);
  });
  group.append(select, input);
  return group;
}
export function levelControl(character) {
  const control = document.createElement('div');
  control.className = 'level-control';
  const value = document.createElement('output');
  value.textContent = character.NIVEL;
  const buttons = document.createElement('div');
  buttons.className = 'level-buttons';
  for (const delta of [1, -1]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = delta > 0 ? '+' : '−';
    button.dataset.characterId = character.id;
    button.dataset.delta = delta;
    button.setAttribute('aria-label', `${delta > 0 ? 'Subir' : 'Bajar'} nivel de ${character.PERSONAJE}`);
    button.disabled = saving || character.NIVEL + delta < 1 || character.NIVEL + delta > 20;
    button.addEventListener('click', () => {
      setDraft(character, 'NIVEL', character.NIVEL + delta);
      const candidates = [...document.querySelectorAll('button[data-character-id]')].filter(item => item.dataset.characterId === character.id && !item.disabled);
      (candidates.find(item => Number(item.dataset.delta) === delta) ?? candidates[0] ?? action).focus({ preventScroll: true });
    });
    buttons.append(button);
  }
  control.append(value, buttons);
  return control;
}
async function readLatest() {
  const response = await fetch('/api/characters', { cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudo actualizar el registro.');
  return response.json();
}
async function refreshDraft() {
  saving = true;
  syncControls('Actualizando el registro…');
  notify();
  try {
    const latestResponse = await readLatest();
    const latest = latestResponse.characters;
    catalogs = latestResponse.catalogs;
    const differences = [];
    for (const [id, fields] of draft) {
      const current = latest.find(item => item.id === id);
      const original = snapshot.find(item => item.id === id);
      if (!current) { differences.push(`${original.PERSONAJE}: ya no existe; cambio retirado`); draft.delete(id); continue; }
      for (const [field, value] of Object.entries(fields)) {
        if (current[field] === value) { delete fields[field]; differences.push(`${current.PERSONAJE}: ${fieldLabels[field]} ya está guardado`); }
        else if (current.version !== original.version) differences.push(`${current.PERSONAJE}, ${fieldLabels[field]}: guardado «${current[field] ?? 'vacío'}», tu propuesta «${value ?? 'vacío'}»`);
      }
      if (!Object.keys(fields).length) draft.delete(id);
    }
    snapshot = latest;
    requiresRefresh = false;
    saving = false;
    syncControls(`${differences.join(' · ') || 'Registro actualizado.'} Revisa el borrador y pulsa Guardar. ${draft.size} personajes pendientes.`);
    notify();
    action.focus({ preventScroll: true });
  } catch {
    saving = false;
    syncControls('No se pudo actualizar. Se conserva tu borrador; vuelve a intentarlo.');
    notify();
  }
}
function validateDraft() {
  for (const [id, fields] of draft) {
    for (const [field, value] of Object.entries(fields)) {
      try {
        validateField(field, value);
        if (field === 'SUBCLASS' && value !== null) {
          const current = visibleCharacters().find(item => item.id === id);
          const parent = catalogs.classes.find(item => current.CLASS && item.nameKey === catalogKey(current.CLASS));
          const known = catalogs.subclasses.some(item => item.classId === parent?.id && item.nameKey === catalogKey(value));
          if (!known && (!current.CLASS || subclassParents.get(id) !== catalogKey(current.CLASS))) throw new RangeError('La clase ha cambiado. Revisa y selecciona una subclase válida.');
        }
      }
      catch (error) {
        syncControls(error.message);
        const control = [...document.querySelectorAll('[data-editor]')].find(item => item.dataset.characterId === id && item.dataset.editor === field && !item.hidden && (field === 'SUBCLASS' || item.tagName !== 'SELECT'));
        if (control) { control.setCustomValidity(error.message); control.reportValidity(); control.focus(); }
        return false;
      }
    }
  }
  return true;
}
async function saveDraft() {
  if (!validateDraft()) return;
  if (!draft.size) { editing = false; syncControls(); notify(); action.focus(); return; }
  saving = true;
  syncControls();
  notify();
  const changes = [...draft].map(([id, fields]) => ({ id, expectedVersion: snapshot.find(item => item.id === id).version, fields }));
  try {
    const response = await fetch('/api/characters/batch', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ changes, catalogAdditions: catalogAdditions() }) });
    const result = await response.json();
    if (!response.ok) {
      const names = (result.error?.ids ?? []).map(id => snapshot.find(item => item.id === id)?.PERSONAJE ?? 'Personaje desconocido');
      throw new Error(`${result.error?.message ?? 'No se pudo confirmar el guardado.'}${names.length ? ` (${names.join(', ')})` : ''}`);
    }
    catalogs = result.catalogs;
    const updated = new Map(result.characters.map(character => [character.id, character]));
    snapshot = snapshot.map(character => updated.get(character.id) ?? character);
    draft.clear();
    subclassParents.clear();
    editing = false;
    saving = false;
    syncControls('Cambios guardados.');
    notify();
    action.focus({ preventScroll: true });
  } catch (error) {
    saving = false;
    requiresRefresh = true;
    syncControls(`${error.message} Se conserva el borrador. Pulsa Actualizar y revisar antes de volver a guardar.`);
    notify();
    refresh.focus({ preventScroll: true });
  }
}
action.addEventListener('click', () => {
  if (saving || requiresRefresh) return;
  if (editing) { saveDraft(); return; }
  editing = true;
  syncControls();
  notify();
});
refresh.addEventListener('click', refreshDraft);
window.addEventListener('beforeunload', event => {
  if (!draft.size) return;
  event.preventDefault();
  event.returnValue = '';
});
