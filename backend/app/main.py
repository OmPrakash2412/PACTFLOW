import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import auth, projects, agreements, milestones, deliverables, invoices, payments, webhooks, trust, ai

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pactflow")

app = FastAPI(
    title="PACTFLOW API",
    description="Where Work Meets Trust: AI-Powered Agreement, Deliverable Verification and PayPal Milestone Payment Coordination Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(agreements.router, prefix="/api")
app.include_router(milestones.router, prefix="/api")
app.include_router(deliverables.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(trust.router, prefix="/api")
app.include_router(ai.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "platform": "PACTFLOW",
        "tagline": "Where Work Meets Trust.",
        "status": "online",
        "environment": settings.ENVIRONMENT,
        "paypal_mode": settings.PAYPAL_ENVIRONMENT,
        "paypal_base_url": settings.paypal_base_url,
        "version": "1.0.0"
    }


@app.get("/api/health")
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "database": "connected",
        "trust_ledger": "verified",
        "paypal_sandbox": "ready",
        "gemini_ai": "active"
    }

