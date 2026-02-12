import { CONTACT_OPTIONS } from "./constants";
import type { StepAboutYouProps } from "./types";

export function StepAboutYou({
  name,
  contactMethod,
  contactDetail,
  step1Error,
  onNameChange,
  onContactMethodChange,
  onContactDetailChange,
}: StepAboutYouProps) {
  const nameError =
    step1Error?.field === "name" ? step1Error.message : undefined;
  const contactDetailError =
    step1Error?.field === "contactDetail" ? step1Error.message : undefined;

  return (
    <div className="space-y-8">
      <StepHeader
        description="Tell us who you are and how we can reach you."
        descriptionClassName="text-base-content/70 text-lg"
        title="Your details"
      />

      <div className="mb-4 space-y-8">
        <div>
          <label
            className="mb-3 block font-bold text-base-content text-lg xl:text-xl"
            htmlFor="name"
          >
            Your full name
          </label>
          <input
            aria-describedby={nameError ? "name-error" : undefined}
            aria-invalid={!!nameError}
            autoComplete="name"
            className={`input input-bordered w-full rounded-2xl text-md outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 ${
              nameError ? "input-error border-error" : ""
            }`}
            id="name"
            onInput={(e) => onNameChange((e.target as HTMLInputElement).value)}
            placeholder="e.g. Alex Smith"
            type="text"
            value={name}
          />
          {nameError && (
            <p className="mt-2 text-error text-sm" id="name-error" role="alert">
              {nameError}
            </p>
          )}
        </div>

        <fieldset className="space-y-8">
          <legend className="mb-4 font-bold text-base-content text-lg xl:text-xl">
            Preferred contact method
          </legend>
          <div className="grid grid-cols-3 gap-4">
            {CONTACT_OPTIONS.map((opt) => (
              <button
                aria-pressed={contactMethod === opt.value}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 font-bold transition-all ${
                  contactMethod === opt.value
                    ? "border-primary bg-primary/10 text-primary shadow-md ring-2 ring-primary/20"
                    : "border-base-300 bg-base-200 text-base-content/60 hover:border-base-content/30"
                }`}
                key={opt.value}
                onClick={() => onContactMethodChange(opt.value)}
                type="button"
              >
                <span aria-hidden="true" className="text-3xl">
                  {opt.icon}
                </span>
                <span className="text-md">{opt.value}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            className="mb-2 block font-bold text-base-content text-lg xl:text-xl"
            htmlFor="detail"
          >
            {contactMethod} address or number
          </label>
          <input
            aria-describedby={contactDetailError ? "detail-error" : undefined}
            aria-invalid={!!contactDetailError}
            autoComplete={contactMethod === "Email" ? "email" : "tel"}
            className={`input input-bordered w-full rounded-2xl text-md outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 ${
              contactDetailError ? "input-error border-error" : ""
            }`}
            id="detail"
            onInput={(e) =>
              onContactDetailChange((e.target as HTMLInputElement).value)
            }
            placeholder={
              contactMethod === "Email" ? "name@example.com" : "07..."
            }
            type={contactMethod === "Email" ? "email" : "tel"}
            value={contactDetail}
          />
          {contactDetailError && (
            <p
              className="mt-2 text-error text-sm"
              id="detail-error"
              role="alert"
            >
              {contactDetailError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
