import { JSX, useState } from "react";
import { random } from "../core/utils";
import { FaExclamationTriangle } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { useExpression } from "../hooks/useExpression";

export default function QuizModeCard(): JSX.Element {
  const [question, setQuestion] = useState<number>(random(1, 3000));
  const [expression, result, error, warning, handleInputChange] = useExpression(question);
  const solved = !error && !warning && result === question.toString();

  const newQuestion = () => {
    setQuestion(random(1, 3000));
    handleInputChange('');
  }

  return (
    <>
      <div className="absolute top-2 left-4 text-gray-300">Quiz Mode</div>
      <div className="absolute top-3 right-4">
        <button
          className="text-gray-600 text-lg font-semibold transition-all hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-0 active:ring-0 p-2 rounded-md"
          onClick={newQuestion}
          >
          <TbPlayerTrackNextFilled />
        </button>
      </div>
      <h1 className="text-2xl font-bold text-center mb-2">{`${question} = ?`}</h1>
      <p className={`text-3xl font-bold text-center ${solved? "text-green-600" :  (!expression || error ? "text-gray-300" : "text-yellow-600")} mb-6 h-12`}>
        {result !== null ? result : '?'}
      </p>

      <input
        type="text"
        value={expression}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Enter expression"
        className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

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
        {expression && !error && !warning &&
          <p className="text-green-600 text-sm flex items-center justify-center h-8">
            <MdCheckCircle className="w-5 h-5 mr-2 text-green-600" />
            {"Solved!"}
          </p>
        }
      </div>
    </>
  )
}