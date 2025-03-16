import { JSX, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import RuleModal from "./RuleModal";
import { useExpression } from "../hooks/useExpression";

export default function FreeModeCard(): JSX.Element {
  const [expression, result, error, warning, handleInputChange] = useExpression();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <p className={`text-3xl font-bold text-center ${!expression || error ? "text-gray-300" : "text-gray-800"} mb-6 h-12`}>
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
            {"Four fours"}
          </p>
        }
      </div>

      <p className="mt-4 text-center text-gray-500">
        See <span 
          onClick={() => setIsModalOpen(true)} 
          className="text-gray-700 underline cursor-pointer hover:text-gray-900"
        >
          game rules
        </span>.
      </p>

      <RuleModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </>
  )
}