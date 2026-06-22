# micromodels

Perspectives on AI/ML from the trenches. Built with [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com), deployed on [Cloudflare Pages](https://pages.cloudflare.com).

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server at localhost:4321
npm run build      # build static site to dist/
npm run preview    # preview production build locally
```

## Deployment

1. Push this repo to GitHub.
2. In Cloudflare Dashboard → Pages → Connect to Git → select repo.
3. Build command: `npm run build`
4. Build output: `dist`
5. Node version: 20 (set via `NODE_VERSION=20` env var or `.nvmrc`)

## Privacy

- Zero JavaScript shipped to the browser.
- No analytics, no trackers, no third-party requests.
- No CDN-hosted fonts or dependencies.
- KaTeX CSS is self-hosted through npm.

## Content

Content lives in `src/content/`:
- `blog/` — Long-form posts (Markdown)
- `news/` — Short notes on papers and releases (Markdown)

Frontmatter schemas are defined in `src/content.config.ts`.
