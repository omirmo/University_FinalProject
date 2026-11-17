import React from 'react';
import {
  X,
  ShieldCheck,
  Flame,
  Activity,
  Heart,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Check,
  Scale,
} from 'lucide-react';

export interface FoodParentDetail {
  id: string;
  title: string;
  emoji: string;
  calories: number;
  servingSize: string;
  protein: string;
  carbs: string;
  fats: string;
  fiber: string;
  sugars: string;
  texture: {
    feel: string;
    chewiness: string;
    sweetness: string;
    sensoryNote: string;
  };
  benefits: string[];
  allergenWarning: string;
  isAllergenSafeNote?: string;
  parentTip: string;
}

export const FOOD_PARENT_DETAILS: Record<string, FoodParentDetail> = {
  'peanut-butter': {
    id: 'peanut-butter',
    title: 'פרוסה עם ממרח חמאת בוטנים',
    emoji: '🥜🥪',
    calories: 195,
    servingSize: 'פרוסת לחם מלא (35 גרם) + כף חמאת בוטנים טבעית 100% (15 גרם)',
    protein: '7.2 גרם',
    carbs: '18.4 גרם',
    fats: '9.8 גרם (שומן בלתי-רווי בריא)',
    fiber: '3.1 גרם',
    sugars: '2.4 גרם (ללא תוספת סוכר)',
    texture: {
      feel: 'קרמי, סמיך ועשיר',
      chewiness: 'רך ונימוח, נמרח בקלות',
      sweetness: 'מתיקות טבעית עדינה עם רמז מליחות',
      sensoryNote:
        'מרקם עוטף ומנחם הדומה לממרחי שוקולד, אך עם אינדקס גליקמי נמוך ושובע ממושך.',
    },
    benefits: [
      'מקור מצוין לחלבון צמחי התומך בבניית שרירים ובגדילה תקינה',
      'שומנים בלתי-רווים איכותיים התורמים להתפתחות קוגניטיבית ומוחית',
      'עשיר במגנזיום, ויטמין E ונוגדי חמצון טבעיים',
      'משחרר אנרגיה בהדרגה ומונע נפילות סוכר ועייפות אחה״צ',
    ],
    allergenWarning:
      'שימו לב: מכיל בוטנים! במידה ולילד יש אלרגיה ידועה לבוטנים, יש להחליף בחמאת זרעי חמניות (סאנבאטר) המספקת מרקם וטעם דומים לחלוטין וללא בוטנים.',
    parentTip:
      'המלצת הגשה להורים: העדיפו חמאת בוטנים 100% המכילה אך ורק בוטנים קלויים (ללא שמן דקלים, תוספת סוכר או מלח עודף). להגברת המתיקות הטבעית, הניחו מעל פרוסות בננה טרייה או תפוח.',
  },
  'jam': {
    id: 'jam',
    title: 'פרוסה עם ריבה',
    emoji: '🍓🥪',
    calories: 138,
    servingSize: 'פרוסת לחם מלא (35 גרם) + כפית גדושה ריבת תות 100% פרי (18 גרם)',
    protein: '2.8 גרם',
    carbs: '27.6 גרם',
    fats: '0.8 גרם',
    fiber: '2.2 גרם',
    sugars: '13.2 גרם (סוכרי פרי טבעיים)',
    texture: {
      feel: 'ג׳לטיני חלק, לח ונמס בפה',
      chewiness: 'רך מאוד וקל לבליעה',
      sweetness: 'מתיקות פירותית מובהקת עם חמצמצות עדינה',
      sensoryNote:
        'תחושת רעננות וקלילות שילדים אוהבים במיוחד, מעולה במקום ממתקים מעובדים.',
    },
    benefits: [
      'אספקת אנרגיה זמינה וקלה לעיכול לפני חוגים, ספורט או לימודים',
      'מכיל נוגדי חמצון טבעיים (אנתוציאנינים) מפירות יער המסייעים לחיזוק הגוף',
      'ללא שומן רווי ונטול כולסטרול לחלוטין',
      'קל מאוד לעיכול ומתאים במיוחד לילדים בררני מרקמים סמיכים',
    ],
    allergenWarning:
      'בטוח מבחינת אלרגנים מרכזיים: נטול אגוזים, ללא חלב וללא ביצים. (יש לבחור לחם מתאים במידה ונדרש ללא גלוטן).',
    parentTip:
      'המלצת הגשה להורים: העדיפו מעדן 100% פרי שבו הרכיב הראשון הוא פרי אמיתי ללא תוספת סירופ תירס. ניתן גם לרקוח ריבה ביתית פשוטה מפירות יער קפואים מבושלים עם כפית זרעי צ׳יה.',
  },
  'silan': {
    id: 'silan',
    title: 'פרוסה עם סילאן',
    emoji: '🍯🥪',
    calories: 152,
    servingSize: 'פרוסת לחם מלא (35 גרם) + כף סילאן תמרים טבעי טהור (15 גרם)',
    protein: '3.1 גרם',
    carbs: '31.5 גרם',
    fats: '0.6 גרם',
    fiber: '2.8 גרם',
    sugars: '16.4 גרם (מקור טבעי מתמרי מג׳הול)',
    texture: {
      feel: 'נוזלי-סמיך, דביק, משי וחם',
      chewiness: 'עוטף את פרוסת הלחם ברכות מלטפת',
      sweetness: 'מתיקות עמוקה, קרמלית ומרוכזת',
      sensoryNote:
        'חלופה טבעית ומזינה לדבש ולממרחי שוקולד, עם מרקם עשיר וחם שמחליק בקלות בגרון.',
    },
    benefits: [
      'מקור טבעי עשיר במינרלים חיוניים: אשלגן, מגנזיום, ברזל וסידן',
      'סוכר פירות טבעי מתמרים שלמים, ללא תוספת סוכר לבן או חומרים משמרים',
      'תורם לבריאות מערכת החיסון הודות לפוליפנולים נוגדי חמצון',
      'תומך בפעילות מערכת העיכול הודות לסיבים התזונתיים המסיסים',
    ],
    allergenWarning:
      'נטול אלרגנים מרכזיים: טבעי לחלוטין, טבעוני, ללא לקטוז, ללא אגוזים וללא סויה.',
    parentTip:
      'שילוב מנצח להורים: ערבבו כפית סילאן עם כפית טחינה גולמית מלאה ליצירת "ממרח חלבה טבעי" עשיר בסידן, ברזל ושומנים חיוניים שילדים נהנים ממנו מאוד!',
  },
};

