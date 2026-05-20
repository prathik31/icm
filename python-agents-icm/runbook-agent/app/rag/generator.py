from datetime import datetime

from app.services.embedding_service import (
    generate_embedding
)

from app.rag.retriever import (
    retrieve_runbooks
)

from app.rag.context_builder import (
    build_context
)

from app.services.groq_service import (
    generate_runbook_response
)

from app.services.inventory_service import (
    get_asset_details
)

from app.services.post_processor import (
    recursively_clean
)

from app.services.topology_service import (
    build_topology_summary,
    build_vendor_guidance
)


def generate_runbook(
    request
):

    retrieval_query = f"""
    {request.title}

    {request.description}

    Domain: {request.domain}

    Change Type: {request.change_type}

    Region: {request.region}
    """

    embedding = generate_embedding(
        retrieval_query
    )

    retrieval_results = retrieve_runbooks(
        embedding,
        domain=request.domain,
        change_type=request.change_type
    )

    rag_context, rag_sources = (
        build_context(
            retrieval_results
        )
    )

    asset_details = get_asset_details(
        request.asset_ids
    )

    topology_summary = build_topology_summary(
        asset_details
    )

    vendor_guidance = build_vendor_guidance(
        asset_details
    )

    llm_response = (
        generate_runbook_response(
            request.dict(),
            rag_context,
            topology_summary,
            vendor_guidance
        )
    )

    llm_response = recursively_clean(
        llm_response,
        asset_details
    )

    final_response = {
        "runbook_id":
            f"RB-{request.cr_id[:8]}",

        "cr_id":
            request.cr_id,

        "generated_at":
            datetime.utcnow().isoformat(),

        "title":
            llm_response["title"],

        "estimated_duration_mins":
            llm_response[
                "estimated_duration_mins"
            ],

        "risk_level":
            request.risk_assessment.risk_level,

        "blast_radius":
            request.risk_assessment.blast_radius,

        "risk_notes":
            llm_response["risk_notes"],

        "pre_checks":
            llm_response["pre_checks"],

        "execution_steps":
            llm_response["execution_steps"],

        "validation_steps":
            llm_response["validation_steps"],

        "rollback_steps":
            llm_response["rollback_steps"],

        "monitoring_guidance":
            llm_response[
                "monitoring_guidance"
            ],

        "escalation_conditions":
            llm_response[
                "escalation_conditions"
            ],

        "rag_sources":
            rag_sources,

        "generated_by":
            "llama-3.3-70b-versatile"
    }

    return final_response
