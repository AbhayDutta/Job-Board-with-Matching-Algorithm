---
name: Fitboard
description: Job matching that actually fits — warm editorial structure with weighted skill-vector matching.
colors:
  primary: "#182025"
  neutral-bg: "#faf7f2"
  accent: "#8cfa3c"
  muted: "#73787a"
  card: "#fcfaf5"
  border: "#dbdad5"
typography:
  display:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "oklch(0.25 0.02 250)"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
---

# Design System: Fitboard

## 1. Overview

**Creative North Star: "The Editorial Directory"**

The visual system of Fitboard rejects standard, over-saturated tech SaaS templates. It adopts an editorial aesthetic reminiscent of a physical catalog, newspaper directory, or high-end magazine. The interface uses a warm cream base, ink-black text and borders, spacious layouts, and a single electric-lime accent color to indicate matching metrics and similarity weight highlights.

**Key Characteristics:**
- Warm neutral backgrounds combined with high-contrast ink-black typography.
- Thin borders for structure instead of heavy gradients or decorative shadows.
- Generous white space and clear information hierarchy.
- Perfect pill shapes for buttons, tags, and interactive elements.
- Fluid micro-animations to enhance state changes and reveal sequences.

## 2. Colors

The color palette is anchored by warm editorial cream and deep inkwell black, highlighted with a sharp, vibrant electric-lime accent for similarity metrics.

### Primary
- **Inkwell Black** (#182025 / oklch(0.18 0.02 250)): Used for primary headers, navigation text, and primary action buttons.

### Neutral
- **Warm Alabaster** (#faf7f2 / oklch(0.975 0.015 95)): The default light-mode body background.
- **Editorial Card** (#fcfaf5 / oklch(0.99 0.008 95)): Used for containers and content cards.
- **Muted Ink** (#73787a / oklch(0.45 0.02 250)): Used for supporting labels, details, and secondary text.
- **Solid Border** (#dbdad5 / oklch(0.86 0.015 95)): Used for container borders and division lines.

### Accent
- **Electric Lime** (#8cfa3c / oklch(0.88 0.22 130)): Used exclusively for matching percentages, high-fit scores, and similarity visualizations.

### Named Rules
**The 10% Accent Rule.** Electric lime is used exclusively on ≤10% of any given screen. Its rarity makes it an immediate anchor for candidate-job match metrics.
**The Ink Border Doctrine.** Layout elements are separated by 1px solid borders using the border color (`#dbdad5`), ensuring clean, physical divisions without relying on shadows.

## 3. Typography

**Display Font:** Instrument Serif (with fallback ui-serif, Georgia, serif)
**Body Font:** Inter (with fallback ui-sans-serif, system-ui, sans-serif)

The type system relies on a stark contrast between a classic editorial serif (used for display headlines, numbers, and stats) and a highly readable geometric sans-serif (used for body copy, controls, and labels).

### Hierarchy
- **Display** (Regular 400, clamp(2.5rem, 7vw, 4.5rem), 1.0): Used for large hero headlines, display stats, and numbers.
- **Headline** (Regular 400, text-4xl (36px), 1.1): Used for section headings.
- **Title** (Semibold 600, text-xl (20px), 1.3): Used for card titles and subheadings.
- **Body** (Regular 400, text-base (16px), 1.5): Used for standard prose, capped at 65-75 characters per line for optimal readability.
- **Label** (Medium 500, text-xs (12px), 1.2, uppercase, tracking-wider): Used for eyebrows, metadata tags, and small utility text.

### Named Rules
**The Italic Emphasis Rule.** Italic serif styling (`font-serif italic`) is used selectively within display typography to highlight key differentiators and key positioning words.
**The No-Orphans Rule.** All display and headline tags must use `text-wrap: balance` to prevent orphan words and maintain typographic weight.

## 4. Elevation

Fitboard is flat by default, relying on 1px solid borders and subtle background tints for structure. Shadows are reserved as ambient feedback for crucial interactive cards or to show system activity.

### Shadow Vocabulary
- **Interactive Match Glow** (box-shadow: `0 20px 60px -20px oklch(0.18 0.02 250 / 0.25)`): Used on key hoverable cards (like the match report) to lift them off the page and convey a premium feel.

### Named Rules
**The Elevation Response Rule.** Shadows never exist statically on basic layout items. They appear only on floating elements (dropdown overlays, modals) or key interactive cards responding to state changes (hover/focus).

## 5. Components

### Buttons
- **Shape:** Perfect pill (rounded-full).
- **Primary:** Inkwell Black background, Warm Alabaster text, padding `12px 24px`.
- **Hover / Focus:** Scale-up transition (`hover:scale-105 hover:shadow-lg`), background transition to `oklch(0.25 0.02 250)`.
- **Secondary:** Transparent background, Inkwell Black border and text, padding `12px 24px`, hover background transition to `oklch(0.93 0.02 95)`.

### Cards
- **Corner Style:** Rounded edges (`rounded-2xl` / 16px).
- **Background:** Editorial Card background with a thin Solid Border.
- **Shadow Strategy:** Flat by default, lifting with the **Interactive Match Glow** on hover.
- **Internal Padding:** Generous padding (`p-6` / 24px or `p-8` / 32px) to maintain breathing room.

### Inputs
- **Style:** 1px solid border, rounded-full or rounded-md depending on context, background is card-colored.
- **Focus:** Border transitions to Inkwell Black with a subtle ring offset.

### Navigation
- **Style:** Sticky header with a translucent background blur (`bg-background/80 backdrop-blur`) and a bottom border.
- **Links:** Muted Ink color, shifting to Inkwell Black on hover with an active underline.

## 6. Do's and Don'ts

### Do:
- **Do** use `Instrument Serif` for hero headings, display statistics, and similarity scoring numbers.
- **Do** ensure all body copy is high contrast (minimum Slate-900 or Inkwell Black `#182025`) against the warm cream background.
- **Do** apply perfect pill shapes (`rounded-full`) to all buttons and action tags.
- **Do** respect the `10% Accent Rule` when applying the Electric Lime color.

### Don't:
- **Don't** use border-left or border-right greater than 1px as a colored stripe on cards or callouts.
- **Don't** use gradient text under any circumstances.
- **Don't** use glassmorphism blurs decoratively on standard page sections.
- **Don't** use tiny uppercase kickers as standard eyebrows above every single header.
- **Don't** use diagonal stripe backgrounds or decorative grid backgrounds.
- **Don't** use card corners with a border-radius greater than 16px.
