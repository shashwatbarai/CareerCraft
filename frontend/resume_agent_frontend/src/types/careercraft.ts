export interface UploadedFile {
  file: File;
  filename: string;
}

export interface JobDescription {
  content: string;
}

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
}

export interface JobAnalysis {
  role_title: string;
  company_name?: string;
  hard_skills: string[];
  soft_skills: string[];
  responsibilities: string[];
  experience_level: string;
  required_education?: string;
  location?: string;
  employment_type?: string;
  industry?: string;
}

export interface ResumeSection {
  title: string;
  content: string;
}

export interface TailoredResume {
  sections: ResumeSection[];
  highlighted_skills: string[];
  match_score: number;
  tailoring_notes: string[];
}

export interface CoverLetter {
  opening_paragraph: string;
  body_paragraphs: string[];
  closing_paragraph: string;
  key_skills_highlighted: string[];
  tone: string;
  word_count: number;
}

export interface AIOutput {
  job_analysis: JobAnalysis;
  tailored_resume: TailoredResume;
  cover_letter: CoverLetter;
}

export interface GenerationState {
  isGenerating: boolean;
  currentStep: string | null;
  steps: ProcessingStep[];
}