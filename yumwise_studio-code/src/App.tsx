/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ParentAreaView } from './components/ParentAreaView';
import { ParentProfileModal } from './components/ParentProfileModal';
import { PrototypeInfoModal } from './components/PrototypeInfoModal';
import { ChildInputCanvas } from './components/ChildInputCanvas';
import { ChildInputText } from './components/ChildInputText';
import { ChildInputVoice } from './components/ChildInputVoice';
import { RequestConfirmationModal } from './components/RequestConfirmationModal';
import { ResultsView } from './components/ResultsView';
import { DEMO_PROFILES, ALLERGENS_LIST } from './data/foodCatalog';
import { ChildProfile, FoodRequestState, SuggestionItem } from './types';
import {
  recognizeDrawingApi,
  fetchAlternativesApi,
} from './services/apiClient';
import {
  Paintbrush,
  Keyboard,
  Mic,
  ShieldCheck,
  Sparkles,
  Heart,
  Settings2,
  AlertTriangle,
  Info,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  // Profiles and Settings State
  const [currentProfile, setCurrentProfile] = useState<ChildProfile>(DEMO_PROFILES[0]); // Maya: Peanuts & Milk
  const [suggestionCount, setSuggestionCount] = useState<number>(3); // Configurable count: default 3
  const [parentNote, setParentNote] = useState<string>('מחפשים משהו מתוק וטעים לאחה״צ');
  const [activeMode, setActiveMode] = useState<'child' | 'parent'>('child');

  // Input Method & Flow State
  const [inputTab, setInputTab] = useState<'draw' | 'text' | 'voice'>('draw');
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [requestState, setRequestState] = useState<FoodRequestState | null>(null);

  // Results State
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[] | null>(null);
  const [lastConfirmedRequest, setLastConfirmedRequest] = useState<string>('');
  const [approvedSuggestions, setApprovedSuggestions] = useState<SuggestionItem[]>([]);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Handle Drawing Submission
  const handleSubmitDrawing = async (base64Png: string) => {
    setIsProcessingInput(true);
    try {
      const recognition = await recognizeDrawingApi(base64Png);
      setRequestState({
        inputType: 'draw',
        rawInput: recognition.detectedFoodHe,
        recognizedCategory: recognition.categoryHe,
        isAiRecognized: true,
        recognitionCertaintyNote: recognition.noteHe,
        drawingImageBase64: base64Png,
        parentNote: parentNote,
        confirmedText: recognition.detectedFoodHe,
      });
      setIsConfirmationOpen(true);
    } catch (error) {
      console.error('Drawing recognition error:', error);
      // Fallback: still let the child proceed with manual entry
      setRequestState({
        inputType: 'draw',
        rawInput: 'חטיף מתוק או צ׳יפס',
        isAiRecognized: false,
        recognitionCertaintyNote: 'לא ניתן היה לפענח את הציור במדויק. אנא הקלידו את המאכל הרצוי.',
        drawingImageBase64: base64Png,
        parentNote: parentNote,
        confirmedText: '',
      });
      setIsConfirmationOpen(true);
    } finally {
      setIsProcessingInput(false);
    }
  };

  // Handle Text Submission
  const handleSubmitText = (text: string) => {
    // Strictly preserve child's text without rewriting!
    setRequestState({
      inputType: 'text',
      rawInput: text,
      parentNote: parentNote,
      confirmedText: text,
    });
    setIsConfirmationOpen(true);
  };

  // Handle Voice Submission
  const handleSubmitVoice = (spokenText: string) => {
    // Strictly preserve child's spoken Hebrew words without rewriting!
    setRequestState({
      inputType: 'voice',
      rawInput: spokenText,
      parentNote: parentNote,
      confirmedText: spokenText,
    });
    setIsConfirmationOpen(true);
  };

  // Confirm Request and Generate Safe Alternatives
  const handleConfirmAndGenerate = async (
    confirmedText: string,
    updatedParentNote?: string
  ) => {
    setIsConfirmationOpen(false);
    setIsGeneratingResults(true);
    setLastConfirmedRequest(confirmedText);
    if (updatedParentNote !== undefined) {
      setParentNote(updatedParentNote);
    }

    try {
      const res = await fetchAlternativesApi(
        currentProfile,
        confirmedText,
        updatedParentNote ?? parentNote,
        suggestionCount
      );
      setSuggestions(res.suggestions);
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      setSuggestions([]);
    } finally {
      setIsGeneratingResults(false);
    }
  };

  // Toggle Parent Approval on a Suggestion Card
  const handleToggleParentApproval = (suggestionId: string) => {
    if (!suggestions) return;
    setSuggestions((prev) => {
      if (!prev) return null;
      return prev.map((s) => {
        if (s.id === suggestionId) {
          const newStatus = !s.parentApproved;
          // Keep tracked list of approved items for the Parent Area
          if (newStatus) {
            setApprovedSuggestions((current) => [
              ...current.filter((item) => item.id !== suggestionId),
              { ...s, parentApproved: true },
            ]);
          } else {
            setApprovedSuggestions((current) =>
              current.filter((item) => item.id !== suggestionId)
            );
          }
          return { ...s, parentApproved: newStatus };
        }
        return s;
      });
    });
  };

  const handleResetFlow = () => {
    setSuggestions(null);
    setRequestState(null);
    setIsConfirmationOpen(false);
    setActiveMode('child');
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-stone-800 font-sans" dir="rtl">
      {/* Top Header */}
      <Header
        currentProfile={currentProfile}
        activeMode={activeMode}
        onToggleMode={setActiveMode}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        onResetFlow={handleResetFlow}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 sm:py-7">
        {/* VIEW 1: PARENT AREA MODE */}
        {activeMode === 'parent' ? (
          <ParentAreaView
            currentProfile={currentProfile}
            onUpdateProfile={setCurrentProfile}
            suggestionCount={suggestionCount}
            onUpdateSuggestionCount={setSuggestionCount}
            parentNote={parentNote}
            onUpdateParentNote={setParentNote}
            approvedSuggestions={approvedSuggestions}
            onToggleApproval={handleToggleParentApproval}
            onBackToChild={() => setActiveMode('child')}
            onOpenInfoModal={() => setIsInfoModalOpen(true)}
          />
        ) : suggestions !== null || isGeneratingResults ? (
          /* VIEW 2: RESULTS VIEW */
          <ResultsView
            childRequest={lastConfirmedRequest}
            parentNote={parentNote}
            currentProfile={currentProfile}
            suggestions={suggestions || []}
            isLoading={isGeneratingResults}
            onNewRequest={handleResetFlow}
            onToggleParentApproval={handleToggleParentApproval}
            onOpenProfileSettings={() => setActiveMode('parent')}
          />
        ) : (
          /* VIEW 3: CHILD MAIN SCREEN */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Friendly Kid Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-orange-200/50">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black mb-2">
                    <span className="text-base">{currentProfile.avatar}</span>
                    <span>היי {currentProfile.name}!</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                    איזה מאכל או נשנוש מתחשק לך עכשיו?
                  </h1>
                  {/* <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1">
                    בחרו איך להגיד לנו: בציור, בכתיבה, או בדיבור קולי!
                  </p> */}
                </div>

                <div className="text-4xl p-2.5 bg-white/15 rounded-2xl backdrop-blur-xs shadow-inner">
                  😋
                </div>
              </div>

              {/* Decorative shapes */}
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-300/20 pointer-events-none" />
            </div>

            {/* Parent Safety Safeguard Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-stone-900">
                  הגנת אלרגיות עבור {currentProfile.name}:
                </span>
                <span className="text-stone-600 font-medium">
                  {currentProfile.allergens.length > 0 ? (
                    currentProfile.allergens.map((a) => {
                      const match = ALLERGENS_LIST.find((item) => item.id === a);
                      return match ? match.labelHe : a;
                    }).join(', ')
                  ) : (
                    'ללא אלרגיות ידועות'
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveMode('parent')}
                className="text-orange-600 hover:text-orange-700 font-bold text-xs flex items-center gap-1 self-end sm:self-auto hover:underline"
              >
                <span>הגדרות בקרת הורים 🛡️</span>
              </button>
            </div>

            {/* Child Request 3 Big Joyful Choice Cards (Draw, Write, Speak) */}
            <div className="space-y-2">
              <span className="text-xs font-black text-stone-700 block pr-1">
                בחרו איך להביע את הבקשה:
              </span>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* 1. DRAW CARD */}
                <button
                  type="button"
                  onClick={() => setInputTab('draw')}
                  className={`p-3 sm:p-4 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    inputTab === 'draw'
                      ? 'bg-gradient-to-b from-orange-50 to-amber-100/70 border-orange-500 shadow-md ring-4 ring-orange-200/60'
                      : 'bg-white hover:bg-orange-50/40 border-stone-200 text-stone-700'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform ${
                      inputTab === 'draw'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-300 scale-105'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    🎨
                  </div>
                  <span className="font-black text-xs sm:text-sm text-stone-900 mt-1">
                    ציור
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium hidden xs:block">
                    ציור על המסך
                  </span>
                </button>

                {/* 2. WRITE CARD */}
                <button
                  type="button"
                  onClick={() => setInputTab('text')}
                  className={`p-3 sm:p-4 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    inputTab === 'text'
                      ? 'bg-gradient-to-b from-teal-50 to-emerald-100/70 border-teal-500 shadow-md ring-4 ring-teal-200/60'
                      : 'bg-white hover:bg-teal-50/40 border-stone-200 text-stone-700'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform ${
                      inputTab === 'text'
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-300 scale-105'
                        : 'bg-teal-100 text-teal-600'
                    }`}
                  >
                    ✍️
                  </div>
                  <span className="font-black text-xs sm:text-sm text-stone-900 mt-1">
                    כתיבה
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium hidden xs:block">
                    הקלדה במילים
                  </span>
                </button>

                {/* 3. SPEAK CARD */}
                <button
                  type="button"
                  onClick={() => setInputTab('voice')}
                  className={`p-3 sm:p-4 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    inputTab === 'voice'
                      ? 'bg-gradient-to-b from-purple-50 to-fuchsia-100/70 border-purple-500 shadow-md ring-4 ring-purple-200/60'
                      : 'bg-white hover:bg-purple-50/40 border-stone-200 text-stone-700'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform ${
                      inputTab === 'voice'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-300 scale-105'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    🎙️
                  </div>
                  <span className="font-black text-xs sm:text-sm text-stone-900 mt-1">
                    דיבור
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium hidden xs:block">
                    הקלטה בקול
                  </span>
                </button>
              </div>
            </div>

            {/* Input Component Render */}
            <div className="transition-all duration-200">
              {inputTab === 'draw' && (
                <ChildInputCanvas
                  onSubmitDrawing={handleSubmitDrawing}
                  isLoading={isProcessingInput}
                />
              )}
              {inputTab === 'text' && (
                <ChildInputText
                  onSubmitText={handleSubmitText}
                  isLoading={isProcessingInput}
                />
              )}
              {inputTab === 'voice' && (
                <ChildInputVoice
                  onSubmitVoice={handleSubmitVoice}
                  onSwitchToText={() => setInputTab('text')}
                  isLoading={isProcessingInput}
                />
              )}
            </div>

            {/* Direct Entry to Parent Area */}
            <div className="p-4 rounded-3xl bg-amber-100/60 border border-amber-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  🛡️
                </div>
                <div>
                  <span className="font-black text-stone-900 block">
                    אזור הורים ובקרת בטיחות
                  </span>
                  <span className="text-[11px] text-stone-600">
                    ניהול אלרגיות, הגדרת {suggestionCount} חלופות, והערת הורה
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMode('parent')}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-900 font-black border border-stone-200 shadow-xs transition-colors shrink-0"
              >
                כניסה להגדרות
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {requestState && (
        <RequestConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          requestState={requestState}
          currentProfile={currentProfile}
          onConfirmAndGenerate={handleConfirmAndGenerate}
          isLoading={isGeneratingResults}
        />
      )}

      {/* Parent Profile & Allergies Modal (Available for direct modal calls) */}
      <ParentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={currentProfile}
        onSaveProfile={setCurrentProfile}
        suggestionCount={suggestionCount}
        onUpdateSuggestionCount={setSuggestionCount}
        parentNote={parentNote}
        onUpdateParentNote={setParentNote}
      />

      {/* Prototype Info Modal */}
      <PrototypeInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto py-4 border-t border-amber-200/80 text-center text-xs text-stone-500 bg-white/70">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>YumWise — אב-טיפוס מחקרי למציאת חלופות מזון בריאות</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMode('parent')}
              className="text-amber-800 hover:underline font-bold"
            >
              אזור הורים 🛡️
            </button>
            <span>•</span>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="text-orange-600 hover:underline font-bold"
            >
              שקיפות נתונים
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
