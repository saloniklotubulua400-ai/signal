import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import './config/supabase.js'; // fail fast if env vars are missing
import { APP_NAME } from './config/brand.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import licenseRoutes from './routes/licenses.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import birdRoutes from './routes/bird.js';
import birdWebhookRoutes from './routes/birdWebhooks.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }));
// keep the raw body: payment webhooks must be signature-checked against the exact bytes
app.use(express.json({ limit: '1mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => res.json({ name: `${APP_NAME} API`, status: 'running' }));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);        // demo CRUD, safe to delete
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bird', birdRoutes);               // admin-only Bird tools
app.use('/api/webhooks/bird', birdWebhookRoutes); // called by Bird

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`${APP_NAME} server running on http://localhost:${PORT}`));
