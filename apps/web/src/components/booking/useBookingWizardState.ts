import { computed, signal } from "@preact/signals";
import { useMemo } from "preact/hooks";
import { INITIAL_FORM_DATA, MAX_STEP } from "./constants";
import type { FormData, Step1FieldError, StepId } from "./types";
import { validateStep, validateStep1 } from "./validation";

interface UseBookingWizardStateResult {
  step: StepId;
  formValues: FormData;
  isSubmitting: boolean;
  submitError: string | null;
  /** Signal so the UI re-renders when set after Continue; read step1Error.value */
  step1Error: { value: Step1FieldError | null };
  isStepValid: boolean;
  handleFormSubmit: (e: Event) => void;
  dismissError: () => void;
  clearStep1Error: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepId: StepId) => void;
  setFormField: <K extends keyof Omit<FormData, "sensory">>(
    key: K,
    value: FormData[K]
  ) => void;
  setSensory: (key: keyof FormData["sensory"], value: boolean) => void;
}

// Encapsulates all state and behavior for the booking wizard.
// Consumers receive simple values and callbacks for rendering.
export function useBookingWizardState(): UseBookingWizardStateResult {
  const currentStep = useMemo(() => signal<StepId>(1), []);
  const formData = useMemo(
    () => signal<FormData>({ ...INITIAL_FORM_DATA }),
    []
  );
  const isSubmitting = useMemo(() => signal(false), []);
  const submitError = useMemo(() => signal<string | null>(null), []);
  const step1Error = useMemo(() => signal<Step1FieldError | null>(null), []);

  const isStepValidSignal = computed(() =>
    validateStep(currentStep.value, formData.value)
  );

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setFormField<K extends keyof Omit<FormData, "sensory">>(
    key: K,
    value: FormData[K]
  ) {
    formData.value = { ...formData.value, [key]: value };
    if (key === "name" || key === "contactDetail") {
      step1Error.value = null;
    }
  }

  function setSensory(key: keyof FormData["sensory"], value: boolean) {
    formData.value = {
      ...formData.value,
      sensory: { ...formData.value.sensory, [key]: value },
    };
  }

  function nextStep() {
    if (currentStep.value < MAX_STEP) {
      if (currentStep.value === 1) {
        const result = validateStep1(formData.value);
        if (!result.valid) {
          step1Error.value = { field: result.field, message: result.message };
          return;
        }
        step1Error.value = null;
      }
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

  function handleFormSubmit(e: Event) {
    e.preventDefault();
    if (
      currentStep.value === 5 &&
      isStepValidSignal.value &&
      !isSubmitting.value
    ) {
      handleSubmit();
    }
  }

  function dismissError() {
    submitError.value = null;
  }

  function clearStep1Error() {
    step1Error.value = null;
  }

  return {
    step: currentStep.value,
    formValues: formData.value,
    isSubmitting: isSubmitting.value,
    submitError: submitError.value,
    step1Error,
    isStepValid: isStepValidSignal.value,
    handleFormSubmit,
    dismissError,
    clearStep1Error,
    nextStep,
    prevStep,
    goToStep,
    setFormField,
    setSensory,
  };
}
