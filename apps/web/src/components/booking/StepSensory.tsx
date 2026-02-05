import { SENSORY_CATEGORIES, SENSORY_OPTIONS } from "./constants";
import { SensoryCategory } from "./SensoryCategory";
import { SensoryCheck } from "./SensoryCheck";
import type { StepSensoryProps } from "./types";

export function StepSensory({ sensory, onSensoryChange }: StepSensoryProps) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-bold text-2xl text-base-content">
          Sensory preferences (optional)
        </h2>
        <p className="mt-1 text-base-content/70">
          Tick anything that helps you feel comfortable. We will follow your
          choices.
        </p>
      </header>

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
      </div>
    </div>
  );
}
