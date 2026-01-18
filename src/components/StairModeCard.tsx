import { JSX, useState, useRef, useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import { useFourFours } from "../hooks/useFourFours";
import { RiArrowLeftDoubleFill, RiArrowLeftSLine, RiArrowRightDoubleFill, RiArrowRightSLine } from "react-icons/ri";
import { getAnswer } from "../core/answers";
import { useKaTeX } from "../hooks/useKaTeX";

const QUESTION_MIN = 1;
const QUESTION_MAX = 3000;

export default function StairModeCard(): JSX.Element {
  const [question, setQuestion] = useState<number>(1);
  const [answers, setAnswers] = useState<string[]>(() => Array.from({ length: 100 }, () => "")); 
  const [input, result, error, warning, handleInputChange] = useFourFours(question, (input) => {
    setAnswers((answers) => {
      const newAnswers = [...answers];
      newAnswers[question] = input;
      return newAnswers;
    })
  });
  const solved = !error && !warning && result === question.toString();
  const [katexHtml, katexRef] = useKaTeX(input);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef<boolean>(false);

  useEffect(() => {
    const savedAnswer = answers[question] || "";
    handleInputChange(savedAnswer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const handleMouseDown = (update: () => void) => {
    isLongPress.current = false;

    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      intervalRef.current = setInterval(update, 100);
    }, 500);
  };

  const handleMouseUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMoveButtonClick = (update: () => void) => {
    if (!isLongPress.current) {
      update();
    }
  };

  const handleAnswerButtonClick = () => {
    handleInputChange(getAnswer(question));
  };

  return (
    <>
      <div className="absolute top-2 left-4 text-gray-300">Stair Mode</div>
      <div className="absolute top-5 left-4">
        <button
          className="text-gray-600 text-2xl font-semibold transition-all hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-0 active:ring-0 p-2 rounded-md"
          onMouseDown={() => handleMouseDown(() => setQuestion(q => Math.max(q - 30, QUESTION_MIN)))}
          onMouseUp={() => handleMouseUp()}
          onMouseLeave={() => {
            if (isLongPress.current) handleMouseUp();
          }}
          onClick={() => handleMoveButtonClick(() => setQuestion(q => Math.max(q - 30, QUESTION_MIN)))}
          disabled={question === QUESTION_MIN}
        >
          <RiArrowLeftDoubleFill />
        </button>
        <button
          className="text-gray-600 text-2xl font-semibold transition-all hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-0 active:ring-0 p-2 rounded-md"
          onMouseDown={() => handleMouseDown(() => setQuestion(q => Math.max(q - 1, QUESTION_MIN)))}
          onMouseUp={() => handleMouseUp()}
          onMouseLeave={() => {
            if (isLongPress.current) handleMouseUp();
          }}
          onClick={() => handleMoveButtonClick(() => setQuestion(q => Math.max(q - 1, QUESTION_MIN)))}
          disabled={question === QUESTION_MIN}
        >
          <RiArrowLeftSLine />
        </button>
      </div>
      <div className="absolute top-5 right-4">
        <button
          className="text-gray-600 text-2xl font-semibold transition-all hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-0 active:ring-0 p-2 rounded-md"
          onMouseDown={() => handleMouseDown(() => setQuestion(q => Math.min(q + 1, QUESTION_MAX)))}
          onMouseUp={() => handleMouseUp()}
          onMouseLeave={() => {
            if (isLongPress.current) handleMouseUp();
          }}
          onClick={() => handleMoveButtonClick(() => setQuestion(q => Math.min(q + 1, QUESTION_MAX)))}
          disabled={question === QUESTION_MAX}
        >
          <RiArrowRightSLine />
        </button>
        <button
          className="text-gray-600 text-2xl font-semibold transition-all hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-0 active:ring-0 p-2 rounded-md"
          onMouseDown={() => handleMouseDown(() => setQuestion(q => Math.min(q + 30, QUESTION_MAX)))}
          onMouseUp={() => handleMouseUp()}
          onMouseLeave={() => {
            if (isLongPress.current) handleMouseUp();
          }}
          onClick={() => handleMoveButtonClick(() => setQuestion(q => Math.min(q + 30, QUESTION_MAX)))}
          disabled={question === QUESTION_MAX}
        >
          <RiArrowRightDoubleFill />
        </button>
      </div>
      <h1 className="text-2xl font-bold text-center mb-2">{question}</h1>
      <div className="text-center mb-4 text-xl text-gray-700 h-16 flex items-center justify-center bg-gray-100 overflow-hidden">
        {katexHtml && (
          <div
            ref={katexRef}
            className="katex-container"
            dangerouslySetInnerHTML={{ __html: katexHtml }}
          />
        )}
      </div>
      <p className={`text-3xl font-bold text-center ${solved ? "text-green-600" : (!input || error ? "text-gray-300" : "text-yellow-600")} mb-6 h-12`}>
        {result !== null ? result : "?"}
      </p>

      <div className="relative">
        <div 
          className="absolute top-0 right-2 text-gray-300 hover:text-red-600 cursor-pointer"
          onClick={handleAnswerButtonClick}
        >
          see answer
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter expression"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="h-8">
        {error && (
          <p className="text-red-600 text-sm flex items-center justify-center h-8">
            <FaExclamationTriangle className="w-5 h-5 mr-2 text-red-600" />
            {error}
          </p>
        )}
        {!error && warning && (
          <p className="text-yellow-600 text-sm flex items-center justify-center h-8">
            <FaExclamationTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            {warning}
          </p>
        )}
        {input && !error && !warning && (
          <p className="text-green-600 text-sm flex items-center justify-center h-8">
            <MdCheckCircle className="w-5 h-5 mr-2 text-green-600" />
            {"Solved!"}
          </p>
        )}
      </div>
    </>
  );
}
