const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

const PORT = 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function send(res, statusCode, content, contentType = 'application/json; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
  res.end(content);
}

function sendJson(res, statusCode, data) {
  send(res, statusCode, JSON.stringify(data), 'application/json; charset=utf-8');
}

function sanitizePath(requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const safePath = path.posix.normalize(decoded).replace(/^(\.\.\/)+/, '');
  return safePath;
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1000000) {
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, '', 'application/json; charset=utf-8');
    return;
  }

  const url = parse(req.url, true);
  const pathname = sanitizePath(url.pathname);

  if (pathname === '/api/products') {
    if (req.method === 'GET') {
      const products = readJsonFile(PRODUCTS_FILE);
      sendJson(res, 200, products);
      return;
    }
  }

  if (pathname === '/api/orders') {
    if (req.method === 'GET') {
      const orders = readJsonFile(ORDERS_FILE);
      sendJson(res, 200, orders);
      return;
    }

    if (req.method === 'POST') {
      try {
        const body = await collectBody(req);
        const submittedOrder = JSON.parse(body);
        const products = readJsonFile(PRODUCTS_FILE);
        const items = Array.isArray(submittedOrder.items) ? submittedOrder.items.map(item => {
          const selectedProduct = products.find(product => product.id === Number(item.productId));
          const quantity = Number(item.quantity);
          if (!selectedProduct || !Number.isInteger(quantity) || quantity < 1) throw new Error('Invalid product');
          return {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            image: selectedProduct.image,
            price: Number(selectedProduct.price),
            quantity,
            lineTotal: Number(selectedProduct.price) * quantity
          };
        }) : [];
        if (!items.length) throw new Error('Order has no products');
        const order = { ...submittedOrder, items };
        const orders = readJsonFile(ORDERS_FILE);
        order.id = order.id || `GG${Date.now().toString().slice(-6)}`;
        order.date = order.date || new Date().toLocaleDateString();
        order.status = order.status || 'Pending';
        order.subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
        order.total = order.subtotal + 50;
        orders.push(order);
        writeJsonFile(ORDERS_FILE, orders);
        sendJson(res, 201, { success: true, order });
      } catch (error) {
        sendJson(res, 400, { success: false, message: 'Invalid order payload' });
      }
      return;
    }
  }

  const filePath = pathname === '/' ? path.join(ROOT, 'index.html') : path.join(ROOT, pathname);
  const safeTarget = path.resolve(filePath);

  if (!safeTarget.startsWith(ROOT)) {
    send(res, 403, 'Access denied');
    return;
  }

  if (!fs.existsSync(safeTarget)) {
    send(res, 404, 'Not found');
    return;
  }

  const stat = fs.statSync(safeTarget);
  if (stat.isDirectory()) {
    const indexPath = path.join(safeTarget, 'index.html');
    if (fs.existsSync(indexPath)) {
      const stream = fs.createReadStream(indexPath);
      stream.on('error', () => send(res, 500, 'Server error'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
      stream.pipe(res);
      return;
    }

    send(res, 403, 'Directory listing is not allowed');
    return;
  }

  const ext = path.extname(safeTarget);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(safeTarget);
  stream.on('error', () => send(res, 500, 'Server error'));
  res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
  stream.pipe(res);
});

server.listen(PORT, () => {
  console.log(`GiftGenie server running at http://127.0.0.1:${PORT}`);
});
