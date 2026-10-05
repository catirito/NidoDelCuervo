import { catalogKey, catalogName } from '../catalog-values.js';
export const catalogStatements = [
  'SELECT id, name, name_key AS nameKey FROM classes ORDER BY name_key',
  'SELECT id, class_id AS classId, name, name_key AS nameKey FROM subclasses ORDER BY class_id, name_key',
  'SELECT id, name, name_key AS nameKey FROM species ORDER BY name_key'
];
export function catalogsFromResults(results) {
  return { classes: results[0].results, subclasses: results[1].results, species: results[2].results };
}
export async function readCatalogs(db) {
  return catalogsFromResults(await db.batch(catalogStatements.map(sql => db.prepare(sql))));
}
export function prepareCatalogChanges(changes, additions, catalogs, characters) {
  const wanted = { classes: [], subclasses: [], species: [] };
  if (additions !== undefined && (!additions || typeof additions !== 'object' || Array.isArray(additions) || Object.keys(additions).some(key => !Object.hasOwn(wanted, key)))) throw new Error('Altas de catálogo inválidas.');
  for (const field of ['classes', 'species']) {
    const names = additions?.[field] ?? [];
    if (!Array.isArray(names) || names.length > 203) throw new Error('Altas de catálogo inválidas.');
    const seen = new Set();
    for (const raw of names) {
      const name = catalogName(raw);
      const nameKey = catalogKey(name);
      if (!seen.has(nameKey) && !catalogs[field].some(item => item.nameKey === nameKey)) wanted[field].push({ id: crypto.randomUUID(), name, nameKey });
      seen.add(nameKey);
    }
  }
  const subnames = additions?.subclasses ?? [];
  if (!Array.isArray(subnames) || subnames.length > 203) throw new Error('Altas de subclase inválidas.');
  const classes = [...catalogs.classes, ...wanted.classes];
  for (const option of subnames) {
    if (!option || Object.keys(option).sort().join(',') !== 'className,name') throw new Error('Alta de subclase inválida.');
    const classKey = catalogKey(catalogName(option.className));
    const parent = classes.find(item => item.nameKey === classKey);
    if (!parent) throw new RangeError('La subclase nueva requiere una clase válida.');
    const name = catalogName(option.name);
    const nameKey = catalogKey(name);
    if (![...catalogs.subclasses, ...wanted.subclasses].some(item => item.classId === parent.id && item.nameKey === nameKey)) wanted.subclasses.push({ id: crypto.randomUUID(), classId: parent.id, classKey, name, nameKey });
  }
  const used = { classes: new Set(), subclasses: new Set(), species: new Set() };
  for (const change of changes) {
    const original = characters.find(character => character.id === change.id);
    if (!original) continue;
    const effective = { ...original, ...change.fields };
    if (Object.hasOwn(change.fields, 'CLASS') || Object.hasOwn(change.fields, 'SUBCLASS')) {
      const parent = effective.CLASS === null ? null : classes.find(item => item.nameKey === catalogKey(effective.CLASS));
      if (effective.CLASS !== null && !parent) throw new RangeError('La clase no existe; declárala como opción nueva.');
      const child = effective.SUBCLASS === null ? null : [...catalogs.subclasses, ...wanted.subclasses].find(item => item.classId === parent?.id && item.nameKey === catalogKey(effective.SUBCLASS));
      if (effective.SUBCLASS !== null && !child) throw new RangeError('La subclase no pertenece a la clase seleccionada.');
      change.fields._classKey = parent?.nameKey ?? null;
      if (Object.hasOwn(change.fields, 'SUBCLASS')) change.fields._subclassKey = child?.nameKey ?? null;
      if (Object.hasOwn(change.fields, 'CLASS')) change.fields.CLASS = parent?.name ?? null;
      if (Object.hasOwn(change.fields, 'SUBCLASS')) change.fields.SUBCLASS = child?.name ?? null;
      if (parent) used.classes.add(parent.nameKey);
      if (child) used.subclasses.add(`${parent.nameKey}|${child.nameKey}`);
    }
    if (Object.hasOwn(change.fields, 'SPECIE') && change.fields.SPECIE !== null) {
      const species = [...catalogs.species, ...wanted.species].find(item => item.nameKey === catalogKey(change.fields.SPECIE));
      if (!species) throw new RangeError('La especie no existe; declárala como opción nueva.');
      change.fields.SPECIE = species.name;
      change.fields._speciesKey = species.nameKey;
      used.species.add(species.nameKey);
    }
  }
  if (wanted.classes.some(item => !used.classes.has(item.nameKey)) || wanted.subclasses.some(item => !used.subclasses.has(`${item.classKey}|${item.nameKey}`)) || wanted.species.some(item => !used.species.has(item.nameKey))) throw new RangeError('No se pueden crear opciones sin usarlas en el lote.');
  return wanted;
}
const versionGuard = `(SELECT count(*) FROM json_each(?1) AS incoming JOIN characters ON characters.id = json_extract(incoming.value, '$.id') AND characters.version = json_extract(incoming.value, '$.expectedVersion') AND characters.is_deleted = 0) = json_array_length(?1)`;
export function catalogWrites(db, additions, changes) {
  const writes = [];
  const payload = JSON.stringify(changes ?? []);
  const guard = changes ? versionGuard : '1 = 1';
  for (const [table, options] of [['classes', additions.classes], ['species', additions.species]]) {
    if (options.length) writes.push(db.prepare(`INSERT INTO ${table} (id, name, name_key) SELECT json_extract(value, '$.id'), json_extract(value, '$.name'), json_extract(value, '$.nameKey') FROM json_each(?2) WHERE ${guard} ON CONFLICT(name_key) DO NOTHING`).bind(payload, JSON.stringify(options)));
  }
  if (additions.subclasses.length) writes.push(db.prepare(`INSERT INTO subclasses (id, class_id, name, name_key) SELECT json_extract(value, '$.id'), (SELECT id FROM classes WHERE name_key = json_extract(value, '$.classKey')), json_extract(value, '$.name'), json_extract(value, '$.nameKey') FROM json_each(?2) WHERE ${guard} ON CONFLICT(class_id, name_key) DO NOTHING`).bind(payload, JSON.stringify(additions.subclasses)));
  return writes;
}
