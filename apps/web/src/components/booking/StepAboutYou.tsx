import type { StepAboutYouProps } from "./types";

const CONTACT_OPTIONS: { value: "Email" | "Text" | "Phone"; icon: string }[] = [
  { value: "Email", icon: "📧" },
  { value: "Text", icon: "📱" },
  { value: "Phone", icon: "📞" },
];

export function StepAboutYou({
  name,
  contactMethod,
  contactDetail,
  onNameChange,
  onContactMethodChange,
  onContactDetailChange,
}: StepAboutYouProps) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-bold text-2xl text-base-content">Your details</h2>
        <p className="mt-1 text-base-content/70">
          Tell us who you are and how we can reach you.
        </p>
      </header>

      <div className="space-y-6">
        <div>
          <label
            className="mb-2 block font-bold text-base-content text-sm"
            htmlFor="name"
          >
            Your full name
          </label>
          <input
            autoComplete="name"
            className="input input-bordered w-full rounded-2xl outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
            id="name"
            onInput={(e) => onNameChange((e.target as HTMLInputElement).value)}
            placeholder="e.g. Alex Smith"
            type="text"
            value={name}
          />
        </div>

        <fieldset className="space-y-4">
          <legend className="mb-4 font-bold text-base-content text-sm">
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
                <span aria-hidden="true" className="text-xl">
                  {opt.icon}
                </span>
                <span className="text-xs">{opt.value}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            className="mb-2 block font-bold text-base-content text-sm"
            htmlFor="detail"
          >
            {contactMethod} address or number
          </label>
          <input
            autoComplete={contactMethod === "Email" ? "email" : "tel"}
            className="input input-bordered w-full rounded-2xl outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
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
        </div>
      </div>
    </div>
  );
}
