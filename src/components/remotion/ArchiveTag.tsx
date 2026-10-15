import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface ArchiveTagProps {
  label: string;
  sublabel?: string;
  delayFrames?: number;
}

export const ArchiveTag: React.FC<ArchiveTagProps> = ({
  label,
  sublabel,
  delayFrames = 5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: { damping: 14, mass: 0.7 },
  });

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-stone-950 font-mono text-xs font-black tracking-widest uppercase border border-stone-900 shadow-sm"
      style={{
        transform: `scale(${pop})`,
        opacity: pop,
      }}
    >
      <span className="w-2 h-2 rounded-full bg-stone-950 animate-pulse" />
      <span>{label}</span>
      {sublabel && (
        <span className="border-l border-stone-950 pl-2 text-[10px] text-stone-800">
          {sublabel}
        </span>
      )}
    </div>
  );
};
