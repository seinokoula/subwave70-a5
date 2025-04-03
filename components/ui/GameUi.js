import { useState, useEffect } from 'react';

export default function GameUI({ score, gameOver, onReset, onMoveLeft, onMoveRight }) {
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute top-0 left-0 z-10 w-full h-full pointer-events-none">
      <div className="absolute p-3 top-5 right-5 bg-black/70 border-2 border-[#ff00ff] rounded shadow-[0_0_10px_rgba(255,0,255,0.7)] backdrop-blur-sm">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">
          Score: {score}
        </h2>
      </div>
      {showInstructions && !gameOver && (
        <div className="absolute max-w-md p-4 text-center bottom-5 left-1/2 transform -translate-x-1/2 bg-black/70 border-2 border-[#00ffff] rounded shadow-[0_0_10px_rgba(0,255,255,0.7)] backdrop-blur-sm">
          <h3 className="mb-2 text-xl font-bold text-[#ff00ff]">Instructions</h3>
          <p className="mb-1 text-[#00ffff]">Utilisez les flèches ← → ou les touches Q/D pour éviter les obstacles</p>
          <p className="mb-1 text-[#00ffff]">Sur mobile, touchez la gauche ou la droite de l&apos;écran</p>
          <p className="text-[#00ffff]">Ou utilisez les boutons à l&apos;écran ci-dessous</p>
        </div>
      )}
      <div className="absolute left-0 right-0 flex justify-between px-10 pointer-events-auto bottom-20">
        <button
          className="flex items-center justify-center w-20 h-20 text-3xl text-[#00ffff] rounded-full bg-black/70 border-2 border-[#ff00ff] hover:bg-black/90 transition-all shadow-[0_0_15px_rgba(255,0,255,0.5)] hover:shadow-[0_0_20px_rgba(255,0,255,0.8)]"
          onClick={onMoveLeft}
        >
          ←
        </button>
        <button
          className="flex items-center justify-center w-20 h-20 text-3xl text-[#00ffff] rounded-full bg-black/70 border-2 border-[#ff00ff] hover:bg-black/90 transition-all shadow-[0_0_15px_rgba(255,0,255,0.5)] hover:shadow-[0_0_20px_rgba(255,0,255,0.8)]"
          onClick={onMoveRight}
        >
          →
        </button>
      </div>
      {gameOver && (
        <div className="absolute max-w-md p-6 text-center pointer-events-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 border-2 border-[#ff00ff] rounded shadow-[0_0_20px_rgba(255,0,255,0.7)] backdrop-blur-sm">
          <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">Game Over!</h2>
          <p className="mb-4 text-xl text-[#00ffff]">Votre score: {score}</p>
          <button
            onClick={onReset}
            className="px-6 py-3 mb-4 text-lg font-bold text-black bg-gradient-to-r from-[#ff00ff] to-[#00ffff] rounded hover:from-[#ff33ff] hover:to-[#33ffff] transition-all shadow-[0_0_10px_rgba(0,255,255,0.7)] hover:shadow-[0_0_15px_rgba(0,255,255,0.9)]"
          >
            Rejouer
          </button>
          <p className="text-sm italic text-[#ff00ff]">
            Dans la vraie vie, notre assurance vous protège des imprévus.
            Vous n&apos;avez pas besoin de tout éviter vous-même!
          </p>
        </div>
      )}
    </div>
  );
}
