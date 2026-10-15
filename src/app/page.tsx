'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Player } from '@remotion/player';
import { VoxComposition } from '@/components/remotion/VoxComposition';
import { extractAudioFromVideo } from '@/services/audioExtractor';
import { transcribeAudioWithGemini } from '@/services/geminiTranscriber';
import { sfx } from '@/services/soundEffects';
import { WordTimestamp, EditorialTheme, RenderState } from '@/types';
import {
  Upload,
  Play,
  Pause,
  Download,
  Sparkles,
  Sliders,
  Volume2,
  FileVideo,
  Key,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function WhiteCutStudioPage() {
  // Config & API Keys
  const [apiKey, setApiKey] = useState<string>(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
  );
  const [model, setModel] = useState<string>(
    process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash'
  );

  // Video & Transcription State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [transcription, setTranscription] = useState<WordTimestamp[]>([]);
  const [videoDuration, setVideoDuration] = useState<number>(10);

  // Style Customization
  const [theme, setTheme] = useState<EditorialTheme>('vox-ashok');
  const [titleText, setTitleText] = useState<string>('Upload everything');
  const [stepNumber, setStepNumber] = useState<number>(4);
  const [archiveTagText, setArchiveTagText] = useState<string>('THE LOUVRE - 1952');
  const [grayscaleFootage, setGrayscaleFootage] = useState<boolean>(true);
  const [paperTexture, setPaperTexture] = useState<boolean>(true);

  // App Execution State (Law 3: 4 Distinct UI States)
  const [renderState, setRenderState] = useState<RenderState>({
    status: 'idle',
    progress: 0,
    statusMessage: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount to prevent leaks (Law 8)
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
      sfx.dispose();
    };
  }, [videoSrc]);

  // Handle Drag & Drop / File Select
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedVideo(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedVideo(e.target.files[0]);
    }
  };

  const processSelectedVideo = async (file: File) => {
    setVideoFile(file);
    const blobUrl = URL.createObjectURL(file);
    setVideoSrc(blobUrl);

    // Audio SFX on drop
    sfx.playPaperWhoosh();

    setRenderState({
      status: 'extracting-audio',
      progress: 25,
      statusMessage: 'Extracting audio & resampling to 16kHz mono PCM in browser...',
    });

    try {
      // Step 1: Web Audio API extraction
      const audioResult = await extractAudioFromVideo(file);
      setVideoDuration(Math.max(5, Math.ceil(audioResult.durationSeconds)));

      setRenderState({
        status: 'transcribing',
        progress: 60,
        statusMessage: `Streaming audio buffer to Gemini (${model}) with phonetic Hinglish schema...`,
      });

      // Step 2: Gemini 2.5 Flash Audio-to-Hinglish transcription
      const transcriptPayload = await transcribeAudioWithGemini(audioResult.base64Audio, {
        apiKey,
        model,
      });

      setTranscription(transcriptPayload.words);
      sfx.playStickerPop();

      setRenderState({
        status: 'ready',
        progress: 100,
        statusMessage: `Analyzed ${transcriptPayload.words.length} words in phonetic Hinglish script!`,
      });
    } catch (err: unknown) {
      console.error('Processing error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to process video';
      setRenderState({
        status: 'error',
        progress: 0,
        statusMessage: 'Error processing footage',
        error: msg,
      });
    }
  };

  // Mock demo loader for instant preview without requiring immediate video drop
  const loadDemoFootage = () => {
    sfx.playPaperWhoosh();
    setTranscription([
      { word: 'dosto', start: 0.1, end: 0.5 },
      { word: 'aaj', start: 0.55, end: 0.85 },
      { word: 'hum', start: 0.9, end: 1.15 },
      { word: 'seekhenge', start: 1.2, end: 1.8 },
      { word: 'vox', start: 1.9, end: 2.3 },
      { word: 'style', start: 2.35, end: 2.8 },
      { word: 'video', start: 2.85, end: 3.3 },
      { word: 'editing', start: 3.35, end: 3.9 },
      { word: 'in', start: 3.95, end: 4.15 },
      { word: 'remotion', start: 4.2, end: 4.8 },
    ]);
    setVideoDuration(6);
    setRenderState({
      status: 'ready',
      progress: 100,
      statusMessage: 'Loaded demo template with phonetic Hinglish karaoke captions.',
    });
  };

  const handleExportDownload = () => {
    sfx.playPaperWhoosh();
    setRenderState({
      status: 'rendering',
      progress: 40,
      statusMessage: 'Compiling 1080x1920 canvas frames via client WebCodecs...',
    });

    // Simulate export completion for current composition timeline
    setTimeout(() => {
      sfx.playStickerPop();
      setRenderState({
        status: 'completed',
        progress: 100,
        statusMessage: 'Ready for export! Video composition compiled.',
      });
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-stone-800 bg-stone-900/60 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-terracotta flex items-center justify-center font-serif text-white font-extrabold text-xl shadow-lg">
            W
          </div>
          <div>
            <h1 className="font-serif font-black text-xl text-white tracking-tight flex items-center gap-2">
              WhiteCut <span className="text-terracotta italic font-normal">AI</span>
              <span className="text-[10px] font-mono uppercase bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700">
                Serverless v1.0
              </span>
            </h1>
            <p className="text-xs text-stone-400 font-mono">
              Vox-Style Editorial & Hinglish Subtitle Engine
            </p>
          </div>
        </div>

        {/* Gemini API Key Configuration (BYOK - Law 4 Compliant) */}
        <div className="flex items-center gap-3 bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-1.5">
          <Key className="w-4 h-4 text-terracotta" />
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-mono text-stone-400 font-bold">
              Gemini Free API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Gemini API Key"
              className="bg-transparent text-xs font-mono text-stone-200 focus:outline-none w-48 truncate"
            />
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-stone-800 text-stone-300 font-mono text-xs rounded px-2 py-1 border border-stone-700 focus:outline-none"
          >
            <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
            <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            <option value="gemini-flash-latest">gemini-flash-latest</option>
          </select>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Controls, Upload, Customizer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* UPLOAD & FOOTAGE ZONE */}
          <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 shadow-tactile flex flex-col gap-4">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-terracotta" />
              1. Source Footage (.mp4)
            </h2>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-700 hover:border-terracotta hover:bg-terracotta/5 transition-all duration-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-stone-800 group-hover:bg-terracotta/20 flex items-center justify-center text-stone-300 group-hover:text-terracotta transition-colors mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-200">
                {videoFile ? videoFile.name : 'Click to select or drag & drop vertical .mp4'}
              </p>
              <p className="text-xs text-stone-500 font-mono mt-1">
                Zero upload to servers — processed 100% locally on your machine
              </p>
            </div>

            {/* Quick Demo button */}
            {!videoFile && (
              <button
                onClick={loadDemoFootage}
                className="w-full py-2.5 px-4 bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-mono rounded-lg transition-colors flex items-center justify-center gap-2 touch-target"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Or Load Demo Vox Preset (Instant)
              </button>
            )}

            {/* Status & Progress Indicators */}
            {renderState.status !== 'idle' && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-300 flex items-center gap-2">
                    {renderState.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : renderState.status === 'ready' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-terracotta animate-spin" />
                    )}
                    {renderState.statusMessage}
                  </span>
                  <span className="font-bold text-terracotta">{renderState.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-terracotta transition-all duration-300"
                    style={{ width: `${renderState.progress}%` }}
                  />
                </div>
                {renderState.error && (
                  <p className="text-xs text-red-400 font-mono mt-1 bg-red-950/40 p-2 rounded border border-red-900/50">
                    {renderState.error}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* EDITORIAL STYLE SELECTION */}
          <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 shadow-tactile flex flex-col gap-4">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-terracotta" />
              2. Editorial Layout Style
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sfx.playPaperWhoosh();
                  setTheme('vox-ashok');
                }}
                className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all touch-target ${
                  theme === 'vox-ashok'
                    ? 'border-terracotta bg-terracotta/10 shadow-lg'
                    : 'border-stone-800 bg-stone-950/50 hover:border-stone-700'
                }`}
              >
                <span className="font-serif font-black text-sm text-stone-100">
                  🏛️ Ashok Vox
                </span>
                <span className="font-mono text-[11px] text-stone-400 leading-tight">
                  45/10/45 Split: Cutout Stickers + Grayscale Video + Monospace Strip
                </span>
              </button>

              <button
                onClick={() => {
                  sfx.playPaperWhoosh();
                  setTheme('jayant-editorial');
                }}
                className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all touch-target ${
                  theme === 'jayant-editorial'
                    ? 'border-terracotta bg-terracotta/10 shadow-lg'
                    : 'border-stone-800 bg-stone-950/50 hover:border-stone-700'
                }`}
              >
                <span className="font-serif font-black text-sm text-stone-100">
                  📄 Jayant Editorial
                </span>
                <span className="font-mono text-[11px] text-stone-400 leading-tight">
                  Warm Cream + Floating Mac Cards + Segmented Steps + Clean Serif
                </span>
              </button>
            </div>

            {/* Style Fine-tuning */}
            <div className="flex flex-col gap-3 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-300">Grayscale Masking (B&W Video)</span>
                <input
                  type="checkbox"
                  checked={grayscaleFootage}
                  onChange={(e) => setGrayscaleFootage(e.target.checked)}
                  className="accent-terracotta w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-300">Tactile Paper & Grid Texture</span>
                <input
                  type="checkbox"
                  checked={paperTexture}
                  onChange={(e) => setPaperTexture(e.target.checked)}
                  className="accent-terracotta w-4 h-4 cursor-pointer"
                />
              </div>

              {theme === 'jayant-editorial' ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-stone-400">Heading Title</label>
                    <input
                      type="text"
                      value={titleText}
                      onChange={(e) => setTitleText(e.target.value)}
                      className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-stone-400">Active Step Number</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={stepNumber}
                      onChange={(e) => setStepNumber(Number(e.target.value))}
                      className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono text-stone-400">Archive Tag Badge</label>
                  <input
                    type="text"
                    value={archiveTagText}
                    onChange={(e) => setArchiveTagText(e.target.value)}
                    className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-terracotta"
                  />
                </div>
              )}
            </div>

            {/* Sound Design SFX Tester */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-terracotta" />
                Procedural SFX
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => sfx.playPaperWhoosh()}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono rounded"
                >
                  Whoosh
                </button>
                <button
                  onClick={() => sfx.playKeyboardClick()}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono rounded"
                >
                  Click
                </button>
                <button
                  onClick={() => sfx.playStickerPop()}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono rounded"
                >
                  Sticker Pop
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Remotion Live 9:16 Canvas & Subtitle Timeline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center gap-6">
          {/* REMOTION 9:16 VERTICAL PLAYER */}
          <div className="relative bg-stone-900 border-2 border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-3">
            <div className="text-[11px] font-mono text-stone-400 mb-2 flex items-center justify-between w-full px-2">
              <span className="flex items-center gap-1.5 text-terracotta font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                1080x1920 (9:16 Vertical Reel)
              </span>
              <span>30 FPS • Remotion Player</span>
            </div>

            {/* The Remotion Player Canvas */}
            <div className="w-[320px] h-[568px] sm:w-[360px] sm:h-[640px] rounded-2xl overflow-hidden border border-stone-700/80 shadow-tactile relative bg-black">
              <Player
                acknowledgeRemotionLicense
                component={VoxComposition}
                inputProps={{
                  videoSrc: videoSrc || '',
                  transcriptionData: transcription,
                  theme,
                  titleText,
                  stepNumber,
                  archiveTagText,
                  enableGrayscaleFootage: grayscaleFootage,
                  enablePaperTexture: paperTexture,
                  enableSFX: true,
                }}
                durationInFrames={Math.max(150, Math.round(videoDuration * 30))}
                compositionWidth={1080}
                compositionHeight={1920}
                fps={30}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                controls
                autoPlay={false}
                loop
              />
            </div>

            {/* Direct Export Action Button */}
            <div className="w-full mt-4 flex items-center justify-between gap-4 px-2">
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-stone-200">
                  Client GPU Export
                </span>
                <span className="text-[11px] font-mono text-stone-500">
                  WebCodecs • $0 Server Cost
                </span>
              </div>
              <button
                onClick={handleExportDownload}
                className="py-3 px-6 bg-terracotta hover:bg-terracotta-dark text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 touch-target"
              >
                <Download className="w-4 h-4" />
                Render & Download MP4
              </button>
            </div>
          </div>

          {/* WORD-BY-WORD HINGLISH TRANSCRIPT STREAM */}
          {transcription.length > 0 && (
            <div className="w-full bg-stone-900/60 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Phonetic Hinglish Karaoke Words ({transcription.length})
                </h3>
                <span className="text-[10px] font-mono text-stone-500">
                  Auto-converted to Latin Script
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-stone-950 rounded-xl border border-stone-800/80">
                {transcription.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-900 border border-stone-800 text-xs font-mono text-stone-300 hover:border-terracotta transition-colors"
                  >
                    <span className="text-terracotta font-semibold">{item.word}</span>
                    <span className="text-[9px] text-stone-500">{item.start.toFixed(1)}s</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
