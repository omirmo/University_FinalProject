import React, { useState } from 'react';
import { Send, Sparkles, ArrowRight } from 'lucide-react';

interface ChildInputTextProps {
  onSubmitText: (text: string) => void;
  isLoading: boolean;
  onBack?: () => void;
}

const QUICK_IDEAS = [
  { label: 'שוקולד', emoji: '🍫' },
  { label: 'גלידה', emoji: '🍦' },
  { label: 'צ׳יפס', emoji: '🍟' },
  { label: 'עוגיות', emoji: '🍪' },
  { label: 'סוכריות', emoji: '🍬' },
  { label: 'ארטיק', emoji: '🍧' },
  { label: 'פיצה', emoji: '🍕' },
  { label: 'במבה / בייגלה', emoji: '🥨' },
];

export const ChildInputText: React.FC<ChildInputTextProps> = ({
  onSubmitText,
  isLoading,
  onBack,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmitText(text.trim());
  };

  const handlePickIdea = (idea: string) => {
    setText((prev) => (prev ? `${prev} ${idea}` : idea));
  };

  return (
    <div className="bg-white rounded-[32px] border-4 border-teal-200 shadow-xl p-5 sm:p-6 text-right space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs sm:text-sm font-black border-2 border-teal-200 bubbly-button cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-2xl">✍️</span>
          <h2 className="font-black text-lg sm:text-xl text-stone-900">
            כתבו מה שבא לכם!
          </h2>
        </div>

        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Simple Text Area */}
        <div className="relative">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="למשל: בא לי שוקולד מתוק, או צ'יפס מלוח..."
            className="w-full px-4 py-3.5 rounded-2xl border-3 border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-lg font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-normal resize-none transition-all shadow-inner"
            dir="rtl"
          />
        </div>

        {/* Quick Clickable Emojis */}
        <div className="space-y-2">
          <span className="block text-xs font-black text-stone-600">
            או לחצו על תמונה:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_IDEAS.map((idea) => (
              <button
                key={idea.label}
                type="button"
                onClick={() => handlePickIdea(idea.label)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 text-sm font-black text-teal-900 transition-all active:scale-95 shadow-2xs bubbly-button cursor-pointer"
              >
                <span className="text-lg">{idea.emoji}</span>
                <span>{idea.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Big Submit Button */}
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-black text-lg shadow-lg shadow-teal-200 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all active:scale-[0.98] bubbly-button cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>סיימתי לכתוב! 🚀</span>
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
