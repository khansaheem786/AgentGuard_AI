from fastapi import FastAPI
from app.api import opspilot
from app.api import tests
from app.api import scenarios
from app.api import evaluation
from app.api import multistep
from app.api import replay
from fastapi.middleware.cors import CORSMiddleware
from app.api import reports

app = FastAPI(
    title="AgentGuard_AI",
    description="AI Agent Evaluation & Reliability Engine",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    opspilot.router,
    prefix="/api/opspilot",
    tags=["OpsPilot"]
)

app.include_router(
    tests.router,
    prefix="/api/tests",
    tags=["Test Runner"],
)

app.include_router(
    scenarios.router,
    prefix="/api/scenarios",
    tags=["Scenario Engine"],
)

app.include_router(
    evaluation.router,
    prefix="/api/evaluation",
    tags=["Evaluation"],
)

app.include_router(multistep.router)

app.include_router(replay.router)

app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "project": "AgentGuard_AI",
        "message": "Backend is running",
        "status": "online"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
