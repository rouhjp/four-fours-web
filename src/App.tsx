import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Vite + React</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <button
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p className="mt-4 text-center text-gray-600">
            Edit <code className="font-semibold text-gray-800">src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="mt-8 text-gray-500 text-center">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </>
  );
}

export default App;
