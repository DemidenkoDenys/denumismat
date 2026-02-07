# Denumismat - Technical Specification

**Version:** 1.0
**Last Updated:** February 7, 2026
**Language:** English

**Note:** All documentation files should begin their filename with a timestamp including seconds (for example: 2026-02-07T13-33-45_spec.md). Filenames and front-matter timestamps must include seconds for accurate ordering.

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Component Architecture](#component-architecture)
5. [Features](#features)
6. [Updates & Changes](#updates--changes)

---

## Overview

Denumismat is a modern Angular-based coin catalog application designed for managing and displaying numismatic collections. The application features a responsive design, dark theme support, and an interactive coin selection system.

### Key Objectives
- High-performance single-page application
- Responsive design (mobile-first)
- Dark theme support
- Interactive coin selection
- User-friendly interface

### Styling Guidelines
- Implement new styles for both light and dark themes when applicable. If a change is not explicitly theme-specific, apply it to light and dark modes.

---

## Project Structure

```
denumismat/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── introduction/
│   │   │   ├── filters/
│   │   │   └── coins/
│   │   ├── services/
│   │   ├── models/
│   │   ├── app.ts
│   │   └── app.routes.ts
│   ├── styles/
│   │   ├── themes/
│   │   │   └── dark.scss
│   │   ├── components/
│   │   ├── normalize.scss
│   │   └── styles.scss
│   └── index.html
├── docs/
│   ├── en/
│   │   ├── spec.md
│   │   └── updates/
│   └── uk/
│       ├── spec.md
│       └── updates/
└── angular.json
```

---

## Technology Stack

- **Framework:** Angular 21 (Standalone Components)
- **Language:** TypeScript 5.9
- **Styling:** SCSS with CSS Custom Properties
- **Change Detection:** OnPush Strategy
- **State Management:** Signals (local)
- **Build Tool:** Angular CLI
- **Package Manager:** npm 11.7.0

---

## Component Architecture

### Core Components

#### HeaderComponent
- **Purpose:** Main navigation header with search and language selection
- **Features:**
  - Brand/Logo with shimmer effect
  - Search functionality
  - Language selector (EN, RO, DE, FR)
  - Dark theme toggle button
- **Inputs:** `searchQuery`, `currentLanguage`
- **Outputs:** `onSearchChange`, `onLanguageChange`
- **State:** `isLanguageMenuOpen`, `isDarkMode`

#### IntroductionComponent
- **Purpose:** Hero section (60vh height)
- **Features:** Gradient background, centered typography
- **State:** None (static content)

#### FiltersComponent
- **Purpose:** Sticky filter controls below header
- **Features:**
  - Country text input
  - Price range sliders (0-10000)
  - Category toggle buttons (UNC, Rare, Sale)
- **Outputs:** `filterChange`

#### CoinGridComponent
- **Purpose:** Responsive grid displaying coin cards
- **Features:**
  - Responsive layout (1-4 columns)
  - Selection tracking
  - Summary emission
- **Grid Breakpoints:**
  - 1 col: < 600px
  - 2 cols: 600px - 899px
  - 3 cols: 900px - 1199px
  - 4 cols: ≥ 1200px

#### CoinCardComponent
- **Purpose:** Individual interactive coin card
- **Features:**
  - Entire card is selectable (clickable)
  - Checkbox for selection
  - High-res image preview on hover
  - Expandable details section
  - Keyboard navigation support
- **Inputs:** `coin`, `selected`
- **Outputs:** `selectedChange`

#### SelectionBarComponent
- **Purpose:** Floating action bar
- **Features:**
  - Selected coin count display
  - Total weight display
  - Book and Order buttons
- **Inputs:** `count`, `totalWeight`
- **Outputs:** `onBook`, `onOrder`

#### FooterComponent
- **Purpose:** Page footer at the bottom of the layout
- **Features:** About section, info list, embedded map

---

## Features

### 1. Dark Theme Support
- Automatic system preference detection
- Manual toggle via header button
- Persistent user preference (localStorage)
- Applied via CSS custom properties
- Color palette optimized for readability

### 2. Interactive Coin Selection
- Click anywhere on the card to select/deselect
- Visual feedback for selected state
- Checkbox with keyboard support
- Smooth transitions and hover effects

### 3. Responsive Design
- Mobile-first approach
- Fluid grid layout
- Adaptive spacing and typography
- Separate styles for various breakpoints

### 4. Accessibility Features
- Semantic HTML (role, aria-*)
- Keyboard navigation support (Tab, Space, Enter)
- Focus indicators
- Screen reader friendly

### 5. Search & Filtering
- Real-time search input
- Country filtering
- Price range filtering
- Category tag selection

---

## Updates & Changes

### Recent Updates

For detailed information about each update, refer to the individual update files in the `updates/` folder:

1. **Dark Theme Implementation** - `updates/01-dark-theme.md`
2. **Dark Theme Toggle in Header** - `updates/02-dark-theme-header.md`
3. **Selectable Coin Cards** - `updates/03-selectable-coin-cards.md`

---

## Color Palette

### Light Theme (Default)
- Primary: `#007bff` (Blue)
- Primary Dark: `#0056b3`
- Secondary: `#6c757d`
- Background: `#ffffff` (White)
- Surface: `#f8f9fa` (Light Gray)
- Border: `#dee2e6` (Light Gray)
- Text: `#333333` (Dark Gray)
- Text Light: `#666666`
- Text Muted: `#999999`

### Dark Theme
- Primary: `#64B5F6` (Light Blue)
- Primary Dark: `#42A5F5`
- Secondary: `#90CAF9`
- Background: `#121212` (Very Dark)
- Surface: `#1E1E1E` (Dark)
- Border: `#424242` (Medium Dark)
- Text: `#E0E0E0` (Light Gray)
- Text Light: `#B0B0B0`
- Text Muted: `#757575` (Medium Gray)

---

## Styling Architecture

### SCSS Organization
- **normalize.scss** - Global reset and CSS custom properties
- **styles.scss** - Main entry point
- **themes/dark.scss** - Dark theme overrides
- **components/** - Component-specific styles

### CSS Custom Properties
All colors and spacing use CSS custom properties for easy theming and consistency.

---

## Development Workflow

1. **Start Development Server**
   ```bash
   npm start
   ```
   Server runs on http://localhost:4200 with hot reload enabled.

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Known Limitations

- Mock coin data (no Firebase integration yet)
- Simulated high-res image loading
- Language selector without translations
- No persistent user data storage

---

## Future Enhancements

- Firebase Firestore integration
- Cloud Storage for images
- Authentication (Google/Email)
- i18n implementation
- Theme color customization
- Performance optimization
- PWA features

---

## Contributing

When making updates, please:
1. Follow the component architecture
2. Use CSS custom properties for colors
3. Maintain OnPush change detection
4. Add JSDoc comments for public methods
5. Test in both light and dark themes
6. Update documentation in both languages

---

## License

All rights reserved © 2026 Denumismat
