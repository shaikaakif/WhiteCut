import React from 'react';
import { AbsoluteFill, Video, useCurrentFrame, spring } from 'remotion';
import { RemotionCompositionProps } from '@/types';
import { StickerCutout } from './StickerCutout';
import { ArchiveTag } from './ArchiveTag';
import { MacWindowCard } from './MacWindowCard';
import { SegmentedProgressBar } from './SegmentedProgressBar';
import { KineticCaptions } from './KineticCaptions';

export const VoxComposition: React.FC<RemotionCompositionProps> = ({
  videoSrc,
  transcriptionData = [],
  theme = 'vox-ashok',
  titleText = 'Upload everything',
  stepNumber = 4,
  archiveTagText = 'THE ARCHIVE - 1952',
  enableGrayscaleFootage = true,
  enablePaperTexture = true,
  activeCutoutImage,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Global layout pop-in
  const layoutSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  // JAYANT EDITORIAL THEME
  if (theme === 'jayant-editorial') {
    return (
      <AbsoluteFill className="paper-texture flex flex-col justify-between overflow-hidden">
        {/* Subtle Noise / Grain Layer */}
        <div className="absolute inset-0 bg-stone-900/5 mix-blend-multiply pointer-events-none" />

        {/* Top: Progress Bar */}
        <div className="z-20 w-full">
          <SegmentedProgressBar totalSegments={6} activeSegment={stepNumber - 1} />
        </div>

        {/* Center: Floating Mac Card */}
        <div className="z-20 flex-1 flex items-center justify-center py-6">
          <MacWindowCard
            title={titleText}
            stepNumber={stepNumber}
            subtitle="What are we editing today?"
          />
        </div>

        {/* Lower: Kinetic Word Caption */}
        <div className="z-20 w-full mb-8">
          <KineticCaptions
            transcriptionData={transcriptionData}
            variant="terracotta-minimal"
            uppercase={false}
          />
        </div>

        {/* Bottom PiP Video Card */}
        {videoSrc && (
          <div className="absolute bottom-6 right-6 w-36 h-48 rounded-xl overflow-hidden border-2 border-white shadow-tactile z-30">
            <Video
              src={videoSrc}
              className={`w-full h-full object-cover ${
                enableGrayscaleFootage ? 'grayscale contrast-125' : ''
              }`}
            />
          </div>
        )}
      </AbsoluteFill>
    );
  }

  // ASHOK REDDY VOX SPLIT SCREEN THEME (DEFAULT)
  return (
    <AbsoluteFill className="bg-[#F4EFE6] flex flex-col overflow-hidden">
      {/* Texture Background Canvas */}
      {enablePaperTexture && (
        <div className="absolute inset-0 blueprint-grid opacity-60 mix-blend-multiply pointer-events-none" />
      )}

      {/* TOP SECTION (45%): Editorial Cutout Display & Typography */}
      <div
        className="relative w-full h-[45%] flex flex-col items-center justify-center p-8 overflow-hidden"
        style={{ transform: `scale(${layoutSpring})` }}
      >
        {/* Vintage Blueprint Year & Header */}
        <div className="absolute top-8 left-8 flex flex-col">
          <span className="font-serif text-6xl font-black text-stone-900 tracking-tighter">
            1952
          </span>
          <span className="font-mono text-xs text-stone-600 tracking-widest uppercase mt-1">
            DOCUMENTARY ARCHIVE
          </span>
        </div>

        {/* Vintage Archive Tag Badge */}
        <div className="absolute top-8 right-8">
          <ArchiveTag label={archiveTagText} />
        </div>

        {/* Tactile Sticker Cutout Element */}
        <div className="w-full h-full flex items-center justify-center pt-10">
          <StickerCutout
            imageSrc={activeCutoutImage}
            outlineColor="terracotta"
            alt="Editorial Cutout Asset"
          />
        </div>
      </div>

      {/* MIDDLE SECTION (10%): High-Contrast Word-by-Word Subtitle Container */}
      <div className="relative w-full h-[10%] flex items-center justify-center z-50">
        <KineticCaptions
          transcriptionData={transcriptionData}
          variant="monospace-strip"
          uppercase={true}
        />
      </div>

      {/* BOTTOM SECTION (45%): Grayscale Talking-Head Footage */}
      <div className="relative w-full h-[45%] overflow-hidden border-t-2 border-stone-800 bg-stone-900">
        {videoSrc ? (
          <Video
            src={videoSrc}
            className={`w-full h-full object-cover ${
              enableGrayscaleFootage ? 'grayscale contrast-125' : ''
            } scale-105`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 font-mono text-sm">
            <span>[Talking-Head Source Footage Placeholder]</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
