import { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import FreeModeCard from './components/FreeModeCard';
import QuizModeCard from './components/QuizModeCard';
import StairModeCard from './components/StairModeCard';

const MODES = ["Free", "Quiz", "Stair"] as const;

function App() {
  const [mode, setMode] = useState<typeof MODES[number]>("Free");
  const modeIndex = MODES.indexOf(mode);

  const goToPrevMode = useCallback(() => {
    if (modeIndex > 0) {
      setMode(MODES[modeIndex - 1]);
    }
  }, [modeIndex]);

  const goToNextMode = useCallback(() => {
    if (modeIndex < MODES.length - 1) {
      setMode(MODES[modeIndex + 1]);
    }
  }, [modeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevMode();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevMode, goToNextMode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Four Fours</h1>
      <div className="flex items-center justify-center mb-8 w-full">
        <div className="w-8">
          {modeIndex>0 && (
            <FaChevronLeft
              className=" text-gray-500 w-8 h-6 cursor-pointer"
              onClick={goToPrevMode}
            />
          )}
        </div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <div className={mode === "Free" ? "" : "hidden"}>
            <FreeModeCard />
          </div>
          <div className={mode === "Quiz" ? "" : "hidden"}>
            <QuizModeCard />
          </div>
          <div className={mode === "Stair" ? "" : "hidden"}>
            <StairModeCard />
          </div>
        </div>
        <div className="w-8">
          {modeIndex<MODES.length - 1 && (
            <FaChevronRight
              className="text-gray-500 w-8 h-6 cursor-pointer"
              onClick={goToNextMode}
            />
          )}
        </div>
      </div>

      <div className='mt-8 text-gray-500 text-center'>
        <p>This website was developed by <a className="underline" href="https://twitter.com/kawaiiseeker" target="_blank" rel="noopener noreferrer">@kawaiiseeker</a>.</p>
        <p>The source code is available on <a className="underline" href='https://github.com/rouhjp/four-fours-web' target='_blank'>GitHub</a>.</p>
      </div>
    </div>
  );
}

export default App;
