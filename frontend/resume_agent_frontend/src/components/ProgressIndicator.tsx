import React from 'react';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import type { GenerationState } from '@/types/careercraft';

interface ProgressIndicatorProps {
  generationState: GenerationState;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  generationState
}) => {
  if (!generationState.isGenerating) return null;

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'active':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="career-section">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        AI Agents Working...
      </h3>
      <div className="space-y-3">
        {generationState.steps.map((step) => (
          <div
            key={step.id}
            className={`career-progress-step ${step.status}`}
            role="status"
            aria-label={`${step.name} - ${step.status}`}
          >
            {getStepIcon(step.status)}
            <span className="font-medium">{step.name}</span>
            {step.status === 'active' && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500 ease-out"
          style={{
            width: `${(generationState.steps.filter(s => s.status === 'completed').length / generationState.steps.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
};