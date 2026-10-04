import { jsonResponse, failure } from '../../../server/http.js';
export async function onRequest(context) {
  if (context.request.method !== 'GET') return failure(405, 'METHOD', 'Método no permitido.');
  try {
    const { results } = await context.env.DB.prepare('SELECT * FROM characters ORDER BY sourceRow').all();
    return jsonResponse({ characters: results });
  } catch { return failure(503, 'SERVICE', 'El registro no está disponible. Vuelve a intentarlo.'); }
}
