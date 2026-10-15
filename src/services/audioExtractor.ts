/**
 * Audio Extraction Service (Client-Side)
 * Uses browser-native AudioContext and OfflineAudioContext to rip audio from video files,
 * downsample to 16kHz Mono WAV, and return ready-to-stream buffers for Gemini API.
 */

export interface ExtractedAudioResult {
  wavBlob: Blob;
  base64Audio: string;
  durationSeconds: number;
}

export async function extractAudioFromVideo(
  videoFile: File | Blob
): Promise<ExtractedAudioResult> {
  const arrayBuffer = await videoFile.arrayBuffer();

  // Create temporary AudioContext for decoding
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const tempAudioContext = new AudioContextClass();

  try {
    const decodedAudioBuffer = await tempAudioContext.decodeAudioData(arrayBuffer);
    const durationSeconds = decodedAudioBuffer.duration;

    // Target: 16000Hz, 1 channel (mono) for optimal speech AI processing
    const targetSampleRate = 16000;
    const targetLength = Math.ceil(durationSeconds * targetSampleRate);

    const offlineContext = new OfflineAudioContext(1, targetLength, targetSampleRate);
    const sourceNode = offlineContext.createBufferSource();
    sourceNode.buffer = decodedAudioBuffer;
    sourceNode.connect(offlineContext.destination);
    sourceNode.start(0);

    const resampledBuffer = await offlineContext.startRendering();

    // Convert raw PCM float data to 16-bit PCM WAV Blob
    const wavBlob = bufferToWav(resampledBuffer);
    const base64Audio = await blobToBase64(wavBlob);

    return {
      wavBlob,
      base64Audio,
      durationSeconds,
    };
  } finally {
    // Deterministic hardware resource cleanup (Law 8 & SOP 4.1)
    if (tempAudioContext.state !== 'closed') {
      await tempAudioContext.close();
    }
  }
}

/**
 * Encodes an AudioBuffer into standard 16-bit linear PCM WAV format
 */
function bufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const channelData = buffer.getChannelData(0);
  const dataLength = channelData.length * bytesPerSample;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Write WAV Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM Samples
  let offset = 44;
  for (let i = 0; i < channelData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
