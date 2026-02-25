## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npx shadcn@latest add <component>` — Add shadcn/ui component

## Tech Stack

- Next.js 16 (App Router) / React 19 / TypeScript 5
- Tailwind CSS 4 with CSS custom properties (design tokens in `src/app/globals.css`)
- shadcn/ui (New York style) + Radix UI + Lucide icons
- Supabase (auth, database, storage, edge functions)

## Architecture

```
src/
├── app/(app)/       # Protected routes: dashboard, nieuw, advertentie/[id]
├── app/(auth)/      # Public routes: login, registreren
├── components/ui/   # shadcn/ui primitives
├── components/      # Domain components (layout, dashboard, editor, upload)
├── hooks/           # Custom hooks (use-generate, use-properties)
└── lib/             # Types, utils, Supabase client
```

- Path alias: `@/*` → `./src/*`
- Route groups `(app)` and `(auth)` provide separate layouts
- All pages are `"use client"` — no server components yet

## Code Style

- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Design tokens via CSS variables: `var(--brand)`, `var(--ink)`, `var(--surface)`, etc.
- Components: one per file, named exports, colocate types

## Gotchas

- UI is entirely in **Dutch** (routes, labels, form fields)
- Platform previews (Funda, Pararius, Jaap) each have distinct styling
- Image paths reference `/images/property-*.jpg` but no actual images exist in `/public`
- No tests or test framework installed

## Linear

Workspace: serointech
Team: BrokerApp

### Project Statuses

- Planned
- Backlog
- In Progress
- Completed
- Paused
- Canceled

### Priorities

1. Urgent
2. High
3. Medium
4. Low

### Labels

- Feature
- Improvement
- Bug
- Frontend
- Backend
- Database


### Supabase
Project URL: https://sxifsobstprwrsvgjndv.supabase.co