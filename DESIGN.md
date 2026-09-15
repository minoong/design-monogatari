---
version: alpha
name: design-monogatari
description: Apple-inspired product UI for design-monogatari. Quiet chrome, one Action Blue accent, Geist instead of SF Pro. Tokens in this file are the source of truth and must stay in sync with packages/ui/src/styles/globals.css.
palette:
  neutral:
    50: '#ffffff'
    100: '#f5f5f7'
    200: '#e3e3e7'
    300: '#d2d2d7'
    400: '#a1a1a6'
    500: '#6e6e73'
    600: '#58585c'
    700: '#424245'
    800: '#2f2f32'
    900: '#1d1d1f'
    950: '#000000'
  blue:
    50: '#f2f9ff'
    100: '#e1f1ff'
    200: '#c3e2ff'
    300: '#74bbff'
    400: '#2997ff'
    500: '#0071e3'
    600: '#0066cc'
    700: '#0055aa'
    800: '#004488'
    900: '#003366'
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
  overlay: 'color-mix(in srgb, #1d1d1f 48%, transparent)'
  card: '#ffffff'
  secondary-hover: '#f5f5f7'
  dimmer: '#000000'
  destructive: '#c41e3a'
  destructive-foreground: '#ffffff'
colorsDark:
  background: '#000000'
  foreground: '#eeeef0'
  muted: '#121315'
  muted-foreground: '#b2b3bd'
  border: '#393a3f'
  primary: '#003cff'
  primary-hover: '#0022ed'
  primary-foreground: '#ffffff'
  primary-on-dark: '#8ab5ff'
  ring: '#2356d6'
  overlay: 'color-mix(in srgb, #000000 64%, transparent)'
  card: '#121315'
  secondary-hover: '#1f1f22'
  dimmer: '#000000'
  destructive: '#ff6369'
  destructive-foreground: '#000000'
rounded:
  md: 11px
  lg: 18px
  pill: 9999px
---

## Overview

design-monogatari is a **quiet, product-first UI**. Surfaces are white or parchment. Text is near-black ink, never pure `#000` on chrome. **One brand interactive color**: Action Blue. Status color (`destructive`) is allowed for errors — it is not a second brand accent. No decorative gradients, no shadows on buttons or cards.

Typography uses **Geist** (apps) with `ui-sans-serif, system-ui, -apple-system` fallback (Storybook and non-Next consumers). Do not introduce SF Pro as a webfont.

**Before any UI change**, read this file, then map tokens to Tailwind classes in `packages/ui/src/styles/globals.css`. Do not hardcode hex in components.

## Palettes

Primitive steps live in `@theme` as `--color-neutral-*` and `--color-blue-*`. They do **not** flip in dark mode. Light semantic tokens point at those steps. Dark semantic tokens are **Radix custom** hex (`accent` `#003cff`, `background` `#000000`) — not remapped Apple steps.

Components use semantic Tailwind classes (`bg-background`, `bg-primary`). Do not use `bg-neutral-500` or `bg-blue-600` in product UI.

| Semantic (light)        | Step          | Semantic (dark)    | Radix step          |
| ----------------------- | ------------- | ------------------ | ------------------- |
| `background`, `card`    | `neutral.50`  | `background`       | gray 1 `#000000`    |
| `muted`                 | `neutral.100` | `card`, `muted`    | gray 2 `#121315`    |
| `border`                | `neutral.300` | `secondary-hover`  | gray 3 `#1f1f22`    |
| `muted-foreground`      | `neutral.500` | `border`           | gray 6 `#393a3f`    |
| `foreground`            | `neutral.900` | `muted-foreground` | gray 11 `#b2b3bd`   |
| `primary-on-dark`       | `blue.400`    | `foreground`       | gray 12 `#eeeef0`   |
| `primary-hover`, `ring` | `blue.500`    | `ring`             | accent 8 `#2356d6`  |
| `primary`               | `blue.600`    | `primary`          | accent 9 `#003cff`  |
|                         |               | `primary-hover`    | accent 10 `#0022ed` |
|                         |               | `primary-on-dark`  | accent 11 `#8ab5ff` |

`neutral.950` is still the primitive black swatch. Catalogs show **50–900**. Dark chrome uses Radix gray, not `neutral.700`.

## Token mapping

