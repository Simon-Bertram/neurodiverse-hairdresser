import { SENSORY_CATEGORIES, SENSORY_OPTIONS } from "./constants";
import { SensoryCategory } from "./SensoryCategory";
import { SensoryCheck } from "./SensoryCheck";
import { StepHeader } from "./StepHeader";
import type { StepSensoryProps } from "./types";

export function StepSensory({
  sensory,
  otherPreferences,
  onSensoryChange,
  onOtherPreferencesChange,
}: StepSensoryProps) {
  return (
    <div className="space-y-8">
      <StepHeader
        description="Tick anything that helps you feel comfortable. We will follow your choices."
        title="Sensory preferences (optional)"
      />

      <div className="space-y-6">
        {SENSORY_CATEGORIES.map((cat) => {
          const options = SENSORY_OPTIONS.filter(
            (opt) => opt.categoryId === cat.id
          );
          if (options.length === 0) {
            return null;
          }
          return (
            <SensoryCategory icon={cat.icon} key={cat.id} title={cat.title}>
              {options.map((opt) => (
                <SensoryCheck
                  checked={sensory[opt.id]}
                  id={opt.id}
                  key={opt.id}
                  label={opt.label}
                  onToggle={() => onSensoryChange(opt.id, !sensory[opt.id])}
                />
              ))}
            </SensoryCategory>
          );
        })}

        <div>
          <label
            className="mb-2 block font-bold text-base-content text-lg xl:text-xl"
            htmlFor="other-preferences"
          >
            Any other preferences
          </label>
          <textarea
            className="textarea textarea-bordered w-full rounded-2xl text-md outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
            id="other-preferences"
            onInput={(e) =>
              onOtherPreferencesChange((e.target as HTMLTextAreaElement).value)
            }
            placeholder="Anything else we should know?"
            rows={3}
            value={otherPreferences}
          />
        </div>
      </div>
    </div>
  );
}
