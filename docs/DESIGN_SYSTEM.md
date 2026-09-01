# ISP Digital Campus — Color & Typography Guideline

The visual direction is **light blue, clean, academic, friendly, spacious, and modern**.
The cardinal rule: **Never make the interface tiny and cramped.** 16px is the default body size; generous spacing and breathing room throughout.

---

## 1. Primary Color Palette & Tokens

```typescript
export const ispColors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main interactive blue
    600: '#2563EB', // Hover / strong action
    700: '#1D4ED8', // Active / emphasis
    800: '#1E40AF',
    900: '#1E3A8A', // Deep blue
  },

  text: {
    primary: '#172033',   // Deep slate for titles, names, primary data
    secondary: '#475467', // Neutral slate for descriptions, secondary data
    muted: '#667085',     // Metadata, timestamps, helper text
  },

  background: {
    default: '#F8FAFC',   // Subtle off-white page background
    paper: '#FFFFFF',     // Pure white for cards, modals, tables, surfaces
    softBlue: '#EFF6FF',  // Highlighted areas, active nav, dashboard widgets
  },

  border: {
    default: '#E4E7EC',
    subtle: '#EEF2F6',
    blue: '#BFDBFE',
  },

  semantic: {
    success: {
      main: '#16A34A',
      light: '#DCFCE7',
      dark: '#166534',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#92400E',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
    },
    info: {
      main: '#0284C7',
      light: '#E0F2FE',
      dark: '#075985',
    },
  },

  accent: {
    yellow: '#FACC15',    // ISP Yellow (~10% usage: trophies, achievements, badges)
  },
};
```

---

## 2. Typography Rules & Font Hierarchy

### Font Family Loading
- **English UI & Numbers**: `Inter`, sans-serif
- **Bengali Body, Labels, Menus**: `Kalpurush`, sans-serif (`https://banglawebfonts.pages.dev/css/kalpurush.css`)
- **Bengali Headings**: `Abu Sayed`, sans-serif (`https://banglawebfonts.pages.dev/css/abu-sayed.css`)
- **Decorative Accents (Marketing / Notes only)**: `Bensen Handwriting` (`https://banglawebfonts.pages.dev/css/bensen-handwriting.css`)

### Size & Weight Hierarchy
```
Display      48–56px  Weight 700–800 (Dashboard / Landing hero)
H1           36px     Weight 700     Line Height 1.25
H2           30px     Weight 700     Line Height 1.3
H3           24px     Weight 700     Line Height 1.35
H4           20px     Weight 700     Line Height 1.4
H5           18px     Weight 600
Body Large   17px     Weight 400
Body (Def)   16px     Weight 400     Line Height 1.6   <-- Mandatory default
Body Small   14px     Weight 400     Line Height 1.55
Labels       14px     Weight 600
Caption      13px     Weight 400     Line Height 1.4   <-- Absolute minimum
```

---

## 3. Sizing, Radii & Spacing Standards

- **Buttons**:
  - Primary: Height `44px`, horizontal padding `18px`, font `15px`, radius `8px`.
  - Large CTA: Height `48px`, font `16px`.
  - Small: Height `36px`, font `14px`.
  - Never use cramped 28px buttons.
- **Form Inputs**:
  - Height `48–52px`, font `16px`, label `14px` weight 600, helper text `13px`.
- **Tables (DataGrid)**:
  - Header height `48px`, row height `56–64px`.
  - Primary text `15px`, secondary `14px`.
- **Status Chips**:
  - Height `28–30px`, font `13px`, padding `10px`. Semantic background/text colors.
- **Cards**:
  - Pure white `#FFFFFF`, border `1px solid #E4E7EC`, radius `12px`, padding `24px`.
  - Subtle shadow: `0 1px 3px rgba(16, 24, 40, 0.06)`.
- **Layout Spacing**:
  - Desktop page padding: `32px`, section spacing `32–40px`, card gap `20–24px`.
  - Mobile page padding: `20px`, card gap `16px`.
- **Sidebar**:
  - Pure white `#FFFFFF`, border-right `1px solid #E4E7EC`.
  - Active item: background `#EFF6FF`, text `#1D4ED8`, icon `#2563EB`.
- **Topbar**:
  - Pure white `#FFFFFF`, height `68px`, border-bottom `1px solid #E4E7EC`.
- **Icons**:
  - Exclusively MUI Rounded icons (`*Rounded`).
