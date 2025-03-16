import { JSX } from "react";
import { AiOutlineClose } from "react-icons/ai";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

export default function RuleModal({
  isModalOpen,
  setIsModalOpen,
}: Props): JSX.Element {
  return (
    <>
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
              <h2 className="text-xl font-bold mt-4">Decimal</h2>
              <pre className="bg-gray-100 p-4 rounded-md mt-2">4.4 + .4 = 4.8</pre>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
