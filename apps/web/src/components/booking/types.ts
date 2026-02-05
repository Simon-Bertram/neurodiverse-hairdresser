/**
 * Booking wizard types: form data, step ids, and component props.
 */

export type StepId = 1 | 2 | 3 | 4 | 5;

/** Sensory preference keys (camelCase) with boolean values. */
export interface SensoryPrefs {
  quiet: boolean;
  clipperWarning: boolean;
  noMusic: boolean;
  noWash: boolean;
  lightTouch: boolean;
  breaks: boolean;
  styleMenu: boolean;
  mirrorOptional: boolean;
  lowScent: boolean;
  digitalOnly: boolean;
  stepByStep: boolean;
  companion: boolean;
}

export type ContactMethod = "Email" | "Text" | "Phone";

export interface FormData {
  name: string;
  contactMethod: ContactMethod;
  contactDetail: string;
  address: string;
  service: string;
  preferredTime: string;
  notes: string;
  sensory: SensoryPrefs;
}

export interface StepConfig {
  id: StepId;
  label: string;
  icon: string;
}

export interface BookingProgressProps {
  currentStep: StepId;
  steps: StepConfig[];
  onStepClick: (stepId: StepId) => void;
}

export interface SensoryCheckProps {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export interface SensoryCategoryProps {
  title: string;
  icon: string;
  children: ComponentChildren;
}

export interface StepAboutYouProps {
  name: string;
  contactMethod: ContactMethod;
  contactDetail: string;
  onNameChange: (value: string) => void;
  onContactMethodChange: (value: ContactMethod) => void;
  onContactDetailChange: (value: string) => void;
}

export interface StepLocationProps {
  address: string;
  onAddressChange: (value: string) => void;
}

export interface StepAppointmentProps {
  service: string;
  preferredTime: string;
  notes: string;
  onServiceChange: (value: string) => void;
  onPreferredTimeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export interface StepSensoryProps {
  sensory: SensoryPrefs;
  onSensoryChange: (key: keyof SensoryPrefs, value: boolean) => void;
}

export interface StepReviewProps {
  formData: FormData;
  onEditStep: (stepId: StepId) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export interface BookingNavProps {
  currentStep: StepId;
  isStepValid: boolean;
  onPrev: () => void;
  onNext: () => void;
}
