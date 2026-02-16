interface StepHeaderProps {
  title: string;
  description: string;
  descriptionClassName?: string;
}

/**
 * Shared header for each wizard step with title and description.
 */
export function StepHeader({
  title,
  description,
  descriptionClassName = "text-base-content/70",
}: StepHeaderProps) {
  return (
    <header>
      <h3 className="font-bold text-2xl text-base-content">{title}</h3>
      <p className={`mt-1 ${descriptionClassName}`}>{description}</p>
    </header>
  );
}
