import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()
        # -> navigate
        await page.goto("http://localhost:5174/admin")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Navigate to the public map at http://localhost:5174/ and wait for the page to load so map controls and markers can be inspected.
        await page.goto("http://localhost:5174/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Attempt to recover the public map by clicking the 'Muat Ulang' (Reload) button so map controls and markers become available.
        # button "Muat Ulang"
        elem = page.locator("xpath=/html/body/div/div/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Attempt a second reload by clicking the 'Muat Ulang' button to recover the public map so filters and markers become available.
        # button "Muat Ulang"
        elem = page.locator("xpath=/html/body/div/div/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Force a full page reload by navigating to http://localhost:5174/ and wait for the SPA to finish loading so map controls and markers become available.
        await page.goto("http://localhost:5174/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Test blocked (AST guard fallback)
        raise AssertionError("Test blocked during agent run: " + "TEST BLOCKED The public map feature could not be reached \u2014 an unexpected error modal prevents interacting with the map and its controls, and reload attempts did not recover the SPA. Observations: - A full-page error modal is shown with the message 'Terjadi Kesalahan' and a single 'Muat Ulang' button. - No map controls, filters, or markers are visible; the page reports 0 other interactive elemen...")
        await asyncio.sleep(5)
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    