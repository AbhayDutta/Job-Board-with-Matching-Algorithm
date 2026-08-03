# Fitboard UI/UX Design System & Motion Engineering Specification

## 1. Visual Identity & Color Tokens (OKLCH System)

Fitboard utilizes an OKLCH editorial palette combining warm cream surfaces (Light Mode) and deep midnight slate surfaces (Dark Mode) accented by high-frequency Electric Lime (`oklch(0.88 0.22 130)`).

```css
:root {
  /* Surface Tokens */
  --background: oklch(0.975 0.015 95);      /* Warm Editorial Cream */
  --foreground: oklch(0.18 0.02 250);       /* Deep Obsidian Ink */
  --card: oklch(0.99 0.008 95);             /* Pure Card Base */
  --secondary: oklch(0.94 0.015 95);        /* Soft Muted Surface */
  --accent: oklch(0.88 0.22 130);           /* High-Frequency Electric Lime */
  
  /* Micro-Motion Curve Tokens */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
}

.dark {
  --background: oklch(0.129 0.042 264.695); /* Midnight Slate */
  --foreground: oklch(0.984 0.003 247.858); /* Crisp Alpine White */
  --card: oklch(0.208 0.042 265.755);       /* Dark Translucent Card */
  --secondary: oklch(0.16 0.035 264);       /* Dark Muted Surface */
}
```

---

## 2. Motion Engineering & Interaction Rules (Emil Kowalski Philosophy)

### A. Tactile Button Feedback
Every clickable trigger, button, and interactive card must provide instant tactile press feedback:
- **Active State**: `transform: scale(0.97)` on `:active` with `duration: 150ms ease-out`.
- **Hover State**: Subtle scale `scale(1.02)` or border glow.

### B. Popover & Modal Animation Origins
- **Modals**: Enter from `scale(0.95)` + `opacity: 0` centered in the viewport with `cubic-bezier(0.23, 1, 0.32, 1)`.
- **Popovers/Dropdowns**: Enter scaling from their exact trigger location.

### C. List & Card Staggers
- Cards in Kanban columns, job feeds, and candidate match lists use staggered delays (`30ms` - `60ms` per item) to create a fluid cascading entrance without blocking interaction.

---

## 3. Component Architecture & Polish Guidelines

1. **Lenis Inertia Scroll**: Global smooth scrolling enabled across candidate, recruiter, landing, and auth pages.
2. **Accessible Contrast**: All text elements meet WCAG AAA guidelines in both Light & Dark modes.
3. **No Bare Image Loading**: All images and banners utilize Framer Motion blur-in or skeleton fallbacks.
