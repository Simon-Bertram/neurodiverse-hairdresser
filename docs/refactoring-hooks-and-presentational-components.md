## Refactoring to hooks and presentational components

This guide walks through how to take a stateful, logic-heavy component and refactor it into:

- **A custom hook** that owns all state and side effects.
- **A presentational component** that just renders UI based on values and callbacks from the hook.

It uses the booking wizard as a concrete example, but the patterns apply to any feature.

---

## 1. When to extract a hook

Extract a `useXxx` hook when:

- **State and side effects are intertwined with markup** and hard to reason about.
- **Multiple UI variants** (or future variants) could share the same behaviour.
- You want **easier unit testing** of logic without rendering full components.
- You want to **separate concerns**:
  - Hook: "what happens" (data flow, side effects, validation).
  - Component: "what it looks like" (layout, styling, markup).

For the booking wizard:

- The wizard logic (steps, navigation, validation, submit) is **independent**
  of how the form is styled or arranged.
- That logic is a perfect fit for a `useBookingWizardState` hook.

---

## 2. Identify responsibilities before refactoring

Start by scanning the existing component and marking each piece as:

- **State/logic**:
  - Signals / state initialisation.
  - Derived values (e.g. `isStepValid`).
  - Event handlers (e.g. `handleSubmit`, `nextStep`).
  - Side effects (e.g. `fetch`, navigation, scroll).
- **Presentation**:
  - JSX / HTML structure.
  - Tailwind classes / styling.
  - Composition of subcomponents.

In the original `BookingWizard`:

- **Logic** included:
  - `currentStep`, `formData`, `isSubmitting`, `submitError` signals.
  - `isStepValid` computed from `currentStep` and `formData`.
  - `nextStep`, `prevStep`, `goToStep`.
  - `setFormField`, `setSensory`.
  - `handleSubmit` for sending the request and redirecting.
  - Form-level submit logic to guard when submission is allowed.
- **Presentation** included:
  - Overall page layout, header, footer.
  - Progress bar.
  - Step-specific components.
  - Nav buttons.

Everything in the **logic** list is a candidate to move into the hook.

---

## 3. Designing the hook API

Before writing code, decide what the hook should expose. A good hook:

- Returns **plain values** (no need to leak signals outside).
- Returns **callbacks** for everything the UI can ask it to do.
- Hides implementation details (signals, `fetch`, scrolling, etc.).

For the wizard, a clean hook API looks like this (TypeScript, simplified):

```ts
interface UseBookingWizardStateResult {
  step: StepId
  formValues: FormData
  isSubmitting: boolean
  submitError: string | null
  isStepValid: boolean

  handleFormSubmit: (e: Event) => void
  dismissError: () => void

  nextStep: () => void
  prevStep: () => void
  goToStep: (stepId: StepId) => void

  setFormField: <K extends keyof Omit<FormData, 'sensory'>>(
    key: K,
    value: FormData[K],
  ) => void
  setSensory: (key: keyof FormData['sensory'], value: boolean) => void
}
```

Key points:

- The hook **returns values**, not signals. The presentational layer does not
  need to know that signals are used internally.
- All mutations and side effects happen through **methods** on the hook.

---

## 4. Implementing the hook (with signals)

Inside the hook you:

1. Initialise signals.
2. Create derived values with `computed`.
3. Define helpers for updating state.
4. Define side-effecting operations (e.g. `fetch`).
5. Wire a single form submit handler that ties it all together.

Core pieces from `useBookingWizardState`:

```ts
export function useBookingWizardState(): UseBookingWizardStateResult {
  const currentStep = useMemo(() => signal<StepId>(1), [])
  const formData = useMemo(
    () => signal<FormData>({ ...INITIAL_FORM_DATA }),
    [],
  )
  const isSubmitting = useMemo(() => signal(false), [])
  const submitError = useMemo(() => signal<string | null>(null), [])

  const isStepValidSignal = computed(() =>
    validateStep(currentStep.value, formData.value),
  )

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setFormField<K extends keyof Omit<FormData, 'sensory'>>(
    key: K,
    value: FormData[K],
  ) {
    formData.value = { ...formData.value, [key]: value }
  }

  function setSensory(key: keyof FormData['sensory'], value: boolean) {
    formData.value = {
      ...formData.value,
      sensory: { ...formData.value.sensory, [key]: value },
    }
  }

  function nextStep() {
    if (currentStep.value < MAX_STEP) {
      currentStep.value = (currentStep.value + 1) as StepId
      scrollToTop()
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value = (currentStep.value - 1) as StepId
      scrollToTop()
    }
  }

  function goToStep(stepId: StepId) {
    if (stepId < currentStep.value) {
      currentStep.value = stepId
      scrollToTop()
    }
  }
```

