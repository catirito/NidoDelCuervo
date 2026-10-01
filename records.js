export const fields = ['PERSONAJE', 'CLASS', 'SUBCLASS', 'SPECIE', 'NIVEL', 'RANGO', 'ESTADO', 'PROPIETARIO', 'NOTAS'];
export const filterFields = ['CLASS', 'SUBCLASS', 'SPECIE', 'RANGO', 'PROPIETARIO'];
const textOrder = new Intl.Collator('es', { sensitivity: 'variant', numeric: false });

export function readCharacters(workbook, xlsx) {
  const sheet = workbook.Sheets['Nido del Cuervo'];
  if (!sheet) throw new Error('El Excel no contiene la hoja «Nido del Cuervo».');
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true, blankrows: true });
  if (!rows.length || fields.some((field, index) => rows[0][index] !== field)) {
    throw new Error('Los encabezados del Excel no coinciden con los nueve campos del registro.');
  }
  return rows.slice(1).flatMap((row, index) => {
    if (fields.every((field, column) => row[column] == null || row[column] === '')) return [];
    const character = Object.fromEntries(fields.map((field, column) => [field, row[column] ?? null]));
    if (character.NIVEL != null && (typeof character.NIVEL !== 'number' || !Number.isFinite(character.NIVEL))) {
      throw new Error(`El nivel de la fila ${index + 2} no es numérico.`);
    }
    return [{ ...character, sourceRow: index + 2 }];
  });
}

export function isMissing(value) {
  return value == null || value === '';
}

export function filterCharacters(characters, name, categories) {
  const search = name.toLocaleLowerCase('es');
  return characters.filter(character =>
    String(character.PERSONAJE ?? '').toLocaleLowerCase('es').includes(search) &&
    filterFields.every(field => !categories[field] || String(character[field] ?? '') === categories[field])
  );
}

export function sortCharacters(characters, field = 'NIVEL', direction = 'descending') {
  const multiplier = direction === 'ascending' ? 1 : -1;
  return [...characters].sort((first, second) => {
    const a = first[field];
    const b = second[field];
    if (isMissing(a) || isMissing(b)) {
      if (isMissing(a) !== isMissing(b)) return isMissing(a) ? 1 : -1;
      return first.sourceRow - second.sourceRow;
    }
    const comparison = field === 'NIVEL' ? a - b : textOrder.compare(String(a), String(b));
    return comparison * multiplier || first.sourceRow - second.sourceRow;
  });
}

export function categoryValues(characters, field) {
  return [...new Set(characters.map(character => character[field]).filter(value => !isMissing(value)).map(String))]
    .sort(textOrder.compare);
}
