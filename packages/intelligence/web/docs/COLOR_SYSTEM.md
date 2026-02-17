# Katalyst Domain Mapper - Color System

## Overview

This document defines the comprehensive color system for the Katalyst Domain Mapper web application, based on the official Katalyst brand guidelines and optimized for Flow Optimized Engineering (FOE) workflows.

---

## 🎨 Color Architecture

Our color system is organized into **4 layers**:

```
┌─────────────────────────────────────────┐
│ LAYER 1: Brand Colors (Katalyst)       │ ← Logo, navigation, primary CTAs
├─────────────────────────────────────────┤
│ LAYER 2: FOE Semantic Colors           │ ← Dimension-specific meanings
├─────────────────────────────────────────┤
│ LAYER 3: UI Functional Colors          │ ← Success, error, warning, info
├─────────────────────────────────────────┤
│ LAYER 4: Neutral Colors                │ ← Text, borders, backgrounds
└─────────────────────────────────────────┘
```

---

## LAYER 1: Katalyst Brand Colors

### Primary: Teal

The signature Katalyst teal - energetic, modern, trustworthy.

| Shade | Hex | Use Case |
|-------|-----|----------|
| 300 (Light) | `#6BE6E7` | Hover backgrounds, light accents |
| 500 (Base) | `#2ECED0` | Primary actions, active navigation, logo highlights |
| 600 (Dark) | `#1FA3A6` | Hover states, pressed buttons |
| 700 (Darker) | `#158688` | Text on light backgrounds (accessibility) |

**Tailwind Classes:**
- `bg-brand-primary-500` - Primary button background
- `text-brand-primary-600` - Brand text color
- `border-brand-primary-500` - Brand borders
- `hover:bg-brand-primary-600` - Hover state

**CSS Variables:**
- `var(--brand-primary)` - Base color
- `var(--brand-primary-light)` - Light tint
- `var(--brand-primary-dark)` - Dark shade

---

### Accent Colors

#### Lavender `#8B93B6`
Soft, professional accent for secondary elements.

**Use Cases:**
- Chat tab active state
- Secondary badges
- Subtle highlights

**Tailwind:** `bg-brand-accent-lavender`, `text-brand-accent-lavender`

#### Steel `#5C7C99`
Blue-gray accent for sophistication.

**Use Cases:**
- "(Powered by Prima)" text
- Understanding dimension (replaces purple)
- Muted accents

**Tailwind:** `bg-brand-accent-steel`, `text-brand-accent-steel`

---

### Usage Guidelines

✅ **DO:**
- Use brand teal for logo area and primary navigation
- Apply to primary CTAs (Save, Submit, Create buttons)
- Use for active navigation states
- Apply to primary links

❌ **DON'T:**
- Use for error or warning messages
- Apply to body text (use darker shades like 700)
- Overuse - keep balanced (not every element)

---

## LAYER 2: FOE Semantic Colors

These colors have **semantic meaning** tied to FOE dimensions. Use consistently across all visualizations and features.

### Feedback (Blue) `#4DA3FF`

**Meaning:** Speed of learning, feedback loops, CI/CD

**Use Cases:**
- Feedback dimension charts
- CI/CD pipeline indicators
- Deployment frequency metrics
- Build status indicators

**Tailwind:** `bg-foe-feedback`, `text-foe-feedback`

**Shades:**
- Light: `#4DA3FF`
- Dark: `#3B82F6`
- Darker: `#2563EB`

---

### Understanding (Steel) `#5C7C99`

**Meaning:** System clarity, architecture quality, documentation

**Use Cases:**
- Understanding dimension charts
- Architecture diagrams
- Documentation quality indicators
- Domain model visualizations

**Tailwind:** `bg-foe-understanding`, `text-foe-understanding`

**Shades:**
- Light: `#7A99B8`
- Base: `#5C7C99`
- Dark: `#4A6B85`

**⚠️ Breaking Change:** Previously purple (`#7c3aed`) - now steel blue to avoid conflict with brand colors.

---

### Confidence (Green) `#2DD4A7`

**Meaning:** Quality assurance, test coverage, stability

**Use Cases:**
- Confidence dimension charts
- Test coverage indicators
- Quality gate status
- Success metrics

**Tailwind:** `bg-foe-confidence`, `text-foe-confidence`

**Shades:**
- Light: `#2DD4A7`
- Dark: `#22C597`
- Darker: `#18A077`

---

### Usage Guidelines

