/**
 * Pure validation for booking steps. No framework imports.
 */

import type { FormData, StepId } from "./types";

const MIN_NAME_LENGTH = 2;
const MIN_CONTACT_DETAIL_LENGTH = 5;
const MIN_ADDRESS_LENGTH = 5;

/**
 * Returns whether the current step has valid data to proceed.
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
