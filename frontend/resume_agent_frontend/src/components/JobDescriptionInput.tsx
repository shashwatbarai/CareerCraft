import React from 'react';
import type { JobDescription } from '@/types/careercraft';

interface JobDescriptionInputProps {
  jobDescription: JobDescription;
  onJobDescriptionChange: (jobDescription: JobDescription) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  jobDescription,
  onJobDescriptionChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onJobDescriptionChange({
      content: e.target.value
    });
  };

  return (
    <div className="career-section">
      <h2 className="text-xl font-semibold text-foreground mb-4">Job Description</h2>
      <div className="space-y-2">
        <label htmlFor="job-description" className="text-sm font-medium text-foreground">
          Paste the job posting or description here
        </label>
        <textarea
          id="job-description"
          value={jobDescription.content}
          onChange={handleChange}
          placeholder="Paste the complete job description, including requirements, responsibilities, and qualifications..."
          className="career-input min-h-[200px] resize-y"
          rows={8}
          aria-describedby="job-description-help"
        />
        <p id="job-description-help" className="text-xs text-muted-foreground">
          Include all relevant details for the best tailoring results
        </p>
      </div>
    </div>
  );
};