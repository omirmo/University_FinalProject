import React, { useState } from 'react';
import { Send, Sparkles, Keyboard } from 'lucide-react';

interface ChildInputTextProps {
  onSubmitText: (text: string) => void;
  isLoading: boolean;
}

const QUICK_IDEAS = [
  { label: 'שוקולד חלב מתוק', emoji: '🍫' },
  { label: 'צ׳יפס פריך ומלוח', emoji: '🍟' },
  { label: 'גלידת תות מרעננת', emoji: '🍨' },
  { label: 'סוכריות גומי צבעוניות', emoji: '🍬' },
  { label: 'עוגיות שוקולד צ׳יפס', emoji: '🍪' },
  { label: 'ארטיק קרח קר קר', emoji: '🍧' },
  { label: 'חטיף מלוח קראנצ׳י', emoji: '🥨' },
];

export const ChildInputText: React.FC<ChildInputTextProps> = ({
  onSubmitText,
  isLoading,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    // Strictly preserve child's text without any rewriting!
    onSubmitText(text.trim());
  };

  const handlePickIdea = (idea: string) => {
    setText(idea);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-teal-200/80 shadow-md p-5 sm:p-6 text-right space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl shadow-xs">
          ✍️
        </div>
        <div>
          <h3 className="font-black text-base sm:text-lg text-stone-900 leading-tight">
            איזה  נשנוש מתחשק לך עכשיו?
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            הקלידו במילים שלכם בדיוק מה שבא לכם לאכול
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="למשל: בא לי שוקולד חלב נימוח, או צ'יפס מלוח וקראנצ'י..."
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-base font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-normal resize-none transition-all shadow-inner"
            dir="rtl"
          />
        </div>

        {/* Quick idea chips for kids */}
        <div className="space-y-2">
          <span className="block text-xs font-black text-stone-700">
            אפשר גם ללחוץ על רעיון מהיר:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_IDEAS.map((idea) => (
              <button
                key={idea.label}
                type="button"
                onClick={() => handlePickIdea(idea.label)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-black text-teal-900 transition-all active:scale-95 shadow-2xs"
              >
                <span className="text-base">{idea.emoji}</span>
                <span>{idea.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-black text-base shadow-lg shadow-teal-200 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Sparkles className="w-5 h-5" />
          <span>סיימתי לכתוב — מצא לי חלופות!</span>
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
