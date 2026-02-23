# ChefAI - Technical TODO & Pitfalls

## 🚀 Technical Improvements

- [ ] **Type Safety:** Improve type definitions in `types.ts` to avoid `any` in some legacy areas (e.g., Firestore timestamps).
- [ ] **Error Boundaries:** Implement React Error Boundaries to catch and gracefully handle UI crashes.
- [ ] **Unit Testing:** Increase test coverage for utility functions in `utils/` and complex logic in controllers.
- [ ] **Performance:** Optimize `TrackerContext` to avoid unnecessary re-renders when only one product/purchase changes.
- [ ] **Offline Support:** Enhance PWA capabilities by implementing more robust caching strategies for recipe images.
- [ ] **Code Splitting:** Use React.lazy for view-level code splitting to improve initial load time.
- [ ] **Refactoring:** `useRecipeAI` and `useChefAI` (if it becomes used) could be merged or better organized if they overlap.
- [ ] **Cleanup:** Remove or properly deprecate the empty/0-byte component files in the root `components/` directory (e.g., `Navigation.tsx`, `RecipeModal.tsx`) to avoid confusion with the active versions in subdirectories.

## ⚠️ Perceived Pitfalls

- **State Syncing:** Be careful with the synchronization between `AuthContext` (profile/home) and other contexts. Race conditions can occur if a context starts fetching before `currentHomeId` is set.
- **Normalization Logic:** The `calcNormalizedPrice` in `utils/tracker.ts` is critical for the Tracker's utility. Ensure any new units are added to both `MULTIPLIERS` and `UNIT_TYPES`.
- **AI Quota Management:** Gemini AI calls can be expensive in terms of quota. Ensure `validateAIConnection` continues to use low-cost methods for health checks.
- **Firebase Security Rules:** As the "Home" (household) feature expands, ensure Firestore security rules are updated to properly restrict data access to home members only.
- **Mobile PWA Nuances:** iOS Safari often has different PWA behaviors (especially haptics and wake lock). Always test on multiple platforms.
- **Large Lists:** The Price Tracker history can grow large. While pagination is implemented, ensuring the UI remains snappy with hundreds of entries is vital.
