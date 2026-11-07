import React from 'react';
import { Sparkles, ShieldCheck, Info, User } from 'lucide-react';
import { ChildProfile } from '../types';

interface HeaderProps {
  currentProfile: ChildProfile;
  activeMode: 'child' | 'parent';
  onToggleMode: (mode: 'child' | 'parent') => void;
  onOpenProfileModal: () => void;
  onOpenInfoModal: () => void;
  onResetFlow: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  activeMode,
  onToggleMode,
  onOpenProfileModal,
  onOpenInfoModal,
  onResetFlow,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand / Logo */}
        <button
          onClick={onResetFlow}
          className="flex items-center gap-2 group text-right focus:outline-hidden shrink-0"
          title="חזרה להתחלה"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-stone-900">
                YumWise
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                אב-טיפוס
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium hidden xs:block">
              חלופות בריאות שילדים אוהבים
            </p>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode switch button - Visible on ALL screens including mobile */}
          <div className="bg-stone-100 p-0.5 rounded-xl border border-stone-200 flex items-center text-xs font-bold">
            <button
              onClick={() => onToggleMode('child')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeMode === 'child'
                  ? 'bg-white text-orange-600 shadow-xs ring-1 ring-orange-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🧒</span>
              <span className="hidden xs:inline">מסך</span>
              <span>ילד</span>
            </button>
            <button
              onClick={() => onToggleMode('parent')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeMode === 'parent'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🛡️</span>
              <span className="hidden xs:inline">אזור</span>
              <span>הורים</span>
            </button>
          </div>

          {/* Active Child Profile Pill */}
          <button
            onClick={() => onToggleMode('parent')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 text-xs font-bold transition-colors focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            title="מעבר לאזור הורים וניהול פרופיל ואלרגיות"
          >
            <span className="text-base" role="img" aria-label="avatar">
              {currentProfile.avatar}
            </span>
            <span className="truncate max-w-[65px] sm:max-w-[100px]">
              {currentProfile.name}
            </span>
            {currentProfile.allergens.length > 0 && (
              <span
                className="w-2 h-2 rounded-full bg-rose-500 shrink-0"
                title={`${currentProfile.allergens.length} אלרגיות מוגדרות`}
              />
            )}
          </button>

          {/* Info Modal Button */}
          <button
            onClick={onOpenInfoModal}
            className="p-1.5 sm:p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors focus:outline-hidden"
            title="אודות אב הטיפוס והנתונים"
            aria-label="מידע על הפרויקט"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
