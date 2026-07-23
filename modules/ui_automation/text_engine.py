from typing import Optional, Tuple, Any
from modules.ui_automation.accessibility_engine import find_element_by_name
from modules.ui_automation.ocr_engine import find_text_position
from modules.ui_automation.screen_capture import capture_screen

class TextEngineModule:
    """
    Manav Dedicated Text Helper Subsystem.
    """
    def __init__(self):
        pass

    def find_element_by_text(self, text: str) -> Optional[Tuple[int, int, int, int]]:
        """
        Locates element on screen containing specific text.
        Prioritizes Accessibility API matching.
        Falls back to Screen OCR analysis.
        """
        # 1. Try Accessibility API
        el = find_element_by_name(text)
        if el:
            return el.bounds

        # 2. Try OCR
        screen_img = capture_screen()
        pos = find_text_position(text, screen_img)
        if pos:
            return pos

        return None

# Thread-safe global accessor
text_engine = TextEngineModule()

def find_element_by_text(text: str) -> Optional[Tuple[int, int, int, int]]:
    return text_engine.find_element_by_text(text)
