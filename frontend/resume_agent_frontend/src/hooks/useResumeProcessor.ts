import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { api } from '@/lib/api';
import type { GenerationState, AIOutput, UploadedFile } from '@/types/careercraft';

export const useResumeProcessor = () => {
  const { toast } = useToast();
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    currentStep: null,
    steps: [
      { id: 'analyzer', name: 'Analyzing Job Description', status: 'pending' },
      { id: 'tailor', name: 'Tailoring Resume', status: 'pending' },
      { id: 'generator', name: 'Generating Cover Letter', status: 'pending' }
    ]
  });
  const [output, setOutput] = useState<AIOutput | null>(null);

  const processResume = useCallback(async (uploadedFile: UploadedFile, jobDescription: string) => {
    if (!uploadedFile || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please upload a resume and provide a job description.",
        variant: "destructive"
      });
      return;
    }

    setOutput(null);
    setGenerationState(prev => ({
      ...prev,
      isGenerating: true,
      steps: prev.steps.map(step => ({ ...step, status: 'pending' as const }))
    }));

    let useBackend = false;
    try {
      const result = await api.processResume(
        uploadedFile.file, 
        jobDescription,
        (progressData: unknown) => {
          const data = progressData as { agent?: string };
          const agentMap: Record<string, string> = {
            'jd_analyzer': 'analyzer',
            'resume_tailor': 'tailor',
            'cover_letter_generator': 'generator'
          };
          
          if (data.agent && agentMap[data.agent]) {
            const stepId = agentMap[data.agent];
            const stepOrder = ['analyzer', 'tailor', 'generator'];
            const currentStepIndex = stepOrder.indexOf(stepId);
            
            setGenerationState(prev => ({
              ...prev,
              currentStep: stepId,
              steps: prev.steps.map((step, index) => ({
                ...step,
                status: step.id === stepId ? 'active' : 
                       index < currentStepIndex ? 'completed' : 'pending'
              }))
            }));
          }
        }
      );
      
      if (result) {
        setOutput(result);
        setGenerationState(prev => ({
          ...prev,
          isGenerating: false,
          currentStep: null,
          steps: prev.steps.map(step => ({ ...step, status: 'completed' as const }))
        }));
        useBackend = true;
      }
    } catch (error) {
      console.log('Backend connection failed, using mock data');
      toast({
        title: "Backend Unavailable",
        description: "Using demo mode with sample data.",
        variant: "default"
      });
      useBackend = false;
    }

    if (!useBackend) {
      // Mock simulation logic here
      const steps = ['analyzer', 'tailor', 'generator'];
    
      for (let i = 0; i < steps.length; i++) {
        const stepId = steps[i];
        
        setGenerationState(prev => ({
          ...prev,
          currentStep: stepId,
          steps: prev.steps.map(step => ({
            ...step,
            status: step.id === stepId ? 'active' :
              steps.indexOf(step.id) < i ? 'completed' : 'pending'
          }))
        }));
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Mock data for demo mode
      const mockOutput: AIOutput = {
        job_analysis: {
          role_title: "Senior Software Engineer",
          company_name: "TechCorp Inc.",
          hard_skills: ["Python", "JavaScript", "React", "Node.js", "SQL", "AWS", "Docker", "Git"],
          soft_skills: ["Leadership", "Communication", "Problem-solving", "Team collaboration"],
          responsibilities: [
            "Design and develop scalable web applications",
            "Lead technical discussions and code reviews",
            "Mentor junior developers",
            "Collaborate with cross-functional teams"
          ],
          experience_level: "Senior (5+ years)",
          required_education: "Bachelor's in Computer Science",
          location: "Remote",
          employment_type: "Full-time",
          industry: "Technology"
        },
        tailored_resume: {
          sections: [
            {
              title: "Professional Summary",
              content: "Senior Software Engineer with 6+ years of experience in full-stack web development. Expertise in Python, JavaScript, and React with a proven track record of leading technical teams and delivering scalable solutions. Strong background in cloud technologies and agile development practices."
            },
            {
              title: "Technical Skills",
              content: "• Programming Languages: Python, JavaScript, TypeScript\n• Frontend: React, HTML5, CSS3, Redux\n• Backend: Node.js, Django, Flask\n• Databases: PostgreSQL, MongoDB, Redis\n• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD\n• Tools: Git, Jira, Slack, VS Code"
            },
            {
              title: "Professional Experience",
              content: "Senior Software Engineer | ABC Tech Solutions | 2021 - Present\n• Led development of microservices architecture serving 100K+ users\n• Mentored team of 4 junior developers, improving code quality by 40%\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Collaborated with product managers to define technical requirements\n\nSoftware Engineer | XYZ Startup | 2019 - 2021\n• Developed responsive web applications using React and Python\n• Optimized database queries improving application performance by 35%\n• Participated in agile development cycles and sprint planning"
            }
          ],
          highlighted_skills: ["Python", "JavaScript", "React", "Leadership", "AWS"],
          match_score: 92.5,
          tailoring_notes: [
            "Emphasized leadership experience to match senior role requirements",
            "Highlighted cloud technologies (AWS) mentioned in job description",
            "Added specific metrics to demonstrate impact and results",
            "Restructured technical skills to prioritize required technologies"
          ]
        },
        cover_letter: {
          opening_paragraph: "Dear Hiring Manager,\n\nI am excited to apply for the Senior Software Engineer position at TechCorp Inc. With over 6 years of experience in full-stack development and a passion for building scalable web applications, I am confident that my technical expertise and leadership skills make me an ideal candidate for this role.",
          body_paragraphs: [
            "In my current role as Senior Software Engineer at ABC Tech Solutions, I have successfully led the development of microservices architecture that serves over 100,000 users daily. My expertise in Python, JavaScript, and React aligns perfectly with your technical requirements. I have consistently delivered high-quality solutions while mentoring junior developers and improving overall team productivity by 40%.",
            "What particularly excites me about this opportunity is TechCorp's commitment to innovation and technical excellence. Your focus on cloud-native solutions resonates with my experience in AWS and containerization technologies. I have implemented CI/CD pipelines that reduced deployment times by 60% and have hands-on experience with the modern development practices your team values."
          ],
          closing_paragraph: "I would welcome the opportunity to discuss how my technical skills, leadership experience, and passion for software engineering can contribute to TechCorp's continued success. Thank you for considering my application, and I look forward to hearing from you soon.\n\nBest regards,\n[Your Name]",
          key_skills_highlighted: ["Python", "JavaScript", "React", "AWS", "Leadership", "Microservices"],
          tone: "professional",
          word_count: 285
        }
      };

      setOutput(mockOutput);
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        currentStep: null,
        steps: prev.steps.map(step => ({ ...step, status: 'completed' as const }))
      }));
    }
  }, [toast]);

  return {
    generationState,
    output,
    processResume
  };
};