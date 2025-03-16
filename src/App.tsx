import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import FreeModeCard from './components/FreeModeCard';
import SolveModeCard from './components/SolveModeCard';

function App() {
  const [mode, setMode] = useState<"Free" | "Solve">("Free");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Four Fours</h1>
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        {mode === "Free" && (
          <>
            <FreeModeCard />
            <FaChevronRight
              className="absolute top-1/2 right-[-30px] transform -translate-y-1/2 text-gray-500 w-6 h-6 cursor-pointer"
              onClick={() => setMode("Solve")}
            />
          </>
        )}
        {mode === "Solve" && (
          <>
            <SolveModeCard />
            <FaChevronLeft
              className="absolute top-1/2 left-[-30px] transform -translate-y-1/2 text-gray-500 w-6 h-6 cursor-pointer"
              onClick={() => setMode("Free")}
            />
          </>
        )}
      </div>

      <p className="mt-8 text-gray-500 text-center">
        This website was developed by <a href="https://twitter.com/kawaiiseeker" target="_blank" rel="noopener noreferrer">@kawaiiseeker</a>.
      </p>
    </div>
  );
}

export default App;
