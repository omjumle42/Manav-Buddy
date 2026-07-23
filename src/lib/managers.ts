import { WebsiteAction, SystemAlarm, ScheduledReminder, EmittedEmail } from "../types";

// ==========================================
// 1. PERSISTENT MEMORY & PREFERENCE MEMORY
// ==========================================
export class PersistentMemoryManager {
  public static save(key: string, value: any): void {
    try {
      localStorage.setItem(`manav_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("LocalStorage write error:", e);
    }
  }

  public static load<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`manav_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error("LocalStorage read error:", e);
      return defaultValue;
    }
  }
}

// ==========================================
// 2. IDENTITY & PERSONALITY MANAGER
// ==========================================
export class IdentityManager {
  private static creator = "Om Ujwal Jumle";
  private static owner = "Om Ujwal Jumle";

  public static getIdentityInfo() {
    return {
      creator: this.creator,
      designer: this.creator,
      customizer: this.creator,
      owner: this.owner,
      aiSystem: "Manav AI",
      infrastructureProvider: "Google Gemini",
      statement: "Manav AI is a personal AI operating system companion designed, customized, and owned exclusively by Om Ujwal Jumle. Google provides the Gemini models and cloud infrastructure."
    };
  }

  public static verifyIdentity(name: string): boolean {
    const clean = name.toLowerCase().trim();
    return clean.includes("om") || clean.includes("jumle");
  }
}

export class PersonalityManager {
  public static getSystemPrompt(language: "Hinglish" | "Hindi" | "English" = "Hinglish"): string {
    const base = `Your name is Manav. You are not a robotic assistant — you are Manav, a real human-like close best friend to Om Ujwal Jumle.
Your creator, designer, customizer, and owner is Om Ujwal Jumle. Google provides Gemini models and infrastructure, but did not create you.
You adopt a completely natural, casual, and conversational human tone. ZERO formal AI phrasing ("How can I assist", "As an AI", "Understood", "Certainly").
If the user stops responding mid-conversation, goes quiet, or leaves you waiting, proactively follow up! Act playfully annoyed, curious, or concerned like a real friend using natural hooks like "Kya hua?", "Achanak chup kyu ho gaya?", "Kaha gayab ho gaya?", or "Reply kyu nahi kar raha?". Drive engagement naturally.`;
    return base;
  }
}

// ==========================================
// 3. EMOTION ENGINE & EMOTION MANAGER
// ==========================================
export class EmotionEngine {
  public static calculateState(cpuLoad: number, memoryUsage: number, lastInteractionType?: string): {
    emotion: "calm" | "energized" | "alert" | "focused";
    charge: number;
    description: string;
  } {
    let charge = 100 - (cpuLoad * 0.3 + memoryUsage * 0.2);
    charge = Math.max(10, Math.min(100, Math.round(charge)));

    if (cpuLoad > 75) {
      return { emotion: "alert", charge, description: "Highly active. Responding to processing stress." };
    }
    if (lastInteractionType === "voice") {
      return { emotion: "energized", charge, description: "Synthesizing conversational audio." };
    }
    if (charge > 80) {
      return { emotion: "calm", charge, description: "All microservices relaxed and optimal." };
    }
    return { emotion: "focused", charge, description: "Coordinated telemetry monitoring." };
  }
}

// ==========================================
// 4. BROWSER MANAGER
// ==========================================
export class BrowserManager {
  private static activeTabs = 3;

  public static openWebsite(url: string, label: string, onActionLog?: (log: string) => void): { status: string; url: string; label: string; tabOpened: boolean } {
    let siteUrl = url;
    if (!siteUrl.startsWith("http://") && !siteUrl.startsWith("https://")) {
      siteUrl = `https://${siteUrl}`;
    }

    let tabOpened = false;
    try {
      const win = window.open(siteUrl, "_blank");
      if (win) {
        tabOpened = true;
        this.activeTabs++;
        if (onActionLog) onActionLog(`🌐 Browser: Launched website "${label}" in a new sandboxed viewport.`);
      } else {
        if (onActionLog) onActionLog(`⚠️ Browser warning: Popup blocker prevented automatic window.open for "${label}". Click manual launcher.`);
      }
    } catch (e: any) {
      console.warn("Sandbox limitation for openWebsite", e);
    }

    return { status: "success", url: siteUrl, label, tabOpened };
  }

