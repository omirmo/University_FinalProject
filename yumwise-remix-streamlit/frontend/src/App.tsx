/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ParentAreaView } from './components/ParentAreaView';
import { ParentPasscodeModal } from './components/ParentPasscodeModal';
import { PrototypeInfoModal } from './components/PrototypeInfoModal';
import { ChildInputCanvas } from './components/ChildInputCanvas';
import { ChildInputText } from './components/ChildInputText';
import { ChildInputVoice } from './components/ChildInputVoice';
import { RequestConfirmationModal } from './components/RequestConfirmationModal';
import { ResultsView } from './components/ResultsView';
import { DrawingSuggestionsScreen } from './components/DrawingSuggestionsScreen';
import { DEMO_PROFILES } from './data/foodCatalog';
import { ChildProfile, FoodRequestState, SuggestionItem } from './types';
import { fetchAlternativesApi } from './services/apiClient';

export default function App() {
  // Profiles and Settings State
  const [currentProfile, setCurrentProfile] = useState<ChildProfile>(DEMO_PROFILES[0]); // Maya: Peanuts & Milk
  const [suggestionCount, setSuggestionCount] = useState<number>(3);
  const [parentNote, setParentNote] = useState<string>('מחפשים משהו מתוק וטעים לאחה״צ');
  const [activeMode, setActiveMode] = useState<'child' | 'parent'>('child');

  // Child Screen: 'home' (3 big buttons) | 'draw' | 'text' | 'voice' | 'draw_suggestions'
  const [childScreen, setChildScreen] = useState<'home' | 'draw' | 'text' | 'voice' | 'draw_suggestions'>('home');
  const [lastDrawingImage, setLastDrawingImage] = useState<string | null>(null);

  // Input Processing State
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [requestState, setRequestState] = useState<FoodRequestState | null>(null);

  // Results State
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[] | null>(null);
  const [resultMessage, setResultMessage] = useState<string>();
  const [resultError, setResultError] = useState<string>();
  const requestVersion = useRef(0);
  const [lastConfirmedRequest, setLastConfirmedRequest] = useState<string>('');
  const [approvedSuggestions, setApprovedSuggestions] = useState<SuggestionItem[]>([]);

  // Modals
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const visibleScreen = activeMode === 'parent'
    ? 'parent'
    : suggestions !== null || isGeneratingResults ? 'results' : childScreen;

  useLayoutEffect(() => {
    document.getElementById('root')?.scrollTo(0, 0);
  }, [visibleScreen]);

  // Redirect to Home with 3 big buttons
  const handleGoHome = () => {
    requestVersion.current += 1;
    setIsGeneratingResults(false);
    setSuggestions(null);
    setRequestState(null);
    setIsConfirmationOpen(false);
    setActiveMode('child');
    setChildScreen('home');
    setLastDrawingImage(null);
  };

  // Handle Parent Area access via 4-digit Passcode
  const handleOpenParentArea = () => {
    setIsPasscodeModalOpen(true);
  };

  const handlePasscodeSuccess = () => {
    setActiveMode('parent');
  };

  const handleExitParentArea = () => {
    setActiveMode('child');
    setChildScreen('home');
    setLastDrawingImage(null);
  };

  // Handle Drawing Submission -> directly open Simulated Suggestions Screen
  const handleSubmitDrawing = (base64Png: string) => {
    setLastDrawingImage(base64Png);
    setChildScreen('draw_suggestions');
  };

  // Handle Text Submission
  const handleSubmitText = (text: string) => {
    setRequestState({
      inputType: 'text',
      rawInput: text,
      parentNote: parentNote,
      confirmedText: text,
    });
    setIsConfirmationOpen(true);
  };

  // Only confirmed writing requests trigger Gemini.
  const handleConfirmAndGenerate = async (
    confirmedText: string,
    updatedParentNote?: string
  ) => {
    if (requestState?.inputType !== 'text') return;
    const version = ++requestVersion.current;
    setIsConfirmationOpen(false);
    setIsGeneratingResults(true);
    setResultMessage(undefined);
    setResultError(undefined);
    setLastConfirmedRequest(confirmedText);
    if (updatedParentNote !== undefined) {
      setParentNote(updatedParentNote);
    }

    try {
      const res = await fetchAlternativesApi(
        currentProfile,
        confirmedText,
        suggestionCount
      );
      if (version === requestVersion.current) {
        setSuggestions(res.suggestions);
        setResultMessage(res.message);
      }
    } catch (error) {
      if (version === requestVersion.current) {
        setSuggestions([]);
        setResultError(error instanceof Error ? error.message : 'לא הצלחנו לקבל חלופות כרגע.');
      }
    } finally {
      if (version === requestVersion.current) setIsGeneratingResults(false);
    }
  };

  // Toggle Parent Approval on a Suggestion Card
  const handleToggleParentApproval = (suggestionId: string) => {
    const suggestion = suggestions?.find((item) => item.id === suggestionId);
    setApprovedSuggestions((current) => {
      if (current.some((item) => item.id === suggestionId)) {
        return current.filter((item) => item.id !== suggestionId);
      }
      return suggestion ? [...current, { ...suggestion, parentApproved: true }] : current;
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-amber-50/40 text-stone-800 font-sans" dir="rtl">
      {/* Top Header - Kept ONLY YumWise button (redirects home) and Parents Area button */}
      <Header
        activeMode={activeMode}
        onOpenParentArea={handleOpenParentArea}
        onExitParentArea={handleExitParentArea}
        onGoHome={handleGoHome}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-5 sm:py-7">
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
            onBackToChild={handleExitParentArea}
            onOpenInfoModal={() => setIsInfoModalOpen(true)}
          />
        ) : suggestions !== null || isGeneratingResults ? (
          /* VIEW 2: RESULTS VIEW */
          <ResultsView
            childRequest={lastConfirmedRequest}
            parentNote={parentNote}
            currentProfile={currentProfile}
            suggestions={suggestions?.map((item) => ({
              ...item,
              parentApproved: approvedSuggestions.some((approved) => approved.id === item.id),
            })) ?? []}
            expectedCount={suggestionCount}
            isLoading={isGeneratingResults}
            message={resultMessage}
            error={resultError}
            onNewRequest={handleGoHome}
            onToggleParentApproval={handleToggleParentApproval}
            onOpenProfileSettings={handleOpenParentArea}
          />
        ) : childScreen === 'draw' ? (
          /* VIEW 3A: DEDICATED DRAW SCREEN */
          <ChildInputCanvas
            onSubmitDrawing={handleSubmitDrawing}
            isLoading={false}
            onBack={() => setChildScreen('home')}
          />
        ) : childScreen === 'draw_suggestions' ? (
          /* VIEW 3A-2: SIMULATED DRAWING SUGGESTIONS SCREEN */
          <DrawingSuggestionsScreen
            drawingImageBase64={lastDrawingImage}
            onSelectSuggestion={(_chosenItem) => {
              handleGoHome();
            }}
            onBackToDraw={() => setChildScreen('draw')}
            onGoHome={handleGoHome}
          />
        ) : childScreen === 'text' ? (
          /* VIEW 3B: DEDICATED WRITE SCREEN */
          <ChildInputText
            onSubmitText={handleSubmitText}
            isLoading={false}
            onBack={() => setChildScreen('home')}
          />
        ) : childScreen === 'voice' ? (
          /* VIEW 3C: DEDICATED SPEAK SCREEN */
          <ChildInputVoice
            onBack={() => setChildScreen('home')}
            onSwitchToText={() => setChildScreen('text')}
          />
        ) : (
          /* VIEW 4: FRONT PAGE - THREE BIG BUTTONS (DRAW, WRITE, SPEAK) WITH LESS WORDS */
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            {/* Minimal Playful Greeting Banner */}
            <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-[36px] p-6 text-white shadow-xl shadow-orange-300/40 relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-black">
                  <span className="text-xl">{currentProfile.avatar}</span>
                  <span>היי {currentProfile.name}!</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
                  מה מתחשק לך לנשנש? 😋
                </h1>
              </div>

              {/* Decorative soft circles */}
              <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/15 pointer-events-none" />
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-300/25 pointer-events-none" />
            </div>

            {/* THREE BIG BUTTONS: DRAW, WRITE, SPEAK */}
            <div className="grid grid-cols-1 gap-4 pt-1">
              {/* BUTTON 1: DRAW (ציור) */}
              <button
                type="button"
                onClick={() => setChildScreen('draw')}
                className="group relative w-full p-6 sm:p-7 rounded-[32px] bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-xl shadow-orange-300/50 flex items-center justify-between border-4 border-white transition-all active:scale-[0.98] bubbly-button cursor-pointer overflow-hidden"
              >
                <div className="flex items-center gap-4 text-right">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-white/25 backdrop-blur-xs flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    🎨
                  </div>
                  <div>
                    <span className="block text-2xl sm:text-3xl font-black drop-shadow-xs">
                      לצייר
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-orange-100">
                      ציור באצבע או בעכבר
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">
                  ←
                </div>
              </button>

              {/* BUTTON 2: WRITE (כתיבה) */}
              <button
                type="button"
                onClick={() => setChildScreen('text')}
                className="group relative w-full p-6 sm:p-7 rounded-[32px] bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-white shadow-xl shadow-teal-300/50 flex items-center justify-between border-4 border-white transition-all active:scale-[0.98] bubbly-button cursor-pointer overflow-hidden"
              >
                <div className="flex items-center gap-4 text-right">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-white/25 backdrop-blur-xs flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                    ✍️
                  </div>
                  <div>
                    <span className="block text-2xl sm:text-3xl font-black drop-shadow-xs">
                      לכתוב
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-teal-100">
                      הקלדה או בחירת תמונה
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">
                  ←
                </div>
              </button>

              {/* BUTTON 3: SPEAK (דיבור) */}
              <button
                type="button"
                onClick={() => setChildScreen('voice')}
                className="group relative w-full p-6 sm:p-7 rounded-[32px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl shadow-purple-300/50 flex items-center justify-between border-4 border-white transition-all active:scale-[0.98] bubbly-button cursor-pointer overflow-hidden"
              >
                <div className="flex items-center gap-4 text-right">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-white/25 backdrop-blur-xs flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    🎙️
                  </div>
                  <div>
                    <span className="block text-2xl sm:text-3xl font-black drop-shadow-xs">
                      לדבר
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-purple-100">
                      הקלטה קולית חופשית
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">
                  ←
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation & Edit Modal */}
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

      {/* Simulated 4-digit Passcode Modal for Parents Section */}
      <ParentPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={handlePasscodeSuccess}
        correctPin="1234"
      />

      {/* Prototype & Nutrition Dataset Info Modal */}
      <PrototypeInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
