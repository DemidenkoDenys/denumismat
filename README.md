# Project Specification: Denumismat Single Page Catalog-Shop

## 1. Short Summary
"Denumismat" it's single-page Angular interactive application for browsing coins in separate blocks grid with filtering and ability to order or book coins. Application is localized, have google/mail login feature (without separate page).

## 2. Technical Stack
- **Framework:** Angular 19+ (Standalone Components)
- **State Management:** NGRX store
- **Styling:** SCSS
- **Themes:** Dark | Light | Blue
- **Icons:** Lucide-Angular or Heroicons
- **Change Detection:** OnPush Strategy
- **Data storage:** Firebase Cloud Firestore
- **Image storage:** Firebase Cloud Storage
- **Localization:** Angular i18n localization

## 3. Components Architecture

### A. Header
- **Title:** Bit text "Denumismat" that is shimmer on hover to the left. Search field to the right. "Country flag icon" to the very right position with dropdown list (country icon + country name).
- **Position:** Placed at the very top of the page and sticky on scrolling.

### B. Inroduction section
- **Content:** Contain inroductory text.
- **Position:** Placed between header and filters section. Not sticky. Height is 60% of the screen height.

### C. Filters section
- **Content:** Filter fields with readtime list section update. text "(filter icon) Filter:" to the left. Text field "Country". Range slider for "Price". Buttons group: "UNC", "Rare", "Sale".
- **State:** Use a ngrx store to store selected filters
- **Position:** Sticky when reach under the header position on scrolling.

### D. Interactive Coin Grid
A responsive grid (1 col mobile, 3-4 cols desktop) of `List` components.
Each card includes:
- **Core Info:** Coin image, Name, Year, Price, Collapsable: descripion with list, numeric field with apply icon, text field.
- **Selection:** A checkbox or a clickable card state to "select" the coin.
- **Advanced Preview Logic:**
    - **Trigger:** Hover on image.
    - **Action (On Hover):**
        1. The image container expands (scale effect).
        2. A loading spinner appears in the center of the image.
        3. Start an asynchronous load of a high-resolution version of the image from firebase.
        4. **Completion:** Once the high-res image is fully loaded, replace the thumbnail and hide the spinner.
        5. **Transition:** Use smooth CSS transitions for expansion and opacity fades for image swapping.

### E. Conditional Footer Bar
- **Visibility:** Hidden by default.
- **Trigger:** Becomes visible only when `selectedCoins.length > 0`.
- **Functionality:** - Displays "Selected: X coins / X gramms".
    - Buttons: [Book] [Order].
- **Animation:** Slide-up animation from the bottom of the viewport.
- **Psition:** Sticky to the bottom with 100 px margin to the left, right and bottom.
- **Size:** 200 px height and full screen (except margins).
