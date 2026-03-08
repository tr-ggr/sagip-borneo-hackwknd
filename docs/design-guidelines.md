# WIRA — Design Guidelines
### Woven Intelligence for Regional Alertness
**Version 1.0 | ASEAN Disaster Response Platform**

---

## 1. Design Philosophy

WIRA exists at the intersection of **urgency and humanity**. It must communicate life-critical information clearly under extreme stress, while remaining culturally rooted in the diverse communities it serves across Southeast Asia.

The guiding philosophy is **"Woven Resilience"** — drawing from the batik tradition, where every thread is intentional, every pattern carries meaning, and complexity is made beautiful through discipline. Just as a master batik artisan plans every motif before touching cloth, every WIRA interface element must serve a precise purpose.

### Core Design Principles

| Principle | Description |
|---|---|
| **Clarity First** | In disaster contexts, ambiguity costs lives. Every label, icon, and color must be unambiguous at a glance. |
| **Offline-Native** | Design assuming zero connectivity. Interfaces must be fully legible and functional in degraded states. |
| **Cultural Anchoring** | Visual identity draws from batik motifs and ASEAN cultural heritage — not imposed aesthetics. |
| **Inclusive by Default** | Readable at 12pt in direct sunlight. Accessible to elderly users, low-literacy populations, and those in panic. |
| **Hierarchy of Urgency** | Every screen has one primary action. Critical alerts dominate. Administrative UI recedes. |
| **Trust Through Transparency** | Visual design signals reliability. No dark patterns. Aid flows and data provenance are always visible. |

---

## 2. Cultural Identity: Batik & ASEAN Heritage

### 2.1 The Batik Motif System

Batik is the unifying visual language of WIRA. It is recognized across Malaysia, Indonesia, Brunei, Singapore, and the Philippines, and echoes through the textile traditions of Thailand and Vietnam.

WIRA adopts a **"Digital Batik"** approach: geometric, vector-friendly interpretations of traditional motifs used as:
- Background textures (low-opacity, SVG-based)
- Section dividers and border treatments
- Loading states and empty state illustrations
- Iconography outlines

**Approved Motif Categories:**

| Motif Family | Origin | Use in WIRA |
|---|---|---|
| **Parang (Diagonal Wave)** | Java, Indonesia | Connectivity indicators, signal strength, data flow |
| **Mega Mendung (Cloud)** | Cirebon, Indonesia | Weather overlays, rain alerts, flood state backgrounds |
| **Pucuk Rebung (Bamboo Shoot)** | Sarawak/Malay | Growth metrics, recovery dashboards, upward trends |
| **Kawung (Palm Fruit Circles)** | Java | Node/network maps, Supernode visualization |
| **Keringking (Coastal Waves)** | Coastal Malaysia | Flood stage indicators, coastal hazard maps |
| **Lai (Floral Diamond)** | Thailand/Lanna | Community health overlays, evacuation center markers |

**Implementation Rule:** Motifs must always be rendered as SVG paths at **4–8% opacity** on non-alert backgrounds. On alert screens, motifs are **suppressed entirely** to preserve cognitive clarity.

### 2.2 ASEAN Color Heritage

The WIRA palette integrates the five colors of the **ASEAN flag** as semantic anchors, then extends them with regional earth tones and digital-clarity accents.

ASEAN Flag colors (Blue, Red, White, Yellow) are integrated into the Status System (see Section 3.2).

---

## 3. Color System

### 3.1 Primary Palette

```
--color-wira-deep-teal:     #0D4F5C   /* Primary brand, navigation, trust signals */
--color-wira-batik-gold:    #C8922A   /* Primary accent, CTAs, cultural warmth */
--color-wira-earth-brown:   #5C3D2E   /* Secondary text, grounding elements */
--color-wira-ivory-cream:   #F5F0E8   /* Base background, paper-like warmth */
--color-wira-night-black:   #0F1A1C   /* High-contrast text, critical UI chrome */
```

