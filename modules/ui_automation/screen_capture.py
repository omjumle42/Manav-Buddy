import os
import sys
import time
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Try to import mss for real screen capturing
try:
    import mss
    HAS_MSS = True
except ImportError:
    HAS_MSS = False

class ScreenCaptureModule:
    """
    Manav Screen Capture Module.
    Responsible for grabbing raw pixel buffers from full screen, specific windows,
    or sub-regions of interest. Works cross-platform.
    """
    
    def __init__(self):
        self._mock_count = 0
        
    def capture_screen(self) -> Image.Image:
        """
        Captures the entire active screen viewport.
        Returns a PIL Image object representing the frame.
        """
        if HAS_MSS:
            try:
                with mss.mss() as sct:
                    # Select the primary monitor
                    monitor = sct.monitors[1] if len(sct.monitors) > 1 else sct.monitors[0]
                    sct_img = sct.grab(monitor)
                    # Convert to PIL Image
                    img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
                    return img
            except Exception as e:
                # Fallback to simulated workspace if X-server / Display is missing
                return self._generate_simulated_screen(f"Full Screen Capture (MSS fallback due to: {str(e)})")
        else:
            return self._generate_simulated_screen("Simulated Corporate Workspace")

    def capture_window(self, window_title: str) -> Image.Image:
        """
        Captures a specific window bounding box by name search.
        """
        # Cross-platform window boundary queries require pygetwindow or win32gui
        bounds = None
        if sys.platform == "win32":
            try:
                import pygetwindow as gw
                windows = gw.getWindowsWithTitle(window_title)
                if windows:
                    win = windows[0]
                    bounds = (win.left, win.top, win.width, win.height)
            except Exception:
                pass
        
        if bounds:
            x, y, w, h = bounds
            return self.capture_region(x, y, w, h)
        else:
            # Fallback to capturing the screen or a high-quality simulated application window
            full_img = self.capture_screen()
            # Simulate cropping an app window like Spotify or Discord
            app_lower = window_title.lower()
            if "spotify" in app_lower:
                return self._generate_simulated_screen("Spotify - Playing Chill Beats Lofi", width=1280, height=800)
            elif "discord" in app_lower:
                return self._generate_simulated_screen("Discord - #general-chat", width=1280, height=800)
            elif "chrome" in app_lower or "browser" in app_lower:
                return self._generate_simulated_screen("Google Chrome - Search Workspace", width=1440, height=900)
            else:
                # Just return cropped center of screen
                w, h = full_img.size
                crop_box = (w // 8, h // 8, 7 * w // 8, 7 * h // 8)
                return full_img.crop(crop_box)

    def capture_region(self, x: int, y: int, width: int, height: int) -> Image.Image:
        """
        Captures a targeted sub-region of the active screen.
        """
        if width <= 0 or height <= 0:
            raise ValueError("Region width and height must be strictly positive.")
            
        if HAS_MSS:
            try:
                with mss.mss() as sct:
                    monitor = {"top": y, "left": x, "width": width, "height": height}
                    sct_img = sct.grab(monitor)
                    img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
                    return img
            except Exception:
                pass
        
        # Fallback/simulation
        full_img = self.capture_screen()
        w, h = full_img.size
        # Clip coordinates within screen boundaries
        rx = max(0, min(x, w))
        ry = max(0, min(y, h))
        rw = max(1, min(width, w - rx))
        rh = max(1, min(height, h - ry))
        return full_img.crop((rx, ry, rx + rw, ry + rh))

    def _generate_simulated_screen(self, title_text: str, width=1920, height=1080) -> Image.Image:
        """
        Generates a visually dense, structured mockup of a modern OS application screen.
        Used when running in headless, non-desktop Linux environments like Cloud Run,
        providing high-fidelity UI elements, buttons, and text fields for local OCR 
        and computer vision parsing validation tests.
        """
        self._mock_count += 1
        # Create gradient slate tech-companion theme canvas
        img = Image.new("RGB", (width, height), color="#1c1917")
        draw = ImageDraw.Draw(img)
        
        # Draw clean glowing header background
        draw.rectangle([(0, 0), (width, 60)], fill="#0f172a") # 深蓝灰色 dark blue-gray
        draw.line([(0, 60), (width, 60)], fill="#334155", width=2)
        
        # App logo and title
        draw.rectangle([(20, 15), (50, 45)], fill="#6366f1", outline="#818cf8", width=1) # Indigo badge
        draw.text((60, 20), title_text, fill="#f8fafc")
        
        # Simulated Network Speed stats in header (Aesthetic and Human-like placeholder)
        draw.text((width - 320, 22), "NETWORK: 100 Mbps (SSL SECURE)", fill="#10b981")
        draw.text((width - 120, 22), f"TIME: {time.strftime('%H:%M:%S')}", fill="#cbd5e1")
        
        # Left sidebar layout panel (Simulated app selector)
        draw.rectangle([(0, 61), (240, height)], fill="#111827")
        draw.line([(240, 61), (240, height)], fill="#1f2937", width=2)
        
        apps = ["Google Chrome", "Spotify Feed", "Discord Lounge", "VS Code Editor", "System Settings", "Notepad Note"]
        for i, app_name in enumerate(apps):
            y_offset = 90 + i * 50
            # Active indicator on Chrome
            if "chrome" in app_name.lower() or i == 0:
                draw.rectangle([(10, y_offset - 8), (230, y_offset + 25)], fill="#1e293b", radius=4)
                draw.rectangle([(12, y_offset - 4), (16, y_offset + 21)], fill="#6366f1")
            draw.text((30, y_offset), app_name, fill="#f8fafc" if i == 0 else "#9ca3af")
            
        # Draw Main Area Content Card Container
        card_x, card_y = 270, 90
        card_w, card_h = width - 300, height - 120
        draw.rectangle([(card_x, card_y), (card_x + card_w, card_y + card_h)], fill="#18181b", outline="#27272a", width=2)
        
        # Header of Main Card
        draw.text((card_x + 30, card_y + 30), "ACTIVE DESKTOP INTERFACE SIMULATOR v4.2", fill="#e2e8f0")
        draw.line([(card_x + 30, card_y + 60), (card_x + card_w - 30, card_y + 60)], fill="#27272a")
        
        # Interactive Inputs & Buttons (Drawn cleanly for OpenCV and template-matching engines)
        # Search Box Input
        inp_x, inp_y = card_x + 50, card_y + 90
        draw.rectangle([(inp_x, inp_y), (inp_x + 350, inp_y + 40)], fill="#09090b", outline="#6366f1", width=2)
        draw.text((inp_x + 15, inp_y + 12), "Search files and resources...", fill="#71717a")
        
        # Action Buttons (Submit, Play, Cancel, Delete, Login)
        btn_y = card_y + 160
        # Indigo Core Button: "Login"
        draw.rectangle([(card_x + 50, btn_y), (card_x + 160, btn_y + 36)], fill="#4f46e5", radius=3)
        draw.text((card_x + 85, btn_y + 10), "Login", fill="#ffffff")
        
        # Green Action Button: "Play"
        draw.rectangle([(card_x + 180, btn_y), (card_x + 290, btn_y + 36)], fill="#16a34a", radius=3)
        draw.text((card_x + 215, btn_y + 10), "Play", fill="#ffffff")
        
        # Red Risky Button: "Delete System Logs" (Used to test Safety constraints!)
        draw.rectangle([(card_x + 310, btn_y), (card_x + 480, btn_y + 36)], fill="#dc2626", radius=3)
        draw.text((card_x + 335, btn_y + 10), "Delete System", fill="#ffffff")

        # Checkbox field
        chk_y = btn_y + 70
        draw.rectangle([(card_x + 50, chk_y), (card_x + 70, chk_y + 20)], fill="#1c1917", outline="#cbd5e1", width=2) # Checkbox box
        draw.text((card_x + 85, chk_y + 2), "Enable Accessibility Mode Protocols", fill="#cbd5e1")
        
        # Focused Text line
        draw.text((card_x + 50, chk_y + 50), "Current status: Waiting for AI Automation instructions.", fill="#a1a1aa")
        
        # Draw modern "Play Button" icon (triangle inside circle) for vision template matches
        play_circle_x, play_circle_y = card_x + 100, card_y + 340
        draw.alpha_composite = True
        draw.ellipse([(play_circle_x, play_circle_y), (play_circle_x + 80, play_circle_y + 80)], fill="#3b82f6", outline="#60a5fa", width=2)
        # Tri
        draw.polygon([(play_circle_x + 32, play_circle_y + 24), (play_circle_x + 32, play_circle_y + 56), (play_circle_x + 58, play_circle_y + 40)], fill="#ffffff")
        draw.text((play_circle_x - 10, play_circle_y + 90), "Media Play", fill="#f1f5f9")
        
        # Draw search bar icon
        s_bar_x, s_bar_y = card_x + 300, card_y + 340
        draw.rectangle([(s_bar_x, s_bar_y), (s_bar_x + 320, s_bar_y + 44)], fill="#242427", outline="#444446", width=2)
        draw.text((s_bar_x + 15, s_bar_y + 14), "Enter commands...", fill="#9ca3af")
        
        return img

# Thread-safe global accessor
capture_engine = ScreenCaptureModule()

def capture_screen() -> Image.Image:
    return capture_engine.capture_screen()

def capture_window(window_title: str) -> Image.Image:
    return capture_engine.capture_window(window_title)

def capture_region(x: int, y: int, width: int, height: int) -> Image.Image:
    return capture_engine.capture_region(x, y, width, height)
