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

### AnimatedAmount

- Money or number readout whose digits roll (NumberFlow) when `value` changes. The first render shows the final value without animation. Do not wrap it in Motion; `prefers-reduced-motion` turns the roll off.
- Default format is Korean won (`ko-KR`, integer, suffix `원`). `format` takes `Intl.NumberFormat` options; fraction digits follow `maximumFractionDigits` (else `minimumFractionDigits`, else 0) and `value` is rounded to them, so `4.5` with one fraction digit stays `4.5`.
- `reserveWidth` (default on) reserves the width of the current value so neighbouring layout does not jitter while digits roll. The overall width still changes when the digit count changes.
- Accessibility: the number is exposed as an `image` named with the formatted value; prefix and suffix are separate text. For an amount that matters and changes, pair it with an `aria-live="polite"` region holding the whole sentence ("1,250,000원").

### ScrollImageSequence

- Pin + scrub a viewport panel; map scroll progress to `frames` URLs (consumer-owned). Draw on canvas — do not `setState` per frame.
- GSAP ScrollTrigger only. Do not put Motion or Tailwind `transition-*` on the canvas.
- Overlay copy is `children` (accessible). Canvas is `aria-hidden`. `prefers-reduced-motion`: first frame.
- Not in the shadcn registry.

### Storybook 3D (not public API)

