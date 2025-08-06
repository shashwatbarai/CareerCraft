import React from 'react';
import { FileText, Lightbulb, Mail } from 'lucide-react';
import type { AIOutput } from '@/types/careercraft';

interface OutputSectionProps {
  output: AIOutput | null;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ output }) => {
  if (!output) return null;

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Generated Results</h2>
      
      <div className="career-output-section">
        {/* Job Analysis Summary */}
        <div className="career-output-item">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="w-6 h-6 text-secondary" />
            <h3 className="text-xl font-semibold text-foreground">Job Analysis</h3>
          </div>
          <div className="space-y-3">
            <p><strong>Role:</strong> {output.job_analysis.role_title}</p>
            <p><strong>Match Score:</strong> {output.tailored_resume.match_score.toFixed(1)}%</p>
            <div>
              <strong>Key Skills Required:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {output.job_analysis.hard_skills.slice(0, 6).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tailored Resume */}
        <div className="career-output-item">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Tailored Resume</h3>
          </div>
          <div className="space-y-4">
            {output.tailored_resume.sections.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-lg mb-2">{section.title}</h4>
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {formatText(section.content)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tailoring Notes */}
        {output.tailored_resume.tailoring_notes.length > 0 && (
          <div className="career-output-item">
            <div className="flex items-center space-x-3 mb-4">
              <Lightbulb className="w-6 h-6 text-secondary" />
              <h3 className="text-xl font-semibold text-foreground">Key Improvements</h3>
            </div>
            <div className="space-y-2">
              {output.tailored_resume.tailoring_notes.map((note, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-foreground leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cover Letter */}
        <div className="career-output-item">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Cover Letter</h3>
          </div>
          <div className="prose prose-sm max-w-none space-y-4">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {formatText(output.cover_letter.opening_paragraph)}
            </div>
            {output.cover_letter.body_paragraphs.map((paragraph, index) => (
              <div key={index} className="whitespace-pre-wrap text-foreground leading-relaxed">
                {formatText(paragraph)}
              </div>
            ))}
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {formatText(output.cover_letter.closing_paragraph)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};