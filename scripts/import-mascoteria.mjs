import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import XLSX from '../vendor/xlsx.full.min.js';

const sourceId = '012-La-Mascoteria';
const equivalences = new Map(Object.entries({
  Alonso: 'Alonso Fernandez',
  Azura: 'Azura Vylara',
  Cándido: 'Cándido Fairyring',
  Chispas: 'Francis "Chispas"',
  Eldra: 'Eldra González',
  'Fayl´en': "Fayl'en Estela Brillante",
  Fungencio: 'Fungencio Pensativus',
  'Gr-00-T': 'Stroheim Gr00t',
  Groot: 'Stroheim Gr00t',
  Hopper: 'Harrison Hopper',
  Kyu: 'Kyū Taigen',
  Plumas: 'Plumas/Nevi',
  'Regor (pastor)': 'Regor',
  Sam: 'Samael',
  Thaldis: 'Thaldris Zirthalon'
}));
const groups = [
  { location: 'Mascotería', first: 3, last: 14, columns: [0, 5] },
  { location: 'Fuera del gremio', first: 3, last: 14, columns: [10] },
  { location: 'Establos', first: 3, last: 14, columns: [15] },
  { location: '', first: 18, last: 34, columns: [0, 5, 10] }
];
const normalize = name => name.normalize('NFC').trim().replace(/\s+/gu, ' ').toLowerCase();

export async function readPetSource(file) {
  const { Sheets } = XLSX.read(await fs.readFile(file), { cellHTML: false, cellFormula: false });
  const sheet = Sheets.Hoja1;
  if (!sheet) throw new Error('El libro no contiene Hoja1.');
  const text = (row, column) => String(sheet[XLSX.utils.encode_cell({ r: row - 1, c: column })]?.v ?? '').trim();
  const exclusions = [];
  const entries = [];
  const corrections = [];
  for (const { first, last, location, columns } of groups) {
    for (let row = first; row <= last; row++) {
      for (const column of columns) {
        const cell = XLSX.utils.encode_cell({ r: row - 1, c: column });
        const name = text(row, column);
        const rawOwner = text(row, column + 1);
        const animal = location === 'Establos' ? '' : text(row, column + 2);
        if (!name && !rawOwner && !animal) continue;
        if (!name) {
          exclusions.push({ cell, reason: 'Entrada sin nombre' });
          continue;
        }
        const owners = !rawOwner || rawOwner === 'Nido' ? [] :
          rawOwner.split(/,\s*(?:y\s+)?/u).map(owner => equivalences.get(owner) ?? owner);
        if (rawOwner !== owners.join(', ')) {
          const reason = rawOwner === 'Nido' ? 'Titularidad del Nido sin personaje' : 'Equivalencia o titularidad múltiple confirmada';
          corrections.push({ cell, from: rawOwner, to: owners, reason });
        }
        entries.push({ cell, name, animal, location, owners });
      }
    }
  }
  if (text(18, 18)) exclusions.push({ cell: 'S18', reason: 'Nota fuera de la tabla' });
  return { entries, exclusions, corrections };
}

export function planPetImport(source, characters) {
  const issues = [];
  const pets = source.entries.map(({ owners, ...pet }) => {
    const ownerIds = owners.flatMap(owner => {
      const matches = characters.filter(character => normalize(character.name) === normalize(owner));
      if (matches.length === 1) return [matches[0].id];
      issues.push({ cell: pet.cell, owner, matches: matches.length });
      return [];
    });
    return { ...pet, ownerIds: [...new Set(ownerIds)] };
  });
  return { ...source, pets, issues };
}

export async function applyPetImport(db, plan) {
  const imported = () => db.prepare('SELECT id FROM pet_imports WHERE id = ?').bind(sourceId).first();
  if (await imported()) return false;
  if (plan.issues.length || plan.pets.length !== 55) throw new Error('La importación contiene discrepancias.');
  const payload = JSON.stringify(plan.pets.map(pet => ({ ...pet, id: randomUUID() })));
  try {
    await db.batch([
      db.prepare('INSERT INTO pet_imports (id) VALUES (?)').bind(sourceId),
      db.prepare(`INSERT INTO pet_write_guard (current_versions, valid_owners)
        SELECT 1, NOT EXISTS (
          SELECT 1 FROM json_each(?) p, json_each(p.value, '$.ownerIds') owner
          WHERE NOT EXISTS (SELECT 1 FROM characters WHERE id = owner.value AND is_deleted = 0)
        )`).bind(payload),
      db.prepare(`INSERT INTO pets (id, source_cell, name, animal, location)
        SELECT json_extract(value, '$.id'), json_extract(value, '$.cell'), json_extract(value, '$.name'),
          json_extract(value, '$.animal'), json_extract(value, '$.location') FROM json_each(?)`).bind(payload),
      db.prepare(`INSERT INTO pet_owners (pet_id, character_id)
        SELECT json_extract(p.value, '$.id'), owner.value FROM json_each(?) p, json_each(p.value, '$.ownerIds') owner`).bind(payload),
      db.prepare('DELETE FROM pet_write_guard')
    ]);
  } catch (error) {
    if (await imported()) return false;
    throw error;
  }
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--apply') || args.length > 1) throw new Error('Uso: node scripts/import-mascoteria.mjs [--apply]');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const source = await readPetSource(path.join(root, '.local/imports/012-mascoteria/La-Mascoteria.xlsx'));
  const config = JSON.parse(await fs.readFile(path.join(root, 'wrangler.jsonc'), 'utf8'));
  const local = config.d1_databases.find(database => database.binding === 'DB' && database.remote === false);
  if (!local) throw new Error('Falta una configuración explícita de D1 local.');
  const require = createRequire(import.meta.url);
  const { Miniflare, convertV4MiniflareOptions } = require(process.env.MINIFLARE_MODULE || 'miniflare');
  const runtime = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    script: 'export default {}',
    resourcePersistencePath: path.join(root, '.wrangler/state/v3'),
    d1Databases: { DB: local.database_id }
  }));
  try {
    const db = await runtime.getD1Database('DB');
    const { results } = await db.prepare("SELECT id, PERSONAJE AS name FROM characters WHERE is_deleted = 0 AND trim(PERSONAJE) <> ''").all();
    const plan = planPetImport(source, results);
    console.log(JSON.stringify({
      total: plan.pets.length,
      locations: Object.fromEntries(groups.map(({ location }) => [location, plan.pets.filter(pet => pet.location === location).length])),
      withoutOwner: plan.pets.filter(pet => !pet.ownerIds.length).map(pet => pet.cell),
      tinkaOwners: plan.pets.find(pet => pet.cell === 'K10')?.ownerIds.map(id => results.find(owner => owner.id === id).name),
      exclusions: plan.exclusions,
      corrections: plan.corrections,
      issues: plan.issues
    }, null, 2));
    if (args.includes('--apply')) console.log(await applyPetImport(db, plan) ? 'Importación aplicada.' : 'La importación ya estaba aplicada.');
    else if (plan.issues.length || plan.pets.length !== 55) process.exitCode = 1;
  } finally {
    await runtime.dispose();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
