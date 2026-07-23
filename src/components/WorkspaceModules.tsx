import React from "react";
import { 
  Sliders, Sun, Volume2, Cpu, Database, Wifi, Thermometer, Battery, 
  Play, Pause, Lock, Shield, Eye, Camera, RefreshCw, Search, Trash2, 
  Plus, Bookmark, X, Layers, Compass, ChevronRight, Bell, Mail, Sparkles, Power,
  Workflow, Activity
} from "lucide-react";
import { UIAutomationPanel } from "./UIAutomationPanel";
import { ScreenCaptureManager, VisionManager } from "../lib/managers";

// 1. Dashboard Module
export const DashboardModule: React.FC<{
  brightness: number;
  setBrightness: (b: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  cpuLoad: number;
  memPercent: number;
  networkPing: number;
  coreTemp: number;
  browserTabsCount: number;
  isPlayingMusic: boolean;
  setIsPlayingMusic: (m: boolean) => void;
  playingSong: string;
  setPlayingSong: (s: string) => void;
  setIsLocked: (l: boolean) => void;
  securityMode: boolean;
  setSecurityMode: (s: boolean) => void;
  alarmSiren: boolean;
  setAlarmSiren: (s: boolean) => void;
  capturedPhotos: string[];
  triggerStrictSecurity: () => void;
  addLog: (m: string) => void;
}> = ({
  brightness, setBrightness, volume, setVolume, cpuLoad, memPercent, networkPing, coreTemp, browserTabsCount,
  isPlayingMusic, setIsPlayingMusic, playingSong, setPlayingSong, setIsLocked, securityMode, setSecurityMode,
  alarmSiren, setAlarmSiren, capturedPhotos, triggerStrictSecurity, addLog
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full text-left">
      {/* Cell 1: Hardware Console & Core Sliders */}
      <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold tracking-wider text-white/60 uppercase flex items-center gap-1.5 font-mono">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" /> Hardware Sliders
            </span>
            <span className="text-[10px] font-mono text-cyan-400">ACTIVE CONTROLS</span>
          </div>

          {/* Brightness Controls */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/70 mb-1.5 font-mono">
              <span className="flex items-center gap-1"><Sun className="h-3.5 w-3.5 text-amber-400" /> Brightness</span>
              <span>{brightness}%</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="100" 
              value={brightness} 
              onChange={(e) => {
                const l = Number(e.target.value);
                setBrightness(l);
                addLog(`Brightness changed manually to ${l}%`);
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
          </div>

          {/* Volume Controls */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-white/70 mb-1.5 font-mono">
              <span className="flex items-center gap-1"><Volume2 className="h-3.5 w-3.5 text-cyan-400" /> Master Volume</span>
              <span>{volume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume} 
              onChange={(e) => {
                const l = Number(e.target.value);
                setVolume(l);
                addLog(`Volume level adjusted manually to ${l}%`);
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
            />
          </div>

          {/* Holistic Telemetry Suite */}
          <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-[9px]">
            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none font-sans">CPU</span>
                  <span className="text-white/95 font-bold text-[10.5px] mt-0.5 block">{cpuLoad}%</span>
                </div>
              </div>
              <div className="w-10 bg-white/5 h-1 rounded-full overflow-hidden shrink-0">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${cpuLoad}%` }} />
              </div>
            </div>

            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Database className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none font-sans">RAM</span>
                  <span className="text-white/95 font-bold text-[10.5px] mt-0.5 block">{memPercent}%</span>
                </div>
              </div>
              <div className="w-10 bg-white/5 h-1 rounded-full overflow-hidden shrink-0">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${memPercent}%` }} />
              </div>
            </div>

            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Wifi className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-pulse" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none font-sans">PING</span>
                  <span className="text-white/95 font-bold text-[10.5px] mt-0.5 block">{networkPing} ms</span>
                </div>
              </div>
              <span className="text-emerald-400/80 font-bold text-[7.5px] leading-none shrink-0 border border-emerald-500/20 px-1 py-0.5 bg-emerald-950/20 rounded">LIVE</span>
            </div>

            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Thermometer className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none font-sans">TEMP</span>
                  <span className="text-white/95 font-bold text-[10.5px] mt-0.5 block">{coreTemp}°C</span>
                </div>
              </div>
              <span className="text-amber-400/80 font-bold text-[7.5px] leading-none shrink-0 border border-amber-500/20 px-1 py-0.5 bg-amber-950/20 rounded">SAFE</span>
            </div>

            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2 flex items-center justify-between gap-1.5 col-span-2">
              <div className="flex items-center gap-2 min-w-0">
                <Battery className="h-3.5 w-3.5 text-cyan-400 shrink-0 animate-pulse" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none font-sans">ENERGY COUPLER LINK {browserTabsCount} WEB TABS</span>
                  <span className="text-white/90 text-[10px] font-semibold mt-0.5 block">94.8% Capacity (Simulated Main Reactor Stack)</span>
                </div>
              </div>
              <span className="text-cyan-400/95 font-bold text-[8px] leading-none shrink-0 border border-cyan-500/30 px-1.5 py-0.5 bg-cyan-950/20 rounded">DISCHG</span>
            </div>
          </div>
        </div>

        {/* Ambient Synth Controller */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setIsPlayingMusic(!isPlayingMusic);
                if(!isPlayingMusic) {
                  setPlayingSong("Space Chill Beats");
                }
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPlayingMusic ? 'bg-indigo-600 text-white' : 'bg-white/5 hover:bg-white/10 text-white/80'}`}
            >
              {isPlayingMusic ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <div className="text-left leading-none">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-0.5 font-mono">Companion Music</p>
              <p className="text-xs font-semibold">{isPlayingMusic ? playingSong : "No Track Loaded"}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsLocked(true);
              addLog("🔒 Screen locked manually via toggle.");
            }}
            className="p-2 bg-white/5 border border-white/15 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-mono flex items-center gap-1"
          >
            <Lock className="h-3 w-3" /> Secure Lock
          </button>
        </div>
      </div>

      {/* CCTV Intelligence & Radars */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden text-left col-span-1">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5 font-mono">
            <Shield className="h-3.5 w-3.5 text-rose-400" /> Perimeter Intel
          </span>
          <span className={`w-2 h-2 rounded-full ${securityMode ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
        </div>

        <div className="relative h-24 my-1 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full border border-rose-500/20 flex items-center justify-center">
            <div className={`absolute w-14 h-14 rounded-full border border-rose-500/10 ${securityMode ? "animate-ping duration-1000" : ""}`} />
            <Eye className={`h-6 w-6 transition-colors duration-500 ${securityMode ? "text-rose-400 animate-pulse" : "text-white/25"}`} />
          </div>
          {securityMode && (
            <div className="absolute inset-0 bg-rose-500/5 rounded-full animate-pulse" />
          )}
        </div>

        <div className="mt-3 font-mono">
          <div className="flex justify-between items-center gap-2">
            <button 
              onClick={() => {
                const next = !securityMode;
                setSecurityMode(next);
                addLog(`Surveillance Perimeter: ${next ? "ARMED" : "STANDBY"}`);
              }}
              className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all ${securityMode ? 'bg-rose-600 hover:bg-rose-500' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
            >
              {securityMode ? "Disarm Guard" : "Arm Security"}
            </button>
            <button 
              onClick={() => {
                const next = !alarmSiren;
                setAlarmSiren(next);
                addLog(`Emergency siren: ${next ? "SOUNDING" : "STANDBY"}`);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold ${alarmSiren ? 'bg-red-500 text-slate-950 animate-bounce' : 'bg-white/5 text-white/50 border border-white/5'}`}
            >
              Siren
            </button>
          </div>
        </div>
      </div>

      {/* Space Camera */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between text-left col-span-1">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 font-mono">
            <Camera className="h-3.5 w-3.5 text-cyan-400" /> Space Camera
          </span>
          <span className="text-[9px] font-mono text-white/30">{capturedPhotos.length} SNAPS</span>
        </div>

        <div className="relative h-28 bg-[#09090d] border border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center">
          {capturedPhotos.length > 0 ? (
            <img 
              src={capturedPhotos[0]} 
              alt="Companion Snap Capture Feed" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-center p-3 font-mono">
              <Camera className="h-6 w-6 text-white/20 mx-auto mb-1 animate-pulse" />
              <p className="text-[10px] text-white/40 leading-tight">No frames captured. Ask Manav to "capture a photo".</p>
            </div>
          )}
        </div>

        <button 
          onClick={triggerStrictSecurity}
          className="mt-3 w-full py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 font-mono"
        >
          <RefreshCw className="h-3 w-3" /> Trigger Shutter Snap
        </button>
      </div>
    </div>
  );
};

// 2. Memory Module
export const MemoryModule: React.FC<{
  structuredMemories: Record<string, string>;
  setStructuredMemories: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  memorySearchQuery: string;
  setMemorySearchQuery: (q: string) => void;
  newMemoryKey: string;
  setNewMemoryKey: (k: string) => void;
  newMemoryVal: string;
  setNewMemoryVal: (v: string) => void;
  playingSong: string;
  addLog: (m: string) => void;
}> = ({
  structuredMemories, setStructuredMemories, memorySearchQuery, setMemorySearchQuery,
  newMemoryKey, setNewMemoryKey, newMemoryVal, setNewMemoryVal, playingSong, addLog
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full text-left font-mono">
      {/* Cell 9: Holographic Memory Database */}
      <div className="md:col-span-8 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5 font-mono">
              <Database className="h-4 w-4 text-indigo-400 animate-pulse" /> Holographic Memory Database
            </span>
            <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-widest">
              {Object.keys(structuredMemories).length} Structured Facts
            </span>
          </div>

          <p className="text-[9.5px] leading-relaxed text-white/40 mb-3 font-mono">
            Real-time deterministic lookup database. Facts stored here bypass model probability to guarantee absolute truth.
          </p>

          {/* Memory Search Bar */}
          <div className="bg-[#0b0b10] border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2 mb-3">
            <Search className="h-3.5 w-3.5 text-white/30" />
            <input 
              type="text" 
              placeholder="Query key-value database..."
              value={memorySearchQuery}
              onChange={(e) => setMemorySearchQuery(e.target.value)}
              className="bg-transparent border-none text-[10px] font-mono text-white/85 w-full focus:outline-none focus:ring-0"
            />
          </div>

          {/* Key-Value List */}
          <div className="h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-[9.5px] mb-3">
            {(Object.entries(structuredMemories) as [string, string][])
              .filter(([k, v]) => k.toLowerCase().includes(memorySearchQuery.toLowerCase()) || v.toLowerCase().includes(memorySearchQuery.toLowerCase()))
              .map(([k, v]) => (
                <div key={k} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2 rounded-xl group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-150">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-indigo-400 font-bold font-mono tracking-wider">[{k}]</span>
                    <p className="text-white/80 font-medium truncate mt-0.5">{v}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setStructuredMemories(prev => {
                        const next = { ...prev };
                        delete next[k];
                        localStorage.setItem("structured_memories", JSON.stringify(next));
                        return next;
                      });
                      addLog(`💾 Manually deleted memory key: "${k}"`);
                    }}
                    className="p-1 hover:bg-rose-500/20 rounded-lg text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Forget Memory"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            {Object.keys(structuredMemories).length === 0 && (
              <p className="text-white/30 text-[9px] text-center p-4 italic">No structured memories found. Tell Manav to remember something!</p>
            )}
          </div>
        </div>

        {/* Add Memory Form */}
        <div className="border-t border-white/5 pt-3">
          <p className="text-[8px] font-mono font-bold text-white/30 uppercase tracking-wider mb-2">Create Fact Key-Value Override</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input 
              type="text" 
              placeholder="key (e.g. favorite_food)"
              value={newMemoryKey}
              onChange={(e) => setNewMemoryKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              className="bg-[#0a0a0f] border border-white/10 rounded-xl px-2.5 py-1 text-[10px] font-mono text-white/80 focus:outline-none focus:border-indigo-500"
            />
            <input 
              type="text" 
              placeholder="value (e.g. Pizza)"
              value={newMemoryVal}
              onChange={(e) => setNewMemoryVal(e.target.value)}
              className="bg-[#0a0a0f] border border-white/10 rounded-xl px-2.5 py-1 text-[10px] font-mono text-white/80 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button 
            onClick={() => {
              const key = newMemoryKey.trim();
              const val = newMemoryVal.trim();
              if (key && val) {
                setStructuredMemories(prev => {
                  const next = { ...prev, [key]: val };
                  localStorage.setItem("structured_memories", JSON.stringify(next));
                  return next;
                });
                addLog(`💾 Manually saved fact: [${key}] = "${val}"`);
                setNewMemoryKey("");
                setNewMemoryVal("");
              }
            }}
            className="w-full py-1.5 bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1"
          >
            <Plus className="h-3 w-3" /> Commit Fact To Database
          </button>
        </div>
      </div>

      {/* CogMemory Buffer */}
      <div className="md:col-span-4 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between text-left">
        <div className="font-mono text-[9px] leading-tight w-full h-full flex flex-col justify-between">
          <div>
            <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-widest mb-3 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" /> CogMemory Buffer
            </span>
            <div className="bg-[#09090d]/80 border border-white/5 rounded-xl p-3 space-y-2 text-[10px]">
              <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                <span className="text-white/40">Creator & Owner:</span>
                <span className="text-white/90 font-bold">Om Ujwal Jumle</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                <span className="text-white/40">AI Engine:</span>
                <span className="text-amber-400 font-bold">Manav OS (Gemini)</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                <span className="text-white/40">Memory sync:</span>
                <span className="text-cyan-400 font-bold">Persistent Memory</span>
              </div>
              <div className="flex justify-between leading-none pt-0.5">
                <span className="text-white/40 shrink-0">Fav music q:</span>
                <span className="text-white/80 font-bold truncate max-w-[140px]">{playingSong || "lofi music"}</span>
              </div>
            </div>
          </div>

          <p className="text-[9.5px] text-white/30 leading-relaxed mt-4 font-mono">
            Persistent memories synced directly with cloud storage. Clear your cache or rebind variables anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

// 3. Security Module
export const SecurityModule: React.FC<{
  securityMode: boolean;
  setSecurityMode: (s: boolean) => void;
  alarmSiren: boolean;
  setAlarmSiren: (s: boolean) => void;
  strictSecurityMode: boolean;
  isLocked: boolean;
  setIsLocked: (l: boolean) => void;
  triggerStrictSecurity: () => void;
  addLog: (m: string) => void;
}> = ({
  securityMode, setSecurityMode, alarmSiren, setAlarmSiren, strictSecurityMode,
  isLocked, setIsLocked, triggerStrictSecurity, addLog
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left font-mono max-w-4xl mx-auto">
      {/* CCTV Intelligence & Radars */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5 font-mono">
            <Shield className="h-3.5 w-3.5 text-rose-400" /> Perimeter Intel
          </span>
          <span className={`w-2 h-2 rounded-full ${securityMode ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
        </div>

        {/* Circular Radar Visual Mesh */}
        <div className="relative h-44 my-4 flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full border border-rose-500/20 flex items-center justify-center">
            <div className={`absolute w-24 h-24 rounded-full border border-rose-500/10 ${securityMode ? "animate-ping duration-1000" : ""}`} />
            <Eye className={`h-8 w-8 transition-colors duration-500 ${securityMode ? "text-rose-400 animate-pulse" : "text-white/25"}`} />
          </div>
          {securityMode && (
            <div className="absolute inset-0 bg-rose-500/5 rounded-full animate-pulse" />
          )}
        </div>

        <div className="mt-3 font-mono">
          <div className="flex justify-between items-center gap-2">
            <button 
              onClick={() => {
                const next = !securityMode;
                setSecurityMode(next);
                addLog(`Surveillance Perimeter: ${next ? "ARMED" : "STANDBY"}`);
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase transition-all ${securityMode ? 'bg-rose-600 hover:bg-rose-500' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
            >
              {securityMode ? "Disarm Guard" : "Arm Security"}
            </button>
            <button 
              onClick={() => {
                const next = !alarmSiren;
                setAlarmSiren(next);
                addLog(`Emergency siren: ${next ? "SOUNDING" : "STANDBY"}`);
              }}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold ${alarmSiren ? 'bg-red-500 text-slate-950 animate-bounce' : 'bg-white/5 text-white/50 border border-white/5'}`}
            >
              Siren
            </button>
          </div>
        </div>
      </div>

      {/* Security Logs / Summary */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5 mb-3 font-mono">
            <Shield className="h-3.5 w-3.5 text-rose-400" /> Security Status Report
          </span>
          <p className="text-[10px] text-white/50 mb-4 leading-relaxed">
            Manav features active motion, camera shutter triggers, and intrusion lockout sirens.
          </p>

          <div className="space-y-2 text-[10px] bg-black/40 border border-white/5 p-3 rounded-xl font-mono">
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Armed Level:</span>
              <span className="text-rose-400 font-bold">{securityMode ? "LEVEL 1 FORCE" : "STANDBY MONITOR"}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Siren Status:</span>
              <span className={alarmSiren ? "text-red-400 font-bold animate-pulse" : "text-white/80"}>
                {alarmSiren ? "ACTIVATED SOUNDS" : "STILL SHUT"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-white/40">Strict Lockout Mode:</span>
              <span className="text-white/80">{strictSecurityMode ? "TRIGGERED LOCKOUT" : "NORMAL SHELL"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Keypad Lock:</span>
              <span className="text-white/80">{isLocked ? "LOCKED" : "UNLOCKED"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4 font-mono">
          <button 
            onClick={() => {
              setIsLocked(true);
              addLog("🔒 Screen locked manually via security console.");
            }}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-[10px] font-bold uppercase"
          >
            Lock Screen Interface
          </button>
          <button 
            onClick={triggerStrictSecurity}
            className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase"
          >
            Trigger Intruder Alarm
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Vision Module
export const VisionModule: React.FC<{
  capturedPhotos: string[];
  triggerStrictSecurity: () => void;
}> = ({ capturedPhotos, triggerStrictSecurity }) => {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md max-w-2xl w-full mx-auto text-left font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <Camera className="h-4 w-4 text-cyan-400" /> Space Camera Shutter Shading
        </span>
        <span className="text-[9px] text-white/30">{capturedPhotos.length} SNAPS SAVED</span>
      </div>

      <p className="text-[10.5px] text-white/50 mb-5 leading-relaxed">
        Real-time snaps captured through standard user device hardware interfaces. Intrusions will automatically trigger instant capture snapshots.
      </p>

      <div className="relative h-64 bg-[#09090d] border border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center mb-4">
        {capturedPhotos.length > 0 ? (
          <img 
            src={capturedPhotos[0]} 
            alt="Companion Snap Capture Feed" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-center p-6">
            <Camera className="h-10 w-10 text-white/20 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-white/40 leading-normal max-w-xs">No frames captured. Ask Manav to "capture a photo" or click the shutter button below.</p>
          </div>
        )}
      </div>

      <button 
        onClick={triggerStrictSecurity}
        className="w-full py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="h-4 w-4 animate-spin" /> Trigger Real Hardware Capture Shutter
      </button>
    </div>
  );
};

// 5. Screen Share Module
export const ScreenShareModule: React.FC<{
  screenReading: boolean;
  setScreenReading: (s: boolean) => void;
  ocrOverlay: Array<{ text: string, x: number, y: number }>;
  addLog: (m: string) => void;
}> = ({ screenReading, setScreenReading, ocrOverlay, addLog }) => {
  const [stream, setStream] = React.useState<MediaStream | null>(ScreenCaptureManager.getActiveStream());
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const handleStreamChange = (newStream: MediaStream | null) => {
      setStream(newStream);
    };
    ScreenCaptureManager.addListener(handleStreamChange);
    return () => {
      ScreenCaptureManager.removeListener(handleStreamChange);
    };
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStartCapture = async () => {
    addLog("👁️ ScreenCaptureManager: Requesting screen capture permissions manually...");
    try {
      const newStream = await ScreenCaptureManager.requestScreenCapture(addLog);
      setStream(newStream);
      if (newStream) {
        setScreenReading(true);
        addLog("👁️ VisionManager: Capturing active viewport frame...");
        const result = await VisionManager.analyzeFrame(newStream);
        setScreenReading(false);
        if (result && result.textDetected) {
          addLog(`👁️ VisionManager OCR Result: ${result.textDetected.slice(0, 100)}...`);
        }
      } else {
        setScreenReading(false);
      }
    } catch (err: any) {
      setScreenReading(false);
      addLog(`⚠️ Screen Capture Manual Request Denied or Error: ${err?.message || err}`);
    }
  };

  const handleStopCapture = () => {
    ScreenCaptureManager.stopScreenCapture();
    setStream(null);
    setScreenReading(false);
    addLog("👁️ Screen Capture: Screen sharing stream stopped manually.");
  };

  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md max-w-2xl w-full mx-auto text-left font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-cyan-400" /> Screen Capture & Stream Analysis
        </span>
        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${stream ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse' : 'bg-white/5 text-white/30 border border-white/5'}`}>
          {stream ? "STREAMING LIVE" : "STREAM STANDBY"}
        </span>
      </div>

      <p className="text-[10.5px] leading-relaxed text-white/60 mb-4">
        Manav utilizes real-time screen scraping and pixel analytics. Ask Manav to "read my screen" or "analyze my viewport" to initiate deep scanning.
      </p>

      {/* Screen Sharing Live Video Preview */}
      <div className="relative h-64 bg-[#09090d] border border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center mb-4 shadow-inner">
        {stream ? (
          <div className="relative w-full h-full">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-contain bg-black"
            />
            <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none" />
            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm border border-cyan-500/30 px-2 py-1 rounded text-[8px] text-cyan-400 font-bold uppercase flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              Live Stream Capture
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <Eye className="h-10 w-10 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/40 leading-normal max-w-xs">No active screen stream. Click the button below to start screen sharing stream preview.</p>
          </div>
        )}
      </div>

      <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] space-y-2 mb-4">
        <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
          <span className="text-white/40">Active Stream Interface:</span>
          <span className="text-white/80">{stream ? "Active Browser Stream" : "No Active Stream"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">OCR Scanner Matrix:</span>
          <span className="text-cyan-400 font-bold">{ocrOverlay.length} Items Detected</span>
        </div>
      </div>

      <div className="flex gap-3">
        {!stream ? (
          <button 
            onClick={handleStartCapture}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase duration-150 flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <Eye className="h-4 w-4" /> Start Screen Share
          </button>
        ) : (
          <>
            <button 
              onClick={async () => {
                setScreenReading(true);
                addLog("👁️ VisionManager: Capturing active viewport frame...");
                try {
                  const result = await VisionManager.analyzeFrame(stream);
                  setScreenReading(false);
                  if (result && result.textDetected) {
                    addLog(`👁️ VisionManager OCR Result: ${result.textDetected.slice(0, 100)}...`);
                  }
                } catch (e) {
                  setScreenReading(false);
                  addLog("⚠️ Screen capture frame analysis failed.");
                }
              }}
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase duration-150 flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <RefreshCw className="h-4 w-4" /> Trigger Viewport Capture
            </button>
            <button 
              onClick={handleStopCapture}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs uppercase duration-150 flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              Stop Sharing
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// 6. Automation Module
export const AutomationModule: React.FC<{
  addLog: (m: string) => void;
}> = ({ addLog }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <UIAutomationPanel addLogToMain={addLog} />
    </div>
  );
};

// 7. Files Module
export const FilesModule: React.FC<{
  virtualFiles: Array<{ name: string; path: string; size: string; type: string }>;
  setVirtualFiles: React.Dispatch<React.SetStateAction<Array<{ name: string; path: string; size: string; type: string }>>>;
  foundFiles: Array<{ name: string; path: string; size: string; type: string }>;
  setFoundFiles: (f: Array<{ name: string; path: string; size: string; type: string }>) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  openedFile: { name: string; path: string; size: string; type: string } | null;
  setOpenedFile: (f: { name: string; path: string; size: string; type: string } | null) => void;
  addLog: (m: string) => void;
}> = ({
  virtualFiles, setVirtualFiles, foundFiles, setFoundFiles, searchTerm, setSearchTerm,
  openedFile, setOpenedFile, addLog
}) => {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md max-w-4xl w-full mx-auto text-left font-mono">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <Bookmark className="h-3.5 w-3.5 text-cyan-400" /> Virtual File System Indexed ({virtualFiles.length})
        </span>
        <span className="text-[9px] font-mono text-white/30">FILES & DIRECTORIES</span>
      </div>

      {openedFile ? (
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3 relative mb-3 font-mono text-[9px] leading-relaxed">
          <div className="flex justify-between items-center mb-1 border-b border-cyan-500/10 pb-1">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">OPENED FILE PREVIEW</span>
            <button onClick={() => setOpenedFile(null)} className="p-0.5 hover:bg-white/10 rounded">
              <X className="h-3.5 w-3.5 text-white/60 hover:text-white" />
            </button>
          </div>
          <p className="text-white font-semibold">NAME: {openedFile.name}</p>
          <p className="text-white/40 text-[8px]">PATH: {openedFile.path} ({openedFile.size || "0 KB"})</p>
          <div className="mt-1.5 text-cyan-200/50 text-[8px]">
            [CAT STREAM READING LOG] : File descriptor decrypted. Interactive companion environment reading active...
          </div>
        </div>
      ) : null}

      <div className="bg-[#0b0b10] border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
        <Search className="h-3.5 w-3.5 text-white/30" />
        <input 
          type="text" 
          placeholder="Search local workspace..."
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            setFoundFiles(virtualFiles.filter(f => f.name.toLowerCase().includes(val.toLowerCase()) || f.path.toLowerCase().includes(val.toLowerCase())));
          }}
          className="bg-transparent border-none text-[10px] font-mono text-white/80 w-full focus:outline-none focus:ring-0"
        />
      </div>

      <div className="h-56 overflow-y-auto space-y-1.5 pr-1 font-mono text-[9.5px] text-white/80">
        {(searchTerm ? foundFiles : virtualFiles).map((file, idx) => (
          <div key={`${file.path}-${idx}`} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2 rounded-xl leading-none hover:bg-white/[0.04]">
            <div className="flex items-center gap-2 truncate max-w-[75%]">
              <span className="text-cyan-400 font-bold">[{file.type.toUpperCase()}]</span>
              <span 
                onClick={() => {
                  setOpenedFile(file);
                  addLog(`Opened file through click: "${file.name}"`);
                }}
                className="text-white/85 hover:text-white truncate cursor-pointer hover:underline font-bold"
              >
                {file.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-[8.5px]">{file.size}</span>
              <button 
                onClick={() => {
                  setVirtualFiles(prev => prev.filter((_, fIdx) => fIdx !== idx));
                  addLog(`Manually removed ${file.name}`);
                }}
                className="p-1 hover:bg-rose-500/20 rounded text-white/30 hover:text-rose-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        {virtualFiles.length === 0 && (
          <p className="text-white/30 text-[9px] text-center p-4">No workspace files match or directory is empty.</p>
        )}
      </div>
    </div>
  );
};

// 8. Devices Module
export const DevicesModule: React.FC<{
  volume: number;
  brightness: number;
  browserTabsCount: number;
  micPermissionGranted: boolean;
}> = ({ volume, brightness, browserTabsCount, micPermissionGranted }) => {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md max-w-2xl w-full mx-auto text-left font-mono text-[10.5px]">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
          <Cpu className="h-4 w-4 text-indigo-400 animate-pulse" /> Linked Device Controller
        </span>
        <span className="text-[9px] text-cyan-400">HARDWARE INTERFACE</span>
      </div>

      <p className="text-[10.5px] text-white/50 mb-4 leading-relaxed">
        Monitor system peripheral state indices, browser sessions, audio streams, and virtual battery link capacities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
        <div className="bg-black/30 border border-white/5 rounded-xl p-3">
          <span className="text-[8.5px] uppercase font-bold text-white/40 block mb-1">Microphone Input Stream</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${micPermissionGranted ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-white/80 font-bold">{micPermissionGranted ? "Authorized / Active Stream" : "Awaiting Authorization"}</span>
          </div>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-xl p-3">
          <span className="text-[8.5px] uppercase font-bold text-white/40 block mb-1">Master Volume Index</span>
          <p className="text-white/80 font-bold mt-1">{volume}% (Frequency Balanced)</p>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-xl p-3">
          <span className="text-[8.5px] uppercase font-bold text-white/40 block mb-1">Display Brightness</span>
          <p className="text-white/80 font-bold mt-1">{brightness}% (Hardware Backlight Link)</p>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-xl p-3">
          <span className="text-[8.5px] uppercase font-bold text-white/40 block mb-1">Host Browser Tabs Link</span>
          <p className="text-white/80 font-bold mt-1">{browserTabsCount} Active Sandboxed Tabs</p>
        </div>
      </div>

      <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <Battery className="h-3.5 w-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <div className="truncate">
            <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none">ENERGY COUPLER REACTOR</span>
            <span className="text-white/90 text-[10px] font-semibold mt-0.5 block">94.8% Capacity (Simulated Main Reactor Stack)</span>
          </div>
        </div>
        <span className="text-cyan-400/95 font-bold text-[8px] leading-none shrink-0 border border-cyan-500/30 px-1.5 py-0.5 bg-cyan-950/20 rounded">DISCHG</span>
      </div>
    </div>
  );
};

// 9. Diagnostics Module
export const DiagnosticsModule: React.FC<{
  diagnosticsHistory: Array<{ name: string; status: "success" | "warning" | "failed"; details: string }>;
  setDiagnosticsHistory: React.Dispatch<React.SetStateAction<Array<{ name: string; status: "success" | "warning" | "failed"; details: string }>>>;
  diagnosticsStatus: "idle" | "running";
  setDiagnosticsStatus: (s: "idle" | "running") => void;
  runFullDiagnostics: () => void;
}> = ({
  diagnosticsHistory, setDiagnosticsHistory, diagnosticsStatus, setDiagnosticsStatus, runFullDiagnostics
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-[#040406]/60 border border-white/10 rounded-2xl backdrop-blur-md p-5 font-mono text-[11px] text-white/90 text-left">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-cyan-400" /> OS Reality Sync & Diagnostics Suite
            </h3>
          </div>
          <p className="text-[9px] text-white/30 mt-1 uppercase tracking-wider">
            REAL-TIME PHYSICAL CAPABILITIES MONITORED VERBOSELY • ZERO SIMULATIONS OR FABRICATED LOGS
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runFullDiagnostics}
            disabled={diagnosticsStatus === "running"}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase flex items-center gap-1.5 transition-all border ${
              diagnosticsStatus === "running"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30 cursor-not-allowed"
                : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/25 hover:border-cyan-550/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
            }`}
          >
            <RefreshCw className={`h-3 w-3 ${diagnosticsStatus === "running" ? "animate-spin" : ""}`} />
            {diagnosticsStatus === "running" ? "Analyzing Core..." : "Run System Diagnostics"}
          </button>
          <button
            onClick={() => {
              setDiagnosticsHistory([
                { name: "Websocket Engine", status: "success", details: "Active pipeline connected through host port 3000" },
                { name: "Vocal Synthesizer (FENRIR)", status: "success", details: "Sound card frequency buffer ready to broadcast" },
                { name: "Local Sandbox Storage", status: "success", details: "Virtual file descriptor indexed" }
              ]);
              setDiagnosticsStatus("idle");
            }}
            className="px-2.5 py-1.5 rounded-xl text-[9px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/50"
          >
            Clear Health Cache
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-white/30 text-[8px] font-bold uppercase tracking-widest px-1">
          <span>Verified Hardware Component</span>
          <span>Integration Integrity</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {diagnosticsHistory.map((item, idx) => (
            <div key={idx} className="bg-[#09090d]/80 border border-white/5 rounded-xl p-2.5 flex items-start gap-2.5 hover:border-white/10 transition-colors">
              <div className="mt-1 shrink-0">
                {item.status === "success" ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 block shadow-[0_0_8px_#10b981]" />
                ) : item.status === "warning" ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 block shadow-[0_0_8px_#f59e0b]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-rose-500 block shadow-[0_0_8px_#ef4444]" />
                )}
              </div>
              <div className="flex-1 leading-normal">
                <div className="flex items-center justify-between leading-none">
                  <span className="font-bold text-white/80">{item.name}</span>
                  <span className={`text-[8px] font-bold uppercase ${
                    item.status === "success" ? "text-emerald-400" : item.status === "warning" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {item.status === "success" ? "HEALTHY MODULE" : item.status === "warning" ? "EXPERIMENTAL LINK" : "OFFLINE / DENIED"}
                  </span>
                </div>
                <p className="text-[9.5px] text-white/40 mt-1 leading-snug">{item.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 10. Appearance Module
type ThemeType = "cyber-cyan" | "royal-purple" | "deep-blue" | "nano-green" | "solar-amber";
export const AppearanceModule: React.FC<{
  activeTheme: ThemeType;
  setActiveTheme: (t: ThemeType) => void;
  addLog: (m: string) => void;
}> = ({ activeTheme, setActiveTheme, addLog }) => {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md max-w-2xl w-full mx-auto text-left font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <Sun className="h-4 w-4 text-cyan-400" /> Display & Theme Registry
        </span>
        <span className="text-[9px] font-mono text-white/30 uppercase">5 PRESETS READY</span>
      </div>

      <p className="text-[10.5px] text-white/50 mb-5 leading-relaxed">
        Switches CSS Custom Property hooks globally. Changing the theme alters visual borders, accent colors, and HUD status lighting effects dynamically.
      </p>

      <div className="space-y-2.5">
        {[
          { id: "cyber-cyan", name: "Cyber Cyan (Default)", desc: "Fluorescent cyan accent with deep charcoal base", style: "border-cyan-500/30 text-cyan-400 bg-cyan-950/20" },
          { id: "royal-purple", name: "Royal Purple", desc: "Aura violet accents matching Fenrir's vocal matrix", style: "border-purple-500/30 text-purple-400 bg-purple-950/20" },
          { id: "deep-blue", name: "Deep Blue", desc: "Classic oceanic deep-space neon colorway", style: "border-blue-500/30 text-blue-400 bg-blue-950/20" },
          { id: "nano-green", name: "Nano Green", desc: "Verdant hacker matrix terminal lighting preset", style: "border-emerald-500/30 text-emerald-400 bg-emerald-950/20" },
          { id: "solar-amber", name: "Solar Amber", desc: "Intense warning light telemetry warm spectrum overlay", style: "border-amber-500/30 text-amber-400 bg-amber-950/20" }
        ].map((theme) => {
          const isSelected = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => {
                setActiveTheme(theme.id as ThemeType);
                addLog(`🎨 Custom Switched Theme to: ${theme.name}`);
              }}
              className={`w-full p-4 rounded-xl text-left border flex items-center justify-between transition-all duration-150 ${
                isSelected 
                  ? "bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                  : "bg-[#09090d]/60 border-white/5 hover:border-white/15 text-white/60 hover:text-white"
              }`}
            >
              <div>
                <h4 className="font-bold text-xs leading-none">{theme.name}</h4>
                <p className="text-[9.5px] text-white/40 mt-1">{theme.desc}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[8px] font-bold ${theme.style}`}>
                {isSelected ? "ACTIVE" : "SELECT"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 11. Performance Module
export const PerformanceModule: React.FC<{
  cpuLoad: number;
  memPercent: number;
  networkPing: number;
  coreTemp: number;
  lastExecution: { name: string; args: any; status: "success" | "failed" | "executing"; error?: string; timestamp: number } | null;
}> = ({ cpuLoad, memPercent, networkPing, coreTemp, lastExecution }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full max-w-5xl mx-auto text-left font-mono">
      {/* Telemetry Meters */}
      <div className="md:col-span-5 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" /> Core Telemetry
            </span>
            <span className="text-[10px] text-cyan-400">REALTIME</span>
          </div>

          <div className="space-y-3 font-mono text-[9px]">
            {/* CPU */}
            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none">CPU LOAD</span>
                  <span className="text-white/95 font-bold text-[10.5px] mt-0.5 block">{cpuLoad}%</span>
                </div>
              </div>
              <div className="w-16 bg-white/5 h-1 rounded-full overflow-hidden shrink-0">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${cpuLoad}%` }} />
              </div>
            </div>

            {/* RAM */}
            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Database className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none">MEMORY ALLOC</span>
                  <span className="text-white/95 font-bold text-[10.5px] mt-0.5 block">{memPercent}%</span>
                </div>
              </div>
              <div className="w-16 bg-white/5 h-1 rounded-full overflow-hidden shrink-0">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${memPercent}%` }} />
              </div>
            </div>

            {/* PING */}
            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Wifi className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-pulse" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none">GATEWAY PING</span>
                  <span className="text-white/95 font-bold text-[10.5px] mt-0.5 block">{networkPing} ms</span>
                </div>
              </div>
              <span className="text-emerald-400/80 font-bold text-[7.5px] leading-none shrink-0 border border-emerald-500/20 px-1 py-0.5 bg-emerald-950/20 rounded">LIVE</span>
            </div>

            {/* TEMP */}
            <div className="bg-[#09090d]/60 border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Thermometer className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <div className="truncate">
                  <span className="text-white/40 block text-[7.5px] uppercase font-bold tracking-wider leading-none">CORE TEMPERATURE</span>
                  <span className="text-white/95 font-bold text-[10.5px] mt-0.5 block">{coreTemp}°C</span>
                </div>
              </div>
              <span className="text-amber-400/80 font-bold text-[7.5px] leading-none shrink-0 border border-amber-500/20 px-1 py-0.5 bg-amber-950/20 rounded">SAFE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Execution Checker */}
      <div className="md:col-span-7 bg-[#09090d]/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
        <div>
          <span className="text-[9px] text-cyan-400 block font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Workflow className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> Live Execution Checker
          </span>

          {lastExecution ? (
            <div className="space-y-2.5 text-[9.5px] leading-relaxed">
              <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                <span className="text-white/40 font-semibold text-[8.5px] uppercase">Function Name:</span>
                <span className="text-cyan-400 font-bold">{lastExecution.name}()</span>
              </div>
              <div>
                <span className="text-white/40 font-semibold uppercase text-[8.5px] block mb-1">Parameters (JSON Schema):</span>
                <pre className="text-[9px] bg-black/50 border border-white/5 rounded px-2 py-1.5 overflow-x-auto text-cyan-200/80 font-mono tracking-tight leading-snug max-h-16">
                  {JSON.stringify(lastExecution.args, null, 2)}
                </pre>
              </div>
              <div className="flex justify-between items-center border-t border-b border-white/[0.04] py-1.5">
                <span className="text-white/40 font-semibold text-[8.5px] uppercase">Execution Status:</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold leading-none shrink-0 ${
                  lastExecution.status === "success" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : lastExecution.status === "executing"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                }`}>
                  {lastExecution.status.toUpperCase()}
                </span>
              </div>
              {lastExecution.error && (
                <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded p-2 text-[9px] leading-tight font-mono">
                  <span className="font-bold text-rose-400">Diag Report:</span> {lastExecution.error}
                </div>
              )}
              <div className="flex justify-between text-[8px] text-white/30 pt-1 border-t border-white/[0.02]">
                <span>UTC Timestamp:</span>
                <span>{new Date(lastExecution.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-white/20 p-2 border border-dashed border-white/10 rounded-xl bg-black/20">
              <Activity className="h-5 w-5 text-indigo-400/30 animate-pulse mb-1.5" />
              <p className="text-[9px] leading-normal uppercase tracking-wider text-white/40">
                Awaiting Host Commands...<br />
                <span className="text-[8px] text-white/25 mt-1 block">Speak To Jarvis Or Click Controls</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 12. Logs Module
export const LogsModule: React.FC<{
  systemLogs: string[];
  actionHistory: Array<{ siteName: string; url: string }>;
}> = ({ systemLogs, actionHistory }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 text-left font-mono">
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
          <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-cyan-400" /> Active Operating System Log Buffer
          </span>
          <span className="text-[8px] bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-400">20 ENTRIES</span>
        </div>

        <div className="bg-[#040406]/80 border border-white/5 rounded-xl p-4 font-mono text-[10px] space-y-2 h-72 overflow-y-auto leading-normal">
          {systemLogs.map((log, idx) => (
            <div key={idx} className="border-b border-white/[0.02] pb-1.5 flex gap-2">
              <span className="text-cyan-500/60 font-bold shrink-0">[{20 - idx}]</span>
              <span className="text-white/80">{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action history */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <Compass className="text-indigo-400 h-4 w-4" />
          </div>
          <div>
            <span className="text-[9px] text-white/40 block uppercase font-bold tracking-wider">Launch Commands</span>
            <p className="text-xs font-semibold">
              {actionHistory.length > 0 ? (
                <a 
                  href={actionHistory[0].url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-indigo-300 hover:text-white transition-colors hover:underline flex items-center gap-1"
                >
                  <span>Launch {actionHistory[0].siteName}</span>
                  <ChevronRight className="h-3 w-3" />
                </a>
              ) : (
                "Waiting for voice request"
              )}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-white/20">W_ACT_V1</span>
      </div>
    </div>
  );
};

// 13. Notifications Module
export const NotificationsModule: React.FC<{
  alarms: Array<{ id: number; time: string; label: string; enabled: boolean }>;
  setAlarms: React.Dispatch<React.SetStateAction<Array<{ id: number; time: string; label: string; enabled: boolean }>>>;
  reminders: Array<{ id: number; reminderText: string; delaySeconds: number; fired: boolean }>;
  emails: Array<{ id: number; recipient: string; subject: string; body: string }>;
}> = ({ alarms, setAlarms, reminders, emails }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left font-mono max-w-5xl mx-auto">
      {/* Alarms */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
          <span className="text-xs font-bold tracking-wider text-green-400 uppercase flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-green-400" /> Active Alarms
          </span>
          <span className="text-[9px] text-white/30">CRON STATUS</span>
        </div>

        <div className="h-44 overflow-y-auto space-y-2 pr-1 font-mono text-[10px] text-white/80">
          {alarms.map((al) => (
            <div key={al.id} className="bg-[#09090d] border border-white/5 p-2 rounded-xl flex items-center justify-between">
              <div className="truncate">
                <p className="font-bold text-xs text-white leading-none">{al.time}</p>
                <p className="text-[9px] text-white/40 truncate mt-1">{al.label}</p>
              </div>
              <button 
                onClick={() => {
                  setAlarms(prev => prev.map(a => a.id === al.id ? { ...a, enabled: !a.enabled } : a));
                }}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold ${al.enabled ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/30 border border-white/5'}`}
              >
                {al.enabled ? "ACTIVE" : "OFF"}
              </button>
            </div>
          ))}
          
          {reminders.map((rem) => (
            <div key={rem.id} className="bg-indigo-950/20 border border-indigo-500/20 p-2 rounded-xl">
              <div className="flex justify-between">
                <span className="text-[8px] font-bold text-indigo-400">DELAY TIMER</span>
                <span className="text-[8px] text-white/40">{rem.fired ? "Fired" : "Countdown"}</span>
              </div>
              <p className="text-[10px] text-indigo-200 truncate mt-1">{rem.reminderText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatched Emails */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
          <span className="text-xs font-bold tracking-wider text-violet-400 uppercase flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-violet-400" /> Dispatched Mail
          </span>
          <span className="text-[9px] text-white/30">OUTBOX</span>
        </div>

        <div className="h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px] text-white/80">
          {emails.length > 0 ? (
            emails.map((m) => (
              <div key={m.id} className="bg-[#09090d] border border-white/5 p-2 rounded-xl">
                <p className="text-[9px] text-violet-300 font-bold leading-none truncate">To: {m.recipient}</p>
                <p className="text-white/80 truncate mt-1">{m.subject}</p>
                <p className="text-white/40 text-[9px] line-clamp-1 mt-0.5">{m.body}</p>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/20 p-3 text-center">
              <Mail className="h-5 w-5 mb-1" />
              <p className="text-[9px] leading-tight">No outgoing emails triggered. Speak to compile!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 14. Settings Module
export const SettingsModule: React.FC<{
  brightness: number;
  setBrightness: (b: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  setIsLocked: (l: boolean) => void;
  setRebooting: (r: boolean) => void;
  setSystemOffline: (o: boolean) => void;
  addLog: (m: string) => void;
}> = ({
  brightness, setBrightness, volume, setVolume, setIsLocked, setRebooting, setSystemOffline, addLog
}) => {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md max-w-2xl w-full mx-auto text-left font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <Lock className="h-4 w-4 text-cyan-400" /> Companion Settings & Overrides
        </span>
        <span className="text-[9px] text-white/30 uppercase font-bold">SYSTEM BACKEND</span>
      </div>

      <p className="text-[10.5px] text-white/50 mb-5 leading-relaxed">
        Modify master brightness overlays, Master volume thresholds, reset configurations, or initiate microservice reboots manually.
      </p>

      <div className="space-y-4 mb-5">
        {/* Brightness Controls */}
        <div>
          <div className="flex justify-between text-xs text-white/70 mb-1.5 font-mono">
            <span className="flex items-center gap-1"><Sun className="h-3.5 w-3.5 text-amber-400" /> Backlight Brightness</span>
            <span>{brightness}%</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="100" 
            value={brightness} 
            onChange={(e) => {
              const l = Number(e.target.value);
              setBrightness(l);
              addLog(`Brightness changed manually to ${l}%`);
            }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>

        {/* Volume Controls */}
        <div>
          <div className="flex justify-between text-xs text-white/70 mb-1.5 font-mono">
            <span className="flex items-center gap-1"><Volume2 className="h-3.5 w-3.5 text-cyan-400" /> Master Volume</span>
            <span>{volume}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => {
              const l = Number(e.target.value);
              setVolume(l);
              addLog(`Volume level adjusted manually to ${l}%`);
            }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <button 
          onClick={() => {
            setIsLocked(true);
            addLog("🔒 Screen locked manually via settings.");
          }}
          className="py-2.5 bg-white/5 border border-white/15 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
        >
          <Lock className="h-3.5 w-3.5 text-cyan-400" /> Secure Lock Screen
        </button>

        <button 
          onClick={() => {
            setRebooting(true);
            addLog("🔌 Reinitializing virtual OS companion...");
            setTimeout(() => {
              setRebooting(false);
              addLog("🔌 Virtual OS companion successfully reinitialized!");
            }, 4000);
          }}
          className="py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400 animate-spin" /> Warm-Reboot Kernel
        </button>

        <button 
          onClick={() => {
            setSystemOffline(true);
            addLog("🔌 Shutting down virtual OS companion...");
          }}
          className="py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 col-span-2"
        >
          <Power className="h-3.5 w-3.5 text-red-500" /> Shut Down Companion Power
        </button>
      </div>
    </div>
  );
};

// 15. About Module
export const AboutModule: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md max-w-xl w-full mx-auto text-left font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" /> About Manav Operating System
        </span>
        <span className="text-[9px] font-mono text-cyan-400">ACTIVE OS REGISTRY</span>
      </div>

      <div className="space-y-4 text-[10.5px] leading-relaxed">
        <p className="text-white/80">
          Manav Advanced Operating System Companion, an audio-first virtual computer interface and cognitive executor designed to respond to natural speech queries.
        </p>

        <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
            <span className="text-white/40">Creator, Designer & Owner:</span>
            <span className="text-cyan-400 font-bold font-sans">Om Ujwal Jumle</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
            <span className="text-white/40">AI Brain Engine:</span>
            <span className="text-white/80 font-sans">Gemini 3.1 Live API Pipeline</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
            <span className="text-white/40">Vocal Synthesizer Voice:</span>
            <span className="text-purple-400 font-bold font-sans">FENRIR MALE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Sync Environment Status:</span>
            <span className="text-emerald-400 font-bold font-sans">ACTIVE & STABLE</span>
          </div>
        </div>

        <p className="text-[9.5px] text-white/30 leading-normal text-center pt-2">
          Designed Offline-First with durable persistent local memory, dynamic visual radar matrix systems, and multi-subsystem hardware diagnostics streams.
        </p>
      </div>
    </div>
  );
};
