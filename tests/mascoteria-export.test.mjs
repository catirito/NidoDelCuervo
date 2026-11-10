import assert from 'node:assert/strict';
import XLSX from '../vendor/xlsx.full.min.js';
import { createPetWorkbook } from '../export-excel.js';

const workbook = createPetWorkbook([
  { name: '=1+1', owners: [{ name: 'Kekai' }, { name: 'Francis "Chispas"' }], animal: 'Lagarta', location: 'Mascotería' },
  { name: 'Sin datos', owners: [], animal: '', location: '' }
], XLSX);
const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
const result = XLSX.read(buffer, { bookFiles: true });
assert.deepEqual(result.SheetNames, ['Mascotería']);
assert.deepEqual(XLSX.utils.sheet_to_json(result.Sheets.Mascotería, { header: 1, defval: '' }), [
  ['Nombre', 'Propietario', 'Animal', 'Ubicación'],
  ['=1+1', 'Kekai, Francis "Chispas"', 'Lagarta', 'Mascotería'],
  ['Sin datos', '', '', '']
]);
assert.equal(result.Sheets.Mascotería.A2.f, undefined);
assert.ok(result.keys.every(key => !/^xl\/(media|drawings)\//.test(key)));
assert.ok(Object.values(result.Sheets.Mascotería).every(cell => !cell.l));
console.log('Excel de Mascotería: cuatro campos, propietarios, valores vacíos y texto literal, sin medios ni enlaces.');
