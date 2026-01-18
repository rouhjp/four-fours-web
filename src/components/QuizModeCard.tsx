import { JSX, useState, useEffect, useCallback } from "react";
import { random } from "../core/utils";
import { FaExclamationTriangle } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import { useFourFours } from "../hooks/useFourFours";
import { GrUpdate } from "react-icons/gr";
import { getAnswer } from "../core/answers";
import { useKaTeX } from "../hooks/useKaTeX";
import { useEnterToFocus } from "../hooks/useEnterToFocus";

export default function QuizModeCard(): JSX.Element {
  const [question, setQuestion] = useState<number>(random(1, 3000));
  const [input, result, error, warning, handleInputChange] = useFourFours(question);
  const solved = !error && !warning && result === question.toString();
  const [katexHtml, katexRef] = useKaTeX(input);
  const handleClear = useCallback(() => handleInputChange(''), [handleInputChange]);
  const inputRef = useEnterToFocus<HTMLInputElement>(handleClear);

  const newQuestion = useCallback(() => {
    setQuestion(random(1, 3000));
    handleInputChange('');
  }, [handleInputChange]);

  const handleAnswerButtonClick = useCallback(() => {
    handleInputChange(getAnswer(question));
  }, [question, handleInputChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        newQuestion();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleAnswerButtonClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newQuestion, handleAnswerButtonClick]);

  return (
    <>
      <div className="absolute top-2 left-4 text-gray-300">Quiz Mode</div>
      <div className="absolute top-3 right-4">
        <button
          className="text-gray-600 text-lg font-semibold transition-all hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-0 active:ring-0 p-2 rounded-md"
          onClick={newQuestion}
          >
          <GrUpdate />
        </button>
      </div>
      <h1 className="text-2xl font-bold text-center mb-2">{`${question} = ?`}</h1>
      <div className="text-center mb-4 text-xl text-gray-700 h-16 flex items-center justify-center bg-gray-100 overflow-hidden">
        {katexHtml && (
          <div
            ref={katexRef}
            className="katex-container"
            dangerouslySetInnerHTML={{ __html: katexHtml }}
          />
        )}
      </div>
      <p className={`text-3xl font-bold text-center ${solved? "text-green-600" :  (!input || error ? "text-gray-300" : "text-yellow-600")} mb-6 h-12`}>
        {result !== null ? result : '?'}
      </p>

      <div className="relative">
        <div 
            className="absolute top-0 right-2 text-gray-300 hover:text-red-600 cursor-pointer"
            onClick={handleAnswerButtonClick}
          >
          See answer
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter expression"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className='h-8'>
        {error &&
          <p className="text-red-600 text-sm flex items-center justify-center h-8">
            <FaExclamationTriangle className="w-5 h-5 mr-2 text-red-600" />
            {error}
          </p>
        }
        {!error && warning &&
          <p className="text-yellow-600 text-sm flex items-center justify-center h-8">
            <FaExclamationTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            {warning}
          </p>
        }
        {input && !error && !warning &&
          <p className="text-green-600 text-sm flex items-center justify-center h-8">
            <MdCheckCircle className="w-5 h-5 mr-2 text-green-600" />
            {"Solved!"}
          </p>
        }
      </div>
    </>
  )
}