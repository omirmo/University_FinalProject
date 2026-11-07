import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { AllergenId, ChildProfile } from '../types';
import { ALLERGENS_LIST, DEMO_PROFILES } from '../data/foodCatalog';

interface ParentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: ChildProfile;
  onSaveProfile: (profile: ChildProfile) => void;
  suggestionCount: number;
  onUpdateSuggestionCount: (count: number) => void;
  parentNote: string;
  onUpdateParentNote: (note: string) => void;
}

export const ParentProfileModal: React.FC<ParentProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  suggestionCount,
  onUpdateSuggestionCount,
  parentNote,
  onUpdateParentNote,
}) => {
  const [profileDraft, setProfileDraft] = useState<ChildProfile>({ ...currentProfile });
  const [newRestriction, setNewRestriction] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const toggleAllergen = (id: AllergenId) => {
    setProfileDraft((prev) => {
      const exists = prev.allergens.includes(id);
      return {
        ...prev,
        allergens: exists
          ? prev.allergens.filter((a) => a !== id)
          : [...prev.allergens, id],
      };
    });
  };

  const handleAddRestriction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestriction.trim()) return;
    setProfileDraft((prev) => ({
      ...prev,
      customDietaryRestrictions: [
        ...(prev.customDietaryRestrictions || []),
        newRestriction.trim(),
      ],
    }));
    setNewRestriction('');
  };

  const handleRemoveRestriction = (index: number) => {
    setProfileDraft((prev) => ({
      ...prev,
      customDietaryRestrictions: prev.customDietaryRestrictions.filter((_, i) => i !== index),
    }));
  };

  const selectDemoProfile = (demo: ChildProfile) => {
    setProfileDraft({ ...demo });
  };

  const handleSave = () => {
    onSaveProfile(profileDraft);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                אזור הורים וניהול אלרגיות
              </h2>
              <p className="text-xs text-stone-500">
                הגדרת פרופיל הילד, בטיחות רכיבים והגדרות מערכת
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm text-stone-700">
          {/* Quick Demo Profile Switcher */}
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80">
            <span className="block text-xs font-bold text-amber-900 mb-2">
              בחר מתוך פרופילי דמו לבדיקה מהירה:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_PROFILES.map((dp) => {
                const isSelected = profileDraft.id === dp.id;
                return (
                  <button
                    key={dp.id}
                    type="button"
                    onClick={() => selectDemoProfile(dp)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white hover:bg-amber-100/50 text-stone-800 border-stone-200'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{dp.avatar}</span>
                    <span className="font-bold">{dp.name} ({dp.age})</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? 'text-amber-100' : 'text-stone-500'
                      }`}
                    >
                      {dp.allergens.length > 0
                        ? `${dp.allergens.length} אלרגיות`
                        : 'ללא אלרגיה'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Child Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                שם הילד/ה
              </label>
              <input
                type="text"
                value={profileDraft.name}
                onChange={(e) =>
                  setProfileDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                גיל (שנים)
              </label>
              <input
                type="number"
                min={1}
                max={18}
                value={profileDraft.age || ''}
                onChange={(e) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    age: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium"
              />
            </div>
          </div>

          {/* Allergens Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                רשימת אלרגיות למזון (החרגה מוחלטת):
              </label>
              <span className="text-[11px] text-rose-600 font-semibold">
                {profileDraft.allergens.length} נבחרו להחרגה
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mb-2">
              כל חלופה המכילה או עלולה להכיל רכיבים אלו תסונן באופן מוחלט לפני הצגת ההמלצות.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALLERGENS_LIST.map((allergen) => {
                const isChecked = profileDraft.allergens.includes(allergen.id);
                return (
                  <button
                    key={allergen.id}
                    type="button"
                    onClick={() => toggleAllergen(allergen.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-right transition-all ${
                      isChecked
                        ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-rose-500 border-rose-600 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs">{allergen.labelHe}</div>
                      <div className="text-[10px] text-stone-500 leading-tight">
                        {allergen.descriptionHe}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Dietary Restrictions */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              הגבלות תזונתיות נוספות או העדפות מיוחדות:
            </label>
            <form onSubmit={handleAddRestriction} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="לדוגמה: ללא סוכר לבן, צמחוני, כשר..."
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                הוסף
              </button>
            </form>
            {profileDraft.customDietaryRestrictions &&
              profileDraft.customDietaryRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profileDraft.customDietaryRestrictions.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-medium text-stone-800"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveRestriction(idx)}
                        className="text-stone-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
          </div>

          {/* Configurable Number of Suggestions */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                מספר חלופות להצגה (ברירת מחדל: 3)
              </div>
              <p className="text-[11px] text-stone-500">
                בחרו כמה חלופות בריאות יסוננו ויוצגו בכל בקשה (1 עד 5)
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdateSuggestionCount(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    suggestionCount === num
                      ? 'bg-amber-500 text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Parent Context Note Setting */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              הערת הורה קבועה או הקשר לבקשה (אופציונלי):
            </label>
            <textarea
              rows={2}
              value={parentNote}
              onChange={(e) => onUpdateParentNote(e.target.value)}
              placeholder="למשל: מחפשים משהו שוקולדי וקריר, או נשנוש פריך לאחה״צ..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
            />
          </div>

          {/* Parental Responsibility Disclaimer */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-700" />
              אחריות הורית ובטיחות מזון
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              האפליקציה היא אב-טיפוס ואינה מהווה תחליף לייעוץ רפואי, תזונתי או בדיקת תוויות מזון.
              ההורה אחראי באופן בלעדי לבדוק את רשימת הרכיבים ואזהרות האלרגנים על גבי המוצר הנרכש.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            {saveToast ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                נשמר בהצלחה!
              </>
            ) : (
              'שמור שינויים'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
