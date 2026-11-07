import React, { useState } from 'react';
import {
  CheckCircle,
  Edit3,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  X,
  User,
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

  const getInputTypeLabel = () => {
    switch (requestState.inputType) {
      case 'draw':
        return { label: 'ציור ילד', icon: '🎨' };
      case 'voice':
        return { label: 'הקלטה קולית', icon: '🎙️' };
      case 'text':
      default:
        return { label: 'כתיבה', icon: '⌨️' };
    }
  };

  const inputMeta = getInputTypeLabel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 leading-tight">
                אישור ועריכת הבקשה לפני חיפוש
              </h2>
              <p className="text-xs text-stone-500">
                שלב בדיקה משותף לילד ולהורה לפני הפעלת סינון האלרגנים
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
            aria-label="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirm} className="p-5 overflow-y-auto space-y-5 text-right">
          {/* Drawing Preview & Uncertainty Note if applicable */}
          {requestState.inputType === 'draw' && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  זיהוי הציור (טיפול באי-ודאות)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  הערכה ראשונית
                </span>
              </div>

              <div className="flex items-center gap-3">
                {requestState.drawingImageBase64 && (
                  <img
                    src={requestState.drawingImageBase64}
                    alt="ציור הילד"
                    className="w-16 h-16 object-contain rounded-xl border border-amber-200 bg-white p-1"
                  />
                )}
                <div className="text-xs text-amber-950 space-y-0.5">
                  <p className="font-bold">
                    זיהינו בסבירות חלקית:{' '}
                    <span className="text-orange-700 underline">
                      {requestState.rawInput}
                    </span>
                  </p>
                  <p className="text-[11px] text-stone-600 leading-tight">
                    {requestState.recognitionCertaintyNote ||
                      'זיהוי ציור אינו ודאי. אנא בדקו ותקנו את השם בשדה מטה בהתאם לכוונת הילד.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Child Request Input (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-orange-500" />
                בקשת המאכל של הילד (ניתנת לעריכה):
              </label>
              <span className="text-[11px] text-stone-500">
                קלט מתוך: {inputMeta.icon} {inputMeta.label}
              </span>
            </div>
            <input
              type="text"
              required
              value={confirmedText}
              onChange={(e) => setConfirmedText(e.target.value)}
              placeholder="למשל: שוקולד חלב, צ'יפס, עוגייה..."
              className="w-full px-4 py-3 text-base font-bold text-stone-900 bg-white rounded-2xl border-2 border-amber-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>

          {/* Parent Context Note */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              הערת הורה לבקשה (אופציונלי):
            </label>
            <p className="text-[11px] text-stone-500 mb-1.5">
              הוסיפו מאפיינים רצויים, כגון: "רוצה משהו מתוק וכהה", "קרמי וקריר", או "ללא צבעי מאכל"
            </p>
            <textarea
              rows={2}
              value={parentNote}
              onChange={(e) => setParentNote(e.target.value)}
              placeholder="למשל: מחפשים משהו מתוק וכהה שדומה לשוקולד..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-stone-800 placeholder:text-stone-400"
            />
          </div>

          {/* Active Profile Allergen Safeguard Pill */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentProfile.avatar}</span>
              <div>
                <span className="font-bold text-stone-900">
                  עבור: {currentProfile.name} (גיל {currentProfile.age})
                </span>
                <p className="text-[10px] text-stone-500">
                  {currentProfile.allergens.length > 0
                    ? `אלרגיות פעילות: ${currentProfile.allergens.join(', ')}`
                    : 'אין אלרגיות מוגדרות'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              סינון אלרגן מוקדם מופעל
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-xs font-bold text-stone-600 hover:text-stone-900 rounded-xl"
            >
              חזרה
            </button>
            <button
              type="submit"
              disabled={isLoading || !confirmedText.trim()}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-md shadow-orange-200 disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  מבצע סינון אלרגנים והתאמת טעם...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  מצא חלופות בריאות עכשיו
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
