const http = require('http');

const eventCore = {
    id: "evt_test_core_123",
    type: "checkout.session.completed",
    data: {
        object: {
            id: "cs_test_core_session_001",
            client_reference_id: "tenant_core_demo",
            customer: "cus_test_core_123",
            subscription: "sub_test_core_123",
            metadata: {
                plan_type: "core",
                ref: "msp_partner_001"
            },
            amount_total: 4900,
            currency: "eur"
        }
    }
};

const eventPro = {
    id: "evt_test_pro_456",
    type: "checkout.session.completed",
    data: {
        object: {
            id: "cs_test_pro_session_002",
            client_reference_id: "tenant_pro_demo",
            customer: "cus_test_pro_456",
            subscription: "sub_test_pro_456",
            metadata: {
                plan_type: "pro",
                ref: "msp_partner_002"
            },
            amount_total: 9900,
            currency: "eur"
        }
    }
};

function sendWebhookPayload(payload, label) {
    const data = JSON.stringify(payload);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/billing/webhook',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`[Test ${label}] Response Status: ${res.statusCode} | Body: ${body}`);
        });
    });

    req.on('error', (error) => {
        console.error(`[Test ${label}] Error sending request:`, error.message);
    });

    req.write(data);
    req.end();
}

console.log("Simulating Stripe Webhook Events...");
sendWebhookPayload(eventCore, "Pack Core (50GB + 9 Modules + 15% MSP)");
setTimeout(() => {
    sendWebhookPayload(eventPro, "Pack Pro (100GB + 16 Modules + 15% MSP)");
}, 1000);
