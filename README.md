# 🎬 WhiteCut AI

> **Serverless AI Video Editing Engine (Vox-Style & Phonetic Hinglish Captions)**  
> 100% free-to-operate, client-side video processing web application built with Next.js 15, Remotion, Tailwind CSS, and Gemini 2.5 Flash.

---

## 🌟 Key Features

- **Zero-Cloud Backend Cost:** Audio extraction, transcription mapping, and video composition run 100% locally inside the user's browser canvas.
- **Multimodal Audio Extraction:** Uses native browser `AudioContext` and `OfflineAudioContext` to rip audio from `.mp4` into a downsampled 16kHz mono `.wav` buffer in seconds.
- **Phonetic Hinglish Transcriptions:** Automatically converts spoken Hindi / Urdu into phonetic Latin script (*"aap kaise hain"*, *"dosto aaj hum baat karenge"*) with millisecond-accurate word timestamps via Gemini 2.5 Flash Free Tier.
- **Tactile Editorial Visual Grammar:**
  - **Ashok Reddy Vox Split:** 45/10/45 vertical split with 3D sticker cutouts, paper textures, vintage archive tags (*"1952"*), and grayscale talking-head video.
  - **Jayant Clean Editorial:** Warm cream background (`#F4EFE6`), segmented progress bars, and floating spring-animated macOS cards with drop shadows.
- **Procedural Sound Design:** Web Audio API generated **Paper Whoosh**, **Keyboard Click**, and **Sticker Pop / Thud** sound effects.
- **Local GPU Video Export:** Browser-native WebCodecs compiling 1080x1920 30FPS MP4 reels directly to disk.

---

## 🏗️ Tech Stack

| Layer | Technology | Cost |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) + Tailwind CSS | Free (Vercel / Netlify) |
| **Video Engine** | Remotion (`@remotion/player`, `remotion`) | Open Source ($0) |
| **AI Intelligence** | Gemini 2.5 Flash (`@google/genai`) | Free Tier (Up to 15 RPM) |
| **Audio Processing**| Web Audio API (Browser Native) | $0 |
| **Compiler / Export**| WebCodecs + `mp4-muxer` | $0 (Client GPU) |

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/shaikaakif/WhiteCut.git
cd WhiteCut

# Install dependencies
npm install

# Configure environment variables
# Create .env.local with:
# NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
# NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-flash

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link and deploy preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: Vercel Web Dashboard (One-Click Git Import)
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import the repository: `shaikaakif/WhiteCut`.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Your Gemini API Key
   - `NEXT_PUBLIC_GEMINI_MODEL`: `gemini-2.5-flash`
4. Click **Deploy**.

---

## 📜 Governance
Built under the governing principles of the **AI Engineering Constitution** and **Master AI Engineering SOP (v2.0)**.
