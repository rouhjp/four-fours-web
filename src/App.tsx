import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import FreeModeCard from './components/FreeModeCard';
import QuizModeCard from './components/QuizModeCard';

function App() {
  const [mode, setMode] = useState<"Free" | "Solve">("Free");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Four Fours</h1>
      <div className="flex items-center justify-center mb-8 w-full">
        <div className="w-8">
          {mode==="Solve" && (
            <FaChevronLeft
              className=" text-gray-500 w-6 h-6 cursor-pointer"
              onClick={() => setMode("Free")}
            />
          )}
        </div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <div className={mode === "Free" ? "" : "hidden"}>
            <FreeModeCard />
          </div>
          <div className={mode === "Solve" ? "" : "hidden"}>
            <QuizModeCard />
          </div>
        </div>
        <div className="w-8">
          {mode==="Free" && (
            <FaChevronRight
              className="text-gray-500 w-6 h-6 cursor-pointer"
              onClick={() => setMode("Solve")}
            />
          )}
        </div>
      </div>

      <p className="mt-8 text-gray-500 text-center">
        This website was developed by <a href="https://twitter.com/kawaiiseeker" target="_blank" rel="noopener noreferrer">@kawaiiseeker</a>.
      </p>
    </div>
  );
}

export default App;
