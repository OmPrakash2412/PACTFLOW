import os
import re
from typing import Dict, List, Tuple
from ..config import settings


def validate_environment() -> Tuple[bool, List[str], List[str]]:
    """
    Validates environment configuration for Phase 1 requirements:
    Returns (is_valid, warnings, errors)
    """
    warnings: List[str] = []
    errors: List[str] = []

    # 1. Environment mode
    if settings.ENVIRONMENT not in ("development", "staging", "production", "test"):
        warnings.append(f"Non-standard ENVIRONMENT value: '{settings.ENVIRONMENT}'. Expected 'development', 'staging', or 'production'.")

    # 2. JWT Secret strength check
    if len(settings.JWT_SECRET) < 32:
        errors.append("JWT_SECRET must be at least 32 characters long for production security.")

    # 3. PayPal Configuration Check
    if settings.PAYPAL_ENVIRONMENT.lower() not in ("sandbox", "production", "live"):
        errors.append(f"Invalid PAYPAL_ENVIRONMENT: '{settings.PAYPAL_ENVIRONMENT}'. Must be 'sandbox' or 'production'.")

    if not settings.PAYPAL_SANDBOX_BASE_URL.startswith("https://"):
        errors.append(f"PAYPAL_SANDBOX_BASE_URL must use HTTPS: '{settings.PAYPAL_SANDBOX_BASE_URL}'")

    if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
        warnings.append("PayPal Client ID or Secret is unset in .env. Live Sandbox API calls will fallback to sandbox mock coordinator.")

    # 4. Supabase Configuration Check
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        warnings.append("SUPABASE_URL or SUPABASE_KEY unset in .env. System will persist using transactional high-speed repository store.")
    else:
        if not settings.SUPABASE_URL.startswith("https://"):
            errors.append(f"SUPABASE_URL must be a valid HTTPS URL: '{settings.SUPABASE_URL}'")

    # 5. Gemini AI Configuration Check
    if not settings.GEMINI_API_KEY:
        warnings.append("GEMINI_API_KEY is unset in .env. System will use deterministic Pydantic fallback generators.")

    is_valid = len(errors) == 0
    return is_valid, warnings, errors
