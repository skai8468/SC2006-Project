import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-1 items-center">
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-200',
                  {
                    'border-blue-600 bg-blue-600 text-white': currentStep > index,
                    'border-blue-600 bg-white text-blue-600': currentStep === index,
                    'border-gray-200 bg-white text-gray-400': currentStep < index,
                  }
                )}
              >
                {currentStep > index ? <Check className="h-6 w-6" /> : index + 1}
              </div>
              <span
                className={cn('mt-2 text-center text-sm font-medium', {
                  'text-blue-600': currentStep >= index,
                  'text-gray-400': currentStep < index,
                })}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn('h-0.5 flex-1 transition-colors duration-200', {
                  'bg-blue-600': currentStep > index,
                  'bg-gray-200': currentStep <= index,
                })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}