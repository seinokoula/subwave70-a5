import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen({ isLoading, progress = 0 }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFadeOut(true);

      const timer = setTimeout(() => {
        setFadeOut(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);


  if (isLoading || fadeOut) {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0058] transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        onTransitionEnd={() => {
          if (fadeOut) setFadeOut(false);
        }}
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent 0%, #0c0058 100%), 
                            linear-gradient(to right, #ff00ff 1px, transparent 1px), 
                            linear-gradient(to bottom, #ff00ff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center',
          perspective: '1000px',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="relative w-64 h-64 mb-8">
          <Image
            width={500}
            height={500}
            src="/assets/loader.gif"
            alt="Loading"
            className="w-full h-full rounded-full border-4 border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.7)]"
          />
        </div>

        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff] mb-6 tracking-wider">
          SubWave 70
        </h1>

        <div className="w-64 h-4 overflow-hidden bg-black/60 rounded-full border border-[#ff00ff]">
          <div
            className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00ffff]"
            style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(255, 0, 255, 0.7)' }}
          ></div>
        </div>

        <p className="mt-4 text-[#00ffff] font-mono">
          {Math.round(progress)}% Chargé
        </p>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-[#ff00ff] animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                boxShadow: '0 0 10px rgba(255, 0, 255, 0.7)'
              }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
