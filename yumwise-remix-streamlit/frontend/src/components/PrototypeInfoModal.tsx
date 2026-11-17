import React from 'react';
import { X, CheckCircle, Database, Cpu, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface PrototypeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrototypeInfoModal: React.FC<PrototypeInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90dvh] animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                אודות אב-הטיפוס YumWise
              </h2>
              <p className="text-xs text-stone-500">סטטוס פרויקט סטודנטיאלי ושקיפות נתונים</p>
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
        <div className="min-h-0 p-5 overflow-y-auto overscroll-contain space-y-5 text-xs text-stone-700 leading-relaxed text-right">
          {/* Real Functions Section */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              פונקציות אמיתיות ופעילות באב-הטיפוס
            </span>
            <ul className="space-y-1 text-emerald-950 list-disc list-inside">
              <li>
                <strong>חלופות בכתיבה:</strong> אחרי אישור הבקשה, Gemini יוצר רעיונות חדשים
                לפי התיאור שהוקלד והעדפות הפרופיל.
              </li>
              <li>
                <strong>ציור וקול:</strong> בציור מוצגות חלופות להדגמה. מסך הקול מאפשר הקלטה והשמעה בדפדפן.
              </li>
              <li>
                <strong>העדפות ואלרגנים:</strong> הגדרות הפרופיל משמשות בבקשת הכתיבה.
                כל הצעה שנוצרה באמצעות Gemini דורשת בדיקה של ההורה.
              </li>
              <li>
                <strong>התאמת דמיון חושי:</strong> ניתוח ארבעה ממדים: טעם, מרקם, צבע ועקביות/טמפרטורה.
              </li>
            </ul>
          </div>

          {/* Demo Data Section */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
              <Database className="w-4 h-4 text-amber-600" />
              נתוני דמו לעומת נתונים מאומתים
            </span>
            <ul className="space-y-1 text-amber-950 list-disc list-inside">
              <li>
                <strong>דוגמאות במסך הציור:</strong> מיועדות להדגמת הממשק.
              </li>
              <li>
                <strong>חלופות שנוצרו בכתיבה:</strong> מוצגות עם תיאור ורעיון להגשה. ערכי תזונה דורשים מקור מאומת.
              </li>
            </ul>
          </div>

          {/* Future Integrations Needed */}
          <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 space-y-2">
            <span className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
              <Cpu className="w-4 h-4 text-stone-700" />
              אינטגרציות הנדרשות לשלבי ייצור עתידיים
            </span>
            <ul className="space-y-1 text-stone-600 list-disc list-inside">
              <li>
                חיבור חי ל-API של מאגר המזון הלאומי של משרד הבריאות ומאגר ברקודים ישראלי / בינלאומי.
              </li>
              <li>
                בדיקה רגולטורית קלינית של אלרגולוג מומחה ותזונאי ילדים מוסמך.
              </li>
              <li>
                אפשרות לסריקת ברקוד חיה מהטלפון כדי לאמת את רשימת הרכיבים המדויקת של האצווה בחנות.
              </li>
              <li>
                ניהול חשבונות משתמשים מאובטח (הגנת נתוני קטינים ו-COPPA/GDPR-K).
              </li>
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              הבהרה רפואית
            </span>
            <p className="text-[11px] leading-relaxed">
              האפליקציה אינה מהווה ייעוץ רפואי, אבחון או תחליף לקריאת תוויות אלרגנים על האריזה.
              האחריות על אישור המאכל היא בלעדית של ההורה האחראי.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 text-white font-bold text-xs hover:bg-stone-900 transition-colors"
          >
            הבנתי, תודה
          </button>
        </div>
      </div>
    </div>
  );
};
