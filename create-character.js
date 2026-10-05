import { makeText, makeSelector, makeLevel } from './character-controls.js';
import { editableFields, fieldLabels, validateField, reuseValue } from './character-fields.js';
import { catalogKey } from './catalog-values.js';
import { rankForLevel } from './rank.js';
const openButton = document.querySelector('#create-button');
const dialog = document.querySelector('#create-dialog');
const form = document.querySelector('#create-form');
const container = document.querySelector('#create-fields');
const message = document.querySelector('#create-message');
const cancel = document.querySelector('#cancel-create');
const submit = document.querySelector('#submit-create');
const status = document.querySelector('#creation-status');
let catalogs = { classes: [], subclasses: [], species: [] };
let options = {};
let draft;
let attempt;
let pending = false;
let uncertain = false;
let saved = () => {};
let confirmedRefresh = false;
export function creationRefreshFailed() { if (confirmedRefresh) status.textContent += ' No se pudo actualizar la vista; usa Reintentar para cargarla.'; }
export function creationRefreshCompleted() { confirmedRefresh = false; }
export function setCreationContext(values, editOptions) { catalogs = values; options = editOptions; }
export function setCreationAvailable(value) { openButton.disabled = !value || pending; }
export function onCharacterCreated(callback) { saved = callback; }
function values(field) {
  if (field === 'CLASS') return catalogs.classes.map(item => item.name);
  if (field === 'SPECIE') return catalogs.species.map(item => item.name);
  if (field === 'SUBCLASS') {
    const parent = catalogs.classes.find(item => item.nameKey === catalogKey(draft.CLASS ?? ''));
    return catalogs.subclasses.filter(item => item.classId === parent?.id).map(item => item.name);
  }
  return [...(options[field] ?? [])];
}
function validateInput(input, field) {
  try {
    draft[field] = reuseValue(validateField(field, input.value), values(field));
    input.setCustomValidity('');
    input.removeAttribute('aria-invalid');
  } catch (error) { draft[field] = input.value; input.setCustomValidity(error.message); input.setAttribute('aria-invalid', 'true'); }
}
function renderField(field) {
  const wrapper = document.createElement('div');
  wrapper.dataset.creationField = field;
  const label = document.createElement('label');
  label.textContent = fieldLabels[field];
  label.htmlFor = `create-${field}`;
  let control;
  if (field === 'NIVEL') {
    control = makeLevel(draft.NIVEL, 'nuevo personaje', false, delta => {
      draft.NIVEL += delta;
      wrapper.replaceWith(renderField(field));
      document.querySelector('#create-range').textContent = rankForLevel(draft.NIVEL);
      const buttons = [...container.querySelectorAll('[data-creation-field="NIVEL"] button')];
      (buttons.find(button => Number(button.dataset.delta) === delta && !button.disabled) ?? buttons.find(button => !button.disabled)).focus();
    });
  } else if (['PERSONAJE', 'NOTAS'].includes(field)) {
    control = makeText(field, draft[field]);
    control.addEventListener('input', () => validateInput(control, field));
  } else {
    const list = values(field);
    if (draft[field] && !list.includes(draft[field])) list.push(draft[field]);
    const { group, select, input } = makeSelector(field, draft[field], list);
    select.disabled = field === 'SUBCLASS' && !draft.CLASS;
    select.required = ['CLASS', 'SPECIE', 'PROPIETARIO'].includes(field);
    input.setAttribute('aria-label', `Nueva opción: ${fieldLabels[field]}`);
    const updateClass = () => {
      if (field !== 'CLASS') return;
      if (!values('SUBCLASS').some(value => catalogKey(value) === catalogKey(draft.SUBCLASS ?? ''))) draft.SUBCLASS = null;
      container.querySelector('[data-creation-field="SUBCLASS"]').replaceWith(renderField('SUBCLASS'));
    };
    input.addEventListener('input', () => { validateInput(input, field); updateClass(); });
    select.addEventListener('change', () => {
      input.hidden = select.value !== '__new';
      input.required = !input.hidden && select.required;
      input.setCustomValidity('');
      input.removeAttribute('aria-invalid');
      draft[field] = input.hidden ? select.value || null : null;
      if (!input.hidden) { input.value = ''; input.focus(); }
      updateClass();
    });
    select.id = `create-${field}`;
    control = group;
  }
  if (field === 'NIVEL') control.querySelector('output').id = `create-${field}`;
  else if (!control.querySelector('select')) control.id = `create-${field}`;
  wrapper.append(label, control);
  return wrapper;
}
function lock(value) {
  pending = value;
  for (const element of form.elements) element.disabled = value || uncertain;
  submit.disabled = value;
  submit.textContent = uncertain ? 'Comprobar y reintentar' : value ? 'Guardando…' : 'Guardar personaje';
  cancel.disabled = value || uncertain;
  if (!value && !uncertain) {
    container.querySelector('#create-SUBCLASS').disabled = !draft.CLASS;
    for (const button of container.querySelectorAll('[data-creation-field="NIVEL"] button')) button.disabled = draft.NIVEL + Number(button.dataset.delta) < 1 || draft.NIVEL + Number(button.dataset.delta) > 20;
  }
}
function close() { dialog.close(); openButton.focus(); }
function confirmed(character) {
  uncertain = false;
  pending = false;
  close();
  status.textContent = `Personaje guardado: ${character.PERSONAJE}.`;
  attempt = null;
  confirmedRefresh = true;
  saved();
}
function payload() {
  const fields = {};
  for (const field of editableFields) fields[field] = validateField(field, draft[field]);
  for (const field of ['PERSONAJE', 'CLASS', 'SPECIE', 'PROPIETARIO']) if (!fields[field]) throw new Error(`${fieldLabels[field]} es obligatorio.`);
  const additions = { classes: [], subclasses: [], species: [] };
  for (const [field, key] of [['CLASS', 'classes'], ['SPECIE', 'species']]) if (!catalogs[key].some(item => item.nameKey === catalogKey(fields[field]))) additions[key].push(fields[field]);
  const parent = catalogs.classes.find(item => item.nameKey === catalogKey(fields.CLASS));
  if (fields.SUBCLASS && !catalogs.subclasses.some(item => item.classId === parent?.id && item.nameKey === catalogKey(fields.SUBCLASS))) additions.subclasses.push({ className: fields.CLASS, name: fields.SUBCLASS });
  return { id: crypto.randomUUID(), fields, catalogAdditions: additions };
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  try { attempt ??= payload(); } catch (error) { message.textContent = error.message; return; }
  lock(true);
  message.textContent = 'Guardando personaje…';
  try {
    if (uncertain) {
      const check = await fetch(`/api/characters?ids=${attempt.id}`, { cache: 'no-store' });
      if (!check.ok) throw new Error('No se pudo comprobar el alta.');
      const current = (await check.json()).characters.find(item => item.id === attempt.id);
      if (current) { confirmed(current); return; }
    }
    const response = await fetch('/api/characters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(attempt) });
    if (response.ok) { confirmed((await response.json()).character); return; }
    if (response.status >= 500) throw new Error('No se pudo confirmar el alta.');
    const data = await response.json();
    uncertain = false;
    attempt = null;
    message.textContent = data.error?.message ?? 'Revisa los datos.';
  } catch {
    uncertain = true;
    message.textContent = 'No se pudo confirmar el alta. Conservamos el mismo envío: pulsa Comprobar y reintentar.';
  } finally { if (dialog.open) lock(false); }
});
openButton.addEventListener('click', () => {
  draft = Object.fromEntries(editableFields.map(field => [field, field === 'NIVEL' ? 1 : null]));
  attempt = null;
  uncertain = false;
  container.replaceChildren(...['PERSONAJE', 'CLASS', 'SUBCLASS', 'SPECIE', 'NIVEL', 'PROPIETARIO', 'ESTADO', 'NOTAS'].map(renderField));
  const range = document.createElement('p');
  range.id = 'create-range';
  range.textContent = rankForLevel(1);
  container.append(range);
  message.textContent = '';
  lock(false);
  dialog.showModal();
  container.querySelector('#create-PERSONAJE').focus();
});
cancel.addEventListener('click', close);
dialog.addEventListener('cancel', event => { if (pending || uncertain) event.preventDefault(); });
dialog.addEventListener('close', () => openButton.focus());
