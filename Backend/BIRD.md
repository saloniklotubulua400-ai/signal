# Signal Desk: Bird connection (step 1)

## 1. Create the tables
Supabase -> SQL Editor -> run `sql/schema_bird.sql`.

## 2. Create a Bird API key
Bird dashboard -> Platform tools -> API keys -> create a key with these scopes:
- `emails` (write) to send email
- `sms` (write) to send SMS
- `webhooks` (write) only if you want to create webhooks by API

The key is shown once and starts with `bk_us1_` or `bk_eu1_`. The server reads the region from
the prefix, so you do not set a host. Put the key in `.env`:

    BIRD_API_KEY=bk_us1_...

Restart the server (`npm run dev`) after editing `.env`.

## 3. Test it
    ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpass node test-bird.js

The email test uses Bird's sandbox address, so it is free and needs no verified domain.
SMS is skipped unless you pass `TEST_SMS_TO` (it costs money, and the destination country must be
enabled in Bird: SMS -> Destinations).

## 4. Webhooks (delivery updates)
Needs a public URL (your deployed server, or a tunnel such as ngrok while developing).
In Bird, create a webhook pointing to `https://YOUR-URL/api/webhooks/bird`, choose the events you want,
and copy the signing secret into `.env`:

    BIRD_WEBHOOK_SECRET=...

The server checks the signature (Standard Webhooks), rejects old deliveries, ignores duplicates,
stores every event in `bird_events`, and updates the status of the message in `bird_messages`.

## Admin-only routes (for now)
| Method | Path | Purpose |
|---|---|---|
| GET | /api/bird/status | Key configured? Region? Webhook secret set? |
| POST | /api/bird/test-email | Sandbox email by default |
| POST | /api/bird/test-sms | `{ "to": "+254...", "from": "...", "text": "..." }` |
| GET | /api/bird/email/:id, /api/bird/sms/:id | Live status from Bird |
| GET | /api/bird/messages | What your server has sent |
| POST | /api/webhooks/bird | Called by Bird |

## Notes
- If Bird rejects the server's own key (401/403) the API answers 502 with a hint, never 401,
  so a bad key can never log your customers out.
- The SMS status lookup path (`GET /v1/sms/messages/:id`) follows the email one; if it ever 404s, tell me.
- Customers cannot send yet. That is deliberate: sending costs you money, so the next steps add
  customer credits and usage limits first.
