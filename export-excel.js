import { fields } from './records.js';

const headers = ['Personaje', 'Clase', 'Subclase', 'Especie', 'Nivel', 'Rango', 'Estado', 'Propietario', 'Notas'];

export function createCharacterWorkbook(characters, xlsx) {
  const rows = [headers, ...characters.map(character => fields.map(field => {
    const value = character[field];
    if (value == null || value === '') return null;
    return field === 'NIVEL' ? { t: 'n', v: value } : { t: 's', v: String(value) };
  }))];
  const sheet = xlsx.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [28, 20, 24, 24, 8, 22, 18, 22, 48].map(wch => ({ wch }));
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, 'Personajes');
  return workbook;
}

export function exportFilename(date = new Date()) {
  const parts = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')];
  return `nido-del-cuervo-personajes-${parts.join('-')}.xlsx`;
}

export function downloadCharacters(characters, xlsx) {
  if (!xlsx) throw new Error('La biblioteca de Excel no está disponible.');
  xlsx.writeFile(createCharacterWorkbook(characters, xlsx), exportFilename(), { bookType: 'xlsx' });
}
