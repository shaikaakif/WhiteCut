import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface MacWindowCardProps {
  title?: string;
  subtitle?: string;
  stepNumber?: number;
  highlightWord?: string;
  codeSnippet?: string;
  delayFrames?: number;
}

export const MacWindowCard: React.FC<MacWindowCardProps> = ({
  title = 'Upload everything',
  subtitle = 'What are we editing today?',
  stepNumber = 5,
  codeSnippet,
  delayFrames = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: { damping: 13, mass: 0.7, stiffness: 120 },
  });

  return (
    <div
      className="w-[90%] max-w-md mx-auto flex flex-col items-center"
      style={{
        transform: `scale(${pop}) translateY(${(1 - pop) * 30}px)`,
        opacity: pop,
      }}
    >
      {/* Step Header */}
      <div className="w-full text-left mb-6">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-terracotta">
          Step {stepNumber}
        </span>
        <h2 className="font-serif text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
          {title.split(' ')[0]}{' '}
          <span className="italic font-normal text-terracotta">
            {title.split(' ').slice(1).join(' ') || 'process'}
          </span>
        </h2>
      </div>

      {/* Floating macOS Card Container */}
      <div className="w-full bg-white/95 rounded-2xl border border-stone-200/80 shadow-card-floating p-5 backdrop-blur-md">
        {/* macOS Window Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="font-mono text-[11px] text-stone-400 font-semibold tracking-wide flex items-center gap-1">
            <span className="text-terracotta">✻</span> Claude / Gemini
          </span>
          <div className="w-8" />
        </div>

        {/* Card Body */}
        {codeSnippet ? (
          <div className="py-4 font-mono text-xs text-stone-700 bg-stone-50 rounded-lg p-3 my-2 border border-stone-200/50 leading-relaxed overflow-hidden">
            <div className="flex justify-between items-center text-[10px] text-stone-400 mb-2 border-b border-stone-200/60 pb-1">
              <span>📄 SKILL.md</span>
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">installed</span>
            </div>
            <pre className="whitespace-pre-wrap">{codeSnippet}</pre>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-terracotta text-xl mb-3">
              ✻
            </div>
            <p className="font-sans font-bold text-stone-800 text-base">
              {subtitle}
            </p>
            <div className="flex gap-2 mt-4 text-[11px] font-sans">
              <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-md">📁 Guidance book</span>
              <span className="bg-orange-50 text-terracotta px-2 py-1 rounded-md">🎨 Style refs</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
