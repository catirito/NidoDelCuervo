import { failure, jsonResponse, readJson } from './http.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hasOnly = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).every(key => keys.includes(key));

function validateText(value, required = false) {
  if (typeof value !== 'string' || [...value.trim()].length > 250 || value.includes('\0') || (required && !value.trim())) {
    throw new RangeError('Introduce un nombre y usa como máximo 250 caracteres por campo.');
  }
  return value.trim();
}

function validateChange(change, create) {
  const keys = create ? ['id', 'fields'] : ['id', 'fields', 'expectedVersion'];
  const fieldKeys = ['name', 'animal', 'location', 'ownerIds', ...(!create ? ['isDeleted'] : [])];
  if (!hasOnly(change, keys) || typeof change.id !== 'string' || !uuid.test(change.id) || !hasOnly(change.fields, fieldKeys)) {
    throw new RangeError('Campos no admitidos en Mascotería.');
  }
  const { name, animal = '', location = '', ownerIds = [], isDeleted = false } = change.fields;
  if (!Array.isArray(ownerIds) || ownerIds.length > 500 || ownerIds.some(id => typeof id !== 'string' || !uuid.test(id)) ||
      new Set(ownerIds).size !== ownerIds.length || typeof isDeleted !== 'boolean') {
    throw new RangeError('Selecciona propietarios distintos y un estado de baja válido.');
  }
  if (!create && (!Number.isSafeInteger(change.expectedVersion) || change.expectedVersion < 0)) {
    throw new RangeError('Versión de mascota inválida.');
  }
  return {
    id: change.id,
    expectedVersion: change.expectedVersion,
    name: validateText(name, true),
    animal: validateText(animal),
    location: validateText(location),
    ownerIds: [...ownerIds].sort(),
    isDeleted
  };
}

const changesSql = `
  WITH changes AS (
    SELECT json_extract(value, '$.id') AS id,
           json_extract(value, '$.expectedVersion') AS expected_version,
           json_extract(value, '$.name') AS name,
           json_extract(value, '$.animal') AS animal,
           json_extract(value, '$.location') AS location,
           json_extract(value, '$.ownerIds') AS owners,
           json_extract(value, '$.isDeleted') AS is_deleted
    FROM json_each(?)
  )
`;

const checkChanges = `
  INSERT INTO pet_write_guard (current_versions, valid_owners)
  SELECT NOT EXISTS (
    SELECT 1 FROM changes ch LEFT JOIN pets p ON p.id = ch.id
    WHERE ch.expected_version IS NOT NULL
      AND (p.id IS NULL OR p.is_deleted = 1 OR p.version <> ch.expected_version)
  ), NOT EXISTS (
    SELECT 1 FROM changes ch, json_each(ch.owners) owner
    WHERE NOT EXISTS (
      SELECT 1 FROM characters c WHERE c.id = owner.value AND c.is_deleted = 0 AND trim(c.PERSONAJE) <> ''
    ) AND NOT EXISTS (
      SELECT 1 FROM pet_owners po WHERE po.pet_id = ch.id AND po.character_id = owner.value
    )
  )
`;

const removeOwners = `
  DELETE FROM pet_owners WHERE EXISTS (
    SELECT 1 FROM changes ch WHERE ch.id = pet_owners.pet_id AND ch.is_deleted = 0
      AND pet_owners.character_id NOT IN (SELECT value FROM json_each(ch.owners))
  )
`;

const addOwners = `
  INSERT INTO pet_owners (pet_id, character_id)
  SELECT ch.id, owner.value FROM changes ch, json_each(ch.owners) owner
  WHERE NOT EXISTS (
    SELECT 1 FROM pet_owners po WHERE po.pet_id = ch.id AND po.character_id = owner.value
  )
`;

async function createPet(db, change) {
  const payload = JSON.stringify(change);
  const existing = async () => {
    const row = await db.prepare('SELECT creation_payload FROM pets WHERE id = ?').bind(change.id).first();
    if (!row) return null;
    return row.creation_payload === payload ? jsonResponse({ id: change.id }) :
      failure(409, 'CONFLICT', 'El identificador ya corresponde a otra alta.');
  };
  const replay = await existing();
  if (replay) return replay;
  const changes = JSON.stringify([change]);
  try {
    await db.batch([
      db.prepare(changesSql + checkChanges).bind(changes),
      db.prepare('INSERT INTO pets (id, name, animal, location, creation_payload) VALUES (?, ?, ?, ?, ?)')
        .bind(change.id, change.name, change.animal, change.location, payload),
      db.prepare(changesSql + addOwners).bind(changes),
      db.prepare('DELETE FROM pet_write_guard')
    ]);
  } catch (error) {
    const concurrentReplay = await existing();
    if (concurrentReplay) return concurrentReplay;
    throw error;
  }
  return jsonResponse({ id: change.id }, 201);
}

async function updatePets(db, changes) {
  const payload = JSON.stringify(changes);
  await db.batch([
    db.prepare(changesSql + checkChanges).bind(payload),
    db.prepare(changesSql + `
      UPDATE pets SET name = ch.name, animal = ch.animal, location = ch.location,
        is_deleted = ch.is_deleted, version = pets.version + 1
      FROM changes ch WHERE pets.id = ch.id
    `).bind(payload),
    db.prepare(changesSql + removeOwners).bind(payload),
    db.prepare(changesSql + addOwners).bind(payload),
    db.prepare('DELETE FROM pet_write_guard')
  ]);
  return jsonResponse({ ids: changes.map(change => change.id) });
}

export async function writePets({ request, env }, create) {
  if (request.headers.has('origin') && request.headers.get('origin') !== new URL(request.url).origin) {
    return failure(403, 'ORIGIN', 'Origen no permitido.');
  }
  let body;
  try {
    body = await readJson(request);
  } catch {
    return failure(400, 'JSON', 'Envía una petición JSON válida.');
  }
  try {
    if (create) return await createPet(env.DB, validateChange(body, true));
    if (!hasOnly(body, ['changes']) || !Array.isArray(body.changes) || !body.changes.length) {
      throw new RangeError('El lote de mascotas no es válido.');
    }
    const changes = body.changes.map(change => validateChange(change, false));
    if (new Set(changes.map(change => change.id)).size !== changes.length) throw new RangeError('El lote contiene mascotas repetidas.');
    return await updatePets(env.DB, changes);
  } catch (error) {
    if (error instanceof RangeError) return failure(422, 'VALIDATION', error.message);
    if (error.message.includes('pet_stale')) return failure(409, 'CONFLICT', 'Alguna mascota ha cambiado. Actualiza antes de guardar.');
    if (error.message.includes('pet_invalid_owner')) return failure(422, 'OWNER', 'Algún propietario nuevo no es un personaje activo.');
    return failure(503, 'SERVICE', 'No se pudo confirmar el guardado.');
  }
}
