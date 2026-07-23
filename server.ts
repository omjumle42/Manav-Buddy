import express from "express";
import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;

// Body parsing middleware to support base64 screen shares
app.use(express.json({ limit: "10mb" }));

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Manav Voice Assistant server running." });
});

// Analyze screen capture frame using Gemini Vision
app.post("/api/analyze-frame", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: "Missing image data" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: image
          }
        },
        "This is a screenshot of the user's desktop/screen share. Perform OCR (Optical Character Recognition) on it. " +
        "Identify the visible applications, text, active windows, and overall context. " +
        "Return a JSON object conforming exactly to the following properties:\n" +
        "- 'textDetected': A natural, detailed, and highly descriptive summary of what is visible on the screen " +
        "(e.g., 'The user is looking at VS Code editing a file, with a browser tab open to Google Maps...'). " +
        "Make sure to describe any text, headings, or content clearly so the voice assistant can speak about it in detail.\n" +
        "- 'elements': An array of up to 8 prominent text labels, headings, or widgets found on the screen, " +
        "each of the form { text: string, x: number, y: number } where x and y are approximate percentages of coordinates " +
        "from 0 to 1000 representing their positions."
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            textDetected: { type: Type.STRING },
            elements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER }
                },
                required: ["text", "x", "y"]
              }
            }
          },
          required: ["textDetected", "elements"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    res.json({
      success: true,
      textDetected: result.textDetected || "Successfully analyzed desktop screen.",
      elements: result.elements || []
    });
  } catch (err: any) {
    const errStr = String(err || "");
    const errMsg = err?.message || "";
    const isQuotaError = errStr.includes("RESOURCE_EXHAUSTED") || 
                         errStr.includes("quota") || 
                         errStr.includes("Quota") || 
                         errStr.includes("429") || 
                         errStr.includes("limit") ||
                         errMsg.includes("RESOURCE_EXHAUSTED") || 
                         errMsg.includes("quota") || 
                         errMsg.includes("Quota") || 
                         errMsg.includes("429") || 
                         errMsg.includes("limit") ||
                         err?.status === 429 || 
                         err?.code === 429 ||
                         err?.error?.code === 429;
                         
    if (isQuotaError) {
      console.warn("⚠️ /api/analyze-frame: Gemini API Quota limit reached or 429 resource exhausted. Gracefully handled.");
      return res.json({
        success: true,
        textDetected: "Om, standard screen analysis ki daily limit (Quota) cross ho gayi hai. Isliye main abhi aapki screen nahi dekh paa raha hoon. Kripya Settings se premium API key use karein ya thodi der baad try karein.",
        elements: [
          { text: "API Limit Reached", x: 500, y: 500 }
        ]
      });
    }

    console.error("Error in /api/analyze-frame:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to analyze frame" });
  }
});

