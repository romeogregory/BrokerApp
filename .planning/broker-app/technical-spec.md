# Technical Spec: BrokerApp — AI-Powered Property Ad Generator

## 1. Initiative Summary

**What:** A SaaS frontend application for Dutch real estate brokers that transforms property photos into publish-ready advertisements using AI. Brokers upload property images, fill in basic details, and the app generates a complete advert (title, description, features list, property details) tailored to platforms like Funda, Pararius, and Jaap.

**Why:** Brokers spend significant time manually writing property listings after photographing properties. This tool automates the copywriting, letting brokers focus on clients and viewings.

**Who:** Dutch real estate brokers (makelaars) who photograph properties and need to publish listings on platforms like Funda.

**End state:** A fully functional frontend with mock data that demonstrates the complete user flow: authenticate → view dashboard → upload photos & property details → generate AI advert → review/edit in platform-specific preview → export.

**Scope:** Frontend only. No backend, no database, no real API calls. All data is mocked. AI generation is simulated with realistic delays and pre-written Dutch property descriptions.

---

## 2. Architecture Overview

**Framework:** Next.js 15 with App Router
**Language:** TypeScript
**Styling:** Tailwind CSS 4 + shadcn/ui components
**UI Language:** Dutch
**Package Manager:** npm (or pnpm)

### Directory Structure (planned)
```
brokerapp/
├── .interface-design/
│   └── system.md                    # Design system tokens and patterns
├── public/
│   └── mock-images/                 # Sample property photos for mock data
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with sidebar navigation
│   │   ├── page.tsx                 # Redirect to /dashboard
│   │   ├── globals.css              # Tailwind + design tokens
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page
│   │   │   └── registreren/
│   │   │       └── page.tsx         # Registration page
│   │   └── (app)/
│   │       ├── layout.tsx           # App shell with sidebar
│   │       ├── dashboard/
│   │       │   └── page.tsx         # Rich dashboard
│   │       ├── nieuw/
│   │       │   └── page.tsx         # Upload & generate page
│   │       └── advertentie/
│   │           └── [id]/
│   │               └── page.tsx     # Advert editor with platform preview
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── sidebar.tsx          # Navigation sidebar
│   │   │   └── header.tsx           # Page header with breadcrumbs
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx        # Stat card component
│   │   │   ├── property-card.tsx    # Photo-forward property card
│   │   │   └── activity-feed.tsx    # Recent activity list
│   │   ├── upload/
│   │   │   ├── image-gallery.tsx    # Drag-drop image upload gallery
│   │   │   ├── property-form.tsx    # Property details form
│   │   │   └── generate-button.tsx  # Generate CTA with loading state
│   │   └── editor/
│   │       ├── advert-editor.tsx    # Left-side editable content
│   │       ├── platform-preview.tsx # Right-side platform preview (signature)
│   │       ├── platform-tabs.tsx    # Funda/Pararius/Jaap tab switcher
│   │       └── export-actions.tsx   # Export/copy/download actions
│   ├── lib/
│   │   ├── mock-data.ts            # Mock properties, adverts, stats
│   │   ├── mock-ai.ts              # Simulated AI generation with delays
│   │   └── types.ts                # TypeScript type definitions
│   └── hooks/
│       ├── use-properties.ts       # Hook for mock property data
│       └── use-generate.ts         # Hook for simulated AI generation
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

### Route Groups
- `(auth)` — Login and registration pages, no sidebar, centered layout
- `(app)` — Authenticated pages with sidebar navigation

---

## 3. Relevant Existing Code

**Greenfield project.** No existing code to reference.

### 3a. Patterns to Establish
- App Router route groups for auth vs app layouts
- shadcn/ui component installation and customization with design tokens
- Mock data service layer (importable functions that return typed data)
- Client components with `"use client"` for interactive features (upload, editor)
- Server components by default for static layouts

### 3b. Reusable Utilities to Create
- `lib/mock-data.ts` — Centralized mock data with typed property/advert objects
- `lib/mock-ai.ts` — Simulated generation function with configurable delay
- `lib/types.ts` — Shared TypeScript interfaces (Property, Advert, Platform, etc.)
- `hooks/use-properties.ts` — React hook for property CRUD operations (in-memory state)
- `hooks/use-generate.ts` — React hook wrapping mock AI generation with loading state

### 3c. Naming Conventions
- **Files:** kebab-case (`property-card.tsx`, `mock-data.ts`)
- **Components:** PascalCase (`PropertyCard`, `PlatformPreview`)
- **Routes:** Dutch slugs (`/dashboard`, `/nieuw`, `/advertentie/[id]`)
- **UI text:** Dutch language throughout

### 3d. Design System & Tokens
Design system established at `.interface-design/system.md`. Resolvers MUST read it before implementing any UI and apply its tokens (colors, typography, spacing, shadows, component patterns).

Key tokens:
- Brand: Terracotta `#D97756` (warm, vibrant, Dutch brick-inspired)
- Canvas: `#FAF9F7` (warm paper)
- Typography: Plus Jakarta Sans
- Depth: Subtle shadows with warm undertones
- Radius: 6px (sm), 10px (md), 16px (lg)

