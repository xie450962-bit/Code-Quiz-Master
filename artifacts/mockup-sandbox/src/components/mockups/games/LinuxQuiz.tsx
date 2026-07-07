import React, { useState, useEffect } from "react";

const QUESTIONS = [
  {
    id: 1,
    question: "Which command shows disk usage of files and directories?",
    options: ["df", "du", "fdisk", "lsblk"],
    correctAnswerIndex: 1,
    explanation: "`du` (disk usage) estimates file space usage, whereas `df` shows file system disk space usage overall."
  },
  {
    id: 2,
    question: "How do you make a script file executable?",
    commandSnippet: "chmod ??? script.sh",
    options: ["chmod +x", "chown +x", "exec", "sudo"],
    correctAnswerIndex: 0,
    explanation: "`chmod +x` adds the execute permission for the user, group, and others."
  },
  {
    id: 3,
    question: "What does the following command do?",
    commandSnippet: "grep -r 'TODO' src/",
    options: [
      "Searches recursively in directories",
      "Reverses the search string",
      "Replaces text in files",
      "Removes files matching 'TODO'"
    ],
    correctAnswerIndex: 0,
    explanation: "The `-r` (or `--recursive`) flag tells `grep` to read all files under each directory recursively."
  },
  {
    id: 4,
    question: "Which command provides a dynamic real-time view of running processes?",
    options: ["ps aux", "top", "jobs", "bg"],
    correctAnswerIndex: 1,
    explanation: "`top` (or `htop`) provides an ongoing look at processor activity in real time. `ps` only shows a static snapshot."
  },
  {
    id: 5,
    question: "What does the | (pipe) character do in a shell?",
    options: [
      "Passes the stdout of one command as stdin to another",
      "Runs a command in the background",
      "Acts as a logical OR operator",
      "Creates a named pipe on the filesystem"
    ],
    correctAnswerIndex: 0,
    explanation: "Pipes let you chain commands together. For example, `ls -l | less` passes the output of `ls` to the input of `less`."
  },
  {
    id: 6,
    question: "Which command shows the last 20 lines of a file?",
    options: ["tail -n 20", "end -20", "cat -20", "bottom 20"],
    correctAnswerIndex: 0,
    explanation: "`tail` outputs the last part of files. The `-n` flag specifies the number of lines to output."
  },
  {
    id: 7,
    question: "What is the standard path for user-specific application configuration files?",
    options: ["/etc", "~/.config", "/var/user", "/usr/local"],
    correctAnswerIndex: 1,
    explanation: "Following the XDG Base Directory specification, user-specific configurations should be stored in `~/.config`."
  },
  {
    id: 8,
    question: "How do you find files modified in the exact last 7 days in the current directory?",
    options: [
      "find . -mtime -7",
      "search -d 7",
      "ls -l --time 7",
      "locate --recent 7"
    ],
    correctAnswerIndex: 0,
    explanation: "`find . -mtime -7` searches the current directory (`.`) for files whose data was last modified less than 7 days ago."
  },
  {
    id: 9,
    question: "Which tool is used to monitor systemd journal logs in real-time?",
    options: ["syslog-tail", "journalctl -f", "logcat", "watch-logs"],
    correctAnswerIndex: 1,
    explanation: "`journalctl` queries the systemd journal. The `-f` (follow) flag shows the most recent journal entries and continuously prints new ones."
  },
  {
    id: 10,
    question: "How do you compress a directory into a gzip-compressed tarball?",
    options: [
      "zip dir/",
      "compress -r dir/",
      "tar -czvf archive.tar.gz dir/",
      "gzip -r dir/"
    ],
    correctAnswerIndex: 2,
    explanation: "`tar` with `-c` (create), `-z` (gzip), `-v` (verbose), and `-f` (file) creates a compressed archive."
  },
  {
    id: 11,
    question: "Which command changes the owner of a file or directory?",
    options: ["chmod", "chown", "sudo", "usermod"],
    correctAnswerIndex: 1,
    explanation: "`chown` (change owner) changes the user and/or group ownership of a given file or directory."
  },
  {
    id: 12,
    question: "What does the '>>' operator do in bash?",
    options: [
      "Overwrites a file with output",
      "Appends output to a file",
      "Shifts bits to the right",
      "Redirects the error stream"
    ],
    correctAnswerIndex: 1,
    explanation: "The `>>` operator appends standard output to a file, creating the file if it does not exist, whereas `>` overwrites it."
  },
  {
    id: 13,
    question: "How do you forcefully kill a process by its PID without allowing it to clean up?",
    options: ["kill -9 PID", "stop PID", "end -f PID", "rm -p PID"],
    correctAnswerIndex: 0,
    explanation: "`kill -9` sends the SIGKILL signal, which cannot be caught or ignored, terminating the process immediately."
  },
  {
    id: 14,
    question: "Which command is the modern standard for showing the current network interfaces and IP addresses?",
    options: ["ifconfig -a", "ip a", "netstat -r", "ping"],
    correctAnswerIndex: 1,
    explanation: "`ip a` (short for `ip addr`) from the iproute2 suite has deprecated `ifconfig` for network interface configuration."
  },
  {
    id: 15,
    question: "What does 'chmod 755' apply to a file?",
    options: [
      "Read/write/exec for owner, read/exec for group/others",
      "Read/write for all users",
      "Execute permissions for everyone",
      "Makes the file hidden"
    ],
    correctAnswerIndex: 0,
    explanation: "In octal, 7 (4+2+1) is read/write/execute for the owner, and 5 (4+1) is read/execute for the group and others."
  }
];

