---
name: Luminous Quest
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  stat-counter:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '800'
    lineHeight: 24px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes a dual-mode pedagogical ecosystem: an intrinsically motivating, game-forward learning quest for high school students paired with an uncluttered, reassuring oversight cockpit for parents. 

The stylistic framework blends **Tactile / Contemporary Gamification** with crisp **Editorial Minimalism**. Rather than childish tropes, the interface treats Grade 9 learners with dignity—evoking the craft of premium role-playing games and contemporary mobile consumer apps. Visual feedback loops rely on tactile dimensional cues (subtle bottom-beveled button edges, layered map paths, jewel-like status gems) contrasted against deep, breathable backdrops. For parents, the mood shifts into thoughtful composure: clarity, progress trajectories, and quiet affirmation rather than high-anxiety metrics.

## Colors

The palette balances vibrant dynamic game states with clinical readability:

- **Primary (`#4F46E5` / `#6366F1`)**: The Adventure Vector. Used for primary narrative actions, path advancement, unlocked questlines, and energetic focus targets.
- **Secondary (`#10B981`)**: The Mastery Emerald. Communicates concept retention, perfect test runs, completed nodes, and overall curriculum proficiency.
- **Tertiary (`#F59E0B`)**: The Momentum Gold. Expresses ephemeral rewards, daily streaks, XP counters, and level progression chests.
- **Supportive Accent (Coral / Rose `#F43F5E`)**: Diagnostic feedback for incorrect responses and focal revision zones without feeling punitive.
- **Neutrals & Surfaces (`#0F172A`, `#1E293B`, `#F8FAFC`, `#FFFFFF`)**: Deep slate foundations provide high-contrast legibility for gaming modules, while cool airy alabaster (`#F8FAFC`) gives parent analytics room to breathe.

## Typography

Plus Jakarta Sans powers the entire typographic spectrum, lending friendly approachability paired with structural authority. 

Numeric readouts—XP values, streak tallies, percentages, and countdown clocks—utilize the `stat-counter` and `label` styles with tabular figure alignment (`font-variant-numeric: tabular-nums`) to prevent jittering during animated counters. Headlines maintain tight negative letter spacing for punchy visual weight on mobile cards, while body tiers prioritize spacious leading to lower cognitive load during dense multi-step logic problems.

## Layout & Spacing

The spatial architecture is designed mobile-first as a Progressive Web App (PWA), constrained to a maximum centered canvas of 480px on larger displays to preserve native ergonomic thumb reach.

- **Grid & Alignments**: A dynamic 4-column fluid mobile grid scaling to an 8-column layout on tablets. Vertical rhythm follows an explicit 4px/8px modular scale.
- **Safe Area Insets**: Layout frames reserve dynamic bottom clearance (`env(safe-area-inset-bottom) + 64px`) to accommodate the persistent navigation dock without masking content.
- **Gutter & Margins**: Dynamic gutter shifts (`0.75rem` on sub-380px viewports up to `1rem` standard) ensure question option tiles and dual-column dashboard cards never feel cramped against phone hardware bezels.

## Elevation & Depth

Visual hierarchy employs a hybrid system of physical pushable offsets (tactile 3D base depth) combined with ambient colored luminescence:

- **Level 0 (Canvas)**: Base floor (`#F8FAFC` in light mode, `#0F172A` in quest mode) with no elevation.
- **Level 1 (Resting Cards)**: Soft volumetric presence using dual shadows: `0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)` bordered by a 1px inner hairline stroke (`rgba(255, 255, 255, 0.8)` or slate equivalent).
- **Level 2 (Tactile Quest Elements)**: Interactive learning nodes, reward chests, and interactive option pills feature physical bottom lips formed via solid shadow offset (`box-shadow: 0 4px 0 0 var(--border-darkened)`). When pressed, elements translate 3px down with the shadow collapsing to 1px.
- **Level 3 (Floating Bars & Modals)**: Bottom floating navigation and milestone celebrations utilize diffused ambient halos tinted to the brand hue: `0 12px 32px -4px rgba(79, 70, 229, 0.18)`.

## Shapes

The design system standardizes on Rounded geometry (Base radius: 8px / `0.5rem`).

- **Surface Panels & Content Cards**: Bound by `rounded-lg` (16px / `1rem`), providing a welcoming hand-held aesthetic.
- **Quest Nodes & Action Pills**: Fully rounded pill formats (`9999px`) are reserved exclusively for completion nodes, streak pills, and high-priority primary buttons to signify interactive playability.
- **Progress Trackers**: Capsule ends with strict rounded interior bars to ensure filled states remain harmonious with empty background tracks.

## Components

### Action Buttons
- **Primary Game Button**: Dynamic Indigo base with a 4px darker bottom lip (`#3730A3`). White bold label, capitalized with subtle tracking. Active/pressed state physically shifts `translateY(3px)` with a 1px border reduction to provide haptic visual satisfaction.
- **Secondary / Ghost**: White or Slate background with an explicit 2px border matching the respective domain color (Amber for quest chests, Emerald for reviews).

### Learning Roadmaps & Nodes
- **Path Nodes**: Circular 64x64px interactive stones. Active current nodes feature a radiant pulsing ring (`#4F46E5` with 50% opacity animation). Completed nodes display the Emerald `#10B981` fill with an embossed golden star. Locked nodes adopt an inactive slate tint with a subtle lock glyph.
- **Path Connector**: 6px curved SVG dashed or continuous track linking nodes, dynamically filling with emerald gradient as modules are conquered.

### Progress & Streak Badges
- **Streak Header Module**: Compact floating pill displaying an energetic amber flame icon, numerical value in `stat-counter`, and a micro XP bar embedded inside the top app bar.
- **Continuous Progress Track**: 12px height track with a dark backdrop track (`rgba(15, 23, 42, 0.08)`) and an animated, glossy gradient fill (`#10B981` to `#34D399`) sporting a rounded end-cap.

### Parent Analytics Cards
- **Overview Tiles**: Crisp white cards with 1px slate-200 boundary strokes. Key metrics (Study Time, Accuracy Delta, Mastery Distribution) avoid gamified skeuomorphism in favor of clear data visualization: sparklines, categorized subject chips, and constructive insight alerts (e.g., "Algebra Polynomials needs revision" highlighted with an unobtrusive rose wash).

### Bottom Navigation Bar (PWA Dock)
- **Floating Dock**: Suspended 12px above the viewport bottom with a frosted glass backdrop (`backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.88)`). Houses 4 primary destinations: Quest Map, Practice Arena, Leaderboard/Clan, and Parent Portal. Active destination is distinguished by a filled indicator and miniature amber grounding dot.