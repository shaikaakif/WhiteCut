export type AspectRatio = '9:16' | '1:1' | '16:9' | '3:4';
export type ExportResolution = 'HD' | '2K' | '4K';
export type ExportFrameRate = 24 | 30 | 60;
export type ExportBitrate = 'standard' | 'high' | 'ultra';

export interface WordTimestamp {
  word: string;
  start: number; // in seconds (float)
  end: number;   // in seconds (float)
  confidence?: number;
}

export interface TranscriptionPayload {
  words: WordTimestamp[];
  fullText: string;
  duration: number;
  detectedLanguage?: string;
  inferredTitle?: string;
  inferredTag?: string;
}

export type EditorialTheme = 'vox-split' | 'editorial-card' | 'kinetic-focus';

export interface RemotionCompositionProps {
  videoSrc: string;
  transcriptionData: WordTimestamp[];
  theme?: EditorialTheme;
  aspectRatio?: AspectRatio;
  titleText?: string;
  stepNumber?: number;
  archiveTagText?: string;
  enableGrayscaleFootage?: boolean;
  enablePaperTexture?: boolean;
  activeCutoutImage?: string;
  userPrompt?: string;
}

export interface ProgressLog {
  timestamp: string;
  message: string;
  status: 'pending' | 'active' | 'done';
}

export interface RenderState {
  status: 'idle' | 'processing' | 'ready' | 'exporting' | 'completed' | 'error';
  progress: number; // 0 to 100
  statusMessage: string;
  estimatedSecondsLeft: number;
  logs: ProgressLog[];
  downloadUrl?: string;
  error?: string;
}
