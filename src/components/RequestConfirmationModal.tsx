import React, { useState } from 'react';
import {
  CheckCircle,
  Sparkles,
  Loader2,
  X,
  Edit2,
} from 'lucide-react';
import { ChildProfile, FoodRequestState } from '../types';

interface RequestConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestState: FoodRequestState;
  currentProfile: ChildProfile;
  onConfirmAndGenerate: (confirmedText: string, parentNote?: string) => void;
  isLoading: boolean;
}

export const RequestConfirmationModal: React.FC<RequestConfirmationModalProps> = ({
  isOpen,
  onClose,
  requestState,
  currentProfile,
  onConfirmAndGenerate,
  isLoading,
}) => {
  const [confirmedText, setConfirmedText] = useState(
    requestState.confirmedText || requestState.rawInput || ''
  );
  const [parentNote, setParentNote] = useState(requestState.parentNote || '');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedText.trim()) return;
    onConfirmAndGenerate(confirmedText.trim(), parentNote.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b-2 border-amber-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-lg font-black text-stone-900">
              זה מה שביקשתם?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
            aria-label="סגירה"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} className="p-5 overflow-y-auto space-y-4 text-right">
          {/* Drawing Preview if came from canvas */}
          {requestState.inputType === 'draw' && requestState.drawingImageBase64 && (
            <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center gap-3">
              <img
                src={requestState.drawingImageBase64}
                alt="ציור"
                className="w-16 h-16 object-contain rounded-xl border border-amber-300 bg-white p-1 shrink-0"
              />
              <div className="text-xs text-stone-700">
                <span className="font-bold text-amber-900 block">הציור שלכם:</span>
                <span>{requestState.rawInput || 'מאכל טעים'}</span>
              </div>
            </div>
          )}

          {/* Child Request Text Input */}
          <div>
            <label className="text-xs font-black text-stone-700 block mb-1">
              שם המאכל:
            </label>
            <input
              type="text"
              required
              value={confirmedText}
              onChange={(e) => setConfirmedText(e.target.value)}
              placeholder="למשל: שוקולד, גלידה, צ'יפס..."
              className="w-full px-4 py-3 text-lg font-black text-stone-900 bg-amber-50/40 rounded-2xl border-2 border-amber-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-xs font-black text-stone-600 hover:bg-stone-100 rounded-2xl transition-colors cursor-pointer"
            >
              חזרה
            </button>
            <button
              type="submit"
              disabled={isLoading || !confirmedText.trim()}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-lg shadow-orange-300 disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-95 bubbly-button cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>מחפש חלופות...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>מצא לי חלופות! 😋</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
