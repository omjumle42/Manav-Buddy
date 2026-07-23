import React, { useEffect, useRef } from "react";

interface PremiumVoiceVisualizerProps {
  state: "disconnected" | "connecting" | "listening" | "speaking";
  userSpeechAmplitude: number;
  assistantSpeechAmplitude: number;
}

export const PremiumVoiceVisualizer: React.FC<PremiumVoiceVisualizerProps> = ({
  state,
  userSpeechAmplitude,
  assistantSpeechAmplitude,
}) => {
  const path1Ref = useRef<SVGPathElement | null>(null);
  const path2Ref = useRef<SVGPathElement | null>(null);
  const path3Ref = useRef<SVGPathElement | null>(null);
  
  // Interpolation targets for amplitude & speed to prevent sharp jumps
  const currentAmp1 = useRef(0.06);
  const currentAmp2 = useRef(0.04);
  const currentAmp3 = useRef(0.02);
  const currentSpeed = useRef(1.0);

  useEffect(() => {
    let animationFrameId: number;
    let time = 0;

    const updateWaves = () => {
      time += 0.045 * currentSpeed.current;

      const path1 = path1Ref.current;
      const path2 = path2Ref.current;
      const path3 = path3Ref.current;

      if (!path1 || !path2 || !path3) {
        animationFrameId = requestAnimationFrame(updateWaves);
        return;
      }

      // Determine the target parameters based on the current state and amplitude
      let targetAmpMultiplier = 0.05;
      let targetSpeedVal = 1.0;

      if (state === "disconnected") {
        // Idle: Very small, slow breathing animation (1-2px vertical height variation)
        const breathing = 0.05 + Math.sin(time * 0.12) * 0.015;
        targetAmpMultiplier = breathing;
        targetSpeedVal = 0.5;
      } else if (state === "connecting") {
        // Thinking: Calm pulse animation
        const pulse = 0.08 + Math.sin(time * 0.22) * 0.025;
        targetAmpMultiplier = pulse;
        targetSpeedVal = 0.8;
      } else if (state === "listening") {
        // Listening: Gentle responsive movement with small amplitude
        // Clamp loud input slightly so it doesn't break the UI
        const activeVol = Math.min(0.12, userSpeechAmplitude * 0.25);
        // Soft voice remains visible, loud voice increases movement only slightly
        const baseline = 0.06;
        targetAmpMultiplier = baseline + activeVol;
        targetSpeedVal = 1.1;
      } else if (state === "speaking") {
        // Speaking: Smooth voice-reactive waves with subtle amplitude changes
        const activeVol = Math.min(0.15, assistantSpeechAmplitude * 0.3);
        const baseline = 0.08;
        targetAmpMultiplier = baseline + activeVol;
        targetSpeedVal = 1.3;
      }

      // Smooth spring/ease interpolation to prevent sharp jumps or flashing
      currentAmp1.current += (targetAmpMultiplier - currentAmp1.current) * 0.08;
      currentAmp2.current += (targetAmpMultiplier * 0.7 - currentAmp2.current) * 0.08;
      currentAmp3.current += (targetAmpMultiplier * 0.45 - currentAmp3.current) * 0.08;
      currentSpeed.current += (targetSpeedVal - currentSpeed.current) * 0.08;

      const width = 160;
      const height = 24;
      const centerY = height / 2;

      // Maximum movement should be only about 15-25% of the component height
      // 24px height * 22% = 5.28px max vertical movement from center line
      const maxDisplacement = height * 0.22;

      // Generate SVG path 'd' attributes
      const getPathD = (freq: number, phase: number, amp: number) => {
        let d = `M 0 ${centerY}`;
        const pointsCount = 45;
        const step = width / pointsCount;

        for (let i = 0; i <= pointsCount; i++) {
          const x = i * step;
          // Sine envelope to pin the ends to centerY (0 displacement) so the wave stays perfectly centered
          const envelope = Math.sin((i / pointsCount) * Math.PI);
          
          // Wave calculation
          const displacement = Math.sin(i * freq + phase) * amp * height * envelope;
          // Hard clamp displacement to guarantee it never exceeds 15-25% of container height
          const clampedDisplacement = Math.max(-maxDisplacement, Math.min(maxDisplacement, displacement));
          
          const y = centerY + clampedDisplacement;
          d += ` L ${x} ${y}`;
        }
        return d;
      };

      // Set path data cleanly on refs without React state overhead
      path1.setAttribute("d", getPathD(0.12, time * 0.8, currentAmp1.current));
      path2.setAttribute("d", getPathD(0.18, -time * 0.65 + 1.5, currentAmp2.current));
      path3.setAttribute("d", getPathD(0.09, time * 0.45 + 2.8, currentAmp3.current));

      animationFrameId = requestAnimationFrame(updateWaves);
    };

    updateWaves();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, userSpeechAmplitude, assistantSpeechAmplitude]);

  // Determine colors based on active state
  const getColors = () => {
    switch (state) {
      case "listening":
        return {
          stroke1: "rgba(34, 211, 238, 0.85)", // Cyan 400
          stroke2: "rgba(59, 130, 246, 0.55)", // Blue 500
          stroke3: "rgba(6, 182, 212, 0.4)",   // Cyan 500
        };
      case "speaking":
        return {
          stroke1: "rgba(168, 85, 247, 0.85)", // Purple 500
          stroke2: "rgba(236, 72, 153, 0.55)", // Pink 500
          stroke3: "rgba(139, 92, 246, 0.4)",  // Violet 500
        };
      case "connecting":
        return {
          stroke1: "rgba(245, 158, 11, 0.85)", // Amber 500
          stroke2: "rgba(234, 179, 8, 0.55)",  // Yellow 500
          stroke3: "rgba(249, 115, 22, 0.4)",   // Orange 500
        };
      default: // disconnected / idle
        return {
          stroke1: "rgba(148, 163, 184, 0.35)", // Slate 400
          stroke2: "rgba(148, 163, 184, 0.2)",
          stroke3: "rgba(148, 163, 184, 0.1)",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="flex-1 flex items-center justify-center h-6 px-1 overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 160 24"
        preserveAspectRatio="none"
        className="w-full max-w-[160px]"
      >
        <path
          ref={path3Ref}
          fill="none"
          stroke={colors.stroke3}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="transition-colors duration-500"
        />
        <path
          ref={path2Ref}
          fill="none"
          stroke={colors.stroke2}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="transition-colors duration-500"
        />
        <path
          ref={path1Ref}
          fill="none"
          stroke={colors.stroke1}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-colors duration-500"
        />
      </svg>
    </div>
  );
};
