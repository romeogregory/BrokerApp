# BrokerApp Design System

## Direction

**Domain:** Real estate brokerage — curb appeal, staging, viewings, natural light, property portfolios, golden hour photography, Dutch brick architecture, neighborhood character.

**Feel:** Like stepping into a well-staged model home. Warm, inviting, professional. The tool should feel as aspirational as the properties it sells. Modern and vibrant — Airbnb warmth meets Zillow professionalism.

**Signature:** Platform Preview — the advert editor shows a live preview styled to match the actual target platform (Funda, Pararius, Jaap). Switching tabs transforms the preview to show exactly what the buyer will see. The broker sees their work through the buyer's eyes.

**Rejected defaults:**
- Generic stat cards → Photo-forward property cards where the image leads
- Standard file upload dropzone → Staging area that treats photos like a curated gallery
- Plain text editor → Split-view with platform-native preview per export target

---

## Color Primitives

Token names evoke the product world: ink on canvas, terracotta from Dutch brick.

### Surfaces
- `--canvas: #FAF9F7` — warm paper, base background
- `--surface-1: #FFFFFF` — cards, elevated content
- `--surface-2: #F5F3F0` — inset inputs, secondary surfaces
- `--surface-3: #EDEAE6` — hover states on surface-2

### Text (Ink)
- `--ink: #1C1917` — primary text, warm near-black
- `--ink-secondary: #57534E` — supporting text, descriptions
- `--ink-tertiary: #A8A29E` — metadata, timestamps
- `--ink-muted: #D6D3D1` — disabled, placeholder

### Borders
- `--border: rgba(28, 25, 23, 0.08)` — standard separation
- `--border-subtle: rgba(28, 25, 23, 0.05)` — softer separation
- `--border-emphasis: rgba(28, 25, 23, 0.15)` — emphasis
- `--border-focus: #D97756` — focus rings (brand-linked)

### Brand (Terracotta)
- `--brand: #D97756` — terracotta, warm and vibrant
- `--brand-hover: #C4684A` — darker terracotta for hover
- `--brand-subtle: #FEF2EE` — light terracotta wash for backgrounds
- `--brand-foreground: #FFFFFF` — text on brand surfaces

### Semantic
- `--success: #5D8C66` — sage green (gardens, nature)
- `--success-subtle: #F0F7F1`
- `--warning: #D4A754` — golden amber (afternoon light)
- `--warning-subtle: #FDF8EE`
- `--destructive: #C4564A` — warm red
- `--destructive-subtle: #FEF2F1`
- `--info: #5B8EC4` — soft blue
- `--info-subtle: #EFF5FB`

---

## Depth Strategy: Subtle Shadows

Soft lift — matches the warm, inviting feel. Shadows use warm undertones.

- **Card:** `0 1px 3px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04)`
- **Elevated:** `0 4px 12px rgba(28, 25, 23, 0.08), 0 2px 4px rgba(28, 25, 23, 0.04)`
- **Dropdown:** `0 8px 24px rgba(28, 25, 23, 0.12), 0 4px 8px rgba(28, 25, 23, 0.06)`

Borders supplement shadows at low elevation. Higher surfaces rely more on shadow.

---

## Spacing

Base unit: **4px** (0.25rem)

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Icon gaps, tight padding |
| `--space-2` | 8px | Inline spacing, badge padding |
| `--space-3` | 12px | Input padding, button padding-x |
| `--space-4` | 16px | Card padding, form gaps |
| `--space-5` | 20px | Section gaps within cards |
| `--space-6` | 24px | Between card groups |
| `--space-8` | 32px | Major section separation |
| `--space-10` | 40px | Page section gaps |
| `--space-12` | 48px | Page-level padding |
| `--space-16` | 64px | Hero spacing |

---

## Border Radius

Rounded and friendly — matches modern & vibrant direction.

- `--radius-sm: 6px` — inputs, buttons, badges
- `--radius-md: 10px` — cards, panels, dropdowns
- `--radius-lg: 16px` — modals, large containers, image crops
- `--radius-full: 9999px` — pills, avatars, status dots

---

## Typography

**Typeface:** Plus Jakarta Sans — humanist warmth with geometric clarity. Rounded terminals feel approachable without being childish. More distinctive than Inter, professional enough for business use.

| Level | Size | Weight | Letter-spacing | Use |
|-------|------|--------|----------------|-----|
| Display | 30px | 700 | -0.02em | Page titles |
| Heading | 20px | 600 | -0.01em | Section headings |
| Subheading | 16px | 600 | 0 | Card titles, form sections |
| Body | 14px | 400 | 0 | Default text |
| Label | 13px | 500 | 0.01em | Form labels, small headings |
| Caption | 12px | 400 | 0.01em | Metadata, timestamps, help text |

Headings use tighter tracking for presence. Labels use wider tracking for legibility at small sizes.

---

## Component Patterns

### Property Card (Photo-Forward)
- Image takes ~60% of card height
- Subtle warm gradient overlay at bottom of image for text legibility
- Status badge as pill in top-right corner (Draft = `--ink-tertiary`, Generated = `--warning`, Published = `--success`)
- Below image: address (subheading weight), price (heading weight), key stats row (rooms, sqm, energy label in caption)
- `--radius-md` corners, card shadow
- Hover: slight lift with elevated shadow

### Upload Staging Area
- Gallery grid layout, not a file list
- Each image as a thumbnail card with `--radius-md` corners
- Drag-to-reorder with subtle lift animation
- "Add more" slot: dashed `--border-emphasis` border, `--surface-2` background
- Property details form alongside the gallery (side-by-side on desktop, stacked on mobile)

### Platform Preview (Signature Element)
- Split view: editable content left, platform preview right
- Tab bar for platform selection (Funda, Pararius, Jaap)
- Preview panel adapts styling to approximate selected platform's visual format
- Real-time sync: edits on left reflect instantly on right
- Responsive: stacks vertically on mobile with toggle between edit/preview

### Stat Card
- Large number (display weight) with trend indicator (up/down arrow + percentage)
- Contextual label below (caption)
- `--brand-subtle` background wash
- Icon with warm container (rounded, `--brand-subtle` background)

### Navigation Sidebar
- Same `--canvas` background as main content (not different color)
- Separated by `--border` on the right edge
- Active item: `--brand-subtle` background, `--brand` text
- Hover: `--surface-2` background
- Logo/brand mark at top, user avatar + name at bottom

---

## Interaction States

- **Hover:** Subtle background shift (one surface level darker) + pointer cursor
- **Active/Pressed:** Slightly darker than hover, slight scale(0.98) on buttons
- **Focus:** 2px `--border-focus` (terracotta) ring with 2px offset
- **Disabled:** 50% opacity, no pointer events
- **Loading:** Skeleton with subtle warm shimmer animation (left-to-right)
- **Empty state:** Illustration or icon + message + primary action CTA

---

## Animation

- **Micro-interactions:** 150ms ease-out (hover, press, toggle)
- **Transitions:** 200ms ease-out (panel open, tab switch)
- **Page transitions:** 250ms ease-in-out
- **Loading shimmer:** 1.5s ease-in-out infinite
- No bounce or spring — professional but not stiff
