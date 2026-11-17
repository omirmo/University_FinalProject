import React from 'react';
import { Sparkles, Lock, ArrowLeft, Shield } from 'lucide-react';

interface HeaderProps {
  activeMode: 'child' | 'parent';
  onOpenParentArea: () => void;
  onExitParentArea: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onOpenParentArea,
  onExitParentArea,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200/90 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo Button - Always redirects to Home (3 big buttons) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 group text-right focus:outline-hidden shrink-0 cursor-pointer bubbly-button"
          title="חזרה לדף הבית"
          aria-label="חזרה לדף הבית של YumWise"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-300/60 group-hover:rotate-6 transition-transform">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="font-black text-xl sm:text-2xl tracking-tight text-stone-900 group-hover:text-orange-600 transition-colors">
              YumWise
            </span>
          </div>
        </button>

        {/* Kept ONLY: "Parents Area" at the top of the screen */}
        <div className="flex items-center">
          {activeMode === 'parent' ? (
            <button
              onClick={onExitParentArea}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-black border-2 border-stone-300 transition-all active:scale-95 shadow-2xs bubbly-button cursor-pointer"
              title="חזרה למסך ילדים"
            >
              <span>🧒</span>
              <span>חזרה לילדים</span>
            </button>
          ) : (
            <button
              onClick={onOpenParentArea}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black shadow-md shadow-orange-200 transition-all active:scale-95 bubbly-button cursor-pointer"
              title="כניסה לאזור הורים (דרוש קוד)"
              aria-label="כניסה לאזור הורים"
            >
              <Lock className="w-4 h-4" />
              <span>אזור הורים</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