**Tailwind Custom Config:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'wira': {
          'teal':        '#0D4F5C',
          'teal-light':  '#1A7A8F',
          'teal-dark':   '#082F38',
          'gold':        '#C8922A',
          'gold-light':  '#E8B84B',
          'gold-dark':   '#8F6419',
          'earth':       '#5C3D2E',
          'earth-light': '#8A6050',
          'ivory':       '#F5F0E8',
          'ivory-dark':  '#E8E0D0',
          'night':       '#0F1A1C',
        }
      }
    }
  }
}
```

### 3.2 Semantic Status Palette (Alert System)

Drawn from ASEAN flag colors + universal hazard standards:

```
--color-status-critical:    #D72B2B   /* Red   — ASEAN Red. Immediate life threat */
--color-status-warning:     #E8A020   /* Amber — ASEAN Yellow. Elevated risk */
--color-status-advisory:    #1B5FA8   /* Blue  — ASEAN Blue. Monitor situation */
--color-status-safe:        #2E7D32   /* Green — All-clear, recovery phase */
--color-status-offline:     #616161   /* Grey  — Connectivity lost, degraded mode */
--color-status-white:       #FFFFFF   /* White — ASEAN White. Neutral/inactive */
```

**Tailwind:**
```js
colors: {
  'status': {
    'critical':  '#D72B2B',
    'warning':   '#E8A020',
    'advisory':  '#1B5FA8',
    'safe':      '#2E7D32',
    'offline':   '#616161',
  }
}
```

**Alert Color Rules:**
- `status-critical` backgrounds must **always** use white (`#FFFFFF`) text
- `status-warning` backgrounds must **always** use `wira-night` (`#0F1A1C`) text
- Never use critical red for non-alert UI elements (borders, decorations, etc.)
- Status colors must never be the *only* differentiator — always pair with an icon and label

### 3.3 Dark Mode (Disaster Night Operations)

WIRA must support a **high-contrast dark mode** for nighttime field operations and power-conserving low-brightness screens.

```
--dm-background:   #0A1214
--dm-surface:      #122029
--dm-surface-2:    #1A2F38
--dm-text-primary: #EDF2F0
--dm-text-muted:   #7A9EA8
--dm-border:       #2A4A54
```

**Tailwind dark mode class:** `dark:` prefix, triggered by `class="dark"` on `<html>`.

---

## 4. Typography

### 4.1 Type Scale

WIRA uses a **dual-script aware** type system. All text components must gracefully render:
- Latin (English, Malay, Filipino, Vietnamese with diacritics)
- Thai script
- Jawi (Arabic-derived Malay script) — right-to-left aware layouts required

**Primary Typeface — Display & Headings:**
**`Playfair Display`** (Google Fonts)
- Used for: Dashboard titles, alert headlines, section headers
- Rationale: Serif authority communicates gravitas for critical information; echoes the formal weight of traditional print government communications across ASEAN

**Secondary Typeface — Body & UI:**
**`IBM Plex Sans`** (Google Fonts)
- Used for: Body text, form labels, data tables, navigation
- Rationale: Geometric clarity, excellent multilingual support, designed for information-dense interfaces; available in Thai variant (`IBM Plex Sans Thai`)

**Monospace — Data & Code:**
**`IBM Plex Mono`**
- Used for: Coordinates, timestamps, sensor readings, blockchain hashes, CAP XML previews

