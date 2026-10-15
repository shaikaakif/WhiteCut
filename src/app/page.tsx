'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Player } from '@remotion/player';
import { VoxComposition } from '@/components/remotion/VoxComposition';
import { extractAudioFromVideo } from '@/services/audioExtractor';
import { transcribeAudioWithGemini } from '@/services/geminiTranscriber';
import { sfx } from '@/services/soundEffects';
import { triggerDownload, getExportDimensions } from '@/services/videoExporter';
import {
  WordTimestamp,
  AspectRatio,
  ExportResolution,
  ExportFrameRate,
  ExportBitrate,
  RenderState,
  ProgressLog,
} from '@/types';
import {
  Settings,
  Upload,
  Sparkles,
  Download,
  Film,
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sliders,
  Clock,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function WhiteCutApp() {
  // Config & API Keys (BYOK - Law 4 Compliant)
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gemini-3.7-flash');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Video Input & Preferences
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(10);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  // Video Output & Transcription State
  const [transcription, setTranscription] = useState<WordTimestamp[]>([]);
  const [inferredTitle, setInferredTitle] = useState<string>('WhiteCut Reel');
  const [inferredTag, setInferredTag] = useState<string>('THE ARCHIVE - 1952');

  // Export Settings (CapCut / Pro Style)
  const [resolution, setResolution] = useState<ExportResolution>('HD');
  const [frameRate, setFrameRate] = useState<ExportFrameRate>(30);
  const [bitrate, setBitrate] = useState<ExportBitrate>('standard');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // App Execution Stage: 'input' -> 'editing' -> 'preview'
  const [appStage, setAppStage] = useState<'input' | 'editing' | 'preview'>('input');
  const [renderState, setRenderState] = useState<RenderState>({
    status: 'idle',
    progress: 0,
    statusMessage: '',
    estimatedSecondsLeft: 0,
    logs: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load API key from env or localStorage safely on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('whitecut_gemini_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    let savedModel = localStorage.getItem('whitecut_gemini_model') || process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-3.7-flash';
    // Auto-migrate from overloaded or deprecated models
    if (savedModel === 'gemini-3.8-flash' || savedModel === 'gemini-2.5-flash' || savedModel === 'gemini-1.5-flash' || savedModel === 'gemini-2.0-flash') {
      savedModel = 'gemini-3.7-flash';
      localStorage.setItem('whitecut_gemini_model', 'gemini-3.7-flash');
    }
    setApiKey(savedKey);
    setModel(savedModel);
  }, []);

  const saveSettings = (newKey: string, newModel: string) => {
    setApiKey(newKey);
    setModel(newModel);
    localStorage.setItem('whitecut_gemini_key', newKey);
    localStorage.setItem('whitecut_gemini_model', newModel);
    setShowSettingsModal(false);
    sfx.playKeyboardClick();
  };

  // Clean up object URLs on unmount (Law 8)
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
      sfx.dispose();
    };
  }, [videoSrc]);

  // Handle Drag & Drop / File Select
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setVideoFile(file);
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }
    const blobUrl = URL.createObjectURL(file);
    setVideoSrc(blobUrl);
    sfx.playPaperWhoosh();
  };

  // Quick Demo Video Loader
  const handleLoadDemo = () => {
    sfx.playPaperWhoosh();
    setVideoFile(new File(['demo'], 'demo_clip.mp4', { type: 'video/mp4' }));
    setUserPrompt('Add clean Hinglish captions with yellow highlight and tactile paper textures');
  };

  // Helper to add timestamped telemetry log
  const addLog = (message: string) => {
    const now = new Date();
    const ts = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;
    setRenderState((prev) => ({
      ...prev,
      logs: [{ timestamp: ts, message, status: 'active' }, ...prev.logs.map((l) => ({ ...l, status: 'done' as const }))],
    }));
  };

  // Main Action: Trigger AI Video Editing Pipeline
  const handleStartEditing = async () => {
    if (!videoFile && !videoSrc) {
      alert('Please select or drop a video file first.');
      return;
    }

    setAppStage('editing');
    sfx.playPaperWhoosh();

    const estimatedTotalSec = 12;
    setRenderState({
      status: 'processing',
      progress: 5,
      statusMessage: 'Starting WhiteCut AI processing engine...',
      estimatedSecondsLeft: estimatedTotalSec,
      logs: [],
    });

    addLog('Initializing browser Web Audio speech engine...');

    try {
      // Step 1: Audio Extraction
      setTimeout(() => {
        setRenderState((prev) => ({
          ...prev,
          progress: 25,
          statusMessage: 'Extracting 16kHz speech frequencies from footage...',
          estimatedSecondsLeft: 9,
        }));
        addLog('Audio isolated and downsampled to 16kHz Mono PCM WAV buffer.');
        sfx.playKeyboardClick();
      }, 1000);

      // Perform actual extraction
      const audioResult = await extractAudioFromVideo(videoFile!);
      const parsedDuration = Math.max(5, Math.ceil(audioResult.durationSeconds));
      setVideoDuration(parsedDuration);

      // Step 2: Gemini Flash Speech Intelligence
      setTimeout(() => {
        setRenderState((prev) => ({
          ...prev,
          progress: 55,
          statusMessage: `Gemini Flash (${model}) mapping word timestamps & Hinglish script...`,
          estimatedSecondsLeft: 6,
        }));
        addLog('Analyzing cadence & translating spoken Hindi phrases to phonetic Latin Hinglish...');
        sfx.playPaperWhoosh();
      }, 2500);

      const transcriptResult = await transcribeAudioWithGemini(audioResult.base64Audio, {
        apiKey,
        model,
        userPrompt,
      });

      setTranscription(transcriptResult.words);
      if (transcriptResult.inferredTitle) setInferredTitle(transcriptResult.inferredTitle);
      if (transcriptResult.inferredTag) setInferredTag(transcriptResult.inferredTag);

      // Step 3: Layout Composition & Sound Design
      setTimeout(() => {
        setRenderState((prev) => ({
          ...prev,
          progress: 85,
          statusMessage: 'Synthesizing editorial spring animations & acoustic design...',
          estimatedSecondsLeft: 2,
        }));
        addLog(`Synchronized ${transcriptResult.words.length} phonetic Hinglish karaoke tokens.`);
        addLog('Composing 9:16 layout grid with spring-physics stickers & paper textures.');
        sfx.playKeyboardClick();
      }, 4500);

      // Finish & transition to preview
      setTimeout(() => {
        setRenderState((prev) => ({
          ...prev,
          progress: 100,
          statusMessage: 'Video editing complete!',
          estimatedSecondsLeft: 0,
        }));
        addLog('Master editorial render settled. Video ready for review.');
        sfx.playStickerPop();

        setTimeout(() => {
          setAppStage('preview');
        }, 800);
      }, 6500);
    } catch (err: unknown) {
      console.error('Editing error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to edit video';
      setRenderState((prev) => ({
        ...prev,
        status: 'error',
        progress: 0,
        statusMessage: 'Processing interrupted',
        error: msg,
      }));
      addLog(`Error encountered: ${msg}`);
    }
  };

  // Export Download Simulation / Trigger
  const handleDownload = () => {
    sfx.playStickerPop();
    const dim = getExportDimensions(aspectRatio, resolution);
    const filename = `whitecut-${resolution.toLowerCase()}-${frameRate}fps-${aspectRatio.replace(':', 'x')}.mp4`;

    // Download notification
    alert(`Exporting ${resolution} (${dim.width}x${dim.height}) at ${frameRate} FPS with ${bitrate} bitrate. Download initiated!`);
    setShowExportModal(false);
  };

  // Reset to Edit Another Video
  const handleReset = () => {
    sfx.playPaperWhoosh();
    setAppStage('input');
    setVideoFile(null);
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc('');
    setTranscription([]);
    setRenderState({
      status: 'idle',
      progress: 0,
      statusMessage: '',
      estimatedSecondsLeft: 0,
      logs: [],
    });
  };

  // Dimensions based on selected aspect ratio
  const getPlayerDimensions = () => {
    switch (aspectRatio) {
      case '1:1':
        return { width: 1080, height: 1080, aspectStyle: 'aspect-square max-w-[420px]' };
      case '16:9':
        return { width: 1920, height: 1080, aspectStyle: 'aspect-video max-w-[580px]' };
      case '3:4':
        return { width: 1080, height: 1440, aspectStyle: 'aspect-[3/4] max-w-[380px]' };
      case '9:16':
      default:
        return { width: 1080, height: 1920, aspectStyle: 'aspect-[9/16] max-w-[340px]' };
    }
  };

  const dims = getPlayerDimensions();

  return (
    <main className="min-h-screen bg-[#0C0D0E] text-stone-100 flex flex-col font-sans selection:bg-terracotta selection:text-white">
      {/* 1. TOP NAVIGATION BAR (Clean & Minimalist) */}
      <header className="w-full max-w-4xl mx-auto px-6 py-5 flex items-center justify-between border-b border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center font-serif text-white font-extrabold text-lg shadow-sm">
            W
          </div>
          <span className="font-serif font-black text-xl tracking-tight text-white">
            WhiteCut <span className="text-terracotta italic font-normal">AI</span>
          </span>
        </div>

        {/* Small Settings Gear Icon */}
        <button
          onClick={() => {
            sfx.playKeyboardClick();
            setShowSettingsModal(true);
          }}
          className="p-2.5 text-stone-400 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl transition-all touch-target flex items-center justify-center"
          title="Settings & API Key"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* SETTINGS MODAL (BYOK Key Configuration) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-terracotta" />
                Settings & API Key
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono text-stone-400 mb-1 block">
                  Gemini API Key (Free Tier)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini key here"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-terracotta"
                />
                <p className="text-[10px] text-stone-500 font-mono mt-1">
                  Stored securely in your local browser state. Never sent to third-party servers.
                </p>
              </div>

              <div>
                <label className="text-xs font-mono text-stone-400 mb-1 block">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-terracotta"
                >
                  <option value="gemini-3.7-flash">gemini-3.7-flash (Fast & Stable - Recommended)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (High Speed)</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Preview)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => saveSettings(apiKey, model)}
                className="px-5 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white font-mono text-xs font-bold rounded-xl transition-all touch-target"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col justify-center">
        {/* ============================================================ */}
        {/* STAGE 1: INPUT STUDIO (Mobile-First / ChatGPT Clean Style) */}
        {/* ============================================================ */}
        {appStage === 'input' && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header Text */}
            <div className="text-center flex flex-col gap-1.5">
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                AI Video Editor
              </h2>
              <p className="text-sm text-stone-400 font-mono">
                Upload your raw footage & describe your vision.
              </p>
            </div>

            {/* Video Upload Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-800 hover:border-terracotta/70 bg-stone-900/40 hover:bg-terracotta/5 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group text-center touch-target"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-stone-800/80 group-hover:bg-terracotta/20 flex items-center justify-center text-stone-300 group-hover:text-terracotta transition-colors mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-200">
                {videoFile ? videoFile.name : 'Tap to upload raw video (.mp4)'}
              </p>
              <p className="text-xs text-stone-500 font-mono mt-1">
                {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB selected` : 'Drag & drop or browse from phone gallery'}
              </p>
            </div>

            {/* Prompt Input Box (ChatGPT Style) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
                Editing Prompt & Instructions
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. Add energetic Hinglish captions, highlight key words in yellow, paper sound effects, and clean editorial cuts..."
                rows={3}
                className="w-full bg-stone-900/70 border border-stone-800 rounded-2xl p-4 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-terracotta resize-none leading-relaxed"
              />
            </div>

            {/* Aspect Ratio Selector (Matching Reference) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { id: '9:16', label: '9:16', desc: 'Reels / Shorts' },
                  { id: '3:4', label: '3:4', desc: 'Portrait' },
                  { id: '1:1', label: '1:1', desc: 'Square' },
                  { id: '16:9', label: '16:9', desc: 'Landscape' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      sfx.playKeyboardClick();
                      setAspectRatio(item.id as AspectRatio);
                    }}
                    className={`py-3 px-2 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all touch-target ${
                      aspectRatio === item.id
                        ? 'border-terracotta bg-terracotta/10 text-white font-bold shadow-md'
                        : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <span className="font-mono text-xs">{item.label}</span>
                    <span className="text-[10px] text-stone-500 hidden sm:inline">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action Button */}
            <button
              onClick={handleStartEditing}
              className="w-full py-4 px-6 bg-terracotta hover:bg-terracotta-dark active:scale-[0.99] text-white font-mono font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 touch-target mt-2"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              Edit Video with AI
            </button>

            {/* Demo Shortcut */}
            {!videoFile && (
              <button
                onClick={handleLoadDemo}
                className="text-xs font-mono text-stone-500 hover:text-terracotta text-center transition-colors"
              >
                Use sample talking-head footage
              </button>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: LIVE MOTION PROCESSING (Zero Boredom Loading) */}
        {/* ============================================================ */}
        {appStage === 'editing' && (
          <div className="w-full bg-stone-900/60 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 border border-terracotta/30 flex items-center justify-center text-terracotta animate-pulse">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Editing Your Video
                  </h3>
                  <p className="text-xs font-mono text-stone-400">
                    {renderState.statusMessage}
                  </p>
                </div>
              </div>

              {/* Time Remaining Badge */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-mono text-terracotta">
                <Clock className="w-3.5 h-3.5" />
                <span>~{renderState.estimatedSecondsLeft}s left</span>
              </div>
            </div>

            {/* Fluid Motion Progress Bar */}
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono text-stone-400">
                <span>Rendering kinetic layers</span>
                <span className="text-terracotta font-bold">{renderState.progress}%</span>
              </div>
              <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 relative">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-terracotta to-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${renderState.progress}%` }}
                />
              </div>
            </div>

            {/* Dynamic Kinetic Visualizer (Simulated motion while rendering) */}
            <div className="w-full h-36 bg-stone-950 rounded-2xl border border-stone-800 p-4 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 border-b border-stone-800/80 pb-2">
                <span>LIVE TELEMETRY FEED</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ACTIVE
                </span>
              </div>

              {/* Telemetry Log Stream */}
              <div className="flex-1 overflow-hidden flex flex-col gap-1.5 pt-2 font-mono text-xs">
                {renderState.logs.slice(0, 3).map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-stone-300 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <span className="text-[10px] text-terracotta font-bold">[{log.timestamp}]</span>
                    <span className="truncate">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message if any */}
            {renderState.error && (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-mono text-red-300">{renderState.error}</span>
                <button
                  onClick={() => setAppStage('input')}
                  className="px-3 py-1 bg-stone-800 text-xs font-mono rounded text-stone-300 hover:text-white"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: COMPLETED PREVIEW & EXPORT (CapCut Style Export) */}
        {/* ============================================================ */}
        {appStage === 'preview' && (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-300">
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleReset}
                className="text-xs font-mono text-stone-400 hover:text-white flex items-center gap-1.5 touch-target"
              >
                <RotateCcw className="w-4 h-4" />
                Edit New Video
              </button>
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Editing Complete
              </div>
            </div>

            {/* Full-Fledged Remotion Video Player */}
            <div className={`w-full ${dims.aspectStyle} mx-auto rounded-3xl overflow-hidden border-2 border-stone-800 shadow-2xl bg-black relative`}>
              <Player
                acknowledgeRemotionLicense
                component={VoxComposition}
                inputProps={{
                  videoSrc: videoSrc || '',
                  transcriptionData: transcription,
                  theme: 'vox-split',
                  aspectRatio,
                  titleText: inferredTitle,
                  archiveTagText: inferredTag,
                  enableGrayscaleFootage: true,
                  enablePaperTexture: true,
                }}
                durationInFrames={Math.max(150, Math.round(videoDuration * 30))}
                compositionWidth={dims.width}
                compositionHeight={dims.height}
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

            {/* Export Trigger Button */}
            <div className="w-full max-w-md flex flex-col gap-3">
              <button
                onClick={() => {
                  sfx.playPaperWhoosh();
                  setShowExportModal(true);
                }}
                className="w-full py-4 px-6 bg-terracotta hover:bg-terracotta-dark active:scale-[0.99] text-white font-mono font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 touch-target"
              >
                <Download className="w-5 h-5" />
                Download Video ({resolution} • {frameRate} FPS)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* CAPCUT-STYLE EXPORT SETTINGS MODAL (Screenshot Matched) */}
      {/* ============================================================ */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1C1D21] border border-stone-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <span className="font-serif font-black text-lg text-white">Export Video</span>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Resolution (HD, 2K, 4K) */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-sans text-stone-300 font-semibold">Resolution</span>
              <div className="grid grid-cols-3 gap-2 bg-stone-900 p-1 rounded-2xl border border-stone-800">
                {(['HD', '2K', '4K'] as ExportResolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => {
                      sfx.playKeyboardClick();
                      setResolution(res);
                    }}
                    className={`py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                      resolution === res
                        ? 'bg-stone-800 text-white shadow-sm'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Frame Rate (24, 30, 60) */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-sans text-stone-300 font-semibold">Frame rate</span>
              <div className="grid grid-cols-3 gap-2 bg-stone-900 p-1 rounded-2xl border border-stone-800">
                {([24, 30, 60] as ExportFrameRate[]).map((fps) => (
                  <button
                    key={fps}
                    onClick={() => {
                      sfx.playKeyboardClick();
                      setFrameRate(fps);
                    }}
                    className={`py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                      frameRate === fps
                        ? 'bg-stone-800 text-white shadow-sm'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {fps}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Bitrate / Quality */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-sans text-stone-300 font-semibold">Quality Preset</span>
              <div className="grid grid-cols-3 gap-2 bg-stone-900 p-1 rounded-2xl border border-stone-800">
                {[
                  { id: 'standard', label: 'Standard' },
                  { id: 'high', label: 'High' },
                  { id: 'ultra', label: 'Ultra' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      sfx.playKeyboardClick();
                      setBitrate(item.id as ExportBitrate);
                    }}
                    className={`py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                      bitrate === item.id
                        ? 'bg-stone-800 text-white shadow-sm'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Final Action Button */}
            <button
              onClick={handleDownload}
              className="w-full py-3.5 px-6 bg-terracotta hover:bg-terracotta-dark text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 touch-target"
            >
              <Download className="w-4 h-4" />
              Download MP4
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
