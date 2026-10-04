export function jsonResponse(value, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } });
}
export function failure(status, code, message, details = {}) {
  return jsonResponse({ error: { code, message, ...details } }, status);
}
export async function readJson(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new Error('Formato JSON requerido.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Petición vacía.');
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 3145728) { await reader.cancel(); throw new RangeError('El lote supera 3 MiB; guarda menos personajes a la vez.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
