import React, { useState } from 'react';
import { CheckCircle2, XCircle, Trophy, RefreshCw, ArrowRight, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  {
    id: 1,
    question: "What does `SELECT * FROM table LIMIT 10` return?",
    options: [
      "The first 10 rows of the table",
      "10 random rows from the table",
      "The last 10 rows of the table",
      "All rows except the first 10"
    ],
    correctAnswer: 0,
    explanation: "`LIMIT` constrains the number of rows returned by a query, starting from the first row of the result set."
  },
  {
    id: 2,
    question: "Which `JOIN` returns only matching rows from both tables?",
    options: [
      "INNER JOIN",
      "LEFT JOIN",
      "FULL OUTER JOIN",
      "CROSS JOIN"
    ],
    correctAnswer: 0,
    explanation: "`INNER JOIN` returns records that have matching values in both tables."
  },
  {
    id: 3,
    question: "What does `COUNT(*)` return?",
    options: [
      "The number of rows, including NULLs",
      "The number of distinct values",
      "The number of rows, ignoring NULLs",
      "The sum of all numeric columns"
    ],
    correctAnswer: 0,
    explanation: "`COUNT(*)` counts all rows in a result set regardless of NULL values, whereas `COUNT(column_name)` ignores NULLs."
  },
  {
    id: 4,
    question: "Which clause filters rows AFTER grouping?",
    options: [
      "HAVING",
      "WHERE",
      "FILTER",
      "GROUP BY"
    ],
    correctAnswer: 0,
    explanation: "The `HAVING` clause was added to SQL because the `WHERE` keyword cannot be used with aggregate functions."
  },
  {
    id: 5,
    question: "What is the purpose of the `DISTINCT` keyword?",
    options: [
      "To return only different values",
      "To delete duplicate rows",
      "To group identical rows",
      "To sort the result set"
    ],
    correctAnswer: 0,
    explanation: "The `SELECT DISTINCT` statement is used to return only distinct (different) values."
  },
  {
    id: 6,
    question: "How do you select all records where the name starts with an 'a'?",
    options: [
      "`SELECT * FROM table WHERE name LIKE 'a%'`",
      "`SELECT * FROM table WHERE name LIKE '%a'`",
      "`SELECT * FROM table WHERE name = 'a%'`",
      "`SELECT * FROM table WHERE name STARTS 'a'`"
    ],
    correctAnswer: 0,
    explanation: "The `%` wildcard represents zero, one, or multiple characters. `'a%'` matches any string starting with 'a'."
  },
  {
    id: 7,
    question: "What is a primary key?",
    options: [
      "A field that uniquely identifies each row",
      "The most frequently queried column",
      "The first column defined in a table",
      "A key used to encrypt the table data"
    ],
    correctAnswer: 0,
    explanation: "A primary key is a specific choice of a minimal set of attributes that uniquely specify a tuple (row) in a relation (table)."
  },
  {
    id: 8,
    question: "How can you return the number of records in the `Orders` table?",
    options: [
      "`SELECT COUNT(*) FROM Orders`",
      "`SELECT NO(*) FROM Orders`",
      "`SELECT ROW_COUNT() FROM Orders`",
      "`SELECT NUM(Orders)`"
    ],
    correctAnswer: 0,
    explanation: "The `COUNT()` function returns the number of rows that matches a specified criterion."
  },
  {
    id: 9,
    question: "Which operator is used to select values within a range?",
    options: [
      "BETWEEN",
      "IN",
      "RANGE",
      "WITHIN"
    ],
    correctAnswer: 0,
    explanation: "The `BETWEEN` operator selects values within a given range. The values can be numbers, text, or dates."
  },
  {
    id: 10,
    question: "What does a `RIGHT JOIN` do?",
    options: [
      "Returns all records from the right table, and matched records from the left",
      "Returns all records from the left table, and matched records from the right",
      "Returns only records that have a match in both tables",
      "Joins tables based on the right-most column"
    ],
    correctAnswer: 0,
    explanation: "`RIGHT JOIN` returns all records from the right table, and the matched records from the left table."
  },
  {
    id: 11,
    question: "Which keyword is used to sort the result-set?",
    options: [
      "ORDER BY",
      "SORT BY",
      "ALIGN BY",
      "GROUP BY"
    ],
    correctAnswer: 0,
    explanation: "The `ORDER BY` keyword is used to sort the result-set in ascending or descending order."
  },
  {
    id: 12,
    question: "What is the purpose of an INDEX in a database?",
    options: [
      "To speed up data retrieval operations",
      "To enforce foreign key constraints",
      "To automatically increment primary keys",
      "To compress table storage"
    ],
    correctAnswer: 0,
    explanation: "Indexes are used to retrieve data from the database more quickly. Users cannot see the indexes; they are just used to speed up searches/queries."
  }
];

