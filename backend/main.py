from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import auth, complaints, analytics, copilot, webhooks, wards, users
from utils.database import engine, Base
import os

app = FastAPI(title="P-CRM API", version="1.0.0")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
app.include_router(wards.router)
app.include_router(users.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
