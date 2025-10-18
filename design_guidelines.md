# Design Guidelines: MLM Management Platform

## Design Approach
**System-Based Approach** drawing from modern SaaS dashboard patterns, inspired by Linear's clean professionalism, Stripe's data clarity, and Material Design principles for enterprise applications. This utility-focused platform prioritizes efficiency, data density, and professional aesthetics over creative expression.

## Core Design Philosophy
This is a business productivity tool requiring trustworthy, stable design that facilitates rapid data processing and decision-making. Design serves functionality—every visual choice supports efficient workflows and clear information hierarchy.

---

## Color Palette

### Light Mode
- **Background**: 0 0% 100% (pure white)
- **Surface**: 0 0% 98% (slight gray for cards)
- **Border**: 240 6% 90% (subtle dividers)
- **Text Primary**: 240 10% 10% (near black)
- **Text Secondary**: 240 5% 45% (muted gray)
- **Primary Brand**: 217 91% 60% (professional blue)
- **Success**: 142 71% 45% (commission/sales positive)
- **Warning**: 38 92% 50% (inventory alerts)
- **Error**: 0 84% 60% (critical issues)

### Dark Mode
- **Background**: 240 10% 4% (rich dark)
- **Surface**: 240 8% 8% (elevated cards)
- **Border**: 240 6% 16% (subtle dividers)
- **Text Primary**: 0 0% 98% (off-white)
- **Text Secondary**: 240 5% 65% (muted light)
- **Primary Brand**: 217 91% 65% (slightly brighter blue)
- **Success**: 142 76% 50%
- **Warning**: 38 92% 55%
- **Error**: 0 84% 65%

---

## Typography

### Font Families
- **Primary**: 'Inter' via Google Fonts - modern, highly legible at all sizes, excellent for data-heavy interfaces
- **Monospace**: 'JetBrains Mono' for numerical data, IDs, codes

### Scale & Usage
- **Display (Dashboard Headers)**: text-3xl font-bold (30px)
- **Page Titles**: text-2xl font-semibold (24px)
- **Section Headers**: text-xl font-semibold (20px)
- **Card Titles**: text-lg font-medium (18px)
- **Body Text**: text-base font-normal (16px)
- **Table Data**: text-sm font-normal (14px)
- **Labels/Captions**: text-xs font-medium uppercase tracking-wide (12px)
- **Numerical Data**: font-mono to maintain alignment in tables and dashboards

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistent rhythm
- **Micro spacing** (within components): p-2, gap-2
- **Component spacing**: p-4, gap-4, mb-6
- **Section spacing**: p-6, py-8, gap-8
- **Major sections**: p-8, py-12, gap-12
- **Page margins**: px-6 md:px-8 lg:px-12

### Dashboard Grid Structure
- **Sidebar Navigation**: Fixed 256px (w-64) on desktop, slide-over drawer on mobile
- **Main Content Area**: flex-1 with max-w-7xl centered container
- **Stats Cards Grid**: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6
- **Data Tables**: Full width with horizontal scroll on mobile
- **Chart Sections**: grid-cols-1 lg:grid-cols-2 gap-6 for dual charts

---

## Component Library

### Navigation
- **Sidebar**: Vertical navigation with icon + label, active state with background highlight and left border accent
- **Top Bar**: User profile dropdown, dark mode toggle, notification bell, search bar (w-80)
- **Breadcrumbs**: text-sm with chevron separators for deep navigation

### Data Display
- **Stats Cards**: Elevated surface (shadow-sm) with icon, large numerical value (text-3xl font-bold mono), label, and trend indicator (↑/↓ with percentage change)
- **Tables**: Striped rows (alternate background), sticky header, row hover states, sortable columns with arrows, pagination footer
- **Charts**: Chart.js with matching color palette, tooltips on hover, legend positioned top-right, responsive container with min-height
- **Sales Hierarchy Tree**: Card-based layout showing network levels with connecting lines, profile images for representatives, commission amounts in monospace

