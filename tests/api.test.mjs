import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readCharacters, fields } from '../records.js';
import { rankForLevel } from '../rank.js';
const base = process.argv[2] ?? 'http://127.0.0.1:8788';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Estas pruebas solo se ejecutan en local.');
const read = async () => {
  const response = await fetch(`${base}/api/characters`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
  return (await response.json()).characters;
};
const patch = async changes => fetch(`${base}/api/characters/batch`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ changes }) });
const change = (character, level) => ({ id: character.id, expectedVersion: character.version, fields: { NIVEL: level } });
const require = createRequire(import.meta.url);
const xlsx = require('../vendor/xlsx.full.min.js');
const original = await fs.readFile(new URL('../Registro de personajes.xlsx', import.meta.url));
assert.equal(createHash('sha256').update(original).digest('hex'), '8ca0c7869c145d556ec22d40554c55fe5b3236a86452d65668c7b43a0bce528f');
const source = readCharacters(xlsx.read(original, { type: 'buffer' }), xlsx);
const initial = await read();
assert.equal(initial.length, 203);
assert.equal(new Set(initial.map(item => item.id)).size, 203);
for (let i = 0; i < initial.length; i++) {
  for (const field of fields.filter(field => field !== 'RANGO')) assert.deepEqual(initial[i][field], source[i][field]);
  assert.equal(initial[i].RANGO, rankForLevel(initial[i].NIVEL));
  assert.match(initial[i].id, /^[0-9a-f-]{36}$/);
  assert.equal(initial[i].sourceRow, source[i].sourceRow);
}
const [a, b] = initial;
try {
  for (const level of [0, 21, 1.5, '5', null]) assert.equal((await patch([change(a, level)])).status, 422);
  assert.equal((await patch([change(a, 8), change(a, 7)])).status, 400);
  assert.equal((await patch([{ ...change(a, 8), fields: { NIVEL: 8, RANGO: 'manual' } }])).status, 400);
  assert.equal((await patch([{ ...change(a, 8), id: 'bad' }])).status, 400);
  assert.equal((await patch([{ ...change(a, 8), id: '11111111-1111-4111-8111-111111111111' }, change(b, 7)])).status, 404);
  assert.equal((await read()).find(item => item.id === b.id).version, b.version);
  const saved = await patch([change(a, 8), change(b, 5)]);
  assert.equal(saved.status, 200);
  const savedRows = (await saved.json()).characters;
  assert.equal(savedRows.length, 2);
  assert.equal(savedRows.find(item => item.id === a.id).RANGO, 'Cuervo gris');
  const after = await read();
  const currentA = after.find(item => item.id === a.id);
  const currentB = after.find(item => item.id === b.id);
  assert.equal(currentA.version, a.version + 1);
  assert.equal((await patch([change(a, 9), change(currentB, 9)])).status, 409);
  assert.deepEqual(await read(), after);
  const contenders = await Promise.all([patch([change(currentA, 9), change(currentB, 9)]), patch([change(currentA, 13), change(currentB, 13)])]);
  assert.deepEqual(contenders.map(item => item.status).sort(), [200, 409]);
  const concurrent = await read();
  assert.equal(concurrent.find(item => item.id === a.id).NIVEL, concurrent.find(item => item.id === b.id).NIVEL);
  for (const level of [20, 17, 16, 13, 12, 9, 8, 5, 4, 3, 2, 1]) {
    const current = (await read()).find(item => item.id === a.id);
    const response = await patch([change(current, level)]);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).characters[0].RANGO, rankForLevel(level));
  }
  const malformed = await fetch(`${base}/api/characters/batch`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  const oversized = await fetch(`${base}/api/characters/batch`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: ' '.repeat(65537) });
  assert.equal(oversized.status, 400);
  assert.equal((await fetch(`${base}/api/characters/batch`, { method: 'POST' })).status, 405);
  for (const path of ['Registro%20de%20personajes.xlsx', 'Memories.md', 'migrations/0001_characters.sql', '.git/config']) assert.equal((await fetch(`${base}/${path}`)).status, 404);
} finally {
  const latest = await read();
  const restore = [a, b].map(original => change(latest.find(item => item.id === original.id), original.NIVEL));
  assert.equal((await patch(restore)).status, 200);
}
console.log('D1 local: importación fiel, validación, umbrales, lote atómico, concurrencia, versiones y paquete público comprobados. Niveles iniciales restaurados.');
