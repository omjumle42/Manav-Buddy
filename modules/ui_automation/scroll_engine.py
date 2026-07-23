from typing import Any
from modules.ui_automation.click_engine import scroll_up, scroll_down, scroll_to_element

class ScrollEngineModule:
    """
    Manav Dedicated Scrolling Actions Engine.
    Exposes granular control over wheel scrolling steps.
    """
    def __init__(self):
        pass

    def scroll_up(self, clicks: int = 3) -> None:
        scroll_up(clicks)

    def scroll_down(self, clicks: int = 3) -> None:
        scroll_down(clicks)

    def scroll_to_element(self, element: Any) -> None:
        scroll_to_element(element)

# Thread-safe global accessor
scroll_engine = ScrollEngineModule()
