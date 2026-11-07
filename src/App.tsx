/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ParentAreaView } from './components/ParentAreaView';
import { ParentPasscodeModal } from './components/ParentPasscodeModal';
import { PrototypeInfoModal } from './components/PrototypeInfoModal';
import { ChildInputCanvas } from './components/ChildInputCanvas';
import { ChildInputText } from './components/ChildInputText';
import { ChildInputVoice } from './components/ChildInputVoice';
import { RequestConfirmationModal } from './components/RequestConfirmationModal';
import { ResultsView } from './components/ResultsView';
import { DEMO_PROFILES } from './data/foodCatalog';
import { ChildProfile, FoodRequestState, SuggestionItem } from './types';
import {
  recognizeDrawingApi,
  fetchAlternativesApi,
} from './services/apiClient';

export default function App() {
  // Profiles and Settings State
  const [currentProfile, setCurrentProfile] = useState<ChildProfile>(DEMO_PROFILES[0]); // Maya: Peanuts & Milk
  const [suggestionCount, setSuggestionCount] = useState<number>(3);
  const [parentNote, setParentNote] = useState<string>('מחפשים משהו מתוק וטעים לאחה״צ');
  const [activeMode, setActiveMode] = useState<'child' | 'parent'>('child');

  // Child Screen: 'home' (3 big buttons) | 'draw' | 'text' | 'voice'
  const [childScreen, setChildScreen] = useState<'home' | 'draw' | 'text' | 'voice'>('home');

  // Input Processing State
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [requestState, setRequestState] = useState<FoodRequestState | null>(null);

  // Results State
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[] | null>(null);
  const [lastConfirmedRequest, setLastConfirmedRequest] = useState<string>('');
  const [approvedSuggestions, setApprovedSuggestions] = useState<SuggestionItem[]>([]);

  // Modals
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Redirect to Home with 3 big buttons
  const handleGoHome = () => {
    setSuggestions(null);
    setRequestState(null);
    setIsConfirmationOpen(false);
    setActiveMode('child');
    setChildScreen('home');
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
  };

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
      setRequestState({
        inputType: 'draw',
        rawInput: 'מאכל מתוק / חטיף',
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

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-stone-800 font-sans" dir="rtl">
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
            suggestions={suggestions || []}
            isLoading={isGeneratingResults}
            onNewRequest={handleGoHome}
            onToggleParentApproval={handleToggleParentApproval}
            onOpenProfileSettings={handleOpenParentArea}
          />
        ) : childScreen === 'draw' ? (
          /* VIEW 3A: DEDICATED DRAW SCREEN */
          <ChildInputCanvas
            onSubmitDrawing={handleSubmitDrawing}
            isLoading={isProcessingInput}
            onBack={() => setChildScreen('home')}
          />
        ) : childScreen === 'text' ? (
          /* VIEW 3B: DEDICATED WRITE SCREEN */
          <ChildInputText
            onSubmitText={handleSubmitText}
            isLoading={isProcessingInput}
            onBack={() => setChildScreen('home')}
          />
        ) : childScreen === 'voice' ? (
          /* VIEW 3C: DEDICATED SPEAK SCREEN */
          <ChildInputVoice
            onSubmitVoice={handleSubmitVoice}
            isLoading={isProcessingInput}
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
