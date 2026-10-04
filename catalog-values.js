export function catalogKey(value) { return value.trim().toLocaleLowerCase('es'); }
export function catalogName(value) {
  if (typeof value !== 'string' || !value.trim() || Array.from(value.trim()).length > 50) throw new RangeError('La opción debe tener entre 1 y 50 caracteres.');
  return value.trim();
}
