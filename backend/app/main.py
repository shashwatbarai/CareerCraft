from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import uvicorn
import os
import sys
import json
import asyncio
from asyncio import Queue
import time

from .utils import extract_text_from_pdf, validate_job_description
from .workflow import JobDescriptionAnalysis, TailoredResume, CoverLetter
from .database import db_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_service.connect()
    yield
    await db_service.disconnect()

app = FastAPI(title="Resume Agent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Access-Control-Request-Private-Network"],  
    expose_headers=["Access-Control-Allow-Private-Network"],        
)

@app.post("/process-resume")
async def process_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(..., min_length=50)
):
    start_time = time.time()
    # Process file and validate inputs BEFORE streaming starts
    try:
        if not resume_file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read and process PDF content immediately
        pdf_content = await resume_file.read()
        resume_text = extract_text_from_pdf(pdf_content)
        
        # Validate job description
        validated_job_description = validate_job_description(job_description)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    async def generate_stream():
        try:
            yield f"data: {json.dumps({'status': 'started', 'message': 'Processing started'})}\n\n"
            
            progress_queue = Queue()
            
            async def stream_callback(data):
                await progress_queue.put(data)
            
            from .workflow import resume_agent
            initial_state = {
                "messages": [],
                "job_description": validated_job_description,
                "original_resume": resume_text,
                "callback": stream_callback
            }
            
            # Run graph asynchronously
            async def run_graph():
                try:
                    result = await asyncio.wait_for(resume_agent.ainvoke(initial_state), timeout=300)
                    await progress_queue.put({"type": "result", "data": result})
                except asyncio.TimeoutError:
                    await progress_queue.put({"type": "error", "message": "Processing timeout - operation took too long"})
                except Exception as e:
                    await progress_queue.put({"type": "error", "message": str(e)})
            
            task = asyncio.create_task(run_graph())
            
            # Stream progress updates
            while not task.done() or not progress_queue.empty():
                try:
                    data = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                    if data.get("type") == "result":
                        final_state = data["data"]
                        break
                    elif data.get("type") == "error":
                        yield f"data: {json.dumps({'status': 'error', 'message': data['message']})}\n\n"
                        return
                    else:
                        yield f"data: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    await asyncio.sleep(0.1)
            
            await task
            
            if final_state.get("error"):
                yield f"data: {json.dumps({'status': 'error', 'message': final_state['error']})}\n\n"
                return
            
            # Validate outputs using Pydantic models
            try:
                job_analysis = JobDescriptionAnalysis(**final_state.get("jd_analysis", {}))
                tailored_resume = TailoredResume(**final_state.get("tailored_resume", {}))
                cover_letter = CoverLetter(**final_state.get("cover_letter", {}))
                
                final_data = {
                    "job_analysis": job_analysis.model_dump(),
                    "tailored_resume": tailored_resume.model_dump(),
                    "cover_letter": cover_letter.model_dump()
                }
            except Exception as validation_error:
                yield f"data: {json.dumps({'status': 'error', 'message': f'Output validation failed: {str(validation_error)}'})}\n\n"
                return
            
            # Save to MongoDB
            try:
                workflow_data = {
                    "job_description": validated_job_description,
                    "resume_filename": resume_file.filename,
                    "job_analysis": final_data["job_analysis"],
                    "tailored_resume": final_data["tailored_resume"],
                    "cover_letter": final_data["cover_letter"],
                    "processing_time_seconds": time.time() - start_time,
                    "status": "completed"
                }
                result_id = await db_service.save_workflow_result(workflow_data)
                final_data["database_id"] = result_id
            except Exception as db_error:
                print(f"Database save error: {db_error}")
            
            yield f"data: {json.dumps({'status': 'completed', 'message': 'Processing completed', 'data': final_data})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/event-stream")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Resume Agent API",
        "endpoints": {
            "process_resume": "/process-resume"
        }
    }

@app.get("/db-check")
async def database_check():
    try:
        # Check if client exists
        if not db_service.client:
            return {
                "status": "error",
                "message": "Database client not initialized",
                "mongodb_url": os.getenv("MONGODB_URL", "Not set")[:50] + "..." if os.getenv("MONGODB_URL") else "Not set"
            }
        
        # Test database connection by attempting to ping
        await db_service.client.admin.command('ping')
        
        # Test collection access
        collection_stats = await db_service.collection.estimated_document_count()
        
        return {
            "status": "connected",
            "database": "resume_agent",
            "collection": "workflow_results",
            "document_count": collection_stats,
            "mongodb_url": os.getenv("MONGODB_URL", "Not set")[:50] + "..." if os.getenv("MONGODB_URL") else "Not set"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "mongodb_url": os.getenv("MONGODB_URL", "Not set")[:50] + "..." if os.getenv("MONGODB_URL") else "Not set"
        }


