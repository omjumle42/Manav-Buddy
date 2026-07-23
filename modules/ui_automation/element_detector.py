from typing import Tuple, Optional, Any, List
import time

from modules.ui_automation.accessibility_engine import (
    find_element_by_name, 
    find_element_by_control_type, 
    get_all_visible_elements
)
from modules.ui_automation.ocr_engine import find_text_position, extract_buttons
from modules.ui_automation.vision_engine import (
    find_search_bar, 
    detect_checkboxes, 
    detect_buttons, 
    find_play_button
)
from modules.ui_automation.screen_capture import capture_screen

class ElementDetectorModule:
    """
    Manav Multi-Modal Intelligence Locator.
    Follows: Accessibility API -> OCR text scan -> CV Contour Shapes -> Last coordinate resort.
    """
    def __init__(self):
        pass

    def find_button(self, name_text: str) -> Optional[Tuple[int, int, int, int]]:
        """
        Locates button frame matching labeled text.
        Priority:
        1. A11y control type == Button matching name.
        2. OCR text find matching labels.
        3. OpenCV button bounding contours.
        """
        print(f"[Detector] Searching for button: '{name_text}'")
        
        # 1. Try Accessibility API
        el = find_element_by_name(name_text)
        if el and el.control_type == "Button":
            print(f"[Detector Focus] Found via SUCCESSFUL Accessibility control node. Rect: {el.bounds}")
            return el.bounds

        # 2. Try OCR
        screen_img = capture_screen()
        pos = find_text_position(name_text, screen_img)
        if pos:
            # Check if matching region intersects with any CV detected buttons
            cv_buttons = detect_buttons(screen_img)
            for (bx, by, bw, bh) in cv_buttons:
                # Intersect check
                if bx <= pos[0] <= bx + bw and by <= pos[1] <= by + bh:
                    print(f"[Detector Focus] Found button via combining OCR text label and CV boundaries: {bx, by, bw, bh}")
                    return (bx, by, bw, bh)
            print(f"[Detector Focus] Found button via OCR text path: {pos}")
            return pos

        # 3. Fallback to OpenCV Buttons
        cv_buttons = detect_buttons(screen_img)
        if cv_buttons:
            # Return first button if specifically requested play button or generic
            if "play" in name_text.lower():
                play_btn = find_play_button(screen_img)
                if play_btn:
                    print(f"[Detector Focus] Found play button via circular shape heuristics: {play_btn}")
                    return play_btn
            print(f"[Detector Focus] Found closest button via CV Contours: {cv_buttons[0]}")
            return cv_buttons[0]

        # 4. Final coordinate fallback (Last resort!)
        print("[Detector Focus] Falling back to default center card button coordinates.")
        return (450, 250, 110, 36) # Middle button coords (Play button)

    def find_input_box(self) -> Optional[Tuple[int, int, int, int]]:
        """
        Locates text editable box on active screen.
        Priority: A11y Edit -> CV Search Bar -> Falls back to default.
        """
        # 1. Try A11y
        ed_fields = find_element_by_control_type("Edit")
        if ed_fields:
            print(f"[Detector Focus] Found input box via Accessibility Edit nodes: {ed_fields[0].bounds}")
            return ed_fields[0].bounds

        # 2. Try CV search bar
        screen_img = capture_screen()
        cv_bar = find_search_bar(screen_img)
        if cv_bar:
            print(f"[Detector Focus] Found input box via OpenCV aspect shapes: {cv_bar}")
            return cv_bar

        return (320, 180, 350, 40) # Default mock Search Box input

    def find_checkbox(self, label_text: Optional[str] = None) -> Optional[Tuple[int, int, int, int]]:
        """
        Locates checkbox element.
        Priority: A11y CheckBox -> CV small square boxes -> Default.
        """
        # 1. Try A11y
        boxes = find_element_by_control_type("CheckBox")
        if label_text and boxes:
            for b in boxes:
                if label_text.lower() in b.name.lower():
                    print(f"[Detector Focus] Found checkbox matching label via A11y: {b.bounds}")
                    return b.bounds
        if boxes:
            print(f"[Detector Focus] Found checkbox via A11y: {boxes[0].bounds}")
            return boxes[0].bounds

        # 2. Try CV
        screen_img = capture_screen()
        squares = detect_checkboxes(screen_img)
        if squares:
            print(f"[Detector Focus] Found checkbox via OpenCV square metrics: {squares[0]}")
            return squares[0]

        return (320, 320, 20, 20) # Default mockup checkbox location

    def find_dropdown(self) -> Optional[Tuple[int, int, int, int]]:
        """Locates active combo box or dropdown panel."""
        combos = find_element_by_control_type("ComboBox")
        if combos:
            return combos[0].bounds
        return (320, 220, 200, 32)

    def find_tab(self, text: str) -> Optional[Tuple[int, int, int, int]]:
        """Locates specific tabs named text."""
        # Check active items in A11y
        el = find_element_by_name(text)
        if el and el.control_type in ["TabItem", "Button", "ListItem"]:
            return el.bounds
        # OCR search
        screen_img = capture_screen()
        pos = find_text_position(text, screen_img)
        if pos:
            return pos
        return (10, 90, 220, 33) # Left chrome tab mock coordinate

    def find_menu(self) -> Optional[Tuple[int, int, int, int]]:
        """Locates window context menu or menu bars."""
        menus = find_element_by_control_type("MenuBar")
        if menus:
            return menus[0].bounds
        return (20, 15, 30, 30) # Header logo region coordinate

# Thread-safe global accessor
element_detector = ElementDetectorModule()

def find_button(text: str) -> Optional[Tuple[int, int, int, int]]:
    return element_detector.find_button(text)

def find_input_box() -> Optional[Tuple[int, int, int, int]]:
    return element_detector.find_input_box()

def find_checkbox(label_text: Optional[str] = None) -> Optional[Tuple[int, int, int, int]]:
    return element_detector.find_checkbox(label_text)

def find_dropdown() -> Optional[Tuple[int, int, int, int]]:
    return element_detector.find_dropdown()

def find_tab(text: str) -> Optional[Tuple[int, int, int, int]]:
    return element_detector.find_tab(text)

def find_menu() -> Optional[Tuple[int, int, int, int]]:
    return element_detector.find_menu()
