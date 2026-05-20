from persistence.db import (
    engine
)

from persistence.models import Base


Base.metadata.create_all(
    bind=engine
)

print(
    "\nDatabase tables created successfully"
)