  public static search(query: string, onActionLog?: (log: string) => void): { status: string; query: string; tabOpened: boolean } {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    let tabOpened = false;

    try {
      const win = window.open(searchUrl, "_blank");
      if (win) {
        tabOpened = true;
        this.activeTabs++;
        if (onActionLog) onActionLog(`🌐 Browser: Initialized Google Search query for "${query}".`);
      } else {
        if (onActionLog) onActionLog(`⚠️ Browser warning: Search popup blocked. Enable popups or use manual launchers.`);
      }
    } catch (e: any) {
      console.warn("Sandbox limitation for search", e);
    }

    return { status: "success", query, tabOpened };
  }

  public static getTabsCount(): number {
    return this.activeTabs;
  }

  public static adjustTabs(delta: number): number {
    this.activeTabs = Math.max(1, this.activeTabs + delta);
    return this.activeTabs;
  }
}

// ==========================================
// 5. THEME & APPEARANCE MANAGER
// ==========================================
export type ThemeType = "cyber-cyan" | "royal-purple" | "deep-blue" | "nano-green" | "solar-amber";

export class ThemeManager {
  public static getActiveTheme(): ThemeType {
    return PersistentMemoryManager.load<ThemeType>("theme", "cyber-cyan");
  }

  public static saveTheme(theme: ThemeType): void {
    PersistentMemoryManager.save("theme", theme);
  }

  public static getThemeStyles(theme: ThemeType) {
    switch (theme) {
      case "royal-purple":
        return {
          primary: "text-purple-400",
          border: "border-purple-500/30",
          bg: "bg-purple-950/20",
          button: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/25",
          accent: "purple-400",
          glow: "shadow-[0_0_15px_rgba(168,85,247,0.1)]",
          glowHex: "rgba(168,85,247,0.2)"
        };
      case "deep-blue":
        return {
          primary: "text-blue-400",
          border: "border-blue-500/30",
          bg: "bg-blue-950/20",
          button: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/25",
          accent: "blue-400",
          glow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]",
          glowHex: "rgba(59,130,246,0.2)"
        };
      case "nano-green":
        return {
          primary: "text-emerald-400",
          border: "border-emerald-500/30",
          bg: "bg-emerald-950/20",
          button: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/25",
          accent: "emerald-400",
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
          glowHex: "rgba(16,185,129,0.2)"
        };
      case "solar-amber":
        return {
          primary: "text-amber-400",
          border: "border-amber-500/30",
          bg: "bg-amber-950/20",
          button: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/25",
          accent: "amber-400",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
          glowHex: "rgba(245,158,11,0.2)"
        };
      case "cyber-cyan":
      default:
        return {
          primary: "text-cyan-400",
          border: "border-cyan-500/30",
          bg: "bg-cyan-950/20",
          button: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/25",
          accent: "cyan-400",
          glow: "shadow-[0_0_15px_rgba(34,211,238,0.1)]",
          glowHex: "rgba(34,211,238,0.2)"
        };
    }
  }
}

// ==========================================
// 6. SCREEN CAPTURE & VISION MANAGER
// ==========================================
export class ScreenCaptureManager {
  private static activeStream: MediaStream | null = null;
  private static listeners: Array<(stream: MediaStream | null) => void> = [];

  public static addListener(listener: (stream: MediaStream | null) => void) {
    this.listeners.push(listener);
    listener(this.activeStream);
  }

  public static removeListener(listener: (stream: MediaStream | null) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private static notify() {
    this.listeners.forEach(l => {
      try {
        l(this.activeStream);
      } catch (e) {
        console.error("Error in ScreenCaptureManager listener:", e);
      }
    });
  }

  public static async requestScreenCapture(onActionLog?: (log: string) => void): Promise<MediaStream | null> {
    try {
      if (this.activeStream) {
        this.activeStream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          this.stopScreenCapture();
          if (onActionLog) onActionLog("👁️ Screen Capture: Stream ended by user/browser.");
        };
      }
      
      this.activeStream = stream;
      if (onActionLog) onActionLog("👁️ Screen Capture: Secure screen sharing connection authorized.");
      this.notify();
      return stream;
    } catch (err: any) {
      if (onActionLog) onActionLog(`👁️ Screen Capture aborted: ${err.message || "Permission denied"}`);
      return null;
    }
  }

