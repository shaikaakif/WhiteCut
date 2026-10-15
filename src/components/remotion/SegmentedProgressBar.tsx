import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface SegmentedProgressBarProps {
  totalSegments?: number;
  activeSegment?: number;
}

export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
  totalSegments = 6,
  activeSegment = 3,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Dynamic progress across the video timeline if activeSegment is not manually locked
  const dynamicActive = Math.min(
    totalSegments - 1,
    Math.floor(
      interpolate(frame, [0, durationInFrames], [0, totalSegments], {
        extrapolateRight: 'clamp',
      })
    )
  );

  const currentStep = activeSegment ?? dynamicActive;

  return (
    <div className="w-full flex items-center gap-1.5 px-6 pt-6">
      {Array.from({ length: totalSegments }).map((_, index) => {
        const isFilled = index <= currentStep;
        return (
          <div
            key={index}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: isFilled ? '#E06D53' : 'rgba(224, 109, 83, 0.2)',
            }}
          />
        );
      })}
    </div>
  );
};
