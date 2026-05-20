from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .dependencies import attach_components
from .routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    attach_components(app)
    yield
    producer = getattr(app.state, "kafka_producer", None)
    if producer is not None:
        producer.close()


app = FastAPI(
    title="Anomaly Agent",
    description="Telecom KPI anomaly detection microservice",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
