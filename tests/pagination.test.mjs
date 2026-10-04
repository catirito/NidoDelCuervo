import assert from 'node:assert/strict';
import { sortCharacters, filterCharacters } from '../records.js';
const base = process.argv[2] ?? 'http://127.0.0.1:8788';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('Solo localhost.');
async function read(params = '') {
  const response = await fetch(`${base}/api/characters${params ? '?' + params : ''}`);
  assert.equal(response.status, 200);
  return response.json();
}
const all = await read('pageSize=all');
assert.equal(all.characters.length, all.pagination.totalRecords);
assert.deepEqual(all.characters, sortCharacters(all.characters));
const first = await read();
assert.equal(first.characters.length, 50);
assert.equal(first.pagination.totalPages, Math.ceil(all.characters.length / 50));
for (const size of [20, 50, 100]) {
  const rows = [];
  for (let page = 1; page <= Math.ceil(all.characters.length / size); page++) rows.push(...(await read(`page=${page}&pageSize=${size}`)).characters);
  assert.deepEqual(rows, all.characters);
}
for (const field of ['CLASS', 'SUBCLASS', 'SPECIE', 'RANGO', 'PROPIETARIO']) {
  for (const direction of ['asc', 'desc']) {
    const result = await read(`sort=${field}&direction=${direction}&pageSize=20&page=2`);
    assert.deepEqual(result.characters, sortCharacters(all.characters, field, direction === 'asc' ? 'ascending' : 'descending').slice(20, 40));
  }
}
const target = all.characters.at(-1);
const search = await read(new URLSearchParams({ search: target.PERSONAJE.toLocaleUpperCase('es'), pageSize: '20' }));
assert.deepEqual(search.characters, filterCharacters(all.characters, target.PERSONAJE.toLocaleUpperCase('es'), {}));
for (const value of ['Á', '%', '_']) {
  assert.deepEqual((await read(new URLSearchParams({ search: value, pageSize: 'all' }))).characters, filterCharacters(all.characters, value, {}));
}
const owner = all.filterOptions.PROPIETARIO.at(-1);
const filtered = await read(new URLSearchParams({ owner, pageSize: 'all' }));
assert.deepEqual(filtered.characters, all.characters.filter(row => row.PROPIETARIO === owner));
assert.deepEqual(filtered.filterOptions, first.filterOptions);
assert.deepEqual(filtered.editOptions, first.editOptions);
const none = await read('search=xxxxxxxxxxxxxxxxxxxx');
assert.equal(none.pagination.totalPages, 0);
assert.equal(none.pagination.page, 1);
assert.equal(none.characters.length, 0);
const last = await read('page=999&pageSize=50');
assert.equal(last.pagination.page, first.pagination.totalPages);
const missing = '00000000-0000-4000-8000-000000000099';
const ids = await read(`ids=${target.id},${missing}`);
assert.deepEqual(ids.characters, [target]);
assert.deepEqual(ids.missingIds, [missing]);
for (const params of ['page=0', 'pageSize=21', 'sort=version', 'direction=up', 'foo=1', 'page=1&page=2', 'ids=bad', `ids=${target.id}&page=1`, `ids=${target.id},${target.id}`]) assert.equal((await fetch(`${base}/api/characters?${params}`)).status, 400);
console.log('Paginación API: tamaños, orden global, filtros, Unicode, literales, totales y UUID pasan.');
