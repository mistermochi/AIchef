# Agent Best Practices for ChefAI

Welcome, Agent. To maintain the high standards and architectural integrity of ChefAI, please follow these guidelines.

## 1. Architectural Integrity (The Controller Pattern)

ChefAI strictly follows a separation of concerns between UI and Logic.

- **Views (`views/`)**: Keep them "dumb". They should only handle layout, rendering, and calling actions from controllers. Avoid `useEffect` for data fetching or complex state logic here.
- **Controllers (`hooks/controllers/`)**: All business logic, state management, and API interactions should live here. A view should ideally have exactly one corresponding controller hook.
- **Contexts (`context/`)**: Use contexts for global state (Auth, Database syncing). Do not put view-specific UI state here.
- **Services (`services/`)**: Centralize all external API calls (especially Gemini AI) here.

## 2. Documentation Standards

- All new methods, hooks, and components **must** include JSDoc comments.
- Describe the **purpose**, **parameters**, **return values**, and **interactions** with other components.
- Use `{@link ...}` to reference related components or hooks.

## 3. Working with Gemini AI

- Use the `geminiService.ts` for all AI interactions.
- Respect the existing error handling patterns for AI status (healthy, quota_error, auth_error, etc.) using `mapAIError`.
- When adding new AI features, define the response schema in `constants/schemas.ts` and the prompt in `constants/prompts.ts`.
- **AI Quota Management:** Always use low-cost methods (like `countTokens`) for health checks. Avoid triggering full inference for connectivity tests.

## 4. UI Development

- Use the atomic UI system in `components/UI.tsx`.
- Follow the Tailwind CSS naming conventions.
- Support Dark Mode using the `dark:` prefix.
- Use `useHaptics` for button clicks and significant UI actions.
- **Lazy Loading:** Use `React.lazy` and `Suspense` for large views and non-immediate overlays (like `RecipeModal` or `OrchestratorOverlay`) to keep initial bundle size small.

## 5. Firebase & State Management

- Use the initialized instances from `firebase.ts`.
- Prefer `onSnapshot` for real-time data sync in contexts.
- Use batches (`writeBatch`) for multiple writes to ensure atomicity and efficiency.
- **State Syncing Pitfall:** Many contexts depend on `currentHomeId` from `AuthContext`. Always ensure `currentHomeId` is valid before initiating Firestore subscriptions to avoid race conditions.
- **Performance:** Memoize context values and action functions using `useMemo` and `useCallback` to prevent unnecessary re-renders in deep component trees.

## 6. Logic & Data Consistency

- **Normalization:** The price tracker relies on consistent unit normalization. When adding new units, update both `MULTIPLIERS` and `UNIT_TYPES` in `constants/app.ts`.
- **Date Handling:** Use the `toDate` utility in `utils/tracker.ts` to standardize between Firestore Timestamps, JS Date objects, and strings.

## 7. Development Workflow & Safety

1.  **Analyze**: Understand if a change affects a View, a Controller, or a Context.
2.  **Verification**: Always run `npm run validate` (or `tsc --noEmit`) to ensure type safety.
3.  **No Side Effects:** Do **NOT** commit lockfiles (`package-lock.json`), build artifacts (`dist/`), or environment files (`.env`) unless explicitly requested.
4.  **Testing**: Add unit tests in `tests/unitTests.ts` for new utility functions. Use the in-app `TestDashboardView` to verify integration logic.
5.  **Types:** Ensure `tsconfig.json` includes `"types": ["vite/client"]` for proper `import.meta.env` support.
