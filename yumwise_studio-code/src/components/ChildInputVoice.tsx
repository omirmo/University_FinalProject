import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  RotateCcw,
  ArrowRight,
  Loader2,
  Volume2,
  AlertCircle,
  Keyboard,
  X,
  Check,
} from 'lucide-react';
import { transcribeVoiceApi } from '../services/apiClient';

interface ChildInputVoiceProps {
  onSubmitVoice: (text: string) => void;
  isLoading: boolean;
  onSwitchToText?: () => void;
}

type VoiceState = 'ready' | 'recording' | 'processing' | 'transcript_ready' | 'error';

export const ChildInputVoice: React.FC<ChildInputVoiceProps> = ({
  onSubmitVoice,
  isLoading: parentLoading,
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioStream();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
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

    // 1. Check if mediaDevices is supported in the current environment
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceState('error');
      setErrorMessage(
        'הדפדפן הנוכחי אינו תומך בהקלטת שמע. אנא השתמשו באפשרות הכתיבה במקלדת.'
      );
      return;
    }

    try {
      // 2. Request microphone permission from user
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Audio volume visualizer
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
      } catch (e) {
        // Visualizer is optional enhancement
      }

      // 4. Try browser SpeechRecognition in parallel if available for instant Hebrew transcription
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
        } catch (e) {
          // Fall back gracefully to server Gemini transcription
        }
      }

      // 5. Select supported MIME type
      let selectedMime = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          selectedMime = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          selectedMime = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          selectedMime = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          selectedMime = 'audio/ogg';
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
        // Stop audio tracks immediately
        cleanupAudioStream();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioLevel(0);

        // Check if browser SpeechRecognition already produced the transcript
        if (speechRecTranscript && speechRecTranscript.trim().length > 0) {
          setTranscription(speechRecTranscript.trim());
          setVoiceState('transcript_ready');
          return;
        }

        // If audio chunks captured, send to server Gemini transcribe endpoint
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: selectedMime.split(';')[0],
          });

          // Check if audio is trivial size (< 400 bytes is essentially empty header)
          if (audioBlob.size < 400) {
            setVoiceState('error');
            setErrorMessage(
              'ההקלטה הייתה קצרה מדי ולא נקלט שמע. בואו נלחץ שוב ונדבר למשך 2-3 שניות.'
            );
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
                setErrorMessage(
                  res.error ||
                    'לא זוהה דיבור ברור בעברית בהקלטה. בואו ננסה להקליט שוב!'
                );
              }
            } catch (err: unknown) {
              setVoiceState('error');
              setErrorMessage(
                'חלה שגיאה בעיבוד השמע בשרת. אנא נסו שוב או הקלידו במקלדת.'
              );
            }
          };
        } else {
          setVoiceState('error');
          setErrorMessage('לא נקלטו נתוני שמע. בואו ננסה להקליט שוב!');
        }
      };

      // Start recording with timeslice to ensure continuous data gathering
      mediaRecorder.start(250);
      setVoiceState('recording');

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      cleanupAudioStream();
      setVoiceState('error');

      const isDenied =
        (err as { name?: string })?.name === 'NotAllowedError' ||
        (err as { name?: string })?.name === 'PermissionDeniedError' ||
        String(err).includes('Permission denied');

      if (isDenied) {
        setErrorMessage(
          'הגישה למיקרופון נחסמה בדפדפן. כדי להקליט, אנא אשרו את השימוש במיקרופון בסרגל הכתובות של הדפדפן (סמל המנעול או המיקרופון) ונסו שוב.'
        );
      } else {
        setErrorMessage(
          'לא ניתן לגשת למיקרופון במכשיר. אנא בדקו את חיבור המיקרופון או עברו להקלדה במקלדת.'
        );
      }
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

  const handleRetry = () => {
    cancelRecording();
  };

  const handleConfirmTranscript = () => {
    if (!transcription.trim()) {
      setErrorMessage('התמליל ריק. אנא הקליטו שוב או ערכו את הטקסט.');
      return;
    }
    // Pass the confirmed Hebrew transcript into the same child_request field
    onSubmitVoice(transcription.trim());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-purple-200/80 shadow-md p-5 sm:p-6 text-center text-right space-y-4">
      {/* Top Title & Switch to Text */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shadow-xs">
            🎙️
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg text-stone-900 leading-tight">
              דברו בעברית — אמרו מה בא לכם לאכול!
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              הקלטה קולית אמיתית, ללא תרגום וללא שינוי של המילים שלכם
            </p>
          </div>
        </div>

        {onSwitchToText && (
          <button
            type="button"
            onClick={onSwitchToText}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            מעבר לכתיבה
          </button>
        )}
      </div>

      {/* State 1: READY */}
      {voiceState === 'ready' && (
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/70 text-center max-w-sm">
            <p className="text-xs text-purple-950 font-semibold leading-relaxed">
              לחצו על כפתור המיקרופון הגדול למטה ואמרו בקול ברור מה מתחשק לכם לאכול.
              (הדפדפן יבקש הרשאה למיקרופון בלחיצה ראשונה).
            </p>
          </div>

          <button
            type="button"
            onClick={startRecording}
            disabled={parentLoading}
            className="group relative w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white flex flex-col items-center justify-center shadow-xl shadow-purple-200 active:scale-95 transition-all focus:outline-hidden"
            aria-label="התחל הקלטה קולית"
          >
            <Mic className="w-12 h-12 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black mt-1">התחל הקלטה</span>
          </button>
          <span className="text-xs text-stone-400 font-medium">
            תומך בדיבור חופשי בעברית
          </span>
        </div>
      )}

      {/* State 2: RECORDING */}
      {voiceState === 'recording' && (
        <div className="py-5 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
          {/* Live pulsing microphone and timer */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-28 h-28 rounded-full bg-rose-500 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-200 transition-all"
              style={{
                boxShadow: `0 0 0 ${Math.max(6, audioLevel / 3)}px rgba(244, 63, 94, 0.3)`,
              }}
            >
              <Mic className="w-10 h-10 animate-bounce" />
              <span className="text-sm font-black mt-0.5 tracking-wider">
                {formatTime(recordingSeconds)}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-rose-600 text-xs font-black">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <span>מקליט כעת בעברית... אמרו את הבקשה שלכם!</span>
            </div>
          </div>

          {/* Working Stop and Cancel Controls */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              ביטול
            </button>

            <button
              type="button"
              onClick={stopRecording}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-200 flex items-center gap-2 transition-all active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              עצור וסיים הקלטה
            </button>
          </div>
        </div>
      )}

      {/* State 3: PROCESSING */}
      {voiceState === 'processing' && (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-black text-stone-900">
              מעבד את ההקלטה ומתמלל בעברית...
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              שומרים במדויק על המילים שלכם ללא תרגום או שינוי
            </p>
          </div>
        </div>
      )}

      {/* State 4: TRANSCRIPT READY */}
      {voiceState === 'transcript_ready' && (
        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-right space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-purple-600" />
              זה מה ששמענו בעברית (ניתן לערוך):
            </span>
            <button
              type="button"
              onClick={handleRetry}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              הקלט מחדש
            </button>
          </div>

          <textarea
            rows={2}
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-base font-bold text-stone-900 shadow-inner"
            dir="rtl"
            placeholder="ערכו כאן את הבקשה לפי הצורך..."
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold transition-colors"
            >
              הקלטה מחדש
            </button>

            <button
              type="button"
              onClick={handleConfirmTranscript}
              disabled={parentLoading || !transcription.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              אישור הבקשה ומציאת חלופות
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* State 5: ERROR */}
      {voiceState === 'error' && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 text-right space-y-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black text-xs block">
                לא הצלחנו להשלים את ההקלטה
              </span>
              <p className="text-xs text-rose-800 leading-relaxed font-medium">
                {errorMessage ||
                  'חלה שגיאה בגישה למיקרופון או בעיבוד השמע. בואו ננסה שוב או נשתמש בכתיבה במקלדת.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200">
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              נסה להקליט שוב
            </button>

            {onSwitchToText && (
              <button
                type="button"
                onClick={onSwitchToText}
                className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Keyboard className="w-3.5 h-3.5 text-stone-600" />
                מעבר לכתיבה במקלדת
              </button>
            )}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <p className="text-[11px] text-stone-400 text-center">
        הקלטות השמע נמחקות מיד לאחר התמלול לצורך הגנה על פרטיות הילד.
      </p>
    </div>
  );
};
