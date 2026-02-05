# Color scheme – hairdresser-dark

Dark, high-contrast palette for the Lucy Russell Hair site. All colors are defined in **oklch** and live in `apps/web/src/styles/global.css` as the DaisyUI theme `hairdresser-dark`.

## Reference

| Role | Variable | oklch value | Use |
|------|----------|-------------|-----|
| **Base** | `base-100` | `14% 0.02 260` | Page background |
| | `base-200` | `18% 0.02 260` | Slightly lighter background |
| | `base-300` | `24% 0.02 260` | Elevated surfaces |
| | `base-content` | `98% 0.01 260` | Primary text on base |
| **Primary** | `primary` | `70% 0.18 260` | Main brand / CTAs |
| | `primary-content` | `98% 0.01 260` | Text on primary |
| **Secondary** | `secondary` | `55% 0.08 260` | Supporting UI |
| | `secondary-content` | `98% 0.01 260` | Text on secondary |
| **Accent** | `accent` | `75% 0.15 180` | Highlights / focus |
| | `accent-content` | `18% 0.03 180` | Text on accent |
| **Neutral** | `neutral` | `35% 0.02 260` | Cards, borders |
| | `neutral-content` | `95% 0.01 260` | Text on neutral |
| **Info** | `info` | `65% 0.18 250` | Informational |
| | `info-content` | `98% 0.01 250` | Text on info |
| **Success** | `success` | `65% 0.18 145` | Success states |
| | `success-content` | `98% 0.01 145` | Text on success |
| **Warning** | `warning` | `75% 0.15 85` | Warnings |
| | `warning-content` | `20% 0.05 85` | Text on warning |
| **Error** | `error` | `60% 0.22 25` | Errors / destructive |
| | `error-content` | `98% 0.01 25` | Text on error |

## Samples (oklch)

Samples below use the same oklch values as the theme. For live swatches in the app, open **[/styleguide](/styleguide)**.

### Base
<table>
<tr>
  <td><strong>base-100</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(14% 0.02 260);border:1px solid oklch(30% 0.02 260);vertical-align:middle;"></span></td>
</tr>
<tr>
  <td><strong>base-200</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(18% 0.02 260);border:1px solid oklch(30% 0.02 260);vertical-align:middle;"></span></td>
</tr>
<tr>
  <td><strong>base-300</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(24% 0.02 260);border:1px solid oklch(30% 0.02 260);vertical-align:middle;"></span></td>
</tr>
<tr>
  <td><strong>base-content</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(98% 0.01 260);border:1px solid oklch(80% 0.02 260);vertical-align:middle;"></span></td>
</tr>
</table>

### Primary & secondary
<table>
<tr>
  <td><strong>primary</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(70% 0.18 260);border:1px solid oklch(50% 0.15 260);vertical-align:middle;"></span></td>
</tr>
<tr>
  <td><strong>secondary</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(55% 0.08 260);border:1px solid oklch(40% 0.06 260);vertical-align:middle;"></span></td>
</tr>
</table>

### Accent & neutral
<table style="mt-4">
<tr>
  <td><strong>accent</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(75% 0.15 180);border:1px solid oklch(55% 0.12 180);vertical-align:middle;"></span></td>
</tr>
<tr>
  <td><strong>neutral</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(35% 0.02 260);border:1px solid oklch(45% 0.02 260);vertical-align:middle;"></span></td>
</tr>
</table>

### Semantic (info, success, warning, error)
<table>
<tr>
  <td><strong>info</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(65% 0.18 250);border:1px solid oklch(50% 0.15 250);vertical-align:middle;"></span></td>
</tr>
<tr>
  <td><strong>success</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(65% 0.18 145);border:1px solid oklch(50% 0.15 145);vertical-align:middle;"></span></td>
</tr>
<tr>
  <td><strong>warning</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(75% 0.15 85);border:1px solid oklch(60% 0.12 85);vertical-align:middle;"></span></td>
</tr>
<tr>
  <td><strong>error</strong></td>
  <td><span style="display:inline-block;width:3rem;height:2rem;background:oklch(60% 0.22 25);border:1px solid oklch(45% 0.18 25);vertical-align:middle;"></span></td>
</tr>
</table>

## Theme settings

- **Radius:** `--radius-box: 0.5rem`, `--radius-field: 0.25rem`
- **Border:** `--border: 1px`
- **Color scheme:** `dark` (prefers dark, default theme)
