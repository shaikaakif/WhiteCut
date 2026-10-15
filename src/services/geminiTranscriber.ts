/**
 * Gemini Transcriber Service
 * Connects to Gemini 2.5 Flash API to process downsampled audio buffers
 * and output precise, millisecond word-by-word timestamps converted strictly
 * to phonetic Latin "Hinglish" script, guided by the creator's prompt.
 */

import { WordTimestamp, TranscriptionPayload } from '@/types';

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';
const DEFAULT_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export async function transcribeAudioWithGemini(
  base64Audio: string,
  options?: {
    apiKey?: string;
    model?: string;
    mimeType?: string;
    userPrompt?: string;
  }
): Promise<TranscriptionPayload> {
  const apiKey = options?.apiKey?.trim() || DEFAULT_KEY;
  const model = options?.model || DEFAULT_MODEL;
  const mimeType = options?.mimeType || 'audio/wav';
  const userPrompt = options?.userPrompt?.trim();

  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please configure your key in Settings (gear icon).');
  }

  const promptText = `You are WhiteCut AI — an elite vertical video editor and localization engineer.
Analyze the provided speech audio track and construct millisecond-accurate word timestamps and editorial metadata.

${userPrompt ? `USER EDITING PROMPT / DIRECTIVE: "${userPrompt}"\nAdapt subtitle pacing, vocabulary, and header aesthetics to match this intent.` : ''}

CRITICAL RULES:
1. Phonetic Hinglish: If the speaker speaks in Hindi, Urdu, or regional Indian dialects, transliterate strictly into English Latin characters (e.g. "दोस्तो आज हम बात करेंगे" -> "dosto aaj hum baat karenge"). Maintain native spoken English words. Never output Devanagari script.
2. Word Timestamps: Every word must have accurate start and end float timestamps in seconds.
3. Editorial Metadata: Generate a punchy 2-4 word editorial title (e.g. "Mastering Focus", "The Lost Blueprint") and a vintage archive badge tag (e.g. "THE ARCHIVE - 1952").

OUTPUT FORMAT: Return STRICTLY valid JSON conforming to this schema without markdown wrappers:
{
  "title": "Mastering Focus",
  "tag": "THE ARCHIVE - 1952",
  "words": [
    { "word": "hey", "start": 0.12, "end": 0.45 },
    { "word": "dosto", "start": 0.51, "end": 0.98 }
  ]
}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: promptText },
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
      temperature: 0.2,
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

  const cleanedJson = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let words: WordTimestamp[] = [];
  let inferredTitle = 'WhiteCut Editorial';
  let inferredTag = 'THE ARCHIVE - 1952';

  try {
    const parsed = JSON.parse(cleanedJson);
    if (Array.isArray(parsed)) {
      words = parsed.map((item) => ({
        word: String(item.word || '').trim(),
        start: Number(item.start) || 0,
        end: Number(item.end) || 0,
      }));
    } else if (parsed && typeof parsed === 'object') {
      if (parsed.title) inferredTitle = String(parsed.title);
      if (parsed.tag) inferredTag = String(parsed.tag);
      const rawWords = Array.isArray(parsed.words) ? parsed.words : [];
      words = rawWords.map((item: { word: unknown; start: unknown; end: unknown }) => ({
        word: String(item.word || '').trim(),
        start: Number(item.start) || 0,
        end: Number(item.end) || 0,
      }));
    }
  } catch (parseErr) {
    console.error('Failed to parse Gemini JSON output:', cleanedJson, parseErr);
    throw new Error('Gemini response could not be parsed into word timestamps.');
  }

  words = words
    .filter((w) => w.word.length > 0 && w.end >= w.start)
    .sort((a, b) => a.start - b.start);

  const fullText = words.map((w) => w.word).join(' ');
  const duration = words.length > 0 ? words[words.length - 1].end : 0;

  return {
    words,
    fullText,
    duration,
    inferredTitle,
    inferredTag,
  };
}
