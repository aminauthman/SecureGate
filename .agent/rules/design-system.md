---
trigger: always_on
---

# design-system.md - SecureGate Typography & Color Standards

## 1. Typography (Google Material Design Standards)

SecureGate uses **Roboto** as its primary typeface to ensure clean readability across all mobile and web viewports. The type hierarchy follows Google's Material Design type scale, optimized for high legibility in system interfaces.

* **Font Family:** `font-sans` (mapped to 'Roboto', sans-serif).
* **Scale and Hierarchy:**
* **Headings (Titles):** `text-2xl font-bold tracking-tight text-slate-900` (Used for page titles like "Sign In" or "Create Account").
* **Body Text (Standard):** `text-base font-normal text-slate-600` (Used for labels, form descriptions, and general UI text).
* **Helper/Error Text:** `text-sm font-medium` (Used for input field hints and validation error banners).
* **Button Text:** `text-sm font-semibold uppercase tracking-wider` (Used to ensure clear, prominent calls to action).



---

## 2. Color System (Tailwind CSS Palette)

The color system uses Tailwind CSS default palettes to establish a clean, production-ready interface. Colors are selected to maintain a minimum contrast ratio of 4.5:1 against their backgrounds, complying with standard accessibility checklists.

### 2.1 Brand & Functional Colors

* **Primary (Action/Interactive):** `bg-blue-600` | Hover: `hover:bg-blue-700` | Focus: `focus:ring-blue-500`
* Applied to primary command elements like submit buttons and main navigation switches.


* **Neutral Backgrounds:** `bg-slate-50`
* The baseline structural canvas color across the dashboard layout and unauthenticated screen backdrops.


* **Surface/Cards:** `bg-white`
* Used for contained interface elements, central form cards, and dashboard information modules.


* **Borders & Dividers:** `border-slate-200`
* Delimits separate entry sections and card perimeters without creating visual noise.



### 2.2 System & Feedback Status Colors

* **Error/Alert States:** `text-red-600` | Backgrounds: `bg-red-50` | Borders: `border-red-200`
* Used to display rate-limiting dropouts (HTTP 429) or generic access validation failures.




* **Success States:** `text-emerald-600` | Backgrounds: `bg-emerald-50`
* Used for account email validation success flags and password mutation completion notifications.


* **Text Hierarchy Colors:**
* **Primary Content:** `text-slate-900` (High-contrast text for headers and prominent input labels).
* **Secondary Content:** `text-slate-600` (De-emphasized descriptive body copy and placeholder text).



### 2.3 Dark Mode Tokens

All colors above have dark-mode equivalents applied via Tailwind's `dark:` variant:

| Token | Light | Dark |
|---|---|---|
| Surface/Cards | `bg-white` | `dark:bg-slate-800` |
| Neutral Background | `bg-slate-50` | `dark:bg-slate-900` |
| Primary Content Text | `text-slate-900` | `dark:text-slate-100` |
| Secondary Content Text | `text-slate-600` | `dark:text-slate-400` |
| Borders & Dividers | `border-slate-200` | `dark:border-slate-700` |
| Primary Action | `bg-blue-600` | `dark:bg-blue-500` |
| Input Background | `bg-white` | `dark:bg-slate-800` |
| Input Border | `border-slate-300` | `dark:border-slate-600` |

---

## 3. Spacing & Sizing Scale

Use Tailwind's default spacing scale. Stick to these predefined tokens — avoid arbitrary values (`p-[13px]`, `m-[7px]`):

| Token | Value | Common Use |
|---|---|---|
| `p-4` / `px-4` / `py-3` | 16px / 12px | Card/input padding |
| `gap-3` / `gap-4` | 12px / 16px | Stack/grid gaps |
| `space-y-4` | 16px | Vertical form spacing |
| `p-6` | 24px | Section/card inner padding |
| `m-0` | 0 | Reset |
| `max-w-md` | 448px | Form card width |
| `max-w-lg` | 512px | Wider dialogs |
| `w-full` | 100% | Mobile-first inputs |

---

## 4. Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `rounded-none` | 0px | Tables, data grids |
| `rounded-sm` | 2px | Dense metadata badges |
| `rounded-md` | 6px | Inputs, buttons, cards (default) |
| `rounded-lg` | 8px | Modals, dialogs |
| `rounded-xl` | 12px | Profile avatars |
| `rounded-full` | 9999px | Pill tags, notification dots |

