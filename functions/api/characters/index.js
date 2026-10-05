import { parseQuery, queryCharacters } from '../../../server/query.js';
import { jsonResponse, failure } from '../../../server/http.js';
export async function onRequest(context) {
  if (context.request.method !== 'GET') return failure(405, 'METHOD', 'Método no permitido.');
  let query;
  try { query = parseQuery(context.request.url); } catch (error) { return failure(400, 'QUERY', error.message); }
  try { return jsonResponse(await queryCharacters(context.env.DB, query)); }
  catch { return failure(503, 'SERVICE', 'El registro no está disponible. Vuelve a intentarlo.'); }
}
