from fastapi import FastAPI
from datetime import datetime, timezone

import os
import time

from app.api import auth, organizations, projects, users

app = FastAPI(
    title = "MyProject API",
    version = "0.1.0"
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(organizations.router)
app.include_router(projects.router) 

# Simple app start timestamp to calculate uptime
START_TIME = time.time()

@app.get ("/")
def root():
    return {"message": "MyProject API is running"}

@app.get("/health")
def health():
    """
    Health check endpoint for monitoring.
    """
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": int(time.time() - START_TIME),
    }

@app.get("/version")
def version():
    """
    Version endpoint
    if GIT_SHA is provided as an enviroment variable, it will be included.
    """
    return{
        "name": app.title,
        "version": app.version,
        "git-sha": os.getenv("GIT_SHA"),
    }