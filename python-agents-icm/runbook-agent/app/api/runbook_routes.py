from fastapi import APIRouter
from fastapi import HTTPException

from app.models.runbook_request import (
    RunbookRequest
)

from app.models.runbook_response import (
    RunbookResponse
)

from app.rag.generator import (
    generate_runbook
)

router = APIRouter()


@router.post(
    "/generate",
    response_model=RunbookResponse
)
async def generate_runbook_api(
    request: RunbookRequest
):

    try:

        response = generate_runbook(
            request
        )

        return response

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
