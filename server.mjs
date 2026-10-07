import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.fbx':'application/octet-stream','.mp4':'video/mp4'};
createServer(async (req,res)=>{
  try {
    const requested = decodeURIComponent((req.url || '/').split('?')[0]);
    const safe = normalize(requested === '/' ? '/index.html' : requested).replace(/^([.][.][\\/])+/, '');
    const file = join(root, safe);
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream'}); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(8000, '0.0.0.0', ()=>console.log('Paceboard running at http://localhost:8000/index.html'));
