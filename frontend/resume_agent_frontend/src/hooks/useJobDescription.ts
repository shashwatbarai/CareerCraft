import { useState, useCallback } from 'react';
import type { JobDescription } from '@/types/careercraft';

export const useJobDescription = () => {
  const [jobDescription, setJobDescription] = useState<JobDescription>({ content: '' });

  const handleJobDescriptionChange = useCallback((newJobDescription: JobDescription) => {
    setJobDescription(newJobDescription);
  }, []);

  const isValid = jobDescription.content.trim().length > 0;

  return {
    jobDescription,
    handleJobDescriptionChange,
    isValid
  };
};