from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os

class DatabaseService:
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
        
    async def connect(self):
        try:
            mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
            self.client = AsyncIOMotorClient(mongo_url)
            self.db = self.client.resume_agent
            self.collection = self.db.workflow_results
            # Test connection
            await self.client.admin.command('ping')
            print("Database connected successfully")
        except Exception as e:
            print(f"Database connection failed: {e}")
            self.client = None
            self.db = None
            self.collection = None
            raise
        
    async def disconnect(self):
        if self.client:
            self.client.close()
    
    async def save_workflow_result(self, data: dict) -> str:
        """Save workflow result to MongoDB"""
        data["timestamp"] = datetime.now(timezone.utc)
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

db_service = DatabaseService()