```html
<!-- Google Fonts import -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Tailwind Config:**
```js
fontFamily: {
  'display': ['"Playfair Display"', 'Georgia', 'serif'],
  'body':    ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
  'mono':    ['"IBM Plex Mono"', 'monospace'],
}
```

### 4.2 Type Scale (Tailwind Classes)

| Role | Tailwind | Size | Weight | Use |
|---|---|---|---|---|
| Alert Headline | `text-4xl font-display font-bold` | 36px | 700 | Critical alert titles |
| Dashboard Title | `text-2xl font-display font-semibold` | 24px | 600 | Page/module headers |
| Section Header | `text-xl font-body font-semibold` | 20px | 600 | Card headers |
| Body Default | `text-base font-body font-normal` | 16px | 400 | General content |
| Body Small | `text-sm font-body font-normal` | 14px | 400 | Secondary info |
| Caption | `text-xs font-body font-medium` | 12px | 500 | Timestamps, labels |
| Data/Sensor | `text-sm font-mono` | 14px | 400 | GPS coords, readings |

**Minimum readable size in field conditions: `text-sm` (14px).** Never go smaller in operational views.

---

## 5. Iconography

### 5.1 Icon System

Use **Lucide Icons** as the base library (tree-shakeable, consistent stroke weight).

**WIRA Icon Rules:**
- Default stroke: `1.5px` for UI, `2px` for alert/critical states
- Size: `20px` (inline), `24px` (navigation), `32px` (feature callouts), `48px` (alert modals)
- Icons must always be paired with a text label in operational interfaces (never icon-only for critical actions)
- Color: Inherit from context; never use icon color as the sole status indicator

### 5.2 Custom WIRA Icons

These unique icons should be created as SVG assets following the batik-edge motif principle (slight geometric flourish on corners):

| Icon Name | Represents | Motif Inspiration |
|---|---|---|
| `wira-pulse` | LoRa SOS Pulse signal | Parang wave radiating from center |
| `wira-supernode` | Community Supernode hub | Kawung circle cluster |
| `wira-mesh` | BLE Mesh network | Interconnected Kawung nodes |
| `wira-needs-ticket` | Verified Needs Triage request | Pucuk Rebung shoot with pin |
| `wira-mcatl` | Translation Layer active | Stylized SEA regional outline |
| `wira-offline` | Offline mode indicator | Broken Mega Mendung cloud |

---

## 6. Spacing & Layout

### 6.1 Base Grid

WIRA uses an **8px base unit** grid system throughout.

```
Spacing scale (Tailwind defaults align perfectly):
4px   = p-1   (micro gaps, icon padding)
8px   = p-2   (tight component spacing)
16px  = p-4   (default component padding)
24px  = p-6   (card padding, section gaps)
32px  = p-8   (major section spacing)
48px  = p-12  (dashboard section dividers)
64px  = p-16  (full-page section gaps)
```

### 6.2 Layout Modes

WIRA has three core layout contexts:

**1. Field Mobile (Primary)** — 375–430px
- Single column
- Bottom navigation bar (thumb-reachable)
- Full-width cards
- Large tap targets: minimum `44px × 44px` (`min-h-11 min-w-11`)

**2. Command Center (Tablet/Desktop)** — 768px+
- Left sidebar navigation (240px fixed)
- Main content area with resizable map panel
- Right panel for alert detail / triage queue

**3. Public Portal** — Responsive, 320px+
- Minimal chrome, max-width `640px` centered
- Optimized for slow connections and low-powered devices

### 6.3 Safe Zone for Offline/Alert Banners

Always reserve the **top 48px** (`h-12`) for system status banners (offline indicator, alert level, connectivity state). This zone is sacred — no other content may overlap it.

---

## 7. Component Patterns

### 7.1 Alert Banner

The most critical component. Follows a strict hierarchy:

```html
<!-- CRITICAL Alert — Full takeover -->
<div class="fixed inset-x-0 top-0 z-50 bg-status-critical text-white px-4 py-3 flex items-center gap-3">
  <svg class="w-6 h-6 shrink-0" .../>  <!-- Alert icon, 2px stroke -->
  <div>
    <p class="text-sm font-body font-semibold uppercase tracking-wider">Banjir Kritikal • Critical Flood</p>
    <p class="text-xs font-body font-normal opacity-90">Kawasan: Kuching Selatan — Tahap 3</p>
  </div>
  <span class="ml-auto text-xs font-mono opacity-75">14:32 MYT</span>
</div>
```

**Alert Banner Levels:**

| Level | Background | Text | Tailwind Classes |
|---|---|---|---|
| Critical | `#D72B2B` | White | `bg-status-critical text-white` |
| Warning | `#E8A020` | Night | `bg-status-warning text-wira-night` |
| Advisory | `#1B5FA8` | White | `bg-status-advisory text-white` |
| Safe | `#2E7D32` | White | `bg-status-safe text-white` |
| Offline | `#616161` | White | `bg-status-offline text-white` |

### 7.2 Needs Ticket Card

