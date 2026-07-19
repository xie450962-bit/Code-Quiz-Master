import React, { useState, useEffect } from "react";
import { Terminal, Check, X } from "lucide-react";

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
          className="text-[#333333] bg-[#E1E3E4] px-1.5 py-0.5 rounded-sm font-mono text-sm"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
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
      <div className="min-h-[100dvh] bg-[#F8F9FA] text-[#333333] font-['Noto_Sans']">
                {/* Progress bar at top */}
        <div className="fixed top-0 left-0 h-[2px] bg-[#F13A3C] transition-all duration-300" style={{ width: `${(bootLogs.length / 6) * 100}%` }} />
        
        <div className="max-w-[1200px] mx-auto p-8 pt-24">
          <h1 className="font-['Montserrat'] font-bold text-2xl mb-8 text-[#333333]">System Initializing...</h1>
          <div className="space-y-3">
            {bootLogs.map((log, i) => (
              <div key={i} className="flex items-center text-sm md:text-base text-[#656464]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E1E3E4] mr-3"></span> {log}
              </div>
            ))}
            <div className="mt-4 flex items-center">
               <span className="w-1.5 h-1.5 rounded-full bg-[#F13A3C] mr-3 animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQuestionIndex];
  const percentage = Math.round((score / QUESTIONS.length) * 100);

  return (
    <div className="min-h-[100dvh] bg-[#F8F9FA] text-[#333333] font-['Noto_Sans'] pb-20 pt-12 selection:bg-[#F13A3C]/20 selection:text-[#333333]">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Noto+Sans:wght@400;500;700&display=swap');`}
      </style>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Terminal className="text-[#F13A3C] w-6 h-6" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#333333] font-['Montserrat']">
              Linux Mastery
            </h1>
          </div>
          <div className="flex items-center gap-4 font-['Montserrat'] font-semibold">
            <div className="text-sm bg-white border border-[#E1E3E4] px-4 py-2 rounded-sm text-[#333333]">
              SCORE: {score}/{QUESTIONS.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E1E3E4] h-[2px] mb-8 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#F13A3C] transition-all duration-300"
            style={{ width: `${Math.round(((currentQuestionIndex + (isAnswered ? 1 : 0)) / QUESTIONS.length) * 100)}%` }}
          />
        </div>

        {!quizFinished ? (
          <div className="bg-white border border-[#E1E3E4] rounded-sm p-6 md:p-8 shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Question Display */}
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-[#333333] leading-snug font-['Montserrat']">
                <span className="text-[#F13A3C] mr-2">Q{currentQuestionIndex + 1}:</span>
                {q.question}
              </h2>
              
              {q.commandSnippet && (
                <div className="mt-6 p-4 bg-[#1e1e1e] rounded-sm text-white font-mono text-sm shadow-none flex items-center overflow-x-auto">
                  <span className="text-[#656464] mr-3 select-none">$</span>
                  <code>{q.commandSnippet}</code>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-8">
              {q.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const isCorrect = isAnswered && idx === q.correctAnswerIndex;
                const isWrong = isAnswered && isSelected && idx !== q.correctAnswerIndex;
                
                let btnClass = "w-full text-left p-4 border rounded-sm transition-all duration-200 focus:outline-none flex items-center group bg-white font-['Noto_Sans'] ";
                
                if (!isAnswered) {
                  btnClass += "border-[#E1E3E4] text-[#333333] hover:border-[#F13A3C] hover:bg-[#F13A3C]/5 cursor-pointer";
                } else {
                  btnClass += "cursor-default ";
                  if (isCorrect) {
                    btnClass += "border-[#E1E3E4] border-l-4 border-l-[#F13A3C] font-bold text-[#333333]";
                  } else if (isWrong) {
                    btnClass += "border-[#F13A3C] text-[#5c403d] opacity-80 bg-[#F13A3C]/5";
                  } else {
                    btnClass += "border-[#E1E3E4] text-[#656464] opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(idx)}
                    className={btnClass}
                  >
                    <span className={`mr-4 font-['Montserrat'] font-semibold ${isCorrect && isAnswered ? 'text-[#F13A3C]' : isWrong ? 'text-[#F13A3C]' : 'text-[#F13A3C]'}`}>
                      [{idx + 1}]
                    </span> 
                    <span className="flex-1">{opt}</span>
                    {isAnswered && isCorrect && <Check className="w-5 h-5 text-[#F13A3C] ml-3 flex-shrink-0" />}
                    {isAnswered && isWrong && <X className="w-5 h-5 text-[#F13A3C] ml-3 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next */}
            {isAnswered && (
              <div className="animate-in fade-in zoom-in-95 duration-300 mt-8">
                <div className={`p-5 bg-[#F8F9FA] border-l-4 ${selectedOptionIndex === q.correctAnswerIndex ? 'border-l-[#F13A3C]' : 'border-l-[#E1E3E4]'}`}>
                  <h3 className={`text-lg font-bold mb-2 font-['Montserrat'] text-[#333333]`}>
                    {selectedOptionIndex === q.correctAnswerIndex ? 'Correct.' : 'Incorrect.'}
                  </h3>
                  <div className="text-[#333333] leading-relaxed text-sm md:text-base font-['Noto_Sans']">
                    {formatText(q.explanation)}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={handleNext}
                    className="px-6 py-3 bg-[#F13A3C] text-white rounded-sm hover:bg-[#c9181a] transition-colors font-['Montserrat'] font-semibold flex items-center shadow-none focus:outline-none focus:ring-2 focus:ring-[#F13A3C] focus:ring-offset-2"
                  >
                    {currentQuestionIndex < QUESTIONS.length - 1 ? 'Next Question →' : 'View Results →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-white border border-[#E1E3E4] rounded-sm p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#333333] font-['Montserrat']">
              Assessment Results
            </h2>
            
            <div className="space-y-6">
              <div className="flex justify-between border-b border-[#E1E3E4] pb-4">
                <span className="text-[#656464] font-['Noto_Sans']">User execution context:</span>
                <span className="text-[#333333] font-['Montserrat'] font-semibold">root</span>
              </div>
              <div className="flex justify-between border-b border-[#E1E3E4] pb-4">
                <span className="text-[#656464] font-['Noto_Sans']">Queries processed:</span>
                <span className="text-[#333333] font-['Montserrat'] font-semibold">{QUESTIONS.length}</span>
              </div>
              <div className="flex justify-between border-b border-[#E1E3E4] pb-4 items-center">
                <span className="text-[#656464] font-['Noto_Sans']">Successful executions:</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-[#F13A3C] font-['Montserrat'] mr-2">{score}</span>
                  <span className="text-[#656464] font-['Noto_Sans']">({percentage}%)</span>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="text-[#656464] mb-2 uppercase tracking-widest text-xs font-['Montserrat'] font-semibold">System Assigned Rank</div>
                <div className="text-3xl md:text-4xl font-bold text-[#F13A3C] tracking-tight font-['Montserrat']">
                  {percentage === 100 ? "ROOT WIZARD" : 
                   percentage >= 80 ? "SYSADMIN" : 
                   percentage >= 60 ? "SHELL APPRENTICE" : 
                   "USER SPACE DWELLER"}
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <button 
                onClick={handleRestart}
                className="px-6 py-3 bg-[#F13A3C] text-white rounded-sm hover:bg-[#c9181a] transition-colors font-['Montserrat'] font-semibold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#F13A3C] focus:ring-offset-2"
              >
                Restart Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
