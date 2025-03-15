import { useState } from 'react';
import { evaluateExpression } from './core/calculations';
import { truncate } from './core/utils';
import { FaExclamationTriangle } from 'react-icons/fa';
import { MdCheckCircle } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';

function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>('Input something above');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (value: string) => {
    const replacedValue = value.replace(/[^0-9\+\-\*\/\(\)\!\^SsRr\s]/g, '').toLocaleUpperCase();
    setExpression(replacedValue);

    if (replacedValue !== '') {
      try {
        const evaluationResult = evaluateExpression(replacedValue);
        if (evaluationResult.includes('.')) {
          setResult(truncate(evaluationResult, 16));
          setError('Result is not an integer');
        } else if (evaluationResult.length > 16) {
          setResult(truncate(evaluationResult, 16));
          setError('Result is too long');
        } else {
          setResult(evaluationResult);
          setError(null);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Something went wrong');
        }
      }
    } else {
      setResult(null);
      setError(null);
    }

    if (replacedValue.length === 0) {
      setWarning('Input something above');
    } else if (replacedValue.match(/[012356789]/)) {
      setWarning('Using a number other than 4');
    } else if (replacedValue.match(/4/g)?.length !== 4) {
      setWarning('Exactly four 4s are required');
    } else {
      setWarning(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Four Fours</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
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
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-hidden" 
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg max-w-sm w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Rules</h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-600 hover:text-gray-900"
                >
                  <AiOutlineClose size={20} />
                </button>
              </div>
            </div>

            <div className='px-6 pb-8'>
              <ul className="list-disc pl-5 mb-4 text-gray-800">
                <li>You must use exactly four 4s</li>
                <li>You cannot use any numbers other than 4.</li>
                <li>The following operations are allowed.</li>
              </ul>
              <h2 className="text-xl font-bold">Addition</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">44 + 4 = 48</pre>
              <h2 className="text-xl font-bold mt-4">Subtraction</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">4 - 4 = 0</pre>
              <h2 className="text-xl font-bold mt-4">Multiplication</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">4 * 4 = 16</pre>
              <h2 className="text-xl font-bold mt-4">Division</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">4 / 4 = 1</pre>
              <h2 className="text-xl font-bold mt-4">Exponentiation</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">4 ^ 4 = 256</pre>
              <h2 className="text-xl font-bold mt-4">Square Root</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">R4 = 2</pre>
              <h2 className="text-xl font-bold mt-4">Sum</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">S4 = 10</pre>
              <h2 className="text-xl font-bold mt-4">Factorial</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">4! = 24</pre>
            </div>
            
            
          </div>
        </div>
      )}

      <p className="mt-8 text-gray-500 text-center">
        This website was developed by <a href="https://twitter.com/kawaiiseeker" target="_blank" rel="noopener noreferrer">@kawaiiseeker</a>.
      </p>
    </div>
  );
}

export default App;
