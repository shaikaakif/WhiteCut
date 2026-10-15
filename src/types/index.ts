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
}

export type EditorialTheme = 'vox-ashok' | 'jayant-editorial' | 'split-surreal' | 'minimal-monospace';

export interface StickerAsset {
  id: string;
  src: string;
  alt: string;
  title?: string;
  archiveDate?: string;
  outlineColor?: string;
}

export interface RemotionCompositionProps {
  videoSrc: string;
  transcriptionData: WordTimestamp[];
  theme: EditorialTheme;
  titleText?: string;
  stepNumber?: number;
  archiveTagText?: string;
  enableGrayscaleFootage?: boolean;
  enablePaperTexture?: boolean;
  enableSFX?: boolean;
  activeCutoutImage?: string;
  customHeading?: string;
  subheading?: string;
}

export interface RenderState {
  status: 'idle' | 'extracting-audio' | 'transcribing' | 'ready' | 'rendering' | 'completed' | 'error';
  progress: number; // 0 to 100
  statusMessage: string;
  downloadUrl?: string;
  error?: string;
}
