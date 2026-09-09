---
version: alpha
name: design-monogatari
description: Apple-inspired product UI for design-monogatari. Quiet chrome, one Action Blue accent, Geist instead of SF Pro. Tokens in this file are the source of truth and must stay in sync with packages/ui/src/styles/globals.css.
colors:
  background: '#ffffff'
  foreground: '#1d1d1f'
  muted: '#f5f5f7'
  muted-foreground: '#6e6e73'
  border: '#d2d2d7'
  primary: '#0066cc'
  primary-hover: '#0071e3'
  primary-foreground: '#ffffff'
  primary-on-dark: '#2997ff'
  ring: '#0071e3'
  overlay: 'rgb(29 29 31 / 0.48)'
  card: '#ffffff'
  secondary-hover: '#f5f5f7'
rounded:
  md: 11px
  lg: 18px
  pill: 9999px
---

## Overview

design-monogatari is a **quiet, product-first UI**. Surfaces are white or parchment. Text is near-black ink, never pure `#000` on chrome. **One interactive color**: Action Blue. No second accent, no decorative gradients, no shadows on buttons or cards.

Typography uses **Geist** (apps) with `ui-sans-serif, system-ui, -apple-system` fallback (Storybook and non-Next consumers). Do not introduce SF Pro as a webfont.

**Before any UI change**, read this file, then map tokens to Tailwind classes in `packages/ui/src/styles/globals.css`. Do not hardcode hex in components.

## Token mapping

| DESIGN.md / CSS variable | Tailwind                                           |
| ------------------------ | -------------------------------------------------- |
| `background`             | `bg-background`                                    |
| `foreground`             | `text-foreground`, `bg-foreground`                 |
| `muted`                  | `bg-muted`                                         |
| `muted-foreground`       | `text-muted-foreground`                            |
| `border`                 | `border-border` (also `border-muted-strong` alias) |
| `primary`                | `bg-primary`, `text-primary`, `border-primary`     |
| `primary-hover`          | `hover:bg-primary-hover`                           |
| `primary-foreground`     | `text-primary-foreground`                          |
| `ring`                   | `focus-visible:ring-ring`                          |
| `overlay`                | `bg-overlay`                                       |
| `card`                   | `bg-card`                                          |
| `rounded.pill`           | `rounded-pill`                                     |
| `rounded.lg`             | `rounded-lg`                                       |
| `rounded.md`             | `rounded-md`                                       |

Dark values live on `.dark` (and OS `prefers-color-scheme: dark` when `html` is not `.light`). Storybook toolbar sets `.light` / `.dark` on `<html>` so the canvas always matches the tokens.

## Colors

- **Action Blue** (`primary` #0066cc): every primary CTA and in-copy link on light surfaces.
- **Focus Blue** (`ring` / `primary-hover` #0071e3): focus ring and primary hover.
- **Sky Link** (`primary-on-dark` #2997ff): links on dark tiles only — never on light backgrounds.
- **Ink** (`foreground` #1d1d1f): headlines, body, labels.
- **Muted text** (`muted-foreground` #6e6e73): placeholders, captions, dialog descriptions. Contrast ≥ 4.5:1 on `background`.
- **Parchment** (`muted` #f5f5f7): secondary fills, hover wash, alternating sections.
- **Hairline** (`border` #d2d2d7): input, card, dialog, secondary control edges. Do not use 5–8% black borders — they disappear on white.

Dark surfaces: void black canvas, ink-inverted text, slightly brighter muted text (`#a1a1a6`). Primary buttons stay Action Blue with white label.

## Typography

- Sans: Geist / system-ui. Mono: Geist Mono / ui-monospace.
- Body ~17px in product UI; form controls 14px is allowed.
- Headlines: weight 600, not 700. Body: 400. Strong: 600. Avoid weight 500.
- Slightly tight tracking on titles (`tracking-tight`).

## Components

### Button

- **Primary**: `bg-primary text-primary-foreground rounded-pill`. Hover `bg-primary-hover`. Never `bg-foreground` for the default CTA.
- **Secondary**: ghost pill — `border-primary text-primary bg-transparent`. Hover parchment fill, keep blue text.
- Motion (`motion/react-client`): `whileHover` scale 1.02, `whileTap` scale 0.95. Respect `useReducedMotion()`. No `transition-*` on the same node.
- Focus: 2px `ring-ring`.

### Input / Label

- Input: `bg-background text-foreground border-border`, height 44px (`h-11`), `rounded-md`, placeholder `text-muted-foreground`.
- Focus: `ring-2 ring-ring`, not a faint foreground ring.
- Label: `text-foreground`, `htmlFor` / `id` paired. Disabled via `peer-disabled`.

### Dialog

- Overlay: `bg-overlay`. Content: `bg-card border-border rounded-lg`. No drop-shadow on chrome.
- Title: `text-foreground`. Description: `text-muted-foreground`.
- Enter/exit via `AnimatePresence` + Motion; reduced motion skips scale/fade.

### Badge / Card

- Badge default: ink fill (`bg-foreground text-background`). Secondary: parchment + hairline.
- Card: hairline border, parchment hover. No box-shadow.

## Do's and Don'ts

### Do

- Use `primary` for every “click me” fill or link on light surfaces.
- Keep hairline borders visible (`border`, not 8% black).
- Pair Storybook / page chrome `bg-background` with `text-foreground`.
- Update `registry.json` `theme.cssVars` when tokens change.

### Don't

- Don't invert OS dark tokens onto a white Storybook canvas — set `html.light` or `html.dark` explicitly in docs.
- Don't add a second accent color.
- Don't put shadows on buttons, cards, or dialog frames.
- Don't hardcode hex in `packages/ui/src/*.tsx`.
- Don't mix Tailwind `transition-*` with Motion on one element.
