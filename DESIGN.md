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
  ring: '#3b6ee6'
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

Typography uses **Geist** (apps) with `ui-sans-serif, system-ui, -apple-system` fallback (Storybook and non-Next consumers). Do not introduce SF Pro as a webfont. Geist has no ₩ (U+20A9), so `--font-sans` starts with a one-glyph face (`Won Sign`, `@font-face` in `globals.css`, file `packages/ui/src/fonts/won-sign.woff2`, a subset of Pretendard with a little side space, OFL 1.1, credit in `NOTICE`) that only supplies ₩ and matches Geist's vertical metrics. Apps, Storybook and docs get it with `@repo/ui/styles.css`; registry consumers do not (the file is not part of the registry) and fall back to a system font for ₩.

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
| `primary-hover`, `ring` | `blue.500`    | `ring`             | accent 8 `#3b6ee6`  |
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

Dark values live on `.dark` (and OS `prefers-color-scheme: dark` when `html` is not `.light`). The Storybook theme toolbar (`globalTypes.theme` + `ThemeDecorator` in `.storybook/preview.tsx`) sets `html.light` / `html.dark`. Apps use `next-themes` with `attribute="class"` so the same classes land on `<html>`.

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

Dark surfaces: void black canvas (`#000000`). Text is Radix gray 12 / 11. Solid CTA is accent 9 `#003cff` with white label. Focus ring is accent 8 `#3b6ee6`. Hairline is gray 6 `#393a3f` — do not use 5–8% white on black; it disappears.

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
| `ring`                   | `#0071e3`         | `#3b6ee6`     |
| `primary`                | `#0066cc`         | `#003cff`     |
| `primary-hover`          | `#0071e3`         | `#0022ed`     |
| `primary-on-dark`        | `#2997ff`         | `#8ab5ff`     |
| `secondary-hover`        | `#f5f5f7`         | `#1f1f22`     |
| `dimmer`                 | `#000000`         | `#000000`     |
| `destructive`            | `#c41e3a`         | `#ff6369`     |
| `destructive-foreground` | `#ffffff`         | `#000000`     |

`primary-foreground` stays white in both modes. Press dimmer is `neutral.950` (black), never `foreground` — on dark, foreground would flash white.

- **Apps**: `next-themes` (`attribute="class"`, `defaultTheme="system"`) + page toggle. `html` needs `suppressHydrationWarning`.
- **Storybook**: theme toolbar (`.storybook/preview.tsx`). Never leave the canvas on light chrome while OS dark tokens are active.

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
- **Toggle (`aria-pressed`)**: `secondary` shows the on state as `border-primary` + a 1px `ring-primary`, the same family as OptionRow/PackageRow/ColorSwatchGroup selection. Keep the label fixed and let only `aria-pressed` change (a label that changes length shifts its neighbours); group toggles in `role="group"` with an `aria-label`.
- `size`: `small` | `medium` | `large` (default) | `xlarge`. `display`: `inline` | `block` | `full`. Same 1px hairline on primary and secondary (`box-border`).
- `loading`: keep label width, three-dot overlay, `aria-busy`. Combine with `disabled` when needed.
- **Disabled**: `bg-muted text-muted-foreground` (primary and secondary, hairline kept) or just `text-muted-foreground` (clear), never `opacity` (it was `opacity-40` once; contrast now 4.7:1 light, 8.9:1 dark).
- Icons + text: nest the icon as a sibling (Radix). Prefix `data-icon="inline-start"`, suffix `data-icon="inline-end"` (shadcn). Do not infer icon-only from children.
- Links: `asChild` on `<a>`, or `buttonVariants(...)` on a native `<a>`. Focus: 2px `ring-ring`. Primary also uses `ring-offset-2 ring-offset-background` so the ring reads on a filled CTA. Ghost buttons skip the offset so the halo stays small.

- `iconMotion` (`hover` default | `mount`): when a nested animated icon moves. `hover` = pointer hover, keyboard focus-visible, or the tap on touch; `mount` = once when the button appears (dialog footers, notice dismiss buttons). `icon` makes a square icon-only button (needs `aria-label`).

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

- Exports `useDialogOpen()` (is it open; used by parts that draw their own exit animation) and `useDialogClose()` (close from outside the close button, used by `Sheet` drag-to-dismiss); both ship in the registry `dialog` item. Dialog fades its overlay in `DURATION.base` with `EASE.outExpo` and out in `DURATION.fast`; `Sheet` differs on purpose (its exit follows the slide).

### Badge

- CVA `variant`: `default` ink fill (`bg-foreground text-background`), `secondary` parchment + hairline, `destructive` outline (`border-destructive text-destructive`). Default is an info chip, not a CTA.

### Card

- Compound: `Card`, `CardHeader`, `CardTitle`, `CardDescription`. Hairline `border-border`, `bg-card`, `rounded-lg`. No box-shadow, no `href` / UTM demo API.

### AnimatedAmount

- Money or number readout whose digits roll (NumberFlow) when `value` changes. The first render shows the final value without animation. Do not wrap it in Motion; `prefers-reduced-motion` turns the roll off.
- Default format is Korean won (`ko-KR`, integer, prefix `₩`; the prefix is added only when neither `prefix` nor `suffix` is passed, so `suffix="%"` stays a plain percent). `format` takes `Intl.NumberFormat` options; fraction digits follow `maximumFractionDigits` (else `minimumFractionDigits`, else 0) and `value` is rounded to them, so `4.5` with one fraction digit stays `4.5`.
- `reserveWidth` (default on) reserves the width of the current value so neighbouring layout does not jitter while digits roll. The overall width still changes when the digit count changes.
- Accessibility: the number is exposed as an `image` named with the formatted value; prefix and suffix are separate text. For an amount that matters and changes, pair it with an `aria-live="polite"` region holding the whole sentence ("1,250,000원").

