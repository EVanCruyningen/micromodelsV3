# micromodels — Implementation Plan

**Source design:** `~/micromodels/openDesign/micromodels-preview.html` (single-file static prototype)
**Stack target:** Astro + Astro Content Collections + Tailwind CSS v4 + Cloudflare Pages adapter
**Goal:** Convert the OpenDesign prototype into a buildable, deployable, content-managed static site with zero JS shipped, full privacy, and Cloudflare Pages hosting.
**Status:** Not started. `~/micromodels/` has only `openDesign/` — fresh project. No git repo yet.

---

## 0. Operator decision — resolve before Task 1

- [ ] **Confirm GitHub username.** Prototype hardcodes `EVanCruyningen`. Verify this is correct before wiring into layouts/footer/canonical links.
- [ ] **Confirm real name** for the byline (currently `[your name]` placeholder).
- [ ] **Confirm domain.** Site is for Cloudflare Pages. Do we have a custom domain picked yet (e.g. `micromodels.dev`)? If not, defer to a Task 7 sub-step.
- [ ] **Initialize git repo** in `~/micromodels/` before starting work — this gives a clean commit history of the build.

---

## 1. Project scaffold (Astro + Tailwind + Cloudflare adapter)

**Why first:** Every other task depends on the project existing and building cleanly.

1. `cd ~/micromodels`
2. Initialize Astro project at the **root** of `~/micromodels/` — not in a subfolder. Astro CLI: `npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict`. Move `openDesign/` aside first or place it under `openDesign/` (already there) so the scaffold doesn't sweep it up.
3. Add Tailwind v4: `npx astro add tailwind` (uses `@tailwindcss/vite` plugin — Tailwind v4 uses CSS-only config, no `tailwind.config.js` needed).
4. Add Cloudflare adapter: `npx astro add cloudflare` — this installs `@astrojs/cloudflare` and updates `astro.config.mjs`. **Set `output: 'static'`** explicitly — Cloudflare adapter can also do SSR, but we want 100% static output.
5. Verify dev server: `npm run dev` → `http://localhost:4321` returns 200.
6. Verify build: `npm run build` → `dist/` is produced.

**Deliverables:**
- `astro.config.mjs` configured with Cloudflare adapter + static output
- `package.json` with `dev`, `build`, `preview` scripts
- `tsconfig.json` (strict mode)
- Tailwind wired via `@import "tailwindcss";` in `src/styles/global.css`

**Pitfalls:**
- Astro CLI may prompt interactively — pass `--yes` or pipe `echo` answers; do NOT let it run `npm install` twice.
- `astro add cloudflare` may try to switch to SSR mode; override in config after install.
- Tailwind v4 has no `tailwind.config.js` — config goes in CSS. Don't waste time looking for it.

---

## 2. Port design tokens to Tailwind v4 + CSS custom properties

**Why second:** Every component needs the token system before styling.

Extract tokens from `micromodels-preview.html` (lines 10–25) into `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #FCF4DC;
  --color-surface: #FCF4DC;
  --color-fg: #1A1A1A;
  --color-muted: #5A5040;
  --color-border: #E4D9B8;
  --color-accent: #8B5A2B;
  --color-code-bg: #F5EBC8;

  --font-display: Charter, "Iowan Old Style", "Source Serif Pro", Georgia, serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --container-content: 720px;
}
```

**Source mapping from preview:**
- `--bg`, `--surface` → `#FCF4DC` (cream)
- `--fg` → `#1A1A1A` (near-black)
- `--muted` → `#5A5040` (warm dark brown)
- `--border`, `--rule` → `#E4D9B8` (border / divider)
- `--accent` → `#8B5A2B` (rust, hover/links only)
- Code block bg → `#F5EBC8` (line 222)

**Add base layer styles** in the same file:
- `body { background: var(--color-bg); color: var(--color-fg); font-family: var(--font-body); }`
- `h1-h4 { font-family: var(--font-display); }`
- Link styles: underlined by default, accent on hover/focus-visible (matches lines 37–44).
- `* { box-sizing: border-box; margin: 0; padding: 0; }` reset (line 26).

