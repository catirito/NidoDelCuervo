import { fields } from '../../../records.js';
const response = await fetch('specs/004-edicion-niveles/sketch/characters.json');
const data = await response.json();
const characters = Array.isArray(data) ? data : data.characters;
const originals = new Map(characters.map(character => [character.sourceRow, character.NIVEL]));
const body = document.querySelector('#characters-body');
const action = document.querySelector('#edit-button');
const status = document.querySelector('#draft-status');
let editing = false;
let saving = false;
function rank(level) {
  return level >= 17 ? 'Cuervo de ónice' : level >= 13 ? 'Cuervo de ébano' : level >= 9 ? 'Cuervo negro' : level >= 5 ? 'Cuervo gris' : level >= 3 ? 'Cuervo blanco' : 'Corvato';
}
function render() {
  body.replaceChildren();
  let changed = 0;
  for (const character of characters.slice().sort((a, b) => b.NIVEL - a.NIVEL || a.sourceRow - b.sourceRow)) {
    const pending = character.NIVEL !== originals.get(character.sourceRow);
    if (pending) changed++;
    const row = document.createElement('tr');
    row.classList.toggle('pending', pending);
    for (const field of fields) {
      const cell = document.createElement('td');
      cell.textContent = field === 'RANGO' ? rank(character.NIVEL) : character[field] ?? '—';
      if (field === 'NIVEL' && editing) {
        cell.replaceChildren();
        const control = document.createElement('div');
        control.className = 'level-control';
        const value = document.createElement('output');
        value.textContent = character.NIVEL;
        const buttons = document.createElement('div');
        buttons.className = 'level-buttons';
        control.append(value, buttons);
        for (const delta of [1, -1]) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = delta < 0 ? '−' : '+';
          button.setAttribute('aria-label', `${delta < 0 ? 'Bajar' : 'Subir'} nivel de ${character.PERSONAJE}`);
          button.disabled = saving || character.NIVEL + delta < 1 || character.NIVEL + delta > 20;
          button.addEventListener('click', () => { character.NIVEL += delta; render(); });
          buttons.append(button);
        }
        cell.append(control);
      }
      if (field === 'RANGO' && pending) {
        const label = document.createElement('span');
        label.className = 'pending-label';
        label.textContent = 'Pendiente de guardar';
        cell.append(label);
      }
      row.append(cell);
    }
    body.append(row);
  }
  status.textContent = editing ? `${changed} personajes modificados` : '';
  action.textContent = saving ? 'Guardando…' : editing ? 'Guardar' : 'Editar';
  action.disabled = saving;
}
action.addEventListener('click', () => {
  if (!editing) { editing = true; render(); return; }
  saving = true;
  render();
  setTimeout(() => {
    for (const character of characters) originals.set(character.sourceRow, character.NIVEL);
    saving = false;
    editing = false;
    render();
    status.textContent = 'Simulación completada · No se ha escrito en ningún servidor';
  }, 900);
});
document.querySelector('.results').setAttribute('aria-busy', 'false');
document.querySelector('#result-status').textContent = `${characters.length} personajes`;
render();
