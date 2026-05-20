def build_context(results):

    documents = results["documents"][0]

    metadatas = results["metadatas"][0]

    context_parts = []

    source_titles = []

    for doc, meta in zip(
        documents,
        metadatas
    ):

        context_parts.append(doc)

        source_titles.append({

            "runbook_id":
                meta["runbook_id"],

            "title":
                meta["title"],

            "domain":
                meta["domain"],

            "change_type":
                meta["change_type"]
        })

    context = "\n\n".join(
        context_parts
    )

    return context, source_titles
