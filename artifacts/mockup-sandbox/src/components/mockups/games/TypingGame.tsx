import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, Trophy, Keyboard, Clock, Target, Zap, Activity } from 'lucide-react';

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "A journey of a thousand miles begins with a single step.",
  "To be or not to be, that is the question.",
  "In the beginning the Universe was created.",
  "This has made a lot of people very angry and been widely regarded as a bad move.",
  "Typing is the process of writing or inputting text by pressing keys.",
  "Hackers explore the limits of what is possible in a spirit of playful cleverness.",
  "A sword wields no strength unless the hand that holds it has courage.",
  "Do not fear the unknown, embrace it with open arms.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "The only way to do great work is to love what you do.",
  "I have not failed. I've just found ten thousand ways that won't work.",
  "The mind is everything. What you think you become.",
  "The best time to plant a tree was twenty years ago. The second best time is now.",
  "Your time is limited, so don't waste it living someone else's life.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Simplicity is the soul of efficiency.",
  "First, solve the problem. Then, write the code.",
  "Experience is the name everyone gives to their mistakes.",
  "In order to be irreplaceable, one must always be different."
];

function generateText() {
  const shuffled = [...SENTENCES].sort(() => Math.random() - 0.5);
  const shuffled2 = [...SENTENCES].sort(() => Math.random() - 0.5);
  const shuffled3 = [...SENTENCES].sort(() => Math.random() - 0.5);
  return [...shuffled, ...shuffled2, ...shuffled3].join(" ");
}

type GameState = 'intro' | 'ready' | 'playing' | 'finished';

