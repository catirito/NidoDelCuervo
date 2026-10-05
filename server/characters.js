import { rankForLevel } from '../rank.js';
import { editableFields, validateField, reuseValue } from '../character-fields.js';
const storedFields = [...editableFields, 'RANGO'];
const catalogNames = {
  CLASS: "CASE WHEN json_extract(fields, '$.CLASS') IS NULL THEN NULL ELSE (SELECT name FROM classes WHERE name_key = json_extract(fields, '$._classKey')) END",
  SUBCLASS: "CASE WHEN json_extract(fields, '$.SUBCLASS') IS NULL THEN NULL ELSE (SELECT name FROM subclasses WHERE class_id = (SELECT id FROM classes WHERE name_key = json_extract(fields, '$._classKey')) AND name_key = json_extract(fields, '$._subclassKey')) END",
  SPECIE: "CASE WHEN json_extract(fields, '$.SPECIE') IS NULL THEN NULL ELSE (SELECT name FROM species WHERE name_key = json_extract(fields, '$._speciesKey')) END"
};
const assignments = storedFields.map(field => `${field} = CASE WHEN (SELECT json_type(fields, '$.${field}') FROM changes WHERE changes.id = characters.id) IS NOT NULL THEN (SELECT ${catalogNames[field] ?? `json_extract(fields, '$.${field}')`} FROM changes WHERE changes.id = characters.id) ELSE ${field} END`);

export const updateBatchSql = `
WITH changes AS (
  SELECT json_extract(value, '$.id') AS id,
         json_extract(value, '$.expectedVersion') AS expectedVersion,
         json_extract(value, '$.fields') AS fields
  FROM json_each(?1)
)
UPDATE characters
SET ${assignments.join(', ')}, name_search = CASE WHEN (SELECT json_type(fields, '$.PERSONAJE') FROM changes WHERE changes.id = characters.id) IS NOT NULL THEN (SELECT json_extract(fields, '$._nameSearch') FROM changes WHERE changes.id = characters.id) ELSE name_search END, version = version + 1
WHERE id IN (SELECT id FROM changes)
  AND (SELECT count(*) FROM changes JOIN characters AS current
       ON current.id = changes.id AND current.version = changes.expectedVersion)
      = (SELECT count(*) FROM changes)
RETURNING id, PERSONAJE, CLASS, SUBCLASS, SPECIE, NIVEL, RANGO, ESTADO, PROPIETARIO, NOTAS, sourceRow, version`;
export function validateChanges(body) {
  if (!body || Object.keys(body).some(key => !['changes', 'catalogAdditions'].includes(key)) || !Array.isArray(body.changes) || body.changes.length < 1 || body.changes.length > 203) throw new Error('Lote inválido: entre 1 y 203 cambios.');
  const ids = new Set();
  return body.changes.map(change => {
    if (!change || Object.keys(change).sort().join(',') !== 'expectedVersion,fields,id' || typeof change.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(change.id) || ids.has(change.id) || !Number.isSafeInteger(change.expectedVersion) || change.expectedVersion < 0 || !change.fields || typeof change.fields !== 'object' || Array.isArray(change.fields) || !Object.keys(change.fields).length || Object.keys(change.fields).some(field => !editableFields.includes(field))) throw new Error('Identificador, versión o campos inválidos.');
    ids.add(change.id);
    const fields = Object.fromEntries(Object.entries(change.fields).map(([field, value]) => [field, validateField(field, value)]));
    if (Object.hasOwn(fields, 'PERSONAJE')) fields._nameSearch = fields.PERSONAJE.toLocaleLowerCase('es');
    if (Object.hasOwn(fields, 'NIVEL')) fields.RANGO = rankForLevel(fields.NIVEL);
    return { id: change.id, expectedVersion: change.expectedVersion, fields };
  });
}
export function normalizeOptions(changes, characters) {
  const options = Object.fromEntries(['ESTADO', 'PROPIETARIO'].map(field => [field, [...new Set(characters.map(character => character[field]).filter(Boolean))]]));
  for (const change of changes) {
    for (const field of Object.keys(options)) {
      if (!Object.hasOwn(change.fields, field)) continue;
      change.fields[field] = reuseValue(change.fields[field], options[field]);
      if (change.fields[field] !== null && !options[field].includes(change.fields[field])) options[field].push(change.fields[field]);
    }
  }
  return changes;
}
