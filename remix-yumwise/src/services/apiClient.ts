import { ChildProfile, SuggestionItem } from '../types';

export interface DrawingRecognitionResult {
  detectedFoodHe: string;
  categoryHe: string;
  certainty: string;
  noteHe: string;
}

export interface VoiceTranscriptionResult {
  success: boolean;
  transcription?: string;
  error?: string;
}

export interface AlternativesResponse {
  success: boolean;
  totalSafeFound: number;
  suggestions: SuggestionItem[];
  parentReviewRequiredNotice: string;
  error?: string;
}

export async function recognizeDrawingApi(
  imageBase64: string
): Promise<DrawingRecognitionResult> {
  const res = await fetch('/api/recognize-drawing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!res.ok) {
    throw new Error('שגיאה בזיהוי הציור');
  }

  return res.json();
}

export async function transcribeVoiceApi(
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<VoiceTranscriptionResult> {
  const res = await fetch('/api/transcribe-voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'שגיאה בתמלול ההקלטה');
  }

  return res.json();
}

export async function fetchAlternativesApi(
  childProfile: ChildProfile,
  childRequest: string,
  parentNote?: string,
  maxSuggestions: number = 3
): Promise<AlternativesResponse> {
  const res = await fetch('/api/generate-alternatives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      childProfile,
      childRequest,
      parentNote,
      maxSuggestions,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'שגיאה בקבלת המלצות');
  }

  return res.json();
}
