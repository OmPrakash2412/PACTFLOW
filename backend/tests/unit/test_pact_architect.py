import pytest
from decimal import Decimal
from app.agents.pact_architect import PactArchitectAgent


@pytest.mark.asyncio
async def test_pact_architect_budget_sum_matches():
    agent = PactArchitectAgent()
    budget = Decimal("10000.00")
    agreement = await agent.draft_agreement(
        project_title="Cloud Security Infrastructure",
        requirements="Architect secure microservices and setup CI/CD pipeline",
        budget=budget,
        currency="USD"
    )

    assert agreement.title is not None
    assert len(agreement.suggested_milestones) >= 2

    # Verify that sum of milestone amounts equals total budget
    total_milestones_sum = sum(m.amount for m in agreement.suggested_milestones)
    assert total_milestones_sum == budget


@pytest.mark.asyncio
async def test_pact_architect_structured_criteria():
    agent = PactArchitectAgent()
    agreement = await agent.draft_agreement(
        project_title="Mobile Payment App",
        requirements="iOS and Android payment gateway integration with Stripe and PayPal",
        budget=Decimal("5000.00"),
        currency="USD"
    )

    assert len(agreement.acceptance_criteria) >= 2
    assert len(agreement.assumptions) >= 2
    assert len(agreement.clarification_questions) >= 1
