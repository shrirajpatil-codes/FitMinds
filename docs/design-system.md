# FITMINDS Design System & Frontend Foundation

FITMINDS features a calm, intelligent, dark-mode design system optimized for student focus, clarity, and consistency.

---

## 1. Color System

| Token | Hex | Role / Intent |
|---|---|---|
| `bg-background` | `#0B0F17` | Main calm dark foundation |
| `bg-surface` | `#111726` | Card & panel background |
| `bg-hover` | `#1B2436` | Interactive hover state |
| `brand` | `#00F0FF` | Primary electric cyan accent |
| `brand-blue` | `#0284C7` | Primary supporting gradient blue |
| `ai-purple` | `#A855F7` | AI engine & insight indicators |
| `status-success` | `#22C55E` | Positive / Ready states |
| `status-warning` | `#F59E0B` | Attention / Reduced states |
| `status-danger` | `#EF4444` | Genuine error / High risk states |

---

## 2. Typography

Font Family: **Inter** (sans-serif)

- **Display**: `text-4xl` to `text-6xl`, font-extrabold
- **Heading**: `text-xl` to `text-2xl`, font-bold
- **Subheading**: `text-base`, font-semibold
- **Body**: `text-sm`, font-normal, text-slate-300
- **Small Text**: `text-xs`, text-slate-400
- **Labels**: `text-[10px]` / `text-xs`, font-bold, uppercase tracking-wider

---

## 3. Spacing & Border Radius

- **Border Radius**:
  - `rounded-lg`: Small components, tags (`0.5rem`)
  - `rounded-xl`: Buttons, inputs, standard containers (`0.75rem`)
  - `rounded-2xl`: Cards, modals (`1rem`)
- **Page Padding**: `p-4 md:p-6 lg:p-8`
- **Card Padding**: `p-5`
- **Component Gap**: `gap-3` / `gap-4`

---

## 4. Component Library (`src/components/common/`)

- `Button`: Primary, Secondary, Outline, Ghost, Danger, AI
- `Card`: Default, Highlighted, Interactive, AI Insight, Warning, Success
- `Badge`: Status badges (`READY`, `REDUCED`, `RECOVERY`, `LOW RISK`, `HIGH RISK`, `AI`, etc.)
- `Input` / `Select` / `Textarea`: Standardized form controls with left/right icons & error states
- `Modal`: Accessible dialog backdrop with ESC & lock scroll
- `ProgressBar`: Adaptive progress indicator with percentage calculation
- `Tabs` / `Tooltip` / `Avatar` / `IconButton` / `Divider` / `Skeleton` / `EmptyState` / `Alert` / `StatCard`

---

## 5. Application Layout Shell (`src/components/layout/`)

- **Desktop Layout**: 256px sticky Sidebar + TopBar + PageContainer
- **Mobile Layout**: Touch-optimized bottom navigation bar (`Home`, `Today`, `Progress`, `Coach`, `Profile`)
- **Breakpoints**: Mobile (<768px), Tablet (768px - 1024px), Desktop (>1024px)
