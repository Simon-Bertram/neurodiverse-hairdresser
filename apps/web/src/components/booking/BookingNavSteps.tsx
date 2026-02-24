import { MAX_STEP, STEPS } from "./constants";
import type { BookingNavProps } from "./types";

/**
 * Back / Continue navigation. Hidden on review step (has its own submit).
 */
export function BookingNavSteps({
  currentStep,
  isStepValid,
  onPrev,
  onNext,
}: BookingNavProps) {
  if (currentStep === MAX_STEP) {
    return null;
  }

  return (
    <nav
      aria-label="Form steps"
      className="mt-12 border-base-300 border-t pt-8"
    >
      <div className="flex flex-col gap-6">
        <ul className="steps steps-vertical lg:steps-horizontal w-full">
          {STEPS.map((step) => (
            <li
              className={`step ${currentStep >= step.id ? "step-primary" : ""}`}
              key={step.id}
            >
              {step.label}
            </li>
          ))}
        </ul>

        <div className="flex gap-6">
          {currentStep > 1 && (
            <button
              className="btn btn-ghost btn-lg flex-1 rounded-2xl border-2 border-base-300 px-6 py-5 font-bold text-base-content/70 outline-none transition-all hover:bg-base-200 hover:text-base-content focus:ring-4 focus:ring-base-300"
              onClick={onPrev}
              type="button"
            >
              Back
            </button>
          )}
          <button
            className={`flex flex-2 items-center justify-center gap-2 rounded-2xl px-6 py-5 font-bold text-lg shadow-lg transition-all ${
              isStepValid
                ? "btn btn-primary hover:scale-[1.02] active:scale-95"
                : "btn btn-disabled cursor-not-allowed bg-base-300 text-base-content/50 shadow-none"
            }`}
            disabled={!isStepValid}
            onClick={onNext}
            type="button"
          >
            {currentStep === MAX_STEP - 1 ? "Review Request" : "Continue"}
            {isStepValid && <span className="text-xl">→</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