| DESIGN.md / CSS variable | Tailwind                                                   |
| ------------------------ | ---------------------------------------------------------- |
| `background`             | `bg-background`                                            |
| `foreground`             | `text-foreground`, `bg-foreground`                         |
| `muted`                  | `bg-muted`                                                 |
| `muted-foreground`       | `text-muted-foreground`                                    |
| `border`                 | `border-border` (also `border-muted-strong` alias)         |
| `primary`                | `bg-primary`, `text-primary`, `border-primary`             |
| `primary-hover`          | `hover:bg-primary-hover`                                   |
| `primary-foreground`     | `text-primary-foreground`                                  |
| `ring`                   | `focus-visible:ring-ring`                                  |
| `overlay`                | `bg-overlay`                                               |
| `card`                   | `bg-card`                                                  |
| `dimmer`                 | `bg-dimmer` (`neutral.950`; press overlay)                 |
| `destructive`            | `bg-destructive`, `text-destructive`, `border-destructive` |
| `destructive-foreground` | `text-destructive-foreground`                              |
| `text-title`             | `text-title` (28px)                                        |
| `text-body`              | `text-body` (17px)                                         |
| `text-caption`           | `text-caption` (14px)                                      |
| `rounded.pill`           | `rounded-pill`                                             |
| `rounded.lg`             | `rounded-lg`                                               |
| `rounded.md`             | `rounded-md`                                               |

Dark values live on `.dark` (and OS `prefers-color-scheme: dark` when `html` is not `.light`). Storybook `@storybook/addon-themes` (`withThemeByClassName`) sets `html.light` / `html.dark`. Apps use `next-themes` with `attribute="class"` so the same classes land on `<html>`.

## Colors

Primitive scales: **Neutral** 50–900 (+ 950 canvas) and **Blue** 50–900. Semantic names stay the product API.