The submit behaviour is also encapsulated:

```ts
  async function handleSubmit() {
    if (isSubmitting.value) {
      return
    }
    submitError.value = null
    isSubmitting.value = true
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.value),
      })
      // ... handle redirects and errors ...
    } catch (err) {
      console.error('Booking submit failed:', err)
      submitError.value =
        'Something went wrong. Please try again or contact us directly.'
    } finally {
      isSubmitting.value = false
    }
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault()
    if (
      currentStep.value === 5 &&
      isStepValidSignal.value &&
      !isSubmitting.value
    ) {
      handleSubmit()
    }
  }
```

Finally, **only plain values and functions** are exposed:

```ts
  function dismissError() {
    submitError.value = null
  }

  return {
    step: currentStep.value,
    formValues: formData.value,
    isSubmitting: isSubmitting.value,
    submitError: submitError.value,
    isStepValid: isStepValidSignal.value,
    handleFormSubmit,
    dismissError,
    nextStep,
    prevStep,
    goToStep,
    setFormField,
    setSensory,
  }
}
```

This keeps the hook as the **single source of truth** for behaviour.

---

## 5. Refactoring the component to be presentational

Once the hook exists, the component:

- Calls the hook once at the top.
- Destructures the returned values and callbacks.
- Passes them down to child components.
- Does **not** own state or side effects anymore.

Refactored `BookingWizard`:

```ts
export default function BookingWizard() {
  const {
    step,
    formValues,
    isSubmitting,
    submitError,
    isStepValid,
    handleFormSubmit,
    dismissError,
    nextStep,
    prevStep,
    goToStep,
    setFormField,
    setSensory,
  } = useBookingWizardState()

  return (
    <div className="min-h-screen bg-base-100 px-4 py-12 font-sans text-base-content">
      {/* layout + progress */}
      <form className="p-8" noValidate onSubmit={handleFormSubmit}>
        {submitError && (
          <div role="alert">
            <p>{submitError}</p>
            <button type="button" onClick={dismissError}>
              Dismiss
            </button>
          </div>
        )}

        {/* Steps */}
        {step === 1 && (
          <StepAboutYou
            contactDetail={formValues.contactDetail}
            contactMethod={formValues.contactMethod}
            name={formValues.name}
            onContactDetailChange={(v) => setFormField('contactDetail', v)}
            onContactMethodChange={(v) => setFormField('contactMethod', v)}
            onNameChange={(v) => setFormField('name', v)}
          />
        )}

        {/* ... other steps ... */}

        <BookingNav
          currentStep={step}
          isStepValid={isStepValid}
          onNext={nextStep}
          onPrev={prevStep}
        />
      </form>
    </div>
  )
}
```

The component is now **easy to read**: it describes *what* is rendered, not *how* the logic works.

---

## 6. General recipe you can reuse

When you want to apply this pattern elsewhere:

1. **Identify logic vs UI**
   - Mark all state, derived state, event handlers, and side effects.
   - Everything in that list is a candidate for the hook.

2. **Design the hook API**
   - Decide what values the UI needs.
   - Decide what actions it should be able to trigger.
   - Keep the surface small and focused.

3. **Implement the hook**
   - Initialise signals / state.
   - Add derived values (`computed`, `useMemo`, etc.).
   - Implement helpers and side effects.
   - Return only plain values and callbacks.

4. **Refactor the component**
   - Replace internal state with `const x = useXxx()`.
   - Wire values and callbacks into JSX.
   - Remove now-unneeded logic from the component.

5. **Test behaviour**
   - Ensure the UI still behaves the same (steps, validation, submit).
   - Optionally, write unit tests against the hook’s API.

---

## 7. When not to extract a hook

Hook extraction is powerful, but you do not always need it. Avoid it when:

- The component is **very small** and unlikely to grow.
- Logic is truly **one-off** and cannot reasonably be reused.
- The extra indirection would **hurt clarity** more than help.

As a rule of thumb:

- If the logic section of a component is more than ~30–40 lines,
  or if you have **multiple event handlers and derived states**,
  consider a hook.

---

## 8. Applying this to other features

You can use the same pattern for:

- Multi-step onboarding and wizards.
- Search/filter panels (query state, debounced fetch, pagination).
- Complex form flows (validation, error handling, submission).
- Client-side feature toggles or experiments.

Each time:

- **Hook name**: `useXFeatureState` or `useXFeature`.
- **Presentational component name**: `XFeature`, `XFeaturePanel`, `XFeatureForm`.

This keeps your codebase **predictable**: developers learn once how hooks
and presentational components are structured, then recognise the pattern
everywhere else.