---

## 4. Files to Create

### 4a. Project Setup Files

| File | Purpose | Notes |
|------|---------|-------|
| `package.json` | Dependencies | Next.js 15, React 19, Tailwind CSS 4, shadcn/ui |
| `next.config.ts` | Next.js config | Default App Router config |
| `tsconfig.json` | TypeScript config | Strict mode, path aliases (`@/`) |
| `tailwind.config.ts` | Tailwind config | Design tokens as CSS variables, Plus Jakarta Sans font |
| `src/app/globals.css` | Global styles | Tailwind imports + CSS custom properties from design system |
| `src/app/layout.tsx` | Root layout | HTML lang="nl", Plus Jakarta Sans font import, metadata |
| `src/app/page.tsx` | Root page | Redirect to `/dashboard` |

### 4b. Type Definitions & Mock Data

| File | Purpose | Notes |
|------|---------|-------|
| `src/lib/types.ts` | Shared types | `Property`, `Advert`, `Platform`, `PropertyStatus`, `PropertyDetails` |
| `src/lib/mock-data.ts` | Mock data | 6-8 sample properties with Dutch addresses, prices in EUR, realistic stats |
| `src/lib/mock-ai.ts` | AI simulation | Returns pre-written Dutch property descriptions after 2-3s delay |

### 4c. Auth Pages

| File | Purpose | Notes |
|------|---------|-------|
| `src/app/(auth)/layout.tsx` | Auth layout | Centered, no sidebar, brand mark |
| `src/app/(auth)/login/page.tsx` | Login | Email/password form + Google sign-in button (mocked) |
| `src/app/(auth)/registreren/page.tsx` | Register | Name, email, password, company name fields |

### 4d. App Shell & Navigation

| File | Purpose | Notes |
|------|---------|-------|
| `src/app/(app)/layout.tsx` | App layout | Sidebar + main content area |
| `src/components/layout/sidebar.tsx` | Sidebar nav | Logo, nav links (Dashboard, Nieuw, recent listings), user avatar |
| `src/components/layout/header.tsx` | Page header | Title, breadcrumbs, optional action buttons |

### 4e. Dashboard

| File | Purpose | Notes |
|------|---------|-------|
| `src/app/(app)/dashboard/page.tsx` | Dashboard page | Stats row + property grid + activity feed |
| `src/components/dashboard/stat-card.tsx` | Stat card | Large number, trend, label, icon with warm container |
| `src/components/dashboard/property-card.tsx` | Property card | Photo-forward: image 60%, status badge, address, price, stats |
| `src/components/dashboard/activity-feed.tsx` | Activity feed | Recent actions list (generated, edited, published) |
| `src/hooks/use-properties.ts` | Properties hook | Returns mock properties, filter by status |

### 4f. Upload & Generate

| File | Purpose | Notes |
|------|---------|-------|
| `src/app/(app)/nieuw/page.tsx` | Upload page | Image gallery + property form + generate button |
| `src/components/upload/image-gallery.tsx` | Image upload | Drag-drop zone, thumbnail grid, reorder, add-more slot |
| `src/components/upload/property-form.tsx` | Property form | Address, price, sqm, rooms, year built, energy label |
| `src/components/upload/generate-button.tsx` | Generate CTA | Large button with loading animation during simulated generation |
| `src/hooks/use-generate.ts` | Generation hook | Wraps mock-ai.ts, manages loading/result state |

