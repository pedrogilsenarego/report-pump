"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  FieldValues,
  Path,
  UseFormReturn,
  SubmitHandler,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Stepper, type Step } from "@/components/molecules/Stepper";
import { i18n } from "@/translations/i18n";

export type StepperFormStep<T extends FieldValues> = Step & {
  content: ReactNode;
  /** Fields validated before advancing past this step. */
  fields?: Path<T>[];
  /**
   * Extra validation run before advancing, alongside `fields`. Should return
   * false (and surface its own errors, e.g. via form.setError) to block the
   * step. Runs even when field validation fails, so all errors show at once.
   */
  validate?: () => boolean | Promise<boolean>;
};

type Props<T extends FieldValues> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  steps: StepperFormStep<T>[];
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  submitButtonText: string;
  isSubmitting?: boolean;
  /** Disables the final submit button (e.g. until terms are accepted). */
  submitDisabled?: boolean;
};

/**
 * Multi-step form rendered inside a modal, adapted from imocerto_fe's
 * StepperForm. Renders a step indicator, one step's content at a time and
 * validates the active step's fields before allowing the user to advance.
 */
export function StepperFormModal<T extends FieldValues>({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  steps,
  form,
  onSubmit,
  submitButtonText,
  isSubmitting,
  submitDisabled,
}: Props<T>) {
  const [currentStep, setCurrentStep] = useState(0);

  // Restart the flow whenever the modal is closed.
  useEffect(() => {
    if (!open) setCurrentStep(0);
  }, [open]);

  // Don't carry validation errors across steps: a step should only surface
  // errors once the user tries to advance/submit from it, not on entry because
  // an earlier submit left stale errors in form state.
  useEffect(() => {
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    const step = steps[currentStep];
    const fields = step.fields ?? [];

    // Run field validation and the step's custom validation together so every
    // error (including the custom ones) is surfaced in a single pass.
    let valid = fields.length > 0 ? await form.trigger(fields) : true;
    if (step.validate) {
      const extraValid = await step.validate();
      valid = valid && extraValid;
    }

    if (!valid) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Never submit implicitly. An Enter keypress (or the Next button morphing
  // into the submit button as the step advances) would otherwise fire the
  // form's submit on the last step and validate the whole form before the user
  // intended to — surfacing errors on entry. Enter only advances; submission
  // happens exclusively via an explicit click on the submit button below.
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLastStep) void handleNext();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Stepper steps={steps} currentStep={currentStep} className="py-2" />

        <div className="space-y-1">
          <h3 className="text-base font-semibold">
            {steps[currentStep].title}
          </h3>
          {steps[currentStep].description && (
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Render every step once and toggle visibility rather than
                swapping content in and out. Swapping would let React reuse the
                same input instances across steps (values bleeding between
                fields) and remount fields, which — with an async resolver and
                a prior submit — re-runs validation on entry and re-surfaces
                errors right after we clear them. Keeping every field mounted
                avoids both. */}
            <div className="max-h-[55vh] overflow-y-auto p-1">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={index === currentStep ? "space-y-5" : "hidden"}
                >
                  {step.content}
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-4 pt-2">
              {!isFirstStep ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  {i18n.t("common.previous")}
                </Button>
              ) : (
                <span />
              )}

              {isLastStep ? (
                <Button
                  type="button"
                  onClick={() => void form.handleSubmit(onSubmit)()}
                  isLoading={isSubmitting}
                  disabled={submitDisabled}
                >
                  {submitButtonText}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  {i18n.t("common.next")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
