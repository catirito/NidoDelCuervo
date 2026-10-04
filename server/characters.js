import { rankForLevel } from '../rank.js';
export const updateBatchSql = `
WITH changes AS (
  SELECT json_extract(value, '$.id') AS id,
         json_extract(value, '$.expectedVersion') AS expectedVersion,
         json_extract(value, '$.level') AS level,
         json_extract(value, '$.rank') AS rank
  FROM json_each(?1)
)
UPDATE characters
SET NIVEL = (SELECT level FROM changes WHERE changes.id = characters.id),
    RANGO = (SELECT rank FROM changes WHERE changes.id = characters.id),
    version = version + 1
WHERE id IN (SELECT id FROM changes)
  AND (SELECT count(*) FROM changes JOIN characters AS current
       ON current.id = changes.id AND current.version = changes.expectedVersion)
      = (SELECT count(*) FROM changes)
RETURNING *`;
export function validateChanges(body) {
  if (!body || Object.keys(body).length !== 1 || !Array.isArray(body.changes) || body.changes.length < 1 || body.changes.length > 203) throw new Error('Lote inválido: entre 1 y 203 cambios.');
  const ids = new Set();
  return body.changes.map(change => {
    if (!change || Object.keys(change).sort().join(',') !== 'expectedVersion,fields,id' || typeof change.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(change.id) || ids.has(change.id) || !Number.isSafeInteger(change.expectedVersion) || change.expectedVersion < 0 || !change.fields || Object.keys(change.fields).join(',') !== 'NIVEL') throw new Error('Identificador, versión o campos inválidos.');
    ids.add(change.id);
    return { id: change.id, expectedVersion: change.expectedVersion, level: change.fields.NIVEL, rank: rankForLevel(change.fields.NIVEL) };
  });
}
