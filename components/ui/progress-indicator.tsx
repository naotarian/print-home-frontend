import { cn } from "@/lib/utils";

export interface StepConfig {
  id: string;
  title: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: StepConfig[];
  currentStep: number; // 0-based index
  className?: string;
  showConnectors?: boolean;
  variant?: 'default' | 'compact' | 'mobile';
}

export default function ProgressIndicator({
  steps,
  currentStep,
  className = "",
  showConnectors = true,
  variant = 'default'
}: ProgressIndicatorProps) {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepClasses = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white border-green-600';
      case 'current':
        return 'bg-primary text-primary-foreground border-primary';
      case 'pending':
        return 'bg-gray-300 text-gray-600 border-gray-300';
    }
  };

  const getTextClasses = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'current':
        return 'text-gray-900 font-medium';
      case 'pending':
        return 'text-gray-600';
    }
  };

  const getConnectorClasses = (stepIndex: number) => {
    const nextStepStatus = getStepStatus(stepIndex + 1);
    return nextStepStatus === 'completed' || (nextStepStatus === 'current' && stepIndex < currentStep)
      ? 'bg-green-600'
      : 'bg-gray-300';
  };

  if (variant === 'mobile') {
    return (
      <div className={cn("px-4 py-3", className)}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium border",
                    getStepClasses(status)
                  )}
                >
                  {status === 'completed' ? '✓' : index + 1}
                </div>
                <div className="mt-1 text-center px-1">
                  <span className={cn("text-xs leading-tight", getTextClasses(status))}>
                    {step.title.replace(/\s+/g, '')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Mobile Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium border-2",
                    getStepClasses(status)
                  )}
                >
                  {status === 'completed' ? '✓' : index + 1}
                </div>
                {showConnectors && index < steps.length - 1 && (
                  <div className={cn("h-0.5 w-8 mx-2", getConnectorClasses(index))}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-6 lg:space-x-8">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium border-2",
                        getStepClasses(status)
                      )}
                    >
                      {status === 'completed' ? '✓' : index + 1}
                    </div>
                    <div className="ml-2 min-w-0">
                      <div className={cn("text-sm whitespace-nowrap", getTextClasses(status))}>
                        {step.title}
                      </div>
                      {step.description && (
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {step.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {showConnectors && index < steps.length - 1 && (
                    <div className={cn("h-0.5 w-12 lg:w-16 mx-6 lg:mx-8", getConnectorClasses(index))}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
