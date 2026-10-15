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
  theme = 'vox-split',
  aspectRatio = '9:16',
  titleText = 'WhiteCut Editorial',
  stepNumber = 3,
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

  const isLandscape = aspectRatio === '16:9';

  // THEME: EDITORIAL CARD
  if (theme === 'editorial-card') {
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
            subtitle="Processing spoken intelligence"
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

        {/* Video PiP Card */}
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

  // LANDSCAPE LAYOUT (16:9)
  if (isLandscape) {
    return (
      <AbsoluteFill className="bg-[#F4EFE6] flex flex-row overflow-hidden">
        {enablePaperTexture && (
          <div className="absolute inset-0 blueprint-grid opacity-60 mix-blend-multiply pointer-events-none" />
        )}

        {/* Left Side: Video (55%) */}
        <div className="w-[55%] h-full relative border-r-2 border-stone-800 bg-stone-900 overflow-hidden">
          {videoSrc ? (
            <Video
              src={videoSrc}
              className={`w-full h-full object-cover ${
                enableGrayscaleFootage ? 'grayscale contrast-125' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-500 font-mono text-xs">
              [Source Footage]
            </div>
          )}

          {/* Bottom Captions Overlay */}
          <div className="absolute bottom-6 left-0 w-full z-40">
            <KineticCaptions
              transcriptionData={transcriptionData}
              variant="monospace-strip"
              uppercase={true}
            />
          </div>
        </div>

        {/* Right Side: Editorial Cutout & Title (45%) */}
        <div
          className="w-[45%] h-full flex flex-col justify-between p-8 relative"
          style={{ transform: `scale(${layoutSpring})` }}
        >
          <div className="flex items-center justify-between">
            <ArchiveTag label={archiveTagText} />
            <span className="font-mono text-xs text-stone-500 font-bold uppercase">WhiteCut AI</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <StickerCutout
              imageSrc={activeCutoutImage}
              outlineColor="terracotta"
              alt="Editorial Element"
            />
          </div>

          <div>
            <h2 className="font-serif text-3xl font-black text-stone-900 tracking-tight leading-none">
              {titleText}
            </h2>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // DEFAULT VERTICAL / SQUARE (9:16, 1:1, 3:4) - VOX SPLIT
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
        <div className="absolute top-6 left-6 flex flex-col">
          <span className="font-serif text-5xl font-black text-stone-900 tracking-tighter">
            1952
          </span>
          <span className="font-mono text-[10px] text-stone-600 tracking-widest uppercase mt-0.5">
            DOCUMENTARY ARCHIVE
          </span>
        </div>

        {/* Vintage Archive Tag Badge */}
        <div className="absolute top-6 right-6">
          <ArchiveTag label={archiveTagText} />
        </div>

        {/* Tactile Sticker Cutout Element */}
        <div className="w-full h-full flex items-center justify-center pt-8">
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
            <span>[Source Footage]</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
