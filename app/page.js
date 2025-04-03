"use client";

import { useRef, useEffect, useState } from 'react';
import useThree from '@/hooks/useThree';
import useKeyboardControls from '@/hooks/useKeyboardControls';
import useResourceLoader from '@/hooks/useResourceLoader';
import GameUI from '@/components/ui/GameUi';
import InsuranceInfo from '@/components/ui/InsuranceInfo';
import LoadingScreen from '@/components/ui/LoadingSreen';

export default function Home() {
  const containerRef = useRef(null);
  const { isLoading, progress, resources } = useResourceLoader();
  const [gameInitialized, setGameInitialized] = useState(false);
  const { score, gameOver, resetGame, moveCarLeft, moveCarRight } = useThree(containerRef, resources, !isLoading);

  const keys = useKeyboardControls();

  useEffect(() => {
    if (!isLoading && !gameInitialized) {
      setGameInitialized(true);
    }
  }, [isLoading, gameInitialized]);

  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });

    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'q', 'Q', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleGameControl = (e) => {
      if (e.detail.pressed) {
        if (e.detail.action === 'ArrowLeft' || e.detail.action === 'q' || e.detail.action === 'Q') {
          console.log('Moving car left from event');
          moveCarRight();
        } else if (e.detail.action === 'ArrowRight' || e.detail.action === 'd' || e.detail.action === 'D') {
          console.log('Moving car right from event');
          moveCarLeft();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('game-control', handleGameControl);

    return () => {
      document.removeEventListener('touchmove', preventDefault);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('game-control', handleGameControl);
    };
  }, [moveCarLeft, moveCarRight]);

  return (
    <div className="flex flex-col w-full h-screen">
      { }
      <LoadingScreen isLoading={isLoading} progress={progress} />

      <main className={`flex-1 flex flex-col transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative w-full h-screen overflow-hidden" ref={containerRef} id="game-container">
        </div>

        <GameUI
          score={score}
          gameOver={gameOver}
          onReset={resetGame}
          onMoveLeft={moveCarRight}
          onMoveRight={moveCarLeft}
        />

        <InsuranceInfo />
      </main>
    </div>
  );
}
