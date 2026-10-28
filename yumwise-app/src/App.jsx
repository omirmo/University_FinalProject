import React, { useState } from 'react';
import { Mic, PenTool, Type, User, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';

// A playful font for a kid-friendly vibe
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [userName, setUserName] = useState('');
  const [inputText, setInputText] = useState('');

  // Styles to apply the custom font globally
  const fontStyle = { fontFamily: "'Baloo 2', cursive" };

  // Helper for screen transitions
  const navigateTo = (screen) => setCurrentScreen(screen);

  // --- Screens ---

  const LoginScreen = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 bg-gradient-to-b from-blue-200 to-purple-200 p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="mb-8">
        <h1 className="text-6xl font-extrabold text-purple-600 drop-shadow-md mb-2">YumWise</h1>
        <p className="text-xl text-purple-800 font-semibold">Healthy food, happy you! 🍎</p>
      </div>
      
      <button 
        onClick={() => navigateTo('name')}
        className="w-full max-w-sm py-4 px-6 bg-white text-red-500 font-bold text-2xl rounded-3xl shadow-xl transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-white hover:border-red-100"
      >
        <span className="mr-3 text-3xl">✉️</span> Connect via Gmail
      </button>
      
      <button 
        onClick={() => navigateTo('name')}
        className="w-full max-w-sm py-4 px-6 bg-yellow-400 text-yellow-900 font-bold text-2xl rounded-3xl shadow-xl transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-yellow-300 hover:border-yellow-200"
      >
        <span className="mr-3 text-3xl">👻</span> Play as Guest
      </button>
    </div>
  );

  const NameScreen = () => {
    const [tempName, setTempName] = useState('');

    const handleSumbit = (e) => {
      e.preventDefault();
      if (tempName.trim()) {
        setUserName(tempName.trim());
        navigateTo('home');
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-green-200 to-teal-200 p-6 text-center animate-in slide-in-from-right duration-500">
        <h2 className="text-4xl font-bold text-teal-800 mb-8 drop-shadow-sm">What's your name?</h2>
        <form onSubmit={handleSumbit} className="w-full max-w-sm flex flex-col items-center">
          <input
            type="text"
            placeholder="Type your name here..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full text-center text-3xl py-4 px-6 rounded-3xl shadow-inner border-4 border-teal-300 focus:outline-none focus:border-teal-500 mb-8 font-semibold text-teal-700 placeholder-teal-300 transition-all"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!tempName.trim()}
            className="w-full py-4 px-6 bg-pink-500 text-white font-bold text-3xl rounded-3xl shadow-xl transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
          >
            Let's Go! 🚀
          </button>
        </form>
      </div>
    );
  };

  const HomeScreen = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-100 to-yellow-100 animate-in fade-in duration-500">
      {/* Top Profile Bar */}
      <div className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-b-3xl shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <div 
            onClick={() => {
              if(window.confirm("Do you want to log out and change your name?")) {
                setUserName('');
                navigateTo('login');
              }
            }}
            className="w-14 h-14 bg-indigo-400 rounded-full flex items-center justify-center shadow-md cursor-pointer transform transition hover:scale-110 hover:rotate-12 ring-4 ring-indigo-200"
            title="Click to view profile / logout"
          >
            <User size={32} color="white" />
          </div>
          <h2 className="text-3xl font-bold text-indigo-900 drop-shadow-sm">Hi, {userName}! 👋</h2>
        </div>
        <div className="bg-orange-400 text-white px-4 py-2 rounded-2xl font-bold shadow-md cursor-pointer hover:bg-orange-500 transition-colors">
          History 🕒
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col justify-center space-y-6">
        <h3 className="text-center text-2xl font-bold text-orange-800 mb-2">What are you craving?</h3>
        
        {/* Draw Button */}
        <button 
          onClick={() => navigateTo('draw')}
          className="flex-1 flex items-center p-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-[2.5rem] shadow-xl transform transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 group border-4 border-white/20"
        >
          <div className="bg-white/30 p-4 rounded-3xl group-hover:animate-bounce">
            <PenTool size={48} color="white" />
          </div>
          <span className="ml-6 text-4xl font-extrabold text-white tracking-wider">Draw</span>
        </button>

        {/* Speak Button */}
        <button 
          onClick={() => navigateTo('speak')}
          className="flex-1 flex items-center p-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-[2.5rem] shadow-xl transform transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 group border-4 border-white/20"
        >
          <div className="bg-white/30 p-4 rounded-3xl group-hover:animate-bounce">
            <Mic size={48} color="white" />
          </div>
          <span className="ml-6 text-4xl font-extrabold text-white tracking-wider">Speak</span>
        </button>

        {/* Text Button */}
        <button 
          onClick={() => navigateTo('text')}
          className="flex-1 flex items-center p-6 bg-gradient-to-r from-emerald-400 to-green-400 rounded-[2.5rem] shadow-xl transform transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 group border-4 border-white/20"
        >
          <div className="bg-white/30 p-4 rounded-3xl group-hover:animate-bounce">
            <Type size={48} color="white" />
          </div>
          <span className="ml-6 text-4xl font-extrabold text-white tracking-wider">Text</span>
        </button>
      </div>
    </div>
  );

  const DrawScreen = () => (
    <div className="flex flex-col h-full bg-pink-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigateTo('home')}
          className="p-3 bg-white text-pink-500 rounded-full shadow-md hover:bg-pink-100 transition-colors"
        >
          <ArrowLeft size={32} />
        </button>
        <h2 className="ml-4 text-3xl font-bold text-pink-600">Draw your food! 🎨</h2>
      </div>
      
      <div className="flex-1 bg-white rounded-[2rem] shadow-inner border-4 border-dashed border-pink-300 flex flex-col items-center justify-center text-pink-400 relative overflow-hidden group">
        {/* Placeholder UI for drawing canvas */}
        <ImageIcon size={64} className="mb-4 opacity-50 group-hover:scale-110 transition-transform duration-300" />
        <p className="text-xl font-semibold opacity-70">Tap or click here to start drawing...</p>
        
        {/* Mock Toolbar */}
        <div className="absolute bottom-4 flex space-x-4 bg-pink-100 p-3 rounded-full shadow-md">
          <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"></div>
          <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"></div>
          <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"></div>
          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"></div>
        </div>
      </div>
      
      <button className="mt-4 py-4 w-full bg-pink-500 text-white font-bold text-2xl rounded-3xl shadow-lg hover:bg-pink-600 transition-colors">
        Find Healthy Options! <Sparkles className="inline mb-1" size={24}/>
      </button>
    </div>
  );

  const SpeakScreen = () => (
    <div className="flex flex-col h-full bg-blue-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center mb-6 z-10">
        <button 
          onClick={() => navigateTo('home')}
          className="p-3 bg-white text-blue-500 rounded-full shadow-md hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft size={32} />
        </button>
        <h2 className="ml-4 text-3xl font-bold text-blue-600">Tell me what you want! 🗣️</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Pumping Microphone Animation Setup */}
        <div className="relative flex items-center justify-center w-64 h-64">
          {/* Animated concentric rings */}
          <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute inset-4 bg-blue-300 rounded-full opacity-40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
          
          {/* Main button */}
          <button className="relative z-10 w-40 h-40 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] transform transition-transform active:scale-95 cursor-pointer hover:shadow-[0_0_60px_rgba(59,130,246,0.8)]">
            <Mic size={80} color="white" className="animate-pulse" />
          </button>
        </div>
        
        <p className="mt-12 text-2xl font-bold text-blue-500 animate-pulse">I'm listening...</p>
      </div>
    </div>
  );

  const TextScreen = () => {
    const suggestions = ["🍫 Chocolate spread", "🍞 Bread with date spread", "🍊 Orange", "🍕 Pizza slice"];

    return (
      <div className="flex flex-col h-full bg-green-50 p-4 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigateTo('home')}
            className="p-3 bg-white text-green-600 rounded-full shadow-md hover:bg-green-100 transition-colors"
          >
            <ArrowLeft size={32} />
          </button>
          <h2 className="ml-4 text-3xl font-bold text-green-700">Type it out! ⌨️</h2>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="I want to eat..."
            className="w-full h-40 p-6 text-2xl rounded-[2rem] shadow-inner border-4 border-green-300 focus:outline-none focus:border-green-500 resize-none font-semibold text-green-800 placeholder-green-400 transition-all mb-6"
          />

          <div className="w-full">
            <p className="text-lg font-bold text-green-600 mb-4 pl-2">Try these ideas:</p>
            <div className="flex flex-wrap gap-3">
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx}
                  onClick={() => setInputText(sug.split(' ').slice(1).join(' '))}
                  className="bg-white border-2 border-green-200 text-green-700 px-4 py-2 rounded-2xl shadow-sm text-lg font-semibold hover:bg-green-100 hover:scale-105 active:scale-95 transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          disabled={!inputText.trim()}
          className="mt-auto py-4 w-full bg-green-500 text-white font-bold text-2xl rounded-3xl shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:transform-none transform hover:scale-105 active:scale-95"
        >
          Find YumWise Match! 🔍
        </button>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div 
      style={fontStyle}
      className="w-full max-w-md mx-auto h-screen max-h-[850px] bg-white overflow-hidden shadow-2xl sm:rounded-[3rem] sm:border-[12px] sm:border-gray-900 relative sm:my-4"
    >
      {/* Dynamic rendering based on state */}
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'name' && <NameScreen />}
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'draw' && <DrawScreen />}
      {currentScreen === 'speak' && <SpeakScreen />}
      {currentScreen === 'text' && <TextScreen />}
    </div>
  );
};

export default App;