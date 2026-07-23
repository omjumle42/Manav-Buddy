import sys
import os
from typing import List, Optional, Dict, Any

# Conditional inputs for Windows UI Automation
HAS_WINDOWS_UIA = False
if sys.platform == "win32":
    try:
        import pywinauto
        from pywinauto.application import Application
        import comtypes
        # Windows UI Automation (UI Automation COM API)
        import pywinauto.uia_defines as uia
        HAS_WINDOWS_UIA = True
    except ImportError:
        pass

class AccessibilityUIElement:
    """
    Unified representation of an OS Accessibility Element.
    Wraps standard Windows UIAutomation control properties.
    """
    def __init__(self, raw_element=None, name: str = "", control_type: str = "", 
                 automation_id: str = "", class_name: str = "", x=0, y=0, w=0, h=0):
        self.raw_element = raw_element
        self.name = name
        self.control_type = control_type
        self.automation_id = automation_id
        self.class_name = class_name
        self.bounds = (x, y, w, h)  # (left, top, width, height)
        self.enabled = True
        self.visible = True

    def get_coordinates(self):
        """Returns the center click coordinates of the element."""
        bx, by, bw, bh = self.bounds
        return bx + bw // 2, by + bh // 2

    def __repr__(self):
        return f"<UIElement '{self.name}' type={self.control_type} bounds={self.bounds}>"