---

## 5. Shadow & Elevation System

| Token | Use |
|---|---|
| `shadow-sm` | Card hover, subtle raised elements |
| `shadow-md` | Dropdown menus, floating action buttons |
| `shadow-lg` | Modals, dialogs, toast notifications |
| `shadow-xl` | Full-screen overlays, mobile nav drawers |

Dark mode: apply `dark:shadow-2xl dark:shadow-black/30` for depth without harsh light tones.

---

## 6. Responsive Breakpoints

| Breakpoint | Min-Width | Target |
|---|---|---|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |

Default mobile-first: **unprefixed classes target mobile**. Layer up with `md:`, `lg:`.

Layout containers:
```text
max-w-md mx-auto px-4   (form pages)
max-w-6xl mx-auto px-6  (dashboard)
```

---

## 7. Z-Index Scale

| Layer | Value | Elements |
|---|---|---|
| Base | `z-0` | Page content |
| Sticky | `z-10` | Sticky headers |
| Dropdown | `z-30` | Menus, popovers |
| Modal backdrop | `z-40` | Overlay scrim |
| Modal content | `z-50` | Dialogs, toasts |
| Notification | `z-[60]` | Toast stack (above modals) |

---

## 8. Animation & Transition Tokens

| Token | Use |
|---|---|
| `transition-colors duration-200` | Link/button hover color fades |
| `transition-all duration-300` | Card hover lift (combine with `hover:shadow-md hover:-translate-y-0.5`) |
| `animate-pulse` | Skeleton loading placeholders |
| `transition-opacity duration-150` | Dropdown/modal enter/leave |
| `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` | Focus-visible keyboard nav |

Do **not** use custom keyframes unless approved. Prefer Tailwind's built-in `animate-*` utilities.

---

## 9. Icon System

* **Library:** [lucide-react](https://lucide.dev) (consistent with NextAuth + React ecosystem)
* **Sizing:** All icons use `size={4}` / `size={5}` / `size={6}` (maps to 16px / 20px / 24px)
* **Color:** Inherit text color via `className="text-slate-600"` unless part of an interactive element
* **Placement:** Prefix buttons, suffix inputs. Never use icons as sole indicators without text or aria-label.

```tsx
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
// Example: <Mail className="text-slate-400" size={4} />
```

---

## 10. Loading, Skeleton & Disabled States

### Skeleton Placeholder
```text
class="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700"
```

### Button Loading
```text
disabled:opacity-50 disabled:cursor-not-allowed
```
Swap inner text for a spinner (`<Loader2 className="animate-spin" />`).

### Input Disabled
```text
disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-900
```

### Empty State
Centered container:
```text
flex flex-col items-center justify-center py-12 text-center
```

---

## 11. Button Variant System

| Variant | Classes |
|---|---|
| **Primary** | `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500` |
| **Secondary** | `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-blue-500` |
| **Ghost** | `text-slate-600 hover:bg-slate-100 focus:ring-blue-500` |
| **Danger** | `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500` |
| **Link** | `text-blue-600 hover:text-blue-700 underline underline-offset-2` |

Shared base for all buttons:
```text
inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
```

---

## 12. Form Field Error State

Extend the base input spec with error-specific tokens:

**Base Input (default):**
```text
w-full px-4 py-3 text-base font-sans rounded-md border border-slate-300 text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]
```

**Error State** (add when validation fails):
```text
border-red-500 focus:ring-red-500 focus:border-red-500
```

**Error Message:**
```text
text-sm font-medium text-red-600 mt-1
```

**Success State** (optional, post-validation):
```text
border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500
```

---

## 13. Layout Grid Spec

### Form Pages (auth, verification)
```text
min-h-screen flex items-center justify-center bg-slate-50 px-4
```
Inner card:
```text
w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6
```

### Dashboard Pages
```text
max-w-6xl mx-auto px-6 py-8 space-y-8
```

### Two-Column Split (dashboard detail)
```text
grid grid-cols-1 lg:grid-cols-3 gap-6
```

---

## 14. Form Component Tailwind Specification

All interactive text fields must combine the typography scale with the color system flags to maintain uniform appearance on compact mobile layouts:

```text
class="w-full px-4 py-3 text-base font-sans rounded-md border border-slate-300 text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"

```
