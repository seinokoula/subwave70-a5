"use client";

import { useRef, useEffect, useState } from 'react';
import useThree from '@/hooks/useThree';
import useResourceLoader from '@/hooks/useResourceLoader';
import GameUI from '@/components/ui/GameUi';
import InsuranceInfo from '@/components/ui/InsuranceInfo';
import LoadingScreen from '@/components/ui/LoadingSreen';

export default function Home() {
  const containerRef = useRef(null);
  const { isLoading, progress, resources } = useResourceLoader();
  const [gameInitialized, setGameInitialized] = useState(false);
  const { score, gameOver, resetGame, moveCarLeft, moveCarRight } = useThree(containerRef, resources, !isLoading);

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

        if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q') {
          moveCarLeft();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          moveCarRight();
        }
      }
    };

    const handleTouch = (e) => {
      if (!containerRef.current || e.target.tagName === 'BUTTON') return;

      const touch = e.touches[0] || e.changedTouches[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const touchX = touch.clientX;
      const screenCenterX = containerRect.left + containerRect.width / 2;

      if (touchX < screenCenterX) {
        moveCarLeft();
      } else {
        moveCarRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (containerRef.current) {
      containerRef.current.addEventListener('touchstart', handleTouch);
    }

    const currentContainer = containerRef.current;

    return () => {
      document.removeEventListener('touchmove', preventDefault);
      window.removeEventListener('keydown', handleKeyDown);
      if (currentContainer) {
        currentContainer.removeEventListener('touchstart', handleTouch);
      }
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
          onMoveLeft={moveCarLeft}
          onMoveRight={moveCarRight}
        />

        <InsuranceInfo />
      </main>
    </div>
  );
}