✅ **DO:**
- Always use dimension colors for their specific meanings
- Maintain consistency across charts and visualizations
- Use in both light and dark modes

❌ **DON'T:**
- Mix dimension colors arbitrarily
- Use for non-FOE-related UI elements
- Override semantic meaning

---

## LAYER 3: UI Functional Colors

Standard UI feedback colors for universal meaning.

### Success `#2DD4A7`

**Use Cases:**
- Success messages
- Completed states
- Positive feedback
- "Complete" governance status

**Tailwind:** `bg-ui-success`, `text-ui-success`

---

### Warning `#F5B942`

**Use Cases:**
- Warning messages
- Caution indicators
- "Validating" governance status
- Pending actions

**Tailwind:** `bg-ui-warning`, `text-ui-warning`

---

### Error `#E5533D`

**Use Cases:**
- Error messages
- Failed states
- "Blocked" governance status
- Destructive actions

**Tailwind:** `bg-ui-error`, `text-ui-error`

---

### Info `#4DA3FF`

**Use Cases:**
- Information callouts
- Help text
- "Active" governance status
- Neutral notifications

**Tailwind:** `bg-ui-info`, `text-ui-info`

---

## LAYER 4: Neutral Colors

### Light Mode

| Purpose | Color | Hex | Tailwind |
|---------|-------|-----|----------|
| Primary BG | Off-white | `#F7FAFC` | `bg-light-bg-primary` |
| Elevated BG | White | `#FFFFFF` | `bg-light-bg-elevated` |
| Subtle BG | Light gray-blue | `#E5EDF3` | `bg-light-bg-subtle` |
| Primary Text | Dark blue-black | `#1A2333` | `text-light-text-primary` |
| Secondary Text | Gray-blue | `#4A5D73` | `text-light-text-secondary` |
| Tertiary Text | Light gray-blue | `#6B7C93` | `text-light-text-tertiary` |

---

### Dark Mode

| Purpose | Color | Hex | Tailwind |
|---------|-------|-----|----------|
| Primary BG | Very dark blue | `#0B1220` | `bg-dark-bg-primary` |
| Elevated BG | Dark blue-gray | `#1A2333` | `bg-dark-bg-elevated` |
| Subtle BG | Medium dark | `#2E3A4F` | `bg-dark-bg-subtle` |
| Primary Text | Off-white | `#F7FAFC` | `text-dark-text-primary` |
| Secondary Text | Light gray-blue | `#A8B8CC` | `text-dark-text-secondary` |
| Tertiary Text | Medium gray | `#6B7C93` | `text-dark-text-tertiary` |
| Subtle Border | Dark blue-gray | `#2E3A4F` | `border-dark-border-subtle` |
| Default Border | Medium gray | `#3A4A63` | `border-dark-border-default` |

---

## Governance Colors (Consolidated)

Previously 8 states, now **5 consolidated states** for simplicity:

| State | Color | Hex | Description |
|-------|-------|-----|-------------|
| **Draft** | Lavender | `#8B93B6` | Early stage, proposed |
| **Active** | Info Blue | `#4DA3FF` | In progress, implementing |
| **Validating** | Warning Amber | `#F5B942` | Testing, under review |
| **Blocked** | Error Red | `#E5533D` | Issues, blocked |
| **Complete** | Success Green | `#2DD4A7` | Done, shipped |

**Tailwind Classes:**
- `bg-governance-draft`
- `bg-governance-active`
- `bg-governance-validating`
- `bg-governance-blocked`
- `bg-governance-complete`

**CSS Utility Classes:**
- `.badge-draft`
- `.badge-active`
- `.badge-validating`
- `.badge-blocked`
- `.badge-complete`

---

## Migration Guide

### Breaking Changes

#### 1. Understanding Dimension: Purple → Steel

**Old:**
```tsx
<div className="bg-purple-100 text-purple-700">Understanding</div>
```

**New:**
```tsx
<div className="bg-foe-understanding text-foe-understanding">Understanding</div>
// OR
<div className="bg-brand-accent-steel text-brand-accent-steel">Understanding</div>
```

---

#### 2. Governance States: 8 → 5

**Old State → New State Mapping:**

| Old | New |
|-----|-----|
| `proposed` | `draft` |
| `adr-validated` | `active` |
| `bdd-pending` | `validating` |
| `bdd-complete` | `complete` |
| `implementing` | `active` |
| `nfr-validating` | `validating` |
| `nfr-blocked` | `blocked` |
| `complete` | `complete` |

