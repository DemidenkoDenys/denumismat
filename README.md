# Denumismat - Single Page Coin Catalog & Shop

Denumismat is a high-performance, single-page Angular application for browsing, filtering, and ordering coins. It features a responsive grid, real-time filtering, and deep integration with Firebase for data and image storage.

---

## 1. Technical Stack

- **Framework**: Angular 19+ (Standalone Components)
- **State Management**: NgRx Store (Signal-based)
- **Styling**: SCSS (Mobile-first, Responsive)
- **Change Detection**: `OnPush` Strategy
- **Backend**:
  - **Database**: Firebase Cloud Firestore
  - **Storage**: Firebase Cloud Storage
- **Auth**: Google/Email Firebase Authentication (Modal/In-page)
- **Localization**: Angular i18n
- **Icons**: Lucide-Angular / Heroicons
- **Theming**: Dark, Light, and Blue themes

---

## 2. Project Structure

```text
src/
├── app/
│   ├── components/       # Shared UI components
│   ├── services/         # Firestore, Storage, Auth services
│   ├── state/            # NgRx Store (Actions, Reducers, Selectors)
│   ├── config/           # Firebase and App configuration
│   ├── models/           # TypeScript Interfaces/Types
│   ├── app.ts            # Root Component
│   ├── app.routes.ts     # Routing configuration
│   └── app.config.ts     # App-wide providers
├── environments/         # Environment variables
└── assets/               # Local static assets & i18n files
```

---

## 3. Core Data Models

### `Coin` Interface
```typescript
interface Coin {
  id: string;
  name: string;
  year: number;
  price: number;
  weight: number;      // in grams
  description: string;
  imageUrl: string;    // Thumbnail/Low-res
  highResUrl?: string; // High-res for hover preview
  category: string[];  // e.g., ['UNC', 'Rare', 'Sale']
  country: string;
  isBooked: boolean;
}
```

### `FilterState`
```typescript
interface FilterState {
  searchQuery: string;
  country: string | null;
  priceRange: [number, number];
  tags: string[]; // ['UNC', 'Rare', 'Sale']
}
```

---

## 4. Component Architecture & Logic

### A. Header (Sticky)
- **Brand**: "Denumismat" text with a shimmer effect on hover.
- **Search**: Integrated search field affecting the grid in real-time.
- **Localization**: Flag icon with a dropdown for language selection.

### B. Introduction Section
- **UI**: Large hero-style section (60% viewport height).
- **Behavior**: Non-sticky, fades out or scrolls away.

### C. Filters Section (Sticky)
- **Sticky Trigger**: Locks under the Header when scrolled.
- **Controls**:
  - Country free text input.
  - Price range slider.
  - Toggle buttons for categories (UNC, Rare, Sale).
- **State**: Directly syncs with NgRx Store.

### D. Interactive Coin Grid
- **Layout**: Responsive (1 col Mobile -> 4 cols Desktop).
- **Coin Card Features**:
  - **Hover Preview**: Scale effect + Loading spinner + Async load of high-res image from Firebase.
  - **Expandable Info**: Detailed description, numeric quantity field, and comments.
  - **Selection**: Clickable card state or checkbox to add to selection.

### E. Selection Bar (Conditional)
- **Visibility**: Visible only when `selectedCoins.length > 0`.
- **Animation**: Smooth slide-up from bottom.
- **Metrics**: Displays total count and total weight.
- **Actions**: [Book] and [Order] buttons.
- **Positioning**: Floating with 100px margins from edges.

---

## 5. State Management (NgRx)

- **Coins State**: Stores the list of coins fetched from Firestore.
- **Filter State**: Manages current filtering criteria.
- **Selection State**: Tracks IDs of selected coins for the Selection Bar.
- **UI State**: Theme selection, Loading states.

---

## 6. Implementation Notes

- **Performance**: Use `trackBy` in loops and `OnPush` change detection.
- **Theming**: Implemented via CSS Variables (Root classes like `.theme-dark`).
- **Firebase**: Use `angular/fire` for reactive data streams.
- **Images**: Implement lazy loading and high-res swapping logic in a dedicated directive or component.
