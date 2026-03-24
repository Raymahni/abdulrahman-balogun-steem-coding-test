# Solution Overview

This backend is a Node.js REST API built with Express, designed to manage a collection of items and provide statistics about them. The project emphasizes asynchronous file operations, input validation, and performance optimization through caching.

---

## Project Structure

- **src/index.js**: Entry point, sets up the Express app, middleware, and routes.
- **routes/items.js**: Handles CRUD operations for items.
- **routes/stats.js**: Computes and serves statistics about items, with caching.
- **utils/validation.js**: Contains validation logic for item input.
- **middleware/errorHandler.js**: Handles errors and not-found routes.
- **data/items.json**: Stores the items data persistently.

---

## Key Implementation Details

### 1. Items API (`routes/items.js`)

- **Data Access:**  
  Uses asynchronous file operations (`fs/promises`) to read and write `items.json`, ensuring non-blocking I/O.

- **GET /api/items:**  
  Supports filtering by query (`q`), pagination (`limit`, `page`), and returns metadata (total count, pages, etc.).

- **GET /api/items/:id:**  
  Fetches a single item by ID, returns 404 if not found.

- **POST /api/items:**  
  Validates input using a utility function.  
  On success, adds a new item with a unique ID (timestamp-based) and persists it.

---

### 2. Statistics API (`routes/stats.js`)

- **Caching:**  
  Implements a simple in-memory cache (`cachedStats`) to avoid recomputing statistics on every request.
- **Concurrency:**  
  Uses a `recomputing` promise to prevent race conditions when stats are being recalculated.
- **GET /api/stats:**  
  Returns total item count and average price.

---

### 3. Validation Utility (`utils/validation.js`)

- Validates that each item has a non-empty string `name` and `category`, and a positive number `price`.
- Returns an array of error messages for invalid input.

---

## Notable Design Choices

- **Asynchronous File I/O:**  
  Prevents blocking the event loop, supporting scalability.
- **Input Validation:**  
  Ensures data integrity before writing to disk.
- **Caching for Expensive Operations:**  
  Reduces response time for statistics endpoint.

---

## Conclusion

The backend is structured for clarity, maintainability, and performance. Comments throughout the codebase explain key decisions, especially around asynchronous operations, validation, and caching. This approach ensures the API is robust, efficient, and
