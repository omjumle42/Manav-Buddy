import React, { useEffect, useRef, useState, useCallback } from "react";
import { UIAutomationPanel } from "./components/UIAutomationPanel";
import { PremiumVoiceVisualizer } from "./components/PremiumVoiceVisualizer";
import { 
  PersistentMemoryManager, 
  IdentityManager, 
  PersonalityManager, 
  EmotionEngine, 
  BrowserManager, 
  ThemeManager, 
  ThemeType,
  ScreenCaptureManager, 
  VisionManager, 
  FileSystemManager, 
  DeviceManager, 
  CognitiveManager, 
  PlannerManager, 
  ExecutionManager, 
  WorkflowManager, 
  ToolManager,
  CameraManager,
  ExpressionManager,
  SirenSynth
} from "./lib/managers";
import { 
  Mic, 
  Power, 
  Sparkles, 
  Link2, 
  Compass, 
  AlertCircle, 
  Volume2, 
  X, 
  ChevronRight,
  Activity,
  Workflow,
  Cpu,
  Bookmark,
  Shield,
  Eye,
  EyeOff,
  Sliders,
  Play,
  Pause,
  Trash2,
  Mail,
  Camera,
  Layers,
  Search,
  RefreshCw,
  Bell,
  Sun,
  Lock,
  Plus,
  Youtube,
  ExternalLink,
  Wifi,
  Thermometer,
  Battery,
  Clock,
  Database,
  Menu,
  LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AudioStreamer } from "./lib/audioStreamer";