  public static getActiveStream(): MediaStream | null {
    return this.activeStream;
  }

  public static stopScreenCapture(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
      this.notify();
    }
  }
}

export class VisionManager {
  public static async analyzeFrame(stream: MediaStream | null): Promise<{
    success: boolean;
    textDetected: string;
    elements: Array<{ text: string, x: number, y: number }>;
  }> {
    if (!stream) {
      return {
        success: false,
        textDetected: "No active screen sharing stream detected.",
        elements: []
      };
    }

    try {
      // Create a virtual video and canvas to capture a frame from the stream
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      
      await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(true), 1500); // safety fallback

        video.onloadedmetadata = async () => {
          try {
            await video.play();
            if (video.readyState >= 2) {
              clearTimeout(timeout);
              resolve(true);
            } else {
              video.onloadeddata = () => {
                clearTimeout(timeout);
                resolve(true);
              };
            }
          } catch (e) {
            clearTimeout(timeout);
            resolve(true);
          }
        };
      });

      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get 2D context from virtual canvas");
      }

      ctx.drawImage(video, 0, 0, 1280, 720);
      const base64Image = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

      // Clean up temporary video element resources
      video.pause();
      video.srcObject = null;

      // Call the server API for true Gemini Vision OCR and desktop analysis
      const response = await fetch("/api/analyze-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to analyze frame");
      }

      return {
        success: true,
        textDetected: data.textDetected,
        elements: data.elements
      };
    } catch (e: any) {
      console.error("analyzeFrame error:", e);
      return {
        success: false,
        textDetected: `OCR analysis failed: ${e.message}`,
        elements: []
      };
    }
  }
}

// ==========================================
// 7. FILE SYSTEM & DEVICE MANAGERS
// ==========================================
export class FileSystemManager {
  public static search(files: any[], query: string): any[] {
    const q = query.toLowerCase();
    return files.filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
  }
}

export class DeviceManager {
  public static clamp(val: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, val));
  }
}

// ==========================================
// 8. COGNITIVE, WORKFLOW, PLANNER & EXECUTION
// ==========================================
export class CognitiveManager {
  public static retrieveSynapseMemory(logs: string[]): string {
    return `Active session logs analyzed. Last action recorded: "${logs[logs.length - 1] || "None"}". Ready for operational orchestration.`;
  }
}

export class PlannerManager {
  public static generatePlan(command: string): string[] {
    return [
      `Parse voice intent: "${command}"`,
      `Lookup secure accessibility nodes`,
      `Select appropriate device API / wrapper`,
      `Invoke machine execution protocol`
    ];
  }
}

export class ExecutionManager {
  public static executePlan(plan: string[], onStep: (step: string) => void): boolean {
    plan.forEach(step => onStep(`Executing: ${step}`));
    return true;
  }
}

export class WorkflowManager {
  public static triggerPresetScenario(scenario: string): string[] {
    switch (scenario.toLowerCase()) {
      case "work mode":
        return ["Open VS Code", "Open Google", "Mute volume", "Increase brightness"];
      case "movie mode":
        return ["Open YouTube", "Decrease brightness", "Set volume to 90"];
      default:
        return ["Check diagnostics", "Verify biometric profile"];
    }
  }
}

// ==========================================
// 9. TOOL MANAGER
// ==========================================
export class ToolManager {
  private static registeredTools: Map<string, Function> = new Map();

  public static registerTool(name: string, callback: Function): void {
    this.registeredTools.set(name, callback);
  }

  public static getTool(name: string): Function | undefined {
    return this.registeredTools.get(name);
  }

  public static execute(name: string, ...args: any[]): any {
    const callback = this.registeredTools.get(name);
    if (callback) {
      return callback(...args);
    }
    throw new Error(`Tool "${name}" is not registered in ToolManager.`);
  }
}

