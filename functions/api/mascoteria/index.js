import { failure, jsonResponse } from '../../../server/http.js';
import { queryPets } from '../../../server/mascoteria-query.js';
import { writePets } from '../../../server/mascoteria-write.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'POST') return writePets(context, true);
  if (request.method !== 'GET') return failure(405, 'METHOD', 'Método no permitido.');
  try {
    return jsonResponse(await queryPets(env.DB, new URL(request.url).searchParams));
  } catch (error) {
    if (error instanceof RangeError) return failure(400, 'QUERY', error.message);
    return failure(503, 'SERVICE', 'La Mascotería no está disponible. Vuelve a intentarlo.');
  }
}
