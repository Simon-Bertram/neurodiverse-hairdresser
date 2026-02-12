/**
 * Validation for booking steps. Uses Zod for step 1 (Your details).
 */

import { z } from "zod";
import type { FormData, StepId } from "./types";

const MIN_NAME_LENGTH = 2;
const MIN_CONTACT_DETAIL_LENGTH = 5;
const MIN_ADDRESS_LENGTH = 5;

/** RFC 5322–style local part + @ + domain (simplified, practical). */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Returns true if the string is a valid email address.
 */
export function isValidEmail(s: string): boolean {
  const t = s.trim();
  return t.length >= 5 && EMAIL_REGEX.test(t);
}

/** UK numbers: 10–11 digits, 07 (mobile) or 01/02/03 (geographic). */
const UK_PHONE_REGEX = /^0(1|2|3|7)\d{8,9}$/;

/**
 * Returns true if the string is a valid UK phone number (mobile 07xxx or
 * geographic 01/02/03, 10–11 digits, optional +44).
 */
export function isValidUkPhone(s: string): boolean {
  const digits = s.replace(/\D/g, "");
  const normalized =
    digits.startsWith("44") && digits.length === 12
      ? `0${digits.slice(2)}`
      : digits;
  if (normalized.length !== 10 && normalized.length !== 11) {
    return false;
  }
  return UK_PHONE_REGEX.test(normalized);
}

/** Contact method for step 1; mirrors ContactMethod type. */
const contactMethodSchema = z.enum(["Email", "Text", "Phone"]);

/**
 * Schema for step 1 (Your details). Validates name length and contact detail
 * as email or UK phone depending on contactMethod.
 */
export const step1Schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        MIN_NAME_LENGTH,
        "Please enter your full name (at least 2 characters)."
      ),
    contactMethod: contactMethodSchema,
    contactDetail: z
      .string()
      .trim()
      .min(
        MIN_CONTACT_DETAIL_LENGTH,
        "Please enter an email address or UK phone number."
      ),
  })
  .superRefine((data, ctx) => {
    const contact = data.contactDetail.trim();
    if (data.contactMethod === "Email") {
      if (!isValidEmail(contact)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contactDetail"],
          message: "Please enter a valid email address.",
        });
      }
    } else if (!isValidUkPhone(contact)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contactDetail"],
        message: "Please enter a valid UK phone number (e.g. 07xxx or 01xxx).",
      });
    }
  });

/** Inferred step 1 shape; aligns with FormData fields name, contactMethod, contactDetail. */
export type Step1Data = z.infer<typeof step1Schema>;

export interface Step1ValidationResult {
  valid: true;
}
export interface Step1ValidationError {
  valid: false;
  field: "name" | "contactDetail";
  message: string;
}

/** Maps Zod path to our step 1 field name for UI. */
function step1FieldFromPath(
  path: (string | number)[]
): "name" | "contactDetail" {
  const key = path[0];
  if (key === "name") {
    return "name";
  }
  return "contactDetail";
}

/**
 * Validates step 1 using the Zod schema. Returns a result compatible with
 * Step1ValidationResult / Step1ValidationError for use by the wizard.
 */
function validateStep1WithZod(
  data: FormData
): Step1ValidationResult | Step1ValidationError {
  const result = step1Schema.safeParse({
    name: data.name,
    contactMethod: data.contactMethod,
    contactDetail: data.contactDetail,
  });
  if (result.success) {
    return { valid: true };
  }
  const first = result.error.issues[0];
  const field = first
    ? step1FieldFromPath(first.path as (string | number)[])
    : "contactDetail";
  const message = first?.message ?? "Please check your details.";
  return { valid: false, field, message };
}

/**
 * Validates step 1 (Your details). Call on Continue to get field-level errors.
 * Returns which field is wrong so the UI can show it only after submit.
 */
export function validateStep1(
  data: FormData
): Step1ValidationResult | Step1ValidationError {
  return validateStep1WithZod(data);
}

/**
 * Returns whether the current step has valid data to proceed. For step 1 this
 * uses a cheap length check only so the user can click Continue and see
 * field-level errors; strict validation (email/UK phone) is Zod-based in
 * validateStep1.
 */
export function validateStep(stepId: StepId, data: FormData): boolean {
  switch (stepId) {
    case 1:
      return (
        data.name.trim().length >= MIN_NAME_LENGTH &&
        data.contactDetail.trim().length >= MIN_CONTACT_DETAIL_LENGTH
      );
    case 2:
      return data.address.trim().length >= MIN_ADDRESS_LENGTH;
    case 3:
      return data.service.trim().length > 0;
    case 4:
    case 5:
      return true;
    default:
      return false;
  }
}