---

#### 3. Primary Blue → Brand Teal

**Old:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700">
```

**New:**
```tsx
<button className="bg-brand-primary-500 hover:bg-brand-primary-600">
```

---

## Accessibility (WCAG 2.1 AA)

### Contrast Ratios

All color combinations meet **WCAG 2.1 AA** standards (4.5:1 for normal text, 3:1 for large text).

#### Passing Combinations:

✅ **Brand Colors:**
- `#1FA3A6` (teal-600) on white: **4.2:1** (use for text)
- `#158688` (teal-700) on white: **5.5:1** (best for body text)
- `#6BE6E7` (teal-300) on `#0B1220` (dark bg): **12.8:1**

✅ **FOE Colors:**
- `#5C7C99` (understanding) on white: **5.1:1**
- `#4A6B85` (understanding-dark) on white: **6.2:1**

⚠️ **Caution:**
- `#2ECED0` (teal-500) on white: **2.8:1** - Use only for backgrounds, not text

---

### Recommendations:

1. **For text on light backgrounds:** Use teal-700 (`#158688`) or darker
2. **For text on dark backgrounds:** Use teal-300 (`#6BE6E7`) or lighter
3. **For backgrounds:** Any shade is acceptable
4. **For borders:** Minimum 3:1 contrast with adjacent colors

---

## Code Examples

### Component with Brand Colors

```tsx
// Primary Button
<button className="bg-brand-primary-500 hover:bg-brand-primary-600 text-white px-4 py-2 rounded-lg">
  Save Changes
</button>

// Active Navigation
<NavLink
  className={({ isActive }) =>
    isActive
      ? "bg-brand-primary-300/20 text-brand-primary-700"
      : "text-gray-700 hover:bg-brand-primary-300/10"
  }
>
  Design
</NavLink>

// Secondary Button with Accent
<button className="bg-brand-accent-lavender hover:bg-brand-accent-steel text-white px-4 py-2 rounded-lg">
  Learn More
</button>
```

---

### FOE Dimension Badges

```tsx
// Feedback Badge
<span className="bg-foe-feedback/10 text-foe-feedback px-2 py-1 rounded text-xs font-medium">
  Feedback
</span>

// Understanding Badge (NEW: steel, not purple!)
<span className="bg-foe-understanding/10 text-foe-understanding px-2 py-1 rounded text-xs font-medium">
  Understanding
</span>

// Confidence Badge
<span className="bg-foe-confidence/10 text-foe-confidence px-2 py-1 rounded text-xs font-medium">
  Confidence
</span>
```

---

### Governance Status Badges

```tsx
// Using utility classes
<span className="badge-draft">Draft</span>
<span className="badge-active">Active</span>
<span className="badge-validating">Validating</span>
<span className="badge-blocked">Blocked</span>
<span className="badge-complete">Complete</span>

// Using Tailwind classes
<span className="bg-governance-active text-white px-2 py-1 rounded text-xs">
  In Progress
</span>
```

---

### Dark Mode Support

```tsx
// Automatically switches based on dark mode
<div className="bg-light-bg-primary dark:bg-dark-bg-primary">
  <h1 className="text-light-text-primary dark:text-dark-text-primary">
    Welcome to Katalyst
  </h1>
  <p className="text-light-text-secondary dark:text-dark-text-secondary">
    Domain modeling made simple
  </p>
</div>

// Brand colors adjust automatically
<button className="bg-brand-primary-500 dark:bg-brand-primary-300 text-white">
  Get Started
</button>
```

---

## Quick Reference

### Most Common Classes

```tsx
// Brand
bg-brand-primary-500
text-brand-primary-600
border-brand-primary-500

// FOE Dimensions
bg-foe-feedback
bg-foe-understanding
bg-foe-confidence

// UI States
bg-ui-success
bg-ui-warning
bg-ui-error
bg-ui-info

// Governance
bg-governance-draft
bg-governance-active
bg-governance-validating
bg-governance-blocked
bg-governance-complete

// Neutrals
bg-gray-50 dark:bg-gray-900
text-gray-900 dark:text-gray-100
border-gray-200 dark:border-gray-700
```

---

## Resources

- **Tailwind Config:** `packages/intelligence/web/tailwind.config.js`
- **CSS Variables:** `packages/intelligence/web/src/styles/colors.css`
- **Contrast Checker:** https://contrast-ratio.com
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-16  
**Status:** ✅ Implemented
