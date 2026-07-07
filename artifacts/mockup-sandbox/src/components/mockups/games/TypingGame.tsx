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
    <div className="min-h-[100dvh] bg-[#050508] text-slate-200 flex flex-col items-center relative overflow-hidden font-sans selection:bg-cyan-500/20 w-full">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Progress Bar (Top) */}
      {(gameState === 'playing' || gameState === 'ready') && (
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div 
            className="h-full bg-cyan-400 transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
            style={{ width: `${(timeLeft / 60) * 100}%` }} 
          />
        </div>
      )}

      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between p-8 z-10">
        <div className="flex items-center gap-3 text-cyan-400 font-bold text-2xl tracking-widest uppercase">
          <Keyboard className="w-8 h-8" />
          <span>NeonType</span>
        </div>
        
        {/* Live Stats */}
        <AnimatePresence>
          {(gameState === 'playing' || gameState === 'ready') && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-8 md:gap-12 font-mono"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> WPM
                </span>
                <span className="text-3xl font-black text-white leading-none">{wpm}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> ACC
                </span>
                <span className="text-3xl font-black text-white leading-none">{accuracy}%</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Time
                </span>
                <span className={`text-3xl font-black leading-none ${timeLeft <= 10 && gameState === 'playing' ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                  00:{timeLeft.toString().padStart(2, '0')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl flex-1 flex flex-col justify-center relative z-10 px-8 pb-16">
        
        {gameState === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-12"
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <Keyboard className="w-32 h-32 text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" strokeWidth={1} />
              <h1 className="text-5xl md:text-8xl font-black tracking-[0.1em] text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                NEONTYPE
              </h1>
              <p className="text-slate-400 font-mono tracking-widest uppercase text-sm">
                Initialize your sequence. Prove your speed.
              </p>
            </div>
            <button
              onClick={() => {
                setGameState('ready');
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="group relative px-10 py-5 bg-cyan-950/30 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/80 hover:bg-cyan-900/40 hover:text-cyan-100 transition-all duration-300 uppercase tracking-[0.3em] font-bold flex items-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-cyan-400/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
              <Play className="w-5 h-5 fill-current relative z-10" />
              <span className="relative z-10">System Start</span>
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
                className="absolute inset-0 z-20 bg-[#050508]/60 backdrop-blur-sm flex items-center justify-center cursor-pointer rounded-xl"
                onClick={() => inputRef.current?.focus()}
              >
                <div className="px-8 py-4 bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 rounded-lg flex items-center gap-3 animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                  <Target className="w-5 h-5" />
                  <span className="font-mono uppercase tracking-widest font-bold">Click to focus</span>
                </div>
              </div>
            )}

            {/* Text Area */}
            <div 
              className="relative w-full h-[280px] overflow-hidden"
              style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
              onClick={() => inputRef.current?.focus()}
            >
              <div 
                ref={containerRef}
                className="absolute inset-0 overflow-y-auto pb-32 pt-16 px-4 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="text-[26px] md:text-[32px] font-mono leading-[1.8] tracking-tight break-words select-none">
                  {text.split('').map((char, index) => {
                    const isTyped = index < input.length;
                    const isCorrect = isTyped && input[index] === char;
                    const isError = isTyped && input[index] !== char;
                    const isCurrent = index === input.length;

                    let colorClass = "text-slate-600"; 
                    if (isCorrect) colorClass = "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]";
                    if (isError) colorClass = "text-red-400 bg-red-400/10 border-b-2 border-red-500"; 
                    if (isCurrent) colorClass = "text-slate-300"; 

                    return (
                      <span 
                        key={index} 
                        ref={isCurrent ? activeCharRef : undefined}
                        className={`relative transition-colors duration-75 ${colorClass}`}
                      >
                        {isCurrent && isFocused && (
                          <span className="absolute -left-[2px] top-[15%] bottom-[15%] w-[3px] bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)] z-10" />
                        )}
                        {char}
                      </span>
                    );
                  })}
                  {/* Caret when at the very end of text */}
                  {input.length === text.length && isFocused && (
                    <span className="relative" ref={activeCharRef}>
                      <span className="absolute -left-[2px] top-[15%] bottom-[15%] w-[3px] bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)] z-10" />
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Helper message below text */}
            {gameState === 'ready' && (
              <div className="absolute bottom-0 w-full text-center text-slate-500 font-mono uppercase tracking-widest text-xs animate-pulse">
                Start typing to begin
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center w-full"
          >
            <div className="bg-[#0A0A0F] border border-cyan-900/30 p-8 md:p-12 w-full max-w-3xl relative group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />

              <div className="flex items-center justify-center gap-5 mb-12 md:mb-16">
                <Trophy className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                <h2 className="text-3xl md:text-5xl font-black tracking-widest uppercase text-white text-center">Session Complete</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
                <div className="flex flex-col items-center p-8 bg-black/60 rounded-sm border border-white/5 relative overflow-hidden group-hover:border-cyan-900/50 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20" />
                  <span className="text-xs text-slate-500 font-mono tracking-[0.2em] uppercase mb-4">Speed</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-black text-cyan-400 font-mono">{wpm}</span>
                    <span className="text-sm text-cyan-400/50 font-mono uppercase">wpm</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center p-8 bg-black/60 rounded-sm border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
                  <span className="text-xs text-slate-500 font-mono tracking-[0.2em] uppercase mb-4">Accuracy</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-black text-white font-mono">{accuracy}</span>
                    <span className="text-sm text-white/50 font-mono">%</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center p-8 bg-black/60 rounded-sm border border-white/5 relative overflow-hidden group-hover:border-red-900/30 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20" />
                  <span className="text-xs text-slate-500 font-mono tracking-[0.2em] uppercase mb-4">Errors</span>
                  <span className="text-5xl md:text-6xl font-black text-red-400 font-mono">{totalErrors}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={restart}
                  className="px-8 py-4 md:px-10 md:py-5 bg-white/5 hover:bg-cyan-950/40 text-white border border-white/10 hover:border-cyan-500/50 transition-all uppercase tracking-widest font-bold flex items-center gap-4 hover:text-cyan-300 group/btn"
                >
                  <RefreshCw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
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
          transition={{ duration: 1, ease: "easeOut" }}
          className="fixed inset-0 bg-cyan-400 mix-blend-overlay pointer-events-none z-50"
        />
      )}
    </div>
  );
}
