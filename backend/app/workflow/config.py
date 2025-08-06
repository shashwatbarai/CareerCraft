"""
Centralized configuration and utilities for the multiagent system.
"""

import os
import sys
import json
from typing import Type, Optional, Callable, Dict
from dotenv import load_dotenv
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment 
load_dotenv()

# Set LangSmith configuration
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY", "")
os.environ["LANGSMITH_TRACING"] = "true"

def create_llm(temperature: float = 0.1) -> ChatGoogleGenerativeAI:
    """Create a ChatGoogleGenerativeAI instance with consistent configuration."""
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=temperature,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

def get_schema_string(model: Type[BaseModel]) -> str:
    """Get formatted JSON schema string for Pydantic model."""
    return json.dumps(
        model.model_json_schema(), 
        indent=2
    ).replace("{", "{{").replace("}", "}}")

async def handle_callback(callback: Optional[Callable], data: Dict) -> None:
    """Handle optional callback execution."""
    if callback:
        await callback(data)