```html
<div class="bg-white dark:bg-dm-surface rounded-2xl border border-wira-ivory-dark dark:border-dm-border p-4 shadow-sm">
  <!-- Priority indicator strip (left border) -->
  <div class="flex gap-3">
    <div class="w-1 rounded-full bg-status-critical shrink-0"></div>
    <div class="flex-1">
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm font-body font-semibold text-wira-night dark:text-dm-text-primary">
          Insulin Required — 2 Adults
        </p>
        <span class="text-xs font-mono text-wira-earth dark:text-dm-text-muted shrink-0">09:14</span>
      </div>
      <p class="text-xs font-body text-wira-earth dark:text-dm-text-muted mt-0.5">
        Supernode 7 • Jalan Pending, Kuching
      </p>
      <div class="flex items-center gap-2 mt-2">
        <span class="inline-flex items-center gap-1 bg-status-critical/10 text-status-critical text-xs font-body font-medium px-2 py-0.5 rounded-full">
          Medical
        </span>
        <span class="inline-flex items-center gap-1 bg-wira-teal/10 text-wira-teal text-xs font-body font-medium px-2 py-0.5 rounded-full">
          Verified ✓
        </span>
      </div>
    </div>
  </div>
</div>
```

### 7.3 Status Badge

```html
<!-- Connectivity States -->
<span class="inline-flex items-center gap-1.5 text-xs font-body font-medium px-2.5 py-1 rounded-full
             bg-status-safe/15 text-status-safe">
  <span class="w-1.5 h-1.5 rounded-full bg-status-safe animate-pulse"></span>
  Online
</span>

<span class="inline-flex items-center gap-1.5 text-xs font-body font-medium px-2.5 py-1 rounded-full
             bg-status-offline/15 text-status-offline">
  <span class="w-1.5 h-1.5 rounded-full bg-status-offline"></span>
  Mesh Only — BLE Active
</span>
```

### 7.4 Primary Button

```html
<!-- Primary CTA -->
<button class="w-full bg-wira-gold hover:bg-wira-gold-dark active:scale-95
               text-white font-body font-semibold text-base
               px-6 py-3.5 rounded-xl
               transition-all duration-150
               min-h-[52px]
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wira-gold focus-visible:ring-offset-2">
  Hantar Tiket Bantuan
</button>

<!-- Destructive / Emergency -->
<button class="w-full bg-status-critical hover:bg-red-700 active:scale-95
               text-white font-body font-bold text-lg uppercase tracking-wide
               px-6 py-4 rounded-xl
               transition-all duration-150
               min-h-[56px]
               shadow-lg shadow-status-critical/30">
  SOS PULSE
</button>
```

### 7.5 Data Card (Sensor / IoT Reading)

```html
<div class="bg-wira-ivory dark:bg-dm-surface rounded-2xl p-4 border border-wira-ivory-dark dark:border-dm-border">
  <p class="text-xs font-body font-medium text-wira-earth dark:text-dm-text-muted uppercase tracking-widest mb-1">
    Pore-Water Pressure
  </p>
  <div class="flex items-baseline gap-2">
    <span class="text-3xl font-display font-bold text-wira-teal dark:text-wira-teal-light">84.2</span>
    <span class="text-sm font-mono text-wira-earth dark:text-dm-text-muted">kPa</span>
  </div>
  <p class="text-xs font-mono text-wira-earth/60 dark:text-dm-text-muted/60 mt-1">
    Updated 3m ago • Sensor ID: EMB-04
  </p>
</div>
```

---

## 8. Batik Texture Implementation

### 8.1 SVG Background Pattern (Mega Mendung — Flood State)

```html
<!-- Apply as background on flood-related sections -->
<style>
.wira-batik-bg {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 10 Q45 20 30 30 Q15 40 30 50 Q45 40 30 30 Q15 20 30 10Z' stroke='%230D4F5C' stroke-width='1' fill='none' opacity='0.06'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 60px 60px;
}
</style>
```

### 8.2 Parang (Wave) Divider

```html
<!-- Section divider with parang wave motif -->
<div class="relative h-8 overflow-hidden opacity-20 my-6">
  <svg viewBox="0 0 400 32" class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
    <path d="M0,16 C50,0 100,32 150,16 C200,0 250,32 300,16 C350,0 400,32 400,16"
          stroke="#C8922A" stroke-width="2" fill="none"/>
    <path d="M0,20 C50,4 100,36 150,20 C200,4 250,36 300,20 C350,4 400,36 400,20"
          stroke="#0D4F5C" stroke-width="1.5" fill="none" opacity="0.5"/>
  </svg>
</div>
```

