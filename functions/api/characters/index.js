import { catalogStatements, catalogsFromResults } from '../../../server/catalogs.js';
import { jsonResponse, failure } from '../../../server/http.js';
export async function onRequest(context) {
  if (context.request.method !== 'GET') return failure(405, 'METHOD', 'Método no permitido.');
  try {
    const results = await context.env.DB.batch([context.env.DB.prepare('SELECT * FROM characters ORDER BY sourceRow'), ...catalogStatements.map(sql => context.env.DB.prepare(sql))]);
    return jsonResponse({ characters: results[0].results, catalogs: catalogsFromResults(results.slice(1)) });
  } catch { return failure(503, 'SERVICE', 'El registro no está disponible. Vuelve a intentarlo.'); }
}
