import { computed, signal } from "@preact/signals";
import { useMemo } from "preact/hooks";
import { BookingInfoBanner } from "./BookingInfoBanner";
import { BookingNav } from "./BookingNav";
import { BookingProgress } from "./BookingProgress";
import { INITIAL_FORM_DATA, MAX_STEP, STEPS } from "./constants";
import { StepAboutYou } from "./StepAboutYou";
import { StepAppointment } from "./StepAppointment";
import { StepLocation } from "./StepLocation";
import { StepReview } from "./StepReview";
import { StepSensory } from "./StepSensory";
import type { FormData, StepId } from "./types";
import { validateStep } from "./validation";

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function BookingWizard() {
  const currentStep = useMemo(() => signal<StepId>(1), []);
  const formData = useMemo(
    () => signal<FormData>({ ...INITIAL_FORM_DATA }),
    []
  );
  const isSubmitting = useMemo(() => signal(false), []);
  const submitError = useMemo(() => signal<string | null>(null), []);

  const isStepValid = computed(() =>
    validateStep(currentStep.value, formData.value)
  );

  function setFormField<K extends keyof Omit<FormData, "sensory">>(
    key: K,
    value: FormData[K]
  ) {
    formData.value = { ...formData.value, [key]: value };
  }

  function setSensory(key: keyof FormData["sensory"], value: boolean) {
    formData.value = {
      ...formData.value,
      sensory: { ...formData.value.sensory, [key]: value },
    };
  }

  function nextStep() {
    if (currentStep.value < MAX_STEP) {
      currentStep.value = (currentStep.value + 1) as StepId;
      scrollToTop();
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value = (currentStep.value - 1) as StepId;
      scrollToTop();
    }
  }

  function goToStep(stepId: StepId) {
    if (stepId < currentStep.value) {
      currentStep.value = stepId;
      scrollToTop();
    }
  }

  async function handleSubmit() {
    if (isSubmitting.value) {
      return;
    }
    submitError.value = null;
    isSubmitting.value = true;
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData.value),
      });
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      window.location.href = "/book/thank-you";
    } catch (err) {
      console.error("Booking submit failed:", err);
      submitError.value =
        "Something went wrong. Please try again or contact us directly.";
    } finally {
      isSubmitting.value = false;
    }
  }

  const data = formData.value;
  const step = currentStep.value;

  return (
    <div className="min-h-screen bg-base-100 px-4 py-12 font-sans text-base-content">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-base-300 bg-base-200 shadow-xl">
        <div className="bg-primary p-8 text-primary-content">
          <h1 className="mb-6 font-bold text-2xl">
            Book an appointment with Lucy
          </h1>
          <BookingProgress
            currentStep={step}
            onStepClick={goToStep}
            steps={STEPS}
          />
        </div>

        <BookingInfoBanner />

        <form className="p-8" noValidate onSubmit={(e) => e.preventDefault()}>
          {submitError.value && (
            <div
              className="mb-6 rounded-xl border border-error bg-error/10 px-4 py-3 text-error"
              role="alert"
            >
              <p className="font-medium">{submitError.value}</p>
              <button
                aria-label="Dismiss error"
                className="mt-2 text-error underline underline-offset-2"
                onClick={() => {
                  submitError.value = null;
                }}
                type="button"
              >
                Dismiss
              </button>
            </div>
          )}
          {step === 1 && (
            <StepAboutYou
              contactDetail={data.contactDetail}
              contactMethod={data.contactMethod}
              name={data.name}
              onContactDetailChange={(v) => setFormField("contactDetail", v)}
              onContactMethodChange={(v) => setFormField("contactMethod", v)}
              onNameChange={(v) => setFormField("name", v)}
            />
          )}

          {step === 2 && (
            <StepLocation
              address={data.address}
              onAddressChange={(v) => setFormField("address", v)}
            />
          )}

          {step === 3 && (
            <StepAppointment
              notes={data.notes}
              onNotesChange={(v) => setFormField("notes", v)}
              onPreferredTimeChange={(v) => setFormField("preferredTime", v)}
              onServiceChange={(v) => setFormField("service", v)}
              preferredTime={data.preferredTime}
              service={data.service}
            />
          )}

          {step === 4 && (
            <StepSensory onSensoryChange={setSensory} sensory={data.sensory} />
          )}

          {step === 5 && (
            <StepReview
              formData={data}
              isSubmitting={isSubmitting.value}
              onEditStep={goToStep}
              onSubmit={handleSubmit}
            />
          )}

          <BookingNav
            currentStep={step}
            isStepValid={isStepValid.value}
            onNext={nextStep}
            onPrev={prevStep}
          />
        </form>
      </div>

      <footer className="mx-auto mt-12 max-w-2xl px-4 text-center text-base-content/60 text-sm leading-relaxed">
        <p>
          All data entered is kept private and used only for your appointment
          consultation.
        </p>
      </footer>
    </div>
  );
}
