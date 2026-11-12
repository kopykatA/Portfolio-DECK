/* Portfolio DECK — local server: serves /web, persists user_data/, and proxies market-data APIs (no CORS, keeps keys local). */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, 'web');
const DATA_DIR = process.env.PORTFOLIO_DATA_DIR || path.join(__dirname, 'user_data');
const PORT = Number(process.env.PORT) || 4173;
const UP = {
  cg: 'https://api.coingecko.com/api',
  yf: 'https://query1.finance.yahoo.com',
  cmc: 'https://pro-api.coinmarketcap.com',
  av: 'https://www.alphavantage.co',
  fh: 'https://finnhub.io/api/v1',
};
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon' };

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}
function readDataFile(name, fallback) {
  try {
    const p = path.join(DATA_DIR, name);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return fallback; }
}
function writeDataFile(name, data) {
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data, null, 2), 'utf8');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 5e6) reject(new Error('Payload too large')); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

async function proxy(req, res, kind, rest) {
  const headers = { 'accept': 'application/json', 'user-agent': 'Mozilla/5.0 PortfolioDeck/1.0' };
  let target = UP[kind] + rest;
  if (kind === 'cmc') {
    const key = req.headers['x-cmc-key'];
    if (!key) { res.writeHead(401, {'content-type':'application/json'}); return res.end('{"error":"missing CoinMarketCap key"}'); }
    headers['X-CMC_PRO_API_KEY'] = String(key);
  } else if (kind === 'fh') {
    const key = req.headers['x-api-key'];
    if (key) headers['X-Finnhub-Token'] = String(key);
  } else if (kind === 'av') {
    const key = req.headers['x-api-key'];
    if (key) target += (target.includes('?') ? '&' : '?') + 'apikey=' + encodeURIComponent(String(key));
  }
  try {
    const r = await fetch(target, { headers });
    const body = Buffer.from(await r.arrayBuffer());
    res.writeHead(r.status, { 'content-type': r.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' });
    res.end(body);
  } catch (e) {
    res.writeHead(502, {'content-type':'application/json'});
    res.end(JSON.stringify({ error: String(e.message || e) }));
  }
}

http.createServer(async (req, res) => {
  const url = req.url || '/';
  if (url === '/api/ping') { res.writeHead(200, {'content-type':'application/json'}); return res.end('{"ok":true}'); }
  if (url === '/api/events') { res.writeHead(200, {'content-type':'text/event-stream','cache-control':'no-cache'}); return res.write(':ok\n\n'); }
  if (url === '/api/data') {
    if (req.method === 'GET') {
      const payload = {
        assets: readDataFile('portfolio.json', []),
        watch: readDataFile('watchlist.json', []),
        cfg: readDataFile('settings.json', { cmcKey: '', apis: [], theme: 'dark' }),
      };
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(JSON.stringify(payload));
    }
    if (req.method === 'POST') {
      try {
        const body = await readBody(req);
        if (Array.isArray(body.assets)) writeDataFile('portfolio.json', body.assets);
        if (Array.isArray(body.watch)) writeDataFile('watchlist.json', body.watch);
        if (body.cfg && typeof body.cfg === 'object') writeDataFile('settings.json', body.cfg);
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(400, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ error: String(e.message || e) }));
      }
    }
  }
  const m = url.match(/^\/api\/(cg|yf|cmc|av|fh)(\/.*)$/);
  if (m) return proxy(req, res, m[1], m[2]);
  let p = decodeURIComponent(url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log('Portfolio DECK on http://localhost:' + PORT + ' (data: ' + DATA_DIR + ')'));
