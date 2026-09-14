from fastapi import FastAPI

from app.api.routes.health import router as health_router

app = FastAPI(
    title="KnowledgeHub AI Service",
    version="1.0.0",
)

app.include_router(
    health_router,
    prefix="/api/health",
    tags=["Health"],
)


@app.get("/")
async def root():
    return {
        "message": "KnowledgeHub AI Service",
        "status": "running",
    }