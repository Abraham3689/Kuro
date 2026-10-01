const http = require('http');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/billing/webhook') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const event = JSON.parse(body);
                console.log(`\n[Webhook Received] Event Type: ${event.type}`);
                
                if (event.type === 'checkout.session.completed') {
                    const session = event.data.object;
                    const tenantId = session.client_reference_id || session.metadata?.tenant_id;
                    const planType = session.metadata?.plan_type || 'core';
                    const storageQuotaGb = planType === 'pro' ? 100 : 50;
                    const refId = session.metadata?.ref || session.client_reference_id;

                    console.log(`├── Tenant ID: ${tenantId}`);
                    console.log(`├── Plan Type: ${planType.toUpperCase()}`);
                    console.log(`├── Storage Quota (Cloudflare R2): ${storageQuotaGb} GB`);
                    console.log(`├── Customer ID: ${session.customer}`);
                    console.log(`└── MSP Referral Code: ${refId} (15% Commission Rate)`);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        received: true,
                        tenant_id: tenantId,
                        plan_type: planType,
                        storage_quota_gb: storageQuotaGb,
                        status: 'provisioned'
                    }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ received: true }));
                }
            } catch (err) {
                console.error('[Webhook Error]', err.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'Kuro Webhook Native Test Server' }));
    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`[Test Server] Kuro Webhook Native Server running on http://localhost:${PORT}`);
});
