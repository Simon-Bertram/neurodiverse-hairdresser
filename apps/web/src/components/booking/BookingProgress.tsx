import type { BookingProgressProps } from "./types";

/**
 * Step indicator with optional jump-back to completed steps.
 */
export function BookingProgress({
  currentStep,
  steps,
  onStepClick,
}: BookingProgressProps) {
  return (
    <nav
      aria-label="Progress"
      className="relative flex items-center justify-between"
    >
      {steps.map((step) => {
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
              className={`mt-3 font-bold text-[10px] uppercase tracking-widest ${
                isCurrent ? "opacity-100" : "opacity-60"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
      <div className="absolute top-6 left-0 -z-0 h-1 w-full rounded-full bg-primary/50" />
    </nav>
  );
}
