import React, { useState, useEffect } from 'react';
import { Lock, Unlock, X, Delete, Check, Shield } from 'lucide-react';

interface ParentPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
}

export const ParentPasscodeModal: React.FC<ParentPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin = '1234',
}) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setIsError(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Support hardware keyboard typing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isSuccess]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4 || isSuccess) return;
    setIsError(false);
    const newPin = pin + digit;
    setPin(newPin);

    // If 4 digits reached, verify immediately
    if (newPin.length === 4) {
      verifyPin(newPin);
    }
  };

  const handleDelete = () => {
    if (isSuccess) return;
    setIsError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isSuccess) return;
    setPin('');
    setIsError(false);
  };

  const verifyPin = (candidatePin: string) => {
    if (candidatePin === correctPin) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 400);
    } else {
      setIsError(true);
      setTimeout(() => {
        setPin('');
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-xs sm:max-w-sm rounded-[32px] p-6 shadow-2xl border-4 border-amber-200/80 text-center relative overflow-hidden"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          title="סגירה"
          aria-label="סגירה"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-600 flex items-center justify-center mb-3 shadow-inner">
          {isSuccess ? (
            <Unlock className="w-8 h-8 text-emerald-600 animate-bounce" />
          ) : (
            <Lock className="w-8 h-8 text-amber-600" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-stone-900 mb-1">
          {isSuccess ? 'הקוד תקין!' : 'נעילת הורים 🔒'}
        </h2>
        <p className="text-xs text-stone-500 font-medium mb-5">
          {isSuccess
            ? 'נכנסים לאזור ההורים...'
            : 'הקלידו קוד 4 ספרות לכניסה לאזור הורים'}
        </p>

        {/* PIN Dots Display */}
        <div
          className={`flex items-center justify-center gap-3.5 mb-6 ${
            isError ? 'animate-shake' : ''
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isSuccess
                    ? 'bg-emerald-500 scale-125 ring-4 ring-emerald-200'
                    : isError
                    ? 'bg-rose-500 ring-4 ring-rose-200'
                    : isFilled
                    ? 'bg-amber-500 scale-110 ring-4 ring-amber-200'
                    : 'bg-stone-200 border border-stone-300'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {isError && (
          <p className="text-xs text-rose-600 font-bold -mt-3 mb-3 animate-in fade-in">
            קוד שגוי, נסו שוב (קוד: {correctPin})
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-13 rounded-2xl bg-amber-50/70 hover:bg-amber-100 active:bg-amber-200 border-2 border-amber-200/90 text-xl font-black text-stone-800 transition-all active:scale-90 shadow-2xs bubbly-button"
            >
              {digit}
            </button>
          ))}

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 text-xs font-bold text-stone-600 transition-all active:scale-90"
            title="נקה הכל"
          >
            איפוס
          </button>

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-amber-50/70 hover:bg-amber-100 active:bg-amber-200 border-2 border-amber-200/90 text-xl font-black text-stone-800 transition-all active:scale-90 shadow-2xs bubbly-button"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 text-stone-700 flex items-center justify-center transition-all active:scale-90"
            title="מחק ספרה אחרונה"
            aria-label="מחק"
          >
            <Delete className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Friendly Simulator Code Hint */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] font-bold">
          <span>💡</span>
          <span>קוד דמו: <strong>1 2 3 4</strong></span>
        </div>
      </div>
    </div>
  );
};