- **Image sequence** = 2D frames (`ScrollImageSequence`). **3D model** = GLTF or mesh, rotated by scroll.
- Storybook `컴포넌트/차량 3D` uses Three.js through `@repo/vehicle-3d` (`three`, `@react-three/fiber` are that package's dependencies). The 3D stories do not use page scroll: drag rotates, the wheel zooms (OrbitControls (drag to orbit, wheel to zoom). No Motion on the WebGL canvas.
- Studio look (IBL, clearcoat paint, ground shadow, OEM paint chips) is for Storybook. Chip hex lives in `packages/vehicle-3d/src/paints.ts` and stays the same in light and dark — it is not a semantic token. Bumper plastics follow a paired hex per chip. Do not vendor Renault / Plus360 meshes. BMW X5 G05 is the BMW Car IT CC BY 4.0 release, not a scrape. Doors, hood, and seats in that kit are half-meshes and are mirrored on Z in the Storybook assembler. The cabin also loads interior trim and the steering wheel. Dark windshield glass is made transmissive so the cabin is visible. `X5 원본` skips paint chips. Only openly licensed models are used (no EULA-restricted meshes). The CC BY 4.0 notice (creator, source, license, warranty disclaimer, modifications, trademark) lives in `vehicles.ts` `credit`, is shown in the story overlay, and is spelled out in `.storybook/public/models/README.md`.
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

- Single-choice row: `rounded-lg`, hairline `border-border`, 16px padding. Native radio is `sr-only`; a decorative indicator mirrors Radio. Selected = `border-primary` + `ring-1 ring-primary`; keyboard focus = 2px `outline-ring` offset 2px; hover = `bg-secondary-hover`. No scale on hover or press.
- Slots: `label`, `description`, `price`, `media`, `badge`. The label, description and reason are wired through `aria-labelledby` / `aria-describedby`.
- `unavailableReason` turns the row `bg-muted` and always shows the reason inline (never hover-only). The input stays enabled with `aria-disabled` so a click can offer an alternative; use `disabled` to block outright.
- `OptionGroup` = `fieldset` + `legend` (`text-sm font-semibold`). Use one `name` per group.

### ColorSwatchGroup

- Colour chips: 36px circles with a hairline; selected = `ring-2 ring-primary ring-offset-2`; keyboard focus = 2px outline offset 4px. The chip colour comes from the caller (`color`) and is the only place a non-token colour appears; the component never hardcodes one.
- `group` renders sub-headings (`text-caption text-muted-foreground`). The caption under the chips shows the hovered/focused chip, else the selected one: name + price, or its `unavailableReason`.
- Unavailable chips get a diagonal strike (not colour alone), stay enabled with `aria-disabled`, and expose the reason via `aria-describedby`.

### PackageRow

- Checkbox row built like OptionRow (native checkbox `sr-only`, decorative box with a check mark, `ring-1 ring-primary` when checked). `items` adds a Radix Accordion trigger ("구성 보기") that expands the included list; the trigger's accessible name includes the package label.
- `includedIn` marks an item that is already checked because another package includes it (muted surface + small tag). It does not disable the checkbox; callers show a confirmation before unpacking the package.
- Chevron rotation is the only animation and is off under reduced motion.

### Stepper

- Compound: `Stepper` (`nav` + numbered `ol`, needs `aria-label`) and `StepperItem` (`li` + link). `Stepper value` equal to an item's `value` marks the current step with `aria-current="step"`. Links via `href` or `asChild` (Next `Link`); all steps are reachable in any order.
- Item: 44px min height, `rounded-md`, no border. Current = a 2px `bg-primary` underline (`layoutId` glider), `text-foreground`, semibold, filled `bg-primary` number badge. Completed (`completed`) = check mark badge on `bg-muted` plus visually hidden "(완료)".
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
- **Applied**: selection pop on Radio/OptionRow/PackageRow/ColorSwatchGroup (`animate-select-pop`, 0.32s) and a direct shrink on clear (1 → 0.6 and fade, no overshoot, `animate-select-out`, 0.2s, drawn by a ghost copy of the checked look), both driven by `useCheckPhase` (`./lib/check-phase`, registry item `check-phase`) so nothing moves on first paint; works controlled or uncontrolled (uncontrolled radios hear the group through document `change` events). Standalone `Radio` and `Checkbox` are childless `<input>`s, so their clear ghost is drawn on `::before` (and the checkbox tick on `::after`) with the same `animate-select-out`; the input's own `box-shadow`/`border` are never animated because a held animation would override the focus ring and invalid styling, Stepper active border glides between steps (`layoutId`, `SPRING.snappy`), Reveal entrance, Button press uses `SPRING.snappy`.
- **Rules**: motion marks a state change (select, enter, move, load); no ambient or cursor-following decoration. Move `opacity`/`transform` only. One big flourish per screen. Honour reduced motion live (`useReducedMotion`; CSS gets `motion-reduce:animate-none`). Never Motion + Tailwind `transition-*` on one node, never Motion on a WebGL canvas, pause anything looping when off-screen. Hover scale, shadows and decorative gradients stay out.

### Checkbox

- Native `<input type="checkbox">` with `appearance-none`: 20px, `rounded-md`, `border-border`; checked = `border-primary` + `bg-primary` with a `::after` tick (`border-primary-foreground`, shape not colour). Focus `ring-2 ring-ring ring-offset-2`; invalid → destructive ring; disabled `bg-muted` (never opacity); forced-colors falls back to the native control. No `indeterminate` yet.
- Motion via `useCheckPhase`: checking pops (`animate-select-pop`, 0.32s); clearing shrinks a `::before` fill and the `::after` tick away (`animate-select-out`, 0.2s). Still on first paint and under reduced motion. Forced-colors hides the pseudo-elements (native control draws itself); a disabled checked tick uses the `background` colour for contrast.
- Pair with `Label htmlFor`; group with `fieldset` + `legend`.

### Sheet

- Same Radix dialog as `Dialog` (shared parts: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`); only `SheetContent` differs. `side` = `right | left | top | bottom` (summary on mobile = `bottom`, desktop slide-over = `right`). `bg-card`, `border-border` on the inner edge, no shadow; `rounded-t-lg`/`rounded-b-lg` only for bottom/top. Width `calc(100%-2rem)` up to `max-w-md`.
- Motion: slides in from its edge with opacity (`DURATION.base` + `EASE.outExpo`), out in `DURATION.fast`; none under reduced motion. The overlay is rendered by `SheetContent` (shared `DialogOverlay`). **`SheetTitle` is required.**

### ChangeDiff

- Semantic table: `caption` (sr-only), `scope="col"` headers (항목 / 이전 선택 / 변경 후), `scope="row"` item names. Added/removed/changed is a **text tag** under the item name (`rounded-full border-border bg-muted text-xs`), never colour alone; empty cell = `—` plus sr-only "없음".
- Surface `bg-card border-border rounded-lg`; header row `bg-muted text-muted-foreground`; optional summary row (`bg-muted`, tabular numbers). Prices are caller-formatted. Use inside a confirmation `Dialog`; nothing changes until confirmed.

### Notice

- Compound: `Notice`, `NoticeTitle`, `NoticeDescription`. `variant` `info` (`bg-muted border-border`, `role="status"`) or `error` (`border-2 border-destructive`, title `text-destructive`, body `text-foreground`, `role="alert"`). Role is overridable. In-flow content that stays; transient messages are `Toast`.

### Toast

- `ToastProvider` + `useToast().toast({ title, description?, variant?, duration?, action? })`. Announcing is done by two always-mounted sr-only live regions (`role="status"` polite, `role="alert"` for `variant="error"`, prefixed "오류: "); the visible cards are plain list items inside a fixed `role="region"` (label + hotkey) and are for keyboard reach, not reading. Card: `bg-card border-border rounded-lg`, error `border-2 border-destructive`; no shadow; focus ring on the card.
- F8 (configurable, ignores repeat/modifiers) focuses the oldest card and does nothing when empty; focus returns to where it was when the card is dismissed. Auto-dismiss 5000ms for plain toasts (hover / focus-within / hidden window each hold the timer; the remaining time resumes only when none hold it); toasts with an `action` or `variant="error"` stay until dismissed. Esc on a focused card dismisses; the close button always exists. Never use inside a modal (the rest of the page is inert while a Dialog/Sheet is open). Enter/exit via Motion (`DURATION.base` up from 16px, `DURATION.fast` out); none under reduced motion.

### PriceBar

- Compound: `PriceBar` (`role="region"`, label "견적 요약", `fixed` pins to the bottom with safe-area padding), `PriceBarTotal` (label + `AnimatedAmount`; the visible number is `aria-hidden`, a `role="status"` sr-only line announces "label amount" 500ms after the amount stops changing and stays silent on first render), `PriceBarActions`, `PriceBreakdown` (`dl`; `role="group"` only when it has a `title`), `PriceRow` (number → `1,000,000원`, `signed` adds `+`/`−`, `total` row has a top hairline, `action` slot). `bg-background border-t border-border`, no shadow. Count-up comes from `AnimatedAmount` (NumberFlow honours `prefers-reduced-motion`); no extra motion. Row links need a non-colour cue (underline) and their own `aria-label`; use distinct `aria-label`s when several bars exist and place a `fixed` bar last in the DOM.

### DataTable

- Generic `DataTable<Row>` with `columns` (`key`, `header`, `cell?`, `numeric?`, `rowHeader?`), `rows`, `getRowKey`, optional `footer`. `caption` is required (`captionHidden` makes it sr-only; the table then also gets `aria-labelledby`). `th scope="col"` / `scope="row"`; numeric columns are right-aligned, `tabular-nums` and never wrap; text cells wrap. The wrapper is a focusable `role="region"` (`tabIndex=0`, named by the caption) that scrolls horizontally when the table overflows (WCAG 1.4.10 data-table exception). A footer cell for a `rowHeader` column without a value renders as `td`. `bg-card border-border rounded-lg`, header `bg-muted`.

### Skeleton

- Compound: `Skeleton` (`bg-muted rounded-md`, `aria-hidden`, `motion-safe:animate-pulse`, paused off-screen via `useInView`; size and shape come from `className`) and `SkeletonGroup` (plain wrapper with an sr-only `label`; no `role="status"`/`aria-busy`, which suppress announcements in some screen readers; announce completion from an always-mounted status line owned by the consumer). Loading placeholder only; use `Progress` when the amount done is known.

### Progress

- `Progress` (`role="progressbar"`, `aria-valuemin/max/now/valuetext`, name from required `label` via `aria-labelledby`, `labelHidden` makes it sr-only). Value text defaults to a percentage and can be replaced by `valueText`; the visible text is `aria-hidden` because `aria-valuetext` carries it. Track `bg-muted` with an inset `border` ring (so its extent is visible), fill `bg-primary` (`primary-on-dark` in dark, ≥3:1 on the track; `Highlight`/`ButtonText` in forced colors) moved with `transform` only (`duration-450` ≈ `DURATION.slow`, `--ease-out-expo`, none under reduced motion). The default percent text is an `AnimatedAmount` (suffix `%`) so the number rolls with the bar; a custom `valueText` is plain text.

### CopyButton

- `CopyButton` wraps `Button` (default `secondary`, `medium`). `value`, `label` / `copiedLabel` / `failedLabel`, `resetDelay` (2000ms), `onCopy`, `onCopyError`. All labels are stacked in one grid cell so the width never changes; always-mounted sr-only regions announce the result: `role="status"` for success and `role="alert"` for failure, re-rendered with a counter key so repeats are read again. `aria-label` is not accepted (it would freeze the state label); the regions are siblings, so avoid `space-*`/`divide-*`/`:last-child` styled groups. Falls back to the failed label when `navigator.clipboard` is unavailable.

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