export function TypingGame() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [text, setText] = useState(() => generateText());
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTyped, setTotalTyped] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (activeCharRef.current && containerRef.current && gameState !== 'intro') {
      const { offsetTop } = activeCharRef.current;
      const { scrollTop, clientHeight } = containerRef.current;
      
      // Auto-scroll when getting close to bottom
      if (offsetTop > scrollTop + clientHeight * 0.6) {
        containerRef.current.scrollTo({
          top: offsetTop - clientHeight * 0.3,
          behavior: 'smooth'
        });
      }
    }
  }, [input.length, gameState]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState === 'intro' || gameState === 'finished') return;

    const newVal = e.target.value;

    // Prevent exceeding text length
    if (newVal.length > text.length) return;

    if (gameState === 'ready') {
      if (newVal.length > 0) {
        setGameState('playing');
        setStartTime(Date.now());
      }
    }

    if (newVal.length > input.length) {
      setTotalTyped(t => t + 1);
      if (newVal[newVal.length - 1] !== text[newVal.length - 1]) {
        setTotalErrors(err => err + 1);
      }
    }

    setInput(newVal);

    if (newVal.length === text.length) {
      setGameState('finished');
    }
  };

  const restart = () => {
    setGameState('ready');
    setText(generateText());
    setInput('');
    setTimeLeft(60);
    setTotalTyped(0);
    setTotalErrors(0);
    setStartTime(null);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0;
  const correctChars = input.split('').filter((c, i) => c === text[i]).length;
  
  // Calculate WPM
  const wpm = (gameState === 'playing' || gameState === 'finished') && elapsedMinutes > 0
    ? Math.round((correctChars / 5) / elapsedMinutes)
    : 0;
    
  // Calculate Accuracy
  const accuracy = totalTyped > 0 
    ? Math.max(0, Math.round(((totalTyped - totalErrors) / totalTyped) * 100)) 
    : 100;

  return (
    <div className="min-h-[100dvh] bg-[#F8F9FA] text-[#333333] flex flex-col items-center relative overflow-hidden font-['Noto_Sans'] selection:bg-[#F13A3C]/20 w-full">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Noto+Sans:wght@400;500&display=swap');
      `}} />
      
      {/* Progress Bar (Top) */}
      {(gameState === 'playing' || gameState === 'ready') && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#E1E3E4]">
          <div 
            className="h-full bg-[#F13A3C] transition-all duration-1000 ease-linear" 
            style={{ width: `${(timeLeft / 60) * 100}%` }} 
          />
        </div>
      )}

      {/* Header */}
      <header className="w-full bg-white border-b border-[#E1E3E4] flex justify-center z-10">
        <div className="w-full max-w-[1200px] flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3 text-[#333333] font-['Montserrat'] font-bold text-2xl uppercase tracking-tight">
            <Keyboard className="w-8 h-8 text-[#F13A3C]" />
            <span>NeonType</span>
          </div>
          
          {/* Live Stats */}
          <AnimatePresence>
            {(gameState === 'playing' || gameState === 'ready') && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-8 md:gap-12"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[12px] text-[#656464] font-['Montserrat'] font-semibold uppercase mb-1 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-[#333333]" /> WPM
                  </span>
                  <span className="text-3xl font-['Montserrat'] font-bold text-[#333333] leading-none">{wpm}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[12px] text-[#656464] font-['Montserrat'] font-semibold uppercase mb-1 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#333333]" /> ACC
                  </span>
                  <span className="text-3xl font-['Montserrat'] font-bold text-[#333333] leading-none">{accuracy}%</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[12px] text-[#656464] font-['Montserrat'] font-semibold uppercase mb-1 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-[#333333]" /> Time
                  </span>
                  <span className={`text-3xl font-['Montserrat'] font-bold leading-none ${timeLeft <= 10 && gameState === 'playing' ? 'text-[#F13A3C]' : 'text-[#333333]'}`}>
                    00:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1200px] flex-1 flex flex-col justify-center relative z-10 px-8 pb-16 pt-8">
        
        {gameState === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-12"
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <Keyboard className="w-24 h-24 text-[#F13A3C]" strokeWidth={1.5} />
              <h1 className="text-5xl md:text-7xl font-['Montserrat'] font-bold text-[#333333] tracking-tight">
                NEONTYPE
              </h1>
              <p className="text-[#656464] font-['Noto_Sans'] text-lg">
                Initialize your sequence. Prove your speed.
              </p>
            </div>
            <button
              onClick={() => {
                setGameState('ready');
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="px-8 py-4 bg-[#F13A3C] hover:bg-[#c9181a] text-white rounded-[4px] transition-colors duration-200 font-['Montserrat'] font-semibold text-[14px] uppercase tracking-wider flex items-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>System Start</span>
            </button>
          </motion.div>
        )}

        {(gameState === 'ready' || gameState === 'playing') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex-1 flex flex-col justify-center relative"
          >
            {/* Hidden Input for tracking */}
            <input
              ref={inputRef}
              className="opacity-0 absolute inset-0 pointer-events-none w-0 h-0"
              value={input}
              onChange={handleInput}
              onBlur={() => setIsFocused(false)}
              onFocus={() => setIsFocused(true)}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              autoFocus
            />

            {/* Focus Overlay */}
            {!isFocused && (
              <div 
                className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[2px] flex items-center justify-center cursor-pointer rounded-[4px]"
                onClick={() => inputRef.current?.focus()}
              >
                <div className="px-6 py-3 bg-white text-[#333333] border border-[#E1E3E4] rounded-[4px] flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <Target className="w-5 h-5 text-[#F13A3C]" />
                  <span className="font-['Montserrat'] uppercase font-semibold text-sm tracking-wider">Click to focus</span>
                </div>
              </div>
            )}

            {/* Text Area */}
            <div 
              className="relative w-full h-[320px] bg-white border border-[#E1E3E4] rounded-[4px] p-8 overflow-hidden"
              onClick={() => inputRef.current?.focus()}
            >
              <div 
                ref={containerRef}
                className="absolute inset-0 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="text-[24px] md:text-[28px] font-mono leading-[1.8] break-words select-none">
                  {text.split('').map((char, index) => {
                    const isTyped = index < input.length;
                    const isCorrect = isTyped && input[index] === char;
                    const isError = isTyped && input[index] !== char;
                    const isCurrent = index === input.length;

                    let colorClass = "text-[#333333]/40"; 
                    if (isCorrect) colorClass = "text-[#F13A3C]";
                    if (isError) colorClass = "text-[#F13A3C] bg-[#F13A3C]/10 border-b-2 border-[#F13A3C]"; 
                    if (isCurrent) colorClass = "text-[#333333]"; 

                    return (
                      <span 
                        key={index} 
                        ref={isCurrent ? activeCharRef : undefined}
                        className={`relative transition-colors duration-75 ${colorClass}`}
                      >
                        {isCurrent && isFocused && (
                          <span className="absolute -left-[1px] top-[15%] bottom-[15%] w-[3px] bg-[#F13A3C] animate-pulse z-10" />
                        )}
                        {char}
                      </span>
                    );
                  })}
                  {/* Caret when at the very end of text */}
                  {input.length === text.length && isFocused && (
                    <span className="relative" ref={activeCharRef}>
                      <span className="absolute -left-[1px] top-[15%] bottom-[15%] w-[3px] bg-[#F13A3C] animate-pulse z-10" />
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Helper message below text */}
            {gameState === 'ready' && (
              <div className="absolute -bottom-8 w-full text-center text-[#656464] font-['Montserrat'] font-medium uppercase tracking-wider text-[12px] animate-pulse">
                Start typing to begin
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center w-full pt-12"
          >
            <div className="bg-white border border-[#E1E3E4] p-12 w-full max-w-3xl rounded-[4px]">
              <div className="flex items-center justify-center gap-4 mb-12">
                <Trophy className="w-10 h-10 text-[#F13A3C]" />
                <h2 className="text-3xl md:text-4xl font-['Montserrat'] font-bold text-[#333333] text-center tracking-tight uppercase">Session Complete</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="flex flex-col items-center p-8 bg-[#F8F9FA] rounded-[4px] border border-[#E1E3E4]">
                  <span className="text-[12px] text-[#656464] font-['Montserrat'] font-semibold uppercase mb-4 tracking-wider">Speed</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-['Montserrat'] font-bold text-[#F13A3C]">{wpm}</span>
                    <span className="text-sm text-[#656464] font-['Montserrat'] font-semibold uppercase">wpm</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center p-8 bg-[#F8F9FA] rounded-[4px] border border-[#E1E3E4]">
                  <span className="text-[12px] text-[#656464] font-['Montserrat'] font-semibold uppercase mb-4 tracking-wider">Accuracy</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-['Montserrat'] font-bold text-[#333333]">{accuracy}</span>
                    <span className="text-sm text-[#656464] font-['Montserrat'] font-semibold">%</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center p-8 bg-[#F8F9FA] rounded-[4px] border border-[#E1E3E4]">
                  <span className="text-[12px] text-[#656464] font-['Montserrat'] font-semibold uppercase mb-4 tracking-wider">Errors</span>
                  <span className="text-5xl font-['Montserrat'] font-bold text-[#333333]">{totalErrors}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={restart}
                  className="px-8 py-4 bg-[#F13A3C] hover:bg-[#c9181a] text-white rounded-[4px] transition-colors duration-200 font-['Montserrat'] font-semibold text-[14px] uppercase tracking-wider flex items-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  Initialize New Sequence
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Screen flash on completion */}
      {gameState === 'finished' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 bg-white pointer-events-none z-50"
        />
      )}
    </div>
  );
}
