import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface StickerCutoutProps {
  imageSrc?: string;
  alt?: string;
  outlineColor?: 'white' | 'terracotta' | 'gold';
  delayFrames?: number;
  className?: string;
}

export const StickerCutout: React.FC<StickerCutoutProps> = ({
  imageSrc,
  alt = 'Visual Anchor',
  outlineColor = 'white',
  delayFrames = 0,
  className = '',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Snappy spring entrance with slight overshoot
  const scaleSpring = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: {
      damping: 12,
      mass: 0.6,
      stiffness: 140,
    },
  });

  // Eased subtle Ken Burns drift
  const kenBurns = interpolate(
    frame,
    [0, durationInFrames],
    [1.0, 1.05],
    { extrapolateRight: 'clamp' }
  );

  const outlineFilterClass =
    outlineColor === 'terracotta'
      ? 'sticker-cutout-terracotta'
      : outlineColor === 'gold'
      ? 'sticker-cutout-gold'
      : 'sticker-cutout-white';

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        transform: `scale(${scaleSpring * kenBurns})`,
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          className={`max-h-full max-w-full object-contain ${outlineFilterClass}`}
        />
      ) : (
        /* Fallback decorative cutout collage shape if no custom image is supplied */
        <div className={`p-8 bg-stone-900 border-4 border-white rounded-2xl shadow-tactile ${outlineFilterClass}`}>
          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-terracotta to-amber-600 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-5xl mb-2">🏛️</span>
            <span className="font-serif italic text-white text-lg font-bold">1952 ARCHIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};
