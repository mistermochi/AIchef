## 2025-05-22 - [Optimizing List Performance & Infinite Scroll]
**Learning:** Redundant `IntersectionObserver` instances on the same element are a common anti-pattern in this codebase's list components. Additionally, the `useLocalStorage` hook was returning an unstable `setValue` function, causing cascading re-renders in every component consuming any context that used it.
**Action:** Consolidate infinite scroll logic into a single robust hook that handles both local display limits and remote load callbacks. Always wrap state setters from custom hooks in `useCallback` when they are used in context actions to maintain stability.

## 2025-05-23 - [Global Context Memoization]
**Learning:** High-level context providers in this application (Auth, UI, Recipe) were passing new object literals on every render, causing app-wide cascading re-renders. Standard React state setters (from useState) are stable, but derived state and custom actions must be explicitly wrapped in `useCallback` and the provider value in `useMemo` to effectively prune the render tree.
**Action:** Always memoize the `value` prop of Context Providers. Ensure all functions and complex derived booleans (like `isAIEnabled`) passed into the context are also memoized to maintain referential stability.

## 2025-05-24 - [Repository Stability & Callback Memoization]
**Learning:** Unstable function references from hooks like `useRecipeRepository` were propagating through `RecipeContext`, invalidating its `useMemo` on every render. This forced app-wide re-renders and caused `useInfiniteScroll` to recreate its `IntersectionObserver` continuously, negating the benefits of centralized pagination logic.
**Action:** Wrap all repository action functions in `useCallback`. Move static hook configuration (e.g., `INITIAL_LIMIT`) to module scope to keep the hook's internal state transitions clean and stable.
