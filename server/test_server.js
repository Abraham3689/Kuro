const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const billingWebhook = require('./routes/billing_webhook');

// Use raw body for Stripe signature validation
app.use('/api/billing/webhook', billingWebhook);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Kuro Billing Test Server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Test Server] Kuro Billing & Webhook server running on port ${PORT}`);
});
