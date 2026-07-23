import sys
import time
import random
import math
from typing import Tuple, Optional, Any

# Conditional imports of OS mouse managers
HAS_MOUSE_API = False
if sys.platform == "win32":
    try:
        import pyautogui
        import win32api
        import win32con
        pyautogui.FAILSAFE = True  # Enable fail-safe lock corners
        HAS_MOUSE_API = True
    except Exception:
        pass
elif sys.platform == "linux" or sys.platform == "darwin":
    try:
        import pyautogui
        HAS_MOUSE_API = True
    except Exception:
        pass

class ClickEngineModule:
    """
    Manav Mouse Input and Human-Like Coordinate Controller.
    Implements Bezier curve paths, micro-vibrations, randomized delays,
    and hovering cycles to perfectly duplicate human physical mouse activities.
    """
    
    def __init__(self):
        self.default_speed_range = (0.1, 0.3) # time duration in seconds

    def _get_current_pos(self) -> Tuple[int, int]:
        """Reads current physical cursor location coords."""
        if HAS_MOUSE_API:
            try:
                return pyautogui.position()
            except Exception:
                pass
        return (960, 540) # Assumes standard full HD center

    def _calculate_bezier_point(self, p0: Tuple[int, int], p1: Tuple[int, int], 
                                 p2: Tuple[int, int], p3: Tuple[int, int], t: float) -> Tuple[int, int]:
        """Calculates a point along a cubic Bezier curve."""
        # Cubic Bezier formula: B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
        mt = 1 - t
        x = (mt**3 * p0[0] + 
             3 * mt**2 * t * p1[0] + 
             3 * mt * t**2 * p2[0] + 
             t**3 * p3[0])
        y = (mt**3 * p0[1] + 
             3 * mt**2 * t * p1[1] + 
             3 * mt * t**2 * p2[1] + 
             t**3 * p3[1])
        return int(x), int(y)

    def move_mouse(self, x: int, y: int, speed_duration: Optional[float] = None) -> None:
        """
        Moves cursor from original position to (x, y) coordinates using human-like Bezier curves.
        Includes organic velocity curve variations.
        """
        start_x, start_y = self._get_current_pos()
        if start_x == x and start_y == y:
            return

        if speed_duration is None:
            # Generate organic velocity depending on travel distance
            dist = math.hypot(x - start_x, y - start_y)
            speed_duration = random.uniform(0.15, 0.45) if dist > 100 else random.uniform(0.08, 0.2)

        # Generate control points for cubic Bezier curving (randomly displaced)
        ctrl_dist = math.hypot(x - start_x, y - start_y) / 3.0
        angle = math.atan2(y - start_y, x - start_x)
        
        # Displace control points away from linear path
        dev1 = random.uniform(-ctrl_dist, ctrl_dist) * 0.4
        dev2 = random.uniform(-ctrl_dist, ctrl_dist) * 0.4
        
        p0 = (start_x, start_y)
        p1 = (int(start_x + ctrl_dist * math.cos(angle) + dev1 * math.sin(angle)),
              int(start_y + ctrl_dist * math.sin(angle) - dev1 * math.cos(angle)))
        p2 = (int(start_x + 2 * ctrl_dist * math.cos(angle) + dev2 * math.sin(angle)),
              int(start_y + 2 * ctrl_dist * math.sin(angle) - dev2 * math.cos(angle)))
        p3 = (x, y)

        # Draw steps along curve
        steps = max(10, int(speed_duration * 120)) # approx 120Hz polling rate
        for i in range(steps + 1):
            t = i / float(steps)
            cx, cy = self._calculate_bezier_point(p0, p1, p2, p3, t)
            
            # Inject micro jitter/hand-shake noise
            if i > 0 and i < steps:
                cx += int(random.uniform(-1, 1))
                cy += int(random.uniform(-1, 1))

            if HAS_MOUSE_API:
                try:
                    pyautogui.moveTo(cx, cy)
                except Exception:
                    pass
            else:
                # Print mock move tracking
                if i % 10 == 0 or i == steps:
                    print(f"[Mouse Trail] Moving coordinates to: ({cx}, {cy})")
            
            # Smooth step spacing delay
            time.sleep(speed_duration / steps)

    def hover(self, x: int, y: int, duration: Optional[float] = None) -> None:
        """Moves cursor to (x, y) and hovers with human micro-vibrations."""
        self.move_mouse(x, y)
        hover_time = duration if duration is not None else random.uniform(0.15, 0.4)
        
        start_t = time.time()
        while time.time() - start_t < hover_time:
            # Simulate natural holding breathing micro jitter (<= 1 pixel offsets)
            jx = x + int(random.uniform(-1, 1.5))
            jy = y + int(random.uniform(-1, 1.5))
            if HAS_MOUSE_API:
                try:
                    pyautogui.moveTo(jx, jy)
                except Exception:
                    pass
            time.sleep(random.uniform(0.04, 0.08))

    def click(self, x: int, y: int) -> None:
        """Standard robotic instant coordinate click."""
        if HAS_MOUSE_API:
            try:
                pyautogui.click(x, y)
            except Exception:
                pass
        else:
            print(f"[Mouse Action] Robotic click executed on coordinate: ({x}, {y})")

    def human_like_click(self, x: int, y: int) -> None:
        """
        Premium fully organic action:
        Bezier curve travel trajectory -> Micro Hover -> Human Touch click hold -> Post drag micro-recovery.
        """
        # 1. Travel to target coordinates using Bezier
        self.move_mouse(x, y)
        
        # 2. Organic hover-before-click delay
        time.sleep(random.uniform(0.1, 0.25))
        
        # 3. Simulate down and up click delays (human finger push hold is ~45ms - 110ms)
        if HAS_MOUSE_API:
            try:
                pyautogui.mouseDown(x, y)
                time.sleep(random.uniform(0.045, 0.11))
                pyautogui.mouseUp(x, y)
            except Exception:
                pass
        else:
            print(f"[Mouse Action] Organically clicking at: ({x}, {y}) with 70ms click hold.")
            
        # 4. Human-like post click settling delay
        time.sleep(random.uniform(0.1, 0.2))

    def safe_click(self, x: int, y: int) -> None:
        """Double verifies that mouse resides on matching target bounds before click execution."""
        # Hover first
        self.hover(x, y, duration=0.15)
        # Re-get coordinates to confirm focus hold
        cx, cy = self._get_current_pos()
        if abs(cx - x) <= 5 and abs(cy - y) <= 5:
            self.click(cx, cy)
        else:
            # Direct override click if coordinates drifted due to window updates
            self.click(x, y)

    def double_click(self, x: int, y: int) -> None:
        """Performs two biological taps with 100ms-180ms delay interval."""
        self.move_mouse(x, y)
        time.sleep(random.uniform(0.05, 0.12))
        
        if HAS_MOUSE_API:
            try:
                pyautogui.doubleClick(x, y, interval=random.uniform(0.1, 0.18))
            except Exception:
                pass
        else:
            print(f"[Mouse Action] Double click executed at: ({x}, {y})")

    def right_click(self, x: int, y: int) -> None:
        """Human-like travel and right-click trigger."""
        self.move_mouse(x, y)
        time.sleep(random.uniform(0.08, 0.18))
        if HAS_MOUSE_API:
            try:
                pyautogui.rightClick(x, y)
            except Exception:
                pass
        else:
            print(f"[Mouse Action] Right-click executed at: ({x}, {y})")

    def drag(self, start_x: int, start_y: int, end_x: int, end_y: int) -> None:
        """Presses mouse button, moves human-cooperatively across Bezier and releases."""
        self.move_mouse(start_x, start_y)
        time.sleep(random.uniform(0.15, 0.3))
        
        if HAS_MOUSE_API:
            try:
                pyautogui.dragTo(end_x, end_y, button='left', 
                                 duration=random.uniform(0.3, 0.6), 
                                 tween=pyautogui.easeOutQuad)
            except Exception:
                pass
        else:
            print(f"[Mouse Action] Dragging from ({start_x}, {start_y}) down to ({end_x}, {end_y}) using Quad ease.")

    def scroll_up(self, clicks: int = 3) -> None:
        """Simulates native mouse wheel scroll up by clicks steps."""
        if HAS_MOUSE_API:
            try:
                # On Windows, positive value scrolls up; On macOS, negative
                scroll_units = clicks * 120 if sys.platform == "win32" else clicks
                pyautogui.scroll(scroll_units)
            except Exception:
                pass
        else:
            print(f"[Mouse Wheel] Scrolled UP {clicks} incremental frames.")

    def scroll_down(self, clicks: int = 3) -> None:
        """Simulates native mouse wheel scroll down by clicks steps."""
        if HAS_MOUSE_API:
            try:
                scroll_units = -clicks * 120 if sys.platform == "win32" else -clicks
                pyautogui.scroll(scroll_units)
            except Exception:
                pass
        else:
            print(f"[Mouse Wheel] Scrolled DOWN {clicks} incremental frames.")

    def scroll_to_element(self, element: Any) -> None:
        """Calculates element coordinates and scrolls wheel until centered on bounds index."""
        # Assumes element contains standard .bounds parameters
        if hasattr(element, "bounds"):
            ex, ey, ew, eh = element.bounds
        elif isinstance(element, tuple) and len(element) == 4:
            ex, ey, ew, eh = element
        else:
            return
            
        cx, cy = self._get_current_pos()
        # Scroll up or down depending on target ey relative to cursor coordinate eye
        diff = ey - cy
        steps = abs(diff) // 150
        steps = max(1, min(10, steps)) # Bound iterations
        
        if diff < 0:
            self.scroll_up(steps)
        else:
            self.scroll_down(steps)
            
        time.sleep(random.uniform(0.15, 0.3))
        # Snap adjust target positioning
        self.move_mouse(ex + ew // 2, ey + eh // 2)

# Thread-safe global accessor
click_engine = ClickEngineModule()

def move_mouse(x: int, y: int) -> None:
    click_engine.move_mouse(x, y)

def click(x: int, y: int) -> None:
    click_engine.click(x, y)

def double_click(x: int, y: int) -> None:
    click_engine.double_click(x, y)

def right_click(x: int, y: int) -> None:
    click_engine.right_click(x, y)

def drag(start_x: int, start_y: int, end_x: int, end_y: int) -> None:
    click_engine.drag(start_x, start_y, end_x, end_y)

def hover(x: int, y: int) -> None:
    click_engine.hover(x, y)

def scroll_up(clicks: int = 3) -> None:
    click_engine.scroll_up(clicks)

def scroll_down(clicks: int = 3) -> None:
    click_engine.scroll_down(clicks)

def scroll_to_element(element: Any) -> None:
    click_engine.scroll_to_element(element)

def safe_click(x: int, y: int) -> None:
    click_engine.safe_click(x, y)

def human_like_click(x: int, y: int) -> None:
    click_engine.human_like_click(x, y)
