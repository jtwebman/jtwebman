# Claude Development Guidelines

Personal site for jtwebman.com — an Astro static site deployed on Netlify.

## Stack

- Astro 6, static SSG (no adapter), TypeScript
- Tailwind CSS v4
- Netlify hosting; the contact form uses Netlify Forms
- Node 24 (pinned in `.nvmrc`, `netlify.toml`, and `package.json` `engines`)

## Commands

- `npm run dev` — dev server
- `npm run pre-commit` — must pass before committing: runs `astro check`, ESLint, Prettier check, and `astro build`

## Conventions

- **Dependencies are pinned to exact versions (no `^`).** `overrides` pins `vite` and `yaml` so transitive copies stay aligned with Astro — don't loosen these to ranges without re-running the build.
- Site-wide values (author, social, nav) live in `src/config/site.ts`. Use it instead of hard-coding.
- Projects are data-driven: edit `src/data/projects.ts`; the `/projects` index and `/projects/[slug]` pages render from it automatically.
- Shared helpers: theme toggle in `src/utils/theme.ts`, SEO structured data in `src/utils/structured-data.ts` (pass the result to `BaseLayout` via `structuredData`).
- The contact form (`src/components/ContactForm.astro`) depends on Netlify Forms (`data-netlify`, honeypot, `action` → contact-success).
