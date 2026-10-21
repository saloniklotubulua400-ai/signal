import crypto from 'crypto';

/**
 * Small Bird API client (no SDK needed, just fetch).
 *   Auth:   Authorization: Bearer <bk_{region}_...>
 *   Host:   https://{region}.platform.bird.com  (region is read from the key prefix)
 * Docs: https://bird.com/docs/guides/authentication
 */

const keyRegion = (key) => key?.match(/^bk_([a-z0-9]+)_/i)?.[1]?.toLowerCase() || null;

function config() {
  const apiKey = process.env.BIRD_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('BIRD_API_KEY is not set. Add it to your .env file.'), { status: 503 });
  }
  const region = keyRegion(apiKey);
  const host = process.env.BIRD_API_HOST || (region ? `https://${region}.platform.bird.com` : null);
  if (!host) {
    throw Object.assign(
      new Error('Cannot work out the Bird region from BIRD_API_KEY. Set BIRD_API_HOST, for example https://us1.platform.bird.com'),
      { status: 503 }
    );
  }
  return { apiKey, host: host.replace(/\/+$/, ''), region };
}

/** Safe summary for the admin status route (never returns the key itself). */
export function birdStatus() {
  const key = process.env.BIRD_API_KEY;
  let host = null;
  let problem = null;
  try { host = config().host; } catch (e) { problem = e.message; }
  return {
    configured: Boolean(key),
    key_hint: key ? `${key.slice(0, 11)}...` : null,
    region: keyRegion(key),
    host,
    webhook_secret_set: Boolean(process.env.BIRD_WEBHOOK_SECRET),
    default_sms_from: process.env.BIRD_SMS_FROM || null,
    problem,
  };
}

const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

async function request(method, path, body, { idempotencyKey } = {}) {
  const { apiKey, host } = config();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  let res;
  try {
    res = await fetch(host + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    throw Object.assign(new Error(`Could not reach Bird: ${err.message}`), { status: 502 });
  }

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    const message = data?.error?.message || data?.message || data?.detail || `Bird returned HTTP ${res.status}`;
    // 401/403 from Bird means OUR server key is wrong or lacks a scope. Never forward 401 to the browser
    // (the frontend would log the customer out), so report it as a bad gateway instead.
    const status = res.status === 401 || res.status === 403 || res.status >= 500 ? 502 : res.status;
    const hint = res.status === 401 ? ' (check BIRD_API_KEY)' : res.status === 403 ? ' (the key is missing a scope, e.g. emails:write or sms:write)' : '';
    throw Object.assign(new Error(message + hint), { status, details: data });
  }
  return data;
}

// ---------- SMS ----------
export function sendSms({ to, from, text, category = 'transactional', tags, metadata, idempotencyKey }) {
  const sender = from || process.env.BIRD_SMS_FROM;
  if (!to || !text) throw Object.assign(new Error('to and text are required'), { status: 400 });
  if (!sender) throw Object.assign(new Error('from is required (or set BIRD_SMS_FROM in .env)'), { status: 400 });
  return request('POST', '/v1/sms/messages', clean({ to, from: sender, text, category, tags, metadata }), { idempotencyKey });
}

export const sendSmsBatch = (messages, opts) => request('POST', '/v1/sms/batches', { messages }, opts);
export const getSms = (id) => request('GET', `/v1/sms/messages/${encodeURIComponent(id)}`);

// ---------- Email ----------
export function sendEmail({ from, to, subject, html, text, idempotencyKey }) {
  if (!from || !to || !subject || (!html && !text)) {
    throw Object.assign(new Error('from, to, subject and html or text are required'), { status: 400 });
  }
  return request(
    'POST',
    '/v1/email/messages',
    clean({ from, to: Array.isArray(to) ? to : [to], subject, html, text }),
    { idempotencyKey }
  );
}

export const sendEmailBatch = (messages, opts) => request('POST', '/v1/email/batches', { messages }, opts);
export const getEmail = (id) => request('GET', `/v1/email/messages/${encodeURIComponent(id)}`);

// ---------- Webhooks (Standard Webhooks signing) ----------
/**
 * Verifies webhook-id / webhook-timestamp / webhook-signature against the RAW request body.
 * Rejects deliveries older than 5 minutes. Supports several signatures (secret rotation).
 */
export function verifyBirdWebhook(rawBody, headers, secret) {
  const id = headers['webhook-id'];
  const timestamp = headers['webhook-timestamp'];
  const signatureHeader = headers['webhook-signature'];
  if (!rawBody || !id || !timestamp || !signatureHeader || !secret) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = secret.startsWith('whsec_') ? Buffer.from(secret.slice(6), 'base64') : Buffer.from(secret, 'utf8');
  const expected = crypto
    .createHmac('sha256', key)
    .update(`${id}.${timestamp}.${rawBody.toString('utf8')}`)
    .digest('base64');

  return String(signatureHeader).split(' ').some((part) => {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}
