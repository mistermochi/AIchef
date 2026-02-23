<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ChefAI

ChefAI is a modern React-based Progressive Web App (PWA) designed to simplify recipe management, meal planning, and grocery price tracking using the power of Google Gemini AI.

View your app in AI Studio: https://ai.studio/apps/drive/1jSndh-LIpD1h0gwVWP9jATSPpzGoMhPW

## Features

- **AI Recipe Processor:** Extract structured recipes from raw text or images.
- **Recipe Genie:** Generate creative meal ideas from available ingredients.
- **Price Tracker:** Track grocery prices across different stores and normalize them to find the best deals.
- **Meal Planner:** Organize your week with an AI-assisted meal plan.
- **Orchestrator:** Coordinate cooking steps for multiple recipes simultaneously.
- **PWA Ready:** Installable on mobile and desktop for offline-ready access.

## Architecture

This project follows the **Controller Pattern** to maintain a clean separation between UI and business logic:

- **Views (`views/`)**: "Dumb" components responsible for layout and rendering. They consume state and actions from controllers.
- **Controllers (`hooks/controllers/`)**: "Smart" hooks containing all business logic, state management, and API calls.
- **Contexts (`context/`)**: Handle global state such as authentication, database subscriptions, and shared UI state.
- **Services (`services/`)**: Encapsulate external API interactions (e.g., Google Gemini AI).
- **UI System (`components/UI.tsx`)**: An atomic-based UI system for consistent styling using Tailwind CSS.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Firebase (Firestore, Auth)
- **AI:** Google Gemini AI (via `@google/genai`)
- **Icons:** Lucide React

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
