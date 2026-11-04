import pytest
from app.utils.env_validator import validate_environment
from app.config import settings


def test_environment_validation_default():
    is_valid, warnings, errors = validate_environment()
    # Default settings must have valid JWT and sandbox URL configuration
    assert is_valid is True
    assert len(errors) == 0
    assert settings.PAYPAL_SANDBOX_BASE_URL == "https://api-m.sandbox.paypal.com"
    assert len(settings.JWT_SECRET) >= 32


def test_cors_origins_configuration():
    origins = settings.cors_origins
    assert isinstance(origins, list)
    assert any("localhost:3000" in o for o in origins)