### 4g. Advert Editor

| File | Purpose | Notes |
|------|---------|-------|
| `src/app/(app)/advertentie/[id]/page.tsx` | Editor page | Split view: editor + platform preview |
| `src/components/editor/advert-editor.tsx` | Editor panel | Editable title, description (textarea), features list, property details |
| `src/components/editor/platform-preview.tsx` | Preview panel | Renders advert in platform-specific styling (signature element) |
| `src/components/editor/platform-tabs.tsx` | Platform tabs | Funda / Pararius / Jaap tab switcher |
| `src/components/editor/export-actions.tsx` | Export actions | Copy to clipboard, download as text, platform-specific formatting |

---

## 5. Test Strategy

**For this initial frontend-only phase:** No automated tests. Focus is on building the UI and interaction patterns. Tests will be added when backend integration begins.

**Manual testing:** Each page should be verified for:
- Responsive layout (mobile, tablet, desktop)
- All interaction states (hover, focus, disabled, loading, empty)
- Dutch language correctness
- Design system consistency (tokens, spacing, shadows)

---

## 6. State Management Design

**Approach:** React state + context (no external state library needed for mock phase)

- **Auth state:** Simple boolean in context (mocked, always "logged in" in app routes)
- **Properties state:** In-memory array via `use-properties` hook, initialized from mock data
- **Generation state:** Loading/result state in `use-generate` hook
- **Editor state:** Local component state for editable fields, derived from mock advert data
- **Platform selection:** Local state in platform-tabs component

No persistence — all state resets on page refresh (acceptable for mock phase).

---

## 7. Dependencies

### Core
- `next` (15.x) — Framework
- `react` / `react-dom` (19.x) — UI library
- `typescript` (5.x) — Type safety

### Styling
- `tailwindcss` (4.x) — Utility-first CSS
- `@tailwindcss/postcss` — PostCSS plugin for Tailwind 4
- shadcn/ui components (installed via CLI) — Button, Input, Card, Tabs, Badge, Avatar, Textarea, Label, Separator

### Fonts
- `@fontsource-variable/plus-jakarta-sans` or Next.js `next/font/google` — Plus Jakarta Sans typeface

