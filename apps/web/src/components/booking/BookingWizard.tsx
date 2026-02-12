import { BookingInfoBanner } from "./BookingInfoBanner";
import { BookingNav } from "./BookingNav";
import { BookingProgress } from "./BookingProgress";
import { STEPS } from "./constants";
import { StepAboutYou } from "./StepAboutYou";
import { StepAppointment } from "./StepAppointment";
import { StepLocation } from "./StepLocation";
import { StepReview } from "./StepReview";
import { StepSensory } from "./StepSensory";
import { useBookingWizardState } from "./useBookingWizardState";

export default function BookingWizard() {
  const {
    step,
    formValues,
    isSubmitting,
    submitError,
    step1Error,
    isStepValid,
    handleFormSubmit,
    dismissError,
    nextStep,
    prevStep,
    goToStep,
    setFormField,
    setSensory,
  } = useBookingWizardState();

  return (
    <div className="min-h-screen bg-base-100 px-4 py-12 font-sans text-base-content">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-base-300 bg-base-200 shadow-xl">
        <div className="bg-primary p-8 text-primary-content">
          <h2 className="mb-6 font-bold text-2xl">
            Book an appointment with Lucy
          </h2>
          <BookingProgress
            currentStep={step}
            onStepClick={goToStep}
            steps={STEPS}
          />
        </div>

        <BookingInfoBanner />

        <form className="p-8" noValidate onSubmit={handleFormSubmit}>
          {submitError && (
            <div
              className="mb-6 rounded-xl border border-error bg-error/10 px-4 py-3 text-error"
              role="alert"
            >
              <p className="font-medium">{submitError}</p>
              <button
                aria-label="Dismiss error"
                className="mt-2 text-error underline underline-offset-2"
                onClick={() => {
                  dismissError();
                }}
                type="button"
              >
                Dismiss
              </button>
            </div>
          )}
          {step === 1 && (
            <StepAboutYou
              contactDetail={formValues.contactDetail}
              contactMethod={formValues.contactMethod}
              name={formValues.name}
              onContactDetailChange={(v) => setFormField("contactDetail", v)}
              onContactMethodChange={(v) => setFormField("contactMethod", v)}
              onNameChange={(v) => setFormField("name", v)}
              step1Error={step1Error.value}
            />
          )}

          {step === 2 && (
            <StepLocation
              address={formValues.address}
              onAddressChange={(v) => setFormField("address", v)}
            />
          )}

          {step === 3 && (
            <StepAppointment
              notes={formValues.notes}
              onNotesChange={(v) => setFormField("notes", v)}
              onPreferredTimeChange={(v) => setFormField("preferredTime", v)}
              onServiceChange={(v) => setFormField("service", v)}
              preferredTime={formValues.preferredTime}
              service={formValues.service}
            />
          )}

          {step === 4 && (
            <StepSensory
              onSensoryChange={setSensory}
              sensory={formValues.sensory}
            />
          )}

          {step === 5 && (
            <StepReview
              formData={formValues}
              isSubmitting={isSubmitting}
              onEditStep={goToStep}
            />
          )}

          <BookingNav
            currentStep={step}
            isStepValid={isStepValid}
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
