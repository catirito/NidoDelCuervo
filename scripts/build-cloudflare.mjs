import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const source = fileURLToPath(new URL('../', import.meta.url));
const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(source, '.local/public');
if (output !== path.join(source, '.local/public') && (output === source || source.startsWith(output + path.sep) || output.startsWith(source + path.sep))) throw new Error('La salida personalizada debe estar fuera del proyecto.');
if (process.argv[2] && await fs.stat(output).then(() => true, () => false)) throw new Error('La salida personalizada debe ser una carpeta nueva.');
const files = ['index.html', 'styles.css', 'app.js', 'export-excel.js', 'vendor/xlsx.full.min.js', 'vendor/LICENSE', 'editing.js', 'character-controls.js', 'create-character.js', 'character-fields.js', 'catalog-values.js', 'rank.js', 'records.js', 'theme.js', 'robots.txt', '_headers', 'assets/logo-cuervo.png', 'assets/fonts/cinzel.ttf', 'assets/fonts/roboto-flex.ttf', 'assets/fonts/cinzel-OFL.txt', 'assets/fonts/roboto-flex-OFL.txt'];
if (!process.argv[2]) await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
for (const file of files) {
  await fs.mkdir(path.dirname(path.join(output, file)), { recursive: true });
  await fs.copyFile(path.join(source, file), path.join(output, file));
}
await fs.writeFile(path.join(output, '404.html'), '<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><title>Página no encontrada</title></head><body><h1>Página no encontrada</h1><a href="/">Volver al registro</a></body></html>\n');
await fs.writeFile(path.join(output, '_routes.json'), JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }));
console.log(JSON.stringify({ output, publishedFiles: [...files, '404.html', '_routes.json'] }));
