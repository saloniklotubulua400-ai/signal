// Tests the Bird connection through YOUR server.
// Needs: server running, .env has BIRD_API_KEY, you are an admin.
//
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpass node test-bird.js
// Optional real SMS (costs money):   TEST_SMS_TO=+254712345678 TEST_SMS_FROM=YourName node test-bird.js

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const EMAIL = process.env.ADMIN_EMAIL || 'test@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'secret123';

async function call(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}
const show = (name, r) => {
  console.log(`${r.ok ? '✅' : '❌'} ${name} (HTTP ${r.status})`);
  if (!r.ok) console.log('   ', JSON.stringify(r.data));
  return r.ok;
};

async function main() {
  let r = await call('POST', '/api/auth/login', { email: EMAIL, password: PASSWORD });
  if (!show('Log in', r)) return;
  const token = r.data.session.access_token;

  r = await call('GET', '/api/bird/status', null, token);
  if (!show('Bird configuration', r)) return console.log("\nYou must be an admin: update public.profiles set role = 'admin' where email = '" + EMAIL + "';");
  console.log('   ', JSON.stringify(r.data));
  if (!r.data.configured) return console.log('\nStop: BIRD_API_KEY is not set in .env (restart the server after editing it).');

  r = await call('POST', '/api/bird/test-email', {}, token);
  if (!show('Send sandbox email through Bird', r)) return;
  const id = r.data?.id;
  console.log('   message id:', id, ' status:', r.data?.status);

  if (id) {
    await new Promise((res) => setTimeout(res, 2000));
    r = await call('GET', `/api/bird/email/${id}`, null, token);
    show('Read the email status back from Bird', r);
    if (r.ok) console.log('   ', JSON.stringify(r.data).slice(0, 300));
  }

  if (process.env.TEST_SMS_TO) {
    r = await call('POST', '/api/bird/test-sms', { to: process.env.TEST_SMS_TO, from: process.env.TEST_SMS_FROM }, token);
    show('Send real SMS through Bird', r);
    if (r.ok) console.log('   message id:', r.data?.id, ' segments:', r.data?.segments?.count);
  } else {
    console.log('ℹ️  SMS skipped (it costs money). Add TEST_SMS_TO=+2547... to try it.');
  }

  r = await call('GET', '/api/bird/messages', null, token);
  show('Messages logged in your database', r);
  if (r.ok) console.log(`    ${r.data.length} logged`);
}
main().catch((e) => console.error('Could not reach the server. Is `npm run dev` running?\n', e.message));
