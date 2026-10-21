import { Router } from 'express';
import { supabaseAdmin as db } from '../config/supabase.js';
import { verifyBirdWebhook } from '../services/bird.js';
import { wrap } from '../utils/asyncHandler.js';

const router = Router();

// POST /api/webhooks/bird   (called by Bird, no login, protected by the signature)
router.post('/', wrap(async (req, res) => {
  const secret = process.env.BIRD_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'BIRD_WEBHOOK_SECRET is not set' });
  if (!verifyBirdWebhook(req.rawBody, req.headers, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body || {};
  const webhookId = req.headers['webhook-id'];
  const type = event.type || event.event || null;

  // Bird delivers at-least-once; the webhook id is the primary key, so duplicates are ignored.
  const { error } = await db
    .from('bird_events')
    .upsert({ id: webhookId, type, payload: event }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;

  // Best effort: update the status of the message we logged, e.g. "sms.delivered" -> "delivered".
  const messageId = event.data?.id;
  if (messageId && type) {
    await db
      .from('bird_messages')
      .update({ status: String(type).split('.').pop(), last_event: type, updated_at: new Date().toISOString() })
      .eq('id', messageId);
  }

  res.sendStatus(200);
}));

export default router;
