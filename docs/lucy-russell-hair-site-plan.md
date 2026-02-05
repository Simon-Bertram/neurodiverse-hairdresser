---
name: lucy-russell-hair-site
overview: Design and implement an accessible, low-stimulus Astro site for Lucy Russell Hair with clear navigation, booking flow, and sensory-friendly content for neurodivergent clients and carers.
todos:
  - id: setup-structure
    content: "Confirm or adjust Astro routing and layout structure for the pages: Home, Services, Before Your Visit, Book, Contact, Staff."
    status: pending
  - id: theme-config
    content: Define Tailwind + DaisyUI calm and high-contrast themes and wire up a colour mode toggle component.
    status: pending
  - id: layout-header
    content: Implement the main layout, fixed header navigation, breadcrumbs component, and base typography/motion-reduction utilities.
    status: pending
  - id: page-content
    content: Implement accessible, plain-language content for all core pages, including the detailed Before Your Visit social story and staff profile.
    status: pending
  - id: booking-form
    content: Implement the booking page form with grouped sensory preference checkboxes and simple, accessible validation/thank-you flow.
    status: pending
isProject: false
---

# Plan for Lucy Russell Hair calm, sensory-friendly website

## Overall architecture

- **Astro app layout**: Use a single shared layout in `[apps/web/src/layouts/Layout.astro](apps/web/src/layouts/Layout.astro)` with semantic regions: `<header>`, `<nav>`, `<main>`, `<footer>`. Apply generous padding/margins (e.g. `p-10`, `m-4`) and a max-width container for focused reading.
- **Routing structure**: Use Astro file-based routes under `[apps/web/src/pages](apps/web/src/pages)`:
  - `index.astro` → Home
  - `services.astro` → Services & Pricing
  - `before-your-visit.astro` → Social Story & checklist
  - `book.astro` → Booking flow with sensory profile
  - `contact.astro` → Contact options
  - `staff.astro` → Staff profile page for Lucy
- **Styling stack**: Configure Tailwind + DaisyUI themes for calm vs high-contrast modes, keeping typography readable (e.g. Inter or Open Dyslexic for body) and avoiding italics.

## Navigation, header, and layout

- **Fixed header**: Implement a simple, fixed header component in `[apps/web/src/components/Header.astro](apps/web/src/components/Header.astro)` with site name "Lucy Russell Hair" and 4–5 clear links: Home, Services, Before Your Visit, Book Now, Contact (and optional Staff/About).
- **Accessible nav**: Use `<nav>` with an unordered list, visible focus states, `aria-current="page"` on the active link, and large tap targets.
- **Breadcrumbs**: Create a reusable `Breadcrumbs` component (e.g. `[apps/web/src/components/breadcrumbs.astro](apps/web/src/components/breadcrumbs.astro)`) and use it on multi-step or non-home pages, especially `book.astro` and `before-your-visit.astro`.
- **Motion reduction**: Add a small set of utility classes or base styles (e.g. in a global CSS file) that wrap transitions in `@media (prefers-reduced-motion: no-preference)` and keep transitions to simple opacity/colour changes.

## Color modes and theming

- **Themes**: Define two DaisyUI themes in `tailwind.config`:
  - **Calm mode** (default): muted greens/blues or pastel palette with neutral grey text, generous white space.
  - **High-contrast mode**: WCAG AA-compliant high contrast (dark text on light background or vice versa), checked for key text/background pairs.
- **Toggle component**: Build a `ColorModeToggle` component (e.g. `[apps/web/src/components/color-mode-toggle.astro](apps/web/src/components/color-mode-toggle.astro)`) placed in the header, using a clear label like "Colour mode" with two states (Calm / High contrast), keyboard accessible and with `aria-pressed` or `role="switch"`.
- **Persistence**: Store the chosen mode in `localStorage` and apply via `data-theme` on `<html>` or `<body>`, with a no-flash strategy (small inline script to read preference before paint).

## Typography and base accessibility

