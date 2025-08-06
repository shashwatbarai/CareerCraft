"""
Job Description Analyzer Agent

A focused agent that extracts structured information from job descriptions
using LLM and validates output with Pydantic schemas. Optimized version
without LangGraph for use as a node in multiagent systems.
"""

import os
import sys
import json
from typing import Dict

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from ..models import JobDescriptionAnalysis
from ..prompts import get_jd_analyzer_prompt
from ..config import create_llm, get_schema_string

# Initialize components 
llm = create_llm(temperature=0.1)

parser = JsonOutputParser(pydantic_object=JobDescriptionAnalysis)

schema_str = json.dumps(JobDescriptionAnalysis.model_json_schema(), indent=2).replace("{", "{{").replace("}", "}}")
system_prompt = get_jd_analyzer_prompt(schema_str)

prompt_template = ChatPromptTemplate([
    ("system", system_prompt),
    ("human", "Analyze this job description: {job_description}"),
])

class JDAnalyzerAgent:
    """Job Description Analyzer Agent."""
    
    def __init__(self):
        self.llm = llm
        self.parser = parser
        self.prompt = prompt_template
    
    def analyze_job_description(self, job_description: str) -> Dict:
        """Analyze job description and return structured data."""
        try:
            response = self.llm.invoke(self.prompt.format_messages(job_description=job_description))
            parsed_response = self.parser.invoke(response.content)
            validated_analysis = JobDescriptionAnalysis(**parsed_response)
            return validated_analysis.model_dump()
        except Exception as e:
            return {"error": str(e)}
    
    async def analyze_job_description_async(self, job_description: str) -> Dict:
        """Async version of job description analysis."""
        try:
            response = await self.llm.ainvoke(self.prompt.format_messages(job_description=job_description))
            parsed_response = self.parser.invoke(response.content)
            validated_analysis = JobDescriptionAnalysis(**parsed_response)
            return validated_analysis.model_dump()
        except Exception as e:
            return {"error": str(e)}

