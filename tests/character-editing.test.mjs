import assert from 'node:assert/strict';
import { validateField } from '../character-fields.js';
const base = process.argv[2] ?? 'http://127.0.0.1:8788';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const read = async () => (await (await fetch(`${base}/api/characters`)).json()).characters;
const patch = async changes => fetch(`${base}/api/characters/batch`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ changes }) });
const change = (character, fields) => ({ id: character.id, expectedVersion: character.version, fields });
const maximumBody = { changes: Array.from({ length: 203 }, () => ({ id: '11111111-1111-4111-8111-111111111111', expectedVersion: Number.MAX_SAFE_INTEGER, fields: { PERSONAJE: '\u0000'.repeat(50), NOTAS: '\u0000'.repeat(2000), ESTADO: '\u0000'.repeat(50), PROPIETARIO: '\u0000'.repeat(50), NIVEL: 20 } })) };
assert.ok(Buffer.byteLength(JSON.stringify(maximumBody)) < 3145728);
const initial = await read();
const [a, b] = initial;
const current = async id => (await read()).find(character => character.id === id);
assert.equal(validateField('PERSONAJE', '😀'.repeat(50)).length, 100);
assert.throws(() => validateField('PERSONAJE', '😀'.repeat(51)), RangeError);
try {
  for (const fields of [{ PERSONAJE: '' }, { PERSONAJE: '   ' }, { PERSONAJE: null }, { PERSONAJE: 'x'.repeat(51) }, { ESTADO: 'x'.repeat(51) }, { PROPIETARIO: 2 }, { NOTAS: 'x'.repeat(2001) }]) assert.equal((await patch([change(a, fields)])).status, 422);
  for (const fields of [{ sourceRow: 1 }, {}, { RANGO: 'manual' }]) assert.equal((await patch([change(a, fields)])).status, 400);
  assert.deepEqual(await read(), initial);
  const response = await patch([change(a, { PERSONAJE: 'Prueba local', NOTAS: 'Primera línea\n<b>Texto literal</b>', ESTADO: '  Estado local  ', PROPIETARIO: '  Propietario local  ' }), change(b, { PERSONAJE: 'Prueba local', PROPIETARIO: 'PROPIETARIO LOCAL', ESTADO: 'ESTADO LOCAL' })]);
  assert.equal(response.status, 200);
  const saved = await read();
  const savedA = saved.find(character => character.id === a.id);
  const savedB = saved.find(character => character.id === b.id);
  assert.equal(savedA.NIVEL, a.NIVEL);
  assert.equal(savedA.RANGO, a.RANGO);
  assert.equal(savedA.CLASS, a.CLASS);
  assert.equal(savedA.NOTAS, 'Primera línea\n<b>Texto literal</b>');
  assert.equal(savedA.ESTADO, 'Estado local');
  assert.equal(savedB.ESTADO, 'Estado local');
  assert.equal(savedB.PROPIETARIO, 'Propietario local');
  assert.equal(savedA.version, a.version + 1);
  assert.equal((await patch([change(a, { NOTAS: 'Obsoleto' }), change(savedB, { NIVEL: 9 })])).status, 409);
  assert.deepEqual(await read(), saved);
  const concurrent = await Promise.all([patch([change(savedA, { PERSONAJE: 'Cliente uno' }), change(savedB, { NIVEL: 9 })]), patch([change(savedA, { PERSONAJE: 'Cliente dos' }), change(savedB, { NIVEL: 13 })])]);
  assert.deepEqual(concurrent.map(response => response.status).sort(), [200, 409]);
  const now = await current(a.id);
  assert.equal((await current(b.id)).NIVEL, now.PERSONAJE === 'Cliente uno' ? 9 : 13);
  const cleared = await patch([change(now, { NOTAS: null, ESTADO: '', PROPIETARIO: null })]);
  assert.equal(cleared.status, 200);
  const empty = await current(a.id);
  assert.equal(empty.NOTAS, null);
  assert.equal(empty.ESTADO, null);
  assert.equal(empty.PROPIETARIO, null);
  assert.equal((await patch([change(empty, { PERSONAJE: '😀'.repeat(50), NOTAS: 'x'.repeat(2000), ESTADO: 'e'.repeat(50), PROPIETARIO: 'p'.repeat(50) })])).status, 200);
  const canonical = initial.find(character => character.PROPIETARIO && character.id !== a.id && character.id !== b.id)?.PROPIETARIO;
  if (canonical) {
    const response = await patch([change(await current(a.id), { PROPIETARIO: ` ${canonical.toLocaleUpperCase('es')} ` })]);
    assert.equal(response.status, 200);
    assert.equal((await current(a.id)).PROPIETARIO, canonical);
  }
} finally {
  const latest = await read();
  assert.equal((await patch([a, b].map(original => change(latest.find(character => character.id === original.id), Object.fromEntries(['PERSONAJE', 'NOTAS', 'ESTADO', 'PROPIETARIO', 'NIVEL'].map(field => [field, original[field]])))))).status, 200);
}
console.log('005 local: textos parciales, vacíos, límites Unicode, opciones nuevas/canónicas, UUID, lote mixto atómico y concurrencia comprobados. Datos de partida restaurados.');
