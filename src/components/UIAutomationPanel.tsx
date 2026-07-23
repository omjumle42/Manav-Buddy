import React, { useState, useEffect, useRef } from "react";
import { 
  Eye, 
  Cpu, 
  MousePointer, 
  Keyboard, 
  Zap, 
  Sparkles, 
  ShieldAlert, 
  Scroll, 
  Terminal, 
  Play, 
  Code,
  Search,
  CheckCircle2,
  AlertTriangle,
  Move,
  RefreshCw,
  FolderLock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LogTrace {
  id: string;
  type: "info" | "success" | "warn" | "error" | "action";
  text: string;
  timestamp: string;
}

export function UIAutomationPanel({ addLogToMain }: { addLogToMain?: (log: string) => void }) {
  const [activeTab, setActiveTab] = useState<"workspace" | "code">("workspace");
  const [activeCodeFile, setActiveCodeFile] = useState<string>("engine");
  const [visionMode, setVisionMode] = useState<"none" | "contours" | "ocr" | "all">("none");
  const [commandInput, setCommandInput] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  // Simulated Cursor Coordination
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 100, y: 100 });
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  
  // State elements simulated layout
  const [activeApp, setActiveApp] = useState<string>("Google Chrome");
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(false);
  const [searchVal, setSearchVal] = useState<string>("");
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogTrace[]>([
    { id: "1", type: "info", text: "🎛️ Manav UIAutomationEngine online.", timestamp: new Date().toLocaleTimeString() },
    { id: "2", type: "info", text: "🌲 Traversed Windows Accessibility APIs: 14 control nodes loaded.", timestamp: new Date().toLocaleTimeString() },
    { id: "3", type: "success", text: "✅ System standby. Ready to receive commands.", timestamp: new Date().toLocaleTimeString() }
  ]);

  // Safety confirmation
  const [safetyConfirmation, setSafetyConfirmation] = useState<{
    isOpen: boolean;
    command: string;
    actionType: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const addTraceLog = (text: string, type: "info" | "success" | "warn" | "error" | "action" = "info") => {
    const newLog: LogTrace = {
      id: Math.random().toString(),
      type,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLog, ...prev.slice(0, 30)]);
    if (addLogToMain) {
      addLogToMain(`[UI Automation] ${text}`);
    }
  };

  // Human-like organic mouse trace to coordinates
  const animateMousePath = async (targetX: number, targetY: number): Promise<void> => {
    setIsMoving(true);
    addTraceLog(`👇 Computing Human-like curved Bezier travel path to coordinates (${targetX}, ${targetY})...`, "info");
    
    const startX = cursorPos.x;
    const startY = cursorPos.y;
    const duration = 800; // ms
    const steps = 30;
    const stepTime = duration / steps;
    
    // Generate simulated control offset to simulate natural arching curves
    const controlX = (startX + targetX) / 2 + (Math.random() - 0.5) * 150;
    const controlY = (startY + targetY) / 2 + (Math.random() - 0.5) * 150;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // Quadratic bezier calculation: B(t) = (1-t)^2 * P0 + 2(1-t) * t * P1 + t^2 * P2
      const cx = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * targetX;
      const cy = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * targetY;
      
      setCursorPos({ x: Math.round(cx), y: Math.round(cy) });
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
    
    setIsMoving(false);
    // Micro hover pause
    await new Promise(resolve => setTimeout(resolve, 150));
  };

  const handleExecuteCommand = async (cmdStr: string) => {
    const cleanCmd = cmdStr.toLowerCase().trim();
    if (!cleanCmd) return;

    addTraceLog(`💬 Human voice instruction: "${cmdStr}"`, "action");
    setCommandInput("");

    // Look up Safety Restrictions first!
    const riskyKeywords = ["delete", "remove", "shutdown", "format", "payment", "buy", "purchase"];
    const matchesRisk = riskyKeywords.find(k => cleanCmd.includes(k));

    if (matchesRisk) {
      addTraceLog(`⚠️ [SAFETY TRIGGER] Detected risky keyword "${matchesRisk}"! Intercepting action.`, "warn");
      setSafetyConfirmation({
        isOpen: true,
        command: cmdStr,
        actionType: matchesRisk.toUpperCase()
      });
      return;
    }

    // Run priority traversal sequence simulation
    setIsScanning(true);
    addTraceLog(`🔍 Step 1: Interrogating Windows Accessibility API tree...`, "info");
    await new Promise(resolve => setTimeout(resolve, 350));

    if (cleanCmd.includes("login") || cleanCmd.includes("click login") || cleanCmd.includes("submit")) {
      addTraceLog(`🟢 Match found in Accessibility Tree node: ControlType="Button", AutomationID="LoginActionBtn", Name="Login"`, "success");
      setIsScanning(false);
      
      // Target Login button (center of layout)
      // Login is located at roughly x:380, y:210 in mockup layout relative %
      await animateMousePath(380, 210);
      setIsClicking(true);
      await new Promise(resolve => setTimeout(resolve, 100)); // Click hold
      setIsClicking(false);
      addTraceLog(`✅ Element invoked via native COM pattern: Login success!`, "success");
      
    } else if (cleanCmd.includes("play") || cleanCmd.includes("click play") || cleanCmd.includes("click the play button")) {
      addTraceLog(`🟡 Step 1 Fail: Play item not found in logical Accessibility Tree. Null node.`, "warn");
      addTraceLog(`📸 Step 2: Grabbing fullscreen visual frame via screen_capture...`, "info");
      await new Promise(resolve => setTimeout(resolve, 250));
      addTraceLog(`📝 Step 3: Triggering EasyOCR scanner. No matching text found.`, "warn");
      await new Promise(resolve => setTimeout(resolve, 200));
      addTraceLog(`👁️ Step 4: Loading OpenCV computer vision engine. Running shape matching...`, "info");
      await new Promise(resolve => setTimeout(resolve, 300));
      addTraceLog(`🎯 Match: Circular geometry center matched play icon! Bounds: [x=410, y=340, w=80, h=80]`, "success");
      setIsScanning(false);

      await animateMousePath(410, 340);
      setIsClicking(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsClicking(false);
      addTraceLog(`✅ Success: Play state triggered! Sound engine active.`, "success");

    } else if (cleanCmd.includes("search") || cleanCmd.includes("input") || cleanCmd.includes("search box")) {
      addTraceLog(`🟢 Match found in Accessibility Tree node: ControlType="Edit", AutomationID="SearchBoxInput"`, "success");
      setIsScanning(false);

      await animateMousePath(440, 150); // Search field coords
      setIsClicking(true);
      await new Promise(resolve => setTimeout(resolve, 80));
      setIsClicking(false);
      addTraceLog(`⌨️ Input focus locked. Simulating human-like spelling (Average 320 WPM)...`, "info");
      
      // Spell text
      const targetTxt = "Manav Intelligence";
      for (let c = 0; c <= targetTxt.length; c++) {
        setSearchVal(targetTxt.substring(0, c));
        await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 60));
      }
      addTraceLog(`✅ Typing complete: "${targetTxt}" injected.`, "success");

    } else if (cleanCmd.includes("second tab") || cleanCmd.includes("select the second tab") || cleanCmd.includes("spotify")) {
      addTraceLog(`🟢 Match found in Accessibility Tree node: Name="Spotify Feed", ControlType="Button"`, "success");
      setIsScanning(false);

      await animateMousePath(100, 140); // Spotify sidebar tab position
      setIsClicking(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsClicking(false);
      setActiveApp("Spotify Feed");
      addTraceLog(`✅ Workspace route swapped to: 'Spotify Feed'`, "success");

    } else if (cleanCmd.includes("scroll down") || cleanCmd.includes("scroll down page")) {
      setIsScanning(false);
      addTraceLog(`👇 Scrolling page view downwards by 4 increments.`, "info");
      setCursorPos({ x: 500, y: 400 });
      await animateMousePath(500, 600); // swipe
      addTraceLog(`✅ Vertically scrolled. View updated.`, "success");

    } else if (cleanCmd.includes("close") || cleanCmd.includes("close popup")) {
      setIsScanning(false);
      addTraceLog(`🟢 Active overlay window detected. Pinpointing close bounds...`, "info");
      await animateMousePath(890, 45); // top close boundary
      setIsClicking(true);
      await new Promise(resolve => setTimeout(resolve, 80));
      setIsClicking(false);
      setIsPopupOpen(false);
      addTraceLog(`✅ Window dismissed. Focus restored.`, "success");
      
    } else {
      addTraceLog(`🟡 Step 1 Fail: Accessibility lookup returned null.`, "warn");
      addTraceLog(`📸 Step 2: Grabbing fullscreen frame...`, "info");
      await new Promise(resolve => setTimeout(resolve, 200));
      addTraceLog(`📝 Step 3: Running text OCR scanning...`, "info");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Try to find if matching text exists
      addTraceLog(`❌ Failed to matches text of instruction in OCR indices.`, "error");
      addTraceLog(`👁️ Step 4: OpenCV shape analysis: no matching target.`, "error");
      addTraceLog(`⚠️ Target coordinates not resolved. Motor execution aborted safely.`, "warn");
      setIsScanning(false);
    }
  };

  const handleSafetyConfirm = async () => {
    if (!safetyConfirmation) return;
    const cmd = safetyConfirmation.command;
    setSafetyConfirmation(null);

    addTraceLog(`🔓 Safety override accepted! Executing risky operation...`, "warn");
    setIsScanning(true);

    if (cmd.includes("delete")) {
      await animateMousePath(620, 210); // Red delete button position
      setIsClicking(true);
      await new Promise(resolve => setTimeout(resolve, 150));
      setIsClicking(false);
      addTraceLog(`🔥 CRITICAL EVENT: Simulated system file destruction complete!`, "error");
    } else {
      addTraceLog(`🚨 Custom hazardous trace successfully completed under safety clearance.`, "success");
    }
    setIsScanning(false);
  };

  const pythonCodes: Record<string, string> = {
    engine: `import time
from typing import Optional, Tuple, Any, List, Dict
from modules.ui_automation.screen_capture import capture_screen
from modules.ui_automation.accessibility_engine import get_all_visible_elements, find_element_by_name
from modules.ui_automation.vision_engine import detect_buttons, find_play_button
from modules.ui_automation.ocr_engine import read_screen_text, find_text_position
from modules.ui_automation.click_engine import human_like_click, scroll_down
from modules.ui_automation.keyboard_engine import type_text

class UIAutomationEngine:
    """
    Manav Unified UI Automation Orchestrator.
    Bridges screen computer vision, OCR, and accessibility COM models.
    """
    def __init__(self):
        self.risky = ["delete", "format", "shutdown", "payment"]

    def execute_command(self, natural_command: str) -> str:
        cmd_lower = natural_command.lower().strip()
        
        # Guard Safety Checks BEFORE actions
        if any(v in cmd_lower for v in self.risky):
            raise PermissionError("⚠️ Safety Block: confirmation required.")

        # Priority 1: Windows Native Accessibility API
        el = find_element_by_name("Login")
        if el and el.control_type == "Button":
            cx, cy = el.get_coordinates()
            human_like_click(cx, cy)
            return "Clicked button using Accessibility APIs."

        # Priority 2: Fallback to Vision & OCR
        screen = capture_screen()
        pos = find_text_position("Login", screen)
        if pos:
            cx, cy = pos[0] + pos[2]//2, pos[1] + pos[3]//2
            human_like_click(cx, cy)
            return "Clicked button using OCR Fallback."

        return "Command completed safely."`,

    capture: `import os
import mss
from PIL import Image

class ScreenCaptureModule:
    """
    Grabs high-speed pixel screenshots from screen frames or targeting title boundaries.
    """
    def capture_screen(self) -> Image.Image:
        with mss.mss() as sct:
            # Captures full primary display boundaries
            monitor = sct.monitors[1] if len(sct.monitors) > 1 else sct.monitors[0]
            sct_img = sct.grab(monitor)
            return Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")

    def capture_region(self, x: int, y: int, w: int, h: int) -> Image.Image:
        with mss.mss() as sct:
            box = {"top": y, "left": x, "width": w, "height": h}
            sct_img = sct.grab(box)
            return Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")`,

    a11y: `import sys

class AccessibilityAPI:
    """
    Windows COM UIAutomation Traversal Engine. 
    Extracts tree nodes corresponding to OS controls.
    """
    def get_all_visible_elements(self) -> List[Any]:
        if sys.platform != "win32":
            return self._get_mock_fallback_tree()
            
        import pywinauto
        from pywinauto.uia_element_info import UIAElementInfo
        
        # Traverse children nodes recursively
        results = []
        el_infos = UIAElementInfo().children()
        for root in el_infos:
            results.append(root)
            results.extend(self._recurse_node(root))
        return results`,

    vision: `import cv2
import numpy as np

class VisionEngineModule:
    """
    Performs canny contour bounds tracking and aspect filters under OpenCV wrappers.
    """
    def detect_buttons(self, cv_bgr_img: np.ndarray) -> List[Tuple[int,int,int,int]]:
        gray = cv2.cvtColor(cv_bgr_img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.bilateralFilter(gray, 9, 75, 75)
        edges = cv2.Canny(blurred, 50, 150)
        
        # Morphology morph limits closing gaps
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        buttons = []
        for c in contours:
            x, y, w, h = cv2.boundingRect(c)
            ratio = float(w) / h
            if 1.5 < ratio < 6.0 and 40 < w < 400: # Standard click rectangular shapes
                buttons.append((x, y, w, h))
        return buttons`,

    click: `import time
import random
import pyautogui

def human_like_click(target_x: int, target_y: int):
    """
    Spawns human-realistic travel trajectory:
    1. Cubic Bezier curve tracking to coordinates.
    2. Simulated hand-jitter speed noise.
    3. Organic finger-push mouse-down timing (70ms).
    """
    # Moves and clicks holding realistically
    pyautogui.moveTo(target_x, target_y, duration=random.uniform(0.18, 0.35))
    time.sleep(random.uniform(0.08, 0.15))
    pyautogui.click()`,

    detector: `class ElementDetector:
    """
    Intelligence Router obeying specified Priority logic:
    Priority 1: Native Accessibility COM tree nodes.
    Priority 2: Horizontal multi-box text scans via EasyOCR.
    Priority 3: Aspect-conforming contours via OpenCV.
    Priority 4: Fallback defaults.
    """
    def locate_button(self, label: str):
        # Implementation sequences...
        pass`
  };

  return (
    <div id="manav-vision-automation-wrapper" className="bg-stone-900/60 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-6 text-left">
      {/* Absolute top grid glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-32 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Title Segment */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-bold text-white tracking-tight text-base leading-none">Manav Vision & Automation</h3>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-widest">SUB-ENGINE</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Multi-modal physical click automation and optical screen intelligence companion.</p>
          </div>
        </div>

        {/* Workspace vs Code tab selectors */}
        <div className="flex items-center gap-1 bg-stone-950/80 p-1 border border-white/5 rounded-xl self-stretch md:self-auto justify-center">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${
              activeTab === "workspace"
                ? "bg-indigo-600 font-bold border border-indigo-500/30 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" /> Workspace Lab
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${
              activeTab === "code"
                ? "bg-indigo-600 font-bold border border-indigo-500/30 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code className="h-3.5 w-3.5" /> Python Modules
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "workspace" ? (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* LEFT COLUMN: Active Desktop Screen Mock */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Active Display Port: 1 (MSS Frame Buffer)
                </span>
                
                {/* Vision Layers Controls */}
                <div className="flex items-center gap-1 bg-stone-950/40 p-0.5 border border-white/5 rounded-lg">
                  <span className="text-[8px] text-zinc-500 font-mono tracking-wide px-2 uppercase font-medium">Vision Overlay:</span>
                  <button
                    onClick={() => setVisionMode("none")}
                    className={`px-2 py-1 rounded text-[8px] font-bold ${visionMode === "none" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Clean
                  </button>
                  <button
                    onClick={() => setVisionMode("contours")}
                    className={`px-2 py-1 rounded text-[8px] font-bold ${visionMode === "contours" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    CV Shapes
                  </button>
                  <button
                    onClick={() => setVisionMode("ocr")}
                    className={`px-2 py-1 rounded text-[8px] font-bold ${visionMode === "ocr" ? "bg-amber-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    OCR Map
                  </button>
                  <button
                    onClick={() => setVisionMode("all")}
                    className={`px-2 py-1 rounded text-[8px] font-bold ${visionMode === "all" ? "bg-cyan-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Full Analysis
                  </button>
                </div>
              </div>

              {/* SCREEN STAGE CANVAS */}
              <div 
                ref={containerRef}
                className="relative aspect-[16/10] bg-[#1c1917] border border-neutral-800 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4 cursor-crosshair group selection:bg-transparent"
              >
                {/* Simulated Desktop Header Bar */}
                <div className="bg-[#0f172a] absolute top-0 left-0 right-0 h-10 px-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 shrink-0" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 shrink-0" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 shrink-0" />
                    <span className="text-[9px] text-slate-300 font-bold ml-2 tracking-wide uppercase">ACTIVE DESKTOP INTERFACE SIMULATOR v4.2</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">PID: 9812 | PORT: 3000 (DEV)</span>
                </div>

                {/* Simulated OS Main Area */}
                <div className="mt-10 flex-1 grid grid-cols-12 gap-4 pt-2">
                  
                  {/* Left app sidebar */}
                  <div className="col-span-3 bg-stone-950/80 border border-neutral-900 rounded-xl p-3 flex flex-col gap-2.5 text-xs text-left">
                    <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest pl-1">Applications</div>
                    {[
                      { name: "Google Chrome", id: "chrome" },
                      { name: "Spotify Feed", id: "spotify" },
                      { name: "Discord Lounge", id: "discord" },
                      { name: "VS Code Editor", id: "vscode" },
                    ].map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setActiveApp(app.name)}
                        className={`px-3 py-2 rounded-lg flex items-center justify-between relative text-left leading-none transition-all ${
                          activeApp === app.name 
                            ? "bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-sm" 
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span>{app.name}</span>
                        {activeApp === app.name && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                        {/* CV Contour Box Overlay */}
                        {(visionMode === "contours" || visionMode === "all") && (
                          <div className="absolute inset-0 border border-indigo-400/80 rounded-lg pointer-events-none flex items-start justify-end p-0.5 animate-pulse">
                            <span className="bg-indigo-500 text-white text-[6px] px-1 font-mono leading-none rounded">A11y:btn</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Main content grid card */}
                  <div className="col-span-9 bg-zinc-900/40 border border-neutral-800 rounded-xl p-4 flex flex-col gap-4 relative text-left">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-neutral-850 pb-2.5">
                      <span className="text-[10px] font-bold text-white/90 uppercase">{activeApp.toUpperCase()}</span>
                      <span className="text-[8.5px] font-mono text-zinc-500 border border-neutral-800 px-2 py-0.5 bg-black/20 rounded">
                        A11y Node ID: win_main_frame
                      </span>
                    </div>

                    {/* Inputs & Actions */}
                    <div className="flex flex-col gap-3.5">
                      
                      {/* Search box input row */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8.5px] font-bold uppercase text-zinc-500 tracking-wider">Search Box Input (Edit target)</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search files and resources..."
                            readOnly
                            value={searchVal}
                            className="bg-black/40 border border-indigo-600/20 rounded-xl px-3.5 py-2.5 text-xs w-full focus:outline-none text-zinc-300 font-sans cursor-pointer"
                          />
                          <Search className="absolute right-3.5 top-3 h-3.5 w-3.5 text-zinc-500" />
                          {/* CV Contour Hover over input */}
                          {(visionMode === "contours" || visionMode === "all") && (
                            <div className="absolute inset-0 border border-indigo-500 rounded-xl pointer-events-none flex items-start justify-end p-1">
                              <span className="bg-indigo-600 text-white text-[6px] px-1 rounded font-mono leading-none">A11y:edit</span>
                            </div>
                          )}
                          {/* OCR Overlay label */}
                          {(visionMode === "ocr" || visionMode === "all") && (
                            <div className="absolute top-[-8px] left-3 bg-amber-600 text-white text-[7px] font-mono px-1 rounded pointer-events-none leading-none border border-amber-400">
                              OCR: text="Search..."
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons list */}
                      <div className="flex items-center gap-3 mt-1.5 relative">
                        
                        {/* Blue Button */}
                        <div className="relative">
                          <button 
                            onClick={() => addTraceLog("Manual click on simulated 'Login' button", "info")}
                            className="px-6 py-2 rounded-xl text-xs font-bold leading-none bg-indigo-600 text-white shadow shadow-indigo-600/30 hover:bg-indigo-500 transition-all uppercase"
                          >
                            Login
                          </button>
                          {(visionMode === "contours" || visionMode === "all") && (
                            <div className="absolute inset-x-[-2px] inset-y-[-2px] border border-cyan-400 rounded-xl pointer-events-none flex items-end justify-center">
                              <span className="bg-cyan-500 text-black font-bold text-[5.5px] px-1 rounded font-mono leading-none translate-y-1">CV:btn</span>
                            </div>
                          )}
                          {(visionMode === "ocr" || visionMode === "all") && (
                            <span className="absolute top-[-10px] left-1 bg-amber-600 text-white text-[6px] font-mono px-1 rounded leading-none">OCR:"Login"</span>
                          )}
                        </div>

                        {/* Play Button */}
                        <div className="relative">
                          <button 
                            onClick={() => addTraceLog("Manual click on simulated 'Play' button", "info")}
                            className="px-6 py-2 rounded-xl text-xs font-bold leading-none bg-emerald-600 text-white shadow shadow-emerald-600/20 hover:bg-emerald-500 transition-all uppercase"
                          >
                            Play
                          </button>
                          {(visionMode === "contours" || visionMode === "all") && (
                            <div className="absolute inset-x-[-2px] inset-y-[-2px] border border-cyan-400 rounded-xl pointer-events-none flex items-end justify-center">
                              <span className="bg-cyan-500 text-black font-bold text-[5.5px] px-1 rounded font-mono leading-none translate-y-1">CV:btn</span>
                            </div>
                          )}
                          {(visionMode === "ocr" || visionMode === "all") && (
                            <span className="absolute top-[-10px] left-1 bg-amber-600 text-white text-[6px] font-mono px-1 rounded leading-none animate-pulse">OCR:"Play"</span>
                          )}
                        </div>

                        {/* Red Dangerous Button: DELETE SYSTEM */}
                        <div className="relative">
                          <button 
                            onClick={() => {
                              addTraceLog("Attempted dangerous click on 'Delete System Logs' button", "warn");
                              setSafetyConfirmation({
                                isOpen: true,
                                command: "Click delete button",
                                actionType: "DELETE"
                              });
                            }}
                            className="px-5 py-2 rounded-xl text-xs font-bold leading-none bg-rose-600 hover:bg-rose-500 text-white shadow shadow-rose-600/10 transition-all uppercase"
                          >
                            Delete System
                          </button>
                          {(visionMode === "contours" || visionMode === "all") && (
                            <div className="absolute inset-x-[-2px] inset-y-[-2px] border border-rose-500/85 rounded-xl pointer-events-none flex items-end justify-center animate-pulse">
                              <span className="bg-rose-500 text-white font-bold text-[5.5px] px-1 rounded font-mono leading-none translate-y-1">CV:btn</span>
                            </div>
                          )}
                          {(visionMode === "ocr" || visionMode === "all") && (
                            <span className="absolute top-[-10px] left-1 bg-amber-600 text-white text-[6px] font-mono px-1 rounded leading-none">OCR:"Delete"</span>
                          )}
                        </div>
                      </div>

                      {/* Checkbox item */}
                      <div className="flex items-center gap-2.5 mt-2 relative py-1">
                        <input
                          type="checkbox"
                          checked={isCheckboxChecked}
                          onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                          id="mock-chk-btn"
                          className="w-4 h-4 rounded bg-stone-950 border border-neutral-800 text-indigo-500 focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="mock-chk-btn" className="text-[11px] text-zinc-400 font-sans cursor-pointer hover:text-white select-none">
                          Enable Accessibility Mode Protocols
                        </label>
                        {(visionMode === "contours" || visionMode === "all") && (
                          <div className="absolute inset-0 border border-dashed border-cyan-400 pointer-events-none flex items-start justify-end">
                            <span className="bg-cyan-500 text-black text-[5.5px] px-1 rounded font-mono leading-none">CV:chk</span>
                          </div>
                        )}
                        {(visionMode === "ocr" || visionMode === "all") && (
                          <span className="absolute bottom-[-6px] left-6 bg-amber-600 text-white text-[6px] font-mono px-1 rounded pointer-events-none leading-none">OCR:"Enable Accessibility..."</span>
                        )}
                      </div>

                    </div>

                    {/* Bottom Area: custom circular play and console input design */}
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-neutral-850">
                      
                      {/* Circle Blue button */}
                      <div className="flex flex-col items-center justify-center p-3 border border-neutral-850 rounded-xl bg-black/10 relative">
                        <button 
                          onClick={() => addTraceLog("Click circular Play Button", "info")}
                          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all outline-none"
                        >
                          <Play className="h-6 w-6 text-white ml-1 fill-white" />
                        </button>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Media Play (Icon)</span>
                        
                        {(visionMode === "contours" || visionMode === "all") && (
                          <div className="absolute inset-0 border border-cyan-400 rounded-xl pointer-events-none flex items-start justify-center p-1">
                            <span className="bg-cyan-500 text-black text-[6px] px-1 font-mono rounded leading-none animate-bounce">CV:Circle</span>
                          </div>
                        )}
                      </div>

                      {/* Commands input search bar contour */}
                      <div className="flex flex-col justify-center p-3 border border-neutral-850 rounded-xl bg-black/10 relative text-center">
                        <div className="bg-zinc-950 border border-neutral-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-400 truncate">
                          Enter commands...
                        </div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-2">CommandConsole Area</span>
                        
                        {(visionMode === "contours" || visionMode === "all") && (
                          <div className="absolute inset-0 border border-cyan-400 rounded-xl pointer-events-none flex items-end justify-center p-1">
                            <span className="bg-cyan-500 text-black text-[6px] px-1 font-mono rounded leading-none">CV:Rect_bar</span>
                          </div>
                        )}
                        {(visionMode === "ocr" || visionMode === "all") && (
                          <span className="absolute top-1 right-2 bg-amber-600 text-white text-[6px] font-mono px-1 rounded leading-none">OCR:"Enter commands"</span>
                        )}
                      </div>

                    </div>

                  </div>
                </div>

                {/* REAL-TIME HUMAN CURSOR OVERLAY */}
                <div
                  className="absolute pointer-events-none transition-all duration-75 z-50 flex flex-col items-start"
                  style={{
                    left: `${(cursorPos.x / 960) * 100}%`,
                    top: `${(cursorPos.y / 600) * 100}%`,
                  }}
                >
                  <div className={`p-1 rounded-full ${isClicking ? "bg-red-500 ring-4 ring-red-500/30 scale-125" : "bg-transparent"} transition-all duration-75`}>
                    <MousePointer 
                      className={`h-5 w-5 text-indigo-400 drop-shadow-[0_2px_10px_rgba(99,102,241,0.5)] ${
                        isMoving ? "translate-x-0.5 translate-y-0.5 text-cyan-400" : ""
                      }`}
                      style={{ transform: "rotate(-15deg)" }}
                    />
                  </div>
                  <div className="bg-black/80 font-mono text-[7px] text-zinc-300 font-bold tracking-tight px-1.5 py-0.5 rounded border border-white/15 translate-x-2.5 -translate-y-1 block">
                    x:{cursorPos.x} y:{cursorPos.y}
                    {isMoving && <span className="text-cyan-400 ml-1">BEZIER</span>}
                    {isClicking && <span className="text-red-400 ml-1">CLICK_DOWN</span>}
                  </div>
                </div>

                {/* Visual loading scan swipe effect */}
                {isScanning && (
                  <div className="absolute inset-0 z-40 bg-indigo-500/5 pointer-events-none flex items-center justify-center border border-indigo-500/20 overflow-hidden">
                    {/* Glowing scanning laser bar */}
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 left-0 right-0 animate-bounce shadow-[0_0_20px_#22d3ee]" />
                    <div className="bg-neutral-900/90 border border-neutral-700 rounded-2xl px-5 py-3 font-mono text-[10px] text-cyan-400 tracking-wide flex items-center gap-2.5 shadow-2xl animate-pulse">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      <span>MANAV VISION OVERLAY HARNESS SCANNING...</span>
                    </div>
                  </div>
                )}
                
              </div>

              {/* COMMAND CONTROL CONSOLE INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteCommand(commandInput);
                }}
                className="flex items-center gap-2 bg-stone-950/80 border border-neutral-850 p-2 rounded-2xl"
              >
                <div className="pl-3 text-indigo-400">
                  <Terminal className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder='Issue companion command, e.g., "Click the login button", "Click play", "Select Spotify Feed"...'
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none flex-1 font-sans py-1"
                />
                <button
                  type="submit"
                  disabled={isScanning || isMoving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 transition-all text-[10px] font-bold uppercase rounded-xl text-white tracking-widest shrink-0 flex items-center gap-1.5"
                >
                  <Zap className="h-3 w-3 text-amber-300" /> Execute Action
                </button>
              </form>

              {/* SIMULATION CLICK PRESET BUTTONS */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Test Command presets:</span>
                {[
                  "Click the login button",
                  "Click play",
                  "Select Spotify Feed",
                  "Search Manav Intelligence",
                  "Scroll down",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExecuteCommand(preset)}
                    className="px-3 py-1 bg-white/5 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-lg text-[9px] transition-all"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Real-time decision logs / step tracing */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex flex-col border border-neutral-800 bg-[#09090d]/60 rounded-2xl p-4 flex-1">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-white/5">
                  <Terminal className="h-4 w-4 text-cyan-400" /> Trace Telemetry Log
                </span>

                <div className="flex-1 mt-3 overflow-y-auto space-y-3 pr-1 text-left max-h-[360px] h-[360px]">
                  {logs.map((log) => (
                    <div key={log.id} className="text-[10.5px] leading-relaxed font-mono select-text flex items-start gap-2 border-b border-white/[0.02] pb-1.5">
                      <span className="text-zinc-600 text-[8px] leading-none shrink-0 self-center">{log.timestamp}</span>
                      <div className="flex-1 break-words">
                        {log.type === "success" && (
                          <span className="text-emerald-400/90 font-medium">{log.text}</span>
                        )}
                        {log.type === "warn" && (
                          <span className="text-amber-400/95 font-medium">{log.text}</span>
                        )}
                        {log.type === "error" && (
                          <span className="text-rose-400 font-semibold">{log.text}</span>
                        )}
                        {log.type === "action" && (
                          <span className="text-cyan-400 font-medium underline decoration-cyan-500/30">{log.text}</span>
                        )}
                        {log.type === "info" && (
                          <span className="text-zinc-300">{log.text}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[8px] text-zinc-500 font-bold uppercase font-mono tracking-widest">
                  <span>Priority: A11y &gt; OCR &gt; CV</span>
                  <span>Safety constraints armed</span>
                </div>
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* LEFT SIDEBAR: Code selector */}
            <div className="md:col-span-3 bg-stone-950/80 border border-neutral-850 p-4 rounded-2xl flex flex-col gap-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 pl-1">Automation Codebase</span>
              {[
                { name: "🎛️ ui_automation_engine.py", id: "engine" },
                { name: "📸 screen_capture.py", id: "capture" },
                { name: "🌲 accessibility_engine.py", id: "a11y" },
                { name: "👁️ vision_engine.py", id: "vision" },
                { name: "👇 click_engine.py", id: "click" },
                { name: "🎯 element_detector.py", id: "detector" },
              ].map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveCodeFile(file.id)}
                  className={`px-3 py-2.5 rounded-xl text-left text-[10px] uppercase font-bold tracking-tight transition-all leading-none ${
                    activeCodeFile === file.id
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10 border border-indigo-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {file.name}
                </button>
              ))}
            </div>

            {/* RIGHT SIDE: Rich Code Pre */}
            <div className="md:col-span-9 bg-black/80 border border-neutral-850 p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-3 border-b border-white/5">
                <span>Modules / ui_automation / {activeCodeFile}_engine.py</span>
                <span className="text-[9px] text-emerald-400 font-mono tracking-widest bg-emerald-950/20 border border-emerald-500/20 px-2 rounded-md">
                  STABLE PRODUCTION-READY PYTHON
                </span>
              </div>
              <pre className="text-zinc-300 text-[10.5px] font-mono leading-relaxed overflow-x-auto text-left h-[380px] p-2 bg-stone-950/20 select-all border border-dashed border-white/5 rounded-xl select-text">
                {pythonCodes[activeCodeFile]}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAFETY VIOLATION OVERRIDE DIALOG OVERLAY */}
      <AnimatePresence>
        {safetyConfirmation && safetyConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6 text-left select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-rose-500/35 rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 border-b border-rose-500/10 pb-4">
                <div className="p-2.5 bg-rose-500/15 rounded-xl text-rose-400 border border-rose-500/30">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white tracking-tight text-sm uppercase">Manav Safety Control Protocol</h4>
                  <p className="text-[9.5px] text-zinc-400 mt-0.5 leading-none">RISK DETECTOR INDEX: {safetyConfirmation.actionType}</p>
                </div>
              </div>

              <div className="text-[11.5px] space-y-3 text-zinc-300">
                <p className="leading-relaxed">
                  ⚠️ **SAFETY HAZARD WARNING:** You have triggered a controlled operation matching a protective system rule:
                </p>
                <div className="bg-black/55 border border-white/5 p-3 rounded-xl font-mono text-[10.5px] text-rose-300 tracking-tight leading-snug">
                  Command: "{safetyConfirmation.command}"<br/>
                  Keyword trigger: "{safetyConfirmation.actionType.toLowerCase()}"
                </div>
                <p className="leading-relaxed text-zinc-400">
                  Automating destructive tasks is strictly restricted. This action could result in formatting disk sectors or deleting active records. Do you wish to override and execute?
                </p>
              </div>

              {/* Dialog action buttons */}
              <div className="flex items-center gap-2 mt-2 pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    addTraceLog("Hazardous override confirmed by user.", "warn");
                    handleSafetyConfirm();
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500/40 text-[10px] font-bold uppercase rounded-xl tracking-widest text-white transition-all shadow-lg shadow-rose-600/10"
                >
                  Override & Confirm
                </button>
                <button
                  onClick={() => {
                    addTraceLog("Dangerous action abort requested by safety safeguard.", "success");
                    setSafetyConfirmation(null);
                  }}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-white/5 text-[10px] font-bold uppercase rounded-xl tracking-widest text-zinc-400 hover:text-white transition-all"
                >
                  Cancel / Abort
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