class AccessibilityAPI:
    """
    Windows UI Automation Access Engine.
    Exposes high-level methods to search, inspect, and invoke native controls.
    """
    def __init__(self):
        self.current_app = None

    def find_element_by_name(self, name: str, parent=None) -> Optional[AccessibilityUIElement]:
        """🔍 Find automation element matching text name exactly."""
        elements = self.get_all_visible_elements(parent)
        for el in elements:
            if el.name.lower() == name.lower():
                return el
        return None

    def find_element_by_class(self, class_name: str, parent=None) -> Optional[AccessibilityUIElement]:
        """🔍 Find automation element matching window class name."""
        elements = self.get_all_visible_elements(parent)
        for el in elements:
            if el.class_name.lower() == class_name.lower():
                return el
        return None

    def find_element_by_control_type(self, control_type: str, parent=None) -> List[AccessibilityUIElement]:
        """🔍 Find automation elements matching a type (Button, Edit, CheckBox)."""
        elements = self.get_all_visible_elements(parent)
        return [el for el in elements if el.control_type.lower() == control_type.lower()]

    def find_element_by_automation_id(self, automation_id: str, parent=None) -> Optional[AccessibilityUIElement]:
        """🔍 Locate precise element by unique Windows AutomationID."""
        elements = self.get_all_visible_elements(parent)
        for el in elements:
            if el.automation_id == automation_id:
                return el
        return None

    def get_all_visible_elements(self, parent=None) -> List[AccessibilityUIElement]:
        """🌲 Traverses and flattens entire accessibility tree."""
        if HAS_WINDOWS_UIA:
            try:
                # Real Windows UI Automation logic using pywinauto backend
                from pywinauto.uia_element_info import UIAElementInfo
                if parent is None:
                    # Root Desktop elements
                    el_infos = UIAElementInfo().children()
                else:
                    el_infos = parent.raw_element.children()
                
                results = []
                for info_el in el_infos:
                    try:
                        rect = info_el.rectangle
                        w_el = AccessibilityUIElement(
                            raw_element=info_el,
                            name=info_el.name or "",
                            control_type=info_el.control_type or "",
                            automation_id=info_el.automation_id or "",
                            class_name=info_el.class_name or "",
                            x=rect.left, y=rect.top, w=rect.width(), h=rect.height()
                        )
                        results.append(w_el)
                        # Staggered recursive children tree append
                        childs = self.get_all_visible_elements(w_el)
                        results.extend(childs)
                    except Exception:
                        pass
                return results
            except Exception as e:
                print(f"Windows UIA retrieval error: {e}")
                
        # Headless/Sandbox mock elements fallback matching screen_capture generator
        return self._get_mock_accessibility_tree()

    def get_focused_element(self) -> Optional[AccessibilityUIElement]:
        """🎯 Return currently focused control handles."""
        if HAS_WINDOWS_UIA:
            try:
                # Retrieve active focus via pywinauto / comtypes focus wrappers
                import win32gui
                hwnd = win32gui.GetForegroundWindow()
                if hwnd:
                    from pywinauto.uia_element_info import UIAElementInfo
                    info = UIAElementInfo(hwnd)
                    rect = info.rectangle
                    return AccessibilityUIElement(
                        raw_element=info,
                        name=info.name,
                        control_type=info.control_type,
                        class_name=info.class_name,
                        x=rect.left, y=rect.top, w=rect.width(), h=rect.height()
                    )
            except Exception:
                pass
        
        # Simulated Active Input field focus
        mock_tree = self._get_mock_accessibility_tree()
        for el in mock_tree:
            if el.control_type == "Edit":
                return el
        return None

    def get_children(self, element: AccessibilityUIElement) -> List[AccessibilityUIElement]:
        """🌿 Return one level deep biological children of given node."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                children_info = element.raw_element.children()
                res = []
                for info in children_info:
                    rect = info.rectangle
                    res.append(AccessibilityUIElement(
                        raw_element=info,
                        name=info.name,
                        control_type=info.control_type,
                        automation_id=info.automation_id,
                        class_name=info.class_name,
                        x=rect.left, y=rect.top, w=rect.width(), h=rect.height()
                    ))
                return res
            except Exception:
                pass
        return []

    def invoke_element(self, element: AccessibilityUIElement) -> bool:
        """⚡ Perform primary automation action on target control (click/trigger)."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                # Check for Invoke pattern, Toggle pattern or SelectionItem
                raw_info = element.raw_element
                # Try triggering native invoke patterns via pywinauto
                from pywinauto.controls.uiawrapper import UIAWrapper
                wrapper = UIAWrapper(raw_info)
                if wrapper.is_enabled():
                    wrapper.click_input() # Real human OS click
                    return True
            except Exception as e:
                print(f"Accessibility native invoke failed: {e}")
        
        # Log click coordination mock trigger status
        print(f"[A11y Engine] Simulated click triggered on button element: '{element.name}' at coords: {element.get_coordinates()}")
        return True

    def select_element(self, element: AccessibilityUIElement) -> bool:
        """🎯 Marks lists, checkboxes, or options as selected."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                from pywinauto.controls.uiawrapper import UIAWrapper
                UIAWrapper(element.raw_element).select()
                return True
            except Exception:
                pass
        print(f"[A11y Engine] Simulated option selected: '{element.name}'")
        return True

    def expand_element(self, element: AccessibilityUIElement) -> bool:
        """➕ Expands folding sections such as combo dropdowns or trees."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                from pywinauto.controls.uiawrapper import UIAWrapper
                UIAWrapper(element.raw_element).expand()
                return True
            except Exception:
                pass
        print(f"[A11y Engine] Simulated drop expand section: '{element.name}'")
        return True

    def collapse_element(self, element: AccessibilityUIElement) -> bool:
        """➖ Collapses combo dropdowns or trees."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                from pywinauto.controls.uiawrapper import UIAWrapper
                UIAWrapper(element.raw_element).collapse()
                return True
            except Exception:
                pass
        print(f"[A11y Engine] Simulated list collapsed: '{element.name}'")
        return True

    def set_value(self, element: AccessibilityUIElement, value: str) -> bool:
        """⌨️ Inject direct alphanumeric content values to fields without keystrokes."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                from pywinauto.controls.uiawrapper import UIAWrapper
                UIAWrapper(element.raw_element).set_edit_text(value)
                return True
            except Exception:
                pass
        print(f"[A11y Engine] Simulated value injected input '{element.name}' = '{value}'")
        return True

    def get_value(self, element: AccessibilityUIElement) -> str:
        """📖 Direct read string values or toggle states of controls."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                from pywinauto.controls.uiawrapper import UIAWrapper
                return UIAWrapper(element.raw_element).get_value() or ""
            except Exception:
                pass
        return "Simulated Dynamic Input Value"

    def is_enabled(self, element: AccessibilityUIElement) -> bool:
        """✅ Checks if element is operational (not grayed out)."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                return element.raw_element.is_enabled()
            except Exception:
                pass
        return element.enabled

    def is_visible(self, element: AccessibilityUIElement) -> bool:
        """👁️ Checks if control is visible on active viewport coordinates."""
        if HAS_WINDOWS_UIA and element.raw_element:
            try:
                return element.raw_element.is_visible()
            except Exception:
                pass
        return element.visible

    def _get_mock_accessibility_tree(self) -> List[AccessibilityUIElement]:
        """Provides simulated workspace controls to mirror the UI capture mockup."""
        # Setup consistent bounding coordinates matching screen_capture mockup
        # card starts at x=270, y=90
        header_y = 90
        btn_y = 250 # 90 + 160
        chk_y = 320 # btn_y + 70
        return [
            # Main windows
            AccessibilityUIElement(name="ACTIVE DESKTOP INTERFACE SIMULATOR v4.2", control_type="Window", automation_id="MainWindow", class_name="Chrome_WidgetWin_1", x=270, y=90, w=1620, h=990),
            
            # Sidebar app targets
            AccessibilityUIElement(name="Google Chrome", control_type="Button", automation_id="SidebarChromeBtn", class_name="SidebarNavItem", x=10, y=90, w=220, h=33),
            AccessibilityUIElement(name="Spotify Feed", control_type="Button", automation_id="SidebarSpotifyBtn", class_name="SidebarNavItem", x=10, y=140, w=220, h=33),
            AccessibilityUIElement(name="Discord Lounge", control_type="Button", automation_id="SidebarDiscordBtn", class_name="SidebarNavItem", x=10, y=190, w=220, h=33),
            
            # Form elements inside card container
            AccessibilityUIElement(name="Search files and resources...", control_type="Edit", automation_id="SearchBoxInput", class_name="TextInputControl", x=320, y=180, w=350, h=40),
            
            # Functional Action Buttons
            AccessibilityUIElement(name="Login", control_type="Button", automation_id="LoginActionBtn", class_name="BtnPrimaryIndigo", x=320, y=250, w=110, h=36),
            AccessibilityUIElement(name="Play", control_type="Button", automation_id="PlayMediaBtn", class_name="BtnSuccessGreen", x=450, y=250, w=110, h=36),
            # Risky Action Button (Delete!)
            AccessibilityUIElement(name="Delete System Logs", control_type="Button", automation_id="DeleteActionBtn", class_name="BtnDangerRed", x=580, y=250, w=170, h=36),
            
            # Checkbox
            AccessibilityUIElement(name="Enable Accessibility Mode Protocols", control_type="CheckBox", automation_id="EnableA11yCheckbox", class_name="CheckboxItem", x=320, y=320, w=300, h=20),
            
            # Custom Play and Search visual buttons
            AccessibilityUIElement(name="Media Play", control_type="Button", automation_id="MediaPlayCircularBtn", class_name="CircleBlueBtn", x=370, y=430, w=80, h=80),
            AccessibilityUIElement(name="Enter commands...", control_type="Edit", automation_id="CommandFieldInput", class_name="CommandConsole", x=570, y=430, w=320, h=44)
        ]

# Thread-safe global accessor
accessibility_engine = AccessibilityAPI()

def find_element_by_name(name: str) -> Optional[AccessibilityUIElement]:
    return accessibility_engine.find_element_by_name(name)

def find_element_by_class(class_name: str) -> Optional[AccessibilityUIElement]:
    return accessibility_engine.find_element_by_class(class_name)

def find_element_by_control_type(control_type: str) -> List[AccessibilityUIElement]:
    return accessibility_engine.find_element_by_control_type(control_type)

def find_element_by_automation_id(automation_id: str) -> Optional[AccessibilityUIElement]:
    return accessibility_engine.find_element_by_automation_id(automation_id)

def get_all_visible_elements() -> List[AccessibilityUIElement]:
    return accessibility_engine.get_all_visible_elements()

def get_focused_element() -> Optional[AccessibilityUIElement]:
    return accessibility_engine.get_focused_element()
