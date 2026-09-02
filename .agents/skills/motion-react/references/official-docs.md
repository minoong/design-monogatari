# Motion official documentation

Motion (formerly Framer Motion) maintains public docs at **https://motion.dev/docs**.

## LLM index

**https://motion.dev/llms.txt**

Markdown index of all documentation pages (React, JavaScript, Motion+, tutorials). Use it to locate the correct page before implementing.

Workflow:

1. Fetch `https://motion.dev/llms.txt`
2. Search for keywords (e.g. `AnimatePresence`, `layoutId`, `useScroll`)
3. `WebFetch` the matching `https://motion.dev/docs/...` URL
4. Implement using the official API — this skill's local references are summaries only

## Primary entry points

- React get started: https://motion.dev/docs/react
- React installation: https://motion.dev/docs/react-installation
- JavaScript quick start: https://motion.dev/docs/quick-start
- GSAP vs Motion: https://motion.dev/docs/gsap-vs-motion
- Performance: https://motion.dev/docs/performance

## When to fetch live docs

Fetch when:

- Using an API not covered in this skill's `references/*.md`
- Upgrading Motion versions (`react-upgrade-guide`)
- Motion+ components (AnimateNumber, Carousel, Ticker, etc.)
- Edge cases (AnimatePresence modes, layoutScroll, RSC imports)

Local `references/` files in this skill are vendored summaries. Prefer live docs when behavior is unclear.

## Package naming

- npm package: `motion` (not `framer-motion` for new work)
- React import: `"motion/react"`
- Next.js App Router: `"motion/react-client"` in client components
