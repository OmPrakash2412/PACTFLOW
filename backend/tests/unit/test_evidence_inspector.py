import pytest
from app.agents.evidence_inspector import EvidenceInspectorAgent


@pytest.mark.asyncio
async def test_evidence_inspector_honest_screenshot_limitation():
    agent = EvidenceInspectorAgent()
    criteria = ["Automated test coverage above 90%", "Live interactive responsive web portal"]

    # Submission only contains a png screenshot
    report = await agent.evaluate_deliverable(
        milestone_title="Frontend & Testing",
        milestone_criteria=criteria,
        deliverable_title="Screenshot upload",
        deliverable_description="Here is a screenshot of the page.",
        file_urls=["https://storage.pactflow.io/mockup.png"],
        demo_url=None,
        notes="Looks great"
    )

    # Must NOT claim test coverage is satisfied solely from a screenshot
    test_eval = next(c for c in report.criteria_analysis if "test" in c.criterion.lower())
    assert test_eval.verdict in ("uncertain", "missing")
    assert report.overall_verdict != "satisfied"
    assert len(report.missing_evidence) > 0


@pytest.mark.asyncio
async def test_evidence_inspector_satisfied_with_complete_artifacts():
    agent = EvidenceInspectorAgent()
    criteria = [
        "Deploy staging API endpoint",
        "Deliver benchmark reports and test logs"
    ]

    report = await agent.evaluate_deliverable(
        milestone_title="Core API Staging",
        milestone_criteria=criteria,
        deliverable_title="API v1 with Benchmarks",
        deliverable_description="Deployed staging cluster passing all regression tests with 10,000 req/sec benchmark.",
        file_urls=["https://storage.pactflow.io/benchmarks.pdf", "https://storage.pactflow.io/test_run.log"],
        demo_url="https://api-staging.example.com",
        notes="Automated test suite passing 100% of integration checks."
    )

    assert report.overall_verdict == "satisfied"
    assert report.confidence_score >= 85.0
    assert len(report.satisfied_criteria) == 2