### Forms & Inputs
- **Text Inputs**: border-2 with focus:ring-2 focus:border-primary, consistent padding (px-4 py-2.5), dark mode with white text on dark surface
- **Select Dropdowns**: Custom styled with chevron icon, same border treatment as inputs
- **Action Buttons**: 
  - Primary: bg-primary text-white with hover brightness increase
  - Secondary: border-2 border-primary text-primary with hover:bg-primary/10
  - Danger: bg-error text-white
  - Size variants: px-4 py-2 (default), px-6 py-3 (large)
- **Toggle Switches**: For dark mode and binary settings, primary color when active

### Cards & Containers
- **Dashboard Cards**: Rounded corners (rounded-lg), white background in light mode, shadow-sm elevation, p-6 padding
- **Modal Dialogs**: Centered overlay with backdrop blur, max-w-2xl, slide-up animation
- **Empty States**: Centered icon (text-6xl opacity-20), message, and action button

### Feedback Elements
- **Toast Notifications**: Fixed top-right, slide-in animation, auto-dismiss after 5s, color-coded by type
- **Loading States**: Skeleton screens matching content layout, pulsing animation
- **Badges**: Small pills for status (Active, Pending, Inactive), rounded-full px-3 py-1 text-xs

---

## AI Feature Integration

### Visual Treatment for AI Suggestions
- **AI Insight Cards**: Distinct sparkle icon (✨), subtle gradient border (from primary to purple), "AI Suggestion" label
- **Recommendation Lists**: Chip-style tags with confidence scores, click to apply
- **Predictive Charts**: Dashed lines for projected data, color-coded certainty zones

---

## Responsive Behavior

### Breakpoints
- **Mobile**: Single column, hamburger menu, stacked stats cards
- **Tablet (md)**: Two-column stats, visible sidebar on landscape
- **Desktop (lg)**: Full layout with persistent sidebar, four-column stats

### Mobile Optimizations
- Horizontal scrolling tables with sticky first column
- Bottom tab navigation instead of sidebar
- Collapsible chart filters
- Touch-friendly 44px minimum tap targets

---

## Animation Guidelines

**Minimize animations** for professional business context:
- **Allowed**: Subtle fade-ins on data load (200ms), smooth page transitions (300ms), button hover states
- **Avoid**: Unnecessary flourishes, attention-grabbing effects, long animation durations
- **Real-time Updates**: Gentle pulse on newly updated values, brief highlight then fade

---

## Data Visualization Standards

### Chart Configurations
- **Line Charts**: Sales trends over time, smooth curves, grid lines, time-based x-axis
- **Bar Charts**: Commission comparisons, category performance, horizontal bars for rankings
- **Donut Charts**: Inventory distribution, sales by category, center label with total
- **Color Coding**: Consistent across all charts (primary for main data, success for growth, warning for alerts)

---

## Dark Mode Implementation

All components must have explicit dark mode variants:
- Inputs: `dark:bg-gray-800 dark:text-white dark:border-gray-600`
- Tables: `dark:bg-gray-800` with `dark:hover:bg-gray-700` rows
- Cards: `dark:bg-gray-800 dark:border-gray-700`
- Text: `dark:text-gray-100` primary, `dark:text-gray-400` secondary
- Toggle in top bar with sun/moon icon, persisted to localStorage

---

## Accessibility Requirements

- WCAG AA contrast ratios (4.5:1 for text)
- Keyboard navigation for all interactive elements
- ARIA labels on icon-only buttons
- Focus indicators with 2px offset ring
- Screen reader text for chart data points

---

## Performance Considerations

- Lazy load charts below fold
- Virtualized scrolling for tables >100 rows
- Debounced search inputs (300ms)
- Optimistic UI updates before server confirmation
- CDN-hosted fonts and icon libraries