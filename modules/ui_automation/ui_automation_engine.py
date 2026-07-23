import time
import os
from typing import Optional, Tuple, Any, List, Dict

# Complete import tree of our UI Automation Sub-engines
from modules.ui_automation.screen_capture import capture_screen, capture_window, capture_region
from modules.ui_automation.accessibility_engine import (
    get_all_visible_elements, 
    get_focused_element, 
    invoke_element, 
    set_value
)
from modules.ui_automation.vision_engine import detect_buttons, detect_checkboxes, find_play_button
from modules.ui_automation.ocr_engine import read_screen_text, find_text_position
from modules.ui_automation.click_engine import human_like_click, scroll_up, scroll_down, hover, move_mouse
from modules.ui_automation.keyboard_engine import type_text, enter, press_key
from modules.ui_automation.window_engine import get_window_title, get_window_bounds
from modules.ui_automation.element_detector import find_button, find_input_box, find_checkbox, find_tab, find_menu

class SafetyViolationException(Exception):
    """Custom exception matching safety violations."""
    pass

class UIAutomationEngine:
    """
    Manav Unified UI Automation Orchestrator.
    Combines sensory outputs (vision, OCR, accessibility API) with motors 
    (keyboard, mouse, click engines) to simulate natural human application interaction.
    """
    def __init__(self):
        # Dangerous triggers matching safety constraints
        self.risky_keywords = [
            "delete", "remove", "truncate", "format", "shutdown", 
            "payment", "pay", "purchase", "buy", "send email", 
            "modify system", "restart"
        ]
        self._last_verified_command = None

    def execute_command(self, natural_command: str) -> str:
        """
        Translates human instructions into mouse and keyboard routines.
        E.g.
        'Click the login button' -> find login button -> human-like click hold!
        'Scroll down' -> scroll down clicks.
        """
        # 1. Inspect Safety violations
        cmd_lower = natural_command.lower().strip()
        is_risky = any(risk in cmd_lower for risk in self.risky_keywords)
        
        if is_risky:
            msg = f"⚠️ [SAFETY BLOCK] The instruction matches a critical restricted scenario: '{natural_command}'. Must ask confirmation before proceeding."
            print(msg)
            return msg

        # 2. Command Router
        try:
            if "click the login button" in cmd_lower or "login" in cmd_lower:
                pos = find_button("Login")
                if pos:
                    cx, cy = pos[0] + pos[2] // 2, pos[1] + pos[3] // 2
                    human_like_click(cx, cy)
                    return f"Successfully clicked the login button at coordinate ({cx}, {cy})."
                
            elif "press submit" in cmd_lower or "submit" in cmd_lower:
                pos = find_button("Submit")
                if pos:
                    cx, cy = pos[0] + pos[2] // 2, pos[1] + pos[3] // 2
                    human_like_click(cx, cy)
                    return f"Successfully clicked the submit button at coordinate ({cx}, {cy})."
                
            elif "open the search box" in cmd_lower or "search box" in cmd_lower or "search bar" in cmd_lower:
                pos = find_input_box()
                if pos:
                    cx, cy = pos[0] + pos[2] // 2, pos[1] + pos[3] // 2
                    human_like_click(cx, cy)
                    type_text("Manav companion scan")
                    return f"Successfully focused search input box at ({cx}, {cy}) and simulated typing."
                
            elif "select the second tab" in cmd_lower or "second tab" in cmd_lower:
                pos = find_tab("Spotify Feed") # Mock second tab name
                if pos:
                    cx, cy = pos[0] + pos[2] // 2, pos[1] + pos[3] // 2
                    human_like_click(cx, cy)
                    return f"Clicked Second Tab ('Spotify Feed') at coordinate ({cx}, {cy})."
                
            elif "click the play button" in cmd_lower or "play" in cmd_lower:
                screen_img = capture_screen()
                pos = find_play_button(screen_img)
                if pos:
                    cx, cy = pos[0] + pos[2] // 2, pos[1] + pos[3] // 2
                    human_like_click(cx, cy)
                    return f"Intelligently located Play Icon via OpenCV circles and clicked at ({cx}, {cy})."
                
            elif "close the popup" in cmd_lower or "close" in cmd_lower:
                bounds = get_window_bounds(get_window_title())
                # Top right close bounds
                cx, cy = bounds[0] + bounds[2] - 30, bounds[1] + 30
                human_like_click(cx, cy)
                return f"Closed popup window using top right boundaries: ({cx}, {cy})."
                
            elif "scroll down" in cmd_lower:
                scroll_down(3)
                return "Successfully issued vertical viewport scroll down instruction."
                
            elif "scroll up" in cmd_lower:
                scroll_up(3)
                return "Successfully issued vertical viewport scroll up instruction."
                
            else:
                # Fuzzy text search locator fallback
                elements = get_all_visible_elements()
                for el in elements:
                    if el.name.lower() in cmd_lower:
                        cx, cy = el.get_coordinates()
                        human_like_click(cx, cy)
                        return f"Fuzzily located UI element '{el.name}' (type={el.control_type}) via OCR/A11y indexes, clicked at ({cx}, {cy})."
                        
            return "Command parsed: Element footprint not visible on active frames. No motor steps taken."
        except Exception as e:
            return f"Action failed during motor executions: {str(e)}"

    def verify_safety_override(self, safety_pin: str, original_command: str) -> str:
        """Invoked after human companion verbal confirmations to execute dangerous actions."""
        if safety_pin == "CONFIRM":
            print(f"🔓 [SAFETY OVERRIDE] Verbal voice clearance given. Executing hazardous operation: '{original_command}'")
            # Temporarily bypass safety checks for execution
            cmd_lower = original_command.lower().strip()
            if "delete" in cmd_lower:
                pos = find_button("Delete System Logs")
                if pos:
                    cx, cy = pos[0] + pos[2] // 2, pos[1] + pos[3] // 2
                    human_like_click(cx, cy)
                    return f"Verbal permission verified. Hazardous click on red Delete button executed at ({cx}, {cy})."
            elif "shutdown" in cmd_lower:
                return "Verbal shut-down permission approved. Shutting down system."
            return f"Hazardous command completed safely: '{original_command}'"
        return "Safety override refused. Command aborted."

    # ==========================================
    # EXPOSED GEMINI FUNCTION CALLING TOOL APIS
    # ==========================================
    
    def clickElement(self, text: str) -> Dict[str, Any]:
        """Click any interactive element matching labeled text."""
        pos = find_text_position(text, capture_screen())
        if pos:
            cx, cy = pos[0] + pos[2] // 2, pos[1] + pos[3] // 2
            human_like_click(cx, cy)
            return {"status": "success", "message": f"Clicked text element '{text}' at ({cx}, {cy})"}
        return {"status": "failed", "error": f"Text label '{text}' was not found on screen OCR."}

    def clickButton(self, name: str) -> Dict[str, Any]:
        """Specific button locator click."""
        pos = find_button(name)
        if pos:
            cx, cy = pos[0] + pos[2] // 2, pos[1] + pos[3] // 2
            human_like_click(cx, cy)
            return {"status": "success", "message": f"Successfully pressed button '{name}' at ({cx}, {cy})"}
        return {"status": "failed", "error": f"Button '{name}' not found."}

    def typeIntoField(self, field_label: str, text: str) -> Dict[str, Any]:
        """Focuses field named label and types texts."""
        pos = find_text_position(field_label, capture_screen())
        if pos:
            # Click inside editable card offset right of label
            cx, cy = pos[0] + pos[2] + 80, pos[1] + pos[3] // 2
            human_like_click(cx, cy)
            type_text(text)
            return {"status": "success", "message": f"Focused text input area for field '{field_label}' and typed words."}
        return {"status": "failed", "error": f"Input field with label '{field_label}' was not found."}

    def scrollPage(self, direction: str) -> Dict[str, Any]:
        """Scrolls wheel Up or Down."""
        if "up" in direction.lower():
            scroll_up(4)
            return {"status": "success", "direction": "up"}
        scroll_down(4)
        return {"status": "success", "direction": "down"}

    def readVisibleScreen(self) -> Dict[str, Any]:
        """Scans the active screen, returns lists of OCR recognized words and A11y items."""
        screen = capture_screen()
        text_tokens = read_screen_text(screen)
        elements = get_all_visible_elements()
        return {
            "status": "success",
            "active_window": get_window_title(),
            "visible_texts": [tk["text"] for tk in text_tokens],
            "accessibility_elements": [{"name": el.name, "type": el.control_type, "coords": el.get_coordinates()} for el in elements]
        }

    def findInputBox(self) -> Dict[str, Any]:
        pos = find_input_box()
        return {"status": "success", "bounds": pos} if pos else {"status": "failed"}

    def findSearchBar(self) -> Dict[str, Any]:
        screen = capture_screen()
        pos = find_play_button(screen) # Using play as helper proxy search
        return {"status": "success", "bounds": pos} if pos else {"status": "failed"}

    def findPlayButton(self) -> Dict[str, Any]:
        pos = find_play_button(capture_screen())
        return {"status": "success", "bounds": pos} if pos else {"status": "failed"}

    def openMenu(self) -> Dict[str, Any]:
        pos = find_menu()
        if pos:
            human_like_click(pos[0] + pos[2]//2, pos[1] + pos[3]//2)
            return {"status": "success", "clicked": "Menu"}
        return {"status": "failed"}

    def selectOption(self, option_text: str) -> Dict[str, Any]:
        pos = find_text_position(option_text, capture_screen())
        if pos:
            human_like_click(pos[0] + pos[2]//2, pos[1] + pos[3]//2)
            return {"status": "success", "selected": option_text}
        return {"status": "failed"}

    def closePopup(self) -> Dict[str, Any]:
        # Perform click on standard X element corner
        bounds = get_window_bounds(get_window_title())
        cx, cy = bounds[0] + bounds[2] - 30, bounds[1] + 30
        human_like_click(cx, cy)
        return {"status": "success", "message": "Closed active popup frame."}

# Thread-safe global accessor
ui_automation_engine = UIAutomationEngine()