### ScrollImageSequence

- Pin + scrub a viewport panel; map scroll progress to `frames` URLs (consumer-owned). Draw on canvas — do not `setState` per frame.
- GSAP ScrollTrigger only. Do not put Motion or Tailwind `transition-*` on the canvas.
- Overlay copy is `children` (accessible). Canvas is `aria-hidden`. `prefers-reduced-motion`: first frame.
- Not in the shadcn registry.

### Storybook 3D (not public API)

- **Image sequence** = 2D frames (`ScrollImageSequence`). **3D model** = GLTF or mesh, rotated by scroll.
- Storybook `컴포넌트/차량 3D` uses Three.js through `@repo/vehicle-3d` (`three`, `@react-three/fiber` are that package's dependencies). The 3D stories do not use page scroll: drag rotates, the wheel zooms (OrbitControls: drag to orbit, wheel to zoom). No Motion on the WebGL canvas.
- Studio look (IBL, clearcoat paint, ground shadow, OEM paint chips) is for Storybook. Chip hex lives in `packages/vehicle-3d/src/paints.ts` and stays the same in light and dark — it is not a semantic token. Bumper plastics follow a paired hex per chip. Do not vendor Renault / Plus360 meshes. BMW X5 G05 is the BMW Car IT CC BY 4.0 release, not a scrape. Doors, hood, and seats in that kit are half-meshes and are mirrored on Z in the Storybook assembler. The cabin also loads interior trim and the steering wheel. Dark windshield glass is made transmissive so the cabin is visible. `X5 원본` skips paint chips. Only openly licensed models are used (no EULA-restricted meshes). The CC BY 4.0 notice (creator, source, license, warranty disclaimer, modifications, trademark) lives in `vehicles.ts` `credit`, is shown in the story overlay, and is spelled out in `.storybook/public/models/README.md`.
- The 3D stage in the estimate app and the Storybook overlay share one set of controls built from `Button` (at least): camera view buttons (외관, 휠, 시트, 대시보드; `aria-pressed`, the active one gets the Button toggle look), four rotate arrows, 확대/축소 (disabled in the two inside views) and 처음 시점 (rotate and zoom show from `lg` in the web app), and a sunroof control whose name never changes: a 열기 toggle button in the Storybook overlay (only `aria-pressed` changes), and in the web app a 선루프 열어 보기 `SwitchField` (rolling 닫힘/열림 word) in a translucent pill over the top-left of the car that shares its frame (`Morph`) with the inside-view note, so it takes no row space and the pill morphs into the note when the view changes. In the web app the four views are a `Segmented` under the car, and zoom in/out/reset and the four rotate arrows are icon buttons laid over the car (hidden while the car is shrunken), so there is no sideways-scrolling row. The result step in the web app has 차량 이미지 저장; the Storybook overlay adds 이미지 저장 and a 선루프 있음/없음 group. Colours of the car come from `@repo/vehicle-3d`: body paint (`paints`), interior (`interiors`: black, cream, brown; seats, doors, headliner, pillars, steering wheel recoloured to a similar colour), brake caliper (`calipers`: 기본, 블루, 레드, 블랙, 옐로, 골드). They are chip colours, not semantic tokens, and render duller than their hex under the studio light. The interior and caliper are approximations and the screen says so.
- Fullscreen 3D stories skip the default Storybook canvas padding. The stage is the first paint in the iframe; the overlay stays compact at the top-left so the car is not covered.
- Not exported from `@repo/ui/*`. Not in the registry. Storybook's sample `g05/` originals (BMW X5 G05, CC BY 4.0) and its `studio.hdr` copy are gitignored (`pnpm --filter @repo/ui copy:car`); only the optimized `g05-web/*.glb` (no emblem) and the CC0 `studio.hdr` are committed under `apps/web/public/models/`, with third-party terms in the root `NOTICE`.

### Radio

- Native `<input type="radio">` with `appearance-none`: 20px circle, `border-border`; checked = `border-primary` + `bg-primary` with a 4px `background` inset ring so the centre reads as a dot (shape, not colour alone). Forced-colors falls back to the native control.
- Focus `ring-2 ring-ring ring-offset-2`; invalid `aria-invalid` → destructive ring; disabled `bg-muted` (never opacity).
- Pair with `Label htmlFor`; group with `fieldset` + `legend`. Same `name` gives arrow-key navigation for free.
- Motion: selecting pops (`animate-select-pop`); when another radio of the group takes over, the selected dot (a `::before` ghost) shrinks away (`animate-select-out`, 0.2s). Driven by `useCheckPhase`; still on first paint and under reduced motion.

### NativeSelect

- Native `<select>` inside a `relative` wrapper with a decorative chevron (`aria-hidden`, `pointer-events-none`). Same 44px height, `rounded-md`, hairline and focus ring as Input; invalid and disabled behave like Input.
- Use for short closed lists (region, tax type). Do not style the option list; mobile opens the OS picker.

### OptionRow

- Single-choice row: `rounded-lg`, hairline `border-border`, 16px padding. Native radio is `sr-only`; a decorative indicator mirrors Radio. Selected = `border-primary` + `ring-1 ring-primary`: inside an `OptionGroup` that frame is ONE always-present `motion.span` owned by the group (`absolute inset-x-[-1px] top-0 rounded-lg border-primary ring-1`, the last child of a `relative flex flex-col gap-2` rows box inside the fieldset — NOT the fieldset itself, whose absolute containing block starts below the `legend` and put the frame 32px too low — so it always paints above every row and its transparent middle never hides content). The checked row reports itself to the group (`claim` in a layout effect, `release` on cleanup), and the group moves the frame to that row's `offsetTop − 1` / `offsetHeight + 2` with `SPRING.settle` on a `y` and a `height` motion value (no overshoot; the first placement and reduced motion jump; the frame element is created once and then only hidden (`opacity`) when no row is checked, because an uncontrolled group can process the old row's uncheck and the new row's check in separate renders and removing the element jumped the next placement; a `ResizeObserver` on the row and the rows box follows size changes without animation; `forced-colors:border-2 forced-colors:border-[Highlight]`, 2px because a 1px Highlight line was barely told from the CanvasText row borders). An earlier version drew the frame inside each checked row with a shared `layoutId`: moving to an earlier row slid it BEHIND the rows below it, and uncontrolled moves could skip the animation, so it was replaced. The frame is a decoration on `absolute`, so animating `height` does not move other elements. a row outside a group keeps the CSS `has-checked` frame. The checked state comes from `checked`, or for an uncontrolled row from the document `change` event; keyboard focus = 2px `outline-ring` offset 2px; hover = `bg-secondary-hover`. No scale on hover or press.
- Slots: `label`, `description`, `price`, `media`, `badge`. The label, description and reason are wired through `aria-labelledby` / `aria-describedby`.
- `unavailableReason` turns the row `bg-muted` and always shows the reason inline (never hover-only). The input stays enabled with `aria-disabled` so a click can offer an alternative; use `disabled` to block outright.
- `OptionGroup` = `fieldset` + `legend` (`text-sm font-semibold`). Use one `name` per group.

### ColorSwatchGroup

- Colour chips: 36px circles with a hairline; selected = `ring-2 ring-primary ring-offset-2` (in dark `ring-primary-on-dark`: `primary` is a deep blue that nearly disappears on a dark panel) drawn by ONE ring element owned by the group (a `size-9` `motion.span`, the last child of the `relative` chips box — not the fieldset, whose absolute containing block starts below the `legend` — moved with `x`/`y` motion values to the checked chip's `offsetLeft`/`offsetTop` using `SPRING.settle`; it slides across lines and sub-groups, never unmounts (hidden with `opacity` when nothing is checked), the first placement and reduced motion jump, a `ResizeObserver` follows wrapping changes; `forced-colors:outline-2 forced-colors:outline-[Highlight]` because forced colors drops the box-shadow ring, which left the checked chip with no mark before); keyboard focus = 2px outline offset 4px. The chip colour comes from the caller (`color`) and is the only place a non-token colour appears; the component never hardcodes one.
- `group` renders sub-headings (`text-caption text-muted-foreground`). The caption under the chips shows the hovered/focused chip, else the selected one: name + price, or its `unavailableReason`.
- Unavailable chips get a diagonal strike (not colour alone), stay enabled with `aria-disabled`, and expose the reason via `aria-describedby`.

### PackageRow

- Checkbox row built like OptionRow (native checkbox `sr-only`, decorative box with a check mark, `ring-1 ring-primary` when checked). `items` adds a Radix Accordion trigger ("구성 보기") that expands the included list; the trigger's accessible name includes the package label.
- Layout: the `구성 보기` trigger is always on its own line under the price, right-aligned (`basis-full justify-end`; the outer row is `flex-wrap`, the label is `flex-1 min-w-0` with `-m-4 p-4` so it spans the full row). That puts the price (`ml-auto`) in the same right-edge column as the price of every plain `OptionRow`; with the trigger beside the price it sat 100px left of that column at every width, and a width-dependent placement (flex-basis threshold) left a ~6px band where the price had already wrapped under the text but the trigger was still beside. The cost is one trigger line (about 44px) on rows with `items` at wide widths. No container queries (inline-size containment would collapse the row's width in shrink-to-fit parents of registry consumers). Inside the label the checkbox + text group has `min-w-36`, so below about 250px the price drops under the text, still right-aligned. The text column never goes under about 130px.
- `includedIn` marks an item that is already checked because another package includes it (muted surface + small tag). It does not disable the checkbox; callers show a confirmation before unpacking the package.
- The accordion chevron rotates and the included list opens to its measured height (`animate-accordion-down`, 0.28s `ease-out-expo`, height + opacity; closing `animate-accordion-up`, 0.2s) — both off under reduced motion (`motion-safe:`). Radix Presence applies `hidden` only after the close animation ends (the region element itself stays in the DOM, hidden, at height 0). The check box pops and its check draws in on change (see Motion).

### Stepper

- Compound: `Stepper` (`nav` + numbered `ol`, needs `aria-label`) and `StepperItem` (`li` + link). `Stepper value` equal to an item's `value` marks the current step with `aria-current="step"`. Links via `href` or `asChild` (Next `Link`); all steps are reachable in any order.
- Item: 44px min height, `isolate`, no border; radius follows `indicator` (`rounded-pill` for `pill`, `rounded-md` for `underline` and `ring`). `indicator` (default `pill`) picks the current-step mark, one `motion.span` with a shared `layoutId` that slides between steps with `SPRING.settle` (no overshoot; `duration: 0` under reduced motion): `pill` = `bg-muted` + `border-border` behind the item (`-z-10` inside the isolated item, above the hover background and under the number and text; the hairline border is the only thing apart from the hover fill, which equals `bg-muted` in light, so the filled badge and semibold text carry most of the difference; matches the Segmented pill), `underline` = a 2px `bg-primary` bar (`forced-colors:bg-[Highlight]`) that inherits the item's inline padding, `ring` = `border-primary ring-1 ring-primary`. In forced colors the pill and ring keep a `Highlight` border. Current = `text-foreground`, semibold, filled `bg-primary` number badge; the mark alone is faint (pill about 1.1:1 against the page), so the filled badge, the semibold text and `aria-current="step"` carry the state. Completed (`completed`) = check mark badge on `bg-muted` plus visually hidden "(완료)".
- Numbers come from CSS counters (decorative, `aria-hidden`); the list supplies order to assistive tech.
- The list scrolls horizontally with the scrollbar hidden; the current step is centred on change (instant under reduced motion). When the list overflows the clipped edge fades out (`mask`, driven by `data-edge` = `start` | `middle` | `end` on the `nav`). Hover = `bg-secondary-hover`; focus = 2px `outline-ring`, offset 2px. No scale.

### Reveal

- Compound: `RevealGroup` (staggers its `Reveal`s) and `Reveal` (fade + 12px rise on entering the viewport, plays once, `motion.div`). Standalone `Reveal` works without a group. Properties animated: `opacity` and `transform` only; duration `DURATION.slow`, ease `EASE.outExpo`, stagger `STAGGER.base` (0.04s).
- Reduced motion (live `useReducedMotion`): no translate, `DURATION.instant` fade, no stagger. Content is in the DOM from the start (assistive tech unaffected) but hidden until JS runs, so do not wrap above-the-fold essentials.
- No Tailwind `transition-*` on these nodes.

## Motion

Tokens live in `packages/ui/src/lib/motion.ts` (`@repo/ui/motion`, registry item `motion`) and `@theme` (`--ease-out-expo`, `--animate-select-pop`). Page: docs 파운데이션 > 모션.

- **Durations**: instant 0.12s, fast 0.18s (hover/press), base 0.28s (selection/state), slow 0.45s (list/section entrance), hero 0.8s (one per screen).
- **Springs**: `snappy` (520/32: press, active indicator), `gentle` (260/28: panels), `bouncy` (380/18: small emphasis, one per screen). Ease: `outExpo` cubic-bezier(0.22, 1, 0.36, 1) default, `inOut` for size/position swaps. Stagger 0.03/0.04/0.08s.
- **Icons**: (exception to "direct children of Button": `CopyButton`, `Stepper` and `PackageRow` draw their check inside a `span`/`span.contents` and drive it with `isHovered` from state) animated icons (`@repo/ui/icons/*`, from lucide-animated or hand-made) play **once** on pointer hover (on touch: for the tap, held 1.2s) and keyboard focus-visible of the button that contains them, or once on a state change through `startAnimation()`; they are decorative (`aria-hidden`), skip all motion under `prefers-reduced-motion`, and loop only for in-progress states. Put them as direct children of `Button` with `data-icon`. Choose when an icon moves with `Button` `iconMotion`: `hover` (default) for controls whose motion says something about the action (next/previous arrows, zoom, reset, print), `mount` for buttons where a hover animation every time would be noise (dialog footers, notice dismiss buttons): the icon plays once when the button appears and ignores hover and focus. Inside shadcn-registry components only registered icons (`icon-check`, `icon-x`, installed to `@/lib/icons/`) are used: CopyButton, Stepper and PackageRow draw the check in at the moment of completion/selection (never on first paint), and the Toast close mark (`iconMotion="mount"`) draws once when the card appears and does not replay on hover or focus.
- **Applied**: selection pop on Radio/OptionRow/PackageRow/ColorSwatchGroup (`animate-select-pop`, 0.32s) and a direct shrink on clear (1 → 0.6 and fade, no overshoot, `animate-select-out`, 0.2s, drawn by a ghost copy of the checked look; `ColorSwatchGroup` has no ghost any more because its ring slides), both driven by `useCheckPhase` (`./lib/check-phase`, registry item `check-phase`) so nothing moves on first paint; works controlled or uncontrolled (uncontrolled radios hear the group through document `change` events). Standalone `Radio` and `Checkbox` are childless `<input>`s, so their clear ghost is drawn on `::before` (and the checkbox tick on `::after`) with the same `animate-select-out`; the input's own `box-shadow`/`border` are never animated because a held animation would override the focus ring and invalid styling, Stepper active border glides between steps (`layoutId`, `SPRING.snappy`), Reveal entrance, Button press uses `SPRING.snappy`.
- **Rules**: motion marks a state change (select, enter, move, load); no ambient or cursor-following decoration. Move `opacity`/`transform` only (the one exception is the PackageRow accordion, which opens `height`: a single small list, driven by Radix's measured `--radix-accordion-content-height`). One big flourish per screen. Honour reduced motion live (`useReducedMotion`; CSS gets `motion-reduce:animate-none`). Never Motion + Tailwind `transition-*` on one node, never Motion on a WebGL canvas, pause anything looping when off-screen. Hover scale, shadows and decorative gradients stay out.

### Checkbox

- Native `<input type="checkbox">` with `appearance-none`: 20px, `rounded-md`, `border-border`; checked = `border-primary` + `bg-primary` with a `::after` tick (`border-primary-foreground`, shape not colour). Focus `ring-2 ring-ring ring-offset-2`; invalid → destructive ring; disabled `bg-muted` (never opacity); forced-colors falls back to the native control. No `indeterminate` yet.
- Motion via `useCheckPhase`: checking pops (`animate-select-pop`, 0.32s); clearing shrinks a `::before` fill and the `::after` tick away (`animate-select-out`, 0.2s). Still on first paint and under reduced motion. Forced-colors hides the pseudo-elements (native control draws itself); a disabled checked tick uses the `background` colour for contrast.
- Pair with `Label htmlFor`; group with `fieldset` + `legend`.

### Sheet

- Same Radix dialog as `Dialog` (shared parts: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`); only `SheetContent` differs. `side` = `right | left | top | bottom` (summary on mobile = `bottom`, desktop slide-over = `right`). `bg-card`, `border-border` on the inner edge, no shadow; `rounded-t-lg`/`rounded-b-lg` only for bottom/top. Width `calc(100%-2rem)` up to `max-w-md`.
- **Handle and drag (bottom only, `handle` default true; modelled on HeroUI Drawer)**: a 40×4px `bg-muted-foreground` bar centred at the top (`aria-hidden` and not focusable without `snapPoints`; with `snapPoints` it is a real `<button data-sheet-handle aria-label="시트 높이 바꾸기">` that steps to the next snap on click or Enter/Space and wraps from the largest to the smallest, and a drag started on it still drags). The sheet does not scroll itself while dragging is on, so it never hides content: without snaps it keeps `overflow-y-auto`, with snaps `overflow-clip`; both leave pinch-zoom on (`touch-pinch-zoom`, never `touch-none`): long content goes in `SheetBody` (`min-h-0 flex-1 overflow-y-auto touch-pan-y`, `data-sheet-body`), with header and footer outside so they stay visible. A drag starts on the handle, title or empty footer space and never inside `SheetBody` or on a button, link, input or label (pointer-down filter), so scrolling never drags the sheet; it is elastic only downwards, closes past 30% of the sheet height or faster than 500px/s, otherwise springs back. On touch, pulling down on `SheetBody` while it is scrolled to the very top hands the gesture to the sheet (the first `touchmove` is cancelled so the browser does not scroll; anywhere else the body scrolls normally). Nested sheets: a `SheetContent` opened inside another registers its "openness" (the backdrop value: 1 fully open, 0 closed, computed from its position) with the outer one, which scales to `1 − 0.05·Σ openness` from its bottom edge (bottom sheets only, not under reduced motion). So dragging the inner sheet's handle down grows the outer sheet back toward full size by the same percentage, and the slide in/out is matched automatically. Dragging the handle or title does not select text (`select-none`; `SheetBody` is `select-text`). The sheet follows the finger 1:1 (elastic only downwards); a touch flick started on the body is measured by the sheet itself because the first touchmove is swallowed by the hand-off. A nested sheet's overlay is `bg-overlay/50` so the backdrop is not doubled. **Snap points** (`snapPoints` fractions of the viewport, ascending, bottom + handle only): the largest is the sheet height, `defaultSnapIndex` is where it opens; releasing picks the snap nearest to the position projected 0.25s ahead by the release velocity, closed counts as a candidate (below half of the lowest snap); the body scrolls only at the largest snap, lower snaps drag from the body too (`group-data-[expanded=false]`). `handle={false}` restores the old whole-sheet scroll and no drag. Dismiss by keyboard stays Esc or a `SheetClose` button. The receded outer sheet of a nested pair gets a stronger top border (`data-nested`, `border-muted-foreground`, `/80` in dark; checked against the dark backdrop at rest). `SheetBody` becomes a keyboard tab stop (`tabIndex=0`, focus ring inside) only while it overflows, and with an `aria-label` it is a `region`; keyboard focus entering `SheetBody` while the sheet sits at a lower snap expands it to the largest snap. The touch hand-off from `SheetBody` starts Motion's drag from the current finger position (a synthetic pointerdown) and sets the sheet to the distance already travelled, because the browser withholds the first ~15px of touchmove (touch slop); otherwise the sheet sat still for 16px and then jumped, or ran 16px ahead of the finger.
- Motion: the panel slides all the way from/to its edge with no opacity change (in `DURATION.base` + `EASE.outExpo`, out `DURATION.base` + `EASE.inOut`; fading it made a closing sheet vanish midway); the backdrop darkness is computed from the sheet's position (`useTransform(y)`: `1 − y/height`, 0 = full, fully down = transparent), so it lightens with the finger while dragging and in step with the slide when opening and closing; a nested sheet's backdrop is `bg-overlay/50`; none under reduced motion. The overlay is drawn by `SheetContent` itself, not by the shared `DialogOverlay`: an outer layer fades in and stays until the slide ends, and an inner layer's darkness follows the sheet position. **`SheetTitle` is required.**

### ChangeDiff

- Semantic table: `caption` (sr-only), `scope="col"` headers (항목 / 이전 선택 / 변경 후), `scope="row"` item names. Added/removed/changed is a **text tag** under the item name (`rounded-full border-border bg-muted text-xs`), never colour alone; empty cell = `—` plus sr-only "없음".
- Surface `bg-card border-border rounded-lg`; header row `bg-muted text-muted-foreground`; optional summary row (`bg-muted`, tabular numbers). Prices are caller-formatted. Use inside a confirmation `Dialog`; nothing changes until confirmed.

### Notice

- Compound: `Notice`, `NoticeTitle`, `NoticeDescription`. `variant` `info` (`bg-muted border-border`, `role="status"`) or `error` (`border-2 border-destructive`, title `text-destructive`, body `text-foreground`, `role="alert"`). Role is overridable. In-flow content that stays; transient messages are `Toast`.

### Toast

- `ToastProvider` + `useToast().toast({ title, description?, variant?, duration?, action? })`. Announcing is done by two always-mounted sr-only live regions (`role="status"` polite, `role="alert"` for `variant="error"`, prefixed "오류: "); the visible cards are plain list items inside a fixed `role="region"` (label + hotkey) and are for keyboard reach, not reading. Card: `bg-card border-border rounded-lg`, error `border-2 border-destructive`; no shadow; focus ring on the card.
- F8 (configurable, ignores repeat/modifiers) focuses the oldest card and does nothing when empty; focus returns to where it was when the card is dismissed. Auto-dismiss 5000ms for plain toasts (hover / focus-within / hidden window each hold the timer; the remaining time resumes only when none hold it); toasts with an `action` or `variant="error"` stay until dismissed. Esc on a focused card dismisses; the close button always exists. On touch and pen (never mouse, so text stays selectable) the card can be swiped sideways: it follows the finger on `x` (fading toward 0.35 at 180px, `touch-pan-y touch-pinch-zoom` keeps vertical scroll and pinch-zoom), dismisses past 35% of its width (a toast that times out also by a flick faster than 500px/s after at least 24px; error and action toasts only by distance, so an accidental flick cannot lose them), otherwise springs back (`SPRING.snappy`); the auto-dismiss timer is held while dragging. The outer `li` owns enter/exit/layout and the focus ring, an inner motion element owns the drag. Never use inside a modal (the rest of the page is inert while a Dialog/Sheet is open). Enter/exit via Motion (`DURATION.base` up from 16px, `DURATION.fast` out); none under reduced motion.

### PriceBar

- Compound: `PriceBar` (`role="region"`, label "견적 요약", `fixed` pins to the bottom with safe-area padding), `PriceBarTotal` (label + `AnimatedAmount`, shrunk to fit the space left beside the actions — `em` scale 1 down to 0.5 of `text-title`, and the bar wraps the total onto its own line when even that does not fit, measured once from the width ratio and re-measured by `ResizeObserver`, so it never overlaps the buttons; a size change eases in over 180ms with a `transform: scale` from the previous size (layout size changes at once, so measuring is unaffected), none under reduced motion; the visible number is `aria-hidden`, a `role="status"` sr-only line announces "label amount" 500ms after the amount stops changing and stays silent on first render), `PriceBarActions`, `PriceBreakdown` (`dl`; `currency` `symbol` (default) | `won` on `PriceBar` / `PriceBreakdown` picks "₩1,000" or "1,000원" for every `PriceBarTotal` / `PriceRow` inside via context, announcements and `PriceRow` speech stay in "원" because screen readers differ on "₩"; `role="group"` only when it has a `title`), `PriceRow` (number → `₩1,000,000`, `signed` adds `+`/`−`, `total` row has a top hairline, `action` slot). `bg-background border-t border-border`, no shadow. Count-up comes from `AnimatedAmount` (NumberFlow honours `prefers-reduced-motion`); no extra motion. Row links need a non-colour cue (underline) and their own `aria-label`; use distinct `aria-label`s when several bars exist and place a `fixed` bar last in the DOM.

### DataTable

- Generic `DataTable<Row>` with `columns` (`key`, `header`, `cell?`, `numeric?`, `rowHeader?`), `rows`, `getRowKey`, optional `footer`. `caption` is required (`captionHidden` makes it sr-only; the table then also gets `aria-labelledby`). `th scope="col"` / `scope="row"`; numeric columns are right-aligned, `tabular-nums` and never wrap; text cells wrap. The wrapper is a focusable `role="region"` (`tabIndex=0`, named by the caption) that scrolls horizontally when the table overflows (WCAG 1.4.10 data-table exception). A footer cell for a `rowHeader` column without a value renders as `td`. `bg-card border-border rounded-lg`, header `bg-muted`.

### Skeleton

- Compound: `Skeleton` (`bg-muted rounded-md`, `aria-hidden`, `motion-safe:animate-pulse`, paused off-screen via `useInView`; size and shape come from `className`) and `SkeletonGroup` (plain wrapper with an sr-only `label`; no `role="status"`/`aria-busy`, which suppress announcements in some screen readers; announce completion from an always-mounted status line owned by the consumer). Loading placeholder only; use `Progress` when the amount done is known.

### Progress

- `Progress` (`role="progressbar"`, `aria-valuemin/max/now/valuetext`, name from required `label` via `aria-labelledby`, `labelHidden` makes it sr-only). Value text defaults to a percentage and can be replaced by `valueText`; the visible text is `aria-hidden` because `aria-valuetext` carries it. Track `bg-muted` with an inset `border` ring (so its extent is visible), fill `bg-primary` (`primary-on-dark` in dark, ≥3:1 on the track; `Highlight`/`ButtonText` in forced colors) moved with `transform` only (`duration-450` ≈ `DURATION.slow`, `--ease-out-expo`, none under reduced motion). The default percent text is an `AnimatedAmount` (suffix `%`) so the number rolls with the bar; a custom `valueText` is plain text.

### CopyButton

- `CopyButton` wraps `Button` and inherits its defaults (`variant`, `size`, `radius`): do not set different defaults here, or a copy button placed next to a plain `Button` will look different (it once defaulted to `medium` next to `large` buttons). `value`, `label` / `copiedLabel` / `failedLabel`, `iconOnly` (square icon button like `IconButton`; the label stays as sr-only text so the accessible name still changes with the state), `resetDelay` (2000ms), `onCopy`, `onCopyError`. All labels are stacked in one grid cell so the width never changes; always-mounted sr-only regions announce the result: `role="status"` for success and `role="alert"` for failure, re-rendered with a counter key so repeats are read again. `aria-label` is not accepted (it would freeze the state label); the regions are siblings, so avoid `space-*`/`divide-*`/`:last-child` styled groups. Falls back to the failed label when `navigator.clipboard` is unavailable.

### TextRoll

- Rolls a short text when `children` changes: the old text slides one block out (`y: 0 → ∓100%`) while the new text follows from `±100% → 0` with the same distance, duration (`DURATION.base`) and curve (`EASE.outExpo`), so the two touch with almost no gap. The whole text moves as one block (a per-character stagger was tried and dropped: the order mixed and glyphs collided on two lines). `direction` (`up` default, `down`) sets the way it rolls; pass `up` when going to the next step and `down` when going back. Nothing moves on first paint (`AnimatePresence initial={false}`). Reduced motion: opacity-only swap at `DURATION.instant`. The animated layer is `aria-hidden` and `select-none`, one `sr-only` copy is read; no live region. Clipped by `overflow-hidden` with 0.1em vertical padding so ascenders and descenders are not cut. Pressing next/previous very fast stacks the exiting layers for a moment (about 0.3s each).

### Segmented

- Compound: `Segmented` (`role="radiogroup"`, native radios inside) + `SegmentedItem` (`label` with an `sr-only` radio). Two to four short single-choice options; options with descriptions or prices stay `OptionRow`, long lists stay `NativeSelect`. Controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`); `name` is generated when omitted.
- `indicator` picks the selection mark: `pill` (a `bg-muted rounded-pill p-1` track with a `bg-background border-border` hairline pill (about 1.4:1 light / 1.6:1 dark against the track — below 3:1 on purpose: a stronger `muted-foreground` border was tried and rejected as too heavy, so the selected label colour 4.66 → 16.83:1 carries the state and `underline`/`ring` are the stronger shapes; `forced-colors:border-[Highlight]`) behind the selected item, item `h-9 px-4`, track 44px), `underline` (a 2px `bg-primary` bar, `forced-colors:bg-[Highlight]`, at the bottom of a `border-b border-border` row, item `h-11`) or `ring` (a `border-primary ring-1 ring-primary rounded-md` ring, item `h-9`). The mark is one always-mounted `motion.span` owned by the group (the first child, so item text and focus rings paint above it), moved to the checked item with `SPRING.settle` (no overshoot; `snappy` overshot about 4.5% of the travel) by measuring the item against the group box (`getBoundingClientRect` differences), with a `ResizeObserver` re-snapping without animation on resize; under reduced motion it jumps. It is not a per-item `layoutId`: that read an ancestor moving (the estimate stage shrinking and pushing the whole segmented up 135px while the panel scrolled) as the mark moving, and the mark trailed behind the track for about 320ms. The pill is absent from the server HTML and appears on mount. The label colour is the only text change (`text-muted-foreground` → `text-foreground`): the weight stays `font-medium` so selecting never shifts widths. Hover (only on a selectable, unselected item): the label turns `text-foreground` and gets a fill — `bg-foreground/8` in the pill (a faint foreground wash: slightly darker than the track in light, slightly lighter in dark, the opposite direction of the selected pill, which is lighter/darker than the track and has a border; `secondary-hover` would vanish on the `bg-muted` track and `bg-background/60` was nearly invisible in dark at 1.08:1) and `bg-secondary-hover` in `underline`/`ring` (the item is `rounded-md`) — so a hovered item cannot be mistaken for the selected one by text colour alone. Focus = 2px `outline-ring` offset 2 on the label (offset 0 in the pill, whose 4px track padding is already outline + gap); disabled = `opacity-50`, `cursor-not-allowed`, no hover change (`opacity-50` is a deliberate exception to `bg-muted`/`text-muted-foreground`: the text already is `muted-foreground` on the pill track, so only opacity tells it apart). `aria-label` or `aria-labelledby` is required by the type; items need visible text.

### Switch

- Native `<input type="checkbox" role="switch">` with `appearance-none` (type and role fixed), styled like Checkbox/Radio: the input is the track (`h-6 w-11 rounded-pill border`), the thumb is its `::after` (16px circle, `top-1/2`, `left-[3px]`), a transparent `::before` widens the hit area to 36px (`-inset-y-[7px]`, 6px beyond the border box; wider overlapped a neighbour stacked at `gap-3` and stole its clicks; a `Label` widens it further). Off = `bg-muted border-border` (same boundary as an unchecked Checkbox/Radio; a `muted-foreground` border was tried and looked heavy) + `muted-foreground` thumb (4.66:1 against the track; the thumb position and fill also state it); on = `bg-primary border-primary` + `primary-foreground` thumb at the right (`left-[calc(100%-3px-var(--thumb))]`, so the right edge stays fixed while it stretches). Focus `ring-2 ring-ring ring-offset-2`; invalid → destructive ring; disabled = `bg-muted border-border` (on: `muted-foreground`), `cursor-not-allowed`.
- Motion without JS state: `:active` sets `--thumb` from 1rem to 1.25rem, and the thumb transitions `left`, `width` and `background-color` over 280ms (`ease-out-expo`, no overshoot, matching `SPRING.settle`); the track fades its colours over the same time. `:active` also applies on the input while a space key is held or its `Label` is pressed (verified for mouse, Space and Label; a CDP touch hold did not stretch, real devices unchecked). `motion-reduce` removes the transition and the stretch. `left`/`width` of an absolutely positioned pseudo-element do not move other elements (same reasoning as the OptionGroup frame exception). Forced colors: `forced-colors:border-[ButtonText]`, thumb `ButtonText`, on = `Highlight` track + `HighlightText` thumb; disabled needs its own `forced-colors:disabled:*` (`GrayText`) because the disabled rules out-specify the plain forced-colors ones.
- Pair with `Label htmlFor`, or `aria-label` when there is no visible label. Use it for one setting that takes effect at once; several choices stay Checkbox/PackageRow, one-of-many stays OptionRow/Segmented.

### SwitchField

- Composition of `Switch`, `Label` and an optional rolling state word: the switch sits INSIDE one `Label` (no `htmlFor`), so the gap between switch and text is clickable and a label press makes the input `:active` (stretch). `inline-flex h-8 gap-2 px-1` (32px, like the small buttons beside it), `has-disabled:text-muted-foreground cursor-not-allowed` (no opacity; the switch carries its own disabled colours). `label` is the accessible name and never changes with state (a state-dependent name reads "닫아 보기, 켜짐" and breaks voice control); the checked state comes from the switch. `status={{ on, off }}` shows a small muted `text-caption` word beside it that rolls with `TextRoll` (up when on, down when off), `aria-hidden` because the switch already announces it, with the longer word laid out invisibly in the same grid cell so the width never changes. Checked state: `checked`, or an internal copy for uncontrolled use that is re-read from the input after a form `reset` (a `setTimeout(0)` after the event, since `reset` fires before the values are restored); programmatic `input.checked = …` is not seen. `className` goes to the outer label, every other prop to the `Switch`.

### Presence

- Wrapper that animates a conditionally rendered element in and out with `AnimatePresence`, so neighbours ease aside instead of jumping when it appears or leaves. The space-opening variants animate the box `width` (`from` `left`/`right`) or `height` (`up`/`down`) between 0 and `auto` while the box clips its overflow (`overflow: clip` while it moves, released to `visible` once fully open so focus rings are not clipped; no padding trick, because a padded clip edge reaches into the neighbour and the sliding control leaks 4px over it). This is a documented exception to "opacity and transform only" (like the PackageRow accordion height) and is meant for one small control. `variant`: `collapse` (the control stays put and is revealed as the box opens), `slide` (default: also translates 100% along `from`, clipped by the box so it never passes over a neighbour), `spring` (`slide` with `SPRING.settle` instead of a timed curve), `reserve` (the space is always kept, the control only slides inside it and is `visibility: hidden` + `inert` while off, so neighbours never move; use where an empty slot is acceptable, e.g. the end of a row). The first three move neighbours every frame and can feel jerky; there is no `none` variant — a plain conditional render covers it. In `DURATION.base` + `EASE.outExpo`, out `DURATION.base` + `EASE.inOut`. Opacity is never animated (a fade left a half-transparent in-between look the user rejected). First paint is still (`AnimatePresence initial={false}`; `animateOnMount` turns it on). Under reduced motion it appears and leaves instantly. The leaving element is `inert` (`useIsPresent` in a direct child; `usePresence` would need `safeToRemove` called by hand or the element never leaves the DOM). Focus inside the leaving element falls to `body`; the caller moves it first. Used for controls that appear when an option is added (e.g. the sunroof switch).

### Morph

- Frame for one spot that holds different content depending on state (the sunroof switch pill and the interior note share the top-left corner of the car in the web app). `value` names the current content; when it changes the frame morphs to the new content's size (Motion `layout`, `SPRING.settle`) and its corner radius (`radii`, default 8, animated as a value so the projection corrects it), while the old content leaves and the new one enters sideways inside the clipped frame (`overflow: clip`, `popLayout` so the leaving panel is taken out of flow and the frame fits the new size at once). `order` decides the side it enters from (later name → from the right, earlier → from the left; default always from the right). Opacity is never animated (same rule as `Presence`); the content is `layout="position"` so it is not stretched while the frame resizes. Keep `children` and `value` in step (same render) and keep the state of controls inside in the parent, because the panel is keyed by `value` and remounts; no fixed ids inside (the leaving copy lingers). Give the frame `bg-background/95` or more when muted text sits on it over an image. `value={null}` slides the frame out to the left (the parent clips it); first paint is still (`animateOnMount` turns it on). Leaving content and a leaving frame are `inert`. Under reduced motion it changes instantly. Another documented exception to "opacity and transform only" (the size change goes through `layout` transforms, but the frame's size does change); use for a small frame laid over something, not for content in the flow.

### Do

- Use `primary` for every “click me” fill or link on light surfaces.
- Keep hairline borders visible (`border-border`). Not 8% black on white, not 8% white on black.
- Pair Storybook / page chrome `bg-background` with `text-foreground`.
- Update `registry.json` `theme.cssVars` when tokens change.

### Don't

- Don't invert OS dark tokens onto a white Storybook canvas — the Storybook theme toolbar must set `html.light` or `html.dark`.
- Don't add a second **brand** accent. Status color (`destructive`) is allowed; do not use it as a CTA fill.
- Don't put shadows on buttons, cards, or dialog frames.
- Don't hardcode hex in `packages/ui/src/*.tsx`. The OEM paint chips in `packages/vehicle-3d/src/paints.ts` are the exception so paint does not flip with theme.
- Don't use `bg-neutral-*` / `bg-blue-*` in components — map through semantic tokens.
- Don't mix Tailwind `transition-*` with Motion on one element.
