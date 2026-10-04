import { fields } from '../../../records.js';
import { rankForLevel } from '../../../rank.js';
const response = await fetch('specs/004-edicion-niveles/sketch/characters.json');
const characters = (await response.json()).sort((a, b) => b.NIVEL - a.NIVEL || a.sourceRow - b.sourceRow);
const originals = new Map(characters.map(character => [character.sourceRow, { ...character }]));
const body = document.querySelector('#characters-body');
const action = document.querySelector('#edit-button');
const status = document.querySelector('#draft-status');
const editable = ['PERSONAJE', 'NOTAS', 'ESTADO', 'PROPIETARIO', 'NIVEL'];
let editing = true;
function pending(character) { return editable.some(field => character[field] !== originals.get(character.sourceRow)[field]); }
function updatePending(character, row) {
  row.classList.toggle('pending', pending(character));
  status.textContent = `${characters.filter(pending).length} personajes modificados`;
}
function textInput(character, field, row) {
  const control = document.createElement(field === 'NOTAS' ? 'textarea' : 'input');
  if (field !== 'NOTAS') control.type = 'text';
  control.value = character[field] ?? '';
  control.maxLength = field === 'NOTAS' ? 2000 : 50;
  control.required = field === 'PERSONAJE';
  control.placeholder = field === 'NOTAS' ? 'Sin notas' : '';
  control.setAttribute('aria-label', `${field === 'NOTAS' ? 'Notas' : 'Nombre'} de ${character.PERSONAJE}`);
  control.addEventListener('input', () => { character[field] = control.value || null; updatePending(character, row); });
  return control;
}
function selector(character, field, row) {
  const group = document.createElement('div');
  const select = document.createElement('select');
  const state = field === 'ESTADO';
  select.setAttribute('aria-label', `${state ? 'Estado' : 'Propietario'} de ${character.PERSONAJE}`);
  select.append(new Option(state ? 'Sin estado' : 'Sin propietario', ''));
  const values = [...new Set(characters.map(item => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  for (const value of values) select.append(new Option(value, value));
  select.append(new Option(state ? 'Añadir estado…' : 'Añadir propietario…', '__new'));
  select.value = character[field] ?? '';
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 50;
  input.className = 'new-option';
  input.placeholder = state ? 'Nuevo estado' : 'Nuevo propietario';
  input.setAttribute('aria-label', input.placeholder);
  input.hidden = true;
  select.addEventListener('change', () => {
    input.hidden = select.value !== '__new';
    if (!input.hidden) { input.focus(); return; }
    character[field] = select.value || null;
    updatePending(character, row);
  });
  input.addEventListener('input', () => {
    const typed = input.value.trim();
    character[field] = values.find(value => value.toLocaleLowerCase('es') === typed.toLocaleLowerCase('es')) ?? (typed || null);
    updatePending(character, row);
  });
  group.append(select, input);
  return group;
}
function levelControl(character, row, rankCell) {
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
    button.setAttribute('aria-label', `${delta > 0 ? 'Subir' : 'Bajar'} nivel de ${character.PERSONAJE}`);
    button.disabled = character.NIVEL + delta < 1 || character.NIVEL + delta > 20;
    button.addEventListener('click', () => {
      character.NIVEL += delta;
      value.textContent = character.NIVEL;
      rankCell.textContent = rankForLevel(character.NIVEL);
      [...buttons.children].forEach((item, index) => { item.disabled = character.NIVEL + (index === 0 ? 1 : -1) < 1 || character.NIVEL + (index === 0 ? 1 : -1) > 20; });
      updatePending(character, row);
    });
    buttons.append(button);
  }
  control.append(value, buttons);
  return control;
}
function render() {
  body.replaceChildren();
  for (const character of characters) {
    const row = document.createElement('tr');
    const cells = new Map(fields.map(field => [field, document.createElement('td')]));
    for (const field of fields) {
      const cell = cells.get(field);
      cell.textContent = field === 'RANGO' ? rankForLevel(character.NIVEL) : character[field] ?? '—';
      if (editing && ['PERSONAJE', 'NOTAS'].includes(field)) cell.replaceChildren(textInput(character, field, row));
      if (editing && ['ESTADO', 'PROPIETARIO'].includes(field)) cell.replaceChildren(selector(character, field, row));
      if (editing && field === 'NIVEL') cell.replaceChildren(levelControl(character, row, cells.get('RANGO')));
      row.append(cell);
    }
    updatePending(character, row);
    body.append(row);
  }
  action.textContent = editing ? 'Guardar' : 'Editar';
}
action.addEventListener('click', () => {
  if (editing) {
    for (const character of characters) originals.set(character.sourceRow, { ...character });
    editing = false;
    render();
    status.textContent = 'Simulación: cambios solo en esta vista, sin API.';
  } else { editing = true; render(); }
});
document.querySelector('.results').setAttribute('aria-busy', 'false');
document.querySelector('#result-status').textContent = `${characters.length} personajes`;
render();
