---
name: baseline-ui
description: Polish and refine AI-generated UI. Fix spacing, typography, hover/focus states, and visual hierarchy. Use after generating or editing any frontend page or component to remove generic AI aesthetic and improve readability.
---

# Baseline UI Polish

When asked to polish a UI file, review and fix:

## Typography
- Ensure clear visual hierarchy (h1 > h2 > h3 > body)
- Line height: 1.5 for body text, 1.2 for headings
- Font sizes should feel proportional, not random

## Spacing
- Consistent padding/margin using Tailwind spacing scale
- Adequate whitespace between sections
- Cards and containers should breathe

## Interactive States
- All clickable elements need hover states
- Focus rings for keyboard navigation (focus-visible)
- Active/pressed states for buttons
- Transitions: use transition-colors or transition-all with duration-200

## Visual Polish
- Border radius consistency across components
- Subtle shadows for elevation (shadow-sm, shadow-md)
- Color contrast: text must be readable (WCAG AA minimum)
- Loading states for async actions
- Empty states with helpful messages

## Mobile
- Touch targets minimum 44x44px
- Responsive layout that works on 375px width
- No horizontal scroll on mobile