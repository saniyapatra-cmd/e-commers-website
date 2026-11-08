const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const memoryOrders = new Map();
const catalog = {
  'tatum-5-orbit-copy': { name: 'Air Jordan 12 Retro', price: 14900, sizes: ['40','41','42','43','44','45','46'] },
  tshirt: { name: 'Tshirt', price: 19900, sizes: ['S','L','M','XL'] },
  sweatshirt: { name: 'Sweatshirt', price: 19900, sizes: ['S','L','M','XL'] },
  'tatum-5-orbit': { name: 'Tatum 5 Orbit', price: 14900, sizes: ['40','41','42','43','44','45','46'] },
  'hoodie-black': { name: 'Hoodie Black', price: 19900, sizes: ['S','L','M','XL'] },
  'sweatshirt-plus': { name: 'Sweatshirt Plus', price: 19900, sizes: ['S','L','M','XL'] },
  hoodie: { name: 'Hoodie', price: 19900, sizes: ['S','L','M','XL'] },
  'air-jordan-12-retro-copy': { name: 'Luka 5', price: 14900, sizes: ['40','41','42','43','44','45','46'] }
};

let pool = null;
let databaseReady = false;
const ready = initDatabase();

async function initDatabase() {
  if (!process.env.DATABASE_URL) return;
  try {
    pool = mysql.createPool(process.env.DATABASE_URL);
    await pool.query(`CREATE TABLE IF NOT EXISTS runway_orders (
      id VARCHAR(80) PRIMARY KEY,
      email VARCHAR(255) NULL,
      status VARCHAR(32) NOT NULL,
      amount_cents INT NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'usd',
      items_json TEXT NOT NULL,
      stripe_session_id VARCHAR(255) NULL,
      payment_intent_id VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_runway_orders_stripe_session (stripe_session_id)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS runway_processed_events (
      event_id VARCHAR(255) PRIMARY KEY,
      event_type VARCHAR(120) NOT NULL,
      processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    databaseReady = true;
  } catch (error) {
    console.error('Database initialization failed; using in-memory preview fallback.');
  }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) { reject(new Error('Request body too large.')); req.destroy(); }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function validateItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error('Your styling bag is empty or too large.');
  let amountCents = 0;
  const normalized = items.map(item => {
    const product = catalog[item.id];
    const quantity = Number(item.quantity);
    const size = String(item.size || '');
    if (!product || !product.sizes.includes(size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Please choose an available size.');
    amountCents += product.price * quantity;
    return { id: item.id, name: product.name, size, quantity, unitAmount: product.price };
  });
  if (amountCents < 50) throw new Error('The checkout amount is below the payment provider minimum.');
  return { items: normalized, amountCents };
}

async function createOrder(order) {
  if (!databaseReady) { memoryOrders.set(order.id, order); return; }
  await pool.execute('INSERT INTO runway_orders (id,email,status,amount_cents,currency,items_json) VALUES (?,?,?,?,?,?)', [order.id, order.email || null, order.status, order.amountCents, 'usd', JSON.stringify(order.items)]);
}

async function updateOrder(id, changes) {
  const existing = memoryOrders.get(id);
  if (!databaseReady) { if (existing) memoryOrders.set(id, { ...existing, ...changes }); return; }
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(changes)) {
    const column = { status: 'status', stripeSessionId: 'stripe_session_id', paymentIntentId: 'payment_intent_id' }[key];
    if (column) { fields.push(`${column} = ?`); values.push(value); }
  }
  if (fields.length) { values.push(id); await pool.execute(`UPDATE runway_orders SET ${fields.join(', ')} WHERE id = ?`, values); }
}

async function getOrder(id) {
  if (!databaseReady) return memoryOrders.get(id) || null;
  const [rows] = await pool.execute('SELECT id,email,status,amount_cents AS amountCents,currency,items_json AS itemsJson,stripe_session_id AS stripeSessionId,payment_intent_id AS paymentIntentId,created_at AS createdAt FROM runway_orders WHERE id = ?', [id]);
  if (!rows[0]) return null;
  return { ...rows[0], items: JSON.parse(rows[0].itemsJson) };
}

async function stripeRequest(endpoint, params) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe test credentials are not available in this preview.');
  const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Stripe could not create checkout.');
  return data;
}

function stripeSignatureValid(rawBody, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) return false;
  const parts = Object.fromEntries(signature.split(',').map(part => part.split('=')));
  const timestamp = parts.t;
  const expected = crypto.createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${rawBody}`).digest('hex');
  if (!timestamp || !parts.v1) return false;
  try { return Math.abs(Date.now() / 1000 - Number(timestamp)) < 300 && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1)); } catch { return false; }
}

