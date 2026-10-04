import { rankForLevel } from './rank.js';
export const editableFields = ['NIVEL', 'PERSONAJE', 'NOTAS', 'ESTADO', 'PROPIETARIO', 'CLASS', 'SUBCLASS', 'SPECIE'];
export const fieldLabels = { NIVEL: 'Nivel', PERSONAJE: 'Nombre', NOTAS: 'Notas', ESTADO: 'Estado', PROPIETARIO: 'Propietario', CLASS: 'Clase', SUBCLASS: 'Subclase', SPECIE: 'Especie' };
export function validateField(field, value) {
  if (field === 'NIVEL') { rankForLevel(value); return value; }
  if (!editableFields.includes(field)) throw new Error('Campo no permitido.');
  if (value === null && field !== 'PERSONAJE') return null;
  if (typeof value !== 'string') throw new RangeError(`${fieldLabels[field]} debe ser texto.`);
  if (['ESTADO', 'PROPIETARIO', 'CLASS', 'SUBCLASS', 'SPECIE'].includes(field)) value = value.trim();
  if (Array.from(value).length > (field === 'NOTAS' ? 2000 : 50)) throw new RangeError(`${fieldLabels[field]} supera el límite de caracteres.`);
  if (field === 'PERSONAJE' && !value.trim()) throw new RangeError('El nombre es obligatorio.');
  if (field === 'NOTAS') return value === '' ? null : value;
  if (field === 'PERSONAJE') return value;
  return value.trim() || null;
}
export function reuseValue(value, values) {
  if (value === null) return null;
  return values.find(existing => existing.trim().toLocaleLowerCase('es') === value.toLocaleLowerCase('es'))?.trim() ?? value;
}
