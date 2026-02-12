import type { SensoryCategoryProps } from "./types";

/**
 * Groups sensory options with a title and icon for easier scanning.
 */
export function SensoryCategory({
  title,
  icon,
  children,
}: SensoryCategoryProps) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-base-300 bg-base-200 p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-3 font-bold text-primary">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-xl">
          {icon}
        </span>
        <span className="text-lg tracking-tight xl:text-xl">{title}</span>
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
