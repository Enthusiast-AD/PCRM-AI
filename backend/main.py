from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, complaints, analytics, copilot, webhooks
from utils.database import engine, Base

app = FastAPI(title="P-CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(analytics.router)
app.include_router(copilot.router)
app.include_router(webhooks.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
