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
- Respect the existing error handling patterns for AI status (healthy, quota_error, auth_error, etc.).
- When adding new AI features, define the response schema in `constants/schemas.ts` and the prompt in `constants/prompts.ts`.

## 4. UI Development

- Use the atomic UI system in `components/UI.tsx`.
- Follow the Tailwind CSS naming conventions.
- Support Dark Mode using the `dark:` prefix.
- Use `useHaptics` for button clicks and significant UI actions.

## 5. Firebase Guidelines

- Use the initialized instances from `firebase.ts`.
- Prefer `onSnapshot` for real-time data sync in contexts.
- Use batches (`writeBatch`) for multiple writes to ensure atomicity and efficiency.

## 6. Development Workflow

1.  **Analyze**: Understand if a change affects a View, a Controller, or a Context.
2.  **Verify**: Always verify your changes by reading the modified files.
3.  **Test**: If possible, add unit tests in `tests/` for new utility functions or logic.
