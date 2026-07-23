import sys
import time
import random
from typing import List, Optional

# Try to import keyboard / pyautogui wrappers
HAS_KEYBOARD_API = False
try:
    import pyautogui
    # On Windows/Linux, keyboard package is standard for low-level hook listeners
    import keyboard
    HAS_KEYBOARD_API = True
except Exception:
    pass

class KeyboardEngineModule:
    """
    Manav Keyboard Automation and Keystroke Emulator.
    Implements typing speed variations, human-like typos, copy-paste mappings,
    and standard navigation keys (Tab, Enter, Escape, Backspace).
    """
    
    def __init__(self):
        # Human typing speed settings: words per minute average (80 WPM)
        # 1 word ~ 5 characters. Char delay around 150ms average
        self.mean_char_delay = 0.12
        self.std_dev = 0.04

    def press_key(self, key: str) -> None:
        """Triggers a physical down-up keystroke of key name."""
        if HAS_KEYBOARD_API:
            try:
                pyautogui.press(key)
            except Exception:
                pass
        else:
            print(f"[Keyboard] Key pressed down: '{key}'")

    def hotkey(self, *keys: str) -> None:
        """Invokes key-combination complexes (e.g. ['ctrl', 'alt', 'del'] or ['ctrl', 'c'])."""
        if HAS_KEYBOARD_API:
            try:
                pyautogui.hotkey(*keys)
            except Exception:
                pass
        else:
            print(f"[Keyboard Combo] Hotkey triggered: { ' + '.join(keys) }")

    def type_text(self, text: str, error_rate: float = 0.02) -> None:
        """
        Simulates typical human keyboard typing.
        - Gaussian keystroke delays (varying speed)
        - Dynamic shift holdings for capitalizations
        - Controlled mistakes (typos) and immediate backspace correction.
        """
        typo_keys = {
            'a': 'qwsz', 'b': 'vghn', 'c': 'xvdf', 'd': 'ersfxc',
            'e': 'wsdr', 'f': 'rtgvcd', 'g': 'tyhbvf', 'h': 'yujnbg',
            'i': 'ujko', 'j': 'uikmnh', 'k': 'ijlm', 'l': 'kop',
            'm': 'njk', 'n': 'bhjm', 'o': 'iklp', 'p': 'ol',
            'q': 'wa', 'r': 'edft', 's': 'wedzax', 't': 'rfgy',
            'u': 'yhji', 'v': 'cfgb', 'w': 'qase', 'x': 'zsdc',
            'y': 'tghu', 'z': 'asx'
        }

        i = 0
        while i < len(text):
            char = text[i]
            
            # Form mistake? (Only on lower alphabets and if error_rate criteria is met)
            if error_rate > 0 and char.lower() in typo_keys and random.random() < error_rate:
                mistake_options = typo_keys[char.lower()]
                wrong_char = random.choice(mistake_options)
                # Capitalize mistake if original was uppercase
                if char.isupper():
                    wrong_char = wrong_char.upper()
                
                # Type mistake char
                self._type_single_character(wrong_char)
                print(f"[Typo Mode] Accidental character typed: '{wrong_char}'")
                
                # Puzzled cognitive correction delay (70ms - 200ms)
                time.sleep(random.uniform(0.12, 0.28))
                
                # Backspace trigger
                self.backspace()
                time.sleep(random.uniform(0.08, 0.18))
                
            # Type actual character
            self._type_single_character(char)
            i += 1

    def _type_single_character(self, char: str) -> None:
        """Internal emulator to press and key down a single character."""
        if HAS_KEYBOARD_API:
            try:
                # pyautogui supports typing string directly, but doing it key-by-key allows fine timing control
                pyautogui.write(char)
            except Exception:
                pass
        else:
            # Silent output representation to avoid CLI dumping
            pass
            
        # Modulates typing speed on a Gaussian bell curve (natural finger speed limits)
        delay = random.gauss(self.mean_char_delay, self.std_dev)
        # Cap limits to prevent negatives or extremely long stalls
        delay = max(0.02, min(0.4, delay))
        
        # Add micro rest spaces on punctuation markers
        if char in ['.', ',', '!', '?']:
            delay += random.uniform(0.2, 0.45)
        elif char == ' ':
            delay += random.uniform(0.05, 0.15)
            
        time.sleep(delay)

    def copy(self) -> None:
        """Physical ctrl+c action to populate clipboard buffer."""
        cmd_key = 'command' if sys.platform == 'darwin' else 'ctrl'
        self.hotkey(cmd_key, 'c')

    def paste(self) -> None:
        """Physical ctrl+v action."""
        cmd_key = 'command' if sys.platform == 'darwin' else 'ctrl'
        self.hotkey(cmd_key, 'v')

    def enter(self) -> None:
        """Physical Enter key click."""
        self.press_key('enter')

    def escape(self) -> None:
        """Physical Escape key click."""
        self.press_key('escape')

    def tab(self) -> None:
        """Physical navigate tab key click."""
        self.press_key('tab')

    def backspace(self) -> None:
        """Backspace delete key click."""
        self.press_key('backspace')

# Thread-safe global accessor
keyboard_engine = KeyboardEngineModule()

def press_key(key: str) -> None:
    keyboard_engine.press_key(key)

def hotkey(*keys_list: str) -> None:
    keyboard_engine.hotkey(*keys_list)

def type_text(text: str) -> None:
    keyboard_engine.type_text(text)

def copy() -> None:
    keyboard_engine.copy()

def paste() -> None:
    keyboard_engine.paste()

def enter() -> None:
    keyboard_engine.enter()

def escape() -> None:
    keyboard_engine.escape()

def tab() -> None:
    keyboard_engine.tab()

def backspace() -> None:
    keyboard_engine.backspace()
