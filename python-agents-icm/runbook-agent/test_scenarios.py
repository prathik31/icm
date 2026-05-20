from pprint import pprint

from app.models.runbook_request import (
    RunbookRequest
)

from app.rag.generator import (
    generate_runbook
)


request = RunbookRequest(

    cr_id="581ee4d5-991d-481f-a386-fa3a0e160696",

    title="Core Router Upgrade",

    description="""
    Upgrade WAN edge routers
    from IOS-XE 17.3 to IOS-XE 17.9
    with rollback support.
    """,

    domain="NETWORK",

    change_type="STANDARD",

    region="Mumbai",

    scheduled_start="2026-05-18T22:00:00",

    scheduled_end="2026-05-18T23:30:00",

    rollback_available=True,

    business_justification="""
    Critical firmware patching
    for security vulnerability remediation.
    """,

    asset_ids=[
        "RTR-CORE-MUM-001",
        "RTR-EDGE-MUM-002"
    ],

    risk_assessment={

        "risk_score": 72.89,

        "risk_level": "HIGH",

        "blast_radius": "REGIONAL",

        "confidence": 0.91,

        "recommendations": [
            "Validate rollback readiness",
            "Perform KPI monitoring",
            "Engage NOC during execution"
        ],

        "risk_indicators": [
            "HIGH_CORE_INFRA_EXPOSURE",
            "HIGH_OUTAGE_CORRELATION"
        ]
    }
)

response = generate_runbook(
    request
)

pprint(response)