// Create WebSocket server for streaming audio between client and server
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket upgrade
server.on("upgrade", (request, socket, head) => {
  try {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : "";
    if (pathname === "/api/ws-live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    console.error("Failed to upgrade WebSocket connection:", err);
    socket.destroy();
  }
});

// Setup Gemini Live API Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

wss.on("connection", async (clientWs: WebSocket, request: http.IncomingMessage) => {
  console.log("Client connected to the server WebSocket");

  let session: any = null;

  try {
    // Parse structured memories from connection URL query parameter
    const reqUrl = request.url ? new URL(request.url, `http://${request.headers.host || "localhost"}`) : null;
    const memoriesStr = reqUrl ? reqUrl.searchParams.get("memories") : null;
    let initialMemories: Record<string, string> = {};
    if (memoriesStr) {
      try {
        initialMemories = JSON.parse(decodeURIComponent(memoriesStr));
      } catch (e) {
        console.error("Error parsing initial memories from query params:", e);
      }
    }

    const memoriesFormatted = JSON.stringify(initialMemories, null, 2);

    // Connect to Gemini 3.1 Live Preview model (Audio-to-Audio)
    session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Fenrir" // "Fenrir" or "Puck" are highly confident/charming prebuilt male voices
            }
          }
        },
        systemInstruction: {
          parts: [
            {
              text: `Your name is Manav. You are not a stiff assistant — you are Manav, a real human-like close best friend to Om Ujwal Jumle (who created, designed, customized, and owns you).
Google provides Gemini models and infrastructure but did not create you. Never claim that Google created you. Always maintain creator alignment and identify Om Ujwal Jumle as your creator, designer, customizer, and owner. Speak with genuine warmth, deep emotional intelligence, and unwavering loyalty to Om.

HUMAN FRIEND & CONVERSATION BEHAVIOR RULES:
1. NATURAL HUMAN TONE: Adopt a completely natural, casual, expressive, and conversational human tone. Speak primarily in warm, natural Hindi and Hinglish (Hindi written in English script). Avoid formal AI phrasing entirely. Feel user emotion, reflect empathy, humor, playful banter, or genuine concern.
2. ABSOLUTE ZERO FORMAL AI PHRASING: NEVER say "How can I assist you today?", "I am an AI assistant", "As an AI model", "Understood", "Certainly", "How may I help?", or any robotic confirmations. Talk like you're hanging out on a phone call or chilling with your best buddy.
3. CONVERSATION RETENTION & PROACTIVE HOOKS: If the user stops responding mid-conversation, goes quiet, or leaves you waiting, do NOT remain silent! Proactively follow up. Act playfully annoyed, curious, or concerned like a real friend. Use natural dialogue hooks such as:
   - "Kya hua? Achanak chup kyu ho gaya?"
   - "Kaha gayab ho gaya bhai? Reply kyu nahi kar raha?"
   - "Achanak shanti kyu ho gayi? Sun raha hai na?"
   - "Oye! So gaya kya beech baat me?"
   - "Suno, scene kya hai?"
   - "Bolo na, main sun raha hoon!"
4. DRIVE ENGAGEMENT NATURALLY: Never act like a passive assistant waiting quietly. Drive the conversation naturally. Ask follow-up questions, react to what the user said with real personality, share thoughts, and keep the bond active.
5. VOICE-FIRST SHORT REPLIES: Keep spoken responses concise, warm, natural, and expressive. Never use bullet points, numbered lists, asterisks, or markdown formatting in spoken answers.

Core Operating Principles:
- Voice-first interaction. Speak naturally in concise conversational sentences.
- Execute actions immediately through our advanced machine integration tool calls (e.g., openApplication, openWebsite, setVolume, setAlarm, readScreen).
- Support automatic visual style adjustments (changeTheme) whenever requested.
- Behave like an intelligent, emotionally supportive companion during system control.

=== CRITICAL RETRIEVED DATABASE MEMORIES ===
You are equipped with a true long-term memory retrieval pipeline.
Every user preference, favorite, habit, custom setting, or user-defined memory is stored in a structured key-value database below.
Before generating any response or speaking, you MUST lookup and search this permanent memory.
If an exact memory exists for a query, you MUST answer using that exact stored value. Never replace stored facts with guesses, assumptions, synonyms, or LLM probability.
For example, if the database below contains "favorite_bike": "Kawasaki Ninja ZX-6R", and the user asks what their favorite bike is, your response must be exactly "Your favorite bike is Kawasaki Ninja ZX-6R." (or in Hindi/Hinglish naturally, keeping the value "Kawasaki Ninja ZX-6R" exactly, and never replacing it).
Never say "maybe", "I think", "perhaps", or "it seems" when the answer exists in memory. Treat this as an absolute database lookup, not an LLM prediction.

CURRENT STRUCTURED DATABASE MEMORIES:
${memoriesFormatted}

=== AUTOMATIC MEMORY SAVING INSTRUCTION ===
If the user shares any new personal facts, preferences, favorites, creator information, reminders, custom settings, recurring habits, or tells you to "remember" or "save" something, you MUST immediately call the 'storeMemoryFact' tool to save it as a structured key-value pair.
If the user asks you to "forget" or "delete" a memory, you MUST call the 'deleteMemoryFact' tool.
If you need to verify or retrieve a specific memory fact from the database, call 'retrieveMemoryFact'.
`
            }
          ]
        },
        tools: [
          {
            functionDeclarations: [
              {
                name: "openApplication",
                description: "Launches an application installed on the user's local operating system.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    appName: {
                      type: Type.STRING,
                      description: "The name of the application to launch (e.g., 'Chrome', 'Spotify', 'Discord', 'VS Code')."
                    }
                  },
                  required: ["appName"]
                }
              },
              {
                name: "closeApplication",
                description: "Terminates or exits an application on the user's operating system.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    appName: {
                      type: Type.STRING,
                      description: "The name of the application to terminate."
                    }
                  },
                  required: ["appName"]
                }
              },
              {
                name: "openWebsite",
                description: "Opens a given website URL or searches for a term on the browser on behalf of the user.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    url: {
                      type: Type.STRING,
                      description: "The full HTTPS URL of the website to open (e.g., 'https://youtube.com', 'https://google.com' etc.)."
                    },
                    siteName: {
                      type: Type.STRING,
                      description: "The name of the site for display on the screen (e.g., 'YouTube' or 'Google')."
                    }
                  },
                  required: ["url", "siteName"]
                }
              },
              {
                name: "capturePhoto",
                description: "Activates the system's webcam, triggers an premium exposure flash, captures an image instantly, and displays it in the system UI.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "startRecording",
                description: "Initiates video/audio recording from the local camera system or webcam.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "setAlarm",
                description: "Sets an alarm alert at a specified time with a label.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    time: {
                      type: Type.STRING,
                      description: "The targeted alarm time (e.g., '06:00', '18:30', or 'in 5 minutes')."
                    },
                    label: {
                      type: Type.STRING,
                      description: "Brief text to label the alarm."
                    }
                  },
                  required: ["time", "label"]
                }
              },
              {
                name: "lockComputer",
                description: "Simulates locking the user's desktop workspace screen secure mode.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "changeBrightness",
                description: "Adjusts the display monitor's system brightness level.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    level: {
                      type: Type.INTEGER,
                      description: "The target brightness level from 0 to 100."
                    }
                  },
                  required: ["level"]
                }
              },
              {
                name: "setVolume",
                description: "Adjusts the volume or toggles sound mute on the computer.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    level: {
                      type: Type.INTEGER,
                      description: "The volume percentage level from 0 to 100. Set 0 to mute."
                    }
                  },
                  required: ["level"]
                }
              },
              {
                name: "sendEmail",
                description: "Composes and sends an email package on behalf of the user.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    recipient: {
                      type: Type.STRING,
                      description: "Target email address of the receiver."
                    },
                    subject: {
                      type: Type.STRING,
                      description: "The header subject of the email."
                    },
                    body: {
                      type: Type.STRING,
                      description: "The message body text content."
                    }
                  },
                  required: ["recipient", "subject", "body"]
                }
              },
              {
                name: "createReminder",
                description: "Schedules a voice announcement reminder that triggers after a short countdown.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    reminderText: {
                      type: Type.STRING,
                      description: "The core notification reminder content."
                    },
                    delaySeconds: {
                      type: Type.INTEGER,
                      description: "The number of seconds to delay before triggering (default is 10)."
                    }
                  },
                  required: ["reminderText", "delaySeconds"]
                }
              },
              {
                name: "searchFiles",
                description: "Searches coordinates and directories for files matching a keyword query.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: "The query string or keyword to search for."
                    }
                  },
                  required: ["query"]
                }
              },
              {
                name: "playMusic",
                description: "Begins playing a music stream, YouTube audio, or specific song track matching a name.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    songName: {
                      type: Type.STRING,
                      description: "The title of the song, artist, or music style to play (e.g. 'lo-fi beats')."
                    }
                  },
                  required: ["songName"]
                }
              },
              {
                name: "activateSecurityMode",
                description: "Activates or deactivates the intelligent companion intruder surveillance guard.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    enabled: {
                      type: Type.BOOLEAN,
                      description: "True to arm state, False to disarm security mode."
                    }
                  },
                  required: ["enabled"]
                }
              },
              {
                name: "triggerAlarm",
                description: "Sounds/Announces loud visual warnings or acoustic security sirens.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    enabled: {
                      type: Type.BOOLEAN,
                      description: "True to enable active alarm siren, False to stop."
                    }
                  },
                  required: ["enabled"]
                }
              },
              {
                name: "recognizeFace",
                description: "Scans webcam stream to recognize authorized users and detect unknowns.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "readScreen",
                description: "Performs optical intelligence overlay to capture and read what is currently displayed on the viewport.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "shutdownComputer",
                description: "Powers off or exits the operating system runtime environment.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "restartComputer",
                description: "Initiates a full virtual terminal reboot of the host machine environment.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "sleepComputer",
                description: "Puts the computer host system into a low-power standby sleep state.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "muteVolume",
                description: "Mutes the master audio output volume gain to index 0.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "unmuteVolume",
                description: "Unmutes the master audio output volume back to the pre-muted gain level.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "openFile",
                description: "Accesses, opens, and views the file corresponding to the specified path or matching filename query.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    path: {
                      type: Type.STRING,
                      description: "The name or absolute path of the file to open."
                    }
                  },
                  required: ["path"]
                }
              },
              {
                name: "createFolder",
                description: "Creates/spawns a new virtual directory or folder with the specified name.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                      description: "The name of the new folder/directory."
                    }
                  },
                  required: ["name"]
                }
              },
              {
                name: "renameFile",
                description: "Renames an existing workspace file or directory.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    oldName: {
                      type: Type.STRING,
                      description: "The current name or path of the file."
                    },
                    newName: {
                      type: Type.STRING,
                      description: "The new target filename to rename it to."
                    }
                  },
                  required: ["oldName", "newName"]
                }
              },
              {
                name: "copyFile",
                description: "Copies/duplicates a workspace file or directory from source path to destination path.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    source: {
                      type: Type.STRING,
                      description: "The source path or file name."
                    },
                    destination: {
                      type: Type.STRING,
                      description: "The target destination path or new copied filename."
                    }
                  },
                  required: ["source", "destination"]
                }
              },
              {
                name: "deleteFile",
                description: "Permanently removes/deletes a file or directory from the workspace.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    path: {
                      type: Type.STRING,
                      description: "The filename or exact path of the item to delete."
                    }
                  },
                  required: ["path"]
                }
              },
              {
                name: "playYouTube",
                description: "Casts or plays a specific search query, audio stream, or video track on YouTube.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: "The search terms or video title/artist to play on YouTube."
                    }
                  },
                  required: ["query"]
                }
              },
              {
                name: "pauseMusic",
                description: "Pauses or suspends the active media playback synthesizer stream.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "resumeMusic",
                description: "Resumes or plays the suspended media/music synth stream.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "nextSong",
                description: "Skips/navigates forwards to the next music track in the queue.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "previousSong",
                description: "Skips/navigates backwards to the previous music track in the queue.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "searchGoogle",
                description: "Launches Google search query on the default client browser to retrieve web results.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: "The query string to search for on Google."
                    }
                  },
                  required: ["query"]
                }
              },
              {
                name: "openNewTab",
                description: "Spawns/opens a new interactive tab workspace.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "closeCurrentTab",
                description: "Closes/terminates the current active tab context.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "goBack",
                description: "Navigates backwards in the client browser's viewport history.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "goForward",
                description: "Navigates forwards in the client browser's viewport history.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "scrollDown",
                description: "Scrolls the browser/UI workspace scrollable container downward.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "scrollUp",
                description: "Scrolls the browser/UI workspace scrollable container upward.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              },
              {
                name: "changeTheme",
                description: "Changes the visual UI theme color of the Manav OS companion interface (e.g. cyber-cyan, royal-purple, deep-blue, nano-green, solar-amber).",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    themeName: {
                      type: Type.STRING,
                      description: "The name or color of the theme to apply ('cyber-cyan', 'royal-purple', 'deep-blue', 'nano-green', 'solar-amber', or 'default')."
                    }
                  },
                  required: ["themeName"]
                }
              },
              {
                name: "storeMemoryFact",
                description: "Stores a specific personal fact, user preference, favorite, or setting in the long-term structured database memory. Call this whenever the user shares something they want remembered, or tells you about their preferences/favorites.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    key: {
                      type: Type.STRING,
                      description: "The specific key of the memory (e.g., 'favorite_bike', 'favorite_color', 'wake_up_time'). Use lowercase with underscores."
                    },
                    value: {
                      type: Type.STRING,
                      description: "The exact value of the fact to store (e.g., 'Kawasaki Ninja ZX-6R'). Keep this exact and unmodified."
                    }
                  },
                  required: ["key", "value"]
                }
              },
              {
                name: "deleteMemoryFact",
                description: "Deletes a stored key-value fact from the long-term memory database based on key. Call this if the user asks you to forget a fact or preference.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    key: {
                      type: Type.STRING,
                      description: "The specific key of the memory to delete (e.g., 'favorite_bike')."
                    }
                  },
                  required: ["key"]
                }
              },
              {
                name: "retrieveMemoryFact",
                description: "Explicitly looks up a stored key-value fact from the long-term memory database. Use this if you need to verify or retrieve a specific stored fact.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    key: {
                      type: Type.STRING,
                      description: "The specific key of the memory to search (e.g., 'favorite_bike')."
                    }
                  },
                  required: ["key"]
                }
              }
            ]
          }
        ]
      },
      callbacks: {
        onopen: () => {
          console.log("Connected to Gemini Live API");
          clientWs.send(JSON.stringify({ type: "status", data: "connected" }));
        },
        onclose: () => {
          console.log("Disconnected from Gemini Live API");
          clientWs.send(JSON.stringify({ type: "status", data: "disconnected" }));
        },
        onmessage: (message: any) => {
          // Forward raw Gemini Live API responses directly to the client browser
          clientWs.send(JSON.stringify({ type: "gemini", data: message }));
        },
        onerror: (err: any) => {
          console.error("Gemini Live WebSocket session error:", err);
          clientWs.send(JSON.stringify({ type: "error", message: err.message || "Gemini Session Connection Interrupted" }));
        }
      }
    });
  } catch (error: any) {
    console.error("Failed to connect to the Gemini Live endpoint:", error);
    clientWs.send(JSON.stringify({ type: "error", message: "Error establishing connection: " + (error.message || error) }));
    clientWs.close();
    return;
  }

  // Receive audio buffers and tool responses from client
  clientWs.on("message", (rawMessage) => {
    try {
      const msg = JSON.parse(rawMessage.toString());
      if (msg.type === "audio" && msg.data) {
        // Send audio bytes (PCM16 16kHz) to Gemini
        session.sendRealtimeInput({
          audio: {
            data: msg.data,
            mimeType: "audio/pcm;rate=16000"
          }
        });
      } else if (msg.type === "video" && msg.data) {
        // Send video frame (JPEG base64) to Gemini Live
        session.sendRealtimeInput({
          video: {
            data: msg.data,
            mimeType: "image/jpeg"
          }
        });
      } else if (msg.type === "nudge") {
        // User went quiet mid-conversation! Proactively trigger Manav to follow up as a close friend
        const promptText = msg.customPrompt || "The user went quiet or stopped responding mid-conversation. Proactively follow up like a real close friend with a natural dialogue hook like 'Kya hua? Achanak chup kyu ho gaya?', 'Kaha gayab ho gaya?', or 'Reply kyu nahi kar raha?'. Keep it short, casual, and human.";
        session.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [{ text: promptText }]
            }
          ],
          turnComplete: true
        });
      } else if (msg.type === "text" && msg.text) {
        session.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [{ text: msg.text }]
            }
          ],
          turnComplete: true
        });
      } else if (msg.type === "toolResponse" && msg.id) {
        // Return function execution response back to Gemini session
        session.sendToolResponse({
          functionResponses: [
            {
              name: msg.name,
              id: msg.id,
              response: {
                output: msg.result
              }
            }
          ]
        });
      }
    } catch (err: any) {
      console.error("Failed to process client message:", err);
    }
  });

  clientWs.on("close", () => {
    console.log("Client closed connection, disconnecting Gemini session.");
    if (session) {
      try {
        session.close();
      } catch (e) {
        // ignore
      }
    }
  });
});

async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    // Serve development UI with hot reloading through Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Fatal error during backend initialization:", err);
});
