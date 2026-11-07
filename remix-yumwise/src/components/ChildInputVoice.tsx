import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  RotateCcw,
  ArrowRight,
  Loader2,
  AlertCircle,
  Keyboard,
  X,
  Check,
} from 'lucide-react';
import { transcribeVoiceApi } from '../services/apiClient';

interface ChildInputVoiceProps {
  onSubmitVoice: (text: string) => void;
  isLoading: boolean;
  onBack?: () => void;
  onSwitchToText?: () => void;
}

type VoiceState = 'ready' | 'recording' | 'processing' | 'transcript_ready' | 'error';

export const ChildInputVoice: React.FC<ChildInputVoiceProps> = ({
  onSubmitVoice,
  isLoading: parentLoading,
  onBack,
  onSwitchToText,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [transcription, setTranscription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<unknown>(null);

  useEffect(() => {
    return () => {
      cleanupAudioStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  const cleanupAudioStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        (speechRecognitionRef.current as { stop: () => void }).stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscription('');
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceState('error');
      setErrorMessage('הדפדפן אינו תומך בהקלטה. נסו להקליד במקלדת.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      mediaStreamRef.current = stream;

      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((acc, val) => acc + val, 0);
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (e) {}

      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
          .SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
          .webkitSpeechRecognition;

      let speechRecTranscript = '';
      if (SpeechRecognition) {
        try {
          const recognition = new (SpeechRecognition as new () => {
            lang: string;
            continuous: boolean;
            interimResults: boolean;
            start: () => void;
            stop: () => void;
            onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
            onerror: (e: { error: string }) => void;
            onend: () => void;
          })();

          recognition.lang = 'he-IL';
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            const currentText = Array.from(event.results)
              .map((result) => result[0].transcript)
              .join('');
            if (currentText.trim()) {
              speechRecTranscript = currentText.trim();
              setTranscription(currentText.trim());
            }
          };

          speechRecognitionRef.current = recognition;
          recognition.start();
        } catch (e) {}
      }

      let selectedMime = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          selectedMime = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          selectedMime = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          selectedMime = 'audio/mp4';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        cleanupAudioStream();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioLevel(0);

        if (speechRecTranscript && speechRecTranscript.trim().length > 0) {
          setTranscription(speechRecTranscript.trim());
          setVoiceState('transcript_ready');
          return;
        }

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: selectedMime.split(';')[0],
          });

          if (audioBlob.size < 400) {
            setVoiceState('error');
            setErrorMessage('ההקלטה הייתה קצרה מדי. בואו ננסה שוב!');
            return;
          }

          setVoiceState('processing');

          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              const res = await transcribeVoiceApi(
                base64Audio,
                selectedMime.split(';')[0]
              );
              if (res.success && res.transcription && res.transcription.trim()) {
                setTranscription(res.transcription.trim());
                setVoiceState('transcript_ready');
              } else {
                setVoiceState('error');
                setErrorMessage(res.error || 'לא זוהה דיבור ברור. בואו ננסה שוב!');
              }
            } catch (err: unknown) {
              setVoiceState('error');
              setErrorMessage('חלה שגיאה בעיבוד השמע. אפשר גם להקליד במקלדת.');
            }
          };
        } else {
          setVoiceState('error');
          setErrorMessage('לא נקלט שמע. בואו ננסה שוב!');
        }
      };

      mediaRecorder.start(250);
      setVoiceState('recording');

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      cleanupAudioStream();
      setVoiceState('error');
      setErrorMessage('יש לאשר גישה למיקרופון בדפדפן כדי להקליט.');
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        (speechRecognitionRef.current as { stop: () => void }).stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    cleanupAudioStream();
    audioChunksRef.current = [];
    setAudioLevel(0);
    setRecordingSeconds(0);
    setVoiceState('ready');
    setErrorMessage(null);
  };

  const handleConfirmTranscript = () => {
    if (!transcription.trim()) return;
    onSubmitVoice(transcription.trim());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[32px] border-4 border-purple-200 shadow-xl p-5 sm:p-6 text-center space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs sm:text-sm font-black border-2 border-purple-200 bubbly-button cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          <h2 className="font-black text-lg sm:text-xl text-stone-900">
            דברו בקול!
          </h2>
        </div>

        {onSwitchToText ? (
          <button
            type="button"
            onClick={onSwitchToText}
            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 bubbly-button cursor-pointer"
            title="מעבר לכתיבה"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* State 1: READY */}
      {voiceState === 'ready' && (
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <button
            type="button"
            onClick={startRecording}
            disabled={parentLoading}
            className="group relative w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white flex flex-col items-center justify-center shadow-xl shadow-purple-300 active:scale-95 transition-all bubbly-button cursor-pointer"
            aria-label="התחל הקלטה"
          >
            <Mic className="w-14 h-14 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black mt-1">לחצו ודברו</span>
          </button>
        </div>
      )}

      {/* State 2: RECORDING */}
      {voiceState === 'recording' && (
        <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
          <div
            className="relative w-32 h-32 rounded-full bg-rose-500 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-300 transition-all"
            style={{
              boxShadow: `0 0 0 ${Math.max(8, audioLevel / 2.5)}px rgba(244, 63, 94, 0.3)`,
            }}
          >
            <Mic className="w-12 h-12 animate-bounce" />
            <span className="text-base font-black mt-1">{formatTime(recordingSeconds)}</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black transition-colors"
            >
              ביטול
            </button>

            <button
              type="button"
              onClick={stopRecording}
              className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black shadow-md shadow-rose-200 flex items-center gap-2 transition-all active:scale-95 cursor-pointer bubbly-button"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>סיימתי לדבר!</span>
            </button>
          </div>
        </div>
      )}

      {/* State 3: PROCESSING */}
      {voiceState === 'processing' && (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
          <span className="text-base font-black text-stone-900">
            מקשיב ומפענח... 🎧
          </span>
        </div>
      )}

      {/* State 4: TRANSCRIPT READY */}
      {voiceState === 'transcript_ready' && (
        <div className="p-4 rounded-3xl bg-purple-50/80 border-2 border-purple-200 text-right space-y-3 animate-in fade-in">
          <span className="text-xs font-black text-purple-900 block">
            זה מה ששמענו:
          </span>

          <textarea
            rows={2}
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-2xl border-2 border-purple-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-lg font-bold text-stone-900 shadow-inner"
            dir="rtl"
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-4 py-3 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border-2 border-stone-200 text-xs font-black transition-colors cursor-pointer"
            >
              הקלטה מחדש
            </button>

            <button
              type="button"
              onClick={handleConfirmTranscript}
              disabled={parentLoading || !transcription.trim()}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-base shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer bubbly-button"
            >
              <Check className="w-5 h-5" />
              <span>סיימתי! 🚀</span>
            </button>
          </div>
        </div>
      )}

      {/* State 5: ERROR */}
      {voiceState === 'error' && (
        <div className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-950 text-right space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-black text-sm">
              {errorMessage || 'לא הצלחנו להקליט'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>לנסות שוב</span>
            </button>

            {onSwitchToText && (
              <button
                type="button"
                onClick={onSwitchToText}
                className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border-2 border-rose-200 rounded-2xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>עבור למקלדת ⌨️</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