- **Fonts**: Configure a readable sans-serif font (e.g. Inter via CSS/import) as default, with an optional alternate class for Open Dyslexic if desired. Ensure base font size is at least 16px and line-height ~1.5.
- **Headings and structure**: Use one `<h1>` per page with clear, literal titles (e.g. "Calm, sensory-friendly hair services" on Home), followed by `<h2>` sections for content blocks.
- **Copy style**: Write short sentences, avoid idioms, and use bullet lists for options and checklists across all pages.

## Page-by-page content

- **Home (`index.astro`)**
  - Hero section with clear value proposition: "Calm, sensory-friendly hair services at home in Bournemouth, Poole and surrounding areas (within 25 miles)."
  - Primary CTA button "Book a quiet appointment" linking to `/book` and secondary link to "Before your visit" for people wanting details first.
  - Brief reassurance bullets: sensory-aware training, home visits only, no surprises, flexible communication.
- **Services & Pricing (`services.astro`)**
  - For each service (e.g. Cut, Colour, Styling), show:
    - Simple name
    - Clear duration (e.g. "About 45 minutes")
    - All-inclusive fixed price and what is included
  - Explicit statement of no hidden fees, no compulsory add-ons, and how travel within the 25-mile radius is handled.
- **Before Your Visit (`before-your-visit.astro`)**
  - Structure as a social story with short, numbered steps:
    - Arrival: instructions you give Lucy (where to park, ring bell or text, etc.).
    - The consultation: visual/gesture-friendly options, mention of a style menu.
    - The wash: state option for dry cut if water/head-touch is difficult.
    - The cut: explain scissors vs clippers, expected sounds, and that changes can be paused.
    - Payment and goodbye: outline contactless payment and pre-agreed tipping so no on-the-spot decisions.
  - Add a simple checklist section with bullet points carers can review with clients in advance.
- **Booking (`book.astro`)**
  - Explain in one short paragraph what will happen when the form is submitted (response time, preferred channels, what information you will confirm).
  - Implement a form (using Astro + standard HTML, styled with DaisyUI) that collects:
    - Name, preferred contact method (email, text, phone) and details
    - Address/postcode (with note about Bournemouth, Poole, and 25-mile radius)
    - Requested service type and preferred days/times
    - Sensory preferences grouped by category (Auditory, Tactile, Visual, Olfactory, Social & Cognitive) using checkboxes that match your list exactly.
  - Show a simple inline summary of their chosen options at the bottom before submission to reduce decision anxiety.
  - For now, implement submission as either a `mailto:`/simple POST endpoint you can later wire to email or a placeholder "Thank you" page with clear next steps.
- **Contact (`contact.astro`)**
  - Present three main methods with equal visual weight: email, text/message number, and phone.
  - State which channels are best for people who prefer not to speak on the phone (e.g. "You can book or ask questions by email or text if talking feels hard today.").
  - Include simple availability window and typical response times.
- **Staff profile (`staff.astro`)**
  - Friendly but concise bio for Lucy: years of experience, focus on home visits and calm environments.
  - Explicit mention of any neurodiversity/sensory-awareness training and a clear statement of commitment to following the client's preferences and pace.
  - Optional static photo area (image component ready, you can later add actual photo).

## Forms, accessibility, and performance

- **Form semantics**: Use `<label>` elements with `for` attributes, group preferences with `<fieldset>` and `<legend>` for each sensory category, and ensure all interactive controls are keyboard navigable.
- **Validation and errors**: Use plain-language inline error messages (e.g. "Please add your email or phone number.") and avoid red-only cues (include icons or text).
- **Performance**: Keep pages mostly static, avoid heavy client-side JavaScript. Use Astro's default static output and minimal hydration only for the colour-mode toggle (and any future interactive pieces).

## Motion and media

- **No auto-play media**: Do not include carousels, videos, or auto-advancing content.
- **Subtle transitions**: Use only mild opacity/colour transitions on hover/focus, guarded by `prefers-reduced-motion`.

## Future integrations (optional later)

- **Booking backend**: Later, connect the booking form to an email service or external booking system without changing the form's structure.
- **Analytics with care**: If adding analytics, ensure no distracting banners, and keep consent language simple and optional.
