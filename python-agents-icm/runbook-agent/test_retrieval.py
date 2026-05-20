from app.services.embedding_service import (
    generate_embedding
)

from app.rag.retriever import (
    retrieve_runbooks
)

from app.rag.context_builder import (
    build_context
)


query = """
Upgrade firmware on WAN edge router
with rollback validation
"""


embedding = generate_embedding(
    query
)


results = retrieve_runbooks(
    embedding,
    domain="NETWORK",
    change_type="STANDARD"
)


context, sources = build_context(
    results
)


print("\n===== SOURCES =====\n")

print(sources)


print("\n===== CONTEXT =====\n")

print(context[:4000])