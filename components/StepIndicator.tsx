import React from 'react';
import { AppStep } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
  completedSteps: AppStep[];
}

const steps: { id: AppStep; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'digital', label: 'Digital' },
  { id: 'softskills', label: 'Soft Skills' },
  { id: 'swot', label: 'SWOT' },
  { id: 'results', label: 'PDP Worksheet' },
];

export const StepIndicator: React.FC<Props> = ({ currentStep, setStep, completedSteps }) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative max-w-4xl mx-auto px-4">
        {/* Connector Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-gray-200 -z-10 rounded-full" />
        
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <button
              key={step.id}
              onClick={() => isCompleted ? setStep(step.id) : null}
              disabled={!isCompleted && !isCurrent}
              className={`flex flex-col items-center group focus:outline-none transition-all duration-300 ${!isCompleted && !isCurrent ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 bg-white shadow-sm
                ${isCompleted || isCurrent ? 'border-arden-teal text-arden-teal' : 'border-gray-300 text-gray-300'}
                ${isCurrent ? 'ring-4 ring-arden-teal/20 scale-110 bg-arden-teal text-white border-white' : ''}
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                   <span className="font-bold text-lg">{index + 1}</span>
                )}
              </div>
              <span className={`mt-3 text-sm font-bold uppercase tracking-wider ${isCurrent ? 'text-arden-navy' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};