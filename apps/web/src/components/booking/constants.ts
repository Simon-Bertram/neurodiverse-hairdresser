/**
 * Booking wizard constants: steps, initial form data, services, sensory options.
 */

import type { FormData, SensoryPrefs, StepConfig, StepId } from "./types";

export const STEPS: StepConfig[] = [
  { id: 1, label: "About You", icon: "👤" },
  { id: 2, label: "Location", icon: "📍" },
  { id: 3, label: "Service", icon: "✂️" },
  { id: 4, label: "Sensory", icon: "✨" },
  { id: 5, label: "Review", icon: "📋" },
];

const initialSensory: SensoryPrefs = {
  quiet: false,
  clipperWarning: false,
  noMusic: false,
  noWash: false,
  lightTouch: false,
  breaks: false,
  styleMenu: false,
  mirrorOptional: false,
  lowScent: false,
  digitalOnly: false,
  stepByStep: false,
  companion: false,
};

export const INITIAL_FORM_DATA: FormData = {
  name: "",
  contactMethod: "Email",
  contactDetail: "",
  address: "",
  service: "",
  preferredTime: "",
  notes: "",
  otherPreferences: "",
  sensory: { ...initialSensory },
};

export const SERVICES: { value: string; label: string }[] = [
  { value: "cut", label: "Cut" },
  { value: "colour", label: "Colour" },
  { value: "styling", label: "Styling" },
  { value: "cut-and-colour", label: "Cut and colour" },
  { value: "other", label: "Other (describe in message)" },
];

export interface SensoryOption {
  id: keyof SensoryPrefs;
  label: string;
  categoryId: string;
}

export const SENSORY_OPTIONS: SensoryOption[] = [
  { id: "quiet", label: "Prefer quiet / minimal chat", categoryId: "auditory" },
  {
    id: "clipperWarning",
    label: "Tell me before using clippers or loud tools",
    categoryId: "auditory",
  },
  { id: "noWash", label: "Prefer dry cut (no wash)", categoryId: "tactile" },
  { id: "lightTouch", label: "Light touch only", categoryId: "tactile" },
  {
    id: "breaks",
    label: "Offer breaks during the appointment",
    categoryId: "tactile",
  },
  {
    id: "styleMenu",
    label: "Show me a style menu or pictures",
    categoryId: "visual",
  },
  {
    id: "mirrorOptional",
    label: "I prefer not to see myself in the mirror during the appointment",
    categoryId: "visual",
  },
  {
    id: "lowScent",
    label: "Low or no scent products",
    categoryId: "olfactory",
  },
  {
    id: "digitalOnly",
    label: "Prefer to book and communicate by text/email only",
    categoryId: "social",
  },
  {
    id: "stepByStep",
    label: "Tell me each step before you do it",
    categoryId: "social",
  },
  {
    id: "companion",
    label: "Carer or companion may be present",
    categoryId: "social",
  },
];

export const SENSORY_CATEGORIES: { id: string; title: string; icon: string }[] =
  [
    { id: "auditory", title: "Auditory (Sound)", icon: "👂" },
    { id: "tactile", title: "Tactile (Touch)", icon: "🤲" },
    { id: "visual", title: "Visual", icon: "👁️" },
    { id: "olfactory", title: "Olfactory (Smell)", icon: "🌸" },
    { id: "social", title: "Social & Cognitive", icon: "💬" },
  ];

export const MAX_STEP: StepId = 5;
