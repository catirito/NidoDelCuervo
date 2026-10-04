import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs/promises';
const base = process.argv[2] ?? 'http://127.0.0.1:8788';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = require(process.env.MINIFLARE_MODULE || 'miniflare');
const config = JSON.parse(await fs.readFile('wrangler.jsonc', 'utf8'));
assert.equal(config.d1_databases[0].remote, false);
const runtime = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default {}', resourcePersistencePath: path.resolve('.wrangler/state/v3'), d1Databases: { DB: config.d1_databases[0].database_id } }));
const db = await runtime.getD1Database('DB');
const read = async () => (await (await fetch(`${base}/api/characters`)).json());
const patch = async (changes, catalogAdditions) => fetch(`${base}/api/characters/batch`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ changes, ...(catalogAdditions ? { catalogAdditions } : {}) }) });
const change = (character, fields) => ({ id: character.id, expectedVersion: character.version, fields });
const start = await read();
const [a, b] = start.characters;
const current = async id => (await read()).characters.find(character => character.id === id);
const prefix = `Prueba ${randomUUID().slice(0, 8)}`;
const className = `${prefix} clase`;
const subclass = `${prefix} subclase`;
const species = `${prefix} especie`;
const trigger = `test_rollback_${prefix.split(' ')[1]}`;
try {
  assert.equal(start.catalogs.classes.length, 15);
  assert.equal(start.catalogs.subclasses.length, 150);
  assert.equal(start.catalogs.species.length, 179);
  assert.equal(start.characters.find(character => character.sourceRow === 49).CLASS, 'Paladin');
  for (const name of ['Ranger', 'Rogue']) {
    const parent = start.catalogs.classes.find(item => item.name === name);
    assert.ok(start.catalogs.subclasses.some(item => item.classId === parent.id && item.name === 'Phantom'));
  }
  assert.ok(start.catalogs.species.some(option => !start.characters.some(character => character.SPECIE === option.name)));
  for (const fields of [{ CLASS: 'Barbarian', SUBCLASS: 'Oath of Devotion' }, { CLASS: null, SUBCLASS: 'Phantom' }, { SPECIE: species }, { CLASS: className, SUBCLASS: null }, { CLASS: 'x'.repeat(51), SUBCLASS: null }]) assert.equal((await patch([change(a, fields)])).status, 422);
  assert.equal((await patch([change(a, { NOTAS: 'Sin alta independiente' })], { species: [species] })).status, 422);
  assert.deepEqual(await read(), start);
  const created = await patch([change(a, { CLASS: className, SUBCLASS: subclass, SPECIE: species, NOTAS: 'Lote con catálogos' })], { classes: [className], subclasses: [{ className, name: subclass }], species: [species] });
  assert.equal(created.status, 200);
  const afterCreate = await read();
  const parent = afterCreate.catalogs.classes.find(item => item.name === className);
  assert.ok(afterCreate.catalogs.subclasses.some(item => item.classId === parent.id && item.name === subclass));
  assert.equal((await current(a.id)).SPECIE, species);
  assert.equal((await patch([change(await current(a.id), { CLASS: null, SUBCLASS: null, SPECIE: null })])).status, 200);
  const unused = await read();
  assert.ok(unused.catalogs.classes.some(item => item.name === className));
  assert.ok(unused.catalogs.species.some(item => item.name === species));
  assert.equal((await patch([change(await current(a.id), { CLASS: ` ${className.toUpperCase()} `, SUBCLASS: subclass.toUpperCase(), SPECIE: species.toUpperCase() })])).status, 200);
  assert.equal((await current(a.id)).CLASS, className);
  const sameVersion = await current(a.id);
  const first = `${prefix} uno`, second = `${prefix} dos`;
  const contenders = await Promise.all([patch([change(sameVersion, { SPECIE: first })], { species: [first] }), patch([change(sameVersion, { SPECIE: second })], { species: [second] })]);
  assert.deepEqual(contenders.map(response => response.status).sort(), [200, 409]);
  const race = await read();
  const savedSpecies = race.characters.find(character => character.id === a.id).SPECIE;
  assert.ok(race.catalogs.species.some(item => item.name === savedSpecies));
  assert.ok(!race.catalogs.species.some(item => item.name === (savedSpecies === first ? second : first)));
  const common = `${prefix} simultánea`, commonSub = `${prefix} común`;
  const twoRows = [await current(a.id), await current(b.id)];
  const disjoint = await Promise.all(twoRows.map((character, index) => patch([change(character, { CLASS: index ? common.toUpperCase() : common, SUBCLASS: index ? commonSub.toUpperCase() : commonSub })], { classes: [index ? common.toUpperCase() : common], subclasses: [{ className: index ? common.toUpperCase() : common, name: index ? commonSub.toUpperCase() : commonSub }] })));
  assert.deepEqual(disjoint.map(response => response.status), [200, 200]);
  const dedup = await read();
  const canonicalClass = dedup.catalogs.classes.filter(item => item.nameKey === common.toLowerCase());
  assert.equal(canonicalClass.length, 1);
  assert.equal(dedup.catalogs.subclasses.filter(item => item.classId === canonicalClass[0].id && item.nameKey === commonSub.toLowerCase()).length, 1);
  assert.equal((await current(a.id)).CLASS, (await current(b.id)).CLASS);
  assert.equal((await current(a.id)).SUBCLASS, (await current(b.id)).SUBCLASS);
  const rollbackSpecies = `${prefix} rollback`;
  const beforeRollback = await read();
  await db.prepare(`CREATE TRIGGER ${trigger} BEFORE UPDATE ON characters WHEN NEW.SPECIE = '${rollbackSpecies}' BEGIN SELECT RAISE(ABORT, 'Prueba de rollback'); END`).run();
  assert.equal((await patch([change(await current(a.id), { SPECIE: rollbackSpecies })], { species: [rollbackSpecies] })).status, 503);
  assert.deepEqual(await read(), beforeRollback);
  await db.prepare(`DROP TRIGGER ${trigger}`).run();
} finally {
  await db.prepare(`DROP TRIGGER IF EXISTS ${trigger}`).run();
  const latest = (await read()).characters;
  assert.equal((await patch([a, b].map(original => change(latest.find(character => character.id === original.id), Object.fromEntries(['CLASS', 'SUBCLASS', 'SPECIE', 'NOTAS'].map(field => [field, original[field]])))))).status, 200);
  await db.batch([
    db.prepare('DELETE FROM subclasses WHERE name LIKE ?').bind(`${prefix}%`),
    db.prepare('DELETE FROM classes WHERE name LIKE ?').bind(`${prefix}%`),
    db.prepare('DELETE FROM species WHERE name LIKE ?').bind(`${prefix}%`)
  ]);
  await runtime.dispose();
}
console.log('006 D1 local: carga, relaciones, opciones nuevas/sin uso, normalización, concurrencia, ausencia de altas por conflicto y rollback de transacción comprobados. Datos y opciones de prueba restaurados.');
