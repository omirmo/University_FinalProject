import React, { useRef, useState, useEffect } from 'react';
import {
  RotateCcw,
  Trash2,
  Check,
  Eraser,
  Paintbrush,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ChildInputCanvasProps {
  onSubmitDrawing: (base64Png: string) => void;
  isLoading: boolean;
}

const PALETTE = [
  { color: '#5C3A21', label: 'שוקולד' },
  { color: '#E11D48', label: 'תות' },
  { color: '#EAB308', label: 'בננה' },
  { color: '#16A34A', label: 'תפוח ירוק' },
  { color: '#EA580C', label: 'תפוז / גזר' },
  { color: '#0284C7', label: 'ארטיק כחול' },
  { color: '#9333EA', label: 'ענבים' },
  { color: '#1C1917', label: 'שחור' },
];

const BRUSH_SIZES = [
  { size: 4, label: 'דק' },
  { size: 9, label: 'בינוני' },
  { size: 18, label: 'עבה' },
];

export const ChildInputCanvas: React.FC<ChildInputCanvasProps> = ({
  onSubmitDrawing,
  isLoading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#5C3A21');
  const [currentSize, setCurrentSize] = useState<number>(9);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // Setup canvas resolution and background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Fill initial canvas white background so exported PNG is crisp
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to history
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

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : currentColor;

    setIsDrawing(true);
    setHasDrawn(true);
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

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Save step to history (cap at 15 steps)
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-14), currentState]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current state
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
    if (newHistory.length === 1) {
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
    if (!canvas) return;
    const base64Png = canvas.toDataURL('image/png');
    onSubmitDrawing(base64Png);
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-4 sm:p-5 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            🎨
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              ציירו את המאכל שמתחשק לכם
            </h3>
            <p className="text-xs text-stone-500">
              למשל: ארטיק, חפיסת שוקולד, צלחת צ׳יפס או עוגייה
            </p>
          </div>
        </div>

        {/* Action Controls: Undo & Clear */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1 || isLoading}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="בטל פעולה אחרונה"
            aria-label="בטל פעולה"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasDrawn || isLoading}
            className="p-2 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="נקה לוח"
            aria-label="נקה לוח"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Touch & Mouse Canvas Container */}
      <div className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden border-2 border-dashed border-amber-300 bg-white shadow-inner touch-none">
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
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-stone-400 select-none bg-amber-50/20">
            <span className="text-3xl mb-1">🖌️</span>
            <span className="text-xs font-semibold text-stone-500">
              השתמשו באצבע או בעכבר כדי לצייר
            </span>
          </div>
        )}
      </div>

      {/* Palette and Tools Toolbar */}
      <div className="w-full max-w-md mt-4 space-y-3">
        {/* Color Palette */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
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
                  className={`w-8 h-8 rounded-full transition-transform focus:outline-hidden ${
                    isSelected
                      ? 'scale-115 ring-3 ring-amber-400 ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.color }}
                  title={p.label}
                  aria-label={p.label}
                />
              );
            })}
          </div>

          {/* Eraser Tool */}
          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`p-2 rounded-xl border transition-all ${
              isEraser
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
            title="מחק"
            aria-label="מחק"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Brush Sizes */}
        <div className="flex items-center justify-between pt-1 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs font-medium text-stone-600">עובי מכחול:</span>
            <div className="flex items-center gap-1">
              {BRUSH_SIZES.map((b) => (
                <button
                  key={b.size}
                  type="button"
                  onClick={() => setCurrentSize(b.size)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    currentSize === b.size
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
            הזיהוי יוצג לאישורכם
          </span>
        </div>

        {/* Submit Drawing Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasDrawn || isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base shadow-md shadow-orange-200 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              מפענח את הציור...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              סיימתי לצייר, בואו נבדוק!
            </>
          )}
        </button>
      </div>
    </div>
  );
};
