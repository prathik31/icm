from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

from config.settings import (
    settings
)


# =========================================================
# MYSQL CONFIG
# =========================================================
DATABASE_URL = settings.MYSQL_URL

# =========================================================
# ENGINE
# =========================================================
engine = create_engine(

    DATABASE_URL,

    echo=False
)

# =========================================================
# SESSION
# =========================================================
SessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=engine
)

# =========================================================
# BASE
# =========================================================
Base = declarative_base()