---

## 9. Map & Data Visualization Standards

### 9.1 Map Color Semantics

WIRA maps (Mapbox / Leaflet + HPix vector tiles) must follow consistent color encoding:

| Layer | Color | Opacity | Notes |
|---|---|---|---|
| Flood extent | `#1B5FA8` | 40% | ASEAN Blue — water |
| Critical zone | `#D72B2B` | 50% | Immediate evacuation |
| Warning zone | `#E8A020` | 40% | Elevated risk |
| Supernode marker | `#C8922A` | 100% | Gold filled circle |
| Evacuation route | `#2E7D32` | 100% | Green dashed line |
| Blocked road | `#D72B2B` | 100% | Red X overlay |
| GNN cluster | `#0D4F5C` | 60% | Teal heatmap |

### 9.2 Vector Tile Loading States

When HPix tiles are loading in offline/compressed mode:
- Show **batik-pattern placeholder** at 6% opacity in tile grid
- Display `font-mono text-xs` progress indicator: `"Memuat... 3/12 tiles"`
- Loading bar uses `bg-wira-gold` fill on `bg-wira-ivory-dark` track

---

## 10. Motion & Animation

### 10.1 Principles

- **Performance first**: Prefer `transform` and `opacity` animations only (GPU-composited)
- **Purposeful motion**: Animations must communicate system state (pulse = live, fade = degraded)
- **Reducible**: All animations respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### 10.2 Tailwind Animation Extensions

```js
// tailwind.config.js — extend animations
animation: {
  'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'ping-critical': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  'fade-in':       'fadeIn 0.3s ease-out forwards',
  'slide-up':      'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
},
keyframes: {
  fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
  slideUp: { from: { transform: 'translateY(12px)', opacity: '0' },
             to:   { transform: 'translateY(0)',    opacity: '1' } },
}
```

### 10.3 Alert State Transitions

| Transition | Duration | Easing | Class |
|---|---|---|---|
| Normal → Warning | 300ms | `ease-out` | `transition-colors duration-300` |
| Warning → Critical | 150ms | `ease-in` | `transition-colors duration-150` |
| Modal appear | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `animate-slide-up` |
| SOS Pulse ring | Infinite | Linear | `animate-ping-critical` |

---

## 11. Multilingual & Accessibility

### 11.1 Language Display

WIRA supports **7 primary languages** in the MCATL layer. Typography must handle all gracefully:

| Language | Script | Font Consideration |
|---|---|---|
| Bahasa Malaysia | Latin | IBM Plex Sans (default) |
| Bahasa Indonesia | Latin | IBM Plex Sans (default) |
| English | Latin | IBM Plex Sans (default) |
| Filipino/Tagalog | Latin | IBM Plex Sans (default) |
| Thai | Thai | IBM Plex Sans Thai |
| Vietnamese | Latin + diacritics | IBM Plex Sans (full Unicode) |
| Iban | Latin | IBM Plex Sans (default) |

Always use `lang="[code]"` attributes on translated content blocks. For RTL Jawi script, wrap in `dir="rtl"` containers.

### 11.2 Contrast Requirements

Minimum contrast ratios (WCAG AA — elevated to AAA for critical safety interfaces):

| Context | Minimum Ratio |
|---|---|
| Body text on background | 7:1 (AAA) |
| Alert text on status color | 4.5:1 (AA) |
| Sensor data on card | 7:1 (AAA) |
| Map label on tile | 4.5:1 (AA) |

### 11.3 Touch Targets

All interactive elements: minimum `44px × 44px` (`min-h-11 min-w-11` in Tailwind).
Emergency actions (SOS, Confirm Evacuation): minimum `56px × 56px` (`min-h-14 min-w-14`).

---

## 12. Offline State Design

### 12.1 Offline Mode Indicators

When the system detects no cellular/WiFi connectivity:
- Persistent banner: `bg-status-offline` top bar with `wira-offline` icon
- All cloud-dependent features dimmed: `opacity-40 pointer-events-none`
- Locally-available features highlighted with `ring-2 ring-wira-gold`

### 12.2 Degraded Connectivity States

