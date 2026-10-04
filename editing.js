import { rankForLevel } from './rank.js';
const action = document.querySelector('#edit-button');
const status = document.querySelector('#draft-status');
const refresh = document.querySelector('#refresh-draft');
let snapshot = [];
let draft = new Map();
let editing = false;
let saving = false;
let requiresRefresh = false;
let notify = () => {};
export function setCharacters(characters) {
  snapshot = characters;
  action.disabled = false;
}
export function onEditingChange(callback) { notify = callback; }
export function visibleCharacters() {
  return snapshot.map(character => draft.has(character.id) ? { ...character, NIVEL: draft.get(character.id), RANGO: rankForLevel(draft.get(character.id)) } : character);
}
export function isEditing() { return editing; }
export function isPending(id) { return draft.has(id); }
export function isSaving() { return saving; }
function syncControls(message) {
  action.textContent = saving ? 'Guardando…' : editing ? 'Guardar' : 'Editar';
  action.disabled = saving || requiresRefresh;
  refresh.hidden = !requiresRefresh;
  refresh.disabled = saving;
  status.textContent = message ?? (editing ? `${draft.size} personajes modificados` : '');
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
      const level = character.NIVEL + delta;
      const original = snapshot.find(item => item.id === character.id);
      if (level === original.NIVEL) draft.delete(character.id); else draft.set(character.id, level);
      syncControls();
      notify();
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
  return (await response.json()).characters;
}
async function refreshDraft() {
  saving = true;
  syncControls('Actualizando el registro…');
  notify();
  try {
    const latest = await readLatest();
    const differences = [];
    for (const [id, level] of draft) {
      const current = latest.find(item => item.id === id);
      const original = snapshot.find(item => item.id === id);
      if (!current) { differences.push(`${original.PERSONAJE}: ya no existe; cambio retirado`); draft.delete(id); }
      else if (current.NIVEL === level) { differences.push(`${current.PERSONAJE}: el nivel ${level} ya está guardado`); draft.delete(id); }
      else if (current.version !== original.version) differences.push(`${current.PERSONAJE}: nivel guardado ${current.NIVEL}, tu propuesta ${level}`);
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
async function saveDraft() {
  if (!draft.size) { editing = false; syncControls(); notify(); action.focus(); return; }
  saving = true;
  syncControls();
  notify();
  const changes = [...draft].map(([id, level]) => ({ id, expectedVersion: snapshot.find(item => item.id === id).version, fields: { NIVEL: level } }));
  try {
    const response = await fetch('/api/characters/batch', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ changes }) });
    const result = await response.json();
    if (!response.ok) {
      const names = (result.error?.ids ?? []).map(id => snapshot.find(item => item.id === id)?.PERSONAJE ?? 'Personaje desconocido');
      throw new Error(`${result.error?.message ?? 'No se pudo confirmar el guardado.'}${names.length ? ` (${names.join(', ')})` : ''}`);
    }
    const updated = new Map(result.characters.map(character => [character.id, character]));
    snapshot = snapshot.map(character => updated.get(character.id) ?? character);
    draft.clear();
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
