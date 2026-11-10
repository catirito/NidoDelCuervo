import { failure } from '../../../server/http.js';
import { writePets } from '../../../server/mascoteria-write.js';

export function onRequest(context) {
  if (context.request.method !== 'PATCH') return failure(405, 'METHOD', 'Método no permitido.');
  return writePets(context, false);
}
