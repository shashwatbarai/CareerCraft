import os
import sys
from typing import Annotated, Dict, Optional
from typing_extensions import TypedDict

# Add the backend directory to Python path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

from app.workflow.agents.resume_tailor import ResumeTailorAgent
from app.workflow.agents.cover_letter_generator import CoverLetterGeneratorAgent
from app.workflow.agents.jd_analyzer import JDAnalyzerAgent
from app.workflow.config import handle_callback

# Define the state for the graph
class State(TypedDict):
    messages: Annotated[list[str], add_messages]
    job_description: Optional[str]
    original_resume: Optional[str]
    jd_analysis: Optional[Dict]
    tailored_resume: Optional[Dict]
    cover_letter: Optional[Dict]
    error: Optional[str]
    callback: Optional[callable]

# Node functions
async def jd_analyzer_node(state: Dict) -> Dict:
    """Node function for analyzing job descriptions."""
    await handle_callback(state.get("callback"), {"status": "processing", "agent": "jd_analyzer", "message": "Analyzing job description"})
    
    job_description = state.get("job_description", "").strip()
    
    if not job_description:
        return {"jd_analysis": {"error": "No job description provided"}}
    
    agent = JDAnalyzerAgent()
    jd_analysis = await agent.analyze_job_description_async(job_description)
    return {"jd_analysis": jd_analysis}

async def resume_tailor_node(state: Dict) -> Dict:
    """Node for tailoring resume based on job analysis."""
    await handle_callback(state.get("callback"), {"status": "processing", "agent": "resume_tailor", "message": "Tailoring resume"})
    
    try:
        jd_analysis = state.get("jd_analysis")
        original_resume = state.get("original_resume")
        
        if not jd_analysis or jd_analysis.get("error"):
            return {"error": "Job analysis required for resume tailoring"}
        
        if not original_resume:
            return {"error": "Original resume required for tailoring"}
        
        agent = ResumeTailorAgent()
        tailored_resume = await agent.tailor_resume_async(original_resume, jd_analysis)
        return {"tailored_resume": tailored_resume}
        
    except Exception as e:
        return {"error": f"Resume tailoring failed: {str(e)}"}

async def cover_letter_node(state: Dict) -> Dict:
    """Node for generating cover letter based on tailored resume and job analysis."""
    await handle_callback(state.get("callback"), {"status": "processing", "agent": "cover_letter_generator", "message": "Generating cover letter"})
    
    try:
        tailored_resume = state.get("tailored_resume")
        jd_analysis = state.get("jd_analysis")
        
        if not tailored_resume or state.get("error"):
            return {"error": "Tailored resume required for cover letter generation"}
        
        if not jd_analysis or jd_analysis.get("error"):
            return {"error": "Job analysis required for cover letter generation"}
        
        agent = CoverLetterGeneratorAgent()
        cover_letter = await agent.generate_cover_letter_async(tailored_resume, jd_analysis)
        return {"cover_letter": cover_letter}
        
    except Exception as e:
        return {"error": f"Cover letter generation failed: {str(e)}"}

def create_graph():
    """Create and compile the multiagent workflow graph."""
    graph_builder = StateGraph(State)
    graph_builder.add_node("jd_analyzer", jd_analyzer_node)
    graph_builder.add_node("resume_tailor", resume_tailor_node)
    graph_builder.add_node("cover_letter_generator", cover_letter_node)
    graph_builder.add_edge(START, "jd_analyzer")
    graph_builder.add_edge("jd_analyzer", "resume_tailor")
    graph_builder.add_edge("resume_tailor", "cover_letter_generator")
    graph_builder.add_edge("cover_letter_generator", END)
    return graph_builder.compile()

resume_agent = create_graph()
