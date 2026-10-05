import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const recordsSource = fs.readFileSync('records.js', 'utf8');
const recordsUrl = `data:text/javascript;base64,${Buffer.from(recordsSource).toString('base64')}`;
const { fields, readCharacters, sortCharacters } = await import(recordsUrl);
const exportSource = fs.readFileSync('export-excel.js', 'utf8').replace('./records.js', recordsUrl);
const { createCharacterWorkbook, exportFilename } = await import(`data:text/javascript;base64,${Buffer.from(exportSource).toString('base64')}`);
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync('vendor/xlsx.full.min.js', 'utf8'), context);
const xlsx = context.XLSX;
const characters = readCharacters(xlsx.read(fs.readFileSync('Registro de personajes.xlsx'), { type: 'buffer' }), xlsx);
const specials = ['=SUM(A1:A2)', '+1', '-1', '@nombre', 'Ágios\nsegunda línea'];
const fixture = specials.map((text, index) => ({ ...characters[index], PERSONAJE: text, NOTAS: text, CLASS: null, NIVEL: index + 1, id: 'private', version: 9 }));
const sorted = sortCharacters([...characters, ...fixture], 'NIVEL', 'ascending');
const bytes = xlsx.write(createCharacterWorkbook(sorted, xlsx), { type: 'buffer', bookType: 'xlsx' });
const workbook = xlsx.read(bytes, { type: 'buffer' });
assert.deepEqual(Array.from(workbook.SheetNames), ['Personajes']);
const sheet = workbook.Sheets.Personajes;
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
assert.deepEqual(Array.from(rows[0]), ['Personaje', 'Clase', 'Subclase', 'Especie', 'Nivel', 'Rango', 'Estado', 'Propietario', 'Notas']);
assert.equal(rows.length, sorted.length + 1);
for (let index = 0; index < sorted.length; index++) {
  fields.forEach((field, column) => {
    const cell = sheet[xlsx.utils.encode_cell({ r: index + 1, c: column })];
    const value = sorted[index][field];
    assert.equal(rows[index + 1][column], value == null || value === '' ? null : value);
    assert.equal(cell?.f, undefined);
    if (value != null && value !== '') assert.equal(cell.t, field === 'NIVEL' ? 'n' : 's');
  });
}
assert.equal(rows[0].length, 9);
assert.equal(exportFilename(new Date(2026, 9, 5)), 'nido-del-cuervo-personajes-2026-10-05.xlsx');
assert.equal(createCharacterWorkbook([], xlsx).SheetNames.length, 1);
console.log(`Export XLSX verified: ${sorted.length} rows, types, literal text, blanks and headers.`);
