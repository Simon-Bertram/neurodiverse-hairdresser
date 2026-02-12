import { SERVICES } from "./constants";
import type { StepAppointmentProps } from "./types";

export function StepAppointment({
  service,
  preferredTime,
  notes,
  onServiceChange,
  onPreferredTimeChange,
  onNotesChange,
}: StepAppointmentProps) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-bold text-2xl text-base-content">Appointment</h2>
        <p className="mt-1 text-base-content/70 text-lg xl:text-xl">
          What can Lucy do for you today?
        </p>
      </header>

      <div className="space-y-6">
        <div>
          <label
            className="mb-2 block font-bold text-base-content text-lg xl:text-xl"
            htmlFor="service"
          >
            Service you want
          </label>
          <select
            className="select select-bordered w-full cursor-pointer appearance-none rounded-2xl outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
            id="service"
            onInput={(e) =>
              onServiceChange((e.target as HTMLSelectElement).value)
            }
            value={service}
          >
            <option disabled value="">
              Choose a service...
            </option>
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-2 block font-bold text-base-content text-lg xl:text-xl"
            htmlFor="times"
          >
            Preferred days or times
          </label>
          <input
            className="input input-bordered w-full rounded-2xl outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
            id="times"
            onInput={(e) =>
              onPreferredTimeChange((e.target as HTMLInputElement).value)
            }
            placeholder="e.g. Tuesday mornings or anytime Friday"
            type="text"
            value={preferredTime}
          />
        </div>

        <div>
          <label
            className="mb-2 block font-bold text-base-content text-lg xl:text-xl"
            htmlFor="notes"
          >
            Any questions or notes?
          </label>
          <textarea
            className="textarea textarea-bordered w-full rounded-2xl outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
            id="notes"
            onInput={(e) =>
              onNotesChange((e.target as HTMLTextAreaElement).value)
            }
            placeholder="Tell us about your hair or ask a question..."
            rows={3}
            value={notes}
          />
        </div>
      </div>
    </div>
  );
}
