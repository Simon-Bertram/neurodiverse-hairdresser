import { StepHeader } from "./StepHeader";
import type { StepLocationProps } from "./types";

export function StepLocation({ address, onAddressChange }: StepLocationProps) {
  return (
    <div className="space-y-8">
      <StepHeader
        description="We visit Bournemouth, Poole, and surrounding areas (within 25 miles)."
        title="Address"
      />

      <div>
        <label
          className="mb-2 block font-bold text-base-content text-lg xl:text-xl"
          htmlFor="address"
        >
          Full address or postcode
        </label>
        <textarea
          className="textarea textarea-bordered w-full rounded-2xl leading-relaxed outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
          id="address"
          onInput={(e) =>
            onAddressChange((e.target as HTMLTextAreaElement).value)
          }
          placeholder="Street, Town, Postcode"
          rows={4}
          value={address}
        />
      </div>
    </div>
  );
}
