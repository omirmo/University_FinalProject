import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  User,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Database,
  ChefHat,
  Info,
  Sparkles,
} from 'lucide-react';
import { AllergenId, ChildProfile, SuggestionItem } from '../types';
import { ALLERGENS_LIST, DEMO_PROFILES, FOOD_CATALOG } from '../data/foodCatalog';

interface ParentAreaViewProps {
  currentProfile: ChildProfile;
  onUpdateProfile: (profile: ChildProfile) => void;
  suggestionCount: number;
  onUpdateSuggestionCount: (count: number) => void;
  parentNote: string;
  onUpdateParentNote: (note: string) => void;
  approvedSuggestions: SuggestionItem[];
  onToggleApproval: (suggestionId: string) => void;
  onBackToChild: () => void;
  onOpenInfoModal: () => void;
}

export const ParentAreaView: React.FC<ParentAreaViewProps> = ({
  currentProfile,
  onUpdateProfile,
  suggestionCount,
  onUpdateSuggestionCount,
  parentNote,
  onUpdateParentNote,
  approvedSuggestions,
  onToggleApproval,
  onBackToChild,
  onOpenInfoModal,
}) => {
  const [profileDraft, setProfileDraft] = useState<ChildProfile>({ ...currentProfile });
  const [newRestriction, setNewRestriction] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const toggleAllergen = (id: AllergenId) => {
    const exists = profileDraft.allergens.includes(id);
    const updated = {
      ...profileDraft,
      allergens: exists
        ? profileDraft.allergens.filter((a) => a !== id)
        : [...profileDraft.allergens, id],
    };
    setProfileDraft(updated);
    onUpdateProfile(updated);
  };

  const handleAddRestriction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestriction.trim()) return;
    const updated = {
      ...profileDraft,
      customDietaryRestrictions: [
        ...(profileDraft.customDietaryRestrictions || []),
        newRestriction.trim(),
      ],
    };
    setProfileDraft(updated);
    onUpdateProfile(updated);
    setNewRestriction('');
  };

  const handleRemoveRestriction = (index: number) => {
    const updated = {
      ...profileDraft,
      customDietaryRestrictions: profileDraft.customDietaryRestrictions.filter(
        (_, i) => i !== index
      ),
    };
    setProfileDraft(updated);
    onUpdateProfile(updated);
  };

  const handleSelectDemoProfile = (demo: ChildProfile) => {
    setProfileDraft({ ...demo });
    onUpdateProfile({ ...demo });
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleSaveAndReturn = () => {
    onUpdateProfile(profileDraft);
    triggerSaveToast();
    setTimeout(() => {
      onBackToChild();
    }, 400);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200" dir="rtl">
      {/* Top Navigation Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/20">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">אזור הורים ובקרת בטיחות</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/40">
                פעיל
              </span>
            </div>
            <p className="text-xs text-stone-300">
              ניהול פרופיל הילד, הגדרות אלרגיה מחמירות, ובקרת המלצות מזון
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToChild}
          className="self-stretch sm:self-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה למסך הילד 🧒</span>
        </button>
      </div>

      {/* Save Notification Toast */}
      {showSavedToast && (
        <div className="p-3 bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          כל ההגדרות והשינויים נשמרו בהצלחה ועודכנו באפליקציה!
        </div>
      )}

      {/* Section 1: Child Profile & Demo Profiles */}
      <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-extrabold text-stone-900">פרופיל הילד/ה</h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            החלפה מהירה בין פרופילי דמו:
          </span>
        </div>

        {/* Demo Profiles Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DEMO_PROFILES.map((dp) => {
            const isSelected = profileDraft.id === dp.id;
            return (
              <button
                key={dp.id}
                type="button"
                onClick={() => handleSelectDemoProfile(dp)}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                    : 'bg-stone-50 hover:bg-amber-50/60 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-2xl">{dp.avatar}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <div className="font-extrabold text-sm">{dp.name}</div>
                  <div
                    className={`text-[11px] ${
                      isSelected ? 'text-amber-100' : 'text-stone-500'
                    }`}
                  >
                    גיל {dp.age} •{' '}
                    {dp.allergens.length > 0
                      ? `${dp.allergens.length} אלרגיות`
                      : 'ללא אלרגיה'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Edit Current Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              שם הילד/ה
            </label>
            <input
              type="text"
              value={profileDraft.name}
              onChange={(e) => {
                const updated = { ...profileDraft, name: e.target.value };
                setProfileDraft(updated);
                onUpdateProfile(updated);
              }}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-semibold text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              גיל
            </label>
            <input
              type="number"
              min={1}
              max={18}
              value={profileDraft.age || ''}
              onChange={(e) => {
                const updated = {
                  ...profileDraft,
                  age: parseInt(e.target.value, 10) || 0,
                };
                setProfileDraft(updated);
                onUpdateProfile(updated);
              }}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-semibold text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              אייקון / דמות
            </label>
            <div className="flex gap-1.5">
              {['👧', '👦', '🧒', '👶', '🦸', '🎨', '🌟'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    const updated = { ...profileDraft, avatar: emoji };
                    setProfileDraft(updated);
                    onUpdateProfile(updated);
                  }}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    profileDraft.avatar === emoji
                      ? 'bg-amber-100 border-2 border-amber-500 scale-105'
                      : 'bg-stone-50 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Allergies & Dietary Restrictions */}
      <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                ניהול אלרגיות ומגבלות תזונה
              </h2>
              <p className="text-xs text-stone-500">
                סינון מוחלט של כל מאכל המכיל או עלול להכיל רכיבים אלו טרם הצגת ההמלצות
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            {profileDraft.allergens.length} אלרגיות מוחרגות
          </span>
        </div>

        {/* 9 Standard Allergens Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ALLERGENS_LIST.map((allergen) => {
            const isChecked = profileDraft.allergens.includes(allergen.id);
            return (
              <button
                key={allergen.id}
                type="button"
                onClick={() => toggleAllergen(allergen.id)}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border text-right transition-all ${
                  isChecked
                    ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-2xs'
                    : 'bg-stone-50/70 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-extrabold">{allergen.labelHe}</div>
                  <div className="text-[10px] text-stone-500 leading-tight">
                    {allergen.descriptionHe}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Restrictions */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <label className="block text-xs font-bold text-stone-800">
            הגבלות תזונתיות נוספות (כגון הימנעות מסוכר מעובד, צמחוני, כשר):
          </label>
          <form onSubmit={handleAddRestriction} className="flex gap-2">
            <input
              type="text"
              placeholder="למשל: ללא סוכר לבן, ללא צבעי מאכל מלאכותיים..."
              value={newRestriction}
              onChange={(e) => setNewRestriction(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              הוסף הגבלה
            </button>
          </form>

          {profileDraft.customDietaryRestrictions &&
            profileDraft.customDietaryRestrictions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profileDraft.customDietaryRestrictions.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveRestriction(idx)}
                      className="text-amber-500 hover:text-rose-600"
                      title="הסר"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Section 3: Recommendation Settings & Parent Context Note */}
      <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-base font-extrabold text-stone-900">
              הגדרות בקשה והתאמת חלופות
            </h2>
            <p className="text-xs text-stone-500">
              התאמת מספר החלופות המוצגות והערת הקשר קבועה לבקשות הילד
            </p>
          </div>
        </div>

        {/* Suggestion Count Stepper */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-4">
          <div>
            <span className="font-extrabold text-xs text-stone-900 block">
              מספר חלופות להצגה בכל בקשה:
            </span>
            <span className="text-[11px] text-stone-500">
              ברירת מחדל: 3 חלופות (ניתן להגדיר בין 1 ל-5)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-amber-200">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  onUpdateSuggestionCount(num);
                  triggerSaveToast();
                }}
                className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all ${
                  suggestionCount === num
                    ? 'bg-amber-500 text-white shadow-xs scale-105'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Parent Note */}
        <div>
          <label className="block text-xs font-bold text-stone-800 mb-1">
            הערת הקשר של ההורה (מתווספת לבקשות הילד):
          </label>
          <p className="text-[11px] text-stone-500 mb-2">
            הערה זו מכוונת את מנוע החלופות (למשל: "מחפשים משהו מתוק וכהה", או "נשנוש פריך לאחה״צ")
          </p>
          <textarea
            rows={2}
            value={parentNote}
            onChange={(e) => {
              onUpdateParentNote(e.target.value);
            }}
            placeholder="למשל: מחפשים משהו שוקולדי וקריר..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-stone-800"
          />
        </div>
      </div>

      {/* Section 4: Approved Suggestions in this Session */}
      <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                חלופות שאושרו על ידי ההורה ({approvedSuggestions.length})
              </h2>
              <p className="text-xs text-stone-500">
                רשימת הרעיונות שההורה אישר במהלך השימוש באפליקציה
              </p>
            </div>
          </div>
        </div>

        {approvedSuggestions.length === 0 ? (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
            טרם אושרו חלופות. כאשר תוצגנה חלופות למאכלי הילד, תוכלו ללחוץ על "אשר חלופה זו" כדי לסמנן כאן.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {approvedSuggestions.map((sug) => (
              <div
                key={sug.id}
                className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl">{sug.foodItem.emoji}</span>
                  <div>
                    <span className="font-extrabold text-xs text-stone-900 block">
                      {sug.foodItem.nameHe}
                    </span>
                    <span className="text-[11px] text-stone-600 block">
                      {sug.foodItem.category}
                    </span>
                    {sug.foodItem.prepIdeaHe && (
                      <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                        💡 {sug.foodItem.prepIdeaHe}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleApproval(sug.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 rounded-lg"
                  title="בטל אישור"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 5: Data Transparency & Health Notice */}
      <div className="bg-amber-500/10 rounded-3xl border border-amber-300 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-extrabold text-amber-950">
              שקיפות נתונים ואחריות הורית
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenInfoModal}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            מידע מורחב על אב-הטיפוס
          </button>
        </div>

        <p className="text-xs text-amber-900 leading-relaxed">
          מערכת YumWise היא אב-טיפוס ואינה גורם רפואי או תזונתי. נתונים תזונתיים מוצגים אך ורק
          כאשר קיים מקור מעבדתי מאומת (מאגר USDA ומאגר משרד הבריאות). ההורה אחראי באופן
          בלעדי לאמת את תוויות הרכיבים ואזהרות האלרגנים על גבי אריזת המזון.
        </p>
      </div>

      {/* Sticky Bottom Bar to Return to Child Mode */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-amber-200 shadow-md">
        <span className="text-xs font-bold text-stone-700">
          פרופיל פעיל: <strong>{profileDraft.name}</strong> •{' '}
          {profileDraft.allergens.length > 0
            ? `${profileDraft.allergens.length} אלרגיות מוחרגות`
            : 'ללא אלרגיות'}
        </span>

        <button
          type="button"
          onClick={handleSaveAndReturn}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>שמור וחזור למסך הילד</span>
        </button>
      </div>
    </div>
  );
};
