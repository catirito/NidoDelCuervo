import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = require(process.env.MINIFLARE_MODULE || 'miniflare');
const runtime = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default {}', d1Databases: { DB: "mascoteria-tests" } }));
try {
  const db = await runtime.getD1Database('DB');
  for (const file of (await fs.readdir('migrations')).filter(file => file.endsWith('.sql')).sort()) {
    const sql = await fs.readFile(`migrations/${file}`, 'utf8');
    await db.batch(sql.split(';').filter(statement => statement.trim()).map(statement => db.prepare(statement)));
  }
  await assert.rejects(db.prepare("INSERT INTO pets(id, name) VALUES ('missing', '')").run(), /CHECK/);
  const { onRequest: index } = await import('../functions/api/mascoteria/index.js');
  const { onRequest: batch } = await import('../functions/api/mascoteria/batch.js');
  const owners = ['Uno', 'Dos', 'Tres'].map(name => ({ id: randomUUID(), name }));
  for (const [row, owner] of owners.entries()) {
    await db.prepare("INSERT INTO characters(id, PERSONAJE, NIVEL, RANGO, sourceRow) VALUES (?, ?, 1, 'Cuervo negro', ?)").bind(owner.id, owner.name, row + 1).run();
  }
  const call = (handler, method, body, query = '', headers = { 'Content-Type': 'application/json' }) => handler({
    request: new Request(`http://localhost/api/mascoteria${query}`, { method, headers, body: typeof body === 'string' ? body : JSON.stringify(body) }),
    env: { DB: db }
  });
  const read = async query => (await call(index, 'GET', undefined, query)).json();
  const add = (id, fields) => call(index, 'POST', { id, fields });
  const patch = (...changes) => call(batch, 'PATCH', { changes });
  const alpha = randomUUID(), beta = randomUUID();
  const full = { name: 'Águila', ownerIds: [owners[0].id, owners[1].id], animal: 'Ave', location: 'Nido' };
  assert.equal((await add(alpha, full)).status, 201);
  await assert.rejects(db.prepare('INSERT INTO pet_owners(pet_id, character_id) VALUES (?, ?)').bind(alpha, owners[0].id).run(), /UNIQUE/);
  assert.equal((await add(alpha, full)).status, 200);
  assert.equal((await add(alpha, { name: 'Otro' })).status, 409);
  assert.equal((await add(beta, { name: 'Sin vínculos' })).status, 201);
  assert.equal((await add(randomUUID(), { name: ' ' })).status, 422);
  for (const field of ['image', 'imageUrl', 'imageId', 'files']) {
    assert.equal((await add(randomUUID(), { name: 'Imagen', [field]: 'https://example.com/x' })).status, 422);
    assert.equal((await patch({ id: alpha, expectedVersion: 0, fields: { ...full, [field]: 'x' } })).status, 422);
  }
  assert.equal((await call(index, 'POST', 'archivo', '', { 'Content-Type': 'multipart/form-data; boundary=x' })).status, 400);
  assert.equal((await read(`?owner=${owners[1].id}&animal=Ave&location=Nido&search=ÁG`)).pets.length, 1);
  assert.equal((await read('?owner=&location=')).pets[0].id, beta);
  assert.equal((await read('?search=Aguila')).pets.length, 0);
  await db.prepare("UPDATE characters SET PERSONAJE = 'Uno oficial', is_deleted = 1 WHERE id = ?").bind(owners[0].id).run();
  const renamed = await read(`?owner=${owners[0].id}`);
  assert.ok(renamed.pets[0].owners.some(owner => owner.name === 'Uno oficial'));
  assert.ok(!renamed.activeOwners.some(owner => owner.id === owners[0].id));
  assert.equal((await patch({ id: alpha, expectedVersion: 0, fields: { ...full, location: '' } })).status, 200);
  assert.equal((await patch({ id: beta, expectedVersion: 0, fields: { name: 'Inválido', ownerIds: [owners[0].id] } })).status, 422);
  assert.equal((await patch(
    { id: alpha, expectedVersion: 1, fields: { ...full, name: 'Cambio parcial' } },
    { id: beta, expectedVersion: 1, fields: { name: 'Conflicto' } }
  )).status, 409);
  assert.equal((await read(`?owner=${owners[0].id}`)).pets[0].name, full.name);
  const edit = { id: alpha, expectedVersion: 1, fields: { name: full.name, ownerIds: [] } };
  assert.deepEqual((await Promise.all([patch(edit), patch(edit)])).map(response => response.status).sort(), [200, 409]);
  assert.equal((await read(`?owner=${owners[0].id}`)).pets.length, 0);
  assert.equal((await patch({ ...edit, expectedVersion: 2, fields: { ...edit.fields, ownerIds: [owners[1].id] } })).status, 200);
  assert.equal((await patch({ ...edit, expectedVersion: 3, fields: { ...edit.fields, isDeleted: true } })).status, 200);
  assert.equal(await db.prepare('SELECT character_id FROM pet_owners WHERE pet_id = ?').bind(alpha).first('character_id'), owners[1].id);
  assert.equal((await read('?pageSize=all')).pets.length, 1);
  assert.equal((await read('?pageSize=20&page=999')).pagination.page, 1);
  for (const fields of [
    { name: 'Orden Alba', animal: 'Ave', location: 'Establos' },
    { name: 'Orden Berta', animal: 'Zorro', location: 'Mascotería' },
    { name: 'Orden Clara', animal: 'Équido', location: 'Mascotería' },
    { name: 'Orden Dora', animal: 'Ave', location: 'Mascotería' },
    { name: 'Orden Ana', location: 'Mascotería' }
  ]) {
    assert.equal((await add(randomUUID(), fields)).status, 201);
  }
  const ordered = (await read('?search=Orden&pageSize=20')).pets.map(pet => pet.name);
  assert.deepEqual(ordered, ['Orden Dora', 'Orden Clara', 'Orden Berta', 'Orden Ana', 'Orden Alba']);
  console.log('Mascotería D1 y API: esquema, filtros, propietarios, altas, bajas, reintentos, concurrencia y rechazo de imágenes.');
} finally {
  await runtime.dispose();
}
