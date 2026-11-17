import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  Keyboard,
} from 'lucide-react';

interface ChildInputVoiceProps {
  onBack?: () => void;
  onSwitchToText?: () => void;
}

type VoiceState = 'ready' | 'recording' | 'playback' | 'error';

export const ChildInputVoice: React.FC<ChildInputVoiceProps> = ({
  onBack,
  onSwitchToText,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  useEffect(() => {
    return () => {
      cancelActiveRecorder();
      cleanupAudioStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const cleanupAudioStream = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const cancelActiveRecorder = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setRecordingUrl('');
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
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

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
        .find((type) => MediaRecorder.isTypeSupported(type));
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        cleanupAudioStream();
        setAudioLevel(0);
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        if (!audioBlob.size) {
          setVoiceState('error');
          setErrorMessage('לא נקלט שמע. בואו ננסה שוב!');
          return;
        }
        setRecordingUrl(URL.createObjectURL(audioBlob));
        setVoiceState('playback');
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    cancelActiveRecorder();
    cleanupAudioStream();
    setRecordingUrl('');
    audioChunksRef.current = [];
    setAudioLevel(0);
    setRecordingSeconds(0);
    setVoiceState('ready');
    setErrorMessage(null);
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

      {voiceState === 'playback' && (
        <div className="p-4 rounded-3xl bg-purple-50/80 border-2 border-purple-200 text-right space-y-3">
          <p className="text-xs font-black text-purple-900">אפשר להקשיב להקלטה. תמלול כבוי בגרסה הזו.</p>
          <audio className="w-full" controls src={recordingUrl} />
          <div className="flex items-center gap-2">
            <button type="button" onClick={cancelRecording} className="px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 text-xs font-black">
              הקלטה מחדש
            </button>
            <button type="button" onClick={onSwitchToText} className="px-4 py-3 rounded-2xl bg-purple-700 text-white text-xs font-black">
              מעבר לכתיבה
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
