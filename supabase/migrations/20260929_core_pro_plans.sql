-- Migration Supabase: Support des offres Core vs Pro et des modules autorisés

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    user_id UUID,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_type TEXT NOT NULL DEFAULT 'core' CHECK (plan_type IN ('core', 'pro')),
    allowed_modules JSONB NOT NULL DEFAULT '["office", "notes", "drive", "chat", "meet", "mail", "pdf", "diagram", "send"]'::jsonb,
    storage_quota_gb INTEGER NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si la table existait déjà sans plan_type, allowed_modules ou storage_quota_gb
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan_type') THEN
        ALTER TABLE public.subscriptions ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'core' CHECK (plan_type IN ('core', 'pro'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'allowed_modules') THEN
        ALTER TABLE public.subscriptions ADD COLUMN allowed_modules JSONB NOT NULL DEFAULT '["office", "notes", "drive", "chat", "meet", "mail", "pdf", "diagram", "send"]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'storage_quota_gb') THEN
        ALTER TABLE public.subscriptions ADD COLUMN storage_quota_gb INTEGER NOT NULL DEFAULT 50;
    END IF;
END $$;
