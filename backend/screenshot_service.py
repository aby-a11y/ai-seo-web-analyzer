from playwright.sync_api import sync_playwright
import base64
from PIL import Image
import io

def capture_responsive_screenshots(url):
    """Mobile, tablet, desktop screenshots"""
    screenshots = {}
    devices = {
        'mobile': {'width': 375, 'height': 667, 'name': 'iPhone SE'},
        'tablet': {'width': 768, 'height': 1024, 'name': 'iPad'}, 
        'desktop': {'width': 1440, 'height': 900, 'name': 'Desktop'}
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for device_type, config in devices.items():
            page = browser.new_page(
                viewport={'width': config['width'], 'height': config['height']}
            )
            page.goto(url, wait_until='networkidle', timeout=30000)
            screenshot_bytes = page.screenshot(full_page=False)
            
            # Compress image
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
            page.close()
        browser.close()
    return screenshots
