import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Home,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { ParentFoodDetailModal } from './ParentFoodDetailModal';

interface DrawingSuggestionsScreenProps {
  drawingImageBase64?: string | null;
  onSelectSuggestion: (itemTitle: string) => void;
  onBackToDraw: () => void;
  onGoHome: () => void;
}

interface SimulatedSuggestion {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  tag: string;
  badgeColor: string;
  caloriesHint: string;
}

const SUGGESTIONS: SimulatedSuggestion[] = [
  {
    id: 'peanut-butter',
    title: 'פרוסה עם ממרח חמאת בוטנים',
    subtitle: 'קרמי, עשיר בחלבון ומשביע',
    emoji: '🥜🥪',
    gradient: 'from-amber-500 via-orange-400 to-amber-600',
    tag: 'חלבון ואנרגיה',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    caloriesHint: '195 קק״ל',
  },
  {
    id: 'jam',
    title: 'פרוסה עם ריבה',
    subtitle: 'מתוקה, פירותית ומרעננת',
    emoji: '🍓🥪',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    tag: 'מתוק ופירותי',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    caloriesHint: '138 קק״ל',
  },
  {
    id: 'silan',
    title: 'פרוסה עם סילאן',
    subtitle: 'מתיקות טבעית ומפנקת מתמרים',
    emoji: '🍯🥪',
    gradient: 'from-orange-500 via-amber-500 to-yellow-600',
    tag: 'סוכר פירות טבעי',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    caloriesHint: '152 קק״ל',
  },
];

export const DrawingSuggestionsScreen: React.FC<DrawingSuggestionsScreenProps> = ({
  drawingImageBase64,
  onSelectSuggestion,
  onBackToDraw,
  onGoHome,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeParentInfoId, setActiveParentInfoId] = useState<string | null>(null);

  const handlePick = (item: SimulatedSuggestion) => {
    setSelectedId(item.id);
    setTimeout(() => {
      onSelectSuggestion(item.title);
    }, 700);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 text-center" dir="rtl">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDraw}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-black border-2 border-amber-200 transition-all bubbly-button cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לציור 🎨</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-black border-2 border-stone-200 transition-all bubbly-button cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>דף הבית</span>
        </button>
      </div>

      {/* Cheerful Header & Drawing Preview */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-[32px] p-5 text-white shadow-xl shadow-orange-300/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
          {drawingImageBase64 && (
            <div className="p-1.5 bg-white/90 rounded-2xl shadow-md border-2 border-amber-200 inline-block">
              <img
                src={drawingImageBase64}
                alt="הציור שלך"
                className="w-20 h-16 sm:w-24 sm:h-20 object-contain rounded-xl bg-white"
              />
            </div>
          )}

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>הציור שלכם מעורר תיאבון!</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-xs">
              מה תרצו לנשנש עכשיו?
            </h1>
            <p className="text-xs text-amber-100 font-bold mt-0.5">
              לחצו על ההצעה, או על כפתור ״מידע להורים״ לפרטים
            </p>
          </div>
        </div>
      </div>

      {/* THREE SIMULATED SUGGESTIONS CARDS WITH PARENT INFO BUTTON */}
      <div className="space-y-3.5 pt-1">
        {SUGGESTIONS.map((item) => {
          const isChosen = selectedId === item.id;
          return (
            <div
              key={item.id}
              className={`group relative w-full p-4 sm:p-5 rounded-[28px] border-4 text-right transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg bubbly-button overflow-hidden ${
                isChosen
                  ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-200 scale-[1.01]'
                  : 'bg-white hover:bg-amber-50/40 border-amber-200/90 hover:border-amber-400 shadow-amber-200/40'
              }`}
            >
              {/* Left Side: Clickable to pick */}
              <div
                onClick={() => handlePick(item)}
                className="flex items-center gap-3.5 sm:gap-4 flex-1 cursor-pointer"
                title={`בחירה ב${item.title}`}
              >
                {/* Food Icon */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-orange-200/50 group-hover:scale-105 transition-transform shrink-0`}
                >
                  {isChosen ? (
                    <Check className="w-8 h-8 text-white stroke-[3] animate-bounce" />
                  ) : (
                    item.emoji
                  )}
                </div>

                {/* Text details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg font-black text-stone-900 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-bold">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Side: Action Controls (Parent Info Button + Pick Indicator) */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                {/* Button next to the suggested things: Designed for parents */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveParentInfoId(item.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-stone-800 hover:text-amber-950 border-2 border-amber-300 text-xs font-black shadow-2xs transition-all active:scale-95 bubbly-button cursor-pointer shrink-0"
                  title={`מידע להורים על ${item.title}`}
                  aria-label={`מידע להורים: מרקם, קלוריות ויתרונות של ${item.title}`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>מידע להורים</span>
                </button>

                {/* Pick item button */}
                <button
                  type="button"
                  onClick={() => handlePick(item)}
                  className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1 transition-all cursor-pointer bubbly-button ${
                    isChosen
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-amber-100 hover:bg-amber-500 text-amber-900 hover:text-white'
                  }`}
                >
                  <span>{isChosen ? 'נבחר! ✓' : 'בחירה'}</span>
                  {!isChosen && <span>←</span>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Celebration Toast when clicked */}
      {selectedId && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-200/50 animate-in zoom-in-95 flex items-center justify-center gap-2">
          <span>😋</span>
          <span>בחירה מעולה! חוזרים לדף הבית...</span>
        </div>
      )}

      {/* Dedicated Screen/Modal Designed for Parents */}
      <ParentFoodDetailModal
        foodId={activeParentInfoId}
        onClose={() => setActiveParentInfoId(null)}
        onSelectForChild={(title) => {
          setActiveParentInfoId(null);
          onSelectSuggestion(title);
        }}
      />
    </div>
  );
};
