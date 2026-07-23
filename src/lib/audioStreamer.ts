/**
 * AudioStreamer handles recording microphone input,
 * downsampling/sampling to 16kHz PCM 16-bit, and passing base64 audio chunks back.
 * Includes an advanced hardware constraints setup and a multi-stage Web Audio DSP 
 * noise-filtering and signal-enhancement pipeline.
 */
export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private digitalGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private onAudioChunk: (base64Chunk: string) => void;
  private vadHangoverFrames = 0; // Frames to keep gate open after speech levels drop below threshold

  constructor(onAudioChunk: (base64Chunk: string) => void) {
    this.onAudioChunk = onAudioChunk;
  }

  async start() {
    try {
      // 1. Request hardware microphone stream with robust standard constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 16000 }
        },
        video: false,
      });

      // 2. Force AudioContext to record at 16000Hz (PCM16 rate expected by Gemini Live API)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      // Create audio source node from the microphone stream
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // 3. DSP Stage 1: Highpass filter (cuts low-frequency AC, cooler, fan, and floor rumbles)
      this.highpassFilter = this.audioContext.createBiquadFilter();
      this.highpassFilter.type = "highpass";
      this.highpassFilter.frequency.setValueAtTime(130, this.audioContext.currentTime); // 130Hz cuts out deep ambient hums
      this.highpassFilter.Q.setValueAtTime(1.0, this.audioContext.currentTime);

      // 4. DSP Stage 2: Lowpass filter (reduces high-frequency hiss, static, and PC coil whines)
      this.lowpassFilter = this.audioContext.createBiquadFilter();
      this.lowpassFilter.type = "lowpass";
      this.lowpassFilter.frequency.setValueAtTime(6000, this.audioContext.currentTime); // Speech is fully contained under 6kHz

      // 5. DSP Stage 3: Dynamic Compression (Speech levelling & Voice Activity Detection helper)
      // Automatically boosts quiet speech while attenuating sudden loud peaks to prevent clipping.
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-28, this.audioContext.currentTime); // Threshold in dB
      this.compressor.knee.setValueAtTime(20, this.audioContext.currentTime); // Smooth transition
      this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime); // Compression ratio
      this.compressor.attack.setValueAtTime(0.005, this.audioContext.currentTime); // Fast attack (5ms)
      this.compressor.release.setValueAtTime(0.20, this.audioContext.currentTime); // Fast release (200ms)

      // 6. DSP Stage 4: Sensitizing Gain Node
      // Boosts the overall speech signal level after compression to make softer voices highly readable.
      this.digitalGain = this.audioContext.createGain();
      this.digitalGain.gain.setValueAtTime(2.2, this.audioContext.currentTime); // 2.2x clean gain boost

      // 7. Use standard ScriptProcessorNode for wide compatibility without sandboxed iframe loading issues
      // chunk size 2048 is great for low latency at 16kHz
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

      // 8. Connect the pipeline:
      // Source -> Highpass -> Lowpass -> Compressor -> Gain -> Analyser -> Processor -> Destination
      this.source.connect(this.highpassFilter);
      this.highpassFilter.connect(this.lowpassFilter);
      this.lowpassFilter.connect(this.compressor);
      this.compressor.connect(this.digitalGain);
      this.digitalGain.connect(this.analyser);
      this.analyser.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.processor.onaudioprocess = (e) => {
        const float32Samples = e.inputBuffer.getChannelData(0);

        // Calculate Root Mean Square (RMS) volume of the buffer for Voice Activity Detection
        let sumSquares = 0;
        for (let i = 0; i < float32Samples.length; i++) {
          sumSquares += float32Samples[i] * float32Samples[i];
        }
        const rms = Math.sqrt(sumSquares / float32Samples.length);

        // Voice activity noise floor threshold (filters out background cooler, fan, or HVAC noise)
        // Ambient background rumbles typically fall under RMS 0.006, normal speaking is > 0.015
        const VAD_THRESHOLD = 0.0075;

        if (rms > VAD_THRESHOLD) {
          this.vadHangoverFrames = 15; // Hold gate open for ~300ms (15 chunks * 20.48ms) to prevent word clipping
        } else if (this.vadHangoverFrames > 0) {
          this.vadHangoverFrames--;
        }

        const isSpeechDetected = this.vadHangoverFrames > 0;

        // If no voice is active, zero out the sample buffer
        // This delivers absolute, noise-free digital silence while maintaining continuous streaming
        if (!isSpeechDetected) {
          float32Samples.fill(0);
        }

        const pcm16Buffer = this.convertFloat32ToPCM16(float32Samples);
        const base64Part = this.arrayBufferToBase64(pcm16Buffer);
        if (base64Part) {
          this.onAudioChunk(base64Part);
        }
      };
    } catch (err) {
      console.error("AudioStreamer failed to start recording microphone:", err);
      this.stop();
      throw err;
    }
  }

  getVolume(): number {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length;
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  private convertFloat32ToPCM16(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        // Clamp sample to range [-1, 1]
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        // Scale to 16-bit signed integer
        const sample = s < 0 ? s * 0x8000 : s * 0x7FFF;
        view.setInt16(i * 2, sample, true); // true for little-endian
    }
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  stop() {
    if (this.processor) {
      this.processor.onaudioprocess = null;
      try {
        this.processor.disconnect();
      } catch (e) {}
      this.processor = null;
    }
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {}
    }
    if (this.digitalGain) {
      try {
        this.digitalGain.disconnect();
      } catch (e) {}
      this.digitalGain = null;
    }
    if (this.compressor) {
      try {
        this.compressor.disconnect();
      } catch (e) {}
      this.compressor = null;
    }
    if (this.lowpassFilter) {
      try {
        this.lowpassFilter.disconnect();
      } catch (e) {}
      this.lowpassFilter = null;
    }
    if (this.highpassFilter) {
      try {
        this.highpassFilter.disconnect();
      } catch (e) {}
      this.highpassFilter = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }
}
