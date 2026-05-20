from fastapi import FastAPI
from pydantic import BaseModel

from config.settings import (
    settings
)

from ml.predictor import RiskPredictor
from llm.grounded_reasoner import GroundedReasoner
from agent.response_builder import ResponseBuilder


# =========================================================
# FASTAPI APP
# =========================================================
app = FastAPI(

    title=settings.APP_NAME,

    version="3.0.0"
)

# =========================================================
# ENGINES
# =========================================================
predictor = RiskPredictor()

reasoner = GroundedReasoner()

response_builder = ResponseBuilder()


# =========================================================
# REQUEST MODELS
# =========================================================
class AnalyzeRequest(BaseModel):

    domain: str

    change_type: str

    region: str

    asset_count: int

    duration_minutes: int

    is_peak_hours: bool

    is_weekend: bool

    rollback_available: bool

    has_core_asset: bool

    any_internet_facing: bool

    all_assets_redundant: bool

    max_asset_criticality: str

    asset_ids: list[str]


# =========================================================
# HEALTH CHECK
# =========================================================
@app.get("/health")
def health():

    return {

        "status": "UP",

        "service":
            settings.APP_NAME,

        "version":
            "3.0.0"
    }


# =========================================================
# ANALYZE ENDPOINT
# =========================================================
@app.post("/analyze")
def analyze_change_risk(
    request: AnalyzeRequest,
    debug: bool = False
):

    incoming_cr = request.dict()

    # =====================================================
    # PREDICTION
    # =====================================================
    prediction = predictor.predict_risk(
        incoming_cr
    )

    # =====================================================
    # GROUNDED REASONING
    # =====================================================
    reasoning = reasoner.generate_reasoning(
        prediction
    )

    # =====================================================
    # DEBUG RESPONSE
    # =====================================================
    if debug:

        response = (
            response_builder.build_debug_response(
                prediction,
                reasoning
            )
        )

    # =====================================================
    # PRODUCTION RESPONSE
    # =====================================================
    else:

        response = (
            response_builder
            .build_production_response(
                prediction,
                reasoning
            )
        )

    return response


if __name__ == "__main__":

    import uvicorn

    uvicorn.run(

        "agent.main:app",

        host="0.0.0.0",

        port=settings.APP_PORT,

        reload=True
    )
