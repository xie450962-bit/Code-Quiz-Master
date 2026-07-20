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
          className="font-mono text-[#333333] bg-[#F8F9FA] px-1.5 py-0.5 rounded-[4px] text-[0.9em] border border-[#E1E3E4] inline-block my-0.5 mx-0.5"
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 font-['Noto_Sans'] text-[#333333] selection:bg-[#FFF5F5] selection:text-[#F13A3C]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap');
      `}} />
      
      <div className="w-full max-w-[1200px] flex flex-col items-center">
        
        {/* Header Section */}
        <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#F13A3C]">
            <Database className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight font-['Montserrat'] text-[#333333]">SQL Mastery</h1>
          </div>
          {!showResults && (
            <div className="text-sm font-semibold text-[#333333] bg-white px-4 py-1.5 rounded-[4px] border border-[#E1E3E4] flex items-center gap-2 font-['Montserrat']">
              Score <span className="text-[#F13A3C] font-bold text-base">{score}</span>
              <span className="text-[#E1E3E4]">/</span> {QUESTIONS.length}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!showResults && (
          <div className="w-full max-w-3xl mb-8 space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#656464] uppercase tracking-wider font-['Montserrat']">
              <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-[2px] w-full bg-[#E1E3E4] overflow-hidden">
              <div 
                className="h-full bg-[#F13A3C] transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Card Area */}
        <div className="relative w-full max-w-3xl min-h-[400px]">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white border border-[#E1E3E4] rounded-[4px] absolute inset-0 w-full h-max"
              >
                <div className="p-8">
                  <h2 className="text-[22px] font-semibold text-[#333333] mb-8 leading-snug font-['Montserrat']">
                    {formatText(currentQuestion.question)}
                  </h2>

                  <div className="space-y-4">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === currentQuestion.correctAnswer;
                      const showCorrect = hasAnswered && isCorrect;
                      const showWrong = hasAnswered && isSelected && !isCorrect;

                      let buttonStateClass = "bg-white border-[#E1E3E4] hover:border-[#F13A3C] hover:bg-[#FFF5F5] text-[#333333]";
                      
                      if (hasAnswered) {
                        if (showCorrect) {
                          buttonStateClass = "bg-white border-[#F13A3C] text-[#333333]";
                        } else if (showWrong) {
                          buttonStateClass = "bg-white border-[#E1E3E4] text-[#656464]";
                        } else {
                          buttonStateClass = "bg-white border-[#E1E3E4] text-[#333333] opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={hasAnswered}
                          className={`w-full text-left p-4 rounded-[4px] border transition-colors duration-200 flex items-center justify-between group ${buttonStateClass}`}
                        >
                          <span className="font-normal text-base font-['Noto_Sans']">{formatText(option)}</span>
                          {hasAnswered && (
                            <span className="ml-4 flex-shrink-0">
                              {showCorrect && <CheckCircle2 className="w-5 h-5 text-[#F13A3C]" />}
                              {showWrong && <XCircle className="w-5 h-5 text-[#F13A3C]" />}
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
                        animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`p-6 bg-[#F8F9FA] border-l ${selectedAnswer === currentQuestion.correctAnswer ? 'border-[#F13A3C]' : 'border-[#E1E3E4]'}`}>
                          <p className="text-sm font-bold mb-2 text-[#333333] font-['Montserrat'] uppercase tracking-wide">
                            {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Not quite."}
                          </p>
                          <p className="text-base text-[#333333] leading-relaxed font-['Noto_Sans']">
                            {formatText(currentQuestion.explanation)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
                
                {/* Footer Action */}
                <div className="bg-[#F8F9FA] p-8 border-t border-[#E1E3E4] flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    disabled={!hasAnswered}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[4px] font-semibold transition-colors duration-200 font-['Montserrat'] ${
                      hasAnswered 
                        ? 'bg-[#F13A3C] text-white hover:bg-[#c9181a]' 
                        : 'bg-[#E1E3E4] text-[#656464] cursor-not-allowed'
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#E1E3E4] rounded-[4px] p-12 text-center relative z-10 w-full max-w-3xl"
              >
                <div className="w-20 h-20 bg-[#FFF5F5] rounded-[4px] flex items-center justify-center mx-auto mb-8 border border-[#F13A3C]/20">
                  <Trophy className="w-10 h-10 text-[#F13A3C]" />
                </div>
                
                <h2 className="text-[32px] font-bold text-[#333333] mb-4 font-['Montserrat']">Quiz Complete</h2>
                <p className="text-[#656464] mb-12 text-lg font-['Noto_Sans']">
                  {score === QUESTIONS.length ? "Perfect score! You're an SQL Master." 
                    : score >= QUESTIONS.length * 0.8 ? "Great job! You know your queries." 
                    : "Good effort! Keep practicing your SQL."}
                </p>

                <div className="flex justify-center items-center gap-12 mb-12 p-8 bg-[#F8F9FA] rounded-[4px] border border-[#E1E3E4]">
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#656464] uppercase tracking-wider mb-2 font-['Montserrat']">Final Score</p>
                    <p className="text-5xl font-bold text-[#333333] font-['Montserrat']">{score}<span className="text-2xl font-semibold text-[#E1E3E4]">/{QUESTIONS.length}</span></p>
                  </div>
                  <div className="w-px h-16 bg-[#E1E3E4]"></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#656464] uppercase tracking-wider mb-2 font-['Montserrat']">Accuracy</p>
                    <p className="text-5xl font-bold text-[#F13A3C] font-['Montserrat']">{Math.round((score / QUESTIONS.length) * 100)}%</p>
                  </div>
                </div>

                <button
                  onClick={restartQuiz}
                  className="inline-flex items-center gap-2 bg-[#F13A3C] text-white px-8 py-4 rounded-[4px] font-semibold hover:bg-[#c9181a] transition-colors font-['Montserrat']"
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
