/**
 * Gemini Transcriber Service
 * Connects to Gemini 2.5 Flash API to process downsampled audio buffers
 * and output precise, millisecond word-by-word timestamps converted strictly
 * to phonetic Latin "Hinglish" script.
 */

import { WordTimestamp, TranscriptionPayload } from '@/types';

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';
const DEFAULT_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const TRANSCRIPTION_PROMPT = `You are an expert video subtitle editor, kinetic typography specialist, and localization engineer.
Analyze the provided audio track file and map out high-precision, word-by-word millisecond timestamps.

CRITICAL PROCESSING INSTRUCTIONS:
1. Language Mapping: Convert ALL spoken Hindi, Urdu, or regional dialect phrases into "Hinglish" phonetic English Latin script (e.g., If the user says "दोस्तो आज हम बात करेंगे", output word objects for: "dosto", "aaj", "hum", "baat", "karenge"). Do not output Devanagari script. Do not modify spoken English words.
2. Timing Precision: Every word object must capture exact float values (in seconds) for "start" and "end" playback marks matching the source track. Ensure words do not overlap and flow naturally.
3. Word Granularity: Split compound speech into individual spoken words.
4. Output Restriction: Return your analysis STRICTLY conforming to this JSON format without markdown code blocks, backticks, or conversational preamble:
[
  { "word": "hey", "start": 0.12, "end": 0.45 },
  { "word": "dosto", "start": 0.51, "end": 0.98 }
]`;

export async function transcribeAudioWithGemini(
  base64Audio: string,
  options?: {
    apiKey?: string;
    model?: string;
    mimeType?: string;
  }
): Promise<TranscriptionPayload> {
  const apiKey = options?.apiKey?.trim() || DEFAULT_KEY;
  const model = options?.model || DEFAULT_MODEL;
  const mimeType = options?.mimeType || 'audio/wav';

  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please provide a valid Gemini API Key.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: TRANSCRIPTION_PROMPT,
          },
          {
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedMessage = errorText;
    try {
      const errObj = JSON.parse(errorText);
      parsedMessage = errObj.error?.message || errorText;
    } catch {
      // Keep raw message
    }
    throw new Error(`Gemini API Error (${response.status}): ${parsedMessage}`);
  }

  const result = await response.json();
  const rawContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawContent) {
    throw new Error('No transcription content received from Gemini model.');
  }

  // Parse JSON response safely (handling edge markdown wrappers if any)
  const cleanedJson = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let words: WordTimestamp[] = [];
  try {
    const parsed = JSON.parse(cleanedJson);
    if (Array.isArray(parsed)) {
      words = parsed.map((item) => ({
        word: String(item.word || '').trim(),
        start: Number(item.start) || 0,
        end: Number(item.end) || 0,
      }));
    } else if (parsed.words && Array.isArray(parsed.words)) {
      words = parsed.words.map((item: { word: unknown; start: unknown; end: unknown }) => ({
        word: String(item.word || '').trim(),
        start: Number(item.start) || 0,
        end: Number(item.end) || 0,
      }));
    }
  } catch (parseErr) {
    console.error('Failed to parse Gemini JSON output:', cleanedJson, parseErr);
    throw new Error('Gemini response could not be parsed into word timestamps.');
  }

  // Sort and validate words
  words = words
    .filter((w) => w.word.length > 0 && w.end >= w.start)
    .sort((a, b) => a.start - b.start);

  const fullText = words.map((w) => w.word).join(' ');
  const duration = words.length > 0 ? words[words.length - 1].end : 0;

  return {
    words,
    fullText,
    duration,
  };
}
