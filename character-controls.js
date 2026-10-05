import { fieldLabels } from './character-fields.js';
export function makeText(field, value) {
  const control = document.createElement(field === 'NOTAS' ? 'textarea' : 'input');
  if (field !== 'NOTAS') control.type = 'text';
  control.value = value ?? '';
  control.required = field === 'PERSONAJE';
  control.placeholder = field === 'NOTAS' ? 'Sin notas' : '';
  return control;
}
export function makeSelector(field, value, options) {
  const group = document.createElement('div');
  const select = document.createElement('select');
  select.append(new Option(field === 'ESTADO' ? 'Sin estado' : field === 'PROPIETARIO' ? 'Sin propietario' : 'Sin dato', ''));
  for (const option of options) select.append(new Option(option, option));
  select.append(new Option(`Añadir ${fieldLabels[field].toLocaleLowerCase('es')}…`, '__new'));
  select.value = value ?? '';
  const input = makeText(field, '');
  input.hidden = true;
  input.className = 'new-option';
  input.placeholder = `${['CLASS', 'SUBCLASS', 'SPECIE'].includes(field) ? 'Nueva' : 'Nuevo'} ${fieldLabels[field].toLocaleLowerCase('es')}`;
  group.append(select, input);
  return { group, select, input };
}
export function makeLevel(level, name, disabled, onChange) {
  const control = document.createElement('div');
  control.className = 'level-control';
  const value = document.createElement('output');
  value.textContent = level;
  const buttons = document.createElement('div');
  buttons.className = 'level-buttons';
  for (const delta of [1, -1]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = delta > 0 ? '+' : '−';
    button.dataset.delta = delta;
    button.setAttribute('aria-label', `${delta > 0 ? 'Subir' : 'Bajar'} nivel de ${name}`);
    button.disabled = disabled || level + delta < 1 || level + delta > 20;
    button.addEventListener('click', () => onChange(delta));
    buttons.append(button);
  }
  control.append(value, buttons);
  return control;
}
