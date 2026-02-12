import type { ComponentChildren } from "preact";
import type { StepId } from "./types";

interface ReviewSectionProps {
  sectionLabel: string;
  editStepId: StepId;
  onEditStep: (stepId: StepId) => void;
  children: ComponentChildren;
}

/**
 * Reusable review section with section label, content, and Edit button.
 */
export function ReviewSection({
  sectionLabel,
  editStepId,
  onEditStep,
  children,
}: ReviewSectionProps) {
  return (
    <div className="flex items-start justify-between border-base-300 border-b pb-4">
      <div>
        <h3 className="mb-1 font-bold text-base-content/60 text-xs uppercase tracking-widest">
          {sectionLabel}
        </h3>
        {children}
      </div>
      <button
        aria-label={`Edit ${sectionLabel.toLowerCase()}`}
        className="btn btn-ghost btn-sm font-bold text-primary"
        onClick={() => onEditStep(editStepId)}
        type="button"
      >
        Edit
      </button>
    </div>
  );
}
