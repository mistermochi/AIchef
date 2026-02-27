
from playwright.sync_api import Page, expect, sync_playwright
import time

def test_ai_settings(page: Page):
    # Navigate to the app
    page.goto("http://localhost:5173/AIchef/")

    # Wait for the app to load
    page.wait_for_selector("text=ChefAI Studio", timeout=10000)

    # In desktop view (width 1280), click the user box at the bottom of the sidebar
    # It contains the display name
    page.get_by_text("Guest Chef").click()

    # Wait for ProfileView to load
    page.wait_for_selector("text=Chef Identity", timeout=10000)

    # Scroll to the "Data & Connectivity" section
    connectivity_section = page.get_by_text("Data & Connectivity")
    connectivity_section.scroll_into_view_if_needed()

    # Take a screenshot of the AI Provider selector (Initial state: Gemini)
    page.screenshot(path="verification/ai_settings_initial.png")

    # Select Mistral provider
    mistral_button = page.get_by_role("button", name="MISTRAL")
    mistral_button.click()

    # Wait for animation
    time.sleep(1)

    # Take another screenshot
    page.screenshot(path="verification/ai_settings_mistral.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 1200})
        page = context.new_page()
        try:
            test_ai_settings(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            with open("verification/page_content.html", "w") as f:
                f.write(page.content())
        finally:
            browser.close()
