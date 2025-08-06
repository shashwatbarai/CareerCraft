"""
Simplified Resume Tailor Agent

A streamlined agent that tailors resumes to job requirements.
"""

import os
import json
import re
from typing import Dict, List

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from ..models import ResumeSection, TailoredResume
from ..prompts import get_resume_tailor_prompt
from ..config import create_llm, get_schema_string

# Initialize LLM
llm = create_llm(temperature=0.3)

def extract_sections(text: str) -> List[ResumeSection]:
    """Extract resume sections."""
    sections = []
    pattern = r'^\s*(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|SUMMARY|INTERNSHIPS|EXTRACURRICULAR|CERTIFICATIONS)\s*$'
    
    lines = text.split('\n')
    current_section = None
    current_content = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if re.match(pattern, line, re.IGNORECASE):
            if current_section and current_content:
                sections.append(ResumeSection(title=current_section, content='\n'.join(current_content)))
            current_section = line
            current_content = []
        elif current_section:
            current_content.append(line)
    
    if current_section and current_content:
        sections.append(ResumeSection(title=current_section, content='\n'.join(current_content)))
    
    return sections

def analyze_skills(resume_text: str, required_skills: List[str]) -> Dict:
    """Analyze skill matching."""
    resume_lower = resume_text.lower()
    matched = [skill for skill in required_skills if skill.lower() in resume_lower]
    missing = [skill for skill in required_skills if skill.lower() not in resume_lower]
    match_percentage = (len(matched) / len(required_skills) * 100) if required_skills else 0
    
    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage
    }



class ResumeTailorAgent:
    """Simplified resume tailoring agent."""
    
    def __init__(self):
        self.parser = JsonOutputParser(pydantic_object=TailoredResume)
        schema_str = get_schema_string(TailoredResume)
        
        self.prompt = ChatPromptTemplate([
            ("system", get_resume_tailor_prompt(schema_str)),
            ("human", "Tailor this resume:\n\nRESUME:\n{resume}\n\nJOB ANALYSIS:\n{job_analysis}\n\nSKILL ANALYSIS:\n{skill_analysis}\n\nSECTIONS:\n{sections}")
        ])
    
    async def tailor_resume_async(self, original_resume: str, jd_analysis: Dict) -> Dict:
        """Async version of tailor_resume."""
        if not original_resume or not original_resume.strip():
            raise ValueError("Original resume cannot be empty")
        
        if not jd_analysis:
            raise ValueError("Job description analysis cannot be empty")
        
        try:
            # Extract sections for context
            sections = extract_sections(original_resume)
            
            # Analyze skills for context
            hard_skills = jd_analysis.get("hard_skills", [])
            soft_skills = jd_analysis.get("soft_skills", [])
            all_skills = hard_skills + soft_skills
            skill_analysis = analyze_skills(original_resume, all_skills)
            
            # AI-powered tailoring
            response = await llm.ainvoke(self.prompt.format_messages(
                resume=original_resume,
                job_analysis=json.dumps(jd_analysis, indent=2),
                skill_analysis=json.dumps(skill_analysis, indent=2),
                sections=json.dumps([{"title": s.title, "content": s.content} for s in sections], indent=2)
            ))
            
            parsed_response = self.parser.invoke(response.content)
            validated_resume = TailoredResume(**parsed_response)
            
            return validated_resume.model_dump()
            
        except Exception as e:
            raise ValueError(f"Resume tailoring failed: {str(e)}")