interface ParentFoodDetailModalProps {
  foodId: string | null;
  onClose: () => void;
  onSelectForChild: (foodTitle: string) => void;
}

export const ParentFoodDetailModal: React.FC<ParentFoodDetailModalProps> = ({
  foodId,
  onClose,
  onSelectForChild,
}) => {
  if (!foodId) return null;

  const detail = FOOD_PARENT_DETAILS[foodId] || FOOD_PARENT_DETAILS['peanut-butter'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92dvh]"
        dir="rtl"
      >
        {/* Top Header - Designed for Parents */}
        <div className="px-5 py-4 border-b-2 border-amber-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  מידע להורים
                </span>
                <span className="text-xs text-stone-500 font-bold">
                  ערכים, מרקם ותזונה
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 leading-tight">
                {detail.title} {detail.emoji}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            title="סגירה"
            aria-label="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="min-h-0 p-5 overflow-y-auto overscroll-contain space-y-5 text-right">
          {/* Quick Nutritional Macro Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                ערכים תזונתיים למנה
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {detail.servingSize}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-2xl bg-orange-50 border-2 border-orange-200 text-center">
                <span className="text-[10px] font-bold text-orange-800 block">
                  קלוריות
                </span>
                <span className="text-lg font-black text-orange-600">
                  {detail.calories}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-teal-50 border-2 border-teal-200 text-center">
                <span className="text-[10px] font-bold text-teal-800 block">
                  חלבון
                </span>
                <span className="text-base font-black text-teal-700">
                  {detail.protein}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-800 block">
                  פחמימות
                </span>
                <span className="text-base font-black text-amber-700">
                  {detail.carbs}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-purple-50 border-2 border-purple-200 text-center">
                <span className="text-[10px] font-bold text-purple-800 block">
                  סיבים
                </span>
                <span className="text-base font-black text-purple-700">
                  {detail.fiber}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-stone-600 px-1 font-medium">
              <span>שומנים: {detail.fats}</span>
              <span>סוכרים: {detail.sugars}</span>
            </div>
          </div>

          {/* Texture & Sensory Analysis */}
          <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-stone-900">
                ניתוח מרקם ותחושת פה לילד
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 block">תחושה:</span>
                <span className="font-black text-stone-800">{detail.texture.feel}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 block">לעיסות:</span>
                <span className="font-black text-stone-800">{detail.texture.chewiness}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 block">מתיקות:</span>
                <span className="font-black text-stone-800">{detail.texture.sweetness}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-stone-200">
              💡 <strong>מדד תחושתי:</strong> {detail.texture.sensoryNote}
            </p>
          </div>

          {/* Pediatric Health Benefits */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              יתרונות בריאותיים מרכזיים
            </h3>
            <ul className="space-y-1.5">
              {detail.benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs font-semibold text-stone-700 bg-amber-50/50 p-2 rounded-xl border border-amber-200/70"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Allergen & Safety Advisory */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-stone-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-black text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>בדיקת בטיחות ואלרגנים</span>
            </div>
            <p className="font-medium text-stone-700 leading-relaxed">
              {detail.allergenWarning}
            </p>
          </div>

          {/* Practical Parent Serving Tip */}
          <div className="p-3.5 rounded-2xl bg-teal-50 border-2 border-teal-200 text-stone-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-black text-teal-900">
              <Lightbulb className="w-4 h-4 text-teal-600" />
              <span>טיפ מעשי להורים</span>
            </div>
            <p className="font-medium text-stone-700 leading-relaxed">
              {detail.parentTip}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t-2 border-stone-100 bg-stone-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 text-xs font-black text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-2xl transition-colors cursor-pointer"
          >
            חזרה להצעות
          </button>
          <button
            type="button"
            onClick={() => onSelectForChild(detail.title)}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95 bubbly-button cursor-pointer"
          >
            <span>בחר מאכל זה עבור הילד 😋</span>
          </button>
        </div>
      </div>
    </div>
  );
};