function formatText(text: string) {
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <span
          key={i}
          className="text-[#4ade80] bg-[#022c16] px-1.5 py-0.5 rounded-sm font-bold border border-[#065f46]"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Cursor() {
  return <span className="inline-block w-2.5 h-5 bg-[#22c55e] ml-1 -mb-1 animate-pulse shadow-[0_0_8px_#22c55e]"></span>;
}

export function LinuxQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Fake boot sequence effect
  useEffect(() => {
    if (!booting) return;
    
    const logs = [
      "Initializing core system...",
      "Loading kernel modules...",
      "Mounting root filesystem...",
      "Starting terminal emulator...",
      "Establishing secure shell session...",
      "Accessing quiz database..."
    ];
    
    let currentLog = 0;
    const interval = setInterval(() => {
      setBootLogs(prev => [...prev, logs[currentLog]]);
      currentLog++;
      
      if (currentLog >= logs.length) {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 600);
      }
    }, 250);
    
    return () => clearInterval(interval);
  }, [booting]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOptionIndex(index);
    setIsAnswered(true);
    
    if (index === QUESTIONS[currentQuestionIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setQuizFinished(false);
  };

  if (booting) {
    return (
      <div className="min-h-[100dvh] bg-[#050505] text-[#22c55e] font-mono p-6 selection:bg-[#22c55e] selection:text-black">
        <div className="max-w-3xl mx-auto space-y-2 text-sm md:text-base">
          {bootLogs.map((log, i) => (
            <div key={i} className="opacity-80">
              <span className="text-[#16a34a]">[ OK ]</span> {log}
            </div>
          ))}
          <div className="mt-4"><Cursor /></div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQuestionIndex];
  const percentage = Math.round((score / QUESTIONS.length) * 100);

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-[#22c55e] font-mono relative overflow-x-hidden selection:bg-[#22c55e] selection:text-black pb-20">
      {/* CRT Scanline Overlay */}
      <div className="bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none fixed inset-0 z-50 opacity-20" />
      
      <div className="max-w-3xl mx-auto p-4 md:p-8 relative z-10">
        
        {/* Header */}
        <div className="border-b-2 border-[#166534] pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
              root@linux-quiz:~# <span className="text-[#22c55e] font-normal">./start_test.sh</span>
            </h1>
            <p className="text-[#16a34a] mt-2 text-sm">
              PID 94821 - Session active
            </p>
          </div>
          <div className="text-left md:text-right border border-[#166534] p-2 bg-[#022c16]/30">
            <div className="text-[#4ade80] text-sm md:text-base">
              SCORE: [{score}/{QUESTIONS.length}]
            </div>
            <div className="text-[#16a34a] text-xs mt-1">
              PROGRESS: {Math.round(((currentQuestionIndex + (isAnswered ? 1 : 0)) / QUESTIONS.length) * 100)}%
            </div>
          </div>
        </div>

        {!quizFinished ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Question Display */}
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-[#4ade80] leading-snug drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]">
                <span className="text-[#16a34a] mr-2">Q{currentQuestionIndex + 1}:</span>
                {q.question}
              </h2>
              
              {q.commandSnippet && (
                <div className="mt-4 p-4 bg-black border border-[#166534] rounded-sm text-[#4ade80] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center">
                  <span className="text-[#16a34a] mr-3 select-none">$</span>
                  <code className="text-lg">{q.commandSnippet}</code>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-8">
              {q.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const isCorrect = isAnswered && idx === q.correctAnswerIndex;
                const isWrong = isAnswered && isSelected && idx !== q.correctAnswerIndex;
                
                let btnClass = "w-full text-left p-4 border-2 transition-all duration-200 focus:outline-none flex items-start group ";
                
                if (!isAnswered) {
                  btnClass += "border-[#166534] text-[#22c55e] hover:bg-[#166534]/30 hover:border-[#4ade80] hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] cursor-pointer";
                } else {
                  btnClass += "cursor-default ";
                  if (isCorrect) {
                    btnClass += "bg-[#22c55e] text-black border-[#4ade80] font-bold shadow-[0_0_15px_rgba(74,222,128,0.5)]";
                  } else if (isWrong) {
                    btnClass += "bg-[#7f1d1d] text-[#fca5a5] border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.4)]";
                  } else {
                    btnClass += "border-[#166534]/40 text-[#16a34a]/50";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(idx)}
                    className={btnClass}
                  >
                    <span className={`mr-4 ${isCorrect && isAnswered ? 'text-black' : isWrong ? 'text-[#fca5a5]' : 'text-[#16a34a] group-hover:text-[#4ade80]'}`}>
                      [{idx + 1}]
                    </span> 
                    <span className="flex-1 mt-0.5">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next */}
            {isAnswered && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className={`p-5 border-l-4 ${selectedOptionIndex === q.correctAnswerIndex ? 'border-[#4ade80] bg-[#022c16]/50' : 'border-[#ef4444] bg-[#450a0a]/50'}`}>
                  <h3 className={`text-xl font-bold mb-3 flex items-center ${selectedOptionIndex === q.correctAnswerIndex ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
                    {selectedOptionIndex === q.correctAnswerIndex ? '> [SUCCESS] Valid command executed.' : '> [FATAL] Command execution failed.'}
                  </h3>
                  <div className="text-[#22c55e] leading-relaxed text-sm md:text-base">
                    {formatText(q.explanation)}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={handleNext}
                    className="px-6 py-3 border border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-black transition-colors uppercase tracking-widest font-bold flex items-center shadow-[0_0_10px_rgba(74,222,128,0.2)] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 focus:ring-offset-black"
                  >
                    {currentQuestionIndex < QUESTIONS.length - 1 ? './continue.sh' : './results.sh'}
                    <span className="ml-2 font-normal text-xl leading-none">_</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mt-12">
            <h2 className="text-2xl md:text-3xl text-[#4ade80] font-bold mb-6 drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]">
              <span className="text-[#16a34a] mr-2">root@linux-quiz:~#</span> ./grade_exam
            </h2>
            
            <div className="p-6 md:p-8 border border-[#166534] bg-[#022c16]/30 mb-8 rounded-sm font-mono relative overflow-hidden">
              {/* Decorative block */}
              <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                <pre className="text-xs leading-none">
                  {`
  ___
 (o,o)
 (   )
 -"-"-
                  `}
                </pre>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between border-b border-[#166534]/50 pb-2">
                  <span className="text-[#16a34a]">User execution context:</span>
                  <span className="text-[#4ade80]">root</span>
                </div>
                <div className="flex justify-between border-b border-[#166534]/50 pb-2">
                  <span className="text-[#16a34a]">Queries processed:</span>
                  <span className="text-[#4ade80]">{QUESTIONS.length}</span>
                </div>
                <div className="flex justify-between border-b border-[#166534]/50 pb-2 items-center">
                  <span className="text-[#16a34a]">Successful executions:</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] mr-2">{score}</span>
                    <span className="text-[#22c55e]">({percentage}%)</span>
                  </div>
                </div>
                
                <div className="pt-6">
                  <div className="text-[#16a34a] mb-2 uppercase tracking-widest text-sm">System Assigned Rank</div>
                  <div className="text-3xl md:text-5xl font-black text-[#4ade80] tracking-tight drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]">
                    {percentage === 100 ? "ROOT WIZARD" : 
                     percentage >= 80 ? "SYSADMIN" : 
                     percentage >= 60 ? "SHELL APPRENTICE" : 
                     "USER SPACE DWELLER"}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleRestart}
              className="px-6 py-3 border border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-black transition-colors uppercase tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 focus:ring-offset-black flex items-center"
            >
              ./restart_session.sh <Cursor />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
