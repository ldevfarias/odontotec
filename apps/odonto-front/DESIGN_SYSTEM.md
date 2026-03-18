# 🎨 OdontoTec Design System

> **Medical Premium UI Design System** - Comprehensive guide for building consistent, accessible, and beautiful interfaces.

---

## 📚 Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Components](#components)
7. [Custom Utilities](#custom-utilities)
8. [Usage Examples](#usage-examples)

---

## 🎨 Color System

### Semantic Colors

Our color system uses semantic naming for better maintainability and consistency.

#### Primary - Medical Teal
```css
--primary: #41b883           /* Professional Medical Teal */
--primary-foreground: #ffffff
```
**Usage:** Primary actions, brand elements, navigation highlights
**Classes:** `bg-primary`, `text-primary`, `border-primary`

#### Secondary - Light Blue-Grey
```css
--secondary: oklch(0.96 0.01 250)
--secondary-foreground: oklch(0.35 0.08 250)
```
**Usage:** Secondary buttons, subtle backgrounds
**Classes:** `bg-secondary`, `text-secondary-foreground`

#### Muted - Neutral Grey
```css
--muted: oklch(0.96 0.01 250)
--muted-foreground: oklch(0.55 0.04 250)
```
**Usage:** Disabled states, placeholder text, subtle elements
**Classes:** `bg-muted`, `text-muted-foreground`

#### Accent - Soft Highlight
```css
--accent: oklch(0.94 0.02 250)
--accent-foreground: oklch(0.35 0.08 250)
```
**Usage:** Hover states, highlights, subtle emphasis
**Classes:** `bg-accent`, `text-accent-foreground`

### Semantic Status Colors

#### Success - Medical Green
```css
--success: oklch(0.65 0.15 150)
--success-foreground: oklch(0.98 0 0)
```
**Usage:** Success messages, completed states, positive indicators
**Classes:** `bg-success`, `text-success`

#### Warning - Soft Orange
```css
--warning: oklch(0.75 0.15 80)
--warning-foreground: oklch(0.13 0.02 260)
```
**Usage:** Warning messages, pending actions, caution indicators
**Classes:** `bg-warning`, `text-warning`

#### Destructive - Soft Red
```css
--destructive: oklch(0.6 0.18 25)
--destructive-foreground: oklch(0.98 0 0)
```
**Usage:** Error messages, delete actions, critical alerts
**Classes:** `bg-destructive`, `text-destructive`

#### Info - Info Blue
```css
--info: oklch(0.55 0.12 230)
--info-foreground: oklch(0.98 0 0)
```
**Usage:** Information messages, tooltips, help text
**Classes:** `bg-info`, `text-info`

### Grayscale Palette

Full grayscale system for consistent neutral colors:

| Token | Value | Usage |
|-------|-------|-------|
| `gray-50` | `#fafafa` | Subtle backgrounds |
| `gray-100` | `#f8f9fa` | Borders, dividers |
| `gray-200` | `#e9ecef` | Hover backgrounds |
| `gray-300` | `#dee2e6` | Disabled backgrounds |
| `gray-400` | `#ced4da` | Disabled text |
| `gray-500` | `#adb5bd` | Secondary text |
| `gray-600` | `#868e96` | Body text |
| `gray-700` | `#495057` | Headings |
| `gray-800` | `#343a40` | Primary headings |
| `gray-900` | `#1c1f23` | Dark text |

**Classes:** `bg-gray-100`, `text-gray-600`, `border-gray-200`

### Chart Colors

```css
--chart-1: #41b883    /* Primary Teal */
--chart-2: oklch(0.45 0.14 250)    /* Medical Blue */
--chart-3: oklch(0.45 0.08 280)    /* Purple-Blue */
--chart-4: oklch(0.75 0.15 80)     /* Soft Orange */
--chart-5: oklch(0.75 0.15 150)    /* Soft Green */
```

**Usage:** Data visualizations, charts, graphs
**Classes:** `bg-chart-1`, `text-chart-2`, `fill-chart-3`

---

## ✍️ Typography

### Font Families

- **Sans Serif (Primary):** Roboto
- **Monospace (Code):** Roboto (Alternative)

**Classes:** `font-sans`, `font-mono`

### Heading Styles

Use custom utility classes for consistent heading typography:

```tsx
<h1 className="heading-1">Main Page Title</h1>
<h2 className="heading-2">Section Title</h2>
<h3 className="heading-3">Subsection Title</h3>
<h4 className="heading-4">Component Title</h4>
```

| Utility | Size | Weight | Letter Spacing | Usage |
|---------|------|--------|----------------|-------|
| `heading-1` | 36px | 700 | -0.02em | Page titles |
| `heading-2` | 30px | 700 | -0.01em | Section headers |
| `heading-3` | 24px | 600 | -0.01em | Card headers |
| `heading-4` | 20px | 600 | 0 | Subsections |

### Body Text Styles

```tsx
<p className="body-large">Important content</p>
<p className="body-regular">Standard text</p>
<p className="body-small">Helper text</p>
<span className="caption">Meta information</span>
```

| Utility | Size | Line Height | Usage |
|---------|------|-------------|-------|
| `body-large` | 16px | 1.6 | Important content |
| `body-regular` | 14px | 1.5 | Standard text |
| `body-small` | 13px | 1.5 | Helper text |
| `caption` | 12px | 1.4 | Meta info, labels |

---

## 📏 Spacing

Consistent spacing scale for margins, padding, and gaps:

| Token | Value | Classes |
|-------|-------|---------|
| `spacing-0` | 0 | `p-0`, `m-0` |
| `spacing-1` | 4px | `p-1`, `m-1`, `gap-1` |
| `spacing-2` | 8px | `p-2`, `m-2`, `gap-2` |
| `spacing-3` | 12px | `p-3`, `m-3`, `gap-3` |
| `spacing-4` | 16px | `p-4`, `m-4`, `gap-4` |
| `spacing-5` | 20px | `p-5`, `m-5`, `gap-5` |
| `spacing-6` | 24px | `p-6`, `m-6`, `gap-6` |
| `spacing-8` | 32px | `p-8`, `m-8`, `gap-8` |
| `spacing-10` | 40px | `p-10`, `m-10` |
| `spacing-12` | 48px | `p-12`, `m-12` |
| `spacing-16` | 64px | `p-16`, `m-16` |
| `spacing-20` | 80px | `p-20`, `m-20` |

### Spacing Guidelines

- **Component padding:** Use `p-4` or `p-6`
- **Card padding:** Use `p-6` or `p-8`
- **Section spacing:** Use `space-y-8` or `space-y-12`
- **Button padding:** Use `px-4 py-2` or `px-6 py-3`

---

## 🔲 Border Radius

Consistent border radius scale for rounded corners:

| Token | Value | Classes |
|-------|-------|---------|
| `radius-xs` | 6px | `rounded-xs` |
| `radius-sm` | 8px | `rounded-sm` |
| `radius-md` | 10px | `rounded-md` |
| `radius-lg` | 12px | `rounded-lg` |
| `radius-xl` | 16px | `rounded-xl` |
| `radius-2xl` | 20px | `rounded-2xl` |
| `radius-3xl` | 24px | `rounded-3xl` |
| `radius-full` | 9999px | `rounded-full` |

### Border Radius Guidelines

- **Buttons:** `rounded-lg` (12px)
- **Cards:** `rounded-xl` (16px) or `rounded-2xl` (20px)
- **Input fields:** `rounded-lg` (12px)
- **Avatars:** `rounded-full`
- **List items:** `rounded-md` (10px) or `rounded-lg` (12px)

---

## ✨ Shadows

Elevation system using consistent shadow tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | Cards, panels |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Elevated cards |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | Large modals |
| `shadow-2xl` | `0 25px 50px rgba(0,0,0,0.25)` | Maximum elevation |

**Usage in CSS:**
```css
.my-card {
  box-shadow: var(--shadow-sm);
}
```

**Usage with Tailwind:**
```tsx
<div className="shadow-sm hover:shadow-md transition-shadow">
  Card content
</div>
```

---

## 🧩 Components

### Buttons

Use the shadcn Button component with variants:

```tsx
import { Button } from "@/components/ui/button";

// Primary button
<Button>Primary Action</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Outline button
<Button variant="outline">Outline</Button>

// Ghost button
<Button variant="ghost">Ghost</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// With icon
<Button className="gap-2">
  <Plus className="h-4 w-4" />
  New Item
</Button>
```

### Cards

Use the Card component with consistent structure:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

Or use the custom utility:

```tsx
<div className="card-surface p-6">
  <h3 className="heading-4 mb-4">Title</h3>
  <p className="body-regular">Content</p>
</div>
```

### Inputs

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="email@example.com" 
    className="input-field"
  />
</div>
```

### Badges

Use custom badge utilities for status indicators:

```tsx
<span className="badge-primary">Active</span>
<span className="badge-success">Completed</span>
<span className="badge-warning">Pending</span>
<span className="badge-destructive">Error</span>
```

---

## 🛠 Custom Utilities

### Surface Utilities

#### `card-surface`
Standard card background with border and shadow:
```tsx
<div className="card-surface p-6">
  Content
</div>
```

#### `card-surface-hover`
Interactive card with hover effect:
```tsx
<div className="card-surface-hover p-6 cursor-pointer">
  Clickable content
</div>
```

#### `glass-surface`
Glassmorphism effect with backdrop blur:
```tsx
<div className="glass-surface p-6">
  Frosted glass effect
</div>
```

### Interactive Utilities

#### `icon-button`
Consistent icon button styling:
```tsx
<button className="icon-button">
  <Settings className="h-5 w-5" />
</button>
```

#### `list-item`
Standard list item with hover:
```tsx
<div className="list-item">
  List item content
</div>
```

#### `list-item-selected`
Selected/active list item:
```tsx
<div className="list-item-selected">
  Active item
</div>
```

### Layout Utilities

#### `divider-vertical`
Vertical separator:
```tsx
<div className="flex items-center gap-4">
  <span>Item 1</span>
  <div className="divider-vertical" />
  <span>Item 2</span>
</div>
```

#### `divider-horizontal`
Horizontal separator:
```tsx
<div>
  <div>Section 1</div>
  <div className="divider-horizontal" />
  <div>Section 2</div>
</div>
```

#### `section-header`
Section title styling:
```tsx
<h3 className="section-header">NAVIGATION</h3>
```

---

## 💡 Usage Examples

### Example 1: Patient Card

```tsx
function PatientCard({ patient }) {
  return (
    <div className="card-surface-hover p-6 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <h3 className="heading-4">{patient.name}</h3>
        <span className="badge-success">Active</span>
      </div>
      <p className="body-small text-muted-foreground mb-2">
        {patient.email}
      </p>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Phone className="h-4 w-4" />
        <span className="caption">{patient.phone}</span>
      </div>
    </div>
  );
}
```

### Example 2: Stats Card

```tsx
function StatsCard({ title, value, icon: Icon, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="body-small font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="heading-2">{value}</div>
        <p className="caption text-success">
          +{trend}% from last month
        </p>
      </CardContent>
    </Card>
  );
}
```

### Example 3: Action Bar

```tsx
function ActionBar() {
  return (
    <div className="card-surface px-6 py-4">
      <div className="flex items-center gap-4">
        <Input 
          placeholder="Search..." 
          className="input-field max-w-sm"
        />
        
        <div className="divider-vertical" />
        
        <button className="icon-button">
          <Filter className="h-5 w-5" />
        </button>
        
        <button className="icon-button">
          <Settings className="h-5 w-5" />
        </button>
        
        <div className="ml-auto">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Patient
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Example 4: Form Layout

```tsx
function PatientForm() {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          placeholder="John Doe" 
          className="input-field"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            className="input-field"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            type="tel" 
            className="input-field"
          />
        </div>
      </div>
      
      <div className="divider-horizontal" />
      
      <div className="flex gap-3">
        <Button type="submit">Save Patient</Button>
        <Button type="button" variant="outline">Cancel</Button>
      </div>
    </form>
  );
}
```

---

## 📱 Responsive Design

### Breakpoints

Follow Tailwind's default breakpoints:

- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
- **2xl:** 1536px

### Mobile-First Approach

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

### Hide on Mobile

```tsx
<div className="hidden md:block">
  Desktop only content
</div>
```

---

## ♿ Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:
- **Text:** Minimum 4.5:1 contrast ratio
- **Large text (18px+):** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio

### Focus States

All interactive elements have visible focus indicators:
```tsx
<button className="focus:outline-ring/50 focus:ring-4 focus:ring-primary/10">
  Button
</button>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:
- Use semantic HTML (`<button>`, `<a>`, etc.)
- Maintain logical tab order
- Provide skip links for navigation

---

## 🎯 Best Practices

### 1. Use Semantic Colors
✅ **Do:** `bg-primary`, `text-destructive`, `border-muted`
❌ **Don't:** `bg-gray-100`, `text-red-500`

### 2. Use Design Tokens
✅ **Do:** `rounded-xl`, `shadow-sm`, `gap-4`
❌ **Don't:** `rounded-[16px]`, hardcoded shadows

### 3. Consistent Spacing
✅ **Do:** `space-y-6`, `gap-4`, `p-6`
❌ **Don't:** `space-y-[24px]`, mixed spacing values

### 4. Component Composition
✅ **Do:** Use shadcn components as base, extend with utilities
❌ **Don't:** Recreate components from scratch

### 5. Responsive Design
✅ **Do:** Mobile-first, use breakpoint prefixes
❌ **Don't:** Desktop-only layouts

---

## 🔄 Dark Mode

All colors automatically adapt to dark mode using the `.dark` class. The system uses OKLCH color space for perceptually uniform brightness adjustments.

**No additional work needed** - just use the semantic color tokens!

```tsx
// Automatically adapts to dark mode
<div className="bg-background text-foreground">
  <Card>
    <CardHeader>
      <CardTitle>Auto Dark Mode</CardTitle>
    </CardHeader>
  </Card>
</div>
```

---

## 📖 Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OKLCH Color Picker](https://oklch.com)

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-18  
**Maintained by:** OdontoTec Development Team
