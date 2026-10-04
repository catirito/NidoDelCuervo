import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = require(process.env.MINIFLARE_MODULE || 'miniflare');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'nido-search-'));
const runtime = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default {}', d1Databases: { DB: 'test-search-initialization' } }));
try {
  const db = await runtime.getD1Database('DB');
  await db.prepare("CREATE TABLE characters (id TEXT PRIMARY KEY, PERSONAJE TEXT, version INTEGER, name_search TEXT NOT NULL DEFAULT '')").run();
  const records = [{ id: 'a', PERSONAJE: 'ÁGIos', version: 7 }, { id: 'b', PERSONAJE: 'ÑANDÚ', version: 12 }];
  for (const row of records) await db.prepare('INSERT INTO characters (id, PERSONAJE, version) VALUES (?, ?, ?)').bind(row.id, row.PERSONAJE, row.version).run();
  await fs.writeFile(path.join(temp, 'source.json'), JSON.stringify({ characters: records }));
  execFileSync(process.execPath, ['scripts/initialize-search.mjs', path.join(temp, 'source.json'), path.join(temp, 'init.sql')]);
  const sql = await fs.readFile(path.join(temp, 'init.sql'), 'utf8');
  const statements = sql.trim().split('\n').map(line => db.prepare(line));
  await db.batch(statements);
  const result = (await db.prepare('SELECT * FROM characters ORDER BY id').all()).results;
  assert.deepEqual(result, records.map(row => ({ ...row, name_search: row.PERSONAJE.toLocaleLowerCase('es') })));
  await db.prepare("UPDATE characters SET PERSONAJE = 'Nuevo', version = 13, name_search = 'nuevo' WHERE id = 'b'").run();
  await assert.rejects(db.batch(statements));
  assert.equal((await db.prepare("SELECT name_search FROM characters WHERE id = 'b'").first()).name_search, 'nuevo');
  assert.equal((await db.prepare("SELECT count(*) AS count FROM sqlite_master WHERE name = 'search_initialization_guard'").first()).count, 0);
  console.log('Inicialización: Unicode, identidades/versiones intactas y rollback con snapshot obsoleto comprobados en D1 aislada.');
} finally { await runtime.dispose(); await fs.rm(temp, { recursive: true, force: true }); }
