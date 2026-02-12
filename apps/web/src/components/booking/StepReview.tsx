import type { SensoryPrefs, StepReviewProps } from "./types";

const RE_CAPITAL = /([A-Z])/g;
const RE_FIRST_CHAR = /^./;

function formatSensoryLabel(key: string): string {
  return key
    .replace(RE_CAPITAL, " $1")
    .replace(RE_FIRST_CHAR, (s) => s.toUpperCase())
    .trim()
    .toLowerCase();
}

export function StepReview({
  formData,
  onEditStep,
  isSubmitting,
}: StepReviewProps) {
  const selectedSensory = (
    Object.entries(formData.sensory) as [keyof SensoryPrefs, boolean][]
  )
    .filter(([, v]) => v)
    .map(([id]) => id);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-bold text-2xl text-base-content">Ready to send?</h2>
        <p className="mt-1 text-base-content/70">
          Please check your details. Click back if you need to fix anything.
        </p>
      </header>

      <div className="space-y-6 rounded-3xl border border-base-300 bg-base-200 p-8">
        <div className="flex items-start justify-between border-base-300 border-b pb-4">
          <div>
            <h3 className="mb-1 font-bold text-base-content/60 text-xs uppercase tracking-widest">
              Details
            </h3>
            <p className="font-bold text-base-content text-lg">
              {formData.name}
            </p>
            <p className="text-base-content/80">
              {formData.contactMethod}: {formData.contactDetail}
            </p>
          </div>
          <button
            aria-label="Edit details"
            className="btn btn-ghost btn-sm font-bold text-primary"
            onClick={() => onEditStep(1)}
            type="button"
          >
            Edit
          </button>
        </div>

        <div className="flex items-start justify-between border-base-300 border-b pb-4">
          <div>
            <h3 className="mb-1 font-bold text-base-content/60 text-xs uppercase tracking-widest">
              Address
            </h3>
            <p className="whitespace-pre-wrap text-base-content">
              {formData.address}
            </p>
          </div>
          <button
            aria-label="Edit address"
            className="btn btn-ghost btn-sm font-bold text-primary"
            onClick={() => onEditStep(2)}
            type="button"
          >
            Edit
          </button>
        </div>

        <div className="flex items-start justify-between border-base-300 border-b pb-4">
          <div>
            <h3 className="mb-1 font-bold text-base-content/60 text-xs uppercase tracking-widest">
              Appointment
            </h3>
            <p className="font-bold text-base-content text-lg">
              {formData.service}
            </p>
            <p className="text-base-content/80">
              {formData.preferredTime || "No time preference noted"}
            </p>
            {formData.notes && (
              <p className="mt-1 text-base-content/80 text-sm">
                {formData.notes}
              </p>
            )}
          </div>
          <button
            aria-label="Edit appointment"
            className="btn btn-ghost btn-sm font-bold text-primary"
            onClick={() => onEditStep(3)}
            type="button"
          >
            Edit
          </button>
        </div>

        <div>
          <h3 className="mb-2 font-bold text-base-content/60 text-xs uppercase tracking-widest">
            Sensory preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSensory.length > 0 ? (
              selectedSensory.map((id) => (
                <span
                  className="rounded-full bg-primary/20 px-3 py-1 font-bold text-primary text-xs"
                  key={id}
                >
                  {formatSensoryLabel(id)}
                </span>
              ))
            ) : (
              <p className="text-base-content/50 text-sm italic">
                No specific preferences selected.
              </p>
            )}
          </div>
          {formData.otherPreferences && (
            <p className="mt-3 whitespace-pre-wrap text-base-content/90 text-sm">
              {formData.otherPreferences}
            </p>
          )}
        </div>
      </div>

      <button
        aria-busy={isSubmitting}
        className="btn btn-success disabled:btn-disabled flex w-full items-center justify-center gap-3 py-6 font-bold text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-md" />
            Sending...
          </>
        ) : (
          <>
            <span>🚀</span>
            Send Booking Request
          </>
        )}
      </button>
    </div>
  );
}