function formatText(text: string) {
  return text.split(/(`.*?`)/g).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <span 
          key={index} 
          className="font-mono text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded-md text-[0.9em] border border-indigo-100 shadow-sm inline-block my-0.5 mx-0.5"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function SQLQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  // Calculate progress based on how many questions have been fully completed
  const progress = ((currentQuestionIndex + (hasAnswered ? 1 : 0)) / QUESTIONS.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(optionIndex);
    setHasAnswered(true);
    
    if (optionIndex === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setHasAnswered(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-2xl">
        
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <Database className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">SQL Mastery</h1>
          </div>
          {!showResults && (
            <div className="text-sm font-medium text-slate-500 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
              Score <span className="text-indigo-600 font-bold text-base">{score}</span>
              <span className="text-slate-300">/</span> {QUESTIONS.length}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!showResults && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Card Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "anticipate" }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden absolute inset-0 w-full h-max"
              >
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-8 leading-snug">
                    {formatText(currentQuestion.question)}
                  </h2>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === currentQuestion.correctAnswer;
                      const showCorrect = hasAnswered && isCorrect;
                      const showWrong = hasAnswered && isSelected && !isCorrect;

                      let buttonStateClass = "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700";
                      
                      if (hasAnswered) {
                        if (showCorrect) {
                          buttonStateClass = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500/20";
                        } else if (showWrong) {
                          buttonStateClass = "bg-rose-50 border-rose-300 text-rose-900";
                        } else {
                          buttonStateClass = "bg-white border-slate-200 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={hasAnswered}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${buttonStateClass}`}
                        >
                          <span className="font-medium text-[0.95rem]">{formatText(option)}</span>
                          {hasAnswered && (
                            <span className="ml-4 flex-shrink-0">
                              {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                              {showWrong && <XCircle className="w-5 h-5 text-rose-500" />}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Area */}
                  <AnimatePresence>
                    {hasAnswered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`p-4 rounded-xl ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-emerald-100/40 border-emerald-200' : 'bg-rose-50 border-rose-100'} border`}>
                          <p className={`text-sm font-bold mb-1 ${selectedAnswer === currentQuestion.correctAnswer ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Not quite."}
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {formatText(currentQuestion.explanation)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
                
                {/* Footer Action */}
                <div className="bg-slate-50 p-4 sm:px-8 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    disabled={!hasAnswered}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                      hasAnswered 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow active:scale-95' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                    }`}
                  >
                    {currentQuestionIndex === QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center relative z-10"
              >
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-indigo-50/50">
                  <Trophy className="w-10 h-10 text-indigo-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
                <p className="text-slate-500 mb-10 text-lg">
                  {score === QUESTIONS.length ? "Perfect score! You're an SQL Master." 
                    : score >= QUESTIONS.length * 0.8 ? "Great job! You know your queries." 
                    : "Good effort! Keep practicing your SQL."}
                </p>

                <div className="flex justify-center items-center gap-8 mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Final Score</p>
                    <p className="text-5xl font-black text-slate-900">{score}<span className="text-2xl font-bold text-slate-300">/{QUESTIONS.length}</span></p>
                  </div>
                  <div className="w-px h-16 bg-slate-200"></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Accuracy</p>
                    <p className="text-5xl font-black text-indigo-600">{Math.round((score / QUESTIONS.length) * 100)}%</p>
                  </div>
                </div>

                <button
                  onClick={restartQuiz}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" />
                  Restart Quiz
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