### Utilities
- `lucide-react` — Icon set (consistent, modern)
- `clsx` + `tailwind-merge` — Conditional class merging (via shadcn/ui's `cn` utility)

### No additional dependencies needed
Mock data eliminates need for: API clients, state management libraries, form libraries, image upload libraries. Keep the dependency footprint minimal.

---

## 8. Required Tools

- **Node.js** (20+) — Runtime
- **npm** or **pnpm** — Package manager
- **shadcn/ui CLI** — Component installation (`npx shadcn@latest init`, `npx shadcn@latest add`)

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Plus Jakarta Sans not available via next/font | Font fallback looks different | Use `@fontsource-variable/plus-jakarta-sans` as alternative |
| shadcn/ui v4 compatibility with Tailwind CSS 4 | Component styling breaks | Use latest shadcn/ui CLI which supports Tailwind 4 |
| Mock AI responses feel unrealistic | Poor demo experience | Write high-quality Dutch property descriptions as mock data |
| Platform preview accuracy | Funda/Pararius styling may not match | Approximate platform styling, not pixel-perfect — this is a preview, not an embed |

---

## 10. Out of Scope

- Backend API / database / authentication logic
- Real AI integration (OpenAI, Claude, etc.)
- Real image upload to cloud storage
- Real platform API integration (Funda API, etc.)
- Payment / subscription management
- Multi-language support (Dutch only for now)
- Automated testing (deferred to backend integration phase)
- Dark mode (future enhancement)
- Mobile native app

---

## 11. Implementation Tasks

### Task 1: Project Scaffolding & Design System Setup
**Size: M (5-7 files)**

Initialize the Next.js project, configure Tailwind CSS with design system tokens, install shadcn/ui, and set up the project structure.

**Deliverables:**
- Initialize Next.js 15 project with TypeScript and App Router
- Configure `tailwind.config.ts` with design tokens from `.interface-design/system.md`
- Set up `globals.css` with CSS custom properties (all color, spacing, shadow, radius tokens)
- Configure Plus Jakarta Sans font via `next/font/google`
- Install shadcn/ui and configure with custom theme colors matching design system
- Install required shadcn/ui components: Button, Input, Card, Tabs, Badge, Avatar, Textarea, Label, Separator
- Set up path aliases (`@/`) in `tsconfig.json`
- Create root `layout.tsx` with `lang="nl"`, font provider, metadata
- Create root `page.tsx` that redirects to `/dashboard`

**Dependencies:** None

**Acceptance criteria:**
- `npm run dev` starts without errors
- Design tokens are available as CSS variables and Tailwind classes
- Plus Jakarta Sans renders correctly
- shadcn/ui components render with custom theme
- Path aliases work (`@/components/...`, `@/lib/...`)

---

### Task 2: Type Definitions & Mock Data Layer
**Size: S (3 files)**

Create TypeScript types and mock data that powers the entire frontend.

**Deliverables:**
- `src/lib/types.ts` — Define interfaces:
  - `Property`: id, address (street, city, postalCode), price, squareMeters, rooms, bedrooms, bathrooms, yearBuilt, energyLabel, status (draft/generated/published), images (url[]), createdAt, updatedAt
  - `Advert`: id, propertyId, title, description, features (string[]), propertyDetails (structured), platform, createdAt
  - `Platform`: enum (funda, pararius, jaap)
  - `PropertyStatus`: enum (draft, generated, published)
  - `DashboardStats`: totalListings, generatedThisMonth, publishedThisMonth, averageGenerationTime
  - `ActivityItem`: id, type (generated/edited/published), propertyAddress, timestamp, platform
- `src/lib/mock-data.ts` — Create:
  - 6-8 mock properties with realistic Dutch addresses (Amsterdam, Utrecht, Rotterdam, Den Haag), EUR prices (€250.000-€850.000), varied statuses
  - Dashboard stats object
  - 10+ activity feed items with realistic timestamps
  - 2-3 pre-generated adverts with full Dutch descriptions
- `src/lib/mock-ai.ts` — Create:
  - `generateAdvert(property: Property): Promise<Advert>` — Returns a pre-written Dutch advert after a 2-3 second simulated delay
  - 3-4 varied Dutch advert templates that get selected based on property characteristics
  - Advert text should be realistic Funda-quality Dutch (professional, descriptive, highlighting features)

**Dependencies:** None

**Acceptance criteria:**
- All types compile without errors
- Mock data covers all property statuses (draft, generated, published)
- Mock AI function returns realistic Dutch adverts after configurable delay
- At least 3 distinct advert templates exist

---

### Task 3: Auth Pages (Login & Registration)
**Size: S (3 files)**

Build the authentication pages with the auth layout (centered, no sidebar).

**Deliverables:**
- `src/app/(auth)/layout.tsx` — Centered layout with warm canvas background, brand mark/logo centered above form
- `src/app/(auth)/login/page.tsx`:
  - Email input field + password input field
  - "Inloggen" (Login) primary button (brand terracotta)
  - "Inloggen met Google" button with Google icon
  - "Wachtwoord vergeten?" link (styled, non-functional)
  - "Nog geen account? Registreren" link to `/registreren`
  - Form submits → redirect to `/dashboard` (mocked, no validation)
- `src/app/(auth)/registreren/page.tsx`:
  - Name, email, password, company name fields
  - "Account aanmaken" primary button
  - "Al een account? Inloggen" link to `/login`
  - Form submits → redirect to `/dashboard` (mocked)
- All text in Dutch
- Apply design system: Plus Jakarta Sans, warm surfaces, terracotta brand accents, subtle shadows

**Dependencies:** Task 1 (project setup, shadcn/ui components)

**Acceptance criteria:**
- Both pages render correctly and match design system
- Forms redirect to `/dashboard` on submit
- Google sign-in button is present (non-functional)
- Responsive on mobile (form centered, full-width on small screens)
- Focus states use terracotta focus ring

---

### Task 4: App Shell — Sidebar Navigation & Page Header
**Size: S (3 files)**

Build the app shell that wraps all authenticated pages.

**Deliverables:**
- `src/app/(app)/layout.tsx` — Flexbox layout: sidebar (fixed width) + scrollable main content area
- `src/components/layout/sidebar.tsx`:
  - Same `--canvas` background as main content (not different color)
  - Right border using `--border` for separation
  - Logo/brand mark at top (text "BrokerApp" in brand color, or simple wordmark)
  - Navigation links: "Dashboard" (LayoutDashboard icon), "Nieuwe advertentie" (Plus icon), separator, "Recente woningen" section showing 3 recent property addresses from mock data
  - Active link: `--brand-subtle` background + `--brand` text color
  - Hover: `--surface-2` background
  - User avatar + name at bottom ("Jan de Vries" mock user)
  - Responsive: collapsible on mobile (hamburger menu)
- `src/components/layout/header.tsx`:
  - Page title (display typography)
  - Optional breadcrumbs
  - Optional action button slot (right-aligned)

**Dependencies:** Task 1 (project setup), Task 2 (mock data for recent properties)

**Acceptance criteria:**
- Sidebar renders with correct design tokens (same background as canvas, border separation)
- Active navigation link is visually distinct
- Recent properties section shows addresses from mock data
- Header renders page title with display typography
- Layout is responsive — sidebar collapses on mobile
- Sidebar navigation links route correctly

---

### Task 5: Rich Dashboard Page
**Size: M (4-5 files)**

Build the main dashboard with stats, property grid, and activity feed.

**Deliverables:**
- `src/app/(app)/dashboard/page.tsx`:
  - Header: "Dashboard" title
  - Stats row (3-4 stat cards): "Totaal woningen", "Gegenereerd deze maand", "Gepubliceerd", "Gem. generatietijd"
  - Property grid: 2-3 columns of photo-forward property cards
  - Activity feed section: recent actions list
- `src/components/dashboard/stat-card.tsx`:
  - Large number (display weight) + trend indicator (up/down arrow + percentage in success/destructive color)
  - Contextual label below (caption)
  - Icon with warm container (`--brand-subtle` background, rounded)
  - `--surface-1` background with card shadow
- `src/components/dashboard/property-card.tsx`:
  - Photo-forward: image takes ~60% of card height (use placeholder gradient if no real images)
  - Status badge pill in top-right: Draft (`--ink-tertiary` bg), Gegenereerd (`--warning` bg), Gepubliceerd (`--success` bg)
  - Below image: address (subheading), price formatted as "€ 425.000" (heading weight), stats row (rooms, sqm, energy label in caption)
  - Click → navigates to `/advertentie/[id]` (if generated/published) or `/nieuw` (if draft)
  - Hover: slight shadow lift
- `src/components/dashboard/activity-feed.tsx`:
  - List of recent actions with icon, description, timestamp
  - Types: "Advertentie gegenereerd", "Advertentie bewerkt", "Gepubliceerd op Funda"
  - Relative timestamps ("2 uur geleden", "gisteren")
- `src/hooks/use-properties.ts`:
  - Returns mock properties from `mock-data.ts`
  - Filter by status
  - Get single property by ID

**Dependencies:** Task 1, Task 2 (mock data), Task 4 (app shell)

**Acceptance criteria:**
- Dashboard shows realistic stats with trend indicators
- Property cards are photo-forward with correct status badges
- Activity feed shows Dutch timestamps
- Grid is responsive (3 cols → 2 cols → 1 col)
- All design tokens applied correctly (shadows, spacing, typography, colors)
- Clicking a property card navigates correctly

---

### Task 6: Upload & Generate Page
**Size: M (4-5 files)**

Build the core feature page where brokers upload property photos and generate an AI advert.

**Deliverables:**
- `src/app/(app)/nieuw/page.tsx`:
  - Header: "Nieuwe advertentie" with subtitle "Upload foto's en genereer een advertentie"
  - Two-column layout: image gallery (left/top) + property form (right/bottom)
  - Generate button below both sections
- `src/components/upload/image-gallery.tsx`:
  - Drag-and-drop zone with dashed `--border-emphasis` border and `--surface-2` background
  - Drop text: "Sleep foto's hierheen of klik om te uploaden"
  - Accepts image files only (jpg, png, webp)
  - Uploaded images appear as thumbnail grid (3-4 columns)
  - Each thumbnail: `--radius-md` corners, subtle shadow, hover shows delete button
  - "Meer toevoegen" slot: dashed border placeholder at end of grid
  - Images stored in local state (as File objects / object URLs)
- `src/components/upload/property-form.tsx`:
  - Fields (all with Dutch labels):
    - Adres (address) — text input
    - Postcode — text input (Dutch format: 1234 AB)
    - Plaats (city) — text input
    - Vraagprijs (price) — number input with € prefix
    - Woonoppervlakte (sqm) — number input with m² suffix
    - Kamers (rooms) — number input
    - Slaapkamers (bedrooms) — number input
    - Badkamers (bathrooms) — number input
    - Bouwjaar (year built) — number input
    - Energielabel — select dropdown (A+++, A++, A+, A, B, C, D, E, F, G)
  - All fields use design system tokens (inset inputs with `--surface-2` background)
- `src/components/upload/generate-button.tsx`:
  - Large primary button: "Advertentie genereren" in brand terracotta
  - Disabled until at least 1 image uploaded AND address filled
  - On click: triggers `useGenerate` hook
  - Loading state: spinner + "Advertentie wordt gegenereerd..." text
  - On complete: redirect to `/advertentie/[new-id]`
- `src/hooks/use-generate.ts`:
  - Wraps `mockGenerateAdvert()` from `mock-ai.ts`
  - Manages loading, result, and error states
  - Returns `{ generate, isGenerating, result, error }`

**Dependencies:** Task 1, Task 2 (types & mock AI), Task 4 (app shell)

**Acceptance criteria:**
- Drag-and-drop image upload works (files displayed as thumbnails)
- Property form validates required fields (address)
- Generate button disabled until minimum requirements met
- Clicking generate shows loading state for 2-3 seconds
- After generation, redirects to advert editor with generated content
- Responsive: two-column on desktop, stacked on mobile
- All Dutch labels and placeholder text

---

### Task 7: Advert Editor with Platform Preview
**Size: M (5 files)**

Build the advert editor page — the signature feature with split-view platform preview.

**Deliverables:**
- `src/app/(app)/advertentie/[id]/page.tsx`:
  - Header: property address as title + "Bewerk advertentie" subtitle
  - Split-view layout: editor panel (left, ~50%) + preview panel (right, ~50%)
  - Back link to dashboard
- `src/components/editor/advert-editor.tsx`:
  - Editable sections:
    - Title: single-line text input (pre-filled with generated title)
    - Beschrijving (description): large textarea (pre-filled with generated description)
    - Kenmerken (features): editable list of bullet points with add/remove
    - Woningdetails (property details): read-only structured display (price, sqm, rooms, etc.)
  - Changes update preview in real-time via shared state
- `src/components/editor/platform-preview.tsx`:
  - Renders the advert content in platform-specific styling
  - Funda preview: approximate Funda listing layout (blue header, photo carousel placeholder, description, features sidebar)
  - Pararius preview: approximate Pararius styling (different layout, green accents)
  - Jaap preview: approximate Jaap styling (simpler layout)
  - Content syncs in real-time with editor
  - Scrollable independently from editor
- `src/components/editor/platform-tabs.tsx`:
  - Tab bar with platform options: "Funda", "Pararius", "Jaap"
  - Active tab indicator uses brand color
  - Switching tabs updates preview styling
- `src/components/editor/export-actions.tsx`:
  - "Kopieer tekst" (Copy text) — copies formatted advert text to clipboard
  - "Download" — downloads advert as .txt file
  - "Markeer als gepubliceerd" — updates property status to published (mock)
  - Success toast/notification on copy

**Dependencies:** Task 1, Task 2 (mock data & types), Task 4 (app shell), Task 5 (property card for navigation back)

**Acceptance criteria:**
- Split view renders correctly with editor and preview side by side
- Editing title/description/features updates preview in real-time
- Platform tabs switch preview styling between Funda, Pararius, Jaap
- Each platform preview has visually distinct styling
- Copy to clipboard works and shows confirmation
- Download produces a .txt file with formatted advert
- "Markeer als gepubliceerd" updates status badge
- Responsive: stacks vertically on mobile with toggle between edit/preview modes
- This is the signature element — craft the platform preview with care