- **Action Blue** (`primary` / `blue.600` #0066cc): every primary CTA and in-copy link on light surfaces.
- **Focus Blue** (`ring` / `primary-hover` / `blue.500` #0071e3): focus ring and primary hover.
- **Sky Link** (`primary-on-dark` / `blue.400` #2997ff): links on dark tiles only — never on light backgrounds.
- **Ink** (`foreground` / `neutral.900` #1d1d1f): headlines, body, labels.
- **Muted text** (`muted-foreground` / `neutral.500` #6e6e73): placeholders, captions, dialog descriptions. Measured **5.07:1** on `background` (`#ffffff`) — WCAG AA body text (≥ 4.5:1). Do not lighten.
- **Destructive** (`destructive` #c41e3a light / #ff6369 dark): invalid fields, error copy, destructive chips. Not a second brand accent and not a substitute for `primary` CTAs. Light pair with white label is **5.84:1**.
- **Parchment** (`muted` / `neutral.100` #f5f5f7): secondary fills, hover wash, alternating sections.
- **Hairline** (`border` / `neutral.300` #d2d2d7): input, card, dialog, secondary control edges. Do not use 5–8% black borders — they disappear on white.

Dark surfaces: void black canvas (`#000000`). Text is Radix gray 12 / 11. Solid CTA is accent 9 `#003cff` with white label. Focus ring is accent 8 `#2356d6`. Hairline is gray 6 `#393a3f` — do not use 5–8% white on black; it disappears.

## Dark mode

Same semantic tokens as light — override values under `.dark`, do not add `dark:bg-*` hex in components (shadcn [theming](https://ui.shadcn.com/docs/theming), Tailwind v4 `@custom-variant dark`). Dark hex comes from [Radix custom](https://www.radix-ui.com/colors/custom?accent-dark=003CFF&bg-dark=000000) (`accent` `#003cff`, `gray` `#8b8d98`, `background` `#000000`).

| Surface                  | Light             | Dark          |
| ------------------------ | ----------------- | ------------- |
| `background`             | `#ffffff`         | `#000000`     |
| `foreground`             | `#1d1d1f`         | `#eeeef0`     |
| `muted`                  | `#f5f5f7`         | `#121315`     |
| `muted-foreground`       | `#6e6e73`         | `#b2b3bd`     |
| `border`                 | `#d2d2d7`         | `#393a3f`     |
| `card`                   | `#ffffff`         | `#121315`     |
| `overlay`                | `neutral.900` 48% | `#000000` 64% |
| `ring`                   | `#0071e3`         | `#2356d6`     |
| `primary`                | `#0066cc`         | `#003cff`     |
| `primary-hover`          | `#0071e3`         | `#0022ed`     |
| `primary-on-dark`        | `#2997ff`         | `#8ab5ff`     |
| `secondary-hover`        | `#f5f5f7`         | `#1f1f22`     |
| `dimmer`                 | `#000000`         | `#000000`     |
| `destructive`            | `#c41e3a`         | `#ff6369`     |
| `destructive-foreground` | `#ffffff`         | `#000000`     |

`primary-foreground` stays white in both modes. Press dimmer is `neutral.950` (black), never `foreground` — on dark, foreground would flash white.

- **Apps**: `next-themes` (`attribute="class"`, `defaultTheme="system"`) + page toggle. `html` needs `suppressHydrationWarning`.
- **Storybook**: `@storybook/addon-themes` toolbar. Never leave the canvas on light chrome while OS dark tokens are active.

## Typography

- Sans: Geist / system-ui. Mono: Geist Mono / ui-monospace.
- Role tokens in `@theme`: `text-title` (28px), `text-body` (17px), `text-caption` (14px). Do not use `text-[17px]` / `text-[28px]` in product UI.
- Form controls may keep `text-sm` (same 14px as caption).
- Headlines: weight 600, not 700. Body: 400. Strong: 600. Avoid weight 500.
- Slightly tight tracking on titles (`tracking-tight`).

## Components

### Button

- **Primary**: `bg-primary text-primary-foreground`. Hover `bg-primary-hover`. Never `bg-foreground` for the default CTA.
- **Secondary**: ghost — `border-border text-foreground bg-transparent`. Hover parchment / gray-3 wash. Not a blue outline.
- Primitive: native `<button>` + Radix `Slot` (`asChild`). No hover scale.
- **Press**: Motion `whileTap` — Button `scale: 0.96`, IconButton `scale: 0.9`. Primary uses a 26% black `dimmer`. Secondary / clear use an 8% `foreground` wash (ink on light, lift on dark). `useReducedMotion()` keeps the wash and skips scale. Do not put Tailwind `transition-*` on the same node as Motion.
- `radius`: `md` (`rounded-md`) | `lg` (`rounded-lg`, Button default) | `pill` (`rounded-pill`). IconButton default is `md`.
- `size`: `small` | `medium` | `large` (default) | `xlarge`. `display`: `inline` | `block` | `full`. Same 1px hairline on primary and secondary (`box-border`).
- `loading`: keep label width, three-dot overlay, `aria-busy`. Combine with `disabled` when needed.
- Icons + text: nest the icon as a sibling (Radix). Prefix `data-icon="inline-start"`, suffix `data-icon="inline-end"` (shadcn). Do not infer icon-only from children.
- Links: `asChild` on `<a>`, or `buttonVariants(...)` on a native `<a>`. Focus: 2px `ring-ring`. Primary also uses `ring-offset-2 ring-offset-background` so the ring reads on a filled CTA. Ghost buttons skip the offset so the halo stays small.

### IconButton

- Use for **icon-only** actions. `aria-label` is required.
- Default `variant="clear"` (ink icon, no chrome until hover/press). `primary` = fill, `secondary` = hairline. Default `radius="md"`. Same `size` scale as Button; hit target is square (`size-8` … `size-14`).
- lucide-animated icons inside; the button CSS sizes the SVG. Do not put text in `IconButton` — use `Button` instead.

### Input / Label / Field

- Input: `bg-background text-foreground border-border`, height 44px (`h-11`), `rounded-md`, placeholder `text-muted-foreground`.
- Focus: `ring-2 ring-ring`, not a faint foreground ring.
- Invalid: set `aria-invalid`. Border and ring use `destructive`. Do not color the field with `primary`.
- Disabled: `bg-muted text-muted-foreground`, not `opacity-50` (opacity breaks contrast).
- Label: `text-foreground`, `htmlFor` / `id` paired. Disabled via `peer-disabled`.
- Field compound: `Field`, `FieldLabel`, `FieldError`. Pair `FieldLabel htmlFor` with Input `id`, and Input `aria-describedby` with `FieldError id`.

### Dialog

- Compound: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. Parts share open state; do not collapse this into one mega-component.
- **`DialogTitle` is required** inside `DialogContent` (Radix accessible name).
- Overlay: `bg-overlay`. `DialogContent` already renders the shared overlay — do not add `DialogOverlay` as a sibling (double overlay). Export `DialogOverlay` only for custom portals.
- Content: `bg-card border-border rounded-lg`. No drop-shadow on chrome.
- Title: `text-foreground`. Description: `text-muted-foreground`.
- Enter/exit via `AnimatePresence` + Motion; reduced motion skips scale/fade.

### Badge

- CVA `variant`: `default` ink fill (`bg-foreground text-background`), `secondary` parchment + hairline, `destructive` outline (`border-destructive text-destructive`). Default is an info chip, not a CTA.

### Card

- Compound: `Card`, `CardHeader`, `CardTitle`, `CardDescription`. Hairline `border-border`, `bg-card`, `rounded-lg`. No box-shadow, no `href` / UTM demo API.

### Loading

- Stage / panel waiting state — not the Button three-dot overlay.
- Dual hairline rings (`foreground` + `muted-foreground` on a `border` track). Motion rotate; `prefers-reduced-motion` keeps the arcs still.
- `size`: `small` | `medium` (default) | `large`. Optional `progress` (0–1) switches to a determinate ring and `role="progressbar"`.
- Visible `label` (`text-caption text-muted-foreground`). Default copy: `불러오는 중`.
- Motion only. Do not add Lottie. Do not put this on a WebGL canvas node.

### ScrollImageSequence

- Pin + scrub a viewport panel; map scroll progress to `frames` URLs (consumer-owned). Draw on canvas — do not `setState` per frame.
- GSAP ScrollTrigger only. Do not put Motion or Tailwind `transition-*` on the canvas.
- Overlay copy is `children` (accessible). Canvas is `aria-hidden`. `prefers-reduced-motion`: first frame, no pin.
- Not in the shadcn registry. Prototype exterior stills stay in `apps/web/public/exterior/` (gitignored).

### Storybook 3D (not public API)

- **Image sequence** = 2D frames (`ScrollImageSequence`). **3D model** = GLTF or mesh, rotated by scroll.
- Storybook `컴포넌트/스크롤3D` uses Three.js (`three`, `@react-three/fiber` as UI devDependencies). The paint story uses GSAP pin/scrub. OEM inspect stories use OrbitControls (drag to orbit, wheel to zoom). Both start from the same `REST_YAW` studio pose — kit `front` is mesh axis, not a per-car camera angle. Loading uses `Loading` over the HTML overlay, not on the canvas: X5 reports Three `LoadingManager` item counts (many GLTFs), XC40 reports FBX download bytes (one file). No Motion on the WebGL canvas.
- Studio look (IBL, clearcoat paint, ground shadow, OEM paint chips) is for Storybook. Chip hex lives in `src/storybook/scroll-3d/paints.ts` and stays the same in light and dark — it is not a semantic token. Bumper plastics follow a paired hex per chip. Do not vendor Renault / Plus360 meshes. BMW X5 G05 is the BMW Car IT CC BY 4.0 release, not a scrape. Doors, hood, and seats in that kit are half-meshes and are mirrored on Z in the Storybook assembler. The cabin also loads interior trim and the steering wheel. Dark windshield glass is made transmissive so the cabin is visible. Volvo XC40 Recharge is the Unity Auto Showroom mesh (Volvo EULA, non-commercial, Storybook-only). The kit names body paint `carpaint_metallic_729glaciersilver` but does not ship the albedo; the XC40 OEM story restores Glacier Silver from that name. `X5 원본` / `XC40 원본` skip paint chips.
- Fullscreen 3D stories skip the default Storybook canvas padding. The pin stage is the first paint in the iframe; the overlay stays compact at the top-left so the car is not covered.
- Not exported from `@repo/ui/*`. Not in the registry. Sample `g05/` (BMW X5 G05, CC-BY 4.0), `xc40/` (Volvo XC40 Recharge, Volvo EULA), and `studio.hdr` are gitignored (`pnpm --filter @repo/ui copy:car`).

## Do's and Don'ts

### Do

- Use `primary` for every “click me” fill or link on light surfaces.
- Keep hairline borders visible (`border-border`). Not 8% black on white, not 8% white on black.
- Pair Storybook / page chrome `bg-background` with `text-foreground`.
- Update `registry.json` `theme.cssVars` when tokens change.

### Don't

- Don't invert OS dark tokens onto a white Storybook canvas — `@storybook/addon-themes` must set `html.light` or `html.dark`.
- Don't add a second **brand** accent. Status color (`destructive`) is allowed; do not use it as a CTA fill.
- Don't put shadows on buttons, cards, or dialog frames.
- Don't hardcode hex in `packages/ui/src/*.tsx`. Storybook 3D OEM chips in `src/storybook/scroll-3d/` are the exception so paint does not flip with theme.
- Don't use `bg-neutral-*` / `bg-blue-*` in components — map through semantic tokens.
- Don't mix Tailwind `transition-*` with Motion on one element.
