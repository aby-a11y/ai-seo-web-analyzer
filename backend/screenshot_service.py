import base64
import io
import asyncio

async def capture_responsive_screenshots(url):
    """Mobile, tablet, desktop screenshots"""
    try:
        from playwright.async_api import async_playwright
        from PIL import Image
    except ImportError:
        print("Playwright not installed - skipping screenshots")
        return {}

    screenshots = {}
    devices = {
        'mobile': {'width': 375, 'height': 667, 'name': 'iPhone SE'},
        'tablet': {'width': 768, 'height': 1024, 'name': 'iPad'},
        'desktop': {'width': 1440, 'height': 900, 'name': 'Desktop'}
    }

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            for device_type, config in devices.items():
                try:
                    page = await browser.new_page(
                        viewport={'width': config['width'], 'height': config['height']}
                    )
                    await page.goto(url, wait_until='networkidle', timeout=30000)
                    await page.wait_for_timeout(2000)
                    screenshot_bytes = await page.screenshot(full_page=False)

                    img = Image.open(io.BytesIO(screenshot_bytes))
                    output = io.BytesIO()
                    img.save(output, format='PNG', optimize=True, quality=85)
                    compressed_bytes = output.getvalue()

                    screenshots[device_type] = {
                        'image': base64.b64encode(compressed_bytes).decode(),
                        'device': config['name'],
                        'width': config['width'],
                        'height': config['height']
                    }
                    await page.close()

                except Exception as e:
                    print(f"Error capturing {device_type}: {str(e)}")
                    continue

            await browser.close()

    except Exception as e:
        print(f"Playwright error: {str(e)}")
        return {}

    return screenshots