**Add dark sepia stub** (V2 prep — match line 9 of preview's intent):
```css
@media (prefers-color-scheme: dark) {
  /* TODO V2: dark sepia tokens */
}
```
Comment this out for V1; just leave the structure so the V2 swap is trivial.

**Deliverable:** `src/styles/global.css` complete; tokens are referenced by utility classes via Tailwind v4's `@theme` mechanism.

---

## 3. Astro Content Collections schema

**Why:** Type-safe frontmatter for blog/news. This is the source of truth for content; without it we lose the type safety called out in the OpenDesign prompt review.

`src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    relatedNews: z.array(z.string()).default([]),  // slugs
  }),
});

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    sourceUrl: z.string().url(),
    sourceLabel: z.string(),  // e.g. "arxiv.org/abs/2601.12345"
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, news };
```

**Deliverable:** Schema in place; build will fail until collections exist, so this unblocks Task 5.

**Pitfalls:**
- Astro 5+ uses `glob()` loader for content collections. If on Astro 5, the syntax above may need adjustment to `loader: glob({ pattern: '**/*.md', base: './src/content/blog' })`. Check the Astro version after scaffold.

---

## 4. Port content from prototype to markdown files

**Why:** Content is what makes the site real. Place under `src/content/`.

### News entries (`src/content/news/`)
Five files matching the prototype (lines 367–390 / 442–493):

1. `scaling-laws-revisited.md` — `date: 2026-01-22`, `sourceUrl: https://arxiv.org/abs/2601.12345`, `tags: [scaling-laws, inference]`
2. `anthropic-constitution.md` — `date: 2026-01-18`, `sourceUrl: https://www.anthropic.com/news/constitution`, `tags: [agents, safety]`
3. `openai-structured-outputs.md` — `date: 2026-01-12`, `sourceUrl: https://openai.com/index/structured`, `tags: [tool-use, infrastructure]`
4. `mech-interp-survey.md` — `date: 2026-01-05`, `sourceUrl: https://arxiv.org/abs/2601.00042`, `tags: [interpretability, survey]`
5. `rag-retrospective.md` — `date: 2025-12-28`, `sourceUrl: https://www.anthropic.com/news/rag-retrospective`, `tags: [retrieval, evals]`

Each `body` should contain the author's take (~3–4 paragraphs of substantive content — the prototype has the Scaling Laws take at lines 535–541 as a model).

### Blog posts (`src/content/blog/`)
Three files matching the prototype (lines 395–408 / 579–610):

1. `tiny-moe-from-scratch.md` — `date: 2026-01-20`, `series: small-models`, `tags: [architecture, training, small-models]`, `description: <from line 641>`
2. `eval-set-lying-1.md` — `date: 2026-01-08`, `tags: [evals, methodology]`
3. `small-model-finetuning.md` — `date: 2025-12-30`, `series: small-models`, `tags: [fine-tuning, small-models]`

Body content for these should be substantive markdown — minimum 800–1500 words each. The prototype only shows the opening paragraph of the MoE post; the developer needs to expand or accept that the dev cycle will include writing real content.

**Pitfalls:**
- Date must be ISO format (`2026-01-22`) or `z.date()` will fail typecheck.
- `sourceUrl` must include `https://` — the prototype uses bare domains in display, but Astro/TypeScript wants full URLs.
- Slugs are auto-derived from filename; if you want `scaling-laws-revisited` you name the file exactly that.

---

## 5. Layouts and shared components

**Why:** Every page reuses these. Build them once.

### `src/layouts/BaseLayout.astro`
Wraps every page with: skip-link, `<Header>`, `<slot />` for page content, `<Footer>`. Sets `<html lang="en">`, viewport meta, title (passed as prop), meta description. Pulls in `src/styles/global.css`.

### `src/components/Nav.astro`
- Site title (left): "micromodels" — text-only, links to `/`
- Nav links (right): Home / News / Blog / GitHub ↗
- Receives `currentPath` prop to set `aria-current="page"` correctly (this was prototype line 99 — does NOT span hardcoded per-page state).
- Border-bottom: 1px `var(--color-border)`
- GitHub link: `https://github.com/EVanCruyningen` (confirm Task 0), `target="_blank" rel="noopener noreferrer"`

### `src/components/Footer.astro`
- Border-top 1px `var(--color-border)`
- Three items: `© 2026 micromodels` · GitHub link · RSS link (`/rss.xml`)
- Monospace font, muted color, 13px

### `src/components/PostCard.astro`
Used on home + index pages. Takes `title`, `href`, `meta`, `excerpt` props. Renders the `.entry` block from preview lines 154–180.

### `src/components/NewsCard.astro`
News index variant. Takes `title`, `href`, `date`, `sourceLabel`, `tags`. Renders the `<article>` block from preview lines 440–449.

### `src/components/TagChip.astro`
Tag pill — `.chip` class from preview lines 257–268.

### `src/components/EntryList.astro` (optional)
Helper to render an array of entries — used by home + index pages. Pure Astro template, no JS.

**Pitfalls:**
- Use Astro's `Astro.props` pattern — no React/Vue needed.
- Do NOT include any `<script>` tags unless absolutely required (zero-JS requirement).
- The "viewer bar" at the top of the prototype (lines 330–341) is **preview chrome only** — drop it entirely in production.

---

## 6. Pages — routes

### `src/pages/index.astro` — Homepage
- Import `getCollection` from `astro:content`
- Fetch blog + news, sort by date desc, slice top 5 each
- Render two `<section>` blocks: "Latest News" + "Latest Blog Posts" using `<PostCard>`
- Intro block matches preview lines 358–362 (with real byline from Task 0)
- Section headers use `.section-head` style (preview lines 142–151) — uppercase, mono, letter-spaced, muted, border-bottom

### `src/pages/news/index.astro` — News index
- Fetch all `news` collection, sort by date desc
- Map to `<NewsCard>`

### `src/pages/news/[...slug].astro` — News permalink
- `getStaticPaths()` returns one path per news entry
- Render: title, date, "Source →" link (`.source-link`, preview line 289), chips, then the markdown body via `<Content />`
- Bottom: "← All news" link back to `/news`

### `src/pages/blog/index.astro` — Blog index
- Fetch all `blog` collection, sort by date desc
- For posts in a series, show "Part of the X series" line (preview line 586)
- Render date, reading time, chips

### `src/pages/blog/[...slug].astro` — Blog post
- `getStaticPaths()` returns one path per blog entry
- Header: date · reading time · series link (if any) · title · description · chips
- Body via `<Content />` rendered inside `.prose` container
- Bottom: "Related News" list — iterate `relatedNews` slugs, fetch entries, render as link list (preview lines 644–646)
- Computed reading time: `content.split(/\s+/).length / 200` minutes (round up). Better: use `reading-time` npm package or write a tiny util.

### `src/pages/blog/series/[series].astro` — Series index
- `getStaticPaths()` returns one path per unique `series` value
- Filter blog entries by series, render list

### `src/pages/blog/tags/[tag].astro` — Tag index (blog)
- Same pattern as series, filtered by `tags.includes(tag)`

### `src/pages/tags/index.astro` — Tags overview
- Aggregate all tags from blog + news, count occurrences
- Render `<ul class="tag-list">` matching preview lines 271–286
- Each row: tag name (link) + count

### `src/pages/rss.xml.ts` — RSS feed
- Use `@astrojs/rss` package: `npm install @astrojs/rss`
- Combine blog + news into a single feed, sorted by date desc
- Title: "micromodels", description: site intro, site: `https://<domain>` (placeholder until domain picked)

### `src/pages/404.astro` — Not found
- Minimal: "Not found. ← Back home"

**Pitfalls:**
- `[...slug].astro` (rest catch-all) is correct vs `[slug].astro` if any entries have nested paths. The schema doesn't need nested paths, but `[slug]` will work fine too.
- The prototype's preview-mode URLs are all `#anchor` — they are NOT real routes. Make sure the dev doesn't waste time converting them.

---

## 7. Syntax highlighting + math (build-time only, zero JS)

### Shiki (syntax highlighting)
- Astro has Shiki built in for markdown code blocks. Enable in `astro.config.mjs`:
  ```js
  markdown: {
    shikiConfig: {
      theme: 'css-variables',  // adapt to cream theme
      wrap: true,
    },
  }
  ```
- The prototype's `.tok-*` classes (lines 236–240) are vestigial — Shiki outputs its own classes. The dev can keep the prototype's CSS block unused, or delete it.
- Verify code blocks render correctly on a blog post page after Task 6.

### KaTeX (math)
- Install `remark-math` + `rehype-katex`:
  ```
  npm install remark-math rehype-katex
  ```
- Wire into Astro markdown config:
  ```js
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  }
  ```
- KaTeX CSS must be inlined or self-hosted — do NOT use the CDN (`https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css`). Self-host via `npm` and import in `global.css`:
  ```css
  @import 'katex/dist/katex.css';
  ```
- The privacy rule (no third-party requests) makes the CDN a hard fail. This is easy to miss.

**Pitfalls:**
- The prototype's `.math-inline` / `.math-display` CSS (lines 244–253) is irrelevant once KaTeX renders; KaTeX owns its classes.

---

## 8. Sitemap + SEO meta

### Sitemap
- Install `@astrojs/sitemap`: `npm install @astrojs/sitemap`
- Wire into `astro.config.mjs`:
  ```js
  sitemap: { changefreq: 'weekly', priority: 0.7 }
  ```
- Verify `/sitemap-index.xml` is generated after build.

### SEO meta
- Add to `BaseLayout.astro`:
  - `<title>{title} · micromodels</title>` (or just `micromodels` on home)
  - `<meta name="description" content={description} />`
  - `<link rel="canonical" href={`https://${site}${Astro.url.pathname}`} />`
  - `<link rel="alternate" type="application/rss+xml" title="micromodels" href="/rss.xml" />`
  - `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:type" content="article">` on post pages

**Pitfalls:**
- `site` must be set in `astro.config.mjs` (under `site:` top-level) for canonical/og URLs to resolve. Use a placeholder until domain picked.

---

## 9. Cloudflare Pages deployment

### Pre-deploy
- Push the repo to GitHub.
- Cloudflare dashboard → Pages → "Connect to Git" → select repo.
- Build settings:
  - **Build command:** `npm run build`
  - **Build output directory:** `dist`
  - **Environment variables:** none required for V1
  - **Node version:** 20 (set via `NODE_VERSION=20` env var or `.nvmrc` file)

### Post-deploy
- Test `https://<project>.pages.dev` — all pages render, no horizontal scroll on mobile (check at 360×800 per OpenDesign manifest).
- Verify `/rss.xml` and `/sitemap-index.xml` return 200.
- Lighthouse: target 100/100/100/100 (performance/accessibility/best-practices/SEO).

### Custom domain (when picked — see Task 0)
- Cloudflare Pages → Custom domains → add domain.
- Update `site` in `astro.config.mjs` to match.
- DNS: Cloudflare auto-detects if domain is on Cloudflare; otherwise CNAME setup.

**Pitfalls:**
- Cloudflare adapter adds a `_worker.js` for SSR. For static output, this is optional and can be skipped — verify `astro.config.mjs` has `output: 'static'` so no worker is shipped.
- Cloudflare Pages uses Workers-style env vars, not `.env` files — `.env` will not be loaded in build.

---

## 10. Responsive QA (per OpenDesign viewport contract)

Per the manifest (lines 95–159), validate at:
- 360×800 (mobile-compact)
- 390×844 (mobile-standard)
- 820×1180 (tablet-portrait)
- 1366×768 (laptop)
- 1920×1080 (wide)

**Test on every page (home, news index, news permalink, blog index, blog post, tags):**
- No horizontal scroll
- Nav does not overflow (may wrap — that's fine per spec)
- Footer wraps cleanly
- Long code blocks scroll horizontally inside `.prose pre` (not the page)

DevTools device emulation is sufficient; no need for real devices in V1.

---

## 11. Accessibility audit (V1 acceptance gate)

Per OpenDesign contract (lines 36–40) and original prompt:
- [ ] Skip link works (Tab → Enter jumps to `#main`)
- [ ] Color contrast: `#1A1A1A` on `#FCF4DC` is 16.5:1 (passes AAA)
- [ ] All interactive elements have visible `:focus-visible` rings (preview line 44)
- [ ] `aria-current="page"` set correctly by `<Nav>` per page
- [ ] Heading hierarchy: one `<h1>` per page, no skipped levels
- [ ] `lang="en"` set
- [ ] Keyboard-only navigation works end-to-end (Tab through nav → page content → footer → RSS link)
- [ ] Lighthouse accessibility score = 100

---

## 12. Cleanup + handoff

- [ ] Delete `~/micromodels/openDesign/Project-Micromodels-Personal-Portfolio-Blog-News/` (duplicate — keep only the top-level `openDesign/` as the design source-of-truth, or move under `docs/`).
- [ ] Remove all `<style>` and "viewer bar" HTML from any reference copy left in the repo.
- [ ] Write `README.md` at repo root:
  - Project description
  - `npm install` / `npm run dev` / `npm run build`
  - Cloudflare Pages deploy steps
  - Privacy statement (no analytics, no trackers, no CDN fonts)
- [ ] `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.env*`
- [ ] Add a placeholder header `<div>` in `Nav.astro` for the future logo (per prompt: "placeholder area can be left in the header for a future logo").
- [ ] Replace `[your name]` placeholder in homepage byline with real name.

---

## Open questions for the dev

1. **Astro version** — Astro 4 or Astro 5? The content collection API differs. Run `npx astro --version` after scaffold.
2. **Tailwind v4 vs v3** — OpenDesign prompt said v4 explicitly; verify the `astro add tailwind` install actually pulls v4 (it should as of late 2024).
3. **Reading time** — manual field in frontmatter vs computed? Computed is more honest; manual is simpler.
4. **Logo placeholder** — text-only header for now is acceptable, or do we want a CSS rectangle placeholder div sized for a future SVG swap?

---

## Estimated effort

| Task | Estimate |
|------|----------|
| 1. Scaffold | 30 min |
| 2. Tokens | 30 min |
| 3. Schema | 20 min |
| 4. Content port | 1 hr (markdown writing) |
| 5. Layouts/components | 2 hr |
| 6. Pages | 2–3 hr |
| 7. Shiki + KaTeX | 1 hr |
| 8. Sitemap + SEO | 30 min |
| 9. Deploy | 30 min |
| 10. Responsive QA | 30 min |
| 11. A11y audit | 30 min |
| 12. Cleanup | 30 min |
| **Total** | **~10–12 hours** |

---

## Risks

- **Tailwind v4 + `@theme` directive** is recent — if the dev encounters unexpected behavior, the fallback is to use raw CSS variables in `global.css` and skip Tailwind entirely. The prototype uses ~30 CSS classes; plain CSS is feasible.
- **Cloudflare adapter** can silently flip `output` to `server`. Triple-check after `astro add cloudflare`.
- **The viewer bar** in the prototype (lines 330–341) is a major red herring — it looks like nav but is preview-only chrome. Make sure the dev doesn't ship it.
- **GitHub username `EVanCruyningen`** is hardcoded in the prototype. Verify before Task 5.
- **Math rendering with KaTeX CSS imported locally** — easy to accidentally pull from CDN. Grep the final build output for any `cdn.jsdelivr.net` or `fonts.googleapis.com` requests.