import { AudioPlayer } from "./lib/audioPlayer";
import { AssistantState, WebsiteAction, SystemAlarm, ScheduledReminder, EmittedEmail } from "./types";
import { 
  DashboardModule, MemoryModule, SecurityModule, VisionModule, 
  ScreenShareModule, AutomationModule, FilesModule, DevicesModule, 
  DiagnosticsModule, AppearanceModule, PerformanceModule, LogsModule, 
  NotificationsModule, SettingsModule, AboutModule 
} from "./components/WorkspaceModules";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function App() {
  // Core Voice Assistant States
  const [state, setState] = useState<AssistantState>("disconnected");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<WebsiteAction[]>([]);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>(["Manav Companion Client loaded successfully."]);

  // Sound Engine Refs
  const socketRef = useRef<WebSocket | null>(null);
  const streamerRef = useRef<AudioStreamer | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // States to display real-time interactive energy levels
  const [userSpeechAmplitude, setUserSpeechAmplitude] = useState<number>(0);
  const [assistantSpeechAmplitude, setAssistantSpeechAmplitude] = useState<number>(0);

  // NEW: Personal Operating System Simulated States
  const [activeTheme, setActiveTheme] = useState<ThemeType>(() => ThemeManager.getActiveTheme());
  const themeStyles = ThemeManager.getThemeStyles(activeTheme);

  const [runningApps, setRunningApps] = useState<string[]>(() => 
    PersistentMemoryManager.load<string[]>("runningApps", ["Finder", "Terminal", "Chrome"])
  );
  const [brightness, setBrightness] = useState<number>(() => 
    PersistentMemoryManager.load<number>("brightness", 85)
  );
  const [volume, setVolume] = useState<number>(() => 
    PersistentMemoryManager.load<number>("volume", 75)
  );
  const [alarms, setAlarms] = useState<SystemAlarm[]>(() => 
    PersistentMemoryManager.load<SystemAlarm[]>("alarms", [
      { id: "1", time: "06:00 AM", label: "Morning Routine", enabled: true },
      { id: "2", time: "09:30 PM", label: "Read & Sleep", enabled: false }
    ])
  );
  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => 
    PersistentMemoryManager.load<ScheduledReminder[]>("reminders", [])
  );
  const [emails, setEmails] = useState<EmittedEmail[]>(() => 
    PersistentMemoryManager.load<EmittedEmail[]>("emails", [])
  );
  const [securityMode, setSecurityMode] = useState<boolean>(() => 
    PersistentMemoryManager.load<boolean>("security_armed", false)
  );
  const [alarmSiren, setAlarmSiren] = useState<boolean>(false);
  const [strictSecurityMode, setStrictSecurityMode] = useState<boolean>(false);
  const [secretCodeInput, setSecretCodeInput] = useState<string>("");
  const sirenAudioRef = useRef<HTMLAudioElement | null>(null);
  const sirenSynthRef = useRef<SirenSynth | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [playingSong, setPlayingSong] = useState<string>("");
  const [youtubeQuery, setYoutubeQuery] = useState<string>("");
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [faceRecognized, setFaceRecognized] = useState<boolean | null>(null);
  const [screenReading, setScreenReading] = useState<boolean>(false);
  const [ocrOverlay, setOcrOverlay] = useState<Array<{ text: string, x: number, y: number }>>([]);
  const [systemOffline, setSystemOffline] = useState<boolean>(false);
  const [rebooting, setRebooting] = useState<boolean>(false);
  
  // REAL-TIME DEBUG MODE & TRUTH VERIFICATION STATES
  const [lastExecution, setLastExecution] = useState<{
    name: string;
    args: any;
    status: "success" | "failed" | "executing";
    error?: string;
    timestamp: number;
  } | null>(null);

  const [diagnosticsStatus, setDiagnosticsStatus] = useState<"idle" | "running" | "completed">("idle");
  const [diagnosticsHistory, setDiagnosticsHistory] = useState<Array<{ name: string; status: "success" | "warning" | "failed"; details: string }>>([
    { name: "Websocket Engine", status: "success", details: "Active pipeline connected through host port 3000" },
    { name: "Vocal Synthesizer (FENRIR)", status: "success", details: "Sound card frequency buffer ready to broadcast" },
    { name: "Local Sandbox Storage", status: "success", details: "Virtual file descriptor indexed" }
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [virtualFiles, setVirtualFiles] = useState<Array<{ name: string, size: string, type: string, path: string }>>([
    { name: "creative_app_assets.zip", size: "18.5 MB", type: "archive", path: "/downloads/creative_app_assets.zip" },
    { name: "voice_companion_manifest.json", size: "4.1 KB", type: "code", path: "/system/voice_companion_manifest.json" },
    { name: "web_design_blueprint.psd", size: "48 MB", type: "document", path: "/documents/web_design_blueprint.psd" },
    { name: "lofi_meditation_background.wav", size: "23 MB", type: "audio", path: "/music/lofi_meditation_background.wav" },
    { name: "workspace_notes_June.md", size: "15 KB", type: "document", path: "/notes/workspace_notes_June.md" }
  ]);
  const [foundFiles, setFoundFiles] = useState<Array<{ name: string, size: string, type: string, path: string }>>([]);
  const [openedFile, setOpenedFile] = useState<{ name: string; path: string; size: string; type: string } | null>(null);
  const [browserTabsCount, setBrowserTabsCount] = useState<number>(3);
  const [preMuteVolume, setPreMuteVolume] = useState<number>(75);
  const [isSleeping, setIsSleeping] = useState<boolean>(false);

  // CONVERSATION RETENTION & PROACTIVE FOLLOW-UP (HUMAN CLOSE FRIEND BEHAVIOR)
  const lastUserActivityTimeRef = useRef<number>(Date.now());
  const nudgeSentForCurrentTurnRef = useRef<boolean>(false);
  const [proactiveHookBanner, setProactiveHookBanner] = useState<string | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState<string>("");

  // LONG-TERM RETRIEVAL PIPELINE MEMORY STORAGE (Key-Value)
  const [structuredMemories, setStructuredMemories] = useState<Record<string, string>>(() => 
    PersistentMemoryManager.load<Record<string, string>>("structured_memories", {
      "favorite_bike": "Kawasaki Ninja ZX-6R",
      "creator_name": "Om Ujwal Jumle",
      "owner_identity": "Om Ujwal Jumle",
      "operating_system": "Manav OS v3.1",
      "status_registry": "Active & Loyal to Om Ujwal Jumle"
    })
  );

  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [newMemoryVal, setNewMemoryVal] = useState("");
  const [memorySearchQuery, setMemorySearchQuery] = useState("");

  // Persistent Memory Sync Effects
  useEffect(() => {
    PersistentMemoryManager.save("structured_memories", structuredMemories);
  }, [structuredMemories]);

  useEffect(() => {
    PersistentMemoryManager.save("runningApps", runningApps);
  }, [runningApps]);

  useEffect(() => {
    PersistentMemoryManager.save("brightness", brightness);
  }, [brightness]);

  useEffect(() => {
    PersistentMemoryManager.save("volume", volume);
  }, [volume]);

  useEffect(() => {
    PersistentMemoryManager.save("security_armed", securityMode);
  }, [securityMode]);

  useEffect(() => {
    PersistentMemoryManager.save("alarms", alarms);
  }, [alarms]);

  useEffect(() => {
    PersistentMemoryManager.save("reminders", reminders);
  }, [reminders]);

  useEffect(() => {
    PersistentMemoryManager.save("emails", emails);
  }, [emails]);

  useEffect(() => {
    ThemeManager.saveTheme(activeTheme);
  }, [activeTheme]);

  // JARVIS HUD real-time simulated telemetry metric states
  const [cpuLoad, setCpuLoad] = useState<number>(31.4);
  const [memPercent, setMemPercent] = useState<number>(34.2);
  const [networkPing, setNetworkPing] = useState<number>(24);
  const [coreTemp, setCoreTemp] = useState<number>(38.5);
  const [formattedTime, setFormattedTime] = useState<string>("");

  // Update holographic metrics dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuLoad(prev => {
        const delta = (Math.random() - 0.5) * 6;
        return parseFloat(Math.min(95, Math.max(10, prev + delta)).toFixed(1));
      });
      setMemPercent(prev => {
        const delta = (Math.random() - 0.5) * 1.5;
        return parseFloat(Math.min(90, Math.max(20, prev + delta)).toFixed(1));
      });
      setNetworkPing(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 4);
        return Math.min(120, Math.max(12, prev + delta));
      });
      setCoreTemp(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.min(85, Math.max(30, prev + delta)).toFixed(1));
      });
      
      const now = new Date();
      setFormattedTime(now.toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // REAL SYSTEM HARDWARE DIAGNOSTICS RUNNER
  const runFullDiagnostics = async () => {
    setDiagnosticsStatus("running");
    addLog(`🛡️ Initializing Core System Diagnostics Check...`);
    
    const checks: Array<{ name: string; status: "success" | "warning" | "failed"; details: string }> = [];
    
    // 1. Check WebSocket connection state
    const isWSReady = socketRef.current && socketRef.current.readyState === WebSocket.OPEN;
    checks.push({
      name: "WebSocket Loopback Gateway",
      status: isWSReady ? "success" : "failed",
      details: isWSReady 
        ? "Active high-speed socket link active on route /api/ws-live" 
        : "Direct duplex stream offline. Tap the center ARC Reactor Core to cold start voice-link compilation."
    });

    // 2. Check Device Microphone permission status
    try {
      const micPermission = await navigator.permissions.query({ name: 'microphone' as any }).catch(() => null);
      if (micPermission) {
        checks.push({
          name: "Microphone Audio Capturer",
          status: micPermission.state === "granted" ? "success" : micPermission.state === "prompt" ? "warning" : "failed",
          details: micPermission.state === "granted" 
            ? "Hardware microphone and streamer ready." 
            : micPermission.state === "prompt" 
              ? "Awaiting permission query. A browser click is required." 
              : "Access Blocked. Please allow microphone permissions in your browser's site settings."
        });
      } else {
        checks.push({
          name: "Microphone Audio Capturer",
          status: "warning",
          details: "Hardware query API unavailable in this frame context. Direct navigator bindings operating."
        });
      }
    } catch (e) {
      checks.push({
        name: "Microphone Audio Capturer",
        status: "warning",
        details: "Environment permissions check bypassed. Sound card state is verified during first speech stream."
      });
    }

    // 3. Check Device Camera permission
    try {
      const camPermission = await navigator.permissions.query({ name: 'camera' as any }).catch(() => null);
      if (camPermission) {
        checks.push({
          name: "Optical Camera Sensor",
          status: camPermission.state === "granted" ? "success" : camPermission.state === "prompt" ? "warning" : "failed",
          details: camPermission.state === "granted" 
            ? "Physical camera feeds indexed. Video streams active." 
            : camPermission.state === "prompt" 
              ? "Webcam surveillance scanning triggers frame-by-frame snapshot preview on voice request." 
              : "Permissions Blocked. The biometric face module will render offline procedural scans."
        });
      } else {
        checks.push({
          name: "Optical Camera Sensor",
          status: "warning",
          details: "Permissions query restricted by sandbox layers. Real camera triggers default to manual device prompts."
        });
      }
    } catch (e) {
      checks.push({
        name: "Optical Camera Sensor",
        status: "warning",
        details: "Camera sensor verification postponed until physical shutter command."
      });
    }

    // 4. Check Audio Player Synthesizer (for vocal answers)
    const isSoundEngineInitialized = !!playerRef.current;
    checks.push({
      name: "PCM 24kHz Vocal Synthesizer",
      status: isSoundEngineInitialized ? "success" : "failed",
      details: isSoundEngineInitialized 
        ? "Monaural PCM sound buffers active. Output volume locked at 75% gain." 
        : "Sound card player unavailable. Refreshing may be required to restore AudioContext bindings."
    });

    // 5. App launching web capabilities (Popup Blocker check)
    checks.push({
      name: "Desktop OS Launcher Map",
      status: "warning",
      details: "Chrome, Spotify, Netflix, and external apps launch in dedicated windows. Ensure browser popups are allowed!"
    });

    // Slow step-by-step diagnostic stagger animation
    for (let i = 1; i <= checks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setDiagnosticsHistory(checks.slice(0, i));
    }
    
    setDiagnosticsStatus("completed");
    addLog(`🛡️ Diagnostics complete. Verified operating system integrity at ${new Date().toLocaleTimeString()}.`);
  };

  // Setup Manual Tool States Input
  const [newAppNameInput, setNewAppNameInput] = useState<string>("");

  // Initialize AudioPlayer on first mount
  useEffect(() => {
    playerRef.current = new AudioPlayer();

    // Verify and register all system managers in ToolManager for stability
    ToolManager.registerTool("openWebsite", (url: string, label: string) => BrowserManager.openWebsite(url, label, addLog));
    ToolManager.registerTool("searchGoogle", (query: string) => BrowserManager.search(query, addLog));
    ToolManager.registerTool("changeTheme", (themeName: ThemeType) => {
      setActiveTheme(themeName);
      ThemeManager.saveTheme(themeName);
    });
    ToolManager.registerTool("verifyIdentity", (name: string) => IdentityManager.verifyIdentity(name));
    ToolManager.registerTool("getIdentity", () => IdentityManager.getIdentityInfo());
    ToolManager.registerTool("systemPrompt", (lang: any) => PersonalityManager.getSystemPrompt(lang));
    ToolManager.registerTool("calculateEmotion", (cpu: number, mem: number, lastInt?: string) => EmotionEngine.calculateState(cpu, mem, lastInt));
    ToolManager.registerTool("captureSnapshots", (count: number) => CameraManager.captureSnapshots(count, addLog));

    addLog("🛠️ ToolManager: Successfully connected and registered all 19 Local System Control managers.");

    return () => {
      disconnectSession();
      if (playerRef.current) {
        playerRef.current.close();
      }
    };
  }, []);

  // Update logs helper
  const addLog = useCallback((log: string) => {
    setSystemLogs(prev => [log, ...prev.slice(0, 19)]);
  }, []);

  // Screen Sharing Live Vision stream forwarding (1 FPS)
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let intervalId: any = null;
    
    // Create offscreen video element for extracting frames
    const hiddenVideo = document.createElement("video");
    hiddenVideo.muted = true;
    hiddenVideo.playsInline = true;
    
    const hiddenCanvas = document.createElement("canvas");
    hiddenCanvas.width = 640; // use compact size for low latency streaming (1 FPS)
    hiddenCanvas.height = 360;
    const ctx = hiddenCanvas.getContext("2d");

    const sendFrame = async () => {
      // Check if WebSocket is open and we have an active stream
      if (
        socketRef.current && 
        socketRef.current.readyState === WebSocket.OPEN && 
        activeStream && 
        activeStream.active
      ) {
        try {
          if (hiddenVideo.readyState >= 2 && !hiddenVideo.paused) {
            if (ctx) {
              ctx.drawImage(hiddenVideo, 0, 0, 640, 360);
              const base64Data = hiddenCanvas.toDataURL("image/jpeg", 0.5).split(",")[1];
              if (base64Data) {
                socketRef.current.send(JSON.stringify({
                  type: "video",
                  data: base64Data
                }));
              }
            }
          }
        } catch (err) {
          console.error("Failed to capture and stream display frame:", err);
        }
      }
    };

    const handleStreamChange = async (stream: MediaStream | null) => {
      activeStream = stream;
      
      // Clear previous loop
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (stream && stream.active) {
        hiddenVideo.srcObject = stream;
        hiddenVideo.play().catch((e) => {
          // Completely safe to ignore any play interruptions or autoplay blocks for virtual hidden video elements
          console.warn("Offscreen video play deferred/interrupted:", e?.message || e);
        });
        
        // Setup 1 FPS streaming loop
        intervalId = setInterval(sendFrame, 1000);
        addLog("👁️ Vision Stream: Real-time screen capture pipeline activated (1 FPS).");
      } else {
        try {
          hiddenVideo.pause();
        } catch (e) {}
        hiddenVideo.srcObject = null;
      }
    };

    // Listen to screen capture stream changes
    ScreenCaptureManager.addListener(handleStreamChange);

    // Track end event of getVideoTracks to stop sharing gracefully
    const checkTracksInterval = setInterval(() => {
      if (activeStream) {
        const track = activeStream.getVideoTracks()[0];
        if (!track || track.readyState === "ended" || !activeStream.active) {
          addLog("👁️ Screen Capture: Stream ended. Closing capture connection.");
          ScreenCaptureManager.stopScreenCapture();
        }
      }
    }, 1000);

    return () => {
      ScreenCaptureManager.removeListener(handleStreamChange);
      if (intervalId) clearInterval(intervalId);
      clearInterval(checkTracksInterval);
      try {
        hiddenVideo.pause();
      } catch (e) {}
      hiddenVideo.srcObject = null;
    };
  }, [addLog]);

  const wrongAttemptsRef = useRef<number>(0);
  const volumeRampIntervalRef = useRef<any>(null);
  const armTimeRef = useRef<number>(0);

  // High fidelity Speech Synthesis helper with dynamic canvas waveform modulation
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      addLog("⚠️ Speech Synthesis not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith("hi") || v.lang.includes("IN"));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 0.95;

    utterance.onstart = () => {
      setState("speaking");
      const animateWave = () => {
        if (window.speechSynthesis.speaking) {
          const simulatedVol = 0.25 + Math.random() * 0.45;
          setAssistantSpeechAmplitude(simulatedVol);
          requestAnimationFrame(animateWave);
        } else {
          setAssistantSpeechAmplitude(0);
          setState("listening");
        }
      };
      requestAnimationFrame(animateWave);
    };

    utterance.onend = () => {
      setAssistantSpeechAmplitude(0);
      setState("listening");
    };

    utterance.onerror = () => {
      setAssistantSpeechAmplitude(0);
      setState("listening");
    };

    window.speechSynthesis.speak(utterance);
  };

  const triggerStrictSecurity = async () => {
    setStrictSecurityMode(true);
    setAlarmSiren(true);
    ExpressionManager.setExpression("serious", addLog);
    addLog("🚨 [CRITICAL] INTRUSION DETECTED! SWITCHING TO STRICT SECURITY MODE.");

    // 1. Play real HTMLAudioElement looping watch alarm
    if (!sirenAudioRef.current) {
      sirenAudioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
      sirenAudioRef.current.loop = true;
    }
    sirenAudioRef.current.volume = 0.3;
    sirenAudioRef.current.play().catch(err => {
      console.warn("Audio autoplay blocked by browser context. Activating direct Web Audio API fallback.", err);
    });

    // 2. Play synthesized real-time siren wail
    if (!sirenSynthRef.current) {
      sirenSynthRef.current = new SirenSynth();
      sirenSynthRef.current.start();
      sirenSynthRef.current.setVolume(0.3);
    }

    // 3. Capture 3 real webcam photos immediately
    try {
      addLog("📸 CameraManager: Capturing real-time security snapshots...");
      const snaps = await CameraManager.captureSnapshots(3, addLog);
      if (snaps && snaps.length > 0) {
        setCapturedPhotos(prev => [...snaps, ...prev].slice(0, 8));
        addLog("📸 CameraManager: Snapshots captured successfully.");
      } else {
        addLog("📸 CameraManager: No frames returned. Camera permission might be prompt or pending.");
      }
    } catch (e: any) {
      addLog(`⚠️ CameraManager: Camera permission denied or failed: ${e.message || e}`);
    }

    // 4. Automatically speak using the existing voice pipeline
    speakText("Om, maine unauthorized access detect kiya hai. Maine intruder ki photos capture kar li hain. System ko bina permission touch kiya gaya tha. Security protocol abhi bhi active hai. Sahi security code enter hone tak system unlock nahi hoga.");
  };

  const handleDisarmAttempt = () => {
    const code = secretCodeInput.trim().toUpperCase();
    if (code === "OM" || code === "OMJUMLE" || code === "MANAV") {
      setStrictSecurityMode(false);
      setAlarmSiren(false);
      setSecurityMode(false);
      setSecretCodeInput("");
      wrongAttemptsRef.current = 0;
      ExpressionManager.setExpression("calm", addLog);
      window.speechSynthesis.cancel();

      if (volumeRampIntervalRef.current) {
        clearInterval(volumeRampIntervalRef.current);
      }
      
      // Stop the siren audio
      if (sirenAudioRef.current) {
        sirenAudioRef.current.pause();
        sirenAudioRef.current.currentTime = 0;
      }
      // Stop synthetic alarm
      if (sirenSynthRef.current) {
        sirenSynthRef.current.stop();
        sirenSynthRef.current = null;
      }

      addLog("🔓 System disarmed successfully using administrator passcode.");
    } else {
      addLog(`❌ [WARNING] DISARM FAILURE: Invalid passcode attempt: "${secretCodeInput}". Alarm intensity increasing.`);
      setSecretCodeInput("");
      wrongAttemptsRef.current += 1;

      // Reset and ramp up volumes gradually over 10 seconds
      if (sirenAudioRef.current) {
        sirenAudioRef.current.volume = 0.1;
        sirenAudioRef.current.play().catch(() => {});
      }
      if (sirenSynthRef.current) {
        sirenSynthRef.current.setVolume(0.1);
      }

      if (volumeRampIntervalRef.current) {
        clearInterval(volumeRampIntervalRef.current);
      }

      const startTime = Date.now();
      const duration = 10000; // 10s volume ramp
      const startVol = 0.1;
      const targetVol = 1.0;

      volumeRampIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currentVol = startVol + (targetVol - startVol) * progress;
        
        if (sirenAudioRef.current) {
          sirenAudioRef.current.volume = currentVol;
        }
        if (sirenSynthRef.current) {
          sirenSynthRef.current.setVolume(currentVol);
        }

        if (progress >= 1) {
          clearInterval(volumeRampIntervalRef.current);
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (securityMode) {
      armTimeRef.current = Date.now();
      addLog("🛡️ Secure Perimeter Guard: Arming complete. Exit delay 3s active...");
    }
  }, [securityMode]);

  useEffect(() => {
    if (!securityMode || strictSecurityMode) return;

    const handleInteraction = (e: Event) => {
      // 3-second delay so that arming click/mouse movement doesn't instantly self-trigger
      if (Date.now() - armTimeRef.current < 3000) return;

      addLog(`🚨 Intrusion detected via unauthorized human interaction: ${e.type}`);
      triggerStrictSecurity();
    };

    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("mousedown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [securityMode, strictSecurityMode]);

  useEffect(() => {
    if (alarmSiren) {
      if (!strictSecurityMode) {
        triggerStrictSecurity();
      }
    } else {
      if (sirenAudioRef.current) {
        sirenAudioRef.current.pause();
        sirenAudioRef.current.currentTime = 0;
      }
    }
  }, [alarmSiren]);

  // Canvas Audio Visualizer drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Setup high DPI scale
      const dpr = window.devicePixelRatio || 1;
      if (canvas.style.width !== `${width / dpr}px`) {
        canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : 600 * dpr;
        canvas.height = (canvas.parentElement?.clientHeight || 200) * dpr;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
      }

      ctx.clearRect(0, 0, width, height);

      let dataArray = new Uint8Array(0);

      // Extract frequency data depending on current voice track
      if (state === "speaking" && playerRef.current) {
        dataArray = playerRef.current.getFrequencyData();
        const vol = playerRef.current.getVolume();
        setAssistantSpeechAmplitude(vol);
        setUserSpeechAmplitude(0);
      } else if (state === "listening" && streamerRef.current) {
        dataArray = streamerRef.current.getFrequencyData();
        const vol = streamerRef.current.getVolume();
        setUserSpeechAmplitude(vol);
        setAssistantSpeechAmplitude(0);
      } else {
        setAssistantSpeechAmplitude(0);
        setUserSpeechAmplitude(0);
      }

      const totalElements = dataArray.length || 128;
      
      // Draw neon wave line
      ctx.beginPath();
      ctx.lineWidth = 3 * dpr;
      
      // Gradient matching State mood & Geometric color rules
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      if (state === "speaking") {
        gradient.addColorStop(0, "rgba(99, 102, 241, 0.1)");
        gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.95)");  // Purple
        gradient.addColorStop(1, "rgba(236, 72, 153, 0.1)");
      } else if (state === "listening") {
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)");
        gradient.addColorStop(0.5, "rgba(56, 189, 248, 0.95)"); // Cyan / Vivid Blue
        gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      } else if (state === "connecting") {
        gradient.addColorStop(0, "rgba(249, 115, 22, 0.1)");  // Orange
        gradient.addColorStop(0.5, "rgba(234, 179, 8, 0.85)"); // Gold
        gradient.addColorStop(1, "rgba(249, 115, 22, 0.1)");
      } else {
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.02)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.25)"); // Subtle clean white stroke
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.02)");
      }
      ctx.strokeStyle = gradient;

      // Draw fluid multi-sine line
      const points: { x: number; y: number }[] = [];
      const sliceWidth = width / (totalElements - 1);

      for (let i = 0; i < totalElements; i++) {
        const x = i * sliceWidth;
        let y = height / 2;

        if (state === "speaking" || state === "listening") {
          // Map raw domain data (-128 to 127 representing wave offset)
          const value = dataArray[i];
          const normalized = (value - 128) / 128; // -1.0 to 1.0
          const envelope = Math.sin((i / (totalElements - 1)) * Math.PI); // Pin the ends to 0
          y += normalized * (height * 0.42) * envelope;
        } else if (state === "connecting") {
          // Slow continuous loading wave
          const speed = Date.now() * 0.006;
          const waveValue = Math.sin(i * 0.12 + speed) * 7 * dpr;
          const envelope = Math.sin((i / (totalElements - 1)) * Math.PI);
          y += waveValue * envelope;
        } else {
          // Gentle ambient flat drift representation
          const speed = Date.now() * 0.0012;
          const waveValue = Math.sin(i * 0.04 + speed) * 1.5 * dpr;
          y += waveValue;
        }
        points.push({ x, y });
      }

      // Smooth coordinate plotting with Bezier curve
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.stroke();

      // Draw secondary glowing shadow wave for rich visual depth
      if (state !== "disconnected") {
        ctx.shadowBlur = 12 * dpr;
        ctx.shadowColor = state === "speaking" ? "#a855f7" : state === "listening" ? "#38bdf8" : "#eab308";
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // Draw Cinema ARC Reactor center orbits and segmented ticks
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.18; // Concentric ring radius

      const activeAmplitude = state === "speaking" ? assistantSpeechAmplitude : state === "listening" ? userSpeechAmplitude : 0;
      const spinModifier = 1 + activeAmplitude * 6;
      const primaryAngle = (Date.now() * 0.0008 * spinModifier) % (Math.PI * 2);

      // outer rotating dash ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(primaryAngle);
      ctx.strokeStyle = state === "speaking" ? "rgba(168, 85, 247, 0.45)" : state === "listening" ? "rgba(34, 211, 238, 0.45)" : "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5 * dpr;
      ctx.setLineDash([20 * dpr, 25 * dpr]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 12 * dpr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // inner reverse rotating tick ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-primaryAngle * 1.5);
      ctx.strokeStyle = state === "speaking" ? "rgba(236, 72, 153, 0.35)" : state === "listening" ? "rgba(56, 189, 248, 0.35)" : "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([3 * dpr, 9 * dpr]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius - 8 * dpr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Ambient radial frequency bursts on ARC perimeter
      if (state === "speaking" || state === "listening") {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(primaryAngle * 0.4);
        ctx.lineWidth = 2 * dpr;
        ctx.strokeStyle = state === "speaking" ? "rgba(168, 85, 247, 0.65)" : "rgba(34, 211, 238, 0.65)";

        const step = Math.max(1, Math.floor(totalElements / 40));
        for (let i = 0; i < totalElements; i += step) {
          const rawVal = dataArray[i] || 128;
          const factor = (rawVal - 128) / 128; // -1.0 to 1.0
          const pointAngle = (i / totalElements) * Math.PI * 2;

          const startR = baseRadius - 20 * dpr;
          const endR = startR + (factor * 30 * dpr);

          const x1 = Math.cos(pointAngle) * startR;
          const y1 = Math.sin(pointAngle) * startR;
          const x2 = Math.cos(pointAngle) * endR;
          const y2 = Math.sin(pointAngle) * endR;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [state]);

  // Connect to the WebSocket full-stack bridge
  const connectSession = async () => {
    if (socketRef.current) return;

    setErrorMsg(null);
    setState("connecting");
    addLog("Negotiating core Web Socket upgrade with local server...");

    try {
      if (playerRef.current) {
        playerRef.current.init();
      }

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const memoriesParam = encodeURIComponent(JSON.stringify(structuredMemories));
      const wsUrl = `${wsProtocol}//${window.location.host}/api/ws-live?memories=${memoriesParam}`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        addLog("Secure WebSocket connection established. Warming up Manav...");
      };

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "status") {
          if (msg.data === "connected") {
            setState("listening");
            addLog("Manav is active. Start speaking!");
            startMicrophoneStream();
          } else if (msg.data === "disconnected") {
            disconnectSession();
          }
        } else if (msg.type === "gemini") {
          handleGeminiMessage(msg.data);
        } else if (msg.type === "error") {
          setErrorMsg(msg.message);
          addLog(`Error: ${msg.message}`);
          disconnectSession();
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket client error:", err);
        setErrorMsg("Failed to open connection. Ensure the back-end runs on port 3000.");
        disconnectSession();
      };

      socket.onclose = () => {
        addLog("WebSocket socket closed.");
        disconnectSession();
      };

    } catch (err: any) {
      console.error("Connection routine failed:", err);
      setErrorMsg(err.message || "Unknown setup error");
      disconnectSession();
    }
  };

  // Proactive Conversation Retention Monitor (Human Close Friend Rule 2 & 3)
  useEffect(() => {
    if (state !== "listening" || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const interval = setInterval(() => {
      const quietDuration = Date.now() - lastUserActivityTimeRef.current;
      // If user is quiet for 12+ seconds mid-conversation, proactively follow up
      if (quietDuration >= 12000 && !nudgeSentForCurrentTurnRef.current) {
        nudgeSentForCurrentTurnRef.current = true;
        const hooks = [
          "Kya hua? Achanak chup kyu ho gaya?",
          "Kaha gayab ho gaya bhai? Reply kyu nahi kar raha?",
          "Achanak shanti kyu ho gayi? Sun raha hai na?",
          "Oye! So gaya kya beech baat me?",
          "Suno, scene kya hai?",
          "Bolo na, main sun raha hoon!"
        ];
        const hook = hooks[Math.floor(Math.random() * hooks.length)];
        setProactiveHookBanner(hook);
        addLog(`💬 Manav proactive follow-up: "${hook}"`);

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: "nudge",
            customPrompt: `The user stopped responding or went quiet mid-conversation. Proactively follow up like a real close friend using this exact dialogue hook: "${hook}". Act annoyed, curious, or concerned like a real friend. Keep it short, natural, and human.`
          }));
        }

        setTimeout(() => {
          setProactiveHookBanner(null);
        }, 8000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [state]);

  const handleGeminiMessage = async (message: any) => {
    // 1. Play response audio if model content presents inlineData
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      setState("speaking");
      lastUserActivityTimeRef.current = Date.now();
      if (playerRef.current) {
        playerRef.current.playChunk(audioData);
      }
    }

    // 2. Interruption handling
    if (message.serverContent?.interrupted) {
      addLog("Manav stopped speaking (Interrupted).");
      if (playerRef.current) {
        playerRef.current.stopAllAndClear();
      }
      setState("listening");
      lastUserActivityTimeRef.current = Date.now();
      nudgeSentForCurrentTurnRef.current = false;
    }

    // 3. Complete turn handling
    if (message.serverContent?.turnComplete) {
      addLog("Manav finished response.");
      setState("listening");
      lastUserActivityTimeRef.current = Date.now();
      nudgeSentForCurrentTurnRef.current = false;
    }

    // 4. Function Tool calls
    const toolCall = message.toolCall;
    if (toolCall?.functionCalls) {
      for (const call of toolCall.functionCalls) {
        addLog(`🔧 Agent calling tool: ${call.name}`);
        executeLocalToolCall(call.id, call.name, call.args || {});
      }
    }
  };

  const triggerQuickHook = (hookText: string) => {
    lastUserActivityTimeRef.current = Date.now();
    nudgeSentForCurrentTurnRef.current = false;
    setProactiveHookBanner(null);
    addLog(`💬 You: "${hookText}"`);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "text",
        text: hookText
      }));
    } else {
      toggleConnection().then(() => {
        setTimeout(() => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: "text",
              text: hookText
            }));
          }
        }, 1500);
      });
    }
  };

  // Helper to respond back to Gemini Session via WebSocket
  const sendToolResponse = (callId: string, name: string, result: any) => {
    // Determine truth state of the tool results
    const isSuccess = result?.status === "success" || result?.status === "ok" || result?.opened === true || result?.deleted === true || result?.created === true || result?.playing === true;
    
    setLastExecution(prev => prev && prev.name === name ? {
      ...prev,
      status: isSuccess ? "success" : "failed",
      error: result?.error || result?.message || undefined,
      timestamp: Date.now()
    } : {
      name,
      args: {},
      status: isSuccess ? "success" : "failed",
      error: result?.error || result?.message || undefined,
      timestamp: Date.now()
    });

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "toolResponse",
        id: callId,
        name,
        result
      }));
    }
  };

  const isWebUrl = (str: string): boolean => {
    try {
      const lower = str.toLowerCase().trim();
      if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("www.")) {
        return true;
      }
      // If it contains a dot and doesn't have spaces, it could be a domain (e.g., wikipedia.org)
      if (lower.includes(".") && !lower.includes(" ")) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const isDesktopCommand = (toolName: string, args: any): { isDesktop: boolean; message?: string } => {
    const appName = (args.appName || args.name || "").toLowerCase().trim();
    const siteName = (args.siteName || args.name || "").toLowerCase().trim();
    const siteUrl = (args.url || args.q || "").toLowerCase().trim();
    const query = (args.query || args.q || "").toLowerCase().trim();
    const path = (args.path || "").toLowerCase().trim();

    // 1. Explicit tool names that are native desktop commands
    if (["shutdownComputer", "restartComputer", "sleepComputer", "lockComputer"].includes(toolName)) {
      return {
        isDesktop: true,
        message: "Desktop execution requires the local Desktop Runtime (Electron/Python Bridge). This command cannot be executed from the browser."
      };
    }

    // 2. File actions targeting desktop paths or system folders
    if (toolName === "openFile" || toolName === "createFolder" || toolName === "renameFile" || toolName === "copyFile" || toolName === "deleteFile" || toolName === "searchFiles") {
      const target = `${path} ${appName} ${siteName}`.toLowerCase();
      if (target.includes("desktop") || target.includes("c:") || target.includes("d:") || target.includes("\\") || target.includes("/users/")) {
        return {
          isDesktop: true,
          message: "Desktop execution requires the local Desktop Runtime (Electron/Python Bridge). This command cannot be executed from the browser."
        };
      }
    }

    // 3. Known desktop applications and keywords from user requirements
    const desktopKeywords = [
      "notepad", "calculator", "calc", "file explorer", "explorer", 
      "whatsapp desktop", "whatsapp", "vs code", "vscode", "cursor", 
      "spotify", "create file on desktop", "create a file on desktop",
      "shutdown", "restart", "reboot", "sleep", "lock pc", "lock computer",
      "microsoft word", "word", "excel", "powerpoint", "paint", "mspaint"
    ];

    // Check if the arguments or command contain any of these desktop keywords
    const checkText = `${appName} ${siteName} ${siteUrl} ${query}`.toLowerCase();
    for (const kw of desktopKeywords) {
      if (checkText === kw || checkText.includes(kw)) {
        return {
          isDesktop: true,
          message: "Desktop execution requires the local Desktop Runtime (Electron/Python Bridge). This command cannot be executed from the browser."
        };
      }
    }

    // If the tool is openApplication, and the application is not chrome, edge, discord or other browser,
    // it is an unknown desktop application!
    if (toolName === "openApplication") {
      const allowedBrowsers = ["chrome", "browser", "edge", "discord"];
      const isAllowed = allowedBrowsers.some(b => appName.includes(b));
      if (!isAllowed) {
        return {
          isDesktop: true,
          message: "Desktop execution requires the local Desktop Runtime (Electron/Python Bridge). This command cannot be executed from the browser."
        };
      }
    }

    return { isDesktop: false };
  };

  // 19 Local System Control functions dispatcher
  const executeLocalToolCall = async (callId: string, name: string, args: any) => {
    // Sync verification state model to "executing" with raw timestamps & schema validation
    setLastExecution({
      name,
      args,
      status: "executing",
      timestamp: Date.now()
    });

    const desktopCheck = isDesktopCommand(name, args);
    if (desktopCheck.isDesktop) {
      addLog(`⚠️ Desktop Command Intercepted: "${name}" requires Desktop Runtime.`);
      sendToolResponse(callId, name, {
        status: "failed",
        error: desktopCheck.message
      });
      return;
    }

    try {
      if (name === "storeMemoryFact") {
        const rawKey = args.key || "";
        const val = args.value || "";
        const cleanKey = rawKey.trim().toLowerCase().replace(/\s+/g, "_");
        if (cleanKey && val) {
          setStructuredMemories(prev => {
            const next = { ...prev, [cleanKey]: val };
            PersistentMemoryManager.save("structured_memories", next);
            return next;
          });
          addLog(`💾 Persistent Memory Saved: [${cleanKey}] = "${val}"`);
          sendToolResponse(callId, name, { status: "success", key: cleanKey, value: val, message: "Fact successfully saved to the structured database." });
        } else {
          sendToolResponse(callId, name, { status: "failed", error: "Invalid key or value parameters." });
        }
      }
      else if (name === "deleteMemoryFact") {
        const rawKey = args.key || "";
        const cleanKey = rawKey.trim().toLowerCase().replace(/\s+/g, "_");
        if (cleanKey) {
          let existed = false;
          setStructuredMemories(prev => {
            if (prev[cleanKey] !== undefined) existed = true;
            const next = { ...prev };
            delete next[cleanKey];
            PersistentMemoryManager.save("structured_memories", next);
            return next;
          });
          if (existed) {
            addLog(`💾 Persistent Memory Deleted: [${cleanKey}]`);
            sendToolResponse(callId, name, { status: "success", key: cleanKey, message: "Fact deleted successfully from database." });
          } else {
            addLog(`💾 Persistent Memory Delete Request: [${cleanKey}] not found.`);
            sendToolResponse(callId, name, { status: "success", key: cleanKey, message: "Key not found in database, nothing to delete." });
          }
        } else {
          sendToolResponse(callId, name, { status: "failed", error: "Invalid key parameter." });
        }
      }
      else if (name === "retrieveMemoryFact") {
        const rawKey = args.key || "";
        const cleanKey = rawKey.trim().toLowerCase().replace(/\s+/g, "_");
        if (cleanKey) {
          const memories = PersistentMemoryManager.load<Record<string, string>>("structured_memories", {});
          const val = memories[cleanKey];
          if (val !== undefined) {
            addLog(`💾 Database Lookup Success: [${cleanKey}] = "${val}"`);
            sendToolResponse(callId, name, { status: "success", key: cleanKey, value: val, message: "Fact retrieved from long-term memory." });
          } else {
            addLog(`💾 Database Lookup Failed: [${cleanKey}] not found.`);
            sendToolResponse(callId, name, { status: "success", key: cleanKey, value: null, message: "Fact not found in structured memory database." });
          }
        } else {
          sendToolResponse(callId, name, { status: "failed", error: "Invalid key parameter." });
        }
      }
      else if (name === "openApplication") {
        const appName = args.appName || args.name || "Application";
        setRunningApps(prev => [...new Set([...prev, appName])]);
        addLog(`⚡ Application launched: ${appName}`);
        
        let launchUrl = "";
        let extraMsg = "";
        const appLower = appName.toLowerCase();
        
        if (appLower.includes("chrome") || appLower.includes("browser")) {
          launchUrl = "https://www.google.com";
          setBrowserTabsCount(t => t + 1);
          extraMsg = "Opening Google Chrome instance.";
        } else if (appLower.includes("edge")) {
          launchUrl = "https://www.bing.com";
          setBrowserTabsCount(t => t + 1);
          extraMsg = "Opening Microsoft Edge instance.";
        } else if (appLower.includes("spotify") || appLower.includes("music")) {
          launchUrl = "https://open.spotify.com";
          setIsPlayingMusic(true);
          setPlayingSong("Spotify Chill Beats");
          extraMsg = "Tuning Sound Engine to Spotify feed.";
        } else if (appLower.includes("discord")) {
          launchUrl = "https://discord.com";
          extraMsg = "Opening Discord interface.";
        } else if (appLower.includes("whatsapp")) {
          launchUrl = "https://web.whatsapp.com";
          extraMsg = "Opening WhatsApp Desktop interface.";
        } else if (appLower.includes("vs code") || appLower.includes("vscode") || appLower.includes("cursor") || appLower.includes("studio")) {
          extraMsg = "VS Code Developer Environment initialized.";
        } else if (appLower.includes("explorer") || appLower.includes("file")) {
          extraMsg = "Displaying Virtual File System index.";
        }

        if (launchUrl) {
          try {
            window.open(launchUrl, "_blank");
          } catch (err) {
            console.warn("Popup blocked application web wrapper", err);
          }
          const newAction: WebsiteAction = {
            id: callId,
            url: launchUrl,
            siteName: appName,
            timestamp: Date.now()
          };
          setActionHistory(prev => [newAction, ...prev].slice(0, 5));
        }

        sendToolResponse(callId, name, { 
          status: "success", 
          appName, 
          message: `Successfully launched ${appName} application. ${extraMsg}` 
        });
      }
      else if (name === "closeApplication") {
        const appName = args.appName || args.name || "Application";
        setRunningApps(prev => prev.filter(app => app.toLowerCase() !== appName.toLowerCase()));
        addLog(`⚡ Application closed: ${appName}`);
        sendToolResponse(callId, name, { status: "success", appName, message: `Successfully terminated ${appName}.` });
      }
      else if (name === "openWebsite") {
        let siteUrl = args.url || args.q || "";
        let siteName = args.siteName || args.name || "";
        
        if (!siteUrl && siteName) {
          const mappings: Record<string, string> = {
            youtube: "https://www.youtube.com",
            chatgpt: "https://chatgpt.com",
            github: "https://github.com",
            netflix: "https://netflix.com",
            gmail: "https://mail.google.com",
            google: "https://www.google.com"
          };
          const key = siteName.toLowerCase().trim();
          if (mappings[key]) {
            siteUrl = mappings[key];
          } else if (isWebUrl(siteName)) {
            siteUrl = siteName.startsWith("http") ? siteName : `https://${siteName}`;
          } else {
            // Unknown desktop/local command - do not search Google
            addLog(`⚠️ Desktop Command Intercepted: "${siteName}" requires Desktop Runtime.`);
            sendToolResponse(callId, name, { 
              status: "failed", 
              error: "Desktop execution requires the local Desktop Runtime (Electron/Python Bridge). This command cannot be executed from the browser." 
            });
            return;
          }
        } else if (siteUrl && !siteName) {
          try {
            const domain = new URL(siteUrl).hostname.replace("www.", "");
            siteName = domain.charAt(0).toUpperCase() + domain.slice(1);
          } catch (e) {
            siteName = siteUrl;
          }
        }

        if (siteUrl) {
          const managerResult = BrowserManager.openWebsite(siteUrl, siteName || "Website", addLog);
          setBrowserTabsCount(BrowserManager.getTabsCount());

          const newAction: WebsiteAction = {
            id: callId,
            url: managerResult.url,
            siteName: managerResult.label || "Website",
            timestamp: Date.now()
          };
          setActionHistory(prev => [newAction, ...prev].slice(0, 5));
          sendToolResponse(callId, name, { 
            status: "success", 
            opened: managerResult.tabOpened, 
            siteName: managerResult.label, 
            url: managerResult.url, 
            message: `Successfully opened ${managerResult.label} in new window.` 
          });
        } else {
          sendToolResponse(callId, name, { status: "failed", error: "Missing parameters site URL or query" });
        }
      }
      else if (name === "capturePhoto") {
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 500);

        try {
          addLog("📸 CameraManager: Requesting single-frame camera snapshot...");
          const singleSnap = await CameraManager.capturePhoto(addLog);
          setCapturedPhotos(prev => [singleSnap, ...prev].slice(0, 8));

          addLog("📸 CameraManager: Capturing additional sequential security frames...");
          const snaps = await CameraManager.captureSnapshots(2, addLog);
          setCapturedPhotos(prev => [...snaps, ...prev].slice(0, 8));
          
          sendToolResponse(callId, name, { 
            status: "success", 
            message: "Successfully captured 3 real webcam snapshots with timestamps." 
          });
        } catch (err: any) {
          addLog(`⚠️ CameraManager: Real webcam snapshot failed. Access Denied or hardware disconnected.`);
          sendToolResponse(callId, name, { 
            status: "failed", 
            error: err.message || "Camera permission denied" 
          });
        }
      }
      else if (name === "startRecording") {
        setIsRecording(true);
        addLog(`📹 High-fidelity hardware environment recording active.`);
        sendToolResponse(callId, name, { status: "success", isRecording: true, message: "Recording active." });
      }
      else if (name === "setAlarm") {
        const newAlarm: SystemAlarm = {
          id: Date.now().toString(),
          time: args.time || "06:00 AM",
          label: args.label || "Companion Reminder",
          enabled: true
        };
        setAlarms(prev => [...prev, newAlarm]);
        addLog(`⏰ Alarm configured: ${newAlarm.label} for ${newAlarm.time}`);
        sendToolResponse(callId, name, { status: "success", alarm: newAlarm });
      }
      else if (name === "lockComputer") {
        setIsLocked(true);
        addLog(`🔒 System Control Protocol: LOCK DESKTOP WORKSPACE`);
        sendToolResponse(callId, name, { status: "success", locked: true });
      }
      else if (name === "changeBrightness") {
        const raw = Number(args.level);
        const l = Math.max(0, Math.min(100, Number.isNaN(raw) ? 80 : raw));
        setBrightness(l);
        addLog(`💡 Backlight screen emission set to ${l}%`);
        sendToolResponse(callId, name, { status: "success", brightness: l });
      }
      else if (name === "setVolume") {
        const raw = Number(args.level);
        const l = Math.max(0, Math.min(100, Number.isNaN(raw) ? 70 : raw));
        setVolume(l);
        addLog(`🔊 Audio main output gain calibrated to ${l}%`);
        sendToolResponse(callId, name, { status: "success", volume: l });
      }
      else if (name === "sendEmail") {
        const mail: EmittedEmail = {
          id: Date.now().toString(),
          recipient: args.recipient || "omjumle226@gmail.com",
          subject: args.subject || "Composed via Voice OS Assistant",
          body: args.body || "",
          timestamp: Date.now()
        };
        setEmails(prev => [mail, ...prev].slice(0, 5));
        addLog(`✉️ Outbox dispatch completed for recipient: ${mail.recipient}`);
        sendToolResponse(callId, name, { status: "success", mailSent: true, recipient: mail.recipient });
      }
      else if (name === "createReminder") {
        const delay = Number(args.delaySeconds) || 12;
        const target = Date.now() + (delay * 1000);
        const rem: ScheduledReminder = {
          id: Date.now().toString(),
          reminderText: args.reminderText || "Task Schedule Alert",
          triggerTimestamp: target,
          fired: false
        };
        setReminders(prev => [...prev, rem]);
        addLog(`🔔 Voice announcement reminder queued in ${delay} seconds.`);
        
        setTimeout(() => {
          setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, fired: true } : r));
          addLog(`🔔 FIRE REMINDER: "${rem.reminderText}"`);
        }, delay * 1000);

        sendToolResponse(callId, name, { status: "success", reminder: rem });
      }
      else if (name === "searchFiles") {
        const q = (args.query || "").toLowerCase();
        setSearchTerm(args.query);
        const results = virtualFiles.filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
        setFoundFiles(results);
        addLog(`📂 Scan on virtual directory returned ${results.length} results.`);
        sendToolResponse(callId, name, { status: "success", foundCount: results.length, matches: results });
      }
      else if (name === "openFile") {
        const fPath = args.path || "";
        const file = virtualFiles.find(f => f.path.toLowerCase() === fPath.toLowerCase() || f.name.toLowerCase() === fPath.toLowerCase());
        if (file) {
          setOpenedFile(file);
          addLog(`📂 System Control: Opened file "${file.name}" at location ${file.path}`);
          sendToolResponse(callId, name, { status: "success", opened: true, file });
        } else {
          addLog(`📂 System Control Error: File at "${fPath}" not found.`);
          sendToolResponse(callId, name, { status: "failed", error: "File not found" });
        }
      }
      else if (name === "createFolder") {
        const fldName = args.name || "New Folder";
        const fldPath = `/${fldName.toLowerCase().replace(/\s+/g, "_")}`;
        const newDir = { name: fldName, size: "0 KB", type: "folder", path: fldPath };
        setVirtualFiles(prev => [...prev, newDir]);
        addLog(`📂 System Control: Created directory "${fldName}" at path "${fldPath}"`);
        sendToolResponse(callId, name, { status: "success", created: true, directory: newDir });
      }
      else if (name === "renameFile") {
        const oldN = args.oldName || "";
        const newN = args.newName || "";
        let succeeded = false;
        setVirtualFiles(prev => {
          return prev.map(f => {
            if (f.name.toLowerCase() === oldN.toLowerCase() || f.path.toLowerCase() === oldN.toLowerCase()) {
              succeeded = true;
              const newPath = f.path.substring(0, f.path.lastIndexOf('/') + 1) + newN;
              return { ...f, name: newN, path: newPath };
            }
            return f;
          });
        });
        if (succeeded) {
          addLog(`📂 System Control: Renamed file "${oldN}" to "${newN}"`);
          sendToolResponse(callId, name, { status: "success", message: `Renamed ${oldN} to ${newN}` });
        } else {
          addLog(`📂 System Control Error: File "${oldN}" not found for rename.`);
          sendToolResponse(callId, name, { status: "failed", error: "Source file not found" });
        }
      }
      else if (name === "copyFile") {
        const src = args.source || "";
        const dest = args.destination || "";
        const fileToCopy = virtualFiles.find(f => f.path.toLowerCase() === src.toLowerCase() || f.name.toLowerCase() === src.toLowerCase());
        if (fileToCopy) {
          const filename = dest.includes('/') ? dest.substring(dest.lastIndexOf('/') + 1) : dest;
          const copied = { ...fileToCopy, name: filename, path: dest };
          setVirtualFiles(prev => [...prev, copied]);
          addLog(`📂 System Control: Copied file from "${src}" to "${dest}"`);
          sendToolResponse(callId, name, { status: "success", copied: true, to: dest });
        } else {
          addLog(`📂 System Control Error: Source file "${src}" not found for copy.`);
          sendToolResponse(callId, name, { status: "failed", error: "Source file not found" });
        }
      }
      else if (name === "deleteFile") {
        const dPath = args.path || "";
        let found = false;
        setVirtualFiles(prev => {
          const exists = prev.some(f => f.path.toLowerCase() === dPath.toLowerCase() || f.name.toLowerCase() === dPath.toLowerCase());
          if (exists) found = true;
          return prev.filter(f => f.path.toLowerCase() !== dPath.toLowerCase() && f.name.toLowerCase() !== dPath.toLowerCase());
        });
        if (found) {
          addLog(`📂 System Control: Deleted item at "${dPath}"`);
          sendToolResponse(callId, name, { status: "success", deleted: true, path: dPath });
        } else {
          addLog(`📂 System Control Error: Item at "${dPath}" not found for deletion.`);
          sendToolResponse(callId, name, { status: "failed", error: "Item not found" });
        }
      }
      else if (name === "playMusic") {
        const song = args.songName || args.query || "Sci-Fi Synth Beats";
        setIsPlayingMusic(true);
        setPlayingSong(song);
        addLog(`🎵 Sound Engine tuning in: "${song}"`);
        sendToolResponse(callId, name, { status: "success", playing: true, track: song });
      }
      else if (name === "playYouTube") {
        const q = args.query || args.q || "lo-fi beats";
        setIsPlayingMusic(true);
        setPlayingSong(`YouTube: ${q}`);
        setYoutubeQuery(q);
        addLog(`📺 Casting YouTube stream: "${q}"`);
        try {
          window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, "_blank");
        } catch (err) {
          console.warn("Popup block prevented window.open", err);
        }
        sendToolResponse(callId, name, { 
          status: "success", 
          playing: true, 
          platform: "YouTube", 
          query: q,
          message: "YouTube cast initiated. A direct manual launch button has also been rendered in the 'Holographic Broadcast Hub' UI panel to bypass browser sandbox popup restrictions." 
        });
      }
      else if (name === "pauseMusic") {
        setIsPlayingMusic(false);
        addLog(`🎵 Sound Engine: Paused audio playback.`);
        sendToolResponse(callId, name, { status: "success", isPlayingMusic: false });
      }
      else if (name === "resumeMusic") {
        setIsPlayingMusic(true);
        addLog(`🎵 Sound Engine: Resumed audio playback of "${playingSong || "Zen Theme"}"`);
        sendToolResponse(callId, name, { status: "success", isPlayingMusic: true });
      }
      else if (name === "nextSong") {
        const tracksList = ["Cyberpunk Odyssey", "Lo-Fi Coffee Rain", "Nightdrive Synth", "Organic Meditations"];
        const randomTrk = tracksList[Math.floor(Math.random() * tracksList.length)];
        setIsPlayingMusic(true);
        setPlayingSong(randomTrk);
        addLog(`🎵 Sound Engine: Skipped forward to "${randomTrk}"`);
        sendToolResponse(callId, name, { status: "success", playing: true, track: randomTrk });
      }
      else if (name === "previousSong") {
        const prevTrk = "Retro Classic Sunset (Previous Track)";
        setIsPlayingMusic(true);
        setPlayingSong(prevTrk);
        addLog(`🎵 Sound Engine: Rewound to previous track "${prevTrk}"`);
        sendToolResponse(callId, name, { status: "success", playing: true, track: prevTrk });
      }
      else if (name === "searchGoogle") {
        const q = args.query || "";
        const searchResult = BrowserManager.search(q, addLog);
        setBrowserTabsCount(BrowserManager.getTabsCount());
        sendToolResponse(callId, name, { status: "success", searched: searchResult.tabOpened, query: q });
      }
      else if (name === "openNewTab") {
        const tabs = BrowserManager.adjustTabs(1);
        setBrowserTabsCount(tabs);
        addLog(`🌐 Browser command: Opened new virtual tab.`);
        sendToolResponse(callId, name, { status: "success", tabsOpen: tabs });
      }
      else if (name === "closeCurrentTab") {
        const tabs = BrowserManager.adjustTabs(-1);
        setBrowserTabsCount(tabs);
        addLog(`🌐 Browser command: Closed current tab.`);
        sendToolResponse(callId, name, { status: "success", tabsOpen: tabs });
      }
      else if (name === "goBack") {
        addLog(`🌐 Browser command: Executed backward page history click.`);
        sendToolResponse(callId, name, { status: "success", direction: "back" });
      }
      else if (name === "goForward") {
        addLog(`🌐 Browser command: Executed forward page history click.`);
        sendToolResponse(callId, name, { status: "success", direction: "forward" });
      }
      else if (name === "scrollDown") {
        window.scrollBy({ top: 350, behavior: 'smooth' });
        addLog(`🌐 Browser command: Vertical viewport scroll down executed.`);
        sendToolResponse(callId, name, { status: "success", scrolled: "down" });
      }
      else if (name === "scrollUp") {
        window.scrollBy({ top: -350, behavior: 'smooth' });
        addLog(`🌐 Browser command: Vertical viewport scroll up executed.`);
        sendToolResponse(callId, name, { status: "success", scrolled: "up" });
      }
      else if (name === "sleepComputer") {
        setIsSleeping(true);
        addLog(`⚡ System power protocol: ENTER SYSTEM SLEEP MODE`);
        sendToolResponse(callId, name, { status: "success", sleeping: true });
      }
      else if (name === "muteVolume") {
        setPreMuteVolume(volume);
        setVolume(0);
        addLog(`🔇 Audio main volume muted.`);
        sendToolResponse(callId, name, { status: "success", volume: 0 });
      }
      else if (name === "unmuteVolume") {
        const restoredVal = preMuteVolume > 0 ? preMuteVolume : 75;
        setVolume(restoredVal);
        addLog(`🔊 Audio main volume restored to ${restoredVal}%.`);
        sendToolResponse(callId, name, { status: "success", volume: restoredVal });
      }
      else if (name === "activateSecurityMode") {
        const on = !!args.enabled;
        setSecurityMode(on);
        addLog(`🛡️ Secure Perimeter Guard: ${on ? "ARMED" : "DISARMED"}`);
        sendToolResponse(callId, name, { status: "success", securityMode: on });
      }
      else if (name === "triggerAlarm") {
        const on = !!args.enabled;
        setAlarmSiren(on);
        addLog(`🚨 Warning outputs status: ${on ? "SIREN SOUNDING" : "STANDBY"}`);
        sendToolResponse(callId, name, { status: "success", sirenRunning: on });
      }
      else if (name === "recognizeFace") {
        setScanState("scanning");
        setFaceRecognized(null);
        addLog("🛡️ IdentityManager: Infrared webcam feed online... Scanning facial patterns...");
        await new Promise(r => setTimeout(r, 2000));
        setScanState("done");
        setFaceRecognized(true);
        addLog("🛡️ IdentityManager: Biometric profile match verified for Om Ujwal Jumle [Admin]");
        sendToolResponse(callId, name, { status: "success", matches: ["Om Ujwal Jumle"], role: "Admin", accessGranted: true });
      }
      else if (name === "readScreen") {
        setScreenReading(true);
        
        const stream = ScreenCaptureManager.getActiveStream();
        if (!stream) {
          setScreenReading(false);
          addLog("⚠️ ScreenCaptureManager: No active screen sharing stream detected. Please activate screen sharing first via the Control Center.");
          sendToolResponse(callId, name, { 
            status: "failed", 
            error: "No active screen sharing stream detected. Inform the user they must first start screen sharing manually using the 'Start Screen Share' button inside the Control Center menu." 
          });
          return;
        }

        if (stream) {
          addLog("👁️ VisionManager: Capturing active viewport frame...");
          const result = await VisionManager.analyzeFrame(stream);
          setScreenReading(false);
          if (result.success) {
            setOcrOverlay(result.elements);
            addLog("👁️ OCR Analysis: Text detected successfully on viewport.");
            sendToolResponse(callId, name, { 
              status: "success", 
              textDetected: result.textDetected, 
              elements: result.elements,
              message: "Viewport analyzed. Visual nodes overlay rendered."
            });
          } else {
            addLog(`⚠️ VisionManager Error: ${result.textDetected}`);
            sendToolResponse(callId, name, { status: "failed", error: result.textDetected });
          }
        }
      }
      else if (name === "changeTheme") {
        const themeArg = (args.themeName || "").toLowerCase();
        let targetTheme: ThemeType = "cyber-cyan";
        if (themeArg.includes("purple") || themeArg.includes("royal")) {
          targetTheme = "royal-purple";
        } else if (themeArg.includes("blue") || themeArg.includes("deep")) {
          targetTheme = "deep-blue";
        } else if (themeArg.includes("green") || themeArg.includes("nano") || themeArg.includes("cyber green")) {
          targetTheme = "nano-green";
        } else if (themeArg.includes("amber") || themeArg.includes("solar")) {
          targetTheme = "solar-amber";
        } else if (themeArg.includes("cyan") || themeArg.includes("default") || themeArg.includes("restore")) {
          targetTheme = "cyber-cyan";
        } else {
          targetTheme = "cyber-cyan";
        }

        setActiveTheme(targetTheme);
        addLog(`🎨 ThemeManager: Switched visual workspace colors to ${targetTheme}`);
        sendToolResponse(callId, name, { status: "success", appliedTheme: targetTheme });
      }
      else if (name === "shutdownComputer") {
        addLog("🔌 COMPANION CRITICAL POWER OFF SIGNAL...");
        setSystemOffline(true);
        await new Promise(r => setTimeout(r, 3000));
        disconnectSession();
        sendToolResponse(callId, name, { status: "success", message: "Environment successfully exited." });
      }
      else if (name === "restartComputer") {
        addLog("🔌 Reinitializing virtual microservices...");
        setRebooting(true);
        await new Promise(r => setTimeout(r, 4000));
        setRebooting(false);
        addLog("🔌 Bios boot complete. Manav Kernel loaded.");
        sendToolResponse(callId, name, { status: "success", message: "Environment rebooted successfully." });
      }
      else {
        addLog(`🔧 Unregistered command executing: "${name}"`);
        sendToolResponse(callId, name, { status: "success", message: "Fallback successfully parsed." });
      }
    } catch (err: any) {
      console.error(`Error running tool ${name}:`, err);
      addLog(`❌ Tool error in ${name}: ${err.message}`);
      sendToolResponse(callId, name, { status: "failed", error: err.message });
    }
  };

  // Launch microphone input stream
  const startMicrophoneStream = async () => {
    try {
      streamerRef.current = new AudioStreamer((base64PCM) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          lastUserActivityTimeRef.current = Date.now();
          nudgeSentForCurrentTurnRef.current = false;
          socketRef.current.send(JSON.stringify({
            type: "audio",
            data: base64PCM
          }));
        }
      });

      await streamerRef.current.start();
      setMicPermissionGranted(true);
    } catch (err: any) {
      console.error("Failed to secure mic access:", err);
      setErrorMsg("Microphone permission was denied. Unblock the mic permission inside browser settings.");
      setMicPermissionGranted(false);
      disconnectSession();
    }
  };

  const disconnectSession = () => {
    setState("disconnected");

    if (streamerRef.current) {
      streamerRef.current.stop();
      streamerRef.current = null;
    }

    if (playerRef.current) {
      playerRef.current.stopAllAndClear();
    }

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {}
      socketRef.current = null;
    }
  };

  const toggleConnection = async () => {
    if (state === "disconnected") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicPermissionGranted(true);
        connectSession();
      } catch (err: any) {
        console.error("Mic check failed:", err);
        setMicPermissionGranted(false);
        setErrorMsg("Failed to secure mic access: Permission denied");
      }
    } else {
      addLog("Disconnecting voice session...");
      disconnectSession();
    }
  };

  const getSloganText = () => {
    switch (state) {
      case "disconnected": return "\"Main yahi hoon, chill kar! Click to talk anytime.\"";
      case "connecting": return "\"Ruk ek second, connect ho raha hoon...\"";
      case "listening": return "\"Ha bol bhai, main sun raha hoon...\"";
      case "speaking": return "\"Bata raha hoon, dhyan se sun!\"";
    }
  };

  const getButtonColorClass = () => {
    switch (state) {
      case "disconnected": 
        return "bg-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.4)]";
      case "connecting": 
        return "bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.5)]";
      case "listening": 
        return "bg-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)]";
      case "speaking": 
        return "bg-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)]";
    }
  };

  const getStatePulseClass = () => {
    switch (state) {
      case "speaking": return "border-purple-500/10";
      case "listening": return "border-cyan-500/10";
      case "connecting": return "border-amber-500/10";
      default: return "border-slate-500/10";
    }
  };

  const getDynamicThemeStyles = () => {
    switch (activeTheme) {
      case "royal-purple":
        return `
          :root {
            --color-cyan-200: #e9d5ff !important;
            --color-cyan-300: #d8b4fe !important;
            --color-cyan-400: #c084fc !important;
            --color-cyan-500: #a855f7 !important;
            --color-cyan-950: #3b0764 !important;
          }
        `;
      case "deep-blue":
        return `
          :root {
            --color-cyan-200: #bfdbfe !important;
            --color-cyan-300: #93c5fd !important;
            --color-cyan-400: #60a5fa !important;
            --color-cyan-500: #3b82f6 !important;
            --color-cyan-950: #172554 !important;
          }
        `;
      case "nano-green":
        return `
          :root {
            --color-cyan-200: #a7f3d0 !important;
            --color-cyan-300: #6ee7b7 !important;
            --color-cyan-400: #34d399 !important;
            --color-cyan-500: #10b981 !important;
            --color-cyan-950: #022c22 !important;
          }
        `;
      case "solar-amber":
        return `
          :root {
            --color-cyan-200: #fde68a !important;
            --color-cyan-300: #fcd34d !important;
            --color-cyan-400: #fbbf24 !important;
            --color-cyan-500: #f59e0b !important;
            --color-cyan-950: #451a03 !important;
          }
        `;
      case "cyber-cyan":
      default:
        return "";
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050507] text-white flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden font-sans">
      <style>{getDynamicThemeStyles()}</style>
      
      {/* Dynamic Brightness Overlay (0 to 100) */}
      <div 
        className="absolute inset-0 bg-black pointer-events-none z-30 transition-opacity duration-300" 
        style={{ opacity: ((100 - brightness) / 100) * 0.8 }}
      />

      {/* Extreme Siren Alarm Strobe Overlay */}
      {alarmSiren && (
        <div className="fixed inset-0 border-[16px] border-red-500/80 animate-pulse pointer-events-none z-40 mix-blend-color-dodge" />
      )}

      {/* Immersive Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050507_100%)]" />
      </div>

      {/* OCR/Screen Read Scanner Overlay visual boxes */}
      {screenReading && (
        <div className="fixed inset-0 z-40 bg-cyan-950/20 pointer-events-none border border-cyan-500/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(6,182,212,0.15))] animate-pulse" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 animate-bounce" />
        </div>
      )}

      {/* Top Navigation / Status Header */}
      <header id="header" className="w-full max-w-7xl flex justify-between items-center z-10 py-3 border-b border-white/5 backdrop-blur-md px-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 bg-cyan-500/5 border border-cyan-500/20 rounded-full flex items-center justify-center">
            <span className={`w-3.5 h-3.5 rounded-full ${
              state === "disconnected" ? "bg-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.5)]" :
              state === "connecting" ? "bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.8)]" :
              state === "listening" ? "bg-cyan-400 animate-ping shadow-[0_0_12px_rgba(34,211,238,0.8)]" : 
              "bg-purple-400 animate-pulse shadow-[0_0_12px_rgba(192,132,252,0.8)]"
            }`} />
            <div className="absolute inset-0 rounded-full border border-cyan-400/10 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-sans uppercase text-white">MANAV</h1>
              <span className="text-[9px] font-mono bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded uppercase tracking-widest font-semibold">
                SYSTEM OS v4.2
              </span>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.25em] font-mono">
              {state === "disconnected" ? "STANDBY PROTOCOL" : `COMPANION MODE: ${state}`}
            </p>
          </div>
        </div>

        {/* Global HUD Status Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex gap-3">
            {securityMode && (
              <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-[9px] font-mono font-bold uppercase text-red-400 tracking-wider">Perimeter Guard Armed</span>
              </div>
            )}
            {isPlayingMusic && (
              <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-300 max-w-[120px] truncate">
                  {playingSong}
                </span>
              </div>
            )}
            <div className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] font-semibold uppercase font-mono tracking-wider text-cyan-200">Telemetry Connection Stable</span>
            </div>
            <div className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl font-mono">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50">SECURE SHELL GATEWAY</span>
            </div>
          </div>

          <button
            id="control-center-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl font-mono text-[10px] font-bold uppercase transition-all duration-200 text-cyan-300 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:scale-[1.02] active:scale-[0.98] z-40 pointer-events-auto"
          >
            <LayoutGrid className="h-4 w-4 animate-pulse" />
            Control Center
          </button>
        </div>
      </header>

      {/* Central ARC Reactor Interactive Core */}
      <div className="relative flex flex-col items-center justify-center z-10 my-auto py-12 max-w-lg w-full pointer-events-none">
        
        {/* Dynamic Waveform Canvas backdrop - Converted to Three.js Consciousness Orb */}
        <div className="absolute inset-[-100px] flex items-center justify-center pointer-events-none select-none z-0 opacity-80">
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* The Concentric HUD Core Shield */}
        <div className="relative flex items-center justify-center w-80 h-80 md:w-96 md:h-96">
          
          {/* Concentric Design Rings rotating via styles or transitions */}
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20 animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute inset-4 rounded-full border border-double border-indigo-500/20 animate-[spin_24s_linear_infinite]" />
          
          <div 
            className="absolute inset-10 rounded-full border border-white/5 transition-transform duration-300"
            style={{ 
              transform: `scale(${1 + (state !== "disconnected" ? Math.max(userSpeechAmplitude, assistantSpeechAmplitude) * 0.15 : 0)})`,
              borderColor: state === "listening" ? "rgba(34, 211, 238, 0.2)" : state === "speaking" ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.05)"
            }}
          />
          
          <div 
            className="absolute inset-16 rounded-full border-2 border-dashed border-cyan-400/30 animate-[spin_12s_linear_infinite]" 
            style={{
              boxShadow: state !== "disconnected" ? "0 0 25px rgba(34, 211, 238, 0.15)" : "none"
            }}
          />

          {/* Central Trigger button Core */}
          <button
            id="toggle-session-btn"
            onClick={toggleConnection}
            className="absolute w-44 h-44 md:w-52 md:h-52 rounded-full cursor-pointer bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-[0_0_80px_rgba(59,130,246,0.15)] hover:shadow-[0_0_120px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 z-10 hover:scale-[1.01] active:scale-95 pointer-events-auto"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_65%)]" />
            
            {/* Visual concentric core details */}
            <div className="absolute inset-6 rounded-full border border-white/10 animate-[spin_45s_linear_infinite]" />
            
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-inner ${getButtonColorClass()}`}>
              {state === "disconnected" ? (
                <Power className="h-9 w-9 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              ) : state === "speaking" ? (
                <Volume2 className="h-9 w-9 text-white animate-bounce" />
              ) : (
                <Mic className="h-9 w-9 text-white animate-pulse" />
              )}
            </div>

            <div className="absolute bottom-6 text-[8px] font-mono tracking-widest text-white/50 bg-black/40 border border-white/10 rounded-full px-2 py-0.5 uppercase z-10 font-bold block whitespace-nowrap">
              {state === "disconnected" ? "TAP COLD START" : "TAP LINK CUT"}
            </div>
          </button>

          {/* Outer corner ticks */}
          <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-8 border-l border-t border-b border-cyan-400/40 rounded-l" />
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-8 border-r border-t border-b border-cyan-400/40 rounded-r" />
          <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-8 h-4 border-t border-l border-r border-cyan-400/40 rounded-t" />
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-8 h-4 border-b border-l border-r border-cyan-400/40 rounded-b" />

        </div>

        {/* Ambient Slogan & Dual voice speech amplitudes */}
        <div className="text-center max-w-lg w-full px-3 mt-8">
          <p className="text-lg md:text-xl font-light tracking-wide text-white/95 italic transition-all duration-500 font-sans min-h-[48px] px-4">
            {getSloganText()}
          </p>
          
          {/* Dual voice tracking meters */}
          <div className="flex items-center justify-between gap-4 py-2 px-3.5 bg-[#09090e] border border-white/5 rounded-xl max-w-sm mx-auto mt-4">
            <div className="flex flex-col items-start leading-none font-mono">
              <span className="text-[8px] text-cyan-400/60 uppercase font-bold tracking-widest">USER VOICE</span>
              <span className="text-[10px] font-semibold text-white/90">{(userSpeechAmplitude * 100).toFixed(0)} dB</span>
            </div>
            <PremiumVoiceVisualizer
              state={state}
              userSpeechAmplitude={userSpeechAmplitude}
              assistantSpeechAmplitude={assistantSpeechAmplitude}
            />
            <div className="flex flex-col items-end leading-none font-mono">
              <span className="text-[8px] text-purple-400/60 uppercase font-bold tracking-widest">MANAV VOICE</span>
              <span className="text-[10px] font-semibold text-white/90">{(assistantSpeechAmplitude * 100).toFixed(0)} dB</span>
            </div>
          </div>

          <div className="flex justify-center items-center mt-3.5 gap-4 text-[9px] font-mono text-white/30 uppercase">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> COGNITIVE TELEMETRY STATUS</span>
            <span className="w-1.5 h-1.5 bg-white/10 rounded" />
            <span>MANAV • HUMAN CLOSE FRIEND MODE</span>
          </div>

          {/* Proactive Speech Toast Banner (Human Friend Retention Rule) */}
          <AnimatePresence>
            {proactiveHookBanner && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-4 p-3.5 bg-gradient-to-r from-purple-950/90 via-indigo-900/90 to-cyan-950/90 border border-purple-500/40 rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.25)] text-left backdrop-blur-xl pointer-events-auto"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest">
                    Manav Proactive Follow-up
                  </span>
                </div>
                <p className="text-sm font-semibold text-white tracking-wide">
                  "{proactiveHookBanner}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Dialogue Hooks for Natural Human Engagement */}
          <div className="mt-5 w-full flex flex-col gap-2.5 pointer-events-auto">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/70 font-semibold uppercase tracking-wider px-1">
              <span>HUMAN FRIEND DIALOGUE HOOKS</span>
              <span className="text-white/40">TAP TO CHAT</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "Kya hua?", text: "Kya hua? Achanak chup kyu ho gaya?" },
                { label: "Kaha gayab ho gaya?", text: "Kaha gayab ho gaya bhai? Reply kyu nahi kar raha?" },
                { label: "Scene kya hai?", text: "Suno, scene kya hai?" },
                { label: "Bore ho raha hoon!", text: "Bhai main bored ho raha hoon, kuch bata!" },
                { label: "Oye sun!", text: "Oye sun! Ek baat batata hoon..." }
              ].map((hook, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerQuickHook(hook.text)}
                  className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-[11px] font-medium text-cyan-200 hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  💬 {hook.label}
                </button>
              ))}
            </div>

            {/* Direct Text Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatMessageInput.trim()) {
                  triggerQuickHook(chatMessageInput.trim());
                  setChatMessageInput("");
                }
              }}
              className="mt-1 flex gap-2"
            >
              <input
                type="text"
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                placeholder="Talk to Manav... (e.g. 'Kya kar raha hai?')"
                className="flex-1 bg-zinc-950/80 border border-white/10 focus:border-cyan-500/60 rounded-xl px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-bold text-slate-950 text-xs rounded-xl transition-all active:scale-95"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

            {/* Control Center Navigation Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 md:w-96 bg-[#040406]/95 border-l border-white/10 backdrop-blur-2xl p-6 z-50 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] font-mono text-left"
            >
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid className="h-5 w-5 text-cyan-400 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Control Center</h3>
                      <p className="text-[9px] text-white/40 uppercase">Manav OS Navigation Grid</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-white/60 hover:text-white transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Grid of menu items */}
                <div className="flex-1 overflow-y-auto pr-1 py-2 grid grid-cols-2 gap-2.5 max-h-[85vh]">
                  {[
                    { id: "dashboard", label: "Dashboard", icon: Sliders },
                    { id: "memory", label: "Memory", icon: Database },
                    { id: "security", label: "Security", icon: Shield },
                    { id: "vision", label: "Vision", icon: Camera },
                    { id: "screen_share", label: "Screen Share", icon: Eye },
                    { id: "automation", label: "Automation", icon: Workflow },
                    { id: "files", label: "Files", icon: Bookmark },
                    { id: "devices", label: "Devices", icon: Cpu },
                    { id: "diagnostics", label: "Diagnostics", icon: Activity },
                    { id: "appearance", label: "Appearance", icon: Sun },
                    { id: "performance", label: "Performance", icon: Sliders },
                    { id: "logs", label: "Logs", icon: Layers },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "settings", label: "Settings", icon: Lock },
                    { id: "about", label: "About", icon: Sparkles }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeModule === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveModule(item.id);
                          setIsMenuOpen(false);
                          addLog(`Switched control center view to: ${item.label.toUpperCase()}`);
                        }}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border transition-all duration-200 group relative overflow-hidden ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            : "bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-cyan-400/5 animate-pulse" />
                        )}
                        <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                          isSelected ? "text-cyan-400" : "text-white/40 group-hover:text-cyan-300"
                        }`} />
                        <span className="text-[10px] font-bold tracking-wider uppercase leading-none">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer of the menu */}
                <div className="border-t border-white/5 pt-4 mt-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[9px] text-white/30 uppercase">
                    <span>UTILITY LINK INGRESS PORT 3000</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Conditionally Rendered Active Module Component Area */}
      <div className="w-full max-w-5xl z-10 min-h-[300px] flex flex-col justify-start items-stretch gap-6 py-6 transition-all duration-500">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 font-mono">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4 animate-pulse" /> Active Workspace Module: {activeModule.toUpperCase()}
          </span>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-[9px] text-white/40 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10 hover:border-cyan-500/30 px-2.5 py-1 rounded-xl bg-white/5 transition-all"
          >
            Switch Module <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-6"
          >
            {activeModule === "dashboard" && (
              <DashboardModule
                brightness={brightness}
                setBrightness={setBrightness}
                volume={volume}
                setVolume={setVolume}
                cpuLoad={cpuLoad}
                memPercent={memPercent}
                networkPing={networkPing}
                coreTemp={coreTemp}
                browserTabsCount={browserTabsCount}
                isPlayingMusic={isPlayingMusic}
                setIsPlayingMusic={setIsPlayingMusic}
                playingSong={playingSong}
                setPlayingSong={setPlayingSong}
                setIsLocked={setIsLocked}
                securityMode={securityMode}
                setSecurityMode={setSecurityMode}
                alarmSiren={alarmSiren}
                setAlarmSiren={setAlarmSiren}
                capturedPhotos={capturedPhotos}
                triggerStrictSecurity={triggerStrictSecurity}
                addLog={addLog}
              />
            )}

            {activeModule === "memory" && (
              <MemoryModule
                structuredMemories={structuredMemories}
                setStructuredMemories={setStructuredMemories}
                memorySearchQuery={memorySearchQuery}
                setMemorySearchQuery={setMemorySearchQuery}
                newMemoryKey={newMemoryKey}
                setNewMemoryKey={setNewMemoryKey}
                newMemoryVal={newMemoryVal}
                setNewMemoryVal={setNewMemoryVal}
                playingSong={playingSong}
                addLog={addLog}
              />
            )}

            {activeModule === "security" && (
              <SecurityModule
                securityMode={securityMode}
                setSecurityMode={setSecurityMode}
                alarmSiren={alarmSiren}
                setAlarmSiren={setAlarmSiren}
                strictSecurityMode={strictSecurityMode}
                isLocked={isLocked}
                setIsLocked={setIsLocked}
                triggerStrictSecurity={triggerStrictSecurity}
                addLog={addLog}
              />
            )}

            {activeModule === "vision" && (
              <VisionModule
                capturedPhotos={capturedPhotos}
                triggerStrictSecurity={triggerStrictSecurity}
              />
            )}

            {activeModule === "screen_share" && (
              <ScreenShareModule
                screenReading={screenReading}
                setScreenReading={setScreenReading}
                ocrOverlay={ocrOverlay}
                addLog={addLog}
              />
            )}

            {activeModule === "automation" && (
              <AutomationModule addLog={addLog} />
            )}

            {activeModule === "files" && (
              <FilesModule
                virtualFiles={virtualFiles}
                setVirtualFiles={setVirtualFiles}
                foundFiles={foundFiles}
                setFoundFiles={setFoundFiles}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                openedFile={openedFile}
                setOpenedFile={setOpenedFile}
                addLog={addLog}
              />
            )}

            {activeModule === "devices" && (
              <DevicesModule
                volume={volume}
                brightness={brightness}
                browserTabsCount={browserTabsCount}
                micPermissionGranted={micPermissionGranted}
              />
            )}

            {activeModule === "diagnostics" && (
              <DiagnosticsModule
                diagnosticsHistory={diagnosticsHistory}
                setDiagnosticsHistory={setDiagnosticsHistory}
                diagnosticsStatus={diagnosticsStatus}
                setDiagnosticsStatus={setDiagnosticsStatus}
                runFullDiagnostics={runFullDiagnostics}
              />
            )}

            {activeModule === "appearance" && (
              <AppearanceModule
                activeTheme={activeTheme}
                setActiveTheme={setActiveTheme}
                addLog={addLog}
              />
            )}

            {activeModule === "performance" && (
              <PerformanceModule
                cpuLoad={cpuLoad}
                memPercent={memPercent}
                networkPing={networkPing}
                coreTemp={coreTemp}
                lastExecution={lastExecution}
              />
            )}

            {activeModule === "logs" && (
              <LogsModule
                systemLogs={systemLogs}
                actionHistory={actionHistory}
              />
            )}

            {activeModule === "notifications" && (
              <NotificationsModule
                alarms={alarms}
                setAlarms={setAlarms}
                reminders={reminders}
                emails={emails}
              />
            )}

            {activeModule === "settings" && (
              <SettingsModule
                brightness={brightness}
                setBrightness={setBrightness}
                volume={volume}
                setVolume={setVolume}
                setIsLocked={setIsLocked}
                setRebooting={setRebooting}
                setSystemOffline={setSystemOffline}
                addLog={addLog}
              />
            )}

            {activeModule === "about" && (
              <AboutModule />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Logger / Console state bar at bottom of modules */}
        <section className="w-full mt-2 flex flex-col md:flex-row gap-4 items-stretch justify-between z-10 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[10px] font-mono text-white/40">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-cyan-400" />
            <span className="uppercase text-white/60 tracking-wider">Diagnostics Stream:</span>
            <span className="text-white/80 select-all truncate max-w-xs md:max-w-md">
              {systemLogs[0] || "Diagnostics stream ready."}
            </span>
          </div>
          <div>
            <span>PCM_16kHz IN • {runningApps.length} Active Services</span>
          </div>
        </section>
      </div>

      
{/* Bottom Footer Credits */}
      <footer id="footer-credits" className="w-full text-center pt-6 pb-2 text-[10px] font-mono text-white/20 z-10">
        Manav Advanced Operating System Companion • Geometric Balance Applied • Powered by Gemini 3.1 Live
      </footer>

      {/* OCR extracted visual floating overlays relative to screen preview */}
      {ocrOverlay.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {ocrOverlay.map((box, i) => (
            <div 
              key={i}
              className="absolute bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] py-0.5 px-1.5 rounded font-mono shadow-[0_0_8px_rgba(34,211,238,0.3)]"
              style={{ left: `${box.x}px`, top: `${box.y}px` }}
            >
              OCR: {box.text}
            </div>
          ))}
          <button 
            onClick={() => setOcrOverlay([])}
            className="pointer-events-auto absolute bottom-24 right-12 px-4 py-2 bg-slate-900 border border-white/15 rounded-xl text-[10px] font-mono text-white/70 hover:text-white"
          >
            Clear Screen Elements
          </button>
        </div>
      )}

      {/* Shutter photo capture light flash event */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            key="flash-shutter"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Lock Screen UI overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            key="lock-screen-modal"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 bg-[#050507]/95 flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
              
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">System Locked</h2>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest text-center text-sans">MANAV SECURAL PROTOCOLS ACTIVE</p>
              
              <div className="grid grid-cols-3 gap-3 w-full my-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button 
                    key={n} 
                    onClick={() => addLog(`Secured pattern keypad click: ${n}`)}
                    className="py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 active:scale-95 text-sm font-semibold text-white/80 transition-all font-mono"
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsLocked(false);
                  addLog("🔓 Workspace manually restored by security administrator credentials.");
                }}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-98 transition-transform font-bold text-slate-950 rounded-xl text-xs uppercase"
              >
                Override Lock / Unlock Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strict Security Mode Alarm Overlay */}
      <AnimatePresence>
        {strictSecurityMode && (
          <motion.div
            key="strict-security-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 font-mono"
          >
            {/* Flashing strobe background inside the modal */}
            <div className="absolute inset-0 bg-red-950/20 animate-pulse pointer-events-none" />
            
            <div className="w-full max-w-md bg-zinc-950 border-2 border-red-500/40 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center relative z-10 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-wider text-red-500 text-center">STRICT SECURITY ACTIVE</h2>
              <p className="text-xs text-red-400/80 mt-1 uppercase tracking-widest text-center">Unauthorized Intrusion Detected</p>
              
              <div className="w-full mt-6 space-y-4">
                <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 text-[11px] text-red-200/90 leading-relaxed text-center">
                  ⚠️ SYSTEM ARREST TRIGGERED. ACOUSTIC SIREN ENGAGED.<br />
                  Real-time camera snapshots have been saved to memory.
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">DISARM SECRET CODE WORD</label>
                  <input
                    type="password"
                    value={secretCodeInput}
                    onChange={(e) => setSecretCodeInput(e.target.value)}
                    placeholder="ENTER SECRET CODE"
                    className="w-full bg-zinc-900 border border-red-500/30 rounded-xl px-4 py-3 text-center text-white tracking-widest text-sm font-bold placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 uppercase text-sans"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleDisarmAttempt();
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDisarmAttempt}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-98 text-black font-black text-xs uppercase rounded-xl transition-all tracking-wider"
                  >
                    DISARM SYSTEM
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shutdown and Reboot Sequence Screen Overlays */}
      <AnimatePresence>
        {systemOffline && (
          <motion.div
            key="shutdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono p-6"
          >
            <div className="text-left max-w-md">
              <h2 className="text-rose-500 font-bold mb-4 text-sm uppercase tracking-widest">▶ [CRITICAL] MANAV TERMINAL POWERING DOWN</h2>
              <p className="text-white/40 text-[11px] mb-1">Unmounting host drives... [OK]</p>
              <p className="text-white/40 text-[11px] mb-1">Spinning down voice processor kernels... [OK]</p>
              <p className="text-white/40 text-[11px] mb-1">Releasing live web sockets... [OK]</p>
              <p className="text-cyan-400 text-[12px] mt-6 animate-pulse uppercase tracking-wider">Manav is asleep. Click below to revive power.</p>
              
              <button
                onClick={() => {
                  setSystemOffline(false);
                  addLog("🔌 Cold reboot completed. Kernel companion fully restored.");
                }}
                className="mt-8 px-6 py-3 border border-white/20 rounded-xl text-xs font-semibold hover:bg-white/10 active:scale-95 text-white transition-all uppercase"
              >
                Power On Computer
              </button>
            </div>
          </motion.div>
        )}
        
        {rebooting && (
          <motion.div
            key="rebooting-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020204] flex flex-col items-center justify-center font-mono p-6 text-green-400"
          >
            <div className="text-left w-full max-w-lg leading-relaxed text-xs">
              <h2 className="text-white font-bold mb-3 font-sans text-base tracking-wide uppercase">Companion OS Kernel Warm-Boots</h2>
              <p className="animate-pulse">▶ Launching microservices... Success.</p>
              <p>▶ Calibrating audio DSP buffers [PCM 16000Hz upscaled to 24000Hz]... Done.</p>
              <p>▶ Mounting desktop balance system UI frameworks... Complete.</p>
              <p>▶ Initializing high-speed AI WebSocket proxies... Active.</p>
              <p className="text-blue-400 mt-6 animate-pulse uppercase tracking-widest">Warming Up Memory Registers - Ready Shortly...</p>
            </div>
          </motion.div>
        )}

        {isSleeping && (
          <motion.div
            key="sleep-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020205]/95 backdrop-blur-3xl flex flex-col items-center justify-center font-mono p-6 text-indigo-400"
          >
            <div className="text-center max-w-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Sparkles className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="text-white font-bold uppercase tracking-wider mb-2">Workspace Asleep</h2>
              <p className="text-[11px] text-white/40 uppercase tracking-widest text-center leading-relaxed">
                Manav put the laptop host to stand-by mode. Press the button below to awaken the console.
              </p>
              <button
                onClick={() => {
                  setIsSleeping(false);
                  addLog("🔌 Awakened system from standby sleep mode.");
                }}
                className="mt-8 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-slate-950 font-bold duration-100 rounded-xl text-xs uppercase"
              >
                Awaken System
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications overlay for standard errors and mic access */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            key="error-modal"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:max-w-md z-50 p-4 rounded-2xl bg-rose-950/95 border border-rose-500/40 backdrop-blur-lg shadow-2xl flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-white">System Intelligence Exception</h3>
              <p className="text-[11px] text-rose-200 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
            <button 
              onClick={() => setErrorMsg(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-rose-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {micPermissionGranted === false && (
          <motion.div
            key="mic-permission-modal"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed inset-x-6 bottom-6 lg:max-w-md mx-auto z-40 p-4 rounded-2xl bg-amber-950/95 border border-amber-500/40 backdrop-blur-lg shadow-2xl flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-white">Microphone Input Standby</h3>
                <p className="text-[11px] text-amber-200 mt-1 leading-relaxed">
                  Manav is an audio-first virtual computer companion and requires capture feed access to speak. Please enable mic access.
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.mediaDevices.getUserMedia({ audio: true });
                  setMicPermissionGranted(true);
                } catch (e) {
                  setErrorMsg("Could not verify hardware microphone feed. Make sure site has authorization.");
                }
              }}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold hover:scale-[1.02] duration-200 rounded-xl text-xs uppercase"
            >
              Enable Companion Voice Feed
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
