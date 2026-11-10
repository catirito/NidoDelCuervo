import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { readPetSource, planPetImport, applyPetImport } from '../scripts/import-mascoteria.mjs';

const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = require(process.env.MINIFLARE_MODULE || 'miniflare');
const source = await readPetSource(new URL('../.local/imports/012-mascoteria/La-Mascoteria.xlsx', import.meta.url));
assert.equal(source.entries.length, 55);
assert.deepEqual(source.entries.reduce((counts, { location }) => ({ ...counts, [location]: (counts[location] ?? 0) + 1 }), {}), {
  'Mascotería': 24, 'Fuera del gremio': 7, Establos: 4, '': 20
});
assert.deepEqual(source.exclusions.map(item => item.cell).sort(), ['A25', 'A26', 'K8', 'S18']);
assert.deepEqual(source.entries.filter(pet => pet.owners.length === 0).map(pet => pet.cell).sort(), ['A24', 'K18', 'P3', 'P4', 'P5', 'P6']);
assert.deepEqual(source.entries.find(pet => pet.cell === 'K10').owners, ['Kekai', 'Francis "Chispas"', 'Gorluk']);
assert.equal(source.entries.filter(pet => pet.name === 'Calcetines').length, 2);
const characters = [...new Set(source.entries.flatMap(pet => pet.owners))].map(name => ({ id: randomUUID(), name }));
const ambiguous = planPetImport(source, [...characters, { id: randomUUID(), name: 'KEKAI' }]);
assert.deepEqual(ambiguous.issues, [{ cell: 'K10', owner: 'Kekai', matches: 2 }]);
const runtime = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default {}', d1Databases: { DB: 'pet-import-test' } }));
try {
  const db = await runtime.getD1Database('DB');
  for (const file of ['0001_characters.sql', '0006_character_soft_delete.sql', '0007_mascoteria.sql']) {
    const sql = await fs.readFile(new URL(`../migrations/${file}`, import.meta.url), 'utf8');
    await db.batch(sql.split(';').filter(statement => statement.trim()).map(statement => db.prepare(statement)));
  }
  for (const [row, { id, name }] of characters.entries()) {
    await db.prepare("INSERT INTO characters (id, PERSONAJE, NIVEL, RANGO, sourceRow) VALUES (?, ?, 1, 'Cuervo negro', ?)").bind(id, name, row + 1).run();
  }
  await assert.rejects(applyPetImport(db, ambiguous), /discrepancias/);
  assert.equal(await db.prepare('SELECT count(*) AS total FROM pets').first('total'), 0);
  const plan = planPetImport(source, characters);
  assert.equal(await applyPetImport(db, plan), true);
  assert.equal(await db.prepare('SELECT count(*) AS total FROM pets').first('total'), 55);
  await db.prepare("UPDATE pets SET name = 'Editada', is_deleted = 1 WHERE source_cell = 'K10'").run();
  assert.equal(await applyPetImport(db, plan), false);
  assert.deepEqual(await db.prepare("SELECT name, is_deleted FROM pets WHERE source_cell = 'K10'").first(), { name: 'Editada', is_deleted: 1 });
  assert.equal(await db.prepare("SELECT count(*) AS total FROM pet_owners JOIN pets ON pets.id = pet_id WHERE source_cell = 'K10'").first('total'), 3);
  console.log('Importación: conciliación de 55 entradas, exclusiones, ambigüedad y repetición sin sobrescrituras.');
} finally {
  await runtime.dispose();
}
