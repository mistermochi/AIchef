# ChefAI - Technical TODO & Pitfalls

## 🚀 Technical Improvements

- [x] **Type Safety:** Improve type definitions in `types.ts` to avoid `any` in some legacy areas (e.g., Firestore timestamps).
- [x] **Error Boundaries:** Implement React Error Boundaries to catch and gracefully handle UI crashes.
- [x] **Unit Testing:** Increase test coverage for utility functions in `utils/`.
- [x] **Performance:** Optimize `TrackerContext` to avoid unnecessary re-renders when only one product/purchase changes.
- [x] **Offline Support:** Enhance PWA capabilities by implementing more robust caching strategies for recipe images.
- [x] **Code Splitting:** Use React.lazy for view-level code splitting to improve initial load time.
- [x] **Refactoring:** `useRecipeAI` and `useChefAI` (if it becomes used) could be merged or better organized if they overlap.
- [x] **Cleanup:** Remove or properly deprecate the empty/0-byte component files in the root `components/` directory (e.g., `Navigation.tsx`, `RecipeModal.tsx`) to avoid confusion with the active versions in subdirectories.

## 🧪 Testing Roadmap

Establish a comprehensive Jest-based test suite focusing on core logic and high-complexity modules.

1.  **[x] `utils/tracker.ts`** (High Priority)
    - Test `calcNormalizedPrice` with all supported units (ml, l, g, kg, lb, jin, pcs).
    - Edge cases: zero/negative quantity, zero/negative price, unknown units.
    - Test `getCategory` with various product names, case sensitivity, and empty input.
2.  **[x] `utils/parsers.ts`** (High Priority)
    - Test `parseFuzzyNumber` with complex Chinese number combinations (e.g., "一百零五", "兩百三十").
    - Test `findDurationInText` with multi-language inputs and varied placements.
    - Edge cases: invalid characters, empty strings, missing units.
3.  **[x] `utils/shopping.ts`** (Medium Priority)
    - Test `consolidateShoppingList` with mixed unit types (e.g., merging "g" and "kg").
    - Edge cases: items with 0 quantity, scaling factor of 0 or negative, empty cart.
4.  **[x] `utils/ai.ts`** (Medium Priority)
    - Test `mapAIError` to ensure all Gemini API error types are correctly mapped to user-friendly statuses.
    - Test fallback logic for unknown error messages.
5.  **[x] `hooks/useRecipeAI.ts`** (Medium Priority)
    - Mock `geminiService` to test success and failure flows for recipe processing and Genie idea generation.
    - Verify correct loading state transitions and error state propagation.
6.  **[x] `context/TrackerContext.tsx`** (Medium Priority)
    - Mock Firebase Firestore to test real-time subscription handling and pagination.
    - Test CRUD operations: `savePurchase`, `deletePurchase`, `savePurchasesBatch`.
7.  **[x] `context/CartContext.tsx`** (Medium Priority)
    - Test cart management logic: `addToCart`, `removeFromCart`, `updateCartItemFactor`.
    - Verify ingredient checklist persistence and statistics calculation.
8.  **[x] `services/geminiService.ts`** (Low Priority - Internal logic)
    - Test `validateAIConnection` with mocked AI client responses for all health statuses.
    - Test `getClient` behavior with and without API keys in localStorage.
9.  **[x] `hooks/controllers/useMakeController.ts`** (Low Priority - Complex Interaction)
    - Test cooking session navigation logic: `nextStep`, `prevStep` boundaries.
    - Test `ActiveTimer` behavior: pausing, resuming, and auto-done status.
    - Verify voice command mapping to internal state changes.
10. **[x] `hooks/controllers/useTrackerController.ts`** (Low Priority - UI Logic)
    - Test tab switching and modal state management.
    - Verify error reporting interaction with `AuthContext` during AI deal searches.

## ⚠️ Perceived Pitfalls

- **State Syncing:** Be careful with the synchronization between `AuthContext` (profile/home) and other contexts. Race conditions can occur if a context starts fetching before `currentHomeId` is set.
- **Normalization Logic:** The `calcNormalizedPrice` in `utils/tracker.ts` is critical for the Tracker's utility. Ensure any new units are added to both `MULTIPLIERS` and `UNIT_TYPES`.
- **AI Quota Management:** Gemini AI calls can be expensive in terms of quota. Ensure `validateAIConnection` continues to use low-cost methods for health checks.
- **Firebase Security Rules:** As the "Home" (household) feature expands, ensure Firestore security rules are updated to properly restrict data access to home members only.
- **Mobile PWA Nuances:** iOS Safari often has different PWA behaviors (especially haptics and wake lock). Always test on multiple platforms.
- **Large Lists:** The Price Tracker history can grow large. While pagination is implemented, ensuring the UI remains snappy with hundreds of entries is vital.
