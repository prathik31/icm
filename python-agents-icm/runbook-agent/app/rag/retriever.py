from app.services.chroma_service import (
    client
)

collection = client.get_collection(
    name="runbooks"
)


def retrieve_runbooks(
    query_embedding,
    domain: str,
    change_type: str,
    top_k: int = 10
):

    results = collection.query(
        query_embeddings=[
            query_embedding
        ],
        n_results=top_k,
        where={
            "$and": [
                {
                    "domain": domain
                },
                {
                    "change_type": change_type
                }
            ]
        }
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    ids = results["ids"][0]

    unique_titles = set()

    filtered_documents = []
    filtered_metadatas = []
    filtered_ids = []

    for doc, meta, _id in zip(
        documents,
        metadatas,
        ids
    ):

        title = meta["title"]

        normalized = (
            title.lower()
            .replace("mumbai", "")
            .replace("bangalore", "")
            .replace("chennai", "")
            .replace("delhi", "")
        )

        if normalized in unique_titles:
            continue

        unique_titles.add(normalized)

        filtered_documents.append(doc)
        filtered_metadatas.append(meta)
        filtered_ids.append(_id)

        if len(filtered_documents) >= 5:
            break

    return {
        "documents": [filtered_documents],
        "metadatas": [filtered_metadatas],
        "ids": [filtered_ids]
    }