async function processWebhook(rawBody, signature) {
  if (!stripeSignatureValid(rawBody, signature)) throw new Error('Invalid Stripe signature.');
  const event = JSON.parse(rawBody);
  if (databaseReady) {
    try { await pool.execute('INSERT INTO runway_processed_events (event_id,event_type) VALUES (?,?)', [event.id, event.type]); }
    catch (error) { if (error.code === 'ER_DUP_ENTRY') return; throw error; }
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id || session.client_reference_id;
    if (orderId) await updateOrder(orderId, { status: 'paid', paymentIntentId: session.payment_intent || null });
  } else if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    if (intent.metadata?.order_id) await updateOrder(intent.metadata.order_id, { status: 'payment_failed', paymentIntentId: intent.id });
  }
}

async function handleApi(req, res, url) {
  await ready;
  if (req.method === 'GET' && url.pathname.startsWith('/api/orders/')) {
    const order = await getOrder(url.pathname.split('/').pop());
    return order ? sendJson(res, 200, { order }) : sendJson(res, 404, { error: 'Order not found.' });
  }
  if (req.method === 'POST' && url.pathname === '/api/stripe/webhook') {
    try { await processWebhook(await readBody(req), req.headers['stripe-signature']); return sendJson(res, 200, { received: true }); }
    catch (error) { return sendJson(res, 400, { error: error.message }); }
  }
  if (req.method !== 'POST' || !['/api/simulate-checkout', '/api/create-checkout-session'].includes(url.pathname)) return sendJson(res, 404, { error: 'Not found.' });
  try {
    const body = JSON.parse(await readBody(req) || '{}');
    const { items, amountCents } = validateItems(body.items);
    const orderId = `runway_${crypto.randomUUID()}`;
    const order = { id: orderId, email: String(body.email || '').slice(0, 255), status: url.pathname === '/api/simulate-checkout' ? 'paid' : 'pending', amountCents, items, createdAt: new Date().toISOString() };
    await createOrder(order);
    if (url.pathname === '/api/simulate-checkout') return sendJson(res, 200, { orderId, status: 'paid', simulated: true });
    const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    const params = { mode: 'payment', success_url: `${origin}/?checkout=success&order_id=${encodeURIComponent(orderId)}`, cancel_url: `${origin}/?checkout=cancelled&order_id=${encodeURIComponent(orderId)}`, client_reference_id: orderId, 'metadata[order_id]': orderId, 'metadata[customer_email]': order.email, allow_promotion_codes: 'true' };
    items.forEach((item, index) => { params[`line_items[${index}][price_data][currency]`] = 'usd'; params[`line_items[${index}][price_data][product_data][name]`] = `${item.name} · Size ${item.size}`; params[`line_items[${index}][price_data][unit_amount]`] = String(item.unitAmount); params[`line_items[${index}][quantity]`] = String(item.quantity); });
    const session = await stripeRequest('checkout/sessions', params);
    await updateOrder(orderId, { stripeSessionId: session.id });
    return sendJson(res, 200, { orderId, url: session.url, status: 'pending' });
  } catch (error) { return sendJson(res, 400, { error: error.message || 'Checkout failed.' }); }
}

function contentType(filePath) {
  return { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' }[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(PUBLIC_DIR, `.${pathname}`);
  if (!filePath.startsWith(PUBLIC_DIR)) return sendJson(res, 403, { error: 'Forbidden.' });
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) return sendJson(res, 404, { error: 'Not found.' });
    res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': pathname.endsWith('.html') ? 'no-cache' : 'public, max-age=3600' });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/_app/health') return sendJson(res, 200, { ok: true, database: databaseReady });
    if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (error) { console.error('Request failed:', error.message); sendJson(res, 500, { error: 'Unexpected server error.' }); }
});

server.listen(PORT, '0.0.0.0', () => console.log(`Runway server listening on ${PORT}`));
