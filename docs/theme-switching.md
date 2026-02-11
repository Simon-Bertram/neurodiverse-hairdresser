# Theme switching

This site uses the [theme-change](https://github.com/saadeghi/theme-change) package for theme switching. It enables users to change the CSS theme via buttons or a dropdown, and persists their choice in `localStorage` so it is restored on reload.

## Overview

- **Package:** [theme-change](https://github.com/saadeghi/theme-change) (MIT)
- **Purpose:** Handle theme changes using the `data-theme` attribute and CSS custom properties
- **Storage:** User preference is stored in `localStorage` under the key `theme`

## Implementation

### Layout (`apps/web/src/layouts/Layout.astro`)

Two scripts run in the layout to support theme switching and avoid the Flash of Unstyled Content (FOUC) / Flash of Incorrect Theme (FOIT) on load:

1. **Inline script (FART prevention)** – Runs before any rendering to apply the saved theme from `localStorage` to `document.documentElement` before paint.
2. **Module script** – Imports `themeChange()` from the package and initializes the theme-change behavior.

### Theme switch (`apps/web/src/components/ThemeSwitch.astro`)

The theme switcher uses DaisyUI’s `data-set-theme` attribute on buttons. Each button sets the chosen theme and persists it via theme-change’s `data-theme` attribute. Available themes: **Default** (sereneSage), **Dark** (lowStimuli), and **High contrast** (clearSight).

### Theme definitions (`apps/web/src/styles/global.css`)

DaisyUI themes are defined in `global.css`. Each theme sets CSS variables and is applied when `data-theme` on the document matches the theme name (e.g. `sereneSage`, `lowStimuli`, `clearSight`).

## Adding or changing themes

1. Define the theme in `global.css` (e.g. via DaisyUI `@plugin "daisyui/theme"`).
2. Add a button in `ThemeSwitch.astro` with `data-set-theme="themeName"` matching the theme name.
3. Ensure theme-change is initialized in the layout (as it already is).

For more detail on theme-change’s API (buttons, toggles, selects, custom `localStorage` keys), see the [theme-change README](https://github.com/saadeghi/theme-change?tab=readme-ov-file).
