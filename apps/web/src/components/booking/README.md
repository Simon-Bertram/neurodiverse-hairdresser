## Booking wizard overview

This folder contains the multi-step booking experience used on the site.
It is built as a small, self-contained flow with:

- **`BookingWizard`**: top-level UI shell and orchestration of the step
  components.
- **`useBookingWizardState`**: all state and behavior for the wizard,
  including validation, navigation, and submission.
- **Step components** (`StepAboutYou`, `StepLocation`, `StepAppointment`,
  `StepSensory`, `StepReview`): presentational components for each step.
- **Navigation components** (`BookingProgress`, `BookingNavSteps` /
  `BookingNav`): visual progress indicator and Back/Continue controls.
- **`constants` / `types` / `validation`**: shared configuration and
  types (step list, max step, form data shape, validation rules).

The goal is to keep the screen component (`BookingWizard`) mostly
declarative and push all logic into the hook and helpers.

---

## Data flow and responsibilities

- **State source of truth**: `useBookingWizardState` keeps the current
  step and the full `FormData` in Preact signals.
- **Top-level component**: `BookingWizard` calls the hook and passes
  simple props into each step component.
- **Step components**:
  - Receive only the data they need for their fields.
  - Receive callbacks like `onNameChange` that call `setFormField` or
    `setSensory` from the hook.
  - Stay dumb/presentational: no knowledge of other steps.
- **Validation**:
  - `validateStep` and `validateStep1` live in `validation.ts`.
  - The hook uses these to drive:
    - `isStepValid` (for enabling/disabling Continue).
    - `step1Error` (to show inline errors on step 1).
- **Navigation**:
  - `nextStep` and `prevStep` mutate the `currentStep` signal and call
    `scrollFormIntoView` for a smooth UX.
  - `goToStep` only allows going *backwards* from the progress bar.
- **Submission**:
  - `handleFormSubmit` is attached to the `<form>` element.
  - On the final step, if `isStepValid` is true and not already
    submitting, it calls `actions.send(formData.value)` from
    `astro:actions` and redirects on success.

---

## Step-by-step recipe: rebuilding this wizard

Use this section as a guide if you ever want to build another multi-step
flow with the same pattern.

### 1. Define your form model and steps

- **Create `types.ts`**:
  - Define a `FormData` interface for the entire flow.
  - Define a `StepId` union (e.g. `1 | 2 | 3 | 4 | 5`).
  - Define any helper types (e.g. `BookingNavProps`, error shapes).
- **Create `constants.ts`**:
  - Export `INITIAL_FORM_DATA` with default values for `FormData`.
  - Export `MAX_STEP` (last numeric step).
  - Export `STEPS`, an array of `{ id, label }` used by progress UI and
    navigation components.

This gives you a strongly-typed, central definition of the flow.

### 2. Implement validation helpers

- **Create `validation.ts`**:
  - Add `validateStep(stepId, formData)` to answer
    "is this step complete enough to continue?".
  - Add any per-step helpers like `validateStep1` when you need richer
    error information (field name, message, etc.).
- Keep validation pure (no DOM or side effects) so it is easy to reuse
  and test.

### 3. Build `useBookingWizardState`

In `useBookingWizardState.ts`:

- Use Preact signals to store:
  - `currentStep: StepId`.
  - `formData: FormData`.
  - `isSubmitting: boolean`.
  - `submitError: string | null`.
  - Any per-step error signals (e.g. `step1Error`).
- Derive `isStepValid` with `computed(() => validateStep(...))`.
- Implement helpers:
  - `setFormField(key, value)` to update non-nested fields in
    `formData`.
  - `setSensory(key, value)` (or equivalent) for nested structures.
  - `nextStep` / `prevStep` with bounds checks and step-specific
    validation (e.g. `validateStep1` before leaving step 1).
  - `goToStep` that only allows going backwards.
  - `scrollFormIntoView` that scrolls `#booking-form` into view on
    step changes.
  - `handleSubmit` that:
    - Guards against duplicate submissions with `isSubmitting`.
    - Calls the relevant `actions.*` function.
    - Handles errors and redirects on success.
  - `handleFormSubmit(e)` to:
    - `e.preventDefault()`.
    - On the last step and valid state, call `handleSubmit()`.
- Return a simple object of values and callbacks that the UI can use
  without knowing about signals.

The key idea: **all mutation and branching lives here**, not in the step
components.

### 4. Build the presentational steps

For each step component (e.g. `StepAboutYou`, `StepLocation`, etc.):

- Accept only the data and callbacks needed for that step.
- Render fields using props like:
  - `value={name}`
  - `onInput={(e) => onNameChange(e.currentTarget.value)}`
- Show any step-specific errors (e.g. `step1Error`) based on props.
- Do not import or touch `useBookingWizardState` directly.

This keeps each step self-contained and re-usable.

### 5. Build navigation and progress components

- **Progress (`BookingProgress`)**:
  - Accepts `currentStep`, `steps`, and `onStepClick`.
  - Renders the timeline/steps UI.
  - Calls `onStepClick(step.id)` when a user clicks a prior step.
- **Nav buttons (`BookingNavSteps` / `BookingNav`)**:
  - Accept `currentStep`, `isStepValid`, `onPrev`, `onNext`.
  - Hide themselves when `currentStep === MAX_STEP` (review screen has
    its own submit).
  - Disable the Continue button when `!isStepValid`.

These components know nothing about the form fields; they only
understand step indexes and labels.

### 6. Compose everything in `BookingWizard`

In `BookingWizard.tsx`:

- Call `useBookingWizardState()` at the top and destructure values:
  `step`, `formValues`, `isSubmitting`, `submitError`, etc.
- Wrap everything in a `<form>`:
  - `onSubmit={handleFormSubmit}`
  - `noValidate` (client-side validation is handled manually here).
- Conditionally render step components:
  - `step === 1 && <StepAboutYou ... />`
  - `step === 2 && <StepLocation ... />`
  - etc.
- Pass the right slice of `formValues` plus callbacks from the hook.
- Render `BookingNavSteps` at the bottom with:
  - `currentStep={step}`
  - `isStepValid={isStepValid}`
  - `onNext={nextStep}`
  - `onPrev={prevStep}`
- Render the error banner when `submitError` is non-null and wire up
  `dismissError`.

The `BookingWizard` should read almost like a declarative storyboard of
the flow.

---

## How to adapt this pattern for a new flow

When you build another multi-step form elsewhere:

- **Copy the structure, not the domain**:
  - Recreate: `types.ts`, `constants.ts`, `validation.ts`,
    `useXWizardState.ts`, step components, nav/progress components, and
    the top-level `XWizard` component.
- **Keep responsibilities the same**:
  - All business logic, navigation rules, and submission live in the
    hook and helpers.
  - Step components are stateless/controlled by props.
  - The top-level component just wires steps together.
- **Adjust only what is domain-specific**:
  - `FormData` fields.
  - Validation rules.
  - Number of steps and labels (`STEPS`, `MAX_STEP`).
  - The action you call on submit (`actions.*` target and redirect).

If you follow this recipe, you will end up with a predictable, easily
testable multi-step flow that matches the existing booking experience.

