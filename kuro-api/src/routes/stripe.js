const express = require('express');
const router = express.Router();
const db = require('../database');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const COMMISSION_RATE = 0.15;

// ------------------------------------------------------------------------------
// 1. GET /api/stripe/onboarding?msp_id=MSP-ALPHA
// Génère un lien d'onboarding Stripe Connect Express pour un MSP
// ------------------------------------------------------------------------------
router.get('/onboarding', async (req, res) => {
  const { msp_id } = req.query;

  if (!msp_id) {
    return res.status(400).json({ status: 'error', message: 'msp_id est requis' });
  }

  db.get('SELECT * FROM msps WHERE msp_id = ?', [msp_id], async (err, msp) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    if (!msp) return res.status(404).json({ status: 'error', message: 'MSP non trouvé' });

    try {
      let accountId = msp.stripe_account_id;

      // Créer un compte Stripe Connect Express si inexistant
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          metadata: { msp_id }
        });
        accountId = account.id;

        db.run('UPDATE msps SET stripe_account_id = ? WHERE msp_id = ?', [accountId, msp_id]);
      }

      const portalUrl = process.env.PORTAL_URL || 'http://localhost:3001';

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${portalUrl}/stripe/onboarding?msp_id=${msp_id}`,
        return_url: `${portalUrl}/dashboard?stripe=connected&msp_id=${msp_id}`,
        type: 'account_onboarding'
      });

      res.json({
        status: 'success',
        onboarding_url: accountLink.url,
        stripe_account_id: accountId
      });
    } catch (stripeErr) {
      res.status(500).json({ status: 'error', message: stripeErr.message });
    }
  });
});

// ------------------------------------------------------------------------------
// 2. GET /api/stripe/status?msp_id=MSP-ALPHA
// Retourne le statut du compte Stripe Connect du MSP
// ------------------------------------------------------------------------------
router.get('/status', (req, res) => {
  const { msp_id } = req.query;

  if (!msp_id) {
    return res.status(400).json({ status: 'error', message: 'msp_id est requis' });
  }

  db.get('SELECT msp_id, stripe_account_id FROM msps WHERE msp_id = ?', [msp_id], (err, msp) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    if (!msp) return res.status(404).json({ status: 'error', message: 'MSP non trouvé' });

    res.json({
      status: 'success',
      msp_id: msp.msp_id,
      stripe_connected: !!msp.stripe_account_id,
      stripe_account_id: msp.stripe_account_id || null
    });
  });
});

// ------------------------------------------------------------------------------
// 3. POST /api/stripe/webhook
// Intercepte payment_intent.succeeded et déclenche le virement de commission
// ------------------------------------------------------------------------------
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
      : JSON.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const mspId = paymentIntent.metadata?.msp_id;
    const amountReceived = paymentIntent.amount_received;

    if (!mspId) {
      return res.json({ received: true, info: 'Pas de MSP associé, commission ignorée' });
    }

    db.get('SELECT stripe_account_id FROM msps WHERE msp_id = ?', [mspId], async (err, msp) => {
      if (err || !msp?.stripe_account_id) {
        return res.json({ received: true, info: 'Compte Stripe MSP non configuré, commission ignorée' });
      }

      const commissionAmount = Math.floor(amountReceived * COMMISSION_RATE);

      try {
        await stripe.transfers.create({
          amount: commissionAmount,
          currency: paymentIntent.currency,
          destination: msp.stripe_account_id,
          description: `Commission Kuro Suite (15%) - MSP ${mspId}`,
          metadata: { msp_id: mspId, original_payment_intent: paymentIntent.id }
        });

        console.log(`✅ Commission ${commissionAmount / 100}€ versée au MSP ${mspId}`);
        res.json({ received: true, commission_transferred: commissionAmount });
      } catch (transferErr) {
        console.error('Erreur virement commission:', transferErr.message);
        res.status(500).json({ error: transferErr.message });
      }
    });
  } else {
    res.json({ received: true });
  }
});

module.exports = router;
