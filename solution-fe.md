# Solution Overview

This frontend is a React SPA designed to interact with the backend API for item management and statistics. The architecture emphasizes modular components, context-based state management, and a clean, responsive UI using CSS grid and utility classes.

---

## Project Structure

- **components/input.js**: Controlled input component for search/filter.
- **components/loader.js**: SVG-based loading spinner.
- **components/pagination.js**: Pagination controls with active state and navigation.
- **pages/itemDetail.js**: Displays details for a single item.
- **pages/items.js**: Lists items, supports search and pagination.
- **state/DataContext.js**: Provides global state and data-fetching logic via React Context.
- **styles.css**: Contains all layout and component styles.

---

## Key Implementation Details

### 1. Input Component

- Renders a styled input inside a wrapper.
- Uses `onBlur` to trigger search/filter, as noted in the placeholder.
- Controlled via `value` and `onChange` props.

---

### 2. Loader Component

- SVG spinner centered using utility classes.
- Uses `<animateTransform>` for smooth rotation.

---

### 3. Pagination Component

- Dynamically generates page numbers based on API metadata.
- Handles next/previous navigation and direct page jumps.
- Highlights the active page.

---

### 4. ItemDetail Page

- Fetches all items (with a forced refresh) and finds the item by ID.
- Redirects to home if the item is not found.
- Uses a loading spinner while fetching.

---

### 5. Items Page

- Fetches paginated items on mount.
- Integrates search via the Input component.
- Renders items in a responsive grid.
- Includes pagination controls.

---

### 6. DataContext

- Provides `items`, `itemsPagination`, and `fetchItems` globally.
- `fetchItems` uses `useCallback` for memoization.
- Prevents state updates on unmounted components using an `isMounted` flag.

---

### 7. CSS Styling

- Uses utility classes for spacing (`my-1`), grid layouts (`grid`, `grid-6`), and gaps.
- Navigation and pagination are styled for clarity and accessibility.
- Items have a card-like appearance with hover effects.
- Loader and input areas are visually distinct.

---

## Notable Design Choices

- **Context-based State:**  
  Centralizes data fetching and state, simplifying prop drilling.
- **Controlled Components:**  
  Ensures predictable UI state and easy integration with forms/search.
- **Responsive Grid:**  
  Adapts to different screen sizes using CSS grid classes.
- **User Experience:**  
  Loader and error handling provide feedback during async operations.

---

## Conclusion

The frontend is modular, maintainable, and user-friendly. Comments and code structure clarify the intent behind event handling, state management, and UI updates. The approach ensures a responsive, robust interface for interacting with the backend API.
