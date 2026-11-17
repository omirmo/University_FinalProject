import React, { useRef, useState, useEffect } from 'react';
import {
  RotateCcw,
  Trash2,
  Eraser,
  Sparkles,
  Loader2,
  ArrowRight,
  Home,
} from 'lucide-react';

interface ChildInputCanvasProps {
  onSubmitDrawing: (base64Png: string) => void;
  isLoading: boolean;
  onBack?: () => void;
}

const PALETTE = [
  { color: '#5C3A21', label: 'שוקולד' },
  { color: '#E11D48', label: 'תות' },
  { color: '#EAB308', label: 'בננה' },
  { color: '#16A34A', label: 'תפוח' },
  { color: '#EA580C', label: 'תפוז' },
  { color: '#0284C7', label: 'כחול' },
  { color: '#9333EA', label: 'סגול' },
  { color: '#1C1917', label: 'שחור' },
];

const BRUSH_SIZES = [
  { size: 5, label: 'דק' },
  { size: 12, label: 'בינוני' },
  { size: 22, label: 'עבה' },
];

export const ChildInputCanvas: React.FC<ChildInputCanvasProps> = ({
  onSubmitDrawing,
  isLoading,
  onBack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#5C3A21');
  const [currentSize, setCurrentSize] = useState<number>(12);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
  }, []);

  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const coords = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : currentColor;
    ctx.lineWidth = currentSize;
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.closePath();
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), currentState]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
    if (newHistory.length <= 1) {
      setHasDrawn(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const clearedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([clearedState]);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const base64Png = canvas.toDataURL('image/png');
    onSubmitDrawing(base64Png);
  };

  return (
    <div className="bg-white rounded-[32px] border-4 border-orange-200 shadow-xl p-4 sm:p-6 flex flex-col items-center">
      {/* Top Header with less words and Home button */}
      <div className="w-full flex items-center justify-between mb-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-black border-2 border-amber-200 bubbly-button cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <h2 className="font-black text-lg sm:text-xl text-stone-900">
            ציירו כאן!
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-all bubbly-button"
            title="ביטול פעולה אחרונה"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasDrawn}
            className="p-2 rounded-xl bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none transition-all bubbly-button"
            title="מחק הכל"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden border-4 border-amber-200 shadow-inner bg-white touch-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={450}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-stone-300 gap-2">
            <span className="text-4xl">🖍️</span>
            <span className="text-sm font-bold">ציירו מה שבא לכם</span>
          </div>
        )}
      </div>

      {/* Tools Toolbar: Colors & Eraser */}
      <div className="w-full max-w-md mt-4 space-y-3">
        <div className="flex items-center justify-between gap-1 overflow-x-auto p-1 bg-amber-50/60 rounded-2xl border-2 border-amber-100">
          <div className="flex items-center gap-1.5">
            {PALETTE.map((p) => {
              const isSelected = !isEraser && currentColor === p.color;
              return (
                <button
                  key={p.color}
                  type="button"
                  onClick={() => {
                    setCurrentColor(p.color);
                    setIsEraser(false);
                  }}
                  className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                    isSelected
                      ? 'scale-120 ring-4 ring-amber-400 ring-offset-2'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: p.color }}
                  title={p.label}
                  aria-label={p.label}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
              isEraser
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-105'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
            title="מחק"
            aria-label="מחק"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Brush Sizes */}
        <div className="flex items-center justify-center gap-2">
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.size}
              type="button"
              onClick={() => setCurrentSize(b.size)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer bubbly-button ${
                currentSize === b.size
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Big Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasDrawn || isLoading}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-lg shadow-lg shadow-orange-300 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all active:scale-[0.98] bubbly-button cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>בודק...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>סיימתי לצייר! 🚀</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
