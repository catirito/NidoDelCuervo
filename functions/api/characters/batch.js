import { jsonResponse, failure, readJson } from '../../../server/http.js';
import { validateChanges, updateBatchSql } from '../../../server/characters.js';
export async function onRequest(context) {
  const request = context.request;
  if (request.method !== 'PATCH') return failure(405, 'METHOD', 'Método no permitido.');
  if (request.headers.has('origin') && request.headers.get('origin') !== new URL(request.url).origin) return failure(403, 'ORIGIN', 'Origen no permitido.');
  let changes;
  try { changes = validateChanges(await readJson(request)); }
  catch (error) { return failure(error instanceof RangeError ? 422 : 400, 'VALIDATION', error instanceof RangeError ? error.message : 'Petición inválida.'); }
  try {
    const { results } = await context.env.DB.prepare(updateBatchSql).bind(JSON.stringify(changes)).all();
    if (results.length === changes.length) return jsonResponse({ characters: results });
    const { results: current } = await context.env.DB.prepare('SELECT id, version FROM characters WHERE id IN (SELECT json_extract(value, \'$.id\') FROM json_each(?))').bind(JSON.stringify(changes)).all();
    const versions = new Map(current.map(character => [character.id, character.version]));
    const missing = changes.filter(change => !versions.has(change.id)).map(change => change.id);
    if (missing.length) return failure(404, 'MISSING', 'Algún personaje ya no existe.', { ids: missing });
    return failure(409, 'CONFLICT', 'Hay cambios de otra persona. Actualiza y revisa el borrador antes de guardar.', { ids: changes.filter(change => versions.get(change.id) !== change.expectedVersion).map(change => change.id) });
  } catch { return failure(503, 'SERVICE', 'No se pudo confirmar el guardado. Actualiza antes de volver a intentarlo.'); }
}