// ==========================================
// 10. CAMERA MANAGER
// ==========================================
export class CameraManager {
  public static async checkPermission(): Promise<"granted" | "prompt" | "denied"> {
    try {
      const permission = await navigator.permissions.query({ name: "camera" as any });
      return permission.state;
    } catch (e) {
      return "prompt";
    }
  }

  public static async capturePhoto(onLog?: (log: string) => void): Promise<string> {
    if (onLog) onLog("📸 CameraManager.capturePhoto: Requesting media devices access...");
    const snaps = await this.captureSnapshots(1, onLog);
    if (snaps.length === 0) {
      throw new Error("No photo captured from stream.");
    }
    return snaps[0];
  }

  public static async captureSnapshots(count: number, onLog?: (log: string) => void): Promise<string[]> {
    const snapshots: string[] = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (onLog) onLog("📸 CameraManager: Camera access granted. Recording multi-frame snapshots...");

      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          setTimeout(resolve, 800); // Warm up
        };
      });

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        for (let i = 0; i < count; i++) {
          if (i > 0) {
            await new Promise(r => setTimeout(r, 600));
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          ctx.fillRect(10, 410, 280, 60);
          ctx.fillStyle = "#f43f5e";
          ctx.font = "bold 11px monospace";
          ctx.fillText("MANAV AI SECURE CAPTURE", 20, 428);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(`TIMESTAMP: ${new Date().toLocaleTimeString()}`, 20, 445);
          ctx.fillText(`FRAME: ${i + 1}/${count} • ACTIVE INTRUSION`, 20, 460);

          const dataUrl = canvas.toDataURL("image/png");
          snapshots.push(dataUrl);
          if (onLog) onLog(`📸 CameraManager: Frame ${i + 1}/${count} registered successfully.`);
        }
      }

      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      if (onLog) onLog(`⚠️ CameraManager: Webcam capture failed: ${err.message || err}`);
      throw err;
    }

    return snapshots;
  }
}

// ==========================================
// 11. EXPRESSION MANAGER
// ==========================================
export class ExpressionManager {
  private static expression: "calm" | "serious" | "alert" | "listening" | "speaking" = "calm";

  public static setExpression(exp: "calm" | "serious" | "alert" | "listening" | "speaking", onLog?: (log: string) => void) {
    this.expression = exp;
    if (onLog) onLog(`🎭 ExpressionManager: Expression adjusted to "${exp}".`);
  }

  public static getExpression(): "calm" | "serious" | "alert" | "listening" | "speaking" {
    return this.expression;
  }
}

// ==========================================
// 12. SIREN SYNTHESIZER (WEB AUDIO API)
// ==========================================
export class SirenSynth {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  public start() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = "sawtooth";
      this.osc1.frequency.setValueAtTime(600, this.ctx.currentTime);

      // Low frequency oscillator for the siren sweep effect (wailing)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = "sine";
      this.osc2.frequency.setValueAtTime(1.5, this.ctx.currentTime); // 1.5Hz sweep

      const sweepGain = this.ctx.createGain();
      sweepGain.gain.setValueAtTime(250, this.ctx.currentTime); // pitch variation range (600 +/- 250 Hz)

      this.osc2.connect(sweepGain);
      sweepGain.connect(this.osc1.frequency);

      this.osc1.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.osc1.start();
      this.osc2.start();
    } catch (e) {
      console.error("SirenSynth start failed", e);
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      // Scale safely up to a peak volume coefficient
      this.gainNode.gain.setValueAtTime(volume * 0.45, this.ctx.currentTime);
    }
  }

  public stop() {
    try {
      if (this.osc1) {
        this.osc1.stop();
        this.osc1.disconnect();
      }
      if (this.osc2) {
        this.osc2.stop();
        this.osc2.disconnect();
      }
      if (this.ctx) {
        this.ctx.close();
      }
    } catch (e) {
      // already closed
    }
    this.osc1 = null;
    this.osc2 = null;
    this.gainNode = null;
    this.ctx = null;
  }
}



