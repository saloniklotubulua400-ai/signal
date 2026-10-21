import crypto from 'crypto';
import { Router } from 'express';
import { supabaseAdmin as db } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { wrap, httpError } from '../utils/asyncHandler.js';
import { birdStatus, getEmail, getSms, sendEmail, sendSms } from '../services/bird.js';
import { APP_NAME } from '../config/brand.js';

const router = Router();
// Sending SMS costs real money, so for now only admins can use these routes.
router.use(requireAuth, requireAdmin);

/** Remember what we sent. Never breaks the request if the table has not been created yet. */
async function logMessage({ id, channel, to, from, status, userId }) {
  if (!id) return;
  const { error } = await db.from('bird_messages').insert({
    id, channel, to_address: Array.isArray(to) ? to.join(', ') : String(to), from_address: from, status: status || 'accepted', user_id: userId,
  });
  if (error) console.warn('bird_messages not saved (did you run sql/schema_bird.sql?):', error.message);
}

// GET /api/bird/status  -> is the key configured, which region/host, is the webhook secret set
router.get('/status', (req, res) => res.json(birdStatus()));

// POST /api/bird/test-email  { to?, from?, subject?, html? }
// Defaults use Bird's sandbox, so it is free and needs no verified domain.
router.post('/test-email', wrap(async (req, res) => {
  const b = req.body || {};
  const payload = {
    from: b.from || 'onboarding@messagebird.dev',
    to: b.to || 'delivered@messagebird.dev',
    subject: b.subject || `Hello from ${APP_NAME}`,
    html: b.html || `<p>Your ${APP_NAME} connection to Bird works.</p>`,
    text: b.text || `Your ${APP_NAME} connection to Bird works.`,
  };
  const msg = await sendEmail({ ...payload, idempotencyKey: crypto.randomUUID() });
  await logMessage({ id: msg?.id, channel: 'email', to: payload.to, from: payload.from, status: msg?.status, userId: req.user.id });
  res.status(202).json(msg);
}));

// POST /api/bird/test-sms  { to: "+2547...", from?, text?, category? }
router.post('/test-sms', wrap(async (req, res) => {
  const b = req.body || {};
  if (!b.to || !/^\+[1-9]\d{6,14}$/.test(b.to)) throw httpError(400, 'to must be a phone number in E.164 format, for example +254712345678');
  const msg = await sendSms({
    to: b.to,
    from: b.from,
    text: b.text || `Test message from ${APP_NAME}.`,
    category: b.category || 'transactional',
    idempotencyKey: crypto.randomUUID(),
  });
  await logMessage({ id: msg?.id, channel: 'sms', to: b.to, from: msg?.from || b.from, status: msg?.status, userId: req.user.id });
  res.status(202).json(msg);
}));

// GET /api/bird/email/:id and /api/bird/sms/:id  -> live status from Bird
router.get('/email/:id', wrap(async (req, res) => res.json(await getEmail(req.params.id))));
router.get('/sms/:id', wrap(async (req, res) => res.json(await getSms(req.params.id))));

// GET /api/bird/messages -> what this server has sent (from our own database)
router.get('/messages', wrap(async (req, res) => {
  const { data, error } = await db.from('bird_messages').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  res.json(data);
}));

export default router;
