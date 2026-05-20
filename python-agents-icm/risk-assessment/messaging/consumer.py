import json
from uuid import uuid4

from kafka import KafkaConsumer

from config.settings import (
    settings
)

from contracts.models import (
    ChangeRequestEvent
)

from ml.predictor import RiskPredictor
from llm.grounded_reasoner import GroundedReasoner
from agent.response_builder import ResponseBuilder
from persistence.repository import (
    RiskRepository
)

from messaging.producer import (
    publish_risk_assessment,
    publish_to_dlq
)

# =========================================================
# ENGINES
# =========================================================
predictor = RiskPredictor()
reasoner = GroundedReasoner()

response_builder = ResponseBuilder()
repository = RiskRepository()


def generate_correlation_id():

    return str(
        uuid4()
    )


def log_event(
    correlation_id,
    event_type,
    message
):

    print(
        {
            "correlation_id": correlation_id,
            "event_type": event_type,
            "message": message
        }
    )

# =========================================================
# CONSUMER
# =========================================================
consumer = KafkaConsumer(
    settings.CHANGE_REQUEST_TOPIC,
    bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
    auto_offset_reset="latest",
    enable_auto_commit=True,
    group_id="risk-agent-group",
    value_deserializer=lambda x:
        json.loads(x.decode("utf-8"))
)

print(
    "\nRisk Agent Kafka Consumer Started..."
)

# =========================================================
# EVENT LOOP
# =========================================================
for message in consumer:
    incoming_cr = message.value
    correlation_id = generate_correlation_id()

    try:
        validated_event = (
            ChangeRequestEvent(
                **incoming_cr
            )
        )

        incoming_cr = (
            validated_event
            .model_dump()
        )

        correlation_id = incoming_cr.get(
            "cr_id",
            correlation_id
        )

        print(
            "\nReceived Change Request Event"
        )
        print(incoming_cr)

        # =====================================================
        # PREDICTION
        # =====================================================
        prediction = predictor.predict_risk(
            incoming_cr
        )

        prediction["cr_id"] = incoming_cr["cr_id"]

        # =====================================================
        # REASONING
        # =====================================================
        reasoning = reasoner.generate_reasoning(
            prediction
        )

        # =====================================================
        # FINAL RESPONSE
        # =====================================================
        response = (
            response_builder
            .build_production_response(
                prediction,
                reasoning
            )
        )

        # =============================================
        # PERSIST
        # =============================================
        repository.save_assessment(
            response
        )

        # =====================================================
        # PUBLISH RESPONSE
        # =====================================================
        publish_risk_assessment(
            response
        )

        print(
            "\nRisk Assessment Published"
        )

    except Exception as e:
        log_event(
            correlation_id,
            "PIPELINE_FAILURE",
            str(e)
        )

        publish_to_dlq(
            incoming_cr,
            str(e)
        )

        print(
            "\nPipeline Failure:"
        )

        print(
            str(e)
        )
