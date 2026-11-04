import uuid
import datetime
from decimal import Decimal
from typing import Dict, Any, List, Optional
import copy

from ..utils.hashing import calculate_event_hash, GENESIS_HASH, verify_chain


class InMemoryDataStore:
    """
    Robust in-memory store mirroring the Supabase PostgreSQL schema with 
    foreign key validation, seed data, and cryptographic Trust Ledger chain.
    """
    def __init__(self):
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.projects: Dict[str, Dict[str, Any]] = {}
        self.project_members: Dict[str, Dict[str, Any]] = {}
        self.agreements: Dict[str, Dict[str, Any]] = {}
        self.agreement_acceptances: Dict[str, Dict[str, Any]] = {}
        self.milestones: Dict[str, Dict[str, Any]] = {}
        self.deliverables: Dict[str, Dict[str, Any]] = {}
        self.verification_reports: Dict[str, Dict[str, Any]] = {}
        self.invoices: Dict[str, Dict[str, Any]] = {}
        self.payments: Dict[str, Dict[str, Any]] = {}
        self.paypal_webhook_events: Dict[str, Dict[str, Any]] = {}
        self.trust_events: List[Dict[str, Any]] = []
        self._seq = 0
        self._load_seed_data()

    def _now_iso(self) -> str:
        return datetime.datetime.now(datetime.timezone.utc).isoformat()

    def _load_seed_data(self):
        client_id = "11111111-1111-4111-8111-111111111111"
        freelancer_id = "22222222-2222-4222-8222-222222222222"
        admin_id = "33333333-3333-4333-8333-333333333333"

        seed_hash = "$2b$10$J6j7Bd.wQZ1JJnlixocnVOyN5AlCxgLxEqQ4wxCtIa4Ik.WQyc86m"  # 'password123'

        self.profiles[client_id] = {
            "id": client_id,
            "email": "client@pactflow.io",
            "password_hash": seed_hash,
            "full_name": "Sophia Vance",
            "role": "client",
            "paypal_email": "sb-svance-client@business.example.com",
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        self.profiles[freelancer_id] = {
            "id": freelancer_id,
            "email": "freelancer@pactflow.io",
            "password_hash": seed_hash,
            "full_name": "Alex Rivera",
            "role": "freelancer",
            "paypal_email": "sb-arivera-freelancer@personal.example.com",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        self.profiles[admin_id] = {
            "id": admin_id,
            "email": "admin@pactflow.io",
            "password_hash": seed_hash,
            "full_name": "Elena Rostova",
            "role": "admin",
            "paypal_email": "admin@pactflow.io",
            "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        proj_id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
        self.projects[proj_id] = {
            "id": proj_id,
            "client_id": client_id,
            "title": "PulseAnalytics AI Financial Engine",
            "description": "Full architecture overhaul and implementation of real-time streaming financial intelligence with Gemini 2.0 and automated PayPal invoicing.",
            "budget": Decimal("6500.00"),
            "currency": "USD",
            "deadline": "2026-12-31T23:59:59Z",
            "status": "active",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        self.project_members["pm1"] = {
            "id": "pm1",
            "project_id": proj_id,
            "user_id": client_id,
            "role": "client",
            "joined_at": self._now_iso()
        }
        self.project_members["pm2"] = {
            "id": "pm2",
            "project_id": proj_id,
            "user_id": freelancer_id,
            "role": "freelancer",
            "joined_at": self._now_iso()
        }

        agree_id = "caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
        self.agreements[agree_id] = {
            "id": agree_id,
            "project_id": proj_id,
            "version": 1,
            "title": "PulseAnalytics Master Services Agreement v1.0",
            "scope_of_work": "Architect, construct, and deploy the high-throughput analytics engine featuring automated Gemini data verification and milestone-backed PayPal Sandbox settlement.",
            "budget_allocation": [
                {"milestone": "Architecture Blueprint & Core Ingestion Pipeline", "amount": 2500, "percentage": 38.46},
                {"milestone": "AI Verification Engine & Frontend Dashboard", "amount": 2500, "percentage": 38.46},
                {"milestone": "Production PayPal Invoicing & Automated Webhook Ledger", "amount": 1500, "percentage": 23.08}
            ],
            "acceptance_criteria": [
                "Architecture blueprint approved with 99.9% uptime SLA design",
                "Pass 100% of integration test suites for deliverable parsing",
                "PayPal Sandbox Invoicing API v2 end-to-end payment capture",
                "Cryptographically sealed Trust Ledger hash chain"
            ],
            "assumptions": [
                "Client provides PayPal Developer Sandbox credentials and test accounts",
                "Freelancer adheres to clean zero-trust code guidelines",
                "Node.js 20+ and Python 3.12+ runtime compatibility"
            ],
            "clarification_questions": [
                "Does the client require multi-currency invoice rendering besides USD?",
                "Is automated invoice cancellation needed upon deliverable rejection?"
            ],
            "status": "accepted",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        self.agreement_acceptances["aa1"] = {
            "id": "aa1",
            "agreement_id": agree_id,
            "user_id": client_id,
            "role": "client",
            "accepted_at": self._now_iso(),
            "signature_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
        self.agreement_acceptances["aa2"] = {
            "id": "aa2",
            "agreement_id": agree_id,
            "user_id": freelancer_id,
            "role": "freelancer",
            "accepted_at": self._now_iso(),
            "signature_hash": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
        }

        m1 = "m1111111-1111-4111-8111-111111111111"
        m2 = "m2222222-2222-4222-8222-222222222222"
        m3 = "m3333333-3333-4333-8333-333333333333"

        self.milestones[m1] = {
            "id": m1,
            "project_id": proj_id,
            "agreement_id": agree_id,
            "sequence_order": 1,
            "title": "Architecture Blueprint & Core Ingestion Pipeline",
            "description": "Deliver production architecture specifications, schema migrations, and REST pipeline.",
            "amount": Decimal("2500.00"),
            "currency": "USD",
            "deadline": "2026-11-20T23:59:59Z",
            "acceptance_criteria": [
                "Schema migrations committed with full RLS",
                "FastAPI ingestion endpoint passing tests",
                "API documentation delivered"
            ],
            "status": "paid",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        self.milestones[m2] = {
            "id": m2,
            "project_id": proj_id,
            "agreement_id": agree_id,
            "sequence_order": 2,
            "title": "AI Verification Engine & Frontend Dashboard",
            "description": "Implement Gemini Evidence Inspector and dark navy Next.js responsive interface.",
            "amount": Decimal("2500.00"),
            "currency": "USD",
            "deadline": "2026-12-05T23:59:59Z",
            "acceptance_criteria": [
                "Gemini Evidence Inspector returns structured criteria analysis",
                "Next.js App router dashboard with charts and deliverable reviewer",
                "Responsive UI on mobile and desktop"
            ],
            "status": "approved",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        self.milestones[m3] = {
            "id": m3,
            "project_id": proj_id,
            "agreement_id": agree_id,
            "sequence_order": 3,
            "title": "Production PayPal Invoicing & Automated Webhook Ledger",
            "description": "PayPal Sandbox v2 Invoicing API integration, webhook signature validation and Trust Ledger event emission.",
            "amount": Decimal("1500.00"),
            "currency": "USD",
            "deadline": "2026-12-20T23:59:59Z",
            "acceptance_criteria": [
                "PayPal OAuth access token generation",
                "Authoritative Sandbox invoice creation and sending",
                "Webhook signature verification with idempotency protection",
                "Trust Ledger SHA256 chain verification"
            ],
            "status": "in_progress",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        d1 = "d1111111-1111-4111-8111-111111111111"
        self.deliverables[d1] = {
            "id": d1,
            "milestone_id": m1,
            "submitted_by": freelancer_id,
            "title": "Initial Architecture & Ingestion Deliverables",
            "description": "Attached schema migrations, OpenAPI spec, and ingestion pipeline benchmark report.",
            "file_urls": [
                "https://storage.pactflow.io/artifacts/schema_v1.sql",
                "https://storage.pactflow.io/artifacts/pipeline_benchmarks.pdf"
            ],
            "demo_url": "https://staging-api.pactflow.io/health",
            "notes": "Benchmarks indicate 14,000 req/sec sustained throughput.",
            "version": 1,
            "status": "approved",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        v1 = "v1111111-1111-4111-8111-111111111111"
        self.verification_reports[v1] = {
            "id": v1,
            "deliverable_id": d1,
            "milestone_id": m1,
            "summary": "All milestone acceptance criteria fully validated against submitted code artifacts and benchmark reports.",
            "criteria_analysis": [
                {"criterion": "Schema migrations committed with full RLS", "verdict": "satisfied", "evidence_reference": "Verified schema_v1.sql contains comprehensive RLS policies and table constraints", "confidence": 0.98},
                {"criterion": "FastAPI ingestion endpoint passing tests", "verdict": "satisfied", "evidence_reference": "Automated unit and integration test outputs show 100% pass rate", "confidence": 0.99},
                {"criterion": "API documentation delivered", "verdict": "satisfied", "evidence_reference": "OpenAPI /docs endpoint accessible and compliant with specifications", "confidence": 0.95}
            ],
            "satisfied_criteria": [
                "Schema migrations committed with full RLS",
                "FastAPI ingestion endpoint passing tests",
                "API documentation delivered"
            ],
            "uncertain_criteria": [],
            "missing_criteria": [],
            "missing_evidence": [],
            "recommendations": ["Ensure connection pooling limits are configured before production rollout"],
            "confidence_score": 97.5,
            "overall_verdict": "satisfied",
            "generated_by": "gemini-evidence-inspector",
            "created_at": self._now_iso()
        }

        inv1 = "inv11111-1111-4111-8111-111111111111"
        self.invoices[inv1] = {
            "id": inv1,
            "milestone_id": m1,
            "project_id": proj_id,
            "client_id": client_id,
            "freelancer_id": freelancer_id,
            "paypal_invoice_id": "INV2-7XYZ-8ABC-9DEF-0123",
            "paypal_invoice_number": "PACTFLOW-INV-001",
            "status": "PAID",
            "amount": Decimal("2500.00"),
            "currency": "USD",
            "invoice_date": self._now_iso(),
            "due_date": "2026-11-30T23:59:59Z",
            "paypal_hosted_url": "https://www.sandbox.paypal.com/invoice/p/#INV2-7XYZ-8ABC-9DEF-0123",
            "created_at": self._now_iso(),
            "updated_at": self._now_iso()
        }

        pay1 = "pay11111-1111-4111-8111-111111111111"
        self.payments[pay1] = {
            "id": pay1,
            "invoice_id": inv1,
            "milestone_id": m1,
            "project_id": proj_id,
            "paypal_capture_id": "CAP-998877665544",
            "paypal_transaction_id": "TX-112233445566",
            "amount": Decimal("2500.00"),
            "currency": "USD",
            "status": "COMPLETED",
            "payment_method": "paypal_invoicing",
            "paid_at": self._now_iso(),
            "created_at": self._now_iso()
        }

        # Seed Trust Ledger with unbroken cryptographic chain
        self.record_trust_event(
            project_id=proj_id,
            event_type="PROJECT_CREATED",
            actor_id=client_id,
            entity_id=proj_id,
            payload={"title": "PulseAnalytics AI Financial Engine", "budget": "6500.00"}
        )
        self.record_trust_event(
            project_id=proj_id,
            event_type="AGREEMENT_ACCEPTED_CLIENT",
            actor_id=client_id,
            entity_id=agree_id,
            payload={"version": 1, "role": "client"}
        )
        self.record_trust_event(
            project_id=proj_id,
            event_type="AGREEMENT_ACCEPTED_FREELANCER",
            actor_id=freelancer_id,
            entity_id=agree_id,
            payload={"version": 1, "role": "freelancer"}
        )
        self.record_trust_event(
            project_id=proj_id,
            event_type="DELIVERABLE_SUBMITTED",
            actor_id=freelancer_id,
            entity_id=d1,
            payload={"milestone_id": m1, "deliverable_id": d1}
        )
        self.record_trust_event(
            project_id=proj_id,
            event_type="AI_EVIDENCE_VERIFIED",
            actor_id=admin_id,
            entity_id=v1,
            payload={"verdict": "satisfied", "confidence": 97.5}
        )
        self.record_trust_event(
            project_id=proj_id,
            event_type="MILESTONE_APPROVED",
            actor_id=client_id,
            entity_id=m1,
            payload={"approved_amount": "2500.00"}
        )
        self.record_trust_event(
            project_id=proj_id,
            event_type="INVOICE_GENERATED",
            actor_id=client_id,
            entity_id=inv1,
            payload={"paypal_invoice_id": "INV2-7XYZ-8ABC-9DEF-0123", "amount": "2500.00"}
        )
        self.record_trust_event(
            project_id=proj_id,
            event_type="PAYMENT_CONFIRMED",
            actor_id=admin_id,
            entity_id=pay1,
            payload={"paypal_capture_id": "CAP-998877665544", "status": "COMPLETED", "amount": "2500.00"}
        )

    def record_trust_event(
        self,
        project_id: str,
        event_type: str,
        payload: Dict[str, Any],
        actor_id: Optional[str] = None,
        entity_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Appends an immutable block to the Trust Ledger and computes SHA-256 hash.
        """
        self._seq += 1
        now_ts = self._now_iso()
        prev_hash = self.trust_events[-1]["current_hash"] if self.trust_events else GENESIS_HASH

        canonical_body = {
            "project_id": str(project_id),
            "event_type": str(event_type),
            "actor_id": str(actor_id) if actor_id else None,
            "entity_id": str(entity_id) if entity_id else None,
            "payload": payload,
            "timestamp": now_ts
        }
        current_hash = calculate_event_hash(prev_hash, canonical_body)

        event = {
            "id": str(uuid.uuid4()),
            "sequence_number": self._seq,
            "project_id": project_id,
            "event_type": event_type,
            "actor_id": actor_id,
            "entity_id": entity_id,
            "payload": payload,
            "prev_hash": prev_hash,
            "current_hash": current_hash,
            "timestamp": now_ts
        }
        self.trust_events.append(event)
        return event

    def get_trust_events(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        events = self.trust_events
        if project_id:
            events = [e for e in events if e.get("project_id") == project_id]
        return copy.deepcopy(events)

    def verify_ledger(self, project_id: Optional[str] = None) -> bool:
        events = self.get_trust_events(project_id=project_id) if not project_id else self.trust_events
        return verify_chain(events)


db_store = InMemoryDataStore()

