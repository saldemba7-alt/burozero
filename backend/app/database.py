from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.process import Process
from app.models.alert import Alert
from app.models.user import User
import os

DATABASE_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME      = os.getenv("DB_NAME", "burozero")

client: AsyncIOMotorClient = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(DATABASE_URL)
    await init_beanie(
        database=client[DB_NAME],
        document_models=[Process, Alert, User]
    )
    print(f"✅ MongoDB conectado: {DB_NAME}")

async def disconnect_db():
    if client:
        client.close()
