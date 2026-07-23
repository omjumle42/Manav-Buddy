/**
 * AudioPlayer handles queuing and gapless playback of 24kHz raw PCM response audio.
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  constructor() {}

  init() {
    if (!this.audioContext) {
      // Prepare AudioContext strictly at 24000Hz (Gemini Live output sample rate)
      // to avoid slow playback or pitch-shifting issues
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  playChunk(base64PCM: string) {
    this.init();
    if (!this.audioContext || !this.analyser) return;

    // Convert Base64 back into an ArrayBuffer of Int16 samples
    const binary = atob(base64PCM);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);

    // Normalize 16-bit signed short integer scale (-32768 to 32767) back to WebAudio float32 scale (-1.0 to 1.0)
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    // Create 24000Hz Mono audio playbuffer
    const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.analyser);

    const currentTime = this.audioContext.currentTime;

    // Match scheduling correctly to guarantee gapless playback on web streams
    if (this.nextStartTime < currentTime) {
      // Buffer a mini start delay to allow stable delivery of subsequent chunks
      this.nextStartTime = currentTime + 0.05;
    }

    const scheduledPlayTime = this.nextStartTime;
    source.start(scheduledPlayTime);
    this.nextStartTime += audioBuffer.duration;

    this.activeSources.push(source);

    source.onended = () => {
      this.activeSources = this.activeSources.filter((src) => src !== source);
    };
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

  stopAllAndClear() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (err) {}
    });
    this.activeSources = [];
    this.nextStartTime = 0;
  }

  close() {
    this.stopAllAndClear();
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
  }
}
