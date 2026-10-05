import { editableFields, validateField } from '../character-fields.js';
import { rankForLevel } from '../rank.js';
import { catalogName } from '../catalog-values.js';
import { readCatalogs, prepareCatalogChanges, catalogWrites } from './catalogs.js';
import { normalizeOptions, serializeCharacter } from './characters.js';
import { jsonResponse, failure, readJson } from './http.js';

export function validateCreation(body) {
  if (!body || Array.isArray(body) || Object.keys(body).some(key => !['id', 'fields', 'catalogAdditions'].includes(key)) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)) throw new Error('Solicitud de alta inválida.');
  if (!body.fields || Array.isArray(body.fields) || typeof body.fields !== 'object' || Object.keys(body.fields).some(key => !editableFields.includes(key))) throw new Error('Campos de alta inválidos.');
  const fields = {};
  for (const field of editableFields) fields[field] = validateField(field, Object.hasOwn(body.fields, field) ? body.fields[field] : (field === 'NIVEL' ? 1 : null));
  for (const field of ['PERSONAJE', 'CLASS', 'SPECIE', 'PROPIETARIO']) if (!fields[field]) throw new RangeError(`${field} es obligatorio.`);
  const additions = body.catalogAdditions ?? {};
  if (!additions || Array.isArray(additions) || typeof additions !== 'object' || Object.keys(additions).some(key => !['classes', 'subclasses', 'species'].includes(key))) throw new Error('Altas de catálogo inválidas.');
  const catalogAdditions = {};
  for (const key of ['classes', 'subclasses', 'species']) {
    const values = additions[key] ?? [];
    if (!Array.isArray(values) || values.length > 203) throw new Error('Altas de catálogo inválidas.');
    const normalized = values.map(value => {
      if (key !== 'subclasses') return catalogName(value);
      if (!value || Object.keys(value).sort().join(',') !== 'className,name') throw new Error('Alta de subclase inválida.');
      return { className: catalogName(value.className), name: catalogName(value.name) };
    });
    catalogAdditions[key] = [...new Map(normalized.map(value => [JSON.stringify(value), value])).values()].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }
  return { id: body.id.toLowerCase(), fields, catalogAdditions };
}
async function receipt(db, id, hash) {
  const saved = await db.prepare('SELECT request_hash FROM creation_requests WHERE character_id = ?').bind(id).first();
  if (!saved) return null;
  if (saved.request_hash !== hash) return failure(409, 'CONFLICT', 'Este intento ya corresponde a otro contenido.');
  return creationResponse(db, id, 200);
}
async function creationResponse(db, id, status) {
  const character = await db.prepare('SELECT id, PERSONAJE, CLASS, SUBCLASS, SPECIE, NIVEL, RANGO, ESTADO, PROPIETARIO, NOTAS, sourceRow, version, is_deleted FROM characters WHERE id = ?').bind(id).first();
  return jsonResponse({ character: serializeCharacter(character), catalogs: await readCatalogs(db) }, status);
}
export async function createCharacter({ request, env }) {
  if (request.headers.has('Origin') && request.headers.get('Origin') !== new URL(request.url).origin) return failure(403, 'ORIGIN', 'Origen no permitido.');
  let operation;
  try { operation = validateCreation(await readJson(request)); }
  catch (error) { return failure(error instanceof RangeError ? 422 : 400, 'VALIDATION', error.message); }
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(operation)));
  const hash = [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, '0')).join('');
  const db = env.DB;
  try {
    const repeated = await receipt(db, operation.id, hash);
    if (repeated) return repeated;
    if (await db.prepare('SELECT id FROM characters WHERE id = ?').bind(operation.id).first()) return failure(409, 'CONFLICT', 'El identificador ya está en uso.');
    const catalogs = await readCatalogs(db);
    const characters = (await db.prepare('SELECT * FROM characters ORDER BY sourceRow').all()).results;
    const change = { id: operation.id, fields: { ...operation.fields } };
    normalizeOptions([change], characters);
    const additions = prepareCatalogChanges([change], operation.catalogAdditions, catalogs, [{ id: operation.id }]);
    const fields = change.fields;
    const writes = catalogWrites(db, additions);
    writes.push(db.prepare(`INSERT INTO characters (id, PERSONAJE, CLASS, SUBCLASS, SPECIE, NIVEL, RANGO, ESTADO, PROPIETARIO, NOTAS, sourceRow, version, name_search)
      VALUES (?, ?, (SELECT name FROM classes WHERE name_key = ?), (SELECT subclasses.name FROM subclasses JOIN classes ON classes.id = subclasses.class_id WHERE classes.name_key = ? AND subclasses.name_key = ?), (SELECT name FROM species WHERE name_key = ?), ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sourceRow), 0) + 1 FROM characters), 0, ?)`)
      .bind(operation.id, fields.PERSONAJE, fields._classKey, fields._classKey, fields._subclassKey, fields._speciesKey, fields.NIVEL, rankForLevel(fields.NIVEL), fields.ESTADO, fields.PROPIETARIO, fields.NOTAS, fields.PERSONAJE.toLocaleLowerCase('es')));
    writes.push(db.prepare('INSERT INTO creation_requests (character_id, request_hash) VALUES (?, ?)').bind(operation.id, hash));
    try { await db.batch(writes); }
    catch (error) {
      const winner = await receipt(db, operation.id, hash);
      if (winner) return winner;
      throw error;
    }
    return await creationResponse(db, operation.id, 201);
  } catch (error) {
    if (error instanceof RangeError || error.message?.includes('catálogo') || error.message?.includes('subclase')) return failure(422, 'CATALOG', error.message);
    return failure(503, 'SERVICE', 'No se pudo confirmar el alta. Comprueba o reintenta el mismo envío.');
  }
}
