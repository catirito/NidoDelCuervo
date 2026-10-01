import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const source = fs.readFileSync(new URL('../records.js', import.meta.url), 'utf8');
const { readCharacters, fields, filterFields, filterCharacters, sortCharacters, categoryValues } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../vendor/xlsx.full.min.js', import.meta.url), 'utf8'), context);
const xlsx = context.XLSX;
const bytes = fs.readFileSync(new URL('../Registro de personajes.xlsx', import.meta.url));
assert.equal(xlsx.version, '0.20.3');
assert.equal(createHash('sha256').update(bytes).digest('hex'), '8ca0c7869c145d556ec22d40554c55fe5b3236a86452d65668c7b43a0bce528f');
const workbook = xlsx.read(bytes, { type: 'buffer' });
const records = readCharacters(workbook, xlsx);
assert.equal(records.length, 203);
const sheet = workbook.Sheets['Nido del Cuervo'];
for (const record of records) {
  fields.forEach((field, column) => {
    const address = xlsx.utils.encode_cell({ r: record.sourceRow - 1, c: column });
    assert.equal(record[field], sheet[address]?.v ?? null, `${field}, fila ${record.sourceRow}`);
  });
}
const blanks = Object.fromEntries(fields.map(field => [field, records.filter(record => record[field] == null || record[field] === '').length]));
assert.equal(blanks.CLASS, 2);
assert.equal(blanks.SUBCLASS, 38);
assert.equal(blanks.ESTADO, 188);
assert.equal(blanks.NOTAS, 190);
assert.equal(new Set(records.map(record => record.PERSONAJE)).size, 201);
assert.equal(records.filter(record => sheet[`F${record.sourceRow}`]?.f).length, 199);
for (const row of [133, 162, 168, 193]) assert.equal(records.find(record => record.sourceRow === row).RANGO, sheet[`F${row}`].v);
const ordered = sortCharacters(records);
for (let index = 1; index < ordered.length; index++) {
  assert(ordered[index - 1].NIVEL >= ordered[index].NIVEL);
  if (ordered[index - 1].NIVEL === ordered[index].NIVEL) assert(ordered[index - 1].sourceRow < ordered[index].sourceRow);
}
for (const record of records) {
  const name = record.PERSONAJE;
  for (const query of [name.slice(0, 1), name.slice(1, 4), name.slice(-3), name.toUpperCase()]) {
    assert(filterCharacters(records, query, {}).some(result => result.sourceRow === record.sourceRow));
  }
}
const example = records.find(record => filterFields.every(field => record[field]));
const categories = Object.fromEntries(filterFields.map(field => [field, example[field]]));
const combined = filterCharacters(records, example.PERSONAJE.slice(1, 4), categories);
assert(combined.length > 0);
assert(combined.every(record => filterFields.every(field => record[field] === categories[field])));
assert.equal(filterCharacters(records, '␀sin coincidencias␀', {}).length, 0);
assert.equal(filterCharacters(records, '', categories).length, records.filter(record => filterFields.every(field => record[field] === categories[field])).length);
for (const field of filterFields) {
  assert.equal(categoryValues(records, field).length, new Set(records.map(record => record[field]).filter(value => value != null && value !== '').map(String)).size);
  for (const direction of ['ascending', 'descending']) {
    const sorted = sortCharacters(records, field, direction);
    const firstBlank = sorted.findIndex(record => record[field] == null);
    if (firstBlank !== -1) assert(sorted.slice(firstBlank).every(record => record[field] == null));
  }
}
assert.throws(() => readCharacters({ Sheets: {} }, xlsx), /hoja/);
assert.throws(() => readCharacters({ Sheets: { 'Nido del Cuervo': xlsx.utils.aoa_to_sheet([['Encabezado incorrecto']]) } }, xlsx), /encabezados/);
assert.equal(records[0].sourceRow, 2);
console.log('Correcto: 203 registros, nueve campos, vacíos, fórmulas guardadas, orden estable, búsquedas y filtros AND, errores de esquema y hash del Excel.');
