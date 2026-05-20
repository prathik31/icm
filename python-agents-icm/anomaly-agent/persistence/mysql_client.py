from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


class MySQLClient:
    def __init__(self, database_url: str) -> None:
        self.database_url = database_url
        self.engine: Engine = create_engine(self.database_url, future=True, echo=False)

    def get_engine(self) -> Engine:
        return self.engine
