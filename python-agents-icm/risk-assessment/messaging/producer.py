import json
import uuid

from kafka import KafkaProducer

from config.settings import (
    settings
)

from contracts.models import (
    RiskAssessmentEvent
)


producer = KafkaProducer(

    bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,

    value_serializer=lambda v:
        json.dumps(v).encode("utf-8")
)


def publish_risk_assessment(
    assessment
):

    assessment["assessment_id"] = assessment.get(
        "assessment_id",
        str(uuid.uuid4())
    )

    validated_payload = (
        RiskAssessmentEvent(
            **assessment
        )
    )

    assessment = (
        validated_payload
        .model_dump()
    )

    # Producer payload should use only camelCase contract fields.
    assessment["assessmentId"] = assessment.get("assessmentId")
    assessment["crId"] = assessment.get("crId")
    assessment["riskScore"] = assessment.get("riskScore")
    assessment["riskLevel"] = assessment.get("riskLevel")
    assessment["blastRadius"] = assessment.get("blastRadius")
    assessment["confidence"] = assessment.get("confidence")
    assessment["executiveSummary"] = assessment.get("executiveSummary")
    assessment["technicalAnalysis"] = assessment.get("technicalAnalysis")
    assessment["cabGuidance"] = assessment.get("cabGuidance")
    assessment["recommendations"] = assessment.get("recommendations")
    assessment["riskIndicators"] = assessment.get("riskIndicators")
    assessment["generatedAt"] = assessment.get("generatedAt")
    assessment["groundingEvidence"] = assessment.get("groundingEvidence")
    assessment["modelMetadata"] = assessment.get("modelMetadata")

    # Remove any possible legacy snake_case fields.
    for legacy_key in [
        "assessment_id",
        "cr_id",
        "risk_score",
        "risk_level",
        "blast_radius",
        "executive_summary",
        "technical_analysis",
        "cab_guidance",
        "risk_indicators",
        "grounding_evidence",
        "model_metadata",
        "generated_at"
    ]:
        assessment.pop(legacy_key, None)

    print(
        "\nPublishing AI Risk Event"
    )

    print(
        "Sample payload:"
    )

    print(
        json.dumps(
            assessment,
            indent=2
        )
    )

    future = producer.send(
        settings.RISK_ASSESSMENT_TOPIC,
        assessment
    )

    try:
        metadata = future.get(timeout=10)
        producer.flush()

        print(
            f"\nPublished Risk Assessment Event to topic={metadata.topic} "
            f"partition={metadata.partition} offset={metadata.offset}"
        )
    except Exception as exc:
        print(
            f"\nFailed to publish risk assessment event: {exc}"
        )
        raise


def publish_to_dlq(
    failed_event,
    error_message
):

    payload = {
        "failed_event":
            failed_event,
        "error":
            error_message
    }

    producer.send(
        settings.DLQ_TOPIC,
        payload
    )

    producer.flush()

    print(
        "\nPublished event to DLQ"
    )
