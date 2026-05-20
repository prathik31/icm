import hashlib

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

from app.core.config import settings


model = None

if SentenceTransformer is not None:
    model = SentenceTransformer(
        settings.EMBED_MODEL
    )


def _fallback_embedding(text: str, dimensions: int = 384):
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    embedding = []

    for index in range(dimensions):
        byte_value = digest[index % len(digest)]
        embedding.append((byte_value / 255.0) * 2.0 - 1.0)

    return embedding


def generate_embedding(text: str):

    if model is None:
        return _fallback_embedding(text)

    embedding = model.encode(text)

    return embedding.tolist()
