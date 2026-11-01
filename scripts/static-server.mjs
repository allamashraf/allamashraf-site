// Minimal static server that behaves like GitHub Pages for tests:
// /path/ -> path/index.html, unknown paths -> 404.html with HTTP 404, no custom headers.
// Usage: node scripts/static-server.mjs <dir> <port>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const [dirArg = 'dist', portArg = '4400'] = process.argv.slice(2);
const root = resolve(dirArg);
const port = Number(portArg);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([\\/])+/, '');
  const target = join(root, clean);
  if (target !== root && !target.startsWith(root + sep)) return null;
  try {
    const s = await stat(target);
    if (s.isDirectory()) {
      const index = join(target, 'index.html');
      await stat(index);
      return index;
    }
    return target;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? '/');
  if (file) {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
    return;
  }
  res.writeHead(404, { 'content-type': TYPES['.html'] });
  res.end(await readFile(join(root, '404.html')).catch(() => 'Not found'));
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
