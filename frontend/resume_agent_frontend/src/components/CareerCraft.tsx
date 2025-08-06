import React, { useRef, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { ResumeUpload } from './ResumeUpload';
import { JobDescriptionInput } from './JobDescriptionInput';
import { ProgressIndicator } from './ProgressIndicator';
import { OutputSection } from './OutputSection';
import { AgentStatus } from './AgentStatus';
import { useResumeProcessor } from '@/hooks/useResumeProcessor';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useJobDescription } from '@/hooks/useJobDescription';

export const CareerCraft: React.FC = () => {
  const { generationState, output, processResume } = useResumeProcessor();
  const { uploadedFile, handleFileUpload, handleRemoveFile } = useFileUpload();
  const { jobDescription, handleJobDescriptionChange, isValid } = useJobDescription();
  const progressRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to progress section when generation starts
  useEffect(() => {
    if (generationState.isGenerating && progressRef.current) {
      progressRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [generationState.isGenerating]);

  const handleGenerate = () => {
    if (uploadedFile && isValid) {
      processResume(uploadedFile, jobDescription.content);
    }
  };

  const canGenerate = uploadedFile && isValid && !generationState.isGenerating;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">CareerCraft</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            AI-powered resume tailoring and cover letter generation
          </p>
          <AgentStatus />
        </div>
        
        <div className="space-y-6">
          <ResumeUpload
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            onRemoveFile={handleRemoveFile}
          />
          
          <JobDescriptionInput
            jobDescription={jobDescription}
            onJobDescriptionChange={handleJobDescriptionChange}
          />
          
          <div className="text-center">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              variant="default"
              size="lg"
              className={!canGenerate ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {generationState.isGenerating ? (
                <span className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span>Generating...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Generate</span>
                </span>
              )}
            </Button>
          </div>
          
          <div ref={progressRef}>
            <ProgressIndicator generationState={generationState} />
          </div>
          
          <OutputSection output={output} />
        </div>
      </div>
    </div>
  );
};