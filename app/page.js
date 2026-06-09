"use client";

import { useRef, useEffect } from 'react';
import useThree from '@/hooks/useThree';
import useKeyboardControls from '@/hooks/useKeyboardControls';
import useResourceLoader from '@/hooks/useResourceLoader';
import GameUI from '@/components/ui/GameUi';
import InsuranceInfo from '@/components/ui/InsuranceInfo';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function Home() {
  const containerRef = useRef(null);
  const { isLoading, progress, resources } = useResourceLoader();
  const { score, gameOver, resetGame, moveCarLeft, moveCarRight } = useThree(containerRef, resources, !isLoading);

  useKeyboardControls();

  useEffect(() => {
    const container = containerRef.current;
    const preventDefault = (e) => {
      e.preventDefault();
    };

    // Only block touch scrolling over the game canvas; the page below it must stay scrollable.
    container?.addEventListener('touchmove', preventDefault, { passive: false });

    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'q', 'Q', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
      }
    };

    // "Left" input drives moveCarRight (and vice versa) on purpose: the camera
    // faces down +Z, so the scene's X axis is mirrored relative to the player.
    const handleGameControl = (e) => {
      if (!e.detail.pressed) return;

      const action = e.detail.action.toLowerCase();
      if (action === 'arrowleft' || action === 'q') {
        moveCarRight();
      } else if (action === 'arrowright' || action === 'd') {
        moveCarLeft();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('game-control', handleGameControl);

    return () => {
      container?.removeEventListener('touchmove', preventDefault);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('game-control', handleGameControl);
    };
  }, [moveCarLeft, moveCarRight]);

  return (
    <div className="flex flex-col w-full h-screen">
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
