"""
Cover Letter Generator Agent

A focused agent that generates compelling cover letters based on tailored resumes
and job description analysis, emphasizing key skills and achievements.
"""

import os
import json
import sys
from typing import Dict

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from ..models import CoverLetter
from ..prompts import get_cover_letter_prompt
from ..config import create_llm, get_schema_string

# Initialize LLM
llm = create_llm(temperature=0.4)

def extract_candidate_info(tailored_resume: Dict) -> Dict:
    """Extract candidate information from tailored resume."""
    sections = tailored_resume.get("sections", [])
    candidate_info = {
        "name": "Candidate",
        "experience": [],
        "skills": tailored_resume.get("highlighted_skills", []),
        "education": "",
        "projects": []
    }
    
    for section in sections:
        title = section.get("title", "").lower()
        content = section.get("content", "")
        
        if "experience" in title:
            candidate_info["experience"].append(content)
        elif "education" in title:
            candidate_info["education"] = content
        elif "project" in title:
            candidate_info["projects"].append(content)
    
    return candidate_info

def calculate_word_count(text: str) -> int:
    """Calculate approximate word count of text."""
    return len(text.split())

class CoverLetterGeneratorAgent:
    """Agent for generating personalized cover letters."""
    
    def __init__(self):
        self.llm = llm
        self.parser = JsonOutputParser(pydantic_object=CoverLetter)
        schema_str = get_schema_string(CoverLetter)
        
        self.prompt = ChatPromptTemplate([
            ("system", get_cover_letter_prompt(schema_str)),
            ("human", """Generate cover letter:

TAILORED RESUME: {tailored_resume}
JOB ANALYSIS: {jd_analysis}
ESTABLISHED SKILLS: {established_skills}
LEARNING SKILLS: {learning_skills}
SOFT SKILLS: {soft_skills}
Match score: {match_score}%""")
        ])
    
    async def generate_cover_letter_async(self, tailored_resume: Dict, jd_analysis: Dict) -> Dict:
        """Async version of generate_cover_letter."""
        if not tailored_resume:
            raise ValueError("Tailored resume cannot be empty")
        
        if not jd_analysis:
            raise ValueError("Job description analysis cannot be empty")
        
        try:
            # Extract candidate information
            candidate_info = extract_candidate_info(tailored_resume)
            
            # Get highlighted skills and match score
            highlighted_skills = tailored_resume.get("highlighted_skills", [])
            match_score = tailored_resume.get("match_score", 0)
            
            # Analyze skills context
            tailoring_notes = tailored_resume.get("tailoring_notes", [])
            learning_skills = [skill for skill in highlighted_skills if any("learning" in note.lower() and skill.lower() in note.lower() for note in tailoring_notes)]
            established_skills = [skill for skill in highlighted_skills if skill not in learning_skills]
            soft_skills = jd_analysis.get("soft_skills", [])
            
            # Generate cover letter using LLM
            response = await self.llm.ainvoke(self.prompt.format_messages(
                tailored_resume=json.dumps(tailored_resume, indent=2),
                jd_analysis=json.dumps(jd_analysis, indent=2),
                candidate_info=json.dumps(candidate_info, indent=2),
                highlighted_skills=", ".join(highlighted_skills),
                learning_skills=", ".join(learning_skills),
                established_skills=", ".join(established_skills),
                soft_skills=", ".join(soft_skills),
                match_score=match_score
            ))
            
            # Parse the response
            parsed_response = self.parser.invoke(response.content)
            
            # Calculate word count
            full_text = f"{parsed_response['opening_paragraph']} {' '.join(parsed_response['body_paragraphs'])} {parsed_response['closing_paragraph']}"
            parsed_response['word_count'] = calculate_word_count(full_text)
            
            # Validate and return
            cover_letter = CoverLetter(**parsed_response)
            return cover_letter.model_dump()
            
        except Exception as e:
            raise ValueError(f"Cover letter generation failed: {str(e)}")

