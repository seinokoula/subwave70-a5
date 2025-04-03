import { useEffect, useState } from 'react';

export default function useKeyboardControls() {
  const [keys, setKeys] = useState({
    ArrowLeft: false,
    ArrowRight: false,
    q: false,
    d: false,
    Q: false,
    D: false,
  });

  useEffect(() => {
    const handleKeyDown = (event) => {

      if (event.key in keys) {
        setKeys(prevKeys => ({
          ...prevKeys,
          [event.key]: true
        }));

        const customEvent = new CustomEvent('game-control', {
          detail: { action: event.key, pressed: true }
        });
        window.dispatchEvent(customEvent);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key in keys) {
        setKeys(prevKeys => ({
          ...prevKeys,
          [event.key]: false
        }));

        const customEvent = new CustomEvent('game-control', {
          detail: { action: event.key, pressed: false }
        });
        window.dispatchEvent(customEvent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);

  return keys;
}
