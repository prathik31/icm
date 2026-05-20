from fastapi import APIRouter

from app.models.runbook import (
    GenerateRequest,
    RunbookOutput
)

from app.services.embedding_service import (
    generate_embedding
)

from app.rag.retriever import retrieve_similar

from app.rag.context_builder import build_context

from app.services.grok_service import (
    generate_runbook
)

router = APIRouter()


@router.post(
    "/generate",
    response_model=RunbookOutput
)
async def generate(req: GenerateRequest):

    query_text = (
        f"{req.domain} "
        f"{req.change_type} "
        f"{req.description}"
    )

    embedding = generate_embedding(query_text)

    matches = retrieve_similar(
        embedding,
        req.domain
    )

    context, source_ids = build_context(matches)

    prompt = f"""
Change Request:

Title: {req.title}

Description:
{req.description}

Domain:
{req.domain}

Change Type:
{req.change_type}

Region:
{req.region}

Risk:
{req.risk_level}

Recommendations:
{req.recommendations}

Similar Runbooks:
{context}

Generate a telecom-grade operational runbook.
"""

    result = generate_runbook(prompt)

    result["rag_sources"] = source_ids

    return result
