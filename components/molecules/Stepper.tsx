"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

/**
 * Horizontal stepper indicator, adapted from the imocerto_fe Stepper molecule
 * to use report-pump's design tokens.
 */
export function Stepper({ steps, currentStep, className }: StepperProps) {
  const [hasBlinked, setHasBlinked] = useState(false);
  useEffect(() => {
    setHasBlinked(false);
    const timeout = setTimeout(() => {
      setHasBlinked(true);
    }, 600);
    return () => clearTimeout(timeout);
  }, [currentStep]);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out",
                  {
                    // Completed step
                    "border-primary bg-primary text-primary-foreground":
                      index < currentStep,
                    // Current step
                    "border-primary bg-primary text-primary-foreground scale-110":
                      index === currentStep,
                    // Future step
                    "border-border bg-background text-muted-foreground":
                      index > currentStep,
                  }
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5 animate-in zoom-in duration-200" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>

              {/* Pulse animation for current step */}
              {index === currentStep && !hasBlinked && (
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
              )}
            </div>

            <div className="flex flex-col items-center text-center max-w-[120px]">
              <h3
                className={cn(
                  "text-sm font-medium transition-colors duration-200 w-full text-center flex justify-center",
                  {
                    "text-primary": index < currentStep,
                    "text-foreground": index === currentStep,
                    "text-muted-foreground": index > currentStep,
                  }
                )}
              >
                {step.title}
              </h3>
              {step.description && (
                <p
                  className={cn("text-xs mt-1 transition-colors duration-200", {
                    "text-primary": index <= currentStep,
                    "text-muted-foreground": index > currentStep,
                  })}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