| State | Visual Treatment | Message (EN/MY) |
|---|---|---|
| Full online | `status-safe` dot, no banner | — |
| BLE Mesh only | `status-warning` dot, slim banner | "Mesh Active / Mesh Aktif" |
| LoRa only | `status-warning` dot, slim banner | "LoRa Only / LoRa Sahaja" |
| Fully offline | `status-offline` banner full | "Offline Mode / Mod Luar Talian" |
| Reconnecting | Animated `pulse-slow` dot | "Reconnecting... / Menyambung Semula..." |

---

## 13. Complete Tailwind Config Reference

```js
// tailwind.config.js — WIRA Full Configuration
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx,vue,html}'],
  theme: {
    extend: {
      colors: {
        'wira': {
          'teal':         '#0D4F5C',
          'teal-light':   '#1A7A8F',
          'teal-dark':    '#082F38',
          'gold':         '#C8922A',
          'gold-light':   '#E8B84B',
          'gold-dark':    '#8F6419',
          'earth':        '#5C3D2E',
          'earth-light':  '#8A6050',
          'ivory':        '#F5F0E8',
          'ivory-dark':   '#E8E0D0',
          'night':        '#0F1A1C',
        },
        'status': {
          'critical':     '#D72B2B',
          'warning':      '#E8A020',
          'advisory':     '#1B5FA8',
          'safe':         '#2E7D32',
          'offline':      '#616161',
        },
        'dm': {
          'background':   '#0A1214',
          'surface':      '#122029',
          'surface-2':    '#1A2F38',
          'text-primary': '#EDF2F0',
          'text-muted':   '#7A9EA8',
          'border':       '#2A4A54',
        }
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', ...defaultTheme.fontFamily.serif],
        'body':    ['"IBM Plex Sans"', 'system-ui', ...defaultTheme.fontFamily.sans],
        'mono':    ['"IBM Plex Mono"', ...defaultTheme.fontFamily.mono],
      },
      animation: {
        'pulse-slow':     'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-critical':  'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in':        'fadeIn 0.3s ease-out forwards',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'wira':          '0 4px 24px -4px rgba(13, 79, 92, 0.18)',
        'wira-gold':     '0 4px 16px -4px rgba(200, 146, 42, 0.35)',
        'wira-critical': '0 4px 20px -4px rgba(215, 43, 43, 0.40)',
      },
      spacing: {
        'safe-top':     '48px',   /* Reserved for system status banner */
        'tap-min':      '44px',   /* Minimum touch target */
        'tap-emergency':'56px',   /* Emergency action touch target */
      }
    }
  }
}
```

---

## 14. Do's and Don'ts

### ✅ Do
- Use batik motifs as **texture and atmosphere**, never as decoration competing with data
- Always show connectivity state **prominently** in all operational views
- Pair every status color with an icon AND a text label
- Use `font-display` (Playfair Display) for alert headlines to signal gravity
- Test all critical screens at **320px width** and in **direct sunlight simulation** (reduce brightness to 30%)
- Use `font-mono` for all sensor readings, coordinates, timestamps, and IDs
- Provide both English and Bahasa Malaysia (minimum) for all UI labels

### ❌ Don't
- Use `status-critical` red for any non-emergency UI element
- Rely on color alone to convey alert level
- Animate anything on `status-critical` screens except the SOS pulse ring
- Use batik motifs at opacity > 10% behind data-dense interfaces
- Use font sizes below `text-sm` (14px) in any operational interface
- Place interactive elements within the top `48px` safe zone reserved for system banners
- Show skeleton loaders on offline-cached screens — show stale data with a timestamp instead

---

## 15. Version & Governance

| Item | Detail |
|---|---|
| **Version** | 1.0 |
| **Status** | Hackathon Reference |
| **Region Scope** | ASEAN-10 Member States |
| **Primary Languages** | EN, MY, ID, TH, FIL, VI, IBN |
| **Accessibility Target** | WCAG 2.1 AAA (critical flows), AA (informational) |
| **Framework Targets** | React, Vue 3, Vanilla HTML |
| **CSS Framework** | Tailwind CSS v3+ |
| **Last Updated** | 2025 |

---

*WIRA — Woven Intelligence for Regional Alertness. Designed for the people of ASEAN, grounded in our shared cultures, built for the moments that matter most.*