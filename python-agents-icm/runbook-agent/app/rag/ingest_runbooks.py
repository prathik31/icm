import os
import json
import pandas as pd

from tqdm import tqdm

from app.services.embedding_service import (
    generate_embedding
)

from app.services.chroma_service import (
    client
)


DATA_PATH = os.path.join(
    "data",
    "synthetic_runbooks.csv"
)


def build_runbook_document(row):

    pre_checks = json.loads(
        row["pre_checks"]
    )

    execution_steps = json.loads(
        row["execution_steps"]
    )

    post_checks = json.loads(
        row["post_checks"]
    )

    rollback_steps = json.loads(
        row["rollback_steps"]
    )

    text = f"""
Telecom Operational Runbook

Runbook ID:
{row['runbook_id']}

Title:
{row['title']}

Domain:
{row['domain']}

Change Type:
{row['change_type']}

Region:
{row['region']}

Pre-Validation Steps:
{chr(10).join(pre_checks)}

Execution Procedure:
{chr(10).join(execution_steps)}

Post-Change Validation:
{chr(10).join(post_checks)}

Rollback Procedure:
{chr(10).join(rollback_steps)}
"""

    return text.strip()


def ingest_runbooks():

    try:
        client.delete_collection("runbooks")
        print("Deleted old runbooks collection.")
    except:
        print("No previous collection found.")

    collection = client.get_or_create_collection(
        name="runbooks"
    )

    df = pd.read_csv(DATA_PATH)

    for _, row in tqdm(
        df.iterrows(),
        total=len(df)
    ):

        document = build_runbook_document(
            row
        )

        embedding = generate_embedding(
            document
        )

        metadata = {
            "runbook_id": str(
                row["runbook_id"]
            ),
            "title": str(
                row["title"]
            ),
            "domain": str(
                row["domain"]
            ),
            "change_type": str(
                row["change_type"]
            ),
            "region": str(
                row["region"]
            )
        }

        collection.add(
            documents=[document],
            embeddings=[embedding],
            metadatas=[metadata],
            ids=[str(row["runbook_id"])]
        )

    print(
        f"Ingested {len(df)} runbooks successfully."
    )


if __name__ == "__main__":

    ingest_runbooks()
