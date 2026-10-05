import { serializeCharacter } from './characters.js';
import { fields } from '../records.js';
import { catalogStatements, catalogsFromResults } from './catalogs.js';
const categories = { class: 'CLASS', subclass: 'SUBCLASS', species: 'SPECIE', rank: 'RANGO', owner: 'PROPIETARIO' };
const sorts = ['NIVEL', ...Object.values(categories)];
const collator = new Intl.Collator('es', { sensitivity: 'variant', numeric: false });
const columns = ['id', ...fields, 'sourceRow', 'version', 'is_deleted'].join(', ');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function parseQuery(url) {
  const params = new URL(url).searchParams;
  const allowed = ['page', 'pageSize', 'search', 'sort', 'direction', 'ids', ...Object.keys(categories)];
  for (const key of params.keys()) if (!allowed.includes(key) || params.getAll(key).length !== 1) throw new Error('Parámetros de consulta inválidos.');
  if (params.has('ids')) {
    const ids = params.get('ids').split(',');
    if ([...params.keys()].length !== 1 || ids.length > 203 || ids.some(id => !uuid.test(id)) || new Set(ids).size !== ids.length) throw new Error('Lista de UUID inválida.');
    return { ids };
  }
  const page = params.get('page') ?? '1';
  const size = params.get('pageSize') ?? '50';
  const sort = params.get('sort') ?? 'NIVEL';
  const direction = params.get('direction') ?? 'desc';
  if (!/^[1-9][0-9]*$/.test(page) || !Number.isSafeInteger(Number(page)) || !['20', '50', '100', 'all'].includes(size) || !sorts.includes(sort) || !['asc', 'desc'].includes(direction)) throw new Error('Página, tamaño u orden inválidos.');
  const search = params.get('search') ?? '';
  if (search.length > 200) throw new Error('Búsqueda demasiado larga.');
  const filters = Object.fromEntries(Object.entries(categories).map(([key, field]) => [field, params.get(key) ?? '']));
  if (Object.values(filters).some(value => value.length > 200)) throw new Error('Filtro demasiado largo.');
  return { page: Number(page), size: size === 'all' ? 'all' : Number(size), sort, direction, search, filters };
}
function metadata(results) {
  const options = Object.fromEntries([...Object.values(categories), 'ESTADO'].map(field => [field, results.map(row => row[field]).filter(value => value != null && value !== '').filter((value, index, array) => array.indexOf(value) === index).sort(collator.compare)]));
  return { filterOptions: Object.fromEntries(Object.values(categories).map(field => [field, options[field]])), editOptions: { ESTADO: options.ESTADO, PROPIETARIO: options.PROPIETARIO } };
}
export async function queryCharacters(db, query, attempt = 0) {
  const readiness = await db.prepare("SELECT count(*) AS count FROM characters WHERE is_deleted = 0 AND name_search = '' AND PERSONAJE IS NOT NULL AND PERSONAJE != ''").first();
  if (readiness.count) throw new Error('Búsqueda pendiente de inicializar.');
  const globalSql = `SELECT DISTINCT CLASS, SUBCLASS, SPECIE, RANGO, PROPIETARIO, ESTADO FROM characters WHERE is_deleted = 0`;
  if (query.ids) {
    const results = await db.batch([db.prepare(`SELECT ${columns} FROM characters WHERE id IN (SELECT value FROM json_each(?)) ORDER BY sourceRow`).bind(JSON.stringify(query.ids)), db.prepare(globalSql), ...catalogStatements.map(sql => db.prepare(sql))]);
    return { characters: results[0].results.map(serializeCharacter), missingIds: query.ids.filter(id => !results[0].results.some(row => row.id === id)), ...metadata(results[1].results), catalogs: catalogsFromResults(results.slice(2)) };
  }
  const clauses = ['is_deleted = 0', 'instr(name_search, ?1) > 0'];
  const values = [query.search.toLocaleLowerCase('es')];
  for (const [field, value] of Object.entries(query.filters)) if (value) { values.push(value); clauses.push(`${field} = ?${values.length}`); }
  const where = clauses.join(' AND ');
  const preliminary = query.sort === 'NIVEL' ? [] : (await db.prepare(`SELECT DISTINCT ${query.sort} AS value FROM characters WHERE is_deleted = 0 AND ${query.sort} IS NOT NULL AND ${query.sort} != ''`).all()).results.map(row => row.value).sort(collator.compare);
  const ranks = preliminary.map((value, index) => ({ value, index }));
  const orderValues = [...values];
  let order = query.sort;
  if (query.sort !== 'NIVEL') {
    orderValues.push(JSON.stringify(ranks));
    order = `(SELECT json_extract(value, '$.index') FROM json_each(?${orderValues.length}) WHERE json_extract(value, '$.value') = characters.${query.sort})`;
  }
  const missing = `(${query.sort} IS NULL OR ${query.sort} = '') ASC`;
  const effective = `CASE WHEN totalMatches = 0 THEN 1 ELSE min(${query.page}, max(1, (totalMatches + ${query.size === 'all' ? 'totalMatches' : query.size} - 1) / max(1, ${query.size === 'all' ? 'totalMatches' : query.size}))) END`;
  const counts = `SELECT (SELECT count(*) FROM characters WHERE ${where}) AS totalMatches, (SELECT count(*) FROM characters WHERE is_deleted = 0) AS totalRecords`;
  const pageSql = `WITH totals AS (${counts}), paging AS (SELECT *, ${effective} AS page FROM totals) SELECT ${columns} FROM characters WHERE ${where} ORDER BY ${missing}, ${order} ${query.direction.toUpperCase()}, sourceRow ASC ${query.size === 'all' ? '' : `LIMIT ${query.size} OFFSET ((SELECT page FROM paging) - 1) * ${query.size}`}`;
  const results = await db.batch([db.prepare(pageSql).bind(...orderValues), db.prepare(`WITH totals AS (${counts}) SELECT *, ${effective} AS page FROM totals`).bind(...values), db.prepare(globalSql), ...catalogStatements.map(sql => db.prepare(sql))]);
  if (query.sort !== 'NIVEL') {
    const actual = metadata(results[2].results).filterOptions[query.sort];
    if (JSON.stringify(actual) !== JSON.stringify(preliminary)) {
      if (attempt >= 2) throw new Error('Opciones cambiadas durante consulta.');
      return queryCharacters(db, query, attempt + 1);
    }
  }
  const pagination = results[1].results[0];
  pagination.pageSize = query.size;
  pagination.totalPages = query.size === 'all' ? (pagination.totalMatches ? 1 : 0) : Math.ceil(pagination.totalMatches / query.size);
  return { characters: results[0].results.map(serializeCharacter), pagination, ...metadata(results[2].results), catalogs: catalogsFromResults(results.slice(3)) };
}
