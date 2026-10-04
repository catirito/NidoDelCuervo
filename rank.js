export function rankForLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > 20) throw new RangeError('El nivel debe ser un entero entre 1 y 20.');
  return level >= 17 ? 'Cuervo de ónice' : level >= 13 ? 'Cuervo de ébano' : level >= 9 ? 'Cuervo negro' : level >= 5 ? 'Cuervo gris' : level >= 3 ? 'Cuervo blanco' : 'Corvato';
}
