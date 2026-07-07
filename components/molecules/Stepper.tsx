"use client";

import { Fragment } from "react";
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
 * Compact horizontal stepper indicator: numbered dots joined by a progress
 * line. Titles are intentionally not rendered here so the indicator scales to
 * many steps inside a modal; the active step's title is shown next to the form
 * content by the parent (see StepperFormModal).
 */
export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center">
        {steps.map((step, index) => (
          <Fragment key={step.id}>
            <div className="relative flex shrink-0 items-center justify-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out",
                  {
                    "border-primary bg-primary text-primary-foreground":
                      index < currentStep,
                    "border-primary bg-primary text-primary-foreground scale-110":
                      index === currentStep,
                    "border-border bg-background text-muted-foreground":
                      index > currentStep,
                  }
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4 animate-in zoom-in duration-200" />
                ) : (
                  <span className="text-xs font-semibold">{step.id}</span>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded-full transition-colors duration-300",
                  index < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
