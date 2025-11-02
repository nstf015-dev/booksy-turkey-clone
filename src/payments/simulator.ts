// Simple payment simulator (Node.js + Express).
// Usage: node simulator.js
// Endpoints:
// POST /intents -> create intent (returns token & intent id)
// POST /intents/:id/confirm -> mark as success/fail and simulator will POST webhook to configured CALLBACK_URL
//
// Env:
// CALLBACK_URL - URL to send webhook (e.g., https://api.yourapp.com/v1/payments/webhook)
// WEBHOOK_SECRET - HMAC secret to sign payloads

import express from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

type Intent = {
  id: string;
  amount: number;
  currency: string;
  bookingId?: string;
  status: 'created' | 'succeeded' | 'failed';
  createdAt: string;
  token: string;
};

const store = new Map<string, Intent>();

function genId(prefix = 'pi') {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function signPayload(secret: string, payload: any) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

app.post('/intents', (req, res) => {
  const { amount, currency, bookingId } = req.body;
  if (!amount || !currency) return res.status(400).json({ error: 'amount & currency required' });

  const id = genId('pi');
  const token = genId('tok');
  const intent: Intent = {
    id,
    amount,
    currency,
    bookingId,
    status: 'created',
    createdAt: new Date().toISOString(),
    token,
  };
  store.set(id, intent);
  return res.status(201).json({ intent });
});

// Confirm (simulate payment)
app.post('/intents/:id/confirm', async (req, res) => {
  const id = req.params.id;
  const { succeed } = req.body;
  const intent = store.get(id);
  if (!intent) return res.status(404).json({ error: 'intent not found' });

  intent.status = succeed ? 'succeeded' : 'failed';
  store.set(id, intent);

  // Send webhook to CALLBACK_URL if configured
  const CALLBACK_URL = process.env.CALLBACK_URL;
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'dev-secret';
  if (CALLBACK_URL) {
    const payload = {
      event: succeed ? 'payment.succeeded' : 'payment.failed',
      data: {
        intentId: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        bookingId: intent.bookingId || null,
        status: intent.status,
        timestamp: new Date().toISOString(),
      },
    };
    const signature = signPayload(WEBHOOK_SECRET, payload);
    try {
      await fetch(CALLBACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sim-Signature': signature,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Webhook send error', err);
    }
  }

  return res.json({ intent });
});

app.get('/intents/:id', (req, res) => {
  const intent = store.get(req.params.id);
  if (!intent) return res.status(404).json({ error: 'not found' });
  res.json({ intent });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Payment simulator listening on ${PORT}`);
  console.log(`CALLBACK_URL=${process.env.CALLBACK_URL}`);
});