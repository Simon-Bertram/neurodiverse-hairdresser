import type { SensoryCheckProps } from "./types";

/**
 * Large-target checkbox for sensory preferences. Controlled via props.
 */
export function SensoryCheck({
  id,
  label,
  checked,
  onToggle,
}: SensoryCheckProps) {
  return (
    <label
      className={`group flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
        checked
          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
          : "border-base-300 bg-base-200/50 hover:border-base-content/20"
      }`}
      htmlFor={id}
    >
      <div className="relative shrink-0">
        <input
          checked={checked}
          className="sr-only"
          id={id}
          onChange={() => onToggle()}
          type="checkbox"
        />
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-xl border-2 transition-all ${
            checked
              ? "border-primary bg-primary"
              : "border-base-300 bg-base-100 group-hover:border-base-content/40"
          }`}
        >
          {checked && (
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-primary-content"
              fill="none"
              stroke="currentColor"
              strokeWidth={4}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Checkmark</title>
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span
        className={`font-bold text-sm leading-tight ${
          checked ? "text-base-content" : "text-base-content/80"
        }`}
      >
        {label}
      </span>
    </label>
  );
}
