import chromadb

from app.core.config import settings


class _FallbackCollection:

    def query(self, *args, **kwargs):
        return {
            "documents": [[]],
            "metadatas": [[]],
            "ids": [[]]
        }


class _FallbackClient:

    def get_collection(self, name: str):
        return _FallbackCollection()


try:
    client = chromadb.PersistentClient(
        path=settings.CHROMA_DB_DIR
    )
except BaseException:
    client = _FallbackClient()
