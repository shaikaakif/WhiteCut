import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WordTimestamp } from '@/types';

interface KineticCaptionsProps {
  transcriptionData: WordTimestamp[];
  variant?: 'monospace-strip' | 'serif-clean' | 'terracotta-minimal';
  uppercase?: boolean;
}

export const KineticCaptions: React.FC<KineticCaptionsProps> = ({
  transcriptionData = [],
  variant = 'monospace-strip',
  uppercase = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Active word detection with slight smoothing buffer
  const activeIndex = transcriptionData.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  const activeWordObj = activeIndex !== -1 ? transcriptionData[activeIndex] : null;

  // Fallback to recent word if within tiny inter-word pause (150ms)
  const displayWord = activeWordObj
    ? activeWordObj.word
    : transcriptionData.find(
        (w) => currentTime >= w.end && currentTime <= w.end + 0.15
      )?.word || '';

  // Micro spring punch whenever active word updates
  const wordStartFrame = activeWordObj ? Math.round(activeWordObj.start * fps) : 0;
  const wordFrameOffset = Math.max(0, frame - wordStartFrame);
  const wordPop = spring({
    frame: wordFrameOffset,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 220 },
  });

  const formattedWord = uppercase ? displayWord.toUpperCase() : displayWord;

  if (!formattedWord) {
    return <div className="h-16" />;
  }

  if (variant === 'serif-clean') {
    return (
      <div className="w-full flex items-center justify-center py-4 px-6 z-50">
        <h1
          className="font-serif text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-center transition-all"
          style={{ transform: `scale(${wordPop})` }}
        >
          {formattedWord}
        </h1>
      </div>
    );
  }

  if (variant === 'terracotta-minimal') {
    return (
      <div className="w-full flex items-center justify-center py-4 px-6 z-50">
        <h1
          className="font-sans text-4xl font-black text-terracotta tracking-wide text-center drop-shadow-sm transition-all"
          style={{ transform: `scale(${wordPop})` }}
        >
          {formattedWord}
        </h1>
      </div>
    );
  }

  // Default: Monospace strip with high-contrast bounding box
  return (
    <div className="w-full bg-stone-950/95 border-y-2 border-stone-800 py-3 px-6 flex items-center justify-center shadow-2xl z-50 backdrop-blur-sm">
      <div
        className="flex items-center gap-2"
        style={{ transform: `scale(${wordPop})` }}
      >
        <span className="w-2.5 h-2.5 bg-yellow-400 rounded-sm inline-block animate-ping" />
        <h1 className="font-mono text-4xl font-extrabold text-yellow-400 tracking-widest text-center px-2">
          {formattedWord}
        </h1>
      </div>
    </div>
  );
};
