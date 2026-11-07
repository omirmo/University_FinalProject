import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  ThumbsUp,
  ChefHat,
  Database,
  ExternalLink,
} from 'lucide-react';
import { ChildProfile, SuggestionItem } from '../types';

interface ResultsViewProps {
  childRequest: string;
  parentNote?: string;
  currentProfile: ChildProfile;
  suggestions: SuggestionItem[];
  isLoading: boolean;
  onNewRequest: () => void;
  onToggleParentApproval: (suggestionId: string) => void;
  onOpenProfileSettings: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  childRequest,
  parentNote,
  currentProfile,
  suggestions,
  isLoading,
  onNewRequest,
  onToggleParentApproval,
  onOpenProfileSettings,
}) => {
  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200" dir="rtl">
      {/* Request Recap Card */}
      <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✨</span>
            <h2 className="text-lg font-extrabold text-stone-900">
              החלופות המובילות עבור:{' '}
              <span className="text-orange-600 underline underline-offset-4 decoration-amber-300">
                "{childRequest}"
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span>
              התאמה עבור: <strong>{currentProfile.name}</strong> (גיל {currentProfile.age})
            </span>
            {currentProfile.allergens.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                הוחרגו אלרגיות: {currentProfile.allergens.join(', ')}
              </span>
            )}
            {parentNote && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                הערת הורה: "{parentNote}"
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onNewRequest}
          className="self-stretch sm:self-auto px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          בקשה חדשה
        </button>
      </div>

      {/* Parental Responsibility Top Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <span className="font-bold">אחריות ההורה לאישור סופי: </span>
          האפליקציה אינה גורם רפואי או תזונאי מקצועי. כל ההצעות עברו סינון אלרגנים ראשוני
          לפי הפרופיל, אך נדרשת בדיקת רכיבים פיזית של ההורה על גבי אריזת המזון טרם ההגשה לילד.
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl border border-stone-200 p-5 animate-pulse space-y-3"
            >
              <div className="h-6 w-1/3 bg-amber-100 rounded-lg" />
              <div className="h-4 w-3/4 bg-stone-100 rounded-lg" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-16 bg-stone-50 rounded-xl" />
                <div className="h-16 bg-stone-50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Safe Alternatives State */}
      {!isLoading && suggestions.length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-rose-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              לא נמצאו חלופות בטוחות העומדות בכל מגבלות האלרגיה
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              מערכת הבטיחות סיננה את כל המאכלים שנמצאו בספק או המכילים אלרגנים המוגדרים
              בפרופיל של {currentProfile.name}. מומלץ לעיין בהגדרות האלרגיה או לנסח בקשה שונה.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenProfileSettings}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              ערוך הגדרות פרופיל ואלרגיות
            </button>
            <button
              onClick={onNewRequest}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
            >
              נסה לבקש מאכל אחר
            </button>
          </div>
        </div>
      )}

      {/* List of Suggestion Cards */}
      {!isLoading && suggestions.length > 0 && (
        <div className="space-y-5">
          {suggestions.map((sug, index) => {
            const item = sug.foodItem;
            const isApproved = sug.parentApproved;
            const hasVerifiedNutrition = item.isVerifiedData && item.nutritionFacts;

            return (
              <div
                key={sug.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                  isApproved
                    ? 'border-emerald-400 ring-2 ring-emerald-200/60'
                    : 'border-amber-200/80'
                }`}
              >
                {/* Card Top Banner: Food name, category, and approval button */}
                <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50/40 via-white to-transparent">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-amber-100/70 border border-amber-200/60 shrink-0">
                      {item.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          הצעה #{index + 1} • {item.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-stone-900 mt-0.5">
                        {item.nameHe}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">{item.descriptionHe}</p>
                    </div>
                  </div>

                  {/* Parent Approval Button */}
                  <button
                    type="button"
                    onClick={() => onToggleParentApproval(sug.id)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                      isApproved
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        אושר ע״י הורה ✓
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-3.5 h-3.5" />
                        אשר חלופה זו
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Allergen Status Pill - Clear and Never False-Safe */}
                  <div>
                    {sug.allergenReport.needsParentVerification ? (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold">
                            בדיקת אלרגנים: דורש אימות הורה על גבי האריזה
                          </span>
                          <p className="text-[11px] text-amber-800">
                            {sug.allergenReport.verificationReason ||
                              'סטטוס אלרגנים של פריט זה טרם אומת באופן רשמי. יש לבדוק אזהרות אלרגנים בעת הקנייה.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold">
                            בדיקת אלרגנים: עומד בהגדרות הפרופיל שנבדקו
                          </span>
                          <p className="text-[11px] text-emerald-800">
                            לא נמצאו רכיבי {currentProfile.allergens.join(', ')} בפריט זה.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resemblance Breakdown: Taste, Texture, Color, Consistency */}
                  <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                    <span className="block text-xs font-bold text-stone-800">
                      איך החלופה הזו מזכירה את החשק ל-"{childRequest}"?
                    </span>
                    <p className="text-xs text-stone-600 font-medium">
                      {sug.resemblance.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <span className="font-bold text-amber-700 block mb-0.5">
                          👅 {sug.resemblance.taste}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <span className="font-bold text-orange-700 block mb-0.5">
                          ✨ {sug.resemblance.texture}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <span className="font-bold text-stone-700 block mb-0.5">
                          🎨 {sug.resemblance.color}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <span className="font-bold text-stone-700 block mb-0.5">
                          ❄️ {sug.resemblance.consistency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Comparison & Source Rule */}
                  <div className="pt-1">
                    {hasVerifiedNutrition ? (
                      <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                            <Database className="w-4 h-4 text-teal-700" />
                            מידע תזונתי מאומת ממקור רשמי
                          </span>
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-300">
                            נתונים מאומתים
                          </span>
                        </div>

                        {/* Nutrition Source Label */}
                        <p className="text-[11px] text-teal-800 font-semibold">
                          מקור הנתונים: {item.nutritionDataSource}
                        </p>

                        {/* Nutritional Highlights */}
                        <div className="grid grid-cols-3 gap-2 py-1 text-center">
                          <div className="bg-white/80 p-2 rounded-xl border border-teal-200">
                            <span className="text-[10px] text-stone-500 block">קלוריות</span>
                            <span className="text-xs font-extrabold text-stone-800">
                              {item.nutritionFacts?.calories} קק״ל
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-teal-200">
                            <span className="text-[10px] text-stone-500 block">סיבים</span>
                            <span className="text-xs font-extrabold text-stone-800">
                              {item.nutritionFacts?.fiberGrams} גרם
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-teal-200">
                            <span className="text-[10px] text-stone-500 block">סוכר מוסף</span>
                            <span className="text-xs font-extrabold text-emerald-700">
                              {item.nutritionFacts?.addedSugarGrams || 0} גרם
                            </span>
                          </div>
                        </div>

                        <ul className="text-xs space-y-1 list-disc list-inside text-teal-900 font-medium">
                          {item.nutritionFacts?.highlightsHe.map((hl, i) => (
                            <li key={i}>{hl}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      /* Explicit Unverified Disclaimer Rule */
                      <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-stone-800">
                            הערך התזונתי לא אומת במאגר רשמי (פריט דמו)
                          </span>
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            מערכת האב-טיפוס אינה ממציאה קלוריות או ערכי תזונה ללא מקור מוסמך.
                            ההמלצה מתבססת על דמיון חושי (טעם, מרקם וצבע) בלבד.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Kitchen Prep Idea for Kids */}
                  {item.prepIdeaHe && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50/60 border border-orange-200 text-xs text-orange-950 font-medium">
                      <ChefHat className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">רעיון קל להכנה או הגשה יחד עם הילד: </span>
                        {item.prepIdeaHe}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button to Make Another Request */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={onNewRequest}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-md shadow-orange-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          חיפוש חלופה למאכל נוסף
        </button>
      </div>
    </div>
  );
};
