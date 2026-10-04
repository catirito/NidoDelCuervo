import { readCatalogs, prepareCatalogChanges, catalogWrites, catalogStatements, catalogsFromResults } from '../../../server/catalogs.js';
import { jsonResponse, failure, readJson } from '../../../server/http.js';
import { validateChanges, updateBatchSql, normalizeOptions } from '../../../server/characters.js';
export async function onRequest(context) {
  const request = context.request;
  if (request.method !== 'PATCH') return failure(405, 'METHOD', 'Método no permitido.');
  if (request.headers.has('origin') && request.headers.get('origin') !== new URL(request.url).origin) return failure(403, 'ORIGIN', 'Origen no permitido.');
  let changes;
  let body;
  try { body = await readJson(request); changes = validateChanges(body); }
  catch (error) { return failure(error instanceof RangeError ? 422 : 400, 'VALIDATION', error instanceof RangeError ? error.message : 'Petición inválida.'); }
  try {
    const { results: characters } = await context.env.DB.prepare('SELECT * FROM characters ORDER BY sourceRow').all();
    const stale = changes.filter(change => !characters.some(character => character.id === change.id && character.version === change.expectedVersion));
    if (stale.length) {
      const missing = stale.filter(change => !characters.some(character => character.id === change.id));
      return failure(missing.length ? 404 : 409, missing.length ? 'MISSING' : 'CONFLICT', missing.length ? 'Algún personaje ya no existe.' : 'Hay cambios de otra persona. Actualiza y revisa el borrador.', { ids: (missing.length ? missing : stale).map(change => change.id) });
    }
    changes = normalizeOptions(changes, characters);
    const catalogs = await readCatalogs(context.env.DB);
    const additions = prepareCatalogChanges(changes, body.catalogAdditions, catalogs, characters);
    const inserts = catalogWrites(context.env.DB, additions, changes);
    const result = await context.env.DB.batch([...inserts, context.env.DB.prepare(updateBatchSql).bind(JSON.stringify(changes)), ...catalogStatements.map(sql => context.env.DB.prepare(sql))]);
    const results = result[inserts.length].results;
    if (results.length === changes.length) return jsonResponse({ characters: results, catalogs: catalogsFromResults(result.slice(inserts.length + 1)) });
    const { results: current } = await context.env.DB.prepare('SELECT id, version FROM characters WHERE id IN (SELECT json_extract(value, \'$.id\') FROM json_each(?))').bind(JSON.stringify(changes)).all();
    const versions = new Map(current.map(character => [character.id, character.version]));
    const missing = changes.filter(change => !versions.has(change.id)).map(change => change.id);
    if (missing.length) return failure(404, 'MISSING', 'Algún personaje ya no existe.', { ids: missing });
    return failure(409, 'CONFLICT', 'Hay cambios de otra persona. Actualiza y revisa el borrador antes de guardar.', { ids: changes.filter(change => versions.get(change.id) !== change.expectedVersion).map(change => change.id) });
  } catch (error) {
    if (error instanceof RangeError) return failure(422, 'CATALOG', error.message);
    if (error.message?.includes('inválid')) return failure(400, 'CATALOG', 'Altas de catálogo inválidas.');
    return failure(503, 'SERVICE', 'No se pudo confirmar el guardado. Actualiza antes de volver a intentarlo.'); }
}
