import type { BookingProgressProps } from "./types";

/**
 * Step indicator with optional jump-back to completed steps.
 */
export function BookingProgress({
  currentStep,
  steps,
  onStepClick,
}: BookingProgressProps) {
  const currentStepConfig = steps.find((s) => s.id === currentStep);
  const currentLabel = currentStepConfig?.label ?? "";
  const totalSteps = steps.length;

  return (
    <nav aria-label="Progress" className="relative flex flex-col px-4">
      <p
        aria-live="polite"
        className="mb-3 text-center font-semibold text-primary-content text-sm sm:hidden"
      >
        Step {currentStep} of {totalSteps} – {currentLabel}
      </p>
      <div className="relative flex items-center justify-between">
        {steps.map((step) => {
          // Derived flags for styling and interaction behaviour
          const isCurrent = currentStep === step.id;
          const isPast = currentStep > step.id;
          const canJumpBack = isPast;
          let stepStyle: string;
          if (isCurrent) {
            stepStyle =
              "scale-110 bg-primary-content text-primary ring-4 ring-primary";
          } else if (isPast) {
            stepStyle = "bg-success text-success-content";
          } else {
            stepStyle = "bg-primary/60 text-primary-content/80";
          }
          return (
            <div className="z-10 flex flex-col items-center" key={step.id}>
              <button
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${step.label}${isPast ? ", completed" : ""}`}
                // Only completed steps are clickable to jump back
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${stepStyle} ${canJumpBack ? "cursor-pointer" : ""}`}
                disabled={!(canJumpBack || isCurrent)}
                onClick={() => canJumpBack && onStepClick(step.id)}
                type="button"
              >
                {isPast ? (
                  <span className="font-bold text-xl">✓</span>
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
              </button>
              <span
                // Step label; hidden on mobile where "Step X of N – label" is shown instead
                className={`mt-3 hidden font-bold uppercase tracking-widest sm:block sm:text-sm md:text-base ${
                  isCurrent ? "opacity-100" : "opacity-60"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
        <div
          aria-hidden="true"
          className="absolute top-6 left-0 z-0 h-1 w-full rounded-full bg-primary/50"
        />
      </div>
    </nav>
  );
}
