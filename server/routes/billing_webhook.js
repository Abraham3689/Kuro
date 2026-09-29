const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Module definitions per plan type
const MODULE_PACKS = {
    core: [
        "office",
        "notes",
        "drive",
        "chat",
        "meet",
        "mail",
        "pdf",
        "diagram",
        "send"
    ],
    pro: [
        "office",
        "notes",
        "drive",
        "chat",
        "meet",
        "mail",
        "pdf",
        "diagram",
        "send",
        "sign",
        "crm",
        "data",
        "apps",
        "watch",
        "studio",
        "ai"
    ]
};

// Stripe Price IDs mapped to plan types (configurable via environment variables)
const PRICE_PLAN_MAP = {
    [process.env.STRIPE_PRICE_ID_CORE || 'price_core']: 'core',
    [process.env.STRIPE_PRICE_ID_PRO || 'price_pro']: 'pro'
};

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const tenantId = session.client_reference_id || session.metadata?.tenant_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Retrieve line items to determine the price_id
        let priceId = null;
        try {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            if (lineItems.data && lineItems.data.length > 0) {
                priceId = lineItems.data[0].price.id;
            }
        } catch (e) {
            console.error('Error fetching checkout line items:', e);
        }

        // Determine plan_type based on price_id
        const planType = PRICE_PLAN_MAP[priceId] || session.metadata?.plan_type || 'core';
        const allowedModules = MODULE_PACKS[planType] || MODULE_PACKS.core;

        // Update or insert subscription in Supabase
        const { data, error } = await supabase
            .from('subscriptions')
            .upsert({
                tenant_id: tenantId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan_type: planType,
                allowed_modules: allowedModules,
                status: 'active',
                updated_at: new Date()
            }, { onConflict: 'tenant_id' });

        if (error) {
            console.error('Error updating Supabase subscription:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log(`[Stripe Webhook] Subscription active for tenant ${tenantId} on plan ${planType}`);
    }

    res.json({ received: true });
});

module.exports = router;
