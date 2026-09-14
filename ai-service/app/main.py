from fastapi import FastAPI
from app.api.routes.health import router as health_router
from app.api.routes.ingestion import router as ingestion_router

app = FastAPI(
    title="KnowledgeHub AI Service",
    version="1.0.0",
)

app.include_router(
    health_router,
    prefix="/api/health",
    tags=["Health"],
)

app.include_router(
    ingestion_router,
    prefix="/api/ingestion",
    tags=["Ingestion"],
)


@app.get("/")
async def root():
    return {
        "message": "KnowledgeHub AI Service",
        "status": "running",
    }