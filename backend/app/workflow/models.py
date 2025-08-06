"""
Pydantic models for the resume agent system.

This module contains all the data models used by different agents in the system.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field

# Pydantic schema for job description analysis output
class JobDescriptionAnalysis(BaseModel):
    """
    Pydantic schema for job description analysis output.
    """
    role_title: str = Field(
        description="The job title or position name"
    )
    company_name: Optional[str] = Field(
        default=None,
        description="Company name if mentioned in the job description"
    )
    hard_skills: List[str] = Field(
        default_factory=list,
        description="Technical skills, programming languages, tools, certifications required"
    )
    soft_skills: List[str] = Field(
        default_factory=list,
        description="Interpersonal skills, communication abilities, leadership qualities"
    )
    responsibilities: List[str] = Field(
        default_factory=list,
        description="Key job responsibilities and main duties"
    )
    experience_level: str = Field(
        default="Not specified",
        description="Required experience level (Entry-level, Mid-level, Senior, etc.)"
    )
    required_education: Optional[str] = Field(
        default=None,
        description="Educational requirements if specified"
    )
    location: Optional[str] = Field(
        default=None,
        description="Job location or work arrangement (Remote, On-site, Hybrid)"
    )
    employment_type: Optional[str] = Field(
        default=None,
        description="Employment type (Full-time, Part-time, Contract, Internship)"
    )
    industry: Optional[str] = Field(
        default=None,
        description="Industry sector or business domain"
    )
    

# Pydantic schema for tailored resume output
class ResumeSection(BaseModel):
    """Individual resume section model."""
    title: str = Field(description="Section title")
    content: str = Field(description="Section content")

class TailoredResume(BaseModel):
    """Pydantic schema for tailored resume output."""
    sections: List[ResumeSection] = Field(description="List of resume sections with tailored content")
    highlighted_skills: List[str] = Field(default_factory=list, description="Skills emphasized in tailored resume")
    match_score: float = Field(default=0.0, description="Match score between resume and job requirements (0-100)")
    tailoring_notes: List[str] = Field(default_factory=list, description="Notes about changes made during tailoring")


# Pydantic schema for cover letter output
class CoverLetter(BaseModel):
    """Pydantic schema for generated cover letter."""
    opening_paragraph: str = Field(description="Compelling opening that grabs attention")
    body_paragraphs: List[str] = Field(description="Main body paragraphs highlighting relevant experience and skills")
    closing_paragraph: str = Field(description="Strong closing with call to action")
    key_skills_highlighted: List[str] = Field(default_factory=list, description="Key skills emphasized in the cover letter")
    tone: str = Field(default="professional", description="Overall tone of the cover letter")
    word_count: int = Field(default=0, description="Approximate word count of the cover letter")
