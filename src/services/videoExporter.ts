/**
 * Client-Side GPU-Accelerated Video Exporter
 * Compiles canvas frames directly into high-quality MP4 using WebCodecs & mp4-muxer
 * completely inside the user's browser without sending any video data to cloud servers.
 */

import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { AspectRatio, ExportResolution, ExportFrameRate, ExportBitrate } from '@/types';

export interface RenderProgressCallback {
  (progressPercent: number, statusText: string): void;
}

export function getExportDimensions(
  aspectRatio: AspectRatio,
  resolution: ExportResolution
): { width: number; height: number } {
  const baseScale = resolution === '4K' ? 2 : resolution === '2K' ? 1.333 : 1;

  switch (aspectRatio) {
    case '9:16':
      return {
        width: Math.round(1080 * baseScale),
        height: Math.round(1920 * baseScale),
      };
    case '1:1':
      return {
        width: Math.round(1080 * baseScale),
        height: Math.round(1080 * baseScale),
      };
    case '16:9':
      return {
        width: Math.round(1920 * baseScale),
        height: Math.round(1080 * baseScale),
      };
    case '3:4':
      return {
        width: Math.round(1080 * baseScale),
        height: Math.round(1440 * baseScale),
      };
  }
}

export function getBitrateValue(bitrate: ExportBitrate, resolution: ExportResolution): number {
  const multiplier = resolution === '4K' ? 3.5 : resolution === '2K' ? 2 : 1;
  switch (bitrate) {
    case 'ultra':
      return Math.round(18_000_000 * multiplier);
    case 'high':
      return Math.round(12_000_000 * multiplier);
    case 'standard':
    default:
      return Math.round(8_000_000 * multiplier);
  }
}

export function triggerDownload(blob: Blob, filename = 'whitecut-reel.mp4') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function renderCanvasToMp4(
  canvas: HTMLCanvasElement,
  audioBlob: Blob | null,
  durationSeconds: number,
  fps: ExportFrameRate = 30,
  onProgress?: RenderProgressCallback
): Promise<Blob> {
  const width = canvas.width;
  const height = canvas.height;
  const totalFrames = Math.max(1, Math.round(durationSeconds * fps));

  // Verify WebCodecs support
  if (typeof window !== 'undefined' && 'VideoEncoder' in window) {
    try {
      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: {
          codec: 'avc',
          width,
          height,
        },
        fastStart: 'in-memory',
      });

      let encodedFramesCount = 0;

      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => {
          muxer.addVideoChunk(chunk, meta);
        },
        error: (e) => {
          console.error('VideoEncoder error:', e);
        },
      });

      videoEncoder.configure({
        codec: 'avc1.4d002a', // H.264
        width,
        height,
        bitrate: 8_000_000,
        framerate: fps,
      });

      const frameDurationMicroseconds = (1 / fps) * 1_000_000;

      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        const timestampMicroseconds = frameIndex * frameDurationMicroseconds;
        const videoFrame = new VideoFrame(canvas, {
          timestamp: timestampMicroseconds,
          duration: frameDurationMicroseconds,
        });

        const keyFrame = frameIndex % (fps * 2) === 0;
        videoEncoder.encode(videoFrame, { keyFrame });
        videoFrame.close();

        encodedFramesCount++;
        if (onProgress) {
          const percent = Math.round((encodedFramesCount / totalFrames) * 90);
          onProgress(percent, `Compiling frame ${encodedFramesCount} of ${totalFrames}...`);
        }

        await new Promise((r) => setTimeout(r, 0));
      }

      await videoEncoder.flush();
      videoEncoder.close();
      muxer.finalize();

      if (onProgress) {
        onProgress(100, 'Compilation finished! Finalizing MP4...');
      }

      return new Blob([target.buffer], { type: 'video/mp4' });
    } catch (webCodecsErr) {
      console.warn('WebCodecs execution failed, falling back to MediaRecorder:', webCodecsErr);
    }
  }

  // Fallback: MediaRecorder stream recording
  return recordStreamFallback(canvas, audioBlob, durationSeconds, onProgress);
}

function recordStreamFallback(
  canvas: HTMLCanvasElement,
  audioBlob: Blob | null,
  durationSeconds: number,
  onProgress?: RenderProgressCallback
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = canvas.captureStream(30);

      if (audioBlob) {
        const audioCtx = new AudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.start(0);

        dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      }

      const mimeType = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
        ? 'video/mp4'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8_000_000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: mimeType });
        if (onProgress) onProgress(100, 'Video ready!');
        resolve(outputBlob);
      };

      recorder.onerror = (e) => reject(e);

      recorder.start(100);

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const pct = Math.min(98, Math.round((elapsed / durationSeconds) * 100));
        if (onProgress) onProgress(pct, `Recording canvas stream (${Math.round(elapsed)}s)...`);
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        recorder.stop();
      }, durationSeconds * 1000 + 500);
    } catch (err) {
      reject(err);
    }
  });
}
