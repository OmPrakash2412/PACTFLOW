-- PACTFLOW Seed Data
-- Provides realistic seed data for development, testing, and pitch demos

-- Profiles
INSERT INTO profiles (id, email, full_name, role, paypal_email, avatar_url) VALUES
('11111111-1111-4111-8111-111111111111', 'client@pactflow.io', 'Sophia Vance', 'client', 'sb-svance-client@business.example.com', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'),
('22222222-2222-4222-8222-222222222222', 'freelancer@pactflow.io', 'Alex Rivera', 'freelancer', 'sb-arivera-freelancer@personal.example.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
('33333333-3333-4333-8333-333333333333', 'admin@pactflow.io', 'Elena Rostova', 'admin', 'admin@pactflow.io', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80')
ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, client_id, title, description, budget, currency, deadline, status) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'PulseAnalytics AI Financial Engine', 'Full architecture overhaul and implementation of real-time streaming financial intelligence with Gemini 2.0 and automated PayPal invoicing.', 6500.00, 'USD', NOW() + INTERVAL '30 days', 'active')
ON CONFLICT (id) DO NOTHING;

-- Project Members
INSERT INTO project_members (id, project_id, user_id, role) VALUES
('baaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'client'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'freelancer')
ON CONFLICT (id) DO NOTHING;

-- Agreements
INSERT INTO agreements (id, project_id, version, title, scope_of_work, budget_allocation, acceptance_criteria, assumptions, clarification_questions, status) VALUES
('caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 'PulseAnalytics Master Services Agreement v1.0', 
'Architect, construct, and deploy the high-throughput analytics engine featuring automated Gemini data verification and milestone-backed PayPal Sandbox settlement.',
'[{"milestone": "Architecture Blueprint & Core Ingestion Pipeline", "amount": 2500, "percentage": 38.46}, {"milestone": "AI Verification Engine & Frontend Dashboard", "amount": 2500, "percentage": 38.46}, {"milestone": "Production PayPal Invoicing & Automated Webhook Ledger", "amount": 1500, "percentage": 23.08}]'::jsonb,
'["Architecture blueprint approved with 99.9% uptime SLA design", "Pass 100% of integration test suites for deliverable parsing", "PayPal Sandbox Invoicing API v2 end-to-end payment capture", "Cryptographically sealed Trust Ledger hash chain"]'::jsonb,
'["Client provides PayPal Developer Sandbox credentials and test accounts", "Freelancer adheres to clean zero-trust code guidelines", "Node.js 20+ and Python 3.12+ runtime compatibility"]'::jsonb,
'["Does the client require multi-currency invoice rendering besides USD?", "Is automated invoice cancellation needed upon deliverable rejection?"]'::jsonb,
'accepted')
ON CONFLICT (id) DO NOTHING;

-- Agreement Acceptances
INSERT INTO agreement_acceptances (id, agreement_id, user_id, role, accepted_at, ip_address, user_agent, signature_hash) VALUES
('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'client', NOW() - INTERVAL '5 days', '198.51.100.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'freelancer', NOW() - INTERVAL '5 days', '198.51.100.45', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a')
ON CONFLICT (id) DO NOTHING;

-- Milestones
INSERT INTO milestones (id, project_id, agreement_id, sequence_order, title, description, amount, currency, deadline, acceptance_criteria, status) VALUES
('m1111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 'Architecture Blueprint & Core Ingestion Pipeline', 'Deliver production architecture specifications, schema migrations, and REST pipeline.', 2500.00, 'USD', NOW() - INTERVAL '2 days', '["Schema migrations committed with full RLS", "FastAPI ingestion endpoint passing tests", "API documentation delivered"]'::jsonb, 'paid'),
('m2222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2, 'AI Verification Engine & Frontend Dashboard', 'Implement Gemini Evidence Inspector and dark navy Next.js responsive interface.', 2500.00, 'USD', NOW() + INTERVAL '7 days', '["Gemini Evidence Inspector returns structured criteria analysis", "Next.js App router dashboard with charts and deliverable reviewer", "Responsive UI on mobile and desktop"]'::jsonb, 'approved'),
('m3333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 3, 'Production PayPal Invoicing & Automated Webhook Ledger', 'PayPal Sandbox v2 Invoicing API integration, webhook signature validation and Trust Ledger event emission.', 1500.00, 'USD', NOW() + INTERVAL '14 days', '["PayPal OAuth access token generation", "Authoritative Sandbox invoice creation and sending", "Webhook signature verification with idempotency protection", "Trust Ledger SHA256 chain verification"]'::jsonb, 'in_progress')
ON CONFLICT (id) DO NOTHING;

-- Deliverables
INSERT INTO deliverables (id, milestone_id, submitted_by, title, description, file_urls, demo_url, notes, version, status) VALUES
('d1111111-1111-4111-8111-111111111111', 'm1111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Initial Architecture & Ingestion Deliverables', 'Attached schema migrations, OpenAPI spec, and ingestion pipeline benchmark report.', '["https://storage.pactflow.io/artifacts/schema_v1.sql", "https://storage.pactflow.io/artifacts/pipeline_benchmarks.pdf"]'::jsonb, 'https://staging-api.pactflow.io/health', 'Benchmarks indicate 14,000 req/sec sustained throughput.', 1, 'approved'),
('d2222222-2222-4222-8222-222222222222', 'm2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'AI Verification & UI Dashboard Code', 'Next.js App Router source, shadcn cards, Recharts visualizations and Gemini Pydantic parser.', '["https://storage.pactflow.io/artifacts/dashboard_preview.png"]'::jsonb, 'https://pactflow-demo.vercel.app', 'Integrated with Google Gemini 2.0 Flash SDK.', 1, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Verification Reports
INSERT INTO verification_reports (id, deliverable_id, milestone_id, summary, criteria_analysis, missing_evidence, recommendations, confidence_score, overall_verdict, generated_by) VALUES
('v1111111-1111-4111-8111-111111111111', 'd1111111-1111-4111-8111-111111111111', 'm1111111-1111-4111-8111-111111111111', 'All milestone acceptance criteria fully validated against submitted code artifacts and benchmark reports.',
'[{"criterion": "Schema migrations committed with full RLS", "verdict": "satisfied", "evidence": "Verified schema_v1.sql contains comprehensive RLS policies and table constraints", "confidence": 0.98}, {"criterion": "FastAPI ingestion endpoint passing tests", "verdict": "satisfied", "evidence": "Automated unit and integration test outputs show 100% pass rate", "confidence": 0.99}, {"criterion": "API documentation delivered", "verdict": "satisfied", "evidence": "OpenAPI /docs endpoint accessible and compliant with specifications", "confidence": 0.95}]'::jsonb,
'[]'::jsonb,
'["Ensure connection pooling limits are configured before production rollout"]'::jsonb,
97.5, 'satisfied', 'gemini-evidence-inspector'),
('v2222222-2222-4222-8222-222222222222', 'd2222222-2222-4222-8222-222222222222', 'm2222222-2222-4222-8222-222222222222', 'Evidence demonstrates interactive UI components and verified Gemini API responses.',
'[{"criterion": "Gemini Evidence Inspector returns structured criteria analysis", "verdict": "satisfied", "evidence": "Pydantic response schema parsed successfully with strict enum validations", "confidence": 0.96}, {"criterion": "Next.js App router dashboard with charts and deliverable reviewer", "verdict": "satisfied", "evidence": "Recharts rendering confirmed on staging deployment URL", "confidence": 0.94}, {"criterion": "Responsive UI on mobile and desktop", "verdict": "satisfied", "evidence": "Tailwind layout verified across mobile and widescreen viewport tests", "confidence": 0.91}]'::jsonb,
'[]'::jsonb,
'["Proceed with PayPal Sandbox payment activation"]'::jsonb,
94.0, 'satisfied', 'gemini-evidence-inspector')
ON CONFLICT (id) DO NOTHING;

-- Invoices
INSERT INTO invoices (id, milestone_id, project_id, client_id, freelancer_id, paypal_invoice_id, paypal_invoice_number, status, amount, currency, invoice_date, due_date, paypal_hosted_url) VALUES
('inv11111-1111-4111-8111-111111111111', 'm1111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'INV2-7XYZ-8ABC-9DEF-0123', 'PACTFLOW-INV-001', 'PAID', 2500.00, 'USD', NOW() - INTERVAL '3 days', NOW() + INTERVAL '10 days', 'https://www.sandbox.paypal.com/invoice/p/#INV2-7XYZ-8ABC-9DEF-0123')
ON CONFLICT (id) DO NOTHING;

-- Payments
INSERT INTO payments (id, invoice_id, milestone_id, project_id, paypal_capture_id, paypal_transaction_id, amount, currency, status, payment_method, paid_at) VALUES
('pay11111-1111-4111-8111-111111111111', 'inv11111-1111-4111-8111-111111111111', 'm1111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'CAP-998877665544', 'TX-112233445566', 2500.00, 'USD', 'COMPLETED', 'paypal_invoicing', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Trust Ledger Events
INSERT INTO trust_events (id, sequence_number, project_id, event_type, actor_id, entity_id, payload, prev_hash, current_hash, timestamp) VALUES
('t1111111-1111-4111-8111-111111111111', 1, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'PROJECT_CREATED', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{"title": "PulseAnalytics AI Financial Engine", "budget": 6500.00}'::jsonb, '0000000000000000000000000000000000000000000000000000000000000000', '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', NOW() - INTERVAL '6 days'),
('t2222222-2222-4222-8222-222222222222', 2, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'AGREEMENT_ACCEPTED_CLIENT', '11111111-1111-4111-8111-111111111111', 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{"version": 1, "role": "client"}'::jsonb, '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7', NOW() - INTERVAL '5 days'),
('t3333333-3333-4333-8333-333333333333', 3, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'AGREEMENT_ACCEPTED_FREELANCER', '22222222-2222-4222-8222-222222222222', 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{"version": 1, "role": "freelancer"}'::jsonb, '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7', '7d4a34b22c83b8b6a3ef89d8be698f237ef3b79f64e1c272bc97d463a652d8e4', NOW() - INTERVAL '5 days'),
('t4444444-4444-4444-8444-444444444444', 4, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'DELIVERABLE_SUBMITTED', '22222222-2222-4222-8222-222222222222', 'd1111111-1111-4111-8111-111111111111', '{"milestone_id": "m1111111-1111-4111-8111-111111111111", "deliverable_id": "d1111111-1111-4111-8111-111111111111"}'::jsonb, '7d4a34b22c83b8b6a3ef89d8be698f237ef3b79f64e1c272bc97d463a652d8e4', '8f14e45fceea167a5a36dedd4bea2543add704f46fc7b3ac6470ec82e83066d2', NOW() - INTERVAL '3 days'),
('t5555555-5555-4555-8555-555555555555', 5, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'AI_EVIDENCE_VERIFIED', '33333333-3333-4333-8333-333333333333', 'v1111111-1111-4111-8111-111111111111', '{"verdict": "satisfied", "confidence": 97.5}'::jsonb, '8f14e45fceea167a5a36dedd4bea2543add704f46fc7b3ac6470ec82e83066d2', '9e27c1a9bc3487f98eef6412140e70487372cfcf46399479b4a4cb6f200c8f58', NOW() - INTERVAL '3 days'),
('t6666666-6666-4666-8666-666666666666', 6, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'MILESTONE_APPROVED', '11111111-1111-4111-8111-111111111111', 'm1111111-1111-4111-8111-111111111111', '{"approved_amount": 2500.00}'::jsonb, '9e27c1a9bc3487f98eef6412140e70487372cfcf46399479b4a4cb6f200c8f58', '5c4e976694e823b20e0f7f329d9e60d2d34a5d89f899e527f311c629528f322d', NOW() - INTERVAL '3 days'),
('t7777777-7777-4777-8777-777777777777', 7, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'INVOICE_GENERATED', '11111111-1111-4111-8111-111111111111', 'inv11111-1111-4111-8111-111111111111', '{"paypal_invoice_id": "INV2-7XYZ-8ABC-9DEF-0123", "amount": 2500.00}'::jsonb, '5c4e976694e823b20e0f7f329d9e60d2d34a5d89f899e527f311c629528f322d', '1b9f71c4c9798e3b2e7a2b914859a16f6b5b7b9e388d7f26d24a9a08465050f4', NOW() - INTERVAL '3 days'),
('t8888888-8888-4888-8888-888888888888', 8, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'PAYMENT_CONFIRMED', '33333333-3333-4333-8333-333333333333', 'pay11111-1111-4111-8111-111111111111', '{"paypal_capture_id": "CAP-998877665544", "status": "COMPLETED", "amount": 2500.00}'::jsonb, '1b9f71c4c9798e3b2e7a2b914859a16f6b5b7b9e388d7f26d24a9a08465050f4', 'f2d87e07b587a8f1589178ec6e165f1a58eb23ebf5c88b01625904323c2a6fa8', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;
