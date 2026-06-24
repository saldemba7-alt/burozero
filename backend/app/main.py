from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import processes, alerts, calendar, auth
from app.database import connect_db, disconnect_db
from app.scheduler import setup_scheduler

app = FastAPI(title="BuroZero API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()
    setup_scheduler()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(processes.router, prefix="/api/processes", tags=["Processes"])
app.include_router(alerts.router,    prefix="/api/alerts",    tags=["Alerts"])
app.include_router(calendar.router,  prefix="/api/calendar",  tags=["Calendar"])

@app.get("/")
async def root():
    return {"status": "ok", "app": "BuroZero", "version": "1.1.